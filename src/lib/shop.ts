// Магазин Флопса — косметические аксессуары, которые покупаются за косточки.
// Аксессуары показываются эмодзи (не требуют отдельных ассетов) и «надеваются»
// на Флопса на главной. Цены растут, чтобы было ради чего копить: дешёвые вещи
// по силам за пару заходов, дорогие — долгая цель.

// Куда вещь надевается на Флопса. На каждый «одиночный» слот (голова/глаза/шея)
// можно надеть только одну вещь; «в лапках» (hold) — сколько угодно.
export type AccessorySlot = "head" | "face" | "neck" | "hold";

export interface Accessory {
  id: string;
  name: string;
  emoji: string; // для текстовой подписи «что надето»
  img: string; // пластилиновый PNG для картинок и «образа»
  price: number;
  slot: AccessorySlot;
}

const SHOP = "/assets/shop";

export const ACCESSORIES: Accessory[] = [
  { id: "cap", name: "Кепка", emoji: "🧢", img: `${SHOP}/cap.webp`, price: 20, slot: "head" },
  { id: "scarf", name: "Шарфик", emoji: "🧣", img: `${SHOP}/scarf.webp`, price: 30, slot: "neck" },
  { id: "glasses", name: "Очки", emoji: "🕶️", img: `${SHOP}/glasses.webp`, price: 45, slot: "face" },
  { id: "bowtie", name: "Бабочка", emoji: "🎀", img: `${SHOP}/bowtie.webp`, price: 60, slot: "neck" },
  { id: "ball", name: "Мячик", emoji: "⚽", img: `${SHOP}/ball.webp`, price: 75, slot: "hold" },
  { id: "backpack", name: "Рюкзак", emoji: "🎒", img: `${SHOP}/backpack.webp`, price: 95, slot: "hold" },
  { id: "camera", name: "Фотоаппарат", emoji: "📸", img: `${SHOP}/camera.webp`, price: 120, slot: "hold" },
  { id: "party", name: "Колпак", emoji: "🥳", img: `${SHOP}/party.webp`, price: 150, slot: "head" },
  { id: "tophat", name: "Цилиндр", emoji: "🎩", img: `${SHOP}/tophat.webp`, price: 180, slot: "head" },
  { id: "medal", name: "Медаль", emoji: "🏅", img: `${SHOP}/medal.webp`, price: 220, slot: "hold" },
  { id: "cape", name: "Плащ", emoji: "🦸", img: `${SHOP}/cape.webp`, price: 280, slot: "neck" },
  { id: "crown", name: "Корона", emoji: "👑", img: `${SHOP}/crown.webp`, price: 350, slot: "head" },
];

/** Slots that hold at most one item (so Flops never wears two hats at once). */
export const SINGLE_SLOTS: AccessorySlot[] = ["head", "face", "neck"];

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
