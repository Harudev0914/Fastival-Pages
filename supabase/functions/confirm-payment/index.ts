// 토스페이먼츠 결제 승인(confirm) Edge Function
//  - 클라이언트가 결제 성공 리다이렉트 후 호출
//  - secret key 로 토스 승인 API 호출 → 성공 시 rental_orders 를 'paid' 로 갱신
//
// 배포:  supabase functions deploy confirm-payment --no-verify-jwt
// 시크릿: supabase secrets set TOSS_SECRET_KEY=test_gsk_xxxxxxxx
//        (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 는 자동 주입)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { paymentKey, orderId, amount } = await req.json();
    if (!paymentKey || !orderId || !amount) return json({ error: '필수 파라미터가 누락되었습니다.' }, 400);

    const secret = Deno.env.get('TOSS_SECRET_KEY');
    if (!secret) return json({ error: '서버에 TOSS_SECRET_KEY 가 설정되지 않았습니다.' }, 500);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // 1) 위변조 방지: 사전 생성한 주문 금액과 결제 금액 일치 확인
    const { data: order, error: findErr } = await supabase
      .from('rental_orders')
      .select('id, total_amount, payment_status')
      .eq('payment_id', orderId)
      .single();
    if (findErr || !order) return json({ error: '주문을 찾을 수 없습니다.' }, 404);
    if (Number(order.total_amount) !== Number(amount)) return json({ error: '결제 금액이 일치하지 않습니다.' }, 400);
    if (order.payment_status === 'paid') return json({ ok: true, already: true });

    // 2) 토스 결제 승인
    const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa(secret + ':'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });
    const toss = await tossRes.json();
    if (!tossRes.ok) return json({ error: toss.message || '결제 승인에 실패했습니다.' }, 400);

    // 3) 주문 확정
    const { error: updErr } = await supabase
      .from('rental_orders')
      .update({ payment_status: 'paid', payment_id: paymentKey, payment_method: toss.method || '카드' })
      .eq('id', order.id);
    if (updErr) return json({ error: updErr.message }, 500);

    return json({ ok: true, method: toss.method, approvedAt: toss.approvedAt });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
