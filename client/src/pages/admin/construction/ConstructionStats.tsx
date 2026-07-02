import React, { useEffect, useMemo, useState } from 'react';
import { inquiryApi, type ConstructionInquiry } from '../../../api/constructionApi';
import { constructionWorkApi, WORK_STATUS_LABEL, WORK_STATUS_COLOR, type ConstructionWork, type WorkStatus } from '../../../api/opsApi';
import { PageHead, Spinner, fmtDate, useAdminModal } from '../../../components/admin/shared';
import { StatGrid } from '../../../components/admin/Stats';
import { DonutChart, ColumnChart } from '../../../components/admin/Charts';
import { PeriodSelect, periodStart, PERIOD_LABEL, ExportBtn, type PeriodKey } from '../../../components/admin/listTools';
import { exportToCsv } from '../../../utils/exportCsv';

const INQ_LABEL: Record<string, string> = { pending: '미답변', replied: '답변완료', hold: '보류' };
const INQ_COLOR: Record<string, string> = { pending: '#d97706', replied: '#059669', hold: '#94a3b8' };
const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;

const ConstructionStats: React.FC = () => {
  const [allInquiries, setAllInquiries] = useState<ConstructionInquiry[]>([]);
  const [allWorks, setAllWorks] = useState<ConstructionWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodKey>('all');
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    (async () => {
      const [{ data: i, error: e1 }, { data: w, error: e2 }] = await Promise.all([inquiryApi.list(), constructionWorkApi.list()]);
      if (e1 || e2) alert('불러오기 오류', e1 || e2 || '');
      setAllInquiries(i || []); setAllWorks(w || []);
      setLoading(false);
    })();
  }, [alert]);

  const from = periodStart(period);
  const inquiries = useMemo(() => (from ? allInquiries.filter((x) => (x.created_at || '') >= from) : allInquiries), [allInquiries, from]);
  const works = useMemo(() => (from ? allWorks.filter((x) => (x.created_at || '') >= from) : allWorks), [allWorks, from]);

  const s = useMemo(() => {
    const inqByStatus = Object.keys(INQ_LABEL).map((k) => ({ label: INQ_LABEL[k], value: inquiries.filter((x) => x.status === k).length, color: INQ_COLOR[k] }));
    const workByStatus = (Object.keys(WORK_STATUS_LABEL) as WorkStatus[]).map((k) => ({ label: WORK_STATUS_LABEL[k], value: works.filter((x) => x.status === k).length, color: WORK_STATUS_COLOR[k] }));
    // 최근 6개월 문의 추이
    const months: { label: string; value: number }[] = [];
    const base = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
      const ym = d.toISOString().slice(0, 7);
      months.push({ label: `${d.getMonth() + 1}월`, value: inquiries.filter((x) => (x.created_at || '').slice(0, 7) === ym).length });
    }
    const doneAmount = works.filter((w) => w.status === 'done').reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
    const totalAmount = works.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
    return { inqByStatus, workByStatus, months, doneAmount, totalAmount };
  }, [inquiries, works]);

  const doExport = () => exportToCsv(`시공통계_${PERIOD_LABEL[period]}`, [
    { header: '업무명', value: (w: ConstructionWork) => w.title },
    { header: '고객', value: (w) => w.customer_name },
    { header: '업체', value: (w) => w.company_name },
    { header: '담당자', value: (w) => w.assignee },
    { header: '시작일', value: (w) => w.scheduled_start },
    { header: '종료일', value: (w) => w.scheduled_end },
    { header: '금액', value: (w) => w.amount },
    { header: '상태', value: (w) => WORK_STATUS_LABEL[w.status] },
    { header: '등록일', value: (w) => fmtDate(w.created_at) },
  ], works);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHead title="시공 내역 통계" desc="시공 문의 및 업무 진행 현황을 요약합니다. 기간 필터는 접수/등록일 기준입니다."
        right={<div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><PeriodSelect value={period} onChange={setPeriod} /><ExportBtn onClick={doExport} disabled={works.length === 0} label="업무 CSV" /></div>} />
      <StatGrid cards={[
        { label: '전체 문의', value: inquiries.length },
        { label: '미답변', value: inquiries.filter((x) => x.status === 'pending').length, color: '#d97706' },
        { label: '전체 업무', value: works.length },
        { label: '진행중', value: works.filter((x) => x.status === 'in_progress').length, color: '#d97706' },
        { label: '완료', value: works.filter((x) => x.status === 'done').length, color: '#059669' },
        { label: '완료 시공금액', value: won(s.doneAmount), color: '#008b8b' },
      ]} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <DonutChart title="문의 상태 분포" data={s.inqByStatus} centerLabel="건" unit="건" />
        <DonutChart title="업무 상태 분포" data={s.workByStatus} centerLabel="건" unit="건" />
      </div>
      <ColumnChart title="최근 6개월 문의 추이" points={s.months} color="#0d9488" unit="건" />
      {modal}
    </div>
  );
};

export default ConstructionStats;
