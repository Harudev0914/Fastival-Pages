import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Loader2, FileText, Save } from 'lucide-react';
import { supabase } from '../supabaseClient';
import Modal from '../components/Modal';

type QuestionType = 'radio' | 'checkbox' | 'select' | 'text' | 'file';

interface Question {
  id: number;
  title: string;
  type: QuestionType;
  options: string[];
  display_order: number;
}

const ConstructionInquirySettings: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; title: string; message: string; type: 'confirm' | 'alert'; onConfirm?: () => void }>({
    isOpen: false, title: '', message: '', type: 'alert'
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inquiry_questions')
      .select('*');
    
    if (error) console.error('Error fetching questions:', error);
    else setQuestions(data || []);
    setLoading(false);
  };

  const confirmSave = () => {
    setModalConfig({
        isOpen: true,
        title: '설정 저장',
        message: '현재 설정을 저장하시겠습니까?',
        type: 'confirm',
        onConfirm: saveSettings
    });
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
        const { error: deleteError } = await supabase.from('inquiry_questions').delete().neq('id', 0);
        if (deleteError) throw deleteError;
        
        const { error: insertError } = await supabase.from('inquiry_questions').insert(
            questions.map((q, idx) => ({ 
                title: q.title, 
                type: q.type, 
                options: q.options, 
                display_order: idx 
            }))
        );
        if (insertError) throw insertError;
        setModalConfig({ isOpen: true, title: '성공', message: '모든 변경사항이 저장되었습니다.', type: 'alert' });
        fetchQuestions();
    } catch (err: any) {
        console.error('Error saving:', err);
        setModalConfig({ isOpen: true, title: '오류', message: '저장에 실패했습니다: ' + err.message, type: 'alert' });
    }
    setSaving(false);
  };

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now(), title: '새 질문', type: 'text', options: [], display_order: questions.length }]);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: number, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div style={{ width: '100%' }}>
      <div className="card" style={{ padding: '30px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h2 style={{ color: '#1e293b', margin: 0 }}>시공 질의 설정</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '5px' }}>사용자에게 노출될 문의 항목을 관리합니다.</p>
          </div>
          <button onClick={addQuestion} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
            <Plus size={18} /> 새 질문 추가
          </button>
        </div>
        
        {questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                <FileText size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
                <p style={{ fontSize: '1.1rem', margin: 0 }}>등록된 게시물이 없습니다.</p>
            </div>
        ) : (
            questions.map((q, index) => (
              <div key={q.id} style={{ marginBottom: '20px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#f8fafc', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
                  <GripVertical size={20} color="#94a3b8" />
                  <strong style={{ fontSize: '1.1rem', color: '#008b8b', minWidth: '40px' }}>Q{index + 1}.</strong>
                  <input value={q.title} onChange={(e) => updateQuestion(q.id, 'title', e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  <select value={q.type} onChange={(e) => updateQuestion(q.id, 'type', e.target.value as QuestionType)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
                      <option value="radio">라디오</option>
                      <option value="checkbox">체크박스</option>
                      <option value="select">드롭다운</option>
                      <option value="text">텍스트</option>
                      <option value="file">파일업로드</option>
                  </select>
                  <button onClick={() => removeQuestion(q.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }} title="삭제"><Trash2 size={18} /></button>
                </div>
                
                {(q.type === 'radio' || q.type === 'checkbox' || q.type === 'select') && (
                  <div style={{ padding: '15px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <label style={{ fontWeight: 600, color: '#475569', marginBottom: '12px', display: 'block' }}>옵션 관리</label>
                      <input 
                          placeholder="옵션 입력 후 엔터" 
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', marginBottom: '10px' }}
                          onKeyDown={(e: any) => {
                              if (e.key === 'Enter' && e.target.value.trim() !== '') {
                                  updateQuestion(q.id, 'options', [...q.options, e.target.value.trim()]);
                                  e.target.value = '';
                              }
                          }} 
                      />
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {q.options.map((opt, i) => (
                              <span key={i} style={{ padding: '5px 12px', backgroundColor: '#e2e8f0', borderRadius: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                                  {opt} 
                                  <button onClick={() => updateQuestion(q.id, 'options', q.options.filter((_, idx) => idx !== i))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#475569', fontWeight: 'bold' }}>×</button>
                              </span>
                          ))}
                      </div>
                  </div>
                )}
              </div>
            ))
        )}
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={confirmSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 30px', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? '저장 중...' : '설정 저장'}
            </button>
        </div>
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

export default ConstructionInquirySettings;
