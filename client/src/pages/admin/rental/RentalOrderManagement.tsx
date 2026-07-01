import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { orderApi, PAYMENT_LABEL, ORDER_LABEL, type RentalOrder, type OrderStatus, type PaymentStatus } from '../../../api/rentalApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import { card, inputStyle, PageHead, EmptyState, Spinner, fmtDate, useAdminModal } from '../../../components/admin/shared';
import { ExportBtn } from '../../../components/admin/listTools';
import { exportToCsv } from '../../../utils/exportCsv';

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;
const ORDER_COLOR: Record<OrderStatus, string> = { reserved: '#2563eb', renting: '#d97706', returned: '#059669', cancelled: '#94a3b8' };
const PAY_COLOR: Record<PaymentStatus, string> = { paid: '#059669', pending: '#d97706', cancelled: '#94a3b8', refunded: '#dc2626' };
const badge = (color: string, label: string) => <span style={{ background: `${color}1a`, color, fontSize: '0.74rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>{label}</span>;

const RentalOrderManagement: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<RentalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState<'all' | OrderStatus>('all');
  const [payStatus, setPayStatus] = useState<'all' | PaymentStatus>('all');
  const { element: modal, alert } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await orderApi.list();
    if (error) alert('불러오기 오류', error);
    setItems(data || []);
  }, [alert]);

  useEffect(() => { (async () => { setLoading(true); await fetchItems(); setLoading(false); })(); }, [fetchItems]);

  const view = useMemo(() => items.filter((o) => {
    if (orderStatus !== 'all' && o.order_status !== orderStatus) return false;
    if (payStatus !== 'all' && o.payment_status !== payStatus) return false;
    if (search.trim() && !`${o.product_name || ''} ${o.customer_name || ''} ${o.customer_phone || ''}`.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  }), [items, search, orderStatus, payStatus]);

  const doExport = () => exportToCsv('렌탈주문', [
    { header: '주문일', value: (o: RentalOrder) => fmtDate(o.created_at) },
    { header: '상품', value: (o) => o.product_name },
    { header: '옵션', value: (o) => o.option_name },
    { header: '고객', value: (o) => o.customer_name },
    { header: '연락처', value: (o) => o.customer_phone },
    { header: '대여시작', value: (o) => o.rental_start },
    { header: '일수', value: (o) => o.rental_days },
    { header: '결제액', value: (o) => o.total_amount },
    { header: '결제상태', value: (o) => PAYMENT_LABEL[o.payment_status] },
    { header: '대여상태', value: (o) => ORDER_LABEL[o.order_status] },
  ], view);

  const th: React.CSSProperties = { padding: '12px 14px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: 700, background: '#f8fafc', whiteSpace: 'nowrap' };
  const td: React.CSSProperties = { padding: '12px 14px', fontSize: '0.86rem', color: '#334155', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' };

  return (
    <div>
      <PageHead title="렌탈 관리" desc="결제(PG) 완료된 렌탈 주문 내역을 조회하고 대여 상태를 관리합니다." />

      <div style={{ ...card, marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={orderStatus} onChange={(e) => setOrderStatus(e.target.value as any)}>
          <option value="all">전체 대여상태</option>
          <option value="reserved">예약</option>
          <option value="renting">대여중</option>
          <option value="returned">반납완료</option>
          <option value="cancelled">취소</option>
        </select>
        <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={payStatus} onChange={(e) => setPayStatus(e.target.value as any)}>
          <option value="all">전체 결제상태</option>
          <option value="paid">결제완료</option>
          <option value="pending">결제대기</option>
          <option value="cancelled">결제취소</option>
          <option value="refunded">환불</option>
        </select>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input style={{ ...inputStyle, paddingLeft: '36px' }} placeholder="상품명·고객명·연락처 검색" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <ExportBtn onClick={doExport} disabled={view.length === 0} />
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{view.length}건</span>
      </div>

      {loading ? <Spinner /> : view.length === 0 ? (
        <EmptyState message="렌탈 주문 내역이 없습니다." />
      ) : (
        <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead>
              <tr>
                <th style={th}>주문일</th>
                <th style={th}>상품</th>
                <th style={th}>고객</th>
                <th style={th}>대여 시작</th>
                <th style={{ ...th, textAlign: 'center' }}>일수</th>
                <th style={{ ...th, textAlign: 'right' }}>결제액</th>
                <th style={{ ...th, textAlign: 'center' }}>결제</th>
                <th style={{ ...th, textAlign: 'center' }}>대여상태</th>
                <th style={{ ...th, textAlign: 'center' }}> </th>
              </tr>
            </thead>
            <tbody>
              {view.map((o) => (
                <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/dashboard/rental/orders/detail/${o.id}`)}>
                  <td style={td}>{fmtDate(o.created_at)}</td>
                  <td style={{ ...td, fontWeight: 700, color: '#1e293b' }}>{o.product_name || '-'}{o.option_name ? <span style={{ color: '#94a3b8', fontWeight: 400 }}> · {o.option_name}</span> : null}</td>
                  <td style={td}>{o.customer_name || '-'}<div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{o.customer_phone || ''}</div></td>
                  <td style={td}>{o.rental_start ? fmtDate(o.rental_start) : '-'}</td>
                  <td style={{ ...td, textAlign: 'center' }}>{o.rental_days}일</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>{won(o.total_amount)}</td>
                  <td style={{ ...td, textAlign: 'center' }}>{badge(PAY_COLOR[o.payment_status], PAYMENT_LABEL[o.payment_status])}</td>
                  <td style={{ ...td, textAlign: 'center' }}>{badge(ORDER_COLOR[o.order_status], ORDER_LABEL[o.order_status])}</td>
                  <td style={{ ...td, textAlign: 'center' }}><ChevronRight size={16} color="#cbd5e1" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modal}
    </div>
  );
};

export default RentalOrderManagement;
