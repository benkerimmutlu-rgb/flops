"use client";

import { useState } from "react";
import Image from "next/image";
import { CountryLite } from "@/lib/types";
import {
  GameContinent,
  pickCapitalCountries,
  capitalCountByContinent,
} from "@/lib/data";
import { CapitalGuessGame } from "@/components/CapitalGuessGame";
import { getFlopsAsset } from "@/brand/flops-assets";

const COUNTS = [5, 10, 20] as const;

const CONTINENTS: { id: GameContinent; label: string }[] = [
  { id: "all", label: "Весь мир" },
  { id: "europe", label: "Европа" },
  { id: "asia", label: "Азия" },
  { id: "africa", label: "Африка" },
  { id: "america", label: "Америка" },
];

export default function LearnCapitalsPage() {
  const [pool, setPool] = useState<CountryLite[] | null>(null);

  if (pool) {
    return (
      <div className="flex flex-col gap-5">
        <h1 className="text-[28px] font-bold text-foreground">Учи столицы</h1>
        <CapitalGuessGame pool={pool} onRestart={() => setPool(null)} />
      </div>
    );
  }

  return (
    <Setup
      onStart={(count, cont) => setPool(pickCapitalCountries(count, cont))}
    />
  );
}

function Setup({
  onStart,
}: {
  onStart: (count: number, cont: GameContinent) => void;
}) {
  const [count, setCount] = useState<number>(5);
  const [cont, setCont] = useState<GameContinent>("all");

  const available = capitalCountByContinent(cont);
  const realCount = Math.min(count, available);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center gap-4">
        <Image
          src={getFlopsAsset("signpost")}
          alt=""
          width={96}
          height={96}
          priority
          className="h-24 w-24 object-contain flops-bob"
        />
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-foreground">
            Учи столицы
          </h1>
          <p className="text-muted">
            Смотри на флаг и страну — выбери её столицу.
          </p>
        </div>
      </div>

      {/* Сколько столиц */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[21px] font-bold text-foreground">
          Сколько столиц угадываем?
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {COUNTS.map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`rounded-[var(--radius-icon)] border py-5 text-2xl font-bold transition-colors ${
                count === n
                  ? "border-brand-green bg-brand-green/10 text-brand-green"
                  : "border-border bg-surface text-foreground hover:bg-black/[0.03]"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      {/* Континент */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[21px] font-bold text-foreground">Какой континент?</h2>
        <div className="flex flex-wrap gap-2.5">
          {CONTINENTS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCont(c.id)}
              className={`rounded-full border px-5 py-2.5 text-[17px] font-bold transition-colors ${
                cont === c.id
                  ? "border-brand-green bg-brand-green text-white"
                  : "border-border bg-surface text-foreground hover:bg-black/[0.03]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      <button
        onClick={() => onStart(count, cont)}
        className="rounded-full bg-brand-green px-8 py-4 text-xl font-bold text-white shadow-[var(--shadow-card)] active:scale-95"
      >
        Поехали! — {realCount} {capitalWord(realCount)}
      </button>
    </div>
  );
}

function capitalWord(n: number): string {
  const d = n % 10;
  const dd = n % 100;
  if (dd >= 11 && dd <= 14) return "столиц";
  if (d === 1) return "столица";
  if (d >= 2 && d <= 4) return "столицы";
  return "столиц";
}
