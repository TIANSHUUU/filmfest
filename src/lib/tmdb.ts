export interface TmdbMovie {
  tmdbId: number;
  title: string;
  year: number | null;
  posterUrl: string | null;
  overview: string;
}

const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

export async function searchMovies(query: string): Promise<TmdbMovie[]> {
  const q = query.trim();
  if (!q) return [];
  const key = import.meta.env.VITE_TMDB_API_KEY as string;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${key}` +
    `&query=${encodeURIComponent(q)}&language=zh-CN&include_adult=false`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`TMDB 搜索失败: ${resp.status}`);
  const data = await resp.json();
  return (data.results ?? []).map((r: any): TmdbMovie => ({
    tmdbId: r.id,
    title: r.title,
    year: r.release_date ? Number(r.release_date.slice(0, 4)) : null,
    posterUrl: r.poster_path ? `${IMG_BASE}${r.poster_path}` : null,
    overview: r.overview ?? '',
  }));
}
