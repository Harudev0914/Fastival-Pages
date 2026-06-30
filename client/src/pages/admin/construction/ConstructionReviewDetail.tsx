import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { reviewApi, categoryApi } from '../../../api/constructionApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import ToggleButton from '../../../components/UI/ToggleButton';
import ImageUploader from '../../../components/UI/ImageUploader';
import { card, inputStyle, labelStyle, btnPrimary, btnGhost, useAdminModal, Spinner } from '../../../components/admin/shared';

interface CategoryOpt { id: number; name: string; }

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
    else navigate('/admin/dashboard/construction/reviews');
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '760px' }}>
      <button style={{ ...btnGhost, marginBottom: '16px' }} onClick={() => navigate('/admin/dashboard/construction/reviews')}>
        <ArrowLeft size={16} /> 목록으로
      </button>
      <div style={card}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '24px' }}>
          {isNew ? '후기 추가' : '후기 조회/수정'}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
          <div>
            <label style={labelStyle}>작성자 *</label>
            <input style={inputStyle} value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="작성자명" />
          </div>
          <div>
            <label style={labelStyle}>카테고리</label>
            <select style={{ ...(SELECT_STYLE as React.CSSProperties), width: '100%' }} value={categoryId} onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}>
              <option value="">미분류</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: '18px', marginBottom: '18px' }}>
          <div>
            <label style={labelStyle}>제목</label>
            <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="후기 제목(선택)" />
          </div>
          <div>
            <label style={labelStyle}>평점</label>
            <select style={{ ...(SELECT_STYLE as React.CSSProperties), width: '100%' }} value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              {[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1].map((r) => <option key={r} value={r}>{r}점</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>후기 내용 *</label>
          <textarea style={{ ...inputStyle, minHeight: '140px', resize: 'vertical' }} value={content} onChange={(e) => setContent(e.target.value)} placeholder="후기 내용을 입력하세요" />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>후기 이미지</label>
          <ImageUploader value={images} onChange={setImages} folder="reviews" multiple max={10} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>활성화</label>
          <ToggleButton isOn={isActive} onToggle={() => setIsActive((v) => !v)} />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button style={btnGhost} onClick={() => navigate('/admin/dashboard/construction/reviews')}>취소</button>
          <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
        </div>
      </div>
      {modal}
    </div>
  );
};

export default ConstructionReviewDetail;
