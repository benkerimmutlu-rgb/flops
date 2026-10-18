-- FLOPS — схема для Supabase.
-- Выполни это один раз в Supabase → SQL Editor.
-- Одна строка на аккаунт родителя: профиль ребёнка (имя, страна) + весь прогресс
-- в JSON-поле state (флаги, страны, косточки, покупки — как в localStorage).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  country_code text not null,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Включаем защиту на уровне строк: каждый видит и меняет только свою строку.
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
