"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ALL_LITE, ALL_CONTINENT_IDS, liteByCode } from "@/lib/data";
import { CONTINENT_LABEL } from "@/lib/continents";
import { FlagImage, FLAG_VIEWBOX } from "@/lib/flags";
import { useUserState } from "@/lib/store";
import { getFlopsAsset } from "@/brand/flops-assets";

export default function WorldPage() {
  const { all } = useUserState();
  const [q, setQ] = useState("");

  const query = q.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      query
        ? ALL_LITE.filter((c) => c.name.toLowerCase().includes(query))
        : ALL_LITE,
    [query]
  );

  const dream = Object.entries(all)
    .filter(([, s]) => s.wish)
    .map(([code]) => code)
    .filter((code) => liteByCode(code));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Image src={getFlopsAsset("globe")} alt="" width={80} height={80} priority className="h-20 w-20 object-contain flops-bob" />
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-foreground">Мир</h1>
          <p className="text-muted">Заходи и читай про страны: флаги, еда, люди, фразы.</p>
        </div>
      </div>

      {/* Страны мечты */}
      {dream.length > 0 && (
        <section className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-brand-green/[0.06] p-4">
          <h2 className="flex items-center gap-2 text-[17px] font-bold text-foreground">
            <Image src={getFlopsAsset("want_to_visit")} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
            Твои страны мечты ({dream.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {dream.map((code) => (
              <Link
                key={code}
                href={`/world/${code}`}
                className="flex items-center gap-1.5 rounded-full border border-border bg-surface py-1 pl-1 pr-3 shadow-[var(--shadow-card)] hover:bg-black/[0.03]"
              >
                <MiniFlag code={code} />
                <span className="text-sm font-bold text-foreground">{liteByCode(code)!.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Поиск */}
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Найти страну…"
        className="w-full rounded-full border border-border bg-surface px-5 py-3 text-[17px] text-foreground outline-none placeholder:text-muted focus:border-brand-green"
      />

      {/* Список по континентам */}
      {query ? (
        <CountryList codes={filtered.map((c) => c.code)} state={all} />
      ) : (
        ALL_CONTINENT_IDS.map((cont) => {
          const codes = ALL_LITE.filter((c) => c.continent === cont)
            .sort((a, b) => a.name.localeCompare(b.name, "ru"))
            .map((c) => c.code);
          if (codes.length === 0) return null;
          return (
            <section key={cont} className="flex flex-col gap-2">
              <h2 className="text-[17px] font-bold text-foreground">{CONTINENT_LABEL[cont]}</h2>
              <CountryList codes={codes} state={all} />
            </section>
          );
        })
      )}

      {query && filtered.length === 0 && (
        <p className="text-center text-muted">Такой страны пока нет в приложении.</p>
      )}
    </div>
  );
}

function CountryList({
  codes,
  state,
}: {
  codes: string[];
  state: ReturnType<typeof useUserState>["all"];
}) {
  return (
    <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-card)]">
      {codes.map((code) => {
        const s = state[code];
        return (
          <Link key={code} href={`/world/${code}`} className="flex items-center gap-3 px-4 py-3 hover:bg-black/[0.03]">
            <MiniFlag code={code} />
            <span className="flex-1 text-[15px] font-bold text-foreground">{liteByCode(code)!.name}</span>
            {s?.visited && (
              <Image src={getFlopsAsset("visited_loved")} alt="был" title="Я тут был" width={24} height={24} className="h-6 w-6 object-contain" />
            )}
            {s?.wish && (
              <Image src={getFlopsAsset("want_to_visit")} alt="мечтаю" title="Мечтаю побывать" width={24} height={24} className="h-6 w-6 object-contain" />
            )}
            <span className="text-muted">›</span>
          </Link>
        );
      })}
    </div>
  );
}

function MiniFlag({ code }: { code: string }) {
  const ratio = FLAG_VIEWBOX[code] ?? { w: 3, h: 2 };
  return (
    <div className="h-7 w-10 shrink-0 overflow-hidden rounded-md ring-1 ring-border" style={{ aspectRatio: `${ratio.w} / ${ratio.h}` }}>
      <FlagImage code={code} fit="cover" />
    </div>
  );
}
