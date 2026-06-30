-- Create news_categories table
CREATE TABLE IF NOT EXISTS public.news_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create news table
CREATE TABLE IF NOT EXISTS public.news (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES public.news_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Create basic policies (Assuming authenticated admin access)
CREATE POLICY "Allow public read access" ON public.news_categories FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert/update/delete" ON public.news_categories FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow public read access" ON public.news FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert/update/delete" ON public.news FOR ALL TO authenticated USING (true);
