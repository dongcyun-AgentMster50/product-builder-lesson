"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

loadLocalEnv(path.join(__dirname, ".env"));

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 8000);
const ROOT_DIR = __dirname;
const COOKIE_NAME = "scenario_agent_session";
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS || 1000 * 60 * 60 * 8);
const REGION_INSIGHT_TIMEOUT_MS = Number(process.env.REGION_INSIGHT_TIMEOUT_MS || 20000);
const REGION_INSIGHT_CACHE_TTL_MS = Number(process.env.REGION_INSIGHT_CACHE_TTL_MS || 1000 * 60 * 15);
const CITY_PROFILE_UPSTREAM_TIMEOUT_MS = Number(process.env.CITY_PROFILE_UPSTREAM_TIMEOUT_MS || 65000);
const CITY_PROFILE_UPSTREAM_MAX_ATTEMPTS = Number(process.env.CITY_PROFILE_UPSTREAM_MAX_ATTEMPTS || 2);
const MAX_FAILED_ATTEMPTS = Number(process.env.MAX_FAILED_ATTEMPTS || 3);
const LOCK_WINDOW_MS = Number(process.env.LOCK_WINDOW_MS || 1000 * 60);
const ACCESS_CODES_FILE = path.join(ROOT_DIR, "access-codes.json");
const FALLBACK_ACCESS_CODES = (process.env.ACCESS_CODES || "demo-access")
    .split(",")
    .map((code) => code.trim())
    .filter(Boolean);

const MIME_TYPES = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".md": "text/markdown; charset=utf-8",
    ".txt": "text/plain; charset=utf-8"
};

const sessions = new Map();
const attemptsByClient = new Map();
const regionInsightCache = new Map();

function loadLocalEnv(filePath) {
    try {
        if (!fs.existsSync(filePath)) return;
        const raw = fs.readFileSync(filePath, "utf8");
        const lines = raw.split(/\r?\n/);
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) continue;
            const idx = trimmed.indexOf("=");
            if (idx <= 0) continue;
            const key = trimmed.slice(0, idx).trim();
            let value = trimmed.slice(idx + 1).trim();
            if (!key || Object.prototype.hasOwnProperty.call(process.env, key)) continue;
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            process.env[key] = value;
        }
    } catch {
        // Ignore .env load errors and continue with current environment.
    }
}

const server = http.createServer(async (req, res) => {
    try {
        const requestUrl = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);
        const pathname = requestUrl.pathname;
        console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);

        if (pathname === "/api/access/verify" && req.method === "POST") {
            await handleVerify(req, res);
            return;
        }

        if (pathname === "/api/access/session" && req.method === "GET") {
            handleSession(req, res);
            return;
        }

        if (pathname === "/api/access/logout" && req.method === "POST") {
            handleLogout(req, res);
            return;
        }

        if (pathname === "/api/region-insight" && req.method === "GET") {
            await handleRegionInsight(req, res, requestUrl);
            return;
        }

        if (pathname === "/api/generate" && req.method === "POST") {
            await handleGenerate(req, res);
            return;
        }

        if (pathname === "/api/refine" && req.method === "POST") {
            await handleRefine(req, res);
            return;
        }

        if (pathname === "/api/nudge" && req.method === "POST") {
            await handleNudge(req, res);
            return;
        }

        if (pathname === "/api/city-profile" && (req.method === "GET" || req.method === "POST")) {
            await handleCityProfile(req, res);
            return;
        }

        if (req.method !== "GET" && req.method !== "HEAD") {
            sendJson(res, 405, {
                ok: false,
                error: {
                    code: "METHOD_NOT_ALLOWED",
                    message: "Method not allowed."
                }
            });
            return;
        }

        serveStatic(req, res);
    } catch (error) {
        console.error(error);
        sendJson(res, 500, {
            ok: false,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Unexpected server error."
            }
        });
    }
});

server.listen(PORT, HOST, () => {
    const activeAccessCodes = loadAccessCodes();
    console.log(`Scenario server listening on http://${HOST}:${PORT}`);
    console.log(`Access codes file: ${ACCESS_CODES_FILE}`);
    console.log(`Active access code count: ${activeAccessCodes.length}`);
});

async function handleVerify(req, res) {
    const activeAccessCodes = loadAccessCodes();
    const body = await readJsonBody(req);
    const clientKey = getClientKey(req, body?.clientSessionId);
    const attemptState = getAttemptState(clientKey);

    if (attemptState.lockedUntil > Date.now()) {
        const retryAfterSeconds = Math.max(1, Math.ceil((attemptState.lockedUntil - Date.now()) / 1000));
        sendJson(res, 429, {
            ok: false,
            error: {
                code: "ACCESS_LOCKED",
                message: "Too many failed attempts. Try again later."
            },
            retryAfterSeconds,
            lockedUntil: new Date(Date.now() + retryAfterSeconds * 1000).toISOString()
        });
        return;
    }

    const submittedCode = typeof body?.accessCode === "string" ? body.accessCode.trim() : "";

    if (!submittedCode || !activeAccessCodes.some((entry) => entry.code === submittedCode)) {
        registerFailedAttempt(clientKey);
        const currentState = getAttemptState(clientKey);
        const statusCode = currentState.lockedUntil > Date.now() ? 429 : 401;
        const remainingAttempts = Math.max(0, MAX_FAILED_ATTEMPTS - currentState.count);
        const retryAfterSeconds = currentState.lockedUntil > Date.now()
            ? Math.max(1, Math.ceil((currentState.lockedUntil - Date.now()) / 1000))
            : 0;
        sendJson(res, statusCode, {
            ok: false,
            error: {
                code: statusCode === 429 ? "ACCESS_LOCKED" : "INVALID_ACCESS_CODE",
                message: statusCode === 429
                    ? "Too many failed attempts. Try again later."
                    : "Invalid access code."
            },
            remainingAttempts,
            ...(statusCode === 429
                ? {
                    retryAfterSeconds,
                    lockedUntil: new Date(Date.now() + retryAfterSeconds * 1000).toISOString()
                }
                : {})
        });
        return;
    }

    attemptsByClient.delete(clientKey);

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    sessions.set(token, { authenticated: true, expiresAt });

    setSessionCookie(req, res, token, expiresAt);
    sendJson(res, 200, {
        ok: true,
        session: {
            authenticated: true,
            expiresAt: expiresAt.toISOString()
        }
    });
}

async function handleRegionInsight(req, res, requestUrl) {
    const authState = requireAuthenticatedSession(req, res);
    if (!authState.ok) return;

    const country = normalizeCountryParam(requestUrl.searchParams.get("country"));
    const city = String(requestUrl.searchParams.get("city") || "").trim();
    const locale = normalizeLocaleParam(requestUrl.searchParams.get("locale"));
    const role = normalizeRoleParam(requestUrl.searchParams.get("role"));
    const forceRefresh = requestUrl.searchParams.get("force") === "1";

    if (!country) {
        sendJson(res, 400, {
            ok: false,
            error: {
                code: "INVALID_COUNTRY",
                message: "A valid country code is required."
            }
        });
        return;
    }

    const cacheKey = `${country}|${city.toLowerCase()}|${locale}|${role}`;
    const now = Date.now();
    const cached = regionInsightCache.get(cacheKey);
    if (!forceRefresh && cached && cached.expiresAt > now) {
        sendJson(res, 200, {
            ok: true,
            data: {
                ...cached.data,
                meta: {
                    ...cached.data.meta,
                    cache_hit: true,
                    generated_at_utc: new Date().toISOString()
                }
            }
        });
        return;
    }

    const startedAt = Date.now();
    console.log(`[RegionInsight] country=${country}, city="${city}", locale=${locale}, role=${role}, force=${forceRefresh}`);

    try {
        const liveInsight = await buildLiveRegionInsight({ country, city, locale, role });
        const payload = {
            role: liveInsight.role,
            role_lens: liveInsight.role_lens,
            macro: liveInsight.macro,
            local: liveInsight.local,
            evidence: liveInsight.evidence,
            visual: liveInsight.visual,
            live_trends: liveInsight.live_trends || [],
            live_events: liveInsight.live_events || [],
            live_pains: liveInsight.live_pains || [],
            live_solutions: liveInsight.live_solutions || [],
            _live_status: liveInsight._live_status || "fallback",
            meta: {
                query_country: country,
                query_city: city,
                query_role: role,
                latency_ms: Date.now() - startedAt,
                cache_hit: false,
                generated_at_utc: new Date().toISOString()
            }
        };

        regionInsightCache.set(cacheKey, {
            data: payload,
            expiresAt: Date.now() + REGION_INSIGHT_CACHE_TTL_MS
        });
        sendJson(res, 200, { ok: true, data: payload });
    } catch (error) {
        const statusCode = error?.code === "REGION_INSIGHT_TIMEOUT" ? 504 : 502;
        sendJson(res, statusCode, {
            ok: false,
            error: {
                code: error?.code || "REGION_INSIGHT_UNAVAILABLE",
                message: error?.message || "Failed to resolve live region insight."
            },
            meta: {
                query_country: country,
                query_city: city,
                query_role: role,
                latency_ms: Date.now() - startedAt,
                generated_at_utc: new Date().toISOString()
            }
        });
    }
}

// ─── AI streaming helpers ─────────────────────────────────────────────────────

const https = require("https");

const SYSTEM_PROMPT_PATH = path.join(ROOT_DIR, "prompt.txt");

/** Stream OpenAI (ChatGPT) API response. */
function callOpenAIStream({ systemPrompt, messages, apiKey, res, onDone, onError, model, max_tokens, jsonMode = false }) {
    if (!apiKey) {
        onError(new Error("OpenAI API key is required."));
        return;
    }

    const openaiMessages = [
        { role: "system", content: systemPrompt },
        ...messages
    ];

    const resolvedModel = model || process.env.OPENAI_MODEL || "gpt-4o";
    const resolvedMaxTokens = max_tokens || 8000;
    const requestBody = {
        model: resolvedModel,
        stream: true,
        messages: openaiMessages
    };

    // JSON 모드: OpenAI API에서 JSON 출력 강제
    if (jsonMode) {
        requestBody.response_format = { type: "json_object" };
    }

    if (/^gpt-5(\b|[-.])/i.test(resolvedModel)) {
        requestBody.max_completion_tokens = resolvedMaxTokens;
    } else {
        requestBody.max_tokens = resolvedMaxTokens;
    }

    const body = JSON.stringify(requestBody);

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "Content-Length": Buffer.byteLength(body)
        }
    };

    const req = https.request("https://api.openai.com/v1/chat/completions", options, (apiRes) => {
        if (apiRes.statusCode !== 200) {
            let errBody = "";
            apiRes.on("data", (chunk) => { errBody += chunk; });
            apiRes.on("end", () => {
                try {
                    const parsed = JSON.parse(errBody);
                    onError(new Error(parsed?.error?.message || `OpenAI API error ${apiRes.statusCode}`));
                } catch {
                    onError(new Error(`OpenAI API error ${apiRes.statusCode}`));
                }
            });
            return;
        }

        let buffer = "";
        apiRes.on("data", (chunk) => {
            buffer += chunk.toString();
            const lines = buffer.split("\n");
            buffer = lines.pop();

            for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const data = line.slice(6).trim();
                if (data === "[DONE]") {
                    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
                    onDone();
                    return;
                }
                try {
                    const event = JSON.parse(data);
                    const text = event.choices?.[0]?.delta?.content;
                    if (text) {
                        res.write(`data: ${JSON.stringify({ type: "chunk", text })}\n\n`);
                    }
                } catch { /* skip */ }
            }
        });

        apiRes.on("end", () => {
            res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
            onDone();
        });

        apiRes.on("error", onError);
    });

    req.on("error", onError);
    req.write(body);
    req.end();
}

/** Stream Anthropic Claude API response. */
function callClaudeStream({ systemPrompt, messages, apiKey, res, onDone, onError, model, max_tokens }) {
    if (!apiKey) {
        onError(new Error("Anthropic API key is required."));
        return;
    }

    const resolvedModel = model || process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514";
    const resolvedMaxTokens = max_tokens || 8000;

    const claudeMessages = messages.map((m) => ({
        role: m.role,
        content: m.content
    }));

    const requestBody = {
        model: resolvedModel,
        max_tokens: resolvedMaxTokens,
        stream: true,
        system: systemPrompt,
        messages: claudeMessages
    };

    const body = JSON.stringify(requestBody);

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "Content-Length": Buffer.byteLength(body)
        }
    };

    const req = https.request("https://api.anthropic.com/v1/messages", options, (apiRes) => {
        if (apiRes.statusCode !== 200) {
            let errBody = "";
            apiRes.on("data", (chunk) => { errBody += chunk; });
            apiRes.on("end", () => {
                try {
                    const parsed = JSON.parse(errBody);
                    onError(new Error(parsed?.error?.message || `Claude API error ${apiRes.statusCode}`));
                } catch {
                    onError(new Error(`Claude API error ${apiRes.statusCode}`));
                }
            });
            return;
        }

        let buffer = "";
        apiRes.on("data", (chunk) => {
            buffer += chunk.toString();
            const lines = buffer.split("\n");
            buffer = lines.pop();

            for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const data = line.slice(6).trim();
                if (!data) continue;
                try {
                    const event = JSON.parse(data);
                    if (event.type === "content_block_delta" && event.delta?.text) {
                        res.write(`data: ${JSON.stringify({ type: "chunk", text: event.delta.text })}\n\n`);
                    } else if (event.type === "message_stop") {
                        res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
                        onDone();
                        return;
                    }
                } catch { /* skip */ }
            }
        });

        apiRes.on("end", () => {
            res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
            onDone();
        });

        apiRes.on("error", onError);
    });

    req.on("error", onError);
    req.write(body);
    req.end();
}

/** Stream AI response — dispatch by provider. */
function callAIStream({ systemPrompt, messages, apiKey, res, onDone, onError, model, max_tokens, provider, jsonMode = false }) {
    if (provider === "claude") {
        return callClaudeStream({ systemPrompt, messages, apiKey, res, onDone, onError, model, max_tokens });
    }
    return callOpenAIStream({ systemPrompt, messages, apiKey, res, onDone, onError, model, max_tokens, jsonMode });
}

function sendSseHeaders(res) {
    res.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"
    });
}

