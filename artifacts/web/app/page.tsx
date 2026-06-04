"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { TournamentCard } from "@/components/ui/tournament-card";
import { StatCard } from "@/components/ui/stats-counter";
import { MOCK_TOURNAMENTS, MOCK_LEADERBOARD, MOCK_RECENT_WINNERS, MOCK_STATS } from "@/lib/mock-data";
import { Trophy, Users, Zap, Shield, ChevronRight, MessageCircle, Star, Crown, Flame, Target, ArrowRight, TrendingUp, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

function HeroSection() {
  const [activePlayers, setActivePlayers] = useState(312);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePlayers((prev) => prev + Math.floor(Math.random() * 5) - 2);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* Scan line effect */}
      <div
        className="pointer-events-none absolute left-0 w-full h-px opacity-10"
        style={{
          background: "linear-gradient(90deg, transparent, #7c3aed, #06b6d4, transparent)",
          animation: "scan-line 8s linear infinite",
        }}
      />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-2/3 left-1/4 w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/2 right-1/4 w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center pt-24">
        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 live-badge border rounded-full px-4 py-2 mb-8"
        >
          <div className="live-dot" />
          <span className="font-heading font-semibold text-sm tracking-wide">
            {activePlayers.toLocaleString()} PLAYERS ONLINE NOW
          </span>
        </motion.div>

        {/* Main title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <h1 className="font-display font-black leading-none mb-4">
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl gradient-text" style={{ filter: "drop-shadow(0 0 30px rgba(124,58,237,0.5))" }}>
              ELITE
            </span>
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-white" style={{ filter: "drop-shadow(0 0 30px rgba(6,182,212,0.5))" }}>
              LOBBY
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-heading font-semibold text-xl md:text-2xl text-slate-300 tracking-widest mb-10 uppercase"
        >
          Compete · Win · <span className="text-purple-400">Dominate</span>
        </motion.p>

        {/* Stats pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-3 mb-8 sm:mb-10 max-w-sm sm:max-w-none mx-auto"
        >
          {[
            { label: "Prize Pool", value: "₹1.25L+", color: "text-yellow-400" },
            { label: "Players", value: "5,800+", color: "text-cyan-400" },
            { label: "Tournaments", value: "38+", color: "text-purple-400" },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl sm:rounded-full px-3 sm:px-5 py-2.5 sm:py-2 flex flex-col sm:flex-row items-center sm:gap-2 border border-white/10 text-center sm:text-left">
              <span className={`font-display font-bold text-sm ${stat.color}`}>{stat.value}</span>
              <span className="text-slate-400 text-[10px] sm:text-xs font-heading leading-tight">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto"
        >
          <Link
            href="/tournaments"
            className="btn-primary relative px-8 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-heading font-bold tracking-wider flex items-center gap-2 w-full sm:min-w-[200px] sm:w-auto justify-center"
          >
            <Zap className="w-5 h-5 relative z-10" />
            <span className="relative z-10">JOIN THE BATTLE</span>
          </Link>
          <Link
            href="/leaderboard"
            className="btn-secondary px-8 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-heading font-bold tracking-wider flex items-center gap-2 w-full sm:min-w-[200px] sm:w-auto justify-center"
          >
            <Trophy className="w-5 h-5" />
            VIEW LEADERBOARD
          </Link>
        </motion.div>

      </div>
    </section>
  );
}

const GAMES = [
  {
    id: "freefire",
    name: "Free Fire",
    tag: "BATTLE ROYALE",
    emoji: "🔥",
    players: "42K+",
    prize: "₹50K Daily",
    color: "#ff6b35",
    glow: "rgba(255,107,53,0.6)",
    border: "border-orange-500/40",
    textColor: "text-orange-400",
    bgColor: "bg-orange-500/10",
    bg: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=80&fit=crop",
    desc: "48-player battle royale on a remote island",
    comingSoon: false,
  },
  {
    id: "bgmi",
    name: "BGMI / PUBG",
    tag: "BATTLE ROYALE",
    emoji: "🎯",
    players: "38K+",
    prize: "₹75K Daily",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.6)",
    border: "border-yellow-500/40",
    textColor: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    bg: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&q=80&fit=crop",
    desc: "100-player survival showdown, last squad wins",
    comingSoon: true,
  },
  {
    id: "cod",
    name: "COD Mobile",
    tag: "FPS / BR",
    emoji: "💣",
    players: "25K+",
    prize: "₹40K Daily",
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.6)",
    border: "border-cyan-500/40",
    textColor: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    bg: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1920&q=80&fit=crop",
    desc: "High-octane multiplayer FPS on mobile",
    comingSoon: true,
  },
];

function GamesSection() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hoveredGame = GAMES.find((g) => g.id === hoveredId) ?? null;

  return (
    <section className="relative py-14 sm:py-20 px-4 overflow-hidden">
      {/* Base dark overlay always present */}
      <div className="absolute inset-0 bg-[#050508]" />

      {/* Game background images — fade in/out on hover */}
      <AnimatePresence>
        {hoveredGame && (
          <motion.div
            key={hoveredGame.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${hoveredGame.bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
      </AnimatePresence>

      {/* Dark gradient overlay so text stays readable */}
      <div
        className="absolute inset-0 z-1 transition-all duration-500"
        style={{
          background: hoveredGame
            ? `linear-gradient(135deg, rgba(5,5,8,0.88) 0%, rgba(5,5,8,0.6) 50%, rgba(5,5,8,0.88) 100%)`
            : "rgba(5,5,8,0.0)",
        }}
      />

      {/* Colored glow from hovered game */}
      <AnimatePresence>
        {hoveredGame && (
          <motion.div
            key={`glow-${hoveredGame.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-1 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${hoveredGame.glow.replace("0.6", "0.15")} 0%, transparent 70%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-heading text-sm text-purple-400 tracking-widest uppercase mb-1">Choose Your Arena</p>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white">
            SUPPORTED <span className="gradient-text">GAMES</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-sm sm:max-w-3xl mx-auto lg:max-w-none lg:grid-cols-3">
          {GAMES.map((game, i) => {
            const isHovered = hoveredId === game.id;
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onMouseEnter={() => setHoveredId(game.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={cn(
                  "relative rounded-2xl border p-4 sm:p-6 overflow-hidden transition-all duration-300",
                  game.border,
                  game.comingSoon ? "cursor-default" : "cursor-pointer",
                  isHovered ? "scale-[1.04] shadow-2xl" : "scale-100",
                )}
                style={{
                  background: isHovered
                    ? `linear-gradient(135deg, rgba(5,5,8,0.9) 0%, ${game.color}22 100%)`
                    : "linear-gradient(135deg, rgba(15,15,30,0.9) 0%, rgba(10,10,20,0.95) 100%)",
                  boxShadow: isHovered ? `0 0 40px ${game.glow.replace("0.6", "0.3")}, 0 20px 40px rgba(0,0,0,0.5)` : undefined,
                  backdropFilter: "blur(20px)",
                }}
              >
                {/* Top accent line */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                  animate={{ opacity: isHovered ? 1 : 0.3 }}
                  transition={{ duration: 0.3 }}
                  style={{ background: `linear-gradient(90deg, transparent, ${game.color}, transparent)` }}
                />

                {/* Coming Soon badge */}
                {game.comingSoon && (
                  <div className="absolute top-3 right-3 bg-slate-700/80 border border-slate-600/50 text-slate-300 font-heading font-bold text-[10px] tracking-widest px-2.5 py-1 rounded-full uppercase">
                    Coming Soon
                  </div>
                )}

                {/* Emoji icon */}
                <div
                  className={cn("w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4 transition-all duration-300", game.bgColor)}
                  style={{ boxShadow: isHovered ? `0 0 20px ${game.glow.replace("0.6", "0.4")}` : undefined }}
                >
                  {game.emoji}
                </div>

                {/* Tag */}
                <p className={cn("font-heading text-xs tracking-widest font-bold mb-1", game.comingSoon ? "text-slate-500" : game.textColor)}>
                  {game.tag}
                </p>

                {/* Name */}
                <h3 className="font-display font-black text-xl text-white mb-2">{game.name}</h3>

                {/* Desc */}
                <p className="text-slate-400 text-xs font-heading leading-relaxed mb-5">{game.desc}</p>

                {/* Stats row */}
                <div className="flex items-center justify-between text-xs font-heading">
                  <div>
                    <p className="text-slate-500 mb-0.5">Players</p>
                    <p className={cn("font-bold font-display", game.comingSoon ? "text-slate-500" : game.textColor)}>
                      {game.comingSoon ? "—" : game.players}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 mb-0.5">Prize</p>
                    <p className={cn("font-bold font-display", game.comingSoon ? "text-slate-500" : "text-yellow-400")}>
                      {game.comingSoon ? "—" : game.prize}
                    </p>
                  </div>
                </div>

                {/* CTA — appears on hover (live games only) */}
                {!game.comingSoon && (
                  <motion.div
                    initial={false}
                    animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 8 }}
                    transition={{ duration: 0.25 }}
                    className="mt-4"
                  >
                    <Link
                      href="/tournaments"
                      className="w-full py-2.5 rounded-xl font-heading font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${game.color}cc, ${game.color}88)`,
                        color: "#fff",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      VIEW TOURNAMENTS <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard value={MOCK_STATS.totalPlayers} suffix="+" label="Total Players" color="purple" icon="🎮" />
          <StatCard value={125000} prefix="₹" label="Total Prizes Won" color="gold" icon="🏆" />
          <StatCard value={MOCK_STATS.tournamentsThisMonth} label="Tournaments Monthly" color="cyan" icon="⚔️" />
          <StatCard value={MOCK_STATS.activeTournaments} label="Live Right Now" color="red" icon="🔥" />
        </div>
      </div>
    </section>
  );
}

function FeaturedTournaments() {
  const [query, setQuery] = useState("");
  const active = MOCK_TOURNAMENTS.filter((t) => t.status !== "completed");
  const filtered = query.trim()
    ? active.filter((t) =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.game.toLowerCase().includes(query.toLowerCase()) ||
        t.game_mode.toLowerCase().includes(query.toLowerCase())
      )
    : active.slice(0, 6);

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="font-heading text-sm text-purple-400 tracking-widest uppercase mb-1">Battle Arena</p>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-white">
              ACTIVE <span className="gradient-text">TOURNAMENTS</span>
            </h2>
          </div>
          <Link href="/tournaments" className="btn-secondary px-4 py-2 rounded-lg text-sm flex items-center gap-1.5 hidden sm:flex">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, game or mode…"
            className="gaming-input w-full pl-10 pr-10 py-3 rounded-xl text-sm font-heading"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t, i) => (
              <TournamentCard key={t.id} tournament={t} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 glass-card rounded-2xl">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-heading font-bold text-white text-sm mb-1">No tournaments found</p>
            <p className="text-slate-500 font-heading text-xs">Try searching for "Free Fire", "Solo", or "Clash Squad"</p>
          </div>
        )}

        <div className="flex sm:hidden mt-4 justify-center">
          <Link href="/tournaments" className="btn-secondary px-5 py-2.5 rounded-lg text-sm flex items-center gap-1.5">
            View All Tournaments <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: <Users className="w-7 h-7" />,
      title: "Create Account",
      desc: "Sign up in seconds. Add your Game UID and verify your account.",
      color: "text-purple-400",
      border: "border-purple/30",
    },
    {
      step: "02",
      icon: <Zap className="w-7 h-7" />,
      title: "Add Funds & Register",
      desc: "Top up your wallet via UPI/QR and register for any tournament.",
      color: "text-cyan-400",
      border: "border-cyan/30",
    },
    {
      step: "03",
      icon: <Trophy className="w-7 h-7" />,
      title: "Compete & Win",
      desc: "Get Room ID before match, dominate, and withdraw your winnings instantly.",
      color: "text-yellow-400",
      border: "border-yellow-500/30",
    },
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-heading text-sm text-purple-400 tracking-widest uppercase mb-1">Simple Process</p>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white">
            HOW IT <span className="gradient-text">WORKS</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 relative">
          {/* Connector line */}
          <div className="hidden sm:block absolute top-1/3 left-1/4 right-1/4 h-px bg-gradient-to-r from-purple-500/30 via-cyan-500/30 to-yellow-500/30" />
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className={`glass-card rounded-xl p-6 text-center border ${step.border}`}
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-black/40 mb-4 ${step.color}`}>
                {step.icon}
              </div>
              <div className={`font-display font-black text-4xl mb-2 opacity-20 ${step.color}`}>{step.step}</div>
              <h3 className={`font-heading font-bold text-lg mb-2 ${step.color}`}>{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TopPlayers() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-heading text-sm text-yellow-400 tracking-widest uppercase mb-1">Hall of Fame</p>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-white">
              TOP <span className="gradient-text-gold">EARNERS</span>
            </h2>
          </div>
          <Link href="/leaderboard" className="btn-secondary px-4 py-2 rounded-lg text-sm flex items-center gap-1.5">
            Full Board <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full gaming-table">
            <thead>
              <tr>
                <th className="text-left">Rank</th>
                <th className="text-left">Player</th>
                <th className="text-left hidden sm:table-cell">Game</th>
                <th className="text-right hidden md:table-cell">Kills</th>
                <th className="text-right hidden md:table-cell">Wins</th>
                <th className="text-right">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_LEADERBOARD.slice(0, 10).map((player) => (
                <tr key={player.rank} className="group">
                  <td>
                    <div className="flex items-center gap-2">
                      {player.rank === 1 ? (
                        <span className="font-display text-yellow-400 font-bold">👑 1</span>
                      ) : player.rank === 2 ? (
                        <span className="font-display text-slate-300 font-bold">🥈 2</span>
                      ) : player.rank === 3 ? (
                        <span className="font-display text-amber-600 font-bold">🥉 3</span>
                      ) : (
                        <span className="font-display text-slate-500 font-bold">#{player.rank}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-xs font-display font-bold text-white">
                        {player.username[0]}
                      </div>
                      <span className="font-heading font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {player.username}
                      </span>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell">
                    <span className="text-slate-400 text-sm">{player.game}</span>
                  </td>
                  <td className="hidden md:table-cell text-right">
                    <span className="font-display text-xs text-red-400 font-bold">{player.kills.toLocaleString()}</span>
                  </td>
                  <td className="hidden md:table-cell text-right">
                    <span className="font-display text-xs text-cyan-400 font-bold">{player.wins}</span>
                  </td>
                  <td className="text-right">
                    <span className="font-display text-sm font-bold gradient-text-gold">{formatCurrency(player.earnings)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function PlayersToWatch() {
  const featured = MOCK_LEADERBOARD.slice(0, 6);
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActiveIdx((i) => (i + 1) % featured.length), 3000);
    return () => clearInterval(t);
  }, [paused, featured.length]);

  const active = featured[activeIdx];
  const trendColor = active.trend === "up" ? "text-green-400" : active.trend === "down" ? "text-red-400" : "text-slate-400";
  const trendIcon = active.trend === "up" ? "↑" : active.trend === "down" ? "↓" : "→";

  const statBg = [
    "from-purple-600 to-purple-800",
    "from-cyan-600 to-cyan-800",
    "from-yellow-500 to-amber-700",
    "from-red-600 to-red-800",
    "from-green-600 to-green-800",
    "from-pink-600 to-pink-800",
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-heading text-sm text-purple-400 tracking-widest uppercase mb-1">Spotlight</p>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-white">
              PLAYERS TO <span className="gradient-text">WATCH</span>
            </h2>
          </div>
          <div className="flex gap-1.5">
            {featured.map((_, i) => (
              <button
                key={i}
                onClick={() => { setActiveIdx(i); setPaused(true); }}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === activeIdx ? "w-6 bg-purple-400" : "w-1.5 bg-white/20 hover:bg-white/40"
                )}
              />
            ))}
          </div>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-5 gap-4"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Main spotlight card */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
                className="glass-card rounded-2xl p-6 h-full border border-white/10 relative overflow-hidden"
              >
                {/* bg glow */}
                <div className={`absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br ${statBg[activeIdx]} opacity-10 blur-2xl pointer-events-none`} />

                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${statBg[activeIdx]} flex items-center justify-center text-2xl font-display font-black text-white shadow-lg`}>
                      {active.username[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-display font-bold text-xl text-white">{active.username}</h3>
                        <span className={`font-display text-sm font-bold ${trendColor}`}>{trendIcon}</span>
                      </div>
                      <p className="text-slate-400 text-sm font-heading">{active.game}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Crown className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-yellow-400 text-xs font-display font-bold">Rank #{active.rank}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 text-xs font-heading mb-0.5">Total Earnings</p>
                    <p className="font-display font-black text-2xl gradient-text-gold">{formatCurrency(active.earnings)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Tournament Wins", value: active.wins, icon: <Trophy className="w-4 h-4" />, color: "text-yellow-400" },
                    { label: "Total Kills", value: active.kills.toLocaleString(), icon: <Target className="w-4 h-4" />, color: "text-red-400" },
                    { label: "K/D Ratio", value: (active.kills / Math.max(active.wins * 18, 1)).toFixed(1), icon: <Flame className="w-4 h-4" />, color: "text-orange-400" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                      <div className={`flex justify-center mb-1.5 ${s.color}`}>{s.icon}</div>
                      <p className={`font-display font-bold text-lg ${s.color}`}>{s.value}</p>
                      <p className="text-slate-500 text-[10px] font-heading leading-tight mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* hot streak bar */}
                {active.trend === "up" && (
                  <div className="mt-4 flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                    <TrendingUp className="w-4 h-4 text-green-400 shrink-0" />
                    <span className="text-green-400 text-xs font-heading">On a hot streak — rising through the ranks!</span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Side list */}
          <div className="lg:col-span-2 flex flex-col gap-2">
            {featured.map((p, i) => (
              <motion.button
                key={p.rank}
                onClick={() => { setActiveIdx(i); setPaused(true); }}
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 border",
                  i === activeIdx
                    ? "glass border-purple-500/40 bg-purple-500/10"
                    : "border-white/5 bg-white/3 hover:bg-white/5 hover:border-white/10"
                )}
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${statBg[i]} flex items-center justify-center text-sm font-display font-black text-white shrink-0`}>
                  {p.username[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-heading font-semibold text-sm truncate", i === activeIdx ? "text-white" : "text-slate-300")}>
                    {p.username}
                  </p>
                  <p className="text-slate-500 text-xs">{p.wins} wins · {p.kills} kills</p>
                </div>
                <span className={cn("font-display text-xs font-bold shrink-0", i === activeIdx ? "gradient-text-gold" : "text-slate-400")}>
                  {formatCurrency(p.earnings)}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RecentWinners() {
  const [activeIdx, setActiveIdx] = useState(0);
  const winners = MOCK_RECENT_WINNERS;

  useEffect(() => {
    const t = setInterval(() => setActiveIdx((i) => (i + 1) % winners.length), 2800);
    return () => clearInterval(t);
  }, [winners.length]);

  const AVATARS = ["from-yellow-500 to-orange-600", "from-purple-600 to-pink-600", "from-cyan-500 to-blue-600", "from-green-500 to-emerald-700"];

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      {/* Radial gold glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(245,158,11,0.05) 0%, transparent 70%)" }} />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-heading text-sm text-yellow-400 tracking-widest uppercase mb-1">Hall of Champions</p>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white">
            RECENT <span className="gradient-text-fire">WINNERS</span>
          </h2>
        </div>

        {/* Desktop: carousel spotlight + side list */}
        <div className="hidden md:grid md:grid-cols-5 gap-6">
          {/* Main winner spotlight */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.97 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="glass-card rounded-2xl p-8 text-center relative overflow-hidden border border-yellow-500/20"
                style={{ animation: "winner-glow-pulse 3s ease-in-out infinite" }}
              >
                {/* Background gold glow */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(245,158,11,0.08) 0%, transparent 70%)" }} />

                {/* Confetti dots */}
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
                    style={{
                      left: `${15 + i * 14}%`,
                      top: "10%",
                      background: ["#f59e0b","#06b6d4","#a855f7","#ef4444","#22c55e","#f97316"][i],
                      animation: `confetti-fall ${1.5 + i * 0.3}s ease-in ${i * 0.4}s infinite`,
                      opacity: 0.7,
                    }}
                  />
                ))}

                {/* Trophy */}
                <div className="relative z-10 mb-4">
                  <div
                    className="text-6xl inline-block"
                    style={{ animation: "trophy-bounce 2.5s ease-in-out infinite" }}
                  >
                    🏆
                  </div>
                </div>

                {/* Avatar */}
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${AVATARS[activeIdx % AVATARS.length]} flex items-center justify-center font-display font-black text-3xl text-white mx-auto mb-4 relative z-10`}
                  style={{ boxShadow: "0 0 30px rgba(245,158,11,0.4)" }}
                >
                  {winners[activeIdx].username[0]}
                </div>

                <h3 className="font-display font-black text-2xl text-white mb-1 relative z-10">{winners[activeIdx].username}</h3>
                <p className="text-slate-400 text-sm font-heading mb-4 relative z-10">{winners[activeIdx].tournament}</p>

                <div className="relative z-10">
                  <p className="shimmer-text font-display font-black text-3xl mb-1">{formatCurrency(winners[activeIdx].prize)}</p>
                  <span className="inline-flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-heading font-bold text-xs tracking-wider px-3 py-1 rounded-full">
                    <Crown className="w-3.5 h-3.5" /> 1ST PLACE
                  </span>
                </div>

                {/* Dot progress */}
                <div className="flex justify-center gap-1.5 mt-6 relative z-10">
                  {winners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIdx(i)}
                      className={cn("rounded-full transition-all duration-300", i === activeIdx ? "w-5 h-1.5 bg-yellow-400" : "w-1.5 h-1.5 bg-white/20")}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Side list */}
          <div className="md:col-span-2 flex flex-col gap-2 justify-center">
            {winners.map((w, i) => (
              <motion.button
                key={i}
                onClick={() => setActiveIdx(i)}
                whileHover={{ x: 5 }}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all border",
                  i === activeIdx
                    ? "glass border-yellow-500/35 bg-yellow-500/8"
                    : "border-white/5 bg-white/3 hover:bg-white/5 hover:border-white/10"
                )}
              >
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center font-display font-black text-sm text-white shrink-0 bg-gradient-to-br", AVATARS[i % AVATARS.length])}>
                  {w.username[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-heading font-semibold text-sm truncate", i === activeIdx ? "text-white" : "text-slate-300")}>{w.username}</p>
                  <p className="text-slate-500 text-xs truncate">{w.tournament}</p>
                </div>
                <p className={cn("font-display text-xs font-bold shrink-0", i === activeIdx ? "text-yellow-400" : "text-slate-400")}>{formatCurrency(w.prize)}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Mobile: stacked cards */}
        <div className="md:hidden grid grid-cols-2 gap-3">
          {winners.map((winner, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "glass-card rounded-xl p-4 text-center border",
                i === 0 ? "border-yellow-500/30" : "border-white/8"
              )}
            >
              <div className="text-2xl mb-2">{i === 0 ? "🏆" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🎮"}</div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${AVATARS[i % AVATARS.length]} flex items-center justify-center font-display font-bold text-sm text-white mx-auto mb-2`}>{winner.username[0]}</div>
              <p className="font-heading font-bold text-white text-xs mb-1 truncate">{winner.username}</p>
              <p className="font-display font-black text-sm gradient-text-gold">{formatCurrency(winner.prize)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const testimonials = [
    { username: "Team MBG",    game: "Free Fire", text: "Won ₹8,500 in my first big tournament! The platform is super smooth and payments are instant.", rating: 5 },
    { username: "Rex Gaming",  game: "Free Fire", text: "Best esports platform in India. Transparent results, fast withdrawals, no drama.", rating: 5 },
    { username: "777 Official",game: "Free Fire", text: "Finally a platform that takes competitive gaming seriously. Room IDs on time, great support.", rating: 5 },
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white">
            WHAT PLAYERS <span className="gradient-text">SAY</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-6"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-700 to-cyan-700 flex items-center justify-center font-display font-bold text-sm text-white">
                  {t.username[0]}
                </div>
                <div>
                  <p className="font-heading font-bold text-white text-sm">{t.username}</p>
                  <p className="text-xs text-slate-400">{t.game} Player</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DiscordCTA() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="rgb-border glass-card rounded-2xl p-8 md:p-12 text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white mb-3">
            JOIN OUR <span className="gradient-text">DISCORD</span>
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8 max-w-xl mx-auto">
            Get match announcements, room IDs, tips from pro players, and real-time tournament updates. 50,000+ members and growing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://discord.gg/aH2mEAj5" target="_blank" rel="noopener noreferrer" className="btn-primary relative px-8 py-3.5 rounded-xl text-sm font-heading font-bold tracking-wider inline-flex items-center gap-2 justify-center">
              <MessageCircle className="w-4 h-4 relative z-10" />
              <span className="relative z-10">JOIN DISCORD — FREE</span>
            </a>
            <Link href="/tournaments" className="btn-secondary px-8 py-3.5 rounded-xl text-sm font-heading font-bold tracking-wider inline-flex items-center gap-2 justify-center">
              Browse Tournaments <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionDivider() {
  return <div className="section-divider mx-4 sm:mx-8" />;
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SectionDivider />
      <StatsSection />
      <SectionDivider />
      <GamesSection />
      <SectionDivider />
      <FeaturedTournaments />
      <SectionDivider />
      <HowItWorks />
      <SectionDivider />
      <TopPlayers />
      <SectionDivider />
      <PlayersToWatch />
      <SectionDivider />
      <RecentWinners />
      <SectionDivider />
      <Testimonials />
      <SectionDivider />
      <DiscordCTA />
    </>
  );
}
