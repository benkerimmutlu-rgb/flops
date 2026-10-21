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
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  new Function('require', 'module', 'exports', code)(
    name => name.endsWith('.json') ? require(path.resolve(path.dirname(file), name)) : name.startsWith('.') ? load(path.resolve(path.dirname(file), /\.(js|ts)$/.test(name) ? name : name + '.ts')) : require(name),
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

test('all twelve windows and the sports bar are purchasable wall items with real assets', () => {
  const catalog = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/components/clay/room-catalog.json'), 'utf8'));
  const windows = ACCESSORIES.filter(i => i.category === 'windows');
  assert.equal(windows.length, 12);
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
test('new shop release has twenty-five usable purchased-only products and announces once per version', () => {
  const catalog = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/components/clay/room-catalog.json'), 'utf8'));
  assert.equal(SHOP_RELEASE.items.length, 25);
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

test('boxing headguard uses an open front overlay around the face in all three poses', () => {
  const helmet = require('../src/components/clay/room-catalog.json').find(i => i.id === 'sp10');
  for (const pose of ['stand','sit','sleep']) {
    const fit = wearableFit(helmet, pose);
    assert.equal(fit.layer, 'head');
    assert.equal(fit.parts.length, 1);
    assert.equal(fit.parts[0].img, '/assets/clay/wardrobe/boxing_headguard_fit.webp');
    assert.ok(fit.parts[0].y > .3, 'headguard surrounds the face rather than resting like a hat');
    assert.ok(fs.existsSync(path.resolve(__dirname, '../public' + fit.parts[0].img)));
  }
});

const closet = load(path.resolve(__dirname, '../src/components/clay/room-closet.js'));
const closetCatalog = require('../src/components/clay/room-catalog.json');
const wardrobeItem = { id: 'yellow_wardrobe', x: .3, y: .8, scale: 1, rotation: 0 };
test('wardrobe only stores purchased clothing and never equips or grants furniture', () => {
  const layout = emptyRoom().layout.peach;
  const owned = ['yellow_wardrobe','cape','glasses','ball'];
  assert.equal(closet.hangClothes(layout,'cape',owned,closetCatalog),layout,'wardrobe must be placed');
  layout.items.push(wardrobeItem);
  for (const id of ['ball','hw3','missing']) assert.equal(closet.hangClothes(layout,id,owned,closetCatalog),layout);
  assert.equal(closet.hangClothes(layout,'cape',['cape'],closetCatalog),layout,'wardrobe must be purchased');
  const next = closet.hangClothes(layout,'cape',owned,closetCatalog);
  assert.deepEqual(next.closet,['cape']); assert.deepEqual(layout.closet,[],'immutable transition');
  assert.deepEqual(closet.hangClothes(next,'cape',owned,closetCatalog).closet,['cape'],'no duplicate hangers');
  const inventory = closet.closetInventory(next,owned,closetCatalog);
  assert.deepEqual(inventory.hanging.map(i=>i.id),['cape']);
  assert.deepEqual(inventory.available.map(i=>i.id),['glasses']);
});
test('hanging undresses the pug and dressing moves the same garment from its hanger', () => {
  const layout = emptyRoom().layout.peach; layout.items.push(wardrobeItem);
  layout.outfit = [{id:'cape',x:.5,y:.5,scale:1.2,rotation:15,fitted:true}];
  const owned = ['yellow_wardrobe','cape'];
  const stored = closet.hangClothes(layout,'cape',owned,closetCatalog);
  assert.equal(stored.outfit.length,0);assert.deepEqual(stored.closet,['cape']);
  const dressed = closet.dressFromCloset(stored,'cape',owned,closetCatalog);
  assert.deepEqual(dressed.closet,[]);assert.equal(dressed.outfit.length,1);assert.equal(dressed.outfit[0].fitted,true);
  assert.equal(closet.dressFromCloset(dressed,'cape',owned,closetCatalog),dressed);
  assert.deepEqual(owned,['yellow_wardrobe','cape']);
});
test('closet contents survive saved room normalization and old snapshots migrate empty', () => {
  const data = emptyRoom();data.layout.peach.items.push(wardrobeItem);
  data.layout.peach.closet = ['cape','hw3','cape','ball','missing'];
  data.layout.peach.outfit = [{id:'hw3',x:.5,y:.5,scale:1,rotation:0,fitted:true}];
  const restored = normalizeRoom(JSON.parse(JSON.stringify(data)));
  assert.deepEqual(restored.layout.peach.closet,['cape']);assert.deepEqual(restored.layout.blue.closet,[]);
  const old = JSON.parse(JSON.stringify(restored));delete old.layout.peach.closet;
  assert.deepEqual(normalizeRoom(old).layout.peach.closet,[]);
});
test('wardrobe, cat friend and pendant have distinct room behavior and shop entries', () => {
  for (const [id,category,kind] of [['yellow_wardrobe','relax','storage'],['cat_friend','games','floor'],['ph5_pendant','relax','ceiling']]) {
    const product = ACCESSORIES.find(item=>item.id===id), item=closetCatalog.find(item=>item.id===id);
    assert.equal(product.category,category);assert.ok(product.active&&product.price>0);assert.equal(item.kind,kind);assert.ok(fs.existsSync(path.resolve(__dirname,'../public'+item.img)));
  }
  assert.equal(closetCatalog.find(item=>item.id==='ph5_pendant').anchorY,0);
});

const placement = load(path.resolve(__dirname, '../src/components/clay/room-placement.js'));
test('three wall shelves accept small objects, reject furniture and follow their support at different sizes', () => {
  const get = id => closetCatalog.find(item => item.id === id);
  for (const id of placement.shelfIds) {
    const shelf = get(id), support = {id,x:.4,y:.4,scale:1,rotation:0};
    assert.equal(shelf.kind,'shelf');
    assert.equal(placement.canMount(get('camera'),shelf),true);
    assert.equal(placement.canMount(get('vanilla_tealights'),shelf),true);
    for (const item of ['yellow_wardrobe','gm36','glasses',id,'cat_friend']) assert.equal(placement.canMount(get(item),shelf),false);
    for (const aspect of [1.15,1.5]) for (const width of [.3,.6]) {
      const at = placement.onSupport(support,shelf,width,aspect,{mountX:.2,mountY:0});
      assert.ok(Math.abs(at.x - (.4 + .2 * width)) < 1e-9);
      assert.ok(Math.abs(at.y - (.4 - width * aspect * (shelf.anchorY-shelf.surfaceY))) < 1e-9);
      const moved = placement.onSupport({...support,x:.6,y:.5},shelf,width,aspect,{mountX:.2});
      assert.ok(Math.abs(moved.x-at.x-.2)<1e-9 && Math.abs(moved.y-at.y-.1)<1e-9);
    }
  }
  assert.equal(placement.canMount(get('gm31'),get('gm36')),true);
  assert.equal(placement.canMount(get('gm31'),get('shelf_lack')),false,'oversized laptop stays on desk');
});
test('shelf relationships and both cupboard states persist, with safe detachment and camera migration', () => {
  const data = emptyRoom(), room = data.layout.peach;
  room.items = [{id:'shelf_lack',x:.4,y:.4,scale:1.2,rotation:0},
    {id:'camera',x:.5,y:.8,scale:1,rotation:0,parent:'shelf_lack',mountX:.2,mountY:0},
    {...wardrobeItem,open:false}];
  room.closet = ['cape'];
  assert.deepEqual(normalizeRoom(JSON.parse(JSON.stringify(data))),data);
  room.items[2].open=true;
  assert.equal(normalizeRoom(data).layout.peach.items[2].open,true);
  const detached = placement.detach(room.items[1],{x:.48,y:.34});
  assert.equal(detached.parent,undefined);assert.equal(detached.y,.59);assert.equal(room.items[1].parent,'shelf_lack');
  room.items = room.items.filter(item=>item.id!=='shelf_lack');
  assert.equal(normalizeRoom(data).layout.peach.items[0].parent,undefined,'removed shelf cannot leave a dangling relationship');
  room.items=[];
  room.outfit=[{id:'camera',x:.5,y:.5,scale:1,rotation:0,fitted:true}];
  const migrated=normalizeRoom(data).layout.peach;
  assert.equal(migrated.outfit.length,0);assert.equal(migrated.items[0].id,'camera');
  assert.equal(closetCatalog.find(item=>item.id==='camera').kind,'surface');
  assert.equal(ACCESSORIES.find(item=>item.id==='cat_friend').name,'Косая кошечка');
});
test('jump rope can be held in all poses and saved without becoming clothing in the wardrobe', () => {
  const rope=closetCatalog.find(item=>item.id==='jump_rope');
  assert.equal(rope.kind,'handheld');assert.equal(ACCESSORIES.find(item=>item.id==='jump_rope').category,'sport');
  for (const pose of ['stand','sit','sleep']) assert.equal(wearableFit(rope,pose).layer,'front');
  const data=emptyRoom();data.layout.blue.outfit=[{id:'jump_rope',x:.5,y:.5,scale:1,rotation:0,fitted:true}];
  assert.deepEqual(normalizeRoom(data),data);
  data.layout.blue.items.push(wardrobeItem);
  assert.equal(closet.hangClothes(data.layout.blue,'jump_rope',['jump_rope','yellow_wardrobe'],closetCatalog),data.layout.blue);
});
test('shelf placement uses free slots and refuses a fourth object instead of hiding it under another', () => {
  const placed=[];
  for (let n=0;n<3;n++) {const x=placement.freeShelfSlot(placed);assert.ok(Number.isFinite(x));assert.equal(placed.some(item=>item.mountX===x),false);placed.push({mountX:x});}
  assert.equal(placement.freeShelfSlot(placed),null);
  assert.equal(placement.freeShelfSlot([{mountX:-.2},{mountX:.2}]),0);
});
