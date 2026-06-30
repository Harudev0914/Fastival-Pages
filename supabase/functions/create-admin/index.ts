// 관리자 생성/삭제 (Supabase Auth 유저까지 service_role 로 처리)
//  배포:  supabase functions deploy create-admin
//  (verify_jwt 기본 ON → 로그인된 관리자만 호출 가능)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const body = await req.json();
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    if (body.action === 'create') {
      const { email, password, name, phone, desired_email, department_id } = body;
      if (!email || !password) return json({ error: '이메일과 비밀번호는 필수입니다.' }, 400);
      const { data: u, error } = await admin.auth.admin.createUser({
        email, password, email_confirm: true, user_metadata: { name },
      });
      if (error) return json({ error: error.message }, 400);
      const { error: e2 } = await admin.from('admins').insert({
        auth_user_id: u.user?.id, email, name: name || null, phone_number: phone || null,
        desired_email: desired_email || null, department_id: department_id || null,
      });
      if (e2) return json({ error: e2.message }, 500);
      return json({ ok: true });
    }

    if (body.action === 'delete') {
      const { auth_user_id, id } = body;
      if (auth_user_id) { try { await admin.auth.admin.deleteUser(auth_user_id); } catch { /* 무시 */ } }
      if (id) await admin.from('admins').delete().eq('id', id);
      return json({ ok: true });
    }

    return json({ error: '알 수 없는 action' }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
