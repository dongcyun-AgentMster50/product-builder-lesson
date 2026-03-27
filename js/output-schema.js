/**
 * Output Schema v1.0 — AI/Fallback 공통 JSON 스키마
 * AI 출력과 fallback 출력 모두 이 스키마를 따르도록 강제한다.
 * "동일 스키마 → 동일 렌더링" 원칙.
 */

// ─── 스키마 필드 정의 (검증용) ───
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

    const SECTION_REQUIRED_KEYS = {
        "05": ["rank", "title", "fgdPriority", "recommendation"],
        "06": ["rank", "title", "validationObjective", "fgdQuestions"],
        "07": ["rank", "title", "consumerTension", "campaignTheme"],
        "08": ["rank", "title", "tones"],
        "09": ["rank", "title", "situationSetup", "creativeHook"],
        "10": ["rank", "title", "searchFor", "referenceMood"],
        "11": ["rank", "title", "concepts"],
        "12": ["rank", "title", "storyHook", "cuts"]
    };

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
        OUTPUT_SCHEMA_FIELDS
    };
}
