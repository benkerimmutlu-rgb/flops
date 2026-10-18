"use client";

import Image from "next/image";
import { useUserState } from "@/lib/store";
import { getFlopsAsset } from "@/brand/flops-assets";
import { ACCESSORIES, rankForEarned } from "@/lib/shop";
import { FlopsDressed, wornSummary } from "@/components/FlopsDressed";

export default function ShopPage() {
  const { bones, bonesEarned, owned, equipped, buyAccessory, equipAccessory } =
    useUserState();
  const { rank } = rankForEarned(bonesEarned);
  const summary = wornSummary(equipped);

  return (
    <div className="flex flex-col gap-6">
      {/* Заголовок + баланс */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-foreground">
            Магазин Флопса
          </h1>
          <p className="text-muted">
            Копи косточки в играх и наряжай Флопса.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full bg-surface px-3.5 py-2 shadow-[var(--shadow-card)]">
          <Image src={getFlopsAsset("bone_currency")} alt="Косточки" width={26} height={26} className="h-6 w-6 object-contain" />
          <span className="text-lg font-bold text-foreground">{bones}</span>
        </div>
      </div>

      {/* Образ Флопса — он реально надевает купленное */}
      <section className="flex items-center gap-4 rounded-[var(--radius-card)] border border-border bg-brand-yellow/10 p-5 shadow-[var(--shadow-card)]">
        <FlopsDressed size={150} className="shrink-0" />
        <div>
          <p className="text-[17px] font-bold text-foreground">
            {rank.emoji} {rank.name}
          </p>
          <p className="text-sm text-muted">
            {summary ? (
              <>
                На Флопсе: <b className="text-foreground">{summary}</b>
              </>
            ) : (
              "Купи аксессуар и нажми «Надеть» — Флопс сразу его наденет."
            )}
          </p>
        </div>
      </section>

      {/* Витрина */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ACCESSORIES.map((a) => {
          const isOwned = owned.includes(a.id);
          const isOn = equipped.includes(a.id);
          const canAfford = bones >= a.price;
          return (
            <div
              key={a.id}
              className={`flex flex-col items-center gap-2 rounded-[var(--radius-card)] border bg-surface p-4 text-center shadow-[var(--shadow-card)] ${
                isOn ? "border-brand-green" : "border-border"
              }`}
            >
              <span className="text-4xl" aria-hidden>
                {a.emoji}
              </span>
              <span className="text-[15px] font-bold text-foreground">{a.name}</span>

              {!isOwned ? (
                <>
                  <span className="flex items-center gap-1 text-sm font-bold text-muted">
                    <Image src={getFlopsAsset("bone_currency")} alt="" width={16} height={16} className="h-4 w-4 object-contain" />
                    {a.price}
                  </span>
                  <button
                    onClick={() => buyAccessory(a.id, a.price)}
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
              ) : (
                <>
                  <span className="text-sm font-bold text-brand-green">Куплено ✓</span>
                  <button
                    onClick={() => equipAccessory(a.id)}
                    className={`w-full rounded-full px-3 py-2 text-sm font-bold transition-colors ${
                      isOn
                        ? "bg-brand-green/15 text-brand-green"
                        : "border border-border bg-surface text-foreground hover:bg-black/[0.03]"
                    }`}
                  >
                    {isOn ? "Надето ✓" : "Надеть"}
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted">
        Косточки зарабатываются в играх: «Флаги», «Столицы», «Языки» и «Меморина».
      </p>
    </div>
  );
}
