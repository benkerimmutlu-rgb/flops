"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getFlopsAsset } from "@/brand/flops-assets";
import styles from "./NavBar.module.css";

// Итоговое меню. На широком экране — текстовые ссылки сверху; на телефоне —
// нижняя панель с иконками (ничего не нужно скроллить вбок). «Повтори» и «Учу»
// живут внутри «Флагов».
const LINKS = [
  { href: "/flags", label: "Флаги", image: "/assets/navigation/capital_flag.webp" },
  { href: "/capitals", label: "Столицы", image: "/assets/navigation/signpost.webp" },
  { href: "/languages", label: "Языки", image: "/assets/navigation/sound_speaker.webp" },
  { href: "/memory", label: "Меморина", image: null },
  { href: "/world", label: "Мой мир", image: "/assets/navigation/map.webp" },
  { href: "/shop", label: "Магазин", image: "/assets/world/suitcase.webp" },
  { href: "/room", label: "Домик", image: "/assets/navigation/clay-doghouse.webp" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function NavBar() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return (
    <>
      {/* Верхняя полоса: логотип + ссылки (ссылки только на широком экране) */}
      <nav aria-label="Основная навигация" className="flops-topbar border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
          <Link href="/" className="shrink-0" aria-label="FLOPS — на главную">
            <Image
              src={getFlopsAsset("flops_wordmark", false)}
              alt="FLOPS"
              width={193}
              height={100}
              priority
              className="h-8 w-auto object-contain"
            />
          </Link>
          <div className="flops-desktop-links items-center gap-1">
            {LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                    active ? "bg-brand-green text-white" : "text-muted hover:bg-black/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Нижняя панель (телефон): иконки, крупные зоны нажатия */}
      <nav aria-label="Мобильная навигация" className={styles.mobile}>
        <div className={styles.links}>
          {LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={styles.link}
              >
                {link.image ? <Image src={link.image} alt="" width={48} height={48} className={styles.icon} />
                  : <span className={styles.memory} aria-hidden="true"><i /><i /></span>}
                <span className={styles.label}>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
