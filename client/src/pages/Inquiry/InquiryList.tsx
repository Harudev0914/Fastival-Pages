import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Search } from 'lucide-react';
import { supabase } from '../../supabaseClient';

interface Inquiry {
  id: number;
  title: string;
  user_name?: string; // 문의자명
  user_email?: string; // 문의자 이메일
  status: 'pending' | 'replied' | 'hold';
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

  const fetchInquiries = useCallback(async () => {
    // Note: Assuming profiles table exists to join user details
    const { data, error } = await supabase
      .from('inquiries')
      .select('id, title, status, created_at, profiles(full_name, email)')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching inquiries:', error);
    else setInquiries(data?.map((q: any) => ({
        ...q,
        user_name: q.profiles?.full_name || '비회원',
        user_email: q.profiles?.email || '-'
    })) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card" style={{ padding: '24px', backgroundColor: 'white', border: '1px solid rgb(226, 232, 240)', borderRadius: '16px', boxShadow: 'rgba(0, 0, 0, 0.02) 0px 4px 12px' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                <input placeholder="검색어 입력" type="text" style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
                <button style={{ padding: '10px 20px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Search size={18} /></button>
            </div>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid rgb(226, 232, 240)', borderRadius: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.85rem' }}>순번</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem' }}>문의내역</th>
                    <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.85rem' }}>문의자명</th>
                    <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.85rem' }}>문의자 이메일</th>
                    <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.85rem' }}>등록 일자</th>
                    <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.85rem' }}>답변 여부</th>
                    <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.85rem' }}>관리</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" /></td></tr>
                ) : inquiries.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>등록된 문의 내역이 없습니다.</td></tr>
                ) : (
                    inquiries.map((q, index) => (
                    <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>{inquiries.length - index}</td>
                        <td style={{ padding: '16px 24px', fontWeight: 600 }}>{q.title}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>{q.user_name}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>{q.user_email}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>{new Date(q.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            <span style={{ 
                                padding: '6px 12px', 
                                borderRadius: '20px', 
                                fontSize: '0.75rem', 
                                fontWeight: 700,
                                backgroundColor: STATUS_MAP[q.status].bg,
                                color: STATUS_MAP[q.status].color,
                                border: `1px solid ${STATUS_MAP[q.status].border}`
                            }}>
                                {STATUS_MAP[q.status].label}
                            </span>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            <button onClick={() => onViewDetail(q.id)} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem' }}>상세 보기</button>
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default InquiryList;
