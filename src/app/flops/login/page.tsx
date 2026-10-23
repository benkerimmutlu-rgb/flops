"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getFlopsAsset } from "@/brand/flops-assets";

export default function LoginPage() {
  const router = useRouter();
  const { configured, status, sendMagicLink, verifyCode } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // После успешного входа уводим на онбординг или на главную.
  useEffect(() => {
    if (status === "ready") router.replace("/flops");
    else if (status === "no_profile") router.replace("/flops/onboarding");
  }, [status, router]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError(null);
    const { error } = await sendMagicLink(email.trim());
    setBusy(false);
    if (error) setError(error);
    else setSent(true);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().length < 4) return;
    setBusy(true);
    setError(null);
    const { error } = await verifyCode(email.trim(), code);
    setBusy(false);
    if (error) setError("Неверный код. Проверьте и попробуйте ещё раз.");
    // при успехе редирект сделает эффект выше
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
        </div>
      ) : !sent ? (
        <form onSubmit={send} className="flex w-full flex-col gap-3">
          <input
            type="email"
            aria-label="Email родителя"
            autoComplete="email"
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
            {busy ? "Отправляю…" : "Получить код на почту"}
          </button>
          <p className="text-xs text-muted">
            Без пароля — пришлём код из письма. Email нужен только родителю.
          </p>
        </form>
      ) : (
        <form onSubmit={verify} className="flex w-full flex-col gap-3">
          <p className="text-[15px] text-muted">
            Отправили код на <b className="text-foreground">{email}</b>. Введите его
            сюда (проверьте и «Спам»).
          </p>
          <input
            inputMode="numeric"
            aria-label="Код из письма"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="Код из письма"
            className="w-full rounded-full border border-border bg-surface px-5 py-3 text-center text-2xl font-bold tracking-[0.3em] text-foreground outline-none placeholder:text-base placeholder:font-normal placeholder:tracking-normal placeholder:text-muted focus:border-brand-green"
          />
          {error && <p className="text-sm font-semibold text-brand-red">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-brand-green px-8 py-4 text-xl font-bold text-white shadow-[var(--shadow-card)] active:scale-95 disabled:opacity-60"
          >
            {busy ? "Проверяю…" : "Войти"}
          </button>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setCode("");
              setError(null);
            }}
            className="text-sm font-semibold text-muted hover:text-foreground"
          >
            Изменить почту / отправить снова
          </button>
        </form>
      )}

      <Link href="/flops" className="text-sm font-semibold text-muted hover:text-foreground">
        ← На главную
      </Link>
    </div>
  );
}
