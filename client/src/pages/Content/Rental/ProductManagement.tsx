import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Loader2, X } from 'lucide-react';
import { supabase } from '../../../supabaseClient';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category_id: number;
  category_name?: string;
  rental_categories?: { name: string };
}

interface Category {
  id: number;
  name: string;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: 0, description: '', category_id: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        console.error('인증되지 않은 접근입니다.');
        setLoading(false);
        return;
    }

    const { data: catData } = await supabase.from('rental_categories').select('id, name');
    const { data: prodData, error } = await supabase
      .from('rental_products')
      .select('*, rental_categories(name)')
      .order('id', { ascending: true });
    
    if (error) {
        console.error('Error fetching data:', error);
    } else {
        setCategories(catData || []);
        setProducts((prodData || []).map(p => ({ ...p, category_name: p.rental_categories?.name })));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.category_id) return;

    if (editingId) {
      await supabase.from('rental_products').update(formData).eq('id', editingId);
    } else {
      await supabase.from('rental_products').insert(formData);
    }
    
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', price: 0, description: '', category_id: '' });
    fetchData();
  };

  const deleteProduct = async (id: number) => {
    await supabase.from('rental_products').delete().eq('id', id);
    fetchData();
  };

  const inputStyle = { padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', width: '100%', marginBottom: '10px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card" style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', padding: '24px', backgroundColor: 'white', border: '1px solid rgb(226, 232, 240)', borderRadius: '16px', boxShadow: 'rgba(0, 0, 0, 0.02) 0px 4px 12px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgb(100, 116, 139)' }}>상품명 검색</label>
            <input placeholder="상품명 검색" type="text" style={inputStyle} />
          </div>
        </div>
        <button onClick={() => { setEditingId(null); setFormData({ name: '', price: 0, description: '', category_id: '' }); setIsModalOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          상품 등록
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
        ) : products.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>데이터가 존재하지 않습니다.</div>
        ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left' }}>번호</th>
                <th style={{ padding: '16px 24px', textAlign: 'left' }}>카테고리</th>
                <th style={{ padding: '16px 24px', textAlign: 'left' }}>상품명</th>
                <th style={{ padding: '16px 24px', textAlign: 'right' }}>가격</th>
                <th style={{ padding: '16px 24px', textAlign: 'center' }}>관리</th>
                </tr>
            </thead>
            <tbody>
                {products.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 24px' }}>{p.id}</td>
                    <td style={{ padding: '16px 24px' }}>{p.category_name}</td>
                    <td style={{ padding: '16px 24px' }}>{p.name}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>{p.price.toLocaleString()}원</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <button onClick={() => deleteProduct(p.id)} style={{ padding: '8px', color: '#dc2626', cursor: 'pointer', border: 'none', background: 'none' }}><Trash2 size={16} /></button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div className="card" style={{ padding: '24px', width: '400px', backgroundColor: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>{editingId ? '상품 수정' : '상품 등록'}</h3>
                    <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                </div>
                <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} style={inputStyle}>
                    <option value="">카테고리 선택</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="상품명" style={inputStyle} />
                <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} placeholder="가격" style={inputStyle} />
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="설명" style={inputStyle} />
                <button onClick={handleSubmit} style={{ width: '100%', padding: '12px', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '6px' }}>저장</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
