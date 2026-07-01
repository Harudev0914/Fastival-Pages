// 견적서 인쇄/PDF: 새 창에 A4 레이아웃 HTML을 렌더 후 window.print() 호출
import type { Estimate } from '../api/opsApi';
import type { CompanyInfo } from '../api/companyApi';

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

export function printEstimate(est: Estimate, typeLabel: string, company?: CompanyInfo | null): void {
  const rows = (est.items || []).map((it, i) => `
    <tr>
      <td class="c">${i + 1}</td>
      <td>${esc(it.name)}</td>
      <td>${esc(it.spec || '-')}</td>
      <td class="c">${esc(it.unit || '-')}</td>
      <td class="r">${Number(it.qty || 0).toLocaleString()}</td>
      <td class="r">${won(it.unit_price)}</td>
      <td class="r">${won(it.amount)}</td>
    </tr>`).join('');

  const compName = company?.biz_name || company?.site_name || '스페이스플래닝';
  const compRows = [
    company?.ceo_name && `대표: ${esc(company.ceo_name)}`,
    company?.biz_number && `사업자등록번호: ${esc(company.biz_number)}`,
    company?.phone && `TEL: ${esc(company.phone)}`,
    company?.fax && `FAX: ${esc(company.fax)}`,
    company?.address && `주소: ${esc(company.address)}`,
  ].filter(Boolean).map((l) => `<div>${l}</div>`).join('');

  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>견적서 ${esc(est.estimate_no || '')}</title>
  <style>
    * { box-sizing: border-box; font-family: 'Malgun Gothic','맑은 고딕',sans-serif; }
    body { margin: 0; padding: 40px; color: #1e293b; }
    .wrap { max-width: 800px; margin: 0 auto; }
    .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #008b8b; padding-bottom: 18px; }
    h1 { font-size: 30px; letter-spacing: 12px; margin: 0; color: #008b8b; }
    .meta { text-align: right; font-size: 12px; color: #64748b; line-height: 1.7; }
    .meta b { color: #1e293b; }
    .parties { display: flex; gap: 24px; margin: 24px 0; font-size: 13px; }
    .party { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; line-height: 1.8; }
    .party h2 { font-size: 12px; color: #94a3b8; margin: 0 0 8px; font-weight: 700; letter-spacing: 1px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 6px; }
    th { background: #f1f5f9; color: #475569; font-weight: 700; padding: 10px; border-bottom: 2px solid #cbd5e1; }
    td { padding: 10px; border-bottom: 1px solid #eef2f6; }
    td.c { text-align: center; } td.r { text-align: right; }
    .totals { margin-top: 16px; margin-left: auto; width: 300px; font-size: 13px; }
    .totals div { display: flex; justify-content: space-between; padding: 6px 2px; }
    .totals .grand { border-top: 2px solid #008b8b; margin-top: 6px; padding-top: 10px; font-size: 17px; font-weight: 800; color: #008b8b; }
    .memo { margin-top: 12px; font-size: 12px; color: #475569; white-space: pre-wrap; background: #f8fafc; border-radius: 8px; padding: 14px; }
    .terms { margin-top: 24px; } .terms-h { font-weight: 800; font-size: 13px; color: #1e293b; border-left: 3px solid #008b8b; padding-left: 8px; margin-bottom: 6px; }
    .foot { margin-top: 30px; text-align: center; font-size: 22px; font-weight: 800; letter-spacing: 4px; color: #1e293b; }
    @media print { body { padding: 0; } @page { margin: 16mm; } }
  </style></head><body><div class="wrap">
    <div class="head">
      <div><h1>견 적 서</h1><div style="font-size:13px;color:#64748b;margin-top:8px">${esc(typeLabel)}</div></div>
      <div class="meta">
        <div>견적번호 <b>${esc(est.estimate_no || '-')}</b></div>
        <div>발행일 <b>${esc(est.issue_date || (est.created_at || '').slice(0, 10))}</b></div>
        ${est.valid_until ? `<div>유효기간 <b>${esc(est.valid_until)}</b></div>` : ''}
      </div>
    </div>
    <div class="parties">
      <div class="party"><h2>SUPPLIER · 공급자</h2><div><b>${esc(compName)}</b></div>${compRows}</div>
      <div class="party"><h2>CUSTOMER · 수신</h2>
        <div><b>${esc(est.customer_name || '-')}</b> 귀하</div>
        ${est.customer_phone ? `<div>TEL: ${esc(est.customer_phone)}</div>` : ''}
        ${est.customer_email ? `<div>${esc(est.customer_email)}</div>` : ''}
        <div style="margin-top:8px;color:#64748b">${esc(est.title)}</div>
      </div>
    </div>
    <table>
      <thead><tr><th style="width:40px">No</th><th style="text-align:left">품목</th><th style="width:80px">규격</th><th style="width:50px">단위</th><th style="width:60px">수량</th><th style="width:110px">단가</th><th style="width:120px">금액</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="7" class="c" style="color:#94a3b8;padding:24px">품목이 없습니다</td></tr>'}</tbody>
    </table>
    <div class="totals">
      <div><span>소계</span><span>${won(est.subtotal)}</span></div>
      <div><span>할인</span><span>- ${won(est.discount)}</span></div>
      <div><span>부가세/기타</span><span>${won(est.tax)}</span></div>
      <div class="grand"><span>합계</span><span>${won(est.total)}</span></div>
    </div>
    ${est.terms ? `<div class="terms"><div class="terms-h">계약 조건 / 특약사항</div><div class="memo">${esc(est.terms)}</div></div>` : ''}
    ${est.memo ? `<div class="memo"><b>비고 </b>${esc(est.memo)}</div>` : ''}
    <div class="foot">${esc(compName)} <span style="font-size:13px;font-weight:400;color:#64748b">(직인)</span></div>
  </div>
  <script>window.onload=function(){window.print();}</script>
  </body></html>`;

  const w = window.open('', '_blank', 'width=900,height=1000');
  if (!w) return; // 팝업 차단 시
  w.document.open();
  w.document.write(html);
  w.document.close();
}
