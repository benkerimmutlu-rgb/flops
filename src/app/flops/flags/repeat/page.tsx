"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CountryLite } from "@/lib/types";
import { liteByCode, shuffle } from "@/lib/data";
import { FlagGuessGame } from "@/components/FlagGuessGame";
import { useUserState } from "@/lib/store";
import { getFlopsAsset } from "@/brand/flops-assets";

export default function RepeatPage() {
  const { all, hydrated } = useUserState();
  const [pool, setPool] = useState<CountryLite[] | null>(null);
  const [round, setRound] = useState(0);

  // Latest state via a ref so loadRound always reads the current error stack
  // (not a stale closure), whether called on mount or from the restart button.
  const allRef = useRef(all);
  allRef.current = all;

  function loadRound() {
    const codes = Object.entries(allRef.current)
      .filter(([, s]) => s.inRepeat)
      .map(([code]) => code);
    const countries = codes
      .map(liteByCode)
      .filter((c): c is CountryLite => Boolean(c));
    setPool(shuffle(countries));
    setRound((r) => r + 1);
  }

  // Snapshot the stack once the store has hydrated (so a direct page load / reload
  // doesn't snapshot an empty stack); the restart button re-snapshots it.
  useEffect(() => {
    if (hydrated) loadRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot once after hydration
  }, [hydrated]);

  if (!pool) return null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold text-foreground">Повтори</h1>
        <Link href="/flops/flags" className="text-sm font-semibold text-muted hover:text-foreground">
          ← Учи флаги
        </Link>
      </div>

      {pool.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-10 text-center shadow-[var(--shadow-card)]">
          <Image
            src={getFlopsAsset("ops_sleep")}
            alt="Флопс спит"
            width={160}
            height={160}
            className="h-36 w-36 object-contain flops-bob"
          />
          <h2 className="text-xl font-bold text-foreground">Стопка пуста — ты молодец!</h2>
          <p className="text-muted">Ошибок на повтор нет. Флопс отдыхает 😴</p>
          <Link href="/flops/flags" className="rounded-full bg-brand-green px-7 py-3 text-[17px] font-bold text-white active:scale-95">
            Учить дальше
          </Link>
        </div>
      ) : (
        <FlagGuessGame
          key={round}
          pool={pool}
          variant="repeat"
          onRepeat={loadRound}
        />
      )}
    </div>
  );
}
