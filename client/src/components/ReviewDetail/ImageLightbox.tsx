import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  images: string[];
  index: number;
  onClose: () => void;
  onNavigate: (next: number) => void;
}

// 리뷰 사진 자세히 보기 모달 — 좌/우 클릭, 키보드, 모바일 드래그(스와이프) 지원
const ImageLightbox: React.FC<Props> = ({ images, index, onClose, onNavigate }) => {
  const touchStartX = useRef<number | null>(null);
  const dragX = useRef<number | null>(null);

  const go = useCallback(
    (dir: number) => {
      const next = (index + dir + images.length) % images.length;
      onNavigate(next);
    },
    [index, images.length, onNavigate]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    // 모달 열려 있는 동안 배경 스크롤 잠금
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [go, onClose]);

  const SWIPE_THRESHOLD = 50;

  const handleStart = (x: number) => {
    touchStartX.current = x;
    dragX.current = x;
  };
  const handleEnd = (x: number) => {
    if (touchStartX.current === null) return;
    const delta = x - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD) go(delta < 0 ? 1 : -1);
    touchStartX.current = null;
    dragX.current = null;
  };

  return createPortal(
    <div className="rc-lightbox" onClick={onClose} role="dialog" aria-modal="true">
      <button className="rc-lb-btn rc-lb-close" onClick={onClose} aria-label="닫기">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
          <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      </button>

      {images.length > 1 && (
        <button
          className="rc-lb-btn rc-lb-prev"
          onClick={(e) => { e.stopPropagation(); go(-1); }}
          aria-label="이전 사진"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      <img
        className="rc-lb-img"
        src={images[index]}
        alt={`리뷰 사진 ${index + 1}`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchEnd={(e) => handleEnd(e.changedTouches[0].clientX)}
        onPointerDown={(e) => { if (e.pointerType !== 'touch') handleStart(e.clientX); }}
        onPointerUp={(e) => { if (e.pointerType !== 'touch') handleEnd(e.clientX); }}
        draggable={false}
      />

      {images.length > 1 && (
        <button
          className="rc-lb-btn rc-lb-next"
          onClick={(e) => { e.stopPropagation(); go(1); }}
          aria-label="다음 사진"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      <div className="rc-lb-counter">{index + 1} / {images.length}</div>
    </div>,
    document.body
  );
};

export default ImageLightbox;
