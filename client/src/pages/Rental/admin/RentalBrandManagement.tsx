import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, ImageOff } from 'lucide-react';
import { brandApi, type RentalBrand } from '../../../api/rentalApi';
import ToggleButton from '../../../components/UI/ToggleButton';
import BoardTable, { type Column } from '../../Content/Construction/BoardTable';
import BoardToolbar, { type SortOption } from '../../Content/Construction/BoardToolbar';
import { PageHead, btnPrimary, fmtDate, useAdminModal } from '../../Content/Construction/shared';

const SORTS: SortOption[] = [
  { value: 'order', label: '순번순' },
  { value: 'recent', label: '최신 등록순' },
  { value: 'name', label: '이름순' },
];

const RentalBrandManagement: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<RentalBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('order');
  const [active, setActive] = useState('all');
  const { element: modal, alert, confirm } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await brandApi.list();
    if (error) alert('불러오기 오류', error);
    setItems(data || []);
  }, [alert]);

  useEffect(() => { (async () => { setLoading(true); await fetchItems(); setLoading(false); })(); }, [fetchItems]);

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

  const persistOrder = async (reordered: RentalBrand[]) => {
    const { error } = await brandApi.reorder(reordered.map((it) => it.id));
    if (error) alert('순서 저장 오류', error);
    fetchItems();
  };
  const toggleActive = async (item: RentalBrand) => {
    const { error } = await brandApi.setActive(item.id, !item.is_active);
    if (error) alert('상태 변경 오류', error); else fetchItems();
  };
  const removeItem = (item: RentalBrand) => confirm('삭제 확인', `'${item.name}' 브랜드를 삭제하시겠습니까?\n(소속 카테고리·상품도 함께 삭제됩니다)`, async () => {
    const { error } = await brandApi.remove(item.id);
    if (error) alert('삭제 오류', error); else fetchItems();
  });

  const columns: Column<RentalBrand>[] = [
    {
      key: 'logo', label: '로고', width: '72px', render: (it) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {it.logo_url
            ? <img src={it.logo_url} alt={it.name} style={{ width: '48px', height: '36px', objectFit: 'contain', borderRadius: '6px', background: '#f8fafc' }} />
            : <div style={{ width: '48px', height: '36px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageOff size={16} color="#cbd5e1" /></div>}
        </div>
      ),
    },
    { key: 'name', label: '브랜드명', width: '1.2fr', align: 'left', render: (it) => <span style={{ fontWeight: 700, color: '#1e293b' }}>{it.name}</span> },
    { key: 'desc', label: '설명', width: '1.6fr', align: 'left', render: (it) => <span style={{ color: '#64748b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.description || '-'}</span> },
    { key: 'created_at', label: '등록일', width: '140px', render: (it) => fmtDate(it.created_at) },
    { key: 'updated_at', label: '수정일', width: '140px', render: (it) => fmtDate(it.updated_at) },
    { key: 'created_by', label: '등록자', width: '90px', render: (it) => it.created_by || '-' },
    { key: 'active', label: '활성화', width: '80px', render: (it) => <div style={{ display: 'flex', justifyContent: 'center' }}><ToggleButton isOn={it.is_active} onToggle={() => toggleActive(it)} /></div> },
    {
      key: 'manage', label: '관리', width: '90px', render: (it) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          <button onClick={() => navigate(`/admin/dashboard/rental/brands/detail/${it.id}`)} title="수정" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} color="#475569" /></button>
          <button onClick={() => removeItem(it)} title="삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} color="#dc2626" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHead
        title="브랜드 관리"
        desc="렌탈 브랜드를 등록·수정·삭제하고 순번/활성화를 관리합니다."
        right={<button style={btnPrimary} onClick={() => navigate('/admin/dashboard/rental/brands/detail/new')}><Plus size={18} /> 브랜드 등록</button>}
      />
      <BoardToolbar search={search} onSearch={setSearch} searchPlaceholder="브랜드명·설명 검색" sort={sort} onSort={setSort} sortOptions={SORTS} active={active} onActive={setActive} count={view.length} />
      <BoardTable items={view} getId={(it) => it.id} columns={columns} onReorder={persistOrder} loading={loading} emptyMessage="등록된 브랜드가 없습니다." />
      {modal}
    </div>
  );
};

export default RentalBrandManagement;
