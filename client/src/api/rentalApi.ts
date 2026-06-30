// 렌탈 관리 API: 브랜드 / 카테고리 / 상품
import { supabase } from '../supabaseClient';
import { run, mapError, currentAdminName, type Result } from './core';

export interface RentalBrand {
  id: number;
  name: string;
  logo_url: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface RentalCategory {
  id: number;
  brand_id: number | null;
  parent_id: number | null;
  name: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  rental_brands?: { name: string } | null;
}

export interface ProductOption { name: string; add_price: number; }

export interface RentalProduct {
  id: number;
  brand_id: number | null;
  category_id: number | null;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  images: string[];
  daily_price: number;
  deposit: number;
  delivery_fee: number;
  stock: number;
  min_days: number;
  max_days: number | null;
  options: ProductOption[];
  display_order: number;
  is_active: boolean;
  is_exclusive: boolean;
  is_event: boolean;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  rental_brands?: { name: string } | null;
  rental_categories?: { name: string } | null;
}

async function nextOrder(table: string, filter?: { col: string; val: number | null }): Promise<number> {
  try {
    let q = supabase.from(table).select('*', { count: 'exact', head: true });
    if (filter && filter.val != null) q = q.eq(filter.col, filter.val);
    const { count, error } = await q;
    return error ? 0 : (count ?? 0);
  } catch {
    return 0;
  }
}

function reorderFn(table: string) {
  return async (ids: number[]): Promise<Result<true>> => {
    try {
      const results = await Promise.all(ids.map((id, idx) => supabase.from(table).update({ display_order: idx }).eq('id', id)));
      const firstErr = results.find((r) => r.error);
      if (firstErr?.error) return { data: null, error: mapError(firstErr.error) };
      return { data: true as const, error: null };
    } catch (e) {
      return { data: null, error: mapError(e) };
    }
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
  return (id: number | string): Promise<Result<true>> => run<true>(async () => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    return { data: error ? null : (true as const), error };
  });
}

// ---------------- 브랜드 ----------------
export const brandApi = {
  list: () => run<RentalBrand[]>(() => supabase.from('rental_brands').select('*').order('display_order', { ascending: true }) as any),
  listActive: () => run<RentalBrand[]>(() => supabase.from('rental_brands').select('id, name').eq('is_active', true).order('display_order', { ascending: true }) as any),
  get: (id: number | string) => run<RentalBrand>(() => supabase.from('rental_brands').select('*').eq('id', id).single() as any),

  async create(input: { name: string; logo_url?: string; description?: string; is_active?: boolean }): Promise<Result<RentalBrand>> {
    if (!input.name?.trim()) return { data: null, error: '브랜드명을 입력해주세요.' };
    const by = await currentAdminName();
    const display_order = await nextOrder('rental_brands');
    return run<RentalBrand>(() => supabase.from('rental_brands').insert({
      name: input.name.trim(), logo_url: input.logo_url?.trim() || null, description: input.description?.trim() || null,
      is_active: input.is_active ?? true, display_order, created_by: by, updated_by: by,
    }).select().single() as any);
  },

  async update(id: number | string, input: { name: string; logo_url?: string; description?: string; is_active?: boolean }): Promise<Result<RentalBrand>> {
    if (!input.name?.trim()) return { data: null, error: '브랜드명을 입력해주세요.' };
    const by = await currentAdminName();
    return run<RentalBrand>(() => supabase.from('rental_brands').update({
      name: input.name.trim(), logo_url: input.logo_url?.trim() || null, description: input.description?.trim() || null,
      is_active: input.is_active, updated_by: by,
    }).eq('id', id).select().single() as any);
  },

  setActive: setActiveFn('rental_brands'),
  remove: removeFn('rental_brands'),
  reorder: reorderFn('rental_brands'),
};

// ---------------- 카테고리 ----------------
export const rentalCategoryApi = {
  list: () => run<RentalCategory[]>(() => supabase.from('rental_categories').select('*, rental_brands(name)').order('display_order', { ascending: true }) as any),
  listByBrand: (brandId: number) => run<RentalCategory[]>(() => supabase.from('rental_categories').select('id, name, brand_id').eq('brand_id', brandId).eq('is_active', true).order('display_order', { ascending: true }) as any),
  get: (id: number | string) => run<RentalCategory>(() => supabase.from('rental_categories').select('*').eq('id', id).single() as any),

  async create(input: { brand_id: number | null; parent_id?: number | null; name: string; description?: string; image_url?: string; is_active?: boolean }): Promise<Result<RentalCategory>> {
    if (!input.brand_id) return { data: null, error: '브랜드를 선택해주세요.' };
    if (!input.name?.trim()) return { data: null, error: '카테고리명을 입력해주세요.' };
    const by = await currentAdminName();
    const display_order = await nextOrder('rental_categories', { col: 'brand_id', val: input.brand_id });
    return run<RentalCategory>(() => supabase.from('rental_categories').insert({
      brand_id: input.brand_id, parent_id: input.parent_id ?? null, name: input.name.trim(), description: input.description?.trim() || null,
      image_url: input.image_url?.trim() || null, is_active: input.is_active ?? true, display_order, created_by: by, updated_by: by,
    }).select().single() as any);
  },

  async update(id: number | string, input: { brand_id: number | null; parent_id?: number | null; name: string; description?: string; image_url?: string; is_active?: boolean }): Promise<Result<RentalCategory>> {
    if (!input.brand_id) return { data: null, error: '브랜드를 선택해주세요.' };
    if (!input.name?.trim()) return { data: null, error: '카테고리명을 입력해주세요.' };
    const by = await currentAdminName();
    return run<RentalCategory>(() => supabase.from('rental_categories').update({
      brand_id: input.brand_id, parent_id: input.parent_id ?? null, name: input.name.trim(), description: input.description?.trim() || null,
      image_url: input.image_url?.trim() || null, is_active: input.is_active, updated_by: by,
    }).eq('id', id).select().single() as any);
  },

  setActive: setActiveFn('rental_categories'),
  remove: removeFn('rental_categories'),
  reorder: reorderFn('rental_categories'),
};

// ---------------- 상품 ----------------
export interface ProductInput {
  brand_id: number | null;
  category_id: number | null;
  name: string;
  description?: string;
  thumbnail_url?: string;
  images?: string[];
  daily_price?: number;
  deposit?: number;
  delivery_fee?: number;
  stock?: number;
  min_days?: number;
  max_days?: number | null;
  options?: ProductOption[];
  is_active?: boolean;
  is_exclusive?: boolean;
  is_event?: boolean;
}

function productPayload(input: ProductInput, by: string) {
  const opts = (input.options || []).filter((o) => o.name?.trim()).map((o) => ({ name: o.name.trim(), add_price: Number(o.add_price) || 0 }));
  const imgs = (input.images || []).filter(Boolean);
  return {
    brand_id: input.brand_id,
    category_id: input.category_id,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    thumbnail_url: input.thumbnail_url?.trim() || imgs[0] || null,
    images: imgs,
    daily_price: Number(input.daily_price) || 0,
    deposit: Number(input.deposit) || 0,
    delivery_fee: Number(input.delivery_fee) || 0,
    stock: Number(input.stock) || 0,
    min_days: Number(input.min_days) || 1,
    max_days: input.max_days == null || input.max_days === ('' as any) ? null : Number(input.max_days),
    options: opts,
    is_exclusive: !!input.is_exclusive,
    is_event: !!input.is_event,
    updated_by: by,
  };
}

export const productApi = {
  list: () => run<RentalProduct[]>(() => supabase.from('rental_products').select('*, rental_brands(name), rental_categories(name)').order('display_order', { ascending: true }) as any),
  get: (id: number | string) => run<RentalProduct>(() => supabase.from('rental_products').select('*').eq('id', id).single() as any),

  async create(input: ProductInput): Promise<Result<RentalProduct>> {
    if (!input.brand_id) return { data: null, error: '브랜드를 선택해주세요.' };
    if (!input.category_id) return { data: null, error: '카테고리를 선택해주세요.' };
    if (!input.name?.trim()) return { data: null, error: '상품명을 입력해주세요.' };
    const by = await currentAdminName();
    const display_order = await nextOrder('rental_products');
    return run<RentalProduct>(() => supabase.from('rental_products').insert({
      ...productPayload(input, by), is_active: input.is_active ?? true, display_order, created_by: by,
    }).select().single() as any);
  },

  async update(id: number | string, input: ProductInput): Promise<Result<RentalProduct>> {
    if (!input.brand_id) return { data: null, error: '브랜드를 선택해주세요.' };
    if (!input.category_id) return { data: null, error: '카테고리를 선택해주세요.' };
    if (!input.name?.trim()) return { data: null, error: '상품명을 입력해주세요.' };
    const by = await currentAdminName();
    return run<RentalProduct>(() => supabase.from('rental_products').update({
      ...productPayload(input, by), is_active: input.is_active,
    }).eq('id', id).select().single() as any);
  },

  setActive: setActiveFn('rental_products'),
  remove: removeFn('rental_products'),
  reorder: reorderFn('rental_products'),
};

// ---------------- 렌탈 주문/결제 내역 (렌탈 관리) ----------------
export type PaymentStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';
export type OrderStatus = 'reserved' | 'renting' | 'returned' | 'cancelled';

export const PAYMENT_LABEL: Record<PaymentStatus, string> = { pending: '결제대기', paid: '결제완료', cancelled: '결제취소', refunded: '환불' };
export const ORDER_LABEL: Record<OrderStatus, string> = { reserved: '예약', renting: '대여중', returned: '반납완료', cancelled: '취소' };

export interface RentalOrder {
  id: number;
  product_id: number | null;
  product_name: string | null;
  brand_name: string | null;
  option_name: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  rental_start: string | null;
  rental_days: number;
  rental_end: string | null;
  quantity: number;
  daily_price: number;
  deposit: number;
  delivery_fee: number;
  total_amount: number;
  payment_status: PaymentStatus;
  payment_method: string | null;
  payment_id: string | null;
  order_status: OrderStatus;
  memo: string | null;
  created_at: string;
  updated_at: string | null;
  updated_by: string | null;
}

export const orderApi = {
  list: () => run<RentalOrder[]>(() => supabase.from('rental_orders').select('*').order('created_at', { ascending: false }) as any),

  // 상품별 판매 수량(결제완료 기준) → { [productId]: count }
  async salesCountByProduct(): Promise<Record<number, number>> {
    try {
      const { data } = await supabase.from('rental_orders').select('product_id, quantity').eq('payment_status', 'paid');
      const m: Record<number, number> = {};
      (data || []).forEach((r: any) => { if (r.product_id) m[r.product_id] = (m[r.product_id] || 0) + (Number(r.quantity) || 1); });
      return m;
    } catch { return {}; }
  },
  listByProduct: (productId: number) => run<RentalOrder[]>(() => supabase.from('rental_orders').select('*').eq('product_id', productId).order('rental_start', { ascending: false }) as any),
  get: (id: number | string) => run<RentalOrder>(() => supabase.from('rental_orders').select('*').eq('id', id).single() as any),

  // 공개 결제 플로우에서 호출 (PG 결제 성공 후)
  create: (input: Partial<RentalOrder>) => run<RentalOrder>(() => supabase.from('rental_orders').insert(input as any).select().single() as any),

  async updateStatus(id: number | string, patch: { order_status?: OrderStatus; payment_status?: PaymentStatus; memo?: string }): Promise<Result<true>> {
    const by = await currentAdminName();
    return run<true>(async () => {
      const { error } = await supabase.from('rental_orders').update({ ...patch, updated_by: by }).eq('id', id);
      return { data: error ? null : (true as const), error };
    });
  },
  remove: removeFn('rental_orders'),
};

// ---------------- 렌탈 입점 문의 (중고 매입) ----------------
export type Grade = 'C' | 'B' | 'A' | 'A+' | 'A++';
export type PurchaseStatus = 'pending' | 'approved' | 'hold' | 'rejected';
export const GRADES: Grade[] = ['C', 'B', 'A', 'A+', 'A++'];
export const PURCHASE_STATUS_LABEL: Record<PurchaseStatus, string> = { pending: '접수', approved: '승인', hold: '보류', rejected: '반려' };

export interface PurchaseInquiry {
  id: number;
  product_id: number | null;
  product_name: string;
  brand_name: string | null;
  condition_grade: Grade;
  desired_price: number;
  images: string[];
  description: string | null;
  applicant_name: string | null;
  applicant_phone: string | null;
  applicant_email: string | null;
  status: PurchaseStatus;
  admin_memo: string | null;
  created_at: string;
  updated_at: string | null;
  updated_by: string | null;
}

export const purchaseApi = {
  list: () => run<PurchaseInquiry[]>(() => supabase.from('rental_purchase_inquiries').select('*').order('created_at', { ascending: false }) as any),
  get: (id: number | string) => run<PurchaseInquiry>(() => supabase.from('rental_purchase_inquiries').select('*').eq('id', id).single() as any),

  // 공개 입점 문의 폼에서 호출
  create: (input: Partial<PurchaseInquiry>) => run<PurchaseInquiry>(() => supabase.from('rental_purchase_inquiries').insert(input as any).select().single() as any),

  async setStatus(id: number | string, status: PurchaseStatus, adminMemo?: string): Promise<Result<true>> {
    const by = await currentAdminName();
    return run<true>(async () => {
      const patch: any = { status, updated_by: by };
      if (adminMemo !== undefined) patch.admin_memo = adminMemo;
      const { error } = await supabase.from('rental_purchase_inquiries').update(patch).eq('id', id);
      return { data: error ? null : (true as const), error };
    });
  },
  remove: removeFn('rental_purchase_inquiries'),
};
