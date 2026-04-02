# 뜨개질 도안 생성 프로젝트 계획서

## 1. 프로젝트 개요

@README.md 파일 참조

---

## 2. 기능 요구사항

### 핵심 기능 (MVP)

#### 2.1 도안 생성 기능

- **User Story**: "사용자로서 나는 행(Row)과 열(Column) 수를 입력하면 기본 뜨개 도안 격자를 생성하고 싶다"
- **Acceptance Criteria**:
  - 너비(stitch count)와 높이(row count) 입력 가능
  - 기본값: 20x20 격자
  - 실시간 도안 미리보기 제공
  - 최소: 1x1, 최대: 200x200 (성능 고려)
  - **셀 비율**: 기본값 가로:세로 = 4:5 (실제 뜨개 코의 물리적 비율 반영, 완성된 패브릭과 시각적 일치)

#### 2.2 기호 편집 기능

- **User Story**: "사용자로서 나는 캔버스의 각 칸에 뜨개 기호를 선택해서 도안을 만들고 싶다"
- **Acceptance Criteria**:
  - 지원 기호: 대바늘, 코바늘 축약어 및 기호
  - 마우스/터치로 칸 선택 시 기호 버튼으로 입력
  - 기호 선택 후 드래그로 여러 칸에 한번에 적용 가능

#### 2.3 도안 레이아웃 편집

- **User Story**: "사용자로서 나는 생성된 도안의 크기, 간격, 배경색을 조정하고 싶다"
- **Acceptance Criteria**:
  - 대칭 모드: 의류처럼 대칭이 필요한 편물의 반복 작업을 줄이는 기능
    - 캔버스를 절반으로 분할하여 한쪽(편집 영역)만 작업하면 나머지 절반은 중심점 기준 180° 회전한 결과를 수정 불가 미리보기로 실시간 표시
    - 활용 예: 스웨터 앞판, 카디건, 숄 칼라, 레이스, 원형 요크 등
  - 영역 선택 & 복사/붙여넣기: 영역을 드래그로 선택하고 Ctrl+C / Ctrl+V로 복사·붙여넣기
  - 중략 기능: 반복되는 범위를 선택하여 "중략" 한 줄로 접기 — 영역 선택 후 적용, Undo/Redo 지원, PDF 출력 시 중략 행 자동 표기
  - 형태선(Shape Guide) 오버레이: 목선·진동·소매산 등 의류 실루엣을 격자 위에 가이드라인으로 표시
  - 칸 크기 조정 (픽셀 단위): 10px ~ 40px (width 기준, height는 비율에 따라 자동 계산)
  - 도안 제목, 난이도, 실, 바늘, 준비물 등 메타정보 추가
  - 실시간 반영 (WYSIWYG)

#### 2.4 도안 저장 & 불러오기

- **User Story**: "사용자로서 나는 작업 중인 도안을 저장하고 나중에 불러와서 수정하고 싶다"
- **Acceptance Criteria**:
  - 로컬 스토리지에 JSON 형식으로 저장
  - 저장되는 도안의 개수는 최대 5개 까지 (MVP)
  - 저장된 도안 목록 조회
  - 도안 불러오기 (기존 도안 덮어쓰기 확인)
  - 도안 삭제 기능
  - 도안 메타데이터: 이름, 만든날짜, 수정날짜

#### 2.5 PDF 내보내기

- **User Story**: "사용자로서 나는 완성된 도안을 PDF로 내보내서 인쇄하고 싶다"
- **Acceptance Criteria**:
  - PDF 파일 생성 (A4, Letter 크기 지원)
  - 도안의 기호 차트 포함
  - 도안 정보 헤더 포함 (제목, 난이도, 준비물 등)
  - 페이지 레이아웃 자동 조정 (여러 페이지 대응)
  - 다운로드 가능

#### 2.6 도안 기호 범례 자동 생성

