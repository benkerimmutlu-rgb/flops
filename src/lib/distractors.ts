import { CountryLite } from "./types";
import { shuffle } from "./data";

// Picks "confusing" wrong answers for the flag-guessing game: flags/names that
// are genuinely easy to mix up with the target, so choosing from 4 options is
// a real challenge rather than an obvious pick.

function sharedTagCount(a?: string[], b?: string[]): number {
  if (!a || !b) return 0;
  const setB = new Set(b);
  return a.reduce((n, t) => n + (setB.has(t) ? 1 : 0), 0);
}

function nameAffinity(a: string, b: string): number {
  // crude: shared first letter + similar length -> slightly confusing in a list
  let score = 0;
  if (a[0]?.toLowerCase() === b[0]?.toLowerCase()) score += 2;
  if (Math.abs(a.length - b.length) <= 2) score += 1;
  return score;
}

function confusionScore(target: CountryLite, cand: CountryLite): number {
  let score = 0;
  const look = new Set([...(target.lookalikes ?? []), ...(cand.lookalikes ?? [])]);
  if (look.has(cand.code) || look.has(target.code)) score += 100;
  score += sharedTagCount(target.flagTags, cand.flagTags) * 10;
  if (cand.continent === target.continent) score += 4;
  score += nameAffinity(target.name, cand.name);
  return score;
}

/**
 * Returns `n` wrong-answer countries for `target`, drawn from `pool`.
 * Ranks the pool by how confusable each option is, keeps a top band, then
 * samples from it so the same three don't repeat every time. Falls back to
 * random fill if the pool is too small to be picky.
 */
export function pickDistractors(
  target: CountryLite,
  pool: CountryLite[],
  n = 3
): CountryLite[] {
  const candidates = pool.filter((c) => c.code !== target.code);
  if (candidates.length <= n) return candidates;

  const ranked = candidates
    .map((c) => ({ c, score: confusionScore(target, c) }))
    .sort((a, b) => b.score - a.score);

  // Take a band of the most-confusable options (at least 2n) and sample from it.
  const band = ranked.slice(0, Math.max(n * 3, 8)).map((r) => r.c);
  const picked = shuffle(band).slice(0, n);

  // Safety: top up from the rest if the band was short.
  if (picked.length < n) {
    const used = new Set(picked.map((c) => c.code));
    for (const c of shuffle(candidates)) {
      if (picked.length >= n) break;
      if (!used.has(c.code)) picked.push(c);
    }
  }
  return picked;
}
