import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Nav } from './Nav';
import type { Category } from '../types';

const cats: Category[] = [
  { id: 'c1', name: '比利怀尔德', sort_order: 0, created_by: 'pig', created_at: '' },
];
const common = {
  identity: 'pig' as const, onAddFilm: vi.fn(), onManageCategories: vi.fn(),
  categories: cats, catFilter: '', onCatFilterChange: vi.fn(),
};

describe('Nav', () => {
  it('fires add and manage-category callbacks', async () => {
    const onAdd = vi.fn(); const onManage = vi.fn();
    render(<Nav {...common} onAddFilm={onAdd} onManageCategories={onManage} />);
    await userEvent.click(screen.getByText('＋ 搜片添加'));
    expect(onAdd).toHaveBeenCalled();
    await userEvent.click(screen.getByText('管理片单'));
    expect(onManage).toHaveBeenCalled();
  });

  it('renders the category filter next to 管理片单 and reports changes', async () => {
    const onCatFilterChange = vi.fn();
    render(<Nav {...common} onCatFilterChange={onCatFilterChange} />);
    await userEvent.selectOptions(screen.getByLabelText('筛选片单'), 'c1');
    expect(onCatFilterChange).toHaveBeenCalledWith('c1');
  });
});
