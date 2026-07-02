import { useState } from 'react';
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import type { Category } from '../types';
import { Overlay } from './AddFilmModal';
import { nextOrder } from '../lib/films';

export function CategoryModal({ categories, onAdd, onRename, onDelete, onReorder, onClose }: {
  categories: Category[];
  onAdd: (name: string) => Promise<void>;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReorder: (orderedIds: string[]) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
  );
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    const ids = nextOrder(categories.map((c) => c.id), String(active.id), String(over.id));
    if (ids) onReorder(ids);
  };
  return (
    <Overlay onClose={onClose}>
      <h2 className="serif" style={{ color: 'var(--gold)', marginBottom: 12 }}>管理片单分类</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input placeholder="新分类名" value={name} onChange={(e) => setName(e.target.value)}
          style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid var(--gold)',
            background: 'transparent', color: 'var(--ink)' }} />
        <button disabled={!name.trim()} onClick={async () => { await onAdd(name.trim()); setName(''); }}
          style={{ padding: '8px 16px', borderRadius: 20, border: 'none',
            background: 'var(--gold)', color: '#2a0a12', fontWeight: 700 }}>添加</button>
      </div>
      <p style={{ color: '#9a7d52', fontSize: 12, marginBottom: 8 }}>按住 ⠿ 拖动可调整片单顺序</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {categories.map((c) => (
            <CategoryRow key={c.id} category={c} onRename={onRename} onDelete={onDelete} />
          ))}
        </SortableContext>
      </DndContext>
    </Overlay>
  );
}

function CategoryRow({ category: c, onRename, onDelete }: {
  category: Category;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: c.id });
  return (
    <div ref={setNodeRef} style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0',
      transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
      transition, touchAction: 'manipulation', position: 'relative',
      opacity: isDragging ? 0.65 : 1, zIndex: isDragging ? 10 : undefined,
      background: isDragging ? 'rgba(233,196,106,.08)' : undefined, borderRadius: 8 }}>
      <button aria-label={`拖动-${c.id}`} {...attributes} {...listeners}
        style={{ background: 'transparent', border: 'none', color: '#9a7d52',
          cursor: 'grab', fontSize: 15, padding: '0 2px', touchAction: 'none' }}>⠿</button>
      <input defaultValue={c.name}
        onBlur={(e) => e.target.value !== c.name && onRename(c.id, e.target.value)}
        style={{ flex: 1, padding: 6, borderRadius: 6, border: '1px solid rgba(233,196,106,.3)',
          background: 'transparent', color: 'var(--ink)' }} />
      <button aria-label={`删除-${c.id}`} onClick={() => onDelete(c.id)}
        style={{ background: 'transparent', border: 'none', color: '#ff8a8a' }}>✕</button>
    </div>
  );
}
