// /api/curate — A1 CURATOR (P5-A 마이그레이션)
// v2.html 의 runCurator() 가 callAI 직접 호출하던 것을 백엔드 엔드포인트로 분리.
//
// 입력 (POST body): { role, country, city, home, family[], devices[], values[], interests[], locale }
//   - 27 DB summary 는 클라가 안 보냄. 서버가 모듈 전역 캐시로 자체 로드.
//   - BYOK 키는 'X-User-Api-Key' 헤더 (resolveProviderKey 재사용).
// 응답: { top3: [...], curation_note: "..." }  ← v2.html 기존 호환 그대로
//
// 시스템 프롬프트는 일단 인라인 (P6 에서 prompt.txt 통합 예정).

import { json } from "./access/_shared.js";
import { resolveProviderKey, maskKey, DEFAULT_MODELS } from "./_provider.js";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// ─── 27개 시나리오 DB 메모리 캐시 ─────────────────────────────────────────
// Cloudflare Worker 인스턴스 단위 글로벌. 콜드 스타트마다 1회 27 fetch, 이후 캐시.
let _scenarioSummaryCache = null;

async function loadScenarioSummary(context) {
    if (_scenarioSummaryCache) return _scenarioSummaryCache;
    const baseUrl = new URL(context.request.url).origin;
    const out = [];
    for (let i = 1; i <= 27; i++) {
        const num = String(i).padStart(3, "0");
        try {
            const res = await context.env.ASSETS.fetch(new URL(`/scenarios/db/scenario_${num}.json`, baseUrl));
            if (!res.ok) continue;
            const j = await res.json();
            const s = Array.isArray(j.scenarios) ? j.scenarios[0] : j;
            if (!s) continue;
            const d0 = s.depth_0 || {};
            const d1 = s.depth_1 || {};
            const title = d0.card_title || d1.title || "제목없음";
            const cat = d0.category || "-";
            const devs = (d1.device_icons || d1.devices_used || []).join("·") || "-";
            const summary = (d1.description || d0.thumbnail_desc || "").slice(0, 80);
            out.push(`[${num}] ${title} | 카테고리: ${cat} | 기기: ${devs} | ${summary}`);
        } catch { /* skip */ }
    }
    _scenarioSummaryCache = out.join("\n");
    return _scenarioSummaryCache;
}

// ─── A1 CURATOR 시스템 프롬프트 (v2.html 1488-1522 그대로 이식) ──────────
const A1_SYSTEM_PROMPT = `당신은 SmartThings 마케팅 시나리오 큐레이터입니다.
마케터가 답한 5단계 문답(채널·국가·고객 프로필·보유 기기·가치/관심사)을 **모두 균형 있게 반영**하여 27개 시나리오 DB에서 가장 적합한 TOP 3를 선택하세요.

[선택 기준 — 가중치]
1. 가치 태그와의 직접 매칭 (필수)
2. 보유 기기 중복도: 시나리오에 등장하는 기기와 사용자가 선택한 기기의 교집합 크기
3. 고객 프로필 적합도: 거주 형태·가족 구성이 시나리오 맥락과 자연스러운가
4. 관심사 가산점: 선택된 관심사와 시나리오 카테고리 간 연결
5. 채널·국가 톤 보정: 예) 리테일은 체험 가능한 즉각 효과, 닷컴은 구매 전환, 브랜드는 스토리성

[필수 제약]
- 사용자가 기기를 여러 개 선택했다면 그 기기가 실제로 등장·연동되는 시나리오 우선
- 가족 구성에 '영유아·어린이'가 있으면 케어/안전 카테고리, '시니어'는 시니어 케어·낙상 감지 등에 가중치
- match_score는 숫자로만 (실제 적합도 기반, 무조건 높게 주지 말 것)
- why는 구체적이어야 하며 사용자가 선택한 항목들을 반드시 인용

반드시 JSON 형식으로만 응답하세요:
{
  "top3": [
    {
      "rank": 1,
      "scenario_id": "XXX",
      "title": "시나리오 제목",
      "thumbnail": "2-3문장 스토리 요약",
      "match_score": 87,
      "why": "이 시나리오를 선택한 이유 — 사용자가 선택한 구체적 기기·프로필·가치와의 연관성을 인용",
      "matched_devices": ["사용자 선택 기기 중 이 시나리오와 겹치는 것들"],
      "value_tags": ["Care", "Save"],
      "key_devices": ["시나리오 핵심 기기"]
    }
  ],
  "curation_note": "TOP 3를 고른 전략 한 줄 메모 (사용자 입력 패턴을 반영)"
}`;

