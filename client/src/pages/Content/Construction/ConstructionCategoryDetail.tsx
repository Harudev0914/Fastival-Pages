import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { categoryApi } from '../../../api/constructionApi';
import ToggleButton from '../../../components/UI/ToggleButton';
import { card, inputStyle, labelStyle, btnPrimary, btnGhost, useAdminModal, Spinner } from './shared';

const ConstructionCategoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data, error } = await categoryApi.get(id!);
      if (error) alert('불러오기 오류', error);
      if (data) { setName(data.name || ''); setDescription(data.description || ''); setIsActive(data.is_active); }
      setLoading(false);
    })();
  }, [id, isNew, alert]);

  const save = async () => {
    if (!name.trim()) { alert('확인', '카테고리명을 입력해주세요.'); return; }
    setSaving(true);
    const input = { name, description, is_active: isActive };
    const { error } = isNew ? await categoryApi.create(input) : await categoryApi.update(id!, input);
    setSaving(false);
    if (error) alert('저장 오류', error);
    else navigate('/admin/dashboard/construction/categories');
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '720px' }}>
      <button style={{ ...btnGhost, marginBottom: '16px' }} onClick={() => navigate('/admin/dashboard/construction/categories')}>
        <ArrowLeft size={16} /> 목록으로
      </button>
      <div style={card}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '24px' }}>
          {isNew ? '카테고리 등록' : '카테고리 수정'}
        </h2>

        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>카테고리명 *</label>
          <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 카페" />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>설명</label>
          <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="카테고리 설명(선택)" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>활성화</label>
          <ToggleButton isOn={isActive} onToggle={() => setIsActive((v) => !v)} />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button style={btnGhost} onClick={() => navigate('/admin/dashboard/construction/categories')}>취소</button>
          <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
        </div>
      </div>
      {modal}
    </div>
  );
};

export default ConstructionCategoryDetail;
