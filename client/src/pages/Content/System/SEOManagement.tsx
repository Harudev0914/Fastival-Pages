import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const SEOManagement: React.FC = () => {
  const [config, setConfig] = useState({ tabTitle: '', mainTitle: '', script: '', pages: [{ path: '/', title: '메인 페이지', keywords: '' }] });

  const inputStyle = { padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' as const, backgroundColor: '#f8fafc' };
  const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: 600, color: '#475569', fontSize: '0.9rem' };

  return (
    <div style={{ padding: '0 20px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card" style={{ padding: '24px', backgroundColor: 'white', border: '1px solid rgb(226, 232, 240)', borderRadius: '16px', boxShadow: 'rgba(0, 0, 0, 0.02) 0px 4px 12px' }}>
        <h2 style={{ fontSize: '1.1rem', color: '#1e293b', margin: '0 0 20px 0' }}>웹사이트 기본 설정</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
                <label style={labelStyle}>브라우저 탭 제목</label>
                <input style={inputStyle} value={config.tabTitle} onChange={e => setConfig({...config, tabTitle: e.target.value})} placeholder="브라우저 상단에 표시될 제목" />
            </div>
            <div>
                <label style={labelStyle}>웹사이트 기본 제목</label>
                <input style={inputStyle} value={config.mainTitle} onChange={e => setConfig({...config, mainTitle: e.target.value})} placeholder="웹사이트 메인 제목" />
            </div>
        </div>
      </div>

      <div className="card" style={{ padding: '24px', backgroundColor: 'white', border: '1px solid rgb(226, 232, 240)', borderRadius: '16px', boxShadow: 'rgba(0, 0, 0, 0.02) 0px 4px 12px' }}>
        <h2 style={{ fontSize: '1.1rem', color: '#1e293b', margin: '0 0 20px 0' }}>검색엔진 등록</h2>
        <label style={labelStyle}>검색엔진 스크립트/메타 태그</label>
        <textarea style={{...inputStyle, height: '100px'}} value={config.script} onChange={e => setConfig({...config, script: e.target.value})} placeholder="검색엔진 인증 스크립트나 메타 태그를 입력하세요" />
      </div>

      <div className="card" style={{ padding: '24px', backgroundColor: 'white', border: '1px solid rgb(226, 232, 240)', borderRadius: '16px', boxShadow: 'rgba(0, 0, 0, 0.02) 0px 4px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.1rem', color: '#1e293b', margin: 0 }}>페이지별 SEO 설정</h2>
            <button onClick={() => setConfig({...config, pages: [...config.pages, { path: '', title: '', keywords: '' }]})} style={{ padding: '8px 16px', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} /> 추가
            </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                    {['페이지 경로', '페이지 제목', '키워드', '관리'].map(h => <th key={h} style={{ padding: '16px', textAlign: 'left', fontSize: '0.9rem', color: '#64748b' }}>{h}</th>)}
                </tr>
            </thead>
            <tbody>
                {config.pages.map((page, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px' }}><input style={inputStyle} value={page.path} onChange={e => { const pages = [...config.pages]; pages[index].path = e.target.value; setConfig({...config, pages}); }} /></td>
                        <td style={{ padding: '16px' }}><input style={inputStyle} value={page.title} onChange={e => { const pages = [...config.pages]; pages[index].title = e.target.value; setConfig({...config, pages}); }} /></td>
                        <td style={{ padding: '16px' }}><input style={inputStyle} value={page.keywords} onChange={e => { const pages = [...config.pages]; pages[index].keywords = e.target.value; setConfig({...config, pages}); }} /></td>
                        <td style={{ padding: '16px' }}><button onClick={() => setConfig({...config, pages: config.pages.filter((_, i) => i !== index)})} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} color="#dc2626" /></button></td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button style={{ padding: '12px 32px', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>저장하기</button>
      </div>
    </div>
  );
};

export default SEOManagement;
