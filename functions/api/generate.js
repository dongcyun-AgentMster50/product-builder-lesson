import { clearSessionCookie, getConfig, json, readSession } from "./access/_shared.js";
import { enforceMonthlyBudget, estimateUsageCost, recordUsageCost } from "./_shared_ai.js";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

function buildGeneratePrompt(body) {
    const role = String(body?.role || "").trim();
    const country = String(body?.country || "").trim();
    const city = String(body?.city || "").trim();
    const segment = String(body?.segment || "").trim();
    const purpose = String(body?.purpose || "").trim();
    const devices = Array.isArray(body?.devices) ? body.devices.join(", ") : String(body?.devices || "");
    const groups = Array.isArray(body?.deviceGroups) ? body.deviceGroups.join(", ") : String(body?.deviceGroups || "");
    const tags = Array.isArray(body?.intentTags) ? body.intentTags.join(", ") : String(body?.intentTags || "");
    const mission = String(body?.missionBucket || "").trim();
    const locale = String(body?.locale || "ko").trim();
    const regionCtx = body?.regionInsight ? JSON.stringify(body.regionInsight, null, 2) : null;
    const selectionSummary = body?.selectionSummary || null;

    // Selection Summary가 있으면 JSON 모드 (Part 5-A)
    if (selectionSummary && selectionSummary.selectedScenarios && selectionSummary.selectedScenarios.length > 0) {
        return [
            "## Selection Summary (내부 로직으로 결정됨 — 변경 금지)",
            "```json",
            JSON.stringify(selectionSummary, null, 2),
            "```",
            "",
            regionCtx ? `## Live Regional Data\n\`\`\`json\n${regionCtx}\n\`\`\`\n` : "",
            `## Context`,
            `- Role: ${role}`,
            `- Output Language: ${locale === "ko" ? "Korean-primary (한국어 90% 이상)" : "English-primary"}`,
            "",
            "## Task: Transform the selected Explore scenario",
            "",
            "위 Selection Summary에서 선택된 Explore 시나리오를 바탕으로,",
            "시스템 프롬프트 Part 5-A의 JSON Schema에 맞춰 **마케터용 + 일반 사용자용** 변형 결과를 생성하세요.",
            "",
            "출력 규칙:",
            "1. 반드시 valid JSON만 출력 (마크다운, 설명, 코멘트 섞지 말 것)",
            "2. 한국어 90% 이상 (영어는 copyOptions의 en 필드와 sourceTrace만)",
            "3. 선택된 시나리오의 원본 내용을 기반으로 변형 — 새로 창작하지 말 것",
            "4. 입력된 지역/타깃/기기가 output 어디에 반영되었는지 명시적으로 보일 것",
            "5. 가치 태그(Care/Secure/Save/Play)를 headline과 valueHighlights에 반영할 것",
            "6. copyOptions 최소 2개, channelStrategy 최소 2개, setupSteps 최소 3단계",
            "7. alternatives 최소 1개 (기기를 덜 가진 사용자를 위한 대안)"
        ].filter(Boolean).join("\n");
    }

    // Selection Summary 없으면 기존 마크다운 모드 (Part 5-B Legacy)
    return [
        "## Input State",
        `- Q1. Role: ${role}`,
        `- Q2. Country: ${country}${city ? ` / City: ${city}` : ""}`,
        `- Q3. Target Segment: ${segment || "(not specified)"}`,
        `- Q3. Purpose: ${purpose || "(not specified)"}`,
        `- Devices: ${devices || "(none)"}`,
        `- Device Categories: ${groups || "(none)"}`,
        `- Explore Tags (intent): ${tags || "(none)"}`,
        `- Mission Bucket: ${mission || "Discover"}`,
        `- Output Language: ${locale === "ko" ? "Korean-primary (English for Section 04 marketing hooks)" : "English-primary"}`,
        regionCtx ? `\n## Live Regional Data\n\`\`\`json\n${regionCtx}\n\`\`\`` : "",
        "\n## Task",
        "Generate a Samsung SmartThings CX scenario following Part 5-B (Markdown Sections Mode) in the system prompt.",
        "Output sections (01) through (07) only. Then suggest next steps in natural language — do NOT mention section numbers like 10 or 11.",
        "IMPORTANT FORMAT RULES:",
        "- MARKDOWN HEADINGS: Each section title MUST use ## markdown heading. Example: '## (01) CX 시나리오 제목 및 요약'. Sub-sections use ### heading.",
        "- (01): title 1 line + summary 1 line ONLY. No '참조 시나리오', no '핵심 요약', no '우선 검토 이유'.",
        "- (02): NO labels like '① Pain Point', '② 기능/해결책', '③ 고객 Benefit'. Write as flowing story paragraphs.",
        "- (03): 3-4 sentences max. Regional data as footnotes only, not in body.",
        "- (04): Each copy option must include tone guide inline, not as separate section.",
        "- Citations: NEVER use [Source] tags. Use superscript numbers ¹²³ with footnote block at section end.",
        "- No [Assumption] tags.",
        "- Use --- (horizontal rule) between sections."
    ].filter(Boolean).join("\n");
}

async function streamOpenAIResponse({ apiKey, systemPrompt, userMessage, model, maxTokens }) {
    const requestBody = {
        model,
        stream: true,
        stream_options: { include_usage: true },
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
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

    const userMessage = buildGeneratePrompt(body);
    const model = String(context.env.OPENAI_MODEL || "gpt-5.4").trim();
    const maxTokens = Number(context.env.OPENAI_MAX_TOKENS || 8000);

    console.info(JSON.stringify({
        type: "generate_request",
        ts: new Date().toISOString(),
        model,
        locale: body?.locale || "ko",
        role: body?.role || "",
        country: body?.country || "",
        city: body?.city || "",
        missionBucket: body?.missionBucket || ""
    }));

    let apiResponse;
    try {
        apiResponse = await streamOpenAIResponse({ apiKey, systemPrompt, userMessage, model, maxTokens });
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
                    type: "generate_usage",
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
