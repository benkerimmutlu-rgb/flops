import type { Config } from "tailwindcss";

// IZNANKA — токены дизайн-системы проброшены в Tailwind как theme-переменные.
// Отличительные компоненты описаны классами в globals.css (@layer components),
// Tailwind используется для раскладки/утилит. Значения — те же CSS-переменные.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-000": "var(--bg-000)",
        "bg-100": "var(--bg-100)",
        "bg-200": "var(--bg-200)",
        "bg-300": "var(--bg-300)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        "ink-mute": "var(--ink-mute)",
        neon: "var(--neon)",
        "on-neon": "var(--on-neon)",
        danger: "var(--danger)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
    },
  },
  plugins: [],
};

export default config;
