"use client";

import world from "@svg-maps/world";
import Image from "next/image";
import { WORLD_COUNTRY_TOTAL } from "@/lib/data";
import { getFlopsAsset } from "@/brand/flops-assets";

/** Flat world map; countries in `visited` are filled green, the rest pale clay. */
export function WorldMap({ visited }: { visited: Set<string> }) {
  return (
    <svg
      viewBox={world.viewBox}
      className="h-auto w-full"
      role="img"
      aria-label="Карта мира: закрашены страны, где ты был"
    >
      {world.locations.map((loc) => {
        const on = visited.has(loc.id);
        return (
          <path
            key={loc.id}
            d={loc.path}
            fill={on ? "var(--green)" : "var(--border)"}
            stroke="var(--background)"
            strokeWidth={0.5}
          />
        );
      })}
    </svg>
  );
}

/** "Был в N странах · X% мира" headline. */
export function VisitedProgress({ count }: { count: number }) {
  const percent = Math.round((count / WORLD_COUNTRY_TOTAL) * 100);
  return (
    <div className="flex items-center gap-3">
      <Image src={getFlopsAsset("ops_globe")} alt="" width={56} height={56} className="h-14 w-14 shrink-0 object-contain" />
      <div>
        <p className="text-[21px] font-bold leading-tight text-foreground">
          Ты был в {count} {countryWord(count)}
        </p>
        <p className="text-sm font-semibold text-brand-green">
          это {percent}% стран мира 🌍
        </p>
      </div>
    </div>
  );
}

function countryWord(n: number): string {
  const d = n % 10;
  const dd = n % 100;
  if (dd >= 11 && dd <= 14) return "странах";
  if (d === 1) return "стране";
  if (d >= 2 && d <= 4) return "странах";
  return "странах";
}
