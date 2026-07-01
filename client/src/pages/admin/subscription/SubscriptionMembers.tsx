import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Crown, Edit2, Zap } from 'lucide-react';
import { djApi, isPremiumActive, type DjArtist, type SubPlan } from '../../../api/djApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import BoardTable, { type Column } from '../../../components/admin/BoardTable';
import { PageHead, card, inputStyle, btnPrimary, btnGhost, useAdminModal, FormSection, Row, TextField, SelectField, FormActions } from '../../../components/admin/shared';
import { ExportBtn } from '../../../components/admin/listTools';
import { exportToCsv } from '../../../utils/exportCsv';
import { useAdminPermissions } from '../../../hooks/useAdminPermissions';

const PK = 'subscriptions/members';
const won = (n: number | null) => (n == null ? '-' : `₩${Number(n).toLocaleString()}`);
const addMonths = (m: number) => { const d = new Date(); d.setMonth(d.getMonth() + m); return d.toISOString().slice(0, 10); };

const planBadge = (a: DjArtist) => {
  if (a.subscription_plan === 'premium') return isPremiumActive(a) ? { label: '프리미엄', color: '#7c3aed' } : { label: '구독 만료', color: '#dc2626' };
  return { label: '무료', color: '#94a3b8' };
};

const SubscriptionMembers: React.FC = () => {
  const { can } = useAdminPermissions();
  const [items, setItems] = useState<DjArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [planF, setPlanF] = useState<'all' | 'premium' | 'free'>('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<DjArtist | null>(null);
  const [plan, setPlan] = useState<SubPlan>('free');
  const [started, setStarted] = useState('');
  const [until, setUntil] = useState('');
  const [fee, setFee] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [saving, setSaving] = useState(false);
  const { element: modal, alert } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await djApi.list();
    if (error) alert('불러오기 오류', error);
    setItems((data || []).filter((a) => a.status === 'approved'));
  }, [alert]);
  useEffect(() => { (async () => { setLoading(true); await fetchItems(); setLoading(false); })(); }, [fetchItems]);

  const view = useMemo(() => items.filter((a) => {
    if (planF === 'premium' && !isPremiumActive(a)) return false;
    if (planF === 'free' && isPremiumActive(a)) return false;
    if (search.trim() && !`${a.name} ${a.stage_name || ''} ${a.phone || ''}`.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  }), [items, planF, search]);

  const openEdit = (a: DjArtist) => {
    setEditing(a); setPlan(a.subscription_plan); setStarted(a.subscription_started || ''); setUntil(a.subscription_until || '');
    setFee(a.subscription_fee != null ? String(a.subscription_fee) : ''); setBirthYear(a.birth_year != null ? String(a.birth_year) : '');
  };
  const grantPremium = () => { setPlan('premium'); setStarted(addMonths(0)); setUntil(addMonths(1)); };
  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await djApi.setSubscription(editing.id, {
      plan, started: started || null, until: plan === 'premium' ? (until || null) : null,
      fee: fee ? Number(fee) : null, birth_year: birthYear ? Number(birthYear) : null,
    });
    setSaving(false);
    if (error) return alert('저장 오류', error);
    setEditing(null); fetchItems();
  };

  const doExport = () => exportToCsv('DJ구독회원', [
    { header: '활동명', value: (a: DjArtist) => a.stage_name || a.name },
    { header: '이름', value: (a) => a.name },
    { header: '연락처', value: (a) => a.phone },
    { header: '지역', value: (a) => (a.regions || []).join(' / ') },
    { header: '플랜', value: (a) => planBadge(a).label },
    { header: '시작일', value: (a) => a.subscription_started },
    { header: '만료일', value: (a) => a.subscription_until },
    { header: '구독료', value: (a) => a.subscription_fee },
  ], view);

  const columns: Column<DjArtist>[] = [
    { key: 'name', label: '활동명/이름', width: '1.3fr', align: 'left', render: (a) => <span style={{ fontWeight: 700, color: '#1e293b', display: 'block' }}>{a.stage_name || a.name}<span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.78rem' }}> · {a.name}</span></span> },
    { key: 'phone', label: '연락처', width: '120px', render: (a) => a.phone || '-' },
    { key: 'region', label: '지역', width: '120px', render: (a) => (a.regions || []).join(', ') || '-' },
    { key: 'plan', label: '플랜', width: '100px', render: (a) => { const b = planBadge(a); return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: `${b.color}18`, color: b.color, fontSize: '0.74rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>{b.color === '#7c3aed' && <Crown size={12} />}{b.label}</span>; } },
    { key: 'until', label: '만료일', width: '120px', render: (a) => a.subscription_plan === 'premium' ? (a.subscription_until || '무기한') : '-' },
    { key: 'fee', label: '구독료', width: '110px', render: (a) => won(a.subscription_fee) },
    { key: 'manage', label: '관리', width: '90px', render: (a) => can(PK, 'u') ? <button onClick={() => openEdit(a)} title="구독 설정" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} color="#475569" /></button> : '-' },
  ];

  return (
    <div>
      <PageHead
        title="구독 회원 목록"
        desc="승인된 DJ 아티스트의 구독(프리미엄)을 관리합니다. 프리미엄 구독 시 중개료 면제 · 상위 노출 · 프리미엄 DJ 섹션에 노출됩니다."
      />

      {editing && can(PK, 'u') && (
        <FormSection title={`구독 설정 — ${editing.stage_name || editing.name}`}>
          <Row>
            <SelectField label="플랜" value={plan} onChange={(v) => setPlan(v as SubPlan)}>
              <option value="free">무료</option>
              <option value="premium">프리미엄</option>
            </SelectField>
            <TextField label="시작일" type="date" value={started} onChange={setStarted} />
            <TextField label="만료일 (비우면 무기한)" type="date" value={until} onChange={setUntil} />
          </Row>
          <Row>
            <TextField label="구독료(원)" type="number" value={fee} onChange={setFee} />
            <TextField label="출생연도 (연령 통계)" type="number" value={birthYear} onChange={setBirthYear} placeholder="예: 1995" />
          </Row>
          <div style={{ marginTop: '6px' }}>
            <button style={{ ...btnGhost, fontSize: '0.82rem', padding: '7px 12px' }} onClick={grantPremium}><Zap size={14} /> 프리미엄 1개월 즉시 적용</button>
          </div>
          <FormActions>
            <button style={btnGhost} onClick={() => setEditing(null)}>취소</button>
            <button style={btnPrimary} onClick={save} disabled={saving}>{saving ? '저장 중...' : '저장'}</button>
          </FormActions>
        </FormSection>
      )}

      <div style={{ ...card, marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={planF} onChange={(e) => setPlanF(e.target.value as any)}>
          <option value="all">전체 플랜</option>
          <option value="premium">프리미엄(활성)</option>
          <option value="free">무료/만료</option>
        </select>
        <input style={{ ...inputStyle, flex: 1, minWidth: '200px' }} placeholder="활동명·이름·연락처 검색" value={search} onChange={(e) => setSearch(e.target.value)} />
        <ExportBtn onClick={doExport} disabled={view.length === 0} />
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{view.length}명</span>
      </div>
      <BoardTable items={view} getId={(a) => a.id} columns={columns} loading={loading} emptyMessage="승인된 DJ 아티스트가 없습니다." pageSize={15} />
      {modal}
    </div>
  );
};

export default SubscriptionMembers;
