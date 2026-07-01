import React from 'react';
import Seo from '../../components/Seo';
import '../Rental/RentalPage.css';

interface Props {
  title: string;
  desc?: string;
  seoKeywords?: string;
  icon?: React.ReactNode;
}

// 메뉴만 먼저 만들어 둔 준비 중 페이지 (헤더/푸터는 ClientLayout에서 렌더)
const Placeholder: React.FC<Props> = ({ title, desc, seoKeywords, icon }) => (
  <div className="rental-page">
    <Seo title={title} description={desc || `${title} — 클립스`} keywords={seoKeywords} />
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '90px 20px', textAlign: 'center' }}>
      <div style={{ width: '68px', height: '68px', borderRadius: '18px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
        {icon || <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>}
      </div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{title}</h1>
      <p style={{ color: '#64748b', marginTop: '12px', lineHeight: 1.7 }}>{desc || '준비 중인 페이지입니다. 곧 오픈됩니다.'}</p>
      <span style={{ display: 'inline-block', marginTop: '20px', background: '#f1f5f9', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, padding: '6px 14px', borderRadius: '999px' }}>COMING SOON</span>
    </div>
  </div>
);

export default Placeholder;
