// /api/_prompt_loader — P6-A 인프라
// prompt.txt 의 [AGENT:NAME] / [AGENT:NAME_END] 마커 사이를 추출하는 로더.
//
// 사용:
//   import { loadAgentPrompt } from "./_prompt_loader.js";
//   const sys = await loadAgentPrompt(context, "CURATOR_A1");
//
// 캐시: 모듈 전역. 콜드 스타트마다 1회 prompt.txt 전체 읽고 모든 에이전트
// 섹션을 한 번에 추출 → 객체에 저장. 두 번째 호출부터는 fetch 안 함.
//
// 정책: 추출 실패 시 throw. 조용한 실패 금지.
//
// P6-A 단계에서는 어떤 에이전트도 이 함수를 호출하지 않는다 (인프라만 깔고
// 호출 X). P6-B 에서 curate.js → localize.js → expand.js → v2.html(Mode2) 순으로
// 인라인 system prompt 를 이 로더 호출로 교체한다.

const VALID_AGENTS = Object.freeze([
    "CURATOR_A1",
    "LOCALIZER_A2",
    "EXPANDER_A4",
    "COPY_CONSULT_M2"
]);

let _promptCache = null;

function extractAgentPrompts(text) {
    const out = {};
    for (const name of VALID_AGENTS) {
        // [AGENT:NAME] ... [AGENT:NAME_END] — 단일 발생 가정
        const beginToken = `[AGENT:${name}]`;
        const endToken = `[AGENT:${name}_END]`;
        const beginIdx = text.indexOf(beginToken);
        const endIdx = text.indexOf(endToken);
        if (beginIdx === -1 || endIdx === -1 || endIdx <= beginIdx) {
            throw new Error(`[_prompt_loader] marker not found or malformed for AGENT:${name}`);
        }
        const inner = text.slice(beginIdx + beginToken.length, endIdx);
        // 마커 직후/직전의 개행만 제거. 본문 내 공백은 보존.
        out[name] = inner.replace(/^\r?\n/, "").replace(/\r?\n\s*$/, "");
    }
    return out;
}

async function fetchPromptText(context) {
    // Cloudflare Pages Functions: env.ASSETS.fetch 로 정적 자산 접근.
    const env = context?.env || context;
    if (!env || !env.ASSETS || typeof env.ASSETS.fetch !== "function") {
        throw new Error("[_prompt_loader] env.ASSETS unavailable — cannot read prompt.txt");
    }
    const baseUrl = context?.request ? new URL(context.request.url).origin : "https://example.invalid";
    const url = new URL("/prompt.txt", baseUrl);
    const res = await env.ASSETS.fetch(url);
    if (!res.ok) {
        throw new Error(`[_prompt_loader] prompt.txt fetch failed: ${res.status}`);
    }
    return await res.text();
}

export async function loadAgentPrompt(context, agentName) {
    if (!VALID_AGENTS.includes(agentName)) {
        throw new Error(`[_prompt_loader] unknown agentName: ${agentName} (valid: ${VALID_AGENTS.join(", ")})`);
    }
    if (!_promptCache) {
        const text = await fetchPromptText(context);
        _promptCache = extractAgentPrompts(text);
    }
    const prompt = _promptCache[agentName];
    if (!prompt) {
        throw new Error(`[_prompt_loader] empty prompt for AGENT:${agentName}`);
    }
    return prompt;
}

// 테스트용 캐시 리셋 (운영 코드는 호출 X — TEST 2 검증용)
export function _resetPromptCache() {
    _promptCache = null;
}

export { VALID_AGENTS };
