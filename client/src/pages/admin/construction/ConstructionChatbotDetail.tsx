import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Plus } from 'lucide-react';
import { chatbotApi, categoryApi, type QType } from '../../../api/constructionApi';
import ToggleButton from '../../../components/UI/ToggleButton';
import { inputStyle, labelStyle, btnPrimary, btnGhost, useAdminModal, Spinner, DetailHead, StatusPill, FormSection, Row, TextField, SelectField, FormActions } from '../../../components/admin/shared';

const HAS_OPTIONS: QType[] = ['radio', 'checkbox', 'select'];
const LIST = '/admin/dashboard/construction/chatbot';

const ConstructionChatbotDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [type, setType] = useState<QType>('radio');
  const [options, setOptions] = useState<string[]>([]);
  const [optInput, setOptInput] = useState('');
  const [useCategories, setUseCategories] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [categoryNames, setCategoryNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    (async () => {
      const { data: cats } = await categoryApi.listActive();
      setCategoryNames((cats || []).map((c) => c.name));
      if (!isNew) {
        const { data, error } = await chatbotApi.get(id!);
        if (error) alert('불러오기 오류', error);
        if (data) {
          setTitle(data.title || '');
          setType(data.type);
          setOptions(Array.isArray(data.options) ? data.options : []);
          setUseCategories(!!data.use_categories);
          setIsActive(data.is_active ?? true);
        }
        setLoading(false);
      }
    })();
  }, [id, isNew, alert]);

  const addOption = () => {
    const v = optInput.trim();
    if (v && !options.includes(v)) setOptions([...options, v]);
    setOptInput('');
  };

  const save = async () => {
    const input = { title, type, options, use_categories: useCategories, is_active: isActive };
    setSaving(true);
    const { error } = isNew ? await chatbotApi.create(input) : await chatbotApi.update(id!, input);
    setSaving(false);
    if (error) alert('저장 오류', error);
    else alert('저장 완료', '저장되었습니다.', () => navigate(LIST));
  };

  if (loading) return <Spinner />;

  const showOptions = HAS_OPTIONS.includes(type);

  return (
    <div style={{ maxWidth: '820px' }}>
      <DetailHead
        title={isNew ? '챗봇 룰 등록' : '챗봇 룰 수정'}
        onBack={() => navigate(LIST)}
        badge={!isNew ? <StatusPill label={isActive ? '활성' : '비활성'} color={isActive ? '#059669' : '#94a3b8'} /> : undefined}
        right={<button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>}
      />

      <FormSection title="질문 설정">
        <Row><TextField label="질문" required minWidth="100%" value={title} onChange={setTitle} placeholder="예: 어떤 공간인가요?" /></Row>
        <Row>
          <SelectField label="유형" value={type} onChange={(v) => setType(v as QType)}>
            <option value="radio">라디오</option>
            <option value="checkbox">체크박스</option>
            <option value="select">드롭다운</option>
            <option value="text">텍스트</option>
            <option value="file">파일업로드</option>
            <option value="application">신청 폼 (이름·연락처·이메일·도면)</option>
          </SelectField>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <label style={labelStyle}>활성화</label>
            <div><ToggleButton isOn={isActive} onToggle={() => setIsActive((v) => !v)} /></div>
          </div>
        </Row>
      </FormSection>

      {showOptions && (
        <FormSection title="선택 옵션">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>카테고리 연동 (공간 선택)</label>
            <ToggleButton isOn={useCategories} onToggle={() => setUseCategories((v) => !v)} />
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>켜면 옵션이 시공 카테고리로 자동 표기됩니다.</span>
          </div>
          {useCategories ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {categoryNames.length === 0
                ? <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>활성화된 카테고리가 없습니다. 먼저 카테고리를 등록하세요.</span>
                : categoryNames.map((n) => <span key={n} style={{ background: '#e0f2f1', color: '#008b8b', padding: '5px 10px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 600 }}>{n}</span>)}
            </div>
          ) : (
            <div>
              <label style={labelStyle}>선택 옵션</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input style={inputStyle} value={optInput} onChange={(e) => setOptInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption(); } }} placeholder="옵션 입력 후 Enter" />
                <button style={btnPrimary} onClick={addOption}><Plus size={16} /> 추가</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {options.map((opt) => (
                  <span key={opt} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #cbd5e1', padding: '5px 8px 5px 12px', borderRadius: '999px', fontSize: '0.82rem' }}>
                    {opt}
                    <button onClick={() => setOptions(options.filter((o) => o !== opt))} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#94a3b8' }}><X size={14} /></button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </FormSection>
      )}

      <FormSection title="미리보기">
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', background: '#f8fafc' }}>
          <div style={{ display: 'inline-block', background: '#fff', borderRadius: '14px 14px 14px 0', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', padding: '12px 14px', maxWidth: '100%' }}>
            <div style={{ fontWeight: 700, color: '#121212', fontSize: '0.92rem' }}>{title || '질문 내용을 입력하세요'}</div>
            {showOptions && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                {(useCategories ? categoryNames : options).map((o) => (
                  <span key={o} style={{ border: '2px solid #e2e8f0', background: '#fff', borderRadius: '999px', padding: '6px 14px', fontSize: '0.82rem', color: '#334155' }}>{o}</span>
                ))}
                {(useCategories ? categoryNames : options).length === 0 && <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>표시할 옵션이 없습니다</span>}
              </div>
            )}
            {type === 'text' && (
              <div style={{ marginTop: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', color: '#94a3b8', fontSize: '0.82rem', background: '#fff' }}>내용을 자유롭게 입력해주세요 · 0/300자</div>
            )}
            {(type === 'file' || type === 'application') && (
              <div style={{ marginTop: '10px', fontSize: '0.82rem', color: '#64748b' }}>이름 · 연락처 · 이메일 · 도면(파일 업로드) 신청 폼이 표시됩니다.</div>
            )}
          </div>
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

export default ConstructionChatbotDetail;
