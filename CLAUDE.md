# Product Builder Lesson — Scenario Self Generation Agent

Samsung SmartThings 시나리오 셀프 생성 에이전트. 4단계 위저드(Q1 지역 → Q2 타겟 → Q3 기기 → Build)를 통해 마케팅 시나리오를 자동 생성합니다.

## Tech Stack
- Vanilla JS + CSS (프레임워크 없음)
- Node.js 서버 (server.js) + OpenAI API
- 한국어 우선, 다국어 지원 (8개 언어)

## Key Files
- `index.html` — 메인 UI
- `main.js` — 클라이언트 로직 전체
- `style.css` — 전체 스타일
- `server.js` — API 서버
- `js/constants.js` — Q2 페르소나 그룹, 기기 목록 등 상수

## Conventions
- 커밋 메시지: 한국어 설명 (feat/fix/UI 접두사)
- "커푸" = 커밋 + 푸시 단축어
- SEC=KR 기본 설정, 드롭다운 라벨 통일

## Design Context

### Users
- **삼성전자 마케팅/리테일/브랜드 담당자** — 매장 직원부터 본사 캠페인 기획자까지
- **사용 맥락**: 시나리오 빌드 미팅 직전, 캠페인 기획 시, 또는 고객 응대 준비 중
- **Job to be done**: 복잡한 SmartThings 에코시스템을 고객 생활 맥락에 맞는 설득력 있는 시나리오로 빠르게 변환

### Brand Personality
- **3단어**: Confident · Modern · Premium
- **보이스**: "Confident Explorer" — 대담하고 진정성 있으며, 기술을 의인화하고 결과로 리드
- **감정 목표**: 전문가처럼 느끼기 + 가이드 받는 안심감 + 빠르게 끝내는 효율 + 발견의 재미
- **톤 가이드**: Samsung 공식 verbal guideline 준수 — "AI Home", "AI Living" 용어 사용, 경쟁사 언급 금지

### Aesthetic Direction
- **비주얼 톤**: Samsung.com / SmartThings 앱의 클린하고 프리미엄한 느낌 유지
- **현재 강점**: 다크 히어로 + 라이트 워크스페이스 구조, 4단계 위저드 플로우, 카드 기반 레이아웃
- **개선 필요**: 현재 비주얼이 "촌스러운 AI 느낌" — generic한 그라디언트, 부족한 여백, 정보 밀도 과다
- **Anti-reference**: cyan-on-dark, purple-to-blue gradients, neon accents 등 전형적 AI 미학
- **테마**: 라이트 모드 중심 (다크 히어로 헤더는 유지)

### Design Principles
1. **Samsung Premium First** — 삼성 공식 디자인 랭귀지(클린 라인, 넉넉한 여백, 절제된 컬러)를 기준으로 삼는다
2. **Guided Confidence** — 매 단계마다 사용자가 "잘 하고 있다"는 확신을 주는 시각적 피드백
3. **Breathable Density** — 정보량이 많아도 숨 쉴 공간을 확보한다. Progressive disclosure로 복잡성을 단계적으로 드러냄
4. **Intentional Motion** — 모든 인터랙티브 요소는 의도된 반응을 가진다. 장식적 애니메이션은 배제
5. **Accessible by Default** — WCAG AA 준수, 모바일 우선, 충분한 터치 타겟, 명확한 명암비

### Technical Constraints
- Vanilla JS + CSS (프레임워크 없음)
- 한국어 우선, 다국어 지원 (8개 언어)
- 서버: Node.js + OpenAI API
- 폰트: Malgun Gothic 기반 시스템 폰트 스택
