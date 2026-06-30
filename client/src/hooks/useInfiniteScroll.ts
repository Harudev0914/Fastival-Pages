import { useEffect, useRef, useState, useCallback } from 'react';
import { generateReviews, type Review } from '../pages/ReviewDetail/reviewData';

// 스크롤 다운 시 다음 페이지를 불러오는 무한 스크롤 훅
const useInfiniteScroll = () => {
  const [items, setItems] = useState<Review[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver | null>(null);

  // 마지막 카드에 ref가 붙으면 화면에 들어올 때 다음 페이지 트리거
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setPage((prev) => prev + 1);
          }
        },
        { rootMargin: '200px' }
      );
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // 실제 API 호출 자리 — 현재는 목업 데이터를 약간의 지연과 함께 반환
    const timer = setTimeout(() => {
      if (cancelled) return;
      const { reviews, hasMore: more } = generateReviews(page);
      setItems((prev) => (page === 1 ? reviews : [...prev, ...reviews]));
      setHasMore(more);
      setLoading(false);
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [page]);

  return { items, hasMore, loading, lastElementRef };
};

export default useInfiniteScroll;
