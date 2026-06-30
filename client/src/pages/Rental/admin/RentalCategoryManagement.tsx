import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { rentalCategoryApi, brandApi, type RentalCategory } from '../../../api/rentalApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import ToggleButton from '../../../components/UI/ToggleButton';
import BoardTable, { type Column } from '../../Content/Construction/BoardTable';
import BoardToolbar, { type SortOption } from '../../Content/Construction/BoardToolbar';
import { PageHead, btnPrimary, fmtDate, useAdminModal } from '../../Content/Construction/shared';

const SORTS: SortOption[] = [
  { value: 'order', label: '순번순' },
  { value: 'recent', label: '최신 등록순' },
  { value: 'name', label: '이름순' },
];

const RentalCategoryManagement: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<RentalCategory[]>([]);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('order');
  const [active, setActive] = useState('all');
  const [brandFilter, setBrandFilter] = useState<number | 'all'>('all');
  const { element: modal, alert, confirm } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await rentalCategoryApi.list();
    if (error) alert('불러오기 오류', error);
    setItems(data || []);
  }, [alert]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: b } = await brandApi.listActive();
      setBrands((b || []) as { id: number; name: string }[]);
      await fetchItems();
      setLoading(false);
    })();
  }, [fetchItems]);

  const view = useMemo(() => {
    let v = items.filter((it) => {
      if (active === 'active' && !it.is_active) return false;
      if (active === 'inactive' && it.is_active) return false;
      if (brandFilter !== 'all' && it.brand_id !== brandFilter) return false;
      if (search.trim() && !`${it.name} ${it.description || ''}`.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
    if (sort === 'recent') v = [...v].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    else if (sort === 'name') v = [...v].sort((a, b) => a.name.localeCompare(b.name));
    else v = [...v].sort((a, b) => a.display_order - b.display_order);
    return v;
  }, [items, search, sort, active, brandFilter]);

  const persistOrder = async (reordered: RentalCategory[]) => {
    const { error } = await rentalCategoryApi.reorder(reordered.map((it) => it.id));
    if (error) alert('순서 저장 오류', error);
    fetchItems();
  };
  const toggleActive = async (item: RentalCategory) => {
    const { error } = await rentalCategoryApi.setActive(item.id, !item.is_active);
    if (error) alert('상태 변경 오류', error); else fetchItems();
  };
  const removeItem = (item: RentalCategory) => confirm('삭제 확인', `'${item.name}' 카테고리를 삭제하시겠습니까?`, async () => {
    const { error } = await rentalCategoryApi.remove(item.id);
    if (error) alert('삭제 오류', error); else fetchItems();
  });

  const columns: Column<RentalCategory>[] = [
    { key: 'brand', label: '브랜드', width: '140px', render: (it) => <span style={{ color: '#008b8b', fontWeight: 700 }}>{it.rental_brands?.name || '-'}</span> },
    { key: 'name', label: '카테고리명', width: '1.2fr', align: 'left', render: (it) => <span style={{ fontWeight: 700, color: '#1e293b' }}>{it.name}</span> },
    { key: 'desc', label: '설명', width: '1.5fr', align: 'left', render: (it) => <span style={{ color: '#64748b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.description || '-'}</span> },
    { key: 'created_at', label: '등록일', width: '140px', render: (it) => fmtDate(it.created_at) },
    { key: 'updated_at', label: '수정일', width: '140px', render: (it) => fmtDate(it.updated_at) },
    { key: 'created_by', label: '등록자', width: '90px', render: (it) => it.created_by || '-' },
    { key: 'active', label: '활성화', width: '80px', render: (it) => <div style={{ display: 'flex', justifyContent: 'center' }}><ToggleButton isOn={it.is_active} onToggle={() => toggleActive(it)} /></div> },
    {
      key: 'manage', label: '관리', width: '90px', render: (it) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          <button onClick={() => navigate(`/admin/dashboard/rental/categories/detail/${it.id}`)} title="수정" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} color="#475569" /></button>
          <button onClick={() => removeItem(it)} title="삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} color="#dc2626" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHead
        title="카테고리 관리"
        desc="브랜드별 렌탈 카테고리를 등록·수정·삭제하고 순번/활성화를 관리합니다."
        right={<button style={btnPrimary} onClick={() => navigate('/admin/dashboard/rental/categories/detail/new')} disabled={brands.length === 0}><Plus size={18} /> 카테고리 등록</button>}
      />
      <BoardToolbar search={search} onSearch={setSearch} searchPlaceholder="카테고리명·설명 검색" sort={sort} onSort={setSort} sortOptions={SORTS} active={active} onActive={setActive} count={view.length}>
        <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={brandFilter} onChange={(e) => setBrandFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
          <option value="all">전체 브랜드</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </BoardToolbar>
      {brands.length === 0 && <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '12px' }}>먼저 브랜드를 등록해주세요.</div>}
      <BoardTable items={view} getId={(it) => it.id} columns={columns} onReorder={persistOrder} loading={loading} emptyMessage="등록된 카테고리가 없습니다." />
      {modal}
    </div>
  );
};

export default RentalCategoryManagement;
