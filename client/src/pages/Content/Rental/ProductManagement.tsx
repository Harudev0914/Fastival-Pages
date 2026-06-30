import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { supabase } from '../../../supabaseClient';

interface Category {
  id: number;
  name: string;
}

const ProductManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  
  // Product state
  const [product, setProduct] = useState({
    name: '',
    brand: '',
    image_url: '',
    description: '',
    price: 0,
    options: [{ name: '', value: '' }],
    rental_info: { deposit: 0, daily_rate: 0, min_duration: 1 }
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('rental_categories').select('id, name');
      setCategories(data || []);
    };
    fetchCategories();
  }, []);

  const addOption = () => {
    setProduct({ ...product, options: [...product.options, { name: '', value: '' }] });
  };

  const updateOption = (index: number, field: 'name' | 'value', value: string) => {
    const newOptions = [...product.options];
    newOptions[index][field] = value;
    setProduct({ ...product, options: newOptions });
  };

  const removeOption = (index: number) => {
    setProduct({ ...product, options: product.options.filter((_, i) => i !== index) });
  };

  const saveProduct = async () => {
    console.log('Saving product:', { ...product, category_id: selectedCategory });
    // API logic to save to rental_products table
  };

  const inputStyle: React.CSSProperties = { padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ marginBottom: '20px' }}>상품 관리</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label>카테고리 선택</label>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(Number(e.target.value))} style={inputStyle}>
            <option value="">카테고리를 선택하세요</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
            <label>상품명</label>
            <input value={product.name} onChange={e => setProduct({...product, name: e.target.value})} style={inputStyle} />
        </div>
        <div>
            <label>상품 브랜드</label>
            <input value={product.brand} onChange={e => setProduct({...product, brand: e.target.value})} style={inputStyle} />
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <label>상품 설명</label>
        <textarea value={product.description} onChange={e => setProduct({...product, description: e.target.value})} style={{ ...inputStyle, height: '100px' }} />
      </div>

      <div style={{ marginTop: '20px' }}>
        <label>상품 옵션</label>
        {product.options.map((opt, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input placeholder="옵션명" value={opt.name} onChange={e => updateOption(i, 'name', e.target.value)} style={inputStyle} />
                <input placeholder="옵션값" value={opt.value} onChange={e => updateOption(i, 'value', e.target.value)} style={inputStyle} />
                <button onClick={() => removeOption(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
            </div>
        ))}
        <button onClick={addOption} style={{ background: '#f1f5f9', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}><Plus size={18} /> 옵션 추가</button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <label>가격</label>
        <input type="number" value={product.price} onChange={e => setProduct({...product, price: Number(e.target.value)})} style={inputStyle} />
      </div>

      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={saveProduct} style={{ padding: '12px 30px', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
            <Save size={18} style={{ marginRight: '8px' }} /> 상품 저장
        </button>
      </div>
    </div>
  );
};

export default ProductManagement;
