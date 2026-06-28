# 家庭电影节网站 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 给两人自用的「家庭电影节」网站：搜片添加、海报墙按自定义分类陈列、归属标记、实时投票决定下次 movie night 看哪部。

**Architecture:** 纯静态 SPA（Vite + React + TS）部署到 GitHub Pages；Supabase 提供 Postgres + Realtime + Storage；TMDB 在浏览器端搜片取海报。逻辑单元（TMDB、投票聚合、身份、数据访问）用 Vitest 严格 TDD，UI 组件做渲染 + 关键交互测试。

**Tech Stack:** Vite, React 18, TypeScript, @supabase/supabase-js, Vitest, @testing-library/react, jsdom, GitHub Actions。

参考 spec：`docs/superpowers/specs/2026-06-27-family-film-festival-design.md`

---

## File Structure

```
.
├─ index.html
├─ package.json
├─ vite.config.ts            # base 路径(GitHub Pages) + vitest 配置
├─ tsconfig.json
├─ .env.example              # 环境变量样例
├─ supabase/schema.sql       # 建表 SQL（手动在 Supabase SQL editor 跑）
├─ .github/workflows/deploy.yml
├─ src/
│  ├─ main.tsx               # 入口
│  ├─ App.tsx                # 组合：身份门槛 + 主界面
│  ├─ types.ts               # 共享类型
│  ├─ theme.css              # 红毯主题 CSS 变量 + 全局样式
│  ├─ lib/
│  │  ├─ supabase.ts         # supabase client 单例
│  │  ├─ tmdb.ts             # TMDB 搜片
│  │  ├─ votes.ts            # 纯函数：投票聚合
│  │  └─ db.ts               # categories/films/votes 数据访问
│  ├─ hooks/
│  │  ├─ useIdentity.ts      # 身份 + localStorage
│  │  ├─ useCategories.ts
│  │  ├─ useFilms.ts
│  │  └─ useVotes.ts         # 含 Realtime 订阅
│  ├─ components/
│  │  ├─ IdentityGate.tsx    # 共享口令 + 选身份
│  │  ├─ Nav.tsx
│  │  ├─ PosterCard.tsx
│  │  ├─ PosterWall.tsx      # 按分类分区
│  │  ├─ AddFilmModal.tsx
│  │  ├─ CategoryModal.tsx
│  │  └─ VotingWidget.tsx
│  └─ test/setup.ts          # testing-library 配置
```

每个文件单一职责：`lib/*` 纯逻辑/IO，`hooks/*` 状态与订阅，`components/*` 展示与交互。

---

## Task 1: 项目脚手架与测试环境

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/test/setup.ts`, `.gitignore`

- [ ] **Step 1: 初始化 git 与 npm**

```bash
cd /Users/tantianshu/Documents/code/filmfest
git init
npm init -y
```

- [ ] **Step 2: 安装依赖**

```bash
npm install react react-dom @supabase/supabase-js
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom \
  vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 3: 写 `.gitignore`**

```
node_modules
dist
.env
.env.local
.superpowers/
```

- [ ] **Step 4: 写 `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"]
}
```

- [ ] **Step 5: 写 `vite.config.ts`**（`base` 为 GitHub Pages 仓库名，先设为 `/filmfest/`，部署时按实际仓库名改）

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/filmfest/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

- [ ] **Step 6: 写 `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 7: 写 `index.html`**

```html
<!doctype html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>我们的电影节</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: 写最小 `src/App.tsx` 和 `src/main.tsx`**

```tsx
// src/App.tsx
export default function App() {
  return <h1>我们的电影节</h1>;
}
```

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './theme.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 9: 加 npm scripts 到 `package.json`**

在 `"scripts"` 中加入：
```json
"dev": "vite",
"build": "tsc && vite build",
"preview": "vite preview",
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 10: 占位创建 `src/theme.css`（下一任务填充）**

```css
/* theme.css — 红毯主题，下个任务填充 */
:root { --gold:#e9c46a; }
```

- [ ] **Step 11: 冒烟测试** `src/App.test.tsx`

```tsx
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders title', () => {
  render(<App />);
  expect(screen.getByText('我们的电影节')).toBeInTheDocument();
});
```

- [ ] **Step 12: 跑测试确认通过**

Run: `npm test`
Expected: 1 passed

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite+React+TS with Vitest"
```

---

## Task 2: 共享类型与红毯主题 CSS

**Files:**
- Create: `src/types.ts`, 填充 `src/theme.css`

- [ ] **Step 1: 写 `src/types.ts`**

```ts
export type Identity = 'pig' | 'baby';

export const IDENTITY_LABEL: Record<Identity, string> = {
  pig: '🐷',
  baby: '宝宝',
};

export const IDENTITY_BADGE: Record<Identity, string> = {
  pig: '🐷',
  baby: '宝',
};

export interface Category {
  id: string;
  name: string;
  sort_order: number;
  created_by: Identity;
  created_at: string;
}

export interface Film {
  id: string;
  title: string;
  year: number | null;
  poster_url: string | null;
  tmdb_id: number | null;
  overview: string | null;
  category_id: string | null;
  added_by: Identity;
  status: 'watchlist' | 'watched';
  created_at: string;
}

export interface Vote {
  id: string;
  film_id: string;
  voter: Identity;
  created_at: string;
}
```

- [ ] **Step 2: 写 `src/theme.css`**（基于已确认的 mockup 样式）

