"use client";

import Link from "next/link";
import { Country } from "@/lib/types";
import { FlagSvg, FLAG_VIEWBOX } from "@/lib/flags";
import { CONTINENT_LABEL } from "@/lib/continents";
import { CATEGORIES } from "@/lib/categories";
import { DISH_EMOJI, FIGURE_EMOJI } from "@/lib/placeholders";
import { speak, LANG_BY_CODE } from "@/lib/speech";
import { useUserState } from "@/lib/store";

export function CountryDetail({ country }: { country: Country }) {
  const ratio = FLAG_VIEWBOX[country.code];
  const lang = LANG_BY_CODE[country.code];
  const { getState, setCategory, toggleLikeCountry, toggleLikeLanguage } =
    useUserState();
  const state = getState(country.code);

  return (
    <div className="flex flex-col gap-8 pb-16">
      <Link href="/flags" className="text-sm font-medium text-stone-500 hover:text-stone-900">
        ← Назад к флагам
      </Link>

      {/* Header */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className="w-full max-w-[220px] overflow-hidden rounded-2xl border border-stone-200 shadow-sm"
          style={{ aspectRatio: `${ratio.w} / ${ratio.h}` }}
        >
          <FlagSvg code={country.code} />
        </div>
        <button
          onClick={() => speak(country.name, lang)}
          className="flex items-center gap-2 text-2xl font-bold text-stone-900"
        >
          🔊 {country.name}
        </button>
        <div className="flex gap-2 text-sm text-stone-500">
          <span className="rounded-full bg-stone-100 px-3 py-1">
            {CONTINENT_LABEL[country.continent]}
          </span>
          <span className="rounded-full bg-stone-100 px-3 py-1">
            Столица: {country.capital}
          </span>
        </div>
      </div>

      {/* Like country / like language */}
      <div className="grid grid-cols-2 gap-3">
        <LikeToggle
          label="Нравится страна?"
          value={state.likeCountry}
          onLike={() => toggleLikeCountry(country.code, true)}
          onDislike={() => toggleLikeCountry(country.code, false)}
        />
        <LikeToggle
          label={`Нравится язык (${country.language.name.toLowerCase()})?`}
          value={state.likeLanguage}
          onLike={() => toggleLikeLanguage(country.code, true)}
          onDislike={() => toggleLikeLanguage(country.code, false)}
        />
      </div>

      {/* Category picker */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-stone-500">Куда положить эту карточку?</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(country.code, c.id)}
              className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-center transition-colors ${
                state.category === c.id
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-200 bg-white hover:bg-stone-100"
              }`}
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-xs font-semibold leading-tight">{c.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Flag meaning */}
      <Section title="Значение флага">
        <p className="text-stone-700">{country.flagMeaning}</p>
      </Section>

      {/* Dish */}
      <Section title="Местное блюдо">
        <div className="flex gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-4xl">
            {DISH_EMOJI[country.code] ?? "🍽️"}
          </div>
          <div>
            <p className="font-semibold text-stone-900">{country.dish.name}</p>
            <p className="text-sm text-stone-600">{country.dish.recipeShort}</p>
          </div>
        </div>
      </Section>

      {/* Cultural figure */}
      <Section title="Культурная личность">
        <div className="flex gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-4xl">
            {FIGURE_EMOJI[country.code] ?? "🌟"}
          </div>
          <div>
            <p className="font-semibold text-stone-900">{country.culturalFigure.name}</p>
            <p className="text-sm text-stone-600">{country.culturalFigure.fact}</p>
          </div>
        </div>
      </Section>

      {/* Language phrases */}
      <Section title={`Язык: ${country.language.name}`}>
        <div className="flex flex-col divide-y divide-stone-100">
          {country.language.phrases.map((p) => (
            <button
              key={p.id}
              onClick={() => speak(p.native, lang)}
              className="flex items-center justify-between py-3 text-left"
            >
              <span className="text-sm font-medium text-stone-500">{p.label}</span>
              <span className="flex items-center gap-2 font-semibold text-stone-900">
                🔊 {p.native}
                <span className="text-sm font-normal text-stone-400">({p.translit})</span>
              </span>
            </button>
          ))}
        </div>
      </Section>

      {/* Myth vs reality */}
      <Section title="Миф и реальность">
        <div className="flex flex-col gap-3">
          <div className="rounded-xl bg-rose-50 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-rose-500">Миф</p>
            <p className="text-sm text-stone-700">{country.myth.myth}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
              Как на самом деле
            </p>
            <p className="text-sm text-stone-700">{country.myth.reality}</p>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-5">
      <h2 className="text-sm font-bold text-stone-900">{title}</h2>
      {children}
    </div>
  );
}

function LikeToggle({
  label,
  value,
  onLike,
  onDislike,
}: {
  label: string;
  value: boolean | null;
  onLike: () => void;
  onDislike: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4">
      <span className="text-xs font-semibold text-stone-500">{label}</span>
      <div className="flex gap-2">
        <button
          onClick={onLike}
          className={`flex-1 rounded-full py-1.5 text-lg ${
            value === true ? "bg-emerald-500 text-white" : "bg-stone-100"
          }`}
          aria-label="Нравится"
        >
          👍
        </button>
        <button
          onClick={onDislike}
          className={`flex-1 rounded-full py-1.5 text-lg ${
            value === false ? "bg-rose-500 text-white" : "bg-stone-100"
          }`}
          aria-label="Не нравится"
        >
          👎
        </button>
      </div>
    </div>
  );
}
