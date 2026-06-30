import React, { useCallback, useState } from 'react';
import { supabase } from '../../supabaseClient';
import Modal from '../Modal';

// ===== 공통 스타일 (#008b8b 테마, 기존 어드민 페이지와 일관) =====
export const card: React.CSSProperties = {
  padding: '24px',
  backgroundColor: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  boxShadow: 'rgba(0,0,0,0.02) 0px 4px 12px',
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
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
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
  const close = useCallback(() => setModal((m) => ({ ...m, isOpen: false })), []);
  const alert = useCallback((title: string, message: string) => setModal({ isOpen: true, title, message, type: 'alert' }), []);
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
