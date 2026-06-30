import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { categoryApi, type ConstructionCategory } from '../../../api/constructionApi';
import ToggleButton from '../../../components/UI/ToggleButton';
import BoardTable, { type Column } from '../../../components/admin/BoardTable';
import BoardToolbar, { type SortOption } from '../../../components/admin/BoardToolbar';
import { PageHead, btnPrimary, fmtDate, useAdminModal } from '../../../components/admin/shared';

const SORTS: SortOption[] = [
  { value: 'order', label: '순번순' },
  { value: 'recent', label: '최신 등록순' },
  { value: 'name', label: '이름순' },
];

const ConstructionCategoryManagement: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ConstructionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('order');
  const [active, setActive] = useState('all');
  const { element: modal, alert, confirm } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await categoryApi.list();
    if (error) alert('불러오기 오류', error);
    setItems(data || []);
  }, [alert]);

  useEffect(() => {
    (async () => { setLoading(true); await fetchItems(); setLoading(false); })();
  }, [fetchItems]);

  const view = useMemo(() => {
    let v = items.filter((it) => {
      if (active === 'active' && !it.is_active) return false;
      if (active === 'inactive' && it.is_active) return false;
      if (search.trim() && !`${it.name} ${it.description || ''}`.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
    if (sort === 'recent') v = [...v].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    else if (sort === 'name') v = [...v].sort((a, b) => a.name.localeCompare(b.name));
    else v = [...v].sort((a, b) => a.display_order - b.display_order);
    return v;
  }, [items, search, sort, active]);

  const persistOrder = async (reordered: ConstructionCategory[]) => {
    const { error } = await categoryApi.reorder(reordered.map((it) => it.id));
    if (error) alert('순서 저장 오류', error);
    fetchItems();
  };

  const toggleActive = async (item: ConstructionCategory) => {
    const { error } = await categoryApi.setActive(item.id, !item.is_active);
    if (error) alert('상태 변경 오류', error);
    else fetchItems();
  };

  const removeItem = (item: ConstructionCategory) => {
    confirm('삭제 확인', `'${item.name}' 카테고리를 삭제하시겠습니까?`, async () => {
      const { error } = await categoryApi.remove(item.id);
      if (error) alert('삭제 오류', error);
      else fetchItems();
    });
  };

  const columns: Column<ConstructionCategory>[] = [
    { key: 'name', label: '카테고리명', width: '1.2fr', align: 'left', render: (it) => <span style={{ fontWeight: 700, color: '#1e293b' }}>{it.name}</span> },
    { key: 'desc', label: '설명', width: '1.6fr', align: 'left', render: (it) => <span style={{ color: '#64748b' }}>{it.description || '-'}</span> },
    { key: 'created_at', label: '등록일', width: '150px', render: (it) => fmtDate(it.created_at) },
    { key: 'updated_at', label: '수정일', width: '150px', render: (it) => fmtDate(it.updated_at) },
    { key: 'created_by', label: '등록자', width: '100px', render: (it) => it.created_by || '-' },
    { key: 'updated_by', label: '수정자', width: '100px', render: (it) => it.updated_by || '-' },
    { key: 'active', label: '활성화', width: '80px', render: (it) => <div style={{ display: 'flex', justifyContent: 'center' }}><ToggleButton isOn={it.is_active} onToggle={() => toggleActive(it)} /></div> },
    {
      key: 'manage', label: '관리', width: '90px', render: (it) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          <button onClick={() => navigate(`/admin/dashboard/construction/categories/detail/${it.id}`)} title="수정" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} color="#475569" /></button>
          <button onClick={() => removeItem(it)} title="삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} color="#dc2626" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHead
        title="카테고리 관리"
        desc="시공 분야 카테고리를 등록·수정·삭제하고 순번/활성화를 관리합니다."
        right={<button style={btnPrimary} onClick={() => navigate('/admin/dashboard/construction/categories/detail/new')}><Plus size={18} /> 카테고리 등록</button>}
      />
      <BoardToolbar
        search={search} onSearch={setSearch} searchPlaceholder="카테고리명·설명 검색"
        sort={sort} onSort={setSort} sortOptions={SORTS}
        active={active} onActive={setActive} count={view.length}
      />
      <BoardTable
        items={view}
        getId={(it) => it.id}
        columns={columns}
        onReorder={persistOrder}
        loading={loading}
        emptyMessage="등록된 카테고리가 없습니다."
      />
      {modal}
    </div>
  );
};

export default ConstructionCategoryManagement;
