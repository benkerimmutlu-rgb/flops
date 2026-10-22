// Original short soundtracks. Timestamps are seconds from the same action start.
const note=(at,freq,duration=.18,gain=.035,type='triangle',end=freq)=>({at,freq,end,duration,gain,type});
export function activityScore(action) {
 const score=[];
 if(action==='dance'){
  [523.25,659.25,783.99,659.25,587.33,698.46,880,783.99,659.25,587.33,523.25,659.25,783.99,659.25,587.33,523.25].forEach((freq,i)=>score.push(note(.45+i*.43,freq,.28,.045)));
  for(let i=0;i<8;i++)score.push(note(.45+i*.86,i%2?196:130.81,.45,.024,'sine'));
 }
 if(action==='dive')for(const at of [2.75,6.53,6.97,7.31]){
  score.push(note(at,800,.45,.07,'noise',150),note(at+.04,360,.22,.05,'sine',85));
  for(let n=0;n<4;n++)score.push(note(at+.12+n*.055,500+n*160,.07,.025,'sine',260+n*90));
 }
 if(action==='slide'){
  for(const at of [.9,1.4,1.9,2.4])score.push(note(at,180,.09,.035,'sine',120));
  score.push(note(3.45,980,1.3,.035,'sine',350),note(5.25,180,.18,.045,'sine',90));
  [523.25,659.25,783.99].forEach((freq,i)=>score.push(note(5.65+i*.16,freq,.23,.035)));
 }
 if(action==='spin')for(let i=0;i<8;i++)score.push(note(2.5+i*.34,[523.25,659.25,783.99,1046.5,783.99,659.25,523.25,392][i],.18,.035,'sine'));
 if(action==='jam'){
  for(let i=0;i<8;i++)for(const freq of [196,246.94,293.66])score.push(note(2.5+i*.37,freq*(i>=4?1.12246:1),.35,.022,'triangle'));
  for(let i=0;i<8;i++){
   const at=7.25+i*.4;
   score.push(i%2?note(at,1600,.12,.045,'noise',800):note(at,135,.22,.07,'sine',45));
   score.push(note(at+.2,6500,.045,.018,'noise',4500));
  }
 }
 return score.sort((a,b)=>a.at-b.at);
}
export function createActivitySound(createContext, now = () => performance.now()) {
 let context,generation=0;const voices=new Set();
 function stop(){generation++;for(const voice of voices){try{voice.gain.gain.cancelScheduledValues(context.currentTime);voice.gain.gain.setTargetAtTime(0,context.currentTime,.01);voice.source.stop(context.currentTime+.04);}catch{}}}
 async function play(action){
  stop();const score=activityScore(action);if(!score.length)return false;
  const run=generation,requested=now();context ||= createContext();if(context.state!=='running')await context.resume();if(run!==generation)return false;
  const start=context.currentTime,elapsed=(now()-requested)/1000;
  for(const event of score){
   if(event.at<elapsed)continue;
   const gain=context.createGain(),at=start+event.at-elapsed;let source,filter;
   if(event.type==='noise'){
    source=context.createBufferSource();const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*event.duration),context.sampleRate),data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
    source.buffer=buffer;filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.setValueAtTime(event.freq,at);filter.frequency.exponentialRampToValueAtTime(event.end,at+event.duration);source.connect(filter);filter.connect(gain);
   }else{
    source=context.createOscillator();source.type=event.type;source.frequency.setValueAtTime(event.freq,at);source.frequency.exponentialRampToValueAtTime(event.end,at+event.duration);source.connect(gain);
   }
   gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(event.gain,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+event.duration);gain.connect(context.destination);
   const voice={source,gain};voices.add(voice);source.onended=()=>{voices.delete(voice);source.disconnect();filter?.disconnect();gain.disconnect();};source.start(at);source.stop(at+event.duration+.02);
  }
  return true;
 }
 return {play,stop,destroy(){stop();if(context&&context.state!=='closed')void context.close();}};
}
