import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { constructionCompanyApi } from '../../../api/opsApi';
import ToggleButton from '../../../components/UI/ToggleButton';
import { card, inputStyle, labelStyle, btnPrimary, btnGhost, useAdminModal, Spinner } from '../../../components/admin/shared';

const LIST = '/admin/dashboard/construction/companies';

const ConstructionCompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [name, setName] = useState('');
  const [manager, setManager] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [region, setRegion] = useState('');
  const [memo, setMemo] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data, error } = await constructionCompanyApi.get(id!);
      if (error) alert('불러오기 오류', error);
      if (data) { setName(data.name); setManager(data.manager || ''); setPhone(data.phone || ''); setEmail(data.email || ''); setRegion(data.region || ''); setMemo(data.memo || ''); setIsActive(data.is_active); }
      setLoading(false);
    })();
  }, [id, isNew, alert]);

  const save = async () => {
    setSaving(true);
    const input = { name, manager, phone, email, region, memo, is_active: isActive };
    const { error } = isNew ? await constructionCompanyApi.create(input) : await constructionCompanyApi.update(id!, input);
    setSaving(false);
    if (error) alert('저장 오류', error); else alert('저장 완료', '저장되었습니다.', () => navigate(LIST));
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '680px' }}>
      <button style={{ ...btnGhost, marginBottom: '16px' }} onClick={() => navigate(LIST)}><ArrowLeft size={16} /> 목록으로</button>
      <div style={card}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '24px' }}>{isNew ? '시공 업체 등록' : '시공 업체 수정'}</h2>

        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>업체명 *</label>
          <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="예: OO인테리어" />
        </div>
        <div style={{ display: 'flex', gap: '14px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px' }}><label style={labelStyle}>담당자</label><input style={inputStyle} value={manager} onChange={(e) => setManager(e.target.value)} /></div>
          <div style={{ flex: 1, minWidth: '180px' }}><label style={labelStyle}>연락처</label><input style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" /></div>
        </div>
        <div style={{ display: 'flex', gap: '14px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px' }}><label style={labelStyle}>이메일</label><input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div style={{ flex: 1, minWidth: '180px' }}><label style={labelStyle}>지역</label><input style={inputStyle} value={region} onChange={(e) => setRegion(e.target.value)} placeholder="예: 서울" /></div>
        </div>
        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>메모</label>
          <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="협력 조건, 전문 분야 등" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>활성화</label>
          <ToggleButton isOn={isActive} onToggle={() => setIsActive((v) => !v)} />
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button style={btnGhost} onClick={() => navigate(LIST)}>취소</button>
          <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
        </div>
      </div>
      {modal}
    </div>
  );
};

export default ConstructionCompanyDetail;
