"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { LANGUAGE_PHRASES, LanguagePhrase } from "@/lib/phrases";
import { liteByCode } from "@/lib/data";
import { FlagImage, FLAG_VIEWBOX } from "@/lib/flags";
import { speak, langFor } from "@/lib/speech";
import { useUserState } from "@/lib/store";
import { getFlopsAsset } from "@/brand/flops-assets";
import { Confetti } from "./Confetti";
import { answerLanguageSession, advanceLanguageSession, repeatLanguageErrors, type LanguageSession } from "@/lib/language-session";

// Same guessing mechanic as flags/capitals: the prompt is a phrase in a foreign
// language (written + readable transliteration), and the four options are
// countries (flag + name). On a correct answer the Russian translation is read
// aloud. Keeps its own session scoring; the flag known/repeat state is untouched.
export function LanguageGuessGame({
  session,
  onChange,
  onRestart,
}: {
  session: LanguageSession;
  onChange: (session: LanguageSession) => void;
  onRestart: () => void;
}) {
  const { earnReward } = useUserState();
  const current = useRef(session);
  useEffect(() => { current.current = session; }, [session]);
  const { step, answerCode, correct, earned, done, wrongList } = session;
  const queue = session.queue.map(code => LANGUAGE_PHRASES.find(p => p.code === code)!);
  const options = session.options.map(code => liteByCode(code)!);
  const target = queue[step];
  const targetCountry = liteByCode(target.code)!;
  function change(next: LanguageSession) {
    current.current = next;
    onChange(next);
  }
  function choose(code: string) {
    const now = current.current;
    if (now.answerCode || now.done || !now.options.includes(code)) return;
    // Lock the answer before awarding anything; hydration never awards again.
    const answered = answerLanguageSession(now, code, 0);
    current.current = answered;
    const reward = code === target.code ? earnReward() : 0;
    change({ ...answered, earned: answered.earned + reward });
    speak(code === target.code ? target.ru : targetCountry.name, "ru-RU");
  }
  function advance() { change(advanceLanguageSession(current.current)); }
  function repeatWrong() { change(repeatLanguageErrors(current.current)); }

  if (done) {
    return (
      <Results
        correct={correct}
        earned={earned}
        wrong={wrongList.length}
        total={queue.length}
        onRepeat={wrongList.length > 0 ? repeatWrong : undefined}
        onRestart={onRestart}
      />
    );
  }

  const isCorrect = answerCode === target.code;

  return (
    <div className="flex flex-col gap-5">
      {/* Прогресс */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-muted">
          Фраза {step + 1} / {queue.length}
        </span>
        <div className="flex items-center gap-1.5">
          <Image src={getFlopsAsset("bone_currency")} alt="" width={18} height={18} className="h-4.5 w-4.5 object-contain" />
          <span className="text-sm font-bold text-brand-green">{correct}</span>
        </div>
      </div>

      {/* Карточка с фразой */}
      <div className="relative flex flex-col items-center gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
        {answerCode && isCorrect && <Confetti />}

        <div className="flex w-full flex-col items-center gap-2 rounded-2xl bg-brand-blue/[0.06] px-4 py-6">
          <p className="text-center text-3xl font-bold leading-tight text-foreground">
            {target.native}
          </p>
          <p className="text-center text-base font-semibold text-muted">
            {target.translit}
          </p>
          {/* Послушать фразу на её родном языке */}
          <button
            type="button"
            onClick={() => speak(target.native, langFor(target.code))}
            className="mt-1 flex items-center gap-2 rounded-full bg-brand-blue/10 px-4 py-2 text-sm font-bold text-brand-blue hover:bg-brand-blue/20"
          >
            <Image src={getFlopsAsset("sound_speaker")} alt="" width={20} height={20} className="h-5 w-5 object-contain" />
            Послушать на языке оригинала
          </button>
        </div>
        <p className="text-center text-base font-semibold text-foreground">
          Из какой это страны?
        </p>

        {/* 4 страны-варианта (флаг + название) с озвучкой */}
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
            const ratio = FLAG_VIEWBOX[opt.code] ?? { w: 3, h: 2 };
            return (
              <div
                key={opt.code}
                className={`flex items-center gap-2 rounded-2xl border p-1.5 pl-2 transition-colors ${
                  state === "idle"
                    ? "border-border bg-surface hover:bg-black/[0.03]"
                    : state === "right"
                    ? "border-brand-green bg-brand-green/10"
                    : state === "wrong"
                    ? "border-brand-red bg-brand-red/10"
                    : "border-border opacity-50"
                }`}
              >
                <div
                  className="h-8 w-11 shrink-0"
                  style={{ aspectRatio: `${ratio.w} / ${ratio.h}` }}
                >
                  <FlagImage code={opt.code} fit="contain" />
                </div>
                <button
                  type="button"
                  disabled={show}
                  onClick={() => choose(opt.code)}
                  className="flex-1 py-2 text-left text-[17px] font-bold text-foreground disabled:cursor-default"
                >
                  {opt.name}
                </button>
                {/* Озвучка названия страны — для нечитающих */}
                <button
                  type="button"
                  onClick={() => speak(opt.name, "ru-RU")}
                  aria-label={`Послушать: ${opt.name}`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20"
                >
                  <Image src={getFlopsAsset("sound_speaker")} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
                </button>
              </div>
            );
          })}
        </div>

        {answerCode && (
          <Feedback
            correct={isCorrect}
            code={target.code}
            phrase={target}
            countryName={targetCountry.name}
            onNext={advance}
            last={step + 1 >= queue.length}
          />
        )}
      </div>
    </div>
  );
}

function Feedback({
  correct,
  code,
  phrase,
  countryName,
  onNext,
  last,
}: {
  correct: boolean;
  code: string;
  phrase: LanguagePhrase;
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
          {correct ? "Молодец! " : "Почти! "}
          «{phrase.native}» — {phrase.lang}, это{" "}
          <span className={correct ? "text-brand-green" : "text-brand-blue"}>
            {countryName}
          </span>
          . По-русски: «{phrase.ru}»{correct ? " 🎉" : ""}
        </p>
      </div>
      <div className="flex w-full flex-col items-center gap-2">
        <button
          onClick={onNext}
          className="rounded-full bg-brand-green px-7 py-3 text-[17px] font-bold text-white shadow-[var(--shadow-card)] active:scale-95"
        >
          {last ? "Готово →" : "Дальше →"}
        </button>
        <Link href={`/world/${code}?from=languages`} className="text-sm font-semibold text-brand-blue hover:underline">
          Узнать больше о стране →
        </Link>
      </div>
    </div>
  );
}

function Results({
  correct,
  earned,
  wrong,
  total,
  onRepeat,
  onRestart,
}: {
  correct: number;
  earned: number;
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
        <span className="text-brand-green">+{earned}</span>
        <span className="text-muted">косточек</span>
      </div>
      <p className="text-muted">
        Угадал <b className="text-foreground">{correct}</b> из {total} {phraseWord(total)}
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

function phraseWord(n: number): string {
  const d = n % 10;
  const dd = n % 100;
  if (dd >= 11 && dd <= 14) return "фраз";
  if (d === 1) return "фразы";
  if (d >= 2 && d <= 4) return "фраз";
  return "фраз";
}
