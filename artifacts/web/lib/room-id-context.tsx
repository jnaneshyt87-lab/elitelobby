"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface RoomIdEntry {
  room_id: string;
  password: string;
  released: boolean;
  released_at?: string;
  set_at: string;
}

interface RoomIdContextValue {
  roomIds: Record<string, RoomIdEntry>;
  setRoomId: (tournamentId: string, roomId: string, password: string) => void;
  releaseRoomId: (tournamentId: string) => void;
  revokeRoomId: (tournamentId: string) => void;
  getRoomId: (tournamentId: string) => RoomIdEntry | null;
}

const RoomIdContext = createContext<RoomIdContextValue | null>(null);

// Seed: BGMI Pro League (t2) starts in 30 mins — pre-set room ID as draft.
// Use a fixed ISO string so server and client render identically (no Date.now() mismatch).
const INITIAL_ROOM_IDS: Record<string, RoomIdEntry> = {
  t2: {
    room_id: "BGMI_ELITE_77",
    password: "proplay99",
    released: false,
    set_at: "2026-05-24T09:00:00.000Z",
  },
};

export function RoomIdProvider({ children }: { children: ReactNode }) {
  const [roomIds, setRoomIds] = useState<Record<string, RoomIdEntry>>(INITIAL_ROOM_IDS);

  const setRoomId = useCallback((tournamentId: string, room_id: string, password: string) => {
    setRoomIds((prev) => ({
      ...prev,
      [tournamentId]: {
        room_id,
        password,
        released: prev[tournamentId]?.released ?? false,
        released_at: prev[tournamentId]?.released_at,
        set_at: new Date().toISOString(),
      },
    }));
  }, []);

  const releaseRoomId = useCallback((tournamentId: string) => {
    setRoomIds((prev) => {
      if (!prev[tournamentId]) return prev;
      return {
        ...prev,
        [tournamentId]: {
          ...prev[tournamentId],
          released: true,
          released_at: new Date().toISOString(),
        },
      };
    });
  }, []);

  const revokeRoomId = useCallback((tournamentId: string) => {
    setRoomIds((prev) => {
      if (!prev[tournamentId]) return prev;
      return {
        ...prev,
        [tournamentId]: {
          ...prev[tournamentId],
          released: false,
          released_at: undefined,
        },
      };
    });
  }, []);

  const getRoomId = useCallback(
    (tournamentId: string): RoomIdEntry | null => roomIds[tournamentId] ?? null,
    [roomIds]
  );

  return (
    <RoomIdContext.Provider value={{ roomIds, setRoomId, releaseRoomId, revokeRoomId, getRoomId }}>
      {children}
    </RoomIdContext.Provider>
  );
}

export function useRoomIds() {
  const ctx = useContext(RoomIdContext);
  if (!ctx) throw new Error("useRoomIds must be used inside RoomIdProvider");
  return ctx;
}
