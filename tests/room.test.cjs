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
const { roomPose } = load(path.resolve(__dirname, '../src/components/clay/room-poses.js'));

test('each room has its own base pose and furniture overrides it until the pug gets up', () => {
  const poses = { peach: 'stand', blue: 'sit', sage: 'sleep' };
  for (const [room, pose] of Object.entries(poses)) {
    assert.equal(roomPose(room, null), pose);
    assert.equal(roomPose(room, 'rx1'), 'sit');
    assert.equal(roomPose(room, 'gm38'), 'sit');
    assert.equal(roomPose(room, 'hw10'), 'sleep');
    assert.equal(roomPose(room, 'sleep_bed'), 'sleep');
    assert.equal(roomPose(room, null), pose);
  }
});

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
  assert.equal(products.length, 11);
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

test('sleep collection keeps purchase IDs and sleep furniture through save and reload', () => {
  const catalog = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/components/clay/room-catalog.json'), 'utf8'));
  const expected = { sleep_blanket: ['relax', 'wear'], sleep_bed: ['games', 'seat'], sleep_mask: ['eurovision', 'wear'], beach_dream: ['turkiye', 'wear'] };
  for (const [id, [category, kind]] of Object.entries(expected)) {
    const product = ACCESSORIES.find(item => item.id === id);
    const roomItem = catalog.find(item => item.id === id);
    assert.ok(product.active && product.price > 0);
    assert.equal(product.category, category);
    assert.equal(roomItem.kind, kind);
    assert.ok(fs.existsSync(path.resolve(__dirname, '../public' + product.img)));
    assert.ok(fs.existsSync(path.resolve(__dirname, '../public' + roomItem.img)));
  }
  const data = emptyRoom();
  data.layout.sage.items.push({ id: 'sleep_bed', x: .5, y: .88, scale: 1, rotation: 0 });
  data.layout.sage.pug.seat = 'sleep_bed';
  data.layout.sage.outfit = ['sleep_blanket', 'sleep_mask', 'beach_dream'].map(id => ({ id, x: .6, y: .3, scale: 1, rotation: 0 }));
  assert.deepEqual(normalizeRoom(JSON.parse(JSON.stringify(data))), data);
});

const { wearableFit, fitOutfit } = load(path.resolve(__dirname, '../src/components/clay/wardrobe.js'));
test('fitted clothing follows actual poses, separates paws and places capes behind the body', () => {
  const catalog = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/components/clay/room-catalog.json'), 'utf8'));
  const get = id => catalog.find(i => i.id === id);
  for (const pose of ['stand', 'sit', 'sleep']) {
    const gloves = wearableFit(get('sp1'), pose);
    assert.equal(gloves.parts.length, 2);
    assert.notEqual(gloves.parts[0].x, gloves.parts[1].x);
    assert.equal(gloves.parts[0].img, '/assets/clay/wardrobe/wear_boxing_glove_front.webp');
    assert.equal(wearableFit(get('sp4'), pose).parts.length, pose === 'sit' ? 4 : 3);
    assert.equal(wearableFit(get('cape'), pose).layer, 'back');
    assert.equal(wearableFit(get('cape'), pose).frontParts.length, 1);
    assert.equal(wearableFit(get('sleep_blanket'), pose).layer, 'front');
  }
  assert.notDeepEqual(wearableFit(get('sp1'), 'stand'), wearableFit(get('sp1'), 'sleep'));
  assert.equal(wearableFit(get('rx10'), 'sleep').parts[0].img, '/assets/clay/wardrobe/wear_blanket_front.webp');
});

test('fitting replaces only competing fitted clothing and round-trips without granting purchases', () => {
  const input = [{ id: 'sp4', fitted: true }, { id: 'sp7' }, { id: 'cape', fitted: true }, { id: 'gm28', x: .1, y: .1, scale: 2, rotation: 90 }];
  const outfit = fitOutfit(input, 'gm28');
  assert.deepEqual(outfit.map(o => o.id), ['sp7', 'cape', 'gm28']);
  const fitted = outfit.find(o => o.id === 'gm28');
  assert.deepEqual(fitted, { id: 'gm28', x: .5, y: .5, scale: 1, rotation: 0, fitted: true });
  assert.equal(input[0].id, 'sp4');
  const room = emptyRoom(); room.layout.peach.outfit = [fitted];
  assert.deepEqual(normalizeRoom(JSON.parse(JSON.stringify(room))), room);
  assert.equal('owned' in normalizeRoom(room), false);
});

