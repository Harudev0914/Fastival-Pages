-- 판매(중고 매입) 신청 고도화
--  · 상품 상세 '판매하기' → 회원 전용 · 상품/브랜드/카테고리 자동 기입
--  · 신청 회원(auth.users) 연결 → 어드민에서 회원 정보 조회
ALTER TABLE public.rental_purchase_inquiries
  ADD COLUMN IF NOT EXISTS category_name        TEXT,  -- 2차(소) 카테고리
  ADD COLUMN IF NOT EXISTS parent_category_name TEXT,  -- 1차(대) 카테고리
  ADD COLUMN IF NOT EXISTS owner_user_id        UUID;  -- 판매 신청 회원(auth.users.id)

CREATE INDEX IF NOT EXISTS idx_rental_purchase_owner ON public.rental_purchase_inquiries (owner_user_id);
