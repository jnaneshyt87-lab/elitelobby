"use client";
import { useEffect, useRef } from "react";

export function CursorSpotlight() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let lx = window.innerWidth / 2;
    let ly = window.innerHeight / 2;
    let tx = lx, ty = ly;
    let raf: number;

    const setOpacity = (v: number) => {
      if (ringRef.current) ringRef.current.style.opacity = String(v);
      if (dotRef.current) dotRef.current.style.opacity = String(v);
      if (glowRef.current) glowRef.current.style.opacity = String(v);
      const overlay = document.querySelector(".cursor-reveal-overlay") as HTMLElement;
      if (overlay) overlay.style.opacity = String(v);
    };

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;

      // Zero-lag: update CSS custom props on <html> for the reveal overlay
      document.documentElement.style.setProperty("--cx", `${tx}px`);
      document.documentElement.style.setProperty("--cy", `${ty}px`);

      // Cursor ring — direct, zero lag
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${tx - 22}px,${ty - 22}px,0)`;
      }
      // Cursor dot — direct, zero lag
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${tx - 3}px,${ty - 3}px,0)`;
      }

      if (!activeRef.current) {
        activeRef.current = true;
        setOpacity(1);
      }
    };

    const loop = () => {
      // Ambient glow trails slightly (soft lerp, GPU only)
      lx += (tx - lx) * 0.065;
      ly += (ty - ly) * 0.065;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${lx - 300}px,${ly - 300}px,0)`;
      }
      raf = requestAnimationFrame(loop);
    };

    const onLeave = () => { activeRef.current = false; setOpacity(0); };
    const onEnter = () => {
      if (tx > 0) { activeRef.current = true; setOpacity(1); }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Ambient trailing glow — soft lerp */}
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{
          position: "fixed", top: 0, left: 0,
          width: 600, height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.11) 0%, rgba(6,182,212,0.06) 40%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 3,
          willChange: "transform",
          opacity: 0,
          transition: "opacity 0.5s ease",
        }}
      />

      {/* Neon cursor ring — zero lag direct follow */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: "fixed", top: 0, left: 0,
          width: 44, height: 44,
          borderRadius: "50%",
          border: "1.5px solid rgba(168,85,247,0.75)",
          boxShadow:
            "0 0 12px rgba(124,58,237,0.55), 0 0 24px rgba(124,58,237,0.2), inset 0 0 8px rgba(6,182,212,0.15)",
          pointerEvents: "none",
          zIndex: 9999,
          willChange: "transform",
          opacity: 0,
          transition: "opacity 0.35s ease",
        }}
      />

      {/* Cursor dot — zero lag direct follow */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: "fixed", top: 0, left: 0,
          width: 6, height: 6,
          borderRadius: "50%",
          background: "rgba(168,85,247,0.95)",
          boxShadow: "0 0 8px rgba(168,85,247,0.9)",
          pointerEvents: "none",
          zIndex: 10000,
          willChange: "transform",
          opacity: 0,
          transition: "opacity 0.35s ease",
        }}
      />
    </>
  );
}
