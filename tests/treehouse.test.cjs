const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} }; cache.set(file, module);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  new Function('require', 'module', 'exports', code)(name => name.endsWith('.json') ? require(path.resolve(path.dirname(file), name)) : name.startsWith('.') ? load(path.resolve(path.dirname(file), /\.(js|ts)$/.test(name) ? name : name + '.ts')) : require(name), module, module.exports);
  return module.exports;
}
const adventure = load(path.resolve(__dirname, '../src/lib/treehouse-adventure.ts'));
const { emptyRoom, normalizeRoom, newerRoom } = load(path.resolve(__dirname, '../src/lib/room.ts'));
const { ACCESSORIES } = load(path.resolve(__dirname, '../src/lib/shop.ts'));
const placement = load(path.resolve(__dirname, '../src/components/clay/room-placement.js'));
const catalog = require('../src/components/clay/room-catalog.json');
const day1 = new Date('2026-10-24T12:00:00Z');
const start = () => adventure.startAdventure(day1, 'Europe/Istanbul');

test('lantern needs three correct answers; reload, duplicate claims and unknown IDs cannot grant extra gifts', () => {
  let value = start();
  assert.equal(adventure.giftReady(value, 'treehouse_lantern', day1), false);
  assert.equal(adventure.answerAdventure(null), null);
  for (let i = 0; i < 3; i++) value = adventure.answerAdventure(value);
  assert.equal(adventure.answerAdventure(value), value);
  value = adventure.normalizeAdventure(JSON.parse(JSON.stringify(value)));
  assert.equal(adventure.giftReady(value, 'treehouse_lantern', day1), true);
  assert.equal(adventure.claimAdventure(value, 'figure_rumi', day1), value);
  value = adventure.claimAdventure(value, 'treehouse_lantern', day1);
  assert.deepEqual(value.claimed, ['treehouse_lantern']);
  assert.equal(adventure.claimAdventure(value, 'treehouse_lantern', day1), value);
});
test('calendar gifts unlock on local days, survive skipped days, and remain locked on clock rollback', () => {
  const value = adventure.startAdventure(new Date('2026-10-24T20:59:00Z'), 'Europe/Istanbul');
  assert.equal(adventure.giftReady(value, 'treehouse_cushion', new Date('2026-10-24T20:59:59Z')), false);
  assert.equal(adventure.giftReady(value, 'treehouse_cushion', new Date('2026-10-24T21:00:00Z')), true);
  assert.equal(adventure.giftReady(value, 'treehouse_shelf', new Date('2026-10-24T21:00:00Z')), false);
  assert.equal(adventure.giftReady(value, 'treehouse_shelf', new Date('2026-11-15T12:00:00Z')), true);
  assert.equal(adventure.giftReady(value, 'treehouse_cushion', new Date('2026-10-20T12:00:00Z')), false);
  assert.equal(adventure.normalizeAdventure({ ...value, timezone: 'no-such-zone' }), null);
});
test('old rooms migrate empty treehouse without losing furniture, clothes, selected room or cloud timestamp', () => {
  const old = emptyRoom(); delete old.layout.treehouse; delete old.adventure;
  old.room = 'blue'; old.updatedAt = 123;
  old.layout.blue.items.push({ id: 'ball', x: .4, y: .8, scale: 1, rotation: 0 });
  const next = normalizeRoom(old);
  assert.equal(next.room, 'blue'); assert.equal(next.updatedAt, 123);
  assert.deepEqual(next.layout.blue, old.layout.blue);
  assert.equal(next.layout.treehouse.items.length, 0); assert.equal(next.adventure, null);
  next.layout.treehouse.items.push({ id: 'figure_rumi' });
  assert.equal(next.layout.peach.items.length, 0);
});
test('cloud furniture and event progress merge without erasing earned gifts or resetting correct answers', () => {
  const local = emptyRoom(); local.updatedAt = 10; local.adventure = { ...start(), answers: 3, claimed: ['treehouse_lantern'] };
  const remote = emptyRoom(); remote.updatedAt = 20; remote.adventure = { ...start(), answers: 1, claimed: ['treehouse_cushion'] };
  remote.layout.treehouse.items.push({ id: 'ball', x: .4, y: .8, scale: 1, rotation: 0 });
  const merged = newerRoom(local, remote);
  assert.equal(merged.layout.treehouse.items.length, 1);
  assert.equal(merged.adventure.answers, 3);
  assert.deepEqual(merged.adventure.claimed, ['treehouse_lantern', 'treehouse_cushion']);
  assert.deepEqual(normalizeRoom(JSON.parse(JSON.stringify(merged))), merged);
});
test('all six eight-bone figurines mount on every shelf; the fourth stays out and placements round-trip', () => {
  const ids = ['figure_rumi', 'figure_mira', 'figure_zoey', 'figure_alvin', 'figure_simon', 'figure_theodore'];
  for (const id of ids) {
    const product = ACCESSORIES.find(item => item.id === id), item = catalog.find(item => item.id === id);
    assert.equal(product.price, 8); assert.equal(product.active, true); assert.equal(item.kind, 'floor');
    for (const support of catalog.filter(item => placement.shelfIds.includes(item.id))) assert.equal(placement.canMount(item, support), true);
    assert.equal(placement.canMount(item, catalog.find(item => item.id === 'gm36')), false);
    const saved = emptyRoom(); saved.room = 'treehouse'; saved.layout.treehouse.items = [
      { id: 'treehouse_shelf', x: .65, y: .42, scale: 1.2, rotation: 0 },
      { id, parent: 'treehouse_shelf', mountX: .28, mountY: 0, x: .5, y: .8, scale: 1, rotation: 0 },
    ];
    assert.deepEqual(normalizeRoom(saved), saved);
    assert.ok(fs.existsSync(path.resolve(__dirname, '../public' + product.img)));
  }
  assert.equal(placement.freeShelfSlot([{ mountX: 0 }, { mountX: -.28 }, { mountX: .28 }]), null);
  for (const id of adventure.TREEHOUSE_GIFTS) {
    const product = ACCESSORIES.find(item => item.id === id);
    assert.equal(product.active, false); assert.equal(product.price, 0);
    assert.ok(fs.existsSync(path.resolve(__dirname, '../public' + product.img)));
  }
});
