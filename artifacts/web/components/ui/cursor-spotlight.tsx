"use client";
import { useEffect, useRef, useState } from "react";

export function CursorSpotlight() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Hide on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let raf: number;
    let lx = window.innerWidth / 2;
    let ly = window.innerHeight / 2;
    let tx = lx, ty = ly;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      setActive(true);

      // Inner dot — instant follow (GPU transform)
      if (innerRef.current) {
        innerRef.current.style.transform = `translate3d(${tx - 24}px,${ty - 24}px,0)`;
      }
    };

    const onLeave = () => setActive(false);
    const onEnter = () => setActive(true);

    const loop = () => {
      // Outer glow — lerp follow (lazy trailing)
      lx += (tx - lx) * 0.07;
      ly += (ty - ly) * 0.07;
      if (outerRef.current) {
        outerRef.current.style.transform = `translate3d(${lx - 350}px,${ly - 350}px,0)`;
      }
      raf = requestAnimationFrame(loop);
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
      {/* Large diffuse trailing glow */}
      <div
        ref={outerRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.07) 0%, rgba(6,182,212,0.04) 35%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 2,
          willChange: "transform",
          opacity: active ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      />

      {/* Small sharp cursor halo — direct follow */}
      <div
        ref={innerRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 48,
          height: 48,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 2,
          willChange: "transform",
          opacity: active ? 1 : 0,
          transition: "opacity 0.3s ease",
          mixBlendMode: "screen",
        }}
      />
    </>
  );
}
