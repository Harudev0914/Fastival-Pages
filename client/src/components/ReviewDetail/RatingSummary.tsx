import React from 'react';
import { RATING_SUMMARY } from '../../pages/ReviewDetail/reviewData';
import { StarRating } from './icons';

const RatingSummary: React.FC<{ average?: number; count?: number }> = ({ average = 0, count = 0 }) => {
  const avg = Number.isFinite(average) ? average : 0;
  return (
    <div>
      <h1 className="review-title">시공리뷰</h1>
      <p className="review-subtitle">{RATING_SUMMARY.subtitle}</p>
      <div className="rating-summary">
        <StarRating value={avg} size={26} />
        <span className="score">{avg.toFixed(1)}</span>
        <span className="count">({count})</span>
      </div>
    </div>
  );
};

export default RatingSummary;
