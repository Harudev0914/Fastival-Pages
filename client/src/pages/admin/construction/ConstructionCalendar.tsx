import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { constructionWorkApi, WORK_STATUS_LABEL, WORK_STATUS_COLOR, type ConstructionWork, type WorkStatus } from '../../../api/opsApi';
import MonthCalendar, { type CalEvent } from '../../../components/admin/MonthCalendar';
import { PageHead, Spinner, useAdminModal } from '../../../components/admin/shared';
import { FilterChips } from '../../../components/admin/listTools';

const ALL_STATUS = Object.keys(WORK_STATUS_LABEL);

const ConstructionCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [works, setWorks] = useState<ConstructionWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Set<string>>(new Set(ALL_STATUS));
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    (async () => {
      const { data, error } = await constructionWorkApi.scheduled();
      if (error) alert('불러오기 오류', error);
      setWorks(data || []);
      setLoading(false);
    })();
  }, [alert]);

  // 담당자 배정(일정 존재)된 업무 → 담당자/업체명으로 캘린더 표기
  const events: CalEvent[] = useMemo(() => works
    .filter((w) => w.scheduled_start && active.has(w.status))
    .map((w) => ({
      id: w.id,
      start: w.scheduled_start!,
      end: w.scheduled_end || w.scheduled_start,
      label: w.assignee || w.title,
      sub: w.company_name || undefined,
      color: WORK_STATUS_COLOR[w.status] || '#2563eb',
      onClick: () => navigate(`/admin/dashboard/construction/works/detail/${w.id}`),
    })), [works, active, navigate]);

  const toggle = (k: string) => setActive((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  if (loading) return <Spinner />;
  const now = new Date();

  return (
    <div>
      <PageHead title="시공 내역 캘린더" desc="담당자·업체가 배정되고 일정이 잡힌 시공 업무를 담당자/업체명으로 표기합니다. 상태 칩으로 표시를 필터링하고, 일정을 클릭하면 업무 상세로 이동합니다." />
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '14px', alignItems: 'center' }}>
        <FilterChips options={(ALL_STATUS as WorkStatus[]).map((k) => ({ key: k, label: WORK_STATUS_LABEL[k], color: WORK_STATUS_COLOR[k] }))} active={active} onToggle={toggle} />
        <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '0.82rem', color: '#64748b' }}>표기 {events.length}건</span>
      </div>
      <MonthCalendar initialYear={now.getFullYear()} initialMonth={now.getMonth()} events={events} />
      {modal}
    </div>
  );
};

export default ConstructionCalendar;
