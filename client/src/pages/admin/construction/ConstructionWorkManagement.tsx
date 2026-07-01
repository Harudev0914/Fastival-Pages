import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, LayoutGrid, List } from 'lucide-react';
import { constructionWorkApi, WORK_STATUS_LABEL, WORK_STATUS_COLOR, type ConstructionWork, type WorkStatus } from '../../../api/opsApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import BoardTable, { type Column } from '../../../components/admin/BoardTable';
import KanbanBoard, { type KanbanColumn } from '../../../components/admin/KanbanBoard';
import { PageHead, btnPrimary, inputStyle, card, useAdminModal } from '../../../components/admin/shared';
import { useRowSelection, BulkBar, ExportBtn } from '../../../components/admin/listTools';
import { exportToCsv } from '../../../utils/exportCsv';
import { useAdminPermissions } from '../../../hooks/useAdminPermissions';

const PK = 'construction/works';
const won = (n: number | null) => (n == null ? '-' : `₩${Number(n).toLocaleString()}`);
const badge = (s: WorkStatus) => <span style={{ background: `${WORK_STATUS_COLOR[s]}1a`, color: WORK_STATUS_COLOR[s], fontSize: '0.74rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>{WORK_STATUS_LABEL[s]}</span>;
const KANBAN_COLS: KanbanColumn[] = (Object.keys(WORK_STATUS_LABEL) as WorkStatus[]).map((k) => ({ key: k, label: WORK_STATUS_LABEL[k], color: WORK_STATUS_COLOR[k] }));

const ConstructionWorkManagement: React.FC = () => {
  const navigate = useNavigate();
  const { can } = useAdminPermissions();
  const [items, setItems] = useState<ConstructionWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | WorkStatus>('all');
  const [tab, setTab] = useState<'list' | 'board'>('list');
  const sel = useRowSelection();
  const { element: modal, alert, confirm } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await constructionWorkApi.list();
    if (error) alert('불러오기 오류', error);
    setItems(data || []);
  }, [alert]);
  useEffect(() => { (async () => { setLoading(true); await fetchItems(); setLoading(false); })(); }, [fetchItems]);

  const view = useMemo(() => items.filter((it) => {
    if (status !== 'all' && it.status !== status) return false;
    if (search.trim() && !`${it.title} ${it.customer_name || ''} ${it.assignee || ''} ${it.company_name || ''}`.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  }), [items, search, status]);

  const removeItem = (item: ConstructionWork) => confirm('삭제 확인', `'${item.title}' 업무를 삭제하시겠습니까?`, async () => {
    const { error } = await constructionWorkApi.remove(item.id);
    if (error) alert('삭제 오류', error); else { sel.clear(); fetchItems(); }
  });
  const removeSelected = () => confirm('선택 삭제', `${sel.count}개의 업무를 삭제하시겠습니까?`, async () => {
    const { error } = await constructionWorkApi.removeMany(Array.from(sel.selected));
    if (error) alert('삭제 오류', error); else { sel.clear(); fetchItems(); }
  });
  // 칸반 드래그로 상태 변경 (낙관적 업데이트)
  const moveStatus = async (id: string | number, to: string) => {
    const s = to as WorkStatus;
    setItems((arr) => arr.map((x) => (x.id === Number(id) ? { ...x, status: s } : x)));
    const { error } = await constructionWorkApi.setStatus(id, s);
    if (error) { alert('상태 변경 오류', error); fetchItems(); }
  };
  const doExport = () => exportToCsv('시공업무', [
    { header: '업무명', value: (w: ConstructionWork) => w.title },
    { header: '고객', value: (w) => w.customer_name },
    { header: '연락처', value: (w) => w.customer_phone },
    { header: '업체', value: (w) => w.company_name },
    { header: '담당자', value: (w) => w.assignee },
    { header: '시작일', value: (w) => w.scheduled_start },
    { header: '종료일', value: (w) => w.scheduled_end },
    { header: '금액', value: (w) => w.amount },
    { header: '상태', value: (w) => WORK_STATUS_LABEL[w.status] },
  ], view);

  const columns: Column<ConstructionWork>[] = [
    { key: 'title', label: '업무명', width: '1.4fr', align: 'left', render: (it) => <span style={{ fontWeight: 700, color: '#1e293b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</span> },
    { key: 'customer', label: '고객', width: '100px', render: (it) => it.customer_name || '-' },
    { key: 'company', label: '업체', width: '120px', render: (it) => it.company_name || '-' },
    { key: 'assignee', label: '담당자', width: '100px', render: (it) => it.assignee || '-' },
    { key: 'sched', label: '일정', width: '160px', render: (it) => it.scheduled_start ? `${it.scheduled_start}${it.scheduled_end ? ` ~ ${it.scheduled_end}` : ''}` : '-' },
    { key: 'status', label: '상태', width: '90px', render: (it) => <div style={{ display: 'flex', justifyContent: 'center' }}>{badge(it.status)}</div> },
    {
      key: 'manage', label: '관리', width: '90px', render: (it) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          {can(PK, 'u') && <button onClick={() => navigate(`/admin/dashboard/construction/works/detail/${it.id}`)} title="수정" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} color="#475569" /></button>}
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
        title="시공 업무 현황"
        desc="시공 문의가 영업 단계에서 담당자/업체 배정되면 업무로 관리합니다. 보드에서 카드를 드래그해 상태를 바꿀 수 있고, 일정이 지정된 업무는 시공 내역 캘린더에 표기됩니다."
        right={can(PK, 'c') ? <button style={btnPrimary} onClick={() => navigate('/admin/dashboard/construction/works/detail/new')}><Plus size={18} /> 업무 등록</button> : undefined}
      />
      <div style={{ ...card, marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px' }}>{tabBtn('list', <List size={15} />, '목록')}{tabBtn('board', <LayoutGrid size={15} />, '보드')}</div>
        {tab === 'list' && (
          <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="all">전체 상태</option>
            {(Object.keys(WORK_STATUS_LABEL) as WorkStatus[]).map((k) => <option key={k} value={k}>{WORK_STATUS_LABEL[k]}</option>)}
          </select>
        )}
        <input style={{ ...inputStyle, flex: 1, minWidth: '180px' }} placeholder="업무명·고객·담당자·업체 검색" value={search} onChange={(e) => setSearch(e.target.value)} />
        <ExportBtn onClick={doExport} disabled={view.length === 0} />
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{view.length}건</span>
      </div>

      {tab === 'list' ? (
        <>
          <BulkBar count={sel.count} onClear={sel.clear} onDelete={can(PK, 'd') ? removeSelected : undefined} />
          <BoardTable
            items={view} getId={(it) => it.id} columns={columns} loading={loading} emptyMessage="등록된 시공 업무가 없습니다."
            pageSize={15}
            selectedIds={sel.selected} onToggleSelect={sel.toggle} onToggleAll={sel.toggleAll}
          />
        </>
      ) : (
        <KanbanBoard
          items={view} getId={(it) => it.id} statusOf={(it) => it.status} columns={KANBAN_COLS}
          onMove={can(PK, 'u') ? moveStatus : () => alert('권한 없음', '상태를 변경할 권한이 없습니다.')}
          renderCard={(it) => (
            <div onClick={() => can(PK, 'u') && navigate(`/admin/dashboard/construction/works/detail/${it.id}`)}>
              <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {it.customer_name && <span>고객 · {it.customer_name}</span>}
                {it.company_name && <span>업체 · {it.company_name}</span>}
                {it.assignee && <span>담당 · {it.assignee}</span>}
                {it.scheduled_start && <span>일정 · {it.scheduled_start}{it.scheduled_end ? ` ~ ${it.scheduled_end}` : ''}</span>}
              </div>
              {it.amount != null && <div style={{ marginTop: '8px', fontWeight: 700, color: '#008b8b', fontSize: '0.85rem' }}>{won(it.amount)}</div>}
            </div>
          )}
        />
      )}
      {modal}
    </div>
  );
};

export default ConstructionWorkManagement;
