"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/lib/progress";
import {
  IcAlert,
  IcArrow,
  IcCheck,
  IcChevDown,
  IcChevUp,
  IcLeft,
  IcReset,
  IcX,
} from "@/components/icons";
import type {
  Cluster,
  MultiQuestion,
  OrderQuestion,
  SingleQuestion,
  TestQuestion,
} from "@/types/content";

const BADGES = ["А", "Б", "В", "Г", "Д"];

export function TestView({ cluster }: { cluster: Cluster }) {
  const router = useRouter();
  const { passTest } = useProgress();

  const questions = cluster.test.questions;
  const total = questions.length;
  const passScore = cluster.test.passScore ?? total;
  const backToMap = () => router.push(`/cluster/${cluster.id}`);

  const [step, setStep] = useState(0);
  const [results, setResults] = useState<(boolean | null)[]>(() =>
    Array(total).fill(null),
  );

  const score = useMemo(() => results.filter((r) => r === true).length, [results]);
  const isResult = step >= total;
  const passed = isResult && score >= passScore;

  useEffect(() => {
    if (passed) passTest(cluster.id);
  }, [passed, cluster.id, passTest]);

  const retry = () => {
    setResults(Array(total).fill(null));
    setStep(0);
  };

  const resolve = (ok: boolean) =>
    setResults((prev) => {
      if (prev[step] !== null) return prev;
      const next = [...prev];
      next[step] = ok;
      return next;
    });

  // ── Результат ──
  if (isResult) {
    return (
      <div className="screen screen--anim">
        <div className="appbar">
          <button className="iconbtn" aria-label="На карту" onClick={backToMap}>
            <IcLeft />
          </button>
          <span className="appbar__title overline">Результат теста</span>
          <span className="appbar__end caption">
            {score} / {total}
          </span>
        </div>
        <div
          className="col"
          style={{ alignItems: "center", gap: "var(--space-6)", marginTop: "var(--space-8)" }}
        >
          <span className={"appicon" + (passed ? "" : " appicon--muted")} aria-hidden="true">
            <span>{passed ? "A" : "!"}</span>
          </span>
          <h1 className="title-lg" style={{ textAlign: "center" }}>
            {passed ? "Кейс закрыт" : "Почти получилось"}
          </h1>
          <p className="card__text body" style={{ textAlign: "center", maxWidth: "32ch" }}>
            Верных ответов: {score} из {total}. Порог прохождения — {passScore}.
          </p>
        </div>
        <div className={"resultbar " + (passed ? "resultbar--ok" : "resultbar--no")}>
          {passed ? <IcCheck /> : <IcAlert />}
          <span className="label">
            {passed ? "Тест пройден" : "Нужно ещё раз пройти разбор"}
          </span>
        </div>
        <div className="foot">
          <button className="btn btn--glow btn--block label" onClick={retry}>
            <IcReset sm /> Пройти заново
          </button>
          <button
            className={"btn btn--block label" + (passed ? " btn--glow" : " btn--secondary")}
            onClick={backToMap}
          >
            Готово <IcArrow sm />
          </button>
        </div>
      </div>
    );
  }

  // ── Вопрос ──
  const q = questions[step];
  const resolved = results[step] !== null;
  const lastQuestion = step === total - 1;

  return (
    <div className="screen screen--anim" key={step}>
      <div className="appbar">
        <button
          className="iconbtn"
          aria-label="Назад"
          onClick={() => (step === 0 ? backToMap() : setStep(step - 1))}
        >
          <IcLeft />
        </button>
        <span className="appbar__title overline">Итоговый кейс-тест</span>
        <span className="appbar__end caption">
          {step + 1} / {total}
        </span>
      </div>

      <section className="card">
        <div className="case">
          <span className="case__ava title-sm" aria-hidden="true">
            {cluster.avatar.name.charAt(0)}
          </span>
          <div className="case__main">
            <h3 className="title-sm">{cluster.avatar.name}</h3>
            <p className="card__text caption">{cluster.avatar.case}</p>
          </div>
        </div>
      </section>

      <QuestionBlock key={q.id} q={q} resolved={resolved} onResolve={resolve} />

      <div className="foot">
        {resolved ? (
          <button className="btn btn--glow btn--block label" onClick={() => setStep(step + 1)}>
            {lastQuestion ? "Показать результат" : "Следующий вопрос"} <IcArrow sm />
          </button>
        ) : (
          <button className="btn btn--secondary btn--block label" onClick={backToMap}>
            Отмена
          </button>
        )}
      </div>
    </div>
  );
}

function QuestionBlock({
  q,
  resolved,
  onResolve,
}: {
  q: TestQuestion;
  resolved: boolean;
  onResolve: (ok: boolean) => void;
}) {
  if (q.kind === "multi")
    return <MultiBlock q={q} resolved={resolved} onResolve={onResolve} />;
  if (q.kind === "order")
    return <OrderBlock q={q} resolved={resolved} onResolve={onResolve} />;
  return <SingleBlock q={q} resolved={resolved} onResolve={onResolve} />;
}

