import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, LayoutGrid, List } from 'lucide-react';
import { djEventApi, DJ_EVENT_STATUS_LABEL, DJ_EVENT_STATUS_COLOR, DJ_REGIONS, type DjEventInquiry, type DjEventStatus } from '../../../api/djApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import BoardTable, { type Column } from '../../../components/admin/BoardTable';
import KanbanBoard, { type KanbanColumn } from '../../../components/admin/KanbanBoard';
import { PageHead, btnPrimary, inputStyle, card, fmtDate, useAdminModal } from '../../../components/admin/shared';
import { useRowSelection, BulkBar, ExportBtn } from '../../../components/admin/listTools';
import { exportToCsv } from '../../../utils/exportCsv';
import { useAdminPermissions } from '../../../hooks/useAdminPermissions';

const PK = 'dj/event-inquiries';
const won = (n: number | null) => (n == null ? '-' : `₩${Number(n).toLocaleString()}`);
const badge = (s: DjEventStatus) => <span style={{ background: `${DJ_EVENT_STATUS_COLOR[s]}1a`, color: DJ_EVENT_STATUS_COLOR[s], fontSize: '0.74rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>{DJ_EVENT_STATUS_LABEL[s]}</span>;
const KANBAN_COLS: KanbanColumn[] = (Object.keys(DJ_EVENT_STATUS_LABEL) as DjEventStatus[]).map((k) => ({ key: k, label: DJ_EVENT_STATUS_LABEL[k], color: DJ_EVENT_STATUS_COLOR[k] }));

const DjEventInquiryManagement: React.FC = () => {
  const navigate = useNavigate();
  const { can } = useAdminPermissions();
  const [items, setItems] = useState<DjEventInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | DjEventStatus>('all');
  const [region, setRegion] = useState('all');
  const [sort, setSort] = useState<'recent' | 'event'>('recent');
  const [tab, setTab] = useState<'list' | 'board'>('list');
  const sel = useRowSelection();
  const { element: modal, alert, confirm } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await djEventApi.list();
    if (error) alert('불러오기 오류', error);
    setItems(data || []);
  }, [alert]);
  useEffect(() => { (async () => { setLoading(true); await fetchItems(); setLoading(false); })(); }, [fetchItems]);

  const view = useMemo(() => {
    let v = items.filter((it) => {
      if (status !== 'all' && it.status !== status) return false;
      if (region !== 'all' && it.region !== region) return false;
      if (search.trim() && !`${it.title} ${it.customer_name || ''} ${it.artist_name || ''} ${it.region || ''}`.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
    if (sort === 'event') v = [...v].sort((a, b) => (a.event_date || '9999').localeCompare(b.event_date || '9999'));
    else v = [...v].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    return v;
  }, [items, search, status, region, sort]);

  const removeItem = (item: DjEventInquiry) => confirm('삭제 확인', `'${item.title}' 문의를 삭제하시겠습니까?`, async () => {
    const { error } = await djEventApi.remove(item.id);
    if (error) alert('삭제 오류', error); else { sel.clear(); fetchItems(); }
  });
  const removeSelected = () => confirm('선택 삭제', `${sel.count}개의 문의를 삭제하시겠습니까?`, async () => {
    const { error } = await djEventApi.removeMany(Array.from(sel.selected));
    if (error) alert('삭제 오류', error); else { sel.clear(); fetchItems(); }
  });
  const moveStatus = async (id: string | number, to: string) => {
    const s = to as DjEventStatus;
    setItems((arr) => arr.map((x) => (x.id === Number(id) ? { ...x, status: s } : x)));
    const { error } = await djEventApi.setStatus(id, s);
    if (error) { alert('상태 변경 오류', error); fetchItems(); }
  };
  const doExport = () => exportToCsv('DJ행사문의', [
    { header: '행사명', value: (e: DjEventInquiry) => e.title },
    { header: '고객', value: (e) => e.customer_name },
    { header: '연락처', value: (e) => e.customer_phone },
    { header: '행사일', value: (e) => e.event_date },
    { header: '지역', value: (e) => e.region },
    { header: '장소', value: (e) => e.venue },
    { header: '배정DJ', value: (e) => e.artist_name },
    { header: '예산', value: (e) => e.budget },
    { header: '상태', value: (e) => DJ_EVENT_STATUS_LABEL[e.status] },
    { header: '접수일', value: (e) => fmtDate(e.created_at) },
  ], view);

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

  const tabBtn = (t: 'list' | 'board', icon: React.ReactNode, txt: string) => (
    <button onClick={() => setTab(t)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1px solid ' + (tab === t ? '#008b8b' : '#e2e8f0'), background: tab === t ? '#008b8b' : '#fff', color: tab === t ? '#fff' : '#64748b', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>{icon} {txt}</button>
  );

  return (
    <div>
      <PageHead
        title="DJ 행사 문의 관리"
        desc="DJ 섭외/행사 대행 문의를 접수·상담·확정 처리합니다. 보드에서 카드를 드래그해 진행 단계를 바꾸고, 행사일이 있는 확정 건은 DJ 행사 캘린더에 표기됩니다."
        right={can(PK, 'c') ? <button style={btnPrimary} onClick={() => navigate('/admin/dashboard/dj/event-inquiries/detail/new')}><Plus size={18} /> 문의 등록</button> : undefined}
      />
      <div style={{ ...card, marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px' }}>{tabBtn('list', <List size={15} />, '목록')}{tabBtn('board', <LayoutGrid size={15} />, '보드')}</div>
        {tab === 'list' && (
          <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="all">전체 상태</option>
            {(Object.keys(DJ_EVENT_STATUS_LABEL) as DjEventStatus[]).map((k) => <option key={k} value={k}>{DJ_EVENT_STATUS_LABEL[k]}</option>)}
          </select>
        )}
        <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="all">전체 지역</option>
          {DJ_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={sort} onChange={(e) => setSort(e.target.value as any)}>
          <option value="recent">최근 접수순</option>
          <option value="event">행사일 임박순</option>
        </select>
        <input style={{ ...inputStyle, flex: 1, minWidth: '160px' }} placeholder="행사명·고객·DJ·지역 검색" value={search} onChange={(e) => setSearch(e.target.value)} />
        <ExportBtn onClick={doExport} disabled={view.length === 0} />
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{view.length}건</span>
      </div>

      {tab === 'list' ? (
        <>
          <BulkBar count={sel.count} onClear={sel.clear} onDelete={can(PK, 'd') ? removeSelected : undefined} />
          <BoardTable
            items={view} getId={(it) => it.id} columns={columns} loading={loading} emptyMessage="접수된 DJ 행사 문의가 없습니다."
            pageSize={15}
            selectedIds={sel.selected} onToggleSelect={sel.toggle} onToggleAll={sel.toggleAll}
          />
        </>
      ) : (
        <KanbanBoard
          items={view} getId={(it) => it.id} statusOf={(it) => it.status} columns={KANBAN_COLS}
          onMove={can(PK, 'u') ? moveStatus : () => alert('권한 없음', '상태를 변경할 권한이 없습니다.')}
          renderCard={(it) => (
            <div onClick={() => can(PK, 'u') && navigate(`/admin/dashboard/dj/event-inquiries/detail/${it.id}`)}>
              <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {it.customer_name && <span>고객 · {it.customer_name}</span>}
                {it.event_date && <span>행사일 · {it.event_date}</span>}
                {it.region && <span>지역 · {it.region}</span>}
                {it.artist_name && <span>배정 · {it.artist_name}</span>}
              </div>
              {it.budget != null && <div style={{ marginTop: '8px', fontWeight: 700, color: '#db2777', fontSize: '0.85rem' }}>{won(it.budget)}</div>}
            </div>
          )}
        />
      )}
      {modal}
    </div>
  );
};

export default DjEventInquiryManagement;
