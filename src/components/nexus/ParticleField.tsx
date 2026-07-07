"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  r: number;
  tw: number;
  hue: number;
}

export function ParticleField({ intensity = 80 }: { intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const count = Math.max(80, Math.min(260, Math.floor((w * h) / 9000) * (intensity / 80)));
    const stars: Star[] = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.8 + 0.2,
        r: Math.random() * 1.6 + 0.3,
        tw: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.7 ? 45 : Math.random() > 0.5 ? 270 : 210,
      });
    }

    let mx = w / 2;
    let my = h / 2;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    window.addEventListener("mousemove", onMove);

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    let t = 0;
    const draw = () => {
      t += 0.012;
      ctx.clearRect(0, 0, w, h);
      // subtle nebula pulse
      const grad = ctx.createRadialGradient(
        w / 2,
        h * 0.2,
        0,
        w / 2,
        h * 0.2,
        Math.max(w, h) * 0.7,
      );
      grad.addColorStop(0, "rgba(109,40,217,0.10)");
      grad.addColorStop(0.5, "rgba(80,30,160,0.04)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      for (const s of stars) {
        s.tw += 0.02 * s.z;
        const px = s.x + (mx - w / 2) * 0.01 * s.z;
        const py = s.y + (my - h / 2) * 0.01 * s.z;
        const a = 0.4 + Math.sin(s.tw) * 0.4;
        ctx.beginPath();
        ctx.arc(px, py, s.r * s.z, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 90%, 75%, ${a})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = `hsla(${s.hue}, 90%, 70%, ${a})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10"
      aria-hidden
    />
  );
}
