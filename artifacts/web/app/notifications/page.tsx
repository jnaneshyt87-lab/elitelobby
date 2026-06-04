"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications, AppNotification, NotificationType } from "@/lib/notifications-context";
import { Bell, CheckCheck, Trash2, Wallet, Trophy, Swords, Key, Megaphone, XCircle, ArrowUpRight, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from "date-fns";

const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; label: string; color: string; bg: string; border: string }> = {
  deposit_approved: { icon: <Wallet className="w-4 h-4" />, label: "Deposit", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/25" },
  deposit_rejected: { icon: <XCircle className="w-4 h-4" />, label: "Deposit", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/25" },
  tournament_starting: { icon: <Swords className="w-4 h-4" />, label: "Tournament", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/25" },
  room_id_released: { icon: <Key className="w-4 h-4" />, label: "Room ID", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/25" },
  prize_credited: { icon: <Trophy className="w-4 h-4" />, label: "Prize", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/25" },
  announcement: { icon: <Megaphone className="w-4 h-4" />, label: "Announcement", color: "text-purple-400", bg: "bg-purple/10", border: "border-purple/25" },
  withdrawal_processed: { icon: <ArrowUpRight className="w-4 h-4" />, label: "Withdrawal", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/25" },
};

type FilterTab = "all" | "unread" | "deposit_approved" | "tournament_starting" | "prize_credited" | "announcement";

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismiss, clearAll } = useNotifications();
  const [filter, setFilter] = useState<FilterTab>("all");

  const visible = notifications
    .filter((n) => !n.dismissed)
    .filter((n) => {
      if (filter === "all") return true;
      if (filter === "unread") return !n.read;
      return n.type === filter;
    });

  const filters: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: `Unread (${unreadCount})` },
    { key: "deposit_approved", label: "Payments" },
    { key: "tournament_starting", label: "Tournaments" },
    { key: "prize_credited", label: "Prizes" },
    { key: "announcement", label: "News" },
  ];

  return (
    <div className="pt-24 pb-16 px-4 overflow-x-hidden">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6">
          <div>
            <p className="font-heading text-sm text-purple-400 tracking-widest uppercase mb-1">Inbox</p>
            <h1 className="font-display font-bold text-3xl text-white">
              NOTIFI<span className="gradient-text">CATIONS</span>
            </h1>
          </div>
          <div className="flex gap-2 mt-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-purple/25 text-purple-400 hover:bg-purple/10 text-xs font-heading font-bold transition-all"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
            {notifications.some((n) => !n.dismissed) && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-heading font-bold transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear all
              </button>
            )}
          </div>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="flex gap-1 bg-black/30 rounded-xl p-1 mb-5 overflow-x-auto"
        >
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-heading font-bold whitespace-nowrap transition-all",
                filter === f.key ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
              )}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Notification list */}
        <div className="space-y-2">
          <AnimatePresence>
            {visible.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card rounded-2xl p-12 text-center"
              >
                <Bell className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 font-heading font-semibold">No {filter === "all" ? "" : filter.replace("_", " ")} notifications</p>
                <p className="text-slate-600 font-heading text-sm mt-1">You're all caught up!</p>
              </motion.div>
            ) : (
              visible.map((n, i) => {
                const cfg = TYPE_CONFIG[n.type];
                return (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40, height: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={cn(
                      "glass-card rounded-2xl overflow-hidden border transition-all",
                      !n.read ? "border-purple/20" : "border-white/5"
                    )}
                  >
                    <div
                      className="flex gap-4 p-4 cursor-pointer hover:bg-white/2 transition-colors"
                      onClick={() => markAsRead(n.id)}
                    >
                      {/* Icon */}
                      <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0", cfg.bg, cfg.border, cfg.color)}>
                        {cfg.icon}
                      </div>

                      {/* Body */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={cn("text-xs font-heading font-bold border rounded-full px-2 py-0.5", cfg.bg, cfg.border, cfg.color)}>
                                {cfg.label}
                              </span>
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
                              )}
                            </div>
                            <p className={cn("font-heading font-bold text-sm", n.read ? "text-slate-200" : "text-white")}>
                              {n.title}
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all flex-shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-sm text-slate-400 font-heading leading-relaxed mt-1">{n.message}</p>
                        <p className="text-xs text-slate-600 font-heading mt-2">
                          {formatDistanceToNow(parseISO(n.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {/* Unread indicator bar */}
                    {!n.read && (
                      <div className="h-0.5 bg-gradient-to-r from-purple-500/50 to-cyan-500/50" />
                    )}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
