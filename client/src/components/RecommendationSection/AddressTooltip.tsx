import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const AddressTooltip: React.FC<Props> = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-16 right-0 z-20 w-[280px] bg-gray-800 text-white p-4 rounded-lg shadow-xl"
      >
        <div className="flex justify-between items-start">
          <p className="text-sm">주소를 바꾸면 맞춤 시공 사례를 볼 수 있어요</p>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        {/* Arrow */}
        <div className="absolute -top-2 right-4 w-4 h-4 bg-gray-800 rotate-45"></div>
      </motion.div>
    </AnimatePresence>
  );
};
