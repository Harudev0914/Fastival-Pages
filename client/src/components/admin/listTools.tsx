import React, { useCallback, useState } from 'react';
import { Download, Trash2, X } from 'lucide-react';

// ===== 행 선택 상태 훅 (BoardTable selectable 연동) =====
export function useRowSelection<Id extends string | number = number>() {
  const [selected, setSelected] = useState<Set<Id>>(new Set());
  const toggle = useCallback((id: Id) => setSelected((s) => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n;
  }), []);
  const toggleAll = useCallback((ids: Id[], checked: boolean) => setSelected((s) => {
    const n = new Set(s);
    if (checked) ids.forEach((id) => n.add(id)); else ids.forEach((id) => n.delete(id));
    return n;
  }), []);
  const clear = useCallback(() => setSelected(new Set()), []);
  return { selected, toggle, toggleAll, clear, count: selected.size };
}

// ===== CSV 내보내기 버튼 =====
export const ExportBtn: React.FC<{ onClick: () => void; label?: string; disabled?: boolean }> = ({ onClick, label = 'CSV 내보내기', disabled }) => (
  <button onClick={onClick} disabled={disabled} title={label}
    style={{ padding: '9px 16px', background: '#fff', color: disabled ? '#cbd5e1' : '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: disabled ? 'default' : 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
    <Download size={15} /> {label}
  </button>
);

// ===== 선택 시 노출되는 일괄 작업 바 =====
export const BulkBar: React.FC<{ count: number; onClear: () => void; onDelete?: () => void; extra?: React.ReactNode }> = ({ count, onClear, onDelete, extra }) => {
  if (count === 0) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', marginBottom: '12px', background: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: '10px' }}>
      <span style={{ fontWeight: 700, color: '#0e7490', fontSize: '0.88rem' }}>{count}개 선택됨</span>
      <div style={{ flex: 1 }} />
      {extra}
      {onDelete && (
        <button onClick={onDelete} style={{ padding: '7px 14px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
          <Trash2 size={14} /> 선택 삭제
        </button>
      )}
      <button onClick={onClear} title="선택 해제" style={{ padding: '7px', background: '#fff', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
        <X size={15} />
      </button>
    </div>
  );
};

// ===== 기간 프리셋 필터 (통계·목록 공용) =====
export type PeriodKey = 'all' | '1m' | '3m' | '6m' | '12m' | 'ytd';
export const PERIOD_LABEL: Record<PeriodKey, string> = { all: '전체 기간', '1m': '최근 1개월', '3m': '최근 3개월', '6m': '최근 6개월', '12m': '최근 12개월', ytd: '올해' };

// 기준일(YYYY-MM-DD) 이후만 통과하는 판별식. all이면 항상 통과
export function periodStart(period: PeriodKey): string | null {
  if (period === 'all') return null;
  const now = new Date();
  if (period === 'ytd') return `${now.getFullYear()}-01-01`;
  const months = period === '1m' ? 1 : period === '3m' ? 3 : period === '6m' ? 6 : 12;
  const d = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const PeriodSelect: React.FC<{ value: PeriodKey; onChange: (p: PeriodKey) => void }> = ({ value, onChange }) => (
  <select value={value} onChange={(e) => onChange(e.target.value as PeriodKey)}
    style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#334155' }}>
    {(Object.keys(PERIOD_LABEL) as PeriodKey[]).map((k) => <option key={k} value={k}>{PERIOD_LABEL[k]}</option>)}
  </select>
);

// 상태 필터 토글 칩 (캘린더/보드 공용)
export const FilterChips: React.FC<{
  options: { key: string; label: string; color: string }[];
  active: Set<string>;
  onToggle: (key: string) => void;
}> = ({ options, active, onToggle }) => (
  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
    {options.map((o) => {
      const on = active.has(o.key);
      return (
        <button key={o.key} onClick={() => onToggle(o.key)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '999px', border: `1px solid ${on ? o.color : '#e2e8f0'}`, background: on ? `${o.color}14` : '#fff', color: on ? o.color : '#94a3b8', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '3px', background: on ? o.color : '#cbd5e1' }} /> {o.label}
        </button>
      );
    })}
  </div>
);
