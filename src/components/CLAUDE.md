# Components 작성 규칙

## 컴포넌트 설계 원칙

- 디자인 시스템은 Figma MCP 서버로 연결된 피그마 파일 기준 — 생성 전 Figma 스펙 확인, 변수명은 레이어명과 일치
- 단일 책임, Props 인터페이스는 컴포넌트 함수 바로 위에 `{ComponentName}Props` 이름으로 선언
- JSX 인라인 함수 금지 → `useCallback`으로 분리
- 조건부 렌더링 3개 이상이면 별도 컴포넌트로 추출
- 컴포넌트 파일 200줄 초과 시 분리 검토

## 폴더 구조 및 파일 배치

```
components/
  ui/atoms/      # 최소 단위 UI — Button, Input, Icon, Badge 등
  ui/molecules/  # Atom 조합 단위 — SymbolButton, GridSizeInput 등
  editor/        # 에디터 도메인 Organism — ChartGrid, SymbolPicker, Toolbar 등
  pdf/           # PDF 도메인 Organism — PdfPreview 등
```

- `components/` 루트 직접 배치 금지. 파일명은 PascalCase.

## Atomic Design 계층 규칙

| 계층 | 설명 | 위치 | 예시 |
|------|------|------|------|
| **Atom** | 최소 UI 단위. 자체 상태 없음 | `ui/atoms/` | `Button`, `Input`, `Icon` |
| **Molecule** | Atom 2~3개 조합 | `ui/molecules/` | `SymbolButton`, `GridSizeInput` |
| **Organism** | 독립 기능 블록. 비즈니스 로직 포함 가능 | `editor/`, `pdf/` | `ChartGrid`, `Toolbar` |
| **Template/Page** | 레이아웃 구조 | `app/` | `layout.tsx`, `page.tsx` |

- Atom·Molecule은 store 직접 참조 금지 — props로만 동작
- Organism부터 hooks/store 접근 가능
- 계층 건너뛰기 금지

## 기본 작성 규칙

- 함수형 컴포넌트 + named export만 사용 (`class`, `export default` 금지)
- `any` 타입 금지, CSS는 Tailwind만 사용
- HTML 네이티브 속성 확장 시 `extends HTMLAttributes<T>` 사용
- `forwardRef` 필요한 Atom은 `forwardRef` + `displayName` 설정

## `'use client'` 지시어

- 이벤트 핸들러, `useState`, `useEffect`, 브라우저 API가 있으면 파일 최상단에 선언
- 순수 렌더링만 하는 Atom은 서버 컴포넌트로 유지

## Konva.js / 무거운 컴포넌트

- Konva.js는 서버 컴포넌트에서 직접 import 금지 → `dynamic(() => import(...), { ssr: false })` 필수
- Konva 캔버스 컴포넌트는 `React.memo` 래핑 필수

## Compound Component 패턴 (Organism 이상)

Organism이 내부 서브컴포넌트 간 상태를 공유해야 할 때만 사용.

**원칙:**
1. Atom·Molecule은 Compound Component로 만들지 않는다
2. 내부 구조가 외부에 노출될 필요 없으면 단일 컴포넌트로 유지
3. 서브컴포넌트는 Atom·Molecule로 구성 (계층 건너뛰기 금지)
4. Context는 해당 파일 내부에만 존재 — 전역 store와 혼용 금지
5. Context 소비 시 null 가드 필수 (`if (!ctx) throw new Error(...)`)
6. 서브컴포넌트는 정적 프로퍼티로 노출 (`ChartGrid.Canvas = ...`)

## 성능 최적화

- Konva 캔버스: `React.memo` 필수
- 셀 핸들러: `useCallback` 필수
- 그리드 데이터 가공: `useMemo` 적용
- 큰 상수 배열: 모듈 최상단 정의

## 테스트 파일

- 테스트 파일은 컴포넌트와 같은 폴더: `Button.tsx` → `Button.test.tsx`
- Atom·Molecule: 단위 테스트 (props 렌더링, 이벤트 핸들러)
- Organism: 통합 테스트 (store 연동, 사용자 인터랙션 시나리오)
