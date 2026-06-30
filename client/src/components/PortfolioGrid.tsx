import React, { useState } from 'react';
import { PortfolioCard, type Portfolio, mockPortfolios } from './PortfolioCard';

export const PortfolioGrid: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>(mockPortfolios);

  const handleBookmark = (id: number) => {
    setPortfolios(prev => prev.map(item => 
      item.id === id ? { ...item, bookmarked: !item.bookmarked } : item
    ));
  };

  return (
    <div className="portfolio-grid">
      {portfolios.map(item => (
        <PortfolioCard key={item.id} item={item} onBookmark={handleBookmark} />
      ))}
      <style>{`
        .portfolio-grid {
          display: grid;
          gap: 24px;
          grid-template-columns: repeat(1, 1fr);
        }
        @media (min-width: 768px) {
          .portfolio-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .portfolio-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </div>
  );
};
