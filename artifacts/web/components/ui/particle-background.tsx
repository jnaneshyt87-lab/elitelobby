"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  alpha: number;
  alphaDir: number;
  color: string;
}

interface Streak {
  x: number; y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  width: number;
  color: string;
}

const COLORS = [
  "rgba(124,58,237,",
  "rgba(6,182,212,",
  "rgba(168,85,247,",
  "rgba(34,211,238,",
];

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    let raf: number;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();

    // Particles
    const PARTICLE_COUNT = Math.min(55, Math.floor((W * H) / 22000));
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.5 - 0.15,
      radius: Math.random() * 1.8 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
      alphaDir: Math.random() > 0.5 ? 1 : -1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    // Light streaks
    const STREAK_COUNT = 6;
    const streaks: Streak[] = Array.from({ length: STREAK_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H * 0.7,
      length: Math.random() * 180 + 80,
      speed: Math.random() * 1.4 + 0.6,
      angle: Math.PI / 6 + (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.18 + 0.04,
      width: Math.random() * 1.5 + 0.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Draw light streaks
      for (const s of streaks) {
        const dx = Math.cos(s.angle) * s.length;
        const dy = Math.sin(s.angle) * s.length;
        const grad = ctx.createLinearGradient(s.x, s.y, s.x + dx, s.y + dy);
        grad.addColorStop(0, s.color + "0)");
        grad.addColorStop(0.4, s.color + s.alpha + ")");
        grad.addColorStop(1, s.color + "0)");
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + dx, s.y + dy);
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.width;
        ctx.stroke();

        // Move streak
        s.x += s.speed * Math.cos(s.angle);
        s.y += s.speed * Math.sin(s.angle);
        if (s.x > W + 200 || s.y > H + 200) {
          s.x = -200 + Math.random() * 200;
          s.y = Math.random() * H * 0.8;
        }
      }

      // Draw particles
      for (const p of particles) {
        // Pulsing alpha
        p.alpha += 0.004 * p.alphaDir;
        if (p.alpha > 0.65 || p.alpha < 0.05) p.alphaDir *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ")";
        ctx.fill();

        // Soft glow ring
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
        grd.addColorStop(0, p.color + (p.alpha * 0.4) + ")");
        grd.addColorStop(1, p.color + "0)");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener("resize", resize, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.85,
      }}
    />
  );
}
