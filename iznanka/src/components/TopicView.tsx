"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/lib/progress";
import {
  IcArrow,
  IcCheck,
  IcFlag,
  IcLeft,
  IcRight,
  IcVoice,
  IcX,
} from "@/components/icons";
import type { Cluster, Topic } from "@/types/content";

type Tab = "cards" | "theory" | "practice";
const TABS: [Tab, string][] = [
  ["cards", "Быстрый старт"],
  ["theory", "Теория"],
  ["practice", "В кабинете"],
];

export function TopicView({
  cluster,
  topic,
}: {
  cluster: Cluster;
  topic: Topic;
}) {
  const router = useRouter();
  const { status, openTopic, masterTopic } = useProgress();
  const [tab, setTab] = useState<Tab>("cards");

  // «Не изучено» → «В процессе» при открытии темы.
  useEffect(() => {
    openTopic(topic.id);
  }, [topic.id, openTopic]);

  const idx = TABS.findIndex((t) => t[0] === tab) + 1;
  const isDone = status[topic.id] === "done";
  const canTest = cluster.topics.every((t) => status[t.id] === "done");
  const topicNo = cluster.topics.findIndex((t) => t.id === topic.id) + 1;
  const backToMap = () => router.push(`/cluster/${cluster.id}`);

  return (
    <div className="screen screen--anim">
      <div className="appbar">
        <button className="iconbtn" aria-label="Назад" onClick={backToMap}>
          <IcLeft />
        </button>
        <span className="appbar__title overline">
          Тема {topicNo} · {cluster.title}
        </span>
        <span className="appbar__end caption">{idx} / 3</span>
      </div>

      <h1 className="title-md">{topic.title}</h1>

      <div className="tabs" role="tablist">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            className="tab label-sm"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "cards" && (
        <CardsTab topic={topic} onDone={() => setTab("theory")} />
      )}
      {tab === "theory" && (
        <TheoryTab topic={topic} onDone={() => setTab("practice")} />
      )}
      {tab === "practice" && (
        <PracticeTab
          topic={topic}
          isDone={isDone}
          canTest={canTest}
          onMaster={() => {
            masterTopic(topic.id);
            backToMap();
          }}
          onGoTest={() => router.push(`/test/${cluster.id}`)}
          onSim={() => router.push(`/sim/${topic.id}`)}
        />
      )}
    </div>
  );
}

