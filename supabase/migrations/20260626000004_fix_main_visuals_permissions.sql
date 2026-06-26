-- 1. Enable RLS
ALTER TABLE public.main_visuals ENABLE ROW LEVEL SECURITY;

-- 2. Grant Permissions
GRANT SELECT ON public.main_visuals TO authenticated;
-- Add INSERT/UPDATE/DELETE permissions for Admin functionality
GRANT INSERT, UPDATE, DELETE ON public.main_visuals TO authenticated;

-- 3. Create RLS Policy
-- Allow authenticated users to manage (select, insert, update, delete) main_visuals
CREATE POLICY "Allow authenticated users to manage main_visuals" ON public.main_visuals
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
