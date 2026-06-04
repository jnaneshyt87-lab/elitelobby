"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { MOCK_LEADERBOARD, MOCK_RECENT_WINNERS } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Trophy, Target, TrendingUp, TrendingDown, Minus, Crown, Flame, Swords } from "lucide-react";
import { cn } from "@/lib/utils";

const GAMES = ["All", "Free Fire", "BGMI", "Valorant", "COD Mobile", "PUBG Mobile"];

function PodiumCard({ player, position }: { player: (typeof MOCK_LEADERBOARD)[0]; position: number }) {
  const heights = { 1: "h-32", 2: "h-24", 3: "h-20" };
  const colors = {
    1: { bg: "from-yellow-500/30 to-amber-600/20", border: "border-yellow-500/40", text: "text-yellow-400", crown: "text-yellow-400" },
    2: { bg: "from-slate-400/20 to-slate-500/10", border: "border-slate-400/30", text: "text-slate-300", crown: "text-slate-300" },
    3: { bg: "from-amber-700/20 to-amber-800/10", border: "border-amber-700/30", text: "text-amber-600", crown: "text-amber-600" },
  };
  const style = colors[position as 1 | 2 | 3] ?? colors[3];
  const medal = ["🥇", "🥈", "🥉"][position - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: position * 0.1 }}
      className={cn("flex flex-col items-center order-first", position === 1 && "order-first sm:order-none z-10")}
    >
      <div className="text-3xl mb-2">{medal}</div>
      <Link href={`/players/${player.username}`} className="group">
        <div className={cn("w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center font-display font-black text-lg text-white mb-2 border group-hover:scale-105 transition-transform", style.bg, style.border)}>
          {player.username[0]}
        </div>
        <p className={cn("font-heading font-bold text-xs text-center group-hover:underline max-w-[72px] truncate", style.text)}>{player.username}</p>
      </Link>
      <p className="text-xs text-slate-500 font-heading mb-2 max-w-[72px] truncate">{player.game}</p>
      <p className={cn("font-display font-black text-base", style.text)}>{formatCurrency(player.earnings)}</p>
      <div className={cn("mt-2 rounded-t-lg w-full flex items-end justify-center bg-gradient-to-t from-white/5 to-transparent border border-b-0", style.border, heights[position as 1 | 2 | 3] ?? heights[3])}>
        <span className={cn("font-display font-black text-3xl pb-2 opacity-30", style.text)}>#{position}</span>
      </div>
    </motion.div>
  );
}

