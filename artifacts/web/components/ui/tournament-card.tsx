"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Clock, Users, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatTimeLeft, getGameIcon } from "@/lib/utils";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface Tournament {
  id: string;
  title: string;
  game: string;
  game_mode: string;
  entry_fee: number;
  prize_pool: number;
  max_slots: number;
  filled_slots: number;
  match_time: string;
  map_name?: string | null;
  status: string;
  banner_url?: string | null;
}

interface TournamentCardProps {
  tournament: Tournament;
  index?: number;
}

const GAME_COLORS: Record<string, string> = {
  "Free Fire": "from-orange-900/40 to-red-900/30",
  "BGMI": "from-yellow-900/40 to-amber-900/30",
  "Valorant": "from-red-900/40 to-rose-900/30",
  "COD Mobile": "from-green-900/40 to-emerald-900/30",
  "PUBG Mobile": "from-blue-900/40 to-sky-900/30",
};

const GAME_GLOW: Record<string, string> = {
  "Free Fire": "rgba(249,115,22,0.35)",
  "BGMI": "rgba(251,191,36,0.35)",
  "Valorant": "rgba(239,68,68,0.35)",
  "COD Mobile": "rgba(34,197,94,0.35)",
  "PUBG Mobile": "rgba(59,130,246,0.35)",
};

