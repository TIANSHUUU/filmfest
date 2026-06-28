import { describe, it, expect, vi, beforeEach } from 'vitest';

const fromMock = vi.fn();
vi.mock('./supabase', () => ({ supabase: { from: (...a: any[]) => fromMock(...a) } }));

import { addFilm, toggleVote } from './db';

beforeEach(() => fromMock.mockReset());

describe('addFilm', () => {
  it('inserts a film row and returns it', async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: 'f1' }, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    fromMock.mockReturnValue({ insert });

    const res = await addFilm({
      title: 'Whiplash', year: 2014, poster_url: 'p', tmdb_id: 1,
      overview: 'o', category_id: 'c1', added_by: 'pig',
    });
    expect(fromMock).toHaveBeenCalledWith('films');
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ title: 'Whiplash', added_by: 'pig' }));
    expect(res).toEqual({ id: 'f1' });
  });
});

describe('toggleVote', () => {
  it('deletes when already voted', async () => {
    const match = vi.fn().mockResolvedValue({ error: null });
    const del = vi.fn(() => ({ match }));
    fromMock.mockReturnValue({ delete: del });

    await toggleVote('f1', 'pig', true);
    expect(del).toHaveBeenCalled();
    expect(match).toHaveBeenCalledWith({ film_id: 'f1', voter: 'pig' });
  });

  it('inserts when not voted', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    fromMock.mockReturnValue({ insert });

    await toggleVote('f1', 'baby', false);
    expect(insert).toHaveBeenCalledWith({ film_id: 'f1', voter: 'baby' });
  });
});
