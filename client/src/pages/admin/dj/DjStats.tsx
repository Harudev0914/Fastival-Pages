import React, { useEffect, useMemo, useState } from 'react';
import { djApi, djEventApi, DJ_STATUS_LABEL, DJ_EVENT_STATUS_LABEL, DJ_EVENT_STATUS_COLOR, KR_REGIONS, regionToKR, type DjArtist, type DjEventInquiry, type DjStatus, type DjEventStatus } from '../../../api/djApi';
import { PageHead, Spinner, fmtDate, useAdminModal } from '../../../components/admin/shared';
import { StatGrid } from '../../../components/admin/Stats';
import { DonutChart } from '../../../components/admin/Charts';
import KoreaMap from '../../../components/admin/KoreaMap';
import { PeriodSelect, periodStart, PERIOD_LABEL, ExportBtn, type PeriodKey } from '../../../components/admin/listTools';
import { exportToCsv } from '../../../utils/exportCsv';

const DjStats: React.FC = () => {
  const [artists, setArtists] = useState<DjArtist[]>([]);
  const [allEvents, setAllEvents] = useState<DjEventInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodKey>('all');
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    (async () => {
      const [{ data: a, error: e1 }, { data: ev, error: e2 }] = [await djApi.list(), await djEventApi.list()];
      if (e1 || e2) alert('불러오기 오류', e1 || e2 || '');
      setArtists(a || []); setAllEvents(ev || []);
      setLoading(false);
    })();
  }, [alert]);

  // 행사 문의만 기간 필터(접수일 기준). 아티스트 로스터는 전체 유지
  const events = useMemo(() => {
    const f = periodStart(period);
    return f ? allEvents.filter((e) => (e.created_at || '') >= f) : allEvents;
  }, [allEvents, period]);

  const stats = useMemo(() => {
    const ym = new Date().toISOString().slice(0, 7);
    const approved = artists.filter((a) => a.status === 'approved');
    const thisMonth = events.filter((e) => (e.event_date || '').slice(0, 7) === ym && e.status !== 'cancelled');
    const DJ_STATUS_COLOR: Record<DjStatus, string> = { pending: '#f59e0b', approved: '#10b981', hold: '#94a3b8', rejected: '#f43f5e' };
    const artistByStatus = (Object.keys(DJ_STATUS_LABEL) as DjStatus[]).map((k) => ({ label: DJ_STATUS_LABEL[k], value: artists.filter((a) => a.status === k).length, color: DJ_STATUS_COLOR[k] }));
    const eventByStatus = (Object.keys(DJ_EVENT_STATUS_LABEL) as DjEventStatus[]).map((k) => ({ label: DJ_EVENT_STATUS_LABEL[k], value: events.filter((e) => e.status === k).length, color: DJ_EVENT_STATUS_COLOR[k] }));
    // 지역별 승인(출장 가능) 아티스트 수 — 전국 17개 시·도 정규화 집계
    const regionMap: Record<string, number> = {};
    KR_REGIONS.forEach((r) => { regionMap[r] = 0; });
    approved.forEach((a) => {
      const set = new Set<string>();
      (a.regions || []).forEach((rg) => { const kr = regionToKR(rg); if (kr) set.add(kr); });
      set.forEach((kr) => { regionMap[kr] = (regionMap[kr] || 0) + 1; });
    });
    return { approved, thisMonth, artistByStatus, eventByStatus, regionMap };
  }, [artists, events]);

  const doExport = () => exportToCsv(`DJ통계_${PERIOD_LABEL[period]}`, [
    { header: '행사명', value: (e: DjEventInquiry) => e.title },
    { header: '고객', value: (e) => e.customer_name },
    { header: '행사일', value: (e) => e.event_date },
    { header: '지역', value: (e) => e.region },
    { header: '배정DJ', value: (e) => e.artist_name },
    { header: '예산', value: (e) => e.budget },
    { header: '상태', value: (e) => DJ_EVENT_STATUS_LABEL[e.status] },
    { header: '접수일', value: (e) => fmtDate(e.created_at) },
  ], events);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHead title="DJ 행사 통계" desc="DJ 입점 및 행사 섭외 현황을 요약합니다. 기간 필터는 행사 문의 접수일 기준입니다."
        right={<div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><PeriodSelect value={period} onChange={setPeriod} /><ExportBtn onClick={doExport} disabled={events.length === 0} label="행사 CSV" /></div>} />
      <StatGrid cards={[
        { label: '전체 아티스트', value: artists.length },
        { label: '승인 아티스트', value: stats.approved.length, color: '#059669' },
        { label: '입점 대기', value: artists.filter((a) => a.status === 'pending').length, color: '#d97706' },
        { label: '전체 행사 문의', value: events.length },
        { label: '확정 행사', value: events.filter((e) => e.status === 'confirmed' || e.status === 'done').length, color: '#2563eb' },
        { label: '이번 달 행사', value: stats.thisMonth.length, sub: new Date().toISOString().slice(0, 7) },
      ]} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <DonutChart title="입점 상태 분포" data={stats.artistByStatus} centerLabel="명" unit="명" />
        <DonutChart title="행사 문의 상태 분포" data={stats.eventByStatus} centerLabel="건" unit="건" />
      </div>
      <KoreaMap title="지역별 승인 아티스트 (출장 가능 지역)" data={stats.regionMap} color="#7c3aed" unit="명" />
      {modal}
    </div>
  );
};

export default DjStats;
