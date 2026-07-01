import React, { useCallback, useEffect, useState } from 'react';
import { Send, X, CheckCircle2, RotateCcw, Search, UserCheck, UserX, FileText } from 'lucide-react';
import { approvalApi, APPROVAL_STATUS_LABEL, APPROVAL_STATUS_COLOR, type ApprovalRefType, type ApprovalRequest, type MatchedUser } from '../../api/approvalApi';
import { estimateApi, ESTIMATE_TYPE_LABEL, type Estimate } from '../../api/opsApi';
import { contractApi, type Contract } from '../../api/contractApi';
import { TEMPLATES } from '../../pages/admin/contract/contractTemplates';
import { card, inputStyle, labelStyle, btnPrimary, btnGhost, fmtDate, useAdminModal, StatusPill } from './shared';

interface Props {
  refType: ApprovalRefType;
  refId: number;
  defaultTitle: string;
  defaultEmail?: string | null;      // 신청자 이메일 → 가입 계정 자동 매칭
  defaultAmount?: number | null;
  defaultCustomer?: string | null;
  onFinalize?: () => void | Promise<void>;   // 사용자 승인 후 관리자 최종 처리
  finalizeLabel?: string;
}

const sel: React.CSSProperties = { ...inputStyle, cursor: 'pointer' };

