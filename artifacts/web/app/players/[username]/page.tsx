"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { MOCK_LEADERBOARD, MOCK_REGISTRATIONS, MOCK_TOURNAMENTS, MOCK_RECENT_WINNERS } from "@/lib/mock-data";
import { formatCurrency, getGameIcon, getRankColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Trophy, Target, Swords, TrendingUp, TrendingDown,
  Minus, Crown, Shield, Star, Zap, Calendar, ExternalLink,
  CheckCircle2, Flame, Medal, Award,
} from "lucide-react";

const PLAYER_PROFILES: Record<string, {
  bio: string;
  joined: string;
  game_uid: string;
  rank_tier: string;
  rank_points: number;
  tournaments_played: number;
  country: string;
  discord?: string;
  youtube?: string;
  badges: string[];
}> = {
  "NightShade_X": {
    bio: "Ranked #1 in India. BGMI specialist with a flawless aim and clutch plays. Been grinding since Season 1.",
    joined: "Jan 2024",
    game_uid: "BG-88241",
    rank_tier: "Grandmaster",
    rank_points: 9840,
    tournaments_played: 94,
    country: "🇮🇳",
    discord: "NightShade#0001",
    youtube: "@NightShadeX",
    badges: ["Champion", "Top Fragger", "Veteran", "Hat-Trick"],
  },
  "ShadowKing99": {
    bio: "Free Fire IGL and squad leader. Mastering every map — Bermuda is home.",
    joined: "Feb 2024",
    game_uid: "FF-72910",
    rank_tier: "Grandmaster",
    rank_points: 8920,
    tournaments_played: 85,
    country: "🇮🇳",
    discord: "ShadowKing#9900",
    badges: ["Champion", "Strategist", "Veteran"],
  },
  "ProSniper_Z": {
    bio: "Valorant main. Agent: Jett. Headshots are my language.",
    joined: "Mar 2024",
    game_uid: "VL-55001",
    rank_tier: "Master",
    rank_points: 7650,
    tournaments_played: 72,
    country: "🇮🇳",
    discord: "ProSniper#2233",
    badges: ["Top Fragger", "Sharpshooter", "Veteran"],
  },
  "EliteForce77": {
    bio: "BGMI squad captain. Rush is my style — no camping allowed.",
    joined: "Apr 2024",
    game_uid: "BG-20938",
    rank_tier: "Master",
    rank_points: 6870,
    tournaments_played: 65,
    country: "🇮🇳",
    badges: ["Champion", "Rush King"],
  },
  "GhostRider_M": {
    bio: "COD Mobile duo specialist. Speed and precision — always first drop.",
    joined: "Apr 2024",
    game_uid: "CM-71400",
    rank_tier: "Diamond",
    rank_points: 5820,
    tournaments_played: 58,
    country: "🇮🇳",
    badges: ["Speed Demon", "Duo Expert"],
  },
  "ThunderBolt_S": {
    bio: "Free Fire — survival first. Consistent top 3 every match.",
    joined: "May 2024",
    game_uid: "FF-77321",
    rank_tier: "Diamond",
    rank_points: 5010,
    tournaments_played: 52,
    country: "🇮🇳",
    badges: ["Survivor", "Consistent"],
  },
  "NeonAssassin": {
    bio: "PUBG Mobile — Miramar sniper. Long range, no mercy.",
    joined: "May 2024",
    game_uid: "PB-48871",
    rank_tier: "Diamond",
    rank_points: 4590,
    tournaments_played: 48,
    country: "🇮🇳",
    badges: ["Sharpshooter", "Sniper Elite"],
  },
  "RedViper_99": {
    bio: "Valorant entry fragger. First blood is non-negotiable.",
    joined: "Jun 2024",
    game_uid: "VL-66109",
    rank_tier: "Platinum",
    rank_points: 3880,
    tournaments_played: 42,
    country: "🇮🇳",
    badges: ["Entry Fragger", "First Blood"],
  },
  "CyberHawk_V2": {
    bio: "BGMI all-rounder. Adapts to every squad and zone.",
    joined: "Jun 2024",
    game_uid: "BG-10023",
    rank_tier: "Platinum",
    rank_points: 3210,
    tournaments_played: 36,
    country: "🇮🇳",
    badges: ["All-Rounder"],
  },
  "StormRaider_K": {
    bio: "Free Fire squad player. Always pushing, never stopping.",
    joined: "Jul 2024",
    game_uid: "FF-33891",
    rank_tier: "Gold",
    rank_points: 2540,
    tournaments_played: 30,
    country: "🇮🇳",
    badges: ["Rising Star"],
  },
};

