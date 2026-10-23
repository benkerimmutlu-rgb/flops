"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CountryLite } from "@/lib/types";
import { GameContinent, pickCountries, countByContinent } from "@/lib/data";
import { FlagGuessGame } from "@/components/FlagGuessGame";
import { useUserState } from "@/lib/store";
import { getFlopsAsset, FlopsAssetId } from "@/brand/flops-assets";

const COUNTS = [5, 10, 20] as const;

const CONTINENTS: { id: GameContinent; label: string }[] = [
  { id: "all", label: "Весь мир" },
  { id: "europe", label: "Европа" },
  { id: "asia", label: "Азия" },
  { id: "africa", label: "Африка" },
  { id: "america", label: "Америка" },
];

export default function LearnFlagsPage() {
  const [pool, setPool] = useState<CountryLite[] | null>(null);

  if (pool) {
    return (
      <div className="flex flex-col gap-5">
        <h1 className="text-[28px] font-bold text-foreground">Учи флаги</h1>
        <FlagGuessGame pool={pool} variant="learn" />
      </div>
    );
  }

  return <Setup onStart={(count, cont) => setPool(pickCountries(count, cont))} />;
}

function Setup({ onStart }: { onStart: (count: number, cont: GameContinent) => void }) {
  const { all } = useUserState();
  const [count, setCount] = useState<number>(5);
  const [cont, setCont] = useState<GameContinent>("all");

  const available = countByContinent(cont);
  const realCount = Math.min(count, available);

  // «Повтори» и «Учу» живут блоками здесь, внутри «Флагов» — отдельных пунктов
  // меню у них больше нет, но ни одна активность не потерялась.
  const repeatCount = Object.values(all).filter((s) => s.inRepeat).length;
  const learningCount = Object.values(all).filter((s) => s.seen && !s.known).length;
  const knownCount = Object.values(all).filter((s) => s.known).length;

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center gap-4">
        <Image
          src={getFlopsAsset("ops_explorer")}
          alt="Мопс Флопс"
          width={96}
          height={96}
          priority
          className="h-24 w-24 object-contain flops-bob"
        />
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-foreground">Учи флаги</h1>
          <p className="text-muted">Слушай и угадывай страну по флагу.</p>
        </div>
      </div>

      {/* Сколько флагов */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[21px] font-bold text-foreground">Сколько флагов учим?</h2>
        <div className="grid grid-cols-3 gap-3">
          {COUNTS.map((n) => (
            <button
              key={n}
              aria-pressed={count === n}
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
              aria-pressed={cont === c.id}
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
        Поехали! — {realCount} {flagWord(realCount)}
      </button>

      {/* Повтори и Учу — блоки внутри «Флагов» */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[21px] font-bold text-foreground">Твой прогресс по флагам</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ProgressBlock
            href="/flops/flags/repeat"
            asset="ops_worried_badge"
            tint="bg-brand-red/10"
            title="Повтори"
            desc="Флаги, которые пока не даются."
            badge={repeatCount}
          />
          <ProgressBlock
            href="/flops/learning"
            asset="ops_green_pack"
            tint="bg-brand-blue/10"
            title="Учу"
            desc="Страны на пути к «Знаю»."
            badge={learningCount}
          />
        </div>
        {knownCount > 0 && (
          <p className="text-sm font-semibold text-brand-green">
            Уже знаю флагов: {knownCount} 🎉
          </p>
        )}
      </section>
    </div>
  );
}

function ProgressBlock({
  href,
  asset,
  tint,
  title,
  desc,
  badge,
}: {
  href: string;
  asset: FlopsAssetId;
  tint: string;
  title: string;
  desc: string;
  badge: number;
}) {
  return (
    <Link
      href={href}
      className="relative flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
    >
      <span className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-icon)] ${tint}`}>
        <Image src={getFlopsAsset(asset)} alt="" width={44} height={44} className="h-11 w-11 object-contain" />
        {badge > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-red px-1.5 text-xs font-bold text-white shadow">
            {badge}
          </span>
        )}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-[17px] font-bold text-foreground">{title}</span>
        <span className="text-sm text-muted">{desc}</span>
      </span>
    </Link>
  );
}

function flagWord(n: number): string {
  const d = n % 10;
  const dd = n % 100;
  if (dd >= 11 && dd <= 14) return "флагов";
  if (d === 1) return "флаг";
  if (d >= 2 && d <= 4) return "флага";
  return "флагов";
}
