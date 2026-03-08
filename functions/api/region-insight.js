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

    const cacheKey = new Request(`https://cache.local/region-insight?country=${country}&city=${encodeURIComponent(city)}&locale=${locale}`);
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
        const data = await buildLiveRegionInsight({ country, city, locale });
        const payload = {
            ok: true,
            data: {
                ...data,
                meta: {
                    query_country: country,
                    query_city: city,
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

async function buildLiveRegionInsight({ country, city, locale }) {
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
        macro: buildMacro(locale, country, city, gdp, urban, climate),
        local: city ? buildLocal(locale, city, place, urban, climate) : null,
        evidence: buildEvidence(locale, gdp, urban, climate, place)
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
