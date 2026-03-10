import { clearSessionCookie, getConfig, json, readSession } from "./access/_shared.js";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

export async function onRequestPost(context) {
    let config;
    try {
        config = getConfig(context.env);
    } catch {
        return json({ ok: false, error: { code: "SERVER_MISCONFIGURED", message: "Server is not configured." } }, 500);
    }

    const session = await readSession(context.request, config);
    if (!session.authenticated) {
        return json(
            { ok: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
            401,
            { "Set-Cookie": clearSessionCookie() }
        );
    }

    const apiKey = String(context.env.ANTHROPIC_API_KEY || "").trim();
    if (!apiKey) {
        return json({ ok: false, error: { code: "API_NOT_CONFIGURED", message: "ANTHROPIC_API_KEY is not set." } }, 500);
    }

    let body;
    try {
        body = await context.request.json();
    } catch {
        return json({ ok: false, error: { code: "BAD_REQUEST", message: "Invalid JSON body." } }, 400);
    }

    const previousOutput    = String(body?.previousOutput || "").trim();
    const refinementRequest = String(body?.refinementRequest || "").trim();
    const context_data      = body?.context || {};

    if (!refinementRequest) {
        return json({ ok: false, error: { code: "MISSING_REQUEST", message: "refinementRequest is required." } }, 400);
    }

    let systemPrompt = String(context.env.SYSTEM_PROMPT || "").trim();
    if (!systemPrompt) {
        return json({ ok: false, error: { code: "PROMPT_NOT_FOUND", message: "System prompt not configured." } }, 500);
    }

    const assistantMessage = previousOutput ? { role: "assistant", content: previousOutput } : null;
    const userMessage = [
        assistantMessage ? null : `## Context\n${JSON.stringify(context_data, null, 2)}`,
        `## Refinement Request`,
        refinementRequest,
        `\n(Respond only to the specific request above. Update or expand the relevant section only. Re-run the Section 11 Reflection Check if structural changes are made.)`
    ].filter(Boolean).join("\n");

    const messages = assistantMessage
        ? [
            { role: "user", content: `Generate initial scenario for: ${JSON.stringify(context_data)}` },
            assistantMessage,
            { role: "user", content: userMessage }
          ]
        : [{ role: "user", content: userMessage }];

    const anthropicBody = JSON.stringify({
        model: String(context.env.ANTHROPIC_MODEL || "claude-sonnet-4-6"),
        max_tokens: 4000,
        stream: true,
        system: systemPrompt,
        messages
    });

    const apiResponse = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01"
        },
        body: anthropicBody
    });

    if (!apiResponse.ok) {
        const errText = await apiResponse.text().catch(() => "");
        let errMsg = `Anthropic API error ${apiResponse.status}`;
        try { errMsg = JSON.parse(errText)?.error?.message || errMsg; } catch { /* ignore */ }
        return json({ ok: false, error: { code: "UPSTREAM_ERROR", message: errMsg } }, 502);
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    const pump = async () => {
        const reader = apiResponse.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        writer.write(encoder.encode(`data: ${JSON.stringify({ type: "start" })}\n\n`));

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop();

                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;
                    const data = line.slice(6).trim();
                    if (data === "[DONE]") continue;
                    try {
                        const event = JSON.parse(data);
                        if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
                            writer.write(encoder.encode(`data: ${JSON.stringify({ type: "chunk", text: event.delta.text })}\n\n`));
                        }
                        if (event.type === "message_stop") {
                            writer.write(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
                        }
                    } catch { /* skip */ }
                }
            }
        } finally {
            writer.write(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
            writer.close();
        }
    };

    pump();

    return new Response(readable, {
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    });
}
