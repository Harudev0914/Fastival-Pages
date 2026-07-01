// 환경설정: 부서 / 부서별 권한 / 관리자
import { supabase } from '../supabaseClient';
import { run, mapError, currentAdminName, type Result } from './core';

// 어드민 메뉴 트리(부서별 접근 권한 부여 대상) — 1Depth 그룹 + 2Depth 세부 메뉴
export interface AdminMenuGroup {
  key: string;          // 그룹/단일 메뉴 키
  label: string;
  items: { key: string; label: string }[]; // 2Depth (비어있으면 단일 메뉴)
}

export const ADMIN_MENU_TREE: AdminMenuGroup[] = [
  { key: 'dashboard', label: '대시보드 홈', items: [] },
  { key: 'notices', label: '사내 공지', items: [] },
  {
    key: 'construction', label: '시공 관리', items: [
      { key: 'construction/categories', label: '카테고리 관리' },
      { key: 'construction/portfolio', label: '포트폴리오 관리' },
      { key: 'construction/chatbot', label: '시공 문의 챗봇 관리' },
    ],
  },
  {
    key: 'construction-ops', label: '시공 업무 관리', items: [
      { key: 'construction/inquiries', label: '시공 문의 내역' },
      { key: 'construction/works', label: '시공 업무 현황' },
      { key: 'construction/companies', label: '시공 업체 관리' },
      { key: 'construction/reviews', label: '후기 관리' },
      { key: 'construction/calendar', label: '시공 내역 캘린더' },
      { key: 'construction/stats', label: '시공 내역 통계' },
    ],
  },
  {
    key: 'rental', label: '렌탈 관리', items: [
      { key: 'rental/brands', label: '브랜드 관리' },
      { key: 'rental/categories', label: '카테고리 관리' },
      { key: 'rental/products', label: '상품 관리' },
      { key: 'rental/exclusive', label: '단독 상품' },
      { key: 'rental/events', label: '기획전' },
      { key: 'rental/orders', label: '렌탈 관리(주문)' },
    ],
  },
  {
    key: 'rental-ops', label: '렌탈 업무 관리', items: [
      { key: 'rental/shipments', label: '렌탈 출고 현황' },
      { key: 'rental/purchases', label: '렌탈 입점 문의' },
      { key: 'rental/calendar', label: '렌탈 내역 캘린더' },
      { key: 'rental/stats', label: '렌탈 내역 통계' },
    ],
  },
  {
    key: 'dj', label: 'DJ 관리', items: [
      { key: 'dj/list', label: 'DJ 목록' },
      { key: 'dj/artists', label: 'DJ 입점 관리' },
      { key: 'dj/event-inquiries', label: 'DJ 행사 문의 관리' },
      { key: 'dj/calendar', label: 'DJ 행사 캘린더' },
      { key: 'dj/stats', label: 'DJ 행사 통계' },
    ],
  },
  {
    key: 'estimates', label: '견적서/계약서 관리', items: [
      { key: 'estimates/construction', label: '시공 견적서' },
      { key: 'estimates/rental', label: '렌탈 견적서' },
      { key: 'estimates/dj', label: 'DJ 프리랜서 견적서' },
      { key: 'contracts', label: '계약서 관리' },
    ],
  },
  { key: 'main-visuals', label: '메인 비주얼 관리', items: [] },
  {
    key: 'terms', label: '약관 관리', items: [
      { key: 'terms/service', label: '서비스 이용약관' },
      { key: 'terms/privacy', label: '개인정보 처리방침' },
    ],
  },
  {
    key: 'system', label: '환경설정', items: [
      { key: 'system/admins', label: '관리자 목록' },
      { key: 'system/departments', label: '부서 관리' },
      { key: 'system/permissions', label: '부서별 접근 권한' },
      { key: 'system/company', label: '회사 정보 관리' },
    ],
  },
];

// 모든 권한 키(전체 선택용)
export const ALL_MENU_KEYS: string[] = ADMIN_MENU_TREE.flatMap((g) => g.items.length ? g.items.map((i) => i.key) : [g.key]);

// 최상위 관리자(권한/목록 노출 제외)
export const SUPER_ADMIN_EMAIL = 'klipse@admin.com';
export const SUPER_DEPT_NAME = '최상위 관리자';

