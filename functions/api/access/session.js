import { clearSessionCookie, getConfig, json, methodNotAllowed, readSession } from "./_shared.js";

export async function onRequestGet(context) {
    let config;
    try {
        config = getConfig(context.env);
    } catch {
        return json({
            ok: false,
            session: {
                authenticated: false
            }
        }, 200);
    }

    const session = await readSession(context.request, config);
    if (!session.authenticated) {
        return json({
            ok: false,
            session: {
                authenticated: false
            }
        }, 200, {
            "Set-Cookie": clearSessionCookie()
        });
    }

    return json({
        ok: true,
        session: {
            authenticated: true,
            expiresAt: new Date(session.expiresAt).toISOString()
        }
    }, 200);
}

export function onRequest() {
    return methodNotAllowed();
}
