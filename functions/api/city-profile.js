import { clearSessionCookie, getConfig, json, readSession } from "./access/_shared.js";
import { enforceMonthlyBudget, estimateUsageCost, recordUsageCost } from "./_shared_ai.js";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const CITY_PROFILE_SYSTEM_PROMPT = `당신은 특정 도시의 '생활 밀착형 특징'을 분석하는 고도로 전문화된 지역 데이터 분석가입니다. 당신의 임무는 거시적 트렌드나 해결책이 아닌, 오직 주민의 실제 생활과 관련된 객관적인 사실만을 요약하는 것입니다.

엄격한 규칙:
1. '특징'에만 집중: 트렌드, 문제점, 해결책, CX 시나리오 제안은 절대 생성하지 마세요. 오직 아래 10개 '생활 카테고리'의 렌즈를 통해 도시의 객관적인 특징만 설명해야 합니다.
2. 철저한 지역화: 모든 설명은 국가 단위가 아닌, 요청된 도시에만 해당하는 구체적인 내용이어야 합니다.
3. 간결한 출력: 각 카테고리 설명은 1-2 문장의 간결하고 자연스러운 문장으로 작성하세요. 요청된 locale의 언어로 작성합니다.
4. 고정 JSON 출력: 최종 결과는 반드시 아래 키를 사용하는 유효한 JSON 객체여야 합니다. 설명 없이 JSON만 출력하세요.

10가지 생활 카테고리 (JSON Key):
1. climate: 기후·계절
2. housing: 주거 형태·생활 공간
3. family: 가족 구성·돌봄 구조
4. daily_rhythm: 일상 리듬·생활 패턴
5. safety: 안전·보안
6. energy: 에너지 비용·절약
7. health: 건강·웰니스
8. pets: 펫 라이프
9. mobility: 이동·부재·여행
10. events: 문화 행사·시즌성 이벤트`;

export async function onRequestGet(context) {
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

    const apiKey = String(context.env.OPENAI_API_KEY || "").trim();
    if (!apiKey) {
        return json({ ok: false, error: { code: "API_NOT_CONFIGURED" } }, 500);
    }

    const budgetBlocked = await enforceMonthlyBudget(context.env);
    if (budgetBlocked) return budgetBlocked;

    const url = new URL(context.request.url);
    const country = url.searchParams.get("country") || "";
    const city = url.searchParams.get("city") || "";
    const locale = url.searchParams.get("locale") || "ko";

    if (!city || !country) {
        return json({ ok: false, error: { code: "MISSING_PARAMS", message: "country and city are required." } }, 400);
    }

    const userMessage = `{ "city": "${city}", "country": "${country}", "locale": "${locale}" }에 대한 생활 밀착형 특징을 위의 규칙에 따라 JSON 형식으로 분석해 줘.`;
    const model = String(context.env.OPENAI_MODEL || "gpt-5.4").trim();
    const maxTokens = 1500;

    console.info(JSON.stringify({
        type: "city_profile_request",
        ts: new Date().toISOString(),
        model, country, city, locale
    }));

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
        try { errMsg = JSON.parse(errText)?.error?.message || errMsg; } catch { /* ignore */ }
        return json({ ok: false, error: { code: "UPSTREAM_ERROR", message: errMsg } }, 502);
    }

    const result = await apiResponse.json();
    const usage = result.usage || null;
    const content = result.choices?.[0]?.message?.content || "{}";

    if (usage) {
        const cost = estimateUsageCost(context.env, model, usage);
        await recordUsageCost(context.env, cost).catch(() => {});
    }

    let profile;
    try {
        profile = JSON.parse(content);
    } catch {
        profile = { raw: content };
    }

    return json({
        ok: true,
        data: profile,
        meta: { city, country, locale, model }
    }, 200, {
        "Cache-Control": "public, max-age=86400"  // CDN 24시간 캐시
    });
}
