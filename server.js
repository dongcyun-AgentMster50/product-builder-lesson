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

async function buildLiveRegionInsight({ country, city, locale, role }) {
    const cityQuery = city || country;
    const geocode = await fetchOpenMeteoGeocode(cityQuery, country);
    const lat = Number(geocode?.latitude || 0);
    const lon = Number(geocode?.longitude || 0);

    const sources = [
        fetchWorldBankCountrySignals(country),
        fetchWorldBankUrbanSignals(country)
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
        evidence
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
