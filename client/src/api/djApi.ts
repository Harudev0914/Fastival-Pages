// DJ 입점(아티스트 회원) API
import { supabase } from '../supabaseClient';
import { run, currentAdminName, type Result } from './core';

export type DjStatus = 'pending' | 'approved' | 'hold' | 'rejected';
export const DJ_STATUS_LABEL: Record<DjStatus, string> = { pending: '접수', approved: '승인', hold: '보류', rejected: '반려' };
export const DJ_REGIONS = ['서울', '경기도', '대전'] as const;
// 전국 17개 시·도 (섭외 가능 지역 선택용)
export const KR_REGIONS = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'] as const;
// 축약명 ↔ 다양한 표기(정식명 포함) 매칭용 별칭
export const REGION_ALIASES: Record<string, string[]> = {
  '서울': ['서울'], '부산': ['부산'], '대구': ['대구'], '인천': ['인천'], '광주': ['광주'], '대전': ['대전'], '울산': ['울산'], '세종': ['세종'],
  '경기': ['경기'], '강원': ['강원'], '충북': ['충북', '충청북'], '충남': ['충남', '충청남'], '전북': ['전북', '전라북'], '전남': ['전남', '전라남'],
  '경북': ['경북', '경상북'], '경남': ['경남', '경상남'], '제주': ['제주'],
};
// 임의 지역 문자열('경기도','충청북도','서울특별시' 등)을 KR_REGIONS 축약명으로 정규화
export function regionToKR(s?: string | null): string | null {
  if (!s) return null;
  for (const kr of KR_REGIONS) if (REGION_ALIASES[kr].some((a) => s.includes(a))) return kr;
  return null;
}

export interface SocialLink { label: string; url: string; }

// ── 구독(프리미엄) ──
export type SubPlan = 'free' | 'premium';
export const SUB_PLAN_LABEL: Record<SubPlan, string> = { free: '무료', premium: '프리미엄' };
export const SUB_PLAN_COLOR: Record<SubPlan, string> = { free: '#94a3b8', premium: '#7c3aed' };
export const COMMISSION_RATE = 0.05; // 일반 회원 중개료 5%
const today = () => new Date().toISOString().slice(0, 10);
// 프리미엄 구독이 유효한지(만료 미도래)
export function isPremiumActive(a: Pick<DjArtist, 'subscription_plan' | 'subscription_until'>): boolean {
  if (a.subscription_plan !== 'premium') return false;
  return !a.subscription_until || a.subscription_until >= today();
}
// 적용 중개료율 — 프리미엄 구독 시 면제(0)
export const commissionRate = (a?: Pick<DjArtist, 'subscription_plan' | 'subscription_until'> | null) => (a && isPremiumActive(a) ? 0 : COMMISSION_RATE);

export interface DjArtist {
  id: number;
  name: string;
  stage_name: string | null;
  subscription_plan: SubPlan;
  subscription_started: string | null;
  subscription_until: string | null;
  subscription_fee: number | null;
  birth_year: number | null;
  phone: string | null;
  email: string | null;
  id_card_url: string | null;
  bankbook_url: string | null;
  resume_url: string | null;
  portfolio_type: 'pdf' | 'img';
  portfolio_files: string[];
  soundcloud_url: string | null;
  mp3_url: string | null;
  youtube_url: string | null;
  social_links: SocialLink[];
  regions: string[];
  guarantee_seoul: number | null;
  guarantee_gyeonggi: number | null;
  guarantee_daejeon: number | null;
  guarantees: Record<string, number> | null;  // { 지역명: 게런티 } 전국 지역 지원
  intro: string | null;
  status: DjStatus;
  admin_memo: string | null;
  created_at: string;
  updated_at: string | null;
  updated_by: string | null;
}

