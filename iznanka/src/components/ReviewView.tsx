"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/lib/progress";
import { buildDeck, dueCards, type DeckCard } from "@/lib/deck";
import { IcArrow, IcCheck, IcLeft, IcReset } from "@/components/icons";
import type { SrsGrade } from "@/types/content";

const GRADES: { grade: SrsGrade; label: string; cls: string }[] = [
  { grade: "again", label: "Не помню", cls: "grade--again" },
  { grade: "hard", label: "Сложно", cls: "grade--hard" },
  { grade: "good", label: "Хорошо", cls: "grade--good" },
  { grade: "easy", label: "Легко", cls: "grade--easy" },
];

export function ReviewView() {
  const router = useRouter();
  const { srs, gradeCard } = useProgress();
  const deck = useMemo(() => buildDeck(), []);

  // Очередь фиксируется на старте сессии (по текущему srs).
  const [queue, setQueue] = useState<DeckCard[]>(() => dueCards(deck, srs));
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(0);
  const startCount = useRef(queue.length);

  const current = queue[0];

  const grade = (g: SrsGrade) => {
    if (!current) return;
    gradeCard(current.key, g);
    setRevealed(false);
    setQueue((q) => {
      const [first, ...rest] = q;
      return g === "again" ? [...rest, first] : rest;
    });
    if (g !== "again") setDone((d) => d + 1);
  };

  const restartAll = () => {
    setQueue(deck);
    setRevealed(false);
    setDone(0);
    startCount.current = deck.length;
  };

  // ── Нет карточек к повторению ──
  if (!current) {
    const nothingEver = startCount.current === 0 && done === 0;
    return (
      <div className="screen screen--anim">
        <div className="appbar">
          <button className="iconbtn" aria-label="Назад" onClick={() => router.push("/")}>
            <IcLeft />
          </button>
          <span className="appbar__title overline">Повторение</span>
          <span className="appbar__end" />
        </div>
        <div
          className="col"
          style={{ alignItems: "center", gap: "var(--space-6)", marginTop: "var(--space-10)" }}
        >
          <span className="appicon" aria-hidden="true">
            <span>A</span>
          </span>
          <h1 className="title-lg" style={{ textAlign: "center" }}>
            {nothingEver ? "Пока нечего повторять" : "Всё повторено"}
          </h1>
          <p className="card__text body" style={{ textAlign: "center", maxWidth: "32ch" }}>
            {nothingEver
              ? "Открывайте темы — термины глоссария появятся здесь для интервального повторения."
              : "На сегодня карточек нет. Возвращайтесь позже — расписание подскажет, когда повторить."}
          </p>
        </div>
        <div className="foot">
          <button className="btn btn--secondary btn--block label" onClick={restartAll}>
            <IcReset sm /> Повторить все термины
          </button>
          <button className="btn btn--block label" onClick={() => router.push("/")}>
            К курсам <IcArrow sm />
          </button>
        </div>
      </div>
    );
  }

  const total = done + queue.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="screen">
      <div className="appbar">
        <button className="iconbtn" aria-label="Назад" onClick={() => router.push("/")}>
          <IcLeft />
        </button>
        <span className="appbar__title overline">Повторение</span>
        <span className="appbar__end caption">Осталось: {queue.length}</span>
      </div>

      <div className="progress">
        <div className="progress__track">
          <div className="progress__fill" style={{ width: pct + "%" }} />
        </div>
      </div>

      <div className="flashcard" key={current.key}>
        <span className="flashcard__src overline mute">{current.topicTitle}</span>
        <h1 className="title-lg">{current.term}</h1>
        {revealed ? (
          <p className="flashcard__def reading soft">{current.definition}</p>
        ) : (
          <p className="flashcard__hint caption mute">Вспомните определение</p>
        )}
      </div>

      <div className="foot">
        {revealed ? (
          <div className="gradegrid">
            {GRADES.map((g) => (
              <button
                key={g.grade}
                className={"btn label " + g.cls}
                onClick={() => grade(g.grade)}
              >
                {g.label}
              </button>
            ))}
          </div>
        ) : (
          <button
            className="btn btn--glow btn--block label"
            onClick={() => setRevealed(true)}
          >
            Показать определение <IcCheck sm />
          </button>
        )}
      </div>
    </div>
  );
}
