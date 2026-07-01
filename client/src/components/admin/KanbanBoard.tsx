import React, { useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { card } from './shared';

export interface KanbanColumn { key: string; label: string; color: string; }

interface Props<T> {
  items: T[];
  getId: (item: T) => string | number;
  statusOf: (item: T) => string;
  columns: KanbanColumn[];
  renderCard: (item: T) => React.ReactNode;
  onMove: (id: string | number, toStatus: string) => void;
}

// 상태별 컬럼에 카드를 배치하고 드래그로 상태를 변경하는 칸반 보드
function KanbanBoard<T>({ items, getId, statusOf, columns, renderCard, onMove }: Props<T>) {
  const grouped = useMemo(() => {
    const m: Record<string, T[]> = {};
    columns.forEach((c) => { m[c.key] = []; });
    items.forEach((it) => { const s = statusOf(it); (m[s] = m[s] || []).push(it); });
    return m;
  }, [items, columns, statusOf]);

  const onDragEnd = (r: DropResult) => {
    if (!r.destination) return;
    const to = r.destination.droppableId;
    if (to === r.source.droppableId) return; // 같은 컬럼 내 순서변경은 무시(상태만 관리)
    onMove(r.draggableId, to);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns.length}, minmax(240px, 1fr))`, gap: '14px', overflowX: 'auto', paddingBottom: '6px' }}>
        {columns.map((col) => {
          const list = grouped[col.key] || [];
          return (
            <div key={col.key} style={{ background: '#f8fafc', borderRadius: '14px', border: '1px solid #eef2f6', display: 'flex', flexDirection: 'column', minWidth: '240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 16px', borderBottom: `2px solid ${col.color}` }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: col.color }} />
                <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.9rem' }}>{col.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.78rem', fontWeight: 700, color: col.color, background: `${col.color}15`, padding: '2px 9px', borderRadius: '999px' }}>{list.length}</span>
              </div>
              <Droppable droppableId={col.key}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}
                    style={{ flex: 1, padding: '10px', minHeight: '120px', display: 'flex', flexDirection: 'column', gap: '10px', background: snapshot.isDraggingOver ? `${col.color}0d` : 'transparent', borderRadius: '0 0 14px 14px', transition: 'background 0.15s' }}>
                    {list.length === 0 && !snapshot.isDraggingOver && (
                      <div style={{ textAlign: 'center', color: '#cbd5e1', fontSize: '0.82rem', padding: '24px 0' }}>비어 있음</div>
                    )}
                    {list.map((it, index) => (
                      <Draggable key={getId(it)} draggableId={String(getId(it))} index={index}>
                        {(p, snap) => (
                          <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}
                            style={{ ...card, padding: '13px 14px', cursor: 'grab', boxShadow: snap.isDragging ? '0 8px 20px rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.03) 0px 2px 6px', borderLeft: `3px solid ${col.color}`, ...p.draggableProps.style }}>
                            {renderCard(it)}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}

export default KanbanBoard;
