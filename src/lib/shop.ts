// Магазин Флопса — коллекционные «вещи» (не одежда), которые покупаются за
// косточки. В витрине вещь серая (силуэт); цвет открывается в «Коллекции»
// после покупки. Цены низкие и достижимые — лучше чаще добавлять новые вещи.
//
// Важно: купленное хранится у игрока по id. «Убрать из магазина» = поставить
// вещи `active: false` (или убрать из каталога по интересам): на витрине её не
// видно, но в «Коллекции» у того, кто её купил, она остаётся — навсегда.

export type ShopCategoryId =
  | "things"
  | "sport"
  | "games"
  | "relax"
  | "summer"
  | "halloween";

export interface ShopCategory {
  id: ShopCategoryId;
  label: string;
  emoji: string;
  accent: string;
}

// Порядок = порядок вкладок. Добавить раздел «по интересам» — просто дописать
// сюда категорию и вещи ниже; пустые категории на витрине не показываются.
export const SHOP_CATEGORIES: ShopCategory[] = [
  { id: "things", label: "Вещи", emoji: "🎒", accent: "var(--green)" },
  { id: "sport", label: "Спорт", emoji: "🥊", accent: "#E84A43" },
  { id: "games", label: "Игры", emoji: "🎮", accent: "#8257E6" },
  { id: "relax", label: "Уют", emoji: "🛋️", accent: "#C8863C" },
  { id: "summer", label: "Лето", emoji: "☀️", accent: "#F6C742" },
  { id: "halloween", label: "Хэллоуин", emoji: "🎃", accent: "#E8894A" },
];

export interface Accessory {
  id: string;
  name: string;
  img: string;
  price: number;
  oldPrice?: number; // если задана — показываем как скидку (зачёркнуто)
  category: ShopCategoryId;
  active: boolean; // false = убрана с витрины, но остаётся у купивших
}

const SHOP = "/assets/shop";

// Низкие, «детские» лесенки цен.
const L10 = [3, 4, 5, 6, 8, 10, 12, 15, 18, 22];
const L11 = [3, 4, 5, 6, 8, 10, 12, 15, 18, 22, 26];
const L30 = [
  3, 3, 4, 4, 5, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 26,
  28, 30, 32, 35, 38, 42, 46, 50,
];

/** Собрать вещи категории из подпапки /assets/shop/<cat>/<prefix><n>.webp. */
function gen(
  cat: ShopCategoryId,
  prefix: string,
  names: string[],
  ladder: number[],
  discount = false
): Accessory[] {
  return names.map((name, i) => {
    const id = `${prefix}${i + 1}`;
    const price = ladder[i];
    return {
      id,
      name,
      img: `${SHOP}/${cat}/${id}.webp`,
      price,
      ...(discount ? { oldPrice: Math.round(price * 1.7) } : {}),
      category: cat,
      active: true,
    };
  });
}

export const ACCESSORIES: Accessory[] = [
  // ─── Вещи (базовые) ───
  { id: "ball", name: "Мячик", img: `${SHOP}/ball.webp`, price: 3, category: "things", active: true },
  { id: "bone", name: "Косточка", img: `${SHOP}/bone.webp`, price: 4, category: "things", active: true },
  { id: "glasses", name: "Очки", img: `${SHOP}/glasses.webp`, price: 5, category: "things", active: true },
  { id: "bowl", name: "Миска", img: `${SHOP}/bowl.webp`, price: 6, category: "things", active: true },
  { id: "plant", name: "Растение", img: `${SHOP}/plant.webp`, price: 8, category: "things", active: true },
  { id: "crown", name: "Корона", img: `${SHOP}/crown.webp`, price: 10, category: "things", active: true },
  { id: "backpack", name: "Рюкзак", img: `${SHOP}/backpack.webp`, price: 12, category: "things", active: true },
  { id: "camera", name: "Фотоаппарат", img: `${SHOP}/camera.webp`, price: 14, category: "things", active: true },
  { id: "easel", name: "Мольберт", img: `${SHOP}/easel.webp`, price: 16, category: "things", active: true },
  { id: "plane", name: "Самолётик", img: `${SHOP}/plane.webp`, price: 18, category: "things", active: true },
  { id: "journal", name: "Дневник", img: `${SHOP}/journal.webp`, price: 20, category: "things", active: true },
  { id: "postcards", name: "Открытки", img: `${SHOP}/postcards.webp`, price: 24, category: "things", active: true },
  { id: "globe", name: "Глобус", img: `${SHOP}/globe.webp`, price: 28, category: "things", active: true },
  { id: "chest", name: "Сундук", img: `${SHOP}/chest.webp`, price: 32, category: "things", active: true },
  { id: "trophy", name: "Кубок", img: `${SHOP}/trophy.webp`, price: 38, category: "things", active: true },

  // ─── Спорт 🥊 ───
  ...gen("sport", "sp",
    ["Перчатки", "Гиря", "Гантели", "Кроссовки", "Дорожка", "Груша", "Боксёрки", "Ринг", "Бинты", "Шлем"],
    L10),

  // ─── Игры 🎮 ───
  ...gen("games", "gm",
    ["Бластер", "Звезда-кубок", "Сундук самоцветов", "Самоцветы", "Вертушка", "Кактус", "Ковбойка", "Газировка", "Джойстик", "Боевой автобус", "Неваляшка", "Лама", "Кирка", "Сундук с золотом", "Ящик с припасами", "Бластер-луч", "Портал", "Зельеварня", "НЛО", "Робот", "Самокат", "Бантик", "Планшет", "Микрофон", "Наушники", "Бумбокс", "Диско-шар", "Кроссовки", "Книжка", "Сумочка"],
    L30),

  // ─── Уют 🛋️ ───
  ...gen("relax", "rx",
    ["Кресло", "Какао на столике", "Книжки", "Вязание", "Дневник", "Латте", "Лампа", "Полка", "Пуфик", "Плед"],
    L10),

  // ─── Лето ☀️ (скидки) ───
  ...gen("summer", "su",
    ["Ведёрко", "Пляжный мяч", "Ракушка", "Морская звезда", "Круг", "Сёрф", "Зонт", "Замок из песка", "Кокос", "Очки от солнца"],
    L10, true),

  // ─── Хэллоуин 🎃 ───
  ...gen("halloween", "hw",
    ["Шляпа ведьмы", "Очки с мышами", "Плащ вампира", "Бабочка-мышь", "Ведёрко сладостей", "Котёл сладостей", "Метла", "Фонарь Джека", "Привидение", "Тыква-лежанка", "Маска крика"],
    L11),
];

/** Активные вещи категории (то, что показываем на витрине), по возрастанию цены. */
export function itemsByCategory(cat: ShopCategoryId): Accessory[] {
  return ACCESSORIES.filter((a) => a.category === cat && a.active).sort(
    (x, y) => x.price - y.price
  );
}

/** Категории, в которых сейчас есть активные вещи (пустые не показываем). */
export function activeCategories(): ShopCategory[] {
  return SHOP_CATEGORIES.filter((c) => itemsByCategory(c.id).length > 0);
}

// По id ищем в ПОЛНОМ каталоге — чтобы купленная, но убранная с витрины вещь
// всё равно находилась и показывалась в «Коллекции».
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
