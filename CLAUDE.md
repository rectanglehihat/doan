# DOAN

Next.js 16 기반의 뜨개질 도안 편집기 프로덕션 애플리케이션입니다.
목표는 @AGENTS.md를 참조하여 **일관되고 확장 가능한, 유지보수 가능한 코드**를 생성하는 것입니다.

---

## 1. 절대 규칙

> 아래 규칙은 예외 없이 반드시 준수한다. 위반 시 코드 작성을 중단하고 사용자에게 알린다.

- **명시적 지시 전까지 코드 구현 금지** — 코드를 작성하라는 명령을 내리기 전까지 절대 구현하지 않는다.
- **컴포넌트·훅·유틸 구현 전 테스트 파일 먼저 작성** — TDD(Red → Green → Refactor) 원칙을 준수한다. 테스트 없이 구현을 시작하지 않는다.
- **`.env` 파일 커밋 금지** — 환경변수 파일은 어떤 경우에도 커밋하지 않는다.
- **`any` 타입 금지** — TypeScript strict 모드를 유지하며, `any`를 사용하면 빌드가 실패한다.
- **타입 우회 금지** — `as`, `!` (non-null assertion)으로 타입 에러를 우회하지 않는다. 근본 원인을 수정한다.
- **`default export` 금지** — 모든 컴포넌트·함수는 named export만 사용한다.
- **`components/` 루트 직접 배치 금지** — 컴포넌트는 반드시 `ui/atoms/`, `ui/molecules/`, `editor/`, `pdf/` 중 하나에 배치한다.
- **Konva.js 서버 컴포넌트 import 금지** — SSR 비호환 라이브러리는 반드시 `dynamic()` + `ssr: false`로 처리한다.
- **JSX 인라인 함수 금지** — 이벤트 핸들러는 `useCallback`으로 분리한다.
- **Supabase 키 클라이언트 노출 주의** — 민감한 환경변수의 `NEXT_PUBLIC_` prefix 여부를 반드시 확인한다.
- **패키지 설치는 `pnpm add`만 사용** — npm, yarn 금지.

---

## 2. 아키텍처

### 기술 스택

| 구분          | 기술                                     |
| ------------- | ---------------------------------------- |
| 프레임워크    | Next.js 16+ (App Router)                 |
| 언어          | TypeScript 5.x (strict mode)             |
| 스타일링      | Tailwind CSS 3.x                         |
| 캔버스/그래픽 | Konva.js (drawing + interactive editing) |
| 상태관리      | React Context + Zustand                  |
| PDF 생성      | jsPDF + html2canvas                      |
| 폼 관리       | React Hook Form + Zod                    |
| 테스트        | Vitest + @testing-library/react + jsdom  |
| DB (Phase 2)  | Supabase (PostgreSQL + Auth + Storage)   |

### 폴더 구조

```
src/
  app/              # Next.js App Router 페이지·레이아웃 (Template / Page 계층)
  components/       # UI 컴포넌트 (Atomic Design)
    ui/
      atoms/        # 최소 단위 UI — store 참조 금지 (Button, Input, Icon, Badge 등)
      molecules/    # Atom 조합 단위 — store 참조 금지 (SymbolButton, GridSizeInput 등)
    editor/         # Organism — 에디터 도메인 기능 블록 (ChartGrid, SymbolPicker, Toolbar 등)
    pdf/            # Organism — PDF 도메인 기능 블록 (PdfPreview 등)
  hooks/            # 비즈니스 로직 커스텀 훅
  lib/
    api/            # 모든 API 호출 함수 (이 외에서 fetch 금지)
    utils/          # 순수 유틸리티 함수 (사이드이펙트 없음)
  store/            # Zustand 전역 상태 스토어
  types/            # TypeScript 타입·인터페이스 정의
  constants/        # 앱 전역 상수 (뜨개 기호 목록 등)
```

- 페이지 파일은 `app/` 하위에만 위치
- 훅은 도메인 이름을 prefix로 사용 (`useEditor*`, `useChart*`, `usePdf*`)
- 컴포넌트 상세 규칙 → @src/components/CLAUDE.md

---

## 3. 빌드/테스트

### 개발 명령어

```bash
pnpm dev          # 개발 서버 실행
pnpm build        # 프로덕션 빌드
pnpm start        # 프로덕션 서버 실행
pnpm lint         # ESLint 검사
pnpm tsc --noEmit # 타입체크 (빌드 없이)
pnpm test         # 단위·통합 테스트 실행
```

