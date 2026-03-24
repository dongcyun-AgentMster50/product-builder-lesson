/**
 * Curation Engine — Explore Contents v1.0/v2.0 시나리오 매칭
 * API 호출 없이 순수 JS로 Q1~Q3 입력 → 최적 시나리오 반환
 * 원문 그대로 보여주는 것이 핵심 (AI 재해석 금지)
 */

// ─── 매핑 테이블: Q2 선택 → Explore 키워드 (v1+v2 통합) ───
const PERSONA_TO_EXPLORE_TAGS = {
    // A. 거주지 유형
    h_apt:          ["Save energy", "Keep the air fresh", "Energy Saving"],
    h_compact:      ["Save energy", "Easily control your lights", "Energy Saving"],
    h_villa:        ["Save energy", "Keep your home safe", "Security"],
    h_house:        ["Keep your home safe", "Save energy", "Security"],
    h_townhouse:    ["Keep your home safe", "Save energy", "Security"],
    h_shared:       ["Keep your home safe", "Save energy", "Security"],
    h_care:         ["Care for seniors", "Keep your home safe", "Family care"],

    // B. 세대 구성
    hh_solo:        ["Keep your home safe", "Save energy", "Sleep well", "Security"],
    hh_couple:      ["Save energy", "Help with chores", "Enhanced mood", "Easy to use"],
    hh_young_kids:  ["Care for kids", "Keep your home safe", "Family care", "Security"],
    hh_school_kids: ["Care for kids", "Keep your home safe", "Family care"],
    hh_adult_kids:  ["Save energy", "Help with chores", "Energy Saving"],
    hh_multi_gen:   ["Care for seniors", "Care for kids", "Family care", "Keep your home safe"],
    hh_senior:      ["Care for seniors", "Keep your home safe", "Family care", "Health"],

    // C. 라이프스테이지
    ls_starter:     ["Easy to use", "Save energy", "Energy Saving"],
    ls_newlywed:    ["Enhanced mood", "Help with chores", "Easy to use"],
    ls_settled:     ["Save energy", "Enhanced mood", "Energy Saving"],
    ls_parenting:   ["Care for kids", "Keep your home safe", "Family care"],
    ls_established: ["Save energy", "Help with chores", "Energy Saving", "Time saving"],
    ls_empty_nest:  ["Stay fit & healthy", "Sleep well", "Health"],
    ls_senior:      ["Care for seniors", "Keep your home safe", "Family care", "Health"],

    // D. 우리 집 특성 태그
    t_dual_income:  ["Time saving", "Help with chores"],
    t_single_income: ["Save energy", "Energy Saving"],
    t_solo_parent:  ["Help with chores", "Care for kids", "Time saving"],
    t_multi_kids:   ["Care for kids", "Help with chores", "Family care"],
    t_pet:          ["Care for your pet", "Keep your home safe", "Pet care"],
    t_parent_away:  ["Care for seniors", "Keep your home safe", "Family care"],
    t_parent_care:  ["Care for seniors", "Family care"],
    t_acc_needs:    ["Care for seniors", "Keep your home safe"],
    t_remote:       ["Save energy", "Easily control your lights", "Easy to use"],
    t_long_away:    ["Keep your home safe", "Care for your pet", "Security"],
    t_weekend_out:  ["Keep your home safe", "Security"],
    t_night_shift:  ["Sleep well", "Easily control your lights", "Sleep"],
    t_security:     ["Keep your home safe", "Security"],
    t_wellness:     ["Stay fit & healthy", "Sleep well", "Health"],
    t_efficiency:   ["Help with chores", "Time saving"],

    // E. 생활맥락 (Explore Contents v2 키워드 직접 매핑)
    int_energy:     ["Save energy", "Energy Saving"],
    int_air:        ["Keep the air fresh"],
    int_lights:     ["Easily control your lights", "Easy to use"],
    int_chores:     ["Help with chores", "Time saving"],
    int_safe:       ["Keep your home safe", "Security"],
    int_sleep:      ["Sleep well", "Sleep"],
    int_mood:       ["Enhanced mood"],
    int_senior:     ["Care for seniors", "Family care"],
    int_kids:       ["Care for kids", "Family care"],
    int_pet:        ["Care for your pet", "Pet care"],
    int_find:       ["Find your belongings"],
    int_health:     ["Stay fit & healthy", "Health"]
};

