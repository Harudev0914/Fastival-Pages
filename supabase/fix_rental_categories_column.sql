-- Add missing is_active column to rental_categories
ALTER TABLE public.rental_categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
