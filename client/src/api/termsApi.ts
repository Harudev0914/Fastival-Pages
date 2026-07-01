// 약관 관리 API: 서비스 이용약관 / 개인정보 처리방침
import { supabase } from '../supabaseClient';
import { run, mapError, currentAdminName, type Result } from './core';

export type TermsType = 'service' | 'privacy';
export const TERMS_TYPE_LABEL: Record<TermsType, string> = { service: '서비스 이용약관', privacy: '개인정보 처리방침' };

export interface Terms {
  id: number;
  type: TermsType;
  title: string;
  content: string;
  version: string | null;
  effective_date: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface TermsInput {
  type: TermsType;
  title: string;
  content: string;
  version?: string;
  effective_date?: string | null;
  is_active?: boolean;
}

const TB = 'terms';

async function nextOrder(type: TermsType): Promise<number> {
  try {
    const { count, error } = await supabase.from(TB).select('*', { count: 'exact', head: true }).eq('type', type);
    return error ? 0 : (count ?? 0);
  } catch { return 0; }
}

export const termsApi = {
  list: (type: TermsType) => run<Terms[]>(() => supabase.from(TB).select('*').eq('type', type).order('display_order', { ascending: true }) as any),
  // 공개 페이지용: 해당 유형의 활성 약관(최신 시행일 우선)
  listActive: (type: TermsType) => run<Terms[]>(() => supabase.from(TB).select('*').eq('type', type).eq('is_active', true).order('effective_date', { ascending: false }) as any),
  get: (id: number | string) => run<Terms>(() => supabase.from(TB).select('*').eq('id', id).single() as any),

  async create(input: TermsInput): Promise<Result<Terms>> {
    if (!input.title?.trim()) return { data: null, error: '제목을 입력해주세요.' };
    if (!input.content?.trim()) return { data: null, error: '약관 내용을 입력해주세요.' };
    const by = await currentAdminName();
    const display_order = await nextOrder(input.type);
    return run<Terms>(() => supabase.from(TB).insert({
      type: input.type, title: input.title.trim(), content: input.content,
      version: input.version?.trim() || null, effective_date: input.effective_date || null,
      is_active: input.is_active ?? true, display_order, created_by: by, updated_by: by,
    }).select().single() as any);
  },

  async update(id: number | string, input: TermsInput): Promise<Result<Terms>> {
    if (!input.title?.trim()) return { data: null, error: '제목을 입력해주세요.' };
    if (!input.content?.trim()) return { data: null, error: '약관 내용을 입력해주세요.' };
    const by = await currentAdminName();
    return run<Terms>(() => supabase.from(TB).update({
      type: input.type, title: input.title.trim(), content: input.content,
      version: input.version?.trim() || null, effective_date: input.effective_date || null,
      is_active: input.is_active, updated_by: by,
    }).eq('id', id).select().single() as any);
  },

  async setActive(id: number | string, isActive: boolean): Promise<Result<true>> {
    const by = await currentAdminName();
    return run<true>(async () => {
      const { error } = await supabase.from(TB).update({ is_active: isActive, updated_by: by }).eq('id', id);
      return { data: error ? null : (true as const), error };
    });
  },

  remove: (id: number | string) => run<true>(async () => {
    const { error } = await supabase.from(TB).delete().eq('id', id);
    return { data: error ? null : (true as const), error };
  }),

  async reorder(ids: number[]): Promise<Result<true>> {
    try {
      const results = await Promise.all(ids.map((id, idx) => supabase.from(TB).update({ display_order: idx }).eq('id', id)));
      const firstErr = results.find((r) => r.error);
      if (firstErr?.error) return { data: null, error: mapError(firstErr.error) };
      return { data: true as const, error: null };
    } catch (e) {
      return { data: null, error: mapError(e) };
    }
  },
};
