import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PosterCard } from './PosterCard';
import type { Film } from '../types';

const film: Film = {
  id: 'f1', title: '迷雾长夜', year: 2021, poster_url: null, tmdb_id: 1,
  overview: '', category_id: 'c1', added_by: 'pig', status: 'watchlist', created_at: '',
};

describe('PosterCard', () => {
  it('shows title, year, owner badge and triggers vote', async () => {
    const onVote = vi.fn();
    render(<PosterCard film={film} tally={{ pig: true, baby: false, count: 1 }} onVote={onVote} />);
    expect(screen.getByText('迷雾长夜')).toBeInTheDocument();
    expect(screen.getByText('2021')).toBeInTheDocument();
    expect(screen.getByLabelText('owner-pig')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /投/ }));
    expect(onVote).toHaveBeenCalledWith('f1');
  });
});
