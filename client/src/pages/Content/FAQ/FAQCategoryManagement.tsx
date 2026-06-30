import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Edit2, Loader2, Plus } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import Modal from '../../../components/Modal';
import ToggleButton from '../../../components/UI/ToggleButton';

interface Category {
  id: number;
  name: string;
  is_active: boolean;
}

const FAQCategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; title: string; message: string; type: 'confirm' | 'alert'; onConfirm?: () => void }>({
    isOpen: false, title: '', message: '', type: 'alert'
  });

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from('faq_categories')
      .select('id, name, is_active')
      .order('id', { ascending: true });
    
    if (error) {
        console.error('Error fetching faq categories:', error);
    } else {
        setCategories(data || []);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchCategories();
      setLoading(false);
    };
    init();
  }, [fetchCategories]);

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;
    const { error } = await supabase.from('faq_categories').insert({ name: newCategoryName.trim(), is_active: true });
    if (error) setModalConfig({ isOpen: true, title: '오류', message: '등록에 실패했습니다.', type: 'alert' });
    else {
      setNewCategoryName('');
      fetchCategories();
    }
  };

  const updateCategory = async (id: number) => {
    if (!editingName.trim()) return;
    const { error } = await supabase.from('faq_categories').update({ name: editingName.trim() }).eq('id', id);
    if (error) setModalConfig({ isOpen: true, title: '오류', message: '수정에 실패했습니다.', type: 'alert' });
    else {
      setEditingId(null);
      fetchCategories();
    }
  };

  const toggleActive = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase.from('faq_categories').update({ is_active: !currentStatus }).eq('id', id);
    if (error) setModalConfig({ isOpen: true, title: '오류', message: '상태 변경에 실패했습니다.', type: 'alert' });
    else fetchCategories();
  };

  const deleteCategory = async (id: number) => {
    setModalConfig({
        isOpen: true,
        title: '삭제 확인',
        message: '정말 삭제하시겠습니까?',
        type: 'confirm',
        onConfirm: async () => {
            const { error } = await supabase.from('faq_categories').delete().eq('id', id);
            if (error) setModalConfig({ isOpen: true, title: '오류', message: '삭제에 실패했습니다.', type: 'alert' });
            else {
                setModalConfig({ isOpen: false, title: '', message: '', type: 'alert' });
                fetchCategories();
            }
        }
    });
  };

  const inputStyle = { padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', flex: 1, backgroundColor: '#f8fafc' };

  return (
    <div style={{ padding: '0 20px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card" style={{ padding: '24px', backgroundColor: 'white', border: '1px solid rgb(226, 232, 240)', borderRadius: '16px', boxShadow: 'rgba(0, 0, 0, 0.02) 0px 4px 12px' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#1e293b' }}>카테고리 등록</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="카테고리명을 입력하세요" style={inputStyle} />
            <button onClick={addCategory} style={{ padding: '12px 24px', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} /> 등록
            </button>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid rgb(226, 232, 240)', borderRadius: '16px', backgroundColor: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>순번</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.9rem', color: '#64748b' }}>카테고리명</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>등록일자</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>활성화</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>관리</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" /></td></tr>
                ) : categories.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>등록된 카테고리가 없습니다.</td></tr>
                ) : (
                    categories.map((c, index) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px 24px', textAlign: 'center', color: '#475569' }}>{categories.length - index}</td>
                        <td style={{ padding: '16px 24px' }}>
                            {editingId === c.id ? (
                                <input value={editingName} onChange={(e) => setEditingName(e.target.value)} style={inputStyle} />
                            ) : (
                                <span style={{ fontWeight: 600, color: '#334155', fontSize: '1rem' }}>{c.name}</span>
                            )}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'center', color: '#64748b' }}>{new Date().toLocaleDateString()}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            <ToggleButton isOn={c.is_active} onToggle={() => toggleActive(c.id, c.is_active)} />
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            {editingId === c.id ? (
                                <button onClick={() => updateCategory(c.id)} style={{ padding: '8px 16px', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>저장</button>
                            ) : (
                                <>
                                    <button onClick={() => { setEditingId(c.id); setEditingName(c.name); }} style={{ padding: '8px', marginRight: '8px', background: 'none', border: 'none', cursor: 'pointer' }}><Edit2 size={16} color="#475569" /></button>
                                    <button onClick={() => setModalConfig({isOpen: true, title: '삭제 확인', message: '정말 삭제하시겠습니까?', type: 'confirm', onConfirm: () => deleteCategory(c.id)})} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} color="#dc2626" /></button>
                                </>
                            )}
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>
      <Modal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} onConfirm={modalConfig.onConfirm} title={modalConfig.title} message={modalConfig.message} type={modalConfig.type} />
    </div>
  );
};

export default FAQCategoryManagement;
