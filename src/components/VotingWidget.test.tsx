import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VotingWidget } from './VotingWidget';
import type { Film, Vote } from '../types';

afterEach(() => vi.unstubAllGlobals());

const mk = (id: string, title: string): Film => ({
  id, title, year: 2020, poster_url: null, tmdb_id: null, overview: '', comment: null,
  review_pig: null, review_baby: null,
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

  it('starts collapsed on small screens', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    const votes: Vote[] = [{ id: '1', film_id: 'a', voter: 'pig', created_at: '' }];
    render(<VotingWidget films={[mk('a', '迷雾长夜')]} votes={votes} onVote={vi.fn()} />);
    expect(screen.queryByText('迷雾长夜')).not.toBeInTheDocument();
  });

  it('starts open on wide screens', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
    const votes: Vote[] = [{ id: '1', film_id: 'a', voter: 'pig', created_at: '' }];
    render(<VotingWidget films={[mk('a', '迷雾长夜')]} votes={votes} onVote={vi.fn()} />);
    expect(screen.getByText('迷雾长夜')).toBeInTheDocument();
  });

  it('can be opened manually after starting collapsed', async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    const votes: Vote[] = [{ id: '1', film_id: 'a', voter: 'pig', created_at: '' }];
    render(<VotingWidget films={[mk('a', '迷雾长夜')]} votes={votes} onVote={vi.fn()} />);
    await userEvent.click(screen.getByText(/投票中/));
    expect(screen.getByText('迷雾长夜')).toBeInTheDocument();
  });

  it('offers a random picker once at least one film has votes', () => {
    const votes: Vote[] = [{ id: '1', film_id: 'a', voter: 'pig', created_at: '' }];
    render(<VotingWidget films={[mk('a', '迷雾长夜')]} votes={votes} onVote={vi.fn()} />);
    expect(screen.getByRole('button', { name: /帮我们选/ })).toBeInTheDocument();
  });

  it('shows no random picker when nobody has voted', () => {
    render(<VotingWidget films={[mk('a', '迷雾长夜')]} votes={[]} onVote={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /帮我们选/ })).not.toBeInTheDocument();
  });

  it('shows a koala dot for baby votes', () => {
    const votes: Vote[] = [{ id: '1', film_id: 'a', voter: 'baby', created_at: '' }];
    render(<VotingWidget films={[mk('a', '迷雾长夜')]} votes={votes} onVote={vi.fn()} />);
    expect(screen.getByText('🐨')).toBeInTheDocument();
  });
});
