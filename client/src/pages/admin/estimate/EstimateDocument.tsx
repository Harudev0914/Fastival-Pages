import React from 'react';
import type { Estimate } from '../../../api/opsApi';
import type { CompanyInfo } from '../../../api/companyApi';

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;
const dash = (s?: string | null) => (s && String(s).trim() ? s : '________');

interface Props { est: Estimate; typeLabel: string; company?: CompanyInfo | null; }

// A4형 견적서(계약서 스타일) 문서 — 화면 프리뷰 + PDF 인쇄 공용
const EstimateDocument = React.forwardRef<HTMLDivElement, Props>(({ est, typeLabel, company }, ref) => {
  const compName = company?.biz_name || company?.site_name || '스페이스플래닝';
  const items = est.items && est.items.length ? est.items : [];

  const line: React.CSSProperties = { padding: '9px 10px', borderBottom: '1px solid #e5e7eb', fontSize: '0.86rem' };
  const hcell: React.CSSProperties = { padding: '10px', background: '#f1f5f9', fontWeight: 700, fontSize: '0.82rem', color: '#334155', borderBottom: '2px solid #94a3b8' };
  const sumRow = (label: string, val: string, strong?: boolean) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: strong ? '10px 2px 0' : '6px 2px', fontSize: strong ? '1.05rem' : '0.9rem', fontWeight: strong ? 800 : 500, color: strong ? '#008b8b' : '#334155', borderTop: strong ? '2px solid #008b8b' : 'none', marginTop: strong ? '6px' : 0 }}>
      <span>{label}</span><span>{val}</span>
    </div>
  );
  const party = (heading: string, lines: React.ReactNode) => (
    <div style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px 14px' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', marginBottom: '8px' }}>{heading}</div>
      <div style={{ fontSize: '0.86rem', lineHeight: 1.9, color: '#1e293b' }}>{lines}</div>
    </div>
  );

  return (
    <div ref={ref} id="estimate-paper" style={{
      background: '#fff', color: '#111', width: '100%', maxWidth: '780px', margin: '0 auto',
      padding: '52px 56px', boxSizing: 'border-box', fontFamily: '"Malgun Gothic","맑은 고딕",sans-serif',
    }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #008b8b', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '0.5em', margin: 0, color: '#008b8b' }}>견 적 서</h1>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '6px' }}>{typeLabel}</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.9 }}>
          <div>견적번호 <b style={{ color: '#1e293b' }}>{est.estimate_no || '(저장 시 자동 발번)'}</b></div>
          <div>발행일 <b style={{ color: '#1e293b' }}>{est.issue_date || (est.created_at || '').slice(0, 10) || '-'}</b></div>
          {est.valid_until && <div>유효기간 <b style={{ color: '#1e293b' }}>{est.valid_until}</b></div>}
        </div>
      </div>

      {/* 공급자 / 공급받는자 */}
      <div style={{ display: 'flex', gap: '16px', margin: '22px 0' }}>
        {party('SUPPLIER · 공급자', <>
          <div><b>{compName}</b></div>
          {company?.ceo_name && <div>대표: {company.ceo_name} <span style={{ color: '#94a3b8' }}>(인)</span></div>}
          {company?.biz_number && <div>사업자: {company.biz_number}</div>}
          {company?.phone && <div>TEL: {company.phone}</div>}
          {company?.address && <div style={{ fontSize: '0.8rem', color: '#475569' }}>{company.address}</div>}
        </>)}
        {party('CUSTOMER · 공급받는자', <>
          <div><b>{dash(est.customer_name)}</b> 귀하</div>
          {est.customer_phone && <div>TEL: {est.customer_phone}</div>}
          {est.customer_email && <div style={{ fontSize: '0.8rem' }}>{est.customer_email}</div>}
          <div style={{ marginTop: '6px', color: '#64748b' }}>건명: {dash(est.title)}</div>
        </>)}
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.92rem', color: '#334155', margin: '4px 0 16px' }}>
        아래와 같이 견적합니다. &nbsp;— &nbsp;합계금액 <b style={{ color: '#008b8b' }}>{won(est.total)}</b> (VAT 포함)
      </p>

      {/* 품목 */}
      <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '38px 1fr 90px 54px 60px 100px 110px' }}>
          <div style={{ ...hcell, textAlign: 'center' }}>No</div>
          <div style={{ ...hcell, textAlign: 'left' }}>품목</div>
          <div style={{ ...hcell, textAlign: 'left' }}>규격</div>
          <div style={{ ...hcell, textAlign: 'center' }}>단위</div>
          <div style={{ ...hcell, textAlign: 'center' }}>수량</div>
          <div style={{ ...hcell, textAlign: 'right' }}>단가</div>
          <div style={{ ...hcell, textAlign: 'right' }}>금액</div>
        </div>
        {items.length === 0 ? (
          <div style={{ padding: '26px', textAlign: 'center', color: '#94a3b8', fontSize: '0.86rem' }}>품목을 입력하세요</div>
        ) : items.map((it, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '38px 1fr 90px 54px 60px 100px 110px' }}>
            <div style={{ ...line, textAlign: 'center', color: '#94a3b8' }}>{i + 1}</div>
            <div style={{ ...line, textAlign: 'left', fontWeight: 600 }}>{dash(it.name)}</div>
            <div style={{ ...line, textAlign: 'left', color: '#64748b' }}>{it.spec || '-'}</div>
            <div style={{ ...line, textAlign: 'center', color: '#64748b' }}>{it.unit || '-'}</div>
            <div style={{ ...line, textAlign: 'center' }}>{Number(it.qty || 0).toLocaleString()}</div>
            <div style={{ ...line, textAlign: 'right' }}>{won(it.unit_price)}</div>
            <div style={{ ...line, textAlign: 'right', fontWeight: 700 }}>{won(it.amount)}</div>
          </div>
        ))}
      </div>

      {/* 합계 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
        <div style={{ width: '280px' }}>
          {sumRow('소계', won(est.subtotal))}
          {sumRow('할인', `- ${won(est.discount)}`)}
          {sumRow('부가세/기타', won(est.tax))}
          {sumRow('합계', won(est.total), true)}
        </div>
      </div>

      {/* 계약 조건 / 특약사항 */}
      {est.terms && est.terms.trim() && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b', marginBottom: '8px', borderLeft: '3px solid #008b8b', paddingLeft: '8px' }}>계약 조건 / 특약사항</div>
          <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.84rem', lineHeight: 1.8, color: '#334155', background: '#f8fafc', borderRadius: '8px', padding: '14px 16px' }}>{est.terms}</div>
        </div>
      )}

      {/* 비고 */}
      {est.memo && est.memo.trim() && (
        <div style={{ marginTop: '16px', fontSize: '0.82rem', color: '#64748b' }}>
          <b style={{ color: '#475569' }}>비고 </b>{est.memo}
        </div>
      )}

      {/* 서명 */}
      <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: '10px' }}>
        <div style={{ textAlign: 'center', fontSize: '0.88rem', color: '#334155' }}>
          <div style={{ marginBottom: '6px', color: '#64748b' }}>공급자</div>
          <div style={{ fontWeight: 800 }}>{compName}</div>
          <div style={{ marginTop: '2px' }}>(직인)</div>
        </div>
      </div>
    </div>
  );
});
EstimateDocument.displayName = 'EstimateDocument';
export default EstimateDocument;
