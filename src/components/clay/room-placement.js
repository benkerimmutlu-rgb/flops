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
