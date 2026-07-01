import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { termsApi, TERMS_TYPE_LABEL, type TermsType } from '../../../api/termsApi';
import ToggleButton from '../../../components/UI/ToggleButton';
import { labelStyle, btnPrimary, btnGhost, useAdminModal, Spinner, DetailHead, StatusPill, FormSection, Row, TextField, TextareaField, FormActions } from '../../../components/admin/shared';

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
      <DetailHead
        title={isNew ? `${label} 등록` : `${label} 수정`}
        onBack={() => navigate(listUrl)}
        badge={!isNew ? <StatusPill label={isActive ? '활성' : '비활성'} color={isActive ? '#059669' : '#94a3b8'} /> : undefined}
        right={<button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>}
      />

      <FormSection title="약관 정보">
        <Row><TextField label="제목" required minWidth="100%" value={title} onChange={setTitle} placeholder={label} /></Row>
        <Row>
          <TextField label="버전" minWidth="180px" value={version} onChange={setVersion} placeholder="예: v1.0" />
          <TextField label="시행일" type="date" minWidth="180px" value={effectiveDate} onChange={setEffectiveDate} />
        </Row>
      </FormSection>

      <FormSection title="약관 내용">
        <TextareaField label="약관 내용" required minHeight="360px" value={content} onChange={setContent} placeholder={`${label} 전문을 입력하세요.`} />
        <span style={{ display: 'block', marginTop: '6px', fontSize: '0.78rem', color: '#94a3b8' }}>줄바꿈은 그대로 반영됩니다.</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '18px', marginBottom: '4px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>활성화</label>
          <ToggleButton isOn={isActive} onToggle={() => setIsActive((v) => !v)} />
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>활성화된 약관 중 시행일이 가장 최신인 항목이 노출됩니다.</span>
        </div>
        <FormActions>
          <button style={btnGhost} onClick={() => navigate(listUrl)}>취소</button>
          <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
        </FormActions>
      </FormSection>
      {modal}
    </div>
  );
};

export default TermsDetail;
