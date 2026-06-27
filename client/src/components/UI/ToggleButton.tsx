import React from 'react';

interface ToggleProps {
  isOn: boolean;
  onToggle: () => void;
}

const ToggleButton: React.FC<ToggleProps> = ({ isOn, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        backgroundColor: isOn ? '#008b8b' : '#cbd5e1',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background-color 0.2s ease',
        padding: '0'
      }}
    >
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: 'white',
          position: 'absolute',
          top: '2px',
          left: isOn ? '22px' : '2px',
          transition: 'left 0.2s ease',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
        }}
      />
    </button>
  );
};

export default ToggleButton;
