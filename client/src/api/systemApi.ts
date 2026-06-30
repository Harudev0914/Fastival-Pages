// 환경설정: 부서 / 부서별 권한 / 관리자
import { supabase } from '../supabaseClient';
import { run, mapError, type Result } from './core';

// 어드민 메뉴 키(부서별 접근 권한 부여 대상)
export const ADMIN_MENUS: { key: string; label: string }[] = [
  { key: 'dashboard', label: '대시보드 홈' },
  { key: 'main-visual', label: '메인 비주얼 관리' },
  { key: 'construction', label: '시공 관리' },
  { key: 'rental', label: '렌탈 관리' },
  { key: 'system', label: '환경설정' },
];

export interface Department {
  id: number;
  name: string;
  menu_keys: string[];
  created_at: string;
  updated_at: string | null;
}

export interface AdminUser {
  id: number;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  desired_email: string | null;
  department_id: number | null;
  auth_user_id: string | null;
  created_at: string | null;
  departments?: { name: string } | null;
}

export const departmentApi = {
  list: () => run<Department[]>(() => supabase.from('departments').select('*').order('name') as any),
  create: (name: string) => run<Department>(() => supabase.from('departments').insert({ name: name.trim() }).select().single() as any),
  update: (id: number, patch: Partial<Pick<Department, 'name' | 'menu_keys'>>) =>
    run<Department>(() => supabase.from('departments').update(patch).eq('id', id).select().single() as any),
  remove: (id: number) => run<true>(async () => {
    const { error } = await supabase.from('departments').delete().eq('id', id);
    return { data: error ? null : (true as const), error };
  }),
};

export interface NewAdminInput {
  email: string; password: string; name: string; phone?: string; desired_email?: string; department_id?: number | null;
}

export const adminUserApi = {
  list: () => run<AdminUser[]>(() => supabase.from('admins').select('id, name, email, phone_number, desired_email, department_id, auth_user_id, created_at, departments(name)').order('created_at', { ascending: false }) as any),

  async create(input: NewAdminInput): Promise<Result<true>> {
    try {
      const { data, error } = await supabase.functions.invoke('create-admin', { body: { action: 'create', ...input } });
      if (error) return { data: null, error: mapError(error) };
      if (data?.error) return { data: null, error: data.error };
      return { data: true, error: null };
    } catch (e) { return { data: null, error: mapError(e) }; }
  },

  update: (id: number, patch: { name?: string; phone_number?: string; desired_email?: string; department_id?: number | null }) =>
    run<AdminUser>(() => supabase.from('admins').update(patch).eq('id', id).select().single() as any),

  async remove(row: AdminUser): Promise<Result<true>> {
    try {
      const { data, error } = await supabase.functions.invoke('create-admin', { body: { action: 'delete', auth_user_id: row.auth_user_id, id: row.id } });
      if (error) return { data: null, error: mapError(error) };
      if (data?.error) return { data: null, error: data.error };
      return { data: true, error: null };
    } catch (e) { return { data: null, error: mapError(e) }; }
  },
};
