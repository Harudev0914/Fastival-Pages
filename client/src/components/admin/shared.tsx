import React, { useCallback, useRef, useState } from 'react';
import { supabase } from '../../supabaseClient';
import Modal from '../Modal';

// ===== 공통 스타일 (#008b8b 테마, 기존 어드민 페이지와 일관) =====
export const card: React.CSSProperties = {
  padding: '24px',
  backgroundColor: 'white',
  border: '1px solid #eef2f6',
  borderRadius: '14px',
  boxShadow: '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.03)',
};

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: 700,
  color: '#334155',
  marginBottom: '8px',
};

export const btnPrimary: React.CSSProperties = {
  padding: '11px 22px',
  backgroundColor: '#008b8b',
  color: 'white',
  border: 'none',
  borderRadius: '9px',
  cursor: 'pointer',
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  boxShadow: '0 1px 2px rgba(0,139,139,0.28)',
};

export const btnGhost: React.CSSProperties = {
  padding: '11px 22px',
  backgroundColor: 'white',
  color: '#334155',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
};

export const th: React.CSSProperties = {
  padding: '14px 16px',
  textAlign: 'center',
  fontSize: '0.82rem',
  color: '#475569',
  fontWeight: 700,
  whiteSpace: 'nowrap',
};

export const td: React.CSSProperties = {
  padding: '14px 16px',
  textAlign: 'center',
  fontSize: '0.88rem',
  color: '#334155',
  verticalAlign: 'middle',
};

// ===== 날짜 포맷 =====
export const fmtDate = (iso?: string | null): string => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

// ===== 현재 관리자 표시명 (등록자/수정자 기록용) =====
export async function getAdminName(): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return '관리자';
    return user.user_metadata?.name || user.email || '관리자';
  } catch {
    return '관리자';
  }
}

// ===== 빈 상태 (SVG 아이콘 + 안내 문구) =====
export const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 20px', color: '#94a3b8' }}>
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
      <line x1="3.5" y1="11.5" x2="20.5" y2="11.5" />
      <line x1="9.5" y1="16" x2="14.5" y2="16" />
    </svg>
    <p style={{ marginTop: '16px', fontSize: '0.95rem', fontWeight: 600 }}>{message}</p>
  </div>
);

// ===== 로딩 스피너 =====
export const Spinner: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '56px 0' }}>
    <span style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#008b8b', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ===== 안내/확인 모달 훅 =====
export interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'confirm' | 'alert';
  onConfirm?: () => void;
}

export function useAdminModal() {
  const [modal, setModal] = useState<ModalState>({ isOpen: false, title: '', message: '', type: 'alert' });
  const alertCb = useRef<null | (() => void)>(null);
  // alert: 확인(닫기) 시 onDone 콜백 실행 → "저장 완료 → 목록으로" 용도
  const close = useCallback(() => {
    setModal((m) => ({ ...m, isOpen: false }));
    const cb = alertCb.current; alertCb.current = null; if (cb) cb();
  }, []);
  const alert = useCallback((title: string, message: string, onDone?: () => void) => {
    alertCb.current = onDone || null;
    setModal({ isOpen: true, title, message, type: 'alert' });
  }, []);
  const confirm = useCallback((title: string, message: string, onConfirm: () => void) =>
    setModal({ isOpen: true, title, message, type: 'confirm', onConfirm }), []);

  const element = (
    <Modal
      isOpen={modal.isOpen}
      onClose={close}
      onConfirm={modal.onConfirm}
      title={modal.title}
      message={modal.message}
      type={modal.type}
    />
  );

  return { element, alert, confirm, close };
}

// ===== 페이지 상단 헤더 (제목 + 우측 액션) =====
export const PageHead: React.FC<{ title: string; desc?: string; right?: React.ReactNode }> = ({ title, desc, right }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{title}</h2>
      {desc && <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '6px 0 0' }}>{desc}</p>}
    </div>
    {right}
  </div>
);

// ===== 상세/폼 페이지 디자인 키트 (메뉴 공통) =====
// 상단 뒤로가기 헤더 + 제목 + 상태배지 + 우측 액션
export const DetailHead: React.FC<{ title: string; onBack: () => void; badge?: React.ReactNode; right?: React.ReactNode }> = ({ title, onBack, badge, right }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', gap: '12px', flexWrap: 'wrap' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
      <button style={btnGhost} onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        목록으로
      </button>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{title}</h2>
      {badge}
    </div>
    {right && <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>{right}</div>}
  </div>
);

// 상태 알약 배지
export const StatusPill: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <span style={{ background: `${color}16`, color, fontSize: '0.76rem', fontWeight: 700, padding: '5px 12px', borderRadius: '999px', border: `1px solid ${color}33` }}>{label}</span>
);

// 제목이 있는 폼 섹션 카드
export const FormSection: React.FC<{ title: string; desc?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, desc, children, style }) => (
  <div style={{ ...card, marginBottom: '16px', ...style }}>
    <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
      <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{title}</h3>
      {desc && <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{desc}</p>}
    </div>
    {children}
  </div>
);

// 라벨+필드 (Row 안에서 flex 배치)
export const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode; flex?: number; minWidth?: string }> = ({ label, required, children, flex = 1, minWidth = '160px' }) => (
  <div style={{ flex, minWidth }}>
    <label style={labelStyle}>{label}{required && <span style={{ color: '#ef4444' }}> *</span>}</label>
    {children}
  </div>
);

// 필드 가로 배치 래퍼
export const Row: React.FC<{ children: React.ReactNode; gap?: string }> = ({ children, gap = '14px' }) => (
  <div style={{ display: 'flex', gap, flexWrap: 'wrap', marginBottom: '4px' }}>{children}</div>
);

// 라벨+인풋 편의 컴포넌트
export const TextField: React.FC<{
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean; flex?: number; minWidth?: string; disabled?: boolean;
}> = ({ label, value, onChange, placeholder, type = 'text', required, flex, minWidth, disabled }) => (
  <Field label={label} required={required} flex={flex} minWidth={minWidth}>
    <input type={type} style={{ ...inputStyle, ...(disabled ? { background: '#f8fafc', color: '#94a3b8' } : {}) }} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} />
  </Field>
);

// 라벨+텍스트영역
export const TextareaField: React.FC<{
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; minHeight?: string;
}> = ({ label, value, onChange, placeholder, required, minHeight = '90px' }) => (
  <Field label={label} required={required} minWidth="100%">
    <textarea style={{ ...inputStyle, minHeight, resize: 'vertical', lineHeight: 1.6 }} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
  </Field>
);

// 라벨+셀렉트
export const SelectField: React.FC<{
  label: string; value: string | number; onChange: (v: string) => void; required?: boolean; flex?: number; minWidth?: string; children: React.ReactNode;
}> = ({ label, value, onChange, required, flex, minWidth, children }) => (
  <Field label={label} required={required} flex={flex} minWidth={minWidth}>
    <select style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'3\' stroke-linecap=\'round\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '34px' }} value={value} onChange={(e) => onChange(e.target.value)}>
      {children}
    </select>
  </Field>
);

// 폼 하단 액션 바 (구분선 + 우측 정렬)
export const FormActions: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>{children}</div>
);
