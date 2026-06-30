import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply: (address: string) => void;
}

export const AddressModal: React.FC<Props> = ({ isOpen, onClose, onApply }) => {
  const [address, setAddress] = React.useState('');

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">주소를 입력해주세요.</h3>
            <button onClick={onClose}><X /></button>
          </div>
          
          <input 
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="주소 검색"
            className="w-full p-3 mb-6 border border-gray-200 rounded-lg"
          />
          
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 p-3 bg-gray-100 rounded-lg">취소</button>
            <button onClick={() => onApply(address)} className="flex-1 p-3 bg-blue-600 text-white rounded-lg">적용</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
