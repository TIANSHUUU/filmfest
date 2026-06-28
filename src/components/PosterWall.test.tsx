import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PosterWall } from './PosterWall';
import type { Film, Category } from '../types';

const cats: Category[] = [
  { id: 'c1', name: '剧情', sort_order: 0, created_by: 'pig', created_at: '' },
  { id: 'c2', name: '科幻', sort_order: 1, created_by: 'baby', created_at: '' },
];
const mk = (id: string, cat: string | null): Film => ({
  id, title: 't' + id, year: 2020, poster_url: null, tmdb_id: null, overview: '', comment: null,
  category_id: cat, added_by: 'pig', status: 'watchlist', created_at: '',
});

describe('PosterWall', () => {
  it('groups films by category and shows uncategorized section', () => {
    render(<PosterWall categories={cats} votes={[]}
      films={[mk('a', 'c1'), mk('b', 'c2'), mk('c', null)]}
      onVote={vi.fn()} onToggleWatched={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/剧情/)).toBeInTheDocument();
    expect(screen.getByText(/科幻/)).toBeInTheDocument();
    expect(screen.getByText(/未分类/)).toBeInTheDocument();
  });

  it('omits empty categories', () => {
    render(<PosterWall categories={cats} votes={[]} films={[mk('a', 'c1')]}
      onVote={vi.fn()} onToggleWatched={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.queryByText(/科幻/)).not.toBeInTheDocument();
  });
});
