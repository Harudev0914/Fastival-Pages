import React, { useEffect, useRef } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link2, Image as ImageIcon, Heading, Eraser } from 'lucide-react';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// 의존성 없는 경량 HTML 에디터 (contentEditable + execCommand)
const RichTextEditor: React.FC<Props> = ({ value, onChange, placeholder }) => {
  const ref = useRef<HTMLDivElement>(null);

  // 외부 value 가 바뀌었고(예: 수정 진입 시 로드) DOM 과 다르면 동기화
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    ref.current?.focus();
    onChange(ref.current?.innerHTML || '');
  };

  const addLink = () => {
    const url = window.prompt('링크 URL을 입력하세요', 'https://');
    if (url) exec('createLink', url);
  };
  const addImage = () => {
    const url = window.prompt('이미지 URL을 입력하세요', 'https://');
    if (url) exec('insertImage', url);
  };

  const Btn: React.FC<{ onClick: () => void; title: string; children: React.ReactNode }> = ({ onClick, title, children }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()} /* 포커스 유지 */
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '32px', border: '1px solid #e2e8f0', background: '#fff', borderRadius: '6px', cursor: 'pointer', color: '#475569' }}
    >
      {children}
    </button>
  );

  return (
    <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', padding: '8px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <Btn onClick={() => exec('bold')} title="굵게"><Bold size={16} /></Btn>
        <Btn onClick={() => exec('italic')} title="기울임"><Italic size={16} /></Btn>
        <Btn onClick={() => exec('underline')} title="밑줄"><Underline size={16} /></Btn>
        <Btn onClick={() => exec('formatBlock', 'H2')} title="제목"><Heading size={16} /></Btn>
        <Btn onClick={() => exec('insertUnorderedList')} title="글머리 목록"><List size={16} /></Btn>
        <Btn onClick={() => exec('insertOrderedList')} title="번호 목록"><ListOrdered size={16} /></Btn>
        <Btn onClick={addLink} title="링크"><Link2 size={16} /></Btn>
        <Btn onClick={addImage} title="이미지"><ImageIcon size={16} /></Btn>
        <Btn onClick={() => exec('removeFormat')} title="서식 지우기"><Eraser size={16} /></Btn>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML || '')}
        data-placeholder={placeholder || '내용을 입력하세요'}
        style={{ minHeight: '220px', padding: '16px', fontSize: '0.95rem', lineHeight: 1.7, color: '#1e293b', outline: 'none' }}
      />
      <style>{`
        [contenteditable][data-placeholder]:empty:before { content: attr(data-placeholder); color: #94a3b8; }
        [contenteditable] img { max-width: 100%; height: auto; border-radius: 6px; }
        [contenteditable] h2 { font-size: 1.25rem; font-weight: 700; margin: 12px 0 8px; }
        [contenteditable] a { color: #2563eb; text-decoration: underline; }
        [contenteditable] ul, [contenteditable] ol { padding-left: 22px; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
