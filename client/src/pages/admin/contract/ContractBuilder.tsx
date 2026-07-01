import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Download } from 'lucide-react';
import { contractApi, CONTRACT_STATUS_LABEL, type ContractStatus, type ContractTemplate } from '../../../api/contractApi';
import { TEMPLATES } from './contractTemplates';
import ContractDocument from './ContractDocument';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import { inputStyle, labelStyle, btnPrimary, btnGhost, useAdminModal, Spinner } from '../../../components/admin/shared';

const LIST = '/admin/dashboard/contracts';
const sel = SELECT_STYLE as React.CSSProperties;

const ContractBuilder: React.FC = () => {
  const { template: tParam, id } = useParams<{ template?: string; id?: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  const [template, setTemplate] = useState<ContractTemplate>((tParam as ContractTemplate) || 'freelancer');
  const [title, setTitle] = useState('');
  const [data, setData] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<ContractStatus>('draft');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const paperRef = useRef<HTMLDivElement>(null);
  const { element: modal, alert } = useAdminModal();

  const def = TEMPLATES[template];

  useEffect(() => {
    if (isNew) {
      const d = TEMPLATES[(tParam as ContractTemplate) || 'freelancer'];
      setTitle(d.label);
      setData({ ...(d.defaults || {}) });
      return;
    }
    (async () => {
      const { data: c, error } = await contractApi.get(id!);
      if (error) alert('불러오기 오류', error);
      if (c) { setTemplate(c.template); setTitle(c.title); setData(c.data || {}); setStatus(c.status); }
      setLoading(false);
    })();
  }, [id, isNew, tParam, alert]);

  const setField = (k: string, val: string) => setData((p) => ({ ...p, [k]: val }));

  const save = async () => {
    setSaving(true);
    const input = { template, title, customer_name: data.b_name || data.a_name || null, data, status };
    const { error } = isNew ? await contractApi.create(input) : await contractApi.update(id!, input);
    setSaving(false);
    if (error) alert('저장 오류', error); else alert('저장 완료', '저장되었습니다.', () => navigate(LIST));
  };

  const downloadPdf = () => {
    const node = paperRef.current;
    if (!node) return;
    const w = window.open('', '_blank', 'width=900,height=1200');
    if (!w) { alert('팝업 차단', '브라우저 팝업 차단을 해제한 후 다시 시도해주세요.'); return; }
    w.document.write(`<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>${title || def.label}</title>
      <style>
        @page { size: A4; margin: 16mm; }
        body { margin: 0; }
        #contract-paper { max-width: none !important; padding: 0 !important; box-shadow: none !important; }
      </style></head><body>${node.outerHTML}
      <scr${''}ipt>window.onload=function(){setTimeout(function(){window.print();},250);};</scr${''}ipt>
      </body></html>`);
    w.document.close();
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <button style={btnGhost} onClick={() => navigate(LIST)}><ArrowLeft size={16} /> 목록으로</button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={btnGhost} onClick={downloadPdf}><Download size={16} /> PDF 다운로드</button>
          <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '20px', alignItems: 'start' }}>
        {/* 좌: 입력 폼 */}
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>양식</label>
              <div style={{ fontWeight: 800, color: '#008b8b' }}>{def.label}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{def.desc}</div>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>문서 제목</label>
              <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>상태</label>
              <select style={{ ...sel, width: '100%' }} value={status} onChange={(e) => setStatus(e.target.value as ContractStatus)}>
                {(Object.keys(CONTRACT_STATUS_LABEL) as ContractStatus[]).map((k) => <option key={k} value={k}>{CONTRACT_STATUS_LABEL[k]}</option>)}
              </select>
            </div>
          </div>

          {def.groups.map((grp) => (
            <div key={grp.title} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>{grp.title}</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {grp.fields.map((f) => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label}</label>
                    {f.type === 'textarea'
                      ? <textarea style={{ ...inputStyle, minHeight: '76px', resize: 'vertical' }} value={data[f.key] || ''} onChange={(e) => setField(f.key, e.target.value)} placeholder={f.placeholder} />
                      : <input type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'} style={inputStyle} value={data[f.key] || ''} onChange={(e) => setField(f.key, e.target.value)} placeholder={f.placeholder} />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 우: 워드형 문서 프리뷰 */}
        <div style={{ background: '#eef2f7', borderRadius: '12px', padding: '24px', overflowX: 'auto', minHeight: '600px' }}>
          <div style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
            <ContractDocument ref={paperRef} template={template} title={title} data={data} />
          </div>
        </div>
      </div>
      {modal}
    </div>
  );
};

export default ContractBuilder;
