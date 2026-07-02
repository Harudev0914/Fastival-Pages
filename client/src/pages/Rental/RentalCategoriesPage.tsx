import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, Search, SlidersHorizontal, Check } from 'lucide-react';
import { productApi, brandApi, rentalCategoryApi, orderApi, type RentalProduct } from '../../api/rentalApi';
import MainVisualCarousel from '../../components/MainVisualCarousel';
import RentalBrandDetailPage from './RentalBrandDetailPage';
import NewBadge from '../../components/NewBadge';
import Seo from '../../components/Seo';
import './RentalPage.css';

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;

interface Cat { id: number; name: string; parent_id: number | null; image_url: string | null }

// by='category' : 좌측 사이드바=카테고리(2Depth) / by='brand' : 좌측 사이드바=브랜드 (동일 UI)
const RentalCategoriesPage: React.FC<{ by?: 'category' | 'brand' }> = ({ by = 'category' }) => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const paramKey = by === 'brand' ? 'brand' : 'category';
  const selectedId = params.get(paramKey) ? Number(params.get(paramKey)) : null;

  const [products, setProducts] = useState<RentalProduct[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [sales, setSales] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [brandFilter, setBrandFilter] = useState<number | 'all'>('all');   // 카테고리 모드 툴바 필터
  const [catFilter, setCatFilter] = useState<number | 'all'>('all');       // 브랜드 모드 툴바 필터
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recommend');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [sheet, setSheet] = useState(false);                              // 모바일 상세검색 바텀시트
  const [openGrp, setOpenGrp] = useState({ price: true, brand: true, cat: true }); // 바텀시트 아코디언(드롭다운) 열림 상태

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

  // 카테고리 모드: 선택 카테고리의 대상 상품 id 집합 (부모면 자식 포함)
  const selCatIds = useMemo(() => {
    if (by !== 'category' || !selectedId) return null;
    const sel = cats.find((c) => c.id === selectedId);
    if (!sel) return null;
    if (!sel.parent_id) return new Set<number>([sel.id, ...childrenOf(sel.id).map((c) => c.id)]);
    return new Set<number>([sel.id]);
  }, [by, selectedId, cats]);

  const selName = useMemo(() => {
    if (!selectedId) return by === 'brand' ? '전체 브랜드 상품' : '전체 렌탈 상품';
    if (by === 'brand') return brands.find((b) => b.id === selectedId)?.name || '브랜드';
    return cats.find((c) => c.id === selectedId)?.name || '카테고리';
  }, [by, selectedId, cats, brands]);

  const view = useMemo(() => {
    const q = search.trim().toLowerCase();
    let v = products.filter((p) => {
      if (by === 'category') {
        if (selCatIds && !(p.category_id && selCatIds.has(p.category_id))) return false;
        if (brandFilter !== 'all' && p.brand_id !== brandFilter) return false;
      } else {
        if (selectedId && p.brand_id !== selectedId) return false;
        if (catFilter !== 'all' && p.category_id !== catFilter) return false;
      }
      if (q && !`${p.name} ${p.rental_brands?.name || ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
    if (sort === 'recommend') v = [...v].sort((a, b) => (sales[b.id] || 0) - (sales[a.id] || 0) || (b.created_at || '').localeCompare(a.created_at || ''));
    else if (sort === 'price_low') v = [...v].sort((a, b) => Number(a.daily_price) - Number(b.daily_price));
    else if (sort === 'price_high') v = [...v].sort((a, b) => Number(b.daily_price) - Number(a.daily_price));
    else v = [...v].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    return v;
  }, [by, products, selCatIds, selectedId, brandFilter, catFilter, search, sort, sales]);

  // 상단 가로 스크롤: 기획전 우선, 없으면 인기(판매순)
  const featured = useMemo(() => {
    const ev = products.filter((p) => p.is_event);
    const base = ev.length ? ev : [...products].sort((a, b) => (sales[b.id] || 0) - (sales[a.id] || 0));
    return base.slice(0, 12);
  }, [products, sales]);
  const featuredTitle = products.some((p) => p.is_event) ? '#지금 기획전 특가' : '#지금 인기 렌탈';

  const pickSel = (id: number | null, scroll = true) => { if (id) params.set(paramKey, String(id)); else params.delete(paramKey); setParams(params, { replace: true }); if (scroll) window.scrollTo({ top: 0 }); };
  const img = (p: RentalProduct) => p.thumbnail_url || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80&auto=format&fit=crop';
  const badge = (p: RentalProduct) => p.is_exclusive ? { t: '단독', c: '#7c3aed' } : p.is_event ? { t: '기획전', c: '#db2777' } : null;

  const sideTitle = by === 'brand' ? '브랜드' : '카테고리';

  // ── 모바일 상세검색 바텀시트 (숨긴 사이드바 대체) ──────────────────────────
  const sortOpts = [
    { v: 'recommend', t: '추천순' },
    { v: 'recent', t: '최신순' },
    { v: 'price_low', t: '가격 낮은순' },
    { v: 'price_high', t: '가격 높은순' },
  ];

  // 카테고리(어드민 등록) — 카테고리 페이지=주 선택(URL) / 브랜드 페이지=카테고리 필터
  const catSheetList = topCats.flatMap((tc) => [{ id: tc.id, name: tc.name, child: false }, ...childrenOf(tc.id).map((k) => ({ id: k.id, name: k.name, child: true }))]);
  const isCatAll = by === 'category' ? !selectedId : catFilter === 'all';
  const isCatChosen = (id: number) => (by === 'category' ? selectedId === id : catFilter === id);
  const pickCat = (id: number | null) => { if (by === 'category') pickSel(id, false); else setCatFilter(id == null ? 'all' : id); };

  // 제조사(어드민 등록 브랜드) — 브랜드 페이지=주 선택(URL) / 카테고리 페이지=브랜드 필터
  const isBrandAll = by === 'brand' ? !selectedId : brandFilter === 'all';
  const isBrandChosen = (id: number) => (by === 'brand' ? selectedId === id : brandFilter === id);
  const pickBrand = (id: number | null) => { if (by === 'brand') pickSel(id, false); else setBrandFilter(id == null ? 'all' : id); };

  // 활성화된 필터 여부 (버튼 강조 · 초기화 노출)
  const filterActive = sort !== 'recommend' || !isCatAll || !isBrandAll;
  const resetFilters = () => { setSort('recommend'); setBrandFilter('all'); setCatFilter('all'); pickSel(null, false); };

  // 바텀시트 아코디언(드롭다운) — 그룹 열고닫기 + 헤더에 현재 선택값 요약
  const toggleGrp = (k: 'price' | 'brand' | 'cat') => setOpenGrp((g) => ({ ...g, [k]: !g[k] }));
  const curSort = sortOpts.find((o) => o.v === sort)?.t || '추천순';
  const curBrandId = by === 'brand' ? selectedId : (brandFilter === 'all' ? null : brandFilter);
  const curCatId = by === 'category' ? selectedId : (catFilter === 'all' ? null : catFilter);
  const curBrandName = curBrandId ? (brands.find((b) => b.id === curBrandId)?.name || '전체 제조사') : '전체 제조사';
  const curCatName = curCatId ? (cats.find((c) => c.id === curCatId)?.name || '전체 카테고리') : '전체 카테고리';

  return (
    <div className="rental-page">
      <Seo
        title={by === 'brand' ? '렌탈 브랜드' : '렌탈 카테고리'}
        description={by === 'brand' ? '클립스 렌탈 브랜드 — 브랜드별로 음향·가구 렌탈 상품을 찾아보세요.' : '클립스 렌탈 카테고리 — 원하는 카테고리에서 음향·가구 렌탈 상품을 찾아보세요.'}
        keywords={by === 'brand' ? '렌탈 브랜드,음향 브랜드,가구 렌탈 브랜드' : '렌탈 카테고리,스피커,가구 렌탈,음향 장비'}
      />

      <div className="rcat-wrap">
        {/* 좌측 사이드바 (카테고리 or 브랜드) */}
        <aside className="rcat-side">
          <div className="rcat-side__title">{sideTitle}</div>
          <button className={`rcat-side__item ${!selectedId ? 'on' : ''}`} onClick={() => pickSel(null)}>전체</button>
          <ul className="rcat-side__list">
            {by === 'brand'
              ? brands.map((b) => (
                <li key={b.id}>
                  <div className={`rcat-side__row ${selectedId === b.id ? 'on' : ''}`} role="button" tabIndex={0}
                    onClick={() => pickSel(b.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickSel(b.id); } }}>
                    <span className="rcat-side__name">{b.name}</span>
                  </div>
                </li>
              ))
              : topCats.map((c) => {
                const kids = childrenOf(c.id);
                const hasKids = kids.length > 0;
                const open = expanded === c.id;
                const active = selectedId === c.id || kids.some((k) => k.id === selectedId);
                return (
                  <li key={c.id}>
                    {/* 행 전체 클릭: 하위 있으면 드롭다운 토글, 없으면 바로 선택 */}
                    <div className={`rcat-side__row ${active ? 'on' : ''}`} role="button" tabIndex={0}
                      onClick={() => (hasKids ? setExpanded(open ? null : c.id) : pickSel(c.id))}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (hasKids) setExpanded(open ? null : c.id); else pickSel(c.id); } }}>
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
                        <li><button className={`rcat-side__subitem ${selectedId === c.id ? 'on' : ''}`} onClick={() => pickSel(c.id)}>전체</button></li>
                        {kids.map((k) => (
                          <li key={k.id}><button className={`rcat-side__subitem ${selectedId === k.id ? 'on' : ''}`} onClick={() => pickSel(k.id)}>{k.name}</button></li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
          </ul>
        </aside>

        {/* 메인 — 브랜드 선택 시 해당 브랜드 스토어로 교체(사이드바 유지) */}
        {by === 'brand' && selectedId ? (
          <main className="rcat-main"><RentalBrandDetailPage brandId={selectedId} embedded /></main>
        ) : (
        <main className="rcat-main">
          {/* 상단 메인 비주얼 (렌탈 홈과 동일한 히어로 슬라이더) */}
          <div className="rcat-hero"><MainVisualCarousel section="rental" /></div>

          {/* 인기/기획전 가로 스크롤 (카테고리 페이지에서는 숨김) */}
          {by !== 'category' && featured.length > 0 && (
            <section className="rcat-feat">
              <div className="rcat-feat__head"><h2 className="rcat-feat__title">{featuredTitle}</h2></div>
              <div className="rcat-feat__row">
                {featured.map((p) => {
                  const bd = badge(p);
                  return (
                    <article className="rcat-fcard" key={p.id} onClick={() => navigate(`/rental/product/${p.id}`)}>
                      <div className="rcat-fcard__media">
                        <NewBadge createdAt={p.created_at} />
                        {bd && <span className="rcat-fcard__badge" style={{ background: bd.c, left: 'auto', right: '8px' }}>{bd.t}</span>}
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

          {/* 툴바: 개수 + 필터 드롭다운(정렬 · 브랜드/카테고리) */}
          <div className="rcat-toolbar">
            <span className="rcat-count">{selName} <b>{view.length.toLocaleString()}</b>개</span>
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
              {/* 보조 필터(브랜드/카테고리) — 태블릿 이상에선 좌측 사이드바가 대체하므로 숨김 */}
              {by === 'category' ? (
                <div className="rcat-drop rcat-drop--filter">
                  <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
                    <option value="all">전체 브랜드</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <ChevronDown size={15} className="rcat-drop__chev" />
                </div>
              ) : (
                <div className="rcat-drop rcat-drop--filter">
                  <select value={catFilter} onChange={(e) => setCatFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
                    <option value="all">전체 카테고리</option>
                    {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown size={15} className="rcat-drop__chev" />
                </div>
              )}
            </div>

            {/* 모바일: 상세검색 버튼 (개수 왼쪽 · 탭 → 바텀시트) */}
            <div className="rcat-optbtns">
              <button type="button" className={`rcat-optbtn ${filterActive ? 'on' : ''}`} onClick={() => setSheet(true)}>
                <SlidersHorizontal size={15} /> <span>상세검색</span> <ChevronDown size={14} color="#94a3b8" />
              </button>
            </div>
          </div>

          {/* 상품 그리드 */}
          {loading ? (
            <div className="rcat-empty">불러오는 중...</div>
          ) : view.length === 0 ? (
            <div className="rcat-empty">해당 {sideTitle}에 등록된 상품이 없습니다.</div>
          ) : (
            <div className="rv-grid">
              {view.map((p) => {
                const bd = badge(p);
                const lp = Number(p.list_price) || 0;
                const disc = lp > Number(p.daily_price) ? Math.round(((lp - Number(p.daily_price)) / lp) * 100) : 0;
                return (
                  <article className="rv-prod" key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/rental/product/${p.id}`)}>
                    <div className="rv-prod__media" style={{ position: 'relative' }}>
                      <NewBadge createdAt={p.created_at} />
                      {bd && <span className="rcat-fcard__badge" style={{ background: bd.c, left: 'auto', right: '8px' }}>{bd.t}</span>}
                      <img src={img(p)} alt={p.name} loading="lazy" />
                    </div>
                    <p className="rv-prod__brand">{p.rental_brands?.name || p.rental_categories?.name || ''}</p>
                    <p className="rv-prod__name">{p.name}</p>
                    <div className="rv-prod__price">
                      {disc > 0 && <span className="rv-prod__disc">{disc}%</span>}
                      <span className="rv-prod__monthly">일 {won(p.daily_price)}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
        )}
      </div>

      {/* 상세검색 바텀시트 (모바일) — 1Depth(가격대·제조사·카테고리) + 2Depth 내역 */}
      {sheet && (
        <div className="rcat-sheet__dim" onClick={() => setSheet(false)}>
          <div className="rcat-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="rcat-sheet__bar" />
            <div className="rcat-sheet__title">상세검색</div>
            <div className="rcat-sheet__body">
              {/* 가격대(정렬) — 드롭다운 */}
              <div className="rcat-acc">
                <button type="button" className="rcat-acc__head" onClick={() => toggleGrp('price')}>
                  <span className="rcat-acc__label">가격대</span>
                  <span className="rcat-acc__val">{curSort}</span>
                  <ChevronDown size={18} className="rcat-acc__chev" style={{ transform: openGrp.price ? 'rotate(180deg)' : 'none' }} />
                </button>
                {openGrp.price && (
                  <div className="rcat-acc__panel">
                    {sortOpts.map((o) => (
                      <button key={o.v} type="button" className={`rcat-sheet__opt ${sort === o.v ? 'on' : ''}`} onClick={() => setSort(o.v)}>
                        <span>{o.t}</span>{sort === o.v && <Check size={17} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 제조사 — 드롭다운 */}
              <div className="rcat-acc">
                <button type="button" className="rcat-acc__head" onClick={() => toggleGrp('brand')}>
                  <span className="rcat-acc__label">제조사</span>
                  <span className="rcat-acc__val">{curBrandName}</span>
                  <ChevronDown size={18} className="rcat-acc__chev" style={{ transform: openGrp.brand ? 'rotate(180deg)' : 'none' }} />
                </button>
                {openGrp.brand && (
                  <div className="rcat-acc__panel">
                    <button type="button" className={`rcat-sheet__opt ${isBrandAll ? 'on' : ''}`} onClick={() => pickBrand(null)}>
                      <span>전체 제조사</span>{isBrandAll && <Check size={17} />}
                    </button>
                    {brands.map((b) => (
                      <button key={b.id} type="button" className={`rcat-sheet__opt ${isBrandChosen(b.id) ? 'on' : ''}`} onClick={() => pickBrand(b.id)}>
                        <span>{b.name}</span>{isBrandChosen(b.id) && <Check size={17} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 카테고리 — 드롭다운 */}
              <div className="rcat-acc">
                <button type="button" className="rcat-acc__head" onClick={() => toggleGrp('cat')}>
                  <span className="rcat-acc__label">카테고리</span>
                  <span className="rcat-acc__val">{curCatName}</span>
                  <ChevronDown size={18} className="rcat-acc__chev" style={{ transform: openGrp.cat ? 'rotate(180deg)' : 'none' }} />
                </button>
                {openGrp.cat && (
                  <div className="rcat-acc__panel">
                    <button type="button" className={`rcat-sheet__opt ${isCatAll ? 'on' : ''}`} onClick={() => pickCat(null)}>
                      <span>전체 카테고리</span>{isCatAll && <Check size={17} />}
                    </button>
                    {catSheetList.map((c) => (
                      <button key={c.id} type="button" className={`rcat-sheet__opt ${c.child ? 'child' : ''} ${isCatChosen(c.id) ? 'on' : ''}`} onClick={() => pickCat(c.id)}>
                        <span>{c.name}</span>{isCatChosen(c.id) && <Check size={17} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 하단 — 초기화 · 적용 */}
            <div className="rcat-sheet__foot">
              <button type="button" className="rcat-sheet__reset" onClick={resetFilters} disabled={!filterActive}>초기화</button>
              <button type="button" className="rcat-sheet__apply" onClick={() => setSheet(false)}>적용</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .rcat-wrap{display:grid;grid-template-columns:210px 1fr;gap:30px;align-items:start;}
        .rcat-side{position:sticky;top:124px;max-height:calc(100vh - 144px);overflow-y:auto;scrollbar-width:none;}
        .rcat-side::-webkit-scrollbar{display:none;}
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
        .rcat-count{font-size:0.95rem;color:#475569;order:2;} .rcat-count b{color:#1e293b;}
        .rcat-drops{display:flex;gap:8px;order:1;}
        .rcat-drop{position:relative;}
        .rcat-drop select{appearance:none;-webkit-appearance:none;-moz-appearance:none;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:9px 34px 9px 14px;font-size:0.88rem;font-weight:600;color:#334155;cursor:pointer;font-family:inherit;transition:border-color .15s,box-shadow .15s;}
        .rcat-drop select:hover{border-color:#cbd5e1;}
        .rcat-drop select:focus{outline:none;border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,0.12);}
        .rcat-drop__chev{position:absolute;right:11px;top:50%;transform:translateY(-50%);color:#94a3b8;pointer-events:none;}
        .rcat-empty{padding:80px 0;text-align:center;color:#94a3b8;}

        /* 모바일 세부 옵션 버튼 (기본 숨김 → 모바일에서 노출) */
        .rcat-optbtns{display:none;gap:8px;}
        .rcat-optbtn{display:inline-flex;align-items:center;gap:6px;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:9px 12px;font-size:0.86rem;font-weight:700;color:#334155;cursor:pointer;font-family:inherit;max-width:52vw;}
        .rcat-optbtn span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .rcat-optbtn.on{border-color:#2563eb;color:#2563eb;background:#eff6ff;}

        /* 바텀시트 — 1Depth(가격대·제조사·카테고리) + 2Depth 내역 + 하단 초기화·적용 */
        .rcat-sheet__dim{position:fixed;inset:0;background:rgba(15,23,42,0.45);z-index:1000;display:flex;align-items:flex-end;animation:rcatFade .2s ease;}
        .rcat-sheet{display:flex;flex-direction:column;background:#fff;width:100%;border-radius:18px 18px 0 0;padding:10px 0 0;max-height:80vh;animation:rcatUp .25s ease;}
        .rcat-sheet__bar{width:40px;height:4px;border-radius:999px;background:#e2e8f0;margin:6px auto 12px;flex:none;}
        .rcat-sheet__title{font-size:1.02rem;font-weight:800;color:#1e293b;margin:0 0 12px;padding:0 16px;flex:none;}
        .rcat-sheet__body{min-height:0;flex:1;overflow-y:auto;border-top:1px solid #eef2f6;}
        /* 아코디언(드롭다운) 그룹 — 세로로 쭉 나열 */
        .rcat-acc{border-bottom:1px solid #f1f5f9;}
        .rcat-acc__head{display:flex;align-items:center;gap:8px;width:100%;background:none;border:none;padding:15px 16px;font-family:inherit;cursor:pointer;}
        .rcat-acc__label{font-size:0.95rem;font-weight:800;color:#1e293b;}
        .rcat-acc__val{margin-left:auto;font-size:0.86rem;font-weight:600;color:#2563eb;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:50vw;}
        .rcat-acc__chev{color:#94a3b8;flex:none;transition:transform .2s;}
        .rcat-acc__panel{display:flex;flex-direction:column;gap:4px;padding:0 16px 12px;}
        .rcat-sheet__opt{display:flex;align-items:center;justify-content:space-between;width:100%;text-align:left;background:none;border:none;border-radius:10px;padding:11px 12px;font-size:0.92rem;font-weight:600;color:#334155;cursor:pointer;font-family:inherit;}
        .rcat-sheet__opt.on{background:#eff6ff;color:#2563eb;font-weight:800;}
        .rcat-sheet__opt.child{padding-left:24px;font-size:0.88rem;color:#64748b;}
        .rcat-sheet__opt.child.on{color:#2563eb;}
        /* 하단 초기화·적용 */
        .rcat-sheet__foot{flex:none;display:flex;gap:10px;padding:12px 16px calc(14px + env(safe-area-inset-bottom));border-top:1px solid #eef2f6;}
        .rcat-sheet__reset{flex:0 0 34%;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:14px 0;font-size:0.95rem;font-weight:700;color:#334155;cursor:pointer;font-family:inherit;}
        .rcat-sheet__reset:disabled{color:#cbd5e1;cursor:default;}
        .rcat-sheet__apply{flex:1;background:#2563eb;border:none;border-radius:12px;padding:14px 0;font-size:0.95rem;font-weight:800;color:#fff;cursor:pointer;font-family:inherit;}
        @keyframes rcatUp{from{transform:translateY(100%);}to{transform:translateY(0);}}
        @keyframes rcatFade{from{opacity:0;}to{opacity:1;}}

        /* 태블릿 이상: 보조 필터 드롭다운은 좌측 사이드바가 대체하므로 숨김(정렬만 노출) */
        @media (min-width:769px){
          .rcat-drop--filter{display:none;}
        }

        /* 태블릿(769px~)은 PC와 동일한 2열 레이아웃 유지 · 모바일(~768px)만 사이드바 제거 + 세부 옵션 버튼 */
        @media (max-width:768px){
          .rcat-wrap{grid-template-columns:1fr;gap:18px;}
          .rcat-side{display:none;}
          .rcat-search{min-width:0;width:100%;}
          .rcat-drops{display:none;}
          .rcat-toolbar{justify-content:flex-start;}
          .rcat-optbtns{display:flex;order:1;}
          .rcat-count{order:2;}
        }
      `}</style>
    </div>
  );
};

export default RentalCategoriesPage;
