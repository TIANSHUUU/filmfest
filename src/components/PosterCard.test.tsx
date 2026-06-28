import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PosterCard } from './PosterCard';
import type { Film } from '../types';

const base: Film = {
  id: 'f1', title: '迷雾长夜', year: 2021, poster_url: null, tmdb_id: 1,
  overview: '', comment: null, category_id: 'c1', added_by: 'pig', status: 'watchlist', created_at: '',
};

describe('PosterCard', () => {
  it('shows title, year, owner badge and triggers vote', async () => {
    const onVote = vi.fn();
    render(<PosterCard film={base} tally={{ pig: true, baby: false, count: 1 }} onVote={onVote} />);
    expect(screen.getByText('迷雾长夜')).toBeInTheDocument();
    expect(screen.getByText('2021')).toBeInTheDocument();
    expect(screen.getByLabelText('owner-pig')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /投/ }));
    expect(onVote).toHaveBeenCalledWith('f1');
  });

  it('hides the comment icon when there is no comment', () => {
    render(<PosterCard film={base} tally={{ pig: false, baby: false, count: 0 }} onVote={vi.fn()} />);
    expect(screen.queryByLabelText('查看评论')).not.toBeInTheDocument();
  });

  it('shows 💬 and toggles a comment popover when the film has a comment', async () => {
    const film = { ...base, comment: '诺兰神作，必看' };
    render(<PosterCard film={film} tally={{ pig: false, baby: false, count: 0 }} onVote={vi.fn()} />);

    const btn = screen.getByLabelText('查看评论');
    expect(screen.queryByText('诺兰神作，必看')).not.toBeInTheDocument();
    await userEvent.click(btn);
    expect(screen.getByText('诺兰神作，必看')).toBeInTheDocument();
    await userEvent.click(btn);
    expect(screen.queryByText('诺兰神作，必看')).not.toBeInTheDocument();
  });
});
