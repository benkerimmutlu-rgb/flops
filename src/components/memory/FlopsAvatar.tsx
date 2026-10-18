"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getFlopsAsset, type FlopsAssetId } from "@/brand/flops-assets";

export type FlopsMood = "idle" | "peek" | "think" | "happy" | "sad" | "sleepy";

// Each mood maps to one or more asset frames. Multi-frame moods cycle, so Flops
// visibly fidgets (scratches, glances around) — the constant little motion is
// what holds a young child's attention between turns.
const FRAMES: Record<FlopsMood, FlopsAssetId[]> = {
  idle: ["ops_play"],
  peek: ["ops_play", "ops_worried_badge"],
  think: ["ops_play", "ops_worried_badge"],
  happy: ["ops_celebrate"],
  sad: ["ops_sad"],
  sleepy: ["ops_sleep"],
};

const MOTION: Record<FlopsMood, string> = {
  idle: "flops-bob",
  peek: "flops-wiggle",
  think: "flops-wiggle",
  happy: "flops-pop",
  sad: "flops-shake",
  sleepy: "flops-bob",
};

export function FlopsAvatar({
  mood,
  line,
  size = 92,
}: {
  mood: FlopsMood;
  line?: string;
  size?: number;
}) {
  const frames = FRAMES[mood];
  const [frame, setFrame] = useState(0);

  // Cycle frames only for multi-frame moods; always restart at 0 on mood change.
  useEffect(() => {
    setFrame(0);
    if (frames.length < 2) return;
    const t = setInterval(
      () => setFrame((f) => (f + 1) % frames.length),
      900
    );
    return () => clearInterval(t);
  }, [mood, frames.length]);

  const asset = frames[Math.min(frame, frames.length - 1)];

  return (
    <div className="flex items-center gap-3">
      <Image
        key={mood}
        src={getFlopsAsset(asset)}
        alt="Мопс Флопс"
        width={size}
        height={size}
        priority
        className={`shrink-0 object-contain ${MOTION[mood]}`}
        style={{ width: size, height: size }}
      />
      {line && (
        <div className="relative rounded-2xl rounded-bl-sm border border-border bg-surface px-4 py-2.5 text-[15px] font-bold leading-snug text-foreground shadow-[var(--shadow-card)]">
          {line}
        </div>
      )}
    </div>
  );
}
