"use client";

import { useEffect, useState } from "react";
import { PhoneShell } from "@/components/Logo";
import { Splash } from "@/components/Splash";
import { HubView } from "@/components/HubView";

const SPLASH_KEY = "iznanka_entered";

export default function Home() {
  // Сплэш показывается один раз за сессию, затем — карта знаний.
  const [entered, setEntered] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SPLASH_KEY) === "1";
    } catch {
      seen = false;
    }
    setEntered(seen);
    setHydrated(true);
  }, []);

  const enter = () => {
    try {
      sessionStorage.setItem(SPLASH_KEY, "1");
    } catch {
      /* ignore */
    }
    setEntered(true);
  };

  if (!hydrated) return <PhoneShell black>{null}</PhoneShell>;

  return (
    <PhoneShell black={!entered}>
      {entered ? <HubView /> : <Splash onEnter={enter} />}
    </PhoneShell>
  );
}
