import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mainVisualApi, type MvSection } from '../api/mainVisualApi';
import './MainVisualCarousel.css';

export interface BannerView {
  id: number | string;
  type?: 'type_a' | 'type_b';
  image_url: string | null;
  badge?: string | null;
  title: string;
  subtitle?: string | null;
  cta_text?: string | null;
  link_url?: string | null;
}

// 이미지가 등록되지 않았을 때 사용할 대체 이미지
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&q=80&auto=format&fit=crop';

const MainVisualCarousel: React.FC<{ section: MvSection; fallback?: BannerView[]; autoPlayMs?: number }> = ({ section, fallback = [], autoPlayMs = 4500 }) => {
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [banners, setBanners] = useState<BannerView[]>(fallback);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await mainVisualApi.listBySection(section);
      if (cancelled) return;
      setBanners(data && data.length > 0 ? data : fallback);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  // 자동 슬라이드: 일정 시간마다 다음 배너로 이동(끝이면 처음으로). 마우스 오버 시 일시정지
  useEffect(() => {
    const el = trackRef.current;
    if (!el || banners.length <= 1 || autoPlayMs <= 0) return;
    const timer = window.setInterval(() => {
      if (pausedRef.current) return;
      const card = el.querySelector('.rv-card') as HTMLElement | null;
      const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.6;
      const max = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= max - 4) el.scrollTo({ left: 0, behavior: 'smooth' });
      else el.scrollBy({ left: step, behavior: 'smooth' });
    }, autoPlayMs);
    return () => window.clearInterval(timer);
  }, [banners.length, autoPlayMs]);

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

  const open = (b: BannerView) => {
    if (!b.link_url) return;
    if (/^https?:\/\//.test(b.link_url)) window.open(b.link_url, '_blank', 'noopener');
    else navigate(b.link_url);
  };

  if (banners.length === 0) return null;

  return (
    <section className="rv-hero">
      <div
        className="rv-track"
        ref={trackRef}
        onScroll={onScroll}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >
        {banners.map((b) => (
          <button type="button" className="rv-card" key={b.id} onClick={() => open(b)}>
            <img className="rv-card__img" src={b.image_url || FALLBACK_IMG} alt={b.title} loading="lazy" />
            <div className="rv-card__shade" />
            <div className="rv-card__body">
              {b.badge && <span className="rv-card__badge">{b.badge}</span>}
              <h2 className="rv-card__title">{b.title}</h2>
              {b.subtitle && <p className="rv-card__sub">{b.subtitle}</p>}
              {b.cta_text && (
                <span className="rv-card__cta">
                  <span>{b.cta_text}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </span>
              )}
            </div>
          </button>
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
  );
};

export default MainVisualCarousel;
