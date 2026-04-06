import { clearSessionCookie, getConfig, json, readSession } from "./access/_shared.js";
import { enforceMonthlyBudget, estimateUsageCost, recordUsageCost } from "./_shared_ai.js";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const CITY_PROFILE_UPSTREAM_TIMEOUT_MS = 65000;
const CITY_PROFILE_UPSTREAM_MAX_ATTEMPTS = 2;

const CITY_PROFILE_SYSTEM_PROMPT = `You are a Geo-Localization Evidence Extractor for a scenario-generation system.

Your task is to produce a source-bound city evidence pack for consumer experience, smart home, automation, and local marketing scenario generation.

Hard rules:
1. No unsourced claims.
2. No generic city language that could fit almost any city.
3. Every accepted category must include at least one local anchor such as a district, station, line, road, mountain, river, official event, official facility, policy, statistic, or named local area.
4. If evidence is weak or missing, output exactly: "Evidence insufficient for localized claim."
5. Prefer official or primary sources. Community-style sources may only support discovery and must not be the sole proof unless explicitly labeled as weak support.
6. Do not over-infer from a single place or event.
7. Write concise output that is directly reusable by downstream scenario agents.
8. Use the requested locale language for natural-language fields, but keep JSON keys in English.

Required categories:
- climate
- housing
- family
- daily_rhythm
- safety
- energy
- health
- pets
- mobility
- events

Return valid JSON only with this exact top-level structure:
{
  "climate": "localized category summary or Evidence insufficient for localized claim.",
  "housing": "...",
  "family": "...",
  "daily_rhythm": "...",
  "safety": "...",
  "energy": "...",
  "health": "...",
  "pets": "...",
  "mobility": "...",
  "events": "...",
  "source_map": [
    {
      "id": "S1",
      "title": "source title",
      "organization": "source organization",
      "published_or_updated": "date if known",
      "url": "https://...",
      "tier": "A"
    }
  ],
  "local_anchor_inventory": [
    {
      "anchor": "named local anchor",
      "type": "station / district / festival / climate / policy / facility / etc.",
      "why_it_matters": "why this anchor helps localization",
      "source_ids": ["S1"]
    }
  ],
  "evidence_pack": {
    "climate": {
      "localized_statement": "1-3 sentences with at least one local anchor, or Evidence insufficient for localized claim.",
      "why_localized": "brief reason",
      "evidence_ids": ["S1"],
      "confidence": "High",
      "reusability_for_scenario_agent": "brief scenario use",
      "smart_home_relevance": "one sentence",
      "marketing_relevance": "one sentence",
      "missing_evidence": ""
    }
  },
  "red_flag_check": ["claims intentionally excluded because they were generic, weak, or over-inferred"],
  "scenario_agent_ready_summary": ["short city-specific reusable bullet"],
  "strict_final_rule_check": {
    "no_unsourced_claims": true,
    "no_generic_city_language": true,
    "every_accepted_category_has_local_anchor": true,
    "community_sources_not_used_as_sole_proof_unless_labeled": true,
    "weak_categories_marked_insufficient": true
  }
}`;

