import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Edit2, Loader2, Plus, Save } from 'lucide-react';
import { supabase } from '../../../supabaseClient';

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
    if (error) console.error('Error adding faq category:', error);
    else {
      setNewCategoryName('');
      fetchCategories();
    }
  };

  const updateCategory = async (id: number) => {
    if (!editingName.trim()) return;
    const { error } = await supabase.from('faq_categories').update({ name: editingName.trim() }).eq('id', id);
    if (error) console.error('Error updating faq category:', error);
    else {
      setEditingId(null);
      fetchCategories();
    }
  };

  const toggleActive = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase.from('faq_categories').update({ is_active: !currentStatus }).eq('id', id);
    if (error) console.error('Error toggling active status:', error);
    else fetchCategories();
  };

  const deleteCategory = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('faq_categories').delete().eq('id', id);
    if (error) console.error('Error deleting faq category:', error);
    else fetchCategories();
  };

  const inputStyle = { padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', flex: 1, backgroundColor: '#f8fafc' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card" style={{ padding: '24px', backgroundColor: 'white', border: '1px solid rgb(226, 232, 240)', borderRadius: '16px', boxShadow: 'rgba(0, 0, 0, 0.02) 0px 4px 12px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="새 카테고리명" style={inputStyle} />
            <button onClick={addCategory} style={{ padding: '10px 20px', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} /> 등록
            </button>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid rgb(226, 232, 240)', borderRadius: '16px', backgroundColor: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.85rem' }}>순번</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem' }}>카테고리명</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.85rem' }}>등록일자</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.85rem' }}>활성화</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.85rem' }}>관리</th>
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
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>{categories.length - index}</td>
                        <td style={{ padding: '16px 24px' }}>
                            {editingId === c.id ? (
                                <input value={editingName} onChange={(e) => setEditingName(e.target.value)} style={inputStyle} />
                            ) : (
                                <span style={{ fontWeight: 600, color: '#334155' }}>{c.name}</span>
                            )}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>{new Date().toLocaleDateString()}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            <button 
                            onClick={() => toggleActive(c.id, c.is_active)}
                            style={{
                                width: '40px',
                                height: '20px',
                                borderRadius: '10px',
                                backgroundColor: c.is_active ? '#008b8b' : '#cbd5e1',
                                border: 'none',
                                cursor: 'pointer'
                            }} />
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            {editingId === c.id ? (
                                <button onClick={() => updateCategory(c.id)} style={{ padding: '8px 16px', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>저장</button>
                            ) : (
                                <>
                                    <button onClick={() => { setEditingId(c.id); setEditingName(c.name); }} style={{ padding: '8px', marginRight: '8px' }}><Edit2 size={16} /></button>
                                    <button onClick={() => deleteCategory(c.id)} style={{ padding: '8px', color: '#dc2626' }}><Trash2 size={16} /></button>
                                </>
                            )}
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default FAQCategoryManagement;
