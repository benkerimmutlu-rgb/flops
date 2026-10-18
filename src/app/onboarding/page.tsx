"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { ALL_LITE, liteByCode } from "@/lib/data";
import { FlagImage, FLAG_VIEWBOX } from "@/lib/flags";
import { getFlopsAsset } from "@/brand/flops-assets";

export default function OnboardingPage() {
  const router = useRouter();
  const { status, createProfile } = useAuth();
  const [name, setName] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Онбординг только для вошедшего без профиля; иначе — домой/на вход.
  useEffect(() => {
    if (status === "ready") router.replace("/");
    else if (status === "anon" || status === "disabled") router.replace("/login");
  }, [status, router]);

  const query = q.trim().toLowerCase();
  const list = useMemo(
    () =>
      (query
        ? ALL_LITE.filter((c) => c.name.toLowerCase().includes(query))
        : [...ALL_LITE].sort((a, b) => a.name.localeCompare(b.name, "ru"))
      ).slice(0, query ? 40 : ALL_LITE.length),
    [query]
  );

  async function submit() {
    if (!name.trim() || !code) return;
    setBusy(true);
    setError(null);
    const { error } = await createProfile(name.trim(), code);
    setBusy(false);
    if (error) setError(error);
    else router.replace("/?welcome=1");
  }

  if (status !== "no_profile") {
    return (
      <p className="py-10 text-center text-muted">Минутку…</p>
    );
  }

  const chosen = code ? liteByCode(code) : undefined;
  const ratio = code ? FLAG_VIEWBOX[code] ?? { w: 3, h: 2 } : { w: 3, h: 2 };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 py-4">
      <div className="flex items-center gap-4">
        <Image src={getFlopsAsset("ops_hello")} alt="Флопс" width={88} height={88} priority className="h-20 w-20 object-contain flops-bob" />
        <div>
          <h1 className="text-[26px] font-bold leading-tight text-foreground">
            Давай познакомимся!
          </h1>
          <p className="text-muted">Как тебя зовут и откуда ты?</p>
        </div>
      </div>

      {/* Имя */}
      <section className="flex flex-col gap-2">
        <label className="text-[17px] font-bold text-foreground">Моё имя</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например, Соня"
          className="w-full rounded-full border border-border bg-surface px-5 py-3 text-[17px] text-foreground outline-none placeholder:text-muted focus:border-brand-green"
        />
      </section>

      {/* Моя страна */}
      <section className="flex flex-col gap-2">
        <label className="text-[17px] font-bold text-foreground">Моя страна</label>

        {chosen && (
          <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-brand-green bg-brand-green/[0.06] p-3">
            <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg ring-1 ring-border" style={{ aspectRatio: `${ratio.w} / ${ratio.h}` }}>
              <FlagImage code={code!} fit="cover" />
            </div>
            <p className="text-[17px] font-bold text-foreground">
              Твой флаг — {chosen.name} 🎉
            </p>
          </div>
        )}

        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Найти страну…"
          className="w-full rounded-full border border-border bg-surface px-5 py-3 text-[17px] text-foreground outline-none placeholder:text-muted focus:border-brand-green"
        />
        <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto rounded-[var(--radius-card)] border border-border bg-surface p-2 sm:grid-cols-3">
          {list.map((c) => {
            const r = FLAG_VIEWBOX[c.code] ?? { w: 3, h: 2 };
            const on = c.code === code;
            return (
              <button
                key={c.code}
                onClick={() => setCode(c.code)}
                className={`flex items-center gap-2 rounded-xl border p-2 text-left transition-colors ${
                  on ? "border-brand-green bg-brand-green/10" : "border-border hover:bg-black/[0.03]"
                }`}
              >
                <div className="h-6 w-9 shrink-0 overflow-hidden rounded ring-1 ring-border" style={{ aspectRatio: `${r.w} / ${r.h}` }}>
                  <FlagImage code={c.code} fit="cover" />
                </div>
                <span className="truncate text-sm font-bold text-foreground">{c.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {error && <p className="text-sm font-semibold text-brand-red">{error}</p>}

      <button
        onClick={submit}
        disabled={busy || !name.trim() || !code}
        className="rounded-full bg-brand-green px-8 py-4 text-xl font-bold text-white shadow-[var(--shadow-card)] active:scale-95 disabled:opacity-50"
      >
        {busy ? "Сохраняю…" : "Открывать мир с Флопсом! →"}
      </button>
    </div>
  );
}
