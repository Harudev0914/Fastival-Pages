import React, { useState, useEffect } from 'react';
import { Plus, GripVertical, Trash2, Edit2, Loader2 } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import Modal from '../../../components/Modal';

interface MainVisual {
  id: number;
  main_text: string;
  created_at: string;
  is_active: boolean;
}

const MainVisualList: React.FC<{ onEdit: (id?: number) => void }> = ({ onEdit }) => {
  const [visuals, setVisuals] = useState<MainVisual[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; title: string; message: string; type: 'confirm' | 'alert'; onConfirm?: () => void }>({
    isOpen: false, title: '', message: '', type: 'alert'
  });

  const fetchVisuals = async () => {
    setLoading(true);
    
    // Check if user is authenticated
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.error('User not authenticated');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('main_visuals')
      .select('id, main_text, created_at, is_active')
      .order('id', { ascending: true });
    
    if (error) console.error('Error fetching visuals:', error);
    else setVisuals(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchVisuals();
  }, []);

  const toggleActive = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('main_visuals')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    
    if (error) {
      setModalConfig({ isOpen: true, title: '오류', message: '상태 변경에 실패했습니다.', type: 'alert' });
    } else {
      fetchVisuals();
    }
  };

  const deleteVisual = async (id: number) => {
    const { error } = await supabase.from('main_visuals').delete().eq('id', id);
    if (error) {
      setModalConfig({ isOpen: true, title: '오류', message: '삭제에 실패했습니다.', type: 'alert' });
    } else {
      setModalConfig({ isOpen: false, title: '', message: '', type: 'alert' });
      fetchVisuals();
    }
  };

  const filterInputStyle = { padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', minWidth: '240px', boxShadow: 'rgba(0, 0, 0, 0.05) 0px 1px 2px 0px', transition: 'border-color 0.2s, box-shadow 0.2s' };
  const filterSelectStyle = { padding: '10px 36px 10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontSize: '0.9rem', outline: 'none', cursor: 'pointer', boxShadow: 'rgba(0, 0, 0, 0.05) 0px 1px 2px 0px', transition: 'border-color 0.2s, box-shadow 0.2s', appearance: 'none' as const, backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' };
  const filterLabelStyle = { fontSize: '0.8rem', fontWeight: 600, color: 'rgb(100, 116, 139)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 필터 섹션 */}
      <div className="card" style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', padding: '24px', backgroundColor: 'white', border: '1px solid rgb(226, 232, 240)', borderRadius: '16px', boxShadow: 'rgba(0, 0, 0, 0.02) 0px 4px 12px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={filterLabelStyle}>검색어 입력</label>
            <input placeholder="문구 검색" type="text" style={filterInputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={filterLabelStyle}>정렬 기준</label>
            <select style={filterSelectStyle}>
              <option value="desc">최신순 정렬</option>
              <option value="asc">오래된순 정렬</option>
            </select>
          </div>
        </div>
        <button onClick={() => onEdit()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, height: '42px' }}>
          <Plus size={18} /> 새 비주얼 등록
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /></div>
        ) : visuals.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>등록된 비주얼이 없습니다.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f1f5f9' }}>
                <th style={{ padding: '16px 24px', textAlign: 'center', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>순서</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>메인 문구</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>등록 일자</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>활성화</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {visuals.map((v, index) => (
                <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 24px', textAlign: 'center', color: '#94a3b8' }}><GripVertical size={18} /></td>
                  <td style={{ padding: '16px 24px', color: '#334155', fontWeight: 600 }}>{v.main_text}</td>
                  <td style={{ padding: '16px 24px', color: '#64748b' }}>{new Date(v.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <button 
                      onClick={() => toggleActive(v.id, v.is_active)}
                      style={{
                        width: '44px',
                        height: '24px',
                        borderRadius: '12px',
                        backgroundColor: v.is_active ? '#008b8b' : '#cbd5e1',
                        border: 'none',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        position: 'absolute',
                        top: '2px',
                        left: v.is_active ? '22px' : '2px',
                        transition: 'left 0.2s'
                      }} />
                    </button>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <button onClick={() => onEdit(v.id)} style={{ padding: '8px', marginRight: '8px', cursor: 'pointer', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#475569' }} title="수정"><Edit2 size={16} /></button>
                    <button onClick={() => setModalConfig({isOpen: true, title: '삭제 확인', message: '정말 삭제하시겠습니까?', type: 'confirm', onConfirm: () => deleteVisual(v.id)})} style={{ padding: '8px', cursor: 'pointer', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px' }} title="삭제"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} onConfirm={modalConfig.onConfirm} title={modalConfig.title} message={modalConfig.message} type={modalConfig.type} />
    </div>
  );
};

export default MainVisualList;
