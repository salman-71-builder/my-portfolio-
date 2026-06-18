"use client";

import * as React from "react";

/**
 * Custom gold-dot cursor with a trailing glow ring. Desktop + fine-pointer only;
 * disabled for touch devices and reduced-motion users (native cursor stays).
 */
export function CursorGlow() {
  const dotRef = React.useRef<HTMLDivElement>(null);
  const ringRef = React.useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduced) return;
    setEnabled(true);

    let raf = 0;
    const target = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${target.x}px, ${target.y}px)`;
      }
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const interactive = !!t?.closest(
        "a, button, input, textarea, select, [role='button']"
      );
      ringRef.current?.classList.toggle("cursor-ring--active", interactive);
    };

    // ring eases toward the pointer for a trailing feel
    const tick = () => {
      ring.x += (target.x - ring.x) * 0.18;
      ring.y += (target.y - ring.y) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.x}px, ${ring.y}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden />
      <div ref={ringRef} className="cursor-ring" aria-hidden />
    </>
  );
}
