import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { mainVisualApi, type MvSection, type MvType } from '../../../api/mainVisualApi';
import ToggleButton from '../../../components/UI/ToggleButton';
import ImageUploader from '../../../components/UI/ImageUploader';
import { card, labelStyle, btnPrimary, btnGhost, useAdminModal, Spinner, DetailHead, StatusPill, Row, TextField, TextareaField, SelectField, FormActions } from '../../../components/admin/shared';

// 한 카드 안에서 섹션을 구분하는 소제목 + 구분선
const subHead = (title: string, desc: string): React.ReactNode => (
  <div style={{ marginBottom: '16px' }}>
    <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{title}</h3>
    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0' }}>{desc}</p>
  </div>
);
const hr: React.CSSProperties = { border: 'none', borderTop: '1px solid #f1f5f9', margin: '26px 0 22px' };

const SECTIONS: MvSection[] = ['construction', 'rental', 'dj'];

// 라벨 + 설명 + 토글을 한 줄로 정렬한 공통 스위치 행
const ToggleRow: React.FC<{ label: string; desc: string; on: boolean; onToggle: () => void; accent?: string }> = ({ label, desc, on, onToggle, accent = '#008b8b' }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', padding: '14px 16px', border: `1px solid ${on ? accent + '55' : '#e2e8f0'}`, borderRadius: '11px', background: on ? accent + '0d' : '#f8fafc', transition: 'all .15s' }}>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>{label}</div>
      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '3px' }}>{desc}</div>
    </div>
    <ToggleButton isOn={on} onToggle={onToggle} />
  </div>
);

const MainVisualDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isNew = id === 'new';
  // 등록 시 탭에서 전달된 섹션을 기본값으로
  const initialSection = (SECTIONS.includes(params.get('section') as MvSection) ? params.get('section') : 'construction') as MvSection;

  const [section, setSection] = useState<MvSection>(initialSection);
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
    <div>
      <DetailHead
        title={isNew ? '메인 비주얼 등록' : '메인 비주얼 수정'}
        onBack={() => navigate('/admin/dashboard/main-visuals')}
        badge={!isNew ? <StatusPill label={isActive ? '활성' : '비활성'} color={isActive ? '#059669' : '#94a3b8'} /> : undefined}
        right={<button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>}
      />

      <div style={{ ...card, padding: '26px 28px' }}>
        {subHead('1. 배너 구분', '노출 위치(섹션)와 배너 형태를 선택합니다.')}
        <Row>
          <SelectField label="섹션" required value={section} onChange={(v) => setSection(v as MvSection)}>
            <option value="construction">시공</option>
            <option value="rental">렌탈</option>
            <option value="dj">DJ</option>
          </SelectField>
          {isConstruction ? (
            <SelectField label="배너 종류" required value={isAd ? 'ad' : 'main'} onChange={(v) => setIsAd(v === 'ad')}>
              <option value="main">일반 배너 (좌측 메인 슬라이드)</option>
              <option value="ad">AD 배너 (우측 고정)</option>
            </SelectField>
          ) : (
            <SelectField label="타입" required value={type} onChange={(v) => setType(v as MvType)}>
              <option value="type_a">Type A · 기본 (이미지 + 문구)</option>
              <option value="type_b">Type B · 쿠폰형 (배지 + 버튼)</option>
            </SelectField>
          )}
        </Row>
        <div style={{ marginTop: '4px', fontSize: '0.78rem', color: '#94a3b8' }}>
          {isConstruction
            ? (isAd ? 'AD 배너는 시공 메인 우측에 고정 노출됩니다. 모바일에선 가로 배너로 전환됩니다.' : '일반 배너는 시공 메인 좌측에서 슬라이드로 노출되며, 등록자(아바타+이름)가 함께 표시됩니다.')
            : (type === 'type_b' ? '쿠폰형은 배지·쿠폰 버튼 문구가 함께 노출됩니다.' : '기본형은 이미지 위에 제목·부제목이 노출됩니다.')}
        </div>

        <hr style={hr} />
        {subHead('2. 문구 · 콘텐츠', '배너에 표시할 텍스트를 설정합니다. 이미지만 노출하려면 ‘문구 사용’을 꺼주세요.')}
        <ToggleRow
          label="문구 사용"
          desc={useText ? '배너에 제목·부제목을 표시합니다.' : '문구 미사용 — 배너에 텍스트를 표시하지 않습니다.'}
          on={useText} onToggle={() => setUseText((v) => !v)}
        />

        {useText && (
          <div style={{ marginTop: '16px', display: 'grid', gap: '16px' }}>
            <TextareaField label="제목" required minHeight="70px" value={title} onChange={setTitle} placeholder={'예: 애니메이션 속 아늑한 방을 꿈꾸는 청춘 소녀방'} />
            {!(isConstruction && isAd) && (
              <Row><TextField label="부제목" minWidth="100%" value={subtitle} onChange={setSubtitle} placeholder="예: 하나의 취향으로 완성하는 라이프스타일 컬렉션" /></Row>
            )}
          </div>
        )}

        {/* 시공 일반 배너: 등록자 정보(클라이언트 표시) */}
        {isConstruction && !isAd && (
          <div style={{ border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '11px', padding: '16px', marginTop: '16px', display: 'grid', gap: '14px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>등록자 정보 <span style={{ fontWeight: 400, color: '#94a3b8' }}>(클라이언트에 아바타 + 이름으로 노출)</span></div>
            <Row><TextField label="등록자명" minWidth="100%" value={authorName} onChange={setAuthorName} placeholder="예: 세리나 SERINA" /></Row>
            <div>
              <label style={labelStyle}>등록자 아바타</label>
              <ImageUploader value={authorAvatar ? [authorAvatar] : []} onChange={(urls) => setAuthorAvatar(urls[0] || '')} folder="main-visual" multiple={false} max={1} />
            </div>
          </div>
        )}

        {/* 쿠폰형 전용 */}
        {type === 'type_b' && !isConstruction && (
          <div style={{ border: '1px solid #fca5a5', background: '#fef2f2', borderRadius: '11px', padding: '16px', marginTop: '16px', display: 'grid', gap: '14px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#dc2626' }}>쿠폰형(Type B) 전용 항목</div>
            <Row>
              <TextField label="배지" value={badge} onChange={setBadge} placeholder="예: 빈백 특가 세일" />
              <TextField label="쿠폰 버튼 문구" value={ctaText} onChange={setCtaText} placeholder="예: 브랜드쿠폰 최대 20%" />
            </Row>
          </div>
        )}

        <hr style={hr} />
        {subHead('3. 이미지', '배너에 사용할 이미지를 업로드합니다. (JPG·PNG·WebP)')}
        <div style={{ marginBottom: (isConstruction && isAd) ? '18px' : '0' }}>
          <label style={labelStyle}>{isConstruction && isAd ? 'AD 이미지 · 데스크탑(세로형)' : '배너 이미지'}<span style={{ fontWeight: 400, color: '#94a3b8' }}> — 대표 이미지</span></label>
          <ImageUploader value={imageUrl ? [imageUrl] : []} onChange={(urls) => setImageUrl(urls[0] || '')} folder="main-visual" multiple={false} max={1} />
        </div>

        {/* AD 배너: 모바일 가로 이미지 (반응형별 이미지) */}
        {isConstruction && isAd && (
          <div>
            <label style={labelStyle}>AD 이미지 · 모바일(가로형)<span style={{ fontWeight: 400, color: '#94a3b8' }}> — 모바일에서 가로 배너로 노출</span></label>
            <ImageUploader value={imageMobileUrl ? [imageMobileUrl] : []} onChange={(urls) => setImageMobileUrl(urls[0] || '')} folder="main-visual" multiple={false} max={1} />
          </div>
        )}

        <hr style={hr} />
        {subHead('4. 링크 · 노출', '배너 클릭 시 이동할 주소와 노출 여부를 설정합니다.')}
        <Row>
          <TextField
            label={`${isConstruction && !isAd ? '포트폴리오 링크' : '링크 URL'} (클릭 시 이동)`}
            minWidth="100%"
            value={linkUrl}
            onChange={setLinkUrl}
            placeholder="https://... 또는 /portfolio (비우면 클릭 이동 없음)"
          />
        </Row>
        <div style={{ marginTop: '16px' }}>
          <ToggleRow
            label="활성화"
            desc={isActive ? '클라이언트 페이지에 노출됩니다.' : '비활성 — 저장되지만 노출되지 않습니다.'}
            on={isActive} onToggle={() => setIsActive((v) => !v)} accent="#059669"
          />
        </div>
        <FormActions>
          <button style={btnGhost} onClick={() => navigate('/admin/dashboard/main-visuals')}>취소</button>
          <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
        </FormActions>
      </div>
      {modal}
    </div>
  );
};

export default MainVisualDetail;
