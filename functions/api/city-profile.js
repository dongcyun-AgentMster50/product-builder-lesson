import { clearSessionCookie, getConfig, json, readSession } from "./access/_shared.js";
import { enforceMonthlyBudget, estimateUsageCost, recordUsageCost } from "./_shared_ai.js";
import { callGeminiAsOpenAI, resolveGeminiKey } from "./_gemini.js";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const CITY_PROFILE_UPSTREAM_TIMEOUT_MS = 65000;
const CITY_PROFILE_UPSTREAM_MAX_ATTEMPTS = 2;

const CITY_PROFILE_SYSTEM_PROMPT = `You are a Geo-Localization Evidence Extractor for a scenario-generation system.

Your task is to produce a source-bound city evidence pack for consumer experience, smart home, automation, and local marketing scenario generation.

═══ HARD RULES (violation = output rejected) ═══

1. EVERY sentence MUST contain at least one LOCAL ANCHOR.
   Anchor types: district name, station name, road/street name, facility name, event/festival name, specific statistic, official policy name.
   A sentence without a named local anchor is ALWAYS rejected.

2. NO UNSOURCED CLAIMS — zero tolerance.
   Every accepted category must trace back to source_map entries via evidence_ids.
   If you cannot name a source, the claim does not exist.

3. NO GENERIC CITY LANGUAGE — zero tolerance.
   Test: "Could this sentence describe 3+ other cities if I removed the city name?" If yes → reject it.
   ❌ FAIL: "The city has four distinct seasons and hot summers."
   ❌ FAIL: "Natural green spaces coexist with residential areas."
   ❌ FAIL: "Local festivals and cultural events are held seasonally."
   ✅ PASS: "소요단풍문화제, 소요산 봄나들이 축제, 소요산 국화전시회 are held seasonally, shifting foot traffic patterns around Soyosan station." [S3]

4. ONE SOURCE PER CONFLICTING STATISTIC — never blend numbers from different sources.

5. WEAK EVIDENCE → mark insufficient, never fabricate.
   Output exactly: "Evidence insufficient for localized claim."
   Do NOT pad weak categories with generic filler to make them look complete.

6. OFFICIAL/PRIMARY SOURCES FIRST.
   Community sources (blogs, forums) may only supplement and must be labeled tier "B" or "C".
   A community source alone CANNOT be the sole proof for any category.

7. NO OVER-INFERENCE from a single place, event, or data point.
   One park does not prove "the city is green." One festival does not prove "vibrant cultural life."

8. CONCISE, REUSABLE OUTPUT — every sentence must be directly consumable by downstream scenario agents.

9. LOCALE RULE: natural-language fields → requested locale language. JSON keys → always English.

10. SELF-CHECK BEFORE OUTPUT: re-read every category summary and evidence_pack entry.
    For each, verify: (a) contains named local anchor, (b) has evidence_ids pointing to source_map, (c) fails the generic-city test.
    If any check fails, rewrite or mark insufficient.

═══ QUALITY EXAMPLES ═══

❌ REJECTED (climate): "The city experiences four distinct seasons with hot summers."
   → No anchor, no source, fits any temperate city.
✅ ACCEPTED (climate): "내륙 분지 지형으로 경기북부에서도 한서 차가 크며, 소요산 일대는 겨울 최저기온이 –15°C 이하로 떨어지는 날이 연 15일 이상 기록된다." [S1: 기상청 동두천 관측소]

❌ REJECTED (safety): "Safety and nighttime walkability are important for residents."
   → No facility/policy name, generic concern.
✅ ACCEPTED (safety): "CCTV통합관제센터 기반 안전귀가 서비스, CCTV 위치지도, 범죄예방 도시환경디자인(CPTED) 계획이 운영 중이다." [S5: 동두천시청 안전정책]

❌ REJECTED (events): "The area hosts various cultural events throughout the year."
   → No event names, no dates, no locations.
✅ ACCEPTED (events): "소요단풍문화제(10월), 소요산 봄나들이 축제(4월), 소요산 국화전시회(11월)가 계절별로 운영되며 소요산역~자재암 구간 유동인구가 평시 대비 3배 이상 증가한다." [S3: 동두천 문화관광]

═══ REQUIRED 10 CATEGORIES ═══
climate, housing, family, daily_rhythm, safety, energy, health, pets, mobility, events

═══ OUTPUT JSON STRUCTURE (return valid JSON only, no other text) ═══
{
  "climate": "1-3 sentences with local anchor(s) and source reference, or Evidence insufficient for localized claim.",
  "housing": "...",
  "family": "...",
  "daily_rhythm": "...",
  "safety": "...",
  "energy": "...",
  "health": "...",
  "pets": "...",
  "mobility": "...",
  "events": "...",
  "source_map": [
    {
      "id": "S1",
      "title": "source title",
      "organization": "source organization",
      "published_or_updated": "date if known",
      "url": "https://...",
      "tier": "A"
    }
  ],
  "local_anchor_inventory": [
    {
      "anchor": "named local anchor",
      "type": "station / district / festival / climate / policy / facility / etc.",
      "why_it_matters": "why this anchor helps localization",
      "source_ids": ["S1"]
    }
  ],
  "evidence_pack": {
    "climate": {
      "localized_statement": "1-3 sentences with at least one local anchor, or Evidence insufficient for localized claim.",
      "why_localized": "brief reason this statement is unique to this city",
      "evidence_ids": ["S1"],
      "confidence": "High / Medium / Low",
      "reusability_for_scenario_agent": "brief scenario use",
      "smart_home_relevance": "one sentence connecting to SmartThings automation",
      "marketing_relevance": "one sentence on marketing application",
      "missing_evidence": ""
    }
  },
  "red_flag_check": ["rejected claim → reason: generic / unsourced / over-inferred"],
  "scenario_agent_ready_summary": ["city-specific reusable bullet with named anchors"],
  "strict_final_rule_check": {
    "no_unsourced_claims": true,
    "no_generic_city_language": true,
    "every_accepted_category_has_local_anchor": true,
    "community_sources_not_used_as_sole_proof_unless_labeled": true,
    "weak_categories_marked_insufficient": true
  }
}

FINAL REMINDER:
- The top-level category summaries MUST also be source-bound and contain local anchors — they are NOT allowed to be weaker than evidence_pack entries.
- If unsure about ANY claim, mark insufficient. A correct "insufficient" is better than a plausible-sounding fabrication.
- red_flag_check must list at least 2 claims you considered but rejected, with specific rejection reasons.
- scenario_agent_ready_summary bullets must each contain at least one named local anchor.`;

