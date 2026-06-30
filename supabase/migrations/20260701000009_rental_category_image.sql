-- 렌탈 카테고리 이미지(1차 카테고리 퀵메뉴 노출용)
ALTER TABLE public.rental_categories
  ADD COLUMN IF NOT EXISTS image_url TEXT;
