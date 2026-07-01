import React from 'react';
import { card } from './shared';

export interface StatCard { label: string; value: string | number; sub?: string; color?: string; }
export interface BarRow { label: string; value: number; color?: string; }

// KPI 카드 그리드
export const StatGrid: React.FC<{ cards: StatCard[] }> = ({ cards }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
    {cards.map((c, i) => (
      <div key={i} style={{ ...card, padding: '18px 20px' }}>
        <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>{c.label}</div>
        <div style={{ fontSize: '1.7rem', fontWeight: 800, color: c.color || '#1e293b', marginTop: '6px' }}>{c.value}</div>
        {c.sub && <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>{c.sub}</div>}
      </div>
    ))}
  </div>
);

// 가로 막대 분포
export const BarBreakdown: React.FC<{ title: string; rows: BarRow[]; unit?: string }> = ({ title, rows, unit }) => {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div style={{ ...card, marginBottom: '20px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '16px' }}>{title}</h3>
      {rows.length === 0 ? (
        <div style={{ color: '#94a3b8', fontSize: '0.88rem', padding: '10px 0' }}>데이터가 없습니다.</div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {rows.map((r, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px' }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>{r.label}</span>
                <span style={{ color: '#1e293b', fontWeight: 700 }}>{r.value.toLocaleString()}{unit || ''}</span>
              </div>
              <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${(r.value / max) * 100}%`, height: '100%', background: r.color || '#2563eb', borderRadius: '999px', transition: 'width 0.3s' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