const RANK_TIERS = [
  { tier: "Bronze",      min: 0,    max: 999,   color: "text-amber-700",  bg: "bg-amber-700/20",  border: "border-amber-700/40" },
  { tier: "Silver",      min: 1000, max: 1999,  color: "text-slate-300",  bg: "bg-slate-500/20",  border: "border-slate-400/40" },
  { tier: "Gold",        min: 2000, max: 2999,  color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/40" },
  { tier: "Platinum",    min: 3000, max: 4499,  color: "text-cyan-400",   bg: "bg-cyan-500/20",   border: "border-cyan-500/40" },
  { tier: "Diamond",     min: 4500, max: 5999,  color: "text-blue-400",   bg: "bg-blue-500/20",   border: "border-blue-500/40" },
  { tier: "Master",      min: 6000, max: 7999,  color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/40" },
  { tier: "Grandmaster", min: 8000, max: 99999, color: "text-red-400",    bg: "bg-red-500/20",    border: "border-red-500/40" },
];

const BADGE_ICONS: Record<string, string> = {
  "Champion": "🏆", "Top Fragger": "🎯", "Veteran": "⚔️", "Hat-Trick": "🎩",
  "Strategist": "🧠", "Rush King": "⚡", "Speed Demon": "💨", "Duo Expert": "🤝",
  "Survivor": "🛡️", "Consistent": "📈", "Sharpshooter": "🔭", "Sniper Elite": "🎖️",
  "Entry Fragger": "💥", "First Blood": "🩸", "All-Rounder": "🌟", "Rising Star": "⭐",
};

const PLACEMENT_EMOJIS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function PlayerProfilePage() {
  const { username } = useParams<{ username: string }>();

  const leaderboardEntry = MOCK_LEADERBOARD.find(
    p => p.username.toLowerCase() === username?.toLowerCase()
  );
  const profile = PLAYER_PROFILES[username ?? ""];

  if (!leaderboardEntry || !profile) {
    return (
      <div className="pt-24 pb-16 px-4 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">👾</div>
          <h1 className="font-display font-bold text-2xl text-white mb-2">PLAYER NOT FOUND</h1>
          <p className="text-slate-400 font-heading text-sm mb-6">
            This player doesn't exist or hasn't registered on EliteLobby yet.
          </p>
          <Link href="/leaderboard" className="btn-primary px-6 py-3 rounded-xl font-heading font-bold text-sm">
            ← Back to Leaderboard
          </Link>
        </div>
      </div>
    );
  }

  const tierInfo = RANK_TIERS.find(t => t.tier === profile.rank_tier) ?? RANK_TIERS[2];
  const nextTier = RANK_TIERS[RANK_TIERS.indexOf(tierInfo) + 1];
  const tierProgress = nextTier
    ? Math.min(100, Math.round(((profile.rank_points - tierInfo.min) / (nextTier.min - tierInfo.min)) * 100))
    : 100;

  const recentWins = MOCK_RECENT_WINNERS.filter(w => w.username === leaderboardEntry.username);
  const tournamentHistory = MOCK_REGISTRATIONS
    .filter(r => r.username === leaderboardEntry.username)
    .map(r => {
      const t = MOCK_TOURNAMENTS.find(t => t.id === r.tournament_id);
      const win = recentWins.find(w => w.tournament === t?.title);
      return t ? { ...r, tournament: t, placement: win?.position ?? null, prize: win?.prize ?? null } : null;
    })
    .filter(Boolean) as Array<{
      id: string; tournament_id: string; username: string; game_uid: string; fee_paid: number;
      registered_at: string; payment_status: string;
      tournament: typeof MOCK_TOURNAMENTS[0];
      placement: number | null; prize: number | null;
    }>;

  const winRate = Math.round((leaderboardEntry.wins / profile.tournaments_played) * 100);
  const avgKills = Math.round(leaderboardEntry.kills / profile.tournaments_played);

  const statCards = [
    { icon: <Crown className="w-5 h-5" />, label: "Global Rank", value: `#${leaderboardEntry.rank}`, color: "text-yellow-400" },
    { icon: <Trophy className="w-5 h-5" />, label: "Total Wins", value: leaderboardEntry.wins.toString(), color: "text-green-400" },
    { icon: <Target className="w-5 h-5" />, label: "Total Kills", value: leaderboardEntry.kills.toLocaleString(), color: "text-red-400" },
    { icon: <Zap className="w-5 h-5" />, label: "Earnings", value: formatCurrency(leaderboardEntry.earnings), color: "text-amber-400" },
  ];

  return (
    <div className="pt-24 pb-16 px-4 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(124,58,237,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.04) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="max-w-6xl mx-auto relative">

        {/* Back */}
        <Link href="/leaderboard" className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 font-heading text-sm transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Leaderboard
        </Link>

        {/* ── HERO BANNER ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl overflow-hidden mb-6"
        >
          {/* Banner gradient */}
          <div className="relative h-32 md:h-40 bg-gradient-to-br from-purple-900/70 via-indigo-900/50 to-cyan-900/30 overflow-hidden">
            <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(124,58,237,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.1) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[8rem] opacity-10 select-none">{getGameIcon(leaderboardEntry.game)}</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Rank badge top-right */}
            <div className={cn("absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-heading font-bold text-xs", tierInfo.bg, tierInfo.border, tierInfo.color)}>
              <Shield className="w-3.5 h-3.5" />
              {profile.rank_tier.toUpperCase()}
            </div>
          </div>

          {/* Avatar row */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10 sm:-mt-12">
              {/* Avatar */}
              <div className={cn("w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-black flex items-center justify-center font-display font-black text-3xl sm:text-4xl text-white flex-shrink-0 bg-gradient-to-br from-purple-600 to-cyan-600")}>
                {leaderboardEntry.username[0]}
              </div>

              {/* Name + info */}
              <div className="flex-1 min-w-0 sm:mb-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="font-display font-black text-xl sm:text-2xl text-white">{leaderboardEntry.username}</h1>
                  <span className="text-base">{profile.country}</span>
                  <span className="flex items-center gap-1 text-xs text-cyan-400 font-heading bg-cyan-500/10 border border-cyan-500/25 rounded-full px-2 py-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-wrap text-xs text-slate-400 font-heading">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined {profile.joined}</span>
                  <span className="flex items-center gap-1">🎮 {leaderboardEntry.game}</span>
                  <span className="flex items-center gap-1">🔑 {profile.game_uid}</span>
                </div>
                <p className="text-sm text-slate-300 font-heading mt-2 leading-relaxed max-w-lg">{profile.bio}</p>
              </div>

              {/* Social links */}
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                {profile.discord && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-heading bg-white/5 rounded-lg px-3 py-1.5 border border-white/8">
                    💬 {profile.discord}
                  </div>
                )}
                {profile.youtube && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-heading bg-white/5 rounded-lg px-3 py-1.5 border border-white/8">
                    ▶ {profile.youtube}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statCards.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="glass-card rounded-2xl p-5"
            >
              <div className={cn("mb-2", s.color)}>{s.icon}</div>
              <p className="text-xs text-slate-400 font-heading mb-0.5">{s.label}</p>
              <p className={cn("font-display font-black text-2xl", s.color)}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT: Tournament History + Performance ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Performance bars */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
              className="glass-card rounded-2xl p-5"
            >
              <h3 className="font-heading font-bold text-white mb-4 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" /> Performance Stats
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {[
                  { label: "Win Rate", value: `${winRate}%`, pct: winRate, color: "from-green-500 to-emerald-400" },
                  { label: "Avg Kills / Match", value: avgKills.toString(), pct: Math.min(100, avgKills * 3.5), color: "from-red-500 to-rose-400" },
                  { label: "Tournaments Played", value: profile.tournaments_played.toString(), pct: Math.min(100, profile.tournaments_played), color: "from-purple-500 to-violet-400" },
                  { label: "Rank Points", value: profile.rank_points.toLocaleString(), pct: Math.min(100, (profile.rank_points / 10000) * 100), color: "from-yellow-500 to-amber-400" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-400 font-heading">{stat.label}</span>
                      <span className="text-xs font-display font-bold text-white">{stat.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className={cn("h-full rounded-full bg-gradient-to-r", stat.color)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Trend */}
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                {leaderboardEntry.trend === "up" ? (
                  <><TrendingUp className="w-4 h-4 text-green-400" /><span className="text-xs text-green-400 font-heading font-semibold">Trending up this season</span></>
                ) : leaderboardEntry.trend === "down" ? (
                  <><TrendingDown className="w-4 h-4 text-red-400" /><span className="text-xs text-red-400 font-heading font-semibold">Rank dropped this season</span></>
                ) : (
                  <><Minus className="w-4 h-4 text-slate-400" /><span className="text-xs text-slate-400 font-heading font-semibold">Stable rank this season</span></>
                )}
              </div>
            </motion.div>

            {/* Tournament history */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl overflow-hidden"
            >
              <div className="px-5 py-3.5 border-b border-purple/15 flex items-center justify-between">
                <h3 className="font-heading font-bold text-white flex items-center gap-2">
                  <Swords className="w-4 h-4 text-purple-400" /> Tournament History
                </h3>
                <span className="text-xs text-slate-500 font-heading">{tournamentHistory.length} recent</span>
              </div>

              {tournamentHistory.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {tournamentHistory.map((entry, i) => (
                    <motion.div key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.06 }}
                      className="flex items-center gap-4 p-4 hover:bg-white/3 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-800 to-indigo-800 flex items-center justify-center text-xl flex-shrink-0">
                        {getGameIcon(entry.tournament.game)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-bold text-white text-sm truncate">{entry.tournament.title}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-heading flex-wrap">
                          <span>{entry.tournament.game}</span>
                          <span>·</span>
                          <span>{entry.tournament.game_mode}</span>
                          <span>·</span>
                          <span className="capitalize">{entry.tournament.status}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {entry.placement ? (
                          <span className={cn("text-xs font-heading font-bold flex items-center gap-1",
                            entry.placement === 1 ? "text-yellow-400" : entry.placement === 2 ? "text-slate-300" : "text-amber-600"
                          )}>
                            {PLACEMENT_EMOJIS[entry.placement]} {entry.placement === 1 ? "1st" : entry.placement === 2 ? "2nd" : "3rd"}
                          </span>
                        ) : (
                          <span className="text-xs font-heading text-slate-500">Participated</span>
                        )}
                        {entry.prize ? (
                          <span className="text-xs font-display font-bold text-amber-400">{formatCurrency(entry.prize)}</span>
                        ) : (
                          <span className="text-xs text-slate-600 font-heading">₹{entry.fee_paid} entry</span>
                        )}
                      </div>
                      <Link href={`/tournaments/${entry.tournament_id}`}
                        className="flex items-center justify-center w-7 h-7 rounded-lg border border-white/10 hover:border-purple/40 transition-colors flex-shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <p className="text-slate-500 font-heading text-sm">No tournament history available</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* ── RIGHT: Rank + Badges ── */}
          <div className="space-y-5">

            {/* Rank progress */}
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className={cn("glass-card rounded-2xl p-5 border", tierInfo.border)}
            >
              <h3 className="font-heading font-bold text-white mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" /> Rank Progress
              </h3>

              {/* Current rank badge */}
              <div className={cn("flex items-center gap-3 p-4 rounded-xl border mb-4", tierInfo.bg, tierInfo.border)}>
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl border", tierInfo.border, tierInfo.bg)}>
                  {leaderboardEntry.rank === 1 ? "👑" : leaderboardEntry.rank <= 3 ? "🏆" : leaderboardEntry.rank <= 10 ? "⭐" : "🎮"}
                </div>
                <div>
                  <p className={cn("font-display font-black text-base", tierInfo.color)}>{profile.rank_tier.toUpperCase()}</p>
                  <p className="text-xs text-slate-400 font-heading">{profile.rank_points.toLocaleString()} RP</p>
                </div>
              </div>

              {/* Progress to next tier */}
              {nextTier ? (
                <div>
                  <div className="flex items-center justify-between text-xs font-heading mb-2">
                    <span className={tierInfo.color}>{profile.rank_tier}</span>
                    <span className="text-slate-400">{tierProgress}% to {nextTier.tier}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/5 overflow-hidden mb-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${tierProgress}%` }}
                      transition={{ duration: 1, delay: 0.4 }}
                      className={cn("h-full rounded-full bg-gradient-to-r", tierInfo.color.replace("text-", "from-").replace("-400", "-600"), "to-" + tierInfo.color.split("-")[1] + "-300")}
                      style={{ background: `linear-gradient(to right, ${tierInfo.color.includes("yellow") ? "#ca8a04, #fbbf24" : tierInfo.color.includes("cyan") ? "#0891b2, #67e8f9" : tierInfo.color.includes("purple") ? "#7c3aed, #c084fc" : tierInfo.color.includes("red") ? "#dc2626, #f87171" : tierInfo.color.includes("blue") ? "#1d4ed8, #60a5fa" : "#78716c, #d1d5db"})` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 font-heading">
                    <span>{tierInfo.min.toLocaleString()} RP</span>
                    <span>{nextTier.min.toLocaleString()} RP</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-xs text-red-400 font-heading font-bold">🔥 MAX RANK ACHIEVED</p>
                </div>
              )}

              {/* Mini leaderboard stat */}
              <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                {[
                  { label: "Leaderboard Rank", value: `#${leaderboardEntry.rank}` },
                  { label: "Season Wins", value: leaderboardEntry.wins.toString() },
                  { label: "Win Rate", value: `${winRate}%` },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-xs">
                    <span className="text-slate-500 font-heading">{row.label}</span>
                    <span className="font-display font-bold text-white">{row.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Badges */}
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
              className="glass-card rounded-2xl p-5"
            >
              <h3 className="font-heading font-bold text-white mb-4 flex items-center gap-2">
                <Medal className="w-4 h-4 text-purple-400" /> Achievements
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.badges.map((badge) => (
                  <div key={badge} className="flex items-center gap-1.5 bg-purple/10 border border-purple/25 rounded-full px-3 py-1.5 text-xs font-heading font-semibold text-purple-300">
                    <span>{BADGE_ICONS[badge] ?? "🏅"}</span>
                    {badge}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent wins */}
            {recentWins.length > 0 && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="glass-card rounded-2xl p-5"
              >
                <h3 className="font-heading font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-400" /> Recent Wins
                </h3>
                <div className="space-y-3">
                  {recentWins.map((w, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-yellow-500/5 border border-yellow-500/15 rounded-xl">
                      <span className="text-xl">🏆</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-heading font-bold text-white truncate">{w.tournament}</p>
                        <p className="text-xs text-slate-500 font-heading">{w.game}</p>
                      </div>
                      <span className="font-display font-black text-sm text-amber-400 flex-shrink-0">{formatCurrency(w.prize)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Challenge CTA */}
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
              className="glass-card rounded-2xl p-5 text-center border border-purple/20"
            >
              <Swords className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <p className="font-heading font-bold text-white mb-1 text-sm">Want to compete?</p>
              <p className="text-xs text-slate-400 font-heading mb-4 leading-relaxed">
                Join the same tournaments as {leaderboardEntry.username} and prove your worth.
              </p>
              <Link href="/tournaments" className="btn-primary w-full py-2.5 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" /> Browse Tournaments
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
