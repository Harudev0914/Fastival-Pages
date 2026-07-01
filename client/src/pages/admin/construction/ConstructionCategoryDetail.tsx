import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { categoryApi } from '../../../api/constructionApi';
import ToggleButton from '../../../components/UI/ToggleButton';
import ImageUploader from '../../../components/UI/ImageUploader';
import { labelStyle, btnPrimary, btnGhost, useAdminModal, Spinner, DetailHead, StatusPill, FormSection, Row, TextField, TextareaField, FormActions } from '../../../components/admin/shared';

const LIST = '/admin/dashboard/construction/categories';

const ConstructionCategoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data, error } = await categoryApi.get(id!);
      if (error) alert('불러오기 오류', error);
      if (data) { setName(data.name || ''); setDescription(data.description || ''); setImageUrl(data.image_url || ''); setIsActive(data.is_active); }
      setLoading(false);
    })();
  }, [id, isNew, alert]);

  const save = async () => {
    if (!name.trim()) { alert('확인', '카테고리명을 입력해주세요.'); return; }
    setSaving(true);
    const input = { name, description, image_url: imageUrl, is_active: isActive };
    const { error } = isNew ? await categoryApi.create(input) : await categoryApi.update(id!, input);
    setSaving(false);
    if (error) alert('저장 오류', error);
    else alert('저장 완료', '저장되었습니다.', () => navigate(LIST));
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '720px' }}>
      <DetailHead
        title={isNew ? '카테고리 등록' : '카테고리 수정'}
        onBack={() => navigate(LIST)}
        badge={!isNew ? <StatusPill label={isActive ? '활성' : '비활성'} color={isActive ? '#059669' : '#94a3b8'} /> : undefined}
        right={<button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>}
      />

      <FormSection title="카테고리 정보">
        <Row><TextField label="카테고리명" required minWidth="100%" value={name} onChange={setName} placeholder="예: 카페" /></Row>

        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>카테고리 이미지 <span style={{ fontWeight: 400, color: '#94a3b8' }}>(포트폴리오 탭 노출, 없으면 아이콘)</span></label>
          <ImageUploader value={imageUrl ? [imageUrl] : []} onChange={(urls) => setImageUrl(urls[0] || '')} folder="construction-category" multiple={false} max={1} />
        </div>

        <TextareaField label="설명" value={description} onChange={setDescription} placeholder="카테고리 설명(선택)" />

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

export default ConstructionCategoryDetail;