### 코드 변경 후 검증 순서

1. `pnpm test` — 단위·통합 테스트 전체 통과 확인
2. `pnpm tsc --noEmit` — 타입 에러 없음 확인
3. `pnpm lint` — ESLint 통과 확인
4. `pnpm build` — 빌드 성공 확인 (PR 전 필수)

- 변경된 파일과 직접 연관된 컴포넌트·훅만 수동 검증 (전체 앱 재검증 불필요)
- TDD 전략 및 레이어별 테스트 작성 방법 → @docs/TDD.md

---

## 4. 도메인 컨텍스트

이 앱은 **뜨개질 도안 편집기**입니다.

- **차트(Chart)**: 뜨개 기호가 배치된 그리드. 행(row)·열(column) 단위로 구성.
- **셀(Cell)**: 그리드의 최소 단위. 뜨개 기호 하나가 배치되는 공간.
- **기호(Symbol)**: 대바늘/코바늘 뜨개 기호. `KnittingSymbol` 타입으로 정의.
- **팔레트(Palette)**: 사용자가 선택할 수 있는 기호 목록 UI.
- **PDF 내보내기**: 완성된 도안을 PDF로 출력하는 기능.

### 상태 관리 규칙

- **로컬 UI 상태** (모달 open/close, input 값 등): `useState` / `useReducer`
- **에디터 전역 상태** (차트 데이터, 선택된 기호, 그리드 크기 등): Zustand 스토어
- **서버/비동기 상태** (Supabase fetch): `useEffect` + `useState` (추후 React Query 도입)
- prop drilling은 2단계까지만 허용, 그 이상은 Zustand로 이동
- Zustand 스토어는 도메인별로 분리 (`chartStore`, `uiStore`, `userStore`)
- 스토어 내 상태 변경은 반드시 스토어 내부 action 함수를 통해서만 수행 (직접 `set` 노출 금지)

---

## 5. 코딩 컨벤션

### 네이밍

| 대상               | 규칙                               | 예시                                                   |
| ------------------ | ---------------------------------- | ------------------------------------------------------ |
| 컴포넌트 파일·함수 | PascalCase                         | `KnittingChart.tsx`, `export function KnittingChart()` |
| 훅                 | camelCase + `use` prefix           | `useChartEditor.ts`                                    |
| 유틸·API 파일      | kebab-case                         | `export-pdf.ts`, `chart-api.ts`                        |
| Zustand 스토어     | camelCase + `use` + `Store` suffix | `useChartStore.ts`                                     |
| 타입·인터페이스    | PascalCase, 설명적 접미사          | `ChartCell`, `KnittingPattern`, `PdfOptions`           |
| 상수 (원시값)      | SCREAMING_SNAKE_CASE               | `MAX_GRID_SIZE`, `DEFAULT_CELL_SIZE`                   |
| 상수 (객체·배열)   | camelCase                          | `knittingSymbols`, `defaultChartConfig`                |
| 이벤트 핸들러 prop | `on` prefix                        | `onCellClick`, `onExportPdf`                           |
| 이벤트 핸들러 함수 | `handle` prefix                    | `handleCellClick`, `handleExportPdf`                   |

### TypeScript

- `strict: true` 필수
- 공통 타입은 `src/types/`에 정의
- 모든 함수는 입력/출력 타입 명시

### 성능 최적화

- Konva.js 캔버스 컴포넌트: `React.memo` 래핑 필수
- 셀 클릭·드래그 핸들러: `useCallback` 필수
- 그리드 데이터 가공(필터, 정렬, 변환): `useMemo` 적용
- PDF 라이브러리(jsPDF, html2canvas): `dynamic()` lazy import
- `<img>` 태그 직접 사용 금지 → Next.js `Image` 컴포넌트 사용
- 큰 상수 배열(기호 목록 등): 모듈 최상단에 정의, 렌더 중 생성 금지
- Suspense / streaming 적극 활용

### AI 작업 가이드

- 코드 작성 전 반드시 관련 파일을 읽고 기존 패턴 파악
- 새로운 파일 생성 시 폴더 구조 규칙 준수
- 불필요한 추상화·의존성 추가 금지
- Next.js 16 변경사항은 `node_modules/next/dist/docs/`에서 확인 후 작성
