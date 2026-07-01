import React from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';
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
}

const HANDLE_W = 48; // 드래그 핸들
const ORDER_W = 56;  // 순번
const FR_MIN = 200;  // fr/가변 컬럼 최소 px

// 'Nfr'/미지정은 minmax(최소, fr)로, px 지정은 그대로 사용
const toTrack = (w?: string) => (!w || w.endsWith('fr') ? `minmax(${FR_MIN}px, ${w || '1fr'})` : w);
const toMinPx = (w?: string) => {
  if (!w || w.endsWith('fr')) return FR_MIN;
  const n = parseInt(w, 10);
  return Number.isNaN(n) ? FR_MIN : n;
};

// 순번(드래그앤드랍) + 컬럼 렌더 + 빈상태를 공통 처리하는 게시판 테이블
function BoardTable<T>({ items, getId, columns, onReorder, loading, emptyMessage }: Props<T>) {
  const draggable = !!onReorder;
  const template = `${draggable ? `${HANDLE_W}px ${ORDER_W}px ` : ''}${columns.map((c) => toTrack(c.width)).join(' ')}`;
  // 모든 컬럼 최소폭 합 → 좁아지면 가로 스크롤(컬럼 찌그러짐/밀림 방지)
  const minWidth = (draggable ? HANDLE_W + ORDER_W : 0) + columns.reduce((sum, c) => sum + toMinPx(c.width), 0);

  const onDragEnd = (r: DropResult) => {
    if (!r.destination || !onReorder) return;
    const next = Array.from(items);
    const [moved] = next.splice(r.source.index, 1);
    next.splice(r.destination.index, 0, moved);
    onReorder(next);
  };

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
              {items.map((item, index) => (
                <div key={getId(item)} style={{ display: 'grid', gridTemplateColumns: template, borderBottom: '1px solid #f1f5f9', background: '#fff', alignItems: 'center' }}>
                  {cells(item, index)}
                </div>
              ))}
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
    </div>
  );
}

export default BoardTable;
