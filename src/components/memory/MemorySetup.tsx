"use client";

import { useState } from "react";
import Image from "next/image";
import { GameContinent, countByContinent } from "@/lib/data";
import { getFlopsAsset } from "@/brand/flops-assets";
import {
  Difficulty,
  DIFFICULTIES,
  DIFFICULTY_ORDER,
  CONTINENTS,
} from "./config";

export function MemorySetup({
  onStart,
}: {
  onStart: (difficulty: Difficulty, continent: GameContinent) => void;
}) {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [continent, setContinent] = useState<GameContinent>("all");

  const available = countByContinent(continent);
  const need = DIFFICULTIES[difficulty].pairs;
  const enough = available >= need;

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center gap-4">
        <Image
          src={getFlopsAsset("ops_play")}
          alt="Мопс Флопс с мячиком"
          width={96}
          height={96}
          priority
          className="h-24 w-24 object-contain flops-bob"
        />
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-foreground">
            Меморина
          </h1>
          <p className="text-muted">
            Найди пары флагов быстрее мопса Флопса!
          </p>
        </div>
      </div>

      {/* Размер поля */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[21px] font-bold text-foreground">Размер поля</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {DIFFICULTY_ORDER.map((id) => {
            const d = DIFFICULTIES[id];
            const active = difficulty === id;
            return (
              <button
                key={id}
                onClick={() => setDifficulty(id)}
                className={`flex flex-col items-center gap-1 rounded-[var(--radius-icon)] border py-4 transition-colors ${
                  active
                    ? "border-brand-green bg-brand-green/10 text-brand-green"
                    : "border-border bg-surface text-foreground hover:bg-black/[0.03]"
                }`}
              >
                <span className="text-[17px] font-bold">{d.label}</span>
                <span className="text-sm font-semibold text-muted">
                  {d.cols}×{d.rows}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Континент */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[21px] font-bold text-foreground">Какой континент?</h2>
        <div className="flex flex-wrap gap-2.5">
          {CONTINENTS.map((c) => (
            <button
              key={c.id}
              onClick={() => setContinent(c.id)}
              className={`rounded-full border px-5 py-2.5 text-[17px] font-bold transition-colors ${
                continent === c.id
                  ? "border-brand-green bg-brand-green text-white"
                  : "border-border bg-surface text-foreground hover:bg-black/[0.03]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        {!enough && (
          <p className="text-sm font-semibold text-brand-red">
            Тут всего {available} стран — для этого поля нужно {need}. Выбери поле
            поменьше или другой континент.
          </p>
        )}
      </section>

      <button
        onClick={() => onStart(difficulty, continent)}
        disabled={!enough}
        className="rounded-full bg-brand-green px-8 py-4 text-xl font-bold text-white shadow-[var(--shadow-card)] transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Играть с Флопсом!
      </button>
    </div>
  );
}
