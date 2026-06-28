import { describe, it, expect } from 'vitest';
import { tallyForFilm, filmsInBallot } from './votes';
import type { Vote } from '../types';

const v = (film_id: string, voter: 'pig' | 'baby'): Vote =>
  ({ id: film_id + voter, film_id, voter, created_at: '' });

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
