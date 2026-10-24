"use client";

import { useRouter } from "next/navigation";
import { SAFETY } from "@/content/safety";
import {
  IcAlert,
  IcFlag,
  IcLeft,
  IcLifeBuoy,
  IcPhone,
  IcShield,
  IcVoice,
} from "@/components/icons";
import type { SafetySection } from "@/content/safety";

function sectionClass(kind: SafetySection["kind"]) {
  switch (kind) {
    case "voice":
      return "callout callout--voice";
    case "flag":
      return "callout callout--flag";
    case "note":
      return "callout callout--note";
    default:
      return "callout";
  }
}

function SectionIcon({ kind }: { kind: SafetySection["kind"] }) {
  if (kind === "voice") return <IcVoice sm />;
  if (kind === "flag") return <IcFlag sm />;
  return <IcShield sm />;
}

export function SafetyView() {
  const router = useRouter();
  const m = SAFETY;

  return (
    <div className="screen screen--anim">
      <div className="appbar">
        <button className="iconbtn" aria-label="Назад" onClick={() => router.push("/")}>
          <IcLeft />
        </button>
        <span className="appbar__title overline">{m.title}</span>
        <span className="appbar__end" />
      </div>

      <div className="col" style={{ gap: "var(--space-3)" }}>
        <span className="section__over overline">Безопасность</span>
        <h1 className="title-lg">{m.title}</h1>
        <p className="card__text body">{m.intro}</p>
      </div>

      {/* Дисклеймер — всегда на виду */}
      <section className="callout callout--flag">
        <h3 className="callout__head overline">
          <IcAlert sm />
          Важно
        </h3>
        <p className="callout__text body">{m.disclaimer}</p>
      </section>

      {/* Экстренный номер */}
      <section className="emergency">
        <span className="emergency__icon" aria-hidden="true">
          <IcPhone />
        </span>
        <p className="emergency__text label">{m.emergencyNote}</p>
      </section>

      {/* Разделы */}
      {m.sections.map((s, i) => (
        <section className={sectionClass(s.kind)} key={i}>
          <span className="card__over overline">{s.over}</span>
          <h3 className="callout__head title-sm" style={{ textTransform: "none" }}>
            <SectionIcon kind={s.kind} />
            {s.title}
          </h3>
          {s.body && <p className="callout__text body">{s.body}</p>}
          {s.steps && (
            <ol className="steps">
              {s.steps.map((step, k) => (
                <li className="steps__item body" key={k}>
                  <span className="steps__num" aria-hidden="true">
                    {k + 1}
                  </span>
                  <span className="min0">{step}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      ))}

      {/* Кризисные контакты */}
      <div className="section">
        <span className="section__over overline">Кризисные контакты</span>
        {m.crisisContacts.map((c, i) => (
          <section className="callout callout--note" key={i}>
            <h3 className="callout__head overline">
              <IcLifeBuoy sm />
              {c.name}
            </h3>
            <p className="callout__text body">{c.detail}</p>
          </section>
        ))}
      </div>

      <div className="foot">
        <button
          className="btn btn--secondary btn--block label"
          onClick={() => router.push("/")}
        >
          Вернуться к курсам
        </button>
      </div>
    </div>
  );
}
