---
name: tdd-hook
description: DOAN 새 커스텀 훅/스토어 TDD 워크플로우 스킬. "새 훅 만들어", "스토어 추가해", "useXxx 훅 필요해" 같은 요청 시 사용. architect → test-writer → store-hook-implementer → code-reviewer 순서로 에이전트를 호출한다.
---

# 새 훅/스토어 TDD 워크플로우

새 커스텀 훅 또는 Zustand 스토어를 TDD 방식으로 구현하는 전체 워크플로우.

## 트리거 조건

- "새 훅 만들어", "훅 추가해"
- "useXxx 훅 구현해줘"
- "새 스토어 필요해", "Zustand 스토어 추가해"
- "상태 관리 로직 분리해"

## 워크플로우

### Step 1: 설계 (architect 에이전트)

```
architect 에이전트를 사용해서 결정:
- 훅인지 스토어인지 판단
  - 로컬 UI 상태 → useState/useReducer (스토어 불필요)
  - 에디터 전역 상태 → Zustand 스토어
  - 비즈니스 로직 조합 → 커스텀 훅
- 파일 경로 (src/hooks/ 또는 src/store/)
- 반환값 설계 (상태 + action 함수 목록)
- 기존 스토어 활용 여부
- 도메인 prefix 결정 (useChart*, useUI*, usePdf*)
```

### Step 2: 테스트 작성 (test-writer 에이전트)

```
test-writer 에이전트를 사용해서:
1. {hookName}.test.ts 파일 먼저 작성
2. 훅이면: renderHook + act 패턴
   스토어면: getState() + reset() 패턴
3. pnpm test → Red 상태 확인
```

### Step 3: 구현 (store-hook-implementer 에이전트)

```
store-hook-implementer 에이전트를 사용해서:
1. 훅/스토어 파일 구현
2. 스토어라면 reset action 반드시 포함
3. pnpm test → Green 상태 확인
4. 리팩터 (중복 제거, 타입 정리)
```

### Step 4: 검증 (code-reviewer 에이전트)

```
code-reviewer 에이전트를 사용해서:
1. 직접 set 노출 여부 확인 (스토어)
2. reset action 존재 여부 (스토어)
3. useCallback/useMemo 적용 여부 (훅)
4. pnpm tsc --noEmit, pnpm lint
```

## 상태 분류 빠른 참조

| 상태 종류 | 구현 위치 |
|-----------|-----------|
| 모달 open/close | `useState` (컴포넌트 내) |
| 폼 입력값 | `useState` (컴포넌트 내) |
| 차트 데이터, 그리드 크기 | `useChartStore` |
| 선택된 기호, 대화상자 상태 | `useUIStore` |
| 새 도메인 전역 상태 | 새 Zustand 스토어 |
| 여러 store 조합 비즈니스 로직 | 커스텀 훅 |

## 완료 기준

- [ ] 테스트 파일 존재
- [ ] `pnpm test` 통과 (스토어: reset으로 격리 확인)
- [ ] `pnpm tsc --noEmit` 통과
- [ ] `pnpm lint` 통과
