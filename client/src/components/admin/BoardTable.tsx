import React, { useEffect, useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { EmptyState, Spinner, card, th, td } from './shared';

export interface Column<T> {
  key: string;
  label: string;
  width?: string;            // grid track (기본 1fr)
  align?: 'left' | 'center';
  render: (item: T, index: number) => React.ReactNode;
}

interface Props<T> {
  items: T[];
  getId: (item: T) => string | number;
  columns: Column<T>[];
  onReorder?: (reordered: T[]) => void; // 없으면 순서변경 비활성(정적 테이블)
  loading?: boolean;
  emptyMessage: string;
  // 선택(체크박스) — 정적 테이블에서만 동작. selectedIds 제공 시 활성
  selectedIds?: Set<string | number>;
  onToggleSelect?: (id: string | number) => void;
  onToggleAll?: (ids: (string | number)[], checked: boolean) => void;
  // 클라이언트 페이지네이션(정적 테이블) — pageSize 제공 시 활성
  pageSize?: number;
}

const HANDLE_W = 48; // 드래그 핸들
const ORDER_W = 56;  // 순번
const CHECK_W = 44;  // 체크박스
const FR_MIN = 200;  // fr/가변 컬럼 최소 px

// 'Nfr'/미지정은 minmax(최소, fr)로, px 지정은 그대로 사용
const toTrack = (w?: string) => (!w || w.endsWith('fr') ? `minmax(${FR_MIN}px, ${w || '1fr'})` : w);
const toMinPx = (w?: string) => {
  if (!w || w.endsWith('fr')) return FR_MIN;
  const n = parseInt(w, 10);
  return Number.isNaN(n) ? FR_MIN : n;
};

// 순번(드래그앤드랍) + 컬럼 렌더 + 빈상태 + 선택 + 페이지네이션을 공통 처리하는 게시판 테이블
function BoardTable<T>({ items, getId, columns, onReorder, loading, emptyMessage, selectedIds, onToggleSelect, onToggleAll, pageSize }: Props<T>) {
  const draggable = !!onReorder;
  const selectable = !draggable && !!selectedIds && !!onToggleSelect;
  const [page, setPage] = useState(0);

  const totalPages = pageSize ? Math.max(1, Math.ceil(items.length / pageSize)) : 1;
  // 목록 길이/필터 변경 시 현재 페이지가 범위를 벗어나면 보정
  useEffect(() => { if (page > totalPages - 1) setPage(Math.max(0, totalPages - 1)); }, [page, totalPages]);
  const paged = useMemo(() => (pageSize && !draggable ? items.slice(page * pageSize, page * pageSize + pageSize) : items), [items, page, pageSize, draggable]);

  const template = `${draggable ? `${HANDLE_W}px ${ORDER_W}px ` : ''}${selectable ? `${CHECK_W}px ` : ''}${columns.map((c) => toTrack(c.width)).join(' ')}`;
  // 모든 컬럼 최소폭 합 → 좁아지면 가로 스크롤(컬럼 찌그러짐/밀림 방지)
  const minWidth = (draggable ? HANDLE_W + ORDER_W : 0) + (selectable ? CHECK_W : 0) + columns.reduce((sum, c) => sum + toMinPx(c.width), 0);

  const allIds = useMemo(() => paged.map((it) => getId(it)), [paged, getId]);
  const allChecked = selectable && allIds.length > 0 && allIds.every((id) => selectedIds!.has(id));

  const onDragEnd = (r: DropResult) => {
    if (!r.destination || !onReorder) return;
    const next = Array.from(items);
    const [moved] = next.splice(r.source.index, 1);
    next.splice(r.destination.index, 0, moved);
    onReorder(next);
  };

  const checkCell = (id: string | number) => (
    <div style={{ ...td, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <input type="checkbox" checked={selectedIds!.has(id)} onChange={() => onToggleSelect!(id)} style={{ width: '17px', height: '17px', cursor: 'pointer', accentColor: '#008b8b' }} />
    </div>
  );

  const cells = (item: T, index: number) => columns.map((c) => (
    <div key={c.key} style={{ ...td, textAlign: c.align || 'center', fontSize: '0.82rem', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {c.render(item, index)}
    </div>
  ));

  return (
    <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: `${minWidth}px` }}>
          {/* 헤더 */}
          <div style={{ display: 'grid', gridTemplateColumns: template, background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
            {draggable && <div style={th} />}
            {draggable && <div style={th}>순번</div>}
            {selectable && (
              <div style={{ ...th, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <input type="checkbox" checked={allChecked} onChange={(e) => onToggleAll?.(allIds, e.target.checked)} style={{ width: '17px', height: '17px', cursor: 'pointer', accentColor: '#008b8b' }} />
              </div>
            )}
            {columns.map((c) => (
              <div key={c.key} style={{ ...th, textAlign: c.align || 'center' }}>{c.label}</div>
            ))}
          </div>

          {loading ? (
            <Spinner />
          ) : items.length === 0 ? (
            <EmptyState message={emptyMessage} />
          ) : !draggable ? (
            <div>
              {paged.map((item, index) => {
                const id = getId(item);
                const checked = selectable && selectedIds!.has(id);
                return (
                  <div key={id} style={{ display: 'grid', gridTemplateColumns: template, borderBottom: '1px solid #f1f5f9', background: checked ? '#f0fdfa' : '#fff', alignItems: 'center' }}>
                    {selectable && checkCell(id)}
                    {cells(item, pageSize ? page * pageSize + index : index)}
                  </div>
                );
              })}
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="board">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {items.map((item, index) => (
                      <Draggable key={getId(item)} draggableId={String(getId(item))} index={index}>
                        {(p, snapshot) => (
                          <div
                            ref={p.innerRef}
                            {...p.draggableProps}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: template,
                              borderBottom: '1px solid #f1f5f9',
                              background: snapshot.isDragging ? '#f0fdfa' : '#fff',
                              alignItems: 'center',
                              ...p.draggableProps.style,
                            }}
                          >
                            <div {...p.dragHandleProps} style={{ display: 'flex', justifyContent: 'center', color: '#94a3b8', padding: '14px 0', cursor: 'grab' }}>
                              <GripVertical size={18} />
                            </div>
                            <div style={{ ...td, fontSize: '0.82rem' }}>{index + 1}</div>
                            {columns.map((c) => (
                              <div
                                key={c.key}
                                style={{ ...td, textAlign: c.align || 'center', fontSize: '0.82rem', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              >
                                {c.render(item, index)}
                              </div>
                            ))}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>

      {/* 페이지네이션 */}
      {!!pageSize && !draggable && !loading && items.length > pageSize && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '14px', borderTop: '1px solid #f1f5f9' }}>
          <PageBtn disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /></PageBtn>
          {Array.from({ length: totalPages }).map((_, i) => {
            // 현재 페이지 주변 ±2만 노출
            if (totalPages > 7 && Math.abs(i - page) > 2 && i !== 0 && i !== totalPages - 1) {
              if (i === page - 3 || i === page + 3) return <span key={i} style={{ color: '#cbd5e1', padding: '0 2px' }}>…</span>;
              return null;
            }
            return (
              <button key={i} onClick={() => setPage(i)} style={{ minWidth: '34px', height: '34px', borderRadius: '8px', border: '1px solid ' + (i === page ? '#008b8b' : '#e2e8f0'), background: i === page ? '#008b8b' : '#fff', color: i === page ? '#fff' : '#475569', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>{i + 1}</button>
            );
          })}
          <PageBtn disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}><ChevronRight size={16} /></PageBtn>
        </div>
      )}
    </div>
  );
}

const PageBtn: React.FC<{ disabled?: boolean; onClick: () => void; children: React.ReactNode }> = ({ disabled, onClick, children }) => (
  <button disabled={disabled} onClick={onClick} style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: disabled ? '#cbd5e1' : '#475569', cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</button>
);

export default BoardTable;
