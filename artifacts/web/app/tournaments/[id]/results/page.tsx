"use client";
import { useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_TOURNAMENTS } from "@/lib/mock-data";
import { formatCurrency, getGameIcon } from "@/lib/utils";
import { useNotifications } from "@/lib/notifications-context";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Trophy, Upload, CheckCircle2, Swords, Camera,
  Crown, Medal, Award, X, ImageIcon, Loader2, Hash, Zap, AlertCircle,
} from "lucide-react";

const PLACEMENTS = [
  { pos: 1, label: "1st Place", icon: <Crown className="w-5 h-5" />, color: "text-yellow-400", border: "border-yellow-500/50", bg: "bg-yellow-500/10", glow: "shadow-yellow-500/20", prize: 0.50 },
  { pos: 2, label: "2nd Place", icon: <Medal className="w-5 h-5" />,  color: "text-slate-300",  border: "border-slate-400/40",  bg: "bg-slate-500/10",  glow: "shadow-slate-500/10",  prize: 0.30 },
  { pos: 3, label: "3rd Place", icon: <Award className="w-5 h-5" />,  color: "text-amber-600",  border: "border-amber-700/40",  bg: "bg-amber-700/10",  glow: "shadow-amber-700/10",  prize: 0.20 },
  { pos: 4, label: "Top 10",    icon: <Swords className="w-4 h-4" />, color: "text-slate-400",  border: "border-white/10",       bg: "bg-white/3",       glow: "",                     prize: 0 },
  { pos: 5, label: "Other",     icon: <Hash className="w-4 h-4" />,   color: "text-slate-500",  border: "border-white/5",        bg: "bg-black/20",      glow: "",                     prize: 0 },
];

