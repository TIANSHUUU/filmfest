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

  const watchlist = films.films.filter((f) => f.status === 'watchlist');
  const onVote = (filmId: string) => votes.toggle(filmId, identity);

  return (
    <div style={{ paddingBottom: 80 }}>
      <Nav identity={identity}
        onAddFilm={() => setShowAdd(true)}
        onManageCategories={() => setShowCats(true)} />

      <div style={{ padding: '22px 32px 4px' }}>
        <div className="serif" style={{ fontSize: 26, fontWeight: 700, color: '#fff' }}>待看片单</div>
        <p style={{ color: '#bfa884', marginTop: 4, fontSize: 13 }}>
          搜片加入、按分类陈列。右下角随时投票，决定下个 movie night 看哪部 🏆</p>
      </div>

      <PosterWall films={watchlist} categories={cats.categories} votes={votes.votes} onVote={onVote} />

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
