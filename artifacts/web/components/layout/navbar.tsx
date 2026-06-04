"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Zap, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationBell } from "@/components/ui/notification-bell";
import { useUser, useClerk } from "@clerk/nextjs";

const PUBLIC_NAV_LINKS = [
  { href: "/tournaments", label: "Tournaments" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/support", label: "Support" },
];

const AUTH_NAV_LINKS = [
  { href: "/tournaments", label: "Tournaments" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/wallet", label: "Wallet" },
  { href: "/support", label: "Support" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();

  const { signOut } = useClerk();
  const NAV_LINKS = isSignedIn ? AUTH_NAV_LINKS : PUBLIC_NAV_LINKS;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setUserMenuOpen(false);
    if (userMenuOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [userMenuOpen]);

  const handleSignOut = () => {
    signOut({ redirectUrl: "/" });
    setUserMenuOpen(false);
    setMobileOpen(false);
  };

  const avatarLetter = user?.firstName?.[0] || user?.username?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || "P";
  const displayName = user?.firstName || user?.username || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "Player";

  return (
    <nav
      className={cn(
        "fixed top-8 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "glass border-b border-purple py-3"
          : "py-4 bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center glow-purple group-hover:scale-110 transition-transform">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg gradient-text tracking-wider">
            ELITE<span className="text-cyan-400">LOBBY</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-2 rounded-lg font-heading font-semibold text-sm tracking-wide transition-all duration-200",
                pathname === link.href
                  ? "bg-purple/20 text-purple-400 border border-purple"
                  : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth — Desktop */}
        <div className="hidden md:flex items-center gap-3">
          <NotificationBell />
          {!isLoaded ? (
            <div className="w-8 h-8 rounded-full bg-purple/20 animate-pulse" />
          ) : isSignedIn ? (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setUserMenuOpen(!userMenuOpen); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-purple/30 hover:border-purple/60 transition-all glass"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white font-display">
                  {avatarLetter.toUpperCase()}
                </div>
                <span className="text-sm font-heading font-semibold text-slate-200 max-w-[100px] truncate">
                  {displayName}
                </span>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl border border-purple/20 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm font-heading text-slate-300 hover:bg-purple/10 hover:text-white transition-colors"
                    >
                      <User className="w-4 h-4 text-purple-400" />
                      My Dashboard
                    </Link>
                    <div className="border-t border-purple/10" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 w-full px-4 py-3 text-sm font-heading text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="btn-secondary px-4 py-2 rounded-lg text-sm"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="btn-primary px-5 py-2 rounded-lg text-sm relative z-10"
              >
                <span className="relative z-10">Play Now</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white border border-purple/30 hover:border-purple/60 transition-all"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-purple/20 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-lg font-heading font-semibold tracking-wide transition-all",
                    pathname === link.href
                      ? "bg-purple/20 text-purple-400"
                      : "text-slate-300 hover:bg-white/5"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 flex flex-col gap-2">
                {isSignedIn ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 glass-card rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-sm font-bold text-white">
                        {avatarLetter.toUpperCase()}
                      </div>
                      <span className="font-heading font-semibold text-white text-sm">{displayName}</span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-red-500/30 text-red-400 font-heading font-semibold text-sm hover:bg-red-500/10 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="btn-secondary px-4 py-3 rounded-lg text-center text-sm" onClick={() => setMobileOpen(false)}>
                      Login
                    </Link>
                    <Link href="/auth/signup" className="btn-primary px-4 py-3 rounded-lg text-center text-sm relative" onClick={() => setMobileOpen(false)}>
                      <span className="relative z-10">Play Now</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
