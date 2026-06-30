-- 부서별 권한 매트릭스(메뉴키 → {r,c,u,d})
ALTER TABLE public.departments
  ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '{}'::jsonb;
