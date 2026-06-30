import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { mainVisualApi, type MvSection, type MvType } from '../../../api/mainVisualApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import ToggleButton from '../../../components/UI/ToggleButton';
import ImageUploader from '../../../components/UI/ImageUploader';
import { card, inputStyle, labelStyle, btnPrimary, btnGhost, useAdminModal, Spinner } from '../../../components/admin/shared';

const MainVisualDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [section, setSection] = useState<MvSection>('construction');
  const [type, setType] = useState<MvType>('type_a');
  const [isAd, setIsAd] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageMobileUrl, setImageMobileUrl] = useState('');
  const [badge, setBadge] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorAvatar, setAuthorAvatar] = useState('');
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
        setType(data.type || 'type_a');
        setIsAd(!!data.is_ad);
        setImageUrl(data.image_url || '');
        setImageMobileUrl(data.image_mobile_url || '');
        setBadge(data.badge || '');
        setTitle(data.title || '');
        setSubtitle(data.subtitle || '');
        setCtaText(data.cta_text || '');
        setLinkUrl(data.link_url || '');
        setAuthorName(data.author_name || '');
        setAuthorAvatar(data.author_avatar || '');
        setIsActive(data.is_active);
      }
      setLoading(false);
    })();
  }, [id, isNew, alert]);

  const isConstruction = section === 'construction';

  const save = async () => {
    const input = {
      section, type, is_ad: isConstruction ? isAd : false,
      image_url: imageUrl, image_mobile_url: imageMobileUrl,
      badge, title, subtitle, cta_text: ctaText, link_url: linkUrl,
      author_name: authorName, author_avatar: authorAvatar, is_active: isActive,
    };
    setSaving(true);
    const { error } = isNew ? await mainVisualApi.create(input) : await mainVisualApi.update(id!, input);
    setSaving(false);
    if (error) alert('저장 오류', error);
    else alert('저장 완료', '저장되었습니다.', () => navigate('/admin/dashboard/main-visuals'));
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
          <div>
            <label style={labelStyle}>섹션 *</label>
            <select style={{ ...(SELECT_STYLE as React.CSSProperties), width: '100%' }} value={section} onChange={(e) => setSection(e.target.value as MvSection)}>
              <option value="construction">시공</option>
              <option value="rental">렌탈</option>
              <option value="dj">DJ</option>
            </select>
          </div>
          {isConstruction ? (
            <div>
              <label style={labelStyle}>배너 종류 *</label>
              <select style={{ ...(SELECT_STYLE as React.CSSProperties), width: '100%' }} value={isAd ? 'ad' : 'main'} onChange={(e) => setIsAd(e.target.value === 'ad')}>
                <option value="main">일반 배너 (좌측 메인)</option>
                <option value="ad">AD 배너 (우측 고정)</option>
              </select>
            </div>
          ) : (
            <div>
              <label style={labelStyle}>타입 *</label>
              <select style={{ ...(SELECT_STYLE as React.CSSProperties), width: '100%' }} value={type} onChange={(e) => setType(e.target.value as MvType)}>
                <option value="type_a">Type A · 기본 (이미지 + 문구)</option>
                <option value="type_b">Type B · 쿠폰형 (배지 + 버튼)</option>
              </select>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>{isConstruction && isAd ? 'AD 이미지 (데스크탑·세로형)' : '배너 이미지'}</label>
          <ImageUploader value={imageUrl ? [imageUrl] : []} onChange={(urls) => setImageUrl(urls[0] || '')} folder="main-visual" multiple={false} max={1} />
        </div>

        {/* AD 배너: 모바일 가로 이미지 (반응형별 이미지) */}
        {isConstruction && isAd && (
          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>AD 이미지 (모바일·가로형) <span style={{ fontWeight: 400, color: '#94a3b8' }}>모바일에서 가로 배너로 노출</span></label>
            <ImageUploader value={imageMobileUrl ? [imageMobileUrl] : []} onChange={(urls) => setImageMobileUrl(urls[0] || '')} folder="main-visual" multiple={false} max={1} />
          </div>
        )}

        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>제목 * <span style={{ fontWeight: 400, color: '#94a3b8' }}>(줄바꿈 가능)</span></label>
          <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={'애니메이션 속 아늑한 방을 꿈꾸는 청춘 소녀방'} />
        </div>

        {!(isConstruction && isAd) && (
          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>부제목</label>
            <input style={inputStyle} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="부가 설명" />
          </div>
        )}

        {/* 시공 일반 배너: 등록자 정보(클라이언트 표시) */}
        {isConstruction && !isAd && (
          <div style={{ border: '1px dashed #cbd5e1', background: '#f8fafc', borderRadius: '10px', padding: '16px', marginBottom: '18px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '12px' }}>등록자 정보 (클라이언트 노출: 아바타 + 등록자명)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>등록자명</label>
                <input style={inputStyle} value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="예: 세리나SERINA" />
              </div>
              <div>
                <label style={labelStyle}>등록자 아바타</label>
                <ImageUploader value={authorAvatar ? [authorAvatar] : []} onChange={(urls) => setAuthorAvatar(urls[0] || '')} folder="main-visual" multiple={false} max={1} />
              </div>
            </div>
          </div>
        )}

        {type === 'type_b' && !isConstruction && (
          <div style={{ border: '1px dashed #fca5a5', background: '#fef2f2', borderRadius: '10px', padding: '16px', marginBottom: '18px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#dc2626', marginBottom: '12px' }}>쿠폰형(Type B) 전용 항목</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>배지</label>
                <input style={inputStyle} value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="예: 빈백 특가 세일" />
              </div>
              <div>
                <label style={labelStyle}>쿠폰 버튼 문구</label>
                <input style={inputStyle} value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="예: 브랜드쿠폰 최대 20%" />
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>
            {isConstruction && !isAd ? '포트폴리오 링크' : '링크 URL'} <span style={{ fontWeight: 400, color: '#94a3b8' }}>(클릭 시 이동)</span>
          </label>
          <input style={inputStyle} value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://... 또는 /portfolio" />
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
