import React, { useEffect, useRef, useState } from 'react';
import { SORT_OPTIONS, FIELD_OPTIONS, AREA_OPTIONS, BUDGET_OPTIONS } from '../../pages/ReviewDetail/reviewData';

const ChevronDown: React.FC = () => (
  <svg className="filter-dd__chev" width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CheckIcon: React.FC = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="#2563eb" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const FilterDropdown: React.FC<{ options: string[] }> = ({ options }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(options[0]);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = selected !== options[0]; // 기본값(라벨)이 아니면 활성 스타일

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className={`filter-dd ${open ? 'open' : ''}`} ref={ref}>
      <button
        type="button"
        className={`filter-dd__btn ${isActive ? 'active' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected}</span>
        <ChevronDown />
      </button>

      {open && (
        <ul className="filter-dd__menu" role="listbox">
          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                role="option"
                aria-selected={opt === selected}
                className={`filter-dd__opt ${opt === selected ? 'selected' : ''}`}
                onClick={() => { setSelected(opt); setOpen(false); }}
              >
                <span>{opt}</span>
                {opt === selected && <CheckIcon />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const FilterChipsRow: React.FC = () => {
  return (
    <div className="filter-row">
      <FilterDropdown options={SORT_OPTIONS} />
      <FilterDropdown options={FIELD_OPTIONS} />
      <FilterDropdown options={AREA_OPTIONS} />
      <FilterDropdown options={BUDGET_OPTIONS} />
    </div>
  );
};

export default FilterChipsRow;
