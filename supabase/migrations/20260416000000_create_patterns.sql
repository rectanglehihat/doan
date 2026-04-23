-- patterns 테이블 생성
CREATE TABLE public.patterns (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  pattern_type   TEXT NOT NULL CHECK (pattern_type IN ('knitting', 'crochet')),
  grid_rows      INT  NOT NULL CHECK (grid_rows > 0),
  grid_cols      INT  NOT NULL CHECK (grid_cols > 0),
  cells          JSONB NOT NULL DEFAULT '[]',
  collapsed_blocks        JSONB NOT NULL DEFAULT '[]',
  collapsed_column_blocks JSONB NOT NULL DEFAULT '[]',
  shape_guide    JSONB,
  rotational_mode TEXT NOT NULL DEFAULT 'none'
    CHECK (rotational_mode IN ('none', 'horizontal', 'vertical', 'both')),
  difficulty     INT  NOT NULL DEFAULT 0 CHECK (difficulty >= 0 AND difficulty <= 5),
  materials      TEXT NOT NULL DEFAULT '',
  row_annotations   JSONB NOT NULL DEFAULT '[]',
  range_annotations JSONB NOT NULL DEFAULT '[]',
  column_annotations JSONB NOT NULL DEFAULT '[]',
  saved_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER patterns_set_updated_at
  BEFORE UPDATE ON public.patterns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS 활성화
ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;

-- 정책: 본인 패턴만 조회
CREATE POLICY "patterns: select own"
  ON public.patterns FOR SELECT
  USING (auth.uid() = user_id);

-- 정책: 본인 패턴만 삽입 (user_id = 현재 사용자 강제)
CREATE POLICY "patterns: insert own"
  ON public.patterns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 정책: 본인 패턴만 수정
CREATE POLICY "patterns: update own"
  ON public.patterns FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 정책: 본인 패턴만 삭제
CREATE POLICY "patterns: delete own"
  ON public.patterns FOR DELETE
  USING (auth.uid() = user_id);
