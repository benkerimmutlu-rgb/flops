"use client";

import Link from "next/link";
import Image from "next/image";
import { liteByCode } from "@/lib/data";
import { FlagImage, FLAG_VIEWBOX } from "@/lib/flags";
import { CATEGORIES } from "@/lib/categories";
import { CategoryId } from "@/lib/types";
import { useUserState } from "@/lib/store";
import { getFlopsAsset, FlopsAssetId } from "@/brand/flops-assets";

// Brand status art for each of the 4 travel quadrants.
const CATEGORY_ASSET: Record<CategoryId, FlopsAssetId> = {
  loved_it: "visited_loved",
  want_to_go: "want_to_visit",
  never_again: "visited_disliked",
  dont_want: "not_interested",
};

export default function KnowPage() {
  const { all, setCategory } = useUserState();

  const knownCodes = Object.entries(all)
    .filter(([, s]) => s.known)
    .map(([code]) => code)
    .filter((code) => liteByCode(code));

  const unsorted = knownCodes.filter((code) => !all[code]?.category);

  if (knownCodes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-10 text-center shadow-[var(--shadow-card)]">
        <Image src={getFlopsAsset("ops_map")} alt="" width={150} height={150} className="h-32 w-32 object-contain flops-bob" />
        <h1 className="text-2xl font-bold text-foreground">Здесь живут флаги, которые ты знаешь</h1>
        <p className="text-muted">Угадай флаги в «Учи флаги» — и они появятся тут, чтобы разложить их по полочкам.</p>
        <Link href="/flags" className="rounded-full bg-brand-green px-7 py-3 text-[17px] font-bold text-white active:scale-95">
          Учить флаги
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="text-[28px] font-bold text-foreground">Знаю</h1>
        <p className="text-muted">Разложи знакомые страны по четырём полочкам. Нажми на флаг, чтобы переложить.</p>
      </div>

      {/* Лоток: известные, но не разложенные */}
      {unsorted.length > 0 && (
        <section className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-dashed border-clay-beige bg-clay-beige/10 p-4">
          <h2 className="text-[17px] font-bold text-foreground">Разложи ({unsorted.length})</h2>
          <div className="flex flex-col gap-2">
            {unsorted.map((code) => (
              <div key={code} className="flex items-center gap-3 rounded-2xl bg-surface p-2 shadow-[var(--shadow-card)]">
                <MiniFlag code={code} />
                <span className="flex-1 text-[15px] font-bold text-foreground">{liteByCode(code)!.name}</span>
                <div className="flex gap-1">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      title={c.label}
                      aria-label={`${liteByCode(code)!.name}: ${c.label}`}
                      onClick={() => setCategory(code, c.id)}
                      className="h-10 w-10 rounded-xl p-1 hover:bg-black/[0.05]"
                    >
                      <Image src={getFlopsAsset(CATEGORY_ASSET[c.id])} alt="" width={32} height={32} className="h-full w-full object-contain" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4 квадранта */}
      <div className="grid gap-4 sm:grid-cols-2">
        {CATEGORIES.map((cat) => {
          const codes = knownCodes.filter((code) => all[code]?.category === cat.id);
          return (
            <section key={cat.id} className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2">
                <Image src={getFlopsAsset(CATEGORY_ASSET[cat.id])} alt="" width={40} height={40} className="h-10 w-10 shrink-0 object-contain" />
                <div className="min-w-0">
                  <h2 className="truncate text-[17px] font-bold text-foreground">{cat.shortLabel}</h2>
                  <p className="truncate text-xs text-muted">{cat.label}</p>
                </div>
                <span className="ml-auto text-sm font-bold text-muted">{codes.length}</span>
              </div>

              {codes.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border px-3 py-4 text-center text-xs text-muted">Пока пусто</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {codes.map((code) => (
                    <button
                      key={code}
                      onClick={() => setCategory(code, null)}
                      title={`${liteByCode(code)!.name} — вернуть в «Разложи»`}
                      className="flex items-center gap-1.5 rounded-full border border-border bg-background py-1 pl-1 pr-2.5 hover:bg-black/[0.03]"
                    >
                      <MiniFlag code={code} small />
                      <span className="text-xs font-bold text-foreground">{liteByCode(code)!.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function MiniFlag({ code, small = false }: { code: string; small?: boolean }) {
  const ratio = FLAG_VIEWBOX[code] ?? { w: 3, h: 2 };
  return (
    <div
      className={`${small ? "h-5 w-7" : "h-8 w-12"} shrink-0 overflow-hidden rounded-md ring-1 ring-border`}
      style={{ aspectRatio: `${ratio.w} / ${ratio.h}` }}
    >
      <FlagImage code={code} fit="cover" />
    </div>
  );
}
