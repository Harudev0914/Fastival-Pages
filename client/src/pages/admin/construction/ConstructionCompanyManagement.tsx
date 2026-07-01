import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { constructionCompanyApi, type ConstructionCompany } from '../../../api/opsApi';
import ToggleButton from '../../../components/UI/ToggleButton';
import BoardTable, { type Column } from '../../../components/admin/BoardTable';
import BoardToolbar, { type SortOption } from '../../../components/admin/BoardToolbar';
import { PageHead, btnPrimary, fmtDate, useAdminModal } from '../../../components/admin/shared';
import { useAdminPermissions } from '../../../hooks/useAdminPermissions';

const SORTS: SortOption[] = [
  { value: 'order', label: '순번순' },
  { value: 'recent', label: '최신 등록순' },
  { value: 'name', label: '업체명순' },
];
const PK = 'construction/companies';

const ConstructionCompanyManagement: React.FC = () => {
  const navigate = useNavigate();
  const { can } = useAdminPermissions();
  const [items, setItems] = useState<ConstructionCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('order');
  const [active, setActive] = useState('all');
  const { element: modal, alert, confirm } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await constructionCompanyApi.list();
    if (error) alert('불러오기 오류', error);
    setItems(data || []);
  }, [alert]);
  useEffect(() => { (async () => { setLoading(true); await fetchItems(); setLoading(false); })(); }, [fetchItems]);

  const view = useMemo(() => {
    let v = items.filter((it) => {
      if (active === 'active' && !it.is_active) return false;
      if (active === 'inactive' && it.is_active) return false;
      if (search.trim() && !`${it.name} ${it.manager || ''} ${it.region || ''}`.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
    if (sort === 'recent') v = [...v].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    else if (sort === 'name') v = [...v].sort((a, b) => a.name.localeCompare(b.name));
    else v = [...v].sort((a, b) => a.display_order - b.display_order);
    return v;
  }, [items, search, sort, active]);

  const persistOrder = async (reordered: ConstructionCompany[]) => {
    const { error } = await constructionCompanyApi.reorder(reordered.map((it) => it.id));
    if (error) alert('순서 저장 오류', error); else fetchItems();
  };
  const toggleActive = async (item: ConstructionCompany) => {
    const { error } = await constructionCompanyApi.setActive(item.id, !item.is_active);
    if (error) alert('상태 변경 오류', error); else fetchItems();
  };
  const removeItem = (item: ConstructionCompany) => confirm('삭제 확인', `'${item.name}' 업체를 삭제하시겠습니까?`, async () => {
    const { error } = await constructionCompanyApi.remove(item.id);
    if (error) alert('삭제 오류', error); else fetchItems();
  });

  const columns: Column<ConstructionCompany>[] = [
    { key: 'name', label: '업체명', width: '1.2fr', align: 'left', render: (it) => <span style={{ fontWeight: 700, color: '#1e293b' }}>{it.name}</span> },
    { key: 'manager', label: '담당자', width: '110px', render: (it) => it.manager || '-' },
    { key: 'phone', label: '연락처', width: '130px', render: (it) => it.phone || '-' },
    { key: 'region', label: '지역', width: '110px', render: (it) => it.region || '-' },
    { key: 'created_at', label: '등록일', width: '130px', render: (it) => fmtDate(it.created_at) },
    { key: 'active', label: '활성화', width: '80px', render: (it) => <div style={{ display: 'flex', justifyContent: 'center' }}><ToggleButton isOn={it.is_active} onToggle={() => toggleActive(it)} /></div> },
    {
      key: 'manage', label: '관리', width: '90px', render: (it) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          {can(PK, 'u') && <button onClick={() => navigate(`/admin/dashboard/construction/companies/detail/${it.id}`)} title="수정" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} color="#475569" /></button>}
          {can(PK, 'd') && <button onClick={() => removeItem(it)} title="삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} color="#dc2626" /></button>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHead
        title="시공 업체 관리"
        desc="문의하기 플로우 후 실제 담당자/협력 업체를 영업부서에서 등록·관리합니다. 시공 업무 배정 시 이 업체 목록에서 선택합니다."
        right={can(PK, 'c') ? <button style={btnPrimary} onClick={() => navigate('/admin/dashboard/construction/companies/detail/new')}><Plus size={18} /> 업체 등록</button> : undefined}
      />
      <BoardToolbar search={search} onSearch={setSearch} searchPlaceholder="업체명·담당자·지역 검색" sort={sort} onSort={setSort} sortOptions={SORTS} active={active} onActive={setActive} count={view.length} />
      <BoardTable items={view} getId={(it) => it.id} columns={columns} onReorder={persistOrder} loading={loading} emptyMessage="등록된 업체가 없습니다." />
      {modal}
    </div>
  );
};

export default ConstructionCompanyManagement;