// ── 구독 티어(등급) 카탈로그 ──
export interface SubscriptionTier {
  id: number;
  name: string;
  price: number;
  period_months: number;
  commission_rate: number;   // % (0 = 면제)
  priority_boost: boolean;
  premium_section: boolean;
  color: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

const T_TIER = 'subscription_tiers';
export const tierApi = {
  list: () => run<SubscriptionTier[]>(() => supabase.from(T_TIER).select('*').order('display_order', { ascending: true }) as any),
  listActive: () => run<SubscriptionTier[]>(() => supabase.from(T_TIER).select('*').eq('is_active', true).order('display_order', { ascending: true }) as any),
  get: (id: number | string) => run<SubscriptionTier>(() => supabase.from(T_TIER).select('*').eq('id', id).single() as any),
  async create(input: Partial<SubscriptionTier>): Promise<Result<SubscriptionTier>> {
    if (!input.name?.trim()) return { data: null, error: '티어명을 입력해주세요.' };
    const by = await currentAdminName();
    let display_order = 0;
    try { const { count } = await supabase.from(T_TIER).select('*', { count: 'exact', head: true }); display_order = count ?? 0; } catch { /* noop */ }
    return run<SubscriptionTier>(() => supabase.from(T_TIER).insert({
      name: input.name!.trim(), price: input.price ?? 0, period_months: input.period_months ?? 1, commission_rate: input.commission_rate ?? 0,
      priority_boost: input.priority_boost ?? true, premium_section: input.premium_section ?? true, color: input.color || '#7c3aed',
      description: input.description || null, is_active: input.is_active ?? true, display_order, created_by: by, updated_by: by,
    }).select().single() as any);
  },
  async update(id: number | string, input: Partial<SubscriptionTier>): Promise<Result<SubscriptionTier>> {
    if (!input.name?.trim()) return { data: null, error: '티어명을 입력해주세요.' };
    const by = await currentAdminName();
    return run<SubscriptionTier>(() => supabase.from(T_TIER).update({
      name: input.name!.trim(), price: input.price ?? 0, period_months: input.period_months ?? 1, commission_rate: input.commission_rate ?? 0,
      priority_boost: input.priority_boost, premium_section: input.premium_section, color: input.color || '#7c3aed',
      description: input.description || null, is_active: input.is_active, updated_by: by,
    }).eq('id', id).select().single() as any);
  },
  async setActive(id: number | string, isActive: boolean): Promise<Result<true>> {
    const by = await currentAdminName();
    return run<true>(async () => {
      const { error } = await supabase.from(T_TIER).update({ is_active: isActive, updated_by: by }).eq('id', id);
      return { data: error ? null : (true as const), error };
    });
  },
  remove: (id: number | string) => run<true>(async () => {
    const { error } = await supabase.from(T_TIER).delete().eq('id', id);
    return { data: error ? null : (true as const), error };
  }),
  reorder: (ids: number[]) => run<true>(async () => {
    const results = await Promise.all(ids.map((id, idx) => supabase.from(T_TIER).update({ display_order: idx }).eq('id', id)));
    const firstErr = results.find((r) => r.error);
    return { data: firstErr ? null : (true as const), error: firstErr?.error || null };
  }),
};

export const djApi = {
  list: () => run<DjArtist[]>(() => supabase.from('dj_artists').select('*').order('created_at', { ascending: false }) as any),
  get: (id: number | string) => run<DjArtist>(() => supabase.from('dj_artists').select('*').eq('id', id).single() as any),

  // 공개 지원 폼
  create: (input: Partial<DjArtist>) => run<DjArtist>(() => supabase.from('dj_artists').insert(input as any).select().single() as any),

  async setStatus(id: number | string, status: DjStatus, adminMemo?: string): Promise<Result<true>> {
    const by = await currentAdminName();
    return run<true>(async () => {
      const patch: any = { status, updated_by: by };
      if (adminMemo !== undefined) patch.admin_memo = adminMemo;
      const { error } = await supabase.from('dj_artists').update(patch).eq('id', id);
      return { data: error ? null : (true as const), error };
    });
  },
  // 구독(플랜/기간/구독료/출생연도) 설정
  async setSubscription(id: number | string, input: { plan: SubPlan; started?: string | null; until?: string | null; fee?: number | null; birth_year?: number | null }): Promise<Result<true>> {
    const by = await currentAdminName();
    return run<true>(async () => {
      const patch: any = { subscription_plan: input.plan, updated_by: by };
      if (input.started !== undefined) patch.subscription_started = input.started || null;
      if (input.until !== undefined) patch.subscription_until = input.until || null;
      if (input.fee !== undefined) patch.subscription_fee = input.fee ?? null;
      if (input.birth_year !== undefined) patch.birth_year = input.birth_year ?? null;
      const { error } = await supabase.from('dj_artists').update(patch).eq('id', id);
      return { data: error ? null : (true as const), error };
    });
  },
  remove: (id: number | string) => run<true>(async () => {
    const { error } = await supabase.from('dj_artists').delete().eq('id', id);
    return { data: error ? null : (true as const), error };
  }),
};

// ==================== DJ 행사(섭외) 문의 ====================
export type DjEventStatus = 'pending' | 'consulting' | 'confirmed' | 'done' | 'cancelled';
export const DJ_EVENT_STATUS_LABEL: Record<DjEventStatus, string> = { pending: '접수', consulting: '상담중', confirmed: '확정', done: '완료', cancelled: '취소' };
export const DJ_EVENT_STATUS_COLOR: Record<DjEventStatus, string> = { pending: '#64748b', consulting: '#d97706', confirmed: '#2563eb', done: '#059669', cancelled: '#94a3b8' };

export interface DjEventInquiry {
  id: number;
  title: string;
  customer_name: string | null; customer_phone: string | null; customer_email: string | null;
  event_date: string | null; event_time: string | null;
  region: string | null; venue: string | null; budget: number | null;
  artist_id: number | null; artist_name: string | null; guests: number | null;
  message: string | null; status: DjEventStatus; admin_memo: string | null;
  created_at: string; updated_at: string | null; updated_by: string | null;
}

export const djEventApi = {
  list: () => run<DjEventInquiry[]>(() => supabase.from('dj_event_inquiries').select('*').order('created_at', { ascending: false }) as any),
  scheduled: () => run<DjEventInquiry[]>(() => supabase.from('dj_event_inquiries').select('*').not('event_date', 'is', null).neq('status', 'cancelled') as any),
  get: (id: number | string) => run<DjEventInquiry>(() => supabase.from('dj_event_inquiries').select('*').eq('id', id).single() as any),
  create: (input: Partial<DjEventInquiry>) => run<DjEventInquiry>(() => supabase.from('dj_event_inquiries').insert(input as any).select().single() as any),
  async update(id: number | string, input: Partial<DjEventInquiry>): Promise<Result<DjEventInquiry>> {
    const by = await currentAdminName();
    return run<DjEventInquiry>(() => supabase.from('dj_event_inquiries').update({ ...input, updated_by: by } as any).eq('id', id).select().single() as any);
  },
  async setStatus(id: number | string, status: DjEventStatus): Promise<Result<true>> {
    const by = await currentAdminName();
    return run<true>(async () => {
      const { error } = await supabase.from('dj_event_inquiries').update({ status, updated_by: by }).eq('id', id);
      return { data: error ? null : (true as const), error };
    });
  },
  remove: (id: number | string) => run<true>(async () => {
    const { error } = await supabase.from('dj_event_inquiries').delete().eq('id', id);
    return { data: error ? null : (true as const), error };
  }),
  removeMany: (ids: (number | string)[]) => run<true>(async () => {
    const { error } = await supabase.from('dj_event_inquiries').delete().in('id', ids);
    return { data: error ? null : (true as const), error };
  }),
};
