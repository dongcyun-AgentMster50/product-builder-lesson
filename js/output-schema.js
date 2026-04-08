/**
 * Output Schema v2.0 — AI/Fallback 공통 JSON 스키마 + 13개 섹션 개별 스키마
 * AI 출력과 fallback 출력 모두 이 스키마를 따르도록 강제한다.
 * "동일 스키마 → 동일 렌더링" 원칙.
 *
 * 각 섹션 스키마가 단일 진실의 원천(single source of truth) 역할을 하며,
 * 렌더러(campaign-output.js)와 API 프롬프트(functions/api/)가 모두 이 구조를 따른다.
 */

// ─── 공통 스타일 메타데이터 타입 ───
// 모든 텍스트 필드는 선택적으로 style 메타데이터를 포함할 수 있음
// style: { font_size: "24pt", weight: "bold", align: "center", color: "#000" }

// ─── 기존 스키마 필드 정의 (검증용) ───
const OUTPUT_SCHEMA_FIELDS = {
    required: [
        "generationMode",   // "ai" | "fallback"
        "locale",            // "ko" | "en" 등
        "transformation"     // 변형 결과 객체
    ],
    transformation: {
        required: ["strategy", "sourceTrace", "marketerOutput", "consumerOutput"],
        marketerOutput: {
            required: ["headline", "summary", "whyThisScenario", "targetFit", "channelStrategy", "copyOptions"]
        },
        consumerOutput: {
            required: ["headline", "whatItDoes", "requiredSetup", "setupSteps"]
        }
    }
};

