"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getFlopsAsset } from "@/brand/flops-assets";

const LINKS = [
  { href: "/", label: "Главная" },
  { href: "/flags", label: "Флаги" },
  { href: "/flags/repeat", label: "Повтори" },
  { href: "/categories", label: "Знаю" },
  { href: "/learning", label: "Учу" },
  { href: "/memory", label: "Меморина" },
  { href: "/capitals", label: "Столицы" },
];

export function NavBar() {
  const pathname = usePathname();
  // Only the most specific matching link is active, so /flags/repeat lights up
  // "Повтори" and not also "Флаги".
  const activeHref = LINKS.reduce((best, link) => {
    const matches =
      link.href === "/"
        ? pathname === "/"
        : pathname === link.href || pathname.startsWith(link.href + "/");
    if (matches && link.href.length > best.length) return link.href;
    return best;
  }, "");
  return (
    <nav className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-1 overflow-x-auto px-4 py-3">
        <Link href="/" className="mr-3 shrink-0" aria-label="FLOPS — на главную">
          <Image
            src={getFlopsAsset("flops_wordmark")}
            alt="FLOPS"
            width={104}
            height={41}
            priority
            className="h-7 w-auto object-contain"
          />
        </Link>
        {LINKS.map((link) => {
          const active = link.href === activeHref;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-brand-green text-white"
                  : "text-muted hover:bg-black/5"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
