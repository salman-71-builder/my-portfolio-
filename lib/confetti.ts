"use client";

/** Dependency-free confetti burst. Respects prefers-reduced-motion. */
export function fireConfetti(durationMs = 1800) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const colors = ["#CC0000", "#FFD700", "#1a2f5e", "#ffffff", "#c0392b"];
  const N = 150;
  const parts = Array.from({ length: N }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.4,
    r: 4 + Math.random() * 7,
    c: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - 0.5) * 5,
    vy: 3 + Math.random() * 5,
    rot: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.3,
  }));

  const start = performance.now();
  let raf = 0;
  const tick = (t: number) => {
    const el = t - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of parts) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.5);
      ctx.restore();
    }
    if (el < durationMs) {
      raf = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(raf);
      canvas.remove();
    }
  };
  raf = requestAnimationFrame(tick);
}
