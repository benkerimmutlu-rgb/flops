/** @type {Record<import('@/lib/room').RoomId, 'stand' | 'sit' | 'sleep'>} */
export const ROOM_POSES = { peach: 'stand', blue: 'sit', sage: 'sleep' };

/** @param {import('@/lib/room').RoomId} room @param {string | null} seat */
export function roomPose(room, seat) {
    if (seat === 'hw10') return 'sleep';
    if (seat) return 'sit';
    return ROOM_POSES[room];
}
