const PURPOSE_OPTIONS = [
    { label: "Care", prompt: "멀리 있는 가족이나 반려동물을 더 안심하고 돌보고 싶다" },
    { label: "Play", prompt: "집 안 엔터테인먼트와 웰니스 경험을 더 몰입감 있게 만들고 싶다" },
    { label: "Save", prompt: "에너지 비용을 줄이면서 퇴근 후 집을 빠르게 쾌적하게 만들고 싶다" },
    { label: "Secure", prompt: "비어 있는 집과 가족의 일상을 더 안전하게 관리하고 싶다" }
];

const ROLE_LENSES = [
    {
        id: "retail",
        title: "리테일 담당자",
        focus: "매장/현장 소구 중심",
        brief: "고객이 매장에서 바로 이해하고 따라 하고 싶게 만드는 설명 흐름을 만듭니다."
    },
    {
        id: "dotcom",
        title: "닷컴 캠페인 담당자",
        focus: "웹/랜딩/전환 중심",
        brief: "상품 페이지와 캠페인 페이지에서 메시지와 전환 흐름을 자연스럽게 연결합니다."
    },
    {
        id: "brand",
        title: "브랜드 마케팅 담당자",
        focus: "브랜드 메시지/통합 캠페인 중심",
        brief: "기능보다 사용자가 느끼는 감정적 가치를 중심으로 장면을 설계합니다."
    }
];

const PERSONA_CATEGORY_GROUPS = [
    {
        id: "housing",
        title: "A. 거주지 유형",
        helper: "시나리오가 적용될 집의 형태를 골라 주세요",
        mode: "radio",
        options: [
            { id: "h_apt", label: "아파트", desc: "아파트, 주상복합, 고층" },
            { id: "h_compact", label: "오피스텔·원룸", desc: "1인용 소형 독립 공간" },
            { id: "h_villa", label: "빌라·다세대", desc: "연립, 다세대, 저층 공동주택" },
            { id: "h_house", label: "단독·전원주택", desc: "마당 있는 독립 건물" },
            { id: "h_townhouse", label: "타운하우스·복층", desc: "2~3층 독립 현관, 다층 구조" },
            { id: "h_shared", label: "셰어하우스·기숙사", desc: "공용 공간이 있는 공동 주거" },
            { id: "h_care", label: "시니어·케어 주거", desc: "실버타운, assisted living" }
        ]
    },
    {
        id: "household",
        title: "B. 세대 구성",
        helper: "가장 어린 구성원 기준으로 선택하면 시나리오가 더 정확해집니다",
        mode: "radio",
        options: [
            { id: "hh_solo", label: "1인 가구", desc: "혼자 생활" },
            { id: "hh_couple", label: "2인 가구", desc: "부부, 커플, 룸메이트 2인" },
            { id: "hh_young_kids", label: "영유아 자녀 가구", desc: "0–6세 자녀 포함" },
            { id: "hh_school_kids", label: "초등~청소년 자녀", desc: "7–18세 자녀 포함" },
            { id: "hh_adult_kids", label: "성인 자녀 동거", desc: "19세+ 자녀와 동거" },
            { id: "hh_multi_gen", label: "3세대 이상 동거", desc: "조부모+부모+자녀" },
            { id: "hh_senior", label: "시니어 가구", desc: "은퇴 세대 1~2인" }
        ]
    },
    {
        id: "lifestage",
        title: "C. 라이프스테이지",
        helper: "나이보다 지금 생활 상황 기준으로 선택해 주세요",
        mode: "radio",
        options: [
            { id: "ls_starter", label: "사회 초년", desc: "독립 시작, 최소 세팅" },
            { id: "ls_newlywed", label: "신혼·동거 시작", desc: "첫 공동 생활, 새 공간 세팅" },
            { id: "ls_settled", label: "안정기 진입", desc: "본격 투자·확장기" },
            { id: "ls_parenting", label: "육아·교육기", desc: "자녀 중심 생활" },
            { id: "ls_established", label: "안정된 가정", desc: "경험 축적, 효율 추구" },
            { id: "ls_empty_nest", label: "자녀 독립 후", desc: "부부 재설계 시기" },
            { id: "ls_senior", label: "시니어 생활", desc: "편의·돌봄 중심" }
        ]
    },
    {
        id: "tags",
        title: "D. 우리 집 특성",
        helper: "해당하는 것을 모두 골라 주세요 — 시나리오가 더 구체적으로 맞춰집니다",
        mode: "chip",
        scrollable: true,
        options: [
            { id: "_divider_family", divider: true, label: "가족 상황" },
            { id: "t_dual_income", label: "맞벌이" },
            { id: "t_single_income", label: "외벌이" },
            { id: "t_solo_parent", label: "양육 주 담당 1인" },
            { id: "t_multi_kids", label: "자녀 2명+" },
            { id: "t_pet", label: "반려동물 있음" },
            { id: "_divider_care", divider: true, label: "돌봄·관계" },
            { id: "t_parent_away", label: "부모님 따로 거주" },
            { id: "t_parent_care", label: "부모님 돌봄 필요" },
            { id: "t_acc_needs", label: "접근성 배려 필요" },
            { id: "_divider_lifestyle", divider: true, label: "생활 패턴" },
            { id: "t_remote", label: "재택·하이브리드 근무" },
            { id: "t_long_away", label: "장시간 부재 잦음" },
            { id: "t_weekend_out", label: "주말 외출·여행 잦음" },
            { id: "t_night_shift", label: "야간·교대 생활" },
            { id: "_divider_value", divider: true, label: "중시하는 가치" },
            { id: "t_security", label: "보안 중시" },
            { id: "t_wellness", label: "건강·웰니스 중시" },
            { id: "t_efficiency", label: "가사 효율 중시" }
        ]
    },
    {
        id: "interest",
        title: "E. 생활맥락",
        helper: "시나리오에 반영할 생활 테마를 골라 주세요",
        mode: "chip",
        scrollable: true,
        options: [
            { id: "int_energy", label: "에너지 절약" },
            { id: "int_air", label: "쾌적한 공기" },
            { id: "int_lights", label: "조명 제어" },
            { id: "int_chores", label: "집안일 도우미" },
            { id: "int_safe", label: "안전한 집" },
            { id: "int_sleep", label: "숙면 환경" },
            { id: "int_mood", label: "분위기 향상" },
            { id: "int_senior", label: "시니어 케어" },
            { id: "int_kids", label: "키즈 케어" },
            { id: "int_pet", label: "펫 케어" },
            { id: "int_find", label: "물건 찾기" },
            { id: "int_health", label: "건강·피트니스" }
        ],
        customPlaceholder: "위에 없는 생활맥락 직접 입력"
    }
];

