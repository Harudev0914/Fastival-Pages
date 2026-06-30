import React, { useCallback, useEffect, useState } from 'react';
import { Save, ChevronDown } from 'lucide-react';
import { departmentApi, ADMIN_MENU_TREE, ACTIONS, SUPER_DEPT_NAME, type Department, type ActionPerm } from '../../../api/systemApi';
import { card, btnPrimary, btnGhost, EmptyState, Spinner, PageHead, useAdminModal } from '../../../components/admin/shared';

// 트리 → 리프(2Depth) 목록 (그룹 라벨 포함)
const GROUPS = ADMIN_MENU_TREE.map((g) => ({
  label: g.label,
  leaves: g.items.length ? g.items : [{ key: g.key, label: g.label }],
}));

const emptyPerm = (): ActionPerm => ({ r: false, c: false, u: false, d: false });

const DepartmentPermissions: React.FC = () => {
  const [items, setItems] = useState<Department[]>([]);
  const [draft, setDraft] = useState<Record<number, Record<string, ActionPerm>>>({});
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const { element: modal, alert } = useAdminModal();

  const fetchAll = useCallback(async () => {
    const { data, error } = await departmentApi.list();
    if (error) alert('불러오기 오류', error);
    // 최상위 관리자 부서는 항상 전체 권한 → 설정 화면에서 숨김
    const list = (data || []).filter((dep) => dep.name !== SUPER_DEPT_NAME);
    setItems(list);
    const d: Record<number, Record<string, ActionPerm>> = {};
    list.forEach((dep) => { d[dep.id] = { ...(dep.permissions || {}) }; });
    setDraft(d);
  }, [alert]);
  useEffect(() => { (async () => { setLoading(true); await fetchAll(); setLoading(false); })(); }, [fetchAll]);

  const perm = (depId: number, key: string): ActionPerm => draft[depId]?.[key] || emptyPerm();
  const setPerm = (depId: number, key: string, patch: Partial<ActionPerm>) => setDraft((p) => ({
    ...p, [depId]: { ...(p[depId] || {}), [key]: { ...(p[depId]?.[key] || emptyPerm()), ...patch } },
  }));
  const toggleRowAll = (depId: number, key: string, on: boolean) => setPerm(depId, key, { r: on, c: on, u: on, d: on });
  const setAll = (depId: number, on: boolean) => setDraft((p) => {
    const all: Record<string, ActionPerm> = {};
    GROUPS.forEach((g) => g.leaves.forEach((l) => { all[l.key] = { r: on, c: on, u: on, d: on }; }));
    return { ...p, [depId]: all };
  });

  const save = async (depId: number) => {
    setSavingId(depId);
    const permissions = draft[depId] || {};
    const menu_keys = Object.entries(permissions).filter(([, v]) => v.r || v.c || v.u || v.d).map(([k]) => k);
    const { error } = await departmentApi.update(depId, { permissions, menu_keys });
    setSavingId(null);
    if (error) alert('저장 오류', error); else alert('저장 완료', '접근 권한이 저장되었습니다.');
  };

  if (loading) return <Spinner />;

  const th: React.CSSProperties = { padding: '8px 6px', fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textAlign: 'center' };
  const cellChk = (depId: number, key: string, k: keyof ActionPerm) => (
    <td style={{ textAlign: 'center', padding: '6px' }}>
      <input type="checkbox" style={{ width: 16, height: 16, accentColor: '#008b8b', cursor: 'pointer' }}
        checked={perm(depId, key)[k]} onChange={(e) => setPerm(depId, key, { [k]: e.target.checked })} />
    </td>
  );

  return (
    <div style={{ maxWidth: '760px' }}>
      <PageHead title="부서별 접근 권한" desc="부서별로 2Depth 메뉴마다 조회·추가·수정·삭제 권한을 부여합니다." />
      {items.length === 0 ? <EmptyState message="먼저 부서를 등록해주세요." /> : items.map((dep) => (
        <div key={dep.id} style={{ ...card, marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', cursor: 'pointer' }} onClick={() => setOpen((o) => ({ ...o, [dep.id]: !o[dep.id] }))}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ChevronDown size={18} style={{ transform: open[dep.id] ? 'none' : 'rotate(-90deg)', transition: 'transform 0.15s', color: '#94a3b8' }} />
              {dep.name}
            </h3>
            {open[dep.id] && (
              <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                <button style={btnGhost} onClick={() => setAll(dep.id, true)}>전체 허용</button>
                <button style={btnGhost} onClick={() => setAll(dep.id, false)}>전체 해제</button>
                <button style={btnPrimary} onClick={() => save(dep.id)} disabled={savingId === dep.id}><Save size={16} /> {savingId === dep.id ? '저장 중...' : '저장'}</button>
              </div>
            )}
          </div>
          {open[dep.id] && (
          <div style={{ overflowX: 'auto', marginTop: '14px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ ...th, textAlign: 'left' }}>메뉴</th>
                  {ACTIONS.map((a) => <th key={a.k} style={th}>{a.label}</th>)}
                  <th style={th}>전체</th>
                </tr>
              </thead>
              <tbody>
                {GROUPS.map((g) => (
                  <React.Fragment key={g.label}>
                    <tr><td colSpan={6} style={{ padding: '10px 6px 4px', fontSize: '0.8rem', fontWeight: 800, color: '#008b8b' }}>{g.label}</td></tr>
                    {g.leaves.map((l) => {
                      const p = perm(dep.id, l.key);
                      const rowAll = p.r && p.c && p.u && p.d;
                      return (
                        <tr key={l.key} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '6px 6px 6px 18px', fontSize: '0.86rem', color: '#334155' }}>{l.label}</td>
                          {ACTIONS.map((a) => <React.Fragment key={a.k}>{cellChk(dep.id, l.key, a.k)}</React.Fragment>)}
                          <td style={{ textAlign: 'center', padding: '6px' }}>
                            <input type="checkbox" style={{ width: 16, height: 16, accentColor: '#1e293b', cursor: 'pointer' }} checked={rowAll} onChange={(e) => toggleRowAll(dep.id, l.key, e.target.checked)} />
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      ))}
      {modal}
    </div>
  );
};

export default DepartmentPermissions;
