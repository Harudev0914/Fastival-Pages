import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { chatbotApi, type ChatbotQuestion } from '../../../api/constructionApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import ToggleButton from '../../../components/UI/ToggleButton';
import BoardTable, { type Column } from './BoardTable';
import BoardToolbar, { type SortOption } from './BoardToolbar';
import { PageHead, btnPrimary, fmtDate, useAdminModal } from './shared';

const TYPE_LABEL: Record<string, string> = {
  radio: '라디오', checkbox: '체크박스', select: '드롭다운', text: '텍스트', file: '파일업로드', application: '신청 폼',
};
const TYPE_COLOR: Record<string, { bg: string; color: string }> = {
  radio: { bg: '#eff6ff', color: '#2563eb' },
  checkbox: { bg: '#e0f2f1', color: '#008b8b' },
  select: { bg: '#f5f3ff', color: '#7c3aed' },
  text: { bg: '#f1f5f9', color: '#475569' },
  file: { bg: '#fffbeb', color: '#d97706' },
  application: { bg: '#ecfdf5', color: '#059669' },
};
const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const c = TYPE_COLOR[type] || TYPE_COLOR.text;
  return <span style={{ background: c.bg, color: c.color, fontSize: '0.74rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>{TYPE_LABEL[type] || type}</span>;
};

const SORTS: SortOption[] = [
  { value: 'order', label: '순번순' },
  { value: 'recent', label: '최신 등록순' },
  { value: 'title', label: '질문순' },
];

const ConstructionChatbotManagement: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ChatbotQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('order');
  const [active, setActive] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { element: modal, alert, confirm } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await chatbotApi.list();
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
      if (typeFilter !== 'all' && it.type !== typeFilter) return false;
      if (search.trim() && !it.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
    if (sort === 'recent') v = [...v].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    else if (sort === 'title') v = [...v].sort((a, b) => a.title.localeCompare(b.title));
    else v = [...v].sort((a, b) => a.display_order - b.display_order);
    return v;
  }, [items, search, sort, active, typeFilter]);

  const persistOrder = async (reordered: ChatbotQuestion[]) => {
    const { error } = await chatbotApi.reorder(reordered.map((it) => it.id));
    if (error) alert('순서 저장 오류', error);
    fetchItems();
  };

  const toggleActive = async (item: ChatbotQuestion) => {
    const { error } = await chatbotApi.setActive(item.id, !item.is_active);
    if (error) alert('상태 변경 오류', error);
    else fetchItems();
  };

  const removeItem = (item: ChatbotQuestion) => {
    confirm('삭제 확인', `'${item.title}' 질문을 삭제하시겠습니까?`, async () => {
      const { error } = await chatbotApi.remove(item.id);
      if (error) alert('삭제 오류', error);
      else fetchItems();
    });
  };

  const columns: Column<ChatbotQuestion>[] = [
    { key: 'title', label: '질문', width: '1.5fr', align: 'left', render: (it) => <span style={{ fontWeight: 700, color: '#1e293b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</span> },
    { key: 'type', label: '유형', width: '120px', render: (it) => <TypeBadge type={it.type} /> },
    {
      key: 'opts', label: '옵션', width: '150px', render: (it) =>
        it.use_categories
          ? <span style={{ color: '#008b8b', fontWeight: 700, fontSize: '0.78rem' }}>카테고리 연동</span>
          : (it.options?.length ? <span style={{ color: '#64748b', fontSize: '0.82rem' }}>{it.options.length}개 옵션</span> : <span style={{ color: '#cbd5e1' }}>-</span>),
    },
    { key: 'created_at', label: '등록일', width: '150px', render: (it) => fmtDate(it.created_at) },
    { key: 'updated_at', label: '수정일', width: '150px', render: (it) => fmtDate(it.updated_at) },
    { key: 'created_by', label: '등록자', width: '100px', render: (it) => it.created_by || '-' },
    { key: 'updated_by', label: '수정자', width: '100px', render: (it) => it.updated_by || '-' },
    { key: 'active', label: '활성화', width: '80px', render: (it) => <div style={{ display: 'flex', justifyContent: 'center' }}><ToggleButton isOn={it.is_active} onToggle={() => toggleActive(it)} /></div> },
    {
      key: 'manage', label: '관리', width: '90px', render: (it) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          <button onClick={() => navigate(`/admin/dashboard/construction/chatbot/detail/${it.id}`)} title="수정" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} color="#475569" /></button>
          <button onClick={() => removeItem(it)} title="삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} color="#dc2626" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHead
        title="시공 문의 챗봇 관리"
        desc="시공 문의 챗봇의 룰베이스(질문)를 등록·수정·삭제하고 순번/활성화를 관리합니다."
        right={<button style={btnPrimary} onClick={() => navigate('/admin/dashboard/construction/chatbot/detail/new')}><Plus size={18} /> 룰 등록</button>}
      />
      <BoardToolbar
        search={search} onSearch={setSearch} searchPlaceholder="질문 검색"
        sort={sort} onSort={setSort} sortOptions={SORTS}
        active={active} onActive={setActive} count={view.length}
      >
        <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">전체 유형</option>
          {Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </BoardToolbar>
      <BoardTable
        items={view}
        getId={(it) => it.id}
        columns={columns}
        onReorder={persistOrder}
        loading={loading}
        emptyMessage="등록된 룰베이스가 없습니다."
      />
      {modal}
    </div>
  );
};

export default ConstructionChatbotManagement;