const PERSONA_GROUP_TITLE_EN = {
    housing: "A. Housing type",
    household: "B. Household",
    lifestage: "C. Life stage",
    tags: "D. Home characteristics",
    interest: "E. Life context"
};

const PERSONA_GROUP_HELPER_EN = {
    housing: "Select the type of home for your scenario",
    household: "Choose based on the youngest household member for better accuracy",
    lifestage: "Pick based on your current life situation, not age alone",
    tags: "Select all that apply — makes the scenario more specific",
    interest: "Pick life themes to reflect in the scenario"
};

const PERSONA_OPTION_LABEL_EN = {
    h_apt: "Apartment", h_compact: "Studio / Officetel", h_villa: "Villa / Multi-family",
    h_house: "Detached / Rural home", h_townhouse: "Townhouse / Duplex", h_shared: "Shared housing / Dorm", h_care: "Senior / Care residence",
    hh_solo: "Single person", hh_couple: "Couple / Two adults", hh_young_kids: "Young children (0–6)",
    hh_school_kids: "School-age children (7–18)", hh_adult_kids: "Adult children at home",
    hh_multi_gen: "Multi-generational (3+)", hh_senior: "Senior household",
    ls_starter: "Starting out", ls_newlywed: "Newlywed / Moving in together", ls_settled: "Getting settled", ls_parenting: "Parenting years",
    ls_established: "Established home", ls_empty_nest: "Empty nest", ls_senior: "Senior living",
    t_dual_income: "Dual income", t_single_income: "Single income", t_solo_parent: "Primary caregiver",
    t_multi_kids: "2+ children", t_pet: "Has pets",
    t_parent_away: "Parents live separately", t_parent_care: "Parent care needed", t_acc_needs: "Accessibility needs",
    t_remote: "Remote / Hybrid work", t_long_away: "Often away", t_weekend_out: "Weekend outings", t_night_shift: "Night / Shift work",
    t_security: "Security-focused", t_wellness: "Health & Wellness", t_efficiency: "Household efficiency",
    int_energy: "Save energy", int_air: "Fresh air", int_lights: "Light control", int_chores: "Help with chores",
    int_safe: "Home safety", int_sleep: "Sleep well", int_mood: "Enhanced mood",
    int_senior: "Senior care", int_kids: "Kids care", int_pet: "Pet care",
    int_find: "Find belongings", int_health: "Fitness & Health",
    _divider_family: "Family", _divider_care: "Care", _divider_lifestyle: "Lifestyle", _divider_value: "Values"
};

const PERSONA_OPTION_DESC_EN = {
    h_apt: "Apartment, mixed-use, high-rise", h_compact: "Small independent unit for 1 person",
    h_villa: "Low-rise multi-family housing", h_house: "Detached building with yard",
    h_townhouse: "2–3 story with private entrance",
    h_shared: "Shared common spaces", h_care: "Senior town, assisted living",
    hh_solo: "Living alone", hh_couple: "Spouse, couple, or 2 roommates",
    hh_young_kids: "Includes children aged 0–6", hh_school_kids: "Includes children aged 7–18",
    hh_adult_kids: "Adult children living together", hh_multi_gen: "Grandparents + parents + children",
    hh_senior: "Retired, 1–2 persons",
    ls_starter: "Starting independence, minimal setup",
    ls_newlywed: "First shared home, setting up together",
    ls_settled: "Investing and expanding",
    ls_parenting: "Child-focused life", ls_established: "Experienced, seeking efficiency",
    ls_empty_nest: "Redesigning as a couple", ls_senior: "Comfort and care first"
};

const PERSONA_CUSTOM_PLACEHOLDER_EN = {
    interest: "Other life context — type here"
};

