import { clearSessionCookie, getConfig, json, readSession } from "./access/_shared.js";
import { enforceMonthlyBudget, estimateUsageCost, recordUsageCost } from "./_shared_ai.js";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const NUDGE_SYSTEM_PROMPT = `You are a Samsung SmartThings global marketing advisor.
Given a country, city, and marketing role, generate exactly 3 nudge cards in JSON format.

Output ONLY valid JSON — no markdown, no explanation:
{
  "situation": "One paragraph: what is happening RIGHT NOW in this city/market that affects the product category (housing trends, climate, lifestyle shifts, recent events). Be specific to the city, not generic.",
  "need": "One paragraph: what consumer need or pain point naturally arises from that situation. Frame it as an empathetic observation a local marketer would recognize.",
  "opportunity": "One paragraph: a concrete, actionable marketing opportunity for the given role. Include a specific tactic, not just a direction."
}

Rules:
- Be hyper-specific to the city. Never give advice that could apply to any city.
- Use the latest knowledge you have about this market.
- Write in the language matching the given locale code (e.g. "ko"=Korean, "de"=German, "fr"=French, "es"=Spanish, "pt"=Portuguese, "it"=Italian, "nl"=Dutch, "ar"=Arabic, "en"=English).
- Keep each field to 2-3 sentences max.`;

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

    const apiKey = String(context.env.OPENAI_API_KEY || "").trim();
    if (!apiKey) {
        return json({ ok: false, error: { code: "API_NOT_CONFIGURED", message: "OPENAI_API_KEY is not set." } }, 500);
    }

    const budgetBlocked = await enforceMonthlyBudget(context.env);
    if (budgetBlocked) return budgetBlocked;

    let body;
    try {
        body = await context.request.json();
    } catch {
        return json({ ok: false, error: { code: "BAD_REQUEST", message: "Invalid JSON body." } }, 400);
    }

    const country = String(body?.country || "").trim();
    const city = String(body?.city || "").trim();
    const role = String(body?.role || "retail").trim();
    const locale = String(body?.locale || "ko").trim();

    if (!country) {
        return json({ ok: false, error: { code: "MISSING_COUNTRY", message: "Country is required." } }, 400);
    }

    const marketLabel = city ? `${country} ${city}` : country;
    const roleName = role === "dotcom" ? "Digital/e-Commerce marketer"
        : role === "brand" ? "Brand marketer"
        : "Retail/in-store marketer";

    const userMessage = `Market: ${marketLabel}\nRole: ${roleName}\nLocale: ${locale}`;
    const model = "gpt-4o-mini";
    const maxTokens = 1000;

    console.info(JSON.stringify({
        type: "nudge_request",
        ts: new Date().toISOString(),
        model,
        country,
        city,
        role,
        locale
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
                stream: true,
                stream_options: { include_usage: true },
                max_tokens: maxTokens,
                messages: [
                    { role: "system", content: NUDGE_SYSTEM_PROMPT },
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

            await writer.write(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));

            if (usage) {
                const cost = estimateUsageCost(context.env, model, usage);
                await recordUsageCost(context.env, cost).catch(() => {});
            }
        } catch (error) {
            try {
                await writer.write(encoder.encode(`data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`));
            } catch { /* ignore */ }
        } finally {
            await writer.close().catch(() => {});
        }
    };

    pump();

    return new Response(readable, {
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-store",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    });
}