async function handleGenerate(req, res) {
    const authState = requireAuthenticatedSession(req, res);
    if (!authState.ok) return;

    let body;
    try {
        body = await readJsonBody(req);
    } catch {
        sendJson(res, 400, { ok: false, error: { code: "BAD_REQUEST", message: "Invalid JSON body." } });
        return;
    }

    let systemPrompt;
    try {
        systemPrompt = fs.readFileSync(SYSTEM_PROMPT_PATH, "utf8");
    } catch {
        sendJson(res, 500, { ok: false, error: { code: "PROMPT_NOT_FOUND", message: "System prompt file not found." } });
        return;
    }

    const role       = String(body?.role || "").trim();
    const country    = String(body?.country || "").trim();
    const city       = String(body?.city || "").trim();
    const segment    = String(body?.segment || "").trim();
    const purpose    = String(body?.purpose || "").trim();
    const devices    = Array.isArray(body?.devices) ? body.devices.join(", ") : String(body?.devices || "");
    const groups     = Array.isArray(body?.deviceGroups) ? body.deviceGroups.join(", ") : String(body?.deviceGroups || "");
    const tags       = Array.isArray(body?.intentTags) ? body.intentTags.join(", ") : String(body?.intentTags || "");
    const mission    = String(body?.missionBucket || "").trim();
    const locale     = String(body?.locale || "ko").trim();
    const provider   = String(body?.provider || "openai").trim();
    const clientKey  = provider === "claude"
        ? String(body?.anthropicKey || process.env.ANTHROPIC_API_KEY || "").trim()
        : String(body?.apiKey || process.env.OPENAI_API_KEY || "").trim();
    const regionCtx  = body?.regionInsight ? JSON.stringify(body.regionInsight, null, 2) : null;
    const selectionSummary = body?.selectionSummary || null;
    const isCampaignSection = body?.campaignSection === true;
    const sectionPrompt = String(body?.sectionPrompt || "").trim();

    let userMessage;
    let jsonMode = false;

    // ─── Mode 1: Campaign Section (13-Section 개별 API 호출) ───
    if (isCampaignSection && sectionPrompt) {
        const langInstruction = locale === "ko"
            ? "반드시 한국어로 작성하세요 (전문 용어만 영어 병기 가능)."
            : "Write in English.";
        userMessage = [
            `## Context`,
            `- Role: ${role}`,
            `- Country: ${country}${city ? ` / City: ${city}` : ""}`,
            `- Target Segment: ${segment || "(not specified)"}`,
            `- Devices: ${devices || "(none)"}`,
            `- Mission / Value Focus: ${mission || "Discover"}`,
            regionCtx ? `\n## Regional Data\n${regionCtx}\n` : "",
            `\n## Task`,
            sectionPrompt,
            "",
            `IMPORTANT:`,
            `- ${langInstruction}`,
            `- 반드시 제공된 시나리오 원문(Original)에 기반하여 작성하세요. 원문에 없는 내용을 창작하지 마세요.`,
            `- 출력 형식: JSON 배열 (예: [{...}, {...}]). 마크다운이나 설명 텍스트는 포함하지 마세요.`,
            `- 배열이 아닌 단일 객체로 응답해야 하면 [{}] 형태로 감싸세요.`
        ].filter(Boolean).join("\n");

    // ─── Mode 2: Selection Summary JSON 모드 (Part 5-A) ───
    } else if (selectionSummary && selectionSummary.selectedScenarios && selectionSummary.selectedScenarios.length > 0) {
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

        userMessage = [
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
        jsonMode = true;
    } else {
        // ─── Mode 3: 기존 마크다운 레거시 모드 (Part 5-B) ───
        userMessage = [
            `## Input State`,
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
            `\n## Task`,
            `Generate a Samsung SmartThings CX scenario following Part 5-B (Markdown Sections Mode) in the system prompt.`,
            `Output sections (01) through (07) only. Then suggest next steps in natural language — do NOT mention section numbers like 10 or 11.`,
            `IMPORTANT FORMAT RULES:`,
            `- MARKDOWN HEADINGS: Each section title MUST use ## markdown heading.`,
            `- Citations: NEVER use [Source] tags. Use superscript numbers ¹²³ with footnote block at section end.`,
            `- Use --- (horizontal rule) between sections.`
        ].filter(Boolean).join("\n");
    }

    sendSseHeaders(res);
    res.write(`data: ${JSON.stringify({ type: "start" })}\n\n`);

    let done = false;
    callAIStream({
        systemPrompt,
        apiKey: clientKey,
        provider,
        jsonMode,
        messages: [{ role: "user", content: userMessage }],
        res,
        onDone: () => { if (!done) { done = true; res.end(); } },
        onError: (err) => {
            console.error("generate error:", err.message);
            if (!done) {
                done = true;
                try {
                    res.write(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`);
                } catch { /* ignore if already closed */ }
                res.end();
            }
        }
    });
}

async function handleRefine(req, res) {
    const authState = requireAuthenticatedSession(req, res);
    if (!authState.ok) return;

    let body;
    try {
        body = await readJsonBody(req);
    } catch {
        sendJson(res, 400, { ok: false, error: { code: "BAD_REQUEST", message: "Invalid JSON body." } });
        return;
    }

    let systemPrompt;
    try {
        systemPrompt = fs.readFileSync(SYSTEM_PROMPT_PATH, "utf8");
    } catch {
        sendJson(res, 500, { ok: false, error: { code: "PROMPT_NOT_FOUND", message: "System prompt file not found." } });
        return;
    }

    const previousOutput    = String(body?.previousOutput || "").trim();
    const refinementRequest = String(body?.refinementRequest || "").trim();
    const context           = body?.context || {};
    const provider          = String(body?.provider || "openai").trim();
    const clientKey         = provider === "claude"
        ? String(body?.anthropicKey || process.env.ANTHROPIC_API_KEY || "").trim()
        : String(body?.apiKey || process.env.OPENAI_API_KEY || "").trim();

    if (!refinementRequest) {
        sendJson(res, 400, { ok: false, error: { code: "MISSING_REQUEST", message: "refinementRequest is required." } });
        return;
    }

    const assistantMessage = previousOutput
        ? { role: "assistant", content: previousOutput }
        : null;

    const userMessage = [
        assistantMessage ? null : `## Context\n${JSON.stringify(context, null, 2)}`,
        `## Refinement Request`,
        refinementRequest,
        `\n(Respond only to the specific request above. Update or expand the relevant section only. Re-run the Section 11 Reflection Check if structural changes are made.)`
    ].filter(Boolean).join("\n");

    const messages = assistantMessage
        ? [
            { role: "user", content: `Generate initial scenario for: ${JSON.stringify(context)}` },
            assistantMessage,
            { role: "user", content: userMessage }
          ]
        : [{ role: "user", content: userMessage }];

    sendSseHeaders(res);
    res.write(`data: ${JSON.stringify({ type: "start" })}\n\n`);

    let done = false;
    callAIStream({
        systemPrompt,
        apiKey: clientKey,
        provider,
        messages,
        res,
        onDone: () => { if (!done) { done = true; res.end(); } },
        onError: (err) => {
            console.error("refine error:", err.message);
            if (!done) {
                done = true;
                try {
                    res.write(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`);
                } catch { /* ignore */ }
                res.end();
            }
        }
    });
}

// ─── Real-time nudge via GPT-4o-mini ─────────────────────────────────────────

const NUDGE_SYSTEM_PROMPT = `You are a Samsung SmartThings global marketing advisor.
Given a country, city, and marketing role, generate exactly 3 nudge fields in JSON format.

Output ONLY valid JSON — no markdown, no explanation:
{
  "situation": "What is happening RIGHT NOW in this specific city that affects the product category.",
  "need": "What consumer need or pain point naturally arises from that situation.",
  "opportunity": "A concrete, actionable marketing opportunity for the given role."
}

═══ HARD RULES ═══
1. EVERY field MUST contain at least one LOCAL ANCHOR (district, station, facility, event, road, statistic, or policy name specific to this city).
   ❌ "The city is experiencing rapid urbanization." → no anchor, fits any city.
   ✅ "동두천 지행·보산동 일대 미군기지 반환 부지 개발이 본격화되며 신규 주거 수요가 형성 중이다."

2. NO GENERIC STATEMENTS. Test: could this sentence apply to 3+ other cities if you removed the city name? If yes → rewrite with specific anchors.
   ❌ "Young families are increasingly interested in smart home technology."
   ✅ "소요동·송내동 신축 아파트 단지 입주 가구 중 맞벌이 비율이 높아 부재 시 돌봄 자동화 수요가 집중된다."

3. If you lack city-specific knowledge for any field, write what you DO know with anchors and add "[근거 보강 필요]" or "[Evidence needs reinforcement]" at the end. Never fill gaps with generic filler.

4. Write in the language matching the locale code (ko=Korean, en=English, de=German, fr=French, es=Spanish, pt=Portuguese, it=Italian, nl=Dutch, ar=Arabic).

5. Keep each field to 2-3 sentences max. Every sentence must earn its place with a local anchor.`;

async function handleNudge(req, res) {
    const authState = requireAuthenticatedSession(req, res);
    if (!authState.ok) return;

    let body;
    try {
        body = await readJsonBody(req);
    } catch {
        sendJson(res, 400, { ok: false, error: { code: "BAD_REQUEST", message: "Invalid JSON body." } });
        return;
    }

    const country   = String(body?.country || "").trim();
    const city      = String(body?.city || "").trim();
    const role      = String(body?.role || "retail").trim();
    const locale    = String(body?.locale || "ko").trim();
    const clientKey = String(body?.apiKey || process.env.OPENAI_API_KEY || "").trim();

    if (!country) {
        sendJson(res, 400, { ok: false, error: { code: "MISSING_COUNTRY", message: "Country is required." } });
        return;
    }

    const marketLabel = city ? `${country} ${city}` : country;
    const roleName = role === "dotcom" ? "Digital/e-Commerce marketer"
        : role === "brand" ? "Brand marketer"
        : "Retail/in-store marketer";

    const userMessage = `Market: ${marketLabel}\nRole: ${roleName}\nLocale: ${locale}`;

    sendSseHeaders(res);
    res.write(`data: ${JSON.stringify({ type: "start" })}\n\n`);

    let done = false;
    callAIStream({
        systemPrompt: NUDGE_SYSTEM_PROMPT,
        apiKey: clientKey,
        model: "gpt-4o-mini",
        max_tokens: 1000,
        messages: [{ role: "user", content: userMessage }],
        res,
        onDone: () => { if (!done) { done = true; res.end(); } },
        onError: (err) => {
            console.error("nudge error:", err.message);
            if (!done) {
                done = true;
                try {
                    res.write(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`);
                } catch { /* ignore */ }
                res.end();
            }
        }
    });
}

// ─── Session helpers ──────────────────────────────────────────────────────────

function handleSession(req, res) {
    const cookies = parseCookies(req.headers.cookie || "");
    const token = cookies[COOKIE_NAME];
    const session = token ? sessions.get(token) : null;

    if (!session || session.expiresAt.getTime() <= Date.now()) {
        if (token) {
            sessions.delete(token);
            clearSessionCookie(req, res);
        }

        sendJson(res, 200, {
            ok: false,
            session: {
                authenticated: false
            }
        });
        return;
    }

    sendJson(res, 200, {
        ok: true,
        session: {
            authenticated: true,
            expiresAt: session.expiresAt.toISOString()
        }
    });
}

function requireAuthenticatedSession(req, res) {
    const cookies = parseCookies(req.headers.cookie || "");
    const token = cookies[COOKIE_NAME];
    const session = token ? sessions.get(token) : null;

    if (!session || session.expiresAt.getTime() <= Date.now()) {
        if (token) {
            sessions.delete(token);
            clearSessionCookie(req, res);
        }
        sendJson(res, 401, {
            ok: false,
            error: {
                code: "UNAUTHORIZED",
                message: "Authentication required."
            }
        });
        return { ok: false };
    }

    return { ok: true, session };
}

function handleLogout(req, res) {
    const cookies = parseCookies(req.headers.cookie || "");
    const token = cookies[COOKIE_NAME];
    if (token) {
        sessions.delete(token);
    }

    clearSessionCookie(req, res);
    sendJson(res, 200, {
        ok: true,
        session: {
            authenticated: false
        }
    });
}

function serveStatic(req, res) {
    const requestPath = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`).pathname;
    const relativePath = requestPath === "/" ? "/index.html" : requestPath;
    const safePath = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, "");
    const absolutePath = path.join(ROOT_DIR, safePath);

    if (!absolutePath.startsWith(ROOT_DIR)) {
        sendJson(res, 403, {
            ok: false,
            error: {
                code: "FORBIDDEN",
                message: "Forbidden."
            }
        });
        return;
    }

    fs.stat(absolutePath, (statError, stats) => {
        if (statError || !stats.isFile()) {
            sendJson(res, 404, {
                ok: false,
                error: {
                    code: "NOT_FOUND",
                    message: "File not found."
                }
            });
            return;
        }

        const extension = path.extname(absolutePath).toLowerCase();
        res.writeHead(200, {
            "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
            "Cache-Control": "no-store"
        });

        if (req.method === "HEAD") {
            res.end();
            return;
        }

        fs.createReadStream(absolutePath).pipe(res);
    });
}

function setSessionCookie(req, res, token, expiresAt) {
    const parts = [
        `${COOKIE_NAME}=${token}`,
        "Path=/",
        "HttpOnly",
        "SameSite=Lax",
        `Max-Age=${Math.floor((expiresAt.getTime() - Date.now()) / 1000)}`
    ];

    const isSecureRequest = req.socket.encrypted || req.headers["x-forwarded-proto"] === "https";
    if (process.env.COOKIE_SECURE === "true" || isSecureRequest) {
        parts.push("Secure");
    }

    res.setHeader("Set-Cookie", parts.join("; "));
}

function loadAccessCodes() {
    // 1. 환경변수 ACCESS_CODES 우선 (쉼표 구분)
    if (process.env.ACCESS_CODES) {
        const envCodes = process.env.ACCESS_CODES.split(",").map(c => c.trim()).filter(Boolean);
        if (envCodes.length > 0) {
            return envCodes.map(code => ({ code, enabled: true, expiresAt: null, note: "env" }));
        }
    }

    // 2. 로컬 파일 fallback (개발용 — .gitignore에 포함, 레포에 커밋하지 않음)
    try {
        const raw = fs.readFileSync(ACCESS_CODES_FILE, "utf8");
        const payload = JSON.parse(raw);

        if (!Array.isArray(payload.accessCodes)) {
            throw new Error("accessCodes must be an array.");
        }

        const codes = payload.accessCodes
            .map(normalizeAccessCodeEntry)
            .filter(Boolean)
            .filter((entry) => entry.enabled !== false)
            .filter((entry) => !entry.expiresAt || Number.isFinite(entry.expiresAt.getTime()) && entry.expiresAt.getTime() > Date.now());

        return codes.length > 0
            ? codes
            : FALLBACK_ACCESS_CODES.map((code) => ({ code, enabled: true, expiresAt: null, note: "" }));
    } catch (error) {
        console.warn(`[access] No ACCESS_CODES env and ${ACCESS_CODES_FILE} unavailable. Using fallback.`, error.message);
        return FALLBACK_ACCESS_CODES.map((code) => ({ code, enabled: true, expiresAt: null, note: "" }));
    }
}

function normalizeAccessCodeEntry(entry) {
    if (typeof entry === "string") {
        const code = entry.trim();
        return code ? { code, enabled: true, expiresAt: null, note: "" } : null;
    }

    if (!entry || typeof entry !== "object") {
        return null;
    }

    const code = String(entry.code || "").trim();
    if (!code) return null;

    const expiresAt = entry.expiresAt ? new Date(entry.expiresAt) : null;

    return {
        code,
        enabled: entry.enabled !== false,
        expiresAt,
        note: entry.note ? String(entry.note) : ""
    };
}

function clearSessionCookie(req, res) {
    const parts = [
        `${COOKIE_NAME}=`,
        "Path=/",
        "HttpOnly",
        "SameSite=Lax",
        "Max-Age=0"
    ];

    const isSecureRequest = req.socket.encrypted || req.headers["x-forwarded-proto"] === "https";
    if (process.env.COOKIE_SECURE === "true" || isSecureRequest) {
        parts.push("Secure");
    }

    res.setHeader("Set-Cookie", parts.join("; "));
}

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
    });
    res.end(JSON.stringify(payload));
}

function parseCookies(header) {
    return header.split(";").reduce((cookies, item) => {
        const [name, ...rest] = item.trim().split("=");
        if (!name) return cookies;
        cookies[name] = rest.join("=");
        return cookies;
    }, {});
}

function getClientKey(req, clientSessionId = "") {
    const normalizedClientSessionId = typeof clientSessionId === "string" ? clientSessionId.trim() : "";
    if (normalizedClientSessionId) {
        return `session:${normalizedClientSessionId}`;
    }

    return req.socket.remoteAddress || "local";
}

function getAttemptState(clientKey) {
    const entry = attemptsByClient.get(clientKey);
    if (!entry) {
        return { count: 0, lockedUntil: 0, firstFailedAt: 0 };
    }

    if (entry.lockedUntil > 0 && entry.lockedUntil <= Date.now()) {
        attemptsByClient.delete(clientKey);
        return { count: 0, lockedUntil: 0, firstFailedAt: 0 };
    }

    if (entry.firstFailedAt > 0 && Date.now() - entry.firstFailedAt > LOCK_WINDOW_MS) {
        attemptsByClient.delete(clientKey);
        return { count: 0, lockedUntil: 0, firstFailedAt: 0 };
    }

    return entry;
}

function registerFailedAttempt(clientKey) {
    const current = getAttemptState(clientKey);
    const nextCount = current.count + 1;
    const firstFailedAt = current.firstFailedAt || Date.now();
    const lockedUntil = nextCount >= MAX_FAILED_ATTEMPTS ? Date.now() + LOCK_WINDOW_MS : 0;

    attemptsByClient.set(clientKey, {
        count: nextCount,
        firstFailedAt,
        lockedUntil
    });
}

function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let raw = "";

        req.on("data", (chunk) => {
            raw += chunk;
            if (raw.length > 1024 * 64) {
                reject(new Error("Request body too large."));
            }
        });

        req.on("end", () => {
            if (!raw) {
                resolve({});
                return;
            }

            try {
                resolve(JSON.parse(raw));
            } catch (error) {
                reject(error);
            }
        });

        req.on("error", reject);
    });
}

function normalizeCountryParam(value) {
    const normalized = String(value || "").trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(normalized)) return "";
    return normalized;
}

function normalizeLocaleParam(value) {
    const normalized = String(value || "").trim().toLowerCase();
    const supported = ["ko", "en", "de", "fr", "es", "pt", "it", "nl", "ar"];
    for (const loc of supported) {
        if (normalized.startsWith(loc)) return loc;
    }
    return "en";
}

function normalizeRoleParam(value) {
    const normalized = String(value || "").trim().toLowerCase();
    if (normalized === "retail" || normalized === "dotcom" || normalized === "brand") return normalized;
    return "retail";
}

function withTimeout(promiseFactory, timeoutMs) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(Object.assign(new Error("Live region insight request timed out."), { code: "REGION_INSIGHT_TIMEOUT" }));
        }, timeoutMs);

        Promise.resolve()
            .then(promiseFactory)
            .then((value) => {
                clearTimeout(timer);
                resolve(value);
            })
            .catch((error) => {
                clearTimeout(timer);
                reject(error);
        });
    });
}

function normalizeLooseText(value) {
    return String(value || "").trim().replace(/\s+/g, " ");
}

function isWithinUpcomingWindow(dateText, windowDays = 92) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateText || ""))) return false;
    const start = new Date(`${dateText}T00:00:00Z`);
    if (Number.isNaN(start.getTime())) return false;
    const today = new Date();
    const utcToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const diffDays = Math.floor((start.getTime() - utcToday.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= windowDays;
}

function sanitizeCityLiveContent(payload) {
    if (!payload || typeof payload !== "object") return null;

    const asList = (value, limit) => {
        const seen = new Set();
        return (Array.isArray(value) ? value : [])
            .map((item) => normalizeLooseText(item))
            .filter(Boolean)
            .filter((item) => {
                const key = item.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .slice(0, limit);
    };

    const liveEvents = (Array.isArray(payload.live_events) ? payload.live_events : [])
        .map((item) => ({
            name: normalizeLooseText(item?.name),
            when: normalizeLooseText(item?.when),
            hook: normalizeLooseText(item?.hook)
        }))
        .filter((item) => item.name && item.hook && isWithinUpcomingWindow(item.when))
        .slice(0, 3);

    // live_trends: 객체({text, evidence, source_*}) 또는 문자열 모두 지원
    const rawTrends = Array.isArray(payload.live_trends) ? payload.live_trends : [];
    const seen = new Set();
    const liveTrends = rawTrends
        .map((item) => {
            if (typeof item === "object" && item !== null) {
                return {
                    text: normalizeLooseText(item.text || item.trend || ""),
                    evidence: normalizeLooseText(item.evidence || item.source || ""),
                    source_title: normalizeLooseText(item.source_title || ""),
                    source_org: normalizeLooseText(item.source_org || ""),
                    source_date: normalizeLooseText(item.source_date || ""),
                    source_url: String(item.source_url || "").trim()
                };
            }
            return { text: normalizeLooseText(item), evidence: "", source_title: "", source_org: "", source_date: "", source_url: "" };
        })
        .filter((item) => {
            if (!item.text) return false;
            const key = item.text.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .slice(0, 4);

    // pains/solutions: 객체({text, insight}) 또는 문자열 모두 지원
    const asInsightList = (value, limit) => {
        const seen = new Set();
        return (Array.isArray(value) ? value : [])
            .map((item) => {
                if (typeof item === "object" && item !== null) {
                    const text = normalizeLooseText(item.text || "");
                    const insight = normalizeLooseText(item.insight || "");
                    return insight ? `${text}\n💡 ${insight}` : text;
                }
                return normalizeLooseText(item);
            })
            .filter(Boolean)
            .filter((item) => {
                const key = item.toLowerCase().slice(0, 40);
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .slice(0, limit);
    };

    return {
        live_trends: liveTrends,
        live_events: liveEvents,
        live_pains: asInsightList(payload.live_pains, 3),
        live_solutions: asInsightList(payload.live_solutions, 3)
    };
}

function pickBestGeocodeResult(results, cityQuery) {
    const list = Array.isArray(results) ? results : [];
    if (!list.length) return null;

    const normalizedQuery = normalizeLooseText(cityQuery).toLowerCase();
    const ranked = list
        .map((item) => {
            const name = normalizeLooseText(item?.name || item?.admin1 || item?.admin2 || "");
            const featureCode = String(item?.feature_code || "");
            let score = 0;
            if (name && normalizedQuery && name.toLowerCase() === normalizedQuery) score += 5;
            if (["PPLA", "PPLA2", "PPLA3", "PPLA4", "PPLC", "PPL", "PPLX"].includes(featureCode)) score += 4;
            if (String(item?.country_code || "").toUpperCase() === String(item?.country || "").toUpperCase()) score += 0;
            if (Number.isFinite(Number(item?.population)) && Number(item.population) > 0) score += 2;
            return { item, score };
        })
        .sort((a, b) => b.score - a.score);

    return ranked[0]?.score >= 4 ? ranked[0].item : ranked[0]?.item || null;
}

function pickBestNominatimCityResult(results, cityQuery) {
    const list = Array.isArray(results) ? results : [];
    if (!list.length) return null;

    const normalizedQuery = normalizeLooseText(cityQuery).toLowerCase();
    const ranked = list
        .map((item) => {
            const displayName = normalizeLooseText(item?.display_name);
            const name = normalizeLooseText(item?.name || item?.display_name?.split(",")[0] || "");
            const className = String(item?.class || "");
            const typeName = String(item?.type || "");
            let score = 0;
            if (name && normalizedQuery && name.toLowerCase() === normalizedQuery) score += 5;
            if (displayName.toLowerCase().startsWith(normalizedQuery)) score += 2;
            if (className === "place" && ["city", "town", "municipality", "administrative"].includes(typeName)) score += 5;
            if (className === "boundary" && ["administrative", "census"].includes(typeName)) score += 3;
            if (["station", "railway", "halt", "residential", "house", "building", "apartments"].includes(typeName)) score -= 8;
            return { item, score };
        })
        .sort((a, b) => b.score - a.score);

    return ranked[0]?.score >= 3 ? ranked[0].item : null;
}

function getNominatimDisplayName(item, fallbackCity) {
    const address = item?.address || {};
    return normalizeLooseText(
        address.city
        || address.town
        || address.municipality
        || address.county
        || item?.name
        || fallbackCity
    );
}

async function fetchJsonWithTimeout(url, options = {}) {
    return withTimeout(async () => {
        if (typeof fetch !== "function") {
            throw Object.assign(new Error("Global fetch is not available in this runtime."), { code: "REGION_INSIGHT_FETCH_UNAVAILABLE" });
        }

        const response = await fetch(url, options);
        if (!response.ok) {
            throw Object.assign(new Error(`Upstream request failed: ${response.status}`), { code: "REGION_INSIGHT_UPSTREAM_ERROR" });
        }
        return response.json();
    }, REGION_INSIGHT_TIMEOUT_MS);
}

async function fetchBinaryWithTimeout(url, options = {}) {
    return withTimeout(async () => {
        if (typeof fetch !== "function") {
            throw Object.assign(new Error("Global fetch is not available in this runtime."), { code: "REGION_INSIGHT_FETCH_UNAVAILABLE" });
        }

        const response = await fetch(url, options);
        if (!response.ok) {
            throw Object.assign(new Error(`Upstream request failed: ${response.status}`), { code: "REGION_INSIGHT_UPSTREAM_ERROR" });
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        return {
            contentType: response.headers.get("content-type") || "image/jpeg",
            dataUrl: `data:${response.headers.get("content-type") || "image/jpeg"};base64,${buffer.toString("base64")}`
        };
    }, REGION_INSIGHT_TIMEOUT_MS);
}

async function fetchCityLiveContent({ country, city, role, locale }) {
    const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
    if (!apiKey || !city) return null;

    const localeMap = { ko: "Korean", en: "English", de: "German", fr: "French", es: "Spanish", pt: "Portuguese", it: "Italian", nl: "Dutch", ar: "Arabic" };
    const lang = localeMap[locale] || "English";
    const todayIso = new Date().toISOString().slice(0, 10);

    const instructions = `You are a Samsung SmartThings consumer insight analyst. Use web search to find REAL, CURRENT data about the requested city. Return ONLY valid JSON. Write in ${lang}.

IMPORTANT: You are NOT looking for macro policy or government statistics. You are looking for EVERYDAY LIFE PROBLEMS that real residents of this city face — problems that smart home devices can actually solve.

Your analysis framework — find trends that answer "Why would a regular person in ${city} WANT smart home devices?":
1. 기후 불편 (too hot/cold/humid/dusty → need auto climate control at home)
2. 주거 불만 (small apartment noise, old house insulation, new apartment IoT-ready but unused)
3. 가족 걱정 (kid comes home alone, elderly parent lives alone, pet alone all day)
4. 바쁜 일상 (long commute = empty home, both parents work = no time for chores)
5. 안전 불안 (package theft, break-in worry, dark hallway at night)
6. 전기요금 부담 (high bills in summer/winter, wasted standby power)
7. 건강 민감 (allergies, fine dust, poor sleep, indoor air quality worry)
8. 반려동물 (pet alone at home → temperature/feeding/monitoring needs)
9. 잦은 외출 (business trips, weekend getaways → empty home management)
10. 시즌 생활 (back-to-school routines, holiday hosting, seasonal cleaning)

Flow: Everyday life friction → "I wish my home could..." → SmartThings solves this`;

    const input = `${city} (${country}), ${todayIso}, ${role} marketer, ${lang}.

Search for real consumer frustrations in ${city} that smart home devices solve. Focus on daily life problems, NOT government policy or industry stats.

Return ONLY valid JSON (no markdown, no \`\`\`):
{"live_trends":[{"text":"daily frustration","category":"climate|housing|family|routine|security|energy|wellness|pet|mobility|events","evidence":"2-3 sentences with numbers","source_title":"title","source_org":"org","source_url":"URL"}],"live_events":[{"name":"event","when":"YYYY-MM-DD","hook":"angle"}],"live_pains":[{"text":"first-person frustration","insight":"which SmartThings device solves this"}],"live_solutions":[{"text":"[segment]+[devices]→[Explore keyword]","insight":"execution hint"}]}

- live_trends: 4, different categories, consumer problems only. Real URLs.
- live_events: 2-3 upcoming (after ${todayIso}). live_pains: 3. live_solutions: 3.
- No past events, no policy trends. ${lang} output.`;

    try {
        const response = await withTimeout(async () => {
            const res = await fetch("https://api.openai.com/v1/responses", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model: "gpt-4o",
                    tools: [{ type: "web_search_preview" }],
                    instructions,
                    input
                })
            });
            if (!res.ok) throw new Error(`OpenAI Responses API ${res.status}`);
            return res.json();
        }, 40000);

        // Responses API 출력 파싱
        const messageItem = (response?.output || []).find((item) => item.type === "message");
        const textContent = (messageItem?.content || []).find((c) => c.type === "output_text");
        const rawText = textContent?.text || "";

        // GPT 응답에 ```json 마크다운 + [text](url) 인라인 링크 포함 가능 → 정리
        const cleanText = rawText
            .replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "")
            .replace(/\[([^\]]*)\]\(([^)]*)\)/g, "$1")
            .trim();
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;
        let parsed;
        try { parsed = JSON.parse(jsonMatch[0]); } catch {
            let fixed = jsonMatch[0].replace(/,\s*$/, "");
            const ob = (fixed.match(/\{/g) || []).length - (fixed.match(/\}/g) || []).length;
            const oq = (fixed.match(/\[/g) || []).length - (fixed.match(/\]/g) || []).length;
            fixed += "]".repeat(Math.max(0, oq)) + "}".repeat(Math.max(0, ob));
            try { parsed = JSON.parse(fixed); } catch { return null; }
        }
        const sanitized = sanitizeCityLiveContent(parsed);
        if (!sanitized) return null;
        if (!sanitized.live_trends.length && !sanitized.live_events.length) {
            return null;
        }
        return sanitized;
    } catch (err) {
        console.error("[CityLiveContent] AI fetch failed:", err.message);
        return null;
    }
}

async function buildLiveRegionInsight({ country, city, locale, role }) {
    const cityQuery = city || country;

    // geocode + 모든 데이터 소스 + GPT 웹검색을 전부 병렬 실행
    const sources = [
        fetchOpenMeteoGeocode(cityQuery, country),
        fetchWorldBankCountrySignals(country),
        fetchWorldBankUrbanSignals(country),
        fetchCountryProfile(country)
    ];
    if (city) {
        sources.push(fetchNominatimCitySignals(city, country));
    }

    console.log(`[buildLiveRegionInsight] Calling fetchCityLiveContent for city="${city}"`);
    const cityLivePromise = fetchCityLiveContent({ country, city, role, locale });

    const settled = await Promise.allSettled(sources.map((sourcePromise) => withTimeout(() => sourcePromise, REGION_INSIGHT_TIMEOUT_MS)));
    const fulfilled = settled.filter((entry) => entry.status === "fulfilled").map((entry) => entry.value);
    if (fulfilled.length === 0) {
        throw Object.assign(new Error("All live insight sources failed."), { code: "REGION_INSIGHT_ALL_SOURCES_FAILED" });
    }

    const geocode = fulfilled.find((item) => item.type === "openmeteo_geocode") || null;
    const lat = Number(geocode?.latitude || 0);
    const lon = Number(geocode?.longitude || 0);

    // geocode 결과로 날씨 추가 조회 (빠름, 직렬 OK)
    let climate = null;
    if (lat && lon) {
        try { climate = await withTimeout(() => fetchOpenMeteoSignals(lat, lon), REGION_INSIGHT_TIMEOUT_MS); } catch { /* 날씨 실패해도 진행 */ }
    }

    const worldBankMarket = fulfilled.find((item) => item.type === "worldbank_market");
    const worldBankUrban = fulfilled.find((item) => item.type === "worldbank_urban");
    const citySignal = fulfilled.find((item) => item.type === "nominatim_city");
    const countryProfile = fulfilled.find((item) => item.type === "country_profile");

    // AI 도시 콘텐츠 병렬 대기
    const cityLive = await cityLivePromise.catch((err) => {
        console.error(`[buildLiveRegionInsight] fetchCityLiveContent failed for city="${city}":`, err.message);
        return null;
    });
    console.log(`[buildLiveRegionInsight] cityLive result for "${city}":`, cityLive ? `trends=${(cityLive.live_trends||[]).length}, events=${(cityLive.live_events||[]).length}` : "null");

    const macro = buildMacroInsight({ country, city, locale, worldBankMarket, worldBankUrban, climate });
    const local = city
        ? buildLocalInsight({ city, locale, citySignal, climate, worldBankUrban })
        : null;
    const evidence = buildEvidence({ locale, worldBankMarket, worldBankUrban, climate, citySignal });

    return {
        role,
        role_lens: buildRoleLensInsight({ role, locale, country, city }),
        macro,
        local,
        evidence,
        visual: buildVisualInsight({ country, city, geocode, countryProfile, landmark: null }),
        live_trends: cityLive?.live_trends || [],
        live_events: cityLive?.live_events || [],
        live_pains: cityLive?.live_pains || [],
        live_solutions: cityLive?.live_solutions || [],
        _live_status: cityLive ? "ok" : "fallback"
    };
}

function buildRoleLensInsight({ role, locale, country, city }) {
    const marketLabel = city ? `${country} ${city}` : country;
    const isKo = locale === "ko";

    if (role === "dotcom") {
        return {
            pain_points: isKo
                ? [
                    `"상세페이지 문구를 어디서부터 써야 하죠?" — ${city || marketLabel} 유입 키워드와 랜딩 카피가 따로 놀아서 이탈률이 높은 상태`,
                    `"AI 기능 켜면 전기세 더 나와요?" — 에너지 절감/비용 체감 질문이 PDP 이탈의 주요 원인`,
                    `"경쟁사 대비 뭐가 나은지 한눈에 안 보여요" — 비교 근거 없이 스펙만 나열하면 첫 스크롤에서 이탈`
                ]
                : [
                    `"Where do I even start with PDP copy?" — search keywords and landing copy are misaligned, causing high bounce`,
                    `"Does the AI feature increase my electricity bill?" — cost/savings proof is the top conversion blocker`,
                    `"I can't see why this beats the competition" — spec-only listings lose visitors at the first scroll`
                ],
            solutions: isKo
                ? [
                    "유입 키워드 Top 3의 '문제 문장'을 H1에 그대로 반영 → 광고와 랜딩 약속 일치시키기",
                    "CTA 바로 위에 '월 ₩12,000 절감' 같은 체감 숫자 1개 배치 → 비용 질문 사전 차단",
                    "경쟁사 대비표를 첫 스크롤 안에 넣되, '일상 변화' 축으로 비교 → 스펙 비교 함정 탈출"
                ]
                : [
                    "Mirror the top 3 search-intent 'problem sentences' directly in H1 — align ad promise with landing",
                    "Place one tangible savings number (e.g. '$10/month saved') right above the CTA — preempt cost objections",
                    "Put a competitor comparison within first scroll, but frame it as 'life impact' not spec-vs-spec"
                ],
            primary_metric: isKo ? "CTR → PDP 체류 → 장바구니 전환" : "CTR → PDP dwell → add-to-cart",
            next_step: isKo
                ? "Q3에서 타겟 1명의 검색 상황을 고정하면, 헤드라인 초안이 바로 나옵니다."
                : "Lock one searcher profile in Q3 and the headline draft writes itself."
        };
    }

    if (role === "brand") {
        return {
            pain_points: isKo
                ? [
                    `"우리 브랜드 광고가 다 비슷비슷해 보여요" — ${city || marketLabel}에서 기능 나열만으로는 기억에 남지 않는 상태`,
                    `"SNS 영상 조회수는 나오는데 브랜드 회상이 안 돼요" — 감정 키워드 없이 콘텐츠만 소비되는 구조`,
                    `"글로벌 캠페인 카피를 로컬에 그대로 쓰면 어색해요" — 문화 맥락 번역 없이 직역하면 공감 손실`
                ]
                : [
                    `"All our brand ads look the same" — feature-listing alone is not memorable in ${city || marketLabel}`,
                    `"Views are up but no one remembers our brand" — content gets consumed without an emotional anchor`,
                    `"Global campaign copy feels off when localized" — direct translation without cultural context loses empathy`
                ],
            solutions: isKo
                ? [
                    "제품 스펙 대신 '이 사람의 하루가 어떻게 달라지는가' 한 장면으로 시작 → 기억 잔존율 확보",
                    "영상·소셜·배너에 동일 감정 키워드 1개를 관통시키기 → 채널 넘어 브랜드 회상 연결",
                    "글로벌 메시지의 '감정 핵심'만 추출하고, 로컬 생활 장면으로 재구성 → 어색함 없는 현지화"
                ]
                : [
                    "Start with 'how this person's day changes' instead of specs — one scene creates recall",
                    "Thread one emotional keyword through video/social/banner — link recall across channels",
                    "Extract the 'emotional core' of global copy, then rebuild with local life scenes — natural localization"
                ],
            primary_metric: isKo ? "브랜드 비보조 회상률 + 감정 연상 일치도" : "Unaided brand recall + emotional association match",
            next_step: isKo
                ? "Q3에서 타겟의 감정 키워드를 하나 고정하면, 스토리 톤이 바로 잡힙니다."
                : "Lock one emotional keyword for the target in Q3 and the story tone follows."
        };
    }

    // retail (default)
    return {
        pain_points: isKo
            ? [
                `"이 제품 왜 필요해요?" — ${city || marketLabel} 매장에서 고객이 가장 먼저 던지는 질문인데, 기능 설명으로는 답이 안 되는 상태`,
                `"AI 기능 켜면 전기세 더 나와요?" — 에너지 절감 체감이 구매 결정의 핵심 포인트인데 시연에 빠져 있음`,
                `"설치 복잡하지 않아요?" — 원스텝 셋업 시연이 30초 안에 끝나야 설득되는데, 현재 시연 흐름이 너무 김`
            ]
            : [
                `"Why do I need this?" — the first question in ${city || marketLabel} stores, and feature specs don't answer it`,
                `"Will the AI feature raise my power bill?" — energy savings proof is the purchase tipping point but missing from demos`,
                `"Is setup complicated?" — customers need to see one-step setup in under 30 seconds, but current demos run too long`
            ],
        solutions: isKo
            ? [
                "'왜 필요해요?' 질문엔 → \"퇴근하고 집에 들어오면 3초 만에 자동으로 켜집니다\" 한 장면 시연으로 대답",
                "전기세 질문엔 → 비포/애프터 숫자 1개 (\"월 약 ₩12,000 절감\") 시연 중 자연스럽게 언급",
                "설치 질문엔 → 박스 개봉~첫 작동까지 30초 타임랩스 시연 → \"이게 끝이에요\"로 클로징"
            ]
            : [
                "For 'Why do I need this?' → demo one scene: \"Walk in the door, everything turns on in 3 seconds\"",
                "For the power bill question → drop one before/after number (\"saves ~$10/month\") naturally during demo",
                "For setup worry → 30-second time-lapse from unbox to first run → close with \"That's it, you're done\""
            ],
        primary_metric: isKo ? "시연 완료율 → 상담 전환율" : "Demo completion → consultation conversion",
        next_step: isKo
            ? "Q3에서 타겟 고객 1명과 매장 상황을 고정하면, 시연 스크립트 초안이 바로 나옵니다."
            : "Lock one shopper type and store moment in Q3 — the demo script draft follows."
    };
}

async function fetchWorldBankCountrySignals(country) {
    const indicator = "NY.GDP.PCAP.CD";
    const url = `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?format=json&per_page=60`;
    const payload = await fetchJsonWithTimeout(url);
    const data = Array.isArray(payload?.[1]) ? payload[1] : [];
    const latest = data.find((entry) => Number.isFinite(entry?.value));
    return {
        type: "worldbank_market",
        indicator,
        value: latest?.value || null,
        year: latest?.date || null,
        source: "api.worldbank.org",
        url
    };
}

async function fetchWorldBankUrbanSignals(country) {
    const indicator = "SP.URB.TOTL.IN.ZS";
    const url = `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?format=json&per_page=60`;
    const payload = await fetchJsonWithTimeout(url);
    const data = Array.isArray(payload?.[1]) ? payload[1] : [];
    const latest = data.find((entry) => Number.isFinite(entry?.value));
    return {
        type: "worldbank_urban",
        indicator,
        value: latest?.value || null,
        year: latest?.date || null,
        source: "api.worldbank.org",
        url
    };
}

async function fetchOpenMeteoGeocode(cityQuery, country) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityQuery)}&count=8&language=en&countryCode=${country}&format=json`;
    const payload = await fetchJsonWithTimeout(url);
    const result = pickBestGeocodeResult(payload?.results, cityQuery);
    return result ? { type: "openmeteo_geocode", ...result } : { type: "openmeteo_geocode" };
}

async function fetchOpenMeteoSignals(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=UTC&forecast_days=7`;
    const payload = await fetchJsonWithTimeout(url);
    const maxList = payload?.daily?.temperature_2m_max || [];
    const minList = payload?.daily?.temperature_2m_min || [];
    const rainList = payload?.daily?.precipitation_sum || [];
    const avgMax = average(maxList);
    const avgMin = average(minList);
    const avgRain = average(rainList);
    return {
        type: "openmeteo",
        avgMax,
        avgMin,
        avgRain,
        source: "api.open-meteo.com",
        url
    };
}

