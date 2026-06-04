"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, Trophy, Swords, Key, Megaphone, XCircle, ArrowUpRight } from "lucide-react";
import { useNotifications, AppNotification, NotificationType } from "@/lib/notifications-context";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; accent: string; glow: string }> = {
  deposit_approved: {
    icon: <Wallet className="w-5 h-5" />,
    accent: "text-green-400 border-green-500/40",
    glow: "shadow-green-500/20",
  },
  deposit_rejected: {
    icon: <XCircle className="w-5 h-5" />,
    accent: "text-red-400 border-red-500/40",
    glow: "shadow-red-500/20",
  },
  tournament_starting: {
    icon: <Swords className="w-5 h-5" />,
    accent: "text-yellow-400 border-yellow-500/40",
    glow: "shadow-yellow-500/20",
  },
  room_id_released: {
    icon: <Key className="w-5 h-5" />,
    accent: "text-cyan-400 border-cyan-500/40",
    glow: "shadow-cyan-500/20",
  },
  prize_credited: {
    icon: <Trophy className="w-5 h-5" />,
    accent: "text-yellow-400 border-yellow-500/40",
    glow: "shadow-yellow-500/20",
  },
  announcement: {
    icon: <Megaphone className="w-5 h-5" />,
    accent: "text-purple-400 border-purple/40",
    glow: "shadow-purple-500/20",
  },
  withdrawal_processed: {
    icon: <ArrowUpRight className="w-5 h-5" />,
    accent: "text-cyan-400 border-cyan-500/40",
    glow: "shadow-cyan-500/20",
  },
};

interface ToastItem {
  notification: AppNotification;
  expiresAt: number;
}

export function NotificationToastContainer() {
  const { notifications, markAsRead, dismiss } = useNotifications();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seenRef = useRef<Set<string>>(new Set());

  // Watch for new (unread, not-dismissed) notifications that we haven't toasted yet
  useEffect(() => {
    const fresh = notifications.filter(
      (n) => !n.read && !n.dismissed && !seenRef.current.has(n.id)
    );
    if (fresh.length === 0) return;

    fresh.forEach((n) => seenRef.current.add(n.id));

    setToasts((prev) => [
      ...prev,
      ...fresh.map((n) => ({ notification: n, expiresAt: Date.now() + 5000 })),
    ]);
  }, [notifications]);

  // Auto-dismiss expired toasts
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setInterval(() => {
      setToasts((prev) => prev.filter((t) => Date.now() < t.expiresAt));
    }, 500);
    return () => clearInterval(timer);
  }, [toasts]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.notification.id !== id));
  }, []);

  // Show at most 3 toasts stacked
  const visible = toasts.slice(-3);

  return (
    <div className="fixed bottom-[88px] sm:bottom-6 left-3 right-3 sm:left-auto sm:right-4 z-[200] flex flex-col gap-2 sm:gap-2.5 items-stretch sm:items-end pointer-events-none">
      <AnimatePresence>
        {visible.map((toast) => {
          const cfg = TYPE_CONFIG[toast.notification.type];
          const n = toast.notification;
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className={cn(
                "pointer-events-auto w-full sm:w-80 glass border rounded-2xl shadow-xl overflow-hidden",
                cfg.accent,
                cfg.glow
              )}
            >
              {/* Progress bar */}
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 5, ease: "linear" }}
                style={{ transformOrigin: "left" }}
                className="h-0.5 w-full bg-current opacity-60"
              />

              <div className="flex gap-3 p-4">
                {/* Icon */}
                <div className={cn("flex-shrink-0 mt-0.5", cfg.accent.split(" ")[0])}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-bold text-white text-sm leading-tight">{n.title}</p>
                  <p className="text-xs text-slate-300 font-heading mt-1 leading-relaxed line-clamp-2">{n.message}</p>
                </div>

                {/* Close */}
                <button
                  onClick={() => {
                    markAsRead(n.id);
                    removeToast(n.id);
                  }}
                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
