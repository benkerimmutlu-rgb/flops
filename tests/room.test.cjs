const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Compile the actual pure modules without adding a test runtime dependency.
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  new Function('require', 'module', 'exports', code)(
    name => name.startsWith('.') ? load(path.resolve(path.dirname(file), name + '.ts')) : require(name),
    module, module.exports,
  );
  return module.exports;
}
const { emptyRoom, normalizeRoom, newerRoom } = load(path.resolve(__dirname, '../src/lib/room.ts'));
const { ACCESSORIES } = load(path.resolve(__dirname, '../src/lib/shop.ts'));

test('new rooms are empty and independent', () => {
  const data = emptyRoom();
  data.layout.peach.items.push({ id: 'ball' });
  assert.equal(data.layout.blue.items.length, 0);
  assert.equal(emptyRoom().layout.peach.items.length, 0);
});

test('invalid saved data is sanitized without granting ownership', () => {
  const data = normalizeRoom({ owned: ['gm38'], room: 'invalid', layout: {
    peach: { items: [{ id: 'missing' }, { id: 'ball', x: Infinity, y: 99, scale: -5 }, { id: 'ball' }], pug: { seat: 'missing' } },
  } });
  assert.equal(data.room, 'peach');
  assert.equal(data.layout.peach.items.length, 1);
  assert.equal(data.layout.peach.items[0].x, .5);
  assert.equal(data.layout.peach.items[0].y, 1.1);
  assert.equal(data.layout.peach.items[0].scale, .4);
  assert.equal(data.layout.peach.pug.seat, null);
  assert.equal('owned' in data, false);
});

test('desk relationships, seating and free clothing coordinates survive a save', () => {
  const data = emptyRoom();
  data.layout.peach.items = [{ id: 'gm36', x: .5, y: .8, scale: 1, rotation: 0 },
    { id: 'gm31', x: .5, y: .8, scale: 1, rotation: 0, parent: 'gm36', mountX: .1, mountY: -.1 },
    { id: 'gm38', x: .6, y: .9, scale: 1, rotation: 0 }];
  data.layout.peach.outfit = [{ id: 'glasses', x: .2, y: .7, scale: 1.3, rotation: 45 }];
  data.layout.peach.pug.seat = 'gm38';
  const saved = normalizeRoom(JSON.parse(JSON.stringify(data)));
  assert.deepEqual(saved, data);
});

test('newer complete snapshots preserve deletions and furniture relationships', () => {
  const old = emptyRoom(); old.updatedAt = 10;
  old.layout.peach.items.push({ id: 'ball', x: .5, y: .8, scale: 1, rotation: 0 });
  const fresh = emptyRoom(); fresh.updatedAt = 20;
  assert.equal(newerRoom(fresh, old), fresh);
  assert.equal(newerRoom(old, fresh).layout.peach.items.length, 0);
  assert.equal(newerRoom(fresh, null), fresh);
});

test('all eight new gaming products have assets, prices and room metadata', () => {
  const catalog = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/components/clay/room-catalog.json'), 'utf8'));
  assert.equal(new Set(ACCESSORIES.map(item => item.id)).size, ACCESSORIES.length);
  for (let number = 31; number <= 38; number++) {
    const item = ACCESSORIES.find(item => item.id === `gm${number}`);
    assert.equal(item.category, 'games');
    assert.ok(item.price > 0 && item.active);
    assert.ok(fs.existsSync(path.resolve(__dirname, '../public' + item.img)));
    const room = catalog.find(entry => entry.id === item.id);
    assert.ok(room && fs.existsSync(path.resolve(__dirname, '../public' + room.img)));
  }
});

test('Eurovision collection is complete and every product can be used in the room', () => {
  const catalog = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/components/clay/room-catalog.json'), 'utf8'));
  const products = ACCESSORIES.filter(item => item.category === 'eurovision');
  assert.equal(products.length, 10);
  assert.equal(new Set(ACCESSORIES.map(item => item.id)).size, ACCESSORIES.length);
  for (const item of products) {
    assert.ok(item.active && item.price > 0);
    assert.ok(fs.existsSync(path.resolve(__dirname, '../public' + item.img)));
    const room = catalog.find(entry => entry.id === item.id);
    assert.ok(room && fs.existsSync(path.resolve(__dirname, '../public' + room.img)));
  }
  assert.equal(catalog.find(item => item.id === 'ev_backstage_pass').kind, 'wear');
  assert.equal(catalog.find(item => item.id === 'ev_eurovision_logo').kind, 'wall');
  assert.equal(products.some(item => item.id === 'ev_heart_hands'), false);
});
