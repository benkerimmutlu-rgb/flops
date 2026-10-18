"use client";

import Link from "next/link";
import Image from "next/image";
import { countryByCode, liteByCode } from "@/lib/data";
import { FlagImage, FLAG_VIEWBOX } from "@/lib/flags";
import { CONTINENT_LABEL } from "@/lib/continents";
import { DISH_EMOJI, FIGURE_EMOJI } from "@/lib/placeholders";
import { speak, langFor } from "@/lib/speech";
import { useUserState } from "@/lib/store";
import { getFlopsAsset } from "@/brand/flops-assets";

// The "Мир" country page. Shows full facts for the 12 detailed countries and a
// short card (flag + continent, capital when known) for everyone else.
export function CountryDetail({ code }: { code: string }) {
  const full = countryByCode(code);
  const lite = liteByCode(code);
  const name = full?.name ?? lite?.name ?? code.toUpperCase();
  const continent = full?.continent ?? lite?.continent;
  const ratio = FLAG_VIEWBOX[code] ?? { w: 3, h: 2 };

  const { getState, setVisited, setWish } = useUserState();
  const state = getState(code);

  return (
    <div className="flex flex-col gap-6 pb-16">
      <Link href="/world" className="text-sm font-semibold text-muted hover:text-foreground">
        ← Мой мир
      </Link>

      {/* Заголовок */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className="w-full max-w-[240px] overflow-hidden rounded-2xl bg-white p-2 shadow-[var(--shadow-card)] ring-1 ring-border"
          style={{ aspectRatio: `${ratio.w} / ${ratio.h}` }}
        >
          <FlagImage code={code} fit="contain" />
        </div>
        <button
          onClick={() => speak(name, "ru-RU")}
          aria-label={`Послушать: ${name}`}
          className="flex items-center gap-2 text-[26px] font-bold text-foreground"
        >
          <Image src={getFlopsAsset("sound_speaker")} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
          {name}
        </button>
        <div className="flex flex-wrap justify-center gap-2 text-sm">
          {continent && (
            <span className="rounded-full bg-black/[0.04] px-3 py-1 text-muted">
              {CONTINENT_LABEL[continent]}
            </span>
          )}
          {full?.capital && (
            <span className="rounded-full bg-black/[0.04] px-3 py-1 text-muted">
              Столица: {full.capital}
            </span>
          )}
        </div>
      </div>

      {/* Моя связь со страной — только позитив */}
      <div className="grid grid-cols-2 gap-3">
        <IntentToggle
          asset="visited_loved"
          label="Я тут был"
          active={state.visited}
          onToggle={() => setVisited(code, !state.visited)}
        />
        <IntentToggle
          asset="want_to_visit"
          label="Мечтаю побывать"
          active={state.wish}
          onToggle={() => setWish(code, !state.wish)}
        />
      </div>

      {full ? (
        <>
          <Section title="Значение флага">
            <p className="text-foreground/90">{full.flagMeaning}</p>
          </Section>

          <Section title="Местное блюдо">
            <div className="flex gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-black/[0.04] text-4xl">
                {DISH_EMOJI[code] ?? "🍽️"}
              </div>
              <div>
                <p className="font-bold text-foreground">{full.dish.name}</p>
                <p className="text-sm text-muted">{full.dish.recipeShort}</p>
              </div>
            </div>
          </Section>

          <Section title="Культурная личность">
            <div className="flex gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-black/[0.04] text-4xl">
                {FIGURE_EMOJI[code] ?? "🌟"}
              </div>
              <div>
                <p className="font-bold text-foreground">{full.culturalFigure.name}</p>
                <p className="text-sm text-muted">{full.culturalFigure.fact}</p>
              </div>
            </div>
          </Section>

          <Section title={`Язык: ${full.language.name}`}>
            <div className="flex flex-col divide-y divide-border">
              {full.language.phrases.map((p) => (
                <button
                  key={p.id}
                  onClick={() => speak(p.native, langFor(code))}
                  className="flex items-center justify-between gap-2 py-3 text-left"
                >
                  <span className="text-sm font-semibold text-muted">{p.label}</span>
                  <span className="flex items-center gap-2 font-bold text-foreground">
                    <Image src={getFlopsAsset("sound_speaker")} alt="" width={20} height={20} className="h-5 w-5 object-contain" />
                    {p.native}
                    <span className="text-sm font-normal text-muted">({p.translit})</span>
                  </span>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Миф и реальность">
            <div className="flex flex-col gap-3">
              <div className="rounded-xl bg-brand-yellow/15 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-muted">Миф</p>
                <p className="text-sm text-foreground/90">{full.myth.myth}</p>
              </div>
              <div className="rounded-xl bg-brand-green/10 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-brand-green">
                  Как на самом деле
                </p>
                <p className="text-sm text-foreground/90">{full.myth.reality}</p>
              </div>
            </div>
          </Section>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-border bg-surface p-8 text-center">
          <Image src={getFlopsAsset("ops_map")} alt="" width={96} height={96} className="h-24 w-24 object-contain flops-bob" />
          <p className="font-bold text-foreground">Подробности об этой стране скоро появятся</p>
          <p className="text-sm text-muted">
            Флопс уже собирает интересные факты, блюда и фразы. А пока ты можешь отметить
            её как «Мечтаю побывать».
          </p>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
      <h2 className="text-[17px] font-bold text-foreground">{title}</h2>
      {children}
    </div>
  );
}

function IntentToggle({
  asset,
  label,
  active,
  onToggle,
}: {
  asset: Parameters<typeof getFlopsAsset>[0];
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={active}
      className={`flex flex-col items-center gap-2 rounded-[var(--radius-card)] border-2 p-4 text-center transition-colors ${
        active
          ? "border-brand-green bg-brand-green/10"
          : "border-border bg-surface hover:bg-black/[0.03]"
      }`}
    >
      <Image src={getFlopsAsset(asset)} alt="" width={56} height={56} className="h-14 w-14 object-contain" />
      <span className={`text-[15px] font-bold ${active ? "text-brand-green" : "text-foreground"}`}>
        {label}
      </span>
      <span className={`text-xs ${active ? "text-brand-green" : "text-muted"}`}>
        {active ? "отмечено ✓" : "нажми, чтобы отметить"}
      </span>
    </button>
  );
}
