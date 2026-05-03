# SmartThings Scenario Agent — 인계 문서

> 본 문서는 다음 세션의 새 Claude가 즉시 작업에 진입할 수 있도록 작성된 핸드오프.
> Part A (1~7): 프로젝트 컨텍스트 — 다음 세션 시작 시 먼저 읽을 것.
> Part B: 작업 메모 — 완료 이력 + 남은 작업 리스트.

---

## Part A — 프로젝트 컨텍스트

### 1) 한 줄 요약

Samsung SmartThings의 27개 일상 시나리오를 마케터가 BYOK 키로 AI 변형/확장할 수 있는 web app.
v1 (Q1~Q4 위저드) + v2 (CX/Copy Mode) + Story Chat (시나리오 사전) 3개 모드 운영 중.

#### 핵심 파일 지도
- `prompt.txt` — 모든 Agent의 시스템 프롬프트 SSOT
- `functions/api/_provider.js` — 모델 정책 (DEFAULT_MODELS) SSOT
- `functions/api/curate.js` / `localize.js` / `expand.js` / `story-chat.js` / `copy-consult.js` — 백엔드 엔드포인트 5개
- `server.js` — 로컬 dev 미러 (각 백엔드 핸들러 포함)
- `js/story-chat.js` — Story Chat 프론트엔드 (sticky bar 인프라)
- `v2.html` — v2 메인 (CX Mode + Copy Mode, callAI 인프라 제거 완료)
- `scenarios-browse.html` — 27 시나리오 텍스트 카탈로그 + sticky bar
- `dashboard.html` — 27 시나리오 이미지 그리드 + 모달 + sticky bar
- `index.html` — v1 위저드 (절대 안 만짐, 의도된 보존)

---

### 2) 현재 작동 흐름

#### 진입점
- `/` → `index.html` (v1 위저드)
- `/v2.html` → v2 (CX Mode 5단계 또는 Copy Mode 3단계)
- `/scenarios-browse` → 27 시나리오 텍스트 카탈로그
- `/dashboard` → 27 시나리오 이미지 그리드

#### Story Chat 흐름
`scenarios-browse` 또는 `dashboard` → 시나리오 카드 → 스토리 선택
→ sticky bar에서 채팅 → `/api/story-chat` 호출
→ `prompt.txt [AGENT:STORY_CHAT]`이 시스템 프롬프트
→ 일반인용 + 마케터용 동시 응답

#### v2 CX Mode 흐름
`v2.html` 5단계 입력 → `/api/curate` (A1) → `/api/localize` (A2)
→ `/api/expand` (A4) → 6섹션 결과

#### v2 Copy Mode 흐름
`v2.html` 3단계 입력 → `/api/copy-consult` (COPY_CONSULT_M2) → 6섹션 마크다운 응답

---

### 3) SSOT 통합 현황 — 5/5 달성 ✅

| Agent | 위치 | 상태 |
| --- | --- | --- |
| A1 (CURATOR) | `prompt.txt [AGENT:CURATOR_A1]` | ✅ |
| A2 (LOCALIZER) | `prompt.txt [AGENT:LOCALIZER_A2]` | ✅ |
| A4 (EXPANDER) | `prompt.txt [AGENT:EXPANDER_A4]` | ✅ |
| Story Chat | `prompt.txt [AGENT:STORY_CHAT]` | ✅ |
| Mode2 Copy Consult | `prompt.txt [AGENT:COPY_CONSULT_M2]` | ✅ (P8 완료, `be78748`) |

#### 글로벌 룰
- `prompt.txt ## Part 0-source` — 출처 표기 글로벌 룰 (모든 Agent에 적용)

---

### 4) 모델 정책

#### DEFAULT_MODELS (5곳 미러)
- `openai`: `gpt-5.5`
- `anthropic`: `claude-sonnet-4-6`
- `gemini`: `gemini-3.1-pro-preview`

#### 미러 위치
1. `functions/api/_provider.js` — SSOT
2. `server.js` `V2_DEFAULT_MODELS`
3. `v2.html` `V2_DEFAULT_MODELS` + `V2_MODEL_LABELS`
4. `js/story-chat.js` `V2_MODEL_LABELS` + `PROVIDER_LABEL`

변경 시 5곳 동시 갱신 (각 파일에 동기화 주석 있음).

---

### 5) v1 fallback (의도된 보존, 만지지 마라)

다음은 v1 흐름이라 `gpt-4o` / `gpt-4o-mini` / `gemini-2.5-flash` 사용. 의도된 보존이며 변경 금지.