// ─── 매핑: Q3 기기 normalized → Explore 키워드 (v1+v2 통합) ───
const DEVICE_TO_EXPLORE_TAGS = {
    "TV":           ["Enhanced mood", "Security", "Keep your home safe"],
    "냉장고":       ["Save energy", "Help with chores", "Energy Saving"],
    "세탁기":       ["Help with chores", "Save energy", "Time saving"],
    "건조기":       ["Help with chores", "Save energy", "Time saving"],
    "세탁기/건조기": ["Help with chores", "Save energy", "Time saving"],
    "에어컨":       ["Save energy", "Sleep well", "Keep the air fresh", "Energy Saving"],
    "로봇청소기":   ["Help with chores", "Care for your pet", "Time saving"],
    "공기청정기":   ["Keep the air fresh", "Sleep well"],
    "센서":         ["Keep your home safe", "Care for seniors", "Security"],
    "조명":         ["Easily control your lights", "Sleep well", "Enhanced mood", "Easy to use"],
    "스피커":       ["Enhanced mood", "Easy to use"],
    "오븐":         ["Help with chores"],
    "스마트폰":     ["Find your belongings", "Keep your home safe"],
    "웨어러블":     ["Stay fit & healthy", "Health", "Sleep well"],
    "태블릿":       ["Care for kids", "Easy to use"],
};

// ─── v1.0 키워드 ↔ v2.0 키워드 양방향 정규화 ───
const V1_TO_V2_TAG_MAP = {
    // v1 → v2
    "Security":      ["Keep your home safe"],
    "Energy Saving": ["Save energy"],
    "Easy to use":   ["Easily control your lights", "Help with chores"],
    "Time saving":   ["Help with chores"],
    "Sleep":         ["Sleep well"],
    "Health":        ["Stay fit & healthy"],
    "Pet care":      ["Care for your pet"],
    "Family care":   ["Care for seniors", "Care for kids"],
    // v2 → v1 (역방향 — scoreScenario에서 v2 태그로 v1 시나리오도 매칭)
    "Keep your home safe": ["Security"],
    "Save energy":         ["Energy Saving"],
    "Help with chores":    ["Time saving", "Easy to use"],
    "Easily control your lights": ["Easy to use"],
    "Sleep well":          ["Sleep"],
    "Stay fit & healthy":  ["Health"],
    "Care for your pet":   ["Pet care"],
    "Care for seniors":    ["Family care"],
    "Care for kids":       ["Family care"],
    "Enhanced mood":       [],
    "Keep the air fresh":  [],
    "Find your belongings": []
};

/**
 * Q1~Q4 입력을 Explore 태그 세트로 변환
 */
// ─── Magic Keywords → Explore 태그 직접 매핑 ───
const MAGIC_KEY_TO_EXPLORE_TAGS = {
    climate:      ["Save energy", "Keep the air fresh", "Sleep well", "Energy Saving"],
    housing:      ["Save energy", "Easily control your lights", "Keep your home safe"],
    family:       ["Care for kids", "Care for seniors", "Family care", "Keep your home safe"],
    daily_rhythm: ["Help with chores", "Time saving", "Save energy"],
    safety:       ["Keep your home safe", "Security"],
    energy:       ["Save energy", "Energy Saving"],
    health:       ["Stay fit & healthy", "Sleep well", "Health"],
    pets:         ["Care for your pet", "Pet care"],
    mobility:     ["Keep your home safe", "Security", "Find your belongings"],
    events:       ["Enhanced mood"]
};

