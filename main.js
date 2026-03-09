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
        title: "가구 구성",
        options: [
            { id: "dual_income", label: "맞벌이 부부" },
            { id: "single_parent", label: "한부모 가구" },
            { id: "senior_couple", label: "노년 부부" },
            { id: "newlywed", label: "신혼부부" },
            { id: "solo_wife", label: "여성 1인 가구" },
            { id: "solo_husband", label: "남성 1인 가구" },
            { id: "shared_home", label: "룸메이트/셰어하우스" }
        ]
    },
    {
        id: "life_stage",
        title: "생활 단계",
        options: [
            { id: "with_baby", label: "영유아 자녀 가구" },
            { id: "with_kids", label: "초등 자녀 가구" },
            { id: "with_teens", label: "청소년 자녀 가구" },
            { id: "caregiver", label: "돌봄 책임 가구" },
            { id: "empty_nester", label: "자녀 독립 후 부부 가구" }
        ]
    },
    {
        id: "living_pattern",
        title: "생활 패턴",
        options: [
            { id: "remote_worker", label: "재택근무 중심" },
            { id: "commuter", label: "장거리 출퇴근" },
            { id: "night_shift", label: "야간 생활/교대근무" },
            { id: "frequent_travel", label: "출장·외출이 잦은 생활" },
            { id: "weekend_host", label: "주말 홈파티·손님 맞이" }
        ]
    },
    {
        id: "pet_care",
        title: "펫 케어",
        options: [
            { id: "dog_owner", label: "강아지와 함께 사는 가구" },
            { id: "cat_owner", label: "고양이와 함께 사는 가구" },
            { id: "senior_pet", label: "노령 반려동물과 함께 사는 가구" },
            { id: "multi_pet", label: "반려동물 다두 가구" }
        ]
    }
];

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
    ["Bahrain", "AE", "English", "www.samsung.com/ae"]
];

