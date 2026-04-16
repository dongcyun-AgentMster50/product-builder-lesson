import { clearSessionCookie, getConfig, json, readSession } from "./access/_shared.js";
import { enforceMonthlyBudget, estimateUsageCost, recordUsageCost } from "./_shared_ai.js";
import { streamGeminiAsOpenAI, resolveGeminiKey } from "./_gemini.js";
import { resolveProviderKey, maskKey } from "./_provider.js";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

function buildRefineMessages(body) {
    const previousOutput = String(body?.previousOutput || "").trim();
    const refinementRequest = String(body?.refinementRequest || "").trim();
    const contextData = body?.context || {};

    if (!refinementRequest) {
        return { error: "refinementRequest is required." };
    }

    const assistantMessage = previousOutput ? { role: "assistant", content: previousOutput } : null;
    const userMessage = [
        assistantMessage ? null : `## Context\n${JSON.stringify(contextData, null, 2)}`,
        "## Refinement Request",
        refinementRequest,
        "\n(Respond only to the specific request above. Update or expand the relevant section only. Re-run the Section 11 Reflection Check if structural changes are made.)"
    ].filter(Boolean).join("\n");

    return {
        messages: assistantMessage
            ? [
                { role: "user", content: `Generate initial scenario for: ${JSON.stringify(contextData)}` },
                assistantMessage,
                { role: "user", content: userMessage }
            ]
            : [{ role: "user", content: userMessage }]
    };
}

async function streamOpenAIResponse({ apiKey, systemPrompt, messages, model, maxTokens }) {
    const requestBody = {
        model,
        stream: true,
        stream_options: { include_usage: true },
        messages: [
            { role: "system", content: systemPrompt },
            ...messages
        ]
    };

    if (/^gpt-5/i.test(String(model || "").trim())) {
        requestBody.max_completion_tokens = maxTokens;
    } else {
        requestBody.max_tokens = maxTokens;
    }

    const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errText = await response.text().catch(() => "");
        let errMsg = `OpenAI API error ${response.status}`;
        try { errMsg = JSON.parse(errText)?.error?.message || errMsg; } catch { /* ignore */ }
        throw new Error(errMsg);
    }

    return response;
}

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

    const { provider, apiKey, source: keySource } = resolveProviderKey(context);
    if (!provider) {
        return json({ ok: false, error: { code: "API_NOT_CONFIGURED", message: "No AI provider available: provide a key via the BYOK screen or configure env." } }, 400);
    }

    const budgetBlocked = await enforceMonthlyBudget(context.env);
    if (budgetBlocked) return budgetBlocked;

    let body;
    try {
        body = await context.request.json();
    } catch {
        return json({ ok: false, error: { code: "BAD_REQUEST", message: "Invalid JSON body." } }, 400);
    }

    // prompt.txt를 정적 파일에서 직접 읽음 — 환경변수 수동 복사 불필요
    let systemPrompt = "";
    try {
        const promptRes = await context.env.ASSETS.fetch(new URL("/prompt.txt", context.request.url));
        if (promptRes.ok) systemPrompt = (await promptRes.text()).trim();
    } catch { /* fallback to env */ }
    if (!systemPrompt) systemPrompt = String(context.env.SYSTEM_PROMPT || "").trim();
    if (!systemPrompt) {
        return json({ ok: false, error: { code: "PROMPT_NOT_FOUND", message: "System prompt not configured." } }, 500);
    }

    const built = buildRefineMessages(body);
    if (built.error) {
        return json({ ok: false, error: { code: "MISSING_REQUEST", message: built.error } }, 400);
    }

    const model = provider === "openai"
        ? String(context.env.OPENAI_MODEL || "gpt-4o").trim()
        : String(context.env.GEMINI_MODEL || "gemini-2.5-flash").trim();
    const maxTokens = Number(context.env.OPENAI_REFINE_MAX_TOKENS || 4000);

    console.info(JSON.stringify({
        type: "refine_request",
        ts: new Date().toISOString(),
        provider,
        source: keySource,
        keyMask: maskKey(apiKey),
        model,
        locale: body?.context?.locale || "ko",
        role: body?.context?.role || "",
        country: body?.context?.country || "",
        requestLength: String(body?.refinementRequest || "").length
    }));

    let apiResponse;
    try {
        if (provider === "openai") {
            apiResponse = await streamOpenAIResponse({
                apiKey,
                systemPrompt,
                messages: built.messages,
                model,
                maxTokens
            });
        } else if (provider === "gemini") {
            apiResponse = streamGeminiAsOpenAI({
                apiKey,
                model,
                maxTokens,
                jsonMode: false,
                messages: [
                    { role: "system", content: systemPrompt },
                    ...built.messages
                ]
            });
        } else {
            return json({ ok: false, error: { code: "PROVIDER_NOT_SUPPORTED", message: `${provider} not supported yet` } }, 400);
        }
    } catch (error) {
        return json({ ok: false, error: { code: "UPSTREAM_ERROR", message: error.message } }, 502);
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    const pump = async () => {
        const reader = apiResponse.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let usage = null;

        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: "start" })}\n\n`));

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
                    if (!data || data === "[DONE]") continue;

                    try {
                        const event = JSON.parse(data);
                        const text = event.choices?.[0]?.delta?.content;
                        if (event.usage) {
                            usage = event.usage;
                        }
                        if (text) {
                            await writer.write(encoder.encode(`data: ${JSON.stringify({ type: "chunk", text })}\n\n`));
                        }
                    } catch {
                        // skip malformed lines
                    }
                }
            }
        } finally {
            if (usage) {
                const cost = estimateUsageCost(context.env, model, usage);
                const totals = await recordUsageCost(context.env, cost);
                console.info(JSON.stringify({
                    type: "refine_usage",
                    ts: new Date().toISOString(),
                    model,
                    usage,
                    cost,
                    totals
                }));
            }
            await writer.write(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
            await writer.close();
        }
    };

    context.waitUntil(pump());

    return new Response(readable, {
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    });
}
