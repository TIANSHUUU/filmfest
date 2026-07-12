import { useState, useRef, useEffect } from 'react';
import type { Film, Vote } from '../types';
import { IDENTITY_BADGE } from '../types';
import { filmsInBallot, tallyForFilm, topBallotFilms, pickRandom } from '../lib/votes';

export function VotingWidget({ films, votes, onVote }:
  { films: Film[]; votes: Vote[]; onVote: (id: string) => void }) {
  const [open, setOpen] = useState(() =>
    typeof window.matchMedia !== 'function' || !window.matchMedia('(max-width: 640px)').matches);
  const [spinning, setSpinning] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const ballotIds = new Set(filmsInBallot(votes));
  const items = films.filter((f) => ballotIds.has(f.id));
  const candidates = topBallotFilms(films, votes);
  const winner = items.find((f) => f.id === winnerId) ?? null;

  const spin = () => {
    if (spinning || candidates.length === 0) return;
    setWinnerId(null);
    setSpinning(true);
    const start = Date.now();
    timer.current = window.setInterval(() => {
      setHighlightId(pickRandom(candidates)!.id);
      if (Date.now() - start > 1500) {
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
        const w = pickRandom(candidates)!;
        setHighlightId(w.id);
        setWinnerId(w.id);
        setSpinning(false);
      }
    }, 90);
  };

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
            const lit = f.id === highlightId;
            return (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px',
                margin: '0 -8px', borderRadius: 8,
                borderBottom: '1px solid rgba(233,196,106,.12)',
                background: lit ? 'rgba(233,196,106,.22)' : undefined,
                transition: 'background .08s' }}>
                <span style={{ flex: 1, color: '#fff', fontSize: 13 }}>{f.title}</span>
                <span style={{ display: 'flex', gap: 3 }}>
                  {t.pig && <Dot cls="badge-you" label={IDENTITY_BADGE.pig} />}
                  {t.baby && <Dot cls="badge-ta" label={IDENTITY_BADGE.baby} />}
                </span>
                <button onClick={() => onVote(f.id)} style={{ background: 'rgba(233,196,106,.14)',
                  border: '1px solid rgba(233,196,106,.45)', color: 'var(--gold)', fontSize: 11,
                  fontWeight: 700, padding: '5px 9px', borderRadius: 14 }}>切换</button>
              </div>
            );
          })}
          {candidates.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {winner && !spinning && (
                <div className="serif" style={{ textAlign: 'center', color: 'var(--gold-bright)',
                  fontSize: 15, marginBottom: 8 }}>🎉 今晚看《{winner.title}》</div>
              )}
              <button onClick={spin} disabled={spinning} style={{ width: '100%',
                background: spinning ? 'rgba(233,196,106,.3)' : 'linear-gradient(135deg,var(--gold-bright),#d4a843)',
                color: '#2a0a12', fontWeight: 800, fontSize: 13, padding: '9px', borderRadius: 12,
                border: 'none', cursor: spinning ? 'default' : 'pointer' }}>
                {spinning ? '🎬 抽选中…' : winner ? '🎬 再抽一次' : '🎬 帮我们选一部'}
              </button>
              {candidates.length > 1 && !spinning && !winner && (
                <p style={{ color: '#9a7d52', fontSize: 11, textAlign: 'center', marginTop: 6 }}>
                  {candidates.length} 部平票，交给命运 🎲</p>
              )}
            </div>
          )}
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
