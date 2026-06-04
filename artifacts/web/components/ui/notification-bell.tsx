"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, X, ExternalLink, Wallet, Trophy, Swords, Key, Megaphone, XCircle, ArrowUpRight } from "lucide-react";
import { useNotifications, AppNotification, NotificationType } from "@/lib/notifications-context";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from "date-fns";

const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  deposit_approved: {
    icon: <Wallet className="w-4 h-4" />,
    color: "text-green-400",
    bg: "bg-green-500/15",
    border: "border-green-500/30",
  },
  deposit_rejected: {
    icon: <XCircle className="w-4 h-4" />,
    color: "text-red-400",
    bg: "bg-red-500/15",
    border: "border-red-500/30",
  },
  tournament_starting: {
    icon: <Swords className="w-4 h-4" />,
    color: "text-yellow-400",
    bg: "bg-yellow-500/15",
    border: "border-yellow-500/30",
  },
  room_id_released: {
    icon: <Key className="w-4 h-4" />,
    color: "text-cyan-400",
    bg: "bg-cyan-500/15",
    border: "border-cyan-500/30",
  },
  prize_credited: {
    icon: <Trophy className="w-4 h-4" />,
    color: "text-yellow-400",
    bg: "bg-yellow-500/15",
    border: "border-yellow-500/25",
  },
  announcement: {
    icon: <Megaphone className="w-4 h-4" />,
    color: "text-purple-400",
    bg: "bg-purple/15",
    border: "border-purple/30",
  },
  withdrawal_processed: {
    icon: <ArrowUpRight className="w-4 h-4" />,
    color: "text-cyan-400",
    bg: "bg-cyan-500/15",
    border: "border-cyan-500/30",
  },
};

function NotifItem({ n, onRead, onDismiss }: { n: AppNotification; onRead: () => void; onDismiss: () => void }) {
  const cfg = TYPE_CONFIG[n.type];
  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors cursor-pointer group",
        !n.read && "bg-purple/3"
      )}
      onClick={onRead}
    >
      <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5", cfg.bg, cfg.border, cfg.color)}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("font-heading font-semibold text-sm leading-tight", n.read ? "text-slate-300" : "text-white")}>
            {n.title}
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); onDismiss(); }}
            className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-slate-300 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        <p className="text-xs text-slate-400 font-heading leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
        <p className="text-xs text-slate-600 font-heading mt-1">
          {formatDistanceToNow(parseISO(n.created_at), { addSuffix: true })}
        </p>
      </div>
      {!n.read && (
        <div className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0 mt-2" />
      )}
    </div>
  );
}

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismiss } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const visible = notifications.filter((n) => !n.dismissed).slice(0, 8);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        <motion.div
          animate={unreadCount > 0 ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 4 }}
        >
          <Bell className="w-4 h-4" />
        </motion.div>
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-heading font-bold rounded-full flex items-center justify-center px-1 leading-none"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 glass border border-purple/20 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-purple/15">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                <h3 className="font-heading font-bold text-white text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs font-heading font-bold text-purple-400 bg-purple/15 border border-purple/25 rounded-full px-1.5 py-0.5">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-purple-400 font-heading transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              {visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10">
                  <Bell className="w-8 h-8 text-slate-700" />
                  <p className="text-slate-500 font-heading text-sm">No notifications yet</p>
                </div>
              ) : (
                visible.map((n) => (
                  <NotifItem
                    key={n.id}
                    n={n}
                    onRead={() => { markAsRead(n.id); }}
                    onDismiss={() => dismiss(n.id)}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-purple/10">
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-heading font-semibold transition-colors"
              >
                View all notifications <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
