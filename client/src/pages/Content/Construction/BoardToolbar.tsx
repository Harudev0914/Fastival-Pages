import React from 'react';
import { Search } from 'lucide-react';
import { SELECT_STYLE } from '../../../components/UI/StyledSelect';
import { card, inputStyle } from './shared';

export interface SortOption { value: string; label: string; }

interface Props {
  search: string;
  onSearch: (v: string) => void;
  searchPlaceholder?: string;
  sort: string;
  onSort: (v: string) => void;
  sortOptions: SortOption[];
  active: string;
  onActive: (v: string) => void;
  children?: React.ReactNode; // 추가 필터(카테고리/유형 등)
  count?: number;
}

const sel = { ...(SELECT_STYLE as React.CSSProperties) };

// 게시판 공통 툴바: (추가필터) + 활성상태 + 검색 + 정렬 + 건수
const BoardToolbar: React.FC<Props> = ({ search, onSearch, searchPlaceholder = '검색', sort, onSort, sortOptions, active, onActive, children, count }) => (
  <div style={{ ...card, marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
    {children}
    <select style={sel} value={active} onChange={(e) => onActive(e.target.value)}>
      <option value="all">전체 상태</option>
      <option value="active">활성</option>
      <option value="inactive">비활성</option>
    </select>
    <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
      <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
      <input style={{ ...inputStyle, paddingLeft: '36px' }} placeholder={searchPlaceholder} value={search} onChange={(e) => onSearch(e.target.value)} />
    </div>
    <select style={sel} value={sort} onChange={(e) => onSort(e.target.value)}>
      {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    {count !== undefined && <span style={{ fontSize: '0.85rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{count}건</span>}
  </div>
);

export default BoardToolbar;
