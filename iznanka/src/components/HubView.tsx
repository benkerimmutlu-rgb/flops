"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/lib/progress";
import { Logo } from "@/components/Logo";
import {
  IcArrow,
  IcCheck,
  IcReset,
  IcRight,
  IcShield,
  IcUser,
} from "@/components/icons";
import { CLUSTERS, UPCOMING_CLUSTERS } from "@/content/clusters";
import { buildDeck, dueCards } from "@/lib/deck";
import type { Cluster } from "@/types/content";

function clusterProgress(cluster: Cluster, status: Record<string, string>) {
  const total = cluster.topics.length;
  const done = cluster.topics.filter((t) => status[t.id] === "done").length;
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}

export function HubView() {
  const router = useRouter();
  const { status, testPassed, srs, user } = useProgress();
  const deck = useMemo(() => buildDeck(), []);
  const due = dueCards(deck, srs).length;

  return (
    <div className="screen screen--anim">
      <div className="head">
        <Logo size={20} />
        <button
          className="iconbtn"
          aria-label={user ? "Профиль" : "Войти"}
          onClick={() => router.push("/profile")}
        >
          <IcUser />
        </button>
      </div>

      <div className="section">
        <span className="section__over overline">Фундаментальное обучение психологии</span>
        <h1 className="title-lg">Карта курсов</h1>
      </div>

      <button className="safetycard" onClick={() => router.push("/safety")}>
        <span className="safetycard__icon" aria-hidden="true">
          <IcShield />
        </span>
        <span className="safetycard__main">
          <span className="title-sm">Оценка риска и кризис</span>
          <span className="caption mute">Как заметить и маршрутизировать риск</span>
        </span>
        <span className="node__go">
          <IcRight />
        </span>
      </button>

      <button className="reviewcard" onClick={() => router.push("/review")}>
        <span className="reviewcard__icon" aria-hidden="true">
          <IcReset />
        </span>
        <span className="reviewcard__main">
          <span className="title-sm">Повторение глоссария</span>
          <span className="caption mute">
            {due > 0 ? "Карточек к повторению" : "Всё повторено"}
          </span>
        </span>
        {due > 0 ? (
          <span className="reviewcard__badge">{due}</span>
        ) : (
          <span className="node__go">
            <IcRight />
          </span>
        )}
      </button>

      <div className="col" style={{ gap: "var(--space-4)" }}>
        {CLUSTERS.map((cluster, i) => {
          const { total, done, pct } = clusterProgress(cluster, status);
          const complete = done === total && testPassed[cluster.id];
          return (
            <button
              key={cluster.id}
              className="hubcard"
              onClick={() => router.push(`/cluster/${cluster.id}`)}
            >
              <div className="hubcard__top">
                <span className="card__over overline">
                  Кластер {String(i + 1).padStart(2, "0")}
                </span>
                {complete ? (
                  <span className="badge badge--done">
                    <IcCheck sm /> Пройден
                  </span>
                ) : (
                  <span className="node__go">
                    <IcRight />
                  </span>
                )}
              </div>
              <h2 className="title-md">{cluster.title}</h2>
              <p className="card__text body">{cluster.description}</p>
              <div className="progress">
                <div className="progress__meta caption">
                  <span>
                    Освоено тем: {done} из {total}
                  </span>
                  <span>{pct}%</span>
                </div>
                <div
                  className="progress__track"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                >
                  <div className="progress__fill" style={{ width: pct + "%" }} />
                </div>
              </div>
            </button>
          );
        })}

        {UPCOMING_CLUSTERS.map((stub, i) => (
          <div key={stub.id} className="hubcard hubcard--soon">
            <div className="hubcard__top">
              <span className="card__over overline">
                Кластер {String(CLUSTERS.length + i + 1).padStart(2, "0")}
              </span>
              <span className="badge badge--soon">Скоро</span>
            </div>
            <h2 className="title-md">{stub.title}</h2>
            <p className="card__text body">{stub.description}</p>
          </div>
        ))}
      </div>

      <div className="foot">
        <button
          className="btn btn--glow btn--block label"
          onClick={() => router.push(`/cluster/${CLUSTERS[0].id}`)}
        >
          {clusterProgress(CLUSTERS[0], status).done > 0
            ? "Продолжить обучение"
            : "Начать обучение"}{" "}
          <IcArrow sm />
        </button>
      </div>
    </div>
  );
}
