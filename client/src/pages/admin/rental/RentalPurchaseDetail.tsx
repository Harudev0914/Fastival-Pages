import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Pause, X } from 'lucide-react';
import { purchaseApi, PURCHASE_STATUS_LABEL, type PurchaseInquiry, type PurchaseStatus } from '../../../api/rentalApi';
import { inputStyle, labelStyle, useAdminModal, Spinner, fmtDate, DetailHead, StatusPill, FormSection } from '../../../components/admin/shared';

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;

const InfoRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', padding: '11px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
    <div style={{ width: '120px', color: '#94a3b8', flexShrink: 0 }}>{label}</div>
    <div style={{ color: '#1e293b', fontWeight: 600, whiteSpace: 'pre-wrap' }}>{children}</div>
  </div>
);

const PURCHASE_STATUS_COLOR: Record<PurchaseStatus, string> = { pending: '#64748b', approved: '#059669', hold: '#d97706', rejected: '#dc2626' };

const LIST = '/admin/dashboard/rental/purchases';

const RentalPurchaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<PurchaseInquiry | null>(null);
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { element: modal, alert } = useAdminModal();

  const load = useCallback(async () => {
    const { data, error } = await purchaseApi.get(id!);
    if (error) alert('불러오기 오류', error);
    if (data) { setItem(data); setMemo(data.admin_memo || ''); }
    setLoading(false);
  }, [id, alert]);
  useEffect(() => { load(); }, [load]);

  const setStatus = async (status: PurchaseStatus) => {
    setSaving(true);
    const { error } = await purchaseApi.setStatus(id!, status, memo);
    setSaving(false);
    if (error) alert('처리 오류', error);
    else { alert('처리 완료', `'${PURCHASE_STATUS_LABEL[status]}' 처리되었습니다.`); load(); }
  };

  if (loading) return <Spinner />;
  if (!item) return <div>문의를 찾을 수 없습니다.</div>;

  const actBtn = (bg: string): React.CSSProperties => ({ display: 'inline-flex', alignItems: 'center', gap: '6px', background: bg, color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 18px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' });

  return (
    <div style={{ maxWidth: '760px' }}>
      <DetailHead
        title={`입점(중고매입) 문의 #${item.id}`}
        onBack={() => navigate(LIST)}
        badge={<StatusPill label={PURCHASE_STATUS_LABEL[item.status]} color={PURCHASE_STATUS_COLOR[item.status]} />}
      />

      <FormSection title="문의 정보">
        <InfoRow label="품목">{item.product_name}</InfoRow>
        <InfoRow label="브랜드">{item.brand_name || '-'}</InfoRow>
        <InfoRow label="컨디션 등급"><strong>{item.condition_grade}급</strong></InfoRow>
        <InfoRow label="매입 희망가"><span style={{ color: '#008b8b', fontWeight: 800 }}>{won(item.desired_price)}</span></InfoRow>
        <InfoRow label="컨디션 설명">{item.description || '-'}</InfoRow>
        <InfoRow label="신청자">{item.applicant_name || '-'}</InfoRow>
        <InfoRow label="연락처">{item.applicant_phone || '-'}</InfoRow>
        <InfoRow label="이메일">{item.applicant_email || '-'}</InfoRow>
        <InfoRow label="접수일">{fmtDate(item.created_at)}</InfoRow>

        {item.images?.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <label style={labelStyle}>첨부 이미지</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {item.images.map((u, i) => <img key={i} src={u} alt="" style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />)}
            </div>
          </div>
        )}
      </FormSection>

      <FormSection title="심사 처리">
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>관리자 메모</label>
          <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="검토 내용 / 매입 결정가 등" />
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button style={actBtn('#059669')} onClick={() => setStatus('approved')} disabled={saving}><Check size={16} /> 승인</button>
          <button style={actBtn('#d97706')} onClick={() => setStatus('hold')} disabled={saving}><Pause size={16} /> 보류</button>
          <button style={actBtn('#dc2626')} onClick={() => setStatus('rejected')} disabled={saving}><X size={16} /> 반려</button>
        </div>
      </FormSection>
      {modal}
    </div>
  );
};

export default RentalPurchaseDetail;
