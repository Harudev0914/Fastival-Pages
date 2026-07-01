import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { djEventApi, DJ_EVENT_STATUS_LABEL, DJ_EVENT_STATUS_COLOR, type DjEventInquiry, type DjEventStatus } from '../../../api/djApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import BoardTable, { type Column } from '../../../components/admin/BoardTable';
import { PageHead, btnPrimary, inputStyle, card, fmtDate, useAdminModal } from '../../../components/admin/shared';
import { useAdminPermissions } from '../../../hooks/useAdminPermissions';

const PK = 'dj/event-inquiries';
const won = (n: number | null) => (n == null ? '-' : `₩${Number(n).toLocaleString()}`);
const badge = (s: DjEventStatus) => <span style={{ background: `${DJ_EVENT_STATUS_COLOR[s]}1a`, color: DJ_EVENT_STATUS_COLOR[s], fontSize: '0.74rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>{DJ_EVENT_STATUS_LABEL[s]}</span>;

const DjEventInquiryManagement: React.FC = () => {
  const navigate = useNavigate();
  const { can } = useAdminPermissions();
  const [items, setItems] = useState<DjEventInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | DjEventStatus>('all');
  const { element: modal, alert, confirm } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await djEventApi.list();
    if (error) alert('불러오기 오류', error);
    setItems(data || []);
  }, [alert]);
  useEffect(() => { (async () => { setLoading(true); await fetchItems(); setLoading(false); })(); }, [fetchItems]);

  const view = useMemo(() => items.filter((it) => {
    if (status !== 'all' && it.status !== status) return false;
    if (search.trim() && !`${it.title} ${it.customer_name || ''} ${it.artist_name || ''} ${it.region || ''}`.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  }), [items, search, status]);

  const removeItem = (item: DjEventInquiry) => confirm('삭제 확인', `'${item.title}' 문의를 삭제하시겠습니까?`, async () => {
    const { error } = await djEventApi.remove(item.id);
    if (error) alert('삭제 오류', error); else fetchItems();
  });

  const columns: Column<DjEventInquiry>[] = [
    { key: 'title', label: '행사명', width: '1.4fr', align: 'left', render: (it) => <span style={{ fontWeight: 700, color: '#1e293b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</span> },
    { key: 'customer', label: '고객', width: '100px', render: (it) => it.customer_name || '-' },
    { key: 'date', label: '행사일', width: '120px', render: (it) => it.event_date || '-' },
    { key: 'region', label: '지역', width: '90px', render: (it) => it.region || '-' },
    { key: 'artist', label: '배정 DJ', width: '110px', render: (it) => it.artist_name || '-' },
    { key: 'budget', label: '예산', width: '110px', render: (it) => won(it.budget) },
    { key: 'created', label: '접수일', width: '120px', render: (it) => fmtDate(it.created_at) },
    { key: 'status', label: '상태', width: '90px', render: (it) => <div style={{ display: 'flex', justifyContent: 'center' }}>{badge(it.status)}</div> },
    {
      key: 'manage', label: '관리', width: '90px', render: (it) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          {can(PK, 'u') && <button onClick={() => navigate(`/admin/dashboard/dj/event-inquiries/detail/${it.id}`)} title="수정" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} color="#475569" /></button>}
          {can(PK, 'd') && <button onClick={() => removeItem(it)} title="삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} color="#dc2626" /></button>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHead
        title="DJ 행사 문의 관리"
        desc="DJ 섭외/행사 대행 문의를 접수·상담·확정 처리합니다. 행사일이 있는 확정 건은 DJ 행사 캘린더에 표기됩니다."
        right={can(PK, 'c') ? <button style={btnPrimary} onClick={() => navigate('/admin/dashboard/dj/event-inquiries/detail/new')}><Plus size={18} /> 문의 등록</button> : undefined}
      />
      <div style={{ ...card, marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={status} onChange={(e) => setStatus(e.target.value as any)}>
          <option value="all">전체 상태</option>
          {(Object.keys(DJ_EVENT_STATUS_LABEL) as DjEventStatus[]).map((k) => <option key={k} value={k}>{DJ_EVENT_STATUS_LABEL[k]}</option>)}
        </select>
        <input style={{ ...inputStyle, flex: 1, minWidth: '200px' }} placeholder="행사명·고객·DJ·지역 검색" value={search} onChange={(e) => setSearch(e.target.value)} />
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{view.length}건</span>
      </div>
      <BoardTable items={view} getId={(it) => it.id} columns={columns} loading={loading} emptyMessage="접수된 DJ 행사 문의가 없습니다." />
      {modal}
    </div>
  );
};

export default DjEventInquiryManagement;