const UI_TEXT = {
    ko: {
        enterAgent: "Enter Agent",
        accessRequired: "접근 코드를 입력해 주세요.",
        accessPlaceholder: "접근 코드 입력",
        accessHelper: "접근 코드는 서버에서 확인되며, 승인되면 바로 다음 단계로 이어집니다.",
        accessVerifying: "접근 코드를 확인하고 있습니다.",
        accessInvalid: "유효하지 않은 접근 코드입니다.",
        accessInvalidRemaining: "유효하지 않은 접근 코드입니다. 남은 시도 {count}회.",
        accessLocked: "실패 횟수가 많아 잠시 잠겼습니다. 잠시 후 다시 시도해 주세요.",
        accessLockedWithTime: "실패 횟수가 많아 잠시 잠겼습니다. {time} 후에 다시 시도해 주세요.",
        accessLockedNewWindow: "3회 연속 실패로 이 창은 잠겼습니다. {time} 후 다시 시도하거나 새 창에서 다시 시작해 주세요.",
        accessUnavailable: "접근 코드 검증 서버에 연결할 수 없습니다.",
        accessGranted: "접근이 확인되었습니다. 가이드를 여는 중입니다.",
        accessShow: "보기",
        accessHide: "숨기기",
        logout: "로그아웃",
        loggedOut: "세션이 종료되었습니다. 다시 접근 코드를 입력해 주세요.",
        guideTitle: "사용 방법을 아시나요?",
        guideQuick: "Quick Guide",
        guideLine1: "질문은 한 번에 하나씩 열립니다.",
        guideLine2: "답변을 마칠 때마다 다음 방향을 넓혀주는 힌트가 제공됩니다.",
        guideLine3: "네 단계를 마치면 바로 활용 가능한 시나리오가 정리됩니다.",
        startAfterGuide: "좋아요. 이제 Q1부터 한 단계씩 진행할게요. 각 답변 뒤에 다음 방향을 더 선명하게 만드는 힌트를 함께 보여드립니다.",
        unlockedPlaceholder: "사용 방법 확인 후 Q1부터 차례대로 시작합니다.",
        stateMissing: "질문에 답하면 현재 선택한 내용이 여기에 정리됩니다.",
        checkPlaceholder: "시나리오를 생성하면 구성 점검 결과가 표시됩니다.",
        outputPlaceholder: "접근 확인 후 네 가지 질문을 순서대로 완료하면 상세 시나리오와 역할별 활용안을 확인할 수 있습니다.",
        progress1: "Q1 담당 업무",
        progress2: "Q2 지역",
        progress3: "Q3 타겟 고객 및 상황",
        progress4: "Q4 반영 기기",
        prev: "이전",
        next: "다음",
        build: "Scenario Build",
        downloadMarkdown: "Download Markdown",
        downloadJson: "Download JSON",
        printPdf: "Print / Save PDF",
        copySummary: "Copy Summary",
        current: "입력 요약",
        check: "구성 점검",
        output: "Scenario Output",
        roleQuestion: "Q1. 어떤 관점에서 시나리오를 만들고 싶나요?",
        countryQuestion: "Q2. 어느 국가를 대상으로 하나요?",
        personaQuestion: "Q3. 어떤 타겟 세그먼트와 생활 맥락을 떠올리고 있나요?",
        deviceQuestion: "Q4. 어떤 기기를 중심으로 구성할까요?",
        purposePlaceholder: "예: 맞벌이 가정이 퇴근 후 아이와 함께 집에 들어왔을 때 더 빠르고 편안하게 저녁 시간을 시작하고 싶다",
        countryHelper: "국가와 지역을 고르면 어떤 생활 장면이 더 설득력 있게 읽히는지 바로 좁혀집니다.",
        personaHelper: "가구 유형과 생활 맥락을 함께 고르면 타겟이 더 선명해지고, 시나리오 톤도 달라집니다.",
        deviceHelper: "상위 카테고리를 먼저 고르고 필요한 기기만 남기면 실제 사용 장면이 훨씬 빠르게 잡힙니다.",
        roleMissing: "Q1에서 담당 업무 관점을 먼저 선택해 주세요.",
        countryMissing: "Q2에서 국가를 선택해 주세요.",
        personaMissing: "Q3에서 타겟 세그먼트를 선택하거나 상황 설명을 입력해 주세요.",
        allMissing: "네 가지 질문을 모두 완료한 뒤 다시 시도해 주세요.",
        downloadFirst: "먼저 시나리오를 생성해 주세요.",
        summaryState: "Input Summary",
        detailedScenario: "상세 시나리오",
        automation: "자동화 흐름",
        facts: "구성 근거",
        confirmed: "확정 정보",
        assumptions: "참고 메모",
        lenses: "활용 관점",
        effects: "기대 효과",
        segment: "추천 사용자",
        guide: "시작 가이드",
        evaluation: "활용 판단",
        why: "Why",
        comparison: "Comparison",
        note: "Note",
        roleLens: "Role Lens",
        executionPoints: "실행 포인트",
        summary: "요약",
        fit: "적합",
        review: "재검토 필요",
        fitCheck: "구성 적합성",
        availabilityCheck: "기기 가용성",
        executionCheck: "실행 가능성",
        clarityCheck: "메시지 명확성",
        metricCheck: "성과 연결성"
    },
    en: {
        enterAgent: "Enter Agent",
        accessRequired: "Please enter the access code.",
        accessPlaceholder: "Enter access code",
        accessHelper: "The access code is verified on the server and creates a session on success.",
        accessVerifying: "Verifying your access code.",
        accessInvalid: "Invalid access code.",
        accessInvalidRemaining: "Invalid access code. {count} attempts remaining.",
        accessLocked: "Too many failed attempts. Try again later.",
        accessLockedWithTime: "Too many failed attempts. Try again in {time}.",
        accessLockedNewWindow: "This tab is locked after 3 failed attempts. Try again in {time}, or start again in a new tab.",
        accessUnavailable: "The access verification server is unavailable.",
        accessGranted: "Access confirmed. Opening the guide.",
        accessShow: "Show",
        accessHide: "Hide",
        logout: "Logout",
        loggedOut: "Your session has been signed out. Enter the access code again.",
        guideTitle: "Do you know how to use this agent?",
        guideQuick: "Quick Guide",
        guideLine1: "Questions appear one at a time.",
        guideLine2: "After each answer, you get a short prompt that expands the next direction.",
        guideLine3: "Once all four steps are complete, a practical scenario is generated immediately.",
        startAfterGuide: "Good. We will start from Q1 step by step, with a short prompt after each answer to sharpen the next direction.",
        unlockedPlaceholder: "After the usage check, you will start from Q1 in sequence.",
        stateMissing: "Your current selections will appear here as you answer each question.",
        checkPlaceholder: "A quick structure check will appear after the scenario is generated.",
        outputPlaceholder: "After access confirmation and all four questions, you will see the detailed scenario and role-based applications.",
        progress1: "Q1 Work Lens",
        progress2: "Q2 Region",
        progress3: "Q3 User & Context",
        progress4: "Q4 Device",
        prev: "Back",
        next: "Next",
        build: "Scenario Build",
        downloadMarkdown: "Download Markdown",
        downloadJson: "Download JSON",
        printPdf: "Print / Save PDF",
        copySummary: "Copy Summary",
        current: "Current Input",
        check: "Structure Check",
        output: "Scenario Output",
        roleQuestion: "Q1. From which professional lens do you want to build this scenario?",
        countryQuestion: "Q2. Which country is this for?",
        personaQuestion: "Q3. Which target segment and situation do you have in mind?",
        deviceQuestion: "Q4. Which device should anchor the scenario?",
        purposePlaceholder: "Example: A dual-income family wants to start the evening faster and more comfortably right after arriving home with their child.",
        countryHelper: "Pick the market and region first to narrow which life moment will feel most convincing.",
        personaHelper: "Combine household type and living context to make the target sharper and the scenario tone more specific.",
        deviceHelper: "Start with a top category, then trim the device list to the exact mix you want to frame.",
        roleMissing: "Please choose the work lens first in Q1.",
        countryMissing: "Please choose the country in Q2.",
        personaMissing: "In Q3, choose the target segment or describe the situation.",
        allMissing: "Please complete all four questions before generating the scenario.",
        downloadFirst: "Please generate a scenario first.",
        summaryState: "Input Summary",
        detailedScenario: "Detailed Scenario",
        automation: "Automation Flow",
        facts: "Scenario Basis",
        confirmed: "Confirmed Info",
        assumptions: "Notes",
        lenses: "Use Cases by Role",
        effects: "Expected Impact",
        segment: "Recommended Audience",
        guide: "Getting Started",
        evaluation: "Evaluation",
        why: "Why",
        comparison: "Comparison",
        note: "Note",
        roleLens: "Role Lens",
        executionPoints: "Execution Points",
        summary: "Summary",
        fit: "Good",
        review: "Needs Review",
        fitCheck: "Scenario Fit",
        availabilityCheck: "Device Availability",
        executionCheck: "Execution Feasibility",
        clarityCheck: "Message Clarity",
        metricCheck: "Outcome Linkage"
    },
    de: {
        enterAgent: "Agent Starten",
        accessRequired: "Bitte geben Sie den Zugangscode ein.",
        accessPlaceholder: "Zugangscode eingeben",
        accessHelper: "Der Zugangscode wird serverseitig geprüft und erzeugt bei Erfolg eine Sitzung.",
        accessVerifying: "Der Zugangscode wird geprüft.",
        accessInvalid: "Der Zugangscode ist ungültig.",
        accessInvalidRemaining: "Der Zugangscode ist ungültig. Verbleibende Versuche: {count}.",
        accessLocked: "Zu viele Fehlversuche. Bitte versuchen Sie es später erneut.",
        accessLockedWithTime: "Zu viele Fehlversuche. Bitte versuchen Sie es in {time} erneut.",
        accessLockedNewWindow: "Dieser Tab ist nach 3 Fehlversuchen gesperrt. Versuchen Sie es in {time} erneut oder starten Sie in einem neuen Tab.",
        accessUnavailable: "Der Verifizierungsserver ist nicht erreichbar.",
        accessGranted: "Zugang bestätigt. Die Anleitung wird geöffnet.",
        accessShow: "Anzeigen",
        accessHide: "Ausblenden",
        logout: "Abmelden",
        loggedOut: "Ihre Sitzung wurde beendet. Bitte geben Sie den Zugangscode erneut ein.",
        guideTitle: "Kennen Sie die Nutzung dieses Agents?",
        guideQuick: "Kurzanleitung",
        guideLine1: "Die Fragen erscheinen nacheinander.",
        guideLine2: "Nach jeder Antwort erhalten Sie einen kurzen Hinweis für die nächste Richtung.",
        guideLine3: "Nach vier Schritten wird sofort ein nutzbares Szenario erstellt.",
        startAfterGuide: "Gut. Wir starten jetzt Schritt für Schritt mit Q1 und geben nach jeder Antwort einen kurzen Hinweis für die nächste Richtung.",
        unlockedPlaceholder: "Nach der kurzen Nutzungsabfrage starten Sie nacheinander mit Q1.",
        stateMissing: "Ihre aktuellen Eingaben werden hier während der Fragen zusammengefasst.",
        checkPlaceholder: "Nach der Generierung erscheint hier eine kurze Strukturprüfung.",
        outputPlaceholder: "Nach Zugang und vier Fragen sehen Sie das detaillierte Szenario und die rollenspezifischen Nutzungsideen.",
        progress1: "Q1 Perspektive",
        progress2: "Q2 Region",
        progress3: "Q3 Nutzer & Kontext",
        progress4: "Q4 Gerät",
        prev: "Zurück",
        next: "Weiter",
        build: "Szenario Erstellen",
        downloadMarkdown: "Markdown Laden",
        downloadJson: "JSON Laden",
        printPdf: "Drucken / PDF Speichern",
        copySummary: "Zusammenfassung Kopieren",
        current: "Aktuelle Eingabe",
        check: "Strukturprüfung",
        output: "Szenario-Ausgabe",
        roleQuestion: "Q1. Aus welcher fachlichen Perspektive möchten Sie dieses Szenario erstellen?",
        countryQuestion: "Q2. Für welches Land ist das Szenario gedacht?",
        personaQuestion: "Q3. Welchen Nutzertyp und welche Situation haben Sie im Kopf?",
        deviceQuestion: "Q4. Welches Gerät soll im Zentrum stehen?",
        purposePlaceholder: "Beispiel: Eine Doppelverdiener-Familie möchte den Abend nach der Rückkehr mit ihrem Kind schneller und angenehmer beginnen.",
        countryHelper: "Wählen Sie zuerst Markt und Region, damit klarer wird, welcher Alltagsmoment am stärksten wirkt.",
        personaHelper: "Kombinieren Sie Haushaltstyp und Lebenskontext, damit Zielgruppe und Szenarioton präziser werden.",
        deviceHelper: "Starten Sie mit einer Oberkategorie und grenzen Sie dann die konkrete Gerätekombination ein.",
        roleMissing: "Bitte wählen Sie zuerst in Q1 die fachliche Perspektive aus.",
        countryMissing: "Bitte wählen Sie in Q2 das Land aus.",
        personaMissing: "Wählen Sie in Q3 den Nutzertyp oder beschreiben Sie die Situation.",
        allMissing: "Bitte beantworten Sie zuerst alle vier Fragen.",
        downloadFirst: "Bitte erzeugen Sie zuerst ein Szenario.",
        summaryState: "Eingabeübersicht",
        detailedScenario: "Detailliertes Szenario",
        automation: "Automationsablauf",
        facts: "Grundlage des Szenarios",
        confirmed: "Bestätigte Informationen",
        assumptions: "Hinweise",
        lenses: "Nutzung nach Rolle",
        effects: "Erwartete Wirkung",
        segment: "Empfohlene Zielgruppe",
        guide: "Erste Schritte",
        evaluation: "Bewertung",
        why: "Warum",
        comparison: "Vergleich",
        note: "Hinweis",
        roleLens: "Rollenansicht",
        executionPoints: "Umsetzungspunkte",
        summary: "Zusammenfassung",
        fit: "Passend",
        review: "Überprüfen",
        fitCheck: "Szenario-Fit",
        availabilityCheck: "Geräteverfügbarkeit",
        executionCheck: "Umsetzbarkeit",
        clarityCheck: "Botschaftsklarheit",
        metricCheck: "Wirkungsbezug"
    },
    fr: {
        enterAgent: "Entrer dans l'agent",
        accessRequired: "Veuillez saisir le code d'accès.",
        accessPlaceholder: "Saisir le code d'accès",
        accessHelper: "Le code d'accès est vérifié sur le serveur et ouvre immédiatement l'étape suivante après validation.",
        guideTitle: "Savez-vous comment utiliser cet agent ?",
        guideQuick: "Guide Rapide",
        guideLine1: "Les questions apparaissent une par une.",
        guideLine2: "Après chaque réponse, vous recevez un court indice pour orienter la suite.",
        guideLine3: "Une fois les quatre étapes terminées, un scénario exploitable est généré immédiatement.",
        startAfterGuide: "Très bien. Nous allons commencer à partir de la Q1, étape par étape, avec un court indice après chaque réponse.",
        unlockedPlaceholder: "Après cette vérification rapide, vous commencerez à partir de la Q1.",
        stateMissing: "Vos sélections actuelles apparaîtront ici au fur et à mesure.",
        checkPlaceholder: "Une vérification rapide de la structure apparaîtra après la génération du scénario.",
        outputPlaceholder: "Après l'accès et les quatre questions, vous verrez le scénario détaillé et les applications par rôle.",
        progress1: "Q1 Rôle",
        progress2: "Q2 Région",
        progress3: "Q3 Utilisateur et contexte",
        progress4: "Q4 Appareil",
        prev: "Précédent",
        next: "Suivant",
        build: "Créer le scénario",
        downloadMarkdown: "Télécharger Markdown",
        downloadJson: "Télécharger JSON",
        printPdf: "Imprimer / Enregistrer PDF",
        copySummary: "Copier le résumé",
        current: "Entrée actuelle",
        check: "Vérification",
        output: "Sortie du scénario",
        roleQuestion: "Q1. Sous quel angle professionnel souhaitez-vous construire ce scénario ?",
        countryQuestion: "Q2. Pour quel pays ce scénario est-il destiné ?",
        personaQuestion: "Q3. Quel utilisateur et quelle situation avez-vous en tête ?",
        deviceQuestion: "Q4. Quel appareil doit être au centre du scénario ?",
        purposePlaceholder: "Exemple : une famille avec deux revenus souhaite commencer la soirée plus vite et plus confortablement après son retour à la maison avec son enfant.",
        countryHelper: "Les appareils recommandés et les angles narratifs peuvent varier selon le marché.",
        personaHelper: "Ajoutez l'âge, le mode de vie, la saison et les problèmes à la maison pour rendre le scénario plus convaincant.",
        deviceHelper: "Choisir une catégorie d'appareil rend le scénario plus flexible et évolutif.",
        roleMissing: "Veuillez d'abord choisir l'angle professionnel dans la Q1.",
        countryMissing: "Veuillez choisir le pays dans la Q2.",
        personaMissing: "Dans la Q3, sélectionnez le type d'utilisateur ou décrivez la situation.",
        allMissing: "Veuillez compléter les quatre questions avant de générer le scénario.",
        downloadFirst: "Veuillez d'abord générer un scénario.",
        summaryState: "Résumé des entrées",
        detailedScenario: "Scénario détaillé",
        automation: "Flux d'automatisation",
        facts: "Base du scénario",
        confirmed: "Informations confirmées",
        assumptions: "Notes",
        lenses: "Usages par rôle",
        effects: "Impact attendu",
        segment: "Public recommandé",
        guide: "Premiers pas",
        evaluation: "Évaluation",
        why: "Pourquoi",
        comparison: "Comparaison",
        note: "Note",
        roleLens: "Vue par rôle",
        executionPoints: "Points d'exécution",
        summary: "Résumé",
        fit: "Bon",
        review: "À revoir",
        fitCheck: "Pertinence du scénario",
        availabilityCheck: "Disponibilité de l'appareil",
        executionCheck: "Faisabilité",
        clarityCheck: "Clarté du message",
        metricCheck: "Lien avec le résultat"
    },
    es: {
        enterAgent: "Entrar al agente",
        accessRequired: "Por favor, introduce el código de acceso.",
        accessPlaceholder: "Introducir código de acceso",
        accessHelper: "El código de acceso se verifica en el servidor y te lleva al siguiente paso en cuanto se aprueba.",
        guideTitle: "¿Sabes cómo usar este agente?",
        guideQuick: "Guía Rápida",
        guideLine1: "Las preguntas aparecen una por una.",
        guideLine2: "Después de cada respuesta, recibirás una pista breve para orientar el siguiente paso.",
        guideLine3: "Cuando completes los cuatro pasos, se generará de inmediato un escenario utilizable.",
        startAfterGuide: "Bien. Empezaremos desde la Q1 paso a paso, con una pista breve después de cada respuesta.",
        unlockedPlaceholder: "Después de esta breve verificación, comenzarás desde la Q1.",
        stateMissing: "Tus selecciones actuales aparecerán aquí a medida que respondas.",
        checkPlaceholder: "Aquí aparecerá una revisión rápida de la estructura después de generar el escenario.",
        outputPlaceholder: "Después del acceso y de responder las cuatro preguntas, verás el escenario detallado y las aplicaciones por rol.",
        progress1: "Q1 Enfoque",
        progress2: "Q2 Región",
        progress3: "Q3 Usuario y contexto",
        progress4: "Q4 Dispositivo",
        prev: "Atrás",
        next: "Siguiente",
        build: "Crear escenario",
        downloadMarkdown: "Descargar Markdown",
        downloadJson: "Descargar JSON",
        printPdf: "Imprimir / Guardar PDF",
        copySummary: "Copiar resumen",
        current: "Entrada actual",
        check: "Revisión",
        output: "Resultado del escenario",
        roleQuestion: "Q1. ¿Desde qué perspectiva profesional quieres crear este escenario?",
        countryQuestion: "Q2. ¿Para qué país es este escenario?",
        personaQuestion: "Q3. ¿Qué usuario y qué situación tienes en mente?",
        deviceQuestion: "Q4. ¿Qué dispositivo debe ser el eje del escenario?",
        purposePlaceholder: "Ejemplo: una familia con doble ingreso quiere empezar la noche de forma más rápida y cómoda al llegar a casa con su hijo.",
        countryHelper: "Los dispositivos recomendados y los enfoques narrativos pueden variar según el mercado.",
        personaHelper: "Añade edad, estilo de vida, temporada y problemas del hogar para que el escenario sea más convincente.",
        deviceHelper: "Elegir una categoría de dispositivo hace que el escenario sea más flexible y ampliable.",
        roleMissing: "Primero elige la perspectiva profesional en la Q1.",
        countryMissing: "Elige el país en la Q2.",
        personaMissing: "En la Q3, selecciona el tipo de usuario o describe la situación.",
        allMissing: "Completa las cuatro preguntas antes de generar el escenario.",
        downloadFirst: "Primero genera un escenario.",
        summaryState: "Resumen de entrada",
        detailedScenario: "Escenario detallado",
        automation: "Flujo de automatización",
        facts: "Base del escenario",
        confirmed: "Información confirmada",
        assumptions: "Notas",
        lenses: "Usos por rol",
        effects: "Impacto esperado",
        segment: "Audiencia recomendada",
        guide: "Primeros pasos",
        evaluation: "Evaluación",
        why: "Por qué",
        comparison: "Comparación",
        note: "Nota",
        roleLens: "Vista por rol",
        executionPoints: "Puntos de ejecución",
        summary: "Resumen",
        fit: "Adecuado",
        review: "Revisar",
        fitCheck: "Ajuste del escenario",
        availabilityCheck: "Disponibilidad del dispositivo",
        executionCheck: "Viabilidad",
        clarityCheck: "Claridad del mensaje",
        metricCheck: "Vínculo con el resultado"
    },
    pt: {
        enterAgent: "Entrar no agente",
        accessRequired: "Insira o código de acesso.",
        accessPlaceholder: "Inserir código de acesso",
        accessHelper: "O código de acesso é verificado no servidor e, quando aprovado, você segue direto para a próxima etapa.",
        guideTitle: "Você sabe como usar este agente?",
        guideQuick: "Guia Rápido",
        guideLine1: "As perguntas aparecem uma de cada vez.",
        guideLine2: "Após cada resposta, você recebe uma dica curta para orientar o próximo passo.",
        guideLine3: "Depois de concluir as quatro etapas, um cenário utilizável é gerado imediatamente.",
        startAfterGuide: "Ótimo. Vamos começar pela Q1 passo a passo, com uma dica curta após cada resposta.",
        unlockedPlaceholder: "Após esta verificação rápida, você começará pela Q1.",
        stateMissing: "Suas seleções atuais aparecerão aqui conforme você responder.",
        checkPlaceholder: "Uma verificação rápida da estrutura aparecerá aqui após a geração do cenário.",
        outputPlaceholder: "Após o acesso e as quatro perguntas, você verá o cenário detalhado e as aplicações por função.",
        progress1: "Q1 Função",
        progress2: "Q2 Região",
        progress3: "Q3 Usuário e contexto",
        progress4: "Q4 Dispositivo",
        prev: "Voltar",
        next: "Próximo",
        build: "Criar cenário",
        downloadMarkdown: "Baixar Markdown",
        downloadJson: "Baixar JSON",
        printPdf: "Imprimir / Salvar PDF",
        copySummary: "Copiar resumo",
        current: "Entrada atual",
        check: "Verificação",
        output: "Saída do cenário",
        roleQuestion: "Q1. De qual perspectiva profissional você quer construir este cenário?",
        countryQuestion: "Q2. Para qual país este cenário é destinado?",
        personaQuestion: "Q3. Que usuário e situação você tem em mente?",
        deviceQuestion: "Q4. Qual dispositivo deve estar no centro do cenário?",
        purposePlaceholder: "Exemplo: uma família com dupla renda quer começar a noite de forma mais rápida e confortável ao chegar em casa com o filho.",
        countryHelper: "Os dispositivos recomendados e os ângulos de narrativa podem variar conforme o mercado.",
        personaHelper: "Adicione idade, estilo de vida, estação e problemas em casa para deixar o cenário mais convincente.",
        deviceHelper: "Escolher uma categoria de dispositivo mantém o cenário mais flexível e expansível.",
        roleMissing: "Primeiro escolha a perspectiva profissional na Q1.",
        countryMissing: "Escolha o país na Q2.",
        personaMissing: "Na Q3, selecione o tipo de usuário ou descreva a situação.",
        allMissing: "Conclua as quatro perguntas antes de gerar o cenário.",
        downloadFirst: "Gere um cenário primeiro.",
        summaryState: "Resumo da entrada",
        detailedScenario: "Cenário detalhado",
        automation: "Fluxo de automação",
        facts: "Base do cenário",
        confirmed: "Informações confirmadas",
        assumptions: "Notas",
        lenses: "Usos por função",
        effects: "Impacto esperado",
        segment: "Público recomendado",
        guide: "Primeiros passos",
        evaluation: "Avaliação",
        why: "Por quê",
        comparison: "Comparação",
        note: "Nota",
        roleLens: "Visão por função",
        executionPoints: "Pontos de execução",
        summary: "Resumo",
        fit: "Adequado",
        review: "Revisar",
        fitCheck: "Adequação do cenário",
        availabilityCheck: "Disponibilidade do dispositivo",
        executionCheck: "Viabilidade",
        clarityCheck: "Clareza da mensagem",
        metricCheck: "Ligação com o resultado"
    },
    it: {
        enterAgent: "Entra nell'agente",
        accessRequired: "Inserisci il codice di accesso.",
        accessPlaceholder: "Inserisci codice di accesso",
        accessHelper: "Il codice di accesso viene verificato sul server e, quando approvato, passa subito allo step successivo.",
        guideTitle: "Sai come usare questo agente?",
        guideQuick: "Guida Rapida",
        guideLine1: "Le domande appaiono una alla volta.",
        guideLine2: "Dopo ogni risposta ricevi un breve suggerimento per orientare il passo successivo.",
        guideLine3: "Dopo quattro passaggi viene generato subito uno scenario utilizzabile.",
        startAfterGuide: "Bene. Inizieremo dalla Q1 passo dopo passo, con un breve suggerimento dopo ogni risposta.",
        unlockedPlaceholder: "Dopo questa breve verifica inizierai dalla Q1.",
        stateMissing: "Le tue selezioni attuali appariranno qui mentre rispondi.",
        checkPlaceholder: "Qui comparirà un rapido controllo della struttura dopo la generazione dello scenario.",
        outputPlaceholder: "Dopo l'accesso e le quattro domande vedrai lo scenario dettagliato e le applicazioni per ruolo.",
        progress1: "Q1 Ruolo",
        progress2: "Q2 Regione",
        progress3: "Q3 Utente e contesto",
        progress4: "Q4 Dispositivo",
        prev: "Indietro",
        next: "Avanti",
        build: "Crea scenario",
        downloadMarkdown: "Scarica Markdown",
        downloadJson: "Scarica JSON",
        printPdf: "Stampa / Salva PDF",
        copySummary: "Copia riepilogo",
        current: "Input attuale",
        check: "Controllo",
        output: "Output scenario",
        roleQuestion: "Q1. Da quale prospettiva professionale vuoi costruire questo scenario?",
        countryQuestion: "Q2. Per quale paese è pensato questo scenario?",
        personaQuestion: "Q3. Quale utente e quale situazione hai in mente?",
        deviceQuestion: "Q4. Quale dispositivo deve stare al centro dello scenario?",
        purposePlaceholder: "Esempio: una famiglia con doppio reddito vuole iniziare la serata in modo più rapido e confortevole appena rientra a casa con il figlio.",
        countryHelper: "I dispositivi consigliati e gli angoli narrativi possono cambiare in base al mercato.",
        personaHelper: "Aggiungi età, stile di vita, stagione e problemi in casa per rendere lo scenario più convincente.",
        deviceHelper: "Scegliere una categoria di dispositivo rende lo scenario più flessibile ed estendibile.",
        roleMissing: "Per prima cosa scegli la prospettiva professionale nella Q1.",
        countryMissing: "Scegli il paese nella Q2.",
        personaMissing: "Nella Q3, seleziona il tipo di utente o descrivi la situazione.",
        allMissing: "Completa tutte e quattro le domande prima di generare lo scenario.",
        downloadFirst: "Genera prima uno scenario.",
        summaryState: "Riepilogo input",
        detailedScenario: "Scenario dettagliato",
        automation: "Flusso di automazione",
        facts: "Base dello scenario",
        confirmed: "Informazioni confermate",
        assumptions: "Note",
        lenses: "Usi per ruolo",
        effects: "Impatto atteso",
        segment: "Pubblico consigliato",
        guide: "Primi passi",
        evaluation: "Valutazione",
        why: "Perché",
        comparison: "Confronto",
        note: "Nota",
        roleLens: "Vista per ruolo",
        executionPoints: "Punti di esecuzione",
        summary: "Riepilogo",
        fit: "Adatto",
        review: "Da rivedere",
        fitCheck: "Aderenza dello scenario",
        availabilityCheck: "Disponibilità del dispositivo",
        executionCheck: "Fattibilità",
        clarityCheck: "Chiarezza del messaggio",
        metricCheck: "Collegamento al risultato"
    },
    nl: {
        enterAgent: "Agent openen",
        accessRequired: "Voer de toegangscode in.",
        accessPlaceholder: "Toegangscode invoeren",
        accessHelper: "De toegangscode wordt op de server gecontroleerd en gaat na goedkeuring direct door naar de volgende stap.",
        guideTitle: "Weet je hoe je deze agent gebruikt?",
        guideQuick: "Snelle gids",
        guideLine1: "De vragen verschijnen één voor één.",
        guideLine2: "Na elk antwoord krijg je een korte hint voor de volgende richting.",
        guideLine3: "Na vier stappen wordt direct een bruikbaar scenario gegenereerd.",
        startAfterGuide: "Goed. We beginnen nu stap voor stap bij Q1, met na elk antwoord een korte hint voor de volgende richting.",
        unlockedPlaceholder: "Na deze korte controle begin je bij Q1.",
        stateMissing: "Je huidige keuzes verschijnen hier terwijl je antwoordt.",
        checkPlaceholder: "Na het genereren verschijnt hier een snelle structuurcontrole.",
        outputPlaceholder: "Na toegang en vier vragen zie je het gedetailleerde scenario en de toepassingen per rol.",
        progress1: "Q1 Rol",
        progress2: "Q2 Regio",
        progress3: "Q3 Gebruiker en context",
        progress4: "Q4 Apparaat",
        prev: "Terug",
        next: "Volgende",
        build: "Scenario maken",
        downloadMarkdown: "Markdown downloaden",
        downloadJson: "JSON downloaden",
        printPdf: "Afdrukken / PDF opslaan",
        copySummary: "Samenvatting kopiëren",
        current: "Huidige invoer",
        check: "Controle",
        output: "Scenario-uitvoer",
        roleQuestion: "Q1. Vanuit welk professioneel perspectief wil je dit scenario opbouwen?",
        countryQuestion: "Q2. Voor welk land is dit scenario bedoeld?",
        personaQuestion: "Q3. Welke gebruiker en situatie heb je in gedachten?",
        deviceQuestion: "Q4. Welk apparaat moet centraal staan?",
        purposePlaceholder: "Voorbeeld: een gezin met twee inkomens wil de avond sneller en comfortabeler starten zodra het met het kind thuiskomt.",
        countryHelper: "Aanbevolen apparaten en verhaalhoeken kunnen per markt verschillen.",
        personaHelper: "Voeg leeftijd, levensstijl, seizoen en problemen thuis toe om het scenario overtuigender te maken.",
        deviceHelper: "Een apparaatcategorie kiezen houdt het scenario flexibeler en beter uitbreidbaar.",
        roleMissing: "Kies eerst het professionele perspectief in Q1.",
        countryMissing: "Kies het land in Q2.",
        personaMissing: "Kies in Q3 het gebruikerstype of beschrijf de situatie.",
        allMissing: "Voltooi eerst alle vier de vragen.",
        downloadFirst: "Genereer eerst een scenario.",
        summaryState: "Invoeroverzicht",
        detailedScenario: "Gedetailleerd scenario",
        automation: "Automatiseringsstroom",
        facts: "Basis van het scenario",
        confirmed: "Bevestigde informatie",
        assumptions: "Notities",
        lenses: "Gebruik per rol",
        effects: "Verwachte impact",
        segment: "Aanbevolen doelgroep",
        guide: "Aan de slag",
        evaluation: "Beoordeling",
        why: "Waarom",
        comparison: "Vergelijking",
        note: "Opmerking",
        roleLens: "Rolweergave",
        executionPoints: "Uitvoeringspunten",
        summary: "Samenvatting",
        fit: "Passend",
        review: "Herzien",
        fitCheck: "Scenario-fit",
        availabilityCheck: "Beschikbaarheid apparaat",
        executionCheck: "Uitvoerbaarheid",
        clarityCheck: "Duidelijkheid boodschap",
        metricCheck: "Koppeling aan resultaat"
    },
    ar: {
        enterAgent: "دخول الوكيل",
        accessRequired: "يرجى إدخال رمز الوصول.",
        accessPlaceholder: "أدخل رمز الوصول",
        accessHelper: "يتم التحقق من رمز الوصول على الخادم، وعند اعتماده تنتقل مباشرة إلى الخطوة التالية.",
        guideTitle: "هل تعرف كيفية استخدام هذا الوكيل؟",
        guideQuick: "دليل سريع",
        guideLine1: "تظهر الأسئلة واحداً تلو الآخر.",
        guideLine2: "بعد كل إجابة تحصل على تلميح قصير يوجّه الخطوة التالية.",
        guideLine3: "بعد إكمال الخطوات الأربع يتم إنشاء سيناريو قابل للاستخدام فوراً.",
        startAfterGuide: "جيد. سنبدأ من Q1 خطوة بخطوة، مع تلميح قصير بعد كل إجابة لتوضيح الاتجاه التالي.",
        unlockedPlaceholder: "بعد هذا التحقق السريع ستبدأ من Q1.",
        stateMissing: "ستظهر اختياراتك الحالية هنا أثناء الإجابة.",
        checkPlaceholder: "سيظهر هنا فحص سريع للبنية بعد إنشاء السيناريو.",
        outputPlaceholder: "بعد الوصول والإجابة عن الأسئلة الأربعة سترى السيناريو المفصل والتطبيقات حسب الدور.",
        progress1: "Q1 الدور",
        progress2: "Q2 المنطقة",
        progress3: "Q3 المستخدم والسياق",
        progress4: "Q4 الجهاز",
        prev: "السابق",
        next: "التالي",
        build: "إنشاء السيناريو",
        downloadMarkdown: "تنزيل Markdown",
        downloadJson: "تنزيل JSON",
        printPdf: "طباعة / حفظ PDF",
        copySummary: "نسخ الملخص",
        current: "المدخل الحالي",
        check: "فحص البنية",
        output: "مخرجات السيناريو",
        roleQuestion: "Q1. من أي منظور مهني تريد بناء هذا السيناريو؟",
        countryQuestion: "Q2. لأي دولة هذا السيناريو؟",
        personaQuestion: "Q3. ما المستخدم والموقف اللذان تفكر فيهما؟",
        deviceQuestion: "Q4. ما الجهاز الذي يجب أن يكون محور السيناريو؟",
        purposePlaceholder: "مثال: ترغب أسرة ذات دخلين في بدء المساء بشكل أسرع وأكثر راحة بعد العودة إلى المنزل مع الطفل.",
        countryHelper: "قد تختلف الأجهزة المقترحة وزوايا السرد حسب السوق.",
        personaHelper: "أضف العمر ونمط الحياة والموسم والمشكلات المنزلية لجعل السيناريو أكثر إقناعاً.",
        deviceHelper: "اختيار فئة جهاز يجعل السيناريو أكثر مرونة وقابلية للتوسع.",
        roleMissing: "يرجى اختيار المنظور المهني أولاً في Q1.",
        countryMissing: "يرجى اختيار الدولة في Q2.",
        personaMissing: "في Q3، يرجى اختيار نوع المستخدم أو وصف الموقف.",
        allMissing: "يرجى إكمال الأسئلة الأربعة قبل إنشاء السيناريو.",
        downloadFirst: "يرجى إنشاء سيناريو أولاً.",
        summaryState: "ملخص الإدخال",
        detailedScenario: "السيناريو التفصيلي",
        automation: "تدفق الأتمتة",
        facts: "أساس السيناريو",
        confirmed: "معلومات مؤكدة",
        assumptions: "ملاحظات",
        lenses: "الاستخدام حسب الدور",
        effects: "الأثر المتوقع",
        segment: "الجمهور المقترح",
        guide: "البدء",
        evaluation: "التقييم",
        why: "لماذا",
        comparison: "المقارنة",
        note: "ملاحظة",
        roleLens: "منظور الدور",
        executionPoints: "نقاط التنفيذ",
        summary: "الملخص",
        fit: "مناسب",
        review: "يحتاج مراجعة",
        fitCheck: "ملاءمة السيناريو",
        availabilityCheck: "توفر الجهاز",
        executionCheck: "قابلية التنفيذ",
        clarityCheck: "وضوح الرسالة",
        metricCheck: "الارتباط بالنتيجة"
    }
};

