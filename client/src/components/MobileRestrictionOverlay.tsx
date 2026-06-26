import React, { useState, useEffect } from 'react';
import { MonitorOff } from 'lucide-react';

const MobileRestrictionOverlay: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      // 1024px 이하를 태블릿/모바일로 간주
      setIsMobile(window.innerWidth < 1024);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  if (!isMobile) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '20px',
      zIndex: 9999,
      padding: '20px',
      textAlign: 'center'
    }}>
      <MonitorOff size={64} color="#64748b" />
      <h2 style={{ fontSize: '1.5rem', color: '#1e293b', margin: 0 }}>모바일/태블릿은 지원하지 않습니다.</h2>
      <p style={{ color: '#64748b' }}>데스크탑 환경에서 접속해주세요.</p>
    </div>
  );
};

export default MobileRestrictionOverlay;
