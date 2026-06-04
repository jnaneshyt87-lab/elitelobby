"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@/lib/wallet-context";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_TOURNAMENTS, MOCK_REGISTRATIONS, MOCK_LEADERBOARD, CS_RULES, CS_TIME_SLOTS } from "@/lib/mock-data";
import { formatCurrency, formatTimeLeft, getGameIcon } from "@/lib/utils";
import { useRoomIds } from "@/lib/room-id-context";
import { BRTournamentDetail } from "./br-detail";

import {
  ArrowLeft, Trophy, Users, Clock, Shield, Map, Swords, Eye, EyeOff,
  CheckCircle2, AlertCircle, Wallet, Copy, Key, Lock, Loader2, Zap,
  TrendingUp, UserPlus, Crown, X, Search, Share2, Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CS_FORMATS = [
  { key: "4v4" as const, teamSize: 4, desc: "Team Battle",   players: "8 players" },
  { key: "3v3" as const, teamSize: 3, desc: "Trio Clash",    players: "6 players" },
  { key: "2v2" as const, teamSize: 2, desc: "Duo Duel",      players: "4 players" },
  { key: "1v1" as const, teamSize: 1, desc: "Solo Showdown", players: "2 players" },
];
type CSFormat = typeof CS_FORMATS[number]["key"];

export default function TournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getRoomId } = useRoomIds();
  const { balance, deductFee, canAfford } = useWallet();

  const tournament = MOCK_TOURNAMENTS.find(t => t.id === params.id);
  const [timeLeft, setTimeLeft] = useState(tournament ? formatTimeLeft(tournament.match_time) : "");
  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [showRoom, setShowRoom] = useState(false);
  const [copiedField, setCopiedField] = useState<"id" | "pass" | null>(null);
  const [activeTab, setActiveTab] = useState<"rules" | "participants">("rules");
  const [stake, setStake] = useState(100);
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<CSFormat>("4v4");

  const isCS = tournament?.id === "clash-squad";
  const selectedFormatData = CS_FORMATS.find(f => f.key === selectedFormat) ?? CS_FORMATS[0];
  const teamSize = isCS ? selectedFormatData.teamSize : 4;
  const isSoloOnly = teamSize === 1;

  const totalPot = stake * 2;
  const platformCut = Math.round(totalPot * 0.2);
  const winnerTeamPrize = totalPot - platformCut;
  const profit = winnerTeamPrize - stake;

  const effectiveEntryFee = isCS ? stake : (tournament?.entry_fee ?? 0);
  const STAKE_PRESETS = [100, 250, 500, 750, 1000];

  type SquadMember = { username: string; status: "leader" | "invited" | "confirmed" };
  const [playMode, setPlayMode] = useState<"solo" | "squad">("solo");
  const [squadName, setSquadName] = useState("");
  const [squadCode] = useState(() => Math.random().toString(36).slice(2, 8).toUpperCase());
  const [squadMembers, setSquadMembers] = useState<SquadMember[]>([
    { username: "DemoPlayer", status: "leader" },
  ]);
  const [memberSearch, setMemberSearch] = useState("");
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const squadFull = squadMembers.length === teamSize;
  const squadReady = squadFull && squadMembers.every(m => m.status === "leader" || m.status === "confirmed");

  const candidatePlayers = MOCK_LEADERBOARD.filter(
    p => !squadMembers.find(m => m.username === p.username) &&
      p.username.toLowerCase().includes(memberSearch.toLowerCase())
  ).slice(0, 5);

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

  async function copySquadCode() {
    await navigator.clipboard.writeText(`https://elitelobby.in/join/${squadCode}`);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  const roomEntry = tournament ? getRoomId(tournament.id) : null;
  const roomReleased = roomEntry?.released ?? false;

  const participants = MOCK_REGISTRATIONS.filter(r => r.tournament_id === params.id);

  useEffect(() => {
    if (!tournament) return;
    const interval = setInterval(() => setTimeLeft(formatTimeLeft(tournament.match_time)), 1000);
    return () => clearInterval(interval);
  }, [tournament]);

  // Reset squad when format changes
  useEffect(() => {
    setSquadMembers([{ username: "DemoPlayer", status: "leader" }]);
    setPlayMode("solo");
  }, [selectedFormat]);

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Join ${tournament?.title} on EliteLobby — Win up to ₹${winnerTeamPrize}!`;
    if (navigator.share) {
      try { await navigator.share({ title: tournament?.title, text, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  if (!tournament) {
    return (
      <div className="pt-24 pb-16 px-4 text-center">
        <h1 className="font-display font-bold text-2xl text-white mb-4">TOURNAMENT NOT FOUND</h1>
        <Link href="/tournaments" className="btn-secondary px-6 py-3 rounded-xl font-heading font-bold">← Back to Tournaments</Link>
      </div>
    );
  }

  // Battle Royale tournaments get their own dedicated detail page
  if ((tournament as any).tournament_type === "battle-royale") {
    return <BRTournamentDetail tournament={tournament as any} />;
  }

  const slotsLeft = tournament.max_slots - tournament.filled_slots;
  const slotsPercent = Math.round((tournament.filled_slots / tournament.max_slots) * 100);
  const isLive = tournament.status === "live";
  const isCompleted = tournament.status === "completed";
  const isFull = slotsLeft === 0;
  const canSeeRoom = registered || isLive || isCompleted;

  async function handleRegister() {
    if (!canAfford(effectiveEntryFee)) return;
    setRegistering(true);
    await new Promise(r => setTimeout(r, 1200));
    const label = `${tournament.title} — ${CS_TIME_SLOTS[selectedSlot].label} slot`;
    const success = deductFee(effectiveEntryFee, label);
    if (success) setRegistered(true);
    setRegistering(false);
  }

  async function copyField(text: string, field: "id" | "pass") {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  return (
    <div className="pt-24 pb-16 px-4 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">

        {/* ── Back + Share row ── */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-white font-heading text-sm transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Tournaments
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-heading font-bold text-xs tracking-wider transition-all border border-purple/30 hover:border-purple-500/60 bg-purple/5 hover:bg-purple/10 text-slate-300 hover:text-white"
          >
            {shareCopied ? (
              <><CheckCircle2 className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Link Copied!</span></>
            ) : (
              <><Share2 className="w-3.5 h-3.5 text-purple-400" />Share Tournament</>
            )}
          </button>
        </div>

        {/* ── Hero banner ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl overflow-hidden mb-6">
          <div className="relative h-48 md:h-64 bg-gradient-to-br from-purple-900/60 via-indigo-900/40 to-cyan-900/30 overflow-hidden">
            <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(124,58,237,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.08) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-9xl opacity-20 select-none">{getGameIcon(tournament.game)}</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
              {isLive ? (
                <div className="flex items-center gap-1.5 live-badge border rounded-full px-3 py-1.5 text-sm font-heading font-bold">
                  <div className="live-dot" /> LIVE NOW
                </div>
              ) : isCompleted ? (
                <div className="status-completed border rounded-full px-3 py-1.5 text-sm font-heading font-bold">ENDED</div>
              ) : (
                <div className="status-upcoming border rounded-full px-3 py-1.5 text-sm font-heading font-bold">UPCOMING</div>
              )}
              <div className="bg-black/40 border border-white/10 rounded-full px-3 py-1.5 text-sm font-heading text-slate-300">{tournament.game_mode}</div>
              <div className="bg-orange-500/20 border border-orange-500/30 rounded-full px-3 py-1.5 text-xs font-heading font-bold text-orange-300">
                ₹100–₹1K stake
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-slate-300 text-sm font-heading mb-1">{tournament.game}</p>
                <h1 className="font-display font-black text-xl md:text-3xl text-white leading-tight break-words">{tournament.title}</h1>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-slate-400 font-heading whitespace-nowrap">MAX WIN</p>
                <p className="font-display font-black text-xl md:text-2xl gradient-text-gold whitespace-nowrap">{formatCurrency(winnerTeamPrize)}</p>
                <p className="text-xs text-cyan-400 font-heading whitespace-nowrap">on ₹{stake} stake · 80%</p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-purple/15">
            {[
              { icon: <Wallet className="w-4 h-4 text-yellow-400" />, label: "Stake (per team)", value: `₹${stake}`, color: "text-yellow-400" },
              { icon: <Users className="w-4 h-4 text-cyan-400" />, label: "Slots Left", value: isFull ? "FULL" : `${slotsLeft}/${tournament.max_slots}`, color: isFull ? "text-red-400" : "text-cyan-400" },
              { icon: <Map className="w-4 h-4 text-purple-400" />, label: "Map", value: tournament.map_name ?? "TBA", color: "text-purple-400" },
              { icon: <Clock className="w-4 h-4 text-slate-400" />, label: isLive ? "Status" : "Next Slot", value: isLive ? "LIVE" : isCompleted ? "ENDED" : timeLeft, color: isLive ? "text-red-400" : "text-slate-300" },
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
              <div className="flex border-b border-purple/15">
                {[
                  { key: "rules", label: "Rules" },
                  { key: "participants", label: `Participants (${participants.length})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as "rules" | "participants")}
                    className={cn(
                      "flex-1 py-3.5 font-heading font-bold text-sm tracking-wide transition-all border-b-2",
                      activeTab === tab.key
                        ? "border-purple-500 text-purple-400 bg-purple/5"
                        : "border-transparent text-slate-400 hover:text-white"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* ── Rules tab ── */}
                {activeTab === "rules" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/20 mb-5">
                      <Flame className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <p className="text-xs text-red-300 font-heading leading-relaxed">
                        Violation of any rule results in <strong>immediate disqualification</strong> and forfeit of entry fee. Severe violations may lead to a permanent platform ban.
                      </p>
                    </div>
                    {CS_RULES.map((rule, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-start gap-3 p-3.5 rounded-xl bg-black/20 border border-white/5 hover:border-purple/20 transition-colors"
                      >
                        <span className="text-lg flex-shrink-0 mt-0.5">{rule.icon}</span>
                        <div>
                          <p className="font-heading font-bold text-white text-sm mb-0.5">{rule.title}</p>
                          <p className="text-xs text-slate-400 font-heading leading-relaxed">{rule.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* ── Participants tab ── */}
                {activeTab === "participants" && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-heading text-slate-400 text-sm">{tournament.filled_slots} / {tournament.max_slots} registered</p>
                      <div className="w-32 progress-bar">
                        <div className="progress-fill" style={{ width: `${slotsPercent}%` }} />
                      </div>
                    </div>
                    {participants.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {participants.map((p) => (
                          <div key={p.id} className="flex items-center gap-2 p-2 bg-black/20 rounded-lg border border-white/5">
                            <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-700 to-cyan-700 flex items-center justify-center text-xs font-display text-white flex-shrink-0">
                              {p.username[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-white font-heading font-semibold truncate">{p.username}</p>
                              <p className="text-xs text-slate-500 font-mono truncate">{p.game_uid}</p>
                            </div>
                          </div>
                        ))}
                        {slotsLeft > 0 && Array.from({ length: Math.min(slotsLeft, 6) }).map((_, i) => (
                          <div key={`empty-${i}`} className="flex items-center gap-2 p-2 bg-black/10 rounded-lg border border-dashed border-white/5">
                            <div className="w-6 h-6 rounded border border-dashed border-white/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-slate-600 text-xs">+</span>
                            </div>
                            <span className="text-xs text-slate-600 font-heading">Open slot</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 font-heading text-sm text-center py-6">No registrations yet</p>
                    )}
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
                <span className="ml-auto font-display font-black text-yellow-400 text-base">{formatCurrency(winnerTeamPrize)}</span>
              </div>

              <div className="space-y-3">
                {/* Winner highlight */}
                <div className="relative overflow-hidden rounded-2xl border border-yellow-500/50 bg-gradient-to-br from-yellow-500/15 via-amber-500/8 to-transparent p-4">
                  <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(ellipse at 80% 50%, rgba(245,158,11,0.12), transparent 60%)" }} />
                  <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400/30 to-amber-600/20 border border-yellow-500/50 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <p className="font-display font-black text-yellow-400 text-sm tracking-wide">🥇 WINNER</p>
                        <span className="text-[10px] font-heading font-bold bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 rounded-full px-2 py-0.5 whitespace-nowrap">TAKES ALL</span>
                      </div>
                      <p className="text-xs text-yellow-300/70 font-heading leading-tight">80% of total pot goes to winning team</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-1">
                      <p className="font-display font-black text-lg md:text-xl text-yellow-400 whitespace-nowrap">{formatCurrency(winnerTeamPrize)}</p>
                      <p className="text-[10px] text-yellow-500 font-heading">on ₹{stake} stake</p>
                    </div>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-1.5 px-1">
                  {[
                    { label: "Team A stake",     value: `₹${stake}`,           color: "text-slate-300" },
                    { label: "Team B stake",     value: `₹${stake}`,           color: "text-slate-300" },
                    { label: "Total pot",        value: `₹${totalPot}`,        color: "text-white" },
                    { label: "Platform fee (20%)", value: `-₹${platformCut}`, color: "text-red-400" },
                    { label: "Winner gets",      value: `₹${winnerTeamPrize}`, color: "text-green-400" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-xs py-0.5">
                      <span className="text-slate-500 font-heading">{row.label}</span>
                      <span className={cn("font-display font-bold", row.color)}>{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                  <Zap className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <p className="text-xs text-slate-400 font-heading">Win <span className="text-cyan-400 font-bold">₹{profit} profit</span> on a ₹{stake} stake</p>
                </div>
              </div>
            </div>

            {/* ── Room ID panel ── */}
            {canSeeRoom && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "glass-card rounded-2xl p-5 border",
                  roomReleased ? "border-yellow-500/40" : "border-purple/25"
                )}
              >
                <div className="flex items-center gap-2 mb-4">
                  {roomReleased ? (
                    <Key className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-400" />
                  )}
                  <h3 className={cn("font-heading font-bold", roomReleased ? "text-yellow-400" : "text-slate-300")}>
                    ROOM DETAILS
                  </h3>
                  {roomReleased && (
                    <span className="ml-auto text-xs text-green-400 font-heading font-bold flex items-center gap-1 bg-green-500/10 border border-green-500/25 rounded-full px-2 py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> LIVE
                    </span>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {!roomReleased ? (
                    <motion.div
                      key="waiting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-4"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 mx-auto mb-3 rounded-full border-2 border-dashed border-purple/40 flex items-center justify-center"
                      >
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
                      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-purple-400 font-heading">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Awaiting release...
                      </div>
                    </motion.div>
                  ) : !showRoom ? (
                    <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className="text-xs text-slate-400 font-heading text-center mb-3">
                        Room ID is now available! Tap to reveal.
                      </p>
                      <button
                        onClick={() => setShowRoom(true)}
                        className="btn-gold w-full py-3 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" /> Reveal Room Details
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <div className="bg-black/40 rounded-xl p-3 border border-yellow-500/20">
                        <p className="text-xs text-slate-400 font-heading mb-1.5">Room ID</p>
                        <div className="flex items-center justify-between">
                          <p className="font-display font-bold text-xl text-yellow-400 tracking-wider">{roomEntry!.room_id}</p>
                          <button
                            onClick={() => copyField(roomEntry!.room_id, "id")}
                            className={cn(
                              "flex items-center gap-1 text-xs font-heading font-bold transition-all px-2 py-1 rounded-lg border",
                              copiedField === "id"
                                ? "text-green-400 border-green-500/30 bg-green-500/10"
                                : "text-slate-400 border-white/10 hover:border-purple/30 hover:text-purple-400"
                            )}
                          >
                            {copiedField === "id" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedField === "id" ? "Copied!" : "Copy"}
                          </button>
                        </div>
                      </div>

                      <div className="bg-black/40 rounded-xl p-3 border border-yellow-500/20">
                        <p className="text-xs text-slate-400 font-heading mb-1.5">Password</p>
                        <div className="flex items-center justify-between">
                          <p className="font-display font-bold text-xl text-yellow-400 tracking-wider">{roomEntry!.password}</p>
                          <button
                            onClick={() => copyField(roomEntry!.password, "pass")}
                            className={cn(
                              "flex items-center gap-1 text-xs font-heading font-bold transition-all px-2 py-1 rounded-lg border",
                              copiedField === "pass"
                                ? "text-green-400 border-green-500/30 bg-green-500/10"
                                : "text-slate-400 border-white/10 hover:border-purple/30 hover:text-purple-400"
                            )}
                          >
                            {copiedField === "pass" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedField === "pass" ? "Copied!" : "Copy"}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-2.5 bg-yellow-500/5 border border-yellow-500/15 rounded-xl">
                        <AlertCircle className="w-3.5 h-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-slate-400 font-heading leading-relaxed">
                          Join within 5 minutes of match start. Screenshot this for your records.
                        </p>
                      </div>

                      <button
                        onClick={() => setShowRoom(false)}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 font-heading transition-colors mx-auto"
                      >
                        <EyeOff className="w-3.5 h-3.5" /> Hide
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── Registration card ── */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-heading font-bold text-white mb-4">Choose Format, Slot & Stake</h3>

              {registered ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="font-heading font-bold text-green-400 mb-1">You&apos;re Registered!</p>
                  <p className="text-xs text-slate-400 font-heading mb-1">
                    Slot: <span className="text-white font-bold">{CS_TIME_SLOTS[selectedSlot].label}</span> · Stake: <span className="text-yellow-400 font-bold">₹{stake}</span>
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
                  {/* ── FORMAT SELECTOR ── */}
                  {isCS && (
                    <div className="mb-5">
                      <p className="text-xs text-slate-500 font-heading uppercase tracking-widest mb-2">Select Format</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {CS_FORMATS.map((fmt) => (
                          <button
                            key={fmt.key}
                            onClick={() => setSelectedFormat(fmt.key)}
                            className={cn(
                              "py-3 rounded-xl border font-heading font-bold transition-all flex flex-col items-center gap-0.5",
                              selectedFormat === fmt.key
                                ? "bg-purple-600/30 border-purple-500/60 text-purple-200"
                                : "border-white/10 text-slate-400 hover:border-purple-500/30 hover:text-purple-300"
                            )}
                          >
                            <span className="font-display font-black text-sm">{fmt.key}</span>
                            <span className="text-[10px] text-slate-500 leading-tight text-center">{fmt.desc}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-500 font-heading mt-1.5 text-center">
                        {selectedFormatData.players} per match · Winner takes 80%
                      </p>
                    </div>
                  )}

                  {/* ── TIME SLOT PICKER ── */}
                  <div className="mb-5">
                    <p className="text-xs text-slate-500 font-heading uppercase tracking-widest mb-2">Select Time Slot (Daily)</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {CS_TIME_SLOTS.map((slot, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedSlot(i)}
                          className={cn(
                            "py-2 px-1 rounded-lg text-xs font-display font-bold border transition-all",
                            selectedSlot === i
                              ? "bg-purple-600/30 border-purple-500/60 text-purple-200"
                              : "border-white/10 text-slate-400 hover:border-purple-500/30 hover:text-purple-300"
                          )}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── STAKE SELECTOR ── */}
                  <div className="mb-5">
                    <p className="text-xs text-slate-500 font-heading uppercase tracking-widest mb-2">Quick Select Stake</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {STAKE_PRESETS.map((p) => (
                        <button
                          key={p}
                          onClick={() => setStake(p)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-display font-bold border transition-all",
                            stake === p
                              ? "bg-orange-500/30 border-orange-500/60 text-orange-300"
                              : "border-white/10 text-slate-400 hover:border-orange-500/30 hover:text-orange-300"
                          )}
                        >
                          ₹{p}
                        </button>
                      ))}
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-slate-500 font-heading">₹100</span>
                        <span className="font-display font-black text-lg text-orange-400">₹{stake}</span>
                        <span className="text-xs text-slate-500 font-heading">₹1,000</span>
                      </div>
                      <input
                        type="range"
                        min={100}
                        max={1000}
                        step={50}
                        value={stake}
                        onChange={(e) => setStake(Number(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #f97316 0%, #f97316 ${((stake - 100) / 900) * 100}%, rgba(255,255,255,0.1) ${((stake - 100) / 900) * 100}%, rgba(255,255,255,0.1) 100%)`,
                        }}
                      />
                    </div>

                    {/* Payout breakdown */}
                    <div className="bg-black/30 rounded-xl p-3 border border-orange-500/20 space-y-2">
                      <p className="text-xs font-heading font-bold text-orange-400 mb-2 uppercase tracking-widest">Payout Breakdown</p>
                      {[
                        { label: "Your stake",         value: `₹${stake}`,           color: "text-white" },
                        { label: "Total pot (2 teams)", value: `₹${totalPot}`,        color: "text-slate-300" },
                        { label: "Platform fee (20%)", value: `-₹${platformCut}`,    color: "text-red-400" },
                        { label: "Winner team gets",   value: `₹${winnerTeamPrize}`, color: "text-green-400" },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between text-xs py-0.5 border-b border-white/5 last:border-0">
                          <span className="text-slate-500 font-heading">{row.label}</span>
                          <span className={cn("font-display font-bold", row.color)}>{row.value}</span>
                        </div>
                      ))}
                      <div className="pt-1.5 flex items-center justify-between">
                        <span className="text-xs font-heading font-bold text-slate-300">Your profit if you win</span>
                        <div className="text-right">
                          <span className="font-display font-black text-base text-amber-400">₹{winnerTeamPrize}</span>
                          <span className="ml-1.5 text-xs font-heading text-green-400">+₹{profit}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-500 font-heading">
                      <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                      Win {((winnerTeamPrize / stake) * 100 / 100).toFixed(1)}× your stake — guaranteed if your team wins
                    </div>
                  </div>

                  {/* ── PLAY MODE (not for 1v1) ── */}
                  {!isSoloOnly && (
                    <div className="mb-4">
                      <p className="text-xs text-slate-500 font-heading uppercase tracking-widest mb-2">Play Mode</p>
                      <div className="flex gap-2">
                        {(["solo", "squad"] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setPlayMode(mode)}
                            className={cn(
                              "flex-1 py-2.5 rounded-xl border font-heading font-bold text-sm flex items-center justify-center gap-2 transition-all",
                              playMode === mode
                                ? mode === "squad"
                                  ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                                  : "bg-purple-600/30 border-purple-500/60 text-purple-300"
                                : "border-white/10 text-slate-400 hover:border-white/20"
                            )}
                          >
                            {mode === "solo" ? <Swords className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                            {mode === "solo" ? "Solo Entry" : `Squad (${teamSize})`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── SQUAD BUILDER (squad mode, not 1v1) ── */}
                  {!isSoloOnly && playMode === "squad" && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 space-y-3"
                    >
                      <div>
                        <p className="text-xs text-slate-500 font-heading uppercase tracking-widest mb-1.5">Squad Name</p>
                        <input
                          type="text"
                          value={squadName}
                          onChange={e => setSquadName(e.target.value)}
                          placeholder="Enter squad name..."
                          maxLength={20}
                          className="gaming-input w-full px-3 py-2 rounded-xl text-sm"
                        />
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500 font-heading mb-0.5">Invite Code</p>
                          <p className="font-display font-black text-base text-cyan-400 tracking-widest">{squadCode}</p>
                        </div>
                        <button
                          onClick={copySquadCode}
                          className={cn(
                            "flex items-center gap-1.5 text-xs font-heading font-bold px-3 py-1.5 rounded-lg border transition-all flex-shrink-0",
                            codeCopied
                              ? "text-green-400 border-green-500/30 bg-green-500/10"
                              : "text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10"
                          )}
                        >
                          {codeCopied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                          {codeCopied ? "Copied!" : "Share"}
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-slate-500 font-heading uppercase tracking-widest">
                            Team Members <span className={cn("font-bold", squadFull ? "text-green-400" : "text-white")}>{squadMembers.length}/{teamSize}</span>
                          </p>
                        </div>

                        <div className="space-y-2">
                          {squadMembers.map((member) => (
                            <motion.div
                              key={member.username}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={cn(
                                "flex items-center gap-2.5 p-2.5 rounded-xl border",
                                member.status === "leader" ? "border-yellow-500/30 bg-yellow-500/5" :
                                member.status === "confirmed" ? "border-green-500/30 bg-green-500/5" :
                                "border-white/10 bg-white/3"
                              )}
                            >
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-700 to-cyan-700 flex items-center justify-center font-display font-bold text-sm text-white flex-shrink-0">
                                {member.username[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-heading font-bold text-white text-xs truncate">{member.username}</p>
                                <div className="flex items-center gap-1">
                                  {member.status === "leader" && (
                                    <span className="flex items-center gap-0.5 text-[10px] text-yellow-400 font-heading font-bold">
                                      <Crown className="w-2.5 h-2.5" /> Leader
                                    </span>
                                  )}
                                  {member.status === "invited" && (
                                    <span className="text-[10px] text-orange-400 font-heading">Invite sent...</span>
                                  )}
                                  {member.status === "confirmed" && (
                                    <span className="flex items-center gap-0.5 text-[10px] text-green-400 font-heading font-bold">
                                      <CheckCircle2 className="w-2.5 h-2.5" /> Confirmed
                                    </span>
                                  )}
                                </div>
                              </div>
                              {member.status === "invited" && (
                                <button
                                  onClick={() => acceptInvite(member.username)}
                                  className="text-[10px] font-heading font-bold text-green-400 bg-green-500/10 border border-green-500/25 rounded-lg px-2 py-1 hover:bg-green-500/20 transition-colors flex-shrink-0"
                                >
                                  Accept
                                </button>
                              )}
                              {member.status !== "leader" && (
                                <button
                                  onClick={() => removeSquadMember(member.username)}
                                  className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0 ml-auto"
                                >
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
                              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-cyan-500/30 text-cyan-400 text-xs font-heading font-bold hover:bg-cyan-500/5 transition-colors"
                            >
                              <UserPlus className="w-3.5 h-3.5" /> Add Teammate
                            </button>

                            {showMemberSearch && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute bottom-full mb-1 left-0 right-0 bg-[#0d0d1a] border border-purple/30 rounded-xl overflow-hidden shadow-2xl z-20"
                              >
                                <div className="p-2 border-b border-white/5">
                                  <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                                    <input
                                      autoFocus
                                      type="text"
                                      value={memberSearch}
                                      onChange={e => setMemberSearch(e.target.value)}
                                      placeholder="Search player..."
                                      className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-heading text-white placeholder-slate-500 focus:outline-none focus:border-purple/40"
                                    />
                                  </div>
                                </div>
                                {candidatePlayers.length > 0 ? (
                                  <div className="max-h-40 overflow-y-auto">
                                    {candidatePlayers.map(p => (
                                      <button
                                        key={p.username}
                                        onClick={() => addSquadMember(p.username)}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 transition-colors text-left"
                                      >
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-700 to-cyan-700 flex items-center justify-center font-display font-bold text-xs text-white flex-shrink-0">
                                          {p.username[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-heading font-bold text-white truncate">{p.username}</p>
                                          <p className="text-[10px] text-slate-500 font-heading">{p.game} · #{p.rank}</p>
                                        </div>
                                        <span className="text-[10px] text-purple-400 font-heading flex-shrink-0">{p.wins}W</span>
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
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={cn(
                              "mt-2 flex items-center gap-2 p-2.5 rounded-xl border text-xs font-heading font-bold",
                              squadReady
                                ? "border-green-500/30 bg-green-500/5 text-green-400"
                                : "border-orange-500/30 bg-orange-500/5 text-orange-400"
                            )}
                          >
                            {squadReady ? (
                              <><CheckCircle2 className="w-4 h-4" /> Squad ready — all members confirmed!</>
                            ) : (
                              <><AlertCircle className="w-4 h-4" /> Waiting for members to accept invite...</>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Balance row */}
                  <div className="flex justify-between text-sm py-2 border-b border-white/5 mb-4">
                    <span className="text-slate-400 font-heading">Your Balance</span>
                    <span className={cn("font-heading font-bold", stake > balance ? "text-red-400" : "text-white")}>₹{balance.toLocaleString()}</span>
                  </div>

                  {/* ── REGISTER BUTTON ── */}
                  {isFull ? (
                    <div className="text-center py-2">
                      <p className="text-red-400 font-heading font-semibold text-sm mb-3">Tournament is FULL</p>
                      <Link href="/tournaments" className="btn-secondary w-full py-3 rounded-xl font-heading font-bold text-sm text-center block">Browse Other Tournaments</Link>
                    </div>
                  ) : !canAfford(effectiveEntryFee) ? (
                    <div className="text-center py-2 space-y-2">
                      <p className="text-red-400 font-heading font-semibold text-sm">Insufficient wallet balance</p>
                      <p className="text-slate-500 text-xs font-heading">You need ₹{effectiveEntryFee} · You have ₹{balance.toLocaleString()}</p>
                      <Link href="/wallet/deposit" className="btn-gold w-full py-3 rounded-xl font-heading font-bold text-sm text-center block">+ Add Funds to Wallet</Link>
                    </div>
                  ) : !isSoloOnly && playMode === "squad" && !squadReady ? (
                    <button
                      disabled
                      className="w-full py-3.5 rounded-xl font-heading font-bold tracking-wider text-sm flex items-center justify-center gap-2 opacity-40 cursor-not-allowed bg-gradient-to-r from-cyan-700 to-teal-600 text-white"
                    >
                      <Users className="w-4 h-4" />
                      {!squadFull
                        ? `Add ${teamSize - squadMembers.length} more member${teamSize - squadMembers.length !== 1 ? "s" : ""}`
                        : "Waiting for confirmations..."}
                    </button>
                  ) : (
                    <button
                      onClick={handleRegister}
                      disabled={registering}
                      className={cn(
                        "w-full py-3.5 rounded-xl font-heading font-bold tracking-wider text-sm relative flex items-center justify-center gap-2 disabled:opacity-60",
                        !isSoloOnly && playMode === "squad"
                          ? "bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white shadow-lg shadow-cyan-900/30 transition-all"
                          : "bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white shadow-lg shadow-orange-900/30 transition-all"
                      )}
                    >
                      {registering ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          PROCESSING...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          {!isSoloOnly && playMode === "squad" ? <Users className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                          {!isSoloOnly && playMode === "squad"
                            ? `REGISTER SQUAD · ₹${stake} × ${teamSize}`
                            : `STAKE ₹${stake} · WIN ₹${winnerTeamPrize}`}
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
                { icon: <Swords className="w-4 h-4 text-purple-400" />, label: "Mode", value: tournament.game_mode },
                { icon: <Map className="w-4 h-4 text-cyan-400" />, label: "Map", value: tournament.map_name ?? "TBA" },
                { icon: <Trophy className="w-4 h-4 text-yellow-400" />, label: "Max Win", value: formatCurrency(winnerTeamPrize) },
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
