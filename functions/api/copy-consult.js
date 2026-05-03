// /api/copy-consult — COPY_CONSULT_M2 백엔드 엔드포인트 (P8)
// v2.html runCopyConsult()의 callAI 직접 호출을 백엔드로 분리. SSOT 5/5 달성.
//
// 입력 (POST body): { role, copyText, tone, categoryHint }
//   - BYOK 키는 'X-User-Api-Key' 헤더 (resolveProviderKey 재사용).
// 응답: { ok: true, markdown: "..." }
//
// 시스템 프롬프트: prompt.txt [AGENT:COPY_CONSULT_M2] (SSOT)
// 호출부에서 loadAgentPrompt(context, "COPY_CONSULT_M2") 으로 동적 로드.

import { json } from "./access/_shared.js";
import { resolveProviderKey, maskKey, DEFAULT_MODELS } from "./_provider.js";
import { loadAgentPrompt } from "./_prompt_loader.js";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// ─── LLM 호출 (마크다운 응답, JSON 아님) ─────────────────────────────────────
async function callOpenAI({ apiKey, systemPrompt, userMessage, model }) {
    const requestBody = {
        model,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
        ],
    };
    if (/^gpt-5/i.test(String(model || "").trim())) {
        requestBody.max_completion_tokens = 3000;
        // GPT-5 계열은 temperature=1 (default) 만 지원, 명시적 설정 생략
    } else {
        requestBody.max_tokens = 3000;
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
            max_tokens: 3000,
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
            generationConfig: { maxOutputTokens: 3000, temperature: 0.7 }
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

// ─── User 메시지 빌더 ─────────────────────────────────────────────────────────
function buildUserMessage(body) {
    const roleNames = { retail: "리테일(오프라인)", dotcom: "닷컴(온라인)", brand: "브랜드/마케팅팀" };
    const role = String(body?.role || "").trim();
    const copyText = String(body?.copyText || "").trim();
    const tone = String(body?.tone || "").trim();
    const categoryHint = String(body?.categoryHint || "").trim();

    return `# Output Mode: copy

## Input (Copy Consult)
- 역할: ${roleNames[role] || role || "(미입력)"}
- 카피 원고 (현수): ${copyText}
- 톤 선호: ${tone || "(미선택 — Bold/Genuine/Playful 중 가장 적합한 것을 선택 판단)"}
- 참고 카테고리 힌트: ${categoryHint || "(미입력 — 카피 원고에서 유추)"}

위 입력으로 6섹션 A~F 카피 컨설팅 보고서를 작성해주세요.`;
}

// ─── 메인 핸들러 ─────────────────────────────────────────────────────────────
export async function onRequestPost(context) {
    const { provider, apiKey, source: keySource, modelHint } = resolveProviderKey(context);
    if (!provider) {
        return json({
            ok: false,
            error: { code: "API_NOT_CONFIGURED", message: "API 키가 필요합니다. BYOK 헤더에서 키를 입력해주세요." }
        }, 400);
    }

    let body;
    try {
        body = await context.request.json();
    } catch {
        return json({ ok: false, error: { code: "BAD_REQUEST", message: "Invalid JSON body." } }, 400);
    }

    if (!String(body?.copyText || "").trim()) {
        return json({ ok: false, error: { code: "MISSING_COPY_TEXT", message: "copyText가 필요합니다." } }, 400);
    }

    const model = provider === "openai"
        ? String(modelHint || context.env?.OPENAI_MODEL || DEFAULT_MODELS.openai).trim()
        : (provider === "anthropic"
            ? String(modelHint || context.env?.ANTHROPIC_MODEL || DEFAULT_MODELS.anthropic).trim()
            : String(modelHint || context.env?.GEMINI_MODEL || DEFAULT_MODELS.gemini).trim());

    console.info(JSON.stringify({
        type: "copy_consult_request",
        ts: new Date().toISOString(),
        provider, source: keySource, keyMask: maskKey(apiKey), model,
        copyTextLen: String(body?.copyText || "").length
    }));

    // SSOT: prompt.txt [AGENT:COPY_CONSULT_M2]
    let systemPrompt;
    try {
        systemPrompt = await loadAgentPrompt(context, "COPY_CONSULT_M2");
    } catch (e) {
        return json({ ok: false, error: { code: "PROMPT_LOAD_FAILED", message: e.message } }, 500);
    }

    const userMessage = buildUserMessage(body);
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

    return json({ ok: true, markdown: raw });
}
