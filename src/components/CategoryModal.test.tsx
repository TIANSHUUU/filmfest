import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryModal } from './CategoryModal';
import type { Category } from '../types';

const cats: Category[] = [{ id: 'c1', name: '剧情', sort_order: 0, created_by: 'pig', created_at: '' }];

describe('CategoryModal', () => {
  it('adds a new category', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<CategoryModal categories={cats} onAdd={onAdd}
      onRename={vi.fn()} onDelete={vi.fn()} onClose={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText('新分类名'), '悬疑');
    await userEvent.click(screen.getByText('添加'));
    expect(onAdd).toHaveBeenCalledWith('悬疑');
  });

  it('deletes a category', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(<CategoryModal categories={cats} onAdd={vi.fn()}
      onRename={vi.fn()} onDelete={onDelete} onClose={vi.fn()} />);
    await userEvent.click(screen.getByLabelText('删除-c1'));
    expect(onDelete).toHaveBeenCalledWith('c1');
  });
});
