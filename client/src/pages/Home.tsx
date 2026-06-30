import React from 'react';
import { KlipseServiceSection } from '../components/KlipseServiceSection';
import ConstructionHero from '../components/ConstructionHero';

const Home: React.FC = () => {
  return (
    <div style={{ backgroundColor: 'rgb(255, 255, 255)', minHeight: '100vh' }}>

      {/* Main Content Area */}
      <div className="home-container">

        {/* 시공 메인 비주얼 (좌측 메인 슬라이더 + 우측 고정 AD) */}
        <div className="mb-[50px]">
          <ConstructionHero />
        </div>

        <KlipseServiceSection />
      </div>

      <style>{`
        .home-container {
          max-width: none;
          margin: 0;
          padding: 50px 18vw 50px;
        }
        @media (max-width: 1024px) {
          .home-container {
            padding: 50px 4vw;
          }
        }
        @media (max-width: 767px) { /* Mobile */
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
        }
        @media (min-width: 768px) { /* Tablet, Laptop, Desktop */
          .mobile-only { display: none !important; }
          .desktop-only { display: flex !important; }
        }
      `}</style>

    </div>
  );
};

export default Home;
