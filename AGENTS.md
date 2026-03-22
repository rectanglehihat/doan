<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## 1. 기술 스택

### Frontend

- **프레임워크**: Next.js 16+ (App Router)
- **언어**: TypeScript 5.x (strict mode)
- **스타일링**: Tailwind CSS 3.x
- **캔버스/그래픽**: Konva.js (drawing + interactive editing)
- **상태관리**: React Context + zustand (간단한 상태)
- **PDF 생성**: jsPDF + html2canvas
- **폼 관리**: React Hook Form + Zod (validation)
- **TDD**:

### Backend (MVP)

- **런타임**: Node.js 20.x (LTS)
- **저장소**: 로컬 스토리지 (브라우저)
- **API**: Next.js API Routes (PDF 생성용)

### Backend (Phase 2)

- **Database**: Supabase (PostgreSQL)
- **인증**: Supabase Auth
- **File Storage**: Supabase Storage (PDF)

## 2. 프로젝트 구조

```
src/
  app/              # Next.js App Router 페이지 및 레이아웃
  components/       # UI 컴포넌트
    ui/             # 버튼, 인풋 등 기본 UI 빌딩 블록
    editor/         # Konva.js 캔버스 에디터 관련 컴포넌트
    pdf/            # PDF 미리보기·출력 관련 컴포넌트
  hooks/            # 비즈니스 로직을 담은 커스텀 훅
  lib/
    api/            # 모든 API 호출 함수 (이 외에서 fetch 금지)
    utils/          # 순수 유틸리티 함수 (사이드이펙트 없음)
  store/            # Zustand 전역 상태 스토어
  types/            # TypeScript 타입·인터페이스 정의
  constants/        # 앱 전역 상수 (뜨개 기호 목록 등)
```

- 페이지 파일은 `app/` 하위에만 위치
- 컴포넌트 파일은 반드시 해당 도메인 폴더에 배치 (무분류 `components/` 루트 직접 배치 금지)
- 훅은 관련 도메인 이름을 prefix로 사용 (`useEditor*`, `useChart*`, `usePdf*`)

## 3. 코딩 규칙 (Coding Conventions)

### 코드 스타일

- 함수형 컴포넌트만 사용
- TypeScript strict 모드 사용 (`any` 타입 금지)
- named export 사용 (default export 금지)
- 비즈니스 로직은 hooks로 분리
- API 호출은 lib/api에서만 수행
- CSS는 Tailwind 유틸리티 클래스 사용, 커스텀 CSS 파일 금지

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

### TypeScript 규칙

- `strict: true` 필수
- `any` 사용 금지
- 공통 타입은 `/types`에 정의
- 모든 함수는 입력/출력 타입 명시

## 4. 상태 관리 규칙

- **로컬 UI 상태** (모달 open/close, input값 등): `useState` / `useReducer`
- **에디터 전역 상태** (차트 데이터, 선택된 기호, 그리드 크기 등): Zustand 스토어
- **서버/비동기 상태** (Supabase 데이터 fetch): 추후 React Query 도입 전까지 `useEffect` + `useState`
- prop drilling은 2단계까지만 허용, 그 이상은 Zustand로 이동
- Zustand 스토어는 도메인별로 분리 (`chartStore`, `uiStore`, `userStore`)
- 스토어 내 상태 변경은 반드시 스토어 내부 action 함수를 통해서만 수행 (직접 `set` 노출 금지)

## 5. 컴포넌트 설계 원칙

- 컴포넌트 하나는 하나의 역할만 수행 (단일 책임)
- Props 인터페이스는 컴포넌트 함수 위에 별도로 선언
- JSX 내 인라인 함수 정의 금지 → `useCallback`으로 분리
- 조건부 렌더링이 3개 이상이면 별도 컴포넌트로 추출
- Konva.js 등 무거운 컴포넌트는 `dynamic()` + `ssr: false`로 lazy load
- 컴포넌트 파일 길이 200줄 초과 시 분리 검토

## 6. 자주 사용하는 명령어

```bash
pnpm dev          # 개발 서버 실행
pnpm build        # 프로덕션 빌드
pnpm start        # 프로덕션 서버 실행
pnpm lint         # ESLint 검사
pnpm tsc --noEmit # 타입체크 (빌드 없이)
```

- 패키지 설치는 항상 `pnpm add` 사용 (npm/yarn 금지)

## 7. 성능 최적화 규칙

- Konva.js 캔버스 컴포넌트는 `React.memo`로 래핑, 불필요한 리렌더 방지
- 차트 셀 클릭·드래그 핸들러는 `useCallback` 필수 적용
- 그리드 데이터 가공 (필터, 정렬, 변환)은 `useMemo`로 메모이제이션
- PDF 생성 라이브러리(jsPDF, html2canvas)는 `dynamic()` lazy import
- Next.js `Image` 컴포넌트 사용 필수 (`<img>` 태그 직접 사용 금지)
- 필요 시 dynamic import 사용
- Suspense / streaming 적극 활용
- 큰 상수 배열(뜨개 기호 전체 목록 등)은 모듈 최상단에 정의, 렌더 중 생성 금지

## 8. 테스트 & 검증

코드 변경 후 아래 순서로 검증:

1. `pnpm tsc --noEmit` — 타입 에러 없음 확인
2. `pnpm lint` — ESLint 통과 확인
3. `pnpm build` — 빌드 성공 확인 (PR 전 필수)

- 변경된 파일과 직접 연관된 컴포넌트·훅만 수동 검증 (전체 앱 재검증 불필요)
- 타입 에러를 `as`, `!` (non-null assertion)으로 우회 금지 — 근본 원인 수정

## 9. 주의사항

- 코드를 작성하라는 명령을 내리기 전까지 절대 코드를 구현하지 금지
- .env 파일은 절대 커밋 금지
- `any` 타입 사용 시 빌드가 실패하도록 tsconfig strict 설정 유지
- Supabase 키 등 민감한 환경변수는 `NEXT_PUBLIC_` prefix 여부를 반드시 확인 (클라이언트 노출 주의)
- Konva.js는 SSR 비호환 — 서버 컴포넌트에서 직접 import 금지

## 10. AI 작업 가이드

- 기존 코드 스타일을 반드시 따를 것
- 새로운 파일 생성 시 폴더 구조 규칙 준수
- 불필요한 추상화 금지
- 불필요한 의존성 추가 금지
- 성능 최적화 고려
- 코드 작성 전 반드시 관련 파일을 읽고 기존 패턴 파악
- Next.js 16의 변경사항은 `node_modules/next/dist/docs/`에서 확인 후 작성
- 위 규칙 모두 준수
