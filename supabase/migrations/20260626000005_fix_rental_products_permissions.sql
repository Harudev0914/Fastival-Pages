-- rental_products 테이블 권한 설정
ALTER TABLE public.rental_products ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rental_products TO authenticated;

CREATE POLICY "Allow authenticated users to manage rental_products" ON public.rental_products
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
