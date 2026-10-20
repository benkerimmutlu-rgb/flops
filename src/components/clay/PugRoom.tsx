"use client";
import { useEffect, useRef } from "react";
import { useUserState } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { mountRoom } from "./room-engine";
import catalog from "./room-catalog.json";
import { ROOM_MARKUP } from "./room-markup";

const rooms = { peach: "/assets/clay/room-peach.webp", blue: "/assets/clay/room-blue.webp", sage: "/assets/clay/room-sage.webp" };
export function PugRoom() {
  const { owned, roomData, setRoomData, roomHydrated } = useUserState();
  const { user } = useAuth();
  const container = useRef<HTMLDivElement>(null);
  const engine = useRef<ReturnType<typeof mountRoom> | null>(null);
  const latest = useRef({ owned, roomData, setRoomData });
  useEffect(() => { latest.current = { owned, roomData, setRoomData }; }, [owned, roomData, setRoomData]);
  useEffect(() => {
    if (!roomHydrated || !container.current) return;
    const node = container.current.querySelector<HTMLElement>("#flops-room");
    if (!node) return;
    engine.current = mountRoom(node, { catalog, rooms, owned: latest.current.owned, saved: latest.current.roomData, onChange: snapshot => latest.current.setRoomData(snapshot) });
    return () => { engine.current?.destroy(); engine.current = null; };
  }, [roomHydrated, user?.id]);
  useEffect(() => { engine.current?.updateOwned(owned); }, [owned]);
  useEffect(() => { engine.current?.updateSaved(roomData); }, [roomData]);
  if (!roomHydrated) return <p role="status">Загружаем домик…</p>;
  return <div ref={container} dangerouslySetInnerHTML={{ __html: ROOM_MARKUP }} />;
}
