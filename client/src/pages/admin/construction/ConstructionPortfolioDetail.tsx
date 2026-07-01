import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { portfolioApi, categoryApi } from '../../../api/constructionApi';
import ToggleButton from '../../../components/UI/ToggleButton';
import RichTextEditor from '../../../components/UI/RichTextEditor';
import ImageUploader from '../../../components/UI/ImageUploader';
import { labelStyle, btnPrimary, btnGhost, useAdminModal, Spinner, DetailHead, StatusPill, FormSection, Row, TextField, SelectField, FormActions } from '../../../components/admin/shared';

interface CategoryOpt { id: number; name: string; }

const LIST = '/admin/dashboard/construction/portfolio';

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
    else alert('저장 완료', '저장되었습니다.', () => navigate(LIST));
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '820px' }}>
      <DetailHead
        title={isNew ? '포트폴리오 등록' : '포트폴리오 수정'}
        onBack={() => navigate(LIST)}
        badge={!isNew ? <StatusPill label={isActive ? '활성' : '비활성'} color={isActive ? '#059669' : '#94a3b8'} /> : undefined}
        right={<button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>}
      />

      <FormSection title="기본 정보">
        <Row>
          <SelectField label="카테고리" required flex={0} minWidth="220px" value={categoryId} onChange={(v) => setCategoryId(v === '' ? '' : Number(v))}>
            <option value="">선택</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </SelectField>
          <TextField label="제목" required value={title} onChange={setTitle} placeholder="포트폴리오 제목" />
        </Row>
        <Row><TextField label="링크 URL" minWidth="100%" value={linkUrl} onChange={setLinkUrl} placeholder="https://... (선택)" /></Row>
      </FormSection>

      <FormSection title="이미지 · 상세 내용">
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

        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>상세 내용</label>
          <RichTextEditor value={contentHtml} onChange={setContentHtml} placeholder="시공 상세 내용을 입력하세요" />
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

export default ConstructionPortfolioDetail;
