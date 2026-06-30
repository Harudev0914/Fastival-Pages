import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, ImageOff } from 'lucide-react';
import { mainVisualApi, SECTION_LABEL, type MainVisual, type MvSection } from '../../api/mainVisualApi';
import { SELECT_STYLE } from '../../components/UI/StyledSelect';
import ToggleButton from '../../components/UI/ToggleButton';
import BoardTable, { type Column } from '../../components/admin/BoardTable';
import BoardToolbar, { type SortOption } from '../../components/admin/BoardToolbar';
import { PageHead, btnPrimary, fmtDate, useAdminModal } from '../../components/admin/shared';

const SORTS: SortOption[] = [
  { value: 'order', label: '순번순' },
  { value: 'recent', label: '최신 등록순' },
  { value: 'title', label: '제목순' },
];

const SECTION_COLOR: Record<string, { bg: string; color: string }> = {
  construction: { bg: '#eff6ff', color: '#2563eb' },
  rental: { bg: '#e0f2f1', color: '#008b8b' },
  dj: { bg: '#f5f3ff', color: '#7c3aed' },
};

const MainVisualManagement: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<MainVisual[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionFilter, setSectionFilter] = useState<MvSection | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('order');
  const [active, setActive] = useState('all');
  const { element: modal, alert, confirm } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await mainVisualApi.list();
    if (error) alert('불러오기 오류', error);
    setItems(data || []);
  }, [alert]);

  useEffect(() => {
    (async () => { setLoading(true); await fetchItems(); setLoading(false); })();
  }, [fetchItems]);

  const view = useMemo(() => {
    let v = items.filter((it) => {
      if (sectionFilter !== 'all' && it.section !== sectionFilter) return false;
      if (active === 'active' && !it.is_active) return false;
      if (active === 'inactive' && it.is_active) return false;
      if (search.trim() && !`${it.title} ${it.subtitle || ''} ${it.badge || ''}`.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
    if (sort === 'recent') v = [...v].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    else if (sort === 'title') v = [...v].sort((a, b) => a.title.localeCompare(b.title));
    else v = [...v].sort((a, b) => a.display_order - b.display_order);
    return v;
  }, [items, sectionFilter, search, sort, active]);

  const persistOrder = async (reordered: MainVisual[]) => {
    const { error } = await mainVisualApi.reorder(reordered.map((r) => r.id));
    if (error) alert('순서 저장 오류', error);
    fetchItems();
  };

  const toggleActive = async (item: MainVisual) => {
    const { error } = await mainVisualApi.setActive(item.id, !item.is_active);
    if (error) alert('상태 변경 오류', error);
    else fetchItems();
  };

  const removeItem = (item: MainVisual) => {
    confirm('삭제 확인', `'${item.title}' 메인 비주얼을 삭제하시겠습니까?`, async () => {
      const { error } = await mainVisualApi.remove(item.id);
      if (error) alert('삭제 오류', error);
      else fetchItems();
    });
  };

  const columns: Column<MainVisual>[] = [
    {
      key: 'thumb', label: '이미지', width: '72px', render: (it) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {it.image_url
            ? <img src={it.image_url} alt={it.title} style={{ width: '56px', height: '38px', objectFit: 'cover', borderRadius: '6px', background: '#f1f5f9' }} />
            : <div style={{ width: '56px', height: '38px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageOff size={16} color="#cbd5e1" /></div>}
        </div>
      ),
    },
    {
      key: 'section', label: '섹션', width: '80px', render: (it) => {
        const c = SECTION_COLOR[it.section];
        return <span style={{ background: c.bg, color: c.color, fontSize: '0.74rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>{SECTION_LABEL[it.section]}</span>;
      },
    },
    {
      key: 'type', label: '타입', width: '90px', render: (it) => (
        <span style={{ background: it.type === 'type_b' ? '#fef2f2' : '#f1f5f9', color: it.type === 'type_b' ? '#dc2626' : '#475569', fontSize: '0.72rem', fontWeight: 700, padding: '4px 8px', borderRadius: '6px' }}>
          {it.type === 'type_b' ? 'B·쿠폰' : 'A·기본'}
        </span>
      ),
    },
    { key: 'title', label: '제목', width: '1.6fr', align: 'left', render: (it) => <span style={{ fontWeight: 700, color: '#1e293b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</span> },
    { key: 'created_at', label: '등록일', width: '140px', render: (it) => fmtDate(it.created_at) },
    { key: 'updated_at', label: '수정일', width: '140px', render: (it) => fmtDate(it.updated_at) },
    { key: 'created_by', label: '등록자', width: '90px', render: (it) => it.created_by || '-' },
    { key: 'updated_by', label: '수정자', width: '90px', render: (it) => it.updated_by || '-' },
    { key: 'active', label: '활성화', width: '80px', render: (it) => <div style={{ display: 'flex', justifyContent: 'center' }}><ToggleButton isOn={it.is_active} onToggle={() => toggleActive(it)} /></div> },
    {
      key: 'manage', label: '관리', width: '90px', render: (it) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          <button onClick={() => navigate(`/admin/dashboard/main-visuals/detail/${it.id}`)} title="수정" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} color="#475569" /></button>
          <button onClick={() => removeItem(it)} title="삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} color="#dc2626" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHead
        title="메인 비주얼 관리"
        desc="시공·렌탈·DJ 메인 비주얼 배너를 통합 관리합니다. (타입/순번/활성화/검색)"
        right={<button style={btnPrimary} onClick={() => navigate('/admin/dashboard/main-visuals/detail/new')}><Plus size={18} /> 메인 비주얼 등록</button>}
      />
      <BoardToolbar
        search={search} onSearch={setSearch} searchPlaceholder="제목·문구 검색"
        sort={sort} onSort={setSort} sortOptions={SORTS}
        active={active} onActive={setActive} count={view.length}
      >
        <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value as MvSection | 'all')}>
          <option value="all">전체 섹션</option>
          <option value="construction">시공</option>
          <option value="rental">렌탈</option>
          <option value="dj">DJ</option>
        </select>
      </BoardToolbar>
      <BoardTable
        items={view}
        getId={(it) => it.id}
        columns={columns}
        onReorder={persistOrder}
        loading={loading}
        emptyMessage="등록된 메인 비주얼이 없습니다."
      />
      {modal}
    </div>
  );
};

export default MainVisualManagement;
