/* ══════════════════════════════════════════════════════════════════════
   Campaign Activation Output — 13-Section Rendering Engine
   Replaces the old Category Selection + AI Generation flow.
   Sections 01–04: built from local curation data
   Sections 05–12: generated via streaming API calls
   Section 13: static next-action buttons
   ══════════════════════════════════════════════════════════════════════ */

// ──────── State ────────
let _coResults = [];          // top-5 curation results
let _coContext = null;        // aiScenarioContext snapshot
let _coSelectedScenario = null;
let _coSummary = null;        // latestSelectionSummary snapshot
let _coApiSections = {};      // { "05": {status, html}, ... }
let _coActiveNavSec = "01";

// ──────── Constants ────────
const CO_VALUE_COLORS = {
    Care: "#4a90d9", Save: "#2ecc71", Secure: "#e67e22", Play: "#9b59b6",
    Discover: "#3498db", Health: "#16a085", Connect: "#2980b9",
    Simplify: "#8e44ad", Comfort: "#d35400", Protect: "#c0392b"
};

// ──────── Dynamic Readiness / Why Helpers ────────
function _deriveReadinessLabel(scenario, allResults) {
    const f = _formatResult(scenario);
    const tagCount = (f.matchedTags || []).length;
    const devCount = (f.devices || []).length;
    const score = f.score || 0;
    const maxScore = allResults.length > 0 ? (_formatResult(allResults[0]).score || 1) : 1;
    const scoreRatio = score / Math.max(maxScore, 1);
    const valueTags = f.valueTags || [];

    // FGD Ready: 태그 풍부 + 높은 점수 → 검증 가치 높음
    if (tagCount >= 4 && scoreRatio >= 0.8) return "FGD Ready";
    // Copy Ready: 가치 태그가 명확하고 기기 적음 → 메시지 선명
    if (valueTags.length >= 1 && devCount <= 3 && tagCount >= 2) return "Copy Ready";
    // Creative Ready: 기기 다양 → 시각적 장면 풍부
    if (devCount >= 4) return "Creative Ready";
    // High Local Fit: 점수 높으나 태그 적음 → 기기 매칭 중심
    if (scoreRatio >= 0.7 && tagCount <= 2) return "High Local Fit";
    // Balanced Candidate: 나머지
    return "Balanced Candidate";
}

function _buildWhyExplanation(scenario, context, allResults) {
    const f = _formatResult(scenario);
    const isKo = (context?.locale || "ko") === "ko";
    const tags = (f.matchedTags || []).slice(0, 4);
    const devices = (f.devices || []).slice(0, 3);
    const score = f.score || 0;
    const maxScore = allResults.length > 0 ? (_formatResult(allResults[0]).score || 1) : 1;
    const scoreRatio = Math.round((score / Math.max(maxScore, 1)) * 100);
    const inputDevices = context?.devices || [];
    const deviceOverlap = devices.filter(d => inputDevices.some(id => id.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(id.toLowerCase())));

    if (isKo) {
        const parts = [];
        if (tags.length > 0) parts.push(`입력 조건에서 "${tags.join('", "')}" 키워드가 매칭되었습니다`);
        if (deviceOverlap.length > 0) parts.push(`선택한 기기 중 ${deviceOverlap.join(', ')}이(가) 이 시나리오에 직접 활용됩니다`);
        else if (devices.length > 0) parts.push(`이 시나리오는 ${devices.join(', ')} 기기를 활용합니다`);
        parts.push(`전체 대비 적합도 ${scoreRatio}% (${score}점)`);
        return parts.join(". ") + ".";
    } else {
        const parts = [];
        if (tags.length > 0) parts.push(`Matched keywords: "${tags.join('", "')}"`);
        if (deviceOverlap.length > 0) parts.push(`Your devices ${deviceOverlap.join(', ')} are directly used in this scenario`);
        else if (devices.length > 0) parts.push(`Uses devices: ${devices.join(', ')}`);
        parts.push(`Relevance: ${scoreRatio}% (score ${score})`);
        return parts.join(". ") + ".";
    }
}

function _localizeWhyTag(tag, isKo) {
    if (!isKo) return tag || "";
    const map = {
        "Care for kids": "자녀 케어",
        "Care for seniors": "시니어 케어",
        "Care for your pet": "반려동물 케어",
        "Keep your home safe": "홈 안전·보안",
        "Save energy": "에너지 절약",
        "Help with chores": "가사 자동화",
        "Sleep well": "수면 개선",
        "Enhanced mood": "분위기 연출",
        "Stay fit & healthy": "건강·피트니스",
        "Easily control your lights": "조명 제어",
        "Keep the air fresh": "공기질 관리",
        "Find your belongings": "분실물 찾기",
        "Family care": "가족 돌봄",
        "Multicultural family support": "다문화 가족 지원",
        "Care": "돌봄",
        "Save": "절약",
        "Secure": "보안",
        "Play": "여가",
        "Discover": "탐색"
    };
    return map[tag] || tag;
}

function _buildWhyBreakdown(scenario, context, allResults) {
    const f = _formatResult(scenario);
    const isKo = (context?.locale || "ko") === "ko";
    const maxScore = allResults.length > 0 ? (_formatResult(allResults[0]).score || 1) : 1;
    const score = f.score || 0;
    const scoreRatio = Math.round((score / Math.max(maxScore, 1)) * 100);
    const market = [context?.country, context?.cityDisplay || context?.city].filter(Boolean).join(" / ");
    const segment = context?.segment || (isKo ? "미입력" : "Not specified");
    const mission = _localizeWhyTag(context?.missionBucket || "Discover", isKo);
    const matchedSignals = (f.matchedTags || []).slice(0, 4).map((tag) => _localizeWhyTag(tag, isKo));
    const valueSignals = (f.valueTags || []).slice(0, 3).map((tag) => _localizeWhyTag(tag, isKo));
    const inputDevices = context?.devices || [];
    const deviceFit = (f.devices || []).filter((device) =>
        inputDevices.some((id) => id.toLowerCase().includes(device.toLowerCase()) || device.toLowerCase().includes(id.toLowerCase()))
    );

    return {
        q1: isKo
            ? `${market || "선택 시장"} 맥락에서 읽힌 생활 문제와 사용 환경이 이 시나리오의 배경 장면과 맞닿아 있습니다.`
            : `Signals from ${market || "the selected market"} align with the situation this scenario assumes.`,
        q2: isKo
            ? `Q2에서 고른 "${segment}" 맥락이 ${matchedSignals.join(", ") || mission} 수요로 번역되며, 이 시나리오의 핵심 니즈와 직접 연결됩니다.`
            : `Your Q2 segment "${segment}" translated into ${matchedSignals.join(", ") || mission} demand, which directly supports this scenario.`,
        q3: isKo
            ? `${deviceFit.length ? `${deviceFit.join(", ")} 기기` : "선택 기기 조합"}가 실제 실행 장면에 들어가서 아이디어 수준이 아니라 구현 가능한 시나리오로 판단했습니다.`
            : `${deviceFit.length ? `${deviceFit.join(", ")} devices` : "The selected device mix"} can execute the routine, so this was treated as an actionable scenario rather than a loose idea.`,
        fit: isKo
            ? `최종적으로 ${matchedSignals.join(", ") || mission} 신호와 ${valueSignals.join(", ") || mission} 가치 정합성이 겹쳐 전체 대비 적합도 ${scoreRatio}% (${score}점)로 올라왔습니다.`
            : `Combined signal overlap on ${matchedSignals.join(", ") || mission} and value alignment on ${valueSignals.join(", ") || mission} pushed this scenario to ${scoreRatio}% fit (${score} points).`,
        matchedSignals,
        valueSignals,
        deviceFit,
        score,
        scoreRatio
    };
}

