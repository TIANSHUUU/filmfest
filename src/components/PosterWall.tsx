import type { ReactNode } from 'react';
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import type { Film, Category, Vote, Identity } from '../types';
import { PosterCard } from './PosterCard';
import { tallyForFilm } from '../lib/votes';
import { nextOrder } from '../lib/films';

export function PosterWall({ films, categories, votes, onVote, onToggleWatched, onDelete,
  onRenameCategory, identity, onSetReview, onSetComment, onSetCategory, onReorder }:
  { films: Film[]; categories: Category[]; votes: Vote[]; onVote: (id: string) => void;
    onToggleWatched: (id: string) => void; onDelete: (id: string) => void;
    onRenameCategory: (id: string) => void; identity: Identity;
    onSetReview: (id: string, author: Identity, text: string | null) => void;
    onSetComment: (id: string, text: string | null) => void;
    onSetCategory: (id: string, categoryId: string | null) => void;
    onReorder: (orderedIds: string[]) => void }) {
  const sections = [
    ...categories.map((c) => ({ id: c.id as string | null, name: c.name, items: films.filter((f) => f.category_id === c.id) })),
    { id: null, name: '未分类', items: films.filter((f) => !f.category_id || !categories.some((c) => c.id === f.category_id)) },
  ].filter((s) => s.items.length > 0);

  // 桌面按住拖 8px 才算拖拽（不影响点击跳 TMDB）；手机长按 250ms 才拖（不影响滚动）
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
  );

  const handleDragEnd = (items: Film[], { active, over }: DragEndEvent) => {
    if (!over) return;
    const ids = nextOrder(items.map((f) => f.id), String(active.id), String(over.id));
    if (ids) onReorder(ids);
  };

  return (
    <div>
      {sections.map((s) => (
        <section key={s.id ?? '__none'} className="section-pad">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10,
            borderBottom: '1px solid rgba(233,196,106,.16)', paddingBottom: 8 }}>
            <h2 className="serif" style={{ fontSize: 22, color: 'var(--gold)' }}>{s.name}</h2>
            {s.id && (
              <button aria-label={`重命名-${s.id}`} onClick={() => onRenameCategory(s.id!)}
                style={{ background: 'transparent', border: 'none', color: '#9a7d52',
                  fontSize: 13, padding: 0 }}>✏️</button>
            )}
            <span style={{ color: '#9a7d52', fontSize: 12 }}>{s.items.length} 部</span>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter}
            onDragEnd={(e) => handleDragEnd(s.items, e)}>
            <SortableContext items={s.items.map((f) => f.id)} strategy={rectSortingStrategy}>
              <div className="poster-grid">
                {s.items.map((f) => (
                  <SortableFilm key={f.id} id={f.id}>
                    <PosterCard film={f} tally={tallyForFilm(votes, f.id)} onVote={onVote}
                      categories={categories} onToggleWatched={onToggleWatched} onDelete={onDelete}
                      identity={identity} onSetReview={onSetReview} onSetComment={onSetComment}
                      onSetCategory={onSetCategory} />
                  </SortableFilm>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>
      ))}
    </div>
  );
}

function SortableFilm({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={{
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      transition, touchAction: 'manipulation', position: 'relative',
      opacity: isDragging ? 0.65 : 1, zIndex: isDragging ? 10 : undefined }}>
      {children}
    </div>
  );
}