const CUSTOM_RESEARCH_SYSTEM_PROMPT = `당신은 특정 도시의 스마트홈 시나리오 기획을 위한 도시 맥락 분석 전문가입니다.
사용자가 이미 보유한 도시 기본 프로필(10개 카테고리)은 "base_profiles"로 제공됩니다.
당신의 역할은 사용자가 입력한 추가 키워드에 대해 기존 프로필과 중복되지 않는 새로운 도시 맥락을 도출하는 것입니다.

═══ 절대 규칙 (위반 시 출력 거부) ═══

1. 모든 문장에 반드시 '지역 고유 앵커' 1개 이상 포함
   앵커 유형: 지명, 역명, 도로명, 시설명, 행사명, 구체적 수치, 정책명
   ❌ "이 도시는 대중교통이 잘 발달되어 있다." → 앵커 없음, 어느 도시든 해당
   ✅ "소요산역~동두천중앙역 구간 1호선 배차 간격이 출퇴근 시간 10분 내외로, 지행·보산동 주민의 서울 출퇴근 동선이 형성된다."

2. 출처 없는 추정 문장 절대 금지
   근거가 약하면 "[근거 보강 필요]"로 표기하고, 억지로 채우지 말 것.

3. 일반론 금지 — "이 문장에서 도시명을 지우면 다른 3개 이상의 도시에도 해당되는가?" 테스트 통과 필수.
   ❌ "젊은 가족들이 스마트홈에 관심이 ��다."
   ✅ "송내동 e편한세상 신축 단지 입주 가구 중 영유아 자녀 가정 비율이 높아, 외출 시 IoT 모니터링 수요가 집중된다."

4. base_profiles에 이미 있는 내용 반복 금지. 키워드로 인해 새롭게 드러나는 맥락만 출력.
5. 수치 충돌 시 한 출처만 채택, 혼용 금지.
6. 하나의 장소·행사에서 과잉 추론 금지.
7. 키워드 관련성이 약하면 솔직히 밝히고 가장 가까운 해석을 제시.
8. 요청된 locale 언어로 작성하되, tags 배열은 항상 영어로 작성.
9. 출력은 반드시 아래 고정 JSON 구조로만 작성. 설명 없이 JSON만 출력.

═══ 품질 기준 ═══
- 지역 행동 패턴, 이벤트, 이동 동선, 계절 리듬, 장소 유형, 라이프스타일 신호, 소비자 사용 맥락을 우선
- 이벤트 키워드: 시기, 장소 패턴, 참여자 행동, 외출 전후 가정 행동에 집중
- 가구/생활 키워드: 생활 패턴, 기기 사용, 일정 리듬, 페인포인트에 집중
- 마케터와 시나리오 기획자가 바로 활용할 수 있을 만큼 구체적이고 간결하게
- finding의 summary와 scenario_implication 모두 지역 고유 앵커 포함 필수

═══ JSON 구조 ═══
{
  "keyword_interpretation": "키워드를 도시 맥락에서 해석한 1~2문장 (도시 고유 앵커 포함)",
  "search_intents": ["도시+키워드 결합 검색 의도 1", "검색 의도 2", "...(4~8개)"],
  "city_keyword_findings": [
    {
      "title": "발견 제목",
      "summary": "해당 도시에서 이 키워드와 관련해 새롭게 드러나는 맥락 — 지역 고유 앵커 필수 (1~2문장)",
      "scenario_implication": "SmartThings 시나리오 기획에 어떻게 반영할 수 있는지 — 지역 고유 앵커 필수 (1문장)"
    }
  ],
  "dedup_note": "기존 base_profiles와의 중복 여부 및 차별점 설명 (1문장)",
  "recommended_reflection_points": ["시나리오 반영 포인트 1 (앵커 포함)", "포인트 2", "...(2~4개)"],
  "tags": ["Save energy", "Keep your home safe"]
}

city_keyword_findings는 2~5개가 적당합니다.

tags 배열에는 아래 값 중 관련 있는 것만 포함하세요:
Save energy, Keep your home safe, Help with chores, Care for kids, Care for seniors,
Care for your pet, Sleep well, Enhanced mood, Stay fit & healthy, Easily control your lights,
Keep the air fresh, Find your belongings, Time saving

출력 전 자가 점검: 모든 summary와 scenario_implication에 지역 고유 앵커가 있는지 확인. 없으면 보강하거나 "[근거 보강 필요]" ��기.`;

