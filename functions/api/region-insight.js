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
        const data = await buildLiveRegionInsight({ country, city, locale, role });
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

async function buildLiveRegionInsight({ country, city, locale, role }) {
    const geocode = await withTimeout((signal) => fetchOpenMeteoGeocode(city || country, country, signal), TIMEOUT_MS);
    const lat = Number(geocode?.latitude || 0);
    const lon = Number(geocode?.longitude || 0);

    const tasks = [
        withTimeout((signal) => fetchWorldBank(country, "NY.GDP.PCAP.CD", signal), TIMEOUT_MS),
        withTimeout((signal) => fetchWorldBank(country, "SP.URB.TOTL.IN.ZS", signal), TIMEOUT_MS)
    ];

    if (lat && lon) tasks.push(withTimeout((signal) => fetchOpenMeteo(lat, lon, signal), TIMEOUT_MS));
    if (city) tasks.push(withTimeout((signal) => fetchNominatim(city, country, signal), TIMEOUT_MS));

    const settled = await Promise.allSettled(tasks);
    const values = settled.filter((entry) => entry.status === "fulfilled").map((entry) => entry.value);
    if (!values.length) {
        throw Object.assign(new Error("All live insight sources failed."), { code: "REGION_INSIGHT_ALL_SOURCES_FAILED" });
    }

    const gdp = values.find((value) => value.type === "gdp");
    const urban = values.find((value) => value.type === "urban");
    const climate = values.find((value) => value.type === "climate");
    const place = values.find((value) => value.type === "place");

    return {
        role,
        role_lens: buildRoleLens(locale, role, country, city),
        macro: buildMacro(locale, country, city, gdp, urban, climate),
        local: city ? buildLocal(locale, city, place, urban, climate) : null,
        evidence: buildEvidence(locale, gdp, urban, climate, place)
    };
}

