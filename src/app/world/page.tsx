"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ALL_LITE, ALL_CONTINENT_IDS, liteByCode } from "@/lib/data";
import { CONTINENT_LABEL } from "@/lib/continents";
import { FlagImage, FLAG_VIEWBOX } from "@/lib/flags";
import { useUserState } from "@/lib/store";
import { getFlopsAsset } from "@/brand/flops-assets";
import { WorldMap, VisitedProgress } from "@/components/WorldMap";

// "Мой мир" — личный атлас. Объединяет карту-прогресс, личные списки
// («был» / «мечтаю») и браузер стран с фактами. Страны размечаются прямо из
// списка (две кнопки в строке), поэтому второй экран-«сортировщик» не нужен.
export default function MyWorldPage() {
  const { all, setVisited, setWish } = useUserState();
  const [q, setQ] = useState("");
  const [openCont, setOpenCont] = useState<string | null>(null);

  const query = q.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      query
        ? ALL_LITE.filter((c) => c.name.toLowerCase().includes(query))
        : [],
    [query]
  );

  const visitedCodes = Object.entries(all)
    .filter(([, s]) => s.visited)
    .map(([c]) => c);
  const wishCodes = Object.entries(all)
    .filter(([, s]) => s.wish)
    .map(([c]) => c);
  const visitedSet = useMemo(() => new Set(visitedCodes), [visitedCodes]);
  const wishSet = useMemo(() => new Set(wishCodes), [wishCodes]);

  return (
    <div className="flex flex-col gap-6">
      {/* Заголовок */}
      <div className="flex items-start gap-4">
        <Image
          src={getFlopsAsset("globe")}
          alt=""
          width={80}
          height={80}
          priority
          className="h-20 w-20 shrink-0 object-contain flops-bob"
        />
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-foreground">
            Мой мир
          </h1>
          <p className="text-muted">
            Личный атлас: отмечай страны — карта закрашивается сама.
          </p>
        </div>
      </div>

      {/* Пояснение для взрослых */}
      <section className="rounded-[var(--radius-card)] border border-border bg-brand-blue/[0.06] p-4">
        <p className="text-[15px] font-bold text-foreground">
          Для взрослых — играйте сами или вместе с ребёнком
        </p>
        <p className="mt-1 text-[15px] leading-relaxed text-muted">
          Этот раздел и для взрослых: отмечайте страны для себя — как личный
          travel-дневник — или заполняйте его вместе с ребёнком. У каждой страны
          две отметки: <b className="text-brand-green">«Был»</b> и{" "}
          <b className="text-brand-blue">«Мечтаю»</b>. Нажимайте их прямо в списке —
          карта мира закрашивается (зелёным — где побывали, синим — куда хотите), а
          сверху растёт процент открытого мира. А если нажать на{" "}
          <b className="text-foreground">название страны</b>, откроется рассказ о
          ней: флаг, еда, люди и фразы.
        </p>
      </section>

      {/* Карта + прогресс */}
      <section className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
        <VisitedProgress count={visitedCodes.length} />
        <WorldMap visited={visitedSet} wish={wishSet} />
      </section>

      {/* Быстрые личные списки */}
      {wishCodes.length > 0 && (
        <ChipGroup title="Страны мечты" asset="want_to_visit" codes={wishCodes} />
      )}
      {visitedCodes.length > 0 && (
        <ChipGroup title="Где я был" asset="visited_loved" codes={visitedCodes} />
      )}

      {/* Поиск */}
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Найти страну…"
        className="w-full rounded-full border border-border bg-surface px-5 py-3 text-[17px] text-foreground outline-none placeholder:text-muted focus:border-brand-green"
      />

      {/* Браузер: результаты поиска ИЛИ континенты-аккордеоны */}
      {query ? (
        filtered.length > 0 ? (
          <CountryList
            codes={filtered.map((c) => c.code)}
            all={all}
            onVisited={setVisited}
            onWish={setWish}
          />
        ) : (
          <p className="text-center text-muted">
            Такой страны пока нет в приложении.
          </p>
        )
      ) : (
        <div className="flex flex-col gap-2">
          {ALL_CONTINENT_IDS.map((cont) => {
            const codes = ALL_LITE.filter((c) => c.continent === cont)
              .sort((a, b) => a.name.localeCompare(b.name, "ru"))
              .map((c) => c.code);
            if (codes.length === 0) return null;
            const open = openCont === cont;
            const marked = codes.filter(
              (c) => all[c]?.visited || all[c]?.wish
            ).length;
            return (
              <section
                key={cont}
                className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-card)]"
              >
                <button
                  onClick={() => setOpenCont(open ? null : cont)}
                  className="flex w-full items-center justify-between px-4 py-3.5 text-left"
                  aria-expanded={open}
                >
                  <span className="text-[17px] font-bold text-foreground">
                    {CONTINENT_LABEL[cont]}
                  </span>
                  <span className="flex items-center gap-2 text-sm text-muted">
                    {marked > 0 && (
                      <span className="rounded-full bg-brand-green/15 px-2 py-0.5 font-bold text-brand-green">
                        {marked}
                      </span>
                    )}
                    <span>{codes.length}</span>
                    <span className="text-base">{open ? "▲" : "▼"}</span>
                  </span>
                </button>
                {open && (
                  <CountryList
                    codes={codes}
                    all={all}
                    onVisited={setVisited}
                    onWish={setWish}
                    flush
                  />
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Компактная строка-«чип» для личных списков (мечта / был). */
function ChipGroup({
  title,
  asset,
  codes,
}: {
  title: string;
  asset: Parameters<typeof getFlopsAsset>[0];
  codes: string[];
}) {
  return (
    <section className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-brand-green/[0.04] p-4">
      <h2 className="flex items-center gap-2 text-[17px] font-bold text-foreground">
        <Image
          src={getFlopsAsset(asset)}
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 object-contain"
        />
        {title} <span className="text-muted">({codes.length})</span>
      </h2>
      <div className="flex flex-wrap gap-2">
        {codes.map((code) => (
          <Link
            key={code}
            href={`/world/${code}`}
            className="flex items-center gap-1.5 rounded-full border border-border bg-surface py-1 pl-1 pr-3 shadow-[var(--shadow-card)] hover:bg-black/[0.03]"
          >
            <MiniFlag code={code} />
            <span className="text-sm font-bold text-foreground">
              {liteByCode(code)!.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CountryList({
  codes,
  all,
  onVisited,
  onWish,
  flush = false,
}: {
  codes: string[];
  all: ReturnType<typeof useUserState>["all"];
  onVisited: (code: string, v: boolean) => void;
  onWish: (code: string, v: boolean) => void;
  /** Inside a continent accordion the border/shadow come from the parent. */
  flush?: boolean;
}) {
  return (
    <div
      className={
        flush
          ? "flex flex-col divide-y divide-border border-t border-border"
          : "flex flex-col divide-y divide-border overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-card)]"
      }
    >
      {codes.map((code) => {
        const s = all[code];
        return (
          <div key={code} className="flex items-center gap-3 px-3 py-2.5">
            <MiniFlag code={code} />
            <Link
              href={`/world/${code}`}
              className="flex-1 truncate text-[15px] font-bold text-foreground hover:underline"
            >
              {liteByCode(code)!.name}
            </Link>
            <Toggle
              asset="visited_loved"
              tone="green"
              active={!!s?.visited}
              label="Был"
              onClick={() => onVisited(code, !s?.visited)}
            />
            <Toggle
              asset="want_to_visit"
              tone="blue"
              active={!!s?.wish}
              label="Мечтаю"
              onClick={() => onWish(code, !s?.wish)}
            />
          </div>
        );
      })}
    </div>
  );
}

function Toggle({
  asset,
  tone,
  active,
  label,
  onClick,
}: {
  asset: Parameters<typeof getFlopsAsset>[0];
  tone: "green" | "blue";
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  const on =
    tone === "green" ? "bg-brand-green/15 text-brand-green" : "bg-brand-blue/15 text-brand-blue";
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`flex shrink-0 items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-bold transition-colors ${
        active ? on : "text-muted opacity-50 hover:opacity-90"
      }`}
    >
      <Image
        src={getFlopsAsset(asset)}
        alt=""
        width={22}
        height={22}
        className="h-5 w-5 object-contain"
      />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function MiniFlag({ code }: { code: string }) {
  const ratio = FLAG_VIEWBOX[code] ?? { w: 3, h: 2 };
  return (
    <div
      className="h-7 w-10 shrink-0 overflow-hidden rounded-md ring-1 ring-border"
      style={{ aspectRatio: `${ratio.w} / ${ratio.h}` }}
    >
      <FlagImage code={code} fit="cover" />
    </div>
  );
}
