// Gemini hardcoded adapter — returns OpenAI-shape responses so existing downstream code works unchanged.
// BYOK: key resolved per-request from X-User-Api-Key header, fallback env.GEMINI_API_KEY (dev).

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = "gemini-2.5-flash";

function maskKey(key) {
    if (!key) return "(none)";
    return key.slice(0, 4) + "***" + key.slice(-2);
}

export function resolveGeminiKey(context) {
    const headerKey = String(context.request.headers.get("X-User-Api-Key") || "").trim();
    if (headerKey) return { key: headerKey, source: "header" };
    const envKey = String(context.env?.GEMINI_API_KEY || "").trim();
    if (envKey) return { key: envKey, source: "env" };
    return { key: "", source: null };
}

// OpenAI chat messages → Gemini contents
function messagesToGeminiContents(messages) {
    const contents = [];
    let systemInstruction = null;
    for (const m of messages || []) {
        const role = m.role;
        const text = typeof m.content === "string" ? m.content : JSON.stringify(m.content || "");
        if (role === "system") {
            systemInstruction = systemInstruction ? (systemInstruction + "\n\n" + text) : text;
            continue;
        }
        contents.push({
            role: role === "assistant" ? "model" : "user",
            parts: [{ text }]
        });
    }
    return { contents, systemInstruction };
}

function buildGenerationConfig({ maxTokens, jsonMode }) {
    const cfg = {
        temperature: 0.7,
        maxOutputTokens: Number(maxTokens) || 8000
    };
    if (jsonMode) cfg.responseMimeType = "application/json";
    return cfg;
}

// Non-streaming call. Returns OpenAI-shape: { usage, choices:[{ message:{ content }, finish_reason }] }
export async function callGeminiAsOpenAI({ apiKey, model, messages, maxTokens = 8000, jsonMode = false, timeoutMs = 60000 }) {
    const chosenModel = String(model || DEFAULT_MODEL).trim();
    const { contents, systemInstruction } = messagesToGeminiContents(messages);
    const body = {
        contents,
        generationConfig: buildGenerationConfig({ maxTokens, jsonMode })
    };
    if (systemInstruction) body.systemInstruction = { parts: [{ text: systemInstruction }] };

    const url = `${GEMINI_BASE}/models/${chosenModel}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let res;
    try {
        res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal
        });
    } finally {
        clearTimeout(timer);
    }

    if (!res.ok) {
        const errText = await res.text().catch(() => "");
        let msg = `Gemini API error ${res.status}`;
        try { msg = JSON.parse(errText)?.error?.message || msg; } catch {}
        const err = new Error(msg);
        err.status = res.status;
        console.warn(JSON.stringify({ type: "gemini_error", status: res.status, model: chosenModel, key: maskKey(apiKey), message: msg }));
        throw err;
    }

    const result = await res.json();
    const cand = result?.candidates?.[0];
    const text = cand?.content?.parts?.map(p => p?.text || "").join("") || "";
    const finish_reason = cand?.finishReason ? String(cand.finishReason).toLowerCase() : "stop";
    const usageRaw = result?.usageMetadata || {};

    return {
        usage: {
            prompt_tokens: Number(usageRaw.promptTokenCount || 0),
            completion_tokens: Number(usageRaw.candidatesTokenCount || 0),
            total_tokens: Number(usageRaw.totalTokenCount || 0)
        },
        choices: [{
            index: 0,
            message: { role: "assistant", content: text },
            finish_reason
        }]
    };
}

// Streaming call that emits OpenAI-compatible SSE chunks (Response with stream body).
// Used by generate.js / refine.js where the client expects OpenAI chat.completion.chunk events.
export function streamGeminiAsOpenAI({ apiKey, model, messages, maxTokens = 8000, jsonMode = false }) {
    const chosenModel = String(model || DEFAULT_MODEL).trim();
    const { contents, systemInstruction } = messagesToGeminiContents(messages);
    const body = {
        contents,
        generationConfig: buildGenerationConfig({ maxTokens, jsonMode })
    };
    if (systemInstruction) body.systemInstruction = { parts: [{ text: systemInstruction }] };

    const url = `${GEMINI_BASE}/models/${chosenModel}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;

    const upstream = fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    const stream = new ReadableStream({
        async start(controller) {
            const enc = new TextEncoder();
            const dec = new TextDecoder();
            const emit = (chunkObj) => controller.enqueue(enc.encode(`data: ${JSON.stringify(chunkObj)}\n\n`));
            try {
                const res = await upstream;
                if (!res.ok) {
                    const errText = await res.text().catch(() => "");
                    let msg = `Gemini API error ${res.status}`;
                    try { msg = JSON.parse(errText)?.error?.message || msg; } catch {}
                    emit({ id: "gemini", object: "chat.completion.chunk", choices: [{ index: 0, delta: { content: `\n[Gemini error: ${msg}]` }, finish_reason: "error" }] });
                    controller.enqueue(enc.encode(`data: [DONE]\n\n`));
                    controller.close();
                    return;
                }
                const reader = res.body.getReader();
                let buf = "";
                let aggregateUsage = null;
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    buf += dec.decode(value, { stream: true });
                    const lines = buf.split("\n");
                    buf = lines.pop() || "";
                    for (const rawLine of lines) {
                        const line = rawLine.trim();
                        if (!line.startsWith("data:")) continue;
                        const payload = line.slice(5).trim();
                        if (!payload || payload === "[DONE]") continue;
                        let obj;
                        try { obj = JSON.parse(payload); } catch { continue; }
                        const cand = obj?.candidates?.[0];
                        const text = cand?.content?.parts?.map(p => p?.text || "").join("") || "";
                        if (text) {
                            emit({ id: "gemini", object: "chat.completion.chunk", model: chosenModel, choices: [{ index: 0, delta: { content: text }, finish_reason: null }] });
                        }
                        if (obj?.usageMetadata) aggregateUsage = obj.usageMetadata;
                        if (cand?.finishReason) {
                            emit({ id: "gemini", object: "chat.completion.chunk", model: chosenModel, choices: [{ index: 0, delta: {}, finish_reason: String(cand.finishReason).toLowerCase() }] });
                        }
                    }
                }
                if (aggregateUsage) {
                    emit({
                        id: "gemini",
                        object: "chat.completion.chunk",
                        model: chosenModel,
                        choices: [],
                        usage: {
                            prompt_tokens: Number(aggregateUsage.promptTokenCount || 0),
                            completion_tokens: Number(aggregateUsage.candidatesTokenCount || 0),
                            total_tokens: Number(aggregateUsage.totalTokenCount || 0)
                        }
                    });
                }
                controller.enqueue(enc.encode(`data: [DONE]\n\n`));
                controller.close();
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                console.warn(JSON.stringify({ type: "gemini_stream_error", key: maskKey(apiKey), message: msg }));
                emit({ id: "gemini", object: "chat.completion.chunk", choices: [{ index: 0, delta: { content: `\n[Stream error: ${msg}]` }, finish_reason: "error" }] });
                controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
                controller.close();
            }
        }
    });

    return new Response(stream, {
        status: 200,
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive"
        }
    });
}
