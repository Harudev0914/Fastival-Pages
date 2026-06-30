import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import Modal from '../../../components/Modal';

// 폰트 목록
const FONT_OPTIONS = [
  { label: '자이언츠체', value: 'Giants' },
  { label: '자이언츠체 Inline', value: 'GiantsInline' },
  { label: 'KBL코트체', value: 'KblcourtEbttf' },
  { label: '넥슨 메이플스토리', value: 'NexonMaplestory' },
  { label: '넥슨 워헤이븐', value: 'NexonWarhaven' },
];

const MainVisualDetail: React.FC<{ id?: number; onBack: () => void }> = ({ id, onBack }) => {
  const [formData, setFormData] = useState({
    bgType: 'image_url',
    bgSrc: '',
    mainText: '',
    subText: '',
    fontFamily: 'Giants',
    subImageSrc: '',
    targetDate: '',
    timestampFont: 'Giants',
  });

  useEffect(() => {
    if (id) {
        const fetchVisual = async () => {
            const { data, error } = await supabase.from('main_visuals').select('*').eq('id', id).single();
            if (data && !error) {
                setFormData({
                    bgType: data.bg_type || 'image_url',
                    bgSrc: data.bg_src || '',
                    mainText: data.main_text || '',
                    subText: data.sub_text || '',
                    fontFamily: data.font_family || 'Giants',
                    subImageSrc: data.sub_image_src || '',
                    targetDate: data.target_date ? moment(data.target_date).format('YYYY-MM-DDTHH:mm') : '',
                    timestampFont: data.timestamp_font || 'Giants',
                });
            }
        };
        fetchVisual();
    }
  }, [id]);

  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; title: string; message: string; type: 'confirm' | 'alert'; onConfirm?: () => void }>({
    isOpen: false, title: '', message: '', type: 'alert'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveVisual = async () => {
    const payload = {
        bg_type: formData.bgType,
        bg_src: formData.bgSrc,
        main_text: formData.mainText,
        sub_text: formData.subText,
        font_family: formData.fontFamily,
        sub_image_src: formData.subImageSrc,
        target_date: formData.targetDate || null,
        timestamp_font: formData.timestampFont,
    };

    let error;
    if (id) {
        const { error: updateError } = await supabase.from('main_visuals').update(payload).eq('id', id);
        error = updateError;
    } else {
        const { error: insertError } = await supabase.from('main_visuals').insert([payload]);
        error = insertError;
    }

    if (error) {
        setModalConfig({ isOpen: true, title: '오류', message: '저장에 실패했습니다: ' + error.message, type: 'alert' });
    } else {
        setModalConfig({ isOpen: true, title: '성공', message: '저장되었습니다.', type: 'confirm', onConfirm: onBack });
    }
  };

  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' as const };
  const labelStyle = { fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block', fontSize: '0.9rem' };

  return (
    <div className="card" style={{ padding: '30px' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', color: '#64748b' }}>
        <ArrowLeft size={18} /> 목록으로 돌아가기
      </button>
      
      <h2 style={{ marginBottom: '30px', color: '#0f172a' }}>{id ? '메인 비주얼 수정' : '메인 비주얼 등록'}</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
        <div>
          <label style={labelStyle}>배경 설정</label>
          <select name="bgType" value={formData.bgType} onChange={handleChange} style={{...inputStyle, marginBottom: '10px'}}>
              <option value="image_url">이미지 (URL)</option>
              <option value="video_url">동영상 (URL)</option>
          </select>
          <input name="bgSrc" placeholder="배경 URL 입력" value={formData.bgSrc} onChange={handleChange} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>문구 설정</label>
          <input name="subText" placeholder="서브 문구 입력" value={formData.subText} onChange={handleChange} style={{...inputStyle, marginBottom: '10px'}} />
          <input name="mainText" placeholder="메인 문구 입력" value={formData.mainText} onChange={handleChange} style={inputStyle} />
        </div>
        
        <div>
          <label style={labelStyle}>폰트 선택</label>
          <select name="fontFamily" value={formData.fontFamily} onChange={handleChange} style={inputStyle}>
            {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>

        <div>
            <label style={labelStyle}>서브 이미지 URL</label>
            <input name="subImageSrc" placeholder="서브 이미지 URL 입력" value={formData.subImageSrc} onChange={handleChange} style={inputStyle} />
        </div>

        <div>
            <label style={labelStyle}>타임스탬프 (D-Day)</label>
            <input type="datetime-local" name="targetDate" value={formData.targetDate} onChange={handleChange} style={{...inputStyle, marginBottom: '10px'}} />
            <select name="timestampFont" value={formData.timestampFont} onChange={handleChange} style={inputStyle}>
                {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
        </div>
      </div>
      
      <div style={{ marginTop: '40px' }}>
        <button onClick={() => setModalConfig({isOpen: true, title: '비주얼 저장', message: '저장하시겠습니까?', type: 'confirm', onConfirm: saveVisual})} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 30px', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <Save size={18} /> 저장하기
        </button>
      </div>

      <Modal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} onConfirm={modalConfig.onConfirm} title={modalConfig.title} message={modalConfig.message} type={modalConfig.type} />
    </div>
  );
};

export default MainVisualDetail;
