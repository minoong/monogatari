# Monogatari

두 사람이 함께 방콕 여행을 준비하고 여행 중 필요한 정보를 확인할 수 있는 모바일 우선 웹 앱입니다. Next.js App Router 위에서 Stackflow를 사용해 네이티브 앱과 비슷한 화면 전환을 제공하며, 준비물 데이터는 Supabase와 실시간으로 동기화합니다.

## 주요 기능

- 여행 전·중·후 상태별 홈 화면
- 날짜별 여행 일정표
- 담당자별 준비물 등록, 완료, 삭제 및 재촉
- 준비물 전체/개인별 완료율과 Supabase Realtime 동기화
- 태국어 여행 회화와 음성 인식 UI
- 원화·바트·달러 환율 계산
- 방콕 맛집 및 쇼핑 목록
- 모바일 safe area와 standalone PWA 표시 지원

## 기술 스택

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS v4
- Stackflow 2
- HeroUI v3 및 Base UI 기반 로컬 UI 컴포넌트
- TanStack Query 5
- Supabase Database 및 Realtime
- Framer Motion, Motion, GSAP
- npm

## 시작하기

### 요구 사항

- Node.js 20 이상
- npm
- Supabase 프로젝트

### 환경변수

프로젝트 루트에 `.env.local`을 만들고 다음 값을 설정합니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

브라우저에서도 같은 Supabase 클라이언트를 사용하므로 `preparation_items`와 `exchange_rates` 테이블의 Row Level Security 정책을 반드시 환경에 맞게 구성해야 합니다. 애플리케이션 코드에는 별도의 인증 계층이 아직 없습니다.

### 설치 및 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 앱을 확인할 수 있습니다.

프로덕션 검증과 실행:

```bash
npm run lint
npm run build
npm run start
```

## 프로젝트 구조

```text
app/
  api/checklist/       준비물 CRUD 및 재촉 API
  globals.css          Tailwind, HeroUI, 앱 디자인 토큰
  layout.tsx           폰트, 메타데이터, QueryProvider, Toaster
  page.tsx             Stackflow 앱 진입점
activities/            Stackflow 화면 단위 기능
components/
  checklist/           준비물 등록 Drawer
  providers/           전역 React Provider
  ui/                  Base UI 기반 로컬 UI 컴포넌트
  stackflow.ts         Activity 등록 및 Stackflow 설정
hooks/                 공용 React 훅
lib/                   Supabase 클라이언트와 공용 유틸리티
```

## 화면 구조

`app/page.tsx`가 Stackflow의 `Stack`을 렌더링하고, `components/stackflow.ts`가 다음 Activity를 등록합니다.

- `HomeActivity`: 여행 상태별 대시보드
- `ScheduleActivity`: 일정 타임라인
- `ChecklistActivity`: 준비물 목록과 진행률
- `DictionaryActivity`: 태국어 회화
- `ExchangeActivity`: 환율 계산기
- `DiscoverActivity`: 맛집 및 쇼핑 목록

하단 탭은 `BottomNav`에서 Stackflow의 `replace`를 사용해 주요 Activity 사이를 이동합니다.

## 준비물 데이터

`preparation_items` 레코드는 현재 코드에서 다음 필드를 사용합니다.

| 필드 | 용도 |
| --- | --- |
| `id` | 준비물 식별자 |
| `title` | 준비물 이름 |
| `type` | `master` 또는 `personal` |
| `assignees` | 담당자 ID 배열 |
| `completed_by` | 완료한 사용자 ID 배열 |
| `importance` | `high`, `normal`, `low` |
| `created_at` | 목록 정렬 기준 |

`GET`, `POST`, `PATCH`, `DELETE /api/checklist`가 CRUD를 담당합니다. `POST /api/checklist/nudge`는 현재 실제 푸시를 보내지 않고 1초 뒤 성공을 반환하는 mock API입니다.

Supabase Realtime을 사용하려면 `preparation_items` 테이블의 Postgres Changes 구독이 활성화되어 있어야 합니다.

## UI 사용 기준

- 새 폼과 접근 가능한 입력 컴포넌트는 HeroUI v3를 우선합니다.
- HeroUI API는 `@heroui/react-mcp` 문서를 기준으로 확인합니다.
- 전역 CSS에서는 반드시 Tailwind 다음에 HeroUI 스타일을 불러옵니다.

```css
@import "tailwindcss";
@import "@heroui/styles";
```

- 앱에 이미 존재하는 Drawer, Toast, Dynamic Island 등은 `components/ui` 구현을 사용합니다.
- 새로운 UI 라이브러리를 추가하기 전에 기존 HeroUI 또는 로컬 컴포넌트로 해결 가능한지 확인합니다.

## 현재 제약 사항

- 인증 및 사용자 권한 검사가 아직 없습니다.
- API 요청 body에 런타임 스키마 검증이 없습니다.
- 일정, 회화, 홈, 발견 화면의 대부분은 정적 데모 데이터입니다.
- 재촉 API는 mock 구현입니다.
- 자동화 테스트가 아직 없습니다.

우선순위 작업은 [TASKS.md](./TASKS.md), 확인된 문제는 [BUGS.md](./BUGS.md)를 참고하세요.