function _buildDynamicSummaryNote(context, results) {
    const isKo = (context?.locale || "ko") === "ko";
    const mission = context?.missionBucket || "Discover";
    // 상위 결과에서 가장 빈번한 가치 태그 추출
    const valueFreq = {};
    results.slice(0, 5).forEach(sc => {
        const f = _formatResult(sc);
        (f.valueTags || []).forEach(v => { valueFreq[v] = (valueFreq[v] || 0) + 1; });
        (f.matchedTags || []).slice(0, 2).forEach(t => { valueFreq[t] = (valueFreq[t] || 0) + 1; });
    });
    const topValues = Object.entries(valueFreq).sort((a, b) => b[1] - a[1]).slice(0, 2).map(e => e[0]);
    const devCount = (context?.devices || []).length;

    if (isKo) {
        const valText = topValues.length > 0 ? `"${topValues.join('", "')}"` : `"${mission}"`;
        const devText = devCount > 0 ? `${devCount}개 기기 조합을 고려하여` : "";
        return `입력 조건을 기반으로 ${devText} ${valText} 중심의 시나리오가 분석되었습니다.`;
    } else {
        const valText = topValues.length > 0 ? topValues.join(" and ") : mission;
        const devText = devCount > 0 ? `with ${devCount} devices considered, ` : "";
        return `Based on your inputs, ${devText}scenarios focused on ${valText} were analyzed.`;
    }
}

const CO_SECTIONS = [
    { id: "01", key: "inputSummary" },
    { id: "02", key: "top5" },
    { id: "03", key: "whySelected" },
    { id: "04", key: "comparisonMatrix" },
    { id: "05", key: "campaignReadiness", api: true },
    { id: "06", key: "fgdGuide", api: true },
    { id: "07", key: "insightTranslation", api: true },
    { id: "08", key: "messageCopy", api: true },
    { id: "09", key: "creativeDirection", api: true },
    { id: "10", key: "referenceDirections", api: true },
    { id: "11", key: "conceptExpansion", api: true },
    { id: "12", key: "storyboardSeed", api: true },
    { id: "13", key: "nextActions" }
];

// ──────── Entry Point ────────
let _coApiPrompts = {};  // 섹션별 프롬프트 캐시 (재시도용)

function launchCampaignOutput(results, selectedScenario, context, selectionSummary) {
    _coResults = results || [];
    _coSelectedScenario = selectedScenario;
    _coContext = context;
    _coSummary = selectionSummary;
    _coApiSections = {};
    _coApiPrompts = {};

    const frame = document.getElementById("campaign-output-frame");
    if (!frame) return;
    frame.classList.remove("hidden");

    // Build section nav
    _buildSectionNav();

    // Render local sections (01-04)
    _renderSec01_InputSummary();
    _renderSec02_Top5();
    _renderSec03_WhySelected();
    _renderSec04_ComparisonMatrix();

    // Render section 13 (static actions)
    _renderSec13_NextActions();

    // Scroll to frame
    frame.scrollIntoView({ behavior: "smooth", block: "start" });

    // Launch API sections (05-12) in parallel
    _launchApiSections();
}

// ──────── Section Nav ────────
function _buildSectionNav() {
    const inner = document.getElementById("co-nav-inner");
    if (!inner) return;
    const labels = [
        "01 Input", "02 TOP 5", "03 Why", "04 Compare",
        "05 Readiness", "06 FGD", "07 Insight", "08 Copy",
        "09 Creative", "10 Ref", "11 Concept", "12 Story", "13 Actions"
    ];
    inner.innerHTML = labels.map((lbl, i) => {
        const num = String(i + 1).padStart(2, "0");
        return `<a href="#co-sec-${num}" class="co-nav-item${num === "01" ? " active" : ""}" data-nav="${num}">${lbl}</a>`;
    }).join("");

    inner.querySelectorAll(".co-nav-item").forEach(a => {
        a.addEventListener("click", e => {
            e.preventDefault();
            const sec = document.getElementById(`co-sec-${a.dataset.nav}`);
            if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    // Intersection observer for active state
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const num = entry.target.dataset.coSec;
                inner.querySelectorAll(".co-nav-item").forEach(a => a.classList.toggle("active", a.dataset.nav === num));
            }
        });
    }, { threshold: 0.3 });
    document.querySelectorAll(".co-section").forEach(s => observer.observe(s));
}

// ──────── Utility ────────
function _esc(str) { return typeof escapeHtml === "function" ? escapeHtml(String(str || "")) : String(str || "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m])); }
function _badge(text, type) {
    const cls = type ? `co-badge co-badge--${type}` : "co-badge";
    return `<span class="${cls}">${_esc(text)}</span>`;
}
function _valueBadge(tag) {
    const color = CO_VALUE_COLORS[tag] || "#888";
    return `<span class="co-value-badge" style="--vb-color:${color}">${_esc(tag)}</span>`;
}
function _scorePill(score) {
    const pct = Math.min(100, Math.max(0, score));
    return `<span class="co-score-pill"><span class="co-score-fill" style="width:${pct}%"></span><span class="co-score-label">${score}</span></span>`;
}
function _chip(text) { return `<span class="co-chip">${_esc(text)}</span>`; }

function _formatResult(scenario) {
    return typeof formatCurationResult === "function" ? formatCurationResult(scenario) : scenario;
}

// ──────── Section 01: Input Summary ────────
function _renderSec01_InputSummary() {
    const body = document.getElementById("co-body-01");
    if (!body || !_coContext) return;

    const ctx = _coContext;
    const isKo = (ctx.locale || "ko") === "ko";

    const cityText = ctx.cityDisplay || ctx.city || "";
    const marketText = `${ctx.country || ""}${cityText ? " / " + cityText : ""}`;

    const deviceChips = (ctx.devices || []).map(d => _chip(d)).join("");
    const tagChips = (ctx.intentTags || []).map(t => _chip(t)).join("");
    const missionLabel = ctx.missionBucket || "Discover";

    const summaryNote = _buildDynamicSummaryNote(ctx, _coResults);

    body.innerHTML = `
        <div class="co-input-summary-card">
            <div class="co-input-grid">
                <div class="co-input-item">
                    <span class="co-input-label">${isKo ? "국가 / 도시" : "Country / City"}</span>
                    <strong>${_esc(marketText)}</strong>
                </div>
                <div class="co-input-item">
                    <span class="co-input-label">${isKo ? "추정 가치 우선순위" : "Inferred Value Priorities"}</span>
                    <strong>${_valueBadge(missionLabel)}</strong>
                </div>
                <div class="co-input-item co-input-item--wide">
                    <span class="co-input-label">${isKo ? "타겟 세그먼트" : "Target Segment"}</span>
                    <strong>${_esc(ctx.segment || "-")}</strong>
                </div>
                <div class="co-input-item co-input-item--wide">
                    <span class="co-input-label">${isKo ? "반영 기기" : "Devices Considered"}</span>
                    <div class="co-chip-row">${deviceChips || _chip(isKo ? "선택 없음" : "None")}</div>
                </div>
                ${tagChips ? `
                <div class="co-input-item co-input-item--wide">
                    <span class="co-input-label">${isKo ? "감지된 신호 태그" : "Detected Signal Tags"}</span>
                    <div class="co-chip-row">${tagChips}</div>
                </div>` : ""}
                ${ctx.purpose ? `
                <div class="co-input-item co-input-item--wide">
                    <span class="co-input-label">${isKo ? "상황 메모" : "Scenario Note"}</span>
                    <strong>${_esc(ctx.purpose)}</strong>
                </div>` : ""}
            </div>
            <p class="co-strategic-read">${_esc(summaryNote)}</p>
        </div>
    `;
}

// ──────── Section 02: Top 5 Scenarios ────────
function _renderSec02_Top5() {
    const body = document.getElementById("co-body-02");
    if (!body) return;

    const isKo = (_coContext?.locale || "ko") === "ko";

    body.innerHTML = _coResults.map((scenario, idx) => {
        const f = _formatResult(scenario);
        const bodyText = String(f.originalText || f.narrative || "").trim();
        const valueTags = (f.valueTags || f.matchedTags || []).slice(0, 4);
        const readinessLabel = _deriveReadinessLabel(scenario, _coResults);
        const isTop = idx === 0;

        return `
        <article class="co-scenario-card${isTop ? " co-scenario-card--top" : ""}" data-co-idx="${idx}">
            <div class="co-scenario-header">
                <span class="co-scenario-rank">${idx + 1}</span>
                <div class="co-scenario-title-area">
                    <h4 class="co-scenario-title">${_esc(f.title)}</h4>
                    <span class="co-scenario-source">${_esc(f.source || "")}</span>
                </div>
                ${_scorePill(f.score || 0)}
                <span class="co-badge co-badge--readiness">${readinessLabel}</span>
            </div>
            <div class="co-scenario-tags">
                ${valueTags.map(t => _valueBadge(t)).join("")}
            </div>
            <div class="co-scenario-body${isTop ? "" : " co-collapsed"}" id="co-scenario-body-${idx}">
                <p class="co-scenario-desc">${_esc(bodyText)}</p>
                <div class="co-scenario-signals">
                    <span class="co-input-label">${isKo ? "반영된 핵심 신호" : "Matched Signals"}</span>
                    <div class="co-chip-row">${(f.matchedTags || []).map(t => _chip(t)).join("")}</div>
                </div>
                <div class="co-scenario-devices">
                    <span class="co-input-label">${isKo ? "사용 기기" : "Devices"}</span>
                    <div class="co-chip-row">${(f.devices || []).map(d => _chip(d)).join("")}</div>
                </div>
                <p class="co-scenario-fit"><strong>${isKo ? "추천 이유" : "Why It Fits"}:</strong> ${_esc(_buildWhyExplanation(scenario, _coContext, _coResults))}</p>
            </div>
            ${!isTop ? `<button type="button" class="co-expand-btn" data-target="co-scenario-body-${idx}" aria-expanded="false">${isKo ? "상세 보기" : "Expand"}</button>` : ""}
        </article>`;
    }).join("");

    // Accordion expand/collapse
    body.querySelectorAll(".co-expand-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const target = document.getElementById(btn.dataset.target);
            if (!target) return;
            const isKo = (_coContext?.locale || "ko") === "ko";
            const shouldOpen = target.classList.contains("co-collapsed");

            body.querySelectorAll(".co-scenario-body").forEach((panel) => {
                if (panel === target || !panel.id) return;
                panel.classList.add("co-collapsed");
            });
            body.querySelectorAll(".co-expand-btn").forEach((otherBtn) => {
                if (otherBtn === btn) return;
                otherBtn.textContent = isKo ? "상세 보기" : "Expand";
                otherBtn.setAttribute("aria-expanded", "false");
            });

            target.classList.toggle("co-collapsed", !shouldOpen);
            btn.textContent = shouldOpen ? (isKo ? "접기" : "Collapse") : (isKo ? "상세 보기" : "Expand");
            btn.setAttribute("aria-expanded", shouldOpen ? "true" : "false");

            if (shouldOpen) {
                requestAnimationFrame(() => {
                    target.closest(".co-scenario-card")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                });
            }
        });
    });
}

