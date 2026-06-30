import React from 'react';
import { PortfolioGrid } from '../components/PortfolioGrid';

const PortfolioPage: React.FC = () => {
  return (
    <div className="portfolio-page" style={{ padding: '40px 12vw' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '40px' }}>포트폴리오</h1>
      <PortfolioGrid />
    </div>
  );
};

export default PortfolioPage;
