"use client";

import Link from "next/link";
import Image from "next/image";
import { getFlopsAsset, FlopsAssetId } from "@/brand/flops-assets";
import { useUserState } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { speak } from "@/lib/speech";
import { rankForEarned } from "@/lib/shop";
import { FlopsDressed } from "@/components/FlopsDressed";
import { FlagImage, FLAG_VIEWBOX } from "@/lib/flags";
import { liteByCode } from "@/lib/data";

type MenuCard = {
  href: string;
  title: string;
  description: string;
  asset: FlopsAssetId;
  tint: string;
  badge?: number;
};

export default function Home() {
  const { all, bones, bonesEarned, equipped } = useUserState();

  const knownCount = Object.values(all).filter((s) => s.known).length;
  const visitedCount = Object.values(all).filter((s) => s.visited).length;
  const rp = rankForEarned(bonesEarned);
  const hasOutfit = equipped.length > 0;

  // «Повтори» и «Учу» больше не отдельные карточки — они живут блоками внутри
  // «Флагов». Порядок совпадает с меню.
  const cards: MenuCard[] = [
    {
      href: "/flags",
      title: "Учи флаги",
      description: "Слушай и угадывай страну по флагу. Внутри — «Повтори» и «Учу».",
      asset: "globe",
      tint: "bg-brand-green/10",
    },
    {
      href: "/capitals",
      title: "Учи столицы",
      description: "Флаг и страна есть — а столицу надо вспомнить.",
      asset: "signpost",
      tint: "bg-brand-blue/10",
    },
    {
      href: "/languages",
      title: "Языки мира",
      description: "Прочитай фразу и угадай страну — услышишь перевод.",
      asset: "ops_hello",
      tint: "bg-brand-green/10",
    },
    {
      href: "/memory",
      title: "Меморина",
      description: "Игра на память против мопса Флопса.",
      asset: "ops_play",
      tint: "bg-clay-beige/20",
    },
    {
      href: "/world",
      title: "Мой мир",
      description: "Карта мира, страны мечты и факты: флаги, еда, люди, фразы.",
      asset: "world_people",
      tint: "bg-brand-blue/10",
      badge: knownCount,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Приветствие + аккаунт */}
      <Greeting />

      {/* Центральный персонаж — в своём образе, если что-то надето */}
      <div className="flex justify-center">
        {hasOutfit ? (
          <FlopsDressed size={208} />
        ) : (
          <Image
            src={getFlopsAsset("ops_explorer")}
            alt="Мопс Флопс — путешественник с рюкзаком"
            width={240}
            height={240}
            priority
            className="h-44 w-44 object-contain drop-shadow-[0_12px_24px_rgba(31,36,48,0.12)] flops-bob sm:h-52 sm:w-52"
          />
        )}
      </div>

      {/* Косточки, ранг и магазин */}
      <section className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image src={getFlopsAsset("bone_currency")} alt="Косточки" width={44} height={44} className="h-11 w-11 object-contain" />
            <div>
              <p className="text-2xl font-bold leading-tight text-foreground">
                {bones} <span className="text-base font-bold text-muted">косточек</span>
              </p>
              <p className="text-sm font-semibold text-brand-green">
                {rp.rank.emoji} {rp.rank.name}
              </p>
            </div>
          </div>
          <Link
            href="/shop"
            className="rounded-full bg-brand-green px-5 py-2.5 text-[15px] font-bold text-white shadow-[var(--shadow-card)] active:scale-95"
          >
            🛍️ Магазин
          </Link>
        </div>

        {/* Прогресс до следующего ранга */}
        {rp.next ? (
          <div className="flex flex-col gap-1.5">
            <div className="h-3 w-full overflow-hidden rounded-full bg-black/5">
              <div
                className="h-full rounded-full bg-brand-green transition-[width]"
                style={{ width: `${Math.round(rp.progress * 100)}%` }}
              />
            </div>
            <p className="text-xs font-semibold text-muted">
              До ранга «{rp.next.name}» ещё {rp.toNext} 🦴
            </p>
          </div>
        ) : (
          <p className="text-xs font-semibold text-muted">
            Максимальный ранг — ты настоящий чемпион мира! 🏆
          </p>
        )}

        {/* Быстрые итоги */}
        <div className="flex flex-wrap gap-2">
          <StatChip label="знаю флагов" value={knownCount} />
          <StatChip label="был в странах" value={visitedCount} />
          <StatChip label="всего заработано" value={bonesEarned} bone />
        </div>
      </section>

      {/* Карточки меню */}
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group relative flex items-center gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-5 pr-16 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
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
            {/* Озвучка названия раздела — как с названиями стран, для нечитающих */}
            <button
              type="button"
              aria-label={`Послушать: ${card.title}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                speak(card.title, "ru-RU");
              }}
              className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20"
            >
              <Image src={getFlopsAsset("sound_speaker")} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Greeting() {
  const { status, configured, profile, signOut } = useAuth();
  const myCountry = profile ? liteByCode(profile.countryCode) : undefined;
  const ratio = profile
    ? FLAG_VIEWBOX[profile.countryCode] ?? { w: 3, h: 2 }
    : { w: 3, h: 2 };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-bold leading-tight text-foreground">
            {profile ? `Привет, ${profile.name}!` : "Привет! Готовы путешествовать?"}
          </h1>
          <p className="max-w-prose text-muted">
            Учим флаги, столицы и культуру мира вместе с мопсом Флопсом. Для детей
            и взрослых — без оценок «правильно / неправильно».
          </p>
        </div>

        {/* Аккаунт */}
        {status === "ready" ? (
          <button
            onClick={signOut}
            className="shrink-0 rounded-full border border-border bg-surface px-3 py-2 text-xs font-bold text-muted hover:bg-black/[0.03]"
          >
            Выйти
          </button>
        ) : status === "no_profile" ? (
          <Link href="/onboarding" className="shrink-0 rounded-full bg-brand-green px-4 py-2 text-xs font-bold text-white">
            Завершить вход
          </Link>
        ) : configured ? (
          <Link href="/login" className="shrink-0 rounded-full bg-brand-green px-4 py-2 text-xs font-bold text-white">
            Войти
          </Link>
        ) : null}
      </div>

      {/* Флаг страны ребёнка */}
      {myCountry && (
        <div className="flex items-center gap-2 self-start rounded-full border border-border bg-surface px-3 py-1.5 shadow-[var(--shadow-card)]">
          <div className="h-5 w-8 shrink-0 overflow-hidden rounded ring-1 ring-border" style={{ aspectRatio: `${ratio.w} / ${ratio.h}` }}>
            <FlagImage code={profile!.countryCode} fit="cover" />
          </div>
          <span className="text-sm font-bold text-foreground">Твоя страна: {myCountry.name}</span>
        </div>
      )}
    </div>
  );
}

function StatChip({
  label,
  value,
  bone = false,
}: {
  label: string;
  value: number;
  bone?: boolean;
}) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm">
      {bone && (
        <Image src={getFlopsAsset("bone_currency")} alt="" width={16} height={16} className="h-4 w-4 object-contain" />
      )}
      <b className="text-foreground">{value}</b>
      <span className="text-muted">{label}</span>
    </span>
  );
}
