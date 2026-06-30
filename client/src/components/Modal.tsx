import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: React.ReactNode;
  type: 'confirm' | 'alert';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, message, type }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', width: '350px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, color: '#1e293b' }}>{title}</h3>
        <p style={{ color: '#475569' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #e2e8f0', background: 'none', cursor: 'pointer' }}>닫기</button>
          {type === 'confirm' && (
            <button onClick={() => { onConfirm?.(); onClose(); }} style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#008b8b', color: 'white', cursor: 'pointer' }}>확인</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
