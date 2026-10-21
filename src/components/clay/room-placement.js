export const surfaceBounds = { x: .28, y: .08 };
const clamp = (value, limit) => Math.max(-limit, Math.min(limit, Number.isFinite(value) ? value : 0));
export function onDesk(desk, width, aspect, item) {
    return { x: desk.x + clamp(item.mountX, surfaceBounds.x) * width,
        y: desk.y - width * aspect * (.52 - clamp(item.mountY, surfaceBounds.y)) };
}
export function deskCorner(side, width) {
    const edge = Math.min(.48, width / 2 + .025);
    return { x: side === 'left' ? edge : 1 - edge, y: .80 };
}

export const shelfIds = ['shelf_lack', 'shelf_mosslanda', 'shelf_bergshult'];
const smallObjects = new Set(['live_clock_blue', 'live_clock_green', 'camera', 'plant', 'journal', 'globe', 'trophy', 'rx3', 'rx4', 'rx5', 'rx6', 'tk1', 'tk9', 'su3', 'su4', 'su9', 'gm4', 'gm8', 'gm29', 'gaming_mouse', 'chips_day', 'hourglass', 'vanilla_tealights', 'bunny_toy', 'ev_microphone_trophy', 'ev_golden_star']);
export function canMount(item, support) {
    if (!item || !support || item.id === support.id) return false;
    return support.id === 'gm36' ? item.kind === 'surface' : shelfIds.includes(support.id) && smallObjects.has(item.id);
}
export function onSupport(support, definition, width, aspect, item) {
    if (support.id === 'gm36') return onDesk(support, width, aspect, item);
    return { x: support.x + clamp(item.mountX, surfaceBounds.x) * width,
        y: support.y - width * aspect * ((definition.anchorY ?? 1) - definition.surfaceY) };
}
export function freeShelfSlot(siblings) {
    if (siblings.length >= 3) return null;
    const slots = [0, -.28, .28];
    const distance = slot => Math.min(...siblings.map(item => Math.abs(slot - (item.mountX || 0))));
    return siblings.length ? slots.reduce((best, slot) => distance(slot) > distance(best) ? slot : best) : 0;
}
/** Detach in place before a supporting surface is removed. */
export function detach(item, at) {
    const rest = { ...item, x: at.x, y: Math.max(.59, Math.min(.97, at.y)) };
    delete rest.parent; delete rest.mountX; delete rest.mountY;
    return rest;
}
