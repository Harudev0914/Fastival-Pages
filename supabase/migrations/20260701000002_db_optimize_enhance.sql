-- =============================================================
-- 기존 DB 최적화 & 고도화 (현재 운영 스키마 기준 보정)
--  · inquiry_questions  : 챗봇 룰베이스에 필요한 컬럼 보강(is_active/use_categories/audit)
--  · construction_inquiries : 개인정보/마케팅 동의 컬럼 보강
--  · 성능 인덱스 추가
--  · (선택) 미사용 레거시 테이블 정리
--  ※ main_visual_banners / rental_* 테이블은
--    20260701000000, 20260701000001 마이그레이션에서 생성됩니다.
-- =============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1) inquiry_questions (챗봇 룰베이스) 컬럼 보강 ----------------------
ALTER TABLE public.inquiry_questions
  ADD COLUMN IF NOT EXISTS is_active      BOOLEAN     NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS use_categories BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at     TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  ADD COLUMN IF NOT EXISTS created_by     TEXT,
  ADD COLUMN IF NOT EXISTS updated_by     TEXT;

-- display_order NULL 방지
UPDATE public.inquiry_questions SET display_order = 0 WHERE display_order IS NULL;
ALTER TABLE public.inquiry_questions ALTER COLUMN display_order SET DEFAULT 0;

DROP TRIGGER IF EXISTS trg_inquiry_questions_updated ON public.inquiry_questions;
CREATE TRIGGER trg_inquiry_questions_updated BEFORE UPDATE ON public.inquiry_questions
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- 공개 챗봇은 활성 질문을 읽어야 하므로 공개 SELECT + 관리자 전체 권한
ALTER TABLE public.inquiry_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "iq read"  ON public.inquiry_questions;
DROP POLICY IF EXISTS "iq admin" ON public.inquiry_questions;
CREATE POLICY "iq read"  ON public.inquiry_questions FOR SELECT USING (true);
CREATE POLICY "iq admin" ON public.inquiry_questions FOR ALL TO authenticated USING (true) WITH CHECK (true);
GRANT SELECT ON public.inquiry_questions TO anon;
GRANT ALL    ON public.inquiry_questions TO authenticated;

-- 2) construction_inquiries 동의 컬럼 보강 --------------------------
ALTER TABLE public.construction_inquiries
  ADD COLUMN IF NOT EXISTS privacy_agree   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_agree BOOLEAN NOT NULL DEFAULT false;

-- 3) 성능 인덱스 ----------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_reviews_category   ON public.construction_reviews (category_id, display_order);
CREATE INDEX IF NOT EXISTS idx_reviews_active     ON public.construction_reviews (is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_category ON public.construction_portfolio (category_id, display_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_active   ON public.construction_portfolio (is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_categories_active  ON public.construction_categories (is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_iq_order           ON public.inquiry_questions (is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_cinq_created       ON public.construction_inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cinq_status        ON public.construction_inquiries (status);

-- 4) (선택) 미사용 레거시 테이블 정리 --------------------------------
--   아래는 구(舊) 게시판/문의 시스템 잔여 테이블입니다.
--   현재 시공/렌탈 플로우에서 사용하지 않는다면 주석을 해제해 삭제하세요.
--   (삭제 전 데이터 백업 권장)
-- DROP TABLE IF EXISTS public.inquiry_options  CASCADE;
-- DROP TABLE IF EXISTS public.inquiry_files    CASCADE;
-- DROP TABLE IF EXISTS public.inquiry_answers  CASCADE;
-- DROP TABLE IF EXISTS public.inquiries        CASCADE;
-- DROP TABLE IF EXISTS public.board_posts      CASCADE;
-- DROP TABLE IF EXISTS public.boards           CASCADE;
