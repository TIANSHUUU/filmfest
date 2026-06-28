import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const searchMovies = vi.fn();
vi.mock('../lib/tmdb', () => ({ searchMovies: (...a: any[]) => searchMovies(...a) }));

import { AddFilmModal } from './AddFilmModal';
import type { Category } from '../types';

const cats: Category[] = [{ id: 'c1', name: '剧情', sort_order: 0, created_by: 'pig', created_at: '' }];

beforeEach(() => searchMovies.mockReset());

describe('AddFilmModal', () => {
  it('searches TMDB and submits chosen movie with category and owner', async () => {
    searchMovies.mockResolvedValue([
      { tmdbId: 1, title: 'Whiplash', year: 2014, posterUrl: 'p', overview: 'o' },
    ]);
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<AddFilmModal categories={cats} identity="pig" onAdd={onAdd} onClose={vi.fn()} />);

    await userEvent.type(screen.getByPlaceholderText('片名…'), 'whiplash');
    await userEvent.click(screen.getByText('搜索'));
    await screen.findByText('Whiplash');
    await userEvent.click(screen.getByText('Whiplash'));
    await userEvent.click(screen.getByText('加入片单'));

    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Whiplash', year: 2014, poster_url: 'p', tmdb_id: 1,
      category_id: 'c1', added_by: 'pig',
    }));
  });
});
