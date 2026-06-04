"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, HelpCircle, ChevronDown, ChevronUp, Send, AlertTriangle, Shield, Zap, Mail, Users } from "lucide-react";
import { cn } from "@/lib/utils";

function DiscordWidget() {
  const [data, setData] = useState<{ guild: { name: string; icon: string | null }; approximate_member_count: number; approximate_presence_count: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://discord.com/api/v10/invites/aH2mEAj5?with_counts=true")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <a
      href="https://discord.gg/aH2mEAj5"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 glass-card rounded-xl px-5 py-4 mb-8 border border-indigo-500/25 hover:border-indigo-500/50 transition-all group"
    >
      {/* Discord icon */}
      <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600/30 transition-colors">
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-indigo-400">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-heading font-bold text-white text-sm">
          {loading ? "EliteLobby Discord" : (data?.guild?.name ?? "EliteLobby Discord")}
        </p>
        {loading ? (
          <p className="text-xs text-slate-500 font-heading">Loading live stats...</p>
        ) : data ? (
          <div className="flex items-center gap-3 mt-0.5">
            <span className="flex items-center gap-1 text-xs font-heading font-semibold text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              {data.approximate_presence_count.toLocaleString()} online
            </span>
            <span className="flex items-center gap-1 text-xs font-heading text-slate-400">
              <Users className="w-3 h-3" />
              {data.approximate_member_count.toLocaleString()} members
            </span>
          </div>
        ) : (
          <p className="text-xs text-indigo-400 font-heading">Join our community</p>
        )}
      </div>

      <span className="text-xs font-heading font-bold text-indigo-400 border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 rounded-lg flex-shrink-0 group-hover:bg-indigo-500/20 transition-colors">
        Join →
      </span>
    </a>
  );
}

