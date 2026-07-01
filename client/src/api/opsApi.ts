// 시공 업무 관리(업체/업무) + 견적서(시공/렌탈/DJ)
import { supabase } from '../supabaseClient';
import { run, mapError, currentAdminName, type Result } from './core';

// ---------------- 공통 헬퍼 ----------------
async function nextOrder(table: string): Promise<number> {
  try {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    return error ? 0 : (count ?? 0);
  } catch { return 0; }
}
function reorderFn(table: string) {
  return async (ids: number[]): Promise<Result<true>> => {
    try {
      const results = await Promise.all(ids.map((id, idx) => supabase.from(table).update({ display_order: idx }).eq('id', id)));
      const firstErr = results.find((r) => r.error);
      if (firstErr?.error) return { data: null, error: mapError(firstErr.error) };
      return { data: true as const, error: null };
    } catch (e) { return { data: null, error: mapError(e) }; }
  };
}
function setActiveFn(table: string) {
  return async (id: number | string, isActive: boolean): Promise<Result<true>> => {
    const by = await currentAdminName();
    return run<true>(async () => {
      const { error } = await supabase.from(table).update({ is_active: isActive, updated_by: by }).eq('id', id);
      return { data: error ? null : (true as const), error };
    });
  };
}
function removeFn(table: string) {
  return (id: number | string) => run<true>(async () => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    return { data: error ? null : (true as const), error };
  });
}

// ==================== 시공 업체 ====================
export interface ConstructionCompany {
  id: number;
  name: string; manager: string | null; phone: string | null; email: string | null; region: string | null; memo: string | null;
  display_order: number; is_active: boolean;
  created_at: string; updated_at: string | null; created_by: string | null; updated_by: string | null;
}
const COMPANY = 'construction_companies';
export const constructionCompanyApi = {
  list: () => run<ConstructionCompany[]>(() => supabase.from(COMPANY).select('*').order('display_order', { ascending: true }) as any),
  listActive: () => run<ConstructionCompany[]>(() => supabase.from(COMPANY).select('*').eq('is_active', true).order('display_order', { ascending: true }) as any),
  get: (id: number | string) => run<ConstructionCompany>(() => supabase.from(COMPANY).select('*').eq('id', id).single() as any),
  async create(input: Partial<ConstructionCompany>): Promise<Result<ConstructionCompany>> {
    if (!input.name?.trim()) return { data: null, error: '업체명을 입력해주세요.' };
    const by = await currentAdminName();
    const display_order = await nextOrder(COMPANY);
    return run<ConstructionCompany>(() => supabase.from(COMPANY).insert({
      name: input.name!.trim(), manager: input.manager || null, phone: input.phone || null, email: input.email || null,
      region: input.region || null, memo: input.memo || null, is_active: input.is_active ?? true, display_order, created_by: by, updated_by: by,
    }).select().single() as any);
  },
  async update(id: number | string, input: Partial<ConstructionCompany>): Promise<Result<ConstructionCompany>> {
    if (!input.name?.trim()) return { data: null, error: '업체명을 입력해주세요.' };
    const by = await currentAdminName();
    return run<ConstructionCompany>(() => supabase.from(COMPANY).update({
      name: input.name!.trim(), manager: input.manager || null, phone: input.phone || null, email: input.email || null,
      region: input.region || null, memo: input.memo || null, is_active: input.is_active, updated_by: by,
    }).eq('id', id).select().single() as any);
  },
  setActive: setActiveFn(COMPANY),
  remove: removeFn(COMPANY),
  reorder: reorderFn(COMPANY),
};

