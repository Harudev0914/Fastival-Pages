-- 회사 정보(푸터/회사카드 노출) — 단일 행(id=1)
CREATE TABLE IF NOT EXISTS public.company_info (
  id                INTEGER PRIMARY KEY DEFAULT 1,
  site_name         TEXT,
  ceo_name          TEXT,
  biz_name          TEXT,
  biz_number        TEXT,
  mail_order_number TEXT,
  phone             TEXT,
  fax               TEXT,
  address           TEXT,
  privacy_officer   TEXT,
  privacy_email     TEXT,
  ad_email          TEXT,
  cs_email          TEXT,
  cs_phone          TEXT,
  tagline           TEXT,
  sns               JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_by        TEXT,
  CONSTRAINT company_info_singleton CHECK (id = 1)
);

DROP TRIGGER IF EXISTS trg_company_info_updated ON public.company_info;
CREATE TRIGGER trg_company_info_updated BEFORE UPDATE ON public.company_info
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ci read"  ON public.company_info;
DROP POLICY IF EXISTS "ci admin" ON public.company_info;
CREATE POLICY "ci read"  ON public.company_info FOR SELECT USING (true);
CREATE POLICY "ci admin" ON public.company_info FOR ALL TO authenticated USING (true) WITH CHECK (true);
GRANT SELECT ON public.company_info TO anon;
GRANT ALL    ON public.company_info TO authenticated;

-- 기본 1행 시드(선택)
INSERT INTO public.company_info (id, site_name, ceo_name, biz_name, biz_number, mail_order_number, phone, fax, address, privacy_officer, privacy_email, ad_email, cs_email, cs_phone, tagline, sns)
VALUES (1, '클립스', '홍길동', '(주)클립스', '123-45-67890', '제2024-서울서초-0000호', '1600-0000', NULL, '서울특별시 서초구 서초대로 74길', '홍길동', 'help@klipse.com', 'contact@klipse.com', 'help@klipse.com', '1600-0000', '공간에 딱 맞는 사운드와 시공을 제안하는 클립스', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