// ──────── Section 03: Why Selected ────────
function _renderSec03_WhySelected() {
    const body = document.getElementById("co-body-03");
    if (!body) return;

    const isKo = (_coContext?.locale || "ko") === "ko";

    body.innerHTML = `<div class="co-why-grid">` + _coResults.map((scenario, idx) => {
        const f = _formatResult(scenario);
        const why = _buildWhyBreakdown(scenario, _coContext, _coResults);
        const signals = why.matchedSignals;
        const devices = (f.devices || []).slice(0, 4);
        const valueTags = why.valueSignals.length ? why.valueSignals : [_localizeWhyTag(_coContext?.missionBucket || "Discover", isKo)];

        return `
        <div class="co-why-card">
            <div class="co-why-header">
                <span class="co-scenario-rank co-scenario-rank--sm">${idx + 1}</span>
                <h4>${_esc(f.title)}</h4>
            </div>
            <div class="co-why-row">
                <span class="co-why-label">${isKo ? "매칭 로직 요약" : "Matching Logic Summary"}</span>
                <p>${_esc(_buildWhyExplanation(scenario, _coContext, _coResults))}</p>
            </div>
            <div class="co-why-row">
                <span class="co-why-label">${isKo ? "Q1 지역 맥락 반영" : "Q1 Context Applied"}</span>
                <p>${_esc(why.q1)}</p>
            </div>
            <div class="co-why-row">
                <span class="co-why-label">${isKo ? "Q2 생활맥락 근거" : "Q2 Lifestyle Evidence"}</span>
                <p>${_esc(why.q2)}</p>
                <div class="co-chip-row">${signals.map(s => _chip(s)).join("")}</div>
            </div>
            <div class="co-why-row">
                <span class="co-why-label">${isKo ? "Q3 기기 실행 가능성" : "Q3 Device Feasibility"}</span>
                <p>${_esc(why.q3)}</p>
                <div class="co-chip-row">${devices.map(d => _chip(d)).join("")}</div>
            </div>
            <div class="co-why-row">
                <span class="co-why-label">${isKo ? "최종 매칭 판단" : "Final Match Decision"}</span>
                <p>${_esc(why.fit)}</p>
            </div>
            <div class="co-why-row">
                <span class="co-why-label">${isKo ? "가장 크게 반영된 입력 신호" : "Strongest Input Signals"}</span>
                <div class="co-chip-row">${signals.map(s => _chip(s)).join("")}</div>
            </div>
            <div class="co-why-row">
                <span class="co-why-label">${isKo ? "기기 적합성" : "Device Fit"}</span>
                <div class="co-chip-row">${devices.map(d => _chip(d)).join("")}</div>
            </div>
            <div class="co-why-row">
                <span class="co-why-label">${isKo ? "가치 정합성" : "Value Alignment"}</span>
                <div class="co-chip-row">${valueTags.map(v => _valueBadge(v)).join("")}</div>
            </div>
        </div>`;
    }).join("") + `</div>`;
}