function parseJsonObjectFromText(rawText) {
    const text = typeof rawText === "string" ? rawText.trim() : "";
    if (!text) return null;

    const candidates = [
        text,
        text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim()
    ];
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) candidates.push(jsonMatch[0].trim());

    for (const candidate of candidates) {
        if (!candidate) continue;
        try {
            return JSON.parse(candidate);
        } catch {
            continue;
        }
    }
    return null;
}

function normalizeStringList(value, maxItems = 8) {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) => typeof item === "string" ? item.trim() : "")
        .filter(Boolean)
        .slice(0, maxItems);
}

/* ── Wiki Context Fetcher (RAG for city profiles) ── */
const WIKI_LANG_MAP = {
    KR: "ko", JP: "ja", CN: "zh", DE: "de", FR: "fr", ES: "es",
    IT: "it", PT: "pt", NL: "nl", PL: "pl", TR: "tr", RU: "ru",
    ID: "id", BR: "pt", MX: "es", CO: "es", AR: "es"
};

function getWikiLang(countryCode) {
    return WIKI_LANG_MAP[countryCode] || "en";
}

// 한국 도시 영문→한국어 매핑 (Wikipedia 검색 정확도 향상)
const KR_CITY_WIKI_MAP = {
    "Seoul": "서울특별시", "Busan": "부산광역시", "Incheon": "인천광역시",
    "Daegu": "대구광역시", "Daejeon": "대전광역시", "Gwangju Metro": "광주광역시",
    "Ulsan": "울산광역시", "Sejong": "세종특별자치시",
    "Suwon": "수원시", "Yongin": "용인시", "Goyang": "고양시", "Hwaseong": "화성시",
    "Seongnam": "성남시", "Bucheon": "부천시", "Namyangju": "남양주시", "Ansan": "안산시",
    "Pyeongtaek": "평택시", "Anyang": "안양시", "Siheung": "시흥시", "Paju": "파주시",
    "Gimpo": "김포시", "Uijeongbu": "의정부시", "Gwangju-si": "광주시",
    "Hanam": "하남시", "Gwangmyeong": "광명시", "Yangju": "양주시",
    "Gunpo": "군포시", "Osan": "오산시", "Icheon": "이천시",
    "Dongducheon": "동두천시", "Guri": "구리시", "Pocheon": "포천시",
    "Cheongju": "청주시", "Cheonan": "천안시", "Jeonju": "전주시",
    "Changwon": "창원시", "Gimhae": "김해시", "Jeju": "제주시",
    "Wonju": "원주시", "Chuncheon": "춘천시", "Gangneung": "강릉시",
    "Yeosu": "여수시", "Suncheon": "순천시", "Mokpo": "목포시",
    "Gyeongju": "경주시", "Andong": "안동시", "Gumi": "구미시",
    "Pohang": "포항시", "Jinju": "진주시"
};

