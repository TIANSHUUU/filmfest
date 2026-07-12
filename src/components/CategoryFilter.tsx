import type { Category } from '../types';

export function CategoryFilter({ categories, value, onChange }:
  { categories: Category[]; value: string; onChange: (value: string) => void }) {
  return (
    <select aria-label="筛选片单" className="cat-filter" value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ padding: '4px 8px', borderRadius: 10, fontSize: 13,
        fontFamily: 'inherit', background: 'transparent', color: '#c9b58a',
        border: '1px solid rgba(233,196,106,.3)', maxWidth: 160, flexShrink: 1, minWidth: 0 }}>
      <option value="">筛选片单</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
      <option value="__none">未分类</option>
    </select>
  );
}
