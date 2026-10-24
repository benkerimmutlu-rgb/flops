// Иконки в стиле дизайн-системы (сетка 24, штрих 2, скруглённые концы —
// то же визуальное семейство, что lucide-react; при желании заменяются 1:1).
import type { SVGProps } from "react";

function Svg({
  sm,
  children,
  ...rest
}: { sm?: boolean } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={"ico" + (sm ? " ico--sm" : "")}
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IcUser = (p: { sm?: boolean }) => (
  <Svg {...p}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Svg>
);
export const IcRight = (p: { sm?: boolean }) => (
  <Svg {...p}>
    <path d="m9 18 6-6-6-6" />
  </Svg>
);
export const IcLeft = (p: { sm?: boolean }) => (
  <Svg {...p}>
    <path d="m15 18-6-6 6-6" />
  </Svg>
);
export const IcArrow = (p: { sm?: boolean }) => (
  <Svg {...p}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </Svg>
);
export const IcCheck = (p: { sm?: boolean }) => (
  <Svg {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
);
export const IcLock = (p: { sm?: boolean }) => (
  <Svg {...p}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);
export const IcAlert = (p: { sm?: boolean }) => (
  <Svg {...p}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </Svg>
);
export const IcVoice = (p: { sm?: boolean }) => (
  <Svg {...p}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
  </Svg>
);
export const IcX = (p: { sm?: boolean }) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </Svg>
);
export const IcFlag = (p: { sm?: boolean }) => (
  <Svg {...p}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <path d="M4 22v-7" />
  </Svg>
);
export const IcReset = (p: { sm?: boolean }) => (
  <Svg {...p}>
    <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.4 2.6L3 8" />
    <path d="M3 3v5h5" />
  </Svg>
);
export const IcShield = (p: { sm?: boolean }) => (
  <Svg {...p}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);
export const IcPhone = (p: { sm?: boolean }) => (
  <Svg {...p}>
    <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
  </Svg>
);
export const IcChevUp = (p: { sm?: boolean }) => (
  <Svg {...p}>
    <path d="m18 15-6-6-6 6" />
  </Svg>
);
export const IcChevDown = (p: { sm?: boolean }) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);
export const IcLifeBuoy = (p: { sm?: boolean }) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="m4.93 4.93 4.24 4.24" />
    <path d="m14.83 9.17 4.24-4.24" />
    <path d="m14.83 14.83 4.24 4.24" />
    <path d="m9.17 14.83-4.24 4.24" />
    <circle cx="12" cy="12" r="4" />
  </Svg>
);
