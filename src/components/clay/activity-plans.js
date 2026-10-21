export const ACTIVITIES = {
    premium_playground: [{ id: 'slide', label: 'Скатиться с горки', icon: 'slide' }, { id: 'spin', label: 'Солнышко на турнике', icon: 'spin' }],
    premium_pool: [{ id: 'dive', label: 'Нырнуть и отряхнуться', icon: 'dive' }],
    premium_juice_bar: [{ id: 'dance', label: 'Выпить сок и потанцевать', icon: 'drink' }],
    cuckoo_clock: [{ id: 'cuckoo', label: 'Послушать кукушку', icon: 'bird' }],
};
export function allowedActivity(owned, items, itemId, action) {
    return owned.includes(itemId) && items.some(item => item.id === itemId) && !!ACTIVITIES[itemId]?.some(entry => entry.id === action);
}
// Coordinates are relative to the square registered furniture sprite; no layout changes are saved.
const f = (offset, x, y, rotate = 0, opacity = 1) => ({ offset, x, y, rotate, opacity });
export function activityPlan(action) {
    if (action === 'slide') return { duration: 7200, size: .30, frames: [f(0,null,null),f(.12,.13,.91),f(.24,.18,.62),f(.33,.26,.36),f(.42,.30,.27),f(.48,.36,.34,8),f(.59,.56,.63,12),f(.69,.80,.88,-7),f(.77,.88,.94),f(1,null,null)] };
    if (action === 'spin') return { duration: 7400, size: .27, frames: [f(0,null,null),f(.16,.88,.91),f(.30,.80,.29),f(.38,.80,.29),f(.51,.80,.29,180),f(.65,.80,.29,360),f(.73,.80,.29,360),f(.84,.87,.92,360),f(1,null,null,360)] };
    if (action === 'dive') return { duration: 8600, size: .34, frames: [f(0,null,null),f(.12,.88,.85),f(.23,.75,.48,-15),f(.32,.51,.60,-80,0),f(.40,.5,.66,0,0),f(.47,.5,.59),f(.53,.5,.57),f(.59,.5,.60),f(.65,.5,.57),f(.72,.84,.85),f(.77,.85,.91,-8),f(.795,.85,.91,8),f(.82,.85,.91,-7),f(.845,.85,.91,7),f(.87,.85,.91),f(1,null,null)], splash: [.32,.76,.81,.85] };
    if (action === 'dance') return { duration: 8500, size: .35, frames: [f(0,null,null),f(.17,.50,.66),f(.37,.50,.66),f(.47,.50,.66),f(.58,.86,.92),f(.63,.86,.88,-9),f(.68,.86,.92,9),f(.73,.86,.87,-9),f(.78,.86,.92,9),f(.84,.86,.89),f(1,null,null)], cup: [.20,.46] };
    if (action === 'cuckoo') return { duration: 5200, size: 0, frames: [] };
    return null;
}
