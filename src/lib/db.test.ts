import { describe, it, expect, vi, beforeEach } from 'vitest';

const fromMock = vi.fn();
vi.mock('./supabase', () => ({ supabase: { from: (...a: any[]) => fromMock(...a) } }));

import { addFilm, toggleVote, setReview, setComment, setFilmCategories, setFilmOrder,
  setCategoryOrder } from './db';

beforeEach(() => fromMock.mockReset());

describe('addFilm', () => {
  it('inserts a film row and returns it', async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: 'f1' }, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    fromMock.mockReturnValue({ insert });

    const res = await addFilm({
      title: 'Whiplash', year: 2014, poster_url: 'p', tmdb_id: 1,
      overview: 'o', comment: '年度最佳', runtime: 106, category_ids: ['c1'], added_by: 'pig',
    });
    expect(fromMock).toHaveBeenCalledWith('films');
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Whiplash', added_by: 'pig', comment: '年度最佳', category_ids: ['c1'] }));
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

describe('setReview', () => {
  it('updates the per-author review column', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    fromMock.mockReturnValue({ update });

    await setReview('f1', 'pig', '后劲很大');
    expect(fromMock).toHaveBeenCalledWith('films');
    expect(update).toHaveBeenCalledWith({ review_pig: '后劲很大' });
    expect(eq).toHaveBeenCalledWith('id', 'f1');
  });

  it('writes baby column for baby author and null to clear', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    fromMock.mockReturnValue({ update });

    await setReview('f1', 'baby', null);
    expect(update).toHaveBeenCalledWith({ review_baby: null });
  });
});

describe('setFilmCategories', () => {
  it('writes the category_ids array (and keeps category_id as the first, for legacy)', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    fromMock.mockReturnValue({ update });

    await setFilmCategories('f1', ['c2', 'c3']);
    expect(fromMock).toHaveBeenCalledWith('films');
    expect(update).toHaveBeenCalledWith({ category_ids: ['c2', 'c3'], category_id: 'c2' });
    expect(eq).toHaveBeenCalledWith('id', 'f1');
  });

  it('clears to 未分类 with an empty array', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    fromMock.mockReturnValue({ update });

    await setFilmCategories('f1', []);
    expect(update).toHaveBeenCalledWith({ category_ids: [], category_id: null });
  });
});

describe('setFilmOrder', () => {
  it('writes 1-based sort_order for each id in sequence', async () => {
    const calls: Array<{ patch: any; id: string }> = [];
    const update = vi.fn((patch: any) => ({
      eq: vi.fn((_col: string, id: string) => {
        calls.push({ patch, id });
        return Promise.resolve({ error: null });
      }),
    }));
    fromMock.mockReturnValue({ update });

    await setFilmOrder(['f2', 'f1', 'f3']);
    expect(fromMock).toHaveBeenCalledWith('films');
    expect(calls).toEqual([
      { patch: { sort_order: 1 }, id: 'f2' },
      { patch: { sort_order: 2 }, id: 'f1' },
      { patch: { sort_order: 3 }, id: 'f3' },
    ]);
  });
});

describe('setCategoryOrder', () => {
  it('writes 1-based sort_order for each category id in sequence', async () => {
    const calls: Array<{ patch: any; id: string }> = [];
    const update = vi.fn((patch: any) => ({
      eq: vi.fn((_col: string, id: string) => {
        calls.push({ patch, id });
        return Promise.resolve({ error: null });
      }),
    }));
    fromMock.mockReturnValue({ update });

    await setCategoryOrder(['c2', 'c1']);
    expect(fromMock).toHaveBeenCalledWith('categories');
    expect(calls).toEqual([
      { patch: { sort_order: 1 }, id: 'c2' },
      { patch: { sort_order: 2 }, id: 'c1' },
    ]);
  });
});

describe('setComment', () => {
  it('updates the comment column', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    fromMock.mockReturnValue({ update });

    await setComment('f1', '想看很久了');
    expect(fromMock).toHaveBeenCalledWith('films');
    expect(update).toHaveBeenCalledWith({ comment: '想看很久了' });
    expect(eq).toHaveBeenCalledWith('id', 'f1');
  });
});
