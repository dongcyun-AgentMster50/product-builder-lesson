import { clearSessionCookie, getConfig, json, methodNotAllowed, readSession } from "./access/_shared.js";

const CACHE_TTL_SECONDS = 60 * 15;
const TIMEOUT_MS = 12000;

export async function onRequestGet(context) {
    let config;
    try {
        config = getConfig(context.env);
    } catch {
        return json({
            ok: false,
            error: {
                code: "SERVER_MISCONFIGURED",
                message: "Access verification is not configured."
            }
        }, 500);
    }

    const session = await readSession(context.request, config);
    if (!session.authenticated) {
        return json({
            ok: false,
            error: {
                code: "UNAUTHORIZED",
                message: "Authentication required."
            }
        }, 401, {
            "Set-Cookie": clearSessionCookie()
        });
    }

    const url = new URL(context.request.url);
    const country = normalizeCountry(url.searchParams.get("country"));
    const city = String(url.searchParams.get("city") || "").trim();
    const cityLocal = String(url.searchParams.get("city_local") || "").trim() || city;
    const locale = normalizeLocale(url.searchParams.get("locale"));
    const role = normalizeRole(url.searchParams.get("role"));
    const forceRefresh = url.searchParams.get("force") === "1";

    if (!country) {
        return json({
            ok: false,
            error: {
                code: "INVALID_COUNTRY",
                message: "A valid country code is required."
            }
        }, 400);
    }

    const cacheKey = new Request(`https://cache.local/region-insight?country=${country}&city=${encodeURIComponent(city)}&locale=${locale}&role=${role}`);
    if (!forceRefresh) {
        const cached = await caches.default.match(cacheKey);
        if (cached) {
            const cachedPayload = await cached.json();
            return json({
                ok: true,
                data: {
                    ...cachedPayload.data,
                    meta: {
                        ...cachedPayload.data.meta,
                        cache_hit: true,
                        generated_at_utc: new Date().toISOString()
                    }
                }
            }, 200);
        }
    }

    const startedAt = Date.now();
    try {
        const data = await buildLiveRegionInsight({ country, city, cityLocal, locale, role, env: context.env });
        const payload = {
            ok: true,
            data: {
                ...data,
                meta: {
                    query_country: country,
                    query_city: city,
                    query_role: role,
                    latency_ms: Date.now() - startedAt,
                    cache_hit: false,
                    generated_at_utc: new Date().toISOString()
                }
            }
        };

        context.waitUntil(caches.default.put(
            cacheKey,
            new Response(JSON.stringify(payload), {
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}`
                }
            })
        ));

        return json(payload, 200);
    } catch (error) {
        const code = error?.code || "REGION_INSIGHT_UNAVAILABLE";
        const status = code === "REGION_INSIGHT_TIMEOUT" ? 504 : 502;
        return json({
            ok: false,
            error: {
                code,
                message: error?.message || "Failed to resolve live region insight."
            },
            meta: {
                query_country: country,
                query_city: city,
                query_role: role,
                latency_ms: Date.now() - startedAt,
                generated_at_utc: new Date().toISOString()
            }
        }, status);
    }
}

export function onRequest() {
    return methodNotAllowed();
}

function normalizeCountry(value) {
    const normalized = String(value || "").trim().toUpperCase();
    return /^[A-Z]{2}$/.test(normalized) ? normalized : "";
}

function normalizeLocale(value) {
    const normalized = String(value || "").trim().toLowerCase();
    if (normalized.startsWith("ko")) return "ko";
    if (normalized.startsWith("de")) return "de";
    return "en";
}

function normalizeRole(value) {
    const normalized = String(value || "").trim().toLowerCase();
    if (normalized === "retail" || normalized === "dotcom" || normalized === "brand") return normalized;
    return "retail";
}

async function withTimeout(promiseFactory, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await promiseFactory(controller.signal);
    } catch (error) {
        if (error?.name === "AbortError") {
            throw Object.assign(new Error("Live region insight request timed out."), { code: "REGION_INSIGHT_TIMEOUT" });
        }
        throw error;
    } finally {
        clearTimeout(timer);
    }
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw Object.assign(new Error(`Upstream request failed: ${response.status}`), { code: "REGION_INSIGHT_UPSTREAM_ERROR" });
    }
    return response.json();
}

async function buildLiveRegionInsight({ country, city, cityLocal, locale, role, env }) {
    const geocode = await withTimeout((signal) => fetchOpenMeteoGeocode(city || country, country, signal), TIMEOUT_MS);
    const lat = Number(geocode?.latitude || 0);
    const lon = Number(geocode?.longitude || 0);

    const tasks = [
        withTimeout((signal) => fetchWorldBank(country, "NY.GDP.PCAP.CD", signal), TIMEOUT_MS),
        withTimeout((signal) => fetchWorldBank(country, "SP.URB.TOTL.IN.ZS", signal), TIMEOUT_MS),
        withTimeout((signal) => fetchCountryProfile(country, signal), TIMEOUT_MS)
    ];

    if (lat && lon) tasks.push(withTimeout((signal) => fetchOpenMeteo(lat, lon, signal), TIMEOUT_MS));
    if (city) tasks.push(withTimeout((signal) => fetchNominatim(city, country, signal), TIMEOUT_MS));
    if (city) tasks.push(withTimeout((signal) => fetchCityLandmarkImage(city, country, signal), TIMEOUT_MS));

    // Fetch live trends via GPT-4o-mini (non-blocking — won't delay other data)
    const apiKey = String(env?.OPENAI_API_KEY || "").trim();
    let liveStatus = "skipped"; // 진단: no_key / pending / ok / error
    if (!apiKey) {
        liveStatus = "no_key";
    } else if (city) {
        liveStatus = "pending";
        tasks.push(fetchLiveTrends(city, country, locale, role, apiKey));
    }

    const settled = await Promise.allSettled(tasks);
    const values = settled.filter((entry) => entry.status === "fulfilled").map((entry) => entry.value);
    const rejected = settled.filter((entry) => entry.status === "rejected");
    if (!values.length) {
        throw Object.assign(new Error("All live insight sources failed."), { code: "REGION_INSIGHT_ALL_SOURCES_FAILED" });
    }

    const gdp = values.find((value) => value.type === "gdp");
    const urban = values.find((value) => value.type === "urban");
    const climate = values.find((value) => value.type === "climate");
    const place = values.find((value) => value.type === "place");
    const countryProfile = values.find((value) => value.type === "country_profile");
    const landmark = values.find((value) => value.type === "city_landmark");
    const liveTrends = values.find((value) => value.type === "live_trends");

    if (liveStatus === "pending") {
        liveStatus = (liveTrends?.trends?.length || liveTrends?.pains?.length) ? "ok" : "empty";
    }

    return {
        role,
        role_lens: buildRoleLens(locale, role, country, cityLocal || city),
        macro: buildMacro(locale, country, city, gdp, urban, climate),
        local: city ? buildLocal(locale, city, place, urban, climate) : null,
        evidence: buildEvidence(locale, gdp, urban, climate, place),
        visual: buildVisualInsight({ country, city, geocode, countryProfile, landmark }),
        live_trends: liveTrends?.trends || [],
        live_events: liveTrends?.events || [],
        live_pains: liveTrends?.pains || [],
        live_solutions: liveTrends?.solutions || [],
        _live_status: liveStatus
    };
}

async function fetchLiveTrends(city, country, locale, role, apiKey) {
    const isKo = locale === "ko";
    const lang = isKo ? "Korean" : "English";
    const todayIso = new Date().toISOString().slice(0, 10);

    const systemPrompt = `You are a hyper-local Samsung SmartThings marketing analyst. Return ONLY valid JSON. All trends must be city-specific (not generic national). Write in ${lang}.`;

    const userPrompt = `${city} (${country}), ${todayIso}, ${role} marketer.

BAD trend: "스마트 홈 기기 수요 증가" (generic). GOOD: "인천 송도 스마트시티 2단계 — 신규 아파트 85% 홈IoT 사전설치 의무화"

Return JSON:
{"trends":[{"text":"${city}-specific headline with district/policy","evidence":"2-3 sentences, concrete numbers (%, ₩, population, YoY)","source_title":"report title","source_org":"org","source_date":"YYYY-MM-DD","source_url":"https://org-domain/path"}],"events":[{"name":"event","when":"YYYY-MM-DD","hook":"Samsung angle"}],"pains":[{"text":"realistic ${role} pain quote mentioning ${city} context","insight":"WHY this hurts — link to a trend + local data"}],"solutions":[{"text":"concrete tactic with Samsung product name + ${city} location","insight":"HOW to execute + expected impact metric"}]}

Rules:
- trends: 4 objects. ${city} districts/policies/stats required. evidence=most important field.
- events: 2-3 within 3 months of ${todayIso}. Skip if unsure.
- pains: 3 objects. Each tied to a trend. Quote style, specific to ${city}.
- solutions: 3 objects. Name Samsung products (SmartThings Energy, AI Hub, Jet Bot etc.) + local retail/channel.
- Korean city names only (강남구, 송도) — never English transliterations.`;

    const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
    ];

    // 단일 시도 — 프롬프트가 길어 GPT 응답에 10-15초 소요
    const ATTEMPT_TIMEOUTS = [18000];

    for (let attempt = 0; attempt < ATTEMPT_TIMEOUTS.length; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUTS[attempt]);

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    max_tokens: 2000,
                    temperature: 0.7,
                    messages
                }),
                signal: controller.signal
            });

            if (!response.ok) {
                console.error(`[fetchLiveTrends] Attempt ${attempt + 1}: OpenAI API returned ${response.status} for ${city}, ${country}`);
                clearTimeout(timer);
                continue;
            }

            const data = await response.json();
            let content = data?.choices?.[0]?.message?.content || "";
            content = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
            // JSON이 잘려있을 수 있으므로 가장 큰 { } 블록 추출
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error(`[fetchLiveTrends] No JSON found in GPT response for ${city}`);
                clearTimeout(timer);
                continue;
            }
            let parsed;
            try {
                parsed = JSON.parse(jsonMatch[0]);
            } catch {
                // 잘린 JSON 복구 시도: 닫히지 않은 괄호 보정
                let fixedJson = jsonMatch[0];
                const openBraces = (fixedJson.match(/\{/g) || []).length;
                const closeBraces = (fixedJson.match(/\}/g) || []).length;
                const openBrackets = (fixedJson.match(/\[/g) || []).length;
                const closeBrackets = (fixedJson.match(/\]/g) || []).length;
                // 마지막 완전한 항목까지 잘라내고 괄호 닫기
                fixedJson = fixedJson.replace(/,\s*(?:"[^"]*":\s*)?(?:\{[^}]*)?$/, "");
                fixedJson += "]".repeat(Math.max(0, openBrackets - closeBrackets));
                fixedJson += "}".repeat(Math.max(0, openBraces - closeBraces));
                try {
                    parsed = JSON.parse(fixedJson);
                    console.log(`[fetchLiveTrends] Recovered truncated JSON for ${city}`);
                } catch {
                    console.error(`[fetchLiveTrends] JSON parse failed even after recovery for ${city}`);
                    clearTimeout(timer);
                    continue;
                }
            }

            // trends: 객체 배열 또는 문자열 배열 모두 지원
            const rawTrends = Array.isArray(parsed?.trends) ? parsed.trends : [];
            const trends = rawTrends.map((item) => {
                if (typeof item === "object" && item !== null) {
                    return {
                        text: String(item.text || "").trim(),
                        evidence: String(item.evidence || "").trim(),
                        source_title: String(item.source_title || "").trim(),
                        source_org: String(item.source_org || "").trim(),
                        source_date: String(item.source_date || "").trim(),
                        source_url: String(item.source_url || "").trim()
                    };
                }
                return { text: String(item || "").trim(), evidence: "", source_title: "", source_org: "", source_date: "", source_url: "" };
            }).filter((t) => t.text).slice(0, 4);

            // pains/solutions: 객체 배열({text, insight}) 또는 문자열 배열 모두 지원
            const normalizePainSolution = (item) => {
                if (typeof item === "object" && item !== null) {
                    const text = String(item.text || "").trim();
                    const insight = String(item.insight || "").trim();
                    return insight ? `${text}\n💡 ${insight}` : text;
                }
                return String(item || "").trim();
            };

            const result = {
                type: "live_trends",
                trends,
                events: Array.isArray(parsed?.events) ? parsed.events.slice(0, 3) : [],
                pains: Array.isArray(parsed?.pains) ? parsed.pains.map(normalizePainSolution).filter(Boolean).slice(0, 3) : [],
                solutions: Array.isArray(parsed?.solutions) ? parsed.solutions.map(normalizePainSolution).filter(Boolean).slice(0, 3) : []
            };

            if (!result.trends.length && !result.pains.length) {
                console.error(`[fetchLiveTrends] Attempt ${attempt + 1}: Empty result for ${city}, ${country}`);
                clearTimeout(timer);
                continue;
            }
            clearTimeout(timer);
            if (attempt > 0) console.log(`[fetchLiveTrends] Succeeded on retry (attempt ${attempt + 1}) for ${city}, ${country}`);
            return result;
        } catch (err) {
            clearTimeout(timer);
            console.error(`[fetchLiveTrends] Attempt ${attempt + 1} failed for ${city}, ${country}:`, err?.message || err);
        }
    }

    console.error(`[fetchLiveTrends] All attempts exhausted for ${city}, ${country}`);
    return { type: "live_trends", trends: [], events: [] };
}

function buildRoleLens(locale, role, country, city) {
    const marketLabel = city ? `${country} ${city}` : country;
    const isKo = locale === "ko";

    if (role === "dotcom") {
        return {
            pain_points: isKo
                ? [
                    `"상세페이지 문구를 어디서부터 써야 하죠?" — ${city || marketLabel} 유입 키워드와 랜딩 카피가 따로 놀아서 이탈률이 높은 상태`,
                    `"AI 기능 켜면 전기세 더 나와요?" — 에너지 절감/비용 체감 질문이 PDP 이탈의 주요 원인`,
                    `"경쟁사 대비 뭐가 나은지 한눈에 안 보여요" — 비교 근거 없이 스펙만 나열하면 첫 스크롤에서 이탈`
                ]
                : [
                    `"Where do I even start with PDP copy?" — search keywords and landing copy are misaligned, causing high bounce`,
                    `"Does the AI feature increase my electricity bill?" — cost/savings proof is the top conversion blocker`,
                    `"I can't see why this beats the competition" — spec-only listings lose visitors at the first scroll`
                ],
            solutions: isKo
                ? [
                    "유입 키워드 Top 3의 '문제 문장'을 H1에 그대로 반영 → 광고와 랜딩 약속 일치시키기",
                    "CTA 바로 위에 '월 ₩12,000 절감' 같은 체감 숫자 1개 배치 → 비용 질문 사전 차단",
                    "경쟁사 대비표를 첫 스크롤 안에 넣되, '일상 변화' 축으로 비교 → 스펙 비교 함정 탈출"
                ]
                : [
                    "Mirror the top 3 search-intent 'problem sentences' directly in H1 — align ad promise with landing",
                    "Place one tangible savings number (e.g. '$10/month saved') right above the CTA — preempt cost objections",
                    "Put a competitor comparison within first scroll, but frame it as 'life impact' not spec-vs-spec"
                ],
            primary_metric: isKo ? "CTR → PDP 체류 → 장바구니 전환" : "CTR → PDP dwell → add-to-cart",
            next_step: isKo
                ? "Q3에서 타겟 1명의 검색 상황을 고정하면, 헤드라인 초안이 바로 나옵니다."
                : "Lock one searcher profile in Q3 and the headline draft writes itself."
        };
    }

    if (role === "brand") {
        return {
            pain_points: isKo
                ? [
                    `"우리 브랜드 광고가 다 비슷비슷해 보여요" — ${city || marketLabel}에서 기능 나열만으로는 기억에 남지 않는 상태`,
                    `"SNS 영상 조회수는 나오는데 브랜드 회상이 안 돼요" — 감정 키워드 없이 콘텐츠만 소비되는 구조`,
                    `"글로벌 캠페인 카피를 로컬에 그대로 쓰면 어색해요" — 문화 맥락 번역 없이 직역하면 공감 손실`
                ]
                : [
                    `"All our brand ads look the same" — feature-listing alone is not memorable in ${city || marketLabel}`,
                    `"Views are up but no one remembers our brand" — content gets consumed without an emotional anchor`,
                    `"Global campaign copy feels off when localized" — direct translation without cultural context loses empathy`
                ],
            solutions: isKo
                ? [
                    "제품 스펙 대신 '이 사람의 하루가 어떻게 달라지는가' 한 장면으로 시작 → 기억 잔존율 확보",
                    "영상·소셜·배너에 동일 감정 키워드 1개를 관통시키기 → 채널 넘어 브랜드 회상 연결",
                    "글로벌 메시지의 '감정 핵심'만 추출하고, 로컬 생활 장면으로 재구성 → 어색함 없는 현지화"
                ]
                : [
                    "Start with 'how this person's day changes' instead of specs — one scene creates recall",
                    "Thread one emotional keyword through video/social/banner — link recall across channels",
                    "Extract the 'emotional core' of global copy, then rebuild with local life scenes — natural localization"
                ],
            primary_metric: isKo ? "브랜드 비보조 회상률 + 감정 연상 일치도" : "Unaided brand recall + emotional association match",
            next_step: isKo
                ? "Q3에서 타겟의 감정 키워드를 하나 고정하면, 스토리 톤이 바로 잡힙니다."
                : "Lock one emotional keyword for the target in Q3 and the story tone follows."
        };
    }

    // retail (default)
    return {
        pain_points: isKo
            ? [
                `"이 제품 왜 필요해요?" — ${city || marketLabel} 매장에서 고객이 가장 먼저 던지는 질문인데, 기능 설명으로는 답이 안 되는 상태`,
                `"AI 기능 켜면 전기세 더 나와요?" — 에너지 절감 체감이 구매 결정의 핵심 포인트인데 시연에 빠져 있음`,
                `"설치 복잡하지 않아요?" — 원스텝 셋업 시연이 30초 안에 끝나야 설득되는데, 현재 시연 흐름이 너무 김`
            ]
            : [
                `"Why do I need this?" — the first question in ${city || marketLabel} stores, and feature specs don't answer it`,
                `"Will the AI feature raise my power bill?" — energy savings proof is the purchase tipping point but missing from demos`,
                `"Is setup complicated?" — customers need to see one-step setup in under 30 seconds, but current demos run too long`
            ],
        solutions: isKo
            ? [
                "'왜 필요해요?' 질문엔 → \"퇴근하고 집에 들어오면 3초 만에 자동으로 켜집니다\" 한 장면 시연으로 대답",
                "전기세 질문엔 → 비포/애프터 숫자 1개 (\"월 약 ₩12,000 절감\") 시연 중 자연스럽게 언급",
                "설치 질문엔 → 박스 개봉~첫 작동까지 30초 타임랩스 시연 → \"이게 끝이에요\"로 클로징"
            ]
            : [
                "For 'Why do I need this?' → demo one scene: \"Walk in the door, everything turns on in 3 seconds\"",
                "For the power bill question → drop one before/after number (\"saves ~$10/month\") naturally during demo",
                "For setup worry → 30-second time-lapse from unbox to first run → close with \"That's it, you're done\""
            ],
        primary_metric: isKo ? "시연 완료율 → 상담 전환율" : "Demo completion → consultation conversion",
        next_step: isKo
            ? "Q3에서 타겟 고객 1명과 매장 상황을 고정하면, 시연 스크립트 초안이 바로 나옵니다."
            : "Lock one shopper type and store moment in Q3 — the demo script draft follows."
    };
}

async function fetchWorldBank(country, indicator, signal) {
    const payload = await fetchJson(
        `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?format=json&per_page=60`,
        { signal }
    );
    const series = Array.isArray(payload?.[1]) ? payload[1] : [];
    const latest = series.find((entry) => Number.isFinite(entry?.value));
    return {
        type: indicator === "NY.GDP.PCAP.CD" ? "gdp" : "urban",
        value: Number(latest?.value || 0),
        year: latest?.date || "",
        source_domain: "api.worldbank.org"
    };
}

async function fetchOpenMeteoGeocode(query, country, signal) {
    const payload = await fetchJson(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&countryCode=${country}&format=json`,
        { signal }
    );
    return Array.isArray(payload?.results) && payload.results.length ? payload.results[0] : null;
}

async function fetchOpenMeteo(lat, lon, signal) {
    const payload = await fetchJson(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=UTC&forecast_days=7`,
        { signal }
    );
    return {
        type: "climate",
        high: average(payload?.daily?.temperature_2m_max),
        low: average(payload?.daily?.temperature_2m_min),
        rain: average(payload?.daily?.precipitation_sum),
        source_domain: "api.open-meteo.com"
    };
}

async function fetchNominatim(city, country, signal) {
    const payload = await fetchJson(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&city=${encodeURIComponent(city)}&countrycodes=${country.toLowerCase()}&limit=1`,
        {
            signal,
            headers: {
                "User-Agent": "scenario-self-generation-agent/1.0 (+cloudflare-pages)"
            }
        }
    );
    const top = Array.isArray(payload) && payload.length ? payload[0] : null;
    return {
        type: "place",
        display_name: top?.display_name || city,
        importance: Number(top?.importance || 0),
        class_name: top?.class || "city",
        type_name: top?.type || "unknown",
        source_domain: "nominatim.openstreetmap.org"
    };
}

async function fetchCountryProfile(country, signal) {
    const payload = await fetchJson(
        `https://restcountries.com/v3.1/alpha/${encodeURIComponent(country)}?fields=cca2,cca3,population,area,borders,latlng`,
        { signal }
    );
    const item = Array.isArray(payload) ? payload[0] : payload;
    return {
        type: "country_profile",
        country_code: item?.cca2 || country,
        country_code3: item?.cca3 || "",
        population: Number(item?.population || 0),
        area_km2: Number(item?.area || 0),
        borders: Array.isArray(item?.borders) ? item.borders : [],
        latlng: Array.isArray(item?.latlng) ? item.latlng : [],
        source_domain: "restcountries.com"
    };
}

async function fetchCityLandmarkImage(city, country, signal) {
    const candidates = [`${city}`, `${city}, ${country}`];
    for (const candidate of candidates) {
        try {
            const payload = await fetchJson(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(candidate)}`,
                {
                    signal,
                    headers: {
                        "User-Agent": "scenario-self-generation-agent/1.0 (+cloudflare-pages)"
                    }
                }
            );
            const imageUrl = payload?.thumbnail?.source || payload?.originalimage?.source || "";
            if (imageUrl) {
                return {
                    type: "city_landmark",
                    image_url: imageUrl,
                    source_domain: "en.wikipedia.org"
                };
            }
        } catch {
            // Keep trying candidates.
        }
    }

    return {
        type: "city_landmark",
        image_url: `https://source.unsplash.com/960x540/?${encodeURIComponent(`${city} skyline landmark`)}`,
        source_domain: "source.unsplash.com"
    };
}

function buildVisualInsight({ country, city, geocode, countryProfile, landmark }) {
    const cityName = city || country;
    const lat = Number(geocode?.latitude || countryProfile?.latlng?.[0] || 0);
    const lon = Number(geocode?.longitude || countryProfile?.latlng?.[1] || 0);
    const areaKm2 = Number(countryProfile?.area_km2 || 0);
    const countryPopulation = Number(countryProfile?.population || 0);
    const cityPopulation = Number(geocode?.population || 0);
    const cityPopulationSharePct = countryPopulation > 0 && cityPopulation > 0
        ? (cityPopulation / countryPopulation) * 100
        : 0;
    const zoom = resolveRegionalMapZoom(areaKm2);
    const mapImageUrl = lat && lon
        ? `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=${zoom}&size=960x540&maptype=mapnik&markers=${lat},${lon},red-pushpin`
        : "";

    return {
        city: cityName,
        country,
        landmark_image_url: landmark?.image_url || "",
        map_image_url: mapImageUrl,
        country_area_km2: areaKm2,
        country_population: countryPopulation,
        city_population: cityPopulation,
        city_population_share_pct: cityPopulationSharePct,
        neighbor_codes: Array.isArray(countryProfile?.borders) ? countryProfile.borders : []
    };
}

function resolveRegionalMapZoom(areaKm2) {
    if (!Number.isFinite(areaKm2) || areaKm2 <= 0) return 4;
    if (areaKm2 >= 7000000) return 3;
    if (areaKm2 >= 2000000) return 4;
    if (areaKm2 >= 700000) return 5;
    if (areaKm2 >= 200000) return 6;
    return 7;
}

function buildMacro(locale, country, city, gdp, urban, climate) {
    const citySuffix = city ? ` ${city}` : "";
    const gdpText = gdp?.value ? `${Math.round(gdp.value).toLocaleString("en-US")} USD (${gdp.year || "n/a"})` : "n/a";
    const urbanText = urban?.value ? `${urban.value.toFixed(1)}% (${urban.year || "n/a"})` : "n/a";
    const climateText = climate
        ? `${climate.high.toFixed(1)}°C / ${climate.low.toFixed(1)}°C, ${climate.rain.toFixed(1)}mm`
        : "n/a";

    if (locale === "ko") {
        return {
            title: `${country}${citySuffix} 시장에서 잘 먹히는 생활 시나리오를 찾는 단계입니다`,
            market_traits: [
                `도시화율 ${urbanText}로 도시 생활권 수요가 큽니다.`,
                `1인당 GDP ${gdpText} 기준으로 체감가치 소구가 유리합니다.`,
                `최근 7일 기후 신호 ${climateText}`
            ],
            core_needs: [
                "귀가 직후 빠른 집 상태 정리",
                "반복 가사 부담 절감",
                "시간 절약을 감성 가치로 연결하는 메시지"
            ],
            opportunity_factors: [
                "국가 데이터와 도시 특성을 함께 보면 어떤 메시지가 더 잘 먹히는지 명확해집니다.",
                "도시를 구체화하면 같은 제품도 소구 포인트가 크게 달라집니다."
            ],
            next_step_prompt: "도시/지역을 입력하면 로컬 실행 포인트를 즉시 제안합니다."
        };
    }

    return {
        title: `${country}${citySuffix} is in a high time-value and routine-efficiency window`,
        market_traits: [
            `Urbanization ${urbanText} indicates strong urban routine demand.`,
            `GDP per capita ${gdpText} supports value-first messaging.`,
            `Recent 7-day climate signal ${climateText}`
        ],
        core_needs: [
            "Fast home-state reset right after arrival",
            "Lower repetitive chore burden",
            "Turn saved time into emotional payoff"
        ],
        opportunity_factors: [
            "Combining macro indicators and local behavior signals improves message fit.",
            "City-level targeting can shift value proposition quality."
        ],
        next_step_prompt: "Add a city/region to unlock local execution points instantly."
    };
}

function buildLocal(locale, city, place, urban, climate) {
    const importance = Number(place?.importance || 0);
    const archetype = importance >= 0.7
        ? (locale === "ko" ? "핵심 대도시 허브" : "Primary metro hub")
        : (locale === "ko" ? "성장형 생활권" : "Growth urban cluster");

    if (locale === "ko") {
        return {
            city_display: place?.display_name || city,
            archetype,
            demographic: `도시화율 ${urban?.value ? urban.value.toFixed(1) : "n/a"}% 맥락에서 ${city}의 고밀도 루틴 수요가 높을 가능성이 큽니다.`,
            lifestyle: climate
                ? `최근 7일 평균 ${climate.high.toFixed(1)}°C/${climate.low.toFixed(1)}°C, 강수 ${climate.rain.toFixed(1)}mm 조건에서 귀가 직후 자동화 니즈가 높습니다.`
                : "계절 편차를 고려한 실내 쾌적성 루틴 설계가 필요합니다.",
            action_items: [
                `${city} 로컬 커뮤니티 키워드 1개를 카피에 직접 결합`,
                "주요 교통 거점 기준 '귀가 10분 루틴' 메시지 구성",
                "주거 형태별 자동화 난이도 차이를 랜딩 메시지에 반영"
            ],
            confidence_note: importance >= 0.5 ? "지역 데이터 반영 수준: 높음" : "지역 데이터 반영 수준: 보통"
        };
    }

    return {
        city_display: place?.display_name || city,
        archetype,
        demographic: `${city} likely has strong dense-routine demand in this national urban context.`,
        lifestyle: climate
            ? `Recent climate ${climate.high.toFixed(1)}°C/${climate.low.toFixed(1)}°C, ${climate.rain.toFixed(1)}mm suggests high post-arrival automation need.`
            : "Climate signal is limited; lifestyle read uses generalized urban behavior.",
        action_items: [
            `Inject one ${city} local community keyword into copy`,
            "Build a 'first 10 minutes after arrival' scenario around transit hubs",
            "Split landing messages by housing type and automation complexity"
        ],
        confidence_note: importance >= 0.5 ? "City-match confidence: high" : "City-match confidence: medium"
    };
}

function buildEvidence(locale, gdp, urban, climate, place) {
    const now = new Date().toISOString();
    const list = [];
    if (gdp) {
        list.push({
            source_domain: gdp.source_domain,
            collected_at_utc: now,
            confidence: "high",
            snippet: locale === "ko"
                ? `GDP per capita ${Math.round(gdp.value || 0).toLocaleString("en-US")} (${gdp.year || "n/a"})`
                : `GDP per capita ${Math.round(gdp.value || 0).toLocaleString("en-US")} (${gdp.year || "n/a"})`
        });
    }
    if (urban) {
        list.push({
            source_domain: urban.source_domain,
            collected_at_utc: now,
            confidence: "high",
            snippet: `Urban population ratio ${Number(urban.value || 0).toFixed(1)}% (${urban.year || "n/a"})`
        });
    }
    if (climate) {
        list.push({
            source_domain: climate.source_domain,
            collected_at_utc: now,
            confidence: "medium",
            snippet: locale === "ko"
                ? `7일 기후 평균 최고 ${climate.high.toFixed(1)}°C / 최저 ${climate.low.toFixed(1)}°C`
                : `7-day climate avg high ${climate.high.toFixed(1)}°C / low ${climate.low.toFixed(1)}°C`
        });
    }
    if (place) {
        list.push({
            source_domain: place.source_domain,
            collected_at_utc: now,
            confidence: Number(place.importance || 0) >= 0.5 ? "medium" : "low",
            snippet: locale === "ko"
                ? `도시 매칭 중요도 ${Number(place.importance || 0).toFixed(2)} (${place.class_name}:${place.type_name})`
                : `City match importance ${Number(place.importance || 0).toFixed(2)} (${place.class_name}:${place.type_name})`
        });
    }
    return list;
}

function average(values) {
    const numeric = (Array.isArray(values) ? values : []).map((value) => Number(value)).filter(Number.isFinite);
    if (!numeric.length) return 0;
    return numeric.reduce((sum, value) => sum + value, 0) / numeric.length;
}
