"use client";

import { COUNTRIES } from "@/lib/data";
import { FlagSvg, FLAG_VIEWBOX } from "@/lib/flags";
import { CATEGORIES } from "@/lib/categories";
import { CategoryId } from "@/lib/types";
import { useUserState } from "@/lib/store";

export default function CategoriesPage() {
  const { all, setCategory } = useUserState();

  const unsorted = COUNTRIES.filter((c) => !all[c.code]?.category);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Категории</h1>
        <p className="text-sm text-stone-500">
          Карточки флагов, разложенные по тому, что вы о них думаете. Можно
          перекладывать между категориями в любой момент.
        </p>
      </div>

      {unsorted.length > 0 && (
        <Bucket
          title="Ещё не разобрано"
          emoji="📥"
          countries={unsorted.map((c) => c.code)}
          onMove={(code, cat) => setCategory(code, cat)}
        />
      )}

      {CATEGORIES.map((cat) => {
        const codes = COUNTRIES.filter((c) => all[c.code]?.category === cat.id).map(
          (c) => c.code
        );
        return (
          <Bucket
            key={cat.id}
            title={cat.label}
            emoji={cat.emoji}
            countries={codes}
            onMove={(code, newCat) => setCategory(code, newCat)}
          />
        );
      })}
    </div>
  );
}

function Bucket({
  title,
  emoji,
  countries,
  onMove,
}: {
  title: string;
  emoji: string;
  countries: string[];
  onMove: (code: string, cat: CategoryId) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-sm font-bold text-stone-700">
        <span className="text-lg">{emoji}</span> {title}
        <span className="text-stone-400">({countries.length})</span>
      </h2>

      {countries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-200 px-4 py-3 text-sm text-stone-400">
          Пока пусто
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white">
          {countries.map((code) => {
            const country = COUNTRIES.find((c) => c.code === code)!;
            const ratio = FLAG_VIEWBOX[code];
            return (
              <div key={code} className="flex items-center gap-3 px-4 py-3">
                <div
                  className="h-8 w-12 shrink-0 overflow-hidden rounded-md border border-stone-200"
                  style={{ aspectRatio: `${ratio.w} / ${ratio.h}` }}
                >
                  <FlagSvg code={code} />
                </div>
                <span className="flex-1 text-sm font-semibold text-stone-900">
                  {country.name}
                </span>
                <div className="flex gap-1">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      title={c.label}
                      onClick={() => onMove(code, c.id)}
                      className="rounded-full px-1.5 py-1 text-sm hover:bg-stone-100"
                    >
                      {c.emoji}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