async function fetchWikiContext(countryCode, cityName) {
    const lang = getWikiLang(countryCode);
    const searchTitle = (countryCode === "KR" && KR_CITY_WIKI_MAP[cityName.trim()])
        ? KR_CITY_WIKI_MAP[cityName.trim()]
        : cityName.trim();

    async function tryWiki(wikiLang) {
        const searchUrl = `https://${wikiLang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTitle)}&srlimit=1&format=json`;
        const searchRes = await fetch(searchUrl, {
            headers: { "User-Agent": "SmartThingsScenarioAgent/1.0" },
            signal: AbortSignal.timeout(8000)
        });
        if (!searchRes.ok) return "";
        const searchData = await searchRes.json();
        const pageTitle = searchData?.query?.search?.[0]?.title;
        if (!pageTitle) return "";

        const extractUrl = `https://${wikiLang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=extracts&explaintext=1&exsectionformat=plain&format=json`;
        const extractRes = await fetch(extractUrl, {
            headers: { "User-Agent": "SmartThingsScenarioAgent/1.0" },
            signal: AbortSignal.timeout(8000)
        });
        if (!extractRes.ok) return "";
        const extractData = await extractRes.json();
        const pages = extractData?.query?.pages;
        const page = pages ? Object.values(pages)[0] : null;
        let extract = page?.extract || "";
        if (extract.length < 100) return "";
        if (extract.length > 12000) {
            const cut = extract.lastIndexOf(".", 12000);
            extract = extract.slice(0, cut > 6000 ? cut + 1 : 12000);
        }

        const sourceUrl = `https://${wikiLang}.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`;
        return `[SOURCE: Wikipedia ${wikiLang.toUpperCase()} — ${sourceUrl}]\n\n${extract}`;
    }

    try {
        let text = await tryWiki(lang);
        if (!text && lang !== "en") text = await tryWiki("en");
        return text;
    } catch (err) {
        console.warn(`[wiki-context] failed for ${countryCode}/${cityName}: ${err.message}`);
        return "";
    }
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetryOpenAiStatus(status) {
    return status === 408 || status === 409 || status === 429 || status >= 500;
}

async function fetchOpenAiChatCompletionWithRetry({ apiKey, requestBody, timeoutMs = CITY_PROFILE_UPSTREAM_TIMEOUT_MS, maxAttempts = CITY_PROFILE_UPSTREAM_MAX_ATTEMPTS }) {
    let lastError = new Error("OpenAI request failed");

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(OPENAI_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timer);

            if (response.ok) {
                return response.json();
            }

            const errText = await response.text().catch(() => "");
            let errMsg = errText.substring(0, 400) || `OpenAI API error ${response.status}`;
            try {
                errMsg = JSON.parse(errText)?.error?.message || errMsg;
            } catch {}

            lastError = new Error(errMsg);
            lastError.status = response.status;

            if (attempt < maxAttempts && shouldRetryOpenAiStatus(response.status)) {
                await delay(800 * attempt);
                continue;
            }

            throw lastError;
        } catch (error) {
            clearTimeout(timer);
            lastError = error instanceof Error ? error : new Error(String(error));
            const isAbort = lastError.name === "AbortError";
            const isTransient = isAbort || /timeout|timed out|network|fetch failed|socket|econnreset|etimedout/i.test(lastError.message || "");

            if (attempt < maxAttempts && isTransient) {
                await delay(800 * attempt);
                continue;
            }

            throw lastError;
        }
    }

    throw lastError;
}

const CITY_PROFILE_FIELDS = ["climate", "housing", "family", "daily_rhythm", "safety", "energy", "health", "pets", "mobility", "events"];

function normalizeLocalizedCategoryText(value) {
    const text = typeof value === "string" ? value.trim() : "";
    return text || "Evidence insufficient for localized claim.";
}

