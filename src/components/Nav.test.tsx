import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Nav } from './Nav';

describe('Nav', () => {
  it('fires add and manage-category callbacks', async () => {
    const onAdd = vi.fn(); const onManage = vi.fn();
    render(<Nav identity="pig" onAddFilm={onAdd} onManageCategories={onManage} />);
    await userEvent.click(screen.getByText('＋ 搜片添加'));
    expect(onAdd).toHaveBeenCalled();
    await userEvent.click(screen.getByText('管理分类'));
    expect(onManage).toHaveBeenCalled();
  });
});