const CUSTOM_RESEARCH_SYSTEM_PROMPT = `?뱀떊? ?뱀젙 ?꾩떆???ㅻ쭏?명솃 ?쒕굹由ъ삤 湲고쉷???꾪븳 ?꾩떆 留λ씫 遺꾩꽍 ?꾨Ц媛?낅땲??
?ъ슜?먭? ?대? 蹂댁쑀???꾩떆 湲곕낯 ?꾨줈??10媛?移댄뀒怨좊━)? "base_profiles"濡??쒓났?⑸땲??
?뱀떊????븷? ?ъ슜?먭? ?낅젰??異붽? ?ㅼ썙?쒖뿉 ???湲곗〈 ?꾨줈?꾧낵 以묐났?섏? ?딅뒗 ?덈줈???꾩떆 留λ씫???꾩텧?섎뒗 寃껋엯?덈떎.

?듭떖 ?먯튃:
1. base_profiles???대? ?덈뒗 ?댁슜??諛섎났?섏? 留덉꽭?? ?ㅼ썙?쒕줈 ?명빐 ?덈∼寃??쒕윭?섎뒗 留λ씫留?異쒕젰?섏꽭??
2. ?ㅼ썙?쒕? ?댁꽍????4~8媛쒖쓽 寃???섎룄(search intent)濡??뺤옣?섏꽭????紐⑤몢 ?대떦 ?꾩떆???뱁솕?섏뼱???⑸땲??
3. 媛?finding? SmartThings ?쒕굹由ъ삤 湲고쉷??吏곸젒 ?쒖슜?????덈룄濡?scenario_implication???ы븿?섏꽭??
4. ?쇰컲濡? ?곸떇??諛섎났, ?꾩떆? 臾닿????댁슜? 湲덉??⑸땲??
5. ?ㅼ썙??愿?⑥꽦???쏀븯硫??붿쭅??諛앺엳怨?媛??媛源뚯슫 ?댁꽍???쒖떆?섏꽭??
6. ?붿껌??locale ?몄뼱濡??묒꽦?섎릺, tags 諛곗뿴? ??긽 ?곸뼱濡??묒꽦?섏꽭??
7. 異쒕젰? 諛섎뱶???꾨옒 怨좎젙 JSON 援ъ“濡쒕쭔 ?묒꽦?섏꽭?? ?ㅻ챸 ?놁씠 JSON留?異쒕젰?섏꽭??

JSON 援ъ“:
{
  "keyword_interpretation": "?ㅼ썙?쒕? ?꾩떆 留λ씫?먯꽌 ?댁꽍??1~2臾몄옣",
  "search_intents": ["?꾩떆+?ㅼ썙??寃고빀 寃???섎룄 1", "寃???섎룄 2"],
  "city_keyword_findings": [
    {
      "title": "諛쒓껄 ?쒕ぉ",
      "summary": "?대떦 ?꾩떆?먯꽌 ???ㅼ썙?쒖? 愿?⑦빐 ?덈∼寃??쒕윭?섎뒗 留λ씫",
      "scenario_implication": "SmartThings ?쒕굹由ъ삤 湲고쉷???대뼸寃?諛섏쁺?????덈뒗吏"
    }
  ],
  "dedup_note": "湲곗〈 base_profiles???以묐났 ?щ? 諛?李⑤퀎???ㅻ챸",
  "recommended_reflection_points": ["?쒕굹由ъ삤 諛섏쁺 ?ъ씤??1", "?ъ씤??2"],
  "tags": ["Save energy", "Keep your home safe"]
}`;

function parseJsonObjectFromText(rawText) {
    const text = typeof rawText === "string" ? rawText.trim() : "";
    if (!text) return null;

    const candidates = [
        text,
        text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim()
    ];
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) candidates.push(jsonMatch[0].trim());

    for (const candidate of candidates) {
        if (!candidate) continue;
        try {
            return JSON.parse(candidate);
        } catch {
            continue;
        }
    }
    return null;
}

function normalizeStringList(value, maxItems = 8) {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) => typeof item === "string" ? item.trim() : "")
        .filter(Boolean)
        .slice(0, maxItems);
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetryOpenAiStatus(status) {
    return status === 408 || status === 409 || status === 429 || status >= 500;
}

async function fetchOpenAiChatCompletionWithRetry({ apiKey, requestBody, timeoutMs = CITY_PROFILE_UPSTREAM_TIMEOUT_MS, maxAttempts = CITY_PROFILE_UPSTREAM_MAX_ATTEMPTS }) {
    let lastError = new Error("OpenAI request failed");

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(OPENAI_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timer);

            if (response.ok) {
                return response.json();
            }

            const errText = await response.text().catch(() => "");
            let errMsg = errText.substring(0, 400) || `OpenAI API error ${response.status}`;
            try {
                errMsg = JSON.parse(errText)?.error?.message || errMsg;
            } catch {}

            lastError = new Error(errMsg);
            lastError.status = response.status;

            if (attempt < maxAttempts && shouldRetryOpenAiStatus(response.status)) {
                await delay(800 * attempt);
                continue;
            }

            throw lastError;
        } catch (error) {
            clearTimeout(timer);
            lastError = error instanceof Error ? error : new Error(String(error));
            const isAbort = lastError.name === "AbortError";
            const isTransient = isAbort || /timeout|timed out|network|fetch failed|socket|econnreset|etimedout/i.test(lastError.message || "");

            if (attempt < maxAttempts && isTransient) {
                await delay(800 * attempt);
                continue;
            }

            throw lastError;
        }
    }

    throw lastError;
}

