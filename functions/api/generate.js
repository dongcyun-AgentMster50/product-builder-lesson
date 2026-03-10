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

    // Load system prompt from KV or env variable
    let systemPrompt = String(context.env.SYSTEM_PROMPT || "").trim();
    if (!systemPrompt) {
        return json({ ok: false, error: { code: "PROMPT_NOT_FOUND", message: "System prompt not configured." } }, 500);
    }

    const role      = String(body?.role || "").trim();
    const country   = String(body?.country || "").trim();
    const city      = String(body?.city || "").trim();
    const segment   = String(body?.segment || "").trim();
    const purpose   = String(body?.purpose || "").trim();
    const devices   = Array.isArray(body?.devices) ? body.devices.join(", ") : String(body?.devices || "");
    const groups    = Array.isArray(body?.deviceGroups) ? body.deviceGroups.join(", ") : String(body?.deviceGroups || "");
    const tags      = Array.isArray(body?.intentTags) ? body.intentTags.join(", ") : String(body?.intentTags || "");
    const mission   = String(body?.missionBucket || "").trim();
    const locale    = String(body?.locale || "ko").trim();
    const regionCtx = body?.regionInsight ? JSON.stringify(body.regionInsight, null, 2) : null;

    const userMessage = [
        `## Input State`,
        `- Q1. Role: ${role}`,
        `- Q2. Country: ${country}${city ? ` / City: ${city}` : ""}`,
        `- Q3. Target Segment: ${segment || "(not specified)"}`,
        `- Q3. Purpose: ${purpose || "(not specified)"}`,
        `- Q4. Devices: ${devices || "(none)"}`,
        `- Q4. Device Categories: ${groups || "(none)"}`,
        `- Explore Tags (intent): ${tags || "(none)"}`,
        `- Mission Bucket: ${mission || "Discover"}`,
        `- Output Language: ${locale === "ko" ? "Korean-primary (English for Section 01-IV Storyboard and Section 04 marketing hooks)" : "English-primary"}`,
        regionCtx ? `\n## Live Regional Data\n\`\`\`json\n${regionCtx}\n\`\`\`` : "",
        `\n## Task`,
        `Generate a Samsung SmartThings CX scenario following the 11-section output schema from Part 5 of the system prompt.`,
        `Output sections (01) through (09) in full. Then end with the refinement prompt:`,
        `"어떤 부분을 수정하거나 더 자세히 보고 싶으신가요? (Which section to refine, or request section 10-11?)"`,
    ].filter(Boolean).join("\n");

    const anthropicBody = JSON.stringify({
        model: String(context.env.ANTHROPIC_MODEL || "claude-sonnet-4-6"),
        max_tokens: 8000,
        stream: true,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }]
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

    // Stream the SSE response back to the client
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