- **User Story**: "사용자로서 나는 PDF에 사용된 기호가 무엇인지 한눈에 알 수 있는 범례를 포함하고 싶다"
- **Acceptance Criteria**:
  - 도안에 실제 사용된 기호만 추려 범례 데이터 구성
  - PDF 마지막 페이지에 기호 + 한국어 명칭 표 자동 삽입
  - 도안 여백(좌/우)에 행·열 번호 표시
  - 대형 도안은 A4 기준 자동 분할, 각 페이지에 페이지 번호 표시

### 선택 기능 (P1 - Phase 2)

- **사용자 인증**: Supabase Auth 기반 이메일/비밀번호 로그인, 회원가입, 사용자 프로필
- **클라우드 도안 저장**: Supabase에 도안 저장/불러오기, 기기 간 동기화
- **패턴 템플릿 라이브러리**: 인기 패턴 사전설정 제공 (스카프, 모자, 담요 등)
- **협업 기능**: 도안 공유 (조회/편집 권한)
- **색상 기호 지원**: 다색 뜨개질용 색상 칸 지정
- **이미지 → 도안 변환**: 픽셀아트/이미지를 기호 도안으로 자동 변환
- **실 종류/무게 데이터베이스**: 실 정보 저장/관리
- **모바일 앱**: React Native 또는 PWA로 확장
- **텍스트 지시문 자동 생성**: 기호 ID → 한국어 명칭 매핑으로 행별 지시문 생성 (`1단: 겉뜨기 10, 안뜨기 2...`), 초보자 접근성 향상
- **패턴 반복 미리보기**: 선택한 열/행 범위를 N회 반복한 결과를 실시간으로 별도 패널에 표시

---

## 3. 비기능 요구사항

### 성능 (Performance)

- 도안 렌더링: 200x200 격자 기준 < 500ms
- 편집: 클릭/드래그 응답 < 100ms (60fps)
- PDF 생성: < 3초 (최대 100x100 기준)
- 페이지 초기 로드: < 2초 (First Contentful Paint)

### 사용성 (Usability)

- 직관적인 UI/UX (도안 초보자도 5분 내 첫 도안 생성)
- 반응형 디자인 (데스크톱, 태블릿, 모바일)
- 키보드 단축키 지원 (Ctrl+S: 저장, Ctrl+Z: 실행취소 등)

### 접근성 (Accessibility)

- WCAG 2.1 AA 표준 준수
- 스크린리더 호환 (ARIA 레이블)
- 색상만으로 정보 전달하지 않기 (기호 차트는 기호 + 텍스트)
- 최소 글자 크기: 12px

### 보안 (Security)

- HTTPS 필수
- Supabase Row Level Security (RLS) 설정
  - 사용자는 자신의 도안만 접근/수정/삭제 가능
- XSS 방지 (Next.js 자동 처리)
- CSRF 방지
- 민감 정보(이메일, 비밀번호) 최소 저장

### 안정성 (Reliability)

- 오류 처리: 사용자 친화적 오류 메시지
- 로컬 스토리지 자동 백업 (자동저장)
- API 오류 재시도 로직 (exponential backoff)
- 중단 후 복구 기능 (세션 복구)

### 확장성 (Scalability)

- 도안 데이터 구조: 타입스크립트로 명확히 정의
- 컴포넌트 기반 아키텍처
- API 레이트 제한: 사용자당 분당 60 요청
- 이미지/PDF 파일 저장: Supabase Storage

---

## 4. 범위 정의

### In Scope (포함)

- 웹 기반 도안 에디터 (대바늘, 코바늘)
- 기호 차트 생성 및 시각화
- PDF 내보내기
- 도안 저장 및 불러오기 (로컬 스토리지)
- 기본 뜨개 기호 20개 이상
- 반응형 디자인

### Out of Scope (제외)

- 사용자 인증 및 클라우드 저장 (Phase 2)
- 모바일 앱 (PWA로 대체)
- 실시간 협업 편집 (Phase 2)
- AI 기반 패턴 생성
- 영상 튜토리얼
- 도안 커뮤니티 플랫폼 (Phase 2)
- 다국어 지원 (초기 한글만, Phase 2에서 확장)

### Future Enhancements (Phase 2+)

