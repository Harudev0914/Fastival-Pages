// 회사 정보(푸터/회사카드 노출용) — 단일 행(id=1) 설정
import { supabase } from '../supabaseClient';
import { run, currentAdminName, type Result } from './core';

export interface CompanySns {
  instagram?: string;
  tiktok?: string;
  x?: string;
  youtube?: string;
  naverblog?: string;
}

export interface CompanyInfo {
  id: number;
  site_name: string | null;
  ceo_name: string | null;
  biz_name: string | null;
  biz_number: string | null;
  mail_order_number: string | null; // 통신판매업 신고번호
  phone: string | null;
  fax: string | null;
  address: string | null;
  privacy_officer: string | null;
  privacy_email: string | null;
  ad_email: string | null;
  cs_email: string | null;
  cs_phone: string | null;
  tagline: string | null;            // 회사 소개 문구
  sns: CompanySns;
  updated_at: string | null;
  updated_by: string | null;
}

export type CompanyInfoInput = Omit<CompanyInfo, 'id' | 'updated_at' | 'updated_by'>;

const T = 'company_info';

export const companyApi = {
  get: () => run<CompanyInfo>(() => supabase.from(T).select('*').eq('id', 1).maybeSingle() as any),

  async upsert(input: CompanyInfoInput): Promise<Result<CompanyInfo>> {
    const by = await currentAdminName();
    return run<CompanyInfo>(() => supabase.from(T).upsert({ id: 1, ...input, updated_by: by }).select().single() as any);
  },
};
