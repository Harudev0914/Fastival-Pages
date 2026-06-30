const express = require('express');
const cors = require('cors');
const mockReviews = require('./data/mockReviews');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/store/:storeId/summary', (req, res) => {
  res.json({
    name: "서래마을리사랑",
    rating: 4.7,
    reviewCount: 267,
    address: "서울특별시 서초구 서초대로 74길...",
    notices: ["오늘의집 키친 GRAND OPEN ✨"],
    status: "현재 수도권 시공 가능해요"
  });
});

app.get('/api/store/:storeId/keywords', (req, res) => {
  res.json([
    { label: "시공 결과가 좋아요", count: 208 },
    { label: "가격이 합리적이에요", count: 130 },
    { label: "마무리가 깔끔해요", count: 124 }
  ]);
});

app.get('/api/store/:storeId/reviews', (req, res) => {
  let reviews = [...mockReviews];
  
  // 필터 처리
  if (req.query.field && req.query.field !== 'all') {
    reviews = reviews.filter(r => r.tags.includes(req.query.field));
  }
  
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 3;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  res.json({
    items: reviews.slice(start, end),
    hasMore: end < reviews.length
  });
});

app.listen(3000, () => console.log('Backend running on http://localhost:3000'));
