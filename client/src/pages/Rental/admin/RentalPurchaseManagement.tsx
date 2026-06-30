import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { purchaseApi, PURCHASE_STATUS_LABEL, GRADES, type PurchaseInquiry, type PurchaseStatus, type Grade } from '../../../api/rentalApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import { card, inputStyle, PageHead, EmptyState, Spinner, fmtDate, useAdminModal } from '../../Content/Construction/shared';

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;
const STATUS_COLOR: Record<PurchaseStatus, string> = { pending: '#2563eb', approved: '#059669', hold: '#d97706', rejected: '#dc2626' };
const GRADE_COLOR: Record<Grade, string> = { 'C': '#94a3b8', 'B': '#64748b', 'A': '#2563eb', 'A+': '#7c3aed', 'A++': '#db2777' };
const badge = (color: string, label: string) => <span style={{ background: `${color}1a`, color, fontSize: '0.74rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>{label}</span>;

const RentalPurchaseManagement: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<PurchaseInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | PurchaseStatus>('all');
  const [grade, setGrade] = useState<'all' | Grade>('all');
  const { element: modal, alert } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await purchaseApi.list();
    if (error) alert('불러오기 오류', error);
    setItems(data || []);
  }, [alert]);

  useEffect(() => { (async () => { setLoading(true); await fetchItems(); setLoading(false); })(); }, [fetchItems]);

  const view = useMemo(() => items.filter((it) => {
    if (status !== 'all' && it.status !== status) return false;
    if (grade !== 'all' && it.condition_grade !== grade) return false;
    if (search.trim() && !`${it.product_name} ${it.brand_name || ''} ${it.applicant_name || ''} ${it.applicant_phone || ''}`.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  }), [items, search, status, grade]);

  const th: React.CSSProperties = { padding: '12px 14px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: 700, background: '#f8fafc', whiteSpace: 'nowrap' };
  const td: React.CSSProperties = { padding: '12px 14px', fontSize: '0.86rem', color: '#334155', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' };

  return (
    <div>
      <PageHead title="렌탈 입점 문의" desc="중고 매입(입점) 신청을 검토하고 승인/보류/반려 처리합니다." />

      <div style={{ ...card, marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={status} onChange={(e) => setStatus(e.target.value as any)}>
          <option value="all">전체 상태</option>
          <option value="pending">접수</option>
          <option value="approved">승인</option>
          <option value="hold">보류</option>
          <option value="rejected">반려</option>
        </select>
        <select style={{ ...(SELECT_STYLE as React.CSSProperties) }} value={grade} onChange={(e) => setGrade(e.target.value as any)}>
          <option value="all">전체 등급</option>
          {GRADES.map((g) => <option key={g} value={g}>{g}급</option>)}
        </select>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input style={{ ...inputStyle, paddingLeft: '36px' }} placeholder="품목·브랜드·신청자 검색" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{view.length}건</span>
      </div>

      {loading ? <Spinner /> : view.length === 0 ? (
        <EmptyState message="입점 문의가 없습니다." />
      ) : (
        <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '880px' }}>
            <thead>
              <tr>
                <th style={th}>접수일</th>
                <th style={th}>품목</th>
                <th style={th}>브랜드</th>
                <th style={{ ...th, textAlign: 'center' }}>등급</th>
                <th style={{ ...th, textAlign: 'right' }}>희망가</th>
                <th style={th}>신청자</th>
                <th style={{ ...th, textAlign: 'center' }}>상태</th>
                <th style={{ ...th, textAlign: 'center' }}> </th>
              </tr>
            </thead>
            <tbody>
              {view.map((it) => (
                <tr key={it.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/dashboard/rental/purchases/detail/${it.id}`)}>
                  <td style={td}>{fmtDate(it.created_at)}</td>
                  <td style={{ ...td, fontWeight: 700, color: '#1e293b' }}>{it.product_name}</td>
                  <td style={td}>{it.brand_name || '-'}</td>
                  <td style={{ ...td, textAlign: 'center' }}>{badge(GRADE_COLOR[it.condition_grade], `${it.condition_grade}급`)}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>{won(it.desired_price)}</td>
                  <td style={td}>{it.applicant_name || '-'}<div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{it.applicant_phone || ''}</div></td>
                  <td style={{ ...td, textAlign: 'center' }}>{badge(STATUS_COLOR[it.status], PURCHASE_STATUS_LABEL[it.status])}</td>
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

export default RentalPurchaseManagement;
