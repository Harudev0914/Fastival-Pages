import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { termsApi, TERMS_TYPE_LABEL, type Terms, type TermsType } from '../../../api/termsApi';
import ToggleButton from '../../../components/UI/ToggleButton';
import BoardTable, { type Column } from '../../../components/admin/BoardTable';
import BoardToolbar, { type SortOption } from '../../../components/admin/BoardToolbar';
import { PageHead, btnPrimary, fmtDate, useAdminModal } from '../../../components/admin/shared';
import { useAdminPermissions } from '../../../hooks/useAdminPermissions';

const SORTS: SortOption[] = [
  { value: 'order', label: '순번순' },
  { value: 'recent', label: '최신 등록순' },
  { value: 'effective', label: '시행일순' },
];

const TermsManagement: React.FC<{ type: TermsType }> = ({ type }) => {
  const navigate = useNavigate();
  const { can } = useAdminPermissions();
  const PK = `terms/${type}`;
  const base = `/admin/dashboard/terms/${type}`;
  const label = TERMS_TYPE_LABEL[type];

  const [items, setItems] = useState<Terms[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('order');
  const [active, setActive] = useState('all');
  const { element: modal, alert, confirm } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await termsApi.list(type);
    if (error) alert('불러오기 오류', error);
    setItems(data || []);
  }, [alert, type]);

  useEffect(() => { (async () => { setLoading(true); await fetchItems(); setLoading(false); })(); }, [fetchItems]);

  const view = useMemo(() => {
    let v = items.filter((it) => {
      if (active === 'active' && !it.is_active) return false;
      if (active === 'inactive' && it.is_active) return false;
      if (search.trim() && !`${it.title} ${it.version || ''}`.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
    if (sort === 'recent') v = [...v].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    else if (sort === 'effective') v = [...v].sort((a, b) => (b.effective_date || '').localeCompare(a.effective_date || ''));
    else v = [...v].sort((a, b) => a.display_order - b.display_order);
    return v;
  }, [items, search, sort, active]);

  const persistOrder = async (reordered: Terms[]) => {
    const { error } = await termsApi.reorder(reordered.map((it) => it.id));
    if (error) alert('순서 저장 오류', error);
    fetchItems();
  };
  const toggleActive = async (item: Terms) => {
    const { error } = await termsApi.setActive(item.id, !item.is_active);
    if (error) alert('상태 변경 오류', error); else fetchItems();
  };
  const removeItem = (item: Terms) => confirm('삭제 확인', `'${item.title}' 약관을 삭제하시겠습니까?`, async () => {
    const { error } = await termsApi.remove(item.id);
    if (error) alert('삭제 오류', error); else fetchItems();
  });

  const columns: Column<Terms>[] = [
    { key: 'title', label: '제목', width: '1.6fr', align: 'left', render: (it) => <span style={{ fontWeight: 700, color: '#1e293b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</span> },
    { key: 'version', label: '버전', width: '110px', render: (it) => it.version || '-' },
    { key: 'effective_date', label: '시행일', width: '120px', render: (it) => it.effective_date || '-' },
    { key: 'created_at', label: '등록일', width: '130px', render: (it) => fmtDate(it.created_at) },
    { key: 'updated_at', label: '수정일', width: '130px', render: (it) => fmtDate(it.updated_at) },
    { key: 'active', label: '활성화', width: '80px', render: (it) => <div style={{ display: 'flex', justifyContent: 'center' }}><ToggleButton isOn={it.is_active} onToggle={() => toggleActive(it)} /></div> },
    {
      key: 'manage', label: '관리', width: '90px', render: (it) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          {can(PK, 'u') && <button onClick={() => navigate(`${base}/detail/${it.id}`)} title="수정" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} color="#475569" /></button>}
          {can(PK, 'd') && <button onClick={() => removeItem(it)} title="삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} color="#dc2626" /></button>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHead
        title={label}
        desc={`${label}을(를) 등록·수정·삭제하고 버전/시행일/활성화를 관리합니다. 활성화된 최신 시행일 약관이 사용자 페이지에 노출됩니다.`}
        right={can(PK, 'c') ? <button style={btnPrimary} onClick={() => navigate(`${base}/detail/new`)}><Plus size={18} /> {label} 등록</button> : undefined}
      />
      <BoardToolbar search={search} onSearch={setSearch} searchPlaceholder="제목·버전 검색" sort={sort} onSort={setSort} sortOptions={SORTS} active={active} onActive={setActive} count={view.length} />
      <BoardTable items={view} getId={(it) => it.id} columns={columns} onReorder={persistOrder} loading={loading} emptyMessage={`등록된 ${label}이(가) 없습니다.`} />
      {modal}
    </div>
  );
};

export default TermsManagement;
