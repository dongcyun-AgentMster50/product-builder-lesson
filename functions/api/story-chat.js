// /api/story-chat — STORY_CHAT (P7-A-2 마이그레이션)
// scenarios-browse.html 의 "이 스토리로 더 파보기" 채팅 패널이 BYOK 로 직접
// OpenAI / Anthropic / Gemini 를 호출하던 것을 백엔드 엔드포인트로 분리.
//
// 입력 (POST body): {
//   scenario: { id?, category, title },
//   story: { number, title, content },
//   userMessage: "사용자 입력 또는 프리셋 prompt",
//   history?: [{ role: "user"|"assistant", content: "..." }, ...]
// }
//   - BYOK 키는 'X-User-Api-Key' 헤더 (resolveProviderKey 재사용).
// 응답: { ok: true, reply: "..." }
//
// 시스템 프롬프트는 prompt.txt [AGENT:STORY_CHAT] 마커가 SSOT.
// 호출부에서 loadAgentPrompt(context, "STORY_CHAT") 으로 동적 로드.

import { json } from "./access/_shared.js";
import { resolveProviderKey, maskKey, DEFAULT_MODELS } from "./_provider.js";
import { loadAgentPrompt } from "./_prompt_loader.js";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// ─── 컨텍스트 빌더 ─────────────────────────────────────────────────────
// 첫 user 턴에 시나리오·스토리 메타를 prefix 로 끼워 넣는다. history 는 그대로.
function buildContextPrefix(body) {
    const sc = body?.scenario || {};
    const st = body?.story || {};
    return `[시나리오] ${sc.category || "(카테고리 미정)"} - ${sc.title || "(제목 없음)"}

[선택한 스토리] ${st.number ?? "?"}. ${st.title || "(스토리 제목 없음)"}
${String(st.content || "").trim()}`;
}

function buildMessages(body) {
    const userMessage = String(body?.userMessage || "").trim();
    const history = Array.isArray(body?.history) ? body.history : [];

    // 정상화: role 은 'user' | 'assistant' 만 허용. 빈 content 제거.
    const cleanHistory = history
        .filter(m => m && (m.role === "user" || m.role === "assistant") && String(m.content || "").trim())
        .map(m => ({ role: m.role, content: String(m.content) }));

    const ctxPrefix = buildContextPrefix(body);

    if (cleanHistory.length === 0) {
        // 첫 턴 — 컨텍스트 + 사용자 질문 합쳐 user 1개
        return [{
            role: "user",
            content: `${ctxPrefix}\n\n[사용자 질문]\n${userMessage}`
        }];
    }

    // 후속 턴 — 첫 user 메시지 앞에 컨텍스트 prefix 한 번만 부착, 나머지는 그대로
    const out = [];
    let prefixed = false;
    for (const m of cleanHistory) {
        if (!prefixed && m.role === "user") {
            out.push({ role: "user", content: `${ctxPrefix}\n\n[사용자 질문]\n${m.content}` });
            prefixed = true;
        } else {
            out.push(m);
        }
    }
    out.push({ role: "user", content: userMessage });
    return out;
}

// ─── LLM 호출 (multi-turn) ──────────────────────────────────────────────
async function callOpenAI({ apiKey, systemPrompt, messages, model }) {
    const requestBody = {
        model,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
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

async function callAnthropic({ apiKey, systemPrompt, messages, model }) {
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
            messages
        })
    });
    if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Anthropic ${res.status}: ${errText.slice(0, 200)}`);
    }
    const d = await res.json();
    return d.content?.[0]?.text || "";
}

async function callGemini({ apiKey, systemPrompt, messages, model }) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const contents = messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
    }));
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
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

    if (!body?.scenario || (!body.scenario.title && !body.scenario.category)) {
        return json({ ok: false, error: { code: "MISSING_SCENARIO", message: "scenario.title / scenario.category 가 필요합니다." } }, 400);
    }
    if (!body?.story || (!body.story.title && !body.story.content)) {
        return json({ ok: false, error: { code: "MISSING_STORY", message: "story.title / story.content 가 필요합니다." } }, 400);
    }
    const userMessage = String(body?.userMessage || "").trim();
    if (!userMessage) {
        return json({ ok: false, error: { code: "MISSING_MESSAGE", message: "userMessage 가 필요합니다." } }, 400);
    }

    const messages = buildMessages(body);
    const model = provider === "openai"
        ? String(modelHint || context.env?.OPENAI_MODEL || DEFAULT_MODELS.openai).trim()
        : (provider === "anthropic"
            ? String(modelHint || context.env?.ANTHROPIC_MODEL || DEFAULT_MODELS.anthropic).trim()
            : String(modelHint || context.env?.GEMINI_MODEL || DEFAULT_MODELS.gemini).trim());

    console.info(JSON.stringify({
        type: "story_chat_request",
        ts: new Date().toISOString(),
        provider, source: keySource, keyMask: maskKey(apiKey), model,
        scenarioTitle: body?.scenario?.title,
        storyNumber: body?.story?.number,
        historyLen: Array.isArray(body?.history) ? body.history.length : 0,
        userMessageLen: userMessage.length
    }));

    // prompt.txt SSOT 에서 시스템 프롬프트 로드 (인라인 폴백 의도적 X)
    let systemPrompt;
    try {
        systemPrompt = await loadAgentPrompt(context, "STORY_CHAT");
    } catch (e) {
        return json({ ok: false, error: { code: "PROMPT_LOAD_FAILED", message: e.message } }, 500);
    }

    let raw;
    try {
        if (provider === "openai") {
            raw = await callOpenAI({ apiKey, systemPrompt, messages, model });
        } else if (provider === "anthropic") {
            raw = await callAnthropic({ apiKey, systemPrompt, messages, model });
        } else if (provider === "gemini") {
            raw = await callGemini({ apiKey, systemPrompt, messages, model });
        } else {
            return json({ ok: false, error: { code: "PROVIDER_NOT_SUPPORTED", message: `${provider} not supported` } }, 400);
        }
    } catch (e) {
        return json({ ok: false, error: { code: "UPSTREAM_ERROR", message: e.message } }, 502);
    }

    const reply = String(raw || "").trim();
    if (!reply) {
        return json({ ok: false, error: { code: "EMPTY_RESPONSE", message: "LLM 응답이 비어 있습니다." } }, 502);
    }

    return json({ ok: true, reply });
}
