---
name: tdd-component
description: DOAN 새 컴포넌트 TDD 워크플로우 스킬. "새 컴포넌트 만들어", "컴포넌트 추가해줘", "새 Atom/Molecule/Organism 필요해" 같은 요청 시 사용. architect → test-writer → implementer → /verify → code-reviewer 순서로 에이전트를 호출한다.
---

# 새 컴포넌트 TDD 워크플로우

새 컴포넌트를 TDD 방식으로 구현하는 전체 워크플로우를 안내한다.

## 트리거 조건

- "새 컴포넌트 만들어"
- "컴포넌트 추가해줘"
- "[이름] 컴포넌트 구현해"
- "새 Atom/Molecule/Organism 필요해"

## 워크플로우

### Step 1: 설계 (architect 에이전트)

```
architect 에이전트를 사용해서 다음을 결정한다:
- Atomic Design 계층 (Atom/Molecule/Organism)
- 파일 경로 및 폴더 위치
- Props 인터페이스 설계
- 기존 컴포넌트 재사용 여부
- store 연동 여부 (Organism만 가능)
```

### Step 2: 테스트 작성 (test-writer 에이전트)

```
test-writer 에이전트를 사용해서:
1. {ComponentName}.test.tsx 파일 먼저 작성
2. 레이어에 맞는 테스트 전략 적용
3. pnpm test 실행 → Red 상태 확인
```

### Step 3: 구현 (implementer 에이전트)

계층에 따라 에이전트 선택:
- **Atom/Molecule** → `atom-implementer` 에이전트
- **Organism (editor/)** → `editor-implementer` 에이전트
- **Organism (pdf/)** → `editor-implementer` 에이전트

```
선택한 에이전트를 사용해서:
1. {ComponentName}.tsx 구현
2. pnpm test → Green 상태 확인
3. 리팩터 (코드 정리, 중복 제거)
```

### Step 4: 검증 (/verify 스킬)

`/verify` 스킬을 호출해서 전체 검증을 실행한다.

```
test → tsc → lint → build 순서로 통과 확인
```

### Step 5: 코드 리뷰 (code-reviewer 에이전트)

```
code-reviewer 에이전트를 사용해서:
1. CLAUDE.md 절대 규칙 위반 확인 (export default, any, 계층 위반 등)
2. Atomic Design 계층 규칙 준수 여부 확인
3. 성능 최적화 누락 확인 (React.memo, useCallback, useMemo)
4. 위반 사항 수정 후 /verify 재실행
```

## 완료 기준

- [ ] 테스트 파일 존재
- [ ] `pnpm test` 통과
- [ ] `pnpm tsc --noEmit` 통과
- [ ] `pnpm lint` 통과
- [ ] `pnpm build` 통과
- [ ] code-reviewer 위반 사항 없음
