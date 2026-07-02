import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronUp, MessageCircle } from 'lucide-react';

// 하단에 고정되어 플로팅 버튼과 겹칠 수 있는 바(bar)들의 셀렉터
// - .rpd-buybar.on : 렌탈 상품 상세 하단 구매바 (스크롤 시 .on 으로 노출)
// - .review-mobile-footer : 리뷰 상세 모바일 하단 업체 카드 (sticky, 모바일에서만 노출)
const BOTTOM_BAR_SELECTORS = ['.rpd-buybar.on', '.review-mobile-footer'];

// 우하단 플로팅: 스크롤 다운 시 최상단 바로가기 + 1:1 문의하기
const FloatingButtons: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showTop, setShowTop] = useState(false);
  // 현재 화면에 보이는 하단 바의 높이(px). 이 값만큼 플로팅 버튼을 위로 띄워 겹침을 방지한다.
  const [barOffset, setBarOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 하단 바가 화면에 노출될 때 그 높이만큼 플로팅 버튼을 위로 밀어 침범을 막는다.
  useEffect(() => {
    const compute = () => {
      let h = 0;
      for (const sel of BOTTOM_BAR_SELECTORS) {
        const el = document.querySelector<HTMLElement>(sel);
        // offsetParent === null 이면 display:none 등으로 화면에 없는 상태이므로 무시
        if (el && el.offsetParent !== null) h = Math.max(h, el.offsetHeight);
      }
      setBarOffset(h);
    };
    compute();
    // 레이아웃/이미지 로드 후 높이가 확정되도록 다음 프레임에 한 번 더 계산
    const raf = requestAnimationFrame(compute);
    window.addEventListener('scroll', compute, { passive: true }); // .rpd-buybar 의 .on 토글 대응
    window.addEventListener('resize', compute);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
    };
  }, [location.pathname]); // 페이지 이동 시 바 존재 여부 재계산

  return (
    <div style={{ position: 'fixed', right: '20px', bottom: barOffset > 0 ? `${barOffset + 16}px` : '24px', zIndex: 900, display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', transition: 'bottom .28s cubic-bezier(0.22,1,0.36,1)' }}>
      {/* 최상단 바로가기 (스크롤 다운 시에만) */}
      <button
        type="button"
        aria-label="최상단으로"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          width: '46px', height: '46px', borderRadius: '50%', border: '1px solid #e2e8f0', background: '#fff', color: '#475569',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 14px rgba(15,23,42,0.12)',
          opacity: showTop ? 1 : 0, transform: showTop ? 'translateY(0)' : 'translateY(8px)', pointerEvents: showTop ? 'auto' : 'none',
          transition: 'opacity .2s, transform .2s',
        }}
      >
        <ChevronUp size={22} />
      </button>

      {/* 1:1 문의하기 */}
      <button
        type="button"
        aria-label="1:1 문의하기"
        title="1:1 문의하기"
        onClick={() => navigate('/cs')}
        style={{
          width: '54px', height: '54px', borderRadius: '50%', border: 'none', background: '#2563eb', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 6px 18px rgba(37,99,235,0.4)',
        }}
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
};

export default FloatingButtons;
