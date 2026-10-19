// Магазин Флопса — коллекционные «вещи» (не одежда), которые покупаются за
// косточки. В витрине вещь серая (не куплена) и становится цветной после
// покупки. На мопса ничего не надевается. Цены растут, чтобы было ради чего
// копить: дешёвые по силам за пару заходов, дорогие — долгая цель.

export interface Accessory {
  id: string;
  name: string;
  img: string; // пластилиновый PNG вещи
  price: number;
}

const SHOP = "/assets/shop";

export const ACCESSORIES: Accessory[] = [
  { id: "ball", name: "Мячик", img: `${SHOP}/ball.webp`, price: 20 },
  { id: "bone", name: "Косточка", img: `${SHOP}/bone.webp`, price: 30 },
  { id: "glasses", name: "Очки", img: `${SHOP}/glasses.webp`, price: 45 },
  { id: "bowl", name: "Миска", img: `${SHOP}/bowl.webp`, price: 60 },
  { id: "plant", name: "Растение", img: `${SHOP}/plant.webp`, price: 75 },
  { id: "crown", name: "Корона", img: `${SHOP}/crown.webp`, price: 95 },
  { id: "backpack", name: "Рюкзак", img: `${SHOP}/backpack.webp`, price: 120 },
  { id: "camera", name: "Фотоаппарат", img: `${SHOP}/camera.webp`, price: 150 },
  { id: "easel", name: "Мольберт", img: `${SHOP}/easel.webp`, price: 180 },
  { id: "plane", name: "Самолётик", img: `${SHOP}/plane.webp`, price: 220 },
  { id: "journal", name: "Дневник", img: `${SHOP}/journal.webp`, price: 280 },
  { id: "postcards", name: "Открытки", img: `${SHOP}/postcards.webp`, price: 350 },
  { id: "globe", name: "Глобус", img: `${SHOP}/globe.webp`, price: 450 },
  { id: "chest", name: "Сундук", img: `${SHOP}/chest.webp`, price: 550 },
  { id: "trophy", name: "Кубок", img: `${SHOP}/trophy.webp`, price: 700 },
];

export function accessoryById(id: string | null | undefined): Accessory | undefined {
  if (!id) return undefined;
  return ACCESSORIES.find((a) => a.id === id);
}

// ─── Ранг Флопса: по суммарно заработанным косточкам (не тратится) ───
export interface Rank {
  name: string;
  emoji: string;
  min: number; // порог входа в ранг
}

export const RANKS: Rank[] = [
  { name: "Щенок", emoji: "🐾", min: 0 },
  { name: "Путешественник", emoji: "🧳", min: 30 },
  { name: "Исследователь", emoji: "🧭", min: 80 },
  { name: "Штурман", emoji: "🗺️", min: 160 },
  { name: "Капитан", emoji: "⚓", min: 280 },
  { name: "Чемпион мира", emoji: "🏆", min: 450 },
];

export interface RankProgress {
  rank: Rank;
  next: Rank | null;
  /** 0–1 прогресс к следующему рангу (1 на максимальном). */
  progress: number;
  /** Сколько косточек заработать до следующего ранга (0 на максимуме). */
  toNext: number;
}

export function rankForEarned(earned: number): RankProgress {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (earned >= RANKS[i].min) idx = i;
  }
  const rank = RANKS[idx];
  const next = RANKS[idx + 1] ?? null;
  if (!next) return { rank, next: null, progress: 1, toNext: 0 };
  const span = next.min - rank.min;
  const done = earned - rank.min;
  return {
    rank,
    next,
    progress: Math.max(0, Math.min(1, done / span)),
    toNext: Math.max(0, next.min - earned),
  };
}
