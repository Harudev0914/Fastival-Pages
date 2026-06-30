import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageOff, User } from 'lucide-react';
import { mainVisualApi, type MainVisual } from '../api/mainVisualApi';
import './ConstructionHero.css';

// 시공 메인 비주얼: 좌측 메인 슬라이더 + 우측 고정 AD 배너
const ConstructionHero: React.FC = () => {
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);
  const [mains, setMains] = useState<MainVisual[]>([]);
  const [ad, setAd] = useState<MainVisual | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await mainVisualApi.listBySection('construction');
      if (cancelled) return;
      const list = data || [];
      setMains(list.filter((b) => !b.is_ad));
      setAd(list.find((b) => b.is_ad) || null);
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, []);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    setIdx(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  const slide = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' });
  };

  const open = (b: MainVisual) => {
    if (!b.link_url) return;
    if (/^https?:\/\//.test(b.link_url)) window.open(b.link_url, '_blank', 'noopener');
    else navigate(b.link_url);
  };

  if (!loaded) return null;

  return (
    <section className="ch-hero">
      {/* 좌측 메인 슬라이더 */}
      <div className="ch-main">
        {mains.length === 0 ? (
          <div className="ch-empty"><ImageOff size={34} strokeWidth={1.5} /><p>등록된 시공 메인 비주얼이 없습니다.</p></div>
        ) : (
          <>
            <div className="ch-track" ref={trackRef} onScroll={onScroll}>
              {mains.map((b) => (
                <button type="button" className="ch-slide" key={b.id} onClick={() => open(b)}>
                  {b.image_url
                    ? <img className="ch-slide__img" src={b.image_url} alt={b.title} loading="lazy" />
                    : <div className="ch-slide__noimg"><ImageOff size={40} color="#cbd5e1" /></div>}
                  <div className="ch-slide__shade" />
                  <div className="ch-slide__body">
                    <h2 className="ch-slide__title">{b.title}</h2>
                    {(b.author_name || b.author_avatar) && (
                      <div className="ch-author">
                        {b.author_avatar
                          ? <img className="ch-author__av" src={b.author_avatar} alt={b.author_name || ''} />
                          : <span className="ch-author__av ch-author__av--empty"><User size={14} color="#fff" /></span>}
                        <span className="ch-author__name">{b.author_name || ''}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {mains.length > 1 && (
              <>
                <button className="ch-nav prev" onClick={() => slide(-1)} disabled={idx === 0} aria-label="이전">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <button className="ch-nav next" onClick={() => slide(1)} disabled={idx >= mains.length - 1} aria-label="다음">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
                <span className="ch-count">{idx + 1}/{mains.length} +</span>
              </>
            )}
          </>
        )}
      </div>

      {/* 우측 고정 AD 배너 (슬라이딩 X) */}
      {ad && (
        <aside className={`ch-ad ${ad.image_mobile_url ? 'ch-ad--hasmo' : ''}`} onClick={() => open(ad)} style={{ cursor: ad.link_url ? 'pointer' : 'default' }}>
          <span className="ch-ad__tag">AD</span>
          {ad.image_url
            ? <img className="ch-ad__img ch-ad__img--pc" src={ad.image_url} alt={ad.title} loading="lazy" />
            : <div className="ch-ad__noimg"><ImageOff size={28} color="#cbd5e1" /></div>}
          {/* 모바일 가로 이미지(있으면) */}
          {ad.image_mobile_url && <img className="ch-ad__img ch-ad__img--mo" src={ad.image_mobile_url} alt={ad.title} loading="lazy" />}
          {ad.title && <div className="ch-ad__body"><p className="ch-ad__title">{ad.title}</p></div>}
        </aside>
      )}
    </section>
  );
};

export default ConstructionHero;