// ─── User 프롬프트 빌더 ──────────────────────────────────────────────────
function buildA1UserMessage(body, scenarioSummaries) {
    const roleNames = { retail: "리테일(매장)", dotcom: "닷컴(온라인)", brand: "브랜드(캠페인)" };
    const countryNames = {
        KR: "한국", US: "미국", JP: "일본", AU: "호주", IN: "인도",
        DE: "독일", UK: "영국", CN: "중국", BR: "브라질", MX: "멕시코", SG: "싱가포르", SE: "스웨덴"
    };
    const homeLabel = { apartment: "아파트", house: "단독주택", villa: "빌라·연립", studio: "원룸·스튜디오", officetel: "오피스텔" };
    const familyLabel = { single: "1인 가구", couple: "커플·부부", kids: "영유아·어린이", teens: "청소년", senior: "시니어", pet: "반려동물" };
    const interestLabel = { energy: "에너지 절약", kids_care: "육아·자녀 케어", senior_care: "시니어 케어", pet_care: "반려동물 케어", health: "건강·웰니스", entertainment: "홈 엔터테인먼트", security: "홈 보안", cooking: "요리·주방", sleep: "수면·릴렉스", cleaning: "청소·위생" };

    const role = String(body?.role || "").trim();
    const country = String(body?.country || "").trim();
    const city = String(body?.city || "").trim();
    const home = String(body?.home || "").trim();
    const family = Array.isArray(body?.family) ? body.family : [];
    const devices = Array.isArray(body?.devices) ? body.devices : [];
    const values = Array.isArray(body?.values) ? body.values : [];
    const interests = Array.isArray(body?.interests) ? body.interests : [];

    return `마케터·고객 프로필 입력:
- 담당 채널: ${roleNames[role] || role || "(미입력)"}
- 국가: ${countryNames[country] || country || "(미입력)"}${city ? " / " + city : ""}
- 거주 형태: ${home ? (homeLabel[home] || home) : "미입력"}
- 가족 구성: ${family.length ? family.map(f => familyLabel[f] || f).join(", ") : "미입력"}
- 보유·주력 기기 (${devices.length}개): ${devices.length ? devices.join(", ") : "미입력"}
- 핵심 가치 태그: ${values.join(", ") || "미입력"}
- 세부 관심사: ${interests.length ? interests.map(i => interestLabel[i] || i).join(", ") : "없음"}

시나리오 DB (27개):
${scenarioSummaries}

위 DB에서 이 사용자에게 가장 적합한 TOP 3 시나리오를 [선택 기준 — 가중치] 순서대로 반영하여 선정해주세요.`;
}

// ─── LLM 호출 (비-streaming, JSON 모드) ─────────────────────────────────
async function callOpenAI({ apiKey, systemPrompt, userMessage, model }) {
    const requestBody = {
        model,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
    };
    if (/^gpt-5/i.test(String(model || "").trim())) {
        requestBody.max_completion_tokens = 2000;
    } else {
        requestBody.max_tokens = 2000;
    }
    const res = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify(requestBody)
    });
    if (!res.ok) {
        const errText = await res.text().catch(() => "");
        let msg = `OpenAI ${res.status}`;
        try { msg = JSON.parse(errText)?.error?.message || msg; } catch { /* ignore */ }
        throw new Error(msg);
    }
    const d = await res.json();
    return d.choices?.[0]?.message?.content || "";
}

async function callAnthropic({ apiKey, systemPrompt, userMessage, model }) {
    const res = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
            model,
            max_tokens: 2000,
            system: systemPrompt,
            messages: [{ role: "user", content: userMessage }]
        })
    });
    if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Anthropic ${res.status}: ${errText.slice(0, 200)}`);
    }
    const d = await res.json();
    return d.content?.[0]?.text || "";
}

async function callGemini({ apiKey, systemPrompt, userMessage, model }) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: userMessage }] }],
            generationConfig: {
                maxOutputTokens: 2000,
                temperature: 0.7,
                responseMimeType: "application/json"
            }
        })
    });
    if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Gemini ${res.status}: ${errText.slice(0, 200)}`);
    }
    const d = await res.json();
    const parts = d.candidates?.[0]?.content?.parts || [];
    return parts.map(p => p.text || "").join("");
}

