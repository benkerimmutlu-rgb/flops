// FLOPS asset resolver (web / Next.js public/ folder).
// Assets live in public/assets, so URLs begin at /assets.
// Use only existing asset ids from asset-manifest.json — never guess names.
import manifest from "./asset-manifest.json";

type Asset = {
  id: string;
  png: string;
  webp?: string;
  label_ru?: string;
};

const ASSETS = manifest.assets as Asset[];

export type FlopsAssetId = (typeof manifest.assets)[number]["id"];

/** Returns the public URL for an asset id (prefers webp). Throws on unknown id. */
export function getFlopsAsset(id: FlopsAssetId, preferWebp = true): string {
  const asset = ASSETS.find((entry) => entry.id === id);
  if (!asset) throw new Error(`Unknown FLOPS asset id: ${id}`);
  return preferWebp && asset.webp ? asset.webp : asset.png;
}

/** Returns the Russian label for an asset id, or the id itself as a fallback. */
export function getFlopsAssetAlt(id: FlopsAssetId): string {
  return ASSETS.find((entry) => entry.id === id)?.label_ru ?? id;
}
