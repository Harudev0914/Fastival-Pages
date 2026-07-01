import React from 'react';

// 소셜 로그인/회원가입 버튼 (우선 UI만 — 실제 OAuth 연동 예정)
const KakaoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.77 1.86 5.2 4.66 6.58-.15.53-.97 3.35-1 3.57 0 0-.02.17.09.24.11.06.24.01.24.01.31-.04 3.6-2.36 4.17-2.76.6.08 1.21.13 1.84.13 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/></svg>
);
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
);
const NaverIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M16.27 12.84 7.5 0H0v24h7.73V11.16L16.5 24H24V0h-7.73z"/></svg>
);

const base: React.CSSProperties = {
  width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  border: 'none', borderRadius: '10px', padding: '14px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
};

const SocialAuthButtons: React.FC<{ verb?: string }> = ({ verb = '시작하기' }) => {
  const soon = (name: string) => alert(`${name} 로그인은 준비 중입니다.`);
  return (
    <div style={{ display: 'grid', gap: '10px' }}>
      <button type="button" onClick={() => soon('카카오')} style={{ ...base, background: '#FEE500', color: 'rgba(0,0,0,0.85)' }}>
        <KakaoIcon /> 카카오로 {verb}
      </button>
      <button type="button" onClick={() => soon('구글')} style={{ ...base, background: '#fff', color: '#3c4043', border: '1px solid #dadce0' }}>
        <GoogleIcon /> 구글로 {verb}
      </button>
      <button type="button" onClick={() => soon('네이버')} style={{ ...base, background: '#03C75A', color: '#fff' }}>
        <NaverIcon /> 네이버로 {verb}
      </button>
    </div>
  );
};

export default SocialAuthButtons;