async function fetchNominatimCitySignals(city, country) {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(city)}&countrycodes=${country.toLowerCase()}&addressdetails=1&limit=5`;
    const payload = await fetchJsonWithTimeout(url, {
        headers: {
            "User-Agent": "scenario-self-generation-agent/1.0 (+local)"
        }
    });
    const top = pickBestNominatimCityResult(payload, city);
    return {
        type: "nominatim_city",
        className: top?.class || "",
        typeName: top?.type || "",
        importance: Number(top?.importance || 0),
        displayName: getNominatimDisplayName(top, city),
        source: "nominatim.openstreetmap.org",
        url
    };
}

async function fetchCountryProfile(country) {
    const url = `https://restcountries.com/v3.1/alpha/${encodeURIComponent(country)}?fields=cca2,cca3,population,area,borders,latlng`;
    const payload = await fetchJsonWithTimeout(url);
    const item = Array.isArray(payload) ? payload[0] : payload;
    return {
        type: "country_profile",
        countryCode: item?.cca2 || country,
        countryCode3: item?.cca3 || "",
        population: Number(item?.population || 0),
        areaKm2: Number(item?.area || 0),
        borders: Array.isArray(item?.borders) ? item.borders : [],
        latlng: Array.isArray(item?.latlng) ? item.latlng : [],
        source: "restcountries.com"
    };
}

