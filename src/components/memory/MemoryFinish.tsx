"use client";

import Link from "next/link";
import Image from "next/image";
import { getFlopsAsset } from "@/brand/flops-assets";
import { Confetti } from "@/components/Confetti";

export function MemoryFinish({
  playerScore,
  flopsScore,
  bonesEarned,
  onReplay,
}: {
  playerScore: number;
  flopsScore: number;
  bonesEarned: number;
  onReplay: () => void;
}) {
  // By design the player always comes out ahead — the copy assumes a win.
  return (
    <div className="relative flex flex-col items-center gap-5 overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface p-8 text-center shadow-[var(--shadow-card)]">
      <Confetti pieces={44} />

      <Image
        src={getFlopsAsset("ops_celebrate")}
        alt="Опс радуется победе"
        width={168}
        height={168}
        priority
        className="h-40 w-40 object-contain flops-pop"
      />

      <h2 className="text-[26px] font-bold text-foreground">Ты выиграл! 🏆</h2>

      {/* Табло */}
      <div className="flex items-stretch gap-3">
        <ScoreTile label="Ты" score={playerScore} tone="green" />
        <div className="flex items-center text-2xl font-bold text-muted">:</div>
        <ScoreTile label="Флопс" score={flopsScore} tone="blue" />
      </div>

      {/* Награда — золотая косточка */}
      <div className="flex flex-col items-center gap-2 rounded-[var(--radius-icon)] bg-brand-yellow/15 px-6 py-4">
        <Image
          src={getFlopsAsset("toy_bone_pattern")}
          alt="Золотая косточка"
          width={72}
          height={72}
          className="h-16 w-16 object-contain flops-bob"
        />
        <p className="text-lg font-bold text-foreground">
          Флопс дарит тебе косточку!
        </p>
        <div className="flex items-center gap-1.5 text-lg font-bold text-brand-green">
          <Image
            src={getFlopsAsset("bone_currency")}
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 object-contain"
          />
          +{bonesEarned}
        </div>
      </div>

      <p className="max-w-xs text-muted">
        Флопс совсем не обижается — он виляет хвостом и уже хочет сыграть ещё!
      </p>

      <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
        <button
          onClick={onReplay}
          className="rounded-full bg-brand-green px-7 py-3 text-[17px] font-bold text-white shadow-[var(--shadow-card)] active:scale-95"
        >
          Сыграть ещё
        </button>
        <Link
          href="/"
          className="rounded-full border border-border bg-surface px-7 py-3 text-center text-[17px] font-bold text-foreground hover:bg-black/[0.03]"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}

function ScoreTile({
  label,
  score,
  tone,
}: {
  label: string;
  score: number;
  tone: "green" | "blue";
}) {
  const color = tone === "green" ? "text-brand-green" : "text-brand-blue";
  return (
    <div className="flex min-w-24 flex-col items-center rounded-[var(--radius-icon)] border border-border bg-background px-5 py-3">
      <span className="text-sm font-bold text-muted">{label}</span>
      <span className={`text-4xl font-bold ${color}`}>{score}</span>
    </div>
  );
}
