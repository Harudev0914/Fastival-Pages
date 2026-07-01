import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../../components/Seo';
import '../Rental/RentalPage.css';

const BLUE = '#2563eb';
const input: React.CSSProperties = { width: '100%', padding: '13px', border: '1px solid #e2e8f0', borderRadius: '9px', fontSize: '0.95rem', boxSizing: 'border-box' };

// 회원 로그인 (UI 준비 — 기능 연동 예정)
const LoginPage: React.FC = () => (
  <div className="rental-page">
    <Seo title="로그인" description="클립스 회원 로그인" keywords="클립스 로그인,회원 로그인" noindex />
    <div style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', textAlign: 'center' }}>로그인</h1>
      <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '6px', fontSize: '0.85rem' }}>준비 중 · 회원 기능은 곧 오픈됩니다</p>

      {/* 소셜 로그인 (우선 카카오만) */}
      <button
        type="button"
        onClick={() => alert('카카오 로그인은 준비 중입니다.')}
        style={{ width: '100%', marginTop: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#FEE500', color: 'rgba(0,0,0,0.85)', border: 'none', borderRadius: '10px', padding: '14px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.77 1.86 5.2 4.66 6.58-.15.53-.97 3.35-1 3.57 0 0-.02.17.09.24.11.06.24.01.24.01.31-.04 3.6-2.36 4.17-2.76.6.08 1.21.13 1.84.13 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/></svg>
        카카오로 로그인
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0 4px' }}>
        <span style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>또는 이메일 로그인</span>
        <span style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
      </div>

      <form style={{ marginTop: '14px', display: 'grid', gap: '12px' }} onSubmit={(e) => e.preventDefault()}>
        <input style={input} type="email" placeholder="이메일" />
        <input style={input} type="password" placeholder="비밀번호" />
        <button type="submit" disabled style={{ background: BLUE, color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', fontWeight: 700, cursor: 'not-allowed', opacity: 0.6 }}>로그인</button>
      </form>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '18px', fontSize: '0.86rem', color: '#64748b' }}>
        <span>아직 회원이 아니신가요?</span>
        <Link to="/signup" style={{ color: BLUE, fontWeight: 700 }}>회원가입</Link>
      </div>
    </div>
  </div>
);

export default LoginPage;
