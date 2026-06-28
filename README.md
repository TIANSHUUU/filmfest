# 我们的电影节 🎬

两人自用的家庭电影节网站：搜片加入、按自定义分类陈列、实时投票决定下次 movie night。

技术栈：Vite + React + TypeScript（静态站）+ Supabase（数据 / 实时 / 存储）+ TMDB（搜片取海报），部署到 GitHub Pages。

## 本地开发
1. `npm install`
2. 复制 `.env.example` 为 `.env`，填入 Supabase / TMDB / 口令四个值
3. 在 Supabase 控制台 SQL Editor 执行 `supabase/schema.sql` 建表
4. `npm run dev`，打开终端里给出的本地地址

## 测试
`npm test`

## 部署（GitHub Pages）
1. 把仓库 push 到 GitHub（仓库名需与 `vite.config.ts` 里的 `base` 一致，默认 `/filmfest/`；若仓库名不同，改这个 `base`）
2. 仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**
3. 仓库 **Settings → Secrets and variables → Actions → New repository secret** 添加四个：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_TMDB_API_KEY`
   - `VITE_APP_PASSPHRASE`
4. push 到 `main` 分支即自动构建并部署；完成后在 Actions 页面或 Settings → Pages 看到访问地址

## 说明
- `.env` 不进 git（已被 `.gitignore` 忽略），密钥只通过本地 `.env` 与 GitHub Actions secrets 注入。
- 这是两人自用的私密应用，共享口令仅作软门槛；数据访问由 Supabase anon key + 行级规则控制。
