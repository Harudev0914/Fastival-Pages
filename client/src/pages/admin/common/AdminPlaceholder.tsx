import React from 'react';
import { PageHead, card } from '../../../components/admin/shared';

// 메뉴만 먼저 구성한 준비 중 어드민 페이지
const AdminPlaceholder: React.FC<{ title: string; desc?: string }> = ({ title, desc }) => (
  <div>
    <PageHead title={title} desc={desc || '메뉴 구성이 완료되었습니다. 세부 기능은 준비 중입니다.'} />
    <div style={{ ...card, textAlign: 'center', padding: '70px 20px' }}>
      <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#e0f2f1', color: '#008b8b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{title}</h3>
      <p style={{ color: '#64748b', marginTop: '10px' }}>준비 중인 기능입니다. 곧 제공될 예정입니다.</p>
      <span style={{ display: 'inline-block', marginTop: '16px', background: '#f1f5f9', color: '#94a3b8', fontSize: '0.78rem', fontWeight: 700, padding: '6px 14px', borderRadius: '999px' }}>COMING SOON</span>
    </div>
  </div>
);

export default AdminPlaceholder;
