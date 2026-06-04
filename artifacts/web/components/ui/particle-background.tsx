"use client";
import { memo } from "react";

/* 12 deterministic particles — pure CSS, zero JS runtime cost */
const PARTICLES = [
  { left: "5%",   size: 1.8, color: "rgba(124,58,237,",  dur: 14, delay: -3,  opacity: 0.35 },
  { left: "13%",  size: 1.3, color: "rgba(6,182,212,",   dur: 19, delay: -8,  opacity: 0.25 },
  { left: "22%",  size: 2.1, color: "rgba(168,85,247,",  dur: 12, delay: -1,  opacity: 0.3  },
  { left: "31%",  size: 1.5, color: "rgba(124,58,237,",  dur: 17, delay: -5,  opacity: 0.2  },
  { left: "42%",  size: 1.2, color: "rgba(6,182,212,",   dur: 22, delay: -11, opacity: 0.35 },
  { left: "53%",  size: 2.0, color: "rgba(168,85,247,",  dur: 13, delay: -4,  opacity: 0.25 },
  { left: "62%",  size: 1.6, color: "rgba(124,58,237,",  dur: 18, delay: -9,  opacity: 0.3  },
  { left: "71%",  size: 1.4, color: "rgba(6,182,212,",   dur: 16, delay: -2,  opacity: 0.2  },
  { left: "79%",  size: 1.9, color: "rgba(168,85,247,",  dur: 11, delay: -6,  opacity: 0.35 },
  { left: "87%",  size: 1.1, color: "rgba(124,58,237,",  dur: 20, delay: -13, opacity: 0.25 },
  { left: "93%",  size: 2.2, color: "rgba(6,182,212,",   dur: 15, delay: -7,  opacity: 0.3  },
  { left: "98%",  size: 1.7, color: "rgba(168,85,247,",  dur: 16, delay: -10, opacity: 0.2  },
] as const;

export const ParticleBackground = memo(function ParticleBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed", inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.left,
            bottom: 0,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: `${p.color}${p.opacity})`,
            boxShadow: `0 0 ${p.size * 2.5}px ${p.color}${p.opacity * 0.5})`,
            animation: `particle-rise ${p.dur}s ${p.delay}s linear infinite`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
});
