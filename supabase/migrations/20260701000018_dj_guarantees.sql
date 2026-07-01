-- DJ 아티스트: 전국 지역별 게런티 맵 (기존 서울/경기/대전 컬럼은 호환용 유지)
ALTER TABLE public.dj_artists
  ADD COLUMN IF NOT EXISTS guarantees JSONB NOT NULL DEFAULT '{}'::jsonb;
