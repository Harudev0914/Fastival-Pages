-- 렌탈 상품 "상품 상세" 콘텐츠: 상품 이미지(갤러리)와 별개로, HTML 에디터로 작성하는 상세 본문(이미지 포함)
-- 상세페이지 '상세' 탭에 렌더링. 비어있으면 상세 탭/섹션 숨김.
ALTER TABLE public.rental_products ADD COLUMN IF NOT EXISTS detail_html TEXT;
