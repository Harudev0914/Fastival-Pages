-- 보안: 공개 스키마에 노출됐지만 RLS 가 꺼져 있던 레거시 테이블 잠금 (Supabase Security Advisor: RLS disabled in public)
-- 대상: admin_roles / admin_logs / popups — 초기 스키마(20260625150523)의 미사용 테이블.
--   · 클라이언트/서버 어디에서도 참조하지 않음(확인 완료).
--   · 이 앱의 authenticated 롤에는 일반 가입 회원도 포함되므로 authenticated 허용 정책은 관리자 데이터 유출 위험 → 정책을 두지 않음.
--   · RLS 활성화 + 정책 없음 = anon/authenticated 접근 전면 차단. 서버(service_role)는 RLS 를 우회하므로 영향 없음.
--   · 추후 기능에서 필요해지면 그때 범위를 좁힌 정책을 추가한다.

ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.popups      ENABLE ROW LEVEL SECURITY;
