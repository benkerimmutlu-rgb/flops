/** @type {Record<import('@/lib/room').RoomId, 'stand' | 'sit' | 'sleep'>} */
export const ROOM_POSES = { peach: 'stand', blue: 'sit', sage: 'sleep' };

/** @param {string | null} seat */
export function isSleepSeat(seat) { return seat === 'hw10' || seat === 'sleep_bed'; }

/** @param {import('@/lib/room').RoomId} room @param {string | null} seat */
export function roomPose(room, seat) {
    if (isSleepSeat(seat)) return 'sleep';
    if (seat) return 'sit';
    return ROOM_POSES[room];
}
