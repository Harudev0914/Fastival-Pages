import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Check, ChevronRight } from 'lucide-react';
import Seo from '../../components/Seo';
import IdentityVerifySheet from '../../components/Auth/IdentityVerifySheet';
import { supabase } from '../../supabaseClient';
import type { VerifiedIdentity } from '../../api/certApi';
import './Auth.css';

const KakaoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.77 1.86 5.2 4.66 6.58-.15.53-.97 3.35-1 3.57 0 0-.02.17.09.24.11.06.24.01.24.01.31-.04 3.6-2.36 4.17-2.76.6.08 1.21.13 1.84.13 5.52 0 10-3.48 10-7.8S17.52 3 12 3z" /></svg>
);
const NaverIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M16.27 12.84 7.5 0H0v24h7.73V11.16L16.5 24H24V0h-7.73z" /></svg>
);
const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12.261 7.212a3.901 3.901 0 0 0 1.487-.45 3.822 3.822 0 0 0 1.182-.992 4.554 4.554 0 0 0 1.067-2.78 2.172 2.172 0 0 0 0-.387 4.37 4.37 0 0 0-2.903 1.547 4.288 4.288 0 0 0-1.067 2.686 1.216 1.216 0 0 0 0 .355l.235.021ZM9.134 22.495c1.217 0 1.75-.826 3.266-.826s1.879.805 3.202.805c1.324 0 2.21-1.244 3.042-2.457A11.143 11.143 0 0 0 20 17.205a4.436 4.436 0 0 1-1.927-1.623 4.303 4.303 0 0 1-.71-2.39c.005-.757.203-1.5.576-2.163a4.576 4.576 0 0 1 1.56-1.632 4.55 4.55 0 0 0-1.688-1.466 4.658 4.658 0 0 0-2.198-.5c-1.494 0-2.711.91-3.469.91s-1.91-.857-3.202-.857C6.487 7.484 4 9.574 4 13.39a12.36 12.36 0 0 0 2.06 6.575c1.003 1.39 1.847 2.53 3.074 2.53Z" />
  </svg>
);

type Step = 'login' | 'terms' | 'form';

interface Props { initialMode?: 'login' | 'signup'; }

