# DOAN 개발 TODO

> 뜨개질 도안 편집기 프로젝트 진행 현황

---

## Phase 1: MVP

### 1-1. 프로젝트 초기화

- [x] Next.js 16 + TypeScript + Tailwind CSS 설정
- [x] Vitest + @testing-library 설정
- [x] ESLint 설정
- [x] 폴더 구조 설정 (`src/app`, `components`, `hooks`, `store`, `types`, `constants`, `lib`)
- [x] `KnittingSymbol` 타입 정의 (`src/types/knitting.ts`)
- [x] 대바늘 기호 상수 18개 정의 (`src/constants/knitting-symbols.ts`)
- [x] `cn()` 유틸리티 (`src/lib/utils/cn.ts`)
- [x] 코바늘 기호 상수 추가 (`src/constants/knitting-symbols.ts`)
- [x] `ChartCell`, `ChartPattern`, `PatternMetadata` 타입 정의

### 1-2. 기본 UI 레이아웃

- [x] 에디터 페이지 레이아웃 (`src/app/page.tsx`)
- [x] `Button` 컴포넌트 (`src/components/ui/atoms/Button.tsx`)
- [x] `SymbolButton` 컴포넌트 (`src/components/ui/molecules/SymbolButton.tsx`)
- [x] `EditorSidebar` 컴포넌트 — 기호 팔레트, 그리드 설정 UI (`src/components/editor/EditorSidebar.tsx`)
- [x] `ChartCanvas` 컴포넌트 — placeholder (`src/components/editor/ChartCanvas.tsx`)
- [x] `Input` 컴포넌트 (`src/components/ui/atoms/Input.tsx`) — EditorSidebar의 raw input 대체
- [x] `Option` 컴포넌트 (`src/components/ui/atoms/Option.tsx`) — 선택 상태·disabled 지원, 체크 아이콘
- [x] `Select` 컴포넌트 (`src/components/ui/molecules/Select.tsx`) — shadcn/ui Command 기반, 검색·키보드 지원, EditorSidebar 난이도 선택에 적용
- [x] `GridSizeInput` 컴포넌트 (`src/components/ui/molecules/GridSizeInput.tsx`)
- [x] `Toolbar` 컴포넌트 (`src/components/editor/Toolbar.tsx`) — Undo/Redo (저장·PDF는 사이드바에 배치)
- [x] `EditorSidebar` 리팩터링 — inline input/button을 Atom 컴포넌트로 교체
- [x] `DifficultyStars` 컴포넌트 (`src/components/ui/molecules/DifficultyStars.tsx`) — 별점 UI, 토글 지원
- [x] `Toolbar` 오른쪽 영역에 도안명 표시 — `useChartStore.patternTitle` 연동

### 1-3. 상태 관리 (Zustand)

- [x] `pnpm add zustand` 패키지 설치
- [x] `useChartStore` — 차트 데이터, 그리드 크기, 셀 기호 (`src/store/useChartStore.ts`)
  - [x] `cells` (2D 배열), `gridSize`, `patternType`, `patternTitle` 상태
  - [x] `setCellSymbol`, `setGridSize`, `setPatternType`, `setPatternTitle`, `reset` 액션
- [x] `useUIStore` — 선택된 기호, 모달 상태 (`src/store/useUIStore.ts`)
  - [x] `selectedSymbol`, `isLoadDialogOpen` 상태
  - [x] `setSelectedSymbol`, `openLoadDialog`, `closeLoadDialog` 액션

### 1-4. Konva 캔버스 구현

- [x] `pnpm add konva react-konva` 패키지 설치
- [x] `ChartCanvas` 실제 구현 — `dynamic()` + `ssr: false` 적용
  - [x] Konva Stage / Layer 초기화
  - [x] 격자(Grid) 렌더링 (행/열 선)
  - [x] 셀에 기호 텍스트 렌더링
  - [x] 셀 hover 효과
  - [x] 셀 클릭 시 선택된 기호 적용 (`useCallback` 필수)
  - [x] 드래그로 여러 셀에 기호 적용
  - [x] 줌/팬 기능 (휠 줌, 중간 버튼 팬)
- [x] `useChartEditor` 훅 (`src/hooks/useChartEditor.ts`)
  - [x] `setCellSymbol`, `clearCell`, `resizeGrid` 로직
  - [x] `useChartStore` 연동

### 1-5. 편집 기능

- [x] `useHistory` 훅 — Undo/Redo (`src/hooks/useHistory.ts`)
  - [x] 히스토리 스택 관리
  - [x] `undo`, `redo`, `canUndo`, `canRedo`
- [x] 키보드 단축키 (`useEffect` 기반, `src/app/page.tsx`)
  - [x] `Ctrl+Z`: Undo
  - [x] `Ctrl+Shift+Z` / `Ctrl+Y`: Redo
  - [x] `Ctrl+S`: 저장
