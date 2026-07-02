-- 승인 요청에 견적서·계약서를 각각(동시) 첨부 — 발송 서류 다중화
-- 기존 doc_type/doc_id 는 하위호환 유지, 신규는 estimate_id/contract_id 사용
ALTER TABLE public.approval_requests ADD COLUMN IF NOT EXISTS estimate_id BIGINT;   -- 첨부 견적서(estimates.id)
ALTER TABLE public.approval_requests ADD COLUMN IF NOT EXISTS contract_id BIGINT;   -- 첨부 계약서(contracts.id)
