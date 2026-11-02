import type { Identity } from '../types';

// 2026-11-02：共享口令整个拿掉了。
//
// 那道门从一开始就是假的：Vite 在构建时把 VITE_APP_PASSPHRASE 的值直接编进
// JS 包，口令明文就躺在 tianshuuu.github.io 的公开 bundle 里，view-source 就能
// 读到。而 supabase/schema.sql 里 categories / films / votes 三张表的 RLS 写的是
// `for all using (true) with check (true)`，匿名本来就能读能写。所以它挡的只有
// 界面，从来没挡过数据——删掉它安全性一点不变。
//
// 剩下的「我是谁」不是鉴权，是投票要按身份区分，必须留着。
export function IdentityGate({ onReady }: { onReady: (id: Identity) => void }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <h1 className="serif" style={{ color: 'var(--gold)', fontSize: 44 }}>Tapasta电影节</h1>
      <div style={{ display: 'flex', gap: 16 }}>
        <button className="badge-you" onClick={() => onReady('pig')}
          style={{ padding: '14px 22px', borderRadius: 14, border: 'none', fontWeight: 800 }}>
          我是 🐷</button>
        <button className="badge-ta" onClick={() => onReady('baby')}
          style={{ padding: '14px 22px', borderRadius: 14, border: 'none', fontWeight: 800 }}>
          我是 宝宝</button>
      </div>
    </div>
  );
}
