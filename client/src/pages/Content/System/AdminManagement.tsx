import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Trash2, Edit2, Plus } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import Modal from '../../../components/Modal';

interface Admin {
  id: number;
  email: string;
  name: string;
  department: '영업팀' | '운영팀';
  phone_number: string;
}

const AdminManagement: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; title: string; type: 'form' | 'confirm'; data?: Admin }>({
    isOpen: false, type: 'form', title: ''
  });
  
  const [formData, setFormData] = useState({ name: '', email: '', department: '영업팀' as '영업팀' | '운영팀', phone_number: '' });

  const fetchAdmins = useCallback(async () => {
    const { data, error } = await supabase.from('admins').select('*').order('id', { ascending: false });
    if (error) console.error('Error fetching admins:', error);
    else setAdmins(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleSaveAdmin = async () => {
    const { error } = await supabase.from('admins').upsert((modalConfig.data ? { id: modalConfig.data.id, ...formData } : formData) as any);
    if(error) alert('저장 실패');
    else { setModalConfig({...modalConfig, isOpen: false}); fetchAdmins(); }
  };

  const deleteAdmin = async (id: number) => {
    const { error } = await supabase.from('admins').delete().eq('id', id);
    if (error) alert('삭제 실패');
    else { setModalConfig({...modalConfig, isOpen: false}); fetchAdmins(); }
  };

  const inputStyle = { padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' as const, backgroundColor: '#f8fafc' };

  return (
    <div style={{ padding: '0 20px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card" style={{ padding: '24px', backgroundColor: 'white', border: '1px solid rgb(226, 232, 240)', borderRadius: '16px', boxShadow: 'rgba(0, 0, 0, 0.02) 0px 4px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.1rem', color: '#1e293b', margin: 0 }}>관리자 관리</h2>
        <button onClick={() => { setFormData({ name: '', email: '', department: '영업팀', phone_number: '' }); setModalConfig({ isOpen: true, type: 'form', title: '관리자 추가' }) }} style={{ padding: '12px 24px', backgroundColor: '#008b8b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> 관리자 추가
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid rgb(226, 232, 240)', borderRadius: '16px', backgroundColor: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              {['성함', '이메일', '부서', '휴대폰', '관리'].map(h => <th key={h} style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.9rem', color: '#64748b' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" /></td></tr>
            ) : admins.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>등록된 관리자가 없습니다.</td></tr>
            ) : (
              admins.map((admin: any) => (
                <tr key={admin.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 24px' }}>{admin.name}</td>
                  <td style={{ padding: '16px 24px' }}>{admin.email}</td>
                  <td style={{ padding: '16px 24px' }}>{admin.department}</td>
                  <td style={{ padding: '16px 24px' }}>{admin.phone_number}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <button onClick={() => { setFormData(admin); setModalConfig({ isOpen: true, type: 'form', title: '관리자 수정', data: admin }) }} style={{ marginRight: '8px', background: 'none', border: 'none', cursor: 'pointer' }}><Edit2 size={16} color="#475569" /></button>
                    <button onClick={() => setModalConfig({ isOpen: true, type: 'confirm', title: '삭제 확인', data: admin })} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} color="#dc2626" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({...modalConfig, isOpen: false})} title={modalConfig.title} 
             type={modalConfig.type === 'confirm' ? 'confirm' : 'alert'} 
             onConfirm={modalConfig.type === 'confirm' ? () => deleteAdmin(modalConfig.data!.id) : handleSaveAdmin}
             message={modalConfig.type === 'form' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {[{label: '성함', key: 'name'}, {label: '이메일', key: 'email'}, {label: '휴대폰 번호', key: 'phone_number'}].map(f => (
                        <div key={f.key}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>{f.label}</label>
                            <input value={formData[f.key as keyof typeof formData]} onChange={(e) => setFormData({...formData, [f.key]: e.target.value})} style={inputStyle} />
                        </div>
                    ))}
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>부서</label>
                        <select value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value as any})} style={inputStyle}>
                            <option value="영업팀">영업팀</option>
                            <option value="운영팀">운영팀</option>
                        </select>
                    </div>
                </div>
             ) : `정말로 ${modalConfig.data?.name} 관리자를 삭제하시겠습니까?`}
      />
    </div>
  );
};

export default AdminManagement;
