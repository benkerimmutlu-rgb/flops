"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useUserState } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { mountPoseMotion } from "./pose-motion";
import { DailyVisitBadge } from "../DailyVisitBadge";

const cards = [
  { href: "/flags", title: "Флаги", image: "/assets/navigation/globe.webp", color: "green" },
  { href: "/capitals", title: "Столицы", image: "/assets/navigation/signpost.webp", color: "yellow" },
  { href: "/languages", title: "Языки", image: "/assets/navigation/sound_speaker.webp", color: "blue" },
  { href: "/memory", title: "Меморина", image: null, color: "pink" },
  { href: "/world", title: "Мой мир", image: "/assets/navigation/map.webp", color: "mint" },
  { href: "/shop", title: "Магазин", image: "/assets/world/suitcase.webp", color: "peach" },
];
export function ClayHome() {
  const root = useRef<HTMLDivElement>(null), nextPose = useRef(0);
  const [paused, setPaused] = useState(false);
  const { bones } = useUserState();
  const auth = useAuth();
  useEffect(() => {
    if (!root.current) return;
    const node = root.current;
    const onPose = (event: Event) => { nextPose.current = ["wave", "sit", "jump", "sleep"].indexOf((event as CustomEvent<string>).detail); };
    node.addEventListener("kids:pose-changed", onPose);
    const stop = mountPoseMotion(node);
    return () => { node.removeEventListener("kids:pose-changed", onPose); stop(); };
  }, []);
  return <div id="flops-kids" ref={root} className={paused ? "kids-paused" : undefined}>
    <header className="kids-header">
      <Link className="kids-logo-link" href="/" aria-label="FLOPS — на главную">
        {/* eslint-disable-next-line @next/next/no-img-element -- clay bitmap */}
        <img className="kids-logo" src="/assets/logo/flops_wordmark.webp" alt="FLOPS" width="112" height="58" />
      </Link>
      <div className="kids-tools">
        <Link className="kids-house" href="/room">Домик</Link>
        {auth.configured && (auth.status === "ready" ? <button className="kids-account" onClick={auth.signOut}>Выйти</button> : <Link className="kids-account" href={auth.status === "no_profile" ? "/onboarding" : "/login"}>Войти</Link>)}
        <div className="kids-visit"><DailyVisitBadge /></div>
        <div className="kids-balance" aria-label={`${bones} косточек`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- small clay icon */}
          <img src="/assets/rewards/bone_currency.webp" alt="" /><span>{bones}</span>
        </div>
        <button className="kids-pause" type="button" aria-label={paused ? "Продолжить анимацию" : "Приостановить анимацию"} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? "▶" : "Ⅱ"}</button>
      </div>
    </header>
    <div className="kids-stage">
      <div className="kids-shadow" aria-hidden="true" />
      <button className="kids-mascot" type="button" aria-label="Поменять позу Флопса" onClick={() => {
        nextPose.current = (nextPose.current + 1) % 4;
        root.current?.dispatchEvent(new CustomEvent("kids:pose", { detail: ["wave", "sit", "jump", "sleep"][nextPose.current] }));
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- canvas animation fallback */}
        <img className="kids-mascot-fallback" src="/assets/clay/pose-wave.webp" alt="Флопс" />
      </button>
    </div>
    <nav className="kids-grid" aria-label="Разделы FLOPS">
      {cards.map(card => <Link key={card.href} className={`kids-tile kids-${card.color}`} href={card.href}>
        {card.image
          // eslint-disable-next-line @next/next/no-img-element -- transparent clay asset
          ? <img src={card.image} alt="" />
          : <span className="kids-memory-icon" aria-hidden="true"><i /><i /></span>}
        <span>{card.title}</span>
      </Link>)}
    </nav>
  </div>;
}
