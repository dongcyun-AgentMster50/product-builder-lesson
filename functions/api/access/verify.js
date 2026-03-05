import {
    buildFailedAttemptState,
    clearAttemptCookie,
    createSessionCookie,
    getConfig,
    isAccessCodeValid,
    json,
    methodNotAllowed,
    readAttemptState,
    setAttemptStateCookie
} from "./_shared.js";

export async function onRequestPost(context) {
    let config;
    try {
        config = getConfig(context.env);
    } catch (error) {
        return json({
            ok: false,
            error: {
                code: "SERVER_MISCONFIGURED",
                message: "Access verification is not configured."
            }
        }, 500);
    }

    let body = {};
    try {
        body = await context.request.json();
    } catch {
        return json({
            ok: false,
            error: {
                code: "INVALID_JSON",
                message: "Invalid request body."
            }
        }, 400);
    }

    const clientSessionId = typeof body.clientSessionId === "string" ? body.clientSessionId : "";
    const attemptState = await readAttemptState(context.request, config, clientSessionId);
    if (attemptState.lockedUntil > Date.now()) {
        const retryAfterSeconds = Math.max(1, Math.ceil((attemptState.lockedUntil - Date.now()) / 1000));
        return json({
            ok: false,
            error: {
                code: "ACCESS_LOCKED",
                message: "Too many failed attempts. Try again later."
            },
            retryAfterSeconds,
            lockedUntil: new Date(attemptState.lockedUntil).toISOString()
        }, 429);
    }

    const accessCode = typeof body.accessCode === "string" ? body.accessCode : "";
    const valid = await isAccessCodeValid(accessCode, config);
    if (!valid) {
        const nextState = await buildFailedAttemptState(attemptState, config);
        const statusCode = nextState.lockedUntil > Date.now() ? 429 : 401;
        const retryAfterSeconds = nextState.lockedUntil > Date.now()
            ? Math.max(1, Math.ceil((nextState.lockedUntil - Date.now()) / 1000))
            : 0;
        const remainingAttempts = Math.max(0, config.maxFailedAttempts - nextState.count);
        return json({
            ok: false,
            error: {
                code: statusCode === 429 ? "ACCESS_LOCKED" : "INVALID_ACCESS_CODE",
                message: statusCode === 429 ? "Too many failed attempts. Try again later." : "Invalid access code."
            },
            remainingAttempts,
            ...(statusCode === 429 ? {
                retryAfterSeconds,
                lockedUntil: new Date(nextState.lockedUntil).toISOString()
            } : {})
        }, statusCode, {
            "Set-Cookie": await setAttemptStateCookie(nextState, config)
        });
    }

    const session = await createSessionCookie(config);
    return json({
        ok: true,
        session: {
            authenticated: true,
            expiresAt: new Date(session.expiresAt).toISOString()
        }
    }, 200, {
        "Set-Cookie": [session.cookie, clearAttemptCookie()]
    });
}

export function onRequest() {
    return methodNotAllowed();
}
