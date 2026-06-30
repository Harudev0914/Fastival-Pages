-- 렌탈 상품: 단독상품 / 기획전 노출 플래그 추가
ALTER TABLE public.rental_products
  ADD COLUMN IF NOT EXISTS is_exclusive BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_event     BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_rental_products_flags ON public.rental_products (is_exclusive, is_event);
