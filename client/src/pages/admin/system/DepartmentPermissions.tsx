import React, { useCallback, useEffect, useState } from 'react';
import { Save, Check } from 'lucide-react';
import { departmentApi, ADMIN_MENU_TREE, ALL_MENU_KEYS, type Department } from '../../../api/systemApi';
import { card, btnPrimary, btnGhost, EmptyState, Spinner, PageHead, useAdminModal } from '../../../components/admin/shared';

const DepartmentPermissions: React.FC = () => {
  const [items, setItems] = useState<Department[]>([]);
  const [draft, setDraft] = useState<Record<number, Set<string>>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const { element: modal, alert } = useAdminModal();

  const fetchAll = useCallback(async () => {
    const { data, error } = await departmentApi.list();
    if (error) alert('불러오기 오류', error);
    setItems(data || []);
    const d: Record<number, Set<string>> = {};
    (data || []).forEach((x) => { d[x.id] = new Set(Array.isArray(x.menu_keys) ? x.menu_keys : []); });
    setDraft(d);
  }, [alert]);
  useEffect(() => { (async () => { setLoading(true); await fetchAll(); setLoading(false); })(); }, [fetchAll]);

  const has = (id: number, key: string) => draft[id]?.has(key);
  const setKeys = (id: number, fn: (s: Set<string>) => void) => setDraft((p) => {
    const next = new Set(p[id] || []); fn(next); return { ...p, [id]: next };
  });
  const toggle = (id: number, key: string) => setKeys(id, (s) => { if (s.has(key)) s.delete(key); else s.add(key); });
  const toggleGroup = (id: number, keys: string[], on: boolean) => setKeys(id, (s) => keys.forEach((k) => (on ? s.add(k) : s.delete(k))));
  const setAll = (id: number, on: boolean) => setDraft((p) => ({ ...p, [id]: new Set(on ? ALL_MENU_KEYS : []) }));

  const save = async (id: number) => {
    setSavingId(id);
    const { error } = await departmentApi.update(id, { menu_keys: [...(draft[id] || [])] });
    setSavingId(null);
    if (error) alert('저장 오류', error); else alert('저장 완료', '접근 권한이 저장되었습니다.');
  };

  if (loading) return <Spinner />;

  const pill = (on: boolean): React.CSSProperties => ({
    padding: '8px 13px', borderRadius: '999px', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700,
    border: on ? '1px solid #008b8b' : '1px solid #e2e8f0', background: on ? '#e0f2f1' : '#fff', color: on ? '#008b8b' : '#64748b',
    display: 'inline-flex', alignItems: 'center', gap: '5px',
  });

  return (
    <div style={{ maxWidth: '900px' }}>
      <PageHead title="부서별 접근 권한" desc="부서별로 접근 가능한 어드민 메뉴를 2Depth 세부 메뉴 단위로 부여합니다." />
      {items.length === 0 ? <EmptyState message="먼저 부서를 등록해주세요." /> : items.map((d) => {
        const all = ALL_MENU_KEYS.every((k) => has(d.id, k));
        return (
          <div key={d.id} style={{ ...card, marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '10px', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>{d.name}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={btnGhost} onClick={() => setAll(d.id, !all)}>{all ? '전체 해제' : '전체 선택'}</button>
                <button style={btnPrimary} onClick={() => save(d.id)} disabled={savingId === d.id}><Save size={16} /> {savingId === d.id ? '저장 중...' : '저장'}</button>
              </div>
            </div>

            {ADMIN_MENU_TREE.map((g) => {
              const groupKeys = g.items.length ? g.items.map((i) => i.key) : [g.key];
              const groupAll = groupKeys.every((k) => has(d.id, k));
              return (
                <div key={g.key} style={{ borderTop: '1px solid #f1f5f9', padding: '14px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: g.items.length ? '10px' : 0 }}>
                    <button
                      onClick={() => (g.items.length ? toggleGroup(d.id, groupKeys, !groupAll) : toggle(d.id, g.key))}
                      style={{ ...pill(g.items.length ? groupAll : !!has(d.id, g.key)), fontSize: '0.9rem' }}
                    >
                      {(g.items.length ? groupAll : has(d.id, g.key)) && <Check size={14} />}{g.label}
                      {g.items.length ? <span style={{ fontWeight: 400, opacity: 0.7 }}>(전체)</span> : null}
                    </button>
                  </div>
                  {g.items.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingLeft: '14px' }}>
                      {g.items.map((it) => (
                        <button key={it.key} onClick={() => toggle(d.id, it.key)} style={pill(!!has(d.id, it.key))}>
                          {has(d.id, it.key) && <Check size={13} />}{it.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
      {modal}
    </div>
  );
};

export default DepartmentPermissions;
