# Components 작성 규칙

이 디렉토리의 모든 컴포넌트는 아래 규칙을 반드시 준수한다.

## 컴포넌트 설계 원칙

- 디자인 시스템은 Figma MCP 서버로 연결된 피그마 파일 기준
- 컴포넌트 생성 전 반드시 Figma에서 스펙 확인
- 변수명은 Figma 레이어명과 일치시킬 것
- 컴포넌트 하나는 하나의 역할만 수행 (단일 책임)
- Props 인터페이스는 컴포넌트 함수 위에 별도로 선언
- JSX 내 인라인 함수 정의 금지 → `useCallback`으로 분리
- 조건부 렌더링이 3개 이상이면 별도 컴포넌트로 추출
- Konva.js 등 무거운 컴포넌트는 `dynamic()` + `ssr: false`로 lazy load
- 컴포넌트 파일 길이 200줄 초과 시 분리 검토

## 폴더 구조 및 파일 배치

```
components/
  ui/
    atoms/      # 최소 단위 UI — Button, Input, Icon, Badge 등
    molecules/  # Atom 조합 단위 — SymbolButton, GridSizeInput 등
  editor/       # 에디터 도메인 Organism — ChartGrid, SymbolPicker, Toolbar 등
  pdf/          # PDF 도메인 Organism — PdfPreview 등
```

- `components/` 루트에 직접 파일을 두지 않는다.
- 새 컴포넌트는 반드시 위 4개 위치 중 하나에 배치한다.
- 파일명은 PascalCase: `SymbolButton.tsx`, `ChartGrid.tsx`

## Atomic Design 계층 규칙

컴포넌트는 **Atomic Design**으로 계층을 분류하고, **Organism 이상**의 복잡한 컴포넌트에는 **Compound Component** 패턴을 적용한다.

| 계층 | 설명 | 위치 | 예시 |
|------|------|------|------|
| **Atom** | 더 이상 분해할 수 없는 최소 UI 단위. 자체 상태 없음 | `ui/atoms/` | `Button`, `Input`, `Icon`, `Badge` |
| **Molecule** | Atom 2~3개를 조합한 단일 기능 단위 | `ui/molecules/` | `SymbolButton`, `GridSizeInput`, `ColorPicker` |
| **Organism** | 독립적인 기능 블록. 비즈니스 로직을 포함할 수 있음 | `editor/`, `pdf/` | `ChartGrid`, `SymbolPicker`, `Toolbar`, `PdfPreview` |
| **Template / Page** | 레이아웃 구조 정의. 실제 데이터는 없음 / 데이터와 연결 | `app/` | `layout.tsx`, `page.tsx` |

- Atom·Molecule은 도메인을 모른다 — props로만 동작하고 store를 직접 참조하지 않는다.
- Organism부터 hooks 또는 store에 접근할 수 있다.
- 계층을 건너뛰지 않는다 (Atom이 Organism을 직접 사용하는 것 금지).

## 기본 작성 규칙

### 필수 사항
- 함수형 컴포넌트만 사용 (`class` 컴포넌트 금지)
- named export만 사용 (`export default` 금지)
- `any` 타입 금지 — TypeScript strict 모드 준수
- CSS는 Tailwind 유틸리티 클래스만 사용 (커스텀 CSS 파일 금지)

### 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일·함수 | PascalCase | `Button.tsx`, `export function Button()` |
| 이벤트 핸들러 prop | `on` prefix | `onSelect`, `onCellClick` |
| 이벤트 핸들러 함수 | `handle` prefix | `handleSelect`, `handleCellClick` |
| Props 인터페이스 | `{컴포넌트명}Props` | `ButtonProps`, `SymbolButtonProps` |

## Props 인터페이스 선언 패턴

```tsx
// 컴포넌트 함수 바로 위에 선언
interface SymbolButtonProps {
  symbol: KnittingSymbol;
  isSelected: boolean;
  onSelect: (symbol: KnittingSymbol) => void;
}

export function SymbolButton({ symbol, isSelected, onSelect }: SymbolButtonProps) {
  ...
}
```

- HTML 네이티브 속성을 확장할 때는 `extends HTMLAttributes<T>` 또는 `extends ButtonHTMLAttributes<T>` 사용.
- `forwardRef`가 필요한 Atom(Button 등)은 `forwardRef` + `displayName` 설정.

## 이벤트 핸들러

```tsx
// JSX 인라인 함수 금지
<Button onClick={() => onSelect(symbol)} />  // 금지

// useCallback으로 분리
const handleClick = useCallback(() => {
  onSelect(symbol);
}, [onSelect, symbol]);

<Button onClick={handleClick} />  // 올바름
```

