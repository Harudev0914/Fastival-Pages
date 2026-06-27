import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from '../../../components/Modal';

interface Category {
  id: number;
  name: string;
}

const FAQDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; title: string; message: string; type: 'confirm' | 'alert' }>({
    isOpen: false, title: '', message: '', type: 'alert'
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: catData } = await supabase.from('faq_categories').select('id, name');
      setCategories(catData || []);

      if (id !== 'new') {
        const { data } = await supabase.from('faqs').select('*').eq('id', id).single();
        if (data) {
          setQuestion(data.question);
          setAnswer(data.answer);
          setCategoryId(data.category_id);
        }
      }
    };
    fetchData();
  }, [id]);

  const saveFaq = async () => {
    setLoading(true);
    const payload = { question, answer, category_id: categoryId || null };
    
    let error;
    if (id === 'new') {
        const { error: insertError } = await supabase.from('faqs').insert(payload);
        error = insertError;
    } else {
        const { error: updateError } = await supabase.from('faqs').update(payload).eq('id', id);
        error = updateError;
    }

    if (error) {
        setModalConfig({ isOpen: true, title: '오류', message: '저장에 실패했습니다.', type: 'alert' });
    } else {
        setModalConfig({ isOpen: true, title: '성공', message: '저장되었습니다.', type: 'alert' });
        setTimeout(() => navigate('/admin/dashboard/faq'), 1000);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card" style={{ padding: '24px', backgroundColor: 'white', border: '1px solid rgb(226, 232, 240)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <button onClick={() => navigate('/admin/dashboard/faq')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer' }}><ArrowLeft size={18}/> 목록으로</button>
            <button onClick={saveFaq} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} 저장
            </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="질문" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="">카테고리 선택</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="답변" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '300px' }} />
        </div>
      </div>
      <Modal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} title={modalConfig.title} message={modalConfig.message} type={modalConfig.type} />
    </div>
  );
};

export default FAQDetail;
