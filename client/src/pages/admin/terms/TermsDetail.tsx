import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { termsApi, TERMS_TYPE_LABEL, type TermsType } from '../../../api/termsApi';
import ToggleButton from '../../../components/UI/ToggleButton';
import { card, inputStyle, labelStyle, btnPrimary, btnGhost, useAdminModal, Spinner } from '../../../components/admin/shared';

const TermsDetail: React.FC<{ type: TermsType }> = ({ type }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const label = TERMS_TYPE_LABEL[type];
  const listUrl = `/admin/dashboard/terms/${type}`;

  const [title, setTitle] = useState(label);
  const [version, setVersion] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [content, setContent] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data, error } = await termsApi.get(id!);
      if (error) alert('불러오기 오류', error);
      if (data) {
        setTitle(data.title); setVersion(data.version || ''); setEffectiveDate(data.effective_date || '');
        setContent(data.content || ''); setIsActive(data.is_active);
      }
      setLoading(false);
    })();
  }, [id, isNew, alert]);

  const save = async () => {
    setSaving(true);
    const input = { type, title, version, effective_date: effectiveDate || null, content, is_active: isActive };
    const { error } = isNew ? await termsApi.create(input) : await termsApi.update(id!, input);
    setSaving(false);
    if (error) alert('저장 오류', error); else alert('저장 완료', '저장되었습니다.', () => navigate(listUrl));
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '820px' }}>
      <button style={{ ...btnGhost, marginBottom: '16px' }} onClick={() => navigate(listUrl)}><ArrowLeft size={16} /> 목록으로</button>
      <div style={card}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '24px' }}>{isNew ? `${label} 등록` : `${label} 수정`}</h2>

        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>제목 *</label>
          <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={label} />
        </div>
        <div style={{ display: 'flex', gap: '14px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={labelStyle}>버전</label>
            <input style={inputStyle} value={version} onChange={(e) => setVersion(e.target.value)} placeholder="예: v1.0" />
          </div>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={labelStyle}>시행일</label>
            <input type="date" style={inputStyle} value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
          </div>
        </div>
        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>약관 내용 *</label>
          <textarea style={{ ...inputStyle, minHeight: '360px', resize: 'vertical', lineHeight: 1.6, fontFamily: 'inherit' }} value={content} onChange={(e) => setContent(e.target.value)} placeholder={`${label} 전문을 입력하세요.`} />
          <span style={{ display: 'block', marginTop: '6px', fontSize: '0.78rem', color: '#94a3b8' }}>줄바꿈은 그대로 반영됩니다.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>활성화</label>
          <ToggleButton isOn={isActive} onToggle={() => setIsActive((v) => !v)} />
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>활성화된 약관 중 시행일이 가장 최신인 항목이 노출됩니다.</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button style={btnGhost} onClick={() => navigate(listUrl)}>취소</button>
          <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
        </div>
      </div>
      {modal}
    </div>
  );
};

export default TermsDetail;
