# 开源模板仓库 family-film-festival 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把现有电影节网站做成一份去个人化的开源模板仓库，朋友点 "Use this template" 即可得到设计和功能完整、影片内容为空、角色为 A/B 的自己的站。

**Architecture:** 在全新目录 `~/Documents/code/family-film-festival` 中拷贝一份代码，把身份 `pig`/`baby` 改为 `a`/`b`、个性化项集中到单一 `src/config.ts`、数据库脚本与部署配置去个人化，补 LICENSE 与保姆级文档，`git init` 全新历史后推送为 GitHub Template 仓库。

**Tech Stack:** Vite 6 + React 19 + TypeScript + Vitest 2 + Supabase + TMDB + GitHub Pages

---

## ⚠️ 隔离要求（贯穿全程）

- **除 Task 1 的只读拷贝外，全程不得对 `/Users/tantianshu/Documents/code/filmfest` 执行任何写操作。** 不改文件、不 commit、不 push、不动它的 Supabase 数据库。
- 所有命令必须在 `/Users/tantianshu/Documents/code/family-film-festival` 内执行，每条命令使用绝对路径或先确认 `pwd`。
- 本计划文档与 spec 存放在 filmfest 仓库的 `docs/` 下，而 `docs/` 不会被拷贝进模板，二者互不影响。
- 每完成一个 Task 后运行 `git -C /Users/tantianshu/Documents/code/filmfest status --porcelain`，输出必须只有 `?? .DS_Store`（原本就存在的未跟踪文件）。

---

## 文件结构

模板仓库 `~/Documents/code/family-film-festival` 最终包含：

| 文件 | 职责 |
|---|---|
| `src/config.ts` | **新建。** 朋友唯一需要修改的文件：电影节名、A/B 的显示名 / 徽标 / 配色 |
| `src/types.ts` | 修改。`Identity = 'a' \| 'b'`，标签从 `config` 派生，`Film` 字段改 `review_a`/`review_b` |
| `src/main.tsx` | 修改。启动时把 `ROLES` 的配色注入 CSS 变量 |
| `src/lib/votes.ts` | 修改。`Tally` 的键改 `a`/`b` |
| `src/lib/db.ts` | 修改。`setReview` 列名改为模板字符串 |
| `src/components/Nav.tsx` | 修改。标题读 `FESTIVAL_NAME`，身份判断改 `'a'` |
| `src/components/IdentityGate.tsx` | 修改。标题读 `FESTIVAL_NAME`，按钮文案读 `ROLES` |
| `src/components/PosterCard.tsx` | 修改。归属判断、review 字段、aria-label 改 `a`/`b` |
| `src/components/VotingWidget.tsx` | 修改。`t.pig`/`t.baby` → `t.a`/`t.b` |
| `supabase/schema.sql` | 修改。约束 `in ('a','b')`、字段 `review_a`/`review_b`、删历史迁移注释 |
| `vite.config.ts` | 修改。`base: './'` |
| `index.html` | 修改。title |
| `package.json` | 修改。name / description / license |
| `LICENSE` | **新建。** MIT |
| `README.md` | 重写。项目介绍 + 功能清单 + 快速开始 |
| `SETUP.md` | **新建。** 面向不写代码的人的逐步部署指南 |
| `.env.example` | 修改。每行加来源注释 |
| 全部 `*.test.*` | 修改。`pig`/`baby` → `a`/`b`，测试夹具去个人化 |

不拷贝：`.git/`、`.env`、`node_modules/`、`dist/`、`.superpowers/`、`docs/`、`modifications.md`、`.DS_Store`

---

## Task 1: 建立模板目录

**Files:**
- Create: `/Users/tantianshu/Documents/code/family-film-festival/`（整个目录）

- [ ] **Step 1: 确认源仓库干净，记录基线**

```bash
git -C /Users/tantianshu/Documents/code/filmfest status --porcelain
```

预期输出仅一行：`?? .DS_Store`。若有其他改动，先停下来问用户。

- [ ] **Step 2: 用 rsync 拷贝，排除所有不需要的内容**

