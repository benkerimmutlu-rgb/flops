import { CategoryDef } from "./types";

export const CATEGORIES: CategoryDef[] = [
  {
    id: "loved_it",
    label: "Я там был, там круто",
    shortLabel: "Там круто",
    emoji: "🤩",
    color: "bg-emerald-100 text-emerald-800",
  },
  {
    id: "never_again",
    label: "Я там был — ни ногой больше",
    shortLabel: "Ни ногой",
    emoji: "🙅",
    color: "bg-rose-100 text-rose-800",
  },
  {
    id: "want_to_go",
    label: "Я там не был и очень хочу",
    shortLabel: "Очень хочу",
    emoji: "✨",
    color: "bg-amber-100 text-amber-800",
  },
  {
    id: "dont_want",
    label: "Я там не был и не хочу",
    shortLabel: "Не хочу",
    emoji: "😴",
    color: "bg-slate-100 text-slate-700",
  },
];

export function categoryById(id: string) {
  return CATEGORIES.find((c) => c.id === id);
}
