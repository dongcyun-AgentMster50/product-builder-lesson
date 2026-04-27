// Provider auto-detection based on API key prefix
// Centralizes BYOK routing: header key > env OpenAI > env Gemini

// ─── DEFAULT MODELS (Single Source of Truth) ─────────────────────────────
// 정책: BYOK 사용자가 자기 비용을 부담하므로 품질 우선.
// 3-provider 모두 "표준 플래그십" 등급으로 통일. 모든 v2 Agent(A1/A2/A4) +
// Mode(CX/Copy) 단일 모델 사용. 라우터 패턴 도입 X.
//
// 모델 ID 검증 결과 (2026-04 기준):
// - openai: 'gpt-5' — 작동 확인. (참고: 더 최신 'gpt-5.5'/'gpt-5.4' 존재.
//   spec 결정에 따라 'gpt-5' 유지. legacy ID 로 호환됨.)
// - anthropic: 'claude-sonnet-4-6' — 시스템 프롬프트 ref 와 일치, 정확.
// - gemini: 'gemini-3.1-pro-preview' — 정확한 ID. 점(.) + '-preview' 접미사
//   필수. 평문 'gemini-3-1-pro' 또는 'gemini-3-pro' 는 무효.
//   ('gemini-3-pro-preview' 는 2026-03-09 종료됨)
//
// 향후 라우터 패턴 도입 후보 (현재 미적용 — 품질 우선 정책):
// - 비용 부담 시 A1(JSON 매칭)을 budget 모델로 분리 가능
//   · OpenAI: gpt-5-mini ($0.25/$2)
//   · Anthropic: claude-haiku-4-5
//   · Google: gemini-3-flash-preview ($0.50/$3)
export const DEFAULT_MODELS = Object.freeze({
    openai: "gpt-5",
    anthropic: "claude-sonnet-4-6",
    gemini: "gemini-3.1-pro-preview"
});

// UI 표시명 (v2.html provider-badge, BYOK 모달 등) — DEFAULT_MODELS 와 키 동기화
export const DEFAULT_MODEL_LABELS = Object.freeze({
    openai: "GPT-5",
    anthropic: "Claude Sonnet 4.6",
    gemini: "Gemini 3.1 Pro"
});

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
// Returns additionally `modelHint` — user's explicit model preference (e.g. "gemini-2.5-pro")
export function resolveProviderKey(context) {
    const modelHint = String(context.request.headers.get("X-User-Model-Hint") || "").trim() || null;

    // 1. BYOK header (user's own key) — highest priority
    const headerKey = String(context.request.headers.get("X-User-Api-Key") || "").trim();
    const headerProvider = detectProvider(headerKey);
    if (headerProvider) {
        return { provider: headerProvider, apiKey: headerKey, source: "header", modelHint };
    }

    // 2. Fallback: OpenAI first (for Q1 RAG quality), Gemini second (free tier)
    const openaiKey = String(context.env?.OPENAI_API_KEY || "").trim();
    if (openaiKey) {
        return { provider: "openai", apiKey: openaiKey, source: "env_openai", modelHint };
    }

    const geminiKey = String(context.env?.GEMINI_API_KEY || "").trim();
    if (geminiKey) {
        return { provider: "gemini", apiKey: geminiKey, source: "env_gemini", modelHint };
    }

    return { provider: null, apiKey: null, source: null, modelHint: null };
}

// Helper: mask key for safe logging
export function maskKey(key) {
    if (!key) return "(none)";
    const s = String(key);
    return s.slice(0, 4) + "***" + s.slice(-2);
}
