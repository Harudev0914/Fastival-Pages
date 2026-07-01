import React from 'react';
import { TEMPLATES } from './contractTemplates';
import type { ContractTemplate } from '../../../api/contractApi';

const v = (d: Record<string, string>, k: string, fb = '________') => (d[k]?.toString().trim() ? d[k] : fb);

// A4형 계약서 문서 (프리뷰 + PDF 인쇄 대상)
const ContractDocument = React.forwardRef<HTMLDivElement, { template: ContractTemplate; title: string; data: Record<string, string> }>(
  ({ template, title, data }, ref) => {
    const t = TEMPLATES[template];
    const clauses = t.clauses(data);
    const partyBlock = (label: string, p: 'a' | 'b') => (
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, marginBottom: '6px' }}>{label}</div>
        <div style={{ fontSize: '0.9rem', lineHeight: 2 }}>
          <div>상호/성명: {v(data, `${p}_name`)}</div>
          <div>대표자: {v(data, `${p}_rep`)} (인)</div>
          <div>등록번호: {v(data, `${p}_reg`)}</div>
          <div>연락처: {v(data, `${p}_contact`)}</div>
          <div>주소: {v(data, `${p}_addr`)}</div>
        </div>
      </div>
    );

    return (
      <div ref={ref} id="contract-paper" style={{
        background: '#fff', color: '#111', width: '100%', maxWidth: '780px', margin: '0 auto',
        padding: '56px 60px', boxSizing: 'border-box',
        fontFamily: '"Batang", "바탕", serif', lineHeight: 1.9, fontSize: '0.98rem',
      }}>
        <h1 style={{ textAlign: 'center', fontSize: '1.7rem', fontWeight: 800, letterSpacing: '0.3em', marginBottom: '36px' }}>{title || t.label}</h1>

        <p style={{ marginBottom: '22px' }}>
          <b>{v(data, 'a_name', t.partyA)}</b>(이하 “갑”)과(와) <b>{v(data, 'b_name', t.partyB)}</b>(이하 “을”)은
          아래와 같이 <b>{t.label}</b>을(를) 체결한다.
        </p>

        {clauses.map((c, i) => (
          <div key={i} style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 700 }}>{c.title}</div>
            <div style={{ whiteSpace: 'pre-wrap', paddingLeft: '4px' }}>{c.text}</div>
          </div>
        ))}

        <p style={{ textAlign: 'center', margin: '40px 0 30px', letterSpacing: '0.1em' }}>
          계약일: {v(data, 'contract_date', '20__년 __월 __일')}
        </p>

        <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
          {partyBlock(`갑 · ${t.partyA}`, 'a')}
          {partyBlock(`을 · ${t.partyB}`, 'b')}
        </div>
      </div>
    );
  }
);
ContractDocument.displayName = 'ContractDocument';
export default ContractDocument;
