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
  - [x] `selectedSymbol`, `isSaveDialogOpen`, `isLoadDialogOpen` 상태
  - [x] `setSelectedSymbol`, `openSaveDialog`, `closeSaveDialog`, `openLoadDialog`, `closeLoadDialog` 액션

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
- [x] 대칭 모드 (가로/세로 대칭 자동 적용, `useUIStore.symmetryMode`)
- [ ] 대칭 모드 (점대칭/회전 대칭)
  - `useUIStore`에 `isRotationalMode: boolean` 상태 추가
  - 캔버스를 절반으로 분할 — 편집 가능 영역(절반) + 수정 불가 미리보기 영역(나머지 절반)
  - 미리보기 영역: 편집 영역을 중심점 기준 180° 회전한 결과를 반투명 오버레이로 실시간 표시
  - 의류(스웨터, 카디건 등) 좌우 대칭 편물 작업 시 반복 입력 작업 제거
- [x] 영역 선택 & 복사/붙여넣기 (`useChartEditor` 확장, Ctrl+C/V 단축키)
- [ ] 단 반복 블록 마커 — 행 범위 + "N회 반복" 레이블 (`ChartPattern` 타입 확장, PDF 연동)
- [x] 형태선(Shape Guide) 오버레이 — 목선·진동·소매산 등 반투명 가이드라인 (`KonvaGrid` 레이어 추가)
- [x] 형태선 드래그 그리기 — 마우스 드래그로 형태선 stroke 추가 (`ShapeGuideLayer`, `isShapeGuideDrawMode`)
- [x] 형태선 드래그 지우기 — 지우기 모드에서 드래그 경로와 교차하는 stroke 세그먼트 단위 실시간 삭제
  - `replaceShapeGuideStroke` 액션으로 스트로크 분할 교체
  - `splitStrokeByErasePath` / `splitStrokeByPoint` 헬퍼 함수로 세그먼트 분리
  - `currentEraseStrokeRef`로 stale closure 없이 최신 erase 경로 참조

### 1-6. 저장 및 불러오기

- [ ] `localStorage` 유틸리티 (`src/lib/utils/local-storage-service.ts`)
  - [ ] 저장 (최대 10개 제한)
  - [ ] 목록 조회
  - [ ] 불러오기
  - [ ] 삭제
- [ ] `usePatterns` 훅 (`src/hooks/usePatterns.ts`)
  - [ ] CRUD 인터페이스 제공
  - [ ] 자동저장 (debounce 300ms)
- [ ] `SaveDialog` 컴포넌트 (`src/components/editor/SaveDialog.tsx`)
- [ ] `LoadDialog` 컴포넌트 (`src/components/editor/LoadDialog.tsx`)

### 1-7. PDF 내보내기

- [ ] `pnpm add jspdf html2canvas` 패키지 설치
- [ ] PDF 내보내기 유틸리티 (`src/lib/utils/export-pdf.ts`)
  - [ ] 캔버스 → 이미지 변환
  - [ ] A4 / Letter 크기 지원
  - [ ] 도안 제목, 난이도, 실 종류 헤더 포함
  - [ ] 다운로드 트리거
- [ ] `PdfPreview` 컴포넌트 (`src/components/pdf/PdfPreview.tsx`)
- [ ] `usePdfExport` 훅 (`src/hooks/usePdfExport.ts`) — `dynamic()` lazy import

---

## Phase 2: 클라우드 / 인증 (미시작)

- [ ] Supabase 프로젝트 설정 및 `.env.local` 환경변수 구성
- [ ] Supabase Auth — 이메일/비밀번호 로그인, 회원가입, 로그아웃
- [ ] Supabase DB 스키마 마이그레이션 (`patterns` 테이블, RLS 설정)
- [ ] 로컬 스토리지 → Supabase 마이그레이션 유틸리티
- [ ] 도안 API 연동 (`src/lib/api/patterns-api.ts`)
- [ ] 코바늘 기호 세트 분리 및 팔레트 동적 변경
- [ ] 텍스트 지시문 자동 생성 (Row 1: K2, P1, ...)
- [ ] 패턴 템플릿 라이브러리
- [ ] 도안 공유 링크 생성

