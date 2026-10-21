// Browser-native pronunciation via the Web Speech API — zero backend, zero
// cost, works for a pre-reader tapping a button. Good enough for the MVP;
// swap for recorded native-speaker audio later if quality needs it.

// Country code -> BCP-47 locale for pronouncing the native name. Countries not
// listed fall back to Russian (langFor) — the UI shows Russian names anyway, so
// a pre-reader always hears a sensible pronunciation.
export const LANG_BY_CODE: Record<string, string> = {
  it: "it-IT",
  gb: "en-GB",
  se: "sv-SE",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  tr: "tr-TR",
  jp: "ja-JP",
  br: "pt-BR",
  pt: "pt-PT",
  fi: "fi-FI",
  ru: "ru-RU",
  ua: "uk-UA",
  pl: "pl-PL",
  nl: "nl-NL",
  gr: "el-GR",
  cn: "zh-CN",
  kr: "ko-KR",
  in: "hi-IN",
  id: "id-ID",
  th: "th-TH",
  vn: "vi-VN",
  sa: "ar-SA",
  eg: "ar-EG",
  il: "he-IL",
  us: "en-US",
  mx: "es-MX",
  ar: "es-AR",
  co: "es-CO",
  cz: "cs-CZ", sk: "sk-SK", hu: "hu-HU", ro: "ro-RO",
  dk: "da-DK", no: "nb-NO", is: "is-IS", hr: "hr-HR",
  rs: "sr-RS", bg: "bg-BG", ge: "ka-GE", am: "hy-AM",
  my: "ms-MY", ph: "fil-PH", ke: "sw-KE", za: "zu-ZA",
};

/** Locale for a country code; Russian fallback keeps pre-readers covered. */
export function langFor(code: string): string {
  return LANG_BY_CODE[code] ?? "ru-RU";
}

export function speak(text: string, lang: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  // Pick a voice that actually matches the requested language when the device
  // has one — this is what lets a foreign phrase (e.g. "Bonjour") be spoken in
  // French instead of read with the default (Russian) voice. Falls back to the
  // browser default when no matching voice is installed.
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length) {
    const want = lang.toLowerCase();
    const base = want.split("-")[0];
    const match =
      voices.find((v) => v.lang?.toLowerCase() === want) ??
      voices.find((v) => v.lang?.toLowerCase().startsWith(base));
    if (match) utterance.voice = match;
  }
  window.speechSynthesis.speak(utterance);
}
