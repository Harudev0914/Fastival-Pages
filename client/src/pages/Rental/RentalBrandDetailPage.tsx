import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, Package, Check } from 'lucide-react';
import { productApi, brandApi, rentalCategoryApi, orderApi, type RentalProduct, type RentalBrand } from '../../api/rentalApi';
import NewBadge from '../../components/NewBadge';
import Seo from '../../components/Seo';
import './RentalPage.css';

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;
const PRICE_RANGES = [
  { k: 'all', label: '가격대', min: 0, max: Infinity },
  { k: 'a', label: '5만원 이하', min: 0, max: 50000 },
  { k: 'b', label: '5~10만원', min: 50000, max: 100000 },
  { k: 'c', label: '10~30만원', min: 100000, max: 300000 },
  { k: 'd', label: '30만원 이상', min: 300000, max: Infinity },
];

// brandId prop 제공 시 임베드 모드(사이드바 유지한 채 메인만 교체). 미제공 시 URL(:id) 사용
const RentalBrandDetailPage: React.FC<{ brandId?: number; embedded?: boolean }> = ({ brandId: brandIdProp, embedded }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const brandId = brandIdProp ?? Number(id);
  const outer = embedded ? '' : 'rental-page';

  const [brand, setBrand] = useState<RentalBrand | null>(null);
  const [products, setProducts] = useState<RentalProduct[]>([]);
  const [catNames, setCatNames] = useState<Record<number, string>>({});
  const [sales, setSales] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<number | 'all'>('all');
  const [catFilter, setCatFilter] = useState<number | 'all'>('all');
  const [priceKey, setPriceKey] = useState('all');
  const [excludeSold, setExcludeSold] = useState(false);
  const [sort, setSort] = useState('recommend');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: b }, { data: p }, { data: c }, salesMap] = [
        await brandApi.get(brandId), await productApi.listActive(), await rentalCategoryApi.listActive(), await orderApi.salesCountByProduct(),
      ];
      setBrand(b);
      setProducts((p || []).filter((x) => x.is_active && x.brand_id === brandId));
      setCatNames(Object.fromEntries(((c || []) as any[]).map((x) => [x.id, x.name])));
      setSales(salesMap);
      setSaved(localStorage.getItem(`brandfav_${brandId}`) === '1');
      setLoading(false);
    })();
  }, [brandId]);

  // 브랜드 상품에 실제 존재하는 카테고리로 탭 구성
  const brandCats = useMemo(() => {
    const ids = Array.from(new Set(products.map((p) => p.category_id).filter((x): x is number => !!x)));
    return ids.map((cid) => ({ id: cid, name: catNames[cid] || '기타' }));
  }, [products, catNames]);

  const view = useMemo(() => {
    const pr = PRICE_RANGES.find((r) => r.k === priceKey) || PRICE_RANGES[0];
    let v = products.filter((p) => {
      if (tab !== 'all' && p.category_id !== tab) return false;
      if (catFilter !== 'all' && p.category_id !== catFilter) return false;
      const price = Number(p.daily_price) || 0;
      if (price < pr.min || price >= pr.max) return false;
      if (excludeSold && !(p.stock > 0)) return false;
      return true;
    });
    if (sort === 'recommend') v = [...v].sort((a, b) => (sales[b.id] || 0) - (sales[a.id] || 0) || (b.created_at || '').localeCompare(a.created_at || ''));
    else if (sort === 'price_low') v = [...v].sort((a, b) => Number(a.daily_price) - Number(b.daily_price));
    else if (sort === 'price_high') v = [...v].sort((a, b) => Number(b.daily_price) - Number(a.daily_price));
    else v = [...v].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    return v;
  }, [products, tab, catFilter, priceKey, excludeSold, sort, sales]);

  const img = (p: RentalProduct) => p.thumbnail_url || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80&auto=format&fit=crop';

  const toggleSave = () => { const nv = !saved; setSaved(nv); localStorage.setItem(`brandfav_${brandId}`, nv ? '1' : '0'); };
  const share = async () => {
    const url = window.location.href;
    try { if (navigator.share) await navigator.share({ title: brand?.name || '브랜드', url }); else { await navigator.clipboard.writeText(url); alert('링크가 복사되었습니다.'); } } catch { /* noop */ }
  };

  if (loading) return <div className={outer}><div style={{ padding: '80px 0', textAlign: 'center', color: '#94a3b8' }}>불러오는 중...</div></div>;
  if (!brand) return <div className={outer}><div style={{ padding: '80px 0', textAlign: 'center', color: '#94a3b8' }}>브랜드를 찾을 수 없습니다.</div></div>;

  return (
    <div className={outer}>
      <Seo title={`${brand.name} 렌탈`} description={`${brand.name} 렌탈 상품 — 클립스에서 ${brand.name} 음향·장비를 대여하세요.`} keywords={`${brand.name},렌탈,${brand.name} 렌탈`} />

      <div className="bd">
        {/* 브랜드 헤더 */}
        <div className="bd-head">
          <div className="bd-logo">{brand.logo_url ? <img src={brand.logo_url} alt={brand.name} /> : <Package size={40} color="#94a3b8" />}</div>
          <div className="bd-info">
            <h1 className="bd-name">{brand.name}</h1>
            {brand.description && <p className="bd-sub">{brand.description}</p>}
            <p className="bd-count">상품 <b>{products.length}</b>개</p>
            <div className="bd-actions">
              <button className={`bd-btn bd-btn--save ${saved ? 'on' : ''}`} onClick={toggleSave}>{saved ? '관심 저장됨' : '관심 저장'}</button>
              <button className="bd-btn bd-btn--share" onClick={share}>브랜드 공유</button>
            </div>
          </div>
        </div>

        {/* 카테고리 탭 (브랜드 상품의 실제 카테고리) */}
        <div className="bd-tabs">
          <button className={`bd-tab ${tab === 'all' ? 'on' : ''}`} onClick={() => setTab('all')}>전체</button>
          {brandCats.map((c) => (
            <button key={c.id} className={`bd-tab ${tab === c.id ? 'on' : ''}`} onClick={() => setTab(c.id)}>{c.name}</button>
          ))}
        </div>

        {/* 필터 바 */}
        <div className="bd-filters">
          <div className="bd-chips">
            <div className="rcat-drop">
              <select value={catFilter} onChange={(e) => setCatFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
                <option value="all">카테고리</option>
                {brandCats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown size={15} className="rcat-drop__chev" />
            </div>
            <div className="rcat-drop">
              <select value={priceKey} onChange={(e) => setPriceKey(e.target.value)}>
                {PRICE_RANGES.map((r) => <option key={r.k} value={r.k}>{r.label}</option>)}
              </select>
              <ChevronDown size={15} className="rcat-drop__chev" />
            </div>
            <button className={`bd-check ${excludeSold ? 'on' : ''}`} onClick={() => setExcludeSold((v) => !v)}>
              <span className="bd-check__box">{excludeSold && <Check size={12} strokeWidth={3} />}</span> 품절제외
            </button>
          </div>
          <div className="rcat-drop">
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="recommend">인기순</option>
              <option value="recent">최신순</option>
              <option value="price_low">가격 낮은순</option>
              <option value="price_high">가격 높은순</option>
            </select>
            <ChevronDown size={15} className="rcat-drop__chev" />
          </div>
        </div>

        {/* 상품 그리드 */}
        {view.length === 0 ? (
          <div className="rcat-empty">해당 조건의 상품이 없습니다.</div>
        ) : (
          <div className="rv-grid">
            {view.map((p) => (
              <article className="rv-prod" key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/rental/product/${p.id}`)}>
                <div className="rv-prod__media" style={{ position: 'relative' }}><NewBadge createdAt={p.created_at} /><img src={img(p)} alt={p.name} loading="lazy" /></div>
                <p className="rv-prod__brand">{brand.name}</p>
                <p className="rv-prod__name">{p.name}</p>
                <div className="rv-prod__price"><span className="rv-prod__monthly">일 {won(p.daily_price)}</span></div>
              </article>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .bd{max-width:1180px;margin:0 auto;}
        .bd-head{display:flex;align-items:center;gap:26px;padding:8px 0 24px;}
        .bd-logo{width:96px;height:96px;border-radius:50%;border:1px solid #eef2f6;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;}
        .bd-logo img{width:100%;height:100%;object-fit:contain;}
        .bd-name{margin:0;font-size:1.6rem;font-weight:800;color:#1e293b;}
        .bd-sub{margin:4px 0 0;color:#94a3b8;font-size:0.9rem;}
        .bd-count{margin:8px 0 0;font-size:0.86rem;color:#64748b;}.bd-count b{color:#1e293b;}
        .bd-actions{display:flex;gap:10px;margin-top:14px;}
        .bd-btn{padding:11px 24px;border-radius:8px;font-size:0.9rem;font-weight:700;cursor:pointer;font-family:inherit;}
        .bd-btn--save{background:#1e293b;color:#fff;border:1px solid #1e293b;}
        .bd-btn--save.on{background:#2563eb;border-color:#2563eb;}
        .bd-btn--share{background:#fff;color:#334155;border:1px solid #cbd5e1;}
        .bd-tabs{display:flex;gap:26px;border-bottom:1px solid #e2e8f0;margin-bottom:16px;overflow-x:auto;scrollbar-width:none;}
        .bd-tabs::-webkit-scrollbar{display:none;}
        .bd-tab{background:none;border:none;padding:12px 2px;font-size:0.98rem;font-weight:700;color:#94a3b8;cursor:pointer;white-space:nowrap;border-bottom:2px solid transparent;margin-bottom:-1px;font-family:inherit;}
        .bd-tab.on{color:#1e293b;border-bottom-color:#1e293b;}
        .bd-filters{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:22px;}
        .bd-chips{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
        .bd-check{display:inline-flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;font-size:0.88rem;color:#64748b;font-family:inherit;font-weight:600;}
        .bd-check__box{width:18px;height:18px;border-radius:50%;border:1.5px solid #cbd5e1;display:flex;align-items:center;justify-content:center;color:#fff;}
        .bd-check.on .bd-check__box{background:#2563eb;border-color:#2563eb;}
        .bd-check.on{color:#1e293b;}
        @media (max-width:767px){
          .bd-head{gap:16px;padding-bottom:18px;}
          .bd-logo{width:72px;height:72px;}
          .bd-name{font-size:1.3rem;}
          .bd-btn{padding:10px 16px;font-size:0.85rem;}
        }
      `}</style>
    </div>
  );
};

export default RentalBrandDetailPage;
