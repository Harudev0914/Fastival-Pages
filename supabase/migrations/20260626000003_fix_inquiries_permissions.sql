-- 1. Enable RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 2. Grant Permissions
GRANT SELECT ON public.inquiries TO authenticated;

-- 3. Add UUID column for Supabase Auth integration
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS user_uuid UUID REFERENCES auth.users(id);

-- 4. Create RLS Policy
-- Allow users to see their own inquiries based on the new user_uuid column
-- For now, allow authenticated users to see all inquiries until we map the user_uuid
-- REMOVE THIS IN PRODUCTION
CREATE POLICY "Allow authenticated users to read all inquiries" ON public.inquiries
    FOR SELECT
    TO authenticated
    USING (true);

-- 5. Future: Once user_uuid is populated, replace with:
-- CREATE POLICY "Users can only read their own inquiries" ON public.inquiries
--     FOR SELECT
--     TO authenticated
--     USING (auth.uid() = user_uuid);
