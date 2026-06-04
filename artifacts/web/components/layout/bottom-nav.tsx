"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      <div
        className="border-t border-purple/25 px-2 py-2"
        style={{
          background: "rgba(5,5,8,0.95)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          boxShadow: "0 -1px 0 rgba(124,58,237,0.15), 0 -8px 32px rgba(0,0,0,0.6)",
        }}
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className="outline-none">
                <motion.div
                  whileTap={{ scale: 0.82 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  className="relative flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl min-w-[60px] cursor-pointer select-none"
                >
                  {active && (
                    <motion.div
                      layoutId="bottom-nav-pill"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: "rgba(124,58,237,0.18)",
                        border: "1px solid rgba(124,58,237,0.38)",
                        boxShadow: "0 0 16px rgba(124,58,237,0.2)",
                      }}
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}

                  <motion.span
                    animate={active ? { scale: 1.12 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 24 }}
                    className="relative z-10"
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 transition-colors duration-200",
                        active ? "text-purple-400" : "text-slate-500"
                      )}
                      style={
                        active
                          ? { filter: "drop-shadow(0 0 8px rgba(124,58,237,0.9))" }
                          : undefined
                      }
                    />
                  </motion.span>

                  <motion.span
                    animate={active ? { opacity: 1 } : { opacity: 0.5 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "relative z-10 text-[10px] font-heading font-semibold tracking-wide",
                      active ? "text-purple-400" : "text-slate-500"
                    )}
                  >
                    {label}
                  </motion.span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
