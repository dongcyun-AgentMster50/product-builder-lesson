import { clearSessionCookie, getConfig, json, readSession } from "./access/_shared.js";
import { enforceMonthlyBudget, estimateUsageCost, recordUsageCost } from "./_shared_ai.js";
import { streamGeminiAsOpenAI, resolveGeminiKey } from "./_gemini.js";
import { resolveProviderKey, maskKey } from "./_provider.js";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// ─── v2 Mode-Aware 6-Section Prompt Builder (Part 5-C) ───────────────────
// 호출 조건: body.mode === 'cx' | 'copy'
// 출력: user message 최상단에 `## Output Mode: cx|copy` 헤더 (prompt.txt 트리거).
// 'copy' 모드는 city/devices/regionInsight/cityProfile 페이로드를 무시하고
// copyText/tone/categoryHint 만 사용. 'cx' 모드는 기존 페이로드 + citySignalBlock
// 그대로 (P4 에서 facet 1줄 요약으로 교체 예정).
function buildV2ModePrompt(body, mode) {
    const locale = String(body?.locale || "ko").trim();

    if (mode === "copy") {
        const copyText     = String(body?.copyText || "").trim();
        const tone         = String(body?.tone || "").trim();
        const categoryHint = String(body?.categoryHint || "").trim();
        return [
            "## Output Mode: copy",
            "",
            "## Input (Copy Consult)",
            `- 카피 원문 (필수): ${copyText || "(미입력)"}`,
            `- 톤 선호: ${tone || "(미선택 — Bold/Genuine/Playful 중 적합한 것을 추천 가능)"}`,
            `- 타겟 카테고리 힌트: ${categoryHint || "(미입력)"}`,
            "",
            "## Task",
            "Part 5-C 의 6섹션 A~F 형식으로만 응답하세요.",
            "Mode2 (Copy Consult) 규칙 준수 — 도시·기기 정보는 입력으로 들어와도 본문에서 절대 언급 금지.",
            "D 표는 Copy Options (5~7행, 컬럼: # / Headline (EN, ≤8 words) / 톤·포지셔닝 (KR, 1줄)).",
            "톤 다양성 최소 3가지 (정공법/위트/절제/감성/B2B 중), 원본 카피 핵심 단어 최소 2개 보존.",
            "11/13 섹션 풀스키마, JSON 코드 블록, ## 마크다운 헤딩 출력 금지.",
            `응답 언어: ${locale === "ko" ? "한국어 (D 표 Headline 컬럼만 영어)" : `${locale}-primary`}.`
        ].join("\n");
    }

    // mode === "cx"
    const role     = String(body?.role || "").trim();
    const country  = String(body?.country || "").trim();
    const city     = String(body?.city || "").trim();
    const segment  = String(body?.segment || "").trim();
    const purpose  = String(body?.purpose || "").trim();
    const devices  = Array.isArray(body?.devices) ? body.devices.join(", ") : String(body?.devices || "");
    const groups   = Array.isArray(body?.deviceGroups) ? body.deviceGroups.join(", ") : String(body?.deviceGroups || "");
    const mission  = String(body?.missionBucket || "").trim();
    const regionCtx = body?.regionInsight ? JSON.stringify(body.regionInsight, null, 2) : null;

    // citySignalBlock 은 v1 buildGeneratePrompt 와 동일 로직 (P4 에서 facet 요약으로 교체 예정)
    const cityTags = Array.isArray(body?.selectedCityProfileTags) ? body.selectedCityProfileTags : [];
    const cityContext = body?.selectedCityProfileContext || null;
    const cityFullProfile = body?.cityProfile || null;
    let effectiveCityTags = cityTags;
    let effectiveCityContext = cityContext;
    if (cityTags.length === 0 && cityFullProfile) {
        effectiveCityTags = ['climate', 'housing', 'family', 'daily_rhythm', 'safety',
            'energy', 'health', 'pets', 'mobility', 'events'].filter(k => cityFullProfile[k]);
        const fallbackCtx = {};
        for (const key of effectiveCityTags) {
            fallbackCtx[key] = {
                statement: cityFullProfile[key] || "",
                evidence: cityFullProfile.evidence_pack?.[key] || null
            };
        }
        effectiveCityContext = Object.keys(fallbackCtx).length > 0 ? fallbackCtx : null;
    }
    const citySignalBlock = effectiveCityTags.length > 0 ? [
        ``,
        `## 🔴 도시 가중치 신호 (Q1 사용자 선택 — 1순위 반영 필수)`,
        `선택된 카테고리: ${effectiveCityTags.join(", ")}`,
        effectiveCityContext ? `\n### 선택된 프로필 원문\n\`\`\`json\n${JSON.stringify(effectiveCityContext, null, 2)}\n\`\`\`` : "",
        ``,
        `**반영 규칙:** 위 카테고리의 로컬 앵커를 B/C 에서 인용. 선택되지 않은 카테고리 언급 금지.`
    ].filter(Boolean).join("\n") : "";

    return [
        "## Output Mode: cx",
        "",
        "## Input (CX Scenario)",
        `- Role: ${role || "(not specified)"}`,
        `- Country: ${country}${city ? ` / City: ${city}` : ""}`,
        `- Target Segment: ${segment || "(not specified)"}`,
        `- Purpose: ${purpose || "(not specified)"}`,
        `- Devices: ${devices || "(none)"}`,
        `- Device Categories: ${groups || "(none)"}`,
        `- Mission Bucket: ${mission || "Discover"}`,
        `- Output Language: ${locale === "ko" ? "Korean-primary" : `${locale}-primary`}`,
        regionCtx ? `\n## Live Regional Data\n\`\`\`json\n${regionCtx}\n\`\`\`` : "",
        citySignalBlock,
        "\n## Task",
        "Part 5-C 의 6섹션 A~F 형식으로만 응답하세요.",
        "Mode1 (CX Scenario) 규칙 준수 — 시나리오 2~3개 deep, 4대 가치 태그(Care/Play/Save/Secure) 중 1개 이상 C 에 명시.",
        "D 표는 Touchpoints (4~6행, 컬럼: # / Trigger / Action / 체감 가치).",
        "11/13 섹션 풀스키마, JSON 코드 블록, ## 마크다운 헤딩 출력 금지 (라벨은 **A.** 형식)."
    ].filter(Boolean).join("\n");
}

