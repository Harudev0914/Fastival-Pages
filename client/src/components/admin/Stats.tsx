import React from 'react';
import { card } from './shared';
import { Sparkline } from './Charts';

export interface StatCard {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: React.ReactNode;
  spark?: number[];         // 미니 추이(선택)
  delta?: { value: string; up?: boolean }; // 증감 배지(선택)
}
export interface BarRow { label: string; value: number; color?: string; }

// KPI 카드 그리드 (다우오피스풍: 아이콘 칩 + 값 + 미니 추이)
export const StatGrid: React.FC<{ cards: StatCard[] }> = ({ cards }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', marginBottom: '20px' }}>
    {cards.map((c, i) => {
      const accent = c.color || '#0d9488';
      return (
        <div key={i} style={{ ...card, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>{c.label}</span>
            {c.icon && (
              <span style={{ width: '32px', height: '32px', borderRadius: '10px', background: `${accent}14`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c.icon}</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
            <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{c.value}</span>
            {c.delta && (
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: c.delta.up ? '#059669' : '#dc2626', background: c.delta.up ? '#ecfdf5' : '#fef2f2', padding: '2px 7px', borderRadius: '999px' }}>
                {c.delta.up ? '▲' : '▼'} {c.delta.value}
              </span>
            )}
          </div>
          {c.sub && <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '4px' }}>{c.sub}</div>}
          {c.spark && c.spark.length > 1 && <div style={{ marginTop: '8px', marginLeft: '-2px', marginRight: '-2px' }}><Sparkline points={c.spark} color={accent} height={30} /></div>}
        </div>
      );
    })}
  </div>
);

// 가로 막대 분포 (경량 · 인라인용)
export const BarBreakdown: React.FC<{ title: string; rows: BarRow[]; unit?: string }> = ({ title, rows, unit }) => {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div style={{ ...card, marginBottom: '20px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: 0, marginBottom: '16px' }}>{title}</h3>
      {rows.length === 0 ? (
        <div style={{ color: '#94a3b8', fontSize: '0.88rem', padding: '10px 0' }}>데이터가 없습니다.</div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {rows.map((r, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px' }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>{r.label}</span>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>{r.value.toLocaleString()}{unit || ''}</span>
              </div>
              <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${(r.value / max) * 100}%`, height: '100%', background: r.color || '#3b82f6', borderRadius: '999px', transition: 'width 0.3s' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
