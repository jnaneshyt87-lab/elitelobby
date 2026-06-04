"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio } from "lucide-react";
import { useTicker, type TickerAnnouncement } from "@/lib/ticker-context";

interface TickerItem {
  type: string;
  text: string;
  label: string;
  isAdmin?: boolean;
}

const STATIC_ITEMS: TickerItem[] = [
  { type: "live",    text: "Team MBG is LIVE in CS 4v4 Team Battle — 8 PM slot",    label: "👁 847 watching" },
  { type: "win",     text: "Rex Gaming won CS 1v1 Solo Showdown — took ₹1,600!",    label: "🏆 Won ₹1,600" },
  { type: "live",    text: "777 Official vs Jarvis — CS 1v1 9 PM slot in progress", label: "👁 512 watching" },
  { type: "win",     text: "DFG claimed victory in CS 3v3 Trio Clash — 7 PM",       label: "🏆 Won ₹800" },
  { type: "live",    text: "NG Smooth & DGF Smoke — CS 2v2 Duo Duel LIVE now",      label: "👁 389 watching" },
  { type: "join",    text: "JS Kicks just registered for CS 4v4 Team Battle",        label: "✅ 2 min ago" },
  { type: "win",     text: "MBG Rakesh won CS 2v2 Duo Duel — ₹400 credited",        label: "🏆 Won ₹400" },
  { type: "live",    text: "DGF Smoke vs TGFF Warner — CS 1v1 final match!",         label: "👁 701 watching" },
  { type: "join",    text: "Team MBG registered for CS 4v4 10 PM slot",              label: "✅ just now" },
  { type: "win",     text: "777 Official won ₹1,600 in CS 4v4 today",               label: "🏆 ₹1,600 total" },
];

const TYPE_COLOR: Record<string, string> = {
  live:    "text-red-400",
  win:     "text-yellow-400",
  join:    "text-green-400",
  info:    "text-cyan-400",
  warning: "text-yellow-400",
  success: "text-green-400",
};

const TYPE_DOT: Record<string, string> = {
  live:    "bg-red-500",
  win:     "bg-yellow-500",
  join:    "bg-green-500",
  info:    "bg-cyan-500",
  warning: "bg-yellow-500",
  success: "bg-green-500",
};

const TYPE_EMOJI: Record<string, string> = {
  info:    "📢",
  warning: "⚠️",
  success: "✅",
};

function adminToItem(a: TickerAnnouncement) {
  return {
    type: a.type,
    text: a.text,
    label: `${TYPE_EMOJI[a.type] ?? "📢"} Admin`,
    isAdmin: true,
  };
}

export function LiveTicker() {
  const { announcements } = useTicker();
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allItems = [
    ...announcements.map(adminToItem),
    ...STATIC_ITEMS,
  ];

  // reset index if list shrinks
  useEffect(() => {
    if (idx >= allItems.length) setIdx(0);
  }, [allItems.length, idx]);

  function advance() {
    setVisible(false);
    timerRef.current = setTimeout(() => {
      setIdx((i) => (i + 1) % allItems.length);
      setVisible(true);
    }, 400);
  }

  useEffect(() => {
    const interval = setInterval(advance, 4500);
    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allItems.length]);

  const item = allItems[idx] ?? STATIC_ITEMS[0];

  return (
    <div className="w-full bg-[#0a0a12] border-b border-white/5 py-1.5 px-4 flex items-center gap-3 overflow-hidden relative z-50">
      {/* LIVE badge */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Radio className="w-3 h-3 text-red-400" />
        <span className="font-display font-bold text-[10px] text-red-400 tracking-widest uppercase">Live</span>
      </div>

      {/* divider */}
      <div className="h-3 w-px bg-white/10 shrink-0" />

      {/* Admin badge if applicable */}
      {"isAdmin" in item && item.isAdmin && (
        <span className="shrink-0 font-display text-[9px] font-bold tracking-widest text-purple-400 bg-purple-500/15 border border-purple-500/30 rounded px-1.5 py-0.5 uppercase">
          Admin
        </span>
      )}

      {/* scrolling message */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {visible && (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 animate-pulse ${TYPE_DOT[item.type] ?? "bg-purple-500"}`} />
              <span className="font-heading text-xs text-slate-300 truncate">{item.text}</span>
              <span className={`font-heading text-xs font-semibold shrink-0 ${TYPE_COLOR[item.type] ?? "text-purple-400"}`}>
                {item.label}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* dot pagination */}
      <div className="flex items-center gap-1 shrink-0">
        {allItems.slice(0, 12).map((_, i) => (
          <button
            key={i}
            onClick={() => { setIdx(i); setVisible(true); }}
            className={`rounded-full transition-all duration-300 ${
              i === idx ? "w-3 h-1.5 bg-purple-400" : "w-1 h-1 bg-white/15 hover:bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