- 사용자 인증 및 Supabase 클라우드 저장
- 공개/비공개 도안 공유
- 도안 댓글/평점
- 실 재고 관리 도구
- 모바일 앱
- AI 패턴 추천

---

## 5. 기술 스택 상세

@CLAUDE.md 파일 참조

---

## 6. 구현 로드맵

### Phase 1: MVP (4-6주)

**목표**: 기본 도안 생성 및 PDF 출력 기능 완성

#### 1-1. 프로젝트 초기화 및 구조 설계 (1주)

- Next.js 프로젝트 설정 (TypeScript, Tailwind, ESLint)
- Supabase 프로젝트 설정 및 스키마 설계
- 데이터 모델 정의 (TypeScript interfaces)
- 프로젝트 폴더 구조 설정
- 환경변수 설정 (.env.local)

**작업 분해**:

- Next.js 14 프로젝트 생성
- Supabase 라이브러리 설치 및 설정
- 데이터베이스 마이그레이션 (Supabase SQL)
- 타입 정의 파일 (types/knitting.ts)
- 프로젝트 README 작성

#### 1-2. 기본 UI 레이아웃 (1주)

- 헤더/네비게이션 컴포넌트
- 사이드바 (기호 팔레트)
- 캔버스 영역 레이아웃
- 기본 스타일 시스템 (색상, 폰트, 간격)
- 반응형 디자인 (desktop-first)

**작업 분해**:

- Layout 컴포넌트
- Header 컴포넌트
- Sidebar 컴포넌트
- Canvas wrapper 컴포넌트
- Tailwind 설정 커스터마이징

#### 1-3. Konva 캔버스 기본 구현 (1.5주)

- Konva Stage/Layer 초기화
- 격자(Grid) 렌더링
- 기호 렌더링 (텍스트 또는 SVG)
- 마우스 상호작용 (hover, click)
- 줌/팬 기능

**작업 분해**:

- KonvaCanvas 컴포넌트
- Grid 렌더링 로직
- Symbol registry (기호 정보 저장)
- 마우스 이벤트 핸들러
- 줌/팬 controls

#### 1-4. 편집 기능 구현 (1.5주)

- 기호 선택 UI
- 칸 선택 및 기호 입력
- Undo/Redo (상태관리)
- 도안 초기화, 크기 변경
- 실시간 미리보기
- 뜨개 종류 선택
  - 대바늘 vs 코바늘 기호 세트 분리
  - 기호 팔레트 동적 변경

**작업 분해**:

- Symbol palette 컴포넌트
- Cell selection 로직
- Zustand 상태관리 설정 (pattern state)
- Undo/Redo 구현 (custom hook)
- Grid size editor 컴포넌트
- 대칭 모드
- 영역 선택 & 복사/붙여넣기 (`useChartEditor` 확장, Ctrl+C/V 단축키)
- 중략 기능 (`CollapsedBlock` 타입, `useChartStore` 확장, `KonvaGrid` 중략 행 렌더링, Undo/Redo 연동)
- 형태선 오버레이 (`KonvaGrid`에 별도 Konva Layer 추가)

#### 1-5. 저장 및 불러오기 (1주)

- 로컬 스토리지 저장/불러오기 유틸리티
- 도안 목록 조회 UI
- 도안 불러오기 (기존 도안 덮어쓰기 확인)
- 도안 삭제
- 자동저장 (편집 시 자동으로 로컬 스토리지에 임시저장)

**작업 분해**:

- localStorageService 유틸리티 (저장/불러오기/삭제)
- usePatterns custom hook
- LoadDialog 컴포넌트
- 자동저장 로직 (debounce 적용)

#### 1-6. PDF 내보내기 (1주)

- jsPDF 라이브러리 통합
- 캔버스 → 이미지 변환
- PDF 레이아웃 설계
- 도안 정보 포함
- 다운로드 기능

**작업 분해**:

- PDF 내보내기 유틸리티
- 캔버스 캡쳐 로직
- PDF 문서 생성 (제목, 설명, 도안)
- 페이지 레이아웃 처리
- 다운로드 트리거

#### 1-7. 테스트 및 배포 (1주)

