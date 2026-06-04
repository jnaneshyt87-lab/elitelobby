"use client";
import { useEffect, useRef } from "react";

export function LiquidRevealBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true })!;

    /* two tiny offscreen canvases — both created once */
    const imgCache = document.createElement("canvas");   // sharp image, resized once
    const maskBuf  = document.createElement("canvas");   // organic blob mask
    const imgCtx   = imgCache.getContext("2d")!;
    const mCtx     = maskBuf.getContext("2d")!;

    const img = new Image();
    img.src = "/bg-eye.jpg";

    let W = 0, H = 0;
    let mx = window.innerWidth  / 2;
    let my = window.innerHeight / 2;
    let bx = mx, by = my;            // lerped position
    let t  = 0;
    let raf: number;
    let ready = false;

    /* ─── cache image to offscreen at current viewport size ─── */
    const cacheImg = () => {
      if (!img.complete || img.naturalWidth === 0 || W === 0) return;
      imgCache.width  = W;
      imgCache.height = H;
      const ia = img.naturalWidth / img.naturalHeight;
      const ca = W / H;
      let iw = W, ih = H, ix = 0, iy = 0;
      if (ca > ia) { ih = W / ia; iy = (H - ih) / 2; }
      else          { iw = H * ia; ix = (W - iw) / 2; }
      imgCtx.drawImage(img, ix, iy, iw, ih);
      ready = true;
    };

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width    = W;
      canvas.height   = H;
      maskBuf.width   = W;
      maskBuf.height  = H;
      ready = false;
      cacheImg();
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener("mousemove", onMove, { passive: true });

    /* ─── Catmull-Rom smooth blob: N control points, radius wobble ─── */
    const drawBlob = (c: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
      const N  = 8;
      const ax = 0.5;
      const pts: [number, number][] = [];

      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const w =
          1 +
          Math.sin(t * 1.6 + i * 2.1) * 0.18 +
          Math.cos(t * 0.9 + i * 1.4) * 0.12 +
          Math.sin(t * 2.4 + i * 3.0) * 0.06;
        pts.push([cx + Math.cos(a) * r * w, cy + Math.sin(a) * r * w]);
      }

      c.beginPath();
      for (let i = 0; i < N; i++) {
        const p0 = pts[(i - 1 + N) % N];
        const p1 = pts[i];
        const p2 = pts[(i + 1) % N];
        const p3 = pts[(i + 2) % N];
        if (i === 0) c.moveTo(p1[0], p1[1]);
        const cp1x = p1[0] + (p2[0] - p0[0]) * ax / 3;
        const cp1y = p1[1] + (p2[1] - p0[1]) * ax / 3;
        const cp2x = p2[0] - (p3[0] - p1[0]) * ax / 3;
        const cp2y = p2[1] - (p3[1] - p1[1]) * ax / 3;
        c.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2[0], p2[1]);
      }
      c.closePath();
    };

    /* ─── main render loop ─── */
    const draw = () => {
      t += 0.012;

      /* smooth lerp — feels liquid, not snappy */
      bx += (mx - bx) * 0.07;
      by += (my - by) * 0.07;

      ctx.clearRect(0, 0, W, H);

      if (!ready) { cacheImg(); raf = requestAnimationFrame(draw); return; }

      /* 1. draw cached sharp image */
      ctx.drawImage(imgCache, 0, 0);

      /* 2. build blob mask on separate buffer */
      mCtx.clearRect(0, 0, W, H);
      const radius = Math.min(W, H) * 0.27;

      /* single path + blur — replaces all 16 gradient fills */
      mCtx.filter = "blur(38px)";
      drawBlob(mCtx, bx, by, radius);
      mCtx.fillStyle = "#000";
      mCtx.fill();
      mCtx.filter = "none";

      /* 3. use mask to cut out everything outside the blob */
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(maskBuf, 0, 0);
      ctx.globalCompositeOperation = "source-over";

      raf = requestAnimationFrame(draw);
    };

    if (img.complete && img.naturalWidth > 0) {
      cacheImg();
      raf = requestAnimationFrame(draw);
    } else {
      img.onload = () => { cacheImg(); raf = requestAnimationFrame(draw); };
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <>
      {/* blurred dark base — always visible */}
      <div
        className="fixed inset-0 pointer-events-none select-none"
        style={{
          zIndex: -3,
          backgroundImage: "url(/bg-eye.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(50px) brightness(0.18) saturate(1.6)",
          transform: "scale(1.12)",
          willChange: "transform",
        }}
      />

      {/* liquid reveal canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none select-none"
        style={{ zIndex: -2, willChange: "contents" }}
        aria-hidden="true"
      />
    </>
  );
}
