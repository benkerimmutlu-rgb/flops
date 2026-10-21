import { toggleSynthMelody, stopSynthMelody, subscribeSynth, isSynthPlaying } from './synth-melody.js';
import { hourglassSand } from './hourglass.js';
import { onSupport, deskCorner, canMount, detach, freeShelfSlot } from './room-placement.js';
import { roomPose, isSleepSeat } from './room-poses.js';
import { wearableFit, wearGroup, fitOutfit } from './wardrobe.js';
import { WARDROBE_ID, hasWardrobe, closetInventory, hangClothes, dressFromCloset } from './room-closet.js';
import { roomIcon, posePicture } from './room-icons.js';

/** @param {HTMLElement} root @param {import('@/lib/room').RoomMountOptions} options */
export function mountRoom(root, options) {
    const controller = new AbortController();
    const listen = (target, type, handler) => target.addEventListener(type, handler, target instanceof HTMLElement && (target.matches('.room-object') || target.parentElement === tray) ? undefined : { signal: controller.signal });
    const stage = root.querySelector('.room-stage'), scene = root.querySelector('.room-scene'), actor = root.querySelector('.room-actor'), outfit = root.querySelector('.room-outfit'), backOutfit = root.querySelector('.room-outfit-back'), headOutfit = root.querySelector('.room-outfit-head'), tray = root.querySelector('.room-inventory'), edit = root.querySelector('.room-edit');
    const { catalog, rooms } = options;
    const closet = root.querySelector('.room-closet'), surfaces = root.querySelector('.room-surfaces');
    let ignoreSynthClickUntil = 0;
    const unsubscribeSynth = subscribeSynth(() => { root.dataset.synthPlaying = String(isSynthPlaying()); });
    async function playSynth() {
        if (performance.now() < ignoreSynthClickUntil) return;
        try { say(await toggleSynthMelody() ? 'Флопс играет мелодию' : 'Мелодия остановлена'); }
        catch { say('Нажми на синтезатор ещё раз, чтобы включить звук'); }
    }
    const byId = new Map(catalog.map(x => [x.id, x]));
    const oldIds = { hw_witch_hat: 'hw1', hw_bat_glasses: 'hw2', hw_vampire_cape: 'hw3', hw_bat_bow: 'hw4', hw_candy_bucket: 'hw5', hw_cauldron: 'hw6', hw_broom: 'hw7', hw_jack: 'hw8', hw_ghost: 'hw9', hw_pumpkin_bed: 'hw10', wizard: 'cape' };
    const normalize = ids => Array.isArray(ids) ? [...new Set(ids.filter(x => typeof x === 'string').map(x => oldIds[x] || x).filter(x => byId.has(x)))] : [];
    let owned = normalize(options.owned), room = 'peach', selected = null, drag = null, lastEmitted = null;
    const fresh = () => ({ items: [], pug: { x: .52, y: .86, scale: 1, seat: null }, outfit: [], closet: [] });
    let layout = { peach: fresh(), blue: fresh(), sage: fresh() };
    function restore(saved) { if (!saved || typeof saved !== 'object')
        return; for (const name of Object.keys(rooms)) {
        const v = saved.layout?.[name];
        if (!v)
            continue;
        const valid = o => o && byId.has(o.id) && Number.isFinite(o.x) && Number.isFinite(o.y) && Number.isFinite(o.scale) && Number.isFinite(o.rotation);
        layout[name] = { closet: normalize(v.closet), items: Array.isArray(v.items) ? v.items.filter(valid).slice(0, catalog.length) : [], outfit: Array.isArray(v.outfit) ? v.outfit.filter(valid).slice(0, catalog.length) : [], pug: { x: clamp(v.pug?.x, .05, .95, .52), y: clamp(v.pug?.y, .58, .97, .86), scale: clamp(v.pug?.scale, .5, 1.8, 1), seat: typeof v.pug?.seat === 'string' ? v.pug.seat : null } };
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
        for (const o of v.outfit) if (o.id === 'camera' && !v.items.some(item => item.id === o.id)) v.items.push({ id: o.id, x: .55, y: .81, scale: 1, rotation: 0 });
        for (const o of v.items) if (byId.get(o.id)?.kind === 'wear' && !v.outfit.some(w => w.id === o.id)) v.outfit.push({ id: o.id, x: .5, y: .5, scale: 1, rotation: 0, fitted: true });
        v.items = v.items.filter(o => byId.has(o.id) && byId.get(o.id).kind !== 'wear');
        v.outfit = v.outfit.filter(o => byId.has(o.id) && ['wear', 'handheld'].includes(byId.get(o.id).kind));
        for (const o of v.items) if (o.parent && !v.items.some(p => p.id === o.parent && canMount(byId.get(o.id), byId.get(p.id)))) { delete o.parent; delete o.mountX; delete o.mountY; o.y = clamp(o.y, .59, .97); }
        v.closet = normalize(v.closet).filter(id => byId.get(id).kind === 'wear' && !v.outfit.some(o => o.id === id));
        if (!v.items.some(o => o.id === v.pug.seat && byId.get(o.id)?.kind === 'seat'))
            v.pug.seat = null;
    } }
    function depth(y) { return .68 + (y - .58) * 1.2; }
    function find() { if (selected !== 'pug' && !permitted().has(selected))
        return null; return selected === 'pug' ? current().pug : [...current().items, ...current().outfit].find(o => o.id === selected); }
    function parentOf(o) { return o.parent ? current().items.find(p => p.id === o.parent && p.id !== o.id && permitted().has(p.id) && canMount(byId.get(o.id), byId.get(p.id))) : null; }
    function itemWidth(o) { const item = byId.get(o.id), parent = parentOf(o); const width = item.size * o.scale * (['wall', 'ceiling', 'shelf'].includes(item.kind) ? 1 : parent && byId.get(parent.id).kind === 'shelf' ? .85 : depth(parent ? parent.y : o.y)) * (parent ? parent.scale : 1); return parent && byId.get(parent.id).kind === 'shelf' ? Math.min(width, itemWidth(parent) * .38) : width; }
    function coordinates(o) { const p = parentOf(o); return p ? onSupport(p, byId.get(p.id), itemWidth(p), stage.clientWidth / stage.clientHeight, o) : { x: o.x, y: o.y }; }
    function say(text) { root.querySelector('#room-status').textContent = text; }
    function select(id) { selected = id; updateEdit(); renderObjects(); }
    function action(id, label, picture) { const button = root.querySelector('#' + id); button.setAttribute('aria-label', label); button.title = label; button.innerHTML = picture; }
    function currentPose() { const seat = current().items.find(o => o.id === current().pug.seat && permitted().has(o.id)); return roomPose(room, seat?.id || null); }
    function updateEdit() {
        const o = find(), item = byId.get(selected); edit.hidden = !o; if (!o) return;
        root.querySelector('#room-selected').textContent = selected === 'pug' ? 'Флопс' : item.name;
        root.querySelector('#room-selected-image').src = selected === 'pug' ? '/assets/clay/room-pug-' + currentPose() + '.webp' : item.img;
        root.querySelector('.room-depth-label').hidden = current().outfit.includes(o) || ['wall', 'ceiling', 'shelf'].includes(item?.kind) || !!parentOf(o);
        const nearest = [.64, .78, .92].reduce((a, b) => Math.abs(b - o.y) < Math.abs(a - o.y) ? b : a);
        root.querySelectorAll('[data-depth]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.depth) === nearest)));
        root.querySelectorAll('[data-corner]').forEach(b => b.hidden = selected !== 'gm36');
        const gettingUp = current().pug.seat === selected || selected === 'pug';
        root.querySelector('#room-seat').hidden = !(item?.kind === 'seat' || (selected === 'pug' && current().pug.seat));
        action('room-seat', gettingUp ? 'Встать' : isSleepSeat(selected) ? 'Лечь' : 'Сесть', posePicture(gettingUp ? 'stand' : isSleepSeat(selected) ? 'sleep' : 'sit', gettingUp ? 'up' : 'down'));
        root.querySelector('#room-surface').hidden = !(current().items.includes(o) && supports(o).length);
        action('room-surface', o.parent ? 'Снять с мебели' : 'Поставить на стол или полку', roomIcon(o.parent ? 'down' : 'surface'));
        root.querySelector('#room-wardrobe-toggle').hidden = selected !== WARDROBE_ID;
        action('room-wardrobe-toggle', o.open === false ? 'Открыть дверцы шкафа' : 'Закрыть дверцы шкафа', roomIcon(o.open === false ? 'closetOpen' : 'closet'));
        root.querySelector('#room-hold').hidden = item?.kind !== 'handheld';
        action('room-hold', current().outfit.includes(o) ? 'Положить скакалку' : 'Взять скакалку в лапы', posePicture(currentPose(), current().outfit.includes(o) ? 'down' : 'up'));
        root.querySelector('#room-closet-open').hidden = selected !== WARDROBE_ID;
        root.querySelector('#room-hang').hidden = item?.kind !== 'wear' || !hasWardrobe(current(), owned);
        root.querySelector('#room-wear').hidden = item?.kind !== 'wear';
        action('room-wear', wearGroup(selected) === 'blanket' ? 'Укрыть' : 'Надеть', roomIcon(wearGroup(selected) === 'blanket' ? 'cover' : 'wear'));
        root.querySelector('#room-remove').hidden = selected === 'pug';
        action('room-remove', item?.kind === 'wear' ? 'Снять' : 'Убрать в коллекцию', roomIcon('remove'));
        root.querySelector('#room-rotate').hidden = selected === 'pug' || item?.kind === 'seat' || item?.kind === 'storage' || item?.kind === 'shelf' || selected === 'gm36';
    }
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
    function wearPieces(parts) { return parts.map(p => { const img = document.createElement('img'); img.src = p.img; img.alt = ''; img.draggable = false; img.className = 'room-wear-piece'; img.style.left = p.x * 100 + '%'; img.style.top = p.y * 100 + '%'; img.style.width = p.size * 100 + '%'; img.style.transform = `translate(-50%,-50%) rotate(${p.rotation}deg) scaleX(${p.mirror ? -1 : 1})`; return img; }); }
    function wearTransform(node, o) { node.style.left = o.x * 100 + '%'; node.style.top = o.y * 100 + '%'; node.style.width = o.scale * 100 + '%'; node.style.transform = `translate(-50%,-50%) rotate(${o.rotation}deg)`; }
    function styleWear(b, o) {
        const fit = wearableFit(byId.get(o.id), currentPose());
        const target = fit.layer === 'back' ? backOutfit : fit.layer === 'head' ? headOutfit : outfit;
        if (b.parentElement !== target) target.append(b);
        b.classList.add('room-fitted'); b.setAttribute('aria-pressed', String(selected === o.id));
        wearTransform(b, o); b.replaceChildren(...wearPieces(fit.parts));
        let front = outfit.querySelector(`[data-wear-front="${o.id}"]`);
        if (fit.frontParts) {
            if (!front) { front = document.createElement('div'); front.className = 'room-wear-front'; front.dataset.wearFront = o.id; front.setAttribute('aria-hidden', 'true'); outfit.append(front); }
            wearTransform(front, o); front.replaceChildren(...wearPieces(fit.frontParts));
        } else front?.remove();
    }
    function styleObject(b, o, wear) { const item = byId.get(o.id); if (wear && o.fitted) { styleWear(b, o); return; } outfit.querySelector(`[data-wear-front="${o.id}"]`)?.remove(); if (wear && b.parentElement !== headOutfit) headOutfit.append(b); b.classList.remove('room-fitted'); b.setAttribute('aria-pressed', String(selected === o.id)); const at = wear ? o : coordinates(o); b.style.left = at.x * 100 + '%'; b.style.top = at.y * 100 + '%'; b.style.width = (wear ? o.scale * item.size : itemWidth(o)) * 100 + '%'; b.style.transform = (wear ? 'translate(-50%,-50%)' : `translate(-50%,-${(item.anchorY ?? 1) * 100}%)`) + ' rotate(' + o.rotation + 'deg)'; b.style.zIndex = String(wear ? 10 : ['wall', 'ceiling', 'shelf'].includes(item.kind) ? 1 : parentOf(o) && byId.get(parentOf(o).id).kind === 'shelf' ? 2 : Math.round((parentOf(o)?.y ?? o.y) * 10000) + (parentOf(o) ? 5 : 0)); }
    function objectButton(o, wear) { const item = byId.get(o.id), b = document.createElement('button'); b.type = 'button'; b.className = 'room-object'; b.dataset.id = o.id; b.dataset.kind = item.kind; if (item.kind === 'shelf') { b.style.clipPath = `inset(${(item.surfaceY - .1) * 100}% 0 ${(1 - item.anchorY - .05) * 100}% 0)`; b.style.setProperty('--shelf-top', (item.surfaceY - .1) * 100 + '%'); b.style.setProperty('--shelf-bottom', (1 - item.anchorY - .05) * 100 + '%'); } b.setAttribute('aria-label', item.name); b.setAttribute('aria-pressed', String(selected === o.id)); const img = document.createElement('img'); img.src = item.img; img.alt = ''; img.draggable = false; if (o.id === 'hourglass') { const clock = document.createElement('span'); clock.className = 'clay-hourglass'; clock.append(img); clock.insertAdjacentHTML('beforeend', hourglassSand()); b.append(clock); } else b.append(img); styleObject(b, o, wear); listen(b, 'pointerdown', e => begin(e, o.id, wear)); listen(b, 'click', e => { select(o.id); if (o.id === 'synthesizer' && e.detail === 0) void playSynth(); if (o.id === WARDROBE_ID && e.detail === 0) toggleWardrobe(); }); listen(b, 'keydown', e => moveKey(e, o.id)); return b; }
    function renderObjects() {
        const pose = currentPose(), image = root.querySelector('.kids-mascot-fallback'), face = root.querySelector('.room-face-occlusion');
        image.src = '/assets/clay/room-pug-' + pose + '.webp'; image.dataset.pose = pose; face.src = image.src; actor.dataset.pose = pose;
        const v = current(), allow = permitted(), placed = v.items.filter(o => allow.has(o.id)), worn = v.outfit.filter(o => allow.has(o.id)), floorIds = new Set(placed.map(o => o.id)), wearIds = new Set(worn.map(o => o.id));
        for (const node of scene.querySelectorAll('.room-object'))
            if (!floorIds.has(node.dataset.id))
                node.remove();
        for (const node of actor.querySelectorAll('.room-object'))
            if (!wearIds.has(node.dataset.id))
                node.remove();
        outfit.querySelectorAll('[data-wear-front]').forEach(node => { if (!wearIds.has(node.dataset.wearFront)) node.remove(); });
        scene.querySelectorAll('.room-front').forEach(node => node.remove());
        for (const o of placed) {
            let button = scene.querySelector(`[data-id="${o.id}"]`);
            if (!button) {
                button = objectButton(o, false);
                scene.append(button);
            }
            styleObject(button, o, false);
            if (o.id === WARDROBE_ID) {
                button.setAttribute('aria-expanded', String(o.open !== false));
                button.querySelector(':scope > img').src = o.open === false ? byId.get(o.id).closedImg : byId.get(o.id).img;
                button.querySelector('.room-closet-preview')?.remove();
                const preview = document.createElement('span'); preview.className = 'room-closet-preview'; preview.setAttribute('aria-hidden', 'true');
                for (const item of closetInventory(v, owned, catalog).hanging.slice(0, 2)) { const img = document.createElement('img'); img.src = item.img; img.alt = ''; preview.append(img); }
                if (o.open !== false) button.append(preview);
            }
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
            let button = actor.querySelector(`[data-id="${o.id}"]`);
            if (!button) {
                button = objectButton(o, true);
                if (!button.parentElement) headOutfit.append(button);
            }
            styleObject(button, o, true);
        }
        positionPug();
    }
    function renderTray() { tray.replaceChildren(); const used = new Set([...current().items, ...current().outfit].map(o => o.id)); for (const id of owned) {
        if (hasWardrobe(current(), owned) && current().closet.includes(id)) continue;
        const item = byId.get(id), b = document.createElement('button');
        b.type = 'button';
        b.dataset.owned = id;
        b.setAttribute('aria-pressed', String(used.has(id)));
        b.classList.toggle('room-in-use', used.has(id));
        const img = document.createElement('img');
        img.src = item.img;
        img.alt = '';
        img.draggable = false;
        const span = document.createElement('span');
        span.textContent = item.name;
        b.append(img, span);
        listen(b, 'click', () => used.has(id) ? select(id) : add(id));
        tray.append(b);
    } root.querySelector('.room-empty').hidden = owned.length > 0; }
    function render() { const image = root.querySelector('.kids-mascot-fallback'); const seat = current().items.find(o => o.id === current().pug.seat && permitted().has(o.id)); const pose = roomPose(room, seat?.id || null); image.src = '/assets/clay/room-pug-' + pose + '.webp'; image.dataset.pose = pose; stage.style.backgroundImage = `url('${rooms[room]}')`; root.dataset.room = room; root.querySelectorAll('[data-room]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.room === room))); renderObjects(); renderTray(); updateEdit(); renderCloset(); }
    function add(id) { if (!permitted().has(id))
        return; const item = byId.get(id), list = item.kind === 'wear' ? current().outfit : current().items; if (list.some(o => o.id === id))
        return; if (item.kind === 'wear') current().closet = current().closet.filter(code => code !== id); list.push({ id, x: item.kind === 'wear' ? (item.wearX ?? .5) : .34, y: item.kind === 'wear' ? (item.wearY ?? .32) : item.kind === 'ceiling' ? .02 : ['wall', 'shelf'].includes(item.kind) ? .46 : .81, scale: 1, rotation: item.wearRotation ?? 0, ...(item.kind === 'wear' ? { x: .5, y: .5, rotation: 0, fitted: true } : {}) }); if (item.kind === 'wear') current().outfit = fitOutfit(current().outfit, id); selected = id; render(); save(); say(item.name + ' — ' + (item.kind === 'wear' ? 'на Флопсе' : 'в комнате')); }
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
    } const wall = ['wall', 'shelf'].includes(byId.get(drag.id)?.kind), ceiling = byId.get(drag.id)?.kind === 'ceiling'; const dx = (e.clientX - drag.startX) / drag.rect.width, dy = (e.clientY - drag.startY) / drag.rect.height; if (drag.parent) {
        o.mountX = clamp(drag.mountX + dx / itemWidth(drag.parent), -.28, .28);
        o.mountY = clamp(drag.mountY + dy / (itemWidth(drag.parent) * stage.clientWidth / stage.clientHeight), -.08, .08);
        renderObjects();
        return;
    } o.x = clamp(drag.x + dx, drag.wear ? -.1 : .06, drag.wear ? 1.1 : .94); o.y = clamp(drag.y + dy, drag.wear ? -.1 : ceiling ? 0 : wall ? .2 : .59, drag.wear ? 1.1 : ceiling ? .3 : wall ? .66 : .97); renderObjects(); });
    function end(e) { if (!drag || e.pointerId !== drag.pointer)
        return; if (drag.id === 'synthesizer') { if (e.type === 'pointercancel' || Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 5) ignoreSynthClickUntil = performance.now() + 350; else void playSynth(); } const openWardrobe = drag.id === WARDROBE_ID && e.type !== 'pointercancel' && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 5; drag = null; if (stage.hasPointerCapture(e.pointerId))
        stage.releasePointerCapture(e.pointerId); updateEdit(); save(); if (openWardrobe) toggleWardrobe(); }
    listen(stage, 'pointerup', end);
    listen(stage, 'pointercancel', end);
    listen(actor.querySelector('.kids-mascot'), 'pointerdown', e => begin(e, 'pug'));
    listen(actor.querySelector('.kids-mascot'), 'click', () => select('pug'));
    listen(actor.querySelector('.kids-mascot'), 'keydown', e => moveKey(e, 'pug'));
    function moveKey(e, id) { const directions = { ArrowLeft: [-.02, 0], ArrowRight: [.02, 0], ArrowUp: [0, -.02], ArrowDown: [0, .02] }; if (!directions[e.key])
        return; e.preventDefault(); selected = id; const o = find(); if (!o)
        return; if (id === 'pug')
        releasePug(); const wear = current().outfit.includes(o), wall = ['wall', 'shelf'].includes(byId.get(id)?.kind), ceiling = byId.get(id)?.kind === 'ceiling'; if (parentOf(o)) {
        o.mountX = clamp((o.mountX || 0) + directions[e.key][0], -.28, .28);
        o.mountY = clamp((o.mountY || 0) + directions[e.key][1], -.08, .08);
        render();
        save();
        root.querySelector(`[data-id="${id}"]`)?.focus();
        return;
    } o.x = clamp(o.x + directions[e.key][0], wear ? -.1 : .06, wear ? 1.1 : .94); o.y = clamp(o.y + directions[e.key][1], wear ? -.1 : ceiling ? 0 : wall ? .2 : .59, wear ? 1.1 : ceiling ? .3 : wall ? .66 : .97); if (id === 'pug')
        o.seat = null; render(); save(); root.querySelector(id === 'pug' ? '.kids-mascot' : `[data-id="${id}"]`)?.focus(); }
    root.querySelectorAll('[data-room]').forEach(b => listen(b, 'click', () => { closet.close(); surfaces.close(); room = b.dataset.room; selected = null; root.dispatchEvent(new CustomEvent('kids:pose', { detail: 'sit' })); render(); save(); }));
    root.querySelectorAll('[data-depth]').forEach(button => listen(button, 'click', () => { const o = find(); if (!o || (current().outfit.includes(o) || ['wall', 'ceiling', 'shelf'].includes(byId.get(selected)?.kind))) return; if (selected === 'pug') releasePug(); o.y = Number(button.dataset.depth); render(); save(); }));
    root.querySelectorAll('[data-corner]').forEach(b => listen(b, 'click', () => { const o = find(); if (selected !== 'gm36' || !o) return; o.y = .80; Object.assign(o, deskCorner(b.dataset.corner, itemWidth(o))); render(); save(); }));
    listen(root.querySelector('#room-wear'), 'click', () => { const o = find(); if (!o || byId.get(selected)?.kind !== 'wear') return; current().outfit = fitOutfit(current().outfit, selected); render(); save(); say(wearGroup(selected) === 'blanket' ? 'Флопс укрыт' : 'Надето на Флопса'); });
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
        return; const v = current(); if (selected === WARDROBE_ID) { v.closet = []; closet.close(); } v.items = v.items.map(o => o.parent === selected ? detach(o, coordinates(o)) : o); v.items = v.items.filter(o => o.id !== selected); v.outfit = v.outfit.filter(o => o.id !== selected); if (v.pug.seat === selected)
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
    function supports(o) { return current().items.filter(p => permitted().has(p.id) && canMount(byId.get(o.id), byId.get(p.id))); }
    function mountOn(o, support) {
        // Separate successive small objects rather than hiding them at the same center.
        const siblings = current().items.filter(item => item.parent === support.id && item.id !== o.id);
        const slot = byId.get(support.id).kind === 'shelf' ? freeShelfSlot(siblings) : 0;
        if (slot === null) { say('На этой полке уже три вещи. Выбери другую полку.'); return; }
        o.parent = support.id;
        o.mountX = slot; o.mountY = 0;
        render(); save(); say(byId.get(o.id).name + ' — ' + byId.get(support.id).name);
    }
    listen(root.querySelector('#room-surface'), 'click', () => {
        const o = find(); if (!o || !current().items.includes(o)) return;
        if (o.parent) { Object.assign(o, detach(o, coordinates(o))); delete o.parent; delete o.mountX; delete o.mountY; render(); save(); return; }
        const choices = supports(o); if (!choices.length) return;
        if (choices.length === 1) { mountOn(o, choices[0]); return; }
        const grid = root.querySelector('#room-surfaces-grid'); grid.replaceChildren();
        for (const support of choices) {
            const b = document.createElement('button'); b.type = 'button'; b.dataset.support = support.id;
            const img = document.createElement('img'); img.src = byId.get(support.id).img; img.alt = '';
            const label = document.createElement('span'); label.textContent = byId.get(support.id).name;
            b.setAttribute('aria-label', 'Поставить на: ' + label.textContent); b.append(img, label); grid.append(b);
        }
        surfaces.showModal();
    });
    listen(surfaces, 'click', e => {
        const button = e.target.closest('[data-support]'), o = find();
        if (!button || !o) return;
        const support = supports(o).find(p => p.id === button.dataset.support);
        if (support) { mountOn(o, support); surfaces.close(); }
    });
    listen(root.querySelector('#room-surfaces-close'), 'click', () => surfaces.close());
    function toggleWardrobe() {
        const cupboard = current().items.find(o => o.id === WARDROBE_ID); if (!cupboard || !hasWardrobe(current(), owned)) return;
        cupboard.open = cupboard.open === false;
        if (!cupboard.open) closet.close(); render(); save(); say(cupboard.open ? 'Шкаф открыт' : 'Шкаф закрыт');
    }
    listen(root.querySelector('#room-wardrobe-toggle'), 'click', toggleWardrobe);
    listen(root.querySelector('#room-hold'), 'click', () => {
        const o = find(); if (!o || byId.get(o.id)?.kind !== 'handheld') return;
        const v = current();
        if (v.outfit.includes(o)) { v.outfit = v.outfit.filter(item => item.id !== o.id); v.items.push({id:o.id,x:v.pug.x,y:v.pug.y,scale:1,rotation:0}); }
        else { v.items = v.items.filter(item => item.id !== o.id); v.outfit.push({id:o.id,x:.5,y:.5,scale:1,rotation:0,fitted:true}); }
        render(); save(); say(v.outfit.some(item => item.id === o.id) ? 'Скакалка у Флопса в лапах' : 'Скакалка в комнате');
    });
    function renderCloset() {
        if (!hasWardrobe(current(), owned) && closet.open) closet.close();
        const active = closet.contains(document.activeElement) ? document.activeElement : null;
        const focusId = active?.dataset.closetId, focusAction = active?.dataset.closetAction;
        const inventory = closetInventory(current(), owned, catalog);
        for (const [name, values] of [['hanging', inventory.hanging], ['available', inventory.available]]) {
            const grid = root.querySelector('#room-closet-' + name); grid.replaceChildren();
            for (const item of values) {
                const tile = document.createElement('article'); tile.className = 'room-closet-tile';
                const img = document.createElement('img'); img.src = item.img; img.alt = ''; img.draggable = false;
                const label = document.createElement('span'); label.textContent = item.name;
                const actions = document.createElement('div'); actions.className = 'room-closet-actions';
                for (const mode of ['dress', name === 'hanging' ? 'take' : 'hang']) {
                    const button = document.createElement('button'); button.type = 'button'; button.dataset.closetId = item.id; button.dataset.closetAction = mode;
                    const text = (mode === 'dress' ? 'Надеть' : mode === 'hang' ? 'Повесить в шкаф' : 'В коллекцию') + ': ' + item.name;
                    button.setAttribute('aria-label', text); button.title = text; button.innerHTML = roomIcon(mode === 'dress' ? 'wear' : mode === 'hang' ? 'hanger' : 'remove'); actions.append(button);
                }
                tile.append(img, label, actions); grid.append(tile);
            }
        }
        root.querySelector('#room-closet-stored').hidden = !inventory.hanging.length;
        root.querySelector('#room-closet-rest').hidden = !inventory.available.length;
        root.querySelector('.room-closet-empty').hidden = !!(inventory.hanging.length + inventory.available.length);
        if (closet.open && focusId) {
            const same = closet.querySelector(`[data-closet-id="${focusId}"][data-closet-action="${focusAction}"]`) || closet.querySelector(`[data-closet-id="${focusId}"]`) || root.querySelector('#room-closet-close'); same.focus();
        }
    }
    function openCloset() { if (!hasWardrobe(current(), owned)) return; const cupboard = current().items.find(o => o.id === WARDROBE_ID); cupboard.open = true; render(); save(); if (!closet.open) closet.showModal(); }
    function hang(id) {
        const next = hangClothes(current(), id, owned, catalog); if (next === current()) return;
        layout[room] = next; selected = WARDROBE_ID; render(); save(); say(byId.get(id).name + ' — на вешалке');
    }
    listen(root.querySelector('#room-closet-open'), 'click', openCloset);
    listen(root.querySelector('#room-closet-close'), 'click', () => closet.close());
    listen(root.querySelector('#room-hang'), 'click', () => { hang(selected); openCloset(); });
    listen(closet, 'click', e => {
        const button = e.target.closest('button[data-closet-action]');
        if (!button || !hasWardrobe(current(), owned)) return;
        const id = button.dataset.closetId, mode = button.dataset.closetAction;
        if (!permitted().has(id) || byId.get(id)?.kind !== 'wear') return;
        if (mode === 'hang') { hang(id); return; }
        if (mode === 'take') { current().closet = current().closet.filter(code => code !== id); render(); save(); say(byId.get(id).name + ' — в коллекции'); return; }
        if (current().closet.includes(id)) layout[room] = dressFromCloset(current(), id, owned, catalog);
        else { const garment = { id, x: .5, y: .5, scale: 1, rotation: 0, fitted: true }; current().outfit = fitOutfit([...current().outfit.filter(o => o.id !== id), garment], id); }
        selected = id; render(); save(); closet.close(); say(byId.get(id).name + ' — на Флопсе');
    });
    const observer = new ResizeObserver(renderObjects);
    observer.observe(stage);
    clean();
    render();
    return {
        updateOwned(ids) { owned = normalize(ids); if (selected !== 'pug' && !permitted().has(selected))
            selected = null; clean(); render(); },
        updateSaved(saved) { if (saved?.updatedAt === lastEmitted?.updatedAt)
            return; restore(saved); clean(); selected = null; render(); },
        destroy() { surfaces.close(); closet.close(); unsubscribeSynth(); stopSynthMelody(); controller.abort(); observer.disconnect(); scene.replaceChildren(); outfit.replaceChildren(); backOutfit.replaceChildren(); headOutfit.replaceChildren(); tray.replaceChildren(); }
    };
}
