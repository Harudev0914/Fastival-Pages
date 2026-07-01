import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Seo from '../../components/Seo';
import SocialAuthButtons from '../../components/SocialAuthButtons';
import '../Rental/RentalPage.css';

const BLUE = '#2563eb';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="rental-page">
      <Seo title="로그인" description="클립스 회원 로그인" keywords="클립스 로그인,회원 로그인" noindex />
      <div style={{ maxWidth: '400px', margin: '40px auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', textAlign: 'center' }}>로그인</h1>
        <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '6px', fontSize: '0.85rem' }}>소셜 계정으로 간편하게 시작하세요</p>

        <div style={{ marginTop: '26px' }}>
          <SocialAuthButtons verb="로그인" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '22px 0' }}>
          <span style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>또는</span>
          <span style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>

        <button onClick={() => navigate('/login/email')} style={{ width: '100%', background: '#fff', color: BLUE, border: `1.5px solid ${BLUE}`, borderRadius: '10px', padding: '14px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
          이메일로 로그인
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', fontSize: '0.86rem', color: '#64748b' }}>
          <span>아직 회원이 아니신가요?</span>
          <Link to="/signup" style={{ color: BLUE, fontWeight: 700 }}>회원가입</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