// ──────── Section 04: Comparison Matrix ────────
function _renderSec04_ComparisonMatrix() {
    const body = document.getElementById("co-body-04");
    if (!body) return;

    const isKo = (_coContext?.locale || "ko") === "ko";
    const dims = [
        { key: "valueFocus", label: isKo ? "핵심 가치" : "Value Focus" },
        { key: "deviceDep", label: isKo ? "기기 의존도" : "Device Dependency" },
        { key: "lifestyleRel", label: isKo ? "생활밀착도" : "Lifestyle Relevance" },
        { key: "msgPotential", label: isKo ? "메시지 확장성" : "Message Potential" },
        { key: "creativePotential", label: isKo ? "크리에이티브 확장성" : "Creative Potential" },
        { key: "simplicity", label: isKo ? "설명 용이성" : "Simplicity of Explanation" },
        { key: "campaignReady", label: isKo ? "캠페인 활용 적합성" : "Campaign Readiness" }
    ];

    const levels = ["High", "Medium", "Focused", "Broad", "Strong", "Moderate"];

    // 시나리오 데이터 기반 다축 분석
    const maxScore = _coResults.length > 0 ? (_formatResult(_coResults[0]).score || 1) : 1;
    function deriveLevel(scenario, dimKey) {
        const f = _formatResult(scenario);
        const tagCount = (f.matchedTags || []).length;
        const devCount = (f.devices || []).length;
        const score = f.score || 0;
        const scoreRatio = score / Math.max(maxScore, 1);
        const valueTags = f.valueTags || [];
        const inputDevices = _coContext?.devices || [];
        const deviceOverlap = (f.devices || []).filter(d => inputDevices.some(id => id.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(id.toLowerCase()))).length;

        switch (dimKey) {
            case "valueFocus": return valueTags.length > 0 ? valueTags.slice(0, 2).join(", ") : (tagCount > 2 ? "Broad" : "Focused");
            case "deviceDep": return devCount > 4 ? "High" : devCount > 2 ? "Medium" : "Low";
            case "lifestyleRel": return scoreRatio >= 0.8 ? "High" : scoreRatio >= 0.5 ? "Medium" : "Low";
            case "msgPotential": return (tagCount >= 3 && valueTags.length >= 1) ? "Strong" : tagCount >= 2 ? "Moderate" : "Low";
            case "creativePotential": return (devCount >= 3 && tagCount >= 2) ? "Strong" : devCount >= 2 ? "Moderate" : "Low";
            case "simplicity": return devCount <= 2 ? "High" : devCount <= 4 ? "Medium" : "Low";
            case "campaignReady": return (scoreRatio >= 0.7 && tagCount >= 3) ? "Strong" : scoreRatio >= 0.4 ? "Moderate" : "Low";
            default: return "Medium";
        }
    }

    body.innerHTML = `
    <div class="co-matrix-wrap">
        <table class="co-matrix-table">
            <thead>
                <tr>
                    <th>${isKo ? "비교 축" : "Dimension"}</th>
                    ${_coResults.map((_, i) => `<th class="co-matrix-sc">#${i + 1}</th>`).join("")}
                </tr>
            </thead>
            <tbody>
                ${dims.map(dim => `
                <tr>
                    <td class="co-matrix-dim">${dim.label}</td>
                    ${_coResults.map(sc => {
                        const val = deriveLevel(sc, dim.key);
                        const cls = val === "High" || val === "Strong" ? "co-level--high" : val === "Moderate" || val === "Medium" ? "co-level--med" : "co-level--low";
                        return `<td><span class="co-level ${cls}">${_esc(val)}</span></td>`;
                    }).join("")}
                </tr>`).join("")}
            </tbody>
        </table>
    </div>`;

    // Hover highlight
    body.querySelectorAll("tr").forEach(tr => {
        tr.addEventListener("mouseenter", () => tr.classList.add("co-matrix-hover"));
        tr.addEventListener("mouseleave", () => tr.classList.remove("co-matrix-hover"));
    });
}

// ──────── Section 13: Next Actions ────────
function _renderSec13_NextActions() {
    const body = document.getElementById("co-body-13");
    if (!body) return;

    const isKo = (_coContext?.locale || "ko") === "ko";

    const actions = [
        { icon: "🧪", label: isKo ? "AI FGD 질문 실행" : "Run AI FGD Questions", id: "act-fgd" },
        { icon: "✍️", label: isKo ? "카피 추가 생성" : "Generate More Copy Options", id: "act-copy" },
        { icon: "🎨", label: isKo ? "크리에이티브 확장" : "Expand Creative Concepts", id: "act-creative" },
        { icon: "🎬", label: isKo ? "스토리보드 상세화" : "Build Storyboard Draft", id: "act-storyboard" },
        { icon: "🔍", label: isKo ? "레퍼런스 탐색" : "Search References", id: "act-ref" },
        { icon: "📄", label: isKo ? "요약 브리프 내보내기" : "Export Brief Summary", id: "act-export" }
    ];

    body.innerHTML = `
        <div class="co-actions-grid">
            ${actions.map(a => `
                <button type="button" class="co-action-btn" data-action="${a.id}">
                    <span class="co-action-icon">${a.icon}</span>
                    <span class="co-action-label">${_esc(a.label)}</span>
                </button>
            `).join("")}
        </div>
    `;

    // Export button handler
    body.querySelector('[data-action="act-export"]')?.addEventListener("click", () => {
        _exportCampaignBrief();
    });
}

// ──────── API Section Generation ────────
async function _launchApiSections() {
    // Update flow tracker
    if (typeof updateOutputFlowTracker === "function") {
        updateOutputFlowTracker(2, { 1: "done", 2: "active", 3: "waiting" });
    }

    // Build common context for API prompts
    const scenarioSummaries = _coResults.map((sc, i) => {
        const f = _formatResult(sc);
        const origSnippet = (f.originalText || f.narrative || "").substring(0, 300).replace(/\n/g, " ");
        const valTags = (f.valueTags || []).join(", ");
        return [
            `#${i + 1} "${f.title}" (score: ${f.score})`,
            `  Tags: ${(f.matchedTags || []).join(", ")}`,
            `  Values: ${valTags || "N/A"}`,
            `  Devices: ${(f.devices || []).join(", ")}`,
            origSnippet ? `  Original: ${origSnippet}` : ""
        ].filter(Boolean).join("\n");
    }).join("\n\n");

    const inputSummary = `Country: ${_coContext?.country || ""}, City: ${_coContext?.city || ""}, Segment: ${_coContext?.segment || ""}, Devices: ${(_coContext?.devices || []).join(", ")}, Value: ${_coContext?.missionBucket || ""}`;

    const locale = _coContext?.locale || "ko";
    const langInstruction = locale === "ko"
        ? "Answer entirely in Korean. Use professional marketing/campaign planning tone."
        : `Answer in ${locale}. Use professional marketing/campaign planning tone.`;

    // Define API section prompts
    const apiSections = [
        {
            id: "05",
            prompt: `${langInstruction}\n\nYou are a campaign strategy analyst. Given these 5 recommended smart home scenarios and the user's input context, create a "Campaign Readiness Overview" for each scenario.\n\nInput Context:\n${inputSummary}\n\nTop 5 Scenarios:\n${scenarioSummaries}\n\nFor each scenario, provide:\n1. FGD Priority (FGD 검증 우선도) - High/Medium/Low with reason\n2. Message Development Fit (메시지 개발 적합도) - High/Medium/Low\n3. Creative Expansion Fit (크리에이티브 확장 적합도) - High/Medium/Low\n4. Global Resonance Potential (글로벌 공감 가능성) - High/Medium/Low\n5. Local Specificity (지역 특화성) - High/Medium/Low\n6. Differentiation Potential (차별화 가능성) - High/Medium/Low\n7. Execution Complexity (실행 복잡도) - High/Medium/Low\n8. One recommendation sentence per scenario\n\nReturn as valid JSON array with 5 objects, each having keys: rank, title, fgdPriority, fgdReason, messageFit, creativeFit, globalResonance, localSpecificity, differentiation, executionComplexity, recommendation.`
        },
        {
            id: "06",
            prompt: `${langInstruction}\n\nYou are a consumer research specialist. Create an "AI FGD / Acceptance Testing Guide" for each of the 5 recommended scenarios.\n\nInput Context:\n${inputSummary}\n\nTop 5 Scenarios:\n${scenarioSummaries}\n\nFor each scenario, provide:\n1. Validation Objective (검증 목적)\n2. Likely Appeal Points (예상 매력 포인트) - list 3\n3. Likely Resistance Points (예상 저항 포인트) - list 2-3\n4. Best-fit Personas to Test (우선 검증 페르소나) - describe 2\n5. Suggested FGD Questions (권장 질문) - provide 5 realistic questions\n6. Decision Signals to Watch (의사결정 판단 포인트) - list 3\n\nReturn as valid JSON array with 5 objects, each having keys: rank, title, validationObjective, appealPoints(array), resistancePoints(array), personas(array of {name,description}), fgdQuestions(array), decisionSignals(array).`
        },
        {
            id: "07",
            prompt: `${langInstruction}\n\nYou are a campaign planning insight translator. Create "Insight Translation for Campaign Planning" for each of the 5 scenarios.\n\nInput Context:\n${inputSummary}\n\nTop 5 Scenarios:\n${scenarioSummaries}\n\nFor each scenario, provide:\n1. Key Consumer Tension (핵심 고객 긴장/불편)\n2. Emotional Trigger (감정 자극 포인트)\n3. Functional Trigger (기능적 효익 포인트)\n4. Campaign-worthy Theme (캠페인 주제화 가능 포인트)\n5. Big Idea Starters (빅 아이디어 초안) - provide 2-3\n6. Strategic Implication (실무 적용 시사점)\n\nReturn as valid JSON array with 5 objects, each having keys: rank, title, consumerTension, emotionalTrigger, functionalTrigger, campaignTheme, bigIdeas(array), strategicImplication.`
        },
        {
            id: "08",
            prompt: `${langInstruction}\n\nYou are a creative copywriter for a global electronics brand. Create "Message & Copy Development" for each of the 5 recommended scenarios.\n\nInput Context:\n${inputSummary}\n\nTop 5 Scenarios:\n${scenarioSummaries}\n\nFor each scenario, provide IN 4 TONE DIRECTIONS (Emotional, Practical, Tech-forward, Family-centered):\n1. Core Promise (핵심 약속)\n2. Consumer Benefit (고객 효익)\n3. Message Angle (메시지 방향)\n4. Tone Recommendation (톤 추천)\n5. Headline Options (헤드라인 옵션) - 3 options per tone\n6. Sub-copy Options (서브카피 옵션) - 2 per tone\n7. CTA Ideas (CTA 아이디어) - 2 per tone\n8. Avoid / Watch-outs (주의 표현)\n\nReturn as valid JSON array with 5 objects, each having keys: rank, title, tones(array of {tone, corePromise, consumerBenefit, messageAngle, toneRec, headlines(array), subcopy(array), ctas(array), watchouts}).`
        },
        {
            id: "09",
            prompt: `${langInstruction}\n\nYou are a creative director. Create "Creative Direction Starter" for each of the 5 recommended scenarios.\n\nInput Context:\n${inputSummary}\n\nTop 5 Scenarios:\n${scenarioSummaries}\n\nFor each scenario, provide:\n1. Human Situation Setup (상황 설정) - vivid one-liner\n2. Universal Tension Point (보편 공감 포인트)\n3. Local Nuance Opportunity (로컬 반영 포인트)\n4. Visual Mood Keywords (비주얼 무드 키워드) - 5-6 words\n5. Scene Possibilities (가능 장면) - 3 scenes\n6. Format Suggestions (추천 포맷) - e.g. short-form, banner, hero film\n7. Creative Hook (크리에이티브 훅) - one compelling hook line\n\nReturn as valid JSON array with 5 objects, each having keys: rank, title, situationSetup, universalTension, localNuance, visualMood(array), scenes(array), formats(array), creativeHook.`
        },
        {
            id: "10",
            prompt: `${langInstruction}\n\nYou are a creative research advisor. Create "Reference Directions" for each of the 5 recommended scenarios.\n\nInput Context:\n${inputSummary}\n\nTop 5 Scenarios:\n${scenarioSummaries}\n\nFor each scenario, provide:\n1. What to Search For (어떤 레퍼런스를 찾을지)\n2. Reference Mood (참고 무드)\n3. Story Pattern to Review (참고할 스토리 패턴)\n4. Visual Motifs to Explore (찾아볼 비주얼 모티프)\n5. Copy Style to Benchmark (비교할 카피 스타일)\n6. What to Avoid (피해야 할 cliche)\n\nReturn as valid JSON array with 5 objects, each having keys: rank, title, searchFor, referenceMood, storyPattern, visualMotifs, copyStyle, avoid.`
        },
        {
            id: "11",
            prompt: `${langInstruction}\n\nYou are a campaign concept developer. Create "Creative Concept Expansion" for each of the 5 recommended scenarios.\n\nInput Context:\n${inputSummary}\n\nTop 5 Scenarios:\n${scenarioSummaries}\n\nFor each scenario, provide 2-3 concept directions, each with:\n1. New Creative Territory (확장 가능한 새 컨셉 영역)\n2. Concept Variations (컨셉 변주안)\n3. Short-form Adaptation (숏폼형 확장)\n4. Hero Film Adaptation (영상형 확장)\n5. Social / Digital Adaptation (디지털형 확장)\n6. Retail / Demo Adaptation (리테일/데모형 확장)\n\nReturn as valid JSON array with 5 objects, each having keys: rank, title, concepts(array of {territory, variation, shortForm, heroFilm, socialDigital, retailDemo}).`
        },
        {
            id: "12",
            prompt: `${langInstruction}\n\nYou are a storyboard artist and narrative designer. Create "Storyline & Storyboard Seed" for each of the 5 recommended scenarios.\n\nInput Context:\n${inputSummary}\n\nTop 5 Scenarios:\n${scenarioSummaries}\n\nFor each scenario, provide:\n1. Story Hook (스토리 훅) - compelling opening\n2. Narrative Arc (서사 구조) - brief\n3. 4-cut storyboard with: cut number, scene description, key visual, dialogue/copy, emotion\n4. Brand Role in Story (브랜드 역할)\n5. Ending Message Direction (엔딩 메시지 방향)\n\nReturn as valid JSON array with 5 objects, each having keys: rank, title, storyHook, narrativeArc, cuts(array of {cut, scene, visual, copy, emotion}), brandRole, endingMessage.`
        }
    ];

    // 프롬프트 캐시 저장 (재시도용)
    apiSections.forEach(sec => { _coApiPrompts[sec.id] = sec.prompt; });

    // Launch all API calls in parallel
    const promises = apiSections.map(sec => _callApiSection(sec.id, sec.prompt));
    await Promise.allSettled(promises);

    // All done
    if (typeof updateOutputFlowTracker === "function") {
        updateOutputFlowTracker(3, { 1: "done", 2: "done", 3: "done" });
    }
}

