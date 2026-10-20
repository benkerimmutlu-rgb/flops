"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { UserCountryState } from "./types";
import { useAuth } from "./auth";
import { getBrowserSupabase } from "./supabase/client";
import { migrateOwnedIds } from "./shop";
import { emptyRoom, newerRoom, normalizeRoom, type RoomSnapshot } from "./room";

// Client-side, localStorage-backed state for the MVP's "first screens" pass.
// Swap this for real persistence (Postgres, keyed by account) once auth exists —
// the shape (Record<countryCode, UserCountryState>) is designed to map 1:1
// onto a future `user_country_state` table.

type StateMap = Record<string, UserCountryState>;

const STORAGE_KEY = "flops_user_state_v3"; // v3: positive-only visited/wish
const LEGACY_KEY = "flops_user_state_v2"; // v2: had the 4-category system
const BONES_KEY = "flops_bones_v1"; // spendable balance
const EARNED_KEY = "flops_bones_earned_v1"; // lifetime earned (drives rank)
const SHOP_KEY = "flops_shop_v1"; // { owned: string[], equipped: string | null }
const EARN_KEY = "flops_earn_v1"; // { date: "YYYY-MM-DD", today: number } — дневная отдача
const GIFT_KEY = "flops_gift_coconut_v1"; // подарок-извинение выдан на этом устройстве
const ROOM_KEY = "flops_room_v1";
const GIFT_ID = "su9"; // Кокос из коллекции «Лето»

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
// Награда за ответ по тому, сколько уже заработано сегодня (убывающая отдача).
function rewardFor(earnedToday: number): number {
  if (earnedToday < 12) return 3;
  if (earnedToday < 30) return 2;
  return 1;
}

const EMPTY_STATE: UserCountryState = {
  visited: false,
  wish: false,
  likeCountry: null,
  likeLanguage: null,
  seen: false,
  known: false,
  inRepeat: false,
};

// Older saves (or partial writes) may miss some booleans — merge defaults so the
// rest of the app can treat every field as present.
function normalize(raw: unknown): StateMap {
  if (!raw || typeof raw !== "object") return {};
  const out: StateMap = {};
  for (const [code, value] of Object.entries(raw as Record<string, unknown>)) {
    out[code] = { ...EMPTY_STATE, ...(value as Partial<UserCountryState>) };
  }
  return out;
}

// v2 → v3: drop the negative buckets, keep only positive intent.
//   loved_it (был, круто) → visited + wish
//   want_to_go (не был, хочу) → wish
//   never_again (был, не хочу) → visited (neutral, no negativity kept)
//   dont_want (не был, не хочу) → nothing
function migrateLegacy(raw: unknown): StateMap {
  if (!raw || typeof raw !== "object") return {};
  const out: StateMap = {};
  for (const [code, v] of Object.entries(raw as Record<string, unknown>)) {
    const old = v as Partial<UserCountryState> & { category?: string };
    const visited = old.category === "loved_it" || old.category === "never_again";
    const wish = old.category === "loved_it" || old.category === "want_to_go";
    out[code] = {
      ...EMPTY_STATE,
      visited,
      wish,
      likeCountry: old.likeCountry ?? null,
      likeLanguage: old.likeLanguage ?? null,
      seen: old.seen ?? false,
      known: old.known ?? false,
      inRepeat: old.inRepeat ?? false,
    };
  }
  return out;
}

// Слить две карты прогресса без потерь: по каждой стране логическое ИЛИ флагов,
// а для мнений — любое ненулевое. Так синхронизация с облаком никогда не
// «теряет» прогресс, а только дополняет.
function mergeStateMaps(a: StateMap, b: StateMap): StateMap {
  const out: StateMap = {};
  const codes = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const code of codes) {
    const x = a[code] ?? EMPTY_STATE;
    const y = b[code] ?? EMPTY_STATE;
    out[code] = {
      visited: x.visited || y.visited,
      wish: x.wish || y.wish,
      seen: x.seen || y.seen,
      known: x.known || y.known,
      inRepeat: x.inRepeat || y.inRepeat,
      likeCountry: x.likeCountry ?? y.likeCountry,
      likeLanguage: x.likeLanguage ?? y.likeLanguage,
    };
  }
  return out;
}

