// 시공(Construction) 관리 API: 카테고리/후기/포트폴리오/챗봇/문의 CRUD
// 공용 코어(Result·에러처리·실행기)는 core.ts 에서 재사용
import { supabase } from '../supabaseClient';
import { ok, fail, mapError, run, currentAdminName, nextOrder, type Result } from './core';

// 하위 호환: 기존에 constructionApi 에서 helper 를 import 하던 곳 지원
export { mapError, run, currentAdminName, type Result };

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
