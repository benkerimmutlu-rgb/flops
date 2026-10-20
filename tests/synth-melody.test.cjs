const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const moduleSource = ts.transpileModule(fs.readFileSync('src/components/clay/synth-melody.js', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const api = { exports: {} }; new Function('exports', 'module', moduleSource)(api.exports, api);
const { createMelodyPlayer, SYNTH_MELODY, NOTE_SECONDS } = api.exports;
function audioContext(state = 'running') {
  const voices = [], gains = [];
  const param = () => ({ events: [], setValueAtTime(...args) { this.events.push(['set', ...args]); }, linearRampToValueAtTime(...args) { this.events.push(['linear', ...args]); }, exponentialRampToValueAtTime(...args) { this.events.push(['exp', ...args]); }, cancelScheduledValues() {}, setTargetAtTime() {} });
  return { state, voices, gains, destination: {}, currentTime: 10,
    resume: async function () { this.state = 'running'; },
    createOscillator() { const o = { frequency: param(), connect() {}, disconnect() {}, start(t) { this.startTime = t; }, stop(t) { this.stopTime = t; } }; voices.push(o); return o; },
    createGain() { const g = { gain: param(), connect() {}, disconnect() {} }; gains.push(g); return g; },
  };
}

test('the synth stays silent until tapped, schedules the whole soft tune and ends naturally', async () => {
  const ctx = audioContext(); let creations = 0;
  const player = createMelodyPlayer(() => { creations++; return ctx; });
  assert.equal(creations, 0); assert.equal(player.playing, false);
  assert.equal(await player.toggle(), true);
  assert.equal(creations, 1); assert.equal(ctx.voices.length, SYNTH_MELODY.length);
  let time = 10.025;
  ctx.voices.forEach((v, i) => {
    assert.ok(Math.abs(v.startTime - time) < 1e-6);
    assert.ok(Math.abs(v.frequency.events[0][1] - 440 * 2 ** ((SYNTH_MELODY[i][0] - 69) / 12)) < 1e-6);
    assert.equal(ctx.gains[i].gain.events[1][1], .075);
    time += SYNTH_MELODY[i][1] * NOTE_SECONDS;
  });
  assert.ok(time - 10 < 5);
  for (const voice of ctx.voices) voice.onended();
  assert.equal(player.playing, false);
});

test('a second tap stops every note; stale callbacks cannot stop a newly started tune', async () => {
  const ctx = audioContext(); const player = createMelodyPlayer(() => ctx);
  await player.toggle(); const old = [...ctx.voices];
  assert.equal(await player.toggle(), false);
  assert.equal(player.playing, false);
  for (const voice of old) assert.equal(voice.stopTime, 10.06);
  await player.toggle();
  old.forEach(v => v.onended());
  assert.equal(player.playing, true);
  player.stop(); assert.equal(player.playing, false);
});

test('cancelling while the browser unlocks audio never starts a delayed tune', async () => {
  const ctx = audioContext('suspended'); let resolve;
  ctx.resume = () => new Promise(done => { resolve = done; });
  const player = createMelodyPlayer(() => ctx);
  const start = player.toggle(); player.stop(); resolve();
  assert.equal(await start, false); assert.equal(ctx.voices.length, 0); assert.equal(player.playing, false);
});

test('blocked audio resets the control and allows another attempt', async () => {
  const ctx = audioContext(); let attempts = 0;
  const player = createMelodyPlayer(() => { if (++attempts === 1) throw new Error('blocked'); return ctx; });
  await assert.rejects(player.toggle(), /blocked/);
  assert.equal(player.playing, false);
  assert.equal(await player.toggle(), true);
  player.stop();
});
