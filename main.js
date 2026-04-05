
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
/* ?? Searchable city dropdown elements ?? */
const citySearchWrap = document.getElementById("city-search-wrap");
const citySearchInput = document.getElementById("city-search-input");
const cityHiddenInput = document.getElementById("city-value");
const cityDropdown = document.getElementById("city-dropdown");
const citySearchIcon = document.getElementById("city-search-icon");
/* Legacy aliases ??kept so downstream code that reads citySelect.value / cityCustomInput still compiles */
const citySelect = { get value() { return cityHiddenInput.value; }, set value(v) { cityHiddenInput.value = v; }, options: [] };
const cityCustomInput = { get value() { return citySearchInput.value; }, set value(v) { citySearchInput.value = v; }, disabled: false, focus() { citySearchInput.focus(); }, blur() { citySearchInput.blur(); } };
const cityCustomRow = null;
const cityCustomConfirmBtn = null;
const personaGroups = document.getElementById("persona-groups");
const q3AutoSummary = document.getElementById("q3-auto-summary");
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
const Q3_AUTO_TARGET_COUNTS = Object.freeze({ housing: 3, household: 3, lifestage: 5 });

let q3AutoRecommendedIds = new Set();
let q3ManualAddedIds = new Set();
let q3ManualRemovedIds = new Set();
let q3AutoRecommendationMeta = null;

/* ?? ?쒓뎅 ?꾩떆 留덉뒪???곗씠??(?됱젙?덉쟾遺 2024.04 二쇰??깅줉?멸뎄) ?? */
const KR_CITY_MASTER = {
    "?밸퀎?쑣룰킅??떆쨌?밸퀎?먯튂??: [
        { en: "Seoul", ko: "?쒖슱?밸퀎??, pop: 9411453 },
        { en: "Busan", ko: "遺?곌킅??떆", pop: 3350000 },
        { en: "Incheon", ko: "?몄쿇愿묒뿭??, pop: 2960000 },
        { en: "Daegu", ko: "?援ш킅??떆", pop: 2380000 },
        { en: "Daejeon", ko: "??꾧킅??떆", pop: 1450000 },
        { en: "Gwangju Metro", ko: "愿묒＜愿묒뿭??, pop: 1430000 },
        { en: "Ulsan", ko: "?몄궛愿묒뿭??, pop: 1100000 },
        { en: "Sejong", ko: "?몄쥌?밸퀎?먯튂??, pop: 380000 }
    ],
    "寃쎄린??: [
        { en: "Suwon", ko: "?섏썝??, pop: 1223598 },
        { en: "Yongin", ko: "?⑹씤??, pop: 1077883 },
        { en: "Goyang", ko: "怨좎뼇??, pop: 1072217 },
        { en: "Hwaseong", ko: "?붿꽦??, pop: 948934 },
        { en: "Seongnam", ko: "?깅궓??, pop: 918122 },
        { en: "Bucheon", ko: "遺泥쒖떆", pop: 785394 },
        { en: "Namyangju", ko: "?⑥뼇二쇱떆", pop: 733392 },
        { en: "Ansan", ko: "?덉궛??, pop: 627279 },
        { en: "Pyeongtaek", ko: "?됲깮??, pop: 592946 },
        { en: "Anyang", ko: "?덉뼇??, pop: 545082 },
        { en: "Siheung", ko: "?쒗씎??, pop: 519956 },
        { en: "Paju", ko: "?뚯＜??, pop: 504136 },
        { en: "Gimpo", ko: "源?ъ떆", pop: 486952 },
        { en: "Uijeongbu", ko: "?섏젙遺??, pop: 463059 },
        { en: "Gwangju-si", ko: "愿묒＜??寃쎄린)", pop: 393243 },
        { en: "Hanam", ko: "?섎궓??, pop: 331316 },
        { en: "Gwangmyeong", ko: "愿묐챸??, pop: 283235 },
        { en: "Yangju", ko: "?묒＜??, pop: 280303 },
        { en: "Gunpo", ko: "援고룷??, pop: 263164 },
        { en: "Osan", ko: "?ㅼ궛??, pop: 239715 },
        { en: "Icheon", ko: "?댁쿇??, pop: 222963 },
        { en: "Anseong", ko: "?덉꽦??, pop: 190563 },
        { en: "Guri", ko: "援щ━??, pop: 187709 },
        { en: "Uiwang", ko: "?섏솗??, pop: 159384 },
        { en: "Pocheon", ko: "?ъ쿇??, pop: 146559 },
        { en: "Yeoju", ko: "?ъ＜??, pop: 114646 },
        { en: "Dongducheon", ko: "?숇몢泥쒖떆", pop: 88605 },
        { en: "Gwacheon", ko: "怨쇱쿇??, pop: 78561 }
    ],
    "媛뺤썝??: [
        { en: "Wonju", ko: "?먯＜??, pop: 362074 },
        { en: "Chuncheon", ko: "異섏쿇??, pop: 286812 },
        { en: "Gangneung", ko: "媛뺣쫱??, pop: 210037 },
        { en: "Donghae", ko: "?숉빐??, pop: 88574 },
        { en: "Sokcho", ko: "?띿큹??, pop: 82311 },
        { en: "Samcheok", ko: "?쇱쿃??, pop: 62607 },
        { en: "Taebaek", ko: "?쒕갚??, pop: 38710 }
    ],
    "異⑹껌遺곷룄": [
        { en: "Cheongju", ko: "泥?＜??, pop: 849531 },
        { en: "Chungju", ko: "異⑹＜??, pop: 208454 },
        { en: "Jecheon", ko: "?쒖쿇??, pop: 130937 }
    ],
    "異⑹껌?⑤룄": [
        { en: "Cheonan", ko: "泥쒖븞??, pop: 659471 },
        { en: "Asan", ko: "?꾩궛??, pop: 385827 },
        { en: "Seosan", ko: "?쒖궛??, pop: 177690 },
        { en: "Dangjin", ko: "?뱀쭊??, pop: 171159 },
        { en: "Nonsan", ko: "?쇱궛??, pop: 110653 },
        { en: "Gongju", ko: "怨듭＜??, pop: 101617 },
        { en: "Boryeong", ko: "蹂대졊??, pop: 95903 },
        { en: "Gyeryong", ko: "怨꾨！??, pop: 47065 }
    ],
    "?꾨씪遺곷룄": [
        { en: "Jeonju", ko: "?꾩＜??, pop: 644146 },
        { en: "Iksan", ko: "?듭궛??, pop: 270129 },
        { en: "Gunsan", ko: "援곗궛??, pop: 260865 },
        { en: "Jeongeup", ko: "?뺤쓭??, pop: 103048 },
        { en: "Gimje", ko: "源?쒖떆", pop: 80729 },
        { en: "Namwon", ko: "?⑥썝??, pop: 76462 }
    ],
    "?꾨씪?⑤룄": [
        { en: "Suncheon", ko: "?쒖쿇??, pop: 278085 },
        { en: "Yeosu", ko: "?ъ닔??, pop: 271061 },
        { en: "Mokpo", ko: "紐⑺룷??, pop: 211878 },
        { en: "Gwangyang", ko: "愿묒뼇??, pop: 152001 },
        { en: "Naju", ko: "?섏＜??, pop: 114142 }
    ],
    "寃쎌긽遺곷룄": [
        { en: "Pohang", ko: "?ы빆??, pop: 492021 },
        { en: "Gumi", ko: "援щ???, pop: 406260 },
        { en: "Gyeongsan", ko: "寃쎌궛??, pop: 267823 },
        { en: "Gyeongju", ko: "寃쎌＜??, pop: 246144 },
        { en: "Andong", ko: "?덈룞??, pop: 153605 },
        { en: "Gimcheon", ko: "源泥쒖떆", pop: 137210 },
        { en: "Yeongcheon", ko: "?곸쿇??, pop: 100248 },
        { en: "Yeongju", ko: "?곸＜??, pop: 100051 },
        { en: "Sangju", ko: "?곸＜??, pop: 93607 },
        { en: "Mungyeong", ko: "臾멸꼍??, pop: 68914 }
    ],
    "寃쎌긽?⑤룄": [
        { en: "Changwon", ko: "李쎌썝??, pop: 1006692 },
        { en: "Gimhae", ko: "源?댁떆", pop: 531911 },
        { en: "Yangsan", ko: "?묒궛??, pop: 355519 },
        { en: "Jinju", ko: "吏꾩＜??, pop: 340736 },
        { en: "Geoje", ko: "嫄곗젣??, pop: 234310 },
        { en: "Tongyeong", ko: "?듭쁺??, pop: 120419 },
        { en: "Sacheon", ko: "?ъ쿇??, pop: 109692 },
        { en: "Miryang", ko: "諛?묒떆", pop: 102689 }
    ],
    "?쒖＜?밸퀎?먯튂??: [
        { en: "Jeju", ko: "?쒖＜??, pop: 493178 },
        { en: "Seogwipo", ko: "?쒓??ъ떆", pop: 184818 }
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
let latestStructuredOutput = null;  // 怨듯넻 JSON ?ㅽ궎留?湲곕컲 援ъ“??output
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
let deferStep3InsightUntilInteraction = false;
let bypassSessionReady = false;
let bypassSessionPromise = null;
let selectedProvider = sessionStorage.getItem("aiProvider") || "openai";
let userOverrideLocale = null;

const SUPPORTED_UI_LOCALES = ["ko", "en", "de", "fr", "es", "pt", "it", "nl", "ar"];
// ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧
// Q3 Locale-Aware Product Catalog System
// - dotcom mapping ?꾩껜瑜?source of truth濡??ъ슜
// - ??援?? 異붽? ??肄붾뱶 ?섏젙 ?놁씠 ?먮룞 ???
// ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧

// ?? siteCode ??region 留ㅽ븨 (援??蹂?移댄깉濡쒓렇 ?댁긽?? ??
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

// ?? 濡쒖??쇰퀎 ?쒗뭹 移댄깉濡쒓렇 ??
// 援ъ“: { samsung: [...groups], partner: [...groups], styles: { cardId: {s:[],p:[]} } }
// s = samsungIds, p = partnerIds
const LOCALE_CATALOGS = {
    // ?? Global Default (紐⑤뱺 誘몄젙??濡쒖??쇱쓽 fallback) ??
    _default: {
        samsung: [
            { label: "紐⑤컮??, labelEn: "Mobile", ids: ["galaxy-phone", "galaxy-tab"] },
            { label: "?⑥뼱?щ툝", labelEn: "Wearable", ids: ["galaxy-watch", "galaxy-buds"] },
            { label: "TV/?ㅻ뵒??, labelEn: "TV / Audio", ids: ["tv-premium", "soundbar", "speaker"] },
            { label: "二쇰갑", labelEn: "Kitchen", ids: ["refrigerator", "dishwasher", "oven", "microwave"] },
            { label: "由щ튃", labelEn: "Living", ids: ["washer", "dryer", "air-conditioner", "air-purifier", "robot-vacuum"] },
            { label: "?ㅻ쭏?명솃", labelEn: "Smart Home", ids: ["hub"] }
        ],
        partner: [
            { label: "?쒖뼱", labelEn: "Control", ids: ["smart-plug", "smart-switch", "lighting"] },
            { label: "蹂댁븞/媛먯?", labelEn: "Security", ids: ["camera", "door-lock", "activity-sensor"] },
            { label: "?곕땲??, labelEn: "Wellness", ids: ["body-scale", "partner-humidifier"] }
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

    // ?? KR (?쒓뎅 ?쇱꽦?룹뺨 sec) ??
    KR: {
        samsung: [
            { label: "紐⑤컮??, labelEn: "Mobile", ids: ["galaxy-phone", "galaxy-tab", "galaxy-book"] },
            { label: "?⑥뼱?щ툝", labelEn: "Wearable", ids: ["galaxy-watch", "galaxy-buds"] },
            { label: "TV/?곸긽/?뚰뼢", labelEn: "TV / Video / Audio", ids: ["tv-premium", "projector", "moving-style", "speaker", "soundbar", "harman-audio"] },
            { label: "二쇰갑媛??, labelEn: "Kitchen", ids: ["refrigerator", "kimchi-fridge", "dishwasher", "cooktop", "oven", "microwave", "water-purifier", "hood"] },
            { label: "由щ튃媛??, labelEn: "Living", ids: ["washer", "dryer", "airdresser", "air-conditioner", "system-aircon", "air-purifier", "robot-vacuum"] },
            { label: "IT/二쇰?湲곌린", labelEn: "IT / Peripherals", ids: ["monitor", "printer", "memory-storage"] },
            { label: "?ㅻ쭏?명솃 蹂댁“", labelEn: "Smart Home", ids: ["hub", "smartthings-product", "accessories"] }
        ],
        partner: [
            { label: "?쒖뼱", labelEn: "Control", ids: ["smart-plug", "smart-switch", "lighting"] },
            { label: "蹂댁븞/媛먯?", labelEn: "Security / Sensing", ids: ["camera", "door-lock", "activity-sensor"] },
            { label: "?곕땲???앺솢", labelEn: "Wellness / Living", ids: ["partner-sleep", "body-scale", "partner-humidifier"] }
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

    // ?? US (誘멸뎅 ?쇱꽦?룹뺨) ??
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

    // ?? EU (?좊읇 怨듯넻) ??
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

    // ?? UK ??
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

    // ?? SEA (?숇궓?? ?? ??air-conditioner 媛뺤꽭, 濡쒕큸泥?냼湲?蹂닿툒 ?믪쓬
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

    // ?? IN (?몃룄) ?? ???먯뼱而?怨듦린泥?젙湲?鍮꾩쨷 ?믪쓬, ?명긽湲?蹂닿툒 李⑥씠
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
    // LATAM, ME, OCE, CIS, JP, CN ??_default fallback
};

// ?? Catalog resolver: siteCode ??region ??catalog (with fallback) ??
let _activeLocaleKey = null;
let _activeFallbackSource = null;

function resolveLocaleCatalog(siteCode) {
    const code = (siteCode || "").toUpperCase().replace(/-.*$/, "");
    // 1李? SITE_REGION_MAP?먯꽌 region ?먯깋
    const region = SITE_REGION_MAP[code] || null;
    // 2李? region catalog 議댁옱 ?щ?
    if (region && LOCALE_CATALOGS[region]) {
        _activeLocaleKey = region;
        _activeFallbackSource = null;
        return LOCALE_CATALOGS[region];
    }
    // 3李? dotcom mapping??language 湲곕컲 ?먮룞 異붾줎
    if (dotcomMapping?.markets) {
        const market = dotcomMapping.markets.find(m => m.siteCode?.toUpperCase() === code);
        if (market) {
            const lang = (market.language || "").toLowerCase();
            if (lang === "korean") { _activeLocaleKey = "KR"; _activeFallbackSource = "language"; return LOCALE_CATALOGS.KR; }
            if (lang === "english" && LOCALE_CATALOGS.US) { _activeLocaleKey = "US"; _activeFallbackSource = "language"; return LOCALE_CATALOGS.US; }
        }
    }
    // 4李? global default
    _activeLocaleKey = "_default";
    _activeFallbackSource = region ? `region:${region}` : "no-mapping";
    // fallback to _default catalog silently
    return LOCALE_CATALOGS._default;
}

// ?? Dynamic Q3 state (locale???곕씪 蹂寃쎈맖) ??
let Q4_SAMSUNG_GROUPS = [];
let Q4_PARTNER_GROUPS = [];
let Q4_SAMSUNG_IDS = new Set();
let Q4_PARTNER_IDS = new Set();
let Q4_PRESETS = [];
let q4ActivePresets = new Set();

const Q4_PARTNER_CONTROL_IDS = ["smart-plug", "smart-switch", "lighting", "curtain", "mood-light", "sleep-light"];
const Q4_PARTNER_SECURITY_IDS = ["camera", "door-lock", "activity-sensor", "doorbell", "open-sensor", "care-camera"];
const Q4_PARTNER_WELLNESS_IDS = ["body-scale", "partner-humidifier", "partner-sleep", "sleep-sensor", "wearable-care", "pet-feeder"];

// 紐⑤뱺 湲곌린 ID (auto ?댁젣??
const Q4_ALL_QUICK_IDS = [
    "tv-premium", "refrigerator", "washer", "dryer", "air-conditioner", "air-purifier",
    "ventilation", "robot-vacuum", "dishwasher", "eco-aircon", "speaker", "soundbar",
    "galaxy-phone", "galaxy-watch", "galaxy-buds", "galaxy-tab", "galaxy-book",
    "projector", "moving-style", "harman-audio", "kimchi-fridge", "cooktop", "oven",
    "microwave", "water-purifier", "hood", "airdresser", "system-aircon",
    "monitor", "printer", "memory-storage", "hub", "smartthings-product", "accessories",
    "smart-plug", "camera", "door-lock", "activity-sensor", "smart-switch",
    "lighting", "curtain", "mood-light", "sleep-light",
    "doorbell", "open-sensor", "body-scale", "partner-sleep", "partner-humidifier",
    "care-camera", "sleep-sensor", "energy-monitor", "wearable-care", "pet-feeder",
    "galaxy-ring", "galaxy-xr", "galaxy-accessories", "music-frame",
    "dt-vacuum", "dt-small-appliance", "copilot-pc", "desktop-pc", "sec-moving-style"
];

// ?? ?ㅽ???移대뱶 ?뺤쓽 (8媛?怨듯넻 ??locale 遺덈?) ??
const Q4_STYLE_CARDS = [
    { id: "baseline", icon: "?벀" },
    { id: "energy",   icon: "?? },
    { id: "care",     icon: "?뮎" },
    { id: "mood",     icon: "?렦" },
    { id: "security", icon: "?썳" },
    { id: "chores",   icon: "?㏏" },
    { id: "comfort",  icon: "?뙼" },
    { id: "wellness", icon: "?쭣" }
];

/**
 * ?꾩옱 援?? 湲곗??쇰줈 Q3 移댄깉濡쒓렇瑜??곸슜
 * - Q4_SAMSUNG_GROUPS, Q4_PARTNER_GROUPS, Q4_PRESETS瑜?媛깆떊
 * - ?댁쟾 ?좏깮 以???濡쒖??쇱뿉 ?녿뒗 湲곌린 ?먮룞 ?쒓굅
 */
function applyLocaleCatalog(siteCode) {
    const catalog = resolveLocaleCatalog(siteCode);
    Q4_SAMSUNG_GROUPS = catalog.samsung;
    Q4_PARTNER_GROUPS = catalog.partner.map((group) => {
        const labelKey = String(group.labelEn || "").toLowerCase();
        let extraIds = [];
        if (labelKey.includes("control")) extraIds = Q4_PARTNER_CONTROL_IDS;
        else if (labelKey.includes("security")) extraIds = Q4_PARTNER_SECURITY_IDS;
        else if (labelKey.includes("wellness")) extraIds = Q4_PARTNER_WELLNESS_IDS;
        return { ...group, ids: [...new Set([...(group.ids || []), ...extraIds])] };
    });
    Q4_SAMSUNG_IDS = new Set(Q4_SAMSUNG_GROUPS.flatMap(g => g.ids));
    Q4_PARTNER_IDS = new Set(Q4_PARTNER_GROUPS.flatMap(g => g.ids));

    Q4_PRESETS = Q4_STYLE_CARDS.map(card => {
        const mapping = catalog.styles[card.id] || { s: [], p: [] };
        const samsungIds = [...mapping.s];
        const partnerIds = [...mapping.p];
        return { ...card, samsungIds, partnerIds, deviceIds: [...samsungIds, ...partnerIds] };
    });
}

/** ?꾩옱 濡쒖??쇱쓽 dotcom ?뺣낫 諛섑솚 (?ㅻ뜑 ?쒖떆?? */
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

// 湲곌린蹂???븷 ?쒓렇 (以묐났 ??븷 ?쒗쁽????locale 遺덈?)
const DEVICE_ROLE_TAGS = {
    "tv-premium":       { ko: ["?뷀꽣?뚯씤癒쇳듃", "?뚮┝ ?덈툕"], en: ["Entertainment", "Alert Hub"] },
    "refrigerator":     { ko: ["二쇰갑", "媛議?耳??], en: ["Kitchen", "Family Care"] },
    "robot-vacuum":     { ko: ["媛??, "紐⑤땲?곕쭅"], en: ["Chores", "Monitoring"] },
    "smart-plug":       { ko: ["?먮꼫吏", "?쒖뼱"], en: ["Energy", "Control"] },
    "care-camera":      { ko: ["?뚮큵", "紐⑤땲?곕쭅"], en: ["Care", "Monitoring"] },
    "door-lock":        { ko: ["蹂댁븞", "異쒖엯"], en: ["Security", "Access"] },
    "activity-sensor":  { ko: ["?덉쟾", "?쒕땲??耳??], en: ["Safety", "Senior Care"] },
    "sleep-sensor":     { ko: ["?섎㈃", "?곕땲??], en: ["Sleep", "Wellness"] },
    "lighting":         { ko: ["臾대뱶", "?먮룞??], en: ["Mood", "Automation"] },
    "energy-monitor":   { ko: ["?먮꼫吏", "紐⑤땲?곕쭅"], en: ["Energy", "Monitoring"] },
    "wearable-care":    { ko: ["?뚮큵", "嫄닿컯"], en: ["Care", "Health"] },
    "eco-aircon":       { ko: ["?덉빟", "AI ?쒖뼱"], en: ["Saving", "AI Control"] }
};

// 珥덇린 移댄깉濡쒓렇 ?곸슜 (page load ??
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
    roleSelectionContainer?.addEventListener("click", clearQ3AutoMode);
    roleSelectionContainer?.addEventListener("keydown", handleRoleCardKeydown);
    countrySelect.addEventListener("change", updateStatePreview);
    countrySelect.addEventListener("change", clearQ3AutoMode);
    countrySelect.addEventListener("change", updateLocaleFromCountry);
    // ?? Searchable City Dropdown ?대깽????
    initCitySearchDropdown();
    personaGroups.addEventListener("change", (event) => {
        try {
            handleChecklistChange(event, personaGroups);
            trackQ3AutoManualOverride(event);
            updateStatePreview();
        } catch (e) { console.error("[personaGroups change] handler error:", e); }
        // ??긽 insight 媛깆떊 ???꾩뿉???먮윭媛 ?섎룄 ?ㅽ뻾
        requestAnimationFrame(() => {
            try {
                releaseDeferredStep3Insight();
                updateStepInsight();
            } catch (e2) { console.error("[personaGroups change] insight error:", e2); }
        });
    });
    // click 湲곕컲 諛깆뾽 ???쇰? 釉뚮씪?곗??먯꽌 hidden checkbox??change ?대깽?멸? ?꾨씫?섎뒗 寃쎌슦 ?鍮?
    personaGroups.addEventListener("click", (event) => {
        const chip = event.target.closest(".tree-chip");
        const card = event.target.closest(".tree-card");
        if (!chip && !card) return;
        // change ?대깽?몄? 寃뱀퀜??idempotent?섎?濡??덉쟾??
        setTimeout(() => {
            if (currentStep === 3) {
                try {
                    releaseDeferredStep3Insight();
                    updateStepInsight();
                } catch (e) { console.error("[personaGroups click] insight error:", e); }
            }
        }, 50);
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
        requestAnimationFrame(() => {
            releaseDeferredStep3Insight();
            updateStepInsight();
        });
    });
    purposeInput.addEventListener("input", () => {
        releaseDeferredStep3Insight();
        updateStatePreview();
        updateStepInsight();
    });
    deviceGrid.addEventListener("change", (event) => {
        handleChecklistChange(event, deviceGrid);
        updateStatePreview();
        updateStepInsight();
        renderQ4Composer();
        // curation? Build 踰꾪듉 ?대┃ ?쒖뿉留??ㅽ뻾
    });
    deviceCustomInput.addEventListener("input", () => {
        clearQ4AutoMode();
        updateStatePreview();
        updateStepInsight();
        renderQ4Summary();
        // curation? Build 踰꾪듉 ?대┃ ?쒖뿉留??ㅽ뻾
    });
    deviceCustomInput.addEventListener("keydown", handleDeviceCustomKeydown);
    q4Presets?.addEventListener("click", handleQ4PresetClick);
    q4AllChips?.addEventListener("click", handleQ4QuickChipClick);
    document.getElementById("q4-auto-btn")?.addEventListener("click", handleQ4AutoSelect);
    document.getElementById("q3-auto-btn")?.addEventListener("click", handleQ3AutoSelect);
}


function handleQ3AutoSelect() {
    const recommendation = inferQ3AutoRecommendation();
    const nextIds = new Set(recommendation.ids);

    q3AutoRecommendedIds = nextIds;
    q3ManualAddedIds.clear();
    q3ManualRemovedIds.clear();
    q3AutoRecommendationMeta = recommendation;

    personaGroups?.querySelectorAll('input[data-node-type="child"]').forEach((input) => {
        input.checked = nextIds.has(input.value);
    });

    if (segmentCustomInput) segmentCustomInput.value = "__auto__";
    deferStep3InsightUntilInteraction = false;
    syncAllChecklistParents(personaGroups);
    updatePersonaGroupFooters();
    refreshQ3AutoSelectionUI();
    updateStatePreview();
    updateStepInsight();
}

function clearQ3AutoMode() {
    q3AutoRecommendedIds.clear();
    q3ManualAddedIds.clear();
    q3ManualRemovedIds.clear();
    q3AutoRecommendationMeta = null;
    if (segmentCustomInput?.value === "__auto__") segmentCustomInput.value = "";
    refreshQ3AutoSelectionUI();
}

function trackQ3AutoManualOverride(event) {
    const target = event?.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.dataset.nodeType !== "child") return;
    if (!q3AutoRecommendedIds.size) return;

    const group = target.closest(".tree-group");
    if (group) reconcileQ3AutoOverridesForGroup(group);
    refreshQ3AutoSelectionUI();
}

function reconcileQ3AutoOverridesForGroup(group) {
    if (!group || !q3AutoRecommendedIds.size) return;
    group.querySelectorAll('input[data-node-type="child"]').forEach((input) => {
        const optionId = input.value;
        if (q3AutoRecommendedIds.has(optionId)) {
            if (input.checked) q3ManualRemovedIds.delete(optionId);
            else q3ManualRemovedIds.add(optionId);
            q3ManualAddedIds.delete(optionId);
            return;
        }
        if (input.checked) q3ManualAddedIds.add(optionId);
        else q3ManualAddedIds.delete(optionId);
    });
}

function refreshQ3AutoSelectionUI() {
    const btn = document.getElementById("q3-auto-btn");
    if (btn) btn.classList.toggle("active", q3AutoRecommendedIds.size > 0);
    renderQ3AutoSummary();
    updateQ3OptionBadges();
}

function renderQ3AutoSummary() {
    if (!q3AutoSummary) return;
    if (!q3AutoRecommendedIds.size || !q3AutoRecommendationMeta) {
        q3AutoSummary.classList.add("hidden");
        q3AutoSummary.innerHTML = "";
        return;
    }

    const isKo = currentLocale === "ko";
    const appliedIds = [...q3AutoRecommendedIds].filter((id) => {
        const input = personaGroups?.querySelector(`input[data-node-type="child"][value="${id}"]`);
        return !!input?.checked;
    });
    const counts = {
        recommended: q3AutoRecommendedIds.size,
        applied: appliedIds.length,
        manual: [...q3ManualAddedIds].filter((id) => {
            const input = personaGroups?.querySelector(`input[data-node-type="child"][value="${id}"]`);
            return !!input?.checked;
        }).length,
        removed: q3ManualRemovedIds.size
    };
    const groupBreakdown = `A ${Q3_AUTO_TARGET_COUNTS.housing} / B ${Q3_AUTO_TARGET_COUNTS.household} / C ${Q3_AUTO_TARGET_COUNTS.lifestage}`;
    const summaryBullets = (q3AutoRecommendationMeta.summary || []).filter(Boolean).map((line) => `<li>${escapeHtml(line)}</li>`).join("");

    q3AutoSummary.classList.remove("hidden");
    q3AutoSummary.innerHTML = `
        <div class="q3-auto-summary-top">
            <strong>${isKo ? "Q1 洹쇨굅 湲곕컲 異붿쿇 ?명듃" : "Q1-grounded recommendation set"}</strong>
            <span class="q3-auto-summary-structure">${escapeHtml(groupBreakdown)}</span>
        </div>
        <div class="q3-auto-summary-stats">
            <span class="q3-auto-summary-stat"><strong>${counts.recommended}</strong> ${isKo ? "AI 異붿쿇" : "AI picks"}</span>
            <span class="q3-auto-summary-stat"><strong>${counts.applied}</strong> ${isKo ? "?곸슜 以? : "applied"}</span>
            <span class="q3-auto-summary-stat"><strong>${counts.manual}</strong> ${isKo ? "?ъ슜??異붽?" : "manual adds"}</span>
            <span class="q3-auto-summary-stat"><strong>${counts.removed}</strong> ${isKo ? "?ъ슜???댁젣" : "user removed"}</span>
        </div>
        ${summaryBullets ? `<ul class="q3-auto-summary-list">${summaryBullets}</ul>` : ""}
    `;
}

function updateQ3OptionBadges() {
    if (!personaGroups) return;
    const isKo = currentLocale === "ko";
    personaGroups.querySelectorAll(".tree-chip, .tree-card").forEach((node) => {
        node.classList.remove("q3-option--ai-applied", "q3-option--ai-suggested", "q3-option--manual-added");
        node.removeAttribute("title");
        node.querySelector(".q3-state-badge")?.remove();

        const input = node.querySelector('input[data-node-type="child"]');
        if (!input) return;
        if (!q3AutoRecommendedIds.size) return;

        const optionId = input.value;
        const reason = q3AutoRecommendationMeta?.reasonById?.[optionId]?.[0] || "";
        let badgeText = "";
        let className = "";

        if (q3AutoRecommendedIds.has(optionId) && input.checked) {
            className = "q3-option--ai-applied";
            badgeText = isKo ? "AI 異붿쿇" : "AI pick";
        } else if (q3AutoRecommendedIds.has(optionId) && !input.checked) {
            className = "q3-option--ai-suggested";
            badgeText = isKo ? "AI 異붿쿇?? : "AI suggested";
        } else if (!q3AutoRecommendedIds.has(optionId) && input.checked) {
            className = "q3-option--manual-added";
            badgeText = isKo ? "?ъ슜??異붽?" : "Added";
        }

        if (!className) return;
        node.classList.add(className);
        if (reason) node.title = reason;
        const badge = document.createElement("span");
        badge.className = "q3-state-badge";
        badge.textContent = badgeText;
        node.appendChild(badge);
    });
}

function handleQ4AutoSelect() {
    // 紐⑤뱺 湲곌린 ?댁젣
    q4ActivePresets.clear();
    Q4_ALL_QUICK_IDS.forEach((optionId) => setDeviceOptionChecked(optionId, false));

    // Q1/Q2 湲곕컲 湲곌린 ?먮룞 ?좏깮
    const personaIds = getSelectedPersonaOptionIds();
    const isKo = currentLocale === "ko";

    // ?섎Ⅴ?뚮굹 ??湲곌린 留ㅽ븨
    const PERSONA_DEVICE_MAP = {
        // ?몃? 援ъ꽦
        hh_solo: ["galaxy-phone", "galaxy-watch", "air-conditioner", "robot-vacuum", "lighting"],
        hh_couple: ["tv-premium", "soundbar", "air-conditioner", "robot-vacuum", "lighting"],
        hh_young_kids: ["camera", "air-purifier", "robot-vacuum", "galaxy-tab", "door-lock"],
        hh_school_kids: ["galaxy-tab", "camera", "air-purifier", "tv-premium"],
        hh_adult_kids: ["tv-premium", "galaxy-phone", "air-conditioner", "robot-vacuum"],
        hh_multi_gen: ["camera", "activity-sensor", "galaxy-watch", "tv-premium", "air-purifier"],
        hh_senior: ["activity-sensor", "galaxy-watch", "camera", "air-conditioner"],
        // 媛議??곹솴
        t_dual_income: ["robot-vacuum", "washer", "dryer", "smart-plug", "door-lock"],
        t_pet: ["pet-camera", "pet-feeder", "robot-vacuum", "air-purifier"],
        t_parent_away: ["camera", "activity-sensor", "galaxy-phone"],
        t_parent_care: ["activity-sensor", "galaxy-watch", "camera"],
        // ?쇱씠?꾩뒪?뚯씠吏
        ls_starter: ["galaxy-phone", "lighting", "smart-plug", "air-conditioner"],
        ls_newlywed: ["tv-premium", "soundbar", "robot-vacuum", "lighting", "air-conditioner"],
        ls_settled: ["air-conditioner", "air-purifier", "robot-vacuum", "tv-premium", "washer"],
        ls_parenting: ["camera", "air-purifier", "robot-vacuum", "galaxy-tab", "door-lock"],
        ls_established: ["tv-premium", "air-conditioner", "robot-vacuum", "washer", "dryer"],
        ls_empty_nest: ["tv-premium", "galaxy-watch", "air-conditioner", "robot-vacuum"],
        ls_senior: ["galaxy-watch", "activity-sensor", "camera", "air-conditioner"],
        // ?앺솢 ?⑦꽩
        t_remote: ["galaxy-tab", "galaxy-phone", "air-purifier", "lighting", "speaker"],
        t_long_away: ["camera", "door-lock", "smart-plug", "robot-vacuum"],
        t_weekend_out: ["camera", "door-lock", "smart-plug", "robot-vacuum"],
        t_night_shift: ["sleep-sensor", "lighting", "air-conditioner"],
        t_homebody: ["tv-premium", "soundbar", "gaming-console", "air-purifier", "lighting"],
        // ?앺솢 ?뚮쭏
        int_energy: ["smart-plug", "energy-monitor", "eco-aircon"],
        int_air: ["air-purifier", "ventilation"],
        int_lights: ["lighting", "smart-switch"],
        int_safe: ["camera", "door-lock", "doorbell", "open-sensor"],
        int_sleep: ["sleep-sensor", "lighting", "air-conditioner"],
        int_pet: ["pet-camera", "pet-feeder", "robot-vacuum"],
        int_health: ["galaxy-watch", "galaxy-buds", "body-scale"],
        // 嫄곗＜吏
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

    // 湲곕낯 湲곌린 (理쒖냼 ?좏깮)
    if (autoDevices.size === 0) {
        ["galaxy-phone", "tv-premium", "air-conditioner", "robot-vacuum", "lighting"].forEach(d => autoDevices.add(d));
    }

    // ?ㅼ젣 湲곌린 ?좏깮
    autoDevices.forEach(deviceId => {
        setDeviceOptionChecked(deviceId, true);
    });

    // ?좏깮 ?댁쑀 援ъ꽦
    const reasonMap = {
        hh_solo: isKo ? "1??媛援????ㅻ쭏?명룿쨌?뚯튂 以묒떖 媛꾪렪 ?쒖뼱" : "Single ??phone & watch centric control",
        hh_couple: isKo ? "2??媛援????뷀꽣?뚯씤癒쇳듃 + ?앺솢 ?몄쓽" : "Couple ??entertainment + convenience",
        hh_young_kids: isKo ? "?곸쑀??媛援????덉쟾 紐⑤땲?곕쭅 + 怨듦린吏? : "Young kids ??safety monitoring + air",
        hh_school_kids: isKo ? "?숇졊湲??먮? ???숈뒿 ?쒕툝由?+ ?덉쟾" : "School kids ??tablet + safety",
        hh_senior: isKo ? "?쒕땲?????쒕룞 媛먯? + 嫄닿컯 紐⑤땲?곕쭅" : "Senior ??activity + health monitoring",
        hh_multi_gen: isKo ? "?ㅼ꽭? ???뚮큵 ?쇱꽌 + 怨듦린吏? : "Multi-gen ??care sensors + air quality",
        t_dual_income: isKo ? "留욌쾶????媛???먮룞??+ ?먮꼫吏 愿由? : "Dual income ??chore automation + energy",
        t_pet: isKo ? "諛섎젮?숇Ъ ????移대찓??+ ?먮룞 湲됱떇" : "Pets ??pet camera + auto feeder",
        t_remote: isKo ? "?ы깮洹쇰Т ???쒕툝由?+ 怨듦린吏?+ 議곕챸" : "Remote work ??tablet + air + lighting",
        t_homebody: isKo ? "???덉? ??TV + ?ъ슫?쒕컮 + 議곕챸" : "Homebody ??TV + soundbar + lighting",
        ls_parenting: isKo ? "?≪븘湲????덉쟾 移대찓??+ 怨듦린泥?젙" : "Parenting ??safety camera + air purifier",
        int_energy: isKo ? "?먮꼫吏 ?덉빟 ???ㅻ쭏???뚮윭洹?+ 紐⑤땲?? : "Energy saving ??smart plug + monitor",
        int_safe: isKo ? "?덉쟾 以묒떆 ??移대찓??+ ?꾩뼱?? : "Safety ??camera + door lock",
        int_pet: isKo ? "??耳??????移대찓??+ 湲됱떇湲? : "Pet care ??pet camera + feeder",
        int_health: isKo ? "嫄닿컯 愿由????뚯튂 + 泥댁꽦遺꾧퀎" : "Health ??watch + body scale",
    };

    personaIds.forEach(id => {
        if (reasonMap[id]) reasons.push(reasonMap[id]);
    });

    // 吏곸젒 ?낅젰 移몄? 鍮꾩썙 ?먭퀬, ?먮룞 ?좏깮 ?곹깭??移대뱶濡쒕쭔 ?ㅻ챸
    const customInput = document.getElementById("device-custom");
    if (customInput) customInput.value = "";
    renderQ4Composer();
    updateStatePreview();
    updateStepInsight();

    // 踰꾪듉 ?쒖꽦 ?쒖떆
    const btn = document.getElementById("q4-auto-btn");
    if (btn) btn.classList.add("active");

    // ?좏깮 ?댁쑀 ?쒖떆
    if (reasons.length > 0) {
        const autoDeviceLabels = [...autoDevices].map((id) => getDeviceLabel(id)).filter(Boolean);
        const primaryLabels = autoDeviceLabels.slice(0, 5).join(", ");
        const supportingLabels = autoDeviceLabels.slice(5).join(", ");
        const partnerAutoLabels = autoDeviceLabels.filter((label) => {
            const input = [...(deviceGrid?.querySelectorAll('input[data-node-type="child"]') || [])]
                .find((node) => (node.dataset.label || node.value) === label);
            return input ? Q4_PARTNER_IDS.has(input.value) : false;
        });
        const reasonHtml = `
            <div class="q4-auto-reason" style="margin-top:10px;padding:10px 14px;background:#f0f4ff;border-radius:8px;border-left:3px solid #1976d2;font-size:.75rem;color:#333;line-height:1.6">
                <strong style="color:#1976d2">${isKo ? "?먮룞 ?좏깮 洹쇨굅" : "Auto-selection rationale"}</strong>
                <p style="margin:6px 0 0;color:#234">${isKo
                    ? `Q2?먯꽌 怨좊Ⅸ ?앺솢留λ씫怨??곗꽑?쒖쐞瑜?湲곗??쇰줈 <strong>${autoDevices.size}媛?湲곌린</strong>瑜?癒쇱? 異붾졇?듬땲?? ?듭떖 ?λ㈃??諛붾줈 留뚮뱾 ???덈뒗 ${escapeHtml(primaryLabels)} 議고빀??癒쇱? ?몄슦怨? 遺議깊븳 遺遺꾩? 媛먯?쨌蹂댁븞쨌?앺솢 ?몄쓽 湲곌린濡?蹂닿컯?덉뒿?덈떎.`
                    : `Based on the Q2 lifestyle context, the system first selected <strong>${autoDevices.size} devices</strong>. It starts with ${escapeHtml(primaryLabels)} for the core scene, then adds sensing, security, and convenience coverage where needed.`}</p>
                ${supportingLabels ? `<p style="margin:6px 0 0;color:#425466">${isKo
                    ? `蹂댁“ 湲곌린??${escapeHtml(supportingLabels)} 以묒떖?쇰줈 遺숈뿬?? ?⑥닚 ?섏뿴???꾨땲???ㅼ젣 ?몃━嫄곗? ?꾩냽 ?숈옉???댁뼱吏??議고빀???섎룄濡?援ъ꽦?덉뒿?덈떎.`
                    : `Supporting devices such as ${escapeHtml(supportingLabels)} were added so the setup forms a real trigger-to-action chain instead of a random bundle.`}</p>` : ""}
                <ul style="margin:4px 0 0 16px;padding:0">
                    ${reasons.map(r => `<li>${escapeHtml(r)}</li>`).join("")}
                </ul>
                ${partnerAutoLabels.length > 0 ? `<p style="margin:8px 0 0;color:#4b5563;font-size:.69rem">${isKo
                    ? `????명솚 湲곌린 ${partnerAutoLabels.join(", ")} ??SmartThings?먯꽌 ?쇱떛 ?뺤옣, 異쒖엯 媛먯?, ?앺솢 ?쒖뼱 踰붿쐞瑜??볧엳湲??꾪빐 ?ы븿?덉뒿?덈떎.`
                    : `Partner devices ${partnerAutoLabels.join(", ")} were included to extend trigger, sensing, or monitoring coverage in SmartThings.`}</p>` : ""}
                <p style="margin:6px 0 0;color:#888;font-size:.68rem">${isKo ? "吏곸젒 議곗젙???꾩슂?섎㈃ ?꾨옒?먯꽌 湲곌린瑜?異붽?/?댁젣?????덉뒿?덈떎." : "You can adjust selections below if needed."}</p>
            </div>`;
        const autoBtn = document.getElementById("q4-auto-btn");
        // 湲곗〈 ?댁쑀 移대뱶 ?쒓굅
        autoBtn?.parentElement?.querySelector(".q4-auto-reason")?.remove();
        if (autoBtn) autoBtn.insertAdjacentHTML("afterend", reasonHtml);
    }
}
// auto 紐⑤뱶 ?댁젣: 湲곌린 ?섎룞 ?좏깮 ??
function clearQ4AutoMode() {
    const customInput = document.getElementById("device-custom");
    if (customInput && customInput.value === "__auto__") customInput.value = "";
    const btn = document.getElementById("q4-auto-btn");
    if (btn) btn.classList.remove("active");
    // ?먮룞 ?좏깮 洹쇨굅 移대뱶 ?쒓굅
    btn?.parentElement?.querySelector(".q4-auto-reason")?.remove();
}

function handleDeviceCustomKeydown(event) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const entries = getCustomEntries(deviceCustomInput.value);
    deviceCustomInput.value = entries.join(", ");
    clearQ4AutoMode();
    updateStatePreview();
    updateStepInsight();
    renderQ4Summary();
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
    resultDiv.innerHTML = '<p class="error">濡쒖뺄 ?뚯씪???꾨땲???쒕쾭 二쇱냼 `http://127.0.0.1:8000/index.html` 濡??댁뼱???⑸땲??</p>';
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
    // ?대깽???꾩엫? renderExportActions ?대??먯꽌 泥섎━??

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
        resultDiv.innerHTML = `<p class="error">?곗씠?곕? 遺덈윭?ㅼ? 紐삵뻽?듬땲?? ${escapeHtml(String(error?.message || error))}. ?좎떆 ???ㅼ떆 ?쒕룄??二쇱꽭??</p>`;
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
        // Section header ??full-width label
        if (group.section) {
            return `<div class="device-section-header" style="grid-column:1/-1"><span>${escapeHtml(group.title)}</span></div>`;
        }
        const mode = group.mode || "checkbox";
        const isLegacy = !group.mode;
        const isChip = mode === "chip";
        const isRadio = mode === "radio";
        const isCardMulti = mode === "card-multi";
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

            // Chip mode ??toggle chips
            if (isChip) {
                return `
                    <label class="tree-chip ${childChecked ? "tree-chip--active" : ""}">
                        <input type="checkbox" value="${option.id}" data-kind="${kind}" data-node-type="child" data-group-id="${group.id}" data-label="${escapeHtml(option.label)}" ${childChecked ? "checked" : ""}>
                        <span>${escapeHtml(option.label)}</span>
                    </label>`;
            }

            // Radio card mode ??single select cards
            if (isRadio || isCardMulti) {
                return `
                    <label class="tree-card ${childChecked ? "tree-card--active" : ""}">
                        <input type="${isRadio ? "radio" : "checkbox"}" ${radioName ? `name="${radioName}"` : ""} value="${option.id}" data-kind="${kind}" data-node-type="child" data-group-id="${group.id}" data-label="${escapeHtml(option.label)}" ${childChecked ? "checked" : ""}>
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
        const modeClass = isChip ? " tree-children--chips" : (isRadio || isCardMulti) ? " tree-children--cards" : "";
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
        baseline: { ko: "湲곕낯 議고빀",       en: "Baseline" },
        energy:   { ko: "?먮꼫吏 ?덉빟??,    en: "Energy Saver" },
        care:     { ko: "耳???뺤옣??,     en: "Care+" },
        mood:     { ko: "臾대뱶 ?뺤옣??,     en: "Mood+" },
        security: { ko: "???쒗걧由ы떚??,    en: "Security" },
        chores:   { ko: "媛???ъ씤??,     en: "Chores All-in" },
        comfort:  { ko: "苡뚯쟻 ?섍꼍??,     en: "Air Comfort" },
        wellness: { ko: "嫄닿컯쨌?곕땲?ㅽ삎",    en: "Wellness" }
    };
    const icons = { baseline: "?벀", energy: "??, care: "?뮎", mood: "?렦", security: "?썳", chores: "?㏏", comfort: "?뙼", wellness: "?쭣" };
    const isKo = currentLocale === "ko";
    const title = (titles[presetId] || titles.baseline)[isKo ? "ko" : "en"];
    const icon = icons[presetId] || "?벀";

    // desc???꾩옱 移댄깉濡쒓렇???ㅼ젣 湲곌린?먯꽌 ?숈쟻 ?앹꽦
    const preset = Q4_PRESETS.find(p => p.id === presetId);
    let desc = "";
    if (preset) {
        const sLabels = preset.samsungIds.slice(0, 4).map(id => getDeviceLabel(id)).join(", ");
        const pLabels = preset.partnerIds.length > 0
            ? " + " + preset.partnerIds.slice(0, 3).map(id => getDeviceLabel(id)).join("쨌")
            : "";
        desc = sLabels + pLabels;
    }
    return { title, desc, icon };
}

function getQ4SummaryCopy() {
    if (currentLocale === "ko") {
        return {
            selected: "?꾩옱 諛섏쁺 湲곌린",
            capabilities: "媛?ν븳 湲곕뒫",
            limits: "?꾩옱 ?쒗븳",
            recommend: "異붿쿇 異붽? 湲곌린",
            empty: "湲곌린瑜?怨좊Ⅴ硫??ш린??媛?ν븳 ?쒕굹由ъ삤 踰붿쐞? ?쒓퀎媛 諛붾줈 蹂댁엯?덈떎."
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

    // ?? ?꾩옱 援?? 湲곗? 移댄깉濡쒓렇 ?곸슜 ??
    applyLocaleCatalog(countrySelect?.value || "SEC");

    // ?? 濡쒖????ㅻ뜑 ?숈쟻 媛깆떊 ??
    const localeInfo = getActiveLocaleInfo();
    const localeHeader = document.querySelector(".q4-locale-header");
    if (localeHeader) {
        const isKoH = currentLocale === "ko";
        const fallbackNotice = localeInfo.isFallback
            ? `<p class="q4-locale-fallback">${isKoH
                ? "?꾩옱 援?????곸꽭 ?쒗뭹 援ъ꽦??以鍮?以묒씠?댁꽌 ?좎궗 濡쒖???湲곗? ?쒗뭹援곗쓣 ?곗꽑 ?쒖떆?⑸땲??"
                : "Detailed product data for this market is being prepared. Showing similar locale products."}</p>`
            : "";
        localeHeader.innerHTML = `
            <div class="q4-locale-main">
                <span class="q4-locale-icon">?뙋</span>
                <span class="q4-locale-label">${isKoH ? "?꾩옱 ?쒗뭹 湲곗?" : "Product source"}: <strong>Samsung.com ${escapeHtml(localeInfo.country)} (${escapeHtml(localeInfo.siteCode.toLowerCase())})</strong></span>
            </div>
            <p class="q4-locale-sub">${isKoH
                ? "?꾨옒 議고빀? ?대떦 援?? ?쇱꽦?룹뺨 ?먮ℓ ?쒗뭹???곗꽑 諛섏쁺?덉뒿?덈떎. ?쇰? 湲곕뒫? SmartThings ?명솚 ???湲곌린媛 異붽?濡??꾩슂?????덉뒿?덈떎."
                : "Products below prioritize this market's Samsung.com lineup. Some features may require SmartThings-compatible partner devices."}</p>
            ${fallbackNotice}
        `;
    }

    const selectedDeviceIds = new Set(
        [...(deviceGrid?.querySelectorAll('input[data-node-type="child"]:checked') || [])].map((input) => input.value)
    );
    const isKo = currentLocale === "ko";

    // ?? ?ㅽ???議고빀 移대뱶 8媛???
    q4Presets.innerHTML = Q4_PRESETS.map((preset) => {
        const copy = getQ4PresetCopy(preset.id);
        const isActive = q4ActivePresets.has(preset.id);
        const custState = getPresetCustomizationState(preset, selectedDeviceIds);
        const custBadge = isActive && custState.customized
            ? `<span class="q4-cust-badge">${isKo ? "吏곸젒 議곗젙?? : "Customized"}</span>`
            : isActive && custState.expanded
                ? `<span class="q4-cust-badge q4-cust-expanded">${isKo ? "?뺤옣?? : "Expanded"}</span>`
                : "";

        // ?쇱꽦/?명솚 諛곗?
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
                <span class="q4-preset-icon">${copy.icon || "?벀"}</span>
                <strong class="q4-preset-title">${escapeHtml(copy.title)}</strong>
                ${custBadge}
                <div class="q4-card-badges">
                    ${samsungBadges}
                    ${partnerBadges ? `<span class="q4-badge-divider">+</span>${partnerBadges}` : ""}
                </div>
                ${preset.partnerIds.length === 0
                    ? `<span class="q4-card-tag q4-tag-samsung-only">${isKo ? "?쇱꽦 以묒떖" : "Samsung only"}</span>`
                    : `<span class="q4-card-tag q4-tag-partner-needed">${isKo ? "????뺤옣 媛?? : "Partner expandable"}</span>`}
            </button>
        `;
    }).join("");

    // ?? 吏곸젒 湲곌린 ?좏깮: ?쇱꽦 / ???遺꾨━ ??
    const allChipsEl = document.getElementById("q4-all-chips");
    if (allChipsEl) {
        const samsungHtml = renderQ4ChipSection(Q4_SAMSUNG_GROUPS, "samsung");
        const partnerHtml = renderQ4ChipSection(Q4_PARTNER_GROUPS, "partner");

        allChipsEl.innerHTML = `
            <div class="q4-direct-section q4-direct-samsung">
                <div class="q4-direct-section-head">
                    <span class="q4-direct-section-icon">?룫</span>
                    <span class="q4-direct-section-title">${isKo ? "?쇱꽦?룹뺨 Korea (sec) 湲곗? 援щℓ 媛???쒗뭹" : "Samsung.com Korea Products"}</span>
                </div>
                ${samsungHtml}
            </div>
            <div class="q4-direct-section q4-direct-partner">
                <div class="q4-direct-section-head">
                    <span class="q4-direct-section-icon">?뵕</span>
                    <span class="q4-direct-section-title">${isKo ? "SmartThings ?명솚 ????뚰듃??湲곌린" : "SmartThings Partner Devices"}</span>
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
        // ??湲곌린媛 ?대뼡 ?쒖꽦 ?꾨━?뗭뿉???랁븯吏 ?딅뒗 寃쎌슦 = ?ъ슜??吏곸젒 異붽?
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

function applyPersonaExclusiveRules(target, group) {
    if (!target.checked) return;

    const relatedInputs = [...group.querySelectorAll('input[data-node-type="child"]')];
    let exclusiveIds = [];

    if (group.dataset.groupId === "household" && Q2_HOUSEHOLD_CORE_IDS.includes(target.value)) {
        exclusiveIds = Q2_HOUSEHOLD_CORE_IDS;
    }

    if (!exclusiveIds.length) return;

    relatedInputs.forEach((input) => {
        if (input !== target && exclusiveIds.includes(input.value)) {
            input.checked = false;
        }
    });
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
        // ???꾨━?뗭쓽 怨좎쑀 湲곌린留??댁젣 (?ㅻⅨ ?쒖꽦 ?꾨━?뗪낵 寃뱀튂??湲곌린???좎?)
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
    // curation? "?쒕굹由ъ삤 留ㅼ묶 ?쒖옉" 踰꾪듉 ?대┃ ?쒖뿉留??ㅽ뻾
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
    // curation? "?쒕굹由ъ삤 留ㅼ묶 ?쒖옉" 踰꾪듉 ?대┃ ?쒖뿉留??ㅽ뻾
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

    if (deviceSet.has("TV")) capabilities.push(currentLocale === "ko" ? "TV瑜??뚮┝ ?덈툕???λ㈃ ?곗텧 ?ъ씤?몃줈 ?쒖슜 媛?? : "TV can act as a visible alert and scene anchor");
    else recommendations.push(currentLocale === "ko" ? "TV瑜??ｌ쑝硫?吏????λ㈃ ?곗텧怨??뚮┝ ?꾨떖???ъ썙吏묐땲??" : "Add a TV to make alerts and scene storytelling more visible.");

    if (deviceSet.has("?명긽湲?) || deviceSet.has("?명긽湲?嫄댁“湲?)) capabilities.push(currentLocale === "ko" ? "媛???먮룞?붿? ?명긽 猷⑦떞 以묒떖 ?쒕굹由ъ삤 援ъ꽦 媛?? : "Laundry-driven automation becomes credible");
    else limits.push(currentLocale === "ko" ? "媛???먮룞??異뺤씠 ?쏀빐???앺솢 諛李⑷컧??以꾩뼱??땲??" : "Without laundry devices, chore automation feels weaker.");

    if (deviceSet.has("?됱옣怨?)) capabilities.push(currentLocale === "ko" ? "?앹깮???몃뱶 耳???λ㈃源뚯? ?먯뿰?ㅻ읇寃??뺤옣 媛?? : "Food-care and kitchen routines can be included");
    else recommendations.push(currentLocale === "ko" ? "?됱옣怨좊? ?ｌ쑝硫?二쇰갑쨌?앹깮??硫붿떆吏源뚯? ?뺤옣?⑸땲??" : "Add a refrigerator to extend into food-care routines.");

    if (deviceSet.has("?먯뼱而?)) capabilities.push(currentLocale === "ko" ? "苡뚯쟻?굿룹뿉?덉? ?덇컧 硫붿떆吏瑜?諛붾줈 ?곌껐 媛?? : "Comfort and energy-saving scenarios become immediate");
    else limits.push(currentLocale === "ko" ? "洹媛 吏곹썑 苡뚯쟻???λ㈃???쏀빐吏????덉뒿?덈떎." : "Arrival comfort moments will be weaker without climate control.");

    if (deviceSet.has("?쇱꽌")) capabilities.push(currentLocale === "ko" ? "?ъ떎쨌遺??룰컧吏 湲곕컲 ?먮룞 ?ㅽ뻾 ?ㅺ퀎 媛?? : "Presence and trigger-based automation becomes possible");
    else {
        limits.push(currentLocale === "ko" ? "?쇱꽌媛 ?놁쑝硫?媛먯? 湲곕컲 ?먮룞?붾뒗 蹂댁닔?곸쑝濡??ㅻ챸?댁빞 ?⑸땲??" : "Without sensors, trigger automation must stay conservative.");
        recommendations.push(currentLocale === "ko" ? "?쇱꽌???덈툕瑜?異붽??섎㈃ ?먮룞???ㅻ뱷?μ씠 ?ш쾶 ?щ씪媛묐땲??" : "Add sensors or a hub to unlock stronger automation logic.");
    }

    if (!deviceSet.has("?ㅽ뵾而?)) {
        recommendations.push(currentLocale === "ko" ? "?ㅽ뵾而ㅻ? ?ｌ쑝硫??뚯꽦쨌臾대뱶 寃쏀뿕?????쎄쾶 ?곌껐?????덉뒿?덈떎." : "Add a speaker to support voice and mood-driven scenes.");
    }

    return { capabilities, limits, recommendations };
}

function renderQ4Summary() {
    if (!q4Summary) return;
    syncQ4QuickChipSelection();

    const isKo = currentLocale === "ko";
    const selectedLabels = getSelectedDeviceLabels();
    const selectedDevices = getSelectedDevices();
    const breakdown = getSelectedDeviceBreakdown();
    const selectedIds = new Set(breakdown.selectedIds);

    if (!selectedLabels.length) {
        const emptyMsg = isKo
            ? "湲곌린瑜?怨좊Ⅴ硫??ш린??媛?ν븳 ?쒕굹由ъ삤 踰붿쐞? ?쒓퀎媛 諛붾줈 蹂댁엯?덈떎."
            : "Choose devices to see what the scenario can realistically do.";
        q4Summary.innerHTML = `<p class="q4-summary-empty">${escapeHtml(emptyMsg)}</p>`;
        return;
    }

    // ?쇱꽦 / ???遺꾨쪟
    const samsungSelected = breakdown.samsungIds;
    const partnerSelected = breakdown.partnerIds;
    const otherSelected = breakdown.otherIds;
    const customSelected = breakdown.customEntries;

    const samsungChips = samsungSelected.map(id => `<span class="q4-summary-chip q4-chip-samsung">${escapeHtml(getDeviceLabel(id))}</span>`).join("");
    const partnerChips = partnerSelected.map(id => `<span class="q4-summary-chip q4-chip-partner">${escapeHtml(getDeviceLabel(id))}</span>`).join("");
    const otherChips = otherSelected.map(id => `<span class="q4-summary-chip">${escapeHtml(getDeviceLabel(id))}</span>`).join("");
    const customChips = customSelected.map(label => `<span class="q4-summary-chip q4-chip-custom">${escapeHtml(label)}</span>`).join("");

    // 而ㅼ뒪?곕쭏?댁쭠 ?곹깭
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
                ? `<span class="q4-cust-removed">${isKo ? "?쒓굅?? : "Removed"}: ${removed.map(id => escapeHtml(getDeviceLabel(id))).join(", ")}</span>`
                : "";
            const addedText = added.length > 0
                ? `<span class="q4-cust-added">${isKo ? "異붽??? : "Added"}: ${added.map(id => escapeHtml(getDeviceLabel(id))).join(", ")}</span>`
                : "";
            custStatusHtml = `
                <section class="q4-summary-block q4-summary-block--cust">
                    <span class="q4-summary-label">${isKo ? "而ㅼ뒪?곕쭏?댁쭠 ?곹깭" : "Customization"}</span>
                    <div class="q4-cust-details">${removedText}${addedText}</div>
                    <span class="q4-cust-note">${isKo ? "吏곸젒 湲곌린 ?좏깮?먯꽌 ?쇰? ??ぉ??蹂寃쎈릺?덉뒿?덈떎." : "Some items have been changed from the default card selection."}</span>
                </section>
            `;
        }
    }

    // 寃利??곹깭
    const hasCoreSamsung = samsungSelected.length >= 1;
    const needsPartner = partnerSelected.length > 0;
    let validationHtml = "";
    if (!hasCoreSamsung) {
        validationHtml = `<div class="q4-validation q4-validation--warn">${isKo
            ? "???ㅽ???議고빀???앹꽦?섎젮硫?理쒖냼 1媛??댁긽???듭떖 ?쇱꽦 ?쒗뭹???꾩슂?⑸땲??"
            : "At least one core Samsung product is required to generate a scenario."}</div>`;
    } else if (needsPartner) {
        validationHtml = `<div class="q4-validation q4-validation--info">${isKo
            ? "?꾩옱 ?좏깮??議고빀?먮뒗 SmartThings ?명솚 ???湲곌린媛 ?ы븿?섏뼱 ?덉뒿?덈떎. ?ㅼ젣 援ы쁽 ??異붽? 援щℓ ?먮뒗 ?명솚 ?щ? ?뺤씤???꾩슂?⑸땲??"
            : "Your selection includes SmartThings partner devices. Compatibility verification may be needed."}</div>`;
    } else {
        validationHtml = `<div class="q4-validation q4-validation--ok">${isKo
            ? "?꾩옱 ?좏깮??議고빀? ?쒓뎅 ?쇱꽦?룹뺨 ?먮ℓ ?쒗뭹 以묒떖?쇰줈 援ъ꽦?섏뼱 諛붾줈 ?쒕굹由ъ삤 ?앹꽦??媛?ν빀?덈떎."
            : "Your selection is based on Samsung.com Korea products and is ready for scenario generation."}</div>`;
    }

    // 湲곗〈 capability summary
    const capabilitySummary = buildQ4CapabilitySummary(selectedDevices);
    const capabilityMarkup = capabilitySummary.capabilities.slice(0, 3).map(item => `<li>${escapeHtml(item)}</li>`).join("");
    const limitMarkup = capabilitySummary.limits.slice(0, 2).map(item => `<li>${escapeHtml(item)}</li>`).join("");

    const deviceCount = breakdown.totalCount;
    const countLabel = isKo ? `湲곌린 ${deviceCount}媛??좏깮?? : `${deviceCount} devices selected`;
    const countSubLabel = isKo
        ? `?쇱꽦 ${breakdown.samsungCount}媛?{breakdown.partnerCount ? ` 쨌 ???${breakdown.partnerCount}媛? : ""}${breakdown.customEntries.length ? ` 쨌 吏곸젒?낅젰 ${breakdown.customEntries.length}媛? : ""}`
        : `Samsung ${breakdown.samsungCount}${breakdown.partnerCount ? ` 쨌 Partner ${breakdown.partnerCount}` : ""}${breakdown.customEntries.length ? ` 쨌 Custom ${breakdown.customEntries.length}` : ""}`;

    q4Summary.innerHTML = `
        <div class="q4-summary-count-wrap">
            <div class="q4-summary-count">${escapeHtml(countLabel)}</div>
            <div class="q4-summary-subcount">${escapeHtml(countSubLabel)}</div>
        </div>
        <section class="q4-summary-block">
            <span class="q4-summary-label">${isKo ? "?쇱꽦 援щℓ 媛???쒗뭹" : "Samsung Products"}</span>
            <div class="q4-summary-chip-row">${samsungChips || `<span class="q4-summary-empty-inline">${isKo ? "?놁쓬" : "None"}</span>`}</div>
        </section>
        ${partnerChips ? `<section class="q4-summary-block q4-summary-block--partner">
            <span class="q4-summary-label">${isKo ? "????명솚湲곌린" : "Partner Devices"}</span>
            <div class="q4-summary-chip-row">${partnerChips}</div>
        </section>` : ""}
        ${otherChips ? `<section class="q4-summary-block">
            <span class="q4-summary-label">${isKo ? "湲고?" : "Other"}</span>
            <div class="q4-summary-chip-row">${otherChips}</div>
        </section>` : ""}
        ${customChips ? `<section class="q4-summary-block q4-summary-block--tip">
            <span class="q4-summary-label">${isKo ? "吏곸젒 異붽???湲곌린" : "Custom devices"}</span>
            <div class="q4-summary-chip-row">${customChips}</div>
            <span class="q4-cust-note">${isKo ? "?낅젰李쎌뿉??Enter濡??뺤젙??湲곌린紐낆? ?ъ슜??異붽? ??ぉ?쇰줈 ?④퍡 諛섏쁺?⑸땲??" : "Device names confirmed with Enter are treated as user-added items."}</span>
        </section>` : ""}
        ${custStatusHtml}
        ${capabilityMarkup ? `<section class="q4-summary-block q4-summary-block--ok">
            <span class="q4-summary-label">${isKo ? "媛?ν븳 湲곕뒫" : "What this enables"}</span>
            <ul class="q4-summary-list">${capabilityMarkup}</ul>
        </section>` : ""}
        ${limitMarkup ? `<section class="q4-summary-block q4-summary-block--warn">
            <span class="q4-summary-label">${isKo ? "?꾩옱 ?쒗븳" : "Current limits"}</span>
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

    // Samsung.com ?쒖? 移댄뀒怨좊━ 寃쎈줈 ???遺遺?援???먯꽌 ?숈씪 ?⑦꽩 ?ъ슜
    // 留곹겕媛 404??寃쎌슦 Samsung.com???먯껜 由щ떎?대젆??泥섎━??
    const i = (ko, en) => currentLocale === "ko" ? ko : en;
    const categories = [
        { label: "TV", icon: "?벟", path: "/tvs/all-tvs/" },
        { label: i("?됱옣怨?, "Refrigerators"), icon: "?쭒", path: "/refrigerators/all-refrigerators/" },
        { label: i("?명긽쨌嫄댁“", "Washers & Dryers"), icon: "?ェ", path: "/washers-and-dryers/all-washers-and-dryers/" },
        { label: i("?먯뼱而?, "Air Conditioners"), icon: "?꾬툘", path: "/air-conditioners/all-air-conditioners/" },
        { label: i("怨듦린泥?젙湲?, "Air Care"), icon: "?뙩截?, path: "/air-care/all-air-care/" },
        { label: i("泥?냼湲?, "Vacuums"), icon: "?쨼", path: "/vacuum-cleaners/all-vacuum-cleaners/" },
        { label: i("?앷린?몄쿃湲?, "Dishwashers"), icon: "?띂截?, path: "/dishwashers/all-dishwashers/" },
        { label: "SmartThings", icon: "?룧", path: "/smartthings/all-smartthings/" },
        { label: i("?꾩껜 蹂닿린", "All Products"), icon: "?썟", path: "/offer/" }
    ];

    const title = i("Samsung ?먮ℓ ?쒗뭹 蹂닿린", "Browse Samsung Products");
    const desc = i(
        "?대떦 援?? Samsung.com?먯꽌 ?먮ℓ 以묒씤 ?쒗뭹??移댄뀒怨좊━蹂꾨줈 ?뺤씤?????덉뒿?덈떎. ?쒕굹由ъ삤??諛섏쁺??湲곌린瑜?吏곸젒 ?먯깋?섍퀬, ?ㅼ젣 ?먮ℓ 媛寃⑷낵 ?ㅽ럺??鍮꾧탳??蹂댁꽭??",
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

    applyPersonaExclusiveRules(target, group);

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

    updatePersonaGroupFooters();

    // Clear Q3 validation error on interaction
    clearQ3Error();
}

function clearQ3Error() {
    const errEl = resultDiv.querySelector('.error');
    if (errEl && (errEl.textContent.includes("?곸뿭?먯꽌") || errEl.textContent.includes("select at least"))) {
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

    // ?꾩떆紐?濡쒖???蹂????getCityDisplayValue媛 city_signals + KR_CITY_MASTER 紐⑤몢 寃??
    const localDisplayCity = getCityDisplayValue(country.countryCode, cityName) || cityName;

    // ??긽 ?쇱씠釉??쏆? API濡?理쒖떊 ?몃젋???뺣낫瑜?媛?몄샂
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
            a !== a.toLowerCase() || /[횪찼창찾채책챈챌챔챕챗챘챙챠챤챦챨챰챵처척천철첫첬청체첵첸첼]/i.test(a)
        );
        if (local && local.toLowerCase() !== name.toLowerCase()) return local;
    }
    return name;
}

/* ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧
   Searchable City Dropdown ??core logic
   ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧 */
let _cityItems = [];          // current items for dropdown
let _cityFocusIdx = -1;       // keyboard navigation index
let _cityDropdownOpen = false;
let _citySearchDebounceTimer = 0;

function getCityMasterFlat(master, useLocal) {
    const result = [];
    for (const [region, cities] of Object.entries(master)) {
        cities.forEach((c) => result.push({ ...c, region, local: c.local || "" }));
    }
    return result;
}

function getAvailableCitiesByCountry(countryCode) {
    if (!countryCode) return [];

    // KR ??use master data with region groups + population
    if (countryCode === "KR") {
        return getKrCityMasterFlat().map((c) => ({
            value: c.en,
            label: currentLocale === "ko" ? c.ko : c.en,
            pop: c.pop,
            region: c.region,
            searchText: `${c.en} ${c.ko}`.toLowerCase()
        }));
    }

    // Countries with CITY_MASTER data ??region-grouped dropdown
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

    // Other countries ??use city_signals.json
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
        ? "?꾩떆 寃???먮뒗 ?낅젰"
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

/* ?? Dropdown rendering ?? */
function formatPopulation(pop) {
    if (!pop) return "";
    if (pop >= 1000000) return `${(pop / 10000).toFixed(0)}留?;
    if (pop >= 10000) return `${(pop / 10000).toFixed(1)}留?;
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
        cityDropdown.innerHTML = `<div class="city-empty-msg">${currentLocale === "ko" ? "?깅줉???꾩떆媛 ?놁뒿?덈떎" : "No cities available"}</div>`;
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
                html += `<div class="city-option${selected}" data-idx="${idx}" data-value="${escapeHtml(item.value)}" role="option" aria-selected="${selected ? "true" : "false"}">
                    <span class="city-option-name">${highlightMatch(item.label, q)}</span>
                    ${popStr ? `<span class="city-option-pop">${popStr}</span>` : ""}
                </div>`;
                idx++;
            });
        }
    } else {
        filtered.forEach((item, idx) => {
            const selected = cityHiddenInput.value === item.value ? " selected" : "";
            html += `<div class="city-option${selected}" data-idx="${idx}" data-value="${escapeHtml(item.value)}" role="option" aria-selected="${selected ? "true" : "false"}">
                <span class="city-option-name">${highlightMatch(item.label, q)}</span>
            </div>`;
        });
    }

    // Custom search option ??always show when user typed something
    if (q) {
        const searchLabel = currentLocale === "ko"
            ? `"${escapeHtml(query.trim())}" 寃?됲븯湲?
            : `Search for "${escapeHtml(query.trim())}"`;
        html += `<div class="city-option city-option--custom" data-value="${escapeHtml(query.trim())}" data-custom="1" role="option" aria-selected="false">
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
    citySearchInput?.setAttribute("aria-expanded", "true");
    renderCityDropdownItems(citySearchInput.value);
}

function closeCityDropdown() {
    _cityDropdownOpen = false;
    _cityFocusIdx = -1;
    cityDropdown.classList.add("hidden");
    citySearchWrap.classList.remove("open");
    citySearchInput?.setAttribute("aria-expanded", "false");
    citySearchInput?.removeAttribute("aria-activedescendant");
}

function selectCity(value, label) {
    cityHiddenInput.value = value;
    citySearchInput.value = label || value;
    citySearchWrap.classList.toggle("has-value", !!value);
    closeCityDropdown();
    _magicSelected.clear();
    _magicAppliedSelected.clear();
    _customResearchData = null;
    // Trigger downstream updates
    updateStatePreview();
    if (value) {
        updateStepInsight();
        // renderCityProfileCard(); ???쏆? 3移대뱶 ?ㅽ궢, 由ъ쟾 ?몄궗?댄듃濡?諛붾줈 ?대룞
    } else {
        // No city ??show guide
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
    options.forEach((el) => {
        el.classList.remove("focused");
        el.removeAttribute("id");
    });
    if (idx < 0) idx = options.length - 1;
    if (idx >= options.length) idx = 0;
    _cityFocusIdx = idx;
    options[idx].classList.add("focused");
    options[idx].id = "city-option-active";
    citySearchInput?.setAttribute("aria-activedescendant", "city-option-active");
    options[idx].scrollIntoView({ block: "nearest" });
}

function initCitySearchDropdown() {
    // Focus ??open dropdown
    citySearchInput.addEventListener("focus", () => {
        openCityDropdown();
        // If has value, select text for easy re-search
        if (cityHiddenInput.value) citySearchInput.select();
    });

    // Input ??filter (debounced dropdown render for performance)
    citySearchInput.addEventListener("input", () => {
        // Clear selection immediately while typing (will be re-set on pick)
        cityHiddenInput.value = "";
        citySearchWrap.classList.remove("has-value");
        openCityDropdown();
        clearTimeout(_citySearchDebounceTimer);
        _citySearchDebounceTimer = setTimeout(() => {
            renderCityDropdownItems(citySearchInput.value);
            updateStatePreview();
        }, 80);
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
                // Enter with typed text ??use as custom city
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

    // Click outside ??close
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

    // Search icon button ??clear or toggle dropdown
    citySearchIcon.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (citySearchWrap.classList.contains("has-value")) {
            selectCity("", "");
            citySearchInput.value = "";
            citySearchInput.focus();
            return;
        }
        if (_cityDropdownOpen) closeCityDropdown();
        else {
            openCityDropdown();
            citySearchInput.focus();
        }
    });
}

function toggleCityCustomInput() {
    // No-op ??kept for backward compat
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
    decoratePersonaGroups();
    refreshQ3AutoSelectionUI();
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
    // Q1 吏곷Т ?좏깮 ?ㅽ궢 ??湲곕낯媛?"retail" ?먮룞 ?ㅼ젙, Q2遺???쒖옉
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

    // 吏덈Ц ?ㅻ뜑, Yes/No 踰꾪듉, 濡쒓렇?꾩썐 ?곸뿭 ?④린湲?
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

    // 媛?대뱶 移대뱶瑜??붾㈃ 留??꾨줈 ?ㅽ겕濡?
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
            <button type="button" class="generate-btn guide-footer-start-btn" id="guide-footer-start-btn">${currentLocale === "ko" ? "?쒖옉" : "Start"}</button>
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

    // No濡??④꼈???붿냼 蹂듭썝
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
    clearQ3AutoMode();
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
            ? `${seconds}珥?
            : currentLocale === "de"
                ? `${seconds} Sek.`
                : `${seconds}s`;
    }

    return currentLocale === "ko"
        ? `${minutes}遺?${seconds}珥?
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
    // Q1 ?ㅽ궢 ??Q2(2), Q3(3), Q4(4)留??쒖떆
    const steps = [
        { label: t("progress2"), step: 2 },
        { label: t("progress3"), step: 3 },
        { label: t("progress4"), step: 4 }
    ];
    const progressEl = document.getElementById("wizard-progress");
    progressEl.className = `wizard-progress wizard-progress--step-${currentStep}`;
    progressEl.innerHTML = steps.map(({ label, step }) => {
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

    if (currentStep === 3 && deferStep3InsightUntilInteraction) {
        stepInsight.classList.add("hidden");
        updateQuestionHelpers();
        return;
    }

    stepInsight.classList.remove("hidden");
    const insight = getStepInsight();
    stepInsight.innerHTML = buildInsightMarkup(insight);
    bindQ2EvidenceToggles(stepInsight);
    bindQ3RoutineToggles(stepInsight);
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

/** Q2 Hybrid 移대뱶 ??洹쇨굅 蹂닿린 ?꾩퐫?붿뼵 諛붿씤??*/
function bindQ2EvidenceToggles(container) {
    container.querySelectorAll(".q2-evidence-toggle[data-ev-target]").forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.dataset.evTarget;
            const detail = document.getElementById(targetId);
            if (!detail) return;
            const isOpen = detail.classList.contains("open");
            // 媛숈? ?덉씠????紐⑤뱺 ?대┛ ?뷀뀒???リ린
            const scope = btn.closest(".q2-scoreboard, .q2-stage-card, .q2-reference-shell") || container;
            const wrap = detail.closest(".q2-tag-row-wrap");

            scope.querySelectorAll(".q2-evidence-detail.open").forEach((openDetail) => {
                if (openDetail === detail) return;
                openDetail.classList.remove("open");
                openDetail.closest(".q2-tag-row-wrap")?.classList.remove("q2-tag-row-wrap--open");
            });
            scope.querySelectorAll(".q2-evidence-toggle.active").forEach((activeBtn) => {
                if (activeBtn === btn) return;
                activeBtn.classList.remove("active");
                activeBtn.setAttribute("aria-expanded", "false");
            });

            if (isOpen) {
                detail.classList.remove("open");
                btn.classList.remove("active");
                btn.setAttribute("aria-expanded", "false");
                wrap?.classList.remove("q2-tag-row-wrap--open");
            } else {
                detail.classList.add("open");
                btn.classList.add("active");
                btn.setAttribute("aria-expanded", "true");
                wrap?.classList.add("q2-tag-row-wrap--open");
                requestAnimationFrame(() => {
                    (wrap || detail).scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
                });
            }
        });
    });
}

function bindQ3RoutineToggles(container) {
    container.querySelectorAll(".q3-routine-toggle[data-routine-target]").forEach((button) => {
        button.addEventListener("click", () => {
            const detailId = button.dataset.routineTarget;
            const detail = container.querySelector(`#${detailId}`);
            if (!detail) return;
            const isOpen = !detail.hasAttribute("hidden");

            container.querySelectorAll(".q3-routine-detail").forEach((node) => node.setAttribute("hidden", ""));
            container.querySelectorAll(".q3-routine-toggle").forEach((node) => node.setAttribute("aria-expanded", "false"));

            if (!isOpen) {
                detail.removeAttribute("hidden");
                button.setAttribute("aria-expanded", "true");
            }
        });
    });
}

/** ?ㅼ퐫?대낫??踰붾? ?꾩?留??앹뾽 諛붿씤??*/
function bindLegendHelpButton(container) {
    const helpBtn = container.querySelector("#q2-legend-help-btn");
    if (!helpBtn) return;
    helpBtn.addEventListener("click", () => {
        showLegendHelpPopup();
    });
}

function showLegendHelpPopup() {
    // 湲곗〈 ?앹뾽???덉쑝硫??쒓굅
    const existing = document.getElementById("legend-help-overlay");
    if (existing) { existing.remove(); return; }

    const isKo = currentLocale === "ko";

    const content = isKo ? `
        <div class="legend-help-popup">
            <div class="legend-help-header">
                <h3>?ㅼ퐫?대낫??踰붾? 蹂대뒗 諛⑸쾿</h3>
                <button type="button" class="legend-help-close" id="legend-help-close">&times;</button>
            </div>
            <div class="legend-help-body">
                <section class="legend-help-section">
                    <h4>留됰? 諛?(2??援ъ“)</h4>
                    <p>媛?Explore ?쒓렇 ?놁뿉 <strong>2媛쒖쓽 留됰?</strong>媛 ?쒖떆?⑸땲??</p>
                    <div class="legend-help-table">
                        <div class="legend-help-row">
                            <span class="legend-help-bar-sample q2-score-bar--q1"></span>
                            <span><strong>醫뚯륫 (?뚮옉)</strong> ??Q1 ?꾩떆 留λ씫 ?먯닔</span>
                        </div>
                        <div class="legend-help-desc">?좏깮???꾩떆??湲고썑, ?명봽?? 嫄곗＜ ?뺥깭 ?깆뿉??異붾줎???먯닔</div>
                        <div class="legend-help-row">
                            <span class="legend-help-bar-sample q2-score-bar--q2"></span>
                            <span><strong>?곗륫 (珥덈줉)</strong> ??Q2 ?앺솢 留λ씫 ?먯닔</span>
                        </div>
                        <div class="legend-help-desc">?몃? 援ъ꽦, ?쇱씠?꾩뒪?뚯씠吏, ?앺솢 ?⑦꽩 ??吏곸젒 ?좏깮????ぉ?먯꽌 遺?щ맂 ?먯닔</div>
                    </div>
                    <div class="legend-help-example">
                        <p class="legend-help-example-title">?덉떆: "?먮꼫吏 ?덉빟" ?쒓렇</p>
                        <ul>
                            <li><span class="legend-help-bar-sample q2-score-bar--q1" style="width:60px"></span> Q1 ?뚮? 諛붽? 湲몃떎 ???꾩떆 ?꾨줈?꾩뿉??"?먮꼫吏 鍮꾩슜???믪? 吏???대씪???좏샇媛 ?≫????믪? ?먯닔</li>
                            <li><span class="legend-help-bar-sample q2-score-bar--q2" style="width:20px"></span> Q2 珥덈줉 諛붽? 吏㏓떎 ??Q2?먯꽌 ?먮꼫吏 愿???좏깮???섏? ?딆븘 ??? ?먯닔</li>
                        </ul>
                        <p class="legend-help-example-title">?덉떆: "媛議??뚮큵" ?쒓렇</p>
                        <ul>
                            <li><span class="legend-help-bar-sample q2-score-bar--q1" style="width:10px"></span> Q1 諛붽? 吏㏃쓬 ???꾩떆 ?먯껜?먯꽌??媛議??뚮큵 ?좏샇媛 ?쏀븿</li>
                            <li><span class="legend-help-bar-sample q2-score-bar--q2" style="width:70px"></span> Q2 諛붽? 湲몃떎 ???곸쑀???먮? 媛援?+ 留욌쾶?대? ?좏깮?댁꽌 ?믪? ?먯닔</li>
                        </ul>
                    </div>
                </section>

                <section class="legend-help-section">
                    <h4>?됱긽 ??(?대윭?ㅽ꽣 遺꾨쪟)</h4>
                    <p>媛??쒓렇???꾨옒 <strong>5媛??대윭?ㅽ꽣</strong> 以??섎굹???랁빀?덈떎. 媛숈? ?대윭?ㅽ꽣???좏샇媛 2媛??댁긽?대㈃ ?쒕꼫吏(x1.2)媛 ?곸슜?⑸땲??</p>
                    <div class="legend-help-clusters">
                        <div class="legend-help-cluster"><span class="q2-legend-dot" style="background:#dc2626"></span> <strong>?⑤?由?耳??/strong> ???꾩씠 ?뚮큵, ?쒕땲??耳?? 媛議??뚮큵</div>
                        <div class="legend-help-cluster"><span class="q2-legend-dot" style="background:#ea580c"></span> <strong>?쒓컙쨌?⑥쑉</strong> ??媛???꾩?, ?쒓컙 ?덉빟, 媛꾪렪 ?ъ슜</div>
                        <div class="legend-help-cluster"><span class="q2-legend-dot" style="background:#d97706"></span> <strong>?덉빟쨌鍮꾩슜</strong> ???먮꼫吏 ?덉빟, ?먮꼫吏 ?덇컧</div>
                        <div class="legend-help-cluster"><span class="q2-legend-dot" style="background:#16a34a"></span> <strong>嫄닿컯쨌?ш?</strong> ??嫄닿컯 愿由? ?숇㈃ ?꾩?, 遺꾩쐞湲??곗텧</div>
                        <div class="legend-help-cluster"><span class="q2-legend-dot" style="background:#2563eb"></span> <strong>?덉쟾쨌蹂댁븞</strong> ??吏??덉쟾, 蹂댁븞, 遺꾩떎臾?李얘린</div>
                    </div>
                </section>

                <section class="legend-help-section">
                    <h4>援먯감寃利?x1.5</h4>
                    <p>Q1(?꾩떆)怨?Q2(?앺솢) <strong>?묒そ?먯꽌 媛숈? ?쒓렇媛 ?꾩텧</strong>?섎㈃ 援먯감寃利?諛곗?媛 遺숆퀬 ?먯닔媛 <strong>1.5諛?/strong>濡?媛?곕맗?덈떎.</p>
                    <div class="legend-help-example">
                        <p class="legend-help-example-title">?덉떆</p>
                        <ul>
                            <li>?쒖슱 ?좏깮 ??Q1?먯꽌 "怨듦린吏?愿由? ?꾩텧 (誘몄꽭癒쇱? ?좏샇)</li>
                            <li>Q2?먯꽌 "苡뚯쟻??怨듦린" ?뚮쭏???좏깮</li>
                            <li>??"Keep the air fresh" ?쒓렇??<span class="q2-corro-badge" style="font-size:0.6rem">援먯감寃利?횞1.5</span> ?곸슜</li>
                        </ul>
                    </div>
                </section>

                <section class="legend-help-section">
                    <h4>醫낇빀 ?쎄린</h4>
                    <div class="legend-help-example" style="background:#f0f4ff">
                        <p style="font-family:monospace;font-size:0.75rem;line-height:1.8;margin:0">
                            <strong>"Keep your home safe" (???덉쟾쨌蹂댁븞)</strong><br>
                            <span class="legend-help-bar-sample q2-score-bar--q1" style="width:40px"></span> Q1: 8?????꾩떆??鍮덉쭛 蹂댁븞 ?댁뒋 ?좏샇<br>
                            <span class="legend-help-bar-sample q2-score-bar--q2" style="width:70px"></span> Q2: 14?????μ떆媛?遺??+ ?쒕땲??耳???좏깮<br>
                            <span class="q2-legend-dot" style="background:#2563eb;vertical-align:middle"></span> ?덉쟾쨌蹂댁븞 ?대윭?ㅽ꽣<br>
                            <span class="q2-corro-badge" style="font-size:0.6rem">援먯감寃利?횞1.5</span> ??理쒖쥌: (8+14) 횞 1.5 = <strong>33??/strong>
                        </p>
                    </div>
                    <p style="margin-top:8px;color:#666;font-size:0.75rem">???댁쓽 鍮꾩쑉??蹂대㈃ "???쒕굹由ъ삤媛 ?꾩떆 ?뱀꽦 ?뚮Ц???щ씪??嫄댁?, ?닿? ?좏깮???앺솢 留λ씫 ?뚮Ц?몄?"瑜?諛붾줈 ?뚯븙?????덉뒿?덈떎.</p>
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
                            <span><strong>Left (blue)</strong> ??Q1 City Context score</span>
                        </div>
                        <div class="legend-help-desc">Score inferred from city climate, infrastructure, and housing</div>
                        <div class="legend-help-row">
                            <span class="legend-help-bar-sample q2-score-bar--q2"></span>
                            <span><strong>Right (green)</strong> ??Q2 Lifestyle score</span>
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

    // ?リ린 ?대깽??
    overlay.querySelector("#legend-help-close")?.addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.remove();
    });
    // ESC ?ㅻ줈 ?リ린
    const escHandler = (e) => {
        if (e.key === "Escape") { overlay.remove(); document.removeEventListener("keydown", escHandler); }
    };
    document.addEventListener("keydown", escHandler);
}

/** ?쇱옄 ?먰삎 ?꾨줈洹몃젅?ㅻ? 0~100%濡??낅뜲?댄듃 */
function updatePizzaProgress(container, pct) {
    const wedge = container.querySelector("[data-pizza-wedge]");
    const label = container.querySelector("[data-pizza-pct]");
    if (!wedge) return;
    const clamped = Math.min(100, Math.max(0, pct));
    const cx = 20, cy = 20, r = 18;
    if (clamped <= 0) {
        wedge.setAttribute("d", "");
    } else if (clamped >= 100) {
        // ?꾩쟾????
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
                label: currentLocale === "ko" ? "?ㅼ쓬 ?≪뀡" : currentLocale === "de" ? "N채chster Schritt" : "Next move",
                value: insight.action
            } : null,
            insight.signal ? {
                label: currentLocale === "ko" ? "?꾩옱 ?좏샇" : currentLocale === "de" ? "Aktuelles Signal" : "Current signal",
                value: insight.signal
            } : null
        ].filter(Boolean).map((row) => `
            <div class="insight-row">
                <span class="insight-label">${escapeHtml(row.label)}</span>
                <p>${escapeHtml(row.value)}</p>
            </div>
        `).join("");
    // [Source] {Title} ??{Publisher/Org}, {YYYY-MM-DD}. {吏㏃? ?꾨찓??URL}
    const formatSourceCitation = (item) => {
        const title = String(item.source_title || "").trim();
        const org = String(item.source_org || "").trim();
        const date = String(item.source_date || "").trim();
        const rawUrl = String(item.source_url || "").trim();
        if (!title && !org) return "";
        const shortDomain = rawUrl ? rawUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "") : "";
        const linkUrl = rawUrl || `https://www.google.com/search?q=${encodeURIComponent([title, org, date].filter(Boolean).join(" "))}`;
        // ?몃씪??異쒖쿂 ?띿뒪??
        const parts = [];
        if (title) parts.push(title);
        if (org) parts.push(`??${org}`);
        if (date) parts.push(date);
        const citation = parts.join(", ");
        // ?꾨찓???쒓렇 (?대┃ ???먮Ц?쇰줈 ?대룞)
        const domainLabel = shortDomain || org || "source";
        const domainTag = `<a class="evidence-source-tag" href="${escapeHtml(linkUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(domainLabel)}</a>`;
        return `<span class="trend-source-line">[Source] ${escapeHtml(citation)} ${domainTag}</span>`;
    };

    // ?뱀뀡蹂?媛곸＜ ?섏쭛湲?
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
        if (org) parts.push(`??${org}`);
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
                // pains/solutions: "text\n?뮕 insight" ?뺥깭 吏??
                if (typeof item === "string" && item.includes("\n?뮕")) {
                    const [mainText, ...insightParts] = item.split("\n?뮕");
                    const insightText = insightParts.join("\n?뮕").trim();
                    return `<li>${escapeHtml(mainText)}${insightText ? `<span class="trend-evidence">?뮕 ${escapeHtml(insightText)}</span>` : ""}</li>`;
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
            const confidenceBadge = item.confidence === "high" ? "?? : item.confidence === "medium" ? "?좑툘" : "?뱄툘";
            const sourceUrl = item.source_url || "";
            const urlLink = sourceUrl
                ? `<a class="source-detail-url" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">?뵕 ${escapeHtml(sourceUrl.length > 80 ? sourceUrl.slice(0, 80) + "?? : sourceUrl)}</a>`
                : "";
            return `
                <span class="insight-evidence-chip" data-ev-detail="${detailId}">
                    ${escapeHtml(domainLabel)} ${confidenceBadge}
                </span>
                <div class="insight-evidence-detail" id="${detailId}">
                    <p class="source-detail-label">${escapeHtml(item.title || domainLabel)}</p>
                    <p class="source-detail-snippet">${escapeHtml(item.snippet || "??)}</p>
                    <p class="source-detail-meta">${currentLocale === "ko" ? "?좊ː?? : "Confidence"}: ${confidenceBadge} ${escapeHtml(item.confidence || "??)} 쨌 ${escapeHtml(item.collected_at_utc ? new Date(item.collected_at_utc).toLocaleString() : "??)}</p>
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

    // customHtml???덉쑝硫??꾩슜 ?뚮뜑留?
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
        title: currentLocale === "ko" ? `${getRoleTitle(role.id)} 愿?먯뿉?쒕뒗 ?대윴 ?먮쫫???좊━?⑸땲?? : currentLocale === "de" ? `Aus der Perspektive ${getRoleTitle(role.id)} wirkt dieser Aufbau st채rker` : `${getRoleTitle(role.id)} is likely to respond better to this flow`,
        summary: currentLocale === "ko"
            ? `${getRoleFocus(role.id)} 湲곗??쇰줈 寃곌낵臾쇱쓽 援ъ“瑜?癒쇱? ?뺣젹?덉뒿?덈떎.`
            : currentLocale === "de"
                ? `Die Ergebnisstruktur wurde zuerst an ${getRoleFocus(role.id)} ausgerichtet.`
                : `The output structure is now aligned to ${getRoleFocus(role.id)} first.`,
        body: currentLocale === "ko"
            ? `${getRoleFocus(role.id)} 愿?먯뿉?쒕뒗 湲곕뒫 ?뚭컻蹂대떎 ${getRoleBrief(role.id).replace(".", "")} ?먮쫫?????ㅻ뱷???덉뒿?덈떎. ?ㅼ쓬 ?④퀎?먯꽌????愿?먯뿉 留욌뒗 吏??낵 ?寃잛쓣 ?≪븘蹂대㈃ ?⑸땲??`
            : currentLocale === "de"
                ? `Aus Sicht von ${getRoleFocus(role.id)} ist dieser Aufbau meist 체berzeugender: ${getRoleBrief(role.id)} Als N채chstes lohnt es sich, Markt und Zielgruppe passend dazu einzugrenzen.`
                : `From a ${getRoleFocus(role.id)} perspective, this path is usually stronger: ${getRoleBrief(role.id)} Next, narrow the market and audience to match that lens.`,
        spotlight: currentLocale === "ko"
            ? `${getRoleTitle(role.id)}??寃곌낵臾쇱쓽 泥?臾몄옣怨??뺣낫 諛?꾨? 寃곗젙?⑸땲??`
            : currentLocale === "de"
                ? `${getRoleTitle(role.id)} bestimmt den ersten Satz und die Informationsdichte des Ergebnisses.`
                : `${getRoleTitle(role.id)} will shape the first line and information density of the output.`,
        chips: [getRoleTitle(role.id), getRoleFocus(role.id)],
        rows: [
            {
                label: currentLocale === "ko" ? "媛뺥븯寃?媛?????ъ씤?? : currentLocale === "de" ? "St채rker betonen" : "Lean into",
                value: currentLocale === "ko"
                    ? getRoleBrief(role.id)
                    : currentLocale === "de"
                        ? getRoleBrief(role.id)
                        : getRoleBrief(role.id)
            },
            {
                label: currentLocale === "ko" ? "?ㅼ쓬???뺥븷 寃? : currentLocale === "de" ? "Als N채chstes festlegen" : "Next decision",
                value: currentLocale === "ko"
                    ? "Q1?먯꽌 援??? ?꾩떆瑜?援ъ껜?뷀빐 ??愿?먯씠 媛????癒뱁엳???λ㈃??醫곹?蹂댁꽭??"
                    : currentLocale === "de"
                        ? "Pr채zisieren Sie in Q1 Land und Region, damit der st채rkste Nutzungsmoment klarer wird."
                        : "Use Q1 to narrow the country and city so the strongest usage moment becomes clearer."
            }
        ]
    };
}

function buildStep2Insight() {
    return {
        badge: currentLocale === "ko" ? "Q1 Region" : "Q1 Region",
        title: currentLocale === "ko" ? "援??? ?꾩떆瑜??좏깮??二쇱꽭?? : "Select a country and city",
        summary: currentLocale === "ko"
            ? "?꾩떆瑜??좏깮?섎㈃ 湲곕낯 吏???꾨줈?꾩씠 ?쒖떆?⑸땲?? ?곸꽭 ?몄궗?댄듃??Build ??AI媛 ?먮룞 ?섏쭛?⑸땲??"
            : "Select a city to see its basic profile. Detailed insights will be collected by AI during Build."
    };
}

function buildStep2CitySelectGuide(countryCode) {
    const countryName = getCountryName(countryCode);
    return {
        badge: currentLocale === "ko" ? "Q1 City" : "Q1 City",
        title: currentLocale === "ko"
            ? `${countryName} ?꾩떆瑜??좏깮??二쇱꽭??
            : `Select a city in ${countryName}`,
        summary: currentLocale === "ko"
            ? "?꾩떆瑜??좏깮?섎㈃ ?대떦 援??+?꾩떆 湲곗?????븷蹂??ㅻТ ?몄궗?댄듃媛 諛붾줈 ?쒖떆?⑸땲??"
            : "Choose a city to load role-specific execution insight for that country and city."
    };
}

async function renderStep2Insight(forceRefresh = false) {
    // Q1(step 2)???꾨땲硫??뚮뜑留곹븯吏 ?딆쓬
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

    // 1. sessionStorage 罹먯떆 ?뺤씤
    const cacheKey = `city-profile-${country.countryCode}-${city}-${currentLocale}`;
    const cached = sessionStorage.getItem(cacheKey);
            if (cached && !forceRefresh) {
        try {
            const profile = JSON.parse(cached);
            if (currentStep !== 2) return;
            stepInsight.innerHTML = renderCityProfileInsight(countryName, localCity, profile);
            bindCityProfileDrawer(stepInsight);
            bindQ2EvidenceToggles(stepInsight);
            updateQuestionHelpers();
            // ?꾨줈??濡쒕뱶 ???ㅼ쓬 踰꾪듉??蹂댁씠?꾨줉 ?ㅽ겕濡?
            requestAnimationFrame(() => {
                const wizardActions = document.querySelector(".wizard-actions");
                if (wizardActions) wizardActions.scrollIntoView({ behavior: "smooth", block: "end" });
            });
            return;
        } catch { /* cache invalid, fetch fresh */ }
    }

    // 2. 濡쒕뵫 ?쒖떆
    if (currentStep !== 2) return;
    stepInsight.innerHTML = buildInsightMarkup({
        badge: "Q1 Region",
        title: `${countryName} ${localCity}`,
        summary: currentLocale === "ko"
            ? "AI瑜??듯븳 留덉폆 由ъ꽌移?以묒엯?덈떎..."
            : "AI market research in progress...",
        loading: true,
        loadingLabel: currentLocale === "ko" ? "AI瑜??듯븳 留덉폆 由ъ꽌移?以?.." : "AI market research in progress..."
    });
    updateQuestionHelpers();

    // ?쇱옄 ?꾨줈洹몃젅???쒕??덉씠??(0??0% 援ш컙???쒖꽌??梨꾩?)
    let pizzaProgress = 0;
    let pizzaDone = false;
    const pizzaInterval = setInterval(() => {
        if (pizzaDone || currentStep !== 2) { clearInterval(pizzaInterval); return; }
        // ?먯젏 ?먮젮吏硫?90%源뚯? ?묎렐 (30珥???꾩븘?껋뿉 留욎땄)
        pizzaProgress += (90 - pizzaProgress) * 0.035;
        updatePizzaProgress(stepInsight, Math.min(pizzaProgress, 90));
    }, 200);

    // 3. ?쇱씠釉?API ?몄텧
    try {
        await ensureBypassSession();
        const params = new URLSearchParams({ country: country.countryCode, city, locale: currentLocale });
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 45000);

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
                // 罹먯떆 ???(step怨?臾닿??섍쾶)
                sessionStorage.setItem(cacheKey, JSON.stringify(result.data));
                // 100%濡?梨꾩슦怨??꾨즺
                pizzaDone = true; clearInterval(pizzaInterval);
                if (currentStep !== 2) return;
                updatePizzaProgress(stepInsight, 100);
                await new Promise(r => setTimeout(r, 400));
                if (currentStep !== 2) return;
                stepInsight.innerHTML = renderCityProfileInsight(countryName, localCity, result.data);
                bindCityProfileDrawer(stepInsight);
                bindQ2EvidenceToggles(stepInsight);
                updateQuestionHelpers();
                stepInsight.classList.remove("insight-refresh");
                void stepInsight.offsetWidth;
                stepInsight.classList.add("insight-refresh");
                // ?꾨줈??濡쒕뱶 ???ㅼ쓬 踰꾪듉??蹂댁씠?꾨줉 ?ㅽ겕濡?
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

    // 4. API ?ㅽ뙣 ?????뺤쟻 ?곗씠???놁씠 ?ъ떆???덈궡留??쒖떆
    stepInsight.innerHTML = buildInsightMarkup(buildStep2ErrorInsight(
        currentLocale === "ko"
            ? "AI 留덉폆 由ъ꽌移??묐떟??吏?곕릺怨??덉뒿?덈떎. ?좎떆 ???ㅼ떆 ?쒕룄??二쇱꽭??"
            : "AI market research response is delayed. Please try again shortly."
    ));
    bindInsightRetryButton(stepInsight);
    updateQuestionHelpers();
    stepInsight.classList.remove("insight-refresh");
    void stepInsight.offsetWidth;
    stepInsight.classList.add("insight-refresh");
}

/**
 * 10移댄뀒怨좊━ ?꾩떆 ?꾨줈?꾩쓣 ?몄궗?댄듃 移대뱶 HTML濡??뚮뜑留?
 */
/** 10移댄뀒怨좊━ ?뺤쓽 ??renderCityProfileInsight + ?ㅻ쭏??濡쒕뵫?먯꽌 怨듭쑀 */
const CITY_PROFILE_CATEGORIES = [
    { key: "climate",      icon: "?뙟", labelKo: "湲고썑쨌怨꾩젅",    labelEn: "Climate",      color: "#1976d2" },
    { key: "housing",      icon: "?룫", labelKo: "二쇨굅 ?뺥깭",    labelEn: "Housing",      color: "#6d4c41" },
    { key: "family",       icon: "?뫅?랅윉⒱랅윉?, labelKo: "媛議굿룸룎遊?,    labelEn: "Family",       color: "#e91e63" },
    { key: "daily_rhythm", icon: "??, labelKo: "?쇱긽 由щ벉",    labelEn: "Daily Rhythm", color: "#ff6f00" },
    { key: "safety",       icon: "?썳", labelKo: "?덉쟾쨌蹂댁븞",    labelEn: "Safety",       color: "#2e7d32" },
    { key: "energy",       icon: "??, labelKo: "?먮꼫吏",       labelEn: "Energy",       color: "#f9a825" },
    { key: "health",       icon: "?뮞", labelKo: "嫄닿컯쨌?곕땲??,  labelEn: "Health",       color: "#00897b" },
    { key: "pets",         icon: "?맽", labelKo: "???쇱씠??,    labelEn: "Pets",         color: "#8d6e63" },
    { key: "mobility",     icon: "?쉯", labelKo: "?대룞쨌遺??,    labelEn: "Mobility",     color: "#5c6bc0" },
    { key: "events",       icon: "?렕", labelKo: "臾명솕 ?됱궗",    labelEn: "Events",       color: "#d32f2f" }
];

function getCityProfileSourceMap(profile) {
    return Array.isArray(profile?.source_map) ? profile.source_map : [];
}

function getCityProfileEvidenceEntry(profile, key) {
    return profile?.evidence_pack && typeof profile.evidence_pack === "object"
        ? profile.evidence_pack[key] || null
        : null;
}

function buildCityProfileEvidenceDetail(profile, key) {
    const entry = getCityProfileEvidenceEntry(profile, key);
    if (!entry || typeof entry !== "object") return "";

    const statement = String(entry.localized_statement || "").trim();
    const whyLocalized = String(entry.why_localized || "").trim();
    const scenarioUse = String(entry.reusability_for_scenario_agent || "").trim();
    const smartHome = String(entry.smart_home_relevance || "").trim();
    const marketing = String(entry.marketing_relevance || "").trim();
    const missingEvidence = String(entry.missing_evidence || "").trim();
    const confidence = String(entry.confidence || "").trim();
    const evidenceIds = Array.isArray(entry.evidence_ids) ? entry.evidence_ids.filter(Boolean) : [];
    const sources = getCityProfileSourceMap(profile)
        .filter((item) => evidenceIds.includes(item.id))
        .slice(0, 4);

    if (!whyLocalized && !scenarioUse && !smartHome && !marketing && !sources.length && !missingEvidence && !confidence) {
        return "";
    }

    const detailId = `city-ev-${key}-${Math.random().toString(36).slice(2, 10)}`;
    const sourceHtml = sources.length
        ? `<ul class="q2-evidence-source-list">${sources.map((item) => {
            const label = [item.id, item.organization || item.title].filter(Boolean).join(" · ");
            const safeUrl = item.url && /^https?:\/\//i.test(item.url) ? item.url : "";
            const href = safeUrl ? ` href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer"` : "";
            return `<li>${href ? `<a${href}>${escapeHtml(label)}</a>` : escapeHtml(label)}</li>`;
        }).join("")}</ul>`
        : "";

    return `
        <button type="button" class="q2-evidence-toggle q2-evidence-toggle--compact" data-ev-target="${detailId}" aria-expanded="false" aria-controls="${detailId}">
            <span class="q2-ev-arrow">▾</span> ${currentLocale === "ko" ? "근거 보기" : "View evidence"}
        </button>
        <div class="q2-evidence-detail" id="${detailId}">
            ${whyLocalized ? `<p><strong>${currentLocale === "ko" ? "현지화 근거" : "Why localized"}</strong> ${escapeHtml(whyLocalized)}</p>` : ""}
            ${confidence ? `<p><strong>${currentLocale === "ko" ? "신뢰도" : "Confidence"}</strong> ${escapeHtml(confidence)}</p>` : ""}
            ${scenarioUse ? `<p><strong>${currentLocale === "ko" ? "시나리오 활용" : "Scenario use"}</strong> ${escapeHtml(scenarioUse)}</p>` : ""}
            ${smartHome ? `<p><strong>${currentLocale === "ko" ? "스마트홈 연관성" : "Smart-home relevance"}</strong> ${escapeHtml(smartHome)}</p>` : ""}
            ${marketing ? `<p><strong>${currentLocale === "ko" ? "마케팅 연관성" : "Marketing relevance"}</strong> ${escapeHtml(marketing)}</p>` : ""}
            ${missingEvidence && statement === "Evidence insufficient for localized claim." ? `<p><strong>${currentLocale === "ko" ? "부족한 근거" : "Missing evidence"}</strong> ${escapeHtml(missingEvidence)}</p>` : ""}
            ${sourceHtml}
        </div>
    `;
}

function renderCityProfileInsight(countryName, localCity, profile) {
    const isKo = currentLocale === "ko";
    const available = CITY_PROFILE_CATEGORIES.filter(cat => profile[cat.key]);

    // ?꾩떆 ?꾨줈?꾩쓣 ?꾩뿭 ???(?쒓렇 ?좏깮 ??移대뱶 ?뚮뜑???ъ슜)
    _latestCityProfile = { countryName, localCity, profile, available };

    // 諛뷀??쒗듃 肄섑뀗痢?以鍮?
    const categoriesHtml = available.map(cat => `
        <div class="cpv2-item" style="--cpv2-accent:${cat.color}">
            <div class="cpv2-icon">${cat.icon}</div>
            <div class="cpv2-content">
                <span class="cpv2-label">${escapeHtml(isKo ? cat.labelKo : cat.labelEn)}</span>
                <span class="cpv2-text">${escapeHtml(profile[cat.key])}</span>
                ${buildCityProfileEvidenceDetail(profile, cat.key)}
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
                <span class="cpv2-badge">${isKo ? "AI ?꾩떆 ?꾨줈?? : "AI City Profile"}</span>
                <button type="button" class="cpv2-sheet-close" aria-label="Close">&times;</button>
            </div>
        </div>
        <div class="city-profile-grid">${categoriesHtml}</div>
    `;

    // Magic Setup: ?쒓렇 ?좏깮??UI
    const tagsHtml = available.map(cat => `
        <button type="button" class="magic-tag" data-cat-key="${cat.key}" style="--magic-accent:${cat.color}">
            <span class="magic-tag-icon">${cat.icon}</span>
            <span class="magic-tag-label">${escapeHtml(isKo ? cat.labelKo : cat.labelEn)}</span>
        </button>
    `).join("");

    const customPlaceholder = isKo
        ? "?? 寃⑥슱泥??쒗뙆 ?鍮? 誘몄꽭癒쇱? ?ы븳 吏?? ?ㅻЦ??媛?? 諛섏????듦린 臾몄젣, ?쒗뭾 ??? ?댁븞 ?꾩떆..."
        : "e.g. extreme winter cold, high pollution area, multicultural household, coastal typhoon zone...";

    return `
        <div class="magic-setup">
            <div class="magic-header">
                <span class="magic-city">${flag} ${escapeHtml(localCity)}</span>
                <span class="magic-prompt">${isKo ? "吏湲?媛??怨좊??섎뒗 ?ㅼ썙?쒕? 怨⑤씪二쇱꽭?? : "Pick the topics that matter most to you"} <em>(${isKo ? "理쒕? 3媛? : "up to 3"})</em></span>
            </div>
            <div class="magic-tags">${tagsHtml}</div>
            <div class="magic-cards" id="magic-cards"></div>
            <div class="magic-actions" id="magic-actions" style="display:none">
                <div class="magic-action-block">
                    <p class="magic-action-caption">${isKo ? "湲곕낯 ?좏깮 諛섏쁺" : "Apply selected categories"}</p>
                    <button type="button" class="magic-apply-btn" id="magic-apply-btn">
                        ${isKo ? "?좏깮??湲곕낯 ?앺솢 ?ㅼ썙??諛섏쁺" : "Apply selected base categories"}
                    </button>
                </div>
                <button type="button" class="cpv2-sheet-trigger magic-all-btn">
                    ${isKo ? "?꾩껜 ?꾩떆 ?꾨줈??蹂닿린" : "View full city profile"}
                </button>
            </div>
            <div class="magic-custom-research" id="magic-custom-research">
                <div class="magic-custom-header">
                    <span class="magic-custom-icon">?뵊</span>
                    <span class="magic-custom-label">${isKo ? "??10媛??몄뿉 諛섏쁺?섍퀬 ?띠? 吏???뱀깋???덈굹??" : "Any local specifics beyond the 10 categories above?"}</span>
                </div>
                <div class="magic-custom-input-row">
                    <input type="text" id="magic-custom-input" class="magic-custom-input"
                        placeholder="${escapeHtml(customPlaceholder)}" />
                    <button type="button" id="magic-custom-search-btn" class="magic-custom-search-btn">
                        ${isKo ? "寃?됲븯湲? : "Search"}
                    </button>
                </div>
                <div id="magic-custom-result" class="magic-custom-result" style="display:none"></div>
            </div>
            <div id="q1-scenario-reference-card">${buildQ1ScenarioReferencePanelHtml()}</div>
        </div>
    `;
}

function releaseDeferredStep3Insight() {
    if (currentStep !== 3 || !deferStep3InsightUntilInteraction) return;
    deferStep3InsightUntilInteraction = false;
    updateStepInsight();
}

let _pendingCitySheetHtml = "";
let _latestCityProfile = null;
let _magicSelected = new Set();
let _magicAppliedSelected = new Set();

/**
 * ?뺤쟻 city_signals fallback
 */
function bindCityProfileDrawer(container) {
    // 諛뷀??쒗듃 "?꾩껜 蹂닿린" ?몃━嫄?
    container.querySelectorAll(".cpv2-sheet-trigger").forEach(btn => {
        btn.addEventListener("click", () => openCitySheet());
    });

    // Magic Setup ?쒓렇 ?좏깮
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

    // "?쒕굹由ъ삤??諛섏쁺?섍린" 踰꾪듉
    const applyBtn = container.querySelector("#magic-apply-btn");
    if (applyBtn) {
        applyBtn.addEventListener("click", () => {
            if (_magicSelected.size === 0) return;
            const isKo = currentLocale === "ko";
            _magicAppliedSelected = new Set(_magicSelected);
            const keywords = [..._magicSelected].map(key => {
                const cat = CITY_PROFILE_CATEGORIES.find(c => c.key === key);
                return cat ? (isKo ? cat.labelKo : cat.labelEn) : key;
            });

            // ?쒓컖 ?쇰뱶諛? 諛섏쁺 ?뺤씤 + ?대뵒??諛섏쁺?섎뒗吏 ?ㅻ챸
            applyBtn.innerHTML = isKo
                ? `<span style="color:#4caf50">&#10003;</span> 諛섏쁺 ?꾨즺 ???쒕굹由ъ삤 留ㅼ묶 + AI ?앹꽦???곸슜?⑸땲??
                : `<span style="color:#4caf50">&#10003;</span> Applied ??will influence matching + AI generation`;
            applyBtn.disabled = true;

            // state preview ?낅뜲?댄듃 (?덈떎硫?
            updateStatePreview();

            setTimeout(() => {
                applyBtn.innerHTML = isKo ? "?좏깮??湲곕낯 ?앺솢 ?ㅼ썙??諛섏쁺" : "Apply selected base categories";
                applyBtn.disabled = false;
            }, 2500);

            renderQ1ScenarioReferencePanel(container);
        });
    }

    // ?? 而ㅼ뒪? 由ъ꽌移? 吏곸젒 ?낅젰 ??AI 寃????
    const customSearchBtn = container.querySelector("#magic-custom-search-btn");
    const customInput = container.querySelector("#magic-custom-input");
    const customResult = container.querySelector("#magic-custom-result");

    if (customSearchBtn && customInput && customResult) {
        customSearchBtn.addEventListener("click", () => {
            const query = customInput.value.trim();
            if (!query) return;
            runCustomCityResearch(query, customResult, container);
        });
        // Enter?ㅻ줈??寃??
        customInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                customSearchBtn.click();
            }
        });
    }

    renderQ1ScenarioReferencePanel(container);
}

/** 而ㅼ뒪? ?꾩떆 由ъ꽌移???AI 留덉폆 由ъ꽌移??ㅽ뻾 */
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

function normalizeCustomResearchData(query, data) {
    let source = data;
    if (typeof source === "string") {
        source = parseJsonObjectFromText(source) || { raw: source };
    }
    if (source?.raw && typeof source.raw === "string") {
        const reparsed = parseJsonObjectFromText(source.raw);
        if (reparsed) source = reparsed;
    }
    if (source?.data && typeof source.data === "object") source = source.data;
    if (!source || typeof source !== "object") source = {};

    const rawText = typeof source.raw === "string"
        ? source.raw
        : (typeof data === "string" ? data : JSON.stringify(source));
    const profileKeys = ["climate", "housing", "family", "daily_rhythm", "safety", "energy", "health", "pets", "mobility", "events"];
    const profileFindings = profileKeys
        .filter((key) => typeof source[key] === "string" && source[key].trim())
        .slice(0, 4)
        .map((key) => ({
            title: key.replace(/_/g, " "),
            summary: String(source[key]).trim(),
            scenario_implication: currentLocale === "ko"
                ? `"${query}"? 愿?⑤맂 ?ъ슜 ?λ㈃?????앺솢 留λ씫??留욊쾶 ?쒕굹由ъ삤???곌껐?⑸땲??`
                : `Connect "${query}" to this living context in the scenario.`
        }));

    const normalized = {
        keyword_interpretation: typeof source.keyword_interpretation === "string" ? source.keyword_interpretation.trim() : "",
        search_intents: Array.isArray(source.search_intents) ? source.search_intents.filter((item) => typeof item === "string" && item.trim()) : [],
        city_keyword_findings: Array.isArray(source.city_keyword_findings)
            ? source.city_keyword_findings.filter((item) => item && typeof item === "object")
            : [],
        dedup_note: typeof source.dedup_note === "string" ? source.dedup_note.trim() : "",
        recommended_reflection_points: Array.isArray(source.recommended_reflection_points)
            ? source.recommended_reflection_points.filter((item) => typeof item === "string" && item.trim())
            : [],
        tags: Array.isArray(source.tags) ? source.tags.filter((item) => typeof item === "string" && item.trim()) : [],
        raw: rawText
    };

    if (!normalized.city_keyword_findings.length && profileFindings.length) {
        normalized.city_keyword_findings = profileFindings;
    }

    if (!normalized.keyword_interpretation) {
        normalized.keyword_interpretation = currentLocale === "ko"
            ? `"${query}"? ?곌껐?섎뒗 吏???앺솢 留λ씫???뺣━?덉뒿?덈떎.`
            : `Summarized the local context connected to "${query}".`;
    }

    if (!normalized.recommended_reflection_points.length) {
        normalized.recommended_reflection_points = currentLocale === "ko"
            ? [`"${query}"媛 ?꾩슂???쒓컙?? ?앺솢 議곌굔???쒕굹由ъ삤 議곌굔?쇰줈 諛섏쁺?⑸땲??`]
            : [`Use the timing and living conditions behind "${query}" as scenario conditions.`];
    }

    return normalized;
}

let _customResearchData = null;

async function runCustomCityResearch(query, resultContainer, parentContainer) {
    const isKo = currentLocale === "ko";
    let failureMessage = "";

    // 濡쒕뵫 ?쒖떆 ??媛꾧껐???몃씪???ㅽ뵾??
    resultContainer.style.display = "block";
    resultContainer.innerHTML = `
        <div class="magic-custom-loading" style="display:flex;align-items:center;gap:8px;padding:10px 0">
            <span class="magic-research-spinner"></span>
            <span style="font-size:.76rem;color:#003366;font-weight:600">${isKo ? `"${escapeHtml(query)}" 留덉폆 由ъ꽌移?以?..` : `Researching "${escapeHtml(query)}"...`}</span>
        </div>`;

    try {
        await ensureBypassSession();
        const selectedMarket = marketOptions.find((m) => m.siteCode === countrySelect.value);
        const country = resolveCountry(selectedMarket);
        const city = getCityValue();

        // base_profiles ?붿빟 ?앹꽦 ??以묐났 ?쒓굅??(移댄뀒怨좊━蹂???80???붿빟)
        let baseProfilesSummary = "";
        if (_latestCityProfile?.profile) {
            const p = _latestCityProfile.profile;
            baseProfilesSummary = CITY_PROFILE_CATEGORIES
                .filter(cat => p[cat.key])
                .map(cat => `${cat.key}: ${String(p[cat.key]).substring(0, 80)}`)
                .join("\n");
        }

        // GET ?뚮씪誘명꽣??city/country/locale留? custom_query+base_profiles??POST body濡??꾩넚
        const urlParams = new URLSearchParams({
            country: country.countryCode,
            city: city || "",
            locale: currentLocale
        });

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 45000);

        const response = await fetch(`/api/city-profile?${urlParams}`, {
            method: "POST",
            credentials: "include",
            signal: controller.signal,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                custom_query: query,
                base_profiles: baseProfilesSummary,
                country: country.countryCode,
                city: city || ""
            })
        });
        clearTimeout(timer);

        const result = await response.json().catch(() => null);
        if (response.ok && result?.ok && result?.data) {
            const normalizedData = normalizeCustomResearchData(query, result.data);
            _customResearchData = { query, data: normalizedData, tags: normalizedData.tags || [] };
            renderCustomResearchResult(query, normalizedData, resultContainer);
            return;
        }
        if (result?.error?.message) failureMessage = result.error.message;
    } catch (err) {
        console.warn("[custom-research] fetch failed:", err.message);
        failureMessage = err.message;
    }

    // ?ㅽ뙣 ??
    resultContainer.innerHTML = `
        <div class="magic-custom-error">
            <p>${isKo ? "寃?됱뿉 ?ㅽ뙣?덉뒿?덈떎. ?ㅼ떆 ?쒕룄??二쇱꽭??" : "Search failed. Please try again."}</p>
            <button type="button" class="secondary-btn magic-custom-retry-btn">${isKo ? "?ㅼ떆 寃?? : "Retry"}</button>
        </div>`;
    resultContainer.querySelector(".magic-custom-retry-btn")?.addEventListener("click", () => {
        runCustomCityResearch(query, resultContainer, parentContainer);
    });
}

function renderCustomResearchResult(query, data, resultContainer) {
    data = normalizeCustomResearchData(query, data);
    const isKo = currentLocale === "ko";

    // ???щ㎎ ?꾨뱶 異붿텧
    const interpretation = data.keyword_interpretation || "";
    const searchIntents = Array.isArray(data.search_intents) ? data.search_intents : [];
    const findings = Array.isArray(data.city_keyword_findings) ? data.city_keyword_findings.slice(0, 5) : [];
    const dedupNote = data.dedup_note || "";
    const reflectionPoints = Array.isArray(data.recommended_reflection_points) ? data.recommended_reflection_points : [];
    const tags = Array.isArray(data.tags) ? data.tags : [];

    // 援??щ㎎ ?명솚: ???щ㎎ ?곗씠?곌? ?놁쑝硫??덇굅???꾨뱶濡??대갚
    const hasNewFormat = !!(interpretation || findings.length || reflectionPoints.length);

    if (!hasNewFormat) {
        // 援??쒕쾭 ?щ㎎ (customer_needs ?? ?먮뒗 raw ?곗씠???대갚
        const needs = data.customer_needs || "";
        const improvement = data.improvement || "";
        const solutions = Array.isArray(data.solutions) ? data.solutions.slice(0, 2) : [];
        const scenarioValue = data.scenario_value || "";

        const fallbackText = needs || improvement || scenarioValue
            || (data.raw || data.summary || data.custom || JSON.stringify(data).substring(0, 500));

        resultContainer.innerHTML = `
            <div class="magic-custom-result-content">
                <div class="magic-custom-result-header">
                    <span class="magic-custom-result-badge">${isKo ? "AI ?꾩떆 留λ씫 遺꾩꽍" : "AI City Context"}</span>
                    <span class="magic-custom-result-query">"${escapeHtml(query)}"</span>
                </div>
                <div class="magic-research-section">
                    <p class="magic-research-label">${isKo ? "遺꾩꽍 寃곌낵" : "Analysis"}</p>
                    <div class="magic-research-text" style="white-space:pre-line">${escapeHtml(typeof fallbackText === "string" ? fallbackText : JSON.stringify(fallbackText))}</div>
                </div>
                <div class="magic-custom-result-actions">
                    <p class="magic-custom-action-caption">${isKo ? "而ㅼ뒪? 寃??諛섏쁺" : "Apply this custom research"}</p>
                    <button type="button" class="magic-custom-apply-btn" id="magic-custom-apply-btn">
                        ${isKo ? "??寃??寃곌낵瑜??쒕굹由ъ삤 議곌굔??異붽?" : "Add this research to scenario inputs"}
                    </button>
                    <button type="button" class="secondary-btn magic-custom-skip-btn" id="magic-custom-skip-btn">
                        ${isKo ? "嫄대꼫?곌린" : "Skip"}
                    </button>
                    <button type="button" class="secondary-btn magic-custom-retry-btn" id="magic-custom-retry-btn">
                        ${isKo ? "?ㅼ떆 寃?? : "Search Again"}
                    </button>
                </div>
            </div>`;
        bindCustomResearchActions(query, interpretation || needs, data, tags, resultContainer);
        return;
    }

    // ?쒓렇 ???쒓? 留ㅽ븨
    const tagKoMap = {
        "Save energy": "?먮꼫吏 ?덉빟", "Keep your home safe": "???덉쟾쨌蹂댁븞",
        "Help with chores": "媛???먮룞??, "Care for kids": "?먮? 耳??,
        "Care for seniors": "?쒕땲??耳??, "Care for your pet": "諛섎젮?숇Ъ 耳??,
        "Sleep well": "?섎㈃ 媛쒖꽑", "Enhanced mood": "遺꾩쐞湲??곗텧",
        "Stay fit & healthy": "嫄닿컯쨌?쇳듃?덉뒪", "Easily control your lights": "議곕챸 ?쒖뼱",
        "Keep the air fresh": "怨듦린吏?愿由?, "Find your belongings": "遺꾩떎臾?李얘린",
        "Time saving": "?쒓컙 ?덉빟"
    };

    // 寃???섎룄 ?쒓렇
    const intentsHtml = searchIntents.map(intent =>
        `<span class="magic-research-intent-tag">${escapeHtml(intent)}</span>`
    ).join("");

    // findings 移대뱶
    const findingsHtml = findings.map(f => `
        <div class="magic-research-finding">
            <div class="magic-research-finding-title">${escapeHtml(f.title || "")}</div>
            <p class="magic-research-finding-summary">${escapeHtml(f.summary || "")}</p>
            <p class="magic-research-finding-implication">${isKo ? "?쒕굹由ъ삤 諛섏쁺" : "Scenario"}: ${escapeHtml(f.scenario_implication || "")}</p>
        </div>
    `).join("");

    // ?쒕굹由ъ삤 諛섏쁺 ?ъ씤??
    const pointsHtml = reflectionPoints.map(p =>
        `<li>${escapeHtml(p)}</li>`
    ).join("");

    // ?쒓렇
    const tagsHtml = tags.map(t =>
        `<span class="magic-research-tag">${escapeHtml(isKo ? (tagKoMap[t] || t) : t)}</span>`
    ).join("");

    resultContainer.innerHTML = `
        <div class="magic-custom-result-content magic-research-structured">
            <div class="magic-custom-result-header">
                <span class="magic-custom-result-badge">${isKo ? "AI ?꾩떆 留λ씫 遺꾩꽍" : "AI City Context"}</span>
                <span class="magic-custom-result-query">"${escapeHtml(query)}"</span>
            </div>

            ${interpretation ? `<div class="magic-research-section">
                <p class="magic-research-label">${isKo ? "AI ?댁꽍" : "AI Interpretation"}</p>
                <p class="magic-research-text">${escapeHtml(interpretation)}</p>
            </div>` : ""}

            ${intentsHtml ? `<div class="magic-research-section">
                <p class="magic-research-label">${isKo ? "?뺤옣 寃??愿?? : "Search Intents"}</p>
                <div class="magic-research-intents">${intentsHtml}</div>
            </div>` : ""}

            ${findingsHtml ? `<div class="magic-research-section">
                <p class="magic-research-label">${isKo ? "異붽? ?꾩떆 留λ씫 寃곌낵" : "City-Keyword Findings"}</p>
                <div class="magic-research-findings">${findingsHtml}</div>
            </div>` : ""}

            ${dedupNote ? `<div class="magic-research-section magic-research-dedup">
                <p class="magic-research-dedup-text">${escapeHtml(dedupNote)}</p>
            </div>` : ""}

            ${pointsHtml ? `<div class="magic-research-section magic-research-value">
                <p class="magic-research-label">${isKo ? "?쒕굹由ъ삤 諛섏쁺 ?ъ씤?? : "Scenario Reflection Points"}</p>
                <ul class="magic-research-points">${pointsHtml}</ul>
                ${tagsHtml ? `<div class="magic-research-tags">${tagsHtml}</div>` : ""}
            </div>` : ""}

            <div class="magic-custom-result-actions">
                <p class="magic-custom-action-caption">${isKo ? "而ㅼ뒪? 寃??諛섏쁺" : "Apply this custom research"}</p>
                <button type="button" class="magic-custom-apply-btn" id="magic-custom-apply-btn">
                    ${isKo ? "??寃??寃곌낵瑜??쒕굹由ъ삤 議곌굔??異붽?" : "Add this research to scenario inputs"}
                </button>
                <button type="button" class="secondary-btn magic-custom-skip-btn" id="magic-custom-skip-btn">
                    ${isKo ? "嫄대꼫?곌린" : "Skip"}
                </button>
                <button type="button" class="secondary-btn magic-custom-retry-btn" id="magic-custom-retry-btn">
                    ${isKo ? "?ㅼ떆 寃?? : "Search Again"}
                </button>
            </div>
        </div>`;

    bindCustomResearchActions(query, interpretation, data, tags, resultContainer);
}

function bindCustomResearchActions(query, needsText, data, tags, resultContainer) {
    const isKo = currentLocale === "ko";

    // ?쒕굹由ъ삤 諛섏쁺 ??Q2 Audience 媛以묒튂??諛섏쁺
    resultContainer.querySelector("#magic-custom-apply-btn")?.addEventListener("click", () => {

        // 而ㅼ뒪? 由ъ꽌移??쒓렇瑜?Q2 媛以묒튂 ?붿쭊?????
        _customResearchData = { query, data, tags: tags || [], applied: true };

        // ?쒓컖 ?쇰뱶諛?
        const applyBtn = resultContainer.querySelector("#magic-custom-apply-btn");
        if (applyBtn) {
            applyBtn.innerHTML = isKo
                ? `<span style="color:#4caf50">&#10003;</span> 而ㅼ뒪? 寃??諛섏쁺??
                : `<span style="color:#4caf50">&#10003;</span> Custom research applied`;
            applyBtn.disabled = true;
            applyBtn.classList.add("magic-custom-applied");
        }
        resultContainer.querySelectorAll(".magic-custom-skip-btn, .magic-custom-retry-btn").forEach(b => {
            b.disabled = true;
            b.style.opacity = "0.4";
        });

        updateStatePreview();
        renderQ1ScenarioReferencePanel(stepInsight);
        if (currentStep === 3) updateStepInsight();
    });

    // 嫄대꼫?곌린 踰꾪듉
    resultContainer.querySelector("#magic-custom-skip-btn")?.addEventListener("click", () => {
        resultContainer.style.display = "none";
        _customResearchData = null;
        renderQ1ScenarioReferencePanel(stepInsight);
    });

    // ?ㅼ떆 寃??踰꾪듉
    resultContainer.querySelector("#magic-custom-retry-btn")?.addEventListener("click", () => {
        const input = document.getElementById("magic-custom-input");
        const q = input?.value.trim();
        if (q) runCustomCityResearch(q, resultContainer);
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
        climate: `${city}??怨꾩젅 ?뱀꽦??留욎텣 ?먮룞 ?됰궃諛㈑룰났湲곗쭏 猷⑦떞???ㅺ퀎?????덉뒿?덈떎.`,
        housing: `${city} 二쇨굅 ?섍꼍??理쒖쟻?붾맂 ?ㅻ쭏?명솃 ?먮룞?붾? 異붿쿇?⑸땲??`,
        family: `${city} 媛援?援ъ꽦??留욌뒗 ?뚮큵쨌?덉떖 ?쒕굹由ъ삤瑜??곌껐?⑸땲??`,
        daily_rhythm: `${city} 二쇰???異쒗눜洹셋룹깮???⑦꽩??留욎텣 猷⑦떞???ㅺ퀎?⑸땲??`,
        safety: `${city} 蹂댁븞 ?섍꼍??留욌뒗 ?덉쟾쨌紐⑤땲?곕쭅 ?쒕굹由ъ삤瑜?異붿쿇?⑸땲??`,
        energy: `${city} ?먮꼫吏 鍮꾩슜 援ъ“??留욌뒗 ?덉빟 ?먮룞?붾? ?쒖븞?⑸땲??`,
        health: `${city} ?앺솢 ?섍꼍??留욌뒗 嫄닿컯쨌?곕땲??猷⑦떞???곌껐?⑸땲??`,
        pets: `${city} 諛섎젮 ?앺솢??留욌뒗 ??耳???먮룞?붾? 異붿쿇?⑸땲??`,
        mobility: `${city} ?대룞쨌遺???⑦꽩??留욌뒗 ?몄텧 紐⑤뱶瑜??ㅺ퀎?⑸땲??`,
        events: `${city} 怨꾩젅 ?됱궗??留욎텣 ?쒖쫵蹂?罹좏럹???쒕굹由ъ삤瑜??곌껐?⑸땲??`
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

    // 湲곗〈 ?쒗듃媛 ?덉쑝硫??쒓굅
    closeCitySheet();

    // overlay + sheet ?앹꽦
    const overlay = document.createElement("div");
    overlay.className = "cpv2-overlay";
    overlay.addEventListener("click", closeCitySheet);

    const sheet = document.createElement("div");
    sheet.className = "cpv2-sheet";
    sheet.id = "cpv2-sheet";
    sheet.innerHTML = _pendingCitySheetHtml;

    document.body.appendChild(overlay);
    document.body.appendChild(sheet);

    // ?リ린 踰꾪듉
    sheet.querySelector(".cpv2-sheet-close")?.addEventListener("click", closeCitySheet);

    // ESC ??
    document.addEventListener("keydown", _citySheetEscHandler);

    // ?몃━嫄??좊땲硫붿씠??(?ㅼ쓬 ?꾨젅?꾩뿉??open ?대옒??異붽?)
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
    // content媛 媛앹껜?대㈃ ?꾨뱶?ㅼ쓣 移댄뀒怨좊━泥섎읆 ?쒖떆
    if (typeof content === "object" && content !== null) {
        const FIELD_LABELS = {
            region: isKo ? "吏???뱀꽦" : "Region",
            climate: isKo ? "湲고썑쨌怨꾩젅" : "Climate",
            housing: isKo ? "二쇨굅 ?뺥깭" : "Housing",
            behavior: isKo ? "?앺솢 ?⑦꽩" : "Behavior",
            implication: isKo ? "?쒖궗?? : "Implication"
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
                <div class="insight-badge-row"><span class="insight-badge">Q1 Region</span><span class="insight-badge" style="background:#e65100;color:#fff">${isKo ? "?뺤쟻 ?곗씠?? : "Static"}</span></div>
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
    // 濡쒖???湲곕컲 ?꾩떆紐?議고쉶 ??getCityDisplayValue媛 city_signals + KR_CITY_MASTER 紐⑤몢 寃??
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
                ? "?ㅼ떆媛?吏???몄궗?댄듃瑜?遺덈윭?ㅼ? 紐삵뻽?듬땲??"
                : "Failed to load live regional insight.");
            return buildStep2ErrorInsight(message);
        }
        // live_status tracked internally
        return mapLiveStep2Insight(payload.data, countryCode, city);
    } catch {
        const timeoutMessage = currentLocale === "ko"
            ? "?ㅼ떆媛?吏???몄궗?댄듃 ?붿껌???쒓컙 ?쒗븳(60珥???珥덇낵?덉뒿?덈떎."
            : "Live regional insight timed out after 60 seconds.";
        return buildStep2ErrorInsight(timeoutMessage);
    } finally {
        clearTimeout(timer);
    }
}

function mapLiveStep2Insight(data, countryCode, city) {
    const selectedRoleId = normalizeRoleId(data.role || roleSelect.value);
    const roleLens = data.role_lens || {};
    const roleTitle = selectedRoleId ? getRoleTitle(selectedRoleId) : (currentLocale === "ko" ? "留덉??? : "Marketer");
    const queryCity = String(data?.meta?.query_city || city || "").trim();

    // ?꾩떆紐?濡쒖???蹂?? getCityDisplayValue媛 city_signals + KR_CITY_MASTER 紐⑤몢 寃??
    const resolvedDisplay = queryCity ? getCityDisplayValue(countryCode, queryCity) : "";
    const localCity = resolvedDisplay || String(data?.local?.city_display || queryCity || city || "").trim();
    const marketLabel = localCity ? `${getCountryName(countryCode)} ${localCity}` : getCountryName(countryCode);
    const local = data.local || null;
    const evidence = Array.isArray(data.evidence) ? data.evidence : [];

    // ?쇱씠釉??곗씠?곕쭔 ?ъ슜 ???뺤쟻 city_signals fallback ?쒓굅
    const livePains = toList(data.live_pains).slice(0, 3);
    const liveSolutions = toList(data.live_solutions).slice(0, 3);
    const staticPains = toList(roleLens.pain_points).slice(0, 3);
    const staticSolutions = toList(roleLens.solutions).slice(0, 3);
    const mustKnow = toList(roleLens.must_know).slice(0, 3);
    const executionPoints = toList(roleLens.execution_points).slice(0, 3);

    // live_trends: 媛앹껜 諛곗뿴({text, evidence, category, source_*}) ?먮뒗 臾몄옄??諛곗뿴 紐⑤몢 吏??
    const CATEGORY_LABELS = {
        climate: currentLocale === "ko" ? "湲고썑쨌怨꾩젅" : "Climate",
        housing: currentLocale === "ko" ? "二쇨굅 ?뺥깭" : "Housing",
        family: currentLocale === "ko" ? "媛議굿룸룎遊? : "Family",
        routine: currentLocale === "ko" ? "?쇱긽 由щ벉" : "Routine",
        security: currentLocale === "ko" ? "?덉쟾쨌蹂댁븞" : "Security",
        energy: currentLocale === "ko" ? "?먮꼫吏" : "Energy",
        wellness: currentLocale === "ko" ? "嫄닿컯쨌?곕땲?? : "Wellness",
        pet: currentLocale === "ko" ? "???쇱씠?? : "Pet",
        mobility: currentLocale === "ko" ? "?대룞쨌遺?? : "Mobility",
        events: currentLocale === "ko" ? "臾명솕 ?됱궗" : "Events"
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

    // ?몃젋?쒓? ?놁뼱??pains/events/role_lens媛 ?덉쑝硫?移대뱶瑜?蹂댁뿬以?(?먮윭 ???partial ?쒖떆)
    const hasSomeData = liveTrends.length || livePains.length || liveSolutions.length || staticPains.length;
    if (!hasSomeData) {
        return buildStep2ErrorInsight(
            currentLocale === "ko"
                ? `"${localCity || queryCity || city}" 吏???곗씠?곕? 媛?몄삤吏 紐삵뻽?듬땲?? ?ㅼ떆 ?쒕룄??二쇱꽭??`
                : `Could not fetch regional data for "${localCity || queryCity || city}". Please retry.`
        );
    }

    // ?쇱씠釉?AI 寃곌낵留??ъ슜 ??role_lens??pains/solutions 遺???쒖뿉留?蹂닿컯
    const realPains = livePains.length ? livePains : (staticPains.length ? staticPains : mustKnow);
    const realSolutions = liveSolutions.length ? liveSolutions : (staticSolutions.length ? staticSolutions : executionPoints);
    const formatQ2MetricHint = (metric) => {
        const normalizedMetric = String(metric || "").trim();
        if (!normalizedMetric) return "";
        if (currentLocale === "ko") {
            if (normalizedMetric === "?쒖뿰 ?꾨즺?????곷떞 ?꾪솚??) {
                return "[KPI] 留ㅼ옣 ?쒖뿰???앷퉴吏 蹂?怨좉컼???ㅼ젣 ?곷떞源뚯? ?댁뼱吏?꾨줉 留뚮뱶???먮쫫";
            }
            return `[KPI] ${normalizedMetric}`;
        }
        if (normalizedMetric === "Demo completion ??consultation conversion") {
            return "[KPI] Turn completed demos into actual consultation conversations";
        }
        return `[KPI] ${normalizedMetric}`;
    };

    const sections = [];

    // 1) 吏???몃젋???뱀뀡: ?쇱씠釉?API ?꾩슜 (?뺤쟻 fallback ?놁쓬)
    const trendItems = liveTrends;
    if (trendItems.length) {
        sections.push({
            title: currentLocale === "ko"
                ? `?룧 <strong class="city-accent">${localCity || marketLabel}</strong> ?앺솢 諛李??댁뒋`
                : `?룧 Life context in <strong class="city-accent">${localCity || marketLabel}</strong>`,
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

    // 2) 洹쇱쿂 ?됱궗/?대깽???뱀뀡: ?ㅼ떆媛?API
    const liveEvents = Array.isArray(data.live_events) ? data.live_events.slice(0, 3) : [];
    if (liveEvents.length) {
        sections.push({
            title: currentLocale === "ko"
                ? `?뱟 ?쒖쫵/臾명솕 李멸퀬 ?ъ씤??
                : `?뱟 Season & culture signals`,
            items: liveEvents.map(ev =>
                `${ev.name} (${ev.when}) ??${ev.hook}`
            )
        });
    }

    // 3) ?몃젋??湲곕컲 怨좊? ?뱀뀡
    if (realPains.length) {
        sections.push({
            title: currentLocale === "ko"
                ? `?삜 怨좉컼???먮겮??遺덊렪怨?湲곕?`
                : `?삜 Customer pain points & expectations`,
            items: realPains
        });
    }

    // 4) CX ?쒕굹由ъ삤 ?뚰듃 ?뱀뀡 (SUB ???몃젋??湲곕컲 ?멸렇癒쇳듃/湲곌린/?쒕굹由ъ삤 諛⑺뼢 ?쒖븞)
    if (realSolutions.length) {
        sections.push({
            title: currentLocale === "ko"
                ? `?뮕 ?쒕굹由ъ삤 ?곌껐 湲고쉶`
                : `?뮕 Scenario opportunities`,
            items: realSolutions
        });
    }

    const rows = [];
    rows.push({
        label: currentLocale === "ko" ? "Q2 ?뚰듃" : "Q2 hint",
        value: currentLocale === "ko"
            ? "Q2?먯꽌 ?寃?怨좉컼怨?嫄곗＜吏, ?앺솢 留λ씫??異붽??섎㈃ ??吏??뿉 ??留욌뒗 ?쒕굹由ъ삤媛 ?먮룞?쇰줈 ?꾩꽦?⑸땲??"
            : "Add target audience, housing, and life context in Q2 to auto-generate a scenario tailored to this region."
    });

    return {
        badge: currentLocale === "ko" ? "Q1 ?앺솢 留λ씫" : "Q1 Life Context",
        title: currentLocale === "ko"
            ? `<strong class="city-accent">${marketLabel}</strong>?먯꽌 ?쒕굹由ъ삤瑜?湲고쉷????癒쇱? 李멸퀬?섏꽭??
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
            <text x="36" y="116" fill="#d7e9ff" font-family="Segoe UI, Arial, sans-serif" font-size="21">${escapeHtml(countryName)} ??Landmark image unavailable</text>
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
            <text x="54" y="108" fill="#deecff" font-family="Segoe UI, Arial, sans-serif" font-size="20">Area ${escapeHtml(areaText)} ??Country pop ${escapeHtml(countryPopText)} ??City pop ${escapeHtml(cityPopText)} (${escapeHtml(cityShareText)})</text>
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
            `湲고썑/怨꾩젅: ${climateLine || `${city}??怨꾩젅 ?붿씤???곕씪 ?됰궃諛㈑룹떎?댁풄???덉쫰媛 ?ш쾶 ?щ씪吏????덉뒿?덈떎.`}`,
            `?앺솢 ?⑦꽩: ${urbanLine || `${city}??異쒗눜洹??댄썑 利됱떆 ?몄쓽(鍮좊Ⅸ 吏??곹깭 ?꾪솚)??諛섏쓳??媛?μ꽦???믪뒿?덈떎.`}`,
            `二쇨린???대깽?? 異쒓렐 ?ш컻 ?쒓린쨌紐낆젅/?닿? ?쒖쫵쨌?곕쭚 ?쇳븨 ?쒖쫵??泥댄뿕??硫붿떆吏 諛섏쓳??而ㅼ쭏 媛?μ꽦???쎈땲??`,
            `湲곗닠 ?명봽?? ${isMetro ? "??而ㅻ꽖?곕뱶 ?쒕퉬???섏슜?꾧? ?믪? ?꾩떆???섍꼍?쇰줈 媛?? : "?앺솢沅뚮퀎 ?붿????몄감瑜?怨좊젮???④퀎???⑤낫???꾩슂"}?낅땲??`,
            `援먯쑁/?붿????깆닕??異붿젙): 湲곕뒫 ?ㅻ챸蹂대떎 鍮꾧탳쨌洹쇨굅쨌由щ럭???뺣낫??諛섏쓳??媛?μ꽦???믪뒿?덈떎.`,
            `?먮꼫吏 ?ъ슜 ?⑦꽩(異붿젙): 怨꾩젅???됰궃諛?遺?댁씠 泥닿컧?섎뒗 ?쒖젏???덇컧 硫붿떆吏? ?먮룞??猷⑦떞 ?쒖븞???ㅻ뱷?μ씠 ?믪븘吏묐땲??`
        ];
    }

    if (currentLocale === "de") {
        return [
            `Klima/Saisonalit채t: ${climateLine || `${city} zeigt je nach Saison wechselnde Bed체rfnisse bei Heizen, K체hlen und Komfort.`}`,
            `Lebensrhythmus: ${urbanLine || `${city} reagiert voraussichtlich stark auf unmittelbare Convenience nach dem Heimkommen.`}`,
            "Wiederkehrende Events: Pendelspitzen, Ferienphasen und Jahresend-Saisons erh철hen die Wirkung erlebbarer Botschaften.",
            `Technische Infrastruktur: ${isMetro ? "metro-typische hohe App- und Connected-Adoption wahrscheinlich" : "stufenweises Onboarding wegen digitaler Unterschiede empfohlen"}.`,
            "Bildung/Digitalreife (abgeleitet): Vergleich, Nachweis und Reviews wirken meist st채rker als reine Feature-Claims.",
            "Energienutzungsmuster (abgeleitet): In Phasen sp체rbarer Heiz-/K체hlkosten sind Savings- und Automationsbotschaften besonders wirksam."
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

/** '?ㅼ떆 ?쒕룄' 踰꾪듉 ?대┃ ??Step 2 ?몄궗?댄듃 ?ы샇異?*/
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
        title: currentLocale === "ko" ? "?ㅼ떆媛?吏???몄궗?댄듃瑜?遺덈윭?ㅼ? 紐삵뻽?듬땲?? : "Failed to load live regional insight",
        summary: message,
        body: currentLocale === "ko"
            ? "?ㅽ듃?뚰겕 ?먮뒗 ?몃? ?뚯뒪 ?곹깭瑜??뺤씤?????ㅼ떆 ?쒕룄??二쇱꽭??"
            : "Check network or upstream source status, then retry.",
        retry: true,
        retryLabel: currentLocale === "ko" ? "?ㅼ떆 ?쒕룄" : "Retry now"
    };
}

function toList(value) {
    return Array.isArray(value) ? value.filter(Boolean) : [];
}

/** ?좏깮???멸렇癒쇳듃 ?ㅼ썙?쒕퀎 "?????뱀쭠???꾩텧?섏뿀?붿?" ?ㅻ챸 */
function inferTraitReason(trait) {
    const reasons = {
        "?쒓컙 媛移?誘쇨컧": "留욌쾶?는룻눜洹??ㅼ썙?쒖뿉?????쒓컙??怨?鍮꾩슜???앺솢 ?⑦꽩",
        "媛援??댁쁺 蹂듭옟???믪쓬": "?≪븘쨌媛議??ㅼ썙?쒖뿉?????숈떆??梨숆꺼??????곸씠 留롮쓬",
        "耳???덉떖 ?덉쫰 ??: "遺紐㉱룹떆?덉뼱쨌?뚮큵 ?ㅼ썙?쒖뿉????硫由ъ꽌???뺤씤쨌耳???꾩슂",
        "吏異?誘쇨컧???믪쓬": "?먮꼫吏쨌?앺솢鍮??ㅼ썙?쒖뿉?????덇컧 ?④낵媛 諛붾줈 泥닿컧?섏뼱????,
        "?ш? ?쒓컙 ?덉쭏 以묒떆": "二쇰쭚쨌?ш?쨌?곕땲???ㅼ썙?쒖뿉?????щ뒗 ?쒓컙??吏덉씠 ?듭떖",
        "?먭꺽 ?뺤씤 ?섏슂 議댁옱": "?ヂ룸컲???ㅼ썙?쒖뿉?????몄텧 以묒뿉???곹깭 ?뺤씤 ?꾩닔",
        "利됱떆 泥닿컧 媛移??좏샇": "湲곕낯 ?寃??꾨줈????蹂듭옟???ㅼ젙 ?놁씠 諛붾줈 ?④낵 泥닿컧",
        "?ㅼ젙 ?쇰줈????텛湲?以묒슂": "湲곕낯 ?寃??꾨줈?????ъ슫 ?쒖옉??吏???ъ슜?쇰줈 ?곌껐",
        "嫄닿컯쨌?곕땲??以묒떆": "?곕땲?ㅒ룻뵾?몃땲???좏깮?먯꽌 ??怨듦린吏댟룹닔硫는룹슫???곕룞 ?쒕굹由ъ삤 ?곹빀",
        "蹂댁븞/?덉쟾 以묒떆": "蹂댁븞쨌?덉쟾 ?좏깮?먯꽌 ??紐⑤땲?곕쭅쨌?뚮┝ ?쒕굹由ъ삤 ?좏슚",
        "媛???⑥쑉 異붽뎄": "媛??룻슚???좏깮?먯꽌 ???먮룞?붾줈 諛섎났 ?묒뾽??以꾩씠??諛⑺뼢",
        // EN
        "time-value sensitivity": "dual-income / commute signals ??time equals cost",
        "high household complexity": "parenting / family signals ??many things to manage at once",
        "strong care and reassurance needs": "parent / senior / care signals ??remote monitoring needed",
        "high spending sensitivity": "energy / cost signals ??savings must be immediately visible",
        "high value on leisure quality": "weekend / wellness signals ??quality of downtime matters most",
        "remote check-in demand": "pet / companion signals ??must check status while away",
        "preference for immediate value": "default profile ??value must be felt instantly",
        "importance of reducing setup fatigue": "default profile ??easy start leads to sustained usage",
        "health and wellness focus": "wellness / fitness signals ??air quality, sleep, exercise integration",
        "security and safety focus": "security / safety signals ??monitoring and alert scenarios",
        "chore efficiency focus": "chore / efficiency signals ??reducing repetitive tasks through automation",
        "sleep quality focus": "night-shift / sleep signals ??better rest through environment automation",
        "?섎㈃ ?덉쭏 以묒떆": "?쇨컙洹쇰Т쨌?섎㈃ 愿???좏깮?먯꽌 ???섍꼍 ?먮룞?붾줈 ?섎㈃ 吏?媛쒖꽑",
        // ?? ?좉퇋 trait 異붾줎 洹쇨굅 ??
        "怨듬룞二쇨굅 ?섍꼍 理쒖쟻??: "?꾪뙆?맞룸퉴???좏깮?먯꽌 ??痢듦컙?뚯쓬쨌怨듭슜?ㅻ퉬 怨좊젮???먮룞???쒕굹由ъ삤 ?곹빀",
        "?뚰삎 怨듦컙 ?⑥쑉??: "?ㅽ뵾?ㅽ뀛쨌?먮８ ?먮뒗 1??媛援??좏깮?먯꽌 ???쒗븳??怨듦컙 ??湲곌린 ?듯빀 ?먮룞??,
        "?낅┰ 二쇨굅 ?먮룞??: "?⑤룆쨌??댄븯?곗뒪 ?좏깮?먯꽌 ??留덈떦쨌?ㅼ링 援ъ“??留욌뒗 蹂댁븞쨌?먮꼫吏 ?쒕굹由ъ삤",
        "怨듭슜 怨듦컙 愿由??덉쫰": "?곗뼱?섏슦???좏깮?먯꽌 ??怨듭슜 怨듦컙 ?ъ슜 洹쒖튃쨌?섍꼍 ?먮룞 愿由?,
        "?앺솢 ?숈꽑 怨듭쑀": "2??媛援??좏깮?먯꽌 ?????щ엺???앺솢 ?⑦꽩??怨좊젮???숈꽑 ?먮룞??,
        "媛쒖씤 怨듦컙쨌怨듭슜 怨듦컙 遺꾨━": "?깆씤 ?먮? ?숆굅 ?좏깮?먯꽌 ??媛쒕퀎 怨듦컙 ?섍꼍???낅┰ ?쒖뼱",
        "?묎렐??諛곕젮 ?먮룞??: "?묎렐??諛곕젮 ?좏깮?먯꽌 ???뚯꽦쨌?먮룞 ?쒖뼱 以묒떖 ?쒕굹由ъ삤",
        "?덉젙???앺솢 猷⑦떞 以묒떆": "?덉젙湲걔룹븞?뺣맂 媛???좏깮?먯꽌 ???덉륫 媛?ν븳 猷⑦떞 湲곕컲 ?먮룞??,
        "?몄텧 ?꽷룰?媛 ???먮룞???섏슂": "二쇰쭚 ?몄텧 ??쓬 ?좏깮?먯꽌 ??異쒕컻쨌洹媛 ?꾪썑 ?쇨큵 ?쒖뼱 ?쒕굹由ъ삤",
        "?ㅻ궡 ?섍꼍 誘쇨컧": "苡뚯쟻??怨듦린 ?좏깮?먯꽌 ??怨듦린吏댟룻솚湲??먮룞 ?쒖뼱 ?쒕굹由ъ삤",
        "遺꾩쐞湲걔룹“紐?以묒떆": "議곕챸 ?쒖뼱 ?좏깮?먯꽌 ???쒓컙?쨌?쒕룞蹂?議곕챸 ?먮룞 ?꾪솚",
        "臾쇨굔 ?꾩튂 異붿쟻 ?섏슂": "臾쇨굔 李얘린 ?좏깮?먯꽌 ??SmartTag ?곕룞 ?꾩튂 異붿쟻 ?쒕굹由ъ삤",
        "shared-building environment optimization": "apartment / villa ??automation considering shared infrastructure",
        "compact space efficiency": "studio / single ??device integration in limited space",
        "independent dwelling automation": "house / townhouse ??multi-floor security & energy scenarios",
        "shared space management needs": "shared housing ??automated common area management",
        "shared daily routine": "couple ??routine automation considering two lifestyles",
        "private and shared space separation": "adult children ??independent zone control",
        "accessibility-aware automation": "accessibility needs ??voice & auto control centered scenarios",
        "stable routine focus": "settled / established ??predictable routine-based automation",
        "pre-departure and return automation demand": "frequent outings ??departure & return batch control",
        "indoor environment sensitivity": "air quality focus ??ventilation & air quality auto control",
        "ambiance and lighting focus": "lighting control ??time & activity based lighting shifts",
        "object tracking demand": "find belongings ??SmartTag location tracking scenarios"
    };
    return reasons[trait] || "";
}

function getStep3SignalLegend(trait, isKo = currentLocale === "ko") {
    const text = String(trait || "").toLowerCase();
    if (/耳???덉떖|?먭꺽 ?뺤씤|媛援??댁쁺 蹂듭옟??care|reassurance|remote check|household complexity/.test(text)) {
        return { label: isKo ? "?뚮큵쨌?덉떖" : "Care & Reassurance", color: "#dc2626" };
    }
    if (/?쒓컙 媛移?媛???⑥쑉|吏異?誘쇨컧|time|efficiency|chore|spending/.test(text)) {
        return { label: isKo ? "?쒓컙쨌?⑥쑉" : "Time & Efficiency", color: "#ea580c" };
    }
    if (/嫄닿컯|?곕땲???ш?|?섎㈃|怨듦린|health|wellness|leisure|sleep|air/.test(text)) {
        return { label: isKo ? "嫄닿컯쨌?ш?" : "Health & Leisure", color: "#16a34a" };
    }
    if (/蹂댁븞|?덉쟾|臾쇨굔 ?꾩튂|security|safety|tracking/.test(text)) {
        return { label: isKo ? "?덉쟾쨌蹂댁븞" : "Safety & Security", color: "#2563eb" };
    }
    if (/二쇨굅|?앺솢 ?숈꽑|怨듦컙|怨듭슜|猷⑦떞|遺꾩쐞湲??낅┰ 二쇨굅|shared|space|living|routine|dwelling|ambiance/.test(text)) {
        return { label: isKo ? "二쇨굅쨌怨듦컙" : "Living & Space", color: "#7c3aed" };
    }
    return { label: isKo ? "?앺솢 ?댁쁺" : "Lifestyle", color: "#475569" };
}

/** traits?먯꽌 4? 媛移?Care, Play, Save, Secure)瑜?異붾줎 */
function inferCoreValues(traits, purpose) {
    const text = `${traits.join(" ")} ${purpose}`.toLowerCase();
    const personaIds = new Set(getSelectedPersonaOptionIds());
    const scores = { Care: 0, Play: 0, Save: 0, Secure: 0, Health: 0 };

    // ?띿뒪??湲곕컲
    if (text.includes("耳??) || text.includes("?덉떖") || text.includes("?뚮큵") || text.includes("care")) scores.Care += 2;
    if (text.includes("?ш?") || text.includes("?곕땲??) || text.includes("play") || text.includes("?뷀꽣")) scores.Play += 2;
    if (text.includes("?먮꼫吏") || text.includes("吏異?) || text.includes("?덇컧") || text.includes("save") || text.includes("鍮꾩슜")) scores.Save += 2;
    if (text.includes("蹂댁븞") || text.includes("?덉쟾") || text.includes("secure")) scores.Secure += 2;
    if (text.includes("嫄닿컯") || text.includes("?쇳듃?덉뒪") || text.includes("health") || text.includes("wellness")) scores.Health += 2;
    if (text.includes("??) || text.includes("諛섎젮") || text.includes("pet")) scores.Care += 3;
    if (text.includes("?먮?") || text.includes("?꾩씠") || text.includes("kid") || text.includes("媛援??댁쁺")) scores.Care += 2;
    if (text.includes("?먭꺽 ?뺤씤") || text.includes("remote")) scores.Care += 1;

    // 紐낆떆??persona ID 湲곕컲 (媛??媛뺣젰???좏샇)
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

/** Q1 ?꾩떆 ?꾨줈???ㅼ썙?????좎젙 ?寃??뱀꽦 異붾줎 */
function inferQ1Traits() {
    if (!_magicAppliedSelected || _magicAppliedSelected.size === 0) return [];
    const isKo = currentLocale === "ko";
    const cityName = _latestCityProfile?.localCity || "";
    const { profile } = getQ1SelectionContext();

    const mapping = {
        family:        { trait: isKo ? "耳???덉떖 ?덉쫰 ??     : "strong care and reassurance needs",
                         logic: isKo ? "媛議굿룸룎遊??곗씠?????쒕땲?대굹 ?꾩씠媛 ?덈뒗 媛援ш? 留롮쓣?섎줉 ?먭꺽 耳?는룹븞???뺤씤 ?섏슂 ?곸듅" : "Family/care data ??more multi-gen households = higher remote care demand" },
        energy:        { trait: isKo ? "吏異?誘쇨컧???믪쓬"       : "high spending sensitivity",
                         logic: isKo ? "?먮꼫吏 ?뚮퉬 ?⑦꽩 ??怨꾩젅蹂??됰궃諛?鍮꾩슜 泥닿컧???댁닔濡??덉빟???먮룞???쒕굹由ъ삤 ?곹빀" : "Energy data ??high seasonal utility costs drive savings automation scenarios" },
        safety:        { trait: isKo ? "蹂댁븞/?덉쟾 以묒떆"         : "security and safety focus",
                         logic: isKo ? "?덉쟾쨌蹂댁븞 ?명봽????二쇨굅 諛吏묐룄? ?몄텧 鍮덈룄???곕씪 紐⑤땲?곕쭅쨌?뚮┝ ?쒕굹由ъ삤 ?좏슚" : "Safety data ??density + outing frequency drive monitoring scenarios" },
        daily_rhythm:  { trait: isKo ? "?쒓컙 媛移?誘쇨컧"         : "time-value sensitivity",
                         logic: isKo ? "?쇱긽 由щ벉 ?곗씠????異쒗눜洹??⑦꽩???쒕졆?좎닔濡?'洹媛 吏곹썑 ?먮룞?? ?쒕굹由ъ삤 ?④낵?? : "Daily rhythm ??clear commute patterns make return-home automation effective" },
        housing:       { trait: isKo ? "二쇨굅 ?섍꼍 理쒖쟻??       : "housing environment optimization",
                         logic: isKo ? "二쇨굅 ?뺥깭 ?곗씠?????꾪뙆?맞룸퉴????援ъ“???곕씪 ?곹빀??湲곌린 諛곗튂? ?곕룞 諛⑹떇???щ씪吏? : "Housing data ??dwelling type determines optimal device placement" },
        climate:       { trait: isKo ? "怨꾩젅 誘쇨컧 ?앺솢"         : "seasonal living sensitivity",
                         logic: isKo ? "湲고썑쨌怨꾩젅 ?곗씠?????쒖꽌 李⑥씠媛 ?댁닔濡??ㅻ궡 ?섍꼍 ?먮룞 議곗젅 ?쒕굹由ъ삤??泥닿컧 媛移??곸듅" : "Climate data ??wider temp swings increase indoor automation perceived value" },
        culture_event: { trait: isKo ? "?ш? ?쒓컙 ?덉쭏 以묒떆"    : "high value on leisure quality",
                         logic: isKo ? "臾명솕 ?됱궗 ?곗씠?????ш?쨌臾명솕 ?뚮퉬媛 ?쒕컻?좎닔濡?'吏묒뿉?쒖쓽 紐곗엯 寃쏀뿕' ?쒕굹由ъ삤 ?좏슚" : "Culture data ??active leisure patterns support immersive home scenarios" },
        events:        { trait: isKo ? "?ш? ?쒓컙 ?덉쭏 以묒떆"    : "high value on leisure quality",
                         logic: isKo ? "臾명솕 ?됱궗 ?곗씠?????ш?쨌臾명솕 ?뚮퉬媛 ?쒕컻?좎닔濡?'吏묒뿉?쒖쓽 紐곗엯 寃쏀뿕' ?쒕굹由ъ삤 ?좏슚" : "Culture data ??active leisure patterns support immersive home scenarios" },
        health:        { trait: isKo ? "嫄닿컯쨌?곕땲??以묒떆"       : "health and wellness focus",
                         logic: isKo ? "嫄닿컯 ?곗씠?????곕땲??愿?щ룄媛 ?믪쓣?섎줉 怨듦린吏댟룹닔硫는룹슫???곕룞 ?쒕굹由ъ삤 ?ㅻ뱷???곸듅" : "Health data ??wellness interest drives air quality, sleep, fitness scenarios" },
        shopping:      { trait: isKo ? "?뚮퉬 ?몃젋??誘쇨컧"       : "consumer trend sensitivity",
                         logic: isKo ? "?쇳븨 ?곗씠?????⑤씪??援щℓ ?쒕컻 吏??씪?섎줉 ?쒗뭹 ?곕룞쨌?먮룞 ?ъ＜臾??쒕굹由ъ삤 ?곹빀" : "Shopping data ??active e-commerce regions suit auto-reorder scenarios" },
        transport:     { trait: isKo ? "?대룞 ?⑥쑉 以묒떆"         : "mobility efficiency focus",
                         logic: isKo ? "援먰넻 ?곗씠?????대룞 ?쒓컙??湲몄닔濡??몄텧 ?꽷룰?媛 ???먮룞???쒕굹由ъ삤 媛移??곸듅" : "Transport data ??longer commutes increase pre-departure automation value" },
        mobility:      { trait: isKo ? "?대룞 ?⑥쑉 以묒떆"         : "mobility efficiency focus",
                         logic: isKo ? "援먰넻 ?곗씠?????대룞 ?쒓컙??湲몄닔濡??몄텧 ?꽷룰?媛 ???먮룞???쒕굹由ъ삤 媛移??곸듅" : "Transport data ??longer commutes increase pre-departure automation value" },
        pets:          { trait: isKo ? "?먭꺽 ?뺤씤 ?섏슂 議댁옱"    : "remote check-in demand",
                         logic: isKo ? "???쇱씠???곗씠????諛섎젮?숇Ъ 媛援?鍮꾩쨷???믪쓣?섎줉 ?몄텧 以?紐⑤땲?곕쭅 ?쒕굹由ъ삤 ?꾩닔" : "Pet data ??high pet ownership makes remote monitoring scenarios essential" }
    };
    const result = [];
    for (const key of _magicAppliedSelected) {
        const entry = mapping[key];
        if (entry && !result.some(r => r.trait === entry.trait)) {
            const cat = CITY_PROFILE_CATEGORIES.find(c => c.key === key);
            const catLabel = cat ? (isKo ? cat.labelKo : cat.labelEn) : key;
            // ?ㅼ젣 ?꾩떆 ?꾨줈???띿뒪???몄슜 (?덉쑝硫?
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

function getQ1SelectionContext() {
    const profile = _latestCityProfile?.profile || {};
    const selectedKeys = Array.from(_magicAppliedSelected || []);
    const customTags = Array.isArray(_customResearchData?.tags) ? _customResearchData.tags.filter(Boolean) : [];
    const customText = [
        _customResearchData?.query || "",
        _customResearchData?.data?.keyword_interpretation || "",
        customTags.join(" ")
    ].join(" ");
    const profileText = selectedKeys.map((key) => String(profile[key] || "")).join(" ");
    const q1Text = `${profileText} ${customText}`.toLowerCase();
    return { profile, selectedKeys, customTags, q1Text };
}

function getQ2SelectionState() {
    const hasHousing = !!personaGroups.querySelector('[data-group-id="housing"] input:checked');
    const hasHousehold = !!personaGroups.querySelector('[data-group-id="household"] input:checked');
    const hasLifestage = !!personaGroups.querySelector('[data-group-id="lifestage"] input:checked');
    return {
        hasHousing,
        hasHousehold,
        hasLifestage,
        hasAnyQ2Selection: hasHousing || hasHousehold || hasLifestage
    };
}

function summarizeInsightText(text, maxLength = 140) {
    const normalized = String(text || "").replace(/\s+/g, " ").trim();
    if (!normalized) return "";
    if (normalized.length <= maxLength) return normalized;
    return `${normalized.slice(0, maxLength - 1).trim()}??;
}

function buildExpandableSummaryHtml(text, maxLength = 140, detailClassName = "") {
    const normalized = String(text || "").replace(/\s+/g, " ").trim();
    if (!normalized) return "";
    const summary = summarizeInsightText(normalized, maxLength);
    if (summary === normalized) return `<p>${escapeHtml(normalized)}</p>`;
    const detailId = `q2-ref-detail-${Math.random().toString(36).slice(2, 10)}`;
    const detailClass = detailClassName ? ` q2-evidence-detail--inline ${detailClassName}` : " q2-evidence-detail--inline";
    return `
        <p>${escapeHtml(summary)}</p>
        <div class="q2-evidence-detail${detailClass}" id="${detailId}">
            <p>${escapeHtml(normalized)}</p>
        </div>
        <button type="button" class="q2-evidence-toggle q2-evidence-toggle--compact" data-ev-target="${detailId}">
            <span class="q2-ev-arrow">??/span> ${currentLocale === "ko" ? "?꾩껜 蹂닿린" : "Show full text"}
        </button>
    `;
}

function buildInlineSummaryHtml(text) {
    const normalized = String(text || "").replace(/\s+/g, " ").trim();
    if (!normalized) return "";
    return `<p>${escapeHtml(normalized)}</p>`;
}

function getRelevantQ1ProfileReferences(limit = 3) {
    const { profile, selectedKeys } = getQ1SelectionContext();
    const targetKeys = selectedKeys.slice(0, limit);

    return targetKeys.map((key) => {
        const cat = CITY_PROFILE_CATEGORIES.find((entry) => entry.key === key);
        const text = profile[key] ? summarizeInsightText(profile[key], 160) : "";
        return {
            key,
            color: cat?.color || "#2563eb",
            icon: cat?.icon || "??,
            label: currentLocale === "ko" ? (cat?.labelKo || key) : (cat?.labelEn || key),
            text
        };
    }).filter((item) => item.text);
}

function getCustomResearchSummary() {
    if (!_customResearchData?.applied || !_customResearchData?.data) return null;

    const data = _customResearchData.data;
    const points = Array.isArray(data.recommended_reflection_points)
        ? data.recommended_reflection_points.filter(Boolean).slice(0, 3)
        : [];
    const findings = Array.isArray(data.city_keyword_findings)
        ? data.city_keyword_findings.filter(Boolean).slice(0, 2)
        : [];

    return {
        query: _customResearchData.query || "",
        interpretation: summarizeInsightText(data.keyword_interpretation || "", 170),
        points,
        findings,
        tags: Array.isArray(data.tags) ? data.tags.slice(0, 4) : []
    };
}

function buildQ1ImplicationConclusion(q1Traits, customSummary) {
    const isKo = currentLocale === "ko";
    const traitLabels = q1Traits.map((item) => item.trait).filter(Boolean);
    const customTags = Array.isArray(customSummary?.tags) ? customSummary.tags.filter(Boolean) : [];
    const customInterpretation = customSummary?.interpretation || "";

    if (isKo) {
        const baseText = traitLabels.length
            ? `?꾩떆 ?꾨줈?꾩긽 ${traitLabels.join(", ")} ?깊뼢???쏀엳硫?
            : "?꾩떆 ?꾨줈?꾩뿉???쒕졆???앺솢 留λ씫 ?좏샇媛 ?뺤씤?섎ŉ";
        const customText = customSummary
            ? `, 而ㅼ뒪? 寃??{customSummary.query ? `(${customSummary.query})` : ""}?먯꽌??${customTags.length ? customTags.join(", ") : "?ъ슜???뺤쓽 留λ씫"}??異붽?濡??뺤씤?⑸땲??`
            : ".";
        const closing = customSummary
            ? " ?곕씪???댄썑 ?쒕굹由ъ삤??湲곕낯 ?꾩떆 ?뱀꽦 ?꾩뿉 ?ъ슜?먭? 李얠? ?뱀닔 ?곹솴???④퍡 諛섏쁺?섎뒗 諛⑺뼢?쇰줈 ?댁꽍?댁빞 ?⑸땲??"
            : " ?곕씪???댄썑 ?쒕굹由ъ삤????吏??쓽 湲곕낯 ?앺솢 由щ벉怨??곗꽑?쒖쐞瑜?以묒떖?쇰줈 ?댁꽍?섎뒗 寃껋씠 ?곸젅?⑸땲??";
        return `${baseText}${customText}${closing}${customInterpretation ? ` ${customInterpretation}` : ""}`;
    }

    const baseText = traitLabels.length
        ? `The city profile suggests ${traitLabels.join(", ")} tendencies`
        : "The city profile suggests clear lifestyle context signals";
    const customText = customSummary
        ? `, while custom research${customSummary.query ? ` (${customSummary.query})` : ""} adds ${customTags.length ? customTags.join(", ") : "user-defined context"}.`
        : ".";
    const closing = customSummary
        ? " Scenario decisions should therefore reflect both the base city conditions and the additional user-specific context."
        : " Scenario decisions should therefore follow the area's core routines and priorities.";
    return `${baseText}${customText}${closing}${customInterpretation ? ` ${customInterpretation}` : ""}`;
}

function getQ1CombinedImplications(q1Traits, customSummary) {
    const isKo = currentLocale === "ko";
    const items = [...q1Traits];

    if (customSummary) {
        const detailParts = [
            customSummary.interpretation,
            ...(Array.isArray(customSummary.points) ? customSummary.points.slice(0, 2) : []),
            ...(Array.isArray(customSummary.findings) ? customSummary.findings.slice(0, 1) : [])
        ].filter(Boolean);

        items.push({
            trait: customSummary.query || (isKo ? "而ㅼ뒪? 寃??諛섏쁺 留λ씫" : "Custom research context"),
            logic: summarizeInsightText(detailParts.join(" "), 180),
            catLabel: isKo ? "而ㅼ뒪? 寃?? : "Custom research",
            color: "#7c3aed",
            sourceType: "custom"
        });
    }

    return items.slice(0, 4);
}

function getAppliedQ1ContextEntries() {
    const isKo = currentLocale === "ko";
    const entries = [];
    const { selectedKeys, profile } = getQ1SelectionContext();

    selectedKeys.forEach((key) => {
        const cat = CITY_PROFILE_CATEGORIES.find((entry) => entry.key === key);
        const text = profile[key] ? summarizeInsightText(profile[key], 90) : "";
        if (!cat) return;
        entries.push({
            key: `profile_${key}`,
            label: isKo ? (cat.labelKo || key) : (cat.labelEn || key),
            detail: text || (isKo ? "?꾩떆 ?꾨줈??諛섏쁺" : "City profile applied"),
            color: cat.color || "#2563eb",
            kind: "profile"
        });
    });

    const customSummary = getCustomResearchSummary();
    if (customSummary) {
        entries.push({
            key: "custom_research",
            label: customSummary.query || (isKo ? "而ㅼ뒪? 諛섏쁺" : "Custom reflection"),
            detail: customSummary.tags.length
                ? customSummary.tags.join(", ")
                : (customSummary.interpretation || (isKo ? "?ъ슜???뺤쓽 留λ씫 諛섏쁺" : "User-defined context applied")),
            color: "#7c3aed",
            kind: "custom"
        });
    }

    return entries;
}

function buildQ2CardGuideItemsHtml(isKo) {
    const items = [
        {
            index: "01",
            title: isKo ? "Q2 ?낅젰 媛?대뱶" : "Q2 guide",
            desc: isKo
                ? "???섏씠吏?먯꽌 臾댁뾿???좏깮?섎㈃ ?쒕굹由ъ삤 異붿쿇???대뼸寃??뺢탳?댁??붿? 癒쇱? ?ㅻ챸?⑸땲??"
                : "Explains what to choose here and how it sharpens scenario recommendations."
        },
        {
            index: "02",
            title: isKo ? "Q1 諛섏쁺 ?붿빟" : "Q1 carry-over summary",
            desc: isKo
                ? "Q1???꾩떆 ?꾨줈?꾧낵 而ㅼ뒪? 寃??寃곌낵媛 吏湲??대뼡 李멸퀬 ?뺣낫濡??댁뼱議뚮뒗吏 蹂댁뿬以띾땲??"
                : "Shows how Q1 city profile and custom research are carried into this step."
        },
        {
            index: "03",
            title: isKo ? "?덉긽 ?쒕굹由ъ삤 諛⑺뼢" : "Expected scenario direction",
            desc: isKo
                ? "Q1쨌Q2 ?좏샇媛 ?대뼡 移댄뀒怨좊━濡?臾띠씠怨? ?대뼡 媛以묒튂濡?留ㅼ묶?섎뒗吏 ?쎄린 ?쎄쾶 ?뺣━?⑸땲??"
                : "Summarizes categories, weighting, and match direction from Q1 and Q2 signals."
        }
    ];

    return items.map((item) => `
        <article class="q2-guide-item">
            <span class="q2-guide-index">${item.index}</span>
            <div>
                <h5>${escapeHtml(item.title)}</h5>
                <p>${escapeHtml(item.desc)}</p>
            </div>
        </article>
    `).join("");
}

const Q2_HOUSING_EXCLUSIVE_IDS = ["h_apt", "h_compact", "h_villa", "h_house", "h_townhouse", "h_shared", "h_care"];
const Q2_HOUSEHOLD_CORE_IDS = ["hh_solo", "hh_couple", "hh_young_kids", "hh_school_kids", "hh_adult_kids", "hh_multi_gen", "hh_senior"];
const Q2_HOUSEHOLD_CONTEXT_IDS = ["t_dual_income", "t_single_income", "t_solo_parent", "t_multi_kids", "t_pet"];
const Q2_HOUSEHOLD_CARE_IDS = ["t_parent_away", "t_parent_care", "t_acc_needs"];

function buildQ1NextStepHelperCard(isKo) {
    return `
        <section class="q1-next-helper-card">
            <div class="q1-next-helper-head">
                <span class="q1-next-helper-kicker">${isKo ? "?ㅼ쓬 ?④퀎 誘몃━ 蹂닿린" : "Next step preview"}</span>
                <h4>${isKo ? "Q2?먯꽌???앺솢 議곌굔???뷀빐 ?쒕굹由ъ삤 諛⑺뼢???뺢탳?섍쾶 醫곹옓?덈떎" : "Q2 refines scenario direction with additional life-context choices"}</h4>
                <p>${isKo
                    ? "?ㅼ쓬 ?섏씠吏?먯꽌??二쇨굅 ?뺥깭, 媛議?援ъ꽦, ?쇱씠?꾩뒪?뚯씠吏 媛숈? 異붽? 議곌굔???좏깮?⑸땲?? Q1???꾩떆 ?꾨줈?꽷룹빱?ㅽ? 寃??寃곌낵? Q2 ?좏깮???④퍡 ?먯닔?뷀빐, ?대뼡 ?쒕굹由ъ삤 移댄뀒怨좊━媛 ?좊젰?쒖?? ??洹몃젃寃?留ㅼ묶?섎뒗吏瑜?蹂댁뿬以띾땲??"
                    : "On the next page, you will add housing, household, and life-stage conditions. Those choices combine with the Q1 city profile and custom research to score scenario categories, weighting, and expected match direction."}</p>
            </div>
            <div class="q2-guide-grid">
                ${buildQ2CardGuideItemsHtml(isKo)}
            </div>
        </section>
    `;
}

function extractInsightKeywords(text, limit = 3) {
    const raw = String(text || "");
    if (!raw) return [];
    const parts = raw
        .split(/[,\n/|]|쨌|??:|;/)
        .map((item) => item.replace(/\s+/g, " ").trim())
        .filter((item) => item && item.length >= 2 && item.length <= 26);
    return [...new Set(parts)].slice(0, limit);
}

function buildReferenceKeywordChips(text, fallbackLabel = "", limit = 3) {
    const chips = extractInsightKeywords(text, limit);
    if (chips.length > 0) return chips;
    return fallbackLabel ? [fallbackLabel] : [];
}


function updatePersonaGroupFooters() {
    const isKo = currentLocale === "ko";
    personaGroups.querySelectorAll(".tree-group").forEach((group) => {
        const groupId = group.dataset.groupId;
        if (!["housing", "household", "lifestage"].includes(groupId)) return;

        let footer = group.querySelector(".q2-persona-footer");
        if (!footer) {
            footer = document.createElement("div");
            footer.className = "q2-persona-footer";
            group.appendChild(footer);
        }

        const footerCopy = getPersonaSelectionFooterCopy(groupId, isKo);
        footer.innerHTML = `
            <span class="q2-persona-footer-label">${escapeHtml(footerCopy.title)}</span>
            <div class="q2-persona-footer-chips">
                ${footerCopy.chips.map((chip) => `<span class="q2-persona-footer-chip">${escapeHtml(chip)}</span>`).join("")}
            </div>
        `;
    });
}

function getPersonaSelectionFooterCopy(groupId, isKo) {
    const checkedLabels = [...personaGroups.querySelectorAll(`.tree-group[data-group-id="${groupId}"] input[data-node-type="child"]:checked`)]
        .map((input) => input.dataset.label || input.value)
        .filter(Boolean);

    if (groupId === "housing") {
        if (checkedLabels.length > 0) {
            const chips = checkedLabels.slice(0, 3);
            if (checkedLabels.length > 3) chips.push(isKo ? `??${checkedLabels.length - 3}媛? : `+${checkedLabels.length - 3} more`);
            return { title: isKo ? "?꾩옱 ?곸슜 二쇨굅 ?좏삎" : "Current housing", chips };
        }
        return { title: isKo ? "?좏깮 湲곗?" : "Selection rule", chips: [isKo ? "蹂듭닔 ?좏깮 媛?? : "Multiple selections allowed"] };
    }

    if (groupId === "household") {
        const coreLabels = [...personaGroups.querySelectorAll('.tree-group[data-group-id="household"] input[data-node-type="child"]:checked')]
            .filter((input) => Q2_HOUSEHOLD_CORE_IDS.includes(input.value))
            .map((input) => input.dataset.label || input.value);
        const extraCount = checkedLabels.filter((label) => !coreLabels.includes(label)).length;
        if (coreLabels.length > 0 || extraCount > 0) {
            const chips = [];
            if (coreLabels[0]) chips.push(coreLabels[0]);
            if (extraCount > 0) chips.push(isKo ? `異붽? 議곌굔 ${extraCount}` : `${extraCount} extra conditions`);
            return { title: isKo ? "?꾩옱 ?몃? 援ъ꽦" : "Current household structure", chips };
        }
        return { title: isKo ? "?좏깮 湲곗?" : "Selection rule", chips: [isKo ? "?듭떖 援ъ“ 1媛?+ 異붽? 議곌굔 ?좏깮" : "1 core structure + extra conditions"] };
    }

    if (groupId === "lifestage") {
        return checkedLabels.length
            ? { title: isKo ? "?꾩옱 諛섏쁺 ?앺솢留λ씫" : "Current life context", chips: checkedLabels.slice(0, 3) }
            : { title: isKo ? "?좏깮 湲곗?" : "Selection rule", chips: [isKo ? "蹂듭닔 ?좏깮 媛?? : "Multiple selections allowed"] };
    }

    return { title: isKo ? "?꾩옱 ?좏깮" : "Current selection", chips: checkedLabels.slice(0, 3) };
}

function inferQ3AutoRecommendation() {
    const isKo = currentLocale === "ko";
    const roleId = roleSelect?.value || "";
    const { profile, selectedKeys, customTags, q1Text } = getQ1SelectionContext();
    const reasonById = {};
    const scoreMap = {};

    personaGroups?.querySelectorAll('input[data-node-type="child"]').forEach((input) => {
        scoreMap[input.value] = { score: 0, reasons: [] };
    });

    const addScore = (id, score, reasonKo, reasonEn) => {
        if (!scoreMap[id]) return;
        scoreMap[id].score += score;
        scoreMap[id].reasons.push(isKo ? reasonKo : reasonEn);
    };
    const addBatch = (ids, score, reasonKo, reasonEn) => ids.forEach((id) => addScore(id, score, reasonKo, reasonEn));
    const addPenalty = (ids, score) => ids.forEach((id) => {
        if (!scoreMap[id]) return;
        scoreMap[id].score -= score;
    });
    const hasKey = (key) => selectedKeys.includes(key);
    const hasText = (pattern) => new RegExp(pattern, "i").test(q1Text);
    const hasCustomTag = (pattern) => customTags.some((tag) => new RegExp(pattern, "i").test(String(tag)));

    const hasSchoolAgeSignal = hasText("school|elementary|grade school|珥덈벑|諛⑷낵 ??諛⑷낵???섍탳|洹媛");
    const hasYoungChildSignal = hasText("infant|toddler|preschool|daycare|?곸쑀???좎븘|誘몄랬??);
    const hasSeniorSignal = hasText("senior|elder|aging|retire|遺紐??쒕땲??);
    const hasDualIncomeSignal = hasText("dual income|working parents|留욌쾶??);
    const hasRemoteWorkSignal = hasText("remote|hybrid|work from home|?ы깮|?섏씠釉뚮━??);
    const hasAfterSchoolSafetySignal = hasText("after school|after-school|諛⑷낵 ??諛⑷낵??洹媛|?섍탳|?덉쟾愿由??덉떖洹媛|safe return");
    const hasChildCareSignal = hasText("family|kids|child|children|school|?≪븘|?먮?|?꾩씠|珥덈벑");

    addScore("h_apt", 8, "?꾩떆 湲곕낯媛? 怨좊? 二쇨굅 ?곹빀??, "Urban default: dense housing fit");
    addScore("hh_couple", 6, "?꾩떆 湲곕낯媛? 踰붿슜 ?몃? 援ъ꽦", "Urban default: broad household fit");
    addScore("ls_settled", 6, "?꾩떆 湲곕낯媛? ?덉젙???앺솢 猷⑦떞", "Urban default: settled routine");
    addScore("int_safe", 6, "湲곕낯媛? 吏??덉떖 ?덉쫰", "Default: home reassurance need");

    if (roleId === "retail") {
        addBatch(["ls_starter", "ls_settled"], 5, "由ы뀒??愿?? 利됱떆 ?댄빐?섎뒗 ?앺솢?④퀎 ?곗꽑", "Retail lens: prioritize immediately legible life stages");
        addBatch(["int_safe", "int_air"], 4, "由ы뀒??愿?? 泥닿컧 ?⑥씡 ?곗꽑", "Retail lens: prioritize demo-friendly benefits");
    } else if (roleId === "dotcom") {
        addBatch(["t_dual_income", "t_efficiency", "int_chores", "int_energy"], 6, "?룹뺨 愿?? ?몄쓽? ?⑥쑉 ?곗꽑", "Dotcom lens: strengthen efficiency and savings cues");
    } else if (roleId === "brand") {
        addBatch(["ls_newlywed", "int_mood", "int_air", "t_wellness"], 5, "釉뚮옖??愿?? 媛먯꽦???앺솢寃쏀뿕 ?곗꽑", "Brand lens: strengthen emotional living-experience cues");
    }

    if (hasKey("family")) {
        addBatch(["hh_young_kids", "hh_school_kids", "ls_parenting", "int_kids", "t_multi_kids"], 18, "Q1 媛議??좏샇 諛섏쁺", "Reflecting Q1 family signal");
        addBatch(["t_dual_income", "int_safe"], 8, "媛議??댁쁺 蹂듭옟??諛섏쁺", "Reflecting household complexity for families");
    }
    if (hasKey("pets") || hasCustomTag("pet")) {
        addBatch(["t_pet", "int_pet"], 22, "Q1 諛섎젮?숇Ъ ?좏샇 諛섏쁺", "Reflecting Q1 pet signal");
        addBatch(["t_long_away", "int_safe", "h_house"], 8, "?먭꺽 ?뺤씤 留λ씫 諛섏쁺", "Reflecting remote check-in context");
    }
    if (hasKey("health") || hasCustomTag("health|wellness")) {
        addBatch(["hh_senior", "hh_multi_gen", "ls_senior", "t_parent_care", "int_senior", "int_health", "t_wellness", "t_acc_needs"], 18, "Q1 嫄닿컯 ?좏샇 諛섏쁺", "Reflecting Q1 health signal");
        addScore("h_care", 12, "耳?댄삎 二쇨굅 媛?μ꽦 諛섏쁺", "Reflecting care-oriented housing possibility");
    }
    if (hasSeniorSignal || hasCustomTag("senior|elder|aging|parent care|遺紐??쒕땲??)) {
        addBatch(["hh_senior", "hh_multi_gen", "ls_senior", "t_parent_care", "int_senior"], 18, "?쒕땲???뚮큵 ?좏샇 諛섏쁺", "Reflecting senior-care signal");
        addScore("h_care", 14, "?쒕땲??耳??二쇨굅 媛?μ꽦 諛섏쁺", "Reflecting senior-care housing possibility");
    }
    if (hasKey("energy") || hasCustomTag("energy|saving")) {
        addBatch(["int_energy", "t_efficiency"], 20, "Q1 ?먮꼫吏 ?덇컧 ?좏샇 諛섏쁺", "Reflecting Q1 energy-saving signal");
        addBatch(["h_apt", "h_compact", "ls_starter", "ls_settled"], 10, "?⑥쑉???앺솢 ?⑦꽩 諛섏쁺", "Reflecting energy-efficient living patterns");
    }
    if (hasKey("safety") || hasCustomTag("security|safe")) {
        addBatch(["int_safe", "t_security", "t_long_away"], 20, "Q1 ?덉쟾 ?좏샇 諛섏쁺", "Reflecting Q1 safety and security signal");
        addBatch(["h_house", "h_townhouse", "t_parent_away"], 10, "異쒖엯怨?遺???뺤씤 留λ씫 諛섏쁺", "Reflecting presence checks and access context");
    }
    if (hasKey("daily_rhythm")) {
        addBatch(["t_dual_income", "t_remote", "t_weekend_out", "int_chores", "t_efficiency", "ls_established"], 14, "Q1 ?쇱긽 由щ벉 諛섏쁺", "Reflecting Q1 daily-rhythm signal");
    }
    if (hasKey("mobility")) {
        addBatch(["t_long_away", "t_weekend_out", "hh_solo", "hh_couple"], 12, "Q1 ?대룞??諛섏쁺", "Reflecting Q1 mobility signal");
        addBatch(["h_townhouse", "h_house"], 8, "?듦렐 以묒떖 嫄곗＜ 留λ씫 諛섏쁺", "Reflecting commute-led housing context");
    }
    if (hasKey("climate")) {
        addBatch(["int_air", "int_sleep"], 14, "Q1 湲고썑 諛섏쁺", "Reflecting Q1 climate signal");
        addBatch(["h_apt", "h_house"], 6, "?ㅻ궡 ?섍꼍 愿由??덉쫰 諛섏쁺", "Reflecting indoor-environment management need");
    }
    if (hasKey("events")) {
        addBatch(["ls_newlywed", "ls_settled", "t_homebody", "int_mood", "int_lights"], 10, "Q1 ?대깽???쇱씠?꾩뒪????좏샇 諛섏쁺", "Reflecting Q1 events and lifestyle signal");
    }

    if (hasText("apartment|high-rise|flat|condo|urban|dense|?꾪뙆??)) addBatch(["h_apt"], 14, "?꾪뙆?명삎 嫄곗＜ 留λ씫 諛섏쁺", "Q1 text suggests apartment living");
    if (hasText("studio|officetel|compact|small space|?먮８|?ㅽ뵾?ㅽ뀛")) addBatch(["h_compact", "hh_solo", "ls_starter"], 14, "?뚰삎 二쇨굅 留λ씫 諛섏쁺", "Q1 text suggests compact living");
    if (hasText("house|detached|yard|villa|suburb|townhouse|二쇳깮|鍮뚮씪")) addBatch(["h_house", "h_townhouse", "h_villa"], 14, "?痢??⑤룆 二쇨굅 留λ씫 諛섏쁺", "Q1 text suggests detached, villa, or townhouse living");
    if (hasChildCareSignal) addBatch(["hh_young_kids", "hh_school_kids", "ls_parenting", "int_kids"], 16, "媛議??먮? 留λ씫 諛섏쁺", "Q1 text suggests kids and family context");
    if (hasSeniorSignal) addBatch(["hh_senior", "ls_senior", "t_parent_care", "int_senior"], 16, "?쒕땲??耳??留λ씫 諛섏쁺", "Q1 text suggests senior and care context");
    if (hasRemoteWorkSignal) addBatch(["t_remote", "int_chores"], 14, "?ы깮/?섏씠釉뚮━???⑦꽩 諛섏쁺", "Q1 text suggests remote or hybrid work");
    if (hasText("travel|weekend|commute|異쒖옣|?몄텧")) addBatch(["t_long_away", "t_weekend_out", "int_safe"], 12, "遺???대룞 ?⑦꽩 諛섏쁺", "Q1 text suggests away-from-home patterns");
    if (hasText("night|shift|late|?쇨컙|援먮?")) addBatch(["t_night_shift", "int_sleep"], 14, "?쇨컙 猷⑦떞 諛섏쁺", "Q1 text suggests night-shift routines");
    if (hasText("air|pollution|humidity|heat|air quality|怨듦린|誘몄꽭癒쇱?")) addBatch(["int_air", "int_sleep"], 12, "怨듦린吏??덉쫰 諛섏쁺", "Q1 text suggests indoor air-management needs");

    if (hasSchoolAgeSignal) {
        addBatch(["hh_school_kids", "ls_parenting", "int_kids", "int_safe"], 20, "珥덈벑?숈깮/諛⑷낵 ??臾몃㎘ 諛섏쁺", "Reflecting school-age and after-school context");
        addBatch(["t_dual_income", "t_long_away"], 10, "遺??以??먮? ?덉쟾愿由?留λ씫 諛섏쁺", "Reflecting away-from-home child safety context");
        addBatch(["h_apt", "h_villa", "h_house", "h_townhouse"], 10, "珥덈벑?숈깮 嫄곗＜ 媛??二쇨굅 ?좏삎????꼻寃?諛섏쁺", "Reflecting broad housing fit for school-age children");
        addPenalty(["hh_young_kids"], 18);
    }
    if (hasYoungChildSignal && !hasSchoolAgeSignal) {
        addBatch(["hh_young_kids", "ls_parenting"], 18, "?곸쑀???묒쑁 臾몃㎘ 諛섏쁺", "Reflecting young-child parenting context");
    }
    if (hasDualIncomeSignal) {
        addBatch(["t_dual_income", "t_efficiency", "int_chores"], 16, "留욌쾶???댁쁺 遺??諛섏쁺", "Reflecting dual-income household complexity");
    }
    if (hasAfterSchoolSafetySignal) {
        addBatch(["int_safe", "t_long_away", "t_security"], 18, "諛⑷낵 ???덉쟾愿由??ㅼ썙??諛섏쁺", "Reflecting after-school safety-management keywords");
        addBatch(["h_apt", "h_villa", "h_house", "h_townhouse"], 8, "二쇨굅 ?뺥깭 ?꾨컲??嫄몄튇 ?덉쟾愿由??섏슂 諛섏쁺", "Reflecting safety needs across multiple housing types");
    }
    if ((hasSchoolAgeSignal || hasDualIncomeSignal || hasAfterSchoolSafetySignal) && !hasSeniorSignal) {
        addPenalty(["h_care", "hh_senior", "ls_senior", "t_parent_care", "int_senior"], 28);
    }
    if ((hasSchoolAgeSignal || hasAfterSchoolSafetySignal) && !hasRemoteWorkSignal) {
        addPenalty(["t_remote"], 18);
    }

    const pickRanked = (ids, limit, fallbacks = []) => {
        const ranked = ids
            .filter((id) => scoreMap[id])
            .sort((a, b) => {
                const diff = (scoreMap[b]?.score || 0) - (scoreMap[a]?.score || 0);
                return diff || ids.indexOf(a) - ids.indexOf(b);
            });
        const chosen = [];
        ranked.forEach((id) => {
            if (chosen.length >= limit) return;
            if ((scoreMap[id]?.score || 0) > 0) chosen.push(id);
        });
        [...fallbacks, ...ranked].forEach((id) => {
            if (chosen.length >= limit) return;
            if (!chosen.includes(id)) chosen.push(id);
        });
        return chosen.slice(0, limit);
    };

    const lifeStageIds = ["ls_starter", "ls_newlywed", "ls_settled", "ls_parenting", "ls_established", "ls_empty_nest", "ls_senior"];
    const lifePatternIds = ["t_remote", "t_long_away", "t_weekend_out", "t_night_shift", "t_homebody"];
    const lifeThemeIds = ["int_energy", "int_air", "int_lights", "int_chores", "int_safe", "int_sleep", "int_mood", "int_senior", "int_kids", "int_pet", "int_find", "int_health", "t_security", "t_wellness", "t_efficiency"];
    const housingPool = (hasSchoolAgeSignal || hasAfterSchoolSafetySignal) && !hasSeniorSignal
        ? ["h_apt", "h_villa", "h_house", "h_townhouse", "h_compact"]
        : Q2_HOUSING_EXCLUSIVE_IDS;

    const ids = [
        ...pickRanked(housingPool, Q3_AUTO_TARGET_COUNTS.housing, ["h_apt", "h_house", "h_villa"]),
        ...pickRanked(Q2_HOUSEHOLD_CORE_IDS, 1, hasSchoolAgeSignal ? ["hh_school_kids", "hh_couple"] : ["hh_couple", "hh_solo", "hh_young_kids"]),
        ...pickRanked([...Q2_HOUSEHOLD_CONTEXT_IDS, ...Q2_HOUSEHOLD_CARE_IDS], 2, ["t_dual_income", "t_pet", "t_parent_care"]),
        ...pickRanked(lifeStageIds, 1, hasSchoolAgeSignal ? ["ls_parenting", "ls_settled"] : ["ls_settled", "ls_starter", "ls_established"]),
        ...pickRanked(lifePatternIds, 2, hasAfterSchoolSafetySignal ? ["t_long_away", "t_weekend_out"] : ["t_remote", "t_weekend_out", "t_homebody"]),
        ...pickRanked(lifeThemeIds, 2, hasAfterSchoolSafetySignal ? ["int_safe", "int_kids", "int_chores"] : ["int_safe", "int_air", "int_chores"])
    ];

    ids.forEach((id) => {
        reasonById[id] = (scoreMap[id]?.reasons || []).slice(0, 2);
        if (!reasonById[id].length) {
            reasonById[id] = [isKo ? "Q1 ?좏샇瑜?醫낇빀??異붿쿇" : "Recommended from combined Q1 signals"];
        }
    });

    const selectedCategoryLabels = selectedKeys
        .map((key) => CITY_PROFILE_CATEGORIES.find((entry) => entry.key === key))
        .filter(Boolean)
        .map((entry) => isKo ? entry.labelKo : entry.labelEn)
        .slice(0, 3);

    const summary = [];
    if (selectedCategoryLabels.length) {
        summary.push(isKo
            ? `Q1 ?꾩떆 ?꾨줈?꾩쓽 ${selectedCategoryLabels.join(", ")} ?좏샇瑜??곗꽑 諛섏쁺?덉뒿?덈떎.`
            : `Prioritized Q1 city-profile signals from ${selectedCategoryLabels.join(", ")}.`);
    }
    if (customTags.length) {
        summary.push(isKo
            ? `而ㅼ뒪? 由ъ꽌移??쒓렇 ${customTags.slice(0, 3).join(", ")}瑜??앺솢留λ씫 蹂댁젙???ъ슜?덉뒿?덈떎.`
            : `Used custom-research tags ${customTags.slice(0, 3).join(", ")} to refine lifestyle context.`);
    }
    if (hasSchoolAgeSignal || hasAfterSchoolSafetySignal) {
        summary.push(isKo
            ? "珥덈벑?숈깮 諛⑷낵 ???덉쟾愿由?臾몃㎘???곗꽑 諛섏쁺???몃?/?앺솢留λ씫??議곗젙?덉뒿?덈떎."
            : "Prioritized school-age after-school safety context in household and life-context picks.");
    }
    if (roleId) {
        summary.push(isKo
            ? `${getRoleTitle(roleId)} 愿?먯뿉???ㅻ챸?μ씠 ?믪? 議고빀?쇰줈 ?뺣젹?덉뒿?덈떎.`
            : `Sorted the set for higher explainability from the ${getRoleTitle(roleId)} lens.`);
    }

    return { ids, summary, reasonById };
}

function groupHouseholdOptions() {
    const householdGroup = personaGroups.querySelector('.tree-group[data-group-id="household"]');
    if (!householdGroup || householdGroup.dataset.q2Structured === "true") return;

    const children = householdGroup.querySelector(".tree-children");
    if (!children) return;

    const optionNodes = [...children.querySelectorAll('.tree-child')];
    if (!optionNodes.length) return;

    const findNode = (id) => optionNodes.find((node) => node.querySelector(`input[value="${id}"]`));
    const isKo = currentLocale === "ko";
    const sections = [
        {
            title: isKo ? "?듭떖 ?숆굅 援ъ“" : "Core household structure",
            desc: isKo ? "媛??媛源뚯슫 湲곕낯 ?몃? 援ъ꽦??1媛?湲곗??쇰줈 ?좏깮" : "Choose the one base household structure that fits best",
            className: "q2-household-grid q2-household-grid--core",
            ids: Q2_HOUSEHOLD_CORE_IDS
        },
        {
            title: isKo ? "?댁쁺쨌?앺솢 議곌굔" : "Household conditions",
            desc: isKo ? "媛議??댁쁺 諛⑹떇?대굹 ?앺솢 議곌굔? 蹂듭닔 ?좏깮 媛?? : "You can add multiple operating or living conditions",
            className: "q2-household-grid",
            ids: Q2_HOUSEHOLD_CONTEXT_IDS
        },
        {
            title: isKo ? "?뚮큵쨌諛곕젮 議곌굔" : "Care and accessibility",
            desc: isKo ? "遺紐??뚮큵?대굹 ?묎렐??諛곕젮泥섎읆 異붽?濡?怨좊젮???곹솴" : "Add care or accessibility situations when relevant",
            className: "q2-household-grid",
            ids: Q2_HOUSEHOLD_CARE_IDS
        }
    ];

    const shell = document.createElement("div");
    shell.className = "q2-household-sections";

    sections.forEach((section) => {
        const nodes = section.ids.map(findNode).filter(Boolean);
        if (!nodes.length) return;

        const sectionEl = document.createElement("section");
        sectionEl.className = "q2-household-section";
        sectionEl.innerHTML = `
            <div class="q2-household-section-head">
                <strong>${escapeHtml(section.title)}</strong>
                <p>${escapeHtml(section.desc)}</p>
            </div>
            <div class="${section.className}"></div>
        `;
        const grid = sectionEl.querySelector(`.${section.className.split(" ").join(".")}`);
        nodes.forEach((node) => grid.appendChild(node));
        shell.appendChild(sectionEl);
    });

    children.innerHTML = "";
    children.appendChild(shell);
    householdGroup.dataset.q2Structured = "true";
}

function decoratePersonaGroups() {
    if (!personaGroups) return;
    groupHouseholdOptions();
    updatePersonaGroupFooters();
}

function buildQ1ScenarioReferencePanelHtml() {
    const isKo = currentLocale === "ko";
    const profileRefs = getRelevantQ1ProfileReferences(3);
    const q1Traits = inferQ1Traits().slice(0, 3);
    const customSummary = getCustomResearchSummary();
    const combinedImplications = getQ1CombinedImplications(q1Traits, customSummary);
    const implicationConclusion = buildQ1ImplicationConclusion(q1Traits, customSummary);
    const cityName = _latestCityProfile?.localCity || getCityValue() || "";
    const countryName = _latestCityProfile?.countryName || getCountryName(countrySelect.value) || "";
    const locationTitle = [countryName, cityName].filter(Boolean).join(" 쨌 ");
    const hasContent = profileRefs.length > 0 || combinedImplications.length > 0 || customSummary;

    if (!hasContent) {
        return `
            <section class="q2-reference-shell q2-reference-shell--empty">
                <div class="q2-reference-topline">
                    <div>
                        <span class="q2-reference-kicker">${isKo ? "Q1 ?쒕굹由ъ삤 李멸퀬" : "Q1 scenario reference"}</span>
                        <h4>${isKo ? "Q1?먯꽌 諛섏쁺??吏???좏샇媛 ?꾩쭅 ?놁뒿?덈떎" : "No regional signals have been reflected from Q1 yet"}</h4>
                        <p>${isKo ? "?꾩떆 ?꾨줈???ㅼ썙?쒕? 諛섏쁺?섍굅??而ㅼ뒪? 寃??寃곌낵瑜??곸슜?섎㈃, ?댄썑 ?쒕굹由ъ삤 ?먮떒??湲곗????ш린 ?뺣━?⑸땲??" : "Apply city-profile keywords or custom research to summarize the scenario inputs carried forward from Q1."}</p>
                    </div>
                </div>
            </section>
        `;
    }

    const profileHtml = profileRefs.length > 0
        ? profileRefs.map((item) => `
            <article class="q2-ref-chip-card q2-ref-chip-card--keyword" style="--q2-ref-accent:${item.color}">
                <div class="q2-ref-chip-top">
                    <span class="q2-ref-chip-icon">${item.icon}</span>
                    <span class="q2-ref-chip-title">${escapeHtml(item.label)}</span>
                </div>
                <div class="q2-ref-keyword-row">
                    ${buildReferenceKeywordChips(item.text, item.label).map((chip) => `<span class="q2-ref-tag q2-ref-tag--soft">${escapeHtml(chip)}</span>`).join("")}
                </div>
                ${buildInlineSummaryHtml(item.text)}
            </article>
        `).join("")
        : `<p class="q2-ref-empty">${isKo ? "?꾩쭅 ?좏깮???꾩떆 ?꾨줈???붿빟???놁뒿?덈떎." : "No city-profile references applied yet."}</p>`;

    const customHtml = customSummary
        ? `
            <article class="q2-ref-custom-card q2-ref-custom-card--keyword">
                <div class="q2-ref-custom-top">
                    <span class="q2-ref-custom-query">${escapeHtml(customSummary.query)}</span>
                </div>
                <div class="q2-ref-tag-row">
                    ${(customSummary.tags.length ? customSummary.tags : buildReferenceKeywordChips(customSummary.interpretation, customSummary.query)).slice(0, 5).map((tag) => `<span class="q2-ref-tag">${escapeHtml(tag)}</span>`).join("")}
                </div>
                ${customSummary.interpretation ? `<div class="q2-ref-custom-copy">${buildInlineSummaryHtml(customSummary.interpretation)}</div>` : ""}
            </article>
        `
        : `<p class="q2-ref-empty">${isKo ? "而ㅼ뒪? 寃??諛섏쁺???놁쑝硫??ш린?먮뒗 Q1 ?ъ슜???뺤쓽 留λ씫???쒖떆?⑸땲??" : "Applied custom research from Q1 will appear here."}</p>`;

    const implicationHtml = combinedImplications.length > 0
        ? combinedImplications.map((item) => `
            <article class="q2-audience-implication" style="--q2-ref-accent:${item.color}">
                <div class="q2-audience-implication-top">
                    <div class="q2-audience-implication-heading">
                        <span class="q2-source-tag" style="background:${item.color}20;color:${item.color}">${escapeHtml(item.catLabel)}</span>
                        <strong>${escapeHtml(item.trait)}</strong>
                    </div>
                    <span class="q2-audience-implication-badge">${item.sourceType === "custom" ? (isKo ? "而ㅼ뒪? 諛섏쁺" : "Custom input") : (isKo ? "Q1 諛섏쁺?? : "Reflected from Q1")}</span>
                </div>
                ${buildInlineSummaryHtml(item.logic)}
            </article>
        `).join("")
        : `<p class="q2-ref-empty">${isKo ? "?좏깮???꾩떆 ?꾨줈?꾧낵 而ㅼ뒪? 寃?됱뿉???쏀엳???앺솢???쒖궗?먯씠 ?꾩쭅 ?놁뒿?덈떎." : "No lifestyle implications are available from the selected city profile or custom research yet."}</p>`;

    return `
        <section class="q2-reference-shell q1-scenario-reference-shell">
            <div class="q2-reference-topline">
                <div>
                    <span class="q2-reference-kicker">${isKo ? "Q1 ?쒕굹由ъ삤 諛섏쁺 移대뱶" : "Q1 scenario reflection card"}</span>
                    <h4>${isKo
                        ? `${locationTitle || "?좏깮??吏??} ?쒕굹由ъ삤??諛섏쁺???듭떖 湲곗?`
                        : `Key scenario inputs reflected for ${locationTitle || "the selected location"}`}</h4>
                    <p>${isKo
                        ? "Q1?먯꽌 諛섏쁺???꾩떆 ?꾨줈??洹쇨굅? ?앺솢???쒖궗?먯씠 ?댄썑 ?쒕굹由ъ삤 ?먮떒??異쒕컻?먯쑝濡??댁뼱吏묐땲??"
                        : "The city-profile basis and lifestyle implications reflected in Q1 carry forward into later scenario decisions."}</p>
                </div>
                <div class="q2-reference-location">
                    ${countryName ? `<span class="q2-reference-location-chip">${escapeHtml(countryName)}</span>` : ""}
                    ${cityName ? `<span class="q2-reference-location-chip q2-reference-location-chip--strong">${escapeHtml(cityName)}</span>` : ""}
                </div>
            </div>
            <div class="q2-reference-grid">
                <section class="q2-ref-section">
                    <div class="q2-ref-section-head">
                        <span class="q2-ref-section-kicker">${isKo ? "諛섏쁺 洹쇨굅" : "Reflected basis"}</span>
                        <strong>${isKo ? "Q1?먯꽌 ?좏깮???꾩떆 ?꾨줈???붿빟" : "Selected city-profile basis from Q1"}</strong>
                    </div>
                    <div class="q2-ref-chip-grid">${profileHtml}</div>
                </section>
                <section class="q2-ref-section">
                    <div class="q2-ref-section-head">
                        <span class="q2-ref-section-kicker">${isKo ? "?앺솢???쒖궗?? : "Lifestyle implications"}</span>
                        <strong>${isKo ? "?꾩떆 ?꾨줈?꾧낵 而ㅼ뒪? 寃?됱쓣 醫낇빀???앺솢 留λ씫 寃곕줎" : "Combined lifestyle conclusion from city profile and custom research"}</strong>
                    </div>
                    <div class="q2-ref-custom-card q2-ref-custom-card--summary">
                        <div class="q2-ref-custom-top">
                            <span class="q2-ref-custom-query">${isKo ? "醫낇빀 寃곕줎" : "Combined conclusion"}</span>
                        </div>
                        ${buildInlineSummaryHtml(implicationConclusion)}
                    </div>
                    <div class="q2-audience-implication-grid">${implicationHtml}</div>
                </section>
                <section class="q2-ref-section q2-ref-section--custom">
                    <div class="q2-ref-section-head">
                        <span class="q2-ref-section-kicker">${isKo ? "?ъ슜??異붽? 諛섏쁺" : "Additional user reflection"}</span>
                        <strong>${isKo ? "Q1 而ㅼ뒪? 寃?됱뿉???④퍡 李멸퀬??留λ씫" : "Additional context from Q1 custom research"}</strong>
                    </div>
                    ${customHtml}
                </section>
            </div>
        </section>
    `;
}

function renderQ1ScenarioReferencePanel(container = stepInsight) {
    const anchor = container?.querySelector?.("#q1-scenario-reference-card");
    if (!anchor) return;
    anchor.innerHTML = buildQ1ScenarioReferencePanelHtml();
    bindQ2EvidenceToggles(anchor);
}

/** ?꾨줈???좊ː??怨꾩궛 (0??00) */
function calculateConfidence() {
    let pct = 0;
    // ?꾩떆 ?좏깮 = base 20%
    const cityRaw = getCityValue();
    if (cityRaw) pct += 20;
    // Q1 ?ㅼ썙??諛섏쁺 = +20%
    if (_magicAppliedSelected && _magicAppliedSelected.size > 0) pct += 20;
    // Q2 A/B/C 媛?+20% (理쒕? 60%)
    const { hasHousing, hasHousehold, hasLifestage } = getQ2SelectionState();
    if (hasHousing)   pct += 20;
    if (hasHousehold) pct += 20;
    if (hasLifestage) pct += 20;
    return Math.min(100, pct);
}

function getStep3AudienceCopy(locale, audiencePlace) {
    const audienceCardCopy = {
        ko: {
            title: `${audiencePlace} ?寃??멸렇癒쇳듃 李멸퀬`,
            summary: "Q1?먯꽌 ?좏깮???꾩떆 ?꾨줈??洹쇨굅? ?앺솢???쒖궗?먯쓣 諛뷀깢?쇰줈, ??吏???멸렇癒쇳듃??諛섏쁺???듭떖 ??ぉ???뺣━?덉뒿?덈떎.",
            detailTitle: "?寃??멸렇癒쇳듃??諛섏쁺???듭떖 ??ぉ",
            kicker: "Q1 諛섏쁺 李멸퀬",
            basisKicker: "諛섏쁺 湲곗?",
            basisTitle: "Q1?먯꽌 ?좏깮???꾩떆 ?꾨줈???붿빟",
            basisCopy: "?좏깮????ぉ?ㅼ씠 ??吏???寃??멸렇癒쇳듃瑜??댁꽍?섎뒗 異쒕컻?먯씠 ?⑸땲??",
            implicationKicker: "?앺솢???쒖궗??,
            implicationTitle: "?좏깮 ??ぉ???쒖궗?섎뒗 ?앺솢 留λ씫怨??곗꽑?쒖쐞",
            implicationCopy: "怨쇱옣???댁꽍???꾨땲?? ?댄썑 ?쒕굹由ъ삤 留ㅼ묶??李멸퀬?????덈뒗 ?꾩떎?곸씤 ?앺솢 ?좏샇瑜??뺣━?덉뒿?덈떎.",
            customKicker: "?ъ슜??異붽? 諛섏쁺",
            customTitle: "Q1 而ㅼ뒪? 寃?됱뿉???④퍡 李멸퀬??留λ씫",
            customCopy: "?ъ슜?먭? 吏곸젒 諛섏쁺????ぉ??湲곕낯 洹쇨굅? ?④퍡 李멸퀬?⑸땲??",
            cardSummary: "Q1 ?좏깮 洹쇨굅? ?앺솢???쒖궗?먯쓣 ?④퍡 蹂대뒗 李멸퀬 移대뱶"
        },
        en: {
            title: `Target segment reference for ${audiencePlace}`,
            summary: "This summarizes the key factors to reflect in the regional target segment based on the Q1 profile basis and lifestyle implications.",
            detailTitle: "Key factors reflected in the target segment",
            kicker: "Q1 reference",
            basisKicker: "Reflected basis",
            basisTitle: "Selected city-profile basis from Q1",
            basisCopy: "These selected items form the starting point for interpreting the regional target segment.",
            implicationKicker: "Lifestyle implications",
            implicationTitle: "Likely lifestyle context and value priorities",
            implicationCopy: "These are grounded signals to use as reference for later scenario matching.",
            customKicker: "Additional user reflection",
            customTitle: "Additional context from Q1 custom research",
            customCopy: "User-defined context is carried alongside the selected profile basis.",
            cardSummary: "A compact reference card combining Q1 profile basis and lifestyle implications"
        },
        de: {
            title: `Referenz zum Zielsegment f체r ${audiencePlace}`,
            summary: "Diese Karte fasst die wichtigsten Punkte zusammen, die auf Basis der Q1-Profilgrundlage und der daraus abgeleiteten Alltagskontexte in das regionale Zielsegment einflie횩en sollten.",
            detailTitle: "Zentrale Faktoren f체r das Zielsegment",
            kicker: "Q1-Referenz",
            basisKicker: "Grundlage",
            basisTitle: "Ausgew채hlte Stadtprofil-Basis aus Q1",
            basisCopy: "Diese ausgew채hlten Punkte bilden den Ausgangspunkt f체r die Interpretation des regionalen Zielsegments.",
            implicationKicker: "Alltagsimplikationen",
            implicationTitle: "Wahrscheinlicher Lebenskontext und Wertpriorit채ten",
            implicationCopy: "Diese realistischen Signale dienen als Referenz f체r das sp채tere Szenario-Matching.",
            customKicker: "Zus채tzlicher Nutzereintrag",
            customTitle: "Zus채tzlicher Kontext aus der benutzerdefinierten Q1-Recherche",
            customCopy: "Vom Nutzer definierter Kontext wird zusammen mit der ausgew채hlten Profilgrundlage ber체cksichtigt.",
            cardSummary: "Eine kompakte Referenzkarte mit Q1-Grundlage und Alltagsimplikationen"
        },
        fr: {
            title: `R챕f챕rence du segment cible pour ${audiencePlace}`,
            summary: "Cette carte r챕sume les 챕l챕ments cl챕s 횪 refl챕ter dans le segment cible r챕gional 횪 partir de la base de profil Q1 et des implications de mode de vie qui en d챕coulent.",
            detailTitle: "횋l챕ments cl챕s 횪 refl챕ter dans le segment cible",
            kicker: "R챕f챕rence Q1",
            basisKicker: "Base retenue",
            basisTitle: "Base du profil urbain s챕lectionn챕e en Q1",
            basisCopy: "Ces 챕l챕ments s챕lectionn챕s constituent le point de d챕part pour interpr챕ter le segment cible r챕gional.",
            implicationKicker: "Implications de mode de vie",
            implicationTitle: "Contexte de vie probable et priorit챕s de valeur",
            implicationCopy: "Ces signaux concrets servent de r챕f챕rence pour la mise en correspondance ult챕rieure avec les sc챕narios.",
            customKicker: "Apport utilisateur",
            customTitle: "Contexte suppl챕mentaire issu de la recherche personnalis챕e Q1",
            customCopy: "Le contexte d챕fini par l'utilisateur est conserv챕 avec la base de profil s챕lectionn챕e.",
            cardSummary: "Une carte de r챕f챕rence concise r챕unissant base Q1 et implications de mode de vie"
        },
        es: {
            title: `Referencia del segmento objetivo para ${audiencePlace}`,
            summary: "Esta tarjeta resume los factores clave que deben reflejarse en el segmento objetivo regional a partir de la base de perfil de Q1 y sus implicaciones de estilo de vida.",
            detailTitle: "Factores clave reflejados en el segmento objetivo",
            kicker: "Referencia Q1",
            basisKicker: "Base reflejada",
            basisTitle: "Base de perfil urbano seleccionada en Q1",
            basisCopy: "Estos elementos seleccionados son el punto de partida para interpretar el segmento objetivo regional.",
            implicationKicker: "Implicaciones de estilo de vida",
            implicationTitle: "Contexto de vida probable y prioridades de valor",
            implicationCopy: "Estas se챰ales realistas sirven como referencia para el ajuste posterior de escenarios.",
            customKicker: "Aporte adicional del usuario",
            customTitle: "Contexto adicional de la investigaci처n personalizada de Q1",
            customCopy: "El contexto definido por el usuario se mantiene junto con la base de perfil seleccionada.",
            cardSummary: "Tarjeta de referencia compacta con base Q1 e implicaciones de estilo de vida"
        },
        pt: {
            title: `Refer챗ncia do segmento-alvo para ${audiencePlace}`,
            summary: "Este cart찾o resume os fatores principais a refletir no segmento-alvo regional com base no perfil selecionado em Q1 e nas implica챌천es de estilo de vida derivadas.",
            detailTitle: "Fatores centrais refletidos no segmento-alvo",
            kicker: "Refer챗ncia Q1",
            basisKicker: "Base refletida",
            basisTitle: "Base de perfil urbano selecionada em Q1",
            basisCopy: "Esses itens selecionados formam o ponto de partida para interpretar o segmento-alvo regional.",
            implicationKicker: "Implica챌천es de estilo de vida",
            implicationTitle: "Contexto de vida prov찼vel e prioridades de valor",
            implicationCopy: "Esses sinais concretos servem como refer챗ncia para a etapa posterior de correspond챗ncia de cen찼rios.",
            customKicker: "Contribui챌찾o adicional do usu찼rio",
            customTitle: "Contexto adicional da pesquisa personalizada de Q1",
            customCopy: "O contexto definido pelo usu찼rio 챕 mantido junto com a base de perfil selecionada.",
            cardSummary: "Cart찾o de refer챗ncia compacto com base Q1 e implica챌천es de estilo de vida"
        },
        it: {
            title: `Riferimento del segmento target per ${audiencePlace}`,
            summary: "Questa scheda riassume i fattori chiave da riflettere nel segmento target regionale sulla base del profilo Q1 e delle implicazioni di stile di vita che ne derivano.",
            detailTitle: "Fattori chiave riflessi nel segmento target",
            kicker: "Riferimento Q1",
            basisKicker: "Base riflessa",
            basisTitle: "Base del profilo urbano selezionata in Q1",
            basisCopy: "Questi elementi selezionati rappresentano il punto di partenza per interpretare il segmento target regionale.",
            implicationKicker: "Implicazioni di stile di vita",
            implicationTitle: "Contesto di vita probabile e priorit횪 di valore",
            implicationCopy: "Questi segnali concreti fungono da riferimento per il successivo abbinamento degli scenari.",
            customKicker: "Apporto aggiuntivo dell'utente",
            customTitle: "Contesto aggiuntivo dalla ricerca personalizzata Q1",
            customCopy: "Il contesto definito dall'utente viene mantenuto insieme alla base di profilo selezionata.",
            cardSummary: "Scheda di riferimento compatta con base Q1 e implicazioni di stile di vita"
        },
        nl: {
            title: `Doelsegmentreferentie voor ${audiencePlace}`,
            summary: "Deze kaart vat de belangrijkste factoren samen die in het regionale doelsegment moeten worden meegenomen op basis van de Q1-profielbasis en de daaruit volgende leefstijlimplicaties.",
            detailTitle: "Belangrijkste factoren in het doelsegment",
            kicker: "Q1-referentie",
            basisKicker: "Onderbouwing",
            basisTitle: "Geselecteerde stadsprofielbasis uit Q1",
            basisCopy: "Deze geselecteerde punten vormen het startpunt voor de interpretatie van het regionale doelsegment.",
            implicationKicker: "Leefstijlimplicaties",
            implicationTitle: "Waarschijnlijke leefcontext en waardeprioriteiten",
            implicationCopy: "Deze realistische signalen dienen als referentie voor latere scenariomatching.",
            customKicker: "Extra gebruikersinbreng",
            customTitle: "Aanvullende context uit gepersonaliseerd Q1-onderzoek",
            customCopy: "Door de gebruiker gedefinieerde context blijft gekoppeld aan de geselecteerde profielbasis.",
            cardSummary: "Compacte referentiekaart met Q1-basis en leefstijlimplicaties"
        },
        ar: {
            title: `?邈寞晩 碼?娩邈?幕馬 碼??卍魔?膜?馬 ?? ${audiencePlace}`,
            summary: "魔?漠巒 ?莫? 碼?磨慢碼?馬 碼?晩?碼?? 碼?粒卍碼卍?馬 碼?魔? ??磨曼? 晩?卍?碼 ?? 碼?娩邈?幕馬 碼??卍魔?膜?馬 碼?瑪?????馬 碼卍魔?碼膜?碼 瑪?? 粒卍碼卍 碼???? 碼??漠魔碼邈 ?? Q1 ??碼 ?娩?邈 瑪??? ?? 卍?碼? ?晩?娩?.",
            detailTitle: "碼?晩?碼?? 碼?粒卍碼卍?馬 碼???晩?卍馬 ?? 碼?娩邈?幕馬 碼??卍魔?膜?馬",
            kicker: "?邈寞晩 Q1",
            basisKicker: "粒卍碼卍 碼?碼?晩?碼卍",
            basisTitle: "粒卍碼卍 ??? 碼??膜??馬 碼??漠魔碼邈 ?? Q1",
            basisCopy: "魔娩?? ?莫? 碼?晩?碼巒邈 碼??漠魔碼邈馬 ??慢馬 碼?磨膜碼?馬 ?魔?卍?邈 碼?娩邈?幕馬 碼??卍魔?膜?馬 碼?瑪?????馬.",
            implicationKicker: "膜?碼?碼魔 ??慢 碼?幕?碼馬",
            implicationTitle: "碼?卍?碼? 碼??晩?娩? 碼??幕魔?? ?粒????碼魔 碼????馬",
            implicationCopy: "?莫? 瑪娩碼邈碼魔 ?碼?晩?馬 ???? 碼卍魔漠膜碼??碼 ??邈寞晩 晩?膜 ?慢碼磨?馬 碼?卍??碼邈???碼魔 ?碼幕??碼.",
            customKicker: "瑪彎碼?馬 碼??卍魔漠膜?",
            customTitle: "卍?碼? 瑪彎碼?? ?? 碼?磨幕麻 碼??漠巒巒 ?? Q1",
            customCopy: "?魔? 碼?碼幕魔?碼挽 磨碼?卍?碼? 碼?莫? 幕膜膜? 碼??卍魔漠膜? 瑪?? 寞碼?磨 粒卍碼卍 碼???? 碼??漠魔碼邈.",
            cardSummary: "磨慢碼?馬 ?邈寞晩?馬 ??寞万馬 魔寞?晩 粒卍碼卍 Q1 ?膜?碼?碼魔 ??慢 碼?幕?碼馬"
        }
    };
    return audienceCardCopy[locale] || audienceCardCopy.en;
}

function buildStep3Insight() {
  try {
    const selectedSegment = getSelectedSegment();
    const purpose = purposeInput.value.trim();
    const cityRaw = getCityValue();
    const selectedMarket = marketOptions.find((m) => m.siteCode === countrySelect.value);
    const country = selectedMarket ? resolveCountry(selectedMarket) : null;
    const isKo = currentLocale === "ko";

    // ?? 湲곕낯 ?곗씠????
    const q2Traits = inferSegmentTraits(selectedSegment, purpose);
    const q1Traits = inferQ1Traits();
    const confidence = calculateConfidence();
    const cityDisplay = _latestCityProfile?.localCityDisplay
        || _latestCityProfile?.localCity
        || ((country && cityRaw) ? (getCityDisplayValue(country.countryCode, cityRaw) || cityRaw) : cityRaw);
    const direction = inferScenarioDirection(q2Traits, purpose);
    const coreValues = inferCoreValues([...q2Traits, ...q1Traits.map(t => t.trait)], purpose);
    const countryDisplay = country ? getCountryName(country.countryCode) : "";
    const audiencePlace = cityDisplay && countryDisplay
        ? `${cityDisplay}(${countryDisplay})`
        : (cityDisplay || countryDisplay || (isKo ? "?좏깮 吏?? : "the selected location"));
    const step3InsightTitle = isKo
        ? `${audiencePlace} ?쒕굹由ъ삤 留ㅼ묶 媛쒖슂`
        : `Scenario match overview for ${audiencePlace}`;
    const step3InsightSummary = isKo
        ? "Q2?먯꽌 怨좊Ⅸ ?앺솢 議곌굔??諛뷀깢?쇰줈, ?대뼡 ?쒕굹由ъ삤 諛⑺뼢???좊젰?쒖?? 媛以묒튂 援ъ“瑜??뺣━?⑸땲??"
        : "This summarizes likely scenario directions and weighting based on the life-context choices made in Q2.";

    // ?? ?좊ː???됱긽/?쇰꺼 ??
    const confColor = confidence < 40 ? "amber" : confidence < 80 ? "blue" : "green";
    const confLabel = confidence < 40
        ? (isKo ? "?좊ː????쓬" : "Low confidence")
        : confidence < 80
            ? (isKo ? "援ъ껜??以? : "Refining")
            : (isKo ? "?꾨줈???꾩꽦" : "Profile complete");

    // ?? Confidence ring SVG ??
    const ringHtml = `
        <div class="q2-confidence-wrap">
            <svg viewBox="0 0 36 36" class="q2-confidence-ring">
                <circle cx="18" cy="18" r="15.9" class="q2-ring-track"/>
                <circle cx="18" cy="18" r="15.9" class="q2-ring-fill q2-ring-fill--${confColor}"
                    style="stroke-dasharray: ${confidence} 100"/>
            </svg>
            <span class="q2-ring-center">${confidence}%</span>
        </div>`;

    // ?? Header ??
    const titleSuffix = "";
    const headerHtml = `
        <div class="q2-hybrid-header">
            ${ringHtml}
            <div class="q2-header-text">
                <span class="q2-header-persona">${escapeHtml(step3InsightTitle)}</span>
                <span class="q2-header-confidence q2-header-confidence--${confColor}">${escapeHtml(confLabel)}</span>
            </div>
        </div>`;

    const q1ProfileRefs = getRelevantQ1ProfileReferences(3);
    const customResearchSummary = getCustomResearchSummary();
    const introCardHtml = `
        <section class="q2-stage-card q2-stage-card--intro">
            <div class="q2-stage-card-head">
                <div>
                    <span class="q2-stage-kicker">${isKo ? "Q2 ?덈궡" : "Q2 guide"}</span>
                    <h4>${isKo ? "???④퀎?먯꽌???앺솢 議곌굔???뷀빐 異붿쿇 ?쒕굹由ъ삤瑜?醫곹옓?덈떎" : "This step refines scenario recommendations with more lifestyle conditions"}</h4>
                </div>
                <span class="q2-stage-status q2-stage-status--${confColor}">${escapeHtml(confLabel)}</span>
            </div>
            <p class="q2-stage-copy">${isKo
                ? "Q1?먯꽌 諛섏쁺???꾩떆 ?꾨줈?꾧낵 而ㅼ뒪? 寃??寃곌낵瑜?諛뷀깢?쇰줈, Q2?먯꽌??二쇨굅 ?뺥깭쨌媛援?援ъ꽦쨌?쇱씠?꾩뒪?뚯씠吏瑜?異붽? ?좏깮?⑸땲?? ??議고빀???쒕굹由ъ삤 移댄뀒怨좊━ ?먯닔? 媛以묒튂, 留ㅼ묶 諛⑺뼢???뺢탳?섍쾶 留뚮벊?덈떎."
                : "Q2 builds on the city profile and custom research from Q1. Add housing, household, and life-stage conditions here so the scenario category scores, weighting, and match direction become more precise."}</p>
            <div class="q2-guide-grid">
                ${buildQ2CardGuideItemsHtml(isKo)}
            </div>
        </section>`;

    // ?? Corroboration: Q2 trait labels that match Q1 trait labels ??
    const q2TraitLabels = new Set(q2Traits);
    const corroboratedLabels = new Set();
    q1Traits.forEach(t => { if (q2TraitLabels.has(t.trait)) corroboratedLabels.add(t.trait); });

    // ?? Layer 1: Q1 ?꾩떆 留λ씫 ??
    let layer1Html = "";
    if (q1Traits.length > 0) {
        const hasAnyQ2 = q2Traits.length > 0 && (q2Traits[0] !== (isKo ? "利됱떆 泥닿컧 媛移??좏샇" : "preference for immediate value"));
        const tentativeClass = hasAnyQ2 ? "" : " q2-layer--tentative";
        const traitCards = q1Traits.map((t, i) => {
            const isCorro = corroboratedLabels.has(t.trait);
            const statusTag = isCorro
                ? `<span class="q2-trait-confirmed">${isKo ? "Q2 寃利앸맖" : "Q2 confirmed"}</span>`
                : `<span class="q2-trait-tentative">${isKo ? "?좎젙" : "tentative"}</span>`;
            const uid = `q1-ev-${i}-${Date.now()}`;
            const quoteHtml = t.profileQuote
                ? `<p class="q2-ev-quote">"${escapeHtml(t.profileQuote)}${t.profileQuote.length >= 120 ? "?? : ""}"</p>`
                : "";
            return `
                <div class="q2-hybrid-trait q2-hybrid-trait--compact">
                    <div class="q2-trait-accent" style="background:${t.color}"></div>
                    <div class="q2-trait-body">
                        <div class="q2-trait-top">
                            <span class="q2-trait-label">${escapeHtml(t.trait)}</span>
                            ${statusTag}
                        </div>
                        <p class="q2-trait-source">
                            <span class="q2-source-tag" style="background:${t.color}20;color:${t.color}">${escapeHtml(t.catLabel)}</span>
                            ${isKo ? `${escapeHtml(cityDisplay)} ?꾩떆 ?꾨줈?꾩뿉???꾩텧` : `From ${escapeHtml(cityDisplay)} city profile`}
                        </p>
                        <button type="button" class="q2-evidence-toggle q2-evidence-toggle--compact" data-ev-target="${uid}">
                            <span class="q2-ev-arrow">??/span> ${isKo ? "異붾줎 洹쇨굅 蹂닿린" : "View reasoning"}
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
                    <span class="q2-layer-header-icon">?뱧</span>
                    ${isKo ? "?꾩떆 留λ씫?먯꽌 異붾줎???좎젙 ?좏샇 (Q1 湲곕컲)" : "Tentative signals from city context (Q1)"}
                </p>
                <p class="q2-layer-helper">${isKo
                    ? "?좏깮?섏떊 ?꾩떆???명봽?쇱? 嫄곗＜ ?뺥깭瑜?諛뷀깢?쇰줈 ?꾩텧???좎옱 ?쇱씠?꾩뒪????뚰듃?낅땲??"
                    : "Potential lifestyle hints inferred from your city context data."}</p>
                <div class="q2-trait-compact-grid">${traitCards}</div>
            </div>`;
    }

    // ?? Layer 2: Q2 ?寃??앺솢 (紐⑤뱺 Q2 trait ?쒖떆, Q1 ?곌퀎 ??諛곗?) ??
    let layer2Html = "";
    const { hasAnyQ2Selection } = getQ2SelectionState();
    if (hasAnyQ2Selection && q2Traits.length > 0) {
        const warmColors = ["#ea580c", "#f97316", "#fb923c", "#c2410c", "#d97706", "#b91c1c", "#dc2626"];
        const traitCards = q2Traits.map((trait, i) => {
            const reason = inferTraitReason(trait);
            const uid = `q2-ev-${i}-${Date.now()}`;
            const legend = getStep3SignalLegend(trait, isKo);
            const warmColor = legend.color || warmColors[i % warmColors.length];
            const isCorro = corroboratedLabels.has(trait);
            const statusTag = isCorro
                ? `<span class="q2-trait-confirmed">${isKo ? "Q1 ?곌퀎" : "Q1 linked"}</span>`
                : "";
            const legendTag = `<span class="q2-trait-legend" style="--q2-trait-legend:${warmColor}">${escapeHtml(legend.label)}</span>`;
            return `
                <div class="q2-hybrid-trait q2-hybrid-trait--compact">
                    <div class="q2-trait-accent" style="background:${warmColor}"></div>
                    <div class="q2-trait-body">
                        <div class="q2-trait-top">
                            <span class="q2-trait-label">${escapeHtml(trait)}</span>
                            <div class="q2-trait-meta">
                                ${legendTag}
                                ${statusTag}
                            </div>
                        </div>
                        <p class="q2-trait-source">${isKo ? "Q2 ?좏깮?먯꽌 ?꾩텧" : "Derived from Q2 selections"}</p>
                        ${reason ? `
                        <button type="button" class="q2-evidence-toggle q2-evidence-toggle--compact" data-ev-target="${uid}">
                            <span class="q2-ev-arrow">??/span> ${isKo ? "異붾줎 洹쇨굅 蹂닿린" : "View reasoning"}
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
                    <span class="q2-layer-header-icon">?렞</span>
                    ${isKo ? `?寃??앺솢 留λ씫 ?좏샇 (Q2 ?좏깮 湲곕컲) ??${q2Traits.length}媛? : `Target lifestyle signals (Q2) ??${q2Traits.length} signals`}
                </p>
                <p class="q2-layer-helper">${isKo
                    ? "吏곸젒 ?좏깮???寃잛쓽 ?듭떖 ?뱀꽦?낅땲?? Q1???좎젙 ?좏샇? ?쇱튂(援먯감 寃利??좎닔濡?留ㅼ묶 ?좊ː?꾧? ?쒕꼫吏濡??묒슜?⑸땲??"
                    : "Core lifestyle traits from your selections. Cross-validated traits with Q1 boost match confidence."}</p>
                <div class="q2-trait-compact-grid">${traitCards}</div>
            </div>`;
    }

    const q1ProfileRefHtml = q1ProfileRefs.length > 0
        ? q1ProfileRefs.map((item) => `
            <article class="q2-ref-chip-card" style="--q2-ref-accent:${item.color}">
                <div class="q2-ref-chip-top">
                    <span class="q2-ref-chip-icon">${item.icon}</span>
                    <span class="q2-ref-chip-title">${escapeHtml(item.label)}</span>
                </div>
                <p>${escapeHtml(summarizeInsightText(item.text, 88))}</p>
            </article>
        `).join("")
        : `<p class="q2-ref-empty">${isKo ? "Q1?먯꽌 ?좏깮???꾩떆 ?꾨줈???붿빟???꾩쭅 ?놁뒿?덈떎." : "No Q1 city profile summaries have been selected yet."}</p>`;

    const q1ImplicationHtml = q1Traits.length > 0
        ? q1Traits.map((item) => {
            const linked = corroboratedLabels.has(item.trait);
            return `
                <article class="q2-audience-implication" style="--q2-ref-accent:${item.color}">
                    <div class="q2-audience-implication-top">
                        <div class="q2-audience-implication-heading">
                            <span class="q2-source-tag" style="background:${item.color}20;color:${item.color}">${escapeHtml(item.catLabel)}</span>
                            <strong>${escapeHtml(item.trait)}</strong>
                        </div>
                        <span class="q2-audience-implication-badge ${linked ? "q2-audience-implication-badge--linked" : ""}">
                            ${linked ? (isKo ? "Q2? ?곌껐" : "Linked in Q2") : (isKo ? "Q1 湲곗?" : "Q1 basis")}
                        </span>
                    </div>
                    <p>${escapeHtml(summarizeInsightText(item.logic, 100))}</p>
                </article>
            `;
        }).join("")
        : `<p class="q2-ref-empty">${isKo ? "?좏깮???꾩떆 ?꾨줈?꾩뿉???쏀엳???앺솢 留λ씫???꾩쭅 ?뺣━?섏? ?딆븯?듬땲??" : "No lifestyle implications are available from the selected city profiles yet."}</p>`;

    const customSummaryHtml = customResearchSummary
        ? `
            <article class="q2-ref-custom-card">
                <div class="q2-ref-custom-top">
                    <span class="q2-ref-custom-query">${escapeHtml(customResearchSummary.query)}</span>
                    ${customResearchSummary.tags.length ? `<div class="q2-ref-tag-row">${customResearchSummary.tags.map((tag) => `<span class="q2-ref-tag">${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
                </div>
                ${customResearchSummary.interpretation ? `<p class="q2-ref-custom-copy">${escapeHtml(customResearchSummary.interpretation)}</p>` : ""}
                ${customResearchSummary.points.length ? `<ul class="q2-ref-point-list">${customResearchSummary.points.map((point) => `<li>${escapeHtml(summarizeInsightText(point, 120))}</li>`).join("")}</ul>` : ""}
            </article>
        `
        : `<p class="q2-ref-empty">${isKo ? "Q1?먯꽌 而ㅼ뒪? 寃?됱쓣 諛섏쁺?섎㈃ ?붿빟???ш린???쒖떆?⑸땲??" : "Applied custom research from Q1 will appear here."}</p>`;

    const currentSelectionSummaryHtml = hasAnyQ2Selection
        ? `
            <section class="q2-stage-card q2-stage-card--current">
                <div class="q2-stage-card-head">
                    <div>
                        <span class="q2-stage-kicker">${isKo ? "?꾩옱 Q2 ?좏깮" : "Current Q2 selections"}</span>
                        <h4>${isKo ? "?좏깮???대뼡 ?앺솢 留λ씫 ?좏샇濡??쏀엳?붿? 癒쇱? ?뺤씤?섏꽭?? : "See how your current choices translate into lifestyle signals"}</h4>
                    </div>
                    <span class="q2-stage-status q2-stage-status--${confColor}">${escapeHtml(confLabel)}</span>
                </div>
                <p class="q2-stage-copy">${isKo
                    ? "A쨌B쨌C 移대뱶?먯꽌 怨좊Ⅸ 議곌굔???대뼡 ?앺솢 留λ씫 ?좏샇濡?踰덉뿭?섎뒗吏 癒쇱? 蹂댁뿬以띾땲?? ???좏샇媛 ?꾨옒 ?쒕굹由ъ삤 諛⑺뼢怨??먯닔 怨꾩궛??吏곸젒 ?낅젰媛믪씠 ?⑸땲??"
                    : "This card first shows how your A, B, and C choices are translated into lifestyle signals. Those signals then become the direct inputs for the scenario direction and scoring below."}</p>
                ${layer2Html || `<p class="q2-ref-empty">${isKo ? "?좏깮 ??ぉ???꾩쭅 ?좏샇濡??뺣━?섏? ?딆븯?듬땲??" : "Selections are not yet summarized into signals."}</p>`}
            </section>
        `
        : "";

    const referenceCardHtml = `
        <section class="q2-stage-card q2-stage-card--reference">
            <div class="q2-stage-card-head">
                <div>
                    <span class="q2-stage-kicker">${isKo ? "Q1 諛섏쁺 ?붿빟" : "Q1 carry-over summary"}</span>
                    <h4>${isKo ? "?꾩떆 ?꾨줈?꾧낵 而ㅼ뒪? 寃??寃곌낵媛 Q2 ?먮떒 湲곗??쇰줈 ?댁뼱吏묐땲?? : "City-profile and custom research now act as reference inputs for Q2"}</h4>
                </div>
            </div>
            <div class="q2-reference-grid">
                <section class="q2-ref-section">
                    <div class="q2-ref-section-head">
                        <span class="q2-ref-section-kicker">${isKo ? "湲곕낯 ?꾩떆 ?꾨줈?? : "Base city profile"}</span>
                        <strong>${isKo ? "Q1?먯꽌 ?좏깮???듭떖 ?붿빟" : "Selected profile summaries from Q1"}</strong>
                    </div>
                    <div class="q2-ref-chip-grid">${q1ProfileRefHtml}</div>
                </section>
                <section class="q2-ref-section q2-ref-section--custom">
                    <div class="q2-ref-section-head">
                        <span class="q2-ref-section-kicker">${isKo ? "而ㅼ뒪? 寃??諛섏쁺" : "Custom research"}</span>
                        <strong>${isKo ? "Q1 ?ъ슜???뺤쓽 留λ씫 ?붿빟" : "Q1 custom reflection summary"}</strong>
                    </div>
                    ${customSummaryHtml}
                </section>
            </div>
            ${layer1Html ? `
                <section class="q2-ref-current">
                    <div class="q2-ref-section-head">
                        <span class="q2-ref-section-kicker">${isKo ? "?꾩떆 ?꾨줈???댁꽍" : "City-profile interpretation"}</span>
                        <strong>${isKo ? "Q1 ?좏깮媛믪씠 ?쒖궗?섎뒗 ?앺솢 ?좏샇" : "Lifestyle signals suggested by Q1 selections"}</strong>
                    </div>
                    ${layer1Html}
                </section>
            ` : ""}
        </section>`;

    let synthesisHtml = "";
    if (confidence >= 40) {
        const caveat = confidence < 80
            ? `<p class="q2-synthesis-caveat">${isKo ? "?덉긽 ?쒕굹由ъ삤 諛⑺뼢 (異붽? ?좏깮 ??蹂寃?媛??" : "Expected scenario direction (may change with more selections)"}</p>`
            : "";
        const valuesPills = coreValues.map(v => `<span class="q2-value-pill">${escapeHtml(v)}</span>`).join("");

        // ?? ?대윭?ㅽ꽣 湲곕컲 ?좏샇 媛以묒튂 (100??留뚯젏) ??
        const hasQ2 = q2Traits.length > 0;
        const Q1_WEIGHT = hasQ2 ? 40 : (q1Traits.length > 0 ? 100 : 0);
        const Q2_WEIGHT = hasQ2 ? 60 : 0;

        // ?뚮쭏 ?대윭?ㅽ꽣 ?뺤쓽
        const SIGNAL_CLUSTERS = {
            family_care: {
                label: isKo ? "?룧 ?⑤?由?耳?? : "?룧 Family Care",
                color: "#dc2626",
                traits: isKo
                    ? ["媛援??댁쁺 蹂듭옟???믪쓬", "耳???덉떖 ?덉쫰 ??, "?먭꺽 ?뺤씤 ?섏슂 議댁옱", "?묎렐??諛곕젮 ?먮룞??]
                    : ["high household complexity", "strong care and reassurance needs", "remote check-in demand", "accessibility-aware automation"]
            },
            efficiency: {
                label: isKo ? "???쒓컙쨌?⑥쑉" : "??Time & Efficiency",
                color: "#ea580c",
                traits: isKo
                    ? ["?쒓컙 媛移?誘쇨컧", "媛???⑥쑉 異붽뎄", "?몄텧 ?꽷룰?媛 ???먮룞???섏슂"]
                    : ["time-value sensitivity", "chore efficiency focus", "pre-departure and return automation demand"]
            },
            savings: {
                label: isKo ? "?뮥 ?덉빟쨌鍮꾩슜" : "?뮥 Savings",
                color: "#d97706",
                traits: isKo
                    ? ["吏異?誘쇨컧???믪쓬", "利됱떆 泥닿컧 媛移??좏샇"]
                    : ["high spending sensitivity", "preference for immediate value"]
            },
            wellness: {
                label: isKo ? "?뮍 嫄닿컯쨌?ш?" : "?뮍 Health & Leisure",
                color: "#16a34a",
                traits: isKo
                    ? ["嫄닿컯쨌?곕땲??以묒떆", "?ш? ?쒓컙 ?덉쭏 以묒떆", "?섎㈃ ?덉쭏 以묒떆", "?ㅻ궡 ?섍꼍 誘쇨컧"]
                    : ["health and wellness focus", "high value on leisure quality", "sleep quality focus", "indoor environment sensitivity"]
            },
            security: {
                label: isKo ? "?뵏 ?덉쟾쨌蹂댁븞" : "?뵏 Security",
                color: "#2563eb",
                traits: isKo
                    ? ["蹂댁븞/?덉쟾 以묒떆", "臾쇨굔 ?꾩튂 異붿쟻 ?섏슂"]
                    : ["security and safety focus", "object tracking demand"]
            },
            living: {
                label: isKo ? "?룪 二쇨굅쨌?앺솢" : "?룪 Living Space",
                color: "#7c3aed",
                traits: isKo
                    ? ["怨듬룞二쇨굅 ?섍꼍 理쒖쟻??, "?뚰삎 怨듦컙 ?⑥쑉??, "?낅┰ 二쇨굅 ?먮룞??, "怨듭슜 怨듦컙 愿由??덉쫰",
                       "?앺솢 ?숈꽑 怨듭쑀", "媛쒖씤 怨듦컙쨌怨듭슜 怨듦컙 遺꾨━", "?덉젙???앺솢 猷⑦떞 以묒떆", "遺꾩쐞湲걔룹“紐?以묒떆"]
                    : ["shared-building environment optimization", "compact space efficiency", "independent dwelling automation", "shared space management needs",
                       "shared daily routine", "private and shared space separation", "stable routine focus", "ambiance and lighting focus"]
            }
        };

        // Q1/Q2 trait ?명듃
        const q1TraitSet = new Set(q1Traits.map(t => t.trait));
        const q2TraitSet = new Set(q2Traits);
        const q1ContextEntries = getAppliedQ1ContextEntries();

        // 援먯감 寃利?(Q1+Q2 以묐났) 媛먯?
        const corroTraits = new Set();
        for (const t of q2Traits) { if (q1TraitSet.has(t)) corroTraits.add(t); }

        // ?대윭?ㅽ꽣蹂??좏샇 ?먯닔 怨꾩궛
        function calcSignalScore(trait, pool, count, source) {
            let base = pool / Math.max(count, 1);
            // 援먯감 寃利?蹂대꼫?? Q1+Q2 紐⑤몢?먯꽌 ?섏삩 ?좏샇??1.5諛?
            if (corroTraits.has(trait)) base *= 1.5;
            // ?대윭?ㅽ꽣 ?쒕꼫吏: 媛숈? ?대윭?ㅽ꽣??2媛??댁긽 ?좏샇媛 ?덉쑝硫?+20%
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

        // Q1 ?먯닔 怨꾩궛 (援먯감寃利?+ ?대윭?ㅽ꽣 ?쒕꼫吏 諛섏쁺)
        const q1Scores = q1Traits.map(t => ({
            ...t,
            score: calcSignalScore(t.trait, Q1_WEIGHT, q1Traits.length, "q1"),
            isCorro: corroTraits.has(t.trait)
        }));
        // Q1 珥앺빀?????珥덇낵?섎㈃ ?뺢퇋??
        const q1Total = q1Scores.reduce((s, t) => s + t.score, 0);
        if (q1Total > 0) q1Scores.forEach(t => { t.score = (t.score / q1Total) * Q1_WEIGHT; });

        // Q2 ?먯닔 怨꾩궛
        const q2Scores = q2Traits.map(trait => ({
            trait,
            score: calcSignalScore(trait, Q2_WEIGHT, q2Traits.length, "q2"),
            isCorro: corroTraits.has(trait)
        }));
        const q2Total = q2Scores.reduce((s, t) => s + t.score, 0);
        if (q2Total > 0) q2Scores.forEach(t => { t.score = (t.score / q2Total) * Q2_WEIGHT; });

        // perQ1/perQ2 ???쒓렇 怨꾩궛???됯퇏
        const perQ1 = Q1_WEIGHT / Math.max(q1Traits.length, 1);
        const perQ2 = Q2_WEIGHT / Math.max(q2Traits.length, 1);

        // ?대윭?ㅽ꽣 留ㅽ븨 ?⑥닔
        function findCluster(trait) {
            for (const [key, cl] of Object.entries(SIGNAL_CLUSTERS)) {
                if (cl.traits.includes(trait)) return { key, ...cl };
            }
            return null;
        }

        // ?좏샇 ???먯닔 諛?HTML (Q1) ???대윭?ㅽ꽣 洹몃９??
        const q1ScoreBars = q1Scores.map(t => {
            const score = Math.round(t.score);
            const cl = findCluster(t.trait);
            const corroTag = t.isCorro ? `<span class="q2-corro-badge">${isKo ? "Q2 援먯감寃利?횞1.5" : "Q2 corroborated 횞1.5"}</span>` : "";
            const clTag = cl ? `<span class="q2-cluster-dot" style="background:${cl.color}" title="${cl.label}"></span>` : "";
            return `<div class="q2-score-row">
                <span class="q2-score-label">${clTag}<span class="q2-score-dot" style="background:${t.color}"></span>${escapeHtml(t.trait)}</span>
                ${corroTag}
                <div class="q2-score-bar-track"><div class="q2-score-bar-fill q2-score-bar--q1" style="width:100%;transform:scaleX(${score / 100})"></div></div>
                <span class="q2-score-num">${score}${isKo ? "?? : "pt"}</span>
            </div>`;
        }).join("");

        // ?좏샇 ???먯닔 諛?HTML (Q2) ???대윭?ㅽ꽣 洹몃９??
        const warmColors = ["#ea580c", "#f97316", "#fb923c", "#c2410c", "#d97706", "#b91c1c", "#dc2626"];
        const q2ScoreBars = q2Scores.map((t, i) => {
            const score = Math.round(t.score);
            const color = warmColors[i % warmColors.length];
            const cl = findCluster(t.trait);
            const corroTag = t.isCorro ? `<span class="q2-corro-badge">${isKo ? "Q1 援먯감寃利?횞1.5" : "Q1 corroborated 횞1.5"}</span>` : "";
            const clTag = cl ? `<span class="q2-cluster-dot" style="background:${cl.color}" title="${cl.label}"></span>` : "";
            return `<div class="q2-score-row">
                <span class="q2-score-label">${clTag}<span class="q2-score-dot" style="background:${color}"></span>${escapeHtml(t.trait)}</span>
                ${corroTag}
                <div class="q2-score-bar-track"><div class="q2-score-bar-fill q2-score-bar--q2" style="width:100%;transform:scaleX(${score / 100})"></div></div>
                <span class="q2-score-num">${score}${isKo ? "?? : "pt"}</span>
            </div>`;
        }).join("");

        // ?대윭?ㅽ꽣 ?붿빟 (?쒖꽦 ?대윭?ㅽ꽣留?
        const activeClusterHtml = Object.entries(SIGNAL_CLUSTERS).map(([key, cl]) => {
            const q1Hits = q1Traits.filter(t => cl.traits.includes(t.trait));
            const q2Hits = q2Traits.filter(t => cl.traits.includes(t));
            const total = q1Hits.length + q2Hits.length;
            if (total === 0) return "";
            const hasSynergy = total >= 2;
            const hasCorro = q1Hits.some(t => q2Hits.includes(t.trait));
            const badges = [];
            if (hasSynergy) badges.push(isKo ? "?쒕꼫吏 횞1.2" : "synergy 횞1.2");
            if (hasCorro) badges.push(isKo ? "援먯감寃利?횞1.5" : "corroborated 횞1.5");
            return `<span class="q2-cluster-pill" style="border-color:${cl.color};color:${cl.color}">
                ${cl.label} <span class="q2-cluster-count">${total}</span>
                ${badges.length ? `<span class="q2-cluster-bonus">${badges.join(" + ")}</span>` : ""}
            </span>`;
        }).filter(Boolean).join("");

        // ?? ?쒕굹由ъ삤 ?쒓렇 ?ㅼ퐫??吏묎퀎 (怨좉툒 異붾줎) ??
        const tagScoreMap = {};
        const tagSourceCount = {}; // 以묐났 ?꾩쟻 諛⑹???
        const tagSources = {};    // ?쒓렇蹂?湲곗뿬 ?뚯뒪 異붿쟻
        function addTagScore(tag, pts, sourceId, sourceLabel) {
            const key = `${sourceId}|${tag}`;
            if (!tagSourceCount[key]) {
                tagSourceCount[key] = true;
                tagScoreMap[tag] = (tagScoreMap[tag] || 0) + pts;
                if (!tagSources[tag]) tagSources[tag] = [];
                tagSources[tag].push({ label: sourceLabel || sourceId, pts: Math.round(pts) });
            }
        }

        // ?? 紐낆떆???좏깮 (Primary Intent) ??媛以묒튂 理쒓퀬 ??
        // ?ъ슜?먭? 紐낆떆?곸쑝濡??좏깮???뱀꽦 ?쒓렇??吏곸젒???섎룄瑜??섑???
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
        const PRIMARY_WEIGHT = 15; // 紐낆떆???좏깮? ?믪? 媛以묒튂
        // persona ID ???쒖떆 ?쇰꺼
        function getPersonaLabel(id) {
            const el = document.querySelector(`input[value="${id}"]`);
            return el?.dataset?.label || id;
        }
        personaIds.forEach(id => {
            const lbl = getPersonaLabel(id);
            (PRIMARY_INTENT_MAP[id] || []).forEach(tag => addTagScore(tag, PRIMARY_WEIGHT, `primary_${id}`, `${lbl} (${isKo ? "紐낆떆?좏깮" : "explicit"} +${PRIMARY_WEIGHT})`));
        });

        // ?? ?몃? 援ъ꽦 (B) ???앺솢 留λ씫 ?좏샇 ??
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
            (HOUSEHOLD_MAP[id] || []).forEach(tag => addTagScore(tag, HOUSEHOLD_WEIGHT, `hh_${id}`, `${lbl} (${isKo ? "?몃?援ъ꽦" : "household"} +${HOUSEHOLD_WEIGHT})`));
        });

        // ?? ?쇱씠?꾩뒪?뚯씠吏 (C) ??留λ씫 蹂닿컯 ??
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
            (LIFESTAGE_MAP[id] || []).forEach(tag => addTagScore(tag, LIFESTAGE_WEIGHT, `ls_${id}`, `${lbl} (${isKo ? "?쇱씠?꾩뒪?뚯씠吏" : "lifestage"} +${LIFESTAGE_WEIGHT})`));
        });

        // ?? 嫄곗＜吏 ?좏삎 (A) ??諛곌꼍 ?섍꼍 (??? 媛以묒튂) ??
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
            (HOUSING_MAP[id] || []).forEach(tag => addTagScore(tag, HOUSING_WEIGHT, `housing_${id}`, `${lbl} (${isKo ? "嫄곗＜吏" : "housing"} +${HOUSING_WEIGHT})`));
        });

        // ?? Q1 magic keywords ???쒓렇 (?꾩떆 留λ씫) ??
        if (typeof MAGIC_KEY_TO_EXPLORE_TAGS !== "undefined" && _magicAppliedSelected) {
            for (const key of _magicAppliedSelected) {
                const q1Pts = Math.round(perQ1 * 0.8);
                const catObj = CITY_PROFILE_CATEGORIES.find(c => c.key === key);
                const catLbl = catObj ? (isKo ? catObj.labelKo : catObj.labelEn) : key;
                (MAGIC_KEY_TO_EXPLORE_TAGS[key] || []).forEach(tag => addTagScore(tag, q1Pts, `q1_${key}`, `Q1 ${catLbl} (${isKo ? "?꾩떆留λ씫" : "city"} +${q1Pts})`));
            }
        }

        // ?? 而ㅼ뒪? 留덉폆 由ъ꽌移??쒓렇 諛섏쁺 ??
        if (_customResearchData?.applied && Array.isArray(_customResearchData.tags)) {
            const CUSTOM_RESEARCH_WEIGHT = 12;
            const crQuery = _customResearchData.query || "";
            _customResearchData.tags.forEach(tag => {
                addTagScore(tag, CUSTOM_RESEARCH_WEIGHT, `custom_research_${tag}`, `${isKo ? "留덉폆 由ъ꽌移? : "Market Research"}: ${escapeHtml(crQuery)} (+${CUSTOM_RESEARCH_WEIGHT})`);
            });
        }

        // ?? purpose ?띿뒪??蹂대꼫????
        const purposeL = purpose.toLowerCase();
        const purposeBonus = {
            "諛섎젮|??pet|dog|cat": "Care for your pet",
            "遺紐??쒕땲??senior": "Care for seniors",
            "?꾩씠|?먮?|kid|child": "Care for kids",
            "?먮꼫吏|?덉빟|energy|save": "Save energy",
            "蹂댁븞|?덉쟾|security|safe": "Keep your home safe",
            "?섎㈃|??sleep": "Sleep well",
            "寃뚯엫|?곹솕|music": "Enhanced mood",
            "?명긽|泥?냼|媛??chore": "Help with chores",
            "?대룞|嫄닿컯|health": "Stay fit & healthy"
        };
        Object.entries(purposeBonus).forEach(([pattern, tag]) => {
            if (new RegExp(pattern, "i").test(purposeL)) addTagScore(tag, 8, `purpose_${tag}`, `${isKo ? "異붽? ?ㅻ챸 ?띿뒪?? : "context text"} (+8)`);
        });

        // ?? ?좎궗 ?쒓렇 蹂묓빀 (?먮꼫吏 ?덉빟 + ?먮꼫吏 ?덇컧 ???먮꼫吏 ?덉빟?쇰줈 ?듯빀) ??
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
                // ?뚯뒪??蹂묓빀 + ?쇰꺼 湲곗? 以묐났 ?쒓굅 (以묐났 ???먯닔 六ν?湲?諛⑹?)
                if (tagSources[from]) {
                    if (!tagSources[to]) tagSources[to] = [];
                    const existingLabels = new Set(tagSources[to].map(s => s.label));
                    for (const s of tagSources[from]) {
                        if (!existingLabels.has(s.label)) {
                            tagSources[to].push(s);
                            existingLabels.add(s.label);
                        } else {
                            // 以묐났???뚯뒪(?숈씪???댁쑀濡??щ윭 ?쒓렇???먯닔媛 以묐났 遺?щ맂 寃쎌슦)
                            // 蹂묓빀 怨쇱젙?먯꽌 ?먯젏?섍? 六ν?湲곕릺吏 ?딅룄濡??⑹궛???먯닔?먯꽌 李④컧
                            tagScoreMap[to] -= s.pts;
                        }
                    }
                    delete tagSources[from];
                }
            }
        }

        // ?뺣젹 & 100???뺢퇋??
        const sortedTags = Object.entries(tagScoreMap).sort((a, b) => b[1] - a[1]);
        const maxRaw = sortedTags.length > 0 ? sortedTags[0][1] : 1;
        const topTags = sortedTags.slice(0, 6);

        // ?쒕굹由ъ삤 ?쒓렇 ???쒓? 留ㅽ븨
        const tagKoMap = {
            "Save energy": "?먮꼫吏 ?덉빟", "Keep your home safe": "???덉쟾쨌蹂댁븞",
            "Help with chores": "媛???먮룞??, "Care for kids": "?먮? 耳??,
            "Care for seniors": "?쒕땲??耳??, "Care for your pet": "諛섎젮?숇Ъ 耳??,
            "Sleep well": "?섎㈃ 媛쒖꽑", "Enhanced mood": "遺꾩쐞湲??곗텧",
            "Stay fit & healthy": "嫄닿컯쨌?쇳듃?덉뒪", "Easily control your lights": "議곕챸 ?쒖뼱",
            "Keep the air fresh": "怨듦린吏?愿由?, "Find your belongings": "遺꾩떎臾?李얘린",
            "Time saving": "?쒓컙 ?덉빟", "Energy Saving": "?먮꼫吏 ?덇컧",
            "Security": "蹂댁븞", "Family care": "媛議??뚮큵", "Easy to use": "媛꾪렪 ?ъ슜",
            "Health": "嫄닿컯", "Pet care": "??耳??, "Sleep": "?섎㈃"
        };

        const tagBarsHtml = topTags.map(([tag, rawScore], idx) => {
            const norm = Math.round((rawScore / maxRaw) * 100);
            const display = isKo ? (tagKoMap[tag] || tag) : tag;
            const barColor = norm >= 70 ? "#2563eb" : norm >= 40 ? "#3b82f6" : "#93c5fd";
            // ?곗텧 洹쇨굅 (?대뼡 ?뚯뒪?먯꽌 紐???
            const sources = (tagSources[tag] || []).sort((a, b) => b.pts - a.pts);
            const sourceSum = sources.reduce((s, x) => s + x.pts, 0);
            const detailId = `tag-detail-${idx}-${Date.now()}`;
            const sourceLines = sources.map(s =>
                `<span class="q2-tag-source-item">+${s.pts} ??${escapeHtml(s.label)}</span>`
            ).join("");
            // ?뺢퇋???ㅻ챸
            const normExplain = isKo
                ? (idx === 0
                    ? `?먯젏???⑷퀎 ${sourceSum} ??1??湲곗??먯씠誘濡?<strong>100??/strong>?쇰줈 ?쒖떆`
                    : `?먯젏???⑷퀎 ${sourceSum} 첨 1???먯젏??${Math.round(maxRaw)} 횞 100 = <strong>${norm}??/strong>`)
                : (idx === 0
                    ? `Raw total ${sourceSum} ??top scorer, displayed as <strong>100</strong>`
                    : `Raw total ${sourceSum} 첨 top raw ${Math.round(maxRaw)} 횞 100 = <strong>${norm}</strong>`);
            return `<div class="q2-tag-row-wrap">
                <div class="q2-tag-row">
                    <span class="q2-tag-label">${escapeHtml(display)}</span>
                    <div class="q2-tag-bar-track"><div class="q2-tag-bar-fill" style="width:100%;transform:scaleX(${norm / 100});background:${barColor}"></div></div>
                    <span class="q2-tag-score">${norm}</span>
                    <button type="button" class="q2-tag-detail-btn q2-evidence-toggle" data-ev-target="${detailId}" aria-expanded="false"><span class="q2-ev-arrow">??/span><span>${isKo ? "洹쇨굅" : "Details"}</span></button>
                </div>
                <div class="q2-evidence-detail q2-tag-source-detail" id="${detailId}">
                    <p class="q2-tag-source-title">${escapeHtml(display)} ${isKo ? "?먯닔 ?곗텧 洹쇨굅" : "score breakdown"}</p>
                    ${sourceLines}
                    <div class="q2-tag-source-total">
                        <span>${isKo ? "?⑷퀎" : "Total"}: ${sourceSum}${isKo ? "?? : "pt"}</span>
                    </div>
                    <p class="q2-tag-source-norm">${normExplain}</p>
                </div>
            </div>`;
        }).join("");

        // ?? ?꾨낫 ?쒕굹由ъ삤 諛⑺뼢 ?붿빟 ??
        const top3Tags = topTags.slice(0, 3).map(([tag]) => isKo ? (tagKoMap[tag] || tag) : tag);
        const scenarioHint = top3Tags.length > 0
            ? (isKo
                ? `??議고빀?대㈃ <strong>${top3Tags.join(", ")}</strong> 以묒떖???쒕굹由ъ삤媛 ?믪? ?먯닔濡?留ㅼ묶??媛?μ꽦???쎈땲??`
                : `Scenarios focused on <strong>${top3Tags.join(", ")}</strong> are most likely to score highest.`)
            : "";

        const topCategoryLabel = top3Tags[0] || (isKo ? "?꾩쭅 ?놁쓬" : "Not enough data");
        const weightingSummary = isKo
            ? `Q1 ?꾩떆 ?좏샇 ${Q1_WEIGHT}??+ Q2 ?앺솢 ?좏샇 ${Q2_WEIGHT}??
            : `Q1 city signals ${Q1_WEIGHT}pt + Q2 lifestyle signals ${Q2_WEIGHT}pt`;
        const boostSummary = isKo
            ? `${activeClusterHtml ? "?대윭?ㅽ꽣 ?쒕꼫吏? 援먯감寃利앹씠 ?덉쑝硫?異붽? 媛以? : "?좏깮???볦씠硫??쒕꼫吏/援먯감寃利?媛以??쒖옉"}`
            : `${activeClusterHtml ? "Cluster synergy and cross-validation apply extra weighting" : "More aligned selections unlock synergy and cross-validation boosts"}`;
        const statusCopy = confidence >= 80
            ? (isKo ? "?꾩옱 ?좏깮? 諛붾줈 ?쒕굹由ъ삤 留ㅼ묶???ㅼ뼱媛?????뺣룄濡?異⑸텇??援ъ껜?곸엯?덈떎." : "Your current inputs are already specific enough for strong scenario matching.")
            : confidence >= 40
                ? (isKo ? "諛⑺뼢? ?≫삍怨? Q2 ?좏깮???뷀븯硫?媛以묒튂? 留ㅼ묶 ?뺥솗?꾧? ???좊챸?댁쭛?덈떎." : "The direction is visible, and more Q2 input will sharpen weighting and matching.")
                : (isKo ? "?꾩쭅 珥덇린 諛⑺뼢?낅땲?? Q2 ?좏깮???섏뼱?섎㈃ ?덉긽 諛⑺뼢???덉젙?⑸땲??" : "This is still an early direction. More Q2 input will stabilize the prediction.");

        synthesisHtml = `
            <section class="q2-stage-card q2-stage-card--direction">
                <div class="q2-stage-card-head">
                    <div>
                        <span class="q2-stage-kicker">${isKo ? "?덉긽 ?쒕굹由ъ삤 諛⑺뼢" : "Expected scenario direction"}</span>
                        <h4>${isKo ? "?꾩옱 ?낅젰???대뼡 移댄뀒怨좊━? 留ㅼ묶?섎뒗吏 ?쒕늿???뺤씤?섏꽭?? : "See at a glance which categories your current inputs map to"}</h4>
                    </div>
                    <span class="q2-stage-status q2-stage-status--${confColor}">${escapeHtml(confLabel)}</span>
                </div>
                ${caveat}
                <div class="q2-direction-hero">
                    <div class="q2-direction-main">
                        <p class="q2-synthesis-direction">${escapeHtml(direction)}</p>
                        <p class="q2-direction-copy">${escapeHtml(statusCopy)}</p>
                        <div class="q2-synthesis-values">${valuesPills}</div>
                    </div>
                    <div class="q2-direction-summary-grid">
                        <article class="q2-direction-summary-card">
                            <span class="q2-direction-summary-label">${isKo ? "?곗꽑 移댄뀒怨좊━" : "Leading category"}</span>
                            <strong>${escapeHtml(topCategoryLabel)}</strong>
                            <p>${isKo ? "?꾩옱 ?낅젰 湲곗??쇰줈 媛???믪? 留ㅼ묶 媛?μ꽦" : "Highest current match likelihood"}</p>
                        </article>
                        <article class="q2-direction-summary-card">
                            <span class="q2-direction-summary-label">${isKo ? "媛以묒튂 援ъ“" : "Weighting"}</span>
                            <strong>${escapeHtml(weightingSummary)}</strong>
                            <p>${escapeHtml(boostSummary)}</p>
                        </article>
                        <article class="q2-direction-summary-card">
                            <span class="q2-direction-summary-label">${isKo ? "留ㅼ묶 ?댁꽍" : "How to read it"}</span>
                            <strong>${isKo ? "?먯닔 + 洹쇨굅 + 蹂댁젙" : "Score + evidence + boosts"}</strong>
                            <p>${isKo ? "?꾨옒?먯꽌 ??ぉ蹂??먯닔, 媛以묒튂, ?곗텧 洹쇨굅瑜?諛붾줈 ?뺤씤?????덉뒿?덈떎." : "Check the item-level scores, weighting, and breakdowns below."}</p>
                        </article>
                    </div>
                </div>

                <div class="q2-scoreboard">
                    <div class="q2-scoreboard-topline">
                        <p class="q2-scoreboard-title">${isKo ? "?먯닔? 媛以묒튂 援ъ“" : "Scoring and weighting structure"}</p>
                        <button type="button" class="q2-legend-help-btn q2-legend-help-btn--loud" id="q2-legend-help-btn" title="${isKo ? "?먯닔 ?쎈뒗 諛⑸쾿 ?덈궡" : "How to read this score"}">${isKo ? "?쎈뒗 踰? : "Guide"}</button>
                    </div>
                    <p class="q2-scoreboard-method">${isKo
                        ? "Q1(40??怨?Q2(60?? ?좏샇瑜??⑹궛?⑸땲?? 媛숈? ?뚮쭏 ?대윭?ㅽ꽣???좏샇媛 2媛??댁긽?대㈃ ?쒕꼫吏(횞1.2), Q1쨌Q2 ?묒そ?먯꽌 援먯감 寃利앸맂 ?좏샇??媛뺥솕(횞1.5)?⑸땲?? 媛??됱쓽 ?곗륫 踰꾪듉?쇰줈 ?곗텧 洹쇨굅瑜??쇱튌 ???덉뒿?덈떎."
                        : "Q1 (40pt) + Q2 (60pt) signals are combined. Signals in the same theme cluster get synergy (횞1.2), and signals validated by both Q1 and Q2 get a stronger 횞1.5 boost. Use the right-side buttons to open the breakdown."}</p>
                    ${activeClusterHtml ? `<div class="q2-cluster-row">${activeClusterHtml}</div>` : ""}

                    <div class="q2-legend">
                        <span class="q2-legend-item"><span class="q2-legend-bar q2-score-bar--q1"></span> ${isKo ? "Q1 ?꾩떆 留λ씫 ?먯닔" : "Q1 city context score"}</span>
                        <span class="q2-legend-item"><span class="q2-legend-bar q2-score-bar--q2"></span> ${isKo ? "Q2 ?앺솢 留λ씫 ?먯닔" : "Q2 lifestyle score"}</span>
                        <span class="q2-legend-item"><span class="q2-legend-dot" style="background:#dc2626"></span> ${isKo ? "?⑤?由?耳?? : "Family Care"}</span>
                        <span class="q2-legend-item"><span class="q2-legend-dot" style="background:#ea580c"></span> ${isKo ? "?쒓컙쨌?⑥쑉" : "Time & Efficiency"}</span>
                        <span class="q2-legend-item"><span class="q2-legend-dot" style="background:#d97706"></span> ${isKo ? "?덉빟쨌鍮꾩슜" : "Savings"}</span>
                        <span class="q2-legend-item"><span class="q2-legend-dot" style="background:#16a34a"></span> ${isKo ? "嫄닿컯쨌?ш?" : "Health & Leisure"}</span>
                        <span class="q2-legend-item"><span class="q2-legend-dot" style="background:#2563eb"></span> ${isKo ? "?덉쟾쨌蹂댁븞" : "Security"}</span>
                        <span class="q2-legend-item"><span class="q2-corro-badge">${isKo ? "援먯감寃利?횞1.5" : "cross-validated 횞1.5"}</span></span>
                    </div>

                    <div class="q2-score-layout">
                        <div class="q2-score-section q2-score-section--emphasis">
                            <p class="q2-score-section-label"><span class="q2-score-section-icon">?뱧</span> ${isKo ? "?꾩떆 留λ씫 (Q1)" : "City Context (Q1)"} <span class="q2-score-section-weight">${Q1_WEIGHT}${isKo ? "?? : "pt"}</span></p>
                            ${q1ScoreBars || `<p class="q2-score-empty">${isKo ? "Q1 ?꾩떆 ?꾨줈??誘몃컲?? : "No Q1 city profile applied"}</p>`}
                        </div>

                        <div class="q2-score-section q2-score-section--emphasis">
                            <p class="q2-score-section-label"><span class="q2-score-section-icon">?렞</span> ${isKo ? "?앺솢 留λ씫 (Q2)" : "Lifestyle Context (Q2)"} <span class="q2-score-section-weight">${Q2_WEIGHT}${isKo ? "?? : "pt"}</span></p>
                            ${q2ScoreBars || `<p class="q2-score-empty">${isKo ? "?꾩쭅 Q2 ??ぉ???좏깮?섏? ?딆븯?듬땲?? ?꾩쓽 A쨌B쨌C ??ぉ???좏깮?섎㈃ ?앺솢 留λ씫 ?좏샇媛 ?ш린???쒖떆?⑸땲??" : "No Q2 selections yet. Choose items from A쨌B쨌C above to see lifestyle signals here."}</p>`}
                        </div>
                    </div>

                    <div class="q2-score-divider"></div>

                    <div class="q2-scoreboard-topline">
                        <p class="q2-scoreboard-title">${isKo ? "?쒕굹由ъ삤 留ㅼ묶 ?덉륫" : "Scenario match prediction"}</p>
                        <span class="q2-scoreboard-mini">${isKo ? "?대┃?댁꽌 ?곗텧 洹쇨굅 ?뺤씤" : "Open rows to inspect weighting"}</span>
                    </div>
                    ${tagBarsHtml}
                    ${scenarioHint ? `<p class="q2-scenario-hint">${scenarioHint}</p>` : ""}
                </div>
            </section>`;
    }

    // ?? CTA / Missing input ??
    const { hasHousing, hasHousehold, hasLifestage } = getQ2SelectionState();
    const missingParts = [];
    if (!hasHousing)   missingParts.push(isKo ? "嫄곗＜吏 ?좏삎(A)" : "Housing(A)");
    if (!hasHousehold) missingParts.push(isKo ? "?몃? 援ъ꽦(B)"   : "Household(B)");
    if (!hasLifestage) missingParts.push(isKo ? "?쇱씠?꾩뒪?뚯씠吏(C)" : "Life stage(C)");

    let ctaHtml;
    if (missingParts.length > 0) {
        ctaHtml = `<div class="q2-action-prompt q2-action-warn">
            <span class="q2-action-icon">?좑툘</span>
            <p>${isKo
                ? `<strong>${missingParts.join(", ")}</strong>??瑜? ?꾩쭅 ?좏깮?섏? ?딆쑝?⑥뒿?덈떎. ?좏깮?좎닔濡??쒕굹由ъ삤媛 ?뺥솗?댁쭛?덈떎.`
                : `<strong>${missingParts.join(", ")}</strong> not yet selected. More selections lead to better scenarios.`}</p>
        </div>`;
    } else if (!purpose) {
        ctaHtml = `<div class="q2-action-prompt q2-action-todo">
            <span class="q2-action-icon">?랃툘</span>
            <p>${isKo
                ? "?쇱씠???ㅽ??쇱씠???꾩옱 遺덊렪???곹솴???덈떎硫? <strong>??鍮덉뭏???먯쑀濡?쾶 ?곸뼱二쇱꽭??</strong> ?쒕굹由ъ삤 ?뺥솗?꾧? ?ш쾶 ?щ씪媛묐땲??"
                : "If you have a specific lifestyle or pain point, <strong>describe it in the text area above.</strong> It greatly improves scenario accuracy."}</p>
        </div>`;
    } else {
        ctaHtml = `<div class="q2-action-prompt q2-action-done">
            <span class="q2-action-icon">??/span>
            <p>${isKo ? "?곹솴 諛섏쁺 ?꾨즺 ??<strong>?ㅼ쓬</strong> 踰꾪듉???뚮윭 湲곌린瑜??좏깮?섏꽭?? : "Context applied ??press <strong>Next</strong> to select devices"}</p>
        </div>`;
    }

    // ?? Q3 ?뚰듃 諛곕꼫 ??
    const q3HintHtml = `
        <div class="q2-hint-banner">
            <span class="q2-hint-icon">??/span>
            <span>${isKo ? "?ㅼ쓬 ?④퀎(Q3)?먯꽌 湲곌린瑜?怨좊Ⅴ硫? ???寃잛뿉 留욌뒗 ?먮룞???먮쫫???꾩꽦?⑸땲?? : "Pick devices in Q3 to complete an automation flow for this target"}</span>
        </div>`;
    const footerCardHtml = `
        <section class="q2-stage-card q2-stage-card--footer">
            ${ctaHtml}
            ${q3HintHtml}
        </section>`;

    if (!synthesisHtml) {
        synthesisHtml = `
            <section class="q2-stage-card q2-stage-card--direction q2-stage-card--pending">
                <div class="q2-stage-card-head">
                    <div>
                        <span class="q2-stage-kicker">${isKo ? "?덉긽 ?쒕굹由ъ삤 諛⑺뼢" : "Expected scenario direction"}</span>
                        <h4>${isKo ? "Q2 ?좏깮???볦씠硫?媛以묒튂? 留ㅼ묶 諛⑺뼢???ш린?먯꽌 ?뺣━?⑸땲?? : "As Q2 selections accumulate, the weighting and match direction will be summarized here"}</h4>
                    </div>
                    <span class="q2-stage-status q2-stage-status--amber">${isKo ? "以鍮?以? : "Preparing"}</span>
                </div>
                <p class="q2-direction-copy">${isKo
                    ? "?꾩쭅 ?좏깮??異⑸텇?섏? ?딆븘 ?먯닔 援ъ“瑜?怨꾩궛?섏? ?딆븯?듬땲?? ?꾩쓽 A쨌B쨌C ??ぉ???섎굹??怨좊Ⅴ硫??대뼡 移댄뀒怨좊━濡?遺꾨쪟?섍퀬, ?대뼡 媛以묒튂媛 遺숇뒗吏 諛붾줈 ??移대뱶???쒖떆?⑸땲??"
                    : "There is not enough input yet to calculate the scoring structure. As you choose items from A쨌B쨌C above, this card will show which categories they belong to and how weighting is applied."}</p>
            </section>`;
    }

    const place = cityDisplay ? `${cityDisplay} ${isKo ? "?앺솢沅? : "area"}` : (isKo ? "???寃? : "this target");

    return {
        badge: currentLocale === "ko" ? "Q2 Match" : "Q2 Match",
        title: step3InsightTitle,
        summary: step3InsightSummary,
        customHtml: `
            <div class="q2-redesign">
                ${headerHtml}
                ${currentSelectionSummaryHtml || introCardHtml}
                ${synthesisHtml}
                ${footerCardHtml}
            </div>
        `
    };
  } catch (err) {
    console.error("[buildStep3Insight] error:", err);
    return {
        badge: currentLocale === "ko" ? "Q2 Match" : "Q2 Match",
        title: currentLocale === "ko" ? "?쒕굹由ъ삤 留ㅼ묶 媛쒖슂" : "Scenario match overview",
        summary: currentLocale === "ko" ? "移대뱶 ?뚮뜑留?以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎." : "Card rendering error.",
        body: String(err.message || err)
    };
  }
}

function inferRegionalDirection(countryCode) {
    const directions = {
        KR: currentLocale === "ko" ? "鍮좊Ⅸ ????꾪솚怨?吏묒븞 由щ벉 ?뺣━" : "a fast transition into the evening routine",
        US: currentLocale === "ko" ? "蹂듭닔 湲곌린 ?곌껐???앺솢 ?몄씡?????λ㈃?쇰줈 ?뺤텞" : "compressing multi-device value into one clear life moment",
        GB: currentLocale === "ko" ? "?ㅼ슜?깃낵 ?덇컧 ?④낵媛 諛붾줈 ?쏀엳???먮쫫" : "a flow where practicality and savings are immediately clear",
        DE: currentLocale === "ko" ? "?⑥쑉怨??좊ː瑜??④퍡 二쇰뒗 ?먮룞???먮쫫" : "an automation flow that conveys both efficiency and trust"
    };
    return directions[countryCode] || (currentLocale === "ko" ? "吏???앺솢 留λ씫??留욌뒗 吏곴????ъ슜 ?λ㈃" : "an intuitive usage moment fitted to the local context");
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
        .replace(/[^a-z0-9媛-??+/g, " ")
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
    const selectedDevices = getSelectedDevices();
    if (devices.length === 0 && selectedDevices.length === 0) return STEP_INSIGHTS[4];

    const breakdown = getSelectedDeviceBreakdown();
    const deviceCount = breakdown.totalCount;
    const isKo = currentLocale === "ko";
    const devSet = getSelectedDeviceSignalSet();
    const samsungCount = breakdown.samsungCount;
    const partnerCount = breakdown.partnerCount + breakdown.customEntries.length;
    const mixLabel = isKo
        ? `?쇱꽦 ${samsungCount}媛?{partnerCount > 0 ? ` 쨌 ????ъ슜???낅젰 ${partnerCount}媛? : ""}`
        : `Samsung ${samsungCount}${partnerCount > 0 ? ` 쨌 Partner/Custom ${partnerCount}` : ""}`;

    // ?? 猷⑦떞 ?꾨━酉?留ㅽ븨 (湲곌린 議고빀 ??援ы쁽 媛?ν븳 ?먮룞???λ㈃) ??
    const ROUTINE_DB = [
        { id: "away_security", icon: "?썳截?,
          nameKo: "?몄텧 ?덉떖 紐⑤땲?곕쭅", nameEn: "Away Security Monitoring",
          needs: ["移대찓??CCTV"],
          optional: ["?꾩뼱??, "?ㅻ쭏???뚮윭洹?, "?쇱꽌"],
          stepsKo: d => {
              const s = [];
              if (d.has("?꾩뼱??)) s.push(["?꾩뼱??, "?몄텧 ?좉툑"]);
              s.push(["移대찓??CCTV", "?吏곸엫 媛먯? ?뱁솕"]);
              if (d.has("?ㅻ쭏???뚮윭洹?)) s.push(["?ㅻ쭏???뚮윭洹?, "?湲곗쟾??李⑤떒"]);
              if (d.has("?쇱꽌")) s.push(["?쇱꽌", "移⑥엯 ?뚮┝"]);
              return s;
          },
          stepsEn: d => {
              const s = [];
              if (d.has("?꾩뼱??)) s.push(["Door Lock", "lock on leave"]);
              s.push(["Camera", "motion recording"]);
              if (d.has("?ㅻ쭏???뚮윭洹?)) s.push(["Smart Plug", "standby power off"]);
              if (d.has("?쇱꽌")) s.push(["Sensor", "intrusion alert"]);
              return s;
          }
        },
        { id: "sleep_mood", icon: "?뙔",
          nameKo: "痍⑥묠 臾대뱶 ?곗텧", nameEn: "Sleep Mood Automation",
          needs: ["議곕챸"],
          optional: ["TV", "?먯뼱而?, "?ㅽ뵾而?],
          stepsKo: d => {
              const s = [["議곕챸", "議곕룄 10% ?붾컢"]];
              if (d.has("TV")) s.push(["TV", "?붾㈃ Off / ?곕퉬?명듃"]);
              if (d.has("?먯뼱而?)) s.push(["?먯뼱而?, "?섎㈃ 紐⑤뱶 ?꾪솚"]);
              if (d.has("?ㅽ뵾而?)) s.push(["?ㅽ뵾而?, "諛깆깋?뚯쓬 ?ъ깮"]);
              return s;
          },
          stepsEn: d => {
              const s = [["Lights", "dim to 10%"]];
              if (d.has("TV")) s.push(["TV", "screen off / ambient"]);
              if (d.has("?먯뼱而?)) s.push(["AC", "sleep mode"]);
              if (d.has("?ㅽ뵾而?)) s.push(["Speaker", "white noise"]);
              return s;
          }
        },
        { id: "welcome_home", icon: "?룧",
          nameKo: "洹媛 ?곗뺨 猷⑦떞", nameEn: "Welcome Home Routine",
          needs: ["?쇱꽌", "議곕챸"],
          optional: ["?먯뼱而?, "TV", "?ㅽ뵾而?],
          stepsKo: d => {
              const s = [["?쇱꽌", "?꾧? ?吏곸엫 媛먯?"], ["議곕챸", "?먮룞 ?먮벑"]];
              if (d.has("?먯뼱而?)) s.push(["?먯뼱而?, "苡뚯쟻 ?⑤룄 媛??]);
              if (d.has("TV")) s.push(["TV", "?댁뒪/?뚯븙 ?먮룞 ?ъ깮"]);
              return s;
          },
          stepsEn: d => {
              const s = [["Sensor", "entrance motion detected"], ["Lights", "auto on"]];
              if (d.has("?먯뼱而?)) s.push(["AC", "comfort temp on"]);
              if (d.has("TV")) s.push(["TV", "auto play news/music"]);
              return s;
          }
        },
        { id: "energy_save", icon: "??,
          nameKo: "?먮꼫吏 ?덉빟 ?먮룞??, nameEn: "Energy Saving Automation",
          needs: ["?먯뼱而?],
          optional: ["?ㅻ쭏???뚮윭洹?, "議곕챸", "?쇱꽌"],
          stepsKo: d => {
              const s = [["?먯뼱而?, "?몄텧 ???먮룞 ?덉쟾"]];
              if (d.has("?ㅻ쭏???뚮윭洹?)) s.push(["?ㅻ쭏???뚮윭洹?, "?湲곗쟾??紐⑤땲?곕쭅"]);
              if (d.has("議곕챸")) s.push(["議곕챸", "遺?????먮룞 ?뚮벑"]);
              if (d.has("?쇱꽌")) s.push(["?쇱꽌", "?ъ떎 媛먯? ?곕룞"]);
              return s;
          },
          stepsEn: d => {
              const s = [["AC", "auto eco on leave"]];
              if (d.has("?ㅻ쭏???뚮윭洹?)) s.push(["Smart Plug", "standby monitoring"]);
              if (d.has("議곕챸")) s.push(["Lights", "auto off when away"]);
              if (d.has("?쇱꽌")) s.push(["Sensor", "occupancy detection"]);
              return s;
          }
        },
        { id: "pet_care", icon: "?맽",
          nameKo: "諛섎젮?숇Ъ 耳??紐⑤땲?곕쭅", nameEn: "Pet Care Monitoring",
          needs: ["移대찓??CCTV"],
          optional: ["?쇱꽌", "?먯뼱而?, "怨듦린泥?젙湲?],
          stepsKo: d => {
              const s = [["移대찓??CCTV", "?ㅼ떆媛???紐⑤땲?곕쭅"]];
              if (d.has("?쇱꽌")) s.push(["?쇱꽌", "?쒕룞??媛먯?"]);
              if (d.has("?먯뼱而?)) s.push(["?먯뼱而?, "?ㅻ궡 ?⑤룄 ?먮룞 ?좎?"]);
              if (d.has("怨듦린泥?젙湲?)) s.push(["怨듦린泥?젙湲?, "怨듦린吏??먮룞 愿由?]);
              return s;
          },
          stepsEn: d => {
              const s = [["Camera", "live pet monitoring"]];
              if (d.has("?쇱꽌")) s.push(["Sensor", "activity detection"]);
              if (d.has("?먯뼱而?)) s.push(["AC", "auto temp control"]);
              if (d.has("怨듦린泥?젙湲?)) s.push(["Air Purifier", "auto air quality"]);
              return s;
          }
        },
        { id: "laundry", icon: "?ェ",
          nameKo: "?명긽 ?꾨즺 ?뚮┝ 猷⑦떞", nameEn: "Laundry Done Routine",
          needs: ["?명긽湲?],
          optional: ["TV", "?ㅽ뵾而?, "?ㅻ쭏?명룿"],
          stepsKo: d => {
              const s = [["?명긽湲?, "?명긽 ?꾨즺 媛먯?"]];
              if (d.has("TV")) s.push(["TV", "?붾㈃ ?뚮┝ ?앹뾽"]);
              if (d.has("?ㅽ뵾而?)) s.push(["?ㅽ뵾而?, "?뚯꽦 ?뚮┝"]);
              return s;
          },
          stepsEn: d => {
              const s = [["Washer", "cycle complete"]];
              if (d.has("TV")) s.push(["TV", "on-screen notification"]);
              if (d.has("?ㅽ뵾而?)) s.push(["Speaker", "voice alert"]);
              return s;
          }
        },
        { id: "kids_safety", icon: "?뫔",
          nameKo: "?먮? ?덉쟾 紐⑤땲?곕쭅", nameEn: "Kids Safety Monitoring",
          needs: ["移대찓??CCTV", "?쇱꽌"],
          optional: ["?꾩뼱??, "?ㅻ쭏?명룿"],
          stepsKo: d => {
              const s = [["?쇱꽌", "?꾩씠 諛?異쒖엯 媛먯?"], ["移대찓??CCTV", "?ㅼ떆媛??뺤씤"]];
              if (d.has("?꾩뼱??)) s.push(["?꾩뼱??, "?먮? 洹媛 ?뚮┝"]);
              return s;
          },
          stepsEn: d => {
              const s = [["Sensor", "child room entry"], ["Camera", "live check"]];
              if (d.has("?꾩뼱??)) s.push(["Door Lock", "child return alert"]);
              return s;
          }
        }
    ];

    // 援ы쁽 媛?ν븳 猷⑦떞 ?꾪꽣留?
    const matchedRoutines = ROUTINE_DB.filter(r => r.needs.every(n => devSet.has(n)));
    const routineHtml = matchedRoutines.slice(0, 3).map((r, index) => {
        const steps = isKo ? r.stepsKo(devSet) : r.stepsEn(devSet);
        const detailId = `q3-routine-detail-${r.id}-${index}`;
        const triggerText = steps.length > 0 ? `${steps[0][0]} ${steps[0][1]}` : (isKo ? "議곌굔 ?ㅽ뻾" : "Run condition");
        const actionText = steps.slice(1).map(([dev, action]) => `${dev} ${action}`).join(", ");
        const setupSteps = isKo
            ? [
                `SmartThings ?깆뿉??${steps.map(([dev]) => dev).join(", ")} 湲곌린瑜?媛숈? 怨듦컙???깅줉?⑸땲??`,
                `猷⑦떞 > ??猷⑦떞?먯꽌 "留뚯빟" 議곌굔??${triggerText} 湲곗??쇰줈 ?ㅼ젙?⑸땲??`,
                `洹??ㅼ쓬 "?ㅽ뻾" ??ぉ??${actionText || "?꾩냽 ?숈옉"}???쒖꽌?濡?異붽??⑸땲??`,
                `?ㅼ젙 ???섎룞 ?뚯뒪?몃? ??踰??뚮젮 ?뚮┝, ?꾩썝 ?쒖뼱, ?먮룞 ?ㅽ뻾 ??대컢??寃利앺빀?덈떎.`
            ]
            : [
                `Register ${steps.map(([dev]) => dev).join(", ")} in the same SmartThings location.`,
                `Create a new routine and use "${triggerText}" as the If condition.`,
                `Add ${actionText || "the follow-up actions"} in the Then section.`,
                `Run one manual test to verify notifications, power control, and timing.`
            ];
        const stepsHtml = steps.map(([dev, action], i) =>
            `<span class="q3-step">${i > 0 ? '<span class="q3-step-arrow">??/span>' : ''}<span class="q3-step-device">${escapeHtml(dev)}</span><span class="q3-step-action">${escapeHtml(action)}</span></span>`
        ).join("");
        return `<div class="q3-routine-card">
            <div class="q3-routine-head">
                <span class="q3-routine-icon">${r.icon}</span>
                <span class="q3-routine-name">${escapeHtml(isKo ? r.nameKo : r.nameEn)}</span>
                <button type="button" class="q3-routine-toggle" data-routine-target="${detailId}" aria-expanded="false">${isKo ? "?ㅼ튂쨌?ㅼ젙 蹂닿린" : "View setup"}</button>
            </div>
            <div class="q3-routine-flow">${stepsHtml}</div>
            <div class="q3-routine-detail" id="${detailId}" hidden>
                <p class="q3-routine-detail-title">${isKo ? "援ы쁽 諛⑸쾿" : "How to implement"}</p>
                <ol class="q3-routine-detail-list">
                    ${setupSteps.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                </ol>
            </div>
        </div>`;
    }).join("");

    // ?? ?뺤옣 ?쒖븞 (1媛?湲곌린 異붽? ???닿툑?섎뒗 猷⑦떞) ??
    const unmatchedRoutines = ROUTINE_DB.filter(r => !r.needs.every(n => devSet.has(n)));
    let expansionHtml = "";
    for (const r of unmatchedRoutines) {
        const missing = r.needs.filter(n => !devSet.has(n));
        if (missing.length === 1) {
            const missingDev = missing[0];
            const name = isKo ? r.nameKo : r.nameEn;
            expansionHtml = `<div class="q3-expansion">
                <span class="q3-expansion-icon">?뮕</span>
                <p>${isKo
                    ? `?꾩옱 議고빀??<strong>${escapeHtml(missingDev)}</strong>??瑜? 1媛쒕쭔 異붽??섎㈃ <strong>'${escapeHtml(name)}'</strong> ?λ㈃源뚯? 援ы쁽?????덉뒿?덈떎.`
                    : `Add just <strong>${escapeHtml(missingDev)}</strong> to unlock the <strong>'${escapeHtml(name)}'</strong> routine.`}</p>
            </div>`;
            break;
        }
    }

    // 移?HTML
    const chipsHtml = devices.slice(0, 8).map(d => `<span class="insight-chip">${escapeHtml(d)}</span>`).join("");
    const moreCount = devices.length > 8 ? devices.length - 8 : 0;
    const moreHtml = moreCount > 0 ? `<span class="insight-chip insight-chip--more">+${moreCount}</span>` : "";

    // ?쒕굹由ъ삤 DB ??(curation DB媛 ?덉쑝硫?
    const dbCount = (typeof curationDbV1 !== "undefined" && curationDbV1?.scenarios ? curationDbV1.scenarios.length : 0)
        + (typeof curationDbV2 !== "undefined" && curationDbV2?.scenarios ? curationDbV2.scenarios.length : 0);
    const dbLabel = dbCount > 0 ? `${dbCount}+` : "270+";

    return {
        badge: "Q3 Devices",
        title: isKo ? `${deviceCount}媛?湲곌린 ?좏깮 ?꾨즺` : `${deviceCount} devices selected`,
        summary: isKo ? `${mixLabel}` : `${mixLabel}`,
        customHtml: `
            <div class="q3-insight-redesign">
                <div class="q3-topline">
                    <div class="q3-topline-copy">
                        <strong>${isKo ? `${deviceCount}媛?湲곌린 ?좏깮 ?꾨즺` : `${deviceCount} devices ready`}</strong>
                        <span>${escapeHtml(mixLabel)}</span>
                    </div>
                    <div class="q3-chips-row">${chipsHtml}${moreHtml}</div>
                </div>

                ${matchedRoutines.length > 0 ? `
                <div class="q3-routines-section">
                    <p class="q3-routines-title">${isKo ? "???꾩옱 議고빀?쇰줈 援ы쁽 媛?ν븳 ????먮룞???λ㈃" : "??Automation scenes possible with your devices"}</p>
                    <p class="q3-routines-helper">${isKo ? "?좏깮??湲곌린?ㅼ쓽 湲곕뒫???곌껐?섎㈃ ?대윴 猷⑦떞??諛붾줈 留뚮뱾 ???덉뒿?덈떎." : "These routines can be built by connecting your selected devices."}</p>
                    ${routineHtml}
                </div>` : ""}

                ${expansionHtml}

                <div class="q3-cta-box">
                    <p class="q3-cta-text">${isKo
                        ? `?꾨옒 <strong>?쒕굹由ъ삤 留ㅼ묶 ?쒖옉</strong> 踰꾪듉???꾨Ⅴ硫? ??湲곌린 議고빀??留욌뒗 寃利앸맂 ?쒕굹由ъ삤瑜?<strong>${dbLabel}媛?DB</strong>?먯꽌 ?먯깋?⑸땲??`
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
        return "援??? ?꾩떆瑜??좏깮?섎㈃ ?꾨옒 移대뱶????븷蹂??ㅽ뻾 ?몄궗?댄듃媛 諛붾줈 ?쒖떆?⑸땲??";
    }
    if (currentLocale === "de") {
        return "W채hlen Sie Land und Stadt, dann erscheint unten sofort die rollenbezogene Ausf체hrungs-Insight.";
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
            return `${sample}${personas.length > 2 ? " ?? : ""} 議고빀? 醫뗭뒿?덈떎. ?댁젣 吏묒뿉 ?ㅼ뼱?ㅻ뒗 ?쒓컙?대굹 諛섎났?섎뒗 遺덊렪 1媛吏留??곸쑝硫??寃??댁꽍???⑥뵮 ?좊챸?댁쭛?덈떎.`;
        }
        return `${sample || "?꾩옱 ?寃?} 湲곗??쇰줈 留λ씫???≫엳怨??덉뒿?덈떎. 吏湲??낅젰???곹솴 ?ㅻ챸??寃곌낵 ?ㅺ낵 硫붿떆吏 ?곗꽑?쒖쐞瑜?吏곸젒 諛붽씀寃??⑸땲??`;
    }
    if (currentLocale === "de") {
        if (personas.length && !purpose) {
            return `Die Kombination ${sample}${personas.length > 2 ? " und weitere" : ""} ist gut. Erg채nzen Sie jetzt nur noch einen konkreten Moment oder ein wiederkehrendes Problem.`;
        }
        return `F체r ${sample || "diese Zielgruppe"} entsteht bereits ein klarerer Kontext. Ihre Situationsbeschreibung beeinflusst jetzt direkt Ton und Priorit채ten des Ergebnisses.`;
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
        return `${sample}${devices.length > 3 ? " ?? : ""} 議고빀?쇰줈 ?쏀엳怨??덉뒿?덈떎. ?곸쐞瑜?癒쇱? 泥댄겕?????꾩슂 ?녿뒗 湲곌린留?鍮쇰㈃ ?쒕굹由ъ삤??諛?꾧? ?먯뿰?ㅻ읇寃??뺣━?⑸땲??`;
    }
    if (currentLocale === "de") {
        return `Aktuell ist die Kombination ${sample}${devices.length > 3 ? " und weitere" : ""} gew채hlt. Aktivieren Sie zuerst die Oberkategorie und entfernen Sie dann nur die irrelevanten Ger채te.`;
    }
    return `The current mix is reading as ${sample}${devices.length > 3 ? " and more" : ""}. Start broad with the parent category, then remove only the devices that do not belong in the scene.`;
}

function inferFirstUseScene(devices) {
    const set = new Set(devices);

    if (set.has("TV") && set.has("?먯뼱而?)) {
        return currentLocale === "ko"
            ? '"?닿렐 ??吏묒뿉 ?ㅼ뼱?ㅼ옄留덉옄 TV??留욎땄 異붿쿇???④퀬, ?ㅻ궡 ?섍꼍??諛붾줈 苡뚯쟻?섍쾶 留욎떠吏???λ㈃"'
            : '"coming home to a tailored prompt on the TV while the room climate adjusts right away"';
    }
    if (set.has("?됱옣怨?) && (set.has("?명긽湲?) || set.has("嫄댁“湲?))) {
        return currentLocale === "ko"
            ? '"???以鍮꾩? 吏묒븞???쒖옉???숈떆??媛蹂띻쾶 ?щ뒗 ?λ㈃"'
            : '"starting dinner prep and household chores in one lighter flow"';
    }
    if (set.has("濡쒕큸泥?냼湲?) && set.has("?쇱꽌")) {
        return currentLocale === "ko"
            ? '"?몄텧 以묒뿉??吏??곹깭瑜??덉떖?섍퀬 愿由ы븯???λ㈃"'
            : '"managing the home with reassurance even while away"';
    }
    if (set.has("議곕챸") && set.has("?ㅽ뵾而?)) {
        return currentLocale === "ko"
            ? '"留??쒕쭏?붾줈 ???遺꾩쐞湲곗? 猷⑦떞???④퍡 諛붾뚮뒗 ?λ㈃"'
            : '"changing the evening mood and routine together with one voice prompt"';
    }

    return currentLocale === "ko"
        ? '"?ъ슜?먭? 蹂듭옟???ㅼ젙 ?놁씠 諛붾줈 泥닿컧 媛移섎? ?먮겮??泥??쒓컙"'
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

    // ?? ?띿뒪??湲곕컲 異붾줎 (湲곗〈) ??
    if (text.includes("留욌쾶??) || text.includes("?닿렐") || text.includes("?ы깮") || text.includes("?섏씠釉뚮━??)) add("?쒓컙 媛移?誘쇨컧", "time-value sensitivity");
    if (text.includes("?꾩씠") || text.includes("?≪븘") || text.includes("媛議?) || text.includes("?먮?")) add("媛援??댁쁺 蹂듭옟???믪쓬", "high household complexity");
    if (text.includes("遺紐?) || text.includes("?쒕땲??) || text.includes("?뚮큵")) add("耳???덉떖 ?덉쫰 ??, "strong care and reassurance needs");
    if (text.includes("?먮꼫吏") || text.includes("?앺솢鍮?) || text.includes("?덇컧") || text.includes("鍮꾩슜")) add("吏異?誘쇨컧???믪쓬", "high spending sensitivity");
    if (text.includes("二쇰쭚") || text.includes("?ш?") || text.includes("?곕땲??)) add("?ш? ?쒓컙 ?덉쭏 以묒떆", "high value on leisure quality");
    if (text.includes("??) || text.includes("諛섎젮") || text.includes("pet")) add("?먭꺽 ?뺤씤 ?섏슂 議댁옱", "remote check-in demand");
    if (text.includes("嫄닿컯") || text.includes("?쇳듃?덉뒪") || text.includes("health") || text.includes("wellness")) add("嫄닿컯쨌?곕땲??以묒떆", "health and wellness focus");

    // ?? ?ㅼ젣 ?좏깮??persona ID 湲곕컲 異붾줎 (媛뺥솕) ??
    const personaIds = new Set(getSelectedPersonaOptionIds());

    // ??耳??(t_pet + int_pet 紐⑤몢)
    if (personaIds.has("t_pet") || personaIds.has("int_pet")) add("?먭꺽 ?뺤씤 ?섏슂 議댁옱", "remote check-in demand");
    // ?먮? 愿??(hh_ + ls_ + t_ + int_)
    if (personaIds.has("hh_young_kids") || personaIds.has("hh_school_kids") || personaIds.has("t_multi_kids") || personaIds.has("ls_parenting") || personaIds.has("int_kids")) add("媛援??댁쁺 蹂듭옟???믪쓬", "high household complexity");
    // ?쒕땲??耳??(hh_ + ls_ + t_ + int_)
    if (personaIds.has("hh_senior") || personaIds.has("hh_multi_gen") || personaIds.has("ls_senior") || personaIds.has("t_parent_care") || personaIds.has("t_parent_away") || personaIds.has("int_senior")) add("耳???덉떖 ?덉쫰 ??, "strong care and reassurance needs");
    // 嫄닿컯/?곕땲??
    if (personaIds.has("t_wellness") || personaIds.has("ls_empty_nest") || personaIds.has("int_health")) add("嫄닿컯쨌?곕땲??以묒떆", "health and wellness focus");
    // ?ы깮/?섏씠釉뚮━??
    if (personaIds.has("t_remote") || personaIds.has("t_dual_income")) add("?쒓컙 媛移?誘쇨컧", "time-value sensitivity");
    // 蹂댁븞
    if (personaIds.has("t_security") || personaIds.has("t_long_away") || personaIds.has("int_safe")) add("蹂댁븞/?덉쟾 以묒떆", "security and safety focus");
    // 媛???⑥쑉
    if (personaIds.has("t_efficiency") || personaIds.has("int_chores")) add("媛???⑥쑉 異붽뎄", "chore efficiency focus");
    // 留욌쾶??
    if (personaIds.has("t_dual_income") || personaIds.has("t_solo_parent")) add("?쒓컙 媛移?誘쇨컧", "time-value sensitivity");
    // ?섎㈃
    if (personaIds.has("t_night_shift") || personaIds.has("int_sleep")) add("?섎㈃ ?덉쭏 以묒떆", "sleep quality focus");
    // ?ш?/遺꾩쐞湲?
    if (personaIds.has("int_mood") || personaIds.has("ls_newlywed")) add("?ш? ?쒓컙 ?덉쭏 以묒떆", "high value on leisure quality");
    // ?먮꼫吏
    if (personaIds.has("int_energy")) add("吏異?誘쇨컧???믪쓬", "high spending sensitivity");

    // ?? 嫄곗＜吏 ?좏삎 (A 洹몃９) 湲곕컲 異붾줎 ??
    if (personaIds.has("h_apt") || personaIds.has("h_villa")) add("怨듬룞二쇨굅 ?섍꼍 理쒖쟻??, "shared-building environment optimization");
    if (personaIds.has("h_compact")) add("?뚰삎 怨듦컙 ?⑥쑉??, "compact space efficiency");
    if (personaIds.has("h_house") || personaIds.has("h_townhouse")) add("?낅┰ 二쇨굅 ?먮룞??, "independent dwelling automation");
    if (personaIds.has("h_shared")) add("怨듭슜 怨듦컙 愿由??덉쫰", "shared space management needs");
    if (personaIds.has("h_care")) add("耳???덉떖 ?덉쫰 ??, "strong care and reassurance needs");

    // ?? ?몃? 援ъ꽦 (B 洹몃９) 誘몃ℓ????ぉ ??
    if (personaIds.has("hh_solo")) add("?뚰삎 怨듦컙 ?⑥쑉??, "compact space efficiency");
    if (personaIds.has("hh_couple")) add("?앺솢 ?숈꽑 怨듭쑀", "shared daily routine");
    if (personaIds.has("hh_adult_kids")) add("媛쒖씤 怨듦컙쨌怨듭슜 怨듦컙 遺꾨━", "private and shared space separation");
    if (personaIds.has("t_single_income")) add("吏異?誘쇨컧???믪쓬", "high spending sensitivity");
    if (personaIds.has("t_acc_needs")) add("?묎렐??諛곕젮 ?먮룞??, "accessibility-aware automation");

    // ?? ?쇱씠?꾩뒪?뚯씠吏 (C 洹몃９) 誘몃ℓ????ぉ ??
    if (personaIds.has("ls_starter")) add("利됱떆 泥닿컧 媛移??좏샇", "preference for immediate value");
    if (personaIds.has("ls_settled") || personaIds.has("ls_established")) add("?덉젙???앺솢 猷⑦떞 以묒떆", "stable routine focus");
    if (personaIds.has("t_weekend_out")) add("?몄텧 ?꽷룰?媛 ???먮룞???섏슂", "pre-departure and return automation demand");
    if (personaIds.has("t_homebody")) add("?ш? ?쒓컙 ?덉쭏 以묒떆", "high value on leisure quality");
    if (personaIds.has("int_air")) add("?ㅻ궡 ?섍꼍 誘쇨컧", "indoor environment sensitivity");
    if (personaIds.has("int_lights")) add("遺꾩쐞湲걔룹“紐?以묒떆", "ambiance and lighting focus");
    if (personaIds.has("int_find")) add("臾쇨굔 ?꾩튂 異붿쟻 ?섏슂", "object tracking demand");

    // Q2 誘몄꽑????鍮?諛곗뿴 諛섑솚 ??洹쇨굅 ?녿뒗 湲곕낯媛믪쓣 梨꾩슦吏 ?딆쓬
    return traits;
}

function inferScenarioDirection(traits, purpose) {
    const isKo = currentLocale === "ko";
    const text = `${traits.join(" ")} ${purpose}`.toLowerCase();
    const personaIds = new Set(getSelectedPersonaOptionIds());
    const directions = [];

    // 紐낆떆???좏깮 湲곕컲 (?곗꽑?쒖쐞 ?믪쓬)
    if (personaIds.has("t_pet") || personaIds.has("int_pet")) directions.push(isKo ? "諛섎젮?숇Ъ 耳?댁? ?덉떖 紐⑤땲?곕쭅" : "pet care and peace-of-mind monitoring");
    if (personaIds.has("hh_young_kids") || personaIds.has("hh_school_kids") || personaIds.has("t_multi_kids") || personaIds.has("ls_parenting") || personaIds.has("int_kids"))
        directions.push(isKo ? "?먮? ?덉쟾怨?媛議??뚮큵 ?먮룞?? : "child safety and family care automation");
    if (personaIds.has("hh_senior") || personaIds.has("hh_multi_gen") || personaIds.has("t_parent_care") || personaIds.has("int_senior"))
        directions.push(isKo ? "?쒕땲???뚮큵怨??먭꺽 ?덉떖 ?뺤씤" : "senior care and remote reassurance");
    if (personaIds.has("t_wellness") || personaIds.has("int_health"))
        directions.push(isKo ? "嫄닿컯쨌?곕땲??猷⑦떞 吏?? : "health and wellness routine support");

    // ?띿뒪??湲곕컲 蹂댁셿
    if (directions.length === 0) {
        if (text.includes("??) || text.includes("諛섎젮") || text.includes("pet")) directions.push(isKo ? "諛섎젮?숇Ъ 耳?댁? ?덉떖 紐⑤땲?곕쭅" : "pet care and peace-of-mind monitoring");
        if (text.includes("耳??) || text.includes("?덉떖") || text.includes("?뚮큵")) directions.push(isKo ? "?뚮큵 遺???꾪솕? ?덉떖 媛뺥솕" : "reduced care burden and stronger reassurance");
        if (text.includes("?먮꼫吏") || text.includes("吏異?) || text.includes("鍮꾩슜")) directions.push(isKo ? "?덇컧 ?④낵瑜??덉뿉 蹂댁씠寃?蹂댁뿬二쇰뒗 諛⑺뼢" : "visible savings and cost-control value");
        if (text.includes("?ш?") || text.includes("?곕땲??)) directions.push(isKo ? "二쇰쭚怨???곸쓽 ?ъ쑀瑜??뚮났?섎뒗 諛⑺뼢" : "recovering weekend and evening ease");
    }

    if (directions.length === 0) return isKo ? "蹂듭옟??吏묒븞 猷⑦떞??媛蹂띻쾶 留뚮뱶??諛⑺뼢" : "making complex home routines feel lighter";
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

    // step ?꾪솚 ???댁쟾 step-insight 利됱떆 ?대━??(鍮꾨룞湲???뼱?곌린 諛⑹?)
    ++latestStep2InsightRequest;
    stepInsight.innerHTML = "";

    updateStepInsight();

    // step ?꾪솚 ???댁쟾 ?먮윭 硫붿떆吏 ?대━??
    const errEl = resultDiv.querySelector(".error");
    if (errEl) errEl.remove();

    // Step 4媛 ?꾨땲硫??먮젅?댁뀡 ?꾨젅??& Output Flow Tracker ?④?/珥덇린??
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
    // ?곹깭 諛곗? ?쒓굅
    if (currentStep !== 4) {
        setSectionStatusBadge("curation-title", null);
        setSectionStatusBadge("category-title", null);
        setSectionStatusBadge("result-frame-title", null);
    }
}

function alignWizardStepViewport() {
    const activeStep = document.querySelector(`.wizard-step[data-step="${currentStep}"]`);
    if (!activeStep) return;

    const focusTarget = currentStep === 3
        ? activeStep.querySelector("#q3-auto-btn, input[type='radio']:checked, input[type='checkbox']:checked, textarea, input[type='text']")
        : activeStep.querySelector(".role-card.selected, .role-card, select, input[type='text'], textarea, input[type='checkbox']");
    focusTarget?.focus({ preventScroll: true });

    const scrollTarget = currentStep === 3
        ? (document.getElementById("wizard-screen") || activeStep)
        : activeStep;
    const topPadding = currentStep === 3 ? 0 : 12;
    const yOffset = Math.max(0, scrollTarget.getBoundingClientRect().top + window.pageYOffset - topPadding);
    window.scrollTo({ top: yOffset, behavior: "smooth" });
}

function enforceStepViewportAlignment() {
    window.requestAnimationFrame(() => {
        alignWizardStepViewport();
        if (currentStep === 3) {
            window.setTimeout(() => {
                if (currentStep !== 3) return;
                const anchor = document.getElementById("wizard-screen") || document.querySelector('.wizard-step[data-step="3"]');
                if (!anchor) return;
                const yOffset = Math.max(0, anchor.getBoundingClientRect().top + window.pageYOffset);
                window.scrollTo({ top: yOffset, behavior: "auto" });
            }, 140);
        }
    });
}

function moveStep(delta) {
    if (delta > 0 && !validateCurrentStep()) return;
    const nextStep = Math.min(4, Math.max(2, currentStep + delta));
    if (nextStep === currentStep) return;
    deferStep3InsightUntilInteraction = nextStep === 3;
    currentStep = nextStep;
    syncWizardUi();
    enforceStepViewportAlignment();
}

function validateCurrentStep() {
    // Q1 吏곷Т ?좏깮 ?ㅽ궢 ???먮룞 湲곕낯媛?蹂댁옣
    if (currentStep === 1) return true;
    if (currentStep === 2 && !countrySelect.value) {
        resultDiv.innerHTML = `<p class="error">${t("countryMissing")}</p>`;
        return false;
    }
    if (currentStep === 3) {
        const missing = validateQ3Groups();
        if (missing.length > 0) {
            const labels = missing.join(", ");
            // step-insight ?곸뿭???덈궡 ?쒖떆 (resultDiv ???
            const insightEl = document.getElementById("step-insight");
            if (insightEl) {
                const warnHtml = `<div class="q2-action-prompt q2-action-warn" style="margin-top:8px">
                    <span class="q2-action-icon">?좑툘</span>
                    <p>${currentLocale === "ko"
                        ? `<strong>${labels}</strong> ?곸뿭?먯꽌 理쒖냼 1媛쒕? ?좏깮?섍굅??吏곸젒 ?낅젰??二쇱꽭??`
                        : `Please select at least one option in: <strong>${labels}</strong>`}</p>
                </div>`;
                // 湲곗〈 寃쎄퀬媛 ?덉쑝硫?援먯껜
                const existing = insightEl.querySelector(".q2-action-warn");
                if (existing) existing.outerHTML = warnHtml;
                else insightEl.insertAdjacentHTML("beforeend", warnHtml);
            }
            return false;
        }
    }
    if (currentStep === 4 && getSelectedDevices().length === 0) {
        resultDiv.innerHTML = `<p class="error">${currentLocale === "ko" ? "Q3?먯꽌 湲곌린瑜??섎굹 ?댁긽 ?좏깮??二쇱꽭??" : "Please select at least one device in Q3."}</p>`;
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
                <h4>${currentLocale === "ko" ? "????븷??留욌뒗 ?낅Т" : "Who this role fits"}</h4>
                <ul>${(guide.fitFor || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            </article>
            <div class="role-brief-block">
                <h4>${currentLocale === "ko" ? "?좏깮?섎㈃ 諛쏅뒗 留덉????뺣낫 (What You Get)" : "What You Get"}</h4>
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
                <h4>${currentLocale === "ko" ? "吏곷Т媛 ?뺥솗????留욎쓣 ?? : "If your role is not an exact match"}</h4>
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
                    "?ㅽ봽?쇱씤 留ㅼ옣 ?곷떞/?쒖뿰 ?ㅽ겕由쏀듃瑜?留뚮뱶???낅Т",
                    "留ㅼ옣 吏곸썝 援먯쑁, ?몄씪利??좏겕, ?곕え ?먮쫫???꾩슂???낅Т",
                    "?곷떞 ?꾪솚?⑥쓣 ?믪씠???꾩옣 硫붿떆吏媛 ?꾩슂???낅Т"
                ]
                : [
                    "Teams creating in-store consultation and demo scripts",
                    "Teams running store staff enablement and sales talk flow",
                    "Teams improving consultation conversion on site"
                ],
            whatYouGet: currentLocale === "ko"
                ? [
                    {
                        title: "留ㅼ옣 泥?10珥???臾몄옣",
                        meaning: "怨좉컼??諛붾줈 ?댄빐?섎룄濡?泥?臾몄옣??怨좎젙?⑸땲??",
                        example: "?덉떆: 吏묒뿉 ?ㅼ뼱?ㅼ옄留덉옄 ?먮룞?쇰줈 ?몄븞?????以鍮꾧? ?쒖옉?⑸땲??"
                    },
                    {
                        title: "30珥??곕え ?먮쫫",
                        meaning: "臾몄젣 -> ?닿껐 ?λ㈃ ?쒖꽌濡?鍮좊Ⅴ寃?蹂댁뿬二쇰뒗 援ъ“?낅땲??",
                        example: "?덉떆: ?닿렐 ??吏??꾩갑 -> 異붿쿇 移대뱶 -> ?먰꺆 ?ㅽ뻾"
                    },
                    {
                        title: "異붿쿇 湲곌린 議고빀",
                        meaning: "?낅Ц?뺢낵 ?뺤옣???쒖븞???섎닠???곷떞?⑸땲??",
                        example: "?덉떆: Entry 1? / Core 2? 議고빀"
                    },
                    {
                        title: "?ㅼ젙 泥댄겕 ?쒖꽌",
                        meaning: "?명똿 ?ㅽ뙣瑜?以꾩씠??理쒖냼 泥댄겕由ъ뒪?몄엯?덈떎.",
                        example: "?덉떆: 怨꾩젙 濡쒓렇??-> ???앹꽦 -> 湲곌린 ?곌껐 -> ?먮룞?????
                    },
                    {
                        title: "?명솚???ъ쟾 ?먭?",
                        meaning: "?꾩옣?먯꽌 ?먯＜ ?곗????댁뒋瑜?癒쇱? ?뺤씤?⑸땲??",
                        example: "?덉떆: Wi-Fi ??? ??踰꾩쟾, 怨꾩젙 吏??
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
                ? "吏곷Т媛 ?좊ℓ?섎㈃ retail??怨좊Ⅴ硫??⑸땲?? 怨좉컼怨쇱쓽 泥????臾몄옣, ?곕え ?먮쫫, 異붿쿇 議고빀泥섎읆 ?꾩옣?먯꽌 諛붾줈 ??異쒕젰???앹꽦?⑸땲??"
                : "If unclear, start with retail. You will get first-line talk tracks, demo flow, and ready-to-use recommendation mixes.",
            emphasized: currentLocale === "ko"
                ? ["?꾩옣 ?ㅻ챸 ?먮쫫", "SmartThings ?명똿", "?명솚???ㅽ뙣 ?щ?"]
                : ["Store explanation flow", "SmartThings setup", "Compatibility and failure cases"],
            deemphasized: currentLocale === "ko"
                ? ["?낆? ?곌껐 ??대컢", "留ㅼ옣 ?곸슜??硫붿떆吏 ??, "?꾩옣 FAQ ?듭떖 吏덈Ц"]
                : ["Upsell timing cues", "Store-ready message tone", "Core in-store FAQ prompts"]
        },
        dotcom: {
            fitFor: currentLocale === "ko"
                ? [
                    "PDP/?쒕뵫/諛곕꼫/FAQ ?????꾪솚 援ъ“瑜??ㅻ（???낅Т",
                    "?λ컮援щ땲 吏꾩엯, ?대┃瑜? 泥대쪟?쒓컙 ???꾪솚 KPI瑜??ㅻ（???낅Т",
                    "援??蹂?eStore ?쒗뭹 ?몄텧/踰덈뱾 援ъ꽦??愿由ы븯???낅Т"
                ]
                : [
                    "Teams owning PDP, landing, banner, and FAQ conversion flow",
                    "Teams optimizing CTR, dwell time, and add-to-cart KPIs",
                    "Teams managing regional eStore product and bundle mapping"
                ],
            whatYouGet: currentLocale === "ko"
                ? [
                    {
                        title: "?쒕뵫 泥??붾㈃ 硫붿떆吏",
                        meaning: "泥??붾㈃?먯꽌 ?대뼡 媛移섎???蹂댁뿬以꾩? ?뺥빀?덈떎.",
                        example: "?덉떆: '?곕━ 吏????猷⑦떞??1??쑝濡??쒖옉'"
                    },
                    {
                        title: "吏??eStore ?꾨찓???쒗뭹 留?,
                        meaning: "援??蹂??곌껐 URL怨?二쇰젰 ?쒗뭹 湲곗??낅땲??",
                        example: "?덉떆: 援?? ?꾨찓??+ 媛???쒗뭹 ?쇱씤??
                    },
                    {
                        title: "踰덈뱾 援ъ“ (Entry/Core/Premium)",
                        meaning: "媛寃?媛移??④퀎蹂?異붿쿇??援ъ꽦?⑸땲??",
                        example: "?덉떆: Entry(湲곕낯) -> Core(二쇰젰) -> Premium(?뺤옣)"
                    },
                    {
                        title: "?꾩닔 vs ?좏깮 湲곌린",
                        meaning: "理쒖냼 援щℓ 援ъ꽦怨?異붽? 援ъ꽦??遺꾨━?⑸땲??",
                        example: "?덉떆: ?꾩닔 1~2媛?+ ?좏깮 ?뺤옣 1媛?
                    },
                    {
                        title: "Benefit -> Product 留ㅽ븨",
                        meaning: "?쒗깮 臾몄옣???대뼡 ?쒗뭹怨??곌껐?좎? ?뺣━?⑸땲??",
                        example: "?덉떆: '?쒓컙 ?덉빟' -> A?쒗뭹 / '?덉떖' -> B?쒗뭹"
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
                ? "吏곷Т媛 ?좊ℓ?섏?留??⑤씪???꾪솚??紐⑺몴?쇰㈃ dotcom??怨좊Ⅴ?몄슂. 硫붿떆吏-CTA-?곹뭹 留ㅽ븨源뚯? ???ㅽ뻾??寃곌낵瑜?諛쏆쓣 ???덉뒿?덈떎."
                : "If unclear but online conversion is your goal, choose dotcom. You will get message-CTA-product mapping ready for web execution.",
            emphasized: currentLocale === "ko"
                ? ["?꾪솚瑜?媛앸떒媛 愿??, "吏???곹뭹 留ㅽ듃由?뒪", "踰덈뱾 援ъ꽦"]
                : ["Conversion/AOV perspective", "Regional product matrix", "Bundle composition"],
            deemphasized: currentLocale === "ko"
                ? ["PDP 臾몄옣 湲몄씠 媛?대뱶", "FAQ ?щ같移??ъ씤??, "CTA ?곗꽑?쒖쐞 寃利???ぉ"]
                : ["PDP copy-length guide", "FAQ reorder points", "CTA priority checks"]
        },
        brand: {
            fitFor: currentLocale === "ko"
                ? [
                    "罹좏럹??硫붿씤 硫붿떆吏/移댄뵾 ?ㅼ쓣 湲고쉷?섎뒗 ?낅Т",
                    "湲濡쒕쾶 硫붿떆吏? 濡쒖뺄 硫붿떆吏 泥닿퀎瑜??댁쁺?섎뒗 ?낅Т",
                    "?쒖쫵/?대깽??以묒떖 ?듯빀 罹좏럹?몄쓣 湲고쉷?섎뒗 ?낅Т"
                ]
                : [
                    "Teams crafting campaign-level message and copy tone",
                    "Teams operating global and local message frameworks",
                    "Teams planning season and event-led integrated campaigns"
                ],
            whatYouGet: currentLocale === "ko"
                ? [
                    {
                        title: "釉뚮옖???듭떖 ??臾몄옣",
                        meaning: "釉뚮옖???ㅼ쓣 ?좎??????臾몄옣?낅땲??",
                        example: "?덉떆: ?곕━ 吏?猷⑦떞????媛蹂띻쾶."
                    },
                    {
                        title: "?⑤Ц/?λЦ 硫붿떆吏 ?명듃",
                        meaning: "吏㏃? 愿묎퀬 臾몄옣怨?湲??ㅻ챸 臾몄옣???④퍡 ?쒓났?⑸땲??",
                        example: "?덉떆: 8~12???⑤Ц + ?곸꽭 ?ㅻ챸 2~3臾몄옣"
                    },
                    {
                        title: "湲濡쒕쾶 vs 濡쒖뺄 硫붿떆吏 遺꾨━",
                        meaning: "怨듯넻 硫붿떆吏? 援??蹂?蹂二쇰? 援щ텇?⑸땲??",
                        example: "?덉떆: Global '?몄븞?? / Local '?닿렐 吏곹썑 猷⑦떞'"
                    },
                    {
                        title: "?쒖쫵/?대깽??罹좏럹???먮쫫",
                        meaning: "?곗묶-?꾨줈紐⑥뀡-由щ쭏?몃뱶 ?쒖꽌濡??댁쁺?⑸땲??",
                        example: "?덉떆: ?깆닔湲????곗묶 -> ?쒖쫵 ?꾨줈紐⑥뀡 -> 由щ쭏?몃뱶"
                    },
                    {
                        title: "肄섑뀗痢???媛?대뱶",
                        meaning: "?곸긽/?뚯뀥/諛곕꼫?먯꽌 媛숈? 留먰닾瑜??좎??⑸땲??",
                        example: "?덉떆: ?곕쑜?섍퀬 媛꾧껐???ㅼ쑝濡???梨꾨꼸 ?듭씪"
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
                ? "吏곷Т媛 ?좊ℓ?섏?留?罹좏럹???ㅺ낵 釉뚮옖??硫붿떆吏媛 以묒슂?섎㈃ brand瑜??좏깮?섏꽭?? 媛먯젙 以묒떖 移댄뵾? 湲濡쒕쾶/濡쒖뺄 遺꾨━ 援ъ“瑜?諛붾줈 ?뺤씤?????덉뒿?덈떎."
                : "If unclear but brand tone matters most, choose brand. You will get emotion-led copy and a global/local message split.",
            emphasized: currentLocale === "ko"
                ? ["臾명솕 留λ씫 ?ㅽ넗由ы뀛留?, "硫붿떆吏 ?쇨???, "釉뚮옖???섎? 媛뺥솕"]
                : ["Culture-context storytelling", "Message consistency", "Brand meaning reinforcement"],
            deemphasized: currentLocale === "ko"
                ? ["罹좏럹??臾몄옣 ??媛?대뱶", "濡쒖뺄 移댄뵾 蹂二?湲곗?", "?쒖쫵/?대깽???곌껐 ?ㅼ썙??]
                : ["Campaign tone guide", "Local copy variation rules", "Season/event linkage keywords"]
        }
    };

    return guides[id] || {
        fitFor: [getRoleBrief(id)],
        whatYouGet: [getRoleBrief(id)],
        emphasized: [getRoleFocus(id)],
        deemphasized: [],
        fallback: currentLocale === "ko" ? "媛??媛源뚯슫 ??븷??癒쇱? 怨좊Ⅸ ??寃곌낵瑜?鍮꾧탳??議곗젙?섏꽭??" : "Pick the closest role first, then compare outputs and adjust."
    };
}

function updateStatePreview() {
    return;
}

function inferMissionBucket(purpose, selectedDeviceGroups = []) {
    const text = purpose.toLowerCase();
    if (text.includes("?먮꼫吏") || text.includes("?덉빟") || text.includes("鍮꾩슜")) return "Save";
    if (text.includes("?덉쟾") || text.includes("蹂댁븞") || text.includes("secure")) return "Secure";
    if (text.includes("???) || text.includes("?대룞") || text.includes("?뷀꽣") || text.includes("寃뚯엫") || text.includes("gaming")) return "Play";
    if (text.includes("媛議?) || text.includes("?뚮큵") || text.includes("諛섎젮") || text.includes("??) || text.includes("?쒕땲??)) return "Care";
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

    // Output Flow Tracker ?쒖옉: STEP 1 ?쒖꽦
    updateOutputFlowTracker(1, { 1: "active", 2: "waiting", 3: "waiting" });
    const isKoGen = currentLocale === "ko";
    updateSectionHelper("curation-helper",
        isKoGen ? "?뵇 ?낅젰 ?뺣낫瑜?遺꾩꽍?섏뿬 理쒖쟻???쒕굹由ъ삤瑜?李얘퀬 ?덉뒿?덈떎?? : "?뵇 Analyzing your inputs to find the best scenarios??);
    setSectionStatusBadge("curation-title", "working");

    // Build ???먮젅?댁뀡 癒쇱? ?ㅽ뻾
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

    // 留ㅼ묶 ?꾨줈?몄뒪 移대뱶 ?쒖떆 以묒씠硫?AI 利됱떆 ?쒖옉?섏? ?딆쓬 (?ъ슜?먭? ?쒕굹由ъ삤 ?좏깮 ???쒖옉)
    const mpFrame = document.getElementById("matching-process-frame");
    if (mpFrame && !mpFrame.classList.contains("hidden") && !_mpBypassProcess) {
        // ?꾨줈?몄뒪 移대뱶 ???먮젅?댁뀡 寃곌낵 ???쒕굹由ъ삤 ?좏깮 ??移댄뀒怨좊━ ?좏깮 ??AI ?앹꽦 ?쒖꽌濡?吏꾪뻾
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
    latestStructuredOutput = null;  // ???앹꽦 ?쒖옉 ???댁쟾 援ъ“??output 由ъ뀑

    // STEP 3 ?쒖꽦 ??AI ?앹꽦 ?쒖옉
    updateOutputFlowTracker(3, { 1: "done", 2: "done", 3: "active" });
    const isKoStream = currentLocale === "ko";
    updateSectionHelper("result-helper",
        isKoStream ? "?쨼 AI媛 留욎땄???쒕굹由ъ삤瑜??앹꽦?섍퀬 ?덉뒿?덈떎. ?좎떆留?湲곕떎??二쇱꽭?붴? : "?쨼 AI is building your custom scenario. Please wait??);

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

    // ?붾쾭洹? selectionSummary ?꾨떖 ?뺤씤
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
            ? "?앹꽦 ?쒕쾭???곌껐?섏? 紐삵뻽?듬땲?? ?뺤쟻 ?덉떆 ????ㅼ젣 ?ㅻ쪟瑜??쒖떆?⑸땲??"
            : "Could not reach the generation server. Showing the real error instead of a static example.");
        return;
    }

    if (!response.ok) {
        aiGenerating = false;
        const errData = await response.json().catch(() => ({}));
        if (response.status === 401) {
            renderGenerateError(context, currentLocale === "ko"
                ? "?몄뀡??留뚮즺?먯뒿?덈떎. ?ㅼ떆 濡쒓렇?명빐 二쇱꽭??"
                : "Session expired. Please log in again.");
        } else if (response.status === 429 || errData?.error?.code === "BUDGET_EXCEEDED") {
            const msg = errData?.error?.message || (currentLocale === "ko" ? "?붽컙 AI ?덉궛 ?쒕룄???꾨떖?덉뒿?덈떎." : "Monthly AI budget limit reached.");
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
                        if (!streamOutput._scrollRAF) {
                            streamOutput._scrollRAF = requestAnimationFrame(() => {
                                streamOutput.scrollTop = streamOutput.scrollHeight;
                                streamOutput._scrollRAF = null;
                            });
                        }
                    }
                } else if (event.type === "done") {
                    break;
                } else if (event.type === "error") {
                    aiGenerating = false;
                    console.warn("AI stream event error:", event.message || "Unknown error");
                    renderGenerateError(context, event.message || (currentLocale === "ko" ? "?ㅽ듃由щ컢 ?앹꽦 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎." : "Streaming generation failed."));
                    return;
                }
            }
        }

        aiGenerating = false;

        // STEP 3 ?꾨즺
        updateOutputFlowTracker(3, { 1: "done", 2: "done", 3: "done" });
        const isKoDone = currentLocale === "ko";
        updateSectionHelper("result-helper",
            isKoDone ? "???쒕굹由ъ삤 ?앹꽦???꾨즺?섏뿀?듬땲?? ?꾨옒?먯꽌 寃곌낵瑜??뺤씤?섏꽭??" : "??Scenario generation complete. Review the results below.");

        // JSON 紐⑤뱶 ?쒕룄: selectionSummary媛 ?덉쑝硫?JSON ?뚯떛 ?곗꽑
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
        // JSON ?뚯떛 ?ㅽ뙣 ?먮뒗 selectionSummary ?놁쓬 ??湲곗〈 留덊겕?ㅼ슫 ?뚮뜑留?
        renderAIResult(aiOutputText, context);
    };

    processStream().catch((err) => {
        aiGenerating = false;
        console.error("Stream processing error:", err);
        renderGenerateError(context, currentLocale === "ko"
            ? "?ㅽ듃由щ컢 泥섎━ 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎."
            : "A streaming error occurred.");
    });
}

function renderGenerateError(context, message, statusCode = "") {
    const title = currentLocale === "ko" ? "AI ?앹꽦???꾨즺?섏? ?딆븯?듬땲?? : "AI generation did not complete";
    const retry = currentLocale === "ko"
        ? "API ?묐떟???뺤긽?곸쑝濡??뚯븘?ㅻ㈃ 01~07 ?뺤떇?쇰줈 異쒕젰?⑸땲??"
        : "Once the API responds normally, the result will render in the 01??7 format.";
    const statusText = statusCode ? `${currentLocale === "ko" ? "?곹깭 肄붾뱶" : "Status"}: ${statusCode}` : "";

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
                <p class="error">${escapeHtml(message || (currentLocale === "ko" ? "?????녿뒗 ?ㅻ쪟" : "Unknown error"))}</p>
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
            market: "?쒖옣",
            target: "?寃?,
            value: "諛섏쁺??媛移?,
            devices: "諛섏쁺 湲곌린",
            purpose: "?곹솴 硫붾え"
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
                    <div class="ai-selection-chip-row">${deviceItems || `<span class="ai-selection-chip">${escapeHtml(currentLocale === "ko" ? "?좏깮 湲곌린 ?놁쓬" : "No devices selected")}</span>`}</div>
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
 * Explore ?좏깮 洹쇨굅 移대뱶 ??Selection Stage ?곗텧臾쇱쓣 ?쒓컖??
 * selectionSummary媛 ?놁쑝硫?鍮?臾몄옄??諛섑솚 (湲곗〈 buildSelectionSummaryCard濡?fallback)
 */
/**
 * Structured Output ?뚮뜑????JSON ?ㅽ궎留?湲곕컲 AI 異쒕젰??
 * 留덉??곗슜 / ?쇰컲 ?ъ슜?먯슜 ???꾪솚 ?ы븿
 */
function renderStructuredOutput(output, context) {
    latestStructuredOutput = output;  // ?꾩뿭 ?????export, refinement?먯꽌 ?ъ슜
    const isKo = (output.locale || currentLocale) === "ko";
    const selCard = output.selection
        ? renderExploreSelectionCard(output.selection)
        : buildSelectionSummaryCard(context);

    const tx = output.transformation || {};
    const mo = tx.marketerOutput || {};
    const co = tx.consumerOutput || {};

    // 留덉??곗슜 output HTML
    const marketerHtml = renderMarketerPanel(mo, isKo);
    // ?쇰컲 ?ъ슜?먯슜 output HTML
    const consumerHtml = renderConsumerPanel(co, isKo);
    // 媛移??섏씠?쇱씠??
    const valuesHtml = (output.valueHighlights || []).map(v =>
        `<div class="str-value-item"><span class="sel-value-badge sel-value-${(v.value || "").toLowerCase()}">${escapeHtml(v.value)}</span><span>${escapeHtml(v.description)}</span></div>`
    ).join("");
    // O-I-I ?몄궗?댄듃
    const oii = output.localizedInsight;
    const insightHtml = oii ? `
        <div class="str-insight-block">
            <h4>${isKo ? "吏???몄궗?댄듃" : "Local Insight"}</h4>
            <div class="str-oii"><strong>${isKo ? "愿李? : "Observation"}:</strong> ${escapeHtml(oii.observation || "")}</div>
            <div class="str-oii"><strong>${isKo ? "?몄궗?댄듃" : "Insight"}:</strong> ${escapeHtml(oii.insight || "")}</div>
            <div class="str-oii"><strong>${isKo ? "?⑥쓽" : "Implication"}:</strong> ${escapeHtml(oii.implication || "")}</div>
        </div>
    ` : "";
    // 異쒖쿂 異붿쟻
    const st = output.sourceTrace || tx.sourceTrace;
    const sourceHtml = st ? `<div class="str-source-trace">${isKo ? "異쒖쿂" : "Source"}: ${escapeHtml(typeof st === "string" ? st : `Explore ${st.exploreVersion} > ${st.articleTitle} > ${st.storyTitle}`)}</div>` : "";

    const completionBanner = buildCompletionBanner(context, isKo);
    const curationSummary = buildCurationSummaryInline(isKo);

    resultDiv.innerHTML = `
        <article class="scenario-output ai-result str-output">
            ${completionBanner}
            <div class="ai-result-meta">
                <span class="ai-result-badge">${context.provider === "claude" ? "Claude" : "GPT"} ${isKo ? "?앹꽦 寃곌낵" : "Generated"}</span>
                <span class="ai-result-context">${escapeHtml(context.role)}</span>
                <button type="button" class="tab-btn ai-copy-btn" id="str-copy-btn">${isKo ? "蹂듭궗" : "Copy"}</button>
            </div>
            ${curationSummary}
            ${selCard}
            <div class="str-tab-bar">
                <button class="str-tab active" data-tab="marketer">${isKo ? "留덉??곗슜" : "Marketer"}</button>
                <button class="str-tab" data-tab="consumer">${isKo ? "?쇰컲 ?ъ슜?먯슜" : "Consumer"}</button>
            </div>
            <div class="str-panel active" id="str-panel-marketer">${marketerHtml}</div>
            <div class="str-panel" id="str-panel-consumer">${consumerHtml}</div>
            ${valuesHtml ? `<div class="str-values-section"><h4>${isKo ? "媛뺤“ 媛移? : "Value Highlights"}</h4>${valuesHtml}</div>` : ""}
            ${insightHtml}
            ${sourceHtml}
            ${buildRefinementUI()}
        </article>
    `;

    // ???꾪솚
    resultDiv.querySelectorAll(".str-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            resultDiv.querySelectorAll(".str-tab").forEach(t => t.classList.remove("active"));
            resultDiv.querySelectorAll(".str-panel").forEach(p => p.classList.remove("active"));
            tab.classList.add("active");
            document.getElementById(`str-panel-${tab.dataset.tab}`)?.classList.add("active");
        });
    });

    // 蹂듭궗
    const copyBtn = resultDiv.querySelector("#str-copy-btn");
    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            const text = JSON.stringify(output, null, 2);
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.textContent = isKo ? "蹂듭궗??" : "Copied!";
                setTimeout(() => { copyBtn.textContent = isKo ? "蹂듭궗" : "Copy"; }, 2000);
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
            <div class="str-copy-num">${isKo ? `?듭뀡 ${i + 1}` : `Option ${i + 1}`}</div>
            <div class="str-copy-ko">${escapeHtml(c.ko || "")}</div>
            ${c.en ? `<div class="str-copy-en">${escapeHtml(c.en)}</div>` : ""}
            ${c.tone ? `<div class="str-copy-tone">${escapeHtml(c.tone)}</div>` : ""}
        </div>
    `).join("");

    const roleHtml = (rd.retail || rd.dotcom || rd.brand) ? `
        <div class="str-role-diff">
            <h4>${isKo ? "??븷蹂??ㅽ뻾 諛⑺뼢" : "Role-specific Direction"}</h4>
            ${rd.retail ? `<div><strong>Retail:</strong> ${escapeHtml(rd.retail)}</div>` : ""}
            ${rd.dotcom ? `<div><strong>Dotcom:</strong> ${escapeHtml(rd.dotcom)}</div>` : ""}
            ${rd.brand ? `<div><strong>Brand:</strong> ${escapeHtml(rd.brand)}</div>` : ""}
        </div>
    ` : "";

    const sections = [];
    if (why) sections.push({ title: isKo ? "?????쒕굹由ъ삤?멸?" : "Why This Scenario", html: `<p>${escapeHtml(why)}</p>` });
    if (tf.primary) sections.push({ title: isKo ? "?源??곹빀?? : "Target Fit", html: `<p><strong>${isKo ? "二??源? : "Primary"}:</strong> ${escapeHtml(tf.primary)}</p>${tf.secondary ? `<p><strong>${isKo ? "蹂댁“" : "Secondary"}:</strong> ${escapeHtml(tf.secondary)}</p>` : ""}${tf.estimatedReach ? `<p><strong>${isKo ? "異붿젙 ?꾨떖" : "Est. reach"}:</strong> ${escapeHtml(tf.estimatedReach)}</p>` : ""}` });
    if (channelsHtml) sections.push({ title: isKo ? "梨꾨꼸 ?꾨왂" : "Channel Strategy", html: `<div class="str-channels-grid">${channelsHtml}</div>` });
    if (copiesHtml) sections.push({ title: isKo ? "移댄뵾 ?듭뀡" : "Copy Options", html: copiesHtml });
    if (insight) sections.push({ title: isKo ? "吏???몄궗?댄듃" : "Local Insight", html: `<p>${escapeHtml(insight)}</p>` });
    if (rd.retail || rd.dotcom || rd.brand) sections.push({ title: isKo ? "??븷蹂??ㅽ뻾 諛⑺뼢" : "Role-specific Direction", html: `${rd.retail ? `<div><strong>Retail:</strong> ${escapeHtml(rd.retail)}</div>` : ""}${rd.dotcom ? `<div><strong>Dotcom:</strong> ${escapeHtml(rd.dotcom)}</div>` : ""}${rd.brand ? `<div><strong>Brand:</strong> ${escapeHtml(rd.brand)}</div>` : ""}` });

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
            <span class="str-device-req">${d.required !== false ? (isKo ? "?꾩닔" : "Required") : (isKo ? "?좏깮" : "Optional")}</span>
        </div>
    `).join("");

    const stepsHtml = steps.filter(Boolean).map(s => `<li>${escapeHtml(String(s))}</li>`).join("");
    const cautionsHtml = cautions.filter(Boolean).map(c => `<li>${escapeHtml(String(c))}</li>`).join("");
    const altsHtml = alts.filter(a => a && a.scenario).map(a => `<div class="str-alt-item"><strong>${escapeHtml(a.scenario || "")}</strong><span>${escapeHtml(a.reason || "")}</span></div>`).join("");

    const sections = [];
    if (what) sections.push({ title: isKo ? "臾댁뾿???섎굹?? : "What It Does", html: `<p>${escapeHtml(what)}</p>` });
    if (devicesHtml) sections.push({ title: isKo ? "?꾩슂??湲곌린" : "Required Devices", html: devicesHtml });
    if ((setup.apps || []).length) sections.push({ title: isKo ? "?꾩슂???? : "Required Apps", html: `<p>${(setup.apps || []).map(a => escapeHtml(a)).join(", ")}</p>` });
    if ((setup.conditions || []).length) sections.push({ title: isKo ? "?꾩슂 議곌굔" : "Prerequisites", html: `<ul>${(setup.conditions || []).map(c => `<li>${escapeHtml(c)}</li>`).join("")}</ul>` });
    if (stepsHtml) sections.push({ title: isKo ? "?ㅼ젙 諛⑸쾿" : "Setup Steps", html: `<ol>${stepsHtml}</ol>` });
    if (cautionsHtml) sections.push({ title: isKo ? "二쇱쓽?ы빆" : "Cautions", html: `<ul>${cautionsHtml}</ul>` });
    if (altsHtml) sections.push({ title: isKo ? "?泥?援ъ꽦" : "Alternatives", html: altsHtml });

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

    // 媛移?諛곗?
    const valuesHtml = (summary.primaryValues || [])
        .map(v => `<span class="sel-value-badge sel-value-${v.toLowerCase()}">${escapeHtml(v)}</span>`)
        .join("");

    // ?좏깮???쒕굹由ъ삤 ?섏씠?쇱씠??
    const scenarioHtml = `
        <div class="sel-scenario-highlight">
            <span class="sel-source-badge">${escapeHtml(`Explore ${primary.source}`)}</span>
            <span class="sel-scenario-title">${escapeHtml(primary.title)}</span>
            ${primary.articleTitle ? `<span class="sel-scenario-article">${escapeHtml(primary.articleTitle)}</span>` : ""}
            ${valuesHtml ? `<div class="sel-values-row">${valuesHtml}</div>` : ""}
        </div>
    `;

    // ?좏깮 ?댁쑀
    const reasonHtml = summary.selectionReason
        ? `<div class="sel-reason"><strong>${isKo ? "?좏깮 ?댁쑀" : "Why selected"}</strong> ${escapeHtml(summary.selectionReason)}</div>`
        : "";

    // 諛섏쁺???낅젰媛?
    const inputItems = [];
    const snap = summary.inputSnapshot || {};
    if (snap.market?.country) {
        const marketText = `${snap.market.country}${snap.market.city ? ` / ${snap.market.city}` : ""}`;
        inputItems.push({ label: isKo ? "????쒖옣" : "Target Market", value: marketText });
    }
    if (snap.persona && snap.persona.length > 0) {
        inputItems.push({ label: isKo ? "?듭떖 ?源? : "Core Target", value: snap.persona.map(p => p.label || p.id || "").filter(Boolean).join(", ") });
    }
    if (snap.devices && snap.devices.length > 0) {
        inputItems.push({ label: isKo ? "?쒖슜 湲곌린" : "Devices Used", value: snap.devices.map(d => d.label || d.name || "").filter(Boolean).join(", ") });
    }
    if (snap.purpose?.text) {
        inputItems.push({ label: isKo ? "?곹솴 쨌 紐⑹쟻" : "Context & Purpose", value: snap.purpose.text });
    }

    const inputHtml = inputItems.length > 0
        ? `<div class="sel-input-grid">${inputItems.map(item =>
            `<div class="sel-input-item"><span class="sel-input-label">${escapeHtml(item.label)}</span><span class="sel-input-value">${escapeHtml(item.value)}</span></div>`
        ).join("")}</div>`
        : "";

    // Magic Keywords (?ъ슜?먭? 吏곸젒 ?좏깮??愿?ъ궗)
    const magicKeys = summary.magicKeywords || [];
    const magicHtml = magicKeys.length > 0 ? `
        <div class="sel-magic-row">
            <strong class="sel-magic-label">${isKo ? "?좏깮??愿???ㅼ썙?? : "Your focus keywords"}</strong>
            <div class="sel-magic-tags">${magicKeys.map(key => {
                const cat = (typeof CITY_PROFILE_CATEGORIES !== "undefined" ? CITY_PROFILE_CATEGORIES : []).find(c => c.key === key);
                return cat
                    ? `<span class="sel-magic-tag" style="--magic-accent:${cat.color}">${cat.icon} ${escapeHtml(isKo ? cat.labelKo : cat.labelEn)}</span>`
                    : `<span class="sel-magic-tag">${escapeHtml(key)}</span>`;
            }).join("")}</div>
        </div>
    ` : "";

    // ?꾩텧 ?ㅼ썙??
    const derivedTags = (summary.derivedTags || []).slice(0, 5);
    const tagsHtml = derivedTags.length > 0
        ? `<div class="sel-tags-row">${derivedTags.map(t =>
            `<span class="sel-derived-tag" title="score: ${t.score}">${escapeHtml(t.tag)}</span>`
        ).join("")}</div>`
        : "";

    // ?뺤젙 vs 異붾줎
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

    // 留ㅼ묶???쒕굹由ъ삤 ??
    const countText = summary.totalCandidates > 1
        ? (isKo ? `??${summary.totalCandidates - 1}媛??쒕굹由ъ삤 留ㅼ묶` : `+${summary.totalCandidates - 1} more matched`)
        : "";

    return `
        <section class="sel-card">
            <div class="sel-card-header">
                <h3 class="sel-card-title">${isKo ? "?좏깮 洹쇨굅" : "Selection Basis"}</h3>
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

    // ?ㅻ쭏??濡쒕뵫: ?꾩떆 留λ씫 湲곕컲 濡ㅻ쭅 臾멸뎄 (5媛? 1.8珥?媛꾧꺽 = ~9珥??ъ씠??
    const cityDisplay = context.cityDisplay || context.city || "";
    const segment = context.segment || "";
    const cityFallback = isKo ? "?좏깮??吏?? : "your city";
    const segFallback = isKo ? "?源?怨좉컼" : "target customers";
    const loadingPhrases = isKo ? [
        `${cityDisplay || cityFallback}???앺솢 留λ씫??遺꾩꽍 以?..`,
        `${segment || segFallback}???됱씪쨌二쇰쭚 ?⑦꽩??留ㅼ묶 以?..`,
        `Explore ?쒕굹由ъ삤?먯꽌 理쒖쟻 議고빀???먯깋 以?..`,
        `留덉??곗슜쨌?ъ슜?먯슜 寃곌낵臾쇱쓣 援ъ꽦 以?..`,
        `理쒖쟻??CX ?쒕굹由ъ삤瑜?李얠븯?듬땲??`
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
                    <span class="pizza-label">${isKo ? "AI ?쒕굹由ъ삤 ?앹꽦 以?.." : "Generating AI scenario..."}</span>
                </div>
                <div class="smart-load-phrases">${phrasesHtml}</div>
            </div>
            ${selCardHtml}
            <pre class="ai-stream-output" aria-live="polite" aria-label="AI generating scenario"></pre>
        </article>
    `;
}

/** ?ㅽ듃由щ컢 以??쇱옄 ?꾨줈洹몃젅???쒕??덉씠???쒖옉 */
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
    // ?대? ?뱀뀡 踰덊샇 李몄“(10-11, section 10 ?? ?쒓굅 ???ъ슜?먯뿉寃??섎? ?녿뒗 媛쒕컻???⑹뼱
    return text
        .replace(/\(Which section.*?\)/gi, "")
        .replace(/\(.*?request.*?section.*?10.*?\)/gi, "")
        .replace(/\(.*?request.*?10[-??11.*?\)/gi, "")
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
                <span class="ai-result-badge">${context.provider === "claude" ? "Claude" : "GPT"} ${currentLocale === "ko" ? "?앹꽦 寃곌낵" : "Generated"}</span>
                <span class="ai-result-context">${escapeHtml(context.role)}</span>
                <button type="button" class="tab-btn ai-copy-btn" id="ai-copy-btn">${currentLocale === "ko" ? "蹂듭궗" : "Copy"}</button>
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
                copyBtn.textContent = currentLocale === "ko" ? "蹂듭궗??" : "Copied!";
                setTimeout(() => { copyBtn.textContent = currentLocale === "ko" ? "蹂듭궗" : "Copy"; }, 2000);
            }).catch(() => {});
        });
    }

    bindRefinementPrompt(markdown, context);
    bindSourceTags(resultDiv);
    scrollToResult();
}

function buildRefinementUI() {
    const title = currentLocale === "ko" ? "異붽? ?붿껌 / ?섏젙" : "Refine / Follow-up";
    const placeholder = currentLocale === "ko"
        ? "?? ?낆씪 ?쒖옣?쇰줈 諛붽퓭以?/ 湲곌린 紐⑸줉 ?낅뜲?댄듃 / ?ㅽ뻾 媛?대뱶 異붽? / ?덉쭏 ?먭? ?댁쨾"
        : "e.g. Switch to Germany / Update devices / Add execution guide / Run quality check";
    const btn = currentLocale === "ko" ? "?붿껌 ?꾩넚" : "Send";
    const initial = currentLocale === "ko"
        ? "?섏젙?섍굅?????먯꽭??蹂닿퀬 ?띠? 遺遺꾩씠 ?덉쑝硫??먯쑀濡?쾶 ?붿껌?섏꽭??"
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
        answer.textContent = currentLocale === "ko" ? "AI媛 泥섎━ 以묒엯?덈떎..." : "AI is processing...";

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
            answer.textContent = currentLocale === "ko" ? "?쒕쾭???곌껐?????놁뒿?덈떎." : "Cannot reach server.";
            return;
        }

        if (!response.ok) {
            aiGenerating = false;
            askBtn.disabled = false;
            const errData = await response.json().catch(() => ({}));
            answer.textContent = errData?.error?.message || (currentLocale === "ko" ? `?ㅻ쪟: ${response.status}` : `Error: ${response.status}`);
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
                        if (!answer._scrollRAF) {
                            answer._scrollRAF = requestAnimationFrame(() => {
                                answer.scrollTop = answer.scrollHeight;
                                answer._scrollRAF = null;
                            });
                        }
                    } else if (event.type === "done") {
                        break;
                    } else if (event.type === "error") {
                        answer.textContent = `Error: ${event.message}`;
                        break;
                    }
                }
            }
        } catch (err) {
            answer.textContent = currentLocale === "ko" ? "?ㅽ듃由щ컢 泥섎━ 以??ㅻ쪟." : "Streaming error.";
        }

        aiGenerating = false;
        askBtn.disabled = false;
        input.value = "";
        // 硫뷀? ?띿뒪???쒓굅
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
    // Tables ??detect | rows
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
    html = html.replace(/((?:^[??-] .+\n?)+)/gm, (block) => {
        const items = block.trim().split("\n").map((l) => `<li>${l.replace(/^[??-] /, "")}</li>`).join("");
        return `<ul>${items}</ul>`;
    });
    // Ordered lists
    html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (block) => {
        const items = block.trim().split("\n").map((l) => `<li>${l.replace(/^\d+\. /, "")}</li>`).join("");
        return `<ol>${items}</ol>`;
    });
    // Paragraphs ??blank lines ??paragraph breaks (don't affect block elements)
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
                `<a class="source-detail-url" href="${url}" target="_blank" rel="noopener noreferrer">?뵕 ${url.length > 60 ? url.slice(0, 60) + "?? : url}</a>` +
                `</span>`;
        })
        .replace(/\[Source:\s*([^\]]+?)\s*\]/g, (_, label) => {
            return `<span class="source-tag source-tag-inline">${label.trim()}</span>`;
        })
        .replace(/\[Assumption\]/gi, () => {
            return `<span class="source-tag source-tag-assumption">Assumption</span>`;
        });
}

/* ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧
   Output Flow Tracker ??3-step ?곹깭 愿由?
   ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧 */
function updateOutputFlowTracker(activeStep, states) {
    // states: { 1: "waiting"|"active"|"done", 2: ..., 3: ... }
    const tracker = document.getElementById("output-flow-tracker");
    if (!tracker) return;
    tracker.classList.remove("hidden");

    const isKo = currentLocale === "ko";
    const statusLabels = {
        waiting: isKo ? "?湲? : "Waiting",
        active:  isKo ? "吏꾪뻾 以묅? : "In progress??,
        done:    isKo ? "?꾨즺 ?? : "Done ??
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
        badge.innerHTML = isKo ? "???묒뾽 以묅? : "??Working??;
    } else if (state === "done") {
        badge.innerHTML = isKo ? "???꾨즺" : "??Done";
    }
    heading.insertAdjacentElement("afterend", badge);
}

function scrollToResult() {
    // 寃곌낵 ?곸뿭 諛붾줈 ?꾨줈留??ㅽ겕濡???留??꾨줈 ?щ씪媛吏 ?딅룄濡?
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
            <span class="banner-icon">??/span>
            <div class="banner-text">
                <span class="banner-title">${isKo ? "?쒕굹由ъ삤 ?앹꽦 ?꾨즺" : "Scenario Generation Complete"}</span>
                <span class="banner-sub">${provider} 쨌 ${escapeHtml(role)}</span>
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
                <span class="curation-summary-title">${isKo ? "異붿쿇 ?쒕굹由ъ삤 Top " + items.length : "Top " + items.length + " Recommended Scenarios"}</span>
                <button type="button" class="curation-toggle-btn" onclick="this.closest('.str-curation-summary').querySelector('.str-curation-list').classList.toggle('hidden');this.textContent=this.textContent==='${isKo ? "?묎린" : "Collapse"}'?'${isKo ? "?쇱튂湲? : "Expand"}':'${isKo ? "?묎린" : "Collapse"}';">${isKo ? "?묎린" : "Collapse"}</button>
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
            { scene: "?쇨렐 ??吏移?紐몄쑝濡??대몢???꾧?臾몄뿉 ?꾩갑???ъ슜??, text: "?ㅻ뒛????뿀??.. 吏묒씠 ??鍮?寃껋쿂???곕쟻?섍쿋吏?" },
            { scene: "臾몄씠 ?대━?먮쭏??嫄곗떎 議곕챸?????섍쾶 耳쒖?怨?TV???섏쁺 硫붿떆吏媛 ??, text: "?? 踰뚯뜥 ?곕쑜?댁죱?? SmartThings媛 誘몃━ 以鍮꾪뻽援щ굹." },
            { scene: "二쇰갑?쇰줈 媛???몃뜒?섏씠 ?덉뿴 以묒씠怨??명긽湲??꾨즺 ?뚮┝???곗쑝濡???, text: "?섎굹?섎굹 ?좉꼍 ???꾩슂 ?놁씠, ??由щ벉??留욎떠 吏묒씠 ?吏곸뿬??" },
            { scene: "?뚰뙆???됱븘 ?명븯寃??댁떇?섎ŉ ?먮꼫吏 ?덇컧 由ы룷?몃? ?뺤씤", text: "遺덊븘?뷀븳 ??퉬??以꾩씠怨? ???쒓컙? ???ъ쑀濡?쾶. ?닿쾶 吏꾩쭨 ?ㅻ쭏?명솃?댁짛." }
        ],
        Care: [
            { scene: "?щТ?ㅼ뿉???뚯쓽 以? 吏묒뿉 ?쇱옄 ?덉쓣 諛섎젮?숇Ъ??嫄깆젙?섎뒗 ?ъ슜??, text: "?ㅻ뒛 ?좊룆 ??뼱吏??.. 珥덉퐫?????덉쓣源?" },
            { scene: "SmartThings ?깆쓣 耳쒕땲 ??移대찓?쇰줈 ?됱삩?섍쾶 ?먮뒗 紐⑥뒿??蹂댁엫", text: "?ㅽ뻾?대떎! 議곕챸???곷떦?섍퀬, ?대옒???뚯븙?????섏삤怨??덈꽕." },
            { scene: "吏묒뿉 ?꾩갑??諛섍컩寃??щ젮?ㅻ뒗 諛섎젮?숇Ъ怨?留덉＜?섎뒗 ?쒓컙", text: "硫由??덉뼱??怨곸뿉 ?덈뒗 寃껋쿂?? ?뚮큵??怨듬갚???щ씪議뚯뼱??" },
            { scene: "媛議?紐⑤몢媛 ?덉떖?섍퀬 ?쇱긽??怨듭쑀?섎뒗 ?곕쑜??嫄곗떎 ?띻꼍", text: "嫄깆젙? ?쒓퀬 ?щ옉? ???ш쾶. SmartThings Pet Care." }
        ],
        Secure: [
            { scene: "?ы뻾吏?먯꽌 ?됲솕濡?쾶 ?닿?瑜?利먭린怨??덈뒗 媛議?, text: "吏?鍮꾩슫 吏 3?쇱㎏?몃뜲, 蹂꾩씪 ?녾쿋吏?" },
            { scene: "?섏긽???吏곸엫??媛먯??섏뿀?ㅻ뒗 ?뚮┝怨??④퍡 ?먮룞 ?뱁솕 ?곸긽???곗뿉 ??, text: "?? ?앸같 湲곗궗?섏씠援щ굹. ?ㅼ떆媛꾩쑝濡??뺤씤?섎땲 諛붾줈 ?덉떖?섎꽕." },
            { scene: "?먭꺽?쇰줈 ?꾩뼱???곹깭瑜??ъ젏寃?섍퀬 蹂댁븞 紐⑤뱶瑜?媛뺥솕??, text: "?대뵒???덈뱺 ?곕━ 吏묒? ?닿? 吏?⑤떎. 24?쒓컙 泥좏넻 蹂댁븞." },
            { scene: "?덉떖?섍퀬 ?ㅼ떆 ?닿?瑜?利먭린??媛議깅뱾???껋쓬?뚮━", text: "遺덉븞???뺤씤 ????뺤떎???덉떖. SmartThings Home Monitoring." }
        ],
        Play: [
            { scene: "?닿렐 ??寃뚯엫 or ?곸긽 媛먯긽???쒖옉?섎젮???ъ슜??, text: "?ㅻ뒛? 醫 ?쒕?濡?利먭꺼蹂쇨퉴? 踰꾪듉 ?섎굹硫??섏?." },
            { scene: "寃뚯엫 紐⑤뱶 ?ㅽ뻾怨??숈떆??議곕챸???대몢?뚯?怨? TV ?붾㈃怨?議곕챸???깊겕", text: "?, 紐곗엯媛먯씠 ?꾩쟾 ?ㅻⅤ?? ?ㅼ젙? ?뚯븘?????먯옏??" },
            { scene: "?먯뼱而⑥씠 苡뚯쟻???⑤룄濡??먮룞 ?좎??섍퀬, 釉붾씪?몃뱶媛 ?대젮??, text: "?딄린嫄곕굹 ?명똿 ?뚮Ц???먮쫫??源⑥??????놁씠, 洹몃깷 利먭린硫???" },
            { scene: "?ㅽ뵾而ㅼ? TV媛 ?곕룞???쒕씪?대뱶 ?ъ슫?쒕줈 由щ튃猷몄씠 ?덉떆?댄꽣濡?蹂??, text: "吏묒씠 ??痍⑦뼢?濡?諛섏쓳??以??? ??怨듦컙????醫뗭븘吏묐땲?? SmartThings." }
        ],
        Discover: [
            { scene: "?ㅻ쭏?명솃??泥섏쓬 ?쒖옉??蹂대젮???ъ슜?먭? SmartThings ?깆쓣 ?댁뼱遊?, text: "?대뵒?쒕????쒖옉?댁빞 ?섏?? ?덈Т 蹂듭옟??嫄??꾨땺源?" },
            { scene: "泥?湲곌린瑜??곌껐?섏옄 ?깆씠 留욎땄 猷⑦떞???쒖븞??以?, text: "?대젃寃??쎄쾶 ?섎뒗 嫄곗??? ?앷컖蹂대떎 ?⑥뵮 媛꾨떒?섎꽕." },
            { scene: "?섎굹???곌껐??湲곌린?ㅼ씠 ?쇱긽 ?⑦꽩??留욊쾶 ?먮룞?쇰줈 ?숈옉 ?쒖옉", text: "?뚯븘??留욎떠二쇰땲源? ?닿? ?좉꼍 ??寃??먯젏 以꾩뼱?ㅺ퀬 ?덉뼱." },
            { scene: "?쇱긽?????명빐議뚮떎??嫄?泥닿컧?섎ŉ ?ㅼ쓬 湲곌린 ?곌껐??怨좊??섎뒗 ?ъ슜??, text: "??踰??곌린 ?쒖옉?섎㈃ 硫덉텧 ?섍? ?놁뼱?? SmartThings濡??쒖옉?섏꽭??" }
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
            { scene: "Game mode launches: lights dim and sync with the screen", text: "Whoa, total immersion ??and it set itself up automatically." },
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
            kr: "?닿렐湲? 臾몄쓣 ?닿린???꾩뿉 吏묒씠 ?섎? 癒쇱? 諛섍꺼以띾땲??",
            en: "Coming home to a house that welcomes you before you even turn the key."
        };
    }
    if (mission === "Care") {
        return {
            kr: "硫由??덉뼱???먭뺨吏???곕쑜???뚮큵, SmartThings媛 ?곌껐?⑸땲??",
            en: "Feel the warmth of care from anywhere, connected by SmartThings."
        };
    }
    return {
        kr: "諛섎났?섎뒗 ?쇱긽???ъ쑀瑜??뷀븯????踰덉쓽 ?곗튂.",
        en: "One touch to reclaim your time in a busy routine."
    };
}

function buildOtpPlace(country, city, intent) {
    const isKo = currentLocale === "ko";
    const loc = city ? `${getCountryName(country.countryCode)} ${city}` : getCountryName(country.countryCode);
    const mission = intent.missionBucket;

    if (mission === "Save") {
        return isKo
            ? `?됱씪 ???/ ${loc} ?꾩떖??二쇨굅吏 / ?닿렐 ??鍮좊Ⅸ ?댁떇 ?꾪솚 ?쒖젏`
            : `Weekday Evening / Urban home in ${loc} / Post-commute reset moment`;
    }
    if (mission === "Care") {
        return isKo
            ? `?쇨낵 ?쒓컙 / ${loc} 二쇨굅吏 / 媛議깆씠???レ쓽 ?덈?媛 沅곴툑???쒖젏`
            : `Work Hours / Residential area in ${loc} / Remote care and wellbeing check`;
    }
    return isKo
        ? `?쇱긽 援ш컙 / ${loc} ?앺솢沅?/ ?몄쓽媛 ?꾩슂??紐⑤뱺 ?쒓컙`
        : `Daily Routine / Living area in ${loc} / Any moment where ease is needed`;
}

function buildCustomerJourneyTable(intent, services, deviceDecision) {
    const isKo = currentLocale === "ko";
    const mission = intent.missionBucket;
    const service = getServiceLabel(services[0]);
    const device = deviceDecision.final.modelName;

    const stepsKo = [
        { step: "Trigger", behavior: "?닿렐 ???꾧? ?꾩갑", action: "吏?ㅽ렂???꾩뼱???좏샇 媛먯?", value: "Ease", note: "?꾩튂 沅뚰븳 ?꾩슂" },
        { step: "Welcome", behavior: "嫄곗떎 吏꾩엯", action: "議곕챸 諛??먯뼱而?媛??, value: "Comfort", note: "?ъ쟾 ?ㅼ젙 ?⑤룄 湲곗?" },
        { step: "Context", behavior: "TV ??李⑹꽍", action: "TV 異붿쿇 移대뱶 ?몄텧", value: "Care", note: "媛쒖씤??硫붿떆吏 ?곸슜" },
        { step: "Execution", behavior: "異붿쿇 猷⑦떞 ?섎씫", action: "二쇰갑 媛???덉뿴 ?쒖옉", value: "Save", note: "湲곌린 ?곹깭 ?뺤씤" },
        { step: "Feedback", behavior: "?앹궗 以鍮??꾨즺", action: "?ㅻ쭏?명룿 ?뚮┝ 諛쒖넚", value: "Ease", note: "猷⑦떞 醫낅즺 ?덈궡" },
        { step: "Retention", behavior: "痍⑥묠 以鍮?, action: "?ㅻ뒛???덇컧/耳???붿빟", value: "Value", note: "?듭씪 猷⑦떞 異붿쿇" }
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
            isKo ? "Step 1: ?듭떖 湲곌린 ?곌껐 諛??쒕퉬???쒖꽦?? : "Step 1: Connect core device and activate service",
            isKo ? "Step 2: ?곹솴蹂??먮룞??猷⑦떞 ?ㅼ젙 (1?????" : "Step 2: Configure situational automation (one-tap save)",
            isKo ? "Step 3: 媛議?珥덈? 諛??꾩젽/?뚮┝ 怨듭쑀" : "Step 3: Invite family and share widgets/alerts"
        ],
        funnelMapping: [
            { stage: "Awareness", claim: isKo ? "?좉꼍 ?곗? ?딆븘??吏묒씠 ?섎? 諛곕젮?⑸땲?? : "Your home cares for you without you asking", metric: "Reach / CTR" },
            { stage: "Conversion", claim: isKo ? "?곕━ 吏?留욎땄??1遺??명똿" : "Tailored 1-minute setup for my home", metric: "Add-to-cart / Sales" },
            { stage: "Retention", claim: isKo ? "諛섎났?섎뒗 ?쇱긽??利먭굅??蹂?? : "Joyful change in your daily routine", metric: "WAU / Stickiness" }
        ]
    };
}

function buildReflectionCheck(intent, services, exploreGrounding) {
    const isKo = currentLocale === "ko";
    return [
        { label: isKo ? "怨좉컼 臾몄젣 紐낇솗?? : "Customer Pain Clarity", status: "PASS", note: isKo ? "諛섎났?섎뒗 ?쇱긽 遺덊렪???寃잜똿?? : "Targets recurring daily friction" },
        { label: isKo ? "媛移??곌껐 (Care/Save ??" : "Value Linkage", status: "PASS", note: `${intent.missionBucket} ${isKo ? "媛移섏뿉 吏묒쨷?? : "value focused"}` },
        { label: isKo ? "釉뚮옖??verbal identity" : "Brand Verbal Identity", status: "PASS", note: isKo ? "?덉젣???꾨━誘몄뾼 ???좎?" : "Restrained premium tone maintained" },
        { label: isKo ? "?먯씠?꾪떛 吏??諛섏쁺" : "Agentic Intelligence", status: "PASS", note: isKo ? "?ъ슜???섎룄 諛쒓껄 濡쒖쭅 ?ы븿" : "Intent discovery logic included" }
    ];
}

function buildFallbackPurpose(selectedSegment) {
    if (!selectedSegment) return "";
    return currentLocale === "ko"
        ? `${selectedSegment}???앺솢 留λ씫?먯꽌 諛섎났?섎뒗 遺덊렪??以꾩씠怨??띕떎`
        : `Reduce recurring friction in everyday moments for ${selectedSegment}.`;
}

function buildFallbackSegment(purpose) {
    if (!purpose) return "";
    return currentLocale === "ko"
        ? "?곹솴 湲곕컲 ?寃??ъ슜??
        : "Context-led target audience";
}

function buildExploreGrounding(country, city, selectedSegment, intent, deviceDecision, services) {
    const regional = getRegionalSignals(country.countryCode, city, intent);
    const serviceLabels = services.slice(0, 3).map((service) => getServiceLabel(service));
    const primaryValue = intent.missionBucket === "Save"
        ? (currentLocale === "ko" ? "?덇컧怨??듭젣媛? : "savings and control")
        : intent.missionBucket === "Care"
            ? (currentLocale === "ko" ? "?덉떖怨??뚮큵 ?ъ쑀" : "reassurance and care ease")
            : intent.missionBucket === "Secure"
                ? (currentLocale === "ko" ? "利됯컖?곸씤 ?덉떖怨?鍮좊Ⅸ ??? : "immediate reassurance and faster response")
                : intent.missionBucket === "Play"
                    ? (currentLocale === "ko" ? "?앺솢 由щ벉 ?뚮났怨?利먭굅???ㅽ뻾媛? : "rhythm recovery and enjoyable action")
                    : (currentLocale === "ko" ? "?앺솢 遺???꾪솕" : "lighter daily burden");
    const emotionalJob = intent.missionBucket === "Save"
        ? (currentLocale === "ko" ? "?붽툑???덇퀬 ?덈떎??遺덉븞 ?놁씠 吏묒쓣 鍮꾩슦??寃? : "leaving home without worrying about wasted cost")
        : intent.missionBucket === "Care"
            ? (currentLocale === "ko" ? "遺??以묒뿉???뚮큵 怨듬갚???녿떎怨??먮겮??寃? : "feeling there is no care gap while away")
            : intent.missionBucket === "Secure"
                ? (currentLocale === "ko" ? "怨꾩냽 ?뺤씤?섏? ?딆븘??吏묒씠 ?덉쟾?섎떎怨??먮겮??寃? : "feeling the home is safe without constant checking")
                : (currentLocale === "ko" ? "踰덇굅濡쒖슫 ?ㅼ젙 ?놁씠 諛붾줈 泥닿컧 媛移섎? ?삳뒗 寃? : "getting immediate value without friction");
    const functionalJob = currentLocale === "ko"
        ? `"${intent.purpose}" ?곹솴?먯꽌 諛섎났 ?뺤씤怨??섎룞 議곗옉??以꾩씠??寃?
        : `reducing repeated checking and manual control in moments like "${intent.purpose}"`;
    const coreMessage = currentLocale === "ko"
        ? `${selectedSegment}?먭쾶 ?꾩슂??寃껋? ??留롮? 湲곕뒫???꾨땲?? ${intent.purpose} 媛숈? ?쒓컙????媛蹂띻쾶 ?섍린寃??댁＜??${primaryValue}?낅땲??`
        : `What the ${selectedSegment} segment needs is not more features, but ${primaryValue} that makes moments like "${intent.purpose}" feel lighter.`;
    const proofLine = currentLocale === "ko"
        ? `${serviceLabels.join(", ")}媛 ${regional.implication}???ㅼ젣 ?λ㈃?쇰줈 ?곌껐?⑸땲??`
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
            ? (currentLocale === "ko" ? "?덇컧?섎뒗 湲덉븸蹂대떎 癒쇱? 以꾩뼱?쒕뒗 ?좉꼍 ?" : "less mental overhead before lower bills")
            : intent.missionBucket === "Care"
                ? (currentLocale === "ko" ? "怨꾩냽 ?뺤씤?섏? ?딆븘???섎뒗 ?덉떖" : "reassurance without constant checking")
                : intent.missionBucket === "Secure"
                    ? (currentLocale === "ko" ? "?꾩슂???쒓컙?먮쭔 利됱떆 媛쒖엯?섎뒗 蹂댁븞媛? : "security that surfaces only when needed")
                    : (currentLocale === "ko" ? "?앺솢????留ㅻ걚?쎄쾶 ?댁뼱二쇰뒗 ?곌껐媛? : "connected flows that make life smoother")
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
    "care-scenarios": ["Care for pet", "諛섎젮?숇Ъ 耳??, "Care for seniors", "Care for kids", "?쒕땲??耳??],
    "save-energy":    ["Save energy", "?먮꼫吏 ?덉빟"],
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
    if (text.includes("諛섎젮") || text.includes("??)) tags.add("諛섎젮?숇Ъ 耳??);
    if (text.includes("遺紐?) || text.includes("?쒕땲??) || text.includes("媛議?)) tags.add("?쒕땲??耳??);
    if (text.includes("?먮꼫吏") || text.includes("?덉빟") || text.includes("鍮꾩슜")) tags.add("?먮꼫吏 ?덉빟");
    if (selectedDevices.includes("TV")) tags.add("AOD (Always on Display)");

    // Device group-based tags: maps Q4 selection ??Explore scenario tags
    selectedDeviceGroups.forEach((groupId) => {
        (DEVICE_GROUP_EXPLORE_TAGS[groupId] || []).forEach((tag) => tags.add(tag));
    });

    if (tags.size === 0) tags.add("?낅Ц (Entry)");

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
            if ((service.requiredCategories || []).some((category) => category === "?명긽湲?嫄댁“湲? && intent.selectedDevices.some((device) => ["?명긽湲?, "嫄댁“湲?, "?명긽湲?嫄댁“湲?].includes(device)))) score += 4;
            if (intent.missionBucket === "Save" && /energy|?덉빟|?붽툑/.test(haystack)) score += 4;
            if (intent.missionBucket === "Care" && /care|諛섎젮|媛議?health|find/.test(haystack)) score += 4;
            if (intent.missionBucket === "Secure" && /monitoring|secure|find|蹂댁븞|移대찓??.test(haystack)) score += 4;
            if (intent.missionBucket === "Play" && /fitness|cooking|play|?대룞|?붾━/.test(haystack)) score += 4;
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
    const normalizedSelected = selectedDevice === "?명긽湲?嫄댁“湲? ? ["?명긽湲?, "嫄댁“湲?] : [selectedDevice];
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
            `${locationLabel}???섎（媛 諛붾튌吏???쒓컙???${selectedSegment} ?ъ슜?먮뒗 "${intent.purpose}"瑜????섏썡?섍쾶 ?닿껐?섍퀬 ?띠뼱 ?⑸땲??`,
            `${selectedSegment} ?ъ슜?먯뿉寃뚮뒗 蹂듭옟???쒖뼱蹂대떎 諛붾줈 泥닿컧?섎뒗 蹂?붽? ??以묒슂?⑸땲??`,
            `${deviceList} 議고빀? 泥?吏꾩엯 ?쒓컙遺???앺솢 留λ씫怨?留욌떯? 媛移??쒖븞??留뚮뱾湲?醫뗭뒿?덈떎.`,
            `??泥??붾㈃? ?ъ슜?먯쓽 ?꾩옱 ?곹솴????臾몄옣?쇰줈 ?붿빟?섍퀬, 媛??媛源뚯슫 異붿쿇 猷⑦떞??移대뱶濡??쒖떆?⑸땲??`,
            `泥?移대뱶?먮뒗 ${primaryLabel}媛 諛곗튂?섍퀬, ${primary.keyFeatures[0]}媛 ??吏湲??좎슜?쒖? 諛붾줈 ?ㅻ챸?⑸땲??`,
            `?ъ슜?먮뒗 湲??ㅼ젙 ?놁씠 異붿쿇 移대뱶瑜??댁뼱 ?먯떊?먭쾶 留욌뒗 ?쒖옉 ?듭뀡留?怨좊쫭?덈떎.`,
            `${deviceDecision.final.modelName}?????쒓컙??以묒떖 湲곌린濡?諛곗튂?섏뼱 ?ъ슜?먯쓽 ?됰룞 遺?댁쓣 以꾩엯?덈떎.`,
            `?깆? ${intent.lifestyleTags.join(", ")}? ?곌껐?섎뒗 留λ씫??吏㏃? 移댄뵾? ?쒓컖 ?좏샇濡??꾨떖?⑸땲??`,
            `異붿쿇 ?붾㈃?먯꽌??"吏湲?諛붾줈 ?ㅽ뻾"怨?"??猷⑦떞?쇰줈 ??? ??媛吏 ?좏깮吏留??④꺼 ?섏궗寃곗젙???⑥닚?뷀빀?덈떎.`,
            `?ㅽ뻾???쒖옉?섎㈃ ${primary.keyFeatures[1] || primary.keyFeatures[0]}媛 ?댁뼱吏硫?泥??깃났 寃쏀뿕??遺꾨챸?섍쾶 留뚮벊?덈떎.`,
            `?ъ슜?먮뒗 ?ㅼ젙??怨듬????먮굦???꾨땲?? ???곹솴???댄빐諛쏆븯?ㅻ뒗 ?몄긽??諛쏄쾶 ?⑸땲??`,
            `?곹솴????踰?留욎븘?⑥뼱吏硫?${secondaryLabel}媛 ?ㅼ쓬 ?④퀎 媛移섎줈 ?먯뿰?ㅻ읇寃??곌껐?⑸땲??`,
            `???곌껐? ?⑤컻??泥댄뿕???섏뼱 諛섎났 ?ъ슜???댁쑀瑜?留뚮뱾怨? ??泥대쪟 ?댁쑀瑜?遺꾨챸?섍쾶 ?⑸땲??`,
            `"${intent.purpose}" 怨쇱젙?먯꽌 ?앷린??諛섎났 ?뺤씤怨?議곗옉 遺?댁? ?묒? ?먮룞?붿쓽 異뺤쟻?쇰줈 ?꾪솕?⑸땲??`,
            `以묒슂???먯? 湲곗닠??留롮씠 蹂댁뿬二쇰뒗 寃껋씠 ?꾨땲?? ?ъ슜?먭? ???좉꼍 ?⑤룄 ?쒕떎???덉떖??二쇰뒗 寃껋엯?덈떎.`,
            `?곕씪??硫붿떆吏??湲곕뒫紐낅낫???앺솢 蹂?? ?쒓컙 ?덇컧, 媛먯젙???덈룄媛먯쓣 癒쇱? 留먰빐???⑸땲??`,
            `諛섎났 ?ъ슜???볦씠硫??깆? ?ъ슜?먯쓽 ?⑦꽩????吏㏃? ?④퀎濡??ъ젙由ы빐 ?ъ젣?덊븷 ???덉뒿?덈떎.`,
            `?대븣 ?ъ슜?먮뒗 留ㅻ쾲 ?덈줈 諛곗슦吏 ?딆븘???섎뒗 寃쏀뿕???듯빐 釉뚮옖?쒖쓽 諛곕젮瑜?泥닿컧?⑸땲??`,
            `寃곌낵?곸쑝濡????쒕굹由ъ삤??泥??ㅽ뻾??留덉같??以꾩씠怨? 諛섎났 ?ъ슜???댁쑀瑜?留뚮뱾硫? ?ㅻⅨ 湲곌린濡쒖쓽 ?뺤옣 ?ъ????④퉩?덈떎.`,
            `理쒖쥌?곸쑝濡?${selectedSegment} ?ъ슜?먮뒗 ???곸? 議곗옉?쇰줈 ?????몄븞?? ?덉빟, ?덉떖, 利먭굅???寃쏀뿕?섍쾶 ?⑸땲??`
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
                observation: `?꾩떆??二쇨굅? 鍮좊Ⅸ ?쇱긽 由щ벉??怨듭〈?섎뒗 ?쒖옣${cityNote}`,
                insight: "吏㏃? ?쒓컙 ?덉뿉 吏묒븞 ?곹깭瑜??뺣━?섍퀬 ?ㅼ쓬 ?됰룞?쇰줈 ?섏뼱媛?ㅻ뒗 ?덉쫰媛 ??,
                implication: "泥??ㅽ뻾 ?덈뱾????텣 ?먮룞??異붿쿇??諛섎났 ?ъ슜?쇰줈 ?댁뼱吏?媛?μ꽦???믪쓬"
            },
            US: {
                observation: `?볦? 二쇨굅 怨듦컙怨?媛쒕퀎?붾맂 猷⑦떞??媛뺥븳 ?쒖옣${cityNote}`,
                insight: "湲곌린 ?⑦뭹蹂대떎 ?앺솢 ?λ㈃ 以묒떖???곌껐 ?쒖븞??泥닿컧 媛移섎? ??鍮⑤━ ?꾨떖??,
                implication: "?깆? 蹂듭닔 湲곌린 ?곌껐???몄씡????踰덉쓽 ?ъ슜 ?λ㈃?쇰줈 ?뺤텞??蹂댁뿬以섏빞 ??
            },
            GB: {
                observation: `怨듦컙 ?⑥쑉?깃낵 ?ㅼ슜??援щℓ ?먮떒??以묒슂???쒖옣${cityNote}`,
                insight: "?ㅼ젙 蹂듭옟?꾨? ??텛怨??먮꼫吏쨌?쒓컙 ?덇컧 硫붿떆吏瑜?紐낇솗???좎닔濡??ㅻ뱷?μ씠 ?믪븘吏?,
                implication: "猷⑦떞 ??κ낵 ?ъ궗??媛移섍? 遺꾨챸???먮쫫???좊━??
            },
            DE: {
                observation: `?⑥쑉, ?덉젙?? 吏?띻??μ꽦?????愿?ъ씠 ?믪? ?쒖옣${cityNote}`,
                insight: "?좊ː 媛?ν븳 ?먮룞?붿? ?쇱긽 ?⑥쑉 媛쒖꽑???④퍡 ?쒖떆?????섏슜?깆씠 ?믪븘吏?,
                implication: "媛移??쒖븞? ?몄쓽肉??꾨땲???듭젣媛먭낵 ?덉륫 媛?μ꽦???④퍡 留먰빐????
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
                insight: "Nutzer reagieren stark auf Abl채ufe, die den Zuhause-Zustand schnell ordnen und direkt zur n채chsten Handlung f체hren",
                implication: "Automationsvorschl채ge mit niedriger Einstiegsh체rde werden eher zu wiederholter Nutzung"
            },
            US: {
                observation: `ein Markt, der von gr철횩eren Wohnfl채chen und stark individualisierten Routinen gepr채gt ist${cityNote}`,
                insight: "vernetzte Alltagsszenen vermitteln den Wert schneller als isolierte Ger채tefunktionen",
                implication: "die App sollte den Mehrwert mehrerer Ger채te in eine klar verst채ndliche Nutzungsszene verdichten"
            },
            GB: {
                observation: `ein Markt, in dem Raumeffizienz und pragmatische Kaufentscheidungen wichtig sind${cityNote}`,
                insight: "die 횥berzeugungskraft steigt, wenn die Einrichtung einfacher wird und Energie- oder Zeitersparnis klar sichtbar ist",
                implication: "Abl채ufe mit klar erkennbarem Wert f체r gespeicherte und wiederverwendbare Routinen sind wirksamer"
            },
            DE: {
                observation: `ein Markt mit hohem Interesse an Effizienz, Stabilit채t und Nachhaltigkeit${cityNote}`,
                insight: "die Akzeptanz steigt, wenn vertrauensw체rdige Automatisierung mit sp체rbarer Alltagseffizienz verbunden wird",
                implication: "das Nutzenversprechen sollte nicht nur Bequemlichkeit, sondern auch Kontrolle und Vorhersehbarkeit betonen"
            }
        }
    };
    const fallbackByLocale = {
        ko: {
            observation: `${getCountryName(countryCode)} ?쒖옣???쇱긽 由щ벉怨??앺솢 ?섍꼍??怨좊젮???쇰컲???ъ슜 留λ씫${cityNote}`,
            insight: `${intent.missionBucket} 媛移섍? 紐낇솗?좎닔濡??ъ슜?먮뒗 湲곕뒫蹂대떎 寃곌낵 以묒떖?쇰줈 諛섏쓳??,
            implication: "?깆? 蹂듭옟???ㅻ챸蹂대떎 ??踰덉뿉 ?댄빐?섎뒗 異붿쿇 ?λ㈃??癒쇱? ?쒖떆?댁빞 ??
        },
        en: {
            observation: `a general usage context shaped by the daily rhythm and living environment of ${getCountryName(countryCode)}${cityNote}`,
            insight: `users respond more to outcome-led framing when the ${intent.missionBucket} value is explicit`,
            implication: "the app should surface an immediately understandable recommended scene before detailed explanation"
        },
        de: {
            observation: `ein allgemeiner Nutzungskontext, der vom Alltagsrhythmus und Wohnumfeld in ${getCountryName(countryCode)} gepr채gt ist${cityNote}`,
            insight: `Nutzer reagieren st채rker auf ergebnisorientierte Botschaften, wenn der ${intent.missionBucket}-Wert klar ist`,
            implication: "die App sollte zuerst eine sofort verst채ndliche Empfehlungsszene zeigen und erst danach Details erkl채ren"
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
            ? `${marketName} ?ъ슜?먭? "${intent.purpose}" ?곹솴???ㅼ뼱?ㅻ㈃ 異붿쿇???쒖옉?⑸땲??`
            : `Start the recommendation when a user in ${marketName} enters the "${intent.purpose}" moment.`,
        entryPoint: currentLocale === "ko"
            ? `${deviceDecision.final.modelName}? ?????붾㈃??泥?吏꾩엯 ?ъ씤?몃줈 ?ъ슜?⑸땲??`
            : `Use ${deviceDecision.final.modelName} and the app home as the primary entry point.`,
        triggerSignals: [
            currentLocale === "ko"
                ? `${signalDevices.join(", ")} ?좏깮 ?щ?`
                : `Selected devices: ${signalDevices.join(", ")}`,
            currentLocale === "ko"
                ? `${intent.missionBucket} 愿??紐⑹쟻??媛먯?`
                : `${intent.missionBucket} intent detected in the user request`,
            currentLocale === "ko"
                ? `${primaryLabel} ?쒖슜 媛???щ?`
                : `${primaryLabel} availability in the selected journey`
        ],
        recommendationLogic: [
            currentLocale === "ko"
                ? `${intent.lifestyleTags.join(", ")}? 留욌뒗 ?λ㈃??癒쇱? ?쒖븞?⑸땲??`
                : `Prioritize scenes linked to ${intent.lifestyleTags.join(", ")}.`,
            currentLocale === "ko"
                ? `泥??ㅽ뻾 ?덈뱾????텛湲??꾪빐 ?ㅼ젙 ?④퀎瑜?理쒖냼?뷀빀?덈떎.`
                : "Minimize setup friction for the first run.",
            currentLocale === "ko"
                ? `??踰덉쓽 ?깃났 寃쏀뿕 ?ㅼ뿉 ???媛?ν븳 諛섎났 猷⑦떞?쇰줈 ?곌껐?⑸땲??`
                : "Turn the first successful moment into a reusable routine."
        ],
        actions: [
            currentLocale === "ko"
                ? `${primaryLabel} 湲곕컲 異붿쿇 移대뱶 ?몄텧`
                : `Show a recommendation card powered by ${primaryLabel}`,
            currentLocale === "ko"
                ? `${deviceDecision.final.modelName} 以묒떖 ?ㅽ뻾 ?먮쫫 ?덈궡`
                : `Guide the execution flow around ${deviceDecision.final.modelName}`,
            currentLocale === "ko"
                ? `?ъ슜???뺤씤 ???먮룞??????쒖븞`
                : "Prompt the user to save the flow after confirmation",
            currentLocale === "ko"
                ? `諛섎났 ?ъ슜 ??媛쒖씤??異붿쿇 媛뺥솕`
                : "Strengthen personalization after repeated use"
        ],
        expectedFeedback: currentLocale === "ko"
            ? "泥섏쓬遺??蹂듭옟?섏? ?딄퀬, ???곹솴??留욌뒗 異붿쿇??諛쏅뒗?ㅻ뒗 ?먮굦"
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
    if (category === "?명긽湲? || category === "嫄댁“湲?) return ["?명긽湲?, "嫄댁“湲?, "?명긽湲?嫄댁“湲?];
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
        .replace(/[^a-z0-9媛-??/g, "");
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

    // ?쇱꽦?룹뺨 URL & Explore URL 寃곗젙
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
            impact: currentLocale === "ko" ? "援?? ?⑥쐞 硫붿떆吏 諛⑺뼢怨??λ㈃ ?곗꽑?쒖쐞瑜?怨좎젙?⑸땲??" : "Sets the country-level message direction and scene priority."
        } : null,
        {
            no: 2,
            fact: currentLocale === "ko"
                ? `${selectedMarket?.siteCode || country.countryCode} 留덉폆? ${marketInfo?.fullUrl || country.samsungShopUrl || "?쇱꽦?룹뺨"} 湲곗??쇰줈 ?곌껐?⑸땲??`
                : `The selected market routes to ${marketInfo?.fullUrl || country.samsungShopUrl || "the Samsung store"} via ${selectedMarket?.siteCode || country.countryCode}.`,
            source: "samsung.com",
            source_url: samsungDotcomUrl,
            confidence: "High",
            impact: currentLocale === "ko" ? "?룹뺨 臾멸뎄? CTA???몄뼱/留덉폆 湲곗????뺤젙?⑸땲??" : "Locks the market and language basis for dotcom copy and CTA."
        },
        {
            no: 3,
            fact: currentLocale === "ko"
                ? `${selectedMarket?.siteCode || country.countryCode} ?쇱꽦?룹뺨 異붿쟻 移댄뀒怨좊━ ${trackedCategoryCount}媛쒖뿉??SKU ${trackedSkuCount}媛쒕? ?뺤씤?덉뒿?덈떎.`
                : `Confirmed ${trackedSkuCount} SKUs across ${trackedCategoryCount} tracked Samsung dotcom categories for ${selectedMarket?.siteCode || country.countryCode}.`,
            source: "sku_availability_matrix.json",
            source_url: categorySourceUrl || samsungDotcomUrl,
            confidence: marketSku ? "High" : "Medium",
            impact: currentLocale === "ko" ? "03??紐⑤뜽/援щℓ 以鍮꾨룄 ?먮떒???ㅼ젣 ?쇱꽦?룹뺨 SKU 湲곗??쇰줈 怨좎젙?⑸땲??" : "Anchors model and purchase-readiness judgement to official Samsung dotcom SKUs."
        },
        anchorSkuEvidence.categoryEvidence ? {
            no: 4,
            fact: currentLocale === "ko"
                ? `${getCategoryName(deviceDecision.final.category)} 移댄뀒怨좊━??${anchorSkuEvidence.categoryEvidence.productCount || 0}媛?SKU媛 異붿쟻?섎ŉ, 援щℓ 媛???쒖떆??${anchorSkuEvidence.categoryEvidence.inStockCount || 0}媛쒖엯?덈떎.`
                : `${getCategoryName(deviceDecision.final.category)} is backed by ${anchorSkuEvidence.categoryEvidence.productCount || 0} tracked SKUs, with ${anchorSkuEvidence.categoryEvidence.inStockCount || 0} showing purchasable availability.`,
            source: "samsung.com",
            source_url: categorySourceUrl || samsungDotcomUrl,
            confidence: "High",
            impact: currentLocale === "ko" ? "?듭빱 湲곌린? 援щℓ 媛?μ꽦 ?먮떒???쒖옣蹂?怨듭떇 移댄뀒怨좊━ ?섏씠吏??留욎땅?덈떎." : "Aligns the anchor-device and purchase-readiness judgement to market-specific official category pages."
        } : null,
        anchorService ? {
            no: 5,
            fact: currentLocale === "ko"
                ? `${anchorService.appCardLabel || anchorService.serviceName} ?쒕퉬???꾨낫??${anchorService.keyFeatures.slice(0, 2).join(", ")} ?좏샇瑜?以묒떖?쇰줈 ?곌껐?⑸땲??`
                : `${anchorService.appCardLabel || anchorService.serviceName} is grounded on signals such as ${anchorService.keyFeatures.slice(0, 2).join(", ")}.`,
            source: "Explore Contents",
            source_url: exploreV1Url,
            confidence: "High",
            impact: currentLocale === "ko" ? "?쒕퉬???ㅽ깮怨??먮룞???먮쫫??湲곗??먯쓣 ?쒓났?⑸땲??" : "Provides the baseline for service-stack and automation logic."
        } : null,
        cityFact ? {
            no: 6,
            fact: `${citySignal.cityDisplay}: ${cityFact}`,
            source: "city_signals.json",
            source_url: samsungDotcomUrl,
            confidence: "Medium",
            impact: currentLocale === "ko" ? "?꾩떆 留λ씫??留욌뒗 泥??λ㈃怨?移댄뵾 ?ㅼ쓣 議곗젙?⑸땲??" : "Tunes the first scene and copy tone to the city context."
        } : null
    ].filter(Boolean);

    const assumptions = [
        anchorSkuEvidence.matchType === "partial" || anchorSkuEvidence.matchType === "category_fallback" || deviceDecision.fallbackApplied
            ? (currentLocale === "ko"
                ? `異붾줎: ${deviceDecision.final.modelName}? ?뺥솗???쇱튂?섎뒗 ?쇱꽦?룹뺨 SKU瑜?李얠? 紐삵빐 ${anchorSkuEvidence.product?.modelName || "?숈씪 移댄뀒怨좊━ ???SKU"} 湲곗??쇰줈 ?곌껐?덉뒿?덈떎.`
                : `Inference: no exact Samsung dotcom SKU matched ${deviceDecision.final.modelName}, so the closest in-category SKU was used.`)
            : (currentLocale === "ko"
                ? `異붾줎: ${(deviceDecision.selectedDevices || [deviceDecision.final.category]).map((device) => getCategoryName(device)).join(", ")} 議고빀???섎굹???앺솢 猷⑦떞?쇰줈 ?④퍡 ?댁쁺?쒕떎怨?媛?뺥뻽?듬땲??`
                : "Inference: the selected device mix is assumed to operate as one connected life routine."),
        serviceSupport
            ? (currentLocale === "ko"
                ? `異붾줎: ${anchorService.appCardLabel || anchorService.serviceName}???쒖옣 吏?먮룄???꾩닔 移댄뀒怨좊━ 異⑹”瑜?湲곗? ${serviceSupport.inferredSupport.status}濡?怨꾩궛?덉뒿?덈떎.`
                : `Inference: ${anchorService.appCardLabel || anchorService.serviceName} support was estimated from required-category coverage and rated ${serviceSupport.inferredSupport.status}.`)
            : (currentLocale === "ko"
                ? "異붾줎: ?쒕퉬??留ㅽ듃由?뒪??吏곸젒 ?곌껐?섏? ?딆? 寃쎌슦 ?쒕퉬??吏?먮룄??誘멸?利앹쑝濡??좎??⑸땲??"
                : "Inference: when the service matrix has no direct link, service support remains unverified."),
        currentLocale === "ko"
            ? `異붾줎: ${selectedSegment} ?寃잛? "${exploreGrounding.functionalJob}" 臾몄젣瑜?諛섎났?곸쑝濡??먮??ㅺ퀬 媛?뺥뻽?듬땲??`
            : `Inference: the ${selectedSegment} segment is assumed to repeatedly feel the pain of "${exploreGrounding.functionalJob}".`,
        !citySignal
            ? (currentLocale === "ko"
                ? `異붾줎: ${city || getCountryName(country.countryCode)}??????뺣? ?꾩떆 ?곗씠?곌? ?놁뼱 援?? 湲곕낯 ?⑦꽩?쇰줈 蹂닿컯?덉뒿?덈떎.`
                : `Inference: no precise city-level dataset was found for ${city || getCountryName(country.countryCode)}, so country fallback logic was applied.`)
            : (currentLocale === "ko"
                ? "異붾줎: ?꾩떆 ?곗씠?곕뒗 ?앺솢 ?섍꼍 ?⑥꽌濡??ъ슜?덇퀬 ?ㅼ젣 罹좏럹??吏묓뻾 ??由ы뀒???ш퀬 ?뺤씤???꾩슂?⑸땲??"
                : "Inference: city data was used as an environmental cue and still needs retail and stock confirmation before launch.")
    ];

    const readiness = [
        {
            label: currentLocale === "ko" ? "?듭빱 湲곌린" : "Anchor device",
            status: anchorSkuEvidence.matchType === "exact" ? "Supported" : anchorSkuEvidence.product ? "Limited" : "Unverified",
            note: anchorSkuEvidence.matchType === "exact"
                ? (currentLocale === "ko"
                    ? `${anchorSkuEvidence.product.modelName} SKU媛 ?쇱꽦?룹뺨??吏곸젒 ?뺤씤?⑸땲??`
                    : `${anchorSkuEvidence.product.modelName} is directly confirmed on Samsung dotcom.`)
                : anchorSkuEvidence.product
                    ? (currentLocale === "ko"
                        ? `${anchorSkuEvidence.product.modelName}濡?移댄뀒怨좊━ ?泥??곌껐?덉뒿?덈떎.`
                        : `Mapped to ${anchorSkuEvidence.product.modelName} as the closest category-level fallback.`)
                    : (currentLocale === "ko" ? "怨듭떇 ?쇱꽦?룹뺨 SKU 利앷굅媛 ?꾩쭅 ?놁뒿?덈떎." : "No official Samsung dotcom SKU evidence was found yet.")
        },
        {
            label: currentLocale === "ko" ? "?쒕퉬???ㅽ깮" : "Service stack",
            status: serviceSupport?.inferredSupport?.status === "supported"
                ? "Supported"
                : serviceSupport?.inferredSupport?.status === "limited"
                    ? "Limited"
                    : "Unverified",
            note: serviceSupport
                ? (currentLocale === "ko"
                    ? `?꾩닔 移댄뀒怨좊━ ${serviceSupport.confirmedEvidence.coveredCategories.length}/${serviceSupport.requiredCategories.length}媛쒓? ?쇱꽦?룹뺨 SKU濡??뺤씤?⑸땲??`
                    : `${serviceSupport.confirmedEvidence.coveredCategories.length}/${serviceSupport.requiredCategories.length} required categories have Samsung dotcom SKU evidence.`)
                : (currentLocale === "ko"
                    ? "?쒖옣蹂??쒕퉬??利앷굅媛 ?놁뼱 誘멸?利앹쑝濡??좎??⑸땲??"
                    : "No market-level service evidence was found, so this remains unverified.")
        },
        {
            label: currentLocale === "ko" ? "援щℓ 媛???곹깭" : "Purchase status",
            status: anchorSkuEvidence.product?.availability?.status === "supported"
                ? "Supported"
                : anchorSkuEvidence.product
                    ? "Limited"
                    : "Unknown",
            note: anchorSkuEvidence.product
                ? `${anchorSkuEvidence.product.availability.status} / ${anchorSkuEvidence.product.availability.confidence}`
                : (currentLocale === "ko" ? "?ㅼ떆媛?援щℓ ?곹깭瑜??곌껐??SKU瑜?李얠? 紐삵뻽?듬땲??" : "No SKU was mapped for live purchase-state sync.")
        },
        {
            label: currentLocale === "ko" ? "?뱀쭠 異붿텧" : "Feature extraction",
            status: anchorSkuEvidence.product?.features?.confirmed?.length ? "Supported" : "Limited",
            note: anchorSkuEvidence.product?.features?.confirmed?.length
                ? (currentLocale === "ko"
                    ? `?쇱꽦?룹뺨 臾멸뎄?먯꽌 ?듭떖 ?뱀쭠 ${anchorSkuEvidence.product.features.confirmed.length}媛쒕? 援ъ“?뷀뻽?듬땲??`
                    : `Structured ${anchorSkuEvidence.product.features.confirmed.length} core features from Samsung dotcom copy.`)
                : (currentLocale === "ko"
                    ? "紐⑤뜽紐?以묒떖 ?쒓렇留?異붿텧?섏뼱 異붽? ?뺤씤???꾩슂?⑸땲??"
                    : "Only model-name tags were extracted, so more validation is still needed.")
        },
        {
            label: currentLocale === "ko" ? "?꾩떆 ?뺣??? : "City precision",
            status: citySignal ? "Supported" : "Limited",
            note: citySignal
                ? (currentLocale === "ko" ? "?꾩떆/?앺솢 ?좏샇瑜??곸슜?덉뒿?덈떎." : "Applied city and lifestyle signals.")
                : (currentLocale === "ko" ? "援?? 湲곕낯 ?쒓렇?먮줈 蹂닿컯?덉뒿?덈떎." : "Used the country fallback signal.")
        }
    ];

    // sourceRefs: ?대? ?뚯씪 + ?몃? URL 紐⑤몢 ?ы븿
    const sourceRefEntries = [...new Set([
        ...confirmed.map((item) => item.source),
        serviceSupport ? "service_support_matrix.json" : null,
        anchorSkuEvidence.product ? "product_feature_matrix.json" : null
    ].filter(Boolean))];
    // ?몃? URL 異쒖쿂
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
    const stockNote = currentLocale === "ko" ? "?ш퀬?뺤씤?꾩슂" : "Stock check required";
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
                title: currentLocale === "ko" ? "30珥?/ 1遺??몄씪利??좏겕" : "30s / 1m Sales Talk",
                items: [
                    currentLocale === "ko"
                        ? `30珥? "${deviceDecision.final.modelName} ?섎굹濡?${intent.missionBucket} 媛移섍? 諛붾줈 泥닿컧?⑸땲?? 癒쇱? ${primary.keyFeatures[0]}遺??蹂댁뿬?쒕┫寃뚯슂."`
                        : `30s: "${deviceDecision.final.modelName} makes ${intent.missionBucket} value immediate. Let me show ${primary.keyFeatures[0]} first."`,
                    currentLocale === "ko"
                        ? `1遺? ${selectedSegment} 怨좉컼 湲곗??쇰줈 ${intent.purpose} ?곹솴???ы쁽?섍퀬, ?듭떖 湲곕뒫 1媛?+ ?뺤옣 湲곌린 1媛쒓퉴吏 ?곌껐?⑸땲??`
                        : `1m: Recreate the ${intent.purpose} moment for ${selectedSegment}, then connect one core feature and one upsell device.`
                ]
            },
            {
                title: currentLocale === "ko" ? "異붿쿇 湲곌린 議고빀 (?낅Ц??/ ?낆???" : "Recommended Device Mix (Entry / Upsell)",
                items: [
                    currentLocale === "ko"
                        ? `?낅Ц?? ${entryBundle.length ? entryBundle.map(productLine).join(" / ") : `${deviceDecision.final.modelName} (${stockNote})`}`
                        : `Entry: ${entryBundle.length ? entryBundle.map(productLine).join(" / ") : `${deviceDecision.final.modelName} (${stockNote})`}`,
                    currentLocale === "ko"
                        ? `?낆??? ${coreBundle.length ? coreBundle.map(productLine).join(" / ") : `${deviceDecision.final.modelName} (${stockNote})`}`
                        : `Upsell: ${coreBundle.length ? coreBundle.map(productLine).join(" / ") : `${deviceDecision.final.modelName} (${stockNote})`}`
                ]
            },
            {
                title: currentLocale === "ko" ? "SmartThings ?④퀎蹂??명똿" : "SmartThings Setup Steps",
                items: [
                    currentLocale === "ko" ? "1) Samsung Account 濡쒓렇??2) Home ?앹꽦 3) 湲곗? 湲곌린 1? ?곌껐" : "1) Sign in with Samsung Account 2) Create Home 3) Connect one anchor device",
                    currentLocale === "ko" ? "4) ?먮룞??1媛??앹꽦 5) ?뚮┝/?꾩젽 ?ㅼ젙 6) 異붽? 湲곌린 ?뺤옣" : "4) Build one automation 5) Set alerts/widgets 6) Expand with additional devices"
                ]
            },
            {
                title: currentLocale === "ko" ? "?명솚??泥댄겕 & ?ㅽ뙣 ?щ?" : "Compatibility Checks & Common Failures",
                items: [
                    currentLocale === "ko" ? "泥댄겕: ?숈씪 Wi-Fi ??? 理쒖떊 ??踰꾩쟾, 吏??怨꾩젙 ?쇱튂 ?щ? ?뺤씤" : "Check: same Wi-Fi band, latest app version, and matching regional account",
                    currentLocale === "ko" ? "?ㅽ뙣 ?щ?: 湲곌린 ?곌껐 ??怨꾩젙 沅뚰븳 誘몄듅?? ?덈툕/?쇱꽌 ?섏뼱留??쒖꽌 ?ㅻ쪟" : "Failure cases: missing account permission before onboarding, incorrect hub/sensor pairing order"
                ]
            }
        ];
    }

    if (roleId === "dotcom") {
        const requiredText = selectedCategories.length ? selectedCategories.join(", ") : getCategoryName(deviceDecision.final.category);
        const optionalText = optionalCategories.length ? optionalCategories.join(", ") : (currentLocale === "ko" ? "異붽? ?좏깮 湲곌린 ?놁쓬" : "No additional optional devices");
        const benefitToProduct = (entryBundle.length ? entryBundle : [{ modelName: deviceDecision.final.modelName, category: deviceDecision.final.category }]).map((product) => (
            currentLocale === "ko"
                ? `${exploreGrounding.primaryValue} -> ${product.modelName} (${getCategoryName(product.category)})`
                : `${exploreGrounding.primaryValue} -> ${product.modelName} (${getCategoryName(product.category)})`
        ));
        return [
            {
                title: currentLocale === "ko" ? "吏??eStore / 吏??湲곌린 留ㅽ듃由?뒪" : "Regional eStore / Supported Device Matrix",
                items: [
                    currentLocale === "ko"
                        ? `?꾨찓?? ${marketInfo?.fullUrl || country.samsungShopUrl || `https://www.samsung.com/${(selectedMarket?.siteCode || country.countryCode || "").toLowerCase()}`}`
                        : `Domain: ${marketInfo?.fullUrl || country.samsungShopUrl || `https://www.samsung.com/${(selectedMarket?.siteCode || country.countryCode || "").toLowerCase()}`}`,
                    ...(orderedProducts.slice(0, 4).map((product) => `- ${productLine(product)}`)),
                    ...(catalogReady ? [] : [currentLocale === "ko" ? "- 吏???먮ℓ SKU ?곗씠??誘명솗蹂? ?ш퀬?뺤씤?꾩슂" : "- Regional SKU list unavailable: stock check required"])
                ]
            },
            {
                title: currentLocale === "ko" ? "?쒗뭹 踰덈뱾 異붿쿇 (Entry / Core / Premium)" : "Bundle Recommendation (Entry / Core / Premium)",
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
                title: currentLocale === "ko" ? "?꾩닔 vs ?좏깮 湲곌린 援щ텇" : "Required vs Optional Devices",
                items: [
                    currentLocale === "ko" ? `?꾩닔: ${requiredText}` : `Required: ${requiredText}`,
                    currentLocale === "ko" ? `?좏깮: ${optionalText}` : `Optional: ${optionalText}`
                ]
            },
            {
                title: currentLocale === "ko" ? "PDP / ?쒕뵫 Benefit -> Product 留ㅽ븨" : "PDP / Landing Benefit -> Product Mapping",
                items: benefitToProduct
            }
        ];
    }

    return [
        {
            title: currentLocale === "ko" ? "釉뚮옖??硫붿떆吏 (?⑤Ц / ?λЦ)" : "Brand Message (Short / Long)",
            items: [
                currentLocale === "ko"
                    ? `?⑤Ц: ${exploreGrounding.primaryValue}???앺솢??湲곕낯 由щ벉?쇰줈 留뚮벊?덈떎.`
                    : `Short: Turn ${exploreGrounding.primaryValue} into an everyday rhythm.`,
                currentLocale === "ko"
                    ? `?λЦ: ${selectedSegment}??"${intent.purpose}" ?곹솴?먯꽌 ?쒖옉?? 湲곗닠 ?ㅻ챸蹂대떎 ?ъ슜?먭? ?먮겮???덈룄媛먭낵 ?ъ쑀瑜?釉뚮옖??寃쏀뿕?쇰줈 ?곌껐?⑸땲??`
                    : `Long: Start from "${intent.purpose}" for ${selectedSegment}, and turn emotional relief into a branded experience beyond feature talk.`
            ]
        },
        {
            title: currentLocale === "ko" ? "吏??룸Ц??留λ씫 ?ㅽ넗由ы뀛留? : "Regional & Cultural Storytelling",
            items: [
                currentLocale === "ko"
                    ? `${getCountryName(country.countryCode)} ?앺솢 由щ벉?먯꽌 諛섎났?섎뒗 遺덊렪??泥??λ㈃?쇰줈 諛곗튂?섍퀬, ?꾩? ?몄뼱 ?ㅼ쑝濡?移댄뵾瑜?議곗젙?⑸땲??`
                    : `Open with recurring friction in the daily rhythm of ${getCountryName(country.countryCode)} and tune copy to local language tone.`,
                currentLocale === "ko"
                    ? "?꾩? 媛議?二쇨굅 ?⑦꽩??留욌뒗 ?λ㈃??1李??몄텧 ?뚯옱濡?怨좎젙?⑸땲??"
                    : "Lock one local household/living-context scene as the primary exposure asset."
            ]
        },
        {
            title: currentLocale === "ko" ? "罹좏럹?맞룹떆利뙿룹씠踰ㅽ듃 ?곌퀎" : "Campaign / Season / Event Linkage",
            items: [
                currentLocale === "ko"
                    ? `?쒖쫵: ${intent.missionBucket} ?덉쫰媛 而ㅼ????쒖젏??留욎떠 硫붿떆吏 媛뺣룄瑜?議곗젙?⑸땲??`
                    : `Seasonality: adjust message intensity when ${intent.missionBucket} demand rises.`,
                currentLocale === "ko"
                    ? "?대깽?? ?곗묶/?꾨줈紐⑥뀡/由щ쭏?몃뱶 3?④퀎濡??뚯옱瑜?遺꾨━ ?댁쁺?⑸땲??"
                    : "Events: split assets into launch, promotion, and reminder phases."
            ]
        },
        {
            title: currentLocale === "ko" ? "湲濡쒕쾶 vs 濡쒖뺄 硫붿떆吏 援щ텇" : "Global vs Local Message Logic",
            items: [
                currentLocale === "ko" ? `湲濡쒕쾶: ${exploreGrounding.primaryValue} 以묒떖???쇨???媛移?臾몄옣` : `Global: one consistent value line around ${exploreGrounding.primaryValue}`,
                currentLocale === "ko" ? "濡쒖뺄: ?쒖옣蹂??앺솢 留λ씫/?몄뼱/?쒖쫵??留욎텣 ?щ? 臾몄옣" : "Local: market-specific lines tuned by context, language, and season"
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
                title: isKo ? "怨좉컼?먭쾶 諛붾줈 ?쏀엳????臾몄옣" : "One line customers understand immediately",
                meaning: isKo ? "留ㅼ옣?먯꽌 泥?10珥덉뿉 ?꾨떖???듭떖 ?몄씪利?臾몄옣?낅땲??" : "The core sales sentence to use in the first 10 seconds in store.",
                example: isKo
                    ? `?덉떆: "${deviceDecision.final.modelName} ?섎굹濡?${intent.missionBucket}瑜?諛붾줈 泥닿컧?????덉뒿?덈떎."`
                    : `Example: "${deviceDecision.final.modelName} gives immediate ${intent.missionBucket} value."`
            },
            {
                title: isKo ? "30珥??곕え ?먮쫫" : "30-second demo flow",
                meaning: isKo ? "湲곕뒫 ?ㅻ챸???꾨땲???앺솢 臾몄젣 -> ?닿껐 ?λ㈃ ?쒖꽌濡?蹂댁뿬二쇰뒗 援ъ“?낅땲??" : "A show flow built as problem -> solved moment, not a feature dump.",
                example: isKo ? `?덉떆: ${detailPick(0, 1)}` : `Example: ${detailPick(0, 1)}`
            },
            {
                title: isKo ? "異붿쿇 湲곌린 議고빀" : "Recommended device mix",
                meaning: isKo ? "?낅Ц???뺤옣?뺤쑝濡??섎닠 諛붾줈 ?쒖븞?????덈뒗 ?먮ℓ 議고빀?낅땲??" : "A ready-to-sell mix split into entry and expansion options.",
                example: isKo ? `?덉떆: ${detailPick(1, 0)}` : `Example: ${detailPick(1, 0)}`
            },
            {
                title: isKo ? "?꾩옣 ?명똿 泥댄겕 ?쒖꽌" : "On-site setup checklist order",
                meaning: isKo ? "?ㅼ튂/?곌껐 ?④퀎?먯꽌 ?ㅽ뙣瑜?以꾩씠湲??꾪븳 理쒖냼 泥댄겕 ?쒖꽌?낅땲??" : "A minimal check order that lowers setup failure risk.",
                example: isKo ? `?덉떆: ${detailPick(2, 0)}` : `Example: ${detailPick(2, 0)}`
            },
            {
                title: isKo ? "?ㅽ뙣 由ъ뒪???ъ쟾 ?뺤씤" : "Pre-check for failure risks",
                meaning: isKo ? "?곷떞 以??먯＜ 諛쒖깮?섎뒗 ?명솚/怨꾩젙 ?댁뒋瑜?癒쇱? ?먭??섎뒗 ??ぉ?낅땲??" : "Quick checks for frequent compatibility/account issues during consultation.",
                example: isKo ? `?덉떆: ${detailPick(3, 0)}` : `Example: ${detailPick(3, 0)}`
            }
        ];
    }

    if (roleId === "dotcom") {
        return [
            {
                title: isKo ? "?쒕뵫 泥??붾㈃ 硫붿떆吏" : "First-screen landing message",
                meaning: isKo ? "PDP ?곷떒?먯꽌 ?대뼡 ?곹솴 媛移섎???蹂댁뿬以꾩? ?뺥븳 臾멸뎄?낅땲??" : "The line that defines which situational value appears first on PDP.",
                example: isKo
                    ? `?덉떆: ${selectedSegment}?먭쾶 "${intent.missionBucket}" 媛移섎? 泥??붾㈃?먯꽌 癒쇱? ?쒖떆`
                    : `Example: Lead with "${intent.missionBucket}" value for ${selectedSegment} on first screen`
            },
            {
                title: isKo ? "吏??eStore 湲곗? ?꾨찓???쒗뭹 留? : "Region eStore domain and product map",
                meaning: isKo ? "?대떦 援???먯꽌 ?ㅼ젣 ?곌껐??URL怨?二쇰젰 ?쒗뭹 湲곗??낅땲??" : "The market URL and product anchor map for the selected country.",
                example: isKo ? `?덉떆: ${detailPick(0, 0)}` : `Example: ${detailPick(0, 0)}`
            },
            {
                title: isKo ? "踰덈뱾 ?쒖븞 援ъ“ (Entry/Core/Premium)" : "Bundle ladder (Entry/Core/Premium)",
                meaning: isKo ? "媛寃?媛移??④퀎蹂꾨줈 異붿쿇???섎닠 ?λ컮援щ땲 吏꾩엯???쎄쾶 留뚮뱶??援ъ“?낅땲??" : "A pricing-value ladder that makes add-to-cart easier.",
                example: isKo ? `?덉떆: ${detailPick(1, 1)}` : `Example: ${detailPick(1, 1)}`
            },
            {
                title: isKo ? "?꾩닔 vs ?좏깮 湲곌린 湲곗?" : "Required vs optional device logic",
                meaning: isKo ? "理쒖냼 援щℓ 援ъ꽦怨??뺤옣 援ъ꽦??遺꾨━???쇱꽑??以꾩씠??湲곗??낅땲??" : "A clear split between minimum and expansion device sets.",
                example: isKo ? `?덉떆: ${detailPick(2, 0)}` : `Example: ${detailPick(2, 0)}`
            },
            {
                title: isKo ? "Benefit -> Product 留ㅽ븨" : "Benefit -> Product mapping",
                meaning: isKo ? "?ъ슜???쒗깮 臾몄옣???대뼡 ?쒗뭹怨??곌껐?좎? ?뺣━??留듭엯?덈떎." : "A map that ties user benefits to concrete products.",
                example: isKo ? `?덉떆: ${detailPick(3, 0)}` : `Example: ${detailPick(3, 0)}`
            }
        ];
    }

    return [
        {
            title: isKo ? "罹좏럹???듭떖 ??以? : "Core campaign one-liner",
            meaning: isKo ? "釉뚮옖???ㅼ쓣 ?좎??섎㈃?쒕룄 ?쒖옣?먯꽌 諛붾줈 ?댄빐?섎뒗 ?듭떖 臾몄옣?낅땲??" : "A core line that keeps brand tone and stays easy to grasp.",
            example: isKo
                ? `?덉떆: ${exploreGrounding.primaryValue}???앺솢??湲곕낯 由щ벉?쇰줈 留뚮벊?덈떎.`
                : `Example: Turn ${exploreGrounding.primaryValue} into an everyday rhythm.`
        },
        {
            title: isKo ? "媛먯젙 以묒떖 ?ㅽ넗由??λ㈃" : "Emotion-first story moment",
            meaning: isKo ? "湲곕뒫 ????ъ슜?먭? ?먮겮??蹂???λ㈃??硫붿씤?쇰줈 ?먮뒗 援ъ꽦?낅땲??" : "A story structure that prioritizes felt change over features.",
            example: isKo ? `?덉떆: "${intent.purpose}" ?λ㈃?먯꽌 ?덈룄媛먯씠 ?앷린???쒓컙??硫붿씤 而룹쑝濡??ъ슜` : `Example: Use the relief moment in "${intent.purpose}" as the key scene`
        },
        {
            title: isKo ? "濡쒖뺄 臾명솕/?몄뼱 ?곸슜 ?ъ씤?? : "Local culture and language adaptation",
            meaning: isKo ? "?쒖옣蹂??앺솢 由щ벉怨??뺤꽌??留욊쾶 移댄뵾 ?ㅼ쓣 議곗젙?섎뒗 湲곗??낅땲??" : "Guidance for tuning copy tone to local rhythm and emotion.",
            example: isKo ? `?덉떆: ${marketName} ?앺솢 留λ씫??留욌뒗 媛먯젙 ?몄뼱濡?硫붿떆吏 ?꾩??? : `Example: Localize emotional tone to daily context in ${marketName}`
        },
        {
            title: isKo ? "罹좏럹???먯뀑 ?⑦궎吏" : "Campaign asset package",
            meaning: isKo ? "硫붿씤 ?곸긽, ?뚯뀥 移댄뵾, KV瑜??섎굹???뺤꽌濡?臾띠뼱 ?댁쁺?섎뒗 援ъ꽦?낅땲??" : "A package that keeps film, social copy, and KV in one emotion.",
            example: isKo
                ? `?덉떆: 30珥??곸긽 + ?뚯뀥 移댄뵾 + KV瑜?"${selectedSegment}" ?寃??ㅼ쑝濡??듭씪`
                : `Example: Keep 30s film + social copy + KV aligned for ${selectedSegment}`
        },
        {
            title: isKo ? "?쒖쫵/?대깽???댁쁺 ??대컢" : "Season/event operating timing",
            meaning: isKo ? "?몄젣 硫붿떆吏 媛뺣룄瑜??щ━怨??뚯옱瑜?遺꾨━?좎? ?뺥븳 ?ㅽ뻾 湲곗??낅땲??" : "Execution timing for when to intensify and split campaign assets.",
            example: isKo ? `?덉떆: ${intent.missionBucket} ?덉쫰媛 而ㅼ????쒖쫵???곗묶 -> ?꾨줈紐⑥뀡 -> 由щ쭏?몃뱶 ?댁쁺` : `Example: Run launch -> promo -> reminder as ${intent.missionBucket} demand peaks`
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
                ? `${selectedSegment} 怨좉컼?먭쾶??"${intent.purpose}"瑜?諛붾줈 ?곕え 臾몄옣?쇰줈 ?ъ슜?⑸땲??`
                : `Use "${intent.purpose}" as the live demo line for the ${selectedSegment} segment.`
            ],
            copy: narrative[7],
            asset: currentLocale === "ko" ? "留ㅼ옣 ?곕え ?ㅽ겕由쏀듃 + ?곷떞 移대뱶" : "Store demo script + consultation card",
            message: currentLocale === "ko"
                ? `${deviceDecision.final.modelName}媛 ${marketName} 留ㅼ옣?먯꽌 ?대뼡 ?앺솢 臾몄젣瑜?以꾩뿬二쇰뒗吏, 洹몃━怨???吏湲??꾩슂?쒖?瑜???臾몄옣?쇰줈 ?ㅻ챸?⑸땲??`
                : `Explain in one sentence which daily-life problem ${deviceDecision.final.modelName} solves in ${marketName} stores and why it matters now.`,
            cta: currentLocale === "ko" ? "吏湲?諛붾줈 泥댄뿕??蹂댁꽭?? : "Try this experience now",
            kpi: currentLocale === "ko" ? "?곷떞 ?꾪솚??/ ?곕え ??愿?щ룄" : "Consultation conversion / post-demo interest",
            objective: currentLocale === "ko" ? "留ㅼ옣?먯꽌 30珥??덉뿉 怨좉컼??'???꾩슂?쒖?' ?댄빐?섍쾶 留뚮뱶??寃? : "Make shoppers understand 'why it matters' within 30 seconds in-store.",
            headline: currentLocale === "ko" ? `${exploreGrounding.primaryValue}??諛붾줈 ?쏀엳?????λ㈃?쇰줈 ?ㅻ챸?⑸땲??` : `Lead with one moment that makes ${exploreGrounding.primaryValue} immediately legible.`,
            proofPoints: [
                currentLocale === "ko" ? `${deviceDecision.final.modelName} 以묒떖 ?곕え濡??쒖옉???댄빐 ?덈뱾????땅?덈떎.` : `Start with a demo anchored on ${deviceDecision.final.modelName} to lower comprehension friction.`,
                currentLocale === "ko" ? `${primary.keyFeatures[0]}瑜??앺솢 臾몄젣 ?닿껐 ?몄뼱濡?踰덉뿭?⑸땲??` : `Translate ${primary.keyFeatures[0]} into problem-solving language.`,
                currentLocale === "ko" ? `?곷떞 以?異붽? 湲곌린 ?뺤옣 ?ъ씤?몃? ?먯뿰?ㅻ읇寃??곌껐?⑸땲??` : "Introduce expansion opportunities naturally during consultation."
            ],
            executionChecklist: [
                currentLocale === "ko" ? "?곕え ?쒖옉 臾몄옣????以꾨줈 ?듭씪" : "Standardize the opening demo line in one sentence",
                currentLocale === "ko" ? "泥?吏덈Ц? 湲곕뒫???꾨땲???앺솢 臾몄젣濡??쒖옉" : "Open with the daily problem, not the feature",
                currentLocale === "ko" ? "泥댄뿕 ??諛붾줈 ?ㅼ쓬 異붿쿇 湲곌린 ?곌껐" : "Connect the next recommended device immediately after the demo"
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
                    ? `PDP ?곷떒?먮뒗 ${selectedSegment}? ${intent.missionBucket} 媛移섎? 癒쇱? 蹂댁뿬以띾땲??`
                    : `Lead the PDP with the ${selectedSegment} segment and the ${intent.missionBucket} value.`
            ],
            copy: localizeRoleText("dotcomCopy", deviceDecision.final.modelName),
            asset: currentLocale === "ko" ? "PDP ?덉뼱濡?諛곕꼫 + FAQ + 異붿쿇 移대뱶" : "PDP hero banner + FAQ + recommendation card",
            message: currentLocale === "ko"
                ? `?ъ슜 ?λ㈃, ?듭떖 媛移? CTA媛 ${exploreGrounding.coreMessage}??留욎떠 ???붾㈃ ?덉뿉???댁뼱吏寃?援ъ꽦?⑸땲??`
                : `Keep the use moment, core value, and CTA aligned to ${exploreGrounding.coreMessage} within one continuous page flow.`,
            cta: currentLocale === "ko" ? "???곹솴??留욌뒗 異붿쿇 蹂닿린" : "See recommendations for my situation",
            kpi: currentLocale === "ko" ? "PDP 泥대쪟?쒓컙 / CTA ?대┃瑜?/ ?λ컮援щ땲 吏꾩엯" : "PDP dwell time / CTA CTR / add-to-cart rate",
            objective: currentLocale === "ko" ? "?쒕뵫?먯꽌 ?λ컮援щ땲 吏꾩엯源뚯? 硫붿떆吏 ?댄깉 ?놁씠 ?곌껐?섎뒗 寃? : "Connect landing to add-to-cart without message drop-off.",
            headline: currentLocale === "ko" ? `"???곹솴?먯꽌 臾댁뾿??媛踰쇱썙吏?붽?"瑜?癒쇱? 蹂댁뿬以띾땲??` : `Show "what gets lighter in my situation" before product specs.`,
            proofPoints: [
                currentLocale === "ko" ? "?덉뼱濡??곸뿭?먯꽌 ?곹솴-媛移?CTA瑜???踰덉뿉 ?쒖떆" : "Present situation, value, and CTA together in the hero area",
                currentLocale === "ko" ? "FAQ? 移대뱶 ?뱀뀡?먯꽌 媛숈? 硫붿떆吏瑜?諛섎났 媛뺥솕" : "Reinforce the same message through FAQ and cards",
                currentLocale === "ko" ? "?λ컮援щ땲 ?꾪솚 吏곸쟾?먮뒗 ?ㅼ젙 ?쒖씠?꾨낫??利됱떆 泥닿컧 媛移섎? 媛뺤“" : "Emphasize immediate value over setup complexity before conversion"
            ],
            executionChecklist: [
                currentLocale === "ko" ? "PDP 泥??붾㈃ 臾멸뎄瑜?2臾몄옣 ?대궡濡??뺤텞" : "Keep the first PDP message within two sentences",
                currentLocale === "ko" ? "異붿쿇 CTA????醫낅쪟留??곗꽑 寃利? : "Validate one priority recommendation CTA first",
                currentLocale === "ko" ? "FAQ???ъ슜 ?곹솴 以묒떖 吏덈Ц?쇰줈 ?ъ젙?? : "Reorder FAQ around real-use questions"
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
                    ? `${marketName} ?앺솢 留λ씫??留욌뒗 媛먯젙 ?몄뼱濡?硫붿떆吏瑜??꾩??뷀빀?덈떎.`
                    : `Localize the emotional message to the daily context of ${marketName}.`
            ],
            copy: localizeRoleText("brandCopy"),
            asset: currentLocale === "ko" ? "30珥??곸긽 + ?뚯뀥 移댄뵾 + KV" : "30-second film + social copy + key visual",
            message: currentLocale === "ko"
                ? `${exploreGrounding.messageAngle}??以묒떖?쇰줈 罹좏럹?몄쓣 ?ㅺ퀎?⑸땲??`
                : `Build the campaign around ${exploreGrounding.messageAngle}, not feature lists.`,
            cta: currentLocale === "ko" ? "?곕━ 吏?猷⑦떞????媛蹂띻쾶" : "Make your home routine feel lighter",
            kpi: currentLocale === "ko" ? "?곸긽 ?꾩＜??/ 釉뚮옖???좏샇??/ 怨듭쑀 ?섑뼢" : "Video completion / brand preference / sharing intent",
            objective: currentLocale === "ko" ? "湲곗닠???꾨땲??諛곕젮諛쏅뒗 媛먯젙??釉뚮옖???먯궛?쇰줈 留뚮뱶??寃? : "Turn the feeling of being cared for into a brand asset.",
            headline: currentLocale === "ko" ? "湲곕뒫? 諛곌꼍?쇰줈 ?먭퀬, ?ъ슜?먯쓽 ?앺솢 由щ벉???ㅼ젣濡?媛踰쇱썙吏???λ㈃???꾨㈃???〓땲??" : "Keep features in the background and foreground the moment daily rhythm actually gets lighter.",
            proofPoints: [
                currentLocale === "ko" ? "30珥??덉뿉 臾몄젣-?꾪솚-?덈룄媛먯쓽 ?먮쫫??蹂댁뿬???? : "Show the arc of problem, transition, and relief within 30 seconds",
                currentLocale === "ko" ? "?꾩? ?쒖옣 ?뺤꽌??留욌뒗 媛먯젙 ?몄뼱濡?議곗젙" : "Adjust the emotional language to the local market context",
                currentLocale === "ko" ? "?뚯뀥 吏㏃? 移댄뵾?먯꽌??媛숈? ?뺤꽌瑜??좎?" : "Keep the same emotional tone across short social copy"
            ],
            executionChecklist: [
                currentLocale === "ko" ? "罹좏럹??硫붿씤 移댄뵾瑜?湲곕뒫紐??놁씠 ?묒꽦" : "Write the core campaign line without feature jargon",
                currentLocale === "ko" ? "?곸긽 KV? ?뚯뀥 移댄뵾???뺤꽌瑜??쇱튂" : "Align the emotional tone of film KV and social copy",
                currentLocale === "ko" ? "怨듭쑀瑜?遺瑜대뒗 ??臾몄옣 ?꾪궧 ?ъ씤???ㅺ퀎" : "Design a one-line hook that encourages sharing"
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
            currentLocale === "ko" ? "留ㅼ옣 ?쒖뿰 ??吏덈Ц ??利앷?? ?곷떞 ?꾪솚 媛쒖꽑" : "Increase post-demo questions and improve consultation conversion",
            currentLocale === "ko" ? "湲곌린 ?⑦뭹 ?ㅻ챸蹂대떎 ?앺솢 ?λ㈃ ?ㅻ챸??諛섏쓳瑜??곸듅" : "Raise response to scenario-led selling over feature-only explanation"
        ],
        dotcom: [
            localizeSentence("metricDotcom"),
            currentLocale === "ko" ? "?덉뼱濡?諛곕꼫?먯꽌 CTA ?대┃瑜??곸듅" : "Lift CTA click-through from the hero banner",
            currentLocale === "ko" ? "?쒕굹由ъ삤 湲곕컲 FAQ ?뚮퉬 利앷?" : "Increase consumption of scenario-led FAQ content"
        ],
        brand: [
            localizeSentence("metricBrand"),
            currentLocale === "ko" ? "釉뚮옖??硫붿떆吏??怨듦컧?꾩? 湲곗뼲瑜?媛뺥솕" : "Strengthen message resonance and recall",
            currentLocale === "ko" ? "媛먯젙 媛移?以묒떖 ?먮컻??怨듭쑀 諛섏쓳 利앷?" : "Increase voluntary sharing around emotional value"
        ]
    };
    return bank[selectedRole.id] || [`${intent.missionBucket} 寃쏀뿕 媛뺥솕 -> 諛섎났 ?ъ슜 利앷?`];
}

function buildTargetSegment(country, city, selectedSegment, intent, exploreGrounding) {
    return [
        localizeSentence("segment1", city ? `${getCountryName(country.countryCode)} / ${city}` : getCountryName(country.countryCode)),
        localizeSentence("segment2", `${selectedSegment} / ${intent.missionBucket}`),
        localizeSentence("segment3"),
        currentLocale === "ko"
            ? `"${intent.purpose}" 媛숈? ?곹솴???먯＜ ?볦씠???ъ슜?먯뿉寃??곗꽑 ?곸슜?섍린 醫뗭뒿?덈떎.`
            : `Best applied first to users who often face situations like "${intent.purpose}".`,
        currentLocale === "ko"
            ? "媛泥섎텇 ?뚮뱷 ?꾨줉?? ?곌껐??媛?꾧낵 ???ъ슜??異붽? 鍮꾩슜怨??몄씡??紐⑤몢 寃?좏븷 媛?μ꽦???믪? 以묎컙 ?댁긽 援щℓ??媛援?
            : "Disposable-income proxy: mid-to-upper purchasing-power households likely to weigh both the added cost and value of connected appliances",
        currentLocale === "ko"
            ? `??쒖꽦 洹쇨굅: ${exploreGrounding.primaryValue}泥섎읆 寃곌낵媛 遺꾨챸???쒖븞???좏샇?섎뒗 ?쇱씠?꾩뒪????멸렇癒쇳듃`
            : `Representative rationale: a lifestyle segment that prefers offers with clear outcomes such as ${exploreGrounding.primaryValue}`
    ];
}

function buildSetupGuide(deviceDecision, services, selectedRole) {
    const roleName = getRoleTitle(selectedRole.id);
    const deviceName = deviceDecision.final.modelName;
    const serviceName = getServiceLabel(services[0]);
    return currentLocale === "ko"
        ? [
            `?쒖옉 ??以鍮? ${deviceName} ?꾩썝 耳쒓린, SmartThings ???ㅼ튂, ?쇱꽦 怨꾩젙 濡쒓렇???꾨즺`,
            `湲곌린 ?곌껐: ?깆뿉??'+' ??'湲곌린 異붽?' ??${deviceName}???좏깮?섍퀬 ?붾㈃ ?덈궡瑜??곕쫭?덈떎.`,
            `?쒕퉬???쒖꽦?? '?먮룞?? ??뿉??${serviceName}???쒖꽦?뷀븯怨??먰븯??議곌굔???ㅼ젙?⑸땲??`,
            "泥??깃났 ?뺤씤: ?ㅼ젙???먮룞?붽? 1???댁긽 ?뺤긽 ?숈옉?섎뒗吏 ?뺤씤?⑸땲??",
            "?뚮┝ 諛?怨듭쑀: ?뚮┝ ?ㅼ젙??耳쒓퀬, ?꾩슂?섎㈃ 媛議?援ъ꽦?먯쓣 珥덈??⑸땲??",
            `${roleName} ?대떦?먮뒗 泥?諛고룷 ??媛??諛섏쓳??醫뗭? 臾멸뎄? CTA瑜??④퍡 湲곕줉?⑸땲??`
        ]
        : [
            `Preparation: Power on ${deviceName}, install SmartThings, sign in.`,
            `Connect: In the app, tap '+' ??'Add device' ??select ${deviceName} and follow instructions.`,
            `Activate: In 'Automations', enable ${serviceName} and set conditions.`,
            "Verify: Confirm the automation runs at least once.",
            "Notify & share: Enable alerts and invite family members.",
            `${roleName} owners should log the best-performing message and CTA from the first rollout.`
        ];
}

function buildMarketability(country, intent, deviceDecision, services, selectedRole, selectedSegment, exploreGrounding) {
    const go = intent.lifestyleTags.length > 0 && Boolean(deviceDecision.final);
    const rawRisk = String(services?.[0]?.privacyPolicy || "").trim();
    const hasHangul = /[媛-??/.test(rawRisk);
    const conciseSegment = compactDescriptor(selectedSegment, 4) || (currentLocale === "ko" ? "?곹솴 湲곕컲 ?寃? : "context-led target");
    const concisePurpose = compactPurpose(intent.purpose);
    return {
        verdict: go ? "Go" : "No-Go",
        rationale: go
            ? (currentLocale === "ko"
                ? `${getCountryName(country.countryCode)}?먯꽌 ${conciseSegment}??"${concisePurpose}" ?곹솴? ${exploreGrounding.primaryValue} 媛移섍? 紐낇솗?섍쾶 ?쏀엳???λ㈃?대씪 Go ?먮떒??媛?ν빀?덈떎.`
                : `In ${getCountryName(country.countryCode)}, the "${concisePurpose}" moment for the ${conciseSegment} segment makes ${exploreGrounding.primaryValue} legible enough for a Go decision.`)
            : localizeSentence("marketNoGo"),
        competitorView: currentLocale === "ko"
            ? `李⑤퀎?먯? 湲곕뒫 ?섍? ?꾨땲??${exploreGrounding.functionalJob}????踰덉쓽 ?곌껐 寃쏀뿕?쇰줈 以꾩뿬以?ㅻ뒗 ?먯엯?덈떎.`
            : `The differentiation is not feature count but reducing ${exploreGrounding.functionalJob} into one connected experience.`,
        risk: currentLocale === "ko"
            ? rawRisk
            : (hasHangul
                ? "Energy and behavior signals should be used only for clearly explained utility, automation, and report purposes."
                : (rawRisk || "Data usage must stay purpose-limited, transparent, and easy to control.")),
        alternatives: currentLocale === "ko"
            ? [
                "???1: ?섎룞 ?쒖뼱 以묒떖???쇰컲 媛???ъ슜 寃쏀뿕",
                "???2: 湲곌린蹂?媛쒕퀎 ?깆쓣 ?곕줈 ?댁쁺?섎뒗 ?⑥젅??寃쏀뿕",
                "???3: 湲곕낯 ?ㅻ쭏???뚮윭洹??섏????⑥닚 ?먮룞??
            ]
            : [
                "Alternative 1: a manual-control appliance experience",
                "Alternative 2: a fragmented setup with separate apps per device",
                "Alternative 3: basic automation limited to smart-plug logic"
            ],
        nextActions: [
            currentLocale === "ko"
                ? `${conciseSegment} 湲곗??쇰줈 "${concisePurpose}" 留λ씫??泥?諛고룷????臾몄옣 硫붿떆吏瑜??뺤젙?⑸땲??`
                : `Lock a one-line launch message for the ${conciseSegment} segment.`,
            currentLocale === "ko"
                ? `${getRoleTitle(selectedRole.id)} 梨꾨꼸?먯꽌 癒쇱? 寃利앺븷 ?듭떖 CTA瑜?1媛??뺥빀?덈떎.`
                : `Choose one priority CTA to validate first in the ${getRoleTitle(selectedRole.id)} channel.`,
            currentLocale === "ko"
                ? `${deviceDecision.final.modelName} 媛?⑹꽦怨??꾩? ?몄뼱 移댄뵾瑜??④퍡 ?먭??⑸땲??`
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
    const conciseSegment = compactDescriptor(selectedSegment, 4) || (currentLocale === "ko" ? "?곹솴 湲곕컲 ?寃? : "context-led target");
    if (currentLocale === "ko") {
        return `${getRoleTitle(role.id)} 愿?먯쓽 ${conciseSegment} ???${getCategoryName(deviceDecision.final.category)} 湲곕컲 ${intent.missionBucket} ?쒕굹由ъ삤`;
    }
    return `${getRoleTitle(role.id)} | ${intent.missionBucket} scenario for ${conciseSegment} built around ${getCategoryName(deviceDecision.final.category)}`;
}

function buildSummary(country, selectedSegment, intent, deviceDecision, services) {
    const conciseSegment = compactDescriptor(selectedSegment, 4) || (currentLocale === "ko" ? "?곹솴 湲곕컲 ?寃? : "context-led target");
    const regionTag = currentLocale === "ko" ? "吏???뱀꽦 諛섏쁺" : "region-reflective";
    if (currentLocale === "ko") {
        return `${getCountryName(country.countryCode)}?먯꽌 ${conciseSegment}?먭쾶 ${deviceDecision.final.modelName}? ${getServiceLabel(services[0])}瑜?以묒떖?쇰줈 ${intent.missionBucket} 媛移섎? ?꾨떖?섎뒗 ${regionTag} ???쒕굹由ъ삤?낅땲??`;
    }
    return `A ${regionTag} app scenario for the ${conciseSegment} segment in ${getCountryName(country.countryCode)}, centered on ${deviceDecision.final.modelName} and ${getServiceLabel(services[0])}, designed to deliver ${intent.missionBucket} value.`;
}

function buildReferenceLinks(intent, services) {
    const refs = [];
    if (intent.missionBucket === "Care") refs.push("care-for-your-familys-needs-even-when-away");
    if (intent.missionBucket === "Save" || intent.lifestyleTags.some((tag) => tag.includes("?먮꼫吏"))) refs.push("seamlessly-save-energy");
    if (intent.lifestyleTags.some((tag) => tag.includes("諛섎젮"))) refs.push("purrfect-pet-care");
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
        currentLocale === "ko" ? `?꾧?: ${location}??${conciseSegment}` : `Who: ${conciseSegment} in ${location}`,
        currentLocale === "ko" ? `?몄젣: ${concisePurpose} 媛숈? ?곹솴??諛섎났?섎뒗 ?쇱긽 援ш컙` : `When: during recurring moments like "${concisePurpose}"`,
        currentLocale === "ko" ? `臾댁뾿?쇰줈: ${withServices}` : `With: ${withServices}`,
        currentLocale === "ko" ? `?대뼸寃? ${deviceDecision.final.modelName} 以묒떖??異붿쿇 移대뱶? 諛섎났 猷⑦떞?쇰줈 諛섎났 ?뺤씤/?섎룞 議곗옉??以꾩엫` : `How: reduce repeated checking and manual control via recommendation cards and repeat routines anchored on ${deviceDecision.final.modelName}`,
        currentLocale === "ko" ? `寃곌낵: ${exploreGrounding.primaryValue}????鍮좊Ⅴ寃?泥닿컧` : `Result: make ${exploreGrounding.primaryValue} felt faster`,
        currentLocale === "ko" ? `罹좏럹??硫붿떆吏: 湲곕뒫 ?섏뿴蹂대떎 ${concisePurpose} ?쒓컙???앺솢 遺???꾪솕瑜?媛뺤“` : `Campaign message: lead with lighter daily burden in ${concisePurpose} moments, not feature count`
    ];
}

function buildTargetCustomerLine(countryName, selectedSegment, purpose) {
    const tokens = `${selectedSegment} / ${purpose}`
        .split(/[\/,|]|쨌/)
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
            title: isPetContext ? "[Care] ?쇨렐??湲몄뼱??媛뺤븘吏媛 遺덉븞?좉퉴 嫄깆젙???? : "[Care] ?몄텧 ?쒓컙??湲몄뼱??諛섎젮?숇Ъ 耳?닿? 嫄깆젙????,
            pain: isPetContext ? "??? ?쇨렐?쇰줈 ?쇱옄 吏묒뿉 ?덈뒗 媛뺤븘吏媛 以꾧낍 ?좉꼍 ?곗????ъ슜??" : "吏묒쓣 鍮꾩슦???쒓컙 ?숈븞 諛섎젮?숇Ъ??遺덉븞?댄븷源?怨꾩냽 留덉쓬???곗????ъ슜??",
            solution: `SmartThings?먯꽌 ?몄텧 猷⑦떞???앹꽦?섎㈃ ${cardLabel}瑜??듯빐 議곕챸 諛앷린, ?ㅻ궡 遺꾩쐞湲? 諛섎젮?숇Ъ???듭닕?댄븯???뚮━??湲곌린 ?섍꼍???먮룞?쇰줈 留욎텧 ???덉뒿?덈떎.`,
            benefit: "踰꾪듉 ??踰덉쑝濡? ?먮뒗 ?몄텧??媛먯??섎㈃ ?먮룞?쇰줈 ?レ쓣 ?꾪븳 ?섍꼍?쇰줈 ?꾪솚?섏뼱 ?먯돩??耳?닿? 媛?ν븯怨?蹂댄샇?먯쓽 遺덉븞??以꾩뼱??땲??"
        },
        "Family Care": {
            title: "[Care] 媛議깆씠??遺紐⑤떂???쇱긽??臾댁궗?쒖? ?뺤씤?섍퀬 ?띠쓣 ??,
            pain: "諛붿걶 ?섎（ 以묒뿉??媛議깆쓽 ?덈?瑜?怨꾩냽 ?좎삱由ш쾶 ?섏뼱 ?먯＜ ?곕씫?섍굅??諛섎났 ?뺤씤?섍쾶 ?섎뒗 ?ъ슜??",
            solution: `${cardLabel}??${firstFeature}? ${secondFeature}瑜?諛뷀깢?쇰줈 ?앺솢 ?⑦꽩???뺤씤?섍퀬, ?꾩슂???뚮쭔 ?덉떖 泥댄겕?몄씠???뚮┝???꾨떖?????덉뒿?덈떎.`,
            benefit: "留ㅻ쾲 癒쇱? ?곕씫?섍굅???뺤씤?섏? ?딆븘???꾩슂???쒓컙留??뚯븙?????덉뼱 ?뚮큵??遺?댁? 以꾧퀬 ?덉떖? ???좊챸?댁쭛?덈떎."
        },
        "SmartThings Energy": {
            title: "[Energy] ?꾧린?붽툑怨??湲곗쟾?μ씠 ?좉꼍 ?곗씪 ??,
            pain: "諛뽰뿉 ?덈뒗 ?숈븞 ?꾧린 ?붽툑??嫄깆젙?섏뼱 ?몄텧 ??湲곌린瑜??섎굹??爰쇱빞 ?덈뜕 ?ъ슜??",
            solution: `${cardLabel}濡??쇳겕 ?쒓컙??먮뒗 ?ъ슜?대굹 異⑹쟾???쒗븳?섍퀬, ?쇨컙 諛??붾퀎 ?ъ슜?됱쓣 紐⑤땲?곕쭅??遺덊븘?뷀븳 ?꾨젰 ?뚮퉬瑜?以꾩씪 ???덉뒿?덈떎.`,
            benefit: "?몄텧 以??湲곗쟾?κ낵 遺덊븘?뷀븳 ?ъ슜??以꾩뿬 鍮꾩슜 遺?댁쓣 ?쒓퀬, ?덇컧 ?④낵瑜??깆뿉???덉쑝濡??뺤씤?????덉뒿?덈떎."
        },
        "Samsung Health": {
            title: "[Health] 而⑤뵒?섍낵 ?앺솢 由щ벉?????덉젙?곸쑝濡?留욎텛怨??띠쓣 ??,
            pain: `${selectedSegment} ?ъ슜?먮뒗 諛붿걶 ?쇱젙???댁뼱吏덉닔濡??섎㈃怨??쒕룞 由щ벉???쎄쾶 臾대꼫吏怨??뚮났 ??대컢???볦튂湲??쎌뒿?덈떎.`,
            solution: `${cardLabel}??${firstFeature}瑜?湲곕컲?쇰줈 議곕챸, ?ㅽ뵾而? ${primaryDevice || "TV"} 媛숈? ?곌껐 湲곌린瑜??꾩옱 而⑤뵒?섏뿉 留욌뒗 猷⑦떞?쇰줈 ?댁뼱以띾땲??`,
            benefit: "嫄닿컯 ?곗씠?곕? ?곕줈 ?댁꽍?섏? ?딆븘??吏????섍꼍???앺솢 由щ벉 ?뚮났???뺢린 ?뚮Ц???섎（瑜????덉젙?곸쑝濡??댁쁺?????덉뒿?덈떎."
        },
        "Samsung Find": {
            title: "[Secure] ?몄텧怨?洹媛 ?먮쫫?????덉떖?섍퀬 ?곌껐?섍퀬 ?띠쓣 ??,
            pain: "吏묒쓣 ?섏꽌嫄곕굹 ?뚯븘?ㅻ뒗 ?쒓컙留덈떎 ?꾩튂? ?곹깭瑜??곕줈 ?뺤씤?댁빞 ??猷⑦떞???먯＜ ?딄린???ъ슜??",
            solution: `${cardLabel}??${firstFeature}瑜??쒖슜???꾩갑怨??댄깉??媛먯??섍퀬, 洹??좏샇瑜?SmartThings ?먮룞?붿? ?곌껐??議곕챸?대굹 ???곹깭瑜?諛붾줈 ?꾪솚?????덉뒿?덈떎.`,
            benefit: "遺꾩떎?대굹 ?꾩튂 ?뺤씤?먮쭔 癒몃Т瑜댁? ?딄퀬 ?앺솢 ?먮룞?붽퉴吏 ?먯뿰?ㅻ읇寃??곌껐?섏뼱 ?몄텧怨?洹媛 猷⑦떞???⑥뵮 媛踰쇱썙吏묐땲??"
        },
        "Home Monitoring": {
            title: "[Secure] ??? 遺?щ줈 ?곷궡 蹂댁븞??遺덉븞????,
            pain: "諛붿걶 ?쇱긽 ?띿뿉??留ㅻ쾲 ?ㅻ쭏?명룿?쇰줈 吏묒븞??紐⑤땲?곕쭅?섎뒗 寃껋? 踰덇굅濡?퀬 ?대졄?듬땲??",
            solution: `${cardLabel}怨??곕룞??移대찓??諛??쇱꽌???섏긽???뚮━? ?吏곸엫???곸떆 媛먯??섍퀬, ?댁긽 ?쒕룞???덉쑝硫??먮룞 ?뱁솕? ?ㅼ떆媛??뚮┝??蹂대깄?덈떎.`,
            benefit: "怨꾩냽 ?좉꼍 ?곌퀬 ?덉? ?딆븘???섎땲 ?덉떖?????덇퀬, ?댁긽 ?곹솴? ?ㅼ떆媛꾩쑝濡??뚮젮二쇰땲 鍮좊Ⅸ ?泥섎줈 ?????꾪뿕??留됱쓣 ???덉뒿?덈떎."
        },
        "Home Care": {
            title: "[Ease] 吏묒븞??愿由ъ? 湲곌린 耳?대? ?볦튂怨??띠? ?딆쓣 ??,
            pain: "泥?냼? ?뚮え??援먯껜, 湲곌린 愿由??쒖젏???먭씀 ?볦퀜 吏묒븞?쇱씠 ?쒓볼踰덉뿉 紐곕━???ъ슜??",
            solution: `${cardLabel}??${firstFeature}? 愿由?由щ쭏?몃뜑瑜?湲곕컲?쇰줈 ?꾩슂???쒖젏?먮쭔 泥?냼???좎?愿由??≪뀡???쒖븞?⑸땲??`,
            benefit: "?댁빞 ???쇱쓣 紐⑤몢 湲곗뼲?섏? ?딆븘???깆씠 ?곗꽑?쒖쐞瑜??뺣━??二쇨린 ?뚮Ц??吏?愿由??ㅽ듃?덉뒪媛 ?덉뿉 ?꾧쾶 以꾩뼱??땲??"
        },
        "Air Care": {
            title: "[Comfort] 吏???怨듦린? 苡뚯쟻?⑥쓣 ?먮룞?쇰줈 留욎텛怨??띠쓣 ??,
            pain: "?섍린???됰궃諛⑹쓣 洹몃븣洹몃븣 ?섎룞?쇰줈 議곗젅?댁빞 ?댁꽌 ?ㅻ궡 ?섍꼍???ㅼ춬?좎춬?덈뜕 ?ъ슜??",
            solution: `${cardLabel}??${firstFeature}? ?ъ떎 ?곹깭瑜?諛뷀깢?쇰줈 ?먯뼱而⑥씠??愿??湲곌린瑜?議곗젙??吏???而⑤뵒?섏쓣 ?먮룞?쇰줈 留욎땅?덈떎.`,
            benefit: "苡뚯쟻?④낵 ?덇컧 ?ъ씠瑜??쇱씪??議곗젅?섏? ?딆븘???섏뼱 吏묒뿉 癒몃Т???쒓컙??留뚯”?꾧? ?믪븘吏묐땲??"
        },
        "Clothing Care": {
            title: "[Ease] ?쇨렐 ?꾩뿉???명긽怨??섎쪟 愿由щ? ?볦튂怨??띠? ?딆쓣 ??,
            pain: "??쾶 洹媛?섎뒗 ?좎씠 留롮븘 ?명긽怨?嫄댁“ ?곹깭瑜??쒕븣 ?뺤씤?섏? 紐삵븯怨?踰덇굅濡쒖????볦????ъ슜??",
            solution: `${cardLabel}??${firstFeature}? ?꾨즺 ?뚮┝???듯빐 ?명긽/嫄댁“ ?먮쫫???깆뿉???댁뼱??愿由ы븷 ???덇쾶 ?뺤뒿?덈떎.`,
            benefit: "吏묒뿉 ?꾩갑?댁꽌???곹깭瑜??뺤씤?섎뒗 踰덇굅濡쒖???以꾧퀬, ?명긽 猷⑦떞????留ㅻ걚?쎄쾶 ?댁뼱媛????덉뒿?덈떎."
        },
        "Smart Cooking": {
            title: "[Ease] ???以鍮꾨? ??媛蹂띻쾶 ?쒖옉?섍퀬 ?띠쓣 ??,
            pain: "?닿렐 ???붾━瑜??쒖옉???뚮쭏???덉떆???뺤씤, ?덉뿴, ?щ즺 ?뺣━源뚯? ?쒓볼踰덉뿉 ?좉꼍 ?⑥빞 ?덈뜕 ?ъ슜??",
            solution: `${cardLabel}??${firstFeature}? ${secondFeature}瑜??곌껐??議곕━ 以鍮??④퀎瑜?以꾩씠怨?二쇰갑 湲곌린 ?쒖뼱瑜???鍮좊Ⅴ寃??쒖옉?섍쾶 ?뺤뒿?덈떎.`,
            benefit: "?앹궗 以鍮꾩쓽 吏꾩엯 ?λ꼍????븘??諛붿걶 ?됱씪 ??곸뿉???붾━瑜???遺?댁뒪?쎄쾶 ?댁뼱媛????덉뒿?덈떎."
        },
        "Home Fitness": {
            title: "[Health] 吏묒뿉?쒕룄 ?대룞 猷⑦떞??袁몄????댁뼱媛怨??띠쓣 ??,
            pain: "?대룞???쒖옉?섎젮怨??대룄 以鍮?怨쇱젙??踰덇굅濡쒖썙 ?쎄쾶 誘몃（寃??섎뒗 ?ъ슜??",
            solution: `${cardLabel}??${firstFeature}瑜?以묒떖?쇰줈 TV???ㅽ뵾而?媛숈? 湲곌린? ?곌껐???대룞 ?쒖옉 ?λ㈃????媛꾨떒?섍쾶 留뚮뱾??以띾땲??`,
            benefit: "?대룞??寃곗떖???쒓컙 諛붾줈 ?ㅽ뻾?????덉뼱 猷⑦떞 ?좎?媛 ?ъ썙吏怨? 吏묒뿉?쒕룄 袁몄????먭린愿由ш? 媛?ν빐吏묐땲??"
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
        title: currentLocale === "ko" ? `[${service.valueTags?.[0] || "Life"}] ${name}媛 ?꾩슂???쒓컙` : `[${service.valueTags?.[0] || "Life"}] When ${name} is needed`,
        pain: currentLocale === "ko"
            ? `${selectedSegment} ?ъ슜?먮뒗 ${intent.purpose} 媛숈? ?곹솴?먯꽌 諛섎났 ?뺤씤怨??섎룞 議곗옉??遺?댁쓣 ?먯＜ ?먮굧?덈떎.`
            : `${selectedSegment} users often feel burdened by repeated checking and manual control in moments like "${intent.purpose}".`,
        solution: currentLocale === "ko"
            ? `${cardLabel}??${firstFeature}? ${secondFeature}瑜?諛뷀깢?쇰줈 ?곌껐 湲곌린瑜???媛꾨떒??猷⑦떞?쇰줈 臾띠뼱 以띾땲??`
            : `${cardLabel} uses ${firstFeature} and ${secondFeature} to connect devices into a simpler routine flow.`,
        benefit: currentLocale === "ko"
            ? "?꾩슂???λ㈃?????곸? 議곗옉?쇰줈 ?ㅽ뻾?????덉뼱 ?쇱긽???⑥뵮 媛踰쇱썙吏묐땲??"
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
        return cleaned.includes("癒쇱?") ? cleaned : `${cleaned} ???λ㈃?먯꽌 癒쇱? 泥닿컧?섎뒗 寃곌낵遺??留먰빀?덈떎.`;
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
        output = `${output.slice(0, options.maxLength - 1).trim()}??;
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
        ? "?덇컧???뺤떊"
        : intent.missionBucket === "Secure"
            ? "?덉쟾???듭젣媛?
            : "?뚮큵???덉떖";
    const proofLine = currentLocale === "ko"
        ? `洹쇨굅: ${anchorService} / ${deviceDecisionText(deviceDecision)} / ${anchorSkuEvidence.product?.availability?.status || "unverified"} / service ${serviceSupport?.inferredSupport?.status || "unverified"}`
        : `Evidence: ${anchorService} / ${deviceDecisionText(deviceDecision)} / ${anchorSkuEvidence.product?.availability?.status || "unverified"} / service ${serviceSupport?.inferredSupport?.status || "unverified"}`;

    return {
        selectedLensId,
        roleTone: getRoleTitle(selectedLensId),
        guideline,
        voice: guideline.voice,
        confirmedRules: [
            `Voice: ${guideline.voice} / ${(guideline.identity || []).join(", ")}`,
            currentLocale === "ko"
                ? "洹쒖튃: 寃곌낵瑜?癒쇱? 留먰븯怨?湲곕뒫? ?ㅼ뿉??吏㏐쾶 蹂닿컯"
                : "Rule: lead with the outcome, then support it briefly with features.",
            currentLocale === "ko"
                ? "洹쒖튃: 怨듭떇 ?쒕퉬?ㅻ챸 ?몄뿉??AI Home ?쒗쁽???곗꽑"
                : "Rule: prefer AI Home wording unless an official service name is required.",
            currentLocale === "ko"
                ? "洹쒖튃: 03???뺤젙/異붾줎/援щℓ ?곹깭? 異⑸룎?섏? ?딅뒗 臾멸뎄留??ъ슜"
                : "Rule: keep copy aligned with the confirmed/inferred/purchase states in block 03."
        ],
        globalLocalSplit: {
            global: applyVerbalGuidelines(exploreGrounding.coreMessage, { maxLength: 110 }),
            local: currentLocale === "ko"
                ? applyVerbalGuidelines(`${selectedSegment}???앺솢 留λ씫??留욊쾶 ?щ? 臾몄옣怨?媛먯젙 ?댄쐶瑜??꾩???, { maxLength: 110 })
                : applyVerbalGuidelines(`Localize examples and emotional wording to the daily context of ${selectedSegment}.`, { maxLength: 110 })
        },
        lenses: {
            retail: {
                label: "Retail Lens",
                selected: selectedLensId === "retail",
                hookEn: applyVerbalGuidelines(`Feel ${exploreGrounding.primaryValue} before you learn the setup.`, { maxLength: 90 }),
                shortCopyKo: applyVerbalGuidelines(`${selectedSegment} 怨좉컼?먭쾶??湲곕뒫 ?ㅻ챸蹂대떎 "${exploreGrounding.messageAngle}"??癒쇱? 泥닿컧?섏뼱???⑸땲??`, { maxLength: 110 }),
                talkTrackKo: [
                    applyVerbalGuidelines(`泥섏쓬 10珥덉뿉??${exploreGrounding.coreMessage} ??臾몄옣?쇰줈 ?쒖옉?⑸땲??`, { maxLength: 90 }),
                    applyVerbalGuidelines(`洹몃떎??${anchorService}媛 ${intent.purpose} ?쒓컙???대뼸寃?以꾩뿬二쇰뒗吏 ??踰덈쭔 蹂댁뿬以띾땲??`, { maxLength: 110 }),
                    applyVerbalGuidelines("留덉?留됱뿉??蹂듭옟???ㅻ챸 ???諛붾줈 ?곕씪 ?????덈뒗 ??媛吏 猷⑦떞?쇰줈 ?앸깄?덈떎.", { maxLength: 90 })
                ],
                cta: applyVerbalGuidelines(currentLocale === "ko" ? "吏湲????λ㈃??留ㅼ옣?먯꽌 諛붾줈 ?곕え??蹂댁꽭??" : "Demo this moment in-store now.", { maxLength: 70 })
            },
            dotcom: {
                label: "Dotcom Lens",
                selected: selectedLensId === "dotcom",
                h1En: applyVerbalGuidelines(`Less setup. More ${exploreGrounding.primaryValue}.`, { maxLength: 80 }),
                subCopyKo: applyVerbalGuidelines(`${selectedSegment}?먭쾶 ?꾩슂??寃껋? 湲곕뒫 ?섏뿴???꾨땲??${intent.purpose} ?쒓컙??遺?댁쓣 ?쒖뼱二쇰뒗 AI Home 寃쏀뿕?낅땲??`, { maxLength: 110 }),
                proofPointKo: applyVerbalGuidelines(proofLine, { userFacing: false, outcomeFirst: false, maxLength: 130 }),
                cta: applyVerbalGuidelines(currentLocale === "ko" ? "PDP 泥??붾㈃?먯꽌 ??硫붿떆吏濡?吏꾩엯?쒗궎?몄슂." : "Use this as the PDP opening line.", { maxLength: 70 })
            },
            brand: {
                label: "Brand Lens",
                selected: selectedLensId === "brand",
                campaignConceptEn: applyVerbalGuidelines("AI Home, with a more human rhythm.", { maxLength: 70 }),
                emotionalNarrativeKo: applyVerbalGuidelines(`${intent.purpose} ?쒓컙??湲곗닠???욎꽌??????щ엺??癒쇱? ?덉떖?섍쾶 留뚮뱶??寃? 洹멸쾬???대쾲 硫붿떆吏??以묒떖?낅땲?? ${selectedSegment}???섎（瑜???媛蹂띻쾶 留뚮뱾硫?${emotionalNoun}???④린?꾨줉 ?ㅺ퀎?⑸땲??`, { maxLength: 130 }),
                brandValue: currentLocale === "ko"
                    ? "?щ엺 以묒떖??諛곕젮, ?덉젣???꾨━誘몄뾼, ?곌껐???쇱긽 ?⑥슜"
                    : "Human-first care, restrained premium, connected daily utility",
                cta: applyVerbalGuidelines(currentLocale === "ko" ? "湲濡쒕쾶 硫붿떆吏???좎??섍퀬 ?꾩? ?λ㈃留???援ъ껜?뷀븯?몄슂." : "Keep the global message and localize only the scene.", { maxLength: 80 })
            }
        }
    };
}

function buildBenefits(intent, services, exploreGrounding) {
    return [
        currentLocale === "ko" ? `湲곕뒫??媛移? ${exploreGrounding.functionalJob}??以꾩뿬 諛섎났 ?뺤씤怨??섎룞 議곗옉???쒖뼱以띾땲??` : `Functional value: reduce ${exploreGrounding.functionalJob} and lighten repeated checking.`,
        currentLocale === "ko" ? `媛먯젙??媛移? ${exploreGrounding.emotionalJob}??媛?ν빐???щ━??遺?댁씠 ??븘吏묐땲??` : `Emotional value: enable ${exploreGrounding.emotionalJob} and lower emotional burden.`,
        currentLocale === "ko" ? `媛먯꽦??泥닿컧: ${exploreGrounding.primaryValue}????踰덉쓽 ?ъ슜 ?λ㈃?먯꽌??諛붾줈 ?쏀엳?꾨줉 ?ㅺ퀎?⑸땲??` : `Emotional experience: make ${exploreGrounding.primaryValue} legible from the first use moment.`
    ];
}

function buildSegmentAnalysis(country, city, selectedSegment, intent, exploreGrounding) {
    const countryName = getCountryName(country.countryCode);
    const locationLabel = city ? `${city}, ${countryName}` : countryName;
    return {
        core: currentLocale === "ko" ? `${selectedSegment} / ${locationLabel} ?앺솢沅? : `${selectedSegment} / ${locationLabel}`,
        populationEstimate: currentLocale === "ko"
            ? `異붿젙 洹쒕え: ${locationLabel} 湲곗? ?대떦 ?멸렇癒쇳듃 ??[AI媛 怨듦났 ?듦퀎 湲곕컲?쇰줈 異붿젙]紐? ?꾩껜 ?멸뎄 ?鍮???[鍮꾩쑉]% (?듦퀎 異쒖쿂媛 ?녿뒗 寃쎌슦 異붾줎 洹쇨굅瑜?蹂묎린)`
            : `Estimated size: approximately [AI estimates from public statistics] in ${locationLabel}, roughly [ratio]% of total population`,
        behaviors: [
            currentLocale === "ko" ? `${exploreGrounding.functionalJob}??以꾩뿬二쇰뒗 ?붿빟??UX??諛섏쓳??媛?μ꽦???쎈땲??` : `Likely to respond well to UX that reduces ${exploreGrounding.functionalJob}.`,
            currentLocale === "ko" ? `${exploreGrounding.primaryValue}泥섎읆 寃곌낵媛 ?좊챸??硫붿떆吏?????ш쾶 諛섏쓳?⑸땲??` : `Responds more strongly to messages where outcomes like ${exploreGrounding.primaryValue} are clear.`
        ],
        assumption: currentLocale === "ko" ? `媛?? 紐⑤뱺 湲곌린瑜?蹂댁쑀?섏? ?딆븘??Entry ?섏?????湲곕컲 ?먮룞?붾줈 ${exploreGrounding.primaryValue} 寃쏀뿕??癒쇱? ?쒖옉?????덉뒿?덈떎.` : `Assumption: even without every device, an entry-level app automation can start the ${exploreGrounding.primaryValue} experience.`
    };
}

function buildCampaignTiming(intent, exploreGrounding) {
    const byMission = {
        Save: [
            currentLocale === "ko" ? `?됰궃諛?遺?댁씠 而ㅼ????쒖쫵: ${exploreGrounding.primaryValue} 硫붿떆吏媛 媛???좊챸?댁쭛?덈떎.` : `High heating or cooling seasons: ${exploreGrounding.primaryValue} becomes most legible.`,
            currentLocale === "ko" ? "?붽컙 ?붽툑??泥닿컧?섎뒗 ?쒖젏: ?먮꼫吏 由ы룷?몄? 猷⑦떞 硫붿떆吏???ㅻ뱷?μ씠 ?믪븘吏묐땲??" : "When bills become visible: energy reports and routine messaging gain traction.",
            currentLocale === "ko" ? "?댁궗 ?먮뒗 ??湲곌린 ?ㅼ튂 吏곹썑: ?덇컧 猷⑦떞???쒖옉?섍린 媛??醫뗭? ??대컢?낅땲??" : "Right after moving or adding devices: a strong moment to start savings routines."
        ],
        Care: [
            currentLocale === "ko" ? `?쇨렐?대굹 ?몄텧????븘吏???쒓린: ${exploreGrounding.emotionalJob} 硫붿떆吏媛 ???ш쾶 ?묐룞?⑸땲??` : `When overtime and time away rise: ${exploreGrounding.emotionalJob} becomes more resonant.`,
            currentLocale === "ko" ? "?뚮큵 遺?댁씠 而ㅼ????앺솢 ?꾪솚湲? 耳?댁? ?덉떖 硫붿떆吏???꾩슂?깆씠 ?믪븘吏묐땲??" : "During care-heavy life transitions: care and reassurance messaging gains relevance.",
            currentLocale === "ko" ? "??泥?吏꾩엯 吏곹썑: ??踰덉쓽 ?덉떖 寃쏀뿕??鍮좊Ⅴ寃?蹂댁뿬二쇨린 醫뗭뒿?덈떎." : "Right after first app entry: a good moment to demonstrate reassurance quickly."
        ],
        Secure: [
            currentLocale === "ko" ? "?κ린媛?遺?щ굹 ?ы뻾 以鍮??쒖젏: 蹂댁븞怨??ㅼ떆媛????硫붿떆吏媛 媛뺥븯寃??쏀옓?덈떎." : "Before travel or longer absence: security and real-time response messages land strongly.",
            currentLocale === "ko" ? "?쇱옄 ?щ뒗 ?앺솢 ?⑦꽩???뺤갑???쒖젏: ?곸떆 紐⑤땲?곕쭅 遺???꾪솕 硫붿떆吏媛 ?ㅻ뱷???덉뒿?덈떎." : "Once solo-living routines settle: reducing monitoring burden becomes persuasive.",
            currentLocale === "ko" ? "?쇱꽌/移대찓???ㅼ튂 吏곹썑: 蹂댄샇 泥닿컧 媛移섎? 媛??吏곸젒?곸쑝濡?蹂댁뿬以????덉뒿?덈떎." : "Right after adding sensors or cameras: the protective value is easiest to demonstrate."
        ]
    };
    return byMission[intent.missionBucket] || [
        currentLocale === "ko" ? `猷⑦떞??諛붾뚮뒗 ?쒓린: ${exploreGrounding.primaryValue} 硫붿떆吏媛 ?덈∼寃??쏀옓?덈떎.` : `When routines change: ${exploreGrounding.primaryValue} can be freshly understood.`,
        currentLocale === "ko" ? "?좉퇋 湲곌린 異붽? 吏곹썑: ?곌껐 媛移섍? 媛??吏곴??곸쑝濡?泥닿컧?⑸땲??" : "Right after adding a device: connected value feels most intuitive.",
        currentLocale === "ko" ? "諛섎났 ?ъ슜???앷린湲??쒖옉?섎뒗 ?쒖젏: 硫붿떆吏瑜??듦???媛移섎줈 ?뺤옣?섍린 醫뗭뒿?덈떎." : "Once repeat use begins: a good time to extend the message into habit value."
    ];
}

function buildDeviceGuide(country, deviceDecision, services) {
    const countryName = getCountryName(country.countryCode);
    const serviceName = getServiceLabel(services[0]);
    return {
        available: [
            currentLocale === "ko" ? `[?뺤젙] ${countryName} 湲곗? ?쒖슜 媛??移댄뀒怨좊━? ?곌껐 ?쒕굹由ъ삤瑜??곗꽑 諛섏쁺?⑸땲??` : `[Confirmed] Prioritize categories and connected scenarios available in ${countryName}.`,
            currentLocale === "ko" ? `???湲곗? 湲곌린: ${deviceDecision.final.modelName}` : `Representative anchor device: ${deviceDecision.final.modelName}`,
            currentLocale === "ko" ? "[泥댄겕 ?ъ씤?? ?ㅼ젣 ?먮ℓ 紐⑤뜽/SKU???쒖젏???곕씪 蹂?숇맆 ???덉뼱 理쒖쥌 ?뺤씤???꾩슂?⑸땲??" : "[Check point] Final retail model and SKU availability should be confirmed at launch."
        ],
        preparation: currentLocale === "ko"
            ? [
                "Wi-Fi ?섍꼍 ?뺤씤: 2.4GHz Wi-Fi媛 ?덉젙?곸쑝濡??곌껐?섏뼱 ?덈뒗吏 ?뺤씤?⑸땲??(5GHz留?吏?먰븯??怨듭쑀湲곕뒗 ?ㅼ젙 ?꾩슂).",
                "?쇱꽦 怨꾩젙 以鍮? account.samsung.com?먯꽌 怨꾩젙???놁쑝硫?癒쇱? ?앹꽦?⑸땲??",
                "SmartThings ???ㅼ튂: Galaxy Store ?먮뒗 App Store?먯꽌 'SmartThings'瑜?寃?됲빐 ?ㅼ튂?⑸땲??",
                "湲곌린 ?꾩썝: ?곌껐??湲곌린???꾩썝??耳쒓퀬 珥덇린 ?ㅼ젙(怨듭옣 珥덇린?????꾨즺???곹깭?ъ빞 ?⑸땲??"
            ]
            : [
                "Wi-Fi check: Ensure a stable 2.4GHz Wi-Fi connection is available.",
                "Samsung account: Create one at account.samsung.com if you don't have one.",
                "SmartThings app: Install from Galaxy Store or App Store.",
                "Device power: Turn on the device and complete its initial factory setup."
            ],
        steps: currentLocale === "ko"
            ? [
                "1?④퀎: SmartThings ?깆쓣 ?닿퀬 ?쇱꽦 怨꾩젙?쇰줈 濡쒓렇?명빀?덈떎.",
                "2?④퀎: ?섎떒??'+' 踰꾪듉 ??'湲곌린 異붽?'瑜??뚮윭 ??湲곌린瑜?寃?됲빀?덈떎.",
                `3?④퀎: '吏?Home)'???놁쑝硫??먮룞?쇰줈 ?앹꽦?⑸땲?? 諛??대쫫(嫄곗떎, 移⑥떎 ????吏?뺥빐 湲곌린瑜?諛곗튂?⑸땲??`,
                `4?④퀎: ?붾㈃ ?덈궡???곕씪 ${deviceDecision.final.modelName}??Wi-Fi???곌껐?⑸땲?? 湲곌린 ?붾㈃???몄쬆 肄붾뱶媛 ?⑤㈃ ?깆뿉 ?낅젰?⑸땲??`,
                "5?④퀎: ?곌껐 ?꾨즺 ??湲곌린 移대뱶媛 ??쒕낫?쒖뿉 ?섑??섎뒗吏 ?뺤씤?⑸땲?? ?쒖뼱 踰꾪듉???뚮윭 ?뺤긽 ?숈옉???뚯뒪?명빀?덈떎.",
                `6?④퀎: '?먮룞?? ????'+' ??'${serviceName}' ?먮뒗 異붿쿇 猷⑦떞 移대뱶瑜??쒖꽦?뷀빀?덈떎. 議곌굔(?쒓컙, ?쇱꽌 ??怨??숈옉(湲곌린 耳쒓린/?꾧린)???ㅼ젙?⑸땲??`,
                "7?④퀎: '?뚮┝' ?ㅼ젙?먯꽌 ?먰븯???뚮┝??耳쒓퀬, 媛議?援ъ꽦?먯쓣 '硫ㅻ쾭 珥덈?'濡?異붽??⑸땲??",
                "8?④퀎: 2~3?쇨컙 ?먮룞?붽? ?뺤긽 ?ㅽ뻾?섎뒗吏 ?뺤씤?⑸땲?? 臾몄젣媛 ?덉쑝硫?湲곌린 ?곸꽭 ??'?곌껐 ?곹깭'?먯꽌 ?ъ뿰寃고븯嫄곕굹 ?뚯썾???낅뜲?댄듃瑜?吏꾪뻾?⑸땲??",
                "9?④퀎: ?먯＜ ?곕뒗 ?λ㈃(猷⑦떞)????ν빐 諛섎났 ?ъ슜?섍퀬, 異붽? 湲곌린瑜??곌껐???뺤옣?⑸땲??"
            ]
            : [
                "Step 1: Open SmartThings and sign in with your Samsung account.",
                "Step 2: Tap '+' ??'Add device' to search for a new device.",
                "Step 3: Create a Home if one doesn't exist. Assign rooms (living room, bedroom, etc.).",
                `Step 4: Follow on-screen instructions to connect ${deviceDecision.final.modelName} to Wi-Fi.`,
                "Step 5: Verify the device card appears on the dashboard. Test basic controls.",
                `Step 6: Go to 'Automations' ??'+' ??activate '${serviceName}' or a recommended routine.`,
                "Step 7: Enable notifications and invite family members.",
                "Step 8: Monitor for 2-3 days. Reconnect or update firmware if issues arise.",
                "Step 9: Save frequently used scenes and expand with additional devices."
            ],
        troubleshooting: currentLocale === "ko"
            ? [
                "湲곌린媛 寃?됰릺吏 ?딆쓣 ?? 湲곌린瑜?怨듭옣 珥덇린?뷀븯怨? ?깃낵 媛숈? Wi-Fi???곌껐?섏뼱 ?덈뒗吏 ?뺤씤?⑸땲??",
                "?곌껐???먯＜ ?딄만 ?? 怨듭쑀湲곗? 湲곌린 ?ъ씠 嫄곕━瑜??뺤씤?섍퀬, ?뚯썾?대? 理쒖떊?쇰줈 ?낅뜲?댄듃?⑸땲??",
                "?먮룞?붽? ?ㅽ뻾?섏? ?딆쓣 ?? 議곌굔(?쒓컙, ?꾩튂)???щ컮瑜몄?, 湲곌린媛 ?⑤씪???곹깭?몄? ?뺤씤?⑸땲??"
            ]
            : [
                "Device not found: Factory reset the device and check it's on the same Wi-Fi.",
                "Frequent disconnection: Check distance to router and update firmware.",
                "Automation not running: Verify trigger conditions and device online status."
            ]
    };
}

function renderScenario(payload) {
    // selectionSummary媛 ?덉쑝硫?援ъ“?붾맂 fallback output ?쒕룄
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
        { phase: "STEP 1", label: "Explore ?쒕굹由ъ삤 ?먮룞 ?좊퀎", icon: "??,
          desc: "?낅젰??援??/?꾩떆 + ?寃?+ 湲곌린 議곌굔?쇰줈 Explore Contents?먯꽌 <strong>寃利앸맂 ?쒕굹由ъ삤</strong>瑜??먮룞 留ㅼ묶?⑸땲??",
          helper: "Build ?대┃ ??Explore v1.0(183媛? + v2.0(87媛? ?쒕굹由ъ삤瑜??먯닔?뷀븯???곸쐞 5媛쒕? ?좊퀎?⑸땲?? ???좏깮?섏뿀?붿?, ?대뼡 ?낅젰??諛섏쁺?섏뿀?붿?媛 ?④퍡 ?쒖떆?⑸땲??\n?낅젰??援??/?꾩떆???꾩떆 ?꾨줈??怨좊젮?ы빆???쒕굹由ъ삤 異붿쿇??諛섏쁺?⑸땲??",
          items: [
              { num: "A", title: "?좏깮 洹쇨굅 移대뱶", sub: "?대뼡 ?쒕굹由ъ삤媛, ???좏깮?섏뿀?붿?" },
              { num: "B", title: "?낅젰 諛섏쁺 ?뺤씤", sub: "???낅젰???대뵒??諛섏쁺?섏뿀?붿? ?쒕늿?? },
              { num: "C", title: "媛移?異??쒖떆", sub: "Care / Secure / Save / Play 以??대뼡 媛移섏씤吏" }
          ] },
        { phase: "STEP 2", label: "紐⑹쟻蹂?蹂??寃곌낵臾??앹꽦", icon: "?쨼",
          desc: "?좏깮??Explore ?쒕굹由ъ삤瑜?諛뷀깢?쇰줈, AI媛 <strong>留덉??곗슜</strong>怨?<strong>?쇰컲 ?ъ슜?먯슜</strong> ??媛吏 ?ㅽ뻾??寃곌낵臾쇱쓣 ?앹꽦?⑸땲??",
          items: [
              { num: "?뱼", title: "留덉??곗슜", sub: "移댄뵾 ?듭뀡, 梨꾨꼸 ?꾨왂, ?源??곹빀?? ??븷蹂??ㅽ뻾 諛⑺뼢" },
              { num: "?룧", title: "?쇰컲 ?ъ슜?먯슜", sub: "?닿쾶 萸??댁＜?붿?, ?꾩슂 湲곌린, ?ㅼ젙 諛⑸쾿, 二쇱쓽?ы빆, ??? },
              { num: "?뱤", title: "媛移?+ ?몄궗?댄듃", sub: "媛뺤“ 媛移? 吏???몄궗?댄듃(O-I-I), ?뺤젙/異붾줎 援щ텇" }
          ],
          helper: "媛숈? Explore ?쒕굹由ъ삤瑜?諛뷀깢?쇰줈 ?섎릺, ?쒖슜 紐⑹쟻???곕씪 ?쒗쁽怨??뺣낫 援ъ“媛 ?ㅻⅤ寃??섏샃?덈떎. ??쑝濡??꾪솚?섏뿬 ?뺤씤?????덉뒿?덈떎." },
        { phase: "STEP 3", label: "吏곷Т蹂??쒖슜 寃곌낵臾??좏깮", icon: "?뱥",
          desc: "罹좏럹??硫붿떆吏, 由ы뀒???꾩옣?? ?룹뺨 肄섑뀗痢? CRM ?쒖슜?? ?쒖쫵 ?곌퀎?? 蹂닿퀬???붿빟 以??꾩슂??寃껊쭔 怨⑤씪 異붽? ?앹꽦?⑸땲??",
          outputCards: [
              { icon: "?뱽", label: "罹좏럹??硫붿떆吏" },
              { icon: "?룷", label: "由ы뀒???꾩옣?? },
              { icon: "?뙋", label: "?룹뺨 肄섑뀗痢? },
              { icon: "?벁", label: "CRM ?쒖슜?? },
              { icon: "?뱟", label: "?쒖쫵 ?곌퀎?? },
              { icon: "?뱤", label: "蹂닿퀬???붿빟" }
          ],
          helper: "?꾩슂??寃곌낵臾쇰쭔 怨⑤씪 異붽? ?앹꽦?????덉뒿?덈떎. 蹂듭닔 ?좏깮 媛??",
          note: "吏곷Т瑜?誘몃━ 怨좊Ⅴ吏 ?딆븘???⑸땲?? }
    ] : [
        { phase: "STEP 1", label: "Auto-select from Explore scenarios", icon: "??,
          desc: "Automatically match <strong>verified scenarios</strong> from Explore Contents based on your country, target, and device selections.",
          helper: "On Build, scenarios from Explore v1.0 (183) + v2.0 (87) are scored and top 5 are selected. You'll see why each was chosen and which inputs were reflected.\nCity profile insights for your selected country/city are factored into scenario recommendations.",
          items: [
              { num: "A", title: "Selection Basis", sub: "Which scenario was chosen and why" },
              { num: "B", title: "Input Reflection", sub: "See exactly where your inputs are reflected" },
              { num: "C", title: "Value Axis", sub: "Care / Secure / Save / Play identification" }
          ] },
        { phase: "STEP 2", label: "Purpose-driven transformation", icon: "?쨼",
          desc: "Based on the selected Explore scenario, AI generates two actionable outputs: <strong>Marketer</strong> and <strong>Consumer</strong> versions.",
          items: [
              { num: "?뱼", title: "For Marketers", sub: "Copy options, channel strategy, target fit, role-specific direction" },
              { num: "?룧", title: "For Consumers", sub: "What it does, required devices, setup steps, cautions, alternatives" },
              { num: "?뱤", title: "Values + Insight", sub: "Value highlights, regional O-I-I insight, confirmed vs inferred" }
          ],
          helper: "Same Explore scenario, different expression and structure depending on purpose. Switch between tabs to view." },
        { phase: "STEP 3", label: "Role-specific output selection", icon: "?뱥",
          desc: "Choose from campaign messaging, retail execution, dotcom content, CRM, seasonal tie-in, or executive summary ??generate only what you need.",
          outputCards: [
              { icon: "?뱽", label: "Campaign" },
              { icon: "?룷", label: "Retail" },
              { icon: "?뙋", label: "Dotcom" },
              { icon: "?벁", label: "CRM" },
              { icon: "?뱟", label: "Seasonal" },
              { icon: "?뱤", label: "Summary" }
          ],
          helper: "Pick only the outputs you need. Multi-select available!",
          note: "No need to choose a role upfront" }
    ];

    const guideText = isKo
        ? "?대뼡 寃곌낵臾쇱씠 ?섏삤?붿? 沅곴툑?섎㈃ ?뚮윭蹂댁꽭??
        : "Tap to see what outputs you'll get";
    const guideLabel = isKo
        ? "寃곌낵臾??앹꽦 怨쇱젙怨??뺤떇? ?ㅼ쓬 ?댁슜??李몄“?섏꽭??!"
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
                <span class="preview-toggle-icon">?뱥</span>
                <span class="preview-toggle-text">
                    <strong>${escapeHtml(guideLabel)}</strong>
                    <span>${escapeHtml(guideText)}</span>
                </span>
                <span class="preview-toggle-chevron">??/span>
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
            if (chevron) chevron.textContent = isOpen ? "?? : "??;
        });
    }
}

function buildParentStory(payload) {
    const who = compactDescriptor(payload.state?.segment || payload.scenarioMeta?.selectedSegment || "", 4);
    const where = [payload.scenarioMeta?.countryName, payload.scenarioMeta?.city].filter(Boolean).join(" / ");
    const need = compactPurpose(payload.scenarioMeta?.purpose || payload.exploreGrounding?.functionalJob || "");
    return currentLocale === "ko"
        ? `${where}??${who}??"${need}" 媛숈? 諛섎났 ?쒓컙?먯꽌 遺?댁쓣 以꾩씠怨? 利됱떆 泥닿컧?섎뒗 ?⑥슜???먰빀?덈떎.`
        : `${who} in ${where} seeks immediate, felt utility in recurring moments like "${need}".`;
}

function compactDescriptor(text, maxItems = 4) {
    const cleaned = String(text || "")
        .replace(/Reduce recurring friction in everyday moments for/gi, "")
        .replace(/\s+/g, " ")
        .trim();
    const tokens = cleaned
        .split(/[\/,|]|쨌/)
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item, idx, arr) => arr.indexOf(item) === idx);
    if (!tokens.length) return cleaned;
    return tokens.slice(0, maxItems).join(" / ");
}

function compactPurpose(text) {
    const raw = String(text || "").trim();
    if (!raw) return currentLocale === "ko" ? "諛섎났?섎뒗 ?쇱긽 遺덊렪??以꾩씠怨??띠쓣 ?? : "reducing recurring daily friction";
    if (/^reduce recurring friction in everyday moments for/i.test(raw)) {
        return currentLocale === "ko" ? "諛섎났?섎뒗 ?쇱긽 遺덊렪??以꾩씠???쒓컙" : "reducing recurring daily friction moments";
    }
    return raw.length > 140 ? `${raw.slice(0, 137)}...` : raw;
}

function buildReflectedValues(payload) {
    const mission = String(payload.scenarioMeta?.missionBucket || "").toLowerCase();
    const primary = String(payload.exploreGrounding?.primaryValue || "").toLowerCase();
    const values = [
        { key: "care", ko: "?뚮큵/?덉떖", en: "Care/Reassurance", hit: mission === "care" || primary.includes("reassurance") || primary.includes("care") },
        { key: "save", ko: "?덇컧/?듭젣", en: "Savings/Control", hit: mission === "save" || primary.includes("saving") || primary.includes("control") },
        { key: "ease", ko: "?몄쓽/?⑥쑉", en: "Convenience/Efficiency", hit: mission === "discover" || mission === "play" || primary.includes("lighter") || primary.includes("comfort") },
        { key: "secure", ko: "?좊ː/蹂댁븞", en: "Trust/Security", hit: mission === "secure" || primary.includes("security") || primary.includes("response") }
    ];
    return values.map((item) => `${item.hit ? "?? : "쨌"} ${currentLocale === "ko" ? item.ko : item.en}`);
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
        lines.push(currentLocale === "ko" ? "?ㅽ뻾 ?꾩젣? 梨꾨꼸蹂?硫붿떆吏瑜??④퍡 ?먭??⑸땲??" : "Validate assumptions together with channel-specific messaging.");
    }
    return lines.slice(0, 6);
}

// Explore Contents v2.0 湲곕컲 20媛??쒕굹由ъ삤 (12? ?ㅼ썙???꾩껜 而ㅻ쾭)
const EXPLORE_SCENARIOS = [
    // ?? SAVE ENERGY ??????????????????????????????????????????????
    {
        id: "save-energy-tips",
        title: "Tips for saving energy at home",
        tags: ["Save energy", "?먮꼫吏 ?덉빟", "Keep your home safe"],
        devices: ["?먯뼱而?, "?명긽湲?, "嫄댁“湲?, "?ㅻ쭏???뚮윭洹?],
        missionBucket: "Save",
        content: {
            ko: {
                pain: "?꾧린?붽툑 ?꾩쭊?몄? ?湲곗쟾????퉬媛 嫄깆젙?섏?留? ?몄텧???뚮쭏??湲곌린瑜??섎굹???꾨뒗 寃껋씠 踰덇굅濡?퀬 ?먭씀 ?볦묩?덈떎.",
                solution: "SmartThings AI Energy Mode瑜?耳쒕㈃ ?붽컙 紐⑺몴 ?붽툑??留욎떠 媛?꾩쓽 ?먮꼫吏 ?뚮퉬瑜??먮룞 理쒖쟻?뷀빀?덈떎. 吏묒쓣 鍮꾩썱????耳쒖쭊 湲곌린瑜?媛먯???'紐⑤몢 ?꾧린' ??踰덉쑝濡??꾨젰??李⑤떒?????덉뒿?덈떎.",
                benefit: "遺덊븘?뷀븳 ?먮꼫吏 ??퉬瑜?以꾩뿬 ?꾧린?붽툑???덇컧?섍퀬, ?ㅻ쭏???뚮윭洹몃줈 ?湲곗쟾?κ퉴吏 李⑤떒??移쒗솚寃??앺솢??媛?ν빐吏묐땲??"
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
        tags: ["Save energy", "?먮꼫吏 ?덉빟", "Control lights", "Easily control your lights"],
        devices: ["?됱옣怨?, "?먯뼱而?, "?명긽湲?, "嫄댁“湲?, "議곕챸"],
        missionBucket: "Save",
        content: {
            ko: {
                pain: "?ъ슜?먭? ?몄??섏? 紐삵븯???ъ씠 ?덉뼱?섍????꾨젰怨?蹂듭옟???덉쟾 ?ㅼ젙??踰덇굅濡쒖????볦엯?덈떎.",
                solution: "媛?꾩젣?덉씠 ?ㅼ뒪濡??먮꼫吏 ?ъ슜?됱쓣 紐⑤땲?곕쭅?섍퀬 ?쇳겕 ?쒓컙?瑜??쇳빐 AI ?덉빟 ?뚭퀬由ъ쬁?쇰줈 ?묐룞?⑸땲?? ?명긽湲곕뒗 臾??⑤룄瑜???텛怨? TV??二쇰? 議곕룄??留욎떠 諛앷린瑜??먮룞 議곗젅?⑸땲??",
                benefit: "蹂꾨룄???좉꼍???곗? ?딆븘??留ㅻ떖 怨좎??쒖뿉???ㅼ쭏?곸씤 鍮꾩슜 ?덇컧 ?④낵瑜?泥닿컧?섍쾶 ?⑸땲??"
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
        tags: ["Save energy", "?먮꼫吏 ?덉빟", "Help with chores"],
        devices: ["?명긽湲?, "嫄댁“湲?, "?명긽湲?嫄댁“湲?],
        missionBucket: "Save",
        content: {
            ko: {
                pain: "留ㅼ씪 ?щ씪吏???명긽臾?醫낅쪟? ?묒뿉 留욎떠 理쒖쟻 肄붿뒪瑜?怨좊Ⅴ??寃껋씠 踰덇굅濡?퀬, ?룰컧 ?먯긽?대굹 ?먮꼫吏 ??퉬媛 嫄깆젙?⑸땲??",
                solution: "AI媛 ?명긽臾쇱쓽 醫낅쪟, 臾닿쾶, ?ㅼ뿼?꾨? ?먮룞?쇰줈 ?뺤씤???명긽遺??嫄댁“源뚯? 留욎땄 肄붿뒪瑜??ㅼ젙?⑸땲?? ?몄젣??臾닿쾶??留욎떠 ?먮룞 ?ъ엯?섎ŉ, ?먮꼫吏媛 ??댄븳 ?쒓컙???留욎떠 ?묐룞???덉빟?????덉뒿?덈떎.",
                benefit: "?룰컧 ?먯긽怨??먮꼫吏 ??퉬瑜??숈떆??以꾩씠怨? 誘몄꽭 ?뚮씪?ㅽ떛 ?媛?肄붿뒪濡??섍꼍 遺?닿퉴吏 ??텧 ???덉뒿?덈떎."
            },
            en: {
                pain: "Choosing the right wash cycle for changing laundry every day is tedious, and concerns about fabric damage or energy waste add up.",
                solution: "AI automatically checks laundry type, weight, and soil level to set a custom wash-to-dry cycle. Detergent is auto-dispensed by load weight, and operation can be scheduled for off-peak energy hours.",
                benefit: "Reduces fabric wear and energy waste simultaneously, with a microplastic-reduction cycle to lower your environmental footprint."
            }
        }
    },
    // ?? KEEP THE AIR FRESH ????????????????????????????????????????
    {
        id: "keep-air-fresh",
        title: "Keep the air fresh",
        tags: ["Air fresh", "Keep the air fresh"],
        devices: ["?먯뼱而?, "怨듦린泥?젙湲?],
        missionBucket: "Save",
        content: {
            ko: {
                pain: "?몄텧 以??ㅻ궡 怨듦린吏덉씠 ?섎튌?몃룄 ???섍? ?녾퀬, 洹媛 ?꾩뿉???곹븳 怨듦린瑜?留덉＜?섍쾶 ?⑸땲??",
                solution: "SmartThings Air Care媛 ?ㅼ쇅 怨듦린吏덉쓣 ?ㅼ떆媛꾩쑝濡?遺꾩꽍???섍린 理쒖쟻 ??대컢??議곕챸 ?됱긽?쇰줈 ?뚮젮以띾땲?? 怨듦린泥?젙湲곗? ?먯뼱而⑥씠 ?먮룞?쇰줈 ?곕룞?섏뼱 ?ㅻ궡 怨듦린瑜?苡뚯쟻?섍쾶 ?좎??⑸땲??",
                benefit: "?몄젣 ?섍린?좎? ?쇱씪???뺤씤?섏? ?딆븘??吏???怨듦린媛 ??긽 源⑤걮?섍쾶 ?좎??섏뼱 媛議?紐⑤몢??嫄닿컯??吏?????덉뒿?덈떎."
            },
            en: {
                pain: "Air quality worsens while you're out, and you only notice when you return home to stale air.",
                solution: "SmartThings Air Care analyzes outdoor air quality in real time and signals the best ventilation timing via lighting color. The air purifier and AC work together automatically to keep indoor air fresh.",
                benefit: "No need to check when to ventilate?봸our home air stays clean at all times, protecting the health of your whole family."
            }
        }
    },
    {
        id: "welcome-to-scandinavia",
        title: "Welcome to Scandinavia",
        tags: ["Air fresh", "Keep the air fresh", "Save energy", "?먮꼫吏 ?덉빟", "Help with chores"],
        devices: ["?먯뼱而?, "?명긽湲?, "嫄댁“湲?],
        missionBucket: "Save",
        content: {
            ko: {
                pain: "苡뚯쟻??怨듦린吏덇낵 ?먮꼫吏 ?⑥쑉, 吏묒븞???먮룞?붾? 紐⑤몢 梨숆린?ㅻ㈃ ?щ윭 湲곌린瑜??곕줈?곕줈 ?ㅼ젙?댁빞 ?댁꽌 蹂듭옟?⑸땲??",
                solution: "遺곸쑀???쇱씠?꾩뒪??쇱뿉???곴컧??諛쏆? SmartThings 猷⑦떞??怨듦린泥?젙湲? ?먯뼱而? ?명긽湲곕? ?먮꼫吏 ?⑥쑉???믪? ?쒓컙????듯빀 ?댁쁺?⑸땲??",
                benefit: "源⑤걮??怨듦린? ??? ?꾧린?붽툑, ?먮룞?붾맂 媛?ш퉴吏 ??踰덉뿉 愿由щ릺???ъ쑀 ?덈뒗 ?쇱긽??利먭만 ???덉뒿?덈떎."
            },
            en: {
                pain: "Managing air quality, energy efficiency, and home chore automation separately requires juggling multiple settings across devices.",
                solution: "A SmartThings routine inspired by Nordic Hygge lifestyle integrates the air purifier, AC, and washer, running them automatically at energy-efficient times.",
                benefit: "Clean air, lower electricity bills, and automated chores all managed together?봣reeing up your time for a more relaxed daily life."
            }
        }
    },
    // ?? CONTROL LIGHTS ????????????????????????????????????????????
    {
        id: "lights-as-alerts",
        title: "Your lights can alert you",
        tags: ["Control lights", "Easily control your lights", "Help with chores", "Air fresh", "Keep the air fresh", "Sleep well"],
        devices: ["議곕챸"],
        missionBucket: "Discover",
        content: {
            ko: {
                pain: "?명긽 ?꾨즺 ?뚮┝ ?뚮━瑜??볦튂嫄곕굹, 怨듦린吏덉씠 ?섏걽 ???곕줈 ?깆쓣 ?댁뼱 ?뺤씤?댁빞 ?섎뒗 踰덇굅濡쒖????덉뒿?덈떎.",
                solution: "SmartThings媛 ?명긽 ?꾨즺 ??嫄곗떎 議곕챸???뱀깋?쇰줈 源쒕묀?닿퀬, 怨듦린吏덉씠 ?섏걽 ??遺됱?鍮쏆쑝濡??뚮┰?덈떎. ?꾩뼱踰⑥씠 ?몃━硫?議곕챸??諛섏쓳???뚮━瑜??볦퀜??諛⑸Ц?먮? ?뺤씤?????덉뒿?덈떎.",
                benefit: "?뚮━???섏〈?섏? ?딄퀬??議곕챸留뚯쑝濡?以묒슂???앺솢 ?뚮┝???볦튂吏 ?딄쾶 ?섏뼱 ?쇱긽???⑥뵮 ?몃━?댁쭛?덈떎."
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
        devices: ["議곕챸"],
        missionBucket: "Discover",
        content: {
            ko: {
                pain: "?몄텧 ??吏묒븞 怨녠납??遺덉쓣 ?꾨윭 ?ㅻ땲嫄곕굹, 諛ㅼ뿉 ?붿옣??媛硫댁꽌 議곕챸 ?ㅼ쐞移섎? 李얜뒗 遺덊렪?⑥씠 諛섎났?⑸땲??",
                solution: "SmartThings? ?ㅻ쭏??議곕챸???곕룞?섎㈃ ?대뵒?쒕뱺 議곕챸???쒖뼱?섍퀬 諛앷린쨌?됱삩?꾨? 議곗젅???먰븯??遺꾩쐞湲곕? 留뚮뱾 ???덉뒿?덈떎. ?ъ떎 媛먯? ?쇱꽌? ?곌껐?섎㈃ ?吏곸엫 媛먯? ??議곕챸???먮룞?쇰줈 耳쒖쭛?덈떎.",
                benefit: "?섎㈃ 以??붿옣?ㅻ룄 ?덉쟾?섍쾶, ?닿렐 ???꾨벑 嫄깆젙 ?놁씠?붿“紐??섎굹濡??앺솢 ?몄쓽媛 ?ш쾶 ?щ씪吏묐땲??"
            },
            en: {
                pain: "Walking around to turn off lights before leaving, or fumbling for a switch on a dark midnight bathroom trip, is a daily frustration.",
                solution: "SmartThings with smart lighting lets you control any light remotely and adjust brightness and color temperature for the perfect ambience. Motion sensors turn lights on automatically when movement is detected.",
                benefit: "Safe midnight trips, no more worrying about lights left on?봮ne smart lighting setup transforms daily convenience."
            }
        }
    },
    // ?? HELP WITH CHORES ??????????????????????????????????????????
    {
        id: "ai-handles-housework",
        title: "Let AI handle the housework",
        tags: ["Help with chores"],
        devices: ["?명긽湲?, "嫄댁“湲?, "?명긽湲?嫄댁“湲?, "濡쒕큸泥?냼湲?],
        missionBucket: "Save",
        content: {
            ko: {
                pain: "留ㅼ씪 ?щ씪吏??吏묒븞?쇱쓣 吏곸젒 梨숆린??蹂대㈃ ?쒓컙怨??먮꼫吏媛 怨꾩냽 ?뚮え?섍퀬, 媛???ъ슜踰뺤씠 ?룰컝由??뚮룄 留롮뒿?덈떎.",
                solution: "AI媛 ?명긽臾?醫낅쪟? 臾닿쾶瑜?媛먯???理쒖쟻 肄붿뒪瑜??먮룞 ?ㅼ젙?⑸땲?? Bixby?먭쾶 '?섍굔 肄붿뒪 ?ㅼ젙?댁쨾'?쇨퀬 留먰븯嫄곕굹, '?명긽湲?諛곗닔 ?꾪꽣 泥?냼 諛⑸쾿'??臾쇱뼱蹂대㈃ 諛붾줈 ?듭쓣 諛쏆쓣 ???덉뒿?덈떎.",
                benefit: "媛?꾩쓣 ?????쒖슜?섍쾶 ?섎㈃??吏묒븞?쇱쓽 ?쒓컙怨??몃젰???덉뿉 ?꾧쾶 以꾧퀬, 愿由??ㅽ듃?덉뒪???④퍡 以꾩뼱??땲??"
            },
            en: {
                pain: "Keeping up with daily housework drains time and energy, and it's easy to get confused about the right settings for each appliance.",
                solution: "AI detects laundry type and weight to auto-set the optimal cycle. Tell Bixby 'set the towel cycle' or ask 'how do I clean the drain filter?'?봞nd get an instant answer.",
                benefit: "Better appliance use reduces the time and effort spent on chores significantly, along with the stress of managing them."
            }
        }
    },
    {
        id: "smart-home-party",
        title: "Hosting a smart home party",
        tags: ["Help with chores", "Enhanced mood"],
        devices: ["議곕챸", "?ㅽ뵾而?, "TV", "濡쒕큸泥?냼湲?],
        missionBucket: "Play",
        content: {
            ko: {
                pain: "?먮떂 留욎씠 以鍮꾨????뚰떚 遺꾩쐞湲??곗텧, ?뚰떚 ??泥?냼源뚯? 紐⑤뱺 寃껋쓣 ?쇱옄 梨숆린?ㅻ㈃ 吏移⑸땲??",
                solution: "?뚰떚 猷⑦떞???ㅽ뻾?섎㈃ 議곕챸???뚰떚 紐⑤뱶濡?諛붾뚭퀬 ?ㅽ뵾而ㅼ뿉???뚯븙???섎윭?섏샃?덈떎. ?뚰떚媛 ?앸굹硫?濡쒕큸泥?냼湲곌? ?먮룞?쇰줈 泥?냼瑜??쒖옉???룹젙由?嫄깆젙???쒖뼱以띾땲??",
                benefit: "?뚰떚 以鍮꾩? 留덈Т由?紐⑤몢 ?먮룞?붾릺???먮떂 ?묐??먮쭔 吏묒쨷?????덇퀬, ?쇰줈???룹젙由?嫄깆젙???щ씪吏묐땲??"
            },
            en: {
                pain: "Handling party setup, ambiance, and cleanup single-handedly is exhausting and takes away from actually enjoying the event.",
                solution: "Running a party routine switches lights to party mode and starts music from the speaker. When the party ends, the robot vacuum automatically starts cleaning, taking care of itself.",
                benefit: "Party prep and cleanup are both automated, letting you focus entirely on your guests without dreading the aftermath."
            }
        }
    },
    // ?? KEEP YOUR HOME SAFE ???????????????????????????????????????
    {
        id: "keep-home-safe",
        title: "Keep your home safe anytime, anywhere",
        tags: ["Keep your home safe"],
        devices: ["?쇱꽌"],
        missionBucket: "Secure",
        content: {
            ko: {
                pain: "異쒖옣?대굹 ?ы뻾 以묒뿉 吏?蹂댁븞??嫄깆젙?섍퀬, ?앸같 遺꾩떎?대굹 ??꽑 諛⑸Ц?먭? ?좉꼍 ?곗엯?덈떎.",
                solution: "鍮꾨뵒???꾩뼱踰⑥씠 ?吏곸엫??媛먯??섎㈃ ?ㅻ쭏?명룿怨?TV???ㅼ떆媛??뚮┝怨??곸긽???앹뾽?⑸땲?? Knox Matrix 蹂댁븞 湲곗닠濡??ъ슜?먭? 洹媛?섎㈃ ?ㅻ궡 移대찓?쇨? ?먮룞?쇰줈 爰쇱졇 ?꾨씪?대쾭?쒓? 蹂댄샇?⑸땲??",
                benefit: "?대뵒?쒕뱺 吏??곹솴???ㅼ떆媛꾩쑝濡??뺤씤?섍퀬, 洹媛 ?쒖뿏 移대찓?쇨? ?먮룞 ?ㅽ봽?섏뼱 蹂댁븞怨??꾨씪?대쾭?쒕? ?숈떆??吏?????덉뒿?덈떎."
            },
            en: {
                pain: "Worrying about home security during business trips or vacations, and concerns about missed deliveries or unfamiliar visitors.",
                solution: "The video doorbell detects movement and pops up live alerts on your phone and TV. Knox Matrix technology automatically turns off indoor cameras when you arrive home, protecting your privacy.",
                benefit: "Monitor your home in real time from anywhere, with cameras auto-off on arrival?봲ecurity and privacy protected simultaneously."
            }
        }
    },
    {
        id: "knox-protection",
        title: "Help keep your home private and protected",
        tags: ["Keep your home safe"],
        devices: ["?쇱꽌", "TV"],
        missionBucket: "Secure",
        content: {
            ko: {
                pain: "?ㅻ쭏?명솃 湲곌린媛 留롮븘吏덉닔濡??댄궧 ?곕젮? 媛쒖씤?뺣낫 ?좎텧??嫄깆젙?⑸땲??",
                solution: "Samsung Knox Matrix媛 ?곌껐??紐⑤뱺 湲곌린瑜??꾨씪?대퉿 釉붾줉泥댁씤?쇰줈 臾띠뼱 ?곹샇 蹂댁븞 媛먯떆瑜??섑뻾?⑸땲?? 痍⑥빟??湲곌린媛 媛먯??섎㈃ 利됱떆 ?ㅽ듃?뚰겕?먯꽌 寃⑸━?쒗궢?덈떎. ?쇱꽦 AI 媛?꾩? ?낃퀎 理쒖큹 UL Solutions ?ㅼ씠?꾨が???깃툒???띾뱷?덉뒿?덈떎.",
                benefit: "湲곌린媛 ?섏뼱?좎닔濡?蹂댁븞??媛뺥빐吏???쇱꽦 ?앺깭怨??덉뿉?? ?댄궧 嫄깆젙 ?놁씠 ?ㅻ쭏?명솃??留덉쓬猿??뺤옣?????덉뒿?덈떎."
            },
            en: {
                pain: "As smart home devices multiply, concerns about hacking risks and personal data exposure grow alongside them.",
                solution: "Samsung Knox Matrix links all connected devices in a private blockchain for mutual security monitoring. Vulnerable devices are immediately isolated when detected. Samsung AI appliances hold the industry-first Diamond security rating from UL Solutions.",
                benefit: "The more devices you add, the stronger your security?봢xpand your smart home freely without hacking concerns."
            }
        }
    },
    // ?? SLEEP WELL ????????????????????????????????????????????????
    {
        id: "sleep-specialist",
        title: "Your own in-house sleep specialist",
        tags: ["Sleep well", "Air fresh", "Keep the air fresh", "Control lights", "Easily control your lights"],
        devices: ["議곕챸", "?먯뼱而?, "怨듦린泥?젙湲?],
        missionBucket: "Save",
        content: {
            ko: {
                pain: "?좊뱾湲???議곕챸, ?⑤룄, 怨듦린吏덉쓣 ?쇱씪??留욎텛??寃껋씠 踰덇굅濡?퀬, ?꾩묠???쇱뼱????媛쒖슫?섏? ?딆? ?좎씠 留롮뒿?덈떎.",
                solution: "媛ㅻ윮???뚯튂??媛ㅻ윮??留곸씠 ?섎㈃ 媛먯?瑜??쒖옉?섎㈃, 移⑥떎 議곕챸???쒖꽌???대몢?뚯?怨?而ㅽ듉???ロ엳硫??먯뼱而④낵 怨듦린泥?젙湲곌? 議곗슜???묐룞?⑸땲?? 湲곗긽 ?쒓컙?먮뒗 而ㅽ듉???대━怨?TV媛 ?먯뿰?ㅻ읇寃?耳쒖쭛?덈떎.",
                benefit: "?섎㈃ ?섍꼍???ㅼ젙?섎뒗 ?섍퀬 ?놁씠 ?좎껜 由щ벉??留욎텣 理쒖쟻???섎㈃ ?섍꼍???먮룞?쇰줈 ?꾩꽦?섏뼱 ??源딄퀬 媛쒖슫???숇㈃??痍⑦븷 ???덉뒿?덈떎."
            },
            en: {
                pain: "Manually adjusting lights, temperature, and air quality before bed is tedious, and waking up unrefreshed happens too often.",
                solution: "When your Galaxy Watch or Galaxy Ring detects sleep onset, bedroom lights gradually dim, curtains close, and the AC and air purifier quietly activate. At wake time, curtains open and the TV turns on naturally.",
                benefit: "The optimal sleep environment sets itself to your body rhythm without any setup effort, delivering deeper, more refreshing sleep every night."
            }
        }
    },
    // ?? ENHANCED MOOD ?????????????????????????????????????????????
    {
        id: "ultimate-gaming",
        title: "The ultimate gaming environment",
        tags: ["Enhanced mood", "Air fresh", "Keep the air fresh", "Control lights", "Easily control your lights"],
        devices: ["TV", "議곕챸", "?먯뼱而?],
        missionBucket: "Play",
        content: {
            ko: {
                pain: "寃뚯엫???쒖옉???뚮쭏??議곕챸, 釉붾씪?몃뱶, ?먯뼱而⑥쓣 ?쇱씪??議곗젅?댁빞 ?섍퀬, ?μ떆媛?寃뚯엫?쇰줈 諛⑹씠 ?붿썙??吏묒쨷?μ씠 ?⑥뼱吏묐땲??",
                solution: "寃뚯씠諛??덈툕 ?ㅽ뻾怨??숈떆??議곕챸??寃뚯엫 ?붾㈃怨??ㅼ떆媛꾩쑝濡??됱긽???숆린?뷀븯怨? 釉붾씪?몃뱶媛 ?먮룞?쇰줈 ?대젮媛묐땲?? 臾댄뭾 ?먯뼱而⑥씠 吏곹뭾 ?놁씠 苡뚯쟻???⑤룄瑜??좎??섎ŉ, 寃뚯엫 醫낅즺 ??紐⑤뱺 ?섍꼍???쇱긽 紐⑤뱶濡??먮룞 蹂듦??⑸땲??",
                benefit: "蹂꾨룄??議곗옉 ?놁씠 寃뚯엫 ?쒖옉怨??숈떆???꾨꼍??紐곗엯 ?섍꼍???꾩꽦?섍퀬, 醫낅즺 ???뺣━???먮룞?쇰줈 ?⑸땲??"
            },
            en: {
                pain: "Adjusting lights, blinds, and AC manually every gaming session, then overheating during long play sessions that breaks concentration.",
                solution: "Launching Gaming Hub syncs room lights to the screen in real time and lowers blinds automatically. WindFree AC maintains comfort without direct airflow, and everything resets to normal mode when gaming ends.",
                benefit: "A perfect immersive environment is ready the moment gaming starts?봞nd tidies itself when you're done, with zero manual intervention."
            }
        }
    },
    {
        id: "upgrade-listening",
        title: "Upgrade your listening experience",
        tags: ["Enhanced mood"],
        devices: ["?ㅽ뵾而?, "TV", "議곕챸"],
        missionBucket: "Play",
        content: {
            ko: {
                pain: "醫뗭? ?뚯븙?대굹 ?곸긽??利먭린怨??띠???湲곌린蹂??ㅼ젙??蹂듭옟?섍퀬, ?뚯븙怨?議곕챸???곕줈?곕줈 ???遺꾩쐞湲곌? 諛섍컧?⑸땲??",
                solution: "裕ㅼ쭅 ?꾨젅?꾩씠???ъ슫?쒕컮???뚯븙 ?ъ깮怨??곕룞?섏뿬 議곕챸???뚯븙??遺꾩쐞湲곗뿉 留욊쾶 ?먮룞?쇰줈 ?됱긽怨?諛앷린瑜?議곗젅?⑸땲?? 硫?곕８ ?ㅻ뵒?ㅻ줈 吏????대뵒?쒕뱺 媛숈? ?뚯븙??利먭만 ???덉뒿?덈떎.",
                benefit: "議곕챸怨??뚯븙???섎굹媛 ?섏뼱 吏묒씠 ?섎쭔????肄섏꽌?명?濡?蹂?좏븯怨? 諛⑸쭏???딄? ?녿뒗 ?뚯븙 寃쏀뿕??利먭만 ???덉뒿?덈떎."
            },
            en: {
                pain: "Enjoying great music or content is hampered by complex per-device settings, and lights and audio working independently undercut the atmosphere.",
                solution: "When the Music Frame or soundbar plays, lights automatically adjust color and brightness to match the music's mood. Multi-room audio lets you enjoy the same music seamlessly throughout your home.",
                benefit: "Lights and music unite to transform your home into a personal concert hall, with uninterrupted audio flowing from room to room."
            }
        }
    },
    // ?? CARE FOR SENIORS ??????????????????????????????????????????
    {
        id: "family-care-apart",
        title: "Be worry-free even when apart",
        tags: ["Care for seniors", "?쒕땲??耳??],
        devices: ["?쇱꽌", "?됱옣怨?, "TV"],
        missionBucket: "Care",
        content: {
            ko: {
                pain: "硫由??ъ떆??遺紐⑤떂???덈?媛 嫄깆젙?섏?留?留ㅻ쾲 ?꾪솕?섍린??遺?댁뒪?쎄퀬, 移대찓??媛먯떆???ъ깮??移⑦빐 媛숈븘 遺덊렪?⑸땲??",
                solution: "Family Care ?쒕퉬?ㅺ? ?됱옣怨?臾??대┝, TV ?쒖껌, ?뺤닔湲??ъ슜 ?⑦꽩??遺꾩꽍?⑸땲?? ?됱냼? ?щ━ ?쇱젙 ?쒓컙 ?쒕룞???놁쑝硫?蹂댄샇?먯뿉寃??뚮┝??蹂대궡怨? ?뺥빐吏??쒓컙??蹂듭빟 ?뚮┝??TV ?붾㈃?쇰줈 ?쒓났?⑸땲??",
                benefit: "?ъ깮?쒖쓣 移⑦빐?섏? ?딆쑝硫댁꽌??遺紐⑤떂???덈?瑜??뺤씤?섍퀬, ?댁긽 ?곹솴?먮뒗 鍮좊Ⅴ寃??泥섑븷 ???덉뼱 留덉쓬???⑥뵮 ?볦엯?덈떎."
            },
            en: {
                pain: "Worrying about elderly parents far away, yet feeling awkward calling constantly?봞nd using cameras feels like an invasion of their privacy.",
                solution: "Family Care analyzes fridge door use, TV viewing, and water dispenser patterns. Unusual inactivity for a set period triggers an alert, and medication reminders appear on their TV at scheduled times.",
                benefit: "Stay informed about your parents' wellbeing without intruding on their privacy, with fast alerts when something seems off?봱eal peace of mind from a distance."
            }
        }
    },
    // ?? CARE FOR KIDS ?????????????????????????????????????????????
    {
        id: "care-for-kids",
        title: "Keep your children comfortable and safe",
        tags: ["Care for kids", "Air fresh", "Keep the air fresh", "Keep your home safe"],
        devices: ["?먯뼱而?, "?쇱꽌"],
        missionBucket: "Care",
        content: {
            ko: {
                pain: "留욌쾶??媛?뺤뿉???꾩씠媛 ?쇱옄 洹媛?덉쓣 ???덉쟾?쒖?, ?ㅻ궡 ?섍꼍??愿쒖갖?吏 吏곸젒 ?뺤씤?????놁뼱 嫄깆젙?낅땲??",
                solution: "?먮?媛 洹媛?섎㈃ ?꾩뼱???좏샇濡??ㅽ뵾而ㅻ? ?듯빐 ?곕쑜???뚯꽦 ?몄궗媛 ?섏삤怨? ?붿슫 ?좎? ?먯뼱而⑥씠 ?먮룞?쇰줈 耳쒖쭛?덈떎. 二쇰갑 媛?꾩씠 ?묐룞 以묒씠硫?利됱떆 ?뚮┝??諛쏄퀬, 怨듦린吏덉씠 ?섏걯硫?怨듦린泥?젙湲곌? ?먮룞 媛?숉빀?덈떎.",
                benefit: "?꾩씠??洹媛 ?뺤씤遺???덉쟾???ㅻ궡 ?섍꼍 議곗꽦源뚯? ?먮룞?쇰줈 愿由щ릺?? 遺紐④? 吏묒뿉 ?놁뼱???꾩씠媛 ?덉쟾?섍쾶 吏?????덉뒿?덈떎."
            },
            en: {
                pain: "In a dual-income household, not being able to check whether your child arrived safely or if the home environment is comfortable is a constant worry.",
                solution: "When your child arrives home, the door lock triggers a warm voice greeting from the speaker, and the AC turns on automatically on hot days. Kitchen appliance alerts come through instantly, and poor air quality starts the purifier.",
                benefit: "From arrival confirmation to safe indoor environment setup, everything is managed automatically?봸our child is safe and comfortable even when you're not there."
            }
        }
    },
    // ?? CARE FOR PET ??????????????????????????????????????????????
    {
        id: "purrfect-pet-care",
        title: "Purrfect pet care",
        tags: ["Care for pet", "諛섎젮?숇Ъ 耳??, "Keep your home safe", "Help with chores"],
        devices: ["濡쒕큸泥?냼湲?, "TV", "?먯뼱而?, "?쇱꽌"],
        missionBucket: "Care",
        content: {
            ko: {
                pain: "?쇨렐?대굹 ?몄텧濡?諛섎젮?숇Ъ??吏묒뿉 ?쇱옄 ?덉뼱 遺덉븞?섍퀬, ?⑤룄???뚯떇, 遺꾨━遺덉븞???쒕븣 ?뚮킄二쇱? 紐삵븷源?嫄깆젙?⑸땲??",
                solution: "Jet Bot AI+ 濡쒕큸泥?냼湲곕줈 ?먭꺽 ?쒖같???섍퀬 諛섎젮?숇Ъ ?ъ쭊???ㅼ떆媛??꾩넚?⑸땲?? 吏뽰쓬??媛먯??섎㈃ TV?먯꽌 ?덉젙???뺣뒗 ?뚯븙???먮룞 ?ъ깮?섍퀬, ?먯뼱而⑥씠 苡뚯쟻???⑤룄瑜??좎??⑸땲?? ?ㅻ쭏??湲됱떇湲곕줈 ?먭꺽 湲됱떇??媛?ν빀?덈떎.",
                benefit: "硫由??덉뼱??諛섎젮?숇Ъ???곹깭瑜??ㅼ떆媛꾩쑝濡??뺤씤?섍퀬 ?뚮큵 怨듬갚??梨꾩슱 ???덉뼱, 蹂댄샇?먯쓽 遺덉븞???ш쾶 以꾩뼱??땲??"
            },
            en: {
                pain: "Anxiety about a pet left alone during overtime or outings?봴nable to check on temperature, food, or separation anxiety in time.",
                solution: "The Jet Bot AI+ robot vacuum remotely patrols and sends real-time pet photos. Detected barking triggers calming music on the TV automatically, the AC maintains comfort, and a smart feeder enables remote feeding.",
                benefit: "Check on your pet in real time and fill care gaps from anywhere?봡ramatically reducing a pet owner's worry while away."
            }
        }
    },
    // ?? FIND YOUR BELONGINGS ??????????????????????????????????????
    {
        id: "find-belongings",
        title: "Locate lost items easily",
        tags: ["Find your belongings", "Keep your home safe"],
        devices: ["TV", "?쇱꽌"],
        missionBucket: "Secure",
        content: {
            ko: {
                pain: "?댁뇿, 吏媛? 由щえ而????먯＜ ?껋뼱踰꾨━??臾쇨굔??李얜뒓???쒓컙????퉬?섍퀬, ?몄텧 ?꾩뿉 ?뱁엳 ?ㅽ듃?덉뒪瑜?諛쏆뒿?덈떎.",
                solution: "SmartTag瑜?遺李⑺븳 臾쇨굔???꾩튂瑜?SmartThings ?깆뿉??諛붾줈 ?뺤씤?섍퀬, UWB 湲곗닠濡??뺣??섍쾶 ?꾩튂瑜?異붿쟻?⑸땲?? TV ?붾㈃?먯꽌 'Find my phone' 湲곕뒫?쇰줈 ?⑥뼱?덈뒗 ?ㅻ쭏?명룿??李얠쓣 ???덉뒿?덈떎.",
                benefit: "?몄텧 ??臾쇨굔 李얜뒗 ?ㅽ듃?덉뒪?먯꽌 ?대갑?섍퀬, 洹以묓뭹????긽 ?뚯븙?????덉뼱 ?쇱긽???쒓껐 媛踰쇱썙吏묐땲??"
            },
            en: {
                pain: "Wasting time hunting for keys, wallets, and remotes?봢specially stressful right before heading out.",
                solution: "Check the location of SmartTag-attached items directly in the SmartThings app, with UWB technology for precision tracking. 'Find my phone' from the TV screen locates a hidden smartphone instantly.",
                benefit: "No more pre-departure stress over lost items?봩nowing where your valuables are at all times lightens your daily routine considerably."
            }
        }
    },
    // ?? STAY FIT & HEALTHY ????????????????????????????????????????
    {
        id: "stay-fit-healthy",
        title: "Let SmartThings take care of your workouts",
        tags: ["Stay fit & healthy", "Enhanced mood", "Air fresh", "Keep the air fresh"],
        devices: ["TV", "?먯뼱而?],
        missionBucket: "Play",
        content: {
            ko: {
                pain: "吏묒뿉???대룞?????섍꼍 ?명똿???쒓컙??鍮쇱븮湲곌퀬, 媛ㅻ윮???뚯튂 ?곗씠?곕? 蹂대㈃???숈떆??肄섑뀗痢좊? 利먭린湲곕룄 ?대졄?듬땲??",
                solution: "SmartThings媛 ?대룞 ?쒖옉怨??숈떆???먯뼱而④낵 怨듦린泥?젙湲곕? 耳?苡뚯쟻???섍꼍??議곗꽦?⑸땲?? 媛ㅻ윮???뚯튂???대룞 ?뺣낫(?쒓컙, 移쇰줈由? ?щ컯??瑜?TV ?붾㈃?먯꽌 ?ㅼ떆媛꾩쑝濡??뺤씤?섎㈃??醫뗭븘?섎뒗 肄섑뀗痢좊룄 ?④퍡 利먭만 ???덉뒿?덈떎.",
                benefit: "?대룞 ?섍꼍 ?명똿???좉꼍 ?곗? ?딄퀬 諛붾줈 ?대룞??吏묒쨷?????덉쑝硫? TV濡??곗씠?곕? ?뺤씤?섎㈃????利먭쾪怨??④낵?곸쑝濡??대룞?????덉뒿?덈떎."
            },
            en: {
                pain: "Home workouts are disrupted by time spent adjusting the environment, and it's hard to view Galaxy Watch workout data on TV while enjoying other content.",
                solution: "SmartThings turns on the AC and air purifier as your workout starts for an ideal environment. Galaxy Watch data?봳ime, calories, heart rate?봡isplays in real time on your TV alongside any content you enjoy.",
                benefit: "No time lost on environment setup before working out?봡ive straight in and enjoy more effective, entertaining workouts with live stats on your big screen."
            }
        }
    },
    // ?? FOOD / KITCHEN ????????????????????????????????????????????
    {
        id: "smart-cooking",
        title: "How to make today's meal more enjoyable",
        tags: ["Help with chores", "Smart cooking"],
        devices: ["?됱옣怨?, "?ㅻ툙"],
        missionBucket: "Save",
        content: {
            ko: {
                pain: "?됱옣怨좎뿉 萸먭? ?덈뒗吏 留ㅻ쾲 ?댁뼱遊먯빞 ?섍퀬, ?ㅻ툙 ?⑤룄? ?쒓컙???덉떆?쇰쭏??吏곸젒 留욎떠???댁꽌 ?붾━ ?쒖옉 ?꾨???吏移⑸땲??",
                solution: "AI Vision Inside媛 ?됱옣怨??앹옱猷뚮? ?먮룞?쇰줈 ?몄떇??紐⑸줉??留뚮뱾怨??좏넻湲고븳???뚮젮以띾땲?? ?ㅻ툙???щ즺瑜??ｌ쑝硫??щ즺瑜??몄떇??理쒖쟻 ?덉떆?쇰? 異붿쿇?섍퀬 ?⑤룄? ?쒓컙???먮룞 ?ㅼ젙?⑸땲??",
                benefit: "?됱옣怨?臾??댁? ?딄퀬???앹옱猷뚮? ?뚯븙?섍퀬, ?ㅻ툙???뚯븘??留욎떠二쇰뒗 ?뺣텇???붾━ ?쒖옉遺??留덈Т由ш퉴吏 ?⑥뵮 ?섏썡?댁쭛?덈떎."
            },
            en: {
                pain: "Having to open the fridge every time to check ingredients, and manually setting oven temperature and time for every recipe, is draining before cooking even starts.",
                solution: "AI Vision Inside automatically recognizes refrigerator contents, creates an ingredient list, and tracks expiry dates. Put ingredients in the oven and it recognizes them, recommends the best recipe, and auto-sets temperature and time.",
                benefit: "Check your fridge without opening it, and let the oven handle the settings?봠ooking becomes smoother and more enjoyable from start to finish."
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
    const isPetContext = /pet|dog|cat|puppy|kitten|諛섎젮|媛뺤븘吏|怨좎뼇??i.test(`${selectedSegment} ${intent.purpose} ${serviceNames.join(" ")}`);
    const appliedServices = [...new Set(services.slice(0, 3).map((service) => service.appCardLabel || service.serviceName))];
    
    // Attempt to find a matching Explore scenario first
    const exploreMatch = findExploreScenario(intent);
    
    let serviceStories;
    if (exploreMatch) {
        const locale = currentLocale === "ko" ? "ko" : "en";
        const content = exploreMatch.content[locale] || exploreMatch.content.en;
        serviceStories = [
            {
                title: currentLocale === "ko" ? `[李몄“ ?쒕굹由ъ삤] ${exploreMatch.title}` : `[Explore Mapped] ${exploreMatch.title}`,
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
            <!-- Brief Card: 1遺?釉뚮━??-->
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

            <!-- 01. CX ?쒕굹由ъ삤 ?붿빟 -->
            <section class="output-block hero-result numbered-output">
                <p class="block-index">01</p>
                <h4>${titles.summary}</h4>
                <p class="summary-text">${escapeHtml(payload.summary)}</p>

                <div class="summary-sub-grid">
                    <div class="summary-sub-item">
                        <p class="subhead">${isKo ? "李몄“???쒕굹由ъ삤 湲곕컲 ?ㅽ넗由? : "Parent Story"}</p>
                        <p>${escapeHtml(buildParentStory(payload))}</p>
                    </div>
                    <div class="summary-sub-item">
                        <p class="subhead">${isKo ? "?듭떖 媛移? : "Core Values"}</p>
                        <ul class="value-list">${buildReflectedValues(payload).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
                    </div>
                </div>

                <div class="storyboard-webtoon">
                    <p class="subhead">${isKo ? "?ㅽ넗由щ낫???붿빟" : "Storyboard Summary"}</p>
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

                <p class="subhead">${isKo ? "?듭떖 ?붿빟" : "Executive Summary"}</p>
                <ul class="six-line-summary">${buildSixLineSummary(payload).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            </section>

            <!-- 02. ?곸꽭 ?쒕굹由ъ삤(Detailed Scenario) -->
            <section class="output-block numbered-output">
                <p class="block-index">02</p>
                <h4>${titles.scenario}</h4>
                <div class="scenario-details-grid">
                    <div class="detail-col">
                        <strong>${isKo ? "?寃?怨좉컼" : "Target Customer Context"}</strong>
                        <p>${escapeHtml(payload.detailedScenario.targetCustomer)}</p>
                    </div>
                    <div class="detail-col">
                        <strong>?곸슜??Life ?쒕퉬??諛??뚮쭏</strong>
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

            <!-- 03. 吏???뱀꽦 諛??곗씠??洹쇨굅 -->
            <section class="output-block numbered-output">
                <p class="block-index">03</p>
                <h4>${titles.facts}</h4>
                <div class="fact-separation">
                    <div class="fact-box confirmed-box">
                        <strong>${currentLocale === "ko" ? "?뺤젙 ?뺣낫" : "Confirmed Facts"}</strong>
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
                                        ? `<a class="source-detail-url" href="${escapeHtml(srcUrl)}" target="_blank" rel="noopener noreferrer">?뵕 ${escapeHtml(srcUrl.length > 70 ? srcUrl.slice(0, 70) + "?? : srcUrl)}</a>`
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
                                                <p class="source-detail-meta">${currentLocale === "ko" ? "?좊ː?? : "Confidence"}: ${escapeHtml(item.confidence)} 쨌 ${escapeHtml(item.impact)}</p>
                                                ${urlLink}
                                            </div>
                                        </td>
                                    </tr>`;
                                }).join("")}
                            </tbody>
                        </table>
                    </div>
                    <div class="fact-box assumption-box">
                        <strong>${currentLocale === "ko" ? "異붾줎 ?뺣낫" : "Inferences"}</strong>
                        <ul>${(payload.facts.assumptions || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
                    </div>
                </div>
                <div class="insight-process">
                    <div class="process-item">
                        <strong>${isKo ? "吏???꾪솴 (Observation)" : "Observation"}</strong>
                        <p>${escapeHtml(payload.facts.observation)}</p>
                    </div>
                    <div class="process-item">
                        <strong>${isKo ? "?듭떖 ?꾩텧 (Insight)" : "Insight"}</strong>
                        <p>${escapeHtml(payload.facts.insight)}</p>
                    </div>
                    <div class="process-item">
                        <strong>${isKo ? "CX ?곸슜 (Implication)" : "Implication"}</strong>
                        <p>${escapeHtml(payload.facts.implication)}</p>
                    </div>
                </div>
                <div class="fact-readiness">
                    <strong>${currentLocale === "ko" ? "湲곌린/?쒕퉬??以鍮??곹깭" : "Readiness Sync"}</strong>
                    <ul>${(payload.facts.readiness || []).map((item) => `<li><strong>${escapeHtml(item.label)}</strong> 쨌 ${escapeHtml(item.status)} 쨌 ${escapeHtml(item.note)}</li>`).join("")}</ul>
                </div>
                <div class="fact-links source-refs-summary">
                    <h5>${currentLocale === "ko" ? "李몄“ 異쒖쿂" : "Reference Sources"}</h5>
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

            <!-- 04. 留덉???硫붿떆吏 -->
            <section class="output-block numbered-output">
                <p class="block-index">04</p>
                <h4>${titles.marketing}</h4>
                <div class="marketing-wrap">
                    <p class="role-badge">${escapeHtml(marketing.roleTone || "")} ${currentLocale === "ko" ? "?좏깮 ?곹깭, ?꾨옒??3媛??뚯쫰 ?꾩껜 異쒕젰?낅땲??" : "selected, but all three lenses are shown below."}</p>
                    <div class="marketing-guideline-box">
                        <strong>${currentLocale === "ko" ? "?뺤젙???몄뼱 媛?대뱶?쇱씤 諛섏쁺 洹쒖튃" : "Confirmed Verbal Guideline Rules"}</strong>
                        <ul class="marketing-list">${(marketing.confirmedRules || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
                    </div>
                    <div class="marketing-guideline-box">
                        <strong>${currentLocale === "ko" ? "湲濡쒕쾶 / 濡쒖뺄 硫붿떆吏 援щ텇" : "Global / Local Split"}</strong>
                        <ul class="marketing-list">
                            <li><strong>${isKo ? "湲濡쒕쾶" : "Global"}</strong>: ${escapeHtml(marketing.globalLocalSplit?.global || "")}</li>
                            <li><strong>${isKo ? "濡쒖뺄" : "Local"}</strong>: ${escapeHtml(marketing.globalLocalSplit?.local || "")}</li>
                        </ul>
                    </div>
                    <div class="marketing-lens-grid">
                        ${marketingLenses.map((lens) => `
                            <article class="marketing-lens-card ${lens.selected ? "selected" : ""}">
                                <p class="marketing-lens-label">${escapeHtml(lens.label)}</p>
                                ${lens.hookEn ? `<p><strong>${isKo ? "??硫붿떆吏 (?곷Ц)" : "Hook (EN)"}</strong><br>${escapeHtml(lens.hookEn)}</p>` : ""}
                                ${lens.shortCopyKo ? `<p><strong>${isKo ? "吏㏃? 移댄뵾 (援?Ц)" : "Short copy (KO)"}</strong><br>${escapeHtml(lens.shortCopyKo)}</p>` : ""}
                                ${lens.talkTrackKo ? `<div><strong>${isKo ? "?ㅻ챸 硫섑듃 (援?Ц)" : "Talk-track (KO)"}</strong><ul>${lens.talkTrackKo.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>` : ""}
                                ${lens.h1En ? `<p><strong>${isKo ? "硫붿씤 ?ㅻ뱶?쇱씤 (?곷Ц)" : "H1 (EN)"}</strong><br>${escapeHtml(lens.h1En)}</p>` : ""}
                                ${lens.subCopyKo ? `<p><strong>${isKo ? "蹂댁“ 移댄뵾 (援?Ц)" : "Sub-copy (KO)"}</strong><br>${escapeHtml(lens.subCopyKo)}</p>` : ""}
                                ${lens.proofPointKo ? `<p><strong>${isKo ? "利앷굅 ?ъ씤?? : "Proof point"}</strong><br>${escapeHtml(lens.proofPointKo)}</p>` : ""}
                                ${lens.campaignConceptEn ? `<p><strong>${isKo ? "罹좏럹??而⑥뀎 (?곷Ц)" : "Campaign concept (EN)"}</strong><br>${escapeHtml(lens.campaignConceptEn)}</p>` : ""}
                                ${lens.emotionalNarrativeKo ? `<p><strong>${isKo ? "媛먯꽦 ?대윭?곕툕 (援?Ц)" : "Emotional narrative (KO)"}</strong><br>${escapeHtml(lens.emotionalNarrativeKo)}</p>` : ""}
                                ${lens.brandValue ? `<p><strong>${isKo ? "媛뺥솕?섎뒗 釉뚮옖??媛移? : "Brand value reinforced"}</strong><br>${escapeHtml(lens.brandValue)}</p>` : ""}
                                <p><strong>${isKo ? "?됰룞 ?좊룄 臾멸뎄" : "CTA"}</strong><br>${escapeHtml(lens.cta || "")}</p>
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
        ? "異붽? ?붿껌"
        : currentLocale === "de"
            ? "Weitere Anfrage"
            : "Additional Request";
    const placeholder = currentLocale === "ko"
        ? "?? ???쒕굹由ъ삤瑜?Dotcom??3臾몄옣 CTA濡?諛붽퓭以?
        : "Example: Rewrite this scenario into three Dotcom CTAs";
    const button = currentLocale === "ko" ? "吏덈Ц?섍린" : "Ask";
    const helper = currentLocale === "ko"
        ? "?앹꽦??01~04 寃곌낵瑜?諛뷀깢?쇰줈 異붽? ?붿껌???낅젰?섎㈃, ?대? 怨꾩궛??而⑦뀓?ㅽ듃源뚯? 諛섏쁺??諛붾줈 ?듬??⑸땲??"
        : "Ask an additional request based on outputs 01~04, and get an immediate answer grounded in the internal context.";
    const initial = currentLocale === "ko"
        ? `?꾩옱 而⑦뀓?ㅽ듃: ${payload.title}`
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

    if (/?붿빟|summary|tl;dr/.test(q)) {
        return isKo
            ? `?붿빟: ${payload.summary} ?듭떖? ${payload.summaryBullets.slice(0, 2).join(" / ")} ?낅땲??`
            : `Summary: ${payload.summary} Core points: ${payload.summaryBullets.slice(0, 2).join(" / ")}.`;
    }
    if (/移댄뵾|臾멸뎄|message|copy|cta/.test(q)) {
        return isKo
            ? `沅뚯옣 硫붿떆吏:\n1) ${messages[0] || ""}\n2) ${messages[1] || ""}\n3) ${messages[2] || ""}`
            : `Recommended messages:\n1) ${messages[0] || ""}\n2) ${messages[1] || ""}\n3) ${messages[2] || ""}`;
    }
    if (/由ъ뒪??risk|privacy|trust/.test(q)) {
        return isKo
            ? `由ъ뒪???붿빟: ${payload.marketability.risk}\n??? ${(payload.marketability.nextActions || []).join(" / ")}`
            : `Risk summary: ${payload.marketability.risk}\nActions: ${(payload.marketability.nextActions || []).join(" / ")}`;
    }

    return isKo
        ? `?붿껌 諛섏쁺 ?쒖븞: "${question}"\n- ?寃? ${payload.detailedScenario.targetCustomer}\n- KPI: ${payload.marketability.verdict}\n- ?ㅼ쓬 ?ㅽ뻾: ${(payload.marketability.nextActions || []).slice(0, 2).join(" / ")}`
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
            btn.querySelector("strong").textContent = currentLocale === "ko" ? "蹂듭궗 ?꾨즺!" : "Copied!";
            setTimeout(() => { btn.querySelector("strong").textContent = orig; }, 1500);
        }
    } catch {
        window.prompt(currentLocale === "ko" ? "?꾨옒 ?댁슜??蹂듭궗?섏꽭??" : "Copy the text below.", text);
    }
}

function buildStructuredPlainText(output) {
    const lines = [];
    const tx = output.transformation || {};
    const mo = tx.marketerOutput || {};
    const co = tx.consumerOutput || {};
    const sel = output.selection || {};
    const isKo = (output.locale || "ko") === "ko";

    // ?좏깮 洹쇨굅
    const primary = (sel.selectedScenarios || []).find(s => s.isPrimary) || (sel.selectedScenarios || [])[0];
    if (primary) {
        lines.push(`?먥븧??${isKo ? "?좏깮 洹쇨굅" : "Selection Basis"} ?먥븧??);
        lines.push(`${isKo ? "?쒕굹由ъ삤" : "Scenario"}: ${primary.title} (Explore ${primary.source})`);
        lines.push(`${isKo ? "?꾪떚?? : "Article"}: ${primary.articleTitle}`);
        if (sel.selectionReason) lines.push(`${isKo ? "?좏깮 ?댁쑀" : "Reason"}: ${sel.selectionReason}`);
        if ((sel.primaryValues || []).length) lines.push(`${isKo ? "媛移? : "Values"}: ${sel.primaryValues.join(", ")}`);
        lines.push("");
    }

    // 留덉??곗슜
    lines.push(`?먥븧??${isKo ? "留덉??곗슜" : "For Marketers"} ?먥븧??);
    if (mo.headline) lines.push(mo.headline);
    if (mo.summary) lines.push(mo.summary);
    lines.push("");
    if (mo.whyThisScenario) { lines.push(`${isKo ? "?????쒕굹由ъ삤:" : "Why:"} ${mo.whyThisScenario}`); lines.push(""); }
    if ((mo.copyOptions || []).length) {
        lines.push(isKo ? "移댄뵾 ?듭뀡:" : "Copy Options:");
        mo.copyOptions.forEach((c, i) => {
            lines.push(`  ${i + 1}) KR: ${c.ko || ""}`);
            if (c.en) lines.push(`     EN: ${c.en}`);
            if (c.tone) lines.push(`     ${isKo ? "?? : "Tone"}: ${c.tone}`);
        });
        lines.push("");
    }
    if ((mo.channelStrategy || []).length) {
        lines.push(isKo ? "梨꾨꼸 ?꾨왂:" : "Channel Strategy:");
        mo.channelStrategy.forEach(ch => {
            lines.push(`  [${ch.channel}] ${ch.message} (${ch.tone}, ${ch.format || ""})`);
        });
        lines.push("");
    }

    // ?쇰컲 ?ъ슜?먯슜
    lines.push(`?먥븧??${isKo ? "?쇰컲 ?ъ슜?먯슜" : "For Consumers"} ?먥븧??);
    if (co.headline) lines.push(co.headline);
    if (co.whatItDoes) { lines.push(""); lines.push(co.whatItDoes); }
    lines.push("");
    if ((co.requiredSetup?.devices || []).length) {
        lines.push(isKo ? "?꾩슂 湲곌린:" : "Required Devices:");
        co.requiredSetup.devices.forEach(d => {
            lines.push(`  - ${d.name}${d.role ? ` (${d.role})` : ""}${d.required !== false ? "" : ` [${isKo ? "?좏깮" : "Optional"}]`}`);
        });
        lines.push("");
    }
    if ((co.setupSteps || []).length) {
        lines.push(isKo ? "?ㅼ젙 諛⑸쾿:" : "Setup Steps:");
        co.setupSteps.forEach((s, i) => lines.push(`  ${i + 1}. ${s}`));
        lines.push("");
    }
    if ((co.cautions || []).length) {
        lines.push(isKo ? "二쇱쓽?ы빆:" : "Cautions:");
        co.cautions.forEach(c => lines.push(`  - ${c}`));
        lines.push("");
    }

    // ?몄궗?댄듃
    const oii = output.localizedInsight;
    if (oii) {
        lines.push(`?먥븧??${isKo ? "?몄궗?댄듃" : "Insight"} ?먥븧??);
        if (oii.observation) lines.push(`${isKo ? "愿李? : "Observation"}: ${oii.observation}`);
        if (oii.insight) lines.push(`${isKo ? "?몄궗?댄듃" : "Insight"}: ${oii.insight}`);
        if (oii.implication) lines.push(`${isKo ? "?⑥쓽" : "Implication"}: ${oii.implication}`);
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
        lines.push(currentLocale === "ko" ? "[ ?곸꽭 ?쒕굹由ъ삤 ]" : "[ Detailed Scenario ]");
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
        lines.push(currentLocale === "ko" ? "[ ?곗씠??洹쇨굅 ]" : "[ Data Grounds ]");
        (payload.facts.confirmed || []).forEach((f) => {
            lines.push(`[${f.no}] ${f.fact} | ${f.source} | ${f.confidence}`);
        });
        if (payload.facts.assumptions?.length) {
            lines.push("");
            lines.push(currentLocale === "ko" ? "媛???ы빆:" : "Assumptions:");
            payload.facts.assumptions.forEach((a) => lines.push(`- ${a}`));
        }
    }
    if (payload.marketingMessages) {
        lines.push("");
        lines.push(currentLocale === "ko" ? "[ 留덉???硫붿떆吏 ]" : "[ Marketing Messages ]");
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
    // 援ъ“??output?대㈃ 援ъ“??CSV ?앹꽦
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
${sel.selectionReason ? `<div class="card"><strong>${isKo ? "?좏깮 ?댁쑀" : "Selection Reason"}</strong><p>${escapeHtml(sel.selectionReason)}</p></div>` : ""}
<h1>${escapeHtml(mo.headline || "")}</h1>
<p>${escapeHtml(mo.summary || "")}</p>
${mo.whyThisScenario ? `<h2>${isKo ? "?????쒕굹由ъ삤?멸?" : "Why This Scenario"}</h2><p>${escapeHtml(mo.whyThisScenario)}</p>` : ""}
${(mo.copyOptions || []).length ? `<h2>${isKo ? "移댄뵾 ?듭뀡" : "Copy Options"}</h2>${(mo.copyOptions || []).map((c, i) => `<div class="card"><strong>${isKo ? "?듭뀡" : "Option"} ${i + 1}</strong><br>KR: ${escapeHtml(c.ko || "")}<br>EN: ${escapeHtml(c.en || "")}${c.tone ? `<br><small>${escapeHtml(c.tone)}</small>` : ""}</div>`).join("")}` : ""}
${(mo.channelStrategy || []).length ? `<h2>${isKo ? "梨꾨꼸 ?꾨왂" : "Channel Strategy"}</h2><table><tr><th>${isKo ? "梨꾨꼸" : "Channel"}</th><th>${isKo ? "硫붿떆吏" : "Message"}</th><th>${isKo ? "?? : "Tone"}</th><th>${isKo ? "?щ㎎" : "Format"}</th></tr>${(mo.channelStrategy || []).map(ch => `<tr><td>${escapeHtml(ch.channel || "")}</td><td>${escapeHtml(ch.message || "")}</td><td>${escapeHtml(ch.tone || "")}</td><td>${escapeHtml(ch.format || "")}</td></tr>`).join("")}</table>` : ""}
<h1>${escapeHtml(co.headline || "")}</h1>
${co.whatItDoes ? `<p>${escapeHtml(co.whatItDoes)}</p>` : ""}
${(co.requiredSetup?.devices || []).length ? `<h2>${isKo ? "?꾩슂 湲곌린" : "Required Devices"}</h2><table><tr><th>${isKo ? "湲곌린" : "Device"}</th><th>${isKo ? "??븷" : "Role"}</th><th>${isKo ? "?꾩닔" : "Required"}</th></tr>${co.requiredSetup.devices.map(d => `<tr><td>${escapeHtml(d.name || "")}</td><td>${escapeHtml(d.role || "")}</td><td>${d.required !== false ? "O" : "-"}</td></tr>`).join("")}</table>` : ""}
${(co.setupSteps || []).length ? `<h2>${isKo ? "?ㅼ젙 諛⑸쾿" : "Setup Steps"}</h2><ol>${co.setupSteps.map(s => `<li>${escapeHtml(String(s))}</li>`).join("")}</ol>` : ""}
${(co.cautions || []).length ? `<h2>${isKo ? "二쇱쓽?ы빆" : "Cautions"}</h2><ul>${co.cautions.map(c => `<li>${escapeHtml(String(c))}</li>`).join("")}</ul>` : ""}
${oii ? `<h2>${isKo ? "?몄궗?댄듃" : "Insight"}</h2><p><strong>${isKo ? "愿李? : "Obs"}:</strong> ${escapeHtml(oii.observation || "")}<br><strong>${isKo ? "?몄궗?댄듃" : "Insight"}:</strong> ${escapeHtml(oii.insight || "")}<br><strong>${isKo ? "?⑥쓽" : "Impl"}:</strong> ${escapeHtml(oii.implication || "")}</p>` : ""}
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

    // ?좏깮 洹쇨굅
    const primary = (sel.selectedScenarios || []).find(s => s.isPrimary) || (sel.selectedScenarios || [])[0];
    if (primary) {
        rows.push(["Selection", "Scenario", primary.title, primary.source, "", primary.articleTitle || ""]);
        rows.push(["Selection", "Reason", sel.selectionReason || "", "", "", ""]);
        rows.push(["Selection", "Values", (sel.primaryValues || []).join(", "), "", "", ""]);
    }
    rows.push(["", "", "", "", "", ""]);

    // 留덉???
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

    // ?ъ슜??
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
        currentLocale === "ko" ? "## 01. CX ?쒕굹由ъ삤 ?쒕ぉ 諛?Summary" : "## 01. CX Scenario Title & Summary",
        payload.summary,
        "",
        "### 1) Parent Story",
        buildParentStory(payload),
        "",
        currentLocale === "ko" ? "### 2) 4? 媛移?諛섏쁺" : "### 2) Reflected Four Values",
        ...buildReflectedValues(payload).map((item) => `- ${item}`),
        "",
        currentLocale === "ko" ? "### 3) ?듭떖 ?붿빟 (6以?" : "### 3) Executive Summary (6 lines)",
        ...buildSixLineSummary(payload).map((item) => `- ${item}`),
        "",
        currentLocale === "ko" ? "## 02. ?곸꽭 ?쒕굹由ъ삤" : "## 02. Detailed Scenario",
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
        currentLocale === "ko" ? "## 03. 吏???뱀꽦 諛??곗씠??洹쇨굅" : "## 03. Regional Traits & Data Grounds",
        currentLocale === "ko" ? "### Fact (?뺤씤)" : "### Fact (Confirmed)",
        ...(payload.facts.confirmed || []).map((item) => `- [${item.no}] ${item.fact} | ${item.source} | ${item.confidence} | ${item.impact}`),
        "",
        currentLocale === "ko" ? "### Assumption (媛??" : "### Assumption",
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
        currentLocale === "ko" ? "### ?대? 李몄“ ?뚯씪" : "### Internal Source Files",
        ...(payload.facts.sourceRefs || []).map((item) => `- ${item}`),
        "",
        currentLocale === "ko"
            ? "## 04. 留덉???硫붿떆吏 (釉뚮옖???꾩씠?댄떚??諛섏쁺)"
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
        city: "",                          // 援?? 蹂寃????꾩떆 珥덇린??
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
    // Q3 移댄깉濡쒓렇瑜???locale 湲곗??쇰줈 ?ъ쟻??+ ?щ젋??
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
                ko: "留ㅼ옣 吏곸썝??怨좉컼??\"洹몃옒???닿쾶 ?섑븳??萸먭? 醫뗭???\"?쇰뒗 吏덈Ц???듯븯怨? 湲곗닠??利됯컖?곸씤 媛移섎줈 ?꾪솚???먮ℓ瑜?留덈Т由ы븯?꾨줉 ?뺤뒿?덈떎.",
                en: "Help store staff answer \"What does this do for me?\" and turn technology into immediate customer value at closing.",
                de: "Hilft dem Store-Team, die Frage \"Was bringt mir das konkret?\" zu beantworten und Technik in sofort erlebbaren Nutzen zu 체bersetzen."
            },
            hoverDetails: {
                ko: [
                    "蹂듭옟???ㅽ럺 ??? 怨좉컼???ㅼ젣 ?앺솢??留욌뒗 ?쒖뿰 ?먮쫫??留뚮뱾??蹂댁꽭??",
                    "\"?대윴 ?곹솴?먯꽑 ?대젃寃??곗꽭??" 媛숈? 紐낇솗???λ㈃??蹂댁뿬二쇰㈃ 媛移섍? 諛붾줈 ??우뒿?덈떎.",
                    "留ㅼ옣 誘명똿 ?꾨궇?대씪?? 紐?遺??덉뿉 ?ㅻ뱷???덈뒗 ?묐? ?쒕굹由ъ삤瑜??꾩꽦?????덉뒿?덈떎."
                ],
                en: [
                    "Instead of complex specs, build a demo flow that fits how the customer actually lives.",
                    "Show clear moments like \"In this situation, use it this way\" so the value lands immediately.",
                    "Even the day before a store meeting, you can shape a convincing response scenario in minutes."
                ],
                de: [
                    "Statt komplexer Spezifikationen einen Demo-Ablauf bauen, der zum Alltag des Kunden passt.",
                    "Klare Momente wie 'In dieser Situation so nutzen' zeigen, damit der Mehrwert sofort ankommt.",
                    "Selbst am Vorabend eines Store-Meetings ein 체berzeugendes Szenario in Minuten erstellen."
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
                ko: "?뱀궗?댄듃 諛⑸Ц?먮? 異⑹꽦 怨좉컼?쇰줈 ?꾪솚?섎뒗 ?곗씠??湲곕컲 ?⑤씪???ъ젙???ㅺ퀎?섍퀬, 媛??④퀎 ?깃낵瑜?痢≪젙?섍퀬 利앸챸?섎뒗 ??吏묒쨷?⑸땲??",
                en: "Design a data-driven online journey that turns visitors into loyal customers and prove impact at each conversion stage.",
                de: "Entwirft eine datenbasierte Online-Journey, die Besuchende zu loyalen Kunden macht, und belegt die Wirkung je Funnel-Stufe."
            },
            hoverDetails: {
                ko: [
                    "寃???섎룄遺???꾪솚源뚯?, ?곗씠??湲곕컲???⑤씪???ъ젙?????좎뭅濡?쾶 ?ㅺ퀎?섏꽭??",
                    "A/B ?뚯뒪??移댄뵾遺???쒕뵫 援ъ꽦源뚯?, 痢≪젙 媛?ν븳 ?깃낵??吏묒쨷??肄섑뀗痢좊? 留뚮벊?덈떎.",
                    "鍮??섏씠吏 ?욎뿉??怨좊??섎뒗 ?쒓컙??以꾩씠怨? 諛붾줈 ?????덈뒗 珥덉븞遺???쒖옉?섏꽭??"
                ],
                en: [
                    "Map the online journey from search intent to conversion with a sharper, data-backed structure.",
                    "From A/B test copy to landing-page composition, focus the content on measurable performance.",
                    "Spend less time staring at a blank page and start from a draft that is already usable."
                ],
                de: [
                    "Die Online-Journey von Suchintention bis Conversion datengest체tzt und pr채ziser gestalten.",
                    "Vom A/B-Test-Text bis zur Landing-Page: Inhalte auf messbare Performance ausrichten.",
                    "Weniger Zeit vor der leeren Seite verbringen ??mit einem sofort nutzbaren Entwurf starten."
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
                ko: "?쒗뭹 湲곕뒫蹂대떎 釉뚮옖??泥좏븰怨??ㅽ넗由щ줈 媛먯꽦???좊?瑜?留뚮뱾怨? ?ъ슜?먮? 釉뚮옖???ъ쑝濡??꾪솚?섎뒗 ??洹몃┝???ㅺ퀎?⑸땲??",
                en: "Build emotional connection through brand philosophy and story, not feature lists, and grow long-term brand love.",
                de: "Baut emotionale Bindung 체ber Markenphilosophie und Story statt Feature-Listen auf und st채rkt langfristige Markenpr채ferenz."
            },
            hoverDetails: {
                ko: [
                    "?쒗뭹 ?ㅽ럺??諛섎났?섎뒗 ??? 怨좉컼???쇱긽???먯뿰?ㅻ읇寃??뱀븘?쒕뒗 釉뚮옖???ㅽ넗由щ? 留뚮뱶?몄슂.",
                    "愿묎퀬 ?щ줈嫄대???罹좏럹??而⑥뀎源뚯?, ?멸컧怨?湲곗뼲???⑤뒗 硫붿떆吏 諛⑺뼢???≪븘以띾땲??",
                    "湲곕뒫 ?섏뿴???섏뼱, 媛먯꽦??異쒕컻?먯씠 ?섎뒗 ??以꾩쓣 李얠븘蹂댁꽭??"
                ],
                en: [
                    "Build a brand story that blends into the customer's life instead of repeating product specs.",
                    "From ad slogans to campaign concepts, shape message directions that grow affinity and recall.",
                    "Move beyond feature lists and find the one line that creates an emotional starting point."
                ],
                de: [
                    "Eine Markengeschichte aufbauen, die sich in den Alltag der Kunden einf체gt, statt Produktdaten zu wiederholen.",
                    "Vom Werbeslogan bis zum Kampagnenkonzept: Botschaftsrichtungen formen, die Sympathie und Erinnerung st채rken.",
                    "횥ber Feature-Listen hinausgehen und den einen Satz finden, der einen emotionalen Einstieg schafft."
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
    // Access card V2 ??safe selectors
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
    citySearchInput.placeholder = currentLocale === "ko" ? "?꾩떆 寃???먮뒗 ?낅젰"
        : currentLocale === "de" ? "Stadt suchen oder eingeben"
        : "Search or type a city";
    updateQuestionHelpers();
    prevBtn.textContent = t("prev");
    nextBtn.textContent = t("next");
    generateBtn.textContent = t("build");
    if (!latestPayload) renderOutputPreview();
    document.querySelector(".report-head h2").textContent = t("output");
    renderExportActions();
    // Q3/Q4 ?먮룞 踰꾪듉 諛??뱀뀡 ?쒕ぉ 濡쒖???援먯껜
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
    ko: "?쒓뎅??, en: "English", de: "Deutsch", fr: "Fran챌ais", es: "Espa챰ol",
    pt: "Portugu챗s", it: "Italiano", nl: "Nederlands", ar: "碼?晩邈磨?馬"
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
    // ?대깽???꾩엫 ??媛쒕퀎 由ъ뒪?????遺紐⑥뿉 ??踰덈쭔 ?깅줉
    if (!exportActions._delegated) {
        exportActions.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-export]");
            if (btn) handleExport(btn.dataset.export);
        });
        exportActions._delegated = true;
    }
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
        KR: { ko: "??쒕?援?, en: "South Korea", de: "S체dkorea" },
        US: { ko: "誘멸뎅", en: "United States", de: "Vereinigte Staaten" },
        GB: { ko: "?곴뎅", en: "United Kingdom", de: "Vereinigtes K철nigreich" },
        DE: { ko: "?낆씪", en: "Germany", de: "Deutschland" },
        TR: { ko: "?瑜댄궎??, en: "Turkiye", de: "T체rkei" },
        RU: { ko: "?ъ떆??, en: "Russian Federation", de: "Russische F철deration" },
        IN: { ko: "?몃룄", en: "India", de: "Indien" },
        JP: { ko: "?쇰낯", en: "Japan", de: "Japan" },
        CN: { ko: "以묎뎅", en: "China", de: "China" },
        HK: { ko: "?띿쉘", en: "Hong Kong", de: "Hongkong" },
        TW: { ko: "?留?, en: "Taiwan", de: "Taiwan" }
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
    // SEC(samsung.com/sec)媛 ?대? KR濡??댁꽍?섎?濡?以묐났 KR 異붽? 遺덊븘??
    // SEC???녿뒗 寃쎌슦?먮쭔 fallback
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
        KR: { ko: "??쒕?援?(KR)", en: "South Korea (KR)", de: "S체dkorea (KR)" },
        SEC: { ko: "??쒕?援?(KR)", en: "South Korea (KR)", de: "S체dkorea (KR)" },
        US: { ko: "誘멸뎅 (US)", en: "United States (US)", de: "Vereinigte Staaten (US)" },
        UK: { ko: "?곴뎅 (UK)", en: "United Kingdom (UK)", de: "Vereinigtes K철nigreich (UK)" },
        DE: { ko: "?낆씪 (DE)", en: "Germany (DE)", de: "Deutschland (DE)" },
        FR: { ko: "?꾨옉??(FR)", en: "France (FR)", de: "Frankreich (FR)" },
        ES: { ko: "?ㅽ럹??(ES)", en: "Spain (ES)", de: "Spanien (ES)" },
        PT: { ko: "?щⅤ?ш컝 (PT)", en: "Portugal (PT)", de: "Portugal (PT)" },
        IT: { ko: "?댄깉由ъ븘 (IT)", en: "Italy (IT)", de: "Italien (IT)" },
        NL: { ko: "?ㅻ뜙???(NL)", en: "Netherlands (NL)", de: "Niederlande (NL)" },
        BE: { ko: "踰④린??(BE)", en: "Belgium (BE)", de: "Belgien (BE)" },
        BE_FR: { ko: "踰④린???꾨옉?ㅼ뼱 (BE_FR)", en: "Belgium French (BE_FR)", de: "Belgien Franz철sisch (BE_FR)" },
        CA: { ko: "罹먮굹??(CA)", en: "Canada (CA)", de: "Kanada (CA)" },
        CA_FR: { ko: "罹먮굹???꾨옉?ㅼ뼱 (CA_FR)", en: "Canada French (CA_FR)", de: "Kanada Franz철sisch (CA_FR)" },
        CH: { ko: "?ㅼ쐞??(CH)", en: "Switzerland (CH)", de: "Schweiz (CH)" },
        CH_FR: { ko: "?ㅼ쐞???꾨옉?ㅼ뼱 (CH_FR)", en: "Switzerland French (CH_FR)", de: "Schweiz Franz철sisch (CH_FR)" },
        TR: { ko: "?瑜댄궎??(TR)", en: "Turkiye (TR)", de: "T체rkei (TR)" },
        IN: { ko: "?몃룄 (IN)", en: "India (IN)", de: "Indien (IN)" },
        RU: { ko: "?ъ떆??(RU)", en: "Russian Federation (RU)", de: "Russische F철deration (RU)" },
        JP: { ko: "?쇰낯 (JP)", en: "Japan (JP)", de: "Japan (JP)" }
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
        ?됱옣怨? { ko: "?됱옣怨?, en: "Refrigerator", de: "K체hlschrank" },
        ?명긽湲? { ko: "?명긽湲?, en: "Washer", de: "Waschmaschine" },
        嫄댁“湲? { ko: "嫄댁“湲?, en: "Dryer", de: "Trockner" },
        ?먯뼱而? { ko: "?먯뼱而?, en: "Air Conditioner", de: "Klimaanlage" },
        ?ㅻ툙: { ko: "?ㅻ툙", en: "Oven", de: "Backofen" },
        濡쒕큸泥?냼湲? { ko: "濡쒕큸泥?냼湲?, en: "Robot Vacuum", de: "Saugroboter" },
        "?명긽湲?嫄댁“湲?: { ko: "?명긽湲?嫄댁“湲?, en: "Washer/Dryer", de: "Waschmaschine/Trockner" },
        ?ㅽ뵾而? { ko: "?ㅽ뵾而?, en: "Speaker", de: "Lautsprecher" },
        議곕챸: { ko: "議곕챸", en: "Lighting", de: "Beleuchtung" },
        ?쇱꽌: { ko: "?쇱꽌", en: "Sensor", de: "Sensor" }
    };
    return map[name]?.[currentLocale] || map[name]?.en || map[name]?.ko || name;
}

function getRoleTitle(id) {
    const role = ROLE_LENSES.find((item) => item.id === id);
    const map = {
        retail: { ko: "由ы뀒???대떦??, en: "Retail Lead", de: "Retail-Verantwortliche" },
        dotcom: { ko: "?룹뺨 罹좏럹???대떦??, en: "Dotcom Campaign Lead", de: "Dotcom-Kampagnenleitung" },
        brand: { ko: "釉뚮옖??留덉????대떦??, en: "Brand Marketing Lead", de: "Brand-Marketing-Leitung" }
    };
    return map[id]?.[currentLocale] || map[id]?.en || role?.title || id;
}

function getRoleFocus(id) {
    const map = {
        retail: { ko: "留ㅼ옣/?꾩옣 ?뚭뎄 以묒떖", en: "Store and field storytelling", de: "Store- und Vor-Ort-Storytelling" },
        dotcom: { ko: "???쒕뵫/?꾪솚 以묒떖", en: "Web, landing, and conversion", de: "Web, Landing und Conversion" },
        brand: { ko: "釉뚮옖??硫붿떆吏/?듯빀 罹좏럹??以묒떖", en: "Brand messaging and integrated campaigns", de: "Markenbotschaft und integrierte Kampagnen" }
    };
    return map[id]?.[currentLocale] || map[id]?.en || map[id]?.ko || id;
}

function getRoleBrief(id) {
    const map = {
        retail: { ko: "怨좉컼??留ㅼ옣?먯꽌 諛붾줈 ?댄빐?섍퀬 ?곕씪 ?섍퀬 ?띔쾶 留뚮뱶???ㅻ챸 ?먮쫫??留뚮벊?덈떎.", en: "Build a story flow that customers immediately understand and want to follow in-store.", de: "Erstellen Sie einen Erkl채rfluss, den Kundinnen und Kunden im Store sofort verstehen und nachmachen m철chten." },
        dotcom: { ko: "?곹뭹 ?섏씠吏? 罹좏럹???섏씠吏?먯꽌 硫붿떆吏? ?꾪솚 ?먮쫫???먯뿰?ㅻ읇寃??곌껐?⑸땲??", en: "Connect product-page messaging and conversion flow more naturally across campaign and landing pages.", de: "Verbinden Sie Botschaft und Conversion-Fluss auf Produkt- und Kampagnenseiten nat체rlicher." },
        brand: { ko: "湲곕뒫蹂대떎 ?ъ슜?먭? ?먮겮??媛먯젙??媛移섎? 以묒떖?쇰줈 ?λ㈃???ㅺ퀎?⑸땲??", en: "Design scenes around emotional value rather than feature explanation.", de: "Gestalten Sie Szenen st채rker um den emotionalen Nutzen als um Funktionsbeschreibungen." }
    };
    return map[id]?.[currentLocale] || map[id]?.en || map[id]?.ko || id;
}

function validateQ3Groups() {
    const requiredGroups = ["housing", "household", "lifestage"];
    const groupLabels = currentLocale === "ko"
        ? { housing: "A. 嫄곗＜吏 ?좏삎", household: "B. ?몃? 援ъ꽦", lifestage: "C. ?쇱씠?꾩뒪?뚯씠吏" }
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

function getSelectedDeviceBreakdown() {
    const selectedIds = [...deviceGrid.querySelectorAll('input[data-node-type="child"]:checked')].map((input) => input.value);
    const customEntries = getCustomEntries(deviceCustomInput.value);
    const samsungIds = selectedIds.filter((id) => Q4_SAMSUNG_IDS.has(id));
    const partnerIds = selectedIds.filter((id) => Q4_PARTNER_IDS.has(id));
    const otherIds = selectedIds.filter((id) => !Q4_SAMSUNG_IDS.has(id) && !Q4_PARTNER_IDS.has(id));
    return {
        selectedIds,
        samsungIds,
        partnerIds,
        otherIds,
        customEntries,
        samsungCount: samsungIds.length,
        partnerCount: partnerIds.length,
        otherCount: otherIds.length,
        totalCount: selectedIds.length + customEntries.length
    };
}

function getSelectedDeviceSignalSet() {
    const signals = new Set();
    [...deviceGrid.querySelectorAll('input[data-node-type="child"]:checked')].forEach((input) => {
        [input.value, input.dataset.label, input.dataset.normalized, getCategoryName(input.value), getCategoryName(input.dataset.normalized || input.value)]
            .filter(Boolean)
            .forEach((value) => signals.add(String(value)));
    });
    getCustomEntries(deviceCustomInput.value).forEach((entry) => signals.add(entry));
    return signals;
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
        .split(/[,\n/]|쨌/)
        .map((item) => item.trim())
        .filter((item) => item && item !== "__auto__");
}

function localizeSentence(key, value = "") {
    const sentences = {
        deviceExact: {
            ko: "?좏깮??移댄뀒怨좊━瑜?洹몃?濡?以묒떖 湲곌린濡?諛섏쁺?덉뒿?덈떎.",
            en: "The selected category was used directly as the core device.",
            de: "Die gew채hlte Kategorie wurde direkt als zentrales Ger채t verwendet."
        },
        deviceFallback: {
            ko: "媛??媛源뚯슫 ???湲곌린瑜??④퍡 怨좊젮???쒕굹由ъ삤瑜??댁뼱媛묐땲??",
            en: "The scenario continues with the closest available alternative device.",
            de: "Das Szenario wird mit dem n채chstliegenden verf체gbaren Alternativger채t fortgef체hrt."
        },
        factsCountry: {
            ko: `${value} ???援ъ꽦`,
            en: `Scenario configured for ${value}`,
            de: `Szenario f체r ${value} konfiguriert`
        },
        factsDevice: {
            ko: `?좎젙 湲곌린: ${value}`,
            en: `Selected device: ${value}`,
            de: `Ausgew채hltes Ger채t: ${value}`
        },
        factsService: {
            ko: `二쇱슂 ?쒕퉬?? ${value}`,
            en: `Primary service: ${value}`,
            de: `Prim채rer Service: ${value}`
        },
        factsNote: {
            ko: `異붿쿇 硫붾え: ${value}`,
            en: `Recommendation note: ${value}`,
            de: `Empfehlungshinweis: ${value}`
        },
        assumptionFallback: {
            ko: "?좏깮??湲곌린? 媛??媛源뚯슫 ???湲곌린瑜??④퍡 怨좊젮?덉뒿?덈떎.",
            en: "The nearest alternative device was considered alongside the selected one.",
            de: "Das n채chstliegende Alternativger채t wurde zus채tzlich ber체cksichtigt."
        },
        assumptionExact: {
            ko: "?좏깮??湲곌린 移댄뀒怨좊━瑜?洹몃?濡?諛섏쁺?덉뒿?덈떎.",
            en: "The selected device category was reflected as-is.",
            de: "Die gew채hlte Ger채tekategorie wurde direkt 체bernommen."
        },
        assumptionGeneral: {
            ko: "?몃? ?섍꼍 ?뺣낫媛 ?녿뒗 遺遺꾩? ?쇰컲?곸씤 ?ъ슜 留λ씫??湲곗??쇰줈 援ъ꽦?덉뒿?덈떎.",
            en: "Where detailed environment data was missing, the scenario was shaped around a general usage context.",
            de: "Wo Detaildaten zur Umgebung fehlten, wurde das Szenario anhand eines allgemeinen Nutzungskontexts aufgebaut."
        },
        checkFit: {
            ko: "?ъ슜 紐⑺몴? ?곌껐?섎뒗 ?쒕굹由ъ삤 諛⑺뼢???≫? ?덉뒿?덈떎.",
            en: "The scenario direction is clearly tied to the user's goal.",
            de: "Die Szenariorichtung ist klar mit dem Nutzerziel verbunden."
        },
        checkAvailability: {
            ko: "???援???먯꽌 ?쒖슜 媛?ν븳 湲곌린瑜?湲곗??쇰줈 援ъ꽦?덉뒿?덈떎.",
            en: "The scenario is built around devices available in the selected market.",
            de: "Das Szenario basiert auf Ger채ten, die im gew채hlten Markt verf체gbar sind."
        },
        checkExecution: {
            ko: "異붿쿇 ?먮쫫???ㅼ젣 ?ъ슜 ?④퀎濡??ㅻ챸?????덉뒿?덈떎.",
            en: "The recommended flow can be explained as a real usage sequence.",
            de: "Der empfohlene Ablauf l채sst sich als reale Nutzungskette erkl채ren."
        },
        checkClarity: {
            ko: "?ъ슜?먭? 泥닿컧?섎뒗 媛移?以묒떖?쇰줈 ?ㅻ챸?⑸땲??",
            en: "The explanation stays centered on value users can actually feel.",
            de: "Die Erkl채rung bleibt auf den tats채chlich sp체rbaren Nutzen f체r Nutzer fokussiert."
        },
        checkMetric: {
            ko: "?쒖슜 ?ъ씤?몄? 湲곕? ?④낵媛 ?곌껐?섏뼱 ?덉뒿?덈떎.",
            en: "Execution points and expected outcomes are logically connected.",
            de: "Umsetzungspunkte und erwartete Ergebnisse sind logisch miteinander verbunden."
        },
        metricRetail: {
            ko: `?ㅻ챸 ?⑥닚??-> 怨좉컼 ?댄빐???곸듅 -> ${value} ?곷떞 ?꾪솚 媛쒖꽑`,
            en: `Simpler explanation -> stronger customer understanding -> improved consultation conversion for ${value}`,
            de: `Einfachere Erkl채rung -> besseres Kundenverst채ndnis -> bessere Beratungskonversion f체r ${value}`
        },
        metricDotcom: {
            ko: "?쒕굹由ъ삤 以묒떖 ?섏씠吏 援ъ꽦 -> 湲곕뒫 ?댄빐 遺??媛먯냼 -> ?대┃怨??λ컮援щ땲 吏꾩엯 ?곸듅",
            en: "Scenario-led page structure -> lower feature-comprehension burden -> higher clicks and basket entries",
            de: "Szenario-basierter Seitenaufbau -> geringere Verst채ndnislast -> mehr Klicks und Warenkorb-Einstiege"
        },
        metricBrand: {
            ko: "媛먯젙 媛移?以묒떖 硫붿떆吏 -> 怨듦컧??利앷? -> 釉뚮옖???좏샇? 怨듭쑀 ?섎룄 ?곸듅",
            en: "Emotion-led messaging -> stronger resonance -> higher brand preference and sharing intent",
            de: "Emotional gepr채gte Botschaft -> st채rkere Resonanz -> h철here Markenpr채ferenz und Teilungsabsicht"
        },
        segment1: {
            ko: `${value}?먯꽌 ?곌껐??媛??寃쏀뿕??愿?ъ씠 ?믪? ?ъ슜?먯링`,
            en: `Users in ${value} who are open to connected home-device experiences`,
            de: `Nutzerinnen und Nutzer in ${value}, die offen f체r vernetzte Ger채teerlebnisse sind`
        },
        segment2: {
            ko: `${value}泥섎읆 ?듭떖 媛移섎? 遺꾨챸?섍쾶 ?먰븯???ъ슜??,
            en: `Users like ${value} who have a clear expectation for the core value`,
            de: `Nutzer wie ${value}, die einen klaren Nutzen erwarten`
        },
        segment3: {
            ko: "蹂듭옟???ㅼ젙蹂대떎 諛붾줈 泥닿컧 媛?ν븳 蹂?붿? ?몄쓽瑜??좏샇?섎뒗 ?ъ슜??,
            en: "Users who prefer immediate convenience and visible change over complex setup",
            de: "Nutzer, die unmittelbaren Komfort und sp체rbare Ver채nderung komplexer Einrichtung vorziehen"
        },
        guide1: {
            ko: `1?④퀎: ${value}瑜??깆뿉 ?곌껐?⑸땲??`,
            en: `Step 1: Connect ${value} to the app.`,
            de: `Schritt 1: Verbinden Sie ${value} mit der App.`
        },
        guide2: {
            ko: `2?④퀎: ${value} 以묒떖 異붿쿇 ?먮쫫???좏깮?⑸땲??`,
            en: `Step 2: Choose the recommended flow centered on ${value}.`,
            de: `Schritt 2: W채hlen Sie den empfohlenen Ablauf rund um ${value}.`
        },
        guide3: {
            ko: "3?④퀎: ??踰??ㅽ뻾??蹂닿퀬 ?꾩슂??遺遺꾨쭔 媛꾨떒??議곗젙?⑸땲??",
            en: "Step 3: Run it once and make only the small adjustments you need.",
            de: "Schritt 3: F체hren Sie den Ablauf einmal aus und passen Sie nur das N철tige an."
        },
        guide4: {
            ko: "4?④퀎: ?먯＜ ?곕뒗 ?먮쫫????ν빐 諛섎났 ?ъ슜?⑸땲??",
            en: "Step 4: Save the flow you use often and repeat it easily.",
            de: "Schritt 4: Speichern Sie den h채ufig genutzten Ablauf und verwenden Sie ihn wiederholt."
        },
        marketGo: {
            ko: `${value} ?ъ슜?먯뿉寃??듭떖 媛移섎? 遺꾨챸?섍쾶 ?꾨떖?????덈뒗 援ъ꽦?낅땲??`,
            en: `This setup can clearly deliver the core value to users in ${value}.`,
            de: `Dieses Setup kann den Kernnutzen f체r Nutzer in ${value} klar vermitteln.`
        },
        marketNoGo: {
            ko: "????ъ슜?먯? 湲곌린 援ъ꽦???꾩쭅 異⑸텇??援ъ껜?곸씠吏 ?딆뒿?덈떎.",
            en: "The target user and device setup are not yet specific enough.",
            de: "Zielnutzer und Ger채tekonfiguration sind noch nicht konkret genug."
        },
        marketComparison: {
            ko: "鍮꾩듂???먮룞??寃쏀뿕怨?鍮꾧탳?대룄 ?댄빐?섍린 ?ъ슫 ?ъ슜 ?λ㈃?쇰줈 ?ㅻ챸?섍린 醫뗭뒿?덈떎.",
            en: "Compared with similar automation ideas, this scenario is easier to explain through a clear usage moment.",
            de: "Im Vergleich zu 채hnlichen Automationsideen l채sst sich dieses Szenario leichter 체ber einen klaren Nutzungsmoment erkl채ren."
        }
    };
    return sentences[key]?.[currentLocale] || sentences[key]?.en || sentences[key]?.ko || value;
}

function localizeRoleText(key, value = "") {
    const map = {
        retailSubtitle: {
            ko: "留ㅼ옣 ?ㅻ챸怨??쒖븞??諛붾줈 ?곌린 醫뗭? ?ъ씤??,
            en: "Points ready for store explanation and recommendation",
            de: "Punkte, die sich direkt f체r Store-Erkl채rung und Empfehlung eignen"
        },
        retailBullet1: {
            ko: `${value} 以묒떖?쇰줈 吏㏃? ?곕え ?ㅽ넗由щ? 援ъ꽦?⑸땲??`,
            en: `Build a short demo story around ${value}.`,
            de: `Erstellen Sie eine kurze Demo-Story rund um ${value}.`
        },
        retailBullet2: {
            ko: `${value}瑜?怨좉컼???ㅼ젣 臾몄젣 ?닿껐 ?몄뼱濡?諛붽퓭 ?ㅻ챸?⑸땲??`,
            en: `Translate ${value} into language that solves the customer's real problem.`,
            de: `횥bersetzen Sie ${value} in eine Sprache, die das tats채chliche Kundenproblem l철st.`
        },
        retailBullet3: {
            ko: "?곷떞 以?諛붾줈 ?곌껐 媛?ν븳 異붽? ?쒖븞 ?ъ씤?몃? 留뚮벊?덈떎.",
            en: "Create add-on recommendation points that can be used immediately during consultation.",
            de: "Schaffen Sie Zusatzempfehlungen, die direkt im Beratungsgespr채ch genutzt werden k철nnen."
        },
        dotcomSubtitle: {
            ko: "?곹뭹 ?섏씠吏? ?꾪솚 ?먮쫫??諛붾줈 ?곌껐???ъ씤??,
            en: "Points ready to connect product pages and conversion flow",
            de: "Punkte zur direkten Verbindung von Produktseite und Conversion-Fluss"
        },
        dotcomBullet1: {
            ko: "?곹뭹 ?ㅻ챸, ?ъ슜 ?λ㈃, CTA瑜????먮쫫?쇰줈 諛곗튂?⑸땲??",
            en: "Arrange product explanation, use moment, and CTA in one continuous flow.",
            de: "Ordnen Sie Produkterkl채rung, Nutzungsmoment und CTA in einem durchgehenden Ablauf an."
        },
        dotcomBullet2: {
            ko: "?좏깮 湲곌린 以묒떖?쇰줈 ?곸꽭 ?섏씠吏 硫붿떆吏瑜?媛꾧껐?섍쾶 留뚮벊?덈떎.",
            en: "Keep the detail-page message concise around the selected device.",
            de: "Halten Sie die Botschaft der Detailseite rund um das gew채hlte Ger채t pr채gnant."
        },
        dotcomBullet3: {
            ko: "異붿쿇 ?먮쫫??諛곕꼫? 移대뱶, FAQ濡??섎늻???쒖슜?⑸땲??",
            en: "Reuse the recommended flow across banners, cards, and FAQ sections.",
            de: "Nutzen Sie den empfohlenen Ablauf erneut in Bannern, Karten und FAQ-Bereichen."
        },
        dotcomCopy: {
            ko: `${value} ?섎굹濡??쒖옉???앺솢 ?꾨컲?쇰줈 ?뺤옣?섎뒗 寃쏀뿕??蹂댁뿬以띾땲??`,
            en: `Show how the experience can start with ${value} and expand across daily life.`,
            de: `Zeigen Sie, wie das Erlebnis mit ${value} beginnt und sich 체ber den Alltag erweitert.`
        },
        brandSubtitle: {
            ko: "媛먯젙 媛移섏? 罹좏럹???λ㈃ 以묒떖 ?ъ씤??,
            en: "Points centered on emotional value and campaign scenes",
            de: "Punkte mit Fokus auf emotionalen Wert und Kampagnenszenen"
        },
        brandBullet1: {
            ko: "湲곕뒫蹂대떎 ?ъ슜?먭? ?먮겮???덉떖怨??몃━?⑥쓣 以묒떖?쇰줈 硫붿떆吏瑜??뺣━?⑸땲??",
            en: "Organize the message around reassurance and convenience rather than features.",
            de: "Ordnen Sie die Botschaft st채rker um Sicherheit und Komfort als um Funktionen."
        },
        brandBullet2: {
            ko: "?쇱긽?먯꽌 諛곕젮諛쏅뒗 ?쒓컙???듭떖 ?λ㈃?쇰줈 ?ъ슜?⑸땲??",
            en: "Use the moment of feeling cared for in daily life as the core scene.",
            de: "Nutzen Sie den Moment des Umsorgtseins im Alltag als zentrale Szene."
        },
        brandBullet3: {
            ko: "吏㏃? ?곸긽怨??뚯뀥 移댄뵾, 鍮꾩＜??肄섏뀎?몃줈 ?뺤옣?섍린 ?쎄쾶 援ъ꽦?⑸땲??",
            en: "Shape it so it can expand easily into short video, social copy, and visual concepts.",
            de: "Gestalten Sie es so, dass es sich leicht auf Kurzvideo, Social Copy und visuelle Konzepte ausweiten l채sst."
        },
        brandCopy: {
            ko: "湲곗닠???욎꽌 蹂댁씠湲곕낫???ъ슜?먮? 癒쇱? 諛곕젮?섎뒗 寃쏀뿕?쇰줈 ?ㅻ챸?⑸땲??",
            en: "Explain it as an experience that puts people first rather than technology first.",
            de: "Beschreiben Sie es als Erlebnis, das Menschen vor Technologie stellt."
        }
    };
    return map[key]?.[currentLocale] || map[key]?.en || map[key]?.ko || value;
}

/* ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧
   ?먮젅?댁뀡 紐⑤뱶 ??Explore Contents DB 留ㅼ묶 + UI ?뚮뜑留?
   ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧 */

let curationDbV1 = null;
let curationDbV2 = null;
let curationLoaded = false;
let latestSelectionSummary = null;  // Selection Stage ?곗텧臾???AI ?꾨＼?꾪듃 諛?output ?뚮뜑留곸뿉 ?꾨떖
let _latestCurationResults = [];    // 理쒓렐 ?먮젅?댁뀡 寃곌낵 (campaign output?먯꽌 李몄“)

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

// ???쒖옉 ??DB瑜?誘몃━ 濡쒕뱶 (鍮꾨룞湲? ?쇰툝濡쒗궧)
loadCurationDb();

/**
 * Q2 ?쇱씠?꾩뒪???媛以묒튂 濡쒖쭅怨?Q3 湲곌린 蹂대꼫?ㅻ? 寃고빀???듯빀 媛以묒튂 ?곗텧 ?⑥닔 (Step 4 留ㅼ묶 ?붿쭊??
 */
function getIntegratedTagScores(input) {
    const purpose = input.purpose || "";
    const q1Traits = typeof inferQ1Traits === "function" ? inferQ1Traits() : [];
    
    // Q1_WEIGHT, Q2_WEIGHT (Q2 ?붾㈃ 濡쒖쭅怨??숈씪)
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

    // 紐낆떆???섎룄(Primary)
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

    // ?몃? 援ъ꽦 (Household)
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

    // ?쇱씠?꾩뒪?뚯씠吏
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

    // 嫄곗＜吏 (Housing)
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

    // Q1 留ㅼ쭅 ?ㅼ썙??
    if (typeof MAGIC_KEY_TO_EXPLORE_TAGS !== "undefined") {
        const magicKeys = input.magicKeywords || [];
        for (const key of magicKeys) {
            const q1Pts = Math.round(perQ1 * 0.8);
            (MAGIC_KEY_TO_EXPLORE_TAGS[key] || []).forEach(tag => addTagScore(tag, q1Pts, `q1_${key}`));
        }
    }

    // 而ㅼ뒪? 留덉폆 由ъ꽌移??쒓렇 諛섏쁺
    if (_customResearchData?.applied && Array.isArray(_customResearchData.tags)) {
        const CUSTOM_RESEARCH_WEIGHT = 12;
        _customResearchData.tags.forEach(tag => {
            addTagScore(tag, CUSTOM_RESEARCH_WEIGHT, `custom_research_${tag}`);
        });
    }

    // 異붽? ?띿뒪??蹂대꼫??
    const purposeBonus = {
        "諛섎젮|??pet|dog|cat": "Care for your pet",
        "遺紐??쒕땲??senior": "Care for seniors",
        "?꾩씠|?먮?|kid|child": "Care for kids",
        "?먮꼫吏|?덉빟|energy|save": "Save energy",
        "蹂댁븞|?덉쟾|security|safe": "Keep your home safe",
        "?섎㈃|??sleep": "Sleep well",
        "寃뚯엫|?곹솕|music": "Enhanced mood",
        "?명긽|泥?냼|媛??chore": "Help with chores",
        "?대룞|嫄닿컯|health": "Stay fit & healthy"
    };
    Object.entries(purposeBonus).forEach(([pattern, tag]) => {
        if (new RegExp(pattern, "i").test(purpose.toLowerCase())) addTagScore(tag, 8, `purpose_${tag}`);
    });

    // ?좎궗 ?쒓렇 蹂묓빀 (TAG_MERGE) - 以묐났 六ν?湲곕텇 ??컧(0.9諛곗쑉 ?곸슜)
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

    // 湲곌린 蹂대꼫??寃고빀
    const devices = input.devices || [];
    const integratedScores = Object.entries(tagScoreMap).map(([tag, score]) => {
        let devBonus = 0;
        if (typeof DEVICE_TO_EXPLORE_TAGS !== "undefined") {
            const hasSupport = devices.some(d => (DEVICE_TO_EXPLORE_TAGS[d] || []).includes(tag));
            if (hasSupport) devBonus = 15; // Q3 湲곌린 留ㅼ묶????????媛以묒튂 吏곸젒 二쇱엯
        }
        return { tag, score: score + devBonus };
    });

    // ?먯닔 ?뺢퇋??(?붿쭊 ?곹빀?깆쓣 ?꾪빐 理쒓퀬?먯쓣 12?먯쑝濡?留욎땄)
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
    const magicKeywords = [..._magicAppliedSelected];

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

    // 以묎컙 ?곗씠???섏쭛: 湲곗〈???낅┰???쒓렇 ?꾩텧 濡쒖쭅 ?먭린, Q2-Q3 寃고빀 濡쒖쭅?쇰줈 蹂寃?
    const tagScores = getIntegratedTagScores(input);

    const v2Scenarios = curationDbV2.scenarios || [];
    const totalPool = (curationDbV1.scenarios || []).length + v2Scenarios.length;
    
    // ?붿쭊???듯빀 媛以묒튂 二쇱엯 (overrideTagScores)
    const results = curateScenarios(input, curationDbV1.scenarios, v2Scenarios, { maxResults: 5, minScore: 5, overrideTagScores: tagScores });

    // Selection Summary 援ъ텞
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

    // ?낅젰 ?쇰꺼 ?섏쭛 (?꾨줈?몄뒪 移대뱶??
    const personaLabelsForCard = personaIds.map(id => {
        const el = document.querySelector(`input[value="${id}"]`);
        return el?.dataset?.label || id;
    }).filter(Boolean);
    const deviceLabelsForCard = getSelectedDeviceLabels();

    // 留ㅼ묶 ?꾨줈?몄뒪 移대뱶 ?뚮뜑留????뺤씤 ??寃곌낵 ?쒖떆
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

/* ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧
   留ㅼ묶 ?꾨줈?몄뒪 移대뱶 ??4?④퀎 ?쒓컖??+ ?뺤씤 踰꾪듉 ?뚮줈??
   ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧 */
let _mpCurrentStep = 0;
let _mpBypassProcess = false;

function renderMatchingProcess(ctx) {
    const frame = document.getElementById("matching-process-frame");
    const container = document.getElementById("mp-cards");
    if (!frame || !container) return;

    const isKo = currentLocale === "ko";
    _mpCurrentStep = 0;

    // 4?④퀎 移대뱶 ?곗씠??援ъ꽦
    const cards = buildMpCards(ctx, isKo);
    container.innerHTML = cards.map((card, i) =>
        `<div class="mp-card${i === 0 ? "" : " locked"}" data-mp-step="${i}" style="animation-delay:${i * 0.1}s">
            <div class="mp-card-header">
                <span class="mp-card-num">${i + 1}</span>
                <span class="mp-card-title">${card.title}</span>
                <span class="mp-card-check">??/span>
            </div>
            <div class="mp-card-body">
                <p class="mp-card-helper">${card.helper}</p>
                ${card.content}
                <button type="button" class="mp-confirm-btn" data-mp-step="${i}">
                    ${i < cards.length - 1
                        ? (isKo ? "?뺤씤 ???ㅼ쓬 ?④퀎 蹂닿린" : "Confirm ??See next step")
                        : (isKo ? "?뺤씤 ??留ㅼ묶???쒕굹由ъ삤 蹂닿린" : "Confirm ??View matched scenarios")}
                </button>
            </div>
        </div>`
    ).join("");

    frame.classList.remove("hidden");

    // ?뺤씤 踰꾪듉 ?대깽??
    container.querySelectorAll(".mp-confirm-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const step = parseInt(btn.dataset.mpStep, 10);
            const card = container.querySelector(`[data-mp-step="${step}"]`);
            if (card) {
                card.classList.add("done");
                btn.disabled = true;
                btn.textContent = isKo ? "???뺤씤 ?꾨즺" : "??Confirmed";
            }

            // ?ㅼ쓬 移대뱶 怨듦컻
            const next = container.querySelector(`[data-mp-step="${step + 1}"]`);
            if (next) {
                next.classList.remove("locked");
                next.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }

            // 留덉?留??④퀎 ?뺤씤 ?????먮젅?댁뀡 寃곌낵 ?쒖떆
            if (step === cards.length - 1) {
                renderCurationInputSummary(ctx.personaIds, ctx.devices, ctx.purpose, ctx.results);
                renderCurationResults(ctx.results, ctx.devices);

                // Flow Tracker ?낅뜲?댄듃
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

    // ?? Q2 ?ㅼ퐫?대낫??寃곌낵 媛?몄삤湲?(?곗옣?? ??
    const q2Traits = inferSegmentTraits(getSelectedSegment(), purposeInput.value.trim());
    const q1Traits = inferQ1Traits();
    const coreValues = inferCoreValues([...q2Traits, ...q1Traits.map(t => t.trait)], purposeInput.value.trim());
    const direction = inferScenarioDirection(q2Traits, purposeInput.value.trim());

    // Q2 ?쒕굹由ъ삤 ?쒓렇 ?쒓? 留ㅽ븨
    const tagKoMap = {
        "Save energy": "?먮꼫吏 ?덉빟", "Keep your home safe": "???덉쟾쨌蹂댁븞",
        "Help with chores": "媛???먮룞??, "Care for kids": "?먮? 耳??,
        "Care for seniors": "?쒕땲??耳??, "Care for your pet": "諛섎젮?숇Ъ 耳??,
        "Sleep well": "?섎㈃ 媛쒖꽑", "Enhanced mood": "遺꾩쐞湲??곗텧",
        "Stay fit & healthy": "嫄닿컯쨌?쇳듃?덉뒪", "Easily control your lights": "議곕챸 ?쒖뼱",
        "Keep the air fresh": "怨듦린吏?愿由?, "Find your belongings": "遺꾩떎臾?李얘린",
        "Family care": "媛議??뚮큵", "Multicultural family support": "?ㅻЦ??媛議?吏??
    };
    const localizeScenarioTag = (tag) => isKo ? (tagKoMap[tag] || tag) : tag;

    // ?? Card 1: ?㎥ 留ㅼ묶 而⑦뀓?ㅽ듃 ?붿빟 ??
    const clusterNames = coreValues.slice(0, 2).join(" + ");
    const deviceChips = [...new Set(deviceLabels.length ? deviceLabels : getSelectedDeviceLabels())].map(l =>
        `<span class="mp-tag"><span class="mp-tag-icon">?벑</span>${escapeHtml(l)}</span>`
    ).join("");

    const card1 = {
        title: isKo ? "?㎥ 留ㅼ묶 而⑦뀓?ㅽ듃 ?붿빟" : "?㎥ Matching Context Summary",
        helper: isKo
            ? "Q1~Q3?먯꽌 ?뺤젙???寃??꾨줈?꾧낵 諛섏쁺 湲곌린瑜?湲곗??쇰줈 ?쒕굹由ъ삤瑜??먯깋?⑸땲??"
            : "Searching scenarios based on your confirmed target profile and selected devices from Q1?밦3.",
        content: `
            <div class="mp-context-grid">
                <div class="mp-context-item">
                    <span class="mp-context-label">${isKo ? "紐⑺몴 ?섎Ⅴ?뚮굹" : "Target Persona"}</span>
                    <span class="mp-context-value"><strong>${escapeHtml(clusterNames)}</strong></span>
                </div>
                <div class="mp-context-item">
                    <span class="mp-context-label">${isKo ? "?쒕굹由ъ삤 諛⑺뼢" : "Scenario Direction"}</span>
                    <span class="mp-context-value">${escapeHtml(direction)}</span>
                </div>
                <div class="mp-context-item">
                    <span class="mp-context-label">${isKo ? "諛섏쁺 湲곌린" : "Selected Devices"}</span>
                    <div class="mp-tags">${deviceChips}</div>
                </div>
                ${purpose ? `<div class="mp-context-item">
                    <span class="mp-context-label">${isKo ? "異붽? ?붽뎄?ы빆" : "Additional Context"}</span>
                    <span class="mp-context-value" style="font-style:italic">"${escapeHtml(purpose)}"</span>
                </div>` : ""}
            </div>
        `
    };

    // ?? Card 2: ?㎜ ?쒕굹由ъ삤 媛以묒튂 寃고빀 (Q2 ?곗옣?? ??
    // Q2 ?ㅼ퐫?대낫?쒖쓽 ?쒓렇 ?먯닔瑜?湲곌린 媛?μ꽦怨?寃고빀
    const combinedScores = tagScores.map(t => {
        const q2Display = localizeScenarioTag(t.tag);
        // 湲곌린 留ㅼ묶 蹂대꼫???뺤씤
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
            ? `<span class="mp-dev-badge">${isKo ? "湲곌린 吏?? : "device ??}</span>`
            : "";
        return `<div class="mp-weight-row">
            <span class="mp-weight-label">${escapeHtml(t.display)}${devBadge}</span>
            <div class="mp-weight-bar-bg"><div class="mp-weight-bar" style="transform:scaleX(${pct / 100})"></div></div>
            <span class="mp-weight-score">${t.score}${isKo ? "?? : "pt"}</span>
        </div>`;
    }).join("");

    const card2 = {
        title: isKo ? "?㎜ ?쒕굹由ъ삤 媛以묒튂 寃고빀" : "?㎜ Combined Scenario Weights",
        helper: isKo
            ? "Q2?먯꽌 ?꾩텧???쇱씠?꾩뒪????붽뎄?꾩? Q3 湲곌린???ㅽ뻾 媛?μ꽦??寃고빀??理쒖쥌 媛以묒튂?낅땲?? '湲곌린 吏?? ?쒖떆??蹂댁쑀 湲곌린濡??대떦 ?쒕굹由ъ삤瑜?諛붾줈 援ы쁽?????덉쓬???섎??⑸땲??"
            : "Final weights combining Q2 lifestyle demands with Q3 device capabilities. 'device ?? means your devices can directly execute this scenario.",
        content: `
            <div style="margin-bottom:6px;font-size:0.72rem;color:var(--muted)">
                ${isKo ? "?곗텧: Q2 ?대윭?ㅽ꽣 異붾줎(?쒕꼫吏 횞1.2 쨌 援먯감寃利?횞1.5) + Q3 湲곌린 留ㅼ묶 蹂대꼫?? : "Calculation: Q2 cluster reasoning (synergy 횞1.2 쨌 cross-validation 횞1.5) + Q3 device match bonus"}
            </div>
            ${combinedRows}
        `
    };

    // ?? Card 3: ???ㅼ퐫?대쭅 怨쇱젙 ??
    const matchedCount = results.length;
    const topScore = results.length > 0 ? results[0]._score : 0;

    const card3 = {
        title: isKo ? "???쒕굹由ъ삤 ?ㅼ퐫?대쭅" : "??Scenario Scoring",
        helper: isKo
            ? `??媛以묒튂瑜?湲곗??쇰줈 ${totalPool}媛??쒕굹由ъ삤 DB瑜??먯깋???곹빀???먯닔瑜?怨꾩궛?덉뒿?덈떎. ?꾨옒 ?レ옄??留ㅼ묶 媛쒖닔, 理쒓퀬 ?먯닔, ?꾩껜 ?먯깋 ????삵빀?덈떎.`
            : `Scored ${totalPool} scenarios in the DB using the weights above. The numbers below show matched count, top fit score, and total search pool.`,
        content: `
            <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:8px">
                <div style="text-align:center;padding:8px 16px;border-radius:10px;background:#e8f5e9;flex:1;min-width:100px">
                    <div style="font-size:1.4rem;font-weight:800;color:#2e7d32">${matchedCount}</div>
                    <div style="font-size:0.7rem;color:#558b2f">${isKo ? "留ㅼ묶 ?쒕굹由ъ삤" : "Matched"}</div>
                    <div style="font-size:0.62rem;color:#6b8f5d;margin-top:2px">${isKo ? "議곌굔???듦낵??異붿쿇 ?? : "Scenarios that passed matching"}</div>
                </div>
                <div style="text-align:center;padding:8px 16px;border-radius:10px;background:#e3f2fd;flex:1;min-width:100px">
                    <div style="font-size:1.4rem;font-weight:800;color:#1565c0">${topScore}</div>
                    <div style="font-size:0.7rem;color:#1976d2">${isKo ? "理쒓퀬 ?곹빀?? : "Top fit score"}</div>
                    <div style="font-size:0.62rem;color:#5b8bb8;margin-top:2px">${isKo ? "?곸쐞 1媛??쒕굹由ъ삤??珥앹젏" : "Total score of the top scenario"}</div>
                </div>
                <div style="text-align:center;padding:8px 16px;border-radius:10px;background:#f3e5f5;flex:1;min-width:100px">
                    <div style="font-size:1.4rem;font-weight:800;color:#7b1fa2">${totalPool}</div>
                    <div style="font-size:0.7rem;color:#8e24aa">${isKo ? "?꾩껜 DB" : "Total DB"}</div>
                    <div style="font-size:0.62rem;color:#9961b5;margin-top:2px">${isKo ? "?대쾲??鍮꾧탳???꾩껜 ?꾨낫 ?? : "All candidates compared this run"}</div>
                </div>
            </div>
            <div class="mp-score-note">${isKo
                ? "理쒓퀬 ?곹빀?꾨뒗 100??留뚯젏???꾨땲?? Q2 媛以묒튂? Q3 湲곌린 留ㅼ묶 蹂대꼫?ㅻ? ?⑹궛???곷? ?먯닔?낅땲?? ?レ옄媛 ?믪쓣?섎줉 ?꾩옱 議곌굔怨?????留욎뒿?덈떎."
                : "Top fit score is not a 100-point grade. It is a relative score combining Q2 weights and Q3 device-match bonuses. Higher means a better fit for your current inputs."}</div>
        `
    };

    // ?? Card 4: ?렞 理쒖쥌 留ㅼ묶 寃곌낵 ??
    const previewRows = results.slice(0, 5).map((r, i) => {
        const f = (typeof formatCurationResult === "function") ? formatCurationResult(r) : { title: r.story_title || "", source: r._source || "" };
        const tags = (r._matchedTags || []).slice(0, 3).map(t => typeof t === "object" ? t.tag : t);
        const tagDisplay = tags.map(t => localizeScenarioTag(t));
        return `<div class="mp-scenario-row">
            <span class="mp-scenario-rank">${i + 1}</span>
            <div class="mp-scenario-info">
                <div class="mp-scenario-title">${escapeHtml(f.title || r.story_title || "")}</div>
                <div class="mp-scenario-meta">${escapeHtml(f.source || r._source || "")} 쨌 ${tagDisplay.map(t => escapeHtml(t)).join(", ")}</div>
            </div>
            <span class="mp-scenario-score">${r._score}${isKo ? "?? : "pt"}</span>
        </div>`;
    }).join("");

    const card4 = {
        title: isKo ? "?렞 理쒖쥌 留ㅼ묶 寃곌낵" : "?렞 Final Match Results",
        helper: isKo
            ? "Q2 ?寃??꾨줈??+ Q3 湲곌린 議고빀??媛???곹빀???쒕굹由ъ삤 ?쒖쐞?낅땲?? ?뺤씤?섏떆硫??곸꽭 移대뱶瑜?蹂????덉뒿?덈떎."
            : "Scenarios ranked by fit with your Q2 profile + Q3 devices. Confirm to see detailed cards.",
        content: previewRows || `<p style="color:var(--muted);font-size:0.82rem">${isKo ? "留ㅼ묶???쒕굹由ъ삤媛 ?놁뒿?덈떎." : "No matching scenarios found."}</p>`
    };

    return [card1, card2, card3, card4];
}

function renderCurationInputSummary(personaIds, devices, purpose, results) {
    const summaryEl = document.getElementById("curation-input-summary");
    if (!summaryEl) return;

    const selectedMarket = marketOptions.find(m => m.siteCode === countrySelect.value);
    const city = getCityValue();
    const isKo = currentLocale === "ko";

    // ?좏깮????ぉ?ㅼ쓽 ?쇰꺼 ?섏쭛
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

    // 留ㅼ묶 ?댁쑀 ?앹꽦
    const topTags = results.length > 0
        ? [...new Set(results.slice(0, 3).flatMap(r => r._matchedTags?.map(t => t.tag) || r.tags || []))].slice(0, 4)
        : [];

    const reasonText = isKo
        ? topTags.length
            ? `???낅젰 議고빀?먯꽌 <strong>${topTags.join(", ")}</strong> ?ㅼ썙?쒓? ?꾩텧?섏뼱, ?대떦 ?ㅼ썙?쒕? ?ы븿??${results.length}媛??쒕굹由ъ삤媛 留ㅼ묶?섏뿀?듬땲??`
            : "?낅젰??議곌굔?쇰줈 留ㅼ묶 媛?ν븳 ?쒕굹由ъ삤瑜?寃?됲뻽?듬땲??"
        : topTags.length
            ? `Keywords <strong>${topTags.join(", ")}</strong> derived from your input matched ${results.length} scenario(s).`
            : "Searched for scenarios matching your input conditions.";

    summaryEl.innerHTML = `
        <div>${isKo ? "?좏깮???낅젰 ?뺣낫" : "Your selections"}: ${tagHtml}</div>
        ${purpose ? `<div style="margin-top:4px">${isKo ? "異붽? ?ㅻ챸" : "Context"}: ${escapeHtml(purpose)}</div>` : ""}
        <div class="match-reason">${reasonText}</div>
    `;
}

function renderCurationResults(results, selectedDevices) {
    const frame = document.getElementById("curation-frame");
    const container = document.getElementById("curation-results");
    if (!frame || !container) return;

    // 罹좏럹??output?먯꽌 李몄“?????덈룄濡????
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

    // 濡쒖???踰덉뿭 留ㅽ븨 (?곸뼱 ?쒕굹由ъ삤 ?쒕ぉ/蹂몃Ц ???꾩???
    const needsTranslation = currentLocale !== "en";
    const scenarioTitleTranslations = {
        ko: {
            "Save energy": "?먮꼫吏 ?덉빟", "Keep your home safe": "吏묒쓣 ?덉쟾?섍쾶",
            "Help with chores": "媛???꾩?", "Care for kids": "?꾩씠 ?뚮큵",
            "Care for seniors": "?쒕땲??耳??, "Care for your pet": "諛섎젮?숇Ъ 耳??,
            "Sleep well": "?숇㈃ ?꾩?", "Enhanced mood": "遺꾩쐞湲??곗텧",
            "Stay fit & healthy": "嫄닿컯 愿由?, "Easily control your lights": "議곕챸 媛꾪렪 ?쒖뼱",
            "Keep the air fresh": "怨듦린吏?愿由?, "Find your belongings": "遺꾩떎臾?李얘린",
            "Time saving": "?쒓컙 ?덉빟", "Energy Saving": "?먮꼫吏 ?덇컧",
            "Security": "蹂댁븞", "Family care": "媛議??뚮큵", "Easy to use": "媛꾪렪 ?ъ슜"
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

    // ?뺤옣 援щЦ 踰덉뿭 留?(?쒓뎅?? ??Explore ?쒕굹由ъ삤 蹂몃Ц???먯＜ ?깆옣?섎뒗 臾멸뎄
    const bodyPhraseMapKo = {
        "Give your pet customised care": "諛섎젮?숇Ъ?먭쾶 留욎땄??耳?대? ?쒓났?섏꽭??,
        "Take care of your pet even while you're away": "?몄텧 以묒뿉??諛섎젮?숇Ъ???뚮낫?몄슂",
        "Check up on them": "諛섎젮?숇Ъ ?곹깭瑜??뺤씤?섏꽭??,
        "Start Pet Care with just a photo": "?ъ쭊 ???μ쑝濡???耳?대? ?쒖옉?섏꽭??,
        "automatically identify the breed": "?먮룞?쇰줈 ?덉쥌???앸퀎?⑸땲??,
        "reviewing the daily activity": "?쇱씪 ?쒕룞???뺤씤?⑸땲??,
        "Help your pet enjoy its time alone": "諛섎젮?숇Ъ???쇱옄 ?덈뒗 ?쒓컙??利먭만 ???덇쾶 ?꾩?二쇱꽭??,
        "automatic feeder": "?먮룞 湲됱떇湲?, "regular meals": "洹쒖튃?곸씤 ?앹궗",
        "perfect temperature": "理쒖쟻 ?⑤룄", "atmosphere": "遺꾩쐞湲?,
        "barking is detected": "吏뽯뒗 ?뚮━媛 媛먯??섎㈃",
        "Set the right temperature": "?곸젙 ?⑤룄瑜??ㅼ젙?섏꽭??,
        "save energy": "?먮꼫吏瑜??덉빟?섏꽭??, "Save energy": "?먮꼫吏瑜??덉빟?섏꽭??,
        "while you're away": "?몄텧 以묒뿉??, "when you come home": "吏묒뿉 ?뚯븘?ㅻ㈃",
        "before you arrive": "?꾩갑?섍린 ?꾩뿉",
        "Smart TV": "?ㅻ쭏??TV", "Vacuum Cleaner": "濡쒕큸泥?냼湲?,
        "Air Conditioner": "?먯뼱而?, "Air Purifier": "怨듦린泥?젙湲?,
        "Galaxy Smartphone": "媛ㅻ윮???ㅻ쭏?명룿", "Galaxy Watch": "媛ㅻ윮???뚯튂",
        "SmartThings": "?ㅻ쭏?몄떛??,
        "your home safe": "吏묒쓣 ?덉쟾?섍쾶",
        "monitor your home": "吏묒쓣 紐⑤땲?곕쭅?섏꽭??,
        "security camera": "蹂댁븞 移대찓??,
        "door lock": "?꾩뼱??, "motion sensor": "?숈옉 ?쇱꽌",
        "automate your daily routine": "?쇱긽???먮룞?뷀븯?몄슂",
        "control your lights": "議곕챸???쒖뼱?섏꽭??,
        "fresh air": "?좎꽑??怨듦린", "air quality": "怨듦린吏?,
        "sleep better": "?숇㈃??痍⑦븯?몄슂", "good night's sleep": "醫뗭? ?섎㈃",
        "washing machine": "?명긽湲?, "dryer": "嫄댁“湲?,
        "robot vacuum": "濡쒕큸泥?냼湲?, "dishwasher": "?앷린?몄쿃湲?,
        "refrigerator": "?됱옣怨?, "oven": "?ㅻ툙",
        "family members": "媛議?援ъ꽦??, "children": "?먮?", "kids": "?꾩씠",
        "seniors": "?쒕땲??, "elderly": "?대Ⅴ??,
        "Pet Accessory": "???≪꽭?쒕━", "Third-party": "?쒕뱶?뚰떚",
        "Jet Bot": "?쒗듃遊?
    };

    // 媛꾩씠 踰덉뿭 ?⑥닔: ?곷Ц ?띿뒪?몄뿉???뚮젮吏??ㅼ썙??諛?援щЦ??濡쒖??쇰줈 移섑솚
    function translateSnippet(text) {
        if (!text || !needsTranslation) return "";
        let translated = text;
        // 湲?援щЦ遺??癒쇱? 移섑솚 (???뺥솗??留ㅼ묶)
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
        const bodyText = String(f.originalText || f.narrative || "").trim();
        const truncated = bodyText.length > 250 ? bodyText.substring(0, 250) + "?? : bodyText;

        // 濡쒖???踰덉뿭
        const titleTranslation = needsTranslation ? translateSnippet(f.title) : "";
        const bodyTranslation = needsTranslation ? translateSnippet(bodyText) : "";

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
                ${f.article ? `<div style="font-size:0.76rem;color:var(--muted);margin-bottom:8px">?뱛 ${escapeHtml(f.article)}</div>` : ""}
                <div class="curation-card-meta">${tagsHtml}</div>
                <details class="curation-card-details" ${idx === 0 ? "open" : ""}><summary class="curation-card-summary">${escapeHtml(isKo ? "시나리오 전체 내용 보기" : "View full scenario details")}</summary><div class="curation-card-body"><p>${escapeHtml(bodyText)}</p>${bodyTranslation ? `<p class="curation-body-local">${escapeHtml(bodyTranslation)}</p>` : ""}</div></details>
                ${devicesHtml ? `<div class="curation-card-devices">${devicesHtml}</div>` : ""}
                ${linksHtml ? `<div class="curation-card-links">${linksHtml}</div>` : ""}
                <div class="curation-card-actions">
                    <button type="button" class="curation-ai-btn" data-curation-idx="${idx}">
                        ${isKo ? "?쨼 ???쒕굹由ъ삤 湲곕컲?쇰줈 AI ?뺤옣 ?앹꽦" : "?쨼 Generate AI-expanded scenario from this"}
                    </button>
                </div>
            </article>
        `;
    }).join("");

    // 留ㅼ묶 ?꾨즺 ?덈궡 HELPER 諛곕꼫 (5媛??쒕굹由ъ삤 ?꾨옒)
    const helperBanner = document.createElement("div");
    helperBanner.className = "curation-completion-helper";
    helperBanner.innerHTML = isKo
        ? `<div class="curation-helper-icon">??/div>
           <div class="curation-helper-content">
               <p class="curation-helper-title">?쒕굹由ъ삤 留ㅼ묶???꾨즺?섏뿀?듬땲??/p>
               <p class="curation-helper-desc">???쒕굹由ъ삤 以??섎굹瑜??좏깮?섏뿬 <strong>AI ?뺤옣 ?앹꽦</strong> 踰꾪듉???꾨Ⅴ硫? ?대떦 ?쒕굹由ъ삤瑜?湲곕컲?쇰줈 ?먰븯???뺤떇怨??댁슜?쇰줈 ?ш뎄?깊빐 ?쒕┰?덈떎.</p>
               <ul class="curation-helper-steps">
                   <li>移댄뀒怨좊━瑜??좏깮?섏뀛???섍퀬, ?꾩슂???댁슜??吏곸젒 ?곸쑝?붾룄 ?⑸땲??/li>
                   <li>AI 湲곕컲?쇰줈 ?먰븯???쒕굹由ъ삤瑜??앹꽦???쒕┰?덈떎</li>
               </ul>
           </div>`
        : `<div class="curation-helper-icon">??/div>
           <div class="curation-helper-content">
               <p class="curation-helper-title">Scenario matching complete</p>
               <p class="curation-helper-desc">Select a scenario above and click <strong>AI Expand</strong> to customize it into your desired format and content.</p>
               <ul class="curation-helper-steps">
                   <li>You can pick a category or describe what you need</li>
                   <li>AI will generate the scenario tailored to your needs</li>
               </ul>
           </div>`;
    container.appendChild(helperBanner);

    // "AI ?뺤옣" 踰꾪듉 ?대깽??
    container.querySelectorAll(".curation-ai-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const idx = parseInt(btn.dataset.curationIdx, 10);
            const scenario = results[idx];
            if (scenario) triggerAiFromCuration(scenario);
        });
    });

    frame.classList.remove("hidden");

    // STEP 1 ?꾨즺 ???ы띁 ?낅뜲?댄듃
    updateOutputFlowTracker(1, { 1: "done", 2: "waiting", 3: "waiting" });
    setSectionStatusBadge("curation-title", "done");
    updateSectionHelper("curation-helper",
        isKo
            ? "?낅젰?섏떊 議곌굔??媛????留욌뒗 ?쒕굹由ъ삤瑜?李얠븯?듬땲?? ?섎굹瑜??좏깮?섎㈃ ?ㅼ쓬 ?④퀎濡??섏뼱媛묐땲??"
            : "We found the best-matching scenarios. Select one to proceed to the next step.");
}

function triggerAiFromCuration(scenario) {
    const f = formatCurationResult(scenario);

    // latestSelectionSummary媛 ?덉쑝硫??좏깮???쒕굹由ъ삤瑜?primary濡??낅뜲?댄듃
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
            ? `"${f.title}" ?쒕굹由ъ삤瑜?吏곸젒 ?좏깮?섏뀲?듬땲?? (?곹빀??${f.score}?? ?뚯뒪: Explore ${scenario._source || "v2.0"})`
            : `You selected "${f.title}" (score: ${f.score}, source: Explore ${scenario._source || "v2.0"}).`;
    }

    // ?? 13-Section Campaign Output ?ㅽ뻾 ??
    // aiScenarioContext 鍮뚮뱶 (generateScenario?먯꽌 ?ъ슜?섎뜕 寃껉낵 ?숈씪)
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
        intentTags: [...(_magicAppliedSelected || [])],
        missionBucket: typeof analyzeIntent === "function" ? analyzeIntent(rawPurpose, rawSelectedSegment, selectedDevices, []).missionBucket : "Discover",
        locale: currentLocale,
        provider: selectedProvider,
        selectionSummary: latestSelectionSummary || null
    };

    // ?먮젅?댁뀡 寃곌낵 媛?몄삤湲?(renderCurationResults?먯꽌 ?ъ슜??results)
    const curationResults = _latestCurationResults || [];

    if (typeof renderOutputCategories === "function") {
        renderOutputCategories();
        setSectionStatusBadge("category-title", "done");
    }

    // 13-section output ?ㅽ뻾
    if (typeof launchCampaignOutput === "function") {
        launchCampaignOutput(curationResults, scenario, context, latestSelectionSummary);
    }
}

/* ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧
   寃곌낵臾?移댄뀒怨좊━ ?좏깮 ??吏곷Т蹂??꾩냽 ?좏깮??
   ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧 */

const OUTPUT_CATEGORIES = [
    { id: "campaign", icon: "?뱼", titleKo: "罹좏럹??硫붿떆吏 諛⑺뼢", titleEn: "Campaign messaging", descKo: "?쒕굹由ъ삤 湲곕컲 ?쒓렇?쇱씤, ?뚭뎄 ?ъ씤?? 1-liner 移댄뵾", descEn: "Taglines, appeal points, and one-liner copy from the scenario" },
    { id: "retail", icon: "?룵", titleKo: "由ы뀒???꾩옣 ?곸슜??, titleEn: "Retail execution", descKo: "留ㅼ옣 ?ㅻ챸 ?먮쫫, 泥댄뿕 ?쒕굹由ъ삤, POP 臾멸뎄", descEn: "In-store explanation flow, experience scenario, POP copy" },
    { id: "dotcom", icon: "?뙋", titleKo: "?룹뺨 肄섑뀗痢??꾨줈紐??쒖슜??, titleEn: "Dotcom content & promo", descKo: "?쒕뵫 ?섏씠吏 援ъ꽦, 諛곕꼫 移댄뵾, ?꾪솚 ?먮쫫", descEn: "Landing page structure, banner copy, conversion flow" },
    { id: "crm", icon: "?봽", titleKo: "CRM/由ы뀗???쒖슜??, titleEn: "CRM & retention", descKo: "?몄떆 ?뚮┝ ?쒕굹由ъ삤, ?щ갑臾??좊룄, ?ъ슜瑜??μ긽", descEn: "Push notification scenarios, re-engagement, usage lift" },
    { id: "season", icon: "?럡", titleKo: "?쒖쫵/?됱궗 ?곌퀎??, titleEn: "Seasonal tie-in", descKo: "紐낆젅쨌?쒖쫵 罹좏럹???ㅽ넗由? ?쒖젙 ?꾨줈紐?諛⑺뼢", descEn: "Holiday and seasonal campaign story, limited promo direction" },
    { id: "report", icon: "?뱤", titleKo: "留ㅻ땲?/?꾩썝 蹂닿퀬???붿빟", titleEn: "Executive summary", descKo: "1?섏씠吏 ?붿빟, ?듭떖 ?섏튂, ?꾨왂 諛⑺뼢", descEn: "One-page summary, key metrics, strategic direction" }
];

let selectedOutputCategories = new Set();

function renderOutputCategories() {
    const frame = document.getElementById("output-category-frame");
    const container = document.getElementById("output-categories");
    if (!frame || !container) return;

    const isKo = currentLocale === "ko";
    selectedOutputCategories = new Set();

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
    frame.scrollIntoView({ behavior: "smooth", block: "start" });
}

