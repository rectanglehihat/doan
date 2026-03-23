# TDD 지시서

## 1. 테스트 환경 스택

| 도구 | 용도 |
|------|------|
| **Vitest** | 테스트 러너 (Next.js / ESM 환경에 최적화) |
| **@testing-library/react** | 컴포넌트 렌더링 및 쿼리 |
| **@testing-library/user-event** | 실제 사용자 인터랙션 시뮬레이션 |
| **@testing-library/jest-dom** | DOM 커스텀 매처 (`toBeInTheDocument` 등) |
| **jsdom** | Vitest 용 DOM 환경 |
| **MSW (Mock Service Worker)** | API 호출 모킹 (Phase 2 이후) |

### 설치

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/user-event \
  @testing-library/jest-dom
```

### vitest.config.ts

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

### src/test/setup.ts

```ts
import '@testing-library/jest-dom';
```

### package.json scripts 추가

```json
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest run --coverage"
```

---

## 2. TDD 원칙: Red → Green → Refactor

코드를 작성하기 **전에** 반드시 실패하는 테스트를 먼저 작성한다.

```
1. Red    — 실패하는 테스트 작성 (아직 구현 없음)
2. Green  — 테스트를 통과하는 최소한의 코드 구현
3. Refactor — 동작을 유지하면서 코드 정리
```

- 테스트가 없으면 구현 시작 금지
- 하나의 테스트가 통과하기 전에 다음 테스트 작성 금지
- 리팩터 단계에서 테스트는 항상 통과 상태여야 함

---

## 3. 테스트 파일 구조 및 네이밍

테스트 파일은 **대상 파일과 같은 디렉토리**에 위치시킨다.

```
src/components/ui/atoms/
  Button.tsx
  Button.test.tsx        ← 컴포넌트 테스트

src/hooks/
  useChartEditor.ts
  useChartEditor.test.ts ← 훅 테스트

src/lib/utils/
  chart-utils.ts
  chart-utils.test.ts    ← 유틸 테스트

src/store/
  useChartStore.ts
  useChartStore.test.ts  ← 스토어 테스트
