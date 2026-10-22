"use client";
import { useEffect, useRef, useState, type ReactNode } from 'react';
import catalog from './clay/room-catalog.json';
import { LiveClockOverlay } from './LiveClockOverlay';
import { musicRestMarkup } from './clay/music-props.js';
import { ACTIVITIES } from './clay/activity-plans.js';
import { createActivityPlayer } from './clay/room-activities.js';

export function ActivityPreview({id,src,name,children}:{id:string;src:string;name:string;children:ReactNode}) {
  const dialog=useRef<HTMLDialogElement>(null), stage=useRef<HTMLDivElement>(null), actor=useRef<HTMLDivElement>(null), toy=useRef<HTMLDivElement>(null);
  const player=useRef<ReturnType<typeof createActivityPlayer>|null>(null);
  const [playing,setPlaying]=useState(false), [status,setStatus]=useState('');
  const actions=ACTIVITIES[id as keyof typeof ACTIVITIES];
  const definition=catalog.find(item=>item.id===id)!;
  useEffect(()=>{
    const mounted=createActivityPlayer({stage:stage.current!,actor:actor.current!,onChange:setPlaying,say:setStatus});
    player.current=mounted;
    return ()=>{mounted.destroy();if(player.current===mounted)player.current=null;};
  },[]);
  const play=(action:string)=>player.current?.play(action,toy.current,definition);
  return <span className="activity-preview-wrap">
    <button type="button" className="activity-preview" aria-label={`Посмотреть: ${name}`} aria-haspopup="dialog" onClick={()=>{dialog.current?.showModal();play(actions[0].id);}}>
      {children}<span className="activity-preview-badge" aria-hidden="true">▶</span>
    </button>
    <dialog ref={dialog} className="activity-demo" aria-label={name} onClose={()=>player.current?.cancel()} onCancel={()=>player.current?.cancel()}>
      <header><h2>{name}</h2><button type="button" aria-label="Закрыть просмотр" onClick={()=>dialog.current?.close()}>×</button></header>
      <div ref={stage} className="activity-demo-stage">
        {/* Stable square sprite registration is shared with the room engine. */}
        <div ref={toy} style={{transform:`translate(-50%,-${(definition.anchorY??1)*100}%)`}} className={`activity-demo-toy ${id==='cuckoo_clock'?'activity-demo-clock':''}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="h-full w-full object-contain"/><LiveClockOverlay id={id}/>{id === 'premium_music_studio' && <span dangerouslySetInnerHTML={{__html:musicRestMarkup(id)}}/>}
        </div>
        <div ref={actor} className="activity-demo-actor">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/clay/room-pug-sit.webp" alt="Флопс"/>
        </div>
      </div>
      <div className="activity-demo-actions">{playing ? <button type="button" onClick={()=>player.current?.cancel()}>■ Остановить</button> : actions.map(action=><button type="button" key={action.id} onClick={()=>play(action.id)}>▶ {action.label}</button>)}</div>
      <span className="sr-only" role="status">{status}</span>
    </dialog>
  </span>;
}
