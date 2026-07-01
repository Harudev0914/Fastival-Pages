import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Seo from '../../components/Seo';
import '../Rental/RentalPage.css';

const BLUE = '#2563eb';
const input: React.CSSProperties = { width: '100%', padding: '13px', border: '1px solid #e2e8f0', borderRadius: '9px', fontSize: '0.95rem', boxSizing: 'border-box' };

// 일반 회원가입 (이메일) — 소셜에서 분리된 별도 페이지
const GeneralSignupPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="rental-page">
      <Seo title="일반 회원가입" description="클립스 일반(이메일) 회원가입" keywords="클립스 회원가입,이메일 가입" noindex />
      <div style={{ maxWidth: '440px', margin: '30px auto' }}>
        <button onClick={() => navigate('/signup')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.88rem', marginBottom: '10px' }}>
          <ArrowLeft size={16} /> 회원 유형 선택
        </button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', textAlign: 'center' }}>일반 회원가입</h1>
        <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '6px', fontSize: '0.85rem' }}>준비 중 · 회원 기능은 곧 오픈됩니다</p>

        <form style={{ marginTop: '24px', display: 'grid', gap: '12px' }} onSubmit={(e) => e.preventDefault()}>
          <input style={input} placeholder="이름" />
          <input style={input} type="email" placeholder="이메일" />
          <input style={input} placeholder="연락처" />
          <input style={input} type="password" placeholder="비밀번호" />
          <input style={input} type="password" placeholder="비밀번호 확인" />
          <button type="submit" disabled style={{ background: BLUE, color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', fontWeight: 700, cursor: 'not-allowed', opacity: 0.6 }}>가입하기</button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '18px', fontSize: '0.86rem', color: '#64748b' }}>
          <span>이미 회원이신가요?</span>
          <Link to="/login" style={{ color: BLUE, fontWeight: 700 }}>로그인</Link>
        </div>
      </div>
    </div>
  );
};

export default GeneralSignupPage;
