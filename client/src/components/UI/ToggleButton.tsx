import React from 'react';

interface ToggleProps {
  isOn: boolean;
  onToggle: () => void;
}

const ToggleButton: React.FC<ToggleProps> = ({ isOn, onToggle }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      onClick={onToggle}
      style={{
        width: '48px',
        height: '26px',
        borderRadius: '999px',
        background: isOn
          ? 'linear-gradient(180deg, #0aa3a3, #008b8b)'
          : '#e2e8f0',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.25s ease, box-shadow 0.25s ease',
        padding: 0,
        boxShadow: isOn
          ? 'inset 0 1px 2px rgba(0,0,0,0.18), 0 0 0 3px rgba(0,139,139,0.12)'
          : 'inset 0 1px 2px rgba(0,0,0,0.12)',
        flexShrink: 0,
      }}
    >
      {/* ON / OFF 미세 텍스트 */}
      <span
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          fontSize: '0.56rem',
          fontWeight: 800,
          letterSpacing: '0.02em',
          color: isOn ? 'rgba(255,255,255,0.95)' : '#94a3b8',
          left: isOn ? '7px' : 'auto',
          right: isOn ? 'auto' : '6px',
          transition: 'opacity 0.2s ease',
        }}
      >
        {isOn ? 'ON' : 'OFF'}
      </span>
      {/* 노브 */}
      <span
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          position: 'absolute',
          top: '3px',
          left: isOn ? '25px' : '3px',
          transition: 'left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.28)',
        }}
      />
    </button>
  );
};

export default ToggleButton;
