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
        id: "household",
        title: "A. 타겟 고객 가구 구성",
        mode: "checkbox",
        options: [
            { id: "solo", label: "나 혼자" },
            { id: "partner", label: "배우자/파트너", sub: [
                { id: "partner_dual_income", label: "맞벌이" },
                { id: "partner_single_income", label: "외벌이" }
            ]},
            { id: "children", label: "자녀", sub: [
                { id: "child_infant", label: "영유아 (0–6세)" },
                { id: "child_elementary", label: "초등 (7–12세)" },
                { id: "child_teen", label: "청소년 (13–18세)" },
                { id: "child_adult", label: "성인 자녀 (19세+)" },
                { id: "child_multi", label: "자녀 2명 이상" }
            ]},
            { id: "parents_senior", label: "부모님/시니어", sub: [
                { id: "parent_one", label: "한 분" },
                { id: "parent_both", label: "두 분" },
                { id: "parent_60s", label: "60대" },
                { id: "parent_70plus", label: "70대 이상" }
            ]},
            { id: "siblings", label: "형제·자매" },
            { id: "roommate", label: "룸메이트/하우스메이트" },
            { id: "pet", label: "반려동물", sub: [
                { id: "pet_dog", label: "강아지" },
                { id: "pet_cat", label: "고양이" },
                { id: "pet_other", label: "기타 (파충류·어류·소동물 등)" }
            ]},
            { id: "accessibility", label: "접근성 배려 필요 구성원", sub: [
                { id: "acc_mobility", label: "거동 불편 (휠체어·보행기)" },
                { id: "acc_visual_hearing", label: "시각·청각 지원 필요" },
                { id: "acc_cognitive", label: "인지 지원 (치매·발달장애 등)" },
                { id: "acc_child_safety", label: "영유아 안전 (문잠금·모서리 등)" }
            ]}
        ],
        customPlaceholder: "위에 해당하지 않는 경우 직접 입력"
    },
    {
        id: "interest",
        title: "B. 요즘 관심사",
        mode: "checkbox",
        options: [
            { id: "int_health", label: "건강·수면·운동" },
            { id: "int_energy", label: "에너지·비용 절감" },
            { id: "int_entertain", label: "홈시네마·음악·게임" },
            { id: "int_cooking", label: "홈쿡·식생활 관리" },
            { id: "int_remote", label: "재택·하이브리드 근무" },
            { id: "int_night", label: "야간·교대 생활" },
            { id: "int_away", label: "외출·출장 잦음" },
            { id: "int_hosting", label: "홈파티·손님 맞이" },
            { id: "int_season", label: "시즌 이벤트 (명절·연말·월드컵 등)" }
        ],
        customPlaceholder: "위에 없는 관심사 직접 입력"
    },
    {
        id: "housing",
        title: "C. 거주지 유형",
        mode: "radio",
        options: [
            { id: "apt_high", label: "아파트 고층 (15층+)" },
            { id: "apt_low", label: "아파트·빌라 저중층" },
            { id: "studio", label: "원룸·오피스텔·스튜디오" },
            { id: "detached", label: "단독주택" },
            { id: "townhouse", label: "타운하우스·연립" },
            { id: "suburban", label: "전원·교외 주택" },
            { id: "rental", label: "임대·단기 거주 (월세·전세)" },
            { id: "shared", label: "셰어하우스·기숙사" }
        ],
        customPlaceholder: "위에 해당하지 않는 경우 직접 입력"
    }
];

const PERSONA_GROUP_TITLE_EN = {
    household: "A. Household members",
    interest: "B. Current interests",
    housing: "C. Housing type"
};

