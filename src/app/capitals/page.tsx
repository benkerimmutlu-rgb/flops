"use client";

import { useEffect, useState } from "react";
import { COUNTRIES, randomCountry } from "@/lib/data";
import { FlagSvg, FLAG_VIEWBOX } from "@/lib/flags";
import { Country } from "@/lib/types";
import { speak, LANG_BY_CODE } from "@/lib/speech";

export default function LearnCapitalsPage() {
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional randomize-after-mount, see /flags/page.tsx
    setCountry(randomCountry());
  }, []);

  function next() {
    setCountry((prev) => randomCountry(prev.code));
    setRevealed(false);
  }

  const ratio = FLAG_VIEWBOX[country.code];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Учи Столицы</h1>
        <p className="text-sm text-stone-500">
          Необязательный раздел: по флагу и названию страны вспомни или выучи
          столицу.
        </p>
      </div>

      <div className="flex flex-col items-center gap-5 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <div
          className="w-full max-w-xs overflow-hidden rounded-2xl border border-stone-200 shadow-inner"
          style={{ aspectRatio: `${ratio.w} / ${ratio.h}` }}
        >
          <FlagSvg code={country.code} />
        </div>
        <p className="text-xl font-bold text-stone-900">{country.name}</p>

        {revealed ? (
          <button
            onClick={() => speak(country.capital, LANG_BY_CODE[country.code])}
            className="flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-lg font-bold text-white"
          >
            🔊 {country.capital}
          </button>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Какая столица?
          </button>
        )}

        <button
          onClick={next}
          className="w-full rounded-full border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100"
        >
          Следующая страна
        </button>
      </div>
    </div>
  );
}
