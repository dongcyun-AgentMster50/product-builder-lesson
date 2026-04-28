# SmartThings Scenario Agent — 작업 인계 메모

## 완료된 큰 단계 (2026-04-28 ~ 2026-04-29 세션)

### 인프라 마이그레이션
- P1: prompt.txt Part 5-C 추가 (mode 헤더 발동)
- P2: generate.js mode 분기 (cx/copy)
- P3: v2 UI 모드 토글 + Mode2 3-step 폼
- P4: 도시 facet 요약 (96% 페이로드 감소)
- 모델 정책: GPT-5.5 / Sonnet 4.6 / Gemini 3.1 Pro 통일

### 백엔드 분리 (v2 BYOK 흐름)
- P5-A: A1 Curator → /api/curate
- P5-B: A2 Localizer → /api/localize
- P5-C: A4 Expander → /api/expand

### SSOT 통합 (CX Mode)
- P6-A: prompt.txt 마커 + 로더 인프라 (functions/api/_prompt_loader.js, server.js loadAgentPromptLocal)
- P6-B-1: A1 인라인 → prompt.txt
- P6-B-2: A2 인라인 → prompt.txt
- P6-B-3: A4 인라인 → prompt.txt
- 정리 단계: A1/A2/A4 인라인 상수 6곳 실제 삭제 완료

### Story Chat (P7-A 라인)
- P7-A-1: STORY_CHAT 마커 + Part 0-source 글로벌 룰
- P7-A-2: /api/story-chat 엔드포인트 (Cloudflare Worker + server.js 미러)
- P7-A-3: js/story-chat.js 백엔드 마이그레이션 (BYOK 키 직접호출 → 백엔드)
- P7-A-4: 모델 ID 정리 + 5곳 동기화 주석 통일
- P7-A-5: sticky bottom storychat-bar UI 리팩터 + 컨텍스트 전환 패턴
- P7-A-5.1: sticky bar 마운트 픽스 (div 위치 + 방어적 폴백)
- P7-A-6: dashboard.html 모달 통합 (JPEG 의존 제거 + 1 스토리 = 1 카드)
  - modal-hero JPEG → compact 헤더 (data-driven)
  - 통합 카드 (placeholder 이미지 + content + cta_label CTA + 채팅 토글)
  - sticky bar dashboard.html 적용 (z-index 1100, modal 위)
  - StoryChat.mount() → mountResponseArea + activate (구 → 신 API)
  - cta_label / cta_type / depth_2_ref 데이터 활용 (지금까지 미사용)
  - 모바일 stack 레이아웃

## 최종 SSOT 통합 상태
- A1 (CURATOR): prompt.txt [AGENT:CURATOR_A1] ✅
- A2 (LOCALIZER): prompt.txt [AGENT:LOCALIZER_A2] ✅
- A4 (EXPANDER): prompt.txt [AGENT:EXPANDER_A4] ✅
- STORY_CHAT: prompt.txt [AGENT:STORY_CHAT] ✅
- Mode2 (COPY_CONSULT_M2): 인라인 (v2.html runCopyConsult) — P8 대기 ⏳
  - prompt.txt [AGENT:COPY_CONSULT_M2] 마커는 P8용으로 보존

## 남은 작업

### P7-A-7: 두 페이지 진입점 통합 (큰 작업, 별도 세션)
- 현재 dashboard.html (대시보드 모달) + scenarios-browse.html (사전 아코디언)
  두 페이지가 같은 27 시나리오 DB 를 다른 UX 로 노출
- IA 재설계 필요 — 어느 한 쪽으로 통합 또는 역할 분리 명확화
- 예상 시간: 1~2시간 (별도 세션 권장)

### P7-A-6 후속
- per-story 이미지 자산 108장 생성 (placeholder → 실제 이미지)
  - `references/scenario_thumbs/_crop.py` 확장 (히어로 1 + 스토리 3 좌표 매핑)
  - 출력: `references/scenario_thumbs/per_story/scenario_NNN_story_M.jpg`
  - dashboard.html `unifiedCardHTML` 의 `.story-card-image` 안에 `<img>` 추가
  - 예상 시간: 좌표 매핑 1~2시간 + 검증 1시간
- depth_2 라우팅 (CTA 버튼 alert → 실제 가이드 페이지)
  - 현재: cta_type / depth_2_ref 가 dataset 으로만 보관, alert 으로만 표시
  - 목표: depth_2 가이드 화면 (단계별 instruction + has_image) 진입로 구현
  - 예상 시간: 30분 ~ 1시간

### P7-B: Copy Consult 결과 품질 보정
- 사용자가 "결과물 수정 필요" 발견 — 다음 세션에서 구체화
- 추정 이슈 (확인 필요):
  - B. Target & Insight 가 카피 원문 무시
  - D. Copy Options 톤 다양성 부족
  - 핵심 단어 미보존
- 작업 위치: prompt.txt Part 5-C 또는 [AGENT:CURATOR_A1] / [AGENT:LOCALIZER_A2] / [AGENT:EXPANDER_A4]
- 예상 시간: 15~30분

### P8: Mode2 Copy Consult 백엔드 마이그레이션 + SSOT 5/5 완성
- 현재: v2.html runCopyConsult() 가 callAI 직접 호출
- 목표 1: /api/copy-consult 엔드포인트 신설 (P5 패턴)
- 목표 2: COPY_CONSULT_M2 prompt 를 백엔드 loadAgentPrompt 사용
- 목표 3: callAI() 함수 v2.html 에서 완전 제거
- 효과: SSOT 5/5 달성 (현재 4/5 — Mode2만 인라인)
- 예상 시간: 30~45분

### 후속 정비 후보 (낮은 우선순위)
- GPT-5.5 안정성 검증 (현재 6일 신모델)
- Cloudflare Worker 콜드 스타트 시 27 DB 직렬 fetch
  → prebundle (_summary_index.json 1개) 권장
- rate-limit 추가 (BYOK abuse 방어)
- v1 마이그레이션 (현재 v2만 신규 인프라 사용)
