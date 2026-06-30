import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// 토스 결제 실패/취소 리다이렉트
const PaymentFail: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const message = params.get('message') || '결제가 취소되었거나 실패했습니다.';

  return (
    <div className="rental-page">
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>결제가 완료되지 않았습니다</h2>
        <p style={{ color: '#64748b', marginTop: '10px', lineHeight: 1.6 }}>{message}</p>
        <button onClick={() => navigate(-1)} style={{ marginTop: '28px', background: '#008b8b', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px 28px', fontWeight: 700, cursor: 'pointer' }}>다시 시도</button>
      </div>
    </div>
  );
};

export default PaymentFail;