```bash
rsync -a \
  --exclude '.git/' --exclude '.env' --exclude 'node_modules/' \
  --exclude 'dist/' --exclude '.superpowers/' --exclude 'docs/' \
  --exclude 'modifications.md' --exclude '.DS_Store' \
  /Users/tantianshu/Documents/code/filmfest/ \
  /Users/tantianshu/Documents/code/family-film-festival/
```

- [ ] **Step 3: 确认拷贝结果，且没有 .git**

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && ls -a && test ! -d .git && echo "无 .git，正确"
```

预期：看到 `src/ supabase/ .github/ index.html package.json` 等，无 `.git`、无 `.env`、无 `docs`，末行打印「无 .git，正确」。

- [ ] **Step 4: 安装依赖并确认测试基线全绿**

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && npm ci && npm test
```

预期：全部测试 PASS。这是改造前的基线——若此处已失败，先修复再继续。

- [ ] **Step 5: 确认源仓库未被触碰**

```bash
git -C /Users/tantianshu/Documents/code/filmfest status --porcelain
```

预期：仍只有 `?? .DS_Store`。

---

## Task 2: 新建 config.ts 并改造 types.ts

**Files:**
- Create: `src/config.ts`
- Modify: `src/types.ts`

- [ ] **Step 1: 写失败的测试**

创建 `src/types.test.ts`：

```ts
import { describe, it, expect } from 'vitest';
import { IDENTITY_LABEL, IDENTITY_BADGE } from './types';
import { ROLES } from './config';

describe('identity labels', () => {
  it('derives display names from config', () => {
    expect(IDENTITY_LABEL.a).toBe(ROLES.a.name);
    expect(IDENTITY_LABEL.b).toBe(ROLES.b.name);
  });

  it('derives badges from config', () => {
    expect(IDENTITY_BADGE.a).toBe(ROLES.a.badge);
    expect(IDENTITY_BADGE.b).toBe(ROLES.b.badge);
  });

  it('ships neutral A/B defaults so the template contains no personal names', () => {
    expect(ROLES.a.name).toBe('A');
    expect(ROLES.b.name).toBe('B');
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && npx vitest run src/types.test.ts
```

预期：FAIL，报找不到模块 `./config`。

- [ ] **Step 3: 创建 src/config.ts**

```ts
// ============================================================
//  个性化配置 —— 你只需要改这一个文件
//  Personalize your festival here. This is the only file you
//  need to edit.
// ============================================================

/** 网站标题，显示在浏览器标签页、登录页和顶部导航栏 */
export const FESTIVAL_NAME = '家庭电影节';

/**
 * 两位参与者。
 *  name  —— 显示名，出现在登录选身份的按钮和短评署名处
 *  badge —— 海报角标与投票圆点里的短标记，1 个字或 1 个 emoji 最好看
 *  color —— 这个人的专属颜色（海报角标、投票圆点、短评署名都用它）
 */
export const ROLES = {
  a: { name: 'A', badge: 'A', color: '#e9c46a' }, // 金
  b: { name: 'B', badge: 'B', color: '#5ad1c2' }, // 青
} as const;
```

- [ ] **Step 4: 改写 src/types.ts 顶部**

把文件开头这几行：

```ts
export type Identity = 'pig' | 'baby';

export const IDENTITY_LABEL: Record<Identity, string> = {
  pig: '🐷',
  baby: '宝宝',
};

export const IDENTITY_BADGE: Record<Identity, string> = {
  pig: '🐷',
  baby: '🐨',
};
```

替换为：

```ts
import { ROLES } from './config';

export type Identity = 'a' | 'b';

export const IDENTITY_LABEL: Record<Identity, string> = {
  a: ROLES.a.name,
  b: ROLES.b.name,
};

export const IDENTITY_BADGE: Record<Identity, string> = {
  a: ROLES.a.badge,
  b: ROLES.b.badge,
};
```

- [ ] **Step 5: 改 Film 接口的两个字段**

在同一文件的 `interface Film` 内，把：

```ts
  review_pig: string | null;
  review_baby: string | null;
```

改为：

```ts
  review_a: string | null;
  review_b: string | null;
```

