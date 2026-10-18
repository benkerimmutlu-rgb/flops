"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { UserCountryState } from "./types";

// Client-side, localStorage-backed state for the MVP's "first screens" pass.
// Swap this for real persistence (Postgres, keyed by account) once auth exists —
// the shape (Record<countryCode, UserCountryState>) is designed to map 1:1
// onto a future `user_country_state` table.

type StateMap = Record<string, UserCountryState>;

const STORAGE_KEY = "flops_user_state_v3"; // v3: positive-only visited/wish
const LEGACY_KEY = "flops_user_state_v2"; // v2: had the 4-category system
const BONES_KEY = "flops_bones_v1";

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
  bones: number;
  all: StateMap;
}

const StoreContext = createContext<StoreValue | null>(null);

export function UserStateProvider({ children }: { children: React.ReactNode }) {
  const [map, setMap] = useState<StateMap>({});
  const [bones, setBones] = useState(0);

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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe load
      if (rawBones) setBones(Number(rawBones) || 0);
    } catch {
      // ignore — private mode / blocked storage
    }
  }, []);

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
    }
    return {
      all: map,
      bones,
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
  }, [map, bones]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useUserState() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useUserState must be used within UserStateProvider");
  return ctx;
}
