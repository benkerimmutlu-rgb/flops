"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { liteByCode } from "@/lib/data";
import { FlagImage, FLAG_VIEWBOX } from "@/lib/flags";
import { useUserState } from "@/lib/store";
import { getFlopsAsset } from "@/brand/flops-assets";
import { WorldMap, VisitedProgress } from "@/components/WorldMap";

export default function MyCountriesPage() {
  const { all, setVisited, setWish } = useUserState();
  const [showKnown, setShowKnown] = useState(false);

  const visitedCodes = useMemo(
    () => Object.entries(all).filter(([, s]) => s.visited).map(([c]) => c),
    [all]
  );
  const wishCodes = Object.entries(all).filter(([, s]) => s.wish).map(([c]) => c);
  // "Просто знаю" — знаю флаг, но без отметок «был»/«мечтаю».
  const plainKnown = Object.entries(all)
    .filter(([code, s]) => s.known && !s.visited && !s.wish && liteByCode(code))
    .map(([c]) => c);

  const visitedSet = useMemo(() => new Set(visitedCodes), [visitedCodes]);
  const knownCount = Object.values(all).filter((s) => s.known).length;

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="text-[28px] font-bold text-foreground">Мои страны</h1>
        <p className="text-muted">Отмечай, где ты был и куда мечтаешь — карта закрашивается сама.</p>
      </div>

      {/* Глобус + прогресс */}
      <section className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
        <VisitedProgress count={visitedCodes.length} />
        <WorldMap visited={visitedSet} />
      </section>

      {/* Страны мечты */}
      <Group
        title="Страны мечты"
        asset="want_to_visit"
        codes={wishCodes}
        empty="Отметь страны, куда мечтаешь поехать — они появятся тут и в разделе «Мир»."
        all={all}
        onVisited={setVisited}
        onWish={setWish}
      />

      {/* Был */}
      <Group
        title="Где я был"
        asset="visited_loved"
        codes={visitedCodes}
        empty="Отметь страны, где ты уже побывал — и карта мира начнёт закрашиваться."
        all={all}
        onVisited={setVisited}
        onWish={setWish}
      />

      {/* Просто знаю — тихий блок */}
      {plainKnown.length > 0 && (
        <section className="flex flex-col gap-2">
          <button
            onClick={() => setShowKnown((v) => !v)}
            className="flex items-center justify-between rounded-[var(--radius-card)] border border-dashed border-border bg-surface px-5 py-3 text-left"
          >
            <span className="text-[15px] font-bold text-muted">
              Просто знаю флаг ({plainKnown.length})
            </span>
            <span className="text-muted">{showKnown ? "скрыть ▲" : "показать ▼"}</span>
          </button>
          {showKnown && (
            <RowList codes={plainKnown} all={all} onVisited={setVisited} onWish={setWish} />
          )}
        </section>
      )}

      {knownCount === 0 && visitedCodes.length === 0 && wishCodes.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-8 text-center shadow-[var(--shadow-card)]">
          <Image src={getFlopsAsset("ops_map")} alt="" width={120} height={120} className="h-28 w-28 object-contain flops-bob" />
          <p className="font-bold text-foreground">Пока пусто</p>
          <p className="text-muted">Поугадывай флаги или загляни в «Мир» — и отмечай страны здесь.</p>
          <div className="flex gap-2">
            <Link href="/flags" className="rounded-full bg-brand-green px-6 py-3 text-[15px] font-bold text-white active:scale-95">Учить флаги</Link>
            <Link href="/world" className="rounded-full border border-border bg-surface px-6 py-3 text-[15px] font-bold text-foreground">В «Мир»</Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Group({
  title,
  asset,
  codes,
  empty,
  all,
  onVisited,
  onWish,
}: {
  title: string;
  asset: Parameters<typeof getFlopsAsset>[0];
  codes: string[];
  empty: string;
  all: ReturnType<typeof useUserState>["all"];
  onVisited: (code: string, v: boolean) => void;
  onWish: (code: string, v: boolean) => void;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="flex items-center gap-2 text-[17px] font-bold text-foreground">
        <Image src={getFlopsAsset(asset)} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
        {title} <span className="text-muted">({codes.length})</span>
      </h2>
      {codes.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-border px-4 py-4 text-sm text-muted">{empty}</p>
      ) : (
        <RowList codes={codes} all={all} onVisited={onVisited} onWish={onWish} />
      )}
    </section>
  );
}

function RowList({
  codes,
  all,
  onVisited,
  onWish,
}: {
  codes: string[];
  all: ReturnType<typeof useUserState>["all"];
  onVisited: (code: string, v: boolean) => void;
  onWish: (code: string, v: boolean) => void;
}) {
  return (
    <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-card)]">
      {codes.map((code) => {
        const s = all[code];
        const ratio = FLAG_VIEWBOX[code] ?? { w: 3, h: 2 };
        return (
          <div key={code} className="flex items-center gap-3 px-3 py-2.5">
            <div className="h-7 w-10 shrink-0 overflow-hidden rounded-md ring-1 ring-border" style={{ aspectRatio: `${ratio.w} / ${ratio.h}` }}>
              <FlagImage code={code} fit="cover" />
            </div>
            <Link href={`/world/${code}`} className="flex-1 text-[15px] font-bold text-foreground hover:underline">
              {liteByCode(code)?.name ?? code.toUpperCase()}
            </Link>
            <ToggleIcon asset="visited_loved" active={!!s?.visited} title="Я тут был" onClick={() => onVisited(code, !s?.visited)} />
            <ToggleIcon asset="want_to_visit" active={!!s?.wish} title="Мечтаю побывать" onClick={() => onWish(code, !s?.wish)} />
          </div>
        );
      })}
    </div>
  );
}

function ToggleIcon({
  asset,
  active,
  title,
  onClick,
}: {
  asset: Parameters<typeof getFlopsAsset>[0];
  active: boolean;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`h-10 w-10 rounded-xl p-1 transition-colors ${active ? "bg-brand-green/15" : "opacity-40 hover:opacity-80"}`}
    >
      <Image src={getFlopsAsset(asset)} alt="" width={32} height={32} className="h-full w-full object-contain" />
    </button>
  );
}
