// /api/expand — A4 EXPANDER (P5-C 마이그레이션)
// v2.html 의 runExpander() 가 callAI 직접 호출하던 것을 백엔드 엔드포인트로 분리.
//
// 입력 (POST body): {
//   localizedStory: "<state.localizedStory 마크다운>",
//   selectedChannels: ["copy", "kv", "email", "store", "social", "landing"],
//   role: "Retailer", country: "Korea", city: "Seoul", locale: "ko"
// }
//   - BYOK 키는 'X-User-Api-Key' 헤더 (resolveProviderKey 재사용)
// 응답: { ok: true, expandedAssets: "..." }   ← v2.html output-a4.textContent 에 그대로 표시
//
// 시스템 프롬프트는 인라인 (P6 에서 prompt.txt 통합 예정).

import { json } from "./access/_shared.js";
import { resolveProviderKey, maskKey, DEFAULT_MODELS } from "./_provider.js";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// ─── 채널 ID → 한국어 라벨 매핑 (v2.html runExpander channelNames 동일) ──
const CHANNEL_NAMES = {
    copy: "카피라이팅 (헤드라인 3개 + 서브카피)",
    kv: "Key Visual 이미지 생성 프롬프트",
    email: "이메일 제목 + 본문 구조",
    store: "매장 판매사원용 세일즈 토크 (2분 분량)",
    social: "SNS 포스트 (인스타그램 + 트위터용)",
    landing: "랜딩페이지 섹션 구조 + 주요 메시지"
};

// ─── A4 EXPANDER 시스템 프롬프트 (v2.html 1699-1706 그대로 이식) ─────────
// 사용자 입력 언어 지시는 user message 에서 명시 (system 은 locale 무관).
const A4_SYSTEM_PROMPT = `당신은 SmartThings 채널 확장 에이전트(A4 Expander)입니다.
확정된 시나리오를 기반으로 각 마케팅 채널에 맞는 결과물을 생성합니다.

규칙:
- 채널별로 명확히 구분하여 출력
- 시나리오의 핵심 메시지와 가치를 유지
- 실제 사용 가능한 수준으로 구체적으로
- 사용자 입력 언어 지시(KR/EN 등)에 맞춰 출력`;

// ─── User 프롬프트 빌더 ──────────────────────────────────────────────────
function buildA4UserMessage(body) {
    const localizedStory = String(body?.localizedStory || "").trim();
    const channels = Array.isArray(body?.selectedChannels) ? body.selectedChannels : [];
    const country = String(body?.country || "").trim();
    const locale = String(body?.locale || (country === "KR" ? "ko" : "en")).trim();

    const requestedChannels = channels
        .map(c => CHANNEL_NAMES[c] || c)
        .join("\n");

    return `확정 시나리오:
${localizedStory}

생성할 채널 결과물:
${requestedChannels}

출력 언어: ${locale === "ko" ? "한국어" : "English"}.
각 채널별로 결과물을 생성해주세요.`;
}

// ─── LLM 호출 (비-streaming, 마크다운/평문 출력) ────────────────────────
async function callOpenAI({ apiKey, systemPrompt, userMessage, model }) {
    const requestBody = {
        model,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
        ],
        temperature: 0.7
    };
    if (/^gpt-5/i.test(String(model || "").trim())) {
        requestBody.max_completion_tokens = 2500;
    } else {
        requestBody.max_tokens = 2500;
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
            max_tokens: 2500,
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
            generationConfig: { maxOutputTokens: 2500, temperature: 0.7 }
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

    const localizedStory = String(body?.localizedStory || "").trim();
    if (!localizedStory) {
        return json({
            ok: false,
            error: { code: "MISSING_STORY", message: "localizedStory(A2 결과)가 필요합니다." }
        }, 400);
    }
    const channels = Array.isArray(body?.selectedChannels) ? body.selectedChannels : [];
    if (channels.length === 0) {
        return json({
            ok: false,
            error: { code: "MISSING_CHANNELS", message: "selectedChannels 가 1개 이상 필요합니다." }
        }, 400);
    }

    const userMessage = buildA4UserMessage(body);
    const model = provider === "openai"
        ? String(modelHint || context.env?.OPENAI_MODEL || DEFAULT_MODELS.openai).trim()
        : (provider === "anthropic"
            ? String(modelHint || context.env?.ANTHROPIC_MODEL || DEFAULT_MODELS.anthropic).trim()
            : String(modelHint || context.env?.GEMINI_MODEL || DEFAULT_MODELS.gemini).trim());

    console.info(JSON.stringify({
        type: "expand_request",
        ts: new Date().toISOString(),
        provider, source: keySource, keyMask: maskKey(apiKey), model,
        country: body?.country, locale: body?.locale,
        channelCount: channels.length,
        storyLen: localizedStory.length
    }));

    let raw;
    try {
        if (provider === "openai") {
            raw = await callOpenAI({ apiKey, systemPrompt: A4_SYSTEM_PROMPT, userMessage, model });
        } else if (provider === "anthropic") {
            raw = await callAnthropic({ apiKey, systemPrompt: A4_SYSTEM_PROMPT, userMessage, model });
        } else if (provider === "gemini") {
            raw = await callGemini({ apiKey, systemPrompt: A4_SYSTEM_PROMPT, userMessage, model });
        } else {
            return json({ ok: false, error: { code: "PROVIDER_NOT_SUPPORTED", message: `${provider} not supported` } }, 400);
        }
    } catch (e) {
        return json({ ok: false, error: { code: "UPSTREAM_ERROR", message: e.message } }, 502);
    }

    const expandedAssets = String(raw || "").trim();
    if (!expandedAssets) {
        return json({ ok: false, error: { code: "EMPTY_RESPONSE", message: "LLM 응답이 비어 있습니다." } }, 502);
    }

    return json({ ok: true, expandedAssets });
}
