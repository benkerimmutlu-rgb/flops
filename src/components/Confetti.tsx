"use client";

import { useMemo } from "react";

const COLORS = ["#1E9A58", "#F6C742", "#E84A43", "#33A8E4", "#D7B89C"];

/** A short burst of clay-colored confetti. Mount it to play; remove to stop. */
export function Confetti({ pieces = 28 }: { pieces?: number }) {
  // Positions are randomized once per mount — a fresh burst each celebration.
  // All pieces are round dots: rotating squares smeared into colored streaks
  // mid-fall and read as a rendering glitch rather than confetti.
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.3,
        duration: 1.2 + Math.random() * 0.7,
        color: COLORS[i % COLORS.length],
        size: 8 + Math.random() * 5,
      })),
    [pieces]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {bits.map((b) => (
        <span
          key={b.id}
          style={{
            position: "absolute",
            top: "-12px",
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            background: b.color,
            borderRadius: "9999px",
            animation: `flops-confetti-fall ${b.duration}s ${b.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}
