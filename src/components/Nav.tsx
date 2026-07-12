import type { Identity } from '../types';
import { IDENTITY_LABEL } from '../types';

export function Nav({ identity, onAddFilm, onManageCategories }: {
  identity: Identity; onAddFilm: () => void; onManageCategories: () => void;
}) {
  return (
    <nav className="nav-bar" style={{ display: 'flex', alignItems: 'center', gap: 16,
      padding: '18px 32px', borderBottom: '1px solid rgba(233,196,106,.18)', position: 'sticky',
      top: 0, background: 'rgba(18,4,7,.85)', backdropFilter: 'blur(8px)', zIndex: 5 }}>
      <div className="serif nav-title" style={{ fontSize: 26, fontWeight: 700, color: 'var(--gold)' }}>
        Tapasta电影节</div>
      <button className="nav-btn" onClick={onManageCategories} style={{ background: 'transparent',
        border: '1px solid rgba(233,196,106,.4)', color: '#c9b58a', borderRadius: 20,
        padding: '6px 12px', fontSize: 13 }}>管理片单</button>
      <div style={{ flex: 1 }} />
      <button className="nav-add-btn" onClick={onAddFilm} style={{
        background: 'linear-gradient(135deg,var(--gold-bright),#d4a843)',
        color: '#2a0a12', fontWeight: 800, fontSize: 13, padding: '9px 16px', borderRadius: 22,
        border: 'none' }}>＋ 搜片添加</button>
      <span title={`当前：${IDENTITY_LABEL[identity]}`} className={`nav-avatar ${identity === 'pig' ? 'badge-you' : 'badge-ta'}`}
        style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontWeight: 800,
          fontSize: identity === 'pig' ? 14 : 11, flexShrink: 0 }}>{IDENTITY_LABEL[identity]}</span>
    </nav>
  );
}
