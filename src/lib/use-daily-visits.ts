"use client";
import { useEffect, useRef, useState } from "react";
import { browserTimezone, calendarDay, normalizeVisit, type DailyVisit } from "./daily-visits";
import { claimGuestVisit, readWallet, WALLET_KEY, type LocalWallet } from "./wallet";
import { getBrowserSupabase } from "./supabase/client";

export type VisitConfirmation =
  | { kind: "guest"; wallet: LocalWallet }
  | { kind: "cloud"; total: number; bones: number; bonesEarned: number };

export function useDailyVisits({ scope, enabled, onConfirmed }: {
  scope: string; enabled: boolean; onConfirmed: (value: VisitConfirmation) => void;
}) {
  const [entry, setEntry] = useState<{ scope: string; visit: DailyVisit | null }>({ scope: "", visit: null });
  const [notice, setNotice] = useState({ id: 0, reward: 0, restarted: false });
  const confirm = useRef(onConfirmed);
  useEffect(() => { confirm.current = onConfirmed; }, [onConfirmed]);
  useEffect(() => {
    const setVisit = (visit: DailyVisit | null) => setEntry({ scope, visit });
    let active = true, busy = false, lastClientDay = "", lastAttempt = 0;
    let current: DailyVisit | null = null;
    const cacheKey = `flops_daily_visit_v1:${scope}`;
    async function run(force = false) {
      if (!enabled || !active || busy || document.visibilityState === "hidden") return;
      const today = calendarDay(new Date(), current?.timezone || browserTimezone());
      if (!force && today === lastClientDay) return;
      if (Date.now() - lastAttempt < 2000) return;
      busy = true; lastAttempt = Date.now();
      try {
        let reward: number, restarted: boolean;
        if (scope === "guest") {
          const result = await claimGuestVisit();
          if (!active) return;
          current = result.visit; reward = result.reward; restarted = result.restarted;
          confirm.current({ kind: "guest", wallet: result.wallet });
        } else {
          const supabase = getBrowserSupabase();
          if (!supabase) return;
          const { data, error } = await supabase.rpc("claim_daily_visit", { p_timezone: browserTimezone() });
          if (error) throw error;
          if (!active) return;
          current = normalizeVisit(data?.visit);
          if (!current) throw new Error("Invalid visit confirmation");
          reward = data.reward; restarted = data.restarted;
          confirm.current({ kind: "cloud", total: current.rewardTotal, bones: data.state.bones, bonesEarned: data.state.bonesEarned });
        }
        lastClientDay = calendarDay(new Date(), current.timezone);
        setVisit(current);
        try { localStorage.setItem(cacheKey, JSON.stringify(current)); } catch { /* cache only */ }
        if (reward || restarted) setNotice(previous => ({ id: previous.id + 1, reward, restarted }));
      } catch { /* no speculative credits; retry on reconnect or the next visible minute */ }
      finally { busy = false; }
    }
    function storage(event: StorageEvent) {
      if (event.key === WALLET_KEY) {
        const wallet = readWallet();
        if (scope === "guest") { current = wallet.guestVisit; setVisit(current); }
        confirm.current({ kind: "guest", wallet });
      } else if (event.key === cacheKey) void run(true);
    }
    // Defer until hydration and scope effects have completed; cleanup cancels Strict Mode's first pass.
    void Promise.resolve().then(() => {
      if (!active) return;
      setVisit(null);
      setNotice(previous => ({ ...previous, reward: 0, restarted: false }));
      if (enabled) void run();
    });
    const wake = () => { if (Date.now() - lastAttempt >= 60000 || !lastClientDay) void run(true); };
    const online = () => { lastAttempt = 0; void run(true); };
    const interval = window.setInterval(() => void run(), 60000);
    window.addEventListener("online", online);
    window.addEventListener("focus", wake);
    window.addEventListener("storage", storage);
    document.addEventListener("visibilitychange", wake);
    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener("online", online);
      window.removeEventListener("focus", wake);
      window.removeEventListener("storage", storage);
      document.removeEventListener("visibilitychange", wake);
    };
  }, [scope, enabled]);
  return { visit: entry.scope === scope ? entry.visit : null, notice };
}
