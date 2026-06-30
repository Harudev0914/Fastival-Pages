import React, { useState } from 'react';
import styles from './ReviewCard.module.css';

const ReviewCard = ({ review }) => {
  const [isClamped, setIsClamped] = useState(true);

  return (
    <article className={styles.reviewCard}>
      <div className={styles.reviewerRow}>
        <img className={styles.avatar} src={review.avatarUrl} alt="" />
        <div className={styles.reviewerMeta}>
          <span className={styles.reviewerName}>{review.reviewerName}</span>
          <span className={styles.reviewerSub}>
            {review.verified && <span className={styles.verifiedBadge}>오늘의집 계약</span>} · {review.date}
          </span>
        </div>
      </div>
      
      <div className={styles.tagRow}>
        {review.tags.map((tag, i) => <span key={i} className={styles.tag}>{tag}</span>)}
      </div>

      <div className={styles.photoGrid}>
        {review.photos.map((url, i) => <img key={i} src={url} alt="리뷰 사진" />)}
      </div>
      
      <div className={styles.heroPhoto}>
        <img src={review.heroPhoto} alt="전체 시공 사진" />
      </div>

      <div className={`${styles.reviewText} ${isClamped ? styles.clamped : ''}`}>
        {review.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
      </div>
      
      <button className={styles.toggleMoreBtn} onClick={() => setIsClamped(!isClamped)}>
        {isClamped ? '더보기' : '접기'}
      </button>

      <button className={styles.helpfulBtn}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 10v11H4a1 1 0 01-1-1v-9a1 1 0 011-1h3zm0 0l5-7a2 2 0 012 2v4h5.5a2 2 0 011.96 2.4l-1.5 7A2 2 0 0118 21H9a2 2 0 01-2-2"/></svg>
        도움돼요 {review.helpfulCount}
      </button>
    </article>
  );
};

export default ReviewCard;