// ─── 13개 캠페인 섹션 개별 스키마 (Single Source of Truth) ───
const CAMPAIGN_SECTION_SCHEMAS = {
    "01": {
        name: "Input Summary",
        nameKo: "입력 조건 요약",
        dataSource: "client",
        required: ["country", "city", "segment", "devices", "missionBucket"],
        optional: ["intentTags", "purpose", "cityDisplay", "locale"],
        fields: {
            country:       { type: "string", description: "Selected country code" },
            city:          { type: "string", description: "Selected city" },
            cityDisplay:   { type: "string", description: "Display name for city" },
            segment:       { type: "string", description: "Target segment label" },
            devices:       { type: "array",  items: "string", description: "Selected device names" },
            intentTags:    { type: "array",  items: "string", description: "Detected signal tags" },
            missionBucket: { type: "string", description: "Value priority (Care/Save/Secure/Play/Discover)" },
            purpose:       { type: "string", description: "User's scenario note" },
            locale:        { type: "string", description: "Output locale" }
        }
    },

    "02": {
        name: "Recommended Scenarios",
        nameKo: "추천 시나리오",
        dataSource: "curation-engine",
        required: ["title", "score", "matchedTags", "devices", "valueTags"],
        optional: ["headline", "left_card", "right_card", "sequence", "device_symbols",
                   "originalText", "narrative", "source", "compositeScore",
                   "selection_reason", "regional_fit", "image_prompt", "style"],
        fields: {
            title:           { type: "string", description: "Scenario title", style: { font_size: "24pt", weight: "bold", align: "left" } },
            headline:        { type: "string", description: "One-line scenario value proposition", style: { font_size: "24pt", weight: "bold", align: "center" } },
            score:           { type: "number", description: "Base match score" },
            compositeScore:  { type: "number", description: "Composite score after pipeline" },
            source:          { type: "string", description: "Explore version source" },
            originalText:    { type: "string", description: "Original scenario text (max 300 chars)" },
            narrative:       { type: "string", description: "Scenario narrative" },
            matchedTags:     { type: "array",  items: "string", description: "Matched explore tags" },
            devices:         { type: "array",  items: "string", description: "Devices used in scenario" },
            valueTags:       { type: "array",  items: "string", description: "Value tags (Care/Save/...)" },
            left_card: {
                type: "object", description: "Left card content (scenario scene)",
                fields: {
                    card_title:    { type: "string", style: { font_size: "18pt", weight: "bold" } },
                    card_subtitle: { type: "string", description: "Mode label", style: { color: "#1428A0" } },
                    body:          { type: "string", description: "Scene description", style: { font_size: "14pt" } },
                    image_prompt:  { type: "string", description: "LLM/designer image description" }
                }
            },
            right_card: {
                type: "object", description: "Right card content (sequence flow)",
                fields: {
                    headline:       { type: "string", style: { font_size: "24pt", align: "center" } },
                    sub_headline:   { type: "string", style: { color: "#1428A0" } },
                    sequence:       { type: "string", description: "Step-by-step flow with → separators" },
                    device_symbols: { type: "array", items: "string", description: "Symbolic device icons" }
                }
            },
            sequence:        { type: "string", description: "Action flow (→ separated)" },
            device_symbols:  { type: "array",  items: "string", description: "Simple symbolic device icons" },
            selection_reason: {
                type: "object", description: "Why this scenario was selected",
                fields: {
                    q1_contribution:   { type: "string", description: "Q1 region keywords that matched" },
                    q2_contribution:   { type: "string", description: "Q2 segment keywords that matched" },
                    q3_contribution:   { type: "string", description: "Q3 device keywords that matched" },
                    decisive_keywords: { type: "array", items: "string", description: "Top weighted keywords" }
                }
            },
            regional_fit: {
                type: "object", description: "Regional fit details",
                fields: {
                    country:            { type: "string" },
                    city:               { type: "string" },
                    matchedRegionTags:  { type: "array", items: "string" },
                    regionScore:        { type: "number" },
                    fit_explanation:    { type: "string" }
                }
            },
            image_prompt:    { type: "string", description: "Main image prompt for designers/LLM" },
            style: {
                type: "object", description: "Card-level style metadata",
                fields: {
                    layout:     { type: "string", description: "card|split|full-width" },
                    theme:      { type: "string", description: "light|dark" },
                    accent:     { type: "string", description: "Accent color hex" }
                }
            }
        }
    },

    "03": {
        name: "Why These Were Selected",
        nameKo: "추천 근거 해설",
        dataSource: "curation-engine",
        required: ["title", "selection_reason", "regional_fit"],
        optional: ["q1_context", "q2_evidence", "q3_feasibility", "final_decision",
                   "matchedSignals", "valueSignals", "deviceFit", "score", "scoreRatio"],
        fields: {
            title:            { type: "string" },
            selection_reason: { type: "object", description: "Per-stage contribution breakdown (same as Section 02)" },
            regional_fit:     { type: "object", description: "Regional fit details (same as Section 02)" },
            q1_context:       { type: "string", description: "Q1 region context narrative" },
            q2_evidence:      { type: "string", description: "Q2 lifestyle evidence narrative" },
            q3_feasibility:   { type: "string", description: "Q3 device feasibility narrative" },
            final_decision:   { type: "string", description: "Final match decision narrative" },
            matchedSignals:   { type: "array", items: "string" },
            valueSignals:     { type: "array", items: "string" },
            deviceFit:        { type: "array", items: "string" },
            score:            { type: "number" },
            scoreRatio:       { type: "number", description: "Percentage vs top scorer" }
        }
    },

    "04": {
        name: "Scenario Comparison Matrix",
        nameKo: "시나리오 비교 매트릭스",
        dataSource: "curation-engine",
        required: ["scenarios", "dimensions"],
        optional: [],
        fields: {
            scenarios: { type: "array", items: "object", description: "Scenario list with derived levels per dimension" },
            dimensions: {
                type: "array", items: "object",
                description: "Comparison axes",
                fields: {
                    key:   { type: "string", description: "valueFocus|deviceDep|lifestyleRel|msgPotential|creativePotential|simplicity|campaignReady" },
                    label: { type: "string", description: "Display label" }
                }
            }
        }
    },

    "05": {
        name: "Campaign Readiness Overview",
        nameKo: "캠페인 활용 우선순위 진단",
        dataSource: "api",
        required: ["rank", "title", "fgdPriority", "fgdReason", "messageFit", "creativeFit",
                   "globalResonance", "localSpecificity", "differentiation", "executionComplexity", "recommendation"],
        optional: ["rationale"],
        fields: {
            rank:                { type: "number" },
            title:               { type: "string" },
            fgdPriority:         { type: "string", enum: ["High", "Medium", "Low"] },
            fgdReason:           { type: "string", description: "Why this FGD priority level" },
            messageFit:          { type: "string", enum: ["High", "Medium", "Low"] },
            creativeFit:         { type: "string", enum: ["High", "Medium", "Low"] },
            globalResonance:     { type: "string", enum: ["High", "Medium", "Low"] },
            localSpecificity:    { type: "string", enum: ["High", "Medium", "Low"] },
            differentiation:     { type: "string", enum: ["High", "Medium", "Low"] },
            executionComplexity: { type: "string", enum: ["High", "Medium", "Low"] },
            recommendation:      { type: "string" },
            rationale:           { type: "string", description: "Detailed rationale for each dimension score" }
        }
    },

    "06": {
        name: "AI FGD / Acceptance Testing Guide",
        nameKo: "AI FGD 가이드",
        dataSource: "api",
        required: ["rank", "title", "validationObjective", "appealPoints", "resistancePoints",
                   "personas", "fgdQuestions", "decisionSignals"],
        optional: [],
        fields: {
            rank:                { type: "number" },
            title:               { type: "string" },
            validationObjective: { type: "string" },
            appealPoints:        { type: "array", items: "string", minItems: 3 },
            resistancePoints:    { type: "array", items: "string", minItems: 2 },
            personas: {
                type: "array", items: "object", minItems: 2,
                fields: {
                    name:        { type: "string" },
                    description: { type: "string" },
                    demographics: { type: "string", optional: true },
                    painPoints:  { type: "array", items: "string", optional: true }
                }
            },
            fgdQuestions:   { type: "array", items: "string", minItems: 5, description: "Structured: intro → deep-dive → confirmation" },
            decisionSignals: { type: "array", items: "string", minItems: 3 }
        }
    },

    "07": {
        name: "Insight Translation for Campaign Planning",
        nameKo: "인사이트 전환",
        dataSource: "api",
        required: ["rank", "title", "consumerTension", "emotionalTrigger", "functionalTrigger",
                   "campaignTheme", "bigIdeas", "strategicImplication"],
        optional: ["actionableInsight"],
        fields: {
            rank:                 { type: "number" },
            title:                { type: "string" },
            consumerTension:      { type: "string" },
            emotionalTrigger:     { type: "string" },
            functionalTrigger:    { type: "string" },
            campaignTheme:        { type: "string" },
            bigIdeas:             { type: "array", items: "string", minItems: 2 },
            strategicImplication: { type: "string" },
            actionableInsight:    { type: "string", description: "Concrete next-step insight tied to market context" }
        }
    },

    "08": {
        name: "Message & Copy Development",
        nameKo: "메시지 및 카피",
        dataSource: "api",
        required: ["rank", "title", "tones"],
        optional: [],
        fields: {
            rank:  { type: "number" },
            title: { type: "string" },
            tones: {
                type: "array", items: "object", minItems: 4,
                description: "4 tone directions: Emotional, Practical, Tech-forward, Family-centered",
                fields: {
                    tone:            { type: "string" },
                    corePromise:     { type: "string" },
                    consumerBenefit: { type: "string" },
                    messageAngle:    { type: "string" },
                    toneRec:         { type: "string" },
                    headlines:       { type: "array", items: "string", minItems: 3 },
                    subcopy:         { type: "array", items: "string", minItems: 2 },
                    ctas:            { type: "array", items: "string", minItems: 2 },
                    watchouts:       { type: "string" }
                }
            }
        }
    },

    "09": {
        name: "Creative Direction Starter",
        nameKo: "크리에이티브 방향",
        dataSource: "api",
        required: ["rank", "title", "situationSetup", "universalTension", "localNuance",
                   "visualMood", "scenes", "formats", "creativeHook"],
        optional: ["sequence", "device_symbols"],
        fields: {
            rank:             { type: "number" },
            title:            { type: "string" },
            situationSetup:   { type: "string", description: "Vivid one-liner situation" },
            universalTension: { type: "string" },
            localNuance:      { type: "string" },
            visualMood:       { type: "array", items: "string", minItems: 5 },
            scenes:           { type: "array", items: "string", minItems: 3, description: "Scene descriptions" },
            formats:          { type: "array", items: "string", description: "Suggested formats" },
            creativeHook:     { type: "string" },
            sequence:         { type: "string", description: "Action flow for creative execution" },
            device_symbols:   { type: "array", items: "string", description: "Symbolic device icons for visual" }
        }
    },

    "10": {
        name: "Reference Directions",
        nameKo: "레퍼런스 방향",
        dataSource: "api",
        required: ["rank", "title", "searchFor", "referenceMood", "storyPattern",
                   "visualMotifs", "copyStyle", "avoid"],
        optional: ["concreteExamples"],
        fields: {
            rank:             { type: "number" },
            title:            { type: "string" },
            searchFor:        { type: "string" },
            referenceMood:    { type: "string" },
            storyPattern:     { type: "string" },
            visualMotifs:     { type: "string" },
            copyStyle:        { type: "string" },
            avoid:            { type: "string" },
            concreteExamples: { type: "array", items: "string", description: "Specific brand/campaign names for reference" }
        }
    },

    "11": {
        name: "Creative Concept Expansion",
        nameKo: "컨셉 확장",
        dataSource: "api",
        required: ["rank", "title", "concepts"],
        optional: [],
        fields: {
            rank:  { type: "number" },
            title: { type: "string" },
            concepts: {
                type: "array", items: "object", minItems: 2,
                fields: {
                    territory:     { type: "string", description: "Creative territory name" },
                    differentiator: { type: "string", description: "Emotional vs rational, premium vs accessible" },
                    variation:     { type: "string" },
                    shortForm:     { type: "string" },
                    heroFilm:      { type: "string" },
                    socialDigital: { type: "string" },
                    retailDemo:    { type: "string" }
                }
            }
        }
    },

    "12": {
        name: "Storyline & Storyboard Seed",
        nameKo: "스토리보드 초안",
        dataSource: "api",
        required: ["rank", "title", "storyHook", "narrativeArc", "cuts", "brandRole", "endingMessage"],
        optional: ["image_prompt"],
        fields: {
            rank:          { type: "number" },
            title:         { type: "string" },
            storyHook:     { type: "string" },
            narrativeArc:  { type: "string" },
            cuts: {
                type: "array", items: "object", minItems: 4,
                fields: {
                    cut:          { type: "number" },
                    scene:        { type: "string" },
                    visual:       { type: "string" },
                    copy:         { type: "string" },
                    emotion:      { type: "string" },
                    image_prompt: { type: "string", description: "LLM/designer image description for this cut" }
                }
            },
            brandRole:      { type: "string" },
            endingMessage:  { type: "string" },
            image_prompt:   { type: "string", description: "Overall storyboard image prompt" }
        }
    },

    "13": {
        name: "Recommended Next Actions",
        nameKo: "추천 다음 단계",
        dataSource: "static",
        required: ["actions"],
        optional: [],
        fields: {
            actions: {
                type: "array", items: "object",
                fields: {
                    icon:  { type: "string" },
                    label: { type: "string" },
                    id:    { type: "string" }
                }
            }
        }
    }
};

