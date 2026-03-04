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

const SEGMENTS = [
    "신혼/새집 입주 가구",
    "맞벌이 육아 가구",
    "펫 케어 중심 가구",
    "시니어 동거/돌봄 가구",
    "에너지 절감 관심층",
    "웰니스/홈 피트니스 관심층",
    "프리미엄 홈 경험 추구층",
    "스마트홈 입문층",
    "직접 입력"
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
        accessHelper: "현재 화면은 입력 UI만 제공하며 실제 검증은 서버 연동 후 활성화됩니다.",
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
        personaQuestion: "Q3. 어떤 타겟 세그먼트와 상황을 떠올리고 있나요?",
        deviceQuestion: "Q4. 어떤 기기를 중심으로 구성할까요?",
        purposePlaceholder: "예: 맞벌이 가정이 퇴근 후 아이와 함께 집에 들어왔을 때 더 빠르고 편안하게 저녁 시간을 시작하고 싶다",
        countryHelper: "지역에 따라 추천 기기와 활용 방식이 달라집니다.",
        personaHelper: "타겟 세그먼트와 함께 생활 패턴, 계절, 집 안의 문제 상황까지 적으면 더 설득력 있는 시나리오가 나옵니다.",
        deviceHelper: "기기 카테고리를 중심으로 고르면 활용 폭을 더 넓힐 수 있습니다.",
        roleMissing: "Q1에서 담당 업무 관점을 먼저 선택해 주세요.",
        countryMissing: "Q2에서 국가를 선택해 주세요.",
        personaMissing: "Q3에서 타겟 세그먼트와 상황 설명을 함께 입력해 주세요.",
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
        accessHelper: "This screen currently provides input UI only. Real verification will be enabled after server integration.",
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
        countryHelper: "Recommended devices and story angles can shift by market context.",
        personaHelper: "Add the target segment, lifestyle, season, and pain points at home to make the scenario more persuasive.",
        deviceHelper: "Choosing a device category keeps the scenario more flexible and expandable.",
        roleMissing: "Please choose the work lens first in Q1.",
        countryMissing: "Please choose the country in Q2.",
        personaMissing: "Please choose the target segment and describe the situation in Q3.",
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
        accessHelper: "Dieser Bildschirm zeigt derzeit nur die Eingabeoberfläche. Die echte Prüfung wird nach der Server-Integration aktiviert.",
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
        countryHelper: "Empfohlene Geräte und Story-Ansätze können je nach Markt variieren.",
        personaHelper: "Ergänzen Sie Alter, Lebensstil, Saison und Probleme zu Hause, damit das Szenario überzeugender wird.",
        deviceHelper: "Eine Geräte-Kategorie hält das Szenario flexibler und leichter erweiterbar.",
        roleMissing: "Bitte wählen Sie zuerst in Q1 die fachliche Perspektive aus.",
        countryMissing: "Bitte wählen Sie in Q2 das Land aus.",
        personaMissing: "Bitte wählen Sie in Q3 den Nutzertyp und beschreiben Sie die Situation.",
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
        accessHelper: "Cet écran fournit actuellement uniquement l'interface de saisie. La vérification réelle sera activée après l'intégration serveur.",
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
        personaMissing: "Veuillez sélectionner le type d'utilisateur et décrire la situation dans la Q3.",
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
        accessHelper: "Esta pantalla solo ofrece la interfaz de entrada por ahora. La verificación real se activará después de la integración con el servidor.",
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
        personaMissing: "Selecciona el tipo de usuario y describe la situación en la Q3.",
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
        accessHelper: "Esta tela atualmente oferece apenas a interface de entrada. A verificação real será ativada após a integração com o servidor.",
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
        personaMissing: "Selecione o tipo de usuário e descreva a situação na Q3.",
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
        accessHelper: "Questa schermata fornisce attualmente solo l'interfaccia di input. La verifica reale sarà attivata dopo l'integrazione server.",
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
        personaMissing: "Seleziona il tipo di utente e descrivi la situazione nella Q3.",
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
        accessHelper: "Dit scherm biedt momenteel alleen de invoerinterface. Echte verificatie wordt geactiveerd na serverintegratie.",
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
        personaMissing: "Selecteer het gebruikerstype en beschrijf de situatie in Q3.",
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
        accessHelper: "تعرض هذه الشاشة واجهة الإدخال فقط حالياً. سيتم تفعيل التحقق الفعلي بعد ربط الخادم.",
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
        personaMissing: "يرجى اختيار نوع المستخدم ووصف الموقف في Q3.",
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
    sessionEndpoint: "/api/access/session"
};

