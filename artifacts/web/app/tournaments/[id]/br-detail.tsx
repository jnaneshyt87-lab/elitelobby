"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CS_TIME_SLOTS, BR_MODES, BR_GENERAL_RULES, BR_SPECIFIC_RULES, MOCK_LEADERBOARD,
} from "@/lib/mock-data";
import { formatCurrency, formatTimeLeft } from "@/lib/utils";
import { useRoomIds } from "@/lib/room-id-context";
import { useWallet } from "@/lib/wallet-context";
import {
  ArrowLeft, Trophy, Users, Clock, Map, Swords,
  Eye, EyeOff, CheckCircle2, AlertCircle, Copy, Key, Lock,
  Loader2, Zap, TrendingUp, UserPlus, Crown, X, Search,
  Shield, Share2, Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

type BRMode = typeof BR_MODES[number]["key"];
type SquadMember = { username: string; status: "leader" | "invited" | "confirmed" };

const BR_FEE_PRESETS = [100, 250, 500, 1000];

// fake participants so the tab looks populated
const FAKE_PARTICIPANTS = [
  "NightShade_X", "ShadowKing99", "CyberHawk_V2", "ProSniper_Z", "StormRaider_K",
  "EliteForce77", "DarkWolf_FF", "FireHawk88", "GhostRider_K", "LoneWolf99",
  "BladeRunner_X", "CryptoKiller", "NovaStar_V2", "ViperStrike_7", "PhantomAce",
  "SteelFang_Z", "IronBreaker", "CyberNova", "RapidFire_J", "StealthBomb",
].map((u, i) => ({ id: `br-${i}`, username: u, game_uid: `FF-${80000 + i * 731}` }));

type BRTournament = {
  id: string; title: string; game: string; game_mode: string;
  entry_fee: number; prize_pool: number; max_slots: number; filled_slots: number;
  match_time: string; map_name?: string | null; status: string; rules: string;
};

export function BRTournamentDetail({ tournament }: { tournament: BRTournament }) {
  const router = useRouter();
  const { getRoomId } = useRoomIds();
  const { balance, deductFee, canAfford } = useWallet();

  // ── State ──────────────────────────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState(formatTimeLeft(tournament.match_time));
  const [activeTab, setActiveTab] = useState<"general" | "br-rules" | "points" | "participants">("general");
  const [selectedMode, setSelectedMode] = useState<BRMode>("Solo");
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [entryFee, setEntryFee] = useState(100);
  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [showRoom, setShowRoom] = useState(false);
  const [copiedField, setCopiedField] = useState<"id" | "pass" | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  // Squad state
  const [squadName, setSquadName] = useState("");
  const [squadCode] = useState(() => Math.random().toString(36).slice(2, 8).toUpperCase());
  const [squadMembers, setSquadMembers] = useState<SquadMember[]>([
    { username: "DemoPlayer", status: "leader" },
  ]);
  const [memberSearch, setMemberSearch] = useState("");
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // ── Derived ────────────────────────────────────────────────────────────────
  const mode = BR_MODES.find(m => m.key === selectedMode) ?? BR_MODES[0];
  const teamSize = mode.teamSize;
  const isSolo = teamSize === 1;

  const totalPot = entryFee * mode.maxSlots;
  const platformCut = Math.round(totalPot * 0.2);
  const prizePool = totalPot - platformCut;
  const prize1st  = Math.round(prizePool * 0.50);
  const prize2nd  = Math.round(prizePool * 0.25);
  const prize3rd  = Math.round(prizePool * 0.15);
  const prize4th  = Math.round(prizePool * 0.05);

  const squadFull  = squadMembers.length === teamSize;
  const squadReady = squadFull && squadMembers.every(m => m.status === "leader" || m.status === "confirmed");

  const candidatePlayers = MOCK_LEADERBOARD.filter(
    p => !squadMembers.find(m => m.username === p.username) &&
      p.username.toLowerCase().includes(memberSearch.toLowerCase())
  ).slice(0, 5);

  const roomEntry = getRoomId(tournament.id);
  const roomReleased = roomEntry?.released ?? false;
  const isLive = tournament.status === "live";
  const isCompleted = tournament.status === "completed";
  const slotsLeft = tournament.max_slots - tournament.filled_slots;
  const slotsPercent = Math.round((tournament.filled_slots / tournament.max_slots) * 100);
  const isFull = slotsLeft === 0;
  const canSeeRoom = registered || isLive || isCompleted;

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (tournament.status !== "live" && tournament.status !== "upcoming") return;
    const t = setInterval(() => setTimeLeft(formatTimeLeft(tournament.match_time)), 1000);
    return () => clearInterval(t);
  }, [tournament]);

  // Reset squad when mode changes
  useEffect(() => {
    setSquadMembers([{ username: "DemoPlayer", status: "leader" }]);
    setEntryFee(100);
  }, [selectedMode]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  async function handleRegister() {
    if (!canAfford(entryFee)) return;
    setRegistering(true);
    await new Promise(r => setTimeout(r, 1200));
    const label = `${tournament.title} — BR ${selectedMode} · ${CS_TIME_SLOTS[selectedSlot].label}`;
    const success = deductFee(entryFee, label);
    if (success) setRegistered(true);
    setRegistering(false);
  }

  async function copyField(text: string, field: "id" | "pass") {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  async function copySquadCode() {
    await navigator.clipboard.writeText(`https://elitelobby.in/join/${squadCode}`);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  function addSquadMember(username: string) {
    if (squadMembers.length >= teamSize) return;
    setSquadMembers(prev => [...prev, { username, status: "invited" }]);
    setMemberSearch("");
    setShowMemberSearch(false);
  }

  function removeSquadMember(username: string) {
    setSquadMembers(prev => prev.filter(m => m.username !== username));
  }

  function acceptInvite(username: string) {
    setSquadMembers(prev => prev.map(m => m.username === username ? { ...m, status: "confirmed" } : m));
  }

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Join ${tournament.title} on EliteLobby — Win ₹${prize1st.toLocaleString("en-IN")}!`;
    if (navigator.share) {
      try { await navigator.share({ title: tournament.title, text, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="pt-24 pb-16 px-4 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Back + Share */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-white font-heading text-sm transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Tournaments
          </button>
          <button
            onClick={handleShare}
            className="glass-btn flex items-center gap-2 px-4 py-2 rounded-xl font-heading font-bold text-xs tracking-wider text-orange-400"
          >
            {shareCopied
              ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Link Copied!</span></>
              : <><Share2 className="w-3.5 h-3.5 text-orange-400" />Share Tournament</>}
          </button>
        </div>

        {/* Hero Banner */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl overflow-hidden mb-6">
          <div className="relative h-56 md:h-72 overflow-hidden">
            <img
              src="/ff-banner.jpg"
              alt="Free Fire Banner"
              className="absolute inset-0 w-full h-full object-cover object-[center_20%] scale-105"
            />
            {/* layered overlays: dark bottom, dark left edge for text, subtle vignette top */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
              {isLive ? (
                <div className="flex items-center gap-1.5 live-badge border rounded-full px-3 py-1.5 text-sm font-heading font-bold backdrop-blur-sm">
                  <div className="live-dot" /> LIVE NOW
                </div>
              ) : isCompleted ? (
                <div className="status-completed border rounded-full px-3 py-1.5 text-sm font-heading font-bold backdrop-blur-sm">ENDED</div>
              ) : (
                <div className="status-upcoming border rounded-full px-3 py-1.5 text-sm font-heading font-bold backdrop-blur-sm">UPCOMING</div>
              )}
              <div className="bg-orange-500/25 border border-orange-400/50 rounded-full px-3 py-1.5 text-xs font-heading font-bold text-orange-200 backdrop-blur-sm">
                Solo · Duo · Squad
              </div>
              <div className="bg-black/50 border border-white/15 rounded-full px-3 py-1.5 text-xs font-heading text-slate-200 backdrop-blur-sm">
                ₹100–₹1K entry
              </div>
            </div>

            {/* Bottom text */}
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-orange-300 text-xs font-heading font-semibold uppercase tracking-widest mb-1.5 drop-shadow-lg">{tournament.game}</p>
                <h1 className="font-display font-black text-2xl md:text-4xl text-white leading-tight drop-shadow-2xl" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>{tournament.title}</h1>
              </div>
              <div className="text-right flex-shrink-0 bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-2.5">
                <p className="text-[10px] text-slate-400 font-heading whitespace-nowrap uppercase tracking-wider mb-0.5">Max Win · ₹1K Solo</p>
                <p className="font-display font-black text-xl md:text-2xl gradient-text-gold whitespace-nowrap">
                  {formatCurrency(Math.round(1000 * 50 * 0.8 * 0.5))}
                </p>
                <p className="text-[10px] text-orange-400 font-heading whitespace-nowrap mt-0.5">1st place · 80% pool</p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-orange-500/15">
            {[
              { icon: <Trophy className="w-4 h-4 text-yellow-400" />,  label: "Entry Fee",   value: `₹${entryFee.toLocaleString("en-IN")}`, color: "text-yellow-400" },
              { icon: <Users className="w-4 h-4 text-cyan-400" />,    label: mode.slots,     value: isFull ? "FULL" : `${slotsLeft}/${tournament.max_slots}`, color: isFull ? "text-red-400" : "text-cyan-400" },
              { icon: <Map className="w-4 h-4 text-purple-400" />,    label: "Map",          value: tournament.map_name ?? "Random", color: "text-purple-400" },
              { icon: <Clock className="w-4 h-4 text-slate-400" />,   label: isLive ? "Status" : "Next Slot", value: isLive ? "LIVE" : isCompleted ? "ENDED" : timeLeft, color: isLive ? "text-red-400" : "text-slate-300" },
            ].map((s, i) => (
              <div key={i} className="p-3 md:p-4 text-center overflow-hidden">
                <div className="flex justify-center mb-1">{s.icon}</div>
                <p className="text-xs text-slate-500 font-heading mb-0.5 truncate">{s.label}</p>
                <p className={cn("font-display font-bold text-sm truncate", s.color)}>{s.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: tabs ── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl overflow-hidden">
              {/* Tab bar */}
              <div className="flex border-b border-orange-500/15 overflow-x-auto">
                {[
                  { key: "general" as const, label: "📋 General Rules" },
                  { key: "br-rules" as const, label: "🔥 BR Rules" },
                  { key: "points" as const, label: "📊 Points" },
                  { key: "participants" as const, label: `Players (${tournament.filled_slots})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "flex-1 py-3.5 font-heading font-bold text-xs md:text-sm tracking-wide transition-all border-b-2",
                      activeTab === tab.key
                        ? "border-orange-500 text-orange-400 bg-orange-500/5"
                        : "border-transparent text-slate-400 hover:text-white"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* General + BR Rules tabs */}
                {(activeTab === "general" || activeTab === "br-rules") && (
                  <>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/20 mb-5">
                      <Flame className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <p className="text-xs text-red-300 font-heading leading-relaxed">
                        Violation of any rule results in <strong>immediate disqualification</strong> and forfeit of entry fee. Severe violations lead to a permanent platform ban.
                      </p>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                        {(activeTab === "general" ? BR_GENERAL_RULES : BR_SPECIFIC_RULES).map((rule, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-start gap-3 p-3.5 rounded-xl bg-black/20 border border-white/5 hover:border-orange-500/20 transition-colors"
                          >
                            <span className="text-lg flex-shrink-0 mt-0.5">{rule.icon}</span>
                            <div>
                              <p className="font-heading font-bold text-white text-sm mb-0.5">{rule.title}</p>
                              <p className="text-xs text-slate-400 font-heading leading-relaxed">{rule.desc}</p>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </>
                )}

                {/* Points tab */}
                {activeTab === "points" && (
                  <motion.div key="points" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Kill points banner */}
                    <div className="flex items-center gap-3 p-4 mb-5 rounded-2xl bg-gradient-to-r from-orange-500/15 to-red-500/10 border border-orange-500/30">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0 text-2xl">💀</div>
                      <div>
                        <p className="font-display font-black text-orange-400 text-lg">1 Kill = 1 Point</p>
                        <p className="text-xs text-slate-400 font-heading leading-relaxed">Every elimation counts — stack kills to climb the leaderboard. Kill points apply to <span className="text-white font-bold">all modes</span>.</p>
                      </div>
                    </div>

                    {/* Placement points table */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base">🏁</span>
                        <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider">Placement Points</h4>
                        <span className="ml-auto text-[10px] font-heading text-slate-500 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                          {isSolo ? "Solo (50 players)" : `${selectedMode} (12 ${selectedMode === "Duo" ? "teams" : "squads"})`}
                        </span>
                      </div>

                      <div className="rounded-xl overflow-hidden border border-white/8">
                        <div className="grid grid-cols-3 bg-white/5 px-4 py-2.5 border-b border-white/8">
                          <span className="text-xs font-heading font-bold text-slate-400 uppercase tracking-widest">Rank</span>
                          <span className="text-xs font-heading font-bold text-slate-400 uppercase tracking-widest text-center">Placement Pts</span>
                          <span className="text-xs font-heading font-bold text-slate-400 uppercase tracking-widest text-right">Total (0 kills)</span>
                        </div>

                        {isSolo ? (
                          // Solo: grouped placement points (50 players, 1 pt per rank step)
                          [
                            { rank: "1st",      pts: 15, medal: "🥇", color: "text-yellow-400",  bg: "bg-yellow-500/8"  },
                            { rank: "2nd",      pts: 12, medal: "🥈", color: "text-slate-300",   bg: ""                 },
                            { rank: "3rd",      pts: 10, medal: "🥉", color: "text-orange-400",  bg: ""                 },
                            { rank: "4th–5th",  pts: 8,  medal: "4️⃣",  color: "text-slate-400",   bg: ""                 },
                            { rank: "6th–10th", pts: 5,  medal: "5️⃣",  color: "text-slate-500",   bg: ""                 },
                            { rank: "11th–20th",pts: 3,  medal: "🔸",  color: "text-slate-500",   bg: ""                 },
                            { rank: "21st–35th",pts: 2,  medal: "·",   color: "text-slate-600",   bg: ""                 },
                            { rank: "36th–50th",pts: 1,  medal: "·",   color: "text-slate-600",   bg: ""                 },
                          ].map((row, i) => (
                            <div key={i} className={cn("grid grid-cols-3 px-4 py-3 border-b border-white/5 last:border-0 transition-colors hover:bg-white/3", row.bg)}>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{row.medal}</span>
                                <span className={cn("font-heading font-bold text-sm", row.color)}>{row.rank}</span>
                              </div>
                              <div className="text-center">
                                <span className={cn("font-display font-black text-base", row.color)}>{row.pts}</span>
                                <span className="text-slate-600 font-heading text-xs ml-1">pts</span>
                              </div>
                              <div className="text-right">
                                <span className="font-display font-bold text-sm text-slate-400">{row.pts}</span>
                                <span className="text-slate-600 font-heading text-xs ml-1">pts</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          // Duo / Squad: 12 teams, placement = (13 - rank), 1 pt per rank step
                          Array.from({ length: 12 }, (_, i) => {
                            const rank = i + 1;
                            const pts = 13 - rank; // 1st=12, 2nd=11 ... 12th=1
                            const medals = ["🥇","🥈","🥉","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟","🔸","·"];
                            const colors = ["text-yellow-400","text-slate-300","text-orange-400","text-slate-400","text-slate-400","text-slate-500","text-slate-500","text-slate-500","text-slate-600","text-slate-600","text-slate-600","text-slate-600"];
                            const bgs    = ["bg-yellow-500/8","","","","","","","","","","",""];
                            const suffix = rank === 1 ? "st" : rank === 2 ? "nd" : rank === 3 ? "rd" : "th";
                            return (
                              <div key={rank} className={cn("grid grid-cols-3 px-4 py-3 border-b border-white/5 last:border-0 transition-colors hover:bg-white/3", bgs[i])}>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{medals[i]}</span>
                                  <span className={cn("font-heading font-bold text-sm", colors[i])}>{rank}{suffix}</span>
                                </div>
                                <div className="text-center">
                                  <span className={cn("font-display font-black text-base", colors[i])}>{pts}</span>
                                  <span className="text-slate-600 font-heading text-xs ml-1">pts</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-display font-bold text-sm text-slate-400">{pts}</span>
                                  <span className="text-slate-600 font-heading text-xs ml-1">pts</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Score formula */}
                    <div className="rounded-xl bg-black/30 border border-orange-500/20 p-4 space-y-3">
                      <p className="text-xs font-heading font-bold text-orange-400 uppercase tracking-widest">Scoring Formula</p>
                      <div className="flex items-center justify-center gap-3 flex-wrap text-center">
                        <div className="px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                          <p className="font-display font-black text-orange-400 text-sm">Placement Pts</p>
                          <p className="text-[10px] text-slate-500 font-heading">by rank</p>
                        </div>
                        <span className="font-display font-black text-slate-400 text-lg">+</span>
                        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                          <p className="font-display font-black text-red-400 text-sm">Kills × 1</p>
                          <p className="text-[10px] text-slate-500 font-heading">1 pt per kill</p>
                        </div>
                        <span className="font-display font-black text-slate-400 text-lg">=</span>
                        <div className="px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                          <p className="font-display font-black text-yellow-400 text-sm">Final Score</p>
                          <p className="text-[10px] text-slate-500 font-heading">determines winner</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 font-heading text-center">
                        {isSolo
                          ? "Example: 3rd place (10 pts) + 7 kills (7 pts) = 17 total points"
                          : "Example: 2nd place (11 pts) + 5 kills (5 pts) = 16 total points"}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Participants tab */}
                {activeTab === "participants" && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-heading text-slate-400 text-sm">{tournament.filled_slots} / {tournament.max_slots} registered</p>
                      <div className="w-32 progress-bar">
                        <div className="progress-fill" style={{ width: `${slotsPercent}%` }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {FAKE_PARTICIPANTS.slice(0, tournament.filled_slots).map((p) => (
                        <div key={p.id} className="flex items-center gap-2 p-2 bg-black/20 rounded-lg border border-white/5">
                          <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-700 to-red-700 flex items-center justify-center text-xs font-display text-white flex-shrink-0">
                            {p.username[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-white font-heading font-semibold truncate">{p.username}</p>
                            <p className="text-xs text-slate-500 font-mono truncate">{p.game_uid}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: action panel ── */}
          <div className="space-y-4">

            {/* Prize panel */}
            <div className="glass-card rounded-2xl p-5 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🏆</span>
                <h3 className="font-heading font-bold text-yellow-400 tracking-wide text-sm uppercase">Prize Pool</h3>
                <span className="ml-auto font-display font-black text-yellow-400 text-base">{formatCurrency(prizePool)}</span>
              </div>

              <div className="space-y-3">
                {/* 1st place highlight */}
                <div className="relative overflow-hidden rounded-2xl border border-yellow-500/50 bg-gradient-to-br from-yellow-500/15 via-amber-500/8 to-transparent p-4">
                  <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(ellipse at 80% 50%, rgba(245,158,11,0.12), transparent 60%)" }} />
                  <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400/30 to-amber-600/20 border border-yellow-500/50 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <p className="font-display font-black text-yellow-400 text-sm tracking-wide">🥇 1ST PLACE</p>
                      </div>
                      <p className="text-xs text-yellow-300/70 font-heading leading-tight">50% of prize pool</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-1">
                      <p className="font-display font-black text-lg md:text-xl text-yellow-400 whitespace-nowrap">{formatCurrency(prize1st)}</p>
                      <p className="text-[10px] text-yellow-500 font-heading">on ₹{entryFee} entry</p>
                    </div>
                  </div>
                </div>

                {/* 2nd & 3rd */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: "🥈", label: "2nd Place", amount: prize2nd, pct: 25, color: "text-slate-300", border: "border-slate-500/30", bg: "bg-slate-500/8" },
                    { icon: "🥉", label: "3rd Place", amount: prize3rd, pct: 15, color: "text-orange-400", border: "border-orange-600/30", bg: "bg-orange-600/8" },
                  ].map((row, i) => (
                    <div key={i} className={cn("rounded-xl border p-3 text-center", row.border, row.bg)}>
                      <p className="text-base mb-0.5">{row.icon}</p>
                      <p className={cn("text-[10px] font-heading font-bold", row.color)}>{row.label}</p>
                      <p className={cn("font-display font-black text-sm", row.color)}>{formatCurrency(row.amount)}</p>
                      <p className="text-[9px] text-slate-600 font-heading">{row.pct}% of pool</p>
                    </div>
                  ))}
                </div>

                {/* Breakdown */}
                <div className="space-y-1.5 px-1">
                  {[
                    { label: `${mode.maxSlots} entries × ₹${entryFee}`, value: `₹${totalPot.toLocaleString("en-IN")}`,   color: "text-slate-300" },
                    { label: "Platform fee (20%)",                       value: `-₹${platformCut.toLocaleString("en-IN")}`, color: "text-red-400" },
                    { label: "Total prize pool",                         value: `₹${prizePool.toLocaleString("en-IN")}`,   color: "text-green-400" },
                    { label: `4th–5th place (×2)`,                      value: formatCurrency(prize4th),                  color: "text-slate-400" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-xs py-0.5">
                      <span className="text-slate-500 font-heading">{row.label}</span>
                      <span className={cn("font-display font-bold", row.color)}>{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-orange-500/5 border border-orange-500/20 rounded-xl">
                  <Zap className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                  <p className="text-xs text-slate-400 font-heading">Win <span className="text-orange-400 font-bold">{formatCurrency(prize1st)}</span> with a ₹{entryFee} entry</p>
                </div>
              </div>
            </div>

            {/* Room ID panel */}
            {canSeeRoom && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn("glass-card rounded-2xl p-5 border", roomReleased ? "border-yellow-500/40" : "border-orange-500/25")}
              >
                <div className="flex items-center gap-2 mb-4">
                  {roomReleased ? <Key className="w-5 h-5 text-yellow-400" /> : <Lock className="w-5 h-5 text-slate-400" />}
                  <h3 className={cn("font-heading font-bold", roomReleased ? "text-yellow-400" : "text-slate-300")}>ROOM DETAILS</h3>
                  {roomReleased && (
                    <span className="ml-auto text-xs text-green-400 font-heading font-bold flex items-center gap-1 bg-green-500/10 border border-green-500/25 rounded-full px-2 py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> LIVE
                    </span>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {!roomReleased ? (
                    <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-4">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="w-12 h-12 mx-auto mb-3 rounded-full border-2 border-dashed border-orange-500/40 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-slate-500" />
                      </motion.div>
                      <p className="font-heading font-semibold text-slate-300 text-sm mb-1">
                        {roomEntry ? "Room ID Prepared" : "Room ID Pending"}
                      </p>
                      <p className="text-xs text-slate-500 font-heading leading-relaxed">
                        {roomEntry
                          ? "Admin has set the room ID. It will be released 10 minutes before match time."
                          : "Admin will release the room ID 10 minutes before the match starts."}
                      </p>
                      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-orange-400 font-heading">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Awaiting release...
                      </div>
                    </motion.div>
                  ) : !showRoom ? (
                    <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className="text-xs text-slate-400 font-heading text-center mb-3">Room ID is now available! Tap to reveal.</p>
                      <button onClick={() => setShowRoom(true)} className="btn-gold w-full py-3 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" /> Reveal Room Details
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="details" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      {[
                        { label: "Room ID",  value: roomEntry!.room_id,  field: "id"   as const },
                        { label: "Password", value: roomEntry!.password,  field: "pass" as const },
                      ].map((row) => (
                        <div key={row.field} className="bg-black/40 rounded-xl p-3 border border-yellow-500/20">
                          <p className="text-xs text-slate-400 font-heading mb-1.5">{row.label}</p>
                          <div className="flex items-center justify-between">
                            <p className="font-display font-bold text-xl text-yellow-400 tracking-wider">{row.value}</p>
                            <button
                              onClick={() => copyField(row.value, row.field)}
                              className={cn("flex items-center gap-1 text-xs font-heading font-bold transition-all px-2 py-1 rounded-lg border",
                                copiedField === row.field
                                  ? "text-green-400 border-green-500/30 bg-green-500/10"
                                  : "text-slate-400 border-white/10 hover:border-orange-500/30 hover:text-orange-400"
                              )}
                            >
                              {copiedField === row.field ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedField === row.field ? "Copied!" : "Copy"}
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-start gap-2 p-2.5 bg-yellow-500/5 border border-yellow-500/15 rounded-xl">
                        <AlertCircle className="w-3.5 h-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-slate-400 font-heading leading-relaxed">Join within 5 minutes of match start. Screenshot this for your records.</p>
                      </div>
                      <button onClick={() => setShowRoom(false)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 font-heading transition-colors mx-auto">
                        <EyeOff className="w-3.5 h-3.5" /> Hide
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Registration card */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-heading font-bold text-white mb-4">Choose Mode, Slot & Entry Fee</h3>

              {registered ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="font-heading font-bold text-green-400 mb-1">You&apos;re Registered!</p>
                  <p className="text-xs text-slate-400 font-heading mb-1">
                    Mode: <span className="text-white font-bold">{selectedMode}</span> · Slot: <span className="text-white font-bold">{CS_TIME_SLOTS[selectedSlot].label}</span> · Fee: <span className="text-yellow-400 font-bold">₹{entryFee}</span>
                  </p>
                  <p className="text-xs text-slate-500 font-heading mb-4">
                    {roomReleased ? "Room ID is available — check above!" : "Room ID will be released 10 min before match."}
                  </p>
                  <Link
                    href={`/tournaments/${tournament.id}/lobby`}
                    className="btn-primary w-full py-3 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <Swords className="w-4 h-4" /> Enter Match Lobby
                  </Link>
                </div>
              ) : isCompleted ? (
                <div className="text-center py-4">
                  <p className="font-heading text-slate-400 mb-2">This tournament has ended.</p>
                  <Link href="/tournaments" className="btn-secondary px-4 py-2 rounded-lg text-sm font-heading font-bold">Browse Active</Link>
                </div>
              ) : (
                <>
                  {/* ── MODE SELECTOR ── */}
                  <div className="mb-5">
                    <p className="text-xs text-slate-500 font-heading uppercase tracking-widest mb-2">Select Mode</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {BR_MODES.map((m) => (
                        <button
                          key={m.key}
                          onClick={() => setSelectedMode(m.key as BRMode)}
                          className={cn(
                            "glass-btn py-3 rounded-xl font-heading font-bold flex flex-col items-center gap-0.5",
                            selectedMode === m.key ? "glass-btn-active-fire" : ""
                          )}
                        >
                          <span className="font-display font-black text-sm">{m.label}</span>
                          <span className="text-[10px] text-slate-500 leading-tight text-center">{m.desc}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500 font-heading mt-1.5 text-center">
                      {mode.slots} per session · Kill + Placement points
                    </p>
                  </div>

                  {/* ── TIME SLOT PICKER ── */}
                  <div className="mb-5">
                    <p className="text-xs text-slate-500 font-heading uppercase tracking-widest mb-2">Select Time Slot (Daily)</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {CS_TIME_SLOTS.map((slot, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedSlot(i)}
                          className={cn(
                            "glass-btn py-2 px-1 rounded-lg text-xs font-display font-bold",
                            selectedSlot === i ? "glass-btn-active-fire" : ""
                          )}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── ENTRY FEE SELECTOR ── */}
                  <div className="mb-5">
                    <p className="text-xs text-slate-500 font-heading uppercase tracking-widest mb-2">Quick Select Entry Fee</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {BR_FEE_PRESETS.map((p) => (
                        <button
                          key={p}
                          onClick={() => setEntryFee(p)}
                          className={cn(
                            "glass-btn px-3 py-1.5 rounded-lg text-xs font-display font-bold",
                            entryFee === p ? "glass-btn-active-fire" : ""
                          )}
                        >
                          ₹{p}
                        </button>
                      ))}
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-slate-500 font-heading">₹100</span>
                        <span className="font-display font-black text-lg text-orange-400">₹{entryFee}</span>
                        <span className="text-xs text-slate-500 font-heading">₹1,000</span>
                      </div>
                      <input
                        type="range" min={100} max={1000} step={50} value={entryFee}
                        onChange={(e) => setEntryFee(Number(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{ background: `linear-gradient(to right, #f97316 0%, #f97316 ${((entryFee - 100) / 900) * 100}%, rgba(255,255,255,0.1) ${((entryFee - 100) / 900) * 100}%, rgba(255,255,255,0.1) 100%)` }}
                      />
                    </div>

                    {/* Prize breakdown */}
                    <div className="bg-black/30 rounded-xl p-3 border border-orange-500/20 space-y-2">
                      <p className="text-xs font-heading font-bold text-orange-400 mb-2 uppercase tracking-widest">Prize Breakdown</p>
                      {[
                        { label: "Your entry fee",            value: `₹${entryFee}`,                             color: "text-white" },
                        { label: `${mode.maxSlots} × ₹${entryFee} pot`, value: `₹${totalPot.toLocaleString("en-IN")}`, color: "text-slate-300" },
                        { label: "Platform fee (20%)",        value: `-₹${platformCut.toLocaleString("en-IN")}`,  color: "text-red-400" },
                        { label: "1st place gets",            value: formatCurrency(prize1st),                    color: "text-yellow-400" },
                        { label: "2nd place gets",            value: formatCurrency(prize2nd),                    color: "text-slate-300" },
                        { label: "3rd place gets",            value: formatCurrency(prize3rd),                    color: "text-orange-400" },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between text-xs py-0.5 border-b border-white/5 last:border-0">
                          <span className="text-slate-500 font-heading">{row.label}</span>
                          <span className={cn("font-display font-bold", row.color)}>{row.value}</span>
                        </div>
                      ))}
                      <div className="pt-1.5 flex items-center justify-between">
                        <span className="text-xs font-heading font-bold text-slate-300">Win if you place 1st</span>
                        <div className="text-right">
                          <span className="font-display font-black text-base text-amber-400">{formatCurrency(prize1st)}</span>
                          <span className="ml-1.5 text-xs font-heading text-green-400">+₹{(prize1st - entryFee).toLocaleString("en-IN")} profit</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-500 font-heading">
                      <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                      Win {(prize1st / entryFee).toFixed(1)}× your entry if you place 1st
                    </div>
                  </div>

                  {/* ── SQUAD BUILDER (Duo / Squad modes) ── */}
                  {!isSolo && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-4 space-y-3">
                      <p className="text-xs text-slate-500 font-heading uppercase tracking-widest">
                        {selectedMode} Members{" "}
                        <span className={cn("font-bold", squadFull ? "text-green-400" : "text-white")}>{squadMembers.length}/{teamSize}</span>
                      </p>

                      <div>
                        <p className="text-xs text-slate-500 font-heading uppercase tracking-widest mb-1.5">Squad Name</p>
                        <input
                          type="text" value={squadName} onChange={e => setSquadName(e.target.value)}
                          placeholder="Enter squad name..." maxLength={20}
                          className="gaming-input w-full px-3 py-2 rounded-xl text-sm"
                        />
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-orange-500/5 border border-orange-500/20 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500 font-heading mb-0.5">Invite Code</p>
                          <p className="font-display font-black text-base text-orange-400 tracking-widest">{squadCode}</p>
                        </div>
                        <button
                          onClick={copySquadCode}
                          className={cn("glass-btn flex items-center gap-1.5 text-xs font-heading font-bold px-3 py-1.5 rounded-lg flex-shrink-0",
                            codeCopied ? "text-green-400" : "text-orange-400"
                          )}
                        >
                          {codeCopied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                          {codeCopied ? "Copied!" : "Share"}
                        </button>
                      </div>

                      <div className="space-y-2">
                        {squadMembers.map((member) => (
                          <motion.div key={member.username} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                            className={cn("flex items-center gap-2.5 p-2.5 rounded-xl border",
                              member.status === "leader"    ? "border-yellow-500/30 bg-yellow-500/5" :
                              member.status === "confirmed" ? "border-green-500/30 bg-green-500/5"   : "border-white/10 bg-white/3"
                            )}
                          >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-700 to-red-700 flex items-center justify-center font-display font-bold text-sm text-white flex-shrink-0">
                              {member.username[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-heading font-bold text-white text-xs truncate">{member.username}</p>
                              <div className="flex items-center gap-1">
                                {member.status === "leader"    && <span className="flex items-center gap-0.5 text-[10px] text-yellow-400 font-heading font-bold"><Crown className="w-2.5 h-2.5" /> Leader</span>}
                                {member.status === "invited"   && <span className="text-[10px] text-orange-400 font-heading">Invite sent...</span>}
                                {member.status === "confirmed" && <span className="flex items-center gap-0.5 text-[10px] text-green-400 font-heading font-bold"><CheckCircle2 className="w-2.5 h-2.5" /> Confirmed</span>}
                              </div>
                            </div>
                            {member.status === "invited" && (
                              <button onClick={() => acceptInvite(member.username)} className="text-[10px] font-heading font-bold text-green-400 bg-green-500/10 border border-green-500/25 rounded-lg px-2 py-1 hover:bg-green-500/20 transition-colors flex-shrink-0">
                                Accept
                              </button>
                            )}
                            {member.status !== "leader" && (
                              <button onClick={() => removeSquadMember(member.username)} className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0 ml-auto">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </motion.div>
                        ))}

                        {Array.from({ length: teamSize - squadMembers.length }).map((_, i) => (
                          <div key={`empty-${i}`} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-dashed border-white/10">
                            <div className="w-8 h-8 rounded-lg border border-dashed border-white/15 flex items-center justify-center flex-shrink-0">
                              <span className="text-slate-600 text-xs">+</span>
                            </div>
                            <span className="text-xs text-slate-600 font-heading">Open slot</span>
                          </div>
                        ))}
                      </div>

                      {!squadFull && (
                        <div className="mt-2 relative">
                          <button
                            onClick={() => setShowMemberSearch(!showMemberSearch)}
                            className="glass-btn w-full flex items-center justify-center gap-2 py-2 rounded-xl border-dashed text-orange-400 text-xs font-heading font-bold"
                          >
                            <UserPlus className="w-3.5 h-3.5" /> Add Teammate
                          </button>

                          {showMemberSearch && (
                            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                              className="absolute bottom-full mb-1 left-0 right-0 bg-[#0d0d1a] border border-orange-500/30 rounded-xl overflow-hidden shadow-2xl z-20"
                            >
                              <div className="p-2 border-b border-white/5">
                                <div className="relative">
                                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                                  <input
                                    autoFocus type="text" value={memberSearch}
                                    onChange={e => setMemberSearch(e.target.value)}
                                    placeholder="Search player..."
                                    className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-heading text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/40"
                                  />
                                </div>
                              </div>
                              {candidatePlayers.length > 0 ? (
                                <div className="max-h-40 overflow-y-auto">
                                  {candidatePlayers.map(p => (
                                    <button key={p.username} onClick={() => addSquadMember(p.username)}
                                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 transition-colors text-left"
                                    >
                                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-700 to-red-700 flex items-center justify-center font-display font-bold text-xs text-white flex-shrink-0">
                                        {p.username[0]}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-heading font-bold text-white truncate">{p.username}</p>
                                        <p className="text-[10px] text-slate-500 font-heading">{p.game} · #{p.rank}</p>
                                      </div>
                                      <span className="text-[10px] text-orange-400 font-heading flex-shrink-0">{p.wins}W</span>
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-500 font-heading text-center py-4">No players found</p>
                              )}
                            </motion.div>
                          )}
                        </div>
                      )}

                      {squadFull && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className={cn("mt-2 flex items-center gap-2 p-2.5 rounded-xl border text-xs font-heading font-bold",
                            squadReady ? "border-green-500/30 bg-green-500/5 text-green-400" : "border-orange-500/30 bg-orange-500/5 text-orange-400"
                          )}
                        >
                          {squadReady
                            ? <><CheckCircle2 className="w-4 h-4" /> Squad ready — all members confirmed!</>
                            : <><AlertCircle className="w-4 h-4" /> Waiting for members to accept invite...</>}
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* Balance row */}
                  <div className="flex justify-between text-sm py-2 border-b border-white/5 mb-4">
                    <span className="text-slate-400 font-heading">Your Balance</span>
                    <span className={cn("font-heading font-bold", entryFee > balance ? "text-red-400" : "text-white")}>₹{balance.toLocaleString()}</span>
                  </div>

                  {/* Register button */}
                  {isFull ? (
                    <div className="text-center py-2">
                      <p className="text-red-400 font-heading font-semibold text-sm mb-3">Tournament is FULL</p>
                      <Link href="/tournaments" className="btn-secondary w-full py-3 rounded-xl font-heading font-bold text-sm text-center block">Browse Other Tournaments</Link>
                    </div>
                  ) : !canAfford(entryFee) ? (
                    <div className="text-center py-2 space-y-2">
                      <p className="text-red-400 font-heading font-semibold text-sm">Insufficient wallet balance</p>
                      <p className="text-slate-500 text-xs font-heading">You need ₹{entryFee} · You have ₹{balance.toLocaleString()}</p>
                      <Link href="/wallet/deposit" className="btn-gold w-full py-3 rounded-xl font-heading font-bold text-sm text-center block">+ Add Funds to Wallet</Link>
                    </div>
                  ) : !isSolo && !squadReady ? (
                    <button disabled className="btn-fire w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 opacity-40 cursor-not-allowed">
                      <Users className="w-4 h-4" />
                      {!squadFull
                        ? `Add ${teamSize - squadMembers.length} more member${teamSize - squadMembers.length !== 1 ? "s" : ""}`
                        : "Waiting for confirmations..."}
                    </button>
                  ) : (
                    <button
                      onClick={handleRegister}
                      disabled={registering}
                      className="btn-fire w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {registering ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          PROCESSING...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          {isSolo ? <Zap className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                          {isSolo
                            ? `ENTER SOLO · ₹${entryFee} · WIN ₹${prize1st.toLocaleString("en-IN")}`
                            : `REGISTER ${selectedMode.toUpperCase()} · ₹${entryFee} × ${teamSize}`}
                        </span>
                      )}
                    </button>
                  )}

                  <p className="text-xs text-slate-500 font-heading text-center mt-3 flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3" /> Secure transaction · Instant slot booking
                  </p>
                </>
              )}
            </div>

            {/* Quick info */}
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <h4 className="font-heading font-bold text-slate-300 text-xs uppercase tracking-wider">Quick Info</h4>
              {[
                { icon: <Swords className="w-4 h-4 text-orange-400" />, label: "Mode",      value: selectedMode },
                { icon: <Map className="w-4 h-4 text-cyan-400" />,     label: "Map",       value: "Random" },
                { icon: <Trophy className="w-4 h-4 text-yellow-400" />, label: "Max Win",   value: formatCurrency(prize1st) },
                { icon: <Key className="w-4 h-4 text-purple-400" />,   label: "Room ID",   value: "10 min before" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-slate-400 text-sm font-heading flex-1">{item.label}</span>
                  <span className="text-white font-heading font-semibold text-sm">{item.value}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
