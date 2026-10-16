// Browser-native pronunciation via the Web Speech API — zero backend, zero
// cost, works for a pre-reader tapping a button. Good enough for the MVP;
// swap for recorded native-speaker audio later if quality needs it.

export const LANG_BY_CODE: Record<string, string> = {
  it: "it-IT",
  gb: "en-GB",
  se: "sv-SE",
  es: "es-ES",
};

export function speak(text: string, lang: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}