- [ ] **Step 6: 运行测试确认通过**

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && npx vitest run src/types.test.ts
```

预期：3 个测试全部 PASS。（此时其他测试文件仍会因 `pig`/`baby` 报类型错，属预期，后续任务修复。）

---

## Task 3: votes.ts 的 Tally 改键名

**Files:**
- Modify: `src/lib/votes.ts:3-13`
- Test: `src/lib/votes.test.ts`

- [ ] **Step 1: 改写测试**

把 `src/lib/votes.test.ts` 开头的夹具与第一个 describe 块改成（注意顺手把影片 id 从 `'a'/'b'/'c'` 改成 `'f1'/'f2'/'f3'`，避免和身份 `'a'/'b'` 混淆）：

```ts
const v = (film_id: string, voter: 'a' | 'b'): Vote =>
  ({ id: `${film_id}-${voter}`, film_id, voter, created_at: '' });
```

夹具影片对象里的 `review_pig: null, review_baby: null` 改为 `review_a: null, review_b: null`，`added_by: 'pig'` 改为 `added_by: 'a'`。

tally 相关断言改为：

```ts
    const votes = [v('f1', 'a'), v('f1', 'b'), v('f2', 'a')];
    expect(tallyForFilm(votes, 'f1')).toEqual({ a: true, b: true, count: 2 });
    expect(tallyForFilm(votes, 'f2')).toEqual({ a: true, b: false, count: 1 });
    expect(tallyForFilm(votes, 'f3')).toEqual({ a: false, b: false, count: 0 });
```

其余 `v('a', 'pig')` 之类一律按同样规则改：第一个参数 `'a'→'f1'`、`'b'→'f2'`、`'c'→'f3'`，第二个参数 `'pig'→'a'`、`'baby'→'b'`。相应的 `filmsInBallot` / `topBallotFilms` 断言里出现的影片 id 也同步改名。

- [ ] **Step 2: 运行测试确认失败**

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && npx vitest run src/lib/votes.test.ts
```

预期：FAIL，`tallyForFilm` 返回 `{pig, baby, count}` 与期望的 `{a, b, count}` 不符。

- [ ] **Step 3: 改实现**

`src/lib/votes.ts` 开头改为：

```ts
export interface Tally {
  a: boolean;
  b: boolean;
  count: number;
}

export function tallyForFilm(votes: Vote[], filmId: string): Tally {
  const forFilm = votes.filter((v) => v.film_id === filmId);
  const has = (who: Identity) => forFilm.some((v) => v.voter === who);
  return { a: has('a'), b: has('b'), count: forFilm.length };
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && npx vitest run src/lib/votes.test.ts
```

预期：PASS。

---

## Task 4: db.ts 的 setReview 列名

**Files:**
- Modify: `src/lib/db.ts:58-62`
- Test: `src/lib/db.test.ts`

- [ ] **Step 1: 改写测试**

`src/lib/db.test.ts` 已有 `describe('setReview')` 块，整块替换为：

```ts
describe('setReview', () => {
  it('updates the per-author review column', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    fromMock.mockReturnValue({ update });

    await setReview('f1', 'a', '后劲很大');
    expect(fromMock).toHaveBeenCalledWith('films');
    expect(update).toHaveBeenCalledWith({ review_a: '后劲很大' });
    expect(eq).toHaveBeenCalledWith('id', 'f1');
  });

  it('writes B column for author b, and null to clear', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    fromMock.mockReturnValue({ update });

    await setReview('f1', 'b', null);
    expect(update).toHaveBeenCalledWith({ review_b: null });
  });
});
```

同文件另有两处身份字面量要一并改：`describe('addFilm')` 里的 `added_by: 'pig'`（出现两次，分别在调用参数和断言里）改成 `'a'`；`describe('toggleVote')` 里的 `toggleVote('f1', 'pig', true)` 与 `match` 断言中的 `voter: 'pig'` 改成 `'a'`，`toggleVote('f1', 'baby', false)` 与 `insert` 断言中的 `voter: 'baby'` 改成 `'b'`。

