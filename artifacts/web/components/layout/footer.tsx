import Link from "next/link";
import { Zap, Twitter, Youtube, Instagram, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 bg-surface border-t border-purple/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg gradient-text">
                ELITE<span className="text-cyan-400">LOBBY</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              India's premier esports tournament platform. Compete for real cash prizes.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {[Twitter, Youtube, Instagram, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg border border-purple/30 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple/60 hover:bg-purple/10 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Tournaments */}
          <div>
            <h4 className="font-heading font-bold text-white tracking-wide mb-4">TOURNAMENTS</h4>
            <ul className="space-y-2">
              {["Free Fire", "BGMI", "Valorant", "COD Mobile", "PUBG Mobile"].map((g) => (
                <li key={g}>
                  <Link href="/tournaments" className="text-slate-400 hover:text-purple-400 text-sm transition-colors">
                    {g} Tournaments
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-heading font-bold text-white tracking-wide mb-4">SUPPORT</h4>
            <ul className="space-y-2">
              {["FAQ", "Contact Us", "Report Player", "Discord", "Terms of Service", "Privacy Policy"].map((item) => (
                <li key={item}>
                  <Link href="/support" className="text-slate-400 hover:text-purple-400 text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discord */}
          <div>
            <h4 className="font-heading font-bold text-white tracking-wide mb-4">JOIN COMMUNITY</h4>
            <div className="glass-card rounded-xl p-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mb-3">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-slate-300 mb-3">
                Join 50,000+ players on our Discord server
              </p>
              <a
                href="https://discord.gg/aH2mEAj5"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full py-2 rounded-lg text-sm text-center block relative"
              >
                <span className="relative z-10">Join Discord</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-purple/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs">
            © 2025 EliteLobby. All rights reserved.
          </p>
          <p className="text-slate-500 text-xs">
            Play responsibly. Must be 18+ to participate in paid tournaments.
          </p>
        </div>
      </div>
    </footer>
  );
}
