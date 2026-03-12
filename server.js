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
const REGION_INSIGHT_TIMEOUT_MS = Number(process.env.REGION_INSIGHT_TIMEOUT_MS || 12000);
const REGION_INSIGHT_CACHE_TTL_MS = Number(process.env.REGION_INSIGHT_CACHE_TTL_MS || 1000 * 60 * 15);
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

    try {
        const liveInsight = await buildLiveRegionInsight({ country, city, locale, role });
        const payload = {
            role: liveInsight.role,
            role_lens: liveInsight.role_lens,
            macro: liveInsight.macro,
            local: liveInsight.local,
            evidence: liveInsight.evidence,
            visual: liveInsight.visual,
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
function callOpenAIStream({ systemPrompt, messages, apiKey, res, onDone, onError }) {
    if (!apiKey) {
        onError(new Error("OpenAI API key is required."));
        return;
    }

    const openaiMessages = [
        { role: "system", content: systemPrompt },
        ...messages
    ];

    const body = JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        max_tokens: 8000,
        stream: true,
        messages: openaiMessages
    });

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

/** Stream AI response via OpenAI. */
function callAIStream({ systemPrompt, messages, apiKey, res, onDone, onError }) {
    return callOpenAIStream({ systemPrompt, messages, apiKey, res, onDone, onError });
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
    const clientKey  = String(body?.apiKey || "").trim();
    const regionCtx  = body?.regionInsight ? JSON.stringify(body.regionInsight, null, 2) : null;

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

    sendSseHeaders(res);
    res.write(`data: ${JSON.stringify({ type: "start" })}\n\n`);

    let done = false;
    callAIStream({
        systemPrompt,
        apiKey: clientKey,
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
    const clientKey         = String(body?.apiKey || "").trim();

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
        console.warn(`Failed to read ${ACCESS_CODES_FILE}. Using fallback access codes instead.`, error.message);
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
    if (normalized.startsWith("ko")) return "ko";
    if (normalized.startsWith("de")) return "de";
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

async function buildLiveRegionInsight({ country, city, locale, role }) {
    const cityQuery = city || country;
    const geocode = await fetchOpenMeteoGeocode(cityQuery, country);
    const lat = Number(geocode?.latitude || 0);
    const lon = Number(geocode?.longitude || 0);

    const sources = [
        fetchWorldBankCountrySignals(country),
        fetchWorldBankUrbanSignals(country),
        fetchCountryProfile(country)
    ];
    if (lat && lon) {
        sources.push(fetchOpenMeteoSignals(lat, lon));
    }
    if (city) {
        sources.push(fetchNominatimCitySignals(city, country));
    }

    const settled = await Promise.allSettled(sources.map((sourcePromise) => withTimeout(() => sourcePromise, REGION_INSIGHT_TIMEOUT_MS)));
    const fulfilled = settled.filter((entry) => entry.status === "fulfilled").map((entry) => entry.value);
    if (fulfilled.length === 0) {
        throw Object.assign(new Error("All live insight sources failed."), { code: "REGION_INSIGHT_ALL_SOURCES_FAILED" });
    }

    const worldBankMarket = fulfilled.find((item) => item.type === "worldbank_market");
    const worldBankUrban = fulfilled.find((item) => item.type === "worldbank_urban");
    const climate = fulfilled.find((item) => item.type === "openmeteo");
    const citySignal = fulfilled.find((item) => item.type === "nominatim_city");
    const countryProfile = fulfilled.find((item) => item.type === "country_profile");

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
        visual: buildVisualInsight({ country, city, geocode, countryProfile, landmark: null })
    };
}

function buildRoleLensInsight({ role, locale, country, city }) {
    const marketLabel = city ? `${country} ${city}` : country;
    const isKo = locale === "ko";
    const isDe = locale === "de";

    if (role === "dotcom") {
        return {
            why_this_matters: isKo
                ? `${marketLabel}에서는 유입 키워드와 랜딩 전환 장벽을 먼저 정리할수록 캠페인 효율이 올라갑니다.`
                : isDe
                    ? `In ${marketLabel} steigen Ergebnisse, wenn Suchintent und Conversion-Hürden zuerst geklärt werden.`
                    : `In ${marketLabel}, results improve when search intent and conversion friction are clarified first.`,
            must_know: isKo
                ? [
                    "검색/광고 유입 사용자가 기대하는 문제 해결 문장을 헤드라인에 반영",
                    "PDP 이탈 구간을 1~2개 핵심 장벽으로 단순화",
                    "시간 절약·비용 절감 근거를 첫 스크롤 내 배치"
                ]
                : [
                    "Reflect problem-first search intent in the first headline.",
                    "Reduce PDP drop-off friction to one or two obvious blockers.",
                    "Place time/cost payoff proof above the first scroll."
                ],
            execution_points: isKo
                ? [
                    "광고 메시지와 랜딩 H1 약속을 동일하게 맞춤",
                    "CTA 직전에 설치 난이도와 체감 시간 안내",
                    "Q3 타겟별 A/B 헤드라인 2안 작성"
                ]
                : [
                    "Align ad promise and landing H1 as one message.",
                    "Add setup effort and payoff time before CTA.",
                    "Prepare two A/B headlines per Q3 segment."
                ],
            primary_metric: isKo ? "CTR -> PDP 전환율 -> 구매 전환율" : "CTR -> PDP conversion -> purchase conversion",
            next_step: isKo
                ? "Q3에 타겟 1개와 유입 상황 1개를 고정하고, 검증할 KPI를 하나만 지정하세요."
                : "In Q3, lock one target and one entry context, then pick one KPI to validate."
        };
    }

    if (role === "brand") {
        return {
            why_this_matters: isKo
                ? `${marketLabel}에서는 기능 나열보다 문화 맥락에 맞는 스토리 각도가 브랜드 선호를 더 빠르게 만듭니다.`
                : isDe
                    ? `In ${marketLabel} wirkt ein kulturpassender Story-Winkel stärker als reine Feature-Auflistung.`
                    : `In ${marketLabel}, culture-fit storytelling builds brand preference faster than feature lists.`,
            must_know: isKo
                ? [
                    "시장 맥락에서 공감되는 생활 장면(가족/웰빙/시간가치) 정의",
                    "브랜드가 해결하는 감정적 긴장을 한 문장으로 명시",
                    "글로벌 메시지와 로컬 표현의 역할 분리"
                ]
                : [
                    "Define one culturally resonant life scene first.",
                    "Name the emotional tension the brand resolves in one line.",
                    "Separate global message backbone from local expression."
                ],
            execution_points: isKo
                ? [
                    "캠페인 첫 문장을 기능이 아닌 사람의 변화로 시작",
                    "영상/소셜/배너에 동일 감정 키워드 유지",
                    "Q3 타겟용 3컷 스토리보드(문제-전환-해결) 작성"
                ]
                : [
                    "Open campaign copy with human change, not specs.",
                    "Keep one emotional keyword across video/social/banner.",
                    "Draft a 3-cut storyboard (problem-shift-resolution) for Q3 segment."
                ],
            primary_metric: isKo ? "브랜드 선호도 + 메시지 회상률" : "Brand preference + message recall",
            next_step: isKo
                ? "Q3에 타겟과 감정 키워드를 함께 고정하고, 스토리 톤을 한 줄로 정의하세요."
                : "In Q3, lock target and emotional keyword, then define tone in one line."
        };
    }

    return {
        why_this_matters: isKo
            ? `${marketLabel}에서는 매장 대화에 바로 쓰는 설명 구조가 판매 전환에 가장 직접적으로 연결됩니다.`
            : isDe
                ? `In ${marketLabel} wirkt eine sofort nutzbare In-Store-Erklärung am direktesten auf den Abschluss.`
                : `In ${marketLabel}, an in-store explanation flow staff can use immediately is most conversion-critical.`,
        must_know: isKo
            ? [
                "매장에서 가장 먼저 나오는 질문(가격/설치/호환) 우선 정리",
                "기능보다 고객 일상의 변화 포인트를 먼저 제시",
                "첫 시연 30초 내 체감 포인트 제시"
            ]
            : [
                "Prioritize first in-store objections: price, setup, compatibility.",
                "Lead with daily-life payoff before feature detail.",
                "Show one felt benefit within the first 30 seconds."
            ],
        execution_points: isKo
            ? [
                "직원용 1문장 오프너 + 2문장 클로징 스크립트 작성",
                "시연 순서를 문제-체감-증거 3단계로 고정",
                "Q3 타겟에 맞춘 FAQ 반박 문장 3개 준비"
            ]
            : [
                "Write a 1-line opener and 2-line closer for store staff.",
                "Fix demo order as problem -> felt payoff -> proof.",
                "Prepare three objection-handling lines for the Q3 target."
            ],
        primary_metric: isKo ? "상담 전환율 + 시연 완료율" : "Consultation conversion + demo completion",
        next_step: isKo
            ? "Q3에 타겟 고객 1명과 매장 상황 1개를 고정하고 시연 문장을 작성하세요."
            : "In Q3, lock one shopper type and one store context, then draft the demo line."
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
        source: "api.worldbank.org"
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
        source: "api.worldbank.org"
    };
}

async function fetchOpenMeteoGeocode(cityQuery, country) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityQuery)}&count=1&language=en&countryCode=${country}&format=json`;
    const payload = await fetchJsonWithTimeout(url);
    return Array.isArray(payload?.results) && payload.results.length ? payload.results[0] : null;
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
        source: "api.open-meteo.com"
    };
}

async function fetchNominatimCitySignals(city, country) {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&city=${encodeURIComponent(city)}&countrycodes=${country.toLowerCase()}&limit=1`;
    const payload = await fetchJsonWithTimeout(url, {
        headers: {
            "User-Agent": "scenario-self-generation-agent/1.0 (+local)"
        }
    });
    const top = Array.isArray(payload) && payload.length ? payload[0] : null;
    return {
        type: "nominatim_city",
        className: top?.class || "",
        typeName: top?.type || "",
        importance: Number(top?.importance || 0),
        displayName: top?.display_name || city,
        source: "nominatim.openstreetmap.org"
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