- [ ] **Step 2: 运行测试确认失败**

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && npx vitest run src/lib/db.test.ts
```

预期：FAIL（实现仍写 `review_pig`/`review_baby`）。

- [ ] **Step 3: 改实现**

`src/lib/db.ts` 的 `setReview` 改为：

```ts
export async function setReview(id: string, author: Identity, text: string | null) {
  const { error } = await supabase.from('films')
    .update({ [`review_${author}`]: text }).eq('id', id);
  if (error) throw error;
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && npx vitest run src/lib/db.test.ts
```

预期：PASS。

---

## Task 5: 组件改造（Nav / IdentityGate / PosterCard / VotingWidget）

**Files:**
- Modify: `src/components/Nav.tsx`、`src/components/IdentityGate.tsx`、`src/components/PosterCard.tsx`、`src/components/VotingWidget.tsx`
- Test: 对应的四个 `.test.tsx`

- [ ] **Step 1: 先改测试（红）**

`src/components/IdentityGate.test.tsx` 第 22-23 行改为：

```ts
    await userEvent.click(screen.getByText('我是 A'));
    expect(onReady).toHaveBeenCalledWith('a');
```

`src/components/PosterCard.test.tsx`：
- 夹具 `review_pig: null, review_baby: null` → `review_a: null, review_b: null`
- 夹具与 props 里的 `added_by: 'pig'`、`identity: 'pig' as const`、`created_by: 'pig'`/`'baby'` → `'a'`/`'b'`
- `const zero = { pig: false, baby: false, count: 0 };` → `{ a: false, b: false, count: 0 }`
- `tally={{ pig: true, baby: false, count: 1 }}` → `{{ a: true, b: false, count: 1 }}`
- `getByLabelText('owner-pig')` → `getByLabelText('owner-a')`
- 测试名 `'shows the koala badge for films added by baby'` → `'shows B badge for films added by B'`，其中 `added_by: 'baby'` → `'b'`，`toHaveTextContent('🐨')` → `toHaveTextContent('B')`
- 分类夹具名 `'比利怀尔德'`/`'刘别谦'` → `'剧情'`/`'悬疑'`（去个人化）

`src/components/VotingWidget.test.tsx`：
- 夹具 `review_pig/review_baby` → `review_a/review_b`，`added_by: 'pig'` → `'a'`
- 所有 `voter: 'pig'` → `'a'`，`voter: 'baby'` → `'b'`
- 测试名 `'shows a koala dot for baby votes'` → `'shows a B dot for B votes'`，其断言中的 `'🐨'` 改为 `'B'`

`src/components/Nav.test.tsx`、`src/components/CategoryFilter.test.tsx`、`src/components/CategoryModal.test.tsx`、`src/components/PosterWall.test.tsx`、`src/components/AddFilmModal.test.tsx`：
- 所有 `created_by: 'pig'`/`'baby'`、`added_by: 'pig'`、`identity: 'pig' as const`、`identity="pig"` → `'a'`/`'b'`
- `review_pig`/`review_baby` → `review_a`/`review_b`
- 分类夹具名 `'比利怀尔德'`/`'刘别谦'`/`'黑色电影'` → `'剧情'`/`'悬疑'`/`'科幻'`

`src/hooks/useIdentity.test.ts`、`src/hooks/useVotes.test.ts`：所有 `'pig'` → `'a'`，`'baby'` → `'b'`。

- [ ] **Step 2: 运行全量测试确认失败**

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && npm test
```

预期：多个组件测试 FAIL。

- [ ] **Step 3: 改 Nav.tsx**

顶部 import 增加 config，标题与身份判断改写：

```ts
import type { Category, Identity } from '../types';
import { IDENTITY_LABEL } from '../types';
import { FESTIVAL_NAME } from '../config';
import { CategoryFilter } from './CategoryFilter';
```

标题那一行：

```tsx
      <div className="serif nav-title" style={{ fontSize: 26, fontWeight: 700, color: 'var(--gold)' }}>
        {FESTIVAL_NAME}</div>
```

右上角头像那一段（`identity === 'pig'` 出现两次，都改成 `'a'`）：

```tsx
      <span title={`当前：${IDENTITY_LABEL[identity]}`} className={`nav-avatar ${identity === 'a' ? 'badge-you' : 'badge-ta'}`}
        style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontWeight: 800,
          fontSize: 14, flexShrink: 0 }}>{IDENTITY_LABEL[identity]}</span>
```

（原本 `fontSize: identity === 'pig' ? 14 : 11` 是为「宝宝」两个汉字缩字号的特例，模板里名字长度未知，统一用 14。）

- [ ] **Step 4: 改 IdentityGate.tsx**

顶部加 import：

```ts
import { FESTIVAL_NAME, ROLES } from '../config';
```

标题那一行：

```tsx
      <h1 className="serif" style={{ color: 'var(--gold)', fontSize: 44 }}>{FESTIVAL_NAME}</h1>
```

两个身份按钮：

```tsx
        <div style={{ display: 'flex', gap: 16 }}>
          <button className="badge-you" onClick={() => onReady('a')}
            style={{ padding: '14px 22px', borderRadius: 14, border: 'none', fontWeight: 800 }}>
            我是 {ROLES.a.name}</button>
          <button className="badge-ta" onClick={() => onReady('b')}
            style={{ padding: '14px 22px', borderRadius: 14, border: 'none', fontWeight: 800 }}>
            我是 {ROLES.b.name}</button>
        </div>
```

- [ ] **Step 5: 改 PosterCard.tsx**

第 14 行：

```ts
  const ownerClass = film.added_by === 'a' ? 'badge-you' : 'badge-ta';
```

`ReviewSection` 内第 144 行：

```ts
  const mine = identity === 'a' ? film.review_a : film.review_b;
```

第 155 行：

```tsx
      <b style={{ color: author === 'a' ? 'var(--you)' : 'var(--ta)' }}>
```

第 162-163 行：

```tsx
      {line('a', film.review_a)}
      {line('b', film.review_b)}
```

再检查该文件里 `owner-${...}` 形式的 aria-label：

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && grep -n "owner-" src/components/PosterCard.tsx
```

若是写死的 `owner-pig`/`owner-baby`，改成由 `film.added_by` 拼出的 `owner-${film.added_by}`。

- [ ] **Step 6: 改 VotingWidget.tsx**

第 65-66 行：

```tsx
                  {t.a && <Dot cls="badge-you" label={IDENTITY_BADGE.a} />}
                  {t.b && <Dot cls="badge-ta" label={IDENTITY_BADGE.b} />}
```

- [ ] **Step 7: 运行全量测试确认通过**

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && npm test
```

预期：全部 PASS。若仍有 `pig`/`baby` 相关失败，按报错逐个修完再进行下一步。

- [ ] **Step 8: 类型检查通过**

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && npx tsc --noEmit
```

预期：无输出（无错误）。

---

## Task 6: main.tsx 注入配色

**Files:**
- Modify: `src/main.tsx`

- [ ] **Step 1: 改写 main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ROLES } from './config';
import './theme.css';

// 把 config 里的两人配色写进 CSS 变量，这样改配色也只需要动 config.ts
document.documentElement.style.setProperty('--you', ROLES.a.color);
document.documentElement.style.setProperty('--ta', ROLES.b.color);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

`src/theme.css` 的 `--you` / `--ta` 保留原值不动，作为注入前的兜底。

- [ ] **Step 2: 确认测试与类型仍然通过**

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && npm test && npx tsc --noEmit
```

预期：测试全 PASS，tsc 无输出。

---

## Task 7: 数据库脚本去个人化

**Files:**
- Modify: `supabase/schema.sql`

- [ ] **Step 1: 整体改写 supabase/schema.sql**

```sql
-- 家庭电影节 · 数据库建表脚本
-- 在 Supabase 控制台 → SQL Editor 里整段粘贴执行一次即可。

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0,
  created_by text not null check (created_by in ('a','b')),
  created_at timestamptz not null default now()
);

create table films (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  year int,
  poster_url text,
  tmdb_id int,
  overview text,
  comment text,
  review_a text,
  review_b text,
  category_id uuid references categories(id) on delete set null,
  category_ids uuid[] not null default '{}',
  added_by text not null check (added_by in ('a','b')),
  status text not null default 'watchlist' check (status in ('watchlist','watched')),
  sort_order int not null default 0,
  runtime int,
  created_at timestamptz not null default now()
);

create table votes (
  id uuid primary key default gen_random_uuid(),
  film_id uuid not null references films(id) on delete cascade,
  voter text not null check (voter in ('a','b')),
  created_at timestamptz not null default now(),
  unique (film_id, voter)
);

-- 两人自用：开放 anon 读写，靠站点共享口令做软门槛。
-- 如果你想更严格，可以改成基于 Supabase Auth 的 RLS 策略。
alter table categories enable row level security;
alter table films enable row level security;
alter table votes enable row level security;
create policy "anon all" on categories for all using (true) with check (true);
create policy "anon all" on films for all using (true) with check (true);
create policy "anon all" on votes for all using (true) with check (true);

-- 开启 Realtime，让两个人的投票和片单实时同步
alter publication supabase_realtime add table votes;
alter publication supabase_realtime add table films;
```

- [ ] **Step 2: 确认文件里没有遗留个人化内容**

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && grep -n "pig\|baby\|迁移" supabase/schema.sql || echo "干净"
```

预期：打印「干净」。

- [ ] **Step 3: 修掉 App.tsx 里指向迁移注释的报错文案**

`src/App.tsx` 的 `onReorder` 里有一句提示指向「schema.sql 末尾注释」，注释已删除，改为：

```ts
      window.alert('排序没能保存：请确认已在 Supabase 后台完整执行 supabase/schema.sql');
```

---

## Task 8: 部署配置与元数据去个人化

**Files:**
- Modify: `vite.config.ts`、`index.html`、`package.json`、`.env.example`

- [ ] **Step 1: vite.config.ts 改为相对路径**

把 `base: '/filmfest/',` 改为：

```ts
  base: './',
```

- [ ] **Step 2: index.html 改标题**

```html
    <title>家庭电影节</title>
```

- [ ] **Step 3: package.json 改元数据**

把 `"name"`、`"description"`、`"license"` 三个字段改为：

```json
  "name": "family-film-festival",
  "description": "A two-person family film festival site: search and add films via TMDB, curate them into lists, and vote in realtime to pick the next movie night.",
  "license": "MIT",
```

（`"main": "index.js"` 和 `"directories"` 两个字段一并删除——这是 npm init 留下的、对本项目无意义的默认值。）

- [ ] **Step 4: .env.example 加来源注释**

```
# Supabase 控制台 → 你的项目 → Settings → API → Project URL
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co

# 同一页面 → Project API keys → anon / public
VITE_SUPABASE_ANON_KEY=your-anon-key

# https://www.themoviedb.org/settings/api 申请（免费）→ API Key (v3 auth)
VITE_TMDB_API_KEY=your-tmdb-key

# 你自己定的进站口令，两个人都知道就行
VITE_APP_PASSPHRASE=change-me
```

- [ ] **Step 5: 构建并验证相对路径没打破资源加载**

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && npm run build && grep -o 'src="[^"]*"' dist/index.html
```

预期：构建成功；打印的 script 路径以 `./assets/` 开头（而非 `/filmfest/assets/`）。

---

## Task 9: LICENSE 与 README

**Files:**
- Create: `LICENSE`
- Modify: `README.md`

- [ ] **Step 1: 写 LICENSE（MIT）**

标准 MIT 全文，版权行为：

```
MIT License

Copyright (c) 2026 tantianshu
```

其余照 MIT 模板原文。

- [ ] **Step 2: 重写 README.md**

```markdown
# 家庭电影节 🎬

给两个人用的私密电影节网站：搜片加入、按自定义片单陈列、实时投票决定下一次 movie night 看哪部。

**这是一个模板仓库。** 点右上角 **Use this template** 生成你自己的仓库，跟着 [SETUP.md](SETUP.md) 走一遍，二十分钟就能有一个属于你们俩的电影节网站。

## 功能

- **搜片添加** —— 接 TMDB，搜中文片名直接拿到海报、年份、片长、简介；重复添加会拦截
- **自定义片单** —— 片单自己建、可改名、可拖拽排序；一部影片可同时属于多个片单
- **待看 / 看过** —— 两个视图，看完一键归档，看过的片子按片单珍藏
- **实时投票** —— 右下角浮窗，两个人的票实时同步（Supabase Realtime）
- **平票随机** —— 得票相同时点「帮我们选一部」，滚动抽选一部今晚看
- **想看理由 & 观后短评** —— 加片时写想看理由，看完后两个人各写各的短评
- **拖拽排序** —— 片单内影片、片单之间都能拖
- **手机适配** —— 手机端三列海报、投票浮窗默认折叠
- **共享口令** —— 进站需要输入你们自己定的口令（前端软门槛）

## 技术栈

Vite + React + TypeScript 静态站，数据 / 实时 / 存储用 Supabase，影片资料来自 TMDB，部署在 GitHub Pages。全部用免费额度即可。

## 快速开始

想在本地先跑起来看看：

```bash
npm install
cp .env.example .env    # 填进你的 Supabase / TMDB 的值
npm run dev
```

完整部署步骤（含怎么开 Supabase 项目、怎么拿 TMDB key、怎么开 GitHub Pages）见 **[SETUP.md](SETUP.md)**。

## 改成你们自己的名字

只需要改 `src/config.ts` 一个文件：

```ts
export const FESTIVAL_NAME = '家庭电影节';
export const ROLES = {
  a: { name: 'A', badge: 'A', color: '#e9c46a' },
  b: { name: 'B', badge: 'B', color: '#5ad1c2' },
};
```

改完 push，GitHub Actions 会自动重新部署。

## 测试

```bash
npm test
```

## License

MIT
```

- [ ] **Step 3: 确认 README 里没有残留个人信息**

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && grep -n "Tapasta\|filmfest\|宝宝\|🐷" README.md || echo "干净"
```

预期：打印「干净」。

---

## Task 10: SETUP.md 保姆级部署文档

**Files:**
- Create: `SETUP.md`

- [ ] **Step 1: 写 SETUP.md**

面向不写代码的人，逐步写明在哪个页面点哪个按钮。必须包含以下七节，每节写清楚点击路径：

1. **准备 Supabase（约 5 分钟）** —— supabase.com 注册 → New project（区域选离你近的，数据库密码自己存好）→ 等待创建完成 → 左侧 Settings → API → 复制 **Project URL** 和 **anon public** key 两个值备用
2. **建表（约 2 分钟）** —— 左侧 SQL Editor → New query → 打开仓库里的 `supabase/schema.sql` 全选复制粘贴进去 → 点 Run → 看到 Success 即可
3. **拿 TMDB key（约 3 分钟）** —— themoviedb.org 注册 → 头像 → Settings → API → 申请 Developer（用途随便填个人学习用）→ 复制 **API Key (v3 auth)**
4. **生成你自己的仓库（1 分钟）** —— 本仓库页面点绿色 **Use this template** → Create a new repository → 起个名字 → Public 或 Private 都行
5. **填 Secrets（约 3 分钟）** —— 你的新仓库 → Settings → Secrets and variables → Actions → New repository secret，逐个添加四个：`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`、`VITE_TMDB_API_KEY`、`VITE_APP_PASSPHRASE`（最后这个是你们俩的进站口令，自己定）
6. **开启 Pages（1 分钟）** —— Settings → Pages → Build and deployment → Source 选 **GitHub Actions** → 回到 Actions 标签页，等绿勾 → 访问地址在 Settings → Pages 顶部
7. **换成你们的名字** —— 在 GitHub 网页上直接编辑 `src/config.ts`（点文件 → 铅笔图标）改 `FESTIVAL_NAME` 和两个人的 `name`/`badge`/`color` → Commit changes → 自动重新部署

另需一节 **常见问题**，至少覆盖：

- 打开网站白屏 → 检查 Actions 是否绿勾，四个 Secret 名字是否一字不差
- 搜片搜不到 → TMDB key 填错，或 TMDB 在你的网络下不可达
- 投票不实时同步 → schema.sql 末尾两条 `alter publication` 没执行成功，回 SQL Editor 单独再跑一次
- 想改配色 → 改 `src/config.ts` 里的 `color`；想改整体红毯配色改 `src/theme.css` 顶部的 `:root` 变量
- 想让第三个人用 → 本项目是按两人场景设计的，加人需要改数据库约束和代码，不建议

- [ ] **Step 2: 确认文档提到的文件都真实存在**

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && ls supabase/schema.sql src/config.ts src/theme.css .env.example
```

预期：四个文件全部列出，无 No such file。

---

## Task 11: 全量验收

**Files:** 无（只跑检查）

- [ ] **Step 1: 测试全绿**

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && npm test
```

预期：全部 PASS，0 failed。

- [ ] **Step 2: 类型检查通过**

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && npx tsc --noEmit
```

预期：无输出。

- [ ] **Step 3: 构建通过**

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && npm run build
```

预期：built in ... 成功。

- [ ] **Step 4: 个人化痕迹清零**

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && \
grep -rin "pig\|baby\|宝宝\|🐷\|🐨\|tapasta\|filmfest" . \
  --exclude-dir=node_modules --exclude-dir=dist --exclude=package-lock.json \
  || echo "零命中，干净"
```

预期：打印「零命中，干净」。若有命中，逐条清掉再重跑。

- [ ] **Step 5: 源仓库确认未被触碰**

```bash
git -C /Users/tantianshu/Documents/code/filmfest status --porcelain
```

预期：仍只有 `?? .DS_Store`。

- [ ] **Step 6: 人工过一眼真实页面**

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && npm run preview
```

打开终端给出的地址，确认：登录页标题是「家庭电影节」、两个按钮写着「我是 A」「我是 B」。（未配 .env，输入口令不会通过，只看这一屏即可。）看完 Ctrl-C 停掉。

---

## Task 12: 初始化 git 并首次提交

**Files:** 无

- [ ] **Step 1: 确认 .gitignore 会挡住不该进库的东西**

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && cat .gitignore
```

预期含 `node_modules`、`dist`、`.env`。其中的 `modifications.md`、`screenshots/`、`.superpowers/` 三行是原项目的私人条目，删掉它们，只保留通用的四行：

```
node_modules
dist
.env
.env.local
```

- [ ] **Step 2: git init 并检查暂存内容**

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && git init -q && git add -A && git status --short
```

预期：列出源码 / 文档 / 配置文件，**不含** `.env`、`node_modules/`、`dist/`。若 `dist/` 出现，先 `rm -rf dist` 再重新 `git add -A`。

- [ ] **Step 3: 首次提交**

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && git commit -q -m "feat: family film festival template

A two-person film festival site: TMDB search, custom lists, realtime
voting, random tie-breaker, per-person reviews. Personalize by editing
src/config.ts. See SETUP.md for deployment.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" && git log --oneline
```

预期：只有一个 commit。

---

## Task 13: 推送到 GitHub 并设为模板仓库

**⛔ 这一步会把仓库公开发布到互联网。执行前必须先向用户确认仓库名与公开/私有，得到明确同意后才能跑。**

- [ ] **Step 1: 向用户确认**

问清两件事：仓库名是否用 `family-film-festival`；建为 Public 还是 Private。等待明确答复。

- [ ] **Step 2: 创建仓库并推送**

```bash
cd /Users/tantianshu/Documents/code/family-film-festival && \
gh repo create family-film-festival --public --source=. --remote=origin --push \
  --description "A two-person family film festival site — TMDB search, custom lists, realtime voting. Use this template to make your own."
```

（用户若选 Private，把 `--public` 换成 `--private`。）

- [ ] **Step 3: 勾选 Template repository**

```bash
gh repo edit family-film-festival --template
```

- [ ] **Step 4: 确认生效**

```bash
gh repo view family-film-festival --json name,visibility,isTemplate,url
```

预期：`isTemplate` 为 `true`，`url` 即可以发给朋友的地址。

- [ ] **Step 5: 最后一次确认源仓库与线上站没受影响**

```bash
git -C /Users/tantianshu/Documents/code/filmfest status --porcelain && \
git -C /Users/tantianshu/Documents/code/filmfest log --oneline -1
```

预期：只有 `?? .DS_Store`；最新 commit 仍是写 spec/plan 那两个 docs commit，源码零改动。你的 https://tianshuuu.github.io/filmfest/ 未重新部署过。
