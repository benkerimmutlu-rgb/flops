export const SHOP_RELEASE = {
  id: 'premium-play-2026-10-21',
  items: ['window_new_york_night', 'lego_spiderman', 'lego_hogwarts', 'lego_peppa', 'premium_playground', 'premium_pool', 'premium_juice_bar', 'cuckoo_clock', 'jump_rope', 'shelf_lack', 'shelf_mosslanda', 'shelf_bergshult', 'window_sakhalin', 'window_tonho', 'window_mcdonalds', 'child_cat_painting', 'yellow_wardrobe', 'cat_friend', 'ph5_pendant', 'fortnite_wall_sign', 'toca_boca_wall_sign', 'vanilla_tealights', 'mandarin_painting', 'synthesizer', 'clay_tv', 'bunny_toy', 'gaming_mouse', 'gaming_keyboard', 'chips_day', 'window_ilica', 'strandmon', 'yoga_mat', 'hourglass'],
};
export function shouldShowRelease(seen: string | null, release = SHOP_RELEASE.id) { return seen !== release; }
