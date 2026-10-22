const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
function load(file){const m={exports:{}};new Function('exports','module',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,m);return m.exports;}
const {activityScore,createActivitySound}=load('src/components/clay/activity-sound.js');
const {activityPlan}=load('src/components/clay/activity-plans.js');
test('every physical activity has bounded original audio synchronized to its actual duration',()=>{
 for(const action of ['slide','spin','dive','dance','jam']){
  const score=activityScore(action);assert.ok(score.length>0);let last=-1;
  for(const sound of score){assert.ok(sound.at>=last);last=sound.at;assert.ok((sound.at+sound.duration)*1000<activityPlan(action).duration);assert.ok(sound.freq>0&&sound.end>0&&sound.gain<=.07);}
 }
 assert.equal(activityScore('unknown').length,0);
 const jam=activityScore('jam');assert.ok(jam.filter(e=>e.at<6).every(e=>e.type==='triangle'));assert.ok(jam.some(e=>e.at>7&&e.type==='noise'));
 assert.equal(activityScore('dive').filter(e=>e.type==='noise').length,4);
});
function audio(){const param=()=>({setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},cancelScheduledValues(){},setTargetAtTime(){}});const sources=[];const source=()=>{const node={frequency:param(),connect(){},disconnect(){},start(t){this.startAt=t;},stop(t){this.stopAt=t;}};sources.push(node);return node;};return{state:'running',currentTime:10,sampleRate:8000,destination:{},sources,async resume(){this.state='running';},async close(){this.state='closed';},createOscillator:source,createBufferSource:source,createBuffer(ch,length){return{getChannelData:()=>new Float32Array(length)};},createBiquadFilter:()=>({frequency:param(),connect(){},disconnect(){}}),createGain:()=>({gain:param(),connect(){},disconnect(){}})};}
test('sound is silent before play, scheduled from user gesture, stops on replacement and disposes its context',async()=>{
 const ctx=audio();let count=0;const player=createActivitySound(()=>{count++;return ctx;},()=>0);assert.equal(count,0);
 assert.equal(await player.play('dive'),true);assert.equal(count,1);assert.equal(ctx.sources.length,activityScore('dive').length);assert.ok(ctx.sources.every(s=>s.startAt>=12.75));
 const old=[...ctx.sources];await player.play('dance');assert.ok(old.every(s=>s.stopAt===10.04));player.stop();assert.ok(ctx.sources.every(s=>s.stopAt===10.04));player.destroy();assert.equal(ctx.state,'closed');
});
test('leaving the scene while audio unlock is pending cannot start delayed music',async()=>{
 const ctx=audio();ctx.state='suspended';let resume;ctx.resume=()=>new Promise(resolve=>{resume=resolve;});const player=createActivitySound(()=>ctx);const pending=player.play('jam');player.stop();resume();assert.equal(await pending,false);assert.equal(ctx.sources.length,0);player.destroy();
});

test('slow browser audio unlock skips past effects and keeps remaining splashes on the visual timeline',async()=>{
 const ctx=audio();ctx.state='suspended';let resume,now=0;ctx.resume=()=>new Promise(resolve=>{resume=resolve;});const player=createActivitySound(()=>ctx,()=>now);
 const pending=player.play('dive');now=5000;resume();assert.equal(await pending,true);
 const remaining=activityScore('dive').filter(event=>event.at>=5);assert.equal(ctx.sources.length,remaining.length);
 assert.ok(Math.abs(ctx.sources[0].startAt-(10+remaining[0].at-5))<1e-9);player.destroy();
});
