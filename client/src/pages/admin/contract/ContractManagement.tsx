import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, FileText, X } from 'lucide-react';
import { contractApi, CONTRACT_STATUS_LABEL, type Contract, type ContractStatus } from '../../../api/contractApi';
import { TEMPLATES, TEMPLATE_LIST } from './contractTemplates';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import BoardTable, { type Column } from '../../../components/admin/BoardTable';
import { PageHead, btnPrimary, inputStyle, card, fmtDate, useAdminModal } from '../../../components/admin/shared';
import { useAdminPermissions } from '../../../hooks/useAdminPermissions';

const PK = 'contracts';
const statusBadge = (s: ContractStatus) => {
  const color = s === 'completed' ? '#059669' : '#64748b';
  return <span style={{ background: `${color}1a`, color, fontSize: '0.74rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>{CONTRACT_STATUS_LABEL[s]}</span>;
};

const ContractManagement: React.FC = () => {
  const navigate = useNavigate();
  const { can } = useAdminPermissions();
  const [items, setItems] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tpl, setTpl] = useState('all');
  const [pickOpen, setPickOpen] = useState(false);
  const { element: modal, alert, confirm } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await contractApi.list();
    if (error) alert('불러오기 오류', error);
    setItems(data || []);
  }, [alert]);
  useEffect(() => { (async () => { setLoading(true); await fetchItems(); setLoading(false); })(); }, [fetchItems]);

  const view = useMemo(() => items.filter((it) => {
    if (tpl !== 'all' && it.template !== tpl) return false;
    if (search.trim() && !`${it.title} ${it.customer_name || ''}`.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  }), [items, search, tpl]);

  const removeItem = (item: Contract) => confirm('삭제 확인', `'${item.title}' 계약서를 삭제하시겠습니까?`, async () => {
    const { error } = await contractApi.remove(item.id);
    if (error) alert('삭제 오류', error); else fetchItems();
  });

  const columns: Column<Contract>[] = [
    { key: 'tpl', label: '양식', width: '150px', render: (it) => <span style={{ fontWeight: 700, color: '#008b8b' }}>{TEMPLATES[it.template]?.label || it.template}</span> },
    { key: 'title', label: '제목', width: '1.5fr', align: 'left', render: (it) => <span style={{ fontWeight: 700, color: '#1e293b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</span> },
    { key: 'customer', label: '상대방', width: '130px', render: (it) => it.customer_name || '-' },
    { key: 'created', label: '작성일', width: '130px', render: (it) => fmtDate(it.created_at) },
    { key: 'status', label: '상태', width: '90px', render: (it) => <div style={{ display: 'flex', justifyContent: 'center' }}>{statusBadge(it.status)}</div> },
    {
      key: 'manage', label: '관리', width: '90px', render: (it) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          {can(PK, 'u') && <button onClick={() => navigate(`/admin/dashboard/contracts/detail/${it.id}`)} title="수정" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} color="#475569" /></button>}
          {can(PK, 'd') && <button onClick={() => removeItem(it)} title="삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} color="#dc2626" /></button>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHead
        title="계약서 관리"
        desc="양식을 선택해 계약서를 작성하고, 워드형 미리보기로 확인 후 PDF로 다운로드합니다."
        right={can(PK, 'c') ? <button style={btnPrimary} onClick={() => setPickOpen(true)}><Plus size={18} /> 작성하기</button> : undefined}
      />

      <div style={{ ...card, marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={tpl} onChange={(e) => setTpl(e.target.value)}>
          <option value="all">전체 양식</option>
          {TEMPLATE_LIST.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
        <input style={{ ...inputStyle, flex: 1, minWidth: '200px' }} placeholder="제목·상대방 검색" value={search} onChange={(e) => setSearch(e.target.value)} />
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{view.length}건</span>
      </div>

      <BoardTable items={view} getId={(it) => it.id} columns={columns} loading={loading} emptyMessage="작성된 계약서가 없습니다. ‘작성하기’로 양식을 선택하세요." />

      {/* 양식 선택 모달 */}
      {pickOpen && (
        <div onClick={() => setPickOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>양식 선택</h3>
              <button onClick={() => setPickOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#64748b" /></button>
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              {TEMPLATE_LIST.map((t) => (
                <button key={t.key} onClick={() => navigate(`/admin/dashboard/contracts/new/${t.key}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', background: '#fff', cursor: 'pointer' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0f2f1', color: '#008b8b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FileText size={20} /></div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#1e293b' }}>{t.label}</div>
                    <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {modal}
    </div>
  );
};

export default ContractManagement;
