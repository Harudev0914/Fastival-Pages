// 렌탈 관리 API: 브랜드 / 카테고리 / 상품
import { supabase } from '../supabaseClient';
import { run, mapError, ok, fail, currentAdminName, type Result } from './core';

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
  detail_html: string | null;   // 상품 상세 본문(HTML 에디터, 이미지 포함). 갤러리 이미지와 별개
  thumbnail_url: string | null;
  images: string[];
  daily_price: number;
  list_price: number | null;    // 정가(할인 전 일 단가, 취소선). null/0 = 할인 표시 안 함
  coupon_price: number | null;  // 쿠폰 적용가(일 단가). null/0 = 쿠폰 표시 안 함
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
  // 공개 목록: 이름 A-Z(가나다) 정렬 (대소문자·한/영 무관)
  listActive: () => run<RentalBrand[]>(async () => {
    const res: any = await supabase.from('rental_brands').select('id, name').eq('is_active', true);
    if (res.data) res.data.sort((a: any, b: any) => String(a.name).localeCompare(String(b.name), 'ko'));
    return res;
  }),
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
  // 공개 페이지용: 활성 카테고리만 · 이름 가나다/A-Z 정렬 (상위·하위 각각 이름순)
  listActive: () => run<RentalCategory[]>(async () => {
    const res: any = await supabase.from('rental_categories').select('*').eq('is_active', true);
    if (res.data) res.data.sort((a: any, b: any) => String(a.name).localeCompare(String(b.name), 'ko'));
    return res;
  }),
  listByBrand: (brandId: number) => run<RentalCategory[]>(async () => {
    const res: any = await supabase.from('rental_categories').select('id, name, brand_id').eq('brand_id', brandId).eq('is_active', true);
    if (res.data) res.data.sort((a: any, b: any) => String(a.name).localeCompare(String(b.name), 'ko'));
    return res;
  }),
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
  detail_html?: string | null;
  thumbnail_url?: string;
  images?: string[];
  daily_price?: number;
  list_price?: number | null;
  coupon_price?: number | null;
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
    detail_html: input.detail_html?.trim() || null,
    thumbnail_url: input.thumbnail_url?.trim() || imgs[0] || null,
    images: imgs,
    daily_price: Number(input.daily_price) || 0,
    list_price: input.list_price == null || input.list_price === ('' as any) ? null : Number(input.list_price),
    coupon_price: input.coupon_price == null || input.coupon_price === ('' as any) ? null : Number(input.coupon_price),
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

// 목록/그리드용 컬럼 — 대용량 TEXT(detail_html)은 상세 조회(get)에서만 가져와 목록 payload 절감
const PRODUCT_LIST_COLS = 'id, brand_id, category_id, name, description, thumbnail_url, images, daily_price, list_price, coupon_price, deposit, delivery_fee, stock, min_days, max_days, options, display_order, is_active, is_exclusive, is_event, created_at, updated_at, created_by, updated_by, rental_brands(name), rental_categories(name)';

