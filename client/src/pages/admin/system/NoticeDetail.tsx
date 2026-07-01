import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pin, Edit2, Trash2 } from 'lucide-react';
import { adminNoticeApi, type AdminNotice } from '../../../api/systemApi';
import { card, btnGhost, fmtDate, useAdminModal, Spinner, DetailHead, StatusPill } from '../../../components/admin/shared';
import { useAdminPermissions } from '../../../hooks/useAdminPermissions';

const LIST = '/admin/dashboard/notices';
const PK = 'notices';

const NoticeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = useAdminPermissions();
  const [item, setItem] = useState<AdminNotice | null>(null);
  const [loading, setLoading] = useState(true);
  const { element: modal, alert, confirm } = useAdminModal();

  const load = useCallback(async () => {
    const { data, error } = await adminNoticeApi.get(id!);
    if (error) alert('불러오기 오류', error);
    setItem(data || null);
    setLoading(false);
  }, [id, alert]);
  useEffect(() => { load(); }, [load]);

  const remove = () => confirm('공지 삭제', `'${item?.title}' 공지를 삭제하시겠습니까?`, async () => {
    const { error } = await adminNoticeApi.remove(id!);
    if (error) alert('삭제 오류', error); else navigate(LIST);
  });

  if (loading) return <Spinner />;
  if (!item) return (
    <div>
      <DetailHead title="사내 공지" onBack={() => navigate(LIST)} />
      <div style={card}>공지를 찾을 수 없습니다.</div>
    </div>
  );

  return (
    <div style={{ maxWidth: '820px' }}>
      <DetailHead
        title="사내 공지"
        onBack={() => navigate(LIST)}
        badge={item.pinned ? <StatusPill label="상단 고정" color="#f59e0b" /> : undefined}
        right={
          <div style={{ display: 'flex', gap: '8px' }}>
            {can(PK, 'u') && <button style={btnGhost} onClick={() => navigate(`${LIST}?edit=${item.id}`)}><Edit2 size={15} /> 수정</button>}
            {can(PK, 'd') && <button style={{ ...btnGhost, color: '#dc2626', borderColor: '#fecaca' }} onClick={remove}><Trash2 size={15} /> 삭제</button>}
          </div>
        }
      />

      <div style={{ ...card, padding: '28px 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          {item.pinned && <Pin size={16} color="#f59e0b" />}
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{item.title}</h2>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8', paddingBottom: '18px', borderBottom: '1px solid #f1f5f9' }}>
          {item.created_by || '관리자'} · {fmtDate(item.created_at)}
        </div>
        <div style={{ marginTop: '20px', fontSize: '0.95rem', color: '#334155', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          {item.content || <span style={{ color: '#94a3b8' }}>내용이 없습니다.</span>}
        </div>
      </div>
      {modal}
    </div>
  );
};

export default NoticeDetail;
