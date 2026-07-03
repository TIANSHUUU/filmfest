import { useState } from 'react';
import type { Film, Category, Identity } from '../types';
import { IDENTITY_BADGE, IDENTITY_LABEL } from '../types';
import type { Tally } from '../lib/votes';
import { formatRuntime, categoryIdsOf } from '../lib/films';

export function PosterCard({ film, tally, categories, onVote, onToggleWatched, onDelete,
  identity, onSetReview, onSetComment, onSetCategories }:
  { film: Film; tally: Tally; categories: Category[]; onVote: (id: string) => void;
    onToggleWatched: (id: string) => void; onDelete: (id: string) => void;
    identity: Identity; onSetReview: (id: string, author: Identity, text: string | null) => void;
    onSetComment: (id: string, text: string | null) => void;
    onSetCategories: (id: string, categoryIds: string[]) => void }) {
  const ownerClass = film.added_by === 'pig' ? 'badge-you' : 'badge-ta';
  const [editComment, setEditComment] = useState(false);
  const [commentDraft, setCommentDraft] = useState(film.comment ?? '');
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(false);
  const watched = film.status === 'watched';

  const startEditComment = () => { setCommentDraft(film.comment ?? ''); setEditComment(true); };
  const saveComment = () => {
    onSetComment(film.id, commentDraft.trim() || null);
    setEditComment(false);
  };
  const openTmdb = film.tmdb_id
    ? () => window.open(`https://www.themoviedb.org/movie/${film.tmdb_id}?language=zh-CN`,
        '_blank', 'noopener')
    : undefined;
  return (
    <div className="film">
      <div className="poster" role={openTmdb ? 'link' : undefined}
        aria-label={openTmdb ? '打开 TMDB 页面' : undefined} onClick={openTmdb} style={{
        aspectRatio: '2 / 3', borderRadius: 9, position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'flex-end', padding: 8,
        cursor: openTmdb ? 'pointer' : undefined,
        border: '1px solid rgba(255,255,255,.08)', boxShadow: '0 6px 18px rgba(0,0,0,.45)',
        backgroundImage: film.poster_url ? `url(${film.poster_url})` : undefined,
        backgroundSize: 'cover', backgroundPosition: 'center',
        backgroundColor: film.poster_url ? undefined : '#3a0d1a',
      }}>
        <span aria-label={`owner-${film.added_by}`} className={ownerClass} style={{
          position: 'absolute', top: 7, right: 7, width: 24, height: 24, borderRadius: '50%',
          fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center',
          justifyContent: 'center' }}>{IDENTITY_BADGE[film.added_by]}</span>
        {!film.poster_url && (
          <span style={{ color: '#fff', fontSize: 16, fontWeight: 700,
            textShadow: '0 1px 5px #000' }}>{film.title}</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 7 }}>
        <span style={{ color: '#9a7d52', fontSize: 12 }}>
          {[film.year ?? '', formatRuntime(film.runtime)].filter(Boolean).join(' · ')}</span>
        {!watched && (
          <button onClick={() => onVote(film.id)} style={{
            background: tally.count ? 'var(--gold)' : 'rgba(233,196,106,.14)',
            color: tally.count ? '#2a0a12' : 'var(--gold)',
            border: '1px solid rgba(233,196,106,.45)', borderRadius: 14,
            fontSize: 12, fontWeight: 700, padding: '4px 10px' }}>
            ♥ 投 {tally.count > 0 ? tally.count : ''}
          </button>
        )}
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginTop: 6, lineHeight: 1.3 }}>
        {film.poster_url ? film.title : ''}
      </div>
      {editComment ? (
        <div style={{ marginTop: 6 }}>
          <textarea value={commentDraft} onChange={(e) => setCommentDraft(e.target.value)}
            rows={3} placeholder="为什么想看…" autoFocus
            style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: 12,
              padding: 6, borderRadius: 6, border: '1px solid var(--gold)',
              background: 'transparent', color: 'var(--ink)' }} />
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <button onClick={saveComment} style={{ ...actionStyle, flex: 'none',
              color: '#2a0a12', background: 'var(--gold)', borderColor: 'var(--gold)' }}>保存</button>
            <button onClick={() => setEditComment(false)}
              style={{ ...actionStyle, flex: 'none' }}>取消</button>
          </div>
        </div>
      ) : film.comment ? (
        <div role="button" aria-label="想看理由" onClick={startEditComment}
          style={{ color: 'var(--gold-bright)', fontStyle: 'italic', fontSize: 12.5,
            marginTop: 5, lineHeight: 1.55, cursor: 'pointer', whiteSpace: 'pre-wrap' }}>
          💬 {film.comment}
        </div>
      ) : (
        <button onClick={startEditComment}
          style={{ background: 'transparent', border: 'none', color: '#9a7d52',
            fontSize: 12, padding: 0, marginTop: 5, textAlign: 'left' }}>
          ✍️ 写想看理由
        </button>
      )}
      {film.overview && (
        <div aria-label="简介" role="button" aria-expanded={overviewOpen}
          onClick={() => setOverviewOpen((s) => !s)}
          className={overviewOpen ? undefined : 'clamp-2'}
          style={{ fontSize: 12, color: '#bfa884', marginTop: 4, lineHeight: 1.55,
            cursor: 'pointer' }}>
          {film.overview}
        </div>
      )}
      <div className="action-row" style={{ display: 'flex', gap: 6, marginTop: 6 }}>
        <button onClick={() => onToggleWatched(film.id)}
          style={{ ...actionStyle, whiteSpace: 'nowrap' }}>
          {watched ? '↩ 退回待看' : '✓ 看过'}
        </button>
        <button aria-label="编辑分类" onClick={() => setEditCategory((s) => !s)}
          style={{ ...actionStyle, flex: 'none' }}>✏️</button>
        <button aria-label="删除" onClick={() => onDelete(film.id)}
          style={{ ...actionStyle, flex: 'none', color: '#ff8a8a',
            borderColor: 'rgba(255,138,138,.4)' }}>🗑</button>
      </div>
      {editCategory && (
        <div aria-label="选择片单" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
          {categories.map((c) => {
            const ids = categoryIdsOf(film);
            const on = ids.includes(c.id);
            return (
              <label key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', borderRadius: 14, cursor: 'pointer', fontSize: 12,
                border: `1px solid ${on ? 'var(--gold)' : 'rgba(233,196,106,.3)'}`,
                background: on ? 'rgba(233,196,106,.18)' : 'transparent',
                color: on ? 'var(--gold)' : 'var(--ink)' }}>
                <input type="checkbox" checked={on} style={{ accentColor: '#e9c46a' }}
                  onChange={() => onSetCategories(film.id,
                    on ? ids.filter((x) => x !== c.id) : [...ids, c.id])} />
                {c.name}
              </label>
            );
          })}
        </div>
      )}
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
  color: '#c9b58a', borderRadius: 12, fontSize: 12, fontWeight: 600, padding: '4px 8px',
};
