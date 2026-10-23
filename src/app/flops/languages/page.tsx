"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { LANGUAGE_PHRASES } from "@/lib/phrases";
import { shuffle } from "@/lib/data";
import { LanguageGuessGame } from "@/components/LanguageGuessGame";
import { getFlopsAsset } from "@/brand/flops-assets";

import { useAuth } from "@/lib/auth";
import { restoreLanguageSession, startLanguageSession, type LanguageSession } from "@/lib/language-session";

const COUNTS = [5, 10, 20, 40] as const;

export default function LanguagesPage() {
  const { user, status } = useAuth();
  if (status === "loading") return <p role="status">Загружаем игру…</p>;
  return <LanguageVisit key={user?.id ?? "guest"} scope={user?.id ?? "guest"} />;
}
function LanguageVisit({ scope }: { scope: string }) {
  const [session, setSession] = useState<LanguageSession | null>(null);
  const [ready, setReady] = useState(false);
  const key = `flops_languages_v1:${scope}`;
  useEffect(() => {
    let saved = null;
    try { saved = restoreLanguageSession(JSON.parse(sessionStorage.getItem(key) || "null")); } catch { /* New game if storage is unavailable. */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restore browser-only, account-scoped session
    setSession(saved);
    setReady(true);
  }, [key]);
  function change(next: LanguageSession | null) {
    try {
      if (next) sessionStorage.setItem(key, JSON.stringify(next));
      else sessionStorage.removeItem(key);
    } catch { /* The current game remains playable without browser storage. */ }
    setSession(next);
  }
  if (!ready) return <p role="status">Загружаем игру…</p>;
  if (session) return (
    <div className="flex flex-col gap-5">
      <h1 className="text-[28px] font-bold text-foreground">Языки мира</h1>
      <LanguageGuessGame session={session} onChange={change} onRestart={() => change(null)} />
    </div>
  );
  return <Setup onStart={count => change(startLanguageSession(shuffle(LANGUAGE_PHRASES).slice(0, count).map(p => p.code)))} />;
}

function Setup({ onStart }: { onStart: (count: number) => void }) {
  const [count, setCount] = useState<number>(5);
  const realCount = Math.min(count, LANGUAGE_PHRASES.length);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center gap-4">
        <Image
          src={getFlopsAsset("ops_hello")}
          alt=""
          width={96}
          height={96}
          priority
          className="h-24 w-24 object-contain flops-bob"
        />
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-foreground">
            Языки мира
          </h1>
          <p className="text-muted">
            Прочитай фразу и угадай, из какой она страны. Ответишь верно — услышишь
            перевод.
          </p>
        </div>
      </div>

      {/* Сколько фраз */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[21px] font-bold text-foreground">Сколько фраз?</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {COUNTS.map((n) => (
            <button
              key={n}
              aria-pressed={count === n}
              onClick={() => setCount(n)}
              className={`rounded-[var(--radius-icon)] border py-5 text-2xl font-bold transition-colors ${
                count === n
                  ? "border-brand-green bg-brand-green/10 text-brand-green"
                  : "border-border bg-surface text-foreground hover:bg-black/[0.03]"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      <button
        onClick={() => onStart(count)}
        className="rounded-full bg-brand-green px-8 py-4 text-xl font-bold text-white shadow-[var(--shadow-card)] active:scale-95"
      >
        Поехали! — {realCount} {phraseWord(realCount)}
      </button>
    </div>
  );
}

function phraseWord(n: number): string {
  const d = n % 10;
  const dd = n % 100;
  if (dd >= 11 && dd <= 14) return "фраз";
  if (d === 1) return "фраза";
  if (d >= 2 && d <= 4) return "фразы";
  return "фраз";
}
