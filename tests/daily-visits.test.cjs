const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const load = require('./load-typescript.cjs');
const { advanceVisit, calendarDay, normalizeVisit, reconcileVisitBalance } = load(path.resolve(__dirname, '../src/lib/daily-visits.ts'));
const start = day => advanceVisit(null, day, 'Europe/Istanbul').visit;
const step = (visit, day) => advanceVisit(visit, day, 'Europe/Istanbul');

test('five bones every three actual visits, including day 30', () => {
  let visit = null, total = 0;
  for (let day = 1; day <= 30; day++) {
    const result = step(visit, `2026-10-${String(day).padStart(2, '0')}`);
    assert.equal(result.reward, day % 3 === 0 ? 5 : 0);
    visit = result.visit; total += result.reward;
  }
  assert.equal(total, 50);
  assert.equal(visit.rewardTotal, 50);
});
test('same-day reload and clock rollback do not grant visits or rewards', () => {
  const visit = start('2026-10-20');
  assert.deepEqual(step(visit, '2026-10-20'), { visit, reward: 0, restarted: false });
  assert.equal(step(visit, '2026-10-19').visit, visit);
});
test('one missing day is protected and does not count as a visit', () => {
  let visit = step(start('2026-10-01'), '2026-10-02').visit;
  const result = step(visit, '2026-10-04');
  assert.equal(result.reward, 5);
  assert.equal(result.visit.days, 3);
  assert.equal(result.visit.lastPause, '2026-10-03');
  visit = step(result.visit, '2026-10-06').visit;
  assert.equal(visit.days, 1);
  assert.equal(visit.rewardTotal, 5);
  assert.equal(visit.lastPause, '2026-10-03');
});
test('pause recovers exactly seven days after the protected missed date', () => {
  const previous = { ...start('2026-10-09'), days: 8, lastPause: '2026-10-03' };
  assert.equal(step(previous, '2026-10-11').visit.days, 9);
  assert.equal(step({ ...previous, lastPause: '2026-10-04' }, '2026-10-11').visit.days, 1);
});
test('two missed days restart only the series, retaining rewards', () => {
  const result = step({ ...start('2026-10-03'), days: 3, rewardTotal: 5 }, '2026-10-06');
  assert.equal(result.visit.days, 1);
  assert.equal(result.visit.rewardTotal, 5);
  assert.equal(result.restarted, true);
  assert.equal(result.reward, 0);
});
test('account timezone and daylight saving transitions use calendar dates', () => {
  assert.equal(calendarDay(new Date('2026-10-19T22:15:00Z'), 'Europe/Istanbul'), '2026-10-20');
  assert.equal(calendarDay(new Date('2026-10-20T01:00:00Z'), 'America/New_York'), '2026-10-19');
  assert.equal(step(start('2026-03-28'), '2026-03-29').visit.days, 2);
  assert.equal(step(start('2026-10-24'), '2026-10-25').visit.days, 2);
  assert.equal(normalizeVisit({ ...start('2026-10-20'), lastVisit: '2026-02-30' }), null);
});
test('late and repeated server receipts preserve learning earnings and spent bonuses', () => {
  const awarded = reconcileVisitBalance({ bones: 13, bonesEarned: 20, applied: 0 }, 5);
  assert.deepEqual(awarded, { bones: 18, bonesEarned: 25, applied: 5 });
  assert.deepEqual(reconcileVisitBalance(awarded, 5), awarded);
  const spent = { ...awarded, bones: 8 };
  assert.deepEqual(reconcileVisitBalance(spent, 5), spent);
  assert.deepEqual(reconcileVisitBalance(spent, 0), spent);
});

test('guest wallet atomically records credit, survives failed legacy mirrors, and serializes tabs', async () => {
  const entries = new Map();
  let failMirrors = false, queue = Promise.resolve();
  global.localStorage = {
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => { if (failMirrors && key !== 'flops_wallet_v1') throw new Error('quota'); entries.set(key, value); },
  };
  Object.defineProperty(global, 'navigator', { configurable: true, value: { locks: { request: (_name, fn) => {
    const result = queue.then(fn); queue = result.catch(() => {}); return result;
  } } } });
  const { writeWallet, readWallet, claimGuestVisit } = load(path.resolve(__dirname, '../src/lib/wallet.ts'));
  writeWallet({ bones: 10, bonesEarned: 20, guestVisit: { ...start('2026-10-19'), days: 2 }, visitApplied: {} });
  failMirrors = true;
  const replies = await Promise.all([claimGuestVisit(new Date('2026-10-20T12:00Z')), claimGuestVisit(new Date('2026-10-20T12:00Z'))]);
  assert.equal(replies.reduce((sum, reply) => sum + reply.reward, 0), 5);
  assert.equal(readWallet().bones, 15);
  assert.equal(readWallet().bonesEarned, 25);
  assert.equal(readWallet().guestVisit.days, 3);
});
