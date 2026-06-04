"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type TickerType = "info" | "warning" | "success" | "live";

export interface TickerAnnouncement {
  id: string;
  text: string;
  type: TickerType;
  sentAt: string;
}

interface TickerContextValue {
  announcements: TickerAnnouncement[];
  pushAnnouncement: (text: string, type: TickerType) => void;
  removeAnnouncement: (id: string) => void;
}

const TickerContext = createContext<TickerContextValue | null>(null);

const STORAGE_KEY = "elitelobby_ticker_announcements";

function load(): TickerAnnouncement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TickerAnnouncement[];
  } catch {
    return [];
  }
}

function save(items: TickerAnnouncement[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("ticker-update"));
  } catch {}
}

export function TickerProvider({ children }: { children: React.ReactNode }) {
  const [announcements, setAnnouncements] = useState<TickerAnnouncement[]>([]);

  useEffect(() => {
    setAnnouncements(load());
    const onUpdate = () => setAnnouncements(load());
    window.addEventListener("ticker-update", onUpdate);
    return () => window.removeEventListener("ticker-update", onUpdate);
  }, []);

  const pushAnnouncement = useCallback((text: string, type: TickerType) => {
    const item: TickerAnnouncement = {
      id: Date.now().toString(),
      text: text.trim(),
      type,
      sentAt: new Date().toISOString(),
    };
    setAnnouncements((prev) => {
      const next = [item, ...prev].slice(0, 20);
      save(next);
      return next;
    });
  }, []);

  const removeAnnouncement = useCallback((id: string) => {
    setAnnouncements((prev) => {
      const next = prev.filter((a) => a.id !== id);
      save(next);
      return next;
    });
  }, []);

  return (
    <TickerContext.Provider value={{ announcements, pushAnnouncement, removeAnnouncement }}>
      {children}
    </TickerContext.Provider>
  );
}

export function useTicker() {
  const ctx = useContext(TickerContext);
  if (!ctx) throw new Error("useTicker must be used inside TickerProvider");
  return ctx;
}
