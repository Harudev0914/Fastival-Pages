import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { estimateApi, ESTIMATE_TYPE_LABEL, ESTIMATE_STATUS_LABEL, type EstimateItem, type EstimateType, type EstimateStatus } from '../../../api/opsApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import { card, inputStyle, labelStyle, btnPrimary, btnGhost, useAdminModal, Spinner } from '../../../components/admin/shared';

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;
const sel = SELECT_STYLE as React.CSSProperties;
const emptyRow = (): EstimateItem => ({ name: '', qty: 1, unit_price: 0, amount: 0 });

const EstimateDetail: React.FC<{ type: EstimateType }> = ({ type }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const label = ESTIMATE_TYPE_LABEL[type];
  const LIST = `/admin/dashboard/estimates/${type}`;

  const [title, setTitle] = useState('');
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [items, setItems] = useState<EstimateItem[]>([emptyRow()]);
  const [discount, setDiscount] = useState('0');
  const [tax, setTax] = useState('0');
  const [validUntil, setValidUntil] = useState('');
  const [status, setStatus] = useState<EstimateStatus>('draft');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data, error } = await estimateApi.get(id!);
      if (error) alert('불러오기 오류', error);
      if (data) {
        setTitle(data.title); setCName(data.customer_name || ''); setCPhone(data.customer_phone || ''); setCEmail(data.customer_email || '');
        setItems(data.items?.length ? data.items : [emptyRow()]); setDiscount(String(data.discount || 0)); setTax(String(data.tax || 0));
        setValidUntil(data.valid_until || ''); setStatus(data.status); setMemo(data.memo || '');
      }
      setLoading(false);
    })();
  }, [id, isNew, alert]);

  const setRow = (i: number, patch: Partial<EstimateItem>) => setItems((arr) => arr.map((r, idx) => {
    if (idx !== i) return r;
    const next = { ...r, ...patch };
    next.amount = Math.round((Number(next.qty) || 0) * (Number(next.unit_price) || 0));
    return next;
  }));

  const subtotal = useMemo(() => items.reduce((s, r) => s + (Number(r.amount) || 0), 0), [items]);
  const total = Math.max(0, subtotal - (Number(discount) || 0) + (Number(tax) || 0));

  const save = async () => {
    if (!title.trim()) return alert('입력 필요', '견적서 제목을 입력해주세요.');
    setSaving(true);
    const cleanItems = items.filter((r) => r.name.trim() || r.amount);
    const input = {
      type, title, customer_name: cName, customer_phone: cPhone, customer_email: cEmail,
      items: cleanItems, subtotal, discount: Number(discount) || 0, tax: Number(tax) || 0, total,
      valid_until: validUntil || null, status, memo,
    };
    const { error } = isNew ? await estimateApi.create(input) : await estimateApi.update(id!, input);
    setSaving(false);
    if (error) alert('저장 오류', error); else alert('저장 완료', '저장되었습니다.', () => navigate(LIST));
  };

  if (loading) return <Spinner />;
  const cell: React.CSSProperties = { ...inputStyle, padding: '9px 10px' };

  return (
    <div style={{ maxWidth: '860px' }}>
      <button style={{ ...btnGhost, marginBottom: '16px' }} onClick={() => navigate(LIST)}><ArrowLeft size={16} /> 목록으로</button>
      <div style={card}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '24px' }}>{isNew ? `${label} 작성` : `${label} 수정`}</h2>

        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>제목 *</label>
          <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`예: ${label} - OO프로젝트`} />
        </div>
        <div style={{ display: 'flex', gap: '14px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '160px' }}><label style={labelStyle}>고객명</label><input style={inputStyle} value={cName} onChange={(e) => setCName(e.target.value)} /></div>
          <div style={{ flex: 1, minWidth: '160px' }}><label style={labelStyle}>연락처</label><input style={inputStyle} value={cPhone} onChange={(e) => setCPhone(e.target.value)} /></div>
          <div style={{ flex: 1, minWidth: '160px' }}><label style={labelStyle}>이메일</label><input style={inputStyle} value={cEmail} onChange={(e) => setCEmail(e.target.value)} /></div>
        </div>

        {/* 품목 */}
        <label style={labelStyle}>견적 품목</label>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 130px 130px 40px', gap: '8px', background: '#f8fafc', padding: '10px 12px', fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>
            <span>품목</span><span style={{ textAlign: 'center' }}>수량</span><span style={{ textAlign: 'right' }}>단가</span><span style={{ textAlign: 'right' }}>금액</span><span />
          </div>
          {items.map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 130px 130px 40px', gap: '8px', padding: '8px 12px', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
              <input style={cell} value={r.name} onChange={(e) => setRow(i, { name: e.target.value })} placeholder="품목명" />
              <input type="number" min={0} style={{ ...cell, textAlign: 'center' }} value={r.qty} onChange={(e) => setRow(i, { qty: Number(e.target.value) })} />
              <input type="number" min={0} style={{ ...cell, textAlign: 'right' }} value={r.unit_price} onChange={(e) => setRow(i, { unit_price: Number(e.target.value) })} />
              <span style={{ textAlign: 'right', fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{won(r.amount)}</span>
              <button onClick={() => setItems((arr) => arr.length > 1 ? arr.filter((_, idx) => idx !== i) : arr)} style={{ background: '#fef2f2', border: 'none', borderRadius: '6px', height: '32px', cursor: 'pointer' }}><X size={14} color="#dc2626" /></button>
            </div>
          ))}
        </div>
        <button onClick={() => setItems((arr) => [...arr, emptyRow()])} style={{ ...btnGhost, marginBottom: '18px' }}><Plus size={14} /> 품목 추가</button>

        {/* 합계 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <div style={{ width: '320px', display: 'grid', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#475569' }}><span>소계</span><span style={{ fontWeight: 700 }}>{won(subtotal)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#475569' }}><span>할인</span><input type="number" min={0} style={{ ...cell, width: '140px', textAlign: 'right' }} value={discount} onChange={(e) => setDiscount(e.target.value)} /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#475569' }}><span>부가세/기타</span><input type="number" min={0} style={{ ...cell, width: '140px', textAlign: 'right' }} value={tax} onChange={(e) => setTax(e.target.value)} /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, color: '#008b8b', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}><span>총액</span><span>{won(total)}</span></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '160px' }}><label style={labelStyle}>유효기간</label><input type="date" style={inputStyle} value={validUntil} onChange={(e) => setValidUntil(e.target.value)} /></div>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <label style={labelStyle}>상태</label>
            <select style={{ ...sel, width: '100%' }} value={status} onChange={(e) => setStatus(e.target.value as EstimateStatus)}>
              {(Object.keys(ESTIMATE_STATUS_LABEL) as EstimateStatus[]).map((k) => <option key={k} value={k}>{ESTIMATE_STATUS_LABEL[k]}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: '28px' }}>
          <label style={labelStyle}>메모</label>
          <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="특이사항, 조건 등" />
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button style={btnGhost} onClick={() => navigate(LIST)}>취소</button>
          <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
        </div>
      </div>
      {modal}
    </div>
  );
};

export default EstimateDetail;
