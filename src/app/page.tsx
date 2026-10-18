"use client";

import Link from "next/link";
import Image from "next/image";
import { getFlopsAsset, FlopsAssetId } from "@/brand/flops-assets";
import { useUserState } from "@/lib/store";

type MenuCard = {
  href: string;
  title: string;
  description: string;
  asset: FlopsAssetId;
  tint: string;
  badge?: number;
};

export default function Home() {
  const { all, bones } = useUserState();

  const repeatCount = Object.values(all).filter((s) => s.inRepeat).length;
  const knownCount = Object.values(all).filter((s) => s.known).length;
  const learningCount = Object.values(all).filter((s) => s.seen && !s.known).length;

  const cards: MenuCard[] = [
    {
      href: "/flags",
      title: "Учи флаги",
      description: "Слушай и угадывай страну по флагу. Выбери сколько и какой континент.",
      asset: "globe",
      tint: "bg-brand-green/10",
    },
    {
      href: "/flags/repeat",
      title: "Повтори",
      description: "Флаги, которые пока не даются. Повтори — и запомнишь!",
      asset: "ops_worried_badge",
      tint: "bg-brand-red/10",
      badge: repeatCount,
    },
    {
      href: "/categories",
      title: "Знаю",
      description: "Разложи знакомые страны по 4 полочкам путешествий.",
      asset: "map",
      tint: "bg-brand-yellow/15",
      badge: knownCount,
    },
    {
      href: "/learning",
      title: "Учу",
      description: "Страны на пути к «Знаю».",
      asset: "ops_green_pack",
      tint: "bg-brand-blue/10",
      badge: learningCount,
    },
    {
      href: "/memory",
      title: "Меморина",
      description: "Игра на память против мопса Флопса. Скоро!",
      asset: "ops_play",
      tint: "bg-clay-beige/20",
    },
    {
      href: "/capitals",
      title: "Учи столицы",
      description: "Флаг и страна есть — а столицу надо вспомнить.",
      asset: "signpost",
      tint: "bg-brand-blue/10",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Приветствие + баланс косточек */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-bold leading-tight text-foreground">
            Привет! Готовы путешествовать?
          </h1>
          <p className="max-w-prose text-muted">
            Учим флаги, столицы и культуру мира вместе с мопсом Опсом. Для детей
            и взрослых — без оценок «правильно / неправильно».
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full bg-surface px-3 py-2 shadow-[var(--shadow-card)]">
          <Image src={getFlopsAsset("bone_currency")} alt="Косточки" width={28} height={28} className="h-7 w-7 object-contain" />
          <span className="text-lg font-bold text-foreground">{bones}</span>
        </div>
      </div>

      {/* Центральный персонаж */}
      <div className="flex justify-center">
        <Image
          src={getFlopsAsset("ops_explorer")}
          alt="Мопс Опс — путешественник с рюкзаком"
          width={240}
          height={240}
          priority
          className="h-44 w-44 object-contain drop-shadow-[0_12px_24px_rgba(31,36,48,0.12)] flops-bob sm:h-52 sm:w-52"
        />
      </div>

      {/* Карточки меню */}
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group relative flex items-center gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
          >
            <span className={`relative flex h-20 w-20 shrink-0 items-center justify-center rounded-[var(--radius-icon)] ${card.tint}`}>
              <Image src={getFlopsAsset(card.asset)} alt="" width={72} height={72} className="h-16 w-16 object-contain" />
              {card.badge !== undefined && card.badge > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-7 min-w-7 items-center justify-center rounded-full bg-brand-red px-1.5 text-sm font-bold text-white shadow">
                  {card.badge}
                </span>
              )}
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-[21px] font-bold leading-tight text-foreground">{card.title}</span>
              <span className="text-sm text-muted">{card.description}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
