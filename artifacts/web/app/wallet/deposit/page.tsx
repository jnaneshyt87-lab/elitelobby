"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Zap, Copy, CheckCircle2, Clock, Shield, QrCode, Wallet, Info, ChevronRight, Gift, Bolt, CreditCard, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWallet } from "@/lib/wallet-context";
import { useUser } from "@clerk/nextjs";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

const PRESET_AMOUNTS = [
  { amount: 100, bonus: 0, label: "Starter" },
  { amount: 200, bonus: 0, label: "Basic" },
  { amount: 500, bonus: 5, label: "Popular", hot: true },
  { amount: 1000, bonus: 10, label: "Pro" },
  { amount: 2000, bonus: 15, label: "Elite" },
  { amount: 5000, bonus: 20, label: "Champion" },
];

const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || "elitelobby@upi";
const UPI_NAME = "EliteLobby Gaming";

const UPI_APPS = [
  { name: "Google Pay", short: "GPay", emoji: "🔵", color: "#1a73e8" },
  { name: "PhonePe", short: "PhonePe", emoji: "🟣", color: "#5f259f" },
  { name: "Paytm", short: "Paytm", emoji: "💙", color: "#00b9f1" },
  { name: "BHIM", short: "BHIM", emoji: "🟠", color: "#ff6b00" },
];

type Step = "amount" | "paying" | "manual_qr" | "manual_proof" | "success";

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5 flex-1 last:flex-none">
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs flex-shrink-0 transition-all",
        done ? "bg-green-500 text-white" : active ? "bg-purple-600 text-white" : "bg-white/10 text-slate-500"
      )}>
        {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : active ? "●" : "○"}
      </div>
      <span className={cn("text-xs font-heading font-semibold hidden sm:block", active ? "text-white" : done ? "text-green-400" : "text-slate-500")}>
        {label}
      </span>
      <div className="flex-1 h-px bg-white/10 last:hidden" />
    </div>
  );
}