async function _callApiSection(sectionId, prompt) {
    const body = document.getElementById(`co-body-${sectionId}`);
    if (!body) return;

    body.innerHTML = `<div class="co-loading co-loading--active"><span class="co-spinner"></span> ${(_coContext?.locale || "ko") === "ko" ? "AI가 분석 중입니다…" : "AI is analyzing..."}</div>`;

    try {
        const response = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                ..._coContext,
                campaignSection: true,     // 캠페인 섹션 전용 모드 플래그
                sectionPrompt: prompt,     // 섹션별 전용 프롬프트
                selectionSummary: null
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err?.error?.message || `HTTP ${response.status}`);
        }

        // Stream response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop();

            for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                try {
                    const event = JSON.parse(line.slice(6).trim());
                    if (event.type === "chunk") fullText += event.text;
                    else if (event.type === "done") break;
                    else if (event.type === "error") throw new Error(event.message);
                } catch (e) { if (e.message && !e.message.includes("JSON")) throw e; }
            }
        }

        // JSON 추출 (output-schema.js의 강화된 파서 사용)
        let jsonData = null;
        if (typeof extractJsonFromAIOutput === "function") {
            const extracted = extractJsonFromAIOutput(fullText);
            if (extracted.json !== null) {
                // 배열이 아닌 단일 객체인 경우 배열로 래핑
                jsonData = Array.isArray(extracted.json) ? extracted.json : [extracted.json];
            }
        } else {
            // fallback: 기존 regex 파싱
            try {
                const jsonMatch = fullText.match(/\[[\s\S]*\]/);
                if (jsonMatch) jsonData = JSON.parse(jsonMatch[0]);
            } catch { /* fallback to markdown */ }
        }

        // 필드 검증 + 자동 보정 (output-schema.js)
        if (jsonData && Array.isArray(jsonData) && typeof validateCampaignSectionData === "function") {
            const validation = validateCampaignSectionData(sectionId, jsonData);
            jsonData = validation.data;
            // 검증 경고가 있어도 렌더링은 진행 (콘솔에 로그 출력됨)
        }

        // 렌더링
        if (jsonData && Array.isArray(jsonData) && jsonData.length > 0) {
            _renderApiSectionJson(sectionId, jsonData);
        } else {
            _renderApiSectionMarkdown(sectionId, fullText);
        }

    } catch (err) {
        const isKo = (_coContext?.locale || "ko") === "ko";
        body.innerHTML = `<div class="co-error">
            <p>${isKo ? "이 섹션 생성 중 오류가 발생했습니다." : "An error occurred generating this section."}</p>
            <p class="co-error-detail">${_esc(err.message)}</p>
            <button type="button" class="co-retry-btn" onclick="_retrySection('${sectionId}')">
                ${isKo ? "재시도" : "Retry"}
            </button>
        </div>`;
    }
}

