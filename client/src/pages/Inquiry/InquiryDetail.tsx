import React, { useEffect, useState } from 'react';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { inquiryApi, type ConstructionInquiry, type InquiryStatus } from '../../api/constructionApi';
import { SELECT_STYLE } from '../../components/UI/StyledSelect';
import { card, inputStyle, labelStyle, btnPrimary, btnGhost, fmtDate, useAdminModal, Spinner } from '../Content/Construction/shared';
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
      <button style={{ ...btnGhost, marginBottom: '16px' }} onClick={onBack}><ArrowLeft size={16} /> 목록으로</button>
      <div style={card}>문의 내역을 찾을 수 없습니다.</div>
    </div>
  );

  const s = STATUS_MAP[item.status];
  const info: [string, string | null][] = [['이름', item.name], ['연락처', item.phone], ['이메일', item.email]];

  return (
    <div style={{ maxWidth: '820px' }}>
      <button style={{ ...btnGhost, marginBottom: '16px' }} onClick={onBack}><ArrowLeft size={16} /> 목록으로</button>

      {/* 신청자 정보 */}
      <div style={{ ...card, marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>신청자 정보</h2>
          <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700, backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.label}</span>
        </div>
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
      </div>

      {/* 질의/응답 */}
      <div style={{ ...card, marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '18px' }}>문의 응답</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {(item.answers || []).map((qa, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4px', padding: '14px 0', borderBottom: i < item.answers.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Q. {qa.question}</div>
              <div style={{ fontSize: '0.92rem', color: qa.answer === '건너뜀' ? '#94a3b8' : '#1e293b' }}>A. {qa.answer}</div>
            </div>
          ))}
          {(!item.answers || item.answers.length === 0) && <div style={{ color: '#94a3b8' }}>응답 데이터가 없습니다.</div>}
        </div>
      </div>

      {/* 상태 관리 */}
      <div style={card}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '18px' }}>처리 상태</h2>
        <div style={{ marginBottom: '16px', maxWidth: '220px' }}>
          <label style={labelStyle}>답변 상태</label>
          <select style={{ ...(SELECT_STYLE as React.CSSProperties), width: '100%' }} value={status} onChange={(e) => setStatus(e.target.value as InquiryStatus)}>
            <option value="pending">대기중</option>
            <option value="replied">답변완료</option>
            <option value="hold">보류</option>
          </select>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>관리자 메모</label>
          <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="내부 메모(선택)" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
        </div>
      </div>
      {modal}
    </div>
  );
};

export default InquiryDetail;
