import type { Vote, Identity, Film } from '../types';

export interface Tally {
  pig: boolean;
  baby: boolean;
  count: number;
}

export function tallyForFilm(votes: Vote[], filmId: string): Tally {
  const forFilm = votes.filter((v) => v.film_id === filmId);
  const has = (who: Identity) => forFilm.some((v) => v.voter === who);
  return { pig: has('pig'), baby: has('baby'), count: forFilm.length };
}

export function filmsInBallot(votes: Vote[]): string[] {
  return [...new Set(votes.map((v) => v.film_id))];
}

// 得票最高的那一组影片（用于平票时随机抽选）；无人投票则返回空数组
export function topBallotFilms(films: Film[], votes: Vote[]): Film[] {
  const withCount = films
    .map((f) => ({ film: f, count: votes.filter((v) => v.film_id === f.id).length }))
    .filter((x) => x.count > 0);
  if (withCount.length === 0) return [];
  const max = Math.max(...withCount.map((x) => x.count));
  return withCount.filter((x) => x.count === max).map((x) => x.film);
}

export function pickRandom<T>(items: T[], rng: () => number = Math.random): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(rng() * items.length)];
}
