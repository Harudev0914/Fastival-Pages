import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi, ORDER_LABEL, type RentalOrder } from '../../../api/rentalApi';
import MonthCalendar, { type CalEvent } from '../../../components/admin/MonthCalendar';
import { PageHead, Spinner, useAdminModal } from '../../../components/admin/shared';
import { FilterChips } from '../../../components/admin/listTools';

const STATUS_COLOR: Record<string, string> = { reserved: '#2563eb', renting: '#d97706', returned: '#059669', cancelled: '#94a3b8' };
const ALL_STATUS = Object.keys(ORDER_LABEL);

const RentalCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<RentalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Set<string>>(new Set(ALL_STATUS));
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    (async () => {
      const { data, error } = await orderApi.list();
      if (error) alert('불러오기 오류', error);
      setOrders(data || []);
      setLoading(false);
    })();
  }, [alert]);

  // 승인(결제완료) & 취소 아님 & 기간 존재하는 주문만 캘린더 표기
  const events: CalEvent[] = useMemo(() => orders
    .filter((o) => o.payment_status === 'paid' && o.order_status !== 'cancelled' && o.rental_start && active.has(o.order_status))
    .map((o) => ({
      id: o.id,
      start: o.rental_start!,
      end: o.rental_end || o.rental_start,
      label: o.brand_name || '렌탈',
      sub: o.product_name || undefined,
      color: STATUS_COLOR[o.order_status] || '#2563eb',
      onClick: () => navigate(`/admin/dashboard/rental/orders/detail/${o.id}`),
    })), [orders, active, navigate]);

  const toggle = (k: string) => setActive((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  if (loading) return <Spinner />;
  const now = new Date();

  return (
    <div>
      <PageHead title="렌탈 내역 캘린더" desc="결제완료(승인)된 렌탈 주문을 대여 기간에 브랜드·장비명으로 표기합니다. 상태 칩으로 표시를 필터링하고, 일정을 클릭하면 주문 상세로 이동합니다." />
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '14px', alignItems: 'center' }}>
        <FilterChips options={ALL_STATUS.map((k) => ({ key: k, label: ORDER_LABEL[k as keyof typeof ORDER_LABEL], color: STATUS_COLOR[k] }))} active={active} onToggle={toggle} />
        <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '0.82rem', color: '#64748b' }}>표기 {events.length}건</span>
      </div>
      <MonthCalendar initialYear={now.getFullYear()} initialMonth={now.getMonth()} events={events} />
      {modal}
    </div>
  );
};

export default RentalCalendar;
