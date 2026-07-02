-- 렌탈 상품 가격 고도화: 정가(취소선) + 쿠폰 적용가 (상세페이지 할인율 표시용)
-- 할인율은 저장하지 않고 (list_price - daily_price) / list_price 로 화면에서 계산
ALTER TABLE public.rental_products ADD COLUMN IF NOT EXISTS list_price NUMERIC;    -- 정가(할인 전 일 단가, 취소선). NULL/0 = 할인 표시 안 함
ALTER TABLE public.rental_products ADD COLUMN IF NOT EXISTS coupon_price NUMERIC;  -- 쿠폰 적용가(일 단가). NULL/0 = 쿠폰 표시 안 함
