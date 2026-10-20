// Original little major-key tune, generated locally. No audio download or autoplay.
export const SYNTH_MELODY = [[60, 1], [64, 1], [67, 1], [64, 1], [65, 1], [62, 1], [60, 2], [62, 1], [64, 1], [67, 1], [72, 2]];
export const NOTE_SECONDS = .30;

export function createMelodyPlayer(createContext, notify = () => {}) {
    let context, active = false, generation = 0;
    const voices = new Set();
    function stop() {
        generation++;
        active = false;
        if (context) for (const { oscillator, gain } of voices) {
            const now = context.currentTime;
            gain.gain.cancelScheduledValues(now);
            gain.gain.setTargetAtTime(0, now, .015);
            try { oscillator.stop(now + .06); } catch { /* Already ended. */ }
        }
        notify();
    }
    async function toggle() {
        if (active) { stop(); return false; }
        const run = ++generation;
        active = true; notify();
        try {
            context ||= createContext();
            if (context.state !== 'running') await context.resume();
            if (run !== generation) return false;
            let time = context.currentTime + .025;
            SYNTH_MELODY.forEach(([midi, beats], index) => {
                const oscillator = context.createOscillator(), gain = context.createGain();
                const duration = beats * NOTE_SECONDS;
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(440 * 2 ** ((midi - 69) / 12), time);
                gain.gain.setValueAtTime(0, time);
                gain.gain.linearRampToValueAtTime(.075, time + .018);
                gain.gain.exponentialRampToValueAtTime(.001, time + duration - .025);
                gain.gain.linearRampToValueAtTime(0, time + duration);
                oscillator.connect(gain); gain.connect(context.destination);
                const voice = { oscillator, gain }; voices.add(voice);
                oscillator.onended = () => {
                    oscillator.disconnect(); gain.disconnect(); voices.delete(voice);
                    if (index === SYNTH_MELODY.length - 1 && generation === run) { active = false; notify(); }
                };
                oscillator.start(time); oscillator.stop(time + duration + .01);
                time += duration;
            });
            return true;
        } catch (error) {
            if (run === generation) stop();
            throw error;
        }
    }
    return { toggle, stop, get playing() { return active; } };
}

let player;
const listeners = new Set();
export const subscribeSynth = notify => { listeners.add(notify); return () => listeners.delete(notify); };
export const isSynthPlaying = () => player?.playing || false;
export const stopSynthMelody = () => player?.stop();
export function toggleSynthMelody() {
    if (!player) {
        player = createMelodyPlayer(() => new window.AudioContext(), () => listeners.forEach(notify => notify()));
        document.addEventListener('visibilitychange', () => { if (document.hidden) player.stop(); });
        window.addEventListener('pagehide', stopSynthMelody);
    }
    return player.toggle();
}
