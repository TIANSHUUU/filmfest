import { describe, it, expect } from 'vitest';
import { sortFilms, nextOrder, formatRuntime, categoryIdsOf } from './films';
import type { Film } from '../types';

const mk = (id: string, created_at: string, sort_order?: number | null): Film => ({
  id, title: id, year: 2020, poster_url: null, tmdb_id: null, overview: '', comment: null,
  review_pig: null, review_baby: null, category_id: null, added_by: 'pig',
  status: 'watchlist', created_at, sort_order: sort_order ?? null,
});

describe('sortFilms', () => {
  it('orders by sort_order ascending when set', () => {
    const films = [mk('b', '2026-01-02', 2), mk('a', '2026-01-01', 1), mk('c', '2026-01-03', 3)];
    expect(sortFilms(films).map((f) => f.id)).toEqual(['a', 'b', 'c']);
  });

  it('falls back to newest-first when sort_order is missing (pre-migration rows)', () => {
    const films = [mk('old', '2026-01-01'), mk('new', '2026-06-30'), mk('mid', '2026-03-15')];
    expect(sortFilms(films).map((f) => f.id)).toEqual(['new', 'mid', 'old']);
  });

  it('puts unordered rows (0/null) before explicitly ordered ones, newest first', () => {
    const films = [mk('ordered', '2026-01-01', 5), mk('fresh', '2026-06-30', null)];
    expect(sortFilms(films).map((f) => f.id)).toEqual(['fresh', 'ordered']);
  });

  it('does not mutate the input array', () => {
    const films = [mk('b', '2026-01-02', 2), mk('a', '2026-01-01', 1)];
    sortFilms(films);
    expect(films.map((f) => f.id)).toEqual(['b', 'a']);
  });
});

describe('nextOrder', () => {
  it('moves the dragged id to the drop position', () => {
    expect(nextOrder(['a', 'b', 'c'], 'a', 'c')).toEqual(['b', 'c', 'a']);
    expect(nextOrder(['a', 'b', 'c'], 'c', 'a')).toEqual(['c', 'a', 'b']);
  });

  it('returns null when dropped on itself or on an unknown id', () => {
    expect(nextOrder(['a', 'b'], 'a', 'a')).toBeNull();
    expect(nextOrder(['a', 'b'], 'a', 'x')).toBeNull();
  });
});

describe('formatRuntime', () => {
  it('formats minutes with a 分钟 suffix', () => {
    expect(formatRuntime(106)).toBe('106分钟');
  });

  it('returns an empty string for null / 0 / undefined', () => {
    expect(formatRuntime(null)).toBe('');
    expect(formatRuntime(0)).toBe('');
    expect(formatRuntime(undefined)).toBe('');
  });
});

describe('categoryIdsOf', () => {
  const film = (over: Partial<Film>): Film => ({ ...mk('a', '2026-01-01'), ...over });

  it('returns category_ids when the film has them', () => {
    expect(categoryIdsOf(film({ category_ids: ['c1', 'c2'] }))).toEqual(['c1', 'c2']);
  });

  it('falls back to [category_id] for legacy single-category rows', () => {
    expect(categoryIdsOf(film({ category_id: 'c9', category_ids: undefined }))).toEqual(['c9']);
  });

  it('returns [] when the film is uncategorized', () => {
    expect(categoryIdsOf(film({ category_id: null, category_ids: [] }))).toEqual([]);
  });
});
