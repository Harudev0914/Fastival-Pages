import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Hammer, Package, Disc3, Receipt, Megaphone, Pin, Plus, Trash2, ChevronRight, Building2, CalendarDays, X } from 'lucide-react';
import { inquiryApi, type ConstructionInquiry } from '../../api/constructionApi';
import { constructionWorkApi, estimateApi, WORK_STATUS_LABEL, WORK_STATUS_COLOR, type ConstructionWork, type Estimate } from '../../api/opsApi';
import { orderApi, ORDER_LABEL, type RentalOrder } from '../../api/rentalApi';
import { djEventApi, type DjEventInquiry } from '../../api/djApi';
import { getMyProfile, adminNoticeApi, type MyProfile, type AdminNotice } from '../../api/systemApi';
import MonthCalendar, { type CalEvent } from '../../components/admin/MonthCalendar';
import { StatGrid } from '../../components/admin/Stats';
import { DonutChart, TrendAreaChart } from '../../components/admin/Charts';
import { FilterChips } from '../../components/admin/listTools';
import { card, Spinner, fmtDate, inputStyle, btnPrimary, btnGhost, useAdminModal } from '../../components/admin/shared';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;
const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const DOMAIN = {
  construction: { key: 'construction', label: '시공', color: '#0891b2' },
  rental: { key: 'rental', label: '렌탈', color: '#7c3aed' },
  dj: { key: 'dj', label: 'DJ', color: '#db2777' },
};