function normalizeEvidencePackEntry(entry) {
    if (!entry || typeof entry !== "object") {
        return {
            localized_statement: "Evidence insufficient for localized claim.",
            why_localized: "",
            evidence_ids: [],
            confidence: "Low",
            reusability_for_scenario_agent: "",
            smart_home_relevance: "",
            marketing_relevance: "",
            missing_evidence: ""
        };
    }

    return {
        localized_statement: normalizeLocalizedCategoryText(entry.localized_statement),
        why_localized: typeof entry.why_localized === "string" ? entry.why_localized.trim() : "",
        evidence_ids: normalizeStringList(entry.evidence_ids, 6),
        confidence: typeof entry.confidence === "string" ? entry.confidence.trim() || "Low" : "Low",
        reusability_for_scenario_agent: typeof entry.reusability_for_scenario_agent === "string" ? entry.reusability_for_scenario_agent.trim() : "",
        smart_home_relevance: typeof entry.smart_home_relevance === "string" ? entry.smart_home_relevance.trim() : "",
        marketing_relevance: typeof entry.marketing_relevance === "string" ? entry.marketing_relevance.trim() : "",
        missing_evidence: typeof entry.missing_evidence === "string" ? entry.missing_evidence.trim() : ""
    };
}

function normalizeCityProfilePayload(payload, { city, country, locale }) {
    let source = payload;
    if (typeof source === "string") source = parseJsonObjectFromText(source) || { raw: source };
    if (source?.raw && typeof source.raw === "string") {
        const reparsed = parseJsonObjectFromText(source.raw);
        if (reparsed) source = reparsed;
    }
    if (!source || typeof source !== "object") source = {};

    const normalized = {};
    for (const key of CITY_PROFILE_FIELDS) {
        const entry = normalizeEvidencePackEntry(source?.evidence_pack?.[key]);
        const topLevel = normalizeLocalizedCategoryText(source[key]);
        normalized[key] = topLevel !== "Evidence insufficient for localized claim."
            ? topLevel
            : entry.localized_statement;
    }

    normalized.source_map = Array.isArray(source.source_map)
        ? source.source_map
            .filter((item) => item && typeof item === "object")
            .map((item, index) => ({
                id: typeof item.id === "string" && item.id.trim() ? item.id.trim() : `S${index + 1}`,
                title: typeof item.title === "string" ? item.title.trim() : "",
                organization: typeof item.organization === "string" ? item.organization.trim() : "",
                published_or_updated: typeof item.published_or_updated === "string" ? item.published_or_updated.trim() : "",
                url: typeof item.url === "string" ? item.url.trim() : "",
                tier: typeof item.tier === "string" ? item.tier.trim() : ""
            }))
            .filter((item) => item.title || item.url)
            .slice(0, 20)
        : [];

    normalized.local_anchor_inventory = Array.isArray(source.local_anchor_inventory)
        ? source.local_anchor_inventory
            .filter((item) => item && typeof item === "object")
            .map((item) => ({
                anchor: typeof item.anchor === "string" ? item.anchor.trim() : "",
                type: typeof item.type === "string" ? item.type.trim() : "",
                why_it_matters: typeof item.why_it_matters === "string" ? item.why_it_matters.trim() : "",
                source_ids: normalizeStringList(item.source_ids, 6)
            }))
            .filter((item) => item.anchor)
            .slice(0, 20)
        : [];

    normalized.evidence_pack = {};
    for (const key of CITY_PROFILE_FIELDS) {
        normalized.evidence_pack[key] = normalizeEvidencePackEntry(source?.evidence_pack?.[key]);
    }

    normalized.red_flag_check = normalizeStringList(source.red_flag_check, 20);
    normalized.scenario_agent_ready_summary = normalizeStringList(source.scenario_agent_ready_summary, 10);
    const checks = source.strict_final_rule_check && typeof source.strict_final_rule_check === "object"
        ? source.strict_final_rule_check
        : {};
    normalized.strict_final_rule_check = {
        no_unsourced_claims: checks.no_unsourced_claims !== false,
        no_generic_city_language: checks.no_generic_city_language !== false,
        every_accepted_category_has_local_anchor: checks.every_accepted_category_has_local_anchor !== false,
        community_sources_not_used_as_sole_proof_unless_labeled: checks.community_sources_not_used_as_sole_proof_unless_labeled !== false,
        weak_categories_marked_insufficient: checks.weak_categories_marked_insufficient !== false
    };
    normalized.meta = { city, country, locale };

    return normalized;
}

