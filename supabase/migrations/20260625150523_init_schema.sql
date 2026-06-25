-- Clean up existing public schema to ensure a fresh start
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- 1. Admin & RBAC
CREATE TABLE IF NOT EXISTS admin_roles (id SERIAL PRIMARY KEY, role_name TEXT UNIQUE);
CREATE TABLE IF NOT EXISTS admins (id SERIAL PRIMARY KEY, username TEXT UNIQUE, password_hash TEXT, role_id INTEGER REFERENCES admin_roles(id));
CREATE TABLE IF NOT EXISTS admin_logs (id SERIAL PRIMARY KEY, admin_id INTEGER REFERENCES admins(id), action TEXT, timestamp TIMESTAMP DEFAULT NOW());

-- 2. Inquiry
CREATE TABLE IF NOT EXISTS inquiries (id SERIAL PRIMARY KEY, user_id INTEGER, title TEXT, status TEXT, type_id INTEGER, created_at TIMESTAMP DEFAULT NOW());
CREATE TABLE IF NOT EXISTS inquiry_questions (id SERIAL PRIMARY KEY, inquiry_id INTEGER REFERENCES inquiries(id), question_text TEXT);
CREATE TABLE IF NOT EXISTS inquiry_options (id SERIAL PRIMARY KEY, question_id INTEGER REFERENCES inquiry_questions(id), option_text TEXT);
CREATE TABLE IF NOT EXISTS inquiry_answers (id SERIAL PRIMARY KEY, inquiry_id INTEGER REFERENCES inquiries(id), answer_text TEXT, created_at TIMESTAMP DEFAULT NOW());
CREATE TABLE IF NOT EXISTS inquiry_files (id SERIAL PRIMARY KEY, inquiry_id INTEGER REFERENCES inquiries(id), file_url TEXT);

-- 3. Rental
CREATE TABLE IF NOT EXISTS rental_categories (id SERIAL PRIMARY KEY, name TEXT);
CREATE TABLE IF NOT EXISTS brands (id SERIAL PRIMARY KEY, name TEXT);
CREATE TABLE IF NOT EXISTS rental_products (id SERIAL PRIMARY KEY, category_id INTEGER REFERENCES rental_categories(id), brand_id INTEGER REFERENCES brands(id), name TEXT, price NUMERIC, description TEXT);
CREATE TABLE IF NOT EXISTS product_specs (id SERIAL PRIMARY KEY, product_id INTEGER REFERENCES rental_products(id), spec_key TEXT, spec_value TEXT);
CREATE TABLE IF NOT EXISTS product_images (id SERIAL PRIMARY KEY, product_id INTEGER REFERENCES rental_products(id), image_url TEXT);

-- 4. DJ
CREATE TABLE IF NOT EXISTS djs (id SERIAL PRIMARY KEY, name TEXT, status TEXT, bio TEXT);
CREATE TABLE IF NOT EXISTS dj_genres (id SERIAL PRIMARY KEY, name TEXT);
CREATE TABLE IF NOT EXISTS dj_portfolios (id SERIAL PRIMARY KEY, dj_id INTEGER REFERENCES djs(id), title TEXT, content_url TEXT);

-- 5. Content
CREATE TABLE IF NOT EXISTS main_visuals (id SERIAL PRIMARY KEY, image_url TEXT, link TEXT, active BOOLEAN);
CREATE TABLE IF NOT EXISTS banners (id SERIAL PRIMARY KEY, image_url TEXT, location TEXT);
CREATE TABLE IF NOT EXISTS popups (id SERIAL PRIMARY KEY, title TEXT, content TEXT, start_date TIMESTAMP, end_date TIMESTAMP);

-- 6. Boards
CREATE TABLE IF NOT EXISTS boards (id SERIAL PRIMARY KEY, name TEXT);
CREATE TABLE IF NOT EXISTS board_posts (id SERIAL PRIMARY KEY, board_id INTEGER REFERENCES boards(id), title TEXT, content TEXT, author_id INTEGER);

-- 7. Statistics
CREATE TABLE IF NOT EXISTS page_views (id SERIAL PRIMARY KEY, page_url TEXT, user_id INTEGER, timestamp TIMESTAMP DEFAULT NOW(), referrer TEXT);
