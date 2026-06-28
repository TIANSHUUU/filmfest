import type { Vote, Identity } from '../types';

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
