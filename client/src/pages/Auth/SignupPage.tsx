import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Disc3, User } from 'lucide-react';
import Seo from '../../components/Seo';
import '../Rental/RentalPage.css';

const BLUE = '#2563eb';
const input: React.CSSProperties = { width: '100%', padding: '13px', border: '1px solid #e2e8f0', borderRadius: '9px', fontSize: '0.95rem', boxSizing: 'border-box' };

type Tab = 'general' | 'artist';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('general');

  const tabBtn = (t: Tab): React.CSSProperties => ({
    flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
    padding: '13px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.92rem',
    border: tab === t ? `2px solid ${BLUE}` : '1px solid #e2e8f0',
    background: tab === t ? '#eff6ff' : '#fff', color: tab === t ? BLUE : '#64748b',
  });

  return (
    <div className="rental-page">
      <Seo title="회원가입" description="클립스 회원가입 — 일반회원 / 아티스트회원" keywords="클립스 회원가입,회원 가입,아티스트 회원,DJ 입점" noindex />
      <div style={{ maxWidth: '440px', margin: '40px auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', textAlign: 'center' }}>회원가입</h1>

        {/* 회원 구분 탭 */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '22px' }}>
          <button type="button" style={tabBtn('general')} onClick={() => setTab('general')}>
            <User size={16} /> 일반회원
          </button>
          <button type="button" style={tabBtn('artist')} onClick={() => setTab('artist')}>
            <Disc3 size={16} /> 아티스트회원
          </button>
        </div>

        {tab === 'general' ? (
          <>
            {/* 소셜 로그인 (우선 카카오만) */}
            <div style={{ marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => alert('카카오 로그인은 준비 중입니다.')}
                style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#FEE500', color: 'rgba(0,0,0,0.85)', border: 'none', borderRadius: '10px', padding: '14px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.77 1.86 5.2 4.66 6.58-.15.53-.97 3.35-1 3.57 0 0-.02.17.09.24.11.06.24.01.24.01.31-.04 3.6-2.36 4.17-2.76.6.08 1.21.13 1.84.13 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/></svg>
                카카오로 시작하기
              </button>
            </div>

            {/* 구분선 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0 4px' }}>
              <span style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>또는 일반 회원가입</span>
              <span style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '10px', fontSize: '0.82rem' }}>준비 중 · 일반 회원 기능은 곧 오픈됩니다</p>
            <form style={{ marginTop: '12px', display: 'grid', gap: '12px' }} onSubmit={(e) => e.preventDefault()}>
              <input style={input} placeholder="이름" />
              <input style={input} type="email" placeholder="이메일" />
              <input style={input} placeholder="연락처" />
              <input style={input} type="password" placeholder="비밀번호" />
              <input style={input} type="password" placeholder="비밀번호 확인" />
              <button type="submit" disabled style={{ background: BLUE, color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', fontWeight: 700, cursor: 'not-allowed', opacity: 0.6 }}>가입하기</button>
            </form>
          </>
        ) : (
          <div style={{ marginTop: '18px', textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '28px 20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#eff6ff', color: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Disc3 size={26} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>DJ 아티스트로 활동하세요</h3>
            <p style={{ color: '#64748b', marginTop: '10px', lineHeight: 1.6, fontSize: '0.9rem' }}>
              서류·포트폴리오·게런티·섭외 지역을 등록하면<br />심사 후 아티스트 회원으로 활동할 수 있어요.
            </p>
            <button onClick={() => navigate('/dj/apply')} style={{ marginTop: '18px', background: BLUE, color: '#fff', border: 'none', borderRadius: '10px', padding: '13px 24px', fontWeight: 700, cursor: 'pointer' }}>
              아티스트 등록하러 가기
            </button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', fontSize: '0.86rem', color: '#64748b' }}>
          <span>이미 회원이신가요?</span>
          <Link to="/login" style={{ color: BLUE, fontWeight: 700 }}>로그인</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
