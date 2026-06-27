import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Loader2, Save } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
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

  const fetchQuestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inquiry_questions')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) console.error('Error fetching questions:', error);
    else setQuestions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    // Wrap in a function to avoid direct setState in useEffect
    const init = async () => {
      await fetchQuestions();
    };
    init();
  }, []);

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
        await fetchQuestions();
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setModalConfig({ isOpen: true, title: '오류', message: '저장에 실패했습니다: ' + message, type: 'alert' });
    }
    setSaving(false);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setQuestions(items);
  };

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now(), title: '새 질문', type: 'text', options: [], display_order: questions.length }]);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: number, field: keyof Question, value: unknown) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const selectStyle = { 
    padding: '10px 36px 10px 16px', // 우측 여백을 충분히 확보
    borderRadius: '8px', 
    border: '1px solid #cbd5e1', 
    backgroundColor: 'white', 
    fontSize: '0.9rem', 
    outline: 'none', 
    cursor: 'pointer', 
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
    transition: 'border-color 0.2s, box-shadow 0.2s',
    appearance: 'none' as React.CSSProperties['appearance'],
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center' // 우측에서 12px만큼 떨어진 곳에 배치
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
        
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="questions">
                {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                        {questions.map((q, index) => (
                            <Draggable key={q.id} draggableId={q.id.toString()} index={index}>
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.draggableProps} style={{ marginBottom: '20px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#f8fafc', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', ...provided.draggableProps.style }}>
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
                                            <div {...provided.dragHandleProps}><GripVertical size={20} color="#94a3b8" /></div>
                                            <strong style={{ fontSize: '1.1rem', color: '#008b8b', minWidth: '40px' }}>Q{index + 1}.</strong>
                                            <input value={q.title} onChange={(e) => updateQuestion(q.id, 'title', e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                            <select value={q.type} onChange={(e) => updateQuestion(q.id, 'type', e.target.value as QuestionType)} style={selectStyle}>
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
                                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                                        if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
                                                            updateQuestion(q.id, 'options', [...q.options, e.currentTarget.value.trim()]);
                                                            e.currentTarget.value = '';
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
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
        
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setModalConfig({isOpen: true, title: '설정 저장', message: '저장하시겠습니까?', type: 'confirm', onConfirm: saveSettings})} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 30px', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
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
