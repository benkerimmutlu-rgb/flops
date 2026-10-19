"use client";

import Image from "next/image";
import { useUserState } from "@/lib/store";
import { getFlopsAsset } from "@/brand/flops-assets";
import { ACCESSORIES, rankForEarned } from "@/lib/shop";

export default function ShopPage() {
  const { bones, bonesEarned, owned, buyAccessory } = useUserState();
  const { rank } = rankForEarned(bonesEarned);
  const ownedCount = ACCESSORIES.filter((a) => owned.includes(a.id)).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Заголовок + баланс */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-foreground">
            Магазин Флопса
          </h1>
          <p className="text-muted">Копи косточки в играх и собирай вещи Флопса.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full bg-surface px-3.5 py-2 shadow-[var(--shadow-card)]">
          <Image src={getFlopsAsset("bone_currency")} alt="Косточки" width={26} height={26} className="h-6 w-6 object-contain" />
          <span className="text-lg font-bold text-foreground">{bones}</span>
        </div>
      </div>

      {/* Коллекция */}
      <section className="flex items-center gap-4 rounded-[var(--radius-card)] border border-border bg-brand-yellow/10 p-5 shadow-[var(--shadow-card)]">
        <Image
          src={getFlopsAsset("ops_celebrate")}
          alt="Флопс"
          width={88}
          height={88}
          className="h-20 w-20 shrink-0 object-contain flops-bob"
        />
        <div>
          <p className="text-[17px] font-bold text-foreground">
            {rank.emoji} {rank.name}
          </p>
          <p className="text-sm text-muted">
            Собрано вещей: <b className="text-foreground">{ownedCount}</b> из{" "}
            {ACCESSORIES.length}. Покупай — и они оживают цветом!
          </p>
        </div>
      </section>

      {/* Витрина */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ACCESSORIES.map((a) => {
          const isOwned = owned.includes(a.id);
          const canAfford = bones >= a.price;
          return (
            <div
              key={a.id}
              className={`flex flex-col items-center gap-2 rounded-[var(--radius-card)] border bg-surface p-4 text-center shadow-[var(--shadow-card)] ${
                isOwned ? "border-brand-green/40" : "border-border"
              }`}
            >
              <Image
                src={a.img}
                alt={a.name}
                width={88}
                height={88}
                className={`h-20 w-20 object-contain transition ${
                  isOwned ? "" : "grayscale opacity-45"
                }`}
              />
              <span
                className={`text-[15px] font-bold ${
                  isOwned ? "text-foreground" : "text-muted"
                }`}
              >
                {a.name}
              </span>

              {isOwned ? (
                <span className="text-sm font-bold text-brand-green">Куплено ✓</span>
              ) : (
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
