import React, { useState } from 'react';
import type { Review } from '../../pages/ReviewDetail/reviewData';
import { ThumbsUpIcon } from './icons';
import ImageLightbox from './ImageLightbox';

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [lbIndex, setLbIndex] = useState<number | null>(null);

  const imgs = review.images || [];
  const thumbs = imgs.slice(0, 4);
  const hero = imgs[4] ?? imgs[0];

  return (
    <article className="review-card">
      <div className="rc-head">
        <img
          className="rc-avatar"
          src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${review.avatarSeed}`}
          alt={review.author}
          loading="lazy"
        />
        <div>
          <div className="rc-author">{review.author}</div>
          <div className="rc-meta">
            {review.isContracted && <span className="rc-contract-badge">Klipse 계약</span>}
            <span>· {review.date}</span>
            {review.isNew && <span className="rc-new-badge">· 신규</span>}
          </div>
        </div>
      </div>

      <div className="rc-tags">
        {review.tags.map((tag) => (
          <span key={tag} className="rc-tag">{tag}</span>
        ))}
      </div>

      {imgs.length > 0 && (
        <div className="rc-gallery">
          {thumbs.length > 1 && (
            <div className="rc-thumbs">
              {thumbs.map((src, i) => (
                <button key={i} className="rc-thumb-btn" type="button" onClick={() => setLbIndex(i)} aria-label={`리뷰 사진 ${i + 1} 자세히 보기`}>
                  <img className="rc-thumb" src={src} alt={`리뷰 사진 ${i + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          )}
          <button className="rc-hero-btn" type="button" onClick={() => setLbIndex(imgs.length > 4 ? 4 : 0)} aria-label="대표 사진 자세히 보기">
            <img className="rc-hero" src={hero} alt="대표 사진" loading="lazy" />
          </button>
        </div>
      )}

      <p className={`rc-body ${expanded ? '' : 'clamped'}`}>{review.body}</p>
      {!expanded && (
        <button className="rc-more" type="button" onClick={() => setExpanded(true)}>
          ...더보기
        </button>
      )}

      <div>
        <button
          className={`rc-helpful ${liked ? 'active' : ''}`}
          type="button"
          onClick={() => setLiked((v) => !v)}
        >
          <ThumbsUpIcon size={15} color={liked ? '#2563eb' : '#64748b'} />
          도움돼요 {review.helpful + (liked ? 1 : 0)}
        </button>
      </div>

      {lbIndex !== null && (
        <ImageLightbox
          images={review.images}
          index={lbIndex}
          onClose={() => setLbIndex(null)}
          onNavigate={setLbIndex}
        />
      )}
    </article>
  );
};

export default ReviewCard;
