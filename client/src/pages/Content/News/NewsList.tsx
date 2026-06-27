import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit2, Loader2, GripVertical } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../components/Modal';

interface NewsItem {
  id: number;
  title: string;
  category_id: number;
  created_at: string;
  is_active: boolean;
}

const NewsList: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; title: string; message: string; type: 'confirm' | 'alert'; onConfirm?: () => void }>({
    isOpen: false, title: '', message: '', type: 'alert'
  });

  const fetchNews = useCallback(async () => {
    const { data, error } = await supabase
      .from('news')
      .select('id, title, category_id, created_at, is_active')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching news:', error);
    else setNews(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchNews();
      setLoading(false);
    };
    init();
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card" style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', padding: '24px', backgroundColor: 'white', border: '1px solid rgb(226, 232, 240)', borderRadius: '16px', boxShadow: 'rgba(0, 0, 0, 0.02) 0px 4px 12px', justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/admin/dashboard/news/detail/new')} style={{ padding: '10px 20px', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
          <Plus size={18} /> 새 뉴스 등록
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
        ) : news.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>등록된 뉴스가 없습니다.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left' }}>번호</th>
                <th style={{ padding: '16px 24px', textAlign: 'left' }}>제목</th>
                <th style={{ padding: '16px 24px', textAlign: 'left' }}>등록 일자</th>
                <th style={{ padding: '16px 24px', textAlign: 'center' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {news.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 24px' }}>{item.id}</td>
                  <td style={{ padding: '16px 24px' }}>{item.title}</td>
                  <td style={{ padding: '16px 24px' }}>{new Date(item.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <button onClick={() => navigate(`/admin/dashboard/news/detail/${item.id}`)} style={{ padding: '8px', marginRight: '8px' }}><Edit2 size={16} /></button>
                    <button onClick={() => setModalConfig({isOpen: true, title: '삭제 확인', message: '정말 삭제하시겠습니까?', type: 'confirm', onConfirm: () => deleteNews(item.id)})} style={{ padding: '8px', color: '#dc2626' }}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} onConfirm={modalConfig.onConfirm} title={modalConfig.title} message={modalConfig.message} type={modalConfig.type} />
    </div>
  );
};

export default NewsList;
