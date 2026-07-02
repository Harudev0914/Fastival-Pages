// 의존성 없는 경량 토스트 — 하단 정중앙에 잠깐 떴다가 사라지는 안내 (alert 대체)
export function toast(message: string, ms = 2000): void {
  if (typeof document === 'undefined') return;

  const el = document.createElement('div');
  el.textContent = message;
  el.setAttribute('role', 'status');
  Object.assign(el.style, {
    position: 'fixed',
    left: '50%',
    bottom: 'calc(40px + env(safe-area-inset-bottom))',
    transform: 'translateX(-50%) translateY(8px)',
    background: 'rgba(15,23,42,0.92)',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '600',
    lineHeight: '1.4',
    letterSpacing: '-0.01em',
    zIndex: '3000',
    boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
    opacity: '0',
    transition: 'opacity .2s ease, transform .2s ease',
    pointerEvents: 'none',
    maxWidth: '90vw',
    textAlign: 'center',
    whiteSpace: 'pre-line',
  } as CSSStyleDeclaration);

  document.body.appendChild(el);

  // 진입
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
  });

  // 퇴장 후 제거
  window.setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-50%) translateY(8px)';
    window.setTimeout(() => el.remove(), 220);
  }, ms);
}
