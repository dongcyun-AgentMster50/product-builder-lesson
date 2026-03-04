"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 8000);
const ROOT_DIR = __dirname;
const COOKIE_NAME = "scenario_agent_session";
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS || 1000 * 60 * 60 * 8);
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

const server = http.createServer(async (req, res) => {
    try {
        console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);

        if (req.url === "/api/access/verify" && req.method === "POST") {
            await handleVerify(req, res);
            return;
        }

        if (req.url === "/api/access/session" && req.method === "GET") {
            handleSession(req, res);
            return;
        }

        if (req.url === "/api/access/logout" && req.method === "POST") {
            handleLogout(req, res);
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

    setSessionCookie(res, token, expiresAt);
    sendJson(res, 200, {
        ok: true,
        session: {
            authenticated: true,
            expiresAt: expiresAt.toISOString()
        }
    });
}

function handleSession(req, res) {
    const cookies = parseCookies(req.headers.cookie || "");
    const token = cookies[COOKIE_NAME];
    const session = token ? sessions.get(token) : null;

    if (!session || session.expiresAt.getTime() <= Date.now()) {
        if (token) {
            sessions.delete(token);
            clearSessionCookie(res);
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

function handleLogout(req, res) {
    const cookies = parseCookies(req.headers.cookie || "");
    const token = cookies[COOKIE_NAME];
    if (token) {
        sessions.delete(token);
    }

    clearSessionCookie(res);
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

function setSessionCookie(res, token, expiresAt) {
    const parts = [
        `${COOKIE_NAME}=${token}`,
        "Path=/",
        "HttpOnly",
        "SameSite=Lax",
        `Max-Age=${Math.floor((expiresAt.getTime() - Date.now()) / 1000)}`
    ];

    if (process.env.COOKIE_SECURE === "true") {
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

function clearSessionCookie(res) {
    res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
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