const CITY_PROFILE_FIELDS = ["climate", "housing", "family", "daily_rhythm", "safety", "energy", "health", "pets", "mobility", "events"];

function normalizeLocalizedCategoryText(value) {
    const text = typeof value === "string" ? value.trim() : "";
    return text || "Evidence insufficient for localized claim.";
}

function normalizeEvidencePackEntry(entry) {
    if (!entry || typeof entry !== "object") {
        return {
            localized_statement: "Evidence insufficient for localized claim.",
            why_localized: "",
            evidence_ids: [],
            confidence: "Low",
            reusability_for_scenario_agent: "",
            smart_home_relevance: "",
            marketing_relevance: "",
            missing_evidence: ""
        };
    }

    return {
        localized_statement: normalizeLocalizedCategoryText(entry.localized_statement),
        why_localized: typeof entry.why_localized === "string" ? entry.why_localized.trim() : "",
        evidence_ids: normalizeStringList(entry.evidence_ids, 6),
        confidence: typeof entry.confidence === "string" ? entry.confidence.trim() || "Low" : "Low",
        reusability_for_scenario_agent: typeof entry.reusability_for_scenario_agent === "string" ? entry.reusability_for_scenario_agent.trim() : "",
        smart_home_relevance: typeof entry.smart_home_relevance === "string" ? entry.smart_home_relevance.trim() : "",
        marketing_relevance: typeof entry.marketing_relevance === "string" ? entry.marketing_relevance.trim() : "",
        missing_evidence: typeof entry.missing_evidence === "string" ? entry.missing_evidence.trim() : ""
    };
}

function normalizeCityProfilePayload(payload, { city, country, locale }) {
    let source = payload;
    if (typeof source === "string") source = parseJsonObjectFromText(source) || { raw: source };
    if (source?.raw && typeof source.raw === "string") {
        const reparsed = parseJsonObjectFromText(source.raw);
        if (reparsed) source = reparsed;
    }
    if (!source || typeof source !== "object") source = {};

    const normalized = {};
    for (const key of CITY_PROFILE_FIELDS) {
        const entry = normalizeEvidencePackEntry(source?.evidence_pack?.[key]);
        const topLevel = normalizeLocalizedCategoryText(source[key]);
        normalized[key] = topLevel !== "Evidence insufficient for localized claim."
            ? topLevel
            : entry.localized_statement;
    }

    normalized.source_map = Array.isArray(source.source_map)
        ? source.source_map
            .filter((item) => item && typeof item === "object")
            .map((item, index) => ({
                id: typeof item.id === "string" && item.id.trim() ? item.id.trim() : `S${index + 1}`,
                title: typeof item.title === "string" ? item.title.trim() : "",
                organization: typeof item.organization === "string" ? item.organization.trim() : "",
                published_or_updated: typeof item.published_or_updated === "string" ? item.published_or_updated.trim() : "",
                url: typeof item.url === "string" ? item.url.trim() : "",
                tier: typeof item.tier === "string" ? item.tier.trim() : ""
            }))
            .filter((item) => item.title || item.url)
            .slice(0, 20)
        : [];

    normalized.local_anchor_inventory = Array.isArray(source.local_anchor_inventory)
        ? source.local_anchor_inventory
            .filter((item) => item && typeof item === "object")
            .map((item) => ({
                anchor: typeof item.anchor === "string" ? item.anchor.trim() : "",
                type: typeof item.type === "string" ? item.type.trim() : "",
                why_it_matters: typeof item.why_it_matters === "string" ? item.why_it_matters.trim() : "",
                source_ids: normalizeStringList(item.source_ids, 6)
            }))
            .filter((item) => item.anchor)
            .slice(0, 20)
        : [];

    normalized.evidence_pack = {};
    for (const key of CITY_PROFILE_FIELDS) {
        normalized.evidence_pack[key] = normalizeEvidencePackEntry(source?.evidence_pack?.[key]);
    }

    normalized.red_flag_check = normalizeStringList(source.red_flag_check, 20);
    normalized.scenario_agent_ready_summary = normalizeStringList(source.scenario_agent_ready_summary, 10);
    const checks = source.strict_final_rule_check && typeof source.strict_final_rule_check === "object"
        ? source.strict_final_rule_check
        : {};
    normalized.strict_final_rule_check = {
        no_unsourced_claims: checks.no_unsourced_claims !== false,
        no_generic_city_language: checks.no_generic_city_language !== false,
        every_accepted_category_has_local_anchor: checks.every_accepted_category_has_local_anchor !== false,
        community_sources_not_used_as_sole_proof_unless_labeled: checks.community_sources_not_used_as_sole_proof_unless_labeled !== false,
        weak_categories_marked_insufficient: checks.weak_categories_marked_insufficient !== false
    };
    normalized.meta = { city, country, locale };

    return normalized;
}

