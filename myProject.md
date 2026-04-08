# Product Builder Lesson — 사용 기술 스택 정리

## 런타임 & 언어

| 기술 | 용도 |
|------|------|
| **Node.js** | 서버(`server.js`) 실행 런타임. API 프록시, 정적 파일 서빙, 세션 관리 |
| **Vanilla JavaScript** | 프론트엔드(`main.js`) + 서버 전체. 프레임워크 없이 순수 JS로 작성 |
| **HTML / CSS** | `index.html` + `style.css` — 메인 UI 렌더링 |

## npm 패키지 (dependencies)

| 패키지 | 용도 |
|--------|------|
| **puppeteer-core** | 헤드리스 브라우저 제어. 시나리오 결과를 PDF/이미지로 캡처하거나 웹 스크래핑에 사용 |
| **xlsx** | 엑셀 파일(.xlsx) 읽기/쓰기. 기기 목록이나 데이터를 엑셀로 처리할 때 사용 |

## Node.js 내장 모듈

| 모듈 | 용도 |
|------|------|
| **http** | 자체 HTTP 서버 구동 (Express 없이 직접 구현) |
| **https** | OpenAI API 등 외부 API 호출 |
| **fs** | 파일 읽기/쓰기 (access-codes.json, 정적 파일 서빙 등) |
| **path** | 파일 경로 처리 |
| **crypto** | 세션 토큰 생성, 액세스 코드 해싱 (HMAC) |

## 외부 API

| 서비스 | 용도 |
|--------|------|
| **OpenAI API** | 시나리오 생성, 지역 인사이트, 도시 프로필, 넛지 등 AI 기반 콘텐츠 생성의 핵심 엔진 |

## 서버리스 / 엣지 (functions/api/)

| 파일 | 용도 |
|------|------|
| **generate.js** | 시나리오 생성 API 엔드포인트 |
| **region-insight.js** | 지역별 인사이트 생성 |
| **city-profile.js** | 도시 프로필 데이터 |
| **nudge.js** | AI 넛지 메시지 |
| **refine.js** | 시나리오 리파인 |
| **_shared_ai.js** | AI 호출 공통 로직 |

> `functions/api/` 구조는 **Cloudflare Pages Functions** 배포 컨벤션입니다.

## 유틸리티 스크립트

| 스크립트 | 용도 |
|----------|------|
| **generate-access-hash.mjs** | 액세스 코드 HMAC 해시 생성 |
| **generate-dotcom-matrices.mjs** | Samsung.com 매트릭스 데이터 생성 |

---

**요약**: 프레임워크 없이 **순수 JS + Node.js 서버 + OpenAI API**로 돌아가는 비교적 가벼운 구조입니다. npm 패키지는 `puppeteer-core`(브라우저 자동화)와 `xlsx`(엑셀 처리) 딱 2개만 사용합니다.
