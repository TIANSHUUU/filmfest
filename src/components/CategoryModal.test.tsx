import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryModal } from './CategoryModal';
import type { Category } from '../types';

const cats: Category[] = [
  { id: 'c1', name: '剧情', sort_order: 0, created_by: 'pig', created_at: '' },
  { id: 'c2', name: '悬疑', sort_order: 1, created_by: 'baby', created_at: '' },
];
const common = {
  onAdd: vi.fn(), onRename: vi.fn(), onDelete: vi.fn(),
  onReorder: vi.fn(), onClose: vi.fn(),
};

describe('CategoryModal', () => {
  it('adds a new category', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<CategoryModal categories={cats} {...common} onAdd={onAdd} />);
    await userEvent.type(screen.getByPlaceholderText('新分类名'), '悬疑');
    await userEvent.click(screen.getByText('添加'));
    expect(onAdd).toHaveBeenCalledWith('悬疑');
  });

  it('deletes a category', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(<CategoryModal categories={cats} {...common} onDelete={onDelete} />);
    await userEvent.click(screen.getByLabelText('删除-c1'));
    expect(onDelete).toHaveBeenCalledWith('c1');
  });

  it('renders a drag handle for every category row', () => {
    render(<CategoryModal categories={cats} {...common} />);
    expect(screen.getByLabelText('拖动-c1')).toBeInTheDocument();
    expect(screen.getByLabelText('拖动-c2')).toBeInTheDocument();
  });
});
