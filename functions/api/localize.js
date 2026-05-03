// /api/localize — A2 LOCALIZER (P5-B 마이그레이션)
// v2.html 의 runLocalizer() 가 callAI 직접 호출하던 것을 백엔드 엔드포인트로 분리.
//
// 입력 (POST body): {
//   story: { title, thumbnail, scenario_id?, value_tags?, ... },
//   role, country, city, home, family[], devices[], values[], locale?
// }
//   - BYOK 키는 'X-User-Api-Key' 헤더 (resolveProviderKey 재사용)
// 응답: { ok: true, localizedStory: "..." }   ← v2.html 기존 호환 (state.localizedStory 에 저장)
//
// 시스템 프롬프트는 인라인 (P6 에서 prompt.txt 통합 예정).

import { json } from "./access/_shared.js";
import { resolveProviderKey, maskKey, DEFAULT_MODELS } from "./_provider.js";
import { loadAgentPrompt } from "./_prompt_loader.js";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// A2 LOCALIZER 시스템 프롬프트는 prompt.txt [AGENT:LOCALIZER_A2] 마커가 SSOT.
// 호출부에서 loadAgentPrompt(context, "LOCALIZER_A2") 으로 동적 로드.

// ─── User 프롬프트 빌더 ──────────────────────────────────────────────────
function buildA2UserMessage(body) {
    const countryNames = {
        KR: "한국", US: "미국", JP: "일본", AU: "호주", IN: "인도",
        DE: "독일", UK: "영국", CN: "중국", BR: "브라질", MX: "멕시코", SG: "싱가포르", SE: "스웨덴"
    };
    const homeLabel = { apartment: "아파트", house: "단독주택", villa: "빌라·연립", studio: "원룸·스튜디오", officetel: "오피스텔" };
    const familyLabel = { single: "1인 가구", couple: "커플·부부", kids: "영유아·어린이", teens: "청소년", senior: "시니어", pet: "반려동물" };

    const story = body?.story || {};
    const title = String(story.title || "(제목 없음)");
    const thumbnail = String(story.thumbnail || "");
    const role = String(body?.role || "").trim();
    const country = String(body?.country || "").trim();
    const city = String(body?.city || "").trim();
    const home = String(body?.home || "").trim();
    const family = Array.isArray(body?.family) ? body.family : [];
    const devices = Array.isArray(body?.devices) ? body.devices : [];
    const values = Array.isArray(body?.values) ? body.values : [];
    const locale = String(body?.locale || (country === "KR" ? "ko" : "en")).trim();

    return `원문 시나리오: ${title}
요약: ${thumbnail}

대상 국가: ${countryNames[country] || country || "(미입력)"}${city ? " / " + city : ""}
채널: ${role || "(미입력)"}
가치 태그: ${values.join(", ") || "(없음)"}

[고객 프로필 — 시나리오에 반영]
- 거주 형태: ${home ? (homeLabel[home] || home) : "미입력"}
- 가족 구성: ${family.length ? family.map(f => familyLabel[f] || f).join(", ") : "미입력"}
- 보유 기기: ${devices.length ? devices.join(", ") : "미입력"}

출력 언어: ${locale === "ko" ? "한국어" : "English"}.
이 시나리오를 위 프로필을 반영해 현지화하고, 선택한 기기를 시나리오 안에 직접 등장시켜 개인화해주세요.`;
}

// ─── LLM 호출 (비-streaming, 마크다운/평문 출력) ────────────────────────
async function callOpenAI({ apiKey, systemPrompt, userMessage, model }) {
    const requestBody = {
        model,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
        ],
    };
    if (/^gpt-5/i.test(String(model || "").trim())) {
        requestBody.max_completion_tokens = 1500;
        // GPT-5 계열은 temperature=1 (default) 만 지원, 명시적 설정 생략
    } else {
        requestBody.max_tokens = 1500;
        requestBody.temperature = 0.7;
    }
    const res = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify(requestBody)
    });
    if (!res.ok) {
        const errText = await res.text().catch(() => "");
        let msg = `OpenAI ${res.status}`;
        try { msg = JSON.parse(errText)?.error?.message || msg; } catch { /* ignore */ }
        throw new Error(msg);
    }
    const d = await res.json();
    return d.choices?.[0]?.message?.content || "";
}

