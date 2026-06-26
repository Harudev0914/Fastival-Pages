import React, { useEffect } from 'react';
import gsap from 'gsap';

const Splash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const tl = gsap.timeline({ onComplete });
    
    // 로고/텍스트 애니메이션
    tl.to('.loader__text span', { autoAlpha: 1, duration: 0.5 });
    tl.from('.loader__text span', { yPercent: 150, stagger: 0.1, duration: 0.5, ease: 'power3.inOut' });
    tl.to('.loader__text span', { yPercent: -150, stagger: 0.1, duration: 0.5, ease: 'power3.inOut' }, '+=0.5');
    
    // 슬라이스 애니메이션
    tl.to('.loader__slice', { yPercent: 100, stagger: 0.1, duration: 0.6, ease: 'power3.inOut' }, '<0.1');

    return () => { tl.kill(); };
  }, [onComplete]);

  return (
    <section className="loader" style={{
      position: 'fixed', top: 0, left: 0, height: '100vh', width: '100vw', 
      backgroundColor: '#1d1d1d', zIndex: 9999, display: 'flex', 
      alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="loader__text" style={{ fontSize: '3rem', color: 'white', zIndex: 2 }}>
        <span>Klipse</span>
      </div>
      <div className="loader__slice" style={{ position: 'absolute', top: 0, left: '0', width: '33.33vw', height: '100vh', backgroundColor: '#1d1d1d' }}></div>
      <div className="loader__slice" style={{ position: 'absolute', top: 0, left: '33.33vw', width: '33.33vw', height: '100vh', backgroundColor: '#1d1d1d' }}></div>
      <div className="loader__slice" style={{ position: 'absolute', top: 0, left: '66.66vw', width: '33.33vw', height: '100vh', backgroundColor: '#1d1d1d' }}></div>
    </section>
  );
};

export default Splash;
