const paths = {
    hanger: '<path d="M28 18a6 6 0 1 1 9 5l-5 4v6L10 46q-4 6 3 6h38q7 0 3-6L32 33"/>',
    closet: '<rect x="12" y="8" width="40" height="47" rx="7" fill="#edca56"/><path d="M32 9v45M26 30v5m12-5v5M18 56v4m28-4v4"/>',
    close: '<path d="m18 18 28 28m0-28L18 46"/>',
    back: '<path d="M39 17 22 32l17 15M23 32h28"/>',
    shop: '<path fill="#dcaf78" d="m12 27 5 25h30l5-25z"/><path d="m21 27 11-15 11 15M25 35v9m14-9v9"/>',
    remove: '<path fill="#d9af78" d="M10 34h44l-5 20H15z"/><path d="M32 8v29m-9-9 9 9 9-9M20 45h24"/>',
    smaller: '<circle fill="#c9dcb5" cx="32" cy="32" r="23"/><path stroke="#526c46" d="M21 32h22"/>',
    larger: '<circle fill="#c9dcb5" cx="32" cy="32" r="23"/><path stroke="#526c46" d="M21 32h22M32 21v22"/>',
    rotate: '<path d="M50 25A20 20 0 1 0 48 45M50 10v16H34"/>',
    up: '<path d="M32 53V12M18 26l14-14 14 14"/>',
    down: '<path d="M32 11v41M18 38l14 14 14-14"/>',
    wear: '<path fill="#9fc7cd" d="m22 14-13 9 8 12 5-3v21h20V32l5 3 8-12-13-9q-10 12-20 0z"/><path stroke="#567a7e" d="M25 43h14"/>',
    cover: '<path fill="#d7b9db" d="M10 27q20-17 44 0v25H10z"/><path stroke="#8d6894" d="M20 28v19m12-22v22m12-19v19"/>',
    leftCorner: '<path fill="#c2d8db" d="m8 11 23 10 25-10v40H8z"/><path d="M31 21v30"/><path fill="#b78b63" d="m12 34 16-5 18 7-15 6z"/><path d="M16 36v12m23-9v9"/>',
    rightCorner: '<path fill="#c2d8db" d="m8 11 23 10 25-10v40H8z"/><path d="M31 21v30"/><path fill="#b78b63" d="m18 36 18-7 16 5-19 8z"/><path d="M25 39v9m23-12v12"/>',
    surface: '<path fill="#d9af78" d="M8 27h48v10H8z"/><path d="M16 37v17m32-17v17M32 23V7m-7 8 7-8 7 8"/>',
};
export function roomIcon(name) {
    return `<svg aria-hidden="true" viewBox="0 0 64 64" fill="none" stroke="#67523e" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.down}</svg>`;
}
export function posePicture(pose, arrow = '') {
    return `<span class="room-pose-picture"><img src="/assets/clay/room-pug-${pose}.webp" alt="">${arrow ? roomIcon(arrow) : ''}</span>`;
}
export function depthPicture(level) {
    const x = [31, 27, 23][level], y = [20, 32, 45][level], r = [5, 7, 9][level];
    return `<svg aria-hidden="true" viewBox="0 0 64 64"><path d="M12 10h40v41H12z" fill="#c3d0ae" stroke="#82765d" stroke-width="3"/><path d="m12 51 11-30h18l11 30z" fill="#e8d9bb"/><circle cx="${x+5}" cy="${y}" r="${r}" fill="#c58457" stroke="#80583e" stroke-width="2"/></svg>`;
}
