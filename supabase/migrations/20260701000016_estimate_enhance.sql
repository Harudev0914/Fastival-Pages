-- 견적서 고도화: 견적번호(자동 채번) + 발행일 + 계약조건/특약사항
-- (대시보드/칸반/캘린더 필터/통계 기간필터/CSV 내보내기는 기존 테이블만 조회하므로 스키마 변경 없음)

-- 1) 컬럼 추가
ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS estimate_no TEXT;
ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS issue_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS terms TEXT;   -- 계약 조건 / 특약사항

-- 2) 견적번호 채번용 시퀀스 (타입 접두어 + 연도 + 4자리 일련번호)
CREATE SEQUENCE IF NOT EXISTS public.estimates_no_seq;

CREATE OR REPLACE FUNCTION public.set_estimate_no()
RETURNS TRIGGER AS $$
DECLARE prefix TEXT;
BEGIN
  IF NEW.estimate_no IS NULL OR NEW.estimate_no = '' THEN
    prefix := CASE NEW.type
      WHEN 'construction' THEN 'SG'   -- 시공
      WHEN 'rental' THEN 'RT'         -- 렌탈
      WHEN 'dj' THEN 'DJ'             -- DJ 프리랜서
      ELSE 'ES' END;
    NEW.estimate_no := prefix || '-'
      || to_char(COALESCE(NEW.issue_date, CURRENT_DATE), 'YYYY') || '-'
      || lpad(nextval('public.estimates_no_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_estimates_no ON public.estimates;
CREATE TRIGGER trg_estimates_no BEFORE INSERT ON public.estimates
  FOR EACH ROW EXECUTE PROCEDURE public.set_estimate_no();

-- 3) 기존 데이터 백필 (발행일 = 작성일, 견적번호 = 채번)
UPDATE public.estimates SET issue_date = created_at::date WHERE issue_date IS NULL;

DO $$
DECLARE r RECORD; pfx TEXT;
BEGIN
  FOR r IN SELECT id, type, created_at FROM public.estimates WHERE estimate_no IS NULL ORDER BY id LOOP
    pfx := CASE r.type WHEN 'construction' THEN 'SG' WHEN 'rental' THEN 'RT' WHEN 'dj' THEN 'DJ' ELSE 'ES' END;
    UPDATE public.estimates
      SET estimate_no = pfx || '-' || to_char(r.created_at, 'YYYY') || '-' || lpad(nextval('public.estimates_no_seq')::text, 4, '0')
      WHERE id = r.id;
  END LOOP;
END $$;

-- 4) 견적번호 유니크 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS uq_estimates_no ON public.estimates (estimate_no);

-- 5) 시퀀스 사용 권한 (RLS INSERT 시 트리거가 nextval 호출)
GRANT USAGE, SELECT ON SEQUENCE public.estimates_no_seq TO authenticated;
