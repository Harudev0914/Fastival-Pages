import React, { useState, useRef } from 'react';
import styles from './FilterBar.module.css';
import useOutsideClick from '../../hooks/useOutsideClick';

const FilterDropdown = ({ label, options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(options[0]);
  const dropdownRef = useRef(null);

  useOutsideClick(dropdownRef, () => setIsOpen(false));

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleSelect = (option) => {
    setSelected(option);
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className={`${styles.filterWrap} ${isOpen ? styles.open : ''}`} ref={dropdownRef}>
      <button className={`${styles.filterChip} ${selected !== options[0] ? styles.active : ''}`} onClick={toggleOpen}>
        <span>{selected}</span>
        <svg className={styles.caretIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      {isOpen && (
        <div className={styles.filterPanel}>
          {options.map((opt) => (
            <button key={opt} className={`${styles.filterOption} ${selected === opt ? styles.selected : ''}`} onClick={() => handleSelect(opt)}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
...

const FilterBar = ({ onFilterChange }) => {
  const filters = [
    { key: 'sort', label: '정렬', options: ['추천순', '최신순', '평점 높은순'] },
    { key: 'field', label: '분야', options: ['전체', '주방', '욕실', '거실'] },
    { key: 'size', label: '평수', options: ['전체', '20평대', '30평대', '40평대'] },
  ];

  return (
    <div className={styles.filterRow}>
      {filters.map(f => (
        <FilterDropdown key={f.key} {...f} onSelect={(val) => onFilterChange(f.key, val)} />
      ))}
    </div>
  );
};

export default FilterBar;
