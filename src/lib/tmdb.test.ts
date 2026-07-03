import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchMovies, fetchRuntime } from './tmdb';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  vi.stubEnv('VITE_TMDB_API_KEY', 'test-key');
});

describe('searchMovies', () => {
  it('maps TMDB results to TmdbMovie[]', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          { id: 1, title: 'Whiplash', release_date: '2014-10-10',
            poster_path: '/abc.jpg', overview: 'jazz' },
          { id: 2, title: 'NoDate', release_date: '', poster_path: null, overview: '' },
        ],
      }),
    });
    const res = await searchMovies('whiplash');
    expect(res[0]).toEqual({
      tmdbId: 1, title: 'Whiplash', year: 2014,
      posterUrl: 'https://image.tmdb.org/t/p/w500/abc.jpg', overview: 'jazz',
    });
    expect(res[1].year).toBeNull();
    expect(res[1].posterUrl).toBeNull();
  });

  it('returns [] for blank query', async () => {
    expect(await searchMovies('   ')).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('throws on non-ok response', async () => {
    (fetch as any).mockResolvedValue({ ok: false, status: 401 });
    await expect(searchMovies('x')).rejects.toThrow('TMDB 搜索失败: 401');
  });
});

describe('fetchRuntime', () => {
  it('returns the movie runtime in minutes', async () => {
    (fetch as any).mockResolvedValue({ ok: true, json: async () => ({ runtime: 106 }) });
    expect(await fetchRuntime(1)).toBe(106);
  });

  it('returns null when runtime is missing', async () => {
    (fetch as any).mockResolvedValue({ ok: true, json: async () => ({ runtime: 0 }) });
    expect(await fetchRuntime(1)).toBeNull();
  });

  it('returns null (never throws) on a failed request', async () => {
    (fetch as any).mockResolvedValue({ ok: false, status: 500 });
    expect(await fetchRuntime(1)).toBeNull();
  });
});
