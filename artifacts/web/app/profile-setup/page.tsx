"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Zap, Gamepad2, User, Hash, ChevronRight, Flame } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const GAMES = ["Free Fire", "BGMI", "Valorant", "COD Mobile"];

export default function ProfileSetupPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [form, setForm] = useState({ inGameName: "", uid: "", game: "Free Fire" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    const existing = localStorage.getItem(`elitelobby_profile_${user.id}`);
    if (existing) {
      router.replace("/dashboard");
    }
  }, [isLoaded, user, router]);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.inGameName.trim()) { setError("Please enter your in-game name."); return; }
    if (!form.uid.trim()) { setError("Please enter your game UID."); return; }
    if (form.uid.trim().length < 6) { setError("UID must be at least 6 characters."); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const profile = {
      inGameName: form.inGameName.trim(),
      uid: form.uid.trim(),
      game: form.game,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(`elitelobby_profile_${user!.id}`, JSON.stringify(profile));
    router.push("/dashboard");
  }

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-xl flex items-center justify-center" style={{ boxShadow: "0 0 20px rgba(124, 58, 237, 0.5)" }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl" style={{ background: "linear-gradient(135deg, #a855f7, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              ELITELOBBY
            </span>
          </Link>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
              <span className="text-xs text-green-400 font-heading font-semibold">Account</span>
            </div>
            <div className="w-8 h-px bg-purple/30" />
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-purple-500/30 border border-purple-500/60 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
              </div>
              <span className="text-xs text-purple-300 font-heading font-semibold">Player Profile</span>
            </div>
            <div className="w-8 h-px bg-white/10" />
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-600" />
              </div>
              <span className="text-xs text-slate-500 font-heading font-semibold">Dashboard</span>
            </div>
          </div>

          <h1 className="font-display font-bold text-2xl text-white mb-1">SET UP YOUR PROFILE</h1>
          <p className="text-slate-400 text-sm">Link your gaming identity to compete</p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Game selection */}
            <div>
              <label className="font-heading font-semibold text-xs tracking-widest text-slate-300 uppercase block mb-2">
                Primary Game
              </label>
              <div className="grid grid-cols-2 gap-2">
                {GAMES.map((g) => {
                  const isComingSoon = g !== "Free Fire";
                  return (
                    <button
                      key={g}
                      type="button"
                      disabled={isComingSoon}
                      onClick={() => !isComingSoon && update("game", g)}
                      className={cn(
                        "glass-btn relative flex items-center gap-2 px-3 py-2.5 rounded-xl font-heading font-semibold text-sm text-left",
                        isComingSoon ? "opacity-40 cursor-not-allowed" : form.game === g ? "glass-btn-active-purple" : ""
                      )}
                    >
                      <Flame className={`w-3.5 h-3.5 flex-shrink-0 ${form.game === g && !isComingSoon ? "text-purple-400" : "text-slate-500"}`} />
                      <span className="truncate">{g}</span>
                      {isComingSoon && (
                        <span className="absolute top-1 right-1 text-[8px] font-bold text-amber-500/70 uppercase">Soon</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* In-game name */}
            <div>
              <label className="font-heading font-semibold text-xs tracking-widest text-slate-300 uppercase block mb-2">
                In-Game Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={form.inGameName}
                  onChange={(e) => update("inGameName", e.target.value)}
                  placeholder="e.g. NightShade_X"
                  maxLength={20}
                  className="gaming-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1 font-heading">Your display name in tournaments</p>
            </div>

            {/* UID */}
            <div>
              <label className="font-heading font-semibold text-xs tracking-widest text-slate-300 uppercase block mb-2">
                Free Fire UID
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={form.uid}
                  onChange={(e) => update("uid", e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 123456789"
                  maxLength={12}
                  className="gaming-input w-full pl-10 pr-4 py-3 rounded-xl text-sm font-mono"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1 font-heading">Find your UID in Free Fire → Profile → tap your avatar</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 text-red-400 text-sm font-heading">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 rounded-xl font-heading font-bold tracking-wider text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  SAVING...
                </span>
              ) : (
                <span className="flex items-center gap-2 relative z-10">
                  <Gamepad2 className="w-4 h-4" />
                  ENTER THE ARENA
                  <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-400 font-heading transition-colors py-1"
            >
              Skip for now
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
