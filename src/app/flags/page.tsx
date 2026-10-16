"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { COUNTRIES, randomCountry } from "@/lib/data";
import { FlagSvg, FLAG_VIEWBOX } from "@/lib/flags";
import { Country, FlagCropZone } from "@/lib/types";
import { speak, LANG_BY_CODE } from "@/lib/speech";

type Mode = "cards" | "quiz";

export default function LearnFlagsPage() {
  const [mode, setMode] = useState<Mode>("cards");
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [revealed, setRevealed] = useState(false);

  // Randomize after mount: picking a random card is inherently impure, and
  // doing it during the initial render would make server and client HTML
  // disagree (hydration mismatch) and trip Next's prerender-stability check.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional randomize-after-mount
    setCountry(randomCountry());
  }, []);

  function next() {
    setCountry((prev) => randomCountry(prev.code));
    setRevealed(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Учи Флаги</h1>
        <div className="flex gap-1 rounded-full bg-stone-200 p-1">
          <button
            onClick={() => setMode("cards")}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              mode === "cards" ? "bg-white shadow-sm" : "text-stone-600"
            }`}
          >
            Карточки
          </button>
          <button
            onClick={() => setMode("quiz")}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              mode === "quiz" ? "bg-white shadow-sm" : "text-stone-600"
            }`}
          >
            Викторина
          </button>
        </div>
      </div>

      {mode === "cards" ? (
        <FlashCard country={country} revealed={revealed} onReveal={() => setRevealed(true)} onNext={next} />
      ) : (
        <QuizCard key={country.code} country={country} onNext={next} />
      )}

      <p className="text-center text-xs text-stone-400">
        Страны показываются вперемешку, вне зависимости от того, были вы там
        или нет.
      </p>
    </div>
  );
}

function FlashCard({
  country,
  revealed,
  onReveal,
  onNext,
}: {
  country: Country;
  revealed: boolean;
  onReveal: () => void;
  onNext: () => void;
}) {
  const ratio = FLAG_VIEWBOX[country.code];
  return (
    <div className="flex flex-col items-center gap-5 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
      <div
        className="w-full max-w-xs overflow-hidden rounded-2xl border border-stone-200 shadow-inner"
        style={{ aspectRatio: `${ratio.w} / ${ratio.h}` }}
      >
        <FlagSvg code={country.code} />
      </div>

      {revealed ? (
        <button
          onClick={() => speak(country.name, LANG_BY_CODE[country.code])}
          className="flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-lg font-bold text-white"
        >
          🔊 {country.name}
        </button>
      ) : (
        <button
          onClick={onReveal}
          className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Показать название
        </button>
      )}

      <div className="flex w-full gap-3">
        {revealed && (
          <Link
            href={`/flags/${country.code}`}
            className="flex-1 rounded-full border border-stone-300 px-4 py-2.5 text-center text-sm font-semibold text-stone-700 hover:bg-stone-100"
          >
            Узнать больше о стране →
          </Link>
        )}
        <button
          onClick={onNext}
          className={`rounded-full px-4 py-2.5 text-sm font-semibold text-white ${
            revealed ? "bg-stone-400 hover:bg-stone-500" : "flex-1 bg-stone-900"
          }`}
        >
          Следующий флаг
        </button>
      </div>
    </div>
  );
}

function QuizCard({ country, onNext }: { country: Country; onNext: () => void }) {
  const zones = country.quizCropZones;
  const hidden = useMemo<FlagCropZone>(
    // eslint-disable-next-line react-hooks/purity -- picking the hidden zone is meant to be random each render of a fresh quiz card
    () => zones[Math.floor(Math.random() * zones.length)],
    [zones]
  );
  const options = useMemo(() => shuffle(zones.map((z) => z.label)), [zones]);
  const [answer, setAnswer] = useState<string | null>(null);
  const ratio = FLAG_VIEWBOX[country.code];
  const correct = answer === hidden.label;

  return (
    <div className="flex flex-col items-center gap-5 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-medium text-stone-500">Что скрыто на флаге?</p>

      <div
        className="relative w-full max-w-xs overflow-hidden rounded-2xl border border-stone-200 shadow-inner"
        style={{ aspectRatio: `${ratio.w} / ${ratio.h}` }}
      >
        <FlagSvg code={country.code} />
        <div
          className="absolute flex items-center justify-center bg-stone-900/90 text-2xl font-bold text-white"
          style={{
            left: `${hidden.x}%`,
            top: `${hidden.y}%`,
            width: `${hidden.w}%`,
            height: `${hidden.h}%`,
          }}
        >
          ?
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
        {options.map((label) => {
          const isAnswer = answer !== null;
          const isCorrectOption = label === hidden.label;
          return (
            <button
              key={label}
              disabled={isAnswer}
              onClick={() => setAnswer(label)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                !isAnswer
                  ? "border-stone-300 hover:bg-stone-100"
                  : isCorrectOption
                  ? "border-emerald-400 bg-emerald-100 text-emerald-800"
                  : label === answer
                  ? "border-rose-400 bg-rose-100 text-rose-800"
                  : "border-stone-200 text-stone-400"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {answer !== null && (
        <div className="flex w-full flex-col items-center gap-3">
          <p className={`text-sm font-semibold ${correct ? "text-emerald-700" : "text-rose-700"}`}>
            {correct ? "Верно! 🎉" : `Не угадали — это «${hidden.label}», флаг ${country.name}.`}
          </p>
          <button
            onClick={onNext}
            className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Следующий флаг
          </button>
        </div>
      )}
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
