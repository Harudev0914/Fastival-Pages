import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { shipmentApi, SHIPMENT_STATUS_LABEL, SHIPMENT_STATUS_COLOR, type ShipmentStatus } from '../../../api/rentalApi';
import { btnPrimary, btnGhost, useAdminModal, Spinner, DetailHead, StatusPill, FormSection, Row, TextField, TextareaField, SelectField, FormActions } from '../../../components/admin/shared';

const LIST = '/admin/dashboard/rental/shipments';

const RentalShipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [productName, setProductName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shipDate, setShipDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [trackingNo, setTrackingNo] = useState('');
  const [status, setStatus] = useState<ShipmentStatus>('preparing');
  const [orderId, setOrderId] = useState('');
  const [contractId, setContractId] = useState('');
  const [ownerUserId, setOwnerUserId] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data, error } = await shipmentApi.get(id!);
      if (error) alert('불러오기 오류', error);
      if (data) {
        setProductName(data.product_name); setBrandName(data.brand_name || ''); setQuantity(String(data.quantity ?? 1));
        setCustomerName(data.customer_name || ''); setCustomerPhone(data.customer_phone || '');
        setShipDate(data.ship_date || ''); setReturnDate(data.return_date || ''); setTrackingNo(data.tracking_no || '');
        setStatus(data.status); setOrderId(data.order_id != null ? String(data.order_id) : ''); setContractId(data.contract_id != null ? String(data.contract_id) : '');
        setOwnerUserId(data.owner_user_id || ''); setMemo(data.memo || '');
      }
      setLoading(false);
    })();
  }, [id, isNew, alert]);

  const save = async () => {
    if (!productName.trim()) return alert('입력 필요', '품목명을 입력해주세요.');
    setSaving(true);
    const input = {
      product_name: productName, brand_name: brandName, quantity: Number(quantity) || 1,
      customer_name: customerName, customer_phone: customerPhone,
      ship_date: shipDate || null, return_date: returnDate || null, tracking_no: trackingNo,
      status, order_id: orderId ? Number(orderId) : null, contract_id: contractId ? Number(contractId) : null,
      owner_user_id: ownerUserId || null, memo,
    };
    const { error } = isNew ? await shipmentApi.create(input) : await shipmentApi.update(id!, input);
    setSaving(false);
    if (error) alert('저장 오류', error); else alert('저장 완료', '저장되었습니다.', () => navigate(LIST));
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '820px' }}>
      <DetailHead
        title={isNew ? '출고 등록' : '출고 수정'}
        onBack={() => navigate(LIST)}
        badge={!isNew ? <StatusPill label={SHIPMENT_STATUS_LABEL[status]} color={SHIPMENT_STATUS_COLOR[status]} /> : undefined}
        right={<button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>}
      />

      <FormSection title="출고 품목">
        <Row>
          <TextField label="품목명" required flex={2} value={productName} onChange={setProductName} placeholder="예: 요기보 맥스" />
          <TextField label="브랜드" value={brandName} onChange={setBrandName} />
          <TextField label="수량" type="number" value={quantity} onChange={setQuantity} minWidth="90px" />
        </Row>
        <Row>
          <SelectField label="상태" value={status} onChange={(v) => setStatus(v as ShipmentStatus)}>
            {(Object.keys(SHIPMENT_STATUS_LABEL) as ShipmentStatus[]).map((k) => <option key={k} value={k}>{SHIPMENT_STATUS_LABEL[k]}</option>)}
          </SelectField>
          <TextField label="출고일" type="date" value={shipDate} onChange={setShipDate} />
          <TextField label="회수 예정일" type="date" value={returnDate} onChange={setReturnDate} />
        </Row>
        <Row><TextField label="송장/추적 번호" minWidth="100%" value={trackingNo} onChange={setTrackingNo} placeholder="택배사·송장번호 등" /></Row>
      </FormSection>

      <FormSection title="고객 · 마이페이지 노출">
        <Row>
          <TextField label="고객명" value={customerName} onChange={setCustomerName} />
          <TextField label="연락처" value={customerPhone} onChange={setCustomerPhone} placeholder="010-0000-0000" />
        </Row>
        <Row><TextField label="사용자 ID (UUID · 마이페이지 노출 대상)" minWidth="100%" value={ownerUserId} onChange={setOwnerUserId} placeholder="입력 시 해당 회원 마이페이지에 노출됩니다 (선택)" /></Row>
      </FormSection>

      <FormSection title="연결 · 메모">
        <Row>
          <TextField label="연결 주문 ID (선택)" type="number" value={orderId} onChange={setOrderId} />
          <TextField label="연결 계약서 ID (선택)" type="number" value={contractId} onChange={setContractId} />
        </Row>
        <TextareaField label="메모" value={memo} onChange={setMemo} placeholder="배송/설치 특이사항 등" />
        <FormActions>
          <button style={btnGhost} onClick={() => navigate(LIST)}>취소</button>
          <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
        </FormActions>
      </FormSection>
      {modal}
    </div>
  );
};

export default RentalShipmentDetail;
