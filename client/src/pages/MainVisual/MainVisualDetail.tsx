import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { mainVisualApi, type MvSection } from '../../api/mainVisualApi';
import { SELECT_STYLE } from '../../components/UI/StyledSelect';
import ToggleButton from '../../components/UI/ToggleButton';
import ImageUploader from '../../components/UI/ImageUploader';
import { card, inputStyle, labelStyle, btnPrimary, btnGhost, useAdminModal, Spinner } from '../Content/Construction/shared';

const MainVisualDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [section, setSection] = useState<MvSection>('construction');
  const [imageUrl, setImageUrl] = useState('');
  const [badge, setBadge] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data, error } = await mainVisualApi.get(id!);
      if (error) alert('불러오기 오류', error);
      if (data) {
        setSection(data.section);
        setImageUrl(data.image_url || '');
        setBadge(data.badge || '');
        setTitle(data.title || '');
        setSubtitle(data.subtitle || '');
        setCtaText(data.cta_text || '');
        setLinkUrl(data.link_url || '');
        setIsActive(data.is_active);
      }
      setLoading(false);
    })();
  }, [id, isNew, alert]);

  const save = async () => {
    const input = {
      section, image_url: imageUrl, badge, title, subtitle, cta_text: ctaText, link_url: linkUrl, is_active: isActive,
    };
    setSaving(true);
    const { error } = isNew ? await mainVisualApi.create(input) : await mainVisualApi.update(id!, input);
    setSaving(false);
    if (error) alert('저장 오류', error);
    else navigate('/admin/dashboard/main-visuals');
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '780px' }}>
      <button style={{ ...btnGhost, marginBottom: '16px' }} onClick={() => navigate('/admin/dashboard/main-visuals')}>
        <ArrowLeft size={16} /> 목록으로
      </button>
      <div style={card}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '24px' }}>
          {isNew ? '메인 비주얼 등록' : '메인 비주얼 수정'}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '18px', marginBottom: '18px' }}>
          <div>
            <label style={labelStyle}>섹션 *</label>
            <select style={{ ...(SELECT_STYLE as React.CSSProperties), width: '100%' }} value={section} onChange={(e) => setSection(e.target.value as MvSection)}>
              <option value="construction">시공</option>
              <option value="rental">렌탈</option>
              <option value="dj">DJ</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>배지 (선택)</label>
            <input style={inputStyle} value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="예: 빈백 특가 세일" />
          </div>
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>배너 이미지</label>
          <ImageUploader value={imageUrl ? [imageUrl] : []} onChange={(urls) => setImageUrl(urls[0] || '')} folder="main-visual" multiple={false} max={1} />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>제목 * <span style={{ fontWeight: 400, color: '#94a3b8' }}>(줄바꿈 가능)</span></label>
          <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={'거실부터\n다이닝까지, 피아바'} />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>부제목</label>
          <input style={inputStyle} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="하나의 취향으로 완성하는 라이프스타일 컬렉션" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
          <div>
            <label style={labelStyle}>버튼 문구 (선택)</label>
            <input style={inputStyle} value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="예: 브랜드쿠폰 최대 20%" />
          </div>
          <div>
            <label style={labelStyle}>링크 URL (선택)</label>
            <input style={inputStyle} value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>활성화</label>
          <ToggleButton isOn={isActive} onToggle={() => setIsActive((v) => !v)} />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button style={btnGhost} onClick={() => navigate('/admin/dashboard/main-visuals')}>취소</button>
          <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
        </div>
      </div>
      {modal}
    </div>
  );
};

export default MainVisualDetail;