function makeRefId() {
  return "RES-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function SubmitResultPage() {
  const params = useParams();
  const router = useRouter();
  const { addNotification } = useNotifications();
  const tournament = MOCK_TOURNAMENTS.find(t => t.id === params.id);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [placement, setPlacement] = useState<number | null>(null);
  const [kills, setKills] = useState("");
  const [matchId, setMatchId] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<string>("");
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refId] = useState(makeRefId);
  const fileRef = useRef<HTMLInputElement>(null);

  const prizeEntry = tournament ? PLACEMENTS.find(p => p.pos === placement) : null;
  const prizeAmount = tournament && prizeEntry ? Math.round(tournament.prize_pool * prizeEntry.prize) : 0;

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setImageFile(file.name);
    };
    reader.readAsDataURL(file);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  async function handleSubmit() {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1800));

    const results: object[] = JSON.parse(localStorage.getItem("elitelobby_match_results") || "[]");
    results.unshift({
      id: refId,
      tournament_id: params.id,
      tournament_name: tournament?.title,
      player: "DemoPlayer",
      placement,
      kills: kills || "0",
      match_id: matchId,
      image,
      submitted_at: new Date().toISOString(),
      status: "pending",
      prize_eligible: prizeAmount,
    });
    localStorage.setItem("elitelobby_match_results", JSON.stringify(results));

    addNotification({
      type: "announcement",
      title: "Result Submitted",
      message: `Your match result for ${tournament?.title} has been submitted (Ref: ${refId}). Admin will review within 24 hrs.`,
      meta: {},
    });

    setSubmitting(false);
    setStep(3);
  }

  if (!tournament) {
    return (
      <div className="pt-24 pb-16 px-4 text-center">
        <h1 className="font-display font-bold text-2xl text-white mb-4">TOURNAMENT NOT FOUND</h1>
        <Link href="/tournaments" className="btn-secondary px-6 py-3 rounded-xl font-heading font-bold">← Tournaments</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 overflow-x-hidden" style={{ background: "#050508" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(124,58,237,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.04) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="max-w-2xl mx-auto relative">
        {/* Back */}
        <Link href={`/tournaments/${tournament.id}/lobby`} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 font-heading text-sm transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Lobby
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5 mb-6 border border-purple/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-700 to-cyan-700 flex items-center justify-center text-2xl flex-shrink-0">
              {getGameIcon(tournament.game)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-heading mb-0.5">{tournament.game} · {tournament.game_mode}</p>
              <h1 className="font-display font-black text-lg text-white truncate">{tournament.title}</h1>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-slate-500 font-heading">Prize Pool</p>
              <p className="font-display font-black text-xl gradient-text-gold">{formatCurrency(tournament.prize_pool)}</p>
            </div>
          </div>
        </motion.div>

        {/* Step indicator */}
        {step < 3 && (
          <div className="flex items-center gap-0 mb-8">
            {[
              { n: 1, label: "Your Result" },
              { n: 2, label: "Upload Proof" },
              { n: 3, label: "Done" },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-display font-black text-sm border-2 transition-all",
                    step > s.n ? "bg-green-500 border-green-500 text-white" :
                    step === s.n ? "bg-purple-600 border-purple-500 text-white" :
                    "bg-transparent border-white/15 text-slate-500"
                  )}>
                    {step > s.n ? <CheckCircle2 className="w-4 h-4" /> : s.n}
                  </div>
                  <p className={cn("text-xs font-heading mt-1 whitespace-nowrap", step === s.n ? "text-white" : "text-slate-500")}>{s.label}</p>
                </div>
                {i < 2 && <div className={cn("h-0.5 flex-1 mx-2 mb-4", step > s.n ? "bg-green-500/50" : "bg-white/8")} />}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Placement & kills ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
              <div className="glass-card rounded-2xl p-6">
                <h2 className="font-display font-black text-xl text-white mb-1">Your Match Result</h2>
                <p className="text-sm text-slate-400 font-heading mb-5">Select your final placement in the tournament.</p>

                <div className="space-y-2">
                  {PLACEMENTS.map(p => (
                    <button
                      key={p.pos}
                      onClick={() => setPlacement(p.pos)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                        placement === p.pos ? `${p.border} ${p.bg} shadow-lg ${p.glow}` : "border-white/8 hover:border-white/15 bg-black/20"
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border",
                        placement === p.pos ? `${p.border} ${p.bg}` : "border-white/10 bg-white/5"
                      )}>
                        <span className={cn("transition-colors", placement === p.pos ? p.color : "text-slate-500")}>{p.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className={cn("font-heading font-bold text-sm transition-colors", placement === p.pos ? p.color : "text-slate-300")}>{p.label}</p>
                        {p.prize > 0 && (
                          <p className="text-xs text-slate-500 font-heading">
                            Prize: {formatCurrency(Math.round(tournament.prize_pool * p.prize))} ({Math.round(p.prize * 100)}% of pool)
                          </p>
                        )}
                      </div>
                      {placement === p.pos && <CheckCircle2 className={cn("w-5 h-5 flex-shrink-0", p.color)} />}
                    </button>
                  ))}
                </div>

                {/* Kill count & match ID */}
                <div className="grid grid-cols-2 gap-3 mt-5">
                  <div>
                    <label className="text-xs font-heading text-slate-400 mb-1.5 block">Kill Count <span className="text-slate-600">(optional)</span></label>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={kills}
                      onChange={e => setKills(e.target.value)}
                      placeholder="e.g. 7"
                      className="gaming-input w-full px-3 py-2.5 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-heading text-slate-400 mb-1.5 block">Match ID <span className="text-slate-600">(optional)</span></label>
                    <input
                      type="text"
                      value={matchId}
                      onChange={e => setMatchId(e.target.value)}
                      placeholder="In-game match ID"
                      className="gaming-input w-full px-3 py-2.5 rounded-xl text-sm"
                    />
                  </div>
                </div>

                {/* Prize preview */}
                {prizeAmount > 0 && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl flex items-center gap-3"
                  >
                    <Trophy className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <p className="text-sm font-heading text-slate-300">
                      If verified, you'll receive <strong className="text-yellow-400">{formatCurrency(prizeAmount)}</strong> to your wallet.
                    </p>
                  </motion.div>
                )}

                <button
                  onClick={() => placement && setStep(2)}
                  disabled={!placement}
                  className="btn-primary w-full py-3.5 rounded-xl font-heading font-bold text-sm mt-5 disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  Continue → Upload Proof
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Upload screenshot ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
              <div className="glass-card rounded-2xl p-6">
                <h2 className="font-display font-black text-xl text-white mb-1">Upload Match Proof</h2>
                <p className="text-sm text-slate-400 font-heading mb-5">
                  Screenshot the end-of-match screen showing your placement and kills. This is required for prize verification.
                </p>

                {/* Drop zone */}
                <div
                  className={cn(
                    "relative rounded-2xl border-2 border-dashed transition-all cursor-pointer",
                    dragging ? "border-purple-500/70 bg-purple/8" : image ? "border-green-500/40 bg-green-500/3" : "border-white/15 hover:border-purple/40 hover:bg-purple/4"
                  )}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                >
                  {image ? (
                    <div className="relative">
                      <img src={image} alt="Proof" className="w-full max-h-72 object-contain rounded-2xl" />
                      <button
                        onClick={e => { e.stopPropagation(); setImage(null); setImageFile(""); }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-red-500/60 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="p-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <p className="text-xs text-green-400 font-heading truncate">{imageFile || "Screenshot uploaded"}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <div className={cn("w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center border", dragging ? "border-purple-500/60 bg-purple/15" : "border-white/10 bg-white/5")}>
                        <Camera className={cn("w-7 h-7", dragging ? "text-purple-400" : "text-slate-400")} />
                      </div>
                      <p className="font-heading font-semibold text-white text-sm mb-1">
                        {dragging ? "Drop your screenshot here" : "Tap to upload screenshot"}
                      </p>
                      <p className="text-xs text-slate-500 font-heading">or drag and drop · PNG, JPG, WEBP · Max 10 MB</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

                {/* Tips */}
                <div className="mt-4 space-y-1.5">
                  <p className="text-xs font-heading font-semibold text-slate-400 uppercase tracking-wider mb-2">What to include in the screenshot:</p>
                  {[
                    "Your in-game username visible",
                    "Final placement / winner screen",
                    "Kill count shown",
                    "Match ID if visible in game",
                  ].map((tip, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-400 font-heading">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      {tip}
                    </div>
                  ))}
                </div>

                {/* Placement summary */}
                {placement && (
                  <div className="mt-4 p-3.5 bg-black/30 rounded-xl border border-white/8 flex items-center gap-3">
                    <div className="text-xl flex-shrink-0">
                      {placement === 1 ? "🥇" : placement === 2 ? "🥈" : placement === 3 ? "🥉" : "🎮"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400 font-heading">Your claimed result</p>
                      <p className="font-heading font-bold text-white text-sm">
                        {PLACEMENTS.find(p => p.pos === placement)?.label}
                        {kills ? ` · ${kills} kills` : ""}
                      </p>
                    </div>
                    <button onClick={() => setStep(1)} className="text-xs text-purple-400 font-heading hover:text-purple-300 transition-colors flex-shrink-0">Edit</button>
                  </div>
                )}

                <div className="flex gap-3 mt-5">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3 rounded-xl font-heading font-bold text-sm">← Back</button>
                  <button
                    onClick={handleSubmit}
                    disabled={!image || submitting}
                    className="btn-primary flex-1 py-3 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Upload className="w-4 h-4" /> Submit Result</>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Success ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-8 text-center border border-purple/20">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-5"
              >
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </motion.div>

              <h2 className="font-display font-black text-2xl text-white mb-2">Result Submitted!</h2>
              <p className="text-slate-400 font-heading text-sm leading-relaxed mb-6">
                Your match result has been submitted for admin review. Prize money (if applicable) will be credited to your wallet within <strong className="text-white">24 hours</strong>.
              </p>

              <div className="bg-black/30 rounded-2xl p-4 border border-white/8 mb-6 space-y-2 text-left">
                {[
                  { label: "Reference ID", value: refId, mono: true },
                  { label: "Tournament", value: tournament.title, mono: false },
                  { label: "Placement", value: PLACEMENTS.find(p => p.pos === placement)?.label ?? "-", mono: false },
                  { label: "Prize Eligible", value: prizeAmount > 0 ? formatCurrency(prizeAmount) : "Not eligible", mono: false },
                  { label: "Status", value: "Pending Admin Review", mono: false },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                    <span className="text-xs text-slate-500 font-heading">{row.label}</span>
                    <span className={cn("text-xs font-heading font-bold text-white", row.mono && "font-mono text-cyan-400")}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 p-3 bg-yellow-500/5 border border-yellow-500/15 rounded-xl mb-6 text-left">
                <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-slate-400 font-heading leading-relaxed">
                  Keep your reference ID safe. Admin may contact you for additional proof. False submissions may result in account suspension.
                </p>
              </div>

              <div className="flex gap-3">
                <Link href="/dashboard" className="btn-secondary flex-1 py-3 rounded-xl font-heading font-bold text-sm text-center">
                  Go to Dashboard
                </Link>
                <Link href="/tournaments" className="btn-primary flex-1 py-3 rounded-xl font-heading font-bold text-sm text-center flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" /> More Tournaments
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
