import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const searchMovies = vi.fn();
const fetchRuntime = vi.fn().mockResolvedValue(106);
vi.mock('../lib/tmdb', () => ({
  searchMovies: (...a: any[]) => searchMovies(...a),
  fetchRuntime: (...a: any[]) => fetchRuntime(...a),
}));

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
    await userEvent.click(screen.getByRole('checkbox', { name: '剧情' }));
    await userEvent.type(screen.getByPlaceholderText(/推荐理由/), '年度最佳');
    await userEvent.click(screen.getByText('加入片单'));

    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Whiplash', year: 2014, poster_url: 'p', tmdb_id: 1,
      category_ids: ['c1'], added_by: 'pig', comment: '年度最佳',
    }));
  });

  it('allows selecting multiple lists and can deselect', async () => {
    searchMovies.mockResolvedValue([
      { tmdbId: 1, title: 'Whiplash', year: 2014, posterUrl: 'p', overview: 'o' },
    ]);
    const multiCats: Category[] = [
      { id: 'c1', name: '剧情', sort_order: 0, created_by: 'pig', created_at: '' },
      { id: 'c2', name: '黑色电影', sort_order: 1, created_by: 'baby', created_at: '' },
    ];
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<AddFilmModal categories={multiCats} identity="pig" onAdd={onAdd} onClose={vi.fn()} />);

    await userEvent.type(screen.getByPlaceholderText('片名…'), 'whiplash');
    await userEvent.click(screen.getByText('搜索'));
    await screen.findByText('Whiplash');
    await userEvent.click(screen.getByText('Whiplash'));
    await userEvent.click(screen.getByRole('checkbox', { name: '剧情' }));
    await userEvent.click(screen.getByRole('checkbox', { name: '黑色电影' }));
    await userEvent.click(screen.getByRole('checkbox', { name: '剧情' })); // 取消勾选
    await userEvent.click(screen.getByText('加入片单'));

    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ category_ids: ['c2'] }));
  });

  it('submits null comment when left blank', async () => {
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

    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ comment: null }));
  });

  it('submits only once on a rapid double-click', async () => {
    searchMovies.mockResolvedValue([
      { tmdbId: 1, title: 'Whiplash', year: 2014, posterUrl: 'p', overview: 'o' },
    ]);
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<AddFilmModal categories={cats} identity="pig" onAdd={onAdd} onClose={vi.fn()} />);

    await userEvent.type(screen.getByPlaceholderText('片名…'), 'whiplash');
    await userEvent.click(screen.getByText('搜索'));
    await screen.findByText('Whiplash');
    await userEvent.click(screen.getByText('Whiplash'));
    await userEvent.dblClick(screen.getByText('加入片单'));

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('blocks adding a film already in the library and does not submit', async () => {
    searchMovies.mockResolvedValue([
      { tmdbId: 1, title: 'Whiplash', year: 2014, posterUrl: 'p', overview: 'o' },
    ]);
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<AddFilmModal categories={cats} identity="pig" onAdd={onAdd} onClose={vi.fn()}
      isDuplicate={() => true} />);

    await userEvent.type(screen.getByPlaceholderText('片名…'), 'whiplash');
    await userEvent.click(screen.getByText('搜索'));
    await screen.findByText('Whiplash');
    await userEvent.click(screen.getByText('Whiplash'));
    await userEvent.click(screen.getByText('加入片单'));

    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByText(/已经在片库/)).toBeInTheDocument();
  });
});
