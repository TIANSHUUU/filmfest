import { useState } from 'react';
import type { Film } from '../types';
import { IDENTITY_BADGE } from '../types';
import type { Tally } from '../lib/votes';

export function PosterCard({ film, tally, onVote }:
  { film: Film; tally: Tally; onVote: (id: string) => void }) {
  const ownerClass = film.added_by === 'pig' ? 'badge-you' : 'badge-ta';
  const [showComment, setShowComment] = useState(false);
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
    </div>
  );
}
