export interface DailyVisit {
  version: 1;
  timezone: string;
  lastVisit: string;
  seriesStart: string;
  days: number;
  lastPause: string | null;
  rewardTotal: number;
}
export const VISIT_REWARD = 5;
export function reconcileVisitBalance(local: { bones: number; bonesEarned: number; applied: number }, total: number,
  remote?: { bones: number; bonesEarned: number }) {
  const missing = Math.max(0, total - local.applied);
  return { bones: Math.max(local.bones + missing, remote?.bones || 0),
    bonesEarned: Math.max(local.bonesEarned + missing, remote?.bonesEarned || 0), applied: Math.max(local.applied, total) };
}
export function calendarDay(now: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = (type: string) => parts.find(part => part.type === type)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
export function browserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}
export function dayNumber(day: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return NaN;
  const number = Date.parse(`${day}T00:00:00Z`);
  return Number.isFinite(number) && new Date(number).toISOString().slice(0, 10) === day ? number / 86400000 : NaN;
}
export function normalizeVisit(raw: unknown): DailyVisit | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as DailyVisit;
  if (value.version !== 1 || typeof value.timezone !== "string" || !Number.isFinite(dayNumber(value.lastVisit)) || !Number.isFinite(dayNumber(value.seriesStart)) ||
      !Number.isSafeInteger(value.days) || value.days < 1 || !Number.isSafeInteger(value.rewardTotal) || value.rewardTotal < 0 ||
      (value.lastPause !== null && !Number.isFinite(dayNumber(value.lastPause)))) return null;
  try { calendarDay(new Date(), value.timezone); } catch { return null; }
  return { version: 1, timezone: value.timezone, lastVisit: value.lastVisit, seriesStart: value.seriesStart,
    days: value.days, lastPause: value.lastPause, rewardTotal: value.rewardTotal };
}
/** Pure calendar rules shared by guest mode and its tests; server uses the same rules in SQL. */
export function advanceVisit(previous: DailyVisit | null, today: string, timezone: string) {
  if (!Number.isFinite(dayNumber(today))) throw new Error("Invalid visit date");
  const gap = previous ? dayNumber(today) - dayNumber(previous.lastVisit) : Infinity;
  if (previous && gap <= 0) return { visit: previous, reward: 0, restarted: false };
  const missed = new Date((dayNumber(today) - 1) * 86400000).toISOString().slice(0, 10);
  const protectedGap = gap === 2 && (!previous?.lastPause || dayNumber(missed) - dayNumber(previous.lastPause) >= 7);
  const continued = !!previous && (gap === 1 || protectedGap);
  const days = continued ? previous.days + 1 : 1;
  const reward = days % 3 === 0 ? VISIT_REWARD : 0;
  const visit: DailyVisit = { version: 1, timezone: previous?.timezone || timezone, lastVisit: today,
    seriesStart: continued ? previous.seriesStart : today, days,
    lastPause: protectedGap ? missed : previous?.lastPause || null,
    rewardTotal: (previous?.rewardTotal || 0) + reward };
  return { visit, reward, restarted: !!previous && !continued };
}
