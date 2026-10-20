"use client";
import { useEffect, useId, useState, type CSSProperties } from "react";
import Image from "next/image";
import { useUserState } from "@/lib/store";
import { VISIT_REWARD } from "@/lib/daily-visits";
import styles from "./DailyVisitBadge.module.css";

const shown = new Set<number>();
export function DailyVisitBadge() {
  const { dailyVisit: visit, visitNotice: notice } = useUserState();
  const [flashId, setFlashId] = useState(-1);
  const [position, setPosition] = useState({ left: 12, top: 120 });
  const infoId = useId();
  const flash = flashId === notice.id && notice.reward > 0;
  useEffect(() => {
    if (!notice.reward || shown.has(notice.id)) return;
    const start = setTimeout(() => { shown.add(notice.id); setFlashId(notice.id); }, 0);
    const end = setTimeout(() => setFlashId(-1), 4200);
    return () => { clearTimeout(start); clearTimeout(end); };
  }, [notice.id, notice.reward]);
  if (!visit) return null;
  const progress = flash ? 3 : visit.days % 3;
  const left = 3 - visit.days % 3;
  const remaining = `Ещё ${left} ${left === 1 ? "день" : "дня"} до ${VISIT_REWARD} косточек`;
  const dayWord = visit.days % 10 === 1 && visit.days % 100 !== 11 ? "день"
    : [2, 3, 4].includes(visit.days % 10) && ![12, 13, 14].includes(visit.days % 100) ? "дня" : "дней";
  return <div className={styles.badge}>
    <button type="button" popoverTarget={infoId} className={styles.toggle} aria-label={`С Флопсом: ${visit.days} ${dayWord}. ${remaining}`} onClick={event => {
      const bounds = event.currentTarget.getBoundingClientRect();
      setPosition({ left: Math.max(12, Math.min(window.innerWidth - 242, bounds.right - 230)), top: bounds.bottom + 12 });
    }}>
      <span className={styles.paws} aria-hidden="true">{[0, 1, 2].map(index =>
        <span key={index} className={`${styles.paw} ${index < progress ? styles.filled : ""}`}><i /><i /><i /><i /><b /></span>)}</span>
      {flash && <span className={styles.reward} aria-hidden="true">+{VISIT_REWARD}</span>}
    </button>
    <div id={infoId} popover="auto" className={styles.info} style={position}>
      <strong>С Флопсом: {visit.days} {dayWord}</strong>
      {notice.restarted && visit.days === 1 && <p>Рады тебе! Начнём снова.</p>}
      <p>{remaining}</p>
      <p>Один пропуск за семь дней прощается.</p>
    </div>
    {flash && <span className={styles.flight} aria-hidden="true">{Array.from({ length: VISIT_REWARD }, (_, index) =>
      <Image key={index} src="/assets/rewards/bone_currency.webp" alt="" width={22} height={22} style={{ "--bone": index } as CSSProperties} />)}</span>}
    <span className={styles.sr} role="status">{flash ? `Пять косточек за три дня с Флопсом!` : ""}</span>
  </div>;
}
