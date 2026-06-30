import React from 'react';
import styles from './RatingSummary.module.css';

const RatingSummary = ({ rating, count }) => {
  return (
    <div className={styles.overallRating}>
      <span className={styles.stars}>
        {[...Array(5)].map((_, i) => (
          <svg key={i} viewBox="0 0 24 24" fill={i < Math.round(rating) ? "#ffb400" : "#e3e4e6"}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ))}
      </span>
      <span className={styles.num}>{rating}</span>
      <span className={styles.count}>({count})</span>
    </div>
  );
};

export default RatingSummary;