function persist(next: StateMap) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore — private mode / blocked storage
  }
}

function persistBones(n: number) {
  try {
    window.localStorage.setItem(BONES_KEY, String(n));
  } catch {
    // ignore
  }
}

function persistEarned(n: number) {
  try {
    window.localStorage.setItem(EARNED_KEY, String(n));
  } catch {
    // ignore
  }
}

function persistShop(owned: string[]) {
  try {
    window.localStorage.setItem(SHOP_KEY, JSON.stringify({ owned }));
  } catch {
    // ignore
  }
}

interface StoreValue {
  getState: (code: string) => UserCountryState;
  /** "Я тут был" — neutral; drives the visited-% and the world map. */
  setVisited: (code: string, value: boolean) => void;
  /** "Мечтаю побывать" — a dream country. */
  setWish: (code: string, value: boolean) => void;
  toggleLikeCountry: (code: string, value: boolean) => void;
  toggleLikeLanguage: (code: string, value: boolean) => void;
  /** Correct guess: country becomes "known", leaves the repeat stack (no bones). */
  markCorrect: (code: string) => void;
  /** Wrong guess: country is seen and goes into the "Повтори" stack. */
  markWrong: (code: string) => void;
  /** Take a country out of the repeat stack without marking it known. */
  clearRepeat: (code: string) => void;
  addBones: (n: number) => void;
  /**
   * Награда за правильный ответ с убывающей за день отдачей (первые ответы
   * ценнее). Начисляет и возвращает, сколько косточек дано. Сбрасывается каждый
   * день — так награждается регулярность, а не один марафон.
   */
  earnReward: () => number;
  /** Spendable bones balance (goes down when buying in the shop). */
  bones: number;
  /** Lifetime bones earned — never decreases; drives Flops's rank. */
  bonesEarned: number;
  /** True once the initial localStorage load has finished (avoids empty snapshots). */
  hydrated: boolean;
  /** Показать разовое окно-извинение с подарком (кокос) от FLOPS. */
  giftPending: boolean;
  /** Закрыть окно подарка. */
  dismissGift: () => void;
  /** Item ids the player has bought (collection). */
  owned: string[];
  /** Buy a shop item if affordable and not already owned. */
  buyAccessory: (id: string, price: number) => void;
  roomData: RoomSnapshot;
  roomHydrated: boolean;
  setRoomData: (snapshot: RoomSnapshot) => void;
  all: StateMap;
}

const StoreContext = createContext<StoreValue | null>(null);

