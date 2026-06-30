-- Fix RLS permissions for news, faqs, notices, and their categories

-- 1. News
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated insert/update/delete" ON public.news;
CREATE POLICY "Allow authenticated insert/update/delete" ON public.news FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.news_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated insert/update/delete" ON public.news_categories;
CREATE POLICY "Allow authenticated insert/update/delete" ON public.news_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. FAQs (Assuming table names public.faqs and public.faq_categories)
ALTER TABLE IF EXISTS public.faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated insert/update/delete" ON public.faqs;
CREATE POLICY "Allow authenticated insert/update/delete" ON public.faqs FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.faq_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated insert/update/delete" ON public.faq_categories;
CREATE POLICY "Allow authenticated insert/update/delete" ON public.faq_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Notices (Assuming table names public.notices and public.notice_categories)
ALTER TABLE IF EXISTS public.notices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated insert/update/delete" ON public.notices;
CREATE POLICY "Allow authenticated insert/update/delete" ON public.notices FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.notice_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated insert/update/delete" ON public.notice_categories;
CREATE POLICY "Allow authenticated insert/update/delete" ON public.notice_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