const ACCESS_API = {
    verifyEndpoint: "/api/access/verify",
    sessionEndpoint: "/api/access/session",
    logoutEndpoint: "/api/access/logout"
};
const REGION_INSIGHT_API = "/api/region-insight";
const REGION_INSIGHT_CLIENT_TIMEOUT_MS = 12500;
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
const cityInput = document.getElementById("city");
const personaGroups = document.getElementById("persona-groups");
const segmentCustomInput = document.getElementById("segment-custom");
const deviceGrid = document.getElementById("device-grid");
const deviceCustomInput = document.getElementById("device-custom");
const exportActions = document.getElementById("export-actions");
const wizardLogoutBtn = document.getElementById("wizard-logout-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const generateBtn = document.getElementById("generate-btn");
const stepInsight = document.getElementById("step-insight");

let factPack = [];
let exploreMatrix = {};
let sourceData = {};
let countryTrends = {};
let citySignals = {};
let dotcomMapping = { markets: [] };
let latestPayload = null;
let activeLensTab = "overview";
let currentStep = 1;
let currentLocale = "ko";
let marketOptions = [];
let isUnlocking = false;
let isAccessCodeVisible = false;
let isAccessLocked = false;
let accessLockoutEndsAt = 0;
let accessLockoutTimerId = null;
let accessClientSessionId = "";
let latestStep2InsightRequest = 0;

document.addEventListener("DOMContentLoaded", () => {
    accessClientSessionId = ensureAccessClientSessionId();
    hydrateStaticUi();
    if (enforceServerOrigin()) return;
    loadReferenceData();
    bindEvents();
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
    guideContinueBtn.addEventListener("click", openWizard);
    prevBtn.addEventListener("click", () => moveStep(-1));
    nextBtn.addEventListener("click", () => moveStep(1));
    generateBtn.addEventListener("click", generateScenario);
    roleSelectionContainer?.addEventListener("click", handleRoleCardClick);
    roleSelectionContainer?.addEventListener("keydown", handleRoleCardKeydown);
    countrySelect.addEventListener("change", updateStatePreview);
    countrySelect.addEventListener("change", updateLocaleFromCountry);
    cityInput.addEventListener("input", () => {
        updateStatePreview();
        updateStepInsight();
    });
    personaGroups.addEventListener("change", (event) => {
        handleChecklistChange(event, personaGroups);
        updateStatePreview();
        updateStepInsight();
    });
    segmentCustomInput.addEventListener("input", () => {
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
    });
    deviceCustomInput.addEventListener("input", () => {
        updateStatePreview();
        updateStepInsight();
    });
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
        const [factPackRes, exploreMatrixRes, sourceDataRes, countryTrendsRes, citySignalsRes] = await Promise.all([
            fetch("references/fact_pack.json"),
            fetch("references/explore_matrix.json"),
            fetch("references/source_data.json"),
            fetch("references/country_trends.json"),
            fetch("references/city_signals.json")
        ]);

        factPack = await factPackRes.json();
        exploreMatrix = await exploreMatrixRes.json();
        sourceData = await sourceDataRes.json();
        countryTrends = await countryTrendsRes.json();
        citySignals = await citySignalsRes.json();

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

        populateInputs();
        updateLocaleFromCountry();
        updateRoleBrief();
        updateStatePreview();
    } catch (error) {
        resultDiv.innerHTML = `<p class="error">데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>`;
        console.error(error);
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
        const allSelected = group.options.every((option) => selected.has(option.id));
        return `
            <section class="tree-group" data-group-id="${group.id}">
                <label class="tree-parent">
                    <input type="checkbox" data-kind="${kind}" data-node-type="parent" data-group-id="${group.id}" ${allSelected ? "checked" : ""}>
                    <span class="tree-parent-title">${escapeHtml(group.title)}</span>
                </label>
                <div class="tree-children">
                    ${group.options.map((option) => `
                        <label class="tree-child">
                            <input
                                type="checkbox"
                                value="${option.id}"
                                data-kind="${kind}"
                                data-node-type="child"
                                data-group-id="${group.id}"
                                data-label="${escapeHtml(option.label)}"
                                ${option.normalized ? `data-normalized="${escapeHtml(option.normalized)}"` : ""}
                                ${selected.has(option.id) ? "checked" : ""}
                            >
                            <span>${escapeHtml(option.label)}</span>
                        </label>
                    `).join("")}
                </div>
            </section>
        `;
    }).join("");
}

