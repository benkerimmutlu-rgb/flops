"use client";

import Image from "next/image";
import { FlagImage } from "@/lib/flags";
import { getFlopsAsset } from "@/brand/flops-assets";
import { CountryLite } from "@/lib/types";

export interface BoardCard {
  id: number;
  code: string;
  country: CountryLite;
  matched: boolean;
  matchedBy: "player" | "flops" | null;
}

export function MemoryCard({
  card,
  faceUp,
  highlight,
  disabled,
  index,
  onClick,
}: {
  card: BoardCard;
  faceUp: boolean;
  /** "player" | "flops" tints a freshly-matched card; null = none. */
  highlight: "player" | "flops" | null;
  disabled: boolean;
  index: number;
  onClick: () => void;
}) {
  const showFace = faceUp || card.matched;

  return (
    <button
      type="button"
      aria-label={showFace ? card.country.name : "Закрытая карточка"}
      disabled={disabled}
      onClick={onClick}
      style={{ transitionDelay: `${(index % 6) * 45}ms` }}
      className={`mem-card relative aspect-[4/3] w-full select-none ${
        card.matched ? "mem-card--matched" : ""
      }`}
    >
      <span className={`mem-card__inner ${showFace ? "is-flipped" : ""}`}>
        {/* Рубашка — пластилиновый чемоданчик на мягком клей-фоне */}
        <span className="mem-card__side mem-card__back">
          <Image
            src={getFlopsAsset("suitcase")}
            alt=""
            width={120}
            height={120}
            className="h-3/5 w-3/5 object-contain drop-shadow-sm"
          />
        </span>

        {/* Лицо — флаг целиком на белом поле (contain, не обрезается) */}
        <span
          className={`mem-card__side mem-card__face border-4 ${
            highlight === "player"
              ? "border-brand-green"
              : highlight === "flops"
              ? "border-brand-blue"
              : "border-white"
          }`}
        >
          <span className="flex h-full w-full items-center justify-center p-1.5">
            <FlagImage code={card.code} fit="contain" className="rounded-sm" />
          </span>
        </span>
      </span>
    </button>
  );
}
