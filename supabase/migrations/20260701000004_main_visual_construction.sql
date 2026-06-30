-- 메인 비주얼: 시공 섹션용 필드
--  · is_ad           : AD 배너 여부(우측 고정 배너)
--  · image_mobile_url: AD 모바일(가로) 이미지
--  · author_name     : 클라이언트 표시 등록자명
--  · author_avatar   : 등록자 아바타 이미지
ALTER TABLE public.main_visual_banners
  ADD COLUMN IF NOT EXISTS is_ad            BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS image_mobile_url TEXT,
  ADD COLUMN IF NOT EXISTS author_name      TEXT,
  ADD COLUMN IF NOT EXISTS author_avatar    TEXT;
