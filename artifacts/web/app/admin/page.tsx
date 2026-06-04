"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_TOURNAMENTS, MOCK_REGISTRATIONS, BR_SERIES_MATCHES } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Shield, Users, Trophy, DollarSign, BarChart3, Bell, Ban, CheckCircle2, XCircle, Clock, Plus, Edit, Trash2, Eye, TrendingUp, ImageIcon, X, ChevronDown, ChevronUp, Gift, ClipboardList, Search, Download, ChevronRight, Key, Lock, Unlock, Send, RotateCcw, Swords, Crown, Medal, Award, Hash, AlertCircle, Wallet, Calendar, Flame, Map, Star } from "lucide-react";
import { useRoomIds } from "@/lib/room-id-context";
import { useNotifications } from "@/lib/notifications-context";
import { useTicker, type TickerType } from "@/lib/ticker-context";
import { cn } from "@/lib/utils";

type AdminTab = "overview" | "tournaments" | "registrations" | "users" | "payments" | "results" | "announcements" | "brseries";
type MatchStatus = "upcoming" | "live" | "completed";
type SquadResult = { name: string; placement: number; kills: number };

const MOCK_PENDING_PAYMENTS = [
  {
    id: "p1", user: "CyberWarrior99", amount: 500, utr: "012345678901",
    time: "2 min ago", upi: "cyberwarrior@paytm", bonus: 25,
    screenshot: "https://placehold.co/400x600/0a0a14/7c3aed?text=Payment+Screenshot",
  },
  {
    id: "p2", user: "NeonSniper88", amount: 1000, utr: "098765432100",
    time: "15 min ago", upi: "neonsniper@okaxis", bonus: 100,
    screenshot: "https://placehold.co/400x600/0a0a14/06b6d4?text=Payment+Screenshot",
  },
  {
    id: "p3", user: "GhostRider_X", amount: 200, utr: "055566677700",
    time: "32 min ago", upi: "ghostrider@upi", bonus: 0,
    screenshot: null,
  },
  {
    id: "p4", user: "TGFF Warner", amount: 2000, utr: "020304050607",
    time: "1 hr ago", upi: "stormraider@ybl", bonus: 300,
    screenshot: "https://placehold.co/400x600/0a0a14/f59e0b?text=Payment+Screenshot",
  },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function loadStoredResults() {
  try {
    const raw = localStorage.getItem("elitelobby_match_results");
    if (!raw) return [];
    const items = JSON.parse(raw) as Array<Record<string, unknown>>;
    return items.map((r) => ({
      id: String(r.id ?? ""),
      player: String(r.player ?? "DemoPlayer"),
      tournament_id: String(r.tournament_id ?? ""),
      tournament_name: String(r.tournament_name ?? ""),
      game: "Unknown",
      placement: Number(r.placement ?? 5),
      kills: Number(r.kills) || 0,
      match_id: String(r.match_id ?? ""),
      prize_eligible: Number(r.prize_eligible ?? 0),
      time: timeAgo(String(r.submitted_at ?? new Date().toISOString())),
      status: "pending" as const,
      screenshot: r.image ? String(r.image) : null,
    }));
  } catch {
    return [];
  }
}

const MOCK_PENDING_RESULTS = [
  {
    id: "res1", player: "Team MBG",    tournament_id: "t1", tournament_name: "Free Fire Grand Series",
    game: "Free Fire", placement: 1, kills: 12, match_id: "FF-928374",
    prize_eligible: 1200, time: "18 min ago", status: "pending",
    screenshot: "https://placehold.co/800x500/0a0a14/f59e0b?text=1st+Place+Match+Result",
  },
  {
    id: "res2", player: "Rex Gaming",  tournament_id: "t1", tournament_name: "Free Fire Grand Series",
    game: "Free Fire", placement: 2, kills: 8, match_id: "FF-928374",
    prize_eligible: 800, time: "20 min ago", status: "pending",
    screenshot: "https://placehold.co/800x500/0a0a14/06b6d4?text=2nd+Place+Match+Result",
  },
  {
    id: "res3", player: "MBG Rakesh",  tournament_id: "t3", tournament_name: "Free Fire Clash Squad",
    game: "Free Fire", placement: 1, kills: 9, match_id: "FF-334455",
    prize_eligible: 600, time: "2 hrs ago", status: "pending",
    screenshot: "https://placehold.co/800x500/0a0a14/7c3aed?text=FF+Winner+Screen",
  },
  {
    id: "res4", player: "777 Official",tournament_id: "t3", tournament_name: "Free Fire Clash Squad",
    game: "Free Fire", placement: 3, kills: 5, match_id: "FF-334455",
    prize_eligible: 300, time: "2 hrs ago", status: "pending",
    screenshot: null,
  },
];

const MOCK_PENDING_WITHDRAWALS = [
  {
    id: "w1", user: "Team MBG",   amount: 1000, netAmount: 1000, fee: 0,
    method: "upi" as const, upiId: "teammbg@paytm", upiName: "Arjun Kumar",
    time: "5 min ago", status: "pending",
  },
  {
    id: "w2", user: "Rex Gaming",  amount: 250, netAmount: 240, fee: 10,
    method: "upi" as const, upiId: "rexgaming@ybl", upiName: "Rahul Sharma",
    time: "22 min ago", status: "pending",
  },
  {
    id: "w3", user: "MBG Rakesh",  amount: 500, netAmount: 500, fee: 0,
    method: "bank" as const, bankAccount: "••••7821", bankIfsc: "HDFC0001234",
    bankName: "Rakesh Kumar", bankMobile: "9988776655",
    time: "48 min ago", status: "pending",
  },
  {
    id: "w4", user: "777 Official",amount: 600, netAmount: 600, fee: 0,
    method: "upi" as const, upiId: "777official@okicici", upiName: "Sneha Patel",
    time: "2 hrs ago", status: "pending",
  },
];

const MOCK_USERS_ADMIN = [
  { id: "u1", username: "Team MBG",   email: "mbg@example.com",  balance: 5200, status: "active", joined: "Jan 2025" },
  { id: "u2", username: "Rex Gaming", email: "rex@example.com",  balance: 1800, status: "active", joined: "Feb 2025" },
  { id: "u3", username: "BannedUser01", email: "banned@example.com", balance: 0, status: "banned", joined: "Mar 2025" },
];

function OverviewTab() {
  const stats = [
    { label: "Total Revenue", value: "₹4.2L", change: "+18%", icon: <DollarSign className="w-5 h-5" />, color: "text-yellow-400" },
    { label: "Active Players", value: "14,258", change: "+342", icon: <Users className="w-5 h-5" />, color: "text-cyan-400" },
    { label: "Live Tournaments", value: "7", change: "right now", icon: <Trophy className="w-5 h-5" />, color: "text-red-400" },
    { label: "Pending Payments", value: "12", change: "needs review", icon: <Clock className="w-5 h-5" />, color: "text-purple-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-xl p-5"
          >
            <div className={cn("mb-3", s.color)}>{s.icon}</div>
            <p className="text-slate-400 text-xs font-heading mb-1">{s.label}</p>
            <p className={cn("font-display font-black text-2xl", s.color)}>{s.value}</p>
            <p className="text-xs text-slate-500 font-heading mt-1">{s.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue chart placeholder */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-white">Revenue Overview</h3>
          <div className="flex items-center gap-2 text-green-400 text-sm font-heading">
            <TrendingUp className="w-4 h-4" /> +22% this month
          </div>
        </div>
        <div className="flex items-end gap-2 h-32">
          {[35, 60, 45, 80, 65, 90, 75, 85, 70, 95, 88, 100].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-sm transition-all hover:opacity-80" style={{ height: `${h}%`, background: "linear-gradient(to top, #7c3aed, #06b6d4)" }} />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
            <span key={m} className="text-xs text-slate-600 font-heading flex-1 text-center">{m}</span>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-heading font-bold text-white mb-4">Pending Payments</h3>
        <div className="space-y-3">
          {MOCK_PENDING_PAYMENTS.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-3 bg-black/20 rounded-xl border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-700 to-cyan-700 flex items-center justify-center font-display font-bold text-xs text-white flex-shrink-0">
                {p.user[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-white text-sm">{p.user}</p>
                <p className="text-xs text-slate-400 font-heading font-mono">{p.utr}</p>
              </div>
              <span className="font-display font-bold text-yellow-400 text-sm">₹{p.amount}</span>
              <span className="text-xs text-slate-500 font-heading hidden sm:block">{p.time}</span>
              <div className="flex gap-1.5">
                <button className="w-7 h-7 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 hover:bg-green-500/30 transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors">
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TournamentsTab() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-white">All Tournaments</h3>
        <button className="btn-primary relative px-4 py-2 rounded-xl text-sm font-heading font-bold flex items-center gap-1.5">
          <Plus className="w-4 h-4 relative z-10" />
          <span className="relative z-10">Create Tournament</span>
        </button>
      </div>
      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full gaming-table">
          <thead>
            <tr>
              <th className="text-left">Tournament</th>
              <th className="text-left hidden sm:table-cell">Game</th>
              <th className="text-right hidden md:table-cell">Prize</th>
              <th className="text-right hidden md:table-cell">Slots</th>
              <th className="text-center">Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_TOURNAMENTS.map((t) => {
              const tRegs = MOCK_REGISTRATIONS.filter((r) => r.tournament_id === t.id);
              const isExpanded = expandedId === t.id;
              return (
                <>
                  <tr key={t.id} className={cn("group transition-colors", isExpanded && "bg-purple-900/10")}>
                    <td className="font-heading font-semibold text-white text-sm">{t.title}</td>
                    <td className="hidden sm:table-cell text-slate-400 text-sm font-heading">{t.game}</td>
                    <td className="hidden md:table-cell text-right font-display font-bold text-yellow-400 text-xs">{formatCurrency(t.prize_pool)}</td>
                    <td className="hidden md:table-cell text-right text-xs font-heading text-slate-300">{t.filled_slots}/{t.max_slots}</td>
                    <td className="text-center">
                      <span className={cn("text-xs font-heading font-bold border rounded-full px-2 py-0.5", `status-${t.status}`)}>
                        {t.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : t.id)}
                          className={cn(
                            "flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-heading font-bold transition-all",
                            isExpanded
                              ? "border-purple-500/50 text-purple-400 bg-purple-500/10"
                              : "border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30"
                          )}
                        >
                          <Users className="w-3 h-3" />
                          <span className="hidden sm:inline">{tRegs.length}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        <button className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-purple-400 hover:border-purple/30 transition-colors">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${t.id}-regs`}>
                      <td colSpan={6} className="p-0">
                        <AnimatePresence>
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-2 bg-black/20 border-t border-purple/10">
                              <div className="flex items-center justify-between mb-3">
                                <p className="font-heading font-bold text-xs text-purple-400 uppercase tracking-widest flex items-center gap-2">
                                  <Users className="w-3.5 h-3.5" /> Registered Players ({tRegs.length})
                                </p>
                                {tRegs.length > 0 && (
                                  <span className="text-xs font-heading text-slate-500">
                                    Fees collected: <span className="text-yellow-400 font-bold">{formatCurrency(tRegs.reduce((s, r) => s + r.fee_paid, 0))}</span>
                                  </span>
                                )}
                              </div>
                              {tRegs.length === 0 ? (
                                <p className="text-slate-500 font-heading text-xs text-center py-4">No registrations yet</p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {tRegs.map((r, i) => (
                                    <div key={r.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/30 border border-white/5">
                                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-700 to-cyan-700 flex items-center justify-center font-display font-bold text-xs text-white flex-shrink-0">
                                        {i + 1}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs text-white font-heading font-semibold truncate">{r.username}</p>
                                        <p className="text-[10px] text-slate-500 font-mono truncate">{r.game_uid}</p>
                                      </div>
                                      <div className="text-right flex-shrink-0">
                                        <p className="text-xs font-display font-bold text-yellow-400">{formatCurrency(r.fee_paid)}</p>
                                        <p className="text-[10px] text-green-400 font-heading">{r.payment_status}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-white">User Management</h3>
      </div>
      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full gaming-table">
          <thead>
            <tr>
              <th className="text-left">Player</th>
              <th className="text-left hidden sm:table-cell">Email</th>
              <th className="text-right hidden md:table-cell">Balance</th>
              <th className="text-left hidden sm:table-cell">Joined</th>
              <th className="text-center">Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_USERS_ADMIN.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-700 to-cyan-700 flex items-center justify-center font-display font-bold text-xs text-white">
                      {u.username[0]}
                    </div>
                    <span className="font-heading font-semibold text-white text-sm">{u.username}</span>
                  </div>
                </td>
                <td className="hidden sm:table-cell text-slate-400 text-xs font-heading">{u.email}</td>
                <td className="hidden md:table-cell text-right font-display font-bold text-yellow-400 text-xs">₹{u.balance.toLocaleString()}</td>
                <td className="hidden sm:table-cell text-slate-400 text-xs font-heading">{u.joined}</td>
                <td className="text-center">
                  <span className={cn("text-xs font-heading font-bold border rounded-full px-2 py-0.5", u.status === "banned" ? "status-live" : "status-upcoming")}>
                    {u.status.toUpperCase()}
                  </span>
                </td>
                <td className="text-center">
                  <button className={cn("w-7 h-7 rounded-lg border flex items-center justify-center transition-colors mx-auto",
                    u.status === "banned"
                      ? "border-green-500/30 text-green-400 hover:bg-green-500/20"
                      : "border-red-500/30 text-red-400 hover:bg-red-500/20"
                  )}>
                    {u.status === "banned" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RegistrationsTab({ onViewTournament }: { onViewTournament?: (id: string) => void }) {
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const tournament = selectedTournament
    ? MOCK_TOURNAMENTS.find((t) => t.id === selectedTournament)
    : null;

  const regs = MOCK_REGISTRATIONS.filter((r) => {
    if (selectedTournament && r.tournament_id !== selectedTournament) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.username.toLowerCase().includes(q) ||
        r.game_uid.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Per-tournament summary
  const tournamentSummary = MOCK_TOURNAMENTS.map((t) => {
    const tRegs = MOCK_REGISTRATIONS.filter((r) => r.tournament_id === t.id);
    const revenue = tRegs.filter((r) => r.payment_status === "confirmed").length * t.entry_fee;
    return { ...t, regCount: tRegs.length, confirmed: tRegs.filter(r => r.payment_status === "confirmed").length, pending: tRegs.filter(r => r.payment_status === "pending").length, revenue };
  });

  return (
    <div className="space-y-5">
      {/* Tournament summary cards */}
      <div>
        <h3 className="font-heading font-bold text-white mb-3 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-purple-400" /> Tournament Registrations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tournamentSummary.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTournament(selectedTournament === t.id ? null : t.id)}
              className={cn(
                "glass-card rounded-2xl p-4 text-left border-2 transition-all hover:border-purple/40",
                selectedTournament === t.id ? "border-purple/60 bg-purple/5" : "border-transparent"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-heading font-bold text-white text-sm leading-tight">{t.title}</p>
                  <p className="text-xs text-slate-500 font-heading">{t.game} · {t.game_mode}</p>
                </div>
                <span className={cn("text-xs font-heading font-bold border rounded-full px-2 py-0.5", `status-${t.status}`)}>
                  {t.status.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-black/30 rounded-xl p-2.5 text-center">
                  <p className="font-display font-black text-xl text-white">{t.regCount}</p>
                  <p className="text-xs text-slate-500 font-heading">Total</p>
                </div>
                <div className="bg-black/30 rounded-xl p-2.5 text-center">
                  <p className="font-display font-black text-xl text-green-400">{t.confirmed}</p>
                  <p className="text-xs text-slate-500 font-heading">Paid</p>
                </div>
                <div className="bg-black/30 rounded-xl p-2.5 text-center">
                  <p className="font-display font-black text-xl text-yellow-400">₹{(t.revenue / 1000).toFixed(1)}k</p>
                  <p className="text-xs text-slate-500 font-heading">Revenue</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="progress-bar flex-1 mr-3 h-1.5 rounded-full">
                  <div className="progress-fill h-full rounded-full" style={{ width: `${Math.round((t.filled_slots / t.max_slots) * 100)}%` }} />
                </div>
                <span className="text-xs text-slate-400 font-heading">{t.filled_slots}/{t.max_slots}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Player list */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple/10">
          <p className="font-heading font-bold text-white text-sm">
            {tournament ? `${tournament.title} — ` : "All "}
            <span className="text-purple-400">{regs.length} registrants</span>
          </p>
          <div className="flex items-center gap-2">
            {selectedTournament && (
              <button
                onClick={() => setSelectedTournament(null)}
                className="text-xs text-slate-400 hover:text-white font-heading transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear filter
              </button>
            )}
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search player..."
                className="gaming-input pl-8 pr-3 py-1.5 rounded-lg text-xs w-40"
              />
            </div>
          </div>
        </div>

        {regs.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-700 mx-auto mb-2" />
            <p className="text-slate-500 font-heading text-sm">No registrations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full gaming-table">
              <thead>
                <tr>
                  <th className="text-left">#</th>
                  <th className="text-left">Player</th>
                  <th className="text-left hidden sm:table-cell">Game UID</th>
                  <th className="text-left hidden md:table-cell">Email</th>
                  {!selectedTournament && <th className="text-left hidden lg:table-cell">Tournament</th>}
                  <th className="text-right">Entry Fee</th>
                  <th className="text-center">Payment</th>
                  <th className="text-right hidden md:table-cell">Registered</th>
                </tr>
              </thead>
              <tbody>
                {regs.map((r, i) => {
                  const t = MOCK_TOURNAMENTS.find((t) => t.id === r.tournament_id);
                  return (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                    >
                      <td className="text-slate-500 font-heading text-xs">{i + 1}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-700 to-cyan-700 flex items-center justify-center font-display font-bold text-xs text-white flex-shrink-0">
                            {r.username[0]}
                          </div>
                          <span className="font-heading font-semibold text-white text-sm">{r.username}</span>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell font-mono text-xs text-cyan-400">{r.game_uid}</td>
                      <td className="hidden md:table-cell text-slate-400 text-xs font-heading">{r.email}</td>
                      {!selectedTournament && (
                        <td className="hidden lg:table-cell">
                          <button
                            onClick={() => setSelectedTournament(r.tournament_id)}
                            className="text-xs text-purple-400 hover:text-purple-300 font-heading font-semibold transition-colors flex items-center gap-1"
                          >
                            {t?.title} <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      )}
                      <td className="text-right font-display font-bold text-yellow-400 text-sm">₹{r.fee_paid}</td>
                      <td className="text-center">
                        <span className={cn(
                          "text-xs font-heading font-bold border rounded-full px-2 py-0.5",
                          r.payment_status === "confirmed"
                            ? "text-green-400 border-green-500/30 bg-green-500/10"
                            : "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
                        )}>
                          {r.payment_status === "confirmed" ? "✓ Paid" : "Pending"}
                        </span>
                      </td>
                      <td className="hidden md:table-cell text-right text-xs text-slate-500 font-heading">
                        {new Date(r.registered_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer with totals */}
        {regs.length > 0 && (
          <div className="px-5 py-3 border-t border-purple/10 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-heading">
              {regs.filter(r => r.payment_status === "confirmed").length} confirmed · {regs.filter(r => r.payment_status === "pending").length} pending
            </p>
            <p className="text-xs text-slate-400 font-heading">
              Total collected: <span className="text-yellow-400 font-bold font-display">
                ₹{regs.filter(r => r.payment_status === "confirmed").reduce((s, r) => s + r.fee_paid, 0).toLocaleString()}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DepositsSubTab() {
  const [payments, setPayments] = useState(
    MOCK_PENDING_PAYMENTS.map((p) => ({ ...p, status: "pending" as "pending" | "approved" | "rejected", expanded: false }))
  );
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  function approve(id: string) { setPayments(ps => ps.map(p => p.id === id ? { ...p, status: "approved" } : p)); }
  function reject(id: string) { setPayments(ps => ps.map(p => p.id === id ? { ...p, status: "rejected" } : p)); }
  function toggle(id: string) { setPayments(ps => ps.map(p => p.id === id ? { ...p, expanded: !p.expanded } : p)); }

  const filtered = payments.filter(p => filter === "all" || p.status === filter);
  const counts = { all: payments.length, pending: payments.filter(p => p.status === "pending").length, approved: payments.filter(p => p.status === "approved").length, rejected: payments.filter(p => p.status === "rejected").length };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["all", "pending", "approved", "rejected"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("glass-card rounded-xl p-4 text-left border-2 transition-all",
              filter === f ? f === "pending" ? "border-yellow-500/50" : f === "approved" ? "border-green-500/50" : f === "rejected" ? "border-red-500/50" : "border-purple/50" : "border-transparent hover:border-white/10"
            )}>
            <p className="text-xs font-heading text-slate-400 mb-1 capitalize">{f}</p>
            <p className={cn("font-display font-black text-2xl", f === "pending" ? "text-yellow-400" : f === "approved" ? "text-green-400" : f === "rejected" ? "text-red-400" : "text-white")}>{counts[f]}</p>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && <div className="glass-card rounded-2xl p-10 text-center"><p className="text-slate-500 font-heading">No {filter} deposits</p></div>}
        {filtered.map(p => (
          <motion.div key={p.id} layout className={cn("glass-card rounded-2xl overflow-hidden border", p.status === "approved" ? "border-green-500/20" : p.status === "rejected" ? "border-red-500/15" : "border-yellow-500/20")}>
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-700 to-cyan-700 flex items-center justify-center font-display font-bold text-sm text-white flex-shrink-0">{p.user[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-heading font-bold text-white text-sm">{p.user}</p>
                  <span className={cn("text-xs font-heading font-bold border rounded-full px-2 py-0.5",
                    p.status === "approved" ? "border-green-500/30 text-green-400 bg-green-500/10" : p.status === "rejected" ? "border-red-500/30 text-red-400 bg-red-500/10" : "border-yellow-500/30 text-yellow-400 bg-yellow-500/10"
                  )}>{p.status.toUpperCase()}</span>
                </div>
                <p className="text-xs text-slate-500 font-heading">UTR: <span className="font-mono text-cyan-400">{p.utr}</span> · {p.upi} · {p.time}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-display font-black text-xl text-yellow-400">₹{p.amount}</p>
                {p.bonus > 0 && <p className="text-xs text-green-400 font-heading flex items-center gap-1 justify-end"><Gift className="w-3 h-3" />+₹{p.bonus}</p>}
              </div>
              <button onClick={() => toggle(p.id)} className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all flex-shrink-0">
                {p.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
            {p.expanded && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="border-t border-white/5 p-4">
                <div className="flex flex-col md:flex-row gap-5">
                  <div className="md:w-52 flex-shrink-0">
                    <p className="text-xs text-slate-400 font-heading mb-2 flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> Screenshot</p>
                    {p.screenshot ? (
                      <button onClick={() => setLightbox(p.screenshot!)} className="block w-full rounded-xl overflow-hidden border-2 border-purple/20 hover:border-purple/50 transition-all group">
                        <img src={p.screenshot} alt="proof" className="w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="bg-purple/20 py-1 text-center"><span className="text-xs text-purple-300 font-heading">Click to enlarge</span></div>
                      </button>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed border-white/10 text-slate-600">
                        <ImageIcon className="w-8 h-8" /><p className="text-xs font-heading">No screenshot</p>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Amount", value: `₹${p.amount}`, color: "text-yellow-400" },
                        { label: "Bonus", value: p.bonus > 0 ? `+₹${p.bonus}` : "None", color: p.bonus > 0 ? "text-green-400" : "text-slate-500" },
                        { label: "Total Credit", value: `₹${p.amount + p.bonus}`, color: "text-white" },
                        { label: "UPI ID", value: p.upi, color: "text-cyan-400 font-mono text-xs" },
                        { label: "UTR", value: p.utr, color: "text-purple-300 font-mono text-xs" },
                        { label: "Received", value: p.time, color: "text-slate-400" },
                      ].map(row => (
                        <div key={row.label} className="bg-black/20 rounded-xl p-3 border border-white/5">
                          <p className="text-xs text-slate-500 font-heading mb-1">{row.label}</p>
                          <p className={cn("font-heading font-bold text-sm truncate", row.color)}>{row.value}</p>
                        </div>
                      ))}
                    </div>
                    {p.status === "pending" && (
                      <div className="flex gap-3">
                        <button onClick={() => approve(p.id)} className="btn-gold flex-1 py-2.5 rounded-xl text-sm font-heading font-bold flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Approve & Credit ₹{p.amount + p.bonus}
                        </button>
                        <button onClick={() => reject(p.id)} className="btn-danger flex-1 py-2.5 rounded-xl text-sm font-heading font-bold flex items-center justify-center gap-2">
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}
                    {p.status === "approved" && <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl"><CheckCircle2 className="w-4 h-4 text-green-400" /><p className="text-sm text-green-400 font-heading font-semibold">Approved — ₹{p.amount + p.bonus} credited to wallet</p></div>}
                    {p.status === "rejected" && <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"><XCircle className="w-4 h-4 text-red-400" /><p className="text-sm text-red-400 font-heading font-semibold">Rejected — player notified</p></div>}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"><X className="w-5 h-5" /></button>
          <img src={lightbox} alt="Payment screenshot" className="max-w-md w-full max-h-[85vh] object-contain rounded-2xl border border-purple/30" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

function WithdrawalsSubTab() {
  const [withdrawals, setWithdrawals] = useState(
    MOCK_PENDING_WITHDRAWALS.map(w => ({ ...w, status: "pending" as "pending" | "approved" | "rejected", expanded: false }))
  );
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  function approve(id: string) { setWithdrawals(ws => ws.map(w => w.id === id ? { ...w, status: "approved" } : w)); }
  function reject(id: string) { setWithdrawals(ws => ws.map(w => w.id === id ? { ...w, status: "rejected" } : w)); }
  function toggle(id: string) { setWithdrawals(ws => ws.map(w => w.id === id ? { ...w, expanded: !w.expanded } : w)); }

  const filtered = withdrawals.filter(w => filter === "all" || w.status === filter);
  const counts = { all: withdrawals.length, pending: withdrawals.filter(w => w.status === "pending").length, approved: withdrawals.filter(w => w.status === "approved").length, rejected: withdrawals.filter(w => w.status === "rejected").length };
  const totalPending = withdrawals.filter(w => w.status === "pending").reduce((s, w) => s + w.netAmount, 0);

  return (
    <div className="space-y-4">
      {totalPending > 0 && (
        <div className="flex items-center gap-3 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
          <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <p className="text-sm font-heading text-slate-300">
            <strong className="text-yellow-400">₹{totalPending.toLocaleString()}</strong> pending payout — verify player details before approving
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["all", "pending", "approved", "rejected"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("glass-card rounded-xl p-4 text-left border-2 transition-all",
              filter === f ? f === "pending" ? "border-yellow-500/50" : f === "approved" ? "border-green-500/50" : f === "rejected" ? "border-red-500/50" : "border-purple/50" : "border-transparent hover:border-white/10"
            )}>
            <p className="text-xs font-heading text-slate-400 mb-1 capitalize">{f}</p>
            <p className={cn("font-display font-black text-2xl", f === "pending" ? "text-yellow-400" : f === "approved" ? "text-green-400" : f === "rejected" ? "text-red-400" : "text-white")}>{counts[f]}</p>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && <div className="glass-card rounded-2xl p-10 text-center"><p className="text-slate-500 font-heading">No {filter} withdrawals</p></div>}
        {filtered.map(w => (
          <motion.div key={w.id} layout className={cn("glass-card rounded-2xl overflow-hidden border",
            w.status === "approved" ? "border-green-500/20" : w.status === "rejected" ? "border-red-500/15" : "border-purple/20"
          )}>
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-700 to-purple-700 flex items-center justify-center font-display font-bold text-sm text-white flex-shrink-0">{w.user[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-heading font-bold text-white text-sm">{w.user}</p>
                  <span className={cn("text-xs font-heading font-bold border rounded-full px-2 py-0.5",
                    w.status === "approved" ? "border-green-500/30 text-green-400 bg-green-500/10" : w.status === "rejected" ? "border-red-500/30 text-red-400 bg-red-500/10" : "border-purple/30 text-purple-300 bg-purple/10"
                  )}>{w.status.toUpperCase()}</span>
                  <span className={cn("text-xs font-heading border rounded-full px-2 py-0.5",
                    w.method === "upi" ? "border-cyan-500/30 text-cyan-400 bg-cyan-500/10" : "border-blue-500/30 text-blue-400 bg-blue-500/10"
                  )}>{w.method === "upi" ? "UPI" : "BANK"}</span>
                </div>
                <p className="text-xs text-slate-500 font-heading truncate">
                  {w.method === "upi" ? (w as { upiId: string }).upiId : (w as { bankIfsc: string }).bankIfsc} · {w.time}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-display font-black text-xl text-purple-300">₹{w.netAmount.toLocaleString()}</p>
                {w.fee > 0 && <p className="text-xs text-slate-500 font-heading">-₹{w.fee} fee</p>}
              </div>
              <button onClick={() => toggle(w.id)} className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all flex-shrink-0">
                {w.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {w.expanded && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="border-t border-white/5 p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { label: "Requested", value: `₹${w.amount.toLocaleString()}`, color: "text-white" },
                      { label: "Fee", value: w.fee > 0 ? `₹${w.fee}` : "FREE", color: w.fee > 0 ? "text-red-400" : "text-green-400" },
                      { label: "Payout", value: `₹${w.netAmount.toLocaleString()}`, color: "text-purple-300" },
                      { label: "Method", value: w.method === "upi" ? "UPI Transfer" : "Bank (IMPS)", color: "text-cyan-400" },
                      ...(w.method === "upi"
                        ? [
                            { label: "UPI ID", value: (w as { upiId: string }).upiId, color: "text-purple-300 font-mono text-xs" },
                            { label: "Name", value: (w as { upiName: string }).upiName, color: "text-white" },
                          ]
                        : [
                            { label: "Account", value: (w as { bankAccount: string }).bankAccount, color: "text-purple-300 font-mono" },
                            { label: "IFSC", value: (w as { bankIfsc: string }).bankIfsc, color: "text-cyan-400 font-mono" },
                            { label: "Name", value: (w as { bankName: string }).bankName, color: "text-white" },
                            { label: "Mobile", value: (w as { bankMobile: string }).bankMobile, color: "text-slate-300 font-mono" },
                          ]
                      ),
                      { label: "Submitted", value: w.time, color: "text-slate-400" },
                    ].map(row => (
                      <div key={row.label} className="bg-black/20 rounded-xl p-3 border border-white/5">
                        <p className="text-xs text-slate-500 font-heading mb-1">{row.label}</p>
                        <p className={cn("font-heading font-bold text-sm truncate", row.color)}>{row.value}</p>
                      </div>
                    ))}
                  </div>

                  {w.status === "pending" && (
                    <div className="flex gap-3">
                      <button onClick={() => approve(w.id)} className="btn-gold flex-1 py-2.5 rounded-xl text-sm font-heading font-bold flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Approve — Pay ₹{w.netAmount.toLocaleString()}
                      </button>
                      <button onClick={() => reject(w.id)} className="btn-danger flex-1 py-2.5 rounded-xl text-sm font-heading font-bold flex items-center justify-center gap-2">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}
                  {w.status === "approved" && <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl"><CheckCircle2 className="w-4 h-4 text-green-400" /><p className="text-sm text-green-400 font-heading font-semibold">Approved — ₹{w.netAmount.toLocaleString()} payout initiated</p></div>}
                  {w.status === "rejected" && <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"><XCircle className="w-4 h-4 text-red-400" /><p className="text-sm text-red-400 font-heading font-semibold">Rejected — funds returned to player wallet</p></div>}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ResultsTab() {
  const { addNotification } = useNotifications();
  const [results, setResults] = useState(() =>
    MOCK_PENDING_RESULTS.map(r => ({ ...r, status: "pending" as "pending" | "approved" | "rejected", expanded: false, prizeOverride: "" }))
  );
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  // Merge player-submitted results from localStorage on mount
  useEffect(() => {
    const stored = loadStoredResults();
    if (stored.length === 0) return;
    setResults(prev => {
      const existingIds = new Set(prev.map(r => r.id));
      const fresh = stored
        .filter(r => !existingIds.has(r.id))
        .map(r => ({ ...r, expanded: false, prizeOverride: "" }));
      return fresh.length > 0 ? [...fresh, ...prev] : prev;
    });
  }, []);

  function approve(id: string) {
    const r = results.find(r => r.id === id);
    if (!r) return;
    const amount = Number(r.prizeOverride) || r.prize_eligible;
    setResults(rs => rs.map(r => r.id === id ? { ...r, status: "approved" } : r));
    addNotification({
      type: "prize_credited",
      title: "Prize Money Credited! 🏆",
      message: `${r.player}'s result verified. ${formatCurrency(amount)} credited for ${r.placement === 1 ? "1st" : r.placement === 2 ? "2nd" : "3rd"} place in ${r.tournament_name}.`,
      meta: { amount, player: r.player },
    });
  }
  function reject(id: string) { setResults(rs => rs.map(r => r.id === id ? { ...r, status: "rejected" } : r)); }
  function toggle(id: string) { setResults(rs => rs.map(r => r.id === id ? { ...r, expanded: !r.expanded } : r)); }
  function setPrize(id: string, val: string) { setResults(rs => rs.map(r => r.id === id ? { ...r, prizeOverride: val } : r)); }

  const filtered = results.filter(r => filter === "all" || r.status === filter);
  const counts = { all: results.length, pending: results.filter(r => r.status === "pending").length, approved: results.filter(r => r.status === "approved").length, rejected: results.filter(r => r.status === "rejected").length };

  const PLACEMENT_ICONS: Record<number, React.ReactNode> = {
    1: <Crown className="w-4 h-4 text-yellow-400" />,
    2: <Medal className="w-4 h-4 text-slate-300" />,
    3: <Award className="w-4 h-4 text-amber-600" />,
  };
  const PLACEMENT_LABELS: Record<number, string> = { 1: "1st Place", 2: "2nd Place", 3: "3rd Place", 4: "Top 10", 5: "Other" };
  const PLACEMENT_COLORS: Record<number, string> = { 1: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10", 2: "text-slate-300 border-slate-400/30 bg-slate-500/10", 3: "text-amber-600 border-amber-700/30 bg-amber-700/10", 4: "text-slate-400 border-white/10 bg-white/5", 5: "text-slate-500 border-white/5 bg-black/20" };

  return (
    <div className="space-y-4">
      {counts.pending > 0 && (
        <div className="flex items-center gap-3 p-3 bg-purple/5 border border-purple/20 rounded-xl">
          <Swords className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <p className="text-sm font-heading text-slate-300">
            <strong className="text-purple-300">{counts.pending} result{counts.pending > 1 ? "s" : ""}</strong> pending review —
            verify screenshots before crediting prize money
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["all", "pending", "approved", "rejected"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("glass-card rounded-xl p-4 text-left border-2 transition-all",
              filter === f ? f === "pending" ? "border-purple/50" : f === "approved" ? "border-green-500/50" : f === "rejected" ? "border-red-500/50" : "border-white/20" : "border-transparent hover:border-white/10"
            )}>
            <p className="text-xs font-heading text-slate-400 mb-1 capitalize">{f}</p>
            <p className={cn("font-display font-black text-2xl", f === "pending" ? "text-purple-300" : f === "approved" ? "text-green-400" : f === "rejected" ? "text-red-400" : "text-white")}>{counts[f]}</p>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && <div className="glass-card rounded-2xl p-10 text-center"><p className="text-slate-500 font-heading">No {filter} results</p></div>}
        {filtered.map(r => (
          <motion.div key={r.id} layout className={cn("glass-card rounded-2xl overflow-hidden border",
            r.status === "approved" ? "border-green-500/20" : r.status === "rejected" ? "border-red-500/15" : "border-purple/20"
          )}>
            {/* Row */}
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-700 to-yellow-700 flex items-center justify-center font-display font-bold text-sm text-white flex-shrink-0">
                {r.player[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-heading font-bold text-white text-sm">{r.player}</p>
                  <span className={cn("text-xs font-heading font-bold border rounded-full px-2 py-0.5",
                    r.status === "approved" ? "border-green-500/30 text-green-400 bg-green-500/10" : r.status === "rejected" ? "border-red-500/30 text-red-400 bg-red-500/10" : "border-purple/30 text-purple-300 bg-purple/10"
                  )}>{r.status.toUpperCase()}</span>
                  <span className={cn("text-xs font-heading border rounded-full px-2 py-0.5 flex items-center gap-1",
                    PLACEMENT_COLORS[r.placement] ?? PLACEMENT_COLORS[5]
                  )}>
                    {PLACEMENT_ICONS[r.placement] ?? <Hash className="w-3 h-3" />}
                    {PLACEMENT_LABELS[r.placement] ?? "Other"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-heading truncate">
                  {r.tournament_name} · {r.kills} kills · {r.time}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-display font-black text-lg text-yellow-400">{formatCurrency(r.prize_eligible)}</p>
                <p className="text-xs text-slate-500 font-heading">eligible</p>
              </div>
              <button onClick={() => toggle(r.id)} className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all flex-shrink-0">
                {r.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Expanded */}
            {r.expanded && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="border-t border-white/5 p-4">
                <div className="flex flex-col md:flex-row gap-5">
                  {/* Screenshot */}
                  <div className="md:w-64 flex-shrink-0">
                    <p className="text-xs text-slate-400 font-heading mb-2 flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> Match Screenshot</p>
                    {r.screenshot ? (
                      <button onClick={() => setLightbox(r.screenshot!)} className="block w-full rounded-xl overflow-hidden border-2 border-purple/20 hover:border-purple/50 transition-all group">
                        <img src={r.screenshot} alt="Match proof" className="w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="bg-purple/20 py-1 text-center"><span className="text-xs text-purple-300 font-heading">Click to enlarge</span></div>
                      </button>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed border-white/10 text-slate-600">
                        <ImageIcon className="w-8 h-8" /><p className="text-xs font-heading">No screenshot uploaded</p>
                      </div>
                    )}
                  </div>

                  {/* Details + actions */}
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Player", value: r.player, color: "text-white" },
                        { label: "Tournament", value: r.tournament_name, color: "text-cyan-400 text-xs" },
                        { label: "Game", value: r.game, color: "text-purple-300" },
                        { label: "Placement", value: PLACEMENT_LABELS[r.placement] ?? "Other", color: r.placement === 1 ? "text-yellow-400" : r.placement === 2 ? "text-slate-300" : "text-amber-600" },
                        { label: "Kills", value: String(r.kills), color: "text-white" },
                        { label: "Match ID", value: r.match_id || "N/A", color: "text-slate-400 font-mono text-xs" },
                        { label: "Submitted", value: r.time, color: "text-slate-400" },
                        { label: "Prize Eligible", value: formatCurrency(r.prize_eligible), color: "text-yellow-400" },
                      ].map(row => (
                        <div key={row.label} className="bg-black/20 rounded-xl p-3 border border-white/5">
                          <p className="text-xs text-slate-500 font-heading mb-1">{row.label}</p>
                          <p className={cn("font-heading font-bold text-sm truncate", row.color)}>{row.value}</p>
                        </div>
                      ))}
                    </div>

                    {r.status === "pending" && (
                      <>
                        {/* Prize override */}
                        <div className="flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-white/8">
                          <Wallet className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-slate-400 font-heading mb-1">Prize amount to credit</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-heading text-slate-300">₹</span>
                              <input
                                type="number"
                                value={r.prizeOverride || r.prize_eligible}
                                onChange={e => setPrize(r.id, e.target.value)}
                                className="gaming-input flex-1 px-2 py-1.5 rounded-lg text-sm w-24"
                                min={0}
                              />
                              <span className="text-xs text-slate-500 font-heading">default: {formatCurrency(r.prize_eligible)}</span>
                            </div>
                          </div>
                        </div>

                        {!r.screenshot && (
                          <div className="flex items-start gap-2 p-2.5 bg-yellow-500/5 border border-yellow-500/15 rounded-xl">
                            <AlertCircle className="w-3.5 h-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-yellow-400/80 font-heading">No screenshot provided — verify via other means before approving.</p>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button onClick={() => approve(r.id)} className="btn-gold flex-1 py-2.5 rounded-xl text-sm font-heading font-bold flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Approve & Credit {formatCurrency(Number(r.prizeOverride) || r.prize_eligible)}
                          </button>
                          <button onClick={() => reject(r.id)} className="btn-danger flex-1 py-2.5 rounded-xl text-sm font-heading font-bold flex items-center justify-center gap-2">
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      </>
                    )}
                    {r.status === "approved" && (
                      <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <p className="text-sm text-green-400 font-heading font-semibold">Approved — {formatCurrency(Number(r.prizeOverride) || r.prize_eligible)} credited to {r.player}'s wallet</p>
                      </div>
                    )}
                    {r.status === "rejected" && (
                      <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <p className="text-sm text-red-400 font-heading font-semibold">Rejected — player notified, no prize credited</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"><X className="w-5 h-5" /></button>
          <img src={lightbox} alt="Match screenshot" className="max-w-2xl w-full max-h-[85vh] object-contain rounded-2xl border border-purple/30" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

function PaymentsTab() {
  const [subTab, setSubTab] = useState<"deposits" | "withdrawals">("deposits");
  const pendingDeposits = MOCK_PENDING_PAYMENTS.length;
  const pendingWithdrawals = MOCK_PENDING_WITHDRAWALS.length;

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {([
          { key: "deposits" as const, label: "Deposits", badge: pendingDeposits, color: "text-green-400", badgeBg: "bg-green-500/20 text-green-400" },
          { key: "withdrawals" as const, label: "Withdrawals", badge: pendingWithdrawals, color: "text-purple-400", badgeBg: "bg-purple/20 text-purple-300" },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setSubTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl font-heading font-bold text-sm transition-all border",
              subTab === tab.key ? "bg-white/10 border-white/20 text-white" : "border-transparent text-slate-400 hover:text-white"
            )}
          >
            {tab.label}
            {tab.badge > 0 && (
              <span className={cn("text-xs font-heading font-bold rounded-full px-1.5 py-0.5 leading-none", tab.badgeBg)}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={subTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
          {subTab === "deposits" ? <DepositsSubTab /> : <WithdrawalsSubTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const BR_SQUADS = [
  "Team MBG", "Rex Gaming", "777 Official", "Jarvis",
  "DFG", "NG Smooth", "DGF Smoke",
];
const PLACEMENT_PTS = [12, 9, 7, 5, 4, 3, 2, 1, 1, 1, 1, 1];

const SCHEDULE_KEY = "elitelobby_br_schedules";
const ALERTED_KEY  = "elitelobby_br_alerted";

function loadSchedules(): Record<number, string> {
  try { return JSON.parse(localStorage.getItem(SCHEDULE_KEY) ?? "{}"); } catch { return {}; }
}
function loadAlerted(): Record<number, boolean> {
  try { return JSON.parse(localStorage.getItem(ALERTED_KEY) ?? "{}"); } catch { return {}; }
}

function useCountdown(isoTarget: string | undefined) {
  const [diff, setDiff] = useState<number | null>(null);
  useEffect(() => {
    if (!isoTarget) { setDiff(null); return; }
    const target = new Date(isoTarget).getTime();
    function tick() { setDiff(target - Date.now()); }
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [isoTarget]);
  return diff;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Starting now!";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function ScheduledMatchRow({ iso, alerted, onClear }: { iso: string; alerted: boolean; onClear: () => void }) {
  const diff = useCountdown(iso);
  const isPast = diff !== null && diff <= 0;
  const isSoon = diff !== null && diff > 0 && diff <= 10 * 60 * 1000;

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-xl px-3 py-2 border text-xs font-heading",
      isPast ? "border-green-500/20 bg-green-500/5" :
      isSoon ? "border-yellow-500/30 bg-yellow-500/8 animate-pulse" :
               "border-purple/20 bg-purple/5"
    )}>
      <Calendar className={cn("w-3.5 h-3.5 shrink-0", isPast ? "text-green-400" : isSoon ? "text-yellow-400" : "text-purple-400")} />
      <span className="text-slate-400">
        {new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}
      </span>
      <span className={cn("font-display font-bold", isPast ? "text-green-400" : isSoon ? "text-yellow-400" : "text-purple-300")}>
        {diff !== null ? (isPast ? "Started" : formatCountdown(diff)) : "—"}
      </span>
      {alerted && (
        <span className="ml-auto flex items-center gap-1 text-yellow-400 text-[10px] font-bold">
          <Bell className="w-3 h-3" /> Ticker alerted
        </span>
      )}
      {isSoon && !alerted && (
        <span className="ml-auto text-yellow-400 text-[10px] font-bold animate-pulse">⚡ Alert firing soon</span>
      )}
      <button onClick={onClear} className="ml-auto text-slate-600 hover:text-red-400 transition-colors shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function BRSeriesTab() {
  const { setRoomId, releaseRoomId, revokeRoomId, getRoomId } = useRoomIds();
  const { pushAnnouncement } = useTicker();

  const [matchStatuses, setMatchStatuses] = useState<Record<number, MatchStatus>>({
    1: "upcoming", 2: "upcoming", 3: "upcoming", 4: "upcoming", 5: "upcoming",
  });
  const [matchSchedules, setMatchSchedules] = useState<Record<number, string>>({});
  const [scheduleForms, setScheduleForms] = useState<Record<number, string>>({});
  const [alerted, setAlerted] = useState<Record<number, boolean>>({});

  // Load persisted schedules on mount
  useEffect(() => {
    setMatchSchedules(loadSchedules());
    setAlerted(loadAlerted());
  }, []);

  // Auto-push ticker alert 10 min before each scheduled match
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setMatchSchedules(prev => {
        setAlerted(prevAlerted => {
          const nextAlerted = { ...prevAlerted };
          let changed = false;
          Object.entries(prev).forEach(([key, iso]) => {
            const matchNum = Number(key);
            if (prevAlerted[matchNum]) return;
            const diff = new Date(iso).getTime() - now;
            if (diff > 0 && diff <= 10 * 60 * 1000) {
              const match = BR_SERIES_MATCHES[matchNum - 1];
              pushAnnouncement(
                `⚠️ ${match?.label ?? `Match ${matchNum}`} starts in ~${Math.ceil(diff / 60000)} min! Get ready.`,
                "warning"
              );
              nextAlerted[matchNum] = true;
              changed = true;
            }
          });
          if (changed) {
            localStorage.setItem(ALERTED_KEY, JSON.stringify(nextAlerted));
          }
          return changed ? nextAlerted : prevAlerted;
        });
        return prev;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [pushAnnouncement]);

  function setSchedule(matchNum: number) {
    const val = scheduleForms[matchNum];
    if (!val) return;
    const next = { ...matchSchedules, [matchNum]: new Date(val).toISOString() };
    setMatchSchedules(next);
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(next));
    // clear old alert so it fires again for new schedule
    const nextAlerted = { ...alerted };
    delete nextAlerted[matchNum];
    setAlerted(nextAlerted);
    localStorage.setItem(ALERTED_KEY, JSON.stringify(nextAlerted));
    toast(`Match ${matchNum} scheduled`);
  }

  function clearSchedule(matchNum: number) {
    const next = { ...matchSchedules };
    delete next[matchNum];
    setMatchSchedules(next);
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(next));
    const nextAlerted = { ...alerted };
    delete nextAlerted[matchNum];
    setAlerted(nextAlerted);
    localStorage.setItem(ALERTED_KEY, JSON.stringify(nextAlerted));
  }
  const [roomForms, setRoomForms] = useState<Record<number, { roomId: string; password: string; open: boolean }>>({
    1: { roomId: "", password: "", open: false },
    2: { roomId: "", password: "", open: false },
    3: { roomId: "", password: "", open: false },
    4: { roomId: "", password: "", open: false },
    5: { roomId: "", password: "", open: false },
  });
  const [matchResults, setMatchResults] = useState<Record<number, SquadResult[]>>({});
  const [resultModal, setResultModal] = useState<number | null>(null);
  const [resultDraft, setResultDraft] = useState<SquadResult[]>([]);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  function updateStatus(matchNum: number, status: MatchStatus) {
    setMatchStatuses(prev => ({ ...prev, [matchNum]: status }));
    if (status === "live") {
      const key = `ff-br-series-m${matchNum}`;
      const entry = getRoomId(key);
      if (entry && !entry.released) releaseRoomId(key);
    }
  }

  function saveRoomId(matchNum: number) {
    const form = roomForms[matchNum];
    if (!form.roomId.trim() || !form.password.trim()) return;
    setRoomId(`ff-br-series-m${matchNum}`, form.roomId.trim(), form.password.trim());
    setRoomForms(prev => ({ ...prev, [matchNum]: { ...prev[matchNum], open: false } }));
    toast(`Match ${matchNum} room ID saved`);
  }

  function toggleRelease(matchNum: number) {
    const key = `ff-br-series-m${matchNum}`;
    const entry = getRoomId(key);
    if (!entry) return;
    if (entry.released) revokeRoomId(key);
    else releaseRoomId(key);
  }

  function openResultEntry(matchNum: number) {
    const existing = matchResults[matchNum] ?? [];
    const draft = BR_SQUADS.map((name, i) => {
      const found = existing.find(s => s.name === name);
      return found ?? { name, placement: i + 1, kills: 0 };
    });
    setResultDraft(draft);
    setResultModal(matchNum);
  }

  function saveResults() {
    if (resultModal === null) return;
    const sorted = [...resultDraft].sort((a, b) => a.placement - b.placement);
    setMatchResults(prev => ({ ...prev, [resultModal]: sorted }));
    setMatchStatuses(prev => ({ ...prev, [resultModal]: "completed" }));
    setResultModal(null);
    toast(`Match ${resultModal} results saved`);
  }

  function toast(msg: string) {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(null), 2500);
  }

  const leaderboard = useMemo(() => {
    const scores: Record<string, { total: number; kills: number; matchCount: number }> = {};
    BR_SQUADS.forEach(name => { scores[name] = { total: 0, kills: 0, matchCount: 0 }; });
    Object.entries(matchResults).forEach(([, squads]) => {
      squads.forEach(sq => {
        if (!scores[sq.name]) scores[sq.name] = { total: 0, kills: 0, matchCount: 0 };
        scores[sq.name].total += (PLACEMENT_PTS[sq.placement - 1] ?? 1) + sq.kills;
        scores[sq.name].kills += sq.kills;
        scores[sq.name].matchCount += 1;
      });
    });
    return Object.entries(scores)
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.total - a.total);
  }, [matchResults]);

  const completedCount = Object.values(matchStatuses).filter(s => s === "completed").length;
  const liveCount = Object.values(matchStatuses).filter(s => s === "live").length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {savedToast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 right-6 z-50 bg-green-500/20 border border-green-500/40 rounded-xl px-4 py-3 flex items-center gap-2 text-green-400 font-heading font-bold text-sm shadow-xl"
          >
            <CheckCircle2 className="w-4 h-4" /> {savedToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Entry Modal */}
      <AnimatePresence>
        {resultModal !== null && (
          <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4" onClick={() => setResultModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-2xl w-full max-w-lg border border-orange-500/30 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <div>
                  <p className="font-display font-black text-lg text-orange-400">Enter Match {resultModal} Results</p>
                  <p className="text-xs text-slate-400 font-heading">{BR_SERIES_MATCHES[resultModal - 1]?.map} · {BR_SERIES_MATCHES[resultModal - 1]?.time_ist} IST</p>
                </div>
                <button onClick={() => setResultModal(null)} className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 max-h-[60vh] overflow-y-auto space-y-2">
                <div className="grid grid-cols-12 gap-2 mb-3 px-1">
                  <span className="col-span-5 text-[10px] font-heading text-slate-500 uppercase tracking-widest">Squad</span>
                  <span className="col-span-4 text-[10px] font-heading text-slate-500 uppercase tracking-widest text-center">Placement</span>
                  <span className="col-span-3 text-[10px] font-heading text-slate-500 uppercase tracking-widest text-center">Kills</span>
                </div>
                {resultDraft.map((squad, idx) => (
                  <div key={squad.name} className="grid grid-cols-12 gap-2 items-center p-2.5 bg-black/20 rounded-xl border border-white/5">
                    <div className="col-span-5 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-700 to-red-800 flex items-center justify-center font-display font-bold text-[10px] text-white flex-shrink-0">
                        {squad.name[0]}
                      </div>
                      <span className="font-heading font-semibold text-white text-xs truncate">{squad.name}</span>
                    </div>
                    <div className="col-span-4 flex items-center justify-center gap-1">
                      <button onClick={() => setResultDraft(d => d.map((s, i) => i === idx ? { ...s, placement: Math.max(1, s.placement - 1) } : s))}
                        className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white text-xs font-bold">−</button>
                      <span className={cn("font-display font-black text-sm w-6 text-center",
                        squad.placement === 1 ? "text-yellow-400" : squad.placement === 2 ? "text-slate-300" : squad.placement === 3 ? "text-amber-600" : "text-slate-400"
                      )}>#{squad.placement}</span>
                      <button onClick={() => setResultDraft(d => d.map((s, i) => i === idx ? { ...s, placement: Math.min(12, s.placement + 1) } : s))}
                        className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white text-xs font-bold">+</button>
                    </div>
                    <div className="col-span-3 flex items-center justify-center gap-1">
                      <button onClick={() => setResultDraft(d => d.map((s, i) => i === idx ? { ...s, kills: Math.max(0, s.kills - 1) } : s))}
                        className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white text-xs font-bold">−</button>
                      <span className="font-display font-black text-sm text-cyan-400 w-5 text-center">{squad.kills}</span>
                      <button onClick={() => setResultDraft(d => d.map((s, i) => i === idx ? { ...s, kills: s.kills + 1 } : s))}
                        className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white text-xs font-bold">+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 border-t border-white/5 flex gap-3">
                <button onClick={() => setResultModal(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 font-heading font-bold text-sm hover:text-white transition-colors">Cancel</button>
                <button onClick={saveResults} className="flex-1 btn-gold py-2.5 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Save & Publish Results
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Series header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-xl text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" /> FF BR Championship Series
          </h2>
          <p className="text-xs text-slate-400 font-heading mt-0.5">Every Saturday &amp; Sunday · 5:30 PM – 2:00 AM IST · ₹100/squad · ₹5,000 prize pool</p>
        </div>
        <div className="flex items-center gap-2">
          {liveCount > 0 && (
            <div className="live-badge border rounded-full px-3 py-1.5 text-xs font-heading font-bold flex items-center gap-1.5">
              <span className="live-dot" /> {liveCount} LIVE
            </div>
          )}
          <div className="bg-purple/10 border border-purple/25 rounded-xl px-3 py-1.5 text-xs font-heading text-slate-300">
            {completedCount}/5 matches done
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Squads Registered", value: `${BR_SQUADS.length}/12`, icon: <Users className="w-4 h-4" />, color: "text-cyan-400" },
          { label: "Entry Revenue", value: formatCurrency(BR_SQUADS.length * 100), icon: <DollarSign className="w-4 h-4" />, color: "text-yellow-400" },
          { label: "Matches Completed", value: `${completedCount}/5`, icon: <Trophy className="w-4 h-4" />, color: "text-green-400" },
          { label: "Prize Pool", value: "₹5,000", icon: <Star className="w-4 h-4" />, color: "text-orange-400" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="glass-card rounded-xl p-4">
            <div className={cn("mb-2", s.color)}>{s.icon}</div>
            <p className="text-xs text-slate-500 font-heading mb-0.5">{s.label}</p>
            <p className={cn("font-display font-black text-xl", s.color)}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Match control cards */}
      <div>
        <h3 className="font-heading font-bold text-white mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" /> Match Management
        </h3>
        <div className="space-y-3">
          {BR_SERIES_MATCHES.map((match) => {
            const status = matchStatuses[match.number];
            const roomKey = `ff-br-series-m${match.number}`;
            const roomEntry = getRoomId(roomKey);
            const form = roomForms[match.number];
            const results = matchResults[match.number];

            return (
              <motion.div key={match.number} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: match.number * 0.05 }}
                className={cn("glass-card rounded-2xl overflow-hidden border transition-all",
                  status === "live" ? "border-red-500/30" : status === "completed" ? "border-green-500/20" : match.isFinal ? "border-yellow-500/25" : "border-purple/20"
                )}
              >
                {/* Match header row */}
                <div className="flex items-center gap-4 p-4">
                  {/* Number */}
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-sm flex-shrink-0",
                    match.isFinal ? "bg-gradient-to-br from-yellow-500/30 to-amber-600/20 text-yellow-400 border border-yellow-500/40"
                    : "bg-purple/15 text-purple-300 border border-purple/25"
                  )}>
                    {match.isFinal ? <Trophy className="w-5 h-5" /> : match.number}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={cn("font-heading font-bold text-sm", match.isFinal ? "text-yellow-400" : "text-white")}>{match.label}</p>
                      {match.isFinal && <span className="text-[10px] font-heading font-bold bg-yellow-500/20 border border-yellow-500/35 text-yellow-400 rounded-full px-2 py-0.5">GRAND FINAL</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-heading">
                      <span className="flex items-center gap-1"><Map className="w-3 h-3 text-slate-500" />{match.map}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-500" />{match.time_ist} IST</span>
                      {roomEntry && <span className="flex items-center gap-1 text-green-400"><Key className="w-3 h-3" /> Room set</span>}
                    </div>
                  </div>

                  {/* Status controls */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Status toggle */}
                    <div className="flex gap-1 bg-black/30 rounded-lg p-0.5">
                      {(["upcoming", "live", "completed"] as MatchStatus[]).map(s => (
                        <button key={s} onClick={() => updateStatus(match.number, s)}
                          className={cn("px-2.5 py-1 rounded-md text-[10px] font-heading font-bold transition-all",
                            status === s
                              ? s === "live" ? "bg-red-500/30 text-red-400 border border-red-500/40"
                              : s === "completed" ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-slate-700 text-slate-300"
                              : "text-slate-600 hover:text-slate-400"
                          )}
                        >
                          {s === "upcoming" ? "•••" : s === "live" ? "LIVE" : "DONE"}
                        </button>
                      ))}
                    </div>

                    {/* Room ID toggle */}
                    <button onClick={() => setRoomForms(prev => ({ ...prev, [match.number]: { ...prev[match.number], open: !prev[match.number].open } }))}
                      className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-heading font-bold transition-all",
                        form.open ? "border-purple-500/50 text-purple-400 bg-purple-500/10" : "border-white/10 text-slate-400 hover:border-purple/30 hover:text-purple-400"
                      )}>
                      <Key className="w-3 h-3" /> Room
                    </button>

                    {/* Results button */}
                    {(status === "live" || status === "completed") && (
                      <button onClick={() => openResultEntry(match.number)}
                        className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-heading font-bold transition-all",
                          results ? "border-green-500/40 text-green-400 bg-green-500/10" : "border-orange-500/40 text-orange-400 bg-orange-500/10 hover:bg-orange-500/20"
                        )}>
                        <Swords className="w-3 h-3" /> {results ? "Edit Results" : "Enter Results"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Schedule row */}
                {status !== "completed" && (
                  <div className="px-4 pb-3 border-t border-white/5 pt-3">
                    {matchSchedules[match.number] ? (
                      <ScheduledMatchRow
                        iso={matchSchedules[match.number]}
                        alerted={!!alerted[match.number]}
                        onClear={() => clearSchedule(match.number)}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <input
                          type="datetime-local"
                          value={scheduleForms[match.number] ?? ""}
                          onChange={e => setScheduleForms(prev => ({ ...prev, [match.number]: e.target.value }))}
                          className="gaming-input flex-1 px-3 py-1.5 rounded-lg text-xs"
                        />
                        <button
                          onClick={() => setSchedule(match.number)}
                          disabled={!scheduleForms[match.number]}
                          className="px-3 py-1.5 rounded-lg border border-purple/40 text-purple-300 text-xs font-heading font-bold hover:bg-purple/10 transition-all disabled:opacity-30 shrink-0"
                        >
                          Set Schedule
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Room ID form */}
                <AnimatePresence>
                  {form.open && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="border-t border-purple/15 p-4 bg-black/20"
                    >
                      <p className="text-xs font-heading font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <Key className="w-3 h-3" /> Room ID for Match {match.number}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="text-[10px] font-heading text-slate-500 uppercase tracking-widest block mb-1.5">Room ID</label>
                          <input
                            type="text"
                            value={form.roomId}
                            onChange={e => setRoomForms(prev => ({ ...prev, [match.number]: { ...prev[match.number], roomId: e.target.value } }))}
                            placeholder="e.g. FF_ELITE_M1"
                            className="gaming-input w-full px-3 py-2 rounded-xl text-sm font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-heading text-slate-500 uppercase tracking-widest block mb-1.5">Password</label>
                          <input
                            type="text"
                            value={form.password}
                            onChange={e => setRoomForms(prev => ({ ...prev, [match.number]: { ...prev[match.number], password: e.target.value } }))}
                            placeholder="e.g. elite123"
                            className="gaming-input w-full px-3 py-2 rounded-xl text-sm font-mono"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => saveRoomId(match.number)}
                          className="btn-primary relative px-4 py-2 rounded-xl text-xs font-heading font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 relative z-10" />
                          <span className="relative z-10">Save Room ID</span>
                        </button>
                        {roomEntry && (
                          <button onClick={() => toggleRelease(match.number)}
                            className={cn("flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-heading font-bold border transition-all",
                              roomEntry.released
                                ? "border-red-500/40 text-red-400 bg-red-500/10 hover:bg-red-500/20"
                                : "border-green-500/40 text-green-400 bg-green-500/10 hover:bg-green-500/20"
                            )}
                          >
                            {roomEntry.released ? <><Lock className="w-3.5 h-3.5" /> Revoke</> : <><Unlock className="w-3.5 h-3.5" /> Release to Players</>}
                          </button>
                        )}
                      </div>
                      {roomEntry && (
                        <div className="mt-3 p-3 bg-black/30 rounded-xl border border-white/5 flex items-center gap-4">
                          <div>
                            <p className="text-[10px] text-slate-500 font-heading">Room ID</p>
                            <p className="font-display font-bold text-yellow-400 text-sm tracking-wider">{roomEntry.room_id}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 font-heading">Password</p>
                            <p className="font-display font-bold text-yellow-400 text-sm tracking-wider">{roomEntry.password}</p>
                          </div>
                          <div className="ml-auto">
                            <span className={cn("text-[10px] font-heading font-bold border rounded-full px-2 py-0.5",
                              roomEntry.released ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-slate-600 text-slate-500"
                            )}>
                              {roomEntry.released ? "RELEASED" : "DRAFT"}
                            </span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Results summary */}
                {results && results.length > 0 && (
                  <div className="border-t border-green-500/15 p-4 bg-green-500/3">
                    <p className="text-[10px] font-heading font-bold text-green-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3" /> Match {match.number} Results Saved
                    </p>
                    <div className="flex gap-3 overflow-x-auto">
                      {results.slice(0, 3).map((sq) => (
                        <div key={sq.name} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs flex-shrink-0",
                          sq.placement === 1 ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
                          : sq.placement === 2 ? "border-slate-400/30 bg-slate-500/10 text-slate-300"
                          : "border-amber-700/30 bg-amber-700/10 text-amber-600"
                        )}>
                          {sq.placement === 1 ? "🥇" : sq.placement === 2 ? "🥈" : "🥉"}
                          <span className="font-heading font-bold">{sq.name}</span>
                          <span className="text-slate-500">·</span>
                          <span className="font-mono">{sq.kills}K</span>
                        </div>
                      ))}
                      {results.length > 3 && (
                        <span className="text-xs text-slate-500 font-heading self-center">+{results.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Series Leaderboard */}
      <div>
        <h3 className="font-heading font-bold text-white mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" /> Live Series Leaderboard
          {completedCount === 0 && <span className="text-xs text-slate-500 font-heading font-normal ml-1">(updates after match results are saved)</span>}
        </h3>
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full gaming-table">
            <thead>
              <tr>
                <th className="text-center w-10">Rank</th>
                <th className="text-left">Squad</th>
                <th className="text-center hidden sm:table-cell">Matches</th>
                <th className="text-center">Kills</th>
                <th className="text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((squad, i) => {
                const rank = i + 1;
                return (
                  <tr key={squad.name} className={cn(rank <= 2 && completedCount > 0 ? rank === 1 ? "bg-yellow-500/5" : "bg-slate-500/5" : "")}>
                    <td className="text-center">
                      {rank === 1 && completedCount > 0 ? (
                        <Crown className="w-4 h-4 text-yellow-400 mx-auto" />
                      ) : rank === 2 && completedCount > 0 ? (
                        <Medal className="w-4 h-4 text-slate-300 mx-auto" />
                      ) : (
                        <span className={cn("font-display font-black text-xs", rank <= 3 && completedCount > 0 ? "text-amber-600" : "text-slate-600")}>#{rank}</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-700 to-red-800 flex items-center justify-center font-display font-bold text-xs text-white flex-shrink-0">
                          {squad.name[0]}
                        </div>
                        <span className={cn("font-heading font-semibold text-sm", rank === 1 && completedCount > 0 ? "text-yellow-400" : rank === 2 && completedCount > 0 ? "text-slate-300" : "text-white")}>
                          {squad.name}
                        </span>
                      </div>
                    </td>
                    <td className="text-center hidden sm:table-cell">
                      <span className="font-heading text-xs text-slate-400">{squad.matchCount}/{completedCount || "—"}</span>
                    </td>
                    <td className="text-center">
                      <span className="font-display font-bold text-xs text-cyan-400">{squad.kills > 0 ? squad.kills : "—"}</span>
                    </td>
                    <td className="text-right">
                      <span className={cn("font-display font-black text-sm", squad.total > 0 ? rank === 1 ? "text-yellow-400" : rank === 2 ? "text-slate-300" : "text-white" : "text-slate-600")}>
                        {squad.total > 0 ? squad.total : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {completedCount === 0 && (
            <div className="px-6 pb-5 pt-2 text-center">
              <p className="text-xs text-slate-600 font-heading">No match results yet — set a match to Live, then enter results to see the leaderboard update</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [pendingResultsBadge, setPendingResultsBadge] = useState(MOCK_PENDING_RESULTS.length);
  const { announcements, pushAnnouncement, removeAnnouncement } = useTicker();
  const [tickerText, setTickerText] = useState("");
  const [tickerType, setTickerType] = useState<TickerType>("info");
  const [tickerSent, setTickerSent] = useState(false);

  function handleSendTicker() {
    if (!tickerText.trim()) return;
    pushAnnouncement(tickerText, tickerType);
    setTickerText("");
    setTickerSent(true);
    setTimeout(() => setTickerSent(false), 3000);
  }
  const totalRegs = MOCK_REGISTRATIONS.length;

  // Update badge to include localStorage submissions
  useEffect(() => {
    const stored = loadStoredResults();
    const storedIds = new Set(stored.map(r => r.id));
    const mockIds = new Set(MOCK_PENDING_RESULTS.map(r => r.id));
    const uniqueStored = stored.filter(r => !mockIds.has(r.id)).length;
    setPendingResultsBadge(MOCK_PENDING_RESULTS.length + uniqueStored);
  }, []);

  const TABS: { key: AdminTab; label: string; icon: React.ReactNode; badge?: number; highlight?: boolean }[] = [
    { key: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { key: "tournaments", label: "Tournaments", icon: <Trophy className="w-4 h-4" /> },
    { key: "brseries", label: "BR Series", icon: <Flame className="w-4 h-4" />, highlight: true },
    { key: "registrations", label: "Registrations", icon: <ClipboardList className="w-4 h-4" />, badge: totalRegs },
    { key: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
    { key: "payments", label: "Payments", icon: <DollarSign className="w-4 h-4" /> },
    { key: "results", label: "Results", icon: <Swords className="w-4 h-4" />, badge: pendingResultsBadge },
    { key: "announcements", label: "Announce", icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div className="pt-24 pb-16 px-4 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-purple-700 rounded-xl flex items-center justify-center glow-purple">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-white">
              ADMIN <span className="gradient-text">PANEL</span>
            </h1>
            <p className="text-slate-400 text-sm font-heading">Manage tournaments, users, and payments</p>
          </div>
          <div className="ml-auto flex items-center gap-2 live-badge border rounded-full px-3 py-1.5 text-xs font-heading font-semibold">
            <Shield className="w-3 h-3" /> ADMIN ACCESS
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-black/30 rounded-xl p-1 mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-heading font-bold tracking-wide transition-all whitespace-nowrap",
                activeTab === tab.key
                  ? tab.highlight ? "bg-gradient-to-r from-orange-600 to-red-600 text-white" : "bg-purple-600 text-white"
                  : tab.highlight ? "text-orange-400 hover:text-orange-300" : "text-slate-400 hover:text-white"
              )}
            >
              {tab.icon} {tab.label}
              {tab.badge != null && (
                <span className="bg-white/15 text-white text-[10px] font-heading font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "tournaments" && <TournamentsTab />}
          {activeTab === "brseries" && <BRSeriesTab />}
          {activeTab === "registrations" && <RegistrationsTab />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "payments" && <PaymentsTab />}
          {activeTab === "results" && <ResultsTab />}
          {activeTab === "announcements" && (
            <div className="space-y-6">
              {/* Compose */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Bell className="w-4 h-4 text-purple-400" />
                  <h3 className="font-heading font-bold text-white">Push to Live Ticker</h3>
                  <span className="ml-auto text-xs text-slate-500 font-heading">Appears instantly at the top of every page</span>
                </div>
                <div className="space-y-4 max-w-xl">
                  <div>
                    <label className="font-heading font-semibold text-xs tracking-widest text-slate-300 uppercase block mb-2">Message</label>
                    <input
                      type="text"
                      value={tickerText}
                      onChange={(e) => setTickerText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendTicker()}
                      placeholder="e.g. FF BR Series Match 4 starting in 10 minutes!"
                      className="gaming-input w-full px-4 py-3 rounded-xl text-sm"
                      maxLength={120}
                    />
                    <p className="text-slate-600 text-xs mt-1 text-right">{tickerText.length}/120</p>
                  </div>
                  <div>
                    <label className="font-heading font-semibold text-xs tracking-widest text-slate-300 uppercase block mb-2">Type</label>
                    <div className="flex gap-2 flex-wrap">
                      {([
                        { key: "info",    label: "Info",    color: "text-cyan-400",   bg: "bg-cyan-600/20",   border: "border-cyan-500/40" },
                        { key: "warning", label: "Warning", color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/40" },
                        { key: "success", label: "Success", color: "text-green-400",  bg: "bg-green-600/20",  border: "border-green-500/40" },
                        { key: "live",    label: "🔴 Live", color: "text-red-400",    bg: "bg-red-600/20",    border: "border-red-500/40" },
                      ] as const).map((t) => (
                        <button
                          key={t.key}
                          onClick={() => setTickerType(t.key)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-heading font-bold border transition-all",
                            tickerType === t.key
                              ? `${t.bg} ${t.border} ${t.color}`
                              : "border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-400"
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleSendTicker}
                    disabled={!tickerText.trim()}
                    className={cn(
                      "relative px-6 py-3 rounded-xl font-heading font-bold text-sm flex items-center gap-2 transition-all",
                      tickerSent
                        ? "bg-green-600/30 border border-green-500/40 text-green-400"
                        : "btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                    )}
                  >
                    {tickerSent ? (
                      <><CheckCircle2 className="w-4 h-4" /> Sent to Ticker!</>
                    ) : (
                      <><Send className="w-4 h-4 relative z-10" /><span className="relative z-10">Push to Live Ticker</span></>
                    )}
                  </button>
                </div>
              </div>

              {/* Sent announcements */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-bold text-white">Active Ticker Messages</h3>
                  <span className="font-display text-xs text-slate-500">{announcements.length} active</span>
                </div>
                {announcements.length === 0 ? (
                  <div className="text-center py-8 text-slate-600">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-heading text-sm">No active announcements</p>
                    <p className="font-heading text-xs mt-1">Messages you push will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {announcements.map((a) => {
                      const typeColor =
                        a.type === "live"    ? "text-red-400 border-red-500/20 bg-red-500/5" :
                        a.type === "warning" ? "text-yellow-400 border-yellow-500/20 bg-yellow-500/5" :
                        a.type === "success" ? "text-green-400 border-green-500/20 bg-green-500/5" :
                                               "text-cyan-400 border-cyan-500/20 bg-cyan-500/5";
                      return (
                        <div key={a.id} className={cn("flex items-center gap-3 rounded-xl px-4 py-3 border", typeColor)}>
                          <span className={cn("font-display text-[10px] font-bold tracking-widest uppercase shrink-0", typeColor.split(" ")[0])}>
                            {a.type}
                          </span>
                          <span className="font-heading text-sm text-slate-300 flex-1 truncate">{a.text}</span>
                          <span className="font-heading text-xs text-slate-600 shrink-0">
                            {new Date(a.sentAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <button
                            onClick={() => removeAnnouncement(a.id)}
                            className="shrink-0 text-slate-600 hover:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
