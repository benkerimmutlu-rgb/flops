"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { speak } from "@/lib/speech";
import { useUserState } from "@/lib/store";
import { getFlopsAsset } from "@/brand/flops-assets";
import { Confetti } from "@/components/Confetti";
import { DifficultyConfig } from "./config";
import { BoardCard, MemoryCard } from "./MemoryCard";
import { FlopsAvatar, FlopsMood } from "./FlopsAvatar";
import { MemoryFinish } from "./MemoryFinish";
import {
  AiCard,
  chooseMove,
  createMemory,
  observe,
  prune,
  STRENGTH,
} from "./ai";

type Phase = "peek" | "player" | "flops" | "finished";

// Pacing — slow enough for a 5-year-old to follow each flip, brisk enough that
// an adult never waits around.
const THINK_MS = 850; // Flops "thinks" before reaching for a card
const STEP_MS = 650; // gap between Flops's first and second flip
const MATCH_PAUSE = 650; // beat before a matched pair celebrates
const MATCH_HOLD = 850; // how long a matched pair stays before vanishing
const MISS_HOLD = 1000; // how long a mismatch stays face-up before flipping back
const FLIP_BACK = 650; // settle time after a mismatch before the next turn

const FLOPS_THINK = [
  "Хмм… где же пара?",
  "Дай-ка подумать…",
  "Чешу за ухом…",
  "Кажется, я это видел!",
  "Так-так-так…",
];
const FLOPS_HAPPY = ["Нашёл! Гав!", "Ура, пара!", "Вот это да!", "Гав-гав!"];
const FLOPS_SAD = ["Ой, мимо…", "Опять не то!", "Ну почти!", "Эх, забыл…"];
const PLAYER_TURN = [
  "Твой ход! Открой две карточки.",
  "Давай, ищи пару!",
  "Теперь ты!",
];
const PLAYER_PRAISE = [
  "Ух ты, ты нашёл пару! 🎉",
  "Вот это память! Молодец!",
  "Супер! Так держать!",
  "Ты лучше меня! 🐾",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function MemoryGame({
  initialCards,
  config,
  onReplay,
}: {
  initialCards: BoardCard[];
  config: DifficultyConfig;
  onReplay: () => void;
}) {
  const { addBones } = useUserState();
  const pairs = config.pairs;
  const strength = STRENGTH[config.id]; // how hard Flops plays this level

  const [cards, setCards] = useState<BoardCard[]>(initialCards);
  const [phase, setPhase] = useState<Phase>("peek");
  const [flipped, setFlipped] = useState<number[]>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [flopsScore, setFlopsScore] = useState(0);
  const [locked, setLocked] = useState(true);
  const [mood, setMood] = useState<FlopsMood>("peek");
  const [line, setLine] = useState("Смотри и запоминай!");
  const [highlight, setHighlight] = useState<{
    ids: number[];
    by: "player" | "flops";
  } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [peekLeft, setPeekLeft] = useState(Math.ceil(config.peekMs / 1000));
  const [bonesEarned, setBonesEarned] = useState(0);

  // Mutable game data read inside async timeouts (always fresh, unlike closures).
  const memory = useRef(createMemory());
  const cardsRef = useRef(cards);
  const playerRef = useRef(0);
  const flopsRef = useRef(0);
  const timers = useRef<number[]>([]);
  const finished = useRef(false);

  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  function later(ms: number, fn: () => void) {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }

  // Clear every pending timer on unmount (covers mid-animation navigation).
  useEffect(() => {
    const ids = timers.current;
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, []);

  const toAi = (c: BoardCard): AiCard => ({
    id: c.id,
    code: c.code,
    matched: c.matched,
  });
  const cardById = (id: number) => cardsRef.current.find((c) => c.id === id)!;

  // ── Peek phase: whole board open, Flops studies it too, then it covers up. ──
  useEffect(() => {
    initialCards.forEach((c) =>
      observe(memory.current, toAi(c), strength.recall)
    );
    const tick = window.setInterval(
      () => setPeekLeft((v) => (v > 1 ? v - 1 : v)),
      1000
    );
    timers.current.push(tick as unknown as number);
    later(config.peekMs, () => {
      window.clearInterval(tick);
      setPhase("player");
      setMood("idle");
      setLine(pick(PLAYER_TURN));
      setLocked(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  function finishGame() {
    finished.current = true;
    // Always rewarding, but a win is worth more — Flops can now win on hard/expert.
    const won = playerRef.current > flopsRef.current;
    const reward = playerRef.current + (won ? 3 : 1);
    setBonesEarned(reward);
    addBones(reward);
    setMood(won ? "happy" : "sad");
    setPhase("finished");
  }

  function resolve(aId: number, bId: number, by: "player" | "flops") {
    const a = cardById(aId);
    const b = cardById(bId);
    const isMatch = a.code === b.code;

    if (isMatch) {
      later(MATCH_PAUSE, () => {
        setHighlight({ ids: [aId, bId], by });
        setShowConfetti(true);
        speak(a.country.name, "ru-RU");
        if (by === "player") {
          setMood("idle");
          setLine(pick(PLAYER_PRAISE));
        } else {
          setMood("happy");
          setLine(pick(FLOPS_HAPPY));
        }
        later(MATCH_HOLD, () => {
          const updated = cardsRef.current.map((c) =>
            c.id === aId || c.id === bId
              ? { ...c, matched: true, matchedBy: by }
              : c
          );
          cardsRef.current = updated;
          setCards(updated);
          prune(memory.current, updated.map(toAi));
          setFlipped([]);
          setHighlight(null);
          setShowConfetti(false);

          if (by === "player") {
            playerRef.current += 1;
            setPlayerScore(playerRef.current);
          } else {
            flopsRef.current += 1;
            setFlopsScore(flopsRef.current);
          }

          if (updated.every((c) => c.matched)) {
            finishGame();
            return;
          }
          // A match earns another turn (standard Memory rule).
          if (by === "player") {
            setPhase("player");
            setMood("idle");
            setLine("Снова твой ход!");
            setLocked(false);
          } else {
            runFlopsTurn();
          }
        });
      });
    } else {
      later(MISS_HOLD, () => {
        if (by === "player") {
          setMood("idle");
          setLine("Почти! Теперь ход Флопса.");
        } else {
          setMood("sad");
          setLine(pick(FLOPS_SAD));
        }
        later(FLIP_BACK, () => {
          setFlipped([]);
          if (by === "player") {
            runFlopsTurn();
          } else {
            setPhase("player");
            setMood("idle");
            setLine(pick(PLAYER_TURN));
            setLocked(false);
          }
        });
      });
    }
  }

  function runFlopsTurn() {
    setPhase("flops");
    setLocked(true);
    setMood("think");
    setLine(pick(FLOPS_THINK));
    later(THINK_MS, () => {
      const [aId, bId] = chooseMove(
        cardsRef.current.map(toAi),
        memory.current,
        flopsRef.current,
        strength.cap,
        strength.forget
      );
      setFlipped([aId]);
      observe(memory.current, toAi(cardById(aId)), strength.recall);
      later(STEP_MS, () => {
        setFlipped([aId, bId]);
        observe(memory.current, toAi(cardById(bId)), strength.recall);
        resolve(aId, bId, "flops");
      });
    });
  }

  function handleCard(card: BoardCard) {
    if (
      locked ||
      phase !== "player" ||
      card.matched ||
      flipped.includes(card.id)
    )
      return;
    const next = [...flipped, card.id];
    setFlipped(next);
    observe(memory.current, toAi(card), strength.recall);
    if (next.length === 2) {
      setLocked(true);
      resolve(next[0], next[1], "player");
    }
  }

  if (phase === "finished") {
    return (
      <MemoryFinish
        outcome={
          playerScore > flopsScore
            ? "win"
            : playerScore < flopsScore
            ? "lose"
            : "tie"
        }
        playerScore={playerScore}
        flopsScore={flopsScore}
        bonesEarned={bonesEarned}
        onReplay={onReplay}
      />
    );
  }

  const turnLabel =
    phase === "peek"
      ? `Флопс закроет карты через ${peekLeft}…`
      : phase === "flops"
      ? "Ход Флопса"
      : "Твой ход";

  return (
    <div className="flex flex-col gap-5">
      {/* Табло + ход */}
      <div className="flex items-center justify-between gap-3">
        <Score label="Ты" score={playerScore} tone="green" />
        <span className="text-center text-sm font-bold text-muted">
          {turnLabel}
        </span>
        <Score label="Флопс" score={flopsScore} tone="blue" />
      </div>

      {/* Флопс — живой соперник */}
      <FlopsAvatar mood={mood} line={line} />

      {/* Поле */}
      <div className="relative">
        {showConfetti && <Confetti pieces={30} />}
        <div
          className="mx-auto grid w-full gap-2.5 sm:gap-3"
          style={{
            // Board width scales with column count so cards keep a comfortable,
            // tappable size and flags stay legible from easy (2 cols) to expert
            // (4 cols × 5 rows).
            gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
            maxWidth: config.cols <= 2 ? 340 : config.cols === 3 ? 480 : 580,
          }}
        >
          {cards.map((card, i) => (
            <MemoryCard
              key={card.id}
              card={card}
              index={i}
              faceUp={phase === "peek" || flipped.includes(card.id)}
              highlight={
                highlight?.ids.includes(card.id) ? highlight.by : null
              }
              disabled={locked || phase !== "player"}
              onClick={() => handleCard(card)}
            />
          ))}
        </div>
      </div>

      <button
        onClick={onReplay}
        className="mx-auto mt-1 flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-[15px] font-bold text-muted hover:bg-black/[0.03]"
      >
        <Image
          src={getFlopsAsset("ops_sleep")}
          alt=""
          width={22}
          height={22}
          className="h-5 w-5 object-contain"
        />
        Начать заново
      </button>
    </div>
  );
}

function Score({
  label,
  score,
  tone,
}: {
  label: string;
  score: number;
  tone: "green" | "blue";
}) {
  const color = tone === "green" ? "text-brand-green" : "text-brand-blue";
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5">
      <Image
        src={getFlopsAsset("bone_currency")}
        alt=""
        width={20}
        height={20}
        className="h-5 w-5 object-contain"
      />
      <span className="text-sm font-bold text-foreground">{label}</span>
      <span className={`text-xl font-bold ${color}`}>{score}</span>
    </div>
  );
}
