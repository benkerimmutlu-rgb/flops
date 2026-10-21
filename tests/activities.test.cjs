const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const cache=new Map();
function load(file){if(cache.has(file))return cache.get(file).exports;const api={exports:{}};cache.set(file,api);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;new Function('require','exports','module',code)(name=>load(path.resolve(path.dirname(file),name)),api.exports,api);return api.exports;}
const {ACTIVITIES,activityPlan,allowedActivity}=load(path.resolve('src/components/clay/activity-plans.js'));
test('premium actions require the specific purchased and placed item and cannot grant access to another game',()=>{
 for(const [id,actions] of Object.entries(ACTIVITIES))for(const action of actions){
  assert.equal(allowedActivity([id],[{id}],id,action.id),true);
  assert.equal(allowedActivity([],[{id}],id,action.id),false);
  assert.equal(allowedActivity([id],[],id,action.id),false);
  assert.equal(allowedActivity([id],[{id}],id,'unknown'),false);
 }
 assert.equal(allowedActivity(['premium_pool'],[{id:'premium_pool'}],'premium_pool','slide'),false);
});
test('every animation is bounded, ordered and returns the pug to its original place without changing its geometry',()=>{
 for(const actions of Object.values(ACTIVITIES))for(const action of actions){const plan=activityPlan(action.id);assert.ok(plan.duration>=5000&&plan.duration<=9000);let last=-1;
  for(const frame of plan.frames){assert.ok(frame.offset>=last&&frame.offset<=1);last=frame.offset;for(const coord of [frame.x,frame.y])assert.ok(coord===null||(Number.isFinite(coord)&&coord>=0&&coord<=1));assert.ok(frame.opacity>=0&&frame.opacity<=1);assert.equal('scaleX' in frame,false);assert.equal('scaleY' in frame,false);}
  if(plan.frames.length){assert.equal(plan.frames[0].x,null);assert.equal(plan.frames.at(-1).x,null);assert.equal(plan.frames.at(-1).opacity,1);}
 }
 assert.equal(activityPlan('unknown'),null);
 assert.equal(activityPlan('dive').splash.length,4);
});
const {createCuckooSound,CUCKOO_CALLS}=load(path.resolve('src/components/clay/cuckoo-sound.js'));
function audio(){const voices=[],gains=[];const param=()=>({events:[],setValueAtTime(...v){this.events.push(v);},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},cancelScheduledValues(){},setTargetAtTime(){}});return {state:'running',currentTime:1,destination:{},voices,gains,async resume(){this.state='running';},async close(){this.state='closed';},createOscillator(){const osc={frequency:param(),connect(){},disconnect(){},start(time){this.startTime=time;},stop(time){this.stopTime=time;}};voices.push(osc);return osc;},createGain(){const gain={gain:param(),connect(){},disconnect(){}};gains.push(gain);return gain;}};}
test('cuckoo is silent until requested, calls exactly three times and stops on cancellation',async()=>{
 const ctx=audio();let created=0;const sound=createCuckooSound(()=>{created++;return ctx;});assert.equal(created,0);await sound.play();assert.equal(CUCKOO_CALLS,3);assert.equal(ctx.voices.length,6);
 ctx.voices.forEach((voice,index)=>{assert.equal(voice.frequency.events[0][0],index%2?523.25:659.25);assert.ok(Math.abs(voice.startTime-(1.8+Math.floor(index/2)*1.15+(index%2)*.28))<1e-9);});
 sound.stop();assert.ok(ctx.voices.every(voice=>voice.stopTime===1.04));sound.destroy();assert.equal(ctx.state,'closed');
});
test('closing a preview while audio permission is resolving cannot start delayed cuckoo calls',async()=>{
 const ctx=audio();ctx.state='suspended';let resume;ctx.resume=()=>new Promise(resolve=>{resume=resolve;});const sound=createCuckooSound(()=>ctx);const pending=sound.play();sound.stop();resume();assert.equal(await pending,false);assert.equal(ctx.voices.length,0);sound.destroy();
});
test('cancelling or replacing an activity restores the real actor and removes every temporary animation layer',()=>{
 const originalDocument=global.document,originalWindow=global.window;const animations=[];
 function element(){return {style:{},children:[],setAttribute(){},append(...nodes){this.children.push(...nodes);},remove(){this.removed=true;},animate(frames,options){const animation={frames,options,cancel(){this.cancelled=true;}};animations.push(animation);return animation;}};}
 global.document={createElement:element,addEventListener(){},removeEventListener(){}};
 global.window={matchMedia:()=>({matches:false}),addEventListener(){},removeEventListener(){}};
 try{
  const {createActivityPlayer}=load(path.resolve('src/components/clay/room-activities.js'));
  const stage=element();stage.getBoundingClientRect=()=>({left:0,top:0,width:600,height:400});
  const actor=element();actor.style.visibility='visible';actor.getBoundingClientRect=()=>({left:50,top:250,width:100,bottom:350});
  const target={getBoundingClientRect:()=>({left:200,top:100,width:250,height:250})};
  const states=[];const player=createActivityPlayer({stage,actor,onChange:value=>states.push(value)});
  player.play('slide',target,{img:'/slide.webp'});assert.equal(actor.style.visibility,'hidden');const first=stage.children[0];
  player.play('dive',target,{img:'/pool.webp'});assert.equal(first.removed,true);assert.equal(player.playing,true);
  player.cancel();assert.equal(actor.style.visibility,'visible');assert.equal(player.playing,false);assert.ok(stage.children.every(node=>node.removed));assert.ok(animations.every(animation=>animation.cancelled));
  assert.deepEqual(states,[true,false,true,false]);player.destroy();
 }finally{global.document=originalDocument;global.window=originalWindow;}
});
