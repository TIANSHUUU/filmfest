import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PosterCard } from './PosterCard';
import type { Film } from '../types';

const base: Film = {
  id: 'f1', title: '迷雾长夜', year: 2021, poster_url: null, tmdb_id: 1,
  overview: '', comment: null, category_id: 'c1', added_by: 'pig', status: 'watchlist', created_at: '',
};
const zero = { pig: false, baby: false, count: 0 };
const noop = {
  onVote: vi.fn(), onToggleWatched: vi.fn(), onDelete: vi.fn(),
};

describe('PosterCard', () => {
  it('shows title, year, owner badge and triggers vote', async () => {
    const onVote = vi.fn();
    render(<PosterCard film={base} tally={{ pig: true, baby: false, count: 1 }}
      onVote={onVote} onToggleWatched={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('迷雾长夜')).toBeInTheDocument();
    expect(screen.getByText('2021')).toBeInTheDocument();
    expect(screen.getByLabelText('owner-pig')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /投/ }));
    expect(onVote).toHaveBeenCalledWith('f1');
  });

  it('hides the comment icon when there is no comment', () => {
    render(<PosterCard film={base} tally={zero} {...noop} />);
    expect(screen.queryByLabelText('查看评论')).not.toBeInTheDocument();
  });

  it('shows 💬 and toggles a comment popover when the film has a comment', async () => {
    const film = { ...base, comment: '诺兰神作，必看' };
    render(<PosterCard film={film} tally={zero} {...noop} />);

    const btn = screen.getByLabelText('查看评论');
    expect(screen.queryByText('诺兰神作，必看')).not.toBeInTheDocument();
    await userEvent.click(btn);
    expect(screen.getByText('诺兰神作，必看')).toBeInTheDocument();
    await userEvent.click(btn);
    expect(screen.queryByText('诺兰神作，必看')).not.toBeInTheDocument();
  });

  it('marks a watchlist film as watched and deletes via callbacks', async () => {
    const onToggleWatched = vi.fn();
    const onDelete = vi.fn();
    render(<PosterCard film={base} tally={zero}
      onVote={vi.fn()} onToggleWatched={onToggleWatched} onDelete={onDelete} />);

    await userEvent.click(screen.getByRole('button', { name: /看过/ }));
    expect(onToggleWatched).toHaveBeenCalledWith('f1');

    await userEvent.click(screen.getByRole('button', { name: '删除' }));
    expect(onDelete).toHaveBeenCalledWith('f1');
  });

  it('shows a 退回待看 action for watched films', () => {
    render(<PosterCard film={{ ...base, status: 'watched' }} tally={zero} {...noop} />);
    expect(screen.getByRole('button', { name: /退回/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /看过/ })).not.toBeInTheDocument();
  });
});
