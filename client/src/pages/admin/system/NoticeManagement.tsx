import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, Pin, PinOff, ChevronRight } from 'lucide-react';
import { adminNoticeApi, type AdminNotice } from '../../../api/systemApi';
import BoardTable, { type Column } from '../../../components/admin/BoardTable';
import { PageHead, card, btnPrimary, btnGhost, fmtDate, useAdminModal, FormSection, TextField, TextareaField, FormActions } from '../../../components/admin/shared';
import { useAdminPermissions } from '../../../hooks/useAdminPermissions';

const PK = 'notices';

const NoticeManagement: React.FC = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { can } = useAdminPermissions();
  const [items, setItems] = useState<AdminNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminNotice | 'new' | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);
  const [saving, setSaving] = useState(false);
  const { element: modal, alert, confirm } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await adminNoticeApi.list();
    if (error) alert('불러오기 오류', error);
    setItems(data || []);
  }, [alert]);
  useEffect(() => { (async () => { setLoading(true); await fetchItems(); setLoading(false); })(); }, [fetchItems]);

  const openNew = () => { setEditing('new'); setTitle(''); setContent(''); setPinned(false); };
  const openEdit = (n: AdminNotice) => { setEditing(n); setTitle(n.title); setContent(n.content || ''); setPinned(n.pinned); };
  const close = () => setEditing(null);

  // 상세 페이지의 '수정' 진입(?edit=id) 처리
  useEffect(() => {
    const eid = params.get('edit');
    if (eid && items.length) {
      const found = items.find((n) => String(n.id) === eid);
      if (found) { openEdit(found); params.delete('edit'); setParams(params, { replace: true }); }
    }
  }, [items, params, setParams]);

  const save = async () => {
    if (!title.trim()) return alert('입력 필요', '공지 제목을 입력해주세요.');
    setSaving(true);
    const input = { title, content, pinned };
    const { error } = editing === 'new' ? await adminNoticeApi.create(input) : await adminNoticeApi.update((editing as AdminNotice).id, input);
    setSaving(false);
    if (error) return alert('저장 오류', error);
    close(); fetchItems();
  };
  const togglePin = async (n: AdminNotice) => {
    const { error } = await adminNoticeApi.setPinned(n.id, !n.pinned);
    if (error) alert('오류', error); else fetchItems();
  };
  const remove = (n: AdminNotice) => confirm('공지 삭제', `'${n.title}' 공지를 삭제하시겠습니까?`, async () => {
    const { error } = await adminNoticeApi.remove(n.id);
    if (error) alert('삭제 오류', error); else { if (editing !== 'new' && (editing as AdminNotice)?.id === n.id) close(); fetchItems(); }
  });

  const columns: Column<AdminNotice>[] = [
    { key: 'pin', label: '고정', width: '64px', render: (n) => can(PK, 'u')
      ? <button onClick={() => togglePin(n)} title={n.pinned ? '고정 해제' : '상단 고정'} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>{n.pinned ? <Pin size={16} color="#f59e0b" /> : <PinOff size={16} color="#cbd5e1" />}</button>
      : (n.pinned ? <Pin size={16} color="#f59e0b" /> : '-') },
    { key: 'title', label: '제목', width: '1.6fr', align: 'left', render: (n) => (
      <button onClick={() => navigate(`/admin/dashboard/notices/detail/${n.id}`)} title="상세 보기"
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', width: '100%', display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden' }}>
        <span style={{ fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.pinned && <span style={{ color: '#f59e0b', marginRight: '5px' }}>[고정]</span>}{n.title}</span>
        <ChevronRight size={14} color="#cbd5e1" style={{ flexShrink: 0 }} />
      </button>
    ) },
    { key: 'by', label: '작성자', width: '120px', render: (n) => n.created_by || '-' },
    { key: 'at', label: '작성일', width: '150px', render: (n) => fmtDate(n.created_at) },
    { key: 'manage', label: '관리', width: '90px', render: (n) => (
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
        {can(PK, 'u') && <button onClick={() => openEdit(n)} title="수정" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} color="#475569" /></button>}
        {can(PK, 'd') && <button onClick={() => remove(n)} title="삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} color="#dc2626" /></button>}
      </div>
    ) },
  ];

  return (
    <div>
      <PageHead
        title="사내 공지사항"
        desc="관리자 대시보드 상단에 노출되는 사내 공지를 등록·관리합니다. 고정(핀)한 공지는 항상 위에 표시됩니다."
        right={can(PK, 'c') && !editing ? <button style={btnPrimary} onClick={openNew}><Plus size={18} /> 공지 작성</button> : undefined}
      />

      {editing && (
        <FormSection title={editing === 'new' ? '새 공지 작성' : '공지 수정'}>
          <div style={{ display: 'grid', gap: '14px' }}>
            <TextField label="제목" required value={title} onChange={setTitle} placeholder="공지 제목" />
            <TextareaField label="내용" value={content} onChange={setContent} placeholder="공지 내용(선택)" minHeight="110px" />
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
              <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} style={{ width: '17px', height: '17px', accentColor: '#008b8b', cursor: 'pointer' }} />
              <Pin size={14} color="#f59e0b" /> 상단 고정
            </label>
          </div>
          <FormActions>
            <button style={btnGhost} onClick={close}>취소</button>
            <button style={btnPrimary} onClick={save} disabled={saving}>{saving ? '저장 중...' : '저장'}</button>
          </FormActions>
        </FormSection>
      )}

      <div style={{ ...card, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '0.86rem', color: '#64748b' }}>총 <b style={{ color: '#0f172a' }}>{items.length}</b>건의 공지 · 고정 {items.filter((n) => n.pinned).length}건</span>
      </div>

      <BoardTable items={items} getId={(n) => n.id} columns={columns} loading={loading} emptyMessage="등록된 공지가 없습니다." pageSize={15} />
      {modal}
    </div>
  );
};

export default NoticeManagement;
