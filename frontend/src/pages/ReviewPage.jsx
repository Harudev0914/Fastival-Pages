import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import ReviewContent from '../components/ReviewList/ReviewContent';
import RatingSummary from '../components/RatingSummary/RatingSummary';
import { fetchSummary } from '../api/reviews';

const ReviewPage = () => {
  const [storeData, setStoreData] = useState(null);

  useEffect(() => {
    fetchSummary('store1').then(setStoreData);
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '48px', maxWidth: '1180px', margin: '0 auto', padding: '20px' }}>
      <Sidebar data={storeData} />
      <main style={{ flex: '1 1 0%' }}>
        <div className="container">
          <h2>시공 후기</h2>
          {storeData && <RatingSummary rating={storeData.rating} count={storeData.reviewCount} />}
          <ReviewContent storeId="store1" />
        </div>
      </main>
    </div>
  );
};

export default ReviewPage;
