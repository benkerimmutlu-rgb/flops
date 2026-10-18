"use client";

import Image from "next/image";
import { getFlopsAsset, type FlopsAssetId } from "@/brand/flops-assets";
import { useUserState } from "@/lib/store";
import { accessoryById, ACCESSORIES, type AccessorySlot } from "@/lib/shop";

// Показывает Флопса в его «образе»: базовая картинка мопса + надетые аксессуары
// поверх неё (эмодзи, расставленные по телу). Так ребёнок реально видит, что
// Флопс всё это надел. Координаты подобраны под базу `ops_play` (мопс с голой
// головой и открытой мордочкой).
type Pos = { topPct: number; leftPct: number; sizeFactor: number };

const SLOT_POS: Record<Exclude<AccessorySlot, "hold">, Pos> = {
  head: { topPct: -1, leftPct: 49, sizeFactor: 0.34 },
  face: { topPct: 31, leftPct: 49, sizeFactor: 0.22 },
  neck: { topPct: 52, leftPct: 43, sizeFactor: 0.22 },
};

export function FlopsDressed({
  size = 180,
  base = "ops_play",
  className = "",
}: {
  size?: number;
  base?: FlopsAssetId;
  className?: string;
}) {
  const { equipped } = useUserState();
  const worn = equipped
    .map((id) => accessoryById(id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  // «В лапках» — раскладываем в ряд по низу картинки.
  const held = worn.filter((a) => a.slot === "hold");

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={getFlopsAsset(base)}
        alt="Флопс в своём образе"
        width={size}
        height={size}
        className="h-full w-full object-contain flops-bob"
      />

      {/* Надетые на тело (голова / глаза / шея) */}
      {(["head", "face", "neck"] as const).map((slot) => {
        const a = worn.find((w) => w.slot === slot);
        if (!a) return null;
        const p = SLOT_POS[slot];
        return (
          <span
            key={slot}
            aria-hidden
            style={{
              position: "absolute",
              top: `${p.topPct}%`,
              left: `${p.leftPct}%`,
              transform: "translateX(-50%)",
              fontSize: size * p.sizeFactor,
              lineHeight: 1,
              filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.25))",
            }}
          >
            {a.emoji}
          </span>
        );
      })}

      {/* В лапках — ряд по низу */}
      {held.length > 0 && (
        <div
          className="absolute inset-x-0 flex items-end justify-center gap-1"
          style={{ bottom: "2%", fontSize: size * 0.2, lineHeight: 1 }}
        >
          {held.map((a) => (
            <span
              key={a.id}
              aria-hidden
              style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.25))" }}
            >
              {a.emoji}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Текстовый список надетого — для подписи под образом. */
export function wornSummary(equipped: string[]): string {
  const names = ACCESSORIES.filter((a) => equipped.includes(a.id)).map(
    (a) => `${a.emoji} ${a.name}`
  );
  return names.join(", ");
}
