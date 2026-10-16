// Simple, geometrically accurate flag illustrations for the MVP country set.
// All straight lines/rects — no hand-tuned curves, so proportions stay reliable
// at any size. Swap for licensed/illustrated artwork later; the viewBox
// contract (see FLAG_VIEWBOX) is what quiz crop zones are positioned against.

export const FLAG_VIEWBOX: Record<string, { w: number; h: number }> = {
  it: { w: 300, h: 200 },
  gb: { w: 300, h: 150 },
  se: { w: 320, h: 200 },
  es: { w: 300, h: 200 },
};

function ItalyFlag() {
  return (
    <svg viewBox="0 0 300 200" className="h-full w-full" aria-hidden="true">
      <rect x="0" y="0" width="100" height="200" fill="#009246" />
      <rect x="100" y="0" width="100" height="200" fill="#FFFFFF" />
      <rect x="200" y="0" width="100" height="200" fill="#CE2B37" />
    </svg>
  );
}

function UKFlag() {
  return (
    <svg viewBox="0 0 300 150" className="h-full w-full" aria-hidden="true">
      <rect x="0" y="0" width="300" height="150" fill="#012169" />
      {/* white diagonals */}
      <polygon points="0,0 34,0 300,132 300,150 266,150 0,18" fill="#FFFFFF" />
      <polygon points="300,0 300,18 34,150 0,150 0,132 266,0" fill="#FFFFFF" />
      {/* red diagonals, narrower */}
      <polygon points="0,0 14,0 300,142 300,150 286,150 0,8" fill="#C8102E" />
      <polygon points="300,0 300,8 14,150 0,150 0,142 286,0" fill="#C8102E" />
      {/* white cross */}
      <rect x="120" y="0" width="60" height="150" fill="#FFFFFF" />
      <rect x="0" y="55" width="300" height="40" fill="#FFFFFF" />
      {/* red cross */}
      <rect x="132" y="0" width="36" height="150" fill="#C8102E" />
      <rect x="0" y="65" width="300" height="20" fill="#C8102E" />
    </svg>
  );
}

function SwedenFlag() {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" aria-hidden="true">
      <rect x="0" y="0" width="320" height="200" fill="#006AA7" />
      <rect x="100" y="0" width="40" height="200" fill="#FECC00" />
      <rect x="0" y="80" width="320" height="40" fill="#FECC00" />
    </svg>
  );
}

function SpainFlag() {
  return (
    <svg viewBox="0 0 300 200" className="h-full w-full" aria-hidden="true">
      <rect x="0" y="0" width="300" height="50" fill="#AA151B" />
      <rect x="0" y="50" width="300" height="100" fill="#F1BF00" />
      <rect x="0" y="150" width="300" height="50" fill="#AA151B" />
    </svg>
  );
}

const FLAG_COMPONENTS: Record<string, () => React.ReactElement> = {
  it: ItalyFlag,
  gb: UKFlag,
  se: SwedenFlag,
  es: SpainFlag,
};

export function FlagSvg({ code }: { code: string }) {
  const Flag = FLAG_COMPONENTS[code];
  if (!Flag) return null;
  return <Flag />;
}