function buildExploreTagsFromInput({ segments = [], interests = [], housing = [], devices = [], purpose = "", magicKeywords = [] }) {
    const tagScores = {};
    const sourceTracker = {}; // 소스별 중복 기여 방지

    function addTag(tag, weight = 1, sourceId = "") {
        // 동일 소스의 동일 태그 중복 기여 방지
        if (sourceId) {
            const key = `${sourceId}|${tag}`;
            if (sourceTracker[key]) return;
            sourceTracker[key] = true;
        }
        tagScores[tag] = (tagScores[tag] || 0) + weight;
    }

    // ── Primary Intent: 명시적 특성 선택 (t_, int_) — 가중치 6 (최고) ──
    const PRIMARY_IDS = new Set([
        "t_pet", "t_multi_kids", "t_parent_care", "t_parent_away", "t_wellness",
        "t_security", "t_efficiency", "t_remote", "t_dual_income", "t_solo_parent",
        "t_long_away", "t_night_shift", "t_weekend_out", "t_acc_needs",
        "int_energy", "int_pet", "int_kids", "int_senior", "int_health",
        "int_safe", "int_chores", "int_sleep", "int_mood", "int_air", "int_lights", "int_find"
    ]);
    [...segments, ...interests].forEach(id => {
        if (PRIMARY_IDS.has(id)) {
            (PERSONA_TO_EXPLORE_TAGS[id] || []).forEach(tag => addTag(tag, 6, `primary_${id}`));
        }
    });

    // ── 세대 구성 (hh_) — 가중치 5 ──
    [...segments].filter(id => id.startsWith("hh_")).forEach(id => {
        (PERSONA_TO_EXPLORE_TAGS[id] || []).forEach(tag => addTag(tag, 5, `hh_${id}`));
    });

    // ── 라이프스테이지 (ls_) — 가중치 4 ──
    [...segments].filter(id => id.startsWith("ls_")).forEach(id => {
        (PERSONA_TO_EXPLORE_TAGS[id] || []).forEach(tag => addTag(tag, 4, `ls_${id}`));
    });

    // ── 거주지 유형 (h_) — 가중치 2 (배경 환경, 낮은 가중치) ──
    [...housing].forEach(id => {
        (PERSONA_TO_EXPLORE_TAGS[id] || []).forEach(tag => addTag(tag, 2, `housing_${id}`));
    });

    // ── Magic Keywords: 도시 관심사 (가중치 4) ──
    magicKeywords.forEach(key => {
        (MAGIC_KEY_TO_EXPLORE_TAGS[key] || []).forEach(tag => addTag(tag, 4, `magic_${key}`));
    });

    // ── 기기 선택 → 태그 (가중치 2) ──
    devices.forEach(device => {
        (DEVICE_TO_EXPLORE_TAGS[device] || []).forEach(tag => addTag(tag, 2, `device_${device}`));
    });

    // ── Purpose 텍스트 분석 (가중치 3) ──
    const purposeL = purpose.toLowerCase();
    const purposeMap = {
        "반려|펫|pet|dog|cat":       ["Care for your pet"],
        "부모|시니어|senior|elderly": ["Care for seniors"],
        "아이|자녀|kid|child":       ["Care for kids"],
        "에너지|절약|energy|save":   ["Save energy"],
        "보안|안전|security|safe":   ["Keep your home safe"],
        "수면|잠|sleep":             ["Sleep well"],
        "게임|영화|music|party":     ["Enhanced mood"],
        "공기|환기|미세먼지|air":    ["Keep the air fresh"],
        "세탁|청소|가사|chore":      ["Help with chores"],
        "운동|건강|health|fit":      ["Stay fit & healthy"],
        "분실|찾기|find|tag":        ["Find your belongings"],
        "조명|불|light":             ["Easily control your lights"]
    };
    Object.entries(purposeMap).forEach(([pattern, tags]) => {
        if (new RegExp(pattern, "i").test(purposeL)) {
            tags.forEach(tag => addTag(tag, 3, `purpose_${pattern}`));
        }
    });

    // 점수순 정렬
    return Object.entries(tagScores)
        .sort((a, b) => b[1] - a[1])
        .map(([tag, score]) => ({ tag, score }));
}

/**
 * 시나리오 스코어링
 */
