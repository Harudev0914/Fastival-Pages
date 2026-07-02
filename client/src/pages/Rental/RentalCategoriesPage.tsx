import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, Search } from 'lucide-react';
import { productApi, brandApi, rentalCategoryApi, orderApi, type RentalProduct } from '../../api/rentalApi';
import MainVisualCarousel from '../../components/MainVisualCarousel';
import Seo from '../../components/Seo';
import './RentalPage.css';

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;

interface Cat { id: number; name: string; parent_id: number | null; image_url: string | null }

const RentalCategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const selectedCat = params.get('category') ? Number(params.get('category')) : null;

  const [products, setProducts] = useState<RentalProduct[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [sales, setSales] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [brandFilter, setBrandFilter] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recommend');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: p }, { data: c }, { data: b }, salesMap] = [
        await productApi.listActive(), await rentalCategoryApi.listActive(), await brandApi.listActive(),
        await orderApi.salesCountByProduct(),
      ];
      setProducts((p || []).filter((x) => x.is_active));
      setCats(((c || []) as any[]).map((x) => ({ id: x.id, name: x.name, parent_id: x.parent_id ?? null, image_url: x.image_url })));
      setBrands((b || []) as any);
      setSales(salesMap);
      setLoading(false);
    })();
  }, []);

  const topCats = useMemo(() => cats.filter((c) => !c.parent_id), [cats]);
  const childrenOf = (pid: number) => cats.filter((c) => c.parent_id === pid);

  // 선택 카테고리의 대상 상품 id 집합 (부모면 자식 포함)
  const selCatIds = useMemo(() => {
    if (!selectedCat) return null;
    const sel = cats.find((c) => c.id === selectedCat);
    if (!sel) return null;
    if (!sel.parent_id) return new Set<number>([sel.id, ...childrenOf(sel.id).map((c) => c.id)]);
    return new Set<number>([sel.id]);
  }, [selectedCat, cats]);

  const selCatName = selectedCat ? (cats.find((c) => c.id === selectedCat)?.name || '카테고리') : '전체 렌탈 상품';

  const view = useMemo(() => {
    const q = search.trim().toLowerCase();
    let v = products.filter((p) => {
      if (selCatIds && !(p.category_id && selCatIds.has(p.category_id))) return false;
      if (brandFilter !== 'all' && p.brand_id !== brandFilter) return false;
      if (q && !`${p.name} ${p.rental_brands?.name || ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
    if (sort === 'recommend') v = [...v].sort((a, b) => (sales[b.id] || 0) - (sales[a.id] || 0) || (b.created_at || '').localeCompare(a.created_at || ''));
    else if (sort === 'price_low') v = [...v].sort((a, b) => Number(a.daily_price) - Number(b.daily_price));
    else if (sort === 'price_high') v = [...v].sort((a, b) => Number(b.daily_price) - Number(a.daily_price));
    else v = [...v].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    return v;
  }, [products, selCatIds, brandFilter, search, sort, sales]);

  // 상단 가로 스크롤: 기획전 우선, 없으면 인기(판매순)
  const featured = useMemo(() => {
    const ev = products.filter((p) => p.is_event);
    const base = ev.length ? ev : [...products].sort((a, b) => (sales[b.id] || 0) - (sales[a.id] || 0));
    return base.slice(0, 12);
  }, [products, sales]);
  const featuredTitle = products.some((p) => p.is_event) ? '#지금 기획전 특가' : '#지금 인기 렌탈';

  const pickCat = (id: number | null) => { if (id) params.set('category', String(id)); else params.delete('category'); setParams(params, { replace: true }); window.scrollTo({ top: 0 }); };
  const img = (p: RentalProduct) => p.thumbnail_url || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80&auto=format&fit=crop';
  const badge = (p: RentalProduct) => p.is_exclusive ? { t: '단독', c: '#7c3aed' } : p.is_event ? { t: '기획전', c: '#db2777' } : null;

  return (
    <div className="rental-page">
      <Seo title="렌탈 카테고리" description="클립스 렌탈 카테고리 — 원하는 카테고리에서 음향·가구 렌탈 상품을 찾아보세요." keywords="렌탈 카테고리,스피커,가구 렌탈,음향 장비" />

      <div className="rcat-wrap">
        {/* 좌측 카테고리 사이드바 */}
        <aside className="rcat-side">
          <div className="rcat-side__title">카테고리</div>
          <button className={`rcat-side__item ${!selectedCat ? 'on' : ''}`} onClick={() => pickCat(null)}>전체</button>
          <ul className="rcat-side__list">
            {topCats.map((c) => {
              const kids = childrenOf(c.id);
              const hasKids = kids.length > 0;
              const open = expanded === c.id;
              const active = selectedCat === c.id || kids.some((k) => k.id === selectedCat);
              return (
                <li key={c.id}>
                  {/* 행 전체 클릭: 하위 있으면 드롭다운 토글, 없으면 바로 선택 */}
                  <div className={`rcat-side__row ${active ? 'on' : ''}`} role="button" tabIndex={0}
                    onClick={() => (hasKids ? setExpanded(open ? null : c.id) : pickCat(c.id))}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (hasKids) setExpanded(open ? null : c.id); else pickCat(c.id); } }}>
                    <span className="rcat-side__name">{c.name}</span>
                    {hasKids && (
                      <span className="rcat-side__chev" aria-hidden>
                        <ChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                      </span>
                    )}
                  </div>
                  {hasKids && open && (
                    <ul className="rcat-side__sub">
                      {/* 전체(해당 카테고리 전체) + 어드민 등록 하위 카테고리 */}
                      <li><button className={`rcat-side__subitem ${selectedCat === c.id ? 'on' : ''}`} onClick={() => pickCat(c.id)}>전체</button></li>
                      {kids.map((k) => (
                        <li key={k.id}><button className={`rcat-side__subitem ${selectedCat === k.id ? 'on' : ''}`} onClick={() => pickCat(k.id)}>{k.name}</button></li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </aside>

        {/* 메인 */}
        <main className="rcat-main">
          {/* 상단 메인 비주얼 (렌탈 홈과 동일한 히어로 슬라이더) */}
          <div className="rcat-hero"><MainVisualCarousel section="rental" /></div>

          {/* 인기/기획전 가로 스크롤 */}
          {featured.length > 0 && (
            <section className="rcat-feat">
              <div className="rcat-feat__head"><h2 className="rcat-feat__title">{featuredTitle}</h2></div>
              <div className="rcat-feat__row">
                {featured.map((p) => {
                  const bd = badge(p);
                  return (
                    <article className="rcat-fcard" key={p.id} onClick={() => navigate(`/rental/product/${p.id}`)}>
                      <div className="rcat-fcard__media">
                        {bd && <span className="rcat-fcard__badge" style={{ background: bd.c }}>{bd.t}</span>}
                        <img src={img(p)} alt={p.name} loading="lazy" />
                      </div>
                      <p className="rcat-fcard__brand">{p.rental_brands?.name || ''}</p>
                      <p className="rcat-fcard__name">{p.name}</p>
                      <p className="rcat-fcard__price">일 <b>{won(p.daily_price)}</b></p>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* 검색 */}
          <div className="rcat-searchbar">
            <Search size={17} color="#94a3b8" />
            <input placeholder="상품명·브랜드 검색" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {/* 툴바: 개수 + 필터 드롭다운(정렬 · 브랜드) */}
          <div className="rcat-toolbar">
            <span className="rcat-count">{selCatName} <b>{view.length.toLocaleString()}</b>개</span>
            <div className="rcat-drops">
              <div className="rcat-drop">
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="recommend">추천순</option>
                  <option value="recent">최신순</option>
                  <option value="price_low">가격 낮은순</option>
                  <option value="price_high">가격 높은순</option>
                </select>
                <ChevronDown size={15} className="rcat-drop__chev" />
              </div>
              <div className="rcat-drop">
                <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
                  <option value="all">전체 브랜드</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <ChevronDown size={15} className="rcat-drop__chev" />
              </div>
            </div>
          </div>

          {/* 상품 그리드 */}
          {loading ? (
            <div className="rcat-empty">불러오는 중...</div>
          ) : view.length === 0 ? (
            <div className="rcat-empty">해당 카테고리에 등록된 상품이 없습니다.</div>
          ) : (
            <div className="rv-grid">
              {view.map((p) => {
                const bd = badge(p);
                return (
                  <article className="rv-prod" key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/rental/product/${p.id}`)}>
                    <div className="rv-prod__media" style={{ position: 'relative' }}>
                      {bd && <span className="rcat-fcard__badge" style={{ background: bd.c }}>{bd.t}</span>}
                      <img src={img(p)} alt={p.name} loading="lazy" />
                    </div>
                    <p className="rv-prod__brand">{p.rental_brands?.name || ''}</p>
                    <p className="rv-prod__name">{p.name}</p>
                    <div className="rv-prod__price"><span className="rv-prod__monthly">일 {won(p.daily_price)}</span></div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <style>{`
        .rcat-wrap{display:grid;grid-template-columns:210px 1fr;gap:30px;align-items:start;}
        .rcat-side{position:sticky;top:120px;}
        .rcat-side__title{font-size:1.15rem;font-weight:800;color:#1e293b;margin:0 0 14px;padding-bottom:12px;border-bottom:2px solid #1e293b;}
        .rcat-side__item{display:block;width:100%;text-align:left;background:none;border:none;padding:9px 4px;font-size:0.95rem;font-weight:700;color:#334155;cursor:pointer;border-radius:6px;}
        .rcat-side__item.on{color:#2563eb;}
        .rcat-side__list{list-style:none;margin:6px 0 0;padding:0;}
        .rcat-side__row{display:flex;align-items:center;justify-content:space-between;cursor:pointer;border-radius:6px;transition:background .15s;}
        .rcat-side__row:hover{background:#f8fafc;}
        .rcat-side__name{flex:1;text-align:left;padding:9px 4px;font-size:0.92rem;color:#475569;}
        .rcat-side__row.on .rcat-side__name{color:#2563eb;font-weight:700;}
        .rcat-side__chev{color:#94a3b8;padding:6px;display:flex;}
        .rcat-side__sub{list-style:none;margin:0 0 6px;padding:0 0 0 10px;}
        .rcat-side__subitem{display:block;width:100%;text-align:left;background:none;border:none;border-radius:0;padding:7px 8px;font-size:0.88rem;color:#64748b;cursor:pointer;}
        .rcat-side__subitem:hover{color:#2563eb;}
        .rcat-side__subitem.on{color:#2563eb;font-weight:700;}
        .rcat-side__list > li{border-bottom:1px solid #f5f7fa;}

        .rcat-main{min-width:0;}
        .rcat-hero{margin-bottom:30px;}

        .rcat-feat{margin-bottom:34px;}
        .rcat-feat__title{font-size:1.15rem;font-weight:800;color:#1e293b;margin:0 0 14px;}
        .rcat-feat__row{display:flex;gap:14px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px;}
        .rcat-feat__row::-webkit-scrollbar{display:none;}
        .rcat-fcard{flex:0 0 168px;cursor:pointer;}
        .rcat-fcard__media{position:relative;aspect-ratio:1;border-radius:12px;overflow:hidden;background:#f1f5f9;margin-bottom:8px;}
        .rcat-fcard__media img{width:100%;height:100%;object-fit:cover;}
        .rcat-fcard__badge{position:absolute;top:8px;left:8px;color:#fff;font-size:11px;font-weight:800;padding:3px 8px;border-radius:6px;z-index:2;}
        .rcat-fcard__brand{margin:0;font-size:0.78rem;color:#94a3b8;}
        .rcat-fcard__name{margin:2px 0 4px;font-size:0.88rem;color:#1e293b;font-weight:600;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
        .rcat-fcard__price{margin:0;font-size:0.9rem;color:#334155;} .rcat-fcard__price b{color:#2563eb;font-weight:800;}

        .rcat-searchbar{display:flex;align-items:center;gap:9px;background:#f1f5f9;border-radius:12px;padding:12px 16px;margin-bottom:16px;}
        .rcat-searchbar input{border:none;background:none;outline:none;font-size:0.92rem;width:100%;font-family:inherit;color:#1e293b;}

        .rcat-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid #eef2f6;}
        .rcat-count{font-size:0.95rem;color:#475569;} .rcat-count b{color:#1e293b;}
        .rcat-drops{display:flex;gap:8px;}
        .rcat-drop{position:relative;}
        .rcat-drop select{appearance:none;-webkit-appearance:none;-moz-appearance:none;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:9px 34px 9px 14px;font-size:0.88rem;font-weight:600;color:#334155;cursor:pointer;font-family:inherit;transition:border-color .15s,box-shadow .15s;}
        .rcat-drop select:hover{border-color:#cbd5e1;}
        .rcat-drop select:focus{outline:none;border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,0.12);}
        .rcat-drop__chev{position:absolute;right:11px;top:50%;transform:translateY(-50%);color:#94a3b8;pointer-events:none;}
        .rcat-empty{padding:80px 0;text-align:center;color:#94a3b8;}

        @media (max-width:1024px){
          .rcat-wrap{grid-template-columns:1fr;gap:18px;}
          .rcat-side{position:static;border-bottom:1px solid #eef2f6;padding-bottom:12px;}
          .rcat-side__title{display:none;}
          .rcat-side__item{display:inline-block;width:auto;padding:8px 14px;border:1px solid #e2e8f0;border-radius:999px;font-size:0.86rem;margin:0 6px 8px 0;}
          .rcat-side__item.on{background:#1e293b;border-color:#1e293b;color:#fff;}
          .rcat-side__list{display:flex;flex-wrap:wrap;gap:0 6px;}
          .rcat-side__list li{border-bottom:none;}
          .rcat-side__row{border:1px solid #e2e8f0;border-radius:999px;padding:0 6px 0 8px;margin:0 6px 8px 0;}
          .rcat-side__name{padding:8px 4px;font-size:0.86rem;}
          .rcat-side__sub{display:none;}
          .rcat-search{min-width:0;width:100%;}
        }
      `}</style>
    </div>
  );
};

export default RentalCategoriesPage;
