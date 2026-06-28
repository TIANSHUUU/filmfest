import { useState } from 'react';
import type { Identity } from './types';
import { useIdentity } from './hooks/useIdentity';
import { useCategories } from './hooks/useCategories';
import { useFilms } from './hooks/useFilms';
import { useVotes } from './hooks/useVotes';
import { IdentityGate } from './components/IdentityGate';
import { Nav } from './components/Nav';
import { PosterWall } from './components/PosterWall';
import { VotingWidget } from './components/VotingWidget';
import { AddFilmModal } from './components/AddFilmModal';
import { CategoryModal } from './components/CategoryModal';

export default function App() {
  const { identity, choose } = useIdentity();
  if (!identity) return <IdentityGate onReady={choose} />;
  return <Main identity={identity} />;
}

function Main({ identity }: { identity: Identity }) {
  const cats = useCategories();
  const films = useFilms();
  const votes = useVotes();
  const [showAdd, setShowAdd] = useState(false);
  const [showCats, setShowCats] = useState(false);
  const [view, setView] = useState<'watchlist' | 'watched'>('watchlist');

  const watchlist = films.films.filter((f) => f.status === 'watchlist');
  const watched = films.films.filter((f) => f.status === 'watched');
  const shown = view === 'watchlist' ? watchlist : watched;
  const onVote = (filmId: string) => votes.toggle(filmId, identity);

  const onToggleWatched = async (id: string) => {
    const f = films.films.find((x) => x.id === id);
    if (!f) return;
    await films.setStatus(id, f.status === 'watchlist' ? 'watched' : 'watchlist');
    await films.refresh();
  };

  const onDelete = async (id: string) => {
    const f = films.films.find((x) => x.id === id);
    if (f && window.confirm(`确定删除《${f.title}》？`)) {
      await films.remove(id);
      await films.refresh();
    }
  };

  const onRenameCategory = (id: string) => {
    const c = cats.categories.find((x) => x.id === id);
    if (!c) return;
    const name = window.prompt('重命名片单', c.name);
    if (name && name.trim() && name.trim() !== c.name) cats.rename(id, name.trim());
  };

  const onSetReview = async (id: string, author: Identity, text: string | null) => {
    await films.setReview(id, author, text);
    await films.refresh();
  };

  const onSetComment = async (id: string, text: string | null) => {
    await films.setComment(id, text);
    await films.refresh();
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    fontSize: 22, fontWeight: 700, padding: 0, background: 'transparent', border: 'none',
    color: active ? '#fff' : '#7a6748', borderBottom: active ? '2px solid var(--gold)' : '2px solid transparent',
  });

  return (
    <div style={{ paddingBottom: 80 }}>
      <Nav identity={identity}
        onAddFilm={() => setShowAdd(true)}
        onManageCategories={() => setShowCats(true)} />

      <div style={{ padding: '22px 32px 4px' }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'baseline' }}>
          <button className="serif" style={tabStyle(view === 'watchlist')}
            onClick={() => setView('watchlist')}>待看片单</button>
          <button className="serif" style={tabStyle(view === 'watched')}
            onClick={() => setView('watched')}>看过 ({watched.length})</button>
        </div>
        <p style={{ color: '#bfa884', marginTop: 6, fontSize: 13 }}>
          {view === 'watchlist'
            ? '搜片加入、按分类陈列。右下角随时投票，决定下个 movie night 看哪部 🏆'
            : '我们一起看过的电影，按分类珍藏 🎞️'}</p>
      </div>

      <PosterWall films={shown} categories={cats.categories} votes={votes.votes}
        onVote={onVote} onToggleWatched={onToggleWatched} onDelete={onDelete}
        onRenameCategory={onRenameCategory} identity={identity}
        onSetReview={onSetReview} onSetComment={onSetComment} />

      <VotingWidget films={watchlist} votes={votes.votes} onVote={onVote} />

      {showAdd && (
        <AddFilmModal categories={cats.categories} identity={identity}
          onAdd={async (input) => { await films.add(input); await films.refresh(); }}
          isDuplicate={(tmdbId, categoryId) =>
            tmdbId != null && films.films.some(
              (f) => f.tmdb_id === tmdbId && f.category_id === categoryId)}
          onClose={() => setShowAdd(false)} />
      )}
      {showCats && (
        <CategoryModal categories={cats.categories}
          onAdd={(name) => cats.add(name, identity)}
          onRename={cats.rename} onDelete={cats.remove}
          onClose={() => setShowCats(false)} />
      )}
    </div>
  );
}
