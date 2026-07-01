import React from 'react';
import { TEMPLATES } from './contractTemplates';
import type { ContractTemplate } from '../../../api/contractApi';

const v = (d: Record<string, string>, k: string, fb = '________') => (d[k]?.toString().trim() ? d[k] : fb);

// YYYY-MM-DD → YYYY년 M월 D일 (미입력 시 서명용 공란)
const krDate = (s?: string): string => {
  if (!s || !s.trim()) return '20      년       월       일';
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return s;
  return `${m[1]}년 ${Number(m[2])}월 ${Number(m[3])}일`;
};

// A4형 표준계약서 문서 (프리뷰 + PDF 인쇄 대상)
const ContractDocument = React.forwardRef<HTMLDivElement, { template: ContractTemplate; title: string; data: Record<string, string> }>(
  ({ template, title, data }, ref) => {
    const t = TEMPLATES[template];
    const clauses = t.clauses(data);
    const aName = v(data, 'a_name', t.partyA);
    const bName = v(data, 'b_name', t.partyB);

    const partyBlock = (label: string, p: 'a' | 'b') => (
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, marginBottom: '10px', fontSize: '0.95rem' }}>{label}</div>
        <table style={{ width: '100%', fontSize: '0.9rem', lineHeight: 1.9, borderCollapse: 'collapse' }}>
          <tbody>
            <tr><td style={{ width: '78px', color: '#333', verticalAlign: 'top' }}>상 호</td><td>{v(data, `${p}_name`)}</td></tr>
            <tr><td style={{ color: '#333', verticalAlign: 'top' }}>주 소</td><td>{v(data, `${p}_addr`)}</td></tr>
            <tr><td style={{ color: '#333', verticalAlign: 'top' }}>등록번호</td><td>{v(data, `${p}_reg`)}</td></tr>
            <tr><td style={{ color: '#333', verticalAlign: 'top' }}>연락처</td><td>{v(data, `${p}_contact`)}</td></tr>
            <tr><td style={{ color: '#333', verticalAlign: 'top' }}>대표자</td><td>{v(data, `${p}_rep`)} <span style={{ letterSpacing: '0.05em' }}>(서명 또는 인)</span></td></tr>
          </tbody>
        </table>
      </div>
    );

    return (
      <div ref={ref} id="contract-paper" style={{
        background: '#fff', color: '#111', width: '100%', maxWidth: '820px', margin: '0 auto',
        padding: '60px 64px', boxSizing: 'border-box',
        fontFamily: '"Batang", "바탕", "Times New Roman", serif', lineHeight: 1.95, fontSize: '0.96rem',
      }}>
        <h1 style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '0.35em', margin: '0 0 8px', paddingLeft: '0.35em' }}>{title || t.label}</h1>
        <div style={{ borderBottom: '2px solid #111', margin: '14px 0 26px' }} />

        {/* 전문 */}
        <p style={{ marginBottom: '26px', textAlign: 'justify' }}>
          <b>{aName}</b>(이하 “갑”이라 한다)과(와) <b>{bName}</b>(이하 “을”이라 한다)은 상호 신의와 성실의 원칙에 따라 다음과 같이 <b>{t.label}</b>(이하 “본 계약”이라 한다)을 체결한다.
        </p>

        {/* 조항 (제N조 자동 번호) */}
        {clauses.map((c, i) => (
          <div key={i} style={{ marginBottom: '15px' }}>
            <div style={{ fontWeight: 700, marginBottom: '2px' }}>제{i + 1}조 ({c.title})</div>
            <div style={{ whiteSpace: 'pre-wrap', textAlign: 'justify', paddingLeft: '2px' }}>{c.text}</div>
          </div>
        ))}

        {/* 후문 */}
        <p style={{ margin: '30px 0 6px', textAlign: 'justify' }}>
          본 계약의 성립을 증명하기 위하여 본 계약서 2부를 작성하고, 갑과 을이 각각 기명·날인(또는 서명)한 후 각 1부씩 보관한다.
        </p>

        {/* 계약일 */}
        <p style={{ textAlign: 'center', margin: '30px 0 34px', letterSpacing: '0.12em', fontSize: '1.02rem' }}>
          {krDate(data.contract_date)}
        </p>

        {/* 서명란 */}
        <div style={{ display: 'flex', gap: '48px', marginTop: '10px' }}>
          {partyBlock('“갑”', 'a')}
          {partyBlock('“을”', 'b')}
        </div>
      </div>
    );
  }
);
ContractDocument.displayName = 'ContractDocument';
export default ContractDocument;