const resultDiv = document.getElementById("result");
const accessScreen = document.getElementById("access-screen");
const guideScreen = document.getElementById("guide-screen");
const wizardScreen = document.getElementById("wizard-screen");
const accessCodeInput = document.getElementById("access-code");
const unlockBtn = document.getElementById("unlock-btn");
const guideYesBtn = document.getElementById("guide-yes-btn");
const guideNoBtn = document.getElementById("guide-no-btn");
const guideContinueBtn = document.getElementById("guide-continue-btn");
const guideCopy = document.getElementById("guide-copy");
const roleSelect = document.getElementById("role");
const roleBrief = document.getElementById("role-brief");
const purposeInput = document.getElementById("purpose");
const countrySelect = document.getElementById("country");
const cityInput = document.getElementById("city");
const segmentSelect = document.getElementById("segment");
const segmentCustomInput = document.getElementById("segment-custom");
const deviceGrid = document.getElementById("device-grid");
const exportActions = document.getElementById("export-actions");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const generateBtn = document.getElementById("generate-btn");
const stepInsight = document.getElementById("step-insight");

let factPack = [];
let exploreMatrix = {};
let sourceData = {};
let latestPayload = null;
let activeLensTab = "overview";
let currentStep = 1;
let currentLocale = "ko";
let marketOptions = [];

document.addEventListener("DOMContentLoaded", () => {
    hydrateStaticUi();
    loadReferenceData();
    bindEvents();
    checkExistingSession();
});

function bindEvents() {
    unlockBtn.addEventListener("click", handleUnlock);
    accessCodeInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") handleUnlock();
    });
    guideYesBtn.addEventListener("click", openWizard);
    guideNoBtn.addEventListener("click", showGuideCopy);
    guideContinueBtn.addEventListener("click", openWizard);
    prevBtn.addEventListener("click", () => moveStep(-1));
    nextBtn.addEventListener("click", () => moveStep(1));
    generateBtn.addEventListener("click", generateScenario);
    roleSelect.addEventListener("change", () => {
        updateRoleBrief();
        updateStatePreview();
        updateStepInsight();
    });
    countrySelect.addEventListener("change", updateStatePreview);
    countrySelect.addEventListener("change", updateLocaleFromCountry);
    cityInput.addEventListener("input", () => {
        updateStatePreview();
        updateStepInsight();
    });
    segmentSelect.addEventListener("change", updateSegmentVisibility);
    segmentSelect.addEventListener("change", () => {
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
    deviceGrid.addEventListener("change", () => {
        updateStatePreview();
        updateStepInsight();
    });
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
        const [factPackRes, exploreMatrixRes, sourceDataRes] = await Promise.all([
            fetch("references/fact_pack.json"),
            fetch("references/explore_matrix.json"),
            fetch("references/source_data.json")
        ]);

        factPack = await factPackRes.json();
        exploreMatrix = await exploreMatrixRes.json();
        sourceData = await sourceDataRes.json();

        populateInputs();
        updateLocaleFromCountry();
        updateRoleBrief();
        updateStatePreview();
    } catch (error) {
        resultDiv.innerHTML = `<p class="error">데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>`;
        console.error(error);
    }
}

