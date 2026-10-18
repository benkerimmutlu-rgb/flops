"use client";

import Image from "next/image";
import { useUserState } from "@/lib/store";
import { accessoryById, ACCESSORIES, type AccessorySlot } from "@/lib/shop";

// Образ Флопса: базовый мопс с голой головой + надетые аксессуары поверх
// (настоящие пластилиновые PNG). Координаты подобраны под базу flops_base.webp
// (мопс анфас, сидит). Для «одиночных» слотов берём одну вещь, «в лапках» — все.
const BASE = "/assets/ops/flops_base.webp";

type Pos = { cx: number; cy: number; w: number }; // в % от контейнера
const SLOT_POS: Record<Exclude<AccessorySlot, "hold">, Pos> = {
  head: { cx: 50, cy: 9, w: 50 }, // шапка на макушке
  face: { cx: 50, cy: 30, w: 46 }, // очки на глазах
  neck: { cx: 50, cy: 55, w: 52 }, // шарф/бабочка/плащ на шее
};

export function FlopsDressed({
  size = 180,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const { equipped } = useUserState();
  const worn = equipped
    .map((id) => accessoryById(id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));
  const held = worn.filter((a) => a.slot === "hold");

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src={BASE}
        alt="Флопс в своём образе"
        width={size}
        height={size}
        className="h-full w-full object-contain flops-bob"
      />

      {/* Надетое на тело (голова / глаза / шея) */}
      {(["neck", "face", "head"] as const).map((slot) => {
        const a = worn.find((w) => w.slot === slot);
        if (!a) return null;
        const p = SLOT_POS[slot];
        const w = size * (p.w / 100);
        return (
          <Image
            key={slot}
            src={a.img}
            alt=""
            width={Math.round(w)}
            height={Math.round(w)}
            className="pointer-events-none absolute object-contain drop-shadow-[0_2px_3px_rgba(0,0,0,0.2)]"
            style={{
              left: `${p.cx}%`,
              top: `${p.cy}%`,
              width: w,
              height: "auto",
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}

      {/* В лапках — ряд по низу */}
      {held.length > 0 && (
        <div
          className="pointer-events-none absolute inset-x-0 flex items-end justify-center gap-0.5"
          style={{ bottom: "-2%" }}
        >
          {held.map((a) => (
            <Image
              key={a.id}
              src={a.img}
              alt=""
              width={Math.round(size * 0.26)}
              height={Math.round(size * 0.26)}
              className="object-contain drop-shadow-[0_2px_3px_rgba(0,0,0,0.2)]"
              style={{ width: size * 0.26, height: "auto" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Текстовый список надетого — для подписи под образом. */
export function wornSummary(equipped: string[]): string {
  return ACCESSORIES.filter((a) => equipped.includes(a.id))
    .map((a) => `${a.emoji} ${a.name}`)
    .join(", ");
}
