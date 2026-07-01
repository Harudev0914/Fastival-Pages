import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, Star } from 'lucide-react';
import { tierApi, type SubscriptionTier } from '../../../api/djApi';
import ToggleButton from '../../../components/UI/ToggleButton';
import BoardTable, { type Column } from '../../../components/admin/BoardTable';
import { PageHead, card, btnPrimary, btnGhost, useAdminModal, FormSection, Row, TextField, TextareaField, SelectField, FormActions, labelStyle } from '../../../components/admin/shared';
import { useAdminPermissions } from '../../../hooks/useAdminPermissions';

const PK = 'subscriptions/tiers';
const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;
const COLORS = [
  { v: '#7c3aed', l: '보라' }, { v: '#db2777', l: '핑크' }, { v: '#2563eb', l: '블루' },
  { v: '#059669', l: '그린' }, { v: '#d97706', l: '앰버' }, { v: '#94a3b8', l: '그레이' },
];

const SubscriptionTiers: React.FC = () => {
  const { can } = useAdminPermissions();
  const [items, setItems] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SubscriptionTier | 'new' | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('0');
  const [months, setMonths] = useState('1');
  const [commission, setCommission] = useState('0');
  const [boost, setBoost] = useState(true);
  const [premium, setPremium] = useState(true);
  const [color, setColor] = useState('#7c3aed');
  const [desc, setDesc] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const { element: modal, alert, confirm } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await tierApi.list();
    if (error) alert('불러오기 오류', error);
    setItems(data || []);
  }, [alert]);
  useEffect(() => { (async () => { setLoading(true); await fetchItems(); setLoading(false); })(); }, [fetchItems]);

  const openNew = () => { setEditing('new'); setName(''); setPrice('0'); setMonths('1'); setCommission('0'); setBoost(true); setPremium(true); setColor('#7c3aed'); setDesc(''); setActive(true); };
  const openEdit = (t: SubscriptionTier) => { setEditing(t); setName(t.name); setPrice(String(t.price)); setMonths(String(t.period_months)); setCommission(String(t.commission_rate)); setBoost(t.priority_boost); setPremium(t.premium_section); setColor(t.color || '#7c3aed'); setDesc(t.description || ''); setActive(t.is_active); };

  const save = async () => {
    if (!name.trim()) return alert('입력 필요', '티어명을 입력해주세요.');
    setSaving(true);
    const input = { name, price: Number(price) || 0, period_months: Number(months) || 0, commission_rate: Number(commission) || 0, priority_boost: boost, premium_section: premium, color, description: desc, is_active: active };
    const { error } = editing === 'new' ? await tierApi.create(input) : await tierApi.update((editing as SubscriptionTier).id, input);
    setSaving(false);
    if (error) return alert('저장 오류', error);
    setEditing(null); fetchItems();
  };
  const toggleActive = async (t: SubscriptionTier) => { const { error } = await tierApi.setActive(t.id, !t.is_active); if (error) alert('오류', error); else fetchItems(); };
  const remove = (t: SubscriptionTier) => confirm('삭제 확인', `'${t.name}' 티어를 삭제하시겠습니까?`, async () => { const { error } = await tierApi.remove(t.id); if (error) alert('삭제 오류', error); else fetchItems(); });
  const persistOrder = async (rows: SubscriptionTier[]) => { const { error } = await tierApi.reorder(rows.map((r) => r.id)); if (error) alert('순서 저장 오류', error); fetchItems(); };

  const columns: Column<SubscriptionTier>[] = [
    { key: 'name', label: '티어', width: '1.2fr', align: 'left', render: (t) => <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#1e293b' }}><span style={{ width: '10px', height: '10px', borderRadius: '3px', background: t.color }} />{t.name}</span> },
    { key: 'price', label: '구독료', width: '110px', render: (t) => t.price ? won(t.price) : '무료' },
    { key: 'months', label: '기간', width: '80px', render: (t) => t.period_months ? `${t.period_months}개월` : '-' },
    { key: 'commission', label: '중개료', width: '90px', render: (t) => t.commission_rate > 0 ? <span style={{ fontWeight: 700, color: '#dc2626' }}>{t.commission_rate}%</span> : <span style={{ fontWeight: 700, color: '#059669' }}>면제</span> },
    { key: 'benefit', label: '혜택', width: '150px', render: (t) => (
      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {t.priority_boost && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', fontWeight: 700, color: '#2563eb', background: '#2563eb14', padding: '2px 7px', borderRadius: '999px' }}><TrendingUp size={11} />상위노출</span>}
        {t.premium_section && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', fontWeight: 700, color: '#7c3aed', background: '#7c3aed14', padding: '2px 7px', borderRadius: '999px' }}><Star size={11} />프리미엄</span>}
        {!t.priority_boost && !t.premium_section && <span style={{ color: '#cbd5e1' }}>-</span>}
      </div>
    ) },
    { key: 'active', label: '활성', width: '70px', render: (t) => <div style={{ display: 'flex', justifyContent: 'center' }}><ToggleButton isOn={t.is_active} onToggle={() => toggleActive(t)} /></div> },
    { key: 'manage', label: '관리', width: '90px', render: (t) => (
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
        {can(PK, 'u') && <button onClick={() => openEdit(t)} title="수정" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} color="#475569" /></button>}
        {can(PK, 'd') && <button onClick={() => remove(t)} title="삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} color="#dc2626" /></button>}
      </div>
    ) },
  ];

  return (
    <div>
      <PageHead
        title="구독 티어 관리"
        desc="구독 등급(티어)의 구독료·기간·중개료·혜택을 정의합니다. 무료 티어의 중개료(수주 수수료)도 여기서 설정합니다."
        right={can(PK, 'c') && !editing ? <button style={btnPrimary} onClick={openNew}><Plus size={18} /> 티어 추가</button> : undefined}
      />

      {editing && (
        <FormSection title={editing === 'new' ? '새 티어 추가' : '티어 수정'}>
          <Row>
            <TextField label="티어명" required value={name} onChange={setName} placeholder="예: 프리미엄 / VIP / 무료" />
            <SelectField label="배지 색상" value={color} onChange={setColor}>
              {COLORS.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
            </SelectField>
          </Row>
          <Row>
            <TextField label="구독료(원)" type="number" value={price} onChange={setPrice} />
            <TextField label="구독 기간(개월)" type="number" value={months} onChange={setMonths} />
            <TextField label="중개료율(%) · 0=면제" type="number" value={commission} onChange={setCommission} placeholder="예: 5" />
          </Row>
          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', margin: '4px 0 6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>상위 노출</label>
              <ToggleButton isOn={boost} onToggle={() => setBoost((v) => !v)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>프리미엄 섹션 노출</label>
              <ToggleButton isOn={premium} onToggle={() => setPremium((v) => !v)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>활성</label>
              <ToggleButton isOn={active} onToggle={() => setActive((v) => !v)} />
            </div>
          </div>
          <TextareaField label="설명" value={desc} onChange={setDesc} placeholder="티어 혜택 안내 문구" minHeight="60px" />
          <FormActions>
            <button style={btnGhost} onClick={() => setEditing(null)}>취소</button>
            <button style={btnPrimary} onClick={save} disabled={saving}>{saving ? '저장 중...' : '저장'}</button>
          </FormActions>
        </FormSection>
      )}

      <div style={{ ...card, marginBottom: '16px', fontSize: '0.84rem', color: '#64748b' }}>
        총 <b style={{ color: '#0f172a' }}>{items.length}</b>개 티어 · 드래그로 노출 순서를 변경할 수 있습니다.
      </div>
      <BoardTable items={items} getId={(t) => t.id} columns={columns} onReorder={can(PK, 'u') ? persistOrder : undefined} loading={loading} emptyMessage="등록된 구독 티어가 없습니다." />
      {modal}
    </div>
  );
};

export default SubscriptionTiers;
