import type { Company } from '../types/company';

// Simulated API service
export const companyService = {
  fetchRecommendedCompanies: async (): Promise<Company[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return [
      {
        id: 1,
        name: '로웰디자인',
        rating: 4.9,
        reviewCount: 50,
        recentContract: 6,
        apartmentCount: 3,
        tags: ['우리 아파트 3회 시공', '책임보장', '원가견적'],
        images: ['/placeholder1.jpg', '/placeholder2.jpg', '/placeholder3.jpg'],
        favorite: false,
      },
      {
        id: 2,
        name: '디자인 스튜디오',
        rating: 4.8,
        reviewCount: 42,
        recentContract: 4,
        apartmentCount: 1,
        tags: ['책임보장', '꼼꼼한시공'],
        images: ['/placeholder4.jpg', '/placeholder5.jpg'],
        favorite: true,
      },
      // Add more mock data...
    ];
  },
};