export const productApi = {
  list: () => run<RentalProduct[]>(() => supabase.from('rental_products').select(PRODUCT_LIST_COLS).order('display_order', { ascending: true }) as any),
  // 공개 페이지용: 활성 상품만 (서버 필터로 payload 절감)
  listActive: () => run<RentalProduct[]>(() => supabase.from('rental_products').select(PRODUCT_LIST_COLS).eq('is_active', true).order('display_order', { ascending: true }) as any),
  get: (id: number | string) => run<RentalProduct>(() => supabase.from('rental_products').select('*, rental_brands(name), rental_categories(name)').eq('id', id).single() as any),

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
  // rental_orders 는 PII 때문에 anon SELECT 불가 → 집계만 반환하는 RPC(rental_sales_count) 사용
  async salesCountByProduct(): Promise<Record<number, number>> {
    try {
      const { data } = await supabase.rpc('rental_sales_count');
      const m: Record<number, number> = {};
      (data || []).forEach((r: any) => { if (r.product_id) m[r.product_id] = Number(r.qty) || 0; });
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
  parent_category_name: string | null;  // 1차(대) 카테고리
  category_name: string | null;         // 2차(소) 카테고리
  condition_grade: Grade;
  desired_price: number;
  images: string[];
  description: string | null;
  applicant_name: string | null;
  applicant_phone: string | null;
  applicant_email: string | null;
  owner_user_id: string | null;         // 판매 신청 회원(auth.users.id)
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

// ---------------- 렌탈 출고 현황 (계약 후 실제 출고 → 사용자 마이페이지 노출) ----------------
export type ShipmentStatus = 'preparing' | 'shipped' | 'delivering' | 'installed' | 'returned';
export const SHIPMENT_STATUS_LABEL: Record<ShipmentStatus, string> = { preparing: '출고 준비', shipped: '출고 완료', delivering: '배송중', installed: '설치·수령', returned: '회수 완료' };
export const SHIPMENT_STATUS_COLOR: Record<ShipmentStatus, string> = { preparing: '#64748b', shipped: '#2563eb', delivering: '#d97706', installed: '#059669', returned: '#94a3b8' };

export interface RentalShipment {
  id: number;
  order_id: number | null;
  contract_id: number | null;
  product_name: string;
  brand_name: string | null;
  quantity: number;
  customer_name: string | null;
  customer_phone: string | null;
  ship_date: string | null;
  return_date: string | null;
  tracking_no: string | null;
  status: ShipmentStatus;
  memo: string | null;
  owner_user_id: string | null;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export const shipmentApi = {
  list: () => run<RentalShipment[]>(() => supabase.from('rental_shipments').select('*').order('ship_date', { ascending: false, nullsFirst: false }) as any),
  get: (id: number | string) => run<RentalShipment>(() => supabase.from('rental_shipments').select('*').eq('id', id).single() as any),
  // 사용자 마이페이지: 본인 소유 출고 건 조회 (RLS owner read 정책과 함께 사용)
  listMine: () => run<RentalShipment[]>(() => supabase.from('rental_shipments').select('*').order('ship_date', { ascending: false, nullsFirst: false }) as any),
  async create(input: Partial<RentalShipment>): Promise<Result<RentalShipment>> {
    if (!input.product_name?.trim()) return { data: null, error: '품목명을 입력해주세요.' };
    const by = await currentAdminName();
    return run<RentalShipment>(() => supabase.from('rental_shipments').insert({
      order_id: input.order_id ?? null, contract_id: input.contract_id ?? null,
      product_name: input.product_name!.trim(), brand_name: input.brand_name || null, quantity: input.quantity ?? 1,
      customer_name: input.customer_name || null, customer_phone: input.customer_phone || null,
      ship_date: input.ship_date || null, return_date: input.return_date || null, tracking_no: input.tracking_no || null,
      status: input.status || 'preparing', memo: input.memo || null, owner_user_id: input.owner_user_id || null,
      created_by: by, updated_by: by,
    }).select().single() as any);
  },
  async update(id: number | string, input: Partial<RentalShipment>): Promise<Result<RentalShipment>> {
    if (!input.product_name?.trim()) return { data: null, error: '품목명을 입력해주세요.' };
    const by = await currentAdminName();
    return run<RentalShipment>(() => supabase.from('rental_shipments').update({
      order_id: input.order_id ?? null, contract_id: input.contract_id ?? null,
      product_name: input.product_name!.trim(), brand_name: input.brand_name || null, quantity: input.quantity ?? 1,
      customer_name: input.customer_name || null, customer_phone: input.customer_phone || null,
      ship_date: input.ship_date || null, return_date: input.return_date || null, tracking_no: input.tracking_no || null,
      status: input.status, memo: input.memo || null, owner_user_id: input.owner_user_id || null,
      updated_by: by,
    }).eq('id', id).select().single() as any);
  },
  async setStatus(id: number | string, status: ShipmentStatus): Promise<Result<true>> {
    const by = await currentAdminName();
    return run<true>(async () => {
      const { error } = await supabase.from('rental_shipments').update({ status, updated_by: by }).eq('id', id);
      return { data: error ? null : (true as const), error };
    });
  },
  remove: removeFn('rental_shipments'),
  removeMany: (ids: (number | string)[]) => run<true>(async () => {
    const { error } = await supabase.from('rental_shipments').delete().in('id', ids);
    return { data: error ? null : (true as const), error };
  }),
};

// ── 브랜드 관심 저장 (회원별) ──────────────────────────────────────────────
export interface BrandFavoriter { user_id: string; user_name: string | null; created_at: string; }

export const brandFavoriteApi = {
  // 해당 브랜드를 관심 저장한 회원 목록 (최신순) — 누구나 조회
  listByBrand: (brandId: number) => run<BrandFavoriter[]>(() =>
    supabase.from('rental_brand_favorites').select('user_id, user_name, created_at').eq('brand_id', brandId).order('created_at', { ascending: false }) as any),

  // 저장/해제 토글 → 저장 후 상태(true=저장됨). 비로그인 시 data=null (호출부에서 로그인 유도)
  async toggle(brandId: number): Promise<Result<boolean | null>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return ok(null);
      const { data: existing } = await supabase.from('rental_brand_favorites')
        .select('id').eq('brand_id', brandId).eq('user_id', user.id).maybeSingle();
      if (existing) {
        const { error } = await supabase.from('rental_brand_favorites').delete().eq('id', existing.id);
        return error ? fail(mapError(error)) : ok(false);
      }
      const user_name = user.user_metadata?.name || (user.email ? user.email.split('@')[0] : '회원');
      const { error } = await supabase.from('rental_brand_favorites').insert({ brand_id: brandId, user_id: user.id, user_name });
      return error ? fail(mapError(error)) : ok(true);
    } catch (e) {
      return fail(mapError(e));
    }
  },
};
