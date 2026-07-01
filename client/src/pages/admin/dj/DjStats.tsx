import React, { useEffect, useMemo, useState } from 'react';
import { djApi, djEventApi, DJ_STATUS_LABEL, DJ_EVENT_STATUS_LABEL, DJ_EVENT_STATUS_COLOR, DJ_REGIONS, type DjArtist, type DjEventInquiry, type DjStatus, type DjEventStatus } from '../../../api/djApi';
import { PageHead, Spinner, useAdminModal } from '../../../components/admin/shared';
import { StatGrid, BarBreakdown } from '../../../components/admin/Stats';

const DjStats: React.FC = () => {
  const [artists, setArtists] = useState<DjArtist[]>([]);
  const [events, setEvents] = useState<DjEventInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    (async () => {
      const [{ data: a, error: e1 }, { data: ev, error: e2 }] = [await djApi.list(), await djEventApi.list()];
      if (e1 || e2) alert('불러오기 오류', e1 || e2 || '');
      setArtists(a || []); setEvents(ev || []);
      setLoading(false);
    })();
  }, [alert]);

  const stats = useMemo(() => {
    const ym = new Date().toISOString().slice(0, 7);
    const approved = artists.filter((a) => a.status === 'approved');
    const thisMonth = events.filter((e) => (e.event_date || '').slice(0, 7) === ym && e.status !== 'cancelled');
    const artistByStatus = (Object.keys(DJ_STATUS_LABEL) as DjStatus[]).map((k) => ({ label: DJ_STATUS_LABEL[k], value: artists.filter((a) => a.status === k).length }));
    const eventByStatus = (Object.keys(DJ_EVENT_STATUS_LABEL) as DjEventStatus[]).map((k) => ({ label: DJ_EVENT_STATUS_LABEL[k], value: events.filter((e) => e.status === k).length, color: DJ_EVENT_STATUS_COLOR[k] }));
    const byRegion = DJ_REGIONS.map((r) => ({ label: r, value: approved.filter((a) => (a.regions || []).includes(r)).length, color: '#7c3aed' }));
    return { approved, thisMonth, artistByStatus, eventByStatus, byRegion };
  }, [artists, events]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHead title="DJ 행사 통계" desc="DJ 입점 및 행사 섭외 현황을 요약합니다." />
      <StatGrid cards={[
        { label: '전체 아티스트', value: artists.length },
        { label: '승인 아티스트', value: stats.approved.length, color: '#059669' },
        { label: '입점 대기', value: artists.filter((a) => a.status === 'pending').length, color: '#d97706' },
        { label: '전체 행사 문의', value: events.length },
        { label: '확정 행사', value: events.filter((e) => e.status === 'confirmed' || e.status === 'done').length, color: '#2563eb' },
        { label: '이번 달 행사', value: stats.thisMonth.length, sub: new Date().toISOString().slice(0, 7) },
      ]} />
      <BarBreakdown title="입점 상태 분포" rows={stats.artistByStatus} unit="명" />
      <BarBreakdown title="행사 문의 상태 분포" rows={stats.eventByStatus} unit="건" />
      <BarBreakdown title="지역별 승인 아티스트" rows={stats.byRegion} unit="명" />
      {modal}
    </div>
  );
};

export default DjStats;