```

- 파일명: `{대상파일명}.test.{tsx|ts}`
- describe 블록명: 컴포넌트·함수명과 일치
- it/test 설명: `"[상황] ~ [결과]"` 형식으로 서술

---

## 4. 레이어별 테스트 전략

### Atom (components/ui/atoms/)

순수 UI 단위. **props → 렌더링 결과** 검증에 집중한다.

```tsx
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('children을 렌더링한다', () => {
    render(<Button>저장</Button>);
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
  });

  it('variant=default일 때 기본 스타일 클래스를 가진다', () => {
    render(<Button>저장</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-slate-900');
  });

  it('disabled 상태일 때 클릭 이벤트가 발생하지 않는다', async () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>저장</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('onClick 핸들러를 호출한다', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>저장</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

**Atom 테스트 체크리스트:**
- [ ] 기본 렌더링 (children, role, accessible name)
- [ ] 각 variant별 클래스 적용 여부
- [ ] 각 size별 클래스 적용 여부
- [ ] disabled 상태 동작
- [ ] onClick 등 이벤트 핸들러 전달

### Molecule (components/ui/molecules/)

Atom 조합 단위. **인터랙션 흐름**과 **Atom 간 연결**을 검증한다.

```tsx
// SymbolButton.test.tsx
describe('SymbolButton', () => {
  it('기호 이미지와 라벨을 렌더링한다', () => { ... });
  it('선택 상태일 때 selected 스타일이 적용된다', () => { ... });
  it('클릭 시 onSelect에 기호 id를 전달한다', async () => { ... });
});
```

**Molecule 테스트 체크리스트:**
- [ ] 구성 Atom들이 올바르게 렌더링됨
- [ ] 내부 상태 변화가 외부 콜백으로 전달됨
- [ ] 접근성 속성 (`aria-*`, `role`) 검증

### Organism (components/editor/, components/pdf/)

도메인 기능 블록. **사용자 시나리오** 단위로 테스트한다. store mock이 필요한 경우 Zustand의 실제 스토어를 사용한다 (mock 금지).

```tsx
// ChartGrid.test.tsx
describe('ChartGrid', () => {
  it('초기 그리드를 렌더링한다', () => { ... });
  it('셀 클릭 시 선택된 기호가 해당 셀에 적용된다', async () => { ... });
  it('그리드 크기 변경 시 셀 수가 업데이트된다', async () => { ... });
});
```

**Organism 테스트 체크리스트:**
- [ ] 초기 상태 렌더링
- [ ] 핵심 사용자 인터랙션 1~3개
- [ ] 에러 상태 처리
- 단위 테스트가 아닌 **통합 관점**으로 작성

### Custom Hook (hooks/)

훅은 `renderHook`으로 테스트한다. **반환값과 상태 변화**를 검증한다.

```ts
// useChartEditor.test.ts
import { renderHook, act } from '@testing-library/react';
import { useChartEditor } from './useChartEditor';

describe('useChartEditor', () => {
  it('초기 그리드 크기를 반환한다', () => {
    const { result } = renderHook(() => useChartEditor());
    expect(result.current.gridSize).toEqual({ rows: 10, cols: 10 });
  });

  it('setCellSymbol 호출 시 해당 셀의 기호가 변경된다', () => {
    const { result } = renderHook(() => useChartEditor());
    act(() => {
      result.current.setCellSymbol({ row: 0, col: 0 }, 'knit');
    });
    expect(result.current.cells[0][0].symbol).toBe('knit');
  });
});
```

**Hook 테스트 체크리스트:**
- [ ] 초기 반환값 검증
- [ ] 각 액션 함수 호출 후 상태 변화
- [ ] 비동기 로직은 `waitFor` 사용
- [ ] 훅 내부 구현 상세 검증 금지 → 외부 계약(반환값) 기준

### Zustand Store (store/)

스토어는 실제 인스턴스로 테스트한다. **테스트 간 격리**를 위해 각 테스트 전 스토어를 초기화한다.

```ts
// useChartStore.test.ts
import { useChartStore } from './useChartStore';

beforeEach(() => {
  useChartStore.getState().reset(); // 스토어에 reset action 필수 구현
});

describe('useChartStore', () => {
  it('setGridSize 호출 시 gridSize가 업데이트된다', () => {
    useChartStore.getState().setGridSize({ rows: 20, cols: 20 });
    expect(useChartStore.getState().gridSize).toEqual({ rows: 20, cols: 20 });
  });
});
```

**Store 테스트 체크리스트:**
- [ ] 각 action 함수의 상태 변화
- [ ] 모든 Zustand 스토어에 `reset` action 구현 (테스트 격리용)
- [ ] 스토어 간 의존성이 있는 경우 연계 검증

### 유틸 함수 (lib/utils/)

순수 함수. 가장 단순하고 빠른 테스트. **입력 → 출력** 매핑만 검증한다.

```ts
// chart-utils.test.ts
import { calcCellIndex, rotateCells } from './chart-utils';

describe('calcCellIndex', () => {
  it('row=0, col=0이면 index=0을 반환한다', () => {
    expect(calcCellIndex({ row: 0, col: 0 }, 10)).toBe(0);
  });

  it('row=1, col=3이면 index=13을 반환한다', () => {
    expect(calcCellIndex({ row: 1, col: 3 }, 10)).toBe(13);
  });
});
```

---

## 5. 무엇을 테스트하지 않는가

- **구현 상세**: 컴포넌트 내부 state 변수명, 함수 내부 로직
- **라이브러리 동작**: Tailwind 클래스 계산, Zustand 내부, React 렌더링 엔진
- **스냅샷 테스트**: 변경에 취약하고 의도를 드러내지 않음 → 금지
- **Konva.js 캔버스 픽셀**: 시각적 회귀는 Playwright E2E에서 다룸
- **네트워크 응답 자체**: MSW로 모킹하되, fetch 함수 자체를 테스트하지 않음

---

## 6. 커버리지 기준

| 레이어 | 최소 커버리지 | 우선순위 |
|--------|-------------|---------|
| Atom | 90% | 높음 — 전체 앱에서 재사용 |
| Molecule | 80% | 높음 |
| Hook | 85% | 높음 — 비즈니스 로직 핵심 |
| Store action | 80% | 중간 |
| Util 함수 | 95% | 높음 — 순수 함수라 쉬움 |
| Organism | 60% | 중간 — 통합 시나리오 중심 |

커버리지 측정:
```bash
pnpm test:coverage
```

---

## 7. 검증 순서 (코드 변경 후)

```
1. pnpm test          — 단위·통합 테스트 전체 통과 확인
2. pnpm tsc --noEmit  — 타입 에러 없음 확인
3. pnpm lint          — ESLint 통과 확인
4. pnpm build         — 빌드 성공 확인 (PR 전 필수)
```
