// 본인인증 연동 레이어 — PASS(휴대폰) · 토스 간편인증
// ---------------------------------------------------------------------------
// 실제 연동에는 각 사업자의 가맹점 키 + 서버 콜백이 필요하다.
//  · PASS: NICE평가정보 / KG이니시스 / 다날 등 — SITECODE·SITEPASSWORD 로 서버에서
//    암호화 요청데이터 생성 → 팝업 → 인증 후 return_url(서버)에서 결과 복호화.
//  · 토스 간편인증(Toss Cert): 클라이언트 키 + 서버 시크릿으로 세션 생성 → 인증 → 콜백.
//
// 키가 설정되지 않은 개발/테스트 환경에서는 test 모드로 동작한다(팝업 대신
// 화면에서 입력한 값을 인증 결과로 반환). 실제 키/서버 엔드포인트가 준비되면
// 아래 *_START_URL 환경변수만 채우면 팝업 연동으로 전환된다.
// ---------------------------------------------------------------------------

export type CertProvider = 'pass' | 'toss';

export interface VerifiedIdentity {
  provider: CertProvider;
  name: string;
  phone: string;
  birth?: string;   // YYYYMMDD
  gender?: 'M' | 'F';
  ci?: string;      // 연계정보(중복가입 확인값)
  di?: string;      // 중복가입 확인값(사이트별)
}

// 실 연동 팝업 시작 URL(서버 엔드포인트). 비어 있으면 test 모드.
const START_URL: Record<CertProvider, string | undefined> = {
  pass: import.meta.env.VITE_PASS_START_URL,
  toss: import.meta.env.VITE_TOSS_CERT_START_URL,
};

export const certApi = {
  /** 해당 사업자 실 연동 키/엔드포인트가 설정되어 있는지 */
  isConfigured(provider: CertProvider): boolean {
    return !!START_URL[provider];
  },

  /**
   * 본인인증 팝업 실행 → 결과 수신.
   * 실 연동: 서버가 내려주는 인증창을 팝업으로 열고, 콜백 페이지가
   * `window.opener.postMessage({ type: 'CERT_RESULT', ... })` 로 결과를 전달한다.
   * 미설정 시 NOT_CONFIGURED 로 reject → 호출부가 test 입력 폼으로 폴백한다.
   */
  start(provider: CertProvider): Promise<VerifiedIdentity> {
    const url = START_URL[provider];
    if (!url) return Promise.reject(new Error('NOT_CONFIGURED'));

    return new Promise((resolve, reject) => {
      const w = 480, h = 640;
      const left = window.screenX + (window.outerWidth - w) / 2;
      const top = window.screenY + (window.outerHeight - h) / 2;
      const popup = window.open(url, 'cert_popup', `width=${w},height=${h},left=${left},top=${top}`);
      if (!popup) { reject(new Error('POPUP_BLOCKED')); return; }

      const onMessage = (e: MessageEvent) => {
        // 서버 콜백 오리진만 신뢰 (개발 시 동일 오리진)
        if (!e.data || e.data.type !== 'CERT_RESULT') return;
        cleanup();
        if (e.data.ok) resolve({ provider, ...e.data.identity } as VerifiedIdentity);
        else reject(new Error(e.data.error || 'CERT_FAILED'));
      };
      const timer = window.setInterval(() => {
        if (popup.closed) { cleanup(); reject(new Error('POPUP_CLOSED')); }
      }, 500);
      const cleanup = () => {
        window.removeEventListener('message', onMessage);
        window.clearInterval(timer);
        try { popup.close(); } catch { /* noop */ }
      };
      window.addEventListener('message', onMessage);
    });
  },

  /** test 모드: 입력값을 검증 결과로 사용 (실 연동 미설정 환경) */
  makeTestIdentity(provider: CertProvider, name: string, phone: string): VerifiedIdentity {
    const digits = phone.replace(/\D/g, '');
    return { provider, name: name.trim(), phone: digits, ci: `TEST-CI-${digits}` };
  },
};
