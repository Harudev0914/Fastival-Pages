import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { approvalApi, REF_TYPE_LABEL, DOC_TYPE_LABEL, APPROVAL_STATUS_LABEL, APPROVAL_STATUS_COLOR, type ApprovalRequest } from '../../api/approvalApi';
import { shipmentApi, SHIPMENT_STATUS_LABEL, SHIPMENT_STATUS_COLOR, type RentalShipment } from '../../api/rentalApi';
import { estimateApi, ESTIMATE_TYPE_LABEL } from '../../api/opsApi';
import { companyApi } from '../../api/companyApi';
import { contractApi } from '../../api/contractApi';
import EstimateDocument from '../admin/estimate/EstimateDocument';
import ContractDocument from '../admin/contract/ContractDocument';
import { supabase } from '../../supabaseClient';

const won = (n?: number | null) => (n == null ? '' : `₩${Number(n).toLocaleString()}`);
const fdate = (s?: string | null) => {
  if (!s) return '-';
  const d = new Date(s); if (isNaN(d.getTime())) return '-';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
};

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<'loading' | 'in' | 'out'>('loading');
  const [reqs, setReqs] = useState<ApprovalRequest[]>([]);
  const [ships, setShips] = useState<RentalShipment[]>([]);
  const [openMemo, setOpenMemo] = useState<number | null>(null);
  const [memo, setMemo] = useState('');
  const [busy, setBusy] = useState(false);
  const [docView, setDocView] = useState<React.ReactNode | null>(null);
  const [docLoading, setDocLoading] = useState(false);

  const load = useCallback(async () => {
    const [{ data: r }, { data: s }] = await Promise.all([approvalApi.listMine(), shipmentApi.listMine()]);
    setReqs(r || []); setShips(s || []);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setAuthState('out'); return; }
      setAuthState('in');
      await load();
    })();
  }, [load]);

  const respond = async (id: number, decision: 'approved' | 'rejected') => {
    setBusy(true);
    const { error } = await approvalApi.respond(id, decision, memo);
    setBusy(false);
    if (error) { alert(error); return; }
    setOpenMemo(null); setMemo(''); load();
  };

  // 발송된 견적서/계약서 열람
  const openDoc = async (r: ApprovalRequest) => {
    if (r.doc_type === 'none' || !r.doc_id) return;
    setDocLoading(true);
    try {
      if (r.doc_type === 'estimate') {
        const [{ data: est }, { data: company }] = await Promise.all([estimateApi.get(r.doc_id), companyApi.get()]);
        if (est) setDocView(<EstimateDocument est={est} typeLabel={ESTIMATE_TYPE_LABEL[est.type]} company={company} />);
        else alert('서류를 불러올 수 없습니다.');
      } else if (r.doc_type === 'contract') {
        const { data: c } = await contractApi.get(r.doc_id);
        if (c) setDocView(<ContractDocument template={c.template} title={c.title} data={c.data} />);
        else alert('서류를 불러올 수 없습니다.');
      }
    } finally { setDocLoading(false); }
  };
  const hasDoc = (r: ApprovalRequest) => r.doc_type !== 'none' && !!r.doc_id;

  if (authState === 'loading') return <div style={{ padding: '80px 20px', textAlign: 'center', color: '#94a3b8' }}>불러오는 중…</div>;
  if (authState === 'out') {
    return (
      <div style={{ maxWidth: '520px', margin: '80px auto', textAlign: 'center', padding: '0 20px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>로그인이 필요합니다</h2>
        <p style={{ color: '#64748b', marginTop: '10px' }}>마이페이지는 로그인 후 이용할 수 있습니다.</p>
        <button onClick={() => navigate('/login')} style={{ marginTop: '18px', padding: '12px 26px', background: '#008b8b', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>로그인하러 가기</button>
      </div>
    );
  }

  const pending = reqs.filter((r) => r.status === 'sent');
  const others = reqs.filter((r) => r.status !== 'sent');
  const card: React.CSSProperties = { background: '#fff', border: '1px solid #eef2f6', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(16,24,40,0.04)' };
  const pill = (label: string, color: string) => <span style={{ background: `${color}16`, color, fontSize: '0.76rem', fontWeight: 700, padding: '4px 11px', borderRadius: '999px', border: `1px solid ${color}33` }}>{label}</span>;

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 20px 80px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>마이페이지</h1>
      <p style={{ color: '#94a3b8', margin: '0 0 26px', fontSize: '0.9rem' }}>발송된 계약서·견적서를 확인하고 승인하시면 다음 단계가 진행됩니다.</p>

      {/* 승인 대기 */}
      <section style={{ marginBottom: '34px' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>승인 대기 <span style={{ color: '#dc2626' }}>{pending.length}</span></h2>
        {pending.length === 0 ? (
          <div style={{ ...card, color: '#94a3b8', fontSize: '0.9rem' }}>승인 대기 중인 서류가 없습니다.</div>
        ) : (
          <div style={{ display: 'grid', gap: '14px' }}>
            {pending.map((r) => (
              <div key={r.id} style={{ ...card, borderLeft: '3px solid #d97706' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {pill(REF_TYPE_LABEL[r.ref_type], '#0891b2')}
                  {r.doc_type !== 'none' && pill(DOC_TYPE_LABEL[r.doc_type] + (r.doc_id ? ` #${r.doc_id}` : ''), '#7c3aed')}
                  <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#94a3b8' }}>{fdate(r.created_at)} 발송</span>
                </div>
                <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#1e293b' }}>{r.title}</div>
                {r.amount != null && <div style={{ marginTop: '6px', color: '#008b8b', fontWeight: 800 }}>{won(r.amount)}</div>}
                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '10px 0 0' }}>내용을 확인하신 후 승인 또는 반려해 주세요.</p>
                {hasDoc(r) && <button onClick={() => openDoc(r)} disabled={docLoading} style={{ marginTop: '10px', padding: '9px 16px', background: '#eef2f7', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '9px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>📄 {DOC_TYPE_LABEL[r.doc_type]} 보기</button>}

                {openMemo === r.id ? (
                  <div style={{ marginTop: '12px' }}>
                    <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="메모(선택) — 반려 시 사유를 남겨주세요" style={{ width: '100%', minHeight: '64px', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                      <button disabled={busy} onClick={() => respond(r.id, 'rejected')} style={{ padding: '10px 18px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '9px', fontWeight: 700, cursor: 'pointer' }}>반려</button>
                      <button disabled={busy} onClick={() => respond(r.id, 'approved')} style={{ padding: '10px 20px', background: '#008b8b', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: 700, cursor: 'pointer' }}>승인하기</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '14px' }}>
                    <button onClick={() => { setOpenMemo(r.id); setMemo(''); }} style={{ padding: '10px 20px', background: '#008b8b', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: 700, cursor: 'pointer' }}>승인 / 반려</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 처리 완료 이력 */}
      {others.length > 0 && (
        <section style={{ marginBottom: '34px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>승인 이력</h2>
          <div style={{ display: 'grid', gap: '10px' }}>
            {others.map((r) => (
              <div key={r.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#334155', fontSize: '0.92rem' }}>{r.title}</div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>{REF_TYPE_LABEL[r.ref_type]} · {r.acted_at ? `${fdate(r.acted_at)} 처리` : fdate(r.created_at)}{r.user_memo ? ` · ${r.user_memo}` : ''}</div>
                </div>
                {pill(APPROVAL_STATUS_LABEL[r.status], APPROVAL_STATUS_COLOR[r.status])}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 렌탈 출고 현황 */}
      {ships.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>내 렌탈 출고 현황</h2>
          <div style={{ display: 'grid', gap: '10px' }}>
            {ships.map((s) => (
              <div key={s.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#334155', fontSize: '0.92rem' }}>{s.product_name}{s.brand_name ? ` · ${s.brand_name}` : ''} <span style={{ color: '#94a3b8', fontWeight: 400 }}>x{s.quantity}</span></div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>{s.ship_date ? `출고 ${fdate(s.ship_date)}` : '출고 준비'}{s.tracking_no ? ` · 송장 ${s.tracking_no}` : ''}</div>
                </div>
                {pill(SHIPMENT_STATUS_LABEL[s.status], SHIPMENT_STATUS_COLOR[s.status])}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 서류 뷰어 모달 */}
      {docView && (
        <div onClick={() => setDocView(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 1000, display: 'flex', flexDirection: 'column', padding: '24px 16px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '860px', width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
            <button onClick={() => setDocView(null)} style={{ padding: '9px 18px', background: '#fff', color: '#334155', border: 'none', borderRadius: '9px', fontWeight: 700, cursor: 'pointer' }}>닫기 ✕</button>
          </div>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '860px', width: '100%', margin: '0 auto', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
            {docView}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;