async function fetchCityImages(city, country) {
    const unsplashKey = String(process.env.UNSPLASH_API_KEY || process.env.UNSPLASH_ACCESS_KEY || "").trim();
    if (unsplashKey) {
        try {
            const cards = await fetchUnsplashCityImages(city, unsplashKey);
            if (cards.length) {
                return {
                    type: "city_landmark",
                    imageUrl: cards[0]?.imageUrl || "",
                    imageDataUrl: cards[0]?.imageDataUrl || cards[0]?.imageUrl || "",
                    imageUrls: cards.map((item) => item.imageUrl || ""),
                    imageDataUrls: cards.map((item) => item.imageDataUrl || item.imageUrl || ""),
                    cards,
                    source: "api.unsplash.com"
                };
            }
        } catch {
            // Fall back to wiki-based source.
        }
    }
    return fetchCityLandmarkImageFromWiki(city, country);
}

async function fetchUnsplashCityImages(city, accessKey) {
    const smartQueries = [
        { kind: "landmark", query: `${city} landmark` },
        { kind: "culture", query: `${city} street art` },
        { kind: "daily", query: `${city} cable car community` }
    ];
    const requests = smartQueries.map((item) => (
        searchUnsplashImage({ query: item.query, accessKey }).then((image) => image ? {
            kind: item.kind,
            title: image.title,
            imageUrl: image.imageUrl,
            imageDataUrl: image.imageUrl,
            width: image.width,
            height: image.height
        } : null)
    ));
    const settled = await Promise.allSettled(requests);
    const seen = new Set();
    const cards = [];
    for (const entry of settled) {
        if (entry.status !== "fulfilled" || !entry.value) continue;
        const key = String(entry.value.imageUrl || "");
        if (!key || seen.has(key)) continue;
        seen.add(key);
        cards.push(entry.value);
    }
    return cards.slice(0, 3);
}