```css
:root {
  --bg:#120407; --gold:#e9c46a; --gold-bright:#f5d27e; --crimson:#6a1b2a;
  --you:#e9c46a; --ta:#5ad1c2; --ink:#f3e3c0;
}
* { box-sizing:border-box; margin:0; padding:0; }
body {
  background:var(--bg);
  background-image:radial-gradient(circle at 50% -10%, #3a0d1a, var(--bg) 55%);
  color:var(--ink);
  font-family:"PingFang SC",-apple-system,"Helvetica Neue",sans-serif;
  min-height:100vh;
}
.serif { font-family:Georgia,"Songti SC",serif; }
button { cursor:pointer; font-family:inherit; }
.badge-you { background:var(--you); color:#2a0a12; }
.badge-ta  { background:var(--ta);  color:#06302b; }
```

- [ ] **Step 3: 类型编译检查**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: shared types and red-carpet theme"
```

---

## Task 3: Supabase schema 与 client

**Files:**
- Create: `supabase/schema.sql`, `src/lib/supabase.ts`, `.env.example`

- [ ] **Step 1: 写 `supabase/schema.sql`**（在 Supabase SQL editor 手动执行）

```sql
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0,
  created_by text not null check (created_by in ('pig','baby')),
  created_at timestamptz not null default now()
);

create table films (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  year int,
  poster_url text,
  tmdb_id int,
  overview text,
  category_id uuid references categories(id) on delete set null,
  added_by text not null check (added_by in ('pig','baby')),
  status text not null default 'watchlist' check (status in ('watchlist','watched')),
  created_at timestamptz not null default now()
);

create table votes (
  id uuid primary key default gen_random_uuid(),
  film_id uuid not null references films(id) on delete cascade,
  voter text not null check (voter in ('pig','baby')),
  created_at timestamptz not null default now(),
  unique (film_id, voter)
);

-- 两人自用：开放 anon 读写（靠共享口令做软门槛）。如需更严可后续加 RLS。
alter table categories enable row level security;
alter table films enable row level security;
alter table votes enable row level security;
create policy "anon all" on categories for all using (true) with check (true);
create policy "anon all" on films for all using (true) with check (true);
create policy "anon all" on votes for all using (true) with check (true);

-- 开启 Realtime（votes 用于实时投票）
alter publication supabase_realtime add table votes;
alter publication supabase_realtime add table films;
```

- [ ] **Step 2: 写 `.env.example`**

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_TMDB_API_KEY=your-tmdb-key
VITE_APP_PASSPHRASE=our-secret
```

- [ ] **Step 3: 写 `src/lib/supabase.ts`**

```ts
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);
```

- [ ] **Step 4: 提交（无测试，纯配置/IO 单例）**

```bash
git add -A
git commit -m "feat: supabase schema and client"
```

---

## Task 4: TMDB 搜片模块（TDD）

**Files:**
- Create: `src/lib/tmdb.ts`, `src/lib/tmdb.test.ts`

- [ ] **Step 1: 写失败测试 `src/lib/tmdb.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchMovies } from './tmdb';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  vi.stubEnv('VITE_TMDB_API_KEY', 'test-key');
});

describe('searchMovies', () => {
  it('maps TMDB results to TmdbMovie[]', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          { id: 1, title: 'Whiplash', release_date: '2014-10-10',
            poster_path: '/abc.jpg', overview: 'jazz' },
          { id: 2, title: 'NoDate', release_date: '', poster_path: null, overview: '' },
        ],
      }),
    });
    const res = await searchMovies('whiplash');
    expect(res[0]).toEqual({
      tmdbId: 1, title: 'Whiplash', year: 2014,
      posterUrl: 'https://image.tmdb.org/t/p/w500/abc.jpg', overview: 'jazz',
    });
    expect(res[1].year).toBeNull();
    expect(res[1].posterUrl).toBeNull();
  });

  it('returns [] for blank query', async () => {
    expect(await searchMovies('   ')).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('throws on non-ok response', async () => {
    (fetch as any).mockResolvedValue({ ok: false, status: 401 });
    await expect(searchMovies('x')).rejects.toThrow('TMDB 搜索失败: 401');
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/lib/tmdb.test.ts`
Expected: FAIL（`searchMovies` 未定义）

- [ ] **Step 3: 写实现 `src/lib/tmdb.ts`**

```ts
export interface TmdbMovie {
  tmdbId: number;
  title: string;
  year: number | null;
  posterUrl: string | null;
  overview: string;
}

const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

export async function searchMovies(query: string): Promise<TmdbMovie[]> {
  const q = query.trim();
  if (!q) return [];
  const key = import.meta.env.VITE_TMDB_API_KEY as string;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${key}` +
    `&query=${encodeURIComponent(q)}&language=zh-CN&include_adult=false`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`TMDB 搜索失败: ${resp.status}`);
  const data = await resp.json();
  return (data.results ?? []).map((r: any): TmdbMovie => ({
    tmdbId: r.id,
    title: r.title,
    year: r.release_date ? Number(r.release_date.slice(0, 4)) : null,
    posterUrl: r.poster_path ? `${IMG_BASE}${r.poster_path}` : null,
    overview: r.overview ?? '',
  }));
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/lib/tmdb.test.ts`
Expected: 3 passed

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: TMDB movie search"
```

---

## Task 5: 投票聚合纯函数（TDD）

**Files:**
- Create: `src/lib/votes.ts`, `src/lib/votes.test.ts`

