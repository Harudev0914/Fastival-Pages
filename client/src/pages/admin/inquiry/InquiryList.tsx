import React, { useCallback, useEffect, useState } from 'react';
import { Trash2, Eye } from 'lucide-react';
import { inquiryApi, type ConstructionInquiry, type InquiryStatus } from '../../../api/constructionApi';
import { card, th, td, EmptyState, Spinner, fmtDate, useAdminModal, PageHead } from '../../../components/admin/shared';

export const STATUS_MAP: Record<InquiryStatus, { label: string; bg: string; color: string; border: string }> = {
  pending: { label: '대기중', bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
  replied: { label: '답변완료', bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
  hold: { label: '보류', bg: '#fffbeb', color: '#d97706', border: '#fcd34d' },
};

const InquiryList: React.FC<{ onViewDetail: (id: number) => void }> = ({ onViewDetail }) => {
  const [items, setItems] = useState<ConstructionInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const { element: modal, alert, confirm } = useAdminModal();

  const fetchItems = useCallback(async () => {
    const { data, error } = await inquiryApi.list();
    if (error) alert('불러오기 오류', error);
    setItems(data || []);
  }, [alert]);

  useEffect(() => {
    (async () => { setLoading(true); await fetchItems(); setLoading(false); })();
  }, [fetchItems]);

  const removeItem = (item: ConstructionInquiry) => {
    confirm('삭제 확인', `'${item.name || '비회원'}'님의 문의를 삭제하시겠습니까?`, async () => {
      const { error } = await inquiryApi.remove(item.id);
      if (error) alert('삭제 오류', error);
      else fetchItems();
    });
  };

  return (
    <div>
      <PageHead title="시공 문의 내역" desc="시공 문의 챗봇을 통해 접수된 신청 내역을 조회·관리합니다." />

      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ ...th, width: '56px' }}>순번</th>
                <th style={{ ...th, textAlign: 'left' }}>신청자</th>
                <th style={th}>연락처</th>
                <th style={th}>이메일</th>
                <th style={th}>신청일</th>
                <th style={th}>상태</th>
                <th style={th}>관리</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7}><Spinner /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7}><EmptyState message="등록된 문의 내역이 없습니다." /></td></tr>
              ) : (
                items.map((q, index) => (
                  <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={td}>{items.length - index}</td>
                    <td style={{ ...td, textAlign: 'left', fontWeight: 700, color: '#1e293b' }}>{q.name || '비회원'}</td>
                    <td style={td}>{q.phone || '-'}</td>
                    <td style={td}>{q.email || '-'}</td>
                    <td style={td}>{fmtDate(q.created_at)}</td>
                    <td style={td}>
                      <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700, backgroundColor: STATUS_MAP[q.status].bg, color: STATUS_MAP[q.status].color, border: `1px solid ${STATUS_MAP[q.status].border}` }}>
                        {STATUS_MAP[q.status].label}
                      </span>
                    </td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button onClick={() => onViewDetail(q.id)} title="상세 보기" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Eye size={16} color="#008b8b" /></button>
                        <button onClick={() => removeItem(q)} title="삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} color="#dc2626" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {modal}
    </div>
  );
};

export default InquiryList;
