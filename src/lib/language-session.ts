import { LANGUAGE_PHRASES } from "./phrases";
import { liteByCode, shuffle } from "./data";

export interface LanguageSession {
  version: 1;
  queue: string[];
  step: number;
  options: string[];
  answerCode: string | null;
  correct: number;
  earned: number;
  wrongList: string[];
  done: boolean;
  history: { code: string; answer: string }[];
}
const phrases = new Set(LANGUAGE_PHRASES.map(p => p.code));
function optionsFor(code: string) {
  const phrase = LANGUAGE_PHRASES.find(p => p.code === code)!;
  // Shared phrases/languages (e.g. Takk or Terima kasih) cannot be wrong choices.
  const alternatives = LANGUAGE_PHRASES.filter(p => p.code !== code && p.lang !== phrase.lang && p.native.toLocaleLowerCase() !== phrase.native.toLocaleLowerCase());
  return shuffle([code, ...shuffle(alternatives).slice(0, 3).map(p => p.code)]);
}
export function startLanguageSession(codes: string[]): LanguageSession {
  return { version: 1, queue: codes, step: 0, options: optionsFor(codes[0]), answerCode: null, correct: 0, earned: 0, wrongList: [], done: false, history: [] };
}
export function answerLanguageSession(session: LanguageSession, answer: string, reward: number): LanguageSession {
  if (session.done || session.answerCode || !session.options.includes(answer)) return session;
  const code = session.queue[session.step], right = code === answer;
  return { ...session, answerCode: answer, correct: session.correct + Number(right), earned: session.earned + (right ? reward : 0), wrongList: right || session.wrongList.includes(code) ? session.wrongList : [...session.wrongList, code], history: [...session.history, { code, answer }] };
}
export function advanceLanguageSession(session: LanguageSession): LanguageSession {
  if (!session.answerCode || session.done) return session;
  if (session.step + 1 === session.queue.length) return { ...session, done: true };
  const step = session.step + 1;
  return { ...session, step, options: optionsFor(session.queue[step]), answerCode: null };
}
export function repeatLanguageErrors(session: LanguageSession): LanguageSession {
  if (!session.done || !session.wrongList.length) return session;
  return { ...startLanguageSession(session.wrongList), earned: session.earned, history: session.history };
}
/** Store question order and choices too: a return must never reshuffle an answered question. */
export function restoreLanguageSession(value: unknown): LanguageSession | null {
  if (!value || typeof value !== "object") return null;
  const s = value as LanguageSession;
  const codes = (x: unknown): x is string[] => Array.isArray(x) && x.every(c => typeof c === "string" && phrases.has(c));
  if (s.version !== 1 || !codes(s.queue) || !s.queue.length || s.queue.length > LANGUAGE_PHRASES.length || new Set(s.queue).size !== s.queue.length || !Number.isInteger(s.step) || s.step < 0 || s.step >= s.queue.length) return null;
  if (!Array.isArray(s.options) || s.options.length !== 4 || new Set(s.options).size !== 4 || !s.options.every(c => typeof c === "string" && liteByCode(c)) || !s.options.includes(s.queue[s.step]) || (s.answerCode !== null && !s.options.includes(s.answerCode))) return null;
  if (!codes(s.wrongList) || !s.wrongList.every(c => s.queue.includes(c)) || !Number.isInteger(s.correct) || s.correct < 0 || s.correct > s.queue.length || !Number.isInteger(s.earned) || s.earned < 0 || typeof s.done !== "boolean" || (s.done && (!s.answerCode || s.step !== s.queue.length - 1))) return null;
  if (!Array.isArray(s.history) || !s.history.every(h => h && phrases.has(h.code) && typeof h.answer === "string" && liteByCode(h.answer))) return null;
  return s;
}
