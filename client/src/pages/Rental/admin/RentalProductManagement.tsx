import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, ImageOff } from 'lucide-react';
import { productApi, brandApi, rentalCategoryApi, type RentalProduct } from '../../../api/rentalApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import ToggleButton from '../../../components/UI/ToggleButton';
import BoardTable, { type Column } from '../../../components/admin/BoardTable';
import BoardToolbar, { type SortOption } from '../../../components/admin/BoardToolbar';
import { PageHead, btnPrimary, fmtDate, useAdminModal } from '../../../components/admin/shared';

const SORTS: SortOption[] = [
  { value: 'order', label: '순번순' },
  { value: 'recent', label: '최신 등록순' },
  { value: 'name', label: '상품명순' },
  { value: 'price', label: '가격 높은순' },
];

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;

const RentalProductManagement: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<RentalProduct[]>([]);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [cats, setCats] = useState<{ id: number; name: string; brand_id: number | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('order');
  const [active, setActive] = useState('all');
  const [brandFilter, setBrandFilter] = useState<number | 'all'>('all');
  const [catFilter, setCatFilter] = useState<number | 'all'>('all');
  const { element: modal, alert, confirm } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await productApi.list();
    if (error) alert('불러오기 오류', error);
    setItems(data || []);
  }, [alert]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: b }, { data: c }] = [await brandApi.listActive(), await rentalCategoryApi.list()];
      setBrands((b || []) as any);
      setCats(((c || []) as any[]).map((x) => ({ id: x.id, name: x.name, brand_id: x.brand_id })));
      await fetchItems();
      setLoading(false);
    })();
  }, [fetchItems]);

  const catsForFilter = useMemo(() => brandFilter === 'all' ? cats : cats.filter((c) => c.brand_id === brandFilter), [cats, brandFilter]);

  const view = useMemo(() => {
    let v = items.filter((it) => {
      if (active === 'active' && !it.is_active) return false;
      if (active === 'inactive' && it.is_active) return false;
      if (brandFilter !== 'all' && it.brand_id !== brandFilter) return false;
      if (catFilter !== 'all' && it.category_id !== catFilter) return false;
      if (search.trim() && !`${it.name} ${it.description || ''}`.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
    if (sort === 'recent') v = [...v].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    else if (sort === 'name') v = [...v].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'price') v = [...v].sort((a, b) => Number(b.daily_price) - Number(a.daily_price));
    else v = [...v].sort((a, b) => a.display_order - b.display_order);
    return v;
  }, [items, search, sort, active, brandFilter, catFilter]);

  const persistOrder = async (reordered: RentalProduct[]) => {
    const { error } = await productApi.reorder(reordered.map((it) => it.id));
    if (error) alert('순서 저장 오류', error);
    fetchItems();
  };
  const toggleActive = async (item: RentalProduct) => {
    const { error } = await productApi.setActive(item.id, !item.is_active);
    if (error) alert('상태 변경 오류', error); else fetchItems();
  };
  const removeItem = (item: RentalProduct) => confirm('삭제 확인', `'${item.name}' 상품을 삭제하시겠습니까?`, async () => {
    const { error } = await productApi.remove(item.id);
    if (error) alert('삭제 오류', error); else fetchItems();
  });

  const columns: Column<RentalProduct>[] = [
    {
      key: 'thumb', label: '이미지', width: '72px', render: (it) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {it.thumbnail_url
            ? <img src={it.thumbnail_url} alt={it.name} style={{ width: '52px', height: '40px', objectFit: 'cover', borderRadius: '6px', background: '#f1f5f9' }} />
            : <div style={{ width: '52px', height: '40px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageOff size={16} color="#cbd5e1" /></div>}
        </div>
      ),
    },
    { key: 'brand', label: '브랜드', width: '110px', render: (it) => it.rental_brands?.name || '-' },
    { key: 'cat', label: '카테고리', width: '110px', render: (it) => it.rental_categories?.name || '-' },
    { key: 'name', label: '상품명', width: '1.6fr', align: 'left', render: (it) => <span style={{ fontWeight: 700, color: '#1e293b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.name}</span> },
    { key: 'price', label: '일일 단가', width: '110px', render: (it) => <span style={{ fontWeight: 700, color: '#008b8b' }}>{won(it.daily_price)}</span> },
    { key: 'stock', label: '재고', width: '70px', render: (it) => <span style={{ color: it.stock > 0 ? '#1e293b' : '#dc2626', fontWeight: 700 }}>{it.stock}</span> },
    { key: 'created_at', label: '등록일', width: '130px', render: (it) => fmtDate(it.created_at) },
    { key: 'active', label: '활성화', width: '80px', render: (it) => <div style={{ display: 'flex', justifyContent: 'center' }}><ToggleButton isOn={it.is_active} onToggle={() => toggleActive(it)} /></div> },
    {
      key: 'manage', label: '관리', width: '90px', render: (it) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          <button onClick={() => navigate(`/admin/dashboard/rental/products/detail/${it.id}`)} title="수정/현황" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} color="#475569" /></button>
          <button onClick={() => removeItem(it)} title="삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} color="#dc2626" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHead
        title="상품 관리"
        desc="브랜드 → 카테고리 → 상품을 등록하고 일일 단가·재고·옵션·렌탈 현황을 관리합니다."
        right={<button style={btnPrimary} onClick={() => navigate('/admin/dashboard/rental/products/detail/new')} disabled={brands.length === 0}><Plus size={18} /> 상품 등록</button>}
      />
      <BoardToolbar search={search} onSearch={setSearch} searchPlaceholder="상품명·설명 검색" sort={sort} onSort={setSort} sortOptions={SORTS} active={active} onActive={setActive} count={view.length}>
        <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={brandFilter} onChange={(e) => { setBrandFilter(e.target.value === 'all' ? 'all' : Number(e.target.value)); setCatFilter('all'); }}>
          <option value="all">전체 브랜드</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={catFilter} onChange={(e) => setCatFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
          <option value="all">전체 카테고리</option>
          {catsForFilter.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </BoardToolbar>
      {brands.length === 0 && <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '12px' }}>먼저 브랜드와 카테고리를 등록해주세요.</div>}
      <BoardTable items={view} getId={(it) => it.id} columns={columns} onReorder={persistOrder} loading={loading} emptyMessage="등록된 상품이 없습니다." />
      {modal}
    </div>
  );
};

export default RentalProductManagement;
