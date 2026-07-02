import React from 'react';
import RentalCategoriesPage from './RentalCategoriesPage';

// 카테고리 페이지와 동일 UI를 브랜드 기준으로 재사용
const RentalBrandsPage: React.FC = () => <RentalCategoriesPage by="brand" />;

export default RentalBrandsPage;
