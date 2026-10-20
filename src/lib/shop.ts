// Магазин Флопса: одежда, мебель и коллекционные вещи за косточки.
// В домике доступны только купленные ID. Снятые с продажи вещи остаются
// у владельца в коллекции и в расстановке комнаты.
//
// Важно: купленное хранится у игрока по id. «Убрать из магазина» = поставить
// вещи `active: false` (или убрать из каталога по интересам): на витрине её не
// видно, но в «Коллекции» у того, кто её купил, она остаётся — навсегда.

export type ShopCategoryId =
  | "things"
  | "sport"
  | "games"
  | "eurovision"
  | "relax"
  | "turkiye"
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
  { id: "eurovision", label: "Eurovision", emoji: "🎤", accent: "#9448C6" },
  { id: "relax", label: "Уют", emoji: "🛋️", accent: "#C8863C" },
  { id: "turkiye", label: "Турция", emoji: "🇹🇷", accent: "#E84A43" },
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

// Цены: пол ~10, потолок 40 за самое классное. Так, чтобы пара вещей была по
// силам, а на крутое нужно было поучиться ещё — вызов, а не «скупить за день».
const L10 = [10, 12, 14, 16, 18, 22, 28, 34, 42, 50];
const L11 = [10, 12, 14, 16, 18, 22, 26, 32, 38, 44, 50];
const L38 = [
  10, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36,
  38, 40, 42, 44, 46, 48, 50, 52, 55, 58, 60,
  34, 50, 60, 50, 28, 44, 38, 50,
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
    const base = ladder[i];
    // На распродаже реально дешевле: платишь ~60%, прежняя цена зачёркнута.
    const price = discount ? Math.max(5, Math.round(base * 0.6)) : base;
    return {
      id,
      name,
      img: `${SHOP}/${cat}/${id}.webp`,
      price,
      ...(discount ? { oldPrice: base } : {}),
      category: cat,
      active: true,
    };
  });
}