/**
 * 섹션 스키마 조회 헬퍼
 */
function getCampaignSectionSchema(sectionId) {
    return CAMPAIGN_SECTION_SCHEMAS[sectionId] || null;
}

/**
 * 섹션 데이터가 스키마의 required 필드를 모두 갖추었는지 검증
 */
function validateSectionAgainstSchema(sectionId, data) {
    const schema = CAMPAIGN_SECTION_SCHEMAS[sectionId];
    if (!schema) return { valid: true, warnings: [] };

    const warnings = [];
    const items = Array.isArray(data) ? data : [data];

    items.forEach((item, idx) => {
        schema.required.forEach(key => {
            if (item[key] === undefined || item[key] === null || item[key] === "") {
                warnings.push(`항목 ${idx + 1}: "${key}" 필드 누락 (required by schema)`);
            }
        });
    });

    return { valid: warnings.length === 0, warnings };
}

/**
 * AI JSON 응답에서 transformation 블록을 검증하고 보정
 * @param {Object} raw - AI가 반환한 JSON (또는 파싱된 객체)
 * @param {Object} selectionSummary - Selection Stage 산출물
 * @returns {{ valid: boolean, output: Object, errors: string[] }}
 */
function validateAndNormalizeOutput(raw, selectionSummary) {
    const errors = [];
    const output = {
        generationMode: raw.generationMode || "ai",
        generatedAt: raw.generatedAt || new Date().toISOString(),
        locale: raw.locale || selectionSummary?.locale || "ko",
        selection: selectionSummary || null,
        transformation: null,
        valueHighlights: [],
        localizedInsight: null,
        confidenceOrEvidence: null,
        sourceTrace: null
    };

    // transformation 블록 검증
    const tx = raw.transformation;
    if (!tx || typeof tx !== "object") {
        errors.push("transformation 블록이 없습니다.");
        return { valid: false, output, errors };
    }

    // marketerOutput 검증/보정
    const mo = tx.marketerOutput || {};
    output.transformation = {
        strategy: tx.strategy || "explore-grounded",
        sourceTrace: tx.sourceTrace || buildSourceTraceFromSelection(selectionSummary),

        marketerOutput: {
            headline: mo.headline || "",
            summary: mo.summary || "",
            whyThisScenario: mo.whyThisScenario || "",
            targetFit: mo.targetFit || { primary: "", secondary: "", estimatedReach: "" },
            channelStrategy: Array.isArray(mo.channelStrategy) ? mo.channelStrategy : [],
            copyOptions: Array.isArray(mo.copyOptions) ? mo.copyOptions : [],
            localInsight: mo.localInsight || "",
            roleDifferentiation: mo.roleDifferentiation || {}
        },

        consumerOutput: normalizeConsumerOutput(tx.consumerOutput || {})
    };

    // marketerOutput 필수 필드 체크
    if (!output.transformation.marketerOutput.headline) errors.push("marketerOutput.headline 누락");
    if (!output.transformation.marketerOutput.summary) errors.push("marketerOutput.summary 누락");
    if (output.transformation.marketerOutput.copyOptions.length === 0) errors.push("marketerOutput.copyOptions 비어있음");

    // consumerOutput 필수 필드 체크
    if (!output.transformation.consumerOutput.headline) errors.push("consumerOutput.headline 누락");
    if (!output.transformation.consumerOutput.whatItDoes) errors.push("consumerOutput.whatItDoes 누락");

    // 부가 정보
    output.valueHighlights = Array.isArray(raw.valueHighlights) ? raw.valueHighlights : [];
    output.localizedInsight = raw.localizedInsight || null;
    output.confidenceOrEvidence = raw.confidenceOrEvidence || null;
    output.sourceTrace = raw.sourceTrace || buildSourceTraceObj(selectionSummary);

    return {
        valid: errors.length === 0,
        output,
        errors
    };
}

