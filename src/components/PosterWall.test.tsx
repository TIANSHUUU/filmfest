import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PosterWall } from './PosterWall';
import type { Film, Category } from '../types';

const cats: Category[] = [
  { id: 'c1', name: '剧情', sort_order: 0, created_by: 'pig', created_at: '' },
  { id: 'c2', name: '科幻', sort_order: 1, created_by: 'baby', created_at: '' },
];
const mk = (id: string, cat: string | null): Film => ({
  id, title: 't' + id, year: 2020, poster_url: null, tmdb_id: null, overview: '', comment: null,
  review_pig: null, review_baby: null,
  category_id: cat, added_by: 'pig', status: 'watchlist', created_at: '',
});
const common = {
  onVote: vi.fn(), onToggleWatched: vi.fn(), onDelete: vi.fn(),
  onRenameCategory: vi.fn(), onSetReview: vi.fn(), onSetComment: vi.fn(),
  onSetCategories: vi.fn(), onReorder: vi.fn(), identity: 'pig' as const,
};

describe('PosterWall', () => {
  it('groups films by category and shows uncategorized section', () => {
    render(<PosterWall categories={cats} votes={[]}
      films={[mk('a', 'c1'), mk('b', 'c2'), mk('c', null)]} {...common} />);
    expect(screen.getByText(/剧情/)).toBeInTheDocument();
    expect(screen.getByText(/科幻/)).toBeInTheDocument();
    expect(screen.getByText(/未分类/)).toBeInTheDocument();
  });

  it('omits empty categories', () => {
    render(<PosterWall categories={cats} votes={[]} films={[mk('a', 'c1')]} {...common} />);
    expect(screen.queryByText(/科幻/)).not.toBeInTheDocument();
  });

  it('renames a category via its edit button', async () => {
    const onRenameCategory = vi.fn();
    render(<PosterWall categories={cats} votes={[]} films={[mk('a', 'c1')]}
      {...common} onRenameCategory={onRenameCategory} />);
    await userEvent.click(screen.getByLabelText('重命名-c1'));
    expect(onRenameCategory).toHaveBeenCalledWith('c1');
  });

  it('shows no rename button for the uncategorized section', () => {
    render(<PosterWall categories={cats} votes={[]} films={[mk('c', null)]} {...common} />);
    expect(screen.getByText(/未分类/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^重命名-/)).not.toBeInTheDocument();
  });
});