// ──────── API Section Renderers ────────

function _renderApiSectionJson(sectionId, data) {
    const renderers = {
        "05": _renderSec05_CampaignReadiness,
        "06": _renderSec06_FGD,
        "07": _renderSec07_InsightTranslation,
        "08": _renderSec08_MessageCopy,
        "09": _renderSec09_CreativeDirection,
        "10": _renderSec10_ReferenceDirections,
        "11": _renderSec11_ConceptExpansion,
        "12": _renderSec12_StoryboardSeed
    };
    const renderer = renderers[sectionId];
    if (renderer) renderer(data);
    else _renderApiSectionMarkdown(sectionId, JSON.stringify(data, null, 2));
}

function _renderApiSectionMarkdown(sectionId, text) {
    const body = document.getElementById(`co-body-${sectionId}`);
    if (!body) return;
    // 안전한 마크다운→HTML 변환: 먼저 마크다운 구조를 변환한 후, 텍스트 내용만 이스케이프
    const lines = String(text || "").split("\n");
    let html = "";
    let inList = false;
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            if (inList) { html += "</ul>"; inList = false; }
            html += "<br>";
            continue;
        }
        // 헤딩
        const h3 = trimmed.match(/^###\s+(.+)$/);
        if (h3) { if (inList) { html += "</ul>"; inList = false; } html += `<h4>${_esc(h3[1])}</h4>`; continue; }
        const h2 = trimmed.match(/^##\s+(.+)$/);
        if (h2) { if (inList) { html += "</ul>"; inList = false; } html += `<h3>${_esc(h2[1])}</h3>`; continue; }
        const h1 = trimmed.match(/^#\s+(.+)$/);
        if (h1) { if (inList) { html += "</ul>"; inList = false; } html += `<h2>${_esc(h1[1])}</h2>`; continue; }
        // 리스트
        const li = trimmed.match(/^[-*]\s+(.+)$/);
        if (li) {
            if (!inList) { html += "<ul>"; inList = true; }
            html += `<li>${_esc(li[1]).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</li>`;
            continue;
        }
        // 번호 리스트
        const oli = trimmed.match(/^\d+[.)\s]+(.+)$/);
        if (oli) {
            if (!inList) { html += "<ol>"; inList = true; }
            html += `<li>${_esc(oli[1]).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</li>`;
            continue;
        }
        // 일반 텍스트
        if (inList) { html += "</ul>"; inList = false; }
        html += `<p>${_esc(trimmed).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`;
    }
    if (inList) html += "</ul>";
    body.innerHTML = `<div class="co-markdown-body">${html}</div>`;
}

// Section 05: Campaign Readiness
function _renderSec05_CampaignReadiness(data) {
    const body = document.getElementById("co-body-05");
    if (!body) return;
    const isKo = (_coContext?.locale || "ko") === "ko";

    body.innerHTML = data.map(item => {
        const dims = [
            { label: isKo ? "FGD 검증 우선도" : "FGD Priority", val: item.fgdPriority, reason: item.fgdReason },
            { label: isKo ? "메시지 개발 적합도" : "Message Dev Fit", val: item.messageFit },
            { label: isKo ? "크리에이티브 확장 적합도" : "Creative Expansion Fit", val: item.creativeFit },
            { label: isKo ? "글로벌 공감 가능성" : "Global Resonance", val: item.globalResonance },
            { label: isKo ? "지역 특화성" : "Local Specificity", val: item.localSpecificity },
            { label: isKo ? "차별화 가능성" : "Differentiation", val: item.differentiation },
            { label: isKo ? "실행 복잡도" : "Execution Complexity", val: item.executionComplexity }
        ];
        return `
        <div class="co-readiness-card">
            <div class="co-readiness-header">
                <span class="co-scenario-rank co-scenario-rank--sm">${item.rank || ""}</span>
                <h4>${_esc(item.title || "")}</h4>
            </div>
            <div class="co-readiness-bars">
                ${dims.map(d => {
                    const lvl = String(d.val || "Medium").toLowerCase();
                    const cls = lvl.includes("high") || lvl.includes("strong") ? "high" : lvl.includes("low") ? "low" : "med";
                    return `<div class="co-bar-row">
                        <span class="co-bar-label">${d.label}</span>
                        <span class="co-bar-value co-bar-value--${cls}">${_esc(d.val || "")}</span>
                        ${d.reason ? `<span class="co-bar-reason">${_esc(d.reason)}</span>` : ""}
                    </div>`;
                }).join("")}
            </div>
            ${item.recommendation ? `<p class="co-readiness-rec">${_esc(item.recommendation)}</p>` : ""}
        </div>`;
    }).join("");
}

// Section 06: FGD Guide
function _renderSec06_FGD(data) {
    const body = document.getElementById("co-body-06");
    if (!body) return;
    const isKo = (_coContext?.locale || "ko") === "ko";

    // Tabbed interface
    const tabsHtml = data.map((item, i) => `<button type="button" class="co-tab-btn${i === 0 ? " active" : ""}" data-tab="fgd-${i}">#${item.rank || i + 1} ${_esc((item.title || "").substring(0, 20))}</button>`).join("");
    const panelsHtml = data.map((item, i) => `
        <div class="co-tab-panel${i === 0 ? " active" : ""}" data-panel="fgd-${i}">
            <div class="co-fgd-grid">
                <div class="co-fgd-item">
                    <h5>${isKo ? "검증 목적" : "Validation Objective"}</h5>
                    <p>${_esc(item.validationObjective || "")}</p>
                </div>
                <div class="co-fgd-item">
                    <h5>${isKo ? "예상 매력 포인트" : "Likely Appeal Points"}</h5>
                    <ul>${(item.appealPoints || []).map(p => `<li>${_esc(p)}</li>`).join("")}</ul>
                </div>
                <div class="co-fgd-item">
                    <h5>${isKo ? "예상 저항 포인트" : "Likely Resistance Points"}</h5>
                    <ul>${(item.resistancePoints || []).map(p => `<li>${_esc(p)}</li>`).join("")}</ul>
                </div>
                <div class="co-fgd-item">
                    <h5>${isKo ? "우선 검증 페르소나" : "Best-fit Personas"}</h5>
                    ${(item.personas || []).map(p => `<div class="co-persona-chip"><strong>${_esc(p.name || "")}</strong><span>${_esc(p.description || "")}</span></div>`).join("")}
                </div>
                <div class="co-fgd-item co-fgd-item--wide">
                    <h5>${isKo ? "권장 FGD 질문" : "Suggested FGD Questions"}</h5>
                    <ol>${(item.fgdQuestions || []).map(q => `<li>${_esc(q)}</li>`).join("")}</ol>
                </div>
                <div class="co-fgd-item">
                    <h5>${isKo ? "의사결정 판단 포인트" : "Decision Signals"}</h5>
                    <ul>${(item.decisionSignals || []).map(s => `<li>${_esc(s)}</li>`).join("")}</ul>
                </div>
            </div>
        </div>
    `).join("");

    body.innerHTML = `<div class="co-tabs"><div class="co-tab-bar">${tabsHtml}</div>${panelsHtml}</div>`;
    _initTabs(body);
}

