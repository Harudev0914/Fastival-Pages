import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Header from './Header';

const FOOTER_NAV: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: '시공',
    links: [
      { label: '시공 문의', to: '/construction-inquiry' },
      { label: '포트폴리오', to: '/portfolio' },
      { label: '시공 정보', to: '/info' },
      { label: '시공 후기', to: '/reviews' },
    ],
  },
  {
    title: '고객지원',
    links: [
      { label: '고객센터', to: '/cs' },
      { label: '자주 묻는 질문', to: '/cs' },
      { label: '공지사항', to: '/cs' },
    ],
  },
  {
    title: '약관',
    links: [
      { label: '이용약관', to: '/terms' },
      { label: '개인정보처리방침', to: '/privacy' },
    ],
  },
];

const Footer: React.FC = () => (
  <footer className="site-footer">
    <div className="footer-inner">
      <div className="footer-top">
        <div className="footer-brand">
          <img src="/Klipse_Logo.png" alt="Klipse" className="footer-logo" />
          <p className="footer-tagline">공간에 딱 맞는 사운드와 시공을 제안하는 클립스</p>
          <div className="footer-social">
            <a href="#" aria-label="인스타그램" className="footer-sns">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
            </a>
            <a href="#" aria-label="유튜브" className="footer-sns">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" /></svg>
            </a>
            <a href="#" aria-label="블로그" className="footer-sns">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
            </a>
          </div>
        </div>

        <div className="footer-nav">
          {FOOTER_NAV.map((col) => (
            <div key={col.title} className="footer-col">
              <h4>{col.title}</h4>
              {col.links.map((l) => (
                <Link key={l.label} to={l.to}>{l.label}</Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-legal">
          <p>(주)클립스 · 대표 홍길동 · 사업자등록번호 123-45-67890</p>
          <p>서울특별시 서초구 서초대로 74길 · 고객센터 1600-0000 · help@klipse.com</p>
        </div>
        <p className="footer-copy">© 2026 Klipse. All rights reserved.</p>
      </div>
    </div>

    <style>{`
      .site-footer { margin-top: auto; background: #1e293b; color: #cbd5e1; }
      .footer-inner { max-width: none; margin: 0; padding: 48px 18vw 36px; }
      .footer-top { display: flex; justify-content: space-between; gap: 40px; flex-wrap: wrap; padding-bottom: 32px; border-bottom: 1px solid rgba(255,255,255,0.1); }
      .footer-brand { max-width: 280px; }
      .footer-logo { height: 26px; filter: brightness(0) invert(1); opacity: 0.92; }
      .footer-tagline { margin: 14px 0 16px; font-size: 0.86rem; line-height: 1.6; color: #94a3b8; }
      .footer-social { display: flex; gap: 10px; }
      .footer-sns { width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.18); display: flex; align-items: center; justify-content: center; color: #cbd5e1; transition: background 0.2s, color 0.2s; }
      .footer-sns:hover { background: #fff; color: #1e293b; }
      .footer-nav { display: flex; gap: 56px; flex-wrap: wrap; }
      .footer-col { display: flex; flex-direction: column; gap: 10px; }
      .footer-col h4 { font-size: 0.9rem; font-weight: 700; color: #fff; margin: 0 0 4px; }
      .footer-col a { font-size: 0.84rem; color: #94a3b8; text-decoration: none; transition: color 0.15s; }
      .footer-col a:hover { color: #fff; }
      .footer-bottom { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; padding-top: 24px; }
      .footer-legal p { margin: 0 0 4px; font-size: 0.78rem; color: #94a3b8; line-height: 1.6; }
      .footer-copy { margin: 0; font-size: 0.78rem; color: #64748b; }

      @media (max-width: 1024px) {
        .footer-inner { padding: 40px 4vw 28px; }
      }
      @media (max-width: 767px) {
        .footer-top { flex-direction: column; gap: 28px; }
        .footer-nav { gap: 36px; }
      }
    `}</style>
  </footer>
);

const ClientLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <div id="inquiry-header-portal" /> {/* Portal target */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default ClientLayout;