- [ ] **Step 1: 写失败测试 `src/lib/votes.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { tallyForFilm, filmsInBallot } from './votes';
import type { Vote } from '../types';

const v = (film_id: string, voter: 'pig' | 'baby'): Vote =>
  ({ id: film_id + voter, film_id, voter, created_at: '' });

describe('tallyForFilm', () => {
  it('reports who voted and count', () => {
    const votes = [v('a', 'pig'), v('a', 'baby'), v('b', 'pig')];
    expect(tallyForFilm(votes, 'a')).toEqual({ pig: true, baby: true, count: 2 });
    expect(tallyForFilm(votes, 'b')).toEqual({ pig: true, baby: false, count: 1 });
    expect(tallyForFilm(votes, 'c')).toEqual({ pig: false, baby: false, count: 0 });
  });
});

describe('filmsInBallot', () => {
  it('returns distinct film ids that have at least one vote', () => {
    const votes = [v('a', 'pig'), v('a', 'baby'), v('b', 'pig')];
    expect(filmsInBallot(votes).sort()).toEqual(['a', 'b']);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/lib/votes.test.ts`
Expected: FAIL

- [ ] **Step 3: 写实现 `src/lib/votes.ts`**

```ts
import type { Vote, Identity } from '../types';

export interface Tally { pig: boolean; baby: boolean; count: number; }

export function tallyForFilm(votes: Vote[], filmId: string): Tally {
  const forFilm = votes.filter((v) => v.film_id === filmId);
  const has = (who: Identity) => forFilm.some((v) => v.voter === who);
  return { pig: has('pig'), baby: has('baby'), count: forFilm.length };
}

export function filmsInBallot(votes: Vote[]): string[] {
  return [...new Set(votes.map((v) => v.film_id))];
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/lib/votes.test.ts`
Expected: 2 passed

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: vote tally helpers"
```

---

## Task 6: 数据访问层 db.ts（TDD，mock supabase）

**Files:**
- Create: `src/lib/db.ts`, `src/lib/db.test.ts`

- [ ] **Step 1: 写失败测试 `src/lib/db.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const fromMock = vi.fn();
vi.mock('./supabase', () => ({ supabase: { from: (...a: any[]) => fromMock(...a) } }));

import { addFilm, toggleVote } from './db';

beforeEach(() => fromMock.mockReset());

describe('addFilm', () => {
  it('inserts a film row and returns it', async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: 'f1' }, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    fromMock.mockReturnValue({ insert });

    const res = await addFilm({
      title: 'Whiplash', year: 2014, poster_url: 'p', tmdb_id: 1,
      overview: 'o', category_id: 'c1', added_by: 'pig',
    });
    expect(fromMock).toHaveBeenCalledWith('films');
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ title: 'Whiplash', added_by: 'pig' }));
    expect(res).toEqual({ id: 'f1' });
  });
});

