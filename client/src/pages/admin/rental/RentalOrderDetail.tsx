import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { orderApi, PAYMENT_LABEL, ORDER_LABEL, type RentalOrder, type OrderStatus, type PaymentStatus } from '../../../api/rentalApi';
import { inputStyle, labelStyle, btnPrimary, btnGhost, useAdminModal, Spinner, fmtDate, DetailHead, StatusPill, FormSection, Row, SelectField, FormActions } from '../../../components/admin/shared';

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;

const InfoRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', padding: '11px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
    <div style={{ width: '130px', color: '#94a3b8', flexShrink: 0 }}>{label}</div>
    <div style={{ color: '#1e293b', fontWeight: 600 }}>{children}</div>
  </div>
);

const ORDER_COLOR: Record<OrderStatus, string> = { reserved: '#0891b2', renting: '#059669', returned: '#64748b', cancelled: '#dc2626' };

const LIST = '/admin/dashboard/rental/orders';

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
    if (error) alert('저장 오류', error); else alert('저장 완료', '저장되었습니다.', () => navigate(LIST));
  };

  if (loading) return <Spinner />;
  if (!order) return <div>주문을 찾을 수 없습니다.</div>;

  return (
    <div style={{ maxWidth: '720px' }}>
      <DetailHead
        title={`렌탈 주문 상세 #${order.id}`}
        onBack={() => navigate(LIST)}
        badge={<StatusPill label={ORDER_LABEL[order.order_status]} color={ORDER_COLOR[order.order_status]} />}
        right={<button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>}
      />

      <FormSection title="주문 정보">
        <InfoRow label="상품">{order.product_name || '-'}{order.option_name ? ` · ${order.option_name}` : ''}</InfoRow>
        <InfoRow label="브랜드">{order.brand_name || '-'}</InfoRow>
        <InfoRow label="고객">{order.customer_name || '-'}</InfoRow>
        <InfoRow label="연락처">{order.customer_phone || '-'}</InfoRow>
        <InfoRow label="이메일">{order.customer_email || '-'}</InfoRow>
        <InfoRow label="대여 시작">{order.rental_start ? fmtDate(order.rental_start) : '-'}</InfoRow>
        <InfoRow label="대여 기간">{order.rental_days}일{order.rental_end ? ` (반납예정 ${fmtDate(order.rental_end)})` : ''}</InfoRow>
        <InfoRow label="수량">{order.quantity}개</InfoRow>
        <InfoRow label="일일 단가">{won(order.daily_price)}</InfoRow>
        <InfoRow label="보증금 / 배송비">{won(order.deposit)} / {won(order.delivery_fee)}</InfoRow>
        <InfoRow label="결제 총액"><span style={{ color: '#008b8b', fontWeight: 800 }}>{won(order.total_amount)}</span></InfoRow>
        <InfoRow label="결제수단/PG">{order.payment_method || '-'}{order.payment_id ? ` (${order.payment_id})` : ''}</InfoRow>
        <InfoRow label="주문일">{fmtDate(order.created_at)}</InfoRow>
      </FormSection>

      <FormSection title="상태 변경">
        <Row>
          <SelectField label="대여 상태" value={orderStatus} onChange={(v) => setOrderStatus(v as OrderStatus)}>
            {(['reserved', 'renting', 'returned', 'cancelled'] as OrderStatus[]).map((s) => <option key={s} value={s}>{ORDER_LABEL[s]}</option>)}
          </SelectField>
          <SelectField label="결제 상태" value={payStatus} onChange={(v) => setPayStatus(v as PaymentStatus)}>
            {(['paid', 'pending', 'cancelled', 'refunded'] as PaymentStatus[]).map((s) => <option key={s} value={s}>{PAYMENT_LABEL[s]}</option>)}
          </SelectField>
        </Row>
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>관리자 메모</label>
          <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={memo} onChange={(e) => setMemo(e.target.value)} />
        </div>
        <FormActions>
          <button style={btnGhost} onClick={() => navigate(LIST)}>취소</button>
          <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
        </FormActions>
      </FormSection>
      {modal}
    </div>
  );
};

export default RentalOrderDetail;
