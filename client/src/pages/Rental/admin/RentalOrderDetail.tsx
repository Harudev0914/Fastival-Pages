import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { orderApi, PAYMENT_LABEL, ORDER_LABEL, type RentalOrder, type OrderStatus, type PaymentStatus } from '../../../api/rentalApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import { card, inputStyle, labelStyle, btnPrimary, btnGhost, useAdminModal, Spinner, fmtDate } from '../../Content/Construction/shared';

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', padding: '11px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
    <div style={{ width: '130px', color: '#94a3b8', flexShrink: 0 }}>{label}</div>
    <div style={{ color: '#1e293b', fontWeight: 600 }}>{children}</div>
  </div>
);

const RentalOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<RentalOrder | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('reserved');
  const [payStatus, setPayStatus] = useState<PaymentStatus>('paid');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    (async () => {
      const { data, error } = await orderApi.get(id!);
      if (error) alert('불러오기 오류', error);
      if (data) { setOrder(data); setOrderStatus(data.order_status); setPayStatus(data.payment_status); setMemo(data.memo || ''); }
      setLoading(false);
    })();
  }, [id, alert]);

  const save = async () => {
    setSaving(true);
    const { error } = await orderApi.updateStatus(id!, { order_status: orderStatus, payment_status: payStatus, memo });
    setSaving(false);
    if (error) alert('저장 오류', error); else navigate('/admin/dashboard/rental/orders');
  };

  if (loading) return <Spinner />;
  if (!order) return <div>주문을 찾을 수 없습니다.</div>;

  return (
    <div style={{ maxWidth: '720px' }}>
      <button style={{ ...btnGhost, marginBottom: '16px' }} onClick={() => navigate('/admin/dashboard/rental/orders')}><ArrowLeft size={16} /> 목록으로</button>

      <div style={card}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '20px' }}>렌탈 주문 상세 #{order.id}</h2>
        <Row label="상품">{order.product_name || '-'}{order.option_name ? ` · ${order.option_name}` : ''}</Row>
        <Row label="브랜드">{order.brand_name || '-'}</Row>
        <Row label="고객">{order.customer_name || '-'}</Row>
        <Row label="연락처">{order.customer_phone || '-'}</Row>
        <Row label="이메일">{order.customer_email || '-'}</Row>
        <Row label="대여 시작">{order.rental_start ? fmtDate(order.rental_start) : '-'}</Row>
        <Row label="대여 기간">{order.rental_days}일{order.rental_end ? ` (반납예정 ${fmtDate(order.rental_end)})` : ''}</Row>
        <Row label="수량">{order.quantity}개</Row>
        <Row label="일일 단가">{won(order.daily_price)}</Row>
        <Row label="보증금 / 배송비">{won(order.deposit)} / {won(order.delivery_fee)}</Row>
        <Row label="결제 총액"><span style={{ color: '#008b8b', fontWeight: 800 }}>{won(order.total_amount)}</span></Row>
        <Row label="결제수단/PG">{order.payment_method || '-'}{order.payment_id ? ` (${order.payment_id})` : ''}</Row>
        <Row label="주문일">{fmtDate(order.created_at)}</Row>
      </div>

      <div style={{ ...card, marginTop: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '16px' }}>상태 변경</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>대여 상태</label>
            <select style={{ ...(SELECT_STYLE as React.CSSProperties), width: '100%' }} value={orderStatus} onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}>
              {(['reserved', 'renting', 'returned', 'cancelled'] as OrderStatus[]).map((s) => <option key={s} value={s}>{ORDER_LABEL[s]}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>결제 상태</label>
            <select style={{ ...(SELECT_STYLE as React.CSSProperties), width: '100%' }} value={payStatus} onChange={(e) => setPayStatus(e.target.value as PaymentStatus)}>
              {(['paid', 'pending', 'cancelled', 'refunded'] as PaymentStatus[]).map((s) => <option key={s} value={s}>{PAYMENT_LABEL[s]}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>관리자 메모</label>
          <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={memo} onChange={(e) => setMemo(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
        </div>
      </div>
      {modal}
    </div>
  );
};

export default RentalOrderDetail;
