import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { portfolioApi, categoryApi } from '../../../api/constructionApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import ToggleButton from '../../../components/UI/ToggleButton';
import RichTextEditor from '../../../components/UI/RichTextEditor';
import ImageUploader from '../../../components/UI/ImageUploader';
import { card, inputStyle, labelStyle, btnPrimary, btnGhost, useAdminModal, Spinner } from './shared';

interface CategoryOpt { id: number; name: string; }

const ConstructionPortfolioDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [categories, setCategories] = useState<CategoryOpt[]>([]);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    (async () => {
      const { data: cats } = await categoryApi.listActive();
      setCategories(cats || []);
      if (!isNew) {
        const { data, error } = await portfolioApi.get(id!);
        if (error) alert('불러오기 오류', error);
        if (data) {
          setCategoryId(data.category_id ?? '');
          setTitle(data.title || '');
          setThumbnailUrl(data.thumbnail_url || '');
          setContentHtml(data.content_html || '');
          setLinkUrl(data.link_url || '');
          setIsActive(data.is_active);
        }
        setLoading(false);
      }
    })();
  }, [id, isNew, alert]);

  const save = async () => {
    const input = {
      category_id: categoryId === '' ? null : Number(categoryId),
      title, thumbnail_url: thumbnailUrl, content_html: contentHtml, link_url: linkUrl, is_active: isActive,
    };
    setSaving(true);
    const { error } = isNew ? await portfolioApi.create(input) : await portfolioApi.update(id!, input);
    setSaving(false);
    if (error) alert('저장 오류', error);
    else navigate('/admin/dashboard/construction/portfolio');
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '820px' }}>
      <button style={{ ...btnGhost, marginBottom: '16px' }} onClick={() => navigate('/admin/dashboard/construction/portfolio')}>
        <ArrowLeft size={16} /> 목록으로
      </button>
      <div style={card}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '24px' }}>
          {isNew ? '포트폴리오 등록' : '포트폴리오 수정'}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '18px', marginBottom: '18px' }}>
          <div>
            <label style={labelStyle}>카테고리 *</label>
            <select style={{ ...(SELECT_STYLE as React.CSSProperties), width: '100%' }} value={categoryId} onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}>
              <option value="">선택</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>제목 *</label>
            <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="포트폴리오 제목" />
          </div>
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>대표 이미지</label>
          <ImageUploader
            value={thumbnailUrl ? [thumbnailUrl] : []}
            onChange={(urls) => setThumbnailUrl(urls[0] || '')}
            folder="portfolio"
            multiple={false}
            max={1}
          />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>링크 URL</label>
          <input style={inputStyle} value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://... (선택)" />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>상세 내용</label>
          <RichTextEditor value={contentHtml} onChange={setContentHtml} placeholder="시공 상세 내용을 입력하세요" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>활성화</label>
          <ToggleButton isOn={isActive} onToggle={() => setIsActive((v) => !v)} />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button style={btnGhost} onClick={() => navigate('/admin/dashboard/construction/portfolio')}>취소</button>
          <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
        </div>
      </div>
      {modal}
    </div>
  );
};

export default ConstructionPortfolioDetail;
