begin;

create table if not exists public.daily_visit_accounts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  timezone text not null,
  last_visit date,
  series_start date,
  days integer not null default 0 check (days >= 0),
  last_pause date,
  reward_total integer not null default 0 check (reward_total >= 0)
);
create table if not exists public.daily_visit_log (
  user_id uuid not null references public.profiles(id) on delete cascade,
  local_date date not null,
  series_start date not null,
  series_day integer not null,
  primary key (user_id, local_date)
);
create table if not exists public.daily_visit_rewards (
  user_id uuid not null references public.profiles(id) on delete cascade,
  series_start date not null,
  milestone integer not null check (milestone > 0 and milestone % 3 = 0),
  local_date date not null,
  amount integer not null check (amount = 5),
  primary key (user_id, series_start, milestone)
);

alter table public.daily_visit_accounts enable row level security;
alter table public.daily_visit_log enable row level security;
alter table public.daily_visit_rewards enable row level security;
revoke all on public.daily_visit_accounts, public.daily_visit_log, public.daily_visit_rewards from anon, authenticated;
grant select on public.daily_visit_accounts to authenticated;
drop policy if exists daily_visit_read_own on public.daily_visit_accounts;
create policy daily_visit_read_own on public.daily_visit_accounts for select to authenticated using (user_id = auth.uid());

create or replace function public.visit_amount(value jsonb) returns integer
language sql immutable set search_path = '' as $$
  select case when value #>> '{}' ~ '^[0-9]{1,9}$' then (value #>> '{}')::integer else 0 end;
$$;
create or replace function public.apply_visit_credit(value jsonb, total integer) returns jsonb
language plpgsql immutable set search_path = '' as $$
declare missing integer := total - least(total, public.visit_amount(value->'visitRewardTotal'));
begin
  return value || jsonb_build_object('bones', public.visit_amount(value->'bones') + missing,
    'bonesEarned', public.visit_amount(value->'bonesEarned') + missing, 'visitRewardTotal', total);
end;
$$;
revoke all on function public.visit_amount(jsonb), public.apply_visit_credit(jsonb, integer) from public;

create or replace function public.claim_daily_visit(p_timezone text default 'UTC') returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  account public.daily_visit_accounts%rowtype;
  progress jsonb;
  today date;
  gap integer;
  protect boolean := false;
  reward integer := 0;
  restarted boolean := false;
begin
  if uid is null then raise exception 'authentication_required' using errcode = '28000'; end if;
  -- All reward/save operations lock the profile first, preventing deadlocks and stale overwrites.
  select state into progress from public.profiles where id = uid for update;
  if not found then raise exception 'profile_required'; end if;
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = p_timezone) then p_timezone := 'UTC'; end if;
  insert into public.daily_visit_accounts(user_id, timezone) values(uid, p_timezone) on conflict do nothing;
  select * into account from public.daily_visit_accounts where user_id = uid for update;
  today := (clock_timestamp() at time zone account.timezone)::date;
  gap := today - account.last_visit;
  if account.last_visit is null or gap > 0 then
    protect := gap = 2 and (account.last_pause is null or (today - 1) - account.last_pause >= 7);
    if gap = 1 or protect then
      account.days := account.days + 1;
    else
      restarted := account.last_visit is not null;
      account.days := 1;
      account.series_start := today;
    end if;
    if protect then account.last_pause := today - 1; end if;
    account.last_visit := today;
    insert into public.daily_visit_log values(uid, today, account.series_start, account.days);
    if account.days % 3 = 0 then
      insert into public.daily_visit_rewards values(uid, account.series_start, account.days, today, 5)
        on conflict do nothing;
      if found then reward := 5; account.reward_total := account.reward_total + reward; end if;
    end if;
    update public.daily_visit_accounts set last_visit = account.last_visit, series_start = account.series_start,
      days = account.days, last_pause = account.last_pause, reward_total = account.reward_total where user_id = uid;
  end if;
  progress := public.apply_visit_credit(progress, account.reward_total);
  update public.profiles set state = progress, updated_at = now() where id = uid;
  return jsonb_build_object('visit', jsonb_build_object('version', 1, 'timezone', account.timezone,
    'lastVisit', account.last_visit, 'seriesStart', account.series_start, 'days', account.days,
    'lastPause', account.last_pause, 'rewardTotal', account.reward_total),
    'reward', reward, 'restarted', restarted, 'state', progress);
end;
$$;

-- The client acknowledges the bonus total included in its balances. An older snapshot
-- receives only its missing credits; it cannot overwrite the authoritative visit ledger.
create or replace function public.save_progress_with_visits(p_state jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); old_state jsonb; total integer;
begin
  if uid is null then raise exception 'authentication_required' using errcode = '28000'; end if;
  if jsonb_typeof(p_state) <> 'object' then raise exception 'invalid_state'; end if;
  select state into old_state from public.profiles where id = uid for update;
  if not found then raise exception 'profile_required'; end if;
  select reward_total into total from public.daily_visit_accounts where user_id = uid;
  total := coalesce(total, 0);
  p_state := public.apply_visit_credit(old_state || p_state, total);
  update public.profiles set state = p_state, updated_at = now() where id = uid;
  return p_state;
end;
$$;
revoke all on function public.claim_daily_visit(text), public.save_progress_with_visits(jsonb) from public;
grant execute on function public.claim_daily_visit(text), public.save_progress_with_visits(jsonb) to authenticated;

notify pgrst, 'reload schema';
commit;
