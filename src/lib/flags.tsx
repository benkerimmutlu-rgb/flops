// Simple, geometrically accurate flag illustrations for the MVP country set.
// All straight lines/rects — no hand-tuned curves, so proportions stay reliable
// at any size. Swap for licensed/illustrated artwork later; the viewBox
// contract (see FLAG_VIEWBOX) is what quiz crop zones are positioned against.

export const FLAG_VIEWBOX: Record<string, { w: number; h: number }> = {
  it: { w: 300, h: 200 },
  gb: { w: 300, h: 150 },
  se: { w: 320, h: 200 },
  es: { w: 300, h: 200 },
  fr: { w: 300, h: 200 },
  de: { w: 300, h: 200 },
  tr: { w: 300, h: 200 },
  jp: { w: 300, h: 200 },
  ng: { w: 300, h: 200 },
  ca: { w: 9600, h: 4800 },
  br: { w: 300, h: 200 },
  fi: { w: 320, h: 200 },
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

function FranceFlag() {
  return (
    <svg viewBox="0 0 300 200" className="h-full w-full" aria-hidden="true">
      <rect x="0" y="0" width="100" height="200" fill="#0055A4" />
      <rect x="100" y="0" width="100" height="200" fill="#FFFFFF" />
      <rect x="200" y="0" width="100" height="200" fill="#EF4135" />
    </svg>
  );
}

function GermanyFlag() {
  return (
    <svg viewBox="0 0 300 200" className="h-full w-full" aria-hidden="true">
      <rect x="0" y="0" width="300" height="67" fill="#000000" />
      <rect x="0" y="67" width="300" height="66" fill="#DD0000" />
      <rect x="0" y="133" width="300" height="67" fill="#FFCE00" />
    </svg>
  );
}

// Crescent = a white circle with a same-colour-as-background circle laid on
// top, offset just enough to "bite" a bite out of it — the standard safe way
// to draw a crescent from two circles instead of a hand-tuned curve. The
// star path below is the well-tested 24x24 "star" glyph used across many
// icon sets, just translated and scaled, not hand-derived.
function TurkeyFlag() {
  return (
    <svg viewBox="0 0 300 200" className="h-full w-full" aria-hidden="true">
      <rect x="0" y="0" width="300" height="200" fill="#E30A17" />
      <circle cx="110" cy="100" r="42" fill="#FFFFFF" />
      <circle cx="124" cy="100" r="34" fill="#E30A17" />
      <g transform="translate(150,78) scale(1.15)">
        <path
          d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 19.771l-7.416 3.642 1.48-8.279-6.064-5.828 8.332-1.151z"
          fill="#FFFFFF"
        />
      </g>
    </svg>
  );
}

function JapanFlag() {
  return (
    <svg viewBox="0 0 300 200" className="h-full w-full" aria-hidden="true">
      <rect x="0" y="0" width="300" height="200" fill="#FFFFFF" />
      <circle cx="150" cy="100" r="45" fill="#BC002D" />
    </svg>
  );
}

function NigeriaFlag() {
  return (
    <svg viewBox="0 0 300 200" className="h-full w-full" aria-hidden="true">
      <rect x="0" y="0" width="100" height="200" fill="#008751" />
      <rect x="100" y="0" width="100" height="200" fill="#FFFFFF" />
      <rect x="200" y="0" width="100" height="200" fill="#008751" />
    </svg>
  );
}

// Two attempts at hand-derived maple-leaf point coordinates both produced
// the wrong silhouette (a fir tree, then a symmetric star) — freehand
// leaf geometry is exactly the kind of eyeballed curve that goes wrong
// invisibly until rendered. So this uses the real path data from a
// verified, widely-used open-source flag SVG (hampusborgos/country-flags,
// MIT) instead of another freehand guess, kept at its original coordinate
// scale (viewBox 0 0 9600 4800) to avoid introducing new scaling errors.
function CanadaFlag() {
  return (
    <svg viewBox="0 0 9600 4800" className="h-full w-full" aria-hidden="true">
      <path fill="#D52B1E" d="M0 0h2400l99 99h4602l99-99h2400v4800H7200l-99-99H2499l-99 99H0z" />
      <path
        fill="#FFFFFF"
        d="M2400 0h4800v4800H2400zm2490 4430l-45-863a95 95 0 01111-98l859 151-116-320a65 65 0 0120-73l941-762-212-99a65 65 0 01-34-79l186-572-542 115a65 65 0 01-73-38l-105-247-423 454a65 65 0 01-111-57l204-1052-327 189a65 65 0 01-91-27l-332-652-332 652a65 65 0 01-91 27l-327-189 204 1052a65 65 0 01-111 57l-423-454-105 247a65 65 0 01-73 38l-542-115 186 572a65 65 0 01-34 79l-212 99 941 762a65 65 0 0120 73l-116 320 859-151a95 95 0 01111 98l-45 863z"
      />
    </svg>
  );
}

function BrazilFlag() {
  return (
    <svg viewBox="0 0 300 200" className="h-full w-full" aria-hidden="true">
      <defs>
        <clipPath id="br-circle">
          <circle cx="150" cy="100" r="42" />
        </clipPath>
      </defs>
      <rect x="0" y="0" width="300" height="200" fill="#009739" />
      <polygon points="150,22 272,100 150,178 28,100" fill="#FEDD00" />
      <circle cx="150" cy="100" r="42" fill="#002776" />
      <g clipPath="url(#br-circle)">
        <rect x="100" y="92" width="100" height="16" fill="#FFFFFF" transform="rotate(-18 150 100)" />
      </g>
    </svg>
  );
}

function FinlandFlag() {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" aria-hidden="true">
      <rect x="0" y="0" width="320" height="200" fill="#FFFFFF" />
      <rect x="100" y="0" width="40" height="200" fill="#002F6C" />
      <rect x="0" y="80" width="320" height="40" fill="#002F6C" />
    </svg>
  );
}

const FLAG_COMPONENTS: Record<string, () => React.ReactElement> = {
  it: ItalyFlag,
  gb: UKFlag,
  se: SwedenFlag,
  es: SpainFlag,
  fr: FranceFlag,
  de: GermanyFlag,
  tr: TurkeyFlag,
  jp: JapanFlag,
  ng: NigeriaFlag,
  ca: CanadaFlag,
  br: BrazilFlag,
  fi: FinlandFlag,
};

export function FlagSvg({ code }: { code: string }) {
  const Flag = FLAG_COMPONENTS[code];
  if (!Flag) return null;
  return <Flag />;
}