/* Locale-specific housing overrides — disabled: C group is now space-based (Explore Contents) */
const LOCALE_HOUSING_OPTIONS_LEGACY = {
    KR: [
        { id: "apt_high", label: "아파트 고층 (15층+)" },
        { id: "apt_low", label: "아파트·빌라 저중층" },
        { id: "officetel", label: "오피스텔" },
        { id: "studio", label: "원룸" },
        { id: "jusang", label: "주상복합" },
        { id: "detached", label: "단독주택" },
        { id: "rental", label: "임대 (월세·전세)" },
        { id: "shared", label: "셰어하우스·고시원" }
    ],
    US: [
        { id: "apartment", label: "Apartment" },
        { id: "condo", label: "Condominium" },
        { id: "townhouse", label: "Townhouse" },
        { id: "single_family", label: "Single-family home" },
        { id: "studio", label: "Studio" },
        { id: "duplex", label: "Duplex" },
        { id: "mobile_home", label: "Mobile / Manufactured home" },
        { id: "loft", label: "Loft" }
    ],
    GB: [
        { id: "detached", label: "Detached house" },
        { id: "semi_detached", label: "Semi-detached house" },
        { id: "terraced", label: "Terraced house" },
        { id: "flat", label: "Flat / Apartment" },
        { id: "bungalow", label: "Bungalow" },
        { id: "cottage", label: "Cottage" },
        { id: "maisonette", label: "Maisonette" },
        { id: "studio", label: "Studio" }
    ],
    UK: null, // alias — resolved to GB at runtime
    DE: [
        { id: "wohnung", label: "Wohnung (Apartment)" },
        { id: "altbau", label: "Altbau (Pre-war)" },
        { id: "neubau", label: "Neubau (Modern)" },
        { id: "einfamilienhaus", label: "Einfamilienhaus (Detached)" },
        { id: "reihenhaus", label: "Reihenhaus (Row house)" },
        { id: "doppelhaus", label: "Doppelhaus (Semi-detached)" },
        { id: "wg", label: "WG (Shared flat)" },
        { id: "studio", label: "Studio / 1-Zimmer" }
    ],
    FR: [
        { id: "appartement", label: "Appartement" },
        { id: "studio", label: "Studio" },
        { id: "maison", label: "Maison individuelle" },
        { id: "maison_ville", label: "Maison de ville" },
        { id: "hlm", label: "HLM (Social housing)" },
        { id: "pavillon", label: "Pavillon" },
        { id: "loft", label: "Loft" },
        { id: "chambre_bonne", label: "Chambre de bonne" }
    ],
    IN: [
        { id: "flat", label: "Flat / Apartment (BHK)" },
        { id: "independent", label: "Independent house" },
        { id: "bungalow", label: "Bungalow" },
        { id: "villa", label: "Villa (gated community)" },
        { id: "chawl", label: "Chawl" },
        { id: "pg", label: "PG (Paying Guest)" },
        { id: "row_house", label: "Row house" },
        { id: "penthouse", label: "Penthouse" }
    ],
    JP: [
        { id: "mansion", label: "マンション (Mansion)" },
        { id: "apaato", label: "アパート (Apartment)" },
        { id: "ikkodate", label: "一戸建て (Detached)" },
        { id: "danchi", label: "団地 (Public housing)" },
        { id: "one_room", label: "ワンルーム (Studio)" },
        { id: "ur", label: "UR賃貸 (UR Rental)" },
        { id: "sharehouse", label: "シェアハウス (Share house)" }
    ],
    BR: [
        { id: "apartamento", label: "Apartamento" },
        { id: "casa", label: "Casa" },
        { id: "sobrado", label: "Sobrado" },
        { id: "quitinete", label: "Quitinete / Studio" },
        { id: "cobertura", label: "Cobertura (Penthouse)" },
        { id: "condominio", label: "Condominio fechado" },
        { id: "casa_geminada", label: "Casa geminada" },
        { id: "loft", label: "Loft" }
    ],
    VN: [
        { id: "chung_cu", label: "Chung cu (Apartment)" },
        { id: "nha_pho", label: "Nha pho (Townhouse)" },
        { id: "nha_rieng", label: "Nha rieng (Detached)" },
        { id: "biet_thu", label: "Biet thu (Villa)" },
        { id: "tube_house", label: "Nha ong (Tube house)" },
        { id: "can_ho_dv", label: "Can ho dich vu (Serviced apt)" },
        { id: "officetel", label: "Officetel" },
        { id: "studio", label: "Studio" }
    ],
    ID: [
        { id: "rumah_tapak", label: "Rumah tapak (Landed house)" },
        { id: "apartemen", label: "Apartemen" },
        { id: "rumah_susun", label: "Rumah susun (Public flat)" },
        { id: "perumahan", label: "Perumahan (Housing estate)" },
        { id: "cluster", label: "Cluster housing" },
        { id: "kost", label: "Kost (Boarding house)" },
        { id: "kontrakan", label: "Kontrakan (Rented house)" },
        { id: "townhouse", label: "Townhouse" }
    ],
    AE: [
        { id: "apartment", label: "Apartment" },
        { id: "studio", label: "Studio" },
        { id: "villa", label: "Villa" },
        { id: "townhouse", label: "Townhouse" },
        { id: "compound", label: "Compound / Villa community" },
        { id: "penthouse", label: "Penthouse" },
        { id: "duplex", label: "Duplex" }
    ],
    SA: [
        { id: "apartment", label: "Apartment (شقة)" },
        { id: "villa", label: "Villa (فيلا)" },
        { id: "duplex_villa", label: "Duplex Villa" },
        { id: "townhouse", label: "Townhouse" },
        { id: "compound", label: "Compound (كمباوند)" },
        { id: "traditional", label: "Traditional house" },
        { id: "penthouse", label: "Penthouse" }
    ]
};

function getLocalizedPersonaGroups(locale, countryCode) {
    const groups = PERSONA_CATEGORY_GROUPS.map((group) => ({ ...group }));

    if (locale === "ko") return groups;

    return groups.map((group) => ({
        ...group,
        title: PERSONA_GROUP_TITLE_EN[group.id] || group.title,
        helper: PERSONA_GROUP_HELPER_EN[group.id] || group.helper,
        customPlaceholder: PERSONA_CUSTOM_PLACEHOLDER_EN[group.id] || group.customPlaceholder,
        options: group.options.map((option) => ({
            ...option,
            label: PERSONA_OPTION_LABEL_EN[option.id] || option.label,
            desc: PERSONA_OPTION_DESC_EN[option.id] || option.desc,
            ...(option.sub ? { sub: option.sub.map((s) => ({
                ...s,
                label: PERSONA_OPTION_LABEL_EN[s.id] || s.label
            })) } : {})
        }))
    }));
}

