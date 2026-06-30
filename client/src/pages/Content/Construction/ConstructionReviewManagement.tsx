import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Star } from 'lucide-react';
import { reviewApi, type ConstructionReview } from '../../../api/constructionApi';
import ToggleButton from '../../../components/UI/ToggleButton';
import BoardTable, { type Column } from './BoardTable';
import { PageHead, btnPrimary, fmtDate, useAdminModal } from './shared';

const ConstructionReviewManagement: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ConstructionReview[]>([]);
  const [loading, setLoading] = useState(true);
  const { element: modal, alert, confirm } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await reviewApi.list();
    if (error) alert('불러오기 오류', error);
    setItems(data || []);
  }, [alert]);

  useEffect(() => {
    (async () => { setLoading(true); await fetchItems(); setLoading(false); })();
  }, [fetchItems]);

  const persistOrder = async (reordered: ConstructionReview[]) => {
    const prev = items;
    setItems(reordered);
    const { error } = await reviewApi.reorder(reordered.map((it) => it.id));
    if (error) { alert('순서 저장 오류', error); setItems(prev); }
  };

  const toggleActive = async (item: ConstructionReview) => {
    const { error } = await reviewApi.setActive(item.id, !item.is_active);
    if (error) alert('상태 변경 오류', error);
    else fetchItems();
  };

  const removeItem = (item: ConstructionReview) => {
    confirm('삭제 확인', `'${item.author_name}'님의 후기를 삭제하시겠습니까?`, async () => {
      const { error } = await reviewApi.remove(item.id);
      if (error) alert('삭제 오류', error);
      else fetchItems();
    });
  };

  const columns: Column<ConstructionReview>[] = [
    {
      key: 'thumb', label: '사진', width: '64px', render: (it) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {it.images && it.images.length > 0
            ? <div style={{ position: 'relative' }}>
                <img src={it.images[0]} alt="" style={{ width: '44px', height: '34px', objectFit: 'cover', borderRadius: '6px', background: '#f1f5f9' }} />
                {it.images.length > 1 && <span style={{ position: 'absolute', right: '-4px', bottom: '-4px', background: '#008b8b', color: '#fff', fontSize: '0.6rem', fontWeight: 700, borderRadius: '999px', padding: '1px 5px' }}>{it.images.length}</span>}
              </div>
            : <span style={{ color: '#cbd5e1' }}>-</span>}
        </div>
      ),
    },
    { key: 'author', label: '작성자', width: '110px', render: (it) => <span style={{ fontWeight: 700, color: '#1e293b' }}>{it.author_name}</span> },
    { key: 'content', label: '내용', width: '1.6fr', align: 'left', render: (it) => <span style={{ color: '#475569', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title ? `[${it.title}] ` : ''}{it.content}</span> },
    { key: 'cat', label: '카테고리', width: '120px', render: (it) => it.construction_categories?.name || '미분류' },
    { key: 'rating', label: '평점', width: '80px', render: (it) => <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#f59e0b', fontWeight: 700 }}><Star size={14} fill="#f59e0b" color="#f59e0b" />{it.rating}</span> },
    { key: 'created_at', label: '등록일', width: '150px', render: (it) => fmtDate(it.created_at) },
    { key: 'updated_at', label: '수정일', width: '150px', render: (it) => fmtDate(it.updated_at) },
    { key: 'created_by', label: '등록자', width: '100px', render: (it) => it.created_by || '-' },
    { key: 'updated_by', label: '수정자', width: '100px', render: (it) => it.updated_by || '-' },
    { key: 'active', label: '활성화', width: '80px', render: (it) => <div style={{ display: 'flex', justifyContent: 'center' }}><ToggleButton isOn={it.is_active} onToggle={() => toggleActive(it)} /></div> },
    {
      key: 'manage', label: '관리', width: '90px', render: (it) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          <button onClick={() => navigate(`/admin/dashboard/construction/reviews/detail/${it.id}`)} title="조회/수정" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} color="#475569" /></button>
          <button onClick={() => removeItem(it)} title="삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} color="#dc2626" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHead
        title="후기 관리"
        desc="사용자가 등록한 시공 후기를 조회·추가·삭제하고 순번/활성화를 관리합니다."
        right={<button style={btnPrimary} onClick={() => navigate('/admin/dashboard/construction/reviews/detail/new')}><Plus size={18} /> 후기 추가</button>}
      />
      <BoardTable
        items={items}
        getId={(it) => it.id}
        columns={columns}
        onReorder={persistOrder}
        loading={loading}
        emptyMessage="등록된 후기가 없습니다."
      />
      {modal}
    </div>
  );
};

export default ConstructionReviewManagement;
