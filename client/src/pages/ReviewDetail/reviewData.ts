// 시공리뷰 페이지에서 사용하는 타입 및 목업 데이터 생성기

export interface ReviewTag {
  label: string;
}

export interface Review {
  id: number;
  author: string;
  avatarSeed: string;
  isContracted: boolean; // "오늘의집 계약" 배지
  date: string;
  isNew: boolean;
  tags: string[];
  images: string[]; // 첫 4장은 썸네일, 5번째는 대표 이미지
  body: string;
  helpful: number;
}

export interface CompanyInfo {
  name: string;
  rating: number;
  reviewCount: number;
  address: string;
  notice: string;
  available: string;
}

export const COMPANY: CompanyInfo = {
  name: '오늘의집 인테리어',
  rating: 4.7,
  reviewCount: 267,
  address: '서울특별시 서초구 서초대로 74길...',
  notice: 'Klipse 키친 GRAND OPEN ✨',
  available: '현재 수도권 시공 가능해요',
};

export const RATING_SUMMARY = {
  average: 4.7,
  count: 267,
  subtitle: '모든 리뷰는 계약 사실을 100% 확인했습니다.',
};

export const AI_KEYWORDS = [
  { label: '시공 결과가 좋아요', count: 208 },
  { label: '가격이 합리적이에요', count: 130 },
  { label: '마무리가 깔끔해요', count: 124 },
  { label: '꼼꼼하게 시공해요', count: 117 },
  { label: '소통이 잘 돼요', count: 92 },
  { label: '일정이 정확해요', count: 78 },
];

export const SORT_OPTIONS = ['정렬', '최신순', '평점 높은순', '도움순'];
export const FIELD_OPTIONS = ['분야', '주방', '욕실', '거실', '전체'];
export const AREA_OPTIONS = ['평수', '20평 이하', '20~30평', '30~50평', '50평 이상'];
export const BUDGET_OPTIONS = ['예산', '500만원 이하', '500~1000만원', '1000만원 이상'];

const BODY_TEXT =
  '이전 주방에서 20년을 살았는데 앞으로 10년은 더 살아야 할 것 같아 주방만 공사를 하게 되었어요. 20년전에 최신 식기세척기, 빌트인 냉장고, 가스오븐 등을 갖춘 유명회사의 주방이 있었는데, 이제는 너무 낡고 수납공간도 충분하지 않아 살림하기 너무 힘들었어요. 요즘 유행하는 대면형 주방으로 하자니 공사 규모가 너무 넓어져서 거주하면서 공사하기에 부담이 컸는데 사장님이 적절한 타협점을 찾아주셔서 만족스럽게 끝났습니다. 마감도 아주 깔끔하고 무엇보다 동선이 편해졌어요.';

const AUTHORS = [
  '서래마을리리사랑', '방배동집순이', '반포자이주민', '대치동맘',
  '판교새댁', '광교호수공원', '잠실엘스토리', '마포래미안',
];

const TAG_SETS: string[][] = [
  ['2026.06', '500만원~1000만원', '서울특별시 서초구', '빌라&연립', '주방', '50평 이상'],
  ['2026.05', '1000만원 이상', '경기도 성남시', '아파트', '거실', '30~50평'],
  ['2026.06', '500만원 이하', '서울특별시 강남구', '오피스텔', '욕실', '20평 이하'],
  ['2026.04', '1000만원 이상', '서울특별시 송파구', '아파트', '전체', '20~30평'],
];

const PAGE_SIZE = 6;
export const TOTAL_REVIEWS = 30;

// 한 페이지 분량의 목업 리뷰를 생성한다. (실제 API 자리 표시용)
export function generateReviews(page: number): { reviews: Review[]; hasMore: boolean } {
  const start = (page - 1) * PAGE_SIZE;
  const reviews: Review[] = [];

  for (let i = 0; i < PAGE_SIZE && start + i < TOTAL_REVIEWS; i++) {
    const idx = start + i;
    const tags = TAG_SETS[idx % TAG_SETS.length];
    const images = Array.from({ length: 5 }, (_, n) =>
      `https://picsum.photos/seed/kitchen-${idx}-${n}/640/440`
    );
    reviews.push({
      id: idx,
      author: AUTHORS[idx % AUTHORS.length],
      avatarSeed: `avatar-${idx % AUTHORS.length}`,
      isContracted: true,
      date: tags[0].replace('.', '.') + '.24',
      isNew: idx % 3 === 0,
      tags,
      images,
      body: BODY_TEXT,
      helpful: 3 + (idx % 9),
    });
  }

  return { reviews, hasMore: start + PAGE_SIZE < TOTAL_REVIEWS };
}
