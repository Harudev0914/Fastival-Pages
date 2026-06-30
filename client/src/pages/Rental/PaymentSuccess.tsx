import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const TEAL = '#008b8b';

// 토스 결제 성공 리다이렉트 → 서버(Edge Function)에서 최종 승인(confirm)
const PaymentSuccess: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'confirming' | 'ok' | 'error'>('confirming');
  const [message, setMessage] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // StrictMode 중복 호출 방지
    ran.current = true;
    const paymentKey = params.get('paymentKey');
    const orderId = params.get('orderId');
    const amount = Number(params.get('amount'));
    if (!paymentKey || !orderId || !amount) { setStatus('error'); setMessage('결제 정보가 올바르지 않습니다.'); return; }

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('confirm-payment', {
          body: { paymentKey, orderId, amount },
        });
        if (error || (data && data.error)) {
          setStatus('error');
          setMessage((data && data.error) || error?.message || '결제 승인에 실패했습니다.');
          return;
        }
        setStatus('ok');
      } catch (e: any) {
        setStatus('error');
        setMessage(e?.message || '결제 승인 중 오류가 발생했습니다.');
      }
    })();
  }, [params]);

  return (
    <div className="rental-page">
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
        {status === 'confirming' && <p style={{ color: '#64748b' }}>결제를 확인하고 있습니다...</p>}

        {status === 'ok' && (
          <>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', color: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>결제가 완료되었습니다</h2>
            <p style={{ color: '#64748b', marginTop: '10px', lineHeight: 1.6 }}>렌탈 예약이 확정되었습니다. 배송·설치 일정은 담당자가 안내드립니다.</p>
            <button onClick={() => navigate('/rental')} style={{ marginTop: '28px', background: TEAL, color: '#fff', border: 'none', borderRadius: '10px', padding: '13px 28px', fontWeight: 700, cursor: 'pointer' }}>렌탈 홈으로</button>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>결제 승인 실패</h2>
            <p style={{ color: '#64748b', marginTop: '10px', lineHeight: 1.6 }}>{message}</p>
            <button onClick={() => navigate('/rental')} style={{ marginTop: '28px', background: '#475569', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px 28px', fontWeight: 700, cursor: 'pointer' }}>렌탈 홈으로</button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
