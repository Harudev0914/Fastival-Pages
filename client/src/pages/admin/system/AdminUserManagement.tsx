import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { adminUserApi, departmentApi, SUPER_ADMIN_EMAIL, SUPER_DEPT_NAME, type AdminUser, type Department } from '../../../api/systemApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import { card, inputStyle, labelStyle, btnPrimary, btnGhost, th, td, EmptyState, Spinner, PageHead, fmtDate, useAdminModal } from '../../../components/admin/shared';

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const AdminUserManagement: React.FC = () => {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [depts, setDepts] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({ name: '', email: '', password: '', phone: '', desired_email: '', department_id: '' as number | '' });
  const { element: modal, alert, confirm } = useAdminModal();

  const fetchAll = useCallback(async () => {
    const [{ data: a, error }, { data: d }] = await Promise.all([adminUserApi.list(), departmentApi.list()]);
    if (error) alert('불러오기 오류', error);
    // 최상위 관리자 계정/부서는 목록에서 숨김
    setItems((a || []).filter((u) => u.email !== SUPER_ADMIN_EMAIL));
    setDepts((d || []).filter((x) => x.name !== SUPER_DEPT_NAME));
  }, [alert]);

  useEffect(() => { (async () => { setLoading(true); await fetchAll(); setLoading(false); })(); }, [fetchAll]);

  const submit = async () => {
    if (!f.name.trim()) return alert('확인', '이름을 입력해주세요.');
    if (!emailOk(f.email)) return alert('확인', '로그인 이메일을 정확히 입력해주세요.');
    if (f.password.length < 6) return alert('확인', '비밀번호는 6자 이상이어야 합니다.');
    setSaving(true);
    const { error } = await adminUserApi.create({
      email: f.email.trim(), password: f.password, name: f.name.trim(), phone: f.phone.trim(),
      desired_email: f.desired_email.trim(), department_id: f.department_id === '' ? null : Number(f.department_id),
    });
    setSaving(false);
    if (error) return alert('등록 오류', error);
    setShowForm(false);
    setF({ name: '', email: '', password: '', phone: '', desired_email: '', department_id: '' });
    fetchAll();
  };

  const remove = (row: AdminUser) => confirm('삭제 확인', `'${row.name || row.email}' 관리자를 삭제하시겠습니까?\n(Supabase 인증 계정도 함께 삭제됩니다)`, async () => {
    const { error } = await adminUserApi.remove(row);
    if (error) alert('삭제 오류', error); else fetchAll();
  });

  return (
    <div>
      <PageHead title="관리자 목록" desc="관리자 계정을 생성·삭제합니다. 생성 시 Supabase 인증 계정이 함께 등록됩니다."
        right={<button style={btnPrimary} onClick={() => setShowForm((v) => !v)}>{showForm ? <><X size={18} /> 닫기</> : <><Plus size={18} /> 관리자 추가</>}</button>} />

      {showForm && (
        <div style={{ ...card, marginBottom: '16px' }}>
          <h3 style={{ marginTop: 0, fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>관리자 추가</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div><label style={labelStyle}>이름 *</label><input style={inputStyle} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div><label style={labelStyle}>휴대폰번호</label><input style={inputStyle} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="010-0000-0000" /></div>
            <div><label style={labelStyle}>로그인 이메일 *</label><input style={inputStyle} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="admin@klipse.com" /></div>
            <div><label style={labelStyle}>희망 이메일</label><input style={inputStyle} value={f.desired_email} onChange={(e) => setF({ ...f, desired_email: e.target.value })} placeholder="(선택) 별도 수신 이메일" /></div>
            <div><label style={labelStyle}>비밀번호 * <span style={{ fontWeight: 400, color: '#94a3b8' }}>(6자 이상)</span></label><input type="password" style={inputStyle} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
            <div>
              <label style={labelStyle}>부서</label>
              <select style={{ ...(SELECT_STYLE as React.CSSProperties), width: '100%' }} value={f.department_id} onChange={(e) => setF({ ...f, department_id: e.target.value === '' ? '' : Number(e.target.value) })}>
                <option value="">부서 선택</option>
                {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button style={btnGhost} onClick={() => setShowForm(false)}>취소</button>
            <button style={btnPrimary} onClick={submit} disabled={saving}>{saving ? '등록 중...' : '등록'}</button>
          </div>
        </div>
      )}

      {loading ? <Spinner /> : items.length === 0 ? <EmptyState message="등록된 관리자가 없습니다." /> : (
        <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
            <thead><tr>
              <th style={th}>이름</th><th style={th}>로그인 이메일</th><th style={th}>휴대폰</th><th style={th}>부서</th><th style={th}>등록일</th><th style={{ ...th, textAlign: 'center' }}>관리</th>
            </tr></thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id}>
                  <td style={{ ...td, fontWeight: 700, color: '#1e293b' }}>{u.name || '-'}</td>
                  <td style={td}>{u.email || '-'}</td>
                  <td style={td}>{u.phone_number || '-'}</td>
                  <td style={td}>{u.departments?.name || '-'}</td>
                  <td style={td}>{fmtDate(u.created_at)}</td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <button onClick={() => remove(u)} title="삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} color="#dc2626" /></button>
                  </td>
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

export default AdminUserManagement;