test('all nine windows and the sports bar are purchasable wall items with real assets', () => {
  const catalog = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/components/clay/room-catalog.json'), 'utf8'));
  const windows = ACCESSORIES.filter(i => i.category === 'windows');
  assert.equal(windows.length, 9);
  assert.equal(new Set(ACCESSORIES.map(i => i.id)).size, ACCESSORIES.length);
  for (const item of [...windows, ACCESSORIES.find(i => i.id === 'sport_wall_bar')]) {
    assert.ok(item.active && item.price > 0);
    assert.ok(fs.existsSync(path.resolve(__dirname, '../public' + item.img)));
    assert.equal(catalog.find(i => i.id === item.id).kind, 'wall');
  }
  assert.equal(ACCESSORIES.find(i => i.id === 'sport_wall_bar').category, 'sport');
});

test('all pose-specific garment layers exist separately from the shop thumbnails', () => {
  const catalog = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/components/clay/room-catalog.json'), 'utf8'));
  for (const item of catalog.filter(i => i.kind === 'wear')) for (const pose of ['stand', 'sit', 'sleep']) {
    const fit = wearableFit(item, pose);
    for (const piece of [...fit.parts, ...(fit.frontParts || [])]) {
      assert.ok(fs.existsSync(path.resolve(__dirname, '../public' + piece.img)), item.id + ': ' + piece.img);
      assert.ok(Number.isFinite(piece.x) && Number.isFinite(piece.y) && piece.size > 0);
    }
  }
  assert.notEqual(ACCESSORIES.find(i => i.id === 'sp1').img, wearableFit(catalog.find(i => i.id === 'sp1'), 'stand').parts[0].img);
});

const { onDesk, deskCorner } = load(path.resolve(__dirname, '../src/components/clay/room-placement.js'));
test('laptop follows desk in either corner at mobile and desktop aspect ratios, with bounded tabletop drag', () => {
  for (const side of ['left', 'right']) for (const aspect of [1.15, 1.5]) {
    const width = .42 * (.68 + (.80 - .58) * 1.2);
    const desk = { ...deskCorner(side, width) };
    const at = onDesk(desk, width, aspect, { mountX: 0, mountY: 0 });
    assert.ok(desk.x - width / 2 >= .024 && desk.x + width / 2 <= .976);
    assert.equal(at.x, desk.x);
    assert.ok(at.y < desk.y);
    assert.ok(Math.abs((desk.y - at.y) / (width * aspect) - .52) < 1e-9);
    const moved = onDesk({ ...desk, x: desk.x + .1 }, width, aspect, { mountX: 0, mountY: 0 });
    assert.ok(Math.abs(moved.x - at.x - .1) < 1e-9);
    const extreme = onDesk(desk, width, aspect, { mountX: 99, mountY: -99 });
    assert.ok(Math.abs(extreme.x - desk.x - .28 * width) < 1e-9);
    assert.ok(Math.abs(extreme.y - (desk.y - .60 * width * aspect)) < 1e-9);
  }
});

const { SHOP_RELEASE, shouldShowRelease } = load(path.resolve(__dirname, '../src/lib/shop-release.ts'));
test('new shop release has seven usable purchased-only products and announces once per version', () => {
  const catalog = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/components/clay/room-catalog.json'), 'utf8'));
  assert.equal(SHOP_RELEASE.items.length, 7);
  for (const id of SHOP_RELEASE.items) {
    const product = ACCESSORIES.find(i => i.id === id), room = catalog.find(i => i.id === id);
    assert.ok(product.active && product.price > 0 && room);
    assert.ok(fs.existsSync(path.resolve(__dirname, '../public' + product.img)));
    const saved = emptyRoom(); saved.layout.blue.items = [{ id, x: .5, y: .8, scale: 1, rotation: 0 }];
    assert.deepEqual(normalizeRoom(saved), saved);
    assert.equal('owned' in normalizeRoom(saved), false);
  }
  assert.equal(shouldShowRelease(null), true);
  assert.equal(shouldShowRelease(SHOP_RELEASE.id), false);
  assert.equal(shouldShowRelease('earlier-release'), true);
});

test('full-face mask uses the head layer and broad cape has front and back pieces in every pose', () => {
  const catalog = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/components/clay/room-catalog.json'), 'utf8'));
  for (const pose of ['stand', 'sit', 'sleep']) {
    const mask = wearableFit(catalog.find(i => i.id === 'hw11'), pose);
    assert.equal(mask.layer, 'head');
    assert.ok(mask.parts[0].size >= .7);
    assert.match(mask.parts[0].img, /scream_mask_fit/);
    const cape = wearableFit(catalog.find(i => i.id === 'hw3'), pose);
    assert.equal(cape.layer, 'back');
    assert.ok(cape.parts[0].size >= 1 && cape.frontParts.length);
  }
});
