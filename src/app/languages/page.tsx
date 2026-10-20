"use client";

import { useState } from "react";
import Image from "next/image";
import { LANGUAGE_PHRASES, LanguagePhrase } from "@/lib/phrases";
import { shuffle } from "@/lib/data";
import { LanguageGuessGame } from "@/components/LanguageGuessGame";
import { getFlopsAsset } from "@/brand/flops-assets";

const COUNTS = [5, 10, 20] as const;

export default function LanguagesPage() {
  const [pool, setPool] = useState<LanguagePhrase[] | null>(null);

  if (pool) {
    return (
      <div className="flex flex-col gap-5">
        <h1 className="text-[28px] font-bold text-foreground">Языки мира</h1>
        <LanguageGuessGame pool={pool} onRestart={() => setPool(null)} />
      </div>
    );
  }

  return (
    <Setup
      onStart={(count) => setPool(shuffle(LANGUAGE_PHRASES).slice(0, count))}
    />
  );
}

function Setup({ onStart }: { onStart: (count: number) => void }) {
  const [count, setCount] = useState<number>(5);
  const realCount = Math.min(count, LANGUAGE_PHRASES.length);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center gap-4">
        <Image
          src={getFlopsAsset("ops_hello")}
          alt=""
          width={96}
          height={96}
          priority
          className="h-24 w-24 object-contain flops-bob"
        />
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-foreground">
            Языки мира
          </h1>
          <p className="text-muted">
            Прочитай фразу и угадай, из какой она страны. Ответишь верно — услышишь
            перевод.
          </p>
        </div>
      </div>

      {/* Сколько фраз */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[21px] font-bold text-foreground">Сколько фраз?</h2>
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

      <button
        onClick={() => onStart(count)}
        className="rounded-full bg-brand-green px-8 py-4 text-xl font-bold text-white shadow-[var(--shadow-card)] active:scale-95"
      >
        Поехали! — {realCount} {phraseWord(realCount)}
      </button>
    </div>
  );
}

function phraseWord(n: number): string {
  const d = n % 10;
  const dd = n % 100;
  if (dd >= 11 && dd <= 14) return "фраз";
  if (d === 1) return "фраза";
  if (d >= 2 && d <= 4) return "фразы";
  return "фраз";
}
