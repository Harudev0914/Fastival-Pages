import React, { useEffect, useState } from 'react';
import ReviewCard from './ReviewCard';
import RatingSummary from '../RatingSummary/RatingSummary';
import AIKeywordChips from '../AIKeywordChips/AIKeywordChips';
import FilterBar from '../FilterBar/FilterBar';
import { fetchReviews, fetchKeywords } from '../../api/reviews';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';

const ReviewContent = ({ storeId }) => {
  const [reviews, setReviews] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchKeywords(storeId).then(setKeywords);
    loadReviews(1, {});
  }, [storeId]);

  const loadReviews = (pageNum, newFilters) => {
    setLoading(true);
    fetchReviews(storeId, pageNum).then(data => {
      if (pageNum === 1) {
        setReviews(data.items);
      } else {
        setReviews(prev => [...prev, ...data.items]);
      }
      setHasMore(data.hasMore);
      setLoading(false);
    });
  };

  const lastElementRef = useInfiniteScroll(() => {
    if (!loading && hasMore) {
      setPage(prev => {
        const nextPage = prev + 1;
        loadReviews(nextPage, filters);
        return nextPage;
      });
    }
  }, hasMore, loading);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPage(1);
    loadReviews(1, newFilters);
  };

  return (
    <>
      <AIKeywordChips keywords={keywords} />
      <FilterBar onFilterChange={handleFilterChange} />
      <div id="review-list">
        {reviews.map((r, i) => (
          <div key={r.id} ref={i === reviews.length - 1 ? lastElementRef : null}>
            <ReviewCard review={r} />
          </div>
        ))}
      </div>
      {loading && <div>로딩 중...</div>}
    </>
  );
};

export default ReviewContent;
