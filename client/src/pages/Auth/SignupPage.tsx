import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Disc3, User } from 'lucide-react';
import Seo from '../../components/Seo';
import SocialAuthButtons from '../../components/SocialAuthButtons';
import '../Rental/RentalPage.css';

const BLUE = '#2563eb';

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
            {/* 소셜 회원가입 (카카오/구글/네이버) */}
            <div style={{ marginTop: '22px' }}>
              <SocialAuthButtons verb="시작하기" />
            </div>

            {/* 구분선 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '22px 0' }}>
              <span style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>또는</span>
              <span style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            {/* 일반 회원가입 → 별도 페이지 */}
            <button type="button" onClick={() => navigate('/signup/general')} style={{ width: '100%', background: '#fff', color: BLUE, border: `1.5px solid ${BLUE}`, borderRadius: '10px', padding: '14px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
              일반 회원가입
            </button>
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