function handleChecklistChange(event, container) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;

    const groupId = target.dataset.groupId;
    if (!groupId) return;

    const group = container.querySelector(`.tree-group[data-group-id="${groupId}"]`);
    if (!group) return;

    const parent = group.querySelector('input[data-node-type="parent"]');
    const children = [...group.querySelectorAll('input[data-node-type="child"]')];

    if (target.dataset.nodeType === "parent") {
        children.forEach((child) => {
            child.checked = target.checked;
        });
    }

    syncChecklistParent(group, parent, children);
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
    const previousCity = preserved.city || cityInput.value;
    const previousPersonaSelections = preserved.personaSelections || getSelectedPersonaOptionIds();
    const previousSegmentCustom = preserved.segmentCustom || segmentCustomInput.value;
    const previousDeviceSelections = preserved.deviceSelections || getSelectedDeviceOptionIds();
    const previousDeviceCustom = preserved.deviceCustom || deviceCustomInput.value;

    marketOptions = buildMarketOptions();
    countrySelect.innerHTML = marketOptions.map((market) => (
        `<option value="${market.siteCode}">${market.label}</option>`
    )).join("");
    personaGroups.innerHTML = renderChecklistGroups(PERSONA_CATEGORY_GROUPS, previousPersonaSelections, "persona");
    deviceGrid.innerHTML = renderChecklistGroups(DEVICE_CATEGORY_GROUPS, previousDeviceSelections, "device");

    if (previousRole) {
        setRoleSelection(previousRole);
    } else {
        clearRoleSelection();
    }
    if (previousCountry && marketOptions.some((market) => market.siteCode === previousCountry)) countrySelect.value = previousCountry;
    if (previousCity) cityInput.value = previousCity;
    if (previousSegmentCustom) segmentCustomInput.value = previousSegmentCustom;
    if (previousDeviceCustom) deviceCustomInput.value = previousDeviceCustom;
    syncAllChecklistParents(personaGroups);
    syncAllChecklistParents(deviceGrid);
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
    guideScreen.classList.add("hidden");
    wizardScreen.classList.remove("hidden");
    currentStep = 1;
    syncWizardUi();
    renderOutputPreview();
    const selectedCard = roleSelectionContainer?.querySelector(".role-card.selected");
    const focusTarget = selectedCard || roleCards[0];
    focusTarget?.focus();
    wizardScreen.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showGuideCopy() {
    setGuideChoice("no");
    guideCopy.innerHTML = buildGuideMarkup();
    guideCopy.classList.remove("hidden");
    guideContinueBtn.classList.remove("hidden");
    guideCopy.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setGuideChoice(choice) {
    guideYesBtn.classList.toggle("active", choice === "yes");
    guideNoBtn.classList.toggle("active", choice === "no");
}

function buildGuideMarkup() {
    if (currentLocale === "ko") {
        return `
            <div class="guide-hero">
                <span class="guide-kicker">Scenario Guide</span>
                <h3>4단계 입력만으로<br>완성도 높은 시나리오를 만듭니다</h3>
                <p class="guide-lead">핵심만 빠르게 선택하고, 필요한 정보만 더해 바로 검토할 수 있는 결과로 정리합니다.</p>
            </div>
            <div class="guide-grid">
                <section class="guide-panel">
                    <p class="guide-index">01 Inputs</p>
                    <h4>먼저 기준이 되는 4가지를 정합니다</h4>
                    <div class="guide-stack">
                        <div class="guide-item"><strong>Q1 담당업무</strong><span>리테일, 닷컴 캠페인, 브랜드 마케팅 중 관점을 고릅니다.</span></div>
                        <div class="guide-item"><strong>Q2 국가·지역</strong><span>대상 국가와 도시 또는 주를 함께 정합니다.</span></div>
                        <div class="guide-item"><strong>Q3 타겟 고객</strong><span>가구 특성, 시즌, 생활 맥락을 짧게 적습니다.</span></div>
                        <div class="guide-item"><strong>Q4 기기·환경</strong><span>핵심 기기 조합과 실제 제약 조건을 선택합니다.</span></div>
                    </div>
                </section>
                <section class="guide-panel">
                    <p class="guide-index">02 Flow</p>
                    <h4>입력은 간결하게, 결과는 더 선명하게</h4>
                    <div class="guide-stack">
                        <div class="guide-item"><strong>Step by step</strong><span>질문은 한 번에 하나씩 열려 흐름이 명확합니다.</span></div>
                        <div class="guide-item"><strong>Lean follow-up</strong><span>필요할 때만 추가 확인 포인트를 최소로 더합니다.</span></div>
                        <div class="guide-item"><strong>Clear output</strong><span>불확실한 내용은 assumption으로 분리해 결과의 완성도를 유지합니다.</span></div>
                    </div>
                </section>
            </div>
            <div class="guide-footer">
                <p class="guide-note">가이드를 확인했다면 아래 Start로 바로 Q1부터 시작하세요. 짧은 입력만으로도 검토와 공유에 바로 쓸 수 있는 결과를 만듭니다.</p>
            </div>
        `;
    }

    return `
        <div class="guide-hero">
            <span class="guide-kicker">Scenario Guide</span>
            <h3>Build a usable scenario<br>from four guided inputs</h3>
            <p class="guide-lead">Pick the essentials first. The agent turns them into a sharper, review-ready scenario.</p>
        </div>
        <div class="guide-grid">
            <section class="guide-panel">
                <p class="guide-index">01 Inputs</p>
                <h4>What you set first</h4>
                <div class="guide-stack">
                    <div class="guide-item"><strong>Q1 Work Lens</strong><span>Retail, Dotcom Campaign, or Brand Marketing</span></div>
                    <div class="guide-item"><strong>Q2 Country & Region</strong><span>Target market plus city, state, or region</span></div>
                    <div class="guide-item"><strong>Q3 Target Customer</strong><span>Household type, season, and real-life context</span></div>
                    <div class="guide-item"><strong>Q4 Devices & Environment</strong><span>Core device mix and practical constraints</span></div>
                </div>
            </section>
            <section class="guide-panel">
                <p class="guide-index">02 Flow</p>
                <h4>Simple input, clearer output</h4>
                <div class="guide-stack">
                    <div class="guide-item"><strong>Step by step</strong><span>One question opens at a time.</span></div>
                    <div class="guide-item"><strong>Lean follow-up</strong><span>Extra checks appear only when needed.</span></div>
                    <div class="guide-item"><strong>Clear output</strong><span>Assumptions stay separated for faster review.</span></div>
                </div>
            </section>
        </div>
        <div class="guide-footer">
            <p class="guide-note">If this is clear, press Start below and move into Q1. Keep the input short and the output ready to review.</p>
        </div>
    `;
}

function showGuideScreen() {
    clearAccessLockout();
    clearAccessStatus();
    setGuideChoice("");
    accessScreen.classList.add("hidden");
    guideScreen.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
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
    guideCopy.classList.add("hidden");
    guideContinueBtn.classList.add("hidden");
    setGuideChoice("");
    accessScreen.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    guideCopy.innerHTML = "";
    currentStep = 1;
    latestPayload = null;
    clearRoleSelection();
    if (marketOptions[0]) countrySelect.value = marketOptions[0].siteCode;
    cityInput.value = "";
    personaGroups.querySelectorAll('input[type="checkbox"]').forEach((input) => {
        input.checked = false;
    });
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
    const steps = [t("progress1"), t("progress2"), t("progress3"), t("progress4")];
    document.getElementById("wizard-progress").innerHTML = steps.map((label, index) => {
        const step = index + 1;
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

function buildInsightMarkup(insight) {
    const badge = insight.badge ? `<span class="insight-badge">${escapeHtml(insight.badge)}</span>` : "";
    const summary = insight.summary ? `<p class="insight-summary">${escapeHtml(insight.summary)}</p>` : "";
    const body = insight.body ? `<p class="insight-body">${escapeHtml(insight.body)}</p>` : "";
    const spotlight = insight.spotlight ? `<p class="insight-spotlight">${escapeHtml(insight.spotlight)}</p>` : "";
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
    const sections = Array.isArray(insight.sections) && insight.sections.length
        ? `<div class="insight-sections">${insight.sections.map((section) => {
            const text = section.text ? `<p>${escapeHtml(section.text)}</p>` : "";
            const items = Array.isArray(section.items) && section.items.length
                ? `<ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
                : "";
            return `
                <section class="insight-section">
                    <h4>${escapeHtml(section.title || "")}</h4>
                    ${text}
                    ${items}
                </section>
            `;
        }).join("")}</div>`
        : "";
    const evidence = Array.isArray(insight.evidence) && insight.evidence.length
        ? `<div class="insight-evidence">${insight.evidence.map((item) => `
            <span class="insight-evidence-chip" title="${escapeHtml(item.snippet || "")}">
                ${escapeHtml(`${item.source_domain} · ${item.collected_at_utc || ""} · ${item.confidence || ""}`)}
            </span>
        `).join("")}</div>`
        : "";
    const action = insight.retry
        ? `<button type="button" id="region-insight-retry" class="secondary-btn insight-retry-btn">${escapeHtml(insight.retryLabel || "Retry")}</button>`
        : "";

    return `
        <div class="insight-head">
            ${badge}
            <strong>${escapeHtml(insight.title)}</strong>
        </div>
        ${summary}
        ${body}
        ${spotlight}
        ${chips}
        ${sections}
        <div class="insight-grid">${rows}</div>
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
                    ? "Q2에서 국가와 도시를 구체화해 이 관점이 가장 잘 먹히는 장면을 좁혀보세요."
                    : currentLocale === "de"
                        ? "Präzisieren Sie in Q2 Land und Region, damit der stärkste Nutzungsmoment klarer wird."
                        : "Use Q2 to narrow the country and city so the strongest usage moment becomes clearer."
            }
        ]
    };
}

function buildStep2Insight() {
    return {
        badge: currentLocale === "ko" ? "Q2 Region" : "Q2 Region",
        title: currentLocale === "ko" ? "지역 인사이트를 준비하고 있습니다" : "Preparing live regional insight",
        summary: currentLocale === "ko"
            ? "국가와 도시를 기반으로 실시간 외부 데이터를 수집하는 중입니다."
            : "Collecting live external signals based on the selected country and city.",
        body: currentLocale === "ko"
            ? "잠시만 기다려 주세요. 시장/도시 신호를 결합해 카드가 곧 갱신됩니다."
            : "Please wait. The card will update after market and local signals are aggregated."
    };
}

async function renderStep2Insight(forceRefresh = false) {
    stepInsight.classList.remove("hidden");
    const selectedMarket = marketOptions.find((market) => market.siteCode === countrySelect.value);
    if (!selectedMarket) {
        stepInsight.innerHTML = buildInsightMarkup(STEP_INSIGHTS[2]);
        return;
    }

    const requestId = ++latestStep2InsightRequest;
    stepInsight.innerHTML = buildInsightMarkup(buildStep2Insight());
    updateQuestionHelpers();

    const country = resolveCountry(selectedMarket);
    const city = cityInput.value.trim();
    const role = normalizeRoleId(roleSelect.value);
    const insight = await fetchLiveStep2Insight(country.countryCode, city, role, forceRefresh);
    if (requestId !== latestStep2InsightRequest || currentStep !== 2) return;

    stepInsight.innerHTML = buildInsightMarkup(insight);
    const retryBtn = document.getElementById("region-insight-retry");
    if (retryBtn) {
        retryBtn.addEventListener("click", () => {
            renderStep2Insight(true);
        });
    }

    stepInsight.classList.remove("insight-refresh");
    void stepInsight.offsetWidth;
    stepInsight.classList.add("insight-refresh");
}