async function searchUnsplashImage({ query, accessKey }) {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=8&orientation=landscape&content_filter=high`;
    const payload = await fetchJsonWithTimeout(url, {
        headers: {
            Authorization: `Client-ID ${accessKey}`,
            "Accept-Version": "v1",
            "User-Agent": "scenario-self-generation-agent/1.0 (+local)"
        }
    });
    const results = Array.isArray(payload?.results) ? payload.results : [];
    const picked = results.find((item) => {
        const desc = `${item?.alt_description || ""} ${item?.description || ""}`.toLowerCase();
        return !desc.includes("logo") && !desc.includes("icon") && !desc.includes("text");
    }) || results[0];
    if (!picked) return null;
    const title = String(picked.alt_description || picked.description || query).trim();
    return {
        title,
        imageUrl: picked?.urls?.regular || picked?.urls?.small || "",
        width: Number(picked?.width || 0),
        height: Number(picked?.height || 0)
    };
}

async function fetchCityLandmarkImageFromWiki(city, country) {
    const landmark = await findBestWikiImage({
        city,
        queries: [
            `${city} landmark`,
            `${city} skyline`,
            `${city} architecture`,
            `${city} famous buildings`,
            `${city} downtown`,
            `${city}, ${country}`
        ],
        scorer: scoreLandmarkCandidate
    });
    const culture = await findBestWikiImage({
        city,
        queries: [
            `${city} festival`,
            `${city} cultural event`,
            `${city} street fair`,
            `${city} parade`,
            `${city} culture`
        ],
        scorer: scoreCultureCandidate
    });

    const fallbackImage = buildFallbackPhotoDataUrl(city);
    const cards = [];
    if (landmark?.imageDataUrl) {
        cards.push({
            kind: "landmark",
            title: landmark.title || `${city} landmark`,
            imageUrl: landmark.imageUrl || "",
            imageDataUrl: landmark.imageDataUrl,
            width: Number(landmark.width || 0),
            height: Number(landmark.height || 0)
        });
    } else {
        cards.push({
            kind: "landmark",
            title: `${city} landmark`,
            imageUrl: "",
            imageDataUrl: fallbackImage,
            width: 960,
            height: 540
        });
    }
    if (culture?.imageDataUrl) {
        cards.push({
            kind: "culture",
            title: culture.title || `${city} cultural event`,
            imageUrl: culture.imageUrl || "",
            imageDataUrl: culture.imageDataUrl,
            width: Number(culture.width || 0),
            height: Number(culture.height || 0)
        });
    }

    return {
        type: "city_landmark",
        imageUrl: landmark?.imageUrl || "",
        imageDataUrl: cards[0]?.imageDataUrl || fallbackImage,
        imageUrls: cards.map((item) => item.imageUrl || ""),
        imageDataUrls: cards.map((item) => item.imageDataUrl),
        cards,
        source: "en.wikipedia.org"
    };
}

function scoreLandmarkCandidate({ city, title, imageUrl }) {
    const cityText = String(city || "").toLowerCase();
    const titleText = String(title || "").toLowerCase();
    const urlText = String(imageUrl || "").toLowerCase();

    if (!urlText) return -100;
    if (urlText.includes(".svg")) return -100;

    const strongReject = [
        "logo", "wordmark", "seal", "flag", "coat_of_arms", "icon", "emblem",
        "map", "locator", "diagram", "chart", "insignia", "organization",
        "conservancy", "department", "list_of", "history_of", "demographics_of"
    ];
    for (const token of strongReject) {
        if (titleText.includes(token) || urlText.includes(token)) return -80;
    }

    let score = 0;
    const strongPositive = [
        "tower", "building", "bridge", "cathedral", "palace", "museum", "opera",
        "skyscraper", "monument", "memorial", "gate", "plaza", "square", "castle",
        "skyline", "downtown", "cityscape", "park"
    ];
    for (const token of strongPositive) {
        if (titleText.includes(token) || urlText.includes(token)) score += 4;
    }

    if (cityText && (titleText.includes(cityText) || urlText.includes(cityText))) score += 2;
    if (urlText.includes(".jpg") || urlText.includes(".jpeg") || urlText.includes(".png")) score += 1;
    if (titleText.includes("landmark")) score += 2;

    return score;
}

function scoreCultureCandidate({ city, title, imageUrl }) {
    const cityText = String(city || "").toLowerCase();
    const titleText = String(title || "").toLowerCase();
    const urlText = String(imageUrl || "").toLowerCase();

    if (!urlText) return -100;
    if (urlText.includes(".svg")) return -100;

    const strongReject = [
        "logo", "wordmark", "seal", "flag", "coat_of_arms", "icon", "emblem",
        "map", "locator", "diagram", "chart", "insignia", "list_of", "timeline",
        "department", "organization", "demographics_of"
    ];
    for (const token of strongReject) {
        if (titleText.includes(token) || urlText.includes(token)) return -80;
    }

    let score = 0;
    const positive = [
        "festival", "parade", "carnival", "fair", "street", "market", "culture",
        "cultural", "music", "arts", "celebration", "night", "food", "event"
    ];
    for (const token of positive) {
        if (titleText.includes(token) || urlText.includes(token)) score += 4;
    }
    if (cityText && (titleText.includes(cityText) || urlText.includes(cityText))) score += 2;
    if (urlText.includes(".jpg") || urlText.includes(".jpeg") || urlText.includes(".png")) score += 1;

    return score;
}

async function findBestWikiImage({ city, queries, scorer }) {
    let bestCandidate = null;
    const queryList = Array.isArray(queries) ? queries : [];
    for (const query of queryList) {
        try {
            const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=10&format=json`;
            const searchPayload = await fetchJsonWithTimeout(searchUrl, {
                headers: {
                    "User-Agent": "scenario-self-generation-agent/1.0 (+local)"
                }
            });
            const titles = [query];
            const searchItems = Array.isArray(searchPayload?.query?.search) ? searchPayload.query.search : [];
            for (const item of searchItems) {
                const title = String(item?.title || "").trim();
                if (title) titles.push(title);
                if (titles.length >= 12) break;
            }
            const uniqueTitles = [...new Set(titles)].slice(0, 12);
            if (!uniqueTitles.length) continue;

            const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=thumbnail&pithumbsize=1400&redirects=1&format=json&titles=${encodeURIComponent(uniqueTitles.join("|"))}`;
            const payload = await fetchJsonWithTimeout(pageUrl, {
                headers: {
                    "User-Agent": "scenario-self-generation-agent/1.0 (+local)"
                }
            });
            const pages = payload?.query?.pages ? Object.values(payload.query.pages) : [];
            const scored = pages
                .map((page) => {
                    const imageUrl = String(page?.thumbnail?.source || "").trim();
                    const title = String(page?.title || "").trim();
                    const width = Number(page?.thumbnail?.width || 0);
                    const height = Number(page?.thumbnail?.height || 0);
                    if (!imageUrl) return null;
                    const score = scorer({ city, title, imageUrl });
                    return { imageUrl, title, width, height, score };
                })
                .filter(Boolean)
                .sort((a, b) => b.score - a.score);

            const top = scored.find((item) => item.score > 0);
            if (top && (!bestCandidate || top.score > bestCandidate.score)) {
                bestCandidate = top;
            }
        } catch {
            // try next query
        }
    }

    if (!bestCandidate?.imageUrl) return null;
    try {
        const image = await fetchBinaryWithTimeout(bestCandidate.imageUrl, {
            headers: {
                "User-Agent": "scenario-self-generation-agent/1.0 (+local)"
            }
        });
        return {
            imageUrl: bestCandidate.imageUrl,
            imageDataUrl: image.dataUrl,
            title: bestCandidate.title,
            width: bestCandidate.width,
            height: bestCandidate.height,
            score: bestCandidate.score
        };
    } catch {
        return null;
    }
}

async function fetchStaticMapImage(lat, lon) {
    const mapUrl = `https://tile.openstreetmap.org/`;
    try {
        const mapDataUrl = await fetchOsmTileMapDataUrl(lat, lon, 11);
        return {
            type: "static_map",
            imageUrl: mapUrl,
            imageDataUrl: mapDataUrl,
            source: "staticmap.openstreetmap.de"
        };
    } catch {
        return {
            type: "static_map",
            imageUrl: mapUrl,
            imageDataUrl: buildFallbackMapDataUrl(),
            source: "staticmap.openstreetmap.de"
        };
    }
}

