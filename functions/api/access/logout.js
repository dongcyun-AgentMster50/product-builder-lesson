import { clearSessionCookie, getConfig, json, methodNotAllowed } from "./_shared.js";

export function onRequestPost(context) {
    try {
        getConfig(context.env);
    } catch {
        // Even if misconfigured, clear cookie and return signed-out state.
    }

    return json({
        ok: true,
        session: {
            authenticated: false
        }
    }, 200, {
        "Set-Cookie": clearSessionCookie()
    });
}

export function onRequest() {
    return methodNotAllowed();
}
