module.exports = Array.from({ length: 30 }, (_, i) => ({
  id: `rev_${i + 1}`,
  reviewerName: `사용자_${i + 1}`,
  avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${i}`,
  verified: true,
  date: '2026.06.24',
  isNew: i < 3,
  tags: ['주방', '50평 이상', '빌라&연립'],
  photos: [
    'https://via.placeholder.com/150/f0f0f0?text=1',
    'https://via.placeholder.com/150/e0e0e0?text=2',
    'https://via.placeholder.com/150/d0d0d0?text=3',
    'https://via.placeholder.com/150/c0c0c0?text=4'
  ],
  heroPhoto: 'https://via.placeholder.com/800x400/f6f4f0?text=Hero',
  text: i % 3 === 0
    ? "짧은 후기입니다. 아주 만족해요!"
    : "긴 후기입니다. 이전 주방에서 20년을 살았는데 앞으로 10년은 더 살아야 할 것 같아 주방만 공사를 하게 되었어요. 마감도 깔끔하고 동선이 아주 편해졌습니다. 강력 추천합니다!",
  helpfulCount: Math.floor(Math.random() * 100)
}));