interface Agenda { date: string; label: string; sub?: string; domain: keyof typeof DOMAIN; onClick: () => void; }

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { can, loading: permLoading } = useAdminPermissions();
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<ConstructionInquiry[]>([]);
  const [works, setWorks] = useState<ConstructionWork[]>([]);
  const [orders, setOrders] = useState<RentalOrder[]>([]);
  const [events, setEvents] = useState<DjEventInquiry[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [notices, setNotices] = useState<AdminNotice[]>([]);
  const [domains, setDomains] = useState<Set<string>>(new Set(['construction', 'rental', 'dj']));
  // 공지 작성
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [nTitle, setNTitle] = useState('');
  const [nContent, setNContent] = useState('');
  const { element: modal, alert, confirm } = useAdminModal();

  const loadNotices = () => adminNoticeApi.list().then(({ data }) => setNotices(data || []));

  useEffect(() => {
    (async () => {
      const [inq, wk, od, ev, ec, er, ed, prof] = await Promise.all([
        inquiryApi.list().catch(() => ({ data: [] as ConstructionInquiry[] })),
        constructionWorkApi.list().catch(() => ({ data: [] as ConstructionWork[] })),
        orderApi.list().catch(() => ({ data: [] as RentalOrder[] })),
        djEventApi.list().catch(() => ({ data: [] as DjEventInquiry[] })),
        estimateApi.list('construction').catch(() => ({ data: [] as Estimate[] })),
        estimateApi.list('rental').catch(() => ({ data: [] as Estimate[] })),
        estimateApi.list('dj').catch(() => ({ data: [] as Estimate[] })),
        getMyProfile().catch(() => null),
      ]);
      setInquiries(inq.data || []); setWorks(wk.data || []); setOrders(od.data || []); setEvents(ev.data || []);
      setEstimates([...(ec.data || []), ...(er.data || []), ...(ed.data || [])]);
      setProfile(prof);
      await loadNotices();
      setLoading(false);
    })();
  }, []);

  // 부서 권한 기반 도메인 필터 (시공팀이면 시공만 기본 노출)
  // ⚠️ can()은 매 렌더 새 함수라 primitive 불리언으로 의존성을 안정화(무한 루프 방지)
  const cAllow = can('construction/works') || can('construction/calendar') || can('construction/inquiries');
  const rAllow = can('rental/orders') || can('rental/calendar');
  const dAllow = can('dj/event-inquiries') || can('dj/calendar');
  const permittedKeys = useMemo(() => {
    const ks: (keyof typeof DOMAIN)[] = [];
    if (cAllow) ks.push('construction');
    if (rAllow) ks.push('rental');
    if (dAllow) ks.push('dj');
    return ks.length ? ks : (['construction', 'rental', 'dj'] as (keyof typeof DOMAIN)[]);
  }, [cAllow, rAllow, dAllow]);
  // permittedKeys는 primitive 의존성이라 참조가 안정적 → 로드 완료 시 1회만 반영
  useEffect(() => { if (!permLoading) setDomains(new Set(permittedKeys as string[])); }, [permLoading, permittedKeys]);

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

  // 캘린더 이벤트 (부서 도메인 필터 반영)
  const calEvents: CalEvent[] = useMemo(() => {
    const out: CalEvent[] = [];
    if (domains.has('construction')) works.filter((w) => w.scheduled_start).forEach((w) => out.push({ id: `w${w.id}`, start: w.scheduled_start!, end: w.scheduled_end || w.scheduled_start, label: w.assignee || w.title, sub: '시공', color: DOMAIN.construction.color, onClick: () => navigate(`/admin/dashboard/construction/works/detail/${w.id}`) }));
    if (domains.has('rental')) orders.filter((o) => o.rental_start && o.order_status !== 'cancelled').forEach((o) => out.push({ id: `o${o.id}`, start: o.rental_start!, end: o.rental_end || o.rental_start, label: o.product_name || '렌탈', sub: o.customer_name || undefined, color: DOMAIN.rental.color, onClick: () => navigate(`/admin/dashboard/rental/orders/detail/${o.id}`) }));
    if (domains.has('dj')) events.filter((e) => e.event_date && e.status !== 'cancelled').forEach((e) => out.push({ id: `e${e.id}`, start: e.event_date!, label: e.artist_name || e.title, sub: 'DJ', color: DOMAIN.dj.color, onClick: () => navigate(`/admin/dashboard/dj/event-inquiries/detail/${e.id}`) }));
    return out;
  }, [works, orders, events, domains, navigate]);

  // 예정 업무 아젠다 (오늘 이후, 캘린더 도메인 기준, 날짜 오름차순)
  const agenda: Agenda[] = useMemo(() => {
    const today = ymd(new Date());
    const rows: Agenda[] = [];
    if (domains.has('construction')) works.filter((w) => w.scheduled_start && w.scheduled_start >= today && w.status !== 'done').forEach((w) => rows.push({ date: w.scheduled_start!, label: w.title, sub: `${w.assignee || '담당 미정'}${w.company_name ? ' · ' + w.company_name : ''}`, domain: 'construction', onClick: () => navigate(`/admin/dashboard/construction/works/detail/${w.id}`) }));
    if (domains.has('rental')) orders.filter((o) => o.rental_start && o.rental_start >= today && o.order_status !== 'cancelled').forEach((o) => rows.push({ date: o.rental_start!, label: o.product_name || '렌탈 주문', sub: `${o.customer_name || '-'} · ${ORDER_LABEL[o.order_status]}`, domain: 'rental', onClick: () => navigate(`/admin/dashboard/rental/orders/detail/${o.id}`) }));
    if (domains.has('dj')) events.filter((e) => e.event_date && e.event_date >= today && e.status !== 'cancelled').forEach((e) => rows.push({ date: e.event_date!, label: e.title, sub: `${e.artist_name || '배정 미정'}${e.region ? ' · ' + e.region : ''}`, domain: 'dj', onClick: () => navigate(`/admin/dashboard/dj/event-inquiries/detail/${e.id}`) }));
    return rows.sort((a, b) => a.date.localeCompare(b.date));
  }, [works, orders, events, domains, navigate]);

  const workSlices = useMemo(() => (Object.keys(WORK_STATUS_LABEL) as (keyof typeof WORK_STATUS_LABEL)[]).map((k) => ({ label: WORK_STATUS_LABEL[k], value: works.filter((w) => w.status === k).length, color: WORK_STATUS_COLOR[k] })), [works]);
  const orderSlices = useMemo(() => {
    const c: Record<string, string> = { reserved: '#3b82f6', renting: '#f59e0b', returned: '#10b981', cancelled: '#94a3b8' };
    return (Object.keys(ORDER_LABEL) as (keyof typeof ORDER_LABEL)[]).map((k) => ({ label: ORDER_LABEL[k], value: orders.filter((o) => o.order_status === k).length, color: c[k] }));
  }, [orders]);
  const months6 = useMemo(() => {
    const base = new Date(); const arr: { label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1); const key = ym(d);
      arr.push({ label: `${d.getMonth() + 1}월`, value: orders.filter((o) => o.payment_status === 'paid' && (o.created_at || '').slice(0, 7) === key).reduce((s, o) => s + (Number(o.total_amount) || 0), 0) });
    }
    return arr;
  }, [orders]);

  const canPost = !!profile?.isSuper || can('dashboard', 'c');
  const submitNotice = async () => {
    if (!nTitle.trim()) return alert('입력 필요', '공지 제목을 입력해주세요.');
    const { error } = await adminNoticeApi.create({ title: nTitle, content: nContent });
    if (error) return alert('등록 오류', error);
    setNTitle(''); setNContent(''); setNoticeOpen(false); loadNotices();
  };
  const removeNotice = (n: AdminNotice) => confirm('공지 삭제', `'${n.title}' 공지를 삭제하시겠습니까?`, async () => {
    const { error } = await adminNoticeApi.remove(n.id);
    if (error) alert('삭제 오류', error); else loadNotices();
  });

  if (loading) return <Spinner />;
  const now = new Date();
  const upcoming = agenda.slice(0, 5);
  const domainChips = permittedKeys.map((k) => DOMAIN[k]);
  const initial = (profile?.name || '관').trim().charAt(0).toUpperCase();

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      {/* ===== 상단: 부서·사용자 / 다가올 업무 / 사내 공지 ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1fr) minmax(260px, 1.1fr) minmax(280px, 1.3fr)', gap: '16px', marginBottom: '20px', alignItems: 'stretch' }}>
        {/* 부서·사용자 정보 */}
        <div style={{ ...card, padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '15px', background: 'linear-gradient(135deg,#008b8b,#0d9488)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.3rem', flexShrink: 0 }}>{initial}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.name || '관리자'}</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.email || ''}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 14px', background: '#f0fdfa', borderRadius: '11px' }}>
            <Building2 size={16} color="#008b8b" />
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>소속</span>
            <span style={{ marginLeft: 'auto', fontWeight: 800, color: '#0f766e', fontSize: '0.9rem' }}>{profile?.deptName || '-'}</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: 'auto' }}>
            {now.getFullYear()}. {now.getMonth() + 1}. {now.getDate()} · 오늘도 좋은 하루 되세요{profile?.isSuper ? ' · 최상위 관리자' : ''} 👋
          </div>
        </div>

        {/* 다가올 업무 */}
        <div style={{ ...card, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <CalendarDays size={16} color="#008b8b" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>다가올 업무</h3>
            {upcoming.length > 0 && <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 700, color: '#008b8b', background: '#e0f2f1', padding: '3px 9px', borderRadius: '999px' }}>{agenda.length}건</span>}
          </div>
          {upcoming.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.86rem', margin: '8px 0' }}>예정된 업무가 없습니다.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {upcoming.map((a, i) => (
                <button key={i} onClick={a.onClick} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 4px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                  <span style={{ width: '46px', textAlign: 'center', flexShrink: 0, fontSize: '0.72rem', fontWeight: 800, color: DOMAIN[a.domain].color, background: `${DOMAIN[a.domain].color}14`, borderRadius: '8px', padding: '5px 0', lineHeight: 1.2 }}>{a.date.slice(5).replace('-', '.')}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.label}</span>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{a.sub}</span>
                  </span>
                  <ChevronRight size={15} color="#cbd5e1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 사내 공지사항 */}
        <div style={{ ...card, padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Megaphone size={16} color="#008b8b" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>사내 공지사항</h3>
            {canPost && <button onClick={() => setNoticeOpen((v) => !v)} title="공지 작성" style={{ marginLeft: 'auto', width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #e2e8f0', background: noticeOpen ? '#008b8b' : '#fff', color: noticeOpen ? '#fff' : '#008b8b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{noticeOpen ? <X size={15} /> : <Plus size={15} />}</button>}
          </div>
          {noticeOpen && (
            <div style={{ marginBottom: '12px', display: 'grid', gap: '8px', background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
              <input style={{ ...inputStyle, padding: '9px 11px' }} placeholder="공지 제목" value={nTitle} onChange={(e) => setNTitle(e.target.value)} />
              <textarea style={{ ...inputStyle, padding: '9px 11px', minHeight: '56px', resize: 'vertical' }} placeholder="내용(선택)" value={nContent} onChange={(e) => setNContent(e.target.value)} />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button style={{ ...btnGhost, padding: '7px 14px', fontSize: '0.82rem' }} onClick={() => setNoticeOpen(false)}>취소</button>
                <button style={{ ...btnPrimary, padding: '7px 14px', fontSize: '0.82rem' }} onClick={submitNotice}>등록</button>
              </div>
            </div>
          )}
          {notices.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.86rem', margin: '8px 0' }}>등록된 공지가 없습니다.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', maxHeight: '220px' }}>
              {notices.map((n) => (
                <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', padding: '10px 2px', borderBottom: '1px solid #f1f5f9' }}>
                  {n.pinned ? <Pin size={14} color="#f59e0b" style={{ marginTop: '3px', flexShrink: 0 }} /> : <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#cbd5e1', marginTop: '7px', flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155' }}>{n.title}</div>
                    {n.content && <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px', whiteSpace: 'pre-wrap' }}>{n.content}</div>}
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '3px' }}>{n.created_by || ''} · {fmtDate(n.created_at)}</div>
                  </div>
                  {canPost && <button onClick={() => removeNotice(n)} title="삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0 }}><Trash2 size={14} color="#cbd5e1" /></button>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== KPI ===== */}
      <StatGrid cards={[
        { label: '미답변 시공 문의', value: kpis.inqPending, color: kpis.inqPending ? '#f59e0b' : '#0d9488', sub: '답변 대기', icon: <MessageSquare size={17} /> },
        { label: '진행중 시공 업무', value: kpis.workActive, color: '#0d9488', sub: '배정·진행', icon: <Hammer size={17} /> },
        { label: '이번 달 렌탈 매출', value: won(kpis.monthRevenue), color: '#3b82f6', sub: ym(now), icon: <Package size={17} />, spark: months6.map((m) => m.value) },
        { label: '확정 DJ 행사', value: kpis.djConfirmed, color: '#db2777', sub: '섭외 확정', icon: <Disc3 size={17} /> },
        { label: '미처리 견적서', value: kpis.estOpen, color: '#8b5cf6', sub: '작성중·발송', icon: <Receipt size={17} /> },
        { label: '신규 렌탈 예약', value: kpis.orderReserved, color: '#06b6d4', sub: '예약 상태', icon: <Package size={17} /> },
      ]} />

      {/* ===== 하단: 캘린더 / 예정 업무 내용 ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '20px', alignItems: 'start' }}>
        <div style={{ ...card, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarDays size={16} color="#008b8b" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>업무 일정</h3>
            </div>
            {domainChips.length > 1 && (
              <FilterChips options={domainChips} active={domains} onToggle={(k) => setDomains((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; })} />
            )}
          </div>
          <MonthCalendar initialYear={now.getFullYear()} initialMonth={now.getMonth()} events={calEvents} />
        </div>

        {/* 캘린더 기반 업무 내용 (아젠다) */}
        <div style={{ ...card, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <CalendarDays size={16} color="#008b8b" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>업무 내용</h3>
          </div>
          {agenda.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.86rem' }}>일정에 등록된 업무가 없습니다.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '520px', overflowY: 'auto' }}>
              {agenda.slice(0, 30).map((a, i) => {
                const prev = agenda[i - 1];
                const showDate = !prev || prev.date !== a.date;
                return (
                  <div key={i}>
                    {showDate && <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94a3b8', margin: i === 0 ? '0 0 6px' : '12px 0 6px', letterSpacing: '0.02em' }}>{a.date.replace(/-/g, '.')}</div>}
                    <button onClick={a.onClick} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', border: '1px solid #f1f5f9', borderRadius: '10px', background: '#fff', cursor: 'pointer', textAlign: 'left', width: '100%', marginBottom: '4px' }}>
                      <span style={{ width: '4px', alignSelf: 'stretch', borderRadius: '4px', background: DOMAIN[a.domain].color, flexShrink: 0 }} />
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.label}</span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{a.sub}</span>
                      </span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: DOMAIN[a.domain].color, background: `${DOMAIN[a.domain].color}12`, padding: '3px 8px', borderRadius: '999px', flexShrink: 0 }}>{DOMAIN[a.domain].label}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ===== 요약 차트 ===== */}
      <div style={{ marginTop: '20px' }}>
        <TrendAreaChart title="최근 6개월 렌탈 매출" points={months6} color="#0d9488" money />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <DonutChart title="시공 업무 상태" data={workSlices} centerLabel="건" unit="건" />
        <DonutChart title="렌탈 주문 상태" data={orderSlices} centerLabel="건" unit="건" />
      </div>
      {modal}
    </div>
  );
};

export default DashboardHome;
