"use client";

import { Logo } from "@/components/Logo";
import { IcArrow } from "@/components/icons";

export function Splash({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="screen screen--splash">
      <span className="appicon" aria-hidden="true">
        <span>A</span>
      </span>
      <span className="display">
        <Logo size={44} center />
      </span>
      <p className="body soft" style={{ maxWidth: "30ch" }}>
        Доказательная наука и психотерапевтическая практика — на изнанке одного
        экрана.
      </p>
      <div className="foot" style={{ width: "100%" }}>
        <button className="btn btn--glow btn--block label" onClick={onEnter}>
          Войти в изнанку <IcArrow sm />
        </button>
      </div>
    </div>
  );
}
