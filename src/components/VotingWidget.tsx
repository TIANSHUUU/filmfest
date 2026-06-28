import { useState } from 'react';
import type { Film, Vote } from '../types';
import { filmsInBallot, tallyForFilm } from '../lib/votes';

export function VotingWidget({ films, votes, onVote }:
  { films: Film[]; votes: Vote[]; onVote: (id: string) => void }) {
  const [open, setOpen] = useState(true);
  const ballotIds = new Set(filmsInBallot(votes));
  const items = films.filter((f) => ballotIds.has(f.id));

  return (
    <div style={{ position: 'fixed', right: 24, bottom: 24, width: 300, zIndex: 20,
      background: 'linear-gradient(170deg,#2a0a12,#1a0508)',
      border: '1px solid rgba(233,196,106,.45)', borderRadius: 16,
      boxShadow: '0 16px 40px rgba(0,0,0,.6)', overflow: 'hidden' }}>
      <div onClick={() => setOpen(!open)} style={{ padding: '13px 16px', cursor: 'pointer',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'linear-gradient(135deg,#6a1b2a,#3a0d1a)' }}>
        <span className="serif" style={{ color: 'var(--gold)', fontWeight: 700 }}>投票中 · Ballot</span>
        <span style={{ color: '#bfa884' }}>{open ? '▾' : '▸'}</span>
      </div>
      {open && (
        <div style={{ padding: '8px 16px 16px' }}>
          {items.length === 0 && <p style={{ color: '#9a7d52', fontSize: 13, padding: '8px 0' }}>
            还没有投票。去海报上点 ♥ 发起吧。</p>}
          {items.map((f) => {
            const t = tallyForFilm(votes, f.id);
            return (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0',
                borderBottom: '1px solid rgba(233,196,106,.12)' }}>
                <span style={{ flex: 1, color: '#fff', fontSize: 13 }}>{f.title}</span>
                <span style={{ display: 'flex', gap: 3 }}>
                  {t.pig && <Dot cls="badge-you" label="🐷" />}
                  {t.baby && <Dot cls="badge-ta" label="宝" />}
                </span>
                <button onClick={() => onVote(f.id)} style={{ background: 'rgba(233,196,106,.14)',
                  border: '1px solid rgba(233,196,106,.45)', color: 'var(--gold)', fontSize: 11,
                  fontWeight: 700, padding: '5px 9px', borderRadius: 14 }}>切换</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Dot({ cls, label }: { cls: string; label: string }) {
  return <span className={cls} style={{ width: 18, height: 18, borderRadius: '50%',
    fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center',
    justifyContent: 'center' }}>{label}</span>;
}