function scoreScenario(scenario, tagScores, selectedDevices = []) {
    let score = 0;
    const tagMap = {};
    tagScores.forEach(({ tag, score: s }) => { tagMap[tag] = s; });

    // 1. 키워드/태그 매칭 (핵심)
    const scenarioTags = [];

    // v1.0: keyword 기반
    if (scenario.keyword) {
        scenarioTags.push(scenario.keyword);
        // v1→v2 정규화 태그도 추가
        (V1_TO_V2_TAG_MAP[scenario.keyword] || []).forEach(t => scenarioTags.push(t));
    }

    // v2.0: tags 기반
    if (scenario.tags) {
        scenarioTags.push(...scenario.tags);
    }

    scenarioTags.forEach(tag => {
        if (tagMap[tag]) score += tagMap[tag] * 10;
    });

    // 2. 기기 매칭 (보너스)
    const scenarioDevices = (scenario.devices || []).map(d => d.toLowerCase());
    selectedDevices.forEach(device => {
        const dLower = device.toLowerCase();
        if (scenarioDevices.some(sd => sd.includes(dLower) || dLower.includes(sd))) {
            score += 8;
        }
    });

    // 3. 원문 존재 보너스 (큐레이션은 원문이 있어야 가치)
    if (scenario.original_text && scenario.original_text.length > 20) {
        score += 5;
    }

    // 4. value_tags 매칭
    if (scenario.value_tags) {
        // Care, Play, Save, Secure
        const purposeTags = tagScores.slice(0, 3).map(t => t.tag);
        scenario.value_tags.forEach(vt => {
            if (purposeTags.some(pt => pt.toLowerCase().includes(vt.toLowerCase()))) {
                score += 3;
            }
        });
    }

    return score;
}

/**
 * 메인 큐레이션 함수
 * @param {Object} input - { segments, interests, housing, devices, purpose }
 * @param {Array} v1Scenarios - explore_db_v1.json scenarios
 * @param {Array} v2Scenarios - explore_db_v2.json scenarios
 * @param {Object} options - { maxResults: 10, minScore: 5 }
 * @returns {Array} 점수순 정렬된 매칭 시나리오 배열
 */
function curateScenarios(input, v1Scenarios, v2Scenarios, options = {}) {
    const { maxResults = 10, minScore = 5 } = options;

    // 1. 입력 → 태그 변환
    const tagScores = buildExploreTagsFromInput(input);

    if (tagScores.length === 0) return [];

    // 2. 모든 시나리오 스코어링
    const allScenarios = [
        ...v1Scenarios.map(s => ({ ...s, _source: "v1.0" })),
        ...v2Scenarios.map(s => ({ ...s, _source: "v2.0" }))
    ];

    const scored = allScenarios
        .map(scenario => ({
            ...scenario,
            _score: scoreScenario(scenario, tagScores, input.devices || []),
            _matchedTags: tagScores
                .filter(({ tag }) => {
                    const sTags = [
                        ...(scenario.keyword ? [scenario.keyword, ...(V1_TO_V2_TAG_MAP[scenario.keyword] || [])] : []),
                        ...(scenario.tags || [])
                    ];
                    return sTags.includes(tag);
                })
                .map(({ tag }) => tag)
        }))
        .filter(s => s._score >= minScore)
        .sort((a, b) => b._score - a._score);

    // 3. 중복 제거 (같은 story_title이면 높은 점수만)
    const seen = new Set();
    const deduped = [];
    for (const s of scored) {
        const title = s.story_title || s.article_title || "";
        if (!title) continue;
        const key = title.toLowerCase().replace(/\s+/g, "");
        if (!seen.has(key)) {
            seen.add(key);
            deduped.push(s);
        }
    }

    return deduped.slice(0, maxResults);
}

/**
 * 결과 포맷팅 — 큐레이션 모드 출력용
 */