- `generate.js`: line 364, 373 (mode 미전달 path)
- `region-insight.js`: line 270
- `refine.js`: line 121
- `nudge.js`: line 112
- `city-profile.js`: line 642
- `server.js`: line 333, 913, 1490

---

### 6) 검증 완료된 패턴 (재사용 가능)

#### 백엔드 엔드포인트 패턴 (P5/P8)
`curate.js` / `localize.js` / `expand.js` / `story-chat.js` / `copy-consult.js` 모두 동일 구조:
- `resolveProviderKey` + `DEFAULT_MODELS`
- `loadAgentPrompt(env, "AGENT_NAME")`
- `try/catch` `PROMPT_LOAD_FAILED` 500
- `maskKey` 로깅 + 응답 직후 폐기

#### GPT-5 호환 OpenAI 호출 패턴 (P8 회귀 픽스)
GPT-5 계열은 `temperature=1` (default) 만 지원. 명시 시 `Unsupported value` 에러.
모든 `callOpenAI*` 함수 (functions/api 5곳 + server.js 5곳, 총 10곳) 통일:
```js
const requestBody = { model, messages, /* json 모드: response_format */ };
if (/^gpt-5/i.test(String(model || "").trim())) {
    requestBody.max_completion_tokens = N;
} else {
    requestBody.max_tokens = N;
    requestBody.temperature = 0.7;
}
```

#### sticky bar 패턴 (P7-A-5)
- `<div id="global-storychat-bar">` (script 앞에 위치)
- `StoryChat.mountInputBar(container)` — 1회 호출
- `StoryChat.mountResponseArea(mount, no, M)` — 카드별
- `StoryChat.activate(no, M, scenario, story)` — 토글 시
- `StoryChat.deactivate()` — 닫기 시
- `StoryChat.refreshAllToggles()` — 상태 변화 시

#### 자동 크롭 패턴 (P7-A-6-2)
- `references/scenario_thumbs/_crop_per_story.py`
- PIL + numpy로 image block + white gap 검출

---

### 7) 다음 세션 진입점 (첫 메시지 템플릿)

#### Option A — P7-B (Copy 품질 보정, 권장 후속)
```
SmartThings Scenario Agent 이어가자.
TODO.md의 P7-B 진행.
[AGENT:COPY_CONSULT_M2]의 B/D 섹션 출력 품질 보정.
P8 완료로 백엔드 마이그레이션은 끝났고 이제 프롬프트 튜닝 단계.
구체적 이슈는 라이브에서 확인하고 정함.
```

#### Option B — P7-A-6 후속 (per-story 이미지 108장 + depth_2 라우팅)
```
SmartThings Scenario Agent 이어가자.
TODO.md의 P7-A-6 후속 진행.
references/scenario_thumbs/_crop.py 좌표 매핑 확장 → 108장 자동 생성
+ dashboard.html unifiedCardHTML 의 .story-card-image 에 <img> 부착.
이어서 cta_type/depth_2_ref 라우팅 (현재 alert → 가이드 페이지).
```

#### Option C — P7-A-7 (두 페이지 IA 통합, 큰 작업)
```
SmartThings Scenario Agent IA 재설계 시작.
현재 dashboard.html (이미지) + scenarios-browse.html (텍스트)
두 페이지가 같은 27 시나리오를 다른 방식으로 보여주는 중복.
통합 vs 역할 분리 결정 필요.
이건 한 세션에 안 끝날 수 있음. 분석부터 시작.
```

---

## Part B — 작업 메모

### 완료된 큰 단계 (2026-04-28 ~ 2026-05-03)

#### 인프라 마이그레이션
- P1: `prompt.txt` Part 5-C 추가 (mode 헤더 발동)
- P2: `generate.js` mode 분기 (cx/copy)
- P3: v2 UI 모드 토글 + Mode2 3-step 폼
- P4: 도시 facet 요약 (96% 페이로드 감소)
- 모델 정책: GPT-5.5 / Sonnet 4.6 / Gemini 3.1 Pro 통일

#### 백엔드 분리 (v2 BYOK 흐름)
- P5-A: A1 Curator → `/api/curate`
- P5-B: A2 Localizer → `/api/localize`
- P5-C: A4 Expander → `/api/expand`

#### SSOT 통합 (CX Mode)
- P6-A: `prompt.txt` 마커 + 로더 인프라 (`functions/api/_prompt_loader.js`, `server.js loadAgentPromptLocal`)
- P6-B-1: A1 인라인 → `prompt.txt`
- P6-B-2: A2 인라인 → `prompt.txt`
- P6-B-3: A4 인라인 → `prompt.txt`
- 정리 단계: A1/A2/A4 인라인 상수 6곳 실제 삭제 완료

