import React, { useEffect, useState } from 'react';
import { termsApi, TERMS_TYPE_LABEL, type Terms, type TermsType } from '../../api/termsApi';
import Seo from '../../components/Seo';
import '../Rental/RentalPage.css';

// 공개 약관 뷰어 — 활성 약관 중 시행일이 가장 최신인 항목 노출
const TermsViewPage: React.FC<{ type: TermsType }> = ({ type }) => {
  const [item, setItem] = useState<Terms | null>(null);
  const [loading, setLoading] = useState(true);
  const label = TERMS_TYPE_LABEL[type];

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await termsApi.listActive(type);
      setItem((data && data[0]) || null);
      setLoading(false);
    })();
  }, [type]);

  return (
    <div className="rental-page">
      <Seo title={label} description={`클립스 ${label}`} keywords={`클립스 ${label},${label}`} />
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>{label}</h1>
        {item && (
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '24px' }}>
            {item.version ? `버전 ${item.version}` : ''}{item.version && item.effective_date ? ' · ' : ''}{item.effective_date ? `시행일 ${item.effective_date}` : ''}
          </p>
        )}
        {loading ? (
          <div style={{ padding: '80px 0', textAlign: 'center', color: '#94a3b8' }}>불러오는 중...</div>
        ) : !item ? (
          <div style={{ padding: '80px 0', textAlign: 'center', color: '#94a3b8' }}>등록된 {label}이(가) 없습니다.</div>
        ) : (
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: '#334155', fontSize: '0.95rem' }}>{item.content}</div>
        )}
      </div>
    </div>
  );
};

export default TermsViewPage;
