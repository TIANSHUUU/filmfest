import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryFilter } from './CategoryFilter';
import type { Category } from '../types';

const cats: Category[] = [
  { id: 'c1', name: '比利怀尔德', sort_order: 0, created_by: 'pig', created_at: '' },
  { id: 'c2', name: '刘别谦', sort_order: 1, created_by: 'baby', created_at: '' },
];

describe('CategoryFilter', () => {
  it('lists 全部片单, every category and 未分类', () => {
    render(<CategoryFilter categories={cats} value="" onChange={vi.fn()} />);
    const sel = screen.getByLabelText('筛选片单');
    const labels = Array.from(sel.querySelectorAll('option')).map((o) => o.textContent);
    expect(labels).toEqual(['全部片单', '比利怀尔德', '刘别谦', '未分类']);
  });

  it('reports the selected category id', async () => {
    const onChange = vi.fn();
    render(<CategoryFilter categories={cats} value="" onChange={onChange} />);
    await userEvent.selectOptions(screen.getByLabelText('筛选片单'), 'c2');
    expect(onChange).toHaveBeenCalledWith('c2');
  });

  it('reports 未分类 as __none', async () => {
    const onChange = vi.fn();
    render(<CategoryFilter categories={cats} value="" onChange={onChange} />);
    await userEvent.selectOptions(screen.getByLabelText('筛选片单'), '__none');
    expect(onChange).toHaveBeenCalledWith('__none');
  });
});