- 단위 테스트 (핵심 로직)
- E2E 테스트 (Playwright)
- 성능 최적화
- Vercel 배포

**작업 분해**:

- Jest 설정
- 핵심 함수 테스트
- Playwright 테스트
- 이미지 최적화
- 배포 설정

---

### Phase 2: 핵심 기능 완성 (4-5주)

**목표**: 사용자 인증, 클라우드 저장, 협업, 템플릿, 고급 편집 기능

#### 2-0. 사용자 인증 및 클라우드 저장 (2주)

- Supabase 프로젝트 설정 및 스키마 마이그레이션
- Supabase Auth (이메일/비밀번호, 회원가입/로그인/로그아웃)
- 로컬 스토리지 → Supabase 마이그레이션 유틸리티
- 도안 목록/저장/불러오기/삭제 API 연동

#### 2-1. 텍스트 지시문 자동생성 (1.5주)

- 기호 → 텍스트 변환 로직
- 편집 가능한 지시문 UI
- 지시문 → 기호 역변환

#### 2-2. 패턴 템플릿 (1.5주)

- 템플릿 라이브러리 구축 (DB)
- 템플릿 브라우저 UI
- 템플릿 기반 생성

#### 2-3. 도안 공유 (1주)

- 공개 도안 기능
- 공유 링크 생성
- 권한 관리 (view/edit)

#### 2-4. 텍스트 지시문 자동 생성 (1.5주)

- 기호 ID → 한국어 명칭 매핑 테이블 (`src/constants/knitting-symbols.ts` 확장)
- 그리드 행 데이터를 순회하며 연속 동일 기호 묶음 처리
- 출력: `1단: 겉뜨기 10, 안뜨기 2, 겉뜨기 10 (총 22코)` 형식
- 편집 가능한 지시문 UI (사용자 수정 허용)

#### 2-5. 패턴 반복 미리보기 (1.5주)

- 그리드에서 열 범위(repeat zone) 선택 UI
- 선택 구간을 N회 수평 반복한 결과를 실시간으로 별도 패널에 렌더링
- 행 중략(접기) 기능과 연계하여 미리보기 구현
- Konva 레이어로 미리보기 전용 캔버스 분리

---

### Phase 3: 고급 기능 (4-6주)

**목표**: AI 기반 기능, 모바일 앱

#### 3-1. 이미지 → 도안 변환

- 픽셀아트 인식
- 색상 매핑

#### 3-2. 모바일 PWA

- 오프라인 지원
- 설치 가능

#### 3-3. 도안 커뮤니티

- 갤러리
- 댓글/평점

---

## 7. 데이터베이스 스키마 (Phase 2)

> MVP에서는 로컬 스토리지를 사용하므로 DB 스키마는 Phase 2에서 적용됩니다.

### Supabase SQL

```sql
-- 사용자 (Supabase Auth와 연동)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  nickname VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 뜨개 도안
CREATE TABLE public.patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('knitting', 'crochet')),
  width INTEGER NOT NULL CHECK (width >= 1 AND width <= 200),
  height INTEGER NOT NULL CHECK (height >= 1 AND height <= 200),
  cell_size INTEGER DEFAULT 20,
  grid JSONB NOT NULL, -- 2D array of symbols
  metadata JSONB NOT NULL, -- difficulty, yarnType, etc.
  settings JSONB DEFAULT '{}', -- backgroundColor, gridVisible, etc.
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_grid CHECK (jsonb_array_length(grid) = height)
);

-- RLS (Row Level Security)
ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own patterns or public patterns"
  ON public.patterns FOR SELECT
  USING (user_id = auth.uid() OR is_public = TRUE);

CREATE POLICY "Users can insert own patterns"
  ON public.patterns FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own patterns"
  ON public.patterns FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own patterns"
  ON public.patterns FOR DELETE
  USING (user_id = auth.uid());

-- 인덱스
CREATE INDEX idx_patterns_user_id ON public.patterns(user_id);
CREATE INDEX idx_patterns_created_at ON public.patterns(created_at DESC);
```

---