function buildRoleLens(locale, role, country, city) {
    const marketLabel = city ? `${country} ${city}` : country;
    const isKo = locale === "ko";
    const isDe = locale === "de";

    if (role === "dotcom") {
        return {
            why_this_matters: isKo
                ? `${marketLabel}에서는 유입 키워드와 랜딩 전환 장벽을 먼저 잡아야 캠페인 효율이 올라갑니다.`
                : isDe
                    ? `In ${marketLabel} steigen die Ergebnisse, wenn Suchintent und Conversion-Hürden zuerst geklärt werden.`
                    : `In ${marketLabel}, outcomes improve when search intent and conversion friction are clarified first.`,
            must_know: isKo
                ? [
                    "유입 사용자가 먼저 찾는 문제 해결 문장을 헤드라인에 반영할 것",
                    "상품 상세(PDP)에서 이탈을 유발하는 구간을 1~2개로 축소할 것",
                    "국가/도시 맥락에 맞는 혜택 근거(시간 절약·비용 절감)를 첫 스크롤 안에 배치할 것"
                ]
                : [
                    "Reflect problem-first search intent in the first headline.",
                    "Reduce PDP drop-off friction to one or two obvious blockers.",
                    "Place local proof of value (time/cost) above the first scroll."
                ],
            execution_points: isKo
                ? [
                    "광고 카피와 랜딩 H1 문장을 동일한 약속으로 맞춤",
                    "CTA 앞에 설치 난이도/체감 시간 정보를 짧게 고지",
                    "Q3 타겟별로 랜딩 버전 A/B 테스트 문장 2개 준비"
                ]
                : [
                    "Align ad promise and landing H1 as one message.",
                    "Add setup effort and payoff time before CTA.",
                    "Prepare two A/B headline variants by Q3 segment."
                ],
            primary_metric: isKo ? "CTR -> PDP 전환율 -> 구매 전환율" : "CTR -> PDP conversion -> purchase conversion",
            next_step: isKo
                ? "Q3에 타겟 1개와 유입 상황 1개를 고정하고, 검증할 KPI를 하나만 지정하세요."
                : "In Q3, lock one target and one entry context, then pick exactly one KPI to validate."
        };
    }

    if (role === "brand") {
        return {
            why_this_matters: isKo
                ? `${marketLabel}에서는 기능 나열보다 문화 맥락에 맞는 스토리 각도가 브랜드 선호를 더 빠르게 만듭니다.`
                : isDe
                    ? `In ${marketLabel} wirkt ein kulturpassender Story-Winkel stärker als reine Feature-Auflistung.`
                    : `In ${marketLabel}, culture-fit storytelling builds brand preference faster than feature lists.`,
            must_know: isKo
                ? [
                    "해당 시장에서 공감되는 생활 장면(가족/웰빙/시간 가치)을 먼저 정의할 것",
                    "브랜드가 해결하는 감정적 긴장(불안/번거로움/거리감)을 한 문장으로 명시할 것",
                    "글로벌 메시지와 로컬 표현의 역할을 분리할 것"
                ]
                : [
                    "Define one culturally resonant life scene first.",
                    "Name the emotional tension the brand resolves in one line.",
                    "Separate global message backbone from local expression."
                ],
            execution_points: isKo
                ? [
                    "캠페인 첫 문장을 기능이 아닌 '사람의 변화'로 시작",
                    "영상/소셜/배너에서 동일한 감정 키워드 유지",
                    "Q3 타겟별 스토리보드 컷 3개(문제-전환-해결) 작성"
                ]
                : [
                    "Open campaign copy with human change, not specs.",
                    "Keep one emotional keyword across video/social/banner.",
                    "Draft a 3-cut storyboard (problem-shift-resolution) for Q3 segment."
                ],
            primary_metric: isKo ? "브랜드 선호도 + 메시지 회상률" : "Brand preference + message recall",
            next_step: isKo
                ? "Q3에 타겟과 감정 키워드를 함께 고정하고, 스토리 톤을 한 줄로 정의하세요."
                : "In Q3, lock target and emotional keyword together, then define tone in one line."
        };
    }

    return {
        why_this_matters: isKo
            ? `${marketLabel}에서는 매장 대화에서 바로 써먹는 설명 구조가 판매 전환에 가장 직접적으로 연결됩니다.`
            : isDe
                ? `In ${marketLabel} wirkt eine sofort nutzbare In-Store-Erklärung am direktesten auf den Abschluss.`
                : `In ${marketLabel}, an in-store explanation flow that staff can use immediately is most conversion-critical.`,
        must_know: isKo
            ? [
                "고객이 매장에서 가장 먼저 묻는 질문(가격/설치/호환)을 우선 정리할 것",
                "기능 설명보다 '그래서 내 일상이 어떻게 달라지나'를 먼저 제시할 것",
                "첫 시연 30초 안에 체감 포인트를 보여줄 것"
            ]
            : [
                "Prioritize first in-store objections: price, setup, compatibility.",
                "Lead with daily-life payoff before feature detail.",
                "Show one felt benefit within the first 30 seconds of demo."
            ],
        execution_points: isKo
            ? [
                "매장 직원용 1문장 오프너 + 2문장 클로징 스크립트 작성",
                "시연 순서를 '문제-체감-증거' 3단계로 고정",
                "Q3 타겟에 맞춰 FAQ 반박 문장 3개 준비"
            ]
            : [
                "Write a 1-line opener and 2-line closer for store staff.",
                "Fix demo order as problem -> felt payoff -> proof.",
                "Prepare three objection-handling lines for the Q3 target."
            ],
        primary_metric: isKo ? "상담 전환율 + 시연 완료율" : "Consultation conversion + demo completion",
        next_step: isKo
            ? "Q3에 타겟 고객 1명과 매장 상황 1개를 고정하고, 시연 문장을 작성하세요."
            : "In Q3, lock one shopper type and one store context, then draft the demo line."
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
