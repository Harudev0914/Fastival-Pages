// 시공리뷰 페이지 전용 인라인 SVG 아이콘 모음
import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const ChevronRightIcon: React.FC<IconProps> = ({ size = 18, color = '#94a3b8', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const MapPinIcon: React.FC<IconProps> = ({ size = 16, color = '#64748b', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const MegaphoneIcon: React.FC<IconProps> = ({ size = 16, color = '#64748b', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m3 11 18-5v12L3 14v-3z" />
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ size = 14, color = '#2563eb', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const ThumbsUpIcon: React.FC<IconProps> = ({ size = 16, color = '#64748b', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>
);

export const SparkleIcon: React.FC<IconProps> = ({ size = 14, color = '#7c3aed', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
    <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z" />
    <path d="M19 14l.9 2.6L22.5 17.5l-2.6.9L19 21l-.9-2.6L15.5 17.5l2.6-.9L19 14z" />
  </svg>
);

// 부분 채움(예: 4.7점)이 가능한 별점 SVG
export const StarRating: React.FC<{ value: number; size?: number; gap?: number }> = ({
  value,
  size = 22,
  gap = 2,
}) => {
  const stars = [0, 1, 2, 3, 4];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap }} aria-label={`평점 ${value}점`}>
      {stars.map((i) => {
        const fill = Math.max(0, Math.min(1, value - i)); // 0~1 채움 비율
        const gradId = `star-grad-${i}-${Math.round(fill * 100)}`;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24">
            <defs>
              <linearGradient id={gradId}>
                <stop offset={`${fill * 100}%`} stopColor="#ffc107" />
                <stop offset={`${fill * 100}%`} stopColor="#e2e8f0" />
              </linearGradient>
            </defs>
            <path
              d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.3l-5.8 3.05 1.1-6.46-4.69-4.58 6.49-.94L12 2.5z"
              fill={`url(#${gradId})`}
            />
          </svg>
        );
      })}
    </span>
  );
};