// Section 07: Insight Translation
function _renderSec07_InsightTranslation(data) {
    const body = document.getElementById("co-body-07");
    if (!body) return;
    const isKo = (_coContext?.locale || "ko") === "ko";

    body.innerHTML = data.map(item => `
        <div class="co-insight-card">
            <div class="co-insight-header">
                <span class="co-scenario-rank co-scenario-rank--sm">${item.rank || ""}</span>
                <h4>${_esc(item.title || "")}</h4>
            </div>
            <div class="co-insight-grid">
                <div class="co-insight-item">
                    <span class="co-insight-label">${isKo ? "핵심 고객 긴장" : "Consumer Tension"}</span>
                    <p>${_esc(item.consumerTension || "")}</p>
                </div>
                <div class="co-insight-item">
                    <span class="co-insight-label">${isKo ? "감정 자극 포인트" : "Emotional Trigger"}</span>
                    <p>${_esc(item.emotionalTrigger || "")}</p>
                </div>
                <div class="co-insight-item">
                    <span class="co-insight-label">${isKo ? "기능적 효익" : "Functional Trigger"}</span>
                    <p>${_esc(item.functionalTrigger || "")}</p>
                </div>
                <div class="co-insight-item">
                    <span class="co-insight-label">${isKo ? "캠페인 주제" : "Campaign Theme"}</span>
                    <p><strong>${_esc(item.campaignTheme || "")}</strong></p>
                </div>
                <div class="co-insight-item co-insight-item--wide">
                    <span class="co-insight-label">${isKo ? "빅 아이디어 초안" : "Big Idea Starters"}</span>
                    <ul>${(item.bigIdeas || []).map(idea => `<li>${_esc(idea)}</li>`).join("")}</ul>
                </div>
                <div class="co-insight-item co-insight-item--wide">
                    <span class="co-insight-label">${isKo ? "실무 적용 시사점" : "Strategic Implication"}</span>
                    <p>${_esc(item.strategicImplication || "")}</p>
                </div>
            </div>
        </div>
    `).join("");
}

// Section 08: Message & Copy
function _renderSec08_MessageCopy(data) {
    const body = document.getElementById("co-body-08");
    if (!body) return;
    const isKo = (_coContext?.locale || "ko") === "ko";

    body.innerHTML = data.map((item, idx) => {
        const tones = item.tones || [];
        const tabsHtml = tones.map((t, i) => `<button type="button" class="co-tab-btn co-tab-btn--sm${i === 0 ? " active" : ""}" data-tab="msg-${idx}-${i}">${_esc(t.tone || "")}</button>`).join("");
        const panelsHtml = tones.map((t, i) => `
            <div class="co-tab-panel${i === 0 ? " active" : ""}" data-panel="msg-${idx}-${i}">
                <div class="co-msg-grid">
                    <div class="co-msg-item"><span class="co-msg-label">${isKo ? "핵심 약속" : "Core Promise"}</span><p>${_esc(t.corePromise || "")}</p></div>
                    <div class="co-msg-item"><span class="co-msg-label">${isKo ? "고객 효익" : "Consumer Benefit"}</span><p>${_esc(t.consumerBenefit || "")}</p></div>
                    <div class="co-msg-item"><span class="co-msg-label">${isKo ? "메시지 방향" : "Message Angle"}</span><p>${_esc(t.messageAngle || "")}</p></div>
                    <div class="co-msg-item"><span class="co-msg-label">${isKo ? "톤" : "Tone"}</span><p>${_esc(t.toneRec || "")}</p></div>
                    <div class="co-msg-item co-msg-item--wide">
                        <span class="co-msg-label">${isKo ? "헤드라인 옵션" : "Headlines"}</span>
                        <ul class="co-headline-list">${(t.headlines || []).map(h => `<li class="co-headline">${_esc(h)}</li>`).join("")}</ul>
                    </div>
                    <div class="co-msg-item">
                        <span class="co-msg-label">${isKo ? "서브카피" : "Sub-copy"}</span>
                        <ul>${(t.subcopy || []).map(s => `<li>${_esc(s)}</li>`).join("")}</ul>
                    </div>
                    <div class="co-msg-item">
                        <span class="co-msg-label">CTA</span>
                        <ul>${(t.ctas || []).map(c => `<li>${_esc(c)}</li>`).join("")}</ul>
                    </div>
                    ${t.watchouts ? `<div class="co-msg-item co-msg-item--wide"><span class="co-msg-label">${isKo ? "주의" : "Watch-outs"}</span><p class="co-watchout">${_esc(t.watchouts)}</p></div>` : ""}
                </div>
            </div>
        `).join("");

        return `
        <div class="co-msg-card">
            <div class="co-msg-header">
                <span class="co-scenario-rank co-scenario-rank--sm">${item.rank || idx + 1}</span>
                <h4>${_esc(item.title || "")}</h4>
            </div>
            <div class="co-tabs"><div class="co-tab-bar">${tabsHtml}</div>${panelsHtml}</div>
        </div>`;
    }).join("");

    body.querySelectorAll(".co-tabs").forEach(tabGroup => _initTabs(tabGroup));
}

// Section 09: Creative Direction
function _renderSec09_CreativeDirection(data) {
    const body = document.getElementById("co-body-09");
    if (!body) return;
    const isKo = (_coContext?.locale || "ko") === "ko";

    body.innerHTML = data.map(item => `
        <div class="co-creative-card">
            <div class="co-creative-header">
                <span class="co-scenario-rank co-scenario-rank--sm">${item.rank || ""}</span>
                <h4>${_esc(item.title || "")}</h4>
            </div>
            <div class="co-creative-body">
                <div class="co-creative-item">
                    <span class="co-creative-label">${isKo ? "상황 설정" : "Situation Setup"}</span>
                    <p class="co-creative-highlight">${_esc(item.situationSetup || "")}</p>
                </div>
                <div class="co-creative-item">
                    <span class="co-creative-label">${isKo ? "보편 공감 포인트" : "Universal Tension"}</span>
                    <p>${_esc(item.universalTension || "")}</p>
                </div>
                <div class="co-creative-item">
                    <span class="co-creative-label">${isKo ? "로컬 반영 포인트" : "Local Nuance"}</span>
                    <p>${_esc(item.localNuance || "")}</p>
                </div>
                <div class="co-creative-item">
                    <span class="co-creative-label">${isKo ? "비주얼 무드 키워드" : "Visual Mood"}</span>
                    <div class="co-chip-row">${(item.visualMood || []).map(m => _chip(m)).join("")}</div>
                </div>
                <div class="co-creative-item">
                    <span class="co-creative-label">${isKo ? "가능 장면" : "Scene Possibilities"}</span>
                    <ul>${(item.scenes || []).map(s => `<li>${_esc(s)}</li>`).join("")}</ul>
                </div>
                <div class="co-creative-item">
                    <span class="co-creative-label">${isKo ? "추천 포맷" : "Format Suggestions"}</span>
                    <div class="co-chip-row">${(item.formats || []).map(f => _chip(f)).join("")}</div>
                </div>
                <div class="co-creative-hook">
                    <span>${isKo ? "크리에이티브 훅" : "Creative Hook"}</span>
                    <p>"${_esc(item.creativeHook || "")}"</p>
                </div>
            </div>
        </div>
    `).join("");
}

