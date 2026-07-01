import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { djEventApi, DJ_EVENT_STATUS_LABEL, DJ_EVENT_STATUS_COLOR, type DjEventInquiry, type DjEventStatus } from '../../../api/djApi';
import MonthCalendar, { type CalEvent } from '../../../components/admin/MonthCalendar';
import { PageHead, Spinner, useAdminModal } from '../../../components/admin/shared';
import { FilterChips } from '../../../components/admin/listTools';

const ALL_STATUS = Object.keys(DJ_EVENT_STATUS_LABEL);

const DjEventCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<DjEventInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Set<string>>(new Set(ALL_STATUS));
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
    .filter((e) => e.event_date && active.has(e.status))
    .map((e) => ({
      id: e.id,
      start: e.event_date!,
      label: e.artist_name || e.title,
      sub: e.region || e.title,
      color: DJ_EVENT_STATUS_COLOR[e.status] || '#2563eb',
      onClick: () => navigate(`/admin/dashboard/dj/event-inquiries/detail/${e.id}`),
    })), [events, active, navigate]);

  const toggle = (k: string) => setActive((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  if (loading) return <Spinner />;
  const now = new Date();

  return (
    <div>
      <PageHead title="DJ 행사 캘린더" desc="행사일이 지정된 DJ 섭외 문의(취소 제외)를 배정 DJ·지역으로 표기합니다. 상태 칩으로 표시를 필터링하고, 일정을 클릭하면 문의 상세로 이동합니다." />
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '14px', alignItems: 'center' }}>
        <FilterChips options={(ALL_STATUS as DjEventStatus[]).map((k) => ({ key: k, label: DJ_EVENT_STATUS_LABEL[k], color: DJ_EVENT_STATUS_COLOR[k] }))} active={active} onToggle={toggle} />
        <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '0.82rem', color: '#64748b' }}>표기 {cal.length}건</span>
      </div>
      <MonthCalendar initialYear={now.getFullYear()} initialMonth={now.getMonth()} events={cal} />
      {modal}
    </div>
  );
};

export default DjEventCalendar;
