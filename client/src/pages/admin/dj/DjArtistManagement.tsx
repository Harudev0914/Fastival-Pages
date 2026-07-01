import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { djApi, DJ_STATUS_LABEL, DJ_REGIONS, type DjArtist, type DjStatus } from '../../../api/djApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import { card, inputStyle, PageHead, EmptyState, Spinner, fmtDate, useAdminModal } from '../../../components/admin/shared';

const STATUS_COLOR: Record<DjStatus, string> = { pending: '#2563eb', approved: '#059669', hold: '#d97706', rejected: '#dc2626' };
const badge = (color: string, label: string) => <span style={{ background: `${color}1a`, color, fontSize: '0.74rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>{label}</span>;

const DjArtistManagement: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<DjArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | DjStatus>('all');
  const [region, setRegion] = useState('all');
  const { element: modal, alert } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await djApi.list();
    if (error) alert('불러오기 오류', error);
    setItems(data || []);
  }, [alert]);
  useEffect(() => { (async () => { setLoading(true); await fetchItems(); setLoading(false); })(); }, [fetchItems]);

  const view = useMemo(() => items.filter((it) => {
    if (status !== 'all' && it.status !== status) return false;
    if (region !== 'all' && !(it.regions || []).includes(region)) return false;
    if (search.trim() && !`${it.name} ${it.stage_name || ''} ${it.phone || ''}`.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  }), [items, search, status, region]);

  const th: React.CSSProperties = { padding: '12px 14px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: 700, background: '#f8fafc', whiteSpace: 'nowrap' };
  const td: React.CSSProperties = { padding: '12px 14px', fontSize: '0.86rem', color: '#334155', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' };

  return (
    <div>
      <PageHead title="DJ 입점 관리" desc="DJ 입점(아티스트 등록) 신청을 검토하고 승인/보류/반려 처리합니다." />

      <div style={{ ...card, marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={status} onChange={(e) => setStatus(e.target.value as any)}>
          <option value="all">전체 상태</option>
          <option value="pending">접수</option>
          <option value="approved">승인</option>
          <option value="hold">보류</option>
          <option value="rejected">반려</option>
        </select>
        <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="all">전체 지역</option>
          {DJ_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input style={{ ...inputStyle, paddingLeft: '36px' }} placeholder="이름·활동명·연락처 검색" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{view.length}건</span>
      </div>

      {loading ? <Spinner /> : view.length === 0 ? <EmptyState message="DJ 입점 신청이 없습니다." /> : (
        <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
            <thead><tr>
              <th style={th}>접수일</th><th style={th}>활동명/이름</th><th style={th}>연락처</th><th style={th}>지역</th><th style={{ ...th, textAlign: 'center' }}>상태</th><th style={{ ...th, textAlign: 'center' }}> </th>
            </tr></thead>
            <tbody>
              {view.map((a) => (
                <tr key={a.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/dashboard/dj/artists/detail/${a.id}`)}>
                  <td style={td}>{fmtDate(a.created_at)}</td>
                  <td style={{ ...td, fontWeight: 700, color: '#1e293b' }}>{a.stage_name || a.name}<div style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.78rem' }}>{a.name}</div></td>
                  <td style={td}>{a.phone || '-'}</td>
                  <td style={td}>{(a.regions || []).join(', ') || '-'}</td>
                  <td style={{ ...td, textAlign: 'center' }}>{badge(STATUS_COLOR[a.status], DJ_STATUS_LABEL[a.status])}</td>
                  <td style={{ ...td, textAlign: 'center' }}><ChevronRight size={16} color="#cbd5e1" /></td>
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

export default DjArtistManagement;
