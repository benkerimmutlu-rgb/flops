"use client";

import Link from "next/link";
import Image from "next/image";
import { liteByCode } from "@/lib/data";
import { FlagImage, FLAG_VIEWBOX } from "@/lib/flags";
import { useUserState } from "@/lib/store";
import { getFlopsAsset } from "@/brand/flops-assets";

export default function LearningPage() {
  const { all } = useUserState();

  // "Учу" = encountered but not yet known. Highlight which ones are in the
  // repeat stack so the child knows where to practise them.
  const learning = Object.entries(all)
    .filter(([, s]) => s.seen && !s.known)
    .map(([code]) => code)
    .filter((code) => liteByCode(code));

  const repeatCount = learning.filter((code) => all[code]?.inRepeat).length;

  if (learning.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-10 text-center shadow-[var(--shadow-card)]">
        <Image src={getFlopsAsset("ops_green_pack")} alt="" width={150} height={150} className="h-32 w-32 object-contain flops-bob" />
        <h1 className="text-2xl font-bold text-foreground">Пока нечего учить</h1>
        <p className="text-muted">Начни заход в «Учи флаги» — страны, которые ещё не даются, появятся здесь.</p>
        <Link href="/flags" className="rounded-full bg-brand-green px-7 py-3 text-[17px] font-bold text-white active:scale-95">
          Учить флаги
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-foreground">Учу</h1>
        <p className="text-muted">Эти страны пока на пути к «Знаю». Повтори их — и они переедут.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/flags" className="rounded-full bg-brand-green px-6 py-3 text-[17px] font-bold text-white active:scale-95">
          Новый заход
        </Link>
        {repeatCount > 0 && (
          <Link href="/flags/repeat" className="rounded-full border border-border bg-surface px-6 py-3 text-[17px] font-bold text-foreground hover:bg-black/[0.03]">
            Повтори ошибки ({repeatCount})
          </Link>
        )}
      </div>

      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-card)]">
        {learning.map((code) => {
          const ratio = FLAG_VIEWBOX[code] ?? { w: 3, h: 2 };
          return (
            <div key={code} className="flex items-center gap-3 px-4 py-3">
              <div className="h-8 w-12 shrink-0 overflow-hidden rounded-md ring-1 ring-border" style={{ aspectRatio: `${ratio.w} / ${ratio.h}` }}>
                <FlagImage code={code} fit="cover" />
              </div>
              <span className="flex-1 text-[15px] font-bold text-foreground">{liteByCode(code)!.name}</span>
              {all[code]?.inRepeat && (
                <span className="rounded-full bg-brand-yellow/20 px-3 py-1 text-xs font-bold text-foreground">в «Повтори»</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
