import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { mainVisualApi, type MvSection, type MvType } from '../../../api/mainVisualApi';
import ToggleButton from '../../../components/UI/ToggleButton';
import ImageUploader from '../../../components/UI/ImageUploader';
import { inputStyle, labelStyle, btnPrimary, btnGhost, useAdminModal, Spinner, DetailHead, StatusPill, FormSection, Row, TextField, TextareaField, SelectField, FormActions } from '../../../components/admin/shared';

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
  const [useText, setUseText] = useState(true);   // 문구(제목·부제목) 사용 여부
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
        setUseText(!!(data.title || '').trim());   // 저장된 제목이 없으면 '문구 미사용'으로 로드
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
    if (useText && !title.trim()) return alert('입력 필요', '제목을 입력하거나 "문구 사용"을 꺼주세요.');
    const input = {
      section, type, is_ad: isConstruction ? isAd : false,
      image_url: imageUrl, image_mobile_url: imageMobileUrl,
      badge, title: useText ? title : '', subtitle: useText ? subtitle : '', cta_text: ctaText, link_url: linkUrl,
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
      <DetailHead
        title={isNew ? '메인 비주얼 등록' : '메인 비주얼 수정'}
        onBack={() => navigate('/admin/dashboard/main-visuals')}
        badge={!isNew ? <StatusPill label={isActive ? '활성' : '비활성'} color={isActive ? '#059669' : '#94a3b8'} /> : undefined}
        right={<button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>}
      />

      <FormSection title="배너 구분">
        <Row>
          <SelectField label="섹션" required value={section} onChange={(v) => setSection(v as MvSection)}>
            <option value="construction">시공</option>
            <option value="rental">렌탈</option>
            <option value="dj">DJ</option>
          </SelectField>
          {isConstruction ? (
            <SelectField label="배너 종류" required value={isAd ? 'ad' : 'main'} onChange={(v) => setIsAd(v === 'ad')}>
              <option value="main">일반 배너 (좌측 메인)</option>
              <option value="ad">AD 배너 (우측 고정)</option>
            </SelectField>
          ) : (
            <SelectField label="타입" required value={type} onChange={(v) => setType(v as MvType)}>
              <option value="type_a">Type A · 기본 (이미지 + 문구)</option>
              <option value="type_b">Type B · 쿠폰형 (배지 + 버튼)</option>
            </SelectField>
          )}
        </Row>
      </FormSection>

      <FormSection title="이미지">
        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>{isConstruction && isAd ? 'AD 이미지 (데스크탑·세로형)' : '배너 이미지'}</label>
          <ImageUploader value={imageUrl ? [imageUrl] : []} onChange={(urls) => setImageUrl(urls[0] || '')} folder="main-visual" multiple={false} max={1} />
        </div>

        {/* AD 배너: 모바일 가로 이미지 (반응형별 이미지) */}
        {isConstruction && isAd && (
          <div>
            <label style={labelStyle}>AD 이미지 (모바일·가로형) <span style={{ fontWeight: 400, color: '#94a3b8' }}>모바일에서 가로 배너로 노출</span></label>
            <ImageUploader value={imageMobileUrl ? [imageMobileUrl] : []} onChange={(urls) => setImageMobileUrl(urls[0] || '')} folder="main-visual" multiple={false} max={1} />
          </div>
        )}
      </FormSection>

      <FormSection title="문구 · 콘텐츠">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: useText ? '18px' : '0', paddingBottom: '14px', borderBottom: '1px dashed #e2e8f0', flexWrap: 'wrap' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>문구 사용</label>
          <ToggleButton isOn={useText} onToggle={() => setUseText((v) => !v)} />
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{useText ? '배너에 제목·부제목을 표시합니다.' : '문구 미사용 — 배너에 텍스트를 표시하지 않습니다.'}</span>
        </div>

        {useText && (<>
          <TextareaField label="제목" required minHeight="70px" value={title} onChange={setTitle} placeholder={'애니메이션 속 아늑한 방을 꿈꾸는 청춘 소녀방'} />

          {!(isConstruction && isAd) && (
            <div style={{ marginTop: '18px' }}>
              <Row><TextField label="부제목" minWidth="100%" value={subtitle} onChange={setSubtitle} placeholder="부가 설명" /></Row>
            </div>
          )}
        </>)}

        {/* 시공 일반 배너: 등록자 정보(클라이언트 표시) */}
        {isConstruction && !isAd && (
          <div style={{ border: '1px dashed #cbd5e1', background: '#f8fafc', borderRadius: '10px', padding: '16px', marginTop: '18px' }}>
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
          <div style={{ border: '1px dashed #fca5a5', background: '#fef2f2', borderRadius: '10px', padding: '16px', marginTop: '18px' }}>
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
      </FormSection>

      <FormSection title="링크 · 노출">
        <Row>
          <TextField
            label={`${isConstruction && !isAd ? '포트폴리오 링크' : '링크 URL'} (클릭 시 이동)`}
            minWidth="100%"
            value={linkUrl}
            onChange={setLinkUrl}
            placeholder="https://... 또는 /portfolio"
          />
        </Row>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', marginBottom: '4px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>활성화</label>
          <ToggleButton isOn={isActive} onToggle={() => setIsActive((v) => !v)} />
        </div>
        <FormActions>
          <button style={btnGhost} onClick={() => navigate('/admin/dashboard/main-visuals')}>취소</button>
          <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
        </FormActions>
      </FormSection>
      {modal}
    </div>
  );
};

export default MainVisualDetail;
