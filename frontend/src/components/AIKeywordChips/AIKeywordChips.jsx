import React from 'react';
import styles from './AIKeywordChips.module.css';

const AIKeywordChips = ({ keywords }) => {
  return (
    <div className={styles.aiBlock}>
      <div className={styles.aiTitle}>이런 리뷰가 많았어요
        <span className={styles.aiPill}>
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z"/></svg>
          AI 분석
        </span>
      </div>
      <div className={styles.keywordRow}>
        {keywords.map((kw, i) => (
          <div key={i} className={styles.keywordChip}>
            {kw.label} <span className={styles.n}>{kw.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIKeywordChips;
