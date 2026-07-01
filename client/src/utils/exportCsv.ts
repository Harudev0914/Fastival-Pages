// CSV 내보내기 유틸 (Excel 한글 깨짐 방지용 BOM 포함)
export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

const escapeCell = (v: string | number | null | undefined): string => {
  const s = v == null ? '' : String(v);
  // 큰따옴표·쉼표·개행 포함 시 큰따옴표로 감싸고 내부 " 는 "" 로 이스케이프
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

// 현재 날짜를 YYYYMMDD_HHmm 로 (파일명 접미사)
const stamp = (): string => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
};

// 컬럼 정의 + 행 배열 → CSV 파일 다운로드
export function exportToCsv<T>(filename: string, columns: CsvColumn<T>[], rows: T[]): void {
  const head = columns.map((c) => escapeCell(c.header)).join(',');
  const body = rows.map((r) => columns.map((c) => escapeCell(c.value(r))).join(',')).join('\r\n');
  const csv = `${head}\r\n${body}`;
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${stamp()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
