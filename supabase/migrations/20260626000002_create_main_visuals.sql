-- 메인 비주얼 관리 테이블 생성 SQL
CREATE TABLE IF NOT EXISTS main_visuals (
  id SERIAL PRIMARY KEY,
  bg_type VARCHAR(10) NOT NULL, -- 'image' | 'video'
  bg_src TEXT NOT NULL,
  category_text VARCHAR(255),
  main_text VARCHAR(255),
  has_sub_image BOOLEAN DEFAULT FALSE,
  sub_image_type VARCHAR(10), -- 'image'
  sub_image_src TEXT,
  has_timestamp BOOLEAN DEFAULT FALSE,
  target_date TIMESTAMP,
  display_order INTEGER NOT NULL DEFAULT 0,
  font_family VARCHAR(50) DEFAULT 'Giants',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
