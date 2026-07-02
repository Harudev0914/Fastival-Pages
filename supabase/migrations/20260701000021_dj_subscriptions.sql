-- DJ 아티스트 구독(프리미엄) — 유료 구독 시 중개료 면제 + 상위 노출 + 프리미엄 섹션 노출
ALTER TABLE public.dj_artists ADD COLUMN IF NOT EXISTS subscription_plan TEXT NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free','premium'));
ALTER TABLE public.dj_artists ADD COLUMN IF NOT EXISTS subscription_started DATE;   -- 구독 시작일
ALTER TABLE public.dj_artists ADD COLUMN IF NOT EXISTS subscription_until DATE;     -- 구독 만료일(NULL=무기한)
ALTER TABLE public.dj_artists ADD COLUMN IF NOT EXISTS subscription_fee NUMERIC;    -- 구독료(원)
ALTER TABLE public.dj_artists ADD COLUMN IF NOT EXISTS birth_year INTEGER;          -- 연령 통계용(출생연도)

CREATE INDEX IF NOT EXISTS idx_dj_artists_subscription ON public.dj_artists (subscription_plan, subscription_until);
