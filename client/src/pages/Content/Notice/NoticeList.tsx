import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit2, Loader2, Search } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../components/Modal';

interface NoticeItem {
  id: number;
  title: string;
  category_id: number;
  content: string;
  created_at: string;
  is_active: boolean;
  author?: string;
  category_name?: string;
}

const NoticeList: React.FC = () => {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; title: string; message: string; type: 'confirm' | 'alert'; onConfirm?: () => void }>({
    isOpen: false, title: '', message: '', type: 'alert'
  });

  const fetchNotices = useCallback(async () => {
    const { data, error } = await supabase
      .from('notices')
      .select('id, title, category_id, content, created_at, is_active, notice_categories(name)')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching notices:', error);
    else setNotices(data?.map(n => ({...n, category_name: n.notice_categories?.name, author: '관리자'})) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const toggleActive = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase.from('notices').update({ is_active: !currentStatus }).eq('id', id);
    if (error) {
      setModalConfig({ isOpen: true, title: '오류', message: '상태 변경에 실패했습니다.', type: 'alert' });
    } else {
      fetchNotices();
    }
  };

  const deleteNotice = async (id: number) => {
    const { error } = await supabase.from('notices').delete().eq('id', id);
    if (error) {
      setModalConfig({ isOpen: true, title: '오류', message: '삭제에 실패했습니다.', type: 'alert' });
    } else {
      setModalConfig({ isOpen: false, title: '', message: '', type: 'alert' });
      fetchNotices();
    }
  };

  const inputStyle = { padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', minWidth: '180px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card" style={{ padding: '24px', backgroundColor: 'white', border: '1px solid rgb(226, 232, 240)', borderRadius: '16px', boxShadow: 'rgba(0, 0, 0, 0.02) 0px 4px 12px' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                <input placeholder="검색어 입력" type="text" style={inputStyle} />
                <button style={{ padding: '10px 20px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Search size={18} /></button>
            </div>
            <button onClick={() => navigate('/admin/dashboard/notices/detail/new')} style={{ padding: '10px 20px', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
              <Plus size={18} /> 새 공지 등록
            </button>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid rgb(226, 232, 240)', borderRadius: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.85rem' }}>순번</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem' }}>제목</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.85rem' }}>작성자</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.85rem' }}>작성일자</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.85rem' }}>활성화</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.85rem' }}>관리</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" /></td></tr>
                ) : notices.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>등록된 공지가 없습니다.</td></tr>
                ) : (
                    notices.map((item, index) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>{notices.length - index}</td>
                        <td style={{ padding: '16px 24px', fontWeight: 600 }}>[{item.category_name || '미분류'}] {item.title}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>{item.author}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>{new Date(item.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            <button 
                            onClick={() => toggleActive(item.id, item.is_active)}
                            style={{
                                width: '40px',
                                height: '20px',
                                borderRadius: '10px',
                                backgroundColor: item.is_active ? '#008b8b' : '#cbd5e1',
                                border: 'none',
                                cursor: 'pointer'
                            }} />
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            <button onClick={() => navigate(`/admin/dashboard/notices/detail/${item.id}`)} style={{ padding: '6px', marginRight: '8px', cursor: 'pointer', border: 'none', background: 'none' }}><Edit2 size={16} /></button>
                            <button onClick={() => setModalConfig({isOpen: true, title: '삭제 확인', message: '정말 삭제하시겠습니까?', type: 'confirm', onConfirm: () => deleteNotice(item.id)})} style={{ padding: '6px', color: '#dc2626', border: 'none', background: 'none' }}><Trash2 size={16} /></button>
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>
      <Modal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} onConfirm={modalConfig.onConfirm} title={modalConfig.title} message={modalConfig.message} type={modalConfig.type} />
    </div>
  );
};

export default NoticeList;
