import type { Film, Category, Vote } from '../types';
import { PosterCard } from './PosterCard';
import { tallyForFilm } from '../lib/votes';

export function PosterWall({ films, categories, votes, onVote, onToggleWatched, onDelete }:
  { films: Film[]; categories: Category[]; votes: Vote[]; onVote: (id: string) => void;
    onToggleWatched: (id: string) => void; onDelete: (id: string) => void }) {
  const sections = [
    ...categories.map((c) => ({ key: c.id, name: c.name, items: films.filter((f) => f.category_id === c.id) })),
    { key: '__none', name: '未分类', items: films.filter((f) => !f.category_id || !categories.some((c) => c.id === f.category_id)) },
  ].filter((s) => s.items.length > 0);

  return (
    <div>
      {sections.map((s) => (
        <section key={s.key} style={{ padding: '24px 32px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12,
            borderBottom: '1px solid rgba(233,196,106,.16)', paddingBottom: 8 }}>
            <h2 className="serif" style={{ fontSize: 20, color: 'var(--gold)' }}>{s.name}</h2>
            <span style={{ color: '#9a7d52', fontSize: 12 }}>{s.items.length} 部</span>
          </div>
          <div style={{ display: 'grid', gap: 16, marginTop: 16,
            gridTemplateColumns: 'repeat(auto-fill,minmax(132px,1fr))' }}>
            {s.items.map((f) => (
              <PosterCard key={f.id} film={f} tally={tallyForFilm(votes, f.id)} onVote={onVote}
                onToggleWatched={onToggleWatched} onDelete={onDelete} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
