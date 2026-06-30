import React, { useState, useEffect } from 'react';
import { storage } from '../../utils/storage';
import { AddressModal } from './AddressModal';
import { AddressTooltip } from './AddressTooltip';

export const AddressBar: React.FC = () => {
  const [address, setAddress] = useState('서울특별시 마포구 아현동 777');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!storage.getTooltipShown()) {
      setShowTooltip(true);
    }
  }, []);

  const handleCloseTooltip = () => {
    setShowTooltip(false);
    storage.setTooltipShown();
  };

  return (
    <div className="relative mb-6">
      <div className="flex justify-between items-center bg-white">
        <div className="flex items-center gap-1.5 text-[#666666]">
          <div className="w-[14px] h-[14px] relative border border-[#666666]" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
          <span className="text-[14px] font-medium">{address}</span>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="text-[#999999] text-[13px] font-medium underline"
        >
          수정변경
        </button>
      </div>
      
      {showTooltip && (
        <AddressTooltip onClose={handleCloseTooltip} />
      )}
      
      <AddressModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onApply={(newAddress) => {
            setAddress(newAddress);
            setIsModalOpen(false);
        }}
      />
    </div>
  );
};
