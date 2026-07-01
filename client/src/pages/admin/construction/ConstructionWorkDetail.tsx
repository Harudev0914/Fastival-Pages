import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { constructionWorkApi, constructionCompanyApi, WORK_STATUS_LABEL, WORK_STATUS_COLOR, type ConstructionCompany, type WorkStatus } from '../../../api/opsApi';
import { btnPrimary, btnGhost, useAdminModal, Spinner, DetailHead, StatusPill, FormSection, Row, TextField, TextareaField, SelectField, FormActions } from '../../../components/admin/shared';

const LIST = '/admin/dashboard/construction/works';

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
    if (!title.trim()) return alert('입력 필요', '업무명을 입력해주세요.');
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
    <div style={{ maxWidth: '820px' }}>
      <DetailHead
        title={isNew ? '시공 업무 등록' : '시공 업무 수정'}
        onBack={() => navigate(LIST)}
        badge={!isNew ? <StatusPill label={WORK_STATUS_LABEL[status]} color={WORK_STATUS_COLOR[status]} /> : undefined}
        right={<button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>}
      />

      <FormSection title="업무 개요">
        <Row><TextField label="업무명" required minWidth="100%" value={title} onChange={setTitle} placeholder="예: 강남 카페 인테리어 시공" /></Row>
        <Row>
          <SelectField label="배정 업체" value={companyId} onChange={onCompany}>
            <option value="">선택 안 함</option>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}{c.manager ? ` (${c.manager})` : ''}</option>)}
          </SelectField>
          <TextField label="담당자" value={assignee} onChange={setAssignee} placeholder="영업/현장 담당자" />
          <SelectField label="상태" value={status} onChange={(v) => setStatus(v as WorkStatus)}>
            {(Object.keys(WORK_STATUS_LABEL) as WorkStatus[]).map((k) => <option key={k} value={k}>{WORK_STATUS_LABEL[k]}</option>)}
          </SelectField>
        </Row>
      </FormSection>

      <FormSection title="고객 정보">
        <Row>
          <TextField label="고객명" value={customerName} onChange={setCustomerName} />
          <TextField label="고객 연락처" value={customerPhone} onChange={setCustomerPhone} placeholder="010-0000-0000" />
        </Row>
      </FormSection>

      <FormSection title="일정 · 금액">
        <Row>
          <TextField label="시작일" type="date" value={start} onChange={setStart} />
          <TextField label="종료일" type="date" value={end} onChange={setEnd} />
          <TextField label="금액(원)" type="number" value={amount} onChange={setAmount} />
        </Row>
      </FormSection>

      <FormSection title="연결 · 메모">
        <Row><TextField label="연결 시공 문의 ID (선택)" type="number" minWidth="100%" value={inquiryId} onChange={setInquiryId} placeholder="시공 문의 내역의 번호" /></Row>
        <TextareaField label="메모" value={memo} onChange={setMemo} />
        <FormActions>
          <button style={btnGhost} onClick={() => navigate(LIST)}>취소</button>
          <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
        </FormActions>
      </FormSection>
      {modal}
    </div>
  );
};

export default ConstructionWorkDetail;