const DEVICE_GROUP_TITLE_EN = {
    "ls-security": "Security", "ls-energy": "Energy Saving", "ls-easy": "Easy to use",
    "ls-time": "Time saving", "ls-sleep": "Sleep", "ls-health": "Health",
    "ls-pet": "Pet care", "ls-family": "Family care",
    "dt-home": "Home appliances", "dt-kitchen": "Kitchen appliances",
    "dt-tvav": "TV / AV", "dt-lights": "Lighting / Switches",
    "dt-sensors": "Sensors / Others", "dt-hub": "Hubs / Connectivity",
    "dt-wearable": "Wearables", "dt-fitness": "Fitness / Health", "dt-personal": "Personal devices"
};

const DEVICE_OPTION_LABEL_EN = {
    "air-conditioner": "Air conditioner",
    "air-purifier": "Air purifier",
    ventilation: "Ventilation system",
    dehumidifier: "Dehumidifier",
    "air-monitor": "Air monitor",
    fan: "Fan / Circulator",
    lighting: "Lighting",
    "mood-light": "Mood lighting",
    "smart-switch": "Button / Switch",
    curtain: "Curtain / Blinds",
    "sleep-light": "Wake/Sleep light",
    "robot-vacuum": "Robot vacuum",
    vacuum: "Vacuum cleaner",
    washer: "Washer",
    dryer: "Dryer",
    "washer-dryer": "Washer/Dryer",
    dishwasher: "Dishwasher",
    camera: "Camera / CCTV",
    "door-lock": "Door lock",
    doorbell: "Video doorbell",
    "open-sensor": "Door-open sensor",
    "leak-smoke": "Leak/Smoke detector",
    hub: "SmartThings Hub",
    "sleep-sensor": "Sleep sensor",
    "bedside-light": "Bedroom light",
    "bedroom-aircon": "Bedroom air conditioner",
    "air-purifier-bed": "Bedroom air purifier",
    "wearable-sleep": "Wearable",
    "tv-premium": "TV",
    projector: "Projector",
    monitor: "Monitor",
    speaker: "Speaker",
    soundbar: "Soundbar",
    "gaming-console": "Gaming console",
    "pet-feeder": "Pet feeder",
    "care-camera": "Indoor camera",
    "activity-sensor": "Activity sensor",
    "fall-sensor": "Fall detection sensor",
    "care-button": "Emergency call button",
    "wearable-care": "Care wearable",
    "smart-plug": "Smart plug",
    "energy-monitor": "Energy monitor",
    "smart-meter": "Power usage monitor",
    "hub-energy": "Energy automation hub",
    "eco-aircon": "AI energy-saving air conditioner",
    "hub-energy": "SmartThings Hub",
    refrigerator: "Refrigerator",
    oven: "Oven",
    microwave: "Microwave",
    cooktop: "Induction / Cooktop",
    "dishwasher-kitchen": "Dishwasher",
    "kids-camera": "Indoor camera",
    "kids-sensor": "Door-open sensor",
    "kids-tag": "SmartTag",
    "kids-tablet": "Galaxy Tab",
    "pet-camera": "Indoor camera",
    "pet-robot": "Robot vacuum",
    "pet-aircon": "Air conditioner (auto temp)",
    "smart-tag": "SmartTag",
    "galaxy-phone": "Galaxy Smartphone",
    "galaxy-watch-find": "Galaxy Watch",
    "galaxy-watch-fit": "Galaxy Watch",
    "galaxy-buds": "Galaxy Buds",
    "tv-fitness": "TV (home fitness)",
    "body-scale": "Body composition scale",
    "wearable-sleep": "Galaxy Watch",
    "wearable-care": "Galaxy Watch"
};

function getLocalizedDeviceGroups(locale) {
    if (locale === "ko") return DEVICE_CATEGORY_GROUPS;

    return DEVICE_CATEGORY_GROUPS.map((group) => {
        if (group.section) return { ...group, title: group.titleEn || group.title };
        return {
            ...group,
            title: DEVICE_GROUP_TITLE_EN[group.id] || group.title,
            options: (group.options || []).map((option) => ({
                ...option,
                label: DEVICE_OPTION_LABEL_EN[option.id] || option.label
            }))
        };
    });
}

