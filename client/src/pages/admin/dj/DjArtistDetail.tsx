import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Pause, X } from 'lucide-react';
import { djApi, DJ_STATUS_LABEL, type DjArtist, type DjStatus } from '../../../api/djApi';
import { card, inputStyle, labelStyle, btnGhost, useAdminModal, Spinner, fmtDate } from '../../../components/admin/shared';

const won = (n: number | null) => (n == null ? '-' : `₩${Number(n).toLocaleString()}`);

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', padding: '11px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
    <div style={{ width: '130px', color: '#94a3b8', flexShrink: 0 }}>{label}</div>
    <div style={{ color: '#1e293b', fontWeight: 600, wordBreak: 'break-all' }}>{children}</div>
  </div>
);
const FileLink: React.FC<{ url: string | null }> = ({ url }) => url ? <a href={url} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>보기</a> : <span style={{ color: '#cbd5e1' }}>-</span>;

const DjArtistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<DjArtist | null>(null);
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { element: modal, alert } = useAdminModal();

  const load = useCallback(async () => {
    const { data, error } = await djApi.get(id!);
    if (error) alert('불러오기 오류', error);
    if (data) { setItem(data); setMemo(data.admin_memo || ''); }
    setLoading(false);
  }, [id, alert]);
  useEffect(() => { load(); }, [load]);

  const setStatus = async (status: DjStatus) => {
    setSaving(true);
    const { error } = await djApi.setStatus(id!, status, memo);
    setSaving(false);
    if (error) alert('처리 오류', error); else { alert('처리 완료', `'${DJ_STATUS_LABEL[status]}' 처리되었습니다.`); load(); }
  };

  if (loading) return <Spinner />;
  if (!item) return <div>신청을 찾을 수 없습니다.</div>;

  const actBtn = (bg: string): React.CSSProperties => ({ display: 'inline-flex', alignItems: 'center', gap: '6px', background: bg, color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 18px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' });

  return (
    <div style={{ maxWidth: '760px' }}>
      <button style={{ ...btnGhost, marginBottom: '16px' }} onClick={() => navigate('/admin/dashboard/dj/artists')}><ArrowLeft size={16} /> 목록으로</button>

      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{item.stage_name || item.name} <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '0.9rem' }}>#{item.id}</span></h2>
          <span style={{ background: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: '0.82rem', padding: '6px 12px', borderRadius: '999px' }}>현재: {DJ_STATUS_LABEL[item.status]}</span>
        </div>

        <Row label="이름">{item.name}</Row>
        <Row label="활동명">{item.stage_name || '-'}</Row>
        <Row label="연락처">{item.phone || '-'}</Row>
        <Row label="이메일">{item.email || '-'}</Row>
        <Row label="신분증"><FileLink url={item.id_card_url} /></Row>
        <Row label="통장사본"><FileLink url={item.bankbook_url} /></Row>
        <Row label="이력서"><FileLink url={item.resume_url} /></Row>
        <Row label={`포트폴리오(${item.portfolio_type.toUpperCase()})`}>
          {item.portfolio_files?.length ? item.portfolio_files.map((u, i) => <a key={i} href={u} target="_blank" rel="noreferrer" style={{ color: '#2563eb', marginRight: '10px' }}>파일 {i + 1}</a>) : '-'}
        </Row>
        <Row label="사운드클라우드">{item.soundcloud_url ? <a href={item.soundcloud_url} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{item.soundcloud_url}</a> : '-'}</Row>
        <Row label="MP3">{item.mp3_url ? <a href={item.mp3_url} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{item.mp3_url}</a> : '-'}</Row>
        <Row label="유튜브">{item.youtube_url ? <a href={item.youtube_url} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{item.youtube_url}</a> : '-'}</Row>
        <Row label="소셜">{item.social_links?.length ? item.social_links.map((s, i) => <a key={i} href={s.url} target="_blank" rel="noreferrer" style={{ color: '#2563eb', marginRight: '10px' }}>{s.label || s.url}</a>) : '-'}</Row>
        <Row label="섭외 지역">{(item.regions || []).join(', ') || '-'}</Row>
        <Row label="게런티">서울 {won(item.guarantee_seoul)} · 경기 {won(item.guarantee_gyeonggi)} · 대전 {won(item.guarantee_daejeon)}</Row>
        <Row label="소개">{item.intro || '-'}</Row>
        <Row label="접수일">{fmtDate(item.created_at)}</Row>
      </div>

      <div style={{ ...card, marginTop: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '14px' }}>심사 처리</h3>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>관리자 메모</label>
          <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="심사 메모 / 게런티 협의 등" />
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button style={actBtn('#059669')} onClick={() => setStatus('approved')} disabled={saving}><Check size={16} /> 승인</button>
          <button style={actBtn('#d97706')} onClick={() => setStatus('hold')} disabled={saving}><Pause size={16} /> 보류</button>
          <button style={actBtn('#dc2626')} onClick={() => setStatus('rejected')} disabled={saving}><X size={16} /> 반려</button>
        </div>
      </div>
      {modal}
    </div>
  );
};

export default DjArtistDetail;
