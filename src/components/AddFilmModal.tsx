import { useState, useRef } from 'react';
import type { Category, Identity } from '../types';
import { searchMovies, fetchRuntime, type TmdbMovie } from '../lib/tmdb';

interface AddInput {
  title: string; year: number | null; poster_url: string | null;
  tmdb_id: number | null; overview: string | null; comment: string | null;
  runtime: number | null; category_id: string | null; added_by: Identity;
}

export function AddFilmModal({ categories, identity, onAdd, onClose, isDuplicate }: {
  categories: Category[]; identity: Identity;
  onAdd: (input: AddInput) => Promise<void>; onClose: () => void;
  isDuplicate?: (tmdbId: number | null, categoryId: string | null) => boolean;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TmdbMovie[]>([]);
  const [picked, setPicked] = useState<TmdbMovie | null>(null);
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id ?? '');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [dupMsg, setDupMsg] = useState('');
  const submittingRef = useRef(false);

  const doSearch = async () => {
    setLoading(true);
    try { setResults(await searchMovies(query)); } finally { setLoading(false); }
  };

  const submit = async () => {
    if (!picked || submittingRef.current) return;
    const targetCategory = categoryId || null;
    if (isDuplicate?.(picked.tmdbId, targetCategory)) {
      setDupMsg('这部已经在该片单里啦～');
      return;
    }
    submittingRef.current = true;
    const runtime = await fetchRuntime(picked.tmdbId);
    await onAdd({
      title: picked.title, year: picked.year, poster_url: picked.posterUrl,
      tmdb_id: picked.tmdbId, overview: picked.overview,
      comment: comment.trim() || null, runtime,
      category_id: targetCategory, added_by: identity,
    });
    onClose();
  };

  return (
    <Overlay onClose={onClose}>
      <h2 className="serif" style={{ color: 'var(--gold)', marginBottom: 12 }}>＋ 搜片添加</h2>
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="片名…" value={query} onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && doSearch()} style={inputStyle} />
        <button onClick={doSearch} style={btnStyle}>搜索</button>
      </div>
      {loading && <p style={{ marginTop: 10 }}>搜索中…</p>}
      <div style={{ maxHeight: 260, overflow: 'auto', marginTop: 12 }}>
        {results.map((m) => (
          <div key={m.tmdbId} onClick={() => setPicked(m)} style={{
            display: 'flex', gap: 10, padding: 8, borderRadius: 8, cursor: 'pointer',
            background: picked?.tmdbId === m.tmdbId ? 'rgba(233,196,106,.18)' : 'transparent' }}>
            {m.posterUrl && <img src={m.posterUrl} alt="" width={40} height={56} style={{ borderRadius: 4 }} />}
            <div><div style={{ color: '#fff' }}>{m.title}</div>
              <div style={{ color: '#9a7d52', fontSize: 12 }}>{m.year ?? '—'}</div></div>
          </div>
        ))}
      </div>
      {picked && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span>归入</span>
            <select value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setDupMsg(''); }} style={inputStyle}>
              <option value="">未分类</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <textarea placeholder="💬 推荐理由 / 为什么想看（可选）"
            value={comment} onChange={(e) => setComment(e.target.value)}
            rows={2} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
          {dupMsg && <p style={{ color: '#ff8a8a', margin: 0, fontSize: 13 }}>{dupMsg}</p>}
          <button onClick={submit} style={{ ...btnStyle, alignSelf: 'flex-start' }}>加入片单</button>
        </div>
      )}
    </Overlay>
  );
}

const inputStyle: React.CSSProperties = { padding: 8, borderRadius: 8,
  border: '1px solid var(--gold)', background: 'transparent', color: 'var(--ink)' };
const btnStyle: React.CSSProperties = { padding: '8px 16px', borderRadius: 20, border: 'none',
  background: 'var(--gold)', color: '#2a0a12', fontWeight: 700 };

export function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#1a0508',
        border: '1px solid rgba(233,196,106,.4)', borderRadius: 16, padding: 24,
        width: 'min(560px,100%)', maxHeight: '85vh', overflow: 'auto' }}>{children}</div>
    </div>
  );
}
