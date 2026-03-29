import { clearSessionCookie, getConfig, json, readSession } from "./access/_shared.js";
import { enforceMonthlyBudget, estimateUsageCost, recordUsageCost } from "./_shared_ai.js";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const CITY_PROFILE_SYSTEM_PROMPT = `?뱀떊? ?뱀젙 ?꾩떆??'?앺솢 諛李⑺삎 ?뱀쭠'??遺꾩꽍?섎뒗 怨좊룄濡??꾨Ц?붾맂 吏???곗씠??遺꾩꽍媛?낅땲?? ?뱀떊???꾨Т??嫄곗떆???몃젋?쒕굹 ?닿껐梨낆씠 ?꾨땶, ?ㅼ쭅 二쇰????ㅼ젣 ?앺솢怨?愿?⑤맂 媛앷??곸씤 ?ъ떎留뚯쓣 ?붿빟?섎뒗 寃껋엯?덈떎.

?꾧꺽??洹쒖튃:
1. '?뱀쭠'?먮쭔 吏묒쨷: ?몃젋?? 臾몄젣?? ?닿껐梨? CX ?쒕굹由ъ삤 ?쒖븞? ?덈? ?앹꽦?섏? 留덉꽭?? ?ㅼ쭅 ?꾨옒 10媛?'?앺솢 移댄뀒怨좊━'???뚯쫰瑜??듯빐 ?꾩떆??媛앷??곸씤 ?뱀쭠留??ㅻ챸?댁빞 ?⑸땲??
2. 泥좎???吏??솕: 紐⑤뱺 ?ㅻ챸? 援?? ?⑥쐞媛 ?꾨땶, ?붿껌???꾩떆?먮쭔 ?대떦?섎뒗 援ъ껜?곸씤 ?댁슜?댁뼱???⑸땲??
3. 媛꾧껐??異쒕젰: 媛?移댄뀒怨좊━ ?ㅻ챸? 1-2 臾몄옣??媛꾧껐?섍퀬 ?먯뿰?ㅻ윭??臾몄옣?쇰줈 ?묒꽦?섏꽭?? ?붿껌??locale???몄뼱濡??묒꽦?⑸땲??
4. 怨좎젙 JSON 異쒕젰: 理쒖쥌 寃곌낵??諛섎뱶???꾨옒 ?ㅻ? ?ъ슜?섎뒗 ?좏슚??JSON 媛앹껜?ъ빞 ?⑸땲?? ?ㅻ챸 ?놁씠 JSON留?異쒕젰?섏꽭??

10媛吏 ?앺솢 移댄뀒怨좊━ (JSON Key):
1. climate: 湲고썑쨌怨꾩젅
2. housing: 二쇨굅 ?뺥깭쨌?앺솢 怨듦컙
3. family: 媛議?援ъ꽦쨌?뚮큵 援ъ“
4. daily_rhythm: ?쇱긽 由щ벉쨌?앺솢 ?⑦꽩
5. safety: ?덉쟾쨌蹂댁븞
6. energy: ?먮꼫吏 鍮꾩슜쨌?덉빟
7. health: 嫄닿컯쨌?곕땲??
8. pets: ???쇱씠??
9. mobility: ?대룞쨌遺??룹뿬??
10. events: 臾명솕 ?됱궗쨌?쒖쫵???대깽??;`;

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

function inferCustomResearchTags(query, extraText = "") {
    const haystack = `${query || ""} ${extraText || ""}`.toLowerCase();
    const tagRules = [
        { tag: "Care for seniors", terms: ["시니어", "노인", "고령", "어르신", "senior", "elder", "aging"] },
        { tag: "Care for kids", terms: ["아이", "키즈", "어린이", "육아", "child", "kid", "baby"] },
        { tag: "Care for your pet", terms: ["반려", "펫", "pet", "dog", "cat"] },
        { tag: "Keep your home safe", terms: ["보안", "안전", "security", "safe", "cctv", "도난", "침입"] },
        { tag: "Save energy", terms: ["에너지", "전기", "난방", "냉방", "절약", "energy", "utility", "bill"] },
        { tag: "Sleep well", terms: ["수면", "숙면", "sleep", "bedtime"] },
        { tag: "Stay fit & healthy", terms: ["건강", "웰니스", "fitness", "health", "공기", "air quality", "미세먼지"] },
        { tag: "Find your belongings", terms: ["분실", "위치", "찾기", "tag", "tracker"] },
        { tag: "Time saving", terms: ["시간", "루틴", "자동", "automation", "commute", "출퇴근"] }
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

        let apiResponse;
        try {
            apiResponse = await fetch(OPENAI_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model,
                    ...(/^gpt-5/i.test(model)
                        ? { max_completion_tokens: maxTokens }
                        : { max_tokens: maxTokens }),
                    response_format: { type: "json_object" },
                    messages: [
                        { role: "system", content: CUSTOM_RESEARCH_SYSTEM_PROMPT },
                        { role: "user", content: userMessage }
                    ]
                })
            });
        } catch (error) {
            return json({
                ok: true,
                data: normalizeCustomResearchPayload({ raw: error.message }, { query: customQuery, city, locale, baseProfiles }),
                mode: "custom_research",
                meta: { city, country, locale, model, query: customQuery, fallback: true, fallback_reason: error.message }
            });
        }

        if (!apiResponse.ok) {
            const errText = await apiResponse.text().catch(() => "");
            return json({
                ok: true,
                data: normalizeCustomResearchPayload({ raw: errText || "UPSTREAM_ERROR" }, { query: customQuery, city, locale, baseProfiles }),
                mode: "custom_research",
                meta: { city, country, locale, model, query: customQuery, fallback: true, fallback_reason: errText || "UPSTREAM_ERROR" }
            });
        }

        const result = await apiResponse.json();
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

    const userMessage = `{ "city": "${city}", "country": "${country}", "locale": "${locale}" }??????앺솢 諛李⑺삎 ?뱀쭠???꾩쓽 洹쒖튃???곕씪 JSON ?뺤떇?쇰줈 遺꾩꽍??以?`;
    const maxTokens = 1500;

    let apiResponse;
    try {
        apiResponse = await fetch(OPENAI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                ...(/^gpt-5/i.test(model)
                    ? { max_completion_tokens: maxTokens }
                    : { max_tokens: maxTokens }),
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: CITY_PROFILE_SYSTEM_PROMPT },
                    { role: "user", content: userMessage }
                ]
            })
        });
    } catch (error) {
        return json({ ok: false, error: { code: "UPSTREAM_ERROR", message: error.message } }, 502);
    }

    if (!apiResponse.ok) {
        const errText = await apiResponse.text().catch(() => "");
        let errMsg = `OpenAI API error ${apiResponse.status}`;
        try { errMsg = JSON.parse(errText)?.error?.message || errMsg; } catch {}
        return json({ ok: false, error: { code: "UPSTREAM_ERROR", message: errMsg } }, 502);
    }

    const result = await apiResponse.json();
    const usage = result.usage || null;
    const content = result.choices?.[0]?.message?.content || "{}";

    if (usage) {
        const cost = estimateUsageCost(context.env, model, usage);
        await recordUsageCost(context.env, cost).catch(() => {});
    }

    return json({
        ok: true,
        data: parseJsonObjectFromText(content) || { raw: content },
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