// ==================== 시공 업무 현황 ====================
export type WorkStatus = 'pending' | 'assigned' | 'in_progress' | 'done' | 'hold';
export const WORK_STATUS_LABEL: Record<WorkStatus, string> = { pending: '대기', assigned: '담당배정', in_progress: '진행중', done: '완료', hold: '보류' };
export const WORK_STATUS_COLOR: Record<WorkStatus, string> = { pending: '#64748b', assigned: '#2563eb', in_progress: '#d97706', done: '#059669', hold: '#94a3b8' };
export interface ConstructionWork {
  id: number;
  inquiry_id: number | null; title: string; customer_name: string | null; customer_phone: string | null;
  company_id: number | null; company_name: string | null; assignee: string | null;
  scheduled_start: string | null; scheduled_end: string | null; amount: number | null;
  status: WorkStatus; memo: string | null; display_order: number;
  created_at: string; updated_at: string | null; created_by: string | null; updated_by: string | null;
}
const WORK = 'construction_works';
export const constructionWorkApi = {
  list: () => run<ConstructionWork[]>(() => supabase.from(WORK).select('*').order('scheduled_start', { ascending: false, nullsFirst: false }) as any),
  scheduled: () => run<ConstructionWork[]>(() => supabase.from(WORK).select('*').not('scheduled_start', 'is', null).neq('status', 'hold') as any),
  get: (id: number | string) => run<ConstructionWork>(() => supabase.from(WORK).select('*').eq('id', id).single() as any),
  async create(input: Partial<ConstructionWork>): Promise<Result<ConstructionWork>> {
    if (!input.title?.trim()) return { data: null, error: '업무명을 입력해주세요.' };
    const by = await currentAdminName();
    const display_order = await nextOrder(WORK);
    return run<ConstructionWork>(() => supabase.from(WORK).insert({
      inquiry_id: input.inquiry_id ?? null, title: input.title!.trim(), customer_name: input.customer_name || null, customer_phone: input.customer_phone || null,
      company_id: input.company_id ?? null, company_name: input.company_name || null, assignee: input.assignee || null,
      scheduled_start: input.scheduled_start || null, scheduled_end: input.scheduled_end || null, amount: input.amount ?? null,
      status: input.status || 'pending', memo: input.memo || null, display_order, created_by: by, updated_by: by,
    }).select().single() as any);
  },
  async update(id: number | string, input: Partial<ConstructionWork>): Promise<Result<ConstructionWork>> {
    if (!input.title?.trim()) return { data: null, error: '업무명을 입력해주세요.' };
    const by = await currentAdminName();
    return run<ConstructionWork>(() => supabase.from(WORK).update({
      inquiry_id: input.inquiry_id ?? null, title: input.title!.trim(), customer_name: input.customer_name || null, customer_phone: input.customer_phone || null,
      company_id: input.company_id ?? null, company_name: input.company_name || null, assignee: input.assignee || null,
      scheduled_start: input.scheduled_start || null, scheduled_end: input.scheduled_end || null, amount: input.amount ?? null,
      status: input.status, memo: input.memo || null, updated_by: by,
    }).eq('id', id).select().single() as any);
  },
  // 칸반 보드 드래그 등 상태만 빠르게 변경
  async setStatus(id: number | string, status: WorkStatus): Promise<Result<true>> {
    const by = await currentAdminName();
    return run<true>(async () => {
      const { error } = await supabase.from(WORK).update({ status, updated_by: by }).eq('id', id);
      return { data: error ? null : (true as const), error };
    });
  },
  remove: removeFn(WORK),
  removeMany: (ids: (number | string)[]) => run<true>(async () => {
    const { error } = await supabase.from(WORK).delete().in('id', ids);
    return { data: error ? null : (true as const), error };
  }),
};

