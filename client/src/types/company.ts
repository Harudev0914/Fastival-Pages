export interface Company {
  id: number;
  name: string;
  rating: number;
  reviewCount: number;
  recentContract: number;
  apartmentCount: number;
  tags: string[];
  images: string[];
  favorite: boolean;
}
