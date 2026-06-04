"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MOCK_USER, MOCK_TRANSACTIONS } from "@/lib/mock-data";
import { useWallet } from "@/lib/wallet-context";
import { useUser } from "@clerk/nextjs";
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, TrendingUp, Clock, CheckCircle2, XCircle, Trophy, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

const TX_ICON: Record<string, React.ReactNode> = {
  deposit: <ArrowDownLeft className="w-4 h-4 text-green-400" />,
  withdrawal: <ArrowUpRight className="w-4 h-4 text-red-400" />,
  entry_fee: <Swords className="w-4 h-4 text-purple-400" />,
  winning: <Trophy className="w-4 h-4 text-yellow-400" />,
};

const TX_LABEL: Record<string, string> = {
  deposit: "Wallet Top-up",
  withdrawal: "Withdrawal",
  entry_fee: "Entry Fee",
  winning: "Prize Won",
};

export default function WalletPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const { balance, transactions: walletTxs } = useWallet();
  const allTxs = [...walletTxs, ...MOCK_TRANSACTIONS];

  const totalIn = allTxs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = Math.abs(allTxs.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));

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
    <div className="pt-24 pb-16 px-4 overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="font-heading text-sm text-yellow-400 tracking-widest uppercase mb-1">Financial Hub</p>
          <h1 className="font-display font-bold text-3xl text-white">
            MY <span className="gradient-text-gold">WALLET</span>
          </h1>
        </motion.div>

        {/* Balance card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rgb-border glass-card rounded-2xl p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <p className="text-slate-400 text-sm font-heading mb-1">Available Balance</p>
              <p className="font-display font-black text-5xl gradient-text-gold">
                ₹{balance.toLocaleString()}
              </p>
              <p className="text-slate-400 text-xs font-heading mt-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                Total winnings all time: ₹{MOCK_USER.total_winnings.toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/wallet/deposit"
                className="btn-gold px-6 py-3 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Funds
              </Link>
              <Link
                href="/wallet/withdraw"
                className="btn-secondary px-6 py-3 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2"
              >
                <ArrowUpRight className="w-4 h-4" /> Withdraw
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          {[
            { label: "Total Deposited", value: `₹${totalIn.toLocaleString()}`, icon: <ArrowDownLeft className="w-5 h-5" />, color: "text-green-400", border: "border-green-500/20" },
            { label: "Total Withdrawn", value: `₹${totalOut.toLocaleString()}`, icon: <ArrowUpRight className="w-5 h-5" />, color: "text-red-400", border: "border-red-500/20" },
            { label: "Prize Winnings", value: `₹${MOCK_USER.total_winnings.toLocaleString()}`, icon: <Trophy className="w-5 h-5" />, color: "text-yellow-400", border: "border-yellow-500/20" },
          ].map((s) => (
            <div key={s.label} className={cn("glass-card rounded-xl p-4 border", s.border)}>
              <div className={cn("mb-2", s.color)}>{s.icon}</div>
              <p className="text-slate-400 text-xs font-heading mb-1">{s.label}</p>
              <p className={cn("font-display font-bold text-lg", s.color)}>{s.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Transaction history */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-purple/15 flex items-center justify-between">
            <h3 className="font-heading font-bold text-white">Transaction History</h3>
            <span className="text-xs text-slate-400 font-heading">{allTxs.length} records</span>
          </div>
          <div className="divide-y divide-purple/5">
            {allTxs.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Wallet className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 font-heading text-sm">No transactions yet</p>
              </div>
            ) : (
              allTxs.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-white/2 transition-colors"
                >
                  <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0", tx.amount > 0 ? "border-green-500/20 bg-green-500/10" : "border-red-500/20 bg-red-500/10")}>
                    {TX_ICON[tx.type] ?? (tx.amount > 0 ? <ArrowDownLeft className="w-4 h-4 text-green-400" /> : <ArrowUpRight className="w-4 h-4 text-red-400" />)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-white text-sm">
                      {TX_LABEL[tx.type] ?? tx.type.replace("_", " ")}
                    </p>
                    <p className="text-xs text-slate-500 font-heading">
                      {format(parseISO(tx.created_at), "MMM d, yyyy · h:mm a")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn("font-display font-bold text-base", tx.amount > 0 ? "text-green-400" : "text-red-400")}>
                      {tx.amount > 0 ? "+" : ""}₹{Math.abs(tx.amount).toLocaleString()}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      {tx.status === "completed" ? (
                        <><CheckCircle2 className="w-3 h-3 text-green-400" /><span className="text-xs text-green-400 font-heading">Completed</span></>
                      ) : tx.status === "pending" ? (
                        <><Clock className="w-3 h-3 text-yellow-400" /><span className="text-xs text-yellow-400 font-heading">Pending</span></>
                      ) : (
                        <><XCircle className="w-3 h-3 text-red-400" /><span className="text-xs text-red-400 font-heading">Failed</span></>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
