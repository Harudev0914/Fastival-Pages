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
      <form style={{ marginTop: '28px', display: 'grid', gap: '12px' }} onSubmit={(e) => e.preventDefault()}>
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
