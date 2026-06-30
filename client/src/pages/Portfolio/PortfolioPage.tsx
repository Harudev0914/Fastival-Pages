import React, { useEffect, useRef, useState } from 'react';
import CompanyCard from '../../components/ReviewDetail/CompanySidebar';
import { FilterDropdown } from '../../components/ReviewDetail/FilterChipsRow';
import { categoryApi, portfolioApi, type ConstructionPortfolio } from '../../api/constructionApi';
import { EmptyState } from '../Content/Construction/shared';
import '../ReviewDetail/ReviewDetailPage.css';
import './PortfolioPage.css';

const PF_SORT = ['정렬', '최신순', '인기순', '조회순'];
const PF_AREA = ['평수', '20평 이하', '20~30평', '30~50평', '50평 이상'];
const PF_STYLE = ['스타일', '모던', '내추럴', '클래식', '미니멀'];
const PF_BUDGET = ['예산', '500만원 이하', '500~1000만원', '1000만원 이상'];

// 카테고리명(이모지 제거) → 어울리는 이미지 키워드
const CAT_KEYWORD: Record<string, string> = {
  '카페': 'cafe,interior', '와인바': 'wine,bar', '바(BAR)': 'cocktail,bar', '라운지': 'lounge,interior',
  '클럽': 'nightclub', '음식점': 'restaurant,interior', '고깃집': 'korean,barbecue', '한식': 'korean,restaurant',
  '일식': 'sushi,restaurant', '레스토랑': 'fine,dining', '의류매장': 'clothing,store', '헬스장': 'gym,fitness',
  '미용실': 'hair,salon', '호텔': 'hotel,lobby', '행사장': 'event,hall', '사무실': 'office,interior',
  '학원': 'classroom', '기타': 'interior',
};
const coreName = (name: string) => name.replace(/[^가-힣A-Za-z()]/g, '').trim();
const catImage = (name: string, seed: number) =>
  `https://loremflickr.com/280/280/${CAT_KEYWORD[coreName(name)] || 'interior'}?lock=${seed}`;

interface CategoryTab { id: number; name: string; }

const PortfolioPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryTab[]>([]);
  const [items, setItems] = useState<ConstructionPortfolio[]>([]);
  const [activeCat, setActiveCat] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const tabsRef = useRef<HTMLDivElement>(null);

  const slideTabs = (dir: number) => {
    tabsRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  useEffect(() => {
    (async () => {
      const [catRes, pfRes] = await Promise.all([categoryApi.listActive(), portfolioApi.list()]);
      setCategories(catRes.data || []);
      setItems((pfRes.data || []).filter((p) => p.is_active));
      setLoading(false);
    })();
  }, []);

  const visible = activeCat === 'all' ? items : items.filter((p) => p.category_id === activeCat);

  return (
    <div className="review-page">
      <aside className="review-sidebar">
        <CompanyCard />
      </aside>

      <div className="review-main">
        {/* 어드민 카테고리 관리에 등록된 값으로 구성된 탭 + 하단 좌/우 슬라이드 버튼 */}
        <div className="pf-tabs-wrap">
          <div className="pf-tabs" ref={tabsRef}>
            <button type="button" className={`pf-tab ${activeCat === 'all' ? 'active' : ''}`} onClick={() => setActiveCat('all')}>
              <span className="pf-tab__thumb pf-tab__all">ALL</span>
              <span className="pf-tab__label">전체</span>
            </button>
            {categories.map((c) => (
              <button key={c.id} type="button" className={`pf-tab ${activeCat === c.id ? 'active' : ''}`} onClick={() => setActiveCat(c.id)}>
                <span className="pf-tab__thumb"><img src={catImage(c.name, c.id)} alt={c.name} loading="lazy" /></span>
                <span className="pf-tab__label">{c.name}</span>
              </button>
            ))}
          </div>
          <div className="pf-tab-navs">
            <button type="button" className="pf-tab-nav" onClick={() => slideTabs(-1)} aria-label="이전">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button type="button" className="pf-tab-nav" onClick={() => slideTabs(1)} aria-label="다음">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>

        <div className="filter-row">
          <FilterDropdown options={PF_SORT} />
          <FilterDropdown options={PF_AREA} />
          <FilterDropdown options={PF_STYLE} />
          <FilterDropdown options={PF_BUDGET} />
        </div>

        {loading ? (
          <div className="pf-grid">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="pf-card"><div className="pf-card__media pf-skeleton" /></div>)}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState message="등록된 포트폴리오가 없습니다." />
        ) : (
          <div className="pf-grid">
            {visible.map((p) => {
              const cat = categories.find((c) => c.id === p.category_id);
              const img = p.thumbnail_url || catImage(cat?.name || '기타', p.id);
              const card = (
                <>
                  <div className="pf-card__media"><img src={img} alt={p.title} loading="lazy" /></div>
                  <h3 className="pf-card__title">{p.title}</h3>
                  <p className="pf-card__meta">{cat?.name || '미분류'}</p>
                </>
              );
              return p.link_url
                ? <a key={p.id} className="pf-card" href={p.link_url} target="_blank" rel="noreferrer">{card}</a>
                : <article key={p.id} className="pf-card">{card}</article>;
            })}
          </div>
        )}
      </div>

      {/* 모바일 전용 하단 푸터형 업체 카드 */}
      <div className="review-mobile-footer">
        <CompanyCard />
      </div>
    </div>
  );
};

export default PortfolioPage;
