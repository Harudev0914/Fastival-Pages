// =============================================================
// 시공(Construction) 관리 API 레이어
//  - 모든 CRUD를 Supabase에 실제 반영
//  - 일관된 Result<T> 반환 + 빡빡한 예외 처리(코드별 한글 메시지)
//  - 입력 검증 포함
// =============================================================
import { supabase } from '../supabaseClient';

export interface Result<T> {
  data: T | null;
  error: string | null;
}

const ok = <T>(data: T): Result<T> => ({ data, error: null });
const fail = <T = never>(error: string): Result<T> => ({ data: null, error });

// ----- 에러 정규화 -----------------------------------------------------
export function mapError(error: any): string {
  if (!error) return '알 수 없는 오류가 발생했습니다.';
  const code: string | undefined = error.code;
  const msg: string = error.message || '';

  switch (code) {
    case '42P01': return '시공 데이터 테이블이 없습니다. 마이그레이션 SQL을 먼저 적용해주세요.';
    case '42703': return '필요한 컬럼이 없습니다. 최신 마이그레이션 SQL을 적용해주세요.';
    case '42501': return '권한이 없습니다. 관리자 계정으로 로그인했는지 확인해주세요.';
    case '23505': return '이미 동일한 항목이 존재합니다.';
    case '23503': return '연결된 다른 데이터가 있어 처리할 수 없습니다.';
    case '23502': return '필수 입력값이 비어 있습니다.';
    case '23514': return '허용되지 않는 값이 포함되어 있습니다.';
    case '22P02': return '잘못된 형식의 값이 있습니다.';
    case 'PGRST116': return '해당 데이터를 찾을 수 없습니다.';
    case 'PGRST301':
    case '401': return '인증이 필요합니다. 다시 로그인해주세요.';
    default: break;
  }
  if (/Failed to fetch|NetworkError|network|fetch/i.test(msg)) return '네트워크 연결 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  if (/JWT|permission|RLS|row-level|not authorized/i.test(msg)) return '권한 또는 인증 오류가 발생했습니다. 다시 로그인해주세요.';
  return msg || '요청 처리 중 오류가 발생했습니다.';
}

// Supabase 쿼리({data,error}) 또는 네트워크 예외를 통합 처리
async function run<T>(op: () => Promise<{ data: T | null; error: any }>): Promise<Result<T>> {
  try {
    const { data, error } = await op();
    if (error) {
      console.error('[constructionApi]', error);
      return fail(mapError(error));
    }
    return ok((data ?? null) as T);
  } catch (e) {
    console.error('[constructionApi] unexpected', e);
    return fail(mapError(e));
  }
}

// 현재 관리자 표시명(등록자/수정자 기록용)
export async function currentAdminName(): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.user_metadata?.name || user?.email || '관리자';
  } catch {
    return '관리자';
  }
}

