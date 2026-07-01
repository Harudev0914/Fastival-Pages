// 메인 비주얼(시공/렌탈/DJ 배너) 관리 API
import { supabase } from '../supabaseClient';
import { run, mapError, currentAdminName, type Result } from './core';

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
  is_ad: boolean;                  // 시공: AD 배너 여부(우측 고정 배너)
  image_url: string | null;        // 메인/AD 데스크탑 이미지
  image_mobile_url: string | null; // AD 모바일(가로) 이미지
  badge: string | null;
  title: string;
  subtitle: string | null;
  cta_text: string | null;
  link_url: string | null;         // 포트폴리오 등 클릭 이동 링크
  author_name: string | null;      // 클라이언트 표시 등록자명
  author_avatar: string | null;    // 등록자 아바타
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
  is_ad?: boolean;
  image_url?: string;
  image_mobile_url?: string;
  badge?: string;
  title: string;
  subtitle?: string;
  cta_text?: string;
  link_url?: string;
  author_name?: string;
  author_avatar?: string;
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
    // 제목은 선택(문구 미사용 배너 허용). 비면 빈 문자열로 저장
    const by = await currentAdminName();
    const display_order = await nextOrder();
    const isB = input.type === 'type_b';
    return run<MainVisual>(() => supabase.from(T).insert({
      section: input.section,
      type: input.type,
      is_ad: !!input.is_ad,
      image_url: input.image_url?.trim() || null,
      image_mobile_url: input.image_mobile_url?.trim() || null,
      badge: isB ? (input.badge?.trim() || null) : null,
      title: (input.title || '').trim(),
      subtitle: input.subtitle?.trim() || null,
      cta_text: isB ? (input.cta_text?.trim() || null) : null,
      link_url: input.link_url?.trim() || null,
      author_name: input.author_name?.trim() || null,
      author_avatar: input.author_avatar?.trim() || null,
      is_active: input.is_active ?? true,
      display_order, created_by: by, updated_by: by,
    }).select().single() as any);
  },

  async update(id: number | string, input: MainVisualInput): Promise<Result<MainVisual>> {
    // 제목은 선택(문구 미사용 배너 허용). 비면 빈 문자열로 저장
    const by = await currentAdminName();
    const isB = input.type === 'type_b';
    return run<MainVisual>(() => supabase.from(T).update({
      section: input.section,
      type: input.type,
      is_ad: !!input.is_ad,
      image_url: input.image_url?.trim() || null,
      image_mobile_url: input.image_mobile_url?.trim() || null,
      badge: isB ? (input.badge?.trim() || null) : null,
      title: (input.title || '').trim(),
      subtitle: input.subtitle?.trim() || null,
      cta_text: isB ? (input.cta_text?.trim() || null) : null,
      link_url: input.link_url?.trim() || null,
      author_name: input.author_name?.trim() || null,
      author_avatar: input.author_avatar?.trim() || null,
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
