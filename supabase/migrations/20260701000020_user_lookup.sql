-- 이메일 → 가입 계정(auth.users) 조회 RPC (승인 요청 발송 시 신청자 이메일로 자동 매칭)
-- SECURITY DEFINER: auth.users 접근을 위해 정의자 권한으로 실행. 이메일 완전일치 1건만 반환
CREATE OR REPLACE FUNCTION public.lookup_user_by_email(p_email TEXT)
RETURNS TABLE(id UUID, email TEXT, name TEXT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id, u.email::text, COALESCE(u.raw_user_meta_data->>'name', '')::text AS name
  FROM auth.users u
  WHERE lower(u.email) = lower(trim(p_email))
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_user_by_email(TEXT) TO authenticated;