function SingleBlock({
  q,
  resolved,
  onResolve,
}: {
  q: SingleQuestion;
  resolved: boolean;
  onResolve: (ok: boolean) => void;
}) {
  const [sel, setSel] = useState<number | null>(null);
  const answered = sel !== null;
  const mod = (isCorrect: boolean, k: number) => {
    if (!answered) return "";
    if (isCorrect) return " option--correct";
    if (k === sel) return " option--wrong";
    return "";
  };
  const pick = (k: number) => {
    if (answered) return;
    setSel(k);
    onResolve(q.options[k].isCorrect);
  };
  return (
    <>
      <h1 className="title-md">{q.question}</h1>
      <div className="col" style={{ gap: "var(--space-3)" }}>
        {q.options.map((o, k) => {
          const selected = k === sel;
          return (
            <button
              key={k}
              className={
                "option" +
                (selected && !answered ? " option--selected" : "") +
                mod(o.isCorrect, k)
              }
              onClick={() => pick(k)}
              disabled={answered}
            >
              <span className="option__badge">{BADGES[k]}</span>
              <span className="option__main">
                <span className="body">{o.text}</span>
                {answered && (selected || o.isCorrect) && (
                  <>
                    <span className="option__verdict label-sm">
                      {o.isCorrect ? (
                        <>
                          <IcCheck sm /> Верно
                        </>
                      ) : (
                        <>
                          <IcX sm /> Неверно
                        </>
                      )}
                    </span>
                    <span className="option__fb caption">{o.feedback}</span>
                  </>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function MultiBlock({
  q,
  resolved,
  onResolve,
}: {
  q: MultiQuestion;
  resolved: boolean;
  onResolve: (ok: boolean) => void;
}) {
  const [sel, setSel] = useState<Set<number>>(new Set());
  const toggle = (k: number) =>
    !resolved &&
    setSel((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  const check = () => {
    const ok = q.options.every((o, k) => o.isCorrect === sel.has(k));
    onResolve(ok);
  };
  const mod = (isCorrect: boolean, k: number) => {
    if (!resolved) return sel.has(k) ? " option--selected" : "";
    if (isCorrect) return " option--correct";
    if (sel.has(k)) return " option--wrong";
    return "";
  };
  return (
    <>
      <h1 className="title-md">{q.question}</h1>
      <span className="caption mute">Выберите все верные варианты</span>
      <div className="col" style={{ gap: "var(--space-3)" }}>
        {q.options.map((o, k) => (
          <button
            key={k}
            className={"option" + mod(o.isCorrect, k)}
            onClick={() => toggle(k)}
            disabled={resolved}
          >
            <span className="option__badge">{sel.has(k) ? <IcCheck sm /> : BADGES[k]}</span>
            <span className="option__main">
              <span className="body">{o.text}</span>
              {resolved && (
                <>
                  <span className="option__verdict label-sm">
                    {o.isCorrect ? (
                      <>
                        <IcCheck sm /> Верно
                      </>
                    ) : (
                      <>
                        <IcX sm /> Неверно
                      </>
                    )}
                  </span>
                  <span className="option__fb caption">{o.feedback}</span>
                </>
              )}
            </span>
          </button>
        ))}
      </div>
      {resolved ? (
        <section className="callout callout--note">
          <p className="callout__text body">{q.feedback}</p>
        </section>
      ) : (
        <button className="btn btn--secondary btn--block label" onClick={check}>
          Проверить
        </button>
      )}
    </>
  );
}

function OrderBlock({
  q,
  resolved,
  onResolve,
}: {
  q: OrderQuestion;
  resolved: boolean;
  onResolve: (ok: boolean) => void;
}) {
  // order — текущий порядок как индексы исходных (правильных) позиций.
  const [order, setOrder] = useState<number[]>(() => shuffle(q.items.length));
  const move = (pos: number, dir: -1 | 1) => {
    if (resolved) return;
    const to = pos + dir;
    if (to < 0 || to >= order.length) return;
    setOrder((prev) => {
      const next = [...prev];
      [next[pos], next[to]] = [next[to], next[pos]];
      return next;
    });
  };
  const check = () => onResolve(order.every((idx, pos) => idx === pos));
  return (
    <>
      <h1 className="title-md">{q.question}</h1>
      <span className="caption mute">Расставьте шаги в правильном порядке</span>
      <ol className="orderlist">
        {order.map((idx, pos) => {
          const right = resolved && idx === pos;
          const wrong = resolved && idx !== pos;
          return (
            <li
              className={"orderitem" + (right ? " orderitem--ok" : "") + (wrong ? " orderitem--no" : "")}
              key={idx}
            >
              <span className="orderitem__num">{pos + 1}</span>
              <span className="orderitem__text body min0">{q.items[idx]}</span>
              {!resolved && (
                <span className="orderitem__ctrl">
                  <button
                    className="iconbtn"
                    aria-label="Выше"
                    onClick={() => move(pos, -1)}
                    disabled={pos === 0}
                  >
                    <IcChevUp sm />
                  </button>
                  <button
                    className="iconbtn"
                    aria-label="Ниже"
                    onClick={() => move(pos, 1)}
                    disabled={pos === order.length - 1}
                  >
                    <IcChevDown sm />
                  </button>
                </span>
              )}
              {resolved && (
                <span className="orderitem__mark">
                  {right ? <IcCheck sm /> : <IcX sm />}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {resolved ? (
        <section className="callout callout--note">
          <p className="callout__text body">{q.feedback}</p>
        </section>
      ) : (
        <button className="btn btn--secondary btn--block label" onClick={check}>
          Проверить
        </button>
      )}
    </>
  );
}

// Перемешивание индексов (гарантированно не исходный порядок при n > 1).
function shuffle(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (n > 1 && a.every((v, i) => v === i)) {
    [a[0], a[1]] = [a[1], a[0]];
  }
  return a;
}