describe('toggleVote', () => {
  it('deletes when already voted', async () => {
    const match = vi.fn().mockResolvedValue({ error: null });
    const del = vi.fn(() => ({ match }));
    fromMock.mockReturnValue({ delete: del });

    await toggleVote('f1', 'pig', true);
    expect(del).toHaveBeenCalled();
    expect(match).toHaveBeenCalledWith({ film_id: 'f1', voter: 'pig' });
  });

  it('inserts when not voted', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    fromMock.mockReturnValue({ insert });

    await toggleVote('f1', 'baby', false);
    expect(insert).toHaveBeenCalledWith({ film_id: 'f1', voter: 'baby' });
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/lib/db.test.ts`
Expected: FAIL

- [ ] **Step 3: 写实现 `src/lib/db.ts`**

```ts
import { supabase } from './supabase';
import type { Category, Film, Vote, Identity } from '../types';

// ---- categories ----
export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order');
  if (error) throw error;
  return data as Category[];
}
export async function addCategory(name: string, created_by: Identity, sort_order: number) {
  const { data, error } = await supabase.from('categories')
    .insert({ name, created_by, sort_order }).select().single();
  if (error) throw error;
  return data as Category;
}
export async function renameCategory(id: string, name: string) {
  const { error } = await supabase.from('categories').update({ name }).eq('id', id);
  if (error) throw error;
}
export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// ---- films ----
export async function listFilms(): Promise<Film[]> {
  const { data, error } = await supabase.from('films').select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Film[];
}
export async function addFilm(input: {
  title: string; year: number | null; poster_url: string | null;
  tmdb_id: number | null; overview: string | null;
  category_id: string | null; added_by: Identity;
}): Promise<Film> {
  const { data, error } = await supabase.from('films')
    .insert({ ...input, status: 'watchlist' }).select().single();
  if (error) throw error;
  return data as Film;
}
export async function setFilmStatus(id: string, status: 'watchlist' | 'watched') {
  const { error } = await supabase.from('films').update({ status }).eq('id', id);
  if (error) throw error;
}
export async function deleteFilm(id: string) {
  const { error } = await supabase.from('films').delete().eq('id', id);
  if (error) throw error;
}

// ---- votes ----
export async function listVotes(): Promise<Vote[]> {
  const { data, error } = await supabase.from('votes').select('*');
  if (error) throw error;
  return data as Vote[];
}
export async function toggleVote(film_id: string, voter: Identity, alreadyVoted: boolean) {
  if (alreadyVoted) {
    const { error } = await supabase.from('votes').delete().match({ film_id, voter });
    if (error) throw error;
  } else {
    const { error } = await supabase.from('votes').insert({ film_id, voter });
    if (error) throw error;
  }
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/lib/db.test.ts`
Expected: 3 passed

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: supabase data access layer"
```

---

## Task 7: 身份 hook 与口令门槛（TDD + 组件）

**Files:**
- Create: `src/hooks/useIdentity.ts`, `src/hooks/useIdentity.test.ts`, `src/components/IdentityGate.tsx`, `src/components/IdentityGate.test.tsx`

- [ ] **Step 1: 写失败测试 `src/hooks/useIdentity.test.ts`**

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIdentity } from './useIdentity';

beforeEach(() => localStorage.clear());

describe('useIdentity', () => {
  it('starts null, persists choice', () => {
    const { result } = renderHook(() => useIdentity());
    expect(result.current.identity).toBeNull();
    act(() => result.current.choose('pig'));
    expect(result.current.identity).toBe('pig');
    expect(localStorage.getItem('ff-identity')).toBe('pig');
  });

  it('reads persisted identity on init', () => {
    localStorage.setItem('ff-identity', 'baby');
    const { result } = renderHook(() => useIdentity());
    expect(result.current.identity).toBe('baby');
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/hooks/useIdentity.test.ts`
Expected: FAIL

- [ ] **Step 3: 写实现 `src/hooks/useIdentity.ts`**

```ts
import { useState, useCallback } from 'react';
import type { Identity } from '../types';

const KEY = 'ff-identity';

export function useIdentity() {
  const [identity, setIdentity] = useState<Identity | null>(
    () => (localStorage.getItem(KEY) as Identity | null) ?? null
  );
  const choose = useCallback((id: Identity) => {
    localStorage.setItem(KEY, id);
    setIdentity(id);
  }, []);
  return { identity, choose };
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/hooks/useIdentity.test.ts`
Expected: 2 passed

- [ ] **Step 5: 写失败测试 `src/components/IdentityGate.test.tsx`**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IdentityGate } from './IdentityGate';

beforeEach(() => vi.stubEnv('VITE_APP_PASSPHRASE', 'sesame'));

describe('IdentityGate', () => {
  it('blocks wrong passphrase, then lets user pick identity', async () => {
    const onReady = vi.fn();
    render(<IdentityGate onReady={onReady} />);

    await userEvent.type(screen.getByPlaceholderText('共享口令'), 'wrong');
    await userEvent.click(screen.getByText('进入'));
    expect(screen.getByText('口令不对')).toBeInTheDocument();
    expect(onReady).not.toHaveBeenCalled();

    await userEvent.clear(screen.getByPlaceholderText('共享口令'));
    await userEvent.type(screen.getByPlaceholderText('共享口令'), 'sesame');
    await userEvent.click(screen.getByText('进入'));

    await userEvent.click(screen.getByText('我是 🐷'));
    expect(onReady).toHaveBeenCalledWith('pig');
  });
});
```

- [ ] **Step 6: 跑测试确认失败**

Run: `npx vitest run src/components/IdentityGate.test.tsx`
Expected: FAIL

- [ ] **Step 7: 写实现 `src/components/IdentityGate.tsx`**

```tsx
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
```

- [ ] **Step 8: 跑测试确认通过**

Run: `npx vitest run src/components/IdentityGate.test.tsx`
Expected: 1 passed

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: identity hook and passphrase gate"
```

---

## Task 8: 数据 hooks（categories / films / votes + Realtime）

**Files:**
- Create: `src/hooks/useCategories.ts`, `src/hooks/useFilms.ts`, `src/hooks/useVotes.ts`, `src/hooks/useVotes.test.ts`

- [ ] **Step 1: 写 `src/hooks/useCategories.ts`**

```ts
import { useState, useEffect, useCallback } from 'react';
import type { Category, Identity } from '../types';
import * as db from '../lib/db';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const refresh = useCallback(async () => setCategories(await db.listCategories()), []);
  useEffect(() => { refresh(); }, [refresh]);

  return {
    categories,
    refresh,
    add: async (name: string, by: Identity) => {
      await db.addCategory(name, by, categories.length);
      await refresh();
    },
    rename: async (id: string, name: string) => { await db.renameCategory(id, name); await refresh(); },
    remove: async (id: string) => { await db.deleteCategory(id); await refresh(); },
  };
}
```

- [ ] **Step 2: 写 `src/hooks/useFilms.ts`**

```ts
import { useState, useEffect, useCallback } from 'react';
import type { Film } from '../types';
import * as db from '../lib/db';
import { supabase } from '../lib/supabase';

export function useFilms() {
  const [films, setFilms] = useState<Film[]>([]);
  const refresh = useCallback(async () => setFilms(await db.listFilms()), []);

  useEffect(() => {
    refresh();
    const ch = supabase.channel('films-ch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'films' }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [refresh]);

  return {
    films,
    refresh,
    add: db.addFilm,
    setStatus: db.setFilmStatus,
    remove: db.deleteFilm,
  };
}
```

- [ ] **Step 3: 写失败测试 `src/hooks/useVotes.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

const listVotes = vi.fn();
const toggleVote = vi.fn();
vi.mock('../lib/db', () => ({
  listVotes: (...a: any[]) => listVotes(...a),
  toggleVote: (...a: any[]) => toggleVote(...a),
}));
const channelObj = { on: vi.fn().mockReturnThis(), subscribe: vi.fn().mockReturnThis() };
vi.mock('../lib/supabase', () => ({
  supabase: { channel: () => channelObj, removeChannel: vi.fn() },
}));

import { useVotes } from './useVotes';

beforeEach(() => { listVotes.mockReset(); toggleVote.mockReset(); });

describe('useVotes', () => {
  it('loads votes and toggles via db with current state', async () => {
    listVotes.mockResolvedValue([{ id: '1', film_id: 'a', voter: 'pig', created_at: '' }]);
    const { result } = renderHook(() => useVotes());
    await waitFor(() => expect(result.current.votes).toHaveLength(1));

    await act(async () => { await result.current.toggle('a', 'pig'); });
    expect(toggleVote).toHaveBeenCalledWith('a', 'pig', true); // already voted -> true
  });
});
```

- [ ] **Step 4: 跑测试确认失败**

Run: `npx vitest run src/hooks/useVotes.test.ts`
Expected: FAIL

- [ ] **Step 5: 写实现 `src/hooks/useVotes.ts`**

```ts
import { useState, useEffect, useCallback } from 'react';
import type { Vote, Identity } from '../types';
import * as db from '../lib/db';
import { supabase } from '../lib/supabase';

export function useVotes() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const refresh = useCallback(async () => setVotes(await db.listVotes()), []);

  useEffect(() => {
    refresh();
    const ch = supabase.channel('votes-ch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [refresh]);

  const toggle = useCallback(async (filmId: string, voter: Identity) => {
    const already = votes.some((v) => v.film_id === filmId && v.voter === voter);
    await db.toggleVote(filmId, voter, already);
    await refresh();
  }, [votes, refresh]);

  return { votes, toggle, refresh };
}
```

- [ ] **Step 6: 跑测试确认通过**

Run: `npx vitest run src/hooks/useVotes.test.ts`
Expected: 1 passed

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: data hooks with realtime subscriptions"
```

---

## Task 9: PosterCard 组件（TDD）

**Files:**
- Create: `src/components/PosterCard.tsx`, `src/components/PosterCard.test.tsx`

- [ ] **Step 1: 写失败测试 `src/components/PosterCard.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PosterCard } from './PosterCard';
import type { Film } from '../types';

const film: Film = {
  id: 'f1', title: '迷雾长夜', year: 2021, poster_url: null, tmdb_id: 1,
  overview: '', category_id: 'c1', added_by: 'pig', status: 'watchlist', created_at: '',
};

describe('PosterCard', () => {
  it('shows title, year, owner badge and triggers vote', async () => {
    const onVote = vi.fn();
    render(<PosterCard film={film} tally={{ pig: true, baby: false, count: 1 }} onVote={onVote} />);
    expect(screen.getByText('迷雾长夜')).toBeInTheDocument();
    expect(screen.getByText('2021')).toBeInTheDocument();
    expect(screen.getByLabelText('owner-pig')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /投/ }));
    expect(onVote).toHaveBeenCalledWith('f1');
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/components/PosterCard.test.tsx`
Expected: FAIL

- [ ] **Step 3: 写实现 `src/components/PosterCard.tsx`**

```tsx
import type { Film } from '../types';
import { IDENTITY_BADGE } from '../types';
import type { Tally } from '../lib/votes';

export function PosterCard({ film, tally, onVote }:
  { film: Film; tally: Tally; onVote: (id: string) => void }) {
  const ownerClass = film.added_by === 'pig' ? 'badge-you' : 'badge-ta';
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
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/components/PosterCard.test.tsx`
Expected: 1 passed

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: PosterCard with owner badge and vote button"
```

---

## Task 10: PosterWall（按分类分区）

**Files:**
- Create: `src/components/PosterWall.tsx`, `src/components/PosterWall.test.tsx`

- [ ] **Step 1: 写失败测试 `src/components/PosterWall.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PosterWall } from './PosterWall';
import type { Film, Category } from '../types';

const cats: Category[] = [
  { id: 'c1', name: '剧情', sort_order: 0, created_by: 'pig', created_at: '' },
  { id: 'c2', name: '科幻', sort_order: 1, created_by: 'baby', created_at: '' },
];
const mk = (id: string, cat: string | null): Film => ({
  id, title: 't' + id, year: 2020, poster_url: null, tmdb_id: null, overview: '',
  category_id: cat, added_by: 'pig', status: 'watchlist', created_at: '',
});

describe('PosterWall', () => {
  it('groups films by category and shows uncategorized section', () => {
    render(<PosterWall categories={cats} votes={[]}
      films={[mk('a', 'c1'), mk('b', 'c2'), mk('c', null)]} onVote={vi.fn()} />);
    expect(screen.getByText(/剧情/)).toBeInTheDocument();
    expect(screen.getByText(/科幻/)).toBeInTheDocument();
    expect(screen.getByText(/未分类/)).toBeInTheDocument();
  });

  it('omits empty categories', () => {
    render(<PosterWall categories={cats} votes={[]} films={[mk('a', 'c1')]} onVote={vi.fn()} />);
    expect(screen.queryByText(/科幻/)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/components/PosterWall.test.tsx`
Expected: FAIL

- [ ] **Step 3: 写实现 `src/components/PosterWall.tsx`**

```tsx
import type { Film, Category, Vote } from '../types';
import { PosterCard } from './PosterCard';
import { tallyForFilm } from '../lib/votes';

export function PosterWall({ films, categories, votes, onVote }:
  { films: Film[]; categories: Category[]; votes: Vote[]; onVote: (id: string) => void }) {
  const sections = [
    ...categories.map((c) => ({ key: c.id, name: c.name, items: films.filter((f) => f.category_id === c.id) })),
    { key: '__none', name: '未分类', items: films.filter((f) => !f.category_id || !categories.some((c) => c.id === f.category_id)) },
  ].filter((s) => s.items.length > 0);

  return (
    <div>
      {sections.map((s) => (
        <section key={s.key} style={{ padding: '24px 32px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12,
            borderBottom: '1px solid rgba(233,196,106,.16)', paddingBottom: 8 }}>
            <h2 className="serif" style={{ fontSize: 20, color: 'var(--gold)' }}>{s.name}</h2>
            <span style={{ color: '#9a7d52', fontSize: 12 }}>{s.items.length} 部待看</span>
          </div>
          <div style={{ display: 'grid', gap: 16, marginTop: 16,
            gridTemplateColumns: 'repeat(auto-fill,minmax(132px,1fr))' }}>
            {s.items.map((f) => (
              <PosterCard key={f.id} film={f} tally={tallyForFilm(votes, f.id)} onVote={onVote} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/components/PosterWall.test.tsx`
Expected: 2 passed

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: PosterWall grouped by category"
```

---

## Task 11: AddFilmModal（搜片 + 选分类/归属 + 手动兜底）

**Files:**
- Create: `src/components/AddFilmModal.tsx`, `src/components/AddFilmModal.test.tsx`

- [ ] **Step 1: 写失败测试 `src/components/AddFilmModal.test.tsx`**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const searchMovies = vi.fn();
vi.mock('../lib/tmdb', () => ({ searchMovies: (...a: any[]) => searchMovies(...a) }));

import { AddFilmModal } from './AddFilmModal';
import type { Category } from '../types';

const cats: Category[] = [{ id: 'c1', name: '剧情', sort_order: 0, created_by: 'pig', created_at: '' }];

beforeEach(() => searchMovies.mockReset());

describe('AddFilmModal', () => {
  it('searches TMDB and submits chosen movie with category and owner', async () => {
    searchMovies.mockResolvedValue([
      { tmdbId: 1, title: 'Whiplash', year: 2014, posterUrl: 'p', overview: 'o' },
    ]);
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<AddFilmModal categories={cats} identity="pig" onAdd={onAdd} onClose={vi.fn()} />);

    await userEvent.type(screen.getByPlaceholderText('片名…'), 'whiplash');
    await userEvent.click(screen.getByText('搜索'));
    await screen.findByText('Whiplash');
    await userEvent.click(screen.getByText('Whiplash'));
    await userEvent.click(screen.getByText('加入片单'));

    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Whiplash', year: 2014, poster_url: 'p', tmdb_id: 1,
      category_id: 'c1', added_by: 'pig',
    }));
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/components/AddFilmModal.test.tsx`
Expected: FAIL

- [ ] **Step 3: 写实现 `src/components/AddFilmModal.tsx`**

```tsx
import { useState } from 'react';
import type { Category, Identity } from '../types';
import { searchMovies, type TmdbMovie } from '../lib/tmdb';

interface AddInput {
  title: string; year: number | null; poster_url: string | null;
  tmdb_id: number | null; overview: string | null;
  category_id: string | null; added_by: Identity;
}

export function AddFilmModal({ categories, identity, onAdd, onClose }: {
  categories: Category[]; identity: Identity;
  onAdd: (input: AddInput) => Promise<void>; onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TmdbMovie[]>([]);
  const [picked, setPicked] = useState<TmdbMovie | null>(null);
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id ?? '');
  const [loading, setLoading] = useState(false);

  const doSearch = async () => {
    setLoading(true);
    try { setResults(await searchMovies(query)); } finally { setLoading(false); }
  };

  const submit = async () => {
    if (!picked) return;
    await onAdd({
      title: picked.title, year: picked.year, poster_url: picked.posterUrl,
      tmdb_id: picked.tmdbId, overview: picked.overview,
      category_id: categoryId || null, added_by: identity,
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
        <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span>归入</span>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={inputStyle}>
            <option value="">未分类</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={submit} style={btnStyle}>加入片单</button>
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
```

> 手动兜底（搜不到时上传海报）作为后续增强；当前 onAdd 已支持 poster_url=null，先满足搜片主流程。

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/components/AddFilmModal.test.tsx`
Expected: 1 passed

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: AddFilmModal with TMDB search"
```

---

## Task 12: CategoryModal（分类管理）

**Files:**
- Create: `src/components/CategoryModal.tsx`, `src/components/CategoryModal.test.tsx`

- [ ] **Step 1: 写失败测试 `src/components/CategoryModal.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryModal } from './CategoryModal';
import type { Category } from '../types';

const cats: Category[] = [{ id: 'c1', name: '剧情', sort_order: 0, created_by: 'pig', created_at: '' }];

describe('CategoryModal', () => {
  it('adds a new category', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<CategoryModal categories={cats} onAdd={onAdd}
      onRename={vi.fn()} onDelete={vi.fn()} onClose={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText('新分类名'), '悬疑');
    await userEvent.click(screen.getByText('添加'));
    expect(onAdd).toHaveBeenCalledWith('悬疑');
  });

  it('deletes a category', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(<CategoryModal categories={cats} onAdd={vi.fn()}
      onRename={vi.fn()} onDelete={onDelete} onClose={vi.fn()} />);
    await userEvent.click(screen.getByLabelText('删除-c1'));
    expect(onDelete).toHaveBeenCalledWith('c1');
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/components/CategoryModal.test.tsx`
Expected: FAIL

- [ ] **Step 3: 写实现 `src/components/CategoryModal.tsx`**

```tsx
import { useState } from 'react';
import type { Category } from '../types';
import { Overlay } from './AddFilmModal';

export function CategoryModal({ categories, onAdd, onRename, onDelete, onClose }: {
  categories: Category[];
  onAdd: (name: string) => Promise<void>;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  return (
    <Overlay onClose={onClose}>
      <h2 className="serif" style={{ color: 'var(--gold)', marginBottom: 12 }}>管理片单分类</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input placeholder="新分类名" value={name} onChange={(e) => setName(e.target.value)}
          style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid var(--gold)',
            background: 'transparent', color: 'var(--ink)' }} />
        <button disabled={!name.trim()} onClick={async () => { await onAdd(name.trim()); setName(''); }}
          style={{ padding: '8px 16px', borderRadius: 20, border: 'none',
            background: 'var(--gold)', color: '#2a0a12', fontWeight: 700 }}>添加</button>
      </div>
      {categories.map((c) => (
        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
          <input defaultValue={c.name}
            onBlur={(e) => e.target.value !== c.name && onRename(c.id, e.target.value)}
            style={{ flex: 1, padding: 6, borderRadius: 6, border: '1px solid rgba(233,196,106,.3)',
              background: 'transparent', color: 'var(--ink)' }} />
          <button aria-label={`删除-${c.id}`} onClick={() => onDelete(c.id)}
            style={{ background: 'transparent', border: 'none', color: '#ff8a8a' }}>✕</button>
        </div>
      ))}
    </Overlay>
  );
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/components/CategoryModal.test.tsx`
Expected: 2 passed

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: CategoryModal CRUD"
```

---

## Task 13: VotingWidget（右下角浮窗，聚合投票中影片）

**Files:**
- Create: `src/components/VotingWidget.tsx`, `src/components/VotingWidget.test.tsx`

- [ ] **Step 1: 写失败测试 `src/components/VotingWidget.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VotingWidget } from './VotingWidget';
import type { Film, Vote } from '../types';

const mk = (id: string, title: string): Film => ({
  id, title, year: 2020, poster_url: null, tmdb_id: null, overview: '',
  category_id: null, added_by: 'pig', status: 'watchlist', created_at: '',
});

describe('VotingWidget', () => {
  it('lists only films that have at least one vote', () => {
    const films = [mk('a', '迷雾长夜'), mk('b', '星河彼岸'), mk('c', '没人投')];
    const votes: Vote[] = [
      { id: '1', film_id: 'a', voter: 'pig', created_at: '' },
      { id: '2', film_id: 'b', voter: 'baby', created_at: '' },
    ];
    render(<VotingWidget films={films} votes={votes} onVote={vi.fn()} />);
    expect(screen.getByText('迷雾长夜')).toBeInTheDocument();
    expect(screen.getByText('星河彼岸')).toBeInTheDocument();
    expect(screen.queryByText('没人投')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/components/VotingWidget.test.tsx`
Expected: FAIL

- [ ] **Step 3: 写实现 `src/components/VotingWidget.tsx`**

```tsx
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
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/components/VotingWidget.test.tsx`
Expected: 1 passed

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: corner VotingWidget"
```

---

## Task 14: Nav 组件

**Files:**
- Create: `src/components/Nav.tsx`, `src/components/Nav.test.tsx`

- [ ] **Step 1: 写失败测试 `src/components/Nav.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Nav } from './Nav';

describe('Nav', () => {
  it('fires add and manage-category callbacks', async () => {
    const onAdd = vi.fn(); const onManage = vi.fn();
    render(<Nav identity="pig" onAddFilm={onAdd} onManageCategories={onManage} />);
    await userEvent.click(screen.getByText('＋ 搜片添加'));
    expect(onAdd).toHaveBeenCalled();
    await userEvent.click(screen.getByText('管理分类'));
    expect(onManage).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/components/Nav.test.tsx`
Expected: FAIL

- [ ] **Step 3: 写实现 `src/components/Nav.tsx`**

```tsx
import type { Identity } from '../types';
import { IDENTITY_LABEL } from '../types';

export function Nav({ identity, onAddFilm, onManageCategories }: {
  identity: Identity; onAddFilm: () => void; onManageCategories: () => void;
}) {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 32px',
      borderBottom: '1px solid rgba(233,196,106,.18)', position: 'sticky', top: 0,
      background: 'rgba(18,4,7,.85)', backdropFilter: 'blur(8px)', zIndex: 5 }}>
      <div className="serif" style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold)' }}>
        我们的电影节</div>
      <button onClick={onManageCategories} style={{ background: 'transparent',
        border: '1px solid rgba(233,196,106,.4)', color: '#c9b58a', borderRadius: 20,
        padding: '6px 12px', fontSize: 13 }}>管理分类</button>
      <div style={{ flex: 1 }} />
      <button onClick={onAddFilm} style={{ background: 'linear-gradient(135deg,var(--gold-bright),#d4a843)',
        color: '#2a0a12', fontWeight: 800, fontSize: 13, padding: '9px 16px', borderRadius: 22,
        border: 'none' }}>＋ 搜片添加</button>
      <span title={`当前：${IDENTITY_LABEL[identity]}`} className={identity === 'pig' ? 'badge-you' : 'badge-ta'}
        style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontWeight: 800,
          fontSize: identity === 'pig' ? 14 : 11 }}>{IDENTITY_LABEL[identity]}</span>
    </nav>
  );
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/components/Nav.test.tsx`
Expected: 1 passed

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: Nav bar"
```

---

## Task 15: App 组合所有部件

**Files:**
- Modify: `src/App.tsx`（替换 Task 1 的占位）, 删除 `src/App.test.tsx`（占位测试已不适用）

- [ ] **Step 1: 删除旧占位测试**

```bash
git rm src/App.test.tsx
```

- [ ] **Step 2: 写实现 `src/App.tsx`**

```tsx
import { useState } from 'react';
import type { Identity } from './types';
import { useIdentity } from './hooks/useIdentity';
import { useCategories } from './hooks/useCategories';
import { useFilms } from './hooks/useFilms';
import { useVotes } from './hooks/useVotes';
import { IdentityGate } from './components/IdentityGate';
import { Nav } from './components/Nav';
import { PosterWall } from './components/PosterWall';
import { VotingWidget } from './components/VotingWidget';
import { AddFilmModal } from './components/AddFilmModal';
import { CategoryModal } from './components/CategoryModal';

export default function App() {
  const { identity, choose } = useIdentity();
  if (!identity) return <IdentityGate onReady={choose} />;
  return <Main identity={identity} />;
}

function Main({ identity }: { identity: Identity }) {
  const cats = useCategories();
  const films = useFilms();
  const votes = useVotes();
  const [showAdd, setShowAdd] = useState(false);
  const [showCats, setShowCats] = useState(false);

  const watchlist = films.films.filter((f) => f.status === 'watchlist');
  const onVote = (filmId: string) => votes.toggle(filmId, identity);

  return (
    <div style={{ paddingBottom: 80 }}>
      <Nav identity={identity}
        onAddFilm={() => setShowAdd(true)}
        onManageCategories={() => setShowCats(true)} />

      <div style={{ padding: '22px 32px 4px' }}>
        <div className="serif" style={{ fontSize: 26, fontWeight: 700, color: '#fff' }}>待看片单</div>
        <p style={{ color: '#bfa884', marginTop: 4, fontSize: 13 }}>
          搜片加入、按分类陈列。右下角随时投票，决定下个 movie night 看哪部 🏆</p>
      </div>

      <PosterWall films={watchlist} categories={cats.categories} votes={votes.votes} onVote={onVote} />

      <VotingWidget films={watchlist} votes={votes.votes} onVote={onVote} />

      {showAdd && (
        <AddFilmModal categories={cats.categories} identity={identity}
          onAdd={async (input) => { await films.add(input); await films.refresh(); }}
          onClose={() => setShowAdd(false)} />
      )}
      {showCats && (
        <CategoryModal categories={cats.categories}
          onAdd={(name) => cats.add(name, identity)}
          onRename={cats.rename} onDelete={cats.remove}
          onClose={() => setShowCats(false)} />
      )}
    </div>
  );
}
```

- [ ] **Step 3: 跑全部测试 + 类型检查**

Run: `npm test && npx tsc --noEmit`
Expected: 所有测试 passed，无类型错误

- [ ] **Step 4: 本地手动验证**

Run: `npm run dev`，配好 `.env`（Supabase + TMDB + 口令），在浏览器走一遍：进站口令→选身份→管理分类→搜片添加→海报墙出现→投票→右下角浮窗实时更新。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: compose App with gate, wall, voting, modals"
```

---

## Task 16: GitHub Pages 部署与 README

**Files:**
- Create: `.github/workflows/deploy.yml`, `README.md`

- [ ] **Step 1: 写 `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_TMDB_API_KEY: ${{ secrets.VITE_TMDB_API_KEY }}
          VITE_APP_PASSPHRASE: ${{ secrets.VITE_APP_PASSPHRASE }}
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: 写 `README.md`**

```markdown
# 我们的电影节 🎬

两人自用的家庭电影节网站：搜片加入、按自定义分类陈列、实时投票决定下次 movie night。

## 本地开发
1. `npm install`
2. 复制 `.env.example` 为 `.env`，填入 Supabase / TMDB / 口令
3. 在 Supabase SQL editor 执行 `supabase/schema.sql`
4. `npm run dev`

## 部署（GitHub Pages）
- 在仓库 Settings → Pages 选 "GitHub Actions"
- 在 Settings → Secrets and variables → Actions 添加：
  `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` / `VITE_TMDB_API_KEY` / `VITE_APP_PASSPHRASE`
- 确认 `vite.config.ts` 的 `base` 与仓库名一致（如 `/filmfest/`）
- push 到 `main` 自动构建部署

## 测试
`npm test`
```

- [ ] **Step 3: 验证构建通过**

Run: `npm run build`
Expected: 生成 `dist/`，无错误

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "ci: GitHub Pages deploy workflow and README"
```

---

## Self-Review 结果

**Spec 覆盖核对：**
- 用户与共享口令身份 → Task 7 ✅
- 技术方案（Vite+React 静态站 / Pages / Supabase / TMDB）→ Task 1,3,4,16 ✅
- 数据模型 categories/films/votes → Task 3（schema）+ Task 6（访问层）✅
- 可自定义分类 → Task 8（hook）+ Task 12（管理 UI）✅
- 海报墙按分类 + 归属标记 → Task 9,10 ✅
- 实时投票 + 浮窗聚合 + 无揭晓 → Task 8（realtime）+ Task 13 ✅
- 搜片添加 + 手动兜底 → Task 11（搜片主流程；手动上传标注为后续增强）
- 看过归档 → `setFilmStatus` 已在 Task 6 实现，App 仅展示 watchlist（Task 15 过滤）；归档触发 UI 作为后续增强
- 响应式 → 网格 `auto-fill minmax` + 浮窗固定，Task 10/13 ✅

**已知后续增强（不阻塞首版可用）：**
- 手动上传海报兜底（Storage）
- 「看过」归档的触发按钮与回顾视图
- 分类拖拽排序（当前按创建顺序）

**占位扫描：** 无 TBD/TODO；每个代码步骤含完整代码。
**类型一致性：** `Identity`、`Tally`、`AddInput`、db 函数签名跨任务一致。
