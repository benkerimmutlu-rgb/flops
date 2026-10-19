"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CountryLite } from "@/lib/types";
import { ALL_LITE, shuffle } from "@/lib/data";
import { pickDistractors } from "@/lib/distractors";
import { FlagImage, FLAG_VIEWBOX } from "@/lib/flags";
import { speak } from "@/lib/speech";
import { useUserState } from "@/lib/store";
import { getFlopsAsset } from "@/brand/flops-assets";
import { Confetti } from "./Confetti";

type Variant = "learn" | "repeat";

export function FlagGuessGame({
  pool,
  variant = "learn",
  onRepeat,
}: {
  pool: CountryLite[];
  variant?: Variant;
  /** Repeat variant: restart the run in place with the current error stack. */
  onRepeat?: () => void;
}) {
  const { markCorrect, markWrong, earnReward } = useUserState();
  const [step, setStep] = useState(0);
  const [options, setOptions] = useState<CountryLite[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [earned, setEarned] = useState(0);
  const [done, setDone] = useState(false);

  const target = pool[step];

  // Build 4 options (target + 3 confusing distractors) after mount / per step.
  // Impure shuffle lives in an effect so SSR and first client render agree.
  useEffect(() => {
    if (!target) return;
    const distractors = pickDistractors(target, ALL_LITE, 3);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- randomize-after-mount, see store.tsx note
    setOptions(shuffle([target, ...distractors]));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnswer(null);
  }, [step, target]);

  if (!target) return null;

  function choose(code: string) {
    if (answer || !target) return;
    setAnswer(code);
    // Always say the correct country out loud — celebrates a right answer and,
    // on a wrong one, tells a pre-reader which country it actually was.
    speak(target.name, "ru-RU");
    if (code === target.code) {
      setCorrect((c) => c + 1);
      markCorrect(target.code);
      setEarned((e) => e + earnReward());
    } else {
      setWrong((w) => w + 1);
      markWrong(target.code);
    }
  }

  function advance() {
    if (step + 1 >= pool.length) setDone(true);
    else setStep((s) => s + 1);
  }

  if (done) {
    return <Results correct={correct} wrong={wrong} earned={earned} total={pool.length} variant={variant} onRepeat={onRepeat} />;
  }

  const isCorrect = answer === target.code;
  const ratio = FLAG_VIEWBOX[target.code] ?? { w: 3, h: 2 };

  return (
    <div className="flex flex-col gap-5">
      {/* Прогресс */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-muted">
          {variant === "repeat" ? "Повтори" : "Вопрос"} {step + 1} / {pool.length}
        </span>
        <div className="flex items-center gap-1.5">
          <Image src={getFlopsAsset("bone_currency")} alt="" width={18} height={18} className="h-4.5 w-4.5 object-contain" />
          <span className="text-sm font-bold text-brand-green">{correct}</span>
        </div>
      </div>

      {/* Карточка с флагом */}
      <div className="relative flex flex-col items-center gap-5 rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
        {answer && isCorrect && <Confetti />}

        <p className="text-center text-base font-semibold text-foreground">
          Чей это флаг?
        </p>

        <div
          className="w-full max-w-xs overflow-hidden rounded-2xl bg-white shadow-inner ring-1 ring-border"
          style={{ aspectRatio: `${ratio.w} / ${ratio.h}` }}
        >
          <FlagImage code={target.code} fit="cover" />
        </div>

        {/* 4 варианта с озвучкой */}
        <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
          {options.map((opt) => {
            const chosen = answer === opt.code;
            const isTarget = opt.code === target.code;
            const show = answer !== null;
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
                  onClick={() => speak(opt.name, "ru-RU")}
                  aria-label={`Послушать: ${opt.name}`}
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
                  {opt.name}
                </button>
              </div>
            );
          })}
        </div>

        {/* Фидбэк */}
        {answer && (
          <Feedback
            correct={isCorrect}
            code={target.code}
            countryName={target.name}
            onNext={advance}
            last={step + 1 >= pool.length}
          />
        )}
      </div>

      {!answer && (
        <p className="text-center text-xs text-muted">
          Нажми на 🔊 рядом со страной, чтобы послушать название.
        </p>
      )}
    </div>
  );
}

function Feedback({
  correct,
  code,
  countryName,
  onNext,
  last,
}: {
  correct: boolean;
  code: string;
  countryName: string;
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
          {correct ? "Молодец! Это " : "Почти! Это "}
          <span className={correct ? "" : "text-brand-blue"}>{countryName}</span>
          {correct ? " 🎉" : ". Попробуешь ещё в «Повтори» 🙂"}
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
  earned,
  total,
  variant,
  onRepeat,
}: {
  correct: number;
  wrong: number;
  earned: number;
  total: number;
  variant: Variant;
  onRepeat?: () => void;
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
        <span className="text-brand-green">+{earned}</span>
        <span className="text-muted">косточек</span>
      </div>
      <p className="text-muted">
        Узнал <b className="text-foreground">{correct}</b> из {total}
        {wrong > 0 && (
          <>
            {" "}· в стопку «Повтори» ушло <b className="text-foreground">{wrong}</b>
          </>
        )}
      </p>
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
        {variant === "learn" && (
          <Link href="/flags?new=1" className="rounded-full bg-brand-green px-6 py-3 text-center text-[17px] font-bold text-white active:scale-95">
            Ещё заход
          </Link>
        )}
        {wrong > 0 &&
          (onRepeat ? (
            <button
              onClick={onRepeat}
              className="rounded-full border border-border bg-surface px-6 py-3 text-center text-[17px] font-bold text-foreground hover:bg-black/[0.03]"
            >
              Поработать над ошибками
            </button>
          ) : (
            <Link
              href="/flags/repeat"
              className="rounded-full border border-border bg-surface px-6 py-3 text-center text-[17px] font-bold text-foreground hover:bg-black/[0.03]"
            >
              Поработать над ошибками
            </Link>
          ))}
        <Link href="/" className="rounded-full border border-border bg-surface px-6 py-3 text-center text-[17px] font-bold text-foreground hover:bg-black/[0.03]">
          На главную
        </Link>
      </div>
    </div>
  );
}