function populateInputs(preserved = {}) {
    const previousRole = preserved.role || roleSelect.value;
    const previousCountry = preserved.country || countrySelect.value;
    const previousCity = preserved.city || cityInput.value;
    const previousSegment = preserved.segment || segmentSelect.value;
    const previousSegmentCustom = preserved.segmentCustom || segmentCustomInput.value;
    const previousDevices = preserved.devices || getSelectedDevices();

    roleSelect.innerHTML = ROLE_LENSES.map((role) => (
        `<option value="${role.id}">${getRoleTitle(role.id)} (${getRoleFocus(role.id)})</option>`
    )).join("");
    marketOptions = buildMarketOptions();
    countrySelect.innerHTML = marketOptions.map((market) => (
        `<option value="${market.siteCode}">${market.label}</option>`
    )).join("");
    segmentSelect.innerHTML = SEGMENTS.map((segment) => (
        `<option value="${segment}">${segment}</option>`
    )).join("");
    deviceGrid.innerHTML = exploreMatrix.deviceCategories.map((device) => `
        <label class="device-option">
            <input type="checkbox" value="${device.categoryName}">
            <span>${getCategoryName(device.categoryName)}</span>
        </label>
    `).join("");

    if (previousRole) roleSelect.value = previousRole;
    if (previousCountry && marketOptions.some((market) => market.siteCode === previousCountry)) countrySelect.value = previousCountry;
    if (previousCity) cityInput.value = previousCity;
    if (previousSegment) segmentSelect.value = previousSegment;
    if (previousSegmentCustom) segmentCustomInput.value = previousSegmentCustom;
    deviceGrid.querySelectorAll('input[type="checkbox"]').forEach((input) => {
        input.checked = previousDevices.includes(input.value);
    });
    updateSegmentVisibility();
}

async function handleUnlock() {
    if (!accessCodeInput.value.trim()) {
        resultDiv.innerHTML = `<p class="error">${t("accessRequired")}</p>`;
        return;
    }

    const verified = await verifyAccessCode(accessCodeInput.value.trim());
    if (!verified) {
        resultDiv.innerHTML = `<p class="placeholder">${t("unlockedPlaceholder")}</p>`;
    }
    showGuideScreen();
}

async function verifyAccessCode(code) {
    try {
        const response = await fetch(ACCESS_API.verifyEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ accessCode: code })
        });

        if (!response.ok) throw new Error("verify endpoint not active");
        const payload = await response.json();
        return Boolean(payload?.ok && payload?.session?.authenticated);
    } catch {
        // Server integration is intentionally deferred. The UI proceeds in placeholder mode.
        return false;
    }
}

function openWizard() {
    guideScreen.classList.add("hidden");
    wizardScreen.classList.remove("hidden");
    resultDiv.innerHTML = `<p class="placeholder">${t("startAfterGuide")}</p>`;
}

function showGuideCopy() {
    guideCopy.innerHTML = buildGuideMarkup();
    guideCopy.classList.remove("hidden");
    guideContinueBtn.classList.remove("hidden");
}

function buildGuideMarkup() {
    if (currentLocale === "ko") {
        return `
            <strong>[ Scenario Agent Quick Guide ]</strong>
            <p class="subhead">입력 4개만 주세요 (Q1~Q4)</p>
            <ul>
                <li>Q1 담당업무: 리테일/닷컴 캠페인/브랜드 마케팅</li>
                <li>Q2 국가·지역: 국가 + 도시/주</li>
                <li>Q3 타겟 고객: 연령·가구·시즌/상황</li>
                <li>Q4 기기·환경: 보유 기기 + 제약</li>
            </ul>
            <p class="subhead">진행 방식</p>
            <ul>
                <li>질문은 한 번에 하나씩, 답하면 다음으로 넘어갑니다</li>
                <li>부족하면 확인 질문 1~2개만 최소로 추가합니다</li>
                <li>불확실한 내용은 ‘확인 필요(Assumption)’로 분리해 제공합니다</li>
            </ul>
            <p class="subhead">결과물</p>
            <ul>
                <li>최종 출력은 01~09 고정 섹션으로 정리됩니다</li>
                <li>고객 경험 중심 + 프리미엄 삼성 톤으로 완성됩니다</li>
            </ul>
            <p>가이드를 모두 확인하셨다면 '시작'으로 넘어가 주세요.</p>
        `;
    }

    return `
        <strong>[ Scenario Agent Quick Guide ]</strong>
        <p class="subhead">Please provide only four inputs (Q1-Q4)</p>
        <ul>
            <li>Q1 Work Lens: Retail / Dotcom Campaign / Brand Marketing</li>
            <li>Q2 Country & Region: country + city/state</li>
            <li>Q3 Target Customer: age / household / season or situation</li>
            <li>Q4 Devices & Environment: owned devices + constraints</li>
        </ul>
        <p class="subhead">How It Works</p>
        <ul>
            <li>Questions appear one at a time, and each answer moves to the next step</li>
            <li>If needed, only one or two short follow-up checks are added</li>
            <li>Uncertain points are separated clearly as Assumptions</li>
        </ul>
        <p class="subhead">Output</p>
        <ul>
            <li>The final result is organized into fixed sections 01-09</li>
            <li>The output is shaped around customer experience with a premium Samsung tone</li>
        </ul>
        <p>If you are ready, press Start.</p>
    `;
}

