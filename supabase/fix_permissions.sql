-- Fix permissions for news table
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE public.news TO anon, authenticated;
GRANT SELECT ON TABLE public.news_categories TO anon, authenticated;

-- Fix permissions for inquiries table
GRANT SELECT ON TABLE public.inquiries TO anon, authenticated;

-- Ensure RLS is enabled and policies are correct
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Re-apply policies to be safe (dropping them first if they exist to avoid conflict)
DROP POLICY IF EXISTS "Allow public read access" ON public.news;
CREATE POLICY "Allow public read access" ON public.news FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.inquiries;
CREATE POLICY "Allow public read access" ON public.inquiries FOR SELECT TO anon, authenticated USING (true);