const ApprovalPanel: React.FC<Props> = ({ refType, refId, defaultTitle, defaultEmail, defaultAmount, defaultCustomer, onFinalize, finalizeLabel = '최종 승인 처리' }) => {
  const [req, setReq] = useState<ApprovalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState(defaultTitle);
  const [email, setEmail] = useState(defaultEmail || '');
  const [matched, setMatched] = useState<MatchedUser | null>(null);
  const [looked, setLooked] = useState(false);       // 조회 시도 여부
  const [looking, setLooking] = useState(false);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [estimateId, setEstimateId] = useState('');   // 첨부 견적서
  const [contractId, setContractId] = useState('');   // 첨부 계약서
  const [amount, setAmount] = useState(defaultAmount != null ? String(defaultAmount) : '');
  const [busy, setBusy] = useState(false);
  const { element: modal, alert, confirm } = useAdminModal();

  const load = useCallback(async () => {
    const { data } = await approvalApi.getByRef(refType, refId);
    setReq(data || null);
    setLoading(false);
  }, [refType, refId]);
  useEffect(() => { load(); }, [load]);

  // 폼 열릴 때 발송 가능한 기존 견적서·계약서 목록 로드
  useEffect(() => {
    if (!showForm || estimates.length || contracts.length) return;
    estimateApi.listAll().then(({ data }) => setEstimates(data || []));
    contractApi.list().then(({ data }) => setContracts(data || []));
  }, [showForm, estimates.length, contracts.length]);

  // 견적서 선택 시 금액을 해당 견적서 총액으로 자동 반영
  const pickEstimate = (id: string) => {
    setEstimateId(id);
    const est = estimates.find((e) => String(e.id) === id);
    if (est) setAmount(String(est.total || 0));
  };

  const resolve = useCallback(async () => {
    if (!email.trim()) { setMatched(null); setLooked(true); return null; }
    setLooking(true);
    const m = await approvalApi.findUserByEmail(email);
    setLooking(false); setMatched(m); setLooked(true);
    return m;
  }, [email]);

  // 폼 열릴 때 기본 이메일 자동 조회
  useEffect(() => { if (showForm && email.trim() && !looked) resolve(); }, [showForm, email, looked, resolve]);

  const active = req && req.status !== 'cancelled' && req.status !== 'rejected' ? req : null;

  const send = async () => {
    let owner = matched;
    if (!owner) owner = await resolve();
    if (!owner) return alert('가입 계정 없음', '해당 이메일로 가입된 회원 계정을 찾을 수 없습니다. 신청자에게 회원가입을 안내하거나 이메일을 확인해주세요.');
    setBusy(true);
    const amt = amount ? Number(amount) : null;
    // 입력 금액을 첨부 계약서 문서에 그대로 기입
    if (contractId && amt != null) await contractApi.patchAmount(Number(contractId), amt);
    const { error } = await approvalApi.create({
      ref_type: refType, ref_id: refId, title, owner_user_id: owner.id,
      estimate_id: estimateId ? Number(estimateId) : null,
      contract_id: contractId ? Number(contractId) : null,
      customer_name: defaultCustomer || owner.name || null, amount: amt,
    });
    setBusy(false);
    if (error) return alert('발송 오류', error);
    setShowForm(false); load();
  };
  const cancel = () => confirm('요청 취소', '이 승인 요청을 취소하시겠습니까?', async () => {
    const { error } = await approvalApi.cancel(req!.id);
    if (error) alert('오류', error); else load();
  });
  const finalize = async () => { if (!onFinalize) return; setBusy(true); await onFinalize(); setBusy(false); };

  const wrap: React.CSSProperties = { ...card, marginBottom: '16px', borderLeft: '3px solid #008b8b' };
  const head = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
      <Send size={16} color="#008b8b" />
      <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>승인 요청 / 서류 발송</h3>
      {active && <div style={{ marginLeft: 'auto' }}><StatusPill label={APPROVAL_STATUS_LABEL[active.status]} color={APPROVAL_STATUS_COLOR[active.status]} /></div>}
    </div>
  );

  if (loading) return null;

  // 진행 중(발송/승인) 요청 표시
  if (active) {
    return (
      <div style={wrap}>
        {head}
        <div style={{ fontSize: '0.86rem', color: '#475569', display: 'grid', gap: '6px' }}>
          <div><b>제목</b> · {active.title}</div>
          <div><b>발송 서류</b> · {[active.estimate_id ? `견적서 #${active.estimate_id}` : null, active.contract_id ? `계약서 #${active.contract_id}` : null].filter(Boolean).join(' · ') || '서류 없음(승인만)'}</div>
          {active.amount != null && <div><b>금액</b> · ₩{Number(active.amount).toLocaleString()}</div>}
          <div><b>승인 대상</b> · {active.customer_name || '-'} <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>({active.owner_user_id.slice(0, 8)}…)</span></div>
          <div><b>발송일</b> · {fmtDate(active.created_at)}</div>
          {active.status === 'approved' && (
            <div style={{ marginTop: '6px', padding: '10px 12px', background: '#ecfdf5', borderRadius: '9px', color: '#065f46' }}>
              <CheckCircle2 size={14} style={{ verticalAlign: '-2px' }} /> 사용자가 <b>{fmtDate(active.acted_at)}</b>에 승인했습니다.{active.user_memo ? ` — “${active.user_memo}”` : ''}
            </div>
          )}
          {active.status === 'sent' && <div style={{ color: '#d97706', fontSize: '0.82rem' }}>사용자의 마이페이지 승인을 기다리는 중입니다.</div>}
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '14px', flexWrap: 'wrap' }}>
          <button style={btnGhost} onClick={cancel}><X size={15} /> 요청 취소</button>
          {onFinalize && (
            <button style={{ ...btnPrimary, opacity: active.status === 'approved' ? 1 : 0.5, cursor: active.status === 'approved' ? 'pointer' : 'not-allowed' }}
              disabled={active.status !== 'approved' || busy}
              title={active.status === 'approved' ? '' : '사용자 승인 후 처리할 수 있습니다'}
              onClick={finalize}>
              <CheckCircle2 size={16} /> {finalizeLabel}
            </button>
          )}
        </div>
        {modal}
      </div>
    );
  }

  // 요청 없음/취소/반려 → 발송 폼
  return (
    <div style={wrap}>
      {head}
      {req && req.status === 'rejected' && (
        <div style={{ marginBottom: '12px', padding: '10px 12px', background: '#fef2f2', borderRadius: '9px', color: '#991b1b', fontSize: '0.84rem' }}>
          사용자가 반려했습니다{req.user_memo ? ` — “${req.user_memo}”` : ''}. 내용을 수정하여 다시 발송할 수 있습니다.
        </div>
      )}
      {!showForm ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>계약서/견적서를 발송하고 사용자 승인을 요청하세요. 승인 전까지 다음 단계로 진행되지 않습니다.</span>
          <button style={btnPrimary} onClick={() => setShowForm(true)}>{req?.status === 'rejected' ? <><RotateCcw size={16} /> 재발송</> : <><Send size={16} /> 승인 요청 발송</>}</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          <div><label style={labelStyle}>제목</label><input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} /></div>

          {/* 신청자 이메일 → 가입 계정 자동 매칭 */}
          <div>
            <label style={labelStyle}>승인 대상 (신청자 이메일) *</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input style={{ ...inputStyle, flex: 1 }} value={email} onChange={(e) => { setEmail(e.target.value); setMatched(null); setLooked(false); }} placeholder="신청자 이메일 (가입 계정 자동 조회)" />
              <button style={{ ...btnGhost, whiteSpace: 'nowrap' }} onClick={resolve} disabled={looking}><Search size={15} /> {looking ? '조회중' : '계정 확인'}</button>
            </div>
            {looked && (matched
              ? <div style={{ marginTop: '7px', fontSize: '0.82rem', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><UserCheck size={15} /> 계정 확인됨 · {matched.name || matched.email}</div>
              : <div style={{ marginTop: '7px', fontSize: '0.82rem', color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><UserX size={15} /> 가입 계정을 찾을 수 없습니다 (회원가입 필요)</div>
            )}
          </div>

          {/* 발송 서류 — 견적서·계약서 각각 기존 문서에서 선택(둘 다 첨부 가능) */}
          <div style={{ display: 'grid', gap: '10px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={14} color="#008b8b" /> 발송 서류 (견적서·계약서 각각 첨부 가능)</div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <label style={labelStyle}>견적서 발송 (견적서 관리에서 생성된 문서)</label>
                <select style={{ ...sel, width: '100%' }} value={estimateId} onChange={(e) => pickEstimate(e.target.value)}>
                  <option value="">첨부 안 함</option>
                  {estimates.map((e) => (
                    <option key={e.id} value={e.id}>[{ESTIMATE_TYPE_LABEL[e.type]}] {e.estimate_no ? `${e.estimate_no} · ` : ''}{e.title} (₩{Number(e.total || 0).toLocaleString()})</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <label style={labelStyle}>계약서 발송 (계약서 관리에서 생성된 문서)</label>
                <select style={{ ...sel, width: '100%' }} value={contractId} onChange={(e) => setContractId(e.target.value)}>
                  <option value="">첨부 안 함</option>
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>[{TEMPLATES[c.template]?.label || c.template}] {c.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ maxWidth: '260px' }}>
              <label style={labelStyle}>금액(원) · 견적서 선택 시 자동 반영 / 계약서에 기입</label>
              <input type="number" style={inputStyle} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="예: 1500000" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button style={btnGhost} onClick={() => setShowForm(false)}>취소</button>
            <button style={btnPrimary} onClick={send} disabled={busy}><Send size={16} /> {busy ? '발송 중...' : '발송'}</button>
          </div>
        </div>
      )}
      {modal}
    </div>
  );
};

export default ApprovalPanel;