const AuthPage: React.FC<Props> = ({ initialMode = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from || '/mypage';

  const [step, setStep] = useState<Step>(initialMode === 'signup' ? 'terms' : 'login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // 로그인
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);

  // 약관
  const [agree, setAgree] = useState({ age: false, tos: false, marketing: false, ad: false });
  const allOn = agree.age && agree.tos && agree.marketing && agree.ad;
  const canProceed = agree.age && agree.tos; // 필수 2건
  const toggleAll = () => { const v = !allOn; setAgree({ age: v, tos: v, marketing: v, ad: v }); };

  // 본인인증 결과 → 가입 폼
  const [sheetOpen, setSheetOpen] = useState(false);
  const [identity, setIdentity] = useState<VerifiedIdentity | null>(null);
  const [signupPw, setSignupPw] = useState('');
  const [signupPw2, setSignupPw2] = useState('');

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email]);

  // ---- 로그인 ----
  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pw });
    setBusy(false);
    if (error) { setError('이메일 또는 비밀번호를 확인해 주세요.'); return; }
    navigate(redirectTo, { replace: true });
  };

  // ---- 소셜 ----
  const oauth = async (provider: 'kakao' | 'naver' | 'apple') => {
    setError('');
    const label = provider === 'kakao' ? '카카오' : provider === 'naver' ? '네이버' : 'Apple';
    // 네이버는 Supabase 기본 제공 provider가 아니라 별도 연동이 필요하다.
    if (provider === 'naver') { setError('네이버 로그인은 별도 연동 설정이 필요합니다.'); return; }
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}${redirectTo}` },
    });
    if (error) setError(`${label} 로그인을 사용할 수 없습니다. (Supabase Provider 설정 필요)`);
  };

  // ---- 본인인증 완료 → 가입 폼 ----
  const onVerified = (id: VerifiedIdentity) => {
    setIdentity(id);
    setSheetOpen(false);
    setError('');
    setStep('form');
  };

  // ---- 회원가입 ----
  const doSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!emailValid) { setError('올바른 이메일을 입력해 주세요.'); return; }
    if (signupPw.length < 8) { setError('비밀번호는 8자 이상이어야 합니다.'); return; }
    if (signupPw !== signupPw2) { setError('비밀번호가 일치하지 않습니다.'); return; }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: signupPw,
      options: {
        data: {
          name: identity?.name,
          phone: identity?.phone,
          cert_ci: identity?.ci,
          cert_provider: identity?.provider,
          marketing_agree: agree.marketing,
          ad_agree: agree.ad,
        },
      },
    });
    setBusy(false);
    if (error) { setError(error.message.includes('registered') ? '이미 가입된 이메일입니다.' : '가입에 실패했습니다. 다시 시도해 주세요.'); return; }
    if (data.session) { alert('가입이 완료되었습니다.'); navigate(redirectTo, { replace: true }); }
    else { alert('가입 확인 메일을 발송했습니다. 메일 인증 후 로그인해 주세요.'); setStep('login'); }
  };

  const eye = (show: boolean, set: (v: boolean) => void) => (
    <button type="button" className="auth-eye" onClick={() => set(!show)} aria-label="비밀번호 표시">
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  return (
    <div className="auth-wrap">
      <Seo title={step === 'login' ? '로그인' : '회원가입'} description="클립스 통합계정 로그인·회원가입" noindex />

      {/* ================= 로그인 ================= */}
      {step === 'login' && (
        <>
          <h1 className="auth-title">로그인 · 회원가입</h1>
          <form onSubmit={doLogin}>
            <div className="auth-field">
              <input className="auth-input" style={{ paddingRight: 14 }} type="email" autoComplete="username"
                placeholder="통합계정 또는 이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="auth-field">
              <input className="auth-input" type={showPw ? 'text' : 'password'} autoComplete="current-password"
                placeholder="비밀번호" value={pw} onChange={(e) => setPw(e.target.value)} />
              {eye(showPw, setShowPw)}
            </div>
            <label className="auth-remember">
              <span className={`auth-check${remember ? ' on' : ''}`} style={{ width: 18, height: 18, borderRadius: 4 }}>{remember && <Check size={13} strokeWidth={3} />}</span>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} hidden />
              자동 로그인
            </label>
            {error && <p className="auth-error">{error}</p>}
            <button className="auth-btn auth-btn--primary" type="submit" disabled={busy || !email || !pw} style={{ marginTop: 4 }}>
              {busy ? '로그인 중…' : '로그인'}
            </button>
          </form>

          <p className="auth-promo">지금 가입하면, 신규 할인 쿠폰 즉시 발급</p>
          <div className="auth-social">
            <button className="auth-btn auth-btn--kakao" onClick={() => oauth('kakao')}><KakaoIcon /><span>카카오로 시작하기</span></button>
            <button className="auth-btn auth-btn--naver" onClick={() => oauth('naver')}><NaverIcon /><span>네이버로 시작하기</span></button>
            <button className="auth-btn auth-btn--apple" onClick={() => oauth('apple')}><AppleIcon /><span>Apple로 시작하기</span></button>
            <button className="auth-btn auth-btn--line" onClick={() => { setError(''); setStep('terms'); }}><span>이메일로 가입하기</span></button>
          </div>

          <div className="auth-links">
            <button onClick={() => navigate('/cs')}>아이디 찾기</button>
            <span className="sep">|</span>
            <button onClick={() => navigate('/cs')}>비밀번호 찾기</button>
          </div>
        </>
      )}

      {/* ================= 약관 동의 ================= */}
      {step === 'terms' && (
        <>
          <button className="auth-back" onClick={() => (initialMode === 'signup' ? navigate('/login') : setStep('login'))}>
            <ArrowLeft size={16} /> 로그인
          </button>
          <div className="auth-terms-head">
            <img src="/Klipse_Logo.png" alt="Klipse" style={{ height: 30, display: 'block', marginBottom: 12 }} />
            <p>렌탈 · 시공 · DJ 섭외를 하나의 계정으로 이용할 수 있습니다.</p>
          </div>

          <div className="auth-agree-all" onClick={toggleAll}>
            <span className={`auth-check${allOn ? ' on' : ''}`}>{allOn && <Check size={15} strokeWidth={3} />}</span>
            약관 전체 동의하기 (선택 동의 포함)
          </div>

          {([
            { key: 'age', label: '만 14세 이상입니다. (필수)', detail: false },
            { key: 'tos', label: '서비스 이용 약관 동의 (필수)', detail: true },
            { key: 'marketing', label: '마케팅 목적의 개인정보 수집 및 이용 동의 (선택)', detail: true },
            { key: 'ad', label: '광고성 정보 수신 동의 (선택)', detail: true },
          ] as const).map((it) => (
            <div className="auth-agree-item" key={it.key}>
              <label onClick={() => setAgree((a) => ({ ...a, [it.key]: !a[it.key] }))}>
                <span className={`auth-check${agree[it.key] ? ' on' : ''}`}>{agree[it.key] && <Check size={15} strokeWidth={3} />}</span>
                {it.label}
              </label>
              {it.detail && <button className="detail" onClick={() => navigate('/cs')} aria-label="약관 자세히 보기"><ChevronRight size={18} /></button>}
            </div>
          ))}

          {error && <p className="auth-error">{error}</p>}
          <div className="auth-terms-cta">
            <button className="auth-btn auth-btn--primary" disabled={!canProceed} onClick={() => setSheetOpen(true)}>
              동의하고 본인인증하기
            </button>
          </div>
        </>
      )}

      {/* ================= 가입 폼(본인인증 완료 후) ================= */}
      {step === 'form' && (
        <>
          <button className="auth-back" onClick={() => setStep('terms')}><ArrowLeft size={16} /> 이전</button>
          <h1 className="auth-title">회원 정보 입력</h1>
          {identity && <p className="auth-sub">{identity.name} 님 · 본인인증 완료</p>}
          <form onSubmit={doSignup}>
            <div className="auth-field">
              <input className="auth-input" style={{ paddingRight: 14 }} type="email" placeholder="이메일 (로그인 아이디)"
                value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
            </div>
            <div className="auth-field">
              <input className="auth-input" type={showPw ? 'text' : 'password'} placeholder="비밀번호 (8자 이상)"
                value={signupPw} onChange={(e) => setSignupPw(e.target.value)} autoComplete="new-password" />
              {eye(showPw, setShowPw)}
            </div>
            <div className="auth-field">
              <input className="auth-input" style={{ paddingRight: 14 }} type={showPw ? 'text' : 'password'} placeholder="비밀번호 확인"
                value={signupPw2} onChange={(e) => setSignupPw2(e.target.value)} autoComplete="new-password" />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button className="auth-btn auth-btn--primary" type="submit" disabled={busy} style={{ marginTop: 4 }}>
              {busy ? '가입 중…' : '가입 완료'}
            </button>
          </form>
        </>
      )}

      <IdentityVerifySheet open={sheetOpen} onClose={() => setSheetOpen(false)} onVerified={onVerified} />
    </div>
  );
};

export default AuthPage;