function buildGeneratePrompt(body) {
    // ─── v2 Mode-Aware 분기 (Part 5-C 트리거) ─────────────────────────────
    // body.mode === 'cx' | 'copy' 일 때만 발동. v1 (mode 미전달) 은 절대 진입 X.
    const mode = (body?.mode === "copy" || body?.mode === "cx") ? body.mode : null;
    if (mode) return buildV2ModePrompt(body, mode);
    // ─── 이하 v1 경로 — 한 줄도 변경 금지 ────────────────────────────────

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
    const cityFullProfile = body?.cityProfile || null;

    // 폴백: 태그 0개 + 전체 프로필 있으면 전체 프로필 사용
    let effectiveCityTags = cityTags;
    let effectiveCityContext = cityContext;
    if (cityTags.length === 0 && cityFullProfile) {
        effectiveCityTags = ['climate', 'housing', 'family', 'daily_rhythm', 'safety',
            'energy', 'health', 'pets', 'mobility', 'events'].filter(k => cityFullProfile[k]);
        const fallbackCtx = {};
        for (const key of effectiveCityTags) {
            fallbackCtx[key] = {
                statement: cityFullProfile[key] || "",
                evidence: cityFullProfile.evidence_pack?.[key] || null
            };
        }
        effectiveCityContext = Object.keys(fallbackCtx).length > 0 ? fallbackCtx : null;
    }

    const citySignalBlock = effectiveCityTags.length > 0 ? [
        ``,
        `## 🔴 도시 가중치 신호 (Q1 사용자 선택 — 1순위 반영 필수)`,
        `선택된 카테고리: ${effectiveCityTags.join(", ")}`,
        effectiveCityContext ? `\n### 선택된 프로필 원문\n\`\`\`json\n${JSON.stringify(effectiveCityContext, null, 2)}\n\`\`\`` : "",
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
    // 단, v2 mode-aware (cx/copy) 호출은 5-C 마크다운 출력이므로 JSON 모드 강제 X
    const v2Mode = (body?.mode === "copy" || body?.mode === "cx");
    const sel = body?.selectionSummary;
    const jsonMode = v2Mode
        ? false
        : (body?.campaignSection === true
            ? true
            : !!(sel && sel.selectedScenarios && sel.selectedScenarios.length > 0));

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
