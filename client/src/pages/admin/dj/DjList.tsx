import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { djApi, DJ_STATUS_LABEL, DJ_REGIONS, type DjArtist } from '../../../api/djApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import { card, inputStyle, PageHead, EmptyState, Spinner, useAdminModal } from '../../../components/admin/shared';

const won = (n: number | null) => (n == null ? '-' : `₩${Number(n).toLocaleString()}`);
const REGION_FIELD: Record<string, keyof DjArtist> = { '서울': 'guarantee_seoul', '경기도': 'guarantee_gyeonggi', '대전': 'guarantee_daejeon' };
const guaranteeOf = (a: DjArtist, region: string): number | null => {
  const f = REGION_FIELD[region];
  return f ? (a[f] as number | null) : null;
};

const DjList: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<DjArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('all');
  const [sort, setSort] = useState('recent');
  const [budgetRegion, setBudgetRegion] = useState('서울');
  const [maxBudget, setMaxBudget] = useState('');
  const { element: modal, alert } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await djApi.list();
    if (error) alert('불러오기 오류', error);
    setItems((data || []).filter((a) => a.status === 'approved'));
  }, [alert]);
  useEffect(() => { (async () => { setLoading(true); await fetchItems(); setLoading(false); })(); }, [fetchItems]);

  const view = useMemo(() => {
    const budget = maxBudget ? Number(maxBudget) : null;
    let v = items.filter((it) => {
      if (region !== 'all' && !(it.regions || []).includes(region)) return false;
      if (search.trim() && !`${it.name} ${it.stage_name || ''}`.toLowerCase().includes(search.trim().toLowerCase())) return false;
      if (budget != null) {
        const g = guaranteeOf(it, budgetRegion);
        if (g == null || g > budget) return false; // 해당 지역 게런티가 예산 이하인 DJ만
      }
      return true;
    });
    const gr = (a: DjArtist) => guaranteeOf(a, budgetRegion) ?? Number.MAX_SAFE_INTEGER;
    if (sort === 'name') v = [...v].sort((a, b) => (a.stage_name || a.name).localeCompare(b.stage_name || b.name));
    else if (sort === 'g_asc') v = [...v].sort((a, b) => gr(a) - gr(b));
    else if (sort === 'g_desc') v = [...v].sort((a, b) => (guaranteeOf(b, budgetRegion) ?? -1) - (guaranteeOf(a, budgetRegion) ?? -1));
    else v = [...v].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    return v;
  }, [items, search, region, sort, budgetRegion, maxBudget]);

  const th: React.CSSProperties = { padding: '12px 14px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: 700, background: '#f8fafc', whiteSpace: 'nowrap' };
  const td: React.CSSProperties = { padding: '12px 14px', fontSize: '0.86rem', color: '#334155', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' };

  return (
    <div>
      <PageHead title="DJ 목록" desc="입점 승인된 DJ 아티스트 로스터입니다. 행 클릭 시 입점 상세로 이동합니다." />

      <div style={{ ...card, marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="all">섭외 가능 지역: 전체</option>
          {DJ_REGIONS.map((r) => <option key={r} value={r}>{r} 가능</option>)}
        </select>
        <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="recent">최근 승인순</option>
          <option value="name">활동명순</option>
          <option value="g_asc">게런티 낮은순</option>
          <option value="g_desc">게런티 높은순</option>
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={budgetRegion} onChange={(e) => setBudgetRegion(e.target.value)}>
            {DJ_REGIONS.map((r) => <option key={r} value={r}>{r} 게런티</option>)}
          </select>
          <input type="number" min={0} style={{ ...inputStyle, width: '140px' }} placeholder="예산 이하(원)" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} />
        </div>
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input style={{ ...inputStyle, paddingLeft: '36px' }} placeholder="이름·활동명 검색" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{view.length}명</span>
      </div>

      {loading ? <Spinner /> : view.length === 0 ? <EmptyState message="승인된 DJ가 없습니다. (DJ 입점 관리에서 승인)" /> : (
        <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
            <thead><tr>
              <th style={th}>활동명/이름</th><th style={th}>연락처</th><th style={th}>지역</th><th style={th}>게런티(서울/경기/대전)</th><th style={{ ...th, textAlign: 'center' }}>상태</th><th style={{ ...th, textAlign: 'center' }}> </th>
            </tr></thead>
            <tbody>
              {view.map((a) => (
                <tr key={a.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/dashboard/dj/artists/detail/${a.id}`)}>
                  <td style={{ ...td, fontWeight: 700, color: '#1e293b' }}>{a.stage_name || a.name}<div style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.78rem' }}>{a.name}</div></td>
                  <td style={td}>{a.phone || '-'}</td>
                  <td style={td}>{(a.regions || []).join(', ') || '-'}</td>
                  <td style={td}>{won(a.guarantee_seoul)} / {won(a.guarantee_gyeonggi)} / {won(a.guarantee_daejeon)}</td>
                  <td style={{ ...td, textAlign: 'center' }}><span style={{ background: '#05966915', color: '#059669', fontSize: '0.74rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>{DJ_STATUS_LABEL[a.status]}</span></td>
                  <td style={{ ...td, textAlign: 'center' }}><ChevronRight size={16} color="#cbd5e1" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modal}
    </div>
  );
};

export default DjList;
