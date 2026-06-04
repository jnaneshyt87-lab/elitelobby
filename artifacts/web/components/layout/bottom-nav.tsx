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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div
        className="glass border-t border-purple/30 px-2 py-2"
        style={{
          background:
            "linear-gradient(to top, rgba(5,5,8,0.98) 0%, rgba(5,5,8,0.92) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-200 group min-w-[60px]"
              >
                {active && (
                  <motion.div
                    layoutId="bottom-nav-pill"
                    className="absolute inset-0 rounded-xl bg-purple/20 border border-purple/40"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-all duration-200",
                      active
                        ? "text-purple-400 drop-shadow-[0_0_8px_rgba(124,58,237,0.8)]"
                        : "text-slate-500 group-hover:text-slate-300"
                    )}
                  />
                </span>
                <span
                  className={cn(
                    "relative z-10 text-[10px] font-heading font-semibold tracking-wide transition-all duration-200",
                    active ? "text-purple-400" : "text-slate-500 group-hover:text-slate-300"
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
