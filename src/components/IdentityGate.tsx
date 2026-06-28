import { useState } from 'react';
import type { Identity } from '../types';

export function IdentityGate({ onReady }: { onReady: (id: Identity) => void }) {
  const [pass, setPass] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [err, setErr] = useState('');

  const submit = () => {
    if (pass === import.meta.env.VITE_APP_PASSPHRASE) {
      setUnlocked(true); setErr('');
    } else {
      setErr('口令不对');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <h1 className="serif" style={{ color: 'var(--gold)' }}>我们的电影节</h1>
      {!unlocked ? (
        <>
          <input className="serif" placeholder="共享口令" type="password"
            value={pass} onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            style={{ padding: 10, borderRadius: 10, border: '1px solid var(--gold)',
              background: 'transparent', color: 'var(--ink)' }} />
          <button onClick={submit}
            style={{ padding: '8px 20px', borderRadius: 20, border: 'none',
              background: 'var(--gold)', color: '#2a0a12', fontWeight: 700 }}>进入</button>
          {err && <p style={{ color: '#ff8a8a' }}>{err}</p>}
        </>
      ) : (
        <div style={{ display: 'flex', gap: 16 }}>
          <button className="badge-you" onClick={() => onReady('pig')}
            style={{ padding: '14px 22px', borderRadius: 14, border: 'none', fontWeight: 800 }}>
            我是 🐷</button>
          <button className="badge-ta" onClick={() => onReady('baby')}
            style={{ padding: '14px 22px', borderRadius: 14, border: 'none', fontWeight: 800 }}>
            我是 宝宝</button>
        </div>
      )}
    </div>
  );
}
