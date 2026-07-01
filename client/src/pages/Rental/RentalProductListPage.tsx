import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { productApi, brandApi, rentalCategoryApi, orderApi, type RentalProduct } from '../../api/rentalApi';
import Seo from '../../components/Seo';
import './RentalPage.css';

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;
const TEAL = '#2563eb';

const TITLES: Record<string, { title: string; desc: string }> = {
  best: { title: '베스트 렌탈', desc: '지금 가장 인기 있는 렌탈 상품' },
  exclusive: { title: '단독 상품', desc: 'Klipse에서만 만나는 단독 렌탈' },
  event: { title: '기획전', desc: '특별 기획 렌탈 모음' },
  all: { title: '전체 렌탈 상품', desc: '' },
};

const sel: React.CSSProperties = { padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.88rem', background: '#fff', cursor: 'pointer' };

const RentalProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const key = location.pathname.split('/')[2] || 'all';
  const meta = TITLES[key] || TITLES.all;
  const initialCat = params.get('category') ? Number(params.get('category')) : 'all';

  const [products, setProducts] = useState<RentalProduct[]>([]);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [cats, setCats] = useState<{ id: number; name: string; brand_id: number | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandFilter, setBrandFilter] = useState<number | 'all'>('all');
  const [catFilter, setCatFilter] = useState<number | 'all'>(initialCat);
  const [sort, setSort] = useState(key === 'best' ? 'best' : 'recent');
  const [sales, setSales] = useState<Record<number, number>>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: p }, { data: b }, { data: c }, salesMap] = [await productApi.listActive(), await brandApi.listActive(), await rentalCategoryApi.listActive(), await orderApi.salesCountByProduct()];
      setProducts((p || []).filter((x) => x.is_active));
      setBrands((b || []) as any);
      setCats(((c || []) as any[]).map((x) => ({ id: x.id, name: x.name, brand_id: x.brand_id })));
      setSales(salesMap);
      setLoading(false);
    })();
  }, []);

  const catsForFilter = useMemo(() => brandFilter === 'all' ? cats : cats.filter((c) => c.brand_id === brandFilter), [cats, brandFilter]);

  const view = useMemo(() => {
    let v = products.filter((p) => {
      if (key === 'exclusive' && !p.is_exclusive) return false;
      if (key === 'event' && !p.is_event) return false;
      if (brandFilter !== 'all' && p.brand_id !== brandFilter) return false;
      if (catFilter !== 'all' && p.category_id !== catFilter) return false;
      return true;
    });
    if (sort === 'best') v = [...v].sort((a, b) => (sales[b.id] || 0) - (sales[a.id] || 0) || (b.created_at || '').localeCompare(a.created_at || ''));
    else if (sort === 'price_low') v = [...v].sort((a, b) => Number(a.daily_price) - Number(b.daily_price));
    else if (sort === 'price_high') v = [...v].sort((a, b) => Number(b.daily_price) - Number(a.daily_price));
    else v = [...v].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    return v;
  }, [products, brandFilter, catFilter, sort, key, sales]);

  // 베스트 라벨: 판매수 상위 3개(판매 1건 이상)
  const bestIds = useMemo(() => new Set(
    Object.entries(sales).filter(([, n]) => (n as number) > 0).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 3).map(([id]) => Number(id))
  ), [sales]);

  return (
    <div className="rental-page">
      <Seo title={meta.title} description={`클립스 렌탈 ${meta.title} — ${meta.desc || '음향·가구 렌탈 상품'}`} keywords="렌탈,음향 렌탈,가구 렌탈,베스트,단독상품,기획전" />
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{meta.title}</h1>
        {meta.desc && <p style={{ color: '#64748b', marginTop: '6px' }}>{meta.desc}</p>}
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '24px' }}>
        <select style={sel} value={brandFilter} onChange={(e) => { setBrandFilter(e.target.value === 'all' ? 'all' : Number(e.target.value)); setCatFilter('all'); }}>
          <option value="all">전체 브랜드</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select style={sel} value={catFilter} onChange={(e) => setCatFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
          <option value="all">전체 카테고리</option>
          {catsForFilter.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select style={sel} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="best">인기순(많이 팔린)</option>
          <option value="recent">최신순</option>
          <option value="price_low">가격 낮은순</option>
          <option value="price_high">가격 높은순</option>
        </select>
        <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#94a3b8' }}>{view.length}개 상품</span>
      </div>

      {loading ? (
        <div style={{ padding: '80px 0', textAlign: 'center', color: '#94a3b8' }}>불러오는 중...</div>
      ) : view.length === 0 ? (
        <div style={{ padding: '80px 0', textAlign: 'center', color: '#94a3b8' }}>
          등록된 상품이 없습니다.
          <div style={{ marginTop: '12px' }}>
            <button onClick={() => navigate('/rental')} style={{ background: TEAL, color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>렌탈 홈으로</button>
          </div>
        </div>
      ) : (
        <div className="rv-grid">
          {view.map((p) => (
            <article className="rv-prod" key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/rental/product/${p.id}`)}>
              <div className="rv-prod__media" style={{ position: 'relative' }}>
                {key === 'best' && bestIds.has(p.id) && <span className="rv-best-badge">BEST</span>}
                <img src={p.thumbnail_url || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80&auto=format&fit=crop'} alt={p.name} loading="lazy" />
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
    </div>
  );
};

export default RentalProductListPage;
