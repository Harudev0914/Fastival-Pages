// 통합 승인 요청 API (문의/신청 → 서류 발송 → 사용자 마이페이지 승인 → 관리자 최종 처리)
import { supabase } from '../supabaseClient';
import { run, currentAdminName, type Result } from './core';

export type ApprovalRefType = 'rental_order' | 'rental_purchase' | 'dj_artist' | 'construction_inquiry' | 'dj_event';
export type ApprovalDocType = 'estimate' | 'contract' | 'none';
export type ApprovalStatus = 'sent' | 'approved' | 'rejected' | 'cancelled';

export const REF_TYPE_LABEL: Record<ApprovalRefType, string> = {
  rental_order: '렌탈 신청', rental_purchase: '렌탈 입점(매입)', dj_artist: 'DJ 입점', construction_inquiry: '시공 문의', dj_event: 'DJ 행사',
};
export const DOC_TYPE_LABEL: Record<ApprovalDocType, string> = { estimate: '견적서', contract: '계약서', none: '서류 없음' };
export const APPROVAL_STATUS_LABEL: Record<ApprovalStatus, string> = { sent: '승인 대기', approved: '사용자 승인', rejected: '사용자 반려', cancelled: '취소됨' };
export const APPROVAL_STATUS_COLOR: Record<ApprovalStatus, string> = { sent: '#d97706', approved: '#059669', rejected: '#dc2626', cancelled: '#94a3b8' };

export interface ApprovalRequest {
  id: number;
  ref_type: ApprovalRefType;
  ref_id: number;
  title: string;
  doc_type: ApprovalDocType;
  doc_id: number | null;
  estimate_id: number | null;   // 첨부 견적서
  contract_id: number | null;   // 첨부 계약서
  owner_user_id: string;
  customer_name: string | null;
  amount: number | null;
  status: ApprovalStatus;
  user_memo: string | null;
  acted_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
}

const T = 'approval_requests';

export interface MatchedUser { id: string; email: string; name: string; }

export const approvalApi = {
  // 신청자 이메일로 가입 계정 조회 (승인 대상 자동 매칭)
  async findUserByEmail(email: string): Promise<MatchedUser | null> {
    if (!email?.trim()) return null;
    try {
      const { data, error } = await supabase.rpc('lookup_user_by_email', { p_email: email.trim() });
      if (error) return null;
      const row = Array.isArray(data) ? data[0] : data;
      return row ? { id: row.id, email: row.email, name: row.name } : null;
    } catch { return null; }
  },

  // ---- 관리자 ----
  // 엔티티에 연결된 최신 승인 요청 1건 (없으면 null)
  async getByRef(refType: ApprovalRefType, refId: number | string): Promise<Result<ApprovalRequest | null>> {
    return run<ApprovalRequest | null>(() => supabase.from(T).select('*').eq('ref_type', refType).eq('ref_id', refId).order('created_at', { ascending: false }).limit(1).maybeSingle() as any);
  },
  list: (status?: ApprovalStatus) => run<ApprovalRequest[]>(() => {
    let q = supabase.from(T).select('*').order('created_at', { ascending: false });
    if (status) q = q.eq('status', status);
    return q as any;
  }),
  async create(input: {
    ref_type: ApprovalRefType; ref_id: number; title: string; owner_user_id: string;
    estimate_id?: number | null; contract_id?: number | null;
    doc_type?: ApprovalDocType; doc_id?: number | null; customer_name?: string | null; amount?: number | null;
  }): Promise<Result<ApprovalRequest>> {
    if (!input.owner_user_id?.trim()) return { data: null, error: '승인할 사용자 ID(UUID)를 입력해주세요.' };
    if (!input.title?.trim()) return { data: null, error: '제목을 입력해주세요.' };
    const by = await currentAdminName();
    // 하위호환: 대표 doc_type/doc_id 는 첨부된 서류 기준으로 기록(견적서 우선)
    const estId = input.estimate_id ?? null;
    const conId = input.contract_id ?? null;
    const docType: ApprovalDocType = input.doc_type ?? (estId ? 'estimate' : conId ? 'contract' : 'none');
    const docId = input.doc_id ?? estId ?? conId ?? null;
    return run<ApprovalRequest>(() => supabase.from(T).insert({
      ref_type: input.ref_type, ref_id: input.ref_id, title: input.title.trim(),
      doc_type: docType, doc_id: docId, estimate_id: estId, contract_id: conId,
      owner_user_id: input.owner_user_id.trim(), customer_name: input.customer_name || null, amount: input.amount ?? null,
      status: 'sent', created_by: by,
    }).select().single() as any);
  },
  cancel: (id: number | string) => run<true>(async () => {
    const { error } = await supabase.from(T).update({ status: 'cancelled' }).eq('id', id);
    return { data: error ? null : (true as const), error };
  }),
  remove: (id: number | string) => run<true>(async () => {
    const { error } = await supabase.from(T).delete().eq('id', id);
    return { data: error ? null : (true as const), error };
  }),

  // ---- 사용자(마이페이지) ----
  listMine: () => run<ApprovalRequest[]>(() => supabase.from(T).select('*').order('created_at', { ascending: false }) as any),
  async respond(id: number | string, decision: 'approved' | 'rejected', memo?: string): Promise<Result<true>> {
    return run<true>(async () => {
      const { error } = await supabase.from(T).update({ status: decision, user_memo: memo || null, acted_at: new Date().toISOString() }).eq('id', id);
      return { data: error ? null : (true as const), error };
    });
  },
};
