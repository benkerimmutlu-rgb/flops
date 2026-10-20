export const SHOP_RELEASE = {
  id: 'cozy-music-2026-10-21',
  items: ['vanilla_tealights', 'mandarin_painting', 'synthesizer', 'clay_tv', 'bunny_toy', 'gaming_mouse', 'gaming_keyboard', 'chips_day', 'window_ilica', 'strandmon', 'yoga_mat', 'hourglass'],
};
export function shouldShowRelease(seen: string | null, release = SHOP_RELEASE.id) { return seen !== release; }
