// 계약서(문서) 관리 API
import { supabase } from '../supabaseClient';
import { run, currentAdminName, type Result } from './core';

export type ContractTemplate = 'freelancer' | 'construction_order' | 'event_order' | 'rental_handover' | 'rental';
export type ContractStatus = 'draft' | 'completed';
export const CONTRACT_STATUS_LABEL: Record<ContractStatus, string> = { draft: '작성중', completed: '완료' };

export interface Contract {
  id: number;
  template: ContractTemplate;
  title: string;
  customer_name: string | null;
  data: Record<string, string>;
  status: ContractStatus;
  inquiry_id: number | null;
  owner_user_id: string | null;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface ContractInput {
  template: ContractTemplate;
  title: string;
  customer_name?: string | null;
  data: Record<string, string>;
  status?: ContractStatus;
}

const TB = 'contracts';

export const contractApi = {
  list: () => run<Contract[]>(() => supabase.from(TB).select('*').order('created_at', { ascending: false }) as any),
  get: (id: number | string) => run<Contract>(() => supabase.from(TB).select('*').eq('id', id).single() as any),

  async create(input: ContractInput): Promise<Result<Contract>> {
    if (!input.title?.trim()) return { data: null, error: '계약서 제목을 입력해주세요.' };
    const by = await currentAdminName();
    return run<Contract>(() => supabase.from(TB).insert({
      template: input.template, title: input.title.trim(), customer_name: input.customer_name || null,
      data: input.data || {}, status: input.status || 'draft', created_by: by, updated_by: by,
    }).select().single() as any);
  },

  async update(id: number | string, input: ContractInput): Promise<Result<Contract>> {
    if (!input.title?.trim()) return { data: null, error: '계약서 제목을 입력해주세요.' };
    const by = await currentAdminName();
    return run<Contract>(() => supabase.from(TB).update({
      template: input.template, title: input.title.trim(), customer_name: input.customer_name || null,
      data: input.data || {}, status: input.status, updated_by: by,
    }).eq('id', id).select().single() as any);
  },

  remove: (id: number | string) => run<true>(async () => {
    const { error } = await supabase.from(TB).delete().eq('id', id);
    return { data: error ? null : (true as const), error };
  }),

  // 승인 발송 시 입력한 금액을 계약서 문서(data.amount)에 그대로 기입
  patchAmount: (id: number | string, amount: number) => run<true>(async () => {
    const { data: c } = await supabase.from(TB).select('data').eq('id', id).single();
    const nextData = { ...((c?.data as Record<string, string>) || {}), amount: String(amount) };
    const { error } = await supabase.from(TB).update({ data: nextData }).eq('id', id);
    return { data: error ? null : (true as const), error };
  }),
};
