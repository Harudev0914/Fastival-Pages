import React, { useEffect, useMemo, useState } from 'react';
import { Crown, Users, TrendingUp, CalendarPlus } from 'lucide-react';
import { djApi, isPremiumActive, regionToKR, KR_REGIONS, type DjArtist } from '../../../api/djApi';
import { PageHead, Spinner, useAdminModal } from '../../../components/admin/shared';
import { StatGrid } from '../../../components/admin/Stats';
import { DonutChart, ColumnChart, CategoryBarChart, PALETTE } from '../../../components/admin/Charts';
import KoreaMap from '../../../components/admin/KoreaMap';

const AGE_ORDER = ['10대', '20대', '30대', '40대', '50대+'];
const ageBucket = (birthYear: number, now: number): string => {
  const age = now - birthYear;
  if (age < 20) return '10대';
  if (age < 30) return '20대';
  if (age < 40) return '30대';
  if (age < 50) return '40대';
  return '50대+';
};

const SubscriptionStats: React.FC = () => {
  const [artists, setArtists] = useState<DjArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    (async () => {
      const { data, error } = await djApi.list();
      if (error) alert('불러오기 오류', error);
      setArtists((data || []).filter((a) => a.status === 'approved'));
      setLoading(false);
    })();
  }, [alert]);

  const s = useMemo(() => {
    const nowY = new Date().getFullYear();
    const ym = new Date().toISOString().slice(0, 7);
    const total = artists.length;
    const premium = artists.filter(isPremiumActive);
    const expired = artists.filter((a) => a.subscription_plan === 'premium' && !isPremiumActive(a));
    const free = artists.filter((a) => a.subscription_plan !== 'premium');
    const conversion = total ? Math.round((premium.length / total) * 1000) / 10 : 0;
    const monthNew = artists.filter((a) => (a.subscription_started || '').slice(0, 7) === ym).length;

    // 플랜 분포(도넛)
    const planDist = [
      { label: '프리미엄(활성)', value: premium.length, color: '#7c3aed' },
      { label: '구독 만료', value: expired.length, color: '#dc2626' },
      { label: '무료', value: free.length, color: '#94a3b8' },
    ];
    // 연령대별 프리미엄
    const ageMap: Record<string, number> = {};
    premium.forEach((a) => { if (a.birth_year) { const b = ageBucket(a.birth_year, nowY); ageMap[b] = (ageMap[b] || 0) + 1; } });
    const ageRows = AGE_ORDER.filter((k) => ageMap[k]).map((k, i) => ({ label: k, value: ageMap[k], color: PALETTE[i % PALETTE.length] }));
    // 지역별 프리미엄 (전국 17개 시·도 정규화)
    const regionMap: Record<string, number> = {};
    KR_REGIONS.forEach((r) => { regionMap[r] = 0; });
    premium.forEach((a) => {
      const set = new Set<string>();
      (a.regions || []).forEach((rg) => { const kr = regionToKR(rg); if (kr) set.add(kr); });
      set.forEach((kr) => { regionMap[kr] = (regionMap[kr] || 0) + 1; });
    });
    // 최근 6개월 신규 구독 추이
    const months: { label: string; value: number }[] = [];
    const base = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      months.push({ label: `${d.getMonth() + 1}월`, value: artists.filter((a) => (a.subscription_started || '').slice(0, 7) === key).length });
    }
    return { total, premiumCount: premium.length, conversion, monthNew, planDist, ageRows, regionMap, months };
  }, [artists]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHead title="구독 통계" desc="DJ 아티스트의 프리미엄 구독 전환율과 연령·지역별 구독 현황을 요약합니다." />
      <StatGrid cards={[
        { label: '승인 아티스트', value: s.total, icon: <Users size={17} />, color: '#0d9488' },
        { label: '프리미엄 구독', value: s.premiumCount, icon: <Crown size={17} />, color: '#7c3aed', sub: '활성 구독' },
        { label: '유료 전환율', value: `${s.conversion}%`, icon: <TrendingUp size={17} />, color: '#db2777', sub: '프리미엄 / 전체' },
        { label: '이번 달 신규 구독', value: s.monthNew, icon: <CalendarPlus size={17} />, color: '#3b82f6', sub: new Date().toISOString().slice(0, 7) },
      ]} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <DonutChart title="플랜 분포" data={s.planDist} centerLabel="명" unit="명" />
        <CategoryBarChart title="연령대별 프리미엄 구독" data={s.ageRows} unit="명" />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <KoreaMap title="지역별 프리미엄 구독" data={s.regionMap} color="#7c3aed" unit="명" />
      </div>
      <ColumnChart title="최근 6개월 신규 구독 추이" points={s.months} color="#7c3aed" unit="명" />
      {modal}
    </div>
  );
};

export default SubscriptionStats;
