import { useState } from 'react';
import type { Film, Identity } from '../types';
import { IDENTITY_BADGE, IDENTITY_LABEL } from '../types';
import type { Tally } from '../lib/votes';

export function PosterCard({ film, tally, onVote, onToggleWatched, onDelete, identity, onSetReview }:
  { film: Film; tally: Tally; onVote: (id: string) => void;
    onToggleWatched: (id: string) => void; onDelete: (id: string) => void;
    identity: Identity; onSetReview: (id: string, author: Identity, text: string | null) => void }) {
  const ownerClass = film.added_by === 'pig' ? 'badge-you' : 'badge-ta';
  const [showComment, setShowComment] = useState(false);
  const watched = film.status === 'watched';
  return (
    <div className="film">
      <div className="poster" style={{
        height: 190, borderRadius: 9, position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'flex-end', padding: 8,
        border: '1px solid rgba(255,255,255,.08)', boxShadow: '0 6px 18px rgba(0,0,0,.45)',
        backgroundImage: film.poster_url ? `url(${film.poster_url})` : undefined,
        backgroundSize: 'cover', backgroundPosition: 'center',
        backgroundColor: film.poster_url ? undefined : '#3a0d1a',
      }}>
        <span aria-label={`owner-${film.added_by}`} className={ownerClass} style={{
          position: 'absolute', top: 7, right: 7, width: 24, height: 24, borderRadius: '50%',
          fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center',
          justifyContent: 'center' }}>{IDENTITY_BADGE[film.added_by]}</span>
        {film.comment && (
          <button aria-label="查看评论" onClick={() => setShowComment((s) => !s)} style={{
            position: 'absolute', top: 7, left: 7, width: 24, height: 24, borderRadius: '50%',
            border: 'none', background: 'rgba(18,4,7,.78)', color: 'var(--gold)',
            fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💬</button>
        )}
        {film.comment && showComment && (
          <div style={{ position: 'absolute', top: 36, left: 7, right: 7, zIndex: 2,
            background: 'rgba(18,4,7,.95)', border: '1px solid rgba(233,196,106,.5)',
            borderRadius: 8, padding: '8px 10px', color: 'var(--ink)', fontSize: 12,
            lineHeight: 1.5, boxShadow: '0 6px 18px rgba(0,0,0,.6)' }}>{film.comment}</div>
        )}
        {!film.poster_url && (
          <span className="serif" style={{ color: '#fff', fontSize: 14, fontWeight: 700,
            textShadow: '0 1px 5px #000' }}>{film.title}</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 7 }}>
        <span style={{ color: '#9a7d52', fontSize: 11 }}>{film.year ?? ''}</span>
        <button onClick={() => onVote(film.id)} style={{
          background: tally.count ? 'var(--gold)' : 'rgba(233,196,106,.14)',
          color: tally.count ? '#2a0a12' : 'var(--gold)',
          border: '1px solid rgba(233,196,106,.45)', borderRadius: 14,
          fontSize: 11, fontWeight: 700, padding: '4px 10px' }}>
          ♥ 投 {tally.count > 0 ? tally.count : ''}
        </button>
      </div>
      <div className="serif" style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginTop: 4 }}>
        {film.poster_url ? film.title : ''}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
        <button onClick={() => onToggleWatched(film.id)} style={actionStyle}>
          {watched ? '↩ 退回待看' : '✓ 看过'}
        </button>
        <button aria-label="删除" onClick={() => onDelete(film.id)}
          style={{ ...actionStyle, flex: 'none', color: '#ff8a8a',
            borderColor: 'rgba(255,138,138,.4)' }}>🗑</button>
      </div>
      {watched && (
        <ReviewSection film={film} identity={identity} onSetReview={onSetReview} />
      )}
    </div>
  );
}

function ReviewSection({ film, identity, onSetReview }:
  { film: Film; identity: Identity;
    onSetReview: (id: string, author: Identity, text: string | null) => void }) {
  const mine = identity === 'pig' ? film.review_pig : film.review_baby;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(mine ?? '');

  const save = () => {
    onSetReview(film.id, identity, draft.trim() || null);
    setEditing(false);
  };

  const line = (author: Identity, text: string | null) => text ? (
    <div style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.5, marginTop: 4 }}>
      <b style={{ color: author === 'pig' ? 'var(--you)' : 'var(--ta)' }}>
        {IDENTITY_LABEL[author]}：</b>{text}
    </div>
  ) : null;

  return (
    <div style={{ marginTop: 8, borderTop: '1px dashed rgba(233,196,106,.18)', paddingTop: 8 }}>
      {line('pig', film.review_pig)}
      {line('baby', film.review_baby)}
      {editing ? (
        <div style={{ marginTop: 6 }}>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={2}
            placeholder="写两句短评…（像豆瓣短评）"
            style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: 12,
              padding: 6, borderRadius: 8, border: '1px solid var(--gold)',
              background: 'transparent', color: 'var(--ink)' }} />
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <button onClick={save} style={{ ...actionStyle, flex: 'none', color: '#2a0a12',
              background: 'var(--gold)', borderColor: 'var(--gold)' }}>保存</button>
            <button onClick={() => { setDraft(mine ?? ''); setEditing(false); }}
              style={{ ...actionStyle, flex: 'none' }}>取消</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setEditing(true)}
          style={{ ...actionStyle, flex: 'none', marginTop: 6 }}>
          {mine ? '编辑观后感' : '✍️ 写观后感'}
        </button>
      )}
    </div>
  );
}

const actionStyle: React.CSSProperties = {
  flex: 1, background: 'transparent', border: '1px solid rgba(233,196,106,.3)',
  color: '#c9b58a', borderRadius: 12, fontSize: 11, fontWeight: 600, padding: '4px 8px',
};