const PERSONA_OPTION_LABEL_EN = {
    solo: "I live alone",
    partner: "Spouse / Partner",
    partner_dual_income: "Dual income",
    partner_single_income: "Single income",
    children: "Children",
    child_infant: "Infant / Toddler (0–6)",
    child_elementary: "Elementary (7–12)",
    child_teen: "Teenager (13–18)",
    child_adult: "Adult child (19+)",
    child_multi: "2+ children",
    parents_senior: "Parents / Senior",
    parent_one: "One parent",
    parent_both: "Both parents",
    parent_60s: "60s",
    parent_70plus: "70s or older",
    siblings: "Siblings",
    roommate: "Roommate / Housemate",
    pet: "Pets",
    pet_dog: "Dog",
    pet_cat: "Cat",
    pet_other: "Other (reptile, fish, small animal, etc.)",
    accessibility: "Accessibility needs",
    acc_mobility: "Mobility support (wheelchair, walker)",
    acc_visual_hearing: "Visual / Hearing support",
    acc_cognitive: "Cognitive support (dementia, developmental)",
    acc_child_safety: "Child safety (locks, corner guards, etc.)",
    int_health: "Health / Sleep / Fitness",
    int_energy: "Energy / Cost saving",
    int_entertain: "Home cinema / Music / Gaming",
    int_cooking: "Home cooking / Meal management",
    int_remote: "Remote / Hybrid work",
    int_night: "Night shift / Rotating schedule",
    int_away: "Frequently away / Business travel",
    int_hosting: "Home party / Hosting guests",
    int_season: "Seasonal events (holidays, year-end, World Cup, etc.)",
    apt_high: "High-rise apartment (15F+)",
    apt_low: "Low/mid-rise apartment or villa",
    studio: "Studio / Officetel / One-room",
    detached: "Detached house",
    townhouse: "Townhouse / Row house",
    suburban: "Suburban / Rural home",
    rental: "Rental / Short-term residence",
    shared: "Shared housing / Dormitory"
};

const PERSONA_CUSTOM_PLACEHOLDER_EN = {
    household: "Other household member — type here",
    interest: "Other interests — type here",
    housing: "Other housing type — type here"
};

/* Locale-specific housing overrides — merged at runtime via getLocalizedPersonaGroups */
const LOCALE_HOUSING_OPTIONS = {
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
    const resolveHousingOptions = (baseOptions) => {
        if (!countryCode) return baseOptions;
        const code = countryCode === "UK" ? "GB" : countryCode === "SEC" ? "KR" : countryCode;
        const localeOptions = LOCALE_HOUSING_OPTIONS[code];
        if (localeOptions) return localeOptions;
        // Check alias (e.g. AT → DE)
        const aliasMap = { AT: "DE", CH: "DE", CH_FR: "FR", CA_FR: "FR", BE_FR: "FR", AU: "US", CA: "US", NZ: "US", IE: "GB" };
        const alias = aliasMap[code];
        if (alias && LOCALE_HOUSING_OPTIONS[alias]) return LOCALE_HOUSING_OPTIONS[alias];
        return baseOptions;
    };

    const groups = PERSONA_CATEGORY_GROUPS.map((group) => {
        const g = { ...group };
        if (group.id === "housing") {
            g.options = resolveHousingOptions(group.options);
        }
        return g;
    });

    if (locale === "ko") return groups;

    return groups.map((group) => ({
        ...group,
        title: PERSONA_GROUP_TITLE_EN[group.id] || group.title,
        customPlaceholder: PERSONA_CUSTOM_PLACEHOLDER_EN[group.id] || group.customPlaceholder,
        options: group.options.map((option) => ({
            ...option,
            label: PERSONA_OPTION_LABEL_EN[option.id] || option.label,
            ...(option.sub ? { sub: option.sub.map((s) => ({
                ...s,
                label: PERSONA_OPTION_LABEL_EN[s.id] || s.label
            })) } : {})
        }))
    }));
}

const DEVICE_GROUP_TITLE_EN = {
    "air-fresh": "Air Comfort",
    "lights-control": "Lighting Control",
    "chores-help": "Home Chores",
    "home-safe": "Home Security",
    "sleep-well": "Sleep Environment",
    "enhanced-mood": "Mood & Entertainment",
    "care-scenarios": "Senior/Kids/Pet Care",
    "save-energy": "Energy Saving",
    "food-home": "Kitchen & Food Care"
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
    refrigerator: "Refrigerator",
    "kimchi-fridge": "Kimchi refrigerator",
    oven: "Oven",
    microwave: "Microwave",
    cooktop: "Induction / Cooktop"
};

function getLocalizedDeviceGroups(locale) {
    if (locale === "ko") return DEVICE_CATEGORY_GROUPS;

    return DEVICE_CATEGORY_GROUPS.map((group) => ({
        ...group,
        title: DEVICE_GROUP_TITLE_EN[group.id] || group.title,
        options: group.options.map((option) => ({
            ...option,
            label: DEVICE_OPTION_LABEL_EN[option.id] || option.label
        }))
    }));
}