export const ACCESSORIES: Accessory[] = [
  // ─── Вещи (базовые) ───
  { id: "ball", name: "Мячик", img: `${SHOP}/ball.webp`, price: 10, category: "things", active: true },
  { id: "bone", name: "Косточка", img: `${SHOP}/bone.webp`, price: 11, category: "things", active: true },
  { id: "glasses", name: "Очки", img: `${SHOP}/glasses.webp`, price: 12, category: "things", active: true },
  { id: "bowl", name: "Миска", img: `${SHOP}/bowl.webp`, price: 14, category: "things", active: true },
  { id: "plant", name: "Растение", img: `${SHOP}/plant.webp`, price: 16, category: "things", active: true },
  { id: "crown", name: "Корона", img: `${SHOP}/crown.webp`, price: 18, category: "things", active: true },
  { id: "backpack", name: "Рюкзак", img: `${SHOP}/backpack.webp`, price: 20, category: "things", active: true },
  { id: "camera", name: "Фотоаппарат", img: `${SHOP}/camera.webp`, price: 22, category: "things", active: true },
  { id: "easel", name: "Мольберт", img: `${SHOP}/easel.webp`, price: 25, category: "things", active: true },
  { id: "plane", name: "Самолётик", img: `${SHOP}/plane.webp`, price: 28, category: "things", active: true },
  { id: "journal", name: "Дневник", img: `${SHOP}/journal.webp`, price: 31, category: "things", active: true },
  { id: "postcards", name: "Открытки", img: `${SHOP}/postcards.webp`, price: 35, category: "things", active: true },
  { id: "globe", name: "Глобус", img: `${SHOP}/globe.webp`, price: 42, category: "things", active: true },
  { id: "chest", name: "Сундук", img: `${SHOP}/chest.webp`, price: 50, category: "things", active: true },
  { id: "trophy", name: "Кубок", img: `${SHOP}/trophy.webp`, price: 60, category: "things", active: true },

  // ─── Спорт 🥊 ───
  ...gen("sport", "sp",
    ["Перчатки", "Гиря", "Гантели", "Кроссовки", "Дорожка", "Груша", "Боксёрки", "Ринг", "Бинты", "Шлем"],
    L10),

  // ─── Игры 🎮 ───
  ...gen("games", "gm",
    ["Бластер", "Звезда-кубок", "Сундук самоцветов", "Самоцветы", "Вертушка", "Кактус", "Ковбойка", "Газировка", "Джойстик", "Боевой автобус", "Неваляшка", "Лама", "Кирка", "Сундук с золотом", "Ящик с припасами", "Бластер-луч", "Портал", "Зельеварня", "НЛО", "Робот", "Самокат", "Бантик", "Планшет", "Микрофон", "Наушники", "Бумбокс", "Диско-шар", "Кроссовки", "Книжка", "Сумочка", "Ноутбук", "PlayStation 5", "Игровой компьютер с подсветкой", "Xbox Series X", "Игровые наушники", "Стол для гейминга", "Игровой монитор", "Игровой стул"],
    L38),

  // ─── Уют 🛋️ ───
  ...gen("relax", "rx",
    ["Кресло", "Какао на столике", "Книжки", "Вязание", "Дневник", "Латте", "Лампа", "Полка", "Пуфик", "Плед"],
    L10),

  // ─── Турция 🇹🇷 ───
  ...gen("turkiye", "tk",
    ["Чай", "Симит", "Назар", "Часовая башня", "Бёрек", "Паром", "Чайка", "Зонтик", "Лукум", "Пальма"],
    L10),

  // ─── Лето ☀️ (скидки) ───
  ...gen("summer", "su",
    ["Ведёрко", "Пляжный мяч", "Ракушка", "Морская звезда", "Круг", "Сёрф", "Зонт", "Замок из песка", "Кокос", "Очки от солнца"],
    L10, true),

  // ─── Хэллоуин 🎃 ───
  ...gen("halloween", "hw",
    ["Шляпа ведьмы", "Очки с мышами", "Плащ вампира", "Бабочка-мышь", "Ведёрко сладостей", "Котёл сладостей", "Метла", "Фонарь Джека", "Привидение", "Тыква-лежанка", "Маска крика"],
    L11),

  // ─── Eurovision: performance props and clay room decorations ───
  { id: "ev_backstage_pass", name: "Пропуск за кулисы", img: `${SHOP}/eurovision/backstage_pass.webp`, price: 16, category: "eurovision", active: true },
  { id: "ev_heart_lightstick", name: "Палочка-сердечко", img: `${SHOP}/eurovision/heart_lightstick.webp`, price: 18, category: "eurovision", active: true },
  { id: "ev_eurovision_flag", name: "Флаг Eurovision", img: `${SHOP}/eurovision/eurovision_flag.webp`, price: 22, category: "eurovision", active: true },
  { id: "ev_eurovision_stage", name: "Сцена Eurovision", img: `${SHOP}/eurovision/eurovision_stage.webp`, price: 60, category: "eurovision", active: true },
  { id: "ev_microphone_trophy", name: "Микрофон-кубок", img: `${SHOP}/eurovision/microphone_trophy.webp`, price: 34, category: "eurovision", active: true },
  { id: "ev_video_camera", name: "Видеокамера", img: `${SHOP}/eurovision/video_camera.webp`, price: 38, category: "eurovision", active: true },
  { id: "ev_eurovision_logo", name: "Вывеска Eurovision", img: `${SHOP}/eurovision/eurovision_logo.webp`, price: 20, category: "eurovision", active: true },
  { id: "ev_golden_star", name: "Звёздный приз", img: `${SHOP}/eurovision/golden_star.webp`, price: 28, category: "eurovision", active: true },
  { id: "ev_music_heart", name: "Музыкальное сердце", img: `${SHOP}/eurovision/music_heart.webp`, price: 14, category: "eurovision", active: true },
  { id: "ev_junior_singer", name: "Фигурка певицы", img: `${SHOP}/eurovision/junior_singer.webp`, price: 24, category: "eurovision", active: true },

  // ─── Legacy: старые аксессуары (их больше не продаём, но у купивших они
  // остаются в «Коллекции» — active:false). Нельзя удалять их id! ───
  { id: "cap", name: "Кепка", img: `${SHOP}/legacy/cap.webp`, price: 20, category: "things", active: false },
  { id: "scarf", name: "Шарфик", img: `${SHOP}/legacy/scarf.webp`, price: 30, category: "things", active: false },
  { id: "bowtie", name: "Бабочка", img: `${SHOP}/legacy/bowtie.webp`, price: 60, category: "things", active: false },
  { id: "party", name: "Колпак", img: `${SHOP}/legacy/party.webp`, price: 150, category: "things", active: false },
  { id: "tophat", name: "Цилиндр", img: `${SHOP}/legacy/tophat.webp`, price: 180, category: "things", active: false },
  { id: "medal", name: "Медаль", img: `${SHOP}/legacy/medal.webp`, price: 220, category: "things", active: false },
  { id: "cape", name: "Плащ", img: `${SHOP}/legacy/cape.webp`, price: 280, category: "things", active: false },
];

// Старые id → новые (хэллоуин переехал с hw_* на hw1..hw11; wizard стал cape).
// Применяется при загрузке купленного, чтобы прошлые покупки не терялись.
const OLD_ID_MAP: Record<string, string> = {
  hw_witch_hat: "hw1",
  hw_bat_glasses: "hw2",
  hw_vampire_cape: "hw3",
  hw_bat_bow: "hw4",
  hw_candy_bucket: "hw5",
  hw_cauldron: "hw6",
  hw_broom: "hw7",
  hw_jack: "hw8",
  hw_ghost: "hw9",
  hw_pumpkin_bed: "hw10",
  wizard: "cape",
};

/** Привести старые id купленного к актуальным (и убрать дубли). */
export function migrateOwnedIds(ids: string[]): string[] {
  const out: string[] = [];
  for (const id of ids) {
    const mapped = OLD_ID_MAP[id] ?? id;
    if (!out.includes(mapped)) out.push(mapped);
  }
  return out;
}

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