/* ── Q3 Device Groups — Lifestyle + Device Type 2-section structure ── */
const DEVICE_CATEGORY_GROUPS = [
    /* ═══ Section 1: Lifestyle 기반 ═══ */
    { id: "_section_lifestyle", section: true, title: "Lifestyle 기반 선택", titleEn: "Select by Lifestyle" },
    {
        id: "ls-security",
        title: "Security",
        options: [
            { id: "camera", label: "카메라/CCTV", normalized: "센서" },
            { id: "door-lock", label: "도어락", normalized: "센서" },
            { id: "doorbell", label: "비디오 도어벨", normalized: "센서" },
            { id: "open-sensor", label: "문열림 센서", normalized: "센서" },
            { id: "leak-smoke", label: "누수/연기 감지기", normalized: "센서" },
            { id: "smart-tag", label: "SmartTag", normalized: "센서" }
        ]
    },
    {
        id: "ls-energy",
        title: "Energy Saving",
        options: [
            { id: "smart-plug", label: "스마트 플러그", normalized: "센서" },
            { id: "energy-monitor", label: "에너지 모니터", normalized: "센서" },
            { id: "eco-aircon", label: "AI 절약모드 에어컨", normalized: "에어컨" },
            { id: "hub", label: "SmartThings Hub", normalized: "센서" }
        ]
    },
    {
        id: "ls-easy",
        title: "Easy to use",
        options: [
            { id: "lighting", label: "조명", normalized: "조명" },
            { id: "smart-switch", label: "버튼/스위치", normalized: "센서" },
            { id: "curtain", label: "커튼/블라인드", normalized: "센서" },
            { id: "speaker", label: "스피커", normalized: "스피커" }
        ]
    },
    {
        id: "ls-time",
        title: "Time saving",
        options: [
            { id: "robot-vacuum", label: "로봇청소기", normalized: "로봇청소기" },
            { id: "washer", label: "세탁기", normalized: "세탁기" },
            { id: "dryer", label: "건조기", normalized: "건조기" },
            { id: "dishwasher", label: "식기세척기", normalized: "세탁기/건조기" }
        ]
    },
    {
        id: "ls-sleep",
        title: "Sleep",
        options: [
            { id: "sleep-sensor", label: "수면 센서", normalized: "센서" },
            { id: "bedside-light", label: "침실 조명", normalized: "조명" },
            { id: "bedroom-aircon", label: "침실 에어컨", normalized: "에어컨" },
            { id: "air-purifier-bed", label: "침실 공기청정기", normalized: "에어컨" },
            { id: "wearable-sleep", label: "Galaxy Watch", normalized: "웨어러블" }
        ]
    },
    {
        id: "ls-health",
        title: "Health",
        options: [
            { id: "galaxy-watch", label: "Galaxy Watch", normalized: "웨어러블" },
            { id: "galaxy-buds", label: "Galaxy Buds", normalized: "웨어러블" },
            { id: "tv-fitness", label: "TV (홈트)", normalized: "TV" },
            { id: "body-scale", label: "체성분 체중계", normalized: "센서" }
        ]
    },
    {
        id: "ls-pet",
        title: "Pet care",
        options: [
            { id: "pet-feeder", label: "펫 피더", normalized: "센서" },
            { id: "pet-camera", label: "실내 카메라", normalized: "센서" },
            { id: "pet-robot", label: "로봇청소기 (펫)", normalized: "로봇청소기" },
            { id: "pet-aircon", label: "에어컨 (자동 온도)", normalized: "에어컨" }
        ]
    },
    {
        id: "ls-family",
        title: "Family care",
        options: [
            { id: "activity-sensor", label: "활동 감지 센서", normalized: "센서" },
            { id: "fall-sensor", label: "낙상 감지 센서", normalized: "센서" },
            { id: "care-button", label: "긴급 호출 버튼", normalized: "센서" },
            { id: "care-camera", label: "실내 카메라", normalized: "센서" },
            { id: "kids-tag", label: "SmartTag (키즈)", normalized: "센서" },
            { id: "kids-tablet", label: "Galaxy Tab", normalized: "태블릿" }
        ]
    },

    /* ═══ Section 2: Device Type 기반 ═══ */
    { id: "_section_device", section: true, title: "기기 유형별 선택", titleEn: "Select by Device Type" },
    {
        id: "dt-home",
        title: "Home appliances",
        options: [
            { id: "air-conditioner", label: "에어컨", normalized: "에어컨" },
            { id: "air-purifier", label: "공기청정기", normalized: "에어컨" },
            { id: "dehumidifier", label: "제습기", normalized: "에어컨" },
            { id: "ventilation", label: "환기 시스템", normalized: "에어컨" },
            { id: "dt-washer", label: "세탁기", normalized: "세탁기" },
            { id: "dt-dryer", label: "건조기", normalized: "건조기" },
            { id: "dt-robot", label: "로봇청소기", normalized: "로봇청소기" }
        ]
    },
    {
        id: "dt-kitchen",
        title: "Kitchen appliances",
        options: [
            { id: "refrigerator", label: "냉장고", normalized: "냉장고" },
            { id: "oven", label: "오븐", normalized: "오븐" },
            { id: "microwave", label: "전자레인지", normalized: "오븐" },
            { id: "cooktop", label: "인덕션/쿡탑", normalized: "오븐" },
            { id: "dt-dishwasher", label: "식기세척기", normalized: "세탁기/건조기" }
        ]
    },
    {
        id: "dt-tvav",
        title: "TV / AV",
        options: [
            { id: "tv-premium", label: "TV", normalized: "TV" },
            { id: "projector", label: "프로젝터", normalized: "TV" },
            { id: "soundbar", label: "사운드바", normalized: "스피커" },
            { id: "dt-speaker", label: "스피커", normalized: "스피커" },
            { id: "gaming-console", label: "게임 콘솔", normalized: "TV" }
        ]
    },
    {
        id: "dt-lights",
        title: "Lighting / Switches",
        options: [
            { id: "dt-lighting", label: "조명", normalized: "조명" },
            { id: "mood-light", label: "무드 조명", normalized: "조명" },
            { id: "sleep-light", label: "기상·수면 조명", normalized: "조명" },
            { id: "dt-switch", label: "버튼/스위치", normalized: "센서" },
            { id: "dt-curtain", label: "커튼/블라인드", normalized: "센서" }
        ]
    },
    {
        id: "dt-sensors",
        title: "Sensors / Others",
        options: [
            { id: "dt-camera", label: "카메라/CCTV", normalized: "센서" },
            { id: "dt-door-lock", label: "도어락", normalized: "센서" },
            { id: "dt-doorbell", label: "비디오 도어벨", normalized: "센서" },
            { id: "dt-open-sensor", label: "문열림 센서", normalized: "센서" },
            { id: "dt-leak-smoke", label: "누수/연기 감지기", normalized: "센서" },
            { id: "dt-sleep-sensor", label: "수면 센서", normalized: "센서" },
            { id: "dt-activity-sensor", label: "활동 감지 센서", normalized: "센서" }
        ]
    },
    {
        id: "dt-hub",
        title: "Hubs / Connectivity",
        options: [
            { id: "dt-hub", label: "SmartThings Hub", normalized: "센서" },
            { id: "dt-plug", label: "스마트 플러그", normalized: "센서" },
            { id: "dt-energy-monitor", label: "에너지 모니터", normalized: "센서" }
        ]
    },
    {
        id: "dt-wearable",
        title: "Wearables",
        options: [
            { id: "dt-watch", label: "Galaxy Watch", normalized: "웨어러블" },
            { id: "dt-buds", label: "Galaxy Buds", normalized: "웨어러블" }
        ]
    },
    {
        id: "dt-fitness",
        title: "Fitness / Health",
        options: [
            { id: "dt-watch-fit", label: "Galaxy Watch", normalized: "웨어러블" },
            { id: "dt-scale", label: "체성분 체중계", normalized: "센서" },
            { id: "dt-tv-fit", label: "TV (홈트)", normalized: "TV" }
        ]
    },
    {
        id: "dt-personal",
        title: "Personal devices",
        options: [
            { id: "galaxy-phone", label: "Galaxy 스마트폰", normalized: "스마트폰" },
            { id: "galaxy-tab", label: "Galaxy Tab", normalized: "태블릿" },
            { id: "dt-tag", label: "SmartTag", normalized: "센서" }
        ]
    }
];

