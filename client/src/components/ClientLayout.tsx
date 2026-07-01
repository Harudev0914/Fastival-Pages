import React, { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Header from './Header';
import { companyApi, type CompanyInfo } from '../api/companyApi';

const IcInstagram = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
const IcYoutube = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" /></svg>;
const IcX = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" /></svg>;
const IcTiktok = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.82s.51.5 0 0A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.32-1.48z" /></svg>;

const DEFAULTS = {
  site_name: '클립스', ceo_name: '홍길동', biz_name: '(주)클립스', biz_number: '123-45-67890',
  mail_order_number: '', phone: '1600-0000', fax: '', address: '서울특별시 서초구 서초대로 74길',
  privacy_officer: '', privacy_email: 'help@klipse.com', ad_email: '', cs_email: 'help@klipse.com',
  cs_phone: '1600-0000', tagline: '공간에 딱 맞는 사운드와 시공을 제안하는 클립스',
};

const Sep = () => <span className="footer-sep">|</span>;

const Footer: React.FC = () => {
  const [c, setC] = useState<CompanyInfo | null>(null);
  useEffect(() => { (async () => { const { data } = await companyApi.get(); setC(data); })(); }, []);

  const g = (k: keyof typeof DEFAULTS) => (c && (c as any)[k]) || DEFAULTS[k];
  const sns = c?.sns || {};
  const snsItems = [
    { key: 'naverblog', node: <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>N</span>, url: sns.naverblog },
    { key: 'instagram', node: <IcInstagram />, url: sns.instagram },
    { key: 'youtube', node: <IcYoutube />, url: sns.youtube },
    { key: 'x', node: <IcX />, url: sns.x },
    { key: 'tiktok', node: <IcTiktok />, url: sns.tiktok },
  ].filter((s) => s.url);

  const year = '2026';

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-head">
          <img src="/Klipse_Logo.png" alt="Klipse" className="footer-logo" />
        </div>

        <div className="footer-divider" />

        <div className="footer-legal">
          <p>사이트명 <b>{g('site_name')}</b> <Sep /> 대표자 <b>{g('ceo_name')}</b></p>
          <p>사업자명 <b>{g('biz_name')}</b></p>
          <p>사업자등록번호 {g('biz_number')}{g('mail_order_number') && <><Sep /> 통신판매업 {g('mail_order_number')}</>}</p>
          <p>대표번호 {g('phone')}{g('fax') && <><Sep /> 팩스 {g('fax')}</>} <Sep /> 주소 {g('address')}</p>
          {(g('privacy_officer') || g('privacy_email')) && (
            <p>개인정보 책임관리자 {g('privacy_officer')} {g('privacy_email') && <a href={`mailto:${g('privacy_email')}`}>({g('privacy_email')})</a>}</p>
          )}
          <p>
            {g('ad_email') && <>광고제휴문의 <a href={`mailto:${g('ad_email')}`}>{g('ad_email')}</a> <Sep /> </>}
            CS 고객센터 <a href={`mailto:${g('cs_email')}`}>{g('cs_email')}</a>
          </p>
        </div>

        {g('tagline') && <p className="footer-disclaimer">{g('tagline')}</p>}

        {snsItems.length > 0 && (
          <div className="footer-social">
            {snsItems.map((s) => (
              <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" className="footer-sns" aria-label={s.key}>{s.node}</a>
            ))}
          </div>
        )}

        <div className="footer-bottom">
          <nav className="footer-policy">
            <Link to="/privacy">개인정보처리방침</Link>
            <Sep />
            <Link to="/terms">서비스 이용약관</Link>
          </nav>
          <p className="footer-copy">Copyright {g('biz_name')} {year} All rights reserved.</p>
        </div>
      </div>

      <style>{`
        .site-footer { margin-top: auto; background: #f7f9fa; color: #6b7280; border-top: 1px solid #eceef1; }
        .footer-inner { max-width: none; margin: 0; padding: 44px 18vw 40px; }
        .footer-head { display: flex; align-items: center; gap: 28px; flex-wrap: wrap; }
        .footer-logo { height: 26px; }
        .footer-links { display: flex; gap: 26px; flex-wrap: wrap; }
        .footer-links a { font-size: 0.92rem; font-weight: 600; color: #374151; text-decoration: none; transition: color 0.15s; }
        .footer-links a:hover { color: #2563eb; }
        .footer-divider { height: 1px; background: #e5e7eb; margin: 22px 0; }
        .footer-legal p { margin: 0 0 8px; font-size: 0.84rem; color: #6b7280; line-height: 1.5; }
        .footer-legal b { font-weight: 600; color: #4b5563; }
        .footer-legal a { color: #6b7280; text-decoration: underline; }
        .footer-sep { margin: 0 9px; color: #d1d5db; }
        .footer-disclaimer { margin: 16px 0 0; font-size: 0.82rem; color: #9ca3af; line-height: 1.6; }
        .footer-social { display: flex; gap: 10px; margin-top: 22px; }
        .footer-sns { width: 38px; height: 38px; border-radius: 50%; background: #e5e7eb; color: #4b5563; display: flex; align-items: center; justify-content: center; transition: background 0.2s, color 0.2s; }
        .footer-sns:hover { background: #2563eb; color: #fff; }
        .footer-bottom { margin-top: 26px; }
        .footer-policy { display: flex; align-items: center; gap: 0; margin-bottom: 10px; }
        .footer-policy a { font-size: 0.82rem; font-weight: 700; color: #374151; text-decoration: none; }
        .footer-policy a:hover { color: #2563eb; }
        .footer-copy { margin: 0; font-size: 0.8rem; color: #9ca3af; }

        @media (max-width: 1024px) { .footer-inner { padding: 36px 4vw 28px; } }
        @media (max-width: 767px) {
          .footer-head { gap: 16px; }
          .footer-links { gap: 18px; }
          .footer-legal p { font-size: 0.8rem; }
          .footer-sep { margin: 0 6px; }
        }
      `}</style>
    </footer>
  );
};

const ClientLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <div id="inquiry-header-portal" /> {/* Portal target */}
      <main style={{ flex: 1, background: '#fff' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default ClientLayout;
