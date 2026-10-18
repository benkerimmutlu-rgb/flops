export type ContinentId =
  | "europe"
  | "asia"
  | "africa"
  | "north_america"
  | "south_america"
  | "oceania";

export type CategoryId =
  | "loved_it" // Я там был, там круто
  | "never_again" // Я там был — ни ногой больше
  | "want_to_go" // Я там не был и очень хочу
  | "dont_want"; // Я там не был и не хочу

export interface CategoryDef {
  id: CategoryId;
  label: string;
  shortLabel: string;
  emoji: string;
  color: string; // tailwind bg class for chips/badges
}

export interface Phrase {
  id: "hello" | "thanks" | "bye";
  label: string; // "Привет" / "Спасибо" / "Пока" — in Russian, for the UI
  native: string; // written in the country's own script
  translit: string; // latin/readable transliteration
}

export interface FlagCropZone {
  id: string;
  label: string; // what's hidden, e.g. "Зелёная полоса"
  x: number; // percent, 0-100
  y: number;
  w: number;
  h: number;
}

/**
 * Lightweight country record — enough to drive the flag-guessing game and the
 * memory game (flag image + name + continent). The 12 fully-detailed `Country`
 * records are a superset of this; everything else lives only as `CountryLite`.
 */
export interface CountryLite {
  code: string; // ISO-ish short code -> /public/flags/<code>.png
  name: string; // Russian name shown in the UI
  continent: ContinentId;
  /** Palette / pattern tags used to pick visually-confusing wrong answers. */
  flagTags?: string[];
  /** Codes of famous look-alike flags, used first when picking distractors. */
  lookalikes?: string[];
}

export interface Country extends CountryLite {
  code: string; // ISO-ish short code, used in routes: "it", "gb", "se", "es"
  name: string;
  continent: ContinentId;
  capital: string;
  flagMeaning: string;
  dish: {
    name: string;
    recipeShort: string;
  };
  culturalFigure: {
    name: string;
    fact: string;
  };
  language: {
    name: string;
    phrases: Phrase[];
  };
  myth: {
    myth: string;
    reality: string;
  };
  quizCropZones: FlagCropZone[];
}

export interface UserCountryState {
  category: CategoryId | null;
  likeCountry: boolean | null; // true = like, false = dislike, null = no opinion yet
  likeLanguage: boolean | null;
  seen: boolean; // has shown up in the game at least once
  known: boolean; // guessed correctly -> lives in "Знаю"
  inRepeat: boolean; // guessed wrong -> sits in the "Повтори" stack
}
