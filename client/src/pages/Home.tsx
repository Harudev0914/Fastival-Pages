import React from 'react';
import { KlipseServiceSection } from '../components/KlipseServiceSection';
import ConstructionHero from '../components/ConstructionHero';
import Seo from '../components/Seo';

const Home: React.FC = () => {
  return (
    <div style={{ backgroundColor: 'rgb(255, 255, 255)', minHeight: '100vh' }}>
      <Seo title="홈" description="클립스(Klipse) — 카페·바·라운지·클럽 등 상업공간 사운드 설계와 인테리어 시공, 음향·가구 렌탈 전문." keywords="클립스,Klipse,상업공간 시공,카페 인테리어,바 시공,음향 설계,스피커 렌탈,인테리어 포트폴리오" />

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
