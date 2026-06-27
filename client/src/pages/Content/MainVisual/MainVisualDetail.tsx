import React, { useState } from 'react';
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
    subText: '',
    mainText: '',
    hasSubImage: false,
    subImageType: 'image_url',
    subImageSrc: '',
    hasTimestamp: false,
    targetDate: '',
    fontFamily: 'Giants',
    timestampFont: 'Giants',
    animationType: 'none',
    isActive: true
  });

  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; title: string; message: string; type: 'confirm' | 'alert'; onConfirm?: () => void }>({
    isOpen: false, title: '', message: '', type: 'alert'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
        const files = (e.target as HTMLInputElement).files;
        setFormData(prev => ({ ...prev, [name]: files ? files[0] : null }));
    } else {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const saveVisual = async () => {
    const payload = {
        bg_type: formData.bgType,
        bg_src: formData.bgSrc,
        main_text: formData.mainText,
        sub_text: formData.subText,
        font_family: formData.fontFamily,
        has_sub_image: formData.hasSubImage,
        sub_image_src: formData.subImageSrc,
        has_timestamp: formData.hasTimestamp,
        target_date: formData.targetDate || null,
        timestamp_font: formData.timestampFont,
        animation_type: formData.animationType,
        is_active: formData.isActive
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
        setModalConfig({ isOpen: true, title: '성공', message: '저장되었습니다.', type: 'alert', onConfirm: onBack });
    }
  };

  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' as const };
  const labelStyle = { fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block', fontSize: '0.9rem' };

  const selectStyle = {
    padding: '10px 36px 10px 16px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: 'white',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    appearance: 'none',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center'
  };

  return (
    <div className="card" style={{ padding: '30px' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', color: '#64748b' }}>
        <ArrowLeft size={18} /> 목록으로 돌아가기
      </button>
      
      <h2 style={{ marginBottom: '30px', color: '#0f172a' }}>{id ? '메인 비주얼 수정' : '메인 비주얼 등록'}</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
        <div>
          <label style={labelStyle}>배경 설정</label>
          <div style={{ marginBottom: '10px' }}>
            <select name="bgType" value={formData.bgType} onChange={handleChange} style={{...selectStyle, width: '100%'}}>
              <option value="image_url">이미지 (URL)</option>
              <option value="image_file">이미지 (File)</option>
              <option value="video_url">동영상 (URL)</option>
              <option value="video_file">동영상 (File)</option>
            </select>
          </div>
          {formData.bgType.includes('url') ? (
            <input name="bgSrc" placeholder="배경 URL 입력" value={formData.bgSrc} onChange={handleChange} style={inputStyle} />
          ) : (
            <input type="file" name="bgSrc" onChange={handleChange} style={inputStyle} />
          )}
        </div>

        <div>
          <label style={labelStyle}>문구 설정</label>
          <input name="subText" placeholder="서브 문구 입력" value={formData.subText} onChange={handleChange} style={{...inputStyle, marginBottom: '10px'}} />
          <input name="mainText" placeholder="메인 문구 입력" value={formData.mainText} onChange={handleChange} style={inputStyle} />
        </div>
        
        <div>
          <label style={labelStyle}>폰트 선택</label>
          <select name="fontFamily" value={formData.fontFamily} onChange={handleChange} style={{...selectStyle, width: '100%'}}>
            {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>애니메이션 선택</label>
          <select name="animationType" value={formData.animationType} onChange={handleChange} style={{...selectStyle, width: '100%'}}>
            <option value="none">없음</option>
            <option value="fade">Fade In</option>
            <option value="slide">Slide Up</option>
          </select>
        </div>

        {/* 통합 미리보기 */}
        <div style={{ padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', marginTop: '10px' }}>
            <label style={{...labelStyle, marginBottom: '10px'}}>미리보기</label>
            <div style={{ 
                fontFamily: formData.fontFamily, 
                fontSize: '1.5rem', 
                color: '#1e293b', 
                padding: '20px', 
                backgroundColor: 'white', 
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                animation: formData.animationType !== 'none' ? 'previewAnim 1s' : 'none'
            }}>
                <div style={{ fontSize: '1rem', marginBottom: '5px' }}>{formData.subText || '서브 문구'}</div>
                <div style={{ fontSize: '2rem' }}>{formData.mainText || '메인 문구'}</div>
                {formData.hasTimestamp && (
                    <div style={{ marginTop: '15px', fontFamily: formData.timestampFont, fontSize: '1.2rem', color: '#64748b' }}>
                        {new Date(formData.targetDate).toLocaleString() || '타임스탬프'}
                    </div>
                )}
            </div>
        </div>
        
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '15px' }}>
            <input type="checkbox" name="hasSubImage" checked={formData.hasSubImage} onChange={handleChange} />
            <span style={{...labelStyle, marginBottom: 0}}>서브 이미지 사용</span>
          </label>
          {formData.hasSubImage && (
            <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <select name="subImageType" value={formData.subImageType} onChange={handleChange} style={{...selectStyle, width: '100%'}}>
                <option value="image_url">이미지 (URL)</option>
                <option value="image_file">이미지 (File)</option>
              </select>
              {formData.subImageType.includes('url') ? (
                <input name="subImageSrc" placeholder="서브 이미지 URL 입력" value={formData.subImageSrc} onChange={handleChange} style={inputStyle} />
              ) : (
                <input type="file" name="subImageSrc" onChange={handleChange} style={inputStyle} />
              )}
            </div>
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" name="hasTimestamp" checked={formData.hasTimestamp} onChange={handleChange} />
            <span style={{...labelStyle, marginBottom: 0}}>타임스탬프 사용</span>
          </label>
          {formData.hasTimestamp && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="datetime-local" name="targetDate" value={formData.targetDate} onChange={handleChange} style={inputStyle} />
              <select name="timestampFont" value={formData.timestampFont} onChange={handleChange} style={{...selectStyle, width: '100%'}}>
                {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>
      
      <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-start' }}>
        <button onClick={() => setModalConfig({isOpen: true, title: '비주얼 저장', message: '저장하시겠습니까?', type: 'confirm', onConfirm: saveVisual})} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 30px', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 139, 139, 0.3)' }}>
          <Save size={18} /> 저장하기
        </button>
      </div>

      <Modal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
};

export default MainVisualDetail;
