import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { reviewApi, categoryApi } from '../../../api/constructionApi';
import ToggleButton from '../../../components/UI/ToggleButton';
import ImageUploader from '../../../components/UI/ImageUploader';
import { labelStyle, btnPrimary, btnGhost, useAdminModal, Spinner, DetailHead, StatusPill, FormSection, Row, TextField, TextareaField, SelectField, FormActions } from '../../../components/admin/shared';

interface CategoryOpt { id: number; name: string; }

const LIST = '/admin/dashboard/construction/reviews';

const ConstructionReviewDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [categories, setCategories] = useState<CategoryOpt[]>([]);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [authorName, setAuthorName] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [images, setImages] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    (async () => {
      const { data: cats } = await categoryApi.listActive();
      setCategories(cats || []);
      if (!isNew) {
        const { data, error } = await reviewApi.get(id!);
        if (error) alert('불러오기 오류', error);
        if (data) {
          setCategoryId(data.category_id ?? '');
          setAuthorName(data.author_name || '');
          setTitle(data.title || '');
          setContent(data.content || '');
          setRating(Number(data.rating) || 5);
          setImages(Array.isArray(data.images) ? data.images : []);
          setIsActive(data.is_active);
        }
        setLoading(false);
      }
    })();
  }, [id, isNew, alert]);

  const save = async () => {
    const input = {
      category_id: categoryId === '' ? null : Number(categoryId),
      author_name: authorName, title, content, rating, images, is_active: isActive,
    };
    setSaving(true);
    const { error } = isNew ? await reviewApi.create(input) : await reviewApi.update(id!, input);
    setSaving(false);
    if (error) alert('저장 오류', error);
    else alert('저장 완료', '저장되었습니다.', () => navigate(LIST));
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '760px' }}>
      <DetailHead
        title={isNew ? '후기 추가' : '후기 조회/수정'}
        onBack={() => navigate(LIST)}
        badge={!isNew ? <StatusPill label={isActive ? '활성' : '비활성'} color={isActive ? '#059669' : '#94a3b8'} /> : undefined}
        right={<button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>}
      />

      <FormSection title="후기 정보">
        <Row>
          <TextField label="작성자" required value={authorName} onChange={setAuthorName} placeholder="작성자명" />
          <SelectField label="카테고리" value={categoryId} onChange={(v) => setCategoryId(v === '' ? '' : Number(v))}>
            <option value="">미분류</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </SelectField>
        </Row>
        <Row>
          <TextField label="제목" value={title} onChange={setTitle} placeholder="후기 제목(선택)" />
          <SelectField label="평점" flex={0} minWidth="160px" value={rating} onChange={(v) => setRating(Number(v))}>
            {[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1].map((r) => <option key={r} value={r}>{r}점</option>)}
          </SelectField>
        </Row>
        <TextareaField label="후기 내용" required value={content} onChange={setContent} placeholder="후기 내용을 입력하세요" minHeight="140px" />
      </FormSection>

      <FormSection title="이미지 · 상태">
        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>후기 이미지</label>
          <ImageUploader value={images} onChange={setImages} folder="reviews" multiple max={10} />
        </div>

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

export default ConstructionReviewDetail;
