import React, { useEffect } from 'react';
import gsap from 'gsap';

const Splash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const tl = gsap.timeline({ onComplete });
    
    // 로고/텍스트 애니메이션 고도화
    tl.set('.loader__text span', { autoAlpha: 0 });
    tl.to('.loader__text span', { 
        autoAlpha: 1, 
        duration: 0.8, 
        ease: 'power2.out' 
    });
    
    // 텍스트 살짝 확장 및 회전 효과
    tl.to('.loader__text', { 
        scale: 1.1, 
        rotation: 2, 
        duration: 1, 
        ease: 'power3.inOut' 
    });

    // 슬라이스 애니메이션 고도화: 순차적 하강 및 fade-out
    tl.to('.loader__slice', { 
        yPercent: 100, 
        stagger: { amount: 0.3, from: "start" }, 
        duration: 0.8, 
        ease: 'power4.inOut' 
    }, '+=0.2');

    tl.to('.loader__text', { 
        autoAlpha: 0, 
        yPercent: -50, 
        duration: 0.5 
    }, '<');

    return () => { tl.kill(); };
  }, [onComplete]);

  return (
    <section className="loader" style={{
      position: 'fixed', top: 0, left: 0, height: '100vh', width: '100vw', 
      backgroundColor: '#111', zIndex: 9999, display: 'flex', 
      alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="loader__text" style={{ 
        fontSize: '6rem', 
        fontWeight: 700, 
        fontFamily: 'Giants, sans-serif', 
        color: '#fff', 
        zIndex: 2,
        letterSpacing: '-0.02em',
        textTransform: 'uppercase'
      }}>
        <span>Klipse</span>
      </div>
      <div className="loader__slice" style={{ position: 'absolute', top: 0, left: '0', width: '33.34vw', height: '100vh', backgroundColor: '#000' }}></div>
      <div className="loader__slice" style={{ position: 'absolute', top: 0, left: '33.33vw', width: '33.34vw', height: '100vh', backgroundColor: '#000' }}></div>
      <div className="loader__slice" style={{ position: 'absolute', top: 0, left: '66.66vw', width: '33.34vw', height: '100vh', backgroundColor: '#000' }}></div>
    </section>
  );
};

export default Splash;
