import React, { useState, useEffect } from 'react';
import type { Company } from '../../types/company';
import { companyService } from '../../services/company.api';
import { AddressBar } from './AddressBar';
import { CompanyCarousel } from './CompanyCarousel';
import { MoreButton } from './MoreButton';

export const RecommendationSection: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        const data = await companyService.fetchRecommendedCompanies();
        setCompanies(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadCompanies();
  }, []);

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500 mb-4">업체를 불러오지 못했습니다.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 text-white rounded-lg">다시 시도</button>
      </div>
    );
  }

  return (
    <section className="py-10 mt-8">
      <AddressBar />
      
      <h2 className="text-[28px] font-extrabold text-[#111111] mb-8 leading-[39.2px]">
        아현동 마포래미안푸르지오 추천 업체 둘러보기
      </h2>

      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex-shrink-0 w-[320px] h-[350px] bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="py-20 text-center text-gray-500">추천 업체가 없습니다. 주소를 변경해보세요.</div>
      ) : (
        <>
          <CompanyCarousel companies={companies} />
          <MoreButton />
        </>
      )}
    </section>
  );
};
