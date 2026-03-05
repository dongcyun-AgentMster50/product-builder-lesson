const COOKIE_NAME = "scenario_agent_session";
const ATTEMPT_COOKIE_NAME = "scenario_access_attempt";
const SESSION_TTL_MS_DEFAULT = 1000 * 60 * 60 * 8;
const MAX_FAILED_ATTEMPTS_DEFAULT = 3;
const LOCK_WINDOW_MS_DEFAULT = 1000 * 60;

export function getConfig(env) {
    const secret = String(env.ACCESS_HMAC_SECRET || "").trim();
    if (!secret) {
        throw new Error("Missing ACCESS_HMAC_SECRET");
    }

    const hashes = String(env.ACCESS_CODE_HASHES || "")
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter((item) => /^[a-f0-9]{64}$/.test(item));

    if (!hashes.length) {
        throw new Error("Missing ACCESS_CODE_HASHES");
    }

    return {
        secret,
        hashes,
        sessionTtlMs: Number(env.SESSION_TTL_MS || SESSION_TTL_MS_DEFAULT),
        maxFailedAttempts: Number(env.MAX_FAILED_ATTEMPTS || MAX_FAILED_ATTEMPTS_DEFAULT),
        lockWindowMs: Number(env.LOCK_WINDOW_MS || LOCK_WINDOW_MS_DEFAULT)
    };
}

export function json(payload, status = 200, extraHeaders = {}) {
    const headers = new Headers({
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
    });

    for (const [key, value] of Object.entries(extraHeaders)) {
        if (Array.isArray(value) && key.toLowerCase() === "set-cookie") {
            value.forEach((cookie) => headers.append("Set-Cookie", cookie));
            continue;
        }
        headers.set(key, value);
    }

    return new Response(JSON.stringify(payload), { status, headers });
}

export function methodNotAllowed() {
    return json({
        ok: false,
        error: {
            code: "METHOD_NOT_ALLOWED",
            message: "Method not allowed."
        }
    }, 405);
}

export function parseCookies(request) {
    const header = request.headers.get("Cookie") || "";
    const cookies = {};
    for (const part of header.split(";")) {
        const [rawName, ...rest] = part.trim().split("=");
        if (!rawName) continue;
        cookies[rawName] = rest.join("=");
    }
    return cookies;
}

export function clearCookie(name) {
    return `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function toBase64Url(text) {
    return btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(base64url) {
    const padded = base64url.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (base64url.length % 4)) % 4);
    return atob(padded);
}

async function sha256Hex(input) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
    const bytes = new Uint8Array(digest);
    return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hmacHex(input, secret) {
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(input));
    const bytes = new Uint8Array(signature);
    return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a, b) {
    if (a.length !== b.length) return false;
    let mismatch = 0;
    for (let i = 0; i < a.length; i += 1) {
        mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return mismatch === 0;
}

export async function hashAccessCode(accessCode, secret) {
    const normalized = String(accessCode || "").trim();
    if (!normalized) return "";
    return hmacHex(normalized, secret);
}

export async function isAccessCodeValid(accessCode, config) {
    const hash = await hashAccessCode(accessCode, config.secret);
    if (!hash) return false;
    return config.hashes.some((allowed) => safeEqual(hash, allowed));
}

export async function encodeSignedPayload(payload, secret) {
    const encoded = toBase64Url(JSON.stringify(payload));
    const signature = await hmacHex(encoded, secret);
    return `${encoded}.${signature}`;
}

export async function decodeSignedPayload(token, secret) {
    if (!token || typeof token !== "string") return null;
    const idx = token.lastIndexOf(".");
    if (idx <= 0) return null;
    const encoded = token.slice(0, idx);
    const signature = token.slice(idx + 1);
    const expected = await hmacHex(encoded, secret);
    if (!safeEqual(signature, expected)) return null;
    try {
        return JSON.parse(fromBase64Url(encoded));
    } catch {
        return null;
    }
}

export async function createSessionCookie(config) {
    const expiresAt = Date.now() + config.sessionTtlMs;
    const payload = {
        sid: crypto.randomUUID(),
        authenticated: true,
        expiresAt
    };
    const token = await encodeSignedPayload(payload, config.secret);
    const maxAge = Math.max(1, Math.floor(config.sessionTtlMs / 1000));
    return {
        cookie: `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`,
        expiresAt
    };
}

export async function readSession(request, config) {
    const cookies = parseCookies(request);
    const token = cookies[COOKIE_NAME];
    const payload = await decodeSignedPayload(token, config.secret);
    if (!payload || payload.authenticated !== true) return { authenticated: false };
    if (!Number.isFinite(payload.expiresAt) || payload.expiresAt <= Date.now()) return { authenticated: false };
    return { authenticated: true, expiresAt: payload.expiresAt };
}

export async function readAttemptState(request, config, clientSessionId) {
    const cookies = parseCookies(request);
    const token = cookies[ATTEMPT_COOKIE_NAME];
    const payload = await decodeSignedPayload(token, config.secret);
    const key = String(clientSessionId || "").trim() || "anonymous";
    if (!payload || payload.key !== key) {
        return { key, count: 0, firstFailedAt: 0, lockedUntil: 0 };
    }
    if (payload.lockedUntil > 0 && payload.lockedUntil <= Date.now()) {
        return { key, count: 0, firstFailedAt: 0, lockedUntil: 0 };
    }
    if (payload.firstFailedAt > 0 && Date.now() - payload.firstFailedAt > config.lockWindowMs) {
        return { key, count: 0, firstFailedAt: 0, lockedUntil: 0 };
    }
    return payload;
}

export async function setAttemptStateCookie(state, config) {
    const token = await encodeSignedPayload(state, config.secret);
    const maxAgeMs = Math.max(config.lockWindowMs, 1000 * 60);
    return `${ATTEMPT_COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${Math.floor(maxAgeMs / 1000)}`;
}

export function clearAttemptCookie() {
    return clearCookie(ATTEMPT_COOKIE_NAME);
}

export function clearSessionCookie() {
    return clearCookie(COOKIE_NAME);
}

export async function buildFailedAttemptState(previous, config) {
    const now = Date.now();
    const nextCount = Number(previous.count || 0) + 1;
    const firstFailedAt = Number(previous.firstFailedAt || 0) || now;
    const lockedUntil = nextCount >= config.maxFailedAttempts ? now + config.lockWindowMs : 0;
    return {
        key: previous.key,
        count: nextCount,
        firstFailedAt,
        lockedUntil
    };
}

export async function accessCodeHashFromPlain(accessCode) {
    const normalized = String(accessCode || "").trim();
    if (!normalized) return "";
    return sha256Hex(normalized);
}
