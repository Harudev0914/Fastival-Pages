import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Copy, Printer } from 'lucide-react';
import { estimateApi, ESTIMATE_TYPE_LABEL, ESTIMATE_STATUS_LABEL, ESTIMATE_STATUS_COLOR, type Estimate, type EstimateType, type EstimateStatus } from '../../../api/opsApi';
import { companyApi, type CompanyInfo } from '../../../api/companyApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import BoardTable, { type Column } from '../../../components/admin/BoardTable';
import { PageHead, btnPrimary, inputStyle, card, fmtDate, useAdminModal } from '../../../components/admin/shared';
import { useRowSelection, BulkBar, ExportBtn } from '../../../components/admin/listTools';
import { exportToCsv } from '../../../utils/exportCsv';
import { printEstimate } from '../../../utils/estimatePrint';
import { useAdminPermissions } from '../../../hooks/useAdminPermissions';

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;

const EstimateManagement: React.FC<{ type: EstimateType }> = ({ type }) => {
  const navigate = useNavigate();
  const { can } = useAdminPermissions();
  const PK = `estimates/${type}`;
  const base = `/admin/dashboard/estimates/${type}`;
  const label = ESTIMATE_TYPE_LABEL[type];

  const [items, setItems] = useState<Estimate[]>([]);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | EstimateStatus>('all');
  const sel = useRowSelection();
  const { element: modal, alert, confirm } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await estimateApi.list(type);
    if (error) alert('불러오기 오류', error);
    setItems(data || []);
  }, [alert, type]);
  useEffect(() => { (async () => { setLoading(true); await fetchItems(); companyApi.get().then(({ data }) => setCompany(data)); setLoading(false); })(); }, [fetchItems]);

  const view = useMemo(() => items.filter((it) => {
    if (status !== 'all' && it.status !== status) return false;
    if (search.trim() && !`${it.title} ${it.customer_name || ''} ${it.estimate_no || ''}`.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  }), [items, search, status]);

  const removeItem = (item: Estimate) => confirm('삭제 확인', `'${item.title}' 견적서를 삭제하시겠습니까?`, async () => {
    const { error } = await estimateApi.remove(item.id);
    if (error) alert('삭제 오류', error); else { sel.clear(); fetchItems(); }
  });
  const removeSelected = () => confirm('선택 삭제', `${sel.count}개의 견적서를 삭제하시겠습니까?`, async () => {
    const { error } = await estimateApi.removeMany(Array.from(sel.selected));
    if (error) alert('삭제 오류', error); else { sel.clear(); fetchItems(); }
  });
  const duplicate = async (item: Estimate) => {
    const { error } = await estimateApi.duplicate(item.id);
    if (error) alert('복제 오류', error); else fetchItems();
  };
  const quickStatus = async (item: Estimate, s: EstimateStatus) => {
    const { error } = await estimateApi.setStatus(item.id, s);
    if (error) alert('상태 변경 오류', error); else setItems((arr) => arr.map((x) => (x.id === item.id ? { ...x, status: s } : x)));
  };
  const doExport = () => exportToCsv(`견적서_${label}`, [
    { header: '견적번호', value: (e: Estimate) => e.estimate_no },
    { header: '제목', value: (e) => e.title },
    { header: '고객', value: (e) => e.customer_name },
    { header: '연락처', value: (e) => e.customer_phone },
    { header: '총액', value: (e) => e.total },
    { header: '상태', value: (e) => ESTIMATE_STATUS_LABEL[e.status] },
    { header: '발행일', value: (e) => e.issue_date },
    { header: '유효기간', value: (e) => e.valid_until },
    { header: '작성일', value: (e) => fmtDate(e.created_at) },
  ], view);

  const columns: Column<Estimate>[] = [
    { key: 'no', label: '견적번호', width: '130px', render: (it) => <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>{it.estimate_no || '-'}</span> },
    { key: 'title', label: '제목', width: '1.5fr', align: 'left', render: (it) => <span style={{ fontWeight: 700, color: '#1e293b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</span> },
    { key: 'customer', label: '고객', width: '100px', render: (it) => it.customer_name || '-' },
    { key: 'total', label: '총액', width: '120px', render: (it) => <span style={{ fontWeight: 700, color: '#008b8b' }}>{won(it.total)}</span> },
    { key: 'created_at', label: '작성일', width: '120px', render: (it) => fmtDate(it.created_at) },
    {
      key: 'status', label: '상태', width: '110px', render: (it) => can(PK, 'u') ? (
        <select value={it.status} onChange={(e) => quickStatus(it, e.target.value as EstimateStatus)}
          style={{ padding: '4px 8px', borderRadius: '999px', border: `1px solid ${ESTIMATE_STATUS_COLOR[it.status]}55`, background: `${ESTIMATE_STATUS_COLOR[it.status]}12`, color: ESTIMATE_STATUS_COLOR[it.status], fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer' }}>
          {(Object.keys(ESTIMATE_STATUS_LABEL) as EstimateStatus[]).map((k) => <option key={k} value={k}>{ESTIMATE_STATUS_LABEL[k]}</option>)}
        </select>
      ) : <span style={{ background: `${ESTIMATE_STATUS_COLOR[it.status]}1a`, color: ESTIMATE_STATUS_COLOR[it.status], fontSize: '0.74rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>{ESTIMATE_STATUS_LABEL[it.status]}</span>,
    },
    {
      key: 'manage', label: '관리', width: '140px', render: (it) => (
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
          <button onClick={() => printEstimate(it, label, company)} title="인쇄/PDF" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Printer size={16} color="#0891b2" /></button>
          {can(PK, 'c') && <button onClick={() => duplicate(it)} title="복제" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Copy size={16} color="#7c3aed" /></button>}
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
        desc={`${label}를 작성·관리합니다. 품목/단가/수량으로 금액을 산정하고 상태(작성중·발송·수락·반려)를 관리하며, 인쇄/PDF·복제를 지원합니다.`}
        right={can(PK, 'c') ? <button style={btnPrimary} onClick={() => navigate(`${base}/detail/new`)}><Plus size={18} /> {label} 작성</button> : undefined}
      />
      <div style={{ ...card, marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={status} onChange={(e) => setStatus(e.target.value as any)}>
          <option value="all">전체 상태</option>
          {(Object.keys(ESTIMATE_STATUS_LABEL) as EstimateStatus[]).map((k) => <option key={k} value={k}>{ESTIMATE_STATUS_LABEL[k]}</option>)}
        </select>
        <input style={{ ...inputStyle, flex: 1, minWidth: '200px' }} placeholder="제목·고객·견적번호 검색" value={search} onChange={(e) => setSearch(e.target.value)} />
        <ExportBtn onClick={doExport} disabled={view.length === 0} />
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{view.length}건</span>
      </div>
      <BulkBar count={sel.count} onClear={sel.clear} onDelete={can(PK, 'd') ? removeSelected : undefined} />
      <BoardTable
        items={view} getId={(it) => it.id} columns={columns} loading={loading} emptyMessage={`작성된 ${label}가 없습니다.`}
        pageSize={15}
        selectedIds={sel.selected} onToggleSelect={sel.toggle} onToggleAll={sel.toggleAll}
      />
      {modal}
    </div>
  );
};

export default EstimateManagement;
