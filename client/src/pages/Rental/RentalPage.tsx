import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MoreHorizontal, ImageOff } from 'lucide-react';
import MainVisualCarousel from '../../components/MainVisualCarousel';
import Seo from '../../components/Seo';
import { productApi, rentalCategoryApi, type RentalProduct } from '../../api/rentalApi';
import './RentalPage.css';

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;

const RentalPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<RentalProduct[]>([]);
  const [cats, setCats] = useState<{ id: number; name: string; image_url: string | null }[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: pd }, { data: cd }] = [await productApi.listActive(), await rentalCategoryApi.listActive()];
      setProducts((pd || []).filter((p) => p.is_active));
      // 활성 1차 카테고리(parent_id 없음)만 노출
      const map = new Map<string, { id: number; name: string; image_url: string | null }>();
      (cd || []).filter((c) => c.is_active && !c.parent_id).forEach((c) => { if (!map.has(c.name)) map.set(c.name, { id: c.id, name: c.name, image_url: c.image_url }); });
      setCats([...map.values()]);
      setLoaded(true);
    })();
  }, []);

  return (
    <div className="rental-page">
      <Seo title="렌탈" description="클립스 렌탈 — 스피커·음향 장비, 빈백·가구 등 합리적 일일 렌탈. 베스트·단독상품·기획전." keywords="음향 렌탈,스피커 렌탈,빈백 렌탈,가구 렌탈,행사 음향,단독상품,기획전" />
      {/* 메인 비주얼 (DB 연동, 미등록 시 빈 상태) */}
      <MainVisualCarousel section="rental" />

      {/* 카테고리 퀵메뉴 (상위 7개) */}
      {cats.length > 0 && (
        <section className="rv-cats">
          {cats.slice(0, 7).map((c) => (
            <button type="button" className="rv-cat" key={c.id} onClick={() => navigate(`/rental/categories?category=${c.id}`)}>
              <span className="rv-cat__icon">
                {c.image_url ? <img src={c.image_url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : <Package size={26} color="#64748b" />}
              </span>
              <span className="rv-cat__label">{c.name}</span>
            </button>
          ))}
          <button type="button" className="rv-cat" onClick={() => navigate('/rental/categories')}>
            <span className="rv-cat__icon"><MoreHorizontal size={26} color="#64748b" /></span>
            <span className="rv-cat__label">더보기</span>
          </button>
        </section>
      )}

      {/* 베스트 렌탈 상품 */}
      <section className="rv-section">
        <div className="rv-section__head">
          <h3>이번 주 베스트 렌탈</h3>
          <button type="button" className="rv-more" onClick={() => navigate('/rental/best')}>전체보기</button>
        </div>

        {loaded && products.length === 0 ? (
          <div className="rv-empty-grid">
            <ImageOff size={34} strokeWidth={1.5} />
            <p>아직 등록된 렌탈 상품이 없습니다.</p>
          </div>
        ) : (
          <div className="rv-grid">
            {products.map((p) => (
              <article className="rv-prod" key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/rental/product/${p.id}`)}>
                <div className="rv-prod__media">
                  {p.thumbnail_url || (p.images && p.images[0])
                    ? <img src={p.thumbnail_url || p.images[0]} alt={p.name} loading="lazy" />
                    : <div className="rv-prod__noimg"><ImageOff size={24} color="#cbd5e1" /></div>}
                </div>
                <p className="rv-prod__brand">{p.rental_brands?.name || ''}</p>
                <p className="rv-prod__name">{p.name}</p>
                <div className="rv-prod__price">
                  <span className="rv-prod__monthly">일 {won(p.daily_price)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default RentalPage;
