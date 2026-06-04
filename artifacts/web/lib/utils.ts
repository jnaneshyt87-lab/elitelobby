import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

export function formatTimeLeft(date: Date | string): string {
  const target = new Date(date);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "Started";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

export function getGameIcon(game: string): string {
  const icons: Record<string, string> = {
    "Free Fire": "🔥",
    "BGMI": "🎯",
    "Valorant": "⚡",
    "COD Mobile": "💥",
    "PUBG Mobile": "🎮",
  };
  return icons[game] ?? "🎮";
}

export function getRankColor(rank: string): string {
  const colors: Record<string, string> = {
    Bronze: "text-amber-700",
    Silver: "text-slate-400",
    Gold: "text-yellow-400",
    Platinum: "text-cyan-400",
    Diamond: "text-blue-400",
    Master: "text-purple-400",
    Grandmaster: "text-red-400",
  };
  return colors[rank] ?? "text-slate-400";
}