// 메뉴별 액션 권한 (조회/추가/수정/삭제)
export interface ActionPerm { r: boolean; c: boolean; u: boolean; d: boolean; }
export const ACTIONS: { k: keyof ActionPerm; label: string }[] = [
  { k: 'r', label: '조회' }, { k: 'c', label: '추가' }, { k: 'u', label: '수정' }, { k: 'd', label: '삭제' },
];

export interface Department {
  id: number;
  name: string;
  menu_keys: string[];
  permissions: Record<string, ActionPerm>; // { [menuKey]: {r,c,u,d} }
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

// 현재 로그인 관리자의 권한(부서 기준) 조회. 최상위 관리자는 전체 통과
export interface MyPermissions { isSuper: boolean; perms: Record<string, ActionPerm>; }
export async function getMyPermissions(): Promise<MyPermissions> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const email = user?.email || '';
    if (email === SUPER_ADMIN_EMAIL) return { isSuper: true, perms: {} };
    const { data } = await supabase.from('admins').select('department_id, departments(name, permissions)').eq('email', email).maybeSingle();
    const dept = (data as any)?.departments;
    if (dept?.name === SUPER_DEPT_NAME) return { isSuper: true, perms: {} };
    return { isSuper: false, perms: (dept?.permissions || {}) as Record<string, ActionPerm> };
  } catch {
    return { isSuper: false, perms: {} };
  }
}

// 현재 로그인 관리자 프로필(대시보드 상단 표기용)
export interface MyProfile { name: string; email: string; deptName: string; isSuper: boolean; }
export async function getMyProfile(): Promise<MyProfile> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const email = user?.email || '';
    if (email === SUPER_ADMIN_EMAIL) return { name: user?.user_metadata?.name || '최상위 관리자', email, deptName: SUPER_DEPT_NAME, isSuper: true };
    const { data } = await supabase.from('admins').select('name, email, departments(name)').eq('email', email).maybeSingle();
    const nm = (data as any)?.name || user?.user_metadata?.name || email || '관리자';
    const dept = (data as any)?.departments?.name || '부서 미지정';
    return { name: nm, email, deptName: dept, isSuper: dept === SUPER_DEPT_NAME };
  } catch {
    return { name: '관리자', email: '', deptName: '-', isSuper: false };
  }
}

// 사내 공지사항 (관리자 전용)
export interface AdminNotice { id: number; title: string; content: string | null; pinned: boolean; created_by: string | null; created_at: string; }
export const adminNoticeApi = {
  list: () => run<AdminNotice[]>(() => supabase.from('admin_notices').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false }) as any),
  get: (id: number | string) => run<AdminNotice>(() => supabase.from('admin_notices').select('*').eq('id', id).single() as any),
  async create(input: { title: string; content?: string; pinned?: boolean }): Promise<Result<AdminNotice>> {
    if (!input.title?.trim()) return { data: null, error: '공지 제목을 입력해주세요.' };
    const by = await currentAdminName();
    return run<AdminNotice>(() => supabase.from('admin_notices').insert({ title: input.title.trim(), content: input.content || null, pinned: input.pinned ?? false, created_by: by }).select().single() as any);
  },
  async update(id: number | string, input: { title: string; content?: string; pinned?: boolean }): Promise<Result<AdminNotice>> {
    if (!input.title?.trim()) return { data: null, error: '공지 제목을 입력해주세요.' };
    return run<AdminNotice>(() => supabase.from('admin_notices').update({ title: input.title.trim(), content: input.content || null, pinned: input.pinned ?? false }).eq('id', id).select().single() as any);
  },
  setPinned: (id: number | string, pinned: boolean) => run<true>(async () => {
    const { error } = await supabase.from('admin_notices').update({ pinned }).eq('id', id);
    return { data: error ? null : (true as const), error };
  }),
  remove: (id: number | string) => run<true>(async () => {
    const { error } = await supabase.from('admin_notices').delete().eq('id', id);
    return { data: error ? null : (true as const), error };
  }),
};

export const departmentApi = {
  list: () => run<Department[]>(() => supabase.from('departments').select('*').order('name') as any),
  create: (name: string) => run<Department>(() => supabase.from('departments').insert({ name: name.trim() }).select().single() as any),
  update: (id: number, patch: Partial<Pick<Department, 'name' | 'menu_keys' | 'permissions'>>) =>
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
