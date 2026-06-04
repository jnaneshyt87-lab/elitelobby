"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  color?: "purple" | "cyan" | "gold" | "red";
  icon?: React.ReactNode;
}

function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = Date.now();
          const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

export function StatCard({ value, suffix = "", prefix = "", label, color = "purple", icon }: StatCardProps) {
  const { count, ref } = useCountUp(value);
  const colors = {
    purple: "text-purple-400",
    cyan: "text-cyan-400",
    gold: "text-yellow-400",
    red: "text-red-400",
  };

  return (
    <div ref={ref} className="glass-card rounded-xl p-5 text-center">
      {icon && (
        <div className="flex justify-center mb-3 text-2xl">{icon}</div>
      )}
      <div className={`font-display font-bold text-2xl md:text-3xl mb-1 leading-tight break-all ${colors[color]}`}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="font-heading text-slate-400 text-sm tracking-wide uppercase">{label}</div>
    </div>
  );
}
