import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VotingWidget } from './VotingWidget';
import type { Film, Vote } from '../types';

const mk = (id: string, title: string): Film => ({
  id, title, year: 2020, poster_url: null, tmdb_id: null, overview: '', comment: null,
  category_id: null, added_by: 'pig', status: 'watchlist', created_at: '',
});

describe('VotingWidget', () => {
  it('lists only films that have at least one vote', () => {
    const films = [mk('a', '迷雾长夜'), mk('b', '星河彼岸'), mk('c', '没人投')];
    const votes: Vote[] = [
      { id: '1', film_id: 'a', voter: 'pig', created_at: '' },
      { id: '2', film_id: 'b', voter: 'baby', created_at: '' },
    ];
    render(<VotingWidget films={films} votes={votes} onVote={vi.fn()} />);
    expect(screen.getByText('迷雾长夜')).toBeInTheDocument();
    expect(screen.getByText('星河彼岸')).toBeInTheDocument();
    expect(screen.queryByText('没人投')).not.toBeInTheDocument();
  });
});
