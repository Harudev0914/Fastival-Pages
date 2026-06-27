import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit2, Loader2, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../components/Modal';

interface NewsItem {
  id: number;
  title: string;
  category_id: number;
  content: string;
  created_at: string;
  is_active: boolean;
  category_name?: string;
}

const NewsList: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const navigate = useNavigate();
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; title: string; message: string; type: 'confirm' | 'alert'; onConfirm?: () => void }>({
    isOpen: false, title: '', message: '', type: 'alert'
  });

  const fetchNews = useCallback(async () => {
    const { data, error } = await supabase
      .from('news')
      .select('id, title, category_id, content, created_at, is_active, news_categories(name)')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching news:', error);
    else setNews(data?.map(n => ({...n, category_name: n.news_categories?.name})) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const deleteNews = async (id: number) => {
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) {
      setModalConfig({ isOpen: true, title: '오류', message: '삭제에 실패했습니다.', type: 'alert' });
    } else {
      setModalConfig({ isOpen: false, title: '', message: '', type: 'alert' });
      fetchNews();
    }
  };

  const inputStyle = { padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', minWidth: '180px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card" style={{ padding: '24px', backgroundColor: 'white', border: '1px solid rgb(226, 232, 240)', borderRadius: '16px', boxShadow: 'rgba(0, 0, 0, 0.02) 0px 4px 12px' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                <input placeholder="검색어 입력" type="text" style={inputStyle} />
                <select style={inputStyle}>
                    <option>최신 등록 순</option>
                    <option>오래된 순</option>
                </select>
                <select style={inputStyle}>
                    <option>전체 (활성/비활성)</option>
                    <option>활성화</option>
                    <option>비활성화</option>
                </select>
            </div>
            <button onClick={() => navigate('/admin/dashboard/news/detail/new')} style={{ padding: '10px 20px', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
              <Plus size={18} /> 새 뉴스 등록
            </button>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid rgb(226, 232, 240)', borderRadius: '16px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
        ) : news.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>등록된 뉴스가 없습니다.</div>
        ) : (
          <div style={{ width: '100%' }}>
            {news.map((item) => (
              <div key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {expandedId === item.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        <span style={{ fontWeight: 600, color: '#334155' }}>[{item.category_name || '미분류'}] {item.title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(item.created_at).toLocaleDateString()}</span>
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/dashboard/news/detail/${item.id}`) }} style={{ padding: '6px', cursor: 'pointer', border: 'none', background: 'none' }}><Edit2 size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); setModalConfig({isOpen: true, title: '삭제 확인', message: '정말 삭제하시겠습니까?', type: 'confirm', onConfirm: () => deleteNews(item.id)})}} style={{ padding: '6px', color: '#dc2626', border: 'none', background: 'none' }}><Trash2 size={16} /></button>
                    </div>
                </div>
                {expandedId === item.id && (
                    <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', fontSize: '0.9rem', color: '#475569', borderTop: '1px solid #e2e8f0' }}>
                        {item.content}
                    </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Modal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} onConfirm={modalConfig.onConfirm} title={modalConfig.title} message={modalConfig.message} type={modalConfig.type} />
    </div>
  );
};

export default NewsList;
