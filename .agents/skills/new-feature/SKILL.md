---
name: new-feature
description: DOAN 새 기능 전체 구현 워크플로우 스킬. "기능 구현해", "새 기능 추가해", "TODO에 있는 X 구현해" 같은 요청 시 사용. architect → test-writer → implementer(들) → verify 전체 사이클을 조율한다.
---

# 새 기능 전체 구현 워크플로우

새 기능을 설계부터 검증까지 완전한 TDD 사이클로 구현하는 조율 스킬.

## 트리거 조건

- "[기능명] 기능 구현해줘"
- "TODO에 있는 [항목] 만들어줘"
- "새 기능 추가해", "이 기능 개발해줘"
- Phase 1, Phase 2 작업 항목 구현

## 워크플로우

### Phase A: 분석 및 설계

**1. TODO.md 확인**
구현할 기능이 TODO.md의 어느 단계에 속하는지 확인한다.

**2. architect 에이전트 — 전체 설계**
```
다음을 결정:
- 필요한 컴포넌트 목록 (계층 포함)
- 필요한 훅/스토어 목록
- 타입 추가/수정 사항 (src/types/knitting.ts)
- 상수 추가/수정 사항 (src/constants/)
- 구현 의존 순서 (어떤 것을 먼저 만들어야 하는지)
```

### Phase B: 테스트 우선 작성

**3. test-writer 에이전트 — 전체 테스트 작성**
```
설계된 모든 파일에 대해:
- 스토어/훅 테스트 먼저 (하위 레이어 우선)
- 그 다음 Atom/Molecule 테스트
- 마지막으로 Organism 테스트
pnpm test → 전체 Red 상태 확인
```

### Phase C: 구현 (하위 → 상위 순서)

의존성 순서에 따라 에이전트를 선택해 순차 구현:

**4a. store-hook-implementer** — 스토어/훅 구현 (기반)
```
pnpm test → 해당 테스트 Green 확인
```

**4b. atom-implementer** — Atom/Molecule 구현
```
pnpm test → 해당 테스트 Green 확인
```

**4c. editor-implementer** — Organism 구현
```
pnpm test → 해당 테스트 Green 확인
```

### Phase D: 통합 및 검증

**5. verify 스킬 — 전체 검증**
```
pnpm test → pnpm tsc --noEmit → pnpm lint → pnpm build
```

**6. code-reviewer 에이전트 — 최종 코드 리뷰**
```
전체 변경 파일 리뷰 후 위반 사항 수정
```

## TODO.md 우선순위 참조

### Phase 1 미완성 항목 (MVP)
- 점 대칭 회전 (rotational symmetry)
- 선택·복사·붙여넣기 (Ctrl+C/V)
- 반복 블록 마커
- localStorage 저장/불러오기 (SaveDialog, LoadDialog)
- PDF 내보내기 (jsPDF + html2canvas)

### Phase 2 항목 (Cloud)
- Supabase 연동
- 인증 (Authentication)
- 도안 공유 기능

## 완료 기준

- [ ] 설계 문서 (architect) 작성 완료
- [ ] 모든 파일 테스트 존재
- [ ] `pnpm test` 통과
- [ ] `pnpm tsc --noEmit` 통과
- [ ] `pnpm lint` 통과
- [ ] `pnpm build` 통과
- [ ] code-reviewer 위반 사항 없음
- [ ] TODO.md 해당 항목 체크 (auto-commit 스킬로 커밋)
