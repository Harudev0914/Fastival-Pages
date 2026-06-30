import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { Company } from '../../types/company';
import { CompanyCard } from './CompanyCard';

interface Props {
  companies: Company[];
}

export const CompanyCarousel: React.FC<Props> = ({ companies }) => {
  const [emblaRef] = useEmblaCarousel({
    dragFree: true,
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 1024px)': { slidesToScroll: 1 },
    }
  });

  return (
    <div className="w-full overflow-hidden" ref={emblaRef}>
      <div className="flex gap-4">
        {companies.map((company, index) => (
          <CompanyCard key={company.id} company={company} index={index} />
        ))}
      </div>
    </div>
  );
};
