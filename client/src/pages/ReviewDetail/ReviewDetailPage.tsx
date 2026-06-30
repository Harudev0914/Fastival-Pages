import React, { useEffect, useState } from 'react';
import CompanyCard from '../../components/ReviewDetail/CompanySidebar';
import RatingSummary from '../../components/ReviewDetail/RatingSummary';
import AIKeywordChips from '../../components/ReviewDetail/AIKeywordChips';
import FilterChipsRow from '../../components/ReviewDetail/FilterChipsRow';
import ReviewCard from '../../components/ReviewDetail/ReviewCard';
import { reviewApi } from '../../api/constructionApi';
import { EmptyState } from '../Content/Construction/shared';
import type { Review } from './reviewData';
import './ReviewDetailPage.css';

// created_at → 'YYYY.MM.DD'
const shortDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
};
const isRecent = (iso: string, days = 14) => {
  const d = new Date(iso).getTime();
  return !isNaN(d) && Date.now() - d < days * 86400000;
};

const ReviewDetailPage: React.FC = () => {
  const [items, setItems] = useState<Review[]>([]);
  const [summary, setSummary] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await reviewApi.list();
      const active = (data || []).filter((r) => r.is_active);

      // 평점 계산식: 활성 후기 평점 평균(소수 1자리), 개수 = 활성 후기 수
      const count = active.length;
      const average = count > 0 ? active.reduce((s, r) => s + Number(r.rating || 0), 0) / count : 0;
      setSummary({ average, count });

      setItems(active.map((r): Review => ({
        id: r.id,
        author: r.author_name,
        avatarSeed: r.author_name || String(r.id),
        isContracted: true,
        date: shortDate(r.created_at),
        isNew: isRecent(r.created_at),
        tags: [r.construction_categories?.name].filter(Boolean) as string[],
        images: Array.isArray(r.images) ? r.images : [],
        body: (r.title ? `[${r.title}] ` : '') + r.content,
        helpful: 0,
      })));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="review-page">
      <aside className="review-sidebar">
        <CompanyCard />
      </aside>

      <div className="review-main">
        <RatingSummary average={summary.average} count={summary.count} />
        <AIKeywordChips />
        <FilterChipsRow />

        {loading ? (
          <div className="review-loader"><span className="spinner" /></div>
        ) : items.length === 0 ? (
          <EmptyState message="등록된 리뷰가 없습니다." />
        ) : (
          <div className="review-list">
            {items.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>

      {/* 모바일 전용: 업체 정보 카드를 하단 푸터처럼 표시 */}
      <div className="review-mobile-footer">
        <CompanyCard />
      </div>
    </div>
  );
};

export default ReviewDetailPage;
