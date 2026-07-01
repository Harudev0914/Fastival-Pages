import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { departmentApi, SUPER_DEPT_NAME, type Department } from '../../../api/systemApi';
import { card, inputStyle, btnPrimary, th, td, EmptyState, Spinner, PageHead, fmtDate, useAdminModal } from '../../../components/admin/shared';

const DepartmentManagement: React.FC = () => {
  const [items, setItems] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [edit, setEdit] = useState<Record<number, string>>({});
  const { element: modal, alert, confirm } = useAdminModal();

  const fetchAll = useCallback(async () => {
    const { data, error } = await departmentApi.list();
    if (error) alert('불러오기 오류', error);
    // 최상위 관리자 부서는 부서 관리에서 숨김
    setItems((data || []).filter((d) => d.name !== SUPER_DEPT_NAME));
  }, [alert]);
  useEffect(() => { (async () => { setLoading(true); await fetchAll(); setLoading(false); })(); }, [fetchAll]);

  const add = async () => {
    if (!name.trim()) return;
    const { error } = await departmentApi.create(name);
    if (error) alert('생성 오류', error); else { setName(''); fetchAll(); }
  };
  const rename = async (id: number) => {
    const v = edit[id]; if (v == null) return;
    const { error } = await departmentApi.update(id, { name: v.trim() });
    if (error) alert('수정 오류', error); else { setEdit((e) => { const n = { ...e }; delete n[id]; return n; }); fetchAll(); }
  };
  const remove = (d: Department) => confirm('삭제 확인', `'${d.name}' 부서를 삭제하시겠습니까?`, async () => {
    const { error } = await departmentApi.remove(d.id);
    if (error) alert('삭제 오류', error); else fetchAll();
  });

  return (
    <div style={{ maxWidth: '720px' }}>
      <PageHead title="부서 관리" desc="부서를 생성·수정·삭제합니다." />

      <div style={{ ...card, marginBottom: '16px', display: 'flex', gap: '10px' }}>
        <input style={{ ...inputStyle, flex: 1 }} placeholder="새 부서명" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
        <button style={btnPrimary} onClick={add}><Plus size={18} /> 부서 추가</button>
      </div>

      {loading ? <Spinner /> : items.length === 0 ? <EmptyState message="등록된 부서가 없습니다." /> : (
        <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={{ ...th, textAlign: 'left' }}>부서명</th><th style={th}>생성일</th><th style={{ ...th, textAlign: 'center', width: '120px' }}>관리</th></tr></thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.id}>
                  <td style={{ ...td, textAlign: 'left' }}>
                    <input style={{ ...inputStyle, padding: '8px 10px' }} value={edit[d.id] ?? d.name} onChange={(e) => setEdit((p) => ({ ...p, [d.id]: e.target.value }))} />
                  </td>
                  <td style={td}>{fmtDate(d.created_at)}</td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      {edit[d.id] != null && edit[d.id] !== d.name && <button onClick={() => rename(d.id)} title="저장" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Save size={16} color="#008b8b" /></button>}
                      <button onClick={() => remove(d)} title="삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} color="#dc2626" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modal}
    </div>
  );
};

export default DepartmentManagement;
