import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Star } from 'lucide-react';
import { reviewApi, categoryApi, type ConstructionReview } from '../../../api/constructionApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import ToggleButton from '../../../components/UI/ToggleButton';
import BoardTable, { type Column } from '../../../components/admin/BoardTable';
import BoardToolbar, { type SortOption } from '../../../components/admin/BoardToolbar';
import { PageHead, btnPrimary, fmtDate, useAdminModal } from '../../../components/admin/shared';
import { useAdminPermissions } from '../../../hooks/useAdminPermissions';

const SORTS: SortOption[] = [
  { value: 'order', label: '순번순' },
  { value: 'recent', label: '최신 등록순' },
  { value: 'rating', label: '평점 높은순' },
  { value: 'author', label: '작성자순' },
];

const ConstructionReviewManagement: React.FC = () => {
  const navigate = useNavigate();
  const { can } = useAdminPermissions();
  const PK = 'construction/reviews';
  const [items, setItems] = useState<ConstructionReview[]>([]);
  const [cats, setCats] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('order');
  const [active, setActive] = useState('all');
  const [catFilter, setCatFilter] = useState<number | 'all'>('all');
  const { element: modal, alert, confirm } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await reviewApi.list();
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
      if (search.trim() && !`${it.author_name} ${it.title || ''} ${it.content}`.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
    if (sort === 'recent') v = [...v].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    else if (sort === 'rating') v = [...v].sort((a, b) => Number(b.rating) - Number(a.rating));
    else if (sort === 'author') v = [...v].sort((a, b) => a.author_name.localeCompare(b.author_name));
    else v = [...v].sort((a, b) => a.display_order - b.display_order);
    return v;
  }, [items, search, sort, active, catFilter]);

  const persistOrder = async (reordered: ConstructionReview[]) => {
    const { error } = await reviewApi.reorder(reordered.map((it) => it.id));
    if (error) alert('순서 저장 오류', error);
    fetchItems();
  };

  const toggleActive = async (item: ConstructionReview) => {
    const { error } = await reviewApi.setActive(item.id, !item.is_active);
    if (error) alert('상태 변경 오류', error);
    else fetchItems();
  };

  const removeItem = (item: ConstructionReview) => {
    confirm('삭제 확인', `'${item.author_name}'님의 후기를 삭제하시겠습니까?`, async () => {
      const { error } = await reviewApi.remove(item.id);
      if (error) alert('삭제 오류', error);
      else fetchItems();
    });
  };

  const columns: Column<ConstructionReview>[] = [
    {
      key: 'thumb', label: '사진', width: '60px', render: (it) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {it.images && it.images.length > 0
            ? <div style={{ position: 'relative' }}>
                <img src={it.images[0]} alt="" style={{ width: '44px', height: '34px', objectFit: 'cover', borderRadius: '6px', background: '#f1f5f9' }} />
                {it.images.length > 1 && <span style={{ position: 'absolute', right: '-4px', bottom: '-4px', background: '#008b8b', color: '#fff', fontSize: '0.6rem', fontWeight: 700, borderRadius: '999px', padding: '1px 5px' }}>{it.images.length}</span>}
              </div>
            : <span style={{ color: '#cbd5e1' }}>-</span>}
        </div>
      ),
    },
    { key: 'author', label: '작성자', width: '100px', render: (it) => <span style={{ fontWeight: 700, color: '#1e293b' }}>{it.author_name}</span> },
    { key: 'content', label: '내용', width: '1.6fr', align: 'left', render: (it) => <span style={{ color: '#475569', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title ? `[${it.title}] ` : ''}{it.content}</span> },
    { key: 'cat', label: '카테고리', width: '120px', render: (it) => it.construction_categories?.name || '미분류' },
    { key: 'rating', label: '평점', width: '80px', render: (it) => <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#f59e0b', fontWeight: 700 }}><Star size={14} fill="#f59e0b" color="#f59e0b" />{it.rating}</span> },
    { key: 'created_at', label: '등록일', width: '150px', render: (it) => fmtDate(it.created_at) },
    { key: 'updated_at', label: '수정일', width: '150px', render: (it) => fmtDate(it.updated_at) },
    { key: 'created_by', label: '등록자', width: '100px', render: (it) => it.created_by || '-' },
    { key: 'updated_by', label: '수정자', width: '100px', render: (it) => it.updated_by || '-' },
    { key: 'active', label: '활성화', width: '80px', render: (it) => <div style={{ display: 'flex', justifyContent: 'center' }}><ToggleButton isOn={it.is_active} onToggle={() => toggleActive(it)} /></div> },
    {
      key: 'manage', label: '관리', width: '90px', render: (it) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          {can(PK, 'u') && <button onClick={() => navigate(`/admin/dashboard/construction/reviews/detail/${it.id}`)} title="조회/수정" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} color="#475569" /></button>}
          {can(PK, 'd') && <button onClick={() => removeItem(it)} title="삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} color="#dc2626" /></button>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHead
        title="후기 관리"
        desc="사용자가 등록한 시공 후기를 조회·추가·삭제하고 순번/활성화를 관리합니다."
        right={can(PK, 'c') ? <button style={btnPrimary} onClick={() => navigate('/admin/dashboard/construction/reviews/detail/new')}><Plus size={18} /> 후기 추가</button> : undefined}
      />
      <BoardToolbar
        search={search} onSearch={setSearch} searchPlaceholder="작성자·제목·내용 검색"
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
        emptyMessage="등록된 후기가 없습니다."
      />
      {modal}
    </div>
  );
};

export default ConstructionReviewManagement;
