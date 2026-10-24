'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserState } from '@/lib/store';
import { TREEHOUSE_GIFTS, giftReady } from '@/lib/treehouse-adventure';
import { calendarDay, dayNumber } from '@/lib/daily-visits';
import { accessoryById } from '@/lib/shop';

export function TreehouseAdventure({ compact = false }: { compact?: boolean }) {
  const { roomData, roomHydrated, giftPending, startTreehouse, claimTreehouseGift } = useUserState();
  const router = useRouter();
  // Wake at midnight and after the tab resumes, without requiring a reload.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = () => setNow(new Date());
    const timer = window.setInterval(tick, 60000);
    window.addEventListener('focus', tick);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(timer); window.removeEventListener('focus', tick); document.removeEventListener('visibilitychange', tick); };
  }, []);
  if (!roomHydrated || giftPending) return null;
  const adventure = roomData.adventure;
  if (!adventure) return <section className="treehouse-welcome" aria-labelledby="treehouse-title">
    <Image src="/assets/clay/room-treehouse.webp" width={240} height={180} alt="Новый пластилиновый домик на дереве"/>
    <div><h2 id="treehouse-title">Флопс переехал!</h2><p>Новый домик и три подарка ждут тебя.</p><button onClick={() => { startTreehouse(); router.push('/flops/room'); }}>Открыть домик <span aria-hidden="true">→</span></button></div>
  </section>;
  const readyCount = TREEHOUSE_GIFTS.filter(id => giftReady(adventure, id, now)).length;
  const complete = adventure.claimed.length === TREEHOUSE_GIFTS.length;
  if (complete) return null;
  const content = <>
    <div className="treehouse-heading"><div><h2 id="treehouse-title">Подарки для домика</h2><p>{adventure.answers < 3 ? `Ответь верно ещё ${3 - adventure.answers} ${adventure.answers === 2 ? "раз" : "раза"} — получи фонарик.` : 'Забирай подарки и обустраивайся.'}</p></div>{adventure.answers < 3 && <Link className="treehouse-play" href="/flops/flags">Играть →</Link>}</div>
    <div className="treehouse-gifts">{TREEHOUSE_GIFTS.map((id, index) => {
      const item = accessoryById(id)!;
      const claimed = adventure.claimed.includes(id), ready = giftReady(adventure, id, now);
      const elapsed = dayNumber(calendarDay(now, adventure.timezone)) - dayNumber(adventure.startedDay);
      const delay = Math.max(1, index - elapsed);
      const label = claimed ? 'У тебя' : ready ? 'Забрать' : index === 0 ? `${adventure.answers} / 3` : delay === 1 ? 'Завтра' : `Через ${delay} дня`;
      return <div className="treehouse-gift" key={id} data-claimed={claimed}>
        <Image src={item.img} alt="" width={92} height={92}/><strong>{item.name}</strong>
        <button disabled={!ready} aria-label={`${label}: ${item.name}`} onClick={() => claimTreehouseGift(id)}>{claimed ? '✓ ' : ''}{label}</button>
      </div>;
    })}</div>
    <p className="treehouse-note">Подарки не пропадут, даже если пропустить день.</p>
    <span className="sr-only" role="status">Правильных ответов: {adventure.answers} из 3. Подарков получено: {adventure.claimed.length} из 3.</span>
  </>;
  return compact ? <details className="treehouse-adventure treehouse-details"><summary>Подарки для домика <span>{readyCount ? "Есть подарок!" : `${adventure.claimed.length} / 3`} <span aria-hidden="true">⌄</span></span></summary>{content}</details>
    : <section className="treehouse-adventure" aria-labelledby="treehouse-title">{content}</section>;
}
