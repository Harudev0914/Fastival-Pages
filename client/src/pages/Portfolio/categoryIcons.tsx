import React from 'react';

// 카테고리명(이모지 제거)에 어울리는 인라인 SVG 아이콘
const S: React.FC<{ d: React.ReactNode }> = ({ d }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

const ICONS: Record<string, React.ReactNode> = {
  '카페': <S d={<><path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /><line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" /></>} />,
  '와인바': <S d={<><path d="M8 22h8" /><path d="M7 10h10" /><path d="M12 15v7" /><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-5-7-4.5 3-5 5-5 7a5 5 0 0 0 5 5Z" /></>} />,
  '바(BAR)': <S d={<><path d="M8 22h8" /><path d="M12 11v11" /><path d="m19 3-7 8-7-8Z" /></>} />,
  '라운지': <S d={<><rect x="3" y="10" width="18" height="7" rx="2" /><path d="M5 10V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" /><path d="M5 17v2" /><path d="M19 17v2" /></>} />,
  '클럽': <S d={<><circle cx="8" cy="18" r="3" /><circle cx="18" cy="16" r="3" /><path d="M11 18V4l10-2v14" /></>} />,
  '음식점': <S d={<><path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2" /><path d="M5 2v20" /><path d="M16 2v20" /><path d="M16 8c0-3 1-6 3-6v6c0 1-1 2-3 2Z" /></>} />,
  '고깃집': <S d={<><path d="M8.5 14.5c-2-1-3.5-3-3.5-5.5a7 7 0 0 1 14 0c0 .9-.2 1.8-.5 2.5" /><path d="M2 22c1.5-3 4-5 7-5s4 2 4 4" /><circle cx="11" cy="9" r="2" /></>} />,
  '한식': <S d={<><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></>} />,
  '일식': <S d={<><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.46-3.44 6-7 6-3.56 0-7.56-2.54-8.5-6Z" /><path d="M18 12h.01" /><path d="m2 12 4-2v4l-4-2Z" /></>} />,
  '레스토랑': <S d={<><path d="M3 11h18l-1.5 9.5a1 1 0 0 1-1 .5h-12a1 1 0 0 1-1-.5L3 11Z" /><path d="M12 4a3 3 0 0 1 3 3v4H9V7a3 3 0 0 1 3-3Z" /></>} />,
  '의류매장': <S d={<><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z" /></>} />,
  '헬스장': <S d={<><path d="m6.5 6.5 11 11" /><path d="m21 21-1-1" /><path d="m3 3 1 1" /><path d="m18 22 4-4" /><path d="m2 6 4-4" /><path d="m3 10 7-7" /><path d="m14 21 7-7" /></>} />,
  '미용실': <S d={<><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></>} />,
  '호텔': <S d={<><path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 17h20" /><path d="M6 8v9" /></>} />,
  '행사장': <S d={<><path d="M3.5 21 14 3" /><path d="M20.5 21 10 3" /><path d="M15.5 21 12 15l-3.5 6" /><path d="M2 21h20" /></>} />,
  '사무실': <S d={<><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" /></>} />,
  '학원': <S d={<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>} />,
  '기타': <S d={<><path d="m12 3-1.9 5.8-6.1.1 4.9 3.6L7 18.3l5-3.7 5 3.7-1.9-5.8 4.9-3.6-6.1-.1Z" /></>} />,
};

const DEFAULT = <S d={<><path d="M3 9 12 3l9 6" /><path d="M5 10v10h14V10" /><path d="M9 21v-6h6v6" /></>} />;

const coreName = (name: string) => name.replace(/[^가-힣A-Za-z()]/g, '').trim();

export const categoryIcon = (name: string): React.ReactNode => ICONS[coreName(name)] || DEFAULT;
