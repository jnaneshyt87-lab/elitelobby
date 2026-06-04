"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowUpRight, Shield, Clock, CheckCircle2, ChevronRight,
  Smartphone, AlertTriangle, Info, Building2, Wallet, BadgeIndianRupee, CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useWallet } from "@/lib/wallet-context";

const PRESET_WITHDRAW = [100, 250, 500, 1000];

type Method = "upi" | "bank";
type WStep = "amount" | "details" | "confirm" | "success";

function validateIFSC(v: string) {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v.toUpperCase());
}
function validateUPI(v: string) {
  return /^[\w.\-]{3,}@[\w]+$/.test(v);
}

export default function WithdrawPage() {
  const { user } = useUser();
  const { balance: walletBalance, deductFee } = useWallet();

  const [step, setStep] = useState<WStep>("amount");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [method, setMethod] = useState<Method>("upi");

  const [upiId, setUpiId] = useState("");
  const [upiName, setUpiName] = useState("");

  const [bankAccount, setBankAccount] = useState("");
  const [bankConfirm, setBankConfirm] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankMobile, setBankMobile] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [refId, setRefId] = useState("");

  const finalAmount = selectedPreset ?? (parseInt(customAmount) || 0);
  const fee = finalAmount > 0 && finalAmount < 500 ? 10 : 0;
  const netAmount = finalAmount - fee;

  const isAmountValid = finalAmount >= 100 && finalAmount <= walletBalance;
  const upiValid = validateUPI(upiId) && upiName.trim().length >= 2;
  const bankValid =
    bankAccount.length >= 9 &&
    bankAccount === bankConfirm &&
    validateIFSC(bankIfsc) &&
    bankName.trim().length >= 2 &&
    /^[6-9]\d{9}$/.test(bankMobile);

  const detailsValid = method === "upi" ? upiValid : bankValid;

  async function handleSubmit() {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900));
    const ref = `EL-WD-${Date.now().toString().slice(-8)}`;
    deductFee(finalAmount, `Withdrawal via ${method === "upi" ? "UPI" : "Bank Transfer"}`);
    setRefId(ref);
    if (user) {
      const req = {
        refId: ref,
        userId: user.id,
        username: user.username || user.firstName || "Player",
        amount: finalAmount,
        netAmount,
        fee,
        method,
        ...(method === "upi" ? { upiId, upiName } : { bankAccount, bankIfsc, bankName, bankMobile }),
        status: "pending",
        submittedAt: new Date().toISOString(),
      };
      const key = "elitelobby_admin_withdrawals";
      const existing = JSON.parse(localStorage.getItem(key) || "[]") as object[];
      existing.unshift(req);
      localStorage.setItem(key, JSON.stringify(existing));
    }
    setSubmitting(false);
    setStep("success");
  }

  const steps: { key: WStep; label: string }[] = [
    { key: "amount", label: "Amount" },
    { key: "details", label: method === "upi" ? "UPI" : "Bank" },
    { key: "confirm", label: "Confirm" },
    { key: "success", label: "Done" },
  ];
  const stepIdx = steps.findIndex(s => s.key === step);

  return (
    <div className="pt-24 pb-16 px-4 overflow-x-hidden">
      <div className="max-w-lg mx-auto">
        <Link href="/wallet" className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 font-heading text-sm transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Wallet
        </Link>

        {/* Step bar */}
        <div className="flex items-center mb-8">
          {steps.map((s, i) => (
            <div key={s.key} className={cn("flex items-center", i < steps.length - 1 && "flex-1")}>
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs flex-shrink-0 transition-all",
                i < stepIdx ? "bg-green-500 text-white" : i === stepIdx ? "bg-purple-600 text-white" : "bg-white/10 text-slate-500"
              )}>
                {i < stepIdx ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={cn("text-xs font-heading font-semibold mx-1 hidden sm:block",
                i === stepIdx ? "text-white" : i < stepIdx ? "text-green-400" : "text-slate-500"
              )}>
                {s.label}
              </span>
              {i < steps.length - 1 && <div className={cn("flex-1 h-px mx-1", i < stepIdx ? "bg-green-500/40" : "bg-white/10")} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── STEP 1: AMOUNT ── */}
          {step === "amount" && (
            <motion.div key="amount" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="glass-card rounded-2xl p-6 space-y-5">
                <div>
                  <h2 className="font-display font-bold text-xl text-white mb-1">WITHDRAW <span className="gradient-text">FUNDS</span></h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Wallet className="w-4 h-4 text-yellow-400" />
                    <p className="text-slate-400 text-sm font-heading">
                      Available: <span className="text-yellow-400 font-bold font-display">₹{walletBalance.toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {PRESET_WITHDRAW.map((p) => (
                    <button
                      key={p}
                      onClick={() => { setSelectedPreset(p); setCustomAmount(""); }}
                      disabled={p > walletBalance}
                      className={cn(
                        "glass-btn py-3 rounded-xl font-display font-bold text-base",
                        selectedPreset === p ? "glass-btn-active-purple" : "",
                        p > walletBalance && "opacity-30 cursor-not-allowed"
                      )}
                    >
                      ₹{p}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="font-heading font-semibold text-xs tracking-widest text-slate-300 uppercase block mb-2">Custom Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-heading font-bold text-slate-400 text-lg">₹</span>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); setSelectedPreset(null); }}
                      placeholder={`Min ₹100 · Max ₹${walletBalance.toLocaleString()}`}
                      min={100} max={walletBalance}
                      className="gaming-input w-full pl-9 pr-4 py-3 rounded-xl text-sm"
                    />
                  </div>
                </div>

                {finalAmount > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 p-4 bg-black/30 rounded-xl border border-white/5">
                    {[
                      { label: "Withdrawal Amount", value: `₹${finalAmount.toLocaleString()}`, color: "text-white" },
                      { label: "Processing Fee", value: fee > 0 ? `-₹${fee}` : "FREE", color: fee > 0 ? "text-red-400" : "text-green-400" },
                      { label: "You'll Receive", value: `₹${netAmount.toLocaleString()}`, color: "text-yellow-400", bold: true },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between text-sm">
                        <span className="font-heading text-slate-400">{row.label}</span>
                        <span className={cn("font-heading font-bold", row.color, row.bold && "text-lg font-display")}>{row.value}</span>
                      </div>
                    ))}
                  </motion.div>
                )}

                {fee > 0 && finalAmount > 0 && (
                  <p className="text-xs text-slate-500 font-heading flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-cyan-400" /> Withdraw ₹500 or more to waive the ₹10 processing fee
                  </p>
                )}

                {finalAmount > walletBalance && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400 font-heading">Amount exceeds available balance</p>
                  </div>
                )}

                <button
                  onClick={() => isAmountValid && setStep("details")}
                  disabled={!isAmountValid}
                  className="btn-primary relative w-full py-3.5 rounded-xl font-heading font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    SELECT PAYMENT METHOD <ChevronRight className="w-4 h-4" />
                  </span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: DETAILS ── */}
          {step === "details" && (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="glass-card rounded-2xl p-6 space-y-5">
                <div>
                  <h2 className="font-display font-bold text-xl text-white mb-1">PAYOUT <span className="gradient-text">METHOD</span></h2>
                  <p className="text-slate-400 text-sm font-heading">Where should we send ₹{netAmount.toLocaleString()}?</p>
                </div>

                {/* Method toggle */}
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { key: "upi" as Method, label: "UPI Transfer", icon: <Smartphone className="w-5 h-5" />, sub: "Instant · Google Pay, PhonePe, Paytm" },
                    { key: "bank" as Method, label: "Bank Transfer", icon: <Building2 className="w-5 h-5" />, sub: "IMPS/NEFT · 2-4 hrs" },
                  ]).map(m => (
                    <button
                      key={m.key}
                      onClick={() => setMethod(m.key)}
                      className={cn(
                        "glass-btn flex flex-col items-start gap-1 p-4 rounded-xl text-left",
                        method === m.key ? "glass-btn-active-purple" : ""
                      )}
                    >
                      <div className={cn("mb-0.5", method === m.key ? "text-purple-400" : "text-slate-400")}>{m.icon}</div>
                      <p className={cn("font-heading font-bold text-sm", method === m.key ? "text-white" : "text-slate-400")}>{m.label}</p>
                      <p className="text-xs text-slate-500 font-heading leading-tight">{m.sub}</p>
                    </button>
                  ))}
                </div>

                {/* UPI fields */}
                {method === "upi" && (
                  <motion.div key="upi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div>
                      <label className="font-heading font-semibold text-xs tracking-widest text-slate-300 uppercase block mb-2">UPI ID <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value.toLowerCase().trim())}
                          placeholder="yourname@paytm / 9876543210@ybl"
                          className={cn("gaming-input w-full pl-10 pr-4 py-3 rounded-xl text-sm", upiId && !validateUPI(upiId) && "border-red-500/40")}
                        />
                      </div>
                      {upiId && !validateUPI(upiId) && (
                        <p className="text-xs text-red-400 font-heading mt-1">Invalid UPI ID format (e.g. name@paytm)</p>
                      )}
                    </div>
                    <div>
                      <label className="font-heading font-semibold text-xs tracking-widest text-slate-300 uppercase block mb-2">Account Holder Name <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        value={upiName}
                        onChange={(e) => setUpiName(e.target.value)}
                        placeholder="Full name as registered on UPI"
                        className="gaming-input w-full px-4 py-3 rounded-xl text-sm"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Bank fields */}
                {method === "bank" && (
                  <motion.div key="bank" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="font-heading font-semibold text-xs tracking-widest text-slate-300 uppercase block mb-2">Account Number <span className="text-red-400">*</span></label>
                        <input
                          type="password"
                          value={bankAccount}
                          onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, ""))}
                          placeholder="Enter account number"
                          className="gaming-input w-full px-4 py-3 rounded-xl text-sm font-mono"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="font-heading font-semibold text-xs tracking-widest text-slate-300 uppercase block mb-2">Confirm Account Number <span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          value={bankConfirm}
                          onChange={(e) => setBankConfirm(e.target.value.replace(/\D/g, ""))}
                          placeholder="Re-enter account number"
                          className={cn("gaming-input w-full px-4 py-3 rounded-xl text-sm font-mono",
                            bankConfirm && bankConfirm !== bankAccount && "border-red-500/40"
                          )}
                        />
                        {bankConfirm && bankConfirm !== bankAccount && (
                          <p className="text-xs text-red-400 font-heading mt-1">Account numbers do not match</p>
                        )}
                      </div>
                      <div>
                        <label className="font-heading font-semibold text-xs tracking-widest text-slate-300 uppercase block mb-2">IFSC Code <span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          value={bankIfsc}
                          onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                          placeholder="SBIN0001234"
                          maxLength={11}
                          className={cn("gaming-input w-full px-4 py-3 rounded-xl text-sm font-mono tracking-wider",
                            bankIfsc && !validateIFSC(bankIfsc) && "border-red-500/40"
                          )}
                        />
                        {bankIfsc && !validateIFSC(bankIfsc) && (
                          <p className="text-xs text-red-400 font-heading mt-1">Invalid IFSC format</p>
                        )}
                      </div>
                      <div>
                        <label className="font-heading font-semibold text-xs tracking-widest text-slate-300 uppercase block mb-2">Mobile No. <span className="text-red-400">*</span></label>
                        <input
                          type="tel"
                          value={bankMobile}
                          onChange={(e) => setBankMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          placeholder="9876543210"
                          className={cn("gaming-input w-full px-4 py-3 rounded-xl text-sm font-mono",
                            bankMobile && !/^[6-9]\d{9}$/.test(bankMobile) && "border-red-500/40"
                          )}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="font-heading font-semibold text-xs tracking-widest text-slate-300 uppercase block mb-2">Account Holder Name <span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="Full name as on bank account"
                          className="gaming-input w-full px-4 py-3 rounded-xl text-sm"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-3 pt-1">
                  <button onClick={() => setStep("amount")} className="btn-secondary px-4 py-3 rounded-xl font-heading font-bold text-sm flex-shrink-0">← Back</button>
                  <button
                    onClick={() => detailsValid && setStep("confirm")}
                    disabled={!detailsValid}
                    className="btn-primary relative flex-1 py-3 rounded-xl font-heading font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      REVIEW WITHDRAWAL <ChevronRight className="w-4 h-4" />
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: CONFIRM ── */}
          {step === "confirm" && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="glass-card rounded-2xl p-6 space-y-5">
                <div>
                  <h2 className="font-display font-bold text-xl text-white mb-1">CONFIRM <span className="gradient-text">WITHDRAWAL</span></h2>
                  <p className="text-slate-400 text-sm font-heading">Review the details before submitting</p>
                </div>

                {/* Summary */}
                <div className="space-y-2 p-4 bg-black/30 rounded-xl border border-white/5">
                  <p className="text-xs font-heading font-semibold text-slate-400 uppercase tracking-widest mb-3">Transfer Summary</p>
                  {[
                    { label: "Amount", value: `₹${finalAmount.toLocaleString()}` },
                    { label: "Processing Fee", value: fee > 0 ? `-₹${fee}` : "FREE", color: fee > 0 ? "text-red-400" : "text-green-400" },
                    { label: "You Receive", value: `₹${netAmount.toLocaleString()}`, bold: true, color: "text-yellow-400" },
                    { label: "Method", value: method === "upi" ? "UPI Transfer" : "Bank Transfer (IMPS)" },
                    ...(method === "upi"
                      ? [
                          { label: "UPI ID", value: upiId, mono: true, color: "text-purple-300" },
                          { label: "Name", value: upiName },
                        ]
                      : [
                          { label: "Account", value: `••••${bankAccount.slice(-4)}`, mono: true },
                          { label: "IFSC", value: bankIfsc, mono: true, color: "text-cyan-400" },
                          { label: "Name", value: bankName },
                          { label: "Mobile", value: bankMobile },
                        ]
                    ),
                    { label: "Processing Time", value: method === "upi" ? "Instant – 30 min" : "2–4 hours" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-sm py-0.5">
                      <span className="font-heading text-slate-400">{row.label}</span>
                      <span className={cn("font-heading font-bold text-right max-w-[60%] truncate",
                        row.color ?? "text-white",
                        row.mono && "font-mono",
                        row.bold && "text-base font-display"
                      )}>{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-2.5 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-300 font-heading leading-relaxed">
                    Double-check your {method === "upi" ? "UPI ID" : "account number"}. Wrong details may cause transfer failure and recovery takes 5–7 business days.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep("details")} className="btn-secondary px-4 py-3 rounded-xl font-heading font-bold text-sm flex-shrink-0">← Edit</button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn-gold flex-1 py-3 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {submitting
                      ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Processing...</>
                      : <><ArrowUpRight className="w-4 h-4" /> Confirm & Withdraw</>
                    }
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: SUCCESS ── */}
          {step === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="glass-card rounded-2xl p-8 text-center border border-purple/30">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="w-20 h-20 bg-purple/20 border-2 border-purple/40 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="w-10 h-10 text-purple-400" />
                </motion.div>

                <h2 className="font-display font-bold text-2xl text-white mb-2">REQUEST <span className="gradient-text">SUBMITTED!</span></h2>
                <p className="text-slate-400 font-heading text-sm mb-6 leading-relaxed">
                  ₹{netAmount.toLocaleString()} will be sent to{" "}
                  <strong className="text-white font-mono">{method === "upi" ? upiId : `••••${bankAccount.slice(-4)}`}</strong>
                  {" "}within {method === "upi" ? "30 minutes" : "2–4 hours"}.
                </p>

                <div className="bg-black/40 border border-purple/25 rounded-xl p-4 mb-6">
                  <p className="text-xs text-slate-500 font-heading mb-1">Reference Number</p>
                  <p className="font-display font-bold text-xl text-purple-400">{refId}</p>
                  <p className="text-xs text-slate-500 font-heading mt-1">Screenshot this for support queries</p>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { icon: <Clock className="w-4 h-4 text-yellow-400 mx-auto mb-1" />, label: "Processing", value: method === "upi" ? "~30 min" : "2–4 hrs" },
                    { icon: <Shield className="w-4 h-4 text-green-400 mx-auto mb-1" />, label: "Status", value: "Under Review" },
                    { icon: <BadgeIndianRupee className="w-4 h-4 text-cyan-400 mx-auto mb-1" />, label: "Amount", value: `₹${netAmount.toLocaleString()}` },
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
