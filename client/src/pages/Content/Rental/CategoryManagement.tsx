import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Edit2, Loader2 } from 'lucide-react';
import { supabase } from '../../../supabaseClient';

interface Category {
  id: number;
  name: string;
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        console.error('인증되지 않은 접근입니다.');
        setLoading(false);
        return;
    }

    const { data, error } = await supabase
      .from('rental_categories')
      .select('id, name')
      .order('id', { ascending: true });
    
    if (error) {
        console.error('Error fetching categories:', error);
    } else {
        setCategories(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async () => {
    if (!newCategoryName) return;
    const { error } = await supabase.from('rental_categories').insert({ name: newCategoryName });
    if (error) console.error('Error adding category:', error);
    else {
      setNewCategoryName('');
      fetchCategories();
    }
  };

  const updateCategory = async (id: number) => {
    const { error } = await supabase.from('rental_categories').update({ name: editingName }).eq('id', id);
    if (error) console.error('Error updating category:', error);
    else {
      setEditingId(null);
      fetchCategories();
    }
  };

  const deleteCategory = async (id: number) => {
    const { error } = await supabase.from('rental_categories').delete().eq('id', id);
    if (error) console.error('Error deleting category:', error);
    else fetchCategories();
  };

  const inputStyle = { padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', minWidth: '240px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card" style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', padding: '24px', backgroundColor: 'white', border: '1px solid rgb(226, 232, 240)', borderRadius: '16px', boxShadow: 'rgba(0, 0, 0, 0.02) 0px 4px 12px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgb(100, 116, 139)' }}>카테고리명 검색</label>
            <input placeholder="카테고리명 검색" type="text" style={inputStyle} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
            <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="새 카테고리명" style={inputStyle} />
            <button onClick={addCategory} style={{ padding: '10px 20px', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>등록</button>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
        ) : categories.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>데이터가 존재하지 않습니다.</div>
        ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left' }}>번호</th>
                <th style={{ padding: '16px 24px', textAlign: 'left' }}>카테고리명</th>
                <th style={{ padding: '16px 24px', textAlign: 'center' }}>관리</th>
                </tr>
            </thead>
            <tbody>
                {categories.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 24px' }}>{c.id}</td>
                    <td style={{ padding: '16px 24px' }}>
                        {editingId === c.id ? (
                            <input value={editingName} onChange={(e) => setEditingName(e.target.value)} style={inputStyle} />
                        ) : c.name}
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
                ))}
            </tbody>
            </table>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;
