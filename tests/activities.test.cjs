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
 for(const actions of Object.values(ACTIVITIES))for(const action of actions){const plan=activityPlan(action.id);assert.ok(plan.duration>=5000&&plan.duration<=13000);let last=-1;
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
 function element(){return {style:{},classList:{add(){}},children:[],setAttribute(){},append(...nodes){this.children.push(...nodes);},remove(){this.removed=true;},animate(frames,options){const animation={frames,options,cancel(){this.cancelled=true;}};animations.push(animation);return animation;}};}
 global.document={createElement:element,addEventListener(){},removeEventListener(){}};
 global.window={matchMedia:()=>({matches:false}),addEventListener(){},removeEventListener(){}};
 try{
  const {createActivityPlayer}=load(path.resolve('src/components/clay/room-activities.js'));
  const stage=element();stage.getBoundingClientRect=()=>({left:0,top:0,width:600,height:400});
  const actor=element();actor.style.visibility='visible';actor.getBoundingClientRect=()=>({left:50,top:250,width:100,bottom:350});
  const target={querySelector:()=>null,getBoundingClientRect:()=>({left:200,top:100,width:250,height:250})};
  const states=[];const player=createActivityPlayer({stage,actor,onChange:value=>states.push(value)});
  player.play('slide',target,{img:'/slide.webp'});assert.equal(actor.style.visibility,'hidden');const first=stage.children[0];
  player.play('dive',target,{img:'/pool.webp'});assert.equal(first.removed,true);assert.equal(player.playing,true);
  player.play('jam',target,{img:'/drums.webp'});
  player.cancel();assert.equal(actor.style.visibility,'visible');assert.equal(player.playing,false);assert.ok(stage.children.every(node=>node.removed));assert.ok(animations.every(animation=>animation.cancelled));
  assert.deepEqual(states,[true,false,true,false,true,false]);player.destroy();
 }finally{global.document=originalDocument;global.window=originalWindow;}
});

test('occlusion only covers the pug while inside furniture, including reduced motion',()=>{
 const {foregroundFrames}=load(path.resolve('src/components/clay/activity-plans.js'));
 function visibleAt(frames,time){return frames.filter(frame=>frame.offset<=time).at(-1).visibility==='visible';}
 for(const action of ['slide','spin','dive','dance']){
  const plan=activityPlan(action),frames=foregroundFrames(plan);
  assert.equal(foregroundFrames(plan,true),null);
  if(!plan.occlusion){assert.equal(frames,null);continue;}
  const [enter,exit]=plan.occlusion;
  assert.equal(visibleAt(frames,0),false);
  assert.equal(visibleAt(frames,enter-.001),false);
  assert.equal(visibleAt(frames,enter),true);
  assert.equal(visibleAt(frames,(enter+exit)/2),true);
  assert.equal(visibleAt(frames,exit),false);
  assert.equal(visibleAt(frames,1),false);
  assert.ok(frames.every(frame=>frame.easing==='steps(1,end)'));
 }
});

test('sand follows gravity on both upright and inverted halves and pauses while turning',()=>{
 const css=fs.readFileSync('src/app/globals.css','utf8');
 const flow=css.match(/@keyframes sand-stream\{([^\n]+)\}/)[1];
 assert.match(flow,/0%\{stroke-dashoffset:0\}/);
 assert.match(flow,/44%,50%\{stroke-dashoffset:-200\}/);
 assert.match(flow,/94%,100%\{stroke-dashoffset:0\}/);
 assert.doesNotMatch(css,/sand-stream \.6s/);
});

test('body poses match walking, sitting on the slide, swimming, drinking and gym movement',()=>{
 const {activityPoses,poseFrames}=load(path.resolve('src/components/clay/activity-plans.js'));
 function poseAt(plan,time){return activityPoses(plan).filter(frame=>frame.offset<=time).at(-1).pose;}
 const slide=activityPlan('slide');
 assert.equal(poseAt(slide,.2),'stand');assert.equal(poseAt(slide,.4),'stand');assert.equal(poseAt(slide,.5),'sit');assert.equal(poseAt(slide,.69),'sit');assert.equal(poseAt(slide,.8),'stand');
 for(const action of ['spin','dive','dance'])for(const time of [0,.2,.5,.8,1])assert.equal(poseAt(activityPlan(action),time),'stand');
 for(const time of [0,.41,.42,.6,.77,1]){
  const shown=['stand','sit'].filter(pose=>poseFrames(slide,pose).filter(frame=>frame.offset<=time).at(-1).visibility==='visible');
  assert.deepEqual(shown,[poseAt(slide,time)]);
 }
});

test('music studio switches from standing guitar to seated drums and only hides the body behind drums during that part',()=>{
 const {activityPoses,foregroundFrames}=load(path.resolve('src/components/clay/activity-plans.js'));
 const plan=activityPlan('jam');assert.ok(plan.duration===12500);
 const pose=time=>activityPoses(plan).filter(f=>f.offset<=time).at(-1).pose;
 assert.equal(pose(.3),'stand');assert.equal(pose(.65),'sit');assert.equal(pose(.95),'stand');
 const front=time=>foregroundFrames(plan).filter(f=>f.offset<=time).at(-1).visibility;
 assert.equal(front(.3),'hidden');assert.equal(front(.65),'visible');assert.equal(front(.95),'hidden');
});
