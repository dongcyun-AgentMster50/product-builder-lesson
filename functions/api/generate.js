import { clearSessionCookie, getConfig, json, readSession } from "./access/_shared.js";
import { enforceMonthlyBudget, estimateUsageCost, recordUsageCost } from "./_shared_ai.js";
import { streamGeminiAsOpenAI, resolveGeminiKey } from "./_gemini.js";
import { resolveProviderKey, maskKey } from "./_provider.js";

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
    const isCampaignSection = body?.campaignSection === true;
    const sectionPrompt = String(body?.sectionPrompt || "").trim();

    // 🔴 Q1 도시 가중치 시그널
    const cityTags = Array.isArray(body?.selectedCityProfileTags) ? body.selectedCityProfileTags : [];
    const cityContext = body?.selectedCityProfileContext || null;

    const citySignalBlock = cityTags.length > 0 ? [
        ``,
        `## 🔴 도시 가중치 신호 (Q1 사용자 선택 — 1순위 반영 필수)`,
        `선택된 카테고리: ${cityTags.join(", ")}`,
        cityContext ? `\n### 선택된 프로필 원문\n\`\`\`json\n${JSON.stringify(cityContext, null, 2)}\n\`\`\`` : "",
        ``,
        `**반영 규칙:**`,
        `- 위 카테고리들의 localized_statement에 포함된 로컬 앵커(구/역/도로/시설)를 페르소나·상황·가치에 **반드시 인용**`,
        `- 선택되지 않은 카테고리는 **언급 금지**`,
        `- evidence 중 confidence가 "Low"면 "참고로" 같은 약한 표현으로 처리`,
        `- 출력 시나리오 본문에 선택 태그 대응 문장 **최소 1개 이상** 등장해야 함`
    ].filter(Boolean).join("\n") : "";

    if (isCampaignSection && sectionPrompt) {
        const langInstruction = locale === "ko"
            ? "Write entirely in Korean. English may appear only for unavoidable proper nouns."
            : `Write entirely in ${locale}.`;

        return [
            `## Context`,
            `- Role: ${role}`,
            `- Country: ${country}${city ? ` / City: ${city}` : ""}`,
            `- Target Segment: ${segment || "(not specified)"}`,
            `- Devices: ${devices || "(none)"}`,
            `- Mission / Value Focus: ${mission || "Discover"}`,
            regionCtx ? `\n## Regional Data\n${regionCtx}\n` : "",
            citySignalBlock,
            `\n## Task`,
            sectionPrompt,
            ``,
            `IMPORTANT:`,
            `- ${langInstruction}`,
            `- Base the output on the selected scenario and provided context only. Do not invent unrelated scenario structures.`,
            `- Return JSON only. No markdown, no prose before or after the JSON.`,
            `- If a single object is needed, still wrap it in an array like [{...}].`
        ].filter(Boolean).join("\n");
    }

    // Selection Summary가 있으면 JSON 모드 (Part 5-A)
    if (selectionSummary && selectionSummary.selectedScenarios && selectionSummary.selectedScenarios.length > 0) {
        // primary 시나리오의 핵심 정보를 직접 프롬프트에 삽입
        const primary = selectionSummary.selectedScenarios.find(s => s.isPrimary) || selectionSummary.selectedScenarios[0];
        const primaryContext = primary ? [
            `\n## Selected Explore Scenario (변형의 출발점)`,
            `- Title: ${primary.title}`,
            `- Source: Explore ${primary.source}`,
            `- Article: ${primary.articleTitle}`,
            `- Values: ${(primary.valueTags || []).join(", ") || "N/A"}`,
            `- Devices: ${(primary.devices || []).join(", ") || "N/A"}`,
            primary.originalText ? `- Original: ${primary.originalText.substring(0, 500)}` : "",
            primary.analysis ? `- Analysis: ${primary.analysis.substring(0, 300)}` : "",
        ].filter(Boolean).join("\n") : "";

        return [
            "IMPORTANT: You MUST respond with a single valid JSON object. No markdown, no explanation, no commentary. Only JSON.",
            "",
            "## Selection Summary (내부 로직으로 결정됨 — 변경 금지)",
            JSON.stringify(selectionSummary, null, 2),
            primaryContext,
            "",
            regionCtx ? `## Live Regional Data\n${regionCtx}\n` : "",
            `## Context`,
            `- Role: ${role}`,
            `- Output Language: ${locale === "ko" ? "Korean-primary (한국어 90% 이상)" : "English-primary"}`,
            citySignalBlock,
            "",
            "## Task: Transform the selected Explore scenario into JSON",
            "",
            "위 Selected Explore Scenario를 바탕으로,",
            "시스템 프롬프트 Part 5-A의 JSON Schema에 맞춰 마케터용 + 일반 사용자용 변형 결과를 생성하세요.",
            "",
            "반드시 지켜야 할 규칙:",
            "1. 응답 전체가 하나의 valid JSON 객체여야 합니다 — { 로 시작하고 } 로 끝나야 합니다",
            "2. 마크다운 헤딩(##), 설명 텍스트, ```json 코드 펜스를 쓰지 마세요",
            "3. 한국어 90% 이상 (영어는 copyOptions의 en 필드만)",
            "4. 선택된 시나리오의 원본 내용(Original, Analysis)을 기반으로 변형 — 새로 창작 금지",
            "5. headline에 [Care], [Secure], [Save], [Play] 등 가치 태그를 포함",
            "6. copyOptions 최소 2개, channelStrategy 최소 2개, setupSteps 최소 3단계",
            "7. alternatives 최소 1개",
            "",
            "JSON 스키마 최상위 키: transformation, valueHighlights, localizedInsight, confidenceOrEvidence"
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
        citySignalBlock,
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

async function streamOpenAIResponse({ apiKey, systemPrompt, userMessage, model, maxTokens, jsonMode = false }) {
    const requestBody = {
        model,
        stream: true,
        stream_options: { include_usage: true },
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
        ]
    };

    // JSON 모드: OpenAI API에서 JSON 출력 강제
    if (jsonMode) {
        requestBody.response_format = { type: "json_object" };
    }

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

    const { provider, apiKey, source: keySource, modelHint } = resolveProviderKey(context);
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

    const userMessage = buildGeneratePrompt(body);
    const model = provider === "openai"
        ? String(context.env.OPENAI_MODEL || "gpt-4o").trim()
        : String(modelHint || context.env.GEMINI_MODEL || "gemini-2.5-flash").trim();
    const maxTokens = Number(context.env.OPENAI_MAX_TOKENS || 8000);

    // Selection Summary 존재 시 JSON 모드 활성화
    const sel = body?.selectionSummary;
    const jsonMode = body?.campaignSection === true
        ? true
        : !!(sel && sel.selectedScenarios && sel.selectedScenarios.length > 0);

    console.info(JSON.stringify({
        type: "generate_request",
        ts: new Date().toISOString(),
        provider,
        source: keySource,
        keyMask: maskKey(apiKey),
        model,
        jsonMode,
        locale: body?.locale || "ko",
        role: body?.role || "",
        country: body?.country || "",
        city: body?.city || "",
        missionBucket: body?.missionBucket || "",
        hasCitySignal: Array.isArray(body?.selectedCityProfileTags) && body.selectedCityProfileTags.length > 0
    }));

    let apiResponse;
    try {
        if (provider === "openai") {
            apiResponse = await streamOpenAIResponse({
                apiKey,
                systemPrompt,
                userMessage,
                model,
                maxTokens,
                jsonMode
            });
        } else if (provider === "gemini") {
            apiResponse = streamGeminiAsOpenAI({
                apiKey,
                model,
                maxTokens,
                jsonMode,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
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
