"use client";
import { useEffect, useRef } from "react";

export function CursorSpotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const ringRef      = useRef<HTMLDivElement>(null);
  const dotRef       = useRef<HTMLDivElement>(null);
  const shown        = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let tx = 0, ty = 0;

    const show = () => {
      if (shown.current) return;
      shown.current = true;
      if (spotlightRef.current) spotlightRef.current.style.opacity = "1";
      if (ringRef.current)      ringRef.current.style.opacity      = "1";
      if (dotRef.current)       dotRef.current.style.opacity       = "1";

      /* update CSS vars for any external consumers */
      document.documentElement.style.setProperty("--cx", `${tx}px`);
      document.documentElement.style.setProperty("--cy", `${ty}px`);
    };

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;

      /* one CSS-var write — zero cost, no layout */
      document.documentElement.style.setProperty("--cx", `${tx}px`);
      document.documentElement.style.setProperty("--cy", `${ty}px`);

      /* GPU transform — instant, no layout recalc */
      if (spotlightRef.current)
        spotlightRef.current.style.transform = `translate3d(${tx - 250}px,${ty - 250}px,0)`;
      if (ringRef.current)
        ringRef.current.style.transform = `translate3d(${tx - 22}px,${ty - 22}px,0)`;
      if (dotRef.current)
        dotRef.current.style.transform = `translate3d(${tx - 3}px,${ty - 3}px,0)`;

      show();
    };

    const onLeave = () => {
      shown.current = false;
      if (spotlightRef.current) spotlightRef.current.style.opacity = "0";
      if (ringRef.current)      ringRef.current.style.opacity      = "0";
      if (dotRef.current)       dotRef.current.style.opacity       = "0";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      {/* Single lightweight spotlight — radial gradient, GPU transform, no backdrop-filter */}
      <div
        ref={spotlightRef}
        aria-hidden="true"
        style={{
          position: "fixed", top: 0, left: 0,
          width: 500, height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.11) 0%, rgba(6,182,212,0.05) 45%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 2,
          willChange: "transform",
          opacity: 0,
          transition: "opacity 0.4s ease",
          transform: "translate3d(-9999px,-9999px,0)",
        }}
      />

      {/* Neon cursor ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: "fixed", top: 0, left: 0,
          width: 44, height: 44,
          borderRadius: "50%",
          border: "1.5px solid rgba(168,85,247,0.7)",
          boxShadow: "0 0 10px rgba(124,58,237,0.45), inset 0 0 6px rgba(6,182,212,0.1)",
          pointerEvents: "none",
          zIndex: 9999,
          willChange: "transform",
          opacity: 0,
          transition: "opacity 0.3s ease",
          transform: "translate3d(-9999px,-9999px,0)",
        }}
      />

      {/* Cursor dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: "fixed", top: 0, left: 0,
          width: 6, height: 6,
          borderRadius: "50%",
          background: "rgba(168,85,247,0.9)",
          boxShadow: "0 0 6px rgba(168,85,247,0.8)",
          pointerEvents: "none",
          zIndex: 10000,
          willChange: "transform",
          opacity: 0,
          transition: "opacity 0.3s ease",
          transform: "translate3d(-9999px,-9999px,0)",
        }}
      />
    </>
  );
}