// Section 10: Reference Directions
function _renderSec10_ReferenceDirections(data) {
    const body = document.getElementById("co-body-10");
    if (!body) return;
    const isKo = (_coContext?.locale || "ko") === "ko";

    body.innerHTML = data.map(item => `
        <div class="co-ref-card">
            <div class="co-ref-header">
                <span class="co-scenario-rank co-scenario-rank--sm">${item.rank || ""}</span>
                <h4>${_esc(item.title || "")}</h4>
            </div>
            <div class="co-ref-grid">
                <div class="co-ref-item"><span class="co-ref-label">${isKo ? "찾을 레퍼런스" : "What to Search"}</span><p>${_esc(item.searchFor || "")}</p></div>
                <div class="co-ref-item"><span class="co-ref-label">${isKo ? "참고 무드" : "Reference Mood"}</span><p>${_esc(item.referenceMood || "")}</p></div>
                <div class="co-ref-item"><span class="co-ref-label">${isKo ? "스토리 패턴" : "Story Pattern"}</span><p>${_esc(item.storyPattern || "")}</p></div>
                <div class="co-ref-item"><span class="co-ref-label">${isKo ? "비주얼 모티프" : "Visual Motifs"}</span><p>${_esc(item.visualMotifs || "")}</p></div>
                <div class="co-ref-item"><span class="co-ref-label">${isKo ? "카피 스타일" : "Copy Style"}</span><p>${_esc(item.copyStyle || "")}</p></div>
                <div class="co-ref-item co-ref-item--avoid"><span class="co-ref-label">${isKo ? "피해야 할 것" : "Avoid"}</span><p>${_esc(item.avoid || "")}</p></div>
            </div>
        </div>
    `).join("");
}

// Section 11: Concept Expansion
function _renderSec11_ConceptExpansion(data) {
    const body = document.getElementById("co-body-11");
    if (!body) return;
    const isKo = (_coContext?.locale || "ko") === "ko";

    body.innerHTML = data.map(item => {
        const concepts = item.concepts || [];
        return `
        <div class="co-concept-card">
            <div class="co-concept-header">
                <span class="co-scenario-rank co-scenario-rank--sm">${item.rank || ""}</span>
                <h4>${_esc(item.title || "")}</h4>
            </div>
            <div class="co-concept-list">
                ${concepts.map((c, ci) => `
                <div class="co-concept-item">
                    <h5>${isKo ? "컨셉 방향" : "Concept"} ${ci + 1}: ${_esc(c.territory || "")}</h5>
                    <div class="co-concept-grid">
                        <div><span class="co-concept-label">${isKo ? "변주안" : "Variation"}</span><p>${_esc(c.variation || "")}</p></div>
                        <div><span class="co-concept-label">${isKo ? "숏폼" : "Short-form"}</span><p>${_esc(c.shortForm || "")}</p></div>
                        <div><span class="co-concept-label">${isKo ? "영상형" : "Hero Film"}</span><p>${_esc(c.heroFilm || "")}</p></div>
                        <div><span class="co-concept-label">${isKo ? "디지털" : "Social/Digital"}</span><p>${_esc(c.socialDigital || "")}</p></div>
                        <div><span class="co-concept-label">${isKo ? "리테일/데모" : "Retail/Demo"}</span><p>${_esc(c.retailDemo || "")}</p></div>
                    </div>
                </div>`).join("")}
            </div>
        </div>`;
    }).join("");
}

// Section 12: Storyboard Seed
function _renderSec12_StoryboardSeed(data) {
    const body = document.getElementById("co-body-12");
    if (!body) return;
    const isKo = (_coContext?.locale || "ko") === "ko";

    body.innerHTML = data.map(item => {
        const cuts = item.cuts || [];
        return `
        <div class="co-story-card">
            <div class="co-story-header">
                <span class="co-scenario-rank co-scenario-rank--sm">${item.rank || ""}</span>
                <h4>${_esc(item.title || "")}</h4>
            </div>
            <div class="co-story-meta">
                <div><strong>${isKo ? "스토리 훅" : "Story Hook"}</strong><p>${_esc(item.storyHook || "")}</p></div>
                <div><strong>${isKo ? "서사 구조" : "Narrative Arc"}</strong><p>${_esc(item.narrativeArc || "")}</p></div>
            </div>
            <div class="co-storyboard-strip">
                ${cuts.map(cut => `
                <div class="co-cut-card">
                    <div class="co-cut-num">${isKo ? "컷" : "Cut"} ${cut.cut || ""}</div>
                    <div class="co-cut-visual">${_esc(cut.visual || "")}</div>
                    <div class="co-cut-scene">${_esc(cut.scene || "")}</div>
                    <div class="co-cut-copy">"${_esc(cut.copy || "")}"</div>
                    <div class="co-cut-emotion">${_esc(cut.emotion || "")}</div>
                </div>`).join("")}
            </div>
            <div class="co-story-footer">
                <div><strong>${isKo ? "브랜드 역할" : "Brand Role"}</strong><p>${_esc(item.brandRole || "")}</p></div>
                <div><strong>${isKo ? "엔딩 메시지" : "Ending Message"}</strong><p>${_esc(item.endingMessage || "")}</p></div>
            </div>
        </div>`;
    }).join("");
}

// ──────── Tabs Utility ────────
function _initTabs(container) {
    container.querySelectorAll(".co-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const tabId = btn.dataset.tab;
            const parent = btn.closest(".co-tabs");
            parent.querySelectorAll(".co-tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tabId));
            parent.querySelectorAll(".co-tab-panel").forEach(p => p.classList.toggle("active", p.dataset.panel === tabId));
        });
    });
}

// ──────── Retry ────────
function _retrySection(sectionId) {
    // 캐시된 프롬프트로 해당 섹션만 단건 재시도
    const cachedPrompt = _coApiPrompts[sectionId];
    if (!cachedPrompt) {
        console.warn(`No cached prompt for section ${sectionId}, re-launching all.`);
        _launchApiSections();
        return;
    }
    _callApiSection(sectionId, cachedPrompt);
}

// ──────── Export ────────
function _exportCampaignBrief() {
    const isKo = (_coContext?.locale || "ko") === "ko";
    const sections = [];

    // 구조화된 텍스트 생성
    sections.push(`${'='.repeat(60)}`);
    sections.push(isKo ? "캠페인 활용 분석 보고서" : "Campaign Activation Report");
    sections.push(`${isKo ? '생성일' : 'Generated'}: ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`);
    sections.push(`${'='.repeat(60)}\n`);

    // 섹션 01-04: 로컬 데이터 기반
    sections.push(`[01] ${isKo ? '입력 조건 요약' : 'Input Summary'}`);
    sections.push(`${isKo ? '국가' : 'Country'}: ${_coContext?.country || '-'} / ${_coContext?.city || '-'}`);
    sections.push(`${isKo ? '세그먼트' : 'Segment'}: ${_coContext?.segment || '-'}`);
    sections.push(`${isKo ? '기기' : 'Devices'}: ${(_coContext?.devices || []).join(', ') || '-'}`);
    sections.push(`${isKo ? '가치 방향' : 'Value'}: ${_coContext?.missionBucket || '-'}\n`);

    sections.push(`[02] ${isKo ? '추천 시나리오 TOP 5' : 'Top 5 Recommended Scenarios'}`);
    _coResults.forEach((sc, i) => {
        const f = _formatResult(sc);
        sections.push(`  ${i + 1}. ${f.title} (${f.score}${isKo ? '점' : 'pt'}) — ${(f.matchedTags || []).join(', ')}`);
    });
    sections.push('');

    // 섹션 05-12: API 생성 결과 (innerText 추출, 단 섹션별 분리)
    const apiSecLabels = {
        '05': isKo ? '캠페인 활용 우선순위 진단' : 'Campaign Readiness',
        '06': isKo ? 'AI FGD 가이드' : 'FGD Guide',
        '07': isKo ? '인사이트 전환' : 'Insight Translation',
        '08': isKo ? '메시지 및 카피' : 'Message & Copy',
        '09': isKo ? '크리에이티브 방향' : 'Creative Direction',
        '10': isKo ? '레퍼런스 방향' : 'Reference Directions',
        '11': isKo ? '컨셉 확장' : 'Concept Expansion',
        '12': isKo ? '스토리보드 초안' : 'Storyboard Seed'
    };
    Object.entries(apiSecLabels).forEach(([secId, label]) => {
        const bodyEl = document.getElementById(`co-body-${secId}`);
        if (bodyEl) {
            sections.push(`[${secId}] ${label}`);
            sections.push(bodyEl.innerText.trim());
            sections.push('');
        }
    });

    const content = sections.join('\n');
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign-report-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}
