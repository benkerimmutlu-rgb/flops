"use client";
import { useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserState } from '@/lib/store';
import { SHOP_RELEASE, shouldShowRelease } from '@/lib/shop-release';
const key = 'flops:shop-release-seen';
const subscribe = (notify: () => void) => { window.addEventListener('storage', notify); window.addEventListener('flops:shop-news', notify); return () => { window.removeEventListener('storage', notify); window.removeEventListener('flops:shop-news', notify); }; };
function snapshot() { try { return shouldShowRelease(localStorage.getItem(key)); } catch { return false; } }
function dismiss() { try { localStorage.setItem(key, SHOP_RELEASE.id); } catch {} window.dispatchEvent(new Event('flops:shop-news')); }
export function ShopNews() {
  const show = useSyncExternalStore(subscribe, snapshot, () => false);
  const { hydrated, giftPending } = useUserState(); const path = usePathname();
  if (!show || !hydrated || giftPending || path === "/flops" || path === "/flops/room" || ['/flops/login', '/flops/onboarding', '/flops/auth/callback'].includes(path)) return null;
  return <aside className="shop-news" aria-label="Новинки магазина">
    <Image src="/assets/clay/room-items/figure_rumi.webp" alt="" width={82} height={82}/>
    <div><strong>Новые фигурки — по 8 косточек!</strong><p>K-pop Demon Hunters и бурундуки уже в магазине. Их можно ставить на полочки.</p><div className="shop-news-links"><Link href="/flops/shop" onClick={dismiss}>Смотреть новинки</Link><Link href="/flops/flags" onClick={dismiss}>Заработать косточки</Link></div></div>
    <button type="button" aria-label="Закрыть новинки" onClick={dismiss}>×</button>
  </aside>;
}
