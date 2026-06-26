-- 1. Ensure schema cache can see new tables
-- 2. Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 3. Ensure RLS is enabled and policies exist
ALTER TABLE public.rental_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated management" ON public.rental_categories;
CREATE POLICY "Allow authenticated management" ON public.rental_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated management" ON public.rental_products;
CREATE POLICY "Allow authenticated management" ON public.rental_products FOR ALL TO authenticated USING (true) WITH CHECK (true);
