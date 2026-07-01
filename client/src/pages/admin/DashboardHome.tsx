import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Hammer, Package, Disc3, Receipt, ArrowRight, Clock } from 'lucide-react';
import { inquiryApi, type ConstructionInquiry } from '../../api/constructionApi';
import { constructionWorkApi, estimateApi, WORK_STATUS_LABEL, WORK_STATUS_COLOR, type ConstructionWork, type Estimate } from '../../api/opsApi';
import { orderApi, ORDER_LABEL, type RentalOrder } from '../../api/rentalApi';
import { djEventApi, type DjEventInquiry } from '../../api/djApi';
import MonthCalendar, { type CalEvent } from '../../components/admin/MonthCalendar';
import { StatGrid, BarBreakdown } from '../../components/admin/Stats';
import { FilterChips } from '../../components/admin/listTools';
import { card, Spinner, fmtDate } from '../../components/admin/shared';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;
const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

// 도메인별 색상(캘린더/활동 구분)
const DOMAIN = {
  construction: { key: 'construction', label: '시공', color: '#0891b2' },
  rental: { key: 'rental', label: '렌탈', color: '#7c3aed' },
  dj: { key: 'dj', label: 'DJ', color: '#db2777' },
};

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { can } = useAdminPermissions();
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<ConstructionInquiry[]>([]);
  const [works, setWorks] = useState<ConstructionWork[]>([]);
  const [orders, setOrders] = useState<RentalOrder[]>([]);
  const [events, setEvents] = useState<DjEventInquiry[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [domains, setDomains] = useState<Set<string>>(new Set(['construction', 'rental', 'dj']));

  useEffect(() => {
    (async () => {
      // 권한 없는 도메인은 호출 실패해도 무시(0으로 표시)
      const [inq, wk, od, ev, ec, er, ed] = await Promise.all([
        inquiryApi.list().catch(() => ({ data: [] as ConstructionInquiry[] })),
        constructionWorkApi.list().catch(() => ({ data: [] as ConstructionWork[] })),
        orderApi.list().catch(() => ({ data: [] as RentalOrder[] })),
        djEventApi.list().catch(() => ({ data: [] as DjEventInquiry[] })),
        estimateApi.list('construction').catch(() => ({ data: [] as Estimate[] })),
        estimateApi.list('rental').catch(() => ({ data: [] as Estimate[] })),
        estimateApi.list('dj').catch(() => ({ data: [] as Estimate[] })),
      ]);
      setInquiries(inq.data || []);
      setWorks(wk.data || []);
      setOrders(od.data || []);
      setEvents(ev.data || []);
      setEstimates([...(ec.data || []), ...(er.data || []), ...(ed.data || [])]);
      setLoading(false);
    })();
  }, []);

  const kpis = useMemo(() => {
    const thisYm = ym(new Date());
    const monthRevenue = orders.filter((o) => o.payment_status === 'paid' && (o.created_at || '').slice(0, 7) === thisYm).reduce((s, o) => s + (Number(o.total_amount) || 0), 0);
    return {
      inqPending: inquiries.filter((i) => i.status === 'pending').length,
      workActive: works.filter((w) => w.status === 'in_progress' || w.status === 'assigned').length,
      monthRevenue,
      djConfirmed: events.filter((e) => e.status === 'confirmed').length,
      estOpen: estimates.filter((e) => e.status === 'draft' || e.status === 'sent').length,
      orderReserved: orders.filter((o) => o.order_status === 'reserved').length,
    };
  }, [inquiries, works, orders, events, estimates]);

  // 예정 일정(캘린더): 시공 업무 + 렌탈 대여기간 + DJ 행사
  const calEvents: CalEvent[] = useMemo(() => {
    const out: CalEvent[] = [];
    if (domains.has('construction')) works.filter((w) => w.scheduled_start).forEach((w) => out.push({
      id: `w${w.id}`, start: w.scheduled_start!, end: w.scheduled_end || w.scheduled_start, label: w.assignee || w.title, sub: '시공',
      color: DOMAIN.construction.color, onClick: () => navigate(`/admin/dashboard/construction/works/detail/${w.id}`),
    }));
    if (domains.has('rental')) orders.filter((o) => o.rental_start && o.order_status !== 'cancelled').forEach((o) => out.push({
      id: `o${o.id}`, start: o.rental_start!, end: o.rental_end || o.rental_start, label: o.product_name || '렌탈', sub: o.customer_name || undefined,
      color: DOMAIN.rental.color, onClick: () => navigate(`/admin/dashboard/rental/orders/detail/${o.id}`),
    }));
    if (domains.has('dj')) events.filter((e) => e.event_date && e.status !== 'cancelled').forEach((e) => out.push({
      id: `e${e.id}`, start: e.event_date!, label: e.artist_name || e.title, sub: 'DJ',
      color: DOMAIN.dj.color, onClick: () => navigate(`/admin/dashboard/dj/event-inquiries/detail/${e.id}`),
    }));
    return out;
  }, [works, orders, events, domains, navigate]);

  // 최근 활동 피드(도메인 통합, 최신순 8건)
  const recent = useMemo(() => {
    type Row = { id: string; at: string; icon: React.ReactNode; text: string; tag: string; color: string; onClick: () => void };
    const rows: Row[] = [];
    inquiries.forEach((i) => rows.push({ id: `i${i.id}`, at: i.created_at, icon: <MessageSquare size={15} />, text: `시공 문의 · ${i.name || '고객'}`, tag: '시공문의', color: DOMAIN.construction.color, onClick: () => navigate(`/admin/dashboard/inquiries/detail/${i.id}`) }));
    orders.forEach((o) => rows.push({ id: `o${o.id}`, at: o.created_at, icon: <Package size={15} />, text: `렌탈 주문 · ${o.product_name || '-'}`, tag: '렌탈주문', color: DOMAIN.rental.color, onClick: () => navigate(`/admin/dashboard/rental/orders/detail/${o.id}`) }));
    events.forEach((e) => rows.push({ id: `e${e.id}`, at: e.created_at, icon: <Disc3 size={15} />, text: `DJ 행사 문의 · ${e.title}`, tag: 'DJ문의', color: DOMAIN.dj.color, onClick: () => navigate(`/admin/dashboard/dj/event-inquiries/detail/${e.id}`) }));
    estimates.forEach((e) => rows.push({ id: `q${e.id}`, at: e.created_at, icon: <Receipt size={15} />, text: `견적서 · ${e.title}`, tag: '견적서', color: '#008b8b', onClick: () => navigate(`/admin/dashboard/estimates/${e.type}/detail/${e.id}`) }));
    return rows.filter((r) => r.at).sort((a, b) => (b.at || '').localeCompare(a.at || '')).slice(0, 8);
  }, [inquiries, orders, events, estimates, navigate]);

  const statusBars = useMemo(() => ({
    work: (Object.keys(WORK_STATUS_LABEL) as (keyof typeof WORK_STATUS_LABEL)[]).map((k) => ({ label: WORK_STATUS_LABEL[k], value: works.filter((w) => w.status === k).length, color: WORK_STATUS_COLOR[k] })),
    order: (Object.keys(ORDER_LABEL) as (keyof typeof ORDER_LABEL)[]).map((k) => ({ label: ORDER_LABEL[k], value: orders.filter((o) => o.order_status === k).length, color: '#7c3aed' })),
  }), [works, orders]);

  if (loading) return <Spinner />;
  const now = new Date();

  const quickLinks: { key: string; label: string; icon: React.ReactNode; path: string; color: string }[] = [
    { key: 'construction/inquiries', label: '시공 문의', icon: <MessageSquare size={18} />, path: '/admin/dashboard/inquiries', color: '#0891b2' },
    { key: 'construction/works', label: '시공 업무', icon: <Hammer size={18} />, path: '/admin/dashboard/construction/works', color: '#0d9488' },
    { key: 'rental/orders', label: '렌탈 주문', icon: <Package size={18} />, path: '/admin/dashboard/rental/orders', color: '#7c3aed' },
    { key: 'dj/event-inquiries', label: 'DJ 행사 문의', icon: <Disc3 size={18} />, path: '/admin/dashboard/dj/event-inquiries', color: '#db2777' },
    { key: 'estimates/construction', label: '견적서', icon: <Receipt size={18} />, path: '/admin/dashboard/estimates/construction', color: '#008b8b' },
  ].filter((q) => can(q.key));

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <StatGrid cards={[
        { label: '미답변 시공 문의', value: kpis.inqPending, color: kpis.inqPending ? '#d97706' : '#1e293b', sub: '답변 대기' },
        { label: '진행중 시공 업무', value: kpis.workActive, color: '#0d9488', sub: '배정·진행' },
        { label: '이번 달 렌탈 매출', value: won(kpis.monthRevenue), color: '#008b8b', sub: ym(now) },
        { label: '확정 DJ 행사', value: kpis.djConfirmed, color: '#db2777', sub: '섭외 확정' },
        { label: '미처리 견적서', value: kpis.estOpen, color: '#2563eb', sub: '작성중·발송' },
        { label: '신규 렌탈 예약', value: kpis.orderReserved, color: '#7c3aed', sub: '예약 상태' },
      ]} />

      {/* 바로가기 */}
      {quickLinks.length > 0 && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {quickLinks.map((q) => (
            <button key={q.key} onClick={() => navigate(q.path)}
              style={{ ...card, padding: '14px 18px', display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer', border: '1px solid #e2e8f0', fontWeight: 700, color: '#334155' }}>
              <span style={{ width: '34px', height: '34px', borderRadius: '10px', background: `${q.color}15`, color: q.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{q.icon}</span>
              {q.label} <ArrowRight size={15} color="#cbd5e1" />
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '20px', alignItems: 'start' }}>
        {/* 일정 캘린더 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '10px', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>통합 일정</h3>
            <FilterChips
              options={[DOMAIN.construction, DOMAIN.rental, DOMAIN.dj]}
              active={domains}
              onToggle={(k) => setDomains((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; })}
            />
          </div>
          <MonthCalendar initialYear={now.getFullYear()} initialMonth={now.getMonth()} events={calEvents} />
        </div>

        {/* 최근 활동 */}
        <div style={{ ...card, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Clock size={16} color="#008b8b" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>최근 활동</h3>
          </div>
          {recent.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>최근 활동이 없습니다.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recent.map((r) => (
                <button key={r.id} onClick={r.onClick}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 4px', border: 'none', borderBottom: '1px solid #f1f5f9', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                  <span style={{ width: '30px', height: '30px', borderRadius: '9px', background: `${r.color}15`, color: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{r.icon}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.text}</span>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{fmtDate(r.at)}</span>
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: r.color, background: `${r.color}12`, padding: '3px 8px', borderRadius: '999px', flexShrink: 0 }}>{r.tag}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 상태 분포 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <BarBreakdown title="시공 업무 상태" rows={statusBars.work} unit="건" />
        <BarBreakdown title="렌탈 주문 상태" rows={statusBars.order} unit="건" />
      </div>
    </div>
  );
};

export default DashboardHome;
