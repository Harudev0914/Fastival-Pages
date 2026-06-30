import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import type { Company } from '../../types/company';
import { cardVariants, heartVariants } from '../../animations/motion';

interface Props {
  company: Company;
  index: number;
}

export const CompanyCard: React.FC<Props> = ({ company, index }) => {
  return (
    <motion.div
      variants={cardVariants}
      custom={index}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true }}
      className="flex-shrink-0 w-full sm:w-[282px] bg-white rounded-2xl overflow-hidden border border-gray-100 cursor-pointer flex flex-col shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      {/* 이미지 그리드 영역 */}
      <div className="relative h-[200px] bg-gray-100 flex gap-[2px] overflow-hidden">
        {/* 메인 이미지 */}
        <div className="w-2/3 h-full bg-gray-200">
            {/* Replace with actual image: <img src={company.images[0]} className="w-full h-full object-cover" /> */}
        </div>
        {/* 서브 이미지 */}
        <div className="w-1/3 h-full flex flex-col gap-[2px]">
            <div className="flex-1 bg-gray-200"></div>
            <div className="flex-1 bg-gray-200"></div>
        </div>
        
        {/* 찜 버튼 */}
        <motion.button
          variants={heartVariants}
          whileTap="tap"
          className="absolute top-3 right-3 p-2 bg-white/60 backdrop-blur rounded-full shadow-sm z-10 hover:bg-white"
          aria-label="찜하기"
        >
          <Heart size={18} className={company.favorite ? "fill-red-500 text-red-500" : "text-white"} />
        </motion.button>
      </div>

      {/* 정보 영역 */}
      <div className="p-4 flex flex-col flex-grow bg-white">
        {/* 태그 목록 */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {company.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-[#F1F3F5] text-[#666666] text-[11px] rounded">
              {tag}
            </span>
          ))}
        </div>

        {/* 업체명 */}
        <h3 className="text-[18px] font-bold text-[#111111] mb-2.5">
          {company.name}
        </h3>
        
        {/* 평점 및 리뷰 */}
        <div className="flex items-center gap-2 text-[14px] text-[#666666]">
          <div className="flex items-center gap-1 font-bold text-[#111111]">
            <Star size={14} className="fill-[#FFD43B] text-[#FFD43B]" />
            {company.rating}
          </div>
          <span className="text-[#999999]">리뷰 {company.reviewCount}</span>
          <div className="w-[1px] h-[10px] bg-[#EEEEEE]"></div>
          <span className="text-[#666666]">최근방문</span>
        </div>
      </div>
    </motion.div>
  );
};
