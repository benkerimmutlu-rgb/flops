export const SHOP_RELEASE = {
  id: 'cozy-play-2026-10-20',
  items: ['gaming_mouse', 'gaming_keyboard', 'chips_day', 'window_ilica', 'strandmon', 'yoga_mat', 'hourglass'],
};
export function shouldShowRelease(seen: string | null, release = SHOP_RELEASE.id) { return seen !== release; }
