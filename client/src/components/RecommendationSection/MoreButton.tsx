import React from 'react';

export const MoreButton: React.FC = () => {
  return (
    <div className="w-full max-w-[1200px] mx-auto pt-6 flex justify-center">
        <a href="/portfolio" className="flex-1 max-w-[400px] flex items-center justify-center gap-2 py-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
            <span className="text-gray-900 font-medium text-[15px]">더보기</span>
            <span className="text-gray-400 text-[15px]">{'>'}</span>
        </a>
    </div>
  );
};
