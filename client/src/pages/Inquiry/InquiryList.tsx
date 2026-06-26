import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';

interface Inquiry {
  id: number;
  user_id: number;
  title: string;
  status: string;
  created_at: string;
}

const STATUS_MAP = {
  pending: { label: '대기중', bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
  replied: { label: '답변완료', bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
  hold: { label: '보류', bg: '#fffbeb', color: '#d97706', border: '#fcd34d' }
};

const InquiryList: React.FC<{ onViewDetail: (id: number) => void }> = ({ onViewDetail }) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    
    // Check if user is authenticated
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.error('User not authenticated');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('inquiries')
      .select('id, user_id, title, status, created_at')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching inquiries:', error);
    else setInquiries(data || []);
    setLoading(false);
  };

  const inputStyle = { padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', minWidth: '240px', boxShadow: 'rgba(0, 0, 0, 0.05) 0px 1px 2px 0px', transition: 'border-color 0.2s, box-shadow 0.2s' };
  const selectStyle = { padding: '10px 36px 10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontSize: '0.9rem', outline: 'none', cursor: 'pointer', boxShadow: 'rgba(0, 0, 0, 0.05) 0px 1px 2px 0px', transition: 'border-color 0.2s, box-shadow 0.2s', appearance: 'none' as const, backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' };
  const labelStyle = { fontSize: '0.8rem', fontWeight: 600, color: 'rgb(100, 116, 139)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card" style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', padding: '24px', backgroundColor: 'white', border: '1px solid rgb(226, 232, 240)', borderRadius: '16px', boxShadow: 'rgba(0, 0, 0, 0.02) 0px 4px 12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>검색어 입력</label>
          <input placeholder="작성자 또는 제목 검색" type="text" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>정렬 기준</label>
          <select style={selectStyle}>
            <option value="desc">최신순 정렬</option>
            <option value="asc">오래된순 정렬</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>확인 상태</label>
          <select style={selectStyle}>
            <option value="All">확인 여부 전체</option>
            <option value="pending">대기중</option>
            <option value="replied">답변완료</option>
            <option value="hold">보류</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /></div>
        ) : inquiries.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>등록된 문의 내역이 없습니다.</div>
        ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f1f5f9' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>번호</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>작성자</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>제목</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>작성일</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>확인 상태</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>관리</th>
                </tr>
            </thead>
            <tbody>
                {inquiries.map((q) => (
                <tr key={q.id} className="table-row" style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: '#475569' }}>{q.id}</td>
                    <td style={{ padding: '16px 24px', fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{q.user_id}</td>
                    <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: '#334155' }}>{q.title}</td>
                    <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: '#64748b' }}>{new Date(q.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <span style={{ 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '0.75rem', 
                        fontWeight: 700,
                        backgroundColor: STATUS_MAP[q.status as keyof typeof STATUS_MAP]?.bg || '#f1f5f9',
                        color: STATUS_MAP[q.status as keyof typeof STATUS_MAP]?.color || '#475569',
                        border: `1px solid ${STATUS_MAP[q.status as keyof typeof STATUS_MAP]?.border || '#cbd5e1'}`
                    }}>
                        {STATUS_MAP[q.status as keyof typeof STATUS_MAP]?.label || '상태확인필요'}
                    </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <button onClick={() => onViewDetail(q.id)} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 2px 4px rgba(0,139,139,0.2)' }}>상세 보기</button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        )}
      </div>
    </div>
  );
};

export default InquiryList;