async function fetchLiveStep2Insight(countryCode, city, role, forceRefresh = false) {
    const params = new URLSearchParams({
        country: countryCode,
        city,
        locale: currentLocale
    });
    if (role) {
        params.set("role", role);
    }
    if (forceRefresh) {
        params.set("force", "1");
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REGION_INSIGHT_CLIENT_TIMEOUT_MS);

    try {
        const response = await fetch(`${REGION_INSIGHT_API}?${params.toString()}`, {
            method: "GET",
            credentials: "include",
            signal: controller.signal
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.ok || !payload?.data) {
            const message = payload?.error?.message || (currentLocale === "ko"
                ? "실시간 지역 인사이트를 불러오지 못했습니다."
                : "Failed to load live regional insight.");
            return buildStep2ErrorInsight(message);
        }
        return mapLiveStep2Insight(payload.data, countryCode, city);
    } catch {
        const timeoutMessage = currentLocale === "ko"
            ? "실시간 지역 인사이트 요청이 시간 제한(12초)을 초과했습니다."
            : "Live regional insight timed out after 12 seconds.";
        return buildStep2ErrorInsight(timeoutMessage);
    } finally {
        clearTimeout(timer);
    }
}

function mapLiveStep2Insight(data, countryCode, city) {
    const selectedRoleId = normalizeRoleId(data.role || roleSelect.value);
    const roleLens = data.role_lens || {};
    const roleTitle = selectedRoleId ? getRoleTitle(selectedRoleId) : (currentLocale === "ko" ? "마케터" : "Marketer");
    const marketLabel = city ? `${getCountryName(countryCode)} ${city}` : getCountryName(countryCode);
    const macro = data.macro || {};
    const local = data.local || null;
    const evidence = [];
    const countryName = getCountryName(countryCode);
    const mustKnow = toList(roleLens.must_know).slice(0, 3);
    const executionPoints = toList(roleLens.execution_points).slice(0, 3);
    const roleMetric = roleLens.primary_metric || "";
    const countrySignal = toList(macro.market_traits).filter((item) => !/n\/a/i.test(String(item))).slice(0, 2);
    const localSignal = local
        ? [local.demographic, local.lifestyle].filter(Boolean).slice(0, 2)
        : [];

    const sections = [];
    if (mustKnow.length) {
        sections.push({
            title: currentLocale === "ko"
                ? `${roleTitle}가 ${countryName}${city ? ` ${city}` : ""}에서 먼저 알아야 할 것`
                : `What ${roleTitle} should know first in ${countryName}${city ? ` ${city}` : ""}`,
            items: mustKnow
        });
    }
    if (executionPoints.length) {
        sections.push({
            title: currentLocale === "ko" ? "바로 실행할 포인트" : "Execution points to use now",
            items: executionPoints
        });
    }
    if (countrySignal.length || localSignal.length) {
        sections.push({
            title: currentLocale === "ko" ? "시장 신호 요약" : "Market signal snapshot",
            items: [...countrySignal, ...localSignal].slice(0, 3)
        });
    } else {
        sections.push({
            title: currentLocale === "ko" ? "다음 단계 (정밀도 올리기)" : "Next step (increase precision)",
            text: macro.next_step_prompt || (currentLocale === "ko"
                ? "도시를 입력하면 실무 적용 포인트를 더 구체화할 수 있습니다."
                : "Add a city to make the recommendations more actionable.")
        });
    }

    const rows = [
        {
            label: currentLocale === "ko" ? "이번 역할의 핵심 KPI" : "Primary KPI for this role",
            value: roleMetric || (currentLocale === "ko" ? "Q3에서 목표 KPI를 한 줄로 고정해 주세요." : "Lock one KPI line in Q3.")
        }
    ];

    rows.push({
        label: currentLocale === "ko" ? "Q3에서 바로 넣을 문장" : "Line to lock in Q3",
        value: roleLens.next_step || (currentLocale === "ko"
            ? "타겟(누가) + 상황(언제/어디서) + 목표 KPI를 한 줄로 고정해 주세요."
            : "Lock target (who) + context (when/where) + one KPI in one line.")
    });

    return {
        badge: currentLocale === "ko" ? "Q2 Live Region" : "Q2 Live Region",
        title: currentLocale === "ko"
            ? `${roleTitle} 관점의 ${marketLabel} 실무 인사이트`
            : `${marketLabel} insight for ${roleTitle}`,
        summary: currentLocale === "ko"
            ? "해당 직무가 실제로 의사결정할 때 필요한 정보만 추려서 보여줍니다."
            : "This card only surfaces what this role needs to decide and execute.",
        body: roleLens.why_this_matters || toList(macro.opportunity_factors)[0] || (currentLocale === "ko"
            ? "국가와 도시 신호를 결합해 메시지 우선순위를 정리했습니다."
            : "Country and city signals were combined to prioritize the message."),
        spotlight: currentLocale === "ko"
            ? `${roleTitle}에게 중요한 것은 기능 설명보다 "바로 실행할 메시지와 KPI"입니다.`
            : `For ${roleTitle}, execution-ready messaging and KPI matter more than feature description.`,
        chips: [
            marketLabel,
            roleTitle,
            ...(local?.archetype ? [local.archetype] : [])
        ],
        sections,
        rows,
        evidence
    };
}

function buildStep2ErrorInsight(message) {
    return {
        badge: currentLocale === "ko" ? "Q2 Live Error" : "Q2 Live Error",
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

function buildStep3Insight() {
    const selectedSegment = getSelectedSegment();
    const purpose = purposeInput.value.trim();
    const city = cityInput.value.trim();

    if (!selectedSegment && !purpose) {
        return STEP_INSIGHTS[3];
    }

    const traits = inferSegmentTraits(selectedSegment, purpose);
    const place = city ? `${city} 생활권` : "이 타겟";
    const featureText = traits.slice(0, 2).join(", ");
    const direction = inferScenarioDirection(traits, purpose);
    const personaCount = getSelectedPersonaLabels().length;
    const selectedLabels = getSelectedPersonaLabels();
    const primaryPersona = selectedLabels[0] || (currentLocale === "ko" ? "타겟 탐색 중" : currentLocale === "de" ? "Zielgruppe in Arbeit" : "Audience forming");

    return {
        badge: currentLocale === "ko" ? "Q3 Audience" : currentLocale === "de" ? "Q3 Zielgruppe" : "Q3 Audience",
        title: currentLocale === "ko" ? `지금 타겟 해석은 ${personaCount || 1}개 축으로 모이고 있습니다` : currentLocale === "de" ? `Die Zielgruppe verdichtet sich jetzt über ${personaCount || 1} Achsen` : `The target is now clustering around ${personaCount || 1} signal layers`,
        summary: currentLocale === "ko"
            ? "타겟 조합이 결과 문장의 톤과 문제 정의를 직접 바꾸기 시작했습니다."
            : currentLocale === "de"
                ? "Die Zielgruppen-Kombination verändert jetzt direkt Ton und Problemdefinition des Ergebnisses."
                : "The audience mix is now directly changing the tone and problem definition of the output.",
        body: currentLocale === "ko"
            ? `${place}의 ${selectedSegment || "사용자"}는 ${featureText} 특징이 강하게 보입니다. ${purpose ? "입력한 상황 설명까지 붙어서" : "여기에 상황 설명까지 더하면"} 시나리오는 ${direction} 쪽으로 훨씬 선명해집니다.`
            : currentLocale === "de"
                ? `Für ${selectedSegment || "die Zielgruppe"} in ${place} zeigen sich vor allem ${featureText}. ${purpose ? "Mit Ihrer Situationsbeschreibung" : "Mit einer ergänzten Situationsbeschreibung"} kann das Szenario noch klarer in Richtung ${direction} geführt werden.`
                : `The ${selectedSegment || "target"} in ${place} is showing strong signals of ${featureText}. ${purpose ? "With the context you already added," : "If you add one more concrete context line,"} the scenario can lean much more clearly toward ${direction}.`,
        spotlight: currentLocale === "ko"
            ? purpose ? "이 단계부터는 같은 시장이어도 누구를 위해 쓰는지에 따라 결과 톤이 크게 달라집니다." : "아직은 타겟 뼈대만 잡힌 상태입니다. 상황 한 줄이 들어오면 카드 성격이 훨씬 달라집니다."
            : currentLocale === "de"
                ? purpose ? "Ab hier verändert sich der Ergebniston stark je nachdem, für wen die Geschichte geschrieben wird." : "Aktuell steht vor allem das Zielgruppen-Grundgerüst. Eine konkrete Situation verändert den Charakter der Karte deutlich."
                : purpose ? "From here, the output tone changes sharply depending on who the scenario is for." : "Right now the audience skeleton is there, but one concrete context line will change the card character a lot.",
        chips: selectedLabels.slice(0, 4).length ? selectedLabels.slice(0, 4) : [primaryPersona],
        rows: [
            {
                label: currentLocale === "ko" ? "핵심 타겟 축" : currentLocale === "de" ? "Zielgruppenachse" : "Audience axis",
                value: primaryPersona
            },
            {
                label: currentLocale === "ko" ? "지금 읽히는 특징" : currentLocale === "de" ? "Aktuelle Lesart" : "Current read",
                value: featureText || (currentLocale === "ko" ? "핵심 신호 수집 중" : currentLocale === "de" ? "Signale werden gesammelt" : "signals gathering")
            },
            {
                label: currentLocale === "ko" ? "서사 방향" : currentLocale === "de" ? "Erzählrichtung" : "Narrative direction",
                value: direction
            },
            {
                label: currentLocale === "ko" ? "지금 필요한 입력" : currentLocale === "de" ? "Jetzt fehlt noch" : "Missing input",
                value: purpose
                    ? (currentLocale === "ko" ? "Q4에서 기기 조합을 줄이거나 넓혀 이 타겟에 맞는 첫 장면을 고정해 보세요." : currentLocale === "de" ? "Fixieren Sie in Q4 den ersten Moment über die passende Gerätekombination." : "Use Q4 to lock the first scene with the right device mix.")
                    : (currentLocale === "ko" ? "집에 들어오는 순간, 반복되는 불편, 계절 변수 중 하나만 적어보세요." : currentLocale === "de" ? "Ergänzen Sie Heimkehr, wiederkehrende Reibung oder einen saisonalen Auslöser." : "Add arrival home, recurring friction, or a seasonal trigger.")
            }
        ]
    };
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

    const comboText = devices.slice(0, 3).join(", ");
    const firstScene = inferFirstUseScene(normalizedDevices);
    const deviceCount = devices.length;
    const mixRead = deviceCount >= 4
        ? (currentLocale === "ko" ? "확장형 멀티디바이스 조합" : currentLocale === "de" ? "erweiterte Multi-Device-Kombination" : "expanded multi-device mix")
        : deviceCount === 3
            ? (currentLocale === "ko" ? "균형 잡힌 핵심 조합" : currentLocale === "de" ? "ausgewogene Kernkombination" : "balanced core mix")
            : deviceCount === 2
                ? (currentLocale === "ko" ? "명확한 2기기 페어링" : currentLocale === "de" ? "klare Zwei-Geräte-Kombination" : "clear two-device pairing")
                : (currentLocale === "ko" ? "단일 앵커 기기 중심" : currentLocale === "de" ? "einzelnes Ankergerät" : "single anchor device");
    return {
        badge: currentLocale === "ko" ? "Q4 Devices" : currentLocale === "de" ? "Q4 Geräte" : "Q4 Devices",
        title: currentLocale === "ko" ? `${deviceCount}개 기기 조합으로 첫 장면이 구체화되고 있습니다` : currentLocale === "de" ? `Mit ${deviceCount} Geräten wird der erste Moment konkreter` : `The first-use moment is becoming more concrete with ${deviceCount} devices`,
        summary: currentLocale === "ko"
            ? "이 단계에서는 기능 나열보다 어떤 생활 컷으로 시작할지가 거의 결정됩니다."
            : currentLocale === "de"
                ? "In diesem Schritt entscheidet sich fast schon, mit welchem Alltagsmoment das Szenario startet."
                : "At this stage, the opening life moment is becoming more defined than the feature list itself.",
        body: currentLocale === "ko"
            ? `${comboText} 조합이면 단일 기능 설명보다 연결된 생활 장면으로 설계하는 편이 좋습니다. 지금은 ${firstScene} 같은 시작 컷이 자연스럽고, 여기서 한 번 더 줄이거나 보태면 결과 톤도 바로 달라집니다.`
            : currentLocale === "de"
                ? `Mit ${comboText} wirkt ein verbundener Alltagsmoment stärker als eine isolierte Funktionsbeschreibung. Ein Einstieg wie ${firstScene} passt jetzt gut, und schon ein Gerät mehr oder weniger verändert den Ton des Ergebnisses deutlich.`
                : `With ${comboText}, a connected life moment is stronger than a single-feature explanation. A starting scene like ${firstScene} fits well here, and even one device more or less will noticeably change the output tone.`,
        spotlight: currentLocale === "ko"
            ? "기기 수와 조합 방식에 따라 결과는 기능 소개형, 루틴 제안형, 통합 장면형으로 완전히 달라집니다."
            : currentLocale === "de"
                ? "Geräteanzahl und Kombinationsart verändern das Ergebnis deutlich: Funktionsfokus, Routinenvorschlag oder integrierte Szene."
                : "The number and type of devices change the output a lot: feature-led, routine-led, or fully integrated scene-led.",
        chips: devices.slice(0, 5),
        rows: [
            {
                label: currentLocale === "ko" ? "조합 성격" : currentLocale === "de" ? "Mix-Typ" : "Mix profile",
                value: mixRead
            },
            {
                label: currentLocale === "ko" ? "추천 시작 장면" : currentLocale === "de" ? "Empfohlener Startmoment" : "Best opening scene",
                value: firstScene.replace(/^"|"$/g, "")
            },
            {
                label: currentLocale === "ko" ? "메시지 톤 변화" : currentLocale === "de" ? "Tonverschiebung" : "Tone shift",
                value: currentLocale === "ko"
                    ? deviceCount >= 4 ? "통합 시나리오형으로 읽힙니다." : deviceCount >= 2 ? "연결된 생활 장면형으로 읽힙니다." : "핵심 기기 가치 제안형으로 읽힙니다."
                    : currentLocale === "de"
                        ? deviceCount >= 4 ? "Es liest sich wie ein integriertes Szenario." : deviceCount >= 2 ? "Es liest sich wie ein verbundener Alltagsmoment." : "Es liest sich wie ein fokussiertes Geräte-Nutzenversprechen."
                        : deviceCount >= 4 ? "This reads like an integrated scenario." : deviceCount >= 2 ? "This reads like a connected life moment." : "This reads like a focused anchor-device value story."
            },
            {
                label: currentLocale === "ko" ? "빌드 전 마지막 체크" : currentLocale === "de" ? "Letzter Check vor dem Build" : "Final check before build",
                value: currentLocale === "ko"
                    ? "이 조합이 맞으면 Scenario Build로 넘어가고, 아니면 기기 1개만 더 줄여 메시지를 또렷하게 만들어 보세요."
                    : currentLocale === "de"
                        ? "Wenn die Mischung passt, gehen Sie zu Scenario Build. Falls nicht, nehmen Sie ein Gerät heraus und schärfen Sie die Botschaft."
                        : "If this mix feels right, move to Scenario Build. If not, remove one device to sharpen the message."
            }
        ]
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
    const selectedMarket = marketOptions.find((market) => market.siteCode === countrySelect.value);
    const city = cityInput.value.trim();
    if (!selectedMarket) return t("countryHelper");

    const country = resolveCountry(selectedMarket);
    const label = getCountryName(country.countryCode);
    const location = city ? `${label} ${city}` : label;
    const direction = inferRegionalDirection(country.countryCode);
    const trend = getCountryTrend(country.countryCode);
    const citySignal = getCitySignal(country.countryCode, city);

    if (currentLocale === "ko") {
        if (citySignal) {
            return `${location} 기준으로는 ${trend?.headline || direction} 흐름이 유리하고, ${citySignal.climate}와 ${citySignal.behavior} 맥락까지 반영해 장면을 더 구체화합니다.`;
        }
        return `${location} 기준으로는 ${trend?.headline || direction} 흐름이 유리합니다. 도시나 주를 더 구체화하면 지역성, 기후, 생활 리듬까지 추가로 읽힙니다.`;
    }
    if (currentLocale === "de") {
        if (citySignal) {
            return `Für ${location} wirkt eher ${trend?.headline || direction}. Zusätzlich werden ${citySignal.climate} und ${citySignal.behavior} in die Lesart einbezogen.`;
        }
        return `Für ${location} wirkt eher ${trend?.headline || direction}. Wenn Sie Stadt oder Region ergänzen, kommen lokale Eigenheiten, Klima und Lebensrhythmus dazu.`;
    }
    if (citySignal) {
        return `For ${location}, ${trend?.headline || direction} is more likely to resonate. The read now also folds in ${citySignal.climate} and ${citySignal.behavior}.`;
    }
    return `For ${location}, ${trend?.headline || direction} is more likely to resonate. Add a city or region and the card will extend into local traits, climate, and daily behavior.`;
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
    const text = `${selectedSegment} ${purpose}`.toLowerCase();
    const traits = [];

    if (text.includes("맞벌이") || text.includes("퇴근")) traits.push(currentLocale === "ko" ? "시간 가치 민감" : "time-value sensitivity");
    if (text.includes("아이") || text.includes("육아") || text.includes("가족")) traits.push(currentLocale === "ko" ? "가구 운영 복잡도 높음" : "high household complexity");
    if (text.includes("부모") || text.includes("시니어") || text.includes("돌봄")) traits.push(currentLocale === "ko" ? "케어/안심 니즈 큼" : "strong care and reassurance needs");
    if (text.includes("에너지") || text.includes("생활비") || text.includes("절감") || text.includes("비용")) traits.push(currentLocale === "ko" ? "지출 민감도 높음" : "high spending sensitivity");
    if (text.includes("주말") || text.includes("여가") || text.includes("웰니스")) traits.push(currentLocale === "ko" ? "여가 시간 품질 중시" : "high value on leisure quality");
    if (text.includes("펫") || text.includes("반려")) traits.push(currentLocale === "ko" ? "원격 확인 수요 존재" : "remote check-in demand");

    if (traits.length === 0) {
        traits.push(currentLocale === "ko" ? "즉시 체감 가치 선호" : "preference for immediate value");
        traits.push(currentLocale === "ko" ? "설정 피로도 낮추기 중요" : "importance of reducing setup fatigue");
    }

    return traits;
}

function inferScenarioDirection(traits, purpose) {
    const text = `${traits.join(" ")} ${purpose}`.toLowerCase();
    if (text.includes("케어") || text.includes("안심")) {
        return currentLocale === "ko" ? "돌봄 부담 완화와 안심 강화" : "reduced care burden and stronger reassurance";
    }
    if (text.includes("에너지") || text.includes("지출") || text.includes("비용")) {
        return currentLocale === "ko" ? "절감 효과를 눈에 보이게 보여주는 방향" : "visible savings and cost-control value";
    }
    if (text.includes("여가") || text.includes("웰니스")) {
        return currentLocale === "ko" ? "주말과 저녁의 여유를 회복하는 방향" : "recovering weekend and evening ease";
    }
    return currentLocale === "ko" ? "복잡한 집안 루틴을 가볍게 만드는 방향" : "making complex home routines feel lighter";
}

function syncWizardUi() {
    document.querySelectorAll(".wizard-step").forEach((panel) => {
        panel.classList.toggle("active", Number(panel.dataset.step) === currentStep);
    });
    prevBtn.disabled = currentStep === 1;
    nextBtn.classList.toggle("hidden", currentStep === 4);
    generateBtn.classList.toggle("hidden", currentStep !== 4);
    renderWizardProgress();
    updateStepInsight();
}

function moveStep(delta) {
    if (delta > 0 && !validateCurrentStep()) return;
    currentStep = Math.min(4, Math.max(1, currentStep + delta));
    syncWizardUi();
}

function validateCurrentStep() {
    if (currentStep === 1 && !roleSelect.value) {
        resultDiv.innerHTML = `<p class="error">${t("roleMissing")}</p>`;
        return false;
    }
    if (currentStep === 2 && !countrySelect.value) {
        resultDiv.innerHTML = `<p class="error">${t("countryMissing")}</p>`;
        return false;
    }
    if (currentStep === 3 && (!getSelectedSegment() && !purposeInput.value.trim())) {
        resultDiv.innerHTML = `<p class="error">${t("personaMissing")}</p>`;
        return false;
    }
    if (currentStep === 4 && getSelectedDevices().length === 0) {
        resultDiv.innerHTML = `<p class="error">${currentLocale === "ko" ? "Q4에서 기기를 하나 이상 선택해 주세요." : "Please select at least one device in Q4."}</p>`;
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

function inferMissionBucket(purpose) {
    const text = purpose.toLowerCase();
    if (text.includes("에너지") || text.includes("절약") || text.includes("비용")) return "Save";
    if (text.includes("안전") || text.includes("보안") || text.includes("secure")) return "Secure";
    if (text.includes("놀이") || text.includes("운동") || text.includes("엔터")) return "Play";
    if (text.includes("가족") || text.includes("돌봄") || text.includes("반려")) return "Care";
    return "Discover";
}

function generateScenario() {
    if (!validateCurrentStep()) return;

    const role = ROLE_LENSES.find((item) => item.id === roleSelect.value);
    const rawPurpose = purposeInput.value.trim();
    const selectedMarket = marketOptions.find((market) => market.siteCode === countrySelect.value);
    const country = resolveCountry(selectedMarket);
    const city = cityInput.value.trim();
    const rawSelectedSegment = getSelectedSegment();
    const purpose = rawPurpose || buildFallbackPurpose(rawSelectedSegment);
    const selectedSegment = rawSelectedSegment || buildFallbackSegment(rawPurpose);
    const selectedDevices = getSelectedDevices();
    const selectedDeviceLabels = getSelectedDeviceLabels();

    if (!role || !country || (!purpose && !selectedSegment) || selectedDevices.length === 0) {
        resultDiv.innerHTML = `<p class="error">${t("allMissing")}</p>`;
        return;
    }

    const intent = analyzeIntent(purpose, selectedSegment, selectedDevices);
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
    const marketingMessages = buildMarketingMessages(role, selectedSegment, intent, services, exploreGrounding);
    const benefits = buildBenefits(intent, services, exploreGrounding);
    const segmentAnalysis = buildSegmentAnalysis(country, city, selectedSegment, intent, exploreGrounding);
    const campaignTiming = buildCampaignTiming(intent, exploreGrounding);
    const deviceGuide = buildDeviceGuide(country, deviceDecision, services);

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
        state: {
            role: getRoleTitle(role.id),
            market: selectedMarket?.label || "",
            city,
            segment: selectedSegment,
            devices: selectedDeviceLabels.length > 0 ? selectedDeviceLabels : selectedDevices.map((device) => getCategoryName(device))
        }
    };

    activeLensTab = "overview";
    renderScenario(latestPayload);
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

function analyzeIntent(purpose, selectedSegment, selectedDevices = []) {
    const tags = new Set();
    const text = `${purpose} ${selectedSegment}`.toLowerCase();
    const normalizedDevices = selectedDevices.map((device) => getCategoryName(device).toLowerCase());

    exploreMatrix.lifestyleTags.forEach((tag) => {
        const needle = tag.tagName.toLowerCase().replace(/\s+/g, "");
        if (text.replace(/\s+/g, "").includes(needle)) tags.add(tag.tagName);
    });

    if (text.includes("반려") || text.includes("펫")) tags.add("반려동물 케어");
    if (text.includes("부모") || text.includes("시니어") || text.includes("가족")) tags.add("시니어 케어");
    if (text.includes("에너지") || text.includes("절약") || text.includes("비용")) tags.add("에너지 절약");
    if (selectedDevices.includes("TV")) tags.add("AOD (Always on Display)");
    if (tags.size === 0) tags.add("입문 (Entry)");

    return {
        missionBucket: inferMissionBucket(purpose),
        purpose,
        selectedSegment,
        selectedDevices,
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

function buildFacts(country, city, selectedSegment, deviceDecision, services, exploreGrounding) {
    return {
        facts: [
            localizeSentence("factsCountry", city ? `${getCountryName(country.countryCode)} / ${city}` : getCountryName(country.countryCode)),
            localizeSentence("factsDevice", `${(deviceDecision.selectedDevices || [deviceDecision.final.category]).map((device) => getCategoryName(device)).join(", ")} / ${deviceDecision.final.modelName}`),
            localizeSentence("factsService", getServiceLabel(services[0])),
            localizeSentence("factsNote", `${selectedSegment} / ${deviceDecision.note}`),
            currentLocale === "ko" ? `Explore 태그 근거: ${exploreGrounding.exploreTagSummary}` : `Explore tag grounding: ${exploreGrounding.exploreTagSummary}`
        ],
        assumptions: [
            deviceDecision.fallbackApplied ? localizeSentence("assumptionFallback") : localizeSentence("assumptionExact"),
            localizeSentence("assumptionGeneral"),
            currentLocale === "ko" ? `가정: ${exploreGrounding.functionalJob}이 이 타겟의 반복 문제로 작동합니다.` : `Assumption: ${exploreGrounding.functionalJob} is a repeated problem for this segment.`
        ],
        dependencies: [
            currentLocale === "ko"
                ? `${getServiceLabel(services[0])}가 해당 시장 앱 플로우에서 노출 가능해야 합니다.`
                : `${getServiceLabel(services[0])} should be available in the market app flow.`,
            currentLocale === "ko"
                ? `${deviceDecision.final.modelName} 또는 유사 카테고리의 가용성이 유지되어야 합니다.`
                : `Availability of ${deviceDecision.final.modelName} or an equivalent category should be maintained.`,
            currentLocale === "ko"
                ? `현지 카피와 CTA는 선택 시장 언어 기준으로 조정되어야 합니다.`
                : "Local copy and CTA should be adapted to the selected market language."
        ],
        observation: exploreGrounding.observation,
        insight: exploreGrounding.insight,
        implication: exploreGrounding.implication,
        sourceUrls: [country.samsungShopUrl]
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
    return [
        localizeSentence("guide1", deviceDecision.final.modelName),
        localizeSentence("guide2", getServiceLabel(services[0])),
        localizeSentence("guide3"),
        localizeSentence("guide4"),
        currentLocale === "ko"
            ? `${getRoleTitle(selectedRole.id)} 담당자는 첫 배포 시 가장 반응이 좋은 문구와 CTA를 함께 기록합니다.`
            : `${getRoleTitle(selectedRole.id)} owners should log the best-performing message and CTA from the first rollout.`
    ];
}

function buildMarketability(country, intent, deviceDecision, services, selectedRole, selectedSegment, exploreGrounding) {
    const go = intent.lifestyleTags.length > 0 && Boolean(deviceDecision.final);
    return {
        verdict: go ? "Go" : "No-Go",
        rationale: go
            ? (currentLocale === "ko"
                ? `${getCountryName(country.countryCode)}에서 ${selectedSegment}의 "${intent.purpose}" 상황은 ${exploreGrounding.primaryValue} 가치가 명확하게 읽히는 장면이라 Go 판단이 가능합니다.`
                : `In ${getCountryName(country.countryCode)}, the "${intent.purpose}" moment for the ${selectedSegment} segment makes ${exploreGrounding.primaryValue} legible enough for a Go decision.`)
            : localizeSentence("marketNoGo"),
        competitorView: currentLocale === "ko"
            ? `차별점은 기능 수가 아니라 ${exploreGrounding.functionalJob}을 한 번의 연결 경험으로 줄여준다는 점입니다.`
            : `The differentiation is not feature count but reducing ${exploreGrounding.functionalJob} into one connected experience.`,
        risk: services[0].privacyPolicy,
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
                ? `${selectedSegment} 기준으로 "${exploreGrounding.coreMessage}"를 압축한 첫 배포용 한 문장 메시지를 확정합니다.`
                : `Lock a one-line launch message for the ${selectedSegment} segment.`,
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
    if (currentLocale === "ko") {
        return `${getRoleTitle(role.id)} 관점의 ${selectedSegment} 대상 ${getCategoryName(deviceDecision.final.category)} 기반 ${intent.missionBucket} 시나리오`;
    }
    return `${getRoleTitle(role.id)} | ${intent.missionBucket} scenario for ${selectedSegment} built around ${getCategoryName(deviceDecision.final.category)}`;
}

function buildSummary(country, selectedSegment, intent, deviceDecision, services) {
    if (currentLocale === "ko") {
        return `${getCountryName(country.countryCode)}에서 ${selectedSegment}에게 ${deviceDecision.final.modelName}와 ${getServiceLabel(services[0])}를 중심으로 ${intent.missionBucket} 가치를 전달하는 앱 시나리오입니다.`;
    }
    return `An app scenario for the ${selectedSegment} segment in ${getCountryName(country.countryCode)}, centered on ${deviceDecision.final.modelName} and ${getServiceLabel(services[0])}, designed to deliver ${intent.missionBucket} value.`;
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
    return [
        currentLocale === "ko" ? `누가: ${location}의 ${selectedSegment}` : `Who: ${selectedSegment} in ${location}`,
        currentLocale === "ko" ? `언제: ${intent.purpose} 같은 상황이 반복되는 일상 구간` : `When: during recurring moments like "${intent.purpose}"`,
        currentLocale === "ko" ? `무엇으로: ${getServiceLabel(services[0])}${secondary.serviceName !== services[0].serviceName ? ` + ${getServiceLabel(secondary)}` : ""}` : `With: ${getServiceLabel(services[0])}${secondary.serviceName !== services[0].serviceName ? ` + ${getServiceLabel(secondary)}` : ""}`,
        currentLocale === "ko" ? `어떻게: ${deviceDecision.final.modelName} 중심의 추천 카드와 반복 루틴으로 ${exploreGrounding.functionalJob}을 줄임` : `How: reduce ${exploreGrounding.functionalJob} through recommendation cards and repeat routines anchored on ${deviceDecision.final.modelName}`,
        currentLocale === "ko" ? `결과: ${exploreGrounding.primaryValue}을 더 빠르게 체감` : `Result: make ${exploreGrounding.primaryValue} felt faster`,
        currentLocale === "ko" ? `캠페인 메시지: ${exploreGrounding.coreMessage}` : `Campaign message: ${exploreGrounding.coreMessage}`
    ];
}

function buildDetailedScenario(country, city, selectedSegment, intent, deviceDecision, services) {
    const countryName = getCountryName(country.countryCode);
    const serviceNames = [...new Set(services.slice(0, 3).map((service) => service.serviceName))];
    const isPetContext = /pet|dog|cat|puppy|kitten|반려|강아지|고양이/i.test(`${selectedSegment} ${intent.purpose} ${serviceNames.join(" ")}`);
    const appliedServices = [...new Set(services.slice(0, 3).map((service) => service.appCardLabel || service.serviceName))];
    const serviceStories = services.slice(0, 3).map((service) => {
        const story = buildServiceStory(service, intent, selectedSegment, isPetContext);
        return { title: story.title, paragraphs: [story.pain, story.solution, story.benefit] };
    });

    return {
        targetCustomer: currentLocale === "ko"
            ? buildTargetCustomerLine(countryName, selectedSegment, intent.purpose)
            : buildTargetCustomerLine(countryName, selectedSegment, intent.purpose),
        appliedServices: appliedServices.join(" / "),
        appliedServiceList: appliedServices,
        cases: serviceStories
    };
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

    const stories = {
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

    return stories[name] || {
        title: `[${service.valueTags?.[0] || "Life"}] ${name}가 필요한 순간`,
        pain: `${selectedSegment} 사용자는 ${intent.purpose} 같은 상황에서 반복 확인과 수동 조작의 부담을 자주 느낍니다.`,
        solution: `${cardLabel}는 ${firstFeature}와 ${secondFeature}를 바탕으로 연결 기기를 더 간단한 루틴으로 묶어 줍니다.`,
        benefit: "필요한 장면을 더 적은 조작으로 실행할 수 있어 일상이 훨씬 가벼워집니다."
    };
}

function buildMarketingMessages(role, selectedSegment, intent, services, exploreGrounding) {
    const valueWords = intent.missionBucket === "Care"
        ? ["안심", "배려", "생활"]
        : intent.missionBucket === "Save"
            ? ["절감", "통제", "생활"]
            : ["편안함", "리듬", "생활"];

    if (role.id === "brand") {
        return {
            kr: [
                `[단문] ${selectedSegment}의 일상을 더 가볍게, ${exploreGrounding.primaryValue}은 더 또렷하게.`,
                `[장문] "${intent.purpose}" 순간에 기술 설명보다 감정적 안도감을 먼저 전달해 브랜드 의미를 강화합니다.`,
                `[구분 논리] Global: ${exploreGrounding.coreMessage} / Local: 지역 생활 맥락과 언어 톤에 맞춘 사례 문장`
            ],
            en: [
                `[Short] Make daily life lighter for ${selectedSegment}, with clearer ${exploreGrounding.primaryValue}.`,
                `[Long] In the "${intent.purpose}" moment, lead with emotional relief before feature explanation to build brand meaning.`,
                `[Logic] Global: ${exploreGrounding.coreMessage} / Local: examples tuned to local daily context and language tone`
            ],
            roleTone: getRoleTitle(role.id)
        };
    }

    if (role.id === "dotcom") {
        return {
            kr: [
                `Benefit first: ${exploreGrounding.primaryValue}`,
                `PDP 전개: 문제 장면 -> 핵심 가치 -> 추천 제품 -> CTA`,
                `${getServiceLabel(services[0])}는 기능 나열보다 전환 흐름 중심 카피로 구성합니다.`
            ],
            en: [
                `Benefit first: ${exploreGrounding.primaryValue}`,
                `PDP flow: pain moment -> core value -> recommended product -> CTA`,
                `Position ${getServiceLabel(services[0])} with conversion-led copy over feature lists.`
            ],
            roleTone: getRoleTitle(role.id)
        };
    }

    if (role.id === "retail") {
        return {
            kr: [
                `30초 오프닝: "${exploreGrounding.coreMessage}"`,
                `1분 전개: 문제 확인 -> 데모 1회 -> 세팅 안내 -> 업셀 제안`,
                `매장 설명은 브랜드 서사보다 즉시 체감되는 효용 중심으로 유지합니다.`
            ],
            en: [
                `30s opening: "${exploreGrounding.coreMessage}"`,
                `1m flow: identify pain -> run one demo -> guide setup -> propose upsell`,
                `Keep in-store messaging focused on immediate utility over long brand storytelling.`
            ],
            roleTone: getRoleTitle(role.id)
        };
    }

    return {
        kr: [
            `${selectedSegment}의 하루를 더 가볍게, ${exploreGrounding.primaryValue}은 더 분명하게.`,
            `${exploreGrounding.messageAngle}이 필요한 순간에 ${valueWords[1]}가 아니라 실제 변화가 느껴지게 합니다.`,
            `${getServiceLabel(services[0])}는 기능 설명보다 ${exploreGrounding.coreMessage}를 먼저 전달해야 합니다.`
        ],
        en: [
            `Make daily life lighter for the ${selectedSegment} segment, with clearer ${exploreGrounding.primaryValue}.`,
            `Lead with ${exploreGrounding.messageAngle} so the user feels a real shift, not just more control.`,
            `${getServiceLabel(services[0])} should deliver ${exploreGrounding.coreMessage} before feature detail.`
        ],
        roleTone: getRoleTitle(role.id)
    };
}

function buildBenefits(intent, services, exploreGrounding) {
    return [
        currentLocale === "ko" ? `기능적 가치: ${exploreGrounding.functionalJob}을 줄여 반복 확인과 수동 조작을 덜어줍니다.` : `Functional value: reduce ${exploreGrounding.functionalJob} and lighten repeated checking.`,
        currentLocale === "ko" ? `감정적 가치: ${exploreGrounding.emotionalJob}이 가능해져 심리적 부담이 낮아집니다.` : `Emotional value: enable ${exploreGrounding.emotionalJob} and lower emotional burden.`,
        currentLocale === "ko" ? `체감 가치: ${exploreGrounding.primaryValue}이 한 번의 사용 장면에서도 바로 읽히도록 설계됩니다.` : `Felt value: make ${exploreGrounding.primaryValue} legible from the first use moment.`
    ];
}

function buildSegmentAnalysis(country, city, selectedSegment, intent, exploreGrounding) {
    return {
        core: currentLocale === "ko" ? `${selectedSegment} / ${city ? `${city}, ` : ""}${getCountryName(country.countryCode)} 생활권` : `${selectedSegment} / ${city || getCountryName(country.countryCode)}`,
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
    return {
        available: [
            currentLocale === "ko" ? `[확정] ${getCountryName(country.countryCode)} 기준 활용 가능 카테고리와 연결 시나리오를 우선 반영합니다.` : `[Confirmed] Prioritize categories and connected scenarios available in ${getCountryName(country.countryCode)}.`,
            currentLocale === "ko" ? `대표 기준 기기: ${deviceDecision.final.modelName}` : `Representative anchor device: ${deviceDecision.final.modelName}`,
            currentLocale === "ko" ? "[체크 포인트] 실제 판매 모델/SKU는 시점에 따라 변동될 수 있어 최종 확인이 필요합니다." : "[Check point] Final retail model and SKU availability should be confirmed at launch."
        ],
        steps: [
            currentLocale === "ko" ? "1단계: SmartThings 앱 설치 및 계정 로그인" : "Step 1: Install SmartThings and sign in",
            currentLocale === "ko" ? "2단계: 집(Home) 생성 후 핵심 기기 1대 먼저 연결" : "Step 2: Create the home and connect one core device first",
            currentLocale === "ko" ? `3단계: ${getServiceLabel(services[0])} 또는 추천 자동화 카드 활성화` : `Step 3: Activate ${getServiceLabel(services[0])} or the recommended automation card`,
            currentLocale === "ko" ? "4단계: 알림/절감/케어 중 가장 필요한 흐름 1개만 먼저 성공" : "Step 4: Make one needed flow succeed first",
            currentLocale === "ko" ? "5단계: 자주 쓰는 장면을 저장해 반복 사용" : "Step 5: Save the most-used moment for repeat use",
            currentLocale === "ko" ? "6단계: 추가 기기/가족 구성원으로 확장" : "Step 6: Expand to more devices or family members"
        ]
    };
}

function renderScenario(payload) {
    const tabButtons = [{ id: "overview", label: "Overview" }, ...payload.lensOutputs.map((lens) => ({ id: lens.id, label: lens.title }))];
    resultDiv.innerHTML = `
        <article class="scenario-output">
            <section class="output-toolbar">
                <div class="tabs" id="role-tabs">
                    ${tabButtons.map((tab) => `<button type="button" class="tab-btn ${tab.id === activeLensTab ? "active" : ""}" data-tab="${tab.id}">${tab.label}</button>`).join("")}
                </div>
            </section>
            <section id="tab-panel-overview" class="tab-panel ${activeLensTab === "overview" ? "active" : ""}">
                ${renderOverview(payload)}
            </section>
            ${payload.lensOutputs.map((lens) => `
                <section id="tab-panel-${lens.id}" class="tab-panel ${activeLensTab === lens.id ? "active" : ""}">
                    ${renderLensPanel(lens)}
                </section>
            `).join("")}
        </article>
    `;

    resultDiv.querySelectorAll(".tab-btn").forEach((button) => {
        button.addEventListener("click", () => {
            activeLensTab = button.dataset.tab;
            renderScenario(payload);
        });
    });
}

function renderOutputPreview() {
    const title = currentLocale === "ko"
        ? "사용자가 Q1~Q4를 모두 완료하면 아래 형식으로 출력됩니다."
        : "After Q1 to Q4 are completed, the output will follow this format.";
    const subtitle = currentLocale === "ko"
        ? "아래 01~03은 예시 고정 안내입니다. 실제 생성 시 입력한 내용으로 대체됩니다."
        : "The fixed 01~03 blocks below are examples and will be replaced by your generated content.";
    const samples = currentLocale === "ko"
        ? [
            {
                title: "01) 시나리오 제목 및 요약",
                lines: [
                    "예시: 맞벌이 가구의 저녁 루틴을 더 빠르게 시작하는 SmartThings 시나리오",
                    "요약: 퇴근 직후 반복되는 준비 시간을 줄이고, 핵심 기기 조합으로 체감 가치를 먼저 전달합니다."
                ]
            },
            {
                title: "02) 상세 시나리오 구조",
                lines: [
                    "예시: 상황 인지 -> 추천 카드 노출 -> 1회 자동화 실행 -> 반복 루틴 저장",
                    "포함: 타겟 고객 맥락, 핵심 행동 흐름, 역할별 활용 포인트"
                ]
            },
            {
                title: "03) 지역/직무 맞춤 출력",
                lines: [
                    "예시: 국가별 가용 기기, 직무별 메시지, 실행 체크리스트",
                    "안내: 닷컴 번들은 지역 eStore 기준이며 SKU/재고는 최종 확인이 필요합니다."
                ]
            }
        ]
        : [
            {
                title: "01) Scenario Title & Summary",
                lines: [
                    "Example: A SmartThings evening routine scenario for dual-income households.",
                    "Summary: Reduce repeated setup time after work and highlight value through a focused device mix."
                ]
            },
            {
                title: "02) Detailed Scenario Structure",
                lines: [
                    "Example: Context trigger -> recommendation card -> one-tap automation -> routine save.",
                    "Includes: target context, core action flow, and role-specific activation points."
                ]
            },
            {
                title: "03) Region & Role-Tailored Output",
                lines: [
                    "Example: country-ready devices, role-specific messages, execution checklist.",
                    "Note: dotcom bundles follow regional eStore mapping, and SKU/stock require final confirmation."
                ]
            }
        ];

    resultDiv.innerHTML = `
        <section class="placeholder-preview">
            <div class="placeholder-intro">
                <p class="placeholder-title">${escapeHtml(title)}</p>
                <p class="placeholder-subtitle">${escapeHtml(subtitle)}</p>
            </div>
            ${samples.map((sample) => `
                <article class="placeholder-card">
                    <h4>${escapeHtml(sample.title)}</h4>
                    <ul>${sample.lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
                </article>
            `).join("")}
        </section>
    `;
}

function renderOverview(payload) {
    return `
        <div class="output-stack">
            <section class="output-block hero-result numbered-output">
                <p class="block-index">01</p>
                <h4>${currentLocale === "ko" ? "시나리오 제목 및 요약 (Title & Summary)" : "Title & Summary"}</h4>
                <h3>${escapeHtml(payload.title)}</h3>
                <p>${escapeHtml(payload.summary)}</p>
                <p class="subhead">${currentLocale === "ko" ? "Explore 근거" : "Explore References"}</p>
                <ul>${payload.referenceLinks.map((item) => `<li>${escapeHtml(item.id)} / ${escapeHtml(item.title)} / ${escapeHtml(item.url)}</li>`).join("")}</ul>
                <p class="subhead">${currentLocale === "ko" ? "핵심 요약" : "Key Summary"}</p>
                <ul>${payload.summaryBullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            </section>
            <section class="output-block numbered-output">
                <p class="block-index">02</p>
                <h4>${currentLocale === "ko" ? "상세 시나리오" : "Detailed Scenario"}</h4>
                <div class="scenario-header">
                    <p class="scenario-meta-label">Target Customer</p>
                    <p class="scenario-meta-value">${escapeHtml(payload.detailedScenario.targetCustomer)}</p>
                </div>
                <div class="scenario-services">
                    ${payload.detailedScenario.appliedServiceList.map((service) => `<span class="service-pill">${escapeHtml(service)}</span>`).join("")}
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
            <section class="output-block numbered-output">
                <p class="block-index">03</p>
                <h4>${currentLocale === "ko" ? "지역 맞춤 인사이트 (Local Insight: O-I-Imp)" : "Local Insight: O-I-Imp"}</h4>
                <p class="subhead">${currentLocale === "ko" ? "Observation" : "Observation"}</p>
                <p>${escapeHtml(payload.facts.observation)}</p>
                <p class="subhead">${currentLocale === "ko" ? "Insight" : "Insight"}</p>
                <p>${escapeHtml(payload.facts.insight)}</p>
                <p class="subhead">${currentLocale === "ko" ? "Implication" : "Implication"}</p>
                <p>${escapeHtml(payload.facts.implication)}</p>
            </section>
            <section class="output-block numbered-output">
                <p class="block-index">04</p>
                <h4>${currentLocale === "ko" ? "맞춤 마케팅 메시지 (한/영)" : "Marketing Messages (KR/EN)"}</h4>
                <p class="subhead">KR</p>
                <ul>${payload.marketingMessages.kr.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
                <p class="subhead">EN</p>
                <ul>${payload.marketingMessages.en.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            </section>
            <section class="output-block numbered-output">
                <p class="block-index">05</p>
                <h4>${currentLocale === "ko" ? "주요 고객 혜택 (Outcome 중심 3가지)" : "Key Customer Benefits"}</h4>
                <ul>${payload.benefits.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            </section>
            <section class="output-block numbered-output">
                <p class="block-index">06</p>
                <h4>${currentLocale === "ko" ? "타겟 세그먼트 분석" : "Target Segment Analysis"}</h4>
                <p><strong>${currentLocale === "ko" ? "핵심 세그먼트" : "Core Segment"}:</strong> ${escapeHtml(payload.segmentAnalysis.core)}</p>
                <p class="subhead">${currentLocale === "ko" ? "행동 특징" : "Behavior Signals"}</p>
                <ul>${payload.segmentAnalysis.behaviors.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
                <p><strong>${currentLocale === "ko" ? "가정" : "Assumption"}:</strong> ${escapeHtml(payload.segmentAnalysis.assumption)}</p>
            </section>
            <section class="output-block numbered-output">
                <p class="block-index">07</p>
                <h4>${currentLocale === "ko" ? "가장 효과적인 캠페인 시기" : "Best Campaign Timing"}</h4>
                <ul>${payload.campaignTiming.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            </section>
            <section class="output-block numbered-output">
                <p class="block-index">08</p>
                <h4>${currentLocale === "ko" ? "가용 기기 및 설정 가이드" : "Available Devices & Setup Guide"}</h4>
                <p class="subhead">${currentLocale === "ko" ? "가용 기기" : "Available Device Context"}</p>
                <ul>${payload.deviceGuide.available.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
                <p class="subhead">${currentLocale === "ko" ? "1~6단계 설정 가이드" : "Step-by-step Setup Guide"}</p>
                <ul>${payload.deviceGuide.steps.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            </section>
            <section class="output-block numbered-output">
                <p class="block-index">09</p>
                <h4>${currentLocale === "ko" ? "시장성 및 리스크 평가" : "Marketability & Risk"}</h4>
                <table class="result-table">
                    <thead>
                        <tr>
                            <th>${currentLocale === "ko" ? "항목" : "Item"}</th>
                            <th>${currentLocale === "ko" ? "평가" : "Assessment"}</th>
                            <th>${currentLocale === "ko" ? "근거/메모" : "Rationale"}</th>
                            <th>${currentLocale === "ko" ? "대응 전략" : "Action"}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Market Fit</td>
                            <td>${escapeHtml(payload.marketability.verdict)}</td>
                            <td>${escapeHtml(payload.marketability.rationale)}</td>
                            <td>${escapeHtml(payload.marketability.nextActions[0] || "")}</td>
                        </tr>
                        <tr>
                            <td>${currentLocale === "ko" ? "경쟁사 대안" : "Competitive Alternative"}</td>
                            <td>${currentLocale === "ko" ? "중간" : "Medium"}</td>
                            <td>${escapeHtml(payload.marketability.competitorView)}</td>
                            <td>${escapeHtml(payload.marketability.nextActions[1] || "")}</td>
                        </tr>
                        <tr>
                            <td>${currentLocale === "ko" ? "리스크: 프라이버시/신뢰" : "Risk: Privacy / Trust"}</td>
                            <td>${currentLocale === "ko" ? "중간" : "Medium"}</td>
                            <td>${escapeHtml(payload.marketability.risk)}</td>
                            <td>${escapeHtml(payload.marketability.nextActions[2] || "")}</td>
                        </tr>
                    </tbody>
                </table>
                <p class="subhead">${currentLocale === "ko" ? "대안 구도" : "Alternative Set"}</p>
                <ul>${payload.marketability.alternatives.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            </section>
        </div>
    `;
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
    if (currentLocale === "ko") {
        return {
            summary: "CX 시나리오 제목 및 Summary",
            scenario: "상세 시나리오 (스토리텔링 구조)",
            automation: "Automation Logic Digest (JSON Skeleton)",
            facts: "지역 특성 및 데이터 근거",
            lenses: "마케팅 메시지 (Role-Lens)",
            metrics: "Success Metrics (Cause & Effect)",
            segment: "타겟 세그먼트 데이터",
            guide: "지역 가용 기기 및 설정 가이드",
            evaluation: "시장성 평가 및 Go/No-Go"
        };
    }
    return {
        summary: "CX Scenario Title & Summary",
        scenario: "Detailed Scenario (Storytelling Format)",
        automation: "Automation Logic Digest (JSON Skeleton)",
        facts: "Regional Context & Data Grounds",
        lenses: "Marketing Messages (Role-Lens)",
        metrics: "Success Metrics (Cause & Effect)",
        segment: "Target Segment Data",
        guide: "Available Devices & Setup Guide",
        evaluation: "Marketability & Go/No-Go"
    };
}

function handleExport(type) {
    if (!latestPayload) {
        resultDiv.innerHTML = `<p class="error">${t("downloadFirst")}</p>`;
        return;
    }
    if (type === "copy") return copySummary();
    if (type === "html") return window.print();
    if (type === "markdown") return downloadFile("scenario-report.md", buildMarkdownReport(latestPayload), "text/markdown");
    if (type === "json") return downloadFile("scenario-report.json", JSON.stringify(latestPayload, null, 2), "application/json");
}

async function copySummary() {
    const text = buildMarkdownReport(latestPayload);
    try {
        await navigator.clipboard.writeText(text);
    } catch {
        window.prompt(currentLocale === "ko" ? "아래 내용을 복사하세요." : "Copy the text below.", text);
    }
}

function buildMarkdownReport(payload) {
    return [
        `# ${payload.title}`,
        "",
        "## 01. 시나리오 제목 및 요약 (Title & Summary)",
        payload.summary,
        ...payload.summaryBullets.map((item) => `- ${item}`),
        "",
        "### Explore 근거",
        ...payload.referenceLinks.map((item) => `- ${item.id} / ${item.title} / ${item.url}`),
        "",
        "## 02. 상세 시나리오",
        "---------------------------------------------------------------------------------------------------------------------------",
        `- Target Customer : ${payload.detailedScenario.targetCustomer}`,
        "---------------------------------------------------------------------------------------------------------------------------",
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
        "## 03. 지역 맞춤 인사이트 (Local Insight: O-I-Imp)",
        "### Observation",
        payload.facts.observation,
        "",
        "### Insight",
        payload.facts.insight,
        "",
        "### Implication",
        payload.facts.implication,
        "",
        "## 04. 맞춤 마케팅 메시지 (KR/EN)",
        "### KR",
        ...payload.marketingMessages.kr.map((item) => `- ${item}`),
        "",
        "### EN",
        ...payload.marketingMessages.en.map((item) => `- ${item}`),
        "",
        "## 05. 주요 고객 혜택",
        ...payload.benefits.map((item) => `- ${item}`),
        "",
        "## 06. 타겟 세그먼트 분석",
        `- 핵심 세그먼트: ${payload.segmentAnalysis.core}`,
        ...payload.segmentAnalysis.behaviors.map((item) => `- ${item}`),
        `- 가정: ${payload.segmentAnalysis.assumption}`,
        "",
        "## 07. 가장 효과적인 캠페인 시기",
        ...payload.campaignTiming.map((item) => `- ${item}`),
        "",
        "## 08. 가용 기기 및 설정 가이드",
        ...payload.deviceGuide.available.map((item) => `- ${item}`),
        ...payload.deviceGuide.steps.map((item) => `- ${item}`),
        "",
        "## 09. 시장성 및 리스크 평가",
        `- Market Fit: ${payload.marketability.verdict}`,
        `- 근거: ${payload.marketability.rationale}`,
        `- 경쟁/대안: ${payload.marketability.competitorView}`,
        `- 리스크: ${payload.marketability.risk}`,
        ...payload.marketability.alternatives.map((item) => `- 대안: ${item}`),
        ...payload.marketability.nextActions.map((item) => `- 대응 전략: ${item}`),
        "",
        "## Role-Lens Packages",
        ...payload.lensOutputs.flatMap((lens) => [
            `### ${lens.title}`,
            `- Subtitle: ${lens.subtitle}`,
            `- Objective: ${lens.objective || ""}`,
            `- Headline: ${lens.headline || ""}`,
            `- Message: ${lens.message || ""}`,
            `- Asset: ${lens.asset || ""}`,
            `- CTA: ${lens.cta || ""}`,
            `- KPI: ${lens.kpi || ""}`,
            ...((lens.proofPoints || []).map((item) => `- Proof: ${item}`)),
            ...((lens.executionChecklist || []).map((item) => `- Checklist: ${item}`)),
            ...((lens.roleDetailSections || []).flatMap((section) => [
                `- ${section.title}`,
                ...((section.items || []).map((item) => `  - ${item}`))
            ])),
            `- Copy: ${lens.copy}`
        ])
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
        city: cityInput.value,
        personaSelections: getSelectedPersonaOptionIds(),
        segmentCustom: segmentCustomInput.value,
        deviceSelections: getSelectedDeviceOptionIds(),
        deviceCustom: deviceCustomInput.value
    };
    currentLocale = COUNTRY_LOCALES[countrySelect.value] || "en";
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
}

function applyLocale() {
    const stepPanels = document.querySelectorAll(".wizard-step");
    const deviceLabel = stepPanels[3]?.querySelector("label");
    const heroChips = document.querySelectorAll(".hero-chip");
    const heroMetricLabels = document.querySelectorAll(".hero-metric span");

    document.querySelector(".eyebrow").textContent = currentLocale === "ko" ? "Interactive Scenario Builder" : currentLocale === "de" ? "Interaktiver Szenario-Builder" : "Interactive Scenario Builder";
    document.querySelector(".hero-text").textContent = currentLocale === "ko"
        ? "핵심 입력만 선택하면 메시지부터 활용안까지 완성도 높은 시나리오로 정리됩니다."
        : currentLocale === "de"
            ? "Beantworten Sie die Fragen der Reihe nach und bauen Sie schrittweise ein App-Szenario auf, das für Nutzer attraktiver wirkt."
            : "Answer the questions in sequence and build an app scenario step by step that feels more compelling to users.";
    if (heroChips[0]) heroChips[0].textContent = currentLocale === "ko" ? "맥락 중심 설계" : currentLocale === "de" ? "Kontext zuerst" : "Context-first flow";
    if (heroChips[1]) heroChips[1].textContent = currentLocale === "ko" ? "4단계 guided flow" : currentLocale === "de" ? "4 Schritte" : "4 guided inputs";
    if (heroChips[2]) heroChips[2].textContent = currentLocale === "ko" ? "바로 검토 가능한 결과" : currentLocale === "de" ? "Direkt prüfbare Ergebnisse" : "Review-ready output";
    if (heroMetricLabels[0]) heroMetricLabels[0].textContent = currentLocale === "ko" ? "접근 확인 후 시작 가이드" : currentLocale === "de" ? "Zugang und Guide" : "Access and guide check";
    if (heroMetricLabels[1]) heroMetricLabels[1].textContent = currentLocale === "ko" ? "질문에 따라 단계별 입력" : currentLocale === "de" ? "Schrittweise Eingabe" : "Step-by-step scenario setup";
    if (heroMetricLabels[2]) heroMetricLabels[2].textContent = currentLocale === "ko" ? "결과 확인과 바로 내보내기" : currentLocale === "de" ? "Output und Export" : "Immediate output and export";
    document.querySelector("#access-screen h2").textContent = currentLocale === "ko" ? "시작하기" : currentLocale === "de" ? "Loslegen" : "Get Started";
    document.querySelector("label[for='access-code']").textContent = t("accessRequired").replace(".", "");
    accessCodeInput.placeholder = t("accessPlaceholder");
    document.querySelector("#access-screen .helper").textContent = t("accessHelper");
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
    guideYesBtn.textContent = currentLocale === "ko" ? "Yes" : currentLocale === "de" ? "Ja" : "Yes";
    guideNoBtn.textContent = currentLocale === "ko" ? "No" : currentLocale === "de" ? "Nein" : "No";
    guideContinueBtn.textContent = currentLocale === "ko" ? "시작" : currentLocale === "de" ? "Start" : "Start";
    if (!guideCopy.classList.contains("hidden")) {
        guideCopy.innerHTML = buildGuideMarkup();
    }
    const roleQuestionLabel = document.querySelector('.wizard-step[data-step="1"] .field > label');
    if (roleQuestionLabel) roleQuestionLabel.textContent = t("roleQuestion");
    document.querySelector("label[for='country']").textContent = t("countryQuestion");
    document.getElementById("segment-label").textContent = t("personaQuestion");
    if (deviceLabel) deviceLabel.textContent = t("deviceQuestion");
    purposeInput.placeholder = t("purposePlaceholder");
    segmentCustomInput.placeholder = currentLocale === "ko" ? "추가 대상이나 세부 조건을 직접 입력" : currentLocale === "de" ? "Zusätzliche Zielgruppe oder Details eingeben" : "Add any extra target detail";
    deviceCustomInput.placeholder = currentLocale === "ko" ? "추가 기기나 세부 모델을 직접 입력" : currentLocale === "de" ? "Zusätzliche Geräte oder Modelle eingeben" : "Add any extra device or model";
    cityInput.placeholder = currentLocale === "ko" ? "도시 / 주 / 지역 입력" : currentLocale === "de" ? "Stadt / Bundesland / Region" : "City / State / Region";
    updateQuestionHelpers();
    prevBtn.textContent = t("prev");
    nextBtn.textContent = t("next");
    generateBtn.textContent = t("build");
    if (!latestPayload) renderOutputPreview();
    document.querySelector(".report-head h2").textContent = t("output");
    renderExportActions();
}

function renderExportActions() {
    const labels = {
        markdown: { title: t("downloadMarkdown"), desc: currentLocale === "ko" ? "문서 리뷰용" : "Review doc" },
        json: { title: t("downloadJson"), desc: currentLocale === "ko" ? "데이터 연동용" : "Data handoff" },
        html: { title: t("printPdf"), desc: currentLocale === "ko" ? "회의 공유용" : "Share / Print" },
        copy: { title: t("copySummary"), desc: currentLocale === "ko" ? "메신저 공유용" : "Quick share" }
    };
    exportActions.innerHTML = `
        ${["markdown", "json", "html", "copy"].map((type, index) => `
            <button type="button" class="action-btn export-tile" data-export="${type}">
                <span class="export-tile-index">${String(index + 1).padStart(2, "0")}</span>
                <strong>${escapeHtml(labels[type].title)}</strong>
                <span>${escapeHtml(labels[type].desc)}</span>
            </button>
        `).join("")}
    `;
    exportActions.querySelectorAll(".action-btn").forEach((button) => {
        button.addEventListener("click", () => handleExport(button.dataset.export));
    });
}

function t(key) {
    return UI_TEXT[currentLocale]?.[key] || UI_TEXT.en?.[key] || UI_TEXT.ko?.[key] || key;
}

function getUiPhrase(key) {
    const map = {
        personaTask: { ko: "주요 과제", en: "Core task", de: "Zentrale Aufgabe" },
        personaSuccess: { ko: "기대 결과", en: "Expected result", de: "Erwartetes Ergebnis" },
        stateRole: { ko: "담당업무", en: "Work Lens", de: "Perspektive" },
        stateCountry: { ko: "국가", en: "Country", de: "Land" },
        statePersona: { ko: "타겟고객", en: "Target User", de: "Zielnutzer" },
        stateSituation: { ko: "상황설명", en: "Situation", de: "Situation" },
        stateDevice: { ko: "반영기기", en: "Device", de: "Gerät" },
        notSelected: { ko: "미선택", en: "Not selected", de: "Nicht gewählt" },
        notEntered: { ko: "미입력", en: "Not entered", de: "Nicht eingegeben" }
    };
    return map[key]?.[currentLocale] || map[key]?.en || map[key]?.ko || key;
}

function getCountryName(code) {
    const map = {
        KR: { ko: "대한민국", en: "South Korea", de: "Südkorea" },
        US: { ko: "미국", en: "United States", de: "Vereinigte Staaten" },
        GB: { ko: "영국", en: "United Kingdom", de: "Vereinigtes Königreich" },
        DE: { ko: "독일", en: "Germany", de: "Deutschland" }
    };
    return map[code]?.[currentLocale] || map[code]?.en || map[code]?.ko || code;
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
    if (!unique.has("KR")) {
        unique.set("KR", {
            siteCode: "KR",
            countryName: "Korea",
            language: "Korean",
            baseCode: "KR",
            label: localizeCountryLabel("Korea", "KR")
        });
    }
    return [...unique.values()];
}

function normalizeSiteCode(siteCode) {
    const aliases = {
        UK: "GB",
        LATIN: "PA",
        LATIN_EN: "PA",
        AE_AR: "AE",
        CA_FR: "CA",
        BE_FR: "BE",
        CH_FR: "CH"
    };
    return aliases[siteCode] || siteCode;
}

function localizeCountryLabel(countryName, siteCode) {
    const bySite = {
        KR: { ko: "대한민국 (KR)", en: "South Korea (KR)", de: "Südkorea (KR)" },
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
        CH_FR: { ko: "스위스 프랑스어 (CH_FR)", en: "Switzerland French (CH_FR)", de: "Schweiz Französisch (CH_FR)" }
    };
    return bySite[siteCode]?.[currentLocale] || bySite[siteCode]?.en || `${countryName} (${siteCode})`;
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

function getSelectedSegment() {
    return [...getSelectedPersonaLabels(), ...getCustomEntries(segmentCustomInput.value)].join(" / ");
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