#### Story Chat (P7-A 라인)
- P7-A-1: STORY_CHAT 마커 + Part 0-source 글로벌 룰
- P7-A-2: `/api/story-chat` 엔드포인트 (Cloudflare Worker + `server.js` 미러)
- P7-A-3: `js/story-chat.js` 백엔드 마이그레이션 (BYOK 키 직접호출 → 백엔드)
- P7-A-4: 모델 ID 정리 + 5곳 동기화 주석 통일
- P7-A-5: sticky bottom storychat-bar UI 리팩터 + 컨텍스트 전환 패턴
- P7-A-5.1: sticky bar 마운트 픽스 (div 위치 + 방어적 폴백)
- P7-A-6: `dashboard.html` 모달 통합 (JPEG 의존 제거 + 1 스토리 = 1 카드)
  - `modal-hero` JPEG → compact 헤더 (data-driven)
  - 통합 카드 (placeholder 이미지 + content + `cta_label` CTA + 채팅 토글)
  - sticky bar `dashboard.html` 적용 (z-index 1100, modal 위)
  - `StoryChat.mount()` → `mountResponseArea` + `activate` (구 → 신 API)
  - `cta_label` / `cta_type` / `depth_2_ref` 데이터 활용 (지금까지 미사용)
  - 모바일 stack 레이아웃
- P7-A-6-2: 자동 per-story 크롭 + dashboard 모달 이미지 적용

#### Mode2 백엔드 마이그레이션 (P8) — 2026-05-03 완료, 커밋 `be78748`
- `functions/api/copy-consult.js` 신설 (P5 패턴, COPY_CONSULT_M2 SSOT 로드)
- `v2.html` `callAI()` 함수 + AI CALL ROUTER 섹션 전체 제거
- `runCopyConsult()` 인라인 system/user prompt 제거 → `/api/copy-consult` fetch 전환
- `server.js` 로컬 dev 미러 (`handleCopyConsult` + 4개 헬퍼) 추가
- **GPT-5 temperature 호환성 회귀 픽스** (P8 라이브 검증 중 발견):
  - GPT-5 계열은 `temperature=1` 만 지원, 명시 시 `Unsupported value` 에러
  - 모든 `callOpenAI*` 10곳 통일 패턴 적용 (functions/api 5 + server.js 5)
- **결과**: SSOT 5/5 달성

---

### 남은 작업

#### P7-A-7: 두 페이지 진입점 통합 (큰 작업, 별도 세션)
- 현재 `dashboard.html` (대시보드 모달) + `scenarios-browse.html` (사전 아코디언) 두 페이지가 같은 27 시나리오 DB를 다른 UX로 노출
- IA 재설계 필요 — 어느 한 쪽으로 통합 또는 역할 분리 명확화
- 예상 시간: 1~2시간 (별도 세션 권장)

#### P7-A-6 후속
- per-story 이미지 자산 108장 생성 (placeholder → 실제 이미지)
  - `references/scenario_thumbs/_crop.py` 확장 (히어로 1 + 스토리 3 좌표 매핑)
  - 출력: `references/scenario_thumbs/per_story/scenario_NNN_story_M.jpg`
  - `dashboard.html` `unifiedCardHTML`의 `.story-card-image` 안에 `<img>` 추가
  - 예상 시간: 좌표 매핑 1~2시간 + 검증 1시간
- depth_2 라우팅 (CTA 버튼 alert → 실제 가이드 페이지)
  - 현재: `cta_type` / `depth_2_ref`가 dataset으로만 보관, alert으로만 표시
  - 목표: depth_2 가이드 화면 (단계별 instruction + has_image) 진입로 구현
  - 예상 시간: 30분 ~ 1시간

#### P7-B: Copy Consult 결과 품질 보정
- 사용자가 "결과물 수정 필요" 발견 — 다음 세션에서 구체화
- 추정 이슈 (확인 필요):
  - B. Target & Insight가 카피 원문 무시
  - D. Copy Options 톤 다양성 부족
  - 핵심 단어 미보존
- 작업 위치: `prompt.txt` Part 5-C 또는 `[AGENT:CURATOR_A1]` / `[AGENT:LOCALIZER_A2]` / `[AGENT:EXPANDER_A4]`
- 예상 시간: 15~30분

#### 후속 정비 후보 (낮은 우선순위)
- GPT-5.5 안정성 검증 (현재 6일 신모델)
- Cloudflare Worker 콜드 스타트 시 27 DB 직렬 fetch → prebundle (`_summary_index.json` 1개) 권장
- rate-limit 추가 (BYOK abuse 방어)
- v1 마이그레이션 (현재 v2만 신규 인프라 사용)
