import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainVisualCarousel from '../../components/MainVisualCarousel';
import { productApi, type RentalProduct } from '../../api/rentalApi';
import './RentalPage.css';

const CATEGORIES: { icon: string; label: string }[] = [
  { icon: '🧺', label: '생활가전' },
  { icon: '🛋️', label: '가구' },
  { icon: '🛏️', label: '침구' },
  { icon: '🍳', label: '주방' },
  { icon: '💡', label: '조명' },
  { icon: '📦', label: '수납' },
  { icon: '🪴', label: '인테리어' },
  { icon: '⋯', label: '더보기' },
];

interface Product {
  id: number;
  image: string;
  brand: string;
  name: string;
  monthly: number;
  discount: number;
}

const PRODUCTS: Product[] = [
  { id: 1, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&auto=format&fit=crop', brand: '오아', name: '날개없는 무선 서큘레이터 선풍기', monthly: 9900, discount: 30 },
  { id: 2, image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80&auto=format&fit=crop', brand: '피아바', name: '4인용 세라믹 다이닝 테이블 세트', monthly: 29900, discount: 25 },
  { id: 3, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80&auto=format&fit=crop', brand: 'layer', name: '여름용 인견 차렵 침구 세트', monthly: 12900, discount: 30 },
  { id: 4, image: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80&auto=format&fit=crop', brand: '요기보', name: '프리미엄 빈백 소파 라지', monthly: 19900, discount: 44 },
  { id: 5, image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&q=80&auto=format&fit=crop', brand: '루메나', name: '무드 LED 플로어 스탠드 조명', monthly: 7900, discount: 20 },
  { id: 6, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&auto=format&fit=crop', brand: '한샘', name: '시스템 모듈 수납장 800', monthly: 15900, discount: 18 },
  { id: 7, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80&auto=format&fit=crop', brand: '발뮤다', name: '디자인 토스터 & 케틀 세트', monthly: 13900, discount: 22 },
  { id: 8, image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80&auto=format&fit=crop', brand: '오늘의집', name: '내추럴 우드 1인 라운지 체어', monthly: 11900, discount: 28 },
];

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;

const RentalPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<RentalProduct[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await productApi.list();
      setProducts((data || []).filter((p) => p.is_active));
      setLoaded(true);
    })();
  }, []);

  return (
    <div className="rental-page">
      {/* 메인 비주얼 (DB 연동, 미등록 시 대체 배너) */}
      <MainVisualCarousel section="rental" />

      {/* 카테고리 퀵메뉴 */}
      <section className="rv-cats">
        {CATEGORIES.map((c) => (
          <button type="button" className="rv-cat" key={c.label}>
            <span className="rv-cat__icon">{c.icon}</span>
            <span className="rv-cat__label">{c.label}</span>
          </button>
        ))}
      </section>

      {/* 베스트 렌탈 상품 */}
      <section className="rv-section">
        <div className="rv-section__head">
          <h3>이번 주 베스트 렌탈</h3>
          <button type="button" className="rv-more" onClick={() => navigate('/rental/best')}>전체보기</button>
        </div>
        <div className="rv-grid">
          {/* DB 상품 우선, 없으면 예시 상품 */}
          {(loaded && products.length > 0)
            ? products.map((p) => (
              <article className="rv-prod" key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/rental/product/${p.id}`)}>
                <div className="rv-prod__media">
                  <img src={p.thumbnail_url || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80&auto=format&fit=crop'} alt={p.name} loading="lazy" />
                </div>
                <p className="rv-prod__brand">{p.rental_brands?.name || ''}</p>
                <p className="rv-prod__name">{p.name}</p>
                <div className="rv-prod__price">
                  <span className="rv-prod__monthly">일 {won(p.daily_price)}</span>
                </div>
              </article>
            ))
            : PRODUCTS.map((p) => (
              <article className="rv-prod" key={p.id}>
                <div className="rv-prod__media">
                  <img src={p.image} alt={p.name} loading="lazy" />
                </div>
                <p className="rv-prod__brand">{p.brand}</p>
                <p className="rv-prod__name">{p.name}</p>
                <div className="rv-prod__price">
                  <span className="rv-prod__disc">{p.discount}%</span>
                  <span className="rv-prod__monthly">월 {won(p.monthly)}</span>
                </div>
              </article>
            ))}
        </div>
      </section>
    </div>
  );
};

export default RentalPage;
