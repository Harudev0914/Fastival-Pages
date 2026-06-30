import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { rentalCategoryApi, brandApi } from '../../../api/rentalApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import ToggleButton from '../../../components/UI/ToggleButton';
import { card, inputStyle, labelStyle, btnPrimary, btnGhost, useAdminModal, Spinner } from '../../../components/admin/shared';

const RentalCategoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isNew = id === 'new';

  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [brandId, setBrandId] = useState<number | ''>('');
  const [parentId, setParentId] = useState<number | null>(params.get('parent') ? Number(params.get('parent')) : null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { element: modal, alert } = useAdminModal();

  const backUrl = parentId ? `/admin/dashboard/rental/categories/sub/${parentId}` : '/admin/dashboard/rental/categories';

  useEffect(() => {
    (async () => {
      const { data: b } = await brandApi.listActive();
      const blist = (b || []) as { id: number; name: string }[];
      setBrands(blist);
      if (!isNew) {
        const { data, error } = await rentalCategoryApi.get(id!);
        if (error) alert('불러오기 오류', error);
        if (data) { setBrandId(data.brand_id ?? ''); setParentId(data.parent_id ?? null); setName(data.name); setDescription(data.description || ''); setIsActive(data.is_active); }
      } else {
        const bp = params.get('brand');
        if (bp) setBrandId(Number(bp));
        else if (blist.length) setBrandId(blist[0].id);
      }
      setLoading(false);
    })();
  }, [id, isNew, alert, params]);

  const save = async () => {
    setSaving(true);
    const input = { brand_id: brandId === '' ? null : Number(brandId), parent_id: parentId, name, description, is_active: isActive };
    const { error } = isNew ? await rentalCategoryApi.create(input) : await rentalCategoryApi.update(id!, input);
    setSaving(false);
    if (error) alert('저장 오류', error); else alert('저장 완료', '저장되었습니다.', () => navigate(backUrl));
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '680px' }}>
      <button style={{ ...btnGhost, marginBottom: '16px' }} onClick={() => navigate(backUrl)}><ArrowLeft size={16} /> 목록으로</button>
      <div style={card}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '24px' }}>{parentId ? (isNew ? '하위 카테고리 등록' : '하위 카테고리 수정') : (isNew ? '카테고리 등록' : '카테고리 수정')}</h2>

        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>브랜드 *</label>
          <select style={{ ...(SELECT_STYLE as React.CSSProperties), width: '100%' }} value={brandId} onChange={(e) => setBrandId(e.target.value === '' ? '' : Number(e.target.value))} disabled={!!parentId}>
            <option value="">브랜드 선택</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          {parentId ? <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>상위 카테고리의 브랜드를 따릅니다.</span> : null}
        </div>
        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>카테고리명 *</label>
          <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 소파 / 빈백" />
        </div>
        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>설명</label>
          <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>활성화</label>
          <ToggleButton isOn={isActive} onToggle={() => setIsActive((v) => !v)} />
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button style={btnGhost} onClick={() => navigate(backUrl)}>취소</button>
          <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
        </div>
      </div>
      {modal}
    </div>
  );
};

export default RentalCategoryDetail;