const STEP_INSIGHTS = {
    1: {
        title: "직무를 고르면 결과물의 톤과 구성이 달라집니다",
        body: "직무를 고르면 결과물의 톤과 구성(세일즈/랜딩/카피)이 그 역할에 맞게 자동 최적화돼요."
    },
    2: {
        title: "지역이 바뀌면 더 와닿는 장면도 바뀝니다",
        body: "생활 환경과 소비 맥락이 다르면 같은 제안도 더 강하게 먹히는 포인트가 달라집니다."
    },
    3: {
        title: "좋은 시나리오는 사람과 순간을 함께 잡습니다",
        body: "사용자 유형과 실제 상황을 함께 적을수록 메시지와 자동화 흐름이 훨씬 생생해집니다.",
        rows: [
            { label: "Q3 힌트", value: "Q3에서 시나리오에 반영할 기기를 선택하면, 이 타겟과 생활맥락에 딱 맞는 자동화 흐름이 완성됩니다." }
        ]
    },
    4: {
        title: "기기를 정하면 첫 실행 장면이 완성됩니다",
        body: "중심 기기를 고르면 첫 실행, 반복 사용, 확장까지 이어지는 흐름을 더 구체적으로 설계할 수 있습니다."
    }
};

const COUNTRY_LOCALES = {
    KR: "ko",
    SEC: "ko",
    US: "en",
    GB: "en",
    UK: "en",
    DE: "de",
    AT: "de",
    CH: "de",
    CH_FR: "fr",
    FR: "fr",
    CA_FR: "fr",
    BE_FR: "fr",
    ES: "es",
    MX: "es",
    CO: "es",
    CL: "es",
    AR: "es",
    PE: "es",
    BO: "es",
    UY: "es",
    PY: "es",
    LATIN: "es",
    PT: "pt",
    BR: "pt",
    IT: "it",
    NL: "nl",
    BE: "nl",
    SE: "sv",
    DK: "da",
    FI: "fi",
    NO: "no",
    PL: "pl",
    HU: "hu",
    RO: "ro",
    BG: "bg",
    CZ: "cs",
    SK: "sk",
    RS: "sr",
    HR: "hr",
    SI: "sl",
    MK: "mk",
    EE: "et",
    LV: "lv",
    LT: "lt",
    GR: "el",
    UA: "uk",
    TH: "th",
    MM: "my",
    MY: "en",
    SG: "en",
    PH: "en",
    VN: "vi",
    AE: "en",
    AE_AR: "ar",
    TR: "tr",
    LEVANT: "en",
    LEVANT_AR: "ar",
    LB: "ar",
    IQ_AR: "ar",
    IQ_KU: "en",
    SA: "en",
    SA_EN: "ar",
    N_AFRICA: "fr",
    IL: "en",
    PK: "en",
    IN: "en",
    BD: "en",
    RU: "ru",
    AZ: "en",
    KZ_RU: "ru",
    KZ_KZ: "en",
    UZ_UZ: "en",
    UZ_RU: "ru",
    MN: "en",
    CN: "en",
    HK: "en",
    HK_EN: "en",
    TW: "en",
    AFRICA_EN: "en",
    AFRICA_FR: "fr",
    AFRICA_PT: "pt",
    CA: "en",
    IE: "en",
    AU: "en",
    NZ: "en"
};

