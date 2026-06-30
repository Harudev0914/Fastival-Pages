import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, ImageOff } from 'lucide-react';
import { portfolioApi, categoryApi, type ConstructionPortfolio } from '../../../api/constructionApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import ToggleButton from '../../../components/UI/ToggleButton';
import BoardTable, { type Column } from '../../../components/admin/BoardTable';
import BoardToolbar, { type SortOption } from '../../../components/admin/BoardToolbar';
import { PageHead, btnPrimary, fmtDate, useAdminModal } from '../../../components/admin/shared';

const SORTS: SortOption[] = [
  { value: 'order', label: '순번순' },
  { value: 'recent', label: '최신 등록순' },
  { value: 'title', label: '제목순' },
];

const ConstructionPortfolioManagement: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ConstructionPortfolio[]>([]);
  const [cats, setCats] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('order');
  const [active, setActive] = useState('all');
  const [catFilter, setCatFilter] = useState<number | 'all'>('all');
  const { element: modal, alert, confirm } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await portfolioApi.list();
    if (error) alert('불러오기 오류', error);
    setItems(data || []);
  }, [alert]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: c } = await categoryApi.listActive();
      setCats(c || []);
      await fetchItems();
      setLoading(false);
    })();
  }, [fetchItems]);

  const view = useMemo(() => {
    let v = items.filter((it) => {
      if (active === 'active' && !it.is_active) return false;
      if (active === 'inactive' && it.is_active) return false;
      if (catFilter !== 'all' && it.category_id !== catFilter) return false;
      if (search.trim() && !`${it.title}`.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
    if (sort === 'recent') v = [...v].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    else if (sort === 'title') v = [...v].sort((a, b) => a.title.localeCompare(b.title));
    else v = [...v].sort((a, b) => a.display_order - b.display_order);
    return v;
  }, [items, search, sort, active, catFilter]);

  const persistOrder = async (reordered: ConstructionPortfolio[]) => {
    const { error } = await portfolioApi.reorder(reordered.map((it) => it.id));
    if (error) alert('순서 저장 오류', error);
    fetchItems();
  };

  const toggleActive = async (item: ConstructionPortfolio) => {
    const { error } = await portfolioApi.setActive(item.id, !item.is_active);
    if (error) alert('상태 변경 오류', error);
    else fetchItems();
  };

  const removeItem = (item: ConstructionPortfolio) => {
    confirm('삭제 확인', `'${item.title}' 포트폴리오를 삭제하시겠습니까?`, async () => {
      const { error } = await portfolioApi.remove(item.id);
      if (error) alert('삭제 오류', error);
      else fetchItems();
    });
  };

  const columns: Column<ConstructionPortfolio>[] = [
    {
      key: 'thumb', label: '이미지', width: '72px', render: (it) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {it.thumbnail_url
            ? <img src={it.thumbnail_url} alt={it.title} style={{ width: '52px', height: '40px', objectFit: 'cover', borderRadius: '6px', background: '#f1f5f9' }} />
            : <div style={{ width: '52px', height: '40px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageOff size={16} color="#cbd5e1" /></div>}
        </div>
      ),
    },
    { key: 'title', label: '제목', width: '1.8fr', align: 'left', render: (it) => <span style={{ fontWeight: 700, color: '#1e293b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</span> },
    { key: 'cat', label: '카테고리', width: '120px', render: (it) => it.construction_categories?.name || '미분류' },
    { key: 'created_at', label: '등록일', width: '150px', render: (it) => fmtDate(it.created_at) },
    { key: 'updated_at', label: '수정일', width: '150px', render: (it) => fmtDate(it.updated_at) },
    { key: 'created_by', label: '등록자', width: '100px', render: (it) => it.created_by || '-' },
    { key: 'updated_by', label: '수정자', width: '100px', render: (it) => it.updated_by || '-' },
    { key: 'active', label: '활성화', width: '80px', render: (it) => <div style={{ display: 'flex', justifyContent: 'center' }}><ToggleButton isOn={it.is_active} onToggle={() => toggleActive(it)} /></div> },
    {
      key: 'manage', label: '관리', width: '90px', render: (it) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          <button onClick={() => navigate(`/admin/dashboard/construction/portfolio/detail/${it.id}`)} title="수정" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} color="#475569" /></button>
          <button onClick={() => removeItem(it)} title="삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} color="#dc2626" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHead
        title="포트폴리오 관리"
        desc="시공 내역(이미지·제목·상세·링크)을 등록·수정·삭제하고 순번/활성화를 관리합니다."
        right={<button style={btnPrimary} onClick={() => navigate('/admin/dashboard/construction/portfolio/detail/new')}><Plus size={18} /> 포트폴리오 등록</button>}
      />
      <BoardToolbar
        search={search} onSearch={setSearch} searchPlaceholder="제목 검색"
        sort={sort} onSort={setSort} sortOptions={SORTS}
        active={active} onActive={setActive} count={view.length}
      >
        <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={catFilter} onChange={(e) => setCatFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
          <option value="all">전체 카테고리</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </BoardToolbar>
      <BoardTable
        items={view}
        getId={(it) => it.id}
        columns={columns}
        onReorder={persistOrder}
        loading={loading}
        emptyMessage="등록된 포트폴리오가 없습니다."
      />
      {modal}
    </div>
  );
};

export default ConstructionPortfolioManagement;