function CardsTab({ topic, onDone }: { topic: Topic; onDone: () => void }) {
  const [i, setI] = useState(0);
  const n = topic.cards.length;
  const raw = topic.cards[i];
  const sep = raw.indexOf(": ");
  const head = sep > -1 ? raw.slice(0, sep) : null;
  const text = sep > -1 ? raw.slice(sep + 2) : raw;
  const last = i === n - 1;

  // Свайп-жесты (мышь + тач через pointer events).
  const start = useRef<number | null>(null);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const THRESHOLD = 60;

  const goNext = () => (last ? onDone() : setI((v) => v + 1));
  const goPrev = () => i > 0 && setI((v) => v - 1);

  const onDown = (e: React.PointerEvent) => {
    start.current = e.clientX;
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (start.current === null) return;
    setDx(e.clientX - start.current);
  };
  const onUp = () => {
    if (start.current === null) return;
    if (dx <= -THRESHOLD) goNext();
    else if (dx >= THRESHOLD) goPrev();
    start.current = null;
    setDragging(false);
    setDx(0);
  };

  return (
    <div className={"swipe" + (last ? " swipe--last" : "")}>
      <div
        className={"swipe__card" + (dragging ? " swipe__card--dragging" : "")}
        style={{
          transform: `translateX(${dx}px) rotate(${dx * 0.02}deg)`,
          opacity: 1 - Math.min(Math.abs(dx) / 500, 0.35),
        }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <span className="swipe__count overline">
          Карточка {i + 1} из {n}
        </span>
        {head && <h2 className="title-lg">{head}</h2>}
        <p className="swipe__body reading">{text}</p>
        <div className="swipe__foot">
          <div className="dots" role="tablist" aria-label="Карточки">
            {topic.cards.map((_, k) => (
              <button
                key={k}
                className="dot"
                aria-current={k === i}
                aria-label={"Карточка " + (k + 1)}
                onClick={() => setI(k)}
              />
            ))}
          </div>
          {last ? (
            <button className="btn label" onClick={onDone}>
              К теории <IcArrow sm />
            </button>
          ) : (
            <div className="row" style={{ gap: "var(--space-2)" }}>
              {i > 0 && (
                <button
                  className="iconbtn"
                  aria-label="Назад"
                  onClick={() => setI(i - 1)}
                >
                  <IcLeft />
                </button>
              )}
              <button
                className="iconbtn iconbtn--neon iconbtn--glow"
                aria-label="Дальше"
                onClick={() => setI(i + 1)}
              >
                <IcRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TheoryTab({ topic, onDone }: { topic: Topic; onDone: () => void }) {
  return (
    <>
      <div className="section">
        <span className="section__over overline">Теоретическая база</span>
        <div className="longread reading">{topic.longread}</div>
      </div>
      <div className="section">
        <span className="section__over overline">Глоссарий</span>
        <dl className="gloss">
          {topic.glossary.map((g, k) => (
            <div className="gloss__row" key={k}>
              <dt className="title-sm">
                <span className="term">{g.term}</span>
              </dt>
              <dd className="gloss__def body">{g.definition}</dd>
            </div>
          ))}
        </dl>
      </div>
      {topic.references && topic.references.length > 0 && (
        <div className="section">
          <span className="section__over overline">Доказательная база</span>
          <ul className="gloss">
            {topic.references.map((r, k) => (
              <li className="gloss__row" key={k}>
                {r.url ? (
                  <a
                    className="title-sm term"
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {r.source}
                  </a>
                ) : (
                  <span className="title-sm">{r.source}</span>
                )}
                {r.note && <span className="gloss__def body">{r.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="foot">
        <button className="btn btn--block label" onClick={onDone}>
          В кабинет <IcArrow sm />
        </button>
      </div>
    </>
  );
}

function PracticeTab({
  topic,
  isDone,
  canTest,
  onMaster,
  onGoTest,
  onSim,
}: {
  topic: Topic;
  isDone: boolean;
  canTest: boolean;
  onMaster: () => void;
  onGoTest: () => void;
  onSim: () => void;
}) {
  const p = topic.practice;
  return (
    <>
      <section className="callout callout--voice">
        <h3 className="callout__head overline">
          <IcVoice sm />
          Сказать клиенту
        </h3>
        <p className="callout__text reading">{p.psychoeducation}</p>
      </section>

      {topic.simulation && (
        <button className="simlaunch" onClick={onSim}>
          <span className="simlaunch__icon" aria-hidden="true">
            <IcVoice />
          </span>
          <span className="simlaunch__main">
            <span className="title-sm">{topic.simulation.title}</span>
            <span className="caption mute">
              Кейс-симуляция: потренируйте реплики
            </span>
          </span>
          <span className="node__go">
            <IcArrow sm />
          </span>
        </button>
      )}
      <section className="callout">
        <h3 className="callout__head overline">
          <IcX sm />
          Частая ошибка
        </h3>
        <p className="callout__text body">{p.mistake}</p>
      </section>
      <section className="callout callout--flag">
        <h3 className="callout__head overline">
          <IcFlag sm />
          Красные флаги
        </h3>
        <p className="callout__text body">{p.red_flags}</p>
      </section>
      <div className="foot">
        {isDone ? (
          <>
            <button className="btn btn--block label" disabled>
              Тема освоена <IcCheck sm />
            </button>
            {canTest && (
              <button
                className="btn btn--secondary btn--block label"
                onClick={onGoTest}
              >
                К итоговому тесту <IcArrow sm />
              </button>
            )}
          </>
        ) : (
          <button className="btn btn--glow btn--block label" onClick={onMaster}>
            Отметить тему освоенной <IcCheck sm />
          </button>
        )}
      </div>
    </>
  );
}
