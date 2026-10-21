export const CUCKOO_CALLS = 3;
export function createCuckooSound(createContext) {
    let context, generation = 0;
    const voices = new Set();
    function stop() {
        generation++;
        for (const voice of voices) { try { voice.gain.gain.cancelScheduledValues(context.currentTime); voice.gain.gain.setTargetAtTime(0, context.currentTime, .01); voice.osc.stop(context.currentTime + .04); } catch {} }
    }
    async function play() {
        stop(); const run = generation;
        context ||= createContext();
        if (context.state !== 'running') await context.resume();
        if (run !== generation) return false;
        for (let call = 0; call < CUCKOO_CALLS; call++) for (let note = 0; note < 2; note++) {
            const time = context.currentTime + .8 + call * 1.15 + note * .28;
            const osc = context.createOscillator(), gain = context.createGain();
            osc.type = 'sine'; osc.frequency.setValueAtTime(note ? 523.25 : 659.25, time);
            gain.gain.setValueAtTime(0,time); gain.gain.linearRampToValueAtTime(.085,time+.025); gain.gain.exponentialRampToValueAtTime(.001,time+.23);
            osc.connect(gain);gain.connect(context.destination);
            const voice={osc,gain};voices.add(voice);osc.onended=()=>{voices.delete(voice);osc.disconnect();gain.disconnect();};
            osc.start(time);osc.stop(time+.25);
        }
        return true;
    }
    function destroy() { stop(); if (context && context.state !== 'closed') void context.close(); }
    return {play,stop,destroy};
}