async function fetchOsmTileMapDataUrl(lat, lon, zoom = 4) {
    const cols = 4;
    const rows = 3;
    const tileSize = 256;
    const worldSize = 2 ** zoom;
    const { x, y } = lonLatToTile(lon, lat, zoom);
    const originX = Math.floor(x - cols / 2);
    const originY = Math.floor(y - rows / 2);

    const fetches = [];
    for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
            const rawX = originX + col;
            const rawY = originY + row;
            const tx = wrapTileX(rawX, worldSize);
            const ty = Math.max(0, Math.min(worldSize - 1, rawY));
            const url = `https://tile.openstreetmap.org/${zoom}/${tx}/${ty}.png`;
            fetches.push(fetchBinaryWithTimeout(url, {
                headers: {
                    "User-Agent": "scenario-self-generation-agent/1.0 (+local)"
                }
            }).then((tile) => ({
                row,
                col,
                dataUrl: tile.dataUrl
            })));
        }
    }

    const tiles = await Promise.all(fetches);
    const width = cols * tileSize;
    const height = rows * tileSize;
    const tileImages = tiles.map((tile) => (
        `<image href="${tile.dataUrl}" x="${tile.col * tileSize}" y="${tile.row * tileSize}" width="${tileSize}" height="${tileSize}" />`
    )).join("");

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
            ${tileImages}
        </svg>
    `.trim();

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function lonLatToTile(lon, lat, zoom) {
    const latRad = (lat * Math.PI) / 180;
    const n = 2 ** zoom;
    const x = (lon + 180) / 360 * n;
    const y = (1 - Math.log(Math.tan(latRad) + (1 / Math.cos(latRad))) / Math.PI) / 2 * n;
    return { x, y };
}

function wrapTileX(x, worldSize) {
    const wrapped = x % worldSize;
    return wrapped < 0 ? wrapped + worldSize : wrapped;
}

function buildVisualInsight({ country, city, geocode, countryProfile, landmark }) {
    const cityName = city || country;
    const lat = Number(geocode?.latitude || countryProfile?.latlng?.[0] || 0);
    const lon = Number(geocode?.longitude || countryProfile?.latlng?.[1] || 0);
    const countryAreaKm2 = Number(countryProfile?.areaKm2 || 0);
    const countryPopulation = Number(countryProfile?.population || 0);
    const cityPopulation = Number(geocode?.population || 0);
    const cityPopulationSharePct = countryPopulation > 0 && cityPopulation > 0
        ? (cityPopulation / countryPopulation) * 100
        : 0;
    const landmarkImages = Array.isArray(landmark?.imageDataUrls) && landmark.imageDataUrls.length
        ? landmark.imageDataUrls.slice(0, 1)
        : [landmark?.imageDataUrl || landmark?.imageUrl || buildFallbackPhotoDataUrl(cityName)];

    return {
        city: cityName,
        country,
        landmark_image_url: landmark?.imageDataUrl || landmark?.imageUrl || buildFallbackPhotoDataUrl(cityName),
        landmark_image_urls: landmarkImages,
        image_cards: Array.isArray(landmark?.cards) ? landmark.cards : [],
        map_image_url: "",
        country_area_km2: countryAreaKm2,
        country_population: countryPopulation,
        city_population: cityPopulation,
        city_population_share_pct: cityPopulationSharePct,
        neighbor_codes: Array.isArray(countryProfile?.borders) ? countryProfile.borders : []
    };
}

function buildFallbackPhotoDataUrl(cityName) {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
            <defs>
                <linearGradient id="pbg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#214a70"/>
                    <stop offset="100%" stop-color="#4f87b7"/>
                </linearGradient>
            </defs>
            <rect width="960" height="540" fill="url(#pbg)"/>
            <circle cx="780" cy="120" r="58" fill="rgba(255,255,255,0.22)"/>
            <rect x="0" y="452" width="960" height="88" fill="rgba(7,22,38,0.56)"/>
            <text x="40" y="500" fill="#f5f9ff" font-family="Segoe UI, Arial, sans-serif" font-size="42" font-weight="700">${escapeSvg(cityName)}</text>
        </svg>
    `.trim();
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildFallbackMapDataUrl() {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
            <defs>
                <linearGradient id="mbg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#e8f1fb"/>
                    <stop offset="100%" stop-color="#d3e6fb"/>
                </linearGradient>
            </defs>
            <rect width="960" height="540" fill="url(#mbg)"/>
            <path d="M150,120 L790,120 L860,260 L730,410 L220,440 L100,300 Z" fill="#bdd5ef" stroke="#5a7fa8" stroke-width="3"/>
            <path d="M300,210 L670,205 L735,285 L655,360 L325,368 L255,296 Z" fill="#5c9bd3" stroke="#2f6ea6" stroke-width="3"/>
            <circle cx="500" cy="285" r="12" fill="#d73a3a"/>
            <circle cx="500" cy="285" r="23" fill="none" stroke="rgba(215,58,58,0.35)" stroke-width="7"/>
        </svg>
    `.trim();
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeSvg(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}

function buildMacroInsight({ country, city, locale, worldBankMarket, worldBankUrban, climate }) {
    const countryLabel = country;
    const gdpText = worldBankMarket?.value
        ? `${Math.round(worldBankMarket.value).toLocaleString("en-US")} USD (${worldBankMarket.year})`
        : locale === "ko" ? "실시간 GDP 데이터 수집 중" : "Live GDP signal pending";
    const urbanText = worldBankUrban?.value
        ? `${worldBankUrban.value.toFixed(1)}% (${worldBankUrban.year})`
        : locale === "ko" ? "실시간 도시화율 데이터 수집 중" : "Live urbanization signal pending";
    const climateText = climate
        ? (locale === "ko"
            ? `최근 7일 평균 최고/최저 ${climate.avgMax.toFixed(1)}°C / ${climate.avgMin.toFixed(1)}°C, 강수 ${climate.avgRain.toFixed(1)}mm`
            : `7-day avg high/low ${climate.avgMax.toFixed(1)}°C / ${climate.avgMin.toFixed(1)}°C, precipitation ${climate.avgRain.toFixed(1)}mm`)
        : (locale === "ko" ? "기후 실시간 신호가 부족해 일반 생활 패턴 기반으로 해석" : "Climate signal unavailable, using general behavior context");

    return {
        title: locale === "ko"
            ? `${countryLabel}${city ? ` ${city}` : ""} 시장에서 잘 먹히는 생활 시나리오를 찾는 단계입니다`
            : `${countryLabel}${city ? ` ${city}` : ""} is in a high time-value and routine-efficiency window`,
        market_traits: locale === "ko"
            ? [
                `도시화율 ${urbanText}로 생활 리듬이 빠른 도시권 수요가 큽니다.`,
                `1인당 GDP ${gdpText} 기준으로 체감 가치 중심 메시지가 유리합니다.`,
                climateText
            ]
            : [
                `Urbanization at ${urbanText} indicates strong demand in fast urban routines.`,
                `GDP per capita at ${gdpText} suggests value-led messaging can convert faster.`,
                climateText
            ],
        core_needs: locale === "ko"
            ? [
                "퇴근/귀가 직후 집 상태를 빠르게 정리하는 자동화",
                "반복 가사 부담을 줄이는 즉시 체감형 루틴",
                "시간 절약이 감성 가치로 연결되는 메시지 구조"
            ]
            : [
                "Fast home-state reset right after arrival",
                "Immediate routine value that cuts repetitive chores",
                "Messaging that turns saved time into emotional payoff"
            ],
        opportunity_factors: locale === "ko"
            ? [
                "국가 데이터와 도시 특성을 함께 보면 어떤 메시지가 더 잘 먹히는지 명확해집니다.",
                "도시를 특정하면 동일 제품도 타겟 소구 포인트가 크게 달라집니다."
            ]
            : [
                "Combining macro indicators with city-level behavior signals improves message fit.",
                "City-level targeting can shift the best value proposition even with the same product."
            ],
        next_step_prompt: locale === "ko"
            ? "도시/지역을 입력하면 인구·주거·이동 패턴 기반의 로컬 실행 포인트를 즉시 제안합니다."
            : "Add a city/region to unlock local execution points based on population, housing, and mobility signals."
    };
}

function buildLocalInsight({ city, locale, citySignal, climate, worldBankUrban }) {
    const importance = Number(citySignal?.importance || 0);
    const archetype = importance >= 0.7
        ? (locale === "ko" ? "핵심 대도시 허브" : "Primary metro hub")
        : importance >= 0.4
            ? (locale === "ko" ? "성장형 생활권" : "Growth urban cluster")
            : (locale === "ko" ? "분산형 생활권" : "Distributed residential cluster");
    const climateLine = climate
        ? (locale === "ko"
            ? `최근 7일 평균 ${climate.avgMax.toFixed(1)}°C/${climate.avgMin.toFixed(1)}°C, 강수 ${climate.avgRain.toFixed(1)}mm`
            : `Recent 7-day avg ${climate.avgMax.toFixed(1)}°C/${climate.avgMin.toFixed(1)}°C, precipitation ${climate.avgRain.toFixed(1)}mm`)
        : (locale === "ko" ? "계절 편차를 고려한 실내 쾌적성 루틴 설계가 필요합니다." : "Seasonality-aware comfort routine design is recommended.");
    const urbanLine = worldBankUrban?.value
        ? (locale === "ko"
            ? `국가 도시화율 ${worldBankUrban.value.toFixed(1)}% 기반에서 ${city}는 고밀도 루틴 수요가 높을 가능성이 큽니다.`
            : `With national urbanization at ${worldBankUrban.value.toFixed(1)}%, ${city} likely has strong dense-routine demand.`)
        : (locale === "ko"
            ? `${city}는 빠른 루틴 전환과 즉시 체감 편의에 반응할 가능성이 큽니다.`
            : `${city} is likely to respond to fast routine transitions and immediate convenience value.`);

    return {
        city_display: citySignal?.displayName || city,
        archetype,
        demographic: locale === "ko"
            ? `${urbanLine}`
            : `${urbanLine}`,
        lifestyle: locale === "ko"
            ? `${climateLine} 이동/귀가 이후 짧은 시간에 집 상태를 정리하려는 니즈를 강하게 가정할 수 있습니다.`
            : `${climateLine} It supports a strong need to reset home state quickly after commute and return.`,
        action_items: locale === "ko"
            ? [
                `${city} 로컬 커뮤니티 키워드(육아/출퇴근/주거 불편) 1개를 메시지에 직접 결합`,
                "주요 교통 거점 기준 '귀가 직후 10분 루틴' 시나리오 카피 제작",
                "아파트/주거 형태별 자동화 난이도 차이를 랜딩 메시지에 분리 반영"
            ]
            : [
                `Inject one local community keyword (parenting/commute/housing friction) into copy`,
                "Build a 'first 10 minutes after arrival' scenario around transit hubs",
                "Split landing messages by housing type and automation complexity"
            ],
        confidence_note: importance >= 0.5
            ? (locale === "ko"
                ? "도시 매칭 신뢰도: 높음 (실시간 지오코딩 일치)"
                : "City-match confidence: high (live geocode match)")
            : (locale === "ko"
                ? "도시 매칭 신뢰도: 보통 (추가 로컬 데이터 확보 권장)"
                : "City-match confidence: medium (add local validation data)")
    };
}

function buildEvidence({ locale, worldBankMarket, worldBankUrban, climate, citySignal }) {
    const now = new Date().toISOString();
    const items = [];

    if (worldBankMarket) {
        items.push({
            source_domain: worldBankMarket.source,
            source_url: worldBankMarket.url || "",
            title: "World Bank Open Data — GDP per capita",
            collected_at_utc: now,
            confidence: "high",
            snippet: locale === "ko"
                ? `GDP per capita 최신값 ${Math.round(worldBankMarket.value || 0).toLocaleString("en-US")} (${worldBankMarket.year || "n/a"})`
                : `Latest GDP per capita ${Math.round(worldBankMarket.value || 0).toLocaleString("en-US")} (${worldBankMarket.year || "n/a"})`
        });
    }
    if (worldBankUrban) {
        items.push({
            source_domain: worldBankUrban.source,
            source_url: worldBankUrban.url || "",
            title: "World Bank Open Data — Urban population ratio",
            collected_at_utc: now,
            confidence: "high",
            snippet: locale === "ko"
                ? `Urban population ratio ${Number(worldBankUrban.value || 0).toFixed(1)}% (${worldBankUrban.year || "n/a"})`
                : `Urban population ratio ${Number(worldBankUrban.value || 0).toFixed(1)}% (${worldBankUrban.year || "n/a"})`
        });
    }
    if (climate) {
        items.push({
            source_domain: climate.source,
            source_url: climate.url || "",
            title: "Open-Meteo — 7-day weather forecast",
            collected_at_utc: now,
            confidence: "medium",
            snippet: locale === "ko"
                ? `7일 기후 신호: 평균 최고 ${climate.avgMax.toFixed(1)}°C / 최저 ${climate.avgMin.toFixed(1)}°C`
                : `7-day climate signal: avg high ${climate.avgMax.toFixed(1)}°C / low ${climate.avgMin.toFixed(1)}°C`
        });
    }
    if (citySignal) {
        items.push({
            source_domain: citySignal.source,
            source_url: citySignal.url || "",
            title: "OpenStreetMap Nominatim — City geocode",
            collected_at_utc: now,
            confidence: Number(citySignal.importance || 0) >= 0.5 ? "medium" : "low",
            snippet: locale === "ko"
                ? `도시 매칭 중요도 ${Number(citySignal.importance || 0).toFixed(2)} (${citySignal.className || "city"}:${citySignal.typeName || "unknown"})`
                : `City match importance ${Number(citySignal.importance || 0).toFixed(2)} (${citySignal.className || "city"}:${citySignal.typeName || "unknown"})`
        });
    }

    return items;
}

function average(values) {
    const numeric = (Array.isArray(values) ? values : []).map((value) => Number(value)).filter(Number.isFinite);
    if (!numeric.length) return 0;
    return numeric.reduce((sum, value) => sum + value, 0) / numeric.length;
}

/* ══════════════════════════════════════════════════════════════════════
   City Profile — 10카테고리 도시 생활 특징 (경량 API)
   ══════════════════════════════════════════════════════════════════════ */

const CITY_PROFILE_SYSTEM_PROMPT = `You are a Geo-Localization Evidence Extractor for a scenario-generation system.

Your task is to produce a source-bound city evidence pack for consumer experience, smart home, automation, and local marketing scenario generation.

═══ HARD RULES (violation = output rejected) ═══

1. EVERY sentence MUST contain at least one LOCAL ANCHOR.
   Anchor types: district name, station name, road/street name, facility name, event/festival name, specific statistic, official policy name.
   A sentence without a named local anchor is ALWAYS rejected.

2. NO UNSOURCED CLAIMS — zero tolerance.
   Every accepted category must trace back to source_map entries via evidence_ids.
   If you cannot name a source, the claim does not exist.

3. NO GENERIC CITY LANGUAGE — zero tolerance.
   Test: "Could this sentence describe 3+ other cities if I removed the city name?" If yes → reject it.
   ❌ FAIL: "The city has four distinct seasons and hot summers."
   ❌ FAIL: "Natural green spaces coexist with residential areas."
   ❌ FAIL: "Local festivals and cultural events are held seasonally."
   ✅ PASS: "소요단풍문화제, 소요산 봄나들이 축제, 소요산 국화전시회 are held seasonally, shifting foot traffic patterns around Soyosan station." [S3]

4. ONE SOURCE PER CONFLICTING STATISTIC — never blend numbers from different sources.

5. WEAK EVIDENCE → mark insufficient, never fabricate.
   Output exactly: "Evidence insufficient for localized claim."
   Do NOT pad weak categories with generic filler to make them look complete.

6. OFFICIAL/PRIMARY SOURCES FIRST.
   Community sources (blogs, forums) may only supplement and must be labeled tier "B" or "C".
   A community source alone CANNOT be the sole proof for any category.

7. NO OVER-INFERENCE from a single place, event, or data point.
   One park does not prove "the city is green." One festival does not prove "vibrant cultural life."

8. CONCISE, REUSABLE OUTPUT — every sentence must be directly consumable by downstream scenario agents.

9. LOCALE RULE: natural-language fields → requested locale language. JSON keys → always English.

10. SELF-CHECK BEFORE OUTPUT: re-read every category summary and evidence_pack entry.
    For each, verify: (a) contains named local anchor, (b) has evidence_ids pointing to source_map, (c) fails the generic-city test.
    If any check fails, rewrite or mark insufficient.

═══ QUALITY EXAMPLES ═══

❌ REJECTED (climate): "The city experiences four distinct seasons with hot summers."
   → No anchor, no source, fits any temperate city.
✅ ACCEPTED (climate): "내륙 분지 지형으로 경기북부에서도 한서 차가 크며, 소요산 일대는 겨울 최저기온이 –15°C 이하로 떨어지는 날이 연 15일 이상 기록된다." [S1: 기상청 동두천 관측소]

❌ REJECTED (safety): "Safety and nighttime walkability are important for residents."
   → No facility/policy name, generic concern.
✅ ACCEPTED (safety): "CCTV통합관제센터 기반 안전귀가 서비스, CCTV 위치지도, 범죄예방 도시환경디자인(CPTED) 계획이 운영 중이다." [S5: 동두천시청 안전정책]

❌ REJECTED (events): "The area hosts various cultural events throughout the year."
   → No event names, no dates, no locations.
✅ ACCEPTED (events): "소요단풍문화제(10월), 소요산 봄나들이 축제(4월), 소요산 국화전시회(11월)가 계절별로 운영되며 소요산역~자재암 구간 유동인구가 평시 대비 3배 이상 증가한다." [S3: 동두천 문화관광]

═══ REQUIRED 10 CATEGORIES ═══
climate, housing, family, daily_rhythm, safety, energy, health, pets, mobility, events

═══ OUTPUT JSON STRUCTURE (return valid JSON only, no other text) ═══
{
  "climate": "1-3 sentences with local anchor(s) and source reference, or Evidence insufficient for localized claim.",
  "housing": "...",
  "family": "...",
  "daily_rhythm": "...",
  "safety": "...",
  "energy": "...",
  "health": "...",
  "pets": "...",
  "mobility": "...",
  "events": "...",
  "source_map": [
    {
      "id": "S1",
      "title": "source title",
      "organization": "source organization",
      "published_or_updated": "date if known",
      "url": "https://...",
      "tier": "A"
    }
  ],
  "local_anchor_inventory": [
    {
      "anchor": "named local anchor",
      "type": "station / district / festival / climate / policy / facility / etc.",
      "why_it_matters": "why this anchor helps localization",
      "source_ids": ["S1"]
    }
  ],
  "evidence_pack": {
    "climate": {
      "localized_statement": "1-3 sentences with at least one local anchor, or Evidence insufficient for localized claim.",
      "why_localized": "brief reason this statement is unique to this city",
      "evidence_ids": ["S1"],
      "confidence": "High / Medium / Low",
      "reusability_for_scenario_agent": "brief scenario use",
      "smart_home_relevance": "one sentence connecting to SmartThings automation",
      "marketing_relevance": "one sentence on marketing application",
      "missing_evidence": ""
    }
  },
  "red_flag_check": ["rejected claim → reason: generic / unsourced / over-inferred"],
  "scenario_agent_ready_summary": ["city-specific reusable bullet with named anchors"],
  "strict_final_rule_check": {
    "no_unsourced_claims": true,
    "no_generic_city_language": true,
    "every_accepted_category_has_local_anchor": true,
    "community_sources_not_used_as_sole_proof_unless_labeled": true,
    "weak_categories_marked_insufficient": true
  }
}

FINAL REMINDER:
- The top-level category summaries MUST also be source-bound and contain local anchors — they are NOT allowed to be weaker than evidence_pack entries.
- If unsure about ANY claim, mark insufficient. A correct "insufficient" is better than a plausible-sounding fabrication.
- red_flag_check must list at least 2 claims you considered but rejected, with specific rejection reasons.
- scenario_agent_ready_summary bullets must each contain at least one named local anchor.`;

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ── City Profile shared utilities ──────────────────────────────────────
   These helpers are duplicated in functions/api/city-profile.js (Cloudflare Pages).
   When modifying retry logic, normalize functions, or tag rules,
   keep BOTH files in sync.  (CommonJS here vs ESM in functions/api)
   ──────────────────────────────────────────────────────────────────────── */
/* ── Wiki Context Fetcher (RAG for city profiles) ──────────────────────
   Fetches encyclopedia-style reference text from Wikipedia to ground
   city profile generation with real facts instead of model hallucination.
   ──────────────────────────────────────────────────────────────────────── */
const _wikiCache = new Map();
const WIKI_CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

function getWikiLang(countryCode) {
    const map = {
        KR: "ko", JP: "ja", CN: "zh", DE: "de", FR: "fr", ES: "es",
        IT: "it", PT: "pt", NL: "nl", PL: "pl", TR: "tr", RU: "ru",
        ID: "id", BR: "pt", MX: "es", CO: "es", AR: "es"
    };
    return map[countryCode] || "en";
}

// 한국 도시 영문→한국어 매핑 (Wikipedia 검색 정확도 향상)
const KR_CITY_WIKI_MAP = {
    "Seoul": "서울특별시", "Busan": "부산광역시", "Incheon": "인천광역시",
    "Daegu": "대구광역시", "Daejeon": "대전광역시", "Gwangju Metro": "광주광역시",
    "Ulsan": "울산광역시", "Sejong": "세종특별자치시",
    "Suwon": "수원시", "Yongin": "용인시", "Goyang": "고양시", "Hwaseong": "화성시",
    "Seongnam": "성남시", "Bucheon": "부천시", "Namyangju": "남양주시", "Ansan": "안산시",
    "Pyeongtaek": "평택시", "Anyang": "안양시", "Siheung": "시흥시", "Paju": "파주시",
    "Gimpo": "김포시", "Uijeongbu": "의정부시", "Gwangju-si": "광주시",
    "Hanam": "하남시", "Gwangmyeong": "광명시", "Yangju": "양주시",
    "Gunpo": "군포시", "Osan": "오산시", "Icheon": "이천시",
    "Dongducheon": "동두천시", "Guri": "구리시", "Pocheon": "포천시",
    "Cheongju": "청주시", "Cheonan": "천안시", "Jeonju": "전주시",
    "Changwon": "창원시", "Gimhae": "김해시", "Jeju": "제주시",
    "Wonju": "원주시", "Chuncheon": "춘천시", "Gangneung": "강릉시",
    "Yeosu": "여수시", "Suncheon": "순천시", "Mokpo": "목포시",
    "Gyeongju": "경주시", "Andong": "안동시", "Gumi": "구미시",
    "Pohang": "포항시", "Jinju": "진주시"
};

async function fetchWikiContext(countryCode, cityName) {
    const cacheKey = `${countryCode}|${cityName}`;
    const cached = _wikiCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < WIKI_CACHE_TTL) return cached.text;

    const lang = getWikiLang(countryCode);
    // 한국 도시는 한국어 이름으로 검색해야 정확한 결과
    const searchTitle = (countryCode === "KR" && KR_CITY_WIKI_MAP[cityName.trim()])
        ? KR_CITY_WIKI_MAP[cityName.trim()]
        : cityName.trim();

    try {
        // Step 1: Search for the best matching article title
        const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTitle)}&srlimit=1&format=json`;
        const searchController = new AbortController();
        const searchTimer = setTimeout(() => searchController.abort(), 8000);
        const searchRes = await fetch(searchUrl, {
            headers: { "User-Agent": "SmartThingsScenarioAgent/1.0" },
            signal: searchController.signal
        });
        clearTimeout(searchTimer);
        if (!searchRes.ok) throw new Error(`Wiki search ${searchRes.status}`);
        const searchData = await searchRes.json();
        const pageTitle = searchData?.query?.search?.[0]?.title;
        if (!pageTitle) throw new Error("No wiki article found");

        // Step 2: Fetch plain text extract (up to 8000 chars)
        const extractUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=extracts&explaintext=1&exsectionformat=plain&format=json`;
        const extractController = new AbortController();
        const extractTimer = setTimeout(() => extractController.abort(), 8000);
        const extractRes = await fetch(extractUrl, {
            headers: { "User-Agent": "SmartThingsScenarioAgent/1.0" },
            signal: extractController.signal
        });
        clearTimeout(extractTimer);
        if (!extractRes.ok) throw new Error(`Wiki extract ${extractRes.status}`);
        const extractData = await extractRes.json();
        const pages = extractData?.query?.pages;
        const page = pages ? Object.values(pages)[0] : null;
        const WIKI_MAX_CHARS = 12000;
        let extract = page?.extract || "";

        if (!extract || extract.length < 100) throw new Error("Wiki extract too short");

        // Truncate at sentence boundary to avoid cutting mid-sentence
        if (extract.length > WIKI_MAX_CHARS) {
            const cut = extract.lastIndexOf(".", WIKI_MAX_CHARS);
            extract = extract.slice(0, cut > WIKI_MAX_CHARS * 0.5 ? cut + 1 : WIKI_MAX_CHARS);
        }

        const sourceUrl = `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`;
        const text = `[SOURCE: Wikipedia ${lang.toUpperCase()} — ${sourceUrl}]\n\n${extract}`;

        _wikiCache.set(cacheKey, { text, ts: Date.now() });
        console.info(`[wiki-context] fetched ${lang}.wikipedia: "${pageTitle}" (${extract.length} chars)`);
        return text;
    } catch (err) {
        console.warn(`[wiki-context] failed for ${countryCode}/${cityName}: ${err.message}`);

        // Fallback: try English Wikipedia if non-English failed
        if (lang !== "en") {
            try {
                const enUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTitle)}&srlimit=1&format=json`;
                const enController = new AbortController();
                const enTimer = setTimeout(() => enController.abort(), 8000);
                const enRes = await fetch(enUrl, {
                    headers: { "User-Agent": "SmartThingsScenarioAgent/1.0" },
                    signal: enController.signal
                });
                clearTimeout(enTimer);
                if (enRes.ok) {
                    const enData = await enRes.json();
                    const enTitle = enData?.query?.search?.[0]?.title;
                    if (enTitle) {
                        const enExtractUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(enTitle)}&prop=extracts&explaintext=1&exsectionformat=plain&format=json`;
                        const enExtractController = new AbortController();
                        const enExtractTimer = setTimeout(() => enExtractController.abort(), 8000);
                        const enExtractRes = await fetch(enExtractUrl, {
                            headers: { "User-Agent": "SmartThingsScenarioAgent/1.0" },
                            signal: enExtractController.signal
                        });
                        clearTimeout(enExtractTimer);
                        if (enExtractRes.ok) {
                            const enExtractData = await enExtractRes.json();
                            const enPages = enExtractData?.query?.pages;
                            const enPage = enPages ? Object.values(enPages)[0] : null;
                            let enExtract = enPage?.extract || "";
                            if (enExtract.length >= 100) {
                                if (enExtract.length > 12000) {
                                    const cut = enExtract.lastIndexOf(".", 12000);
                                    enExtract = enExtract.slice(0, cut > 6000 ? cut + 1 : 12000);
                                }
                                const sourceUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(enTitle)}`;
                                const text = `[SOURCE: Wikipedia EN — ${sourceUrl}]\n\n${enExtract}`;
                                _wikiCache.set(cacheKey, { text, ts: Date.now() });
                                console.info(`[wiki-context] fallback en.wikipedia: "${enTitle}" (${enExtract.length} chars)`);
                                return text;
                            }
                        }
                    }
                }
            } catch { /* fallback also failed, return empty */ }
        }

        _wikiCache.set(cacheKey, { text: "", ts: Date.now() });
        return "";
    }
}