async function callAnthropic({ apiKey, systemPrompt, userMessage, model }) {
    const res = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
            model,
            max_tokens: 1500,
            system: systemPrompt,
            messages: [{ role: "user", content: userMessage }]
        })
    });
    if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Anthropic ${res.status}: ${errText.slice(0, 200)}`);
    }
    const d = await res.json();
    return d.content?.[0]?.text || "";
}

async function callGemini({ apiKey, systemPrompt, userMessage, model }) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: userMessage }] }],
            generationConfig: { maxOutputTokens: 1500, temperature: 0.7 }
        })
    });
    if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Gemini ${res.status}: ${errText.slice(0, 200)}`);
    }
    const d = await res.json();
    const parts = d.candidates?.[0]?.content?.parts || [];
    return parts.map(p => p.text || "").join("");
}

// ─── 메인 핸들러 ─────────────────────────────────────────────────────────
export async function onRequestPost(context) {
    const { provider, apiKey, source: keySource, modelHint } = resolveProviderKey(context);
    if (!provider) {
        return json({
            ok: false,
            error: { code: "API_NOT_CONFIGURED", message: "API 키가 필요합니다. BYOK 모달에서 키를 입력해주세요." }
        }, 400);
    }

    let body;
    try {
        body = await context.request.json();
    } catch {
        return json({ ok: false, error: { code: "BAD_REQUEST", message: "Invalid JSON body." } }, 400);
    }

    if (!body?.story || (!body.story.title && !body.story.thumbnail)) {
        return json({
            ok: false,
            error: { code: "MISSING_STORY", message: "story.title / story.thumbnail 가 필요합니다." }
        }, 400);
    }

    const userMessage = buildA2UserMessage(body);
    const model = provider === "openai"
        ? String(modelHint || context.env?.OPENAI_MODEL || DEFAULT_MODELS.openai).trim()
        : (provider === "anthropic"
            ? String(modelHint || context.env?.ANTHROPIC_MODEL || DEFAULT_MODELS.anthropic).trim()
            : String(modelHint || context.env?.GEMINI_MODEL || DEFAULT_MODELS.gemini).trim());

    console.info(JSON.stringify({
        type: "localize_request",
        ts: new Date().toISOString(),
        provider, source: keySource, keyMask: maskKey(apiKey), model,
        country: body?.country, city: body?.city,
        storyId: body?.story?.scenario_id,
        deviceCount: Array.isArray(body?.devices) ? body.devices.length : 0
    }));

    // P6-B-2: prompt.txt SSOT 에서 시스템 프롬프트 로드 (인라인 폴백 의도적 X)
    let systemPrompt;
    try {
        systemPrompt = await loadAgentPrompt(context, "LOCALIZER_A2");
    } catch (e) {
        return json({ ok: false, error: { code: "PROMPT_LOAD_FAILED", message: e.message } }, 500);
    }

    let raw;
    try {
        if (provider === "openai") {
            raw = await callOpenAI({ apiKey, systemPrompt, userMessage, model });
        } else if (provider === "anthropic") {
            raw = await callAnthropic({ apiKey, systemPrompt, userMessage, model });
        } else if (provider === "gemini") {
            raw = await callGemini({ apiKey, systemPrompt, userMessage, model });
        } else {
            return json({ ok: false, error: { code: "PROVIDER_NOT_SUPPORTED", message: `${provider} not supported` } }, 400);
        }
    } catch (e) {
        return json({ ok: false, error: { code: "UPSTREAM_ERROR", message: e.message } }, 502);
    }

    const localizedStory = String(raw || "").trim();
    if (!localizedStory) {
        return json({ ok: false, error: { code: "EMPTY_RESPONSE", message: "LLM 응답이 비어 있습니다." } }, 502);
    }

    return json({ ok: true, localizedStory });
}
