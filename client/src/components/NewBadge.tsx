import React from 'react';

// 등록 후 N일(기본 30일) 이내면 신규 상품
export const isNewProduct = (createdAt?: string | null, days = 30): boolean => {
  if (!createdAt) return false;
  const t = new Date(createdAt).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t <= days * 24 * 60 * 60 * 1000;
};

// 상품 이미지 좌측 상단 NEW 라벨 (부모 요소는 position:relative 필요)
const NewBadge: React.FC<{ createdAt?: string | null; days?: number }> = ({ createdAt, days }) => {
  if (!isNewProduct(createdAt, days ?? 30)) return null;
  return (
    <span style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 3, background: '#2563eb', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.02em' }}>
      NEW
    </span>
  );
};

export default NewBadge;