export function UserStateProvider({ children }: { children: React.ReactNode }) {
  const [map, setMap] = useState<StateMap>({});
  const [bones, setBones] = useState(0);
  const [bonesEarned, setBonesEarned] = useState(0);
  const [owned, setOwned] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [roomData, setRoomDataState] = useState<RoomSnapshot>(emptyRoom);
  const [roomHydrated, setRoomHydrated] = useState(false);
  const roomScope = useRef("guest");
  const roomRef = useRef(roomData);
  const [giftPending, setGiftPending] = useState(false);

  // Облачная синхронизация (когда родитель вошёл и профиль создан).
  const { status: authStatus, user } = useAuth();
  const cloudLoaded = useRef(false);
  const saveTimer = useRef<number | null>(null);
  // Дневная отдача (не часть основного прогресса — только для начисления).
  const earnedToday = useRef(0);
  const earnDate = useRef(todayStr());
  // Актуальные значения для асинхронного слияния с облаком (без устаревших замыканий).
  const mapRef = useRef(map);
  const bonesRef = useRef(bones);
  const bonesEarnedRef = useRef(bonesEarned);
  const ownedRef = useRef(owned);
  useEffect(() => {
    roomRef.current = roomData;
    mapRef.current = map;
    bonesRef.current = bones;
    bonesEarnedRef.current = bonesEarned;
    ownedRef.current = owned;
  }, [roomData, map, bones, bonesEarned, owned]);

  // Reading localStorage during render would desync server/client HTML on
  // hydration (the server has no browser storage to read), so this loads
  // one frame late, after mount, instead of via a lazy useState initializer.
  // Persistence itself does NOT live in a second effect watching `map` —
  // that shape lets an effect's stale closure overwrite real data mid-load
  // (it actually happened here under Strict Mode's double effect-invoke).
  // Each setter below persists the value it just computed instead.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe load
        setMap(normalize(JSON.parse(raw)));
      } else {
        // First run on v3 — migrate an old v2 save if present.
        const legacy = window.localStorage.getItem(LEGACY_KEY);
        if (legacy) {
          const migrated = migrateLegacy(JSON.parse(legacy));
          persist(migrated);

          setMap(migrated);
        }
      }
      const rawBones = window.localStorage.getItem(BONES_KEY);
      const balance = rawBones ? Number(rawBones) || 0 : 0;

      if (rawBones) setBones(balance);
      const rawEarned = window.localStorage.getItem(EARNED_KEY);
      // Older saves have no "earned" total — seed it from the current balance so
      // existing players don't start back at rank zero.

      if (rawEarned) setBonesEarned(Number(rawEarned) || 0);
      else if (balance > 0) {
        persistEarned(balance);

        setBonesEarned(balance);
      }
      let loadedOwned: string[] = [];
      const rawShop = window.localStorage.getItem(SHOP_KEY);
      if (rawShop) {
        const parsed = JSON.parse(rawShop) as { owned?: string[] };
        if (Array.isArray(parsed.owned)) loadedOwned = migrateOwnedIds(parsed.owned);
      }
      // Подарок-извинение за сбой: один раз на устройство дарим кокос.
      if (!window.localStorage.getItem(GIFT_KEY)) {
        if (!loadedOwned.includes(GIFT_ID)) loadedOwned = [...loadedOwned, GIFT_ID];
        window.localStorage.setItem(GIFT_KEY, "1");

        setGiftPending(true);
      }

      setOwned(loadedOwned);
      persistShop(loadedOwned);
      const rawEarn = window.localStorage.getItem(EARN_KEY);
      if (rawEarn) {
        const e = JSON.parse(rawEarn) as { date?: string; today?: number };
        if (e.date === todayStr()) {
          earnedToday.current = e.today ?? 0;
          earnDate.current = e.date;
        }
      }
    } catch {
      // ignore — private mode / blocked storage
    }

    setHydrated(true);
  }, []);

  // Each account keeps its own room; guest layouts never overwrite another account.
  useEffect(() => {
    if (authStatus === "loading") return;
    const scope = user?.id ?? "guest";
    roomScope.current = scope;
    let saved = emptyRoom();
    try { saved = normalizeRoom(JSON.parse(localStorage.getItem(`${ROOM_KEY}:${scope}`) || "null")); } catch { /* empty room */ }
    roomRef.current = saved;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- account-scoped browser hydration
    setRoomDataState(saved);
    setRoomHydrated(true);
  }, [authStatus, user?.id]);

  // Текущее состояние прогресса одним объектом (для облака).
  function currentBlob() {
    return { countries: map, bones, bonesEarned, owned, roomData };
  }

  // ── Облако: СЛИЯНИЕ при входе (не перезапись!) ──
  // Берём объединение купленного и прогресса из облака и с устройства, чтобы
  // ни одна покупка и ни один флаг не пропали из-за гонки или пустого облака.
  // Затем эффект сохранения зальёт объединённое обратно в облако.
  useEffect(() => {
    cloudLoaded.current = false;
    if (authStatus !== "ready" || !user) {
      cloudLoaded.current = false;
      return;
    }
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("state")
        .eq("id", user.id)
        .maybeSingle();
      if (!active || error) return;
      const blob = (data?.state ?? {}) as {
        countries?: StateMap;
        bones?: number;
        bonesEarned?: number;
        owned?: string[];
        roomData?: RoomSnapshot;
      };
      // Купленное — объединение (и с миграцией старых id).
      const mergedOwned = Array.from(
        new Set([
          ...migrateOwnedIds(ownedRef.current),
          ...migrateOwnedIds(blob.owned ?? []),
        ])
      );
      setOwned(mergedOwned);
      persistShop(mergedOwned);
      const mergedRoom = newerRoom(roomRef.current, blob.roomData);
      roomRef.current = mergedRoom;
      setRoomDataState(mergedRoom);
      try { localStorage.setItem(`${ROOM_KEY}:${user.id}`, JSON.stringify(mergedRoom)); } catch { /* storage unavailable */ }
      // Страны — слияние флагов.
      const mergedMap = mergeStateMaps(
        mapRef.current,
        normalize(blob.countries ?? {})
      );
      setMap(mergedMap);
      persist(mergedMap);
      // Косточки — максимум (чтобы не потерять заработанное).
      setBones(Math.max(bonesRef.current, blob.bones ?? 0));
      setBonesEarned(Math.max(bonesEarnedRef.current, blob.bonesEarned ?? 0));
      cloudLoaded.current = true;
    })().catch(() => console.warn("FLOPS: cloud unavailable; local progress retained"));
    return () => {
      active = false;
    };

  }, [authStatus, user]);

  // ── Облако: сохранение изменений (с задержкой) ──
  useEffect(() => {
    if (authStatus !== "ready" || !user || !cloudLoaded.current || !roomHydrated || roomScope.current !== user.id) return;
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      void (async () => {
        const { error } = await supabase.from("profiles")
          .update({ state: currentBlob(), updated_at: new Date().toISOString() })
          .eq("id", user.id);
        if (error) console.warn("FLOPS: cloud save failed; local progress retained");
      })().catch(() => console.warn("FLOPS: cloud unavailable; local progress retained"));
    }, 800);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounced push on state change
  }, [map, bones, bonesEarned, owned, roomData, roomHydrated, authStatus, user]);

  const value = useMemo<StoreValue>(() => {
    function update(code: string, patch: Partial<UserCountryState>) {
      setMap((m) => {
        const next = { ...m, [code]: { ...(m[code] ?? EMPTY_STATE), ...patch } };
        persist(next);
        return next;
      });
    }
    function giveBones(n: number) {
      if (n <= 0) return;
      setBones((b) => {
        const next = b + n;
        persistBones(next);
        return next;
      });
      setBonesEarned((e) => {
        const next = e + n;
        persistEarned(next);
        return next;
      });
    }
    function buyAccessory(id: string, price: number) {
      if (owned.includes(id) || bones < price) return;
      const nextOwned = [...owned, id];
      setOwned(nextOwned);
      persistShop(nextOwned);
      setBones((b) => {
        const next = b - price;
        persistBones(next);
        return next;
      });
    }
    function earnReward() {
      const today = todayStr();
      if (earnDate.current !== today) {
        earnDate.current = today;
        earnedToday.current = 0;
      }
      const reward = rewardFor(earnedToday.current);
      earnedToday.current += reward;
      try {
        window.localStorage.setItem(
          EARN_KEY,
          JSON.stringify({ date: today, today: earnedToday.current })
        );
      } catch {
        // ignore
      }
      giveBones(reward);
      return reward;
    }
    return {
      roomData,
      roomHydrated,
      setRoomData: (snapshot: RoomSnapshot) => {
        const next = normalizeRoom(snapshot);
        roomRef.current = next;
        setRoomDataState(next);
        try { localStorage.setItem(`${ROOM_KEY}:${roomScope.current}`, JSON.stringify(next)); } catch { /* storage unavailable */ }
      },
      all: map,
      bones,
      bonesEarned,
      hydrated,
      giftPending,
      dismissGift: () => setGiftPending(false),
      owned,
      buyAccessory,
      getState: (code) => map[code] ?? EMPTY_STATE,
      setVisited: (code, value) => update(code, { visited: value }),
      setWish: (code, value) => update(code, { wish: value }),
      toggleLikeCountry: (code, value) => update(code, { likeCountry: value }),
      toggleLikeLanguage: (code, value) => update(code, { likeLanguage: value }),
      markCorrect: (code) =>
        update(code, { seen: true, known: true, inRepeat: false }),
      markWrong: (code) => update(code, { seen: true, inRepeat: true }),
      clearRepeat: (code) => update(code, { inRepeat: false }),
      addBones: giveBones,
      earnReward,
    };
  }, [map, bones, bonesEarned, hydrated, giftPending, owned, roomData, roomHydrated]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useUserState() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useUserState must be used within UserStateProvider");
  return ctx;
}
