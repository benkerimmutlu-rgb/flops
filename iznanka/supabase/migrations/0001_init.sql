-- IZNANKA — схема прогресса обучения.
-- Прогресс хранится одной строкой на пользователя в JSONB: тот же формат,
-- что и локальный fallback, поэтому синхронизация сводится к upsert одной строки.
--
-- Формат data:
-- {
--   "status":      { "<topicId>": "new" | "progress" | "done" },
--   "testPassed":  { "<clusterId>": true }
-- }

create table if not exists public.user_progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Включаем Row Level Security: каждый видит и меняет только свою строку.
alter table public.user_progress enable row level security;

drop policy if exists "read own progress"   on public.user_progress;
drop policy if exists "insert own progress" on public.user_progress;
drop policy if exists "update own progress" on public.user_progress;

create policy "read own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "insert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "update own progress"
  on public.user_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Автообновление updated_at.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_progress_touch on public.user_progress;
create trigger trg_user_progress_touch
  before update on public.user_progress
  for each row execute function public.touch_updated_at();
