import React from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { card } from './shared';

export interface Slice { label: string; value: number; color: string; }
export interface Point { label: string; value: number; }

// 모던 팔레트 (다우오피스풍 소프트 톤)
export const PALETTE = ['#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#f43f5e', '#06b6d4', '#10b981', '#64748b'];
const nfmt = (n: number) => Number(n || 0).toLocaleString();

const ChartCard: React.FC<{ title?: string; right?: React.ReactNode; children: React.ReactNode }> = ({ title, right, children }) => (
  <div style={{ ...card, padding: '20px 22px' }}>
    {(title || right) && (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '10px' }}>
        {title && <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{title}</h3>}
        {right}
      </div>
    )}
    {children}
  </div>
);

const tooltipStyle = {
  contentStyle: { borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', fontSize: '0.8rem', padding: '8px 12px' },
  labelStyle: { color: '#0f172a', fontWeight: 700, marginBottom: '2px' },
  itemStyle: { color: '#475569' },
};

// ===== 도넛 차트 (범례 + 중앙 합계) =====
export const DonutChart: React.FC<{ title?: string; data: Slice[]; centerLabel?: string; unit?: string; height?: number }> = ({ title, data, centerLabel, unit, height = 190 }) => {
  const rows = data.filter((d) => d.value > 0);
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <ChartCard title={title}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: `${height}px`, height: `${height}px`, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={rows.length ? rows : [{ label: '데이터 없음', value: 1, color: '#e2e8f0' }]} dataKey="value" nameKey="label"
                cx="50%" cy="50%" innerRadius={height * 0.30} outerRadius={height * 0.46} paddingAngle={rows.length > 1 ? 2 : 0} stroke="none">
                {(rows.length ? rows : [{ color: '#e2e8f0' }]).map((d, i) => <Cell key={i} fill={(d as Slice).color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(v: any, n: any) => [`${nfmt(v)}${unit || ''}`, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{nfmt(total)}</span>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '3px' }}>{centerLabel || '합계'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', flex: 1, minWidth: '140px' }}>
          {data.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.83rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: d.color, flexShrink: 0 }} />
              <span style={{ color: '#475569', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>{nfmt(d.value)}{unit || ''}</span>
              <span style={{ color: '#94a3b8', width: '40px', textAlign: 'right' }}>{total ? Math.round((d.value / total) * 100) : 0}%</span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
};

// ===== 에어리어 추이 차트 =====
export const TrendAreaChart: React.FC<{ title?: string; right?: React.ReactNode; points: Point[]; color?: string; unit?: string; height?: number; money?: boolean }> = ({ title, right, points, color = '#0d9488', unit, height = 220, money }) => {
  const fmt = money ? (v: number) => `₩${nfmt(v)}` : (v: number) => `${nfmt(v)}${unit || ''}`;
  return (
    <ChartCard title={title} right={right}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={points} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`ga-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => (money && v >= 10000 ? `${Math.round(v / 10000)}만` : nfmt(v))} />
          <Tooltip {...tooltipStyle} formatter={(v: any) => [fmt(Number(v)), '']} />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} fill={`url(#ga-${color.replace('#', '')})`} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

// ===== 세로 막대 차트 =====
export const ColumnChart: React.FC<{ title?: string; right?: React.ReactNode; points: Point[]; color?: string; unit?: string; height?: number }> = ({ title, right, points, color = '#3b82f6', unit, height = 220 }) => (
  <ChartCard title={title} right={right}>
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={points} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => nfmt(v)} />
        <Tooltip {...tooltipStyle} cursor={{ fill: '#f8fafc' }} formatter={(v: any) => [`${nfmt(v)}${unit || ''}`, '']} />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} maxBarSize={46} />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);

// ===== 다색 막대 차트 (항목별 색상 지정) =====
export const CategoryBarChart: React.FC<{ title?: string; data: Slice[]; unit?: string; height?: number }> = ({ title, data, unit, height = 220 }) => (
  <ChartCard title={title}>
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => nfmt(v)} />
        <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} width={92} />
        <Tooltip {...tooltipStyle} cursor={{ fill: '#f8fafc' }} formatter={(v: any) => [`${nfmt(v)}${unit || ''}`, '']} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={26}>
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);

// ===== 미니 스파크라인 (KPI 카드용) =====
export const Sparkline: React.FC<{ points: number[]; color?: string; height?: number }> = ({ points, color = '#0d9488', height = 34 }) => {
  const data = points.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};
