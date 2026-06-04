"use client";
import { useEffect, useRef } from "react";

export function LiquidRevealBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    /* offscreen mask canvas — blobs are drawn here then composited */
    const maskCanvas = document.createElement("canvas");
    const mctx = maskCanvas.getContext("2d")!;

    const img = new Image();
    img.src = "/bg-eye.jpg";

    /* mouse / blob state */
    let mx = -1000, my = -1000;
    let bx = -1000, by = -1000;
    let entered = false;
    let t = 0;
    let raf: number;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!entered) {
        bx = mx;
        by = my;
        entered = true;
      }
    };

    const resize = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
      maskCanvas.width = W;
      maskCanvas.height = H;
    };

    resize();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", resize);

    /* draw the image cover-fitted onto a canvas context */
    const drawImageCover = (
      c: CanvasRenderingContext2D,
      image: HTMLImageElement,
      W: number,
      H: number
    ) => {
      const ia = image.naturalWidth / image.naturalHeight;
      const ca = W / H;
      let iw = W, ih = H, ix = 0, iy = 0;
      if (ca > ia) {
        ih = W / ia;
        iy = (H - ih) / 2;
      } else {
        iw = H * ia;
        ix = (W - iw) / 2;
      }
      c.drawImage(image, ix, iy, iw, ih);
    };

    const draw = () => {
      t += 0.012;
      const W = canvas.width;
      const H = canvas.height;

      /* ── liquid lerp: very slow catch-up for the initial center blob,
            then snappier once the user has moved the mouse ────────────── */
      const speed = entered ? 0.055 : 0.015;
      bx += (mx - bx) * speed;
      by += (my - by) * speed;

      ctx.clearRect(0, 0, W, H);

      if (!img.complete || img.naturalWidth === 0) {
        raf = requestAnimationFrame(draw);
        return;
      }

      /* ── draw the crisp image ──────────────────────────────────────── */
      drawImageCover(ctx, img, W, H);

      /* ── build liquid blob mask on the offscreen maskCanvas ───────── */
      mctx.clearRect(0, 0, W, H);

      const baseR = Math.min(W, H) * 0.26;          /* radius of the core blob */
      const NUM_SATS = 10;                            /* satellite blobs */

      /* ── central core: solid, large, soft-edged ────────────────────── */
      const cg = mctx.createRadialGradient(bx, by, 0, bx, by, baseR * 1.1);
      cg.addColorStop(0,    "rgba(0,0,0,1)");
      cg.addColorStop(0.45, "rgba(0,0,0,1)");
      cg.addColorStop(0.75, "rgba(0,0,0,0.75)");
      cg.addColorStop(1,    "rgba(0,0,0,0)");
      mctx.fillStyle = cg;
      mctx.fillRect(0, 0, W, H);

      /* ── satellite blobs that slowly orbit + pulsate ────────────────── */
      for (let i = 0; i < NUM_SATS; i++) {
        const baseAngle = (i / NUM_SATS) * Math.PI * 2;

        /* two-frequency wobble: one fast (morphs the edge) one slow (drifts) */
        const wobbleFast = Math.sin(t * 2.2 + i * 2.7) * 0.25;
        const wobbleSlow = Math.cos(t * 0.7 + i * 1.3) * 0.12;
        const wobbleR    = Math.sin(t * 1.6 + i * 3.1) * 0.1;

        const angle = baseAngle + t * 0.12 + wobbleFast * 0.18;
        const dist  = baseR * (0.5 + wobbleSlow * 0.3);
        const px    = bx + Math.cos(angle) * dist;
        const py    = by + Math.sin(angle) * dist;
        const sr    = baseR * (0.38 + wobbleR);

        const sg = mctx.createRadialGradient(px, py, 0, px, py, sr * 1.6);
        sg.addColorStop(0,   "rgba(0,0,0,0.9)");
        sg.addColorStop(0.4, "rgba(0,0,0,0.7)");
        sg.addColorStop(0.75,"rgba(0,0,0,0.3)");
        sg.addColorStop(1,   "rgba(0,0,0,0)");
        mctx.fillStyle = sg;
        mctx.fillRect(0, 0, W, H);
      }

      /* ── micro-tendrils: thin protrusions that make it feel alive ───── */
      const NUM_TENDRILS = 6;
      for (let i = 0; i < NUM_TENDRILS; i++) {
        const angle = (i / NUM_TENDRILS) * Math.PI * 2 + t * 0.25 + Math.sin(t + i) * 0.5;
        const dist  = baseR * (0.85 + Math.sin(t * 3 + i * 2.1) * 0.25);
        const px    = bx + Math.cos(angle) * dist;
        const py    = by + Math.sin(angle) * dist;
        const tr    = baseR * 0.18;

        const tg = mctx.createRadialGradient(px, py, 0, px, py, tr);
        tg.addColorStop(0,   "rgba(0,0,0,0.6)");
        tg.addColorStop(0.5, "rgba(0,0,0,0.2)");
        tg.addColorStop(1,   "rgba(0,0,0,0)");
        mctx.fillStyle = tg;
        mctx.fillRect(0, 0, W, H);
      }

      /* ── composite: keep image only inside the mask ──────────────────── */
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(maskCanvas, 0, 0);
      ctx.globalCompositeOperation = "source-over";

      raf = requestAnimationFrame(draw);
    };

    if (img.complete && img.naturalWidth > 0) {
      raf = requestAnimationFrame(draw);
    } else {
      img.onload = () => { raf = requestAnimationFrame(draw); };
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      {/* ── always-visible blurred base layer ───────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none select-none"
        style={{
          zIndex: -3,
          backgroundImage: "url(/bg-eye.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(48px) brightness(0.22) saturate(1.6)",
          transform: "scale(1.12)",    /* prevents blurred halo at edges */
          willChange: "transform",
        }}
      />

      {/* ── liquid reveal canvas: sharp image, masked to cursor blob ─────── */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none select-none"
        style={{ zIndex: -2 }}
        aria-hidden="true"
      />
    </>
  );
}
