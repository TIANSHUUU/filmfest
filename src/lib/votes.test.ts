import { describe, it, expect } from 'vitest';
import { tallyForFilm, filmsInBallot, topBallotFilms, pickRandom } from './votes';
import type { Vote, Film } from '../types';

const v = (film_id: string, voter: 'pig' | 'baby'): Vote =>
  ({ id: film_id + voter, film_id, voter, created_at: '' });

const f = (id: string): Film => ({
  id, title: id, year: null, poster_url: null, tmdb_id: null, overview: '', comment: null,
  review_pig: null, review_baby: null, category_id: null, added_by: 'pig',
  status: 'watchlist', created_at: '',
});

describe('tallyForFilm', () => {
  it('reports who voted and count', () => {
    const votes = [v('a', 'pig'), v('a', 'baby'), v('b', 'pig')];
    expect(tallyForFilm(votes, 'a')).toEqual({ pig: true, baby: true, count: 2 });
    expect(tallyForFilm(votes, 'b')).toEqual({ pig: true, baby: false, count: 1 });
    expect(tallyForFilm(votes, 'c')).toEqual({ pig: false, baby: false, count: 0 });
  });
});

describe('filmsInBallot', () => {
  it('returns distinct film ids that have at least one vote', () => {
    const votes = [v('a', 'pig'), v('a', 'baby'), v('b', 'pig')];
    expect(filmsInBallot(votes).sort()).toEqual(['a', 'b']);
  });
});

describe('topBallotFilms', () => {
  it('returns only the films tied at the highest vote count', () => {
    const films = [f('a'), f('b'), f('c'), f('d')];
    // a:2, b:2, c:1, d:0
    const votes = [v('a', 'pig'), v('a', 'baby'), v('b', 'pig'), v('b', 'baby'), v('c', 'pig')];
    expect(topBallotFilms(films, votes).map((x) => x.id).sort()).toEqual(['a', 'b']);
  });

  it('returns the single leader when there is no tie', () => {
    const films = [f('a'), f('b')];
    const votes = [v('a', 'pig'), v('a', 'baby'), v('b', 'pig')];
    expect(topBallotFilms(films, votes).map((x) => x.id)).toEqual(['a']);
  });

  it('returns [] when nobody has voted', () => {
    expect(topBallotFilms([f('a'), f('b')], [])).toEqual([]);
  });
});

describe('pickRandom', () => {
  it('uses the rng to index into the list', () => {
    const items = ['a', 'b', 'c'];
    expect(pickRandom(items, () => 0)).toBe('a');
    expect(pickRandom(items, () => 0.99)).toBe('c');
  });

  it('returns null for an empty list', () => {
    expect(pickRandom([], () => 0)).toBeNull();
  });
});
