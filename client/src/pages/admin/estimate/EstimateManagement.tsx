import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { estimateApi, ESTIMATE_TYPE_LABEL, ESTIMATE_STATUS_LABEL, ESTIMATE_STATUS_COLOR, type Estimate, type EstimateType, type EstimateStatus } from '../../../api/opsApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import BoardTable, { type Column } from '../../../components/admin/BoardTable';
import { PageHead, btnPrimary, inputStyle, card, fmtDate, useAdminModal } from '../../../components/admin/shared';
import { useAdminPermissions } from '../../../hooks/useAdminPermissions';

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;
const badge = (s: EstimateStatus) => <span style={{ background: `${ESTIMATE_STATUS_COLOR[s]}1a`, color: ESTIMATE_STATUS_COLOR[s], fontSize: '0.74rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>{ESTIMATE_STATUS_LABEL[s]}</span>;

const EstimateManagement: React.FC<{ type: EstimateType }> = ({ type }) => {
  const navigate = useNavigate();
  const { can } = useAdminPermissions();
  const PK = `estimates/${type}`;
  const base = `/admin/dashboard/estimates/${type}`;
  const label = ESTIMATE_TYPE_LABEL[type];

  const [items, setItems] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | EstimateStatus>('all');
  const { element: modal, alert, confirm } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await estimateApi.list(type);
    if (error) alert('불러오기 오류', error);
    setItems(data || []);
  }, [alert, type]);
  useEffect(() => { (async () => { setLoading(true); await fetchItems(); setLoading(false); })(); }, [fetchItems]);

  const view = useMemo(() => items.filter((it) => {
    if (status !== 'all' && it.status !== status) return false;
    if (search.trim() && !`${it.title} ${it.customer_name || ''}`.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  }), [items, search, status]);

  const removeItem = (item: Estimate) => confirm('삭제 확인', `'${item.title}' 견적서를 삭제하시겠습니까?`, async () => {
    const { error } = await estimateApi.remove(item.id);
    if (error) alert('삭제 오류', error); else fetchItems();
  });

  const columns: Column<Estimate>[] = [
    { key: 'title', label: '제목', width: '1.5fr', align: 'left', render: (it) => <span style={{ fontWeight: 700, color: '#1e293b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</span> },
    { key: 'customer', label: '고객', width: '110px', render: (it) => it.customer_name || '-' },
    { key: 'total', label: '총액', width: '120px', render: (it) => <span style={{ fontWeight: 700, color: '#008b8b' }}>{won(it.total)}</span> },
    { key: 'valid', label: '유효기간', width: '120px', render: (it) => it.valid_until || '-' },
    { key: 'created_at', label: '작성일', width: '130px', render: (it) => fmtDate(it.created_at) },
    { key: 'status', label: '상태', width: '90px', render: (it) => <div style={{ display: 'flex', justifyContent: 'center' }}>{badge(it.status)}</div> },
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
        desc={`${label}를 작성·관리합니다. 품목/단가/수량으로 금액을 산정하고 상태(작성중·발송·수락·반려)를 관리합니다.`}
        right={can(PK, 'c') ? <button style={btnPrimary} onClick={() => navigate(`${base}/detail/new`)}><Plus size={18} /> {label} 작성</button> : undefined}
      />
      <div style={{ ...card, marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={status} onChange={(e) => setStatus(e.target.value as any)}>
          <option value="all">전체 상태</option>
          {(Object.keys(ESTIMATE_STATUS_LABEL) as EstimateStatus[]).map((k) => <option key={k} value={k}>{ESTIMATE_STATUS_LABEL[k]}</option>)}
        </select>
        <input style={{ ...inputStyle, flex: 1, minWidth: '200px' }} placeholder="제목·고객 검색" value={search} onChange={(e) => setSearch(e.target.value)} />
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{view.length}건</span>
      </div>
      <BoardTable items={view} getId={(it) => it.id} columns={columns} loading={loading} emptyMessage={`작성된 ${label}가 없습니다.`} />
      {modal}
    </div>
  );
};

export default EstimateManagement;
