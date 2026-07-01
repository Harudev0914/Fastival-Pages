import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Pause, X } from 'lucide-react';
import { djApi, DJ_STATUS_LABEL, type DjArtist, type DjStatus } from '../../../api/djApi';
import { inputStyle, labelStyle, useAdminModal, Spinner, fmtDate, DetailHead, StatusPill, FormSection } from '../../../components/admin/shared';

const won = (n: number | null) => (n == null ? '-' : `₩${Number(n).toLocaleString()}`);

const InfoRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', padding: '11px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
    <div style={{ width: '130px', color: '#94a3b8', flexShrink: 0 }}>{label}</div>
    <div style={{ color: '#1e293b', fontWeight: 600, wordBreak: 'break-all' }}>{children}</div>
  </div>
);
const FileLink: React.FC<{ url: string | null }> = ({ url }) => url ? <a href={url} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>보기</a> : <span style={{ color: '#cbd5e1' }}>-</span>;

const STATUS_COLOR: Record<DjStatus, string> = { approved: '#059669', hold: '#d97706', rejected: '#dc2626', pending: '#94a3b8' };

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
      <DetailHead
        title={`${item.stage_name || item.name} #${item.id}`}
        onBack={() => navigate('/admin/dashboard/dj/artists')}
        badge={<StatusPill label={DJ_STATUS_LABEL[item.status]} color={STATUS_COLOR[item.status] || '#94a3b8'} />}
      />

      <FormSection title="신청 정보">
        <InfoRow label="이름">{item.name}</InfoRow>
        <InfoRow label="활동명">{item.stage_name || '-'}</InfoRow>
        <InfoRow label="연락처">{item.phone || '-'}</InfoRow>
        <InfoRow label="이메일">{item.email || '-'}</InfoRow>
        <InfoRow label="신분증"><FileLink url={item.id_card_url} /></InfoRow>
        <InfoRow label="통장사본"><FileLink url={item.bankbook_url} /></InfoRow>
        <InfoRow label="이력서"><FileLink url={item.resume_url} /></InfoRow>
        <InfoRow label={`포트폴리오(${item.portfolio_type.toUpperCase()})`}>
          {item.portfolio_files?.length ? item.portfolio_files.map((u, i) => <a key={i} href={u} target="_blank" rel="noreferrer" style={{ color: '#2563eb', marginRight: '10px' }}>파일 {i + 1}</a>) : '-'}
        </InfoRow>
        <InfoRow label="사운드클라우드">{item.soundcloud_url ? <a href={item.soundcloud_url} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{item.soundcloud_url}</a> : '-'}</InfoRow>
        <InfoRow label="MP3">{item.mp3_url ? <a href={item.mp3_url} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{item.mp3_url}</a> : '-'}</InfoRow>
        <InfoRow label="유튜브">{item.youtube_url ? <a href={item.youtube_url} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{item.youtube_url}</a> : '-'}</InfoRow>
        <InfoRow label="소셜">{item.social_links?.length ? item.social_links.map((s, i) => <a key={i} href={s.url} target="_blank" rel="noreferrer" style={{ color: '#2563eb', marginRight: '10px' }}>{s.label || s.url}</a>) : '-'}</InfoRow>
        <InfoRow label="섭외 지역">{(item.regions || []).join(', ') || '-'}</InfoRow>
        <InfoRow label="게런티">{(() => {
          const gm = item.guarantees && Object.keys(item.guarantees).length
            ? item.guarantees
            : { 서울: item.guarantee_seoul, 경기: item.guarantee_gyeonggi, 대전: item.guarantee_daejeon };
          const entries = Object.entries(gm).filter(([, v]) => v != null);
          return entries.length ? entries.map(([r, v]) => `${r} ${won(v as number)}`).join(' · ') : '-';
        })()}</InfoRow>
        <InfoRow label="소개">{item.intro || '-'}</InfoRow>
        <InfoRow label="접수일">{fmtDate(item.created_at)}</InfoRow>
      </FormSection>

      <FormSection title="심사 처리">
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>관리자 메모</label>
          <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="심사 메모 / 게런티 협의 등" />
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button style={actBtn('#059669')} onClick={() => setStatus('approved')} disabled={saving}><Check size={16} /> 승인</button>
          <button style={actBtn('#d97706')} onClick={() => setStatus('hold')} disabled={saving}><Pause size={16} /> 보류</button>
          <button style={actBtn('#dc2626')} onClick={() => setStatus('rejected')} disabled={saving}><X size={16} /> 반려</button>
        </div>
      </FormSection>
      {modal}
    </div>
  );
};

export default DjArtistDetail;
