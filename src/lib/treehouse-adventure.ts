import { browserTimezone, calendarDay, dayNumber } from './daily-visits';

export const TREEHOUSE_GIFTS = ['treehouse_lantern', 'treehouse_cushion', 'treehouse_shelf'] as const;
export type TreehouseGift = (typeof TREEHOUSE_GIFTS)[number];
export interface TreehouseAdventure {
  version: 1;
  startedDay: string;
  timezone: string;
  answers: number;
  claimed: TreehouseGift[];
}
export function normalizeAdventure(raw: unknown): TreehouseAdventure | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as TreehouseAdventure;
  if (value.version !== 1 || !Number.isFinite(dayNumber(value.startedDay)) || typeof value.timezone !== 'string') return null;
  try { calendarDay(new Date(), value.timezone); } catch { return null; }
  return { version: 1, startedDay: value.startedDay, timezone: value.timezone,
    answers: Number.isFinite(value.answers) ? Math.max(0, Math.min(3, Math.floor(value.answers))) : 0,
    claimed: TREEHOUSE_GIFTS.filter(id => Array.isArray(value.claimed) && value.claimed.includes(id)) };
}
export function startAdventure(now = new Date(), timezone = browserTimezone()): TreehouseAdventure {
  return { version: 1, startedDay: calendarDay(now, timezone), timezone, answers: 0, claimed: [] };
}
export function answerAdventure(value: TreehouseAdventure | null): TreehouseAdventure | null {
  if (!value || value.answers >= 3) return value;
  return { ...value, answers: value.answers + 1 };
}
export function giftReady(value: TreehouseAdventure | null, id: string, now = new Date()): boolean {
  if (!value || value.claimed.includes(id as TreehouseGift)) return false;
  const index = TREEHOUSE_GIFTS.indexOf(id as TreehouseGift);
  if (index < 0) return false;
  if (index === 0) return value.answers >= 3;
  return dayNumber(calendarDay(now, value.timezone)) - dayNumber(value.startedDay) >= index;
}
export function claimAdventure(value: TreehouseAdventure | null, id: string, now = new Date()) {
  if (!value || !giftReady(value, id, now)) return value;
  return { ...value, claimed: [...value.claimed, id as TreehouseGift] };
}
/** A newer furniture save must never erase an already earned event gift. */
export function mergeAdventure(a: TreehouseAdventure | null, b: TreehouseAdventure | null): TreehouseAdventure | null {
  if (!a) return b;
  if (!b) return a;
  const first = a.startedDay <= b.startedDay ? a : b;
  const answers = Math.max(a.answers, b.answers);
  const claimed = TREEHOUSE_GIFTS.filter(id => a.claimed.includes(id) || b.claimed.includes(id));
  if (first === a && answers === a.answers && claimed.join() === a.claimed.join()) return a;
  if (first === b && answers === b.answers && claimed.join() === b.claimed.join()) return b;
  return { ...first, answers, claimed };
}
