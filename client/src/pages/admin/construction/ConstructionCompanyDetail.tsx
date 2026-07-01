import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { constructionCompanyApi } from '../../../api/opsApi';
import ToggleButton from '../../../components/UI/ToggleButton';
import { btnPrimary, btnGhost, labelStyle, useAdminModal, Spinner, DetailHead, StatusPill, FormSection, Row, TextField, TextareaField, FormActions } from '../../../components/admin/shared';

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
    if (!name.trim()) return alert('입력 필요', '업체명을 입력해주세요.');
    setSaving(true);
    const input = { name, manager, phone, email, region, memo, is_active: isActive };
    const { error } = isNew ? await constructionCompanyApi.create(input) : await constructionCompanyApi.update(id!, input);
    setSaving(false);
    if (error) alert('저장 오류', error); else alert('저장 완료', '저장되었습니다.', () => navigate(LIST));
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '720px' }}>
      <DetailHead
        title={isNew ? '시공 업체 등록' : '시공 업체 수정'}
        onBack={() => navigate(LIST)}
        badge={!isNew ? <StatusPill label={isActive ? '활성' : '비활성'} color={isActive ? '#059669' : '#94a3b8'} /> : undefined}
        right={<button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>}
      />

      <FormSection title="업체 정보">
        <Row><TextField label="업체명" required minWidth="100%" value={name} onChange={setName} placeholder="예: OO인테리어" /></Row>
        <Row>
          <TextField label="담당자" value={manager} onChange={setManager} />
          <TextField label="연락처" value={phone} onChange={setPhone} placeholder="010-0000-0000" />
        </Row>
        <Row>
          <TextField label="이메일" value={email} onChange={setEmail} />
          <TextField label="지역" value={region} onChange={setRegion} placeholder="예: 서울" />
        </Row>
      </FormSection>

      <FormSection title="상세 · 상태">
        <TextareaField label="메모" value={memo} onChange={setMemo} placeholder="협력 조건, 전문 분야 등" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>활성화</label>
          <ToggleButton isOn={isActive} onToggle={() => setIsActive((v) => !v)} />
        </div>
        <FormActions>
          <button style={btnGhost} onClick={() => navigate(LIST)}>취소</button>
          <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
        </FormActions>
      </FormSection>
      {modal}
    </div>
  );
};

export default ConstructionCompanyDetail;
