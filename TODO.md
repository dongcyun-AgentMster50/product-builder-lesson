# SmartThings Scenario Agent — 작업 인계 메모

## 완료된 큰 단계 (2026-04-28 세션)

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

## 최종 SSOT 통합 상태
- A1 (CURATOR): prompt.txt [AGENT:CURATOR_A1] ✅
- A2 (LOCALIZER): prompt.txt [AGENT:LOCALIZER_A2] ✅
- A4 (EXPANDER): prompt.txt [AGENT:EXPANDER_A4] ✅
- Mode2 (COPY_CONSULT_M2): 인라인 (v2.html runCopyConsult) — P8 대기 ⏳
  - prompt.txt [AGENT:COPY_CONSULT_M2] 마커는 P8용으로 보존

## 남은 작업

### P7: Copy Consult 결과 품질 보정 (우선)
- 사용자가 "결과물 수정 필요" 발견 — 다음 세션에서 구체화
- 추정 이슈 (확인 필요):
  - B. Target & Insight 가 카피 원문 무시
  - D. Copy Options 톤 다양성 부족
  - 핵심 단어 미보존
- 작업 위치: prompt.txt Part 5-C 또는 [AGENT:CURATOR_A1] / [AGENT:LOCALIZER_A2] / [AGENT:EXPANDER_A4]
- 예상 시간: 15~30분

### P8: Mode2 Copy Consult 백엔드 마이그레이션 + SSOT 완성
- 현재: v2.html runCopyConsult() 가 callAI 직접 호출
- 목표 1: /api/copy-consult 엔드포인트 신설 (P5 패턴)
- 목표 2: COPY_CONSULT_M2 prompt 를 백엔드 loadAgentPrompt 사용
- 목표 3: callAI() 함수 v2.html 에서 완전 제거
- 효과: SSOT 5/5 달성 (현재 4/5 — Mode2만 인라인)
- 예상 시간: 30~45분

### 후속 정비 후보 (낮은 우선순위)
- GPT-5.5 안정성 검증 (현재 5일 신모델)
- Cloudflare Worker 콜드 스타트 시 27 DB 직렬 fetch
  → prebundle (_summary_index.json 1개) 권장
- rate-limit 추가 (BYOK abuse 방어)
- v1 마이그레이션 (현재 v2만 신규 인프라 사용)