// ==================== 견적서 ====================
export type EstimateType = 'construction' | 'rental' | 'dj';
export const ESTIMATE_TYPE_LABEL: Record<EstimateType, string> = { construction: '시공 견적서', rental: '렌탈 견적서', dj: 'DJ 프리랜서 견적서' };
export type EstimateStatus = 'draft' | 'sent' | 'accepted' | 'rejected';
export const ESTIMATE_STATUS_LABEL: Record<EstimateStatus, string> = { draft: '작성중', sent: '발송', accepted: '수락', rejected: '반려' };
export const ESTIMATE_STATUS_COLOR: Record<EstimateStatus, string> = { draft: '#64748b', sent: '#2563eb', accepted: '#059669', rejected: '#dc2626' };
export interface EstimateItem { name: string; spec?: string; unit?: string; qty: number; unit_price: number; amount: number; }
export interface Estimate {
  id: number; type: EstimateType; estimate_no: string | null; title: string;
  customer_name: string | null; customer_phone: string | null; customer_email: string | null;
  items: EstimateItem[]; subtotal: number; discount: number; tax: number; total: number;
  issue_date: string | null; valid_until: string | null; status: EstimateStatus; memo: string | null; terms: string | null;
  created_at: string; updated_at: string | null; created_by: string | null; updated_by: string | null;
}
const EST = 'estimates';
export const estimateApi = {
  list: (type: EstimateType) => run<Estimate[]>(() => supabase.from(EST).select('*').eq('type', type).order('created_at', { ascending: false }) as any),
  // 전체 견적서(모든 유형) — 승인 요청 첨부 선택용
  listAll: () => run<Estimate[]>(() => supabase.from(EST).select('*').order('created_at', { ascending: false }) as any),
  get: (id: number | string) => run<Estimate>(() => supabase.from(EST).select('*').eq('id', id).single() as any),
  async create(input: Partial<Estimate>): Promise<Result<Estimate>> {
    if (!input.title?.trim()) return { data: null, error: '견적서 제목을 입력해주세요.' };
    const by = await currentAdminName();
    // estimate_no 는 DB 트리거가 자동 채번(EST-YYYY-####)
    return run<Estimate>(() => supabase.from(EST).insert({
      type: input.type, title: input.title!.trim(), customer_name: input.customer_name || null, customer_phone: input.customer_phone || null, customer_email: input.customer_email || null,
      items: input.items || [], subtotal: input.subtotal ?? 0, discount: input.discount ?? 0, tax: input.tax ?? 0, total: input.total ?? 0,
      issue_date: input.issue_date || null, valid_until: input.valid_until || null, status: input.status || 'draft', memo: input.memo || null, terms: input.terms || null, created_by: by, updated_by: by,
    }).select().single() as any);
  },
  async update(id: number | string, input: Partial<Estimate>): Promise<Result<Estimate>> {
    if (!input.title?.trim()) return { data: null, error: '견적서 제목을 입력해주세요.' };
    const by = await currentAdminName();
    return run<Estimate>(() => supabase.from(EST).update({
      type: input.type, title: input.title!.trim(), customer_name: input.customer_name || null, customer_phone: input.customer_phone || null, customer_email: input.customer_email || null,
      items: input.items || [], subtotal: input.subtotal ?? 0, discount: input.discount ?? 0, tax: input.tax ?? 0, total: input.total ?? 0,
      issue_date: input.issue_date || null, valid_until: input.valid_until || null, status: input.status, memo: input.memo || null, terms: input.terms || null, updated_by: by,
    }).eq('id', id).select().single() as any);
  },
  // 목록에서 상태만 즉시 변경
  async setStatus(id: number | string, status: EstimateStatus): Promise<Result<true>> {
    const by = await currentAdminName();
    return run<true>(async () => {
      const { error } = await supabase.from(EST).update({ status, updated_by: by }).eq('id', id);
      return { data: error ? null : (true as const), error };
    });
  },
  // 견적서 복제 (상태 draft·새 채번으로 사본 생성)
  async duplicate(id: number | string): Promise<Result<Estimate>> {
    const { data: src, error } = await this.get(id);
    if (error || !src) return { data: null, error: error || '원본 견적서를 찾을 수 없습니다.' };
    return this.create({
      type: src.type, title: `${src.title} (사본)`, customer_name: src.customer_name, customer_phone: src.customer_phone, customer_email: src.customer_email,
      items: src.items, subtotal: src.subtotal, discount: src.discount, tax: src.tax, total: src.total,
      valid_until: src.valid_until, status: 'draft', memo: src.memo, terms: src.terms,
    });
  },
  remove: removeFn(EST),
  removeMany: (ids: (number | string)[]) => run<true>(async () => {
    const { error } = await supabase.from(EST).delete().in('id', ids);
    return { data: error ? null : (true as const), error };
  }),
};
