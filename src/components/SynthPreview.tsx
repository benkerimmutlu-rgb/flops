"use client";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { subscribeSynth, isSynthPlaying, toggleSynthMelody, stopSynthMelody } from './clay/synth-melody.js';

export function SynthPreview({ children }: { children: ReactNode }) {
  const playing = useSyncExternalStore(subscribeSynth, isSynthPlaying, () => false);
  const [error, setError] = useState(false);
  useEffect(() => () => { stopSynthMelody(); }, []);
  const label = playing ? 'Остановить мелодию' : 'Послушать синтезатор';
  return <span className="synth-preview-wrap">
    <button type="button" className="synth-preview" aria-label={label} title={label} aria-pressed={playing}
      onClick={async () => { setError(false); try { await toggleSynthMelody(); } catch { setError(true); } }}>
      {children}<span className="synth-play-badge" aria-hidden="true"><svg viewBox="0 0 24 24">{playing ? <path d="M6 6h12v12H6z" /> : <path d="m8 5 11 7-11 7z" />}</svg></span>
    </button>
    {error && <span className="synth-error" role="status">Нажми ещё раз, чтобы включить звук.</span>}
  </span>;
}