- [x] 그리드 크기 변경 시 기존 셀 데이터 유지 로직 (`useChartStore.setGridSize` 내 처리)
- [x] 도안 초기화 기능 (`ConfirmDialog` 컴포넌트 + `useUIStore.isResetDialogOpen`)
- [x] 대칭 모드
  - `useUIStore`에 `isRotationalMode: boolean` 상태 추가
  - 캔버스를 절반으로 분할 — 편집 가능 영역(절반) + 수정 불가 미리보기 영역(나머지 절반)
  - 미리보기 영역: 편집 영역을 중심점 기준 180° 회전한 결과를 반투명 오버레이로 실시간 표시
  - 의류(스웨터, 카디건 등) 좌우 대칭 편물 작업 시 반복 입력 작업 제거
- [x] 영역 선택 & 복사/붙여넣기 (`useChartEditor` 확장, Ctrl+C/V 단축키)
- [x] 중략 기능 — 반복되는 행 범위를 "• • • 중략" 한 줄로 접기 (`CollapsedBlock` 타입, `useChartStore` 확장, Undo/Redo 지원)
- [x] 형태선(Shape Guide) 오버레이 — 목선·진동·소매산 등 반투명 가이드라인 (`KonvaGrid` 레이어 추가)
- [x] 형태선 드래그 그리기 — 마우스 드래그로 형태선 stroke 추가 (`ShapeGuideLayer`, `isShapeGuideDrawMode`)
- [x] 형태선 드래그 지우기 — 지우기 모드에서 드래그 경로와 교차하는 stroke 세그먼트 단위 실시간 삭제
  - `replaceShapeGuideStroke` 액션으로 스트로크 분할 교체
  - `splitStrokeByErasePath` / `splitStrokeByPoint` 헬퍼 함수로 세그먼트 분리
  - `currentEraseStrokeRef`로 stale closure 없이 최신 erase 경로 참조
- [x] 셀에 색상 추가 기능
  - 컬러 피커를 제공해 사용자 정의 색상 지원
  - 툴바에 위치
- [x] 화면 맞추기
  - 캔버스가 화면 밖으로 벗어났을 때 화면으로 이동시키기
  - 화면에 맞게 스케일 적용해서 중앙에 배치
  - F키 단축키 적용
- [x] 주석 시스템
  - [x] Phase1 단 번호 마커: 특정 행 우측/좌측에 "10단", "38단" 표시 + 연결선
  - [x] Phase2 범위 브라켓 주석: 여러 행에 걸친 브라켓 + 멀티라인 텍스트 ("2-1-2 / 2-2-1 / 2코 코막음")
  - [x] Phase3 편집/삭제/Undo 통합: 기존 주석 클릭 → 편집, Undo/Redo 통합
  - [x] Phase4 PDF 통합: 주석 포함 PDF 출력

### 1-6. 저장 및 불러오기

- [x] `localStorage` 유틸리티 (`src/lib/utils/local-storage-service.ts`)
  - [x] 저장 (최대 5개 제한, MVP)
  - [x] 목록 조회
  - [x] 불러오기
  - [x] 삭제
- [x] `usePatterns` 훅 (`src/hooks/usePatterns.ts`)
  - [x] CRUD 인터페이스 제공
  - [x] 자동저장 (debounce 300ms)
- [x] `LoadDialog` 컴포넌트 (`src/components/editor/LoadDialog.tsx`)

### 1-7. PDF 내보내기

- [x] `pnpm add jspdf html2canvas` 패키지 설치
- [x] PDF 내보내기 유틸리티 (`src/lib/utils/export-pdf.ts`)
  - [x] 캔버스 → 이미지 변환 (Konva Stage.toDataURL)
  - [x] A4 / Letter 크기 지원
  - [x] 도안 제목, 난이도, 실 종류 헤더 포함
  - [x] 다운로드 트리거
- [x] `PdfPreview` 컴포넌트 (`src/components/pdf/PdfPreview.tsx`)
- [x] `usePdfExport` 훅 (`src/hooks/usePdfExport.ts`) — `dynamic()` lazy import

---

## Phase 2: 클라우드 / 인증 (미시작)

### 2-1. Supabase 프로젝트 설정

- [x] Supabase 프로젝트 생성 및 URL / anon key 수집
- [x] `.env.local` 환경변수 구성
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] 브라우저용 Supabase 클라이언트 (`src/lib/supabase/client.ts`)
- [x] SSR용 Supabase 서버 클라이언트 (`src/lib/supabase/server.ts`) — `@supabase/ssr` 사용
- [x] 미들웨어 세션 갱신 유틸 (`src/lib/supabase/middleware.ts`)

