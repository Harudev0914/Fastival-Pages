import React, { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';
import { certApi, type CertProvider, type VerifiedIdentity } from '../../api/certApi';

// 토스 심볼
const TossMark = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 21 20" fill="none" aria-hidden>
    <path d="M11.3037 6.35942L11.915 3.57222C11.9425 3.43222 11.8189 3.30555 11.6746 3.33888C10.7886 3.49222 9.86825 3.75897 8.95476 4.13888C4.84746 5.82591 2.36114 9.13319 3.40511 11.527C4.195 13.3207 6.74312 14.0875 9.70335 13.6407L9.0921 16.428C9.06463 16.568 9.18823 16.6946 9.33244 16.6613C10.2185 16.508 11.1388 16.2412 12.0523 15.8613C16.1596 14.1743 18.6391 10.867 17.5951 8.46653C16.8121 6.67951 14.264 5.91266 11.3037 6.35942Z" fill="white" />
  </svg>
);

interface Props {
  open: boolean;
  onClose: () => void;
  onVerified: (id: VerifiedIdentity) => void;
}

// 본인인증 수단 선택 하단 시트 — PASS(휴대폰) / 토스 간편인증
const IdentityVerifySheet: React.FC<Props> = ({ open, onClose, onVerified }) => {
  const [busy, setBusy] = useState<CertProvider | null>(null);
  const [error, setError] = useState('');
  // 실 연동 미설정 시 test 입력 폼으로 폴백
  const [testFor, setTestFor] = useState<CertProvider | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // 시트 닫힐 때 상태 초기화
  useEffect(() => {
    if (!open) { setBusy(null); setError(''); setTestFor(null); setName(''); setPhone(''); }
  }, [open]);

  const run = async (provider: CertProvider) => {
    setError('');
    if (!certApi.isConfigured(provider)) { setTestFor(provider); return; } // test 모드
    setBusy(provider);
    try {
      const id = await certApi.start(provider);
      onVerified(id);
    } catch (e) {
      const msg = (e as Error).message;
      if (msg === 'POPUP_CLOSED') setError('인증이 취소되었습니다.');
      else if (msg === 'POPUP_BLOCKED') setError('팝업이 차단되었습니다. 팝업 허용 후 다시 시도해 주세요.');
      else setError('본인인증에 실패했습니다. 다시 시도해 주세요.');
    } finally { setBusy(null); }
  };

  const submitTest = () => {
    if (name.trim().length < 2) { setError('이름을 입력해 주세요.'); return; }
    if (phone.replace(/\D/g, '').length < 10) { setError('휴대폰 번호를 정확히 입력해 주세요.'); return; }
    onVerified(certApi.makeTestIdentity(testFor!, name, phone));
  };

  return (
    <div className={`auth-sheet-overlay${open ? ' on' : ''}`} onClick={onClose} role="dialog" aria-modal="true">
      <div className="auth-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="auth-sheet__grip" />

        {testFor ? (
          <>
            <h3 className="auth-sheet__title">본인인증 (테스트)</h3>
            <div className="auth-test-box">
              <p className="hint">실 연동 키 미설정 — 테스트 인증입니다.</p>
              <input className="auth-input" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} style={{ paddingRight: 14 }} />
              <input className="auth-input" placeholder="휴대폰 번호 ('-' 없이)" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ paddingRight: 14 }} />
              {error && <p className="auth-error">{error}</p>}
              <button className="auth-btn auth-btn--primary" onClick={submitTest} style={{ marginTop: 4 }}>인증 완료</button>
              <button className="auth-btn auth-btn--line" onClick={() => { setTestFor(null); setError(''); }}>뒤로</button>
            </div>
          </>
        ) : (
          <>
            <h3 className="auth-sheet__title">본인인증 방법을 선택해 주세요</h3>
            <div className="auth-sheet__btns">
              <button className="auth-btn auth-btn--primary" disabled={!!busy} onClick={() => run('pass')}>
                <Smartphone size={18} /> {busy === 'pass' ? '인증 중…' : '휴대폰번호로 인증하기'}
              </button>
              <button className="auth-btn auth-btn--toss" disabled={!!busy} onClick={() => run('toss')}>
                <TossMark /> {busy === 'toss' ? '인증 중…' : '토스로 간편 인증하기'}
              </button>
            </div>
            {error && <p className="auth-error">{error}</p>}
            <p className="auth-sheet__note">
              본인 명의의 휴대폰 또는 토스 앱으로 인증합니다.<br />인증 정보는 회원가입 확인 용도로만 사용됩니다.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default IdentityVerifySheet;