export default function LeaderboardPage() {
  const [selectedGame, setSelectedGame] = useState("All");
  const [view, setView] = useState<"earnings" | "kills" | "wins">("earnings");

  const filtered = selectedGame === "All"
    ? MOCK_LEADERBOARD
    : MOCK_LEADERBOARD.filter(p => p.game === selectedGame);

  const sorted = [...filtered].sort((a, b) => {
    if (view === "earnings") return b.earnings - a.earnings;
    if (view === "kills") return b.kills - a.kills;
    return b.wins - a.wins;
  }).map((p, i) => ({ ...p, displayRank: i + 1 }));

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <div className="pt-24 pb-16 px-4 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="font-heading text-sm text-yellow-400 tracking-widest uppercase mb-1">Hall of Champions</p>
          <h1 className="font-display font-bold text-3xl md:text-5xl text-white mb-3">
            GLOBAL <span className="gradient-text">LEADERBOARD</span>
          </h1>
          <p className="text-slate-400 font-heading text-sm">The top warriors competing for glory</p>
        </motion.div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Game filter */}
          <div className="flex flex-wrap gap-2">
            {GAMES.map((game) => (
              <button
                key={game}
                onClick={() => setSelectedGame(game)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-heading font-semibold border transition-all",
                  selectedGame === game ? "bg-purple-600/30 border-purple-500/60 text-purple-300" : "border-white/10 text-slate-400 hover:border-white/20"
                )}
              >
                {game}
              </button>
            ))}
          </div>
          {/* Sort */}
          <div className="flex items-center gap-1 bg-black/30 rounded-xl p-1 ml-auto">
            {[
              { key: "earnings", label: "Earnings", icon: <Trophy className="w-3.5 h-3.5" /> },
              { key: "kills", label: "Kills", icon: <Target className="w-3.5 h-3.5" /> },
              { key: "wins", label: "Wins", icon: <Crown className="w-3.5 h-3.5" /> },
            ].map((v) => (
              <button
                key={v.key}
                onClick={() => setView(v.key as any)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all",
                  view === v.key ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                )}
              >
                {v.icon} {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Podium */}
        {sorted.length >= 3 && (
          <div className="glass-card rounded-2xl p-8 mb-6">
            <h3 className="font-heading font-bold text-center text-slate-400 text-xs uppercase tracking-widest mb-6">Top Champions</h3>
            <div className="flex items-end justify-center gap-4 sm:gap-8">
              {/* 2nd */}
              <PodiumCard player={top3[1]} position={2} />
              {/* 1st */}
              <PodiumCard player={top3[0]} position={1} />
              {/* 3rd */}
              <PodiumCard player={top3[2]} position={3} />
            </div>
          </div>
        )}

        {/* Full table */}
        <div className="glass-card rounded-2xl overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-purple/15 flex items-center justify-between">
            <h3 className="font-heading font-bold text-white">Rankings</h3>
            <p className="text-xs text-slate-400 font-heading">{filtered.length} players</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full gaming-table">
              <thead>
                <tr>
                  <th className="text-left w-16">Rank</th>
                  <th className="text-left">Player</th>
                  <th className="text-left hidden sm:table-cell">Game</th>
                  <th className="text-right hidden md:table-cell">Wins</th>
                  <th className="text-right hidden md:table-cell">Kills</th>
                  <th className="text-right">Earnings</th>
                  <th className="text-center hidden sm:table-cell w-16">Trend</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((player, index) => (
                  <motion.tr
                    key={player.rank}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="group"
                  >
                    <td>
                      <span className={cn(
                        "font-display font-bold text-sm",
                        player.displayRank === 1 ? "text-yellow-400" :
                        player.displayRank === 2 ? "text-slate-300" :
                        player.displayRank === 3 ? "text-amber-600" : "text-slate-500"
                      )}>
                        {player.displayRank <= 3 ? ["👑", "🥈", "🥉"][player.displayRank - 1] : `#${player.displayRank}`}
                      </span>
                    </td>
                    <td>
                      <Link href={`/players/${player.username}`} className="flex items-center gap-3 group/link">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-700 to-cyan-700 flex items-center justify-center font-display font-bold text-sm text-white flex-shrink-0 group-hover/link:scale-105 transition-transform">
                          {player.username[0]}
                        </div>
                        <div>
                          <p className="font-heading font-bold text-white text-sm group-hover/link:text-purple-300 transition-colors">{player.username}</p>
                          {player.displayRank === 1 && <p className="text-xs text-yellow-400 font-heading">Current Champion</p>}
                        </div>
                      </Link>
                    </td>
                    <td className="hidden sm:table-cell">
                      <span className="text-slate-400 text-sm font-heading">{player.game}</span>
                    </td>
                    <td className="hidden md:table-cell text-right">
                      <span className="font-display text-xs text-cyan-400 font-bold">{player.wins}</span>
                    </td>
                    <td className="hidden md:table-cell text-right">
                      <span className="font-display text-xs text-red-400 font-bold">{player.kills.toLocaleString()}</span>
                    </td>
                    <td className="text-right">
                      <span className="font-display font-black text-sm gradient-text-gold">{formatCurrency(player.earnings)}</span>
                    </td>
                    <td className="hidden sm:table-cell text-center">
                      {player.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-400 mx-auto" />
                      ) : player.trend === "down" ? (
                        <TrendingDown className="w-4 h-4 text-red-400 mx-auto" />
                      ) : (
                        <Minus className="w-4 h-4 text-slate-500 mx-auto" />
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent winners */}
        <div>
          <h2 className="font-display font-bold text-xl text-white mb-4">RECENT <span className="gradient-text">WINNERS</span></h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MOCK_RECENT_WINNERS.map((w, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card rounded-xl p-4 text-center"
              >
                <div className="text-2xl mb-2">🏆</div>
                <p className="font-display font-bold text-sm text-white truncate mb-1">{w.username}</p>
                <p className="text-xs text-slate-500 font-heading truncate mb-2">{w.tournament}</p>
                <p className="font-display font-black text-base gradient-text-gold">{formatCurrency(w.prize)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
