import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, ImageOff } from 'lucide-react';
import { mainVisualApi, SECTION_LABEL, type MainVisual, type MvSection } from '../../../api/mainVisualApi';
import ToggleButton from '../../../components/UI/ToggleButton';
import BoardTable, { type Column } from '../../../components/admin/BoardTable';
import BoardToolbar, { type SortOption } from '../../../components/admin/BoardToolbar';
import { PageHead, btnPrimary, fmtDate, useAdminModal } from '../../../components/admin/shared';
import { useAdminPermissions } from '../../../hooks/useAdminPermissions';

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
  const { can } = useAdminPermissions();
  const PK = 'main-visuals';
  const [items, setItems] = useState<MainVisual[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<MvSection>('construction');
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
      if (it.section !== tab) return false;
      if (active === 'active' && !it.is_active) return false;
      if (active === 'inactive' && it.is_active) return false;
      if (search.trim() && !`${it.title} ${it.subtitle || ''} ${it.badge || ''}`.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
    if (sort === 'recent') v = [...v].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    else if (sort === 'title') v = [...v].sort((a, b) => a.title.localeCompare(b.title));
    else v = [...v].sort((a, b) => a.display_order - b.display_order);
    return v;
  }, [items, tab, search, sort, active]);

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
      key: 'type', label: '타입', width: '90px', render: (it) => (
        <span style={{ background: it.type === 'type_b' ? '#fef2f2' : '#f1f5f9', color: it.type === 'type_b' ? '#dc2626' : '#475569', fontSize: '0.72rem', fontWeight: 700, padding: '4px 8px', borderRadius: '6px' }}>
          {it.type === 'type_b' ? 'B·쿠폰' : 'A·기본'}
        </span>
      ),
    },
    { key: 'title', label: '제목', width: '1.6fr', align: 'left', render: (it) => (it.title && it.title.trim())
      ? <span style={{ fontWeight: 700, color: '#1e293b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</span>
      : <span style={{ color: '#cbd5e1', fontWeight: 600 }}>-</span> },
    { key: 'created_at', label: '등록일', width: '140px', render: (it) => fmtDate(it.created_at) },
    { key: 'updated_at', label: '수정일', width: '140px', render: (it) => fmtDate(it.updated_at) },
    { key: 'created_by', label: '등록자', width: '90px', render: (it) => it.created_by || '-' },
    { key: 'updated_by', label: '수정자', width: '90px', render: (it) => it.updated_by || '-' },
    { key: 'active', label: '활성화', width: '80px', render: (it) => <div style={{ display: 'flex', justifyContent: 'center' }}><ToggleButton isOn={it.is_active} onToggle={() => toggleActive(it)} /></div> },
    {
      key: 'manage', label: '관리', width: '90px', render: (it) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          {can(PK, 'u') && <button onClick={() => navigate(`/admin/dashboard/main-visuals/detail/${it.id}`)} title="수정" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} color="#475569" /></button>}
          {can(PK, 'd') && <button onClick={() => removeItem(it)} title="삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} color="#dc2626" /></button>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHead
        title="메인 비주얼 관리"
        desc={`섹션 탭을 선택하면 해당 섹션의 메인 비주얼만 표기·등록됩니다. (현재: ${SECTION_LABEL[tab]})`}
        right={can(PK, 'c') ? <button style={btnPrimary} onClick={() => navigate(`/admin/dashboard/main-visuals/detail/new?section=${tab}`)}><Plus size={18} /> {SECTION_LABEL[tab]} 메인 비주얼 등록</button> : undefined}
      />

      {/* 섹션 탭 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {(['construction', 'rental', 'dj'] as MvSection[]).map((s) => {
          const on = tab === s; const c = SECTION_COLOR[s];
          const cnt = items.filter((it) => it.section === s).length;
          return (
            <button key={s} onClick={() => setTab(s)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 20px', border: `1px solid ${on ? c.color : '#e2e8f0'}`, background: on ? c.color : '#fff', color: on ? '#fff' : '#64748b', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all .15s' }}>
              {SECTION_LABEL[s]}
              <span style={{ fontSize: '0.74rem', fontWeight: 700, background: on ? 'rgba(255,255,255,0.25)' : '#f1f5f9', color: on ? '#fff' : '#94a3b8', padding: '1px 8px', borderRadius: '999px' }}>{cnt}</span>
            </button>
          );
        })}
      </div>

      <BoardToolbar
        search={search} onSearch={setSearch} searchPlaceholder="제목·문구 검색"
        sort={sort} onSort={setSort} sortOptions={SORTS}
        active={active} onActive={setActive} count={view.length}
      />
      <BoardTable
        items={view}
        getId={(it) => it.id}
        columns={columns}
        onReorder={persistOrder}
        loading={loading}
        emptyMessage={`${SECTION_LABEL[tab]} 섹션에 등록된 메인 비주얼이 없습니다.`}
      />
      {modal}
    </div>
  );
};

export default MainVisualManagement;
