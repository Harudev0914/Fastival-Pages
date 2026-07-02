import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, MessageCircle } from 'lucide-react';

// 우하단 플로팅: 스크롤 다운 시 최상단 바로가기 + 1:1 문의하기
const FloatingButtons: React.FC = () => {
  const navigate = useNavigate();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ position: 'fixed', right: '20px', bottom: '24px', zIndex: 900, display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
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