function formatCurationResult(scenario) {
    const result = {
        title: scenario.story_title,
        source: scenario.source || `Explore Contents ${scenario._source}`,
        keyword: scenario.keyword || (scenario.tags || []).join(", "),
        article: scenario.article_title || "",
        originalText: scenario.original_text || "",
        narrative: scenario.narrative || "",
        devices: scenario.devices || [],
        relatedProducts: scenario.related_products || [],
        valueTags: scenario.value_tags || [],
        score: scenario._score,
        matchedTags: scenario._matchedTags || []
    };

    return result;
}

// ─── Selection Summary 구조체 ─────────────────────────────────────
// Selection Stage의 최종 산출물. AI 프롬프트 및 렌더링에 구조적으로 전달됨.

/**
 * 태그가 어떤 입력 소스에서 도출되었는지 역추적
 */
function findTagSources(tag, input) {
    const sources = [];
    const allPersona = [...(input.segments || []), ...(input.interests || []), ...(input.housing || [])];
    allPersona.forEach(id => {
        if ((PERSONA_TO_EXPLORE_TAGS[id] || []).includes(tag)) {
            sources.push({ type: "persona", id });
        }
    });
    (input.devices || []).forEach(device => {
        if ((DEVICE_TO_EXPLORE_TAGS[device] || []).includes(tag)) {
            sources.push({ type: "device", id: device });
        }
    });
    return sources;
}

/**
 * 선택된 시나리오들에서 가치 축(Care/Secure/Save/Play 등) 추출
 */
function extractPrimaryValues(scenarios) {
    const valueCounts = {};
    scenarios.forEach(s => {
        (s.value_tags || []).forEach(v => {
            valueCounts[v] = (valueCounts[v] || 0) + 1;
        });
    });
    return Object.entries(valueCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([value]) => value);
}

/**
 * 확정 정보 목록 (사용자가 직접 선택한 것)
 */
function buildConfirmedItems(input) {
    const items = [];
    if (input.market?.country) items.push({ field: "country", value: input.market.country });
    if (input.market?.city) items.push({ field: "city", value: input.market.city });
    if (input.devices && input.devices.length > 0) items.push({ field: "devices", value: input.devices.join(", ") });
    if (input.housing && input.housing.length > 0) items.push({ field: "housing", value: input.housing.join(", ") });
    if (input.segments && input.segments.length > 0) items.push({ field: "household", value: input.segments.join(", ") });
    if (input.interests && input.interests.length > 0) items.push({ field: "interests", value: input.interests.join(", ") });
    return items;
}

/**
 * 추론 정보 목록 (사용자 입력으로부터 추정된 것)
 */
function buildInferredItems(input, results, tagScores) {
    const items = [];
    if (tagScores.length > 0) {
        items.push({
            field: "derivedKeywords",
            value: tagScores.slice(0, 5).map(t => t.tag).join(", "),
            confidence: "high"
        });
    }
    if (!input.purpose && results.length > 0) {
        items.push({
            field: "lifePurpose",
            value: "선택된 시나리오 기반 추론",
            confidence: "medium"
        });
    }
    return items;
}

/**
 * 한국어 선택 이유 생성
 */
function buildSelectionReasonKo(topScenario, topTags, input) {
    if (!topScenario) return "입력 조건에 매칭되는 Explore 시나리오가 없습니다.";

    const tagNames = topTags.slice(0, 3).map(t => t.tag).join(", ");
    const deviceCount = (input.devices || []).length;
    const deviceText = deviceCount > 0
        ? `${(input.devices || []).slice(0, 3).join(", ")}${deviceCount > 3 ? ` 외 ${deviceCount - 3}개` : ""} 기기 조합과 함께 `
        : "";

    return `입력하신 조건에서 "${tagNames}" 키워드가 도출되었고, ` +
        `${deviceText}"${topScenario.story_title}" 시나리오가 ` +
        `가장 높은 적합도(${topScenario._score}점)로 선택되었습니다.`;
}

/**
 * 영문 선택 이유 생성
 */
function buildSelectionReasonEn(topScenario, topTags) {
    if (!topScenario) return "No matching Explore scenario found for the given inputs.";

    const tagNames = topTags.slice(0, 3).map(t => t.tag).join(", ");
    return `Keywords "${tagNames}" were derived from your inputs. ` +
        `"${topScenario.story_title}" was selected with the highest relevance score (${topScenario._score}).`;
}

