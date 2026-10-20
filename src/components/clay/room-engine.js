import { roomPose, isSleepSeat } from './room-poses.js';

/** @param {HTMLElement} root @param {import('@/lib/room').RoomMountOptions} options */
export function mountRoom(root, options) {
    const controller = new AbortController();
    const listen = (target, type, handler) => target.addEventListener(type, handler, target instanceof HTMLElement && (target.matches('.room-object') || target.parentElement === tray) ? undefined : { signal: controller.signal });
    const stage = root.querySelector('.room-stage'), scene = root.querySelector('.room-scene'), actor = root.querySelector('.room-actor'), outfit = root.querySelector('.room-outfit'), tray = root.querySelector('.room-inventory'), edit = root.querySelector('.room-edit');
    const { catalog, rooms } = options;
    const byId = new Map(catalog.map(x => [x.id, x]));
    const oldIds = { hw_witch_hat: 'hw1', hw_bat_glasses: 'hw2', hw_vampire_cape: 'hw3', hw_bat_bow: 'hw4', hw_candy_bucket: 'hw5', hw_cauldron: 'hw6', hw_broom: 'hw7', hw_jack: 'hw8', hw_ghost: 'hw9', hw_pumpkin_bed: 'hw10', wizard: 'cape' };
    const normalize = ids => Array.isArray(ids) ? [...new Set(ids.filter(x => typeof x === 'string').map(x => oldIds[x] || x).filter(x => byId.has(x)))] : [];
    let owned = normalize(options.owned), room = 'peach', selected = null, drag = null, lastEmitted = null;
    const fresh = () => ({ items: [], pug: { x: .52, y: .86, scale: 1, seat: null }, outfit: [] });
    let layout = { peach: fresh(), blue: fresh(), sage: fresh() };
    function restore(saved) { if (!saved || typeof saved !== 'object')
        return; for (const name of Object.keys(rooms)) {
        const v = saved.layout?.[name];
        if (!v)
            continue;
        const valid = o => o && byId.has(o.id) && Number.isFinite(o.x) && Number.isFinite(o.y) && Number.isFinite(o.scale) && Number.isFinite(o.rotation);
        layout[name] = { items: Array.isArray(v.items) ? v.items.filter(valid).slice(0, catalog.length) : [], outfit: Array.isArray(v.outfit) ? v.outfit.filter(valid).slice(0, catalog.length) : [], pug: { x: clamp(v.pug?.x, .05, .95, .52), y: clamp(v.pug?.y, .58, .97, .86), scale: clamp(v.pug?.scale, .5, 1.8, 1), seat: typeof v.pug?.seat === 'string' ? v.pug.seat : null } };
    } if (rooms[saved.room])
        room = saved.room; }
    function clamp(n, a, b, f = a) { return Number.isFinite(n) ? Math.max(a, Math.min(b, n)) : f; }
    restore(options.saved);
    function state() { return { version: 1, updatedAt: Date.now(), room, layout }; }
    // Each room has its own pose and free clothing placement.
    function save() { lastEmitted = structuredClone(state()); options.onChange(lastEmitted); }
    function current() { return layout[room]; }
    function permitted() { return new Set(owned); }
    function clean() { for (const v of Object.values(layout)) {
        v.items = v.items.filter(o => byId.has(o.id) && byId.get(o.id).kind !== 'wear');
        v.outfit = v.outfit.filter(o => byId.has(o.id) && byId.get(o.id).kind === 'wear');
        if (!v.items.some(o => o.id === v.pug.seat && byId.get(o.id)?.kind === 'seat'))
            v.pug.seat = null;
    } }
    function depth(y) { return .68 + (y - .58) * 1.2; }
    function find() { if (selected !== 'pug' && !permitted().has(selected))
        return null; return selected === 'pug' ? current().pug : [...current().items, ...current().outfit].find(o => o.id === selected); }
    function parentOf(o) { return o.parent ? current().items.find(p => p.id === o.parent && p.id !== o.id && permitted().has(p.id)) : null; }
    function itemWidth(o) { const item = byId.get(o.id), parent = parentOf(o); return item.size * o.scale * (item.kind === 'wall' ? 1 : depth(parent ? parent.y : o.y)) * (parent ? parent.scale : 1); }
    function coordinates(o) { const p = parentOf(o); return p ? { x: p.x + (o.mountX || 0) * itemWidth(p), y: p.y - itemWidth(p) * stage.clientWidth / stage.clientHeight * (.60 - (o.mountY || 0)) } : { x: o.x, y: o.y }; }
    function say(text) { root.querySelector('#room-status').textContent = text; }
    function select(id) { selected = id; updateEdit(); renderObjects(); }
    function updateEdit() { const o = find(), item = byId.get(selected); edit.hidden = !o; if (!o)
        return; root.querySelector('#room-selected').textContent = selected === 'pug' ? 'Флопс' : item.name; root.querySelector('.room-depth-label').hidden = item?.kind === 'wear' || item?.kind === 'wall' || !!parentOf(o); root.querySelector('#room-seat').hidden = !((item?.kind === 'seat') || (selected === 'pug' && current().pug.seat)); root.querySelector('#room-seat').textContent = current().pug.seat === selected || selected === 'pug' ? 'Встать' : isSleepSeat(selected) ? 'Лечь' : 'Сесть'; root.querySelector('#room-surface').hidden = !(item?.kind === 'surface' && current().items.some(p => p.id === 'gm36' && permitted().has(p.id))); root.querySelector('#room-surface').textContent = o.parent ? 'На пол' : 'На стол'; root.querySelector('#room-remove').hidden = selected === 'pug'; root.querySelector('#room-rotate').hidden = selected === 'pug' || (item?.kind === 'seat' || selected === 'gm36'); const choices = [.64, .78, .92]; root.querySelector('#room-depth').value = String(choices.reduce((a, b) => Math.abs(b - o.y) < Math.abs(a - o.y) ? b : a)); }
    function positionPug() {
        const p = current().pug, seat = current().items.find(o => o.id === p.seat && permitted().has(o.id));
        let x = p.x, y = p.y, w = .28 * p.scale * depth(y);
        if (seat) {
            const sw = itemWidth(seat);
            x = seat.x;
            y = seat.y - sw * stage.clientWidth / stage.clientHeight * (seat.id === 'sleep_bed' ? .15 : seat.id === 'hw10' ? .16 : seat.id === 'gm38' ? .30 : .28);
            const baseWidth = sw * (seat.id === 'gm38' ? .70 : .83);
            w = baseWidth * p.scale;
            y += (w - baseWidth) * .074 * stage.clientWidth / stage.clientHeight;
        }
        actor.style.left = x * 100 + '%';
        actor.style.top = y * 100 + '%';
        actor.style.width = w * 100 + '%';
        actor.style.zIndex = String(Math.round((seat ? seat.y : y) * 10000) + 1);
        actor.dataset.selected = String(selected === 'pug');
        actor.dataset.seated = String(!!seat);
    }
    function styleObject(b, o, wear) { const item = byId.get(o.id); b.setAttribute('aria-pressed', String(selected === o.id)); const at = wear ? o : coordinates(o); b.style.left = at.x * 100 + '%'; b.style.top = at.y * 100 + '%'; b.style.width = (wear ? o.scale * item.size : itemWidth(o)) * 100 + '%'; b.style.transform = (wear ? 'translate(-50%,-50%)' : 'translate(-50%,-100%)') + ' rotate(' + o.rotation + 'deg)'; b.style.zIndex = String(wear ? 10 : item.kind === 'wall' ? 1 : Math.round((parentOf(o)?.y ?? o.y) * 10000) + (parentOf(o) ? 5 : 0)); }
    function objectButton(o, wear) { const item = byId.get(o.id), b = document.createElement('button'); b.type = 'button'; b.className = 'room-object'; b.dataset.id = o.id; b.setAttribute('aria-label', item.name); b.setAttribute('aria-pressed', String(selected === o.id)); const img = document.createElement('img'); img.src = item.img; img.alt = ''; img.draggable = false; b.append(img); styleObject(b, o, wear); listen(b, 'pointerdown', e => begin(e, o.id, wear)); listen(b, 'click', () => select(o.id)); listen(b, 'keydown', e => moveKey(e, o.id)); return b; }
    function renderObjects() {
        const v = current(), allow = permitted(), placed = v.items.filter(o => allow.has(o.id)), worn = v.outfit.filter(o => allow.has(o.id)), floorIds = new Set(placed.map(o => o.id)), wearIds = new Set(worn.map(o => o.id));
        for (const node of scene.querySelectorAll('.room-object'))
            if (!floorIds.has(node.dataset.id))
                node.remove();
        for (const node of outfit.querySelectorAll('.room-object'))
            if (!wearIds.has(node.dataset.id))
                node.remove();
        scene.querySelectorAll('.room-front').forEach(node => node.remove());
        for (const o of placed) {
            let button = scene.querySelector(`[data-id="${o.id}"]`);
            if (!button) {
                button = objectButton(o, false);
                scene.append(button);
            }
            styleObject(button, o, false);
            if (v.pug.seat === o.id) {
                const front = document.createElement('div');
                front.className = 'room-front';
                if (isSleepSeat(o.id)) front.style.clipPath = o.id === 'sleep_bed' ? 'inset(81% 0 0 0)' : 'inset(80% 0 0 0)';
                front.style.left = o.x * 100 + '%';
                front.style.top = o.y * 100 + '%';
                front.style.width = itemWidth(o) * 100 + '%';
                front.style.zIndex = String(Math.round(o.y * 10000) + 2);
                const img = document.createElement('img');
                img.src = byId.get(o.id).img;
                img.alt = '';
                front.append(img);
                scene.append(front);
            }
        }
        for (const o of worn) {
            let button = outfit.querySelector(`[data-id="${o.id}"]`);
            if (!button) {
                button = objectButton(o, true);
                outfit.append(button);
            }
            styleObject(button, o, true);
        }
        positionPug();
    }
    function renderTray() { tray.replaceChildren(); const used = new Set([...current().items, ...current().outfit].map(o => o.id)); for (const id of owned) {
        const item = byId.get(id), b = document.createElement('button');
        b.type = 'button';
        b.dataset.owned = id;
        b.disabled = used.has(id);
        const img = document.createElement('img');
        img.src = item.img;
        img.alt = '';
        img.draggable = false;
        const span = document.createElement('span');
        span.textContent = item.name;
        b.append(img, span);
        listen(b, 'click', () => add(id));
        tray.append(b);
    } root.querySelector('.room-empty').hidden = owned.length > 0; }
    function render() { const image = root.querySelector('.kids-mascot-fallback'); const seat = current().items.find(o => o.id === current().pug.seat && permitted().has(o.id)); const pose = roomPose(room, seat?.id || null); image.src = '/assets/clay/room-pug-' + pose + '.webp'; image.dataset.pose = pose; stage.style.backgroundImage = `url('${rooms[room]}')`; root.dataset.room = room; root.querySelectorAll('[data-room]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.room === room))); renderObjects(); renderTray(); updateEdit(); }
    function add(id) { if (!permitted().has(id))
        return; const item = byId.get(id), list = item.kind === 'wear' ? current().outfit : current().items; if (list.some(o => o.id === id))
        return; list.push({ id, x: item.kind === 'wear' ? (item.wearX ?? .5) : .34, y: item.kind === 'wear' ? (item.wearY ?? .32) : item.kind === 'wall' ? .46 : .81, scale: 1, rotation: item.wearRotation ?? 0 }); selected = id; render(); save(); say(item.name + ' — ' + (item.kind === 'wear' ? 'на Флопсе' : 'в комнате')); }
    function releasePug() { const o = current().pug; if (!o.seat)
        return; const a = actor.getBoundingClientRect(), s = stage.getBoundingClientRect(); o.x = (a.left + a.width / 2 - s.left) / s.width; o.y = clamp((a.bottom - s.top) / s.height, .59, .97); o.scale = clamp(a.width / s.width / (.28 * depth(o.y)), .4, 2); o.seat = null; }
    function begin(e, id, wear = false) { if (e.button !== 0)
        return; e.preventDefault(); e.stopPropagation(); selected = id; const o = find(); if (!o)
        return; const rect = (wear ? actor : stage).getBoundingClientRect(); drag = { id, wear, startX: e.clientX, startY: e.clientY, x: o.x, y: o.y, rect, pointer: e.pointerId, parent: parentOf(o), mountX: o.mountX || 0, mountY: o.mountY || 0 }; stage.setPointerCapture(e.pointerId); updateEdit(); renderObjects(); }
    listen(stage, 'pointermove', e => { if (!drag || e.pointerId !== drag.pointer)
        return; const o = find(); if (!o)
        return; if (drag.id === 'pug' && o.seat) {
        if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 3)
            return;
        releasePug();
        drag.x = o.x;
        drag.y = o.y;
    } const wall = byId.get(drag.id)?.kind === 'wall'; const dx = (e.clientX - drag.startX) / drag.rect.width, dy = (e.clientY - drag.startY) / drag.rect.height; if (drag.parent) {
        o.mountX = clamp(drag.mountX + dx / itemWidth(drag.parent), -.45, .45);
        o.mountY = clamp(drag.mountY + dy / (itemWidth(drag.parent) * stage.clientWidth / stage.clientHeight), -.20, .22);
        renderObjects();
        return;
    } o.x = clamp(drag.x + dx, drag.wear ? -.1 : .06, drag.wear ? 1.1 : .94); o.y = clamp(drag.y + dy, drag.wear ? -.1 : wall ? .2 : .59, drag.wear ? 1.1 : wall ? .66 : .97); renderObjects(); });
    function end(e) { if (!drag || e.pointerId !== drag.pointer)
        return; drag = null; if (stage.hasPointerCapture(e.pointerId))
        stage.releasePointerCapture(e.pointerId); updateEdit(); save(); }
    listen(stage, 'pointerup', end);
    listen(stage, 'pointercancel', end);
    listen(actor.querySelector('.kids-mascot'), 'pointerdown', e => begin(e, 'pug'));
    listen(actor.querySelector('.kids-mascot'), 'click', () => select('pug'));
    listen(actor.querySelector('.kids-mascot'), 'keydown', e => moveKey(e, 'pug'));
    function moveKey(e, id) { const directions = { ArrowLeft: [-.02, 0], ArrowRight: [.02, 0], ArrowUp: [0, -.02], ArrowDown: [0, .02] }; if (!directions[e.key])
        return; e.preventDefault(); selected = id; const o = find(); if (!o)
        return; if (id === 'pug')
        releasePug(); const wear = byId.get(id)?.kind === 'wear', wall = byId.get(id)?.kind === 'wall'; if (parentOf(o)) {
        o.mountX = clamp((o.mountX || 0) + directions[e.key][0], -.45, .45);
        o.mountY = clamp((o.mountY || 0) + directions[e.key][1], -.20, .22);
        render();
        save();
        root.querySelector(`[data-id="${id}"]`)?.focus();
        return;
    } o.x = clamp(o.x + directions[e.key][0], wear ? -.1 : .06, wear ? 1.1 : .94); o.y = clamp(o.y + directions[e.key][1], wear ? -.1 : wall ? .2 : .59, wear ? 1.1 : wall ? .66 : .97); if (id === 'pug')
        o.seat = null; render(); save(); root.querySelector(id === 'pug' ? '.kids-mascot' : `[data-id="${id}"]`)?.focus(); }
    root.querySelectorAll('[data-room]').forEach(b => listen(b, 'click', () => { room = b.dataset.room; selected = null; root.dispatchEvent(new CustomEvent('kids:pose', { detail: 'sit' })); render(); save(); }));
    listen(root.querySelector('#room-depth'), 'change', e => { const o = find(); if (!o || ['wear', 'wall'].includes(byId.get(selected)?.kind))
        return; if (selected === 'pug')
        releasePug(); o.y = Number(e.target.value); if (selected === 'pug')
        o.seat = null; renderObjects(); save(); });
    for (const [id, factor] of [['room-smaller', .9], ['room-larger', 1.1]])
        listen(root.querySelector('#' + id), 'click', () => { const o = find(); if (o) {
            o.scale = clamp(o.scale * factor, .4, 2);
            renderObjects();
            save();
        } });
    listen(root.querySelector('#room-rotate'), 'click', () => { const o = find(); if (o && selected !== 'pug' && selected !== 'gm36') {
        o.rotation = (o.rotation + 15) % 360;
        renderObjects();
        save();
    } });
    listen(root.querySelector('#room-remove'), 'click', () => { if (!selected || selected === 'pug')
        return; const v = current(); for (const o of v.items)
        if (o.parent === selected) {
            const p = parentOf(o);
            o.x = p ? p.x : .5;
            o.y = p ? p.y : .8;
            delete o.parent;
        } v.items = v.items.filter(o => o.id !== selected); v.outfit = v.outfit.filter(o => o.id !== selected); if (v.pug.seat === selected)
        v.pug.seat = null; selected = null; render(); save(); });
    listen(root.querySelector('#room-seat'), 'click', () => { const p = current().pug; if (selected === 'pug' || p.seat === selected) {
        const old = current().items.find(o => o.id === p.seat);
        if (old) {
            p.x = clamp(old.x + .2, .1, .9);
            p.y = old.y;
        }
        p.seat = null;
    }
    else if (byId.get(selected)?.kind === 'seat') {
        p.seat = selected;
        root.dispatchEvent(new CustomEvent('kids:pose', { detail: 'sit' }));
    } render(); save(); say(p.seat ? (isSleepSeat(p.seat) ? 'Флопс лёг' : 'Флопс сидит') : 'Флопс встал'); });
    listen(root.querySelector('#room-surface'), 'click', () => { const o = find(), desk = current().items.find(p => p.id === 'gm36' && permitted().has(p.id)); if (!o || !desk || byId.get(o.id)?.kind !== 'surface')
        return; if (o.parent) {
        o.x = desk.x;
        o.y = desk.y;
        delete o.parent;
    }
    else {
        o.parent = desk.id;
        o.mountX = 0;
        o.mountY = 0;
    } render(); save(); });
    const observer = new ResizeObserver(positionPug);
    observer.observe(stage);
    clean();
    render();
    return {
        updateOwned(ids) { owned = normalize(ids); if (selected !== 'pug' && !permitted().has(selected))
            selected = null; clean(); render(); },
        updateSaved(saved) { if (saved?.updatedAt === lastEmitted?.updatedAt)
            return; restore(saved); clean(); selected = null; render(); },
        destroy() { controller.abort(); observer.disconnect(); scene.replaceChildren(); outfit.replaceChildren(); tray.replaceChildren(); }
    };
}
