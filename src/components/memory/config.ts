import { GameContinent } from "@/lib/data";

export type Difficulty = "easy" | "medium" | "hard" | "expert";

export interface DifficultyConfig {
  id: Difficulty;
  label: string; // RU label for the setup chip
  cols: number; // grid columns (kept ≤4 so cards stay tappable on a phone)
  rows: number;
  pairs: number; // cols*rows / 2
  peekMs: number; // how long the whole board stays open before Flops covers it
}

// Board sizes from the agreed plan: 2×3 / 3×4 / 4×4 / 4×5. Columns are capped at
// 4 for phones; the "N×M" in the plan is expressed as cols×rows here.
export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: { id: "easy", label: "Лёгкий", cols: 2, rows: 3, pairs: 3, peekMs: 3000 },
  medium: { id: "medium", label: "Средний", cols: 3, rows: 4, pairs: 6, peekMs: 4000 },
  hard: { id: "hard", label: "Сложный", cols: 4, rows: 4, pairs: 8, peekMs: 5000 },
  expert: { id: "expert", label: "Эксперт", cols: 4, rows: 5, pairs: 10, peekMs: 5000 },
};

export const DIFFICULTY_ORDER: Difficulty[] = ["easy", "medium", "hard", "expert"];

export const CONTINENTS: { id: GameContinent; label: string }[] = [
  { id: "all", label: "Весь мир" },
  { id: "europe", label: "Европа" },
  { id: "asia", label: "Азия" },
  { id: "africa", label: "Африка" },
  { id: "america", label: "Америка" },
];
