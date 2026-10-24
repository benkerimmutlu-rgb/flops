"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IcArrow, IcCheck, IcLeft, IcReset, IcVoice } from "@/components/icons";
import type { Cluster, Topic, SimOption, SimOptionQuality } from "@/types/content";

type LogItem =
  | { type: "client"; text: string }
  | { type: "me"; text: string; quality: SimOptionQuality }
  | { type: "fb"; text: string; quality: SimOptionQuality };

const QUALITY_LABEL: Record<SimOptionQuality, string> = {
  good: "Удачно",
  ok: "Спорно",
  poor: "Неудачно",
};

export function SimView({ cluster, topic }: { cluster: Cluster; topic: Topic }) {
  const router = useRouter();
  const sim = topic.simulation!;
  const nodeById = useMemo(
    () => Object.fromEntries(sim.nodes.map((n) => [n.id, n])),
    [sim],
  );
  const backToTopic = () => router.push(`/topic/${topic.id}`);

  const [log, setLog] = useState<LogItem[]>([
    { type: "client", text: nodeById[sim.start].client },
  ]);
  const [current, setCurrent] = useState<string | null>(sim.start);
  const [good, setGood] = useState(0);
  const [total, setTotal] = useState(0);

  const node = current ? nodeById[current] : null;

  const choose = (o: SimOption) => {
    setLog((prev) => {
      const next: LogItem[] = [
        ...prev,
        { type: "me", text: o.text, quality: o.quality },
        { type: "fb", text: o.feedback, quality: o.quality },
      ];
      if (o.next) next.push({ type: "client", text: nodeById[o.next].client });
      return next;
    });
    setTotal((t) => t + 1);
    if (o.quality === "good") setGood((g) => g + 1);
    setCurrent(o.next);
  };

  const restart = () => {
    setLog([{ type: "client", text: nodeById[sim.start].client }]);
    setCurrent(sim.start);
    setGood(0);
    setTotal(0);
  };

  const finished = current === null;

  return (
    <div className="screen">
      <div className="appbar">
        <button className="iconbtn" aria-label="Назад" onClick={backToTopic}>
          <IcLeft />
        </button>
        <span className="appbar__title overline">{sim.title}</span>
        <span className="appbar__end caption">Кейс</span>
      </div>

      {total === 0 && (
        <section className="callout callout--note">
          <h3 className="callout__head overline">
            <IcVoice sm />
            Кейс-симуляция
          </h3>
          <p className="callout__text body">{sim.intro}</p>
        </section>
      )}

      {/* Диалог */}
      <div className="chat">
        <div className="chat__who caption mute">
          <span className="case__ava title-sm" aria-hidden="true">
            {cluster.avatar.name.charAt(0)}
          </span>
          {cluster.avatar.name}
        </div>
        {log.map((item, i) => {
          if (item.type === "client")
            return (
              <div className="bubble bubble--client body" key={i}>
                {item.text}
              </div>
            );
          if (item.type === "me")
            return (
              <div className="bubble bubble--me body" key={i}>
                {item.text}
              </div>
            );
          return (
            <div className={"bubble bubble--fb bubble--" + item.quality} key={i}>
              <span className="bubble__verdict label-sm">
                {item.quality === "good" ? <IcCheck sm /> : null}
                {QUALITY_LABEL[item.quality]}
              </span>
              <span className="caption">{item.text}</span>
            </div>
          );
        })}
      </div>

      {/* Варианты реплик */}
      {node && (
        <div className="col" style={{ gap: "var(--space-3)" }}>
          <span className="section__over overline">Ваш ответ клиенту</span>
          {node.options.map((o, k) => (
            <button
              key={k}
              className="option"
              onClick={() => choose(o)}
              style={{ cursor: "pointer" }}
            >
              <span className="option__main">
                <span className="body">{o.text}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Итог */}
      {finished && (
        <>
          <div className="resultbar resultbar--ok">
            <IcCheck />
            <span className="label">
              Удачных решений: {good} из {total}
            </span>
          </div>
          <section className="callout callout--note">
            <p className="callout__text body">{sim.outro}</p>
          </section>
          <div className="foot">
            <button className="btn btn--glow btn--block label" onClick={restart}>
              <IcReset sm /> Пройти заново
            </button>
            <button
              className="btn btn--secondary btn--block label"
              onClick={backToTopic}
            >
              К теме <IcArrow sm />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
