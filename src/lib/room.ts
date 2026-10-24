import { normalizeAdventure, mergeAdventure, type TreehouseAdventure } from "./treehouse-adventure";
import { ACCESSORIES, migrateOwnedIds } from "./shop";
import roomCatalog from "../components/clay/room-catalog.json";
import { canMount } from "../components/clay/room-placement.js";

export const ROOM_IDS = ["peach", "blue", "sage", "treehouse"] as const;
export type RoomId = (typeof ROOM_IDS)[number];
export interface RoomItem {
  id: string; x: number; y: number; scale: number; rotation: number;
  parent?: string; mountX?: number; mountY?: number; fitted?: boolean; open?: boolean;
}
export interface RoomLayout {
  items: RoomItem[];
  outfit: RoomItem[];
  closet: string[];
  pug: { x: number; y: number; scale: number; seat: string | null };
}
export interface RoomSnapshot {
  version: 1;
  updatedAt: number;
  room: RoomId;
  adventure: TreehouseAdventure | null;
  layout: Record<RoomId, RoomLayout>;
}
export interface RoomCatalogItem { id: string; name: string; img: string; kind: string; size: number; anchorY?: number; surfaceY?: number; closedImg?: string; wearX?: number; wearY?: number; wearRotation?: number }
export interface RoomMountOptions {
  catalog: RoomCatalogItem[];
  rooms: Record<RoomId, string>;
  owned: string[];
  saved: RoomSnapshot;
  onChange: (snapshot: RoomSnapshot) => void;
}
export function emptyRoom(): RoomSnapshot {
  const fresh = (): RoomLayout => ({ items: [], outfit: [], closet: [], pug: { x: .52, y: .86, scale: 1, seat: null } });
  return { version: 1, updatedAt: 0, room: "peach", adventure: null, layout: { peach: fresh(), blue: fresh(), sage: fresh(), treehouse: fresh() } };
}
const validIds = new Set(ACCESSORIES.map(item => item.id));
const clothingIds = new Set(roomCatalog.filter(item => item.kind === "wear").map(item => item.id));
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
      ...(item.fitted === true ? { fitted: true } : {}),
      ...(id === 'yellow_wardrobe' && typeof item.open === 'boolean' ? { open: item.open } : {}),
      ...(typeof item.parent === 'string' && canMount(roomCatalog.find(entry => entry.id === id), roomCatalog.find(entry => entry.id === item.parent)) ? { parent: item.parent, mountX: finite(item.mountX, 0, -.45, .45), mountY: finite(item.mountY, 0, -.2, .22) } : {}) }];
  });
}
export function normalizeRoom(value: unknown): RoomSnapshot {
  const data = record(value), source = record(data.layout), result = emptyRoom();
  result.adventure = normalizeAdventure(data.adventure);
  result.updatedAt = finite(data.updatedAt, 0, 0, Number.MAX_SAFE_INTEGER);
  if (ROOM_IDS.includes(data.room as RoomId)) result.room = data.room as RoomId;
  for (const id of ROOM_IDS) {
    const layout = record(source[id]), pug = record(layout.pug);
    const placed = items(layout.items);
    const outfit = items(layout.outfit);
    // A previously worn camera becomes a room object without losing the purchase.
    const camera = outfit.find(item => item.id === 'camera');
    if (camera && !placed.some(item => item.id === 'camera')) placed.push({ id: 'camera', x: .55, y: .81, scale: 1, rotation: 0 });
    const clothes = outfit.filter(item => item.id !== 'camera');
    for (const item of placed) if (item.parent && !placed.some(parent => parent.id === item.parent)) {
      delete item.parent; delete item.mountX; delete item.mountY; item.y = Math.max(.59, item.y);
    }
    const worn = new Set(clothes.map(item => item.id));
    const closet = Array.isArray(layout.closet) ? migrateOwnedIds(layout.closet.filter((value): value is string => typeof value === "string")).filter(code => clothingIds.has(code) && !worn.has(code)) : [];
    result.layout[id] = { items: placed, outfit: clothes, closet: [...new Set(closet)], pug: {
      x: finite(pug.x, .52, .05, .95), y: finite(pug.y, .86, .58, .97), scale: finite(pug.scale, 1, .4, 2),
      seat: typeof pug.seat === "string" && placed.some(item => item.id === pug.seat) ? pug.seat : null,
    } };
  }
  return result;
}
/** Choose a complete room layout, so furniture relationships cannot be split by merging. */
export function newerRoom(local: RoomSnapshot, remote: unknown): RoomSnapshot {
  const other = normalizeRoom(remote);
  const latest = other.updatedAt > local.updatedAt ? other : local;
  const adventure = mergeAdventure(local.adventure, other.adventure);
  return adventure === latest.adventure ? latest : { ...latest, adventure };
}