function inferCustomResearchTags(query, extraText = "") {
    const haystack = `${query || ""} ${extraText || ""}`.toLowerCase();
    // Keep in sync with server.js inferCustomResearchTags
    const tagRules = [
        { tag: "Care for seniors", terms: ["시니어", "노인", "고령", "어르신", "senior", "elder", "aging"] },
        { tag: "Care for kids", terms: ["아이", "키즈", "어린이", "육아", "child", "kid", "baby"] },
        { tag: "Care for your pet", terms: ["반려", "펫", "pet", "dog", "cat"] },
        { tag: "Keep your home safe", terms: ["보안", "안전", "security", "safe", "cctv", "도난", "침입"] },
        { tag: "Save energy", terms: ["에너지", "전기", "난방", "냉방", "절약", "energy", "utility", "bill"] },
        { tag: "Sleep well", terms: ["수면", "숙면", "sleep", "bedtime"] },
        { tag: "Stay fit & healthy", terms: ["건강", "웰니스", "fitness", "health", "공기", "air quality", "미세먼지"] },
        { tag: "Find your belongings", terms: ["분실", "위치", "찾기", "tag", "tracker", "belonging"] },
        { tag: "Time saving", terms: ["시간", "루틴", "자동", "automation", "commute", "출퇴근"] },
        { tag: "Enhanced mood", terms: ["무드", "분위기", "mood", "ambience", "힐링"] },
        { tag: "Help with chores", terms: ["집안일", "청소", "세탁", "요리", "chore", "cleaning", "laundry"] },
        { tag: "Keep the air fresh", terms: ["환기", "공기", "air", "odor", "smell", "습도"] },
        { tag: "Easily control your lights", terms: ["조명", "lights", "lighting", "lamp"] }
    ];

    return [...new Set(
        tagRules
            .filter((rule) => rule.terms.some((term) => haystack.includes(term)))
            .map((rule) => rule.tag)
    )].slice(0, 4);
}

function buildFallbackCustomResearch({ query, city, locale, baseProfiles, raw }) {
    const isKo = locale === "ko";
    const profileLines = typeof baseProfiles === "string"
        ? baseProfiles.split("\n").map((line) => line.trim()).filter(Boolean)
        : [];

    const findings = (profileLines.length ? profileLines : [
        isKo
            ? `context: ${city} 생활 맥락에서 ${query} 관련 추가 사용 장면`
            : `context: extra ${query} use cases in ${city}`
    ]).slice(0, 3).map((line) => {
        const dividerIndex = line.indexOf(":");
        const title = dividerIndex >= 0 ? line.slice(0, dividerIndex).trim() : (isKo ? "도시 맥락" : "City Context");
        const summary = dividerIndex >= 0 ? line.slice(dividerIndex + 1).trim() : line;
        return {
            title,
            summary,
            scenario_implication: isKo
                ? `"${query}" 관련 알림, 자동화, 원격 확인 장면을 이 맥락에 맞게 설계합니다.`
                : `Design alerts, automations, and remote checks around "${query}" in this context.`
        };
    });

    return {
        keyword_interpretation: isKo
            ? `"${query}"는 ${city} 생활 패턴 안에서 추가로 반영할 지역 특성입니다.`
            : `"${query}" is an additional local context signal for ${city}.`,
        search_intents: [
            isKo ? `${city} ${query} 생활 패턴` : `${city} ${query} daily life`,
            isKo ? `${city} ${query} 불편` : `${city} ${query} pain points`
        ],
        city_keyword_findings: findings,
        dedup_note: baseProfiles
            ? (isKo
                ? "기존 도시 프로필과 중복되는 설명은 줄이고 추가 맥락 중심으로 정리했습니다."
                : "Repeated points from the existing city profile were reduced.")
            : "",
        recommended_reflection_points: [
            isKo
                ? `"${query}"가 필요한 시간대와 생활 조건을 루틴 트리거에 반영`
                : `Use the timing and living conditions behind "${query}" as routine triggers.`,
            isKo
                ? `"${query}"와 연결되는 알림/모니터링 장면을 시나리오에 포함`
                : `Include alert and monitoring moments connected to "${query}".`
        ],
        tags: inferCustomResearchTags(query, `${baseProfiles || ""} ${raw || ""}`)
    };
}

