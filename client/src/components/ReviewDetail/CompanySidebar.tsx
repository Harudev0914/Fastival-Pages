import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { reviewApi } from '../../api/constructionApi';
import { COMPANY } from '../../pages/ReviewDetail/reviewData';
import { ChevronRightIcon, MapPinIcon, MegaphoneIcon, StarRating } from './icons';

// 업체 정보 카드 콘텐츠 (데스크탑 사이드바 / 모바일 하단 푸터에서 재사용)
const CompanyCard: React.FC = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  // 실제 등록된 활성 후기로 평점/리뷰 수 계산
  useEffect(() => {
    (async () => {
      const { data } = await reviewApi.list();
      const active = (data || []).filter((r) => r.is_active);
      const count = active.length;
      setReviewCount(count);
      setRating(count > 0 ? active.reduce((s, r) => s + Number(r.rating || 0), 0) / count : 0);
    })();
  }, []);

  // 상담신청 → 시공 문의 챗봇
  const goConsult = () => navigate('/construction-inquiry');

  // 리뷰쓰기 → 비회원이면 회원가입, 회원이면 리뷰 작성 페이지(추후 구성)
  const goWriteReview = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) navigate('/signup');
    else navigate('/reviews/write');
  };

  return (
    <div className="company-card">
      <div className="company-card__head">
        <img className="company-card__logo" src="/Klipse_Logo.png" alt="Klipse" />
      </div>

      <div className="company-card__rating">
        <StarRating value={rating} size={15} />
        <span>
          <strong>{rating.toFixed(1)}</strong> · 리뷰 {reviewCount}
        </span>
      </div>

      <span className="benefit-badge">혜택보장</span>

      <div className="company-card__row" role="button">
        <MapPinIcon />
        <span className="row-text">{COMPANY.address}</span>
        <ChevronRightIcon size={16} />
      </div>

      <div className="company-card__row" role="button">
        <MegaphoneIcon />
        <span className="row-text">{COMPANY.notice}</span>
        <ChevronRightIcon size={16} />
      </div>

      <div className="company-card__status">
        <span className="status-dot" />
        {COMPANY.available}
      </div>

      <button className="btn-primary" type="button" onClick={goConsult}>상담신청</button>
      <button className="btn-outline" type="button" onClick={goWriteReview}>리뷰쓰기</button>
    </div>
  );
};

export default CompanyCard;
