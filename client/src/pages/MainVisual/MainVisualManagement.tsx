import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, ImageOff, Search } from 'lucide-react';
import { mainVisualApi, SECTION_LABEL, type MainVisual, type MvSection } from '../../api/mainVisualApi';
import { SELECT_STYLE } from '../../components/UI/StyledSelect';
import ToggleButton from '../../components/UI/ToggleButton';
import BoardTable, { type Column } from '../Content/Construction/BoardTable';
import { card, inputStyle, PageHead, btnPrimary, fmtDate, useAdminModal } from '../Content/Construction/shared';

const SECTION_COLOR: Record<string, { bg: string; color: string }> = {
  construction: { bg: '#eff6ff', color: '#2563eb' },
  rental: { bg: '#e0f2f1', color: '#008b8b' },
  dj: { bg: '#f5f3ff', color: '#7c3aed' },
};

const MainVisualManagement: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<MainVisual[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionFilter, setSectionFilter] = useState<MvSection | 'all'>('all');
  const [keyword, setKeyword] = useState('');
  const { element: modal, alert, confirm } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await mainVisualApi.list();
    if (error) alert('불러오기 오류', error);
    setItems(data || []);
  }, [alert]);

  useEffect(() => {
    (async () => { setLoading(true); await fetchItems(); setLoading(false); })();
  }, [fetchItems]);

  const visible = useMemo(() => items.filter((it) => {
    if (sectionFilter !== 'all' && it.section !== sectionFilter) return false;
    if (keyword.trim() && !`${it.title} ${it.subtitle || ''} ${it.badge || ''}`.toLowerCase().includes(keyword.trim().toLowerCase())) return false;
    return true;
  }), [items, sectionFilter, keyword]);

  const persistOrder = async (reordered: MainVisual[]) => {
    // 화면에 보이는 목록 순서대로 display_order 저장
    const prev = items;
    const reorderedIds = reordered.map((r) => r.id);
    setItems((all) => {
      const map = new Map(reordered.map((r, i) => [r.id, i]));
      return [...all].sort((a, b) => (map.has(a.id) && map.has(b.id) ? map.get(a.id)! - map.get(b.id)! : 0));
    });
    const { error } = await mainVisualApi.reorder(reorderedIds);
    if (error) { alert('순서 저장 오류', error); setItems(prev); }
  };

  const toggleActive = async (item: MainVisual) => {
    const { error } = await mainVisualApi.setActive(item.id, !item.is_active);
    if (error) alert('상태 변경 오류', error);
    else fetchItems();
  };

  const removeItem = (item: MainVisual) => {
    confirm('삭제 확인', `'${item.title}' 메인 비주얼을 삭제하시겠습니까?`, async () => {
      const { error } = await mainVisualApi.remove(item.id);
      if (error) alert('삭제 오류', error);
      else fetchItems();
    });
  };

  const columns: Column<MainVisual>[] = [
    {
      key: 'thumb', label: '이미지', width: '72px', render: (it) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {it.image_url
            ? <img src={it.image_url} alt={it.title} style={{ width: '56px', height: '38px', objectFit: 'cover', borderRadius: '6px', background: '#f1f5f9' }} />
            : <div style={{ width: '56px', height: '38px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageOff size={16} color="#cbd5e1" /></div>}
        </div>
      ),
    },
    {
      key: 'section', label: '섹션', width: '90px', render: (it) => {
        const c = SECTION_COLOR[it.section];
        return <span style={{ background: c.bg, color: c.color, fontSize: '0.74rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>{SECTION_LABEL[it.section]}</span>;
      },
    },
    { key: 'title', label: '제목', width: '1.8fr', align: 'left', render: (it) => <span style={{ fontWeight: 700, color: '#1e293b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</span> },
    { key: 'created_at', label: '등록일', width: '140px', render: (it) => fmtDate(it.created_at) },
    { key: 'updated_at', label: '수정일', width: '140px', render: (it) => fmtDate(it.updated_at) },
    { key: 'created_by', label: '등록자', width: '90px', render: (it) => it.created_by || '-' },
    { key: 'updated_by', label: '수정자', width: '90px', render: (it) => it.updated_by || '-' },
    { key: 'active', label: '활성화', width: '80px', render: (it) => <div style={{ display: 'flex', justifyContent: 'center' }}><ToggleButton isOn={it.is_active} onToggle={() => toggleActive(it)} /></div> },
    {
      key: 'manage', label: '관리', width: '90px', render: (it) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          <button onClick={() => navigate(`/admin/dashboard/main-visuals/detail/${it.id}`)} title="수정" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} color="#475569" /></button>
          <button onClick={() => removeItem(it)} title="삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} color="#dc2626" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHead
        title="메인 비주얼 관리"
        desc="시공·렌탈·DJ 메인 비주얼 배너를 통합 관리합니다. (순번 드래그 / 활성화 / 검색)"
        right={<button style={btnPrimary} onClick={() => navigate('/admin/dashboard/main-visuals/detail/new')}><Plus size={18} /> 메인 비주얼 등록</button>}
      />

      {/* 검색 / 섹션 필터 */}
      <div style={{ ...card, marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value as MvSection | 'all')}>
          <option value="all">전체 섹션</option>
          <option value="construction">시공</option>
          <option value="rental">렌탈</option>
          <option value="dj">DJ</option>
        </select>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input style={{ ...inputStyle, paddingLeft: '36px' }} placeholder="제목·문구 검색" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>
        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{visible.length}건</span>
      </div>

      <BoardTable
        items={visible}
        getId={(it) => it.id}
        columns={columns}
        onReorder={persistOrder}
        loading={loading}
        emptyMessage="등록된 메인 비주얼이 없습니다."
      />
      {modal}
    </div>
  );
};

export default MainVisualManagement;