function normalizeCustomResearchPayload(payload, context) {
    const { query, city, locale, baseProfiles } = context;
    let source = payload;
    if (typeof source === "string") source = parseJsonObjectFromText(source) || { raw: source };
    if (source?.raw && typeof source.raw === "string") {
        const reparsed = parseJsonObjectFromText(source.raw);
        if (reparsed) source = reparsed;
    }
    if (source?.data && typeof source.data === "object") source = source.data;

    if (!source || typeof source !== "object") {
        return buildFallbackCustomResearch({ query, city, locale, baseProfiles, raw: payload });
    }

    const interpretation = typeof source.keyword_interpretation === "string" ? source.keyword_interpretation.trim() : "";
    const searchIntents = normalizeStringList(source.search_intents, 8);
    const reflectionPoints = normalizeStringList(source.recommended_reflection_points, 4);
    const tags = normalizeStringList(source.tags, 6);
    const findings = Array.isArray(source.city_keyword_findings)
        ? source.city_keyword_findings
            .filter((item) => item && typeof item === "object")
            .map((item) => ({
                title: typeof item.title === "string" ? item.title.trim() : "",
                summary: typeof item.summary === "string" ? item.summary.trim() : "",
                scenario_implication: typeof item.scenario_implication === "string" ? item.scenario_implication.trim() : ""
            }))
            .filter((item) => item.title || item.summary || item.scenario_implication)
            .slice(0, 5)
        : [];

    if (interpretation || findings.length || reflectionPoints.length) {
        return {
            keyword_interpretation: interpretation,
            search_intents: searchIntents,
            city_keyword_findings: findings,
            dedup_note: typeof source.dedup_note === "string" ? source.dedup_note.trim() : "",
            recommended_reflection_points: reflectionPoints,
            tags: tags.length ? tags : inferCustomResearchTags(query, JSON.stringify(source))
        };
    }

    return buildFallbackCustomResearch({
        query,
        city,
        locale,
        baseProfiles,
        raw: source.raw || JSON.stringify(source)
    });
}

async function readJsonBody(request) {
    try {
        return await request.json();
    } catch {
        return {};
    }
}