/**
 * Selection Summary 구축 — Selection Stage의 최종 산출물
 * @param {Object} input - { segments, interests, housing, devices, purpose, market }
 * @param {Array} results - curateScenarios() 결과
 * @param {Object} options - { locale: "ko", personaLabels: [], deviceLabels: [] }
 * @returns {Object} selectionSummary
 */
function buildSelectionSummary(input, results, options = {}) {
    const { locale = "ko", personaLabels = [], deviceLabels = [] } = options;
    const tagScores = buildExploreTagsFromInput(input);
    const topTags = tagScores.slice(0, 5);
    const isKo = locale === "ko";

    return {
        // 입력 스냅샷
        inputSnapshot: {
            market: input.market || {},
            persona: (input.segments || []).map((id, i) => ({
                id,
                label: personaLabels[i] || id,
                confirmed: true
            })),
            housing: (input.housing || []).map(id => ({
                id,
                confirmed: true
            })),
            interests: (input.interests || []).map(id => ({
                id,
                confirmed: true
            })),
            devices: (input.devices || []).map((name, i) => ({
                name,
                label: deviceLabels[i] || name,
                confirmed: true
            })),
            purpose: input.purpose ? { text: input.purpose, confirmed: true } : null
        },

        // 도출된 태그 (근거 추적용)
        derivedTags: topTags.map(({ tag, score }) => ({
            tag,
            score,
            sources: findTagSources(tag, input)
        })),

        // 선택된 시나리오 (상위 3개)
        selectedScenarios: results.slice(0, 3).map((s, idx) => ({
            id: s.id || `${s._source}-${(s.story_title || "").replace(/\s+/g, "-")}`,
            title: s.story_title || "",
            articleTitle: s.article_title || "",
            source: s._source || "v2.0",
            score: s._score,
            matchedTags: (s._matchedTags || []).map(t => typeof t === "object" ? t.tag : t),
            valueTags: s.value_tags || [],
            devices: s.devices || [],
            originalText: (s.original_text || s.narrative || "").substring(0, 400),
            analysis: (s.analysis || s.value_proposition || "").substring(0, 300),
            isPrimary: idx === 0
        })),

        // 선택 이유
        selectionReason: isKo
            ? buildSelectionReasonKo(results[0], topTags, input)
            : buildSelectionReasonEn(results[0], topTags),

        // 가치 축 요약
        primaryValues: extractPrimaryValues(results.slice(0, 3)),

        // 확정 vs 추론 구분
        inferredVsConfirmed: {
            confirmed: buildConfirmedItems(input).map(i =>
                isKo ? `${fieldLabelKo(i.field)}: ${i.value}` : `${i.field}: ${i.value}`
            ),
            inferred: buildInferredItems(input, results, tagScores).map(i =>
                isKo ? `${fieldLabelKo(i.field)}: ${i.value}` : `${i.field}: ${i.value}`
            )
        },

        // Magic Keywords (사용자가 직접 선택한 도시 관심사)
        magicKeywords: (input.magicKeywords || []).slice(),

        // 메타
        totalCandidates: results.length,
        locale
    };
}

/** 필드명 한국어 라벨 */
function fieldLabelKo(field) {
    const map = {
        country: "국가", city: "도시", devices: "기기",
        housing: "거주 형태", household: "세대 구성",
        interests: "생활 관심사", derivedKeywords: "도출 키워드",
        lifePurpose: "생활 목적"
    };
    return map[field] || field;
}

// Export for use in main.js or Node.js
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        buildExploreTagsFromInput,
        scoreScenario,
        curateScenarios,
        formatCurationResult,
        buildSelectionSummary,
        findTagSources,
        extractPrimaryValues,
        PERSONA_TO_EXPLORE_TAGS,
        DEVICE_TO_EXPLORE_TAGS,
        V1_TO_V2_TAG_MAP
    };
}
