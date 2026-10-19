// Магазин Флопса — коллекционные «вещи» (не одежда), которые покупаются за
// косточки. В витрине вещь серая (не куплена) и становится цветной после
// покупки. На мопса ничего не надевается. Цены растут, чтобы было ради чего
// копить: дешёвые по силам за пару заходов, дорогие — долгая цель.

// Категории-вкладки магазина. Масштабируется: добавил новую категорию (сезон)
// — появилась новая вкладка. Купленное из любой категории собирается в «Коллекции».
export type ShopCategoryId = "things" | "halloween";

export interface ShopCategory {
  id: ShopCategoryId;
  label: string;
  emoji: string;
  accent: string; // цветовой акцент вкладки
}

export const SHOP_CATEGORIES: ShopCategory[] = [
  { id: "things", label: "Вещи", emoji: "🎒", accent: "var(--green)" },
  { id: "halloween", label: "Хэллоуин", emoji: "🎃", accent: "#E8894A" },
];

export interface Accessory {
  id: string;
  name: string;
  img: string; // пластилиновый PNG вещи
  price: number;
  category: ShopCategoryId;
}

const SHOP = "/assets/shop";
const HW = "/assets/shop/halloween";

export const ACCESSORIES: Accessory[] = [
  // ─── Обычные вещи ───
  { id: "ball", name: "Мячик", img: `${SHOP}/ball.webp`, price: 20, category: "things" },
  { id: "bone", name: "Косточка", img: `${SHOP}/bone.webp`, price: 30, category: "things" },
  { id: "glasses", name: "Очки", img: `${SHOP}/glasses.webp`, price: 45, category: "things" },
  { id: "bowl", name: "Миска", img: `${SHOP}/bowl.webp`, price: 60, category: "things" },
  { id: "plant", name: "Растение", img: `${SHOP}/plant.webp`, price: 75, category: "things" },
  { id: "crown", name: "Корона", img: `${SHOP}/crown.webp`, price: 95, category: "things" },
  { id: "backpack", name: "Рюкзак", img: `${SHOP}/backpack.webp`, price: 120, category: "things" },
  { id: "camera", name: "Фотоаппарат", img: `${SHOP}/camera.webp`, price: 150, category: "things" },
  { id: "easel", name: "Мольберт", img: `${SHOP}/easel.webp`, price: 180, category: "things" },
  { id: "plane", name: "Самолётик", img: `${SHOP}/plane.webp`, price: 220, category: "things" },
  { id: "journal", name: "Дневник", img: `${SHOP}/journal.webp`, price: 280, category: "things" },
  { id: "postcards", name: "Открытки", img: `${SHOP}/postcards.webp`, price: 350, category: "things" },
  { id: "globe", name: "Глобус", img: `${SHOP}/globe.webp`, price: 450, category: "things" },
  { id: "chest", name: "Сундук", img: `${SHOP}/chest.webp`, price: 550, category: "things" },
  { id: "trophy", name: "Кубок", img: `${SHOP}/trophy.webp`, price: 700, category: "things" },

  // ─── Сезонные: Хэллоуин 🎃 ───
  { id: "hw_ghost", name: "Привидение", img: `${HW}/ghost.webp`, price: 40, category: "halloween" },
  { id: "hw_bat_glasses", name: "Очки с мышами", img: `${HW}/bat_glasses.webp`, price: 60, category: "halloween" },
  { id: "hw_bat_bow", name: "Бабочка-мышь", img: `${HW}/bat_bow.webp`, price: 80, category: "halloween" },
  { id: "hw_broom", name: "Метла", img: `${HW}/broom.webp`, price: 110, category: "halloween" },
  { id: "hw_witch_hat", name: "Шляпа ведьмы", img: `${HW}/witch_hat.webp`, price: 140, category: "halloween" },
  { id: "hw_vampire_cape", name: "Плащ вампира", img: `${HW}/vampire_cape.webp`, price: 180, category: "halloween" },
  { id: "hw_candy_bucket", name: "Ведёрко сладостей", img: `${HW}/candy_bucket.webp`, price: 230, category: "halloween" },
  { id: "hw_cauldron", name: "Котёл сладостей", img: `${HW}/cauldron.webp`, price: 300, category: "halloween" },
  { id: "hw_pumpkin_bed", name: "Тыква-лежанка", img: `${HW}/pumpkin_bed.webp`, price: 400, category: "halloween" },
  { id: "hw_jack", name: "Фонарь Джека", img: `${HW}/jack_lantern.webp`, price: 500, category: "halloween" },
];

export function itemsByCategory(cat: ShopCategoryId): Accessory[] {
  return ACCESSORIES.filter((a) => a.category === cat).sort((x, y) => x.price - y.price);
}

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
