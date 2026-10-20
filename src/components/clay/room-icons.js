const paths = {
    back: '<path d="M39 17 22 32l17 15M23 32h28"/>',
    shop: '<path fill="#dcaf78" d="m12 27 5 25h30l5-25z"/><path d="m21 27 11-15 11 15M25 35v9m14-9v9"/>',
    remove: '<path fill="#d9af78" d="M10 34h44l-5 20H15z"/><path d="M32 8v29m-9-9 9 9 9-9M20 45h24"/>',
    smaller: '<circle fill="#d9e4c8" cx="28" cy="27" r="17"/><path d="m41 40 13 13M19 27h18"/>',
    larger: '<circle fill="#d9e4c8" cx="28" cy="27" r="17"/><path d="m41 40 13 13M19 27h18m-9-9v18"/>',
    rotate: '<path d="M50 25A20 20 0 1 0 48 45M50 10v16H34"/>',
    up: '<path d="M32 53V12M18 26l14-14 14 14"/>',
    down: '<path d="M32 11v41M18 38l14 14 14-14"/>',
    surface: '<path fill="#d9af78" d="M8 27h48v10H8z"/><path d="M16 37v17m32-17v17M32 23V7m-7 8 7-8 7 8"/>',
};
export function roomIcon(name) {
    return `<svg aria-hidden="true" viewBox="0 0 64 64" fill="none" stroke="#67523e" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.down}</svg>`;
}
export function posePicture(pose, arrow = '') {
    return `<span class="room-pose-picture"><img src="/assets/clay/room-pug-${pose}.webp" alt="">${arrow ? roomIcon(arrow) : ''}</span>`;
}
export function depthPicture(level) {
    const x = [31, 27, 23][level], y = [20, 32, 45][level], r = [5, 7, 9][level];
    return `<svg aria-hidden="true" viewBox="0 0 64 64"><path d="M12 10h40v41H12z" fill="#c3d0ae" stroke="#82765d" stroke-width="3"/><path d="m12 51 11-30h18l11 30z" fill="#e8d9bb"/><circle cx="${x+5}" cy="${y}" r="${r}" fill="#c58457" stroke="#80583e" stroke-width="2"/></svg>`;
}
