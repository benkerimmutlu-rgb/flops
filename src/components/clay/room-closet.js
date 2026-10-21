import { fitOutfit } from './wardrobe.js';

export const WARDROBE_ID = 'yellow_wardrobe';
export function hasWardrobe(layout, owned) {
    return owned.includes(WARDROBE_ID) && layout.items.some(item => item.id === WARDROBE_ID);
}
export function closetInventory(layout, owned, catalog) {
    const stored = new Set(layout.closet || []);
    const clothes = catalog.filter(item => item.kind === 'wear' && owned.includes(item.id));
    return { hanging: clothes.filter(item => stored.has(item.id)), available: clothes.filter(item => !stored.has(item.id)) };
}
function allowed(layout, id, owned, catalog) {
    return hasWardrobe(layout, owned) && owned.includes(id) && catalog.some(item => item.id === id && item.kind === 'wear');
}
/** Hanging moves an owned garment off the pug; ownership is never changed. */
export function hangClothes(layout, id, owned, catalog) {
    if (!allowed(layout, id, owned, catalog)) return layout;
    return { ...layout, outfit: layout.outfit.filter(item => item.id !== id), closet: [...new Set([...(layout.closet || []), id])] };
}
export function dressFromCloset(layout, id, owned, catalog) {
    if (!allowed(layout, id, owned, catalog) || !(layout.closet || []).includes(id)) return layout;
    const outfit = [...layout.outfit.filter(item => item.id !== id), { id, x: .5, y: .5, scale: 1, rotation: 0, fitted: true }];
    return { ...layout, closet: layout.closet.filter(code => code !== id), outfit: fitOutfit(outfit, id) };
}