const DEVICE_CATEGORY_GROUPS = [
    {
        id: "air-fresh",
        title: "쾌적한 공기 관리",
        options: [
            { id: "air-conditioner", label: "에어컨", normalized: "에어컨" },
            { id: "air-purifier", label: "공기청정기", normalized: "에어컨" },
            { id: "ventilation", label: "환기 시스템", normalized: "에어컨" },
            { id: "dehumidifier", label: "제습기", normalized: "에어컨" },
            { id: "air-monitor", label: "에어 모니터링", normalized: "센서" },
            { id: "fan", label: "팬/서큘레이터", normalized: "에어컨" }
        ]
    },
    {
        id: "lights-control",
        title: "간편한 조명 제어",
        options: [
            { id: "lighting", label: "조명", normalized: "조명" },
            { id: "mood-light", label: "무드 조명", normalized: "조명" },
            { id: "smart-switch", label: "버튼/스위치", normalized: "센서" },
            { id: "curtain", label: "커튼/블라인드", normalized: "센서" },
            { id: "sleep-light", label: "기상·수면 조명", normalized: "조명" }
        ]
    },
    {
        id: "chores-help",
        title: "가사 보조",
        options: [
            { id: "robot-vacuum", label: "로봇청소기", normalized: "로봇청소기" },
            { id: "vacuum", label: "청소기", normalized: "로봇청소기" },
            { id: "washer", label: "세탁기", normalized: "세탁기" },
            { id: "dryer", label: "건조기", normalized: "건조기" },
            { id: "washer-dryer", label: "세탁기/건조기", normalized: "세탁기/건조기" },
            { id: "dishwasher", label: "식기세척기", normalized: "세탁기/건조기" }
        ]
    },
    {
        id: "home-safe",
        title: "홈 시큐리티",
        options: [
            { id: "camera", label: "카메라/CCTV", normalized: "센서" },
            { id: "door-lock", label: "도어락", normalized: "센서" },
            { id: "doorbell", label: "비디오 도어벨", normalized: "센서" },
            { id: "open-sensor", label: "문열림 센서", normalized: "센서" },
            { id: "leak-smoke", label: "누수/연기 감지기", normalized: "센서" },
            { id: "hub", label: "SmartThings Hub", normalized: "센서" }
        ]
    },
    {
        id: "sleep-well",
        title: "숙면 환경",
        options: [
            { id: "sleep-sensor", label: "수면 센서", normalized: "센서" },
            { id: "bedside-light", label: "침실 조명", normalized: "조명" },
            { id: "bedroom-aircon", label: "침실 에어컨", normalized: "에어컨" },
            { id: "air-purifier-bed", label: "침실 공기청정기", normalized: "에어컨" },
            { id: "wearable-sleep", label: "웨어러블", normalized: "센서" }
        ]
    },
    {
        id: "enhanced-mood",
        title: "무드 & 엔터테인먼트",
        options: [
            { id: "tv-premium", label: "TV", normalized: "TV" },
            { id: "projector", label: "프로젝터", normalized: "TV" },
            { id: "monitor", label: "모니터", normalized: "TV" },
            { id: "speaker", label: "스피커", normalized: "스피커" },
            { id: "soundbar", label: "사운드바", normalized: "스피커" },
            { id: "gaming-console", label: "게임 콘솔", normalized: "TV" }
        ]
    },
    {
        id: "care-scenarios",
        title: "시니어·키즈·펫 케어",
        options: [
            { id: "pet-feeder", label: "펫 피더", normalized: "센서" },
            { id: "care-camera", label: "실내 카메라", normalized: "센서" },
            { id: "activity-sensor", label: "활동 감지 센서", normalized: "센서" },
            { id: "fall-sensor", label: "낙상 감지 센서", normalized: "센서" },
            { id: "care-button", label: "긴급 호출 버튼", normalized: "센서" },
            { id: "wearable-care", label: "케어 웨어러블", normalized: "센서" }
        ]
    },
    {
        id: "save-energy",
        title: "에너지 절약",
        options: [
            { id: "smart-plug", label: "스마트 플러그", normalized: "센서" },
            { id: "energy-monitor", label: "에너지 모니터", normalized: "센서" },
            { id: "smart-meter", label: "전력 사용량 모니터", normalized: "센서" },
            { id: "hub-energy", label: "에너지 자동화 허브", normalized: "센서" },
            { id: "eco-aircon", label: "AI 절약모드 에어컨", normalized: "에어컨" }
        ]
    },
    {
        id: "food-home",
        title: "주방 & 푸드 케어",
        options: [
            { id: "refrigerator", label: "냉장고", normalized: "냉장고" },
            { id: "kimchi-fridge", label: "김치냉장고", normalized: "냉장고" },
            { id: "oven", label: "오븐", normalized: "오븐" },
            { id: "microwave", label: "전자레인지", normalized: "오븐" },
            { id: "cooktop", label: "인덕션/쿡탑", normalized: "오븐" }
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
        body: "사용자 유형과 실제 상황을 함께 적을수록 메시지와 자동화 흐름이 훨씬 생생해집니다."
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

