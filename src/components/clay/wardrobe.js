// Coordinates are normalized against the three actual, registered room sprites.
const GROUPS = {
    blanket: ['sleep_blanket', 'rx10'], cape: ['cape', 'hw3'],
    gloves: ['sp1', 'sp9'], shoes: ['sp4', 'sp7', 'gm28'],
    eyes: ['glasses', 'su10', 'hw2', 'sleep_mask'],
    hat: ['crown', 'gm7', 'hw1', 'cap', 'party', 'tophat', 'sp10'],
    neck: ['scarf', 'bowtie', 'hw4', 'medal', 'ev_backstage_pass'],
    headphones: ['gm25', 'gm35'], backpack: ['backpack'],
};
export function wearGroup(id) { return Object.keys(GROUPS).find(group => GROUPS[group].includes(id)) || 'accessory'; }
const PAWS = {
    stand: [[.38, .89], [.57, .90], [.80, .88]],
    sit: [[.36, .90], [.53, .90], [.23, .90], [.72, .90]],
    sleep: [[.23, .88], [.43, .90], [.75, .89]],
};
const SINGLE_PAW = { sp1: 'wear_boxing_glove', sp9: 'wear_hand_wrap', sp4: 'wear_sneaker_sport', sp7: 'wear_boxing_boot', gm28: 'wear_sneaker_pink' };
/** A fitted item remains a single purchased item even when it has several paw pieces. */
export function wearableFit(item, pose) {
    const group = wearGroup(item.id), sleeping = pose === 'sleep';
    const part = (x, y, size, rotation = 0, img = item.img, mirror = false) => ({ x, y, size, rotation, img, mirror });
    if (group === 'gloves' || group === 'shoes') {
        const paws = group === 'gloves' ? PAWS[pose].slice(0, 2) : PAWS[pose];
        const img = SINGLE_PAW[item.id] ? '/assets/clay/wardrobe/' + SINGLE_PAW[item.id] + '_front.webp' : item.img;
        return { layer: 'front', parts: paws.map(([x, y], i) => { const mirror = pose === 'sit' ? i % 2 === 1 : i > 0; const size = group === 'gloves' ? .23 : item.id === 'gm28' ? .28 : .24; const cuffX = item.id === 'gm28' ? .64 : item.id === 'sp7' ? .60 : item.id === 'sp4' ? .46 : .50; return part(x - (cuffX - .5) * size * (mirror ? -1 : 1), y - (item.id === 'gm28' ? .085 : .065), size, sleeping ? -10 : 0, img, mirror); }) };
    }
    if (group === 'blanket') return { layer: 'front', parts: [part(sleeping ? .76 : .58, sleeping ? .74 : .73, sleeping ? .66 : .73, 0, '/assets/clay/wardrobe/wear_blanket_front.webp')] };
    if (item.id === 'hw11') return { layer: 'head', parts: [part(sleeping ? .35 : .50, sleeping ? .67 : .40, sleeping ? .72 : .78, sleeping ? -20 : 12, '/assets/clay/wardrobe/scream_mask_fit.webp')] };
    if (group === 'cape') return { layer: 'back', parts: [part(sleeping ? .65 : .51, sleeping ? .69 : .59, sleeping ? 1.0 : 1.02, sleeping ? -12 : 0, '/assets/clay/wardrobe/' + (item.id === 'hw3' ? 'vampire_back_fan' : 'cape_back_fan') + '.webp')], frontParts: [part(sleeping ? .58 : .51, sleeping ? .77 : .68, .32, sleeping ? -20 : 10, '/assets/clay/wardrobe/' + (item.id === 'hw3' ? 'wear_vampire_collar' : 'wear_cape_collar') + '.webp')] };
    if (group === 'eyes') return { layer: 'head', parts: [part(sleeping ? .37 : .50, sleeping ? .64 : .36, .43, sleeping ? -20 : 15)] };
    if (group === 'hat') return { layer: 'head', parts: [part(sleeping ? .39 : .48, sleeping ? .49 : .19, item.id === 'sp10' ? .64 : .50, sleeping ? -20 : 15)] };
    if (group === 'neck') return { layer: 'front', parts: [part(sleeping ? .58 : .51, sleeping ? .74 : .64, .43, sleeping ? -20 : 12)] };
    if (group === 'headphones') return { layer: 'head', parts: [part(sleeping ? .37 : .50, sleeping ? .62 : .38, sleeping ? .62 : .75, sleeping ? -20 : 15)] };
    if (group === 'backpack') return { layer: 'back', parts: [part(sleeping ? .74 : .65, sleeping ? .70 : .65, .62)] };
    if (item.id === 'beach_dream') return { layer: 'head', parts: [part(.78, sleeping ? .25 : .04, .70)] };
    return { layer: 'front', parts: [part(item.wearX ?? .5, item.wearY ?? .55, item.size, item.wearRotation ?? 0)] };
}

/** Refit only the chosen item; mutually exclusive fitted clothes return to the inventory. */
export function fitOutfit(outfit, id) {
    const group = wearGroup(id);
    return outfit.filter(o => o.id === id || !o.fitted || group === 'accessory' || wearGroup(o.id) !== group)
        .map(o => o.id === id ? { ...o, x: .5, y: .5, scale: 1, rotation: 0, fitted: true } : o);
}
