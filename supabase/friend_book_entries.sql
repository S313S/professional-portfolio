create extension if not exists pgcrypto;

create table if not exists public.friend_book_entries (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  identity_intro text not null,
  portfolio_review text not null,
  latest_game_id text,
  avatar_id text,
  latest_medal_id text,
  latest_date text,
  client_id text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'friend_book_entries_nickname_length'
  ) then
    alter table public.friend_book_entries
      add constraint friend_book_entries_nickname_length
      check (char_length(nickname) between 1 and 32);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'friend_book_entries_identity_intro_length'
  ) then
    alter table public.friend_book_entries
      add constraint friend_book_entries_identity_intro_length
      check (char_length(identity_intro) between 1 and 160);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'friend_book_entries_portfolio_review_length'
  ) then
    alter table public.friend_book_entries
      add constraint friend_book_entries_portfolio_review_length
      check (char_length(portfolio_review) between 1 and 220);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'friend_book_entries_latest_game_id_check'
  ) then
    alter table public.friend_book_entries
      add constraint friend_book_entries_latest_game_id_check
      check (
        latest_game_id is null
        or latest_game_id in ('between-two-pages', 'moon-run', 'one-stroke-mark')
      );
  end if;
end
$$;

create index if not exists friend_book_entries_published_created_at_idx
  on public.friend_book_entries (is_published, created_at);

alter table public.friend_book_entries enable row level security;

drop policy if exists "public can read published friend book entries"
  on public.friend_book_entries;

create policy "public can read published friend book entries"
  on public.friend_book_entries
  for select
  to anon
  using (is_published = true);

drop policy if exists "public can insert friend book entries"
  on public.friend_book_entries;

create policy "public can insert friend book entries"
  on public.friend_book_entries
  for insert
  to anon
  with check (
    is_published = true
    and char_length(nickname) between 1 and 32
    and char_length(identity_intro) between 1 and 160
    and char_length(portfolio_review) between 1 and 220
  );

grant select, insert on public.friend_book_entries to anon;
