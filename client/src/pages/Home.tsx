import React from 'react';
import { KlipseServiceSection } from '../components/KlipseServiceSection';
import MainVisualCarousel, { type BannerView } from '../components/MainVisualCarousel';

// DB에 등록된 시공 메인 비주얼이 없을 때 대체 배너
const CONSTRUCTION_FALLBACK: BannerView[] = [
  {
    id: 'c1',
    image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900&q=80&auto=format&fit=crop',
    title: '공간을 바꾸는\nKlipse 시공',
    subtitle: '검증된 시공팀과 함께하는 프리미엄 인테리어',
  },
  {
    id: 'c2',
    image_url: 'https://images.unsplash.com/photo-1556912173-3d706393e772?w=900&q=80&auto=format&fit=crop',
    title: '주방부터 거실까지',
    subtitle: '취향을 완성하는 맞춤 시공',
  },
  {
    id: 'c3',
    image_url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&q=80&auto=format&fit=crop',
    badge: '상담 이벤트',
    title: '무료 방문 견적',
    subtitle: '지금 신청하면 시공 상담 무료',
    cta_text: '시공 문의하기',
    link_url: '/construction-inquiry',
  },
];

const Home: React.FC = () => {
  return (
    <div style={{ backgroundColor: 'rgb(255, 255, 255)', minHeight: '100vh' }}>

      {/* Main Content Area */}
      <div className="home-container">

        {/* 시공 메인 비주얼 (DB 연동, 미등록 시 대체 배너) */}
        <div className="mb-[50px]">
          <MainVisualCarousel section="construction" fallback={CONSTRUCTION_FALLBACK} />
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