export function TournamentCard({ tournament, index = 0 }: TournamentCardProps) {
  const [timeLeft, setTimeLeft] = useState(formatTimeLeft(tournament.match_time));
  const [isHovered, setIsHovered] = useState(false);
  const [spotX, setSpotX] = useState(0);
  const [spotY, setSpotY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Spring-based 3D tilt
  const rotX = useSpring(0, { stiffness: 300, damping: 28 });
  const rotY = useSpring(0, { stiffness: 300, damping: 28 });
  const scale = useSpring(1, { stiffness: 350, damping: 30 });

  useEffect(() => {
    if (tournament.status !== "live" && tournament.status !== "upcoming") return;
    const interval = setInterval(() => {
      setTimeLeft(formatTimeLeft(tournament.match_time));
    }, 1000);
    return () => clearInterval(interval);
  }, [tournament.match_time, tournament.status]);

  const slotsPercent = Math.round((tournament.filled_slots / tournament.max_slots) * 100);
  const slotsLeft = tournament.max_slots - tournament.filled_slots;
  const isFull = slotsLeft === 0;
  const isLive = tournament.status === "live";
  const isCompleted = tournament.status === "completed";

  const glowColor = GAME_GLOW[tournament.game] ?? "rgba(124,58,237,0.35)";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = e.clientX - rect.left - cx;
    const dy = e.clientY - rect.top - cy;

    rotX.set(-(dy / cy) * 7);
    rotY.set((dx / cx) * 7);

    setSpotX(e.clientX - rect.left);
    setSpotY(e.clientY - rect.top);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    scale.set(1.02);
  };

  const handleMouseLeave = () => {
    rotX.set(0);
    rotY.set(0);
    scale.set(1);
    setIsHovered(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      style={{ perspective: "900px", position: "relative" }}
    >
      {/* Outer glow — outside overflow:hidden so it's never clipped */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "-2px",
          borderRadius: "0.85rem",
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.22s ease",
          boxShadow: `0 0 35px ${glowColor}, 0 0 70px ${glowColor.replace("0.35", "0.12")}`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <motion.div
        ref={cardRef}
        style={{ rotateX: rotX, rotateY: rotY, scale, transformStyle: "preserve-3d", position: "relative", zIndex: 1 }}
        className="glass-card rounded-xl overflow-hidden group cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Inner cursor spotlight */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${glowColor.replace("0.35", "0.18")} 0%, transparent 70%)`,
            transform: `translate3d(${spotX - 110}px, ${spotY - 110}px, 0)`,
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.15s ease",
            pointerEvents: "none",
            zIndex: 2,
            top: 0,
            left: 0,
          }}
        />

        {/* Banner / Header */}
        <div
          className={cn(
            "relative h-28 bg-gradient-to-br overflow-hidden",
            GAME_COLORS[tournament.game] ?? "from-purple-900/40 to-indigo-900/30"
          )}
        >
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Status badge */}
          <div className="absolute top-3 left-3">
            {isLive ? (
              <div className="flex items-center gap-1.5 live-badge rounded-full px-2.5 py-1 text-xs font-semibold font-heading tracking-wide">
                <div className="live-dot" />
                LIVE
              </div>
            ) : isCompleted ? (
              <div className="flex items-center gap-1 status-completed rounded-full px-2.5 py-1 text-xs font-semibold font-heading border tracking-wide">
                ENDED
              </div>
            ) : (
              <div className="flex items-center gap-1 status-upcoming rounded-full px-2.5 py-1 text-xs font-semibold font-heading border tracking-wide">
                UPCOMING
              </div>
            )}
          </div>

          {/* Mode badge */}
          <div className="absolute top-3 right-3 bg-black/40 border border-white/10 rounded-full px-2.5 py-1 text-xs font-heading font-semibold text-slate-300">
            {tournament.game_mode}
          </div>

          {/* Game + Icon */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="text-3xl">{getGameIcon(tournament.game)}</span>
            <div>
              <p className="font-heading font-bold text-white text-sm leading-tight">
                {tournament.game}
              </p>
              {tournament.map_name && (
                <p className="text-xs text-slate-300 opacity-70">{tournament.map_name}</p>
              )}
            </div>
          </div>

          {/* Prize pool */}
          <div className="absolute bottom-3 right-3 text-right">
            <p className="text-xs text-slate-400 font-heading">PRIZE POOL</p>
            <p className="font-display font-bold text-sm gradient-text-gold">
              {formatCurrency(tournament.prize_pool)}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          <h3 className="font-heading font-bold text-base text-white leading-tight line-clamp-2"
            style={{ transition: "color 0.2s ease", color: isHovered ? "rgb(196,181,253)" : "white" }}>
            {tournament.title}
          </h3>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-black/30 rounded-lg p-2 text-center border border-white/5">
              <Trophy className="w-3.5 h-3.5 text-yellow-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Entry</p>
              <p className="font-display text-xs font-bold text-yellow-400">₹{tournament.entry_fee}</p>
            </div>
            <div className="bg-black/30 rounded-lg p-2 text-center border border-white/5">
              <Users className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Slots</p>
              <p className={cn("font-display text-xs font-bold", isFull ? "text-red-400" : "text-cyan-400")}>
                {isFull ? "FULL" : `${slotsLeft} left`}
              </p>
            </div>
            <div className="bg-black/30 rounded-lg p-2 text-center border border-white/5">
              <Clock className="w-3.5 h-3.5 text-purple-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Time</p>
              <p className={cn("font-display text-xs font-bold", isLive ? "text-red-400" : "text-purple-400")}>
                {isLive ? "NOW" : timeLeft}
              </p>
            </div>
          </div>

          {/* Slot progress */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-400 font-heading">
                {tournament.filled_slots}/{tournament.max_slots} players
              </span>
              <span
                className="text-xs font-heading font-semibold"
                style={{
                  color:
                    slotsPercent >= 90 ? "#f87171" : slotsPercent >= 60 ? "#fb923c" : "#67e8f9",
                }}
              >
                {slotsPercent}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${slotsPercent}%`,
                  background:
                    slotsPercent >= 90
                      ? "linear-gradient(90deg, #dc2626, #ef4444)"
                      : slotsPercent >= 60
                      ? "linear-gradient(90deg, #ea580c, #f97316)"
                      : "linear-gradient(90deg, #7c3aed, #06b6d4)",
                }}
              />
            </div>
          </div>

          {/* Action button — spring bounce on press */}
          {isCompleted || (isFull && !isLive) ? (
            <Link
              href={`/tournaments/${tournament.id}`}
              className="block w-full py-2.5 rounded-lg text-center text-sm font-heading font-bold tracking-wide bg-white/5 text-slate-400 border border-white/10"
            >
              {isCompleted ? "View Results" : "View Match"}
            </Link>
          ) : (
            <motion.div
              whileTap={{ scale: 0.91 }}
              transition={{ type: "spring", stiffness: 600, damping: 20 }}
            >
              <Link
                href={`/tournaments/${tournament.id}`}
                className="block w-full py-2.5 rounded-lg text-center text-sm font-heading font-bold tracking-wide btn-primary relative"
              >
                <span className="relative z-10">
                  {isLive ? "⚡ Join Now — LIVE" : "Register Now"}
                </span>
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
