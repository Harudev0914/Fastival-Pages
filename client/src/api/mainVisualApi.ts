// 메인 비주얼(시공/렌탈/DJ 배너) 관리 API
import { supabase } from '../supabaseClient';
import { run, mapError, currentAdminName, type Result } from './constructionApi';

export type MvSection = 'construction' | 'rental' | 'dj';
export type MvType = 'type_a' | 'type_b'; // type_a: 기본, type_b: 쿠폰 제공(배지+버튼)

export const SECTION_LABEL: Record<MvSection, string> = {
  construction: '시공',
  rental: '렌탈',
  dj: 'DJ',
};

export interface MainVisual {
  id: number;
  section: MvSection;
  type: MvType;
  image_url: string | null;
  badge: string | null;
  title: string;
  subtitle: string | null;
  cta_text: string | null;
  link_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface MainVisualInput {
  section: MvSection;
  type: MvType;
  image_url?: string;
  badge?: string;
  title: string;
  subtitle?: string;
  cta_text?: string;
  link_url?: string;
  is_active?: boolean;
}

const T = 'main_visual_banners';

async function nextOrder(): Promise<number> {
  try {
    const { count, error } = await supabase.from(T).select('*', { count: 'exact', head: true });
    return error ? 0 : (count ?? 0);
  } catch {
    return 0;
  }
}

export const mainVisualApi = {
  list: () => run<MainVisual[]>(() => supabase.from(T).select('*').order('section').order('display_order', { ascending: true }) as any),

  // 공개 페이지용: 섹션별 활성 배너
  listBySection: (section: MvSection) =>
    run<MainVisual[]>(() => supabase.from(T).select('*').eq('section', section).eq('is_active', true).order('display_order', { ascending: true }) as any),

  get: (id: number | string) => run<MainVisual>(() => supabase.from(T).select('*').eq('id', id).single() as any),

  async create(input: MainVisualInput): Promise<Result<MainVisual>> {
    if (!input.title?.trim()) return { data: null, error: '제목을 입력해주세요.' };
    const by = await currentAdminName();
    const display_order = await nextOrder();
    const isB = input.type === 'type_b';
    return run<MainVisual>(() => supabase.from(T).insert({
      section: input.section,
      type: input.type,
      image_url: input.image_url?.trim() || null,
      badge: isB ? (input.badge?.trim() || null) : null,
      title: input.title.trim(),
      subtitle: input.subtitle?.trim() || null,
      cta_text: isB ? (input.cta_text?.trim() || null) : null,
      link_url: input.link_url?.trim() || null,
      is_active: input.is_active ?? true,
      display_order, created_by: by, updated_by: by,
    }).select().single() as any);
  },

  async update(id: number | string, input: MainVisualInput): Promise<Result<MainVisual>> {
    if (!input.title?.trim()) return { data: null, error: '제목을 입력해주세요.' };
    const by = await currentAdminName();
    const isB = input.type === 'type_b';
    return run<MainVisual>(() => supabase.from(T).update({
      section: input.section,
      type: input.type,
      image_url: input.image_url?.trim() || null,
      badge: isB ? (input.badge?.trim() || null) : null,
      title: input.title.trim(),
      subtitle: input.subtitle?.trim() || null,
      cta_text: isB ? (input.cta_text?.trim() || null) : null,
      link_url: input.link_url?.trim() || null,
      is_active: input.is_active,
      updated_by: by,
    }).eq('id', id).select().single() as any);
  },

  async setActive(id: number | string, isActive: boolean): Promise<Result<true>> {
    const by = await currentAdminName();
    return run<true>(async () => {
      const { error } = await supabase.from(T).update({ is_active: isActive, updated_by: by }).eq('id', id);
      return { data: error ? null : (true as const), error };
    });
  },

  remove: (id: number | string) => run<true>(async () => {
    const { error } = await supabase.from(T).delete().eq('id', id);
    return { data: error ? null : (true as const), error };
  }),

  async reorder(ids: number[]): Promise<Result<true>> {
    try {
      const results = await Promise.all(ids.map((id, idx) => supabase.from(T).update({ display_order: idx }).eq('id', id)));
      const firstErr = results.find((r) => r.error);
      if (firstErr?.error) return { data: null, error: mapError(firstErr.error) };
      return { data: true as const, error: null };
    } catch (e) {
      return { data: null, error: mapError(e) };
    }
  },
};
