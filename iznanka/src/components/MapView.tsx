"use client";

import { useRouter } from "next/navigation";
import { useProgress } from "@/lib/progress";
import { Logo } from "@/components/Logo";
import {
  IcAlert,
  IcArrow,
  IcCheck,
  IcLock,
  IcRight,
  IcReset,
  IcUser,
} from "@/components/icons";
import { CLUSTERS } from "@/content/clusters";
import type { Cluster, TopicStatus } from "@/types/content";

const STATE_LABEL: Record<TopicStatus, string> = {
  new: "Не изучено",
  progress: "В процессе",
  done: "Освоено",
};

export function MapView({ cluster }: { cluster: Cluster }) {
  const router = useRouter();
  const { status, testPassed, reset, user } = useProgress();

  const clusterNo = String(
    Math.max(0, CLUSTERS.findIndex((c) => c.id === cluster.id)) + 1,
  ).padStart(2, "0");
  const topics = cluster.topics;
  const total = topics.length;
  const done = topics.filter((t) => status[t.id] === "done").length;
  const pct = Math.round((done / total) * 100);
  const allDone = done === total;

  const nodeMod = (s: TopicStatus) =>
    s === "done" ? "node--done" : s === "progress" ? "node--progress" : "";

  const primary = allDone
    ? { label: "Пройти итоговый тест", go: () => router.push(`/test/${cluster.id}`) }
    : (() => {
        const t = topics.find((t) => status[t.id] !== "done")!;
        const started = status[t.id] === "progress";
        return {
          label: started ? "Продолжить тему" : "Начать тему",
          go: () => router.push(`/topic/${t.id}`),
        };
      })();

  return (
    <div className="screen screen--anim">
      <div className="head">
        <button
          className="linkbtn"
          aria-label="К списку кластеров"
          onClick={() => router.push("/")}
        >
          <Logo size={20} />
        </button>
        <button
          className="iconbtn"
          aria-label={user ? "Профиль" : "Войти"}
          onClick={() => router.push("/profile")}
        >
          <IcUser />
        </button>
      </div>

      <section className="card">
        <span className="card__over overline">Кластер {clusterNo}</span>
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
      </section>

      <div className="section">
        <span className="section__over overline">Карта знаний</span>
        <div className="map">
          {topics.map((t, i) => {
            const s = status[t.id] ?? "new";
            return (
              <button
                key={t.id}
                className={"node " + nodeMod(s)}
                onClick={() => router.push(`/topic/${t.id}`)}
              >
                <span className="node__mark">
                  {s === "done" ? <IcCheck /> : i + 1}
                </span>
                <span className="node__main">
                  <span className="node__title">{t.title}</span>
                  <span className="node__state">{STATE_LABEL[s]}</span>
                </span>
                <span className="node__go">
                  <IcRight />
                </span>
              </button>
            );
          })}

          {/* Плейсхолдер будущих тем — показывает идею roadmap и масштабируемость */}
          <button className="node node--soon" disabled>
            <span className="node__mark">{topics.length + 1}</span>
            <span className="node__main">
              <span className="node__title">Скоро</span>
              <span className="node__state">Тема в разработке</span>
            </span>
            <span />
          </button>

          {/* Итоговый кейс-тест */}
          <button
            className={"node node--test " + (allDone ? "node--open" : "node--locked")}
            onClick={allDone ? () => router.push(`/test/${cluster.id}`) : undefined}
            disabled={!allDone}
          >
            <span className="node__mark">
              {allDone ? (
                <span className="node__glyph" aria-hidden="true">
                  A
                </span>
              ) : (
                <IcLock sm />
              )}
            </span>
            <span className="node__main">
              <span className="node__title">Итоговый кейс-тест</span>
              <span className="node__state">
                {allDone
                  ? testPassed[cluster.id]
                    ? "Пройден"
                    : "Доступен"
                  : "Откроется после всех тем"}
              </span>
            </span>
            <span className="node__go">{allDone ? <IcRight /> : null}</span>
          </button>
        </div>
      </div>

      <section className="card">
        <span className="card__over overline">Сквозной кейс</span>
        <div className="case">
          <span className="case__ava title-sm" aria-hidden="true">
            {cluster.avatar.name.charAt(0)}
          </span>
          <div className="case__main">
            <h3 className="title-sm">{cluster.avatar.name}</h3>
            <p className="card__text body">{cluster.avatar.case}</p>
          </div>
        </div>
      </section>

      <section className="callout callout--note">
        <h3 className="callout__head overline">
          <IcAlert sm />
          Внимание
        </h3>
        <p className="callout__text body">{cluster.disclaimer}</p>
      </section>

      <button className="reset caption" onClick={reset}>
        <IcReset sm /> Сбросить прогресс
      </button>

      <div className="foot">
        <button
          className={"btn btn--block label" + (allDone ? " btn--glow" : "")}
          onClick={primary.go}
        >
          {primary.label} <IcArrow sm />
        </button>
      </div>
    </div>
  );
}
