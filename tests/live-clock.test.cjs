const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const api={exports:{}};
new Function('exports','module',ts.transpileModule(fs.readFileSync('src/components/clay/live-clock.js','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(api.exports,api);
const {localClockTime,liveClockMarkup,createLiveClockController}=api.exports;
test('analog hands and digital face show device local time, including noon and midnight',()=>{
 assert.deepEqual(localClockTime(new Date(2026,9,22,15,30,45)),{hour:105.375,minute:184.5,second:270,text:'15:30'});
 assert.deepEqual(localClockTime(new Date(2026,9,22,0,0,0)),{hour:0,minute:0,second:0,text:'00:00'});
 assert.deepEqual(localClockTime(new Date(2026,9,22,12,0,0)),{hour:0,minute:0,second:0,text:'12:00'});
 for(const id of ['live_clock_blue','live_clock_green','cuckoo_clock'])assert.match(liveClockMarkup(id),new RegExp('data-live-clock="'+id+'"'));
 assert.equal(liveClockMarkup('ball'),'');
});
test('live clocks resync after sleeping or changing device time and clean up timers and listeners',()=>{
 const originals={document:global.document,window:global.window,setInterval:global.setInterval,clearInterval:global.clearInterval};
 const docEvents=new Map(),winEvents=new Map();let tick,cleared=false,current=new Date(2026,9,22,10,20,30);
 const element=(dataset)=>({dataset,attributes:{},setAttribute(key,value){this.attributes[key]=value;}});
 const hands=['hour','minute','second'].map(name=>element({clockHand:name}));
 const dial=element({liveClock:'cuckoo_clock'});dial.querySelector=()=>null;dial.querySelectorAll=()=>hands;
 const digits={textContent:''};const digital=element({liveClock:'live_clock_green'});digital.querySelector=()=>digits;digital.querySelectorAll=()=>[];
 global.document={hidden:false,addEventListener:(key,value)=>docEvents.set(key,value),removeEventListener:key=>docEvents.delete(key)};
 global.window={addEventListener:(key,value)=>winEvents.set(key,value),removeEventListener:key=>winEvents.delete(key)};
 global.setInterval=(callback,delay)=>{assert.equal(delay,1000);tick=callback;return 42;};global.clearInterval=id=>{assert.equal(id,42);cleared=true;};
 try{
  const clock=createLiveClockController({querySelectorAll:()=>[dial,digital]},()=>current);
  assert.equal(digits.textContent,'10:20');assert.match(hands[2].attributes.transform,/rotate\(180 /);
  current=new Date(2026,9,23,3,5,0);tick();assert.equal(digits.textContent,'03:05');assert.match(hands[0].attributes.transform,/rotate\(92.5 /);
  current=new Date(2026,9,23,8,12,10);docEvents.get('visibilitychange')();assert.equal(digits.textContent,'08:12');
  current=new Date(2026,9,23,9,15,20);winEvents.get('focus')();assert.equal(digits.textContent,'09:15');
  clock.destroy();assert.equal(cleared,true);assert.equal(docEvents.size,0);assert.equal(winEvents.size,0);
 }finally{Object.assign(global,originals);}
});
