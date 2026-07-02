-- 렌탈 베스트/인기 정렬용: 상품별 판매수량 집계 (결제완료 기준)
-- rental_orders 는 고객 PII(이름·연락처·이메일)를 포함해 anon SELECT 를 막아둠(→ 공개 페이지에서 401).
-- PII 없이 집계값만 돌려주는 SECURITY DEFINER 함수로 공개하여 인기순 정렬에 사용한다.
CREATE OR REPLACE FUNCTION public.rental_sales_count()
RETURNS TABLE (product_id BIGINT, qty BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT product_id, SUM(quantity)::BIGINT AS qty
  FROM public.rental_orders
  WHERE payment_status = 'paid' AND product_id IS NOT NULL
  GROUP BY product_id;
$$;

GRANT EXECUTE ON FUNCTION public.rental_sales_count() TO anon, authenticated;
