// DJ 입점(아티스트 회원) API
import { supabase } from '../supabaseClient';
import { run, currentAdminName, type Result } from './core';

export type DjStatus = 'pending' | 'approved' | 'hold' | 'rejected';
export const DJ_STATUS_LABEL: Record<DjStatus, string> = { pending: '접수', approved: '승인', hold: '보류', rejected: '반려' };
export const DJ_REGIONS = ['서울', '경기도', '대전'] as const;

export interface SocialLink { label: string; url: string; }

export interface DjArtist {
  id: number;
  name: string;
  stage_name: string | null;
  phone: string | null;
  email: string | null;
  id_card_url: string | null;
  bankbook_url: string | null;
  resume_url: string | null;
  portfolio_type: 'pdf' | 'img';
  portfolio_files: string[];
  soundcloud_url: string | null;
  mp3_url: string | null;
  youtube_url: string | null;
  social_links: SocialLink[];
  regions: string[];
  guarantee_seoul: number | null;
  guarantee_gyeonggi: number | null;
  guarantee_daejeon: number | null;
  intro: string | null;
  status: DjStatus;
  admin_memo: string | null;
  created_at: string;
  updated_at: string | null;
  updated_by: string | null;
}

export const djApi = {
  list: () => run<DjArtist[]>(() => supabase.from('dj_artists').select('*').order('created_at', { ascending: false }) as any),
  get: (id: number | string) => run<DjArtist>(() => supabase.from('dj_artists').select('*').eq('id', id).single() as any),

  // 공개 지원 폼
  create: (input: Partial<DjArtist>) => run<DjArtist>(() => supabase.from('dj_artists').insert(input as any).select().single() as any),

  async setStatus(id: number | string, status: DjStatus, adminMemo?: string): Promise<Result<true>> {
    const by = await currentAdminName();
    return run<true>(async () => {
      const patch: any = { status, updated_by: by };
      if (adminMemo !== undefined) patch.admin_memo = adminMemo;
      const { error } = await supabase.from('dj_artists').update(patch).eq('id', id);
      return { data: error ? null : (true as const), error };
    });
  },
  remove: (id: number | string) => run<true>(async () => {
    const { error } = await supabase.from('dj_artists').delete().eq('id', id);
    return { data: error ? null : (true as const), error };
  }),
};
