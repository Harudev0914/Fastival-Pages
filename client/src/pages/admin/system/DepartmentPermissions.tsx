import React, { useCallback, useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { departmentApi, ADMIN_MENUS, type Department } from '../../../api/systemApi';
import { card, btnPrimary, EmptyState, Spinner, PageHead, useAdminModal } from '../../../components/admin/shared';

const DepartmentPermissions: React.FC = () => {
  const [items, setItems] = useState<Department[]>([]);
  const [draft, setDraft] = useState<Record<number, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const { element: modal, alert } = useAdminModal();

  const fetchAll = useCallback(async () => {
    const { data, error } = await departmentApi.list();
    if (error) alert('불러오기 오류', error);
    setItems(data || []);
    const d: Record<number, string[]> = {};
    (data || []).forEach((x) => { d[x.id] = Array.isArray(x.menu_keys) ? x.menu_keys : []; });
    setDraft(d);
  }, [alert]);
  useEffect(() => { (async () => { setLoading(true); await fetchAll(); setLoading(false); })(); }, [fetchAll]);

  const toggle = (deptId: number, key: string) => setDraft((p) => {
    const cur = p[deptId] || [];
    return { ...p, [deptId]: cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key] };
  });

  const save = async (deptId: number) => {
    setSavingId(deptId);
    const { error } = await departmentApi.update(deptId, { menu_keys: draft[deptId] || [] });
    setSavingId(null);
    if (error) alert('저장 오류', error); else alert('저장 완료', '접근 권한이 저장되었습니다.');
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '820px' }}>
      <PageHead title="부서별 접근 권한" desc="부서별로 접근 가능한 어드민 메뉴를 부여합니다." />
      {items.length === 0 ? <EmptyState message="먼저 부서를 등록해주세요." /> : items.map((d) => (
        <div key={d.id} style={{ ...card, marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>{d.name}</h3>
            <button style={btnPrimary} onClick={() => save(d.id)} disabled={savingId === d.id}><Save size={16} /> {savingId === d.id ? '저장 중...' : '저장'}</button>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {ADMIN_MENUS.map((m) => {
              const on = (draft[d.id] || []).includes(m.key);
              return (
                <button key={m.key} onClick={() => toggle(d.id, m.key)}
                  style={{ padding: '9px 14px', borderRadius: '999px', cursor: 'pointer', fontSize: '0.86rem', fontWeight: 700,
                    border: on ? '1px solid #008b8b' : '1px solid #e2e8f0', background: on ? '#e0f2f1' : '#fff', color: on ? '#008b8b' : '#64748b' }}>
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {modal}
    </div>
  );
};

export default DepartmentPermissions;
