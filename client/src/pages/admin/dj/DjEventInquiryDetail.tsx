import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { djApi, djEventApi, DJ_EVENT_STATUS_LABEL, DJ_EVENT_STATUS_COLOR, type DjArtist, type DjEventStatus } from '../../../api/djApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import { inputStyle, btnPrimary, btnGhost, useAdminModal, Spinner, DetailHead, StatusPill, FormSection, Field, Row } from '../../../components/admin/shared';

const LIST = '/admin/dashboard/dj/event-inquiries';
const sel = SELECT_STYLE as React.CSSProperties;

const DjEventInquiryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [artists, setArtists] = useState<DjArtist[]>([]);
  const [title, setTitle] = useState('');
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [region, setRegion] = useState('');
  const [venue, setVenue] = useState('');
  const [budget, setBudget] = useState('');
  const [artistId, setArtistId] = useState<number | ''>('');
  const [guests, setGuests] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<DjEventStatus>('pending');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    (async () => {
      const { data: as } = await djApi.list();
      setArtists((as || []).filter((a) => a.status === 'approved'));
      if (!isNew) {
        const { data, error } = await djEventApi.get(id!);
        if (error) alert('불러오기 오류', error);
        if (data) {
          setTitle(data.title); setCName(data.customer_name || ''); setCPhone(data.customer_phone || ''); setCEmail(data.customer_email || '');
          setEventDate(data.event_date || ''); setEventTime(data.event_time || ''); setRegion(data.region || ''); setVenue(data.venue || '');
          setBudget(data.budget != null ? String(data.budget) : ''); setArtistId(data.artist_id ?? ''); setGuests(data.guests != null ? String(data.guests) : '');
          setMessage(data.message || ''); setStatus(data.status); setMemo(data.admin_memo || '');
        }
      }
      setLoading(false);
    })();
  }, [id, isNew, alert]);

  const save = async () => {
    if (!title.trim()) return alert('입력 필요', '행사명을 입력해주세요.');
    setSaving(true);
    const a = artists.find((x) => x.id === artistId);
    const input = {
      title, customer_name: cName, customer_phone: cPhone, customer_email: cEmail,
      event_date: eventDate || null, event_time: eventTime || null, region, venue,
      budget: budget ? Number(budget) : null, artist_id: artistId || null, artist_name: a ? (a.stage_name || a.name) : null,
      guests: guests ? Number(guests) : null, message, status, admin_memo: memo,
    };
    const { error } = isNew ? await djEventApi.create(input) : await djEventApi.update(id!, input);
    setSaving(false);
    if (error) alert('저장 오류', error); else alert('저장 완료', '저장되었습니다.', () => navigate(LIST));
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '860px' }}>
      <DetailHead
        title={isNew ? 'DJ 행사 문의 등록' : 'DJ 행사 문의 수정'}
        onBack={() => navigate(LIST)}
        badge={!isNew ? <StatusPill label={DJ_EVENT_STATUS_LABEL[status]} color={DJ_EVENT_STATUS_COLOR[status]} /> : undefined}
        right={<button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>}
      />

      <FormSection title="행사 개요">
        <div style={{ marginBottom: '4px' }}>
          <Row>
            <Field label="행사명" required minWidth="100%"><input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: OO클럽 오픈 파티" /></Field>
          </Row>
        </div>
        <Row>
          <Field label="행사일"><input type="date" style={inputStyle} value={eventDate} onChange={(e) => setEventDate(e.target.value)} /></Field>
          <Field label="시간"><input style={inputStyle} value={eventTime} onChange={(e) => setEventTime(e.target.value)} placeholder="예: 20:00~24:00" /></Field>
          <Field label="예상 인원"><input type="number" min={0} style={inputStyle} value={guests} onChange={(e) => setGuests(e.target.value)} /></Field>
        </Row>
        <Row>
          <Field label="지역"><input style={inputStyle} value={region} onChange={(e) => setRegion(e.target.value)} placeholder="예: 서울" /></Field>
          <Field label="장소" flex={2} minWidth="200px"><input style={inputStyle} value={venue} onChange={(e) => setVenue(e.target.value)} /></Field>
        </Row>
      </FormSection>

      <FormSection title="고객 정보">
        <Row>
          <Field label="고객명"><input style={inputStyle} value={cName} onChange={(e) => setCName(e.target.value)} /></Field>
          <Field label="연락처"><input style={inputStyle} value={cPhone} onChange={(e) => setCPhone(e.target.value)} /></Field>
          <Field label="이메일"><input style={inputStyle} value={cEmail} onChange={(e) => setCEmail(e.target.value)} /></Field>
        </Row>
      </FormSection>

      <FormSection title="섭외 · 진행">
        <Row>
          <Field label="예산(원)"><input type="number" min={0} style={inputStyle} value={budget} onChange={(e) => setBudget(e.target.value)} /></Field>
          <Field label="배정 DJ">
            <select style={{ ...sel, width: '100%' }} value={artistId} onChange={(e) => setArtistId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">미배정</option>
              {artists.map((a) => <option key={a.id} value={a.id}>{a.stage_name || a.name}</option>)}
            </select>
          </Field>
          <Field label="상태">
            <select style={{ ...sel, width: '100%' }} value={status} onChange={(e) => setStatus(e.target.value as DjEventStatus)}>
              {(Object.keys(DJ_EVENT_STATUS_LABEL) as DjEventStatus[]).map((k) => <option key={k} value={k}>{DJ_EVENT_STATUS_LABEL[k]}</option>)}
            </select>
          </Field>
        </Row>
      </FormSection>

      <FormSection title="문의 내용 · 메모">
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>문의 내용</label>
          <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>관리자 메모</label>
          <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="상담/견적/게런티 협의 등" />
        </div>
      </FormSection>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button style={btnGhost} onClick={() => navigate(LIST)}>취소</button>
        <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
      </div>
      {modal}
    </div>
  );
};

export default DjEventInquiryDetail;
