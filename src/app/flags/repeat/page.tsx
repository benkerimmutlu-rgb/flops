"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CountryLite } from "@/lib/types";
import { liteByCode, shuffle } from "@/lib/data";
import { FlagGuessGame } from "@/components/FlagGuessGame";
import { useUserState } from "@/lib/store";
import { getFlopsAsset } from "@/brand/flops-assets";

export default function RepeatPage() {
  const { all } = useUserState();
  const [pool, setPool] = useState<CountryLite[] | null>(null);

  // Snapshot the repeat stack once, after mount, so answering a card doesn't
  // reshuffle the run underneath the player. Codes with inRepeat=true only.
  useEffect(() => {
    const codes = Object.entries(all)
      .filter(([, s]) => s.inRepeat)
      .map(([code]) => code);
    const countries = codes
      .map(liteByCode)
      .filter((c): c is CountryLite => Boolean(c));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- snapshot-after-mount
    setPool(shuffle(countries));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional one-time snapshot
  }, []);

  if (!pool) return null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold text-foreground">Повтори</h1>
        <Link href="/flags" className="text-sm font-semibold text-muted hover:text-foreground">
          ← Учи флаги
        </Link>
      </div>

      {pool.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-10 text-center shadow-[var(--shadow-card)]">
          <Image
            src={getFlopsAsset("ops_sleep")}
            alt="Опс спит"
            width={160}
            height={160}
            className="h-36 w-36 object-contain flops-bob"
          />
          <h2 className="text-xl font-bold text-foreground">Стопка пуста — ты молодец!</h2>
          <p className="text-muted">Ошибок на повтор нет. Опс отдыхает 😴</p>
          <Link href="/flags" className="rounded-full bg-brand-green px-7 py-3 text-[17px] font-bold text-white active:scale-95">
            Учить дальше
          </Link>
        </div>
      ) : (
        <FlagGuessGame pool={pool} variant="repeat" />
      )}
    </div>
  );
}
