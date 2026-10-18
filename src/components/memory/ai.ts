// Flops — the pug opponent's "brain" for Меморина.
//
// Design goals (from the agreed plan):
//  • Flops remembers ~30–50% of the cards it has seen, a little more on bigger
//    boards, and occasionally "forgets" a pair it just saw (silly mistakes, so a
//    5-year-old feels smarter).
//  • Flops ALWAYS loses by a small margin, and not obviously from the first move.
//
// How the guaranteed loss works: a hard score cap `flopsCap(pairs)` limits how
// many pairs Flops is ever allowed to claim on purpose. Once Flops reaches the
// cap it switches to "stall" mode and deliberately picks two cards of different
// countries, so it can no longer match voluntarily. The only way it can go one
// over the cap is being forced to flip the final two cards when they are the
// last pair left — and the cap is chosen so that even cap+1 stays strictly below
// half the pairs, i.e. the player still wins. Early on Flops does land real
// matches (up to the cap), so the lead builds gradually rather than obviously.
//
// This module is pure (no React, no DOM). All randomness is called from event
// handlers / effects in the component, never during render.

export interface AiCard {
  id: number;
  code: string;
  matched: boolean;
}

/** Flops's mutable memory: cardId -> country code it remembers for that card. */
export type FlopsMemory = Map<number, string>;

export function createMemory(): FlopsMemory {
  return new Map();
}

/**
 * Hard ceiling on Flops's score. Chosen so that even if Flops is forced to take
 * the very last pair (cap + 1), it stays strictly below pairs/2 — so the player
 * always finishes ahead.
 *   pairs: 3 → 0, 6 → 1, 8 → 2, 10 → 3
 * Worst case for Flops (forced final pair): 1, 2, 3, 4 vs player 2, 4, 5, 6.
 */
export function flopsCap(pairs: number): number {
  return Math.max(0, Math.ceil(pairs / 2) - 2);
}

/** Recall probability per difficulty — how likely Flops memorizes a seen card. */
export function recallChance(pairs: number): number {
  if (pairs <= 3) return 0.35;
  if (pairs <= 6) return 0.4;
  if (pairs <= 8) return 0.45;
  return 0.5;
}

/** Chance Flops "forgets" a known pair on a given turn — the endearing blunder. */
const FORGET_CHANCE = 0.22;
/** Chance an existing memory entry gets dropped whenever a new card is observed. */
const DECAY_CHANCE = 0.08;

/**
 * Flops watches a card being turned face-up (by anyone). With `recall`
 * probability it memorizes the card; it may also randomly forget an old entry,
 * which is what makes it miss "obvious" pairs now and then.
 */
export function observe(
  memory: FlopsMemory,
  card: AiCard,
  recall: number
): void {
  if (Math.random() < recall) {
    memory.set(card.id, card.code);
  }
  if (memory.size > 0 && Math.random() < DECAY_CHANCE) {
    const keys = [...memory.keys()];
    memory.delete(keys[Math.floor(Math.random() * keys.length)]);
  }
}

/** Drop matched cards from memory so Flops never "remembers" gone cards. */
export function prune(memory: FlopsMemory, cards: AiCard[]): void {
  const alive = new Set(cards.filter((c) => !c.matched).map((c) => c.id));
  for (const id of [...memory.keys()]) {
    if (!alive.has(id)) memory.delete(id);
  }
}

function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Pick the two cards Flops will flip this turn. Returns their ids in flip order.
 *
 * - Below the cap: if Flops remembers a full pair (and doesn't blunder this
 *   turn) it goes for it; otherwise it flips a remembered card (or a random one)
 *   plus a second card, which may luckily complete a pair — also fine, since any
 *   match below the cap keeps Flops under the ceiling.
 * - At/above the cap ("stall"): Flops deliberately flips two DIFFERENT countries
 *   so it cannot match, unless only one pair is left (then it is forced).
 */
export function chooseMove(
  cards: AiCard[],
  memory: FlopsMemory,
  flopsScore: number,
  pairs: number
): [number, number] {
  const unmatched = cards.filter((c) => !c.matched);
  // Fallback guard — should always have ≥2 when it's Flops's turn.
  if (unmatched.length < 2) {
    return [unmatched[0]?.id ?? 0, unmatched[1]?.id ?? unmatched[0]?.id ?? 0];
  }

  const remembered = unmatched.filter((c) => memory.has(c.id));
  const cap = flopsCap(pairs);

  // Country code -> remembered cardIds (to spot a known pair).
  const byCode = new Map<string, number[]>();
  for (const c of remembered) {
    const list = byCode.get(c.code) ?? [];
    list.push(c.id);
    byCode.set(c.code, list);
  }
  const knownPair = [...byCode.values()].find((ids) => ids.length >= 2);

  const playingToWin = flopsScore < cap;

  if (playingToWin) {
    // Knows a pair and not blundering → take it.
    if (knownPair && Math.random() > FORGET_CHANCE) {
      return [knownPair[0], knownPair[1]];
    }
    // Otherwise: a remembered single (if any) first, then a second card that
    // completes it when remembered, else a random other card.
    const first = remembered.length > 0 ? sample(remembered) : sample(unmatched);
    const partner = remembered.find(
      (c) => c.id !== first.id && c.code === first.code
    );
    if (partner) return [first.id, partner.id];
    const rest = unmatched.filter((c) => c.id !== first.id);
    return [first.id, sample(rest).id];
  }

  // Stall / endgame giveaway — avoid completing any pair on purpose.
  const first = sample(unmatched);
  const differentCountry = unmatched.filter(
    (c) => c.id !== first.id && c.code !== first.code
  );
  if (differentCountry.length > 0) {
    return [first.id, sample(differentCountry).id];
  }
  // Forced: the only cards left are this country's pair. Taking it is the single
  // allowed way past the cap, and the cap guarantees the player is still ahead.
  const samePair = unmatched.find((c) => c.id !== first.id);
  return [first.id, samePair!.id];
}
