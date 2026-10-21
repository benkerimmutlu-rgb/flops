import { activityPlan, foregroundFrames, activityPoses, poseFrames } from './activity-plans.js';
import { wearableFit } from './wardrobe.js';
import { createCuckooSound } from './cuckoo-sound.js';

/** An independent visual performer keeps animations out of the persisted room layout. */
export function activityPug(pose, clothes = [], catalog = []) {
    const node=document.createElement('div');node.className='activity-pug';node.setAttribute('aria-hidden','true');
    const layers={back:document.createElement('div'),front:document.createElement('div'),head:document.createElement('div')};
    for(const [layer,element] of Object.entries(layers)){element.className='activity-clothes';element.style.zIndex=layer==='back'?'0':layer==='front'?'2':'3';}
    const pug=document.createElement('img');pug.className='activity-pug-body';pug.src='/assets/clay/room-pug-'+pose+'.webp';pug.alt='';
    node.append(layers.back,pug,layers.front,layers.head);
    for(const item of clothes){const def=catalog.find(entry=>entry.id===item.id);if(!def)continue;
        const fit=wearableFit(def,pose);
        for(const [layer,parts] of [[fit.layer,fit.parts],['front',fit.frontParts||[]]]) for(const piece of parts){
            const image=document.createElement('img');image.src=piece.img;image.alt='';image.className='activity-clothing';
            const scale=item.scale||1;image.style.left=((item.x??.5)+(piece.x-.5)*scale)*100+'%';image.style.top=((item.y??.5)+(piece.y-.5)*scale)*100+'%';image.style.width=piece.size*scale*100+'%';
            image.style.transform=`translate(-50%,-50%) rotate(${piece.rotation+(item.rotation||0)}deg) scaleX(${piece.mirror?-1:1})`;layers[layer==='back'?'back':layer==='head'?'head':'front'].append(image);
        }
    }
    return node;
}
/** @param {{stage:HTMLElement,actor:HTMLElement,clothes?:()=>Array<import("@/lib/room").RoomItem>,catalog?:Array<import("@/lib/room").RoomCatalogItem>,onChange?:(playing:boolean)=>void,say?:(message:string)=>void}} options */
export function createActivityPlayer({stage,actor,clothes=()=>[],catalog=[],onChange=()=>{},say=()=>{}}) {
    let active=null;
    const audio=createCuckooSound(()=>new window.AudioContext());
    function cancel() {
        if(!active)return;
        const run=active;active=null;
        run.animations.forEach(animation=>animation.cancel());run.timers.forEach(clearTimeout);run.layer.remove();actor.style.visibility=run.visibility;audio.stop();onChange(false);
    }
    function play(action,target,definition) {
        const plan=activityPlan(action);if(!plan||!target)return false;
        cancel();
        const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const stageBox=stage.getBoundingClientRect(), box=target.getBoundingClientRect(), original=actor.getBoundingClientRect();
        const rect={x:box.left-stageBox.left,y:box.top-stageBox.top,w:box.width,h:box.height};
        const origin={x:original.left-stageBox.left+original.width/2,y:original.bottom-stageBox.top};
        const layer=document.createElement('div');layer.className='room-activity-layer';layer.setAttribute('aria-hidden','true');stage.append(layer);
        const run={layer,animations:[],timers:[],visibility:actor.style.visibility};active=run;
        const animate=(node,frames,options)=>{const animation=node.animate(frames,{fill:'both',...options});run.animations.push(animation);return animation;};
        const later=(callback,ms)=>{run.timers.push(setTimeout(()=>{if(active===run)callback();},ms));};
        function splash(x,y) {
            if(reduced)return;
            for(let n=0;n<14;n++){
                const drop=document.createElement('i');drop.className='activity-drop';drop.style.left=x+'px';drop.style.top=y+'px';layer.append(drop);
                const angle=(n/14)*Math.PI*2, distance=rect.w*(.12+(n%3)*.025);
                animate(drop,[{transform:'translate(-50%,-50%) scale(.5)',opacity:0},{offset:.12,opacity:1},{transform:`translate(${Math.cos(angle)*distance}px,${Math.sin(angle)*distance-rect.h*.05}px) scale(.9)`,opacity:0}],{duration:1200,easing:'cubic-bezier(.1,.65,.25,1)'});
                later(()=>drop.remove(),1250);
            }
        }
        if(action==='cuckoo') {
            const launch=document.createElement('div');launch.className='activity-cuckoo-launch';
            launch.style.left=rect.x+rect.w*.5+'px';launch.style.top=rect.y+rect.h*(definition.birdY??.235)+'px';launch.style.width=rect.w*.22+'px';launch.style.height=rect.h*.30+'px';
            const spring=document.createElement('div');spring.className='activity-cuckoo-spring';
            spring.innerHTML='<svg viewBox="0 0 60 120" preserveAspectRatio="none" aria-hidden="true"><path d="M30 2 C4 5 4 13 30 16 S56 28 30 30 S4 42 30 44 S56 56 30 58 S4 70 30 72 S56 84 30 86 S4 98 30 100 S56 112 30 118" fill="none" stroke="#806143" stroke-width="5" stroke-linecap="round"/></svg>';
            const bird=document.createElement('img');bird.src='/assets/clay/room-items/cuckoo_bird.webp';bird.alt='';bird.className='activity-cuckoo';launch.append(spring,bird);layer.append(launch);
            const flight=reduced?.2:1;
            animate(launch,[{offset:0,opacity:0},{offset:.07,opacity:1},{offset:.87,opacity:1},{offset:.96,opacity:0},{offset:1,opacity:0}],{duration:plan.duration});
            const extension=[{offset:0,lift:0},{offset:.15,lift:1},{offset:.22,lift:.82},{offset:.30,lift:1},{offset:.43,lift:.88},{offset:.52,lift:1},{offset:.65,lift:.88},{offset:.75,lift:1},{offset:.84,lift:.9},{offset:.96,lift:0},{offset:1,lift:0}];
            animate(bird,extension.map(({offset,lift})=>({offset,transform:`translate(-50%,${-100-lift*flight*110}%) scale(${.3+.7*lift}) rotate(-50deg)`,easing:'ease-in-out'})),{duration:plan.duration});
            animate(spring,extension.map(({offset,lift})=>({offset,transform:`translateX(-50%) scaleY(${.03+lift*flight*.97})`,easing:'ease-in-out'})),{duration:plan.duration});
            void audio.play().catch(()=>say('Кукушка появилась. Для звука нажми ещё раз.'));
        } else {
            const performer=document.createElement('div');performer.className='activity-pug';
            for(const pose of new Set(activityPoses(plan).map(frame=>frame.pose))){
                const body=activityPug(pose,clothes(),catalog);body.classList.add('activity-pug-pose');performer.append(body);
                animate(body,poseFrames(plan,pose),{duration:plan.duration});
            }
            performer.style.width=rect.w*plan.size+'px';layer.append(performer);actor.style.visibility='hidden';
            const frames=plan.frames.map(frame=>({offset:frame.offset,width:(frame.x===null?original.width:rect.w*plan.size)+'px',transform:`translate(${frame.x===null?origin.x:rect.x+frame.x*rect.w}px,${frame.y===null?origin.y:rect.y+frame.y*rect.h}px) translate(-50%,-100%) rotate(${reduced?0:frame.rotate}deg)`,opacity:frame.opacity,easing:'ease-in-out'}));
            if(reduced)for(const frame of frames)frame.transform=`translate(${rect.x+rect.w*.5}px,${rect.y+rect.h*.78}px) translate(-50%,-100%)`;
            animate(performer,frames,{duration:plan.duration});
            // Foreground occlusion makes the pug enter water or stand behind the counter.
            const occlusion=foregroundFrames(plan,reduced);
            if(occlusion){
                const front=document.createElement('img');front.src=definition.img;front.alt='';front.className='activity-furniture-front';front.style.left=rect.x+'px';front.style.top=rect.y+'px';front.style.width=rect.w+'px';front.style.height=rect.h+'px';front.style.clipPath=action==='dive'?'inset(49% 0 0 0)':'inset(43% 0 0 0)';layer.append(front);
                animate(front,occlusion,{duration:plan.duration});
            }
            for(const offset of plan.splash||[])later(()=>splash(rect.x+rect.w*(offset<.5?.5:.85),rect.y+rect.h*(offset<.5?.55:.76)),offset*plan.duration);
            if(plan.cup){
                const cup=document.createElement('img');cup.src='/assets/clay/room-items/fruit_mocktail.webp';cup.alt='';cup.className='activity-cup';cup.style.left=rect.x+rect.w*.52+'px';cup.style.top=rect.y+rect.h*.43+'px';cup.style.width=rect.w*.12+'px';layer.append(cup);
                animate(cup,[{offset:0,opacity:0,transform:'rotate(0deg)'},{offset:.19,opacity:0},{offset:.25,opacity:1,transform:'rotate(0deg)'},{offset:.35,opacity:1,transform:'translate(-8%,-12%) rotate(-25deg)'},{offset:.43,opacity:1,transform:'rotate(0deg)'},{offset:.47,opacity:0},{offset:1,opacity:0}],{duration:plan.duration});
            }
        }
        onChange(true);later(()=>cancel(),plan.duration+50);return true;
    }
    const hidden=()=>{if(document.hidden)cancel();};document.addEventListener('visibilitychange',hidden);window.addEventListener('pagehide',cancel);window.addEventListener('resize',cancel);
    return {play,cancel,get playing(){return !!active;},destroy(){cancel();audio.destroy();document.removeEventListener('visibilitychange',hidden);window.removeEventListener('pagehide',cancel);window.removeEventListener('resize',cancel);}};
}