async function handleCityProfile(context) {
    let config;
    try {
        config = getConfig(context.env);
    } catch {
        return json({ ok: false, error: { code: "SERVER_MISCONFIGURED" } }, 500);
    }

    const session = await readSession(context.request, config);
    if (!session.authenticated) {
        return json(
            { ok: false, error: { code: "UNAUTHORIZED" } },
            401,
            { "Set-Cookie": clearSessionCookie() }
        );
    }

    const budgetBlocked = await enforceMonthlyBudget(context.env);
    if (budgetBlocked) return budgetBlocked;

    const url = new URL(context.request.url);
    const locale = url.searchParams.get("locale") || "ko";
    const postBody = context.request.method === "POST" ? await readJsonBody(context.request) : {};
    const country = url.searchParams.get("country") || postBody.country || "";
    const city = url.searchParams.get("city") || postBody.city || "";
    const customQuery = url.searchParams.get("custom_query") || postBody.custom_query || "";
    const baseProfiles = postBody.base_profiles || url.searchParams.get("base_profiles") || "";

    if (!city || !country) {
        return json({ ok: false, error: { code: "MISSING_PARAMS", message: "country and city are required." } }, 400);
    }

    const apiKey = String(context.env.OPENAI_API_KEY || "").trim();
    const model = String(context.env.OPENAI_MODEL || "gpt-5.4").trim();

    if (customQuery && !apiKey) {
        return json({
            ok: true,
            data: normalizeCustomResearchPayload({ raw: "API_NOT_CONFIGURED" }, { query: customQuery, city, locale, baseProfiles }),
            mode: "custom_research",
            meta: { city, country, locale, model, query: customQuery, fallback: true, fallback_reason: "API_NOT_CONFIGURED" }
        });
    }

    if (!apiKey) {
        return json({ ok: false, error: { code: "API_NOT_CONFIGURED", message: "OPENAI_API_KEY is not set." } }, 500);
    }

    console.info(JSON.stringify({
        type: customQuery ? "custom_research_request" : "city_profile_request",
        ts: new Date().toISOString(),
        model, country, city, locale, query: customQuery || null
    }));

    if (customQuery) {
        const maxTokens = 2000;
        const userMessage = `?꾩떆: ${city}, 援??: ${country}, ?몄뼱: ${locale}\n?ㅼ썙?? "${customQuery}"\n\n${baseProfiles ? `湲곗〈 base_profiles:\n${baseProfiles}\n\n` : ""}`;
        const requestBody = {
            model,
            ...(/^gpt-5/i.test(model)
                ? { max_completion_tokens: maxTokens }
                : { max_tokens: maxTokens }),
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: CUSTOM_RESEARCH_SYSTEM_PROMPT },
                { role: "user", content: userMessage }
            ]
        };

        let result;
        try {
            result = await fetchOpenAiChatCompletionWithRetry({ apiKey, requestBody });
        } catch (error) {
            return json({
                ok: true,
                data: normalizeCustomResearchPayload({ raw: error.message }, { query: customQuery, city, locale, baseProfiles }),
                mode: "custom_research",
                meta: { city, country, locale, model, query: customQuery, fallback: true, fallback_reason: error.message }
            });
        }

        const usage = result.usage || null;
        const content = result.choices?.[0]?.message?.content || "{}";

        if (usage) {
            const cost = estimateUsageCost(context.env, model, usage);
            await recordUsageCost(context.env, cost).catch(() => {});
        }

        return json({
            ok: true,
            data: normalizeCustomResearchPayload(parseJsonObjectFromText(content) || { raw: content }, { query: customQuery, city, locale, baseProfiles }),
            mode: "custom_research",
            meta: { city, country, locale, model, query: customQuery }
        });
    }

    const userMessage = `Target country: ${country}
Target city: ${city}
Optional subregion: none
Output locale: ${locale}

Build a source-bound localization evidence pack for this city. Use only evidence-backed localized statements. If evidence is weak, mark that category as "Evidence insufficient for localized claim." Return valid JSON only.`;
    const maxTokens = 2000;

    let result;
    try {
        result = await fetchOpenAiChatCompletionWithRetry({
            apiKey,
            requestBody: {
                model,
                ...(/^gpt-5/i.test(model)
                    ? { max_completion_tokens: maxTokens }
                    : { max_tokens: maxTokens }),
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: CITY_PROFILE_SYSTEM_PROMPT },
                    { role: "user", content: userMessage }
                ]
            }
        });
    } catch (error) {
        return json({ ok: false, error: { code: "UPSTREAM_ERROR", message: error.message } }, 502);
    }

    const usage = result.usage || null;
    const content = result.choices?.[0]?.message?.content || "{}";

    if (usage) {
        const cost = estimateUsageCost(context.env, model, usage);
        await recordUsageCost(context.env, cost).catch(() => {});
    }

    return json({
        ok: true,
        data: normalizeCityProfilePayload(parseJsonObjectFromText(content) || { raw: content }, { city, country, locale }),
        meta: { city, country, locale, model }
    }, 200, {
        "Cache-Control": "public, max-age=86400"
    });
}

export async function onRequestGet(context) {
    return handleCityProfile(context);
}

export async function onRequestPost(context) {
    return handleCityProfile(context);
}