async function checkExistingSession() {
    try {
        const response = await fetch(ACCESS_API.sessionEndpoint, {
            method: "GET",
            credentials: "include"
        });
        if (!response.ok) return;
        const payload = await response.json();
        if (payload?.ok && payload?.session?.authenticated) {
            showGuideScreen();
        }
    } catch {
        // Session endpoint is optional until backend is connected.
    }
}

function showGuideScreen() {
    accessScreen.classList.add("hidden");
    guideScreen.classList.remove("hidden");
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
    const insight = getStepInsight();
    stepInsight.innerHTML = `<strong>${escapeHtml(insight.title)}</strong><p>${escapeHtml(insight.body)}</p>`;
}

function getStepInsight() {
    if (currentStep === 2) return buildStep2Insight();
    if (currentStep === 3) return buildStep3Insight();
    if (currentStep === 4) return buildStep4Insight();
    return STEP_INSIGHTS[currentStep];
}

function buildStep2Insight() {
    const selectedMarket = marketOptions.find((market) => market.siteCode === countrySelect.value);
    const city = cityInput.value.trim();

    if (!selectedMarket) {
        return STEP_INSIGHTS[2];
    }

    const country = resolveCountry(selectedMarket);
    const regional = getRegionalSignals(country.countryCode, city, { missionBucket: "Discover" });
    const marketLabel = city ? `${getCountryName(country.countryCode)} ${city}` : getCountryName(country.countryCode);
    const direction = inferRegionalDirection(country.countryCode);

    return {
        title: currentLocale === "ko" ? "이 지역에서는 이런 장면이 더 잘 먹힙니다" : "This region responds better to this kind of moment",
        body: currentLocale === "ko"
            ? `${marketLabel}은 ${regional.observation} 성격이 강합니다. 그래서 ${regional.insight.toLowerCase()} 흐름이 유리하고, 시나리오는 ${direction} 쪽으로 잡는 편이 좋습니다.`
            : `${marketLabel} shows a context shaped by ${regional.observation}. This makes ${regional.insight.toLowerCase()} more compelling, so the scenario should lean toward ${direction}.`
    };
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

    return {
        title: currentLocale === "ko" ? "이 타겟은 이렇게 읽히고 있습니다" : "This target is being interpreted like this",
        body: currentLocale === "ko"
            ? `${place}의 ${selectedSegment || "사용자"}는 ${featureText} 특징이 강하게 보입니다. 그래서 시나리오는 ${direction} 쪽으로 끌고 가는 편이 좋습니다.`
            : `The ${selectedSegment || "target"} in ${place} shows strong signals of ${featureText}. The scenario should therefore lean toward ${direction}.`
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

function buildStep4Insight() {
    const devices = getSelectedDevices().map((device) => getCategoryName(device));
    if (devices.length === 0) return STEP_INSIGHTS[4];

    const comboText = devices.slice(0, 3).join(", ");
    const firstScene = inferFirstUseScene(devices);
    return {
        title: currentLocale === "ko" ? "기기 조합으로 첫 실행 장면이 더 선명해집니다" : "The device mix sharpens the first-use moment",
        body: currentLocale === "ko"
            ? `${comboText} 조합이면 단일 기능 설명보다 연결된 생활 장면으로 설계하는 편이 좋습니다. 예를 들면 ${firstScene} 같은 첫 실행 장면으로 시작하고, 그 뒤에 반복 사용 루틴을 붙이는 구성이 좋습니다.`
            : `With ${comboText}, it is better to frame a connected life moment rather than a single feature story. Start with a first-use moment such as ${firstScene}, then connect it to a repeat-use routine.`
    };
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
    if (currentStep === 3 && (!getSelectedSegment() || !purposeInput.value.trim())) {
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
    const role = ROLE_LENSES.find((item) => item.id === roleSelect.value);
    roleBrief.textContent = role ? getRoleBrief(role.id) : "";
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
    const purpose = purposeInput.value.trim();
    const selectedMarket = marketOptions.find((market) => market.siteCode === countrySelect.value);
    const country = resolveCountry(selectedMarket);
    const city = cityInput.value.trim();
    const selectedSegment = getSelectedSegment();
    const selectedDevices = getSelectedDevices();

    if (!role || !purpose || !country || !selectedSegment || selectedDevices.length === 0) {
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
    const lensOutputs = buildRoleLensOutputs(role, narrative, country, deviceDecision, services, selectedSegment, intent, exploreGrounding);
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
            devices: selectedDevices.map((device) => getCategoryName(device))
        }
    };

    activeLensTab = "overview";
    renderScenario(latestPayload);
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
    const signals = {
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
    };
    const fallback = {
        observation: `${getCountryName(countryCode)} 시장의 일상 리듬과 생활 환경을 고려한 일반적 사용 맥락${cityNote}`,
        insight: `${intent.missionBucket} 가치가 명확할수록 사용자는 기능보다 결과 중심으로 반응함`,
        implication: "앱은 복잡한 설명보다 한 번에 이해되는 추천 장면을 먼저 제시해야 함"
    };
    return signals[countryCode] || fallback;
}

function buildAutomationSkeleton(country, intent, deviceDecision, services) {
    const primary = services[0];
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

function buildRoleLensOutputs(selectedRole, narrative, country, deviceDecision, services, selectedSegment, intent, exploreGrounding) {
    const primary = services[0];
    const marketName = getCountryName(country.countryCode);
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
            ]
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
            ]
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
            ]
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
                    ${renderLensPanel(lens, payload)}
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

function renderLensPanel(lens, payload) {
    return `
        <section class="output-block hero-result">
            <p class="block-index">${t("roleLens")}</p>
            <h3>${escapeHtml(lens.title)}</h3>
            <p>${escapeHtml(lens.subtitle)}</p>
            <p><strong>${currentLocale === "ko" ? "목표" : "Objective"}:</strong> ${escapeHtml(lens.objective || "")}</p>
            <p><strong>${currentLocale === "ko" ? "핵심 헤드라인" : "Headline"}:</strong> ${escapeHtml(lens.headline || "")}</p>
            <p>${escapeHtml(lens.message || "")}</p>
            <p class="quote">${escapeHtml(lens.copy)}</p>
        </section>
        <section class="output-grid">
            <div class="output-block">
                <h4>${t("executionPoints")}</h4>
                <ul>${lens.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            </div>
            <div class="output-block">
                <h4>${currentLocale === "ko" ? "활용 패키지" : "Activation Pack"}</h4>
                <p><strong>Asset:</strong> ${escapeHtml(lens.asset || "")}</p>
                <p><strong>CTA:</strong> ${escapeHtml(lens.cta || "")}</p>
                <p><strong>KPI:</strong> ${escapeHtml(lens.kpi || "")}</p>
            </div>
        </section>
        <section class="output-grid">
            <div class="output-block">
                <h4>${currentLocale === "ko" ? "핵심 근거 포인트" : "Proof Points"}</h4>
                <ul>${(lens.proofPoints || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            </div>
            <div class="output-block">
                <h4>${currentLocale === "ko" ? "실행 체크리스트" : "Execution Checklist"}</h4>
                <ul>${(lens.executionChecklist || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            </div>
        </section>
        <section class="output-block">
            <h4>${t("summary")}</h4>
            <p>${escapeHtml(payload.summary)}</p>
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
        segment: segmentSelect.value,
        segmentCustom: segmentCustomInput.value,
        devices: getSelectedDevices()
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
    const countryHelper = stepPanels[1]?.querySelector(".helper");
    const segmentHelper = stepPanels[2]?.querySelector(".helper");
    const deviceLabel = stepPanels[3]?.querySelector("label");
    const deviceHelper = stepPanels[3]?.querySelector(".helper");

    document.querySelector(".eyebrow").textContent = currentLocale === "ko" ? "Interactive Scenario Builder" : currentLocale === "de" ? "Interaktiver Szenario-Builder" : "Interactive Scenario Builder";
    document.querySelector(".hero-text").textContent = currentLocale === "ko"
        ? "질문에 순서대로 답하면 사용자에게 더 매력적으로 다가가는 앱 시나리오를 단계적으로 완성합니다."
        : currentLocale === "de"
            ? "Beantworten Sie die Fragen der Reihe nach und bauen Sie schrittweise ein App-Szenario auf, das für Nutzer attraktiver wirkt."
            : "Answer the questions in sequence and build an app scenario step by step that feels more compelling to users.";
    document.querySelector("#access-screen h2").textContent = currentLocale === "ko" ? "시작하기" : currentLocale === "de" ? "Loslegen" : "Get Started";
    document.querySelector("label[for='access-code']").textContent = t("accessRequired").replace(".", "");
    accessCodeInput.placeholder = t("accessPlaceholder");
    document.querySelector("#access-screen .helper").textContent = t("accessHelper");
    unlockBtn.textContent = t("enterAgent");
    document.querySelector("#guide-screen h2").textContent = t("guideTitle");
    guideYesBtn.textContent = currentLocale === "ko" ? "Yes" : currentLocale === "de" ? "Ja" : "Yes";
    guideNoBtn.textContent = currentLocale === "ko" ? "No" : currentLocale === "de" ? "Nein" : "No";
    guideContinueBtn.textContent = currentLocale === "ko" ? "시작" : currentLocale === "de" ? "Start" : "Start";
    if (!guideCopy.classList.contains("hidden")) {
        guideCopy.innerHTML = buildGuideMarkup();
    }
    document.querySelector("label[for='role']").textContent = t("roleQuestion");
    document.querySelector("label[for='country']").textContent = t("countryQuestion");
    document.querySelector("label[for='segment']").textContent = t("personaQuestion");
    if (deviceLabel) deviceLabel.textContent = t("deviceQuestion");
    purposeInput.placeholder = t("purposePlaceholder");
    cityInput.placeholder = currentLocale === "ko" ? "도시 / 주 / 지역 입력" : currentLocale === "de" ? "Stadt / Bundesland / Region" : "City / State / Region";
    if (countryHelper) countryHelper.textContent = t("countryHelper");
    if (segmentHelper) segmentHelper.textContent = t("personaHelper");
    if (deviceHelper) deviceHelper.textContent = t("deviceHelper");
    prevBtn.textContent = t("prev");
    nextBtn.textContent = t("next");
    generateBtn.textContent = t("build");
    if (!latestPayload) resultDiv.innerHTML = `<p class="placeholder">${t("outputPlaceholder")}</p>`;
    document.querySelector(".report-head h2").textContent = t("output");
    renderExportActions();
}

function renderExportActions() {
    exportActions.innerHTML = `
        <button type="button" class="action-btn" data-export="markdown">${t("downloadMarkdown")}</button>
        <button type="button" class="action-btn" data-export="json">${t("downloadJson")}</button>
        <button type="button" class="action-btn" data-export="html">${t("printPdf")}</button>
        <button type="button" class="action-btn" data-export="copy">${t("copySummary")}</button>
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
    return {
        countryCode: selectedMarket.baseCode,
        countryName: selectedMarket.countryName,
        samsungShopUrl: `https://${DOTCOM_MARKETS.find((item) => item[1] === selectedMarket.siteCode)?.[3] || ""}`,
        availableProducts: sourceData.countries[0]?.availableProducts || []
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

function updateSegmentVisibility() {
    segmentCustomInput.classList.toggle("hidden", segmentSelect.value !== "직접 입력");
}

function getSelectedSegment() {
    if (segmentSelect.value === "직접 입력") {
        return segmentCustomInput.value.trim();
    }
    return segmentSelect.value || "";
}

function getSelectedDevices() {
    return [...deviceGrid.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value);
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
