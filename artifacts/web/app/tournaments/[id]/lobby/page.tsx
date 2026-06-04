"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_TOURNAMENTS, MOCK_REGISTRATIONS } from "@/lib/mock-data";
import { formatCurrency, getGameIcon } from "@/lib/utils";
import { useRoomIds } from "@/lib/room-id-context";
import { useUser } from "@clerk/nextjs";
import {
  ArrowLeft, Trophy, Users, Clock, Shield, Map, Swords,
  CheckCircle2, AlertCircle, Copy, Key, Lock, Loader2, Send,
  Wifi, Eye, EyeOff, Zap, Crown, MessageSquare, Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SYSTEM_MSGS = [
  "Lobby created. Waiting for players...",
  "Room will be released 15 minutes before match start.",
  "Make sure to join the room before match begins.",
  "Good luck, warriors! May the best player win.",
];

const BOT_CHATS = [
  { user: "NightShade_X", msg: "gg everyone, ready to dominate 🔥", delay: 8000 },
  { user: "ShadowKing99", msg: "anyone carrying today?", delay: 15000 },
  { user: "CyberHawk_V2", msg: "ready when room drops", delay: 22000 },
  { user: "ProSniper_Z", msg: "let's gooo 💯", delay: 30000 },
  { user: "StormRaider_K", msg: "who's rushing hotdrop?", delay: 40000 },
  { user: "NightShade_X", msg: "me, obviously 😤", delay: 43000 },
  { user: "EliteForce77", msg: "no cheating this time please", delay: 52000 },
  { user: "ShadowKing99", msg: "room ID where??", delay: 65000 },
  { user: "CyberHawk_V2", msg: "admin releasing soon stay tuned", delay: 68000 },
];

type ChatMsg = { id: string; user: string; msg: string; system?: boolean; ts: Date };

function formatCountdown(ms: number) {
  if (ms <= 0) return { h: "00", m: "00", s: "00", total: 0 };
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return {
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
    total,
  };
}

export default function TournamentLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { getRoomId } = useRoomIds();

  const tournament = MOCK_TOURNAMENTS.find(t => t.id === params.id);
  const baseParticipants = MOCK_REGISTRATIONS.filter(r => r.tournament_id === params.id);

  // ── Player ready state ────────────────────────────────────────────────────
  const [players, setPlayers] = useState(() =>
    baseParticipants.map((p, i) => ({
      ...p,
      ready: i === 0, // first player pre-readied for demo
      online: true,
      ping: 45, // deterministic initial value to avoid hydration mismatch
    }))
  );

  // Randomize ping on mount (client-only) to avoid SSR hydration mismatch
  useEffect(() => {
    setPlayers(ps => ps.map(p => ({ ...p, ping: Math.floor(Math.random() * 60) + 20 })));
  }, []);
  const [myReady, setMyReady] = useState(false);

  // Simulate other players readying up over time
  useEffect(() => {
    const notReady = () => players.filter(p => !p.ready).map(p => p.id);
    if (notReady().length === 0) return;
    const t = setInterval(() => {
      const ids = notReady();
      if (ids.length === 0) { clearInterval(t); return; }
      const pick = ids[Math.floor(Math.random() * ids.length)];
      setPlayers(ps => ps.map(p => p.id === pick ? { ...p, ready: true } : p));
    }, 4500 + Math.random() * 3000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simulate ping fluctuation
  useEffect(() => {
    const t = setInterval(() => {
      setPlayers(ps => ps.map(p => ({ ...p, ping: Math.max(15, p.ping + Math.floor((Math.random() - 0.5) * 20)) })));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  // ── Countdown ─────────────────────────────────────────────────────────────
  const [countdown, setCountdown] = useState({ h: "00", m: "00", s: "00", total: 0 });
  useEffect(() => {
    if (!tournament) return;
    const tick = () => setCountdown(formatCountdown(new Date(tournament.match_time).getTime() - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [tournament]);

  // ── Room ID ───────────────────────────────────────────────────────────────
  const roomEntry = tournament ? getRoomId(tournament.id) : null;
  const roomReleased = roomEntry?.released ?? false;
  const [showRoom, setShowRoom] = useState(false);
  const [copiedField, setCopiedField] = useState<"id" | "pass" | null>(null);
  async function copyField(text: string, field: "id" | "pass") {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  // ── Chat ──────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMsg[]>(
    SYSTEM_MSGS.map((msg, i) => ({ id: `sys-${i}`, user: "SYSTEM", msg, system: true, ts: new Date(Date.now() - (4 - i) * 60000) }))
  );
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Inject bot messages over time
  useEffect(() => {
    const timers = BOT_CHATS.map(({ user: u, msg, delay }) =>
      setTimeout(() => {
        setMessages(prev => [...prev, { id: `bot-${Date.now()}`, user: u, msg, ts: new Date() }]);
      }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const displayName = user?.username || user?.firstName || "You";
    setMessages(prev => [...prev, { id: `me-${Date.now()}`, user: displayName, msg: chatInput.trim(), ts: new Date() }]);
    setChatInput("");
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  if (!tournament) {
    return (
      <div className="pt-24 pb-16 px-4 text-center">
        <h1 className="font-display font-bold text-2xl text-white mb-4">TOURNAMENT NOT FOUND</h1>
        <Link href="/tournaments" className="btn-secondary px-6 py-3 rounded-xl font-heading font-bold">← Tournaments</Link>
      </div>
    );
  }

  const totalReady = players.filter(p => p.ready).length + (myReady ? 1 : 0);
  const totalPlayers = players.length + 1; // +1 for "me"
  const readyPercent = Math.round((totalReady / totalPlayers) * 100);
  const isLive = tournament.status === "live";
  const matchStartingSoon = countdown.total > 0 && countdown.total < 900;

  const myName = user?.username || user?.firstName || "DemoPlayer";

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 overflow-x-hidden" style={{ background: "#050508" }}>
      {/* Animated bg grid */}
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(124,58,237,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.04) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="max-w-7xl mx-auto relative">

        {/* ── TOP BAR ── */}
        <div className="flex items-center justify-between mb-6">
          <Link href={`/tournaments/${tournament.id}`} className="flex items-center gap-2 text-slate-400 hover:text-white font-heading text-sm transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Details
          </Link>
          <div className="flex items-center gap-2">
            {isLive ? (
              <div className="live-badge border rounded-full px-3 py-1 text-xs font-heading font-bold flex items-center gap-1.5">
                <div className="live-dot" /> LIVE NOW
              </div>
            ) : matchStartingSoon ? (
              <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 rounded-full px-3 py-1 text-xs font-heading font-bold text-red-400 animate-pulse">
                <Zap className="w-3 h-3" /> STARTING SOON
              </div>
            ) : (
              <div className="status-upcoming border rounded-full px-3 py-1 text-xs font-heading font-bold">LOBBY OPEN</div>
            )}
            <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 text-xs font-heading text-green-400">
              <Wifi className="w-3 h-3" /> {players.filter(p => p.online).length + 1} online
            </div>
          </div>
        </div>

        {/* ── TOURNAMENT HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5 mb-6 border border-purple/20">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-700 to-cyan-700 flex items-center justify-center text-3xl flex-shrink-0">
              {getGameIcon(tournament.game)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-heading text-purple-400 bg-purple/10 border border-purple/20 rounded-full px-2 py-0.5">{tournament.game}</span>
                <span className="text-xs font-heading text-slate-400 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">{tournament.game_mode}</span>
                <span className="text-xs font-heading text-slate-400 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">🗺 {tournament.map_name}</span>
              </div>
              <h1 className="font-display font-black text-xl text-white truncate">{tournament.title}</h1>
            </div>
            <div className="flex items-center gap-6 md:gap-8 flex-shrink-0">
              <div className="text-center">
                <p className="text-xs text-slate-500 font-heading">Prize Pool</p>
                <p className="font-display font-black text-lg gradient-text-gold">{formatCurrency(tournament.prize_pool)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 font-heading">Entry</p>
                <p className="font-display font-black text-lg text-yellow-400">₹{tournament.entry_fee}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── COUNTDOWN ── */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}
          className={cn("glass-card rounded-2xl p-5 mb-6 text-center border", matchStartingSoon ? "border-red-500/30" : isLive ? "border-red-500/40" : "border-purple/20")}
        >
          {isLive ? (
            <div>
              <p className="text-xs font-heading tracking-widest text-red-400 mb-2 uppercase">Match in Progress</p>
              <p className="font-display font-black text-4xl text-red-400 animate-pulse">LIVE NOW</p>
            </div>
          ) : countdown.total <= 0 ? (
            <div>
              <p className="text-xs font-heading tracking-widest text-yellow-400 mb-2 uppercase">Starting...</p>
              <p className="font-display font-black text-4xl text-yellow-400">MATCH STARTING</p>
            </div>
          ) : (
            <div>
              <p className={cn("text-xs font-heading tracking-widest mb-3 uppercase", matchStartingSoon ? "text-red-400" : "text-slate-400")}>
                {matchStartingSoon ? "⚡ Match starting soon — get ready!" : "Match starts in"}
              </p>
              <div className="flex items-center justify-center gap-3">
                {[
                  { val: countdown.h, label: "HRS" },
                  { val: countdown.m, label: "MIN" },
                  { val: countdown.s, label: "SEC" },
                ].map(({ val, label }, i) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={cn("flex flex-col items-center",)}>
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center font-display font-black text-3xl border",
                        matchStartingSoon
                          ? "bg-red-500/10 border-red-500/30 text-red-300"
                          : "bg-purple/10 border-purple/30 text-purple-200"
                      )}>
                        {val}
                      </div>
                      <span className="text-xs text-slate-500 font-heading mt-1">{label}</span>
                    </div>
                    {i < 2 && <span className={cn("font-display font-black text-2xl -mt-4", matchStartingSoon ? "text-red-400" : "text-purple-400")}>:</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LEFT: Players + Room ID */}
          <div className="xl:col-span-2 space-y-5">

            {/* Ready progress bar */}
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span className="font-heading font-bold text-white text-sm">{totalReady}/{totalPlayers} Players Ready</span>
                </div>
                <span className={cn("text-xs font-heading font-bold", readyPercent === 100 ? "text-green-400" : "text-slate-400")}>
                  {readyPercent}%
                </span>
              </div>
              <div className="progress-bar h-2 rounded-full">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                  animate={{ width: `${readyPercent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              {readyPercent === 100 && (
                <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-green-400 font-heading mt-2 text-center font-semibold">
                  🎉 All players ready — waiting for room ID!
                </motion.p>
              )}
            </div>

            {/* Player grid */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-purple/10 flex items-center justify-between">
                <h3 className="font-heading font-bold text-white text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" /> Player Roster
                </h3>
                <span className="text-xs text-slate-500 font-heading">{tournament.filled_slots}/{tournament.max_slots} slots filled</span>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">

                {/* My card */}
                <motion.div
                  layout
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                    myReady
                      ? "border-green-500/50 bg-green-500/5"
                      : "border-purple-500/50 bg-purple/5"
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center font-display font-bold text-sm text-white">
                      {myName[0].toUpperCase()}
                    </div>
                    <Crown className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs font-heading font-bold text-white truncate">{myName}</p>
                      <span className="text-xs text-purple-400 font-heading">(You)</span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono truncate">{user ? "FF-" + user.id.slice(-6).toUpperCase() : "FF-DEMO"}</p>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-1">
                    <div className={cn("w-2 h-2 rounded-full", myReady ? "bg-green-400" : "bg-yellow-400 animate-pulse")} />
                    {myReady && <span className="text-xs text-green-400 font-heading font-bold">READY</span>}
                  </div>
                </motion.div>

                {/* Other players */}
                <AnimatePresence>
                  {players.map((p, i) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border transition-all",
                        p.ready
                          ? "border-green-500/20 bg-green-500/3"
                          : "border-white/5 bg-black/20"
                      )}
                    >
                      <div className="relative flex-shrink-0">
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-sm text-white",
                          p.ready ? "bg-gradient-to-br from-green-700 to-emerald-600" : "bg-gradient-to-br from-slate-700 to-slate-600"
                        )}>
                          {p.username[0]}
                        </div>
                        <div className={cn("absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-black", p.online ? "bg-green-400" : "bg-slate-600")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-heading font-bold text-white truncate">{p.username}</p>
                        <p className="text-xs text-slate-500 font-mono truncate">{p.game_uid}</p>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-end gap-1">
                        {p.ready ? (
                          <span className="text-xs text-green-400 font-heading font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> READY
                          </span>
                        ) : (
                          <span className="text-xs text-yellow-400/70 font-heading flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> WAITING
                          </span>
                        )}
                        <span className={cn("text-xs font-mono", p.ping < 40 ? "text-green-400" : p.ping < 80 ? "text-yellow-400" : "text-red-400")}>
                          {p.ping}ms
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Empty slots */}
                {Array.from({ length: Math.max(0, tournament.max_slots - tournament.filled_slots - 1) }).slice(0, 6).map((_, i) => (
                  <div key={`empty-${i}`} className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/5 bg-black/10">
                    <div className="w-9 h-9 rounded-xl border border-dashed border-white/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-slate-700 text-xs">+</span>
                    </div>
                    <span className="text-xs text-slate-700 font-heading">Open slot</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Room ID panel */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className={cn("glass-card rounded-2xl p-5 border", roomReleased ? "border-yellow-500/40" : "border-purple/20")}
            >
              <div className="flex items-center gap-2 mb-4">
                {roomReleased ? <Key className="w-5 h-5 text-yellow-400" /> : <Lock className="w-5 h-5 text-slate-400" />}
                <h3 className={cn("font-heading font-bold", roomReleased ? "text-yellow-400" : "text-slate-300")}>ROOM DETAILS</h3>
                {roomReleased && (
                  <span className="ml-auto text-xs text-green-400 font-heading font-bold flex items-center gap-1 bg-green-500/10 border border-green-500/25 rounded-full px-2 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> RELEASED
                  </span>
                )}
              </div>

              <AnimatePresence mode="wait">
                {!roomReleased ? (
                  <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-6">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="w-14 h-14 mx-auto mb-4 rounded-full border-2 border-dashed border-purple/40 flex items-center justify-center"
                    >
                      <Lock className="w-6 h-6 text-slate-500" />
                    </motion.div>
                    <p className="font-heading font-semibold text-slate-300 mb-1">
                      {roomEntry ? "Room Prepared — Not Yet Released" : "Room ID Pending"}
                    </p>
                    <p className="text-xs text-slate-500 font-heading leading-relaxed max-w-xs mx-auto">
                      Admin will release the Room ID &amp; Password 15 minutes before match starts. Stay in this lobby.
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-purple-400 font-heading">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Awaiting release...
                    </div>
                  </motion.div>
                ) : !showRoom ? (
                  <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                    <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-yellow-500/20 border-2 border-yellow-500/40 flex items-center justify-center">
                        <Key className="w-7 h-7 text-yellow-400" />
                      </div>
                    </motion.div>
                    <p className="font-heading font-bold text-yellow-400 mb-1">Room ID is Live! 🎉</p>
                    <p className="text-xs text-slate-400 font-heading mb-4">Tap to reveal your room credentials</p>
                    <button onClick={() => setShowRoom(true)} className="btn-gold px-8 py-3 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2 mx-auto">
                      <Eye className="w-4 h-4" /> Reveal Room Details
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="details" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    {[
                      { label: "Room ID", value: roomEntry!.room_id, field: "id" as const },
                      { label: "Password", value: roomEntry!.password, field: "pass" as const },
                    ].map(row => (
                      <div key={row.label} className="bg-black/40 rounded-xl p-3.5 border border-yellow-500/20">
                        <p className="text-xs text-slate-400 font-heading mb-1.5">{row.label}</p>
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-display font-bold text-2xl text-yellow-400 tracking-wider">{row.value}</p>
                          <button
                            onClick={() => copyField(row.value, row.field)}
                            className={cn("flex items-center gap-1.5 text-xs font-heading font-bold px-3 py-1.5 rounded-lg border transition-all flex-shrink-0",
                              copiedField === row.field ? "text-green-400 border-green-500/30 bg-green-500/10" : "text-slate-400 border-white/10 hover:border-purple/30 hover:text-purple-400"
                            )}
                          >
                            {copiedField === row.field ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-start gap-2 p-3 bg-yellow-500/5 border border-yellow-500/15 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-slate-400 font-heading leading-relaxed">
                        Join the room within <strong className="text-white">5 minutes</strong> of match start or forfeit your slot. Screenshot these for safety.
                      </p>
                    </div>
                    <button onClick={() => setShowRoom(false)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-400 font-heading transition-colors mx-auto">
                      <EyeOff className="w-3 h-3" /> Hide credentials
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* RIGHT: Ready button + Chat */}
          <div className="space-y-5">

            {/* Ready up CTA */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className={cn("glass-card rounded-2xl p-6 text-center border", myReady ? "border-green-500/30" : "border-purple/25")}
            >
              <motion.div
                animate={myReady ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.4 }}
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 transition-all duration-500",
                  myReady ? "bg-green-500/20 border-green-500/50" : "bg-purple/10 border-purple/30"
                )}
              >
                {myReady
                  ? <CheckCircle2 className="w-9 h-9 text-green-400" />
                  : <Swords className="w-9 h-9 text-purple-400" />
                }
              </motion.div>

              <p className={cn("font-display font-black text-xl mb-1", myReady ? "text-green-400" : "text-white")}>
                {myReady ? "YOU'RE READY!" : "MARK READY"}
              </p>
              <p className="text-xs text-slate-400 font-heading mb-5 leading-relaxed">
                {myReady
                  ? "Waiting for admin to release the room ID. Stay on this page."
                  : "Let the admin know you're in your seat and ready to play."}
              </p>

              <button
                onClick={() => setMyReady(r => !r)}
                className={cn(
                  "w-full py-3.5 rounded-xl font-heading font-bold text-sm transition-all",
                  myReady
                    ? "bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                    : "btn-primary relative"
                )}
              >
                {myReady
                  ? <span>✓ Ready (click to unready)</span>
                  : <span className="relative z-10 flex items-center justify-center gap-2"><Zap className="w-4 h-4" /> I'M READY TO PLAY</span>
                }
              </button>
            </motion.div>

            {/* Submit result CTA — shows when live or match time passed */}
            {(isLive || countdown.total <= 0) && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-5 border border-yellow-500/25"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <h3 className="font-heading font-bold text-yellow-400 text-sm">Match Ended?</h3>
                </div>
                <p className="text-xs text-slate-400 font-heading leading-relaxed mb-4">
                  Upload your end-game screenshot to claim your prize money. Admin will verify and credit your wallet within 24 hours.
                </p>
                <Link
                  href={`/tournaments/${tournament.id}/results`}
                  className="btn-gold w-full py-3 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" /> Submit Match Result
                </Link>
              </motion.div>
            )}

            {/* Match info summary */}
            <div className="glass-card rounded-2xl p-4 space-y-2">
              <p className="text-xs font-heading font-semibold text-slate-400 uppercase tracking-widest mb-3">Match Info</p>
              {[
                { icon: <Trophy className="w-3.5 h-3.5 text-yellow-400" />, label: "1st Prize", value: formatCurrency(Math.round(tournament.prize_pool * 0.5)) },
                { icon: <Users className="w-3.5 h-3.5 text-cyan-400" />, label: "Players", value: `${tournament.filled_slots} / ${tournament.max_slots}` },
                { icon: <Map className="w-3.5 h-3.5 text-purple-400" />, label: "Map", value: tournament.map_name },
                { icon: <Shield className="w-3.5 h-3.5 text-green-400" />, label: "Mode", value: tournament.game_mode },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between text-sm py-1 border-b border-white/5 last:border-0">
                  <span className="flex items-center gap-1.5 text-slate-400 font-heading">{row.icon}{row.label}</span>
                  <span className="font-heading font-bold text-white text-xs">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Chat */}
            <div className="glass-card rounded-2xl overflow-hidden flex flex-col" style={{ height: "360px" }}>
              <div className="px-4 py-3 border-b border-purple/10 flex items-center gap-2 flex-shrink-0">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <h3 className="font-heading font-bold text-white text-sm">Lobby Chat</h3>
                <span className="ml-auto text-xs text-slate-500 font-heading">{players.length + 1} in lobby</span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
                {messages.map(msg => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className={cn("flex flex-col gap-0.5", msg.system && "items-center")}
                  >
                    {msg.system ? (
                      <p className="text-xs text-slate-500 font-heading bg-white/3 rounded-lg px-2 py-1 text-center italic">{msg.msg}</p>
                    ) : (
                      <div>
                        <span className={cn("text-xs font-heading font-bold mr-1.5",
                          msg.user === myName ? "text-purple-400" : "text-cyan-400"
                        )}>{msg.user}</span>
                        <span className="text-xs text-slate-300 font-heading">{msg.msg}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={sendChat} className="flex items-center gap-2 p-3 border-t border-purple/10 flex-shrink-0">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  maxLength={120}
                  className="gaming-input flex-1 px-3 py-2 rounded-xl text-xs"
                />
                <button type="submit" disabled={!chatInput.trim()}
                  className="w-8 h-8 rounded-xl bg-purple-600/80 hover:bg-purple-600 disabled:opacity-30 flex items-center justify-center transition-all flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