### 2-2. OAuth 공급자 설정 (외부 콘솔)

- [ ] **Google OAuth**
  - Google Cloud Console에서 OAuth 2.0 Client ID / Secret 발급
  - Supabase Dashboard → Authentication → Providers → Google 활성화
  - Authorized redirect URI: `{SUPABASE_URL}/auth/v1/callback` 등록
- [ ] **Kakao OAuth**
  - Kakao Developers에서 앱 생성, REST API 키 / Client Secret 발급
  - 카카오 로그인 활성화 + Redirect URI 등록
  - Supabase Dashboard → Authentication → Providers → Kakao 활성화

### 2-3. 인증 라우트 & 미들웨어

- [ ] 인증 콜백 라우트 (`src/app/auth/callback/route.ts`)
  - OAuth 인가 코드를 세션으로 교환 (`exchangeCodeForSession`)
  - 성공 시 `/` 리다이렉트, 실패 시 `/login?error=...` 리다이렉트
- [ ] 로그아웃 라우트 (`src/app/auth/signout/route.ts`)
  - `supabase.auth.signOut()` 후 `/login` 리다이렉트
- [ ] Next.js 라우팅 프록시 (`src/proxy.ts`) 업데이트 — 기존 CSP 핸들러에 Supabase 세션 갱신 통합
  - 모든 요청에서 `updateSession` 호출
  - 미인증 사용자의 `/` 접근 시 `/login` 리다이렉트
  - 인증된 사용자의 `/login` 접근 시 `/` 리다이렉트

### 2-4. 로그인 페이지 & 인증 UI

- [ ] 로그인 페이지 (`src/app/login/page.tsx`)
  - Google 로그인 버튼
  - 카카오 로그인 버튼
  - 에러 메시지 표시 (쿼리 파라미터 `?error=`)
- [ ] `SocialLoginButton` Atom (`src/components/ui/atoms/SocialLoginButton.tsx`)
  - `provider: 'google' | 'kakao'` prop
  - 각 브랜드 아이콘 + 레이블 ("Google로 계속하기", "카카오로 계속하기")
  - 테스트: `SocialLoginButton.test.tsx`
- [ ] `UserMenu` Molecule (`src/components/ui/molecules/UserMenu.tsx`)
  - 사용자 아바타(이니셜 또는 프로필 이미지), 이름/이메일 표시
  - 로그아웃 버튼
  - 테스트: `UserMenu.test.tsx`
- [ ] `Toolbar` 업데이트 — 우측에 `UserMenu` 추가

### 2-5. 사용자 상태 관리

- [ ] `useUserStore` Zustand 스토어 (`src/store/useUserStore.ts`)
  - 상태: `user: User | null`, `isLoading: boolean`
  - 액션: `setUser`, `clearUser`, `reset`
  - 테스트: `useUserStore.test.ts`
- [ ] `useAuth` 훅 (`src/hooks/useAuth.ts`)
  - `signInWithGoogle()`, `signInWithKakao()`, `signOut()` 액션
  - `getSession()` — 현재 세션 조회 후 `useUserStore` 동기화
  - `onAuthStateChange` 리스너 등록 (컴포넌트 마운트 시)
  - 테스트: `useAuth.test.ts` (MSW로 Supabase Auth 모킹)

### 2-6. DB 스키마 & RLS

- [ ] `patterns` 테이블 SQL 스키마 (`supabase/migrations/001_create_patterns.sql`)
  - `id uuid primary key default gen_random_uuid()`
  - `user_id uuid references auth.users not null`
  - `title text not null`
  - `data jsonb not null` — ChartPattern 직렬화
  - `created_at / updated_at timestamptz`
- [ ] RLS 정책 설정 — SELECT / INSERT / UPDATE / DELETE 모두 `auth.uid() = user_id`
- [ ] Supabase 타입 자동 생성 — `supabase gen types typescript --local > src/types/supabase.ts`

### 2-7. 도안 API & 훅 업데이트

- [ ] `patterns-api.ts` 구현 (`src/lib/api/patterns-api.ts`)
  - `fetchPatterns(userId)` — 목록 조회
  - `savePattern(pattern)` — upsert
  - `deletePattern(id)` — 삭제
  - 테스트: `patterns-api.test.ts` (MSW 모킹)
- [ ] `usePatterns` 훅 업데이트 (`src/hooks/usePatterns.ts`) — localStorage → Supabase API 교체
- [ ] 로컬 → 클라우드 마이그레이션 유틸 (`src/lib/utils/migrate-to-cloud.ts`)
  - 로컬스토리지 도안을 Supabase에 일괄 업로드
  - 로그인 직후 자동 실행 (중복 방지 플래그 포함)
