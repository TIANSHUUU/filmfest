import type { Film, Category, Vote, Identity } from '../types';
import { PosterCard } from './PosterCard';
import { tallyForFilm } from '../lib/votes';

export function PosterWall({ films, categories, votes, onVote, onToggleWatched, onDelete,
  onRenameCategory, identity, onSetReview }:
  { films: Film[]; categories: Category[]; votes: Vote[]; onVote: (id: string) => void;
    onToggleWatched: (id: string) => void; onDelete: (id: string) => void;
    onRenameCategory: (id: string) => void; identity: Identity;
    onSetReview: (id: string, author: Identity, text: string | null) => void }) {
  const sections = [
    ...categories.map((c) => ({ id: c.id as string | null, name: c.name, items: films.filter((f) => f.category_id === c.id) })),
    { id: null, name: '未分类', items: films.filter((f) => !f.category_id || !categories.some((c) => c.id === f.category_id)) },
  ].filter((s) => s.items.length > 0);

  return (
    <div>
      {sections.map((s) => (
        <section key={s.id ?? '__none'} style={{ padding: '24px 32px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10,
            borderBottom: '1px solid rgba(233,196,106,.16)', paddingBottom: 8 }}>
            <h2 className="serif" style={{ fontSize: 22, color: 'var(--gold)' }}>{s.name}</h2>
            {s.id && (
              <button aria-label={`重命名-${s.id}`} onClick={() => onRenameCategory(s.id!)}
                style={{ background: 'transparent', border: 'none', color: '#9a7d52',
                  fontSize: 13, padding: 0 }}>✏️</button>
            )}
            <span style={{ color: '#9a7d52', fontSize: 12 }}>{s.items.length} 部</span>
          </div>
          <div style={{ display: 'grid', gap: 16, marginTop: 16,
            gridTemplateColumns: 'repeat(auto-fill,minmax(132px,1fr))' }}>
            {s.items.map((f) => (
              <PosterCard key={f.id} film={f} tally={tallyForFilm(votes, f.id)} onVote={onVote}
                onToggleWatched={onToggleWatched} onDelete={onDelete}
                identity={identity} onSetReview={onSetReview} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
