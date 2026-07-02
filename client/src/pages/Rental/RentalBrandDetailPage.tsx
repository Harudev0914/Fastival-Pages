import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, Package, X } from 'lucide-react';
import { productApi, brandApi, rentalCategoryApi, orderApi, brandFavoriteApi, type RentalProduct, type RentalBrand, type BrandFavoriter } from '../../api/rentalApi';
import { supabase } from '../../supabaseClient';
import NewBadge from '../../components/NewBadge';
import Seo from '../../components/Seo';
import { shareOrCopy } from '../../utils/share';
import './RentalPage.css';

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;
// 관심 저장 아바타 색상 · 이름 마스킹
const FAV_COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
const favColor = (s: string) => FAV_COLORS[[...(s || '?')].reduce((a, c) => a + c.charCodeAt(0), 0) % FAV_COLORS.length];
const maskName = (n: string) => (n.length <= 1 ? n : n[0] + '*'.repeat(n.length - 1));
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
  const [priceKey, setPriceKey] = useState('all');
  const [sort, setSort] = useState('recommend');
  const [favs, setFavs] = useState<BrandFavoriter[]>([]);   // 관심 저장한 회원(실DB)
  const [myId, setMyId] = useState<string | null>(null);    // 현재 로그인 회원 id
  const [favOpen, setFavOpen] = useState(false);            // 관심 저장한 사람 모달

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
      setLoading(false);
    })();
  }, [brandId]);

  // 현재 로그인 회원 · 관심 저장한 회원 목록(실DB) 로드
  const loadFavs = async () => { const { data } = await brandFavoriteApi.listByBrand(brandId); setFavs(data || []); };
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setMyId(user?.id ?? null);
      await loadFavs();
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
      const price = Number(p.daily_price) || 0;
      if (price < pr.min || price >= pr.max) return false;
      return true;
    });
    if (sort === 'recommend') v = [...v].sort((a, b) => (sales[b.id] || 0) - (sales[a.id] || 0) || (b.created_at || '').localeCompare(a.created_at || ''));
    else if (sort === 'price_low') v = [...v].sort((a, b) => Number(a.daily_price) - Number(b.daily_price));
    else if (sort === 'price_high') v = [...v].sort((a, b) => Number(b.daily_price) - Number(a.daily_price));
    else v = [...v].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    return v;
  }, [products, tab, priceKey, sort, sales]);

  const img = (p: RentalProduct) => p.thumbnail_url || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80&auto=format&fit=crop';

  // 관심 저장 수/목록 (실DB) — 본인은 맨 위 "나", 나머지는 마스킹
  const saved = useMemo(() => !!myId && favs.some((f) => f.user_id === myId), [favs, myId]);
  const favCount = favs.length;
  const favers = useMemo(() => {
    const rows = favs.map((f) => {
      const nm = f.user_name || '회원';
      const me = !!myId && f.user_id === myId;
      return { name: me ? '나' : maskName(nm), initial: (nm[0] || '?'), color: favColor(f.user_name || f.user_id), me };
    });
    // 본인을 목록 맨 위로
    return rows.sort((a, b) => (a.me === b.me ? 0 : a.me ? -1 : 1));
  }, [favs, myId]);

  const toggleSave = async () => {
    const { data, error } = await brandFavoriteApi.toggle(brandId);
    if (error) return alert(error);
    if (data === null) { if (confirm('로그인 후 이용할 수 있습니다. 로그인하시겠어요?')) navigate('/login'); return; }
    await loadFavs();
  };
  // PC: 클립보드 복사 / 모바일·태블릿: 시스템 공유 시트
  const share = () => shareOrCopy({ title: brand?.name || '브랜드' });

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
            {/* 관심 저장한 사람 (겹친 아바타 + 카운트) → 클릭 시 모달 */}
            <button type="button" className="bd-fav" onClick={() => setFavOpen(true)}>
              <span className="bd-fav__avatars">
                {favers.slice(0, 3).map((f, i) => (
                  <span key={i} className="bd-fav__ava" style={{ background: f.color, zIndex: 3 - i }}>{f.initial}</span>
                ))}
              </span>
              <span className="bd-fav__label">관심 <b>{favCount.toLocaleString()}</b></span>
              <ChevronRight size={16} className="bd-fav__chev" />
            </button>
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
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="recommend">인기순</option>
                <option value="recent">최신순</option>
                <option value="price_low">가격 낮은순</option>
                <option value="price_high">가격 높은순</option>
              </select>
              <ChevronDown size={15} className="rcat-drop__chev" />
            </div>
            <div className="rcat-drop">
              <select value={priceKey} onChange={(e) => setPriceKey(e.target.value)}>
                {PRICE_RANGES.map((r) => <option key={r.k} value={r.k}>{r.label}</option>)}
              </select>
              <ChevronDown size={15} className="rcat-drop__chev" />
            </div>
          </div>
          <p className="bd-count">상품 <b>{view.length}</b>개</p>
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
                <div className="rv-prod__price">{Number(p.daily_price) > 0 ? <span className="rv-prod__monthly">일 {won(p.daily_price)}</span> : <span className="rv-prod__monthly rv-prod__soldout">재고 없음</span>}</div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* 관심 저장한 사람 모달 */}
      {favOpen && (
        <div className="bd-modal__dim" onClick={() => setFavOpen(false)}>
          <div className="bd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bd-modal__head">
              <h3>이 브랜드를 관심 저장했어요 <b>{favCount.toLocaleString()}</b></h3>
              <button className="bd-modal__x" onClick={() => setFavOpen(false)} aria-label="닫기"><X size={20} /></button>
            </div>
            <div className="bd-modal__list">
              {favers.length === 0 ? (
                <p className="bd-modal__more">아직 관심 저장한 회원이 없어요. 첫 번째로 저장해보세요!</p>
              ) : favers.map((f, i) => (
                <div key={i} className="bd-modal__row">
                  <span className="bd-fav__ava" style={{ background: f.color }}>{f.initial}</span>
                  <span className="bd-modal__name">{f.name}</span>
                  {f.me && <span className="bd-modal__badge">내 관심</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .bd{max-width:1180px;margin:0 auto;}
        .bd-head{display:flex;align-items:center;gap:26px;padding:8px 0 24px;}
        .bd-logo{width:116px;height:116px;border-radius:50%;border:1px solid #eef2f6;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;}
        .bd-logo img{width:100%;height:100%;object-fit:contain;}
        .bd-name{margin:0;font-size:1.3rem;font-weight:800;color:#1e293b;}
        .bd-sub{margin:4px 0 0;color:#94a3b8;font-size:0.8rem;}
        .bd-count{margin:0;font-size:0.9rem;color:#64748b;font-weight:600;white-space:nowrap;}.bd-count b{color:#1e293b;}
        .bd-fav{display:inline-flex;align-items:center;gap:6px;margin-top:8px;background:none;border:none;padding:3px 0;cursor:pointer;font-family:inherit;}
        .bd-fav__avatars{display:flex;}
        .bd-fav__ava{width:22px;height:22px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.66rem;font-weight:800;margin-left:-8px;flex-shrink:0;}
        .bd-fav__avatars .bd-fav__ava:first-child{margin-left:0;}
        .bd-fav__label{font-size:0.8rem;color:#1e293b;font-weight:700;}.bd-fav__label b{font-weight:800;}
        .bd-fav__chev{color:#94a3b8;width:14px;height:14px;}
        .bd-actions{display:flex;gap:10px;margin-top:14px;}
        .bd-btn{flex:1;padding:6px 20px;border-radius:8px;font-size:0.82rem;font-weight:700;cursor:pointer;font-family:inherit;text-align:center;}
        .bd-btn--save{background:#1e293b;color:#fff;border:1px solid #1e293b;}
        .bd-btn--save.on{background:#2563eb;border-color:#2563eb;}
        .bd-btn--share{background:#fff;color:#334155;border:1px solid #cbd5e1;}
        .bd-tabs{display:flex;gap:26px;border-bottom:1px solid #e2e8f0;margin-bottom:16px;overflow-x:auto;scrollbar-width:none;}
        .bd-tabs::-webkit-scrollbar{display:none;}
        .bd-tab{background:none;border:none;padding:12px 2px;font-size:0.98rem;font-weight:700;color:#94a3b8;cursor:pointer;white-space:nowrap;border-bottom:2px solid transparent;margin-bottom:-1px;font-family:inherit;}
        .bd-tab.on{color:#1e293b;border-bottom-color:#1e293b;}
        .bd-filters{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:22px;}
        .bd-chips{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
        /* 관심 저장한 사람 모달 */
        .bd-modal__dim{position:fixed;inset:0;background:rgba(15,23,42,0.45);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;animation:bdFade .18s ease;}
        .bd-modal{background:#fff;width:100%;max-width:380px;max-height:70vh;border-radius:16px;display:flex;flex-direction:column;overflow:hidden;animation:bdPop .2s ease;}
        .bd-modal__head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:18px 20px;border-bottom:1px solid #eef2f6;}
        .bd-modal__head h3{margin:0;font-size:1rem;font-weight:800;color:#1e293b;}.bd-modal__head b{color:#2563eb;margin-left:4px;}
        .bd-modal__x{background:none;border:none;cursor:pointer;color:#94a3b8;padding:4px;display:flex;flex-shrink:0;}
        .bd-modal__list{overflow-y:auto;padding:8px 8px 16px;}
        .bd-modal__row{display:flex;align-items:center;gap:12px;padding:9px 12px;}
        .bd-modal__row .bd-fav__ava{width:38px;height:38px;font-size:0.95rem;margin-left:0;border:none;}
        .bd-modal__name{font-size:0.92rem;color:#1e293b;font-weight:600;}
        .bd-modal__badge{margin-left:auto;font-size:0.72rem;font-weight:700;color:#2563eb;background:#eff6ff;padding:3px 8px;border-radius:999px;}
        .bd-modal__more{margin:6px 12px 0;font-size:0.85rem;color:#94a3b8;}
        @keyframes bdFade{from{opacity:0;}to{opacity:1;}}
        @keyframes bdPop{from{transform:scale(.96);opacity:0;}to{transform:scale(1);opacity:1;}}
        @media (max-width:767px){
          .bd-head{gap:16px;padding-bottom:18px;}
          .bd-logo{width:88px;height:88px;}
          .bd-name{font-size:1.15rem;}
          .bd-btn{padding:6px 14px;font-size:0.8rem;}
        }
      `}</style>
    </div>
  );
};

export default RentalBrandDetailPage;