function inferCustomResearchTags(query, extraText = "") {
    const haystack = `${query || ""} ${extraText || ""}`.toLowerCase();
    // Keep in sync with server.js inferCustomResearchTags
    const tagRules = [
        { tag: "Care for seniors", terms: ["시니어", "노인", "고령", "어르신", "senior", "elder", "aging"] },
        { tag: "Care for kids", terms: ["아이", "키즈", "어린이", "육아", "child", "kid", "baby"] },
        { tag: "Care for your pet", terms: ["반려", "펫", "pet", "dog", "cat"] },
        { tag: "Keep your home safe", terms: ["보안", "안전", "security", "safe", "cctv", "도난", "침입"] },
        { tag: "Save energy", terms: ["에너지", "전기", "난방", "냉방", "절약", "energy", "utility", "bill"] },
        { tag: "Sleep well", terms: ["수면", "숙면", "sleep", "bedtime"] },
        { tag: "Stay fit & healthy", terms: ["건강", "웰니스", "fitness", "health", "공기", "air quality", "미세먼지"] },
        { tag: "Find your belongings", terms: ["분실", "위치", "찾기", "tag", "tracker", "belonging"] },
        { tag: "Time saving", terms: ["시간", "루틴", "자동", "automation", "commute", "출퇴근"] },
        { tag: "Enhanced mood", terms: ["무드", "분위기", "mood", "ambience", "힐링"] },
        { tag: "Help with chores", terms: ["집안일", "청소", "세탁", "요리", "chore", "cleaning", "laundry"] },
        { tag: "Keep the air fresh", terms: ["환기", "공기", "air", "odor", "smell", "습도"] },
        { tag: "Easily control your lights", terms: ["조명", "lights", "lighting", "lamp"] }
    ];

    return [...new Set(
        tagRules
            .filter((rule) => rule.terms.some((term) => haystack.includes(term)))
            .map((rule) => rule.tag)
    )].slice(0, 4);
}

function buildFallbackCustomResearch({ query, city, locale, baseProfiles, raw }) {
    const isKo = locale === "ko";
    const profileLines = typeof baseProfiles === "string"
        ? baseProfiles.split("\n").map((line) => line.trim()).filter(Boolean)
        : [];

    const findings = (profileLines.length ? profileLines : [
        isKo
            ? `context: ${city} 생활 맥락에서 ${query} 관련 추가 사용 장면`
            : `context: extra ${query} use cases in ${city}`
    ]).slice(0, 3).map((line) => {
        const dividerIndex = line.indexOf(":");
        const title = dividerIndex >= 0 ? line.slice(0, dividerIndex).trim() : (isKo ? "도시 맥락" : "City Context");
        const summary = dividerIndex >= 0 ? line.slice(dividerIndex + 1).trim() : line;
        return {
            title,
            summary,
            scenario_implication: isKo
                ? `"${query}" 관련 알림, 자동화, 원격 확인 장면을 이 맥락에 맞게 설계합니다.`
                : `Design alerts, automations, and remote checks around "${query}" in this context.`
        };
    });

    return {
        keyword_interpretation: isKo
            ? `"${query}"는 ${city} 생활 패턴 안에서 추가로 반영할 지역 특성입니다.`
            : `"${query}" is an additional local context signal for ${city}.`,
        search_intents: [
            isKo ? `${city} ${query} 생활 패턴` : `${city} ${query} daily life`,
            isKo ? `${city} ${query} 불편` : `${city} ${query} pain points`
        ],
        city_keyword_findings: findings,
        dedup_note: baseProfiles
            ? (isKo
                ? "기존 도시 프로필과 중복되는 설명은 줄이고 추가 맥락 중심으로 정리했습니다."
                : "Repeated points from the existing city profile were reduced.")
            : "",
        recommended_reflection_points: [
            isKo
                ? `"${query}"가 필요한 시간대와 생활 조건을 루틴 트리거에 반영`
                : `Use the timing and living conditions behind "${query}" as routine triggers.`,
            isKo
                ? `"${query}"와 연결되는 알림/모니터링 장면을 시나리오에 포함`
                : `Include alert and monitoring moments connected to "${query}".`
        ],
        tags: inferCustomResearchTags(query, `${baseProfiles || ""} ${raw || ""}`)
    };
}

