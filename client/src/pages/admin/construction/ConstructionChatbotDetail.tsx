import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, Plus } from 'lucide-react';
import { chatbotApi, categoryApi, type QType } from '../../../api/constructionApi';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import ToggleButton from '../../../components/UI/ToggleButton';
import { card, inputStyle, labelStyle, btnPrimary, btnGhost, useAdminModal, Spinner } from '../../../components/admin/shared';

const HAS_OPTIONS: QType[] = ['radio', 'checkbox', 'select'];

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
    else navigate('/admin/dashboard/construction/chatbot');
  };

  if (loading) return <Spinner />;

  const showOptions = HAS_OPTIONS.includes(type);

  return (
    <div style={{ maxWidth: '760px' }}>
      <button style={{ ...btnGhost, marginBottom: '16px' }} onClick={() => navigate('/admin/dashboard/construction/chatbot')}>
        <ArrowLeft size={16} /> 목록으로
      </button>
      <div style={card}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '24px' }}>
          {isNew ? '챗봇 룰 등록' : '챗봇 룰 수정'}
        </h2>

        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>질문 *</label>
          <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 어떤 공간인가요?" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
          <div>
            <label style={labelStyle}>유형</label>
            <select style={{ ...(SELECT_STYLE as React.CSSProperties), width: '100%' }} value={type} onChange={(e) => setType(e.target.value as QType)}>
              <option value="radio">라디오</option>
              <option value="checkbox">체크박스</option>
              <option value="select">드롭다운</option>
              <option value="text">텍스트</option>
              <option value="file">파일업로드</option>
              <option value="application">신청 폼 (이름·연락처·이메일·도면)</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
            <div>
              <label style={labelStyle}>활성화</label>
              <ToggleButton isOn={isActive} onToggle={() => setIsActive((v) => !v)} />
            </div>
          </div>
        </div>

        {showOptions && (
          <div style={{ marginBottom: '18px', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
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
          </div>
        )}

        {/* 실제 챗봇에서 보이는 모습 미리보기 */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>미리보기</label>
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
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button style={btnGhost} onClick={() => navigate('/admin/dashboard/construction/chatbot')}>취소</button>
          <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
        </div>
      </div>
      {modal}
    </div>
  );
};

export default ConstructionChatbotDetail;
