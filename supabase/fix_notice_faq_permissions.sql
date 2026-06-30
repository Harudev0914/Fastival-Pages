-- 1. Fix Permissions for Notices and FAQs tables
GRANT SELECT ON TABLE public.notices TO anon, authenticated;
GRANT SELECT ON TABLE public.notice_categories TO anon, authenticated;

GRANT SELECT ON TABLE public.faqs TO anon, authenticated;
GRANT SELECT ON TABLE public.faq_categories TO anon, authenticated;

-- 2. Ensure RLS is enabled and accessible
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- 3. Re-apply policies
DROP POLICY IF EXISTS "Allow public read access" ON public.notices;
CREATE POLICY "Allow public read access" ON public.notices FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.faqs;
CREATE POLICY "Allow public read access" ON public.faqs FOR SELECT TO anon, authenticated USING (true);