## 8. 위험 요소 및 고려사항

### 기술적 위험


| 위험                       | 영향도 | 완화 전략                                      |
| ------------------------ | --- | ------------------------------------------ |
| Konva.js 성능 (200x200 격자) | 높음  | 가상화(virtualization) 검토, 격자 크기 제한 (200x200) |
| PDF 생성 시간 초과             | 중간  | 대규모 도안은 서버에서 생성, 진행률 표시                    |
| Supabase 업타임             | 낮음  | 오류 처리, 재시도 로직, 모니터링 설정                     |
| 모바일 터치 상호작용              | 중간  | 초기 테스트, 터치 이벤트 최적화                         |


### 비즈니스 위험


| 위험        | 영향도 | 완화 전략                     |
| --------- | --- | ------------------------- |
| 사용자 채택 저조 | 높음  | 사용성 테스트 (초보자 포함), 튜토리얼 영상 |
| 경쟁 서비스    | 중간  | 독특한 기능 (AI 패턴), 커뮤니티 구축   |
| 데이터 손실    | 높음  | 정기 백업, 로컬 자동저장, RLS 설정    |


### 설계 고려사항

- **기호 표현**: SVG vs 텍스트 - 아이콘은 SVG, 기호명은 텍스트 (가독성)
- **색상 시스템**: 색상이 필요한가? (색상 뜨개질) - Phase 2에서 추가
- **국제화**: 초기 한글/영어, Phase 2에서 다국어
- **오프라인 지원**: 로컬 스토리지로 제한적 지원, PWA는 Phase 2

---

## 9. 성공 지표

### 기능 완성도

- MVP 기능 100% 구현
- 문서화 완성도 80% 이상
- 테스트 커버리지 70% 이상

### 성능

- 도안 렌더링: < 500ms (200x200)
- 페이지 로드: < 2초 (FCP)
- PDF 생성: < 3초

### 사용성

- SUS(System Usability Scale) 점수: 70 이상
- 초보자 완료 시간: < 10분 (첫 도안)
- 모바일 사용성: 태블릿에서 정상 작동

### 안정성

- 버그 발생률: < 1% (사용자 세션)
- 가동시간: 99.5% 이상
- 데이터 무결성: 100%

---

## 10. 의존성 및 전제조건

### 외부 서비스

- Supabase 계정 및 프로젝트
- Vercel 계정 (배포)

### 팀 역량

- TypeScript/React 경험 (중급 이상)
- Next.js 경험 (선택)
- Supabase/PostgreSQL 기초
- 뜨개질 지식 (기호 이해)

### 시간 및 리소스

- 개발 시간: Phase 1 (4-6주), 풀타임 1명
- 디자인: 초기 3-4일 (컴포넌트 설계)
- 테스트: 각 Phase별 1주

---

## 11. 참고 자료 및 레퍼런스

### 뜨개질 기호 표준

- 국제 뜨개질 기호 차트 (Craft Yarn Council)

### 기술 참고자료

- Konva.js 공식 문서: [https://konvajs.org/](https://konvajs.org/)
- Next.js 공식 문서: [https://nextjs.org/docs](https://nextjs.org/docs)
- jsPDF 문서: [https://github.com/parallax/jsPDF](https://github.com/parallax/jsPDF)
- Tailwind CSS 문서: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- Supabase 공식 문서: [https://supabase.com/docs](https://supabase.com/docs)

### 유사 서비스 분석

- 차트마인더 [https://www.chart-minder.com/demo](https://www.chart-minder.com/demo)

---

## 12. 메모 및 추후 결정사항

### 미해결 이슈

- 색상 기호 지원 시기? (Phase 1 vs Phase 2)
- 이미지 업로드는? (프로필, 도안 썸네일)
- 실 재고 연동? (이커머스 통합)
- 다국어 지원 범위? (초기 한글/영어 vs 전 언어)

### 성장 아이디어

- 뜨개질 커뮤니티와의 파트너십
- 패턴 판매 플랫폼 (Ravelry 경쟁자)
- 실 추천 알고리즘
- AR을 이용한 도안 미리보기