const FAQS = [
  { q: "How do I join a tournament?", a: "Register an account, add funds to your wallet, and click 'Register Now' on any active tournament." },
  { q: "When will I receive the Room ID?", a: "Room ID is released 15 minutes before match start time. You'll receive a notification and can view it in the tournament detail page." },
  { q: "How are winnings credited?", a: "Winnings are credited to your wallet within 24 hours after results are declared by admin." },
  { q: "What payment methods are supported?", a: "We support all UPI apps (GPay, PhonePe, Paytm), and QR code payments. Deposits are instant." },
  { q: "Can I get a refund if a tournament is cancelled?", a: "Yes, full entry fee refund is credited to your wallet if a tournament is cancelled by admin." },
  { q: "How do I report a cheater?", a: "Use the 'Report Player' form below with their Game UID and a screenshot. Our team reviews within 24 hours." },
  { q: "What is the minimum withdrawal amount?", a: "Minimum withdrawal is ₹100. Withdrawals are processed within 2-4 hours via UPI." },
  { q: "How do I update my Game UID?", a: "Go to Dashboard > Settings > Game ID section to update your in-game player UID." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {FAQS.map((faq, i) => (
        <div key={i} className={cn("glass-card rounded-xl overflow-hidden transition-all", open === i && "border-purple/40")}>
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full px-5 py-4 text-left flex items-center justify-between gap-3">
            <span className="font-heading font-semibold text-white text-sm">{faq.q}</span>
            {open === i ? <ChevronUp className="w-4 h-4 text-purple-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
          </button>
          {open === i && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-5 pb-4"
            >
              <p className="text-sm text-slate-400 font-heading leading-relaxed">{faq.a}</p>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function SupportPage() {
  const [ticketForm, setTicketForm] = useState({ subject: "", message: "", category: "general" });
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<"faq" | "ticket" | "report">("faq");

  async function handleTicket(e: React.FormEvent) {
    e.preventDefault();
    await new Promise(r => setTimeout(r, 800));
    setSubmitted(true);
  }

  return (
    <div className="pt-24 pb-16 px-4 overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="font-heading text-sm text-purple-400 tracking-widest uppercase mb-1">We're here to help</p>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-3">
            SUPPORT <span className="gradient-text">CENTER</span>
          </h1>
          <p className="text-slate-400 font-heading text-sm">Average response time: under 2 hours</p>
        </motion.div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <MessageCircle className="w-6 h-6" />, label: "Discord Support", sub: "Fastest response", color: "text-indigo-400", onClick: () => window.open("https://discord.gg/aH2mEAj5", "_blank"), href: undefined },
            { icon: <Mail className="w-6 h-6" />, label: "Email Us", sub: "elitelobbycare@gmail.com", color: "text-cyan-400", onClick: () => window.open("mailto:elitelobbycare@gmail.com", "_blank"), href: undefined },
            { icon: <Shield className="w-6 h-6" />, label: "Submit Ticket", sub: "Within 2 hours", color: "text-purple-400", onClick: () => setActiveTab("ticket"), href: undefined },
            { icon: <AlertTriangle className="w-6 h-6" />, label: "Report Player", sub: "Anti-cheat team", color: "text-red-400", onClick: () => setActiveTab("report"), href: undefined },
          ].map((item, i) => (
            <button key={i} onClick={item.onClick} className="glass-card rounded-xl p-5 text-left hover:border-purple/40 transition-all group">
              <div className={cn("mb-3", item.color)}>{item.icon}</div>
              <p className="font-heading font-bold text-white text-sm group-hover:text-purple-300 transition-colors">{item.label}</p>
              <p className="text-xs text-slate-500 font-heading truncate">{item.sub}</p>
            </button>
          ))}
        </div>

        {/* Email contact banner */}
        <a
          href="mailto:elitelobbycare@gmail.com"
          className="flex items-center gap-4 glass-card rounded-xl px-5 py-4 mb-8 border border-cyan-500/20 hover:border-cyan-500/40 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500/20 transition-colors">
            <Mail className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="min-w-0">
            <p className="font-heading font-bold text-white text-sm">Player Care Email</p>
            <p className="text-cyan-400 font-heading text-sm font-semibold truncate">elitelobbycare@gmail.com</p>
          </div>
          <p className="ml-auto text-xs text-slate-500 font-heading hidden sm:block flex-shrink-0">Tap to email →</p>
        </a>

        {/* Discord live widget */}
        <DiscordWidget />

        {/* Tabs */}
        <div className="flex gap-1 bg-black/30 rounded-xl p-1 mb-6">
          {[
            { key: "faq", label: "FAQ" },
            { key: "ticket", label: "Submit Ticket" },
            { key: "report", label: "Report Player" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-xs font-heading font-bold tracking-wide transition-all",
                activeTab === tab.key ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {activeTab === "faq" && (
            <div>
              <h3 className="font-heading font-bold text-white mb-4">Frequently Asked Questions</h3>
              <FAQ />
            </div>
          )}

          {activeTab === "ticket" && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-heading font-bold text-white mb-5">Submit a Support Ticket</h3>
              {submitted ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-white mb-2">TICKET SUBMITTED!</h3>
                  <p className="text-slate-400 font-heading text-sm">We'll respond within 2 hours. Ticket #EL-{Math.floor(Math.random() * 9000) + 1000}</p>
                </div>
              ) : (
                <form onSubmit={handleTicket} className="space-y-4">
                  <div>
                    <label className="font-heading font-semibold text-xs tracking-widest text-slate-300 uppercase block mb-2">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {["general", "payment", "tournament", "account", "bug"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setTicketForm(f => ({ ...f, category: cat }))}
                          className={cn("px-3 py-1.5 rounded-lg text-xs font-heading font-semibold border transition-all capitalize",
                            ticketForm.category === cat ? "bg-purple/20 border-purple/50 text-purple-300" : "border-white/10 text-slate-400"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="font-heading font-semibold text-xs tracking-widest text-slate-300 uppercase block mb-2">Subject</label>
                    <input type="text" value={ticketForm.subject} onChange={e => setTicketForm(f => ({ ...f, subject: e.target.value }))} placeholder="Brief description of issue" className="gaming-input w-full px-4 py-3 rounded-xl text-sm" required />
                  </div>
                  <div>
                    <label className="font-heading font-semibold text-xs tracking-widest text-slate-300 uppercase block mb-2">Message</label>
                    <textarea value={ticketForm.message} onChange={e => setTicketForm(f => ({ ...f, message: e.target.value }))} placeholder="Describe your issue in detail..." rows={5} className="gaming-input w-full px-4 py-3 rounded-xl text-sm resize-none" required />
                  </div>
                  <button type="submit" className="btn-primary relative px-6 py-3 rounded-xl font-heading font-bold text-sm flex items-center gap-2">
                    <Send className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Submit Ticket</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === "report" && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-heading font-bold text-white mb-2">Report a Player</h3>
              <p className="text-sm text-slate-400 font-heading mb-5">Our anti-cheat team reviews all reports within 24 hours.</p>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="font-heading font-semibold text-xs tracking-widest text-slate-300 uppercase block mb-2">Reported Player UID</label>
                  <input type="text" placeholder="In-game UID (e.g. FF123456789)" className="gaming-input w-full px-4 py-3 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="font-heading font-semibold text-xs tracking-widest text-slate-300 uppercase block mb-2">Reason</label>
                  <div className="flex flex-wrap gap-2">
                    {["Cheating / Hacking", "Teaming in Solo", "Abusive Behavior", "Account Sharing", "Fraudulent Transaction"].map((r) => (
                      <button key={r} type="button" className="px-3 py-1.5 rounded-lg text-xs font-heading font-semibold border border-white/10 text-slate-400 hover:border-red-500/40 hover:text-red-400 transition-all">
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-heading font-semibold text-xs tracking-widest text-slate-300 uppercase block mb-2">Details</label>
                  <textarea placeholder="Describe what happened..." rows={4} className="gaming-input w-full px-4 py-3 rounded-xl text-sm resize-none" />
                </div>
                <button type="submit" className="btn-danger px-6 py-3 rounded-xl font-heading font-bold text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Submit Report
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
