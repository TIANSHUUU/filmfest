# 开源模板仓库设计（family-film-festival）

日期：2026-07-25

## 目标

朋友想用这套电影节网站做自己的站。给他们一份**去个人化的快照**：设计和功能完整保留，影片内容是空白画布，初始两个角色叫 A 和 B。

## 前提事实

- 现有仓库 `github.com/TIANSHUUU/filmfest` 已是 public，30 个 commit 全部同步，线上站 https://tianshuuu.github.io/filmfest/ 由它自动构建。
- 影片、片单、投票数据全在 Supabase，git 仓库内没有任何影片记录——"空白画布"天然成立，朋友开自己的 Supabase 项目即为空库。
- 仓库内的个人痕迹只有三类：品牌名 `Tapasta电影节`、身份 `pig`/`baby`（🐷/宝宝/🐨）、`docs/superpowers/` 下的旧设计文档。

## 方案：另建干净模板仓库

新建目录 `~/Documents/code/family-film-festival`，从现有代码拷一份，做去个人化改造，`git init` 全新历史，推到同名 GitHub 仓库 `family-film-festival` 并在 Settings 勾选 **Template repository**。朋友点 "Use this template" 得到自己的仓库。

**现有 `~/Documents/code/filmfest` 仓库与线上站全程不改动一个字。** 你的站继续叫 Tapasta电影节、继续是 🐷/宝宝、数据库字段不动、无需迁移、无需重新部署。

已知代价：两套代码从此独立。以后 filmfest 加的新功能不会自动流向模板，需要时手动拷贝改动过去。这是接受的——朋友要的是当前功能快照。

拷贝时排除：`.git/`、`.env`、`node_modules/`、`dist/`、`.superpowers/`、`modifications.md`、`docs/`、`.DS_Store`。

## 改造清单

### 1. 身份 pig/baby → a/b，个性化集中到一个文件

新增 `src/config.ts`，作为朋友唯一需要修改的文件：

```ts
export const FESTIVAL_NAME = '家庭电影节';
export const ROLES = {
  a: { name: 'A', badge: 'A', color: '#e9c46a' },  // 金
  b: { name: 'B', badge: 'B', color: '#5ad1c2' },  // 青
};
```

连带改动：

| 文件 | 改动 |
|---|---|
| `src/types.ts` | `Identity = 'a' \| 'b'`；`IDENTITY_LABEL` / `IDENTITY_BADGE` 从 `ROLES` 派生；`Film` 的 `review_pig`/`review_baby` → `review_a`/`review_b` |
| `src/lib/votes.ts` | `Tally { pig, baby }` → `{ a, b }`；`tallyForFilm` 相应改写 |
| `src/lib/db.ts` | `setReview` 的列名由三元判断改为 `review_${author}` |
| `src/components/Nav.tsx` | 标题读 `FESTIVAL_NAME`；`identity === 'pig'` → `'a'` |
| `src/components/IdentityGate.tsx` | 标题读 `FESTIVAL_NAME`；两个按钮文案读 `ROLES.a.name` / `ROLES.b.name` |
| `src/components/PosterCard.tsx` | `added_by === 'pig'` → `'a'`；`review_pig`/`review_baby` → `review_a`/`review_b` |
| `src/components/VotingWidget.tsx` | `t.pig`/`t.baby` → `t.a`/`t.b`；徽标读 `IDENTITY_BADGE` |
| `src/main.tsx` | 启动时把 `ROLES.a.color` / `ROLES.b.color` 写入 CSS 变量 `--you` / `--ta`（约 5 行），使配色也由 config 统一控制 |
| `src/theme.css` | `--you` / `--ta` 保留为默认值（config 注入前的兜底），其余不动 |

红毯金色 + 青色的整套视觉设计原样保留——那正是朋友要拿的东西。CSS 类名 `badge-you` / `badge-ta` 不重命名，它们已经是中性的。

### 2. 数据库脚本去个人化

`supabase/schema.sql`：

- 三处 `check (... in ('pig','baby'))` → `in ('a','b')`
- `review_pig` / `review_baby` → `review_a` / `review_b`
- 删除文件底部三段历史迁移注释（2026-07-02 拖拽排序、2026-07-03 片长、2026-07-03 多分类）——新用户一次建表即包含全部字段，这些注释只是噪音

### 3. 拆两个部署坑

- `vite.config.ts`：`base: '/filmfest/'` → `base: './'`，朋友的仓库无论叫什么名字都不必改代码。需在实现阶段用 `npm run build` + `vite preview` 验证资源路径未破。
- `index.html`：`<title>` 改为 `家庭电影节`
- `package.json`：`name` 由 `filmfest` 改为 `family-film-festival`，补上 `description` 与 `license: MIT`

### 4. 删除

`docs/superpowers/` 整个目录不拷贝（旧 spec 与 plan 通篇是 🐷/宝宝 的设计记录）。`modifications.md`、`.env` 本就在 `.gitignore` 内。

### 5. 新增交付物

- **`LICENSE`**：MIT
- **`README.md`** 重写：项目是什么、功能清单、五分钟快速开始、指向 SETUP.md
- **`SETUP.md`** 保姆级部署文档，面向不写代码的朋友，每步写明在哪个页面点哪个按钮：
  1. 注册 Supabase → 新建项目 → Settings/API 复制 Project URL 与 anon key
  2. SQL Editor 粘贴 `supabase/schema.sql` 执行
  3. 注册 TMDB → 申请免费 API key
  4. 点 "Use this template" 生成自己的仓库
  5. Settings → Secrets and variables → Actions 添加 4 个 secret
  6. Settings → Pages → Source 选 GitHub Actions
  7. 改 `src/config.ts` 换成自己的电影节名与两人名字，push 即自动部署
- **`.env.example`**：每行加注释说明该值从哪个页面获取

## 验收标准

- 全部测试文件中的 `pig`/`baby` 替换为 `a`/`b`，`npm test` 全绿
- `npm run build` 成功，`vite preview` 打开后资源加载正常（验证 `base: './'`）
- `grep -ri "pig\|baby\|宝宝\|🐷\|Tapasta\|filmfest" .` 在模板目录下（排除 `node_modules`、`package-lock.json`、`dist`）零命中
- `git log` 只有一个 commit，无个人痕迹
- 现有 `~/Documents/code/filmfest` 仓库 `git status` 干净、无任何改动

## 明确不做

- 不做站内首次设置向导（改一个 config 文件已足够，向导要多建表多写界面）
- 不做超过两个角色的通用成员系统（明确是两人场景）
- 不做主题/配色的运行时切换（红毯设计就是交付物本身）
- 不为兼容两边而引入环境变量覆盖机制（两套代码独立，模板直接硬编码 A/B 即可）
