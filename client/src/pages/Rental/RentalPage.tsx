import React, { useCallback, useRef, useState } from 'react';
import './RentalPage.css';

interface Banner {
  id: number;
  image: string;
  badge?: string;
  title: string;
  sub: string;
  cta?: string;
}

const BANNERS: Banner[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=900&q=80&auto=format&fit=crop',
    title: '거실부터\n다이닝까지, 피아바',
    sub: '하나의 취향으로 완성하는 라이프스타일 컬렉션',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=900&q=80&auto=format&fit=crop',
    title: '여름침구 최대 혜택\n지금 여기서',
    sub: 'Klipse layer 스페셜 브랜드위크 ~30%',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=900&q=80&auto=format&fit=crop',
    badge: '빈백 특가 세일',
    title: '요기보 최대 44%',
    sub: '최대 27만원 할인',
    cta: '브랜드쿠폰 최대 20%',
  },
];

const RentalPage: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  }, []);

  const slide = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.6), behavior: 'smooth' });
  };

  return (
    <div className="rental-page">
      <section className="rv-hero">
        <div className="rv-track" ref={trackRef} onScroll={onScroll}>
          {BANNERS.map((b) => (
            <article className="rv-card" key={b.id}>
              <img className="rv-card__img" src={b.image} alt={b.title} loading="lazy" />
              <div className="rv-card__shade" />
              <div className="rv-card__body">
                {b.badge && <span className="rv-card__badge">{b.badge}</span>}
                <h2 className="rv-card__title">{b.title}</h2>
                <p className="rv-card__sub">{b.sub}</p>
                {b.cta && (
                  <button type="button" className="rv-card__cta">
                    <span>{b.cta}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="rv-controls">
          <div className="rv-progress"><span style={{ transform: `scaleX(${0.25 + progress * 0.75})` }} /></div>
          <div className="rv-arrows">
            <button type="button" onClick={() => slide(-1)} aria-label="이전">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button type="button" onClick={() => slide(1)} aria-label="다음">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RentalPage;
