"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { getFlopsAsset } from "@/brand/flops-assets";

export default function LoginPage() {
  const { configured, sendMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError(null);
    const { error } = await sendMagicLink(email.trim());
    setBusy(false);
    if (error) setError(error);
    else setSent(true);
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-6 text-center">
      <Image
        src={getFlopsAsset("ops_hello")}
        alt="Флопс"
        width={120}
        height={120}
        priority
        className="h-28 w-28 object-contain flops-bob"
      />
      <div>
        <h1 className="text-[28px] font-bold text-foreground">Вход для родителя</h1>
        <p className="text-muted">
          Чтобы прогресс ребёнка сохранялся и открывался на любом устройстве.
        </p>
      </div>

      {!configured ? (
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5 text-muted shadow-[var(--shadow-card)]">
          Облако пока не подключено. Прогресс сохраняется на этом устройстве.
          Вход появится после настройки Supabase (см. инструкцию для деплоя).
        </div>
      ) : sent ? (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
          <Image src={getFlopsAsset("ops_celebrate")} alt="" width={96} height={96} className="h-24 w-24 object-contain flops-pop" />
          <p className="text-lg font-bold text-foreground">Письмо отправлено! ✉️</p>
          <p className="text-muted">
            Откройте ссылку из письма на <b className="text-foreground">{email}</b> — и
            вы войдёте. Можно закрыть эту вкладку.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="flex w-full flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@почта.ру"
            className="w-full rounded-full border border-border bg-surface px-5 py-3 text-[17px] text-foreground outline-none placeholder:text-muted focus:border-brand-green"
          />
          {error && <p className="text-sm font-semibold text-brand-red">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-brand-green px-8 py-4 text-xl font-bold text-white shadow-[var(--shadow-card)] active:scale-95 disabled:opacity-60"
          >
            {busy ? "Отправляю…" : "Получить ссылку для входа"}
          </button>
          <p className="text-xs text-muted">
            Без пароля — мы пришлём ссылку на почту. Email нужен только родителю.
          </p>
        </form>
      )}

      <Link href="/" className="text-sm font-semibold text-muted hover:text-foreground">
        ← На главную
      </Link>
    </div>
  );
}
