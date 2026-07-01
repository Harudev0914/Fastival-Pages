import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { brandApi } from '../../../api/rentalApi';
import ToggleButton from '../../../components/UI/ToggleButton';
import ImageUploader from '../../../components/UI/ImageUploader';
import { labelStyle, btnPrimary, btnGhost, useAdminModal, Spinner, DetailHead, StatusPill, FormSection, Row, Field, TextField, TextareaField, FormActions } from '../../../components/admin/shared';

const LIST = '/admin/dashboard/rental/brands';

const RentalBrandDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data, error } = await brandApi.get(id!);
      if (error) alert('불러오기 오류', error);
      if (data) { setName(data.name); setLogoUrl(data.logo_url || ''); setDescription(data.description || ''); setIsActive(data.is_active); }
      setLoading(false);
    })();
  }, [id, isNew, alert]);

  const save = async () => {
    setSaving(true);
    const input = { name, logo_url: logoUrl, description, is_active: isActive };
    const { error } = isNew ? await brandApi.create(input) : await brandApi.update(id!, input);
    setSaving(false);
    if (error) alert('저장 오류', error); else alert('저장 완료', '저장되었습니다.', () => navigate(LIST));
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '680px' }}>
      <DetailHead
        title={isNew ? '브랜드 등록' : '브랜드 수정'}
        onBack={() => navigate(LIST)}
        badge={!isNew ? <StatusPill label={isActive ? '활성' : '비활성'} color={isActive ? '#059669' : '#94a3b8'} /> : undefined}
        right={<button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>}
      />

      <FormSection title="브랜드 정보">
        <Row><TextField label="브랜드명" required minWidth="100%" value={name} onChange={setName} placeholder="예: 요기보" /></Row>
        <Field label="로고 / 대표 이미지" minWidth="100%">
          <ImageUploader value={logoUrl ? [logoUrl] : []} onChange={(urls) => setLogoUrl(urls[0] || '')} folder="rental-brand" multiple={false} max={1} />
        </Field>
        <TextareaField label="브랜드 설명" value={description} onChange={setDescription} placeholder="브랜드 소개" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>활성화</label>
          <ToggleButton isOn={isActive} onToggle={() => setIsActive((v) => !v)} />
        </div>
        <FormActions>
          <button style={btnGhost} onClick={() => navigate(LIST)}>취소</button>
          <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
        </FormActions>
      </FormSection>
      {modal}
    </div>
  );
};

export default RentalBrandDetail;
