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
  const { user, status, testPassed, signInWithEmail, signOut } = useProgress();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await signInWithEmail(email.trim());
    setBusy(false);
    if (error) setError(error);
    else setSent(true);
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
                Supabase не подключён — прогресс хранится в этом браузере. Укажите
                ключи в <code>.env.local</code>, чтобы включить вход и синхронизацию.
              </p>
            </section>
          ) : user ? (
            <section className="card">
              <h3 className="title-sm">{user.email}</h3>
              <p className="card__text body">
                Прогресс синхронизируется между устройствами.
              </p>
            </section>
          ) : sent ? (
            <section className="callout callout--voice">
              <h3 className="callout__head overline">
                <IcCheck sm /> Письмо отправлено
              </h3>
              <p className="callout__text reading">
                Откройте ссылку из письма на {email}, чтобы войти.
              </p>
            </section>
          ) : (
            <form className="col" style={{ gap: "var(--space-3)" }} onSubmit={submit}>
              <p className="card__text body">
                Войдите по ссылке из письма — прогресс сохранится между устройствами.
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
                {busy ? "Отправляем…" : "Получить ссылку"} <IcArrow sm />
              </button>
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
