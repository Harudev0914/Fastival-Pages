import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Edit2, Loader2, Plus } from 'lucide-react';
import { supabase } from '../../../supabaseClient';

interface Category {
  id: number;
  name: string;
}

const NewsCategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from('news_categories')
      .select('id, name')
      .order('id', { ascending: true });
    
    if (error) {
        console.error('Error fetching news categories:', error);
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
    if (!newCategoryName) return;
    const { error } = await supabase.from('news_categories').insert({ name: newCategoryName });
    if (error) console.error('Error adding news category:', error);
    else {
      setNewCategoryName('');
      fetchCategories();
    }
  };

  const updateCategory = async (id: number) => {
    const { error } = await supabase.from('news_categories').update({ name: editingName }).eq('id', id);
    if (error) console.error('Error updating news category:', error);
    else {
      setEditingId(null);
      fetchCategories();
    }
  };

  const deleteCategory = async (id: number) => {
    const { error } = await supabase.from('news_categories').delete().eq('id', id);
    if (error) console.error('Error deleting news category:', error);
    else fetchCategories();
  };

  const inputStyle = { padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', flex: 1 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card" style={{ padding: '24px', backgroundColor: 'white', border: '1px solid rgb(226, 232, 240)', borderRadius: '16px', boxShadow: 'rgba(0, 0, 0, 0.02) 0px 4px 12px' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="새 카테고리명" style={inputStyle} />
            <button onClick={addCategory} style={{ padding: '10px 20px', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} /> 카테고리 등록
            </button>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid rgb(226, 232, 240)', borderRadius: '16px' }}>
        {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
        ) : categories.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>등록된 카테고리가 없습니다.</div>
        ) : (
            <div style={{ width: '100%' }}>
                {categories.map((c) => (
                <div key={c.id} style={{ borderBottom: '1px solid #f1f5f9', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 600, color: '#334155' }}>
                        {editingId === c.id ? (
                            <input value={editingName} onChange={(e) => setEditingName(e.target.value)} style={inputStyle} />
                        ) : c.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {editingId === c.id ? (
                            <button onClick={() => updateCategory(c.id)} style={{ padding: '8px 16px', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>저장</button>
                        ) : (
                            <>
                                <button onClick={() => { setEditingId(c.id); setEditingName(c.name); }} style={{ padding: '6px', cursor: 'pointer', border: 'none', background: 'none' }}><Edit2 size={16} /></button>
                                <button onClick={() => deleteCategory(c.id)} style={{ padding: '6px', color: '#dc2626', border: 'none', background: 'none' }}><Trash2 size={16} /></button>
                            </>
                        )}
                    </div>
                </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default NewsCategoryManagement;