// ─── 메인 핸들러 ─────────────────────────────────────────────────────────
export async function onRequestPost(context) {
    // BYOK 키 해석 — header (X-User-Api-Key) 우선, env fallback 가능
    const { provider, apiKey, source: keySource, modelHint } = resolveProviderKey(context);
    if (!provider) {
        return json({
            ok: false,
            error: { code: "API_NOT_CONFIGURED", message: "API 키가 필요합니다. BYOK 모달에서 키를 입력해주세요." }
        }, 400);
    }

    let body;
    try {
        body = await context.request.json();
    } catch {
        return json({ ok: false, error: { code: "BAD_REQUEST", message: "Invalid JSON body." } }, 400);
    }

    // 27 DB 로드 (메모리 캐시)
    let scenarioSummaries;
    try {
        scenarioSummaries = await loadScenarioSummary(context);
        if (!scenarioSummaries) {
            return json({ ok: false, error: { code: "DB_LOAD_FAILED", message: "시나리오 DB 로드 실패." } }, 500);
        }
    } catch (e) {
        return json({ ok: false, error: { code: "DB_LOAD_FAILED", message: e.message } }, 500);
    }

    const userMessage = buildA1UserMessage(body, scenarioSummaries);
    // DEFAULT_MODELS 단일 소스. env override 가능 (운영 시 비상 강제 변경용).
    // BYOK 사용자 요청 헤더 X-User-Model-Hint 가 최우선.
    const model = provider === "openai"
        ? String(modelHint || context.env?.OPENAI_MODEL || DEFAULT_MODELS.openai).trim()
        : (provider === "anthropic"
            ? String(modelHint || context.env?.ANTHROPIC_MODEL || DEFAULT_MODELS.anthropic).trim()
            : String(modelHint || context.env?.GEMINI_MODEL || DEFAULT_MODELS.gemini).trim());

    console.info(JSON.stringify({
        type: "curate_request",
        ts: new Date().toISOString(),
        provider, source: keySource, keyMask: maskKey(apiKey), model,
        role: body?.role, country: body?.country, city: body?.city,
        deviceCount: Array.isArray(body?.devices) ? body.devices.length : 0,
        valueCount: Array.isArray(body?.values) ? body.values.length : 0
    }));

    let raw;
    try {
        if (provider === "openai") {
            raw = await callOpenAI({ apiKey, systemPrompt: A1_SYSTEM_PROMPT, userMessage, model });
        } else if (provider === "anthropic") {
            raw = await callAnthropic({ apiKey, systemPrompt: A1_SYSTEM_PROMPT, userMessage, model });
        } else if (provider === "gemini") {
            raw = await callGemini({ apiKey, systemPrompt: A1_SYSTEM_PROMPT, userMessage, model });
        } else {
            return json({ ok: false, error: { code: "PROVIDER_NOT_SUPPORTED", message: `${provider} not supported` } }, 400);
        }
    } catch (e) {
        return json({ ok: false, error: { code: "UPSTREAM_ERROR", message: e.message } }, 502);
    }

    // JSON 추출 (LLM 이 ```json 펜스를 끼워 보내는 경우 방어)
    const cleaned = String(raw || "").replace(/```json|```/g, "").trim();
    let result;
    try {
        result = JSON.parse(cleaned);
    } catch (e) {
        return json({
            ok: false,
            error: { code: "INVALID_JSON", message: "LLM 응답을 JSON 으로 파싱하지 못했습니다.", raw: cleaned.slice(0, 500) }
        }, 502);
    }

    if (!result || !Array.isArray(result.top3)) {
        return json({
            ok: false,
            error: { code: "INVALID_SHAPE", message: "응답에 top3 배열이 없습니다.", got: Object.keys(result || {}) }
        }, 502);
    }

    return json({ ok: true, top3: result.top3, curation_note: result.curation_note || "" });
}
