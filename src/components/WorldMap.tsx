"use client";

import world from "@svg-maps/world";
import Image from "next/image";
import { WORLD_COUNTRY_TOTAL } from "@/lib/data";
import { getFlopsAsset } from "@/brand/flops-assets";

/**
 * Flat world map. Been-there (`visited`) countries are green, dream (`wish`)
 * countries a bright blue, everything else stays uncolored pale land. Visited
 * wins over wish when a country is both.
 */
export function WorldMap({
  visited,
  wish,
}: {
  visited: Set<string>;
  wish?: Set<string>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <svg
        viewBox={world.viewBox}
        className="h-auto w-full"
        role="img"
        aria-label="Карта мира: зелёным — где ты был, синим — куда мечтаешь"
      >
        {world.locations.map((loc) => {
          const isVisited = visited.has(loc.id);
          const isWish = !isVisited && wish?.has(loc.id);
          const fill = isVisited
            ? "var(--green)"
            : isWish
            ? "var(--blue)"
            : "var(--border)";
          return (
            <path
              key={loc.id}
              d={loc.path}
              fill={fill}
              stroke="var(--background)"
              strokeWidth={0.5}
            />
          );
        })}
      </svg>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-muted">
        <LegendDot color="var(--green)" label="Был" />
        <LegendDot color="var(--blue)" label="Мечтаю" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-3 w-3 rounded-full" style={{ background: color }} />
      {label}
    </span>
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
