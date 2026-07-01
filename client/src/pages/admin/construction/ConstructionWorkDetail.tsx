import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { constructionWorkApi, constructionCompanyApi, WORK_STATUS_LABEL, type ConstructionCompany, type WorkStatus } from '../../../api/opsApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import { card, inputStyle, labelStyle, btnPrimary, btnGhost, useAdminModal, Spinner } from '../../../components/admin/shared';

const LIST = '/admin/dashboard/construction/works';
const sel = SELECT_STYLE as React.CSSProperties;

const ConstructionWorkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [companies, setCompanies] = useState<ConstructionCompany[]>([]);
  const [title, setTitle] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [companyId, setCompanyId] = useState<number | ''>('');
  const [assignee, setAssignee] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<WorkStatus>('pending');
  const [memo, setMemo] = useState('');
  const [inquiryId, setInquiryId] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    (async () => {
      const { data: cs } = await constructionCompanyApi.listActive();
      setCompanies(cs || []);
      if (!isNew) {
        const { data, error } = await constructionWorkApi.get(id!);
        if (error) alert('불러오기 오류', error);
        if (data) {
          setTitle(data.title); setCustomerName(data.customer_name || ''); setCustomerPhone(data.customer_phone || '');
          setCompanyId(data.company_id ?? ''); setAssignee(data.assignee || ''); setStart(data.scheduled_start || ''); setEnd(data.scheduled_end || '');
          setAmount(data.amount != null ? String(data.amount) : ''); setStatus(data.status); setMemo(data.memo || ''); setInquiryId(data.inquiry_id != null ? String(data.inquiry_id) : '');
        }
      }
      setLoading(false);
    })();
  }, [id, isNew, alert]);

  const onCompany = (v: string) => {
    const cid = v ? Number(v) : '';
    setCompanyId(cid);
    const c = companies.find((x) => x.id === cid);
    if (c && !assignee) setAssignee(c.manager || ''); // 담당자 미입력 시 업체 담당자 자동
  };

  const save = async () => {
    setSaving(true);
    const c = companies.find((x) => x.id === companyId);
    const input = {
      inquiry_id: inquiryId ? Number(inquiryId) : null,
      title, customer_name: customerName, customer_phone: customerPhone,
      company_id: companyId || null, company_name: c?.name || null, assignee,
      scheduled_start: start || null, scheduled_end: end || null,
      amount: amount ? Number(amount) : null, status, memo,
    };
    const { error } = isNew ? await constructionWorkApi.create(input) : await constructionWorkApi.update(id!, input);
    setSaving(false);
    if (error) alert('저장 오류', error); else alert('저장 완료', '저장되었습니다.', () => navigate(LIST));
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '720px' }}>
      <button style={{ ...btnGhost, marginBottom: '16px' }} onClick={() => navigate(LIST)}><ArrowLeft size={16} /> 목록으로</button>
      <div style={card}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '24px' }}>{isNew ? '시공 업무 등록' : '시공 업무 수정'}</h2>

        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>업무명 *</label>
          <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 강남 카페 인테리어 시공" />
        </div>
        <div style={{ display: 'flex', gap: '14px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px' }}><label style={labelStyle}>고객명</label><input style={inputStyle} value={customerName} onChange={(e) => setCustomerName(e.target.value)} /></div>
          <div style={{ flex: 1, minWidth: '180px' }}><label style={labelStyle}>고객 연락처</label><input style={inputStyle} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="010-0000-0000" /></div>
        </div>
        <div style={{ display: 'flex', gap: '14px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={labelStyle}>배정 업체</label>
            <select style={{ ...sel, width: '100%' }} value={companyId} onChange={(e) => onCompany(e.target.value)}>
              <option value="">선택 안 함</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}{c.manager ? ` (${c.manager})` : ''}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '180px' }}><label style={labelStyle}>담당자</label><input style={inputStyle} value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="영업/현장 담당자" /></div>
        </div>
        <div style={{ display: 'flex', gap: '14px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '160px' }}><label style={labelStyle}>시작일</label><input type="date" style={inputStyle} value={start} onChange={(e) => setStart(e.target.value)} /></div>
          <div style={{ flex: 1, minWidth: '160px' }}><label style={labelStyle}>종료일</label><input type="date" style={inputStyle} value={end} onChange={(e) => setEnd(e.target.value)} /></div>
        </div>
        <div style={{ display: 'flex', gap: '14px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '160px' }}><label style={labelStyle}>금액(원)</label><input type="number" min={0} style={inputStyle} value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <label style={labelStyle}>상태</label>
            <select style={{ ...sel, width: '100%' }} value={status} onChange={(e) => setStatus(e.target.value as WorkStatus)}>
              {(Object.keys(WORK_STATUS_LABEL) as WorkStatus[]).map((k) => <option key={k} value={k}>{WORK_STATUS_LABEL[k]}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>연결 시공 문의 ID (선택)</label>
          <input type="number" min={0} style={inputStyle} value={inquiryId} onChange={(e) => setInquiryId(e.target.value)} placeholder="시공 문의 내역의 번호" />
        </div>
        <div style={{ marginBottom: '28px' }}>
          <label style={labelStyle}>메모</label>
          <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} value={memo} onChange={(e) => setMemo(e.target.value)} />
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

export default ConstructionWorkDetail;
