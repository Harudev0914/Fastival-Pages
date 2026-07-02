import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, SlidersHorizontal, Check } from 'lucide-react';
import { productApi, brandApi, rentalCategoryApi, orderApi, type RentalProduct } from '../../api/rentalApi';
import NewBadge from '../../components/NewBadge';
import Seo from '../../components/Seo';
import './RentalPage.css';

const TEAL = '#2563eb';

const TITLES: Record<string, { title: string; desc: string }> = {
  best: { title: '베스트 렌탈', desc: '지금 가장 인기 있는 렌탈 상품' },
  exclusive: { title: '단독 상품', desc: 'Klipse에서만 만나는 단독 렌탈' },
  event: { title: '기획전', desc: '특별 기획 렌탈 모음' },
  all: { title: '전체 렌탈 상품', desc: '' },
};

const RentalProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const key = location.pathname.split('/')[2] || 'all';
  const meta = TITLES[key] || TITLES.all;
  const initialCat = params.get('category') ? Number(params.get('category')) : 'all';
  const defaultSort = key === 'best' ? 'best' : 'recent';

  const [products, setProducts] = useState<RentalProduct[]>([]);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [cats, setCats] = useState<{ id: number; name: string; brand_id: number | null; parent_id: number | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandFilter, setBrandFilter] = useState<number | 'all'>('all');
  const [catFilter, setCatFilter] = useState<number | 'all'>(initialCat);
  const [sort, setSort] = useState(defaultSort);
  const [search] = useState('');
  const [sales, setSales] = useState<Record<number, number>>({});
  // 모바일 상세검색 바텀시트
  const [sheet, setSheet] = useState(false);
  const [activeGrp, setActiveGrp] = useState<'price' | 'brand' | 'cat'>('price');

  useEffect(() => {
    (async () => {
      setLoading(true);
      // 독립 조회 4건 병렬 실행 (직렬 await 대비 초기 로딩 단축)
      const [{ data: p }, { data: b }, { data: c }, salesMap] = await Promise.all([productApi.listActive(), brandApi.listActive(), rentalCategoryApi.listActive(), orderApi.salesCountByProduct()]);
      setProducts((p || []).filter((x) => x.is_active));
      setBrands((b || []) as any);
      setCats(((c || []) as any[]).map((x) => ({ id: x.id, name: x.name, brand_id: x.brand_id, parent_id: x.parent_id ?? null })));
      setSales(salesMap);
      setLoading(false);
    })();
  }, []);

  const catsForFilter = useMemo(() => brandFilter === 'all' ? cats : cats.filter((c) => c.brand_id === brandFilter), [cats, brandFilter]);

  // 선택 카테고리가 상위(부모)면 하위 카테고리 상품까지 포함해 조회
  const catMatchIds = useMemo(() => {
    if (catFilter === 'all') return null;
    const kids = cats.filter((c) => c.parent_id === catFilter).map((c) => c.id);
    return new Set<number>([catFilter, ...kids]);
  }, [catFilter, cats]);

  const view = useMemo(() => {
    const q = search.trim().toLowerCase();
    let v = products.filter((p) => {
      if (key === 'exclusive' && !p.is_exclusive) return false;
      if (key === 'event' && !p.is_event) return false;
      if (brandFilter !== 'all' && p.brand_id !== brandFilter) return false;
      if (catMatchIds && !(p.category_id && catMatchIds.has(p.category_id))) return false;
      if (q && !`${p.name} ${p.rental_brands?.name || ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
    if (sort === 'best') v = [...v].sort((a, b) => (sales[b.id] || 0) - (sales[a.id] || 0) || (b.created_at || '').localeCompare(a.created_at || ''));
    else if (sort === 'price_low') v = [...v].sort((a, b) => Number(a.daily_price) - Number(b.daily_price));
    else if (sort === 'price_high') v = [...v].sort((a, b) => Number(b.daily_price) - Number(a.daily_price));
    else v = [...v].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    return v;
  }, [products, brandFilter, catMatchIds, sort, key, sales, search]);

  // 베스트 라벨: 판매수 상위 3개(판매 1건 이상)
  const bestIds = useMemo(() => new Set(
    Object.entries(sales).filter(([, n]) => (n as number) > 0).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 3).map(([id]) => Number(id))
  ), [sales]);

  const img = (p: RentalProduct) => p.thumbnail_url || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80&auto=format&fit=crop';

  // ── 상세검색 바텀시트 (모바일) ──
  const sortOpts = [
    { v: 'best', t: '인기순(많이 팔린)' },
    { v: 'recent', t: '최신순' },
    { v: 'price_low', t: '가격 낮은순' },
    { v: 'price_high', t: '가격 높은순' },
  ];
  const isBrandAll = brandFilter === 'all';
  const isBrandChosen = (id: number) => brandFilter === id;
  const pickBrand = (id: number | null) => { setBrandFilter(id == null ? 'all' : id); setCatFilter('all'); };
  const isCatAll = catFilter === 'all';
  const isCatChosen = (id: number) => catFilter === id;
  const pickCat = (id: number | null) => setCatFilter(id == null ? 'all' : id);

  const filterActive = brandFilter !== 'all' || catFilter !== 'all' || sort !== defaultSort || search.trim() !== '';
  const resetFilters = () => { setBrandFilter('all'); setCatFilter('all'); setSort(defaultSort); };
  const grpChanged = { price: sort !== defaultSort, brand: !isBrandAll, cat: !isCatAll };

  return (
    <div className="rental-page">
      <Seo title={meta.title} description={`클립스 렌탈 ${meta.title} — ${meta.desc || '음향·가구 렌탈 상품'}`} keywords="렌탈,음향 렌탈,가구 렌탈,베스트,단독상품,기획전" />
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{meta.title}</h1>
        {meta.desc && <p style={{ color: '#64748b', marginTop: '6px' }}>{meta.desc}</p>}
      </div>

      {/* 툴바: 개수 + 정렬 드롭다운 · 모바일 상세검색 버튼 */}
      <div className="rcat-toolbar">
        <span className="rcat-count">전체 <b>{view.length.toLocaleString()}</b>개</span>
        <div className="rcat-drops">
          <div className="rcat-drop">
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {sortOpts.map((o) => <option key={o.v} value={o.v}>{o.t}</option>)}
            </select>
            <ChevronDown size={15} className="rcat-drop__chev" />
          </div>
        </div>

        {/* 모바일: 상세검색 버튼 → 바텀시트 */}
        <div className="rcat-optbtns">
          <button type="button" className={`rcat-optbtn ${filterActive ? 'on' : ''}`} onClick={() => setSheet(true)}>
            <SlidersHorizontal size={15} /> <span>상세검색</span> <ChevronDown size={14} color="#94a3b8" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rcat-empty">불러오는 중...</div>
      ) : view.length === 0 ? (
        <div style={{ padding: '80px 0', textAlign: 'center', color: '#94a3b8' }}>
          등록된 상품이 없습니다.
          <div style={{ marginTop: '12px' }}>
            <button onClick={() => navigate('/rental')} style={{ background: TEAL, color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>렌탈 홈으로</button>
          </div>
        </div>
      ) : (
        <div className="rv-grid">
          {view.map((p) => {
            const lp = Number(p.list_price) || 0;
            const disc = lp > Number(p.daily_price) ? Math.round(((lp - Number(p.daily_price)) / lp) * 100) : 0;
            return (
              <article className="rv-prod" key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/rental/product/${p.id}`)}>
                <div className="rv-prod__media" style={{ position: 'relative' }}>
                  <NewBadge createdAt={p.created_at} />
                  {key === 'best' && bestIds.has(p.id) && <span className="rv-best-badge" style={{ left: 'auto', right: '8px' }}>BEST</span>}
                  <img src={img(p)} alt={p.name} loading="lazy" />
                </div>
                <p className="rv-prod__brand">{p.rental_brands?.name || p.rental_categories?.name || ''}</p>
                <p className="rv-prod__name">{p.name}</p>
                <div className="rv-prod__price">
                  {Number(p.daily_price) > 0 ? (<>
                    {disc > 0 && <span className="rv-prod__disc">{disc}%</span>}
                    <span className="rv-prod__monthly">월 {Number(p.daily_price).toLocaleString()}원</span>
                  </>) : (
                    <span className="rv-prod__monthly rv-prod__soldout">재고 없음</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 상세검색 바텀시트 (모바일) — 가격대·제조사·카테고리 */}
      {sheet && (
        <div className="rcat-sheet__dim" onClick={() => setSheet(false)}>
          <div className="rcat-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="rcat-sheet__bar" />
            <div className="rcat-sheet__title">상세검색</div>
            <div className="rcat-sheet__split">
              {/* 왼쪽 — 필터 그룹 */}
              <div className="rcat-sheet__menu">
                <button type="button" className={`rcat-sheet__menuitem ${activeGrp === 'price' ? 'on' : ''}`} onClick={() => setActiveGrp('price')}>
                  가격대{grpChanged.price && <span className="rcat-sheet__dot" />}
                </button>
                <button type="button" className={`rcat-sheet__menuitem ${activeGrp === 'brand' ? 'on' : ''}`} onClick={() => setActiveGrp('brand')}>
                  제조사{grpChanged.brand && <span className="rcat-sheet__dot" />}
                </button>
                <button type="button" className={`rcat-sheet__menuitem ${activeGrp === 'cat' ? 'on' : ''}`} onClick={() => setActiveGrp('cat')}>
                  카테고리{grpChanged.cat && <span className="rcat-sheet__dot" />}
                </button>
              </div>

              {/* 오른쪽 — 세부 옵션 */}
              <div className="rcat-sheet__panel">
                {activeGrp === 'price' && sortOpts.map((o) => (
                  <button key={o.v} type="button" className={`rcat-sheet__opt ${sort === o.v ? 'on' : ''}`} onClick={() => setSort(o.v)}>
                    <span>{o.t}</span>{sort === o.v && <Check size={17} />}
                  </button>
                ))}

                {activeGrp === 'brand' && (
                  <>
                    <button type="button" className={`rcat-sheet__opt ${isBrandAll ? 'on' : ''}`} onClick={() => pickBrand(null)}>
                      <span>전체 제조사</span>{isBrandAll && <Check size={17} />}
                    </button>
                    {brands.map((b) => (
                      <button key={b.id} type="button" className={`rcat-sheet__opt ${isBrandChosen(b.id) ? 'on' : ''}`} onClick={() => pickBrand(b.id)}>
                        <span>{b.name}</span>{isBrandChosen(b.id) && <Check size={17} />}
                      </button>
                    ))}
                  </>
                )}

                {activeGrp === 'cat' && (
                  <>
                    <button type="button" className={`rcat-sheet__opt ${isCatAll ? 'on' : ''}`} onClick={() => pickCat(null)}>
                      <span>전체 카테고리</span>{isCatAll && <Check size={17} />}
                    </button>
                    {catsForFilter.map((c) => (
                      <button key={c.id} type="button" className={`rcat-sheet__opt ${isCatChosen(c.id) ? 'on' : ''}`} onClick={() => pickCat(c.id)}>
                        <span>{c.name}</span>{isCatChosen(c.id) && <Check size={17} />}
                      </button>
                    ))}
                  </>
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
    </div>
  );
};

export default RentalProductListPage;
