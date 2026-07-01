import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, X, Plus, Check, Disc3, MapPin } from 'lucide-react';
import { djApi, KR_REGIONS, type SocialLink } from '../../api/djApi';
import { uploadFile } from '../../utils/fileUpload';
import Seo from '../../components/Seo';
import '../Rental/RentalPage.css';

const BLUE = '#2563eb';
const label: React.CSSProperties = { display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '7px' };
const input: React.CSSProperties = { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '9px', fontSize: '0.92rem', boxSizing: 'border-box', background: '#fff' };
const phoneOk = (v: string) => /^01[016789]-?\d{3,4}-?\d{4}$/.test(v.replace(/\s/g, ''));

// 섹션 카드
const Section: React.FC<{ n: number; title: string; desc?: string; children: React.ReactNode }> = ({ n, title, desc, children }) => (
  <section style={{ background: '#fff', border: '1px solid #eef2f7', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
      <span style={{ width: '26px', height: '26px', borderRadius: '8px', background: '#eff6ff', color: BLUE, fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</span>
      <div>
        <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#1e293b' }}>{title}</h3>
        {desc && <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{desc}</p>}
      </div>
    </div>
    <div style={{ display: 'grid', gap: '14px' }}>{children}</div>
  </section>
);

// 단일 파일 업로드 필드
const FileField: React.FC<{ label: string; value: string; onChange: (url: string) => void; hint?: string }> = ({ label: lb, value, onChange, hint }) => {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const pick = async (f: File | undefined) => {
    if (!f) return; setErr(''); setBusy(true);
    const { url, error } = await uploadFile(f, 'dj');
    setBusy(false);
    if (error) setErr(error); else onChange(url || '');
    if (ref.current) ref.current.value = '';
  };
  return (
    <div>
      <label style={label}>{lb} {hint && <span style={{ fontWeight: 400, color: '#94a3b8' }}>{hint}</span>}</label>
      <input ref={ref} type="file" accept="image/*,application/pdf" hidden onChange={(e) => pick(e.target.files?.[0])} />
      <button type="button" onClick={() => ref.current?.click()}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', border: `1px dashed ${value ? '#22c55e' : '#cbd5e1'}`, background: value ? '#f0fdf4' : '#f8fafc', borderRadius: '10px', padding: '13px 16px', cursor: 'pointer', fontSize: '0.88rem', color: '#475569' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          {value ? <Check size={16} color="#16a34a" /> : <UploadCloud size={16} color="#94a3b8" />}
          {busy ? '업로드 중...' : value ? '업로드 완료' : '파일 선택 (클릭)'}
        </span>
        {value && <a href={value} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontSize: '0.8rem', color: BLUE, fontWeight: 700 }}>보기</a>}
      </button>
      {err && <span style={{ display: 'block', marginTop: '5px', fontSize: '0.78rem', color: '#dc2626' }}>{err}</span>}
    </div>
  );
};

const DjApplyPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [stage, setStage] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [idCard, setIdCard] = useState('');
  const [bankbook, setBankbook] = useState('');
  const [resume, setResume] = useState('');
  const [pfType, setPfType] = useState<'img' | 'pdf'>('img');
  const [pfFiles, setPfFiles] = useState<string[]>([]);
  const [soundcloud, setSoundcloud] = useState('');
  const [mp3, setMp3] = useState('');
  const [youtube, setYoutube] = useState('');
  const [socials, setSocials] = useState<SocialLink[]>([{ label: '', url: '' }]);
  const [regions, setRegions] = useState<string[]>([]);
  const [gmap, setGmap] = useState<Record<string, string>>({});
  const [regionSel, setRegionSel] = useState('');
  const [intro, setIntro] = useState('');
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const pfRef = useRef<HTMLInputElement>(null);

  const addRegion = () => {
    if (!regionSel || regions.includes(regionSel)) return;
    setRegions((p) => [...p, regionSel]);
    setRegionSel('');
  };
  const removeRegion = (r: string) => {
    setRegions((p) => p.filter((x) => x !== r));
    setGmap((m) => { const n = { ...m }; delete n[r]; return n; });
  };

  const addPortfolioFile = async (f: File | undefined) => {
    if (!f) return;
    const { url, error } = await uploadFile(f, 'dj');
    if (error) alert(error); else if (url) setPfFiles((p) => [...p, url]);
    if (pfRef.current) pfRef.current.value = '';
  };

  const submit = async () => {
    if (!name.trim()) return alert('이름을 입력해주세요.');
    if (!phoneOk(phone)) return alert('연락처를 정확히 입력해주세요.');
    if (regions.length === 0) return alert('섭외 가능 지역을 1개 이상 선택해주세요.');
    if (!agree) return alert('개인정보 수집·이용에 동의해주세요.');

    const guarantees: Record<string, number> = {};
    regions.forEach((r) => { if (gmap[r]) guarantees[r] = Number(gmap[r]); });

    setSubmitting(true);
    const { error } = await djApi.create({
      name: name.trim(), stage_name: stage.trim() || null, phone: phone.trim(), email: email.trim() || null,
      id_card_url: idCard || null, bankbook_url: bankbook || null, resume_url: resume || null,
      portfolio_type: pfType, portfolio_files: pfFiles,
      soundcloud_url: soundcloud.trim() || null, mp3_url: mp3.trim() || null, youtube_url: youtube.trim() || null,
      social_links: socials.filter((s) => s.url.trim()).map((s) => ({ label: s.label.trim(), url: s.url.trim() })),
      regions, guarantees,
      // 호환용 레거시 컬럼
      guarantee_seoul: guarantees['서울'] ?? null,
      guarantee_gyeonggi: guarantees['경기'] ?? null,
      guarantee_daejeon: guarantees['대전'] ?? null,
      intro: intro.trim() || null,
      status: 'pending',
    });
    setSubmitting(false);
    if (error) return alert(`접수 중 오류: ${error}`);
    setDone(true);
  };

  if (done) {
    return (
      <div className="rental-page">
        <div style={{ maxWidth: '560px', margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#eff6ff', color: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>아티스트 등록 신청이 접수되었습니다</h2>
          <p style={{ color: '#64748b', marginTop: '10px', lineHeight: 1.6 }}>담당자가 심사 후 승인 여부를 연락드리겠습니다.</p>
          <button onClick={() => navigate('/dj')} style={{ marginTop: '28px', background: BLUE, color: '#fff', border: 'none', borderRadius: '10px', padding: '13px 28px', fontWeight: 700, cursor: 'pointer' }}>DJ 홈으로</button>
        </div>
      </div>
    );
  }

  const chip = (active: boolean): React.CSSProperties => ({ padding: '9px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.86rem', border: active ? `2px solid ${BLUE}` : '1px solid #e2e8f0', background: active ? '#eff6ff' : '#fff', color: active ? BLUE : '#64748b' });
  const available = KR_REGIONS.filter((r) => !regions.includes(r));

  return (
    <div className="rental-page">
      <Seo title="DJ 입점 (아티스트 등록)" description="클립스 DJ 아티스트 등록 — 포트폴리오·게런티·섭외 지역을 등록하고 아티스트 회원으로 활동하세요." keywords="DJ 섭외,DJ 아티스트 등록,DJ 입점,게런티,DJ 포트폴리오" />
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', borderRadius: '18px', padding: '32px 28px', color: '#fff', marginBottom: '22px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '14px' }}>
            <Disc3 size={15} /> 아티스트 회원
          </div>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, margin: 0 }}>DJ 입점 · 아티스트 등록</h1>
          <p style={{ color: '#dbeafe', margin: '8px 0 0', lineHeight: 1.6, fontSize: '0.92rem' }}>서류·포트폴리오·게런티를 등록하면 심사 후 아티스트 회원으로 활동하실 수 있습니다.</p>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          <Section n={1} title="기본 정보">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div><label style={label}>이름 *</label><input style={input} value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><label style={label}>활동명(DJ명)</label><input style={input} value={stage} onChange={(e) => setStage(e.target.value)} placeholder="예: DJ KLIPSE" /></div>
              <div><label style={label}>연락처 *</label><input style={input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" /></div>
              <div><label style={label}>이메일</label><input style={input} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            </div>
          </Section>

          <Section n={2} title="제출 서류" desc="이미지 또는 PDF 파일을 업로드하세요.">
            <FileField label="신분증" value={idCard} onChange={setIdCard} hint="(이미지/PDF)" />
            <FileField label="통장사본" value={bankbook} onChange={setBankbook} hint="(이미지/PDF)" />
            <FileField label="이력서" value={resume} onChange={setResume} hint="(이미지/PDF)" />
          </Section>

          <Section n={3} title="포트폴리오">
            <div>
              <label style={label}>파일 타입</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['img', 'pdf'] as const).map((t) => (
                  <button key={t} type="button" onClick={() => { setPfType(t); setPfFiles([]); }} style={chip(pfType === t)}>{t === 'img' ? '이미지' : 'PDF'}</button>
                ))}
              </div>
            </div>
            <div>
              <input ref={pfRef} type="file" accept={pfType === 'pdf' ? 'application/pdf' : 'image/*'} hidden onChange={(e) => addPortfolioFile(e.target.files?.[0])} />
              <button type="button" onClick={() => pfRef.current?.click()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #e2e8f0', background: '#fff', borderRadius: '9px', padding: '10px 14px', cursor: 'pointer', fontSize: '0.88rem', color: '#475569' }}>
                <Plus size={16} /> 포트폴리오 {pfType === 'pdf' ? 'PDF' : '이미지'} 추가
              </button>
              {pfFiles.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {pfFiles.map((u, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', borderRadius: '8px', padding: '6px 10px', fontSize: '0.8rem' }}>
                      <a href={u} target="_blank" rel="noreferrer" style={{ color: BLUE }}>파일 {i + 1}</a>
                      <X size={14} style={{ cursor: 'pointer' }} onClick={() => setPfFiles((p) => p.filter((_, idx) => idx !== i))} />
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div><label style={label}>사운드클라우드</label><input style={input} value={soundcloud} onChange={(e) => setSoundcloud(e.target.value)} placeholder="https://soundcloud.com/..." /></div>
              <div><label style={label}>MP3 링크</label><input style={input} value={mp3} onChange={(e) => setMp3(e.target.value)} placeholder="https://..." /></div>
              <div><label style={label}>유튜브</label><input style={input} value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="https://youtube.com/..." /></div>
            </div>
            <div>
              <label style={label}>소셜 링크</label>
              {socials.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input style={{ ...input, flex: 1 }} placeholder="라벨(예: 인스타그램)" value={s.label} onChange={(e) => setSocials((arr) => arr.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))} />
                  <input style={{ ...input, flex: 2 }} placeholder="https://..." value={s.url} onChange={(e) => setSocials((arr) => arr.map((x, idx) => idx === i ? { ...x, url: e.target.value } : x))} />
                  <button type="button" onClick={() => setSocials((arr) => arr.filter((_, idx) => idx !== i))} style={{ background: '#fef2f2', border: 'none', borderRadius: '9px', padding: '0 10px', cursor: 'pointer' }}><X size={16} color="#dc2626" /></button>
                </div>
              ))}
              <button type="button" onClick={() => setSocials((a) => [...a, { label: '', url: '' }])} style={{ border: '1px solid #e2e8f0', background: '#fff', borderRadius: '9px', padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem', color: '#475569' }}><Plus size={14} /> 소셜 추가</button>
            </div>
          </Section>

          <Section n={4} title="섭외 가능 지역 · 게런티" desc="전국에서 활동 가능한 지역을 추가하고 지역별 게런티(원)를 입력하세요.">
            <div style={{ display: 'flex', gap: '8px' }}>
              <select style={{ ...input, flex: 1 }} value={regionSel} onChange={(e) => setRegionSel(e.target.value)}>
                <option value="">지역 선택</option>
                {available.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <button type="button" onClick={addRegion} disabled={!regionSel} style={{ background: BLUE, color: '#fff', border: 'none', borderRadius: '9px', padding: '0 18px', fontWeight: 700, cursor: regionSel ? 'pointer' : 'not-allowed', opacity: regionSel ? 1 : 0.5, whiteSpace: 'nowrap' }}>추가</button>
            </div>

            {regions.length === 0 ? (
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>지역을 추가하면 지역별 게런티를 입력할 수 있어요. (예: 10만원 + α)</span>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {regions.map((r) => (
                  <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', border: '1px solid #eef2f7', borderRadius: '10px', padding: '10px 12px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 800, color: '#1e293b', fontSize: '0.9rem', minWidth: '72px' }}><MapPin size={14} color={BLUE} /> {r}</span>
                    <input type="number" min={0} style={{ ...input, flex: 1 }} placeholder="게런티(원) · 예: 120000" value={gmap[r] || ''} onChange={(e) => setGmap((m) => ({ ...m, [r]: e.target.value }))} />
                    <button type="button" onClick={() => removeRegion(r)} style={{ background: '#fef2f2', border: 'none', borderRadius: '9px', padding: '9px 10px', cursor: 'pointer' }}><X size={16} color="#dc2626" /></button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section n={5} title="소개">
            <textarea style={{ ...input, minHeight: '100px', resize: 'vertical' }} value={intro} onChange={(e) => setIntro(e.target.value)} placeholder="장르, 경력, 주요 이력 등" />
          </Section>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer', padding: '0 4px' }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ width: '17px', height: '17px', accentColor: BLUE }} /> 개인정보 수집·이용에 동의합니다 (필수)
          </label>

          <button onClick={submit} disabled={submitting} style={{ background: BLUE, color: '#fff', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '1.02rem', fontWeight: 800, cursor: 'pointer', opacity: submitting ? 0.6 : 1, boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
            {submitting ? '접수 중...' : '아티스트 등록 신청'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DjApplyPage;
