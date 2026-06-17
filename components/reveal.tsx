"use client";

import * as React from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Direction = "up" | "left" | "right" | "rotate";

/**
 * GSAP ScrollTrigger reveal. Animates children in 3D as they enter the
 * viewport. No-ops (renders children as-is) when reduced-motion is set.
 */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const from: gsap.TweenVars = { opacity: 0, willChange: "transform" };
    if (direction === "up") Object.assign(from, { y: 60 });
    if (direction === "left") Object.assign(from, { x: -80, rotateY: 12 });
    if (direction === "right") Object.assign(from, { x: 80, rotateY: -12 });
    if (direction === "rotate") Object.assign(from, { rotateX: -40, y: 50 });

    const ctx = gsap.context(() => {
      gsap.from(el, {
        ...from,
        duration: 1,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }, el);

    return () => ctx.revert();
  }, [direction, delay]);

  return (
    <div ref={ref} className={className} style={{ perspective: 1000 }}>
      {children}
    </div>
  );
}
