const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PGlite } = require('@electric-sql/pglite');
let db, serial = 0;
before(async () => {
  db = new PGlite();
  // Fixtures below create UTC accounts; don't inherit the host's local date.
  await db.exec(`set timezone = 'UTC'`);
  await db.exec(`create schema auth; create table auth.users(id uuid primary key);
    create role anon; create role authenticated;
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema auth, public to authenticated, anon;`);
  await db.exec(fs.readFileSync(path.resolve(__dirname, '../supabase/schema.sql'), 'utf8'));
  const migration = fs.readFileSync(path.resolve(__dirname, '../supabase/migrations/202610200001_daily_visits.sql'), 'utf8');
  await db.exec(migration);
  await db.exec(migration); // safe to apply again
});
after(async () => { await db?.close(); });
async function user(days = 0, gap = 1, total = 0, pauseAgo = null) {
  const id = `00000000-0000-0000-0000-${String(++serial).padStart(12, '0')}`;
  await db.query(`insert into auth.users values($1);`, [id]);
  await db.query(`insert into public.profiles(id,name,country_code,state) values($1,'Test','tr',$2::jsonb)`, [id, JSON.stringify({ bones: 20, bonesEarned: 50, visitRewardTotal: total })]);
  if (days) await db.query(`insert into public.daily_visit_accounts values($1,'UTC',current_date-$2::integer,current_date-20,$3,current_date-$4::integer,$5)`, [id, gap, days, pauseAgo, total]);
  await db.query(`select set_config('request.jwt.claim.sub',$1,false)`, [id]);
  return id;
}
async function claim(zone = 'UTC') { return (await db.query(`select public.claim_daily_visit($1) as result`, [zone])).rows[0].result; }
async function save(state) { return (await db.query(`select public.save_progress_with_visits($1::jsonb) as result`, [JSON.stringify(state)])).rows[0].result; }

test('server confirms first visit, fixes timezone, and ignores duplicate opens', async () => {
  await user();
  const first = await claim();
  const repeat = await claim('Pacific/Kiritimati');
  assert.equal(first.visit.days, 1); assert.equal(first.reward, 0);
  assert.deepEqual(repeat.visit, first.visit);
  assert.equal(repeat.state.bones, 20);
});
test('server grants exactly five once and stale saves cannot erase or duplicate it', async () => {
  const id = await user(2);
  const results = await Promise.all([claim(), claim()]);
  assert.equal(results.reduce((sum, result) => sum + result.reward, 0), 5);
  assert.equal((await save({ bones: 20, bonesEarned: 50, visitRewardTotal: 0 })).bones, 25);
  assert.equal((await save({ bones: 20, bonesEarned: 50, visitRewardTotal: 0 })).bones, 25);
  assert.equal((await save({ bones: 13, bonesEarned: 55, visitRewardTotal: 5, owned: ['ball'] })).bones, 13);
  assert.equal((await claim()).state.bones, 13);
  assert.equal((await db.query(`select count(*)::int as count from public.daily_visit_rewards where user_id=$1`, [id])).rows[0].count, 1);
});
test('server protects a single missed day, recharges at seven days, and retains prior credits on reset', async () => {
  await user(2, 2); assert.equal((await claim()).visit.days, 3);
  await user(8, 2, 10, 8); assert.equal((await claim()).visit.days, 9);
  await user(8, 2, 10, 7); const rejected = await claim();
  assert.equal(rejected.visit.days, 1); assert.equal(rejected.visit.rewardTotal, 10);
  await user(5, 3, 5); const restarted = await claim();
  assert.equal(restarted.visit.days, 1); assert.equal(restarted.restarted, true);
});
test('failed credit rolls the whole visit and reward ledger back', async () => {
  const id = await user(2);
  await db.exec(`create function public.test_fail_credit() returns trigger language plpgsql as $$begin raise exception 'test rollback'; end$$;
    create trigger test_fail before update on public.profiles for each row execute function public.test_fail_credit();`);
  try { await assert.rejects(claim(), /test rollback/); }
  finally { await db.exec(`drop trigger test_fail on public.profiles; drop function public.test_fail_credit();`); }
  assert.equal((await db.query(`select days from public.daily_visit_accounts where user_id=$1`, [id])).rows[0].days, 2);
  assert.equal((await db.query(`select count(*)::int as count from public.daily_visit_rewards where user_id=$1`, [id])).rows[0].count, 0);
  assert.equal((await claim()).reward, 5);
});
test('ledger is read-only to clients, scoped by account, and RPC requires authentication', async () => {
  const first = await user(2); await claim();
  const second = await user();
  await db.exec('set role authenticated');
  try {
    assert.equal((await db.query(`select * from public.daily_visit_accounts where user_id=$1`, [first])).rows.length, 0);
    await assert.rejects(db.exec(`insert into public.daily_visit_rewards values('${second}',current_date,3,current_date,5)`), /permission denied/);
    assert.equal((await claim()).visit.days, 1);
  } finally { await db.exec('reset role'); }
  await db.exec(`select set_config('request.jwt.claim.sub','',false)`);
  await assert.rejects(claim(), /authentication_required/);
});