// 신규 항목 display_order(맨 뒤). 실패 시 0
async function nextOrder(table: string): Promise<number> {
  try {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

// 순번 일괄 저장 공통 처리
async function reorder(table: string, ids: (number | string)[]): Promise<Result<true>> {
  try {
    const results = await Promise.all(ids.map((id, idx) => supabase.from(table).update({ display_order: idx }).eq('id', id)));
    const firstErr = results.find((r) => r.error);
    if (firstErr?.error) return fail(mapError(firstErr.error));
    return ok(true as const);
  } catch (e) {
    return fail(mapError(e));
  }
}

// =============================================================
// 타입
// =============================================================
export interface ConstructionCategory {
  id: number;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}
export interface CategoryInput { name: string; description?: string; is_active?: boolean; }

export interface ConstructionReview {
  id: number;
  category_id: number | null;
  author_name: string;
  title: string | null;
  content: string;
  rating: number;
  images: string[];
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  construction_categories?: { name: string } | null;
}
export interface ReviewInput {
  category_id: number | null;
  author_name: string;
  title?: string;
  content: string;
  rating: number;
  images: string[];
  is_active?: boolean;
}

export interface ConstructionPortfolio {
  id: number;
  category_id: number | null;
  title: string;
  thumbnail_url: string | null;
  content_html: string | null;
  link_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  construction_categories?: { name: string } | null;
}
export interface PortfolioInput {
  category_id: number | null;
  title: string;
  thumbnail_url?: string;
  content_html?: string;
  link_url?: string;
  is_active?: boolean;
}

export type QType = 'radio' | 'checkbox' | 'select' | 'text' | 'file' | 'application';
export interface ChatbotQuestion {
  id: number;
  title: string;
  type: QType;
  options: string[];
  display_order: number;
  is_active: boolean;
  use_categories: boolean;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}
export interface QuestionInput {
  title: string;
  type: QType;
  options: string[];
  use_categories: boolean;
  is_active?: boolean;
}

export type InquiryStatus = 'pending' | 'replied' | 'hold';
export interface ConstructionInquiry {
  id: number;
  name: string | null;
  phone: string | null;
  email: string | null;
  file_name: string | null;
  answers: { question: string; answer: string }[];
  privacy_agree: boolean;
  marketing_agree: boolean;
  status: InquiryStatus;
  memo: string | null;
  created_at: string;
  updated_at: string | null;
  updated_by: string | null;
}
export interface InquirySubmitInput {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  file_name?: string | null;
  answers: { question: string; answer: string }[];
  privacy_agree: boolean;
  marketing_agree?: boolean;
}

const T = {
  cat: 'construction_categories',
  review: 'construction_reviews',
  portfolio: 'construction_portfolio',
  question: 'inquiry_questions',
  inquiry: 'construction_inquiries',
} as const;

// =============================================================
// 카테고리
// =============================================================
export const categoryApi = {
  list: () => run<ConstructionCategory[]>(() => supabase.from(T.cat).select('*').order('display_order', { ascending: true }) as any),
  listActive: () => run<{ id: number; name: string }[]>(() => supabase.from(T.cat).select('id, name').eq('is_active', true).order('display_order') as any),
  get: (id: number | string) => run<ConstructionCategory>(() => supabase.from(T.cat).select('*').eq('id', id).single() as any),

  async create(input: CategoryInput): Promise<Result<ConstructionCategory>> {
    const name = (input.name || '').trim();
    if (!name) return fail('카테고리명을 입력해주세요.');
    const by = await currentAdminName();
    const display_order = await nextOrder(T.cat);
    return run<ConstructionCategory>(() => supabase.from(T.cat).insert({
      name, description: input.description?.trim() || null, is_active: input.is_active ?? true,
      display_order, created_by: by, updated_by: by,
    }).select().single() as any);
  },

  async update(id: number | string, input: CategoryInput): Promise<Result<ConstructionCategory>> {
    const name = (input.name || '').trim();
    if (!name) return fail('카테고리명을 입력해주세요.');
    const by = await currentAdminName();
    return run<ConstructionCategory>(() => supabase.from(T.cat).update({
      name, description: input.description?.trim() || null, is_active: input.is_active, updated_by: by,
    }).eq('id', id).select().single() as any);
  },

  async setActive(id: number | string, isActive: boolean): Promise<Result<true>> {
    const by = await currentAdminName();
    return run<true>(async () => {
      const { error } = await supabase.from(T.cat).update({ is_active: isActive, updated_by: by }).eq('id', id);
      return { data: error ? null : (true as const), error };
    });
  },

  remove: (id: number | string) => run<true>(async () => {
    const { error } = await supabase.from(T.cat).delete().eq('id', id);
    return { data: error ? null : (true as const), error };
  }),

  reorder: (ids: number[]) => reorder(T.cat, ids),
};

// =============================================================
// 후기
// =============================================================
export const reviewApi = {
  list: () => run<ConstructionReview[]>(() => supabase.from(T.review).select('*, construction_categories(name)').order('display_order', { ascending: true }) as any),
  get: (id: number | string) => run<ConstructionReview>(() => supabase.from(T.review).select('*').eq('id', id).single() as any),

  async create(input: ReviewInput): Promise<Result<ConstructionReview>> {
    if (!input.author_name?.trim()) return fail('작성자를 입력해주세요.');
    if (!input.content?.trim()) return fail('후기 내용을 입력해주세요.');
    const by = await currentAdminName();
    const display_order = await nextOrder(T.review);
    return run<ConstructionReview>(() => supabase.from(T.review).insert({
      category_id: input.category_id, author_name: input.author_name.trim(), title: input.title?.trim() || null,
      content: input.content.trim(), rating: input.rating, images: input.images || [],
      is_active: input.is_active ?? true, display_order, created_by: by, updated_by: by,
    }).select().single() as any);
  },

  async update(id: number | string, input: ReviewInput): Promise<Result<ConstructionReview>> {
    if (!input.author_name?.trim()) return fail('작성자를 입력해주세요.');
    if (!input.content?.trim()) return fail('후기 내용을 입력해주세요.');
    const by = await currentAdminName();
    return run<ConstructionReview>(() => supabase.from(T.review).update({
      category_id: input.category_id, author_name: input.author_name.trim(), title: input.title?.trim() || null,
      content: input.content.trim(), rating: input.rating, images: input.images || [], is_active: input.is_active, updated_by: by,
    }).eq('id', id).select().single() as any);
  },

  async setActive(id: number | string, isActive: boolean): Promise<Result<true>> {
    const by = await currentAdminName();
    return run<true>(async () => {
      const { error } = await supabase.from(T.review).update({ is_active: isActive, updated_by: by }).eq('id', id);
      return { data: error ? null : (true as const), error };
    });
  },

  remove: (id: number | string) => run<true>(async () => {
    const { error } = await supabase.from(T.review).delete().eq('id', id);
    return { data: error ? null : (true as const), error };
  }),

  reorder: (ids: number[]) => reorder(T.review, ids),
};

// =============================================================
// 포트폴리오
// =============================================================
export const portfolioApi = {
  list: () => run<ConstructionPortfolio[]>(() => supabase.from(T.portfolio).select('*, construction_categories(name)').order('display_order', { ascending: true }) as any),
  get: (id: number | string) => run<ConstructionPortfolio>(() => supabase.from(T.portfolio).select('*').eq('id', id).single() as any),

  async create(input: PortfolioInput): Promise<Result<ConstructionPortfolio>> {
    if (!input.title?.trim()) return fail('제목을 입력해주세요.');
    if (input.category_id == null) return fail('카테고리를 선택해주세요.');
    const by = await currentAdminName();
    const display_order = await nextOrder(T.portfolio);
    return run<ConstructionPortfolio>(() => supabase.from(T.portfolio).insert({
      category_id: input.category_id, title: input.title.trim(), thumbnail_url: input.thumbnail_url?.trim() || null,
      content_html: input.content_html || null, link_url: input.link_url?.trim() || null,
      is_active: input.is_active ?? true, display_order, created_by: by, updated_by: by,
    }).select().single() as any);
  },

  async update(id: number | string, input: PortfolioInput): Promise<Result<ConstructionPortfolio>> {
    if (!input.title?.trim()) return fail('제목을 입력해주세요.');
    if (input.category_id == null) return fail('카테고리를 선택해주세요.');
    const by = await currentAdminName();
    return run<ConstructionPortfolio>(() => supabase.from(T.portfolio).update({
      category_id: input.category_id, title: input.title.trim(), thumbnail_url: input.thumbnail_url?.trim() || null,
      content_html: input.content_html || null, link_url: input.link_url?.trim() || null, is_active: input.is_active, updated_by: by,
    }).eq('id', id).select().single() as any);
  },

  async setActive(id: number | string, isActive: boolean): Promise<Result<true>> {
    const by = await currentAdminName();
    return run<true>(async () => {
      const { error } = await supabase.from(T.portfolio).update({ is_active: isActive, updated_by: by }).eq('id', id);
      return { data: error ? null : (true as const), error };
    });
  },

  remove: (id: number | string) => run<true>(async () => {
    const { error } = await supabase.from(T.portfolio).delete().eq('id', id);
    return { data: error ? null : (true as const), error };
  }),

  reorder: (ids: number[]) => reorder(T.portfolio, ids),
};

// =============================================================
// 챗봇 룰베이스 (inquiry_questions)
// =============================================================
const HAS_OPTIONS: QType[] = ['radio', 'checkbox', 'select'];

export const chatbotApi = {
  list: () => run<ChatbotQuestion[]>(() => supabase.from(T.question).select('*').order('display_order', { ascending: true }) as any),
  get: (id: number | string) => run<ChatbotQuestion>(() => supabase.from(T.question).select('*').eq('id', id).single() as any),

  async create(input: QuestionInput): Promise<Result<ChatbotQuestion>> {
    if (!input.title?.trim()) return fail('질문 내용을 입력해주세요.');
    const by = await currentAdminName();
    const display_order = await nextOrder(T.question);
    const options = HAS_OPTIONS.includes(input.type) ? input.options : [];
    return run<ChatbotQuestion>(() => supabase.from(T.question).insert({
      title: input.title.trim(), type: input.type, options,
      use_categories: HAS_OPTIONS.includes(input.type) ? input.use_categories : false,
      is_active: input.is_active ?? true, display_order, created_by: by, updated_by: by,
    }).select().single() as any);
  },

  async update(id: number | string, input: QuestionInput): Promise<Result<ChatbotQuestion>> {
    if (!input.title?.trim()) return fail('질문 내용을 입력해주세요.');
    const by = await currentAdminName();
    const options = HAS_OPTIONS.includes(input.type) ? input.options : [];
    return run<ChatbotQuestion>(() => supabase.from(T.question).update({
      title: input.title.trim(), type: input.type, options,
      use_categories: HAS_OPTIONS.includes(input.type) ? input.use_categories : false,
      is_active: input.is_active, updated_by: by,
    }).eq('id', id).select().single() as any);
  },

  async setActive(id: number | string, isActive: boolean): Promise<Result<true>> {
    const by = await currentAdminName();
    return run<true>(async () => {
      const { error } = await supabase.from(T.question).update({ is_active: isActive, updated_by: by }).eq('id', id);
      return { data: error ? null : (true as const), error };
    });
  },

  remove: (id: number | string) => run<true>(async () => {
    const { error } = await supabase.from(T.question).delete().eq('id', id);
    return { data: error ? null : (true as const), error };
  }),

  reorder: (ids: number[]) => reorder(T.question, ids),

  // 공개 챗봇용: 활성 질문 + 카테고리 연동 옵션 치환
  async loadPublic(): Promise<Result<ChatbotQuestion[]>> {
    try {
      const [qRes, cRes] = await Promise.all([
        supabase.from(T.question).select('*').order('display_order', { ascending: true }),
        supabase.from(T.cat).select('name').eq('is_active', true).order('display_order'),
      ]);
      if (qRes.error) return fail(mapError(qRes.error));
      const categoryNames = (cRes.data || []).map((c: { name: string }) => c.name);
      const prepared = ((qRes.data as ChatbotQuestion[]) || [])
        .filter((q) => q.is_active !== false)
        .map((q) => (q.use_categories && categoryNames.length > 0 ? { ...q, options: categoryNames } : q));
      return ok(prepared);
    } catch (e) {
      return fail(mapError(e));
    }
  },
};

// =============================================================
// 시공 문의 내역 (construction_inquiries)
// =============================================================
export const inquiryApi = {
  list: () => run<ConstructionInquiry[]>(() => supabase.from(T.inquiry).select('*').order('created_at', { ascending: false }) as any),
  get: (id: number | string) => run<ConstructionInquiry>(() => supabase.from(T.inquiry).select('*').eq('id', id).single() as any),

  // 공개 사용자(비회원) 제출 — 관리자 인증 불필요
  async submit(input: InquirySubmitInput): Promise<Result<ConstructionInquiry>> {
    if (!input.privacy_agree) return fail('개인정보 활용 동의(필수)에 동의해주세요.');
    return run<ConstructionInquiry>(() => supabase.from(T.inquiry).insert({
      name: input.name || null, phone: input.phone || null, email: input.email || null,
      file_name: input.file_name || null, answers: input.answers || [],
      privacy_agree: input.privacy_agree, marketing_agree: input.marketing_agree ?? false,
      status: 'pending',
    }).select().single() as any);
  },

  async update(id: number | string, patch: { status: InquiryStatus; memo?: string }): Promise<Result<true>> {
    const by = await currentAdminName();
    return run<true>(async () => {
      const { error } = await supabase.from(T.inquiry).update({ status: patch.status, memo: patch.memo?.trim() || null, updated_by: by }).eq('id', id);
      return { data: error ? null : (true as const), error };
    });
  },

  remove: (id: number | string) => run<true>(async () => {
    const { error } = await supabase.from(T.inquiry).delete().eq('id', id);
    return { data: error ? null : (true as const), error };
  }),
};
