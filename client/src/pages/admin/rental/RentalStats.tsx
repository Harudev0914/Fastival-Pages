import React, { useEffect, useMemo, useState } from 'react';
import { orderApi, PAYMENT_LABEL, ORDER_LABEL, type RentalOrder, type PaymentStatus, type OrderStatus } from '../../../api/rentalApi';
import { PageHead, Spinner, useAdminModal } from '../../../components/admin/shared';
import { StatGrid, BarBreakdown } from '../../../components/admin/Stats';

const ORDER_COLOR: Record<string, string> = { reserved: '#2563eb', renting: '#d97706', returned: '#059669', cancelled: '#94a3b8' };
const PAY_COLOR: Record<string, string> = { pending: '#d97706', paid: '#059669', cancelled: '#94a3b8', refunded: '#dc2626' };
const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;

const RentalStats: React.FC = () => {
  const [orders, setOrders] = useState<RentalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    (async () => {
      const { data, error } = await orderApi.list();
      if (error) alert('불러오기 오류', error);
      setOrders(data || []);
      setLoading(false);
    })();
  }, [alert]);

  const s = useMemo(() => {
    const paid = orders.filter((o) => o.payment_status === 'paid');
    const revenue = paid.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const ym = new Date().toISOString().slice(0, 7);
    const monthPaid = paid.filter((o) => (o.created_at || '').slice(0, 7) === ym);
    const monthRevenue = monthPaid.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    const orderByStatus = (Object.keys(ORDER_LABEL) as OrderStatus[]).map((k) => ({ label: ORDER_LABEL[k], value: orders.filter((o) => o.order_status === k).length, color: ORDER_COLOR[k] }));
    const payByStatus = (Object.keys(PAYMENT_LABEL) as PaymentStatus[]).map((k) => ({ label: PAYMENT_LABEL[k], value: orders.filter((o) => o.payment_status === k).length, color: PAY_COLOR[k] }));

    // 상품별 매출 top5 (결제완료)
    const byProd: Record<string, number> = {};
    paid.forEach((o) => { const n = o.product_name || '기타'; byProd[n] = (byProd[n] || 0) + (Number(o.total_amount) || 0); });
    const topProducts = Object.entries(byProd).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, value]) => ({ label, value, color: '#008b8b' }));

    // 최근 6개월 매출
    const months: { label: string; value: number }[] = [];
    const base = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
      const m = d.toISOString().slice(0, 7);
      months.push({ label: `${d.getMonth() + 1}월`, value: paid.filter((o) => (o.created_at || '').slice(0, 7) === m).reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0) });
    }
    return { paid, revenue, monthRevenue, monthPaid, orderByStatus, payByStatus, topProducts, months };
  }, [orders]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHead title="렌탈 내역 통계" desc="렌탈 주문·결제·매출 현황을 요약합니다." />
      <StatGrid cards={[
        { label: '전체 주문', value: orders.length },
        { label: '결제완료', value: s.paid.length, color: '#059669' },
        { label: '총 매출', value: won(s.revenue), color: '#008b8b' },
        { label: '대여중', value: orders.filter((o) => o.order_status === 'renting').length, color: '#d97706' },
        { label: '이번 달 주문', value: s.monthPaid.length, sub: new Date().toISOString().slice(0, 7) },
        { label: '이번 달 매출', value: won(s.monthRevenue), color: '#008b8b' },
      ]} />
      <BarBreakdown title="주문 상태 분포" rows={s.orderByStatus} unit="건" />
      <BarBreakdown title="결제 상태 분포" rows={s.payByStatus} unit="건" />
      <BarBreakdown title="상품별 매출 TOP 5" rows={s.topProducts} unit="원" />
      <BarBreakdown title="최근 6개월 매출" rows={s.months} unit="원" />
      {modal}
    </div>
  );
};

export default RentalStats;
