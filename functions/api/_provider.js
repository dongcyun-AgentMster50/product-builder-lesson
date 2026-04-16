// Provider auto-detection based on API key prefix
// Centralizes BYOK routing: header key > env OpenAI > env Gemini

export function detectProvider(apiKey) {
    if (!apiKey) return null;
    const k = String(apiKey).trim();
    if (k.startsWith("AIza")) return "gemini";
    if (k.startsWith("sk-ant-")) return "anthropic";
    if (k.startsWith("sk-")) return "openai";
    return null;
}

// Resolves which provider/key to use for this request.
// Priority: 1) BYOK header (user key) → 2) env OPENAI_API_KEY → 3) env GEMINI_API_KEY
export function resolveProviderKey(context) {
    // 1. BYOK header (user's own key) — highest priority
    const headerKey = String(context.request.headers.get("X-User-Api-Key") || "").trim();
    const headerProvider = detectProvider(headerKey);
    if (headerProvider) {
        return { provider: headerProvider, apiKey: headerKey, source: "header" };
    }

    // 2. Fallback: OpenAI first (for Q1 RAG quality), Gemini second (free tier)
    const openaiKey = String(context.env?.OPENAI_API_KEY || "").trim();
    if (openaiKey) {
        return { provider: "openai", apiKey: openaiKey, source: "env_openai" };
    }

    const geminiKey = String(context.env?.GEMINI_API_KEY || "").trim();
    if (geminiKey) {
        return { provider: "gemini", apiKey: geminiKey, source: "env_gemini" };
    }

    return { provider: null, apiKey: null, source: null };
}

// Helper: mask key for safe logging
export function maskKey(key) {
    if (!key) return "(none)";
    const s = String(key);
    return s.slice(0, 4) + "***" + s.slice(-2);
}
