"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getFlopsAsset } from "@/brand/flops-assets";

// Итоговое меню. На широком экране — текстовые ссылки сверху; на телефоне —
// нижняя панель с иконками (ничего не нужно скроллить вбок). «Повтори» и «Учу»
// живут внутри «Флагов».
const LINKS = [
  { href: "/flags", label: "Флаги", icon: "🚩" },
  { href: "/capitals", label: "Столицы", icon: "🏛️" },
  { href: "/languages", label: "Языки", icon: "💬" },
  { href: "/memory", label: "Меморина", icon: "🧩" },
  { href: "/world", label: "Мой мир", icon: "🌍" },
  { href: "/shop", label: "Магазин", icon: "🛍️" },
  { href: "/room", label: "Домик", icon: "🏠" },
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
      <nav className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
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
          <div className="hidden items-center gap-1 sm:flex">
            {LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
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
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-3xl items-stretch">
          {LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2 ${
                  active ? "text-brand-green" : "text-muted"
                }`}
              >
                <span className="text-[22px] leading-none" aria-hidden>
                  {link.icon}
                </span>
                <span className="text-[10px] font-bold leading-none">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
