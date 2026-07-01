import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { rentalCategoryApi, brandApi } from '../../../api/rentalApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import ToggleButton from '../../../components/UI/ToggleButton';
import ImageUploader from '../../../components/UI/ImageUploader';
import { labelStyle, btnPrimary, btnGhost, useAdminModal, Spinner, DetailHead, StatusPill, FormSection, Row, Field, TextField, TextareaField, FormActions } from '../../../components/admin/shared';

const RentalCategoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isNew = id === 'new';

  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [brandId, setBrandId] = useState<number | ''>('');
  const [parentId, setParentId] = useState<number | null>(params.get('parent') ? Number(params.get('parent')) : null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { element: modal, alert } = useAdminModal();

  const backUrl = parentId ? `/admin/dashboard/rental/categories/sub/${parentId}` : '/admin/dashboard/rental/categories';

  useEffect(() => {
    (async () => {
      const { data: b } = await brandApi.listActive();
      const blist = (b || []) as { id: number; name: string }[];
      setBrands(blist);
      if (!isNew) {
        const { data, error } = await rentalCategoryApi.get(id!);
        if (error) alert('불러오기 오류', error);
        if (data) { setBrandId(data.brand_id ?? ''); setParentId(data.parent_id ?? null); setName(data.name); setDescription(data.description || ''); setImageUrl(data.image_url || ''); setIsActive(data.is_active); }
      } else {
        const bp = params.get('brand');
        if (bp) setBrandId(Number(bp));
        else if (blist.length) setBrandId(blist[0].id);
      }
      setLoading(false);
    })();
  }, [id, isNew, alert, params]);

  const save = async () => {
    setSaving(true);
    const input = { brand_id: brandId === '' ? null : Number(brandId), parent_id: parentId, name, description, image_url: imageUrl, is_active: isActive };
    const { error } = isNew ? await rentalCategoryApi.create(input) : await rentalCategoryApi.update(id!, input);
    setSaving(false);
    if (error) alert('저장 오류', error); else alert('저장 완료', '저장되었습니다.', () => navigate(backUrl));
  };

  if (loading) return <Spinner />;

  const title = parentId ? (isNew ? '하위 카테고리 등록' : '하위 카테고리 수정') : (isNew ? '카테고리 등록' : '카테고리 수정');

  return (
    <div style={{ maxWidth: '680px' }}>
      <DetailHead
        title={title}
        onBack={() => navigate(backUrl)}
        badge={!isNew ? <StatusPill label={isActive ? '활성' : '비활성'} color={isActive ? '#059669' : '#94a3b8'} /> : undefined}
        right={<button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>}
      />

      <FormSection title="카테고리 정보">
        <Field label="브랜드" required minWidth="100%">
          <select style={{ ...(SELECT_STYLE as React.CSSProperties), width: '100%' }} value={brandId} onChange={(e) => setBrandId(e.target.value === '' ? '' : Number(e.target.value))} disabled={!!parentId}>
            <option value="">브랜드 선택</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          {parentId ? <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>상위 카테고리의 브랜드를 따릅니다.</span> : null}
        </Field>
        <Row><TextField label="카테고리명" required minWidth="100%" value={name} onChange={setName} placeholder="예: 소파 / 빈백" /></Row>
        <Field label="카테고리 이미지 (쇼핑홈 퀵메뉴 노출)" minWidth="100%">
          <ImageUploader value={imageUrl ? [imageUrl] : []} onChange={(urls) => setImageUrl(urls[0] || '')} folder="rental-category" multiple={false} max={1} />
        </Field>
        <TextareaField label="설명" value={description} onChange={setDescription} minHeight="80px" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>활성화</label>
          <ToggleButton isOn={isActive} onToggle={() => setIsActive((v) => !v)} />
        </div>
        <FormActions>
          <button style={btnGhost} onClick={() => navigate(backUrl)}>취소</button>
          <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
        </FormActions>
      </FormSection>
      {modal}
    </div>
  );
};

export default RentalCategoryDetail;
