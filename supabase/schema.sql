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
  comment text,
  review_pig text,
  review_baby text,
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
