"use client";
import { useEffect, useRef } from 'react';
import { createLiveClockController, liveClockMarkup } from './clay/live-clock.js';

export function LiveClockOverlay({id}:{id:string}) {
  const root=useRef<HTMLSpanElement>(null),markup=liveClockMarkup(id);
  useEffect(()=>{
    if(!root.current||!markup)return;
    const clock=createLiveClockController(root.current);
    return ()=>clock.destroy();
  },[id,markup]);
  return markup?<span ref={root} className="live-clock-overlay" dangerouslySetInnerHTML={{__html:markup}}/>:null;
}
