import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { djEventApi, DJ_EVENT_STATUS_LABEL, DJ_EVENT_STATUS_COLOR, type DjEventInquiry } from '../../../api/djApi';
import MonthCalendar, { type CalEvent } from '../../../components/admin/MonthCalendar';
import { PageHead, Spinner, useAdminModal } from '../../../components/admin/shared';

const DjEventCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<DjEventInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    (async () => {
      const { data, error } = await djEventApi.scheduled();
      if (error) alert('불러오기 오류', error);
      setEvents(data || []);
      setLoading(false);
    })();
  }, [alert]);

  const cal: CalEvent[] = useMemo(() => events
    .filter((e) => e.event_date)
    .map((e) => ({
      id: e.id,
      start: e.event_date!,
      label: e.artist_name || e.title,
      sub: e.region || e.title,
      color: DJ_EVENT_STATUS_COLOR[e.status] || '#2563eb',
      onClick: () => navigate(`/admin/dashboard/dj/event-inquiries/detail/${e.id}`),
    })), [events, navigate]);

  if (loading) return <Spinner />;
  const now = new Date();

  return (
    <div>
      <PageHead title="DJ 행사 캘린더" desc="행사일이 지정된 DJ 섭외 문의(취소 제외)를 배정 DJ·지역으로 표기합니다. 일정을 클릭하면 문의 상세로 이동합니다." />
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '14px', fontSize: '0.82rem', color: '#64748b' }}>
        {Object.entries(DJ_EVENT_STATUS_LABEL).map(([k, label]) => (
          <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: DJ_EVENT_STATUS_COLOR[k as keyof typeof DJ_EVENT_STATUS_COLOR] }} /> {label}
          </span>
        ))}
        <span style={{ marginLeft: 'auto', fontWeight: 700 }}>표기 {cal.length}건</span>
      </div>
      <MonthCalendar initialYear={now.getFullYear()} initialMonth={now.getMonth()} events={cal} />
      {modal}
    </div>
  );
};

export default DjEventCalendar;
