import { ACCESSORIES, migrateOwnedIds } from "./shop";

export const ROOM_IDS = ["peach", "blue", "sage"] as const;
export type RoomId = (typeof ROOM_IDS)[number];
export interface RoomItem {
  id: string; x: number; y: number; scale: number; rotation: number;
  parent?: string; mountX?: number; mountY?: number;
}
export interface RoomLayout {
  items: RoomItem[];
  outfit: RoomItem[];
  pug: { x: number; y: number; scale: number; seat: string | null };
}
export interface RoomSnapshot {
  version: 1;
  updatedAt: number;
  room: RoomId;
  layout: Record<RoomId, RoomLayout>;
}
export interface RoomCatalogItem { id: string; name: string; img: string; kind: string; size: number; wearX?: number; wearY?: number; wearRotation?: number }
export interface RoomMountOptions {
  catalog: RoomCatalogItem[];
  rooms: Record<RoomId, string>;
  owned: string[];
  saved: RoomSnapshot;
  onChange: (snapshot: RoomSnapshot) => void;
}
export function emptyRoom(): RoomSnapshot {
  const fresh = (): RoomLayout => ({ items: [], outfit: [], pug: { x: .52, y: .86, scale: 1, seat: null } });
  return { version: 1, updatedAt: 0, room: "peach", layout: { peach: fresh(), blue: fresh(), sage: fresh() } };
}
const validIds = new Set(ACCESSORIES.map(item => item.id));
const finite = (value: unknown, fallback: number, min: number, max: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
const record = (value: unknown): Record<string, unknown> => value && typeof value === "object" ? value as Record<string, unknown> : {};
function items(value: unknown): RoomItem[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.flatMap(raw => {
    const item = record(raw);
    const id = typeof item.id === "string" ? migrateOwnedIds([item.id])[0] : "";
    if (!validIds.has(id) || seen.has(id)) return [];
    seen.add(id);
    return [{ id, x: finite(item.x, .5, -.1, 1.1), y: finite(item.y, .8, -.1, 1.1),
      scale: finite(item.scale, 1, .4, 2), rotation: finite(item.rotation, 0, -360, 360),
      ...(item.parent === "gm36" && id !== "gm36" ? { parent: "gm36", mountX: finite(item.mountX, 0, -.45, .45), mountY: finite(item.mountY, 0, -.2, .22) } : {}) }];
  });
}
export function normalizeRoom(value: unknown): RoomSnapshot {
  const data = record(value), source = record(data.layout), result = emptyRoom();
  result.updatedAt = finite(data.updatedAt, 0, 0, Number.MAX_SAFE_INTEGER);
  if (ROOM_IDS.includes(data.room as RoomId)) result.room = data.room as RoomId;
  for (const id of ROOM_IDS) {
    const layout = record(source[id]), pug = record(layout.pug);
    const placed = items(layout.items);
    result.layout[id] = { items: placed, outfit: items(layout.outfit), pug: {
      x: finite(pug.x, .52, .05, .95), y: finite(pug.y, .86, .58, .97), scale: finite(pug.scale, 1, .4, 2),
      seat: typeof pug.seat === "string" && placed.some(item => item.id === pug.seat) ? pug.seat : null,
    } };
  }
  return result;
}
/** Choose a complete room layout, so furniture relationships cannot be split by merging. */
export function newerRoom(local: RoomSnapshot, remote: unknown): RoomSnapshot {
  const other = normalizeRoom(remote);
  return other.updatedAt > local.updatedAt ? other : local;
}