function normalizeConsumerOutput(co) {
    return {
        headline: co.headline || "",
        whatItDoes: co.whatItDoes || "",
        requiredSetup: co.requiredSetup || { devices: [], apps: [], conditions: [] },
        setupSteps: Array.isArray(co.setupSteps) ? co.setupSteps : [],
        cautions: Array.isArray(co.cautions) ? co.cautions : [],
        alternatives: Array.isArray(co.alternatives) ? co.alternatives : []
    };
}

function buildSourceTraceFromSelection(sel) {
    if (!sel || !sel.selectedScenarios || sel.selectedScenarios.length === 0) return "";
    const primary = sel.selectedScenarios.find(s => s.isPrimary) || sel.selectedScenarios[0];
    return `Explore ${primary.source} > ${primary.articleTitle} > ${primary.title}`;
}

function buildSourceTraceObj(sel) {
    if (!sel || !sel.selectedScenarios || sel.selectedScenarios.length === 0) return null;
    const primary = sel.selectedScenarios.find(s => s.isPrimary) || sel.selectedScenarios[0];
    return {
        exploreVersion: primary.source || "",
        articleTitle: primary.articleTitle || "",
        storyTitle: primary.title || ""
    };
}

/**
 * AI 스트리밍 마크다운 텍스트에서 JSON 블록을 추출
 * AI가 ```json ... ``` 안에 JSON을 반환하거나, 순수 JSON을 반환하는 경우 모두 처리
 * @param {string} text - AI 출력 텍스트
 * @returns {{ json: Object|null, remainder: string }}
 */
