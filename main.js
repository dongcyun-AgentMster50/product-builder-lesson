
const ACCESS_API = {
    verifyEndpoint: "/api/access/verify",
    sessionEndpoint: "/api/access/session",
    logoutEndpoint: "/api/access/logout"
};
const REGION_INSIGHT_API = "/api/region-insight";
const REGION_INSIGHT_CLIENT_TIMEOUT_MS = 60000;
const ACCESS_CLIENT_SESSION_KEY = "scenario-access-client-session-id";

const resultDiv = document.getElementById("result");
const accessScreen = document.getElementById("access-screen");
const guideScreen = document.getElementById("guide-screen");
const wizardScreen = document.getElementById("wizard-screen");
const accessCodeInput = document.getElementById("access-code");
const accessStatus = document.getElementById("access-status");
const accessToggleBtn = document.getElementById("access-toggle-btn");
const unlockBtn = document.getElementById("unlock-btn");
const logoutBtn = document.getElementById("logout-btn");
const guideYesBtn = document.getElementById("guide-yes-btn");
const guideNoBtn = document.getElementById("guide-no-btn");
const guideContinueBtn = document.getElementById("guide-continue-btn");
const guideCopy = document.getElementById("guide-copy");
const roleSelect = document.getElementById("role");
const roleBrief = document.getElementById("role-brief");
const roleSelectionContainer = document.getElementById("role-selection");
const roleCards = [...document.querySelectorAll(".role-card")];
const purposeInput = document.getElementById("purpose");
const countrySelect = document.getElementById("country");
/* ── Searchable city dropdown elements ── */
const citySearchWrap = document.getElementById("city-search-wrap");
const citySearchInput = document.getElementById("city-search-input");
const cityHiddenInput = document.getElementById("city-value");
const cityDropdown = document.getElementById("city-dropdown");
const citySearchIcon = document.getElementById("city-search-icon");
/* Legacy aliases — kept so downstream code that reads citySelect.value / cityCustomInput still compiles */
const citySelect = { get value() { return cityHiddenInput.value; }, set value(v) { cityHiddenInput.value = v; }, options: [] };
const cityCustomInput = { get value() { return citySearchInput.value; }, set value(v) { citySearchInput.value = v; }, disabled: false, focus() { citySearchInput.focus(); }, blur() { citySearchInput.blur(); } };
const cityCustomRow = null;
const cityCustomConfirmBtn = null;
const personaGroups = document.getElementById("persona-groups");
const segmentCustomInput = document.getElementById("segment-custom");
const deviceGrid = document.getElementById("device-grid");
const deviceCustomInput = document.getElementById("device-custom");
const q4Presets = document.getElementById("q4-presets");
const q4AllChips = document.getElementById("q4-all-chips");
const q4Summary = document.getElementById("q4-summary");
const exportActions = document.getElementById("export-actions");
const wizardLogoutBtn = document.getElementById("wizard-logout-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const generateBtn = document.getElementById("generate-btn");
const stepInsight = document.getElementById("step-insight");
const aiProviderScreen = document.getElementById("ai-provider-screen");
const CITY_CUSTOM_VALUE = "__custom__";

/* ── 한국 도시 마스터 데이터 (행정안전부 2024.04 주민등록인구) ── */
const KR_CITY_MASTER = {
    "특별시·광역시·특별자치시": [
        { en: "Seoul", ko: "서울특별시", pop: 9411453 },
        { en: "Busan", ko: "부산광역시", pop: 3350000 },
        { en: "Incheon", ko: "인천광역시", pop: 2960000 },
        { en: "Daegu", ko: "대구광역시", pop: 2380000 },
        { en: "Daejeon", ko: "대전광역시", pop: 1450000 },
        { en: "Gwangju Metro", ko: "광주광역시", pop: 1430000 },
        { en: "Ulsan", ko: "울산광역시", pop: 1100000 },
        { en: "Sejong", ko: "세종특별자치시", pop: 380000 }
    ],
    "경기도": [
        { en: "Suwon", ko: "수원시", pop: 1223598 },
        { en: "Yongin", ko: "용인시", pop: 1077883 },
        { en: "Goyang", ko: "고양시", pop: 1072217 },
        { en: "Hwaseong", ko: "화성시", pop: 948934 },
        { en: "Seongnam", ko: "성남시", pop: 918122 },
        { en: "Bucheon", ko: "부천시", pop: 785394 },
        { en: "Namyangju", ko: "남양주시", pop: 733392 },
        { en: "Ansan", ko: "안산시", pop: 627279 },
        { en: "Pyeongtaek", ko: "평택시", pop: 592946 },
        { en: "Anyang", ko: "안양시", pop: 545082 },
        { en: "Siheung", ko: "시흥시", pop: 519956 },
        { en: "Paju", ko: "파주시", pop: 504136 },
        { en: "Gimpo", ko: "김포시", pop: 486952 },
        { en: "Uijeongbu", ko: "의정부시", pop: 463059 },
        { en: "Gwangju-si", ko: "광주시(경기)", pop: 393243 },
        { en: "Hanam", ko: "하남시", pop: 331316 },
        { en: "Gwangmyeong", ko: "광명시", pop: 283235 },
        { en: "Yangju", ko: "양주시", pop: 280303 },
        { en: "Gunpo", ko: "군포시", pop: 263164 },
        { en: "Osan", ko: "오산시", pop: 239715 },
        { en: "Icheon", ko: "이천시", pop: 222963 },
        { en: "Anseong", ko: "안성시", pop: 190563 },
        { en: "Guri", ko: "구리시", pop: 187709 },
        { en: "Uiwang", ko: "의왕시", pop: 159384 },
        { en: "Pocheon", ko: "포천시", pop: 146559 },
        { en: "Yeoju", ko: "여주시", pop: 114646 },
        { en: "Dongducheon", ko: "동두천시", pop: 88605 },
        { en: "Gwacheon", ko: "과천시", pop: 78561 }
    ],
    "강원도": [
        { en: "Wonju", ko: "원주시", pop: 362074 },
        { en: "Chuncheon", ko: "춘천시", pop: 286812 },
        { en: "Gangneung", ko: "강릉시", pop: 210037 },
        { en: "Donghae", ko: "동해시", pop: 88574 },
        { en: "Sokcho", ko: "속초시", pop: 82311 },
        { en: "Samcheok", ko: "삼척시", pop: 62607 },
        { en: "Taebaek", ko: "태백시", pop: 38710 }
    ],
    "충청북도": [
        { en: "Cheongju", ko: "청주시", pop: 849531 },
        { en: "Chungju", ko: "충주시", pop: 208454 },
        { en: "Jecheon", ko: "제천시", pop: 130937 }
    ],
    "충청남도": [
        { en: "Cheonan", ko: "천안시", pop: 659471 },
        { en: "Asan", ko: "아산시", pop: 385827 },
        { en: "Seosan", ko: "서산시", pop: 177690 },
        { en: "Dangjin", ko: "당진시", pop: 171159 },
        { en: "Nonsan", ko: "논산시", pop: 110653 },
        { en: "Gongju", ko: "공주시", pop: 101617 },
        { en: "Boryeong", ko: "보령시", pop: 95903 },
        { en: "Gyeryong", ko: "계룡시", pop: 47065 }
    ],
    "전라북도": [
        { en: "Jeonju", ko: "전주시", pop: 644146 },
        { en: "Iksan", ko: "익산시", pop: 270129 },
        { en: "Gunsan", ko: "군산시", pop: 260865 },
        { en: "Jeongeup", ko: "정읍시", pop: 103048 },
        { en: "Gimje", ko: "김제시", pop: 80729 },
        { en: "Namwon", ko: "남원시", pop: 76462 }
    ],
    "전라남도": [
        { en: "Suncheon", ko: "순천시", pop: 278085 },
        { en: "Yeosu", ko: "여수시", pop: 271061 },
        { en: "Mokpo", ko: "목포시", pop: 211878 },
        { en: "Gwangyang", ko: "광양시", pop: 152001 },
        { en: "Naju", ko: "나주시", pop: 114142 }
    ],
    "경상북도": [
        { en: "Pohang", ko: "포항시", pop: 492021 },
        { en: "Gumi", ko: "구미시", pop: 406260 },
        { en: "Gyeongsan", ko: "경산시", pop: 267823 },
        { en: "Gyeongju", ko: "경주시", pop: 246144 },
        { en: "Andong", ko: "안동시", pop: 153605 },
        { en: "Gimcheon", ko: "김천시", pop: 137210 },
        { en: "Yeongcheon", ko: "영천시", pop: 100248 },
        { en: "Yeongju", ko: "영주시", pop: 100051 },
        { en: "Sangju", ko: "상주시", pop: 93607 },
        { en: "Mungyeong", ko: "문경시", pop: 68914 }
    ],
    "경상남도": [
        { en: "Changwon", ko: "창원시", pop: 1006692 },
        { en: "Gimhae", ko: "김해시", pop: 531911 },
        { en: "Yangsan", ko: "양산시", pop: 355519 },
        { en: "Jinju", ko: "진주시", pop: 340736 },
        { en: "Geoje", ko: "거제시", pop: 234310 },
        { en: "Tongyeong", ko: "통영시", pop: 120419 },
        { en: "Sacheon", ko: "사천시", pop: 109692 },
        { en: "Miryang", ko: "밀양시", pop: 102689 }
    ],
    "제주특별자치도": [
        { en: "Jeju", ko: "제주시", pop: 493178 },
        { en: "Seogwipo", ko: "서귀포시", pop: 184818 }
    ]
};

function getKrCityMasterFlat() {
    const result = [];
    for (const [region, cities] of Object.entries(KR_CITY_MASTER)) {
        cities.forEach((c) => result.push({ ...c, region }));
    }
    return result;
}
const LOCAL_BYPASS_ACCESS_CODE = "demo-access";

let factPack = [];
let exploreMatrix = {};
let sourceData = {};
let countryTrends = {};
let citySignals = {};
let dotcomMapping = { markets: [] };
let verbalGuideline = null;
let serviceSupportMatrix = { markets: [] };
let skuAvailabilityMatrix = { markets: [] };
let productFeatureMatrix = { products: [] };
let latestPayload = null;
let latestStructuredOutput = null;  // 공통 JSON 스키마 기반 구조화 output
let activeLensTab = "overview";
let currentStep = 1;
let currentLocale = "en";
let aiOutputText = "";
let aiGenerating = false;
let aiScenarioContext = null;
let marketOptions = [];
let isUnlocking = false;
let isAccessCodeVisible = false;
let isAccessLocked = false;
let accessLockoutEndsAt = 0;
let accessLockoutTimerId = null;
let accessClientSessionId = "";
let latestStep2InsightRequest = 0;
let bypassSessionReady = false;
let bypassSessionPromise = null;
let selectedProvider = sessionStorage.getItem("aiProvider") || "openai";
let userOverrideLocale = null;

const SUPPORTED_UI_LOCALES = ["ko", "en", "de", "fr", "es", "pt", "it", "nl", "ar"];
// ══════════════════════════════════════════════════════════════════
// Q3 Locale-Aware Product Catalog System
// - dotcom mapping 전체를 source of truth로 사용
// - 새 국가 추가 시 코드 수정 없이 자동 대응
// ══════════════════════════════════════════════════════════════════

// ── siteCode → region 매핑 (국가별 카탈로그 해상도) ──
const SITE_REGION_MAP = {
    // East Asia
    SEC: "KR", KR: "KR", JP: "JP",
    CN: "CN", HK: "CN", HK_EN: "CN", TW: "CN",
    // Americas
    US: "US", CA: "US", CA_FR: "US",
    MX: "LATAM", BR: "LATAM", AR: "LATAM", CO: "LATAM", CL: "LATAM", PE: "LATAM",
    // UK / Ireland
    UK: "UK", IE: "UK",
    // Europe
    DE: "EU", FR: "EU", IT: "EU", ES: "EU", PT: "EU", NL: "EU",
    SE: "EU", NO: "EU", DK: "EU", FI: "EU", BE: "EU", BE_FR: "EU",
    CH: "EU", CH_FR: "EU", AT: "EU", LU: "EU",
    PL: "EU", CZ: "EU", HU: "EU", RO: "EU", BG: "EU", HR: "EU",
    SK: "EU", SI: "EU", EE: "EU", LV: "EU", LT: "EU", GR: "EU",
    // Turkey
    TR: "ME",
    // India / South Asia
    IN: "IN", PK: "IN", BD: "IN", LK: "IN",
    // Southeast Asia
    SG: "SEA", MY: "SEA", TH: "SEA", VN: "SEA", PH: "SEA", ID: "SEA", MM: "SEA",
    // Oceania
    AU: "OCE", NZ: "OCE",
    // Middle East / Africa
    AE: "ME", SA: "ME", EG: "ME", IL: "ME", ZA: "ME", NG: "ME", KE: "ME",
    JO: "ME", KW: "ME", QA: "ME", BH: "ME", OM: "ME", LB: "ME",
    MA: "ME", TN: "ME", DZ: "ME", GH: "ME",
    // CIS
    RU: "CIS", UA: "CIS", KZ: "CIS", UZ: "CIS"
};

// ── 로케일별 제품 카탈로그 ──
// 구조: { samsung: [...groups], partner: [...groups], styles: { cardId: {s:[],p:[]} } }
// s = samsungIds, p = partnerIds
const LOCALE_CATALOGS = {
    // ── Global Default (모든 미정의 로케일의 fallback) ──
    _default: {
        samsung: [
            { label: "모바일", labelEn: "Mobile", ids: ["galaxy-phone", "galaxy-tab"] },
            { label: "웨어러블", labelEn: "Wearable", ids: ["galaxy-watch", "galaxy-buds"] },
            { label: "TV/오디오", labelEn: "TV / Audio", ids: ["tv-premium", "soundbar", "speaker"] },
            { label: "주방", labelEn: "Kitchen", ids: ["refrigerator", "dishwasher", "oven", "microwave"] },
            { label: "리빙", labelEn: "Living", ids: ["washer", "dryer", "air-conditioner", "air-purifier", "robot-vacuum"] },
            { label: "스마트홈", labelEn: "Smart Home", ids: ["hub"] }
        ],
        partner: [
            { label: "제어", labelEn: "Control", ids: ["smart-plug", "smart-switch", "lighting"] },
            { label: "보안/감지", labelEn: "Security", ids: ["camera", "door-lock", "activity-sensor"] },
            { label: "웰니스", labelEn: "Wellness", ids: ["body-scale", "partner-humidifier"] }
        ],
        styles: {
            baseline: { s: ["tv-premium", "refrigerator", "washer", "air-conditioner"], p: [] },
            energy:   { s: ["refrigerator", "washer", "air-conditioner", "air-purifier"], p: ["smart-plug", "activity-sensor", "smart-switch"] },
            care:     { s: ["robot-vacuum", "tv-premium", "refrigerator", "galaxy-watch"], p: ["camera", "activity-sensor"] },
            mood:     { s: ["tv-premium", "speaker", "soundbar", "air-purifier"], p: ["lighting", "smart-switch"] },
            security: { s: ["robot-vacuum", "tv-premium", "hub", "galaxy-phone"], p: ["camera", "door-lock", "activity-sensor"] },
            chores:   { s: ["robot-vacuum", "washer", "dryer", "dishwasher", "refrigerator"], p: [] },
            comfort:  { s: ["air-purifier", "air-conditioner"], p: ["partner-humidifier", "activity-sensor", "smart-switch"] },
            wellness: { s: ["galaxy-watch", "air-purifier", "air-conditioner", "tv-premium"], p: ["body-scale", "partner-humidifier"] }
        }
    },

    // ── KR (한국 삼성닷컴 sec) ──
    KR: {
        samsung: [
            { label: "모바일", labelEn: "Mobile", ids: ["galaxy-phone", "galaxy-tab", "galaxy-book"] },
            { label: "웨어러블", labelEn: "Wearable", ids: ["galaxy-watch", "galaxy-buds"] },
            { label: "TV/영상/음향", labelEn: "TV / Video / Audio", ids: ["tv-premium", "projector", "moving-style", "speaker", "soundbar", "harman-audio"] },
            { label: "주방가전", labelEn: "Kitchen", ids: ["refrigerator", "kimchi-fridge", "dishwasher", "cooktop", "oven", "microwave", "water-purifier", "hood"] },
            { label: "리빙가전", labelEn: "Living", ids: ["washer", "dryer", "airdresser", "air-conditioner", "system-aircon", "air-purifier", "robot-vacuum"] },
            { label: "IT/주변기기", labelEn: "IT / Peripherals", ids: ["monitor", "printer", "memory-storage"] },
            { label: "스마트홈 보조", labelEn: "Smart Home", ids: ["hub", "smartthings-product", "accessories"] }
        ],
        partner: [
            { label: "제어", labelEn: "Control", ids: ["smart-plug", "smart-switch", "lighting"] },
            { label: "보안/감지", labelEn: "Security / Sensing", ids: ["camera", "door-lock", "activity-sensor"] },
            { label: "웰니스/생활", labelEn: "Wellness / Living", ids: ["partner-sleep", "body-scale", "partner-humidifier"] }
        ],
        styles: {
            baseline: { s: ["tv-premium", "refrigerator", "washer", "air-conditioner"], p: [] },
            energy:   { s: ["refrigerator", "washer", "air-conditioner", "air-purifier"], p: ["smart-plug", "activity-sensor", "smart-switch"] },
            care:     { s: ["robot-vacuum", "tv-premium", "refrigerator", "galaxy-watch"], p: ["camera", "activity-sensor"] },
            mood:     { s: ["tv-premium", "speaker", "projector", "air-purifier"], p: ["lighting", "smart-switch"] },
            security: { s: ["robot-vacuum", "tv-premium", "hub", "galaxy-phone"], p: ["camera", "door-lock", "activity-sensor"] },
            chores:   { s: ["robot-vacuum", "washer", "dryer", "dishwasher", "refrigerator", "airdresser"], p: [] },
            comfort:  { s: ["air-purifier", "air-conditioner", "system-aircon"], p: ["partner-humidifier", "activity-sensor", "smart-switch"] },
            wellness: { s: ["galaxy-watch", "air-purifier", "air-conditioner", "tv-premium"], p: ["body-scale", "partner-sleep", "partner-humidifier"] }
        }
    },

    // ── US (미국 삼성닷컴) ──
    US: {
        samsung: [
            { label: "Mobile", labelEn: "Mobile", ids: ["galaxy-phone", "galaxy-tab", "galaxy-book"] },
            { label: "Wearable", labelEn: "Wearable", ids: ["galaxy-watch", "galaxy-buds"] },
            { label: "TV / Audio", labelEn: "TV / Audio", ids: ["tv-premium", "projector", "soundbar", "speaker"] },
            { label: "Kitchen", labelEn: "Kitchen", ids: ["refrigerator", "dishwasher", "oven", "microwave", "cooktop"] },
            { label: "Laundry & Living", labelEn: "Laundry & Living", ids: ["washer", "dryer", "air-purifier", "robot-vacuum"] },
            { label: "Computing", labelEn: "Computing", ids: ["monitor", "galaxy-book"] },
            { label: "Smart Home", labelEn: "Smart Home", ids: ["hub", "smartthings-product"] }
        ],
        partner: [
            { label: "Control", labelEn: "Control", ids: ["smart-plug", "smart-switch", "lighting"] },
            { label: "Security", labelEn: "Security", ids: ["camera", "door-lock", "activity-sensor"] },
            { label: "Wellness", labelEn: "Wellness", ids: ["body-scale", "partner-humidifier"] }
        ],
        styles: {
            baseline: { s: ["tv-premium", "refrigerator", "washer", "air-purifier"], p: [] },
            energy:   { s: ["refrigerator", "washer", "air-purifier"], p: ["smart-plug", "activity-sensor", "smart-switch"] },
            care:     { s: ["robot-vacuum", "tv-premium", "refrigerator", "galaxy-watch"], p: ["camera", "activity-sensor"] },
            mood:     { s: ["tv-premium", "speaker", "soundbar", "air-purifier"], p: ["lighting", "smart-switch"] },
            security: { s: ["robot-vacuum", "tv-premium", "hub", "galaxy-phone"], p: ["camera", "door-lock", "activity-sensor"] },
            chores:   { s: ["robot-vacuum", "washer", "dryer", "dishwasher", "refrigerator"], p: [] },
            comfort:  { s: ["air-purifier"], p: ["partner-humidifier", "activity-sensor", "smart-switch"] },
            wellness: { s: ["galaxy-watch", "air-purifier", "tv-premium"], p: ["body-scale", "partner-humidifier"] }
        }
    },

    // ── EU (유럽 공통) ──
    EU: {
        samsung: [
            { label: "Mobile", labelEn: "Mobile", ids: ["galaxy-phone", "galaxy-tab", "galaxy-book"] },
            { label: "Wearable", labelEn: "Wearable", ids: ["galaxy-watch", "galaxy-buds"] },
            { label: "TV / Audio", labelEn: "TV / Audio", ids: ["tv-premium", "projector", "soundbar", "speaker"] },
            { label: "Kitchen", labelEn: "Kitchen", ids: ["refrigerator", "dishwasher", "oven", "microwave", "cooktop"] },
            { label: "Living", labelEn: "Living", ids: ["washer", "dryer", "air-conditioner", "air-purifier", "robot-vacuum"] },
            { label: "Smart Home", labelEn: "Smart Home", ids: ["hub", "smartthings-product"] }
        ],
        partner: [
            { label: "Control", labelEn: "Control", ids: ["smart-plug", "smart-switch", "lighting"] },
            { label: "Security", labelEn: "Security", ids: ["camera", "door-lock", "activity-sensor"] },
            { label: "Wellness", labelEn: "Wellness", ids: ["body-scale", "partner-humidifier"] }
        ],
        styles: {
            baseline: { s: ["tv-premium", "refrigerator", "washer", "air-conditioner"], p: [] },
            energy:   { s: ["refrigerator", "washer", "air-conditioner", "air-purifier"], p: ["smart-plug", "activity-sensor", "smart-switch"] },
            care:     { s: ["robot-vacuum", "tv-premium", "refrigerator", "galaxy-watch"], p: ["camera", "activity-sensor"] },
            mood:     { s: ["tv-premium", "speaker", "soundbar", "air-purifier"], p: ["lighting", "smart-switch"] },
            security: { s: ["robot-vacuum", "tv-premium", "hub", "galaxy-phone"], p: ["camera", "door-lock", "activity-sensor"] },
            chores:   { s: ["robot-vacuum", "washer", "dryer", "dishwasher", "refrigerator"], p: [] },
            comfort:  { s: ["air-purifier", "air-conditioner"], p: ["partner-humidifier", "activity-sensor", "smart-switch"] },
            wellness: { s: ["galaxy-watch", "air-purifier", "air-conditioner", "tv-premium"], p: ["body-scale", "partner-humidifier"] }
        }
    },

    // ── UK ──
    UK: {
        samsung: [
            { label: "Mobile", labelEn: "Mobile", ids: ["galaxy-phone", "galaxy-tab", "galaxy-book"] },
            { label: "Wearable", labelEn: "Wearable", ids: ["galaxy-watch", "galaxy-buds"] },
            { label: "TV / Audio", labelEn: "TV / Audio", ids: ["tv-premium", "projector", "soundbar", "speaker"] },
            { label: "Kitchen", labelEn: "Kitchen", ids: ["refrigerator", "dishwasher", "oven", "microwave"] },
            { label: "Living", labelEn: "Living", ids: ["washer", "dryer", "air-purifier", "robot-vacuum"] },
            { label: "Smart Home", labelEn: "Smart Home", ids: ["hub", "smartthings-product"] }
        ],
        partner: [
            { label: "Control", labelEn: "Control", ids: ["smart-plug", "smart-switch", "lighting"] },
            { label: "Security", labelEn: "Security", ids: ["camera", "door-lock", "activity-sensor"] },
            { label: "Wellness", labelEn: "Wellness", ids: ["body-scale", "partner-humidifier"] }
        ],
        styles: {
            baseline: { s: ["tv-premium", "refrigerator", "washer"], p: [] },
            energy:   { s: ["refrigerator", "washer", "air-purifier"], p: ["smart-plug", "activity-sensor", "smart-switch"] },
            care:     { s: ["robot-vacuum", "tv-premium", "refrigerator", "galaxy-watch"], p: ["camera", "activity-sensor"] },
            mood:     { s: ["tv-premium", "speaker", "soundbar", "air-purifier"], p: ["lighting", "smart-switch"] },
            security: { s: ["robot-vacuum", "tv-premium", "hub", "galaxy-phone"], p: ["camera", "door-lock", "activity-sensor"] },
            chores:   { s: ["robot-vacuum", "washer", "dryer", "dishwasher", "refrigerator"], p: [] },
            comfort:  { s: ["air-purifier"], p: ["partner-humidifier", "activity-sensor", "smart-switch"] },
            wellness: { s: ["galaxy-watch", "air-purifier", "tv-premium"], p: ["body-scale", "partner-humidifier"] }
        }
    },

    // ── SEA (동남아) ── → air-conditioner 강세, 로봇청소기 보급 높음
    SEA: {
        samsung: [
            { label: "Mobile", labelEn: "Mobile", ids: ["galaxy-phone", "galaxy-tab"] },
            { label: "Wearable", labelEn: "Wearable", ids: ["galaxy-watch", "galaxy-buds"] },
            { label: "TV / Audio", labelEn: "TV / Audio", ids: ["tv-premium", "soundbar"] },
            { label: "Kitchen", labelEn: "Kitchen", ids: ["refrigerator", "microwave"] },
            { label: "Living", labelEn: "Living", ids: ["washer", "air-conditioner", "air-purifier", "robot-vacuum"] },
            { label: "Smart Home", labelEn: "Smart Home", ids: ["hub"] }
        ],
        partner: [
            { label: "Control", labelEn: "Control", ids: ["smart-plug", "smart-switch", "lighting"] },
            { label: "Security", labelEn: "Security", ids: ["camera", "door-lock", "activity-sensor"] },
            { label: "Wellness", labelEn: "Wellness", ids: ["body-scale", "partner-humidifier"] }
        ],
        styles: {
            baseline: { s: ["tv-premium", "refrigerator", "washer", "air-conditioner"], p: [] },
            energy:   { s: ["refrigerator", "washer", "air-conditioner", "air-purifier"], p: ["smart-plug", "activity-sensor"] },
            care:     { s: ["robot-vacuum", "tv-premium", "refrigerator", "galaxy-watch"], p: ["camera", "activity-sensor"] },
            mood:     { s: ["tv-premium", "soundbar", "air-purifier"], p: ["lighting", "smart-switch"] },
            security: { s: ["robot-vacuum", "tv-premium", "hub", "galaxy-phone"], p: ["camera", "door-lock", "activity-sensor"] },
            chores:   { s: ["robot-vacuum", "washer", "refrigerator"], p: [] },
            comfort:  { s: ["air-purifier", "air-conditioner"], p: ["partner-humidifier", "activity-sensor"] },
            wellness: { s: ["galaxy-watch", "air-purifier", "air-conditioner", "tv-premium"], p: ["body-scale", "partner-humidifier"] }
        }
    },

    // ── IN (인도) ── → 에어컨/공기청정기 비중 높음, 세탁기 보급 차이
    IN: {
        samsung: [
            { label: "Mobile", labelEn: "Mobile", ids: ["galaxy-phone", "galaxy-tab"] },
            { label: "Wearable", labelEn: "Wearable", ids: ["galaxy-watch", "galaxy-buds"] },
            { label: "TV / Audio", labelEn: "TV / Audio", ids: ["tv-premium", "soundbar"] },
            { label: "Kitchen", labelEn: "Kitchen", ids: ["refrigerator", "microwave"] },
            { label: "Living", labelEn: "Living", ids: ["washer", "air-conditioner", "air-purifier"] },
            { label: "Smart Home", labelEn: "Smart Home", ids: ["hub"] }
        ],
        partner: [
            { label: "Control", labelEn: "Control", ids: ["smart-plug", "smart-switch", "lighting"] },
            { label: "Security", labelEn: "Security", ids: ["camera", "door-lock", "activity-sensor"] },
            { label: "Wellness", labelEn: "Wellness", ids: ["body-scale", "partner-humidifier"] }
        ],
        styles: {
            baseline: { s: ["tv-premium", "refrigerator", "washer", "air-conditioner"], p: [] },
            energy:   { s: ["refrigerator", "washer", "air-conditioner", "air-purifier"], p: ["smart-plug", "activity-sensor"] },
            care:     { s: ["tv-premium", "refrigerator", "galaxy-watch"], p: ["camera", "activity-sensor"] },
            mood:     { s: ["tv-premium", "soundbar", "air-purifier"], p: ["lighting", "smart-switch"] },
            security: { s: ["tv-premium", "hub", "galaxy-phone"], p: ["camera", "door-lock", "activity-sensor"] },
            chores:   { s: ["washer", "refrigerator"], p: [] },
            comfort:  { s: ["air-purifier", "air-conditioner"], p: ["partner-humidifier", "activity-sensor"] },
            wellness: { s: ["galaxy-watch", "air-purifier", "air-conditioner", "tv-premium"], p: ["body-scale", "partner-humidifier"] }
        }
    }
    // LATAM, ME, OCE, CIS, JP, CN → _default fallback
};

// ── Catalog resolver: siteCode → region → catalog (with fallback) ──
let _activeLocaleKey = null;
let _activeFallbackSource = null;

function resolveLocaleCatalog(siteCode) {
    const code = (siteCode || "").toUpperCase().replace(/-.*$/, "");
    // 1차: SITE_REGION_MAP에서 region 탐색
    const region = SITE_REGION_MAP[code] || null;
    // 2차: region catalog 존재 여부
    if (region && LOCALE_CATALOGS[region]) {
        _activeLocaleKey = region;
        _activeFallbackSource = null;
        return LOCALE_CATALOGS[region];
    }
    // 3차: dotcom mapping의 language 기반 자동 추론
    if (dotcomMapping?.markets) {
        const market = dotcomMapping.markets.find(m => m.siteCode?.toUpperCase() === code);
        if (market) {
            const lang = (market.language || "").toLowerCase();
            if (lang === "korean") { _activeLocaleKey = "KR"; _activeFallbackSource = "language"; return LOCALE_CATALOGS.KR; }
            if (lang === "english" && LOCALE_CATALOGS.US) { _activeLocaleKey = "US"; _activeFallbackSource = "language"; return LOCALE_CATALOGS.US; }
        }
    }
    // 4차: global default
    _activeLocaleKey = "_default";
    _activeFallbackSource = region ? `region:${region}` : "no-mapping";
    console.log(`[Q3 Catalog] fallback applied for ${code} → _default (reason: ${_activeFallbackSource})`);
    return LOCALE_CATALOGS._default;
}

// ── Dynamic Q3 state (locale에 따라 변경됨) ──
let Q4_SAMSUNG_GROUPS = [];
let Q4_PARTNER_GROUPS = [];
let Q4_SAMSUNG_IDS = new Set();
let Q4_PARTNER_IDS = new Set();
let Q4_PRESETS = [];
let q4ActivePresets = new Set();

// 모든 기기 ID (auto 해제용)
const Q4_ALL_QUICK_IDS = [
    "tv-premium", "refrigerator", "washer", "dryer", "air-conditioner", "air-purifier",
    "ventilation", "robot-vacuum", "dishwasher", "eco-aircon", "speaker", "soundbar",
    "galaxy-phone", "galaxy-watch", "galaxy-buds", "galaxy-tab", "galaxy-book",
    "projector", "moving-style", "harman-audio", "kimchi-fridge", "cooktop", "oven",
    "microwave", "water-purifier", "hood", "airdresser", "system-aircon",
    "monitor", "printer", "memory-storage", "hub", "smartthings-product", "accessories",
    "smart-plug", "camera", "door-lock", "activity-sensor", "smart-switch",
    "lighting", "body-scale", "partner-sleep", "partner-humidifier",
    "care-camera", "sleep-sensor", "energy-monitor", "wearable-care",
    "galaxy-ring", "galaxy-xr", "galaxy-accessories", "music-frame",
    "dt-vacuum", "dt-small-appliance", "copilot-pc", "desktop-pc", "sec-moving-style"
];

// ── 스타일 카드 정의 (8개 공통 — locale 불변) ──
const Q4_STYLE_CARDS = [
    { id: "baseline", icon: "📦" },
    { id: "energy",   icon: "⚡" },
    { id: "care",     icon: "💛" },
    { id: "mood",     icon: "🎵" },
    { id: "security", icon: "🛡" },
    { id: "chores",   icon: "🧹" },
    { id: "comfort",  icon: "🌿" },
    { id: "wellness", icon: "🧘" }
];

/**
 * 현재 국가 기준으로 Q3 카탈로그를 적용
 * - Q4_SAMSUNG_GROUPS, Q4_PARTNER_GROUPS, Q4_PRESETS를 갱신
 * - 이전 선택 중 새 로케일에 없는 기기 자동 제거
 */
function applyLocaleCatalog(siteCode) {
    const catalog = resolveLocaleCatalog(siteCode);
    Q4_SAMSUNG_GROUPS = catalog.samsung;
    Q4_PARTNER_GROUPS = catalog.partner;
    Q4_SAMSUNG_IDS = new Set(Q4_SAMSUNG_GROUPS.flatMap(g => g.ids));
    Q4_PARTNER_IDS = new Set(Q4_PARTNER_GROUPS.flatMap(g => g.ids));

    Q4_PRESETS = Q4_STYLE_CARDS.map(card => {
        const mapping = catalog.styles[card.id] || { s: [], p: [] };
        const samsungIds = [...mapping.s];
        const partnerIds = [...mapping.p];
        return { ...card, samsungIds, partnerIds, deviceIds: [...samsungIds, ...partnerIds] };
    });
}

/** 현재 로케일의 dotcom 정보 반환 (헤더 표시용) */
function getActiveLocaleInfo() {
    const code = countrySelect?.value || "";
    const market = (dotcomMapping?.markets || []).find(m =>
        m.siteCode?.toUpperCase() === code.toUpperCase()
    ) || (marketOptions || []).find(m => m.siteCode === code);
    return {
        country: market?.country || code,
        siteCode: code,
        baseUrl: market?.fullUrl || `https://www.samsung.com/${code.toLowerCase()}`,
        isFallback: _activeFallbackSource !== null,
        fallbackSource: _activeFallbackSource,
        catalogKey: _activeLocaleKey
    };
}

// 기기별 역할 태그 (중복 역할 표현용 — locale 불변)
const DEVICE_ROLE_TAGS = {
    "tv-premium":       { ko: ["엔터테인먼트", "알림 허브"], en: ["Entertainment", "Alert Hub"] },
    "refrigerator":     { ko: ["주방", "가족 케어"], en: ["Kitchen", "Family Care"] },
    "robot-vacuum":     { ko: ["가사", "모니터링"], en: ["Chores", "Monitoring"] },
    "smart-plug":       { ko: ["에너지", "제어"], en: ["Energy", "Control"] },
    "care-camera":      { ko: ["돌봄", "모니터링"], en: ["Care", "Monitoring"] },
    "door-lock":        { ko: ["보안", "출입"], en: ["Security", "Access"] },
    "activity-sensor":  { ko: ["안전", "시니어 케어"], en: ["Safety", "Senior Care"] },
    "sleep-sensor":     { ko: ["수면", "웰니스"], en: ["Sleep", "Wellness"] },
    "lighting":         { ko: ["무드", "자동화"], en: ["Mood", "Automation"] },
    "energy-monitor":   { ko: ["에너지", "모니터링"], en: ["Energy", "Monitoring"] },
    "wearable-care":    { ko: ["돌봄", "건강"], en: ["Care", "Health"] },
    "eco-aircon":       { ko: ["절약", "AI 제어"], en: ["Saving", "AI Control"] }
};

// 초기 카탈로그 적용 (page load 시)
applyLocaleCatalog("SEC");

function detectBrowserLocale() {
    const lang = (navigator.language || navigator.userLanguage || "en").toLowerCase();
    const primary = lang.split("-")[0];
    if (SUPPORTED_UI_LOCALES.includes(primary)) return primary;
    return "en";
}

function resolveEffectiveLocale(countryLocale) {
    if (userOverrideLocale) return userOverrideLocale;
    if (SUPPORTED_UI_LOCALES.includes(countryLocale)) return countryLocale;
    return detectBrowserLocale();
}

document.addEventListener("DOMContentLoaded", () => {
    accessClientSessionId = ensureAccessClientSessionId();
    sessionStorage.setItem("aiProvider", "openai");
    sessionStorage.removeItem("aiApiKey");
    currentLocale = detectBrowserLocale();
    document.documentElement.lang = currentLocale;
    document.documentElement.dir = currentLocale === "ar" ? "rtl" : "ltr";
    try { hydrateStaticUi(); } catch (e) { console.error("hydrateStaticUi error:", e); }
    if (enforceServerOrigin()) return;
    bindEvents();
    if (shouldBypassAccessForLocal()) {
        openWizard();
    }
    loadReferenceData();
    initLocaleSelector();
    updateEnglishToggleVisibility();
});

function bindEvents() {
    unlockBtn.addEventListener("click", handleUnlock);
    accessCodeInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") handleUnlock();
    });
    accessCodeInput.addEventListener("input", () => {
        if (["accessRequired", "accessInvalid", "accessLocked", "accessUnavailable"].includes(accessStatus.dataset.key)) {
            clearAccessStatus();
        }
    });
    accessToggleBtn.addEventListener("click", toggleAccessCodeVisibility);
    logoutBtn.addEventListener("click", handleLogout);
    wizardLogoutBtn.addEventListener("click", handleLogout);
    guideYesBtn.addEventListener("click", openWizard);
    guideNoBtn.addEventListener("click", showGuideCopy);
    if (guideContinueBtn) guideContinueBtn.addEventListener("click", openWizard);
    prevBtn.addEventListener("click", () => moveStep(-1));
    nextBtn.addEventListener("click", () => moveStep(1));
    generateBtn.addEventListener("click", generateScenario);
    document.getElementById("provider-toggle")?.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-provider]");
        if (!btn) return;
        selectedProvider = btn.dataset.provider;
        sessionStorage.setItem("aiProvider", selectedProvider);
        document.querySelectorAll(".provider-btn").forEach((b) => b.classList.toggle("active", b.dataset.provider === selectedProvider));
    });
    document.querySelectorAll(".provider-btn").forEach((b) => b.classList.toggle("active", b.dataset.provider === selectedProvider));
    roleSelectionContainer?.addEventListener("click", handleRoleCardClick);
    roleSelectionContainer?.addEventListener("keydown", handleRoleCardKeydown);
    countrySelect.addEventListener("change", updateStatePreview);
    countrySelect.addEventListener("change", updateLocaleFromCountry);
    // ── Searchable City Dropdown 이벤트 ──
    initCitySearchDropdown();
    personaGroups.addEventListener("change", (event) => {
        clearQ3AutoMode();
        handleChecklistChange(event, personaGroups);
        updateStatePreview();
        updateStepInsight();
    });
    personaGroups.addEventListener("input", (event) => {
        const input = event.target;
        if (!input.classList.contains("tree-custom-input")) return;
        const group = input.closest(".tree-group");
        if (group && group.dataset.mode === "radio" && input.value.trim()) {
            group.querySelectorAll('input[type="radio"]').forEach((r) => { r.checked = false; });
        }
        clearQ3Error();
        updateStatePreview();
        updateStepInsight();
    });
    purposeInput.addEventListener("input", () => {
        updateStatePreview();
        updateStepInsight();
    });
    deviceGrid.addEventListener("change", (event) => {
        handleChecklistChange(event, deviceGrid);
        updateStatePreview();
        updateStepInsight();
        renderQ4Composer();
        // curation은 Build 버튼 클릭 시에만 실행
    });
    deviceCustomInput.addEventListener("input", () => {
        updateStatePreview();
        updateStepInsight();
        renderQ4Summary();
        // curation은 Build 버튼 클릭 시에만 실행
    });
    q4Presets?.addEventListener("click", handleQ4PresetClick);
    q4AllChips?.addEventListener("click", handleQ4QuickChipClick);
    document.getElementById("q4-auto-btn")?.addEventListener("click", handleQ4AutoSelect);
    document.getElementById("q3-auto-btn")?.addEventListener("click", handleQ3AutoSelect);
}

function handleQ3AutoSelect() {
    // Q3 모든 체크박스/라디오 해제 → auto 마커 설정
    const groups = document.getElementById("persona-groups");
    if (groups) {
        groups.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach((input) => { input.checked = false; });
    }
    const customInput = document.getElementById("segment-custom");
    if (customInput) customInput.value = "__auto__";
    // purpose에 auto 안내 삽입
    const purposeInput = document.getElementById("purpose");
    if (purposeInput && !purposeInput.value.trim()) {
        purposeInput.value = currentLocale === "ko"
            ? "AI가 지역 트렌드 기반으로 최적 타겟 세그먼트를 자동 구성합니다."
            : "AI will auto-configure the optimal target segment based on regional trends.";
    }
    updateStatePreview();
    updateStepInsight();
    // 버튼 활성 표시
    const btn = document.getElementById("q3-auto-btn");
    if (btn) btn.classList.add("active");
}
// Q3 auto 모드 해제: 수동 선택 시
function clearQ3AutoMode() {
    const customInput = document.getElementById("segment-custom");
    if (customInput?.value === "__auto__") customInput.value = "";
    const btn = document.getElementById("q3-auto-btn");
    if (btn) btn.classList.remove("active");
}

function handleQ4AutoSelect() {
    // 모든 기기 해제
    q4ActivePresets.clear();
    Q4_ALL_QUICK_IDS.forEach((optionId) => setDeviceOptionChecked(optionId, false));

    // Q1/Q2 기반 기기 자동 선택
    const personaIds = getSelectedPersonaOptionIds();
    const isKo = currentLocale === "ko";

    // 페르소나 → 기기 매핑
    const PERSONA_DEVICE_MAP = {
        // 세대 구성
        hh_solo: ["galaxy-phone", "galaxy-watch", "air-conditioner", "robot-vacuum", "lighting"],
        hh_couple: ["tv-premium", "soundbar", "air-conditioner", "robot-vacuum", "lighting"],
        hh_young_kids: ["camera", "air-purifier", "robot-vacuum", "galaxy-tab", "door-lock"],
        hh_school_kids: ["galaxy-tab", "camera", "air-purifier", "tv-premium"],
        hh_adult_kids: ["tv-premium", "galaxy-phone", "air-conditioner", "robot-vacuum"],
        hh_multi_gen: ["camera", "activity-sensor", "galaxy-watch", "tv-premium", "air-purifier"],
        hh_senior: ["activity-sensor", "galaxy-watch", "camera", "air-conditioner"],
        // 가족 상황
        t_dual_income: ["robot-vacuum", "washer", "dryer", "smart-plug", "door-lock"],
        t_pet: ["pet-camera", "pet-feeder", "robot-vacuum", "air-purifier"],
        t_parent_away: ["camera", "activity-sensor", "galaxy-phone"],
        t_parent_care: ["activity-sensor", "galaxy-watch", "camera"],
        // 라이프스테이지
        ls_starter: ["galaxy-phone", "lighting", "smart-plug", "air-conditioner"],
        ls_newlywed: ["tv-premium", "soundbar", "robot-vacuum", "lighting", "air-conditioner"],
        ls_settled: ["air-conditioner", "air-purifier", "robot-vacuum", "tv-premium", "washer"],
        ls_parenting: ["camera", "air-purifier", "robot-vacuum", "galaxy-tab", "door-lock"],
        ls_established: ["tv-premium", "air-conditioner", "robot-vacuum", "washer", "dryer"],
        ls_empty_nest: ["tv-premium", "galaxy-watch", "air-conditioner", "robot-vacuum"],
        ls_senior: ["galaxy-watch", "activity-sensor", "camera", "air-conditioner"],
        // 생활 패턴
        t_remote: ["galaxy-tab", "galaxy-phone", "air-purifier", "lighting", "speaker"],
        t_long_away: ["camera", "door-lock", "smart-plug", "robot-vacuum"],
        t_weekend_out: ["camera", "door-lock", "smart-plug", "robot-vacuum"],
        t_night_shift: ["sleep-sensor", "lighting", "air-conditioner"],
        t_homebody: ["tv-premium", "soundbar", "gaming-console", "air-purifier", "lighting"],
        // 생활 테마
        int_energy: ["smart-plug", "energy-monitor", "eco-aircon"],
        int_air: ["air-purifier", "ventilation"],
        int_lights: ["lighting", "smart-switch"],
        int_safe: ["camera", "door-lock", "doorbell", "open-sensor"],
        int_sleep: ["sleep-sensor", "lighting", "air-conditioner"],
        int_pet: ["pet-camera", "pet-feeder", "robot-vacuum"],
        int_health: ["galaxy-watch", "galaxy-buds", "body-scale"],
        // 거주지
        h_apt: ["air-conditioner", "air-purifier", "robot-vacuum"],
        h_house: ["camera", "door-lock", "doorbell", "smart-plug"],
        h_compact: ["air-conditioner", "robot-vacuum", "lighting"],
    };

    const autoDevices = new Set();
    const reasons = [];
    personaIds.forEach(id => {
        const devices = PERSONA_DEVICE_MAP[id];
        if (devices) {
            devices.forEach(d => autoDevices.add(d));
        }
    });

    // 기본 기기 (최소 선택)
    if (autoDevices.size === 0) {
        ["galaxy-phone", "tv-premium", "air-conditioner", "robot-vacuum", "lighting"].forEach(d => autoDevices.add(d));
    }

    // 실제 기기 선택
    autoDevices.forEach(deviceId => {
        setDeviceOptionChecked(deviceId, true);
    });

    // 선택 이유 구성
    const reasonMap = {
        hh_solo: isKo ? "1인 가구 → 스마트폰·워치 중심 간편 제어" : "Single → phone & watch centric control",
        hh_couple: isKo ? "2인 가구 → 엔터테인먼트 + 생활 편의" : "Couple → entertainment + convenience",
        hh_young_kids: isKo ? "영유아 가구 → 안전 모니터링 + 공기질" : "Young kids → safety monitoring + air",
        hh_school_kids: isKo ? "학령기 자녀 → 학습 태블릿 + 안전" : "School kids → tablet + safety",
        hh_senior: isKo ? "시니어 → 활동 감지 + 건강 모니터링" : "Senior → activity + health monitoring",
        hh_multi_gen: isKo ? "다세대 → 돌봄 센서 + 공기질" : "Multi-gen → care sensors + air quality",
        t_dual_income: isKo ? "맞벌이 → 가사 자동화 + 에너지 관리" : "Dual income → chore automation + energy",
        t_pet: isKo ? "반려동물 → 펫 카메라 + 자동 급식" : "Pets → pet camera + auto feeder",
        t_remote: isKo ? "재택근무 → 태블릿 + 공기질 + 조명" : "Remote work → tablet + air + lighting",
        t_homebody: isKo ? "홈 레저 → TV + 사운드바 + 조명" : "Homebody → TV + soundbar + lighting",
        ls_parenting: isKo ? "육아기 → 안전 카메라 + 공기청정" : "Parenting → safety camera + air purifier",
        int_energy: isKo ? "에너지 절약 → 스마트 플러그 + 모니터" : "Energy saving → smart plug + monitor",
        int_safe: isKo ? "안전 중시 → 카메라 + 도어락" : "Safety → camera + door lock",
        int_pet: isKo ? "펫 케어 → 펫 카메라 + 급식기" : "Pet care → pet camera + feeder",
        int_health: isKo ? "건강 관리 → 워치 + 체성분계" : "Health → watch + body scale",
    };

    personaIds.forEach(id => {
        if (reasonMap[id]) reasons.push(reasonMap[id]);
    });

    // deviceCustom에 auto 마커 설정
    const customInput = document.getElementById("device-custom");
    if (customInput) customInput.value = "__auto__";
    renderQ4Composer();
    updateStatePreview();
    updateStepInsight();

    // 버튼 활성 표시
    const btn = document.getElementById("q4-auto-btn");
    if (btn) btn.classList.add("active");

    // 선택 이유 표시
    if (reasons.length > 0) {
        const reasonHtml = `
            <div class="q4-auto-reason" style="margin-top:10px;padding:10px 14px;background:#f0f4ff;border-radius:8px;border-left:3px solid #1976d2;font-size:.75rem;color:#333;line-height:1.6">
                <strong style="color:#1976d2">${isKo ? "자동 선택 근거" : "Auto-selection rationale"}</strong>
                <ul style="margin:4px 0 0 16px;padding:0">
                    ${reasons.map(r => `<li>${escapeHtml(r)}</li>`).join("")}
                </ul>
                <p style="margin:6px 0 0;color:#888;font-size:.68rem">${isKo ? "직접 조정이 필요하면 아래에서 기기를 추가/해제할 수 있습니다." : "You can adjust selections below if needed."}</p>
            </div>`;
        const autoBtn = document.getElementById("q4-auto-btn");
        // 기존 이유 카드 제거
        autoBtn?.parentElement?.querySelector(".q4-auto-reason")?.remove();
        if (autoBtn) autoBtn.insertAdjacentHTML("afterend", reasonHtml);
    }
}
// auto 모드 해제: 기기 수동 선택 시
function clearQ4AutoMode() {
    const customInput = document.getElementById("device-custom");
    if (customInput?.value === "__auto__") customInput.value = "";
    const btn = document.getElementById("q4-auto-btn");
    if (btn) btn.classList.remove("active");
    // 자동 선택 근거 카드 제거
    btn?.parentElement?.querySelector(".q4-auto-reason")?.remove();
}

function shouldBypassAccessForLocal() {
    const params = new URLSearchParams(window.location.search);
    const override = params.get("skipAccess");
    if (override === "1") return true;
    if (override === "0") return false;
    const host = window.location.hostname || "";
    if (host === "127.0.0.1" || host === "localhost" || host.endsWith(".local")) return true;

    const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (!ipv4) return false;
    const a = Number(ipv4[1]);
    const b = Number(ipv4[2]);

    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    return false;
}

async function ensureBypassSession(force = false) {
    if (!shouldBypassAccessForLocal()) return true;
    if (bypassSessionReady && !force) return true;
    if (bypassSessionPromise && !force) return bypassSessionPromise;

    bypassSessionPromise = (async () => {
        try {
            const sessionRes = await fetch(ACCESS_API.sessionEndpoint, {
                method: "GET",
                credentials: "include"
            });
            const sessionPayload = await sessionRes.json().catch(() => null);
            if (sessionRes.ok && sessionPayload?.session?.authenticated) {
                bypassSessionReady = true;
                return true;
            }
        } catch {
            // Continue to verification fallback.
        }

        const verification = await verifyAccessCode(LOCAL_BYPASS_ACCESS_CODE);
        bypassSessionReady = Boolean(verification?.ok);
        return bypassSessionReady;
    })();

    try {
        return await bypassSessionPromise;
    } finally {
        bypassSessionPromise = null;
    }
}

function enforceServerOrigin() {
    if (window.location.protocol !== "file:") return false;

    accessCodeInput.disabled = true;
    unlockBtn.disabled = true;
    setAccessStatus(
        "error",
        "accessUnavailable",
        "This page must be opened from http://127.0.0.1:8000/index.html, not from a file:// URL."
    );
    resultDiv.innerHTML = '<p class="error">로컬 파일이 아니라 서버 주소 `http://127.0.0.1:8000/index.html` 로 열어야 합니다.</p>';
    return true;
}

function toggleAccessCodeVisibility() {
    isAccessCodeVisible = !isAccessCodeVisible;
    accessCodeInput.type = isAccessCodeVisible ? "text" : "password";
    accessToggleBtn.textContent = t(isAccessCodeVisible ? "accessHide" : "accessShow");
    accessToggleBtn.setAttribute("aria-pressed", isAccessCodeVisible ? "true" : "false");
}

function hydrateStaticUi() {
    renderExportActions();
    exportActions.querySelectorAll(".action-btn").forEach((button) => {
        button.addEventListener("click", () => handleExport(button.dataset.export));
    });

    renderWizardProgress();
    updateStepInsight();
    syncWizardUi();
    applyLocale();
}

async function loadReferenceData() {
    try {
        const safeFetchJson = async (url, fallback) => {
            try {
                const res = await fetch(url);
                return res.ok ? await res.json() : fallback;
            } catch { return fallback; }
        };

        const [factPackData, exploreMatrixData, sourceDataData, countryTrendsData, citySignalsData] = await Promise.all([
            safeFetchJson("references/fact_pack.json", []),
            safeFetchJson("references/explore_matrix.json", {}),
            safeFetchJson("references/source_data.json", {}),
            safeFetchJson("references/country_trends.json", {}),
            safeFetchJson("references/city_signals.json", { cities: [] })
        ]);

        factPack = factPackData;
        exploreMatrix = exploreMatrixData;
        sourceData = sourceDataData;
        countryTrends = countryTrendsData;
        citySignals = citySignalsData;

        // Optional reference: keep app usable even if this file is missing in a deployment.
        try {
            const dotcomMappingRes = await fetch("references/dotcom_mapping.json");
            if (dotcomMappingRes.ok) {
                dotcomMapping = await dotcomMappingRes.json();
            } else {
                dotcomMapping = { markets: [] };
            }
        } catch {
            dotcomMapping = { markets: [] };
        }

        try {
            const verbalGuidelineRes = await fetch("references/verbal_guideline.json");
            verbalGuideline = verbalGuidelineRes.ok ? await verbalGuidelineRes.json() : null;
        } catch {
            verbalGuideline = null;
        }

        try {
            const serviceSupportRes = await fetch("references/service_support_matrix.json");
            serviceSupportMatrix = serviceSupportRes.ok ? await serviceSupportRes.json() : { markets: [] };
        } catch {
            serviceSupportMatrix = { markets: [] };
        }

        try {
            const skuAvailabilityRes = await fetch("references/sku_availability_matrix.json");
            skuAvailabilityMatrix = skuAvailabilityRes.ok ? await skuAvailabilityRes.json() : { markets: [] };
        } catch {
            skuAvailabilityMatrix = { markets: [] };
        }

        try {
            const productFeatureRes = await fetch("references/product_feature_matrix.json");
            productFeatureMatrix = productFeatureRes.ok ? await productFeatureRes.json() : { products: [] };
        } catch {
            productFeatureMatrix = { products: [] };
        }

        populateInputs();
        updateLocaleFromCountry();
        updateRoleBrief();
        updateStatePreview();
    } catch (error) {
        resultDiv.innerHTML = `<p class="error">데이터를 불러오지 못했습니다: ${escapeHtml(String(error?.message || error))}. 잠시 후 다시 시도해 주세요.</p>`;
        console.error("[loadReferenceData] Fatal error:", error);
    }
}

function getDotcomMarketInfo(selectedMarket) {
    if (!selectedMarket) return null;

    const fromJson = (dotcomMapping?.markets || []).find((entry) => entry.siteCode === selectedMarket.siteCode);
    if (fromJson) {
        return {
            siteCode: selectedMarket.siteCode,
            country: fromJson.country,
            language: fromJson.language,
            url: fromJson.url,
            fullUrl: fromJson.fullUrl || (fromJson.url.startsWith("http") ? fromJson.url : `https://${fromJson.url}`)
        };
    }

    const fallback = DOTCOM_MARKETS.find((entry) => entry[1] === selectedMarket.siteCode);
    if (!fallback) return null;
    const url = fallback[3];
    return {
        siteCode: selectedMarket.siteCode,
        country: fallback[0],
        language: fallback[2],
        url,
        fullUrl: url.startsWith("http") ? url : `https://${url}`
    };
}

function renderChecklistGroups(groups, selectedIds = [], kind) {
    const selected = new Set(selectedIds);
    return groups.map((group) => {
        // Section header — full-width label
        if (group.section) {
            return `<div class="device-section-header" style="grid-column:1/-1"><span>${escapeHtml(group.title)}</span></div>`;
        }
        const mode = group.mode || "checkbox";
        const isLegacy = !group.mode;
        const isChip = mode === "chip";
        const isRadio = mode === "radio";
        const inputType = isRadio ? "radio" : "checkbox";
        const radioName = isRadio ? `${kind}_${group.id}` : "";

        // Legacy parent-checkbox (device groups only)
        const allSelected = isLegacy && group.options.every((option) => selected.has(option.id));

        const parentHtml = isLegacy ? `
            <label class="tree-parent">
                <input type="checkbox" data-kind="${kind}" data-node-type="parent" data-group-id="${group.id}" ${allSelected ? "checked" : ""}>
                <span class="tree-parent-title">${escapeHtml(group.title)}</span>
            </label>
        ` : `<div class="tree-parent tree-parent--label">
                <span class="tree-parent-title">${escapeHtml(group.title)}</span>
                ${group.helper ? `<span class="tree-parent-helper">${escapeHtml(group.helper)}</span>` : ""}
             </div>`;

        const optionsHtml = group.options.map((option) => {
            if (option.divider) {
                return `<div class="tree-divider">${escapeHtml(option.label)}</div>`;
            }
            const childChecked = selected.has(option.id);
            const descHtml = option.desc ? `<span class="tree-child-desc">${escapeHtml(option.desc)}</span>` : "";

            // Chip mode — toggle chips
            if (isChip) {
                return `
                    <label class="tree-chip ${childChecked ? "tree-chip--active" : ""}">
                        <input type="checkbox" value="${option.id}" data-kind="${kind}" data-node-type="child" data-group-id="${group.id}" data-label="${escapeHtml(option.label)}" ${childChecked ? "checked" : ""}>
                        <span>${escapeHtml(option.label)}</span>
                    </label>`;
            }

            // Radio card mode — single select cards
            if (isRadio) {
                return `
                    <label class="tree-card ${childChecked ? "tree-card--active" : ""}">
                        <input type="radio" name="${radioName}" value="${option.id}" data-kind="${kind}" data-node-type="child" data-group-id="${group.id}" data-label="${escapeHtml(option.label)}" ${childChecked ? "checked" : ""}>
                        <span class="tree-card-label">${escapeHtml(option.label)}</span>
                        ${descHtml}
                    </label>`;
            }

            // Legacy sub-children support (for device groups)
            const subHtml = option.sub ? `
                <div class="tree-sub-children" data-parent-option="${option.id}" style="${childChecked ? "" : "display:none"}">
                    ${option.sub.map((s) => `
                        <label class="tree-sub-child">
                            <input type="checkbox" value="${s.id}" data-kind="${kind}" data-node-type="sub-child" data-group-id="${group.id}" data-parent-option="${option.id}" data-label="${escapeHtml(s.label)}" ${selected.has(s.id) ? "checked" : ""}>
                            <span>${escapeHtml(s.label)}</span>
                        </label>
                    `).join("")}
                </div>
            ` : "";
            return `
                <label class="tree-child">
                    <input type="${inputType}" ${radioName ? `name="${radioName}"` : ""} value="${option.id}" data-kind="${kind}" data-node-type="child" data-group-id="${group.id}" data-label="${escapeHtml(option.label)}" ${option.sub ? `data-has-sub="true"` : ""} ${option.normalized ? `data-normalized="${escapeHtml(option.normalized)}"` : ""} ${childChecked ? "checked" : ""}>
                    <span>${escapeHtml(option.label)}</span>
                </label>
                ${subHtml}
            `;
        }).join("");

        const customHtml = group.customPlaceholder ? `
            <input type="text" class="tree-custom-input" data-kind="${kind}" data-group-id="${group.id}" placeholder="${escapeHtml(group.customPlaceholder)}">
        ` : "";

        const scrollClass = group.scrollable ? " tree-children--scroll" : "";
        const modeClass = isChip ? " tree-children--chips" : isRadio ? " tree-children--cards" : "";
        return `
            <section class="tree-group" data-group-id="${group.id}" data-mode="${mode}">
                ${parentHtml}
                <div class="tree-children${scrollClass}${modeClass}">
                    ${optionsHtml}
                </div>
                ${customHtml}
            </section>
        `;
    }).join("");
}

function getDefaultDeviceSelectionsForCountry(siteCode) {
    const normalizedSiteCode = normalizeSiteCode(String(siteCode || "").trim().toUpperCase());
    if (normalizedSiteCode === "KR") {
        return ["air-conditioner", "washer", "tv-premium", "refrigerator"];
    }
    return [];
}

function getQ4PresetCopy(presetId) {
    const titles = {
        baseline: { ko: "기본 조합",       en: "Baseline" },
        energy:   { ko: "에너지 절약형",    en: "Energy Saver" },
        care:     { ko: "케어 확장형",     en: "Care+" },
        mood:     { ko: "무드 확장형",     en: "Mood+" },
        security: { ko: "홈 시큐리티형",    en: "Security" },
        chores:   { ko: "가사 올인형",     en: "Chores All-in" },
        comfort:  { ko: "쾌적 환경형",     en: "Air Comfort" },
        wellness: { ko: "건강·웰니스형",    en: "Wellness" }
    };
    const icons = { baseline: "📦", energy: "⚡", care: "💛", mood: "🎵", security: "🛡", chores: "🧹", comfort: "🌿", wellness: "🧘" };
    const isKo = currentLocale === "ko";
    const title = (titles[presetId] || titles.baseline)[isKo ? "ko" : "en"];
    const icon = icons[presetId] || "📦";

    // desc는 현재 카탈로그의 실제 기기에서 동적 생성
    const preset = Q4_PRESETS.find(p => p.id === presetId);
    let desc = "";
    if (preset) {
        const sLabels = preset.samsungIds.slice(0, 4).map(id => getDeviceLabel(id)).join(", ");
        const pLabels = preset.partnerIds.length > 0
            ? " + " + preset.partnerIds.slice(0, 3).map(id => getDeviceLabel(id)).join("·")
            : "";
        desc = sLabels + pLabels;
    }
    return { title, desc, icon };
}

function getQ4SummaryCopy() {
    if (currentLocale === "ko") {
        return {
            selected: "현재 반영 기기",
            capabilities: "가능한 기능",
            limits: "현재 제한",
            recommend: "추천 추가 기기",
            empty: "기기를 고르면 여기서 가능한 시나리오 범위와 한계가 바로 보입니다."
        };
    }
    return {
        selected: "Current devices",
        capabilities: "What this enables",
        limits: "Current limits",
        recommend: "Recommended additions",
        empty: "Choose devices to see what the scenario can realistically do."
    };
}

function renderQ4Composer() {
    if (!q4Presets) return;

    // ── 현재 국가 기준 카탈로그 적용 ──
    applyLocaleCatalog(countrySelect?.value || "SEC");

    // ── 로케일 헤더 동적 갱신 ──
    const localeInfo = getActiveLocaleInfo();
    const localeHeader = document.querySelector(".q4-locale-header");
    if (localeHeader) {
        const isKoH = currentLocale === "ko";
        const fallbackNotice = localeInfo.isFallback
            ? `<p class="q4-locale-fallback">${isKoH
                ? "현재 국가의 상세 제품 구성이 준비 중이어서 유사 로케일 기준 제품군을 우선 표시합니다."
                : "Detailed product data for this market is being prepared. Showing similar locale products."}</p>`
            : "";
        localeHeader.innerHTML = `
            <div class="q4-locale-main">
                <span class="q4-locale-icon">🌐</span>
                <span class="q4-locale-label">${isKoH ? "현재 제품 기준" : "Product source"}: <strong>Samsung.com ${escapeHtml(localeInfo.country)} (${escapeHtml(localeInfo.siteCode.toLowerCase())})</strong></span>
            </div>
            <p class="q4-locale-sub">${isKoH
                ? "아래 조합은 해당 국가 삼성닷컴 판매 제품을 우선 반영했습니다. 일부 기능은 SmartThings 호환 타사 기기가 추가로 필요할 수 있습니다."
                : "Products below prioritize this market's Samsung.com lineup. Some features may require SmartThings-compatible partner devices."}</p>
            ${fallbackNotice}
        `;
    }

    const selectedDeviceIds = new Set(
        [...(deviceGrid?.querySelectorAll('input[data-node-type="child"]:checked') || [])].map((input) => input.value)
    );
    const isKo = currentLocale === "ko";

    // ── 스타일 조합 카드 8개 ──
    q4Presets.innerHTML = Q4_PRESETS.map((preset) => {
        const copy = getQ4PresetCopy(preset.id);
        const isActive = q4ActivePresets.has(preset.id);
        const custState = getPresetCustomizationState(preset, selectedDeviceIds);
        const custBadge = isActive && custState.customized
            ? `<span class="q4-cust-badge">${isKo ? "직접 조정됨" : "Customized"}</span>`
            : isActive && custState.expanded
                ? `<span class="q4-cust-badge q4-cust-expanded">${isKo ? "확장됨" : "Expanded"}</span>`
                : "";

        // 삼성/호환 배지
        const samsungBadges = preset.samsungIds.map(id => {
            const lbl = getDeviceLabel(id);
            const removed = isActive && !selectedDeviceIds.has(id);
            return `<span class="q4-card-badge q4-badge-samsung${removed ? " q4-badge-removed" : ""}">${escapeHtml(lbl)}</span>`;
        }).join("");
        const partnerBadges = preset.partnerIds.length > 0
            ? preset.partnerIds.map(id => {
                const lbl = getDeviceLabel(id);
                const removed = isActive && !selectedDeviceIds.has(id);
                return `<span class="q4-card-badge q4-badge-partner${removed ? " q4-badge-removed" : ""}">${escapeHtml(lbl)}</span>`;
            }).join("")
            : "";

        return `
            <button type="button" class="q4-preset-btn${isActive ? " active" : ""}${isActive && custState.customized ? " customized" : ""}" data-preset-id="${preset.id}">
                <span class="q4-preset-icon">${copy.icon || "📦"}</span>
                <strong class="q4-preset-title">${escapeHtml(copy.title)}</strong>
                ${custBadge}
                <div class="q4-card-badges">
                    ${samsungBadges}
                    ${partnerBadges ? `<span class="q4-badge-divider">+</span>${partnerBadges}` : ""}
                </div>
                ${preset.partnerIds.length === 0
                    ? `<span class="q4-card-tag q4-tag-samsung-only">${isKo ? "삼성 중심" : "Samsung only"}</span>`
                    : `<span class="q4-card-tag q4-tag-partner-needed">${isKo ? "타사 확장 가능" : "Partner expandable"}</span>`}
            </button>
        `;
    }).join("");

    // ── 직접 기기 선택: 삼성 / 타사 분리 ──
    const allChipsEl = document.getElementById("q4-all-chips");
    if (allChipsEl) {
        const samsungHtml = renderQ4ChipSection(Q4_SAMSUNG_GROUPS, "samsung");
        const partnerHtml = renderQ4ChipSection(Q4_PARTNER_GROUPS, "partner");

        allChipsEl.innerHTML = `
            <div class="q4-direct-section q4-direct-samsung">
                <div class="q4-direct-section-head">
                    <span class="q4-direct-section-icon">🏢</span>
                    <span class="q4-direct-section-title">${isKo ? "삼성닷컴 Korea (sec) 기준 구매 가능 제품" : "Samsung.com Korea Products"}</span>
                </div>
                ${samsungHtml}
            </div>
            <div class="q4-direct-section q4-direct-partner">
                <div class="q4-direct-section-head">
                    <span class="q4-direct-section-icon">🔗</span>
                    <span class="q4-direct-section-title">${isKo ? "SmartThings 호환 타사/파트너 기기" : "SmartThings Partner Devices"}</span>
                </div>
                ${partnerHtml}
            </div>
        `;
    }
    syncQ4QuickChipSelection();
    renderQ4Summary();
}

function renderQ4ChipSection(groups, kind) {
    return groups.map(group => {
        const groupLabel = currentLocale === "ko" ? group.label : group.labelEn;
        const chips = renderQ4QuickChipButtons(group.ids, kind);
        return `<div class="q4-chip-group">
            <span class="q4-chip-group-label">${escapeHtml(groupLabel)}</span>
            <div class="q4-chip-group-items">${chips}</div>
        </div>`;
    }).join("");
}

function getDeviceLabel(optionId) {
    const input = deviceGrid?.querySelector(`input[data-node-type="child"][value="${optionId}"]`);
    return input?.dataset?.label || optionId;
}

function getPresetCustomizationState(preset, selectedDeviceIds) {
    if (!q4ActivePresets.has(preset.id)) return { customized: false, expanded: false };
    const expectedIds = new Set(preset.deviceIds);
    const removedFromPreset = preset.deviceIds.filter(id => !selectedDeviceIds.has(id));
    const addedBeyondPresets = [...selectedDeviceIds].filter(id => {
        // 이 기기가 어떤 활성 프리셋에도 속하지 않는 경우 = 사용자 직접 추가
        for (const pid of q4ActivePresets) {
            const p = Q4_PRESETS.find(x => x.id === pid);
            if (p && p.deviceIds.includes(id)) return false;
        }
        return true;
    });
    return {
        customized: removedFromPreset.length > 0,
        expanded: addedBeyondPresets.length > 0,
        removedIds: removedFromPreset,
        addedIds: addedBeyondPresets
    };
}

function renderQ4QuickChipButtons(optionIds, kind) {
    return optionIds.map((optionId) => {
        const input = deviceGrid?.querySelector(`input[data-node-type="child"][value="${optionId}"]`);
        if (!input) return "";
        const label = input.dataset.label || input.value;
        const selectedClass = input.checked ? " selected" : "";
        const roles = DEVICE_ROLE_TAGS[optionId];
        const roleTags = roles
            ? (currentLocale === "ko" ? roles.ko : roles.en).map(r => `<span class="q4-role-tag">${escapeHtml(r)}</span>`).join("")
            : "";
        return `
            <button type="button" class="q4-chip-btn${selectedClass}" data-q4-chip="${kind}" data-option-id="${optionId}">
                <span class="q4-chip-label">${escapeHtml(label)}</span>
                ${roleTags ? `<span class="q4-chip-roles">${roleTags}</span>` : ""}
            </button>
        `;
    }).join("");
}

function handleQ4PresetClick(event) {
    const button = event.target.closest("[data-preset-id]");
    if (!button) return;
    const preset = Q4_PRESETS.find((item) => item.id === button.dataset.presetId);
    if (!preset) return;
    clearQ4AutoMode();

    const isActive = q4ActivePresets.has(preset.id);
    if (isActive) {
        q4ActivePresets.delete(preset.id);
        // 이 프리셋의 고유 기기만 해제 (다른 활성 프리셋과 겹치는 기기는 유지)
        const otherPresetDevices = new Set();
        for (const pid of q4ActivePresets) {
            const p = Q4_PRESETS.find(x => x.id === pid);
            if (p) p.deviceIds.forEach(id => otherPresetDevices.add(id));
        }
        preset.deviceIds.forEach((optionId) => {
            if (!otherPresetDevices.has(optionId)) setDeviceOptionChecked(optionId, false);
        });
    } else {
        q4ActivePresets.add(preset.id);
        preset.deviceIds.forEach((optionId) => setDeviceOptionChecked(optionId, true));
    }
    renderQ4Composer();
    updateStatePreview();
    updateStepInsight();
    // curation은 "시나리오 매칭 시작" 버튼 클릭 시에만 실행
}

function handleQ4QuickChipClick(event) {
    const button = event.target.closest("[data-option-id]");
    if (!button) return;
    const optionId = button.dataset.optionId;
    const input = deviceGrid?.querySelector(`input[data-node-type="child"][value="${optionId}"]`);
    if (!input) return;
    clearQ4AutoMode();
    setDeviceOptionChecked(optionId, !input.checked);
    renderQ4Composer();
    updateStatePreview();
    updateStepInsight();
    // curation은 "시나리오 매칭 시작" 버튼 클릭 시에만 실행
}

function setDeviceOptionChecked(optionId, shouldCheck) {
    const input = deviceGrid?.querySelector(`input[data-node-type="child"][value="${optionId}"]`);
    if (!input) return;
    input.checked = shouldCheck;
    const group = input.closest(".tree-group");
    if (group) {
        if (input.dataset.hasSub === "true") {
            toggleSubChildren(group, optionId, shouldCheck);
        }
        syncChecklistParent(group);
    }
}

function syncQ4QuickChipSelection() {
    const q4AllChips = document.getElementById("q4-all-chips");
    [q4AllChips].forEach((container) => {
        container?.querySelectorAll("[data-option-id]").forEach((button) => {
            const optionId = button.dataset.optionId;
            const input = deviceGrid?.querySelector(`input[data-node-type="child"][value="${optionId}"]`);
            button.classList.toggle("selected", Boolean(input?.checked));
        });
    });
}

function buildQ4CapabilitySummary(selectedNormalizedDevices) {
    const deviceSet = new Set(selectedNormalizedDevices);
    const capabilities = [];
    const limits = [];
    const recommendations = [];

    if (deviceSet.has("TV")) capabilities.push(currentLocale === "ko" ? "TV를 알림 허브나 장면 연출 포인트로 활용 가능" : "TV can act as a visible alert and scene anchor");
    else recommendations.push(currentLocale === "ko" ? "TV를 넣으면 집 안 장면 연출과 알림 전달이 쉬워집니다." : "Add a TV to make alerts and scene storytelling more visible.");

    if (deviceSet.has("세탁기") || deviceSet.has("세탁기/건조기")) capabilities.push(currentLocale === "ko" ? "가사 자동화와 세탁 루틴 중심 시나리오 구성 가능" : "Laundry-driven automation becomes credible");
    else limits.push(currentLocale === "ko" ? "가사 자동화 축이 약해져 생활 밀착감이 줄어듭니다." : "Without laundry devices, chore automation feels weaker.");

    if (deviceSet.has("냉장고")) capabilities.push(currentLocale === "ko" ? "식생활/푸드 케어 장면까지 자연스럽게 확장 가능" : "Food-care and kitchen routines can be included");
    else recommendations.push(currentLocale === "ko" ? "냉장고를 넣으면 주방·식생활 메시지까지 확장됩니다." : "Add a refrigerator to extend into food-care routines.");

    if (deviceSet.has("에어컨")) capabilities.push(currentLocale === "ko" ? "쾌적성·에너지 절감 메시지를 바로 연결 가능" : "Comfort and energy-saving scenarios become immediate");
    else limits.push(currentLocale === "ko" ? "귀가 직후 쾌적성 장면이 약해질 수 있습니다." : "Arrival comfort moments will be weaker without climate control.");

    if (deviceSet.has("센서")) capabilities.push(currentLocale === "ko" ? "재실·부재·감지 기반 자동 실행 설계 가능" : "Presence and trigger-based automation becomes possible");
    else {
        limits.push(currentLocale === "ko" ? "센서가 없으면 감지 기반 자동화는 보수적으로 설명해야 합니다." : "Without sensors, trigger automation must stay conservative.");
        recommendations.push(currentLocale === "ko" ? "센서나 허브를 추가하면 자동화 설득력이 크게 올라갑니다." : "Add sensors or a hub to unlock stronger automation logic.");
    }

    if (!deviceSet.has("스피커")) {
        recommendations.push(currentLocale === "ko" ? "스피커를 넣으면 음성·무드 경험을 더 쉽게 연결할 수 있습니다." : "Add a speaker to support voice and mood-driven scenes.");
    }

    return { capabilities, limits, recommendations };
}

function renderQ4Summary() {
    if (!q4Summary) return;
    syncQ4QuickChipSelection();

    const isKo = currentLocale === "ko";
    const selectedIds = new Set(
        [...(deviceGrid?.querySelectorAll('input[data-node-type="child"]:checked') || [])].map(i => i.value)
    );
    const selectedLabels = getSelectedDeviceLabels();
    const selectedDevices = getSelectedDevices();

    if (!selectedLabels.length) {
        const emptyMsg = isKo
            ? "기기를 고르면 여기서 가능한 시나리오 범위와 한계가 바로 보입니다."
            : "Choose devices to see what the scenario can realistically do.";
        q4Summary.innerHTML = `<p class="q4-summary-empty">${escapeHtml(emptyMsg)}</p>`;
        return;
    }

    // 삼성 / 타사 분류
    const samsungSelected = [...selectedIds].filter(id => Q4_SAMSUNG_IDS.has(id));
    const partnerSelected = [...selectedIds].filter(id => Q4_PARTNER_IDS.has(id));
    const otherSelected = [...selectedIds].filter(id => !Q4_SAMSUNG_IDS.has(id) && !Q4_PARTNER_IDS.has(id));

    const samsungChips = samsungSelected.map(id => `<span class="q4-summary-chip q4-chip-samsung">${escapeHtml(getDeviceLabel(id))}</span>`).join("");
    const partnerChips = partnerSelected.map(id => `<span class="q4-summary-chip q4-chip-partner">${escapeHtml(getDeviceLabel(id))}</span>`).join("");
    const otherChips = otherSelected.map(id => `<span class="q4-summary-chip">${escapeHtml(getDeviceLabel(id))}</span>`).join("");

    // 커스터마이징 상태
    let custStatusHtml = "";
    if (q4ActivePresets.size > 0) {
        const allExpected = new Set();
        for (const pid of q4ActivePresets) {
            const p = Q4_PRESETS.find(x => x.id === pid);
            if (p) p.deviceIds.forEach(id => allExpected.add(id));
        }
        const removed = [...allExpected].filter(id => !selectedIds.has(id));
        const added = [...selectedIds].filter(id => !allExpected.has(id));

        if (removed.length > 0 || added.length > 0) {
            const removedText = removed.length > 0
                ? `<span class="q4-cust-removed">${isKo ? "제거됨" : "Removed"}: ${removed.map(id => escapeHtml(getDeviceLabel(id))).join(", ")}</span>`
                : "";
            const addedText = added.length > 0
                ? `<span class="q4-cust-added">${isKo ? "추가됨" : "Added"}: ${added.map(id => escapeHtml(getDeviceLabel(id))).join(", ")}</span>`
                : "";
            custStatusHtml = `
                <section class="q4-summary-block q4-summary-block--cust">
                    <span class="q4-summary-label">${isKo ? "커스터마이징 상태" : "Customization"}</span>
                    <div class="q4-cust-details">${removedText}${addedText}</div>
                    <span class="q4-cust-note">${isKo ? "직접 기기 선택에서 일부 항목이 변경되었습니다." : "Some items have been changed from the default card selection."}</span>
                </section>
            `;
        }
    }

    // 검증 상태
    const hasCoreSamsung = samsungSelected.length >= 1;
    const needsPartner = partnerSelected.length > 0;
    let validationHtml = "";
    if (!hasCoreSamsung) {
        validationHtml = `<div class="q4-validation q4-validation--warn">${isKo
            ? "이 스타일 조합을 생성하려면 최소 1개 이상의 핵심 삼성 제품이 필요합니다."
            : "At least one core Samsung product is required to generate a scenario."}</div>`;
    } else if (needsPartner) {
        validationHtml = `<div class="q4-validation q4-validation--info">${isKo
            ? "현재 선택한 조합에는 SmartThings 호환 타사 기기가 포함되어 있습니다. 실제 구현 시 추가 구매 또는 호환 여부 확인이 필요합니다."
            : "Your selection includes SmartThings partner devices. Compatibility verification may be needed."}</div>`;
    } else {
        validationHtml = `<div class="q4-validation q4-validation--ok">${isKo
            ? "현재 선택한 조합은 한국 삼성닷컴 판매 제품 중심으로 구성되어 바로 시나리오 생성이 가능합니다."
            : "Your selection is based on Samsung.com Korea products and is ready for scenario generation."}</div>`;
    }

    // 기존 capability summary
    const capabilitySummary = buildQ4CapabilitySummary(selectedDevices);
    const capabilityMarkup = capabilitySummary.capabilities.slice(0, 3).map(item => `<li>${escapeHtml(item)}</li>`).join("");
    const limitMarkup = capabilitySummary.limits.slice(0, 2).map(item => `<li>${escapeHtml(item)}</li>`).join("");

    const deviceCount = selectedLabels.length;
    const countLabel = isKo ? `기기 ${deviceCount}개 선택됨` : `${deviceCount} devices selected`;

    q4Summary.innerHTML = `
        <div class="q4-summary-count">${escapeHtml(countLabel)}</div>
        <section class="q4-summary-block">
            <span class="q4-summary-label">${isKo ? "삼성 구매 가능 제품" : "Samsung Products"}</span>
            <div class="q4-summary-chip-row">${samsungChips || `<span class="q4-summary-empty-inline">${isKo ? "없음" : "None"}</span>`}</div>
        </section>
        ${partnerChips ? `<section class="q4-summary-block q4-summary-block--partner">
            <span class="q4-summary-label">${isKo ? "타사/호환기기" : "Partner Devices"}</span>
            <div class="q4-summary-chip-row">${partnerChips}</div>
        </section>` : ""}
        ${otherChips ? `<section class="q4-summary-block">
            <span class="q4-summary-label">${isKo ? "기타" : "Other"}</span>
            <div class="q4-summary-chip-row">${otherChips}</div>
        </section>` : ""}
        ${custStatusHtml}
        ${capabilityMarkup ? `<section class="q4-summary-block q4-summary-block--ok">
            <span class="q4-summary-label">${isKo ? "가능한 기능" : "What this enables"}</span>
            <ul class="q4-summary-list">${capabilityMarkup}</ul>
        </section>` : ""}
        ${limitMarkup ? `<section class="q4-summary-block q4-summary-block--warn">
            <span class="q4-summary-label">${isKo ? "현재 제한" : "Current limits"}</span>
            <ul class="q4-summary-list">${limitMarkup}</ul>
        </section>` : ""}
        ${validationHtml}
    `;
    renderQ4DotcomProducts();
}

function renderQ4DotcomProducts() {
    const container = document.getElementById("q4-dotcom-products");
    if (!container) return;
    const selectedMarket = marketOptions.find((m) => m.siteCode === countrySelect.value);
    if (!selectedMarket) { container.innerHTML = ""; return; }
    const baseCode = normalizeSiteCode(selectedMarket.siteCode);
    const siteCode = selectedMarket.siteCode.toLowerCase();
    const dotcom = (dotcomMapping?.markets || []).find((m) => normalizeSiteCode(m.siteCode) === baseCode);
    const baseUrl = dotcom?.fullUrl || `https://www.samsung.com/${siteCode}`;

    // Samsung.com 표준 카테고리 경로 — 대부분 국가에서 동일 패턴 사용
    // 링크가 404인 경우 Samsung.com이 자체 리다이렉트 처리함
    const i = (ko, en) => currentLocale === "ko" ? ko : en;
    const categories = [
        { label: "TV", icon: "📺", path: "/tvs/all-tvs/" },
        { label: i("냉장고", "Refrigerators"), icon: "🧊", path: "/refrigerators/all-refrigerators/" },
        { label: i("세탁·건조", "Washers & Dryers"), icon: "🫧", path: "/washers-and-dryers/all-washers-and-dryers/" },
        { label: i("에어컨", "Air Conditioners"), icon: "❄️", path: "/air-conditioners/all-air-conditioners/" },
        { label: i("공기청정기", "Air Care"), icon: "🌬️", path: "/air-care/all-air-care/" },
        { label: i("청소기", "Vacuums"), icon: "🤖", path: "/vacuum-cleaners/all-vacuum-cleaners/" },
        { label: i("식기세척기", "Dishwashers"), icon: "🍽️", path: "/dishwashers/all-dishwashers/" },
        { label: "SmartThings", icon: "🏠", path: "/smartthings/all-smartthings/" },
        { label: i("전체 보기", "All Products"), icon: "🛒", path: "/offer/" }
    ];

    const title = i("Samsung 판매 제품 보기", "Browse Samsung Products");
    const desc = i(
        "해당 국가 Samsung.com에서 판매 중인 제품을 카테고리별로 확인할 수 있습니다. 시나리오에 반영할 기기를 직접 탐색하고, 실제 판매 가격과 스펙을 비교해 보세요.",
        "Browse products currently available on Samsung.com for this market. Explore devices by category, compare specs and pricing to inform your scenario."
    );
    const domain = baseUrl.replace("https://", "");

    container.innerHTML = `
        <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--line,#e0e0e0)">
            <p style="font-size:.78rem;font-weight:700;color:var(--accent-strong,#003366);margin-bottom:4px">${escapeHtml(title)}</p>
            <p style="font-size:.66rem;color:#666;margin-bottom:6px;line-height:1.5">${escapeHtml(desc)}</p>
            <p style="font-size:.68rem;color:#888;margin-bottom:8px">${escapeHtml(domain)}</p>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px 8px">
                ${categories.map((cat) => `
                    <a href="${escapeHtml(baseUrl + cat.path)}" target="_blank" rel="noopener noreferrer"
                       style="display:flex;align-items:center;gap:6px;padding:7px 10px;border-radius:6px;border:1px solid #e8e8e8;background:#fff;text-decoration:none;color:#222;font-size:.72rem;font-weight:600;transition:all .15s;white-space:nowrap"
                       onmouseover="this.style.background='#f0f2f8';this.style.borderColor='#001a6e'"
                       onmouseout="this.style.background='#fff';this.style.borderColor='#e8e8e8'">
                        <span style="font-size:.95rem">${cat.icon}</span>
                        <span>${escapeHtml(cat.label)}</span>
                    </a>
                `).join("")}
            </div>
        </div>
    `;
}

function handleChecklistChange(event, container) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;

    const groupId = target.dataset.groupId;
    if (!groupId) return;

    const group = container.querySelector(`.tree-group[data-group-id="${groupId}"]`);
    if (!group) return;

    const mode = group.dataset.mode;

    // Radio groups: clear custom input + update card active state
    if (mode === "radio" && target.checked) {
        const customInput = group.querySelector('.tree-custom-input');
        if (customInput) customInput.value = "";
        group.querySelectorAll('.tree-card').forEach((card) => card.classList.remove('tree-card--active'));
        const parentCard = target.closest('.tree-card');
        if (parentCard) parentCard.classList.add('tree-card--active');
    }

    // Chip toggle active state
    if (mode === "chip") {
        const parentChip = target.closest('.tree-chip');
        if (parentChip) parentChip.classList.toggle('tree-chip--active', target.checked);
    }

    // Legacy checkbox-parent behaviour (device groups)
    if (!mode || mode === "checkbox") {
        const parent = group.querySelector('input[data-node-type="parent"]');
        const children = [...group.querySelectorAll('input[data-node-type="child"]')];

        if (target.dataset.nodeType === "parent") {
            children.forEach((child) => {
                child.checked = target.checked;
                toggleSubChildren(group, child.value, target.checked);
            });
        }

        if (target.dataset.nodeType === "child" && target.dataset.hasSub === "true") {
            toggleSubChildren(group, target.value, target.checked);
        }

        syncChecklistParent(group, parent, children);
    }

    // Clear Q3 validation error on interaction
    clearQ3Error();
}

function clearQ3Error() {
    const errEl = resultDiv.querySelector('.error');
    if (errEl && (errEl.textContent.includes("영역에서") || errEl.textContent.includes("select at least"))) {
        resultDiv.innerHTML = "";
    }
}

function toggleSubChildren(group, optionId, show) {
    const subContainer = group.querySelector(`.tree-sub-children[data-parent-option="${optionId}"]`);
    if (!subContainer) return;
    subContainer.style.display = show ? "" : "none";
    if (!show) {
        subContainer.querySelectorAll('input[data-node-type="sub-child"]').forEach((input) => {
            input.checked = false;
        });
    }
}

function syncChecklistParent(group, parent = null, children = null) {
    const resolvedParent = parent || group.querySelector('input[data-node-type="parent"]');
    const resolvedChildren = children || [...group.querySelectorAll('input[data-node-type="child"]')];
    if (!resolvedParent || resolvedChildren.length === 0) return;

    const checkedCount = resolvedChildren.filter((child) => child.checked).length;
    resolvedParent.checked = checkedCount === resolvedChildren.length;
    resolvedParent.indeterminate = checkedCount > 0 && checkedCount < resolvedChildren.length;
}

function syncAllChecklistParents(container) {
    container.querySelectorAll(".tree-group").forEach((group) => syncChecklistParent(group));
}

function getCitySignalContent(countryCode, cityName) {
    const cityEntries = Array.isArray(citySignals?.cities) ? citySignals.cities : [];
    const normalizedCity = normalizeCityValue(cityName);
    const entry = cityEntries.find((e) =>
        e.countryCode === countryCode &&
        (normalizeCityValue(e.displayName) === normalizedCity ||
         (e.aliases || []).some((a) => normalizeCityValue(a) === normalizedCity))
    );
    if (entry?.content) {
        return entry.content[currentLocale] || entry.content.en || null;
    }
    const fallback = citySignals?.fallbacks?.[countryCode];
    if (fallback) {
        return fallback[currentLocale] || fallback.en || null;
    }
    return null;
}

function getExactCitySignalContent(countryCode, cityName) {
    const cityEntries = Array.isArray(citySignals?.cities) ? citySignals.cities : [];
    const normalizedCity = normalizeCityValue(cityName);
    const entry = cityEntries.find((e) =>
        e.countryCode === countryCode &&
        (normalizeCityValue(e.displayName) === normalizedCity ||
         (e.aliases || []).some((a) => normalizeCityValue(a) === normalizedCity))
    );
    if (entry?.content) {
        return entry.content[currentLocale] || entry.content.en || null;
    }
    return null;
}

function getCountryFlagEmoji(countryCode) {
    const flags = {
        US: "\u{1F1FA}\u{1F1F8}", CA: "\u{1F1E8}\u{1F1E6}", MX: "\u{1F1F2}\u{1F1FD}", BR: "\u{1F1E7}\u{1F1F7}",
        AR: "\u{1F1E6}\u{1F1F7}", CO: "\u{1F1E8}\u{1F1F4}", CL: "\u{1F1E8}\u{1F1F1}", PE: "\u{1F1F5}\u{1F1EA}",
        GB: "\u{1F1EC}\u{1F1E7}", UK: "\u{1F1EC}\u{1F1E7}", DE: "\u{1F1E9}\u{1F1EA}", FR: "\u{1F1EB}\u{1F1F7}",
        IT: "\u{1F1EE}\u{1F1F9}", ES: "\u{1F1EA}\u{1F1F8}", PT: "\u{1F1F5}\u{1F1F9}", NL: "\u{1F1F3}\u{1F1F1}",
        BE: "\u{1F1E7}\u{1F1EA}", AT: "\u{1F1E6}\u{1F1F9}", CH: "\u{1F1E8}\u{1F1ED}", SE: "\u{1F1F8}\u{1F1EA}",
        DK: "\u{1F1E9}\u{1F1F0}", FI: "\u{1F1EB}\u{1F1EE}", NO: "\u{1F1F3}\u{1F1F4}", PL: "\u{1F1F5}\u{1F1F1}",
        HU: "\u{1F1ED}\u{1F1FA}", RO: "\u{1F1F7}\u{1F1F4}", CZ: "\u{1F1E8}\u{1F1FF}", GR: "\u{1F1EC}\u{1F1F7}",
        HR: "\u{1F1ED}\u{1F1F7}", IE: "\u{1F1EE}\u{1F1EA}", UA: "\u{1F1FA}\u{1F1E6}", KR: "\u{1F1F0}\u{1F1F7}",
        IN: "\u{1F1EE}\u{1F1F3}", TR: "\u{1F1F9}\u{1F1F7}", RU: "\u{1F1F7}\u{1F1FA}", JP: "\u{1F1EF}\u{1F1F5}",
        CN: "\u{1F1E8}\u{1F1F3}", HK: "\u{1F1ED}\u{1F1F0}", TW: "\u{1F1F9}\u{1F1FC}", IL: "\u{1F1EE}\u{1F1F1}",
        PK: "\u{1F1F5}\u{1F1F0}", BD: "\u{1F1E7}\u{1F1E9}", AZ: "\u{1F1E6}\u{1F1FF}", KZ: "\u{1F1F0}\u{1F1FF}",
        UZ: "\u{1F1FA}\u{1F1FF}", MN: "\u{1F1F2}\u{1F1F3}", SA: "\u{1F1F8}\u{1F1E6}", IQ: "\u{1F1EE}\u{1F1F6}",
        TH: "\u{1F1F9}\u{1F1ED}", VN: "\u{1F1FB}\u{1F1F3}", SG: "\u{1F1F8}\u{1F1EC}", MY: "\u{1F1F2}\u{1F1FE}",
        PH: "\u{1F1F5}\u{1F1ED}", AE: "\u{1F1E6}\u{1F1EA}", MM: "\u{1F1F2}\u{1F1F2}", AU: "\u{1F1E6}\u{1F1FA}",
        NZ: "\u{1F1F3}\u{1F1FF}"
    };
    return flags[countryCode] || "\u{1F30D}";
}

let _nudgeAbort = null;
const _nudgeCache = new Map();
let _cityProfileRequestId = 0;

function renderCityProfileCard() {
    ++_cityProfileRequestId;
    const profileCard = document.getElementById("city-profile-card");
    if (!profileCard) return;

    const selectedMarket = marketOptions.find((m) => m.siteCode === countrySelect.value);
    const country = resolveCountry(selectedMarket);
    if (!country) {
        profileCard.classList.add("hidden");
        profileCard.innerHTML = "";
        return;
    }

    const cityName = getCityValue();
    if (!cityName) {
        profileCard.classList.add("hidden");
        profileCard.innerHTML = "";
        return;
    }
    const flag = getCountryFlagEmoji(country.countryCode);
    const countryName = selectedMarket?.label || country.countryCode;
    const role = normalizeRoleId(roleSelect.value) || "retail";

    // 도시명 로케일 변환 — getCityDisplayValue가 city_signals + KR_CITY_MASTER 모두 검색
    const localDisplayCity = getCityDisplayValue(country.countryCode, cityName) || cityName;

    // 항상 라이브 넛지 API로 최신 트렌드 정보를 가져옴
    profileCard.innerHTML = buildNudgeCardHTML({
        flag, displayCity: localDisplayCity, countryName,
        situation: "", need: "", opportunity: "",
        loading: true
    });
    profileCard.classList.remove("hidden");

    const thisRequestId = _cityProfileRequestId;
    fetchLiveNudge({ countryCode: country.countryCode, cityName, role, locale: currentLocale })
        .then((nudge) => {
            if (thisRequestId !== _cityProfileRequestId) return;
            profileCard.innerHTML = buildNudgeCardHTML({
                flag, displayCity: localDisplayCity, countryName,
                situation: escapeHtml(nudge.situation || ""),
                need: escapeHtml(nudge.need || ""),
                opportunity: escapeHtml(nudge.opportunity || ""),
                loading: false
            });
        })
        .catch(() => {
            if (thisRequestId !== _cityProfileRequestId) return;
            profileCard.classList.add("hidden");
            profileCard.innerHTML = "";
        });
}

function buildNudgeCardHTML({ flag, displayCity, countryName, situation, need, opportunity, loading }) {
    const shimmer = `<span class="nudge-shimmer"></span>`;
    return `
        <div class="city-profile-header">
            <span class="city-profile-flag">${flag}</span>
            <div>
                <strong class="city-profile-name">${escapeHtml(displayCity)}</strong>
                <span class="city-profile-country">${escapeHtml(countryName)}</span>
            </div>
        </div>
        <div class="city-profile-nudges">
            <div class="city-nudge city-nudge--situation">
                <span class="city-nudge-label">${t("nudgeNow")}</span>
                <p>${loading ? shimmer : situation}</p>
            </div>
            <div class="city-nudge city-nudge--need">
                <span class="city-nudge-label">${t("nudgeNeed")}</span>
                <p>${loading ? shimmer : need}</p>
            </div>
            <div class="city-nudge city-nudge--opportunity">
                <span class="city-nudge-label">${t("nudgeOpportunity")}</span>
                <p>${loading ? shimmer : opportunity}</p>
            </div>
        </div>
    `;
}

async function fetchLiveNudge({ countryCode, cityName, role, locale, isKo }) {
    // Cancel any in-flight nudge request
    if (_nudgeAbort) { _nudgeAbort.abort(); }

    // Check cache (key = country+city+role+locale)
    const cacheKey = `${countryCode}|${cityName}|${role}|${locale}`;
    if (_nudgeCache.has(cacheKey)) return _nudgeCache.get(cacheKey);

    _nudgeAbort = new AbortController();
    const countryLabel = marketOptions.find((m) => m.siteCode === countryCode)?.label || countryCode;

    const res = await fetch("/api/nudge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: _nudgeAbort.signal,
        body: JSON.stringify({
            country: countryLabel,
            city: cityName || "",
            role,
            locale
        })
    });

    if (!res.ok) throw new Error(`nudge API ${res.status}`);

    // Read SSE stream and collect full text
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            try {
                const evt = JSON.parse(line.slice(6));
                if (evt.type === "chunk" && evt.text) fullText += evt.text;
            } catch { /* skip */ }
        }
    }

    // Parse JSON from response
    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in nudge response");
    const nudge = JSON.parse(jsonMatch[0]);

    // Cache result
    _nudgeCache.set(cacheKey, nudge);
    return nudge;
}

function getLocalizedCityName(entry) {
    const aliases = Array.isArray(entry.aliases) ? entry.aliases : [];
    const name = entry.displayName || "";
    if (currentLocale === "ko") {
        const hangul = aliases.find((a) => /[\uAC00-\uD7AF]/.test(a));
        if (hangul) return hangul;
    }
    if (currentLocale === "ar") {
        const arabic = aliases.find((a) => /[\u0600-\u06FF]/.test(a));
        if (arabic) return arabic;
    }
    if (["de", "fr", "es", "pt", "it", "nl"].includes(currentLocale)) {
        const local = aliases.find((a) =>
            a !== a.toLowerCase() || /[àáâãäåæçèéêëìíîïðñòóôõöùúûüýþÿ]/i.test(a)
        );
        if (local && local.toLowerCase() !== name.toLowerCase()) return local;
    }
    return name;
}

/* ══════════════════════════════════════════════════════
   Searchable City Dropdown — core logic
   ══════════════════════════════════════════════════════ */
let _cityItems = [];          // current items for dropdown
let _cityFocusIdx = -1;       // keyboard navigation index
let _cityDropdownOpen = false;

function getCityMasterFlat(master, useLocal) {
    const result = [];
    for (const [region, cities] of Object.entries(master)) {
        cities.forEach((c) => result.push({ ...c, region, local: c.local || "" }));
    }
    return result;
}

function getAvailableCitiesByCountry(countryCode) {
    if (!countryCode) return [];

    // KR — use master data with region groups + population
    if (countryCode === "KR") {
        return getKrCityMasterFlat().map((c) => ({
            value: c.en,
            label: currentLocale === "ko" ? c.ko : c.en,
            pop: c.pop,
            region: c.region,
            searchText: `${c.en} ${c.ko}`.toLowerCase()
        }));
    }

    // Countries with CITY_MASTER data — region-grouped dropdown
    const CITY_MASTERS = {
        US: typeof US_CITY_MASTER !== "undefined" ? US_CITY_MASTER : null,
        DE: typeof DE_CITY_MASTER !== "undefined" ? DE_CITY_MASTER : null,
        GB: typeof GB_CITY_MASTER !== "undefined" ? GB_CITY_MASTER : null,
        FR: typeof FR_CITY_MASTER !== "undefined" ? FR_CITY_MASTER : null,
        IT: typeof IT_CITY_MASTER !== "undefined" ? IT_CITY_MASTER : null,
        ES: typeof ES_CITY_MASTER !== "undefined" ? ES_CITY_MASTER : null,
        NL: typeof NL_CITY_MASTER !== "undefined" ? NL_CITY_MASTER : null,
        PL: typeof PL_CITY_MASTER !== "undefined" ? PL_CITY_MASTER : null,
        AU: typeof AU_CITY_MASTER !== "undefined" ? AU_CITY_MASTER : null,
        CA: typeof CA_CITY_MASTER !== "undefined" ? CA_CITY_MASTER : null,
        BR: typeof BR_CITY_MASTER !== "undefined" ? BR_CITY_MASTER : null,
        IN: typeof IN_CITY_MASTER !== "undefined" ? IN_CITY_MASTER : null,
        MX: typeof MX_CITY_MASTER !== "undefined" ? MX_CITY_MASTER : null,
        TR: typeof TR_CITY_MASTER !== "undefined" ? TR_CITY_MASTER : null,
        CO: typeof CO_CITY_MASTER !== "undefined" ? CO_CITY_MASTER : null,
        ID: typeof ID_CITY_MASTER !== "undefined" ? ID_CITY_MASTER : null,
        RU: typeof RU_CITY_MASTER !== "undefined" ? RU_CITY_MASTER : null
    };

    const master = CITY_MASTERS[countryCode];
    if (master) {
        return getCityMasterFlat(master).map((c) => ({
            value: c.en,
            label: c.local || c.en,
            pop: c.pop,
            region: c.region,
            searchText: `${c.en} ${c.local || ""}`.toLowerCase()
        }));
    }

    // Other countries — use city_signals.json
    const cityEntries = Array.isArray(citySignals?.cities) ? citySignals.cities : [];
    const seen = new Set();
    const results = [];
    cityEntries.forEach((entry) => {
        if (entry.countryCode !== countryCode || !entry.displayName) return;
        const normalized = normalizeCityValue(entry.displayName);
        if (!normalized || seen.has(normalized)) return;
        seen.add(normalized);
        const label = getLocalizedCityName(entry);
        const aliases = (entry.aliases || []).join(" ").toLowerCase();
        results.push({
            value: entry.displayName,
            label,
            pop: null,
            region: null,
            searchText: `${entry.displayName} ${label} ${aliases}`.toLowerCase()
        });
    });
    return results.sort((a, b) => a.label.localeCompare(b.label, currentLocale, { sensitivity: "base" }));
}

function getCityValue() {
    return cityHiddenInput.value.trim();
}

function getCityDisplayValue(countryCode, cityName) {
    const normalizedCity = normalizeCityValue(cityName);
    if (!normalizedCity) return "";
    const cityEntries = Array.isArray(citySignals?.cities) ? citySignals.cities : [];
    const matchedEntry = cityEntries.find((entry) =>
        entry.countryCode === countryCode &&
        (normalizeCityValue(entry.displayName) === normalizedCity ||
         (entry.aliases || []).some((alias) => normalizeCityValue(alias) === normalizedCity))
    );
    if (matchedEntry) return getLocalizedCityName(matchedEntry);
    // KR master fallback
    if (countryCode === "KR") {
        const krFlat = getKrCityMasterFlat();
        const m = krFlat.find((c) =>
            normalizeCityValue(c.en) === normalizedCity || normalizeCityValue(c.ko) === normalizedCity
        );
        if (m) return currentLocale === "ko" ? m.ko : m.en;
    }
    return cityName;
}

function setCityValue(city) {
    const normalized = normalizeCityValue(city);
    if (!normalized) {
        cityHiddenInput.value = "";
        citySearchInput.value = "";
        citySearchWrap.classList.remove("has-value");
        return;
    }
    const matched = _cityItems.find((item) => normalizeCityValue(item.value) === normalized);
    if (matched) {
        cityHiddenInput.value = matched.value;
        citySearchInput.value = matched.label;
    } else {
        cityHiddenInput.value = city;
        citySearchInput.value = city;
    }
    citySearchWrap.classList.toggle("has-value", !!cityHiddenInput.value);
}

function populateCityOptions(countryCode, preservedCity = "") {
    _cityItems = getAvailableCitiesByCountry(countryCode);
    const placeholder = currentLocale === "ko"
        ? "도시 검색 또는 입력"
        : currentLocale === "de"
            ? "Stadt suchen oder eingeben"
            : "Search or type a city";
    citySearchInput.placeholder = placeholder;
    cityHiddenInput.value = "";
    citySearchInput.value = "";
    citySearchWrap.classList.remove("has-value");
    closeCityDropdown();
    if (preservedCity) setCityValue(preservedCity);
}

/* ── Dropdown rendering ── */
function formatPopulation(pop) {
    if (!pop) return "";
    if (pop >= 1000000) return `${(pop / 10000).toFixed(0)}만`;
    if (pop >= 10000) return `${(pop / 10000).toFixed(1)}만`;
    return pop.toLocaleString();
}

function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    const escaped = escapeHtml(text);
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return escaped;
    const before = escapeHtml(text.slice(0, idx));
    const match = escapeHtml(text.slice(idx, idx + query.length));
    const after = escapeHtml(text.slice(idx + query.length));
    return `${before}<mark>${match}</mark>${after}`;
}

function renderCityDropdownItems(query = "") {
    const q = query.trim().toLowerCase();
    let filtered = q
        ? _cityItems.filter((item) => item.searchText.includes(q))
        : _cityItems;

    if (filtered.length === 0 && !q) {
        cityDropdown.innerHTML = `<div class="city-empty-msg">${currentLocale === "ko" ? "등록된 도시가 없습니다" : "No cities available"}</div>`;
        return;
    }

    let html = "";
    const hasRegions = filtered.some((item) => item.region);

    if (hasRegions) {
        // Group by region
        const groups = new Map();
        filtered.forEach((item) => {
            const key = item.region || "";
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(item);
        });
        let idx = 0;
        for (const [region, items] of groups) {
            if (region) html += `<div class="city-group-label">${escapeHtml(region)}</div>`;
            items.forEach((item) => {
                const selected = cityHiddenInput.value === item.value ? " selected" : "";
                const popStr = item.pop ? formatPopulation(item.pop) : "";
                html += `<div class="city-option${selected}" data-idx="${idx}" data-value="${escapeHtml(item.value)}">
                    <span class="city-option-name">${highlightMatch(item.label, q)}</span>
                    ${popStr ? `<span class="city-option-pop">${popStr}</span>` : ""}
                </div>`;
                idx++;
            });
        }
    } else {
        filtered.forEach((item, idx) => {
            const selected = cityHiddenInput.value === item.value ? " selected" : "";
            html += `<div class="city-option${selected}" data-idx="${idx}" data-value="${escapeHtml(item.value)}">
                <span class="city-option-name">${highlightMatch(item.label, q)}</span>
            </div>`;
        });
    }

    // Custom search option — always show when user typed something
    if (q) {
        const searchLabel = currentLocale === "ko"
            ? `"${escapeHtml(query.trim())}" 검색하기`
            : `Search for "${escapeHtml(query.trim())}"`;
        html += `<div class="city-option city-option--custom" data-value="${escapeHtml(query.trim())}" data-custom="1">
            <span class="city-search-custom-icon"></span>
            <span class="city-option-name">${searchLabel}</span>
        </div>`;
    }

    cityDropdown.innerHTML = html;
    _cityFocusIdx = -1;
}

function openCityDropdown() {
    if (_cityDropdownOpen) return;
    _cityDropdownOpen = true;
    cityDropdown.classList.remove("hidden");
    citySearchWrap.classList.add("open");
    renderCityDropdownItems(citySearchInput.value);
}

function closeCityDropdown() {
    _cityDropdownOpen = false;
    _cityFocusIdx = -1;
    cityDropdown.classList.add("hidden");
    citySearchWrap.classList.remove("open");
}

function selectCity(value, label) {
    cityHiddenInput.value = value;
    citySearchInput.value = label || value;
    citySearchWrap.classList.toggle("has-value", !!value);
    closeCityDropdown();
    // Trigger downstream updates
    updateStatePreview();
    if (value) {
        updateStepInsight();
        // renderCityProfileCard(); — 넛지 3카드 스킵, 리전 인사이트로 바로 이동
    } else {
        // No city — show guide
        ++latestStep2InsightRequest;
        const selectedMarket = marketOptions.find((m) => m.siteCode === countrySelect.value);
        if (selectedMarket && currentStep === 2) {
            const country = resolveCountry(selectedMarket);
            stepInsight.innerHTML = buildInsightMarkup(buildStep2CitySelectGuide(country.countryCode));
        }
        const profileCard = document.getElementById("city-profile-card");
        if (profileCard) profileCard.classList.add("hidden");
    }
}

function focusCityOption(idx) {
    const options = cityDropdown.querySelectorAll(".city-option");
    if (options.length === 0) return;
    options.forEach((el) => el.classList.remove("focused"));
    if (idx < 0) idx = options.length - 1;
    if (idx >= options.length) idx = 0;
    _cityFocusIdx = idx;
    options[idx].classList.add("focused");
    options[idx].scrollIntoView({ block: "nearest" });
}

function initCitySearchDropdown() {
    // Focus → open dropdown
    citySearchInput.addEventListener("focus", () => {
        openCityDropdown();
        // If has value, select text for easy re-search
        if (cityHiddenInput.value) citySearchInput.select();
    });

    // Input → filter
    citySearchInput.addEventListener("input", () => {
        // Clear selection while typing (will be re-set on pick)
        cityHiddenInput.value = "";
        citySearchWrap.classList.remove("has-value");
        openCityDropdown();
        renderCityDropdownItems(citySearchInput.value);
        updateStatePreview();
    });

    // Keyboard navigation
    citySearchInput.addEventListener("keydown", (e) => {
        if (!_cityDropdownOpen) {
            if (e.key === "ArrowDown" || e.key === "Enter") {
                e.preventDefault();
                openCityDropdown();
            }
            return;
        }
        const options = cityDropdown.querySelectorAll(".city-option");
        if (e.key === "ArrowDown") {
            e.preventDefault();
            focusCityOption(_cityFocusIdx + 1);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            focusCityOption(_cityFocusIdx - 1);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (_cityFocusIdx >= 0 && options[_cityFocusIdx]) {
                const opt = options[_cityFocusIdx];
                selectCity(opt.dataset.value, opt.querySelector(".city-option-name")?.textContent || opt.dataset.value);
            } else {
                // Enter with typed text → use as custom city
                const val = citySearchInput.value.trim();
                if (val) selectCity(val, val);
            }
        } else if (e.key === "Escape") {
            e.preventDefault();
            closeCityDropdown();
            citySearchInput.blur();
        }
    });

    // Click on dropdown item
    cityDropdown.addEventListener("click", (e) => {
        const opt = e.target.closest(".city-option");
        if (!opt) return;
        const val = opt.dataset.value;
        const label = opt.querySelector(".city-option-name")?.textContent || val;
        selectCity(val, opt.dataset.custom ? val : label);
    });

    // Click outside → close
    document.addEventListener("mousedown", (e) => {
        if (_cityDropdownOpen && !citySearchWrap.contains(e.target)) {
            // Restore previous value if nothing selected
            if (!cityHiddenInput.value && citySearchInput.value.trim()) {
                citySearchInput.value = "";
            } else if (cityHiddenInput.value) {
                // Restore display label
                const item = _cityItems.find((i) => i.value === cityHiddenInput.value);
                citySearchInput.value = item ? item.label : cityHiddenInput.value;
            }
            closeCityDropdown();
        }
    });

    // X button → clear
    citySearchIcon.addEventListener("click", (e) => {
        if (citySearchWrap.classList.contains("has-value")) {
            e.stopPropagation();
            selectCity("", "");
            citySearchInput.value = "";
            citySearchInput.focus();
        }
    });
}

function toggleCityCustomInput() {
    // No-op — kept for backward compat
}

function normalizeRoleId(value) {
    const normalized = String(value || "").trim().toLowerCase();
    if (normalized === "retailer") return "retail";
    if (normalized === "dotcom") return "dotcom";
    if (normalized === "brand") return "brand";
    return normalized;
}

function clearRoleSelection() {
    roleSelect.value = "";
    roleCards.forEach((card) => {
        card.classList.remove("selected");
        card.setAttribute("aria-pressed", "false");
    });
}

function setRoleSelection(roleId, options = {}) {
    const normalizedRoleId = normalizeRoleId(roleId);
    const validRoleId = ROLE_LENSES.some((item) => item.id === normalizedRoleId) ? normalizedRoleId : "";
    roleSelect.value = validRoleId;

    roleCards.forEach((card) => {
        const isSelected = normalizeRoleId(card.dataset.role) === validRoleId;
        card.classList.toggle("selected", isSelected);
        card.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });

    updateRoleBrief();
    updateStatePreview();
    updateStepInsight();

    if (options.autoAdvance && validRoleId && currentStep === 1) {
        moveStep(1);
    }
}

function handleRoleCardClick(event) {
    const targetCard = event.target.closest(".role-card");
    if (!targetCard) return;
    setRoleSelection(targetCard.dataset.role, { autoAdvance: true });
}

function handleRoleCardKeydown(event) {
    const targetCard = event.target.closest(".role-card");
    if (!targetCard) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    setRoleSelection(targetCard.dataset.role, { autoAdvance: true });
}

function populateInputs(preserved = {}) {
    const previousRole = normalizeRoleId(preserved.role || roleSelect.value);
    const previousCountry = preserved.country || countrySelect.value;
    const previousCity = preserved.city || getCityValue();
    const previousPersonaSelections = preserved.personaSelections || getSelectedPersonaOptionIds();
    const previousSegmentCustom = preserved.segmentCustom || segmentCustomInput.value;
    const rawDeviceSelections = preserved.deviceSelections || getSelectedDeviceOptionIds();
    const previousDeviceSelections = rawDeviceSelections.length
        ? rawDeviceSelections
        : getDefaultDeviceSelectionsForCountry(previousCountry);
    const previousDeviceCustom = preserved.deviceCustom || deviceCustomInput.value;

    marketOptions = buildMarketOptions();
    countrySelect.innerHTML = marketOptions.map((market) => (
        `<option value="${market.siteCode}">${market.label}</option>`
    )).join("");
    personaGroups.innerHTML = renderChecklistGroups(getLocalizedPersonaGroups(currentLocale, countrySelect.value), previousPersonaSelections, "persona");
    deviceGrid.innerHTML = renderChecklistGroups(getLocalizedDeviceGroups(currentLocale), previousDeviceSelections, "device");

    if (previousRole) {
        setRoleSelection(previousRole);
    } else {
        clearRoleSelection();
    }
    if (previousCountry && marketOptions.some((market) => market.siteCode === previousCountry)) {
        countrySelect.value = previousCountry;
    }
    const selectedMarket = marketOptions.find((market) => market.siteCode === countrySelect.value);
    const selectedCountryCode = resolveCountry(selectedMarket)?.countryCode || "";
    populateCityOptions(selectedCountryCode, previousCity);
    if (previousSegmentCustom) segmentCustomInput.value = previousSegmentCustom;
    if (previousDeviceCustom) deviceCustomInput.value = previousDeviceCustom;
    syncAllChecklistParents(personaGroups);
    syncAllChecklistParents(deviceGrid);
    renderQ4Composer();
}

async function handleUnlock() {
    if (isUnlocking) return;

    const code = accessCodeInput.value.trim();
    if (!code) {
        setAccessStatus("error", "accessRequired");
        return;
    }

    setUnlockBusy(true);
    setAccessStatus("pending", "accessVerifying");

    const verification = await verifyAccessCode(code);
    accessCodeInput.value = "";
    setUnlockBusy(false);

    if (!verification.ok) {
        const key = verification.reason === "locked"
            ? "accessLocked"
            : verification.reason === "invalid"
                ? "accessInvalid"
                : "accessUnavailable";
        if (verification.reason === "locked") {
            startAccessLockout(verification.retryAfterSeconds);
        } else {
            setAccessStatus("error", key, formatInvalidAccessMessage(verification.remainingAttempts, verification.message));
        }
        return;
    }

    setAccessStatus("success", "accessGranted");
    // If provider already chosen in this session, skip provider screen
    selectedProvider = "openai";
    sessionStorage.setItem("aiProvider", "openai");
    sessionStorage.removeItem("aiApiKey");
    showGuideScreen();
}

async function verifyAccessCode(code) {
    try {
        const response = await fetch(ACCESS_API.verifyEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                accessCode: code,
                clientSessionId: accessClientSessionId
            })
        });

        const payload = await response.json().catch(() => null);

        if (response.ok) {
            return {
                ok: Boolean(payload?.ok && payload?.session?.authenticated)
            };
        }

        if (response.status === 401) {
            return {
                ok: false,
                reason: "invalid",
                message: payload?.error?.message || t("accessInvalid"),
                remainingAttempts: Number(payload?.remainingAttempts ?? 0)
            };
        }

        if (response.status === 429) {
            return {
                ok: false,
                reason: "locked",
                message: payload?.error?.message || t("accessLocked"),
                retryAfterSeconds: Number(payload?.retryAfterSeconds || 0)
            };
        }

        return {
            ok: false,
            reason: "unavailable",
            message: payload?.error?.message || t("accessUnavailable")
        };
    } catch {
        return {
            ok: false,
            reason: "unavailable",
            message: t("accessUnavailable")
        };
    }
}

function openWizard() {
    setGuideChoice("yes");
    accessScreen.classList.add("hidden");
    guideScreen.classList.add("hidden");
    wizardScreen.classList.remove("hidden");
    // Q1 직무 선택 스킵 — 기본값 "retail" 자동 설정, Q2부터 시작
    if (!roleSelect.value) {
        roleSelect.value = "retail";
        const defaultCard = roleSelectionContainer?.querySelector('[data-role="retail"]');
        if (defaultCard) {
            roleCards.forEach(c => c.classList.remove("selected"));
            defaultCard.classList.add("selected");
            defaultCard.setAttribute("aria-pressed", "true");
        }
    }
    currentStep = 2;
    syncWizardUi();
    renderOutputPreview();
    wizardScreen.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showGuideCopy() {
    setGuideChoice("no");

    // 질문 헤더, Yes/No 버튼, 로그아웃 영역 숨기기
    const guideHead = guideScreen.querySelector(".guide-head");
    const guideActions = guideScreen.querySelector(".guide-actions");
    const guideSessionRow = guideScreen.querySelector(".guide-session-row");
    if (guideHead) guideHead.classList.add("hidden");
    if (guideActions) guideActions.classList.add("hidden");
    if (guideSessionRow) guideSessionRow.classList.add("hidden");

    guideCopy.innerHTML = buildGuideMarkup();
    guideCopy.classList.remove("hidden");

    const footerStartBtn = document.getElementById("guide-footer-start-btn");
    if (footerStartBtn) {
        footerStartBtn.classList.add("guide-start-pulse");
        footerStartBtn.addEventListener("click", openWizard);
    }

    // 가이드 카드를 화면 맨 위로 스크롤
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function setGuideChoice(choice) {
    guideYesBtn.classList.toggle("active", choice === "yes");
    guideNoBtn.classList.toggle("active", choice === "no");
}

function buildGuideMarkup() {
    return `
        <div class="guide-hero">
            <span class="guide-kicker">Scenario Guide</span>
            <h3>${t("guideHeroTitle")}</h3>
            <p class="guide-lead">${escapeHtml(t("guideLead"))}</p>
        </div>
        <div class="guide-grid">
            <section class="guide-panel">
                <p class="guide-index">01 Inputs</p>
                <h4>${escapeHtml(t("guideInputsTitle"))}</h4>
                <div class="guide-stack">
                    <div class="guide-item"><strong>${escapeHtml(t("guideQ1"))}</strong><span>${escapeHtml(t("guideQ1Desc"))}</span></div>
                    <div class="guide-item"><strong>${escapeHtml(t("guideQ2"))}</strong><span>${escapeHtml(t("guideQ2Desc"))}</span></div>
                    <div class="guide-item"><strong>${escapeHtml(t("guideQ3"))}</strong><span>${escapeHtml(t("guideQ3Desc"))}</span></div>
                </div>
            </section>
            <section class="guide-panel">
                <p class="guide-index">02 Flow</p>
                <h4>${escapeHtml(t("guideFlowTitle"))}</h4>
                <div class="guide-stack">
                    <div class="guide-item"><strong>Step by step</strong><span>${escapeHtml(t("guideFlowStep"))}</span></div>
                    <div class="guide-item"><strong>Lean follow-up</strong><span>${escapeHtml(t("guideFlowLean"))}</span></div>
                    <div class="guide-item"><strong>Clear output</strong><span>${escapeHtml(t("guideFlowClear"))}</span></div>
                </div>
            </section>
        </div>
        <div class="guide-footer">
            <p class="guide-note">${escapeHtml(t("guideNote"))}</p>
            <button type="button" class="generate-btn guide-footer-start-btn" id="guide-footer-start-btn">${currentLocale === "ko" ? "시작" : "Start"}</button>
        </div>
    `;
}

function showGuideScreen() {
    clearAccessLockout();
    clearAccessStatus();
    setGuideChoice("");
    accessScreen.classList.add("hidden");
    aiProviderScreen?.classList.add("hidden");
    guideScreen.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");

    // No로 숨겼던 요소 복원
    const guideHead = guideScreen.querySelector(".guide-head");
    const guideActions = guideScreen.querySelector(".guide-actions");
    const guideSessionRow = guideScreen.querySelector(".guide-session-row");
    if (guideHead) guideHead.classList.remove("hidden");
    if (guideActions) guideActions.classList.remove("hidden");
    if (guideSessionRow) guideSessionRow.classList.remove("hidden");
    guideCopy.classList.add("hidden");
}

async function handleLogout() {
    logoutBtn.disabled = true;
    wizardLogoutBtn.disabled = true;

    try {
        await fetch(ACCESS_API.logoutEndpoint, {
            method: "POST",
            credentials: "include"
        });
    } catch {
        // Even if the network call fails, reset local UI back to the locked state.
    } finally {
        resetToAccessScreen();
        logoutBtn.disabled = false;
        wizardLogoutBtn.disabled = false;
    }
}

function setAccessStatus(variant, key, message = "") {
    accessStatus.className = `access-status ${variant}`;
    accessStatus.dataset.key = key;
    accessStatus.textContent = message || t(key);
}

function clearAccessStatus() {
    accessStatus.className = "access-status hidden";
    accessStatus.dataset.key = "";
    accessStatus.textContent = "";
}

function setUnlockBusy(isBusy) {
    isUnlocking = isBusy;
    syncAccessControlState();
}

function resetToAccessScreen() {
    clearAccessLockout();
    guideScreen.classList.add("hidden");
    wizardScreen.classList.add("hidden");
    aiProviderScreen?.classList.add("hidden");
    sessionStorage.setItem("aiProvider", "openai");
    sessionStorage.removeItem("aiApiKey");
    selectedProvider = "openai";
    guideCopy.classList.add("hidden");
    if (guideContinueBtn) guideContinueBtn.classList.add("hidden");
    setGuideChoice("");
    accessScreen.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    guideCopy.innerHTML = "";
    currentStep = 2;
    latestPayload = null;
    if (marketOptions[0]) countrySelect.value = marketOptions[0].siteCode;
    const defaultCountryCode = resolveCountry(marketOptions[0])?.countryCode || "";
    populateCityOptions(defaultCountryCode, "");
    personaGroups.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach((input) => {
        input.checked = false;
    });
    personaGroups.querySelectorAll('.tree-custom-input').forEach((input) => { input.value = ""; });
    segmentCustomInput.value = "";
    purposeInput.value = "";
    deviceGrid.querySelectorAll('input[type="checkbox"]').forEach((input) => {
        input.checked = false;
    });
    deviceCustomInput.value = "";
    syncAllChecklistParents(personaGroups);
    syncAllChecklistParents(deviceGrid);
    updateLocaleFromCountry();
    updateRoleBrief();
    syncWizardUi();
    updateStatePreview();
    accessCodeInput.value = "";
    setUnlockBusy(false);
    clearAccessStatus();
    setAccessStatus("success", "loggedOut");
    renderOutputPreview();
}

function formatLockoutMessage(retryAfterSeconds, fallbackMessage = "") {
    const seconds = Number(retryAfterSeconds || 0);
    if (!seconds) return fallbackMessage || t("accessLocked");

    return t("accessLockedNewWindow").replace("{time}", formatDuration(seconds));
}

function formatDuration(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes <= 0) {
        return currentLocale === "ko"
            ? `${seconds}초`
            : currentLocale === "de"
                ? `${seconds} Sek.`
                : `${seconds}s`;
    }

    return currentLocale === "ko"
        ? `${minutes}분 ${seconds}초`
        : currentLocale === "de"
            ? `${minutes} Min. ${seconds} Sek.`
            : `${minutes}m ${seconds}s`;
}

function formatInvalidAccessMessage(remainingAttempts, fallbackMessage = "") {
    const remaining = Number(remainingAttempts);
    if (Number.isFinite(remaining) && remaining > 0) {
        return t("accessInvalidRemaining").replace("{count}", String(remaining));
    }

    return fallbackMessage || t("accessInvalid");
}

function ensureAccessClientSessionId() {
    try {
        const existing = window.sessionStorage.getItem(ACCESS_CLIENT_SESSION_KEY);
        if (existing) return existing;

        const next = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        window.sessionStorage.setItem(ACCESS_CLIENT_SESSION_KEY, next);
        return next;
    } catch {
        return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }
}

function startAccessLockout(retryAfterSeconds) {
    const seconds = Number(retryAfterSeconds || 0);
    if (!seconds) {
        setAccessStatus("error", "accessLocked");
        return;
    }

    clearAccessLockout();
    isAccessLocked = true;
    accessLockoutEndsAt = Date.now() + seconds * 1000;
    syncAccessControlState();
    updateAccessLockoutStatus();
    accessLockoutTimerId = window.setInterval(updateAccessLockoutStatus, 1000);
}

function clearAccessLockout() {
    isAccessLocked = false;
    accessLockoutEndsAt = 0;
    if (accessLockoutTimerId) {
        window.clearInterval(accessLockoutTimerId);
        accessLockoutTimerId = null;
    }
    syncAccessControlState();
}

function updateAccessLockoutStatus() {
    const remainingSeconds = Math.max(0, Math.ceil((accessLockoutEndsAt - Date.now()) / 1000));

    if (!remainingSeconds) {
        clearAccessLockout();
        clearAccessStatus();
        return;
    }

    setAccessStatus("error", "accessLockedWithTime", formatLockoutMessage(remainingSeconds));
}

function syncAccessControlState() {
    const isDisabled = isUnlocking || isAccessLocked;
    unlockBtn.disabled = isDisabled;
    accessCodeInput.disabled = isDisabled;
    accessToggleBtn.disabled = isDisabled;
}

function renderWizardProgress() {
    // Q1 스킵 — Q2(2), Q3(3), Q4(4)만 표시
    const steps = [
        { label: t("progress2"), step: 2 },
        { label: t("progress3"), step: 3 },
        { label: t("progress4"), step: 4 }
    ];
    document.getElementById("wizard-progress").innerHTML = steps.map(({ label, step }) => {
        const state = step === currentStep ? "current" : step < currentStep ? "done" : "";
        return `<div class="progress-pill ${state}">${label}</div>`;
    }).join("");
}

function updateStepInsight() {
    if (currentStep === 1) {
        stepInsight.classList.add("hidden");
        updateQuestionHelpers();
        return;
    }

    if (currentStep === 2) {
        renderStep2Insight();
        return;
    }

    stepInsight.classList.remove("hidden");
    const insight = getStepInsight();
    stepInsight.innerHTML = buildInsightMarkup(insight);
    bindQ2EvidenceToggles(stepInsight);
    bindInsightRetryButton(stepInsight);
    bindLegendHelpButton(stepInsight);
    updateQuestionHelpers();
    stepInsight.classList.remove("insight-refresh");
    void stepInsight.offsetWidth;
    stepInsight.classList.add("insight-refresh");
}

function getStepInsight() {
    if (currentStep === 1) return buildStep1Insight();
    if (currentStep === 2) return buildStep2Insight();
    if (currentStep === 3) return buildStep3Insight();
    if (currentStep === 4) return buildStep4Insight();
    return STEP_INSIGHTS[currentStep];
}

function bindEvidenceChips(container) {
    container.querySelectorAll(".insight-evidence-chip[data-ev-detail]").forEach((chip) => {
        chip.addEventListener("click", () => {
            const detailId = chip.dataset.evDetail;
            const detail = document.getElementById(detailId);
            if (!detail) return;
            const isOpen = detail.classList.contains("open");
            // close all
            container.querySelectorAll(".insight-evidence-detail.open").forEach((d) => d.classList.remove("open"));
            container.querySelectorAll(".insight-evidence-chip.active").forEach((c) => c.classList.remove("active"));
            if (!isOpen) {
                detail.classList.add("open");
                chip.classList.add("active");
            }
        });
    });
}

function bindSourceTags(container) {
    container.querySelectorAll(".source-tag[data-source-detail]").forEach((tag) => {
        tag.addEventListener("click", () => {
            const detailId = tag.dataset.sourceDetail;
            const detail = document.getElementById(detailId);
            if (!detail) return;
            const isOpen = detail.classList.contains("open");
            // close all in this container
            container.querySelectorAll(".source-detail.open").forEach((d) => d.classList.remove("open"));
            container.querySelectorAll(".source-tag.active").forEach((t) => t.classList.remove("active"));
            if (!isOpen) {
                detail.classList.add("open");
                tag.classList.add("active");
            }
        });
    });
}

/** Q2 Hybrid 카드 — 근거 보기 아코디언 바인딩 */
function bindQ2EvidenceToggles(container) {
    container.querySelectorAll(".q2-evidence-toggle[data-ev-target]").forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.dataset.evTarget;
            const detail = document.getElementById(targetId);
            if (!detail) return;
            const isOpen = detail.classList.contains("open");
            // 같은 레이어 내 모든 열린 디테일 닫기
            const layer = btn.closest(".q2-layer") || container;
            layer.querySelectorAll(".q2-evidence-detail.open").forEach(d => d.classList.remove("open"));
            layer.querySelectorAll(".q2-evidence-toggle.active").forEach(b => b.classList.remove("active"));
            if (!isOpen) {
                detail.classList.add("open");
                btn.classList.add("active");
            }
        });
    });
}

/** 스코어보드 범례 도움말 팝업 바인딩 */
function bindLegendHelpButton(container) {
    const helpBtn = container.querySelector("#q2-legend-help-btn");
    if (!helpBtn) return;
    helpBtn.addEventListener("click", () => {
        showLegendHelpPopup();
    });
}

function showLegendHelpPopup() {
    // 기존 팝업이 있으면 제거
    const existing = document.getElementById("legend-help-overlay");
    if (existing) { existing.remove(); return; }

    const isKo = currentLocale === "ko";

    const content = isKo ? `
        <div class="legend-help-popup">
            <div class="legend-help-header">
                <h3>스코어보드 범례 보는 방법</h3>
                <button type="button" class="legend-help-close" id="legend-help-close">&times;</button>
            </div>
            <div class="legend-help-body">
                <section class="legend-help-section">
                    <h4>막대 바 (2열 구조)</h4>
                    <p>각 Explore 태그 옆에 <strong>2개의 막대</strong>가 표시됩니다.</p>
                    <div class="legend-help-table">
                        <div class="legend-help-row">
                            <span class="legend-help-bar-sample q2-score-bar--q1"></span>
                            <span><strong>좌측 (파랑)</strong> — Q1 도시 맥락 점수</span>
                        </div>
                        <div class="legend-help-desc">선택한 도시의 기후, 인프라, 거주 형태 등에서 추론된 점수</div>
                        <div class="legend-help-row">
                            <span class="legend-help-bar-sample q2-score-bar--q2"></span>
                            <span><strong>우측 (초록)</strong> — Q2 생활 맥락 점수</span>
                        </div>
                        <div class="legend-help-desc">세대 구성, 라이프스테이지, 생활 패턴 등 직접 선택한 항목에서 부여된 점수</div>
                    </div>
                    <div class="legend-help-example">
                        <p class="legend-help-example-title">예시: "에너지 절약" 태그</p>
                        <ul>
                            <li><span class="legend-help-bar-sample q2-score-bar--q1" style="width:60px"></span> Q1 파란 바가 길다 → 도시 프로필에서 "에너지 비용이 높은 지역"이라는 신호가 잡혀서 높은 점수</li>
                            <li><span class="legend-help-bar-sample q2-score-bar--q2" style="width:20px"></span> Q2 초록 바가 짧다 → Q2에서 에너지 관련 선택을 하지 않아 낮은 점수</li>
                        </ul>
                        <p class="legend-help-example-title">예시: "가족 돌봄" 태그</p>
                        <ul>
                            <li><span class="legend-help-bar-sample q2-score-bar--q1" style="width:10px"></span> Q1 바가 짧음 → 도시 자체에서는 가족 돌봄 신호가 약함</li>
                            <li><span class="legend-help-bar-sample q2-score-bar--q2" style="width:70px"></span> Q2 바가 길다 → 영유아 자녀 가구 + 맞벌이를 선택해서 높은 점수</li>
                        </ul>
                    </div>
                </section>

                <section class="legend-help-section">
                    <h4>색상 점 (클러스터 분류)</h4>
                    <p>각 태그는 아래 <strong>5개 클러스터</strong> 중 하나에 속합니다. 같은 클러스터에 신호가 2개 이상이면 시너지(x1.2)가 적용됩니다.</p>
                    <div class="legend-help-clusters">
                        <div class="legend-help-cluster"><span class="q2-legend-dot" style="background:#dc2626"></span> <strong>패밀리 케어</strong> — 아이 돌봄, 시니어 케어, 가족 돌봄</div>
                        <div class="legend-help-cluster"><span class="q2-legend-dot" style="background:#ea580c"></span> <strong>시간·효율</strong> — 가사 도움, 시간 절약, 간편 사용</div>
                        <div class="legend-help-cluster"><span class="q2-legend-dot" style="background:#d97706"></span> <strong>절약·비용</strong> — 에너지 절약, 에너지 절감</div>
                        <div class="legend-help-cluster"><span class="q2-legend-dot" style="background:#16a34a"></span> <strong>건강·여가</strong> — 건강 관리, 숙면 도움, 분위기 연출</div>
                        <div class="legend-help-cluster"><span class="q2-legend-dot" style="background:#2563eb"></span> <strong>안전·보안</strong> — 집 안전, 보안, 분실물 찾기</div>
                    </div>
                </section>

                <section class="legend-help-section">
                    <h4>교차검증 x1.5</h4>
                    <p>Q1(도시)과 Q2(생활) <strong>양쪽에서 같은 태그가 도출</strong>되면 교차검증 배지가 붙고 점수가 <strong>1.5배</strong>로 가산됩니다.</p>
                    <div class="legend-help-example">
                        <p class="legend-help-example-title">예시</p>
                        <ul>
                            <li>서울 선택 → Q1에서 "공기질 관리" 도출 (미세먼지 신호)</li>
                            <li>Q2에서 "쾌적한 공기" 테마도 선택</li>
                            <li>→ "Keep the air fresh" 태그에 <span class="q2-corro-badge" style="font-size:0.6rem">교차검증 ×1.5</span> 적용</li>
                        </ul>
                    </div>
                </section>

                <section class="legend-help-section">
                    <h4>종합 읽기</h4>
                    <div class="legend-help-example" style="background:#f0f4ff">
                        <p style="font-family:monospace;font-size:0.75rem;line-height:1.8;margin:0">
                            <strong>"Keep your home safe" (홈 안전·보안)</strong><br>
                            <span class="legend-help-bar-sample q2-score-bar--q1" style="width:40px"></span> Q1: 8점 — 도시에 빈집 보안 이슈 신호<br>
                            <span class="legend-help-bar-sample q2-score-bar--q2" style="width:70px"></span> Q2: 14점 — 장시간 부재 + 시니어 케어 선택<br>
                            <span class="q2-legend-dot" style="background:#2563eb;vertical-align:middle"></span> 안전·보안 클러스터<br>
                            <span class="q2-corro-badge" style="font-size:0.6rem">교차검증 ×1.5</span> → 최종: (8+14) × 1.5 = <strong>33점</strong>
                        </p>
                    </div>
                    <p style="margin-top:8px;color:#666;font-size:0.75rem">두 열의 비율을 보면 "이 시나리오가 도시 특성 때문에 올라온 건지, 내가 선택한 생활 맥락 때문인지"를 바로 파악할 수 있습니다.</p>
                </section>
            </div>
        </div>
    ` : `
        <div class="legend-help-popup">
            <div class="legend-help-header">
                <h3>How to Read the Scoreboard</h3>
                <button type="button" class="legend-help-close" id="legend-help-close">&times;</button>
            </div>
            <div class="legend-help-body">
                <section class="legend-help-section">
                    <h4>Bar Chart (2 columns)</h4>
                    <p>Each Explore tag shows <strong>two bars</strong> representing the source of its score.</p>
                    <div class="legend-help-table">
                        <div class="legend-help-row">
                            <span class="legend-help-bar-sample q2-score-bar--q1"></span>
                            <span><strong>Left (blue)</strong> — Q1 City Context score</span>
                        </div>
                        <div class="legend-help-desc">Score inferred from city climate, infrastructure, and housing</div>
                        <div class="legend-help-row">
                            <span class="legend-help-bar-sample q2-score-bar--q2"></span>
                            <span><strong>Right (green)</strong> — Q2 Lifestyle score</span>
                        </div>
                        <div class="legend-help-desc">Score from your household, life stage, and lifestyle selections</div>
                    </div>
                </section>
                <section class="legend-help-section">
                    <h4>Color Dots (Clusters)</h4>
                    <div class="legend-help-clusters">
                        <div class="legend-help-cluster"><span class="q2-legend-dot" style="background:#dc2626"></span> <strong>Family Care</strong></div>
                        <div class="legend-help-cluster"><span class="q2-legend-dot" style="background:#ea580c"></span> <strong>Time & Efficiency</strong></div>
                        <div class="legend-help-cluster"><span class="q2-legend-dot" style="background:#d97706"></span> <strong>Savings</strong></div>
                        <div class="legend-help-cluster"><span class="q2-legend-dot" style="background:#16a34a"></span> <strong>Health & Leisure</strong></div>
                        <div class="legend-help-cluster"><span class="q2-legend-dot" style="background:#2563eb"></span> <strong>Security</strong></div>
                    </div>
                    <p>2+ signals in the same cluster get a synergy boost (x1.2).</p>
                </section>
                <section class="legend-help-section">
                    <h4>Cross-validated x1.5</h4>
                    <p>When the <strong>same tag appears from both Q1 and Q2</strong>, it receives a 1.5x score multiplier.</p>
                </section>
            </div>
        </div>
    `;

    const overlay = document.createElement("div");
    overlay.id = "legend-help-overlay";
    overlay.className = "legend-help-overlay";
    overlay.innerHTML = content;
    document.body.appendChild(overlay);

    // 닫기 이벤트
    overlay.querySelector("#legend-help-close")?.addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.remove();
    });
    // ESC 키로 닫기
    const escHandler = (e) => {
        if (e.key === "Escape") { overlay.remove(); document.removeEventListener("keydown", escHandler); }
    };
    document.addEventListener("keydown", escHandler);
}

/** 피자 원형 프로그레스를 0~100%로 업데이트 */
function updatePizzaProgress(container, pct) {
    const wedge = container.querySelector("[data-pizza-wedge]");
    const label = container.querySelector("[data-pizza-pct]");
    if (!wedge) return;
    const clamped = Math.min(100, Math.max(0, pct));
    const cx = 20, cy = 20, r = 18;
    if (clamped <= 0) {
        wedge.setAttribute("d", "");
    } else if (clamped >= 100) {
        // 완전한 원
        wedge.setAttribute("d",
            `M${cx},${cy - r} A${r},${r} 0 1,1 ${cx - 0.001},${cy - r} Z`);
    } else {
        const angle = (clamped / 100) * 360;
        const rad = (angle - 90) * Math.PI / 180;
        const x = cx + r * Math.cos(rad);
        const y = cy + r * Math.sin(rad);
        const large = angle > 180 ? 1 : 0;
        wedge.setAttribute("d",
            `M${cx},${cy} L${cx},${cy - r} A${r},${r} 0 ${large},1 ${x.toFixed(2)},${y.toFixed(2)} Z`);
    }
    if (label) label.textContent = `${Math.round(clamped)}%`;
}

function buildInsightMarkup(insight) {
    const badge = insight.badge ? `<span class="insight-badge">${escapeHtml(insight.badge)}</span>` : "";
    const summary = insight.summary ? `<p class="insight-summary">${escapeHtml(insight.summary)}</p>` : "";
    const body = insight.body ? `<p class="insight-body">${escapeHtml(insight.body)}</p>` : "";
    const spotlight = insight.spotlight ? `<p class="insight-spotlight">${escapeHtml(insight.spotlight)}</p>` : "";
    const loading = insight.loading
        ? `<div class="insight-loading" role="status" aria-live="polite">
               <div class="pizza-spinner" aria-hidden="true">
                   <svg viewBox="0 0 40 40" class="pizza-svg">
                       <circle cx="20" cy="20" r="18" class="pizza-track"/>
                       <path d="" class="pizza-wedge" data-pizza-wedge/>
                   </svg>
                   <span class="pizza-pct" data-pizza-pct>0%</span>
               </div>
               <span class="pizza-label">${escapeHtml(insight.loadingLabel || "Loading")}</span>
           </div>`
        : "";
    const chips = Array.isArray(insight.chips) && insight.chips.length
        ? `<div class="insight-chips">${insight.chips.map((chip) => `<span class="insight-chip">${escapeHtml(chip)}</span>`).join("")}</div>`
        : "";
    const rows = Array.isArray(insight.rows) && insight.rows.length
        ? insight.rows.map((row) => `
            <div class="insight-row">
                <span class="insight-label">${escapeHtml(row.label)}</span>
                <p>${escapeHtml(row.value)}</p>
            </div>
        `).join("")
        : [
            insight.action ? {
                label: currentLocale === "ko" ? "다음 액션" : currentLocale === "de" ? "Nächster Schritt" : "Next move",
                value: insight.action
            } : null,
            insight.signal ? {
                label: currentLocale === "ko" ? "현재 신호" : currentLocale === "de" ? "Aktuelles Signal" : "Current signal",
                value: insight.signal
            } : null
        ].filter(Boolean).map((row) => `
            <div class="insight-row">
                <span class="insight-label">${escapeHtml(row.label)}</span>
                <p>${escapeHtml(row.value)}</p>
            </div>
        `).join("");
    // [Source] {Title} — {Publisher/Org}, {YYYY-MM-DD}. {짧은 도메인 URL}
    const formatSourceCitation = (item) => {
        const title = String(item.source_title || "").trim();
        const org = String(item.source_org || "").trim();
        const date = String(item.source_date || "").trim();
        const rawUrl = String(item.source_url || "").trim();
        if (!title && !org) return "";
        const shortDomain = rawUrl ? rawUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "") : "";
        const linkUrl = rawUrl || `https://www.google.com/search?q=${encodeURIComponent([title, org, date].filter(Boolean).join(" "))}`;
        // 인라인 출처 텍스트
        const parts = [];
        if (title) parts.push(title);
        if (org) parts.push(`— ${org}`);
        if (date) parts.push(date);
        const citation = parts.join(", ");
        // 도메인 태그 (클릭 시 원문으로 이동)
        const domainLabel = shortDomain || org || "source";
        const domainTag = `<a class="evidence-source-tag" href="${escapeHtml(linkUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(domainLabel)}</a>`;
        return `<span class="trend-source-line">[Source] ${escapeHtml(citation)} ${domainTag}</span>`;
    };

    // 섹션별 각주 수집기
    let _footnotes = [];
    let _footnoteIdx = 0;

    const addFootnote = (item) => {
        const title = String(item.source_title || "").trim();
        const org = String(item.source_org || "").trim();
        const date = String(item.source_date || "").trim();
        const rawUrl = String(item.source_url || "").trim();
        if (!title && !org) return "";
        _footnoteIdx++;
        const parts = [];
        if (title) parts.push(title);
        if (org) parts.push(`— ${org}`);
        if (date) parts.push(date);
        const shortDomain = rawUrl ? rawUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "") : "";
        const linkUrl = rawUrl || `https://www.google.com/search?q=${encodeURIComponent([title, org].filter(Boolean).join(" "))}`;
        const domainTag = `<a class="evidence-source-tag" href="${escapeHtml(linkUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(shortDomain || org || "source")}</a>`;
        _footnotes.push({ idx: _footnoteIdx, text: parts.join(", "), domainTag });
        return `<sup class="trend-footnote-ref">${_footnoteIdx}</sup>`;
    };

    const renderFootnoteBlock = () => {
        if (!_footnotes.length) return "";
        const block = `<div class="trend-footnotes">${_footnotes.map((f) =>
            `<p class="trend-footnote-item"><sup>${f.idx}</sup> ${escapeHtml(f.text)} ${f.domainTag}</p>`
        ).join("")}</div>`;
        _footnotes = [];
        _footnoteIdx = 0;
        return block;
    };

    const renderSection = (section) => {
        const text = section.text ? `<p>${escapeHtml(section.text)}</p>` : "";
        const items = Array.isArray(section.items) && section.items.length
            ? `<ul>${section.items.map((item) => {
                if (item && typeof item === "object") {
                    const label = escapeHtml(item.text || "");
                    const evidenceText = String(item.evidence || "").trim();
                    const footnoteRef = addFootnote(item);
                    const evidenceHtml = evidenceText
                        ? `<span class="trend-evidence">${escapeHtml(evidenceText)}</span>`
                        : "";
                    return `<li>${label}${footnoteRef}${evidenceHtml}</li>`;
                }
                // pains/solutions: "text\n💡 insight" 형태 지원
                if (typeof item === "string" && item.includes("\n💡")) {
                    const [mainText, ...insightParts] = item.split("\n💡");
                    const insightText = insightParts.join("\n💡").trim();
                    return `<li>${escapeHtml(mainText)}${insightText ? `<span class="trend-evidence">💡 ${escapeHtml(insightText)}</span>` : ""}</li>`;
                }
                return `<li>${escapeHtml(item)}</li>`;
            }).join("")}</ul>`
            : "";
        const footnotes = renderFootnoteBlock();
        return `
            <section class="insight-section">
                <h4>${section.title || ""}</h4>
                ${text}
                ${items}
                ${footnotes}
            </section>
        `;
    };
    const evidence = !insight.hideEvidence && Array.isArray(insight.evidence) && insight.evidence.length
        ? `<div class="insight-evidence">${insight.evidence.map((item, idx) => {
            const detailId = `ev-detail-${idx}-${Date.now()}`;
            const domainLabel = (item.source_domain || "").replace(/^https?:\/\//, "").replace(/\/.*$/, "");
            const confidenceBadge = item.confidence === "high" ? "✅" : item.confidence === "medium" ? "⚠️" : "ℹ️";
            const sourceUrl = item.source_url || "";
            const urlLink = sourceUrl
                ? `<a class="source-detail-url" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">🔗 ${escapeHtml(sourceUrl.length > 80 ? sourceUrl.slice(0, 80) + "…" : sourceUrl)}</a>`
                : "";
            return `
                <span class="insight-evidence-chip" data-ev-detail="${detailId}">
                    ${escapeHtml(domainLabel)} ${confidenceBadge}
                </span>
                <div class="insight-evidence-detail" id="${detailId}">
                    <p class="source-detail-label">${escapeHtml(item.title || domainLabel)}</p>
                    <p class="source-detail-snippet">${escapeHtml(item.snippet || "—")}</p>
                    <p class="source-detail-meta">${currentLocale === "ko" ? "신뢰도" : "Confidence"}: ${confidenceBadge} ${escapeHtml(item.confidence || "—")} · ${escapeHtml(item.collected_at_utc ? new Date(item.collected_at_utc).toLocaleString() : "—")}</p>
                    ${urlLink}
                </div>
            `;
        }).join("")}</div>`
        : "";
    const action = insight.retry
        ? `<button type="button" id="region-insight-retry" class="secondary-btn insight-retry-btn">${escapeHtml(insight.retryLabel || "Retry")}</button>`
        : "";
    const mediaItems = Array.isArray(insight.media) ? insight.media : [];
    const renderMediaCard = (item, extraClass = "") => `
        <article class="insight-media-card ${item.kind === "map" ? "is-map" : ""} ${extraClass}">
            <img
                src="${escapeHtml(item.imageUrl || "")}"
                data-fallback-src="${escapeHtml(item.fallbackUrl || "")}"
                alt="${escapeHtml(item.alt || "Insight image")}"
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
                onerror="if(this.dataset.fallbackSrc&&this.src!==this.dataset.fallbackSrc){this.src=this.dataset.fallbackSrc}else{this.classList.add('image-broken')}"
            >
            ${item.kind === "map" ? '<div class="insight-map-focus" aria-hidden="true"></div>' : ""}
            ${item.topRightText ? `<p class="insight-media-top-right">${escapeHtml(item.topRightText)}</p>` : ""}
            ${item.caption ? `<p class="insight-media-caption">${escapeHtml(item.caption)}</p>` : ""}
        </article>
    `;
    const sectionMarkup = Array.isArray(insight.sections) && insight.sections.length
        ? `<div class="insight-sections">${insight.sections.map((section) => renderSection(section)).join("")}</div>`
        : "";
    const isQ2Insight = String(insight.badge || "").toLowerCase().includes("q2");
    const useStep2AdaptiveLayout = isQ2Insight && mediaItems.length > 0 && Array.isArray(insight.sections) && insight.sections.length >= 3;
    const useStep2GalleryLayout = isQ2Insight && mediaItems.length > 0 && !!sectionMarkup && !useStep2AdaptiveLayout;
    const media = mediaItems.length && !useStep2GalleryLayout
        ? `<div class="insight-media-grid">${mediaItems.map((item) => renderMediaCard(item)).join("")}</div>`
        : "";
    const contentBlock = useStep2GalleryLayout
        ? `
            <div class="insight-content-grid">
                <div class="insight-text-content">
                    ${sectionMarkup}
                    <div class="insight-grid">${rows}</div>
                </div>
                <div class="insight-image-gallery">
                    ${mediaItems.map((item) => renderMediaCard(item, "insight-media-card-gallery")).join("")}
                </div>
            </div>
        `
        : (useStep2AdaptiveLayout
            ? `
                <div class="insight-sections insight-sections-adaptive">
                    ${renderSection(insight.sections[0])}
                    <div class="insight-adaptive-row">
                        <div class="insight-adaptive-left">
                            ${renderSection(insight.sections[1])}
                            ${renderSection(insight.sections[2])}
                        </div>
                        <div class="insight-image-gallery insight-image-gallery-adaptive">
                            ${mediaItems.slice(0, 3).map((item, index) => renderMediaCard(item, `insight-media-card-adaptive insight-media-card-adaptive-${index + 1} ${item.orientation === "portrait" ? "is-portrait" : "is-landscape"}`)).join("")}
                        </div>
                    </div>
                    ${insight.sections.slice(3).map((section) => renderSection(section)).join("")}
                </div>
                <div class="insight-grid">${rows}</div>
            `
            : `
                ${sectionMarkup}
                <div class="insight-grid">${rows}</div>
            `);

    // customHtml이 있으면 전용 렌더링
    if (insight.customHtml) {
        return `
            <div class="insight-head">
                ${badge}
                <strong>${insight.title}</strong>
            </div>
            ${summary}
            ${insight.customHtml}
        `;
    }

    return `
        <div class="insight-head">
            ${badge}
            <strong>${insight.title}</strong>
        </div>
        ${useStep2AdaptiveLayout ? "" : media}
        ${summary}
        ${body}
        ${loading}
        ${spotlight}
        ${chips}
        ${contentBlock}
        ${evidence}
        ${action}
    `;
}

function buildStep1Insight() {
    const role = ROLE_LENSES.find((item) => item.id === roleSelect.value);
    if (!role) return STEP_INSIGHTS[1];

    return {
        badge: currentLocale === "ko" ? "Q1 Lens" : currentLocale === "de" ? "Q1 Perspektive" : "Q1 Lens",
        title: currentLocale === "ko" ? `${getRoleTitle(role.id)} 관점에서는 이런 흐름이 유리합니다` : currentLocale === "de" ? `Aus der Perspektive ${getRoleTitle(role.id)} wirkt dieser Aufbau stärker` : `${getRoleTitle(role.id)} is likely to respond better to this flow`,
        summary: currentLocale === "ko"
            ? `${getRoleFocus(role.id)} 기준으로 결과물의 구조를 먼저 정렬했습니다.`
            : currentLocale === "de"
                ? `Die Ergebnisstruktur wurde zuerst an ${getRoleFocus(role.id)} ausgerichtet.`
                : `The output structure is now aligned to ${getRoleFocus(role.id)} first.`,
        body: currentLocale === "ko"
            ? `${getRoleFocus(role.id)} 관점에서는 기능 소개보다 ${getRoleBrief(role.id).replace(".", "")} 흐름이 더 설득력 있습니다. 다음 단계에서는 이 관점에 맞는 지역과 타겟을 잡아보면 됩니다.`
            : currentLocale === "de"
                ? `Aus Sicht von ${getRoleFocus(role.id)} ist dieser Aufbau meist überzeugender: ${getRoleBrief(role.id)} Als Nächstes lohnt es sich, Markt und Zielgruppe passend dazu einzugrenzen.`
                : `From a ${getRoleFocus(role.id)} perspective, this path is usually stronger: ${getRoleBrief(role.id)} Next, narrow the market and audience to match that lens.`,
        spotlight: currentLocale === "ko"
            ? `${getRoleTitle(role.id)}는 결과물의 첫 문장과 정보 밀도를 결정합니다.`
            : currentLocale === "de"
                ? `${getRoleTitle(role.id)} bestimmt den ersten Satz und die Informationsdichte des Ergebnisses.`
                : `${getRoleTitle(role.id)} will shape the first line and information density of the output.`,
        chips: [getRoleTitle(role.id), getRoleFocus(role.id)],
        rows: [
            {
                label: currentLocale === "ko" ? "강하게 가야 할 포인트" : currentLocale === "de" ? "Stärker betonen" : "Lean into",
                value: currentLocale === "ko"
                    ? getRoleBrief(role.id)
                    : currentLocale === "de"
                        ? getRoleBrief(role.id)
                        : getRoleBrief(role.id)
            },
            {
                label: currentLocale === "ko" ? "다음에 정할 것" : currentLocale === "de" ? "Als Nächstes festlegen" : "Next decision",
                value: currentLocale === "ko"
                    ? "Q1에서 국가와 도시를 구체화해 이 관점이 가장 잘 먹히는 장면을 좁혀보세요."
                    : currentLocale === "de"
                        ? "Präzisieren Sie in Q1 Land und Region, damit der stärkste Nutzungsmoment klarer wird."
                        : "Use Q1 to narrow the country and city so the strongest usage moment becomes clearer."
            }
        ]
    };
}

function buildStep2Insight() {
    return {
        badge: currentLocale === "ko" ? "Q1 Region" : "Q1 Region",
        title: currentLocale === "ko" ? "국가와 도시를 선택해 주세요" : "Select a country and city",
        summary: currentLocale === "ko"
            ? "도시를 선택하면 기본 지역 프로필이 표시됩니다. 상세 인사이트는 Build 시 AI가 자동 수집합니다."
            : "Select a city to see its basic profile. Detailed insights will be collected by AI during Build."
    };
}

function buildStep2CitySelectGuide(countryCode) {
    const countryName = getCountryName(countryCode);
    return {
        badge: currentLocale === "ko" ? "Q1 City" : "Q1 City",
        title: currentLocale === "ko"
            ? `${countryName} 도시를 선택해 주세요`
            : `Select a city in ${countryName}`,
        summary: currentLocale === "ko"
            ? "도시를 선택하면 해당 국가+도시 기준의 역할별 실무 인사이트가 바로 표시됩니다."
            : "Choose a city to load role-specific execution insight for that country and city."
    };
}

async function renderStep2Insight(forceRefresh = false) {
    // Q1(step 2)이 아니면 렌더링하지 않음
    if (currentStep !== 2) return;
    stepInsight.classList.remove("hidden");
    const selectedMarket = marketOptions.find((market) => market.siteCode === countrySelect.value);
    if (!selectedMarket) {
        stepInsight.innerHTML = buildInsightMarkup(STEP_INSIGHTS[2]);
        return;
    }

    const requestId = ++latestStep2InsightRequest;
    const country = resolveCountry(selectedMarket);
    const city = getCityValue();

    if (!city) {
        stepInsight.innerHTML = buildInsightMarkup(buildStep2CitySelectGuide(country.countryCode));
        return;
    }

    const localCity = getCityDisplayValue(country.countryCode, city) || city;
    const countryName = selectedMarket?.label || getCountryName(country.countryCode);

    // 1. sessionStorage 캐시 확인
    const cacheKey = `city-profile-${country.countryCode}-${city}-${currentLocale}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached && !forceRefresh) {
        try {
            const profile = JSON.parse(cached);
            if (currentStep !== 2) return;
            stepInsight.innerHTML = renderCityProfileInsight(countryName, localCity, profile);
            bindCityProfileDrawer(stepInsight);
            updateQuestionHelpers();
            // 프로필 로드 후 다음 버튼이 보이도록 스크롤
            requestAnimationFrame(() => {
                const wizardActions = document.querySelector(".wizard-actions");
                if (wizardActions) wizardActions.scrollIntoView({ behavior: "smooth", block: "end" });
            });
            return;
        } catch { /* cache invalid, fetch fresh */ }
    }

    // 2. 로딩 표시
    if (currentStep !== 2) return;
    stepInsight.innerHTML = buildInsightMarkup({
        badge: "Q1 Region",
        title: `${countryName} ${localCity}`,
        summary: currentLocale === "ko"
            ? "AI를 통한 마켓 리서치 중입니다..."
            : "AI market research in progress...",
        loading: true,
        loadingLabel: currentLocale === "ko" ? "AI를 통한 마켓 리서치 중..." : "AI market research in progress..."
    });
    updateQuestionHelpers();

    // 피자 프로그레스 시뮬레이션 (0→90% 구간을 서서히 채움)
    let pizzaProgress = 0;
    let pizzaDone = false;
    const pizzaInterval = setInterval(() => {
        if (pizzaDone || currentStep !== 2) { clearInterval(pizzaInterval); return; }
        // 점점 느려지며 90%까지 접근 (30초 타임아웃에 맞춤)
        pizzaProgress += (90 - pizzaProgress) * 0.035;
        updatePizzaProgress(stepInsight, Math.min(pizzaProgress, 90));
    }, 200);

    // 3. 라이브 API 호출
    try {
        await ensureBypassSession();
        const params = new URLSearchParams({ country: country.countryCode, city, locale: currentLocale });
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(`/api/city-profile?${params}`, {
            credentials: "include",
            signal: controller.signal
        });
        clearTimeout(timer);

        if (requestId !== latestStep2InsightRequest || currentStep !== 2) {
            pizzaDone = true; clearInterval(pizzaInterval); return;
        }

        if (response.ok) {
            const result = await response.json();
            if (result.ok && result.data) {
                // 캐시 저장 (step과 무관하게)
                sessionStorage.setItem(cacheKey, JSON.stringify(result.data));
                // 100%로 채우고 완료
                pizzaDone = true; clearInterval(pizzaInterval);
                if (currentStep !== 2) return;
                updatePizzaProgress(stepInsight, 100);
                await new Promise(r => setTimeout(r, 400));
                if (currentStep !== 2) return;
                stepInsight.innerHTML = renderCityProfileInsight(countryName, localCity, result.data);
                bindCityProfileDrawer(stepInsight);
                updateQuestionHelpers();
                stepInsight.classList.remove("insight-refresh");
                void stepInsight.offsetWidth;
                stepInsight.classList.add("insight-refresh");
                // 프로필 로드 후 다음 버튼이 보이도록 스크롤
                requestAnimationFrame(() => {
                    const wizardActions = document.querySelector(".wizard-actions");
                    if (wizardActions) wizardActions.scrollIntoView({ behavior: "smooth", block: "end" });
                });
                return;
            }
        }
        pizzaDone = true; clearInterval(pizzaInterval);
    } catch (err) {
        pizzaDone = true; clearInterval(pizzaInterval);
        console.warn("[city-profile] fetch failed:", err.message);
    }

    if (requestId !== latestStep2InsightRequest || currentStep !== 2) return;

    // 4. API 실패 시 — 정적 데이터 없이 재시도 안내만 표시
    stepInsight.innerHTML = buildInsightMarkup(buildStep2ErrorInsight(
        currentLocale === "ko"
            ? "AI 마켓 리서치 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요."
            : "AI market research response is delayed. Please try again shortly."
    ));
    bindInsightRetryButton(stepInsight);
    updateQuestionHelpers();
    stepInsight.classList.remove("insight-refresh");
    void stepInsight.offsetWidth;
    stepInsight.classList.add("insight-refresh");
}

/**
 * 10카테고리 도시 프로필을 인사이트 카드 HTML로 렌더링
 */
/** 10카테고리 정의 — renderCityProfileInsight + 스마트 로딩에서 공유 */
const CITY_PROFILE_CATEGORIES = [
    { key: "climate",      icon: "🌤", labelKo: "기후·계절",    labelEn: "Climate",      color: "#1976d2" },
    { key: "housing",      icon: "🏢", labelKo: "주거 형태",    labelEn: "Housing",      color: "#6d4c41" },
    { key: "family",       icon: "👨‍👩‍👧", labelKo: "가족·돌봄",    labelEn: "Family",       color: "#e91e63" },
    { key: "daily_rhythm", icon: "⏰", labelKo: "일상 리듬",    labelEn: "Daily Rhythm", color: "#ff6f00" },
    { key: "safety",       icon: "🛡", labelKo: "안전·보안",    labelEn: "Safety",       color: "#2e7d32" },
    { key: "energy",       icon: "⚡", labelKo: "에너지",       labelEn: "Energy",       color: "#f9a825" },
    { key: "health",       icon: "💪", labelKo: "건강·웰니스",  labelEn: "Health",       color: "#00897b" },
    { key: "pets",         icon: "🐾", labelKo: "펫 라이프",    labelEn: "Pets",         color: "#8d6e63" },
    { key: "mobility",     icon: "🚇", labelKo: "이동·부재",    labelEn: "Mobility",     color: "#5c6bc0" },
    { key: "events",       icon: "🎪", labelKo: "문화 행사",    labelEn: "Events",       color: "#d32f2f" }
];

function renderCityProfileInsight(countryName, localCity, profile) {
    const isKo = currentLocale === "ko";
    const available = CITY_PROFILE_CATEGORIES.filter(cat => profile[cat.key]);

    // 도시 프로필을 전역 저장 (태그 선택 후 카드 렌더에 사용)
    _latestCityProfile = { countryName, localCity, profile, available };

    // 바텀시트 콘텐츠 준비
    const categoriesHtml = available.map(cat => `
        <div class="cpv2-item" style="--cpv2-accent:${cat.color}">
            <div class="cpv2-icon">${cat.icon}</div>
            <div class="cpv2-content">
                <span class="cpv2-label">${escapeHtml(isKo ? cat.labelKo : cat.labelEn)}</span>
                <span class="cpv2-text">${escapeHtml(profile[cat.key])}</span>
            </div>
        </div>
    `).join("");

    const flag = typeof getCountryFlagEmoji === "function" ? getCountryFlagEmoji("KR") : "";
    _pendingCitySheetHtml = `
        <div class="cpv2-sheet-header">
            <div class="cpv2-sheet-handle"></div>
            <div class="cpv2-sheet-title-row">
                ${flag ? `<span class="cpv2-flag">${flag}</span>` : ""}
                <h3 class="cpv2-city">${escapeHtml(localCity)}</h3>
                <span class="cpv2-country">${escapeHtml(countryName)}</span>
                <span class="cpv2-badge">${isKo ? "AI 도시 프로필" : "AI City Profile"}</span>
                <button type="button" class="cpv2-sheet-close" aria-label="Close">&times;</button>
            </div>
        </div>
        <div class="city-profile-grid">${categoriesHtml}</div>
    `;

    // Magic Setup: 태그 선택형 UI
    const tagsHtml = available.map(cat => `
        <button type="button" class="magic-tag" data-cat-key="${cat.key}" style="--magic-accent:${cat.color}">
            <span class="magic-tag-icon">${cat.icon}</span>
            <span class="magic-tag-label">${escapeHtml(isKo ? cat.labelKo : cat.labelEn)}</span>
        </button>
    `).join("");

    const customPlaceholder = isKo
        ? "예: 겨울철 한파 대비, 미세먼지 심한 지역, 다문화 가정, 반지하 습기 문제, 태풍 잦은 해안 도시..."
        : "e.g. extreme winter cold, high pollution area, multicultural household, coastal typhoon zone...";

    return `
        <div class="magic-setup">
            <div class="magic-header">
                <span class="magic-city">${flag} ${escapeHtml(localCity)}</span>
                <span class="magic-prompt">${isKo ? "지금 가장 고민되는 키워드를 골라주세요" : "Pick the topics that matter most to you"} <em>(${isKo ? "최대 3개" : "up to 3"})</em></span>
            </div>
            <div class="magic-tags">${tagsHtml}</div>
            <div class="magic-cards" id="magic-cards"></div>
            <div class="magic-custom-research" id="magic-custom-research">
                <div class="magic-custom-header">
                    <span class="magic-custom-icon">🔎</span>
                    <span class="magic-custom-label">${isKo ? "위 10개 외에 반영하고 싶은 지역 특색이 있나요?" : "Any local specifics beyond the 10 categories above?"}</span>
                </div>
                <div class="magic-custom-input-row">
                    <input type="text" id="magic-custom-input" class="magic-custom-input"
                        placeholder="${escapeHtml(customPlaceholder)}" />
                    <button type="button" id="magic-custom-search-btn" class="magic-custom-search-btn">
                        ${isKo ? "검색하기" : "Search"}
                    </button>
                </div>
                <div id="magic-custom-result" class="magic-custom-result" style="display:none"></div>
            </div>
            <div class="magic-actions" id="magic-actions" style="display:none">
                <button type="button" class="magic-apply-btn" id="magic-apply-btn">
                    ${isKo ? "이 키워드를 시나리오에 반영하기" : "Apply these to scenario matching"}
                </button>
                <button type="button" class="cpv2-sheet-trigger magic-all-btn">
                    ${isKo ? "전체 도시 프로필 보기" : "View full city profile"}
                </button>
            </div>
        </div>
    `;
}

let _pendingCitySheetHtml = "";
let _latestCityProfile = null;
let _magicSelected = new Set();

/**
 * 정적 city_signals fallback
 */
function bindCityProfileDrawer(container) {
    // 바텀시트 "전체 보기" 트리거
    container.querySelectorAll(".cpv2-sheet-trigger").forEach(btn => {
        btn.addEventListener("click", () => openCitySheet());
    });

    // Magic Setup 태그 선택
    _magicSelected.clear();
    container.querySelectorAll(".magic-tag").forEach(tag => {
        tag.addEventListener("click", () => {
            const key = tag.dataset.catKey;
            if (_magicSelected.has(key)) {
                _magicSelected.delete(key);
                tag.classList.remove("selected");
            } else if (_magicSelected.size < 3) {
                _magicSelected.add(key);
                tag.classList.add("selected");
            }
            renderMagicCards(container);
        });
    });

    // "시나리오에 반영하기" 버튼
    const applyBtn = container.querySelector("#magic-apply-btn");
    if (applyBtn) {
        applyBtn.addEventListener("click", () => {
            if (_magicSelected.size === 0) return;
            const isKo = currentLocale === "ko";
            const keywords = [..._magicSelected].map(key => {
                const cat = CITY_PROFILE_CATEGORIES.find(c => c.key === key);
                return cat ? (isKo ? cat.labelKo : cat.labelEn) : key;
            });

            // 시각 피드백: 반영 확인 + 어디에 반영되는지 설명
            applyBtn.innerHTML = isKo
                ? `<span style="color:#4caf50">&#10003;</span> 반영 완료 — 시나리오 매칭 + AI 생성에 적용됩니다`
                : `<span style="color:#4caf50">&#10003;</span> Applied — will influence matching + AI generation`;
            applyBtn.disabled = true;

            // state preview 업데이트 (있다면)
            updateStatePreview();

            setTimeout(() => {
                applyBtn.innerHTML = isKo ? "이 키워드를 시나리오에 반영하기" : "Apply these to scenario matching";
                applyBtn.disabled = false;
            }, 2500);
        });
    }

    // ── 커스텀 리서치: 직접 입력 → AI 검색 ──
    const customSearchBtn = container.querySelector("#magic-custom-search-btn");
    const customInput = container.querySelector("#magic-custom-input");
    const customResult = container.querySelector("#magic-custom-result");

    if (customSearchBtn && customInput && customResult) {
        customSearchBtn.addEventListener("click", () => {
            const query = customInput.value.trim();
            if (!query) return;
            runCustomCityResearch(query, customResult, container);
        });
        // Enter키로도 검색
        customInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                customSearchBtn.click();
            }
        });
    }
}

/** 커스텀 도시 리서치 — AI 마켓 리서치 실행 */
let _customResearchData = null;

async function runCustomCityResearch(query, resultContainer, parentContainer) {
    const isKo = currentLocale === "ko";

    // 로딩 표시
    resultContainer.style.display = "block";
    resultContainer.innerHTML = `
        <div class="magic-custom-loading">
            <div class="insight-loading" role="status" style="justify-content:flex-start">
                <div class="pizza-spinner" aria-hidden="true" style="width:28px;height:28px">
                    <svg viewBox="0 0 40 40" class="pizza-svg">
                        <circle cx="20" cy="20" r="18" class="pizza-track"/>
                        <path d="" class="pizza-wedge" data-pizza-wedge/>
                    </svg>
                    <span class="pizza-pct" data-pizza-pct>0%</span>
                </div>
                <span class="pizza-label" style="font-size:.75rem">${isKo ? "AI 마켓 리서치 중..." : "AI market research..."}</span>
            </div>
        </div>`;

    // 피자 프로그레스
    let progress = 0;
    const pizzaInterval = setInterval(() => {
        progress += (90 - progress) * 0.04;
        updatePizzaProgress(resultContainer, Math.min(progress, 90));
    }, 200);

    try {
        await ensureBypassSession();
        const selectedMarket = marketOptions.find((m) => m.siteCode === countrySelect.value);
        const country = resolveCountry(selectedMarket);
        const city = getCityValue();

        const params = new URLSearchParams({
            country: country.countryCode,
            city: city || "",
            locale: currentLocale,
            custom_query: query
        });

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(`/api/city-profile?${params}`, {
            credentials: "include",
            signal: controller.signal
        });
        clearTimeout(timer);
        clearInterval(pizzaInterval);
        updatePizzaProgress(resultContainer, 100);

        if (response.ok) {
            const result = await response.json();
            if (result.ok && result.data) {
                _customResearchData = { query, data: result.data };
                await new Promise(r => setTimeout(r, 300));
                renderCustomResearchResult(query, result.data, resultContainer);
                return;
            }
        }
    } catch (err) {
        clearInterval(pizzaInterval);
        console.warn("[custom-research] fetch failed:", err.message);
    }

    // 실패 시
    resultContainer.innerHTML = `
        <div class="magic-custom-error">
            <p>${isKo ? "검색에 실패했습니다. 다시 시도해 주세요." : "Search failed. Please try again."}</p>
            <button type="button" class="secondary-btn magic-custom-retry-btn">${isKo ? "다시 검색" : "Retry"}</button>
        </div>`;
    resultContainer.querySelector(".magic-custom-retry-btn")?.addEventListener("click", () => {
        runCustomCityResearch(query, resultContainer, parentContainer);
    });
}

function renderCustomResearchResult(query, data, resultContainer) {
    const isKo = currentLocale === "ko";

    // data에서 custom_query 관련 결과 추출
    const customResult = data.custom || data.summary || "";
    const displayText = typeof customResult === "string"
        ? customResult
        : JSON.stringify(customResult, null, 2);

    // 10카테고리 중 관련 데이터 요약
    const relatedCategories = CITY_PROFILE_CATEGORIES
        .filter(cat => data[cat.key])
        .map(cat => `<span class="magic-custom-cat-chip" style="border-color:${cat.color};color:${cat.color}">${cat.icon} ${isKo ? cat.labelKo : cat.labelEn}</span>`)
        .join("");

    resultContainer.innerHTML = `
        <div class="magic-custom-result-content">
            <div class="magic-custom-result-header">
                <span class="magic-custom-result-badge">${isKo ? "AI 검색 결과" : "AI Research Result"}</span>
                <span class="magic-custom-result-query">"${escapeHtml(query)}"</span>
            </div>
            <div class="magic-custom-result-body">
                <p>${escapeHtml(displayText || (isKo ? "검색 결과를 기반으로 시나리오에 반영할 수 있습니다." : "Results can be applied to your scenario."))}</p>
                ${relatedCategories ? `<div class="magic-custom-cats">${relatedCategories}</div>` : ""}
            </div>
            <div class="magic-custom-result-actions">
                <button type="button" class="magic-custom-apply-btn" id="magic-custom-apply-btn">
                    ${isKo ? "시나리오 반영" : "Apply to Scenario"}
                </button>
                <button type="button" class="secondary-btn magic-custom-retry-btn" id="magic-custom-retry-btn">
                    ${isKo ? "다시 검색" : "Search Again"}
                </button>
                <button type="button" class="secondary-btn magic-custom-skip-btn" id="magic-custom-skip-btn">
                    ${isKo ? "스킵하기" : "Skip"}
                </button>
            </div>
        </div>`;

    // 시나리오 반영 버튼
    resultContainer.querySelector("#magic-custom-apply-btn")?.addEventListener("click", () => {
        // purpose 필드에 커스텀 리서치 내용 추가
        const purposeVal = purposeInput.value.trim();
        const appendText = `[${isKo ? "지역 특색" : "Local insight"}] ${query}: ${displayText}`.substring(0, 300);
        purposeInput.value = purposeVal ? `${purposeVal}\n${appendText}` : appendText;

        // 시각 피드백
        const applyBtn = resultContainer.querySelector("#magic-custom-apply-btn");
        if (applyBtn) {
            applyBtn.innerHTML = isKo
                ? `<span style="color:#4caf50">&#10003;</span> 반영 완료`
                : `<span style="color:#4caf50">&#10003;</span> Applied`;
            applyBtn.disabled = true;
        }
        updateStatePreview();
    });

    // 다시 검색 버튼
    resultContainer.querySelector("#magic-custom-retry-btn")?.addEventListener("click", () => {
        const input = document.getElementById("magic-custom-input");
        const query = input?.value.trim();
        if (query) runCustomCityResearch(query, resultContainer);
    });

    // 스킵 버튼
    resultContainer.querySelector("#magic-custom-skip-btn")?.addEventListener("click", () => {
        resultContainer.style.display = "none";
        _customResearchData = null;
    });
}

function renderMagicCards(container) {
    const cardsEl = container.querySelector("#magic-cards");
    const actionsEl = container.querySelector("#magic-actions");
    if (!cardsEl || !_latestCityProfile) return;

    if (_magicSelected.size === 0) {
        cardsEl.innerHTML = "";
        if (actionsEl) actionsEl.style.display = "none";
        return;
    }

    const isKo = currentLocale === "ko";
    const { localCity, profile } = _latestCityProfile;

    const cards = [..._magicSelected].map(key => {
        const cat = CITY_PROFILE_CATEGORIES.find(c => c.key === key);
        if (!cat || !profile[key]) return "";
        const text = profile[key];
        return `
            <div class="magic-card" style="--magic-accent:${cat.color}">
                <div class="magic-card-head">
                    <span class="magic-card-icon">${cat.icon}</span>
                    <span class="magic-card-label">${escapeHtml(isKo ? cat.labelKo : cat.labelEn)}</span>
                </div>
                <p class="magic-card-text">${escapeHtml(text)}</p>
                <p class="magic-card-hint">${buildMagicHint(key, localCity, isKo)}</p>
            </div>
        `;
    }).join("");

    cardsEl.innerHTML = cards;
    if (actionsEl) actionsEl.style.display = "";
}

function buildMagicHint(key, city, isKo) {
    const hints = isKo ? {
        climate: `${city}의 계절 특성에 맞춘 자동 냉난방·공기질 루틴을 설계할 수 있습니다.`,
        housing: `${city} 주거 환경에 최적화된 스마트홈 자동화를 추천합니다.`,
        family: `${city} 가구 구성에 맞는 돌봄·안심 시나리오를 연결합니다.`,
        daily_rhythm: `${city} 주민의 출퇴근·생활 패턴에 맞춘 루틴을 설계합니다.`,
        safety: `${city} 보안 환경에 맞는 안전·모니터링 시나리오를 추천합니다.`,
        energy: `${city} 에너지 비용 구조에 맞는 절약 자동화를 제안합니다.`,
        health: `${city} 생활 환경에 맞는 건강·웰니스 루틴을 연결합니다.`,
        pets: `${city} 반려 생활에 맞는 펫 케어 자동화를 추천합니다.`,
        mobility: `${city} 이동·부재 패턴에 맞는 외출 모드를 설계합니다.`,
        events: `${city} 계절 행사에 맞춘 시즌별 캠페인 시나리오를 연결합니다.`
    } : {
        climate: `Design auto climate & air routines for ${city}'s seasonal patterns.`,
        housing: `Recommend smart home automation optimized for ${city} housing.`,
        family: `Connect care & safety scenarios for ${city} household types.`,
        daily_rhythm: `Design routines matching ${city} commute & lifestyle patterns.`,
        safety: `Recommend security scenarios for ${city}'s safety environment.`,
        energy: `Suggest energy-saving automation for ${city}'s cost structure.`,
        health: `Connect wellness routines suited to ${city}'s lifestyle.`,
        pets: `Recommend pet care automation for ${city}'s pet owners.`,
        mobility: `Design away-mode scenarios for ${city}'s travel patterns.`,
        events: `Connect seasonal campaign scenarios to ${city}'s local events.`
    };
    return hints[key] || "";
}

function openCitySheet() {
    if (!_pendingCitySheetHtml) return;

    // 기존 시트가 있으면 제거
    closeCitySheet();

    // overlay + sheet 생성
    const overlay = document.createElement("div");
    overlay.className = "cpv2-overlay";
    overlay.addEventListener("click", closeCitySheet);

    const sheet = document.createElement("div");
    sheet.className = "cpv2-sheet";
    sheet.id = "cpv2-sheet";
    sheet.innerHTML = _pendingCitySheetHtml;

    document.body.appendChild(overlay);
    document.body.appendChild(sheet);

    // 닫기 버튼
    sheet.querySelector(".cpv2-sheet-close")?.addEventListener("click", closeCitySheet);

    // ESC 키
    document.addEventListener("keydown", _citySheetEscHandler);

    // 트리거 애니메이션 (다음 프레임에서 open 클래스 추가)
    requestAnimationFrame(() => {
        overlay.classList.add("open");
        sheet.classList.add("open");
    });
}

function closeCitySheet() {
    const overlay = document.querySelector(".cpv2-overlay");
    const sheet = document.getElementById("cpv2-sheet");
    if (overlay) { overlay.classList.remove("open"); setTimeout(() => overlay.remove(), 300); }
    if (sheet) { sheet.classList.remove("open"); setTimeout(() => sheet.remove(), 300); }
    document.removeEventListener("keydown", _citySheetEscHandler);
}

function _citySheetEscHandler(e) {
    if (e.key === "Escape") closeCitySheet();
}

function renderCityProfileFromStatic(countryName, localCity, content) {
    const isKo = currentLocale === "ko";
    // content가 객체이면 필드들을 카테고리처럼 표시
    if (typeof content === "object" && content !== null) {
        const FIELD_LABELS = {
            region: isKo ? "지역 특성" : "Region",
            climate: isKo ? "기후·계절" : "Climate",
            housing: isKo ? "주거 형태" : "Housing",
            behavior: isKo ? "생활 패턴" : "Behavior",
            implication: isKo ? "시사점" : "Implication"
        };
        const items = Object.entries(content)
            .filter(([key, val]) => typeof val === "string" && FIELD_LABELS[key])
            .map(([key, val]) => `
                <div class="city-profile-item">
                    <span class="city-profile-label">${escapeHtml(FIELD_LABELS[key])}</span>
                    <span class="city-profile-text">${escapeHtml(val)}</span>
                </div>
            `).join("");

        return `
            <div class="insight-card city-profile-card-v2">
                <div class="insight-badge-row"><span class="insight-badge">Q1 Region</span><span class="insight-badge" style="background:#e65100;color:#fff">${isKo ? "정적 데이터" : "Static"}</span></div>
                <h3 class="insight-title">${escapeHtml(countryName)} ${escapeHtml(localCity)}</h3>
                <div class="city-profile-grid">${items}</div>
            </div>
        `;
    }
    return buildInsightMarkup({
        badge: "Q1 Region",
        title: `${countryName} ${localCity}`,
        summary: typeof content === "string" ? content : ""
    });
}

async function fetchLiveStep2Insight(countryCode, city, role, forceRefresh = false) {
    // 로케일 기반 도시명 조회 — getCityDisplayValue가 city_signals + KR_CITY_MASTER 모두 검색
    const cityLocal = city ? (getCityDisplayValue(countryCode, city) || city) : city;

    const params = new URLSearchParams({
        country: countryCode,
        city,
        locale: currentLocale
    });
    if (cityLocal && cityLocal !== city) {
        params.set("city_local", cityLocal);
    }
    if (role) {
        params.set("role", role);
    }
    // Always bypass cached region insight so new visual blocks render immediately.
    params.set("force", "1");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REGION_INSIGHT_CLIENT_TIMEOUT_MS);

    try {
        await ensureBypassSession();

        const requestInsight = async () => fetch(`${REGION_INSIGHT_API}?${params.toString()}`, {
            method: "GET",
            credentials: "include",
            signal: controller.signal
        });
        let response = await requestInsight();
        let payload = await response.json().catch(() => null);

        if (response.status === 401 && shouldBypassAccessForLocal()) {
            const ready = await ensureBypassSession(true);
            if (ready) {
                response = await requestInsight();
                payload = await response.json().catch(() => null);
            }
        }
        if (!response.ok || !payload?.ok || !payload?.data) {
            const message = payload?.error?.message || (currentLocale === "ko"
                ? "실시간 지역 인사이트를 불러오지 못했습니다."
                : "Failed to load live regional insight.");
            return buildStep2ErrorInsight(message);
        }
        if (payload.data?._live_status) {
            console.log(`[Region Insight] live_status: ${payload.data._live_status}, trends: ${(payload.data.live_trends || []).length}, pains: ${(payload.data.live_pains || []).length}`);
        }
        return mapLiveStep2Insight(payload.data, countryCode, city);
    } catch {
        const timeoutMessage = currentLocale === "ko"
            ? "실시간 지역 인사이트 요청이 시간 제한(60초)을 초과했습니다."
            : "Live regional insight timed out after 60 seconds.";
        return buildStep2ErrorInsight(timeoutMessage);
    } finally {
        clearTimeout(timer);
    }
}

function mapLiveStep2Insight(data, countryCode, city) {
    const selectedRoleId = normalizeRoleId(data.role || roleSelect.value);
    const roleLens = data.role_lens || {};
    const roleTitle = selectedRoleId ? getRoleTitle(selectedRoleId) : (currentLocale === "ko" ? "마케터" : "Marketer");
    const queryCity = String(data?.meta?.query_city || city || "").trim();

    // 도시명 로케일 변환: getCityDisplayValue가 city_signals + KR_CITY_MASTER 모두 검색
    const resolvedDisplay = queryCity ? getCityDisplayValue(countryCode, queryCity) : "";
    const localCity = resolvedDisplay || String(data?.local?.city_display || queryCity || city || "").trim();
    const marketLabel = localCity ? `${getCountryName(countryCode)} ${localCity}` : getCountryName(countryCode);
    const local = data.local || null;
    const evidence = Array.isArray(data.evidence) ? data.evidence : [];

    // 라이브 데이터만 사용 — 정적 city_signals fallback 제거
    const livePains = toList(data.live_pains).slice(0, 3);
    const liveSolutions = toList(data.live_solutions).slice(0, 3);
    const staticPains = toList(roleLens.pain_points).slice(0, 3);
    const staticSolutions = toList(roleLens.solutions).slice(0, 3);
    const mustKnow = toList(roleLens.must_know).slice(0, 3);
    const executionPoints = toList(roleLens.execution_points).slice(0, 3);

    // live_trends: 객체 배열({text, evidence, category, source_*}) 또는 문자열 배열 모두 지원
    const CATEGORY_LABELS = {
        climate: currentLocale === "ko" ? "기후·계절" : "Climate",
        housing: currentLocale === "ko" ? "주거 형태" : "Housing",
        family: currentLocale === "ko" ? "가족·돌봄" : "Family",
        routine: currentLocale === "ko" ? "일상 리듬" : "Routine",
        security: currentLocale === "ko" ? "안전·보안" : "Security",
        energy: currentLocale === "ko" ? "에너지" : "Energy",
        wellness: currentLocale === "ko" ? "건강·웰니스" : "Wellness",
        pet: currentLocale === "ko" ? "펫 라이프" : "Pet",
        mobility: currentLocale === "ko" ? "이동·부재" : "Mobility",
        events: currentLocale === "ko" ? "문화 행사" : "Events"
    };
    const rawLiveTrends = Array.isArray(data.live_trends) ? data.live_trends : [];
    const liveTrends = rawLiveTrends.map((t) => {
        if (typeof t === "object" && t !== null) {
            const category = String(t.category || "").trim().toLowerCase();
            const categoryLabel = CATEGORY_LABELS[category] || "";
            const text = String(t.text || "").trim();
            return {
                text: categoryLabel ? `[${categoryLabel}] ${text}` : text,
                evidence: String(t.evidence || "").trim(),
                source_title: String(t.source_title || "").trim(),
                source_org: String(t.source_org || "").trim(),
                source_date: String(t.source_date || "").trim(),
                source_url: String(t.source_url || "").trim()
            };
        }
        return { text: String(t || "").trim(), evidence: "", source_title: "", source_org: "", source_date: "", source_url: "" };
    }).filter((t) => t.text);

    // 트렌드가 없어도 pains/events/role_lens가 있으면 카드를 보여줌 (에러 대신 partial 표시)
    const hasSomeData = liveTrends.length || livePains.length || liveSolutions.length || staticPains.length;
    if (!hasSomeData) {
        return buildStep2ErrorInsight(
            currentLocale === "ko"
                ? `"${localCity || queryCity || city}" 지역 데이터를 가져오지 못했습니다. 다시 시도해 주세요.`
                : `Could not fetch regional data for "${localCity || queryCity || city}". Please retry.`
        );
    }

    // 라이브 AI 결과만 사용 — role_lens는 pains/solutions 부재 시에만 보강
    const realPains = livePains.length ? livePains : (staticPains.length ? staticPains : mustKnow);
    const realSolutions = liveSolutions.length ? liveSolutions : (staticSolutions.length ? staticSolutions : executionPoints);
    const formatQ2MetricHint = (metric) => {
        const normalizedMetric = String(metric || "").trim();
        if (!normalizedMetric) return "";
        if (currentLocale === "ko") {
            if (normalizedMetric === "시연 완료율 → 상담 전환율") {
                return "[KPI] 매장 시연을 끝까지 본 고객이 실제 상담까지 이어지도록 만드는 흐름";
            }
            return `[KPI] ${normalizedMetric}`;
        }
        if (normalizedMetric === "Demo completion → consultation conversion") {
            return "[KPI] Turn completed demos into actual consultation conversations";
        }
        return `[KPI] ${normalizedMetric}`;
    };

    const sections = [];

    // 1) 지역 트렌드 섹션: 라이브 API 전용 (정적 fallback 없음)
    const trendItems = liveTrends;
    if (trendItems.length) {
        sections.push({
            title: currentLocale === "ko"
                ? `🏠 <strong class="city-accent">${localCity || marketLabel}</strong> 생활 밀착 이슈`
                : `🏠 Life context in <strong class="city-accent">${localCity || marketLabel}</strong>`,
            items: trendItems.map((trend) => ({
                text: trend.text,
                evidence: trend.evidence || "",
                source_title: trend.source_title || "",
                source_org: trend.source_org || "",
                source_date: trend.source_date || "",
                source_url: trend.source_url || ""
            }))
        });
    }

    // 2) 근처 행사/이벤트 섹션: 실시간 API
    const liveEvents = Array.isArray(data.live_events) ? data.live_events.slice(0, 3) : [];
    if (liveEvents.length) {
        sections.push({
            title: currentLocale === "ko"
                ? `📅 시즌/문화 참고 포인트`
                : `📅 Season & culture signals`,
            items: liveEvents.map(ev =>
                `${ev.name} (${ev.when}) — ${ev.hook}`
            )
        });
    }

    // 3) 트렌드 기반 고민 섹션
    if (realPains.length) {
        sections.push({
            title: currentLocale === "ko"
                ? `😟 고객이 느끼는 불편과 기대`
                : `😟 Customer pain points & expectations`,
            items: realPains
        });
    }

    // 4) CX 시나리오 힌트 섹션 (SUB — 트렌드 기반 세그먼트/기기/시나리오 방향 제안)
    if (realSolutions.length) {
        sections.push({
            title: currentLocale === "ko"
                ? `💡 시나리오 연결 기회`
                : `💡 Scenario opportunities`,
            items: realSolutions
        });
    }

    const rows = [];
    rows.push({
        label: currentLocale === "ko" ? "Q2 힌트" : "Q2 hint",
        value: currentLocale === "ko"
            ? "Q2에서 타겟 고객과 거주지, 생활 맥락을 추가하면 이 지역에 딱 맞는 시나리오가 자동으로 완성됩니다."
            : "Add target audience, housing, and life context in Q2 to auto-generate a scenario tailored to this region."
    });

    return {
        badge: currentLocale === "ko" ? "Q1 생활 맥락" : "Q1 Life Context",
        title: currentLocale === "ko"
            ? `<strong class="city-accent">${marketLabel}</strong>에서 시나리오를 기획할 때 먼저 참고하세요`
            : `Key life-context signals for scenario planning in <strong class="city-accent">${marketLabel}</strong>`,
        chips: [
            queryCity || localCity || marketLabel,
            roleTitle,
            ...(local?.archetype ? [local.archetype] : [])
        ],
        sections,
        rows,
        media: [],
        evidence,
        hideEvidence: true
    };
}

function buildStep2MediaCards(visual, countryCode, city) {
    if (!visual || typeof visual !== "object") return [];

    const countryName = getCountryName(countryCode);
    const imageCards = Array.isArray(visual.image_cards) ? visual.image_cards : [];
    const fallbackUrl = buildLandmarkFallbackImage(city, countryName);
    const cards = imageCards.map((item) => {
        const width = Number(item?.width || 0);
        const height = Number(item?.height || 0);
        const orientation = width > 0 && height > 0 && width >= height ? "landscape" : "portrait";
        return {
            imageUrl: item?.imageDataUrl || item?.imageUrl || fallbackUrl,
            alt: item?.title || `${city} image`,
            fallbackUrl,
            caption: item?.title || `${city} image`,
            orientation,
            kind: item?.kind || "landmark"
        };
    });

    if (!cards.length) {
        cards.push({
            imageUrl: fallbackUrl,
            alt: `${city} landmark`,
            fallbackUrl,
            caption: `${city} landmark`,
            orientation: "landscape",
            kind: "landmark"
        });
    }

    const preferredOrder = ["landmark", "culture", "daily"];
    cards.sort((a, b) => preferredOrder.indexOf(a.kind) - preferredOrder.indexOf(b.kind));
    return cards.slice(0, 3);
}

function buildLandmarkFallbackImage(city, countryName) {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
            <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#12355b"/>
                    <stop offset="100%" stop-color="#2a6f97"/>
                </linearGradient>
            </defs>
            <rect width="960" height="540" fill="url(#bg)"/>
            <circle cx="780" cy="120" r="62" fill="rgba(255,255,255,0.22)"/>
            <rect x="80" y="280" width="60" height="220" fill="rgba(8,20,35,0.62)"/>
            <rect x="150" y="240" width="82" height="260" fill="rgba(8,20,35,0.68)"/>
            <rect x="246" y="188" width="96" height="312" fill="rgba(8,20,35,0.74)"/>
            <rect x="354" y="214" width="82" height="286" fill="rgba(8,20,35,0.66)"/>
            <rect x="446" y="154" width="102" height="346" fill="rgba(8,20,35,0.78)"/>
            <rect x="562" y="224" width="88" height="276" fill="rgba(8,20,35,0.65)"/>
            <rect x="662" y="252" width="76" height="248" fill="rgba(8,20,35,0.6)"/>
            <rect x="0" y="500" width="960" height="40" fill="rgba(0,0,0,0.28)"/>
            <text x="36" y="80" fill="#f3f8ff" font-family="Segoe UI, Arial, sans-serif" font-size="38" font-weight="700">${escapeHtml(city)}</text>
            <text x="36" y="116" fill="#d7e9ff" font-family="Segoe UI, Arial, sans-serif" font-size="21">${escapeHtml(countryName)} • Landmark image unavailable</text>
        </svg>
    `.trim();
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildMapFallbackImage({ countryName, city, areaText, countryPopText, cityPopText, cityShareText, neighborsText }) {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
            <defs>
                <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#eff6ff"/>
                    <stop offset="100%" stop-color="#d9ecff"/>
                </linearGradient>
            </defs>
            <rect width="960" height="540" fill="url(#bg2)"/>
            <path d="M140,110 L780,110 L860,250 L730,420 L210,450 L90,300 Z" fill="#bfd8f7" stroke="#5b84b1" stroke-width="3"/>
            <path d="M280,190 L680,180 L744,268 L652,364 L322,374 L250,282 Z" fill="#4f97d7" stroke="#2f6ea6" stroke-width="3"/>
            <circle cx="500" cy="278" r="13" fill="#e33e3e"/>
            <circle cx="500" cy="278" r="23" fill="none" stroke="rgba(227,62,62,0.34)" stroke-width="7"/>
            <rect x="26" y="26" width="908" height="150" rx="12" fill="rgba(0,39,77,0.84)"/>
            <text x="54" y="72" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="34" font-weight="700">${escapeHtml(countryName)} / ${escapeHtml(city)}</text>
            <text x="54" y="108" fill="#deecff" font-family="Segoe UI, Arial, sans-serif" font-size="20">Area ${escapeHtml(areaText)} • Country pop ${escapeHtml(countryPopText)} • City pop ${escapeHtml(cityPopText)} (${escapeHtml(cityShareText)})</text>
            <text x="54" y="138" fill="#deecff" font-family="Segoe UI, Arial, sans-serif" font-size="18">Neighbors: ${escapeHtml(neighborsText)}</text>
        </svg>
    `.trim();
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function inferCityCxProfile(countryCode, city, macro, local) {
    const marketTraits = toList(macro.market_traits);
    const climateLine = String(marketTraits[2] || local?.lifestyle || "").trim();
    const urbanLine = String(local?.demographic || marketTraits[0] || "").trim();
    const isMetro = String(local?.archetype || "").toLowerCase().includes("metro");

    if (currentLocale === "ko") {
        return [
            `기후/계절: ${climateLine || `${city}는 계절 요인에 따라 냉난방·실내쾌적 니즈가 크게 달라질 수 있습니다.`}`,
            `생활 패턴: ${urbanLine || `${city}는 출퇴근 이후 즉시 편의(빠른 집 상태 전환)에 반응할 가능성이 높습니다.`}`,
            `주기적 이벤트: 출근 재개 시기·명절/휴가 시즌·연말 쇼핑 시즌에 체험형 메시지 반응이 커질 가능성이 큽니다.`,
            `기술 인프라: ${isMetro ? "앱/커넥티드 서비스 수용도가 높은 도시형 환경으로 가정" : "생활권별 디지털 편차를 고려한 단계형 온보딩 필요"}입니다.`,
            `교육/디지털 성숙도(추정): 기능 설명보다 비교·근거·리뷰형 정보에 반응할 가능성이 높습니다.`,
            `에너지 사용 패턴(추정): 계절성 냉난방 부담이 체감되는 시점에 절감 메시지와 자동화 루틴 제안의 설득력이 높아집니다.`
        ];
    }

    if (currentLocale === "de") {
        return [
            `Klima/Saisonalität: ${climateLine || `${city} zeigt je nach Saison wechselnde Bedürfnisse bei Heizen, Kühlen und Komfort.`}`,
            `Lebensrhythmus: ${urbanLine || `${city} reagiert voraussichtlich stark auf unmittelbare Convenience nach dem Heimkommen.`}`,
            "Wiederkehrende Events: Pendelspitzen, Ferienphasen und Jahresend-Saisons erhöhen die Wirkung erlebbarer Botschaften.",
            `Technische Infrastruktur: ${isMetro ? "metro-typische hohe App- und Connected-Adoption wahrscheinlich" : "stufenweises Onboarding wegen digitaler Unterschiede empfohlen"}.`,
            "Bildung/Digitalreife (abgeleitet): Vergleich, Nachweis und Reviews wirken meist stärker als reine Feature-Claims.",
            "Energienutzungsmuster (abgeleitet): In Phasen spürbarer Heiz-/Kühlkosten sind Savings- und Automationsbotschaften besonders wirksam."
        ];
    }

    return [
        `Climate and seasonality: ${climateLine || `${city} is likely to show strong seasonal swings in heating, cooling, and comfort needs.`}`,
        `Daily behavior: ${urbanLine || `${city} is likely to react well to immediate convenience right after commute and return-home moments.`}`,
        "Recurring events: commute peaks, holiday windows, and year-end shopping periods are likely to amplify experience-led messaging.",
        `Tech infrastructure: ${isMetro ? "metro profile suggests high app and connected-service readiness" : "plan phased onboarding to absorb digital-readiness gaps"}.`,
        "Education and digital maturity (inferred): users are likely to respond better to comparison, proof, and review-style guidance than feature-only claims.",
        "Energy-use pattern (inferred): savings and automation narratives tend to convert better when seasonal heating or cooling costs become visible."
    ];
}

/** '다시 시도' 버튼 클릭 → Step 2 인사이트 재호출 */
function bindInsightRetryButton(container) {
    const retryBtn = container.querySelector("#region-insight-retry");
    if (retryBtn) {
        retryBtn.addEventListener("click", () => {
            renderStep2Insight(true);
        });
    }
}

function buildStep2ErrorInsight(message) {
    return {
        badge: currentLocale === "ko" ? "Q1 Live Error" : "Q1 Live Error",
        title: currentLocale === "ko" ? "실시간 지역 인사이트를 불러오지 못했습니다" : "Failed to load live regional insight",
        summary: message,
        body: currentLocale === "ko"
            ? "네트워크 또는 외부 소스 상태를 확인한 뒤 다시 시도해 주세요."
            : "Check network or upstream source status, then retry.",
        retry: true,
        retryLabel: currentLocale === "ko" ? "다시 시도" : "Retry now"
    };
}

function toList(value) {
    return Array.isArray(value) ? value.filter(Boolean) : [];
}

/** 선택된 세그먼트 키워드별 "왜 이 특징이 도출되었는지" 설명 */
function inferTraitReason(trait) {
    const reasons = {
        "시간 가치 민감": "맞벌이·퇴근 키워드에서 → 시간이 곧 비용인 생활 패턴",
        "가구 운영 복잡도 높음": "육아·가족 키워드에서 → 동시에 챙겨야 할 대상이 많음",
        "케어/안심 니즈 큼": "부모·시니어·돌봄 키워드에서 → 멀리서도 확인·케어 필요",
        "지출 민감도 높음": "에너지·생활비 키워드에서 → 절감 효과가 바로 체감되어야 함",
        "여가 시간 품질 중시": "주말·여가·웰니스 키워드에서 → 쉬는 시간의 질이 핵심",
        "원격 확인 수요 존재": "펫·반려 키워드에서 → 외출 중에도 상태 확인 필수",
        "즉시 체감 가치 선호": "기본 타겟 프로필 → 복잡한 설정 없이 바로 효과 체감",
        "설정 피로도 낮추기 중요": "기본 타겟 프로필 → 쉬운 시작이 지속 사용으로 연결",
        "건강·웰니스 중시": "웰니스·피트니스 선택에서 → 공기질·수면·운동 연동 시나리오 적합",
        "보안/안전 중시": "보안·안전 선택에서 → 모니터링·알림 시나리오 유효",
        "가사 효율 추구": "가사·효율 선택에서 → 자동화로 반복 작업을 줄이는 방향",
        // EN
        "time-value sensitivity": "dual-income / commute signals → time equals cost",
        "high household complexity": "parenting / family signals → many things to manage at once",
        "strong care and reassurance needs": "parent / senior / care signals → remote monitoring needed",
        "high spending sensitivity": "energy / cost signals → savings must be immediately visible",
        "high value on leisure quality": "weekend / wellness signals → quality of downtime matters most",
        "remote check-in demand": "pet / companion signals → must check status while away",
        "preference for immediate value": "default profile → value must be felt instantly",
        "importance of reducing setup fatigue": "default profile → easy start leads to sustained usage",
        "health and wellness focus": "wellness / fitness signals → air quality, sleep, exercise integration",
        "security and safety focus": "security / safety signals → monitoring and alert scenarios",
        "chore efficiency focus": "chore / efficiency signals → reducing repetitive tasks through automation",
        "sleep quality focus": "night-shift / sleep signals → better rest through environment automation",
        "수면 품질 중시": "야간근무·수면 관련 선택에서 → 환경 자동화로 수면 질 개선",
        // ── 신규 trait 추론 근거 ──
        "공동주거 환경 최적화": "아파트·빌라 선택에서 → 층간소음·공용설비 고려한 자동화 시나리오 적합",
        "소형 공간 효율화": "오피스텔·원룸 또는 1인 가구 선택에서 → 제한된 공간 내 기기 통합 자동화",
        "독립 주거 자동화": "단독·타운하우스 선택에서 → 마당·다층 구조에 맞는 보안·에너지 시나리오",
        "공용 공간 관리 니즈": "셰어하우스 선택에서 → 공용 공간 사용 규칙·환경 자동 관리",
        "생활 동선 공유": "2인 가구 선택에서 → 두 사람의 생활 패턴을 고려한 동선 자동화",
        "개인 공간·공용 공간 분리": "성인 자녀 동거 선택에서 → 개별 공간 환경을 독립 제어",
        "접근성 배려 자동화": "접근성 배려 선택에서 → 음성·자동 제어 중심 시나리오",
        "안정적 생활 루틴 중시": "안정기·안정된 가정 선택에서 → 예측 가능한 루틴 기반 자동화",
        "외출 전·귀가 시 자동화 수요": "주말 외출 잦음 선택에서 → 출발·귀가 전후 일괄 제어 시나리오",
        "실내 환경 민감": "쾌적한 공기 선택에서 → 공기질·환기 자동 제어 시나리오",
        "분위기·조명 중시": "조명 제어 선택에서 → 시간대·활동별 조명 자동 전환",
        "물건 위치 추적 수요": "물건 찾기 선택에서 → SmartTag 연동 위치 추적 시나리오",
        "shared-building environment optimization": "apartment / villa → automation considering shared infrastructure",
        "compact space efficiency": "studio / single → device integration in limited space",
        "independent dwelling automation": "house / townhouse → multi-floor security & energy scenarios",
        "shared space management needs": "shared housing → automated common area management",
        "shared daily routine": "couple → routine automation considering two lifestyles",
        "private and shared space separation": "adult children → independent zone control",
        "accessibility-aware automation": "accessibility needs → voice & auto control centered scenarios",
        "stable routine focus": "settled / established → predictable routine-based automation",
        "pre-departure and return automation demand": "frequent outings → departure & return batch control",
        "indoor environment sensitivity": "air quality focus → ventilation & air quality auto control",
        "ambiance and lighting focus": "lighting control → time & activity based lighting shifts",
        "object tracking demand": "find belongings → SmartTag location tracking scenarios"
    };
    return reasons[trait] || "";
}

/** traits에서 4대 가치(Care, Play, Save, Secure)를 추론 */
function inferCoreValues(traits, purpose) {
    const text = `${traits.join(" ")} ${purpose}`.toLowerCase();
    const personaIds = new Set(getSelectedPersonaOptionIds());
    const scores = { Care: 0, Play: 0, Save: 0, Secure: 0, Health: 0 };

    // 텍스트 기반
    if (text.includes("케어") || text.includes("안심") || text.includes("돌봄") || text.includes("care")) scores.Care += 2;
    if (text.includes("여가") || text.includes("웰니스") || text.includes("play") || text.includes("엔터")) scores.Play += 2;
    if (text.includes("에너지") || text.includes("지출") || text.includes("절감") || text.includes("save") || text.includes("비용")) scores.Save += 2;
    if (text.includes("보안") || text.includes("안전") || text.includes("secure")) scores.Secure += 2;
    if (text.includes("건강") || text.includes("피트니스") || text.includes("health") || text.includes("wellness")) scores.Health += 2;
    if (text.includes("펫") || text.includes("반려") || text.includes("pet")) scores.Care += 3;
    if (text.includes("자녀") || text.includes("아이") || text.includes("kid") || text.includes("가구 운영")) scores.Care += 2;
    if (text.includes("원격 확인") || text.includes("remote")) scores.Care += 1;

    // 명시적 persona ID 기반 (가장 강력한 신호)
    if (personaIds.has("t_pet")) scores.Care += 4;
    if (personaIds.has("hh_young_kids") || personaIds.has("hh_school_kids") || personaIds.has("t_multi_kids") || personaIds.has("ls_parenting") || personaIds.has("int_kids")) scores.Care += 3;
    if (personaIds.has("hh_senior") || personaIds.has("hh_multi_gen") || personaIds.has("t_parent_care") || personaIds.has("int_senior")) scores.Care += 3;
    if (personaIds.has("t_wellness") || personaIds.has("int_health") || personaIds.has("ls_empty_nest")) scores.Health += 3;
    if (personaIds.has("t_security") || personaIds.has("t_long_away") || personaIds.has("int_safe")) scores.Secure += 3;
    if (personaIds.has("int_energy") || personaIds.has("h_apt")) scores.Save += 1;
    if (personaIds.has("int_mood") || personaIds.has("ls_newlywed")) scores.Play += 2;
    if (personaIds.has("int_pet")) scores.Care += 4;

    const sorted = Object.entries(scores).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return ["Care"];
    return sorted.slice(0, 3).map(([v]) => v);
}

/** Q1 도시 프로필 키워드 → 잠정 타겟 특성 추론 */
function inferQ1Traits() {
    if (!_magicSelected || _magicSelected.size === 0) return [];
    const isKo = currentLocale === "ko";
    const cityName = _latestCityProfile?.localCity || "";
    const profile = _latestCityProfile?.profile || {};

    const mapping = {
        family:        { trait: isKo ? "케어/안심 니즈 큼"     : "strong care and reassurance needs",
                         logic: isKo ? "가족·돌봄 데이터 → 시니어나 아이가 있는 가구가 많을수록 원격 케어·안심 확인 수요 상승" : "Family/care data → more multi-gen households = higher remote care demand" },
        energy:        { trait: isKo ? "지출 민감도 높음"       : "high spending sensitivity",
                         logic: isKo ? "에너지 소비 패턴 → 계절별 냉난방 비용 체감이 클수록 절약형 자동화 시나리오 적합" : "Energy data → high seasonal utility costs drive savings automation scenarios" },
        safety:        { trait: isKo ? "보안/안전 중시"         : "security and safety focus",
                         logic: isKo ? "안전·보안 인프라 → 주거 밀집도와 외출 빈도에 따라 모니터링·알림 시나리오 유효" : "Safety data → density + outing frequency drive monitoring scenarios" },
        daily_rhythm:  { trait: isKo ? "시간 가치 민감"         : "time-value sensitivity",
                         logic: isKo ? "일상 리듬 데이터 → 출퇴근 패턴이 뚜렷할수록 '귀가 직후 자동화' 시나리오 효과적" : "Daily rhythm → clear commute patterns make return-home automation effective" },
        housing:       { trait: isKo ? "주거 환경 최적화"       : "housing environment optimization",
                         logic: isKo ? "주거 형태 데이터 → 아파트·빌라 등 구조에 따라 적합한 기기 배치와 연동 방식이 달라짐" : "Housing data → dwelling type determines optimal device placement" },
        climate:       { trait: isKo ? "계절 민감 생활"         : "seasonal living sensitivity",
                         logic: isKo ? "기후·계절 데이터 → 한서 차이가 클수록 실내 환경 자동 조절 시나리오의 체감 가치 상승" : "Climate data → wider temp swings increase indoor automation perceived value" },
        culture_event: { trait: isKo ? "여가 시간 품질 중시"    : "high value on leisure quality",
                         logic: isKo ? "문화 행사 데이터 → 여가·문화 소비가 활발할수록 '집에서의 몰입 경험' 시나리오 유효" : "Culture data → active leisure patterns support immersive home scenarios" },
        events:        { trait: isKo ? "여가 시간 품질 중시"    : "high value on leisure quality",
                         logic: isKo ? "문화 행사 데이터 → 여가·문화 소비가 활발할수록 '집에서의 몰입 경험' 시나리오 유효" : "Culture data → active leisure patterns support immersive home scenarios" },
        health:        { trait: isKo ? "건강·웰니스 중시"       : "health and wellness focus",
                         logic: isKo ? "건강 데이터 → 웰니스 관심도가 높을수록 공기질·수면·운동 연동 시나리오 설득력 상승" : "Health data → wellness interest drives air quality, sleep, fitness scenarios" },
        shopping:      { trait: isKo ? "소비 트렌드 민감"       : "consumer trend sensitivity",
                         logic: isKo ? "쇼핑 데이터 → 온라인 구매 활발 지역일수록 제품 연동·자동 재주문 시나리오 적합" : "Shopping data → active e-commerce regions suit auto-reorder scenarios" },
        transport:     { trait: isKo ? "이동 효율 중시"         : "mobility efficiency focus",
                         logic: isKo ? "교통 데이터 → 이동 시간이 길수록 외출 전·귀가 시 자동화 시나리오 가치 상승" : "Transport data → longer commutes increase pre-departure automation value" },
        mobility:      { trait: isKo ? "이동 효율 중시"         : "mobility efficiency focus",
                         logic: isKo ? "교통 데이터 → 이동 시간이 길수록 외출 전·귀가 시 자동화 시나리오 가치 상승" : "Transport data → longer commutes increase pre-departure automation value" },
        pets:          { trait: isKo ? "원격 확인 수요 존재"    : "remote check-in demand",
                         logic: isKo ? "펫 라이프 데이터 → 반려동물 가구 비중이 높을수록 외출 중 모니터링 시나리오 필수" : "Pet data → high pet ownership makes remote monitoring scenarios essential" }
    };
    const result = [];
    for (const key of _magicSelected) {
        const entry = mapping[key];
        if (entry && !result.some(r => r.trait === entry.trait)) {
            const cat = CITY_PROFILE_CATEGORIES.find(c => c.key === key);
            const catLabel = cat ? (isKo ? cat.labelKo : cat.labelEn) : key;
            // 실제 도시 프로필 텍스트 인용 (있으면)
            const profileText = profile[key] ? String(profile[key]).slice(0, 120) : "";
            result.push({
                ...entry,
                catKey: key,
                catLabel,
                color: cat ? cat.color : "#3b82f6",
                profileQuote: profileText
            });
        }
    }
    return result;
}

/** 프로필 신뢰도 계산 (0–100) */
function calculateConfidence() {
    let pct = 0;
    // 도시 선택 = base 20%
    const cityRaw = getCityValue();
    if (cityRaw) pct += 20;
    // Q1 키워드 반영 = +20%
    if (_magicSelected && _magicSelected.size > 0) pct += 20;
    // Q2 A/B/C 각 +20% (최대 60%)
    const hasHousing   = !!personaGroups.querySelector('[data-group-id="housing"] input:checked');
    const hasHousehold = !!personaGroups.querySelector('[data-group-id="household"] input:checked');
    const hasLifestage = !!personaGroups.querySelector('[data-group-id="lifestage"] input:checked');
    if (hasHousing)   pct += 20;
    if (hasHousehold) pct += 20;
    if (hasLifestage) pct += 20;
    return Math.min(100, pct);
}

function buildStep3Insight() {
  try {
    const selectedSegment = getSelectedSegment();
    const purpose = purposeInput.value.trim();
    const cityRaw = getCityValue();
    const selectedMarket = marketOptions.find((m) => m.siteCode === countrySelect.value);
    const country = selectedMarket ? resolveCountry(selectedMarket) : null;
    const isKo = currentLocale === "ko";

    // ── 기본 데이터 ──
    const q2Traits = inferSegmentTraits(selectedSegment, purpose);
    const q1Traits = inferQ1Traits();
    const confidence = calculateConfidence();
    const cityDisplay = (country && cityRaw) ? (getCityDisplayValue(country.countryCode, cityRaw) || cityRaw) : cityRaw;
    const direction = inferScenarioDirection(q2Traits, purpose);
    const coreValues = inferCoreValues([...q2Traits, ...q1Traits.map(t => t.trait)], purpose);
    const selectedLabels = getSelectedPersonaLabels();
    const primaryPersona = selectedLabels[0] || (isKo ? "타겟 프로필 구성 중" : "Building target profile");

    // ── 신뢰도 색상/라벨 ──
    const confColor = confidence < 40 ? "amber" : confidence < 80 ? "blue" : "green";
    const confLabel = confidence < 40
        ? (isKo ? "신뢰도 낮음" : "Low confidence")
        : confidence < 80
            ? (isKo ? "구체화 중" : "Refining")
            : (isKo ? "프로필 완성" : "Profile complete");

    // ── Confidence ring SVG ──
    const ringHtml = `
        <div class="q2-confidence-wrap">
            <svg viewBox="0 0 36 36" class="q2-confidence-ring">
                <circle cx="18" cy="18" r="15.9" class="q2-ring-track"/>
                <circle cx="18" cy="18" r="15.9" class="q2-ring-fill q2-ring-fill--${confColor}"
                    style="stroke-dasharray: ${confidence} 100"/>
            </svg>
            <span class="q2-ring-center">${confidence}%</span>
        </div>`;

    // ── Header ──
    const titleSuffix = selectedLabels.length > 1 ? (isKo ? ` 외 ${selectedLabels.length - 1}개` : ` +${selectedLabels.length - 1}`) : "";
    const headerHtml = `
        <div class="q2-hybrid-header">
            ${ringHtml}
            <div class="q2-header-text">
                <span class="q2-header-persona">${escapeHtml(primaryPersona)}${escapeHtml(titleSuffix)}</span>
                <span class="q2-header-confidence q2-header-confidence--${confColor}">${escapeHtml(confLabel)}</span>
            </div>
        </div>`;

    // ── Corroboration: Q2 trait labels that match Q1 trait labels ──
    const q2TraitLabels = new Set(q2Traits);
    const corroboratedLabels = new Set();
    q1Traits.forEach(t => { if (q2TraitLabels.has(t.trait)) corroboratedLabels.add(t.trait); });

    // ── Layer 1: Q1 도시 맥락 ──
    let layer1Html = "";
    if (q1Traits.length > 0) {
        const hasAnyQ2 = q2Traits.length > 0 && (q2Traits[0] !== (isKo ? "즉시 체감 가치 선호" : "preference for immediate value"));
        const tentativeClass = hasAnyQ2 ? "" : " q2-layer--tentative";
        const traitCards = q1Traits.map((t, i) => {
            const isCorro = corroboratedLabels.has(t.trait);
            const statusTag = isCorro
                ? `<span class="q2-trait-confirmed">${isKo ? "Q2 검증됨" : "Q2 confirmed"}</span>`
                : `<span class="q2-trait-tentative">${isKo ? "잠정" : "tentative"}</span>`;
            const uid = `q1-ev-${i}-${Date.now()}`;
            const quoteHtml = t.profileQuote
                ? `<p class="q2-ev-quote">"${escapeHtml(t.profileQuote)}${t.profileQuote.length >= 120 ? "…" : ""}"</p>`
                : "";
            return `
                <div class="q2-hybrid-trait">
                    <div class="q2-trait-accent" style="background:${t.color}"></div>
                    <div class="q2-trait-body">
                        <div class="q2-trait-top">
                            <span class="q2-trait-label">${escapeHtml(t.trait)}</span>
                            ${statusTag}
                        </div>
                        <p class="q2-trait-source">
                            <span class="q2-source-tag" style="background:${t.color}20;color:${t.color}">${escapeHtml(t.catLabel)}</span>
                            ${isKo ? `${escapeHtml(cityDisplay)} 도시 프로필에서 도출` : `From ${escapeHtml(cityDisplay)} city profile`}
                        </p>
                        <button type="button" class="q2-evidence-toggle" data-ev-target="${uid}">
                            <span class="q2-ev-arrow">▸</span> ${isKo ? "추론 근거 보기" : "View reasoning"}
                        </button>
                        <div class="q2-evidence-detail" id="${uid}">
                            ${quoteHtml}
                            <p class="q2-ev-logic">${escapeHtml(t.logic)}</p>
                        </div>
                    </div>
                </div>`;
        }).join("");

        layer1Html = `
            <div class="q2-layer q2-layer--q1${tentativeClass}">
                <p class="q2-layer-header">
                    <span class="q2-layer-header-icon">📍</span>
                    ${isKo ? "도시 맥락에서 추론한 잠정 신호 (Q1 기반)" : "Tentative signals from city context (Q1)"}
                </p>
                <p class="q2-layer-helper">${isKo
                    ? "선택하신 도시의 인프라와 거주 형태를 바탕으로 도출된 잠재 라이프스타일 힌트입니다."
                    : "Potential lifestyle hints inferred from your city context data."}</p>
                ${traitCards}
            </div>`;
    }

    // ── Layer 2: Q2 타겟 생활 (모든 Q2 trait 표시, Q1 연계 시 배지) ──
    let layer2Html = "";
    const hasAnyQ2Selection = !!(
        personaGroups.querySelector('[data-group-id="housing"] input:checked') ||
        personaGroups.querySelector('[data-group-id="household"] input:checked') ||
        personaGroups.querySelector('[data-group-id="lifestage"] input:checked')
    );
    if (hasAnyQ2Selection && q2Traits.length > 0) {
        const warmColors = ["#ea580c", "#f97316", "#fb923c", "#c2410c", "#d97706", "#b91c1c", "#dc2626"];
        const traitCards = q2Traits.map((trait, i) => {
            const reason = inferTraitReason(trait);
            const uid = `q2-ev-${i}-${Date.now()}`;
            const warmColor = warmColors[i % warmColors.length];
            const isCorro = corroboratedLabels.has(trait);
            const statusTag = isCorro
                ? `<span class="q2-trait-confirmed">${isKo ? "Q1 연계" : "Q1 linked"}</span>`
                : "";
            return `
                <div class="q2-hybrid-trait">
                    <div class="q2-trait-accent" style="background:${warmColor}"></div>
                    <div class="q2-trait-body">
                        <div class="q2-trait-top">
                            <span class="q2-trait-label">${escapeHtml(trait)}</span>
                            ${statusTag}
                        </div>
                        <p class="q2-trait-source">${isKo ? "Q2 선택에서 도출" : "Derived from Q2 selections"}</p>
                        ${reason ? `
                        <button type="button" class="q2-evidence-toggle" data-ev-target="${uid}">
                            <span class="q2-ev-arrow">▸</span> ${isKo ? "추론 근거 보기" : "View reasoning"}
                        </button>
                        <div class="q2-evidence-detail" id="${uid}">
                            <p class="q2-ev-logic">${escapeHtml(reason)}</p>
                        </div>` : ""}
                    </div>
                </div>`;
        }).join("");

        layer2Html = `
            <div class="q2-layer q2-layer--q2">
                <p class="q2-layer-header">
                    <span class="q2-layer-header-icon">🎯</span>
                    ${isKo ? `타겟 생활 맥락 신호 (Q2 선택 기반) — ${q2Traits.length}개` : `Target lifestyle signals (Q2) — ${q2Traits.length} signals`}
                </p>
                <p class="q2-layer-helper">${isKo
                    ? "직접 선택한 타겟의 핵심 특성입니다. Q1의 잠정 신호와 일치(교차 검증)할수록 매칭 신뢰도가 시너지로 작용합니다."
                    : "Core lifestyle traits from your selections. Cross-validated traits with Q1 boost match confidence."}</p>
                ${traitCards}
            </div>`;
    }

    // ── Synthesis: 시나리오 추천 스코어보드 (신뢰도 >= 40%) ──
    let synthesisHtml = "";
    if (confidence >= 40) {
        const caveat = confidence < 80
            ? `<p class="q2-synthesis-caveat">${isKo ? "예상 시나리오 방향 (추가 선택 시 변경 가능)" : "Expected scenario direction (may change with more selections)"}</p>`
            : "";
        const valuesPills = coreValues.map(v => `<span class="q2-value-pill">${escapeHtml(v)}</span>`).join("");

        // ── 클러스터 기반 신호 가중치 (100점 만점) ──
        const hasQ2 = q2Traits.length > 0;
        const Q1_WEIGHT = hasQ2 ? 40 : (q1Traits.length > 0 ? 100 : 0);
        const Q2_WEIGHT = hasQ2 ? 60 : 0;

        // 테마 클러스터 정의
        const SIGNAL_CLUSTERS = {
            family_care: {
                label: isKo ? "🏠 패밀리 케어" : "🏠 Family Care",
                color: "#dc2626",
                traits: isKo
                    ? ["가구 운영 복잡도 높음", "케어/안심 니즈 큼", "원격 확인 수요 존재", "접근성 배려 자동화"]
                    : ["high household complexity", "strong care and reassurance needs", "remote check-in demand", "accessibility-aware automation"]
            },
            efficiency: {
                label: isKo ? "⚡ 시간·효율" : "⚡ Time & Efficiency",
                color: "#ea580c",
                traits: isKo
                    ? ["시간 가치 민감", "가사 효율 추구", "외출 전·귀가 시 자동화 수요"]
                    : ["time-value sensitivity", "chore efficiency focus", "pre-departure and return automation demand"]
            },
            savings: {
                label: isKo ? "💰 절약·비용" : "💰 Savings",
                color: "#d97706",
                traits: isKo
                    ? ["지출 민감도 높음", "즉시 체감 가치 선호"]
                    : ["high spending sensitivity", "preference for immediate value"]
            },
            wellness: {
                label: isKo ? "💚 건강·여가" : "💚 Health & Leisure",
                color: "#16a34a",
                traits: isKo
                    ? ["건강·웰니스 중시", "여가 시간 품질 중시", "수면 품질 중시", "실내 환경 민감"]
                    : ["health and wellness focus", "high value on leisure quality", "sleep quality focus", "indoor environment sensitivity"]
            },
            security: {
                label: isKo ? "🔒 안전·보안" : "🔒 Security",
                color: "#2563eb",
                traits: isKo
                    ? ["보안/안전 중시", "물건 위치 추적 수요"]
                    : ["security and safety focus", "object tracking demand"]
            },
            living: {
                label: isKo ? "🏡 주거·생활" : "🏡 Living Space",
                color: "#7c3aed",
                traits: isKo
                    ? ["공동주거 환경 최적화", "소형 공간 효율화", "독립 주거 자동화", "공용 공간 관리 니즈",
                       "생활 동선 공유", "개인 공간·공용 공간 분리", "안정적 생활 루틴 중시", "분위기·조명 중시"]
                    : ["shared-building environment optimization", "compact space efficiency", "independent dwelling automation", "shared space management needs",
                       "shared daily routine", "private and shared space separation", "stable routine focus", "ambiance and lighting focus"]
            }
        };

        // Q1/Q2 trait 세트
        const q1TraitSet = new Set(q1Traits.map(t => t.trait));
        const q2TraitSet = new Set(q2Traits);

        // 교차 검증 (Q1+Q2 중복) 감지
        const corroTraits = new Set();
        for (const t of q2Traits) { if (q1TraitSet.has(t)) corroTraits.add(t); }

        // 클러스터별 신호 점수 계산
        function calcSignalScore(trait, pool, count, source) {
            let base = pool / Math.max(count, 1);
            // 교차 검증 보너스: Q1+Q2 모두에서 나온 신호는 1.5배
            if (corroTraits.has(trait)) base *= 1.5;
            // 클러스터 시너지: 같은 클러스터에 2개 이상 신호가 있으면 +20%
            for (const cl of Object.values(SIGNAL_CLUSTERS)) {
                const allTraits = source === "q1" ? q1Traits.map(t => t.trait) : q2Traits;
                const inCluster = cl.traits.filter(ct => allTraits.includes(ct));
                if (cl.traits.includes(trait) && inCluster.length >= 2) {
                    base *= 1.2;
                    break;
                }
            }
            return base;
        }

        // Q1 점수 계산 (교차검증 + 클러스터 시너지 반영)
        const q1Scores = q1Traits.map(t => ({
            ...t,
            score: calcSignalScore(t.trait, Q1_WEIGHT, q1Traits.length, "q1"),
            isCorro: corroTraits.has(t.trait)
        }));
        // Q1 총합이 풀을 초과하면 정규화
        const q1Total = q1Scores.reduce((s, t) => s + t.score, 0);
        if (q1Total > 0) q1Scores.forEach(t => { t.score = (t.score / q1Total) * Q1_WEIGHT; });

        // Q2 점수 계산
        const q2Scores = q2Traits.map(trait => ({
            trait,
            score: calcSignalScore(trait, Q2_WEIGHT, q2Traits.length, "q2"),
            isCorro: corroTraits.has(trait)
        }));
        const q2Total = q2Scores.reduce((s, t) => s + t.score, 0);
        if (q2Total > 0) q2Scores.forEach(t => { t.score = (t.score / q2Total) * Q2_WEIGHT; });

        // perQ1/perQ2 — 태그 계산용 평균
        const perQ1 = Q1_WEIGHT / Math.max(q1Traits.length, 1);
        const perQ2 = Q2_WEIGHT / Math.max(q2Traits.length, 1);

        // 클러스터 매핑 함수
        function findCluster(trait) {
            for (const [key, cl] of Object.entries(SIGNAL_CLUSTERS)) {
                if (cl.traits.includes(trait)) return { key, ...cl };
            }
            return null;
        }

        // 신호 → 점수 바 HTML (Q1) — 클러스터 그룹핑
        const q1ScoreBars = q1Scores.map(t => {
            const score = Math.round(t.score);
            const cl = findCluster(t.trait);
            const corroTag = t.isCorro ? `<span class="q2-corro-badge">${isKo ? "Q2 교차검증 ×1.5" : "Q2 corroborated ×1.5"}</span>` : "";
            const clTag = cl ? `<span class="q2-cluster-dot" style="background:${cl.color}" title="${cl.label}"></span>` : "";
            return `<div class="q2-score-row">
                <span class="q2-score-label">${clTag}<span class="q2-score-dot" style="background:${t.color}"></span>${escapeHtml(t.trait)}</span>
                ${corroTag}
                <div class="q2-score-bar-track"><div class="q2-score-bar-fill q2-score-bar--q1" style="width:${score}%"></div></div>
                <span class="q2-score-num">${score}${isKo ? "점" : "pt"}</span>
            </div>`;
        }).join("");

        // 신호 → 점수 바 HTML (Q2) — 클러스터 그룹핑
        const warmColors = ["#ea580c", "#f97316", "#fb923c", "#c2410c", "#d97706", "#b91c1c", "#dc2626"];
        const q2ScoreBars = q2Scores.map((t, i) => {
            const score = Math.round(t.score);
            const color = warmColors[i % warmColors.length];
            const cl = findCluster(t.trait);
            const corroTag = t.isCorro ? `<span class="q2-corro-badge">${isKo ? "Q1 교차검증 ×1.5" : "Q1 corroborated ×1.5"}</span>` : "";
            const clTag = cl ? `<span class="q2-cluster-dot" style="background:${cl.color}" title="${cl.label}"></span>` : "";
            return `<div class="q2-score-row">
                <span class="q2-score-label">${clTag}<span class="q2-score-dot" style="background:${color}"></span>${escapeHtml(t.trait)}</span>
                ${corroTag}
                <div class="q2-score-bar-track"><div class="q2-score-bar-fill q2-score-bar--q2" style="width:${score}%"></div></div>
                <span class="q2-score-num">${score}${isKo ? "점" : "pt"}</span>
            </div>`;
        }).join("");

        // 클러스터 요약 (활성 클러스터만)
        const activeClusterHtml = Object.entries(SIGNAL_CLUSTERS).map(([key, cl]) => {
            const q1Hits = q1Traits.filter(t => cl.traits.includes(t.trait));
            const q2Hits = q2Traits.filter(t => cl.traits.includes(t));
            const total = q1Hits.length + q2Hits.length;
            if (total === 0) return "";
            const hasSynergy = total >= 2;
            const hasCorro = q1Hits.some(t => q2Hits.includes(t.trait));
            const badges = [];
            if (hasSynergy) badges.push(isKo ? "시너지 ×1.2" : "synergy ×1.2");
            if (hasCorro) badges.push(isKo ? "교차검증 ×1.5" : "corroborated ×1.5");
            return `<span class="q2-cluster-pill" style="border-color:${cl.color};color:${cl.color}">
                ${cl.label} <span class="q2-cluster-count">${total}</span>
                ${badges.length ? `<span class="q2-cluster-bonus">${badges.join(" + ")}</span>` : ""}
            </span>`;
        }).filter(Boolean).join("");

        // ── 시나리오 태그 스코어 집계 (고급 추론) ──
        const tagScoreMap = {};
        const tagSourceCount = {}; // 중복 누적 방지용
        const tagSources = {};    // 태그별 기여 소스 추적
        function addTagScore(tag, pts, sourceId, sourceLabel) {
            const key = `${sourceId}|${tag}`;
            if (!tagSourceCount[key]) {
                tagSourceCount[key] = true;
                tagScoreMap[tag] = (tagScoreMap[tag] || 0) + pts;
                if (!tagSources[tag]) tagSources[tag] = [];
                tagSources[tag].push({ label: sourceLabel || sourceId, pts: Math.round(pts) });
            }
        }

        // ── 명시적 선택 (Primary Intent) — 가중치 최고 ──
        // 사용자가 명시적으로 선택한 특성 태그는 직접적 의도를 나타냄
        const personaIds = getSelectedPersonaOptionIds();
        const PRIMARY_INTENT_MAP = {
            t_pet:        ["Care for your pet", "Pet care"],
            t_multi_kids: ["Care for kids", "Family care"],
            t_parent_care:["Care for seniors", "Family care"],
            t_parent_away:["Care for seniors", "Keep your home safe"],
            t_wellness:   ["Stay fit & healthy", "Health", "Sleep well"],
            t_security:   ["Keep your home safe", "Security"],
            t_efficiency: ["Help with chores", "Time saving"],
            t_remote:     ["Help with chores", "Time saving"],
            t_dual_income:["Time saving", "Help with chores"],
            t_night_shift:["Sleep well"],
            int_energy:   ["Save energy", "Energy Saving"],
            int_pet:      ["Care for your pet", "Pet care"],
            int_kids:     ["Care for kids", "Family care"],
            int_senior:   ["Care for seniors", "Family care"],
            int_health:   ["Stay fit & healthy", "Health"],
            int_safe:     ["Keep your home safe", "Security"],
            int_chores:   ["Help with chores", "Time saving"],
            int_sleep:    ["Sleep well"],
            int_mood:     ["Enhanced mood"]
        };
        const PRIMARY_WEIGHT = 15; // 명시적 선택은 높은 가중치
        // persona ID → 표시 라벨
        function getPersonaLabel(id) {
            const el = document.querySelector(`input[value="${id}"]`);
            return el?.dataset?.label || id;
        }
        personaIds.forEach(id => {
            const lbl = getPersonaLabel(id);
            (PRIMARY_INTENT_MAP[id] || []).forEach(tag => addTagScore(tag, PRIMARY_WEIGHT, `primary_${id}`, `${lbl} (${isKo ? "명시선택" : "explicit"} +${PRIMARY_WEIGHT})`));
        });

        // ── 세대 구성 (B) — 생활 맥락 신호 ──
        const HOUSEHOLD_WEIGHT = 10;
        const HOUSEHOLD_MAP = {
            hh_young_kids:  ["Care for kids", "Keep your home safe", "Family care"],
            hh_school_kids: ["Care for kids", "Keep your home safe", "Family care"],
            hh_senior:      ["Care for seniors", "Keep your home safe", "Family care"],
            hh_multi_gen:   ["Care for seniors", "Care for kids", "Family care"],
            hh_solo:        ["Keep your home safe", "Save energy"],
            hh_couple:      ["Enhanced mood", "Help with chores"]
        };
        personaIds.forEach(id => {
            const lbl = getPersonaLabel(id);
            (HOUSEHOLD_MAP[id] || []).forEach(tag => addTagScore(tag, HOUSEHOLD_WEIGHT, `hh_${id}`, `${lbl} (${isKo ? "세대구성" : "household"} +${HOUSEHOLD_WEIGHT})`));
        });

        // ── 라이프스테이지 (C) — 맥락 보강 ──
        const LIFESTAGE_WEIGHT = 8;
        const LIFESTAGE_MAP = {
            ls_parenting:    ["Care for kids", "Keep your home safe", "Family care"],
            ls_senior:       ["Care for seniors", "Family care", "Health"],
            ls_empty_nest:   ["Stay fit & healthy", "Sleep well"],
            ls_starter:      ["Save energy", "Easy to use"],
            ls_newlywed:     ["Enhanced mood", "Help with chores"],
            ls_settled:      ["Save energy", "Enhanced mood"],
            ls_established:  ["Help with chores", "Time saving"]
        };
        personaIds.forEach(id => {
            const lbl = getPersonaLabel(id);
            (LIFESTAGE_MAP[id] || []).forEach(tag => addTagScore(tag, LIFESTAGE_WEIGHT, `ls_${id}`, `${lbl} (${isKo ? "라이프스테이지" : "lifestage"} +${LIFESTAGE_WEIGHT})`));
        });

        // ── 거주지 유형 (A) — 배경 환경 (낮은 가중치) ──
        const HOUSING_WEIGHT = 4;
        const HOUSING_MAP = {
            h_apt:       ["Save energy", "Keep the air fresh"],
            h_compact:   ["Save energy"],
            h_villa:     ["Keep your home safe"],
            h_house:     ["Keep your home safe"],
            h_care:      ["Care for seniors"]
        };
        personaIds.forEach(id => {
            const lbl = getPersonaLabel(id);
            (HOUSING_MAP[id] || []).forEach(tag => addTagScore(tag, HOUSING_WEIGHT, `housing_${id}`, `${lbl} (${isKo ? "거주지" : "housing"} +${HOUSING_WEIGHT})`));
        });

        // ── Q1 magic keywords → 태그 (도시 맥락) ──
        if (typeof MAGIC_KEY_TO_EXPLORE_TAGS !== "undefined" && _magicSelected) {
            for (const key of _magicSelected) {
                const q1Pts = Math.round(perQ1 * 0.8);
                const catObj = CITY_PROFILE_CATEGORIES.find(c => c.key === key);
                const catLbl = catObj ? (isKo ? catObj.labelKo : catObj.labelEn) : key;
                (MAGIC_KEY_TO_EXPLORE_TAGS[key] || []).forEach(tag => addTagScore(tag, q1Pts, `q1_${key}`, `Q1 ${catLbl} (${isKo ? "도시맥락" : "city"} +${q1Pts})`));
            }
        }

        // ── purpose 텍스트 보너스 ──
        const purposeL = purpose.toLowerCase();
        const purposeBonus = {
            "반려|펫|pet|dog|cat": "Care for your pet",
            "부모|시니어|senior": "Care for seniors",
            "아이|자녀|kid|child": "Care for kids",
            "에너지|절약|energy|save": "Save energy",
            "보안|안전|security|safe": "Keep your home safe",
            "수면|잠|sleep": "Sleep well",
            "게임|영화|music": "Enhanced mood",
            "세탁|청소|가사|chore": "Help with chores",
            "운동|건강|health": "Stay fit & healthy"
        };
        Object.entries(purposeBonus).forEach(([pattern, tag]) => {
            if (new RegExp(pattern, "i").test(purposeL)) addTagScore(tag, 8, `purpose_${tag}`, `${isKo ? "추가 설명 텍스트" : "context text"} (+8)`);
        });

        // ── 유사 태그 병합 (에너지 절약 + 에너지 절감 → 에너지 절약으로 통합) ──
        const TAG_MERGE = {
            "Energy Saving": "Save energy",
            "Security": "Keep your home safe",
            "Pet care": "Care for your pet",
            "Family care": "Care for kids",
            "Health": "Stay fit & healthy",
            "Sleep": "Sleep well",
            "Time saving": "Help with chores",
            "Easy to use": "Easily control your lights"
        };
        for (const [from, to] of Object.entries(TAG_MERGE)) {
            if (tagScoreMap[from]) {
                tagScoreMap[to] = (tagScoreMap[to] || 0) + tagScoreMap[from];
                delete tagScoreMap[from];
                // 소스도 병합 + 라벨 기준 중복 제거 (중복 시 점수 뻥튀기 방지)
                if (tagSources[from]) {
                    if (!tagSources[to]) tagSources[to] = [];
                    const existingLabels = new Set(tagSources[to].map(s => s.label));
                    for (const s of tagSources[from]) {
                        if (!existingLabels.has(s.label)) {
                            tagSources[to].push(s);
                            existingLabels.add(s.label);
                        } else {
                            // 중복된 소스(동일한 이유로 여러 태그에 점수가 중복 부여된 경우)
                            // 병합 과정에서 원점수가 뻥튀기되지 않도록 합산된 점수에서 차감
                            tagScoreMap[to] -= s.pts;
                        }
                    }
                    delete tagSources[from];
                }
            }
        }

        // 정렬 & 100점 정규화
        const sortedTags = Object.entries(tagScoreMap).sort((a, b) => b[1] - a[1]);
        const maxRaw = sortedTags.length > 0 ? sortedTags[0][1] : 1;
        const topTags = sortedTags.slice(0, 6);

        // 시나리오 태그 → 한글 매핑
        const tagKoMap = {
            "Save energy": "에너지 절약", "Keep your home safe": "홈 안전·보안",
            "Help with chores": "가사 자동화", "Care for kids": "자녀 케어",
            "Care for seniors": "시니어 케어", "Care for your pet": "반려동물 케어",
            "Sleep well": "수면 개선", "Enhanced mood": "분위기 연출",
            "Stay fit & healthy": "건강·피트니스", "Easily control your lights": "조명 제어",
            "Keep the air fresh": "공기질 관리", "Find your belongings": "분실물 찾기",
            "Time saving": "시간 절약", "Energy Saving": "에너지 절감",
            "Security": "보안", "Family care": "가족 돌봄", "Easy to use": "간편 사용",
            "Health": "건강", "Pet care": "펫 케어", "Sleep": "수면"
        };

        const tagBarsHtml = topTags.map(([tag, rawScore], idx) => {
            const norm = Math.round((rawScore / maxRaw) * 100);
            const display = isKo ? (tagKoMap[tag] || tag) : tag;
            const barColor = norm >= 70 ? "#2563eb" : norm >= 40 ? "#3b82f6" : "#93c5fd";
            // 산출 근거 (어떤 소스에서 몇 점)
            const sources = (tagSources[tag] || []).sort((a, b) => b.pts - a.pts);
            const sourceSum = sources.reduce((s, x) => s + x.pts, 0);
            const detailId = `tag-detail-${idx}-${Date.now()}`;
            const sourceLines = sources.map(s =>
                `<span class="q2-tag-source-item">+${s.pts} ← ${escapeHtml(s.label)}</span>`
            ).join("");
            // 정규화 설명
            const normExplain = isKo
                ? (idx === 0
                    ? `원점수 합계 ${sourceSum} → 1위 기준점이므로 <strong>100점</strong>으로 표시`
                    : `원점수 합계 ${sourceSum} ÷ 1위 원점수 ${Math.round(maxRaw)} × 100 = <strong>${norm}점</strong>`)
                : (idx === 0
                    ? `Raw total ${sourceSum} → top scorer, displayed as <strong>100</strong>`
                    : `Raw total ${sourceSum} ÷ top raw ${Math.round(maxRaw)} × 100 = <strong>${norm}</strong>`);
            return `<div class="q2-tag-row-wrap">
                <div class="q2-tag-row">
                    <span class="q2-tag-label">${escapeHtml(display)}</span>
                    <div class="q2-tag-bar-track"><div class="q2-tag-bar-fill" style="width:${norm}%;background:${barColor}"></div></div>
                    <span class="q2-tag-score">${norm}</span>
                    <button type="button" class="q2-tag-detail-btn q2-evidence-toggle" data-ev-target="${detailId}"><span class="q2-ev-arrow">▸</span></button>
                </div>
                <div class="q2-evidence-detail q2-tag-source-detail" id="${detailId}">
                    <p class="q2-tag-source-title">${escapeHtml(display)} ${isKo ? "점수 산출 근거" : "score breakdown"}</p>
                    ${sourceLines}
                    <div class="q2-tag-source-total">
                        <span>${isKo ? "합계" : "Total"}: ${sourceSum}${isKo ? "점" : "pt"}</span>
                    </div>
                    <p class="q2-tag-source-norm">${normExplain}</p>
                </div>
            </div>`;
        }).join("");

        // ── 후보 시나리오 방향 요약 ──
        const top3Tags = topTags.slice(0, 3).map(([tag]) => isKo ? (tagKoMap[tag] || tag) : tag);
        const scenarioHint = top3Tags.length > 0
            ? (isKo
                ? `이 조합이면 <strong>${top3Tags.join(", ")}</strong> 중심의 시나리오가 높은 점수로 매칭될 가능성이 큽니다.`
                : `Scenarios focused on <strong>${top3Tags.join(", ")}</strong> are most likely to score highest.`)
            : "";

        synthesisHtml = `
            <div class="q2-synthesis">
                ${caveat}
                <p class="q2-synthesis-direction">${escapeHtml(direction)}</p>
                <div class="q2-synthesis-values">${valuesPills}</div>

                <div class="q2-scoreboard">
                    <p class="q2-scoreboard-title">${isKo ? "📊 신호 가중치 분석 (100점 만점)" : "📊 Signal Weight Analysis (out of 100)"}</p>
                    <p class="q2-scoreboard-method">${isKo
                        ? "Q1(40점)과 Q2(60점) 신호를 합산합니다. 같은 테마 클러스터의 신호가 2개 이상이면 시너지(×1.2), Q1·Q2 양쪽에서 교차 검증된 신호는 강화(×1.5)됩니다. ▸로 산출 근거를 확인하세요."
                        : "Q1 (40pt) + Q2 (60pt) signals. Cluster synergy (×1.2) when 2+ signals share a theme; cross-validated signals get ×1.5 boost. Click ▸ for score breakdown."}</p>
                    ${activeClusterHtml ? `<div class="q2-cluster-row">${activeClusterHtml}</div>` : ""}

                    <div class="q2-legend">
                        <span class="q2-legend-item"><span class="q2-legend-bar q2-score-bar--q1"></span> ${isKo ? "Q1 도시 맥락 점수" : "Q1 city context score"}</span>
                        <span class="q2-legend-item"><span class="q2-legend-bar q2-score-bar--q2"></span> ${isKo ? "Q2 생활 맥락 점수" : "Q2 lifestyle score"}</span>
                        <span class="q2-legend-item"><span class="q2-legend-dot" style="background:#dc2626"></span> ${isKo ? "패밀리 케어" : "Family Care"}</span>
                        <span class="q2-legend-item"><span class="q2-legend-dot" style="background:#ea580c"></span> ${isKo ? "시간·효율" : "Time & Efficiency"}</span>
                        <span class="q2-legend-item"><span class="q2-legend-dot" style="background:#d97706"></span> ${isKo ? "절약·비용" : "Savings"}</span>
                        <span class="q2-legend-item"><span class="q2-legend-dot" style="background:#16a34a"></span> ${isKo ? "건강·여가" : "Health & Leisure"}</span>
                        <span class="q2-legend-item"><span class="q2-legend-dot" style="background:#2563eb"></span> ${isKo ? "안전·보안" : "Security"}</span>
                        <span class="q2-legend-item"><span class="q2-corro-badge" style="font-size:0.6rem">${isKo ? "교차검증 ×1.5" : "cross-validated ×1.5"}</span></span>
                        <button type="button" class="q2-legend-help-btn" id="q2-legend-help-btn" title="${isKo ? "범례 보는 방법 안내" : "How to read this chart"}">?</button>
                    </div>

                    <div class="q2-score-section">
                        <p class="q2-score-section-label"><span class="q2-score-section-icon">📍</span> ${isKo ? "도시 맥락 (Q1)" : "City Context (Q1)"} <span class="q2-score-section-weight">${Q1_WEIGHT}${isKo ? "점" : "pt"}</span></p>
                        ${q1ScoreBars || `<p class="q2-score-empty">${isKo ? "Q1 도시 프로필 미반영" : "No Q1 city profile applied"}</p>`}
                    </div>

                    <div class="q2-score-section">
                        <p class="q2-score-section-label"><span class="q2-score-section-icon">🎯</span> ${isKo ? "생활 맥락 (Q2)" : "Lifestyle Context (Q2)"} <span class="q2-score-section-weight">${Q2_WEIGHT}${isKo ? "점" : "pt"}</span></p>
                        ${q2ScoreBars || `<p class="q2-score-empty">${isKo ? "⏳ 아직 Q2 항목을 선택하지 않았습니다. 위에서 A·B·C 항목을 선택하면 생활 맥락 신호가 여기에 표시됩니다." : "⏳ No Q2 selections yet. Choose items from A·B·C above to see lifestyle signals here."}</p>`}
                    </div>

                    <div class="q2-score-divider"></div>

                    <p class="q2-scoreboard-title">${isKo ? "🎬 시나리오 매칭 예측" : "🎬 Scenario Match Prediction"}</p>
                    ${tagBarsHtml}

                    ${scenarioHint ? `<p class="q2-scenario-hint">${scenarioHint}</p>` : ""}
                </div>
            </div>`;
    }

    // ── CTA / Missing input ──
    const hasHousing   = !!personaGroups.querySelector('[data-group-id="housing"] input:checked');
    const hasHousehold = !!personaGroups.querySelector('[data-group-id="household"] input:checked');
    const hasLifestage = !!personaGroups.querySelector('[data-group-id="lifestage"] input:checked');
    const missingParts = [];
    if (!hasHousing)   missingParts.push(isKo ? "거주지 유형(A)" : "Housing(A)");
    if (!hasHousehold) missingParts.push(isKo ? "세대 구성(B)"   : "Household(B)");
    if (!hasLifestage) missingParts.push(isKo ? "라이프스테이지(C)" : "Life stage(C)");

    let ctaHtml;
    if (missingParts.length > 0) {
        ctaHtml = `<div class="q2-action-prompt q2-action-warn">
            <span class="q2-action-icon">⚠️</span>
            <p>${isKo
                ? `<strong>${missingParts.join(", ")}</strong>을(를) 아직 선택하지 않으셨습니다. 선택할수록 시나리오가 정확해집니다.`
                : `<strong>${missingParts.join(", ")}</strong> not yet selected. More selections lead to better scenarios.`}</p>
        </div>`;
    } else if (!purpose) {
        ctaHtml = `<div class="q2-action-prompt q2-action-todo">
            <span class="q2-action-icon">✍️</span>
            <p>${isKo
                ? "라이프 스타일이나 현재 불편한 상황이 있다면, <strong>위 빈칸에 자유롭게 적어주세요.</strong> 시나리오 정확도가 크게 올라갑니다."
                : "If you have a specific lifestyle or pain point, <strong>describe it in the text area above.</strong> It greatly improves scenario accuracy."}</p>
        </div>`;
    } else {
        ctaHtml = `<div class="q2-action-prompt q2-action-done">
            <span class="q2-action-icon">✅</span>
            <p>${isKo ? "상황 반영 완료 — <strong>다음</strong> 버튼을 눌러 기기를 선택하세요" : "Context applied — press <strong>Next</strong> to select devices"}</p>
        </div>`;
    }

    // ── Q3 힌트 배너 ──
    const q3HintHtml = `
        <div class="q2-hint-banner">
            <span class="q2-hint-icon">→</span>
            <span>${isKo ? "다음 단계(Q3)에서 기기를 고르면, 이 타겟에 맞는 자동화 흐름이 완성됩니다" : "Pick devices in Q3 to complete an automation flow for this target"}</span>
        </div>`;

    const place = cityDisplay ? `${cityDisplay} ${isKo ? "생활권" : "area"}` : (isKo ? "이 타겟" : "this target");

    return {
        badge: "Q2 Audience",
        title: `${primaryPersona}${titleSuffix}`,
        summary: isKo ? `${place}의 타겟 프로필` : `Target profile in ${place}`,
        customHtml: `
            <div class="q2-redesign">
                ${headerHtml}
                ${layer1Html}
                ${layer2Html}
                ${synthesisHtml}
                ${ctaHtml}
                ${q3HintHtml}
            </div>
        `
    };
  } catch (err) {
    console.error("[buildStep3Insight] error:", err);
    return {
        badge: "Q2 Audience",
        title: currentLocale === "ko" ? "타겟 프로필" : "Target profile",
        summary: currentLocale === "ko" ? "카드 렌더링 중 오류가 발생했습니다." : "Card rendering error.",
        body: String(err.message || err)
    };
  }
}

function inferRegionalDirection(countryCode) {
    const directions = {
        KR: currentLocale === "ko" ? "빠른 저녁 전환과 집안 리듬 정리" : "a fast transition into the evening routine",
        US: currentLocale === "ko" ? "복수 기기 연결의 생활 편익을 한 장면으로 압축" : "compressing multi-device value into one clear life moment",
        GB: currentLocale === "ko" ? "실용성과 절감 효과가 바로 읽히는 흐름" : "a flow where practicality and savings are immediately clear",
        DE: currentLocale === "ko" ? "효율과 신뢰를 함께 주는 자동화 흐름" : "an automation flow that conveys both efficiency and trust"
    };
    return directions[countryCode] || (currentLocale === "ko" ? "지역 생활 맥락에 맞는 직관적 사용 장면" : "an intuitive usage moment fitted to the local context");
}

function getLocalizedContent(record) {
    if (!record || typeof record !== "object") return null;
    return record[currentLocale] || record.en || record.ko || record.de || null;
}

function normalizeCityValue(value) {
    return String(value || "")
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9가-힣]+/g, " ")
        .trim();
}

function getCountryTrend(countryCode) {
    const entry = countryTrends?.[countryCode];
    return getLocalizedContent(entry);
}

function getCitySignal(countryCode, city) {
    const normalizedCity = normalizeCityValue(city);
    if (!normalizedCity) return null;

    const cityEntries = Array.isArray(citySignals?.cities) ? citySignals.cities : [];
    const matchedEntry = cityEntries.find((entry) => (
        entry.countryCode === countryCode
        && Array.isArray(entry.aliases)
        && entry.aliases.some((alias) => normalizeCityValue(alias) === normalizedCity)
    ));

    if (matchedEntry) {
        const content = getLocalizedContent(matchedEntry.content);
        return content ? { cityDisplay: matchedEntry.displayName || city, ...content } : null;
    }

    const fallback = citySignals?.fallbacks?.[countryCode];
    const fallbackContent = getLocalizedContent(fallback);
    return fallbackContent ? { cityDisplay: city, ...fallbackContent } : null;
}

function buildStep4Insight() {
    const devices = getSelectedDeviceLabels();
    const normalizedDevices = getSelectedDevices().map((device) => getCategoryName(device));
    if (devices.length === 0 && normalizedDevices.length === 0) return STEP_INSIGHTS[4];

    const deviceCount = devices.length;
    const isKo = currentLocale === "ko";
    const devSet = new Set(normalizedDevices);

    // 삼성 / 타사 분류
    const selectedIds = new Set(
        [...(deviceGrid?.querySelectorAll('input[data-node-type="child"]:checked') || [])].map(i => i.value)
    );
    const samsungCount = typeof Q4_SAMSUNG_IDS !== "undefined" ? [...selectedIds].filter(id => Q4_SAMSUNG_IDS.has(id)).length : deviceCount;
    const partnerCount = typeof Q4_PARTNER_IDS !== "undefined" ? [...selectedIds].filter(id => Q4_PARTNER_IDS.has(id)).length : 0;
    const mixLabel = isKo
        ? `삼성 ${samsungCount}개${partnerCount > 0 ? ` · 타사 ${partnerCount}개` : ""}`
        : `Samsung ${samsungCount}${partnerCount > 0 ? ` · Partner ${partnerCount}` : ""}`;

    // ── 루틴 프리뷰 매핑 (기기 조합 → 구현 가능한 자동화 장면) ──
    const ROUTINE_DB = [
        { id: "away_security", icon: "🛡️",
          nameKo: "외출 안심 모니터링", nameEn: "Away Security Monitoring",
          needs: ["카메라/CCTV"],
          optional: ["도어락", "스마트 플러그", "센서"],
          stepsKo: d => {
              const s = [];
              if (d.has("도어락")) s.push(["도어락", "외출 잠금"]);
              s.push(["카메라/CCTV", "움직임 감지 녹화"]);
              if (d.has("스마트 플러그")) s.push(["스마트 플러그", "대기전력 차단"]);
              if (d.has("센서")) s.push(["센서", "침입 알림"]);
              return s;
          },
          stepsEn: d => {
              const s = [];
              if (d.has("도어락")) s.push(["Door Lock", "lock on leave"]);
              s.push(["Camera", "motion recording"]);
              if (d.has("스마트 플러그")) s.push(["Smart Plug", "standby power off"]);
              if (d.has("센서")) s.push(["Sensor", "intrusion alert"]);
              return s;
          }
        },
        { id: "sleep_mood", icon: "🌙",
          nameKo: "취침 무드 연출", nameEn: "Sleep Mood Automation",
          needs: ["조명"],
          optional: ["TV", "에어컨", "스피커"],
          stepsKo: d => {
              const s = [["조명", "조도 10% 디밍"]];
              if (d.has("TV")) s.push(["TV", "화면 Off / 앰비언트"]);
              if (d.has("에어컨")) s.push(["에어컨", "수면 모드 전환"]);
              if (d.has("스피커")) s.push(["스피커", "백색소음 재생"]);
              return s;
          },
          stepsEn: d => {
              const s = [["Lights", "dim to 10%"]];
              if (d.has("TV")) s.push(["TV", "screen off / ambient"]);
              if (d.has("에어컨")) s.push(["AC", "sleep mode"]);
              if (d.has("스피커")) s.push(["Speaker", "white noise"]);
              return s;
          }
        },
        { id: "welcome_home", icon: "🏠",
          nameKo: "귀가 웰컴 루틴", nameEn: "Welcome Home Routine",
          needs: ["센서", "조명"],
          optional: ["에어컨", "TV", "스피커"],
          stepsKo: d => {
              const s = [["센서", "현관 움직임 감지"], ["조명", "자동 점등"]];
              if (d.has("에어컨")) s.push(["에어컨", "쾌적 온도 가동"]);
              if (d.has("TV")) s.push(["TV", "뉴스/음악 자동 재생"]);
              return s;
          },
          stepsEn: d => {
              const s = [["Sensor", "entrance motion detected"], ["Lights", "auto on"]];
              if (d.has("에어컨")) s.push(["AC", "comfort temp on"]);
              if (d.has("TV")) s.push(["TV", "auto play news/music"]);
              return s;
          }
        },
        { id: "energy_save", icon: "⚡",
          nameKo: "에너지 절약 자동화", nameEn: "Energy Saving Automation",
          needs: ["에어컨"],
          optional: ["스마트 플러그", "조명", "센서"],
          stepsKo: d => {
              const s = [["에어컨", "외출 시 자동 절전"]];
              if (d.has("스마트 플러그")) s.push(["스마트 플러그", "대기전력 모니터링"]);
              if (d.has("조명")) s.push(["조명", "부재 시 자동 소등"]);
              if (d.has("센서")) s.push(["센서", "재실 감지 연동"]);
              return s;
          },
          stepsEn: d => {
              const s = [["AC", "auto eco on leave"]];
              if (d.has("스마트 플러그")) s.push(["Smart Plug", "standby monitoring"]);
              if (d.has("조명")) s.push(["Lights", "auto off when away"]);
              if (d.has("센서")) s.push(["Sensor", "occupancy detection"]);
              return s;
          }
        },
        { id: "pet_care", icon: "🐾",
          nameKo: "반려동물 케어 모니터링", nameEn: "Pet Care Monitoring",
          needs: ["카메라/CCTV"],
          optional: ["센서", "에어컨", "공기청정기"],
          stepsKo: d => {
              const s = [["카메라/CCTV", "실시간 펫 모니터링"]];
              if (d.has("센서")) s.push(["센서", "활동량 감지"]);
              if (d.has("에어컨")) s.push(["에어컨", "실내 온도 자동 유지"]);
              if (d.has("공기청정기")) s.push(["공기청정기", "공기질 자동 관리"]);
              return s;
          },
          stepsEn: d => {
              const s = [["Camera", "live pet monitoring"]];
              if (d.has("센서")) s.push(["Sensor", "activity detection"]);
              if (d.has("에어컨")) s.push(["AC", "auto temp control"]);
              if (d.has("공기청정기")) s.push(["Air Purifier", "auto air quality"]);
              return s;
          }
        },
        { id: "laundry", icon: "🫧",
          nameKo: "세탁 완료 알림 루틴", nameEn: "Laundry Done Routine",
          needs: ["세탁기"],
          optional: ["TV", "스피커", "스마트폰"],
          stepsKo: d => {
              const s = [["세탁기", "세탁 완료 감지"]];
              if (d.has("TV")) s.push(["TV", "화면 알림 팝업"]);
              if (d.has("스피커")) s.push(["스피커", "음성 알림"]);
              return s;
          },
          stepsEn: d => {
              const s = [["Washer", "cycle complete"]];
              if (d.has("TV")) s.push(["TV", "on-screen notification"]);
              if (d.has("스피커")) s.push(["Speaker", "voice alert"]);
              return s;
          }
        },
        { id: "kids_safety", icon: "👶",
          nameKo: "자녀 안전 모니터링", nameEn: "Kids Safety Monitoring",
          needs: ["카메라/CCTV", "센서"],
          optional: ["도어락", "스마트폰"],
          stepsKo: d => {
              const s = [["센서", "아이 방 출입 감지"], ["카메라/CCTV", "실시간 확인"]];
              if (d.has("도어락")) s.push(["도어락", "자녀 귀가 알림"]);
              return s;
          },
          stepsEn: d => {
              const s = [["Sensor", "child room entry"], ["Camera", "live check"]];
              if (d.has("도어락")) s.push(["Door Lock", "child return alert"]);
              return s;
          }
        }
    ];

    // 구현 가능한 루틴 필터링
    const matchedRoutines = ROUTINE_DB.filter(r => r.needs.every(n => devSet.has(n)));
    const routineHtml = matchedRoutines.slice(0, 3).map(r => {
        const steps = isKo ? r.stepsKo(devSet) : r.stepsEn(devSet);
        const stepsHtml = steps.map(([dev, action], i) =>
            `<span class="q3-step">${i > 0 ? '<span class="q3-step-arrow">➔</span>' : ''}<span class="q3-step-device">${escapeHtml(dev)}</span><span class="q3-step-action">${escapeHtml(action)}</span></span>`
        ).join("");
        return `<div class="q3-routine-card">
            <div class="q3-routine-head">
                <span class="q3-routine-icon">${r.icon}</span>
                <span class="q3-routine-name">${escapeHtml(isKo ? r.nameKo : r.nameEn)}</span>
            </div>
            <div class="q3-routine-flow">${stepsHtml}</div>
        </div>`;
    }).join("");

    // ── 확장 제안 (1개 기기 추가 시 해금되는 루틴) ──
    const unmatchedRoutines = ROUTINE_DB.filter(r => !r.needs.every(n => devSet.has(n)));
    let expansionHtml = "";
    for (const r of unmatchedRoutines) {
        const missing = r.needs.filter(n => !devSet.has(n));
        if (missing.length === 1) {
            const missingDev = missing[0];
            const name = isKo ? r.nameKo : r.nameEn;
            expansionHtml = `<div class="q3-expansion">
                <span class="q3-expansion-icon">💡</span>
                <p>${isKo
                    ? `현재 조합에 <strong>${escapeHtml(missingDev)}</strong>을(를) 1개만 추가하면 <strong>'${escapeHtml(name)}'</strong> 장면까지 구현할 수 있습니다.`
                    : `Add just <strong>${escapeHtml(missingDev)}</strong> to unlock the <strong>'${escapeHtml(name)}'</strong> routine.`}</p>
            </div>`;
            break;
        }
    }

    // 칩 HTML
    const chipsHtml = devices.slice(0, 8).map(d => `<span class="insight-chip">${escapeHtml(d)}</span>`).join("");
    const moreCount = devices.length > 8 ? devices.length - 8 : 0;
    const moreHtml = moreCount > 0 ? `<span class="insight-chip insight-chip--more">+${moreCount}</span>` : "";

    // 시나리오 DB 수 (curation DB가 있으면)
    const dbCount = (typeof curationDbV1 !== "undefined" && curationDbV1?.scenarios ? curationDbV1.scenarios.length : 0)
        + (typeof curationDbV2 !== "undefined" && curationDbV2?.scenarios ? curationDbV2.scenarios.length : 0);
    const dbLabel = dbCount > 0 ? `${dbCount}+` : "270+";

    return {
        badge: "Q3 Devices",
        title: isKo ? `${deviceCount}개 기기 선택 완료` : `${deviceCount} devices selected`,
        summary: isKo ? `${mixLabel}` : `${mixLabel}`,
        customHtml: `
            <div class="q3-insight-redesign">
                <div class="q3-chips-row">${chipsHtml}${moreHtml}</div>

                ${matchedRoutines.length > 0 ? `
                <div class="q3-routines-section">
                    <p class="q3-routines-title">${isKo ? "✨ 현재 조합으로 구현 가능한 대표 자동화 장면" : "✨ Automation scenes possible with your devices"}</p>
                    <p class="q3-routines-helper">${isKo ? "선택한 기기들의 기능을 연결하면 이런 루틴을 바로 만들 수 있습니다." : "These routines can be built by connecting your selected devices."}</p>
                    ${routineHtml}
                </div>` : ""}

                ${expansionHtml}

                <div class="q3-cta-box">
                    <p class="q3-cta-text">${isKo
                        ? `아래 <strong>시나리오 매칭 시작</strong> 버튼을 누르면, 이 기기 조합에 맞는 검증된 시나리오를 <strong>${dbLabel}개 DB</strong>에서 탐색합니다.`
                        : `Click <strong>Start Scenario Matching</strong> below to search <strong>${dbLabel} verified scenarios</strong> for this device combination.`}</p>
                </div>
            </div>
        `
    };
}

function updateQuestionHelpers() {
    const stepPanels = document.querySelectorAll(".wizard-step");
    const countryHelper = stepPanels[1]?.querySelector(".helper");
    const segmentHelper = stepPanels[2]?.querySelector(".helper");
    const deviceHelper = stepPanels[3]?.querySelector(".helper");

    if (countryHelper) countryHelper.textContent = buildCountryHelperText();
    if (segmentHelper) segmentHelper.textContent = buildPersonaHelperText();
    if (deviceHelper) deviceHelper.textContent = buildDeviceHelperText();
}

function buildCountryHelperText() {
    if (currentLocale === "ko") {
        return "국가와 도시를 선택하면 아래 카드에 역할별 실행 인사이트가 바로 표시됩니다.";
    }
    if (currentLocale === "de") {
        return "Wählen Sie Land und Stadt, dann erscheint unten sofort die rollenbezogene Ausführungs-Insight.";
    }
    return "Select country and city to load role-specific execution insight below.";
}

function buildPersonaHelperText() {
    const personas = getSelectedPersonaLabels();
    const purpose = purposeInput.value.trim();
    if (!personas.length && !purpose) return t("personaHelper");

    const sample = personas.slice(0, 2).join(", ");
    if (currentLocale === "ko") {
        if (personas.length && !purpose) {
            return `${sample}${personas.length > 2 ? " 외" : ""} 조합은 좋습니다. 이제 집에 들어오는 순간이나 반복되는 불편 1가지만 적으면 타겟 해석이 훨씬 선명해집니다.`;
        }
        return `${sample || "현재 타겟"} 기준으로 맥락이 잡히고 있습니다. 지금 입력한 상황 설명이 결과 톤과 메시지 우선순위를 직접 바꾸게 됩니다.`;
    }
    if (currentLocale === "de") {
        if (personas.length && !purpose) {
            return `Die Kombination ${sample}${personas.length > 2 ? " und weitere" : ""} ist gut. Ergänzen Sie jetzt nur noch einen konkreten Moment oder ein wiederkehrendes Problem.`;
        }
        return `Für ${sample || "diese Zielgruppe"} entsteht bereits ein klarerer Kontext. Ihre Situationsbeschreibung beeinflusst jetzt direkt Ton und Prioritäten des Ergebnisses.`;
    }
    if (personas.length && !purpose) {
        return `${sample}${personas.length > 2 ? " and more" : ""} is a strong start. Add one concrete life moment or recurring friction point and the target read will sharpen quickly.`;
    }
    return `The context around ${sample || "this audience"} is taking shape. The situation you describe here will directly change the tone and priority of the final scenario.`;
}

function buildDeviceHelperText() {
    const devices = getSelectedDeviceLabels();
    if (!devices.length) return t("deviceHelper");

    const sample = devices.slice(0, 3).join(", ");
    if (currentLocale === "ko") {
        return `${sample}${devices.length > 3 ? " 외" : ""} 조합으로 읽히고 있습니다. 상위를 먼저 체크한 뒤 필요 없는 기기만 빼면 시나리오의 밀도가 자연스럽게 정리됩니다.`;
    }
    if (currentLocale === "de") {
        return `Aktuell ist die Kombination ${sample}${devices.length > 3 ? " und weitere" : ""} gewählt. Aktivieren Sie zuerst die Oberkategorie und entfernen Sie dann nur die irrelevanten Geräte.`;
    }
    return `The current mix is reading as ${sample}${devices.length > 3 ? " and more" : ""}. Start broad with the parent category, then remove only the devices that do not belong in the scene.`;
}

function inferFirstUseScene(devices) {
    const set = new Set(devices);

    if (set.has("TV") && set.has("에어컨")) {
        return currentLocale === "ko"
            ? '"퇴근 후 집에 들어오자마자 TV에 맞춤 추천이 뜨고, 실내 환경이 바로 쾌적하게 맞춰지는 장면"'
            : '"coming home to a tailored prompt on the TV while the room climate adjusts right away"';
    }
    if (set.has("냉장고") && (set.has("세탁기") || set.has("건조기"))) {
        return currentLocale === "ko"
            ? '"저녁 준비와 집안일 시작을 동시에 가볍게 여는 장면"'
            : '"starting dinner prep and household chores in one lighter flow"';
    }
    if (set.has("로봇청소기") && set.has("센서")) {
        return currentLocale === "ko"
            ? '"외출 중에도 집 상태를 안심하고 관리하는 장면"'
            : '"managing the home with reassurance even while away"';
    }
    if (set.has("조명") && set.has("스피커")) {
        return currentLocale === "ko"
            ? '"말 한마디로 저녁 분위기와 루틴이 함께 바뀌는 장면"'
            : '"changing the evening mood and routine together with one voice prompt"';
    }

    return currentLocale === "ko"
        ? '"사용자가 복잡한 설정 없이 바로 체감 가치를 느끼는 첫 순간"'
        : '"the first moment when the user feels immediate value without complex setup"';
}

function inferSegmentTraits(selectedSegment, purpose) {
    const isKo = currentLocale === "ko";
    const text = `${selectedSegment} ${purpose}`.toLowerCase();
    const traits = [];
    const added = new Set();

    function add(traitKo, traitEn) {
        const t = isKo ? traitKo : traitEn;
        if (!added.has(t)) { added.add(t); traits.push(t); }
    }

    // ── 텍스트 기반 추론 (기존) ──
    if (text.includes("맞벌이") || text.includes("퇴근") || text.includes("재택") || text.includes("하이브리드")) add("시간 가치 민감", "time-value sensitivity");
    if (text.includes("아이") || text.includes("육아") || text.includes("가족") || text.includes("자녀")) add("가구 운영 복잡도 높음", "high household complexity");
    if (text.includes("부모") || text.includes("시니어") || text.includes("돌봄")) add("케어/안심 니즈 큼", "strong care and reassurance needs");
    if (text.includes("에너지") || text.includes("생활비") || text.includes("절감") || text.includes("비용")) add("지출 민감도 높음", "high spending sensitivity");
    if (text.includes("주말") || text.includes("여가") || text.includes("웰니스")) add("여가 시간 품질 중시", "high value on leisure quality");
    if (text.includes("펫") || text.includes("반려") || text.includes("pet")) add("원격 확인 수요 존재", "remote check-in demand");
    if (text.includes("건강") || text.includes("피트니스") || text.includes("health") || text.includes("wellness")) add("건강·웰니스 중시", "health and wellness focus");

    // ── 실제 선택된 persona ID 기반 추론 (강화) ──
    const personaIds = new Set(getSelectedPersonaOptionIds());

    // 펫 케어 (t_pet + int_pet 모두)
    if (personaIds.has("t_pet") || personaIds.has("int_pet")) add("원격 확인 수요 존재", "remote check-in demand");
    // 자녀 관련 (hh_ + ls_ + t_ + int_)
    if (personaIds.has("hh_young_kids") || personaIds.has("hh_school_kids") || personaIds.has("t_multi_kids") || personaIds.has("ls_parenting") || personaIds.has("int_kids")) add("가구 운영 복잡도 높음", "high household complexity");
    // 시니어 케어 (hh_ + ls_ + t_ + int_)
    if (personaIds.has("hh_senior") || personaIds.has("hh_multi_gen") || personaIds.has("ls_senior") || personaIds.has("t_parent_care") || personaIds.has("t_parent_away") || personaIds.has("int_senior")) add("케어/안심 니즈 큼", "strong care and reassurance needs");
    // 건강/웰니스
    if (personaIds.has("t_wellness") || personaIds.has("ls_empty_nest") || personaIds.has("int_health")) add("건강·웰니스 중시", "health and wellness focus");
    // 재택/하이브리드
    if (personaIds.has("t_remote") || personaIds.has("t_dual_income")) add("시간 가치 민감", "time-value sensitivity");
    // 보안
    if (personaIds.has("t_security") || personaIds.has("t_long_away") || personaIds.has("int_safe")) add("보안/안전 중시", "security and safety focus");
    // 가사 효율
    if (personaIds.has("t_efficiency") || personaIds.has("int_chores")) add("가사 효율 추구", "chore efficiency focus");
    // 맞벌이
    if (personaIds.has("t_dual_income") || personaIds.has("t_solo_parent")) add("시간 가치 민감", "time-value sensitivity");
    // 수면
    if (personaIds.has("t_night_shift") || personaIds.has("int_sleep")) add("수면 품질 중시", "sleep quality focus");
    // 여가/분위기
    if (personaIds.has("int_mood") || personaIds.has("ls_newlywed")) add("여가 시간 품질 중시", "high value on leisure quality");
    // 에너지
    if (personaIds.has("int_energy")) add("지출 민감도 높음", "high spending sensitivity");

    // ── 거주지 유형 (A 그룹) 기반 추론 ──
    if (personaIds.has("h_apt") || personaIds.has("h_villa")) add("공동주거 환경 최적화", "shared-building environment optimization");
    if (personaIds.has("h_compact")) add("소형 공간 효율화", "compact space efficiency");
    if (personaIds.has("h_house") || personaIds.has("h_townhouse")) add("독립 주거 자동화", "independent dwelling automation");
    if (personaIds.has("h_shared")) add("공용 공간 관리 니즈", "shared space management needs");
    if (personaIds.has("h_care")) add("케어/안심 니즈 큼", "strong care and reassurance needs");

    // ── 세대 구성 (B 그룹) 미매핑 항목 ──
    if (personaIds.has("hh_solo")) add("소형 공간 효율화", "compact space efficiency");
    if (personaIds.has("hh_couple")) add("생활 동선 공유", "shared daily routine");
    if (personaIds.has("hh_adult_kids")) add("개인 공간·공용 공간 분리", "private and shared space separation");
    if (personaIds.has("t_single_income")) add("지출 민감도 높음", "high spending sensitivity");
    if (personaIds.has("t_acc_needs")) add("접근성 배려 자동화", "accessibility-aware automation");

    // ── 라이프스테이지 (C 그룹) 미매핑 항목 ──
    if (personaIds.has("ls_starter")) add("즉시 체감 가치 선호", "preference for immediate value");
    if (personaIds.has("ls_settled") || personaIds.has("ls_established")) add("안정적 생활 루틴 중시", "stable routine focus");
    if (personaIds.has("t_weekend_out")) add("외출 전·귀가 시 자동화 수요", "pre-departure and return automation demand");
    if (personaIds.has("t_homebody")) add("여가 시간 품질 중시", "high value on leisure quality");
    if (personaIds.has("int_air")) add("실내 환경 민감", "indoor environment sensitivity");
    if (personaIds.has("int_lights")) add("분위기·조명 중시", "ambiance and lighting focus");
    if (personaIds.has("int_find")) add("물건 위치 추적 수요", "object tracking demand");

    // Q2 미선택 시 빈 배열 반환 — 근거 없는 기본값을 채우지 않음
    return traits;
}

function inferScenarioDirection(traits, purpose) {
    const isKo = currentLocale === "ko";
    const text = `${traits.join(" ")} ${purpose}`.toLowerCase();
    const personaIds = new Set(getSelectedPersonaOptionIds());
    const directions = [];

    // 명시적 선택 기반 (우선순위 높음)
    if (personaIds.has("t_pet") || personaIds.has("int_pet")) directions.push(isKo ? "반려동물 케어와 안심 모니터링" : "pet care and peace-of-mind monitoring");
    if (personaIds.has("hh_young_kids") || personaIds.has("hh_school_kids") || personaIds.has("t_multi_kids") || personaIds.has("ls_parenting") || personaIds.has("int_kids"))
        directions.push(isKo ? "자녀 안전과 가족 돌봄 자동화" : "child safety and family care automation");
    if (personaIds.has("hh_senior") || personaIds.has("hh_multi_gen") || personaIds.has("t_parent_care") || personaIds.has("int_senior"))
        directions.push(isKo ? "시니어 돌봄과 원격 안심 확인" : "senior care and remote reassurance");
    if (personaIds.has("t_wellness") || personaIds.has("int_health"))
        directions.push(isKo ? "건강·웰니스 루틴 지원" : "health and wellness routine support");

    // 텍스트 기반 보완
    if (directions.length === 0) {
        if (text.includes("펫") || text.includes("반려") || text.includes("pet")) directions.push(isKo ? "반려동물 케어와 안심 모니터링" : "pet care and peace-of-mind monitoring");
        if (text.includes("케어") || text.includes("안심") || text.includes("돌봄")) directions.push(isKo ? "돌봄 부담 완화와 안심 강화" : "reduced care burden and stronger reassurance");
        if (text.includes("에너지") || text.includes("지출") || text.includes("비용")) directions.push(isKo ? "절감 효과를 눈에 보이게 보여주는 방향" : "visible savings and cost-control value");
        if (text.includes("여가") || text.includes("웰니스")) directions.push(isKo ? "주말과 저녁의 여유를 회복하는 방향" : "recovering weekend and evening ease");
    }

    if (directions.length === 0) return isKo ? "복잡한 집안 루틴을 가볍게 만드는 방향" : "making complex home routines feel lighter";
    return directions.slice(0, 2).join(isKo ? " + " : " + ");
}

function syncWizardUi() {
    document.querySelectorAll(".wizard-step").forEach((panel) => {
        panel.classList.toggle("active", Number(panel.dataset.step) === currentStep);
    });
    prevBtn.disabled = currentStep <= 2;
    nextBtn.classList.toggle("hidden", currentStep === 4);
    generateBtn.classList.toggle("hidden", currentStep !== 4);
    renderWizardProgress();

    // step 전환 시 이전 step-insight 즉시 클리어 (비동기 덮어쓰기 방지)
    ++latestStep2InsightRequest;
    stepInsight.innerHTML = "";

    updateStepInsight();

    // step 전환 시 이전 에러 메시지 클리어
    const errEl = resultDiv.querySelector(".error");
    if (errEl) errEl.remove();

    // Step 4가 아니면 큐레이션 프레임 & Output Flow Tracker 숨김/초기화
    const curationFrame = document.getElementById("curation-frame");
    if (curationFrame && currentStep !== 4) {
        curationFrame.classList.add("hidden");
    }
    const tracker = document.getElementById("output-flow-tracker");
    if (tracker && currentStep !== 4) {
        tracker.classList.add("hidden");
    }
    const mpFrame = document.getElementById("matching-process-frame");
    if (mpFrame && currentStep !== 4) {
        mpFrame.classList.add("hidden");
    }
    const categoryFrame = document.getElementById("output-category-frame");
    if (categoryFrame && currentStep !== 4) {
        categoryFrame.classList.add("hidden");
    }
    const campaignFrame = document.getElementById("campaign-output-frame");
    if (campaignFrame && currentStep !== 4) {
        campaignFrame.classList.add("hidden");
    }
    // 상태 배지 제거
    if (currentStep !== 4) {
        setSectionStatusBadge("curation-title", null);
        setSectionStatusBadge("category-title", null);
        setSectionStatusBadge("result-frame-title", null);
    }
}

function alignWizardStepViewport() {
    const activeStep = document.querySelector(`.wizard-step[data-step="${currentStep}"]`);
    if (!activeStep) return;

    const focusTarget = activeStep.querySelector(
        ".role-card.selected, .role-card, select, input[type='text'], textarea, input[type='checkbox']"
    );
    focusTarget?.focus({ preventScroll: true });

    // wizard-screen 섹션 헤더(Step Flow 제목)부터 보이도록 스크롤
    const wizardScreen = document.getElementById("wizard-screen");
    const scrollTarget = wizardScreen || activeStep;
    const yOffset = scrollTarget.getBoundingClientRect().top + window.pageYOffset - 10;
    window.scrollTo({ top: yOffset, behavior: "smooth" });
}

function moveStep(delta) {
    if (delta > 0 && !validateCurrentStep()) return;
    const nextStep = Math.min(4, Math.max(2, currentStep + delta));
    if (nextStep === currentStep) return;
    currentStep = nextStep;
    syncWizardUi();
    window.requestAnimationFrame(() => {
        alignWizardStepViewport();
    });
}

function validateCurrentStep() {
    // Q1 직무 선택 스킵 — 자동 기본값 보장
    if (currentStep === 1) return true;
    if (currentStep === 2 && !countrySelect.value) {
        resultDiv.innerHTML = `<p class="error">${t("countryMissing")}</p>`;
        return false;
    }
    if (currentStep === 3) {
        const missing = validateQ3Groups();
        if (missing.length > 0) {
            const labels = missing.join(", ");
            // step-insight 영역에 안내 표시 (resultDiv 대신)
            const insightEl = document.getElementById("step-insight");
            if (insightEl) {
                const warnHtml = `<div class="q2-action-prompt q2-action-warn" style="margin-top:8px">
                    <span class="q2-action-icon">⚠️</span>
                    <p>${currentLocale === "ko"
                        ? `<strong>${labels}</strong> 영역에서 최소 1개를 선택하거나 직접 입력해 주세요.`
                        : `Please select at least one option in: <strong>${labels}</strong>`}</p>
                </div>`;
                // 기존 경고가 있으면 교체
                const existing = insightEl.querySelector(".q2-action-warn");
                if (existing) existing.outerHTML = warnHtml;
                else insightEl.insertAdjacentHTML("beforeend", warnHtml);
            }
            return false;
        }
    }
    if (currentStep === 4 && getSelectedDevices().length === 0) {
        resultDiv.innerHTML = `<p class="error">${currentLocale === "ko" ? "Q3에서 기기를 하나 이상 선택해 주세요." : "Please select at least one device in Q3."}</p>`;
        return false;
    }
    return true;
}

function updateRoleBrief() {
    if (!roleBrief) return;
    const role = ROLE_LENSES.find((item) => item.id === roleSelect.value);
    if (!role) {
        roleBrief.innerHTML = "";
        return;
    }

    const guide = getRoleOptionGuide(role.id);
    const cards = (guide.whatYouGet || []).slice(0, 5).map((item) => (
        typeof item === "string" ? { title: item, meaning: "", example: "" } : item
    ));
    roleBrief.innerHTML = `
        <section class="role-brief-card">
            <header class="role-brief-head">
                <span class="role-brief-kicker">${escapeHtml(getRoleTitle(role.id))}</span>
                <p>${escapeHtml(getRoleBrief(role.id))}</p>
            </header>
            <article class="role-brief-block role-brief-fit">
                <h4>${currentLocale === "ko" ? "이 역할이 맞는 업무" : "Who this role fits"}</h4>
                <ul>${(guide.fitFor || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            </article>
            <div class="role-brief-block">
                <h4>${currentLocale === "ko" ? "선택하면 받는 마케팅 정보 (What You Get)" : "What You Get"}</h4>
                <div class="role-brief-items">
                    ${cards.map((card, index) => `
                        <article class="role-brief-item">
                            <p class="role-brief-item-index">${String(index + 1).padStart(2, "0")}</p>
                            <h5>${escapeHtml(card.title || "")}</h5>
                            <p class="role-brief-meaning">${escapeHtml(card.meaning || "")}</p>
                            <p class="role-brief-example">${escapeHtml(card.example || "")}</p>
                        </article>
                    `).join("")}
                </div>
            </div>
            <article class="role-brief-block role-brief-fallback">
                <h4>${currentLocale === "ko" ? "직무가 정확히 안 맞을 때" : "If your role is not an exact match"}</h4>
                <p>${escapeHtml(guide.fallback || "")}</p>
            </article>
        </section>
    `;
}

function getRoleOptionGuide(id) {
    const guides = {
        retail: {
            fitFor: currentLocale === "ko"
                ? [
                    "오프라인 매장 상담/시연 스크립트를 만드는 업무",
                    "매장 직원 교육, 세일즈 토크, 데모 흐름이 필요한 업무",
                    "상담 전환율을 높이는 현장 메시지가 필요한 업무"
                ]
                : [
                    "Teams creating in-store consultation and demo scripts",
                    "Teams running store staff enablement and sales talk flow",
                    "Teams improving consultation conversion on site"
                ],
            whatYouGet: currentLocale === "ko"
                ? [
                    {
                        title: "매장 첫 10초 한 문장",
                        meaning: "고객이 바로 이해하도록 첫 문장을 고정합니다.",
                        example: "예시: 집에 들어오자마자 자동으로 편안한 저녁 준비가 시작됩니다."
                    },
                    {
                        title: "30초 데모 흐름",
                        meaning: "문제 -> 해결 장면 순서로 빠르게 보여주는 구조입니다.",
                        example: "예시: 퇴근 후 집 도착 -> 추천 카드 -> 원탭 실행"
                    },
                    {
                        title: "추천 기기 조합",
                        meaning: "입문형과 확장형 제안을 나눠서 상담합니다.",
                        example: "예시: Entry 1대 / Core 2대 조합"
                    },
                    {
                        title: "설정 체크 순서",
                        meaning: "세팅 실패를 줄이는 최소 체크리스트입니다.",
                        example: "예시: 계정 로그인 -> 홈 생성 -> 기기 연결 -> 자동화 저장"
                    },
                    {
                        title: "호환성 사전 점검",
                        meaning: "현장에서 자주 터지는 이슈를 먼저 확인합니다.",
                        example: "예시: Wi-Fi 대역, 앱 버전, 계정 지역"
                    }
                ]
                : [
                    {
                        title: "First 10-second one-liner",
                        meaning: "A fixed opening line that customers understand immediately.",
                        example: "Example: Start your evening routine automatically as soon as you get home."
                    },
                    {
                        title: "30-second demo flow",
                        meaning: "Show problem -> solved moment in a clear sequence.",
                        example: "Example: Arrival trigger -> recommendation card -> one-tap run"
                    },
                    {
                        title: "Recommended device mix",
                        meaning: "Split proposals into entry and expansion bundles.",
                        example: "Example: Entry 1-device / Core 2-device set"
                    },
                    {
                        title: "Setup checklist order",
                        meaning: "A minimum checklist to reduce setup failure.",
                        example: "Example: Sign in -> create home -> connect device -> save automation"
                    },
                    {
                        title: "Compatibility pre-check",
                        meaning: "Quick checks for common in-store setup issues.",
                        example: "Example: Wi-Fi band, app version, account region"
                    }
                ],
            fallback: currentLocale === "ko"
                ? "직무가 애매하면 retail을 고르면 됩니다. 고객과의 첫 대화 문장, 데모 흐름, 추천 조합처럼 현장에서 바로 쓸 출력이 생성됩니다."
                : "If unclear, start with retail. You will get first-line talk tracks, demo flow, and ready-to-use recommendation mixes.",
            emphasized: currentLocale === "ko"
                ? ["현장 설명 흐름", "SmartThings 세팅", "호환성/실패 사례"]
                : ["Store explanation flow", "SmartThings setup", "Compatibility and failure cases"],
            deemphasized: currentLocale === "ko"
                ? ["업셀 연결 타이밍", "매장 적용용 메시지 톤", "현장 FAQ 핵심 질문"]
                : ["Upsell timing cues", "Store-ready message tone", "Core in-store FAQ prompts"]
        },
        dotcom: {
            fitFor: currentLocale === "ko"
                ? [
                    "PDP/랜딩/배너/FAQ 등 웹 전환 구조를 다루는 업무",
                    "장바구니 진입, 클릭률, 체류시간 등 전환 KPI를 다루는 업무",
                    "국가별 eStore 제품 노출/번들 구성을 관리하는 업무"
                ]
                : [
                    "Teams owning PDP, landing, banner, and FAQ conversion flow",
                    "Teams optimizing CTR, dwell time, and add-to-cart KPIs",
                    "Teams managing regional eStore product and bundle mapping"
                ],
            whatYouGet: currentLocale === "ko"
                ? [
                    {
                        title: "랜딩 첫 화면 메시지",
                        meaning: "첫 화면에서 어떤 가치부터 보여줄지 정합니다.",
                        example: "예시: '우리 집 저녁 루틴을 1탭으로 시작'"
                    },
                    {
                        title: "지역 eStore 도메인/제품 맵",
                        meaning: "국가별 연결 URL과 주력 제품 기준입니다.",
                        example: "예시: 국가 도메인 + 가용 제품 라인업"
                    },
                    {
                        title: "번들 구조 (Entry/Core/Premium)",
                        meaning: "가격-가치 단계별 추천을 구성합니다.",
                        example: "예시: Entry(기본) -> Core(주력) -> Premium(확장)"
                    },
                    {
                        title: "필수 vs 선택 기기",
                        meaning: "최소 구매 구성과 추가 구성을 분리합니다.",
                        example: "예시: 필수 1~2개 + 선택 확장 1개"
                    },
                    {
                        title: "Benefit -> Product 매핑",
                        meaning: "혜택 문장을 어떤 제품과 연결할지 정리합니다.",
                        example: "예시: '시간 절약' -> A제품 / '안심' -> B제품"
                    }
                ]
                : [
                    {
                        title: "First-screen landing message",
                        meaning: "Defines which value appears first above the fold.",
                        example: "Example: Start your evening routine with one tap."
                    },
                    {
                        title: "Regional eStore domain/product map",
                        meaning: "Country URL and product baseline for execution.",
                        example: "Example: Market domain + available product lineup"
                    },
                    {
                        title: "Bundle ladder (Entry/Core/Premium)",
                        meaning: "A step-up recommendation model by value and price.",
                        example: "Example: Entry -> Core -> Premium"
                    },
                    {
                        title: "Required vs optional devices",
                        meaning: "Separates minimum setup from expansion options.",
                        example: "Example: 1-2 required + 1 optional expansion"
                    },
                    {
                        title: "Benefit -> Product mapping",
                        meaning: "Links each user benefit to concrete products.",
                        example: "Example: Time-saving -> Product A / Reassurance -> Product B"
                    }
                ],
            fallback: currentLocale === "ko"
                ? "직무가 애매하지만 온라인 전환이 목표라면 dotcom을 고르세요. 메시지-CTA-상품 매핑까지 웹 실행형 결과를 받을 수 있습니다."
                : "If unclear but online conversion is your goal, choose dotcom. You will get message-CTA-product mapping ready for web execution.",
            emphasized: currentLocale === "ko"
                ? ["전환률/객단가 관점", "지역 상품 매트릭스", "번들 구성"]
                : ["Conversion/AOV perspective", "Regional product matrix", "Bundle composition"],
            deemphasized: currentLocale === "ko"
                ? ["PDP 문장 길이 가이드", "FAQ 재배치 포인트", "CTA 우선순위 검증 항목"]
                : ["PDP copy-length guide", "FAQ reorder points", "CTA priority checks"]
        },
        brand: {
            fitFor: currentLocale === "ko"
                ? [
                    "캠페인 메인 메시지/카피 톤을 기획하는 업무",
                    "글로벌 메시지와 로컬 메시지 체계를 운영하는 업무",
                    "시즌/이벤트 중심 통합 캠페인을 기획하는 업무"
                ]
                : [
                    "Teams crafting campaign-level message and copy tone",
                    "Teams operating global and local message frameworks",
                    "Teams planning season and event-led integrated campaigns"
                ],
            whatYouGet: currentLocale === "ko"
                ? [
                    {
                        title: "브랜드 핵심 한 문장",
                        meaning: "브랜드 톤을 유지한 대표 문장입니다.",
                        example: "예시: 우리 집 루틴을 더 가볍게."
                    },
                    {
                        title: "단문/장문 메시지 세트",
                        meaning: "짧은 광고 문장과 긴 설명 문장을 함께 제공합니다.",
                        example: "예시: 8~12자 단문 + 상세 설명 2~3문장"
                    },
                    {
                        title: "글로벌 vs 로컬 메시지 분리",
                        meaning: "공통 메시지와 국가별 변주를 구분합니다.",
                        example: "예시: Global '편안함' / Local '퇴근 직후 루틴'"
                    },
                    {
                        title: "시즌/이벤트 캠페인 흐름",
                        meaning: "런칭-프로모션-리마인드 순서로 운영합니다.",
                        example: "예시: 성수기 전 런칭 -> 시즌 프로모션 -> 리마인드"
                    },
                    {
                        title: "콘텐츠 톤 가이드",
                        meaning: "영상/소셜/배너에서 같은 말투를 유지합니다.",
                        example: "예시: 따뜻하고 간결한 톤으로 전 채널 통일"
                    }
                ]
                : [
                    {
                        title: "Core brand one-liner",
                        meaning: "A signature line that keeps the brand tone.",
                        example: "Example: Make your home routine feel lighter."
                    },
                    {
                        title: "Short/long message set",
                        meaning: "A short ad line and a longer narrative line together.",
                        example: "Example: 8-12 word short line + 2-3 sentence long copy"
                    },
                    {
                        title: "Global vs local split",
                        meaning: "Separates universal message from market adaptation.",
                        example: "Example: Global 'ease' / Local 'after-work routine'"
                    },
                    {
                        title: "Season/event campaign flow",
                        meaning: "Operate in launch -> promotion -> reminder phases.",
                        example: "Example: Pre-season launch -> seasonal push -> reminder"
                    },
                    {
                        title: "Content tone guide",
                        meaning: "Keeps one voice across video, social, and banners.",
                        example: "Example: Warm and concise tone in all channels"
                    }
                ],
            fallback: currentLocale === "ko"
                ? "직무가 애매하지만 캠페인 톤과 브랜드 메시지가 중요하면 brand를 선택하세요. 감정 중심 카피와 글로벌/로컬 분리 구조를 바로 확인할 수 있습니다."
                : "If unclear but brand tone matters most, choose brand. You will get emotion-led copy and a global/local message split.",
            emphasized: currentLocale === "ko"
                ? ["문화 맥락 스토리텔링", "메시지 일관성", "브랜드 의미 강화"]
                : ["Culture-context storytelling", "Message consistency", "Brand meaning reinforcement"],
            deemphasized: currentLocale === "ko"
                ? ["캠페인 문장 톤 가이드", "로컬 카피 변주 기준", "시즌/이벤트 연결 키워드"]
                : ["Campaign tone guide", "Local copy variation rules", "Season/event linkage keywords"]
        }
    };

    return guides[id] || {
        fitFor: [getRoleBrief(id)],
        whatYouGet: [getRoleBrief(id)],
        emphasized: [getRoleFocus(id)],
        deemphasized: [],
        fallback: currentLocale === "ko" ? "가장 가까운 역할을 먼저 고른 뒤 결과를 비교해 조정하세요." : "Pick the closest role first, then compare outputs and adjust."
    };
}

function updateStatePreview() {
    // Summary side panel intentionally removed.
}

function inferMissionBucket(purpose, selectedDeviceGroups = []) {
    const text = purpose.toLowerCase();
    if (text.includes("에너지") || text.includes("절약") || text.includes("비용")) return "Save";
    if (text.includes("안전") || text.includes("보안") || text.includes("secure")) return "Secure";
    if (text.includes("놀이") || text.includes("운동") || text.includes("엔터") || text.includes("게임") || text.includes("gaming")) return "Play";
    if (text.includes("가족") || text.includes("돌봄") || text.includes("반려") || text.includes("펫") || text.includes("시니어")) return "Care";
    // Device group-based fallback when purpose text is ambiguous
    if (selectedDeviceGroups.includes("enhanced-mood")) return "Play";
    if (selectedDeviceGroups.includes("care-scenarios")) return "Care";
    if (selectedDeviceGroups.includes("home-safe")) return "Secure";
    if (selectedDeviceGroups.includes("save-energy") || selectedDeviceGroups.includes("chores-help")) return "Save";
    if (selectedDeviceGroups.includes("sleep-well")) return "Save";
    return "Discover";
}

function generateScenario() {
    if (!validateCurrentStep()) return;

    // Output Flow Tracker 시작: STEP 1 활성
    updateOutputFlowTracker(1, { 1: "active", 2: "waiting", 3: "waiting" });
    const isKoGen = currentLocale === "ko";
    updateSectionHelper("curation-helper",
        isKoGen ? "🔍 입력 정보를 분석하여 최적의 시나리오를 찾고 있습니다…" : "🔍 Analyzing your inputs to find the best scenarios…");
    setSectionStatusBadge("curation-title", "working");

    // Build 시 큐레이션 먼저 실행
    runCuration();

    const role = ROLE_LENSES.find((item) => item.id === roleSelect.value);
    const rawPurpose = purposeInput.value.trim();
    const selectedMarket = marketOptions.find((market) => market.siteCode === countrySelect.value);
    const country = resolveCountry(selectedMarket);
    const city = getCityValue();
    const rawSelectedSegment = getSelectedSegment();
    const purpose = rawPurpose || buildFallbackPurpose(rawSelectedSegment);
    const selectedSegment = rawSelectedSegment || buildFallbackSegment(rawPurpose);
    const selectedDevices = getSelectedDevices();
    const selectedDeviceLabels = getSelectedDeviceLabels();

    if (!role || !country || (!purpose && !selectedSegment) || selectedDevices.length === 0) {
        resultDiv.innerHTML = `<p class="error">${t("allMissing")}</p>`;
        return;
    }

    const selectedDeviceGroups = getSelectedDeviceGroupIds();
    const intent = analyzeIntent(purpose, selectedSegment, selectedDevices, selectedDeviceGroups);
    const services = findRelevantServices(intent);
    const deviceDecision = resolveDevice(country, selectedDevices[0], services, selectedDevices);
    const exploreGrounding = buildExploreGrounding(country, city, selectedSegment, intent, deviceDecision, services);
    const narrative = buildNarrative(country, city, selectedSegment, intent, deviceDecision, services);
    const automation = buildAutomationSkeleton(country, intent, deviceDecision, services);
    const facts = buildFacts(country, city, selectedSegment, deviceDecision, services, exploreGrounding);
    const lensOutputs = buildRoleLensOutputs(role, narrative, country, selectedMarket, deviceDecision, services, selectedSegment, intent, exploreGrounding);
    const metrics = buildSuccessMetrics(role, intent, deviceDecision);
    const segmentData = buildTargetSegment(country, city, selectedSegment, intent, exploreGrounding);
    const setupGuide = buildSetupGuide(deviceDecision, services, role);
    const marketability = buildMarketability(country, intent, deviceDecision, services, role, selectedSegment, exploreGrounding);
    const gateReport = runChecks(country, intent, deviceDecision, automation);
    const referenceLinks = buildReferenceLinks(intent, services);
    const summaryBullets = buildSummaryBullets(country, city, selectedSegment, intent, deviceDecision, services, exploreGrounding);
    const detailedScenario = buildDetailedScenario(country, city, selectedSegment, intent, deviceDecision, services);
    const marketingMessages = buildMarketingMessages(role, selectedSegment, intent, services, exploreGrounding, deviceDecision);
    const benefits = buildBenefits(intent, services, exploreGrounding);
    const segmentAnalysis = buildSegmentAnalysis(country, city, selectedSegment, intent, exploreGrounding);
    const campaignTiming = buildCampaignTiming(intent, exploreGrounding);
    const deviceGuide = buildDeviceGuide(country, deviceDecision, services);

    // New Schema 11 additions
    const storyboard = buildStoryboardWebtoon(intent, services, deviceDecision);
    const sceneHook = buildSceneHook(intent, services);
    const otpPlace = buildOtpPlace(country, city, intent);
    const journeyTable = buildCustomerJourneyTable(intent, services, deviceDecision);
    const addonPack = buildAddonPack(role, intent, services, deviceDecision);
    const reflectionCheck = buildReflectionCheck(intent, services, exploreGrounding);

    latestPayload = {
        title: buildTitle(role, intent, selectedSegment, deviceDecision),
        summary: buildSummary(country, selectedSegment, intent, deviceDecision, services),
        narrative,
        automation,
        facts,
        lensOutputs,
        metrics,
        segmentData,
        setupGuide,
        marketability,
        gateReport,
        exploreGrounding,
        referenceLinks,
        summaryBullets,
        detailedScenario,
        marketingMessages,
        benefits,
        segmentAnalysis,
        campaignTiming,
        deviceGuide,
        storyboard,
        sceneHook,
        otpPlace,
        journeyTable,
        addonPack,
        reflectionCheck,
        scenarioMeta: {
            purpose: intent.purpose,
            missionBucket: intent.missionBucket,
            selectedSegment,
            roleId: role.id,
            countryName: getCountryName(country.countryCode),
            city: city || ""
        },
        state: {
            role: getRoleTitle(role.id),
            market: selectedMarket?.label || "",
            city,
            segment: selectedSegment,
            devices: selectedDeviceLabels.length > 0 ? selectedDeviceLabels : selectedDevices.map((device) => getCategoryName(device))
        }
    };

    activeLensTab = "overview";

    aiScenarioContext = {
        role: getRoleTitle(role.id),
        roleId: role.id,
        countryCode: country.countryCode,
        country: getCountryName(country.countryCode),
        city: city || "",
        cityDisplay: getCityDisplayValue(country.countryCode, city || ""),
        segment: selectedSegment,
        purpose,
        devices: selectedDeviceLabels.length > 0 ? selectedDeviceLabels : selectedDevices.map((device) => getCategoryName(device)),
        deviceGroups: selectedDeviceGroups,
        intentTags: [...(intent.tags || [])],
        missionBucket: intent.missionBucket,
        locale: currentLocale,
        provider: selectedProvider,
        selectionSummary: latestSelectionSummary || null
    };

    // 매칭 프로세스 카드 표시 중이면 AI 즉시 시작하지 않음 (사용자가 시나리오 선택 후 시작)
    const mpFrame = document.getElementById("matching-process-frame");
    if (mpFrame && !mpFrame.classList.contains("hidden") && !_mpBypassProcess) {
        // 프로세스 카드 → 큐레이션 결과 → 시나리오 선택 → 카테고리 선택 → AI 생성 순서로 진행
        return;
    }

    // Fallback local path
    if (selectedProvider === "none" || !selectedProvider) {
        renderScenario(latestPayload);
        return;
    }
    // AI mode: stream via the server-managed OpenAI endpoint
    streamGenerateScenario(aiScenarioContext);
}

async function streamGenerateScenario(context) {
    if (aiGenerating) return;
    aiGenerating = true;
    aiOutputText = "";
    latestStructuredOutput = null;  // 새 생성 시작 시 이전 구조화 output 리셋

    // STEP 3 활성 — AI 생성 시작
    updateOutputFlowTracker(3, { 1: "done", 2: "done", 3: "active" });
    const isKoStream = currentLocale === "ko";
    updateSectionHelper("result-helper",
        isKoStream ? "🤖 AI가 맞춤형 시나리오를 생성하고 있습니다. 잠시만 기다려 주세요…" : "🤖 AI is building your custom scenario. Please wait…");

    // Show streaming UI
    resultDiv.innerHTML = buildStreamingUI(context);
    scrollToResult();
    const _streamPizzaInterval = startStreamingPizzaProgress();

    // Fetch live region insight for grounding (best-effort)
    let regionInsight = null;
    try {
        const insightController = new AbortController();
        const insightTimer = setTimeout(() => insightController.abort(), REGION_INSIGHT_CLIENT_TIMEOUT_MS);
        const insightUrl = `${REGION_INSIGHT_API}?country=${encodeURIComponent(context.country)}&city=${encodeURIComponent(context.city || "")}&locale=${encodeURIComponent(context.locale)}&role=${encodeURIComponent(context.roleId)}`;
        const insightRes = await fetch(insightUrl, { credentials: "include", signal: insightController.signal });
        clearTimeout(insightTimer);
        if (insightRes.ok) {
            const insightJson = await insightRes.json();
            if (insightJson.ok) regionInsight = insightJson.data;
        }
    } catch { /* region insight is optional */ }

    const bodyPayload = {
        ...context,
        regionInsight
    };

    // 디버그: selectionSummary 전달 확인
    if (context.selectionSummary) {
        console.info("[generate] JSON mode: selectionSummary with", context.selectionSummary.selectedScenarios?.length, "scenarios");
    } else {
        console.info("[generate] Markdown mode: no selectionSummary");
    }

    let response;
    try {
        response = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(bodyPayload)
        });
    } catch (err) {
        aiGenerating = false;
        console.warn("API unavailable:", err.message);
        renderGenerateError(context, currentLocale === "ko"
            ? "생성 서버에 연결하지 못했습니다. 정적 예시 대신 실제 오류를 표시합니다."
            : "Could not reach the generation server. Showing the real error instead of a static example.");
        return;
    }

    if (!response.ok) {
        aiGenerating = false;
        const errData = await response.json().catch(() => ({}));
        if (response.status === 401) {
            renderGenerateError(context, currentLocale === "ko"
                ? "세션이 만료됐습니다. 다시 로그인해 주세요."
                : "Session expired. Please log in again.");
        } else if (response.status === 429 || errData?.error?.code === "BUDGET_EXCEEDED") {
            const msg = errData?.error?.message || (currentLocale === "ko" ? "월간 AI 예산 한도에 도달했습니다." : "Monthly AI budget limit reached.");
            renderGenerateError(context, msg);
        } else {
            const msg = errData?.error?.message || `Server error ${response.status}`;
            console.warn("AI generate failed:", msg);
            renderGenerateError(context, msg, response.status);
        }
        return;
    }

    const streamOutput = resultDiv.querySelector(".ai-stream-output");
    const statusEl = resultDiv.querySelector(".ai-stream-status");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const processStream = async () => {
        while (true) {
            let done, value;
            try {
                ({ done, value } = await reader.read());
            } catch {
                break;
            }
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop();

            for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const data = line.slice(6).trim();
                let event;
                try { event = JSON.parse(data); } catch { continue; }

                if (event.type === "chunk") {
                    aiOutputText += event.text;
                    if (streamOutput) {
                        streamOutput.textContent = aiOutputText;
                        streamOutput.scrollTop = streamOutput.scrollHeight;
                    }
                } else if (event.type === "done") {
                    break;
                } else if (event.type === "error") {
                    aiGenerating = false;
                    console.warn("AI stream event error:", event.message || "Unknown error");
                    renderGenerateError(context, event.message || (currentLocale === "ko" ? "스트리밍 생성 중 오류가 발생했습니다." : "Streaming generation failed."));
                    return;
                }
            }
        }

        aiGenerating = false;

        // STEP 3 완료
        updateOutputFlowTracker(3, { 1: "done", 2: "done", 3: "done" });
        const isKoDone = currentLocale === "ko";
        updateSectionHelper("result-helper",
            isKoDone ? "✅ 시나리오 생성이 완료되었습니다. 아래에서 결과를 확인하세요." : "✅ Scenario generation complete. Review the results below.");

        // JSON 모드 시도: selectionSummary가 있으면 JSON 파싱 우선
        if (context.selectionSummary && typeof extractJsonFromAIOutput === "function") {
            try {
                const { json: parsed } = extractJsonFromAIOutput(aiOutputText);
                if (parsed && parsed.transformation) {
                    const { valid, output, errors } = validateAndNormalizeOutput(parsed, context.selectionSummary);
                    if (!valid) console.warn("[generate] JSON schema validation warnings:", errors);
                    renderStructuredOutput(output, context);
                    return;
                }
                console.warn("[generate] JSON parse succeeded but no 'transformation' key. Keys found:", parsed ? Object.keys(parsed) : "null");
            } catch (jsonErr) {
                console.warn("[generate] JSON extraction failed:", jsonErr.message);
            }
            console.info("[generate] Falling back to markdown render. AI output starts with:", aiOutputText.substring(0, 100));
        }
        // JSON 파싱 실패 또는 selectionSummary 없음 → 기존 마크다운 렌더링
        renderAIResult(aiOutputText, context);
    };

    processStream().catch((err) => {
        aiGenerating = false;
        console.error("Stream processing error:", err);
        renderGenerateError(context, currentLocale === "ko"
            ? "스트리밍 처리 중 오류가 발생했습니다."
            : "A streaming error occurred.");
    });
}

function renderGenerateError(context, message, statusCode = "") {
    const title = currentLocale === "ko" ? "AI 생성이 완료되지 않았습니다" : "AI generation did not complete";
    const retry = currentLocale === "ko"
        ? "API 응답이 정상적으로 돌아오면 01~07 형식으로 출력됩니다."
        : "Once the API responds normally, the result will render in the 01–07 format.";
    const statusText = statusCode ? `${currentLocale === "ko" ? "상태 코드" : "Status"}: ${statusCode}` : "";

    const errSelCard = context.selectionSummary
        ? renderExploreSelectionCard(context.selectionSummary)
        : buildSelectionSummaryCard(context);
    resultDiv.innerHTML = `
        <article class="scenario-output ai-result ai-result--error">
            <div class="ai-result-meta">
                <span class="ai-result-badge">${currentLocale === "ko" ? "AI Error" : "AI Error"}</span>
                <span class="ai-result-context">${escapeHtml(context.role || "")}</span>
            </div>
            ${errSelCard}
            <div class="ai-result-body">
                <h3>${escapeHtml(title)}</h3>
                <p class="error">${escapeHtml(message || (currentLocale === "ko" ? "알 수 없는 오류" : "Unknown error"))}</p>
                ${statusText ? `<p>${escapeHtml(statusText)}</p>` : ""}
                <p>${escapeHtml(retry)}</p>
            </div>
        </article>
    `;
    scrollToResult();
}

function getMissionBucketLabel(missionBucket) {
    const labels = {
        Discover: { ko: "Discover", en: "Discover" },
        Save: { ko: "Save", en: "Save" },
        Care: { ko: "Care", en: "Care" },
        Secure: { ko: "Secure", en: "Secure" },
        Play: { ko: "Play", en: "Play" }
    };
    const key = String(missionBucket || "Discover");
    return labels[key]?.[currentLocale] || labels[key]?.en || key;
}

function buildSelectionSummaryCard(context) {
    const copy = currentLocale === "ko"
        ? {
            market: "시장",
            target: "타겟",
            value: "반영할 가치",
            devices: "반영 기기",
            purpose: "상황 메모"
        }
        : {
            market: "Market",
            target: "Target",
            value: "Value to reflect",
            devices: "Devices",
            purpose: "Scenario note"
        };

    const cityText = context.cityDisplay || context.city || "";
    const marketText = `${context.country}${cityText ? ` / ${cityText}` : ""}`;
    const deviceItems = (context.devices || []).slice(0, 6).map((device) => `<span class="ai-selection-chip">${escapeHtml(device)}</span>`).join("");

    return `
        <section class="ai-selection-card">
            <div class="ai-selection-grid">
                <div class="ai-selection-block">
                    <span class="ai-selection-label">${escapeHtml(copy.market)}</span>
                    <strong>${escapeHtml(marketText)}</strong>
                </div>
                <div class="ai-selection-block">
                    <span class="ai-selection-label">${escapeHtml(copy.value)}</span>
                    <strong>${escapeHtml(getMissionBucketLabel(context.missionBucket))}</strong>
                </div>
                <div class="ai-selection-block ai-selection-block--wide">
                    <span class="ai-selection-label">${escapeHtml(copy.target)}</span>
                    <strong>${escapeHtml(context.segment || "-")}</strong>
                </div>
                <div class="ai-selection-block ai-selection-block--wide">
                    <span class="ai-selection-label">${escapeHtml(copy.devices)}</span>
                    <div class="ai-selection-chip-row">${deviceItems || `<span class="ai-selection-chip">${escapeHtml(currentLocale === "ko" ? "선택 기기 없음" : "No devices selected")}</span>`}</div>
                </div>
                ${context.purpose ? `
                    <div class="ai-selection-block ai-selection-block--wide">
                        <span class="ai-selection-label">${escapeHtml(copy.purpose)}</span>
                        <strong>${escapeHtml(context.purpose)}</strong>
                    </div>
                ` : ""}
            </div>
        </section>
    `;
}

/**
 * Explore 선택 근거 카드 — Selection Stage 산출물을 시각화
 * selectionSummary가 없으면 빈 문자열 반환 (기존 buildSelectionSummaryCard로 fallback)
 */
/**
 * Structured Output 렌더러 — JSON 스키마 기반 AI 출력용
 * 마케터용 / 일반 사용자용 탭 전환 포함
 */
function renderStructuredOutput(output, context) {
    latestStructuredOutput = output;  // 전역 저장 — export, refinement에서 사용
    const isKo = (output.locale || currentLocale) === "ko";
    const selCard = output.selection
        ? renderExploreSelectionCard(output.selection)
        : buildSelectionSummaryCard(context);

    const tx = output.transformation || {};
    const mo = tx.marketerOutput || {};
    const co = tx.consumerOutput || {};

    // 마케터용 output HTML
    const marketerHtml = renderMarketerPanel(mo, isKo);
    // 일반 사용자용 output HTML
    const consumerHtml = renderConsumerPanel(co, isKo);
    // 가치 하이라이트
    const valuesHtml = (output.valueHighlights || []).map(v =>
        `<div class="str-value-item"><span class="sel-value-badge sel-value-${(v.value || "").toLowerCase()}">${escapeHtml(v.value)}</span><span>${escapeHtml(v.description)}</span></div>`
    ).join("");
    // O-I-I 인사이트
    const oii = output.localizedInsight;
    const insightHtml = oii ? `
        <div class="str-insight-block">
            <h4>${isKo ? "지역 인사이트" : "Local Insight"}</h4>
            <div class="str-oii"><strong>${isKo ? "관찰" : "Observation"}:</strong> ${escapeHtml(oii.observation || "")}</div>
            <div class="str-oii"><strong>${isKo ? "인사이트" : "Insight"}:</strong> ${escapeHtml(oii.insight || "")}</div>
            <div class="str-oii"><strong>${isKo ? "함의" : "Implication"}:</strong> ${escapeHtml(oii.implication || "")}</div>
        </div>
    ` : "";
    // 출처 추적
    const st = output.sourceTrace || tx.sourceTrace;
    const sourceHtml = st ? `<div class="str-source-trace">${isKo ? "출처" : "Source"}: ${escapeHtml(typeof st === "string" ? st : `Explore ${st.exploreVersion} > ${st.articleTitle} > ${st.storyTitle}`)}</div>` : "";

    const completionBanner = buildCompletionBanner(context, isKo);
    const curationSummary = buildCurationSummaryInline(isKo);

    resultDiv.innerHTML = `
        <article class="scenario-output ai-result str-output">
            ${completionBanner}
            <div class="ai-result-meta">
                <span class="ai-result-badge">${context.provider === "claude" ? "Claude" : "GPT"} ${isKo ? "생성 결과" : "Generated"}</span>
                <span class="ai-result-context">${escapeHtml(context.role)}</span>
                <button type="button" class="tab-btn ai-copy-btn" id="str-copy-btn">${isKo ? "복사" : "Copy"}</button>
            </div>
            ${curationSummary}
            ${selCard}
            <div class="str-tab-bar">
                <button class="str-tab active" data-tab="marketer">${isKo ? "마케터용" : "Marketer"}</button>
                <button class="str-tab" data-tab="consumer">${isKo ? "일반 사용자용" : "Consumer"}</button>
            </div>
            <div class="str-panel active" id="str-panel-marketer">${marketerHtml}</div>
            <div class="str-panel" id="str-panel-consumer">${consumerHtml}</div>
            ${valuesHtml ? `<div class="str-values-section"><h4>${isKo ? "강조 가치" : "Value Highlights"}</h4>${valuesHtml}</div>` : ""}
            ${insightHtml}
            ${sourceHtml}
            ${buildRefinementUI()}
        </article>
    `;

    // 탭 전환
    resultDiv.querySelectorAll(".str-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            resultDiv.querySelectorAll(".str-tab").forEach(t => t.classList.remove("active"));
            resultDiv.querySelectorAll(".str-panel").forEach(p => p.classList.remove("active"));
            tab.classList.add("active");
            document.getElementById(`str-panel-${tab.dataset.tab}`)?.classList.add("active");
        });
    });

    // 복사
    const copyBtn = resultDiv.querySelector("#str-copy-btn");
    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            const text = JSON.stringify(output, null, 2);
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.textContent = isKo ? "복사됨!" : "Copied!";
                setTimeout(() => { copyBtn.textContent = isKo ? "복사" : "Copy"; }, 2000);
            }).catch(() => {});
        });
    }

    bindRefinementPrompt(JSON.stringify(output, null, 2), context);
    scrollToResult();
}

function renderMarketerPanel(mo, isKo) {
    const headline = mo.headline || "";
    const summary = mo.summary || "";
    const why = mo.whyThisScenario || "";
    const tf = mo.targetFit || {};
    const channels = mo.channelStrategy || [];
    const copies = mo.copyOptions || [];
    const insight = mo.localInsight || "";
    const rd = mo.roleDifferentiation || {};

    const channelsHtml = channels.filter(ch => ch && ch.channel).map(ch => `
        <div class="str-channel-card">
            <div class="str-channel-name">${escapeHtml(ch.channel || "")}</div>
            <div class="str-channel-msg">${escapeHtml(ch.message || "")}</div>
            <div class="str-channel-meta"><span class="str-tone-badge">${escapeHtml(ch.tone || "")}</span><span>${escapeHtml(ch.format || "")}</span></div>
        </div>
    `).join("");

    const copiesHtml = copies.filter(c => c && (c.ko || c.en)).map((c, i) => `
        <div class="str-copy-option">
            <div class="str-copy-num">${isKo ? `옵션 ${i + 1}` : `Option ${i + 1}`}</div>
            <div class="str-copy-ko">${escapeHtml(c.ko || "")}</div>
            ${c.en ? `<div class="str-copy-en">${escapeHtml(c.en)}</div>` : ""}
            ${c.tone ? `<div class="str-copy-tone">${escapeHtml(c.tone)}</div>` : ""}
        </div>
    `).join("");

    const roleHtml = (rd.retail || rd.dotcom || rd.brand) ? `
        <div class="str-role-diff">
            <h4>${isKo ? "역할별 실행 방향" : "Role-specific Direction"}</h4>
            ${rd.retail ? `<div><strong>Retail:</strong> ${escapeHtml(rd.retail)}</div>` : ""}
            ${rd.dotcom ? `<div><strong>Dotcom:</strong> ${escapeHtml(rd.dotcom)}</div>` : ""}
            ${rd.brand ? `<div><strong>Brand:</strong> ${escapeHtml(rd.brand)}</div>` : ""}
        </div>
    ` : "";

    const sections = [];
    if (why) sections.push({ title: isKo ? "왜 이 시나리오인가" : "Why This Scenario", html: `<p>${escapeHtml(why)}</p>` });
    if (tf.primary) sections.push({ title: isKo ? "타깃 적합도" : "Target Fit", html: `<p><strong>${isKo ? "주 타깃" : "Primary"}:</strong> ${escapeHtml(tf.primary)}</p>${tf.secondary ? `<p><strong>${isKo ? "보조" : "Secondary"}:</strong> ${escapeHtml(tf.secondary)}</p>` : ""}${tf.estimatedReach ? `<p><strong>${isKo ? "추정 도달" : "Est. reach"}:</strong> ${escapeHtml(tf.estimatedReach)}</p>` : ""}` });
    if (channelsHtml) sections.push({ title: isKo ? "채널 전략" : "Channel Strategy", html: `<div class="str-channels-grid">${channelsHtml}</div>` });
    if (copiesHtml) sections.push({ title: isKo ? "카피 옵션" : "Copy Options", html: copiesHtml });
    if (insight) sections.push({ title: isKo ? "지역 인사이트" : "Local Insight", html: `<p>${escapeHtml(insight)}</p>` });
    if (rd.retail || rd.dotcom || rd.brand) sections.push({ title: isKo ? "역할별 실행 방향" : "Role-specific Direction", html: `${rd.retail ? `<div><strong>Retail:</strong> ${escapeHtml(rd.retail)}</div>` : ""}${rd.dotcom ? `<div><strong>Dotcom:</strong> ${escapeHtml(rd.dotcom)}</div>` : ""}${rd.brand ? `<div><strong>Brand:</strong> ${escapeHtml(rd.brand)}</div>` : ""}` });

    const accordionsHtml = sections.map((sec, i) =>
        `<details class="str-accordion"${i === 0 ? " open" : ""}><summary>${escapeHtml(sec.title)}</summary><div class="acc-body">${sec.html}</div></details>`
    ).join("");

    return `
        <div class="str-marketer">
            <h2 class="str-headline">${escapeHtml(headline)}</h2>
            <p class="str-summary">${escapeHtml(summary)}</p>
            ${accordionsHtml}
        </div>
    `;
}

function renderConsumerPanel(co, isKo) {
    const headline = co.headline || "";
    const what = co.whatItDoes || "";
    const setup = co.requiredSetup || {};
    const steps = co.setupSteps || [];
    const cautions = co.cautions || [];
    const alts = co.alternatives || [];

    const devicesHtml = (setup.devices || []).filter(d => d && d.name).map(d => `
        <div class="str-device-item">
            <span class="str-device-name">${escapeHtml(d.name || "")}</span>
            ${d.role ? `<span class="str-device-role">${escapeHtml(d.role)}</span>` : ""}
            <span class="str-device-req">${d.required !== false ? (isKo ? "필수" : "Required") : (isKo ? "선택" : "Optional")}</span>
        </div>
    `).join("");

    const stepsHtml = steps.filter(Boolean).map(s => `<li>${escapeHtml(String(s))}</li>`).join("");
    const cautionsHtml = cautions.filter(Boolean).map(c => `<li>${escapeHtml(String(c))}</li>`).join("");
    const altsHtml = alts.filter(a => a && a.scenario).map(a => `<div class="str-alt-item"><strong>${escapeHtml(a.scenario || "")}</strong><span>${escapeHtml(a.reason || "")}</span></div>`).join("");

    const sections = [];
    if (what) sections.push({ title: isKo ? "무엇을 하나요" : "What It Does", html: `<p>${escapeHtml(what)}</p>` });
    if (devicesHtml) sections.push({ title: isKo ? "필요한 기기" : "Required Devices", html: devicesHtml });
    if ((setup.apps || []).length) sections.push({ title: isKo ? "필요한 앱" : "Required Apps", html: `<p>${(setup.apps || []).map(a => escapeHtml(a)).join(", ")}</p>` });
    if ((setup.conditions || []).length) sections.push({ title: isKo ? "필요 조건" : "Prerequisites", html: `<ul>${(setup.conditions || []).map(c => `<li>${escapeHtml(c)}</li>`).join("")}</ul>` });
    if (stepsHtml) sections.push({ title: isKo ? "설정 방법" : "Setup Steps", html: `<ol>${stepsHtml}</ol>` });
    if (cautionsHtml) sections.push({ title: isKo ? "주의사항" : "Cautions", html: `<ul>${cautionsHtml}</ul>` });
    if (altsHtml) sections.push({ title: isKo ? "대체 구성" : "Alternatives", html: altsHtml });

    const accordionsHtml = sections.map((sec, i) =>
        `<details class="str-accordion"${i === 0 ? " open" : ""}><summary>${escapeHtml(sec.title)}</summary><div class="acc-body">${sec.html}</div></details>`
    ).join("");

    return `
        <div class="str-consumer">
            <h2 class="str-headline">${escapeHtml(headline)}</h2>
            ${accordionsHtml}
        </div>
    `;
}

function renderExploreSelectionCard(summary) {
    if (!summary || !summary.selectedScenarios || summary.selectedScenarios.length === 0) return "";

    const isKo = (summary.locale || currentLocale) === "ko";
    const primary = summary.selectedScenarios.find(s => s.isPrimary) || summary.selectedScenarios[0];

    // 가치 배지
    const valuesHtml = (summary.primaryValues || [])
        .map(v => `<span class="sel-value-badge sel-value-${v.toLowerCase()}">${escapeHtml(v)}</span>`)
        .join("");

    // 선택된 시나리오 하이라이트
    const scenarioHtml = `
        <div class="sel-scenario-highlight">
            <span class="sel-source-badge">${escapeHtml(`Explore ${primary.source}`)}</span>
            <span class="sel-scenario-title">${escapeHtml(primary.title)}</span>
            ${primary.articleTitle ? `<span class="sel-scenario-article">${escapeHtml(primary.articleTitle)}</span>` : ""}
            ${valuesHtml ? `<div class="sel-values-row">${valuesHtml}</div>` : ""}
        </div>
    `;

    // 선택 이유
    const reasonHtml = summary.selectionReason
        ? `<div class="sel-reason"><strong>${isKo ? "선택 이유" : "Why selected"}</strong> ${escapeHtml(summary.selectionReason)}</div>`
        : "";

    // 반영된 입력값
    const inputItems = [];
    const snap = summary.inputSnapshot || {};
    if (snap.market?.country) {
        const marketText = `${snap.market.country}${snap.market.city ? ` / ${snap.market.city}` : ""}`;
        inputItems.push({ label: isKo ? "대상 시장" : "Target Market", value: marketText });
    }
    if (snap.persona && snap.persona.length > 0) {
        inputItems.push({ label: isKo ? "핵심 타깃" : "Core Target", value: snap.persona.map(p => p.label || p.id || "").filter(Boolean).join(", ") });
    }
    if (snap.devices && snap.devices.length > 0) {
        inputItems.push({ label: isKo ? "활용 기기" : "Devices Used", value: snap.devices.map(d => d.label || d.name || "").filter(Boolean).join(", ") });
    }
    if (snap.purpose?.text) {
        inputItems.push({ label: isKo ? "상황 · 목적" : "Context & Purpose", value: snap.purpose.text });
    }

    const inputHtml = inputItems.length > 0
        ? `<div class="sel-input-grid">${inputItems.map(item =>
            `<div class="sel-input-item"><span class="sel-input-label">${escapeHtml(item.label)}</span><span class="sel-input-value">${escapeHtml(item.value)}</span></div>`
        ).join("")}</div>`
        : "";

    // Magic Keywords (사용자가 직접 선택한 관심사)
    const magicKeys = summary.magicKeywords || [];
    const magicHtml = magicKeys.length > 0 ? `
        <div class="sel-magic-row">
            <strong class="sel-magic-label">${isKo ? "선택한 관심 키워드" : "Your focus keywords"}</strong>
            <div class="sel-magic-tags">${magicKeys.map(key => {
                const cat = (typeof CITY_PROFILE_CATEGORIES !== "undefined" ? CITY_PROFILE_CATEGORIES : []).find(c => c.key === key);
                return cat
                    ? `<span class="sel-magic-tag" style="--magic-accent:${cat.color}">${cat.icon} ${escapeHtml(isKo ? cat.labelKo : cat.labelEn)}</span>`
                    : `<span class="sel-magic-tag">${escapeHtml(key)}</span>`;
            }).join("")}</div>
        </div>
    ` : "";

    // 도출 키워드
    const derivedTags = (summary.derivedTags || []).slice(0, 5);
    const tagsHtml = derivedTags.length > 0
        ? `<div class="sel-tags-row">${derivedTags.map(t =>
            `<span class="sel-derived-tag" title="score: ${t.score}">${escapeHtml(t.tag)}</span>`
        ).join("")}</div>`
        : "";

    // 확정 vs 추론
    const ivc = summary.inferredVsConfirmed || {};
    const confirmedHtml = (ivc.confirmed || []).map(c =>
        `<span class="sel-chip sel-chip-confirmed">${escapeHtml(c)}</span>`
    ).join("");
    const inferredHtml = (ivc.inferred || []).map(i =>
        `<span class="sel-chip sel-chip-inferred">${escapeHtml(i)}</span>`
    ).join("");
    const confidenceHtml = (confirmedHtml || inferredHtml)
        ? `<div class="sel-confidence">
            ${confirmedHtml ? `<div class="sel-confirmed-row">${confirmedHtml}</div>` : ""}
            ${inferredHtml ? `<div class="sel-inferred-row">${inferredHtml}</div>` : ""}
          </div>`
        : "";

    // 매칭된 시나리오 수
    const countText = summary.totalCandidates > 1
        ? (isKo ? `외 ${summary.totalCandidates - 1}개 시나리오 매칭` : `+${summary.totalCandidates - 1} more matched`)
        : "";

    return `
        <section class="sel-card">
            <div class="sel-card-header">
                <h3 class="sel-card-title">${isKo ? "선택 근거" : "Selection Basis"}</h3>
                ${countText ? `<span class="sel-count">${escapeHtml(countText)}</span>` : ""}
            </div>
            ${scenarioHtml}
            ${reasonHtml}
            ${magicHtml}
            ${inputHtml}
            ${tagsHtml}
            ${confidenceHtml}
        </section>
    `;
}

function buildStreamingUI(context) {
    const isKo = currentLocale === "ko";
    const selCardHtml = context.selectionSummary
        ? renderExploreSelectionCard(context.selectionSummary)
        : buildSelectionSummaryCard(context);

    // 스마트 로딩: 도시 맥락 기반 롤링 문구 (5개, 1.8초 간격 = ~9초 사이클)
    const cityDisplay = context.cityDisplay || context.city || "";
    const segment = context.segment || "";
    const cityFallback = isKo ? "선택한 지역" : "your city";
    const segFallback = isKo ? "타깃 고객" : "target customers";
    const loadingPhrases = isKo ? [
        `${cityDisplay || cityFallback}의 생활 맥락을 분석 중...`,
        `${segment || segFallback}의 평일·주말 패턴을 매칭 중...`,
        `Explore 시나리오에서 최적 조합을 탐색 중...`,
        `마케터용·사용자용 결과물을 구성 중...`,
        `최적의 CX 시나리오를 찾았습니다!`
    ] : [
        `Analyzing local living context in ${cityDisplay || cityFallback}...`,
        `Matching weekday & weekend patterns for ${segment || segFallback}...`,
        `Searching optimal Explore scenario combinations...`,
        `Building marketer & consumer outputs...`,
        `Found the best-fit CX scenario!`
    ];

    const phrasesHtml = loadingPhrases.map((p, i) => `
        <span class="smart-load-phrase" style="animation-delay:${i * 1.8}s">${escapeHtml(p)}</span>
    `).join("");

    return `
        <article class="scenario-output ai-streaming">
            <div class="smart-load-header">
                <div class="insight-loading" role="status" aria-live="polite" style="margin-bottom:12px">
                    <div class="pizza-spinner" aria-hidden="true">
                        <svg viewBox="0 0 40 40" class="pizza-svg">
                            <circle cx="20" cy="20" r="18" class="pizza-track"/>
                            <path d="" class="pizza-wedge" data-pizza-wedge/>
                        </svg>
                        <span class="pizza-pct" data-pizza-pct>0%</span>
                    </div>
                    <span class="pizza-label">${isKo ? "AI 시나리오 생성 중..." : "Generating AI scenario..."}</span>
                </div>
                <div class="smart-load-phrases">${phrasesHtml}</div>
            </div>
            ${selCardHtml}
            <pre class="ai-stream-output" aria-live="polite" aria-label="AI generating scenario"></pre>
        </article>
    `;
}

/** 스트리밍 중 피자 프로그레스 시뮬레이션 시작 */
function startStreamingPizzaProgress() {
    let progress = 0;
    const interval = setInterval(() => {
        if (!aiGenerating) {
            clearInterval(interval);
            updatePizzaProgress(resultDiv, 100);
            return;
        }
        progress += (90 - progress) * 0.025;
        updatePizzaProgress(resultDiv, Math.min(progress, 90));
    }, 300);
    return interval;
}

function stripMetaPrompts(text) {
    // 내부 섹션 번호 참조(10-11, section 10 등) 제거 — 사용자에게 의미 없는 개발자 용어
    return text
        .replace(/\(Which section.*?\)/gi, "")
        .replace(/\(.*?request.*?section.*?10.*?\)/gi, "")
        .replace(/\(.*?request.*?10[-–]11.*?\)/gi, "")
        .trim();
}

function renderAIResult(markdown, context) {
    const cleaned = stripMetaPrompts(markdown);
    const html = parseSourceCitations(markdownToHtml(cleaned));
    const selectionCardHtml = context.selectionSummary
        ? renderExploreSelectionCard(context.selectionSummary)
        : buildSelectionSummaryCard(context);
    resultDiv.innerHTML = `
        <article class="scenario-output ai-result">
            <div class="ai-result-meta">
                <span class="ai-result-badge">${context.provider === "claude" ? "Claude" : "GPT"} ${currentLocale === "ko" ? "생성 결과" : "Generated"}</span>
                <span class="ai-result-context">${escapeHtml(context.role)}</span>
                <button type="button" class="tab-btn ai-copy-btn" id="ai-copy-btn">${currentLocale === "ko" ? "복사" : "Copy"}</button>
            </div>
            ${selectionCardHtml}
            <div class="ai-result-body">${html}</div>
            ${buildRefinementUI()}
        </article>
    `;

    const copyBtn = resultDiv.querySelector("#ai-copy-btn");
    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(cleaned).then(() => {
                copyBtn.textContent = currentLocale === "ko" ? "복사됨!" : "Copied!";
                setTimeout(() => { copyBtn.textContent = currentLocale === "ko" ? "복사" : "Copy"; }, 2000);
            }).catch(() => {});
        });
    }

    bindRefinementPrompt(markdown, context);
    bindSourceTags(resultDiv);
    scrollToResult();
}

function buildRefinementUI() {
    const title = currentLocale === "ko" ? "추가 요청 / 수정" : "Refine / Follow-up";
    const placeholder = currentLocale === "ko"
        ? "예) 독일 시장으로 바꿔줘 / 기기 목록 업데이트 / 실행 가이드 추가 / 품질 점검 해줘"
        : "e.g. Switch to Germany / Update devices / Add execution guide / Run quality check";
    const btn = currentLocale === "ko" ? "요청 전송" : "Send";
    const initial = currentLocale === "ko"
        ? "수정하거나 더 자세히 보고 싶은 부분이 있으면 자유롭게 요청하세요."
        : "Ask for any refinement or additional detail you need.";
    return `
        <section class="output-block numbered-output post-output-prompt">
            <p class="block-index">+</p>
            <h4>${escapeHtml(title)}</h4>
            <div class="post-output-input-row">
                <textarea id="refine-input" rows="3" placeholder="${escapeHtml(placeholder)}"></textarea>
                <button type="button" id="refine-ask-btn" class="generate-btn">${escapeHtml(btn)}</button>
            </div>
            <div id="refine-answer" class="post-output-answer ai-refine-answer" aria-live="polite">${escapeHtml(initial)}</div>
        </section>
    `;
}

function bindRefinementPrompt(previousOutput, context) {
    const askBtn = resultDiv.querySelector("#refine-ask-btn");
    const input  = resultDiv.querySelector("#refine-input");
    const answer = resultDiv.querySelector("#refine-answer");
    if (!askBtn || !input || !answer) return;

    const ask = async () => {
        const request = String(input.value || "").trim();
        if (!request || aiGenerating) return;

        aiGenerating = true;
        askBtn.disabled = true;
        answer.textContent = currentLocale === "ko" ? "AI가 처리 중입니다..." : "AI is processing...";

        let response;
        try {
            response = await fetch("/api/refine", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    previousOutput,
                    refinementRequest: request,
                    context
                })
            });
        } catch (err) {
            aiGenerating = false;
            askBtn.disabled = false;
            answer.textContent = currentLocale === "ko" ? "서버에 연결할 수 없습니다." : "Cannot reach server.";
            return;
        }

        if (!response.ok) {
            aiGenerating = false;
            askBtn.disabled = false;
            const errData = await response.json().catch(() => ({}));
            answer.textContent = errData?.error?.message || (currentLocale === "ko" ? `오류: ${response.status}` : `Error: ${response.status}`);
            return;
        }

        answer.textContent = "";
        let refineText = "";
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop();

                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;
                    let event;
                    try { event = JSON.parse(line.slice(6)); } catch { continue; }
                    if (event.type === "chunk") {
                        refineText += event.text;
                        answer.textContent = refineText;
                        answer.scrollTop = answer.scrollHeight;
                    } else if (event.type === "done") {
                        break;
                    } else if (event.type === "error") {
                        answer.textContent = `Error: ${event.message}`;
                        break;
                    }
                }
            }
        } catch (err) {
            answer.textContent = currentLocale === "ko" ? "스트리밍 처리 중 오류." : "Streaming error.";
        }

        aiGenerating = false;
        askBtn.disabled = false;
        input.value = "";
        // 메타 텍스트 제거
        if (answer.textContent) {
            answer.textContent = stripMetaPrompts(answer.textContent);
        }
    };

    askBtn.addEventListener("click", ask);
    input.addEventListener("keydown", (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") ask();
    });
}

/** Simple markdown-to-HTML converter for streamed AI scenario output. */
function markdownToHtml(md) {
    if (!md) return "";

    // Protect fenced code blocks with placeholders before any escaping
    const codeBlocks = [];
    let src = md.replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) => {
        const idx = codeBlocks.length;
        codeBlocks.push(escapeHtml(code));
        return `\x00CODE${idx}\x00`;
    });

    let html = escapeHtml(src);

    // Restore code blocks as <pre><code>
    html = html.replace(/\x00CODE(\d+)\x00/g, (_, i) => `<pre><code>${codeBlocks[Number(i)]}</code></pre>`);

    // Inline code
    html = html.replace(/`([^`\n]+)`/g, (_, c) => `<code>${escapeHtml(c)}</code>`);
    // H1-H4
    html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
    // Bold + italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*([^*\n]+?)\*/g, "<em>$1</em>");
    // HR
    html = html.replace(/^---+$/gm, "<hr>");
    // Tables — detect | rows
    html = html.replace(/((?:^\|.+\|\n?)+)/gm, (tableBlock) => {
        const rows = tableBlock.trim().split("\n");
        let out = "<table><tbody>";
        let headerDone = false;
        for (const row of rows) {
            if (/^\|[-| :]+\|$/.test(row.trim())) { headerDone = true; continue; }
            const cells = row.split("|").slice(1, -1).map((c) => c.trim());
            const tag = !headerDone ? "th" : "td";
            out += `<tr>${cells.map((c) => `<${tag}>${c}</${tag}>`).join("")}</tr>`;
            if (!headerDone) headerDone = true;
        }
        return out + "</tbody></table>";
    });
    // Unordered lists
    html = html.replace(/((?:^[•\-] .+\n?)+)/gm, (block) => {
        const items = block.trim().split("\n").map((l) => `<li>${l.replace(/^[•\-] /, "")}</li>`).join("");
        return `<ul>${items}</ul>`;
    });
    // Ordered lists
    html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (block) => {
        const items = block.trim().split("\n").map((l) => `<li>${l.replace(/^\d+\. /, "")}</li>`).join("");
        return `<ol>${items}</ol>`;
    });
    // Paragraphs — blank lines → paragraph breaks (don't affect block elements)
    html = html.replace(/\n{2,}/g, "\n\n");
    const parts = html.split(/\n{2,}/);
    html = parts.map((part) => {
        const trimmed = part.trim();
        if (!trimmed) return "";
        if (/^<(?:h[1-4]|hr|pre|ul|ol|table)/.test(trimmed)) return trimmed;
        return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
    }).filter(Boolean).join("\n");

    return html;
}

function parseSourceCitations(html) {
    // Pattern matches both escaped and unescaped: [Source: label | URL] or [Source: label]
    // After escapeHtml, brackets become: [Source: ... | ...] (brackets aren't escaped by escapeHtml)
    // Also handle [Assumption] markers
    return html
        .replace(/\[Source:\s*([^\]|]+?)\s*\|\s*(https?:\/\/[^\]\s]+)\s*\]/g, (_, label, url) => {
            const domain = url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
            const detailId = `ai-src-${Math.random().toString(36).slice(2, 8)}`;
            return `<span class="source-tag" data-source-detail="${detailId}">${label.trim()}</span>` +
                `<span class="source-detail" id="${detailId}">` +
                `<span class="source-detail-label">${label.trim()}</span> ` +
                `<a class="source-detail-url" href="${url}" target="_blank" rel="noopener noreferrer">🔗 ${url.length > 60 ? url.slice(0, 60) + "…" : url}</a>` +
                `</span>`;
        })
        .replace(/\[Source:\s*([^\]]+?)\s*\]/g, (_, label) => {
            return `<span class="source-tag source-tag-inline">${label.trim()}</span>`;
        })
        .replace(/\[Assumption\]/gi, () => {
            return `<span class="source-tag source-tag-assumption">Assumption</span>`;
        });
}

/* ══════════════════════════════════════════════════════════════════════
   Output Flow Tracker — 3-step 상태 관리
   ══════════════════════════════════════════════════════════════════════ */
function updateOutputFlowTracker(activeStep, states) {
    // states: { 1: "waiting"|"active"|"done", 2: ..., 3: ... }
    const tracker = document.getElementById("output-flow-tracker");
    if (!tracker) return;
    tracker.classList.remove("hidden");

    const isKo = currentLocale === "ko";
    const statusLabels = {
        waiting: isKo ? "대기" : "Waiting",
        active:  isKo ? "진행 중…" : "In progress…",
        done:    isKo ? "완료 ✓" : "Done ✓"
    };

    [1, 2, 3].forEach(n => {
        const el = tracker.querySelector(`[data-oft="${n}"]`);
        if (!el) return;
        const state = states[n] || "waiting";
        el.className = "oft-step " + state;
        const statusEl = el.querySelector(".oft-status");
        if (statusEl) {
            statusEl.textContent = statusLabels[state] || "";
        }
    });
}

function updateSectionHelper(elementId, text) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = text;
}

function setSectionStatusBadge(headingId, state) {
    // state: "working" | "done" | null (remove)
    const heading = document.getElementById(headingId);
    if (!heading) return;
    // Remove existing badge
    const existing = heading.parentElement?.querySelector(".section-status-badge");
    if (existing) existing.remove();
    if (!state) return;

    const isKo = currentLocale === "ko";
    const badge = document.createElement("span");
    badge.className = `section-status-badge ${state}`;
    if (state === "working") {
        badge.innerHTML = isKo ? "⏳ 작업 중…" : "⏳ Working…";
    } else if (state === "done") {
        badge.innerHTML = isKo ? "✅ 완료" : "✅ Done";
    }
    heading.insertAdjacentElement("afterend", badge);
}

function scrollToResult() {
    // 결과 영역 바로 위로만 스크롤 — 맨 위로 올라가지 않도록
    const resultFrame = resultDiv?.closest(".result-frame");
    if (resultFrame) {
        resultFrame.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (resultDiv) {
        resultDiv.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function buildCompletionBanner(context, isKo) {
    const provider = context.provider === "claude" ? "Claude" : "GPT";
    const role = context.role || "";
    return `
        <div class="str-completion-banner">
            <span class="banner-icon">✓</span>
            <div class="banner-text">
                <span class="banner-title">${isKo ? "시나리오 생성 완료" : "Scenario Generation Complete"}</span>
                <span class="banner-sub">${provider} · ${escapeHtml(role)}</span>
            </div>
        </div>
    `;
}

function buildCurationSummaryInline(isKo) {
    const container = document.getElementById("curation-results");
    if (!container) return "";

    const cards = container.querySelectorAll(".curation-card, .curation-result-card, [data-scenario-title]");
    if (cards.length === 0) return "";

    const items = [];
    cards.forEach((card, i) => {
        if (i >= 5) return;
        const title = card.getAttribute("data-scenario-title")
            || card.querySelector(".curation-title, .scenario-title, h3, h4")?.textContent?.trim()
            || `Scenario ${i + 1}`;
        const source = card.querySelector(".curation-source, .source-tag, .sel-source-badge")?.textContent?.trim() || "";
        items.push({ rank: i + 1, title, source });
    });

    if (items.length === 0) return "";

    const listHtml = items.map(it =>
        `<li class="str-curation-item"><span class="curation-rank">${it.rank}</span><span class="curation-title">${escapeHtml(it.title)}</span>${it.source ? `<span class="curation-source">${escapeHtml(it.source)}</span>` : ""}</li>`
    ).join("");

    return `
        <div class="str-curation-summary">
            <div class="curation-summary-header">
                <span class="curation-summary-title">${isKo ? "추천 시나리오 Top " + items.length : "Top " + items.length + " Recommended Scenarios"}</span>
                <button type="button" class="curation-toggle-btn" onclick="this.closest('.str-curation-summary').querySelector('.str-curation-list').classList.toggle('hidden');this.textContent=this.textContent==='${isKo ? "접기" : "Collapse"}'?'${isKo ? "펼치기" : "Expand"}':'${isKo ? "접기" : "Collapse"}';">${isKo ? "접기" : "Collapse"}</button>
            </div>
            <ul class="str-curation-list">${listHtml}</ul>
        </div>
    `;
}

function buildStoryboardWebtoon(intent, services, deviceDecision) {
    const primary = services[0];
    const device = deviceDecision.final.modelName;
    const mission = intent.missionBucket;

    const panelsKo = {
        Save: [
            { scene: "야근 후 지친 몸으로 어두운 현관문에 도착한 사용자", text: "오늘도 늦었네... 집이 텅 빈 것처럼 썰렁하겠지?" },
            { scene: "문이 열리자마자 거실 조명이 은은하게 켜지고 TV에 환영 메시지가 뜸", text: "어? 벌써 따뜻해졌네? SmartThings가 미리 준비했구나." },
            { scene: "주방으로 가니 인덕션이 예열 중이고 세탁기 완료 알림이 폰으로 옴", text: "하나하나 신경 쓸 필요 없이, 내 리듬에 맞춰 집이 움직여요." },
            { scene: "소파에 앉아 편하게 휴식하며 에너지 절감 리포트를 확인", text: "불필요한 낭비는 줄이고, 내 시간은 더 여유롭게. 이게 진짜 스마트홈이죠." }
        ],
        Care: [
            { scene: "사무실에서 회의 중, 집에 혼자 있을 반려동물이 걱정되는 사용자", text: "오늘 유독 늦어지네... 초코는 잘 있을까?" },
            { scene: "SmartThings 앱을 켜니 펫 카메라로 평온하게 자는 모습이 보임", text: "다행이다! 조명도 적당하고, 클래식 음악도 잘 나오고 있네." },
            { scene: "집에 도착해 반갑게 달려오는 반려동물과 마주하는 순간", text: "멀리 있어도 곁에 있는 것처럼. 돌봄의 공백이 사라졌어요." },
            { scene: "가족 모두가 안심하고 일상을 공유하는 따뜻한 거실 풍경", text: "걱정은 덜고 사랑은 더 크게. SmartThings Pet Care." }
        ],
        Secure: [
            { scene: "여행지에서 평화롭게 휴가를 즐기고 있는 가족", text: "집 비운 지 3일째인데, 별일 없겠지?" },
            { scene: "수상한 움직임이 감지되었다는 알림과 함께 자동 녹화 영상이 폰에 뜸", text: "앗! 택배 기사님이구나. 실시간으로 확인하니 바로 안심되네." },
            { scene: "원격으로 도어락 상태를 재점검하고 보안 모드를 강화함", text: "어디에 있든 우리 집은 내가 지킨다. 24시간 철통 보안." },
            { scene: "안심하고 다시 휴가를 즐기는 가족들의 웃음소리", text: "불안한 확인 대신 확실한 안심. SmartThings Home Monitoring." }
        ],
        Play: [
            { scene: "퇴근 후 게임 or 영상 감상을 시작하려는 사용자", text: "오늘은 좀 제대로 즐겨볼까? 버튼 하나면 되지." },
            { scene: "게임 모드 실행과 동시에 조명이 어두워지고, TV 화면과 조명이 싱크", text: "와, 몰입감이 완전 다르네. 설정은 알아서 다 됐잖아?" },
            { scene: "에어컨이 쾌적한 온도로 자동 유지되고, 블라인드가 내려옴", text: "끊기거나 세팅 때문에 흐름이 깨지는 일 없이, 그냥 즐기면 돼." },
            { scene: "스피커와 TV가 연동된 서라운드 사운드로 리빙룸이 홈시어터로 변신", text: "집이 내 취향대로 반응해 줄 때, 이 공간이 더 좋아집니다. SmartThings." }
        ],
        Discover: [
            { scene: "스마트홈을 처음 시작해 보려는 사용자가 SmartThings 앱을 열어봄", text: "어디서부터 시작해야 하지? 너무 복잡한 거 아닐까?" },
            { scene: "첫 기기를 연결하자 앱이 맞춤 루틴을 제안해 줌", text: "이렇게 쉽게 되는 거였어? 생각보다 훨씬 간단하네." },
            { scene: "하나씩 연결된 기기들이 일상 패턴에 맞게 자동으로 동작 시작", text: "알아서 맞춰주니까, 내가 신경 쓸 게 점점 줄어들고 있어." },
            { scene: "일상이 더 편해졌다는 걸 체감하며 다음 기기 연결을 고민하는 사용자", text: "한 번 쓰기 시작하면 멈출 수가 없어요. SmartThings로 시작하세요." }
        ]
    };

    const panelsEn = {
        Save: [
            { scene: "User arrives at a dark front door after a long day of work", text: "Home at last... but it's going to be so cold and empty." },
            { scene: "Door opens, lights glow softly, and a welcome message appears on the TV", text: "Wait, it's already warm? SmartThings prepared everything for me." },
            { scene: "In the kitchen, the oven is preheating and a laundry alert pops up", text: "Everything moves to my rhythm without me lifting a finger." },
            { scene: "User relaxes on the sofa, checking an energy report on the phone", text: "No waste, just pure comfort. This is the real smart home." }
        ],
        Care: [
            { scene: "User in an office meeting, worrying about their pet at home", text: "Running late today... I hope my puppy is okay." },
            { scene: "Checks the app: the pet camera shows the puppy sleeping peacefully", text: "Relief! The lights are dimmed and the music is on." },
            { scene: "Arrives home to a happy, energetic greeting from the pet", text: "Distance doesn't mean a care gap anymore." },
            { scene: "A warm living room scene with the whole family sharing a moment", text: "Less worry, more love. SmartThings Pet Care." }
        ],
        Secure: [
            { scene: "A family enjoying their vacation far from home", text: "Day 3 of our trip... wonder if everything is okay at the house?" },
            { scene: "An alert pops up: suspicious movement detected, with a live video clip", text: "Oh, it's just the delivery person! So glad I can see this live." },
            { scene: "User double-checks the door lock and reinforces security mode remotely", text: "Wherever I am, I'm in control of my home's safety." },
            { scene: "The family goes back to enjoying their vacation with big smiles", text: "Certain reassurance instead of constant anxiety. SmartThings Monitoring." }
        ],
        Play: [
            { scene: "User back from work, ready to unwind with games or a movie", text: "Tonight I'm going all in. One tap should do it." },
            { scene: "Game mode launches: lights dim and sync with the screen", text: "Whoa, total immersion — and it set itself up automatically." },
            { scene: "WindFree AC quietly maintains comfort, blinds slide down automatically", text: "Nothing breaks the flow. I just enjoy." },
            { scene: "Speaker and TV deliver surround sound, turning the living room into a home theater", text: "When your space responds to you, it becomes somewhere special. SmartThings." }
        ],
        Discover: [
            { scene: "First-time user opens SmartThings app, wondering where to start", text: "Where do I even begin? Hope it's not too complicated..." },
            { scene: "Connects the first device and the app suggests a personalized routine", text: "Wait, that was it? Way simpler than I expected." },
            { scene: "Connected devices start responding automatically to daily patterns", text: "The less I have to think about it, the better it works." },
            { scene: "User notices daily life feels easier, considers adding more devices", text: "Once you start, you can't stop. Begin your smart home journey with SmartThings." }
        ]
    };

    const panels = (currentLocale === "ko" ? panelsKo : panelsEn)[mission] || panelsEn.Discover;
    return panels;
}

function buildSceneHook(intent, services) {
    const isKo = currentLocale === "ko";
    const mission = intent.missionBucket;
    if (mission === "Save") {
        return {
            kr: "퇴근길, 문을 열기도 전에 집이 나를 먼저 반겨줍니다.",
            en: "Coming home to a house that welcomes you before you even turn the key."
        };
    }
    if (mission === "Care") {
        return {
            kr: "멀리 있어도 느껴지는 따뜻한 돌봄, SmartThings가 연결합니다.",
            en: "Feel the warmth of care from anywhere, connected by SmartThings."
        };
    }
    return {
        kr: "반복되는 일상에 여유를 더하는 한 번의 터치.",
        en: "One touch to reclaim your time in a busy routine."
    };
}

function buildOtpPlace(country, city, intent) {
    const isKo = currentLocale === "ko";
    const loc = city ? `${getCountryName(country.countryCode)} ${city}` : getCountryName(country.countryCode);
    const mission = intent.missionBucket;

    if (mission === "Save") {
        return isKo
            ? `평일 저녁 / ${loc} 도심형 주거지 / 퇴근 후 빠른 휴식 전환 시점`
            : `Weekday Evening / Urban home in ${loc} / Post-commute reset moment`;
    }
    if (mission === "Care") {
        return isKo
            ? `일과 시간 / ${loc} 주거지 / 가족이나 펫의 안부가 궁금한 시점`
            : `Work Hours / Residential area in ${loc} / Remote care and wellbeing check`;
    }
    return isKo
        ? `일상 구간 / ${loc} 생활권 / 편의가 필요한 모든 순간`
        : `Daily Routine / Living area in ${loc} / Any moment where ease is needed`;
}

function buildCustomerJourneyTable(intent, services, deviceDecision) {
    const isKo = currentLocale === "ko";
    const mission = intent.missionBucket;
    const service = getServiceLabel(services[0]);
    const device = deviceDecision.final.modelName;

    const stepsKo = [
        { step: "Trigger", behavior: "퇴근 후 현관 도착", action: "지오펜싱/도어락 신호 감지", value: "Ease", note: "위치 권한 필요" },
        { step: "Welcome", behavior: "거실 진입", action: "조명 및 에어컨 가동", value: "Comfort", note: "사전 설정 온도 기준" },
        { step: "Context", behavior: "TV 앞 착석", action: "TV 추천 카드 노출", value: "Care", note: "개인화 메시지 적용" },
        { step: "Execution", behavior: "추천 루틴 수락", action: "주방 가전 예열 시작", value: "Save", note: "기기 상태 확인" },
        { step: "Feedback", behavior: "식사 준비 완료", action: "스마트폰 알림 발송", value: "Ease", note: "루틴 종료 안내" },
        { step: "Retention", behavior: "취침 준비", action: "오늘의 절감/케어 요약", value: "Value", note: "익일 루틴 추천" }
    ];

    const stepsEn = [
        { step: "Trigger", behavior: "Arriving at the front door", action: "Geofencing or door-lock signal", value: "Ease", note: "Location permission required" },
        { step: "Welcome", behavior: "Entering the living room", action: "Lights and AC turn on", value: "Comfort", note: "Based on preset targets" },
        { step: "Context", behavior: "Sitting in front of TV", action: "Tailored recommendation card", value: "Care", note: "Personalized message" },
        { step: "Execution", behavior: "Accepting recommendation", action: "Kitchen appliances preheat", value: "Save", note: "Device status check" },
        { step: "Feedback", behavior: "Meal prep complete", action: "Smartphone notification", value: "Ease", note: "Routine finish alert" },
        { step: "Retention", behavior: "Preparing for bed", action: "Daily savings/care summary", value: "Value", note: "Next-day suggestions" }
    ];

    return isKo ? stepsKo : stepsEn;
}

function buildAddonPack(role, intent, services, deviceDecision) {
    const isKo = currentLocale === "ko";
    const mission = intent.missionBucket;
    return {
        setupGuide: [
            isKo ? "Step 1: 핵심 기기 연결 및 서비스 활성화" : "Step 1: Connect core device and activate service",
            isKo ? "Step 2: 상황별 자동화 루틴 설정 (1탭 저장)" : "Step 2: Configure situational automation (one-tap save)",
            isKo ? "Step 3: 가족 초대 및 위젯/알림 공유" : "Step 3: Invite family and share widgets/alerts"
        ],
        funnelMapping: [
            { stage: "Awareness", claim: isKo ? "신경 쓰지 않아도 집이 나를 배려합니다" : "Your home cares for you without you asking", metric: "Reach / CTR" },
            { stage: "Conversion", claim: isKo ? "우리 집 맞춤형 1분 세팅" : "Tailored 1-minute setup for my home", metric: "Add-to-cart / Sales" },
            { stage: "Retention", claim: isKo ? "반복되는 일상의 즐거운 변화" : "Joyful change in your daily routine", metric: "WAU / Stickiness" }
        ]
    };
}

function buildReflectionCheck(intent, services, exploreGrounding) {
    const isKo = currentLocale === "ko";
    return [
        { label: isKo ? "고객 문제 명확성" : "Customer Pain Clarity", status: "PASS", note: isKo ? "반복되는 일상 불편을 타겟팅함" : "Targets recurring daily friction" },
        { label: isKo ? "가치 연결 (Care/Save 등)" : "Value Linkage", status: "PASS", note: `${intent.missionBucket} ${isKo ? "가치에 집중함" : "value focused"}` },
        { label: isKo ? "브랜드 verbal identity" : "Brand Verbal Identity", status: "PASS", note: isKo ? "절제된 프리미엄 톤 유지" : "Restrained premium tone maintained" },
        { label: isKo ? "에이전틱 지능 반영" : "Agentic Intelligence", status: "PASS", note: isKo ? "사용자 의도 발견 로직 포함" : "Intent discovery logic included" }
    ];
}

function buildFallbackPurpose(selectedSegment) {
    if (!selectedSegment) return "";
    return currentLocale === "ko"
        ? `${selectedSegment}의 생활 맥락에서 반복되는 불편을 줄이고 싶다`
        : `Reduce recurring friction in everyday moments for ${selectedSegment}.`;
}

function buildFallbackSegment(purpose) {
    if (!purpose) return "";
    return currentLocale === "ko"
        ? "상황 기반 타겟 사용자"
        : "Context-led target audience";
}

function buildExploreGrounding(country, city, selectedSegment, intent, deviceDecision, services) {
    const regional = getRegionalSignals(country.countryCode, city, intent);
    const serviceLabels = services.slice(0, 3).map((service) => getServiceLabel(service));
    const primaryValue = intent.missionBucket === "Save"
        ? (currentLocale === "ko" ? "절감과 통제감" : "savings and control")
        : intent.missionBucket === "Care"
            ? (currentLocale === "ko" ? "안심과 돌봄 여유" : "reassurance and care ease")
            : intent.missionBucket === "Secure"
                ? (currentLocale === "ko" ? "즉각적인 안심과 빠른 대응" : "immediate reassurance and faster response")
                : intent.missionBucket === "Play"
                    ? (currentLocale === "ko" ? "생활 리듬 회복과 즐거운 실행감" : "rhythm recovery and enjoyable action")
                    : (currentLocale === "ko" ? "생활 부담 완화" : "lighter daily burden");
    const emotionalJob = intent.missionBucket === "Save"
        ? (currentLocale === "ko" ? "요금이 새고 있다는 불안 없이 집을 비우는 것" : "leaving home without worrying about wasted cost")
        : intent.missionBucket === "Care"
            ? (currentLocale === "ko" ? "부재 중에도 돌봄 공백이 없다고 느끼는 것" : "feeling there is no care gap while away")
            : intent.missionBucket === "Secure"
                ? (currentLocale === "ko" ? "계속 확인하지 않아도 집이 안전하다고 느끼는 것" : "feeling the home is safe without constant checking")
                : (currentLocale === "ko" ? "번거로운 설정 없이 바로 체감 가치를 얻는 것" : "getting immediate value without friction");
    const functionalJob = currentLocale === "ko"
        ? `"${intent.purpose}" 상황에서 반복 확인과 수동 조작을 줄이는 것`
        : `reducing repeated checking and manual control in moments like "${intent.purpose}"`;
    const coreMessage = currentLocale === "ko"
        ? `${selectedSegment}에게 필요한 것은 더 많은 기능이 아니라, ${intent.purpose} 같은 순간을 더 가볍게 넘기게 해주는 ${primaryValue}입니다.`
        : `What the ${selectedSegment} segment needs is not more features, but ${primaryValue} that makes moments like "${intent.purpose}" feel lighter.`;
    const proofLine = currentLocale === "ko"
        ? `${serviceLabels.join(", ")}가 ${regional.implication}을 실제 장면으로 연결합니다.`
        : `${serviceLabels.join(", ")} connect ${regional.implication} into an actual use moment.`;

    return {
        primaryValue,
        emotionalJob,
        functionalJob,
        coreMessage,
        proofLine,
        observation: regional.observation,
        insight: regional.insight,
        implication: regional.implication,
        exploreTagSummary: (intent.lifestyleTags || []).join(", "),
        messageAngle: intent.missionBucket === "Save"
            ? (currentLocale === "ko" ? "절감되는 금액보다 먼저 줄어드는 신경 씀" : "less mental overhead before lower bills")
            : intent.missionBucket === "Care"
                ? (currentLocale === "ko" ? "계속 확인하지 않아도 되는 안심" : "reassurance without constant checking")
                : intent.missionBucket === "Secure"
                    ? (currentLocale === "ko" ? "필요한 순간에만 즉시 개입하는 보안감" : "security that surfaces only when needed")
                    : (currentLocale === "ko" ? "생활을 더 매끄럽게 이어주는 연결감" : "connected flows that make life smoother")
    };
}

// Maps device category group IDs to Explore scenario tags (v2.0 12-keyword system)
const DEVICE_GROUP_EXPLORE_TAGS = {
    "air-fresh":      ["Air fresh", "Keep the air fresh"],
    "lights-control": ["Control lights", "Easily control your lights"],
    "chores-help":    ["Help with chores"],
    "home-safe":      ["Keep your home safe"],
    "sleep-well":     ["Sleep well", "Stay fit & healthy"],
    "enhanced-mood":  ["Enhanced mood", "Stay fit & healthy"],
    "care-scenarios": ["Care for pet", "반려동물 케어", "Care for seniors", "Care for kids", "시니어 케어"],
    "save-energy":    ["Save energy", "에너지 절약"],
    "food-home":      ["Help with chores", "Smart cooking"]
};

function analyzeIntent(purpose, selectedSegment, selectedDevices = [], selectedDeviceGroups = []) {
    const tags = new Set();
    const text = `${purpose} ${selectedSegment}`.toLowerCase();
    const normalizedDevices = selectedDevices.map((device) => getCategoryName(device).toLowerCase());

    exploreMatrix.lifestyleTags.forEach((tag) => {
        const needle = tag.tagName.toLowerCase().replace(/\s+/g, "");
        if (text.replace(/\s+/g, "").includes(needle)) tags.add(tag.tagName);
    });

    // Text-based tags
    if (text.includes("반려") || text.includes("펫")) tags.add("반려동물 케어");
    if (text.includes("부모") || text.includes("시니어") || text.includes("가족")) tags.add("시니어 케어");
    if (text.includes("에너지") || text.includes("절약") || text.includes("비용")) tags.add("에너지 절약");
    if (selectedDevices.includes("TV")) tags.add("AOD (Always on Display)");

    // Device group-based tags: maps Q4 selection → Explore scenario tags
    selectedDeviceGroups.forEach((groupId) => {
        (DEVICE_GROUP_EXPLORE_TAGS[groupId] || []).forEach((tag) => tags.add(tag));
    });

    if (tags.size === 0) tags.add("입문 (Entry)");

    return {
        missionBucket: inferMissionBucket(purpose, selectedDeviceGroups),
        purpose,
        selectedSegment,
        selectedDevices,
        selectedDeviceGroups,
        selectedDeviceNames: normalizedDevices,
        lifestyleTags: [...tags],
        rawText: `${purpose} ${selectedSegment} ${normalizedDevices.join(" ")}`
    };
}

function findRelevantServices(intent) {
    const missionMap = {
        Save: ["Save", "Control", "Ease", "Comfort"],
        Care: ["Care", "Secure", "Ease", "Routine"],
        Secure: ["Secure", "Alert", "Care", "Location"],
        Play: ["Play", "Health", "Routine", "Ease"],
        Discover: ["Ease", "Routine", "Comfort", "Care"]
    };
    const desiredValues = missionMap[intent.missionBucket] || missionMap.Discover;
    const text = intent.rawText.toLowerCase();

    return factPack
        .map((service) => {
            let score = 0;
            const haystack = [
                service.serviceName,
                service.description,
                ...(service.keyFeatures || []),
                ...(service.triggerKeywords || []),
                ...(service.signalKeywords || []),
                ...(service.valueTags || []),
                ...(service.requiredCategories || [])
            ].join(" ").toLowerCase();

            if ((service.valueTags || []).some((tag) => desiredValues.includes(tag))) score += 4;
            if ((service.triggerKeywords || []).some((keyword) => text.includes(keyword.toLowerCase()))) score += 6;
            if ((service.signalKeywords || []).some((keyword) => text.includes(keyword.toLowerCase()))) score += 3;
            if ((intent.lifestyleTags || []).some((tag) => haystack.includes(tag.toLowerCase()))) score += 3;
            if ((service.requiredCategories || []).some((category) => intent.selectedDevices.includes(category))) score += 5;
            if ((service.requiredCategories || []).some((category) => category === "세탁기/건조기" && intent.selectedDevices.some((device) => ["세탁기", "건조기", "세탁기/건조기"].includes(device)))) score += 4;
            if (intent.missionBucket === "Save" && /energy|절약|요금/.test(haystack)) score += 4;
            if (intent.missionBucket === "Care" && /care|반려|가족|health|find/.test(haystack)) score += 4;
            if (intent.missionBucket === "Secure" && /monitoring|secure|find|보안|카메라/.test(haystack)) score += 4;
            if (intent.missionBucket === "Play" && /fitness|cooking|play|운동|요리/.test(haystack)) score += 4;
            score += Math.max(0, 4 - Number(service.tier || 3));
            return { service, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((item) => item.service);
}

function getServiceLabel(service) {
    return service?.appCardLabel || service?.serviceName || "";
}

function resolveDevice(country, selectedDevice, services, selectedDevices = []) {
    const normalizedSelected = selectedDevice === "세탁기/건조기" ? ["세탁기", "건조기"] : [selectedDevice];
    const available = country.availableProducts.find((product) => normalizedSelected.includes(product.category));
    if (available) {
        return {
            requested: selectedDevice,
            selectedDevices,
            final: available,
            fallbackApplied: false,
            note: localizeSentence("deviceExact")
        };
    }

    const serviceHint = services[0];
    const fallback = country.availableProducts.find((product) => {
        return serviceHint?.devices.some((device) => product.category.includes(device) || device.includes(product.category));
    }) || country.availableProducts[0];

    return {
        requested: selectedDevice,
        selectedDevices,
        final: fallback,
        fallbackApplied: true,
        note: localizeSentence("deviceFallback")
    };
}

function buildNarrative(country, city, selectedSegment, intent, deviceDecision, services) {
    const primary = services[0];
    const secondary = services[1] || services[0];
    const primaryLabel = getServiceLabel(primary);
    const secondaryLabel = getServiceLabel(secondary);
    const locationLabel = city ? `${getCountryName(country.countryCode)} / ${city}` : getCountryName(country.countryCode);
    const deviceList = (deviceDecision.selectedDevices || [deviceDecision.final.category]).map((device) => getCategoryName(device)).join(", ");
    if (currentLocale === "ko") {
        return [
            `${locationLabel}의 하루가 바빠지는 시간대에 ${selectedSegment} 사용자는 "${intent.purpose}"를 더 수월하게 해결하고 싶어 합니다.`,
            `${selectedSegment} 사용자에게는 복잡한 제어보다 바로 체감되는 변화가 더 중요합니다.`,
            `${deviceList} 조합은 첫 진입 순간부터 생활 맥락과 맞닿은 가치 제안을 만들기 좋습니다.`,
            `앱 첫 화면은 사용자의 현재 상황을 한 문장으로 요약하고, 가장 가까운 추천 루틴을 카드로 제시합니다.`,
            `첫 카드에는 ${primaryLabel}가 배치되고, ${primary.keyFeatures[0]}가 왜 지금 유용한지 바로 설명됩니다.`,
            `사용자는 긴 설정 없이 추천 카드를 열어 자신에게 맞는 시작 옵션만 고릅니다.`,
            `${deviceDecision.final.modelName}는 이 순간의 중심 기기로 배치되어 사용자의 행동 부담을 줄입니다.`,
            `앱은 ${intent.lifestyleTags.join(", ")}와 연결되는 맥락을 짧은 카피와 시각 신호로 전달합니다.`,
            `추천 화면에서는 "지금 바로 실행"과 "내 루틴으로 저장" 두 가지 선택지만 남겨 의사결정을 단순화합니다.`,
            `실행이 시작되면 ${primary.keyFeatures[1] || primary.keyFeatures[0]}가 이어지며 첫 성공 경험을 분명하게 만듭니다.`,
            `사용자는 설정을 공부한 느낌이 아니라, 내 상황을 이해받았다는 인상을 받게 됩니다.`,
            `상황이 한 번 맞아떨어지면 ${secondaryLabel}가 다음 단계 가치로 자연스럽게 연결됩니다.`,
            `이 연결은 단발성 체험을 넘어 반복 사용의 이유를 만들고, 앱 체류 이유를 분명하게 합니다.`,
            `"${intent.purpose}" 과정에서 생기는 반복 확인과 조작 부담은 작은 자동화의 축적으로 완화됩니다.`,
            `중요한 점은 기술을 많이 보여주는 것이 아니라, 사용자가 덜 신경 써도 된다는 안심을 주는 것입니다.`,
            `따라서 메시지는 기능명보다 생활 변화, 시간 절감, 감정적 안도감을 먼저 말해야 합니다.`,
            `반복 사용이 쌓이면 앱은 사용자의 패턴을 더 짧은 단계로 재정리해 재제안할 수 있습니다.`,
            `이때 사용자는 매번 새로 배우지 않아도 되는 경험을 통해 브랜드의 배려를 체감합니다.`,
            `결과적으로 이 시나리오는 첫 실행의 마찰을 줄이고, 반복 사용의 이유를 만들며, 다른 기기로의 확장 여지도 남깁니다.`,
            `최종적으로 ${selectedSegment} 사용자는 더 적은 조작으로 더 큰 편안함, 절약, 안심, 즐거움을 경험하게 됩니다.`
        ];
    }

    return [
        `${locationLabel}: the ${selectedSegment} segment wants a smoother way to achieve "${intent.purpose}".`,
        `For the ${selectedSegment} segment, immediate value matters more than feature depth.`,
        `The combination of ${deviceList} makes the first benefit easier to feel with fewer decisions.`,
        `The app home opens with one clear scenario card instead of a dense control dashboard.`,
        `${primaryLabel} appears first, framed around why ${primary.keyFeatures[0]} matters right now.`,
        `The user selects a lightweight starting option rather than building a routine from scratch.`,
        `${deviceDecision.final.modelName} becomes the anchor device that turns intent into action quickly.`,
        `Short copy and visual cues connect the recommendation to ${intent.lifestyleTags.join(", ")}.`,
        `The interface keeps only two choices: run now or save as my routine.`,
        `Once triggered, ${primary.keyFeatures[1] || primary.keyFeatures[0]} reinforces the first success moment.`,
        `The experience feels less like setup and more like being understood.`,
        `${secondaryLabel} then extends the value into the next daily moment.`,
        `That progression gives the user a reason to come back, not just to try once.`,
        `Pressure points tied to repeated checking and manual control begin to feel lighter.`,
        `The goal is not to showcase more technology, but to reduce the need for constant attention.`,
        `Messaging should therefore lead with life improvement, time saved, and emotional reassurance.`,
        `As repeated use builds, the app can compress the journey into faster personalized shortcuts.`,
        `That repeated ease becomes a meaningful signal of care from the brand.`,
        `The scenario therefore reduces first-use friction, creates a reason to return, and opens room for device expansion.`,
        `In the end, the ${selectedSegment} segment experiences more comfort, savings, reassurance, and delight with less manual effort.`
    ];
}

function getRegionalSignals(countryCode, city, intent) {
    const cityNote = city ? ` (${city})` : "";
    const localeSignals = {
        ko: {
            KR: {
                observation: `도시형 주거와 빠른 일상 리듬이 공존하는 시장${cityNote}`,
                insight: "짧은 시간 안에 집안 상태를 정리하고 다음 행동으로 넘어가려는 니즈가 큼",
                implication: "첫 실행 허들을 낮춘 자동화 추천이 반복 사용으로 이어질 가능성이 높음"
            },
            US: {
                observation: `넓은 주거 공간과 개별화된 루틴이 강한 시장${cityNote}`,
                insight: "기기 단품보다 생활 장면 중심의 연결 제안이 체감 가치를 더 빨리 전달함",
                implication: "앱은 복수 기기 연결의 편익을 한 번의 사용 장면으로 압축해 보여줘야 함"
            },
            GB: {
                observation: `공간 효율성과 실용적 구매 판단이 중요한 시장${cityNote}`,
                insight: "설정 복잡도를 낮추고 에너지·시간 절감 메시지를 명확히 할수록 설득력이 높아짐",
                implication: "루틴 저장과 재사용 가치가 분명한 흐름이 유리함"
            },
            DE: {
                observation: `효율, 안정성, 지속가능성에 대한 관심이 높은 시장${cityNote}`,
                insight: "신뢰 가능한 자동화와 일상 효율 개선이 함께 제시될 때 수용성이 높아짐",
                implication: "가치 제안은 편의뿐 아니라 통제감과 예측 가능성을 함께 말해야 함"
            }
        },
        en: {
            KR: {
                observation: `a market where compact urban homes and fast daily rhythms coexist${cityNote}`,
                insight: "users strongly value flows that quickly reset the home state and move them to the next action",
                implication: "automation recommendations with low first-run friction are more likely to turn into repeat usage"
            },
            US: {
                observation: `a market shaped by larger living spaces and highly individualized routines${cityNote}`,
                insight: "connected life moments land faster than single-device feature stories",
                implication: "the app should compress multi-device value into one clearly understood usage scene"
            },
            GB: {
                observation: `a market where space efficiency and practical purchase logic matter${cityNote}`,
                insight: "persuasion improves when setup complexity is reduced and energy or time savings are made explicit",
                implication: "flows that make routine-saving and reuse value obvious are more effective"
            },
            DE: {
                observation: `a market with strong interest in efficiency, stability, and sustainability${cityNote}`,
                insight: "acceptance rises when trusted automation is paired with visible everyday efficiency gains",
                implication: "the value story should speak not only to convenience but also to control and predictability"
            }
        },
        de: {
            KR: {
                observation: `ein Markt, in dem kompakte urbane Wohnformen und schnelle Tagesrhythmen zusammenkommen${cityNote}`,
                insight: "Nutzer reagieren stark auf Abläufe, die den Zuhause-Zustand schnell ordnen und direkt zur nächsten Handlung führen",
                implication: "Automationsvorschläge mit niedriger Einstiegshürde werden eher zu wiederholter Nutzung"
            },
            US: {
                observation: `ein Markt, der von größeren Wohnflächen und stark individualisierten Routinen geprägt ist${cityNote}`,
                insight: "vernetzte Alltagsszenen vermitteln den Wert schneller als isolierte Gerätefunktionen",
                implication: "die App sollte den Mehrwert mehrerer Geräte in eine klar verständliche Nutzungsszene verdichten"
            },
            GB: {
                observation: `ein Markt, in dem Raumeffizienz und pragmatische Kaufentscheidungen wichtig sind${cityNote}`,
                insight: "die Überzeugungskraft steigt, wenn die Einrichtung einfacher wird und Energie- oder Zeitersparnis klar sichtbar ist",
                implication: "Abläufe mit klar erkennbarem Wert für gespeicherte und wiederverwendbare Routinen sind wirksamer"
            },
            DE: {
                observation: `ein Markt mit hohem Interesse an Effizienz, Stabilität und Nachhaltigkeit${cityNote}`,
                insight: "die Akzeptanz steigt, wenn vertrauenswürdige Automatisierung mit spürbarer Alltagseffizienz verbunden wird",
                implication: "das Nutzenversprechen sollte nicht nur Bequemlichkeit, sondern auch Kontrolle und Vorhersehbarkeit betonen"
            }
        }
    };
    const fallbackByLocale = {
        ko: {
            observation: `${getCountryName(countryCode)} 시장의 일상 리듬과 생활 환경을 고려한 일반적 사용 맥락${cityNote}`,
            insight: `${intent.missionBucket} 가치가 명확할수록 사용자는 기능보다 결과 중심으로 반응함`,
            implication: "앱은 복잡한 설명보다 한 번에 이해되는 추천 장면을 먼저 제시해야 함"
        },
        en: {
            observation: `a general usage context shaped by the daily rhythm and living environment of ${getCountryName(countryCode)}${cityNote}`,
            insight: `users respond more to outcome-led framing when the ${intent.missionBucket} value is explicit`,
            implication: "the app should surface an immediately understandable recommended scene before detailed explanation"
        },
        de: {
            observation: `ein allgemeiner Nutzungskontext, der vom Alltagsrhythmus und Wohnumfeld in ${getCountryName(countryCode)} geprägt ist${cityNote}`,
            insight: `Nutzer reagieren stärker auf ergebnisorientierte Botschaften, wenn der ${intent.missionBucket}-Wert klar ist`,
            implication: "die App sollte zuerst eine sofort verständliche Empfehlungsszene zeigen und erst danach Details erklären"
        }
    };
    const localizedSignals = localeSignals[currentLocale] || localeSignals.en;
    const localizedFallback = fallbackByLocale[currentLocale] || fallbackByLocale.en;
    return localizedSignals[countryCode] || localizedFallback;
}

function buildAutomationSkeleton(country, intent, deviceDecision, services) {
    const primary = services[0];
    const primaryLabel = getServiceLabel(primary);
    const signalDevices = (deviceDecision.selectedDevices || [deviceDecision.final.category]).map((device) => getCategoryName(device));
    const marketName = getCountryName(country.countryCode);
    return {
        userMoment: currentLocale === "ko"
            ? `${marketName} 사용자가 "${intent.purpose}" 상황에 들어오면 추천을 시작합니다.`
            : `Start the recommendation when a user in ${marketName} enters the "${intent.purpose}" moment.`,
        entryPoint: currentLocale === "ko"
            ? `${deviceDecision.final.modelName}와 앱 홈 화면을 첫 진입 포인트로 사용합니다.`
            : `Use ${deviceDecision.final.modelName} and the app home as the primary entry point.`,
        triggerSignals: [
            currentLocale === "ko"
                ? `${signalDevices.join(", ")} 선택 여부`
                : `Selected devices: ${signalDevices.join(", ")}`,
            currentLocale === "ko"
                ? `${intent.missionBucket} 관련 목적어 감지`
                : `${intent.missionBucket} intent detected in the user request`,
            currentLocale === "ko"
                ? `${primaryLabel} 활용 가능 여부`
                : `${primaryLabel} availability in the selected journey`
        ],
        recommendationLogic: [
            currentLocale === "ko"
                ? `${intent.lifestyleTags.join(", ")}와 맞는 장면을 먼저 제안합니다.`
                : `Prioritize scenes linked to ${intent.lifestyleTags.join(", ")}.`,
            currentLocale === "ko"
                ? `첫 실행 허들을 낮추기 위해 설정 단계를 최소화합니다.`
                : "Minimize setup friction for the first run.",
            currentLocale === "ko"
                ? `한 번의 성공 경험 뒤에 저장 가능한 반복 루틴으로 연결합니다.`
                : "Turn the first successful moment into a reusable routine."
        ],
        actions: [
            currentLocale === "ko"
                ? `${primaryLabel} 기반 추천 카드 노출`
                : `Show a recommendation card powered by ${primaryLabel}`,
            currentLocale === "ko"
                ? `${deviceDecision.final.modelName} 중심 실행 흐름 안내`
                : `Guide the execution flow around ${deviceDecision.final.modelName}`,
            currentLocale === "ko"
                ? `사용자 확인 후 자동화 저장 제안`
                : "Prompt the user to save the flow after confirmation",
            currentLocale === "ko"
                ? `반복 사용 시 개인화 추천 강화`
                : "Strengthen personalization after repeated use"
        ],
        expectedFeedback: currentLocale === "ko"
            ? "처음부터 복잡하지 않고, 내 상황에 맞는 추천을 받는다는 느낌"
            : "A feeling that the experience is simple from the start and tailored to the user's context"
    };
}

function getMatrixMarket(siteCode) {
    const normalized = normalizeSiteCode(siteCode || "");
    return (skuAvailabilityMatrix?.markets || []).find((market) =>
        market.siteCode === siteCode || market.countryCode === normalized
    ) || null;
}

function getServiceMatrixMarket(siteCode) {
    const normalized = normalizeSiteCode(siteCode || "");
    return (serviceSupportMatrix?.markets || []).find((market) =>
        market.siteCode === siteCode || market.countryCode === normalized
    ) || null;
}

function getCategoryAliases(category) {
    if (category === "세탁기" || category === "건조기") return ["세탁기", "건조기", "세탁기/건조기"];
    return [category];
}

function getMarketCategoryEvidence(siteCode, category) {
    const market = getMatrixMarket(siteCode);
    if (!market) return null;
    const aliases = getCategoryAliases(category);
    return market.categories.find((item) => {
        const categoryAliases = item.aliases || [item.categoryKey];
        return categoryAliases.some((alias) => aliases.includes(alias));
    }) || null;
}

function normalizeComparisonText(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, "");
}

function findAnchorSkuEvidence(siteCode, deviceDecision) {
    const categoryEvidence = getMarketCategoryEvidence(siteCode, deviceDecision.final.category);
    if (!categoryEvidence) return { categoryEvidence: null, product: null, matchType: "none" };

    const normalizedModel = normalizeComparisonText(deviceDecision.final.modelName);
    const exact = (categoryEvidence.products || []).find((product) =>
        normalizeComparisonText(product.modelName) === normalizedModel || normalizeComparisonText(product.sku) === normalizedModel
    );
    if (exact) return { categoryEvidence, product: exact, matchType: "exact" };

    const partial = (categoryEvidence.products || []).find((product) =>
        normalizedModel && normalizeComparisonText(product.modelName).includes(normalizedModel)
    );
    if (partial) return { categoryEvidence, product: partial, matchType: "partial" };

    return {
        categoryEvidence,
        product: categoryEvidence.products?.[0] || null,
        matchType: categoryEvidence.products?.length ? "category_fallback" : "none"
    };
}

function getServiceSupportEntry(siteCode, serviceName) {
    const market = getServiceMatrixMarket(siteCode);
    return market?.services?.find((service) => service.serviceName === serviceName || service.appCardLabel === serviceName) || null;
}

function buildFacts(country, city, selectedSegment, deviceDecision, services, exploreGrounding) {
    const selectedMarket = marketOptions.find((market) => market.siteCode === countrySelect.value);
    const marketInfo = getDotcomMarketInfo(selectedMarket);
    const trend = getCountryTrend(country.countryCode);
    const citySignal = city ? getCitySignal(country.countryCode, city) : null;
    const anchorService = services[0];
    const exactProductAvailable = country.availableProducts.some((product) => product.modelName === deviceDecision.final.modelName);
    const marketSku = getMatrixMarket(selectedMarket?.siteCode);
    const anchorSkuEvidence = findAnchorSkuEvidence(selectedMarket?.siteCode, deviceDecision);
    const serviceSupport = anchorService ? getServiceSupportEntry(selectedMarket?.siteCode, anchorService.serviceName) : null;
    const trackedCategoryCount = marketSku?.categories?.length || 0;
    const trackedSkuCount = marketSku?.categories?.reduce((sum, category) => sum + (category.productCount || 0), 0) || 0;
    const cityFact = citySignal
        ? [citySignal.region, citySignal.climate, citySignal.housing, citySignal.behavior].filter(Boolean).slice(0, 2).join(" / ")
        : "";

    // 삼성닷컴 URL & Explore URL 결정
    const trendSources = countryTrends?.[country.countryCode]?.sources || [];
    const samsungDotcomUrl = marketInfo?.fullUrl
        ? `https://${marketInfo.fullUrl}`
        : (country.samsungShopUrl || (trendSources[0] || ""));
    const categorySourceUrl = anchorSkuEvidence.categoryEvidence?.sourceUrl || "";
    const productSourceUrl = anchorSkuEvidence.product?.productUrl || "";
    const exploreV1Url = "https://cxoffering.samsungiotcloud.com/default/en-US/explore/step?state=PUBLISHED";
    const exploreV2Url = "https://cxoffering.samsungiotcloud.com/v2_default/en-GB/explore/step";

    const confirmed = [
        trend ? {
            no: 1,
            fact: trend.headline,
            source: "country_trends.json",
            source_url: samsungDotcomUrl,
            confidence: "High",
            impact: currentLocale === "ko" ? "국가 단위 메시지 방향과 장면 우선순위를 고정합니다." : "Sets the country-level message direction and scene priority."
        } : null,
        {
            no: 2,
            fact: currentLocale === "ko"
                ? `${selectedMarket?.siteCode || country.countryCode} 마켓은 ${marketInfo?.fullUrl || country.samsungShopUrl || "삼성닷컴"} 기준으로 연결됩니다.`
                : `The selected market routes to ${marketInfo?.fullUrl || country.samsungShopUrl || "the Samsung store"} via ${selectedMarket?.siteCode || country.countryCode}.`,
            source: "samsung.com",
            source_url: samsungDotcomUrl,
            confidence: "High",
            impact: currentLocale === "ko" ? "닷컴 문구와 CTA의 언어/마켓 기준을 확정합니다." : "Locks the market and language basis for dotcom copy and CTA."
        },
        {
            no: 3,
            fact: currentLocale === "ko"
                ? `${selectedMarket?.siteCode || country.countryCode} 삼성닷컴 추적 카테고리 ${trackedCategoryCount}개에서 SKU ${trackedSkuCount}개를 확인했습니다.`
                : `Confirmed ${trackedSkuCount} SKUs across ${trackedCategoryCount} tracked Samsung dotcom categories for ${selectedMarket?.siteCode || country.countryCode}.`,
            source: "sku_availability_matrix.json",
            source_url: categorySourceUrl || samsungDotcomUrl,
            confidence: marketSku ? "High" : "Medium",
            impact: currentLocale === "ko" ? "03의 모델/구매 준비도 판단을 실제 삼성닷컴 SKU 기준으로 고정합니다." : "Anchors model and purchase-readiness judgement to official Samsung dotcom SKUs."
        },
        anchorSkuEvidence.categoryEvidence ? {
            no: 4,
            fact: currentLocale === "ko"
                ? `${getCategoryName(deviceDecision.final.category)} 카테고리는 ${anchorSkuEvidence.categoryEvidence.productCount || 0}개 SKU가 추적되며, 구매 가능 표시는 ${anchorSkuEvidence.categoryEvidence.inStockCount || 0}개입니다.`
                : `${getCategoryName(deviceDecision.final.category)} is backed by ${anchorSkuEvidence.categoryEvidence.productCount || 0} tracked SKUs, with ${anchorSkuEvidence.categoryEvidence.inStockCount || 0} showing purchasable availability.`,
            source: "samsung.com",
            source_url: categorySourceUrl || samsungDotcomUrl,
            confidence: "High",
            impact: currentLocale === "ko" ? "앵커 기기와 구매 가능성 판단을 시장별 공식 카테고리 페이지에 맞춥니다." : "Aligns the anchor-device and purchase-readiness judgement to market-specific official category pages."
        } : null,
        anchorService ? {
            no: 5,
            fact: currentLocale === "ko"
                ? `${anchorService.appCardLabel || anchorService.serviceName} 서비스 후보는 ${anchorService.keyFeatures.slice(0, 2).join(", ")} 신호를 중심으로 연결됩니다.`
                : `${anchorService.appCardLabel || anchorService.serviceName} is grounded on signals such as ${anchorService.keyFeatures.slice(0, 2).join(", ")}.`,
            source: "Explore Contents",
            source_url: exploreV1Url,
            confidence: "High",
            impact: currentLocale === "ko" ? "서비스 스택과 자동화 흐름의 기준점을 제공합니다." : "Provides the baseline for service-stack and automation logic."
        } : null,
        cityFact ? {
            no: 6,
            fact: `${citySignal.cityDisplay}: ${cityFact}`,
            source: "city_signals.json",
            source_url: samsungDotcomUrl,
            confidence: "Medium",
            impact: currentLocale === "ko" ? "도시 맥락에 맞는 첫 장면과 카피 톤을 조정합니다." : "Tunes the first scene and copy tone to the city context."
        } : null
    ].filter(Boolean);

    const assumptions = [
        anchorSkuEvidence.matchType === "partial" || anchorSkuEvidence.matchType === "category_fallback" || deviceDecision.fallbackApplied
            ? (currentLocale === "ko"
                ? `추론: ${deviceDecision.final.modelName}와 정확히 일치하는 삼성닷컴 SKU를 찾지 못해 ${anchorSkuEvidence.product?.modelName || "동일 카테고리 대표 SKU"} 기준으로 연결했습니다.`
                : `Inference: no exact Samsung dotcom SKU matched ${deviceDecision.final.modelName}, so the closest in-category SKU was used.`)
            : (currentLocale === "ko"
                ? `추론: ${(deviceDecision.selectedDevices || [deviceDecision.final.category]).map((device) => getCategoryName(device)).join(", ")} 조합이 하나의 생활 루틴으로 함께 운영된다고 가정했습니다.`
                : "Inference: the selected device mix is assumed to operate as one connected life routine."),
        serviceSupport
            ? (currentLocale === "ko"
                ? `추론: ${anchorService.appCardLabel || anchorService.serviceName}의 시장 지원도는 필수 카테고리 충족률 기준 ${serviceSupport.inferredSupport.status}로 계산했습니다.`
                : `Inference: ${anchorService.appCardLabel || anchorService.serviceName} support was estimated from required-category coverage and rated ${serviceSupport.inferredSupport.status}.`)
            : (currentLocale === "ko"
                ? "추론: 서비스 매트릭스에 직접 연결되지 않은 경우 서비스 지원도는 미검증으로 유지합니다."
                : "Inference: when the service matrix has no direct link, service support remains unverified."),
        currentLocale === "ko"
            ? `추론: ${selectedSegment} 타겟은 "${exploreGrounding.functionalJob}" 문제를 반복적으로 느낀다고 가정했습니다.`
            : `Inference: the ${selectedSegment} segment is assumed to repeatedly feel the pain of "${exploreGrounding.functionalJob}".`,
        !citySignal
            ? (currentLocale === "ko"
                ? `추론: ${city || getCountryName(country.countryCode)}에 대한 정밀 도시 데이터가 없어 국가 기본 패턴으로 보강했습니다.`
                : `Inference: no precise city-level dataset was found for ${city || getCountryName(country.countryCode)}, so country fallback logic was applied.`)
            : (currentLocale === "ko"
                ? "추론: 도시 데이터는 생활 환경 단서로 사용했고 실제 캠페인 집행 전 리테일/재고 확인이 필요합니다."
                : "Inference: city data was used as an environmental cue and still needs retail and stock confirmation before launch.")
    ];

    const readiness = [
        {
            label: currentLocale === "ko" ? "앵커 기기" : "Anchor device",
            status: anchorSkuEvidence.matchType === "exact" ? "Supported" : anchorSkuEvidence.product ? "Limited" : "Unverified",
            note: anchorSkuEvidence.matchType === "exact"
                ? (currentLocale === "ko"
                    ? `${anchorSkuEvidence.product.modelName} SKU가 삼성닷컴에 직접 확인됩니다.`
                    : `${anchorSkuEvidence.product.modelName} is directly confirmed on Samsung dotcom.`)
                : anchorSkuEvidence.product
                    ? (currentLocale === "ko"
                        ? `${anchorSkuEvidence.product.modelName}로 카테고리 대체 연결했습니다.`
                        : `Mapped to ${anchorSkuEvidence.product.modelName} as the closest category-level fallback.`)
                    : (currentLocale === "ko" ? "공식 삼성닷컴 SKU 증거가 아직 없습니다." : "No official Samsung dotcom SKU evidence was found yet.")
        },
        {
            label: currentLocale === "ko" ? "서비스 스택" : "Service stack",
            status: serviceSupport?.inferredSupport?.status === "supported"
                ? "Supported"
                : serviceSupport?.inferredSupport?.status === "limited"
                    ? "Limited"
                    : "Unverified",
            note: serviceSupport
                ? (currentLocale === "ko"
                    ? `필수 카테고리 ${serviceSupport.confirmedEvidence.coveredCategories.length}/${serviceSupport.requiredCategories.length}개가 삼성닷컴 SKU로 확인됩니다.`
                    : `${serviceSupport.confirmedEvidence.coveredCategories.length}/${serviceSupport.requiredCategories.length} required categories have Samsung dotcom SKU evidence.`)
                : (currentLocale === "ko"
                    ? "시장별 서비스 증거가 없어 미검증으로 유지합니다."
                    : "No market-level service evidence was found, so this remains unverified.")
        },
        {
            label: currentLocale === "ko" ? "구매 가능 상태" : "Purchase status",
            status: anchorSkuEvidence.product?.availability?.status === "supported"
                ? "Supported"
                : anchorSkuEvidence.product
                    ? "Limited"
                    : "Unknown",
            note: anchorSkuEvidence.product
                ? `${anchorSkuEvidence.product.availability.status} / ${anchorSkuEvidence.product.availability.confidence}`
                : (currentLocale === "ko" ? "실시간 구매 상태를 연결할 SKU를 찾지 못했습니다." : "No SKU was mapped for live purchase-state sync.")
        },
        {
            label: currentLocale === "ko" ? "특징 추출" : "Feature extraction",
            status: anchorSkuEvidence.product?.features?.confirmed?.length ? "Supported" : "Limited",
            note: anchorSkuEvidence.product?.features?.confirmed?.length
                ? (currentLocale === "ko"
                    ? `삼성닷컴 문구에서 핵심 특징 ${anchorSkuEvidence.product.features.confirmed.length}개를 구조화했습니다.`
                    : `Structured ${anchorSkuEvidence.product.features.confirmed.length} core features from Samsung dotcom copy.`)
                : (currentLocale === "ko"
                    ? "모델명 중심 태그만 추출되어 추가 확인이 필요합니다."
                    : "Only model-name tags were extracted, so more validation is still needed.")
        },
        {
            label: currentLocale === "ko" ? "도시 정밀도" : "City precision",
            status: citySignal ? "Supported" : "Limited",
            note: citySignal
                ? (currentLocale === "ko" ? "도시/생활 신호를 적용했습니다." : "Applied city and lifestyle signals.")
                : (currentLocale === "ko" ? "국가 기본 시그널로 보강했습니다." : "Used the country fallback signal.")
        }
    ];

    // sourceRefs: 내부 파일 + 외부 URL 모두 포함
    const sourceRefEntries = [...new Set([
        ...confirmed.map((item) => item.source),
        serviceSupport ? "service_support_matrix.json" : null,
        anchorSkuEvidence.product ? "product_feature_matrix.json" : null
    ].filter(Boolean))];
    // 외부 URL 출처
    const sourceUrlEntries = [...new Set([
        samsungDotcomUrl,
        categorySourceUrl,
        productSourceUrl,
        exploreV1Url,
        exploreV2Url
    ].filter(Boolean))];

    return {
        confirmed,
        assumptions,
        readiness,
        observation: exploreGrounding.observation,
        insight: exploreGrounding.insight,
        implication: exploreGrounding.implication,
        sourceRefs: sourceRefEntries,
        sourceUrls: sourceUrlEntries
    };
}

function buildRoleDetailSections(roleId, country, selectedMarket, deviceDecision, services, selectedSegment, intent, exploreGrounding) {
    const primary = services[0];
    const selectedCategories = [...new Set((deviceDecision.selectedDevices || [deviceDecision.final.category]).map((item) => getCategoryName(item)))];
    const availableProducts = Array.isArray(country.availableProducts) ? country.availableProducts : [];
    const catalogReady = availableProducts.length > 0;
    const stockNote = currentLocale === "ko" ? "재고확인필요" : "Stock check required";
    const productLine = (product) => `${product.modelName} (${getCategoryName(product.category)}) - ${stockNote}`;
    const productByCategory = new Map(availableProducts.map((product) => [getCategoryName(product.category), product]));
    const anchored = selectedCategories.map((category) => productByCategory.get(category)).filter(Boolean);
    const orderedProducts = [...new Map([...anchored, ...availableProducts].map((item) => [item.modelName, item])).values()];
    const entryBundle = orderedProducts.slice(0, 1);
    const coreBundle = orderedProducts.slice(0, Math.min(2, orderedProducts.length));
    const premiumBundle = orderedProducts.slice(0, Math.min(4, orderedProducts.length));
    const optionalCategories = [...new Set(orderedProducts.map((item) => getCategoryName(item.category)).filter((category) => !selectedCategories.includes(category)))];
    const marketInfo = getDotcomMarketInfo(selectedMarket);

    if (roleId === "retail") {
        return [
            {
                title: currentLocale === "ko" ? "30초 / 1분 세일즈 토크" : "30s / 1m Sales Talk",
                items: [
                    currentLocale === "ko"
                        ? `30초: "${deviceDecision.final.modelName} 하나로 ${intent.missionBucket} 가치가 바로 체감됩니다. 먼저 ${primary.keyFeatures[0]}부터 보여드릴게요."`
                        : `30s: "${deviceDecision.final.modelName} makes ${intent.missionBucket} value immediate. Let me show ${primary.keyFeatures[0]} first."`,
                    currentLocale === "ko"
                        ? `1분: ${selectedSegment} 고객 기준으로 ${intent.purpose} 상황을 재현하고, 핵심 기능 1개 + 확장 기기 1개까지 연결합니다.`
                        : `1m: Recreate the ${intent.purpose} moment for ${selectedSegment}, then connect one core feature and one upsell device.`
                ]
            },
            {
                title: currentLocale === "ko" ? "추천 기기 조합 (입문형 / 업셀용)" : "Recommended Device Mix (Entry / Upsell)",
                items: [
                    currentLocale === "ko"
                        ? `입문형: ${entryBundle.length ? entryBundle.map(productLine).join(" / ") : `${deviceDecision.final.modelName} (${stockNote})`}`
                        : `Entry: ${entryBundle.length ? entryBundle.map(productLine).join(" / ") : `${deviceDecision.final.modelName} (${stockNote})`}`,
                    currentLocale === "ko"
                        ? `업셀용: ${coreBundle.length ? coreBundle.map(productLine).join(" / ") : `${deviceDecision.final.modelName} (${stockNote})`}`
                        : `Upsell: ${coreBundle.length ? coreBundle.map(productLine).join(" / ") : `${deviceDecision.final.modelName} (${stockNote})`}`
                ]
            },
            {
                title: currentLocale === "ko" ? "SmartThings 단계별 세팅" : "SmartThings Setup Steps",
                items: [
                    currentLocale === "ko" ? "1) Samsung Account 로그인 2) Home 생성 3) 기준 기기 1대 연결" : "1) Sign in with Samsung Account 2) Create Home 3) Connect one anchor device",
                    currentLocale === "ko" ? "4) 자동화 1개 생성 5) 알림/위젯 설정 6) 추가 기기 확장" : "4) Build one automation 5) Set alerts/widgets 6) Expand with additional devices"
                ]
            },
            {
                title: currentLocale === "ko" ? "호환성 체크 & 실패 사례" : "Compatibility Checks & Common Failures",
                items: [
                    currentLocale === "ko" ? "체크: 동일 Wi-Fi 대역, 최신 앱 버전, 지역 계정 일치 여부 확인" : "Check: same Wi-Fi band, latest app version, and matching regional account",
                    currentLocale === "ko" ? "실패 사례: 기기 연결 전 계정 권한 미승인, 허브/센서 페어링 순서 오류" : "Failure cases: missing account permission before onboarding, incorrect hub/sensor pairing order"
                ]
            }
        ];
    }

    if (roleId === "dotcom") {
        const requiredText = selectedCategories.length ? selectedCategories.join(", ") : getCategoryName(deviceDecision.final.category);
        const optionalText = optionalCategories.length ? optionalCategories.join(", ") : (currentLocale === "ko" ? "추가 선택 기기 없음" : "No additional optional devices");
        const benefitToProduct = (entryBundle.length ? entryBundle : [{ modelName: deviceDecision.final.modelName, category: deviceDecision.final.category }]).map((product) => (
            currentLocale === "ko"
                ? `${exploreGrounding.primaryValue} -> ${product.modelName} (${getCategoryName(product.category)})`
                : `${exploreGrounding.primaryValue} -> ${product.modelName} (${getCategoryName(product.category)})`
        ));
        return [
            {
                title: currentLocale === "ko" ? "지역 eStore / 지원 기기 매트릭스" : "Regional eStore / Supported Device Matrix",
                items: [
                    currentLocale === "ko"
                        ? `도메인: ${marketInfo?.fullUrl || country.samsungShopUrl || `https://www.samsung.com/${(selectedMarket?.siteCode || country.countryCode || "").toLowerCase()}`}`
                        : `Domain: ${marketInfo?.fullUrl || country.samsungShopUrl || `https://www.samsung.com/${(selectedMarket?.siteCode || country.countryCode || "").toLowerCase()}`}`,
                    ...(orderedProducts.slice(0, 4).map((product) => `- ${productLine(product)}`)),
                    ...(catalogReady ? [] : [currentLocale === "ko" ? "- 지역 판매 SKU 데이터 미확보: 재고확인필요" : "- Regional SKU list unavailable: stock check required"])
                ]
            },
            {
                title: currentLocale === "ko" ? "제품 번들 추천 (Entry / Core / Premium)" : "Bundle Recommendation (Entry / Core / Premium)",
                items: [
                    currentLocale === "ko"
                        ? `Entry: ${entryBundle.length ? entryBundle.map(productLine).join(" / ") : `${deviceDecision.final.modelName} (${stockNote})`}`
                        : `Entry: ${entryBundle.length ? entryBundle.map(productLine).join(" / ") : `${deviceDecision.final.modelName} (${stockNote})`}`,
                    currentLocale === "ko"
                        ? `Core: ${coreBundle.length ? coreBundle.map(productLine).join(" / ") : `${deviceDecision.final.modelName} (${stockNote})`}`
                        : `Core: ${coreBundle.length ? coreBundle.map(productLine).join(" / ") : `${deviceDecision.final.modelName} (${stockNote})`}`,
                    currentLocale === "ko"
                        ? `Premium: ${premiumBundle.length ? premiumBundle.map(productLine).join(" / ") : `${deviceDecision.final.modelName} (${stockNote})`}`
                        : `Premium: ${premiumBundle.length ? premiumBundle.map(productLine).join(" / ") : `${deviceDecision.final.modelName} (${stockNote})`}`
                ]
            },
            {
                title: currentLocale === "ko" ? "필수 vs 선택 기기 구분" : "Required vs Optional Devices",
                items: [
                    currentLocale === "ko" ? `필수: ${requiredText}` : `Required: ${requiredText}`,
                    currentLocale === "ko" ? `선택: ${optionalText}` : `Optional: ${optionalText}`
                ]
            },
            {
                title: currentLocale === "ko" ? "PDP / 랜딩 Benefit -> Product 매핑" : "PDP / Landing Benefit -> Product Mapping",
                items: benefitToProduct
            }
        ];
    }

    return [
        {
            title: currentLocale === "ko" ? "브랜드 메시지 (단문 / 장문)" : "Brand Message (Short / Long)",
            items: [
                currentLocale === "ko"
                    ? `단문: ${exploreGrounding.primaryValue}을 생활의 기본 리듬으로 만듭니다.`
                    : `Short: Turn ${exploreGrounding.primaryValue} into an everyday rhythm.`,
                currentLocale === "ko"
                    ? `장문: ${selectedSegment}의 "${intent.purpose}" 상황에서 시작해, 기술 설명보다 사용자가 느끼는 안도감과 여유를 브랜드 경험으로 연결합니다.`
                    : `Long: Start from "${intent.purpose}" for ${selectedSegment}, and turn emotional relief into a branded experience beyond feature talk.`
            ]
        },
        {
            title: currentLocale === "ko" ? "지역·문화 맥락 스토리텔링" : "Regional & Cultural Storytelling",
            items: [
                currentLocale === "ko"
                    ? `${getCountryName(country.countryCode)} 생활 리듬에서 반복되는 불편을 첫 장면으로 배치하고, 현지 언어 톤으로 카피를 조정합니다.`
                    : `Open with recurring friction in the daily rhythm of ${getCountryName(country.countryCode)} and tune copy to local language tone.`,
                currentLocale === "ko"
                    ? "현지 가족/주거 패턴에 맞는 장면을 1차 노출 소재로 고정합니다."
                    : "Lock one local household/living-context scene as the primary exposure asset."
            ]
        },
        {
            title: currentLocale === "ko" ? "캠페인·시즌·이벤트 연계" : "Campaign / Season / Event Linkage",
            items: [
                currentLocale === "ko"
                    ? `시즌: ${intent.missionBucket} 니즈가 커지는 시점에 맞춰 메시지 강도를 조정합니다.`
                    : `Seasonality: adjust message intensity when ${intent.missionBucket} demand rises.`,
                currentLocale === "ko"
                    ? "이벤트: 런칭/프로모션/리마인드 3단계로 소재를 분리 운영합니다."
                    : "Events: split assets into launch, promotion, and reminder phases."
            ]
        },
        {
            title: currentLocale === "ko" ? "글로벌 vs 로컬 메시지 구분" : "Global vs Local Message Logic",
            items: [
                currentLocale === "ko" ? `글로벌: ${exploreGrounding.primaryValue} 중심의 일관된 가치 문장` : `Global: one consistent value line around ${exploreGrounding.primaryValue}`,
                currentLocale === "ko" ? "로컬: 시장별 생활 맥락/언어/시즌에 맞춘 사례 문장" : "Local: market-specific lines tuned by context, language, and season"
            ]
        }
    ];
}

function buildWhatYouGet(roleId, context) {
    const isKo = currentLocale === "ko";
    const {
        marketName,
        selectedSegment,
        intent,
        deviceDecision,
        roleDetails,
        exploreGrounding
    } = context;

    const detailPick = (sectionIndex, itemIndex) => roleDetails?.[sectionIndex]?.items?.[itemIndex] || "";

    if (roleId === "retail") {
        return [
            {
                title: isKo ? "고객에게 바로 읽히는 한 문장" : "One line customers understand immediately",
                meaning: isKo ? "매장에서 첫 10초에 전달할 핵심 세일즈 문장입니다." : "The core sales sentence to use in the first 10 seconds in store.",
                example: isKo
                    ? `예시: "${deviceDecision.final.modelName} 하나로 ${intent.missionBucket}를 바로 체감할 수 있습니다."`
                    : `Example: "${deviceDecision.final.modelName} gives immediate ${intent.missionBucket} value."`
            },
            {
                title: isKo ? "30초 데모 흐름" : "30-second demo flow",
                meaning: isKo ? "기능 설명이 아니라 생활 문제 -> 해결 장면 순서로 보여주는 구조입니다." : "A show flow built as problem -> solved moment, not a feature dump.",
                example: isKo ? `예시: ${detailPick(0, 1)}` : `Example: ${detailPick(0, 1)}`
            },
            {
                title: isKo ? "추천 기기 조합" : "Recommended device mix",
                meaning: isKo ? "입문형/확장형으로 나눠 바로 제안할 수 있는 판매 조합입니다." : "A ready-to-sell mix split into entry and expansion options.",
                example: isKo ? `예시: ${detailPick(1, 0)}` : `Example: ${detailPick(1, 0)}`
            },
            {
                title: isKo ? "현장 세팅 체크 순서" : "On-site setup checklist order",
                meaning: isKo ? "설치/연결 단계에서 실패를 줄이기 위한 최소 체크 순서입니다." : "A minimal check order that lowers setup failure risk.",
                example: isKo ? `예시: ${detailPick(2, 0)}` : `Example: ${detailPick(2, 0)}`
            },
            {
                title: isKo ? "실패 리스크 사전 확인" : "Pre-check for failure risks",
                meaning: isKo ? "상담 중 자주 발생하는 호환/계정 이슈를 먼저 점검하는 항목입니다." : "Quick checks for frequent compatibility/account issues during consultation.",
                example: isKo ? `예시: ${detailPick(3, 0)}` : `Example: ${detailPick(3, 0)}`
            }
        ];
    }

    if (roleId === "dotcom") {
        return [
            {
                title: isKo ? "랜딩 첫 화면 메시지" : "First-screen landing message",
                meaning: isKo ? "PDP 상단에서 어떤 상황 가치부터 보여줄지 정한 문구입니다." : "The line that defines which situational value appears first on PDP.",
                example: isKo
                    ? `예시: ${selectedSegment}에게 "${intent.missionBucket}" 가치를 첫 화면에서 먼저 제시`
                    : `Example: Lead with "${intent.missionBucket}" value for ${selectedSegment} on first screen`
            },
            {
                title: isKo ? "지역 eStore 기준 도메인/제품 맵" : "Region eStore domain and product map",
                meaning: isKo ? "해당 국가에서 실제 연결할 URL과 주력 제품 기준입니다." : "The market URL and product anchor map for the selected country.",
                example: isKo ? `예시: ${detailPick(0, 0)}` : `Example: ${detailPick(0, 0)}`
            },
            {
                title: isKo ? "번들 제안 구조 (Entry/Core/Premium)" : "Bundle ladder (Entry/Core/Premium)",
                meaning: isKo ? "가격/가치 단계별로 추천을 나눠 장바구니 진입을 쉽게 만드는 구조입니다." : "A pricing-value ladder that makes add-to-cart easier.",
                example: isKo ? `예시: ${detailPick(1, 1)}` : `Example: ${detailPick(1, 1)}`
            },
            {
                title: isKo ? "필수 vs 선택 기기 기준" : "Required vs optional device logic",
                meaning: isKo ? "최소 구매 구성과 확장 구성을 분리해 혼선을 줄이는 기준입니다." : "A clear split between minimum and expansion device sets.",
                example: isKo ? `예시: ${detailPick(2, 0)}` : `Example: ${detailPick(2, 0)}`
            },
            {
                title: isKo ? "Benefit -> Product 매핑" : "Benefit -> Product mapping",
                meaning: isKo ? "사용자 혜택 문장을 어떤 제품과 연결할지 정리한 맵입니다." : "A map that ties user benefits to concrete products.",
                example: isKo ? `예시: ${detailPick(3, 0)}` : `Example: ${detailPick(3, 0)}`
            }
        ];
    }

    return [
        {
            title: isKo ? "캠페인 핵심 한 줄" : "Core campaign one-liner",
            meaning: isKo ? "브랜드 톤을 유지하면서도 시장에서 바로 이해되는 핵심 문장입니다." : "A core line that keeps brand tone and stays easy to grasp.",
            example: isKo
                ? `예시: ${exploreGrounding.primaryValue}을 생활의 기본 리듬으로 만듭니다.`
                : `Example: Turn ${exploreGrounding.primaryValue} into an everyday rhythm.`
        },
        {
            title: isKo ? "감정 중심 스토리 장면" : "Emotion-first story moment",
            meaning: isKo ? "기능 대신 사용자가 느끼는 변화 장면을 메인으로 두는 구성입니다." : "A story structure that prioritizes felt change over features.",
            example: isKo ? `예시: "${intent.purpose}" 장면에서 안도감이 생기는 순간을 메인 컷으로 사용` : `Example: Use the relief moment in "${intent.purpose}" as the key scene`
        },
        {
            title: isKo ? "로컬 문화/언어 적용 포인트" : "Local culture and language adaptation",
            meaning: isKo ? "시장별 생활 리듬과 정서에 맞게 카피 톤을 조정하는 기준입니다." : "Guidance for tuning copy tone to local rhythm and emotion.",
            example: isKo ? `예시: ${marketName} 생활 맥락에 맞는 감정 언어로 메시지 현지화` : `Example: Localize emotional tone to daily context in ${marketName}`
        },
        {
            title: isKo ? "캠페인 에셋 패키지" : "Campaign asset package",
            meaning: isKo ? "메인 영상, 소셜 카피, KV를 하나의 정서로 묶어 운영하는 구성입니다." : "A package that keeps film, social copy, and KV in one emotion.",
            example: isKo
                ? `예시: 30초 영상 + 소셜 카피 + KV를 "${selectedSegment}" 타겟 톤으로 통일`
                : `Example: Keep 30s film + social copy + KV aligned for ${selectedSegment}`
        },
        {
            title: isKo ? "시즌/이벤트 운영 타이밍" : "Season/event operating timing",
            meaning: isKo ? "언제 메시지 강도를 올리고 소재를 분리할지 정한 실행 기준입니다." : "Execution timing for when to intensify and split campaign assets.",
            example: isKo ? `예시: ${intent.missionBucket} 니즈가 커지는 시즌에 런칭 -> 프로모션 -> 리마인드 운영` : `Example: Run launch -> promo -> reminder as ${intent.missionBucket} demand peaks`
        }
    ];
}

function buildRoleLensOutputs(selectedRole, narrative, country, selectedMarket, deviceDecision, services, selectedSegment, intent, exploreGrounding) {
    const primary = services[0];
    const marketName = getCountryName(country.countryCode);
    const detailsByRole = {
        retail: buildRoleDetailSections("retail", country, selectedMarket, deviceDecision, services, selectedSegment, intent, exploreGrounding),
        dotcom: buildRoleDetailSections("dotcom", country, selectedMarket, deviceDecision, services, selectedSegment, intent, exploreGrounding),
        brand: buildRoleDetailSections("brand", country, selectedMarket, deviceDecision, services, selectedSegment, intent, exploreGrounding)
    };
    const outputs = {
        retail: {
            id: "retail",
            title: getRoleTitle("retail"),
            subtitle: localizeRoleText("retailSubtitle"),
            bullets: [
                localizeRoleText("retailBullet1", deviceDecision.final.modelName),
                localizeRoleText("retailBullet2", primary.keyFeatures[0]),
                localizeRoleText("retailBullet3"),
                currentLocale === "ko"
                ? `${selectedSegment} 고객에게는 "${intent.purpose}"를 바로 데모 문장으로 사용합니다.`
                : `Use "${intent.purpose}" as the live demo line for the ${selectedSegment} segment.`
            ],
            copy: narrative[7],
            asset: currentLocale === "ko" ? "매장 데모 스크립트 + 상담 카드" : "Store demo script + consultation card",
            message: currentLocale === "ko"
                ? `${deviceDecision.final.modelName}가 ${marketName} 매장에서 어떤 생활 문제를 줄여주는지, 그리고 왜 지금 필요한지를 한 문장으로 설명합니다.`
                : `Explain in one sentence which daily-life problem ${deviceDecision.final.modelName} solves in ${marketName} stores and why it matters now.`,
            cta: currentLocale === "ko" ? "지금 바로 체험해 보세요" : "Try this experience now",
            kpi: currentLocale === "ko" ? "상담 전환율 / 데모 후 관심도" : "Consultation conversion / post-demo interest",
            objective: currentLocale === "ko" ? "매장에서 30초 안에 고객이 '왜 필요한지' 이해하게 만드는 것" : "Make shoppers understand 'why it matters' within 30 seconds in-store.",
            headline: currentLocale === "ko" ? `${exploreGrounding.primaryValue}이 바로 읽히는 한 장면으로 설명합니다.` : `Lead with one moment that makes ${exploreGrounding.primaryValue} immediately legible.`,
            proofPoints: [
                currentLocale === "ko" ? `${deviceDecision.final.modelName} 중심 데모로 시작해 이해 허들을 낮춥니다.` : `Start with a demo anchored on ${deviceDecision.final.modelName} to lower comprehension friction.`,
                currentLocale === "ko" ? `${primary.keyFeatures[0]}를 생활 문제 해결 언어로 번역합니다.` : `Translate ${primary.keyFeatures[0]} into problem-solving language.`,
                currentLocale === "ko" ? `상담 중 추가 기기 확장 포인트를 자연스럽게 연결합니다.` : "Introduce expansion opportunities naturally during consultation."
            ],
            executionChecklist: [
                currentLocale === "ko" ? "데모 시작 문장을 한 줄로 통일" : "Standardize the opening demo line in one sentence",
                currentLocale === "ko" ? "첫 질문은 기능이 아니라 생활 문제로 시작" : "Open with the daily problem, not the feature",
                currentLocale === "ko" ? "체험 후 바로 다음 추천 기기 연결" : "Connect the next recommended device immediately after the demo"
            ],
            roleDetailSections: detailsByRole.retail,
            whatYouGet: buildWhatYouGet("retail", {
                marketName,
                selectedSegment,
                intent,
                deviceDecision,
                roleDetails: detailsByRole.retail
            })
        },
        dotcom: {
            id: "dotcom",
            title: getRoleTitle("dotcom"),
            subtitle: localizeRoleText("dotcomSubtitle"),
            bullets: [
                localizeRoleText("dotcomBullet1"),
                localizeRoleText("dotcomBullet2"),
                localizeRoleText("dotcomBullet3"),
                currentLocale === "ko"
                    ? `PDP 상단에는 ${selectedSegment}와 ${intent.missionBucket} 가치를 먼저 보여줍니다.`
                    : `Lead the PDP with the ${selectedSegment} segment and the ${intent.missionBucket} value.`
            ],
            copy: localizeRoleText("dotcomCopy", deviceDecision.final.modelName),
            asset: currentLocale === "ko" ? "PDP 히어로 배너 + FAQ + 추천 카드" : "PDP hero banner + FAQ + recommendation card",
            message: currentLocale === "ko"
                ? `사용 장면, 핵심 가치, CTA가 ${exploreGrounding.coreMessage}에 맞춰 한 화면 안에서 이어지게 구성합니다.`
                : `Keep the use moment, core value, and CTA aligned to ${exploreGrounding.coreMessage} within one continuous page flow.`,
            cta: currentLocale === "ko" ? "내 상황에 맞는 추천 보기" : "See recommendations for my situation",
            kpi: currentLocale === "ko" ? "PDP 체류시간 / CTA 클릭률 / 장바구니 진입" : "PDP dwell time / CTA CTR / add-to-cart rate",
            objective: currentLocale === "ko" ? "랜딩에서 장바구니 진입까지 메시지 이탈 없이 연결하는 것" : "Connect landing to add-to-cart without message drop-off.",
            headline: currentLocale === "ko" ? `"내 상황에서 무엇이 가벼워지는가"를 먼저 보여줍니다.` : `Show "what gets lighter in my situation" before product specs.`,
            proofPoints: [
                currentLocale === "ko" ? "히어로 영역에서 상황-가치-CTA를 한 번에 제시" : "Present situation, value, and CTA together in the hero area",
                currentLocale === "ko" ? "FAQ와 카드 섹션에서 같은 메시지를 반복 강화" : "Reinforce the same message through FAQ and cards",
                currentLocale === "ko" ? "장바구니 전환 직전에는 설정 난이도보다 즉시 체감 가치를 강조" : "Emphasize immediate value over setup complexity before conversion"
            ],
            executionChecklist: [
                currentLocale === "ko" ? "PDP 첫 화면 문구를 2문장 이내로 압축" : "Keep the first PDP message within two sentences",
                currentLocale === "ko" ? "추천 CTA는 한 종류만 우선 검증" : "Validate one priority recommendation CTA first",
                currentLocale === "ko" ? "FAQ는 사용 상황 중심 질문으로 재정렬" : "Reorder FAQ around real-use questions"
            ],
            roleDetailSections: detailsByRole.dotcom,
            whatYouGet: buildWhatYouGet("dotcom", {
                marketName,
                selectedSegment,
                intent,
                deviceDecision,
                roleDetails: detailsByRole.dotcom
            })
        },
        brand: {
            id: "brand",
            title: getRoleTitle("brand"),
            subtitle: localizeRoleText("brandSubtitle"),
            bullets: [
                localizeRoleText("brandBullet1"),
                localizeRoleText("brandBullet2"),
                localizeRoleText("brandBullet3"),
                currentLocale === "ko"
                    ? `${marketName} 생활 맥락에 맞는 감정 언어로 메시지를 현지화합니다.`
                    : `Localize the emotional message to the daily context of ${marketName}.`
            ],
            copy: localizeRoleText("brandCopy"),
            asset: currentLocale === "ko" ? "30초 영상 + 소셜 카피 + KV" : "30-second film + social copy + key visual",
            message: currentLocale === "ko"
                ? `${exploreGrounding.messageAngle}을 중심으로 캠페인을 설계합니다.`
                : `Build the campaign around ${exploreGrounding.messageAngle}, not feature lists.`,
            cta: currentLocale === "ko" ? "우리 집 루틴을 더 가볍게" : "Make your home routine feel lighter",
            kpi: currentLocale === "ko" ? "영상 완주율 / 브랜드 선호도 / 공유 의향" : "Video completion / brand preference / sharing intent",
            objective: currentLocale === "ko" ? "기술이 아니라 배려받는 감정을 브랜드 자산으로 만드는 것" : "Turn the feeling of being cared for into a brand asset.",
            headline: currentLocale === "ko" ? "기능은 배경으로 두고, 사용자의 생활 리듬이 실제로 가벼워지는 장면을 전면에 둡니다." : "Keep features in the background and foreground the moment daily rhythm actually gets lighter.",
            proofPoints: [
                currentLocale === "ko" ? "30초 안에 문제-전환-안도감의 흐름이 보여야 함" : "Show the arc of problem, transition, and relief within 30 seconds",
                currentLocale === "ko" ? "현지 시장 정서에 맞는 감정 언어로 조정" : "Adjust the emotional language to the local market context",
                currentLocale === "ko" ? "소셜 짧은 카피에서도 같은 정서를 유지" : "Keep the same emotional tone across short social copy"
            ],
            executionChecklist: [
                currentLocale === "ko" ? "캠페인 메인 카피를 기능명 없이 작성" : "Write the core campaign line without feature jargon",
                currentLocale === "ko" ? "영상 KV와 소셜 카피의 정서를 일치" : "Align the emotional tone of film KV and social copy",
                currentLocale === "ko" ? "공유를 부르는 한 문장 후킹 포인트 설계" : "Design a one-line hook that encourages sharing"
            ],
            roleDetailSections: detailsByRole.brand,
            whatYouGet: buildWhatYouGet("brand", {
                marketName,
                selectedSegment,
                intent,
                deviceDecision,
                roleDetails: detailsByRole.brand,
                exploreGrounding
            })
        }
    };

    const ordered = [outputs[selectedRole.id], ...Object.values(outputs).filter((item) => item.id !== selectedRole.id)];
    return ordered;
}

function buildSuccessMetrics(selectedRole, intent, deviceDecision) {
    const bank = {
        retail: [
            localizeSentence("metricRetail", getCategoryName(deviceDecision.final.category)),
            currentLocale === "ko" ? "매장 시연 후 질문 수 증가와 상담 전환 개선" : "Increase post-demo questions and improve consultation conversion",
            currentLocale === "ko" ? "기기 단품 설명보다 생활 장면 설명의 반응률 상승" : "Raise response to scenario-led selling over feature-only explanation"
        ],
        dotcom: [
            localizeSentence("metricDotcom"),
            currentLocale === "ko" ? "히어로 배너에서 CTA 클릭률 상승" : "Lift CTA click-through from the hero banner",
            currentLocale === "ko" ? "시나리오 기반 FAQ 소비 증가" : "Increase consumption of scenario-led FAQ content"
        ],
        brand: [
            localizeSentence("metricBrand"),
            currentLocale === "ko" ? "브랜드 메시지의 공감도와 기억률 강화" : "Strengthen message resonance and recall",
            currentLocale === "ko" ? "감정 가치 중심 자발적 공유 반응 증가" : "Increase voluntary sharing around emotional value"
        ]
    };
    return bank[selectedRole.id] || [`${intent.missionBucket} 경험 강화 -> 반복 사용 증가`];
}

function buildTargetSegment(country, city, selectedSegment, intent, exploreGrounding) {
    return [
        localizeSentence("segment1", city ? `${getCountryName(country.countryCode)} / ${city}` : getCountryName(country.countryCode)),
        localizeSentence("segment2", `${selectedSegment} / ${intent.missionBucket}`),
        localizeSentence("segment3"),
        currentLocale === "ko"
            ? `"${intent.purpose}" 같은 상황에 자주 놓이는 사용자에게 우선 적용하기 좋습니다.`
            : `Best applied first to users who often face situations like "${intent.purpose}".`,
        currentLocale === "ko"
            ? "가처분 소득 프록시: 연결형 가전과 앱 사용에 추가 비용과 편익을 모두 검토할 가능성이 높은 중간 이상 구매력 가구"
            : "Disposable-income proxy: mid-to-upper purchasing-power households likely to weigh both the added cost and value of connected appliances",
        currentLocale === "ko"
            ? `대표성 근거: ${exploreGrounding.primaryValue}처럼 결과가 분명한 제안을 선호하는 라이프스타일 세그먼트`
            : `Representative rationale: a lifestyle segment that prefers offers with clear outcomes such as ${exploreGrounding.primaryValue}`
    ];
}

function buildSetupGuide(deviceDecision, services, selectedRole) {
    const roleName = getRoleTitle(selectedRole.id);
    const deviceName = deviceDecision.final.modelName;
    const serviceName = getServiceLabel(services[0]);
    return currentLocale === "ko"
        ? [
            `시작 전 준비: ${deviceName} 전원 켜기, SmartThings 앱 설치, 삼성 계정 로그인 완료`,
            `기기 연결: 앱에서 '+' → '기기 추가' → ${deviceName}을 선택하고 화면 안내를 따릅니다.`,
            `서비스 활성화: '자동화' 탭에서 ${serviceName}을 활성화하고 원하는 조건을 설정합니다.`,
            "첫 성공 확인: 설정한 자동화가 1회 이상 정상 동작하는지 확인합니다.",
            "알림 및 공유: 알림 설정을 켜고, 필요하면 가족 구성원을 초대합니다.",
            `${roleName} 담당자는 첫 배포 시 가장 반응이 좋은 문구와 CTA를 함께 기록합니다.`
        ]
        : [
            `Preparation: Power on ${deviceName}, install SmartThings, sign in.`,
            `Connect: In the app, tap '+' → 'Add device' → select ${deviceName} and follow instructions.`,
            `Activate: In 'Automations', enable ${serviceName} and set conditions.`,
            "Verify: Confirm the automation runs at least once.",
            "Notify & share: Enable alerts and invite family members.",
            `${roleName} owners should log the best-performing message and CTA from the first rollout.`
        ];
}

function buildMarketability(country, intent, deviceDecision, services, selectedRole, selectedSegment, exploreGrounding) {
    const go = intent.lifestyleTags.length > 0 && Boolean(deviceDecision.final);
    const rawRisk = String(services?.[0]?.privacyPolicy || "").trim();
    const hasHangul = /[가-힣]/.test(rawRisk);
    const conciseSegment = compactDescriptor(selectedSegment, 4) || (currentLocale === "ko" ? "상황 기반 타겟" : "context-led target");
    const concisePurpose = compactPurpose(intent.purpose);
    return {
        verdict: go ? "Go" : "No-Go",
        rationale: go
            ? (currentLocale === "ko"
                ? `${getCountryName(country.countryCode)}에서 ${conciseSegment}의 "${concisePurpose}" 상황은 ${exploreGrounding.primaryValue} 가치가 명확하게 읽히는 장면이라 Go 판단이 가능합니다.`
                : `In ${getCountryName(country.countryCode)}, the "${concisePurpose}" moment for the ${conciseSegment} segment makes ${exploreGrounding.primaryValue} legible enough for a Go decision.`)
            : localizeSentence("marketNoGo"),
        competitorView: currentLocale === "ko"
            ? `차별점은 기능 수가 아니라 ${exploreGrounding.functionalJob}을 한 번의 연결 경험으로 줄여준다는 점입니다.`
            : `The differentiation is not feature count but reducing ${exploreGrounding.functionalJob} into one connected experience.`,
        risk: currentLocale === "ko"
            ? rawRisk
            : (hasHangul
                ? "Energy and behavior signals should be used only for clearly explained utility, automation, and report purposes."
                : (rawRisk || "Data usage must stay purpose-limited, transparent, and easy to control.")),
        alternatives: currentLocale === "ko"
            ? [
                "대안 1: 수동 제어 중심의 일반 가전 사용 경험",
                "대안 2: 기기별 개별 앱을 따로 운영하는 단절된 경험",
                "대안 3: 기본 스마트 플러그 수준의 단순 자동화"
            ]
            : [
                "Alternative 1: a manual-control appliance experience",
                "Alternative 2: a fragmented setup with separate apps per device",
                "Alternative 3: basic automation limited to smart-plug logic"
            ],
        nextActions: [
            currentLocale === "ko"
                ? `${conciseSegment} 기준으로 "${concisePurpose}" 맥락의 첫 배포용 한 문장 메시지를 확정합니다.`
                : `Lock a one-line launch message for the ${conciseSegment} segment.`,
            currentLocale === "ko"
                ? `${getRoleTitle(selectedRole.id)} 채널에서 먼저 검증할 핵심 CTA를 1개 정합니다.`
                : `Choose one priority CTA to validate first in the ${getRoleTitle(selectedRole.id)} channel.`,
            currentLocale === "ko"
                ? `${deviceDecision.final.modelName} 가용성과 현지 언어 카피를 함께 점검합니다.`
                : `Check both ${deviceDecision.final.modelName} availability and local-language copy readiness.`
        ]
    };
}

function runChecks(country, intent, deviceDecision, automation) {
    return {
        hard: [
            { name: t("fitCheck"), pass: intent.lifestyleTags.length > 0, detail: localizeSentence("checkFit") },
            { name: t("availabilityCheck"), pass: country.availableProducts.some((p) => p.modelName === deviceDecision.final.modelName), detail: localizeSentence("checkAvailability") }
        ],
        soft: [
            { name: t("executionCheck"), pass: Boolean(automation.actions?.length), detail: localizeSentence("checkExecution") },
            { name: t("clarityCheck"), pass: true, detail: localizeSentence("checkClarity") },
            { name: t("metricCheck"), pass: true, detail: localizeSentence("checkMetric") }
        ]
    };
}

function buildTitle(role, intent, selectedSegment, deviceDecision) {
    const conciseSegment = compactDescriptor(selectedSegment, 4) || (currentLocale === "ko" ? "상황 기반 타겟" : "context-led target");
    if (currentLocale === "ko") {
        return `${getRoleTitle(role.id)} 관점의 ${conciseSegment} 대상 ${getCategoryName(deviceDecision.final.category)} 기반 ${intent.missionBucket} 시나리오`;
    }
    return `${getRoleTitle(role.id)} | ${intent.missionBucket} scenario for ${conciseSegment} built around ${getCategoryName(deviceDecision.final.category)}`;
}

function buildSummary(country, selectedSegment, intent, deviceDecision, services) {
    const conciseSegment = compactDescriptor(selectedSegment, 4) || (currentLocale === "ko" ? "상황 기반 타겟" : "context-led target");
    const regionTag = currentLocale === "ko" ? "지역 특성 반영" : "region-reflective";
    if (currentLocale === "ko") {
        return `${getCountryName(country.countryCode)}에서 ${conciseSegment}에게 ${deviceDecision.final.modelName}와 ${getServiceLabel(services[0])}를 중심으로 ${intent.missionBucket} 가치를 전달하는 ${regionTag} 앱 시나리오입니다.`;
    }
    return `A ${regionTag} app scenario for the ${conciseSegment} segment in ${getCountryName(country.countryCode)}, centered on ${deviceDecision.final.modelName} and ${getServiceLabel(services[0])}, designed to deliver ${intent.missionBucket} value.`;
}

function buildReferenceLinks(intent, services) {
    const refs = [];
    if (intent.missionBucket === "Care") refs.push("care-for-your-familys-needs-even-when-away");
    if (intent.missionBucket === "Save" || intent.lifestyleTags.some((tag) => tag.includes("에너지"))) refs.push("seamlessly-save-energy");
    if (intent.lifestyleTags.some((tag) => tag.includes("반려"))) refs.push("purrfect-pet-care");
    if (refs.length === 0) refs.push("seamlessly-save-energy");
    return refs.slice(0, 3).map((id, index) => ({
        id,
        title: getServiceLabel(services[index]) || (index === 0 ? "Primary Service Anchor" : `Reference ${index + 1}`),
        url: `references/explore_matrix.json#${id}`
    }));
}

function buildSummaryBullets(country, city, selectedSegment, intent, deviceDecision, services, exploreGrounding) {
    const location = city ? `${getCountryName(country.countryCode)} ${city}` : getCountryName(country.countryCode);
    const secondary = services[1] || services[0];
    const conciseSegment = compactDescriptor(selectedSegment, 4);
    const concisePurpose = compactPurpose(intent.purpose);
    const withServices = `${getServiceLabel(services[0])}${secondary.serviceName !== services[0].serviceName ? ` + ${getServiceLabel(secondary)}` : ""}`;
    return [
        currentLocale === "ko" ? `누가: ${location}의 ${conciseSegment}` : `Who: ${conciseSegment} in ${location}`,
        currentLocale === "ko" ? `언제: ${concisePurpose} 같은 상황이 반복되는 일상 구간` : `When: during recurring moments like "${concisePurpose}"`,
        currentLocale === "ko" ? `무엇으로: ${withServices}` : `With: ${withServices}`,
        currentLocale === "ko" ? `어떻게: ${deviceDecision.final.modelName} 중심의 추천 카드와 반복 루틴으로 반복 확인/수동 조작을 줄임` : `How: reduce repeated checking and manual control via recommendation cards and repeat routines anchored on ${deviceDecision.final.modelName}`,
        currentLocale === "ko" ? `결과: ${exploreGrounding.primaryValue}을 더 빠르게 체감` : `Result: make ${exploreGrounding.primaryValue} felt faster`,
        currentLocale === "ko" ? `캠페인 메시지: 기능 나열보다 ${concisePurpose} 순간의 생활 부담 완화를 강조` : `Campaign message: lead with lighter daily burden in ${concisePurpose} moments, not feature count`
    ];
}

function buildTargetCustomerLine(countryName, selectedSegment, purpose) {
    const tokens = `${selectedSegment} / ${purpose}`
        .split(/[\/,|]|·/)
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item, index, array) => array.indexOf(item) === index)
        .slice(0, 5);
    return [countryName, ...tokens].join(" / ");
}

function buildServiceStory(service, intent, selectedSegment, isPetContext) {
    const name = service.serviceName;
    const cardLabel = service.appCardLabel || name;
    const firstFeature = service.keyFeatures?.[0] || name;
    const secondFeature = service.keyFeatures?.[1] || firstFeature;
    const primaryDevice = getCategoryName(service.requiredCategories?.[0] || intent.selectedDevices?.[0] || "");

    const storiesKo = {
        "Pet Care": {
            title: isPetContext ? "[Care] 야근이 길어져 강아지가 불안할까 걱정될 때" : "[Care] 외출 시간이 길어져 반려동물 케어가 걱정될 때",
            pain: isPetContext ? "잦은 야근으로 혼자 집에 있는 강아지가 줄곧 신경 쓰였던 사용자." : "집을 비우는 시간 동안 반려동물이 불안해할까 계속 마음이 쓰였던 사용자.",
            solution: `SmartThings에서 외출 루틴을 생성하면 ${cardLabel}를 통해 조명 밝기, 실내 분위기, 반려동물이 익숙해하는 소리나 기기 환경을 자동으로 맞출 수 있습니다.`,
            benefit: "버튼 한 번으로, 또는 외출을 감지하면 자동으로 펫을 위한 환경으로 전환되어 손쉬운 케어가 가능하고 보호자의 불안도 줄어듭니다."
        },
        "Family Care": {
            title: "[Care] 가족이나 부모님의 일상이 무사한지 확인하고 싶을 때",
            pain: "바쁜 하루 중에도 가족의 안부를 계속 떠올리게 되어 자주 연락하거나 반복 확인하게 되는 사용자.",
            solution: `${cardLabel}는 ${firstFeature}와 ${secondFeature}를 바탕으로 생활 패턴을 확인하고, 필요할 때만 안심 체크인이나 알림을 전달할 수 있습니다.`,
            benefit: "매번 먼저 연락하거나 확인하지 않아도 필요한 순간만 파악할 수 있어 돌봄의 부담은 줄고 안심은 더 선명해집니다."
        },
        "SmartThings Energy": {
            title: "[Energy] 전기요금과 대기전력이 신경 쓰일 때",
            pain: "밖에 있는 동안 전기 요금이 걱정되어 외출 전 기기를 하나씩 꺼야 했던 사용자.",
            solution: `${cardLabel}로 피크 시간대에는 사용이나 충전을 제한하고, 일간 및 월별 사용량을 모니터링해 불필요한 전력 소비를 줄일 수 있습니다.`,
            benefit: "외출 중 대기전력과 불필요한 사용을 줄여 비용 부담을 덜고, 절감 효과를 앱에서 눈으로 확인할 수 있습니다."
        },
        "Samsung Health": {
            title: "[Health] 컨디션과 생활 리듬을 더 안정적으로 맞추고 싶을 때",
            pain: `${selectedSegment} 사용자는 바쁜 일정이 이어질수록 수면과 활동 리듬이 쉽게 무너지고 회복 타이밍도 놓치기 쉽습니다.`,
            solution: `${cardLabel}는 ${firstFeature}를 기반으로 조명, 스피커, ${primaryDevice || "TV"} 같은 연결 기기를 현재 컨디션에 맞는 루틴으로 이어줍니다.`,
            benefit: "건강 데이터를 따로 해석하지 않아도 집 안 환경이 생활 리듬 회복을 돕기 때문에 하루를 더 안정적으로 운영할 수 있습니다."
        },
        "Samsung Find": {
            title: "[Secure] 외출과 귀가 흐름을 더 안심하고 연결하고 싶을 때",
            pain: "집을 나서거나 돌아오는 순간마다 위치와 상태를 따로 확인해야 해 루틴이 자주 끊기는 사용자.",
            solution: `${cardLabel}는 ${firstFeature}를 활용해 도착과 이탈을 감지하고, 그 신호를 SmartThings 자동화와 연결해 조명이나 홈 상태를 바로 전환할 수 있습니다.`,
            benefit: "분실이나 위치 확인에만 머무르지 않고 생활 자동화까지 자연스럽게 연결되어 외출과 귀가 루틴이 훨씬 가벼워집니다."
        },
        "Home Monitoring": {
            title: "[Secure] 잦은 부재로 댁내 보안이 불안할 때",
            pain: "바쁜 일상 속에서 매번 스마트폰으로 집안을 모니터링하는 것은 번거롭고 어렵습니다.",
            solution: `${cardLabel}과 연동된 카메라 및 센서는 수상한 소리와 움직임을 상시 감지하고, 이상 활동이 있으면 자동 녹화와 실시간 알림을 보냅니다.`,
            benefit: "계속 신경 쓰고 있지 않아도 되니 안심할 수 있고, 이상 상황은 실시간으로 알려주니 빠른 대처로 더 큰 위험을 막을 수 있습니다."
        },
        "Home Care": {
            title: "[Ease] 집안일 관리와 기기 케어를 놓치고 싶지 않을 때",
            pain: "청소와 소모품 교체, 기기 관리 시점을 자꾸 놓쳐 집안일이 한꺼번에 몰리는 사용자.",
            solution: `${cardLabel}는 ${firstFeature}와 관리 리마인더를 기반으로 필요한 시점에만 청소나 유지관리 액션을 제안합니다.`,
            benefit: "해야 할 일을 모두 기억하지 않아도 앱이 우선순위를 정리해 주기 때문에 집 관리 스트레스가 눈에 띄게 줄어듭니다."
        },
        "Air Care": {
            title: "[Comfort] 집 안 공기와 쾌적함을 자동으로 맞추고 싶을 때",
            pain: "환기나 냉난방을 그때그때 수동으로 조절해야 해서 실내 환경이 들쭉날쭉했던 사용자.",
            solution: `${cardLabel}는 ${firstFeature}와 재실 상태를 바탕으로 에어컨이나 관련 기기를 조정해 집 안 컨디션을 자동으로 맞춥니다.`,
            benefit: "쾌적함과 절감 사이를 일일이 조절하지 않아도 되어 집에 머무는 시간의 만족도가 높아집니다."
        },
        "Clothing Care": {
            title: "[Ease] 야근 후에도 세탁과 의류 관리를 놓치고 싶지 않을 때",
            pain: "늦게 귀가하는 날이 많아 세탁과 건조 상태를 제때 확인하지 못하고 번거로움이 쌓였던 사용자.",
            solution: `${cardLabel}는 ${firstFeature}와 완료 알림을 통해 세탁/건조 흐름을 앱에서 이어서 관리할 수 있게 돕습니다.`,
            benefit: "집에 도착해서야 상태를 확인하는 번거로움이 줄고, 세탁 루틴을 더 매끄럽게 이어갈 수 있습니다."
        },
        "Smart Cooking": {
            title: "[Ease] 저녁 준비를 더 가볍게 시작하고 싶을 때",
            pain: "퇴근 후 요리를 시작할 때마다 레시피 확인, 예열, 재료 정리까지 한꺼번에 신경 써야 했던 사용자.",
            solution: `${cardLabel}는 ${firstFeature}와 ${secondFeature}를 연결해 조리 준비 단계를 줄이고 주방 기기 제어를 더 빠르게 시작하게 돕습니다.`,
            benefit: "식사 준비의 진입 장벽이 낮아져 바쁜 평일 저녁에도 요리를 덜 부담스럽게 이어갈 수 있습니다."
        },
        "Home Fitness": {
            title: "[Health] 집에서도 운동 루틴을 꾸준히 이어가고 싶을 때",
            pain: "운동을 시작하려고 해도 준비 과정이 번거로워 쉽게 미루게 되는 사용자.",
            solution: `${cardLabel}는 ${firstFeature}를 중심으로 TV나 스피커 같은 기기와 연결해 운동 시작 장면을 더 간단하게 만들어 줍니다.`,
            benefit: "운동을 결심한 순간 바로 실행할 수 있어 루틴 유지가 쉬워지고, 집에서도 꾸준한 자기관리가 가능해집니다."
        }
    };

    const storiesEn = {
        "Pet Care": {
            title: isPetContext ? "[Care] When you worry your dog may feel anxious during overtime" : "[Care] When you worry about pet care during long hours away",
            pain: isPetContext ? "Frequent overtime made users worry about their dog staying home alone." : "Users kept worrying that pets might feel anxious while the home is empty.",
            solution: `By creating an away routine in SmartThings, ${cardLabel} can automatically tune lighting, indoor atmosphere, and familiar device context for pets.`,
            benefit: "With one tap, or automatically when away is detected, the home shifts into a pet-care mode and reduces caregiver anxiety."
        },
        "Family Care": {
            title: "[Care] When you want to make sure family members are okay",
            pain: "Even during busy days, users repeatedly checked in and felt ongoing concern about family wellbeing.",
            solution: `${cardLabel} uses ${firstFeature} and ${secondFeature} to monitor routine signals and trigger reassurance check-ins only when needed.`,
            benefit: "You no longer need constant manual check-ins, and can focus on the moments that actually need attention."
        },
        "SmartThings Energy": {
            title: "[Energy] When utility bills and standby power are a concern",
            pain: "Users had to manually turn off devices before leaving home because they worried about energy costs.",
            solution: `With ${cardLabel}, you can limit usage or charging during peak periods and monitor daily/monthly usage to reduce waste.`,
            benefit: "It lowers cost pressure by reducing standby and unnecessary usage, and savings become visible in the app."
        },
        "Samsung Health": {
            title: "[Health] When you want a more stable daily rhythm",
            pain: `${selectedSegment} users often lose sleep/activity rhythm during busy periods and miss recovery timing.`,
            solution: `${cardLabel} uses ${firstFeature} to connect lights, speakers, and devices like ${primaryDevice || "TV"} into condition-aware routines.`,
            benefit: "Without manually interpreting health data, home context supports recovery and makes daily operations steadier."
        },
        "Samsung Find": {
            title: "[Secure] When you want smoother and safer out/in-home transitions",
            pain: "Users had to repeatedly check location and home status when leaving and returning, breaking daily flow.",
            solution: `${cardLabel} uses ${firstFeature} to detect arrival/departure and trigger SmartThings automations like lighting and home-state shifts.`,
            benefit: "It goes beyond location checks and naturally links into home automation, making transition routines lighter."
        },
        "Home Monitoring": {
            title: "[Secure] When frequent absence makes home security uncertain",
            pain: "Constant manual monitoring through the phone felt burdensome in a busy routine.",
            solution: `${cardLabel} with connected cameras/sensors detects suspicious sound or movement and sends real-time alerts with auto-recording.`,
            benefit: "You can stay reassured without constant attention and respond quickly when risk signals appear."
        },
        "Home Care": {
            title: "[Ease] When you don't want to miss home chores and device care timing",
            pain: "Users often missed cleaning, consumable replacement, and maintenance timing, then tasks piled up at once.",
            solution: `${cardLabel} uses ${firstFeature} and care reminders to suggest maintenance actions only when timing is right.`,
            benefit: "The app prioritizes what to do next, reducing home-management stress without keeping everything in mind."
        },
        "Air Care": {
            title: "[Comfort] When you want indoor comfort to adjust automatically",
            pain: "Users had to control ventilation or cooling/heating manually each time, causing uneven indoor comfort.",
            solution: `${cardLabel} uses ${firstFeature} and occupancy status to adjust AC and related devices automatically.`,
            benefit: "You no longer need constant trade-offs between comfort and savings, improving time-at-home satisfaction."
        },
        "Clothing Care": {
            title: "[Ease] When you don't want to lose laundry flow after late workdays",
            pain: "Late returns made it hard to check wash/dry status on time, causing repeated inconvenience.",
            solution: `${cardLabel} uses ${firstFeature} and completion alerts so users can continue laundry flow from the app.`,
            benefit: "It removes status-check friction at arrival time and keeps laundry routines smoother."
        },
        "Smart Cooking": {
            title: "[Ease] When you want to start dinner prep with less effort",
            pain: "After work, users had to handle recipes, preheating, and ingredient prep all at once.",
            solution: `${cardLabel} connects ${firstFeature} and ${secondFeature} to reduce prep steps and start kitchen control faster.`,
            benefit: "Lower setup friction makes weekday dinner prep easier to sustain."
        },
        "Home Fitness": {
            title: "[Health] When you want to keep exercise routines at home",
            pain: "Users postponed exercise because preparation felt cumbersome.",
            solution: `${cardLabel} centers on ${firstFeature} and links devices like TV/speakers to simplify exercise start moments.`,
            benefit: "You can act right at decision time, making routine consistency easier at home."
        }
    };

    const stories = currentLocale === "ko" ? storiesKo : storiesEn;
    return stories[name] || {
        title: currentLocale === "ko" ? `[${service.valueTags?.[0] || "Life"}] ${name}가 필요한 순간` : `[${service.valueTags?.[0] || "Life"}] When ${name} is needed`,
        pain: currentLocale === "ko"
            ? `${selectedSegment} 사용자는 ${intent.purpose} 같은 상황에서 반복 확인과 수동 조작의 부담을 자주 느낍니다.`
            : `${selectedSegment} users often feel burdened by repeated checking and manual control in moments like "${intent.purpose}".`,
        solution: currentLocale === "ko"
            ? `${cardLabel}는 ${firstFeature}와 ${secondFeature}를 바탕으로 연결 기기를 더 간단한 루틴으로 묶어 줍니다.`
            : `${cardLabel} uses ${firstFeature} and ${secondFeature} to connect devices into a simpler routine flow.`,
        benefit: currentLocale === "ko"
            ? "필요한 장면을 더 적은 조작으로 실행할 수 있어 일상이 훨씬 가벼워집니다."
            : "The same moment can be executed with fewer actions, making daily routines noticeably lighter."
    };
}

function getVerbalGuidelineData() {
    return verbalGuideline || {
        voice: "Confident Explorer",
        identity: ["bold", "authentic", "modern", "playful", "premium"],
        guardrails: [
            "Lead with outcome before features.",
            "Keep the tone premium and clear.",
            "Prefer AI Home in user-facing copy unless the official service name is required."
        ]
    };
}

function applyUserFacingTerminology(text) {
    return String(text || "").replace(/\bSmartThings\b/g, "AI Home");
}

function enforceOutcomeFirst(text) {
    const cleaned = String(text || "").trim();
    if (!cleaned) return cleaned;
    if (/^(less |feel |make |turn |bring |give |keep |reduce |start |see )/i.test(cleaned)) return cleaned;
    if (currentLocale === "ko") {
        return cleaned.includes("먼저") ? cleaned : `${cleaned} 이 장면에서 먼저 체감되는 결과부터 말합니다.`;
    }
    return `Feel the result first. ${cleaned}`;
}

function applyVerbalGuidelines(text, options = {}) {
    const guideline = getVerbalGuidelineData();
    let output = String(text || "").trim();
    if (!output) return output;

    if (options.userFacing !== false) {
        const prefersAiHome = (guideline.guardrails || []).some((rule) => /AI Home|AI Living/i.test(rule));
        if (prefersAiHome) {
            output = applyUserFacingTerminology(output);
        }
    }

    if (options.outcomeFirst !== false) {
        output = enforceOutcomeFirst(output);
    }

    output = output.replace(/\s+/g, " ").trim();
    if (options.maxLength && output.length > options.maxLength) {
        output = `${output.slice(0, options.maxLength - 1).trim()}…`;
    }
    return output;
}

function flattenMarketingMessages(marketingMessages) {
    const lenses = marketingMessages?.lenses || {};
    return [
        lenses.retail?.hookEn,
        lenses.retail?.shortCopyKo,
        lenses.dotcom?.h1En,
        lenses.dotcom?.subCopyKo,
        lenses.brand?.campaignConceptEn,
        lenses.brand?.emotionalNarrativeKo,
        lenses.brand?.brandValue
    ].filter(Boolean);
}

function deviceDecisionText(deviceDecision) {
    return `${getCategoryName(deviceDecision.final.category)} / ${deviceDecision.final.modelName}`;
}

function buildMarketingMessages(role, selectedSegment, intent, services, exploreGrounding, deviceDecision) {
    const guideline = getVerbalGuidelineData();
    const anchorService = getServiceLabel(services[0]);
    const selectedLensId = role?.id || "retail";
    const selectedMarket = marketOptions.find((market) => market.siteCode === countrySelect.value);
    const anchorSkuEvidence = findAnchorSkuEvidence(selectedMarket?.siteCode, deviceDecision);
    const serviceSupport = services[0] ? getServiceSupportEntry(selectedMarket?.siteCode, services[0].serviceName) : null;
    const emotionalNoun = intent.missionBucket === "Save"
        ? "절감의 확신"
        : intent.missionBucket === "Secure"
            ? "안전의 통제감"
            : "돌봄의 안심";
    const proofLine = currentLocale === "ko"
        ? `근거: ${anchorService} / ${deviceDecisionText(deviceDecision)} / ${anchorSkuEvidence.product?.availability?.status || "unverified"} / service ${serviceSupport?.inferredSupport?.status || "unverified"}`
        : `Evidence: ${anchorService} / ${deviceDecisionText(deviceDecision)} / ${anchorSkuEvidence.product?.availability?.status || "unverified"} / service ${serviceSupport?.inferredSupport?.status || "unverified"}`;

    return {
        selectedLensId,
        roleTone: getRoleTitle(selectedLensId),
        guideline,
        voice: guideline.voice,
        confirmedRules: [
            `Voice: ${guideline.voice} / ${(guideline.identity || []).join(", ")}`,
            currentLocale === "ko"
                ? "규칙: 결과를 먼저 말하고 기능은 뒤에서 짧게 보강"
                : "Rule: lead with the outcome, then support it briefly with features.",
            currentLocale === "ko"
                ? "규칙: 공식 서비스명 외에는 AI Home 표현을 우선"
                : "Rule: prefer AI Home wording unless an official service name is required.",
            currentLocale === "ko"
                ? "규칙: 03의 확정/추론/구매 상태와 충돌하지 않는 문구만 사용"
                : "Rule: keep copy aligned with the confirmed/inferred/purchase states in block 03."
        ],
        globalLocalSplit: {
            global: applyVerbalGuidelines(exploreGrounding.coreMessage, { maxLength: 110 }),
            local: currentLocale === "ko"
                ? applyVerbalGuidelines(`${selectedSegment}의 생활 맥락에 맞게 사례 문장과 감정 어휘를 현지화`, { maxLength: 110 })
                : applyVerbalGuidelines(`Localize examples and emotional wording to the daily context of ${selectedSegment}.`, { maxLength: 110 })
        },
        lenses: {
            retail: {
                label: "Retail Lens",
                selected: selectedLensId === "retail",
                hookEn: applyVerbalGuidelines(`Feel ${exploreGrounding.primaryValue} before you learn the setup.`, { maxLength: 90 }),
                shortCopyKo: applyVerbalGuidelines(`${selectedSegment} 고객에게는 기능 설명보다 "${exploreGrounding.messageAngle}"이 먼저 체감되어야 합니다.`, { maxLength: 110 }),
                talkTrackKo: [
                    applyVerbalGuidelines(`처음 10초에는 ${exploreGrounding.coreMessage} 한 문장으로 시작합니다.`, { maxLength: 90 }),
                    applyVerbalGuidelines(`그다음 ${anchorService}가 ${intent.purpose} 순간을 어떻게 줄여주는지 한 번만 보여줍니다.`, { maxLength: 110 }),
                    applyVerbalGuidelines("마지막에는 복잡한 설명 대신 바로 따라 할 수 있는 한 가지 루틴으로 끝냅니다.", { maxLength: 90 })
                ],
                cta: applyVerbalGuidelines(currentLocale === "ko" ? "지금 이 장면을 매장에서 바로 데모해 보세요." : "Demo this moment in-store now.", { maxLength: 70 })
            },
            dotcom: {
                label: "Dotcom Lens",
                selected: selectedLensId === "dotcom",
                h1En: applyVerbalGuidelines(`Less setup. More ${exploreGrounding.primaryValue}.`, { maxLength: 80 }),
                subCopyKo: applyVerbalGuidelines(`${selectedSegment}에게 필요한 것은 기능 나열이 아니라 ${intent.purpose} 순간의 부담을 덜어주는 AI Home 경험입니다.`, { maxLength: 110 }),
                proofPointKo: applyVerbalGuidelines(proofLine, { userFacing: false, outcomeFirst: false, maxLength: 130 }),
                cta: applyVerbalGuidelines(currentLocale === "ko" ? "PDP 첫 화면에서 이 메시지로 진입시키세요." : "Use this as the PDP opening line.", { maxLength: 70 })
            },
            brand: {
                label: "Brand Lens",
                selected: selectedLensId === "brand",
                campaignConceptEn: applyVerbalGuidelines("AI Home, with a more human rhythm.", { maxLength: 70 }),
                emotionalNarrativeKo: applyVerbalGuidelines(`${intent.purpose} 순간에 기술이 앞서는 대신 사람이 먼저 안심하게 만드는 것, 그것이 이번 메시지의 중심입니다. ${selectedSegment}의 하루를 더 가볍게 만들며 ${emotionalNoun}을 남기도록 설계합니다.`, { maxLength: 130 }),
                brandValue: currentLocale === "ko"
                    ? "사람 중심의 배려, 절제된 프리미엄, 연결된 일상 효용"
                    : "Human-first care, restrained premium, connected daily utility",
                cta: applyVerbalGuidelines(currentLocale === "ko" ? "글로벌 메시지는 유지하고 현지 장면만 더 구체화하세요." : "Keep the global message and localize only the scene.", { maxLength: 80 })
            }
        }
    };
}

function buildBenefits(intent, services, exploreGrounding) {
    return [
        currentLocale === "ko" ? `기능적 가치: ${exploreGrounding.functionalJob}을 줄여 반복 확인과 수동 조작을 덜어줍니다.` : `Functional value: reduce ${exploreGrounding.functionalJob} and lighten repeated checking.`,
        currentLocale === "ko" ? `감정적 가치: ${exploreGrounding.emotionalJob}이 가능해져 심리적 부담이 낮아집니다.` : `Emotional value: enable ${exploreGrounding.emotionalJob} and lower emotional burden.`,
        currentLocale === "ko" ? `감성적 체감: ${exploreGrounding.primaryValue}이 한 번의 사용 장면에서도 바로 읽히도록 설계됩니다.` : `Emotional experience: make ${exploreGrounding.primaryValue} legible from the first use moment.`
    ];
}

function buildSegmentAnalysis(country, city, selectedSegment, intent, exploreGrounding) {
    const countryName = getCountryName(country.countryCode);
    const locationLabel = city ? `${city}, ${countryName}` : countryName;
    return {
        core: currentLocale === "ko" ? `${selectedSegment} / ${locationLabel} 생활권` : `${selectedSegment} / ${locationLabel}`,
        populationEstimate: currentLocale === "ko"
            ? `추정 규모: ${locationLabel} 기준 해당 세그먼트 약 [AI가 공공 통계 기반으로 추정]명, 전체 인구 대비 약 [비율]% (통계 출처가 없는 경우 추론 근거를 병기)`
            : `Estimated size: approximately [AI estimates from public statistics] in ${locationLabel}, roughly [ratio]% of total population`,
        behaviors: [
            currentLocale === "ko" ? `${exploreGrounding.functionalJob}을 줄여주는 요약형 UX에 반응할 가능성이 큽니다.` : `Likely to respond well to UX that reduces ${exploreGrounding.functionalJob}.`,
            currentLocale === "ko" ? `${exploreGrounding.primaryValue}처럼 결과가 선명한 메시지에 더 크게 반응합니다.` : `Responds more strongly to messages where outcomes like ${exploreGrounding.primaryValue} are clear.`
        ],
        assumption: currentLocale === "ko" ? `가정: 모든 기기를 보유하지 않아도 Entry 수준의 앱 기반 자동화로 ${exploreGrounding.primaryValue} 경험을 먼저 시작할 수 있습니다.` : `Assumption: even without every device, an entry-level app automation can start the ${exploreGrounding.primaryValue} experience.`
    };
}

function buildCampaignTiming(intent, exploreGrounding) {
    const byMission = {
        Save: [
            currentLocale === "ko" ? `냉난방 부담이 커지는 시즌: ${exploreGrounding.primaryValue} 메시지가 가장 선명해집니다.` : `High heating or cooling seasons: ${exploreGrounding.primaryValue} becomes most legible.`,
            currentLocale === "ko" ? "월간 요금이 체감되는 시점: 에너지 리포트와 루틴 메시지의 설득력이 높아집니다." : "When bills become visible: energy reports and routine messaging gain traction.",
            currentLocale === "ko" ? "이사 또는 새 기기 설치 직후: 절감 루틴을 시작하기 가장 좋은 타이밍입니다." : "Right after moving or adding devices: a strong moment to start savings routines."
        ],
        Care: [
            currentLocale === "ko" ? `야근이나 외출이 잦아지는 시기: ${exploreGrounding.emotionalJob} 메시지가 더 크게 작동합니다.` : `When overtime and time away rise: ${exploreGrounding.emotionalJob} becomes more resonant.`,
            currentLocale === "ko" ? "돌봄 부담이 커지는 생활 전환기: 케어와 안심 메시지의 필요성이 높아집니다." : "During care-heavy life transitions: care and reassurance messaging gains relevance.",
            currentLocale === "ko" ? "앱 첫 진입 직후: 한 번의 안심 경험을 빠르게 보여주기 좋습니다." : "Right after first app entry: a good moment to demonstrate reassurance quickly."
        ],
        Secure: [
            currentLocale === "ko" ? "장기간 부재나 여행 준비 시점: 보안과 실시간 대응 메시지가 강하게 읽힙니다." : "Before travel or longer absence: security and real-time response messages land strongly.",
            currentLocale === "ko" ? "혼자 사는 생활 패턴이 정착된 시점: 상시 모니터링 부담 완화 메시지가 설득력 있습니다." : "Once solo-living routines settle: reducing monitoring burden becomes persuasive.",
            currentLocale === "ko" ? "센서/카메라 설치 직후: 보호 체감 가치를 가장 직접적으로 보여줄 수 있습니다." : "Right after adding sensors or cameras: the protective value is easiest to demonstrate."
        ]
    };
    return byMission[intent.missionBucket] || [
        currentLocale === "ko" ? `루틴이 바뀌는 시기: ${exploreGrounding.primaryValue} 메시지가 새롭게 읽힙니다.` : `When routines change: ${exploreGrounding.primaryValue} can be freshly understood.`,
        currentLocale === "ko" ? "신규 기기 추가 직후: 연결 가치가 가장 직관적으로 체감됩니다." : "Right after adding a device: connected value feels most intuitive.",
        currentLocale === "ko" ? "반복 사용이 생기기 시작하는 시점: 메시지를 습관화 가치로 확장하기 좋습니다." : "Once repeat use begins: a good time to extend the message into habit value."
    ];
}

function buildDeviceGuide(country, deviceDecision, services) {
    const countryName = getCountryName(country.countryCode);
    const serviceName = getServiceLabel(services[0]);
    return {
        available: [
            currentLocale === "ko" ? `[확정] ${countryName} 기준 활용 가능 카테고리와 연결 시나리오를 우선 반영합니다.` : `[Confirmed] Prioritize categories and connected scenarios available in ${countryName}.`,
            currentLocale === "ko" ? `대표 기준 기기: ${deviceDecision.final.modelName}` : `Representative anchor device: ${deviceDecision.final.modelName}`,
            currentLocale === "ko" ? "[체크 포인트] 실제 판매 모델/SKU는 시점에 따라 변동될 수 있어 최종 확인이 필요합니다." : "[Check point] Final retail model and SKU availability should be confirmed at launch."
        ],
        preparation: currentLocale === "ko"
            ? [
                "Wi-Fi 환경 확인: 2.4GHz Wi-Fi가 안정적으로 연결되어 있는지 확인합니다 (5GHz만 지원하는 공유기는 설정 필요).",
                "삼성 계정 준비: account.samsung.com에서 계정이 없으면 먼저 생성합니다.",
                "SmartThings 앱 설치: Galaxy Store 또는 App Store에서 'SmartThings'를 검색해 설치합니다.",
                "기기 전원: 연결할 기기의 전원을 켜고 초기 설정(공장 초기화)이 완료된 상태여야 합니다."
            ]
            : [
                "Wi-Fi check: Ensure a stable 2.4GHz Wi-Fi connection is available.",
                "Samsung account: Create one at account.samsung.com if you don't have one.",
                "SmartThings app: Install from Galaxy Store or App Store.",
                "Device power: Turn on the device and complete its initial factory setup."
            ],
        steps: currentLocale === "ko"
            ? [
                "1단계: SmartThings 앱을 열고 삼성 계정으로 로그인합니다.",
                "2단계: 하단의 '+' 버튼 → '기기 추가'를 눌러 새 기기를 검색합니다.",
                `3단계: '집(Home)'이 없으면 자동으로 생성됩니다. 방 이름(거실, 침실 등)을 지정해 기기를 배치합니다.`,
                `4단계: 화면 안내에 따라 ${deviceDecision.final.modelName}을 Wi-Fi에 연결합니다. 기기 화면에 인증 코드가 뜨면 앱에 입력합니다.`,
                "5단계: 연결 완료 후 기기 카드가 대시보드에 나타나는지 확인합니다. 제어 버튼을 눌러 정상 동작을 테스트합니다.",
                `6단계: '자동화' 탭 → '+' → '${serviceName}' 또는 추천 루틴 카드를 활성화합니다. 조건(시간, 센서 등)과 동작(기기 켜기/끄기)을 설정합니다.`,
                "7단계: '알림' 설정에서 원하는 알림을 켜고, 가족 구성원을 '멤버 초대'로 추가합니다.",
                "8단계: 2~3일간 자동화가 정상 실행되는지 확인합니다. 문제가 있으면 기기 상세 → '연결 상태'에서 재연결하거나 펌웨어 업데이트를 진행합니다.",
                "9단계: 자주 쓰는 장면(루틴)을 저장해 반복 사용하고, 추가 기기를 연결해 확장합니다."
            ]
            : [
                "Step 1: Open SmartThings and sign in with your Samsung account.",
                "Step 2: Tap '+' → 'Add device' to search for a new device.",
                "Step 3: Create a Home if one doesn't exist. Assign rooms (living room, bedroom, etc.).",
                `Step 4: Follow on-screen instructions to connect ${deviceDecision.final.modelName} to Wi-Fi.`,
                "Step 5: Verify the device card appears on the dashboard. Test basic controls.",
                `Step 6: Go to 'Automations' → '+' → activate '${serviceName}' or a recommended routine.`,
                "Step 7: Enable notifications and invite family members.",
                "Step 8: Monitor for 2-3 days. Reconnect or update firmware if issues arise.",
                "Step 9: Save frequently used scenes and expand with additional devices."
            ],
        troubleshooting: currentLocale === "ko"
            ? [
                "기기가 검색되지 않을 때: 기기를 공장 초기화하고, 앱과 같은 Wi-Fi에 연결되어 있는지 확인합니다.",
                "연결이 자주 끊길 때: 공유기와 기기 사이 거리를 확인하고, 펌웨어를 최신으로 업데이트합니다.",
                "자동화가 실행되지 않을 때: 조건(시간, 위치)이 올바른지, 기기가 온라인 상태인지 확인합니다."
            ]
            : [
                "Device not found: Factory reset the device and check it's on the same Wi-Fi.",
                "Frequent disconnection: Check distance to router and update firmware.",
                "Automation not running: Verify trigger conditions and device online status."
            ]
    };
}

function renderScenario(payload) {
    // selectionSummary가 있으면 구조화된 fallback output 시도
    if (latestSelectionSummary && typeof buildFallbackOutput === "function") {
        try {
            const fallbackOutput = buildFallbackOutput(latestSelectionSummary, payload);
            renderStructuredOutput(fallbackOutput, {
                role: payload.scenarioMeta?.role || "",
                provider: "none",
                selectionSummary: latestSelectionSummary
            });
            return;
        } catch (e) {
            console.warn("Fallback structured output failed, using legacy render:", e);
        }
    }

    // Legacy fallback
    const selCard = latestSelectionSummary
        ? renderExploreSelectionCard(latestSelectionSummary)
        : "";
    resultDiv.innerHTML = `
        <article class="scenario-output">
            ${selCard}
            <section id="tab-panel-overview" class="tab-panel active">
                ${renderOverview(payload)}
            </section>
        </article>
    `;

    bindPostOutputPrompt(payload);
    bindSourceTags(resultDiv);
    scrollToResult();
}

function renderOutputPreview() {
    const isKo = currentLocale === "ko";
    const title = t("previewTitle");

    const flowSteps = isKo ? [
        { phase: "STEP 1", label: "Explore 시나리오 자동 선별", icon: "✦",
          desc: "입력한 국가/도시 + 타겟 + 기기 조건으로 Explore Contents에서 <strong>검증된 시나리오</strong>를 자동 매칭합니다.",
          helper: "Build 클릭 시 Explore v1.0(183개) + v2.0(87개) 시나리오를 점수화하여 상위 5개를 선별합니다. 왜 선택되었는지, 어떤 입력이 반영되었는지가 함께 표시됩니다.\n입력한 국가/도시의 도시 프로필 고려사항이 시나리오 추천에 반영됩니다.",
          items: [
              { num: "A", title: "선택 근거 카드", sub: "어떤 시나리오가, 왜 선택되었는지" },
              { num: "B", title: "입력 반영 확인", sub: "내 입력이 어디에 반영되었는지 한눈에" },
              { num: "C", title: "가치 축 표시", sub: "Care / Secure / Save / Play 중 어떤 가치인지" }
          ] },
        { phase: "STEP 2", label: "목적별 변형 결과물 생성", icon: "🤖",
          desc: "선택된 Explore 시나리오를 바탕으로, AI가 <strong>마케터용</strong>과 <strong>일반 사용자용</strong> 두 가지 실행형 결과물을 생성합니다.",
          items: [
              { num: "📢", title: "마케터용", sub: "카피 옵션, 채널 전략, 타깃 적합도, 역할별 실행 방향" },
              { num: "🏠", title: "일반 사용자용", sub: "이게 뭘 해주는지, 필요 기기, 설정 방법, 주의사항, 대안" },
              { num: "📊", title: "가치 + 인사이트", sub: "강조 가치, 지역 인사이트(O-I-I), 확정/추론 구분" }
          ],
          helper: "같은 Explore 시나리오를 바탕으로 하되, 활용 목적에 따라 표현과 정보 구조가 다르게 나옵니다. 탭으로 전환하여 확인할 수 있습니다." },
        { phase: "STEP 3", label: "직무별 활용 결과물 선택", icon: "📋",
          desc: "캠페인 메시지, 리테일 현장안, 닷컴 콘텐츠, CRM 활용안, 시즌 연계안, 보고용 요약 중 필요한 것만 골라 추가 생성합니다.",
          outputCards: [
              { icon: "📣", label: "캠페인 메시지" },
              { icon: "🏬", label: "리테일 현장안" },
              { icon: "🌐", label: "닷컴 콘텐츠" },
              { icon: "📧", label: "CRM 활용안" },
              { icon: "📅", label: "시즌 연계안" },
              { icon: "📊", label: "보고용 요약" }
          ],
          helper: "필요한 결과물만 골라 추가 생성할 수 있습니다. 복수 선택 가능!",
          note: "직무를 미리 고르지 않아도 됩니다" }
    ] : [
        { phase: "STEP 1", label: "Auto-select from Explore scenarios", icon: "✦",
          desc: "Automatically match <strong>verified scenarios</strong> from Explore Contents based on your country, target, and device selections.",
          helper: "On Build, scenarios from Explore v1.0 (183) + v2.0 (87) are scored and top 5 are selected. You'll see why each was chosen and which inputs were reflected.\nCity profile insights for your selected country/city are factored into scenario recommendations.",
          items: [
              { num: "A", title: "Selection Basis", sub: "Which scenario was chosen and why" },
              { num: "B", title: "Input Reflection", sub: "See exactly where your inputs are reflected" },
              { num: "C", title: "Value Axis", sub: "Care / Secure / Save / Play identification" }
          ] },
        { phase: "STEP 2", label: "Purpose-driven transformation", icon: "🤖",
          desc: "Based on the selected Explore scenario, AI generates two actionable outputs: <strong>Marketer</strong> and <strong>Consumer</strong> versions.",
          items: [
              { num: "📢", title: "For Marketers", sub: "Copy options, channel strategy, target fit, role-specific direction" },
              { num: "🏠", title: "For Consumers", sub: "What it does, required devices, setup steps, cautions, alternatives" },
              { num: "📊", title: "Values + Insight", sub: "Value highlights, regional O-I-I insight, confirmed vs inferred" }
          ],
          helper: "Same Explore scenario, different expression and structure depending on purpose. Switch between tabs to view." },
        { phase: "STEP 3", label: "Role-specific output selection", icon: "📋",
          desc: "Choose from campaign messaging, retail execution, dotcom content, CRM, seasonal tie-in, or executive summary — generate only what you need.",
          outputCards: [
              { icon: "📣", label: "Campaign" },
              { icon: "🏬", label: "Retail" },
              { icon: "🌐", label: "Dotcom" },
              { icon: "📧", label: "CRM" },
              { icon: "📅", label: "Seasonal" },
              { icon: "📊", label: "Summary" }
          ],
          helper: "Pick only the outputs you need. Multi-select available!",
          note: "No need to choose a role upfront" }
    ];

    const guideText = isKo
        ? "어떤 결과물이 나오는지 궁금하면 눌러보세요"
        : "Tap to see what outputs you'll get";
    const guideLabel = isKo
        ? "결과물 생성 과정과 형식은 다음 내용을 참조하세요~!"
        : "See how outputs are generated and formatted";

    const flowHtml = flowSteps.map((step, idx) => `
        <div class="preview-flow-step">
            <div class="preview-flow-phase">
                <span class="preview-flow-icon">${step.icon}</span>
                <span class="preview-flow-phase-label">${step.phase}</span>
                <strong class="preview-flow-phase-title">${escapeHtml(step.label)}</strong>
            </div>
            <div class="preview-flow-body">
                <p>${step.desc}</p>
                ${step.helper ? `<p class="preview-flow-helper">${escapeHtml(step.helper).replace(/\n/g, '<br>')}</p>` : ""}
                ${step.items ? `
                    <div class="preview-flow-items">
                        ${step.items.map(item => `
                            <div class="preview-flow-item">
                                <span class="preview-flow-item-num">${item.num}</span>
                                <span class="preview-flow-item-title">${escapeHtml(item.title)}</span>
                                <span class="preview-flow-item-sub">${escapeHtml(item.sub)}</span>
                            </div>
                        `).join("")}
                    </div>
                ` : ""}
                ${step.outputCards ? `
                    <div class="preview-output-cards">
                        ${step.outputCards.map(c => `
                            <div class="preview-output-chip">
                                <span class="preview-output-chip-icon">${c.icon}</span>
                                <span class="preview-output-chip-label">${escapeHtml(c.label)}</span>
                            </div>
                        `).join("")}
                    </div>
                ` : ""}
                ${step.note ? `<p class="preview-flow-note">${escapeHtml(step.note)}</p>` : ""}
            </div>
        </div>
        ${idx < flowSteps.length - 1 ? '<div class="preview-flow-connector"></div>' : ""}
    `).join("");

    resultDiv.innerHTML = `
        <section class="placeholder-preview placeholder-preview--collapsed">
            <button type="button" class="preview-toggle" id="preview-toggle">
                <span class="preview-toggle-icon">📋</span>
                <span class="preview-toggle-text">
                    <strong>${escapeHtml(guideLabel)}</strong>
                    <span>${escapeHtml(guideText)}</span>
                </span>
                <span class="preview-toggle-chevron">▾</span>
            </button>
            <div class="preview-flow preview-flow--hidden" id="preview-flow-body">
                ${flowHtml}
            </div>
        </section>
    `;

    const toggleBtn = document.getElementById("preview-toggle");
    const flowBody = document.getElementById("preview-flow-body");
    if (toggleBtn && flowBody) {
        toggleBtn.addEventListener("click", () => {
            const isOpen = !flowBody.classList.contains("preview-flow--hidden");
            flowBody.classList.toggle("preview-flow--hidden", isOpen);
            toggleBtn.classList.toggle("open", !isOpen);
            const chevron = toggleBtn.querySelector(".preview-toggle-chevron");
            if (chevron) chevron.textContent = isOpen ? "▾" : "▴";
        });
    }
}

function buildParentStory(payload) {
    const who = compactDescriptor(payload.state?.segment || payload.scenarioMeta?.selectedSegment || "", 4);
    const where = [payload.scenarioMeta?.countryName, payload.scenarioMeta?.city].filter(Boolean).join(" / ");
    const need = compactPurpose(payload.scenarioMeta?.purpose || payload.exploreGrounding?.functionalJob || "");
    return currentLocale === "ko"
        ? `${where}의 ${who}는 "${need}" 같은 반복 순간에서 부담을 줄이고, 즉시 체감되는 효용을 원합니다.`
        : `${who} in ${where} seeks immediate, felt utility in recurring moments like "${need}".`;
}

function compactDescriptor(text, maxItems = 4) {
    const cleaned = String(text || "")
        .replace(/Reduce recurring friction in everyday moments for/gi, "")
        .replace(/\s+/g, " ")
        .trim();
    const tokens = cleaned
        .split(/[\/,|]|·/)
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item, idx, arr) => arr.indexOf(item) === idx);
    if (!tokens.length) return cleaned;
    return tokens.slice(0, maxItems).join(" / ");
}

function compactPurpose(text) {
    const raw = String(text || "").trim();
    if (!raw) return currentLocale === "ko" ? "반복되는 일상 불편을 줄이고 싶을 때" : "reducing recurring daily friction";
    if (/^reduce recurring friction in everyday moments for/i.test(raw)) {
        return currentLocale === "ko" ? "반복되는 일상 불편을 줄이는 순간" : "reducing recurring daily friction moments";
    }
    return raw.length > 140 ? `${raw.slice(0, 137)}...` : raw;
}

function buildReflectedValues(payload) {
    const mission = String(payload.scenarioMeta?.missionBucket || "").toLowerCase();
    const primary = String(payload.exploreGrounding?.primaryValue || "").toLowerCase();
    const values = [
        { key: "care", ko: "돌봄/안심", en: "Care/Reassurance", hit: mission === "care" || primary.includes("reassurance") || primary.includes("care") },
        { key: "save", ko: "절감/통제", en: "Savings/Control", hit: mission === "save" || primary.includes("saving") || primary.includes("control") },
        { key: "ease", ko: "편의/효율", en: "Convenience/Efficiency", hit: mission === "discover" || mission === "play" || primary.includes("lighter") || primary.includes("comfort") },
        { key: "secure", ko: "신뢰/보안", en: "Trust/Security", hit: mission === "secure" || primary.includes("security") || primary.includes("response") }
    ];
    return values.map((item) => `${item.hit ? "✓" : "·"} ${currentLocale === "ko" ? item.ko : item.en}`);
}

function buildSixLineSummary(payload) {
    const lines = [
        payload.summaryBullets?.[0] || "",
        payload.summaryBullets?.[1] || "",
        payload.summaryBullets?.[2] || "",
        payload.summaryBullets?.[3] || "",
        payload.exploreGrounding?.proofLine || "",
        payload.marketability?.rationale || ""
    ].filter(Boolean).slice(0, 6);
    while (lines.length < 6) {
        lines.push(currentLocale === "ko" ? "실행 전제와 채널별 메시지를 함께 점검합니다." : "Validate assumptions together with channel-specific messaging.");
    }
    return lines.slice(0, 6);
}

// Explore Contents v2.0 기반 20개 시나리오 (12대 키워드 전체 커버)
const EXPLORE_SCENARIOS = [
    // ── SAVE ENERGY ──────────────────────────────────────────────
    {
        id: "save-energy-tips",
        title: "Tips for saving energy at home",
        tags: ["Save energy", "에너지 절약", "Keep your home safe"],
        devices: ["에어컨", "세탁기", "건조기", "스마트 플러그"],
        missionBucket: "Save",
        content: {
            ko: {
                pain: "전기요금 누진세와 대기전력 낭비가 걱정되지만, 외출할 때마다 기기를 하나씩 끄는 것이 번거롭고 자꾸 놓칩니다.",
                solution: "SmartThings AI Energy Mode를 켜면 월간 목표 요금에 맞춰 가전의 에너지 소비를 자동 최적화합니다. 집을 비웠을 때 켜진 기기를 감지해 '모두 끄기' 한 번으로 전력을 차단할 수 있습니다.",
                benefit: "불필요한 에너지 낭비를 줄여 전기요금을 절감하고, 스마트 플러그로 대기전력까지 차단해 친환경 생활이 가능해집니다."
            },
            en: {
                pain: "Worrying about electricity bill surcharges and standby power waste, but finding it tedious to turn off every device before leaving home.",
                solution: "SmartThings AI Energy Mode automatically optimizes appliance energy use against your monthly goal. When away, it detects devices left on and lets you cut them all with one tap.",
                benefit: "Reduces energy waste and electricity costs, with smart plugs cutting standby power for a genuinely eco-friendly lifestyle."
            }
        }
    },
    {
        id: "seamlessly-save-energy",
        title: "Seamlessly save energy",
        tags: ["Save energy", "에너지 절약", "Control lights", "Easily control your lights"],
        devices: ["냉장고", "에어컨", "세탁기", "건조기", "조명"],
        missionBucket: "Save",
        content: {
            ko: {
                pain: "사용자가 인지하지 못하는 사이 새어나가는 전력과 복잡한 절전 설정의 번거로움이 쌓입니다.",
                solution: "가전제품이 스스로 에너지 사용량을 모니터링하고 피크 시간대를 피해 AI 절약 알고리즘으로 작동합니다. 세탁기는 물 온도를 낮추고, TV는 주변 조도에 맞춰 밝기를 자동 조절합니다.",
                benefit: "별도의 신경을 쓰지 않아도 매달 고지서에서 실질적인 비용 절감 효과를 체감하게 됩니다."
            },
            en: {
                pain: "Wasted energy that goes unnoticed, and the complexity of manually managing power-saving settings across multiple devices.",
                solution: "Appliances monitor their own energy use and run optimal AI saving algorithms, avoiding peak hours. The washer lowers water temperature, the TV auto-adjusts brightness to ambient light.",
                benefit: "Delivers tangible cost savings on monthly bills without requiring constant attention from users."
            }
        }
    },
    {
        id: "eco-friendly-laundry",
        title: "Eco-friendly laundry",
        tags: ["Save energy", "에너지 절약", "Help with chores"],
        devices: ["세탁기", "건조기", "세탁기/건조기"],
        missionBucket: "Save",
        content: {
            ko: {
                pain: "매일 달라지는 세탁물 종류와 양에 맞춰 최적 코스를 고르는 것이 번거롭고, 옷감 손상이나 에너지 낭비가 걱정됩니다.",
                solution: "AI가 세탁물의 종류, 무게, 오염도를 자동으로 확인해 세탁부터 건조까지 맞춤 코스를 설정합니다. 세제도 무게에 맞춰 자동 투입되며, 에너지가 저렴한 시간대에 맞춰 작동을 예약할 수 있습니다.",
                benefit: "옷감 손상과 에너지 낭비를 동시에 줄이고, 미세 플라스틱 저감 코스로 환경 부담까지 낮출 수 있습니다."
            },
            en: {
                pain: "Choosing the right wash cycle for changing laundry every day is tedious, and concerns about fabric damage or energy waste add up.",
                solution: "AI automatically checks laundry type, weight, and soil level to set a custom wash-to-dry cycle. Detergent is auto-dispensed by load weight, and operation can be scheduled for off-peak energy hours.",
                benefit: "Reduces fabric wear and energy waste simultaneously, with a microplastic-reduction cycle to lower your environmental footprint."
            }
        }
    },
    // ── KEEP THE AIR FRESH ────────────────────────────────────────
    {
        id: "keep-air-fresh",
        title: "Keep the air fresh",
        tags: ["Air fresh", "Keep the air fresh"],
        devices: ["에어컨", "공기청정기"],
        missionBucket: "Save",
        content: {
            ko: {
                pain: "외출 중 실내 공기질이 나빠져도 알 수가 없고, 귀가 후에야 탁한 공기를 마주하게 됩니다.",
                solution: "SmartThings Air Care가 실외 공기질을 실시간으로 분석해 환기 최적 타이밍을 조명 색상으로 알려줍니다. 공기청정기와 에어컨이 자동으로 연동되어 실내 공기를 쾌적하게 유지합니다.",
                benefit: "언제 환기할지 일일이 확인하지 않아도 집 안 공기가 항상 깨끗하게 유지되어 가족 모두의 건강을 지킬 수 있습니다."
            },
            en: {
                pain: "Air quality worsens while you're out, and you only notice when you return home to stale air.",
                solution: "SmartThings Air Care analyzes outdoor air quality in real time and signals the best ventilation timing via lighting color. The air purifier and AC work together automatically to keep indoor air fresh.",
                benefit: "No need to check when to ventilate—your home air stays clean at all times, protecting the health of your whole family."
            }
        }
    },
    {
        id: "welcome-to-scandinavia",
        title: "Welcome to Scandinavia",
        tags: ["Air fresh", "Keep the air fresh", "Save energy", "에너지 절약", "Help with chores"],
        devices: ["에어컨", "세탁기", "건조기"],
        missionBucket: "Save",
        content: {
            ko: {
                pain: "쾌적한 공기질과 에너지 효율, 집안일 자동화를 모두 챙기려면 여러 기기를 따로따로 설정해야 해서 복잡합니다.",
                solution: "북유럽 라이프스타일에서 영감을 받은 SmartThings 루틴이 공기청정기, 에어컨, 세탁기를 에너지 효율이 높은 시간대에 통합 운영합니다.",
                benefit: "깨끗한 공기와 낮은 전기요금, 자동화된 가사까지 한 번에 관리되어 여유 있는 일상을 즐길 수 있습니다."
            },
            en: {
                pain: "Managing air quality, energy efficiency, and home chore automation separately requires juggling multiple settings across devices.",
                solution: "A SmartThings routine inspired by Nordic Hygge lifestyle integrates the air purifier, AC, and washer, running them automatically at energy-efficient times.",
                benefit: "Clean air, lower electricity bills, and automated chores all managed together—freeing up your time for a more relaxed daily life."
            }
        }
    },
    // ── CONTROL LIGHTS ────────────────────────────────────────────
    {
        id: "lights-as-alerts",
        title: "Your lights can alert you",
        tags: ["Control lights", "Easily control your lights", "Help with chores", "Air fresh", "Keep the air fresh", "Sleep well"],
        devices: ["조명"],
        missionBucket: "Discover",
        content: {
            ko: {
                pain: "세탁 완료 알림 소리를 놓치거나, 공기질이 나쁠 때 따로 앱을 열어 확인해야 하는 번거로움이 있습니다.",
                solution: "SmartThings가 세탁 완료 시 거실 조명을 녹색으로 깜빡이고, 공기질이 나쁠 때 붉은빛으로 알립니다. 도어벨이 울리면 조명이 반응해 소리를 놓쳐도 방문자를 확인할 수 있습니다.",
                benefit: "소리에 의존하지 않고도 조명만으로 중요한 생활 알림을 놓치지 않게 되어 일상이 훨씬 편리해집니다."
            },
            en: {
                pain: "Missing laundry completion alerts or having to open an app to check air quality every time is inconvenient and easy to forget.",
                solution: "SmartThings flashes living room lights green when laundry finishes, red when air quality drops. When the doorbell rings, lights signal so you never miss a visitor even without hearing it.",
                benefit: "Important daily notifications arrive through lighting without relying on sound, making everyday life much more convenient."
            }
        }
    },
    {
        id: "smart-lighting",
        title: "Add convenience to your life with lighting",
        tags: ["Control lights", "Easily control your lights"],
        devices: ["조명"],
        missionBucket: "Discover",
        content: {
            ko: {
                pain: "외출 전 집안 곳곳의 불을 끄러 다니거나, 밤에 화장실 가면서 조명 스위치를 찾는 불편함이 반복됩니다.",
                solution: "SmartThings와 스마트 조명을 연동하면 어디서든 조명을 제어하고 밝기·색온도를 조절해 원하는 분위기를 만들 수 있습니다. 재실 감지 센서와 연결하면 움직임 감지 시 조명이 자동으로 켜집니다.",
                benefit: "수면 중 화장실도 안전하게, 퇴근 전 전등 걱정 없이—조명 하나로 생활 편의가 크게 달라집니다."
            },
            en: {
                pain: "Walking around to turn off lights before leaving, or fumbling for a switch on a dark midnight bathroom trip, is a daily frustration.",
                solution: "SmartThings with smart lighting lets you control any light remotely and adjust brightness and color temperature for the perfect ambience. Motion sensors turn lights on automatically when movement is detected.",
                benefit: "Safe midnight trips, no more worrying about lights left on—one smart lighting setup transforms daily convenience."
            }
        }
    },
    // ── HELP WITH CHORES ──────────────────────────────────────────
    {
        id: "ai-handles-housework",
        title: "Let AI handle the housework",
        tags: ["Help with chores"],
        devices: ["세탁기", "건조기", "세탁기/건조기", "로봇청소기"],
        missionBucket: "Save",
        content: {
            ko: {
                pain: "매일 달라지는 집안일을 직접 챙기다 보면 시간과 에너지가 계속 소모되고, 가전 사용법이 헷갈릴 때도 많습니다.",
                solution: "AI가 세탁물 종류와 무게를 감지해 최적 코스를 자동 설정합니다. Bixby에게 '수건 코스 설정해줘'라고 말하거나, '세탁기 배수 필터 청소 방법'을 물어보면 바로 답을 받을 수 있습니다.",
                benefit: "가전을 더 잘 활용하게 되면서 집안일의 시간과 노력이 눈에 띄게 줄고, 관리 스트레스도 함께 줄어듭니다."
            },
            en: {
                pain: "Keeping up with daily housework drains time and energy, and it's easy to get confused about the right settings for each appliance.",
                solution: "AI detects laundry type and weight to auto-set the optimal cycle. Tell Bixby 'set the towel cycle' or ask 'how do I clean the drain filter?'—and get an instant answer.",
                benefit: "Better appliance use reduces the time and effort spent on chores significantly, along with the stress of managing them."
            }
        }
    },
    {
        id: "smart-home-party",
        title: "Hosting a smart home party",
        tags: ["Help with chores", "Enhanced mood"],
        devices: ["조명", "스피커", "TV", "로봇청소기"],
        missionBucket: "Play",
        content: {
            ko: {
                pain: "손님 맞이 준비부터 파티 분위기 연출, 파티 후 청소까지 모든 것을 혼자 챙기려면 지칩니다.",
                solution: "파티 루틴을 실행하면 조명이 파티 모드로 바뀌고 스피커에서 음악이 흘러나옵니다. 파티가 끝나면 로봇청소기가 자동으로 청소를 시작해 뒷정리 걱정을 덜어줍니다.",
                benefit: "파티 준비와 마무리 모두 자동화되어 손님 접대에만 집중할 수 있고, 피로한 뒷정리 걱정도 사라집니다."
            },
            en: {
                pain: "Handling party setup, ambiance, and cleanup single-handedly is exhausting and takes away from actually enjoying the event.",
                solution: "Running a party routine switches lights to party mode and starts music from the speaker. When the party ends, the robot vacuum automatically starts cleaning, taking care of itself.",
                benefit: "Party prep and cleanup are both automated, letting you focus entirely on your guests without dreading the aftermath."
            }
        }
    },
    // ── KEEP YOUR HOME SAFE ───────────────────────────────────────
    {
        id: "keep-home-safe",
        title: "Keep your home safe anytime, anywhere",
        tags: ["Keep your home safe"],
        devices: ["센서"],
        missionBucket: "Secure",
        content: {
            ko: {
                pain: "출장이나 여행 중에 집 보안이 걱정되고, 택배 분실이나 낯선 방문자가 신경 쓰입니다.",
                solution: "비디오 도어벨이 움직임을 감지하면 스마트폰과 TV에 실시간 알림과 영상이 팝업됩니다. Knox Matrix 보안 기술로 사용자가 귀가하면 실내 카메라가 자동으로 꺼져 프라이버시가 보호됩니다.",
                benefit: "어디서든 집 상황을 실시간으로 확인하고, 귀가 시엔 카메라가 자동 오프되어 보안과 프라이버시를 동시에 지킬 수 있습니다."
            },
            en: {
                pain: "Worrying about home security during business trips or vacations, and concerns about missed deliveries or unfamiliar visitors.",
                solution: "The video doorbell detects movement and pops up live alerts on your phone and TV. Knox Matrix technology automatically turns off indoor cameras when you arrive home, protecting your privacy.",
                benefit: "Monitor your home in real time from anywhere, with cameras auto-off on arrival—security and privacy protected simultaneously."
            }
        }
    },
    {
        id: "knox-protection",
        title: "Help keep your home private and protected",
        tags: ["Keep your home safe"],
        devices: ["센서", "TV"],
        missionBucket: "Secure",
        content: {
            ko: {
                pain: "스마트홈 기기가 많아질수록 해킹 우려와 개인정보 유출이 걱정됩니다.",
                solution: "Samsung Knox Matrix가 연결된 모든 기기를 프라이빗 블록체인으로 묶어 상호 보안 감시를 수행합니다. 취약한 기기가 감지되면 즉시 네트워크에서 격리시킵니다. 삼성 AI 가전은 업계 최초 UL Solutions 다이아몬드 등급을 획득했습니다.",
                benefit: "기기가 늘어날수록 보안이 강해지는 삼성 생태계 안에서, 해킹 걱정 없이 스마트홈을 마음껏 확장할 수 있습니다."
            },
            en: {
                pain: "As smart home devices multiply, concerns about hacking risks and personal data exposure grow alongside them.",
                solution: "Samsung Knox Matrix links all connected devices in a private blockchain for mutual security monitoring. Vulnerable devices are immediately isolated when detected. Samsung AI appliances hold the industry-first Diamond security rating from UL Solutions.",
                benefit: "The more devices you add, the stronger your security—expand your smart home freely without hacking concerns."
            }
        }
    },
    // ── SLEEP WELL ────────────────────────────────────────────────
    {
        id: "sleep-specialist",
        title: "Your own in-house sleep specialist",
        tags: ["Sleep well", "Air fresh", "Keep the air fresh", "Control lights", "Easily control your lights"],
        devices: ["조명", "에어컨", "공기청정기"],
        missionBucket: "Save",
        content: {
            ko: {
                pain: "잠들기 전 조명, 온도, 공기질을 일일이 맞추는 것이 번거롭고, 아침에 일어날 때 개운하지 않은 날이 많습니다.",
                solution: "갤럭시 워치나 갤럭시 링이 수면 감지를 시작하면, 침실 조명이 서서히 어두워지고 커튼이 닫히며 에어컨과 공기청정기가 조용히 작동합니다. 기상 시간에는 커튼이 열리고 TV가 자연스럽게 켜집니다.",
                benefit: "수면 환경을 설정하는 수고 없이 신체 리듬에 맞춘 최적의 수면 환경이 자동으로 완성되어 더 깊고 개운한 숙면을 취할 수 있습니다."
            },
            en: {
                pain: "Manually adjusting lights, temperature, and air quality before bed is tedious, and waking up unrefreshed happens too often.",
                solution: "When your Galaxy Watch or Galaxy Ring detects sleep onset, bedroom lights gradually dim, curtains close, and the AC and air purifier quietly activate. At wake time, curtains open and the TV turns on naturally.",
                benefit: "The optimal sleep environment sets itself to your body rhythm without any setup effort, delivering deeper, more refreshing sleep every night."
            }
        }
    },
    // ── ENHANCED MOOD ─────────────────────────────────────────────
    {
        id: "ultimate-gaming",
        title: "The ultimate gaming environment",
        tags: ["Enhanced mood", "Air fresh", "Keep the air fresh", "Control lights", "Easily control your lights"],
        devices: ["TV", "조명", "에어컨"],
        missionBucket: "Play",
        content: {
            ko: {
                pain: "게임을 시작할 때마다 조명, 블라인드, 에어컨을 일일이 조절해야 하고, 장시간 게임으로 방이 더워져 집중력이 떨어집니다.",
                solution: "게이밍 허브 실행과 동시에 조명이 게임 화면과 실시간으로 색상을 동기화하고, 블라인드가 자동으로 내려갑니다. 무풍 에어컨이 직풍 없이 쾌적한 온도를 유지하며, 게임 종료 시 모든 환경이 일상 모드로 자동 복귀합니다.",
                benefit: "별도의 조작 없이 게임 시작과 동시에 완벽한 몰입 환경이 완성되고, 종료 후 정리도 자동으로 됩니다."
            },
            en: {
                pain: "Adjusting lights, blinds, and AC manually every gaming session, then overheating during long play sessions that breaks concentration.",
                solution: "Launching Gaming Hub syncs room lights to the screen in real time and lowers blinds automatically. WindFree AC maintains comfort without direct airflow, and everything resets to normal mode when gaming ends.",
                benefit: "A perfect immersive environment is ready the moment gaming starts—and tidies itself when you're done, with zero manual intervention."
            }
        }
    },
    {
        id: "upgrade-listening",
        title: "Upgrade your listening experience",
        tags: ["Enhanced mood"],
        devices: ["스피커", "TV", "조명"],
        missionBucket: "Play",
        content: {
            ko: {
                pain: "좋은 음악이나 영상을 즐기고 싶은데 기기별 설정이 복잡하고, 음악과 조명이 따로따로 놀아 분위기가 반감됩니다.",
                solution: "뮤직 프레임이나 사운드바의 음악 재생과 연동하여 조명이 음악의 분위기에 맞게 자동으로 색상과 밝기를 조절합니다. 멀티룸 오디오로 집 안 어디서든 같은 음악을 즐길 수 있습니다.",
                benefit: "조명과 음악이 하나가 되어 집이 나만의 홈 콘서트홀로 변신하고, 방마다 끊김 없는 음악 경험을 즐길 수 있습니다."
            },
            en: {
                pain: "Enjoying great music or content is hampered by complex per-device settings, and lights and audio working independently undercut the atmosphere.",
                solution: "When the Music Frame or soundbar plays, lights automatically adjust color and brightness to match the music's mood. Multi-room audio lets you enjoy the same music seamlessly throughout your home.",
                benefit: "Lights and music unite to transform your home into a personal concert hall, with uninterrupted audio flowing from room to room."
            }
        }
    },
    // ── CARE FOR SENIORS ──────────────────────────────────────────
    {
        id: "family-care-apart",
        title: "Be worry-free even when apart",
        tags: ["Care for seniors", "시니어 케어"],
        devices: ["센서", "냉장고", "TV"],
        missionBucket: "Care",
        content: {
            ko: {
                pain: "멀리 사시는 부모님의 안부가 걱정되지만 매번 전화하기는 부담스럽고, 카메라 감시는 사생활 침해 같아 불편합니다.",
                solution: "Family Care 서비스가 냉장고 문 열림, TV 시청, 정수기 사용 패턴을 분석합니다. 평소와 달리 일정 시간 활동이 없으면 보호자에게 알림을 보내고, 정해진 시간에 복약 알림도 TV 화면으로 제공합니다.",
                benefit: "사생활을 침해하지 않으면서도 부모님의 안부를 확인하고, 이상 상황에는 빠르게 대처할 수 있어 마음이 훨씬 놓입니다."
            },
            en: {
                pain: "Worrying about elderly parents far away, yet feeling awkward calling constantly—and using cameras feels like an invasion of their privacy.",
                solution: "Family Care analyzes fridge door use, TV viewing, and water dispenser patterns. Unusual inactivity for a set period triggers an alert, and medication reminders appear on their TV at scheduled times.",
                benefit: "Stay informed about your parents' wellbeing without intruding on their privacy, with fast alerts when something seems off—real peace of mind from a distance."
            }
        }
    },
    // ── CARE FOR KIDS ─────────────────────────────────────────────
    {
        id: "care-for-kids",
        title: "Keep your children comfortable and safe",
        tags: ["Care for kids", "Air fresh", "Keep the air fresh", "Keep your home safe"],
        devices: ["에어컨", "센서"],
        missionBucket: "Care",
        content: {
            ko: {
                pain: "맞벌이 가정에서 아이가 혼자 귀가했을 때 안전한지, 실내 환경이 괜찮은지 직접 확인할 수 없어 걱정입니다.",
                solution: "자녀가 귀가하면 도어락 신호로 스피커를 통해 따뜻한 음성 인사가 나오고, 더운 날은 에어컨이 자동으로 켜집니다. 주방 가전이 작동 중이면 즉시 알림을 받고, 공기질이 나쁘면 공기청정기가 자동 가동합니다.",
                benefit: "아이의 귀가 확인부터 안전한 실내 환경 조성까지 자동으로 관리되어, 부모가 집에 없어도 아이가 안전하게 지낼 수 있습니다."
            },
            en: {
                pain: "In a dual-income household, not being able to check whether your child arrived safely or if the home environment is comfortable is a constant worry.",
                solution: "When your child arrives home, the door lock triggers a warm voice greeting from the speaker, and the AC turns on automatically on hot days. Kitchen appliance alerts come through instantly, and poor air quality starts the purifier.",
                benefit: "From arrival confirmation to safe indoor environment setup, everything is managed automatically—your child is safe and comfortable even when you're not there."
            }
        }
    },
    // ── CARE FOR PET ──────────────────────────────────────────────
    {
        id: "purrfect-pet-care",
        title: "Purrfect pet care",
        tags: ["Care for pet", "반려동물 케어", "Keep your home safe", "Help with chores"],
        devices: ["로봇청소기", "TV", "에어컨", "센서"],
        missionBucket: "Care",
        content: {
            ko: {
                pain: "야근이나 외출로 반려동물이 집에 혼자 있어 불안하고, 온도나 음식, 분리불안을 제때 돌봐주지 못할까 걱정됩니다.",
                solution: "Jet Bot AI+ 로봇청소기로 원격 순찰을 하고 반려동물 사진을 실시간 전송합니다. 짖음이 감지되면 TV에서 안정을 돕는 음악이 자동 재생되고, 에어컨이 쾌적한 온도를 유지합니다. 스마트 급식기로 원격 급식도 가능합니다.",
                benefit: "멀리 있어도 반려동물의 상태를 실시간으로 확인하고 돌봄 공백을 채울 수 있어, 보호자의 불안이 크게 줄어듭니다."
            },
            en: {
                pain: "Anxiety about a pet left alone during overtime or outings—unable to check on temperature, food, or separation anxiety in time.",
                solution: "The Jet Bot AI+ robot vacuum remotely patrols and sends real-time pet photos. Detected barking triggers calming music on the TV automatically, the AC maintains comfort, and a smart feeder enables remote feeding.",
                benefit: "Check on your pet in real time and fill care gaps from anywhere—dramatically reducing a pet owner's worry while away."
            }
        }
    },
    // ── FIND YOUR BELONGINGS ──────────────────────────────────────
    {
        id: "find-belongings",
        title: "Locate lost items easily",
        tags: ["Find your belongings", "Keep your home safe"],
        devices: ["TV", "센서"],
        missionBucket: "Secure",
        content: {
            ko: {
                pain: "열쇠, 지갑, 리모컨 등 자주 잃어버리는 물건을 찾느라 시간을 낭비하고, 외출 전에 특히 스트레스를 받습니다.",
                solution: "SmartTag를 부착한 물건의 위치를 SmartThings 앱에서 바로 확인하고, UWB 기술로 정밀하게 위치를 추적합니다. TV 화면에서 'Find my phone' 기능으로 숨어있는 스마트폰도 찾을 수 있습니다.",
                benefit: "외출 전 물건 찾는 스트레스에서 해방되고, 귀중품을 항상 파악할 수 있어 일상이 한결 가벼워집니다."
            },
            en: {
                pain: "Wasting time hunting for keys, wallets, and remotes—especially stressful right before heading out.",
                solution: "Check the location of SmartTag-attached items directly in the SmartThings app, with UWB technology for precision tracking. 'Find my phone' from the TV screen locates a hidden smartphone instantly.",
                benefit: "No more pre-departure stress over lost items—knowing where your valuables are at all times lightens your daily routine considerably."
            }
        }
    },
    // ── STAY FIT & HEALTHY ────────────────────────────────────────
    {
        id: "stay-fit-healthy",
        title: "Let SmartThings take care of your workouts",
        tags: ["Stay fit & healthy", "Enhanced mood", "Air fresh", "Keep the air fresh"],
        devices: ["TV", "에어컨"],
        missionBucket: "Play",
        content: {
            ko: {
                pain: "집에서 운동할 때 환경 세팅에 시간을 빼앗기고, 갤럭시 워치 데이터를 보면서 동시에 콘텐츠를 즐기기도 어렵습니다.",
                solution: "SmartThings가 운동 시작과 동시에 에어컨과 공기청정기를 켜 쾌적한 환경을 조성합니다. 갤럭시 워치의 운동 정보(시간, 칼로리, 심박수)를 TV 화면에서 실시간으로 확인하면서 좋아하는 콘텐츠도 함께 즐길 수 있습니다.",
                benefit: "운동 환경 세팅에 신경 쓰지 않고 바로 운동에 집중할 수 있으며, TV로 데이터를 확인하면서 더 즐겁고 효과적으로 운동할 수 있습니다."
            },
            en: {
                pain: "Home workouts are disrupted by time spent adjusting the environment, and it's hard to view Galaxy Watch workout data on TV while enjoying other content.",
                solution: "SmartThings turns on the AC and air purifier as your workout starts for an ideal environment. Galaxy Watch data—time, calories, heart rate—displays in real time on your TV alongside any content you enjoy.",
                benefit: "No time lost on environment setup before working out—dive straight in and enjoy more effective, entertaining workouts with live stats on your big screen."
            }
        }
    },
    // ── FOOD / KITCHEN ────────────────────────────────────────────
    {
        id: "smart-cooking",
        title: "How to make today's meal more enjoyable",
        tags: ["Help with chores", "Smart cooking"],
        devices: ["냉장고", "오븐"],
        missionBucket: "Save",
        content: {
            ko: {
                pain: "냉장고에 뭐가 있는지 매번 열어봐야 하고, 오븐 온도와 시간을 레시피마다 직접 맞춰야 해서 요리 시작 전부터 지칩니다.",
                solution: "AI Vision Inside가 냉장고 식재료를 자동으로 인식해 목록을 만들고 유통기한을 알려줍니다. 오븐에 재료를 넣으면 재료를 인식해 최적 레시피를 추천하고 온도와 시간을 자동 설정합니다.",
                benefit: "냉장고 문 열지 않고도 식재료를 파악하고, 오븐이 알아서 맞춰주는 덕분에 요리 시작부터 마무리까지 훨씬 수월해집니다."
            },
            en: {
                pain: "Having to open the fridge every time to check ingredients, and manually setting oven temperature and time for every recipe, is draining before cooking even starts.",
                solution: "AI Vision Inside automatically recognizes refrigerator contents, creates an ingredient list, and tracks expiry dates. Put ingredients in the oven and it recognizes them, recommends the best recipe, and auto-sets temperature and time.",
                benefit: "Check your fridge without opening it, and let the oven handle the settings—cooking becomes smoother and more enjoyable from start to finish."
            }
        }
    }
];

function findExploreScenario(intent) {
    let bestMatch = null;
    let maxScore = 0;

    const tags = intent.lifestyleTags.map(t => t.toLowerCase());
    const purpose = intent.purpose.toLowerCase();
    const devices = intent.selectedDevices.map(d => d.toLowerCase());

    EXPLORE_SCENARIOS.forEach(scenario => {
        let score = 0;
        
        // Tag matching
        scenario.tags.forEach(tag => {
            if (tags.includes(tag.toLowerCase())) score += 10;
        });

        // Device matching
        scenario.devices.forEach(device => {
            if (devices.includes(device.toLowerCase())) score += 5;
        });

        // Keyword in purpose matching
        const keywords = scenario.title.toLowerCase().split(" ");
        keywords.forEach(word => {
            if (word.length > 3 && purpose.includes(word)) score += 3;
        });

        if (score > maxScore) {
            maxScore = score;
            bestMatch = scenario;
        }
    });

    // Minimum score threshold for a "match"
    return maxScore >= 10 ? bestMatch : null;
}

function buildDetailedScenario(country, city, selectedSegment, intent, deviceDecision, services) {
    const countryName = getCountryName(country.countryCode);
    const serviceNames = [...new Set(services.slice(0, 3).map((service) => service.serviceName))];
    const isPetContext = /pet|dog|cat|puppy|kitten|반려|강아지|고양이/i.test(`${selectedSegment} ${intent.purpose} ${serviceNames.join(" ")}`);
    const appliedServices = [...new Set(services.slice(0, 3).map((service) => service.appCardLabel || service.serviceName))];
    
    // Attempt to find a matching Explore scenario first
    const exploreMatch = findExploreScenario(intent);
    
    let serviceStories;
    if (exploreMatch) {
        const locale = currentLocale === "ko" ? "ko" : "en";
        const content = exploreMatch.content[locale] || exploreMatch.content.en;
        serviceStories = [
            {
                title: currentLocale === "ko" ? `[참조 시나리오] ${exploreMatch.title}` : `[Explore Mapped] ${exploreMatch.title}`,
                paragraphs: [content.pain, content.solution, content.benefit]
            },
            ...services.slice(0, 2).map((service) => {
                const story = buildServiceStory(service, intent, selectedSegment, isPetContext);
                return { title: story.title, paragraphs: [story.pain, story.solution, story.benefit] };
            })
        ].slice(0, 3);
    } else {
        serviceStories = services.slice(0, 3).map((service) => {
            const story = buildServiceStory(service, intent, selectedSegment, isPetContext);
            return { title: story.title, paragraphs: [story.pain, story.solution, story.benefit] };
        });
    }

    return {
        targetCustomer: buildTargetCustomerLine(countryName, selectedSegment, intent.purpose),
        appliedServices: appliedServices.join(" / "),
        appliedServiceList: appliedServices,
        cases: serviceStories,
        isMapped: !!exploreMatch
    };
}

function renderOverview(payload) {
    const titles = getOutputTitles();
    const marketing = payload.marketingMessages || {};
    const marketingLenses = Object.values(marketing.lenses || {});

    const isKo = currentLocale === "ko";
    const state = payload.state || payload.scenarioMeta || {};
    const briefTarget = compactDescriptor(state.segment || "", 3);
    const briefCountry = [state.countryName, state.city].filter(Boolean).join(" / ") || "";
    const briefRole = getRoleTitle(state.role || "") || "";
    const summaryLines = buildSixLineSummary(payload).slice(0, 3);

    return `
        <div class="output-stack">
            <!-- Brief Card: 1분 브리핑 -->
            <section class="output-block brief-card">
                <div class="brief-card-header">
                    <h3>${escapeHtml(payload.title)}</h3>
                </div>
                <div class="brief-card-meta">
                    ${briefRole ? `<span class="brief-tag">${escapeHtml(briefRole)}</span>` : ""}
                    ${briefCountry ? `<span class="brief-tag">${escapeHtml(briefCountry)}</span>` : ""}
                    ${briefTarget ? `<span class="brief-tag">${escapeHtml(briefTarget)}</span>` : ""}
                </div>
                <ul class="brief-card-points">
                    ${summaryLines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
                </ul>
            </section>

            <!-- 01. CX 시나리오 요약 -->
            <section class="output-block hero-result numbered-output">
                <p class="block-index">01</p>
                <h4>${titles.summary}</h4>
                <p class="summary-text">${escapeHtml(payload.summary)}</p>

                <div class="summary-sub-grid">
                    <div class="summary-sub-item">
                        <p class="subhead">${isKo ? "참조된 시나리오 기반 스토리" : "Parent Story"}</p>
                        <p>${escapeHtml(buildParentStory(payload))}</p>
                    </div>
                    <div class="summary-sub-item">
                        <p class="subhead">${isKo ? "핵심 가치" : "Core Values"}</p>
                        <ul class="value-list">${buildReflectedValues(payload).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
                    </div>
                </div>

                <div class="storyboard-webtoon">
                    <p class="subhead">${isKo ? "스토리보드 요약" : "Storyboard Summary"}</p>
                    <div class="webtoon-grid">
                        ${payload.storyboard.map((panel, idx) => `
                            <div class="webtoon-panel">
                                <div class="webtoon-img-placeholder">Panel ${idx + 1}</div>
                                <p class="webtoon-scene"><strong>${escapeHtml(panel.scene)}</strong></p>
                                <p class="webtoon-text">"${escapeHtml(panel.text)}"</p>
                            </div>
                        `).join("")}
                    </div>
                </div>

                <p class="subhead">${isKo ? "핵심 요약" : "Executive Summary"}</p>
                <ul class="six-line-summary">${buildSixLineSummary(payload).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            </section>

            <!-- 02. 상세 시나리오(Detailed Scenario) -->
            <section class="output-block numbered-output">
                <p class="block-index">02</p>
                <h4>${titles.scenario}</h4>
                <div class="scenario-details-grid">
                    <div class="detail-col">
                        <strong>${isKo ? "타겟 고객" : "Target Customer Context"}</strong>
                        <p>${escapeHtml(payload.detailedScenario.targetCustomer)}</p>
                    </div>
                    <div class="detail-col">
                        <strong>적용된 Life 서비스 및 테마</strong>
                        <p>${payload.detailedScenario.appliedServiceList.map((s) => `<span class="service-pill">${escapeHtml(s)}</span>`).join(" ")}</p>
                    </div>
                </div>
                
                <div class="scenario-case-grid">
                ${payload.detailedScenario.cases.map((item) => `
                    <div class="case-block">
                        <h5>${escapeHtml(item.title)}</h5>
                        ${item.paragraphs.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
                    </div>
                `).join("")}
                </div>
            </section>

            <!-- 03. 지역 특성 및 데이터 근거 -->
            <section class="output-block numbered-output">
                <p class="block-index">03</p>
                <h4>${titles.facts}</h4>
                <div class="fact-separation">
                    <div class="fact-box confirmed-box">
                        <strong>${currentLocale === "ko" ? "확정 정보" : "Confirmed Facts"}</strong>
                        <table class="fact-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Fact</th>
                                    <th>Source</th>
                                    <th>Confidence</th>
                                    <th>Impact</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(payload.facts.confirmed || []).map((item) => {
                                    const srcDetailId = `fact-src-${item.no}-${Date.now()}`;
                                    const srcUrl = item.source_url || "";
                                    const urlLink = srcUrl
                                        ? `<a class="source-detail-url" href="${escapeHtml(srcUrl)}" target="_blank" rel="noopener noreferrer">🔗 ${escapeHtml(srcUrl.length > 70 ? srcUrl.slice(0, 70) + "…" : srcUrl)}</a>`
                                        : "";
                                    return `
                                    <tr>
                                        <td>${item.no}</td>
                                        <td>${escapeHtml(item.fact)}</td>
                                        <td><span class="source-tag" data-source-detail="${srcDetailId}">${escapeHtml(item.source)}</span></td>
                                        <td>${escapeHtml(item.confidence)}</td>
                                        <td>${escapeHtml(item.impact)}</td>
                                    </tr>
                                    <tr class="source-detail-row">
                                        <td colspan="5">
                                            <div class="source-detail" id="${srcDetailId}">
                                                <p class="source-detail-label">${escapeHtml(item.source)}</p>
                                                <p class="source-detail-snippet">${escapeHtml(item.fact)}</p>
                                                <p class="source-detail-meta">${currentLocale === "ko" ? "신뢰도" : "Confidence"}: ${escapeHtml(item.confidence)} · ${escapeHtml(item.impact)}</p>
                                                ${urlLink}
                                            </div>
                                        </td>
                                    </tr>`;
                                }).join("")}
                            </tbody>
                        </table>
                    </div>
                    <div class="fact-box assumption-box">
                        <strong>${currentLocale === "ko" ? "추론 정보" : "Inferences"}</strong>
                        <ul>${(payload.facts.assumptions || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
                    </div>
                </div>
                <div class="insight-process">
                    <div class="process-item">
                        <strong>${isKo ? "지역 현황 (Observation)" : "Observation"}</strong>
                        <p>${escapeHtml(payload.facts.observation)}</p>
                    </div>
                    <div class="process-item">
                        <strong>${isKo ? "핵심 도출 (Insight)" : "Insight"}</strong>
                        <p>${escapeHtml(payload.facts.insight)}</p>
                    </div>
                    <div class="process-item">
                        <strong>${isKo ? "CX 적용 (Implication)" : "Implication"}</strong>
                        <p>${escapeHtml(payload.facts.implication)}</p>
                    </div>
                </div>
                <div class="fact-readiness">
                    <strong>${currentLocale === "ko" ? "기기/서비스 준비 상태" : "Readiness Sync"}</strong>
                    <ul>${(payload.facts.readiness || []).map((item) => `<li><strong>${escapeHtml(item.label)}</strong> · ${escapeHtml(item.status)} · ${escapeHtml(item.note)}</li>`).join("")}</ul>
                </div>
                <div class="fact-links source-refs-summary">
                    <h5>${currentLocale === "ko" ? "참조 출처" : "Reference Sources"}</h5>
                    <div class="output-source-bar">
                        ${(payload.facts.sourceRefs || []).map((ref) => `<span class="source-tag" title="${escapeHtml(ref)}">${escapeHtml(ref.replace("references/", ""))}</span>`).join("")}
                    </div>
                    ${(payload.facts.sourceUrls || []).length ? `
                        <div class="output-source-bar">
                            ${payload.facts.sourceUrls.map((url) => {
                                const domain = url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
                                return `<a class="source-tag source-tag-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(url)}">${escapeHtml(domain)}</a>`;
                            }).join("")}
                        </div>
                    ` : ""}
                </div>
            </section>

            <!-- 04. 마케팅 메시지 -->
            <section class="output-block numbered-output">
                <p class="block-index">04</p>
                <h4>${titles.marketing}</h4>
                <div class="marketing-wrap">
                    <p class="role-badge">${escapeHtml(marketing.roleTone || "")} ${currentLocale === "ko" ? "선택 상태, 아래는 3개 렌즈 전체 출력입니다." : "selected, but all three lenses are shown below."}</p>
                    <div class="marketing-guideline-box">
                        <strong>${currentLocale === "ko" ? "확정된 언어 가이드라인 반영 규칙" : "Confirmed Verbal Guideline Rules"}</strong>
                        <ul class="marketing-list">${(marketing.confirmedRules || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
                    </div>
                    <div class="marketing-guideline-box">
                        <strong>${currentLocale === "ko" ? "글로벌 / 로컬 메시지 구분" : "Global / Local Split"}</strong>
                        <ul class="marketing-list">
                            <li><strong>${isKo ? "글로벌" : "Global"}</strong>: ${escapeHtml(marketing.globalLocalSplit?.global || "")}</li>
                            <li><strong>${isKo ? "로컬" : "Local"}</strong>: ${escapeHtml(marketing.globalLocalSplit?.local || "")}</li>
                        </ul>
                    </div>
                    <div class="marketing-lens-grid">
                        ${marketingLenses.map((lens) => `
                            <article class="marketing-lens-card ${lens.selected ? "selected" : ""}">
                                <p class="marketing-lens-label">${escapeHtml(lens.label)}</p>
                                ${lens.hookEn ? `<p><strong>${isKo ? "훅 메시지 (영문)" : "Hook (EN)"}</strong><br>${escapeHtml(lens.hookEn)}</p>` : ""}
                                ${lens.shortCopyKo ? `<p><strong>${isKo ? "짧은 카피 (국문)" : "Short copy (KO)"}</strong><br>${escapeHtml(lens.shortCopyKo)}</p>` : ""}
                                ${lens.talkTrackKo ? `<div><strong>${isKo ? "설명 멘트 (국문)" : "Talk-track (KO)"}</strong><ul>${lens.talkTrackKo.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>` : ""}
                                ${lens.h1En ? `<p><strong>${isKo ? "메인 헤드라인 (영문)" : "H1 (EN)"}</strong><br>${escapeHtml(lens.h1En)}</p>` : ""}
                                ${lens.subCopyKo ? `<p><strong>${isKo ? "보조 카피 (국문)" : "Sub-copy (KO)"}</strong><br>${escapeHtml(lens.subCopyKo)}</p>` : ""}
                                ${lens.proofPointKo ? `<p><strong>${isKo ? "증거 포인트" : "Proof point"}</strong><br>${escapeHtml(lens.proofPointKo)}</p>` : ""}
                                ${lens.campaignConceptEn ? `<p><strong>${isKo ? "캠페인 컨셉 (영문)" : "Campaign concept (EN)"}</strong><br>${escapeHtml(lens.campaignConceptEn)}</p>` : ""}
                                ${lens.emotionalNarrativeKo ? `<p><strong>${isKo ? "감성 내러티브 (국문)" : "Emotional narrative (KO)"}</strong><br>${escapeHtml(lens.emotionalNarrativeKo)}</p>` : ""}
                                ${lens.brandValue ? `<p><strong>${isKo ? "강화되는 브랜드 가치" : "Brand value reinforced"}</strong><br>${escapeHtml(lens.brandValue)}</p>` : ""}
                                <p><strong>${isKo ? "행동 유도 문구" : "CTA"}</strong><br>${escapeHtml(lens.cta || "")}</p>
                            </article>
                        `).join("")}
                    </div>
                </div>
            </section>

            ${renderPostOutputPrompt(payload)}
        </div>
    `;
}

function renderPostOutputPrompt(payload) {
    const title = currentLocale === "ko"
        ? "추가 요청"
        : currentLocale === "de"
            ? "Weitere Anfrage"
            : "Additional Request";
    const placeholder = currentLocale === "ko"
        ? "예: 이 시나리오를 Dotcom용 3문장 CTA로 바꿔줘"
        : "Example: Rewrite this scenario into three Dotcom CTAs";
    const button = currentLocale === "ko" ? "질문하기" : "Ask";
    const helper = currentLocale === "ko"
        ? "생성된 01~04 결과를 바탕으로 추가 요청을 입력하면, 내부 계산된 컨텍스트까지 반영해 바로 답변합니다."
        : "Ask an additional request based on outputs 01~04, and get an immediate answer grounded in the internal context.";
    const initial = currentLocale === "ko"
        ? `현재 컨텍스트: ${payload.title}`
        : `Current context: ${payload.title}`;

    return `
        <section class="output-block post-output-prompt">
            <h4>${escapeHtml(title)}</h4>
            <p class="post-output-helper">${escapeHtml(helper)}</p>
            <div class="post-output-input-row">
                <textarea id="post-output-input" rows="3" placeholder="${escapeHtml(placeholder)}"></textarea>
                <button type="button" id="post-output-ask-btn" class="generate-btn">${escapeHtml(button)}</button>
            </div>
            <div id="post-output-answer" class="post-output-answer" aria-live="polite">${escapeHtml(initial)}</div>
        </section>
    `;
}

function bindPostOutputPrompt(payload) {
    const askBtn = document.getElementById("post-output-ask-btn");
    const input = document.getElementById("post-output-input");
    const answer = document.getElementById("post-output-answer");
    if (!askBtn || !input || !answer) return;

    const ask = () => {
        const question = String(input.value || "").trim();
        if (!question) return;
        answer.textContent = buildPostOutputAnswer(question, payload);
    };

    askBtn.addEventListener("click", ask);
    input.addEventListener("keydown", (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            ask();
        }
    });
}

function buildPostOutputAnswer(question, payload) {
    const q = String(question || "").toLowerCase();
    const isKo = currentLocale === "ko";
    const messages = flattenMarketingMessages(payload.marketingMessages);

    if (/요약|summary|tl;dr/.test(q)) {
        return isKo
            ? `요약: ${payload.summary} 핵심은 ${payload.summaryBullets.slice(0, 2).join(" / ")} 입니다.`
            : `Summary: ${payload.summary} Core points: ${payload.summaryBullets.slice(0, 2).join(" / ")}.`;
    }
    if (/카피|문구|message|copy|cta/.test(q)) {
        return isKo
            ? `권장 메시지:\n1) ${messages[0] || ""}\n2) ${messages[1] || ""}\n3) ${messages[2] || ""}`
            : `Recommended messages:\n1) ${messages[0] || ""}\n2) ${messages[1] || ""}\n3) ${messages[2] || ""}`;
    }
    if (/리스크|risk|privacy|trust/.test(q)) {
        return isKo
            ? `리스크 요약: ${payload.marketability.risk}\n대응: ${(payload.marketability.nextActions || []).join(" / ")}`
            : `Risk summary: ${payload.marketability.risk}\nActions: ${(payload.marketability.nextActions || []).join(" / ")}`;
    }

    return isKo
        ? `요청 반영 제안: "${question}"\n- 타겟: ${payload.detailedScenario.targetCustomer}\n- KPI: ${payload.marketability.verdict}\n- 다음 실행: ${(payload.marketability.nextActions || []).slice(0, 2).join(" / ")}`
        : `Suggestion for "${question}"\n- Target: ${payload.detailedScenario.targetCustomer}\n- KPI decision: ${payload.marketability.verdict}\n- Next actions: ${(payload.marketability.nextActions || []).slice(0, 2).join(" / ")}`;
}

function renderRoleDetailSections(lens) {
    const sections = lens.roleDetailSections || [];
    if (!sections.length) return "";

    return `
        <section class="output-grid">
            ${sections.map((section) => `
                <div class="output-block">
                    <h4>${escapeHtml(section.title)}</h4>
                    <ul>${(section.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
                </div>
            `).join("")}
        </section>
    `;
}

function renderLensPanel(lens) {
    const cards = (lens.whatYouGet || []).slice(0, 5);
    return `
        <section class="output-block hero-result what-you-get-wrap">
            <p class="block-index">${t("roleLens")}</p>
            <h3>${escapeHtml(lens.title)}</h3>
            <p class="what-you-get-subtitle">${escapeHtml(lens.subtitle)}</p>
            <h4>${currentLocale === "ko" ? "What you get" : "What you get"}</h4>
            <div class="what-you-get-grid">
                ${cards.map((card, index) => `
                    <article class="what-you-get-item">
                        <p class="what-you-get-index">${String(index + 1).padStart(2, "0")}</p>
                        <h5>${escapeHtml(card.title || "")}</h5>
                        <p class="what-you-get-meaning">${escapeHtml(card.meaning || "")}</p>
                        <p class="what-you-get-example">${escapeHtml(card.example || "")}</p>
                    </article>
                `).join("")}
            </div>
        </section>
    `;
}

function getOutputTitles() {
    return {
        summary: t("outTitle01"),
        scenario: t("outTitle02"),
        facts: t("outTitle03"),
        marketing: t("outTitle04"),
        benefits: t("outTitle05"),
        target: t("outTitle06"),
        timing: t("outTitle07"),
        devices: t("outTitle08"),
        marketability: t("outTitle09"),
        addon: t("outTitle10"),
        reflection: t("outTitle11")
    };
}

function handleExport(type) {
    if (!latestPayload && !latestStructuredOutput) {
        resultDiv.innerHTML = `<p class="error">${t("downloadFirst")}</p>`;
        return;
    }
    if (type === "pdf") return exportPdf();
    if (type === "word") return exportWord();
    if (type === "excel") return exportExcel();
    if (type === "copy") return copySummary();
}

async function copySummary() {
    const text = latestStructuredOutput
        ? buildStructuredPlainText(latestStructuredOutput)
        : buildPlainTextReport(latestPayload);
    try {
        await navigator.clipboard.writeText(text);
        const btn = exportActions.querySelector('[data-export="copy"]');
        if (btn) {
            const orig = btn.querySelector("strong").textContent;
            btn.querySelector("strong").textContent = currentLocale === "ko" ? "복사 완료!" : "Copied!";
            setTimeout(() => { btn.querySelector("strong").textContent = orig; }, 1500);
        }
    } catch {
        window.prompt(currentLocale === "ko" ? "아래 내용을 복사하세요." : "Copy the text below.", text);
    }
}

function buildStructuredPlainText(output) {
    const lines = [];
    const tx = output.transformation || {};
    const mo = tx.marketerOutput || {};
    const co = tx.consumerOutput || {};
    const sel = output.selection || {};
    const isKo = (output.locale || "ko") === "ko";

    // 선택 근거
    const primary = (sel.selectedScenarios || []).find(s => s.isPrimary) || (sel.selectedScenarios || [])[0];
    if (primary) {
        lines.push(`═══ ${isKo ? "선택 근거" : "Selection Basis"} ═══`);
        lines.push(`${isKo ? "시나리오" : "Scenario"}: ${primary.title} (Explore ${primary.source})`);
        lines.push(`${isKo ? "아티클" : "Article"}: ${primary.articleTitle}`);
        if (sel.selectionReason) lines.push(`${isKo ? "선택 이유" : "Reason"}: ${sel.selectionReason}`);
        if ((sel.primaryValues || []).length) lines.push(`${isKo ? "가치" : "Values"}: ${sel.primaryValues.join(", ")}`);
        lines.push("");
    }

    // 마케터용
    lines.push(`═══ ${isKo ? "마케터용" : "For Marketers"} ═══`);
    if (mo.headline) lines.push(mo.headline);
    if (mo.summary) lines.push(mo.summary);
    lines.push("");
    if (mo.whyThisScenario) { lines.push(`${isKo ? "왜 이 시나리오:" : "Why:"} ${mo.whyThisScenario}`); lines.push(""); }
    if ((mo.copyOptions || []).length) {
        lines.push(isKo ? "카피 옵션:" : "Copy Options:");
        mo.copyOptions.forEach((c, i) => {
            lines.push(`  ${i + 1}) KR: ${c.ko || ""}`);
            if (c.en) lines.push(`     EN: ${c.en}`);
            if (c.tone) lines.push(`     ${isKo ? "톤" : "Tone"}: ${c.tone}`);
        });
        lines.push("");
    }
    if ((mo.channelStrategy || []).length) {
        lines.push(isKo ? "채널 전략:" : "Channel Strategy:");
        mo.channelStrategy.forEach(ch => {
            lines.push(`  [${ch.channel}] ${ch.message} (${ch.tone}, ${ch.format || ""})`);
        });
        lines.push("");
    }

    // 일반 사용자용
    lines.push(`═══ ${isKo ? "일반 사용자용" : "For Consumers"} ═══`);
    if (co.headline) lines.push(co.headline);
    if (co.whatItDoes) { lines.push(""); lines.push(co.whatItDoes); }
    lines.push("");
    if ((co.requiredSetup?.devices || []).length) {
        lines.push(isKo ? "필요 기기:" : "Required Devices:");
        co.requiredSetup.devices.forEach(d => {
            lines.push(`  - ${d.name}${d.role ? ` (${d.role})` : ""}${d.required !== false ? "" : ` [${isKo ? "선택" : "Optional"}]`}`);
        });
        lines.push("");
    }
    if ((co.setupSteps || []).length) {
        lines.push(isKo ? "설정 방법:" : "Setup Steps:");
        co.setupSteps.forEach((s, i) => lines.push(`  ${i + 1}. ${s}`));
        lines.push("");
    }
    if ((co.cautions || []).length) {
        lines.push(isKo ? "주의사항:" : "Cautions:");
        co.cautions.forEach(c => lines.push(`  - ${c}`));
        lines.push("");
    }

    // 인사이트
    const oii = output.localizedInsight;
    if (oii) {
        lines.push(`═══ ${isKo ? "인사이트" : "Insight"} ═══`);
        if (oii.observation) lines.push(`${isKo ? "관찰" : "Observation"}: ${oii.observation}`);
        if (oii.insight) lines.push(`${isKo ? "인사이트" : "Insight"}: ${oii.insight}`);
        if (oii.implication) lines.push(`${isKo ? "함의" : "Implication"}: ${oii.implication}`);
    }

    return lines.join("\n");
}

function buildPlainTextReport(payload) {
    const lines = [];
    lines.push(payload.title || "");
    lines.push("");
    lines.push(payload.summary || "");
    lines.push("");
    if (payload.detailedScenario) {
        lines.push(currentLocale === "ko" ? "[ 상세 시나리오 ]" : "[ Detailed Scenario ]");
        lines.push(`Target: ${payload.detailedScenario.targetCustomer || ""}`);
        lines.push(payload.detailedScenario.appliedServices || "");
        (payload.detailedScenario.cases || []).forEach((c) => {
            lines.push("");
            lines.push(c.title);
            lines.push(...c.paragraphs);
        });
    }
    lines.push("");
    if (payload.facts) {
        lines.push(currentLocale === "ko" ? "[ 데이터 근거 ]" : "[ Data Grounds ]");
        (payload.facts.confirmed || []).forEach((f) => {
            lines.push(`[${f.no}] ${f.fact} | ${f.source} | ${f.confidence}`);
        });
        if (payload.facts.assumptions?.length) {
            lines.push("");
            lines.push(currentLocale === "ko" ? "가정 사항:" : "Assumptions:");
            payload.facts.assumptions.forEach((a) => lines.push(`- ${a}`));
        }
    }
    if (payload.marketingMessages) {
        lines.push("");
        lines.push(currentLocale === "ko" ? "[ 마케팅 메시지 ]" : "[ Marketing Messages ]");
        flattenMarketingMessages(payload.marketingMessages).forEach((m) => lines.push(`- ${m}`));
    }
    return lines.join("\n");
}

function buildExportHtml(payload) {
    const md = buildMarkdownReport(payload);
    const bodyHtml = markdownToHtml(md);
    return `<!DOCTYPE html>
<html lang="${currentLocale}">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(payload.title || "Scenario Report")}</title>
<style>
body { font-family: "Segoe UI", Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 24px; color: #1a1a1a; line-height: 1.7; word-break: keep-all; }
h1 { font-size: 1.6rem; border-bottom: 2px solid #003366; padding-bottom: 8px; }
h2 { font-size: 1.2rem; margin-top: 28px; color: #003366; }
h3 { font-size: 1rem; margin-top: 20px; }
table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 0.9rem; }
th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
th { background: #f0f4f8; font-weight: 600; }
ul { padding-left: 20px; }
li { margin-bottom: 4px; }
@media print { body { margin: 0; } }
</style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

function exportPdf() {
    const html = latestStructuredOutput
        ? buildStructuredExportHtml(latestStructuredOutput)
        : buildExportHtml(latestPayload);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); }, 400);
}

function exportWord() {
    const html = latestStructuredOutput
        ? buildStructuredExportHtml(latestStructuredOutput)
        : buildExportHtml(latestPayload);
    const wordHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]--></head>
<body>${html.replace(/.*<body>/s, "").replace(/<\/body>.*/s, "")}</body></html>`;
    const blob = new Blob(["\ufeff", wordHtml], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scenario-report-${Date.now()}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function exportExcel() {
    // 구조화 output이면 구조화 CSV 생성
    if (latestStructuredOutput) {
        exportStructuredExcel(latestStructuredOutput);
        return;
    }
    const payload = latestPayload;
    const rows = [];

    rows.push(["Section", "Item", "Detail", "Source", "Confidence", "Impact"]);

    rows.push(["Title", payload.title || "", "", "", "", ""]);
    rows.push(["Summary", payload.summary || "", "", "", "", ""]);
    rows.push(["", "", "", "", "", ""]);

    if (payload.detailedScenario) {
        rows.push(["Target Customer", payload.detailedScenario.targetCustomer || "", "", "", "", ""]);
        (payload.detailedScenario.cases || []).forEach((c) => {
            rows.push(["Scenario", c.title, c.paragraphs.join(" "), "", "", ""]);
        });
        rows.push(["", "", "", "", "", ""]);
    }

    if (payload.facts?.confirmed?.length) {
        rows.push(["Fact Table", "", "", "", "", ""]);
        payload.facts.confirmed.forEach((f) => {
            rows.push(["Fact", `[${f.no}] ${f.fact}`, "", f.source || "", f.confidence || "", f.impact || ""]);
        });
        rows.push(["", "", "", "", "", ""]);
    }

    if (payload.facts?.assumptions?.length) {
        rows.push(["Assumptions", "", "", "", "", ""]);
        payload.facts.assumptions.forEach((a) => {
            rows.push(["Assumption", a, "", "", "", ""]);
        });
        rows.push(["", "", "", "", "", ""]);
    }

    if (payload.facts?.readiness?.length) {
        rows.push(["Readiness Sync", "", "", "", "", ""]);
        payload.facts.readiness.forEach((r) => {
            rows.push(["Readiness", r.label || "", r.status || "", r.note || "", "", ""]);
        });
        rows.push(["", "", "", "", "", ""]);
    }

    if (payload.marketingMessages) {
        rows.push(["Marketing Messages", "", "", "", "", ""]);
        flattenMarketingMessages(payload.marketingMessages).forEach((m) => {
            rows.push(["Message", m, "", "", "", ""]);
        });
    }

    const escCell = (v) => {
        const s = String(v || "").replace(/"/g, '""');
        return s.includes(",") || s.includes("\n") || s.includes('"') ? `"${s}"` : s;
    };
    const csv = rows.map((row) => row.map(escCell).join(",")).join("\r\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scenario-data-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function buildStructuredExportHtml(output) {
    const isKo = (output.locale || "ko") === "ko";
    const tx = output.transformation || {};
    const mo = tx.marketerOutput || {};
    const co = tx.consumerOutput || {};
    const sel = output.selection || {};
    const primary = (sel.selectedScenarios || []).find(s => s.isPrimary) || (sel.selectedScenarios || [])[0];
    const values = (sel.primaryValues || []).join(", ");
    const oii = output.localizedInsight;

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>body{font-family:'Pretendard',sans-serif;max-width:800px;margin:40px auto;color:#222;line-height:1.7}
h1{background:#003366;color:#fff;padding:16px 24px;border-radius:10px;font-size:1.2rem}
h2{color:#003366;border-bottom:2px solid #003366;padding-bottom:6px;font-size:1rem;margin-top:28px}
h3{color:#003366;font-size:0.9rem;margin-top:20px}
.badge{display:inline-block;background:#003366;color:#fff;padding:2px 12px;border-radius:20px;font-size:0.75rem;margin-right:6px}
.card{background:#f8f9fb;border:1px solid #e4e8ee;border-radius:10px;padding:14px;margin:8px 0}
table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:0.85rem}th{background:#003366;color:#fff}
.source{font-size:0.75rem;color:#889;margin-top:20px}
@media print{body{margin:20px}}</style></head><body>
${primary ? `<div style="margin-bottom:20px"><span class="badge">Explore ${primary.source}</span> <strong>${escapeHtml(primary.title)}</strong><br><small>${escapeHtml(primary.articleTitle || "")}</small>${values ? `<br><span class="badge">${escapeHtml(values)}</span>` : ""}</div>` : ""}
${sel.selectionReason ? `<div class="card"><strong>${isKo ? "선택 이유" : "Selection Reason"}</strong><p>${escapeHtml(sel.selectionReason)}</p></div>` : ""}
<h1>${escapeHtml(mo.headline || "")}</h1>
<p>${escapeHtml(mo.summary || "")}</p>
${mo.whyThisScenario ? `<h2>${isKo ? "왜 이 시나리오인가" : "Why This Scenario"}</h2><p>${escapeHtml(mo.whyThisScenario)}</p>` : ""}
${(mo.copyOptions || []).length ? `<h2>${isKo ? "카피 옵션" : "Copy Options"}</h2>${(mo.copyOptions || []).map((c, i) => `<div class="card"><strong>${isKo ? "옵션" : "Option"} ${i + 1}</strong><br>KR: ${escapeHtml(c.ko || "")}<br>EN: ${escapeHtml(c.en || "")}${c.tone ? `<br><small>${escapeHtml(c.tone)}</small>` : ""}</div>`).join("")}` : ""}
${(mo.channelStrategy || []).length ? `<h2>${isKo ? "채널 전략" : "Channel Strategy"}</h2><table><tr><th>${isKo ? "채널" : "Channel"}</th><th>${isKo ? "메시지" : "Message"}</th><th>${isKo ? "톤" : "Tone"}</th><th>${isKo ? "포맷" : "Format"}</th></tr>${(mo.channelStrategy || []).map(ch => `<tr><td>${escapeHtml(ch.channel || "")}</td><td>${escapeHtml(ch.message || "")}</td><td>${escapeHtml(ch.tone || "")}</td><td>${escapeHtml(ch.format || "")}</td></tr>`).join("")}</table>` : ""}
<h1>${escapeHtml(co.headline || "")}</h1>
${co.whatItDoes ? `<p>${escapeHtml(co.whatItDoes)}</p>` : ""}
${(co.requiredSetup?.devices || []).length ? `<h2>${isKo ? "필요 기기" : "Required Devices"}</h2><table><tr><th>${isKo ? "기기" : "Device"}</th><th>${isKo ? "역할" : "Role"}</th><th>${isKo ? "필수" : "Required"}</th></tr>${co.requiredSetup.devices.map(d => `<tr><td>${escapeHtml(d.name || "")}</td><td>${escapeHtml(d.role || "")}</td><td>${d.required !== false ? "O" : "-"}</td></tr>`).join("")}</table>` : ""}
${(co.setupSteps || []).length ? `<h2>${isKo ? "설정 방법" : "Setup Steps"}</h2><ol>${co.setupSteps.map(s => `<li>${escapeHtml(String(s))}</li>`).join("")}</ol>` : ""}
${(co.cautions || []).length ? `<h2>${isKo ? "주의사항" : "Cautions"}</h2><ul>${co.cautions.map(c => `<li>${escapeHtml(String(c))}</li>`).join("")}</ul>` : ""}
${oii ? `<h2>${isKo ? "인사이트" : "Insight"}</h2><p><strong>${isKo ? "관찰" : "Obs"}:</strong> ${escapeHtml(oii.observation || "")}<br><strong>${isKo ? "인사이트" : "Insight"}:</strong> ${escapeHtml(oii.insight || "")}<br><strong>${isKo ? "함의" : "Impl"}:</strong> ${escapeHtml(oii.implication || "")}</p>` : ""}
<div class="source">${escapeHtml(typeof tx.sourceTrace === "string" ? tx.sourceTrace : "")} | ${output.generationMode || "ai"} | ${output.generatedAt || ""}</div>
</body></html>`;
}

function exportStructuredExcel(output) {
    const tx = output.transformation || {};
    const mo = tx.marketerOutput || {};
    const co = tx.consumerOutput || {};
    const sel = output.selection || {};
    const isKo = (output.locale || "ko") === "ko";
    const rows = [];

    rows.push(["Section", "Item", "KO", "EN", "Tone", "Note"]);

    // 선택 근거
    const primary = (sel.selectedScenarios || []).find(s => s.isPrimary) || (sel.selectedScenarios || [])[0];
    if (primary) {
        rows.push(["Selection", "Scenario", primary.title, primary.source, "", primary.articleTitle || ""]);
        rows.push(["Selection", "Reason", sel.selectionReason || "", "", "", ""]);
        rows.push(["Selection", "Values", (sel.primaryValues || []).join(", "), "", "", ""]);
    }
    rows.push(["", "", "", "", "", ""]);

    // 마케터
    rows.push(["Marketer", "Headline", mo.headline || "", "", "", ""]);
    rows.push(["Marketer", "Summary", mo.summary || "", "", "", ""]);
    rows.push(["Marketer", "Why", mo.whyThisScenario || "", "", "", ""]);
    (mo.copyOptions || []).forEach((c, i) => {
        rows.push(["Copy", `Option ${i + 1}`, c.ko || "", c.en || "", c.tone || "", ""]);
    });
    (mo.channelStrategy || []).forEach(ch => {
        rows.push(["Channel", ch.channel || "", ch.message || "", "", ch.tone || "", ch.format || ""]);
    });
    rows.push(["", "", "", "", "", ""]);

    // 사용자
    rows.push(["Consumer", "Headline", co.headline || "", "", "", ""]);
    rows.push(["Consumer", "What it does", co.whatItDoes || "", "", "", ""]);
    (co.requiredSetup?.devices || []).forEach(d => {
        rows.push(["Device", d.name || "", d.role || "", "", "", d.required !== false ? "Required" : "Optional"]);
    });
    (co.setupSteps || []).forEach((s, i) => {
        rows.push(["Setup", `Step ${i + 1}`, String(s), "", "", ""]);
    });
    (co.cautions || []).forEach(c => {
        rows.push(["Caution", "", String(c), "", "", ""]);
    });

    const escCell = (v) => {
        const s = String(v || "").replace(/"/g, '""');
        return s.includes(",") || s.includes("\n") || s.includes('"') ? `"${s}"` : s;
    };
    const csv = rows.map((row) => row.map(escCell).join(",")).join("\r\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scenario-structured-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function buildMarkdownReport(payload) {
    const marketingLines = flattenMarketingMessages(payload.marketingMessages);
    return [
        `# ${payload.title}`,
        "",
        currentLocale === "ko" ? "## 01. CX 시나리오 제목 및 Summary" : "## 01. CX Scenario Title & Summary",
        payload.summary,
        "",
        "### 1) Parent Story",
        buildParentStory(payload),
        "",
        currentLocale === "ko" ? "### 2) 4대 가치 반영" : "### 2) Reflected Four Values",
        ...buildReflectedValues(payload).map((item) => `- ${item}`),
        "",
        currentLocale === "ko" ? "### 3) 핵심 요약 (6줄)" : "### 3) Executive Summary (6 lines)",
        ...buildSixLineSummary(payload).map((item) => `- ${item}`),
        "",
        currentLocale === "ko" ? "## 02. 상세 시나리오" : "## 02. Detailed Scenario",
        "----",
        `- Target Customer : ${payload.detailedScenario.targetCustomer}`,
        "----",
        "",
        payload.detailedScenario.appliedServices,
        "",
        ...payload.detailedScenario.cases.flatMap((item) => [
            `### ${item.title}`,
            "",
            ...item.paragraphs,
            ""
        ]),
        "",
        currentLocale === "ko" ? "## 03. 지역 특성 및 데이터 근거" : "## 03. Regional Traits & Data Grounds",
        currentLocale === "ko" ? "### Fact (확인)" : "### Fact (Confirmed)",
        ...(payload.facts.confirmed || []).map((item) => `- [${item.no}] ${item.fact} | ${item.source} | ${item.confidence} | ${item.impact}`),
        "",
        currentLocale === "ko" ? "### Assumption (가정)" : "### Assumption",
        ...(payload.facts.assumptions || []).map((item) => `- ${item}`),
        "",
        currentLocale === "ko" ? "### Readiness Sync" : "### Readiness Sync",
        ...(payload.facts.readiness || []).map((item) => `- ${item.label}: ${item.status} / ${item.note}`),
        "",
        currentLocale === "ko" ? "### Observation / Insight / Implication" : "### Observation / Insight / Implication",
        `- Observation: ${payload.facts.observation || ""}`,
        `- Insight: ${payload.facts.insight || ""}`,
        `- Implication: ${payload.facts.implication || ""}`,
        "",
        currentLocale === "ko" ? "### 내부 참조 파일" : "### Internal Source Files",
        ...(payload.facts.sourceRefs || []).map((item) => `- ${item}`),
        "",
        currentLocale === "ko"
            ? "## 04. 마케팅 메시지 (브랜드 아이덴티티 반영)"
            : currentLocale === "de"
                ? "## 04. Marketing-Botschaften (Brand-Identity Applied)"
                : "## 04. Marketing Message (Brand-Identity Applied)",
        ...marketingLines.map((item) => `- ${item}`)
    ].join("\n");
}

function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function updateLocaleFromCountry() {
    const preserved = {
        role: roleSelect.value,
        country: countrySelect.value,
        city: "",                          // 국가 변경 시 도시 초기화
        personaSelections: getSelectedPersonaOptionIds(),
        segmentCustom: segmentCustomInput.value,
        deviceSelections: getSelectedDeviceOptionIds(),
        deviceCustom: deviceCustomInput.value
    };
    const countryCode = countrySelect.value;
    const countryLocale = countryCode ? (COUNTRY_LOCALES[countryCode] || null) : null;
    currentLocale = resolveEffectiveLocale(countryLocale);
    document.documentElement.lang = currentLocale;
    document.documentElement.dir = currentLocale === "ar" ? "rtl" : "ltr";
    populateInputs(preserved);
    if (!marketOptions.some((market) => market.siteCode === countrySelect.value)) {
        countrySelect.value = marketOptions[0]?.siteCode || "";
    }
    updateRoleBrief();
    renderWizardProgress();
    updateStepInsight();
    applyLocale();
    updateEnglishToggleVisibility();
    // Q3 카탈로그를 새 locale 기준으로 재적용 + 재렌더
    q4ActivePresets.clear();
    renderQ4Composer();
}

function getRoleCardLocaleCopy(roleId) {
    const locale = currentLocale === "ko" ? "ko" : currentLocale === "de" ? "de" : "en";
    const copy = {
        retail: {
            title: { ko: "Retailer", en: "Retailer", de: "Retail" },
            mantra: {
                ko: "\"Make it Real, Make it Easy\"",
                en: "\"Make it Real, Make it Easy\"",
                de: "\"Make it Real, Make it Easy\""
            },
            desc: {
                ko: "매장 직원이 고객의 \"그래서 이게 나한테 뭐가 좋은데?\"라는 질문에 답하고, 기술을 즉각적인 가치로 전환해 판매를 마무리하도록 돕습니다.",
                en: "Help store staff answer \"What does this do for me?\" and turn technology into immediate customer value at closing.",
                de: "Hilft dem Store-Team, die Frage \"Was bringt mir das konkret?\" zu beantworten und Technik in sofort erlebbaren Nutzen zu übersetzen."
            },
            hoverDetails: {
                ko: [
                    "복잡한 스펙 대신, 고객의 실제 생활에 맞는 시연 흐름을 만들어 보세요.",
                    "\"이런 상황에선 이렇게 쓰세요\" 같은 명확한 장면을 보여주면 가치가 바로 와닿습니다.",
                    "매장 미팅 전날이라도, 몇 분 안에 설득력 있는 응대 시나리오를 완성할 수 있습니다."
                ],
                en: [
                    "Instead of complex specs, build a demo flow that fits how the customer actually lives.",
                    "Show clear moments like \"In this situation, use it this way\" so the value lands immediately.",
                    "Even the day before a store meeting, you can shape a convincing response scenario in minutes."
                ],
                de: [
                    "Statt komplexer Spezifikationen einen Demo-Ablauf bauen, der zum Alltag des Kunden passt.",
                    "Klare Momente wie 'In dieser Situation so nutzen' zeigen, damit der Mehrwert sofort ankommt.",
                    "Selbst am Vorabend eines Store-Meetings ein überzeugendes Szenario in Minuten erstellen."
                ]
            }
        },
        dotcom: {
            title: { ko: "Dotcom", en: "Dotcom", de: "Dotcom" },
            mantra: {
                ko: "\"Guide the Journey, Prove the ROI\"",
                en: "\"Guide the Journey, Prove the ROI\"",
                de: "\"Guide the Journey, Prove the ROI\""
            },
            desc: {
                ko: "웹사이트 방문자를 충성 고객으로 전환하는 데이터 기반 온라인 여정을 설계하고, 각 단계 성과를 측정하고 증명하는 데 집중합니다.",
                en: "Design a data-driven online journey that turns visitors into loyal customers and prove impact at each conversion stage.",
                de: "Entwirft eine datenbasierte Online-Journey, die Besuchende zu loyalen Kunden macht, und belegt die Wirkung je Funnel-Stufe."
            },
            hoverDetails: {
                ko: [
                    "검색 의도부터 전환까지, 데이터 기반의 온라인 여정을 더 날카롭게 설계하세요.",
                    "A/B 테스트 카피부터 랜딩 구성까지, 측정 가능한 성과에 집중한 콘텐츠를 만듭니다.",
                    "빈 페이지 앞에서 고민하는 시간을 줄이고, 바로 쓸 수 있는 초안부터 시작하세요."
                ],
                en: [
                    "Map the online journey from search intent to conversion with a sharper, data-backed structure.",
                    "From A/B test copy to landing-page composition, focus the content on measurable performance.",
                    "Spend less time staring at a blank page and start from a draft that is already usable."
                ],
                de: [
                    "Die Online-Journey von Suchintention bis Conversion datengestützt und präziser gestalten.",
                    "Vom A/B-Test-Text bis zur Landing-Page: Inhalte auf messbare Performance ausrichten.",
                    "Weniger Zeit vor der leeren Seite verbringen — mit einem sofort nutzbaren Entwurf starten."
                ]
            }
        },
        brand: {
            title: { ko: "Brand", en: "Brand", de: "Brand" },
            mantra: {
                ko: "\"Build the Love, Tell the Story\"",
                en: "\"Build the Love, Tell the Story\"",
                de: "\"Build the Love, Tell the Story\""
            },
            desc: {
                ko: "제품 기능보다 브랜드 철학과 스토리로 감성적 유대를 만들고, 사용자를 브랜드 팬으로 전환하는 큰 그림을 설계합니다.",
                en: "Build emotional connection through brand philosophy and story, not feature lists, and grow long-term brand love.",
                de: "Baut emotionale Bindung über Markenphilosophie und Story statt Feature-Listen auf und stärkt langfristige Markenpräferenz."
            },
            hoverDetails: {
                ko: [
                    "제품 스펙을 반복하는 대신, 고객의 일상에 자연스럽게 녹아드는 브랜드 스토리를 만드세요.",
                    "광고 슬로건부터 캠페인 컨셉까지, 호감과 기억에 남는 메시지 방향을 잡아줍니다.",
                    "기능 나열을 넘어, 감성적 출발점이 되는 한 줄을 찾아보세요."
                ],
                en: [
                    "Build a brand story that blends into the customer's life instead of repeating product specs.",
                    "From ad slogans to campaign concepts, shape message directions that grow affinity and recall.",
                    "Move beyond feature lists and find the one line that creates an emotional starting point."
                ],
                de: [
                    "Eine Markengeschichte aufbauen, die sich in den Alltag der Kunden einfügt, statt Produktdaten zu wiederholen.",
                    "Vom Werbeslogan bis zum Kampagnenkonzept: Botschaftsrichtungen formen, die Sympathie und Erinnerung stärken.",
                    "Über Feature-Listen hinausgehen und den einen Satz finden, der einen emotionalen Einstieg schafft."
                ]
            }
        }
    }[roleId];

    if (!copy) return null;
    return {
        title: copy.title[locale] || copy.title.en,
        mantra: copy.mantra[locale] || copy.mantra.en,
        desc: copy.desc[locale] || copy.desc.en,
        hoverDetails: copy.hoverDetails?.[locale] || copy.hoverDetails?.en || []
    };
}

function syncRoleCardLocale() {
    roleCards.forEach((card) => {
        const roleId = normalizeRoleId(card.dataset.role);
        const copy = getRoleCardLocaleCopy(roleId);
        if (!copy) return;

        const title = card.querySelector("h3");
        const mantra = card.querySelector(".role-mantra");
        const desc = card.querySelector(".role-desc");
        const hoverDetail = card.querySelector(".role-hover-detail");
        if (title) title.textContent = copy.title;
        if (mantra) mantra.textContent = copy.mantra;
        if (desc) desc.textContent = copy.desc;
        if (hoverDetail && copy.hoverDetails.length) {
            hoverDetail.innerHTML = copy.hoverDetails.map(line => `<p>${line}</p>`).join("");
        }
    });
}

function applyLocale() {
    const stepPanels = document.querySelectorAll(".wizard-step");
    const deviceLabel = stepPanels[3]?.querySelector("label");
    const heroChips = document.querySelectorAll(".hero-chip");
    const heroFlowLabels = document.querySelectorAll(".hero-flow-label");

    document.querySelector(".eyebrow").textContent = t("heroEyebrow");
    document.querySelector(".hero-text").innerHTML = escapeHtml(t("heroText")).replace(/\n/g, "<br>");
    if (heroChips[0]) heroChips[0].textContent = t("heroChip1");
    if (heroChips[1]) heroChips[1].textContent = t("heroChip2");
    if (heroChips[2]) heroChips[2].textContent = t("heroChip3");
    if (heroFlowLabels[0]) heroFlowLabels[0].textContent = t("heroFlow1");
    if (heroFlowLabels[1]) heroFlowLabels[1].textContent = t("heroFlow2");
    if (heroFlowLabels[2]) heroFlowLabels[2].textContent = t("heroFlow3");
    if (heroFlowLabels[3]) heroFlowLabels[3].textContent = t("heroFlow4");
    // Access card V2 — safe selectors
    const accessTitle = document.querySelector(".access-v2-title");
    const accessSubtitle = document.querySelector(".access-v2-subtitle");
    const accessNote = document.querySelector(".access-v2-note");
    if (accessTitle) accessTitle.textContent = t("getStarted");
    if (accessSubtitle) accessSubtitle.textContent = t("accessRequired").replace(".", "");
    accessCodeInput.placeholder = t("accessPlaceholder");
    if (accessNote) accessNote.textContent = t("accessHelper");
    accessToggleBtn.textContent = t(isAccessCodeVisible ? "accessHide" : "accessShow");
    accessToggleBtn.setAttribute("aria-pressed", isAccessCodeVisible ? "true" : "false");
    unlockBtn.textContent = t("enterAgent");
    logoutBtn.textContent = t("logout");
    wizardLogoutBtn.textContent = t("logout");
    if (accessStatus.dataset.key) {
        accessStatus.textContent = accessStatus.dataset.key === "accessLockedWithTime" && accessLockoutEndsAt > Date.now()
            ? formatLockoutMessage(Math.ceil((accessLockoutEndsAt - Date.now()) / 1000))
            : t(accessStatus.dataset.key);
    }
    document.querySelector("#guide-screen h2").textContent = t("guideTitle");
    guideYesBtn.textContent = t("guideYes");
    guideNoBtn.textContent = t("guideNo");
    if (guideContinueBtn) guideContinueBtn.textContent = t("guideStart");
    const guideSessionNote = document.querySelector(".guide-session-note");
    if (guideSessionNote) guideSessionNote.textContent = t("guideSessionNote");
    if (!guideCopy.classList.contains("hidden")) {
        guideCopy.innerHTML = buildGuideMarkup();
    }
    const roleQuestionLabel = document.querySelector('.wizard-step[data-step="1"] .field > label');
    if (roleQuestionLabel) roleQuestionLabel.textContent = t("roleQuestion");
    syncRoleCardLocale();
    document.querySelector("label[for='country']").textContent = t("countryQuestion");
    document.getElementById("segment-label").textContent = t("personaQuestion");
    const q3Guide = document.getElementById("q3-guide");
    if (q3Guide) q3Guide.textContent = t("q3Guide");
    if (deviceLabel) deviceLabel.textContent = t("deviceQuestion");
    purposeInput.placeholder = t("purposeExtraPlaceholder");
    segmentCustomInput.placeholder = "";
    deviceCustomInput.placeholder = t("deviceCustomPlaceholder");
    citySearchInput.placeholder = currentLocale === "ko" ? "도시 검색 또는 입력"
        : currentLocale === "de" ? "Stadt suchen oder eingeben"
        : "Search or type a city";
    updateQuestionHelpers();
    prevBtn.textContent = t("prev");
    nextBtn.textContent = t("next");
    generateBtn.textContent = t("build");
    if (!latestPayload) renderOutputPreview();
    document.querySelector(".report-head h2").textContent = t("output");
    renderExportActions();
    // Q3/Q4 자동 버튼 및 섹션 제목 로케일 교체
    const q3AutoText = document.querySelector(".q3-auto-text");
    if (q3AutoText) q3AutoText.textContent = t("q3AutoBtn");
    const q4AutoText = document.querySelector(".q4-auto-text");
    if (q4AutoText) q4AutoText.textContent = t("q4AutoBtn");
    const q4PresetHead = document.querySelector(".q4-presets .q4-section-head h3");
    if (q4PresetHead) q4PresetHead.textContent = t("q4PresetTitle");
    const q4DirectHead = document.querySelector(".q4-card:not(.q4-presets) .q4-section-head h3");
    if (q4DirectHead) q4DirectHead.textContent = t("q4DirectTitle");
    const q4DetailSum = document.querySelector(".q4-details summary");
    if (q4DetailSum) q4DetailSum.textContent = t("q4DetailSummary");
    const q4SummaryHead = document.querySelector(".q4-summary-card .q4-section-head h3");
    if (q4SummaryHead) q4SummaryHead.textContent = t("q4SummaryTitle");
    updateEnglishToggleVisibility();
}

const LOCALE_NATIVE_NAMES = {
    ko: "한국어", en: "English", de: "Deutsch", fr: "Français", es: "Español",
    pt: "Português", it: "Italiano", nl: "Nederlands", ar: "العربية"
};

function updateEnglishToggleVisibility() {
    const btn = document.getElementById("locale-current-btn");
    if (!btn) return;
    btn.textContent = LOCALE_NATIVE_NAMES[currentLocale] || currentLocale;
    closeLocaleDropdown();
}

function initLocaleSelector() {
    const btn = document.getElementById("locale-current-btn");
    const dropdown = document.getElementById("locale-dropdown");
    if (!btn || !dropdown) return;

    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = !dropdown.classList.contains("hidden");
        if (isOpen) {
            closeLocaleDropdown();
        } else {
            openLocaleDropdown();
        }
    });

    document.addEventListener("click", () => closeLocaleDropdown());
    dropdown.addEventListener("click", (e) => e.stopPropagation());
}

function openLocaleDropdown() {
    const dropdown = document.getElementById("locale-dropdown");
    if (!dropdown) return;
    dropdown.innerHTML = SUPPORTED_UI_LOCALES.map((loc) =>
        `<li data-locale="${loc}" class="${loc === currentLocale ? "active" : ""}">${LOCALE_NATIVE_NAMES[loc] || loc}</li>`
    ).join("");
    dropdown.querySelectorAll("li").forEach((li) => {
        li.addEventListener("click", () => {
            switchToLocale(li.dataset.locale);
            closeLocaleDropdown();
        });
    });
    dropdown.classList.remove("hidden");
}

function closeLocaleDropdown() {
    const dropdown = document.getElementById("locale-dropdown");
    if (dropdown) dropdown.classList.add("hidden");
}

function switchToLocale(locale) {
    if (locale === currentLocale) return;
    const nativeLocale = getNativeLocale();
    userOverrideLocale = (locale === nativeLocale) ? null : locale;
    currentLocale = locale;
    document.documentElement.lang = currentLocale;
    document.documentElement.dir = currentLocale === "ar" ? "rtl" : "ltr";
    const preserved = {
        role: roleSelect.value,
        country: countrySelect.value,
        city: getCityValue(),
        personaSelections: getSelectedPersonaOptionIds(),
        segmentCustom: segmentCustomInput.value,
        deviceSelections: getSelectedDeviceOptionIds(),
        deviceCustom: deviceCustomInput.value
    };
    populateInputs(preserved);
    updateRoleBrief();
    renderWizardProgress();
    updateStepInsight();
    applyLocale();
}

function getNativeLocale() {
    const countryCode = countrySelect?.value;
    const cl = countryCode ? (COUNTRY_LOCALES[countryCode] || null) : null;
    if (cl && SUPPORTED_UI_LOCALES.includes(cl)) return cl;
    return detectBrowserLocale();
}

function renderExportActions() {
    const labels = {
        pdf:   { title: t("exportPdf"),   desc: t("exportPdfDesc") },
        word:  { title: t("exportWord"),  desc: t("exportWordDesc") },
        excel: { title: t("exportExcel"), desc: t("exportExcelDesc") },
        copy:  { title: t("exportCopy"),  desc: t("exportCopyDesc") }
    };
    const types = ["pdf", "word", "excel", "copy"];
    exportActions.innerHTML = types.map((type, index) => `
        <button type="button" class="action-btn export-tile" data-export="${type}">
            <span class="export-tile-index">${String(index + 1).padStart(2, "0")}</span>
            <strong>${escapeHtml(labels[type].title)}</strong>
            <span>${escapeHtml(labels[type].desc)}</span>
        </button>
    `).join("");
    exportActions.querySelectorAll(".action-btn").forEach((button) => {
        button.addEventListener("click", () => handleExport(button.dataset.export));
    });
}

function t(key) {
    return UI_TEXT[currentLocale]?.[key] || UI_TEXT.en?.[key] || UI_TEXT.ko?.[key] || key;
}

function getUiPhrase(key) {
    return t(key);
}

function getCountryName(code) {
    const normalized = normalizeSiteCode(code);
    const sourceEntry = (sourceData?.countries || []).find((item) => item.countryCode === normalized);
    const staticMap = {
        KR: { ko: "대한민국", en: "South Korea", de: "Südkorea" },
        US: { ko: "미국", en: "United States", de: "Vereinigte Staaten" },
        GB: { ko: "영국", en: "United Kingdom", de: "Vereinigtes Königreich" },
        DE: { ko: "독일", en: "Germany", de: "Deutschland" },
        TR: { ko: "튀르키예", en: "Turkiye", de: "Türkei" },
        RU: { ko: "러시아", en: "Russian Federation", de: "Russische Föderation" },
        IN: { ko: "인도", en: "India", de: "Indien" },
        JP: { ko: "일본", en: "Japan", de: "Japan" },
        CN: { ko: "중국", en: "China", de: "China" },
        HK: { ko: "홍콩", en: "Hong Kong", de: "Hongkong" },
        TW: { ko: "대만", en: "Taiwan", de: "Taiwan" }
    };
    const mapped = staticMap[normalized];
    if (mapped) return mapped[currentLocale] || mapped.en || mapped.ko;
    if (sourceEntry) {
        if (currentLocale === "ko") return sourceEntry.countryName || sourceEntry.countryNameEnglish || normalized;
        return sourceEntry.countryNameEnglish || sourceEntry.countryName || normalized;
    }
    const market = DOTCOM_MARKETS.find((entry) => entry[1] === code) || DOTCOM_MARKETS.find((entry) => normalizeSiteCode(entry[1]) === normalized);
    return market?.[0] || normalized;
}

const Q2_COUNTRY_PRIORITY = [
    "KR", "US", "BR", "IN", "DE", "GB", "MX", "IT", "FR", "CA", "ES", "NL", "PL", "AU", "TR", "CO", "ID", "RU"
];

const Q2_COUNTRY_PRIORITY_INDEX = Q2_COUNTRY_PRIORITY.reduce((acc, code, index) => {
    acc[code] = index;
    return acc;
}, {});

function getMarketSortName(market) {
    const country = resolveCountry(market);
    if (country?.countryNameEnglish) return country.countryNameEnglish;

    const fallbackNames = {
        UK: "United Kingdom",
        GB: "United Kingdom",
        KR: "South Korea",
        US: "United States",
        BR: "Brazil",
        IN: "India",
        DE: "Germany",
        MX: "Mexico",
        IT: "Italy",
        FR: "France",
        CA: "Canada",
        ES: "Spain",
        NL: "Netherlands",
        PL: "Poland",
        AU: "Australia",
        TR: "Turkiye",
        CO: "Colombia",
        ID: "Indonesia",
        RU: "Russian Federation"
    };

    return fallbackNames[market.siteCode] || fallbackNames[market.baseCode] || market.countryName || market.label || market.siteCode;
}

function buildMarketOptions() {
    const unique = new Map();
    for (const [countryName, siteCode, language] of DOTCOM_MARKETS) {
        if (!unique.has(siteCode)) {
            unique.set(siteCode, {
                siteCode,
                countryName,
                language,
                baseCode: normalizeSiteCode(siteCode),
                label: `${localizeCountryLabel(countryName, siteCode)}`
            });
        }
    }
    // SEC(samsung.com/sec)가 이미 KR로 해석되므로 중복 KR 추가 불필요
    // SEC도 없는 경우에만 fallback
    const hasKrVariant = [...unique.values()].some(m => normalizeSiteCode(m.siteCode) === "KR");
    if (!hasKrVariant) {
        unique.set("KR", {
            siteCode: "KR",
            countryName: "Korea",
            language: "Korean",
            baseCode: "KR",
            label: localizeCountryLabel("Korea", "KR")
        });
    }
    return [...unique.values()].sort((a, b) => {
        const aPriority = Q2_COUNTRY_PRIORITY_INDEX[a.baseCode] ?? Number.POSITIVE_INFINITY;
        const bPriority = Q2_COUNTRY_PRIORITY_INDEX[b.baseCode] ?? Number.POSITIVE_INFINITY;

        if (aPriority !== bPriority) return aPriority - bPriority;

        if (a.baseCode === b.baseCode && a.siteCode !== b.siteCode) {
            if (a.siteCode === a.baseCode) return -1;
            if (b.siteCode === b.baseCode) return 1;
        }

        const nameCompare = getMarketSortName(a).localeCompare(getMarketSortName(b), "en", { sensitivity: "base" });
        if (nameCompare !== 0) return nameCompare;

        return a.label.localeCompare(b.label, "en", { sensitivity: "base" });
    });
}

function normalizeSiteCode(siteCode) {
    const aliases = {
        UK: "GB",
        LATIN: "PA",
        LATIN_EN: "PA",
        AE_AR: "AE",
        CA_FR: "CA",
        BE_FR: "BE",
        CH_FR: "CH",
        SEC: "KR",
        LEVANT_AR: "LEVANT",
        IQ_AR: "IQ",
        IQ_KU: "IQ",
        SA_EN: "SA",
        KZ_RU: "KZ",
        KZ_KZ: "KZ",
        UZ_UZ: "UZ",
        UZ_RU: "UZ",
        HK_EN: "HK"
    };
    return aliases[siteCode] || siteCode;
}

function localizeCountryLabel(countryName, siteCode) {
    const bySite = {
        KR: { ko: "대한민국 (KR)", en: "South Korea (KR)", de: "Südkorea (KR)" },
        SEC: { ko: "대한민국 (KR)", en: "South Korea (KR)", de: "Südkorea (KR)" },
        US: { ko: "미국 (US)", en: "United States (US)", de: "Vereinigte Staaten (US)" },
        UK: { ko: "영국 (UK)", en: "United Kingdom (UK)", de: "Vereinigtes Königreich (UK)" },
        DE: { ko: "독일 (DE)", en: "Germany (DE)", de: "Deutschland (DE)" },
        FR: { ko: "프랑스 (FR)", en: "France (FR)", de: "Frankreich (FR)" },
        ES: { ko: "스페인 (ES)", en: "Spain (ES)", de: "Spanien (ES)" },
        PT: { ko: "포르투갈 (PT)", en: "Portugal (PT)", de: "Portugal (PT)" },
        IT: { ko: "이탈리아 (IT)", en: "Italy (IT)", de: "Italien (IT)" },
        NL: { ko: "네덜란드 (NL)", en: "Netherlands (NL)", de: "Niederlande (NL)" },
        BE: { ko: "벨기에 (BE)", en: "Belgium (BE)", de: "Belgien (BE)" },
        BE_FR: { ko: "벨기에 프랑스어 (BE_FR)", en: "Belgium French (BE_FR)", de: "Belgien Französisch (BE_FR)" },
        CA: { ko: "캐나다 (CA)", en: "Canada (CA)", de: "Kanada (CA)" },
        CA_FR: { ko: "캐나다 프랑스어 (CA_FR)", en: "Canada French (CA_FR)", de: "Kanada Französisch (CA_FR)" },
        CH: { ko: "스위스 (CH)", en: "Switzerland (CH)", de: "Schweiz (CH)" },
        CH_FR: { ko: "스위스 프랑스어 (CH_FR)", en: "Switzerland French (CH_FR)", de: "Schweiz Französisch (CH_FR)" },
        TR: { ko: "튀르키예 (TR)", en: "Turkiye (TR)", de: "Türkei (TR)" },
        IN: { ko: "인도 (IN)", en: "India (IN)", de: "Indien (IN)" },
        RU: { ko: "러시아 (RU)", en: "Russian Federation (RU)", de: "Russische Föderation (RU)" },
        JP: { ko: "일본 (JP)", en: "Japan (JP)", de: "Japan (JP)" }
    };
    if (bySite[siteCode]) return bySite[siteCode][currentLocale] || bySite[siteCode].en;
    const normalized = normalizeSiteCode(siteCode);
    const sourceEntry = (sourceData?.countries || []).find((item) => item.countryCode === normalized);
    const localizedName = currentLocale === "ko"
        ? (sourceEntry?.countryName || countryName)
        : (sourceEntry?.countryNameEnglish || countryName);
    return `${localizedName} (${siteCode})`;
}

function resolveCountry(selectedMarket) {
    if (!selectedMarket) return null;
    const matched = sourceData.countries.find((item) => item.countryCode === selectedMarket.baseCode);
    if (matched) return matched;
    const marketInfo = getDotcomMarketInfo(selectedMarket);
    return {
        countryCode: selectedMarket.baseCode,
        countryName: selectedMarket.countryName,
        samsungShopUrl: marketInfo?.fullUrl || "",
        availableProducts: []
    };
}

function getCategoryName(name) {
    const map = {
        TV: { ko: "TV", en: "TV", de: "TV" },
        냉장고: { ko: "냉장고", en: "Refrigerator", de: "Kühlschrank" },
        세탁기: { ko: "세탁기", en: "Washer", de: "Waschmaschine" },
        건조기: { ko: "건조기", en: "Dryer", de: "Trockner" },
        에어컨: { ko: "에어컨", en: "Air Conditioner", de: "Klimaanlage" },
        오븐: { ko: "오븐", en: "Oven", de: "Backofen" },
        로봇청소기: { ko: "로봇청소기", en: "Robot Vacuum", de: "Saugroboter" },
        "세탁기/건조기": { ko: "세탁기/건조기", en: "Washer/Dryer", de: "Waschmaschine/Trockner" },
        스피커: { ko: "스피커", en: "Speaker", de: "Lautsprecher" },
        조명: { ko: "조명", en: "Lighting", de: "Beleuchtung" },
        센서: { ko: "센서", en: "Sensor", de: "Sensor" }
    };
    return map[name]?.[currentLocale] || map[name]?.en || map[name]?.ko || name;
}

function getRoleTitle(id) {
    const role = ROLE_LENSES.find((item) => item.id === id);
    const map = {
        retail: { ko: "리테일 담당자", en: "Retail Lead", de: "Retail-Verantwortliche" },
        dotcom: { ko: "닷컴 캠페인 담당자", en: "Dotcom Campaign Lead", de: "Dotcom-Kampagnenleitung" },
        brand: { ko: "브랜드 마케팅 담당자", en: "Brand Marketing Lead", de: "Brand-Marketing-Leitung" }
    };
    return map[id]?.[currentLocale] || map[id]?.en || role?.title || id;
}

function getRoleFocus(id) {
    const map = {
        retail: { ko: "매장/현장 소구 중심", en: "Store and field storytelling", de: "Store- und Vor-Ort-Storytelling" },
        dotcom: { ko: "웹/랜딩/전환 중심", en: "Web, landing, and conversion", de: "Web, Landing und Conversion" },
        brand: { ko: "브랜드 메시지/통합 캠페인 중심", en: "Brand messaging and integrated campaigns", de: "Markenbotschaft und integrierte Kampagnen" }
    };
    return map[id]?.[currentLocale] || map[id]?.en || map[id]?.ko || id;
}

function getRoleBrief(id) {
    const map = {
        retail: { ko: "고객이 매장에서 바로 이해하고 따라 하고 싶게 만드는 설명 흐름을 만듭니다.", en: "Build a story flow that customers immediately understand and want to follow in-store.", de: "Erstellen Sie einen Erklärfluss, den Kundinnen und Kunden im Store sofort verstehen und nachmachen möchten." },
        dotcom: { ko: "상품 페이지와 캠페인 페이지에서 메시지와 전환 흐름을 자연스럽게 연결합니다.", en: "Connect product-page messaging and conversion flow more naturally across campaign and landing pages.", de: "Verbinden Sie Botschaft und Conversion-Fluss auf Produkt- und Kampagnenseiten natürlicher." },
        brand: { ko: "기능보다 사용자가 느끼는 감정적 가치를 중심으로 장면을 설계합니다.", en: "Design scenes around emotional value rather than feature explanation.", de: "Gestalten Sie Szenen stärker um den emotionalen Nutzen als um Funktionsbeschreibungen." }
    };
    return map[id]?.[currentLocale] || map[id]?.en || map[id]?.ko || id;
}

function validateQ3Groups() {
    const requiredGroups = ["housing", "household", "lifestage"];
    const groupLabels = currentLocale === "ko"
        ? { housing: "A. 거주지 유형", household: "B. 세대 구성", lifestage: "C. 라이프스테이지" }
        : { housing: "A. Housing type", household: "B. Household", lifestage: "C. Life stage" };
    const missing = [];
    requiredGroups.forEach((gid) => {
        const group = personaGroups.querySelector(`.tree-group[data-group-id="${gid}"]`);
        if (!group) return;
        const hasChecked = group.querySelector('input[data-node-type="child"]:checked');
        const customInput = group.querySelector('.tree-custom-input');
        const hasCustom = customInput && customInput.value.trim();
        if (!hasChecked && !hasCustom) missing.push(groupLabels[gid] || gid);
    });
    return missing;
}

function getSelectedSegment() {
    return [...getSelectedPersonaLabels(), ...getPersonaCustomEntries()].join(" / ");
}

function getPersonaCustomEntries() {
    const entries = [];
    personaGroups.querySelectorAll('.tree-custom-input').forEach((input) => {
        const val = input.value.trim();
        if (val) entries.push(val);
    });
    const purposeVal = purposeInput.value.trim();
    if (purposeVal) entries.push(purposeVal);
    return entries;
}

function getSelectedDevices() {
    const normalized = new Set(
        [...deviceGrid.querySelectorAll('input[data-node-type="child"]:checked')]
            .map((input) => input.dataset.normalized || input.value)
            .filter(Boolean)
    );
    getCustomEntries(deviceCustomInput.value).forEach((entry) => normalized.add(entry));
    return [...normalized];
}

function getSelectedDeviceGroupIds() {
    return [...new Set(
        [...deviceGrid.querySelectorAll('input[data-node-type="child"]:checked')]
            .map((input) => input.dataset.groupId)
            .filter(Boolean)
    )];
}

function getSelectedPersonaOptionIds() {
    return [...personaGroups.querySelectorAll('input[data-node-type="child"]:checked')].map((input) => input.value);
}

function getSelectedDeviceOptionIds() {
    return [...deviceGrid.querySelectorAll('input[data-node-type="child"]:checked')].map((input) => input.value);
}

function getSelectedPersonaLabels() {
    return [...personaGroups.querySelectorAll('input[data-node-type="child"]:checked')]
        .map((input) => input.dataset.label || input.value)
        .filter(Boolean);
}

function getSelectedDeviceLabels() {
    return [
        ...[...deviceGrid.querySelectorAll('input[data-node-type="child"]:checked')]
            .map((input) => input.dataset.label || input.value)
            .filter(Boolean),
        ...getCustomEntries(deviceCustomInput.value)
    ];
}

function getCustomEntries(value) {
    return String(value || "")
        .split(/[,\n/]|·/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function localizeSentence(key, value = "") {
    const sentences = {
        deviceExact: {
            ko: "선택한 카테고리를 그대로 중심 기기로 반영했습니다.",
            en: "The selected category was used directly as the core device.",
            de: "Die gewählte Kategorie wurde direkt als zentrales Gerät verwendet."
        },
        deviceFallback: {
            ko: "가장 가까운 대안 기기를 함께 고려해 시나리오를 이어갑니다.",
            en: "The scenario continues with the closest available alternative device.",
            de: "Das Szenario wird mit dem nächstliegenden verfügbaren Alternativgerät fortgeführt."
        },
        factsCountry: {
            ko: `${value} 대상 구성`,
            en: `Scenario configured for ${value}`,
            de: `Szenario für ${value} konfiguriert`
        },
        factsDevice: {
            ko: `선정 기기: ${value}`,
            en: `Selected device: ${value}`,
            de: `Ausgewähltes Gerät: ${value}`
        },
        factsService: {
            ko: `주요 서비스: ${value}`,
            en: `Primary service: ${value}`,
            de: `Primärer Service: ${value}`
        },
        factsNote: {
            ko: `추천 메모: ${value}`,
            en: `Recommendation note: ${value}`,
            de: `Empfehlungshinweis: ${value}`
        },
        assumptionFallback: {
            ko: "선택한 기기와 가장 가까운 대안 기기를 함께 고려했습니다.",
            en: "The nearest alternative device was considered alongside the selected one.",
            de: "Das nächstliegende Alternativgerät wurde zusätzlich berücksichtigt."
        },
        assumptionExact: {
            ko: "선택한 기기 카테고리를 그대로 반영했습니다.",
            en: "The selected device category was reflected as-is.",
            de: "Die gewählte Gerätekategorie wurde direkt übernommen."
        },
        assumptionGeneral: {
            ko: "세부 환경 정보가 없는 부분은 일반적인 사용 맥락을 기준으로 구성했습니다.",
            en: "Where detailed environment data was missing, the scenario was shaped around a general usage context.",
            de: "Wo Detaildaten zur Umgebung fehlten, wurde das Szenario anhand eines allgemeinen Nutzungskontexts aufgebaut."
        },
        checkFit: {
            ko: "사용 목표와 연결되는 시나리오 방향이 잡혀 있습니다.",
            en: "The scenario direction is clearly tied to the user's goal.",
            de: "Die Szenariorichtung ist klar mit dem Nutzerziel verbunden."
        },
        checkAvailability: {
            ko: "대상 국가에서 활용 가능한 기기를 기준으로 구성했습니다.",
            en: "The scenario is built around devices available in the selected market.",
            de: "Das Szenario basiert auf Geräten, die im gewählten Markt verfügbar sind."
        },
        checkExecution: {
            ko: "추천 흐름을 실제 사용 단계로 설명할 수 있습니다.",
            en: "The recommended flow can be explained as a real usage sequence.",
            de: "Der empfohlene Ablauf lässt sich als reale Nutzungskette erklären."
        },
        checkClarity: {
            ko: "사용자가 체감하는 가치 중심으로 설명됩니다.",
            en: "The explanation stays centered on value users can actually feel.",
            de: "Die Erklärung bleibt auf den tatsächlich spürbaren Nutzen für Nutzer fokussiert."
        },
        checkMetric: {
            ko: "활용 포인트와 기대 효과가 연결되어 있습니다.",
            en: "Execution points and expected outcomes are logically connected.",
            de: "Umsetzungspunkte und erwartete Ergebnisse sind logisch miteinander verbunden."
        },
        metricRetail: {
            ko: `설명 단순화 -> 고객 이해도 상승 -> ${value} 상담 전환 개선`,
            en: `Simpler explanation -> stronger customer understanding -> improved consultation conversion for ${value}`,
            de: `Einfachere Erklärung -> besseres Kundenverständnis -> bessere Beratungskonversion für ${value}`
        },
        metricDotcom: {
            ko: "시나리오 중심 페이지 구성 -> 기능 이해 부담 감소 -> 클릭과 장바구니 진입 상승",
            en: "Scenario-led page structure -> lower feature-comprehension burden -> higher clicks and basket entries",
            de: "Szenario-basierter Seitenaufbau -> geringere Verständnislast -> mehr Klicks und Warenkorb-Einstiege"
        },
        metricBrand: {
            ko: "감정 가치 중심 메시지 -> 공감도 증가 -> 브랜드 선호와 공유 의도 상승",
            en: "Emotion-led messaging -> stronger resonance -> higher brand preference and sharing intent",
            de: "Emotional geprägte Botschaft -> stärkere Resonanz -> höhere Markenpräferenz und Teilungsabsicht"
        },
        segment1: {
            ko: `${value}에서 연결형 가전 경험에 관심이 높은 사용자층`,
            en: `Users in ${value} who are open to connected home-device experiences`,
            de: `Nutzerinnen und Nutzer in ${value}, die offen für vernetzte Geräteerlebnisse sind`
        },
        segment2: {
            ko: `${value}처럼 핵심 가치를 분명하게 원하는 사용자`,
            en: `Users like ${value} who have a clear expectation for the core value`,
            de: `Nutzer wie ${value}, die einen klaren Nutzen erwarten`
        },
        segment3: {
            ko: "복잡한 설정보다 바로 체감 가능한 변화와 편의를 선호하는 사용자",
            en: "Users who prefer immediate convenience and visible change over complex setup",
            de: "Nutzer, die unmittelbaren Komfort und spürbare Veränderung komplexer Einrichtung vorziehen"
        },
        guide1: {
            ko: `1단계: ${value}를 앱에 연결합니다.`,
            en: `Step 1: Connect ${value} to the app.`,
            de: `Schritt 1: Verbinden Sie ${value} mit der App.`
        },
        guide2: {
            ko: `2단계: ${value} 중심 추천 흐름을 선택합니다.`,
            en: `Step 2: Choose the recommended flow centered on ${value}.`,
            de: `Schritt 2: Wählen Sie den empfohlenen Ablauf rund um ${value}.`
        },
        guide3: {
            ko: "3단계: 한 번 실행해 보고 필요한 부분만 간단히 조정합니다.",
            en: "Step 3: Run it once and make only the small adjustments you need.",
            de: "Schritt 3: Führen Sie den Ablauf einmal aus und passen Sie nur das Nötige an."
        },
        guide4: {
            ko: "4단계: 자주 쓰는 흐름을 저장해 반복 사용합니다.",
            en: "Step 4: Save the flow you use often and repeat it easily.",
            de: "Schritt 4: Speichern Sie den häufig genutzten Ablauf und verwenden Sie ihn wiederholt."
        },
        marketGo: {
            ko: `${value} 사용자에게 핵심 가치를 분명하게 전달할 수 있는 구성입니다.`,
            en: `This setup can clearly deliver the core value to users in ${value}.`,
            de: `Dieses Setup kann den Kernnutzen für Nutzer in ${value} klar vermitteln.`
        },
        marketNoGo: {
            ko: "대상 사용자와 기기 구성이 아직 충분히 구체적이지 않습니다.",
            en: "The target user and device setup are not yet specific enough.",
            de: "Zielnutzer und Gerätekonfiguration sind noch nicht konkret genug."
        },
        marketComparison: {
            ko: "비슷한 자동화 경험과 비교해도 이해하기 쉬운 사용 장면으로 설명하기 좋습니다.",
            en: "Compared with similar automation ideas, this scenario is easier to explain through a clear usage moment.",
            de: "Im Vergleich zu ähnlichen Automationsideen lässt sich dieses Szenario leichter über einen klaren Nutzungsmoment erklären."
        }
    };
    return sentences[key]?.[currentLocale] || sentences[key]?.en || sentences[key]?.ko || value;
}

function localizeRoleText(key, value = "") {
    const map = {
        retailSubtitle: {
            ko: "매장 설명과 제안에 바로 쓰기 좋은 포인트",
            en: "Points ready for store explanation and recommendation",
            de: "Punkte, die sich direkt für Store-Erklärung und Empfehlung eignen"
        },
        retailBullet1: {
            ko: `${value} 중심으로 짧은 데모 스토리를 구성합니다.`,
            en: `Build a short demo story around ${value}.`,
            de: `Erstellen Sie eine kurze Demo-Story rund um ${value}.`
        },
        retailBullet2: {
            ko: `${value}를 고객의 실제 문제 해결 언어로 바꿔 설명합니다.`,
            en: `Translate ${value} into language that solves the customer's real problem.`,
            de: `Übersetzen Sie ${value} in eine Sprache, die das tatsächliche Kundenproblem löst.`
        },
        retailBullet3: {
            ko: "상담 중 바로 연결 가능한 추가 제안 포인트를 만듭니다.",
            en: "Create add-on recommendation points that can be used immediately during consultation.",
            de: "Schaffen Sie Zusatzempfehlungen, die direkt im Beratungsgespräch genutzt werden können."
        },
        dotcomSubtitle: {
            ko: "상품 페이지와 전환 흐름에 바로 연결할 포인트",
            en: "Points ready to connect product pages and conversion flow",
            de: "Punkte zur direkten Verbindung von Produktseite und Conversion-Fluss"
        },
        dotcomBullet1: {
            ko: "상품 설명, 사용 장면, CTA를 한 흐름으로 배치합니다.",
            en: "Arrange product explanation, use moment, and CTA in one continuous flow.",
            de: "Ordnen Sie Produkterklärung, Nutzungsmoment und CTA in einem durchgehenden Ablauf an."
        },
        dotcomBullet2: {
            ko: "선택 기기 중심으로 상세 페이지 메시지를 간결하게 만듭니다.",
            en: "Keep the detail-page message concise around the selected device.",
            de: "Halten Sie die Botschaft der Detailseite rund um das gewählte Gerät prägnant."
        },
        dotcomBullet3: {
            ko: "추천 흐름을 배너와 카드, FAQ로 나누어 활용합니다.",
            en: "Reuse the recommended flow across banners, cards, and FAQ sections.",
            de: "Nutzen Sie den empfohlenen Ablauf erneut in Bannern, Karten und FAQ-Bereichen."
        },
        dotcomCopy: {
            ko: `${value} 하나로 시작해 생활 전반으로 확장되는 경험을 보여줍니다.`,
            en: `Show how the experience can start with ${value} and expand across daily life.`,
            de: `Zeigen Sie, wie das Erlebnis mit ${value} beginnt und sich über den Alltag erweitert.`
        },
        brandSubtitle: {
            ko: "감정 가치와 캠페인 장면 중심 포인트",
            en: "Points centered on emotional value and campaign scenes",
            de: "Punkte mit Fokus auf emotionalen Wert und Kampagnenszenen"
        },
        brandBullet1: {
            ko: "기능보다 사용자가 느끼는 안심과 편리함을 중심으로 메시지를 정리합니다.",
            en: "Organize the message around reassurance and convenience rather than features.",
            de: "Ordnen Sie die Botschaft stärker um Sicherheit und Komfort als um Funktionen."
        },
        brandBullet2: {
            ko: "일상에서 배려받는 순간을 핵심 장면으로 사용합니다.",
            en: "Use the moment of feeling cared for in daily life as the core scene.",
            de: "Nutzen Sie den Moment des Umsorgtseins im Alltag als zentrale Szene."
        },
        brandBullet3: {
            ko: "짧은 영상과 소셜 카피, 비주얼 콘셉트로 확장하기 쉽게 구성합니다.",
            en: "Shape it so it can expand easily into short video, social copy, and visual concepts.",
            de: "Gestalten Sie es so, dass es sich leicht auf Kurzvideo, Social Copy und visuelle Konzepte ausweiten lässt."
        },
        brandCopy: {
            ko: "기술이 앞서 보이기보다 사용자를 먼저 배려하는 경험으로 설명합니다.",
            en: "Explain it as an experience that puts people first rather than technology first.",
            de: "Beschreiben Sie es als Erlebnis, das Menschen vor Technologie stellt."
        }
    };
    return map[key]?.[currentLocale] || map[key]?.en || map[key]?.ko || value;
}

/* ══════════════════════════════════════════════════════════════════════
   큐레이션 모드 — Explore Contents DB 매칭 + UI 렌더링
   ══════════════════════════════════════════════════════════════════════ */

let curationDbV1 = null;
let curationDbV2 = null;
let curationLoaded = false;
let latestSelectionSummary = null;  // Selection Stage 산출물 — AI 프롬프트 및 output 렌더링에 전달
let _latestCurationResults = [];    // 최근 큐레이션 결과 (campaign output에서 참조)

async function loadCurationDb() {
    if (curationLoaded) return;
    try {
        const [r1, r2] = await Promise.all([
            fetch("references/explore_db_v1.json").then(r => r.json()),
            fetch("references/explore_db_v2.json").then(r => r.json())
        ]);
        curationDbV1 = r1;
        curationDbV2 = r2;
        curationLoaded = true;
    } catch (e) {
        console.warn("Curation DB load failed:", e);
    }
}

// 앱 시작 시 DB를 미리 로드 (비동기, 논블로킹)
loadCurationDb();

/**
 * Q2 라이프스타일 가중치 로직과 Q3 기기 보너스를 결합한 통합 가중치 산출 함수 (Step 4 매칭 엔진용)
 */
function getIntegratedTagScores(input) {
    const purpose = input.purpose || "";
    const q1Traits = typeof inferQ1Traits === "function" ? inferQ1Traits() : [];
    
    // Q1_WEIGHT, Q2_WEIGHT (Q2 화면 로직과 동일)
    const Q1_WEIGHT = 40;
    const perQ1 = Q1_WEIGHT / Math.max(q1Traits.length, 1);

    const tagScoreMap = {};
    const tagSourceCount = {}; 
    function addTagScore(tag, pts, sourceId) {
        const key = `${sourceId}|${tag}`;
        if (!tagSourceCount[key]) {
            tagSourceCount[key] = true;
            tagScoreMap[tag] = (tagScoreMap[tag] || 0) + pts;
        }
    }

    // 명시적 의도(Primary)
    const PRIMARY_WEIGHT = 15;
    const personaIds = [...(input.segments || []), ...(input.interests || [])];
    const PRIMARY_INTENT_MAP = {
        t_pet:        ["Care for your pet", "Pet care"],
        t_multi_kids: ["Care for kids", "Family care"],
        t_parent_care:["Care for seniors", "Family care"],
        t_parent_away:["Care for seniors", "Keep your home safe"],
        t_wellness:   ["Stay fit & healthy", "Health", "Sleep well"],
        t_security:   ["Keep your home safe", "Security"],
        t_efficiency: ["Help with chores", "Time saving"],
        t_remote:     ["Help with chores", "Time saving"],
        t_dual_income:["Time saving", "Help with chores"],
        t_solo_parent:["Time saving", "Care for kids"],
        t_single_income:["Save energy"],
        t_night_shift:["Sleep well"],
        t_long_away:  ["Keep your home safe", "Security"],
        t_weekend_out:["Keep your home safe"],
        t_homebody:   ["Enhanced mood", "Sleep well"],
        t_acc_needs:  ["Easy to use"],
        int_energy:   ["Save energy", "Energy Saving"],
        int_pet:      ["Care for your pet", "Pet care"],
        int_kids:     ["Care for kids", "Family care"],
        int_senior:   ["Care for seniors", "Family care"],
        int_health:   ["Stay fit & healthy", "Health"],
        int_safe:     ["Keep your home safe", "Security"],
        int_chores:   ["Help with chores", "Time saving"],
        int_sleep:    ["Sleep well"],
        int_mood:     ["Enhanced mood"],
        int_air:      ["Keep the air fresh"],
        int_lights:   ["Easily control your lights", "Enhanced mood"],
        int_find:     ["Keep your home safe"]
    };
    personaIds.forEach(id => {
        (PRIMARY_INTENT_MAP[id] || []).forEach(tag => addTagScore(tag, PRIMARY_WEIGHT, `primary_${id}`));
    });

    // 세대 구성 (Household)
    const HOUSEHOLD_WEIGHT = 10;
    const HOUSEHOLD_MAP = {
        hh_young_kids:  ["Care for kids", "Keep your home safe", "Family care"],
        hh_school_kids: ["Care for kids", "Keep your home safe", "Family care"],
        hh_senior:      ["Care for seniors", "Keep your home safe", "Family care"],
        hh_multi_gen:   ["Care for seniors", "Care for kids", "Family care"],
        hh_solo:        ["Keep your home safe", "Save energy"],
        hh_couple:      ["Enhanced mood", "Help with chores"],
        hh_adult_kids:  ["Keep your home safe", "Save energy"]
    };
    (input.segments || []).forEach(id => {
        (HOUSEHOLD_MAP[id] || []).forEach(tag => addTagScore(tag, HOUSEHOLD_WEIGHT, `hh_${id}`));
    });

    // 라이프스테이지
    const LIFESTAGE_WEIGHT = 8;
    const LIFESTAGE_MAP = {
        ls_parenting:    ["Care for kids", "Keep your home safe", "Family care"],
        ls_senior:       ["Care for seniors", "Family care", "Health"],
        ls_empty_nest:   ["Stay fit & healthy", "Sleep well"],
        ls_starter:      ["Save energy", "Easy to use"],
        ls_newlywed:     ["Enhanced mood", "Help with chores"],
        ls_settled:      ["Save energy", "Enhanced mood"],
        ls_established:  ["Help with chores", "Time saving"]
    };
    (input.segments || []).forEach(id => {
        (LIFESTAGE_MAP[id] || []).forEach(tag => addTagScore(tag, LIFESTAGE_WEIGHT, `ls_${id}`));
    });

    // 거주지 (Housing)
    const HOUSING_WEIGHT = 4;
    const HOUSING_MAP = {
        h_apt:       ["Save energy", "Keep the air fresh"],
        h_compact:   ["Save energy", "Easily control your lights"],
        h_villa:     ["Keep your home safe"],
        h_house:     ["Keep your home safe", "Save energy"],
        h_townhouse: ["Keep your home safe", "Save energy"],
        h_shared:    ["Keep your home safe", "Keep the air fresh"],
        h_care:      ["Care for seniors", "Keep your home safe"]
    };
    (input.housing || []).forEach(id => {
        (HOUSING_MAP[id] || []).forEach(tag => addTagScore(tag, HOUSING_WEIGHT, `housing_${id}`));
    });

    // Q1 매직 키워드
    if (typeof MAGIC_KEY_TO_EXPLORE_TAGS !== "undefined") {
        const magicKeys = input.magicKeywords || [];
        for (const key of magicKeys) {
            const q1Pts = Math.round(perQ1 * 0.8);
            (MAGIC_KEY_TO_EXPLORE_TAGS[key] || []).forEach(tag => addTagScore(tag, q1Pts, `q1_${key}`));
        }
    }

    // 추가 텍스트 보너스
    const purposeBonus = {
        "반려|펫|pet|dog|cat": "Care for your pet",
        "부모|시니어|senior": "Care for seniors",
        "아이|자녀|kid|child": "Care for kids",
        "에너지|절약|energy|save": "Save energy",
        "보안|안전|security|safe": "Keep your home safe",
        "수면|잠|sleep": "Sleep well",
        "게임|영화|music": "Enhanced mood",
        "세탁|청소|가사|chore": "Help with chores",
        "운동|건강|health": "Stay fit & healthy"
    };
    Object.entries(purposeBonus).forEach(([pattern, tag]) => {
        if (new RegExp(pattern, "i").test(purpose.toLowerCase())) addTagScore(tag, 8, `purpose_${tag}`);
    });

    // 유사 태그 병합 (TAG_MERGE) - 중복 뻥튀기분 삭감(0.9배율 적용)
    const TAG_MERGE = {
        "Energy Saving": "Save energy",
        "Security": "Keep your home safe",
        "Pet care": "Care for your pet",
        "Family care": "Care for kids",
        "Health": "Stay fit & healthy",
        "Sleep": "Sleep well",
        "Time saving": "Help with chores",
        "Easy to use": "Easily control your lights"
    };
    for (const [from, to] of Object.entries(TAG_MERGE)) {
        if (tagScoreMap[from]) {
            tagScoreMap[to] = (tagScoreMap[to] || 0) + (tagScoreMap[from] * 0.9);
            delete tagScoreMap[from];
        }
    }

    // 기기 보너스 결합
    const devices = input.devices || [];
    const integratedScores = Object.entries(tagScoreMap).map(([tag, score]) => {
        let devBonus = 0;
        if (typeof DEVICE_TO_EXPLORE_TAGS !== "undefined") {
            const hasSupport = devices.some(d => (DEVICE_TO_EXPLORE_TAGS[d] || []).includes(tag));
            if (hasSupport) devBonus = 15; // Q3 기기 매칭에 대한 대형 가중치 직접 주입
        }
        return { tag, score: score + devBonus };
    });

    // 점수 정규화 (엔진 적합성을 위해 최고점을 12점으로 맞춤)
    const maxScore = Math.max(1, ...integratedScores.map(t => t.score));
    return integratedScores
        .map(t => ({
            tag: t.tag,
            score: Math.round((t.score / maxScore) * 12)
        }))
        .filter(t => t.score > 0)
        .sort((a, b) => b.score - a.score);
}

function runCuration() {
    if (!curationLoaded || !curationDbV1 || !curationDbV2) return;

    const personaIds = getSelectedPersonaOptionIds();
    const segments = personaIds.filter(id => id.startsWith("hh_") || id.startsWith("ls_") || id.startsWith("t_"));
    const interests = personaIds.filter(id => id.startsWith("int_"));
    const housing = personaIds.filter(id => id.startsWith("h_"));
    const devices = getSelectedDevices().map(d => {
        const el = document.querySelector(`input[value="${d}"]`);
        return el?.dataset?.normalized || (typeof getCategoryName === "function" ? getCategoryName(d) : d);
    });
    const purpose = purposeInput.value.trim();

    const selectedMarket = marketOptions.find(m => m.siteCode === countrySelect.value);
    const city = getCityValue();
    const magicKeywords = [..._magicSelected];

    const input = {
        segments, interests, housing, devices, purpose,
        magicKeywords,
        market: {
            country: selectedMarket?.label || "",
            city: city || "",
            locale: currentLocale
        }
    };

    if (typeof curateScenarios !== "function") return;

    // 중간 데이터 수집: 기존의 독립적 태그 도출 로직 폐기, Q2-Q3 결합 로직으로 변경
    const tagScores = getIntegratedTagScores(input);

    const v2Scenarios = curationDbV2.scenarios || [];
    const totalPool = (curationDbV1.scenarios || []).length + v2Scenarios.length;
    
    // 엔진에 통합 가중치 주입 (overrideTagScores)
    const results = curateScenarios(input, curationDbV1.scenarios, v2Scenarios, { maxResults: 5, minScore: 5, overrideTagScores: tagScores });

    // Selection Summary 구축
    if (typeof buildSelectionSummary === "function") {
        const personaLabels = personaIds.map(id => {
            const el = document.querySelector(`input[value="${id}"]`);
            return el?.dataset?.label || id;
        });
        const deviceLabels = getSelectedDeviceLabels();

        latestSelectionSummary = buildSelectionSummary(input, results, {
            locale: currentLocale,
            personaLabels,
            deviceLabels
        });
    }

    // 입력 라벨 수집 (프로세스 카드용)
    const personaLabelsForCard = personaIds.map(id => {
        const el = document.querySelector(`input[value="${id}"]`);
        return el?.dataset?.label || id;
    }).filter(Boolean);
    const deviceLabelsForCard = getSelectedDeviceLabels();

    // 매칭 프로세스 카드 렌더링 → 확인 후 결과 표시
    renderMatchingProcess({
        input, tagScores, results, totalPool,
        personaLabels: personaLabelsForCard,
        deviceLabels: deviceLabelsForCard.length > 0 ? deviceLabelsForCard : devices,
        country: selectedMarket?.label || "",
        city: city || "",
        purpose,
        personaIds, devices
    });
}

/* ══════════════════════════════════════════════════════════════════════
   매칭 프로세스 카드 — 4단계 시각화 + 확인 버튼 플로우
   ══════════════════════════════════════════════════════════════════════ */
let _mpCurrentStep = 0;
let _mpBypassProcess = false;

function renderMatchingProcess(ctx) {
    const frame = document.getElementById("matching-process-frame");
    const container = document.getElementById("mp-cards");
    if (!frame || !container) return;

    const isKo = currentLocale === "ko";
    _mpCurrentStep = 0;

    // 4단계 카드 데이터 구성
    const cards = buildMpCards(ctx, isKo);
    container.innerHTML = cards.map((card, i) =>
        `<div class="mp-card${i === 0 ? "" : " locked"}" data-mp-step="${i}" style="animation-delay:${i * 0.1}s">
            <div class="mp-card-header">
                <span class="mp-card-num">${i + 1}</span>
                <span class="mp-card-title">${card.title}</span>
                <span class="mp-card-check">✅</span>
            </div>
            <div class="mp-card-body">
                <p class="mp-card-helper">${card.helper}</p>
                ${card.content}
                <button type="button" class="mp-confirm-btn" data-mp-step="${i}">
                    ${i < cards.length - 1
                        ? (isKo ? "확인 — 다음 단계 보기" : "Confirm — See next step")
                        : (isKo ? "확인 — 매칭된 시나리오 보기" : "Confirm — View matched scenarios")}
                </button>
            </div>
        </div>`
    ).join("");

    frame.classList.remove("hidden");

    // 확인 버튼 이벤트
    container.querySelectorAll(".mp-confirm-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const step = parseInt(btn.dataset.mpStep, 10);
            const card = container.querySelector(`[data-mp-step="${step}"]`);
            if (card) {
                card.classList.add("done");
                btn.disabled = true;
                btn.textContent = isKo ? "✅ 확인 완료" : "✅ Confirmed";
            }

            // 다음 카드 공개
            const next = container.querySelector(`[data-mp-step="${step + 1}"]`);
            if (next) {
                next.classList.remove("locked");
                next.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }

            // 마지막 단계 확인 시 → 큐레이션 결과 표시
            if (step === cards.length - 1) {
                renderCurationInputSummary(ctx.personaIds, ctx.devices, ctx.purpose, ctx.results);
                renderCurationResults(ctx.results, ctx.devices);

                // Flow Tracker 업데이트
                updateOutputFlowTracker(1, { 1: "done", 2: "waiting", 3: "waiting" });
                setSectionStatusBadge("curation-title", "done");

                const curationFrame = document.getElementById("curation-frame");
                if (curationFrame) {
                    setTimeout(() => {
                        curationFrame.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 300);
                }
            }
        });
    });
}

function buildMpCards(ctx, isKo) {
    const { input, tagScores, results, totalPool, personaLabels, deviceLabels, country, city, purpose } = ctx;

    // ── Q2 스코어보드 결과 가져오기 (연장선) ──
    const q2Traits = inferSegmentTraits(getSelectedSegment(), purposeInput.value.trim());
    const q1Traits = inferQ1Traits();
    const coreValues = inferCoreValues([...q2Traits, ...q1Traits.map(t => t.trait)], purposeInput.value.trim());
    const direction = inferScenarioDirection(q2Traits, purposeInput.value.trim());

    // Q2 시나리오 태그 한글 매핑
    const tagKoMap = {
        "Save energy": "에너지 절약", "Keep your home safe": "홈 안전·보안",
        "Help with chores": "가사 자동화", "Care for kids": "자녀 케어",
        "Care for seniors": "시니어 케어", "Care for your pet": "반려동물 케어",
        "Sleep well": "수면 개선", "Enhanced mood": "분위기 연출",
        "Stay fit & healthy": "건강·피트니스", "Easily control your lights": "조명 제어",
        "Keep the air fresh": "공기질 관리", "Find your belongings": "분실물 찾기"
    };

    // ── Card 1: 🧩 매칭 컨텍스트 요약 ──
    const clusterNames = coreValues.slice(0, 2).join(" + ");
    const deviceCount = deviceLabels.length || getSelectedDeviceLabels().length;
    const deviceChips = deviceLabels.slice(0, 6).map(l =>
        `<span class="mp-tag"><span class="mp-tag-icon">📱</span>${escapeHtml(l)}</span>`
    ).join("");
    const moreDevices = deviceCount > 6 ? `<span class="mp-tag" style="opacity:0.6">+${deviceCount - 6}</span>` : "";

    const card1 = {
        title: isKo ? "🧩 매칭 컨텍스트 요약" : "🧩 Matching Context Summary",
        helper: isKo
            ? "Q1~Q3에서 확정된 타겟 프로필과 기기 풀을 기준으로 시나리오를 탐색합니다."
            : "Searching scenarios based on your confirmed target profile and device pool from Q1–Q3.",
        content: `
            <div class="mp-context-grid">
                <div class="mp-context-item">
                    <span class="mp-context-label">${isKo ? "목표 페르소나" : "Target Persona"}</span>
                    <span class="mp-context-value"><strong>${escapeHtml(clusterNames)}</strong></span>
                </div>
                <div class="mp-context-item">
                    <span class="mp-context-label">${isKo ? "시나리오 방향" : "Scenario Direction"}</span>
                    <span class="mp-context-value">${escapeHtml(direction)}</span>
                </div>
                <div class="mp-context-item">
                    <span class="mp-context-label">${isKo ? "보유 기기 풀" : "Device Pool"}</span>
                    <div class="mp-tags">${deviceChips}${moreDevices}</div>
                </div>
                ${purpose ? `<div class="mp-context-item">
                    <span class="mp-context-label">${isKo ? "추가 요구사항" : "Additional Context"}</span>
                    <span class="mp-context-value" style="font-style:italic">"${escapeHtml(purpose)}"</span>
                </div>` : ""}
            </div>
        `
    };

    // ── Card 2: 🧮 시나리오 가중치 결합 (Q2 연장선) ──
    // Q2 스코어보드의 태그 점수를 기기 가능성과 결합
    const combinedScores = tagScores.map(t => {
        const q2Display = isKo ? (tagKoMap[t.tag] || t.tag) : t.tag;
        // 기기 매칭 보너스 확인
        const devBonus = (typeof DEVICE_TO_EXPLORE_TAGS !== "undefined")
            ? getSelectedDevices().some(d => {
                const norm = getCategoryName(d);
                return (DEVICE_TO_EXPLORE_TAGS[norm] || []).includes(t.tag);
              }) : false;
        return { ...t, display: q2Display, hasDeviceSupport: devBonus };
    });
    const maxCombined = combinedScores.length > 0 ? combinedScores[0].score : 1;
    const topCombined = combinedScores.slice(0, 6);

    const combinedRows = topCombined.map(t => {
        const pct = Math.round((t.score / maxCombined) * 100);
        const devBadge = t.hasDeviceSupport
            ? `<span class="mp-dev-badge">${isKo ? "기기 지원" : "device ✓"}</span>`
            : "";
        return `<div class="mp-weight-row">
            <span class="mp-weight-label">${escapeHtml(t.display)}${devBadge}</span>
            <div class="mp-weight-bar-bg"><div class="mp-weight-bar" style="width:${pct}%"></div></div>
            <span class="mp-weight-score">${t.score}${isKo ? "점" : "pt"}</span>
        </div>`;
    }).join("");

    const card2 = {
        title: isKo ? "🧮 시나리오 가중치 결합" : "🧮 Combined Scenario Weights",
        helper: isKo
            ? "Q2에서 도출된 라이프스타일 요구도와 Q3 기기의 실행 가능성을 결합한 최종 가중치입니다. '기기 지원' 표시는 보유 기기로 해당 시나리오를 바로 구현할 수 있음을 의미합니다."
            : "Final weights combining Q2 lifestyle demands with Q3 device capabilities. 'device ✓' means your devices can directly execute this scenario.",
        content: `
            <div style="margin-bottom:6px;font-size:0.72rem;color:var(--muted)">
                ${isKo ? "산출: Q2 클러스터 추론(시너지 ×1.2 · 교차검증 ×1.5) + Q3 기기 매칭 보너스" : "Calculation: Q2 cluster reasoning (synergy ×1.2 · cross-validation ×1.5) + Q3 device match bonus"}
            </div>
            ${combinedRows}
        `
    };

    // ── Card 3: ⚡ 스코어링 과정 ──
    const matchedCount = results.length;
    const topScore = results.length > 0 ? results[0]._score : 0;

    const card3 = {
        title: isKo ? "⚡ 시나리오 스코어링" : "⚡ Scenario Scoring",
        helper: isKo
            ? `위 가중치를 기준으로 ${totalPool}개 시나리오 DB를 탐색하여 적합도 점수를 매겼습니다.`
            : `Scored ${totalPool} scenarios in the DB using the weights above.`,
        content: `
            <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:8px">
                <div style="text-align:center;padding:8px 16px;border-radius:10px;background:#e8f5e9;flex:1;min-width:100px">
                    <div style="font-size:1.4rem;font-weight:800;color:#2e7d32">${matchedCount}</div>
                    <div style="font-size:0.7rem;color:#558b2f">${isKo ? "매칭 시나리오" : "Matched"}</div>
                </div>
                <div style="text-align:center;padding:8px 16px;border-radius:10px;background:#e3f2fd;flex:1;min-width:100px">
                    <div style="font-size:1.4rem;font-weight:800;color:#1565c0">${topScore}</div>
                    <div style="font-size:0.7rem;color:#1976d2">${isKo ? "최고 적합도" : "Top score"}</div>
                </div>
                <div style="text-align:center;padding:8px 16px;border-radius:10px;background:#f3e5f5;flex:1;min-width:100px">
                    <div style="font-size:1.4rem;font-weight:800;color:#7b1fa2">${totalPool}</div>
                    <div style="font-size:0.7rem;color:#8e24aa">${isKo ? "전체 DB" : "Total DB"}</div>
                </div>
            </div>
        `
    };

    // ── Card 4: 🎯 최종 매칭 결과 ──
    const previewRows = results.slice(0, 5).map((r, i) => {
        const f = (typeof formatCurationResult === "function") ? formatCurationResult(r) : { title: r.story_title || "", source: r._source || "" };
        const tags = (r._matchedTags || []).slice(0, 3).map(t => typeof t === "object" ? t.tag : t);
        const tagDisplay = tags.map(t => isKo ? (tagKoMap[t] || t) : t);
        return `<div class="mp-scenario-row">
            <span class="mp-scenario-rank">${i + 1}</span>
            <div class="mp-scenario-info">
                <div class="mp-scenario-title">${escapeHtml(f.title || r.story_title || "")}</div>
                <div class="mp-scenario-meta">${escapeHtml(f.source || r._source || "")} · ${tagDisplay.map(t => escapeHtml(t)).join(", ")}</div>
            </div>
            <span class="mp-scenario-score">${r._score}${isKo ? "점" : "pt"}</span>
        </div>`;
    }).join("");

    const card4 = {
        title: isKo ? "🎯 최종 매칭 결과" : "🎯 Final Match Results",
        helper: isKo
            ? "Q2 타겟 프로필 + Q3 기기 조합에 가장 적합한 시나리오 순위입니다. 확인하시면 상세 카드를 볼 수 있습니다."
            : "Scenarios ranked by fit with your Q2 profile + Q3 devices. Confirm to see detailed cards.",
        content: previewRows || `<p style="color:var(--muted);font-size:0.82rem">${isKo ? "매칭된 시나리오가 없습니다." : "No matching scenarios found."}</p>`
    };

    return [card1, card2, card3, card4];
}

function renderCurationInputSummary(personaIds, devices, purpose, results) {
    const summaryEl = document.getElementById("curation-input-summary");
    if (!summaryEl) return;

    const selectedMarket = marketOptions.find(m => m.siteCode === countrySelect.value);
    const city = getCityValue();
    const isKo = currentLocale === "ko";

    // 선택된 항목들의 라벨 수집
    const labels = personaIds.map(id => {
        const el = document.querySelector(`input[value="${id}"]`);
        return el?.dataset?.label || id;
    }).filter(Boolean);

    const deviceLabels = [...new Set(devices)].slice(0, 6);
    const country = selectedMarket?.label || "";

    const tagHtml = [
        country, city,
        ...labels.slice(0, 8),
        ...deviceLabels
    ].filter(Boolean).map(t => `<span class="input-tag">${escapeHtml(t)}</span>`).join("");

    // 매칭 이유 생성
    const topTags = results.length > 0
        ? [...new Set(results.slice(0, 3).flatMap(r => r._matchedTags?.map(t => t.tag) || r.tags || []))].slice(0, 4)
        : [];

    const reasonText = isKo
        ? topTags.length
            ? `위 입력 조합에서 <strong>${topTags.join(", ")}</strong> 키워드가 도출되어, 해당 키워드를 포함한 ${results.length}개 시나리오가 매칭되었습니다.`
            : "입력된 조건으로 매칭 가능한 시나리오를 검색했습니다."
        : topTags.length
            ? `Keywords <strong>${topTags.join(", ")}</strong> derived from your input matched ${results.length} scenario(s).`
            : "Searched for scenarios matching your input conditions.";

    summaryEl.innerHTML = `
        <div>${isKo ? "선택한 입력 정보" : "Your selections"}: ${tagHtml}</div>
        ${purpose ? `<div style="margin-top:4px">${isKo ? "추가 설명" : "Context"}: ${escapeHtml(purpose)}</div>` : ""}
        <div class="match-reason">${reasonText}</div>
    `;
}

function renderCurationResults(results, selectedDevices) {
    const frame = document.getElementById("curation-frame");
    const container = document.getElementById("curation-results");
    if (!frame || !container) return;

    // 캠페인 output에서 참조할 수 있도록 저장
    _latestCurationResults = results;

    if (results.length === 0) {
        frame.classList.add("hidden");
        return;
    }

    // dotcom base URL
    const selectedMarket = marketOptions.find(m => m.siteCode === countrySelect.value);
    const dotcomData = typeof dotcomMapping !== "undefined" ? dotcomMapping : null;
    const baseCode = (selectedMarket?.siteCode || "us").toLowerCase().replace(/_.*/, "");
    const dotcomEntry = dotcomData?.markets?.find(m => m.siteCode.toLowerCase() === baseCode);
    const baseUrl = dotcomEntry?.fullUrl || `https://www.samsung.com/${(selectedMarket?.siteCode || "us").toLowerCase()}`;

    const isKo = currentLocale === "ko";

    // 로케일 번역 매핑 (영어 시나리오 제목/본문 → 현지어)
    const needsTranslation = currentLocale !== "en";
    const scenarioTitleTranslations = {
        ko: {
            "Save energy": "에너지 절약", "Keep your home safe": "집을 안전하게",
            "Help with chores": "가사 도움", "Care for kids": "아이 돌봄",
            "Care for seniors": "시니어 케어", "Care for your pet": "반려동물 케어",
            "Sleep well": "숙면 도움", "Enhanced mood": "분위기 연출",
            "Stay fit & healthy": "건강 관리", "Easily control your lights": "조명 간편 제어",
            "Keep the air fresh": "공기질 관리", "Find your belongings": "분실물 찾기",
            "Time saving": "시간 절약", "Energy Saving": "에너지 절감",
            "Security": "보안", "Family care": "가족 돌봄", "Easy to use": "간편 사용"
        },
        de: {
            "Save energy": "Energie sparen", "Keep your home safe": "Zuhause sichern",
            "Help with chores": "Hausarbeit erleichtern", "Care for kids": "Kinderbetreuung",
            "Care for seniors": "Seniorenbetreuung", "Care for your pet": "Haustierpflege",
            "Sleep well": "Besser schlafen", "Enhanced mood": "Stimmung verbessern",
            "Stay fit & healthy": "Fit & gesund bleiben", "Easily control your lights": "Lichtsteuerung",
            "Keep the air fresh": "Frische Luft", "Find your belongings": "Sachen finden"
        }
    };
    const localTagMap = scenarioTitleTranslations[currentLocale] || {};

    // 확장 구문 번역 맵 (한국어) — Explore 시나리오 본문에 자주 등장하는 문구
    const bodyPhraseMapKo = {
        "Give your pet customised care": "반려동물에게 맞춤형 케어를 제공하세요",
        "Take care of your pet even while you're away": "외출 중에도 반려동물을 돌보세요",
        "Check up on them": "반려동물 상태를 확인하세요",
        "Start Pet Care with just a photo": "사진 한 장으로 펫 케어를 시작하세요",
        "automatically identify the breed": "자동으로 품종을 식별합니다",
        "reviewing the daily activity": "일일 활동을 확인합니다",
        "Help your pet enjoy its time alone": "반려동물이 혼자 있는 시간을 즐길 수 있게 도와주세요",
        "automatic feeder": "자동 급식기", "regular meals": "규칙적인 식사",
        "perfect temperature": "최적 온도", "atmosphere": "분위기",
        "barking is detected": "짖는 소리가 감지되면",
        "Set the right temperature": "적정 온도를 설정하세요",
        "save energy": "에너지를 절약하세요", "Save energy": "에너지를 절약하세요",
        "while you're away": "외출 중에도", "when you come home": "집에 돌아오면",
        "before you arrive": "도착하기 전에",
        "Smart TV": "스마트 TV", "Vacuum Cleaner": "로봇청소기",
        "Air Conditioner": "에어컨", "Air Purifier": "공기청정기",
        "Galaxy Smartphone": "갤럭시 스마트폰", "Galaxy Watch": "갤럭시 워치",
        "SmartThings": "스마트싱스",
        "your home safe": "집을 안전하게",
        "monitor your home": "집을 모니터링하세요",
        "security camera": "보안 카메라",
        "door lock": "도어락", "motion sensor": "동작 센서",
        "automate your daily routine": "일상을 자동화하세요",
        "control your lights": "조명을 제어하세요",
        "fresh air": "신선한 공기", "air quality": "공기질",
        "sleep better": "숙면을 취하세요", "good night's sleep": "좋은 수면",
        "washing machine": "세탁기", "dryer": "건조기",
        "robot vacuum": "로봇청소기", "dishwasher": "식기세척기",
        "refrigerator": "냉장고", "oven": "오븐",
        "family members": "가족 구성원", "children": "자녀", "kids": "아이",
        "seniors": "시니어", "elderly": "어르신",
        "Pet Accessory": "펫 액세서리", "Third-party": "서드파티",
        "Jet Bot": "제트봇"
    };

    // 간이 번역 함수: 영문 텍스트에서 알려진 키워드 및 구문을 로케일로 치환
    function translateSnippet(text) {
        if (!text || !needsTranslation) return "";
        let translated = text;
        // 긴 구문부터 먼저 치환 (더 정확한 매칭)
        const phraseMap = currentLocale === "ko" ? bodyPhraseMapKo : {};
        const allEntries = [...Object.entries(phraseMap), ...Object.entries(localTagMap)]
            .sort((a, b) => b[0].length - a[0].length);
        for (const [en, local] of allEntries) {
            translated = translated.replace(new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), local);
        }
        return translated !== text ? translated : "";
    }

    container.innerHTML = results.map((scenario, idx) => {
        const f = formatCurationResult(scenario);
        const bodyText = f.originalText || f.narrative || "";
        const truncated = bodyText.length > 250 ? bodyText.substring(0, 250) + "…" : bodyText;

        // 로케일 번역
        const titleTranslation = needsTranslation ? translateSnippet(f.title) : "";
        const bodyTranslation = needsTranslation ? translateSnippet(truncated) : "";

        const tagsHtml = f.matchedTags.map(tag => {
            const localTag = localTagMap[tag] || "";
            return `<span class="curation-tag">${escapeHtml(tag)}${localTag ? ` <span class="curation-tag-local">(${escapeHtml(localTag)})</span>` : ""}</span>`;
        }).join("");

        const devicesHtml = f.devices.map(d =>
            `<span class="curation-device-chip">${escapeHtml(d)}</span>`
        ).join("");

        const linksHtml = (scenario.purchase_links || []).map(pl =>
            `<a href="${escapeHtml(baseUrl + pl.path)}" target="_blank" rel="noopener noreferrer" class="curation-link">
                <span class="curation-link-icon">${pl.icon}</span>
                <span>${escapeHtml(pl.productType)}</span>
            </a>`
        ).join("");

        return `
            <article class="curation-card" data-curation-idx="${idx}">
                <div class="curation-card-header">
                    <span class="curation-card-rank">${idx + 1}</span>
                    <span class="curation-card-title">${escapeHtml(f.title)}${titleTranslation ? ` <span class="curation-title-local">(${escapeHtml(titleTranslation)})</span>` : ""}</span>
                    <span class="curation-card-source">${escapeHtml(f.source)}</span>
                </div>
                ${f.article ? `<div style="font-size:0.76rem;color:var(--muted);margin-bottom:8px">📂 ${escapeHtml(f.article)}</div>` : ""}
                <div class="curation-card-meta">${tagsHtml}</div>
                <div class="curation-card-body">${escapeHtml(truncated)}${bodyTranslation ? `<br><span class="curation-body-local">${escapeHtml(bodyTranslation)}</span>` : ""}</div>
                ${devicesHtml ? `<div class="curation-card-devices">${devicesHtml}</div>` : ""}
                ${linksHtml ? `<div class="curation-card-links">${linksHtml}</div>` : ""}
                <div class="curation-card-actions">
                    <button type="button" class="curation-ai-btn" data-curation-idx="${idx}">
                        ${isKo ? "🤖 이 시나리오 기반으로 AI 확장 생성" : "🤖 Generate AI-expanded scenario from this"}
                    </button>
                </div>
            </article>
        `;
    }).join("");

    // 매칭 완료 안내 HELPER 배너 (5개 시나리오 아래)
    const helperBanner = document.createElement("div");
    helperBanner.className = "curation-completion-helper";
    helperBanner.innerHTML = isKo
        ? `<div class="curation-helper-icon">✅</div>
           <div class="curation-helper-content">
               <p class="curation-helper-title">시나리오 매칭이 완료되었습니다</p>
               <p class="curation-helper-desc">위 시나리오 중 하나를 선택하여 <strong>AI 확장 생성</strong> 버튼을 누르면, 해당 시나리오를 기반으로 원하는 형식과 내용으로 재구성해 드립니다.</p>
               <ul class="curation-helper-steps">
                   <li>카테고리를 선택하셔도 되고, 필요한 내용을 직접 적으셔도 됩니다</li>
                   <li>AI 기반으로 원하는 시나리오를 생성해 드립니다</li>
               </ul>
           </div>`
        : `<div class="curation-helper-icon">✅</div>
           <div class="curation-helper-content">
               <p class="curation-helper-title">Scenario matching complete</p>
               <p class="curation-helper-desc">Select a scenario above and click <strong>AI Expand</strong> to customize it into your desired format and content.</p>
               <ul class="curation-helper-steps">
                   <li>You can pick a category or describe what you need</li>
                   <li>AI will generate the scenario tailored to your needs</li>
               </ul>
           </div>`;
    container.appendChild(helperBanner);

    // "AI 확장" 버튼 이벤트
    container.querySelectorAll(".curation-ai-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const idx = parseInt(btn.dataset.curationIdx, 10);
            const scenario = results[idx];
            if (scenario) triggerAiFromCuration(scenario);
        });
    });

    frame.classList.remove("hidden");

    // STEP 1 완료 → 헬퍼 업데이트
    updateOutputFlowTracker(1, { 1: "done", 2: "waiting", 3: "waiting" });
    setSectionStatusBadge("curation-title", "done");
    updateSectionHelper("curation-helper",
        isKo
            ? "입력하신 조건에 가장 잘 맞는 시나리오를 찾았습니다. 하나를 선택하면 다음 단계로 넘어갑니다."
            : "We found the best-matching scenarios. Select one to proceed to the next step.");
}

function triggerAiFromCuration(scenario) {
    const f = formatCurationResult(scenario);

    // latestSelectionSummary가 있으면 선택된 시나리오를 primary로 업데이트
    if (latestSelectionSummary) {
        latestSelectionSummary.selectedScenarios.forEach(s => { s.isPrimary = false; });
        const match = latestSelectionSummary.selectedScenarios.find(
            s => s.title === f.title && s.source === (scenario._source || "")
        );
        if (match) {
            match.isPrimary = true;
        } else {
            latestSelectionSummary.selectedScenarios.unshift({
                id: scenario.id || `${scenario._source}-${(f.title || "").replace(/\s+/g, "-")}`,
                title: f.title,
                articleTitle: f.article,
                source: scenario._source || "v2.0",
                score: f.score,
                matchedTags: f.matchedTags,
                valueTags: f.valueTags,
                devices: f.devices,
                originalText: (f.originalText || f.narrative || "").substring(0, 400),
                analysis: "",
                isPrimary: true
            });
        }
        const isKo = currentLocale === "ko";
        latestSelectionSummary.selectionReason = isKo
            ? `"${f.title}" 시나리오를 직접 선택하셨습니다. (적합도 ${f.score}점, 소스: Explore ${scenario._source || "v2.0"})`
            : `You selected "${f.title}" (score: ${f.score}, source: Explore ${scenario._source || "v2.0"}).`;
    }

    // ── 13-Section Campaign Output 실행 ──
    // aiScenarioContext 빌드 (generateScenario에서 사용하던 것과 동일)
    const selectedMarket = marketOptions.find(m => m.siteCode === countrySelect.value);
    const city = getCityValue();
    const selectedDeviceLabels = getSelectedDeviceLabels();
    const selectedDevices = getSelectedDevices();
    const rawSelectedSegment = getSelectedSegment();
    const rawPurpose = purposeInput.value.trim();

    const context = {
        role: typeof getRoleTitle === "function" ? getRoleTitle(roleSelect?.value || "") : "",
        roleId: roleSelect?.value || "",
        countryCode: selectedMarket?.siteCode || "",
        country: typeof getCountryName === "function" ? getCountryName(selectedMarket?.siteCode || "") : (selectedMarket?.label || ""),
        city: city || "",
        cityDisplay: typeof getCityDisplayValue === "function" ? getCityDisplayValue(selectedMarket?.siteCode || "", city || "") : (city || ""),
        segment: rawSelectedSegment || "",
        purpose: rawPurpose,
        devices: selectedDeviceLabels.length > 0 ? selectedDeviceLabels : selectedDevices.map(d => typeof getCategoryName === "function" ? getCategoryName(d) : d),
        deviceGroups: typeof getSelectedDeviceGroupIds === "function" ? getSelectedDeviceGroupIds() : [],
        intentTags: [...(_magicSelected || [])],
        missionBucket: typeof analyzeIntent === "function" ? analyzeIntent(rawPurpose, rawSelectedSegment, selectedDevices, []).missionBucket : "Discover",
        locale: currentLocale,
        provider: selectedProvider,
        selectionSummary: latestSelectionSummary || null
    };

    // 큐레이션 결과 가져오기 (renderCurationResults에서 사용된 results)
    const curationResults = _latestCurationResults || [];

    // 13-section output 실행
    if (typeof launchCampaignOutput === "function") {
        launchCampaignOutput(curationResults, scenario, context, latestSelectionSummary);
    }
}

/* ══════════════════════════════════════════════════════════════════════
   결과물 카테고리 선택 — 직무별 후속 선택형
   ══════════════════════════════════════════════════════════════════════ */

const OUTPUT_CATEGORIES = [
    { id: "campaign", icon: "📢", titleKo: "캠페인 메시지 방향", titleEn: "Campaign messaging", descKo: "시나리오 기반 태그라인, 소구 포인트, 1-liner 카피", descEn: "Taglines, appeal points, and one-liner copy from the scenario" },
    { id: "retail", icon: "🏪", titleKo: "리테일 현장 적용안", titleEn: "Retail execution", descKo: "매장 설명 흐름, 체험 시나리오, POP 문구", descEn: "In-store explanation flow, experience scenario, POP copy" },
    { id: "dotcom", icon: "🌐", titleKo: "닷컴 콘텐츠/프로모 활용안", titleEn: "Dotcom content & promo", descKo: "랜딩 페이지 구성, 배너 카피, 전환 흐름", descEn: "Landing page structure, banner copy, conversion flow" },
    { id: "crm", icon: "🔄", titleKo: "CRM/리텐션 활용안", titleEn: "CRM & retention", descKo: "푸시 알림 시나리오, 재방문 유도, 사용률 향상", descEn: "Push notification scenarios, re-engagement, usage lift" },
    { id: "season", icon: "🎄", titleKo: "시즌/행사 연계안", titleEn: "Seasonal tie-in", descKo: "명절·시즌 캠페인 스토리, 한정 프로모 방향", descEn: "Holiday and seasonal campaign story, limited promo direction" },
    { id: "report", icon: "📊", titleKo: "매니저/임원 보고용 요약", titleEn: "Executive summary", descKo: "1페이지 요약, 핵심 수치, 전략 방향", descEn: "One-page summary, key metrics, strategic direction" }
];

let selectedOutputCategories = new Set();

function renderOutputCategories() {
    const frame = document.getElementById("output-category-frame");
    const container = document.getElementById("output-categories");
    if (!frame || !container) return;

    const isKo = currentLocale === "ko";

    container.innerHTML = OUTPUT_CATEGORIES.map(cat => `
        <div class="category-card${selectedOutputCategories.has(cat.id) ? " selected" : ""}" data-cat-id="${cat.id}">
            <span class="category-card-icon">${cat.icon}</span>
            <span class="category-card-title">${escapeHtml(isKo ? cat.titleKo : cat.titleEn)}</span>
            <span class="category-card-desc">${escapeHtml(isKo ? cat.descKo : cat.descEn)}</span>
        </div>
    `).join("");

    container.querySelectorAll(".category-card").forEach(card => {
        card.addEventListener("click", () => {
            const catId = card.dataset.catId;
            if (selectedOutputCategories.has(catId)) {
                selectedOutputCategories.delete(catId);
                card.classList.remove("selected");
            } else {
                selectedOutputCategories.add(catId);
                card.classList.add("selected");
            }
        });
    });

    frame.classList.remove("hidden");
}