---

## 컴포넌트 현황

### Atoms (`src/components/ui/atoms/`)

| 컴포넌트 | 상태   | 테스트 |
| -------- | ------ | ------ |
| `Button` | 완료   | 27개   |
| `Input`  | 완료   | 15개   |
| `Option` | 완료   | 10개   |
| `Icon`   | 미구현 | -      |
| `Badge`  | 미구현 | -      |

### Molecules (`src/components/ui/molecules/`)

| 컴포넌트          | 상태   | 테스트 |
| ----------------- | ------ | ------ |
| `SymbolButton`    | 완료   | 미작성 |
| `Select`          | 완료   | 15개   |
| `GridSizeInput`   | 완료   | 8개    |
| `DifficultyStars` | 완료   | 4개    |
| `ColorPicker`     | 미구현 | -      |
| `ConfirmDialog`   | 완료   | 7개    |

### Organisms (`src/components/editor/`)

| 컴포넌트          | 상태   | 테스트 |
| ----------------- | ------ | ------ |
| `ChartCanvas`     | 완료   | 미작성 |
| `KonvaGrid`       | 완료   | 미작성 |
| `EditorSidebar`   | 완료   | 2개    |
| `ShapeGuideLayer` | 완료   | 7개    |
| `Toolbar`         | 완료   | 23개   |
| `SaveDialog`      | 미구현 | -      |
| `LoadDialog`      | 미구현 | -      |

### Organisms (`src/components/pdf/`)

| 컴포넌트     | 상태   | 테스트 |
| ------------ | ------ | ------ |
| `PdfPreview` | 미구현 | -      |

---

## 테스트 현황

| 레이어                         | 파일                            | 목표 커버리지 | 현재      |
| ------------------------------ | ------------------------------- | ------------- | --------- |
| Atom — `Button`                | `Button.test.tsx`               | 90%           | 27개 작성 |
| Atom — `Input`                 | `Input.test.tsx`                | 90%           | 15개 작성 |
| Atom — `Option`                | `Option.test.tsx`               | 90%           | 10개 작성 |
| Molecule — `Select`            | `Select.test.tsx`               | 80%           | 15개 작성 |
| Molecule — `GridSizeInput`     | `GridSizeInput.test.tsx`        | 80%           | 8개 작성  |
| Molecule — `DifficultyStars`   | `DifficultyStars.test.tsx`      | 80%           | 4개 작성  |
| Molecule — `SymbolButton`      | `SymbolButton.test.tsx`         | 80%           | 미작성    |
| Organism — `EditorSidebar`     | `EditorSidebar.test.tsx`        | 60%           | 2개 작성  |
| Organism — `ShapeGuideLayer`   | `ShapeGuideLayer.test.tsx`      | 60%           | 7개 작성  |
| Organism — `Toolbar`           | `Toolbar.test.tsx`              | 60%           | 23개 작성 |
| Organism — `ChartCanvas`       | `ChartCanvas.test.tsx`          | 60%           | 미작성    |
| Hook — `useChartEditor`        | `useChartEditor.test.ts`        | 85%           | 7개 작성  |
| Hook — `useHistory`            | `useHistory.test.ts`            | 85%           | 11개 작성 |
| Hook — `usePatterns`           | `usePatterns.test.ts`           | 85%           | 미작성    |
| Store — `useChartStore`        | `useChartStore.test.ts`         | 80%           | 10개 작성 |
| Store — `useUIStore`           | `useUIStore.test.ts`            | 80%           | 26개 작성 |
| Util — `local-storage-service` | `local-storage-service.test.ts` | 95%           | 미작성    |
| Util — `export-pdf`            | `export-pdf.test.ts`            | 70%           | 미작성    |

---

## 설치 필요 패키지

```bash
pnpm add jspdf html2canvas
pnpm add react-hook-form zod
```
