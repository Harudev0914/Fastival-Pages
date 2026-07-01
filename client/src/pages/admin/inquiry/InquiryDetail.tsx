import React, { useEffect, useState } from 'react';
import { Save, FileText } from 'lucide-react';
import { inquiryApi, type ConstructionInquiry, type InquiryStatus } from '../../../api/constructionApi';
import { card, btnPrimary, fmtDate, useAdminModal, Spinner, DetailHead, StatusPill, FormSection, SelectField, TextareaField, FormActions } from '../../../components/admin/shared';
import { STATUS_MAP } from './InquiryList';

const InquiryDetail: React.FC<{ id: number; onBack: () => void }> = ({ id, onBack }) => {
  const [item, setItem] = useState<ConstructionInquiry | null>(null);
  const [status, setStatus] = useState<InquiryStatus>('pending');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    (async () => {
      const { data, error } = await inquiryApi.get(id);
      if (error) alert('불러오기 오류', error);
      if (data) {
        setItem(data);
        setStatus(data.status);
        setMemo(data.memo || '');
      }
      setLoading(false);
    })();
  }, [id, alert]);

  const save = async () => {
    setSaving(true);
    const { error } = await inquiryApi.update(id, { status, memo });
    setSaving(false);
    if (error) alert('저장 오류', error);
    else alert('완료', '저장되었습니다.');
  };

  if (loading) return <Spinner />;
  if (!item) return (
    <div>
      <DetailHead title="시공 문의 상세" onBack={onBack} />
      <div style={card}>문의 내역을 찾을 수 없습니다.</div>
    </div>
  );

  const cur = STATUS_MAP[status];
  const info: [string, string | null][] = [['이름', item.name], ['연락처', item.phone], ['이메일', item.email]];

  return (
    <div style={{ maxWidth: '840px' }}>
      <DetailHead
        title="시공 문의 상세"
        onBack={onBack}
        badge={<StatusPill label={cur.label} color={cur.color} />}
        right={<button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>}
      />

      <FormSection title="신청자 정보">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {info.map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>{k}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>{v || '-'}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px', background: item.privacy_agree ? '#ecfdf5' : '#fef2f2', color: item.privacy_agree ? '#059669' : '#dc2626' }}>
            개인정보 동의 {item.privacy_agree ? '✓' : '✕'}
          </span>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px', background: item.marketing_agree ? '#ecfdf5' : '#f1f5f9', color: item.marketing_agree ? '#059669' : '#94a3b8' }}>
            마케팅 동의 {item.marketing_agree ? '✓' : '✕'}
          </span>
        </div>
        <div style={{ marginTop: '12px', display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.8rem', color: '#64748b' }}>
          <span>신청일: {fmtDate(item.created_at)}</span>
          <span>수정일: {fmtDate(item.updated_at)}</span>
          <span>수정자: {item.updated_by || '-'}</span>
          {item.file_name && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#008b8b', fontWeight: 600 }}><FileText size={14} /> {item.file_name}</span>}
        </div>
      </FormSection>

      <FormSection title="문의 응답">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {(item.answers || []).map((qa, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4px', padding: '14px 0', borderBottom: i < item.answers.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Q. {qa.question}</div>
              <div style={{ fontSize: '0.92rem', color: qa.answer === '건너뜀' ? '#94a3b8' : '#1e293b' }}>A. {qa.answer}</div>
            </div>
          ))}
          {(!item.answers || item.answers.length === 0) && <div style={{ color: '#94a3b8' }}>응답 데이터가 없습니다.</div>}
        </div>
      </FormSection>

      <FormSection title="처리 상태">
        <div style={{ maxWidth: '240px' }}>
          <SelectField label="답변 상태" value={status} onChange={(v) => setStatus(v as InquiryStatus)}>
            <option value="pending">대기중</option>
            <option value="replied">답변완료</option>
            <option value="hold">보류</option>
          </SelectField>
        </div>
        <div style={{ marginTop: '4px' }}>
          <TextareaField label="관리자 메모" value={memo} onChange={setMemo} placeholder="내부 메모(선택)" />
        </div>
        <FormActions>
          <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
        </FormActions>
      </FormSection>
      {modal}
    </div>
  );
};

export default InquiryDetail;