function shouldRetryOpenAiStatus(status) {
    return status === 408 || status === 409 || status === 429 || status >= 500;
}

async function fetchOpenAiChatCompletionWithRetry({ apiKey, requestBody, timeoutMs = CITY_PROFILE_UPSTREAM_TIMEOUT_MS, maxAttempts = CITY_PROFILE_UPSTREAM_MAX_ATTEMPTS }) {
    let lastError = new Error("OpenAI request failed");

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timer);

            if (apiRes.ok) {
                return apiRes.json();
            }

            const errText = await apiRes.text().catch(() => "");
            let errMsg = errText.substring(0, 400) || `OpenAI API error ${apiRes.status}`;
            try {
                errMsg = JSON.parse(errText)?.error?.message || errMsg;
            } catch {}

            lastError = new Error(errMsg);
            lastError.status = apiRes.status;

            if (attempt < maxAttempts && shouldRetryOpenAiStatus(apiRes.status)) {
                await delay(800 * attempt);
                continue;
            }

            throw lastError;
        } catch (error) {
            clearTimeout(timer);
            lastError = error instanceof Error ? error : new Error(String(error));
            const isAbort = lastError.name === "AbortError";
            const isTransient = isAbort || /timeout|timed out|network|fetch failed|socket|econnreset|etimedout/i.test(lastError.message || "");

            if (attempt < maxAttempts && isTransient) {
                await delay(800 * attempt);
                continue;
            }

            throw lastError;
        }
    }

    throw lastError;
}

const CUSTOM_RESEARCH_SYSTEM_PROMPT = `당신은 특정 도시의 스마트홈 시나리오 기획을 위한 도시 맥락 분석 전문가입니다.
사용자가 이미 보유한 도시 기본 프로필(10개 카테고리)은 "base_profiles"로 제공됩니다.
당신의 역할은 사용자가 입력한 추가 키워드에 대해 기존 프로필과 중복되지 않는 새로운 도시 맥락을 도출하는 것입니다.

═══ 절대 규칙 (위반 시 출력 거부) ═══

1. 모든 문장에 반드시 '지역 고유 앵커' 1개 이상 포함
   앵커 유형: 지명, 역명, 도로명, 시설명, 행사명, 구체적 수치, 정책명
   ❌ "이 도시는 대중교통이 잘 발달되어 있다." → 앵커 없음, 어느 도시든 해당
   ✅ "소요산역~동두천중앙역 구간 1호선 배차 간격이 출퇴근 시간 10분 내외로, 지행·보산동 주민의 서울 출퇴근 동선이 형성된다."

2. 출처 없는 추정 문장 절대 금지
   근거가 약하면 "[근거 보강 필요]"로 표기하고, 억지로 채우지 말 것.

3. 일반론 금지 — "이 문장에서 도시명을 지우면 다른 3개 이상의 도시에도 해당되는가?" 테스트 통과 필수.
   ❌ "젊은 가족들이 스마트홈에 관심이 많다."
   ✅ "송내동 e편한세상 신축 단지 입주 가구 중 영유아 자녀 가정 비율이 높아, 외출 시 IoT 모니터링 수요가 집중된다."

4. base_profiles에 이미 있는 내용 반복 금지. 키워드로 인해 새롭게 드러나는 맥락만 출력.
5. 수치 충돌 시 한 출처만 채택, 혼용 금지.
6. 하나의 장소·행사에서 과잉 추론 금지.
7. 키워드 관련성이 약하면 솔직히 밝히고 가장 가까운 해석을 제시.
8. 요청된 locale 언어로 작성하되, tags 배열은 항상 영어로 작성.
9. 출력은 반드시 아래 고정 JSON 구조로만 작성. 설명 없이 JSON만 출력.

═══ 품질 기준 ═══
- 지역 행동 패턴, 이벤트, 이동 동선, 계절 리듬, 장소 유형, 라이프스타일 신호, 소비자 사용 맥락을 우선
- 이벤트 키워드: 시기, 장소 패턴, 참여자 행동, 외출 전후 가정 행동에 집중
- 가구/생활 키워드: 생활 패턴, 기기 사용, 일정 리듬, 페인포인트에 집중
- 마케터와 시나리오 기획자가 바로 활용할 수 있을 만큼 구체적이고 간결하게
- finding의 summary와 scenario_implication 모두 지역 고유 앵커 포함 필수

═══ JSON 구조 ═══
{
  "keyword_interpretation": "키워드를 도시 맥락에서 해석한 1~2문장 (도시 고유 앵커 포함)",
  "search_intents": ["도시+키워드 결합 검색 의도 1", "검색 의도 2", "...(4~8개)"],
  "city_keyword_findings": [
    {
      "title": "발견 제목",
      "summary": "해당 도시에서 이 키워드와 관련해 새롭게 드러나는 맥락 — 지역 고유 앵커 필수 (1~2문장)",
      "scenario_implication": "SmartThings 시나리오 기획에 어떻게 반영할 수 있는지 — 지역 고유 앵커 필수 (1문장)"
    }
  ],
  "dedup_note": "기존 base_profiles와의 중복 여부 및 차별점 설명 (1문장)",
  "recommended_reflection_points": ["시나리오 반영 포인트 1 (앵커 포함)", "포인트 2", "...(2~4개)"],
  "tags": ["Save energy", "Keep your home safe"]
}

city_keyword_findings는 2~5개가 적당합니다.

tags 배열에는 아래 값 중 관련 있는 것만 포함하세요:
Save energy, Keep your home safe, Help with chores, Care for kids, Care for seniors,
Care for your pet, Sleep well, Enhanced mood, Stay fit & healthy, Easily control your lights,
Keep the air fresh, Find your belongings, Time saving

출력 전 자가 점검: 모든 summary와 scenario_implication에 지역 고유 앵커가 있는지 확인. 없으면 보강하거나 "[근거 보강 필요]" 표기.`;

function parseJsonObjectFromModelText(rawText) {
    const text = typeof rawText === "string" ? rawText.trim() : "";
    if (!text) return null;

    const candidates = [
        text,
        text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim()
    ];
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) candidates.push(jsonMatch[0].trim());

    for (const candidate of candidates) {
        if (!candidate) continue;
        try {
            return JSON.parse(candidate);
        } catch {
            continue;
        }
    }

    return null;
}

function normalizeStringList(value, maxItems = 8) {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) => typeof item === "string" ? item.trim() : "")
        .filter(Boolean)
        .slice(0, maxItems);
}

function inferCustomResearchTags(query, extraText = "") {
    const haystack = `${query || ""} ${extraText || ""}`.toLowerCase();
    const tagRules = [
        { tag: "Care for seniors", terms: ["시니어", "노인", "고령", "어르신", "senior", "elder", "aging"] },
        { tag: "Care for kids", terms: ["아이", "키즈", "어린이", "육아", "child", "kid", "baby"] },
        { tag: "Care for your pet", terms: ["반려", "펫", "pet", "dog", "cat"] },
        { tag: "Keep your home safe", terms: ["보안", "안전", "security", "safe", "cctv", "도난", "침입"] },
        { tag: "Save energy", terms: ["에너지", "전기", "난방", "냉방", "절약", "energy", "utility", "bill"] },
        { tag: "Sleep well", terms: ["수면", "숙면", "sleep", "bedtime"] },
        { tag: "Stay fit & healthy", terms: ["건강", "웰니스", "fitness", "health", "air quality", "공기", "미세먼지"] },
        { tag: "Find your belongings", terms: ["분실", "위치", "찾기", "tag", "tracker", "belonging"] },
        { tag: "Time saving", terms: ["시간", "루틴", "자동", "automation", "commute", "출퇴근"] },
        { tag: "Enhanced mood", terms: ["무드", "분위기", "mood", "ambience", "힐링"] },
        { tag: "Help with chores", terms: ["집안일", "청소", "세탁", "요리", "chore", "cleaning", "laundry"] },
        { tag: "Keep the air fresh", terms: ["환기", "공기", "air", "odor", "smell", "습도"] },
        { tag: "Easily control your lights", terms: ["조명", "lights", "lighting", "lamp"] }
    ];

    const matched = tagRules
        .filter((rule) => rule.terms.some((term) => haystack.includes(term)))
        .map((rule) => rule.tag);

    return [...new Set(matched)].slice(0, 4);
}

function toTitleFromProfileKey(key, locale) {
    const koMap = {
        climate: "기후·계절",
        housing: "주거 형태",
        family: "가족·돌봄",
        daily_rhythm: "일상 리듬",
        safety: "안전·보안",
        energy: "에너지",
        health: "건강·웰니스",
        pets: "펫 라이프",
        mobility: "이동·부재",
        events: "문화 행사"
    };
    const enMap = {
        climate: "Climate",
        housing: "Housing",
        family: "Family",
        daily_rhythm: "Daily Rhythm",
        safety: "Safety",
        energy: "Energy",
        health: "Health",
        pets: "Pet Life",
        mobility: "Mobility",
        events: "Events"
    };

    return locale === "ko" ? (koMap[key] || key) : (enMap[key] || key);
}

function extractProfileHighlights(profileLike, locale) {
    if (!profileLike || typeof profileLike !== "object") return [];

    const keys = ["climate", "housing", "family", "daily_rhythm", "safety", "energy", "health", "pets", "mobility", "events"];
    return keys
        .filter((key) => typeof profileLike[key] === "string" && profileLike[key].trim())
        .map((key) => ({
            key,
            title: toTitleFromProfileKey(key, locale),
            text: profileLike[key].trim()
        }));
}

const CITY_PROFILE_FIELDS = ["climate", "housing", "family", "daily_rhythm", "safety", "energy", "health", "pets", "mobility", "events"];

function normalizeLocalizedCategoryText(value) {
    const text = typeof value === "string" ? value.trim() : "";
    return text || "Evidence insufficient for localized claim.";
}

