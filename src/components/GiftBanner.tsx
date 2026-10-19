"use client";

import Image from "next/image";
import { useUserState } from "@/lib/store";
import { accessoryById } from "@/lib/shop";
import { getFlopsAsset } from "@/brand/flops-assets";

// Разовое окно-извинение с подарком (кокос) от FLOPS за сбой с пропажей вещей.
export function GiftBanner() {
  const { giftPending, dismissGift } = useUserState();
  if (!giftPending) return null;
  const coconut = accessoryById("su9");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={dismissGift}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex w-full max-w-sm flex-col items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-6 text-center shadow-[var(--shadow-card)]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={getFlopsAsset("ops_celebrate")}
          alt="Флопс"
          width={96}
          height={96}
          className="h-24 w-24 object-contain flops-pop"
        />
        <h2 className="text-2xl font-bold text-foreground">Подарок от Флопса 🥥</h2>

        {coconut && (
          <div className="flex items-center gap-2 rounded-full bg-brand-yellow/15 px-4 py-2">
            <Image src={coconut.img} alt={coconut.name} width={48} height={48} className="h-12 w-12 object-contain" />
            <span className="text-[15px] font-bold text-foreground">
              Кокос — твой!
            </span>
          </div>
        )}

        <p className="text-[15px] leading-relaxed text-muted">
          Прости за сбой! Из-за нашей ошибки у некоторых ненадолго пропадали вещи.
          Мы всё вернули, а тебе дарим <b className="text-foreground">кокос</b> — как
          извинение. Спасибо, что ты с Флопсом! 💚
        </p>

        <button
          onClick={dismissGift}
          className="mt-1 w-full rounded-full bg-brand-green px-7 py-3 text-[17px] font-bold text-white shadow-[var(--shadow-card)] active:scale-95"
        >
          Спасибо!
        </button>
      </div>
    </div>
  );
}
