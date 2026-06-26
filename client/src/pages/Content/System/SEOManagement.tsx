import React, { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import { supabase } from '../../../supabaseClient';

const SEOManagement: React.FC = () => {
  const [seo, setSeo] = useState({ id: null, title: '', description: '', og_image_url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSEO();
  }, []);

  const fetchSEO = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('seo_settings').select('*').single();
    if (!error && data) setSeo(data);
    setLoading(false);
  };

  const saveSEO = async () => {
    setSaving(true);
    if (seo.id) {
      await supabase.from('seo_settings').update(seo).eq('id', seo.id);
    } else {
      await supabase.from('seo_settings').insert(seo);
    }
    setSaving(false);
    alert('SEO 설정이 저장되었습니다.');
  };

  const inputStyle = { padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', width: '100%', marginBottom: '15px', outline: 'none' };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div className="card" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '16px', maxWidth: '600px' }}>
      <h3 style={{ marginBottom: '20px' }}>SEO / META 태그 관리</h3>
      
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>웹사이트 제목</label>
      <input value={seo.title} onChange={e => setSeo({...seo, title: e.target.value})} style={inputStyle} />

      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>웹사이트 설명 (Description)</label>
      <textarea value={seo.description} onChange={e => setSeo({...seo, description: e.target.value})} style={{...inputStyle, height: '100px'}} />

      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>공유 썸네일 이미지 URL</label>
      <input value={seo.og_image_url} onChange={e => setSeo({...seo, og_image_url: e.target.value})} placeholder="https://..." style={inputStyle} />

      <button onClick={saveSEO} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 저장하기
      </button>
    </div>
  );
};

export default SEOManagement;