function normalizeCustomResearchPayload(payload, context) {
    const { query, city, locale, baseProfiles } = context;
    let source = payload;
    if (typeof source === "string") source = parseJsonObjectFromText(source) || { raw: source };
    if (source?.raw && typeof source.raw === "string") {
        const reparsed = parseJsonObjectFromText(source.raw);
        if (reparsed) source = reparsed;
    }
    if (source?.data && typeof source.data === "object") source = source.data;

    if (!source || typeof source !== "object") {
        return buildFallbackCustomResearch({ query, city, locale, baseProfiles, raw: payload });
    }

    const interpretation = typeof source.keyword_interpretation === "string" ? source.keyword_interpretation.trim() : "";
    const searchIntents = normalizeStringList(source.search_intents, 8);
    const reflectionPoints = normalizeStringList(source.recommended_reflection_points, 4);
    const tags = normalizeStringList(source.tags, 6);
    const findings = Array.isArray(source.city_keyword_findings)
        ? source.city_keyword_findings
            .filter((item) => item && typeof item === "object")
            .map((item) => ({
                title: typeof item.title === "string" ? item.title.trim() : "",
                summary: typeof item.summary === "string" ? item.summary.trim() : "",
                scenario_implication: typeof item.scenario_implication === "string" ? item.scenario_implication.trim() : ""
            }))
            .filter((item) => item.title || item.summary || item.scenario_implication)
            .slice(0, 5)
        : [];

    if (interpretation || findings.length || reflectionPoints.length) {
        return {
            keyword_interpretation: interpretation,
            search_intents: searchIntents,
            city_keyword_findings: findings,
            dedup_note: typeof source.dedup_note === "string" ? source.dedup_note.trim() : "",
            recommended_reflection_points: reflectionPoints,
            tags: tags.length ? tags : inferCustomResearchTags(query, JSON.stringify(source))
        };
    }

    return buildFallbackCustomResearch({
        query,
        city,
        locale,
        baseProfiles,
        raw: source.raw || JSON.stringify(source)
    });
}

async function readJsonBody(request) {
    try {
        return await request.json();
    } catch {
        return {};
    }
}

