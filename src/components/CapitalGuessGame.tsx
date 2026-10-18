"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CountryLite } from "@/lib/types";
import { pickCapitalDistractors, shuffle } from "@/lib/data";
import { FlagImage, FLAG_VIEWBOX } from "@/lib/flags";
import { speak } from "@/lib/speech";
import { useUserState } from "@/lib/store";
import { getFlopsAsset } from "@/brand/flops-assets";
import { Confetti } from "./Confetti";

// Same guessing mechanic as the flags game, but the flag + country name are the
// prompt and the four options are capitals (each with a 🔊 for pre-readers).
// Wrong answers are collected for an in-session "повтори ошибки" round — the
// capitals quiz keeps its own scoring and does not touch the flag known/repeat
// state, so a child's flag progress stays separate from their capitals progress.
export function CapitalGuessGame({
  pool,
  onRestart,
}: {
  pool: CountryLite[];
  onRestart: () => void;
}) {
  const { addBones } = useUserState();
  const [queue, setQueue] = useState<CountryLite[]>(pool);
  const [step, setStep] = useState(0);
  const [options, setOptions] = useState<CountryLite[]>([]);
  const [answerCode, setAnswerCode] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [wrongList, setWrongList] = useState<CountryLite[]>([]);
  const [done, setDone] = useState(false);

  const target = queue[step];

  // Build 4 options (target + 3 other capitals) after mount / per step so SSR
  // and the first client render agree (the shuffle is impure).
  useEffect(() => {
    if (!target) return;
    const distractors = pickCapitalDistractors(target, 3);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- randomize-after-mount
    setOptions(shuffle([target, ...distractors]));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnswerCode(null);
  }, [step, target]);

  if (!target) return null;

  function choose(code: string) {
    if (answerCode || !target) return;
    setAnswerCode(code);
    // Always read the correct capital aloud — celebrates a right answer and,
    // on a wrong one, tells a pre-reader which capital it actually was.
    speak(target.capital!, "ru-RU");
    if (code === target.code) {
      setCorrect((c) => c + 1);
      addBones(1);
    } else {
      setWrongList((w) =>
        w.some((c) => c.code === target.code) ? w : [...w, target]
      );
    }
  }

  function advance() {
    if (step + 1 >= queue.length) setDone(true);
    else setStep((s) => s + 1);
  }

  function repeatWrong() {
    setQueue(wrongList);
    setWrongList([]);
    setStep(0);
    setCorrect(0);
    setDone(false);
  }

  if (done) {
    return (
      <Results
        correct={correct}
        wrong={wrongList.length}
        total={queue.length}
        onRepeat={wrongList.length > 0 ? repeatWrong : undefined}
        onRestart={onRestart}
      />
    );
  }

  const isCorrect = answerCode === target.code;
  const ratio = FLAG_VIEWBOX[target.code] ?? { w: 3, h: 2 };

  return (
    <div className="flex flex-col gap-5">
      {/* Прогресс */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-muted">
          Вопрос {step + 1} / {queue.length}
        </span>
        <div className="flex items-center gap-1.5">
          <Image src={getFlopsAsset("bone_currency")} alt="" width={18} height={18} className="h-4.5 w-4.5 object-contain" />
          <span className="text-sm font-bold text-brand-green">{correct}</span>
        </div>
      </div>

      {/* Карточка: флаг + страна, угадай столицу */}
      <div className="relative flex flex-col items-center gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
        {answerCode && isCorrect && <Confetti />}

        <div
          className="w-full max-w-[220px] overflow-hidden rounded-2xl bg-white shadow-inner ring-1 ring-border"
          style={{ aspectRatio: `${ratio.w} / ${ratio.h}` }}
        >
          <FlagImage code={target.code} fit="cover" />
        </div>
        <p className="text-center text-xl font-bold text-foreground">{target.name}</p>
        <p className="text-center text-base font-semibold text-muted">
          Какая столица?
        </p>

        {/* 4 варианта-столицы с озвучкой */}
        <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
          {options.map((opt) => {
            const chosen = answerCode === opt.code;
            const isTarget = opt.code === target.code;
            const show = answerCode !== null;
            const state = !show
              ? "idle"
              : isTarget
              ? "right"
              : chosen
              ? "wrong"
              : "dim";
            return (
              <div
                key={opt.code}
                className={`flex items-center gap-2 rounded-2xl border p-1.5 pl-3 transition-colors ${
                  state === "idle"
                    ? "border-border bg-surface hover:bg-black/[0.03]"
                    : state === "right"
                    ? "border-brand-green bg-brand-green/10"
                    : state === "wrong"
                    ? "border-brand-red bg-brand-red/10"
                    : "border-border opacity-50"
                }`}
              >
                {/* Озвучка — для нечитающих детей */}
                <button
                  type="button"
                  onClick={() => speak(opt.capital!, "ru-RU")}
                  aria-label={`Послушать: ${opt.capital}`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20"
                >
                  <Image src={getFlopsAsset("sound_speaker")} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
                </button>
                {/* Выбор ответа */}
                <button
                  type="button"
                  disabled={show}
                  onClick={() => choose(opt.code)}
                  className="flex-1 py-2 text-left text-[17px] font-bold text-foreground disabled:cursor-default"
                >
                  {opt.capital}
                </button>
              </div>
            );
          })}
        </div>

        {/* Фидбэк */}
        {answerCode && (
          <Feedback
            correct={isCorrect}
            code={target.code}
            countryName={target.name}
            capital={target.capital!}
            onNext={advance}
            last={step + 1 >= queue.length}
          />
        )}
      </div>

      {!answerCode && (
        <p className="text-center text-xs text-muted">
          Нажми на 🔊 рядом со столицей, чтобы послушать название.
        </p>
      )}
    </div>
  );
}

function Feedback({
  correct,
  code,
  countryName,
  capital,
  onNext,
  last,
}: {
  correct: boolean;
  code: string;
  countryName: string;
  capital: string;
  onNext: () => void;
  last: boolean;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        <Image
          src={getFlopsAsset(correct ? "ops_celebrate" : "ops_worried_badge")}
          alt=""
          width={64}
          height={64}
          className={`h-16 w-16 object-contain ${correct ? "flops-pop" : ""}`}
        />
        <p className={`text-base font-bold ${correct ? "text-brand-green" : "text-foreground"}`}>
          {correct ? (
            <>Молодец! Столица — <span className="text-brand-green">{capital}</span> 🎉</>
          ) : (
            <>
              Почти! Столица страны {countryName} —{" "}
              <span className="text-brand-blue">{capital}</span> 🙂
            </>
          )}
        </p>
      </div>
      <div className="flex w-full flex-col items-center gap-2">
        <button
          onClick={onNext}
          className="rounded-full bg-brand-green px-7 py-3 text-[17px] font-bold text-white shadow-[var(--shadow-card)] active:scale-95"
        >
          {last ? "Готово →" : "Дальше →"}
        </button>
        <Link href={`/world/${code}`} className="text-sm font-semibold text-brand-blue hover:underline">
          Узнать больше о стране →
        </Link>
      </div>
    </div>
  );
}

function Results({
  correct,
  wrong,
  total,
  onRepeat,
  onRestart,
}: {
  correct: number;
  wrong: number;
  total: number;
  onRepeat?: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-[var(--radius-card)] border border-border bg-surface p-8 text-center shadow-[var(--shadow-card)]">
      <Image
        src={getFlopsAsset("ops_celebrate")}
        alt="Флопс радуется"
        width={160}
        height={160}
        priority
        className="h-36 w-36 object-contain flops-bob"
      />
      <h2 className="text-2xl font-bold text-foreground">Заход окончен!</h2>
      <div className="flex items-center gap-2 text-lg font-bold">
        <Image src={getFlopsAsset("bone_currency")} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
        <span className="text-brand-green">+{correct}</span>
        <span className="text-muted">косточек</span>
      </div>
      <p className="text-muted">
        Угадал <b className="text-foreground">{correct}</b> из {total}{" "}
        {capitalWord(total)}
        {wrong > 0 && (
          <>
            {" "}· ошибок: <b className="text-foreground">{wrong}</b>
          </>
        )}
      </p>
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
        {onRepeat && (
          <button
            onClick={onRepeat}
            className="rounded-full border border-border bg-surface px-6 py-3 text-center text-[17px] font-bold text-foreground hover:bg-black/[0.03]"
          >
            Повторить ошибки
          </button>
        )}
        <button
          onClick={onRestart}
          className="rounded-full bg-brand-green px-6 py-3 text-center text-[17px] font-bold text-white active:scale-95"
        >
          Ещё заход
        </button>
        <Link href="/" className="rounded-full border border-border bg-surface px-6 py-3 text-center text-[17px] font-bold text-foreground hover:bg-black/[0.03]">
          На главную
        </Link>
      </div>
    </div>
  );
}

function capitalWord(n: number): string {
  const d = n % 10;
  const dd = n % 100;
  if (dd >= 11 && dd <= 14) return "столиц";
  if (d === 1) return "столицы";
  if (d >= 2 && d <= 4) return "столиц";
  return "столиц";
}
