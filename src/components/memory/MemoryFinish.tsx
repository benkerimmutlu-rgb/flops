"use client";

import Link from "next/link";
import Image from "next/image";
import { getFlopsAsset } from "@/brand/flops-assets";
import { Confetti } from "@/components/Confetti";

export type Outcome = "win" | "lose" | "tie";

// Warm, never-harsh copy for each result. Flops can now win on hard/expert, so
// a loss or tie is framed as encouragement, not failure.
const RESULT: Record<
  Outcome,
  { title: string; mascot: Parameters<typeof getFlopsAsset>[0]; note: string }
> = {
  win: {
    title: "Ты выиграл! 🏆",
    mascot: "ops_celebrate",
    note: "Флопс совсем не обижается — он виляет хвостом и уже хочет сыграть ещё!",
  },
  lose: {
    title: "Флопс выиграл! 🐾",
    mascot: "ops_happy_badge",
    note: "Ты был совсем близко! Сыграй ещё разок — и обгонишь Флопса.",
  },
  tie: {
    title: "Ничья! 🤝",
    mascot: "ops_play",
    note: "Ровно поровну! Флопс в восторге — давай сыграем ещё!",
  },
};

export function MemoryFinish({
  outcome,
  playerScore,
  flopsScore,
  bonesEarned,
  onReplay,
}: {
  outcome: Outcome;
  playerScore: number;
  flopsScore: number;
  bonesEarned: number;
  onReplay: () => void;
}) {
  const r = RESULT[outcome];
  return (
    <div className="relative flex flex-col items-center gap-5 overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface p-8 text-center shadow-[var(--shadow-card)]">
      {outcome !== "lose" && <Confetti pieces={44} />}

      <Image
        src={getFlopsAsset(r.mascot)}
        alt=""
        width={168}
        height={168}
        priority
        className="h-40 w-40 object-contain flops-pop"
      />

      <h2 className="text-[26px] font-bold text-foreground">{r.title}</h2>

      {/* Табло */}
      <div className="flex items-stretch gap-3">
        <ScoreTile label="Ты" score={playerScore} tone="green" />
        <div className="flex items-center text-2xl font-bold text-muted">:</div>
        <ScoreTile label="Флопс" score={flopsScore} tone="blue" />
      </div>

      {/* Награда — косточки за игру (всегда) */}
      <div className="flex flex-col items-center gap-2 rounded-[var(--radius-icon)] bg-brand-yellow/15 px-6 py-4">
        <Image
          src={getFlopsAsset("toy_bone_pattern")}
          alt="Косточка"
          width={72}
          height={72}
          className="h-16 w-16 object-contain flops-bob"
        />
        <p className="text-lg font-bold text-foreground">
          {outcome === "win" ? "Флопс дарит тебе косточку!" : "Косточки за игру!"}
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

      <p className="max-w-xs text-muted">{r.note}</p>

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
