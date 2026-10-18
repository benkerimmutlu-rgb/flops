// Flops — the pug opponent's "brain" for Меморина.
//
// Difficulty scales how strong Flops plays (see STRENGTH):
//  • Лёгкий / Средний — Flops is held back by a score `cap`, so he lands a few
//    real pairs early but then stalls and the child always wins by a small
//    margin. Keeps little kids feeling smart.
//  • Сложный / Эксперт — the cap is removed and Flops's recall climbs, so he
//    plays to win every turn: the child now has a real opponent who CAN win,
//    more so on Эксперт.
// Flops still "forgets" pairs now and then (the endearing blunder), less often
// on harder levels.
//
// This module is pure (no React, no DOM). All randomness is called from event
// handlers / effects in the component, never during render.

import type { Difficulty } from "./config";

export interface AiCard {
  id: number;
  code: string;
  matched: boolean;
}

/** How hard Flops plays at each difficulty. */
export interface FlopsStrength {
  /** Probability Flops memorizes a card he sees. */
  recall: number;
  /** Max pairs Flops may win on purpose; null = no cap (plays to win). */
  cap: number | null;
  /** Chance Flops fumbles a pair he knows on a given turn. */
  forget: number;
}

export const STRENGTH: Record<Difficulty, FlopsStrength> = {
  easy: { recall: 0.3, cap: 0, forget: 0.3 },
  medium: { recall: 0.42, cap: 1, forget: 0.22 },
  // No cap from here on — Flops can genuinely win.
  hard: { recall: 0.62, cap: null, forget: 0.12 },
  expert: { recall: 0.82, cap: null, forget: 0.05 },
};

/** Flops's mutable memory: cardId -> country code it remembers for that card. */
export type FlopsMemory = Map<number, string>;

export function createMemory(): FlopsMemory {
  return new Map();
}

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
  cap: number | null,
  forget: number
): [number, number] {
  const unmatched = cards.filter((c) => !c.matched);
  // Fallback guard — should always have ≥2 when it's Flops's turn.
  if (unmatched.length < 2) {
    return [unmatched[0]?.id ?? 0, unmatched[1]?.id ?? unmatched[0]?.id ?? 0];
  }

  const remembered = unmatched.filter((c) => memory.has(c.id));

  // Country code -> remembered cardIds (to spot a known pair).
  const byCode = new Map<string, number[]>();
  for (const c of remembered) {
    const list = byCode.get(c.code) ?? [];
    list.push(c.id);
    byCode.set(c.code, list);
  }
  const knownPair = [...byCode.values()].find((ids) => ids.length >= 2);

  // No cap (hard/expert) → always plays to win; capped → stalls once reached.
  const playingToWin = cap === null || flopsScore < cap;

  if (playingToWin) {
    // Knows a pair and not blundering → take it.
    if (knownPair && Math.random() > forget) {
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
