import React from 'react';

const categories = [
  { label: '카페', emoji: '☕' },
  { label: '와인바', emoji: '🍷' },
  { label: '바(BAR)', emoji: '🍸' },
  { label: '라운지', emoji: '🛋️' },
  { label: '클럽', emoji: '💃' },
  { label: '음식점', emoji: '🍴' },
  { label: '고깃집', emoji: '🥓' },
  { label: '한식', emoji: '🍚' },
  { label: '일식', emoji: '🍣' },
  { label: '레스토랑', emoji: '🍽️' },
  { label: '의류매장', emoji: '👕' },
  { label: '헬스장', emoji: '💪' },
  { label: '미용실', emoji: '💇' },
  { label: '호텔', emoji: '🏨' },
  { label: '행사장', emoji: '🎉' },
  { label: '사무실', emoji: '💼' },
  { label: '학원', emoji: '📚' },
];

const CategoryMenu: React.FC = () => {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', 
      gap: '20px', 
      marginTop: '60px',
      padding: '0'
    }}>
      {categories.map((cat, index) => (
        <div key={index} style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '10px' 
        }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '12px', 
            backgroundColor: 'rgb(241, 245, 249)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '24px' 
          }}>
            {cat.emoji}
          </div>
          <span style={{ 
            fontSize: '0.85rem', 
            color: 'rgb(17, 17, 17)', 
            fontWeight: 500,
            fontFamily: 'Pretendard, sans-serif'
          }}>
            {cat.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CategoryMenu;
