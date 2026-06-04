"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Don't show on subsequent navigations — only first mount
    const shown = sessionStorage.getItem("elitelobby-loaded");
    if (shown) { setVisible(false); return; }

    const start = Date.now();
    const duration = 1800;

    const tick = () => {
      const pct = Math.min((Date.now() - start) / duration, 1);
      // Ease-out progress
      setProgress(Math.round(pct * pct * (3 - 2 * pct) * 100));
      if (pct < 1) requestAnimationFrame(tick);
      else {
        setTimeout(() => {
          setVisible(false);
          sessionStorage.setItem("elitelobby-loaded", "1");
        }, 200);
      }
    };
    requestAnimationFrame(tick);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "#050508",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2rem",
          }}
        >
          {/* Grid lines */}
          <div
            style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage:
                "linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px)," +
                "linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* Radial glow */}
          <div
            style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background:
                "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,58,237,0.18) 0%, transparent 70%)",
            }}
          />

          {/* Logo */}
          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 72, height: 72,
                borderRadius: 16,
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                boxShadow: "0 0 40px rgba(124,58,237,0.6), 0 0 80px rgba(124,58,237,0.3)",
                marginBottom: 20,
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" />
              </svg>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{
                fontFamily: '"Orbitron", monospace',
                fontWeight: 900,
                fontSize: "2.5rem",
                letterSpacing: "0.12em",
                margin: 0,
              }}
            >
              <span style={{
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>ELITE</span>
              <span style={{ color: "#67e8f9" }}>LOBBY</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.4 }}
              style={{
                fontFamily: '"Rajdhani", sans-serif',
                color: "rgba(148,163,184,0.7)",
                letterSpacing: "0.3em",
                fontSize: "0.75rem",
                marginTop: 8,
                textTransform: "uppercase",
              }}
            >
              Compete · Win · Dominate
            </motion.p>
          </div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            style={{
              position: "relative", zIndex: 1,
              width: "min(320px, 80vw)",
            }}
          >
            <div style={{
              height: 2,
              background: "rgba(124,58,237,0.15)",
              borderRadius: 2,
              overflow: "hidden",
              marginBottom: 10,
            }}>
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #7c3aed, #06b6d4, #a855f7)",
                  borderRadius: 2,
                  boxShadow: "0 0 8px rgba(124,58,237,0.7)",
                }}
              />
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: '"Rajdhani", sans-serif',
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              color: "rgba(148,163,184,0.5)",
            }}>
              <span>INITIALIZING</span>
              <span style={{ color: "rgba(124,58,237,0.8)" }}>{progress}%</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