async function handleCityProfile(context) {
    let config;
    try {
        config = getConfig(context.env);
    } catch {
        return json({ ok: false, error: { code: "SERVER_MISCONFIGURED" } }, 500);
    }

    const session = await readSession(context.request, config);
    if (!session.authenticated) {
        return json(
            { ok: false, error: { code: "UNAUTHORIZED" } },
            401,
            { "Set-Cookie": clearSessionCookie() }
        );
    }

    const budgetBlocked = await enforceMonthlyBudget(context.env);
    if (budgetBlocked) return budgetBlocked;

    const url = new URL(context.request.url);
    const locale = url.searchParams.get("locale") || "ko";
    const postBody = context.request.method === "POST" ? await readJsonBody(context.request) : {};
    const country = url.searchParams.get("country") || postBody.country || "";
    const city = url.searchParams.get("city") || postBody.city || "";
    const customQuery = url.searchParams.get("custom_query") || postBody.custom_query || "";
    const baseProfiles = postBody.base_profiles || url.searchParams.get("base_profiles") || "";

    if (!city || !country) {
        return json({ ok: false, error: { code: "MISSING_PARAMS", message: "country and city are required." } }, 400);
    }

    // BYOK: prefer user's Gemini key from request header, fallback env for dev
    const { key: apiKey, source: keySource } = resolveGeminiKey(context);
    // Gemini MVP: flash model, fast + cheap
    const model = String(context.env.CITY_PROFILE_MODEL || "gemini-2.0-flash").trim();

    if (customQuery && !apiKey) {
        return json({
            ok: true,
            data: normalizeCustomResearchPayload({ raw: "API_NOT_CONFIGURED" }, { query: customQuery, city, locale, baseProfiles }),
            mode: "custom_research",
            meta: { city, country, locale, model, query: customQuery, fallback: true, fallback_reason: "API_NOT_CONFIGURED" }
        });
    }

    if (!apiKey) {
        return json({ ok: false, error: { code: "API_NOT_CONFIGURED", message: "No Gemini API key: provide one via the BYOK screen." } }, 400);
    }

    console.info(JSON.stringify({
        type: customQuery ? "custom_research_request" : "city_profile_request",
        ts: new Date().toISOString(),
        model, country, city, locale, query: customQuery || null
    }));

    // Wiki RAG context — 두 모드 모두에서 사용
    const wikiContext = await fetchWikiContext(country, city);

    if (customQuery) {
        const maxTokens = 4000;
        const userMessage = `도시: ${city}, 국가: ${country}, 언어: ${locale}\n키워드: "${customQuery}"\n\n${baseProfiles ? `기존 base_profiles (중복 금지 대상):\n${baseProfiles}\n\n` : ""}${wikiContext ? `═══ 참고 자료 (백과사전 출처 — 팩트 근거로 활용) ═══\n${wikiContext}\n═══ 참고 자료 끝 ═══\n\n` : ""}위 도시에서 "${customQuery}" 키워드와 관련된 새로운 도시 맥락을 분석하세요. 기존 프로필에 이미 담긴 내용은 반복하지 말고, 키워드로 인해 새롭게 드러나는 인사이트만 출력하세요.`;

        let result;
        try {
            result = await callGeminiAsOpenAI({
                apiKey,
                model,
                maxTokens,
                jsonMode: true,
                messages: [
                    { role: "system", content: CUSTOM_RESEARCH_SYSTEM_PROMPT },
                    { role: "user", content: userMessage }
                ],
                timeoutMs: CITY_PROFILE_UPSTREAM_TIMEOUT_MS
            });
        } catch (error) {
            return json({
                ok: true,
                data: normalizeCustomResearchPayload({ raw: error.message }, { query: customQuery, city, locale, baseProfiles }),
                mode: "custom_research",
                meta: { city, country, locale, model, query: customQuery, fallback: true, fallback_reason: error.message }
            });
        }

        const usage = result.usage || null;
        const finishReason = result.choices?.[0]?.finish_reason || "";
        const content = result.choices?.[0]?.message?.content || "{}";

        if (finishReason === "length") {
            console.warn(`[custom-research] Response truncated (finish_reason=length) for ${city}/${customQuery}. Tokens used: ${JSON.stringify(usage)}`);
        }

        if (usage) {
            const cost = estimateUsageCost(context.env, model, usage);
            await recordUsageCost(context.env, cost).catch(() => {});
        }

        return json({
            ok: true,
            data: normalizeCustomResearchPayload(parseJsonObjectFromText(content) || { raw: content }, { query: customQuery, city, locale, baseProfiles }),
            mode: "custom_research",
            meta: { city, country, locale, model, query: customQuery, finish_reason: finishReason }
        });
    }

    const userMessage = `Target country: ${country}
Target city: ${city}
Optional subregion: none
Output locale: ${locale}
${wikiContext ? `
═══ REFERENCE CONTEXT (from encyclopedia source — use as primary evidence) ═══
${wikiContext}
═══ END REFERENCE CONTEXT ═══

IMPORTANT: Use the reference context above as your PRIMARY source of facts. Extract specific district names, statistics, facility names, event names, and policy names from it. Cite "Wikipedia ${getWikiLang(country).toUpperCase()}" in your source_map. Only mark a category as "Evidence insufficient" if the reference context truly contains NO relevant information for that category.
` : ""}
Build a source-bound localization evidence pack for this city. Use only evidence-backed localized statements. If evidence is weak, mark that category as "Evidence insufficient for localized claim." Return valid JSON only.`;
    const maxTokens = 10000;

    let result;
    try {
        result = await callGeminiAsOpenAI({
            apiKey,
            model,
            maxTokens,
            jsonMode: true,
            messages: [
                { role: "system", content: CITY_PROFILE_SYSTEM_PROMPT },
                { role: "user", content: userMessage }
            ],
            timeoutMs: CITY_PROFILE_UPSTREAM_TIMEOUT_MS
        });
    } catch (error) {
        return json({ ok: false, error: { code: "UPSTREAM_ERROR", message: error.message } }, 502);
    }

    const usage = result.usage || null;
    const finishReason = result.choices?.[0]?.finish_reason || "";
    const content = result.choices?.[0]?.message?.content || "{}";

    if (finishReason === "length") {
        console.warn(`[city-profile] Response truncated (finish_reason=length) for ${city}/${country}. Tokens used: ${JSON.stringify(usage)}`);
    }

    if (usage) {
        const cost = estimateUsageCost(context.env, model, usage);
        await recordUsageCost(context.env, cost).catch(() => {});
    }

    return json({
        ok: true,
        data: normalizeCityProfilePayload(parseJsonObjectFromText(content) || { raw: content }, { city, country, locale }),
        meta: { city, country, locale, model, finish_reason: finishReason }
    }, 200, {
        "Cache-Control": "public, max-age=86400"
    });
}

export async function onRequestGet(context) {
    return handleCityProfile(context);
}

export async function onRequestPost(context) {
    return handleCityProfile(context);
}
