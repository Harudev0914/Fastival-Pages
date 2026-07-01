import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CalEvent {
  id: string | number;
  start: string;          // YYYY-MM-DD
  end?: string | null;    // YYYY-MM-DD (기간, 없으면 당일)
  label: string;
  sub?: string;
  color?: string;
  onClick?: () => void;
}

const WD = ['일', '월', '화', '수', '목', '금', '토'];
const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

// 시작 연/월을 외부에서 주입해야 Date.now 없이 동작
const MonthCalendar: React.FC<{ initialYear: number; initialMonth: number; events: CalEvent[] }> = ({ initialYear, initialMonth, events }) => {
  const [cur, setCur] = useState({ y: initialYear, m: initialMonth }); // m: 0-11

  const { y, m } = cur;
  const first = new Date(y, m, 1);
  const startWd = first.getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  // 날짜별 이벤트 매핑 (기간 이벤트는 각 날짜에 표시)
  const byDay = useMemo(() => {
    const map: Record<string, CalEvent[]> = {};
    events.forEach((e) => {
      if (!e.start) return;
      const s = e.start.slice(0, 10);
      const en = (e.end || e.start).slice(0, 10);
      for (let d = 1; d <= daysInMonth; d++) {
        const key = ymd(y, m, d);
        if (key >= s && key <= en) (map[key] = map[key] || []).push(e);
      }
    });
    return map;
  }, [events, y, m, daysInMonth]);

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWd; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const move = (delta: number) => {
    let nm = m + delta, ny = y;
    if (nm < 0) { nm = 11; ny--; } else if (nm > 11) { nm = 0; ny++; }
    setCur({ y: ny, m: nm });
  };

  const head: React.CSSProperties = { padding: '8px', textAlign: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8' };

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px', padding: '16px' }}>
        <button onClick={() => move(-1)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={18} /></button>
        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', minWidth: '140px', textAlign: 'center' }}>{y}년 {m + 1}월</span>
        <button onClick={() => move(1)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={18} /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderTop: '1px solid #f1f5f9' }}>
        {WD.map((w, i) => <div key={w} style={{ ...head, color: i === 0 ? '#dc2626' : i === 6 ? '#2563eb' : '#94a3b8' }}>{w}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map((d, idx) => {
          const key = d ? ymd(y, m, d) : `e${idx}`;
          const evs = d ? (byDay[key] || []) : [];
          return (
            <div key={key} style={{ minHeight: '104px', borderTop: '1px solid #f1f5f9', borderLeft: idx % 7 ? '1px solid #f1f5f9' : 'none', padding: '6px', background: d ? '#fff' : '#fafafa' }}>
              {d && <div style={{ fontSize: '0.78rem', fontWeight: 700, color: idx % 7 === 0 ? '#dc2626' : idx % 7 === 6 ? '#2563eb' : '#475569', marginBottom: '4px' }}>{d}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {evs.slice(0, 3).map((e) => (
                  <button key={`${e.id}-${key}`} onClick={e.onClick} title={`${e.label}${e.sub ? ' · ' + e.sub : ''}`}
                    style={{ textAlign: 'left', border: 'none', cursor: e.onClick ? 'pointer' : 'default', background: `${e.color || '#2563eb'}1a`, color: e.color || '#2563eb', borderLeft: `3px solid ${e.color || '#2563eb'}`, borderRadius: '4px', padding: '3px 6px', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {e.label}{e.sub ? <span style={{ fontWeight: 400, opacity: 0.8 }}> · {e.sub}</span> : null}
                  </button>
                ))}
                {evs.length > 3 && <span style={{ fontSize: '0.7rem', color: '#94a3b8', paddingLeft: '2px' }}>+{evs.length - 3}건</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthCalendar;
