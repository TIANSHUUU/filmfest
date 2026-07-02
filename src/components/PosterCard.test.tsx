import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PosterCard } from './PosterCard';
import type { Film, Category } from '../types';

const base: Film = {
  id: 'f1', title: '迷雾长夜', year: 2021, poster_url: null, tmdb_id: 1,
  overview: '', comment: null, review_pig: null, review_baby: null,
  category_id: 'c1', added_by: 'pig', status: 'watchlist', created_at: '',
};
const cats: Category[] = [
  { id: 'c1', name: '比利怀尔德', sort_order: 0, created_by: 'pig', created_at: '' },
  { id: 'c2', name: '刘别谦', sort_order: 1, created_by: 'baby', created_at: '' },
];
const zero = { pig: false, baby: false, count: 0 };
const common = {
  onVote: vi.fn(), onToggleWatched: vi.fn(), onDelete: vi.fn(),
  onSetReview: vi.fn(), onSetComment: vi.fn(), onSetCategory: vi.fn(),
  categories: cats, identity: 'pig' as const,
};

describe('PosterCard', () => {
  it('shows title, year, owner badge and triggers vote', async () => {
    const onVote = vi.fn();
    render(<PosterCard film={base} tally={{ pig: true, baby: false, count: 1 }}
      {...common} onVote={onVote} />);
    expect(screen.getByText('迷雾长夜')).toBeInTheDocument();
    expect(screen.getByText('2021')).toBeInTheDocument();
    expect(screen.getByLabelText('owner-pig')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /投/ }));
    expect(onVote).toHaveBeenCalledWith('f1');
  });

  it('shows the 想看理由 text inline on the card when present', () => {
    const film = { ...base, comment: '诺兰神作，必看' };
    render(<PosterCard film={film} tally={zero} {...common} />);
    expect(screen.getByText(/诺兰神作，必看/)).toBeInTheDocument();
  });

  it('edits an existing reason by clicking the inline text', async () => {
    const onSetComment = vi.fn();
    const film = { ...base, comment: '想看' };
    render(<PosterCard film={film} tally={zero} {...common} onSetComment={onSetComment} />);

    await userEvent.click(screen.getByLabelText('想看理由'));
    const ta = screen.getByPlaceholderText(/为什么想看/);
    await userEvent.clear(ta);
    await userEvent.type(ta, '冲影评去的');
    await userEvent.click(screen.getByText('保存'));
    expect(onSetComment).toHaveBeenCalledWith('f1', '冲影评去的');
  });

  it('adds a reason via the 写想看理由 entry when none exists', async () => {
    const onSetComment = vi.fn();
    render(<PosterCard film={base} tally={zero} {...common} onSetComment={onSetComment} />);

    expect(screen.queryByLabelText('想看理由')).not.toBeInTheDocument();
    await userEvent.click(screen.getByText(/写想看理由/));
    await userEvent.type(screen.getByPlaceholderText(/为什么想看/), '朋友推荐');
    await userEvent.click(screen.getByText('保存'));
    expect(onSetComment).toHaveBeenCalledWith('f1', '朋友推荐');
  });

  it('keeps the poster free of comment controls', () => {
    const film = { ...base, comment: '想看' };
    render(<PosterCard film={film} tally={zero} {...common} />);
    const poster = screen.getByLabelText('打开 TMDB 页面');
    expect(poster.querySelector('[aria-label="想看理由"]')).toBeNull();
  });

  it('opens the TMDB page in a new tab when the poster is clicked', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<PosterCard film={base} tally={zero} {...common} />);
    await userEvent.click(screen.getByLabelText('打开 TMDB 页面'));
    expect(open).toHaveBeenCalledWith(
      'https://www.themoviedb.org/movie/1?language=zh-CN', '_blank', 'noopener');
    open.mockRestore();
  });

  it('has no TMDB link when the film lacks a tmdb_id', () => {
    render(<PosterCard film={{ ...base, tmdb_id: null }} tally={zero} {...common} />);
    expect(screen.queryByLabelText('打开 TMDB 页面')).not.toBeInTheDocument();
  });

  it('shows the overview below the title and expands on click', async () => {
    const film = { ...base, overview: '一位少年鼓手进入顶级音乐学院后的故事。' };
    render(<PosterCard film={film} tally={zero} {...common} />);
    const el = screen.getByText('一位少年鼓手进入顶级音乐学院后的故事。');
    expect(el).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(el);
    expect(el).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders no overview block when the film has none', () => {
    render(<PosterCard film={base} tally={zero} {...common} />);
    expect(screen.queryByLabelText('简介')).not.toBeInTheDocument();
  });

  it('marks a watchlist film as watched and deletes via callbacks', async () => {
    const onToggleWatched = vi.fn();
    const onDelete = vi.fn();
    render(<PosterCard film={base} tally={zero}
      {...common} onToggleWatched={onToggleWatched} onDelete={onDelete} />);

    await userEvent.click(screen.getByRole('button', { name: /看过/ }));
    expect(onToggleWatched).toHaveBeenCalledWith('f1');

    await userEvent.click(screen.getByRole('button', { name: '删除' }));
    expect(onDelete).toHaveBeenCalledWith('f1');
  });

  it('hides the vote button on watched films', () => {
    render(<PosterCard film={{ ...base, status: 'watched' }} tally={zero} {...common} />);
    expect(screen.queryByRole('button', { name: /投/ })).not.toBeInTheDocument();
  });

  it('moves the film to another category via the edit button', async () => {
    const onSetCategory = vi.fn();
    render(<PosterCard film={base} tally={zero} {...common} onSetCategory={onSetCategory} />);
    await userEvent.click(screen.getByLabelText('编辑分类'));
    await userEvent.selectOptions(screen.getByLabelText('选择片单'), 'c2');
    expect(onSetCategory).toHaveBeenCalledWith('f1', 'c2');
  });

  it('can clear the category back to 未分类', async () => {
    const onSetCategory = vi.fn();
    render(<PosterCard film={base} tally={zero} {...common} onSetCategory={onSetCategory} />);
    await userEvent.click(screen.getByLabelText('编辑分类'));
    await userEvent.selectOptions(screen.getByLabelText('选择片单'), '');
    expect(onSetCategory).toHaveBeenCalledWith('f1', null);
  });

  it('shows a 退回待看 action for watched films', () => {
    render(<PosterCard film={{ ...base, status: 'watched' }} tally={zero} {...common} />);
    expect(screen.getByRole('button', { name: /退回/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /看过/ })).not.toBeInTheDocument();
  });

  it('has no review editor in the watchlist view', () => {
    render(<PosterCard film={base} tally={zero} {...common} />);
    expect(screen.queryByRole('button', { name: /观后感/ })).not.toBeInTheDocument();
  });

  it('lets the current user write a review on a watched film', async () => {
    const onSetReview = vi.fn();
    const film = { ...base, status: 'watched' as const };
    render(<PosterCard film={film} tally={zero} {...common} identity="pig" onSetReview={onSetReview} />);

    await userEvent.click(screen.getByRole('button', { name: /观后感/ }));
    await userEvent.type(screen.getByPlaceholderText(/短评/), '后劲很大');
    await userEvent.click(screen.getByText('保存'));
    expect(onSetReview).toHaveBeenCalledWith('f1', 'pig', '后劲很大');
  });

  it('displays both partners reviews on a watched film', () => {
    const film = { ...base, status: 'watched' as const, review_pig: '好看哭了', review_baby: '很催泪' };
    render(<PosterCard film={film} tally={zero} {...common} />);
    expect(screen.getByText(/好看哭了/)).toBeInTheDocument();
    expect(screen.getByText(/很催泪/)).toBeInTheDocument();
  });
});