function CountdownTimer({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) return;
    const t = setInterval(() => setLeft(p => {
      if (p <= 1) { clearInterval(t); return 0; }
      return p - 1;
    }), 1000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const mins = Math.floor(left / 60);
  const secs = left % 60;
  return (
    <div className="flex flex-col items-center">
      <div className={cn("font-display font-bold text-2xl", left < 60 ? "text-red-400" : "text-cyan-400")}>
        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </div>
      <p className="text-xs text-slate-500 font-heading">time left</p>
      <div className="w-24 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${(left / seconds) * 100}%`, background: left < 60 ? "#ef4444" : "linear-gradient(90deg,#7c3aed,#06b6d4)" }}
        />
      </div>
    </div>
  );
}

export default function DepositPage() {
  const { user } = useUser();
  const { addFunds } = useWallet();
  const router = useRouter();
  const [step, setStep] = useState<Step>("amount");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [isManualMode, setIsManualMode] = useState(false);

  const finalAmount = selectedAmount ?? (parseInt(customAmount) || 0);
  const bonusInfo = PRESET_AMOUNTS.find(p => p.amount === finalAmount);
  const bonusAmount = bonusInfo ? Math.round(finalAmount * bonusInfo.bonus / 100) : 0;
  const totalCredit = finalAmount + bonusAmount;

  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${finalAmount}&cu=INR&tn=${encodeURIComponent("EliteLobby Top-up")}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}&bgcolor=0a0a14&color=a855f7&qzone=2&format=png`;

  async function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window.Razorpay !== "undefined") { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handleRazorpayPay() {
    if (finalAmount < 100) return;
    setRazorpayLoading(true);

    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalAmount }),
      });
      const data = await res.json() as { manual?: boolean; orderId?: string; keyId?: string; amount?: number; error?: string };

      if (data.manual) {
        setIsManualMode(true);
        setStep("manual_qr");
        return;
      }
      if (data.error) { alert(data.error); return; }

      const loaded = await loadRazorpayScript();
      if (!loaded) { setIsManualMode(true); setStep("manual_qr"); return; }

      const options: Record<string, unknown> = {
        key: data.keyId,
        amount: finalAmount * 100,
        currency: "INR",
        name: "EliteLobby",
        description: "Wallet Top-up",
        image: "/logo.svg",
        order_id: data.orderId,
        prefill: {
          name: user?.firstName || "",
          email: user?.emailAddresses?.[0]?.emailAddress || "",
        },
        theme: { color: "#7c3aed" },
        modal: { backdropclose: false },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json() as { success?: boolean; referenceId?: string; error?: string };
            if (verifyData.success) {
              addFunds(totalCredit, "Wallet Top-up via Razorpay");
              setReferenceId(verifyData.referenceId || `EL-${response.razorpay_payment_id.slice(-8).toUpperCase()}`);
              setStep("success");
            } else {
              alert(verifyData.error || "Payment verification failed. Contact support.");
            }
          } catch {
            alert("Verification error. Save your payment ID: " + response.razorpay_payment_id);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      setIsManualMode(true);
      setStep("manual_qr");
    } finally {
      setRazorpayLoading(false);
    }
  }

  async function handleManualSubmit() {
    if (!utrNumber.trim()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    const ref = `EL-DEP-${Date.now().toString().slice(-8)}`;
    addFunds(totalCredit, "Wallet Top-up via UPI (pending verification)");
    setReferenceId(ref);
    setSubmitting(false);
    setStep("success");
  }

  async function copyUpi() {
    await navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  }

  const stepLabels: Record<Step, string[]> = {
    amount: ["Amount", "Payment", "Done"],
    paying: ["Amount ✓", "Payment", "Done"],
    manual_qr: ["Amount ✓", "Pay", "Proof", "Done"],
    manual_proof: ["Amount ✓", "Pay ✓", "Proof", "Done"],
    success: ["Amount ✓", "Pay ✓", "Done ✓"],
  };

  return (
    <div className="pt-24 pb-16 px-4 overflow-x-hidden">
      <div className="max-w-lg mx-auto">
        <Link href="/wallet" className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 font-heading text-sm transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Wallet
        </Link>

        {/* Step bar */}
        <div className="flex items-center gap-1 mb-8">
          {(stepLabels[step] || stepLabels.amount).map((label, i, arr) => (
            <div key={label} className={cn("flex items-center gap-1", i < arr.length - 1 && "flex-1")}>
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all",
                label.includes("✓") ? "bg-green-500 text-white" : i === 0 ? "bg-purple-600 text-white" : "bg-white/10 text-slate-500"
              )}>
                {label.includes("✓") ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={cn("text-xs font-heading hidden sm:block", label.includes("✓") ? "text-green-400" : i === 0 ? "text-white" : "text-slate-500")}>
                {label.replace(" ✓", "")}
              </span>
              {i < arr.length - 1 && <div className={cn("flex-1 h-px mx-1", label.includes("✓") ? "bg-green-500/40" : "bg-white/10")} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── STEP: SELECT AMOUNT ── */}
          {step === "amount" && (
            <motion.div key="amount" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="glass-card rounded-2xl p-6">
                <h2 className="font-display font-bold text-xl text-white mb-1">ADD <span className="gradient-text-gold">FUNDS</span></h2>
                <p className="text-slate-400 text-sm font-heading mb-5">Select the amount to deposit to your wallet</p>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {PRESET_AMOUNTS.map((preset) => (
                    <button
                      key={preset.amount}
                      onClick={() => { setSelectedAmount(preset.amount); setCustomAmount(""); }}
                      className={cn(
                        "glass-btn relative flex flex-col items-center p-3 rounded-xl",
                        selectedAmount === preset.amount ? "glass-btn-active-gold" : ""
                      )}
                    >
                      {preset.bonus > 0 && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[9px] font-heading font-bold rounded-full px-1.5 py-0.5 whitespace-nowrap">
                          +{preset.bonus}% BONUS
                        </div>
                      )}
                      {preset.hot && (
                        <div className="absolute -top-2.5 right-1 text-[9px] bg-red-500/80 text-white font-heading font-bold rounded-full px-1.5 py-0.5">🔥 HOT</div>
                      )}
                      {selectedAmount === preset.amount && <CheckCircle2 className="absolute top-2 right-2 w-3.5 h-3.5 text-yellow-400" />}
                      <span className={cn("text-xs font-heading font-semibold mb-1 mt-1.5", selectedAmount === preset.amount ? "text-yellow-400" : "text-slate-500")}>{preset.label}</span>
                      <span className={cn("font-display font-black text-xl", selectedAmount === preset.amount ? "text-yellow-400" : "text-white")}>₹{preset.amount}</span>
                    </button>
                  ))}
                </div>

                <div className="mb-4">
                  <label className="font-heading font-semibold text-xs tracking-widest text-slate-300 uppercase block mb-2">Custom Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-heading font-bold text-slate-400 text-lg">₹</span>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                      placeholder="Min ₹100 · Max ₹50,000"
                      min={100} max={50000}
                      className="gaming-input w-full pl-9 pr-4 py-3 rounded-xl text-sm"
                    />
                  </div>
                </div>

                {finalAmount >= 500 && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-green-500/10 border border-green-500/25 rounded-xl flex items-center gap-3">
                    <Gift className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <p className="text-sm font-heading text-white">
                      You get <strong className="text-green-400">₹{totalCredit.toLocaleString()}</strong>
                      <span className="text-slate-400 text-xs"> (₹{finalAmount} + ₹{bonusAmount} bonus)</span>
                    </p>
                  </motion.div>
                )}

                <button
                  onClick={() => finalAmount >= 100 && setStep("paying")}
                  disabled={finalAmount < 100}
                  className="btn-gold w-full py-3.5 rounded-xl font-heading font-bold tracking-wider text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  CONTINUE TO PAYMENT <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-6 text-xs text-slate-500 font-heading">
                <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-green-400" /> 256-bit Secured</span>
                <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-yellow-400" /> Instant Credit</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> 24/7 Support</span>
              </div>
            </motion.div>
          )}

          {/* ── STEP: CHOOSE PAYMENT METHOD ── */}
          {step === "paying" && (
            <motion.div key="paying" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="glass-card rounded-2xl p-6">
                <div className="text-center mb-6">
                  <p className="text-slate-400 text-sm font-heading mb-1">Paying</p>
                  <p className="font-display font-black text-4xl gradient-text-gold">₹{finalAmount.toLocaleString()}</p>
                  {bonusAmount > 0 && (
                    <p className="text-green-400 text-sm font-heading mt-1">+ ₹{bonusAmount} bonus → ₹{totalCredit} total</p>
                  )}
                </div>

                {/* Razorpay — recommended */}
                <div className="mb-4">
                  <p className="text-xs font-heading font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-purple-400" /> Instant UPI Payment
                  </p>

                  <button
                    onClick={handleRazorpayPay}
                    disabled={razorpayLoading}
                    className="btn-primary relative w-full py-4 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed mb-3"
                  >
                    {razorpayLoading ? (
                      <span className="relative z-10 flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Opening Payment...
                      </span>
                    ) : (
                      <span className="relative z-10 flex items-center gap-3">
                        <Smartphone className="w-5 h-5" />
                        PAY WITH UPI
                        <span className="text-xs opacity-70 font-normal">Google Pay / PhonePe / Paytm</span>
                      </span>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-4">
                    {UPI_APPS.map(app => (
                      <div key={app.name} className="flex flex-col items-center gap-1 opacity-70">
                        <span className="text-xl">{app.emoji}</span>
                        <span className="text-xs text-slate-500 font-heading">{app.short}</span>
                      </div>
                    ))}
                    <div className="flex flex-col items-center gap-1 opacity-70">
                      <span className="text-xl">🏦</span>
                      <span className="text-xs text-slate-500 font-heading">Net Banking</span>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-slate-500 font-heading px-2">or pay manually</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Manual UPI */}
                <button
                  onClick={() => { setIsManualMode(true); setStep("manual_qr"); }}
                  className="btn-secondary w-full py-3 rounded-xl font-heading font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" /> Scan QR / Enter UPI ID manually
                </button>

                <button onClick={() => setStep("amount")} className="w-full mt-3 text-xs text-slate-500 hover:text-slate-400 font-heading py-1 transition-colors">
                  ← Change amount
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-heading">
                <Shield className="w-3.5 h-3.5 text-green-400" />
                Payments secured by Razorpay · 256-bit SSL
              </div>
            </motion.div>
          )}

          {/* ── STEP: MANUAL QR ── */}
          {step === "manual_qr" && (
            <motion.div key="manual_qr" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="glass-card rounded-2xl p-6 text-center">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-left">
                    <p className="text-slate-400 text-xs font-heading">Pay Exactly</p>
                    <p className="font-display font-black text-3xl gradient-text-gold">₹{finalAmount.toLocaleString()}</p>
                  </div>
                  <CountdownTimer seconds={600} />
                </div>

                <div className="inline-block p-4 rounded-2xl border-2 border-purple/30 bg-black/40 mb-3">
                  <img src={qrUrl} alt="UPI QR" width={200} height={200} className="rounded-xl" />
                </div>
                <p className="text-slate-400 text-xs font-heading mb-4">Scan with any UPI app</p>

                {/* UPI ID copy */}
                <div className="flex items-center justify-between bg-black/40 border border-purple/25 rounded-xl px-4 py-3 mb-4">
                  <div className="text-left">
                    <p className="text-xs text-slate-500 font-heading">UPI ID</p>
                    <p className="font-heading font-bold text-purple-300">{UPI_ID}</p>
                  </div>
                  <button
                    onClick={copyUpi}
                    className={cn(
                      "glass-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-bold",
                      copiedUpi ? "text-green-400" : "text-purple-400"
                    )}
                  >
                    {copiedUpi ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                </div>

                {/* Quick launch UPI apps */}
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {UPI_APPS.map((app) => (
                    <a key={app.name} href={upiLink}
                      className="glass-btn flex flex-col items-center gap-1 p-2.5 rounded-xl group"
                    >
                      <span className="text-2xl">{app.emoji}</span>
                      <span className="text-xs text-slate-400 group-hover:text-white font-heading transition-colors">{app.short}</span>
                    </a>
                  ))}
                </div>

                <div className="flex items-start gap-2.5 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl text-left mb-5">
                  <Info className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-300 font-heading leading-relaxed">
                    Pay <strong className="text-yellow-400">exactly ₹{finalAmount}</strong> — no rounding.
                    After payment, note your <strong className="text-white">UTR/Transaction ID</strong> from your UPI app.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep("paying")} className="btn-secondary px-4 py-3 rounded-xl font-heading font-bold text-sm flex-shrink-0">← Back</button>
                  <button onClick={() => setStep("manual_proof")} className="btn-primary relative flex-1 py-3 rounded-xl font-heading font-bold text-sm">
                    <span className="relative z-10">I've Paid → Enter UTR</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP: MANUAL PROOF ── */}
          {step === "manual_proof" && (
            <motion.div key="manual_proof" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="glass-card rounded-2xl p-6 space-y-5">
                <div>
                  <h2 className="font-display font-bold text-xl text-white mb-1">ENTER <span className="gradient-text">UTR NUMBER</span></h2>
                  <p className="text-slate-400 text-sm font-heading">Enter your UPI transaction reference for verification</p>
                </div>

                <div className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-purple/15">
                  <p className="text-slate-400 text-sm font-heading">Amount Paid</p>
                  <p className="font-display font-bold text-yellow-400">₹{finalAmount.toLocaleString()}</p>
                </div>

                <div>
                  <label className="font-heading font-semibold text-xs tracking-widest text-slate-300 uppercase block mb-2">
                    UTR / Transaction ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="12-digit UTR (e.g. 012345678901)"
                    className="gaming-input w-full px-4 py-3 rounded-xl text-sm font-mono"
                  />
                  <p className="text-xs text-slate-500 font-heading mt-1.5">
                    Find in your UPI app → Transaction History → Transaction ID
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 bg-purple/5 border border-purple/20 rounded-xl">
                  <Shield className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-400 font-heading leading-relaxed">
                    Verified within <strong className="text-white">30 minutes</strong> (9 AM – 11 PM IST). Funds credited automatically on approval.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep("manual_qr")} className="btn-secondary px-4 py-3 rounded-xl font-heading font-bold text-sm flex-shrink-0">← Back</button>
                  <button
                    onClick={handleManualSubmit}
                    disabled={!utrNumber.trim() || submitting}
                    className="btn-gold flex-1 py-3 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    {submitting
                      ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Submitting...</>
                      : <><CheckCircle2 className="w-4 h-4" /> Submit for Review</>
                    }
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP: SUCCESS ── */}
          {step === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="glass-card rounded-2xl p-8 border border-green-500/25">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="w-20 h-20 bg-green-500/20 border-2 border-green-500/40 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </motion.div>

                <h2 className="font-display font-bold text-2xl text-white mb-2">
                  {isManualMode ? <>SUBMITTED <span className="text-green-400">SUCCESSFULLY!</span></> : <>PAYMENT <span className="text-green-400">CONFIRMED!</span></>}
                </h2>
                <p className="text-slate-400 font-heading text-sm mb-6 leading-relaxed">
                  {isManualMode
                    ? `Your deposit of ₹${finalAmount.toLocaleString()} is under review and will be credited within 30 minutes.`
                    : `₹${totalCredit.toLocaleString()} has been credited to your wallet!${bonusAmount > 0 ? ` (includes ₹${bonusAmount} bonus)` : ""}`
                  }
                </p>

                <div className="bg-black/40 border border-purple/25 rounded-xl p-4 mb-6">
                  <p className="text-xs text-slate-500 font-heading mb-1">Reference Number</p>
                  <p className="font-display font-bold text-xl text-purple-400">{referenceId}</p>
                  <p className="text-xs text-slate-500 font-heading mt-1">Screenshot this for support inquiries</p>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { icon: <Clock className="w-4 h-4 text-yellow-400 mx-auto mb-1" />, label: "Processing", value: isManualMode ? "~30 min" : "Instant" },
                    { icon: <Shield className="w-4 h-4 text-green-400 mx-auto mb-1" />, label: "Status", value: isManualMode ? "Under Review" : "Credited" },
                    { icon: <Wallet className="w-4 h-4 text-cyan-400 mx-auto mb-1" />, label: "Amount", value: `₹${totalCredit}` },
                  ].map(item => (
                    <div key={item.label} className="bg-black/20 rounded-xl p-3 border border-white/5 text-center">
                      {item.icon}
                      <p className="text-xs text-slate-500 font-heading">{item.label}</p>
                      <p className="font-heading font-bold text-white text-sm">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/wallet" className="btn-secondary flex-1 py-3 rounded-xl font-heading font-bold text-sm text-center">View Wallet</Link>
                  <Link href="/tournaments" className="btn-primary relative flex-1 py-3 rounded-xl font-heading font-bold text-sm text-center">
                    <span className="relative z-10">Browse Tournaments</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