function normalizeEvidencePackEntry(entry) {
    if (!entry || typeof entry !== "object") {
        return {
            localized_statement: "Evidence insufficient for localized claim.",
            why_localized: "",
            evidence_ids: [],
            confidence: "Low",
            reusability_for_scenario_agent: "",
            smart_home_relevance: "",
            marketing_relevance: "",
            missing_evidence: ""
        };
    }

    return {
        localized_statement: normalizeLocalizedCategoryText(entry.localized_statement),
        why_localized: typeof entry.why_localized === "string" ? entry.why_localized.trim() : "",
        evidence_ids: normalizeStringList(entry.evidence_ids, 6),
        confidence: typeof entry.confidence === "string" ? entry.confidence.trim() || "Low" : "Low",
        reusability_for_scenario_agent: typeof entry.reusability_for_scenario_agent === "string" ? entry.reusability_for_scenario_agent.trim() : "",
        smart_home_relevance: typeof entry.smart_home_relevance === "string" ? entry.smart_home_relevance.trim() : "",
        marketing_relevance: typeof entry.marketing_relevance === "string" ? entry.marketing_relevance.trim() : "",
        missing_evidence: typeof entry.missing_evidence === "string" ? entry.missing_evidence.trim() : ""
    };
}

function normalizeCityProfilePayload(payload, { city, country, locale }) {
    let source = payload;
    if (typeof source === "string") source = parseJsonObjectFromModelText(source) || { raw: source };
    if (source?.raw && typeof source.raw === "string") {
        const reparsed = parseJsonObjectFromModelText(source.raw);
        if (reparsed) source = reparsed;
    }
    if (!source || typeof source !== "object") source = {};

    const normalized = {};
    for (const key of CITY_PROFILE_FIELDS) {
        const entry = normalizeEvidencePackEntry(source?.evidence_pack?.[key]);
        const topLevel = normalizeLocalizedCategoryText(source[key]);
        normalized[key] = topLevel !== "Evidence insufficient for localized claim."
            ? topLevel
            : entry.localized_statement;
    }

    normalized.source_map = Array.isArray(source.source_map)
        ? source.source_map
            .filter((item) => item && typeof item === "object")
            .map((item, index) => ({
                id: typeof item.id === "string" && item.id.trim() ? item.id.trim() : `S${index + 1}`,
                title: typeof item.title === "string" ? item.title.trim() : "",
                organization: typeof item.organization === "string" ? item.organization.trim() : "",
                published_or_updated: typeof item.published_or_updated === "string" ? item.published_or_updated.trim() : "",
                url: typeof item.url === "string" ? item.url.trim() : "",
                tier: typeof item.tier === "string" ? item.tier.trim() : ""
            }))
            .filter((item) => item.title || item.url)
            .slice(0, 20)
        : [];

    normalized.local_anchor_inventory = Array.isArray(source.local_anchor_inventory)
        ? source.local_anchor_inventory
            .filter((item) => item && typeof item === "object")
            .map((item) => ({
                anchor: typeof item.anchor === "string" ? item.anchor.trim() : "",
                type: typeof item.type === "string" ? item.type.trim() : "",
                why_it_matters: typeof item.why_it_matters === "string" ? item.why_it_matters.trim() : "",
                source_ids: normalizeStringList(item.source_ids, 6)
            }))
            .filter((item) => item.anchor)
            .slice(0, 20)
        : [];

    normalized.evidence_pack = {};
    for (const key of CITY_PROFILE_FIELDS) {
        normalized.evidence_pack[key] = normalizeEvidencePackEntry(source?.evidence_pack?.[key]);
    }

    normalized.red_flag_check = normalizeStringList(source.red_flag_check, 20);
    normalized.scenario_agent_ready_summary = normalizeStringList(source.scenario_agent_ready_summary, 10);

    const checks = source.strict_final_rule_check && typeof source.strict_final_rule_check === "object"
        ? source.strict_final_rule_check
        : {};
    normalized.strict_final_rule_check = {
        no_unsourced_claims: checks.no_unsourced_claims !== false,
        no_generic_city_language: checks.no_generic_city_language !== false,
        every_accepted_category_has_local_anchor: checks.every_accepted_category_has_local_anchor !== false,
        community_sources_not_used_as_sole_proof_unless_labeled: checks.community_sources_not_used_as_sole_proof_unless_labeled !== false,
        weak_categories_marked_insufficient: checks.weak_categories_marked_insufficient !== false
    };

    normalized.meta = {
        city,
        country,
        locale
    };

    return normalized;
}

function buildFallbackCustomResearch({ query, city, locale, baseProfiles, profileLike, raw }) {
    const isKo = locale === "ko";
    const highlights = extractProfileHighlights(profileLike, locale);
    const profileLines = typeof baseProfiles === "string"
        ? baseProfiles.split("\n").map((line) => line.trim()).filter(Boolean)
        : [];

    const findingSources = highlights.length > 0
        ? highlights.slice(0, 3).map((item) => ({
            title: item.title,
            summary: item.text
        }))
        : profileLines.slice(0, 3).map((line) => {
            const dividerIndex = line.indexOf(":");
            const label = dividerIndex >= 0 ? line.slice(0, dividerIndex).trim() : (isKo ? "도시 맥락" : "City Context");
            const summary = dividerIndex >= 0 ? line.slice(dividerIndex + 1).trim() : line;
            return { title: label, summary };
        });

    const extraText = [
        ...findingSources.map((item) => item.summary),
        typeof raw === "string" ? raw : ""
    ].join(" ");
    const tags = inferCustomResearchTags(query, extraText);

    const findings = (findingSources.length > 0 ? findingSources : [{
        title: isKo ? "생활 패턴 보완 포인트" : "Life Pattern Opportunity",
        summary: isKo
            ? `${city} 생활 맥락에서 "${query}"와 연결되는 추가 사용 장면을 별도로 점검할 필요가 있습니다.`
            : `There is room to connect "${query}" to additional everyday situations in ${city}.`
    }]).map((item) => ({
        title: item.title,
        summary: item.summary,
        scenario_implication: isKo
            ? `"${query}" 관련 루틴과 알림, 원격 확인 흐름을 이 생활 맥락에 맞게 시나리오에 반영합니다.`
            : `Reflect this context in routines, alerts, and remote-control flows tied to "${query}".`
    }));

    return {
        keyword_interpretation: isKo
            ? `"${query}"는 ${city} 생활 패턴 안에서 기존 10개 카테고리만으로 충분히 드러나지 않았던 추가 요구를 보완하는 키워드로 해석할 수 있습니다.`
            : `"${query}" adds a layer of everyday context in ${city} that may not be fully covered by the default 10 categories.`,
        search_intents: [
            isKo ? `${city} ${query} 생활 패턴` : `${city} ${query} daily life`,
            isKo ? `${city} ${query} 불편` : `${city} ${query} pain points`,
            isKo ? `${city} ${query} 돌봄 시나리오` : `${city} ${query} care routines`
        ],
        city_keyword_findings: findings.slice(0, 3),
        dedup_note: baseProfiles
            ? (isKo
                ? "기존 도시 프로필과 겹치는 설명은 줄이고, 추가 키워드가 만드는 새로운 사용 맥락만 추렸습니다."
                : "Repeated points from the existing city profile were reduced to keep only the extra context introduced by this keyword.")
            : "",
        recommended_reflection_points: [
            isKo
                ? `"${query}"가 필요한 시간대와 부재/동거 상황을 루틴 조건으로 반영`
                : `Reflect the time-of-day and presence conditions that make "${query}" relevant.`,
            isKo
                ? `"${query}"와 연결되는 모니터링·알림·자동화 장면을 우선 설계`
                : `Prioritize monitoring, notification, and automation moments connected to "${query}".`
        ],
        tags
    };
}

function normalizeCustomResearchPayload(payload, context) {
    const { query, city, locale, baseProfiles } = context;

    let source = payload;
    if (typeof source === "string") {
        source = parseJsonObjectFromModelText(source) || { raw: source };
    }
    if (source?.raw && typeof source.raw === "string") {
        const reparsed = parseJsonObjectFromModelText(source.raw);
        if (reparsed) source = reparsed;
    }
    if (source?.data && typeof source.data === "object") source = source.data;

    if (!source || typeof source !== "object") {
        return buildFallbackCustomResearch({ query, city, locale, baseProfiles, raw: payload });
    }

    const interpretation = typeof source.keyword_interpretation === "string" ? source.keyword_interpretation.trim() : "";
    const searchIntents = normalizeStringList(source.search_intents, 8);
    const reflectionPoints = normalizeStringList(source.recommended_reflection_points, 4);
    const tags = normalizeStringList(source.tags, 6);
    const findings = Array.isArray(source.city_keyword_findings)
        ? source.city_keyword_findings
            .filter((item) => item && typeof item === "object")
            .map((item) => ({
                title: typeof item.title === "string" ? item.title.trim() : "",
                summary: typeof item.summary === "string" ? item.summary.trim() : "",
                scenario_implication: typeof item.scenario_implication === "string" ? item.scenario_implication.trim() : ""
            }))
            .filter((item) => item.title || item.summary || item.scenario_implication)
            .slice(0, 5)
        : [];

    if (interpretation || findings.length || reflectionPoints.length) {
        return {
            keyword_interpretation: interpretation,
            search_intents: searchIntents,
            city_keyword_findings: findings,
            dedup_note: typeof source.dedup_note === "string" ? source.dedup_note.trim() : "",
            recommended_reflection_points: reflectionPoints,
            tags: tags.length ? tags : inferCustomResearchTags(query, JSON.stringify(source))
        };
    }

    const fallbackProfile = extractProfileHighlights(source, locale).reduce((acc, item) => {
        acc[item.key] = item.text;
        return acc;
    }, {});

    return buildFallbackCustomResearch({
        query,
        city,
        locale,
        baseProfiles,
        profileLike: fallbackProfile,
        raw: source.raw || JSON.stringify(source)
    });
}

async function handleCityProfile(req, res) {
    const authState = requireAuthenticatedSession(req, res);
    if (!authState.ok) return;

    const parsed = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const locale = parsed.searchParams.get("locale") || "ko";

    // POST body 먼저 파싱 — custom_query, base_profiles, city/country 폴백 추출
    let postBody = null;
    if (req.method === "POST") {
        try {
            postBody = await readJsonBody(req);
        } catch (err) {
            console.warn("[city-profile] POST body parse failed:", err.message);
        }
    }

    const country = parsed.searchParams.get("country") || postBody?.country || "";
    const city = parsed.searchParams.get("city") || postBody?.city || "";
    const customQuery = parsed.searchParams.get("custom_query") || postBody?.custom_query || "";
    const baseProfiles = postBody?.base_profiles || parsed.searchParams.get("base_profiles") || "";

    if (!city || !country) {
        sendJson(res, 400, { ok: false, error: { code: "MISSING_PARAMS", message: "country and city required." } });
        return;
    }

    const apiKey = process.env.OPENAI_API_KEY || "";
    const model = process.env.OPENAI_MODEL || "gpt-5.4";

    if (customQuery && !apiKey) {
        const fallbackResearch = normalizeCustomResearchPayload({ raw: "API_NOT_CONFIGURED" }, {
            query: customQuery,
            city,
            locale,
            baseProfiles
        });
        sendJson(res, 200, {
            ok: true,
            data: fallbackResearch,
            mode: "custom_research",
            meta: { city, country, locale, model, query: customQuery, fallback: true, fallback_reason: "API_NOT_CONFIGURED" }
        });
        return;
    }

    if (!apiKey) {
        sendJson(res, 500, { ok: false, error: { code: "API_NOT_CONFIGURED" } });
        return;
    }

    // custom_query가 있으면 커스텀 마켓 리서치 모드
    if (customQuery) {
        const maxTokens = 2000;
        const wikiCtx = await fetchWikiContext(country, city);
        const userMessage = `도시: ${city}, 국가: ${country}, 언어: ${locale}\n키워드: "${customQuery}"\n\n${baseProfiles ? `기존 base_profiles (중복 금지 대상):\n${baseProfiles}\n\n` : ""}${wikiCtx ? `═══ 참고 자료 (백과사전 출처 — 팩트 근거로 활용) ═══\n${wikiCtx}\n═══ 참고 자료 끝 ═══\n\n` : ""}위 도시에서 "${customQuery}" 키워드와 관련된 새로운 도시 맥락을 분석하세요. 기존 프로필에 이미 담긴 내용은 반복하지 말고, 키워드로 인해 새롭게 드러나는 인사이트만 출력하세요.`;

        const requestBody = {
                model,
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: CUSTOM_RESEARCH_SYSTEM_PROMPT },
                    { role: "user", content: userMessage }
                ]
            };
            if (/^gpt-5/i.test(model)) {
                requestBody.max_completion_tokens = maxTokens;
            } else {
                requestBody.max_tokens = maxTokens;
            }

        try {
            const result = await fetchOpenAiChatCompletionWithRetry({ apiKey, requestBody });
            const content = result.choices?.[0]?.message?.content || "{}";
            const parsedResearch = parseJsonObjectFromModelText(content) || { raw: content };
            const research = normalizeCustomResearchPayload(parsedResearch, {
                query: customQuery,
                city,
                locale,
                baseProfiles
            });

            sendJson(res, 200, { ok: true, data: research, mode: "custom_research", meta: { city, country, locale, model, query: customQuery } });
        } catch (err) {
            const fallbackResearch = normalizeCustomResearchPayload({ raw: err.message }, {
                query: customQuery,
                city,
                locale,
                baseProfiles
            });
            sendJson(res, 200, {
                ok: true,
                data: fallbackResearch,
                mode: "custom_research",
                meta: { city, country, locale, model, query: customQuery, fallback: true, fallback_reason: err.message }
            });
        }
        return;
    }

    // 기본 도시 프로필 모드 — Wiki RAG context 주입
    // Wiki context(~4K tokens) + system prompt(~2.5K) + user msg → 응답에 최소 4.5K 필요
    const maxTokens = 5000;
    const wikiContext = await fetchWikiContext(country, city);

    const userMessage = `Target country: ${country}
Target city: ${city}
Optional subregion: none
Output locale: ${locale}
${wikiContext ? `
═══ REFERENCE CONTEXT (from encyclopedia source — use as primary evidence) ═══
${wikiContext}
═══ END REFERENCE CONTEXT ═══

IMPORTANT: Use the reference context above as your PRIMARY source of facts. Extract specific district names, statistics, facility names, event names, and policy names from it. Cite "Wikipedia ${getWikiLang(country).toUpperCase()}" in your source_map. Only mark a category as "Evidence insufficient" if the reference context truly contains NO relevant information for that category.
` : ""}
Build a source-bound localization evidence pack for this city. Use only evidence-backed localized statements. If evidence is weak, mark that category as "Evidence insufficient for localized claim." Return valid JSON only.`;

    try {
        const requestBody = {
            model,
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: CITY_PROFILE_SYSTEM_PROMPT },
                { role: "user", content: userMessage }
            ]
        };
        if (/^gpt-5/i.test(model)) {
            requestBody.max_completion_tokens = maxTokens;
        } else {
            requestBody.max_tokens = maxTokens;
        }

        const result = await fetchOpenAiChatCompletionWithRetry({ apiKey, requestBody });
        const content = result.choices?.[0]?.message?.content || "{}";
        const profile = normalizeCityProfilePayload(parseJsonObjectFromModelText(content) || { raw: content }, {
            city,
            country,
            locale
        });

        res.setHeader("Cache-Control", "public, max-age=86400");
        sendJson(res, 200, { ok: true, data: profile, meta: { city, country, locale, model } });
    } catch (err) {
        sendJson(res, 502, { ok: false, error: { code: "UPSTREAM_ERROR", message: err.message } });
    }
}
