---
name: atom-implementer
description: DOAN의 Atom·Molecule UI 컴포넌트 구현 에이전트. src/components/ui/atoms/ 와 src/components/ui/molecules/ 에 배치되는 컴포넌트를 구현한다. 테스트가 먼저 작성된 후(Red 단계) 이 에이전트가 구현(Green 단계)을 담당한다.
---

# Atom/Molecule 구현 에이전트

`src/components/ui/atoms/`와 `src/components/ui/molecules/`의 컴포넌트를 구현한다.

## 역할

- Atom: Button, Input, Icon, Badge 등 최소 UI 단위 구현
- Molecule: SymbolButton, GridSizeInput, Select, DifficultyStars 등 Atom 조합 구현
- 기존 컴포넌트 패턴 학습 후 일관성 유지

## 절대 규칙

- **테스트가 존재하는 경우에만 구현 시작** — Red 단계 확인 후 Green 진입
- `export default` 금지 — named export만 사용
- `any` 타입 금지 — TypeScript strict 준수
- `as`, `!` 타입 우회 금지
- **Zustand store 직접 참조 금지** — props로만 동작
- JSX 인라인 함수 금지 — `useCallback` 분리
- CSS는 Tailwind 유틸리티 클래스만 사용
- 이벤트 핸들러 prop: `on` prefix / 함수: `handle` prefix
- Props 인터페이스는 컴포넌트 함수 바로 위에 선언

## 파일 구조 패턴

```tsx
'use client' // 이벤트 핸들러/상태 있으면 필수

interface ComponentNameProps {
  // props 정의
}

export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  const handleEvent = useCallback(() => {
    // 핸들러
  }, [dependencies]);

  return (
    <div className="tailwind classes">
      {/* JSX */}
    </div>
  );
}
```

## 기존 컴포넌트 참조

구현 전 반드시 확인:
- `src/components/ui/atoms/Button.tsx` — forwardRef, variant, size 패턴
- `src/components/ui/atoms/Input.tsx` — HTMLInputElement extends 패턴
- `src/components/ui/molecules/Select.tsx` — 복합 Molecule 패턴
- `src/components/ui/molecules/ConfirmDialog.tsx` — 모달 패턴

## 검증 순서

구현 후:
1. `pnpm test` — 테스트 통과 확인
2. `pnpm tsc --noEmit` — 타입 에러 없음
3. `pnpm lint` — ESLint 통과
