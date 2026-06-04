"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TournamentCard } from "@/components/ui/tournament-card";
import { MOCK_USER, MOCK_TOURNAMENTS, MOCK_NOTIFICATIONS, MOCK_TRANSACTIONS } from "@/lib/mock-data";
import { Trophy, Zap, Wallet, Bell, Settings, Target, Swords, Crown, TrendingUp, Clock, CheckCircle2, XCircle, ArrowUpRight, ArrowDownLeft, Plus, Shield, UserCog } from "lucide-react";
import { cn, formatCurrency, getRankColor } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { useUser } from "@clerk/nextjs";
import { useWallet } from "@/lib/wallet-context";

function ProfileCard() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<{ inGameName: string; uid: string; game: string } | null>(null);
  const progressToNext = 82;

  useEffect(() => {
    if (!user) return;
    const stored = localStorage.getItem(`elitelobby_profile_${user.id}`);
    if (stored) setProfile(JSON.parse(stored));
  }, [user]);

  const displayName = profile?.inGameName || user?.firstName || user?.username || MOCK_USER.username;
  const displayUid = profile?.uid || MOCK_USER.game_id;
  const avatarLetter = displayName[0]?.toUpperCase() || "P";

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-2xl font-display font-black text-white">
            {avatarLetter}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-surface" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-display font-bold text-lg text-white truncate">{displayName}</h2>
            <Shield className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-slate-400 text-xs font-heading mb-2">
            {profile?.game && <span className="text-purple-400 mr-2">{profile.game}</span>}
            UID: <span className="text-cyan-400 font-mono">{displayUid}</span>
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <div className={cn("inline-flex items-center gap-1.5 border rounded-full px-3 py-1 text-xs font-heading font-bold", `rank-${MOCK_USER.rank.toLowerCase()}`)}>
              <Crown className="w-3 h-3" />
              {MOCK_USER.rank} Rank
            </div>
            {!profile && (
              <Link
                href="/profile-setup"
                className="inline-flex items-center gap-1 border border-amber-500/30 bg-amber-500/10 text-amber-400 rounded-full px-2.5 py-1 text-xs font-heading font-semibold hover:bg-amber-500/20 transition-colors"
              >
                <UserCog className="w-3 h-3" />
                Set up profile
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Rank progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 font-heading">Rank Progress</span>
          <span className="text-xs font-display font-bold text-purple-400">{MOCK_USER.rank_points.toLocaleString()} RP</span>
        </div>
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressToNext}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1 font-heading">{progressToNext}% to Platinum</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Tournaments", value: MOCK_USER.tournaments_played, icon: <Swords className="w-4 h-4" />, color: "text-cyan-400" },
          { label: "Wins", value: MOCK_USER.tournaments_won, icon: <Trophy className="w-4 h-4" />, color: "text-yellow-400" },
          { label: "Kills", value: MOCK_USER.kills, icon: <Target className="w-4 h-4" />, color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="bg-black/30 rounded-xl p-3 text-center border border-white/5">
            <div className={cn("mx-auto mb-1 flex justify-center", s.color)}>{s.icon}</div>
            <div className={cn("font-display font-bold text-lg", s.color)}>{s.value}</div>
            <div className="text-xs text-slate-500 font-heading">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WalletCard() {
  const { balance } = useWallet();
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-yellow-400" />
          <h3 className="font-heading font-bold text-white">Wallet</h3>
        </div>
        <Link href="/wallet" className="text-xs text-purple-400 hover:underline font-heading">View all</Link>
      </div>

      <div className="bg-gradient-to-r from-purple-900/40 to-cyan-900/30 rounded-xl p-4 mb-4 border border-purple/20">
        <p className="text-xs text-slate-400 font-heading mb-1">Available Balance</p>
        <p className="font-display font-black text-3xl gradient-text-gold">₹{balance.toLocaleString()}</p>
      </div>

      <div className="flex gap-2 mb-5">
        <Link href="/wallet/deposit" className="btn-gold flex-1 py-2 rounded-xl text-xs font-heading font-bold text-center flex items-center justify-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Add Funds
        </Link>
        <Link href="/wallet/withdraw" className="btn-secondary flex-1 py-2 rounded-xl text-xs font-heading font-bold text-center flex items-center justify-center gap-1">
          <ArrowUpRight className="w-3.5 h-3.5" /> Withdraw
        </Link>
      </div>

      {/* Recent transactions */}
      <div className="space-y-2">
        {MOCK_TRANSACTIONS.slice(0, 3).map((tx) => (
          <div key={tx.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-2">
              {tx.amount > 0
                ? <ArrowDownLeft className="w-4 h-4 text-green-400" />
                : <ArrowUpRight className="w-4 h-4 text-red-400" />
              }
              <div>
                <p className="text-xs font-heading font-semibold text-white capitalize">{tx.type.replace("_", " ")}</p>
                <p className="text-xs text-slate-500 font-heading">{format(parseISO(tx.created_at), "MMM d, h:mm a")}</p>
              </div>
            </div>
            <span className={cn("font-display font-bold text-sm", tx.amount > 0 ? "text-green-400" : "text-red-400")}>
              {tx.amount > 0 ? "+" : ""}₹{Math.abs(tx.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsPanel() {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-400" />
          <h3 className="font-heading font-bold text-white">Notifications</h3>
          <span className="bg-red-500 text-white text-xs font-display font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {MOCK_NOTIFICATIONS.filter(n => !n.read).length}
          </span>
        </div>
      </div>
      <div className="space-y-3">
        {MOCK_NOTIFICATIONS.map((n) => (
          <div key={n.id} className={cn("p-3 rounded-xl border transition-colors", n.read ? "border-white/5 bg-black/20" : "border-purple/20 bg-purple/5")}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className={cn("text-sm font-heading font-semibold", n.read ? "text-slate-300" : "text-white")}>{n.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
              </div>
              {!n.read && <div className="w-2 h-2 bg-purple-400 rounded-full mt-1.5 flex-shrink-0" />}
            </div>
            <p className="text-xs text-slate-500 mt-2 font-heading">{format(parseISO(n.created_at), "MMM d, h:mm a")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"joined" | "history">("joined");
  const joinedTournaments = MOCK_TOURNAMENTS.filter(t => t.status !== "completed").slice(0, 3);
  const historyTournaments = MOCK_TOURNAMENTS.filter(t => t.status === "completed");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/auth/login");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="pt-24 pb-16 px-4 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 px-4 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <p className="text-slate-400 text-sm font-heading">Welcome back, warrior</p>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-white">
              PLAYER <span className="gradient-text">DASHBOARD</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/tournaments" className="btn-primary relative px-4 py-2 rounded-xl text-sm font-heading font-bold flex items-center gap-1.5">
              <Zap className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Join Battle</span>
            </Link>
          </div>
        </motion.div>

        {/* Total winnings banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rgb-border glass-card rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-heading">Total Winnings All Time</p>
              <p className="font-display font-black text-2xl gradient-text-gold">₹{MOCK_USER.total_winnings.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-400 text-sm font-heading">
            <TrendingUp className="w-4 h-4" />
            <span>+₹1,500 this week</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar */}
          <div className="space-y-6">
            <ProfileCard />
            <WalletCard />
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <NotificationsPanel />

            {/* Tournament tabs */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <h3 className="font-heading font-bold text-white flex-1">My Tournaments</h3>
                <div className="flex items-center gap-1 bg-black/30 rounded-xl p-1">
                  {[{ key: "joined", label: "Active" }, { key: "history", label: "History" }].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-heading font-bold tracking-wide transition-all",
                        activeTab === tab.key ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === "joined" ? (
                joinedTournaments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {joinedTournaments.map((t, i) => (
                      <TournamentCard key={t.id} tournament={t} index={i} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Swords className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 font-heading">No active tournaments</p>
                    <Link href="/tournaments" className="btn-primary relative mt-4 inline-block px-6 py-2 rounded-xl text-sm font-heading font-bold">
                      <span className="relative z-10">Browse Tournaments</span>
                    </Link>
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  {historyTournaments.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-purple/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{t.game === "Free Fire" ? "🔥" : t.game === "BGMI" ? "🎯" : "⚡"}</span>
                        <div>
                          <p className="font-heading font-semibold text-white text-sm">{t.title}</p>
                          <p className="text-xs text-slate-400">{t.game_mode} · {t.map_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-heading">Entry: ₹{t.entry_fee}</p>
                        <span className="text-xs status-completed border rounded-full px-2 py-0.5 font-heading font-semibold">Ended</span>
                      </div>
                    </div>
                  ))}
                  {historyTournaments.length === 0 && (
                    <p className="text-center text-slate-500 font-heading py-8">No tournament history yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
