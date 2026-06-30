-- 시공 카테고리 이미지(포트폴리오 탭 노출용)
ALTER TABLE public.construction_categories
  ADD COLUMN IF NOT EXISTS image_url TEXT;