## 'use client' 지시어

- 브라우저 API, 이벤트 핸들러, `useState`, `useEffect`가 있으면 파일 최상단에 `'use client'` 선언.
- 순수 렌더링만 하는 Atom은 서버 컴포넌트로 유지한다.

## Konva.js / 무거운 컴포넌트

```tsx
// SSR 비호환 컴포넌트는 dynamic() + ssr: false 필수
const KonvaCanvas = dynamic(() => import('./KonvaCanvas'), { ssr: false });
```

- Konva.js는 서버 컴포넌트에서 직접 import 금지.
- Konva 캔버스 컴포넌트는 `React.memo`로 래핑해 불필요한 리렌더를 방지.

## 조건부 렌더링

- 조건 분기가 3개 이상이면 별도 컴포넌트로 추출한다.

```tsx
// 분기가 3개 이상 → 추출
function SymbolCategoryBadge({ category }: { category: SymbolCategory }) {
  ...
}
```

## Compound Component 패턴 (Organism 이상)

Organism이 내부 서브컴포넌트 간 상태를 공유해야 할 때 사용.

```tsx
// 1. Context는 파일 내부에만 존재 (전역 store와 혼용 금지)
const ChartGridContext = createContext<ChartGridContextValue | null>(null);

// 2. 부모가 Context 제공
export function ChartGrid({ children }: ChartGridProps) {
  const { cells, selectedSymbol, handleCellClick } = useChartEditor();
  return (
    <ChartGridContext.Provider value={{ cells, selectedSymbol, handleCellClick }}>
      <div className="...">{children}</div>
    </ChartGridContext.Provider>
  );
}

// 3. 서브컴포넌트는 정적 프로퍼티로 노출
ChartGrid.Canvas = function ChartGridCanvas() { ... };
ChartGrid.Controls = function ChartGridControls() { ... };

// 4. 사용
<ChartGrid>
  <ChartGrid.Controls />
  <ChartGrid.Canvas />
</ChartGrid>
```

### 두 패턴의 결합 원칙

1. **Atom·Molecule은 Compound Component로 만들지 않는다** — 단순 props로 충분하다.
2. **Organism 내부 구조가 외부에 노출될 필요가 없으면 Compound Component를 쓰지 않는다** — 단일 컴포넌트로 유지한다.
3. **서브컴포넌트 자체는 Atom·Molecule로 구성한다** — 계층을 건너뛰지 않는다.
4. **Context는 해당 Compound Component 파일 내부에만 존재**해야 한다 — 전역 store와 혼용 금지.

### Context 소비 시 null 가드 필수

```tsx
function useChartGridContext() {
  const ctx = useContext(ChartGridContext);
  if (!ctx) throw new Error('ChartGrid 컨텍스트 외부에서 사용할 수 없습니다.');
  return ctx;
}
```

## 성능 최적화

- Konva 캔버스 컴포넌트: `React.memo` 래핑 필수
- 셀 클릭·드래그 핸들러: `useCallback` 필수
- 그리드 데이터 가공(필터, 정렬, 변환): `useMemo` 적용
- 큰 상수 배열(기호 목록 등): 모듈 최상단에 정의, 렌더 중 생성 금지

## 테스트 파일

- 테스트 파일은 컴포넌트와 같은 폴더에 위치: `Button.tsx` → `Button.test.tsx`
- Atom·Molecule은 단위 테스트 작성 (props 기반 렌더링, 이벤트 핸들러 호출 검증)
- Organism은 통합 테스트 작성 (store 연동, 사용자 인터랙션 시나리오)

## 신규 컴포넌트 체크리스트

컴포넌트를 새로 만들기 전 확인:

**구현 전 (Red 단계)**
- [ ] Figma에서 스펙을 확인했는가?
- [ ] 기존 컴포넌트(Atom·Molecule)를 재사용할 수 없는가?
- [ ] 올바른 계층(Atom/Molecule/Organism)에 배치하는가?
- [ ] **테스트 파일(`*.test.tsx`)을 먼저 작성했는가?** — 구현 없이 실패하는 테스트를 먼저 작성한다

**구현 후 (Green → Refactor 단계)**
- [ ] Props 인터페이스를 함수 위에 선언했는가?
- [ ] named export를 사용하는가?
- [ ] 이벤트 핸들러를 `useCallback`으로 분리했는가?
- [ ] `any` 타입이 없는가?
- [ ] Atom·Molecule인 경우 store를 직접 참조하지 않는가?
- [ ] Konva 등 SSR 비호환 라이브러리는 `dynamic()` + `ssr: false`로 처리했는가?
- [ ] `pnpm test` 전체 통과 확인했는가?
