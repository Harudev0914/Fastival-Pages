import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X, Download, Percent } from 'lucide-react';
import { estimateApi, ESTIMATE_TYPE_LABEL, ESTIMATE_STATUS_LABEL, type Estimate, type EstimateItem, type EstimateType, type EstimateStatus } from '../../../api/opsApi';
import { companyApi, type CompanyInfo } from '../../../api/companyApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import { card, inputStyle, labelStyle, btnPrimary, btnGhost, useAdminModal, Spinner } from '../../../components/admin/shared';
import EstimateDocument from './EstimateDocument';

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;
const sel = SELECT_STYLE as React.CSSProperties;
const emptyRow = (): EstimateItem => ({ name: '', spec: '', unit: '', qty: 1, unit_price: 0, amount: 0 });
const DEFAULT_TERMS = `1. 본 견적서의 유효기간은 발행일로부터 30일이며, 유효기간 경과 후에는 견적 조건이 변경될 수 있습니다.
2. 상기 금액은 부가가치세(VAT)가 포함된 금액입니다.
3. 대금 지급 조건: 계약금 30% / 중도금 40% / 잔금 30% (별도 합의 시 그에 따릅니다).
4. 현장 여건, 자재 수급, 사양 변경 등으로 인하여 금액 및 일정은 상호 협의하여 조정될 수 있습니다.
5. 본 견적서에 명시되지 아니한 항목은 별도 협의하며, 정식 계약 체결 시 계약서의 내용이 우선합니다.`;

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
  const [issueDate, setIssueDate] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [status, setStatus] = useState<EstimateStatus>('draft');
  const [memo, setMemo] = useState('');
  const [terms, setTerms] = useState(isNew ? DEFAULT_TERMS : '');
  const [estimateNo, setEstimateNo] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState('');
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const paperRef = useRef<HTMLDivElement>(null);
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    companyApi.get().then(({ data }) => setCompany(data));
    if (isNew) return;
    (async () => {
      const { data, error } = await estimateApi.get(id!);
      if (error) alert('불러오기 오류', error);
      if (data) {
        setTitle(data.title); setCName(data.customer_name || ''); setCPhone(data.customer_phone || ''); setCEmail(data.customer_email || '');
        setItems(data.items?.length ? data.items : [emptyRow()]); setDiscount(String(data.discount || 0)); setTax(String(data.tax || 0));
        setIssueDate(data.issue_date || ''); setValidUntil(data.valid_until || ''); setStatus(data.status); setMemo(data.memo || ''); setTerms(data.terms || '');
        setEstimateNo(data.estimate_no); setCreatedAt(data.created_at || '');
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
  const autoVat = () => setTax(String(Math.round((subtotal - (Number(discount) || 0)) * 0.1)));

  // 프리뷰/PDF 공용 견적서 객체
  const doc = useMemo<Estimate>(() => ({
    id: Number(isNew ? 0 : id), type, estimate_no: estimateNo, title,
    customer_name: cName, customer_phone: cPhone, customer_email: cEmail,
    items: items.filter((r) => r.name.trim() || r.amount), subtotal, discount: Number(discount) || 0, tax: Number(tax) || 0, total,
    issue_date: issueDate || null, valid_until: validUntil || null, status, memo, terms,
    created_at: createdAt, updated_at: null, created_by: null, updated_by: null,
  }), [isNew, id, type, estimateNo, title, cName, cPhone, cEmail, items, subtotal, discount, tax, total, issueDate, validUntil, status, memo, terms, createdAt]);

  const save = async () => {
    if (!title.trim()) return alert('입력 필요', '견적서 제목을 입력해주세요.');
    setSaving(true);
    const input = {
      type, title, customer_name: cName, customer_phone: cPhone, customer_email: cEmail,
      items: items.filter((r) => r.name.trim() || r.amount), subtotal, discount: Number(discount) || 0, tax: Number(tax) || 0, total,
      issue_date: issueDate || null, valid_until: validUntil || null, status, memo, terms,
    };
    const { error } = isNew ? await estimateApi.create(input) : await estimateApi.update(id!, input);
    setSaving(false);
    if (error) alert('저장 오류', error); else alert('저장 완료', '저장되었습니다.', () => navigate(LIST));
  };

  // 문서 노드를 새 창으로 열어 인쇄/PDF (계약서 빌더와 동일 방식)
  const downloadPdf = () => {
    const node = paperRef.current;
    if (!node) return;
    const w = window.open('', '_blank', 'width=900,height=1200');
    if (!w) { alert('팝업 차단', '브라우저 팝업 차단을 해제한 후 다시 시도해주세요.'); return; }
    w.document.write(`<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>견적서 ${estimateNo || ''}</title>
      <style>@page { size: A4; margin: 14mm; } body { margin: 0; } #estimate-paper { max-width: none !important; padding: 0 !important; box-shadow: none !important; }</style>
      </head><body>${node.outerHTML}
      <scr${''}ipt>window.onload=function(){setTimeout(function(){window.print();},250);};</scr${''}ipt>
      </body></html>`);
    w.document.close();
  };

  if (loading) return <Spinner />;
  const cell: React.CSSProperties = { ...inputStyle, padding: '9px 10px' };

  return (
    <div>
      <style>{`@media (max-width: 1080px){ .est-editor{ grid-template-columns: 1fr !important; } .est-preview{ position: static !important; } }`}</style>

      {/* 상단 액션 바 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <button style={btnGhost} onClick={() => navigate(LIST)}><ArrowLeft size={16} /> 목록으로</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {estimateNo && <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#008b8b', background: '#e0f2f1', padding: '6px 12px', borderRadius: '999px' }}>견적번호 {estimateNo}</span>}
          <button style={btnGhost} onClick={downloadPdf}><Download size={16} /> PDF 다운로드</button>
          <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
        </div>
      </div>

      <div className="est-editor" style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 440px) 1fr', gap: '20px', alignItems: 'start' }}>
        {/* 좌: 입력 폼 */}
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={card}>
            <h3 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>문서 정보</h3>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>제목 *</label>
              <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`예: ${label} - OO프로젝트`} />
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '120px' }}><label style={labelStyle}>발행일</label><input type="date" style={inputStyle} value={issueDate} onChange={(e) => setIssueDate(e.target.value)} /></div>
              <div style={{ flex: 1, minWidth: '120px' }}><label style={labelStyle}>유효기간</label><input type="date" style={inputStyle} value={validUntil} onChange={(e) => setValidUntil(e.target.value)} /></div>
            </div>
            <div style={{ marginTop: '14px' }}>
              <label style={labelStyle}>상태</label>
              <select style={{ ...sel, width: '100%' }} value={status} onChange={(e) => setStatus(e.target.value as EstimateStatus)}>
                {(Object.keys(ESTIMATE_STATUS_LABEL) as EstimateStatus[]).map((k) => <option key={k} value={k}>{ESTIMATE_STATUS_LABEL[k]}</option>)}
              </select>
            </div>
          </div>

          <div style={card}>
            <h3 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>공급받는자</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div><label style={labelStyle}>고객명</label><input style={inputStyle} value={cName} onChange={(e) => setCName(e.target.value)} /></div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '140px' }}><label style={labelStyle}>연락처</label><input style={inputStyle} value={cPhone} onChange={(e) => setCPhone(e.target.value)} /></div>
                <div style={{ flex: 1, minWidth: '140px' }}><label style={labelStyle}>이메일</label><input style={inputStyle} value={cEmail} onChange={(e) => setCEmail(e.target.value)} /></div>
              </div>
            </div>
          </div>

          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>견적 품목</h3>
              <button onClick={() => setItems((arr) => [...arr, emptyRow()])} style={{ ...btnGhost, padding: '6px 12px', fontSize: '0.82rem' }}><Plus size={14} /> 품목 추가</button>
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              {items.map((r, i) => (
                <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px', display: 'grid', gap: '8px', background: '#fafcfd' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input style={{ ...cell, flex: 1 }} value={r.name} onChange={(e) => setRow(i, { name: e.target.value })} placeholder="품목명" />
                    <button onClick={() => setItems((arr) => arr.length > 1 ? arr.filter((_, idx) => idx !== i) : arr)} style={{ background: '#fef2f2', border: 'none', borderRadius: '8px', width: '38px', cursor: 'pointer', flexShrink: 0 }}><X size={14} color="#dc2626" /></button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 110px', gap: '8px' }}>
                    <input style={cell} value={r.spec || ''} onChange={(e) => setRow(i, { spec: e.target.value })} placeholder="규격" />
                    <input style={cell} value={r.unit || ''} onChange={(e) => setRow(i, { unit: e.target.value })} placeholder="단위" />
                    <input type="number" min={0} style={{ ...cell, textAlign: 'center' }} value={r.qty} onChange={(e) => setRow(i, { qty: Number(e.target.value) })} placeholder="수량" />
                    <input type="number" min={0} style={{ ...cell, textAlign: 'right' }} value={r.unit_price} onChange={(e) => setRow(i, { unit_price: Number(e.target.value) })} placeholder="단가" />
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#008b8b', fontWeight: 700 }}>금액 {won(r.amount)}</div>
                </div>
              ))}
            </div>

            {/* 합계 */}
            <div style={{ marginTop: '14px', borderTop: '1px solid #e2e8f0', paddingTop: '14px', display: 'grid', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#475569' }}><span>소계</span><span style={{ fontWeight: 700 }}>{won(subtotal)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#475569' }}><span>할인</span><input type="number" min={0} style={{ ...cell, width: '150px', textAlign: 'right' }} value={discount} onChange={(e) => setDiscount(e.target.value)} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#475569' }}>
                <button type="button" onClick={autoVat} title="공급가의 10%를 부가세로 계산" style={{ ...btnGhost, padding: '5px 10px', fontSize: '0.76rem', gap: '4px' }}><Percent size={12} /> VAT 10%</button>
                <input type="number" min={0} style={{ ...cell, width: '150px', textAlign: 'right' }} value={tax} onChange={(e) => setTax(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, color: '#008b8b', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}><span>총액</span><span>{won(total)}</span></div>
            </div>
          </div>

          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>계약 조건 / 특약사항</h3>
              <button onClick={() => setTerms(DEFAULT_TERMS)} style={{ ...btnGhost, padding: '5px 10px', fontSize: '0.76rem' }}>기본 문구</button>
            </div>
            <textarea style={{ ...inputStyle, minHeight: '120px', resize: 'vertical', lineHeight: 1.7 }} value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="지급 조건, 납기, 하자보증 등 계약 조건을 입력하세요." />
            <div style={{ marginTop: '14px' }}>
              <label style={labelStyle}>비고</label>
              <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="특이사항 등" />
            </div>
          </div>
        </div>

        {/* 우: 계약서형 문서 프리뷰 (스크롤 시 고정) */}
        <div className="est-preview" style={{ position: 'sticky', top: '8px', background: '#eef2f7', borderRadius: '12px', padding: '20px', overflow: 'auto', maxHeight: 'calc(100vh - 40px)' }}>
          <div style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
            <EstimateDocument ref={paperRef} est={doc} typeLabel={label} company={company} />
          </div>
        </div>
      </div>
      {modal}
    </div>
  );
};

export default EstimateDetail;
