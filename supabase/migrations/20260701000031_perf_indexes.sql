-- 성능 튜닝: 자주 필터/정렬되는 컬럼에 인덱스 추가 (모두 IF NOT EXISTS · 추가 전용, 데이터 변경 없음)

-- 1) news — 인덱스 전무. 공개 목록(활성/최신순)·카테고리 필터용
CREATE INDEX IF NOT EXISTS idx_news_active_created   ON public.news (is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category_created ON public.news (category_id, created_at DESC);

-- 2) 렌탈 브랜드/카테고리 — listActive()의 is_active 필터 + display_order 정렬 커버
CREATE INDEX IF NOT EXISTS idx_rental_brands_active     ON public.rental_brands (is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_rental_categories_active ON public.rental_categories (is_active, display_order);

-- 3) 시공 업체 — listActive()의 is_active 필터
CREATE INDEX IF NOT EXISTS idx_con_companies_active ON public.construction_companies (is_active, display_order);

-- 4) 시공 업무 — 캘린더/일정 뷰(status != 'hold' AND scheduled_start ...) 커버
CREATE INDEX IF NOT EXISTS idx_con_works_status_sched ON public.construction_works (status, scheduled_start);
