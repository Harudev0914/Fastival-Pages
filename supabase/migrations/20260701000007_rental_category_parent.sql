-- 렌탈 카테고리 2Depth: 상위 카테고리(parent_id)
ALTER TABLE public.rental_categories
  ADD COLUMN IF NOT EXISTS parent_id BIGINT REFERENCES public.rental_categories(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_rental_categories_parent ON public.rental_categories (parent_id, display_order);
