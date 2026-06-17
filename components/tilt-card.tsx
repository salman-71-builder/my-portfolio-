"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";

/**
 * 3D card wrapper:
 * - flips in (rotateX) when it scrolls into view
 * - tilts toward the pointer on hover (desktop)
 * Falls back to a plain container when the user prefers reduced motion.
 */
export function TiltCard({
  children,
  className,
  strength = 10,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);

  const rx = useSpring(useMotionValue(0), { stiffness: 150, damping: 15 });
  const ry = useSpring(useMotionValue(0), { stiffness: 150, damping: 15 });

  function handleMove(e: React.PointerEvent) {
    if (reduce || e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * strength);
    rx.set(-py * strength);
  }

  function reset() {
    rx.set(0);
    ry.set(0);
  }

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, rotateX: -30, y: 36 }}
      whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: "spring", stiffness: 90, damping: 16 }}
      style={{ perspective: 900 }}
      className={className}
    >
      <motion.div
        ref={ref}
        onPointerMove={handleMove}
        onPointerLeave={reset}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="h-full [&>*]:h-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
