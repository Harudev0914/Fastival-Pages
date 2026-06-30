import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// 페이지 이동 시 상단 진행 로딩바 (NProgress 스타일)
const RouteLoadingBar: React.FC = () => {
  const location = useLocation();
  const [active, setActive] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setActive(true);
    setWidth(12);
    const t1 = window.setTimeout(() => setWidth(68), 90);
    const t2 = window.setTimeout(() => setWidth(100), 420);
    const t3 = window.setTimeout(() => { setActive(false); setWidth(0); }, 720);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); window.clearTimeout(t3); };
  }, [location.pathname]);

  return (
    <div aria-hidden style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', zIndex: 4000, pointerEvents: 'none', opacity: active ? 1 : 0, transition: 'opacity 0.25s ease' }}>
      <div style={{ height: '100%', width: `${width}%`, background: 'linear-gradient(90deg,#008b8b,#22d3ee)', boxShadow: '0 0 8px rgba(0,139,139,0.5)', transition: 'width 0.3s ease' }} />
    </div>
  );
};

export default RouteLoadingBar;