const DOTCOM_MARKETS = [
    ["USA", "US", "English", "www.samsung.com/us"],
    ["Canada", "CA", "English", "www.samsung.com/ca"],
    ["Canada", "CA_FR", "French", "www.samsung.com/ca_fr"],
    ["Germany", "DE", "German", "www.samsung.com/de"],
    ["UK", "UK", "English", "www.samsung.com/uk"],
    ["Ireland", "IE", "English", "www.samsung.com/ie"],
    ["France", "FR", "French", "www.samsung.com/fr"],
    ["Italy", "IT", "Italian", "www.samsung.com/it"],
    ["Spain", "ES", "Spanish", "www.samsung.com/es"],
    ["Portugal", "PT", "Portuguese", "www.samsung.com/pt"],
    ["Netherlands", "NL", "Dutch", "www.samsung.com/nl"],
    ["Belgium", "BE", "Dutch", "www.samsung.com/be"],
    ["Belgium", "BE_FR", "French", "www.samsung.com/be_fr"],
    ["Luxembourg", "BE_FR", "French", "www.samsung.com/be_fr"],
    ["Netherlands", "NL", "Dutch", "www.samsung.com/nl"],
    ["Ireland", "IE", "English", "www.samsung.com/ie"],
    ["Sweden", "SE", "Swedish", "www.samsung.com/se"],
    ["Denmark", "DK", "Danish", "www.samsung.com/dk"],
    ["Finland", "FI", "Finnish", "www.samsung.com/fi"],
    ["Norway", "NO", "Norwegian", "www.samsung.com/no"],
    ["Poland", "PL", "Polish", "www.samsung.com/pl"],
    ["Hungary", "HU", "Hungarian", "www.samsung.com/hu"],
    ["Austria", "AT", "German", "www.samsung.com/at"],
    ["Switzerland", "CH", "German", "www.samsung.com/ch"],
    ["Switzerland", "CH_FR", "French", "www.samsung.com/ch_fr"],
    ["Romania", "RO", "Romanian", "www.samsung.com/ro"],
    ["Bulgaria", "BG", "Bulgarian", "www.samsung.com/bg"],
    ["Czech", "CZ", "Czech", "www.samsung.com/cz"],
    ["Slovakia", "SK", "Slovakian", "www.samsung.com/sk"],
    ["Serbia", "RS", "Serbian", "www.samsung.com/rs"],
    ["Croatia", "HR", "Croatian", "www.samsung.com/hr"],
    ["Slovenia", "SI", "Slovenian", "www.samsung.com/si"],
    ["Albania", "RS", "Serbian", "www.samsung.com/rs"],
    ["Bosnia", "RS", "Serbian", "www.samsung.com/rs"],
    ["Montenegro", "RS", "Serbian", "www.samsung.com/rs"],
    ["Kosovo", "RS", "Serbian", "www.samsung.com/rs"],
    ["Macedonia", "MK", "Macedonian", "www.samsung.com/mk"],
    ["Estonia", "EE", "Estonian", "www.samsung.com/ee"],
    ["Latvia", "LV", "Latvian", "www.samsung.com/lv"],
    ["Lithuania", "LT", "Lithuanian", "www.samsung.com/lt"],
    ["Greece", "GR", "Greek", "www.samsung.com/gr"],
    ["Cyprus", "GR", "Greek", "www.samsung.com/gr"],
    ["Ukraine", "UA", "Ukrainian", "www.samsung.com/ua"],
    ["Brazil", "BR", "Portuguese", "www.samsung.com/br"],
    ["Mexico", "MX", "Spanish", "www.samsung.com/mx"],
    ["Panama", "LATIN", "Spanish", "www.samsung.com/latin"],
    ["Panama", "LATIN_EN", "English", "www.samsung.com/latin_en"],
    ["Costa Rica", "LATIN", "Spanish", "www.samsung.com/latin"],
    ["Dominica Rep.", "LATIN", "Spanish", "www.samsung.com/latin"],
    ["Guatemala", "LATIN", "Spanish", "www.samsung.com/latin"],
    ["Ecuador", "LATIN", "Spanish", "www.samsung.com/latin"],
    ["Honduras", "LATIN_EN", "English", "www.samsung.com/latin_en"],
    ["Nicaragua", "LATIN", "Spanish", "www.samsung.com/latin"],
    ["El Salvador", "LATIN", "Spanish", "www.samsung.com/latin"],
    ["Bahamas", "LATIN", "Spanish", "www.samsung.com/latin"],
    ["Jamaica", "LATIN", "Spanish", "www.samsung.com/latin"],
    ["Puerto Rico", "LATIN", "Spanish", "www.samsung.com/latin"],
    ["Trinidad & Tobago", "LATIN", "Spanish", "www.samsung.com/latin"],
    ["Paraguay", "PY", "Spanish", "www.samsung.com/py"],
    ["Uruguay", "UY", "Spanish", "www.samsung.com/uy"],
    ["Colombia", "CO", "Spanish", "www.samsung.com/co"],
    ["Chile", "CL", "Spanish", "www.samsung.com/cl"],
    ["Bolivia", "BO", "Spanish", "www.samsung.com/bo"],
    ["Peru", "PE", "Spanish", "www.samsung.com/pe"],
    ["Argentina", "AR", "Spanish", "www.samsung.com/ar"],
    ["Australia", "AU", "English", "www.samsung.com/au"],
    ["New Zealand", "NZ", "English", "www.samsung.com/nz"],
    ["Thailand", "TH", "Thai", "www.samsung.com/th"],
    ["Myanmar", "MM", "Burmese", "www.samsung.com/mm"],
    ["Cambodia", "MM", "Burmese", "www.samsung.com/mm"],
    ["Laos", "MM", "Burmese", "www.samsung.com/mm"],
    ["Malaysia", "MY", "English", "www.samsung.com/my"],
    ["Singapore", "SG", "English", "www.samsung.com/sg"],
    ["Philippines", "PH", "English", "www.samsung.com/ph"],
    ["Vietnam", "VN", "Vietnamese", "www.samsung.com/vn"],
    ["UAE", "AE", "English", "www.samsung.com/ae"],
    ["UAE", "AE_AR", "Arabic", "www.samsung.com/ae_ar"],
    ["Kuwait", "AE", "English", "www.samsung.com/ae"],
    ["Bahrain", "AE", "English", "www.samsung.com/ae"],
    ["Oman", "AE", "English", "www.samsung.com/ae"],
    ["Qatar", "AE", "English", "www.samsung.com/ae"],
    ["Yemen", "AE", "English", "www.samsung.com/ae"],
    ["Turkey", "TR", "Turkish", "www.samsung.com/tr"],
    ["Levant", "LEVANT", "English", "www.samsung.com/levant"],
    ["Jordan", "LEVANT_AR", "Arabic", "www.samsung.com/levant_ar"],
    ["Lebanon", "LB", "Arabic", "www.samsung.com/lb"],
    ["Syria", "LB", "Arabic", "www.samsung.com/lb"],
    ["Iraq", "IQ_AR", "Arabic", "www.samsung.com/iq_ar"],
    ["Iraq", "IQ_KU", "Kurdish", "www.samsung.com/iq_ku"],
    ["Saudi Arabia", "SA", "English", "www.samsung.com/sa"],
    ["Saudi Arabia", "SA_EN", "Arabic", "www.samsung.com/sa_en"],
    ["Morocco", "N_AFRICA", "French", "www.samsung.com/n_africa"],
    ["Tunisia", "N_AFRICA", "French", "www.samsung.com/n_africa"],
    ["Libya", "N_AFRICA", "French", "www.samsung.com/n_africa"],
    ["Algeria", "N_AFRICA", "French", "www.samsung.com/n_africa"],
    ["Israel", "IL", "Hebrew", "www.samsung.com/il"],
    ["Pakistan", "PK", "English", "www.samsung.com/pk"],
    ["Afghanistan", "PK", "English", "www.samsung.com/pk"],
    ["India", "IN", "English", "www.samsung.com/in"],
    ["Bangladesh", "BD", "Bengali", "www.samsung.com/bd"],
    ["Sri Lanka", "BD", "Bengali", "www.samsung.com/bd"],
    ["Nepal", "BD", "Bengali", "www.samsung.com/bd"],
    ["Russia", "RU", "Russian", "www.samsung.com/ru"],
    ["Armenia", "RU", "Russian", "www.samsung.com/ru"],
    ["Georgia", "RU", "Russian", "www.samsung.com/ru"],
    ["Azerbaijan", "AZ", "Azerbaijani", "www.samsung.com/az"],
    ["Kazakhstan", "KZ_RU", "Russian", "www.samsung.com/kz_ru"],
    ["Kazakhstan", "KZ_KZ", "Kazakh", "www.samsung.com/kz_kz"],
    ["Kyrgyzstan", "KZ_KZ", "Kazakh", "www.samsung.com/kz_kz"],
    ["Tajikistan", "KZ_KZ", "Kazakh", "www.samsung.com/kz_kz"],
    ["Uzbekistan", "UZ_UZ", "Uzbek", "www.samsung.com/uz_uz"],
    ["Uzbekistan", "UZ_RU", "Russian", "www.samsung.com/uz_ru"],
    ["Mongolia", "MN", "Mongolian", "www.samsung.com/mn"],
    ["China", "CN", "Simplified Chinese", "www.samsung.com/cn"],
    ["Hong Kong", "HK", "Traditional Chinese", "www.samsung.com/hk"],
    ["Hong Kong", "HK_EN", "English", "www.samsung.com/hk_en"],
    ["Taiwan", "TW", "Traditional Chinese", "www.samsung.com/tw"],
    ["South Africa", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["Africa", "AFRICA_FR", "French", "www.samsung.com/africa_fr"],
    ["Africa", "AFRICA_PT", "Portuguese", "www.samsung.com/africa_pt"],
    ["Botswana", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["Namibia", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["Kingdom of Lesotho", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["Kingdom of Eswatini", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["Mauritius", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["Zambia", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["Zimbabwe", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["Mozambique", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["Malawi", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["Angola", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["Madagascar", "AFRICA_FR", "French", "www.samsung.com/africa_fr"],
    ["Reunion", "AFRICA_FR", "French", "www.samsung.com/africa_fr"],
    ["The Union of Comoros", "AFRICA_FR", "French", "www.samsung.com/africa_fr"],
    ["Kenya", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["Tanzania", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["Uganda", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["Rwanda", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["South Sudan", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["DR Congo", "AFRICA_FR", "French", "www.samsung.com/africa_fr"],
    ["Ethiopia", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["Somalia", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["Djibouti", "AFRICA_FR", "French", "www.samsung.com/africa_fr"],
    ["Seychelles", "AFRICA_FR", "French", "www.samsung.com/africa_fr"],
    ["Burundi", "AFRICA_FR", "French", "www.samsung.com/africa_fr"],
    ["Eritrea", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["Sudan", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["Nigeria", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["Togo", "AFRICA_FR", "French", "www.samsung.com/africa_fr"],
    ["Benin", "AFRICA_FR", "French", "www.samsung.com/africa_fr"],
    ["Chad", "AFRICA_FR", "French", "www.samsung.com/africa_fr"],
    ["Ghana", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["Côte d'Ivoire", "AFRICA_FR", "French", "www.samsung.com/africa_fr"],
    ["Cameroon", "AFRICA_FR", "French", "www.samsung.com/africa_fr"],
    ["Liberia", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["Sierra Leone", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["Central African Republic", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["Congo", "AFRICA_FR", "French", "www.samsung.com/africa_fr"],
    ["Equatorial Guinea", "AFRICA_FR", "French", "www.samsung.com/africa_fr"],
    ["Sao Tome and Principe", "AFRICA_FR", "French", "www.samsung.com/africa_fr"],
    ["Senegal", "AFRICA_FR", "French", "www.samsung.com/africa_fr"],
    ["Gabon", "AFRICA_FR", "French", "www.samsung.com/africa_fr"],
    ["Burkina Faso", "AFRICA_FR", "French", "www.samsung.com/africa_fr"],
    ["Niger", "AFRICA_FR", "French", "www.samsung.com/africa_fr"],
    ["Guinea", "AFRICA_FR", "French", "www.samsung.com/africa_fr"],
    ["Mali", "AFRICA_FR", "French", "www.samsung.com/africa_fr"],
    ["Mauritania", "AFRICA_FR", "French", "www.samsung.com/africa_fr"],
    ["Gambia", "AFRICA_EN", "English", "www.samsung.com/africa_en"],
    ["Cape Verde", "AFRICA_PT", "Portuguese", "www.samsung.com/africa_pt"],
    ["Korea", "SEC", "Korean", "www.samsung.com/sec"],
    ["Japan", "JP", "Japanese", "www.samsung.com/jp"]
];