function extractJsonFromAIOutput(text) {
    // 1. ```json ... ``` 블록 추출 시도
    const fenceMatch = text.match(/```json\s*([\s\S]*?)```/);
    if (fenceMatch) {
        try {
            return { json: JSON.parse(fenceMatch[1].trim()), remainder: "" };
        } catch { /* fall through */ }
    }

    // 2. 전체 텍스트가 JSON인지 시도 (객체 또는 배열)
    const trimmed = text.trim();
    if ((trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
        try {
            return { json: JSON.parse(trimmed), remainder: "" };
        } catch { /* fall through */ }
    }

    // 3. 텍스트 내 첫 번째 [ ... ] 배열 추출 (중첩 대응)
    const firstBracket = trimmed.indexOf("[");
    if (firstBracket >= 0) {
        let depth = 0;
        let end = -1;
        for (let i = firstBracket; i < trimmed.length; i++) {
            if (trimmed[i] === "[") depth++;
            else if (trimmed[i] === "]") { depth--; if (depth === 0) { end = i; break; } }
        }
        if (end > firstBracket) {
            try {
                const candidate = trimmed.substring(firstBracket, end + 1);
                return { json: JSON.parse(candidate), remainder: trimmed.substring(end + 1).trim() };
            } catch { /* fall through */ }
        }
    }

    // 4. 텍스트 내 첫 번째 { ... } 블록 추출 (중첩 대응)
    const firstBrace = trimmed.indexOf("{");
    if (firstBrace >= 0) {
        let depth = 0;
        let end = -1;
        for (let i = firstBrace; i < trimmed.length; i++) {
            if (trimmed[i] === "{") depth++;
            else if (trimmed[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
        }
        if (end > firstBrace) {
            try {
                const candidate = trimmed.substring(firstBrace, end + 1);
                return { json: JSON.parse(candidate), remainder: trimmed.substring(end + 1).trim() };
            } catch { /* fall through */ }
        }
    }

    // JSON 추출 실패 — 원본 텍스트 그대로 반환 (마크다운 fallback)
    return { json: null, remainder: text };
}

/**
 * 캠페인 섹션 API 응답의 필드 유무를 검증하고 경고 로그 생성
 * @param {string} sectionId - "05"~"12"
 * @param {Array} data - 파싱된 JSON 배열
 * @returns {{ valid: boolean, warnings: string[], data: Array }}
 */
function validateCampaignSectionData(sectionId, data) {
    if (!Array.isArray(data)) {
        return { valid: false, warnings: ["응답이 배열 형식이 아닙니다."], data: [] };
    }

    // Derive required keys from CAMPAIGN_SECTION_SCHEMAS (single source of truth)
    const SECTION_REQUIRED_KEYS = {};
    Object.entries(CAMPAIGN_SECTION_SCHEMAS).forEach(([id, schema]) => {
        if (schema.dataSource === "api") {
            SECTION_REQUIRED_KEYS[id] = schema.required;
        }
    });

    const requiredKeys = SECTION_REQUIRED_KEYS[sectionId] || ["rank", "title"];
    const warnings = [];

    data.forEach((item, idx) => {
        requiredKeys.forEach(key => {
            if (item[key] === undefined || item[key] === null || item[key] === "") {
                warnings.push(`항목 ${idx + 1}: "${key}" 필드 누락`);
                // 기본값 보정
                if (key === "rank") item.rank = idx + 1;
                if (key === "title") item.title = `Scenario ${idx + 1}`;
            }
        });
    });

    if (warnings.length > 0) {
        console.warn(`[OutputSchema] 섹션 ${sectionId} 검증 경고:`, warnings);
    }

    return { valid: warnings.length === 0, warnings, data };
}

/**
 * Fallback용: selectionSummary + 기존 latestPayload로부터 공통 스키마 생성
 * @param {Object} selectionSummary
 * @param {Object} payload - 기존 latestPayload (23필드)
 * @returns {Object} 공통 스키마
 */
function buildFallbackOutput(selectionSummary, payload) {
    const isKo = (selectionSummary?.locale || "ko") === "ko";
    const primary = selectionSummary?.selectedScenarios?.find(s => s.isPrimary)
        || selectionSummary?.selectedScenarios?.[0];

    // 마케터용: 기존 marketingMessages + exploreGrounding 활용
    const mm = payload.marketingMessages || {};
    const eg = payload.exploreGrounding || {};
    const lensOutputs = payload.lensOutputs || {};

    const copyOptions = (mm.lenses || []).map(lens => ({
        ko: lens.shortCopyKo || lens.hookKo || "",
        en: lens.hookEn || "",
        tone: lens.tone || ""
    })).filter(c => c.ko);

    const channelStrategy = [];
    if (lensOutputs.retail) channelStrategy.push({ channel: isKo ? "매장(Retail)" : "Retail", message: lensOutputs.retail.message || "", tone: isKo ? "생활밀착형" : "Practical", format: isKo ? "매장 시연" : "In-store demo" });
    if (lensOutputs.dotcom) channelStrategy.push({ channel: isKo ? "닷컴(Dotcom)" : "Dotcom", message: lensOutputs.dotcom.message || "", tone: isKo ? "설득형" : "Persuasive", format: isKo ? "랜딩 페이지" : "Landing page" });
    if (lensOutputs.brand) channelStrategy.push({ channel: isKo ? "브랜드캠페인" : "Brand Campaign", message: lensOutputs.brand.message || "", tone: isKo ? "감성형" : "Emotional", format: isKo ? "영상/KV" : "Video/KV" });

    // 일반 사용자용: 기존 setupGuide + deviceGuide 활용
    const sg = payload.setupGuide || {};
    const dg = payload.deviceGuide || {};
    const ds = payload.detailedScenario || {};

    const setupSteps = (sg.steps || []).map(s => typeof s === "string" ? s : s.instruction || s.step || "");
    const devices = (dg.deviceList || payload.scenarioMeta?.devices || []).map(d => ({
        name: typeof d === "string" ? d : d.name || "",
        role: typeof d === "object" ? (d.role || "") : "",
        required: true
    }));

    return {
        generationMode: "fallback",
        generatedAt: new Date().toISOString(),
        locale: selectionSummary?.locale || "ko",
        selection: selectionSummary,
        transformation: {
            strategy: primary ? "explore-grounded" : "jtbd-inference",
            sourceTrace: buildSourceTraceFromSelection(selectionSummary),
            marketerOutput: {
                headline: payload.title || "",
                summary: payload.summary || "",
                whyThisScenario: eg.coreMessage || eg.proofLine || "",
                targetFit: {
                    primary: payload.scenarioMeta?.segment || "",
                    secondary: "",
                    estimatedReach: ""
                },
                channelStrategy,
                copyOptions,
                localInsight: eg.observation || "",
                roleDifferentiation: {
                    retail: lensOutputs.retail?.message || "",
                    dotcom: lensOutputs.dotcom?.message || "",
                    brand: lensOutputs.brand?.message || ""
                }
            },
            consumerOutput: {
                headline: payload.title || "",
                whatItDoes: (ds.cases || []).map(c => c.story || c.benefit || "").filter(Boolean).join(" "),
                requiredSetup: {
                    devices,
                    apps: ["SmartThings"],
                    conditions: sg.prerequisites || []
                },
                setupSteps,
                cautions: sg.notes || [],
                alternatives: []
            }
        },
        valueHighlights: (primary?.valueTags || []).map(v => ({
            value: v,
            description: ""
        })),
        localizedInsight: payload.narrative ? {
            observation: payload.narrative.observation || "",
            insight: payload.narrative.insight || "",
            implication: payload.narrative.implication || ""
        } : null,
        confidenceOrEvidence: payload.facts ? {
            dataGrounded: (payload.facts.confirmed || []).map(f => typeof f === "string" ? f : f.text || ""),
            inferred: (payload.facts.inferences || []).map(f => typeof f === "string" ? f : f.text || ""),
            serviceAvailability: ""
        } : null,
        sourceTrace: buildSourceTraceObj(selectionSummary)
    };
}

// Export
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        validateAndNormalizeOutput,
        extractJsonFromAIOutput,
        buildFallbackOutput,
        normalizeConsumerOutput,
        buildSourceTraceFromSelection,
        buildSourceTraceObj,
        validateCampaignSectionData,
        getCampaignSectionSchema,
        validateSectionAgainstSchema,
        OUTPUT_SCHEMA_FIELDS,
        CAMPAIGN_SECTION_SCHEMAS
    };
}
