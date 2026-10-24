"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/lib/progress";
import { PhoneShell, Logo } from "@/components/Logo";
import { IcArrow, IcCheck, IcLeft } from "@/components/icons";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { CLUSTERS } from "@/content/clusters";

export default function ProfilePage() {
  const router = useRouter();
  const { user, name, status, testPassed, requestCode, verifyCode, signOut } =
    useProgress();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const stats = useMemo(() => {
    const allTopics = CLUSTERS.flatMap((c) => c.topics);
    const doneTopics = allTopics.filter((t) => status[t.id] === "done").length;
    const testsPassed = CLUSTERS.filter((c) => testPassed[c.id]).length;
    return {
      doneTopics,
      totalTopics: allTopics.length,
      testsPassed,
      totalTests: CLUSTERS.length,
    };
  }, [status, testPassed]);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await requestCode(email.trim());
    setBusy(false);
    if (error) setError(error);
    else setStep("code");
  };

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await verifyCode(email.trim(), code.trim(), nameInput);
    setBusy(false);
    if (error) setError(error);
    // при успехе провайдер выставит user → отрисуется карточка аккаунта
  };

  return (
    <PhoneShell>
      <div className="screen screen--anim">
        <div className="appbar">
          <button className="iconbtn" aria-label="Назад" onClick={() => router.push("/")}>
            <IcLeft />
          </button>
          <span className="appbar__title overline">Профиль</span>
          <span className="appbar__end" />
        </div>

        <div className="col" style={{ alignItems: "flex-start", gap: "var(--space-3)" }}>
          <Logo size={26} glow />
          {name && <span className="title-md">{name}</span>}
        </div>

        {/* Сводный прогресс */}
        <section className="card">
          <span className="card__over overline">Ваш прогресс</span>
          <div className="statrow">
            <div className="stat">
              <span className="stat__num title-lg neon">{stats.doneTopics}</span>
              <span className="stat__cap caption mute">
                из {stats.totalTopics} тем освоено
              </span>
            </div>
            <div className="stat">
              <span className="stat__num title-lg neon">{stats.testsPassed}</span>
              <span className="stat__cap caption mute">
                из {stats.totalTests} тестов пройдено
              </span>
            </div>
          </div>
        </section>

        {/* Прогресс по кластерам */}
        <div className="section">
          <span className="section__over overline">По кластерам</span>
          <div className="col" style={{ gap: "var(--space-4)" }}>
            {CLUSTERS.map((c) => {
              const total = c.topics.length;
              const done = c.topics.filter((t) => status[t.id] === "done").length;
              const pct = total ? Math.round((done / total) * 100) : 0;
              return (
                <button
                  key={c.id}
                  className="linkbtn progress"
                  style={{ textAlign: "left" }}
                  onClick={() => router.push(`/cluster/${c.id}`)}
                >
                  <div className="progress__meta caption">
                    <span className="title-sm" style={{ color: "var(--ink)" }}>
                      {c.title}
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <div className="progress__track">
                    <div className="progress__fill" style={{ width: pct + "%" }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Аккаунт */}
        <div className="section">
          <span className="section__over overline">Аккаунт</span>

          {!isSupabaseConfigured ? (
            <section className="callout callout--note">
              <h3 className="callout__head overline">Демо-режим</h3>
              <p className="callout__text body">
                Supabase не подключён — прогресс хранится в этом браузере.
              </p>
            </section>
          ) : user ? (
            <section className="card">
              <h3 className="title-sm">{name ?? "Вы вошли"}</h3>
              <p className="card__text body">{user.email}</p>
              <p className="card__text caption mute">
                Прогресс синхронизируется между устройствами.
              </p>
            </section>
          ) : step === "email" ? (
            <form className="col" style={{ gap: "var(--space-3)" }} onSubmit={sendCode}>
              <p className="card__text body">
                Войдите по коду из письма — прогресс сохранится между устройствами.
              </p>
              <input
                id="email"
                className="field"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error && (
                <p className="caption danger" role="alert">
                  {error}
                </p>
              )}
              <button className="btn btn--glow btn--block label" type="submit" disabled={busy}>
                {busy ? "Отправляем…" : "Получить код"} <IcArrow sm />
              </button>
            </form>
          ) : (
            <form className="col" style={{ gap: "var(--space-3)" }} onSubmit={confirm}>
              <p className="card__text body">
                Код отправлен на <b>{email}</b>. Введите его и ваше имя.
              </p>
              <input
                id="code"
                className="field"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                placeholder="Код из письма"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <input
                id="name"
                className="field"
                type="text"
                placeholder="Ваше имя"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
              {error && (
                <p className="caption danger" role="alert">
                  {error}
                </p>
              )}
              <button className="btn btn--glow btn--block label" type="submit" disabled={busy}>
                {busy ? "Проверяем…" : "Войти"} <IcCheck sm />
              </button>
              <div className="row" style={{ gap: "var(--space-3)" }}>
                <button
                  type="button"
                  className="reset caption"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setError(null);
                  }}
                >
                  Изменить e-mail
                </button>
                <button
                  type="button"
                  className="reset caption"
                  onClick={async () => {
                    setError(null);
                    const { error } = await requestCode(email.trim());
                    if (error) setError(error);
                  }}
                >
                  Отправить код заново
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="foot">
          {user ? (
            <button
              className="btn btn--secondary btn--block label"
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
            >
              Выйти
            </button>
          ) : (
            <button
              className="btn btn--secondary btn--block label"
              onClick={() => router.push("/")}
            >
              Вернуться к курсам
            </button>
          )}
        </div>
      </div>
    </PhoneShell>
  );
}
