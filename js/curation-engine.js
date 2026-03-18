/**
 * Curation Engine — Explore Contents v1.0/v2.0 시나리오 매칭
 * API 호출 없이 순수 JS로 Q1~Q4 입력 → 최적 시나리오 반환
 * 원문 그대로 보여주는 것이 핵심 (AI 재해석 금지)
 */

// ─── 매핑 테이블: Q3 선택 → Explore 키워드 ───
const PERSONA_TO_EXPLORE_TAGS = {
    // A. 가구 구성 → 키워드
    solo:           ["Keep your home safe", "Save energy", "Sleep well"],
    partner:        ["Save energy", "Help with chores", "Enhanced mood"],
    children:       ["Care for kids", "Keep your home safe"],
    child_infant:   ["Care for kids", "Keep your home safe"],
    child_elementary: ["Care for kids", "Keep your home safe"],
    child_teen:     ["Care for kids", "Keep your home safe"],
    child_adult:    [],
    child_multi:    ["Care for kids", "Help with chores"],
    parents_senior: ["Care for seniors", "Keep your home safe"],
    parent_one:     ["Care for seniors"],
    parent_both:    ["Care for seniors"],
    parent_60s:     ["Care for seniors"],
    parent_70plus:  ["Care for seniors"],
    siblings:       ["Help with chores"],
    roommate:       ["Save energy", "Help with chores"],
    pet:            ["Care for your pet", "Keep your home safe"],
    pet_dog:        ["Care for your pet"],
    pet_cat:        ["Care for your pet"],
    pet_other:      ["Care for your pet"],
    accessibility:  ["Care for seniors", "Keep your home safe"],
    acc_mobility:   ["Care for seniors"],
    acc_visual_hearing: ["Care for seniors"],
    acc_cognitive:  ["Care for seniors"],
    acc_child_safety: ["Care for kids", "Keep your home safe"],

    // B. 관심사 → 키워드
    int_health:     ["Stay fit & healthy", "Sleep well", "Health"],
    int_energy:     ["Save energy", "Energy Saving"],
    int_entertain:  ["Enhanced mood", "Play"],
    int_cooking:    ["Help with chores"],
    int_remote:     ["Save energy", "Easily control your lights"],
    int_night:      ["Sleep well", "Easily control your lights"],
    int_away:       ["Keep your home safe", "Care for your pet", "Security"],
    int_hosting:    ["Enhanced mood", "Help with chores"],
    int_season:     ["Enhanced mood"],

    // C. 거주지 유형 → 키워드 (간접)
    apt_high:       ["Save energy", "Keep the air fresh"],
    apt_low:        ["Save energy"],
    studio:         ["Save energy", "Easily control your lights"],
    detached:       ["Keep your home safe", "Save energy"],
    townhouse:      ["Keep your home safe"],
    suburban:       ["Keep your home safe", "Save energy"],
    rental:         ["Easily control your lights"],
    shared:         ["Keep your home safe", "Save energy"]
};

// ─── 매핑: Q4 기기 → Explore 키워드 ───
const DEVICE_TO_EXPLORE_TAGS = {
    "TV":           ["Security", "Keep your home safe", "Enhanced mood"],
    "냉장고":       ["Save energy", "Help with chores"],
    "세탁기":       ["Help with chores", "Save energy"],
    "건조기":       ["Help with chores", "Save energy"],
    "에어컨":       ["Save energy", "Sleep well", "Keep the air fresh"],
    "로봇청소기":   ["Help with chores", "Care for your pet"],
    "공기청정기":   ["Keep the air fresh", "Sleep well"],
    "카메라":       ["Keep your home safe", "Care for your pet", "Security"],
    "센서":         ["Keep your home safe", "Care for seniors", "Security"],
    "조명":         ["Easily control your lights", "Sleep well", "Enhanced mood"],
    "스피커":       ["Enhanced mood", "Easy to use"],
    "도어벨":       ["Keep your home safe", "Security"],
    "도어락":       ["Keep your home safe", "Security"],
    "스마트 플러그": ["Save energy", "Easy to use"],
    "블라인드":     ["Sleep well", "Enhanced mood"],
    "Galaxy 스마트폰": ["Find your belongings", "Keep your home safe"],
    "Galaxy Watch":  ["Stay fit & healthy", "Health"],
    "Galaxy Tab":    ["Keep your home safe", "Care for kids"],
    "SmartTag":      ["Find your belongings"],
    "Hub":           ["Easy to use", "Keep your home safe"]
};

// ─── v1.0 키워드 → v2.0 키워드 정규화 ───
const V1_TO_V2_TAG_MAP = {
    "Security":      ["Keep your home safe"],
    "Energy Saving": ["Save energy"],
    "Easy to use":   ["Help with chores", "Easily control your lights"],
    "Time saving":   ["Help with chores"],
    "Sleep":         ["Sleep well"],
    "Health":        ["Stay fit & healthy"],
    "Pet care":      ["Care for your pet"],
    "Family care":   ["Care for seniors", "Care for kids"]
};

/**
 * Q1~Q4 입력을 Explore 태그 세트로 변환
 */
function buildExploreTagsFromInput({ segments = [], interests = [], housing = [], devices = [], purpose = "" }) {
    const tagScores = {};

    function addTag(tag, weight = 1) {
        tagScores[tag] = (tagScores[tag] || 0) + weight;
    }

    // Q3: 페르소나 선택 → 태그 (가중치 3)
    [...segments, ...interests, ...housing].forEach(id => {
        (PERSONA_TO_EXPLORE_TAGS[id] || []).forEach(tag => addTag(tag, 3));
    });

    // Q4: 기기 선택 → 태그 (가중치 2)
    devices.forEach(device => {
        (DEVICE_TO_EXPLORE_TAGS[device] || []).forEach(tag => addTag(tag, 2));
    });

    // Purpose 텍스트 분석 (가중치 1)
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
            tags.forEach(tag => addTag(tag, 1));
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
        const key = s.story_title.toLowerCase().replace(/\s+/g, "");
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

// Export for use in main.js or Node.js
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        buildExploreTagsFromInput,
        scoreScenario,
        curateScenarios,
        formatCurationResult,
        PERSONA_TO_EXPLORE_TAGS,
        DEVICE_TO_EXPLORE_TAGS,
        V1_TO_V2_TAG_MAP
    };
}
