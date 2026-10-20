"use client";

import { useState, type CSSProperties, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import "./shop.css";
import { DailyVisitBadge } from "@/components/DailyVisitBadge";
import { useUserState } from "@/lib/store";
import { getFlopsAsset } from "@/brand/flops-assets";
import {
  ACCESSORIES,
  SHOP_CATEGORIES,
  activeCategories,
  itemsByCategory,
  rankForEarned,
  type Accessory,
} from "@/lib/shop";

type Tab = "collection" | (typeof SHOP_CATEGORIES)[number]["id"];
const sections = [
  { id: "collection" as const, label: "Коллекция", image: "/assets/clay/room-items/chest.webp", color: "#d0ddc0" },
  ...activeCategories(),
];

function navigateSections(event: KeyboardEvent<HTMLDivElement>) {
  const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const index = tabs.indexOf(event.target as HTMLButtonElement);
  if (index < 0) return;
  const columns = getComputedStyle(event.currentTarget).gridTemplateColumns.split(" ").length;
  const delta: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: columns, ArrowUp: -columns };
  let next: number;
  if (event.key === "Home") next = 0;
  else if (event.key === "End") next = tabs.length - 1;
  else if (event.key in delta) next = (index + delta[event.key] + tabs.length) % tabs.length;
  else return;
  event.preventDefault();
  tabs[next].focus();
  tabs[next].click();
}

export default function ShopPage() {
  const { bones, bonesEarned, owned, buyAccessory } = useUserState();
  const { rank } = rankForEarned(bonesEarned);
  const [tab, setTab] = useState<Tab>("collection");

  const ownedItems = ACCESSORIES.filter((a) => owned.includes(a.id));

  return (
    <div className="shop-page flex flex-col gap-6">
      {/* Заголовок + баланс */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-foreground">
            Магазин
          </h1>
          <Link href="/room" className="inline-flex min-h-11 items-center font-bold text-brand-green">Домик →</Link>
        </div>
        <div className="flex shrink-0 items-center gap-3">
        <DailyVisitBadge />
        <div className="flex shrink-0 items-center gap-2 rounded-full bg-surface px-3.5 py-2 shadow-[var(--shadow-card)]">
          <Image src={getFlopsAsset("bone_currency")} alt="Косточки" width={26} height={26} className="h-6 w-6 object-contain" />
          <span className="text-lg font-bold text-foreground">{bones}</span>
        </div>
        </div>
      </div>

      <div className="shop-sections" role="tablist" aria-label="Разделы магазина" onKeyDown={navigateSections}>
        {sections.map(section => (
          <button
            key={section.id}
            type="button"
            role="tab"
            id={`shop-tab-${section.id}`}
            aria-selected={tab === section.id}
            aria-controls="shop-items"
            tabIndex={tab === section.id ? 0 : -1}
            className="shop-section"
            style={{ "--section-color": section.color } as CSSProperties}
            onClick={() => setTab(section.id)}
          >
            <Image src={section.image} alt="" width={72} height={72} className="shop-section-icon" />
            <span>{section.label}</span>
          </button>
        ))}
      </div>

      <div id="shop-items" role="tabpanel" aria-labelledby={`shop-tab-${tab}`} tabIndex={0} className="shop-panel">
      {tab === "collection" ? (
        <Collection
          ownedItems={ownedItems}
          total={ACCESSORIES.length}
          rank={`${rank.emoji} ${rank.name}`}
        />
      ) : (
        <CategoryGrid
          items={itemsByCategory(tab)}
          owned={owned}
          bones={bones}
          onBuy={buyAccessory}
        />
      )}
      </div>
    </div>
  );
}

/** Коллекция — радостный Флопс и только купленные вещи, в цвете. */
function Collection({
  ownedItems,
  total,
  rank,
}: {
  ownedItems: Accessory[];
  total: number;
  rank: string;
}) {
  return (
    <div className="flex flex-col gap-5">
      <section className="flex items-center gap-4 rounded-[var(--radius-card)] border border-border bg-brand-yellow/10 p-5 shadow-[var(--shadow-card)]">
        <Image
          src={getFlopsAsset("ops_celebrate")}
          alt="Флопс рад"
          width={88}
          height={88}
          className="h-20 w-20 shrink-0 object-contain flops-bob"
        />
        <div>
          <p className="text-[17px] font-bold text-foreground">{rank}</p>
          <p className="text-sm text-muted">
            Моя коллекция: <b className="text-foreground">{ownedItems.length}</b> из{" "}
            {total} вещей.
          </p>
        </div>
      </section>

      {ownedItems.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-dashed border-border p-8 text-center text-muted">
          <p className="font-bold text-foreground">Пока пусто</p>
          <p>Загляни во вкладки магазина и купи первую вещь — она появится тут в цвете!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {ownedItems.map((a) => (
            <div
              key={a.id}
              className="flex flex-col items-center gap-1.5 rounded-[var(--radius-card)] border border-brand-green/40 bg-surface p-3 text-center shadow-[var(--shadow-card)]"
            >
              <Image src={a.img} alt={a.name} width={72} height={72} className="h-16 w-16 object-contain" />
              <span className="text-xs font-bold text-foreground">{a.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Предметы выбранной категории и их доступность для покупки. */
function CategoryGrid({
  items,
  owned,
  bones,
  onBuy,
}: {
  items: Accessory[];
  owned: string[];
  bones: number;
  onBuy: (id: string, price: number) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-border p-8 text-center text-muted">
        Скоро здесь появятся вещи 🙂
      </div>
    );
  }
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((a) => {
          const isOwned = owned.includes(a.id);
          const canAfford = bones >= a.price;
          return (
            <div
              key={a.id}
              className="relative flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-border bg-surface p-4 text-center shadow-[var(--shadow-card)]"
            >
              {a.oldPrice && !isOwned && (
                <span className="absolute -left-1.5 -top-1.5 rounded-full bg-brand-red px-2 py-0.5 text-[11px] font-bold text-white shadow">
                  −{Math.round((1 - a.price / a.oldPrice) * 100)}%
                </span>
              )}
              {/* Цветной пластилиновый предмет; покупка отмечается отдельно. */}
              <Image
                src={a.img}
                alt={a.name}
                width={88}
                height={88}
                className="h-28 w-28 object-contain"
              />
              <span className="text-[15px] font-bold text-foreground">{a.name}</span>

              {isOwned ? (
                <span className="text-sm font-bold text-brand-green">Куплено ✓</span>
              ) : (
                <>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-muted">
                    <Image src={getFlopsAsset("bone_currency")} alt="" width={16} height={16} className="h-4 w-4 object-contain" />
                    {a.oldPrice && (
                      <span className="font-semibold text-muted/60 line-through">{a.oldPrice}</span>
                    )}
                    <span className={a.oldPrice ? "text-brand-red" : ""}>{a.price}</span>
                  </span>
                  <button
                    onClick={() => onBuy(a.id, a.price)}
                    disabled={!canAfford}
                    className={`w-full rounded-full px-3 py-2 text-sm font-bold transition-colors ${
                      canAfford
                        ? "bg-brand-green text-white active:scale-95"
                        : "cursor-not-allowed bg-black/5 text-muted"
                    }`}
                  >
                    {canAfford ? "Купить" : "Мало косточек"}
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
