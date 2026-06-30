import React from 'react';
import { KlipseServiceSection } from '../components/KlipseServiceSection';

const Home: React.FC = () => {
  return (
    <div style={{ backgroundColor: 'rgb(255, 255, 255)', minHeight: '100vh' }}>

      {/* Main Content Area */}
      <div className="home-container">

        <div style={{ position: 'relative' }} className="mb-[50px]">
          <div className="desktop-only" style={{ display: 'flex', gap: '20px', height: '400px' }}>
            <div style={{ flex: '3 1 0%', backgroundColor: 'rgb(226, 232, 240)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgb(100, 116, 139)' }}>Main Visual Banner</div>
            <div style={{ flex: '1 1 0%', backgroundColor: 'rgb(241, 245, 249)', borderRadius: '16px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgb(100, 116, 139)' }}>
              Ad Banner
              <div style={{ position: 'absolute', bottom: '15px', right: '15px', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>1 / 10</div>
            </div>
          </div>
          <div className="mobile-only" style={{ width: '100%', height: '102px', backgroundColor: 'rgb(241, 245, 249)', borderRadius: '16px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgb(100, 116, 139)', textAlign: 'center' }}>
            <div>Ad Banner (Mobile)</div>
            <div style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white', padding: '2px 6px', borderRadius: '8px', fontSize: '0.7rem' }}>1 / 10</div>
          </div>
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
