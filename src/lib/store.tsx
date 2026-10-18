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
import { accessoryById, SINGLE_SLOTS, ACCESSORIES } from "./shop";
import { useAuth } from "./auth";
import { getBrowserSupabase } from "./supabase/client";

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

function persistShop(owned: string[], equipped: string[]) {
  try {
    window.localStorage.setItem(SHOP_KEY, JSON.stringify({ owned, equipped }));
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
  /** Correct guess: country becomes "known", leaves the repeat stack, +bones. */
  markCorrect: (code: string, bonesReward?: number) => void;
  /** Wrong guess: country is seen and goes into the "Повтори" stack. */
  markWrong: (code: string) => void;
  /** Take a country out of the repeat stack without marking it known. */
  clearRepeat: (code: string) => void;
  addBones: (n: number) => void;
  /** Spendable bones balance (goes down when buying in the shop). */
  bones: number;
  /** Lifetime bones earned — never decreases; drives Flops's rank. */
  bonesEarned: number;
  /** True once the initial localStorage load has finished (avoids empty snapshots). */
  hydrated: boolean;
  /** Accessory ids the player has bought. */
  owned: string[];
  /** The accessories Flops currently wears (one per single-slot, many "hold"). */
  equipped: string[];
  /** Buy an accessory if affordable and not already owned. */
  buyAccessory: (id: string, price: number) => void;
  /** Wear an owned accessory (or take it off if it's already on). */
  equipAccessory: (id: string) => void;
  all: StateMap;
}

const StoreContext = createContext<StoreValue | null>(null);

export function UserStateProvider({ children }: { children: React.ReactNode }) {
  const [map, setMap] = useState<StateMap>({});
  const [bones, setBones] = useState(0);
  const [bonesEarned, setBonesEarned] = useState(0);
  const [owned, setOwned] = useState<string[]>([]);
  const [equipped, setEquipped] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Облачная синхронизация (когда родитель вошёл и профиль создан).
  const { status: authStatus, user } = useAuth();
  const cloudLoaded = useRef(false);
  const saveTimer = useRef<number | null>(null);

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
          // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time migration
          setMap(migrated);
        }
      }
      const rawBones = window.localStorage.getItem(BONES_KEY);
      const balance = rawBones ? Number(rawBones) || 0 : 0;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe load
      if (rawBones) setBones(balance);
      const rawEarned = window.localStorage.getItem(EARNED_KEY);
      // Older saves have no "earned" total — seed it from the current balance so
      // existing players don't start back at rank zero.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe load
      if (rawEarned) setBonesEarned(Number(rawEarned) || 0);
      else if (balance > 0) {
        persistEarned(balance);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time seed
        setBonesEarned(balance);
      }
      const rawShop = window.localStorage.getItem(SHOP_KEY);
      if (rawShop) {
        const parsed = JSON.parse(rawShop) as {
          owned?: string[];
          equipped?: string | string[] | null;
        };
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe load
        if (Array.isArray(parsed.owned)) setOwned(parsed.owned);
        // Older saves stored a single equipped id (or null); normalize to array.
        const eq = Array.isArray(parsed.equipped)
          ? parsed.equipped
          : parsed.equipped
          ? [parsed.equipped]
          : [];
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe load
        setEquipped(eq);
      }
    } catch {
      // ignore — private mode / blocked storage
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- marks end of hydration
    setHydrated(true);
  }, []);

  // Текущее состояние прогресса одним объектом (для облака).
  function currentBlob() {
    return { countries: map, bones, bonesEarned, owned, equipped };
  }

  // ── Облако: загрузка при входе ──
  // При готовом профиле тянем прогресс из облака. Если в облаке пусто (новый
  // профиль) — поднимаем туда локальный прогресс, чтобы ничего не потерялось.
  useEffect(() => {
    if (authStatus !== "ready" || !user) {
      cloudLoaded.current = false;
      return;
    }
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("state")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;
      const blob = (data?.state ?? {}) as {
        countries?: StateMap;
        bones?: number;
        bonesEarned?: number;
        owned?: string[];
        equipped?: string[];
      };
      const hasCloud =
        !!blob &&
        ((blob.countries && Object.keys(blob.countries).length > 0) ||
          (blob.bonesEarned ?? 0) > 0 ||
          (blob.owned?.length ?? 0) > 0);
      if (hasCloud) {
        const next = normalize(blob.countries ?? {});
        setMap(next);
        persist(next);
        setBones(blob.bones ?? 0);
        setBonesEarned(blob.bonesEarned ?? 0);
        setOwned(blob.owned ?? []);
        setEquipped(blob.equipped ?? []);
      } else {
        await supabase
          .from("profiles")
          .update({ state: currentBlob(), updated_at: new Date().toISOString() })
          .eq("id", user.id);
      }
      cloudLoaded.current = true;
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run on login, not on every edit
  }, [authStatus, user]);

  // ── Облако: сохранение изменений (с задержкой) ──
  useEffect(() => {
    if (authStatus !== "ready" || !user || !cloudLoaded.current) return;
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      supabase
        .from("profiles")
        .update({ state: currentBlob(), updated_at: new Date().toISOString() })
        .eq("id", user.id);
    }, 800);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounced push on state change
  }, [map, bones, bonesEarned, owned, equipped, authStatus, user]);

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
      persistShop(nextOwned, equipped);
      setBones((b) => {
        const next = b - price;
        persistBones(next);
        return next;
      });
    }
    function equipAccessory(id: string) {
      if (!owned.includes(id)) return;
      const acc = accessoryById(id);
      if (!acc) return;
      let next: string[];
      if (equipped.includes(id)) {
        // Take it off.
        next = equipped.filter((x) => x !== id);
      } else if (SINGLE_SLOTS.includes(acc.slot)) {
        // Single slot (head/eyes/neck): swap out whatever else is in that slot.
        const sameSlot = ACCESSORIES.filter((a) => a.slot === acc.slot).map(
          (a) => a.id
        );
        next = [...equipped.filter((x) => !sameSlot.includes(x)), id];
      } else {
        // "Hold" slot: add alongside.
        next = [...equipped, id];
      }
      setEquipped(next);
      persistShop(owned, next);
    }
    return {
      all: map,
      bones,
      bonesEarned,
      hydrated,
      owned,
      equipped,
      buyAccessory,
      equipAccessory,
      getState: (code) => map[code] ?? EMPTY_STATE,
      setVisited: (code, value) => update(code, { visited: value }),
      setWish: (code, value) => update(code, { wish: value }),
      toggleLikeCountry: (code, value) => update(code, { likeCountry: value }),
      toggleLikeLanguage: (code, value) => update(code, { likeLanguage: value }),
      markCorrect: (code, bonesReward = 1) => {
        update(code, { seen: true, known: true, inRepeat: false });
        giveBones(bonesReward);
      },
      markWrong: (code) => update(code, { seen: true, inRepeat: true }),
      clearRepeat: (code) => update(code, { inRepeat: false }),
      addBones: giveBones,
    };
  }, [map, bones, bonesEarned, hydrated, owned, equipped]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useUserState() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useUserState must be used within UserStateProvider");
  return ctx;
}
