import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { shipmentApi, SHIPMENT_STATUS_LABEL, SHIPMENT_STATUS_COLOR, type RentalShipment, type ShipmentStatus } from '../../../api/rentalApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import BoardTable, { type Column } from '../../../components/admin/BoardTable';
import { PageHead, btnPrimary, inputStyle, card, fmtDate, useAdminModal } from '../../../components/admin/shared';
import { useRowSelection, BulkBar, ExportBtn } from '../../../components/admin/listTools';
import { exportToCsv } from '../../../utils/exportCsv';
import { useAdminPermissions } from '../../../hooks/useAdminPermissions';

const PK = 'rental/shipments';
const BASE = '/admin/dashboard/rental/shipments';

const RentalShipmentManagement: React.FC = () => {
  const navigate = useNavigate();
  const { can } = useAdminPermissions();
  const [items, setItems] = useState<RentalShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | ShipmentStatus>('all');
  const sel = useRowSelection();
  const { element: modal, alert, confirm } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await shipmentApi.list();
    if (error) alert('불러오기 오류', error);
    setItems(data || []);
  }, [alert]);
  useEffect(() => { (async () => { setLoading(true); await fetchItems(); setLoading(false); })(); }, [fetchItems]);

  const view = useMemo(() => items.filter((it) => {
    if (status !== 'all' && it.status !== status) return false;
    if (search.trim() && !`${it.product_name} ${it.brand_name || ''} ${it.customer_name || ''} ${it.tracking_no || ''}`.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  }), [items, search, status]);

  const removeItem = (it: RentalShipment) => confirm('삭제 확인', `'${it.product_name}' 출고 건을 삭제하시겠습니까?`, async () => {
    const { error } = await shipmentApi.remove(it.id);
    if (error) alert('삭제 오류', error); else { sel.clear(); fetchItems(); }
  });
  const removeSelected = () => confirm('선택 삭제', `${sel.count}건을 삭제하시겠습니까?`, async () => {
    const { error } = await shipmentApi.removeMany(Array.from(sel.selected));
    if (error) alert('삭제 오류', error); else { sel.clear(); fetchItems(); }
  });
  const quickStatus = async (it: RentalShipment, s: ShipmentStatus) => {
    const { error } = await shipmentApi.setStatus(it.id, s);
    if (error) alert('상태 변경 오류', error); else setItems((arr) => arr.map((x) => (x.id === it.id ? { ...x, status: s } : x)));
  };
  const doExport = () => exportToCsv('렌탈출고현황', [
    { header: '출고일', value: (s: RentalShipment) => s.ship_date },
    { header: '품목', value: (s) => s.product_name },
    { header: '브랜드', value: (s) => s.brand_name },
    { header: '수량', value: (s) => s.quantity },
    { header: '고객', value: (s) => s.customer_name },
    { header: '연락처', value: (s) => s.customer_phone },
    { header: '송장번호', value: (s) => s.tracking_no },
    { header: '회수예정일', value: (s) => s.return_date },
    { header: '상태', value: (s) => SHIPMENT_STATUS_LABEL[s.status] },
  ], view);

  const columns: Column<RentalShipment>[] = [
    { key: 'ship', label: '출고일', width: '110px', render: (s) => s.ship_date || '-' },
    { key: 'product', label: '품목', width: '1.4fr', align: 'left', render: (s) => <span style={{ fontWeight: 700, color: '#1e293b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.product_name}{s.brand_name ? <span style={{ color: '#94a3b8', fontWeight: 400 }}> · {s.brand_name}</span> : null}</span> },
    { key: 'qty', label: '수량', width: '64px', render: (s) => `${s.quantity}` },
    { key: 'customer', label: '고객', width: '110px', render: (s) => s.customer_name || '-' },
    { key: 'tracking', label: '송장번호', width: '130px', render: (s) => s.tracking_no || '-' },
    {
      key: 'status', label: '상태', width: '130px', render: (s) => can(PK, 'u') ? (
        <select value={s.status} onChange={(e) => quickStatus(s, e.target.value as ShipmentStatus)}
          style={{ padding: '4px 8px', borderRadius: '999px', border: `1px solid ${SHIPMENT_STATUS_COLOR[s.status]}55`, background: `${SHIPMENT_STATUS_COLOR[s.status]}12`, color: SHIPMENT_STATUS_COLOR[s.status], fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer' }}>
          {(Object.keys(SHIPMENT_STATUS_LABEL) as ShipmentStatus[]).map((k) => <option key={k} value={k}>{SHIPMENT_STATUS_LABEL[k]}</option>)}
        </select>
      ) : <span style={{ background: `${SHIPMENT_STATUS_COLOR[s.status]}1a`, color: SHIPMENT_STATUS_COLOR[s.status], fontSize: '0.74rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>{SHIPMENT_STATUS_LABEL[s.status]}</span>,
    },
    {
      key: 'manage', label: '관리', width: '90px', render: (s) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          {can(PK, 'u') && <button onClick={() => navigate(`${BASE}/detail/${s.id}`)} title="수정" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} color="#475569" /></button>}
          {can(PK, 'd') && <button onClick={() => removeItem(s)} title="삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} color="#dc2626" /></button>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHead
        title="렌탈 출고 현황"
        desc="계약·주문 확정 후 실제 출고를 등록·관리합니다. 사용자 ID(UUID)를 지정하면 해당 고객의 마이페이지에 출고 현황이 노출됩니다."
        right={can(PK, 'c') ? <button style={btnPrimary} onClick={() => navigate(`${BASE}/detail/new`)}><Plus size={18} /> 출고 등록</button> : undefined}
      />
      <div style={{ ...card, marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={status} onChange={(e) => setStatus(e.target.value as any)}>
          <option value="all">전체 상태</option>
          {(Object.keys(SHIPMENT_STATUS_LABEL) as ShipmentStatus[]).map((k) => <option key={k} value={k}>{SHIPMENT_STATUS_LABEL[k]}</option>)}
        </select>
        <input style={{ ...inputStyle, flex: 1, minWidth: '200px' }} placeholder="품목·브랜드·고객·송장 검색" value={search} onChange={(e) => setSearch(e.target.value)} />
        <ExportBtn onClick={doExport} disabled={view.length === 0} />
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{view.length}건</span>
      </div>
      <BulkBar count={sel.count} onClear={sel.clear} onDelete={can(PK, 'd') ? removeSelected : undefined} />
      <BoardTable
        items={view} getId={(s) => s.id} columns={columns} loading={loading} emptyMessage="등록된 출고 건이 없습니다."
        pageSize={15}
        selectedIds={sel.selected} onToggleSelect={sel.toggle} onToggleAll={sel.toggleAll}
      />
      <div style={{ ...card, marginTop: '14px', fontSize: '0.82rem', color: '#94a3b8' }}>
        최근 갱신: {items[0] ? fmtDate(items[0].updated_at || items[0].created_at) : '-'}
      </div>
      {modal}
    </div>
  );
};

export default RentalShipmentManagement;
