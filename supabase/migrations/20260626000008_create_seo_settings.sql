-- SEO 설정 테이블 생성
CREATE TABLE IF NOT EXISTS public.seo_settings (
  id SERIAL PRIMARY KEY,
  title TEXT,
  description TEXT,
  og_image_url TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 권한 부여
GRANT ALL ON TABLE public.seo_settings TO authenticated;
GRANT ALL ON SEQUENCE public.seo_settings_id_seq TO authenticated;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated management" ON public.seo_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
