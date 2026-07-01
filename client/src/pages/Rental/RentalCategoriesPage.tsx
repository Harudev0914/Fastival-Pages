import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { rentalCategoryApi } from '../../api/rentalApi';
import Seo from '../../components/Seo';
import './RentalPage.css';

interface Cat { id: number; name: string; image_url: string | null }

const RentalCategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [cats, setCats] = useState<Cat[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await rentalCategoryApi.listActive();
      const map = new Map<string, Cat>();
      (data || []).filter((c) => c.is_active && !c.parent_id).forEach((c) => { if (!map.has(c.name)) map.set(c.name, { id: c.id, name: c.name, image_url: c.image_url }); });
      setCats([...map.values()]);
      setLoaded(true);
    })();
  }, []);

  return (
    <div className="rental-page">
      <Seo title="렌탈 카테고리" description="클립스 렌탈 카테고리 — 원하는 카테고리에서 음향·가구 렌탈 상품을 찾아보세요." keywords="렌탈 카테고리,스피커,가구 렌탈,음향 장비" />
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>카테고리</h1>
        <p style={{ color: '#64748b', marginTop: '6px' }}>카테고리별로 렌탈 상품을 둘러보세요.</p>
      </div>

      {loaded && cats.length === 0 ? (
        <div className="rv-empty-grid"><p>등록된 카테고리가 없습니다.</p></div>
      ) : (
        <section className="rv-cats" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
          {cats.map((c) => (
            <button type="button" className="rv-cat" key={c.id} onClick={() => navigate(`/rental/best?category=${c.id}`)}>
              <span className="rv-cat__icon">
                {c.image_url ? <img src={c.image_url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : <Package size={26} color="#64748b" />}
              </span>
              <span className="rv-cat__label">{c.name}</span>
            </button>
          ))}
        </section>
      )}
    </div>
  );
};

export default RentalCategoriesPage;
