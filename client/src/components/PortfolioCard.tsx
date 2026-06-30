import React from 'react';

// API Response interface
export interface Portfolio {
  id: number;
  title: string;
  description: string;
  image: string;
  isNew: boolean;
  bookmarked: boolean;
  createdAt: string;
  views: number;
}

// Mock Data
export const mockPortfolios: Portfolio[] = [
  { id: 1, title: '강남 카페 음향 시스템', description: '공간에 딱 맞는 최적의 사운드 설계', image: '', isNew: true, bookmarked: false, createdAt: '2025.01.18', views: 329 },
  { id: 2, title: '홍대 라이브 펍 튜닝', description: '라이브 공연을 위한 고출력 시스템 구축', image: '', isNew: false, bookmarked: true, createdAt: '2025.01.15', views: 210 },
  { id: 3, title: '성수동 복합문화공간', description: '다양한 이벤트 대응 가능한 유연한 설계', image: '', isNew: false, bookmarked: false, createdAt: '2025.01.10', views: 540 },
  { id: 4, title: '오피스 회의실 시스템', description: '깔끔한 디자인과 명료한 음성 전달', image: '', isNew: true, bookmarked: false, createdAt: '2025.01.05', views: 120 },
  { id: 5, title: '호텔 로비 BGM 설계', description: '고급스러운 분위기 연출을 위한 스피커 배치', image: '', isNew: false, bookmarked: false, createdAt: '2024.12.28', views: 450 },
  { id: 6, title: '피트니스 센터 음향', description: '운동 동기부여를 위한 파워풀한 사운드', image: '', isNew: false, bookmarked: true, createdAt: '2024.12.20', views: 380 },
];

export const PortfolioCard: React.FC<{ item: Portfolio; onBookmark: (id: number) => void }> = ({ item, onBookmark }) => (
  <div className="portfolio-card">
    <div className="portfolio-image-container">
      {item.isNew && <span className="badge">NEW</span>}
      <button className="bookmark-btn" onClick={() => onBookmark(item.id)} aria-label="북마크">
        {item.bookmarked ? '★' : '☆'}
      </button>
      <div className="portfolio-image-placeholder">이미지 없음</div>
    </div>
    <div className="portfolio-info">
      <h3 className="portfolio-title">{item.title}</h3>
      <p className="portfolio-desc">{item.description}</p>
      <div className="portfolio-meta">
        {item.createdAt} · 조회 {item.views}
      </div>
    </div>
    <style>{`
        .portfolio-card { background: white; border-radius: 16px; transition: all .25s ease; cursor: pointer; overflow: hidden; }
        .portfolio-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,.12); }
        .portfolio-image-container { position: relative; aspectRatio: 16 / 10; border-radius: 16px; overflow: hidden; }
        .portfolio-image-placeholder { width: 100%; height: 100%; backgroundColor: #f1f5f9; display: flex; alignItems: center; justifyContent: center; color: #94a3b8; }
        .portfolio-image-container img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.25s; }
        .portfolio-card:hover .portfolio-image-container img { transform: scale(1.05); }
        .badge { position: absolute; top: 12px; left: 12px; backgroundColor: #FF4D4F; color: white; fontSize: 12px; fontWeight: 700; padding: 4px 8px; borderRadius: 6px; }
        .bookmark-btn { position: absolute; bottom: 12px; right: 12px; width: 36px; height: 36px; borderRadius: 50%; backgroundColor: white; border: none; boxShadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; alignItems: center; justifyContent: center; cursor: pointer; }
        .portfolio-info { padding: 16px; }
        .portfolio-title { fontSize: 18px; fontWeight: 700; line-height: 1.5; margin: 0 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .portfolio-desc { fontSize: 14px; color: #666; line-height: 1.6; margin: 0 0 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .portfolio-meta { fontSize: 13px; color: #999; }
    `}</style>
  </div>
);
