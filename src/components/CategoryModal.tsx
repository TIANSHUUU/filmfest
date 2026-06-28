import { useState } from 'react';
import type { Category } from '../types';
import { Overlay } from './AddFilmModal';

export function CategoryModal({ categories, onAdd, onRename, onDelete, onClose }: {
  categories: Category[];
  onAdd: (name: string) => Promise<void>;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
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
      {categories.map((c) => (
        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
          <input defaultValue={c.name}
            onBlur={(e) => e.target.value !== c.name && onRename(c.id, e.target.value)}
            style={{ flex: 1, padding: 6, borderRadius: 6, border: '1px solid rgba(233,196,106,.3)',
              background: 'transparent', color: 'var(--ink)' }} />
          <button aria-label={`删除-${c.id}`} onClick={() => onDelete(c.id)}
            style={{ background: 'transparent', border: 'none', color: '#ff8a8a' }}>✕</button>
        </div>
      ))}
    </Overlay>
  );
}
