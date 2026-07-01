import React, { useEffect, useMemo, useState } from 'react';
import { inquiryApi, type ConstructionInquiry } from '../../../api/constructionApi';
import { constructionWorkApi, WORK_STATUS_LABEL, WORK_STATUS_COLOR, type ConstructionWork, type WorkStatus } from '../../../api/opsApi';
import { PageHead, Spinner, useAdminModal } from '../../../components/admin/shared';
import { StatGrid, BarBreakdown } from '../../../components/admin/Stats';

const INQ_LABEL: Record<string, string> = { pending: '미답변', replied: '답변완료', hold: '보류' };
const INQ_COLOR: Record<string, string> = { pending: '#d97706', replied: '#059669', hold: '#94a3b8' };
const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;

const ConstructionStats: React.FC = () => {
  const [inquiries, setInquiries] = useState<ConstructionInquiry[]>([]);
  const [works, setWorks] = useState<ConstructionWork[]>([]);
  const [loading, setLoading] = useState(true);
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    (async () => {
      const [{ data: i, error: e1 }, { data: w, error: e2 }] = [await inquiryApi.list(), await constructionWorkApi.list()];
      if (e1 || e2) alert('불러오기 오류', e1 || e2 || '');
      setInquiries(i || []); setWorks(w || []);
      setLoading(false);
    })();
  }, [alert]);

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

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHead title="시공 내역 통계" desc="시공 문의 및 업무 진행 현황을 요약합니다." />
      <StatGrid cards={[
        { label: '전체 문의', value: inquiries.length },
        { label: '미답변', value: inquiries.filter((x) => x.status === 'pending').length, color: '#d97706' },
        { label: '전체 업무', value: works.length },
        { label: '진행중', value: works.filter((x) => x.status === 'in_progress').length, color: '#d97706' },
        { label: '완료', value: works.filter((x) => x.status === 'done').length, color: '#059669' },
        { label: '완료 시공금액', value: won(s.doneAmount), color: '#008b8b' },
      ]} />
      <BarBreakdown title="문의 상태 분포" rows={s.inqByStatus} unit="건" />
      <BarBreakdown title="업무 상태 분포" rows={s.workByStatus} unit="건" />
      <BarBreakdown title="최근 6개월 문의 추이" rows={s.months} unit="건" />
      {modal}
    </div>
  );
};

export default ConstructionStats;
